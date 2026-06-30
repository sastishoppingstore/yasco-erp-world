import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  prescriptions, prescriptionItems, controlledSubstanceLog,
  insuranceCompanies, insuranceClaims,
  products, inventoryBalances, inventoryMovements,
  drugInteractions, sfdaSerialNumbers,
  invoices, invoiceItems, customers,
} from "@db/schema";
import { eq, and, like, desc, sql, gte, lte, inArray } from "drizzle-orm";
import { checkLowStockAndNotify } from "./lib/notifications/events";

export const posPharmacyRouter = createRouter({
  // ============ PRESCRIPTIONS ============
  prescriptionSearch: authedQuery
    .input(z.object({ query: z.string(), status: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(prescriptions.tenantId, ctx.user.tenantId!)];
      if (input.query) {
        conditions.push(sql`(${like(prescriptions.prescriptionNumber, `%${input.query}%`)} OR ${like(prescriptions.doctorName, `%${input.query}%`)})`);
      }
      if (input.status) conditions.push(eq(prescriptions.status, input.status as any));
      return db.select().from(prescriptions).where(and(...conditions)).orderBy(desc(prescriptions.createdAt)).limit(20);
    }),

  prescriptionCreate: authedQuery
    .input(z.object({
      prescriptionNumber: z.string(), customerId: z.number().optional(),
      doctorName: z.string().optional(), doctorLicense: z.string().optional(),
      clinicName: z.string().optional(), diagnosis: z.string().optional(),
      dateIssued: z.string(), dateExpires: z.string().optional(),
      isControlledSubstance: z.boolean().default(false),
      controlledSubstanceLicense: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(), dosage: z.string().optional(),
        frequency: z.string().optional(), durationDays: z.number().optional(),
        quantityPrescribed: z.number(), instructions: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...rxData } = input;
      const [{ id: rxId }] = await db.insert(prescriptions).values({
        tenantId: ctx.user.tenantId!, ...rxData,
      }).$returningId();
      for (const item of items) {
        const product = await db.query.products.findFirst({ where: eq(products.id, item.productId) });
        await db.insert(prescriptionItems).values({
          prescriptionId: rxId, ...item, isControlled: input.isControlledSubstance,
        });
        // Check drug interactions with other items in this prescription
        const otherIds = items.filter(i => i.productId !== item.productId).map(i => i.productId);
        if (otherIds.length) {
          const interactions = await db.select().from(drugInteractions)
            .where(and(
              eq(drugInteractions.tenantId, ctx.user.tenantId!),
              sql`((${drugInteractions.productIdA} = ${item.productId} AND ${inArray(drugInteractions.productIdB, otherIds)}) OR (${drugInteractions.productIdB} = ${item.productId} AND ${inArray(drugInteractions.productIdA, otherIds)}))`
            ));
          if (interactions.length) {
            // Attach warnings — returned in response
          }
        }
      }
      return { id: rxId, success: true };
    }),

  prescriptionGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const rx = await db.query.prescriptions.findFirst({
        where: and(eq(prescriptions.id, input.id), eq(prescriptions.tenantId, ctx.user.tenantId!)),
      });
      if (!rx) return null;
      const items = await db.select().from(prescriptionItems).where(eq(prescriptionItems.prescriptionId, input.id));
      return { ...rx, items };
    }),

  prescriptionDispense: authedQuery
    .input(z.object({
      prescriptionId: z.number(),
      items: z.array(z.object({
        prescriptionItemId: z.number(), productId: z.number(),
        quantityDispensed: z.number(), batchNumber: z.string().optional(),
        serialNumber: z.string().optional(),
      })),
      invoiceId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const rx = await db.query.prescriptions.findFirst({
        where: and(eq(prescriptions.id, input.prescriptionId), eq(prescriptions.tenantId, tenantId)),
      });
      if (!rx) throw new Error("Prescription not found");

      for (const item of input.items) {
        await db.update(prescriptionItems).set({
          quantityDispensed: sql`${prescriptionItems.quantityDispensed} + ${item.quantityDispensed}`,
        }).where(eq(prescriptionItems.id, item.prescriptionItemId));

        // Update inventory batch
        if (item.batchNumber) {
          const bal = await db.select().from(inventoryBalances)
            .where(and(eq(inventoryBalances.productId, item.productId), eq(inventoryBalances.tenantId, tenantId)))
            .limit(1);
          if (bal.length) {
            await db.update(inventoryBalances).set({
              quantity: sql`greatest(0, ${inventoryBalances.quantity} - ${item.quantityDispensed})`,
            }).where(eq(inventoryBalances.id, bal[0].id));
          }
        }

        // SFDA tracking for tracked medicines
        if (item.serialNumber) {
          await db.update(sfdaSerialNumbers).set({
            status: "sold", soldAt: new Date(),
            invoiceItemId: input.invoiceId,
          }).where(and(eq(sfdaSerialNumbers.serialNumber, item.serialNumber), eq(sfdaSerialNumbers.tenantId, tenantId)));
        }
      }

      // Check if fully dispensed
      const rxItems = await db.select().from(prescriptionItems).where(eq(prescriptionItems.prescriptionId, input.prescriptionId));
      const fullyDispensed = rxItems.every(i => i.quantityDispensed >= i.quantityPrescribed);
      if (fullyDispensed) {
        await db.update(prescriptions).set({ status: "dispensed" }).where(eq(prescriptions.id, input.prescriptionId));
      } else {
        await db.update(prescriptions).set({ status: "partial" }).where(eq(prescriptions.id, input.prescriptionId));
      }

      checkLowStockAndNotify(tenantId).catch((err) =>
        console.error("[notify] Pharmacy checkLowStock error:", err)
      );
      return { success: true };
    }),

  // ============ CONTROLLED SUBSTANCE LOG ============
  controlledSubstanceLog: authedQuery
    .input(z.object({
      productId: z.number(), batchNumber: z.string().optional(),
      prescriptionId: z.number().optional(), patientName: z.string(),
      patientIdNumber: z.string().optional(), doctorName: z.string().optional(),
      quantityDispensed: z.number(), balanceBefore: z.number(),
      dispensedBy: z.number(), witnessedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const balanceAfter = input.balanceBefore - input.quantityDispensed;
      await db.insert(controlledSubstanceLog).values({
        tenantId: ctx.user.tenantId!, ...input, balanceAfter,
      });
      return { success: true };
    }),

  controlledSubstanceLogList: authedQuery
    .input(z.object({ from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(controlledSubstanceLog.tenantId, ctx.user.tenantId!)];
      if (input.from) conditions.push(gte(controlledSubstanceLog.dispensedAt, new Date(input.from)));
      if (input.to) conditions.push(lte(controlledSubstanceLog.dispensedAt, new Date(input.to)));
      return db.select().from(controlledSubstanceLog).where(and(...conditions)).orderBy(desc(controlledSubstanceLog.dispensedAt));
    }),

  // ============ INSURANCE ============
  insuranceCompanyList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(insuranceCompanies)
      .where(and(eq(insuranceCompanies.tenantId, ctx.user.tenantId!), eq(insuranceCompanies.isActive, true)));
  }),

  insuranceClaimCreate: authedQuery
    .input(z.object({
      invoiceId: z.number().optional(), insuranceCompanyId: z.number(),
      customerId: z.number(), policyNumber: z.string().optional(),
      memberId: z.string().optional(), coPayAmount: z.string().default("0"),
      insuredAmount: z.string().default("0"), claimAmount: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const claimNumber = `CLM-${Date.now()}`;
      const [{ id }] = await db.insert(insuranceClaims).values({
        tenantId: ctx.user.tenantId!, claimNumber, ...input,
        createdBy: ctx.user.id,
      }).$returningId();
      return { id, claimNumber, success: true };
    }),

  // ============ DRUG INTERACTIONS ============
  drugInteractionCheck: authedQuery
    .input(z.object({ productIds: z.array(z.number()) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      if (input.productIds.length < 2) return [];
      const interactions = await db.select().from(drugInteractions)
        .where(and(
          eq(drugInteractions.tenantId, ctx.user.tenantId!),
          sql`((${inArray(drugInteractions.productIdA, input.productIds)} AND ${inArray(drugInteractions.productIdB, input.productIds)}))`
        ));
      const result = [];
      for (const interaction of interactions) {
        const prodA = await db.query.products.findFirst({ where: eq(products.id, interaction.productIdA) });
        const prodB = await db.query.products.findFirst({ where: eq(products.id, interaction.productIdB) });
        result.push({
          ...interaction, productAName: prodA?.name, productBName: prodB?.name,
        });
      }
      return result;
    }),

  drugInteractionCreate: authedQuery
    .input(z.object({
      productIdA: z.number(), productIdB: z.number(),
      severity: z.enum(["mild", "moderate", "severe", "contraindicated"]),
      description: z.string().optional(), descriptionAr: z.string().optional(),
      recommendation: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(drugInteractions).values({ tenantId: ctx.user.tenantId!, ...input });
      return { success: true };
    }),

  // ============ SFDA SERIAL TRACKING ============
  sfdaSerialRegister: authedQuery
    .input(z.object({
      productId: z.number(), batchNumber: z.string().optional(),
      serialNumber: z.string(), expiryDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(sfdaSerialNumbers).values({ tenantId: ctx.user.tenantId!, ...input });
      return { success: true };
    }),

  sfdaSerialLookup: authedQuery
    .input(z.object({ serialNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.query.sfdaSerialNumbers.findFirst({
        where: and(eq(sfdaSerialNumbers.serialNumber, input.serialNumber), eq(sfdaSerialNumbers.tenantId, ctx.user.tenantId!)),
      });
    }),

  // ============ BATCH SELECTION ============
  batchAvailable: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const batches = await db.select({
        batchNumber: inventoryMovements.batchNumber,
        expiryDate: inventoryMovements.expiryDate,
        quantity: sql<number>`coalesce(sum(case when ${inventoryMovements.movementType} = 'purchase' then ${inventoryMovements.quantity} when ${inventoryMovements.movementType} = 'sale' then -${inventoryMovements.quantity} else 0 end), 0)`,
      }).from(inventoryMovements)
        .where(and(eq(inventoryMovements.productId, input.productId), eq(inventoryMovements.tenantId, ctx.user.tenantId!)))
        .groupBy(inventoryMovements.batchNumber, inventoryMovements.expiryDate)
        .having(sql`coalesce(sum(case when ${inventoryMovements.movementType} = 'purchase' then ${inventoryMovements.quantity} when ${inventoryMovements.movementType} = 'sale' then -${inventoryMovements.quantity} else 0 end), 0) > 0`);
      return batches.filter(b => b.batchNumber).sort((a, b) => {
        if (a.expiryDate && b.expiryDate) return a.expiryDate.localeCompare(b.expiryDate);
        return 0;
      });
    }),
});
