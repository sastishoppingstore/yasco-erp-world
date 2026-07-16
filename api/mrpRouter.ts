import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  masterProductionSchedules, capacityResources, roughCutCapacityPlans,
  mrpDemands, mrpRuns, mrpPlannedOrders, mrpNetRequirements, peggingRecords,
  billOfMaterials, bomItems, products, inventoryBalances, workOrders, purchaseOrders
} from "@db/schema";
import { eq, sql, and, desc, gte, lte } from "drizzle-orm";

export const mrpRouter = createRouter({
  // MPS
  mpsList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(masterProductionSchedules).where(eq(masterProductionSchedules.tenantId, ctx.user.tenantId!)).orderBy(desc(masterProductionSchedules.createdAt));
  }),
  mpsCreate: authedQuery.input(z.object({
    productId: z.number(), scheduleDate: z.string(), plannedQuantity: z.string(),
    demandSource: z.enum(["forecast","sales_order","safety_stock","manual"]),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(masterProductionSchedules).values({ ...input, tenantId: ctx.user.tenantId!, createdBy: ctx.user.id }).$returningId();
    return { id, success: true };
  }),

  // Capacity Resources
  resourceList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(capacityResources).where(eq(capacityResources.tenantId, ctx.user.tenantId!));
  }),
  resourceCreate: authedQuery.input(z.object({
    resourceCode: z.string(), resourceName: z.string(),
    resourceType: z.enum(["machine","labor","workstation","work_center"]),
    departmentId: z.number().optional(), availableHours: z.string().optional(),
    costPerHour: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(capacityResources).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // Rough Cut Capacity Plans
  rccpList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(roughCutCapacityPlans).where(eq(roughCutCapacityPlans.tenantId, ctx.user.tenantId!)).orderBy(desc(roughCutCapacityPlans.createdAt));
  }),
  rccpCreate: authedQuery.input(z.object({
    resourceId: z.number(), periodStart: z.string(), periodEnd: z.string(),
    availableCapacity: z.string(), requiredCapacity: z.string(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const overload = ((Number(input.requiredCapacity) - Number(input.availableCapacity)) / Number(input.availableCapacity) * 100).toFixed(2);
    const [{ id }] = await db.insert(roughCutCapacityPlans).values({
      ...input, overloadPercent: overload, tenantId: ctx.user.tenantId!,
    }).$returningId();
    return { id, success: true };
  }),

  // MRP Demands
  mrpDemandList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(mrpDemands).where(eq(mrpDemands.tenantId, ctx.user.tenantId!)).orderBy(desc(mrpDemands.createdAt));
  }),

  // MRP Runs
  mrpRunList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(mrpRuns).where(eq(mrpRuns.tenantId, ctx.user.tenantId!)).orderBy(desc(mrpRuns.createdAt));
  }),
  mrpRunGet: authedQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const run = await db.query.mrpRuns.findFirst({ where: eq(mrpRuns.id, input.id) });
    const netRequirements = await db.select().from(mrpNetRequirements).where(eq(mrpNetRequirements.mrpRunId || mrpNetRequirements.id, input.id));
    const plannedOrders = await db.select().from(mrpPlannedOrders).where(eq(mrpPlannedOrders.mrpRunId || mrpPlannedOrders.id, input.id));
    return { run, netRequirements, plannedOrders };
  }),

  // Planned Orders
  plannedOrderList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(mrpPlannedOrders).where(eq(mrpPlannedOrders.tenantId, ctx.user.tenantId!)).orderBy(desc(mrpPlannedOrders.createdAt));
  }),

  // Pegging Records
  peggingList: authedQuery.input(z.object({ demandId: z.number().optional() }).optional()).query(async ({ input, ctx }) => {
    const db = getDb();
    const conditions = [eq(peggingRecords.tenantId, ctx.user.tenantId!)];
    if (input?.demandId) conditions.push(eq(peggingRecords.demandId, input.demandId));
    return db.select().from(peggingRecords).where(and(...conditions));
  }),

  // --- MRP Execution ---
  runMrp: authedQuery.input(z.object({
    horizonStart: z.string(), horizonEnd: z.string(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const startTime = Date.now();
    const [{ runId }] = await db.insert(mrpRuns).values({
      tenantId: ctx.user.tenantId!, horizonStart: input.horizonStart,
      horizonEnd: input.horizonEnd, status: "running", createdBy: ctx.user.id,
    }).$returningId();
    try {
      const tenantId = ctx.user.tenantId!;
      // Step 1: Get all open MPS
      const mpsItems = await db.select().from(masterProductionSchedules)
        .where(and(eq(masterProductionSchedules.tenantId, tenantId), eq(masterProductionSchedules.status, "planned")));
      // Step 2: Generate demands from MPS
      for (const mps of mpsItems) {
        await db.insert(mrpDemands).values({
          tenantId, demandType: "independent", sourceType: "mps",
          sourceId: String(mps.id), productId: mps.productId,
          quantity: mps.plannedQuantity, dueDate: mps.scheduleDate, status: "open",
        });
      }
      // Step 3: Get all open demands and explode BOM
      const demands = await db.select().from(mrpDemands)
        .where(and(eq(mrpDemands.tenantId, tenantId), eq(mrpDemands.status, "open")));
      for (const demand of demands) {
        const boms = await db.select().from(billOfMaterials)
          .where(and(eq(billOfMaterials.tenantId, tenantId), eq(billOfMaterials.productId, demand.productId), eq(billOfMaterials.isActive, true)));
        for (const bom of boms) {
          const items = await db.select().from(bomItems).where(eq(bomItems.bomId, bom.id));
          for (const item of items) {
            const childDemand = item.quantity * demand.quantity;
            // Check inventory
            const bal = await db.select().from(inventoryBalances)
              .where(and(eq(inventoryBalances.productId, item.productId), eq(inventoryBalances.tenantId, tenantId)));
            const onHand = bal.reduce((sum, b) => sum + (b.quantity || 0), 0);
            const netReq = Math.max(0, childDemand - onHand);
            if (netReq > 0) {
              await db.insert(mrpPlannedOrders).values({
                tenantId, productId: item.productId, orderType: "purchase",
                quantity: String(netReq), dueDate: demand.dueDate, status: "planned", mrpRunId: runId,
              });
            }
            // Pegging
            await db.insert(peggingRecords).values({
              tenantId, demandId: demand.id, orderId: runId,
              productId: item.productId, quantity: String(childDemand), mrpRunId: runId,
            });
          }
        }
        // Net requirements
        const grossReq = Number(demand.quantity);
        const bal = await db.select().from(inventoryBalances)
          .where(and(eq(inventoryBalances.productId, demand.productId), eq(inventoryBalances.tenantId, tenantId)));
        const onHand = bal.reduce((sum, b) => sum + (b.quantity || 0), 0);
        const projectedOnHand = onHand;
        const netRequirement = Math.max(0, grossReq - onHand);
        await db.insert(mrpNetRequirements).values({
          tenantId, productId: demand.productId,
          periodStart: input.horizonStart, periodEnd: input.horizonEnd,
          grossRequirement: String(grossReq), scheduledReceipts: "0",
          projectedOnHand: String(projectedOnHand), netRequirement: String(netRequirement),
          plannedOrderReceipt: String(netRequirement > 0 ? netRequirement : 0),
          plannedOrderRelease: String(netRequirement > 0 ? netRequirement : 0),
        });
      }
      await db.update(mrpRuns).set({ status: "completed", executionTimeMs: Date.now() - startTime }).where(eq(mrpRuns.id, runId));
      return { runId, success: true };
    } catch (e: any) {
      await db.update(mrpRuns).set({ status: "failed", actionMessages: e.message }).where(eq(mrpRuns.id, runId));
      throw e;
    }
  }),

  // Dashboard
  mrpDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const totalMps = await db.select({ count: sql<number>`count(*)` }).from(masterProductionSchedules).where(eq(masterProductionSchedules.tenantId, tenantId));
    const openDemands = await db.select({ count: sql<number>`count(*)` }).from(mrpDemands).where(and(eq(mrpDemands.tenantId, tenantId), eq(mrpDemands.status, "open")));
    const plannedOrders = await db.select({ count: sql<number>`count(*)` }).from(mrpPlannedOrders).where(and(eq(mrpPlannedOrders.tenantId, tenantId), eq(mrpPlannedOrders.status, "planned")));
    const overdue = await db.select({ count: sql<number>`count(*)` }).from(mrpDemands)
      .where(and(eq(mrpDemands.tenantId, tenantId), eq(mrpDemands.status, "open"), lte(mrpDemands.dueDate, new Date().toISOString().split('T')[0])));
    return {
      totalMps: Number(totalMps[0]?.count || 0),
      openDemands: Number(openDemands[0]?.count || 0),
      plannedOrders: Number(plannedOrders[0]?.count || 0),
      overdueDemands: Number(overdue[0]?.count || 0),
    };
  }),

  // Release planned order -> actual PO or work order
  releasePlannedOrder: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const order = await db.query.mrpPlannedOrders.findFirst({ where: eq(mrpPlannedOrders.id, input.id) });
    if (!order) throw new Error("Planned order not found");
    if (order.orderType === "purchase") {
      const poNum = `PO-MRP-${Date.now()}`;
      const [{ poId }] = await db.insert(purchaseOrders).values({
        tenantId: ctx.user.tenantId!, poNumber: poNum, supplierId: 1,
        date: new Date().toISOString().split('T')[0], subTotal: "0", totalAmount: "0", status: "draft", createdBy: ctx.user.id,
      }).$returningId();
      await db.update(mrpPlannedOrders).set({ status: "released" }).where(eq(mrpPlannedOrders.id, input.id));
      return { released: true, type: "purchase", referenceId: poId };
    } else if (order.orderType === "manufacture") {
      const woNum = `WO-MRP-${Date.now()}`;
      const [{ woId }] = await db.insert(workOrders).values({
        tenantId: ctx.user.tenantId!, woNumber: woNum, productId: order.productId,
        quantity: Number(order.quantity), status: "planned", createdBy: ctx.user.id,
      }).$returningId();
      await db.update(mrpPlannedOrders).set({ status: "released" }).where(eq(mrpPlannedOrders.id, input.id));
      return { released: true, type: "manufacture", referenceId: woId };
    }
    throw new Error("Unsupported order type");
  }),

  // Pegging Graph
  peggingGraph: authedQuery.input(z.object({ productId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const records = await db.select().from(peggingRecords).where(eq(peggingRecords.productId, input.productId));
    const demands = await db.select().from(mrpDemands);
    const orders = await db.select().from(mrpPlannedOrders);
    return { records, demands, orders };
  }),

  // Capacity Load Chart
  capacityLoadChart: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const resources = await db.select().from(capacityResources).where(eq(capacityResources.tenantId, ctx.user.tenantId!));
    const plans = await db.select().from(roughCutCapacityPlans).where(eq(roughCutCapacityPlans.tenantId, ctx.user.tenantId!));
    return { resources, plans };
  }),

  // Net Requirements
  netRequirementsList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(mrpNetRequirements).where(eq(mrpNetRequirements.tenantId, ctx.user.tenantId!));
  }),
});
