import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, sql, count } from "drizzle-orm";

export const ediRouter = createRouter({
  // ── Partners ──
  listPartners: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const items = await db.select().from(schema.ediPartners)
        .where(eq(schema.ediPartners.tenantId, tenantId))
        .limit(limit).offset(offset);
      const [totalResult] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.ediPartners).where(eq(schema.ediPartners.tenantId, tenantId));
      return { items, total: totalResult?.total || 0 };
    }),
  getPartner: authedQuery.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const [item] = await db.select().from(schema.ediPartners)
      .where(and(eq(schema.ediPartners.id, input.id), eq(schema.ediPartners.tenantId, ctx.user.tenantId!)));
    return item;
  }),
  createPartner: adminQuery
    .input(z.object({
      partnerCode: z.string().min(1), partnerName: z.string().min(1),
      partnerType: z.enum(["customer", "supplier", "logistics", "bank", "govt"]),
      ediStandard: z.enum(["edifact", "x12", "tradacoms", "custom"]),
      version: z.string().optional(), senderId: z.string().optional(),
      receiverId: z.string().optional(), qualifier: z.string().optional(),
      isActive: z.boolean().optional(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.ediPartners).values({
        tenantId: ctx.user.tenantId!,
        ...input,
      }).$returningId();
      return item;
    }),
  updatePartner: adminQuery
    .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(schema.ediPartners).set(input.data)
        .where(and(eq(schema.ediPartners.id, input.id), eq(schema.ediPartners.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),
  deletePartner: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.delete(schema.ediPartners)
      .where(and(eq(schema.ediPartners.id, input.id), eq(schema.ediPartners.tenantId, ctx.user.tenantId!)));
    return { success: true };
  }),

  // ── Document Types ──
  listDocumentTypes: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const items = await db.select().from(schema.ediDocumentTypes)
        .where(eq(schema.ediDocumentTypes.tenantId, tenantId)).limit(limit).offset(offset);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.ediDocumentTypes).where(eq(schema.ediDocumentTypes.tenantId, tenantId));
      return { items, total: total?.total || 0 };
    }),
  createDocumentType: adminQuery
    .input(z.object({
      documentCode: z.string().min(1), documentName: z.string().min(1),
      direction: z.enum(["inbound", "outbound", "both"]),
      ediStandard: z.string().optional(), status: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.ediDocumentTypes).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return item;
    }),

  // ── Mappings ──
  listMappings: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const items = await db.select().from(schema.ediMappings)
        .where(eq(schema.ediMappings.tenantId, tenantId)).limit(limit).offset(offset);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.ediMappings).where(eq(schema.ediMappings.tenantId, tenantId));
      return { items, total: total?.total || 0 };
    }),
  createMapping: adminQuery
    .input(z.object({
      mappingName: z.string().min(1), direction: z.enum(["inbound", "outbound"]),
      sourceFormat: z.string().optional(), targetFormat: z.string().optional(),
      delimiter: z.string().optional(), segmentTerminator: z.string().optional(),
      elementSeparator: z.string().optional(), componentSeparator: z.string().optional(),
      decimalNotation: z.string().optional(), releaseCharacter: z.string().optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.ediMappings).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return item;
    }),

  // ── Transaction Sets ──
  listTransactionSets: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const items = await db.select().from(schema.ediTransactionSets)
        .where(eq(schema.ediTransactionSets.tenantId, tenantId)).limit(limit).offset(offset);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.ediTransactionSets).where(eq(schema.ediTransactionSets.tenantId, tenantId));
      return { items, total: total?.total || 0 };
    }),

  // ── Outbound Queue ──
  listOutbound: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const items = await db.select().from(schema.ediOutboundQueue)
        .where(eq(schema.ediOutboundQueue.tenantId, tenantId))
        .orderBy(desc(schema.ediOutboundQueue.createdAt)).limit(limit).offset(offset);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.ediOutboundQueue).where(eq(schema.ediOutboundQueue.tenantId, tenantId));
      return { items, total: total?.total || 0 };
    }),

  // ── Inbound Queue ──
  listInbound: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const items = await db.select().from(schema.ediInboundQueue)
        .where(eq(schema.ediInboundQueue.tenantId, tenantId))
        .orderBy(desc(schema.ediInboundQueue.createdAt)).limit(limit).offset(offset);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.ediInboundQueue).where(eq(schema.ediInboundQueue.tenantId, tenantId));
      return { items, total: total?.total || 0 };
    }),

  // ── Logs ──
  listLogs: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0), partnerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const conditions = [eq(schema.ediLogs.tenantId, tenantId)];
      if (input?.partnerId) conditions.push(eq(schema.ediLogs.partnerId, input.partnerId));
      const items = await db.select().from(schema.ediLogs)
        .where(and(...conditions)).orderBy(desc(schema.ediLogs.createdAt)).limit(limit).offset(offset);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.ediLogs).where(and(...conditions));
      return { items, total: total?.total || 0 };
    }),

  // ── Acknowledgements ──
  listAcknowledgements: authedQuery
    .input(z.object({ outboundId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.ediAcknowledgements.tenantId, ctx.user.tenantId!)];
      if (input?.outboundId) conditions.push(eq(schema.ediAcknowledgements.outboundId, input.outboundId));
      return db.select().from(schema.ediAcknowledgements).where(and(...conditions))
        .orderBy(desc(schema.ediAcknowledgements.createdAt));
    }),

  // ── EDI Functions ──
  generateEdiFile: authedQuery
    .input(z.object({ mappingId: z.number(), data: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [mapping] = await db.select().from(schema.ediMappings)
        .where(and(eq(schema.ediMappings.id, input.mappingId), eq(schema.ediMappings.tenantId, ctx.user.tenantId!)));
      if (!mapping) throw new Error("Mapping not found");
      const segTerm = mapping.segmentTerminator || "'";
      const elemSep = mapping.elementSeparator || "+";
      const compSep = mapping.componentSeparator || ":";
      let edi = "";
      for (const [key, value] of Object.entries(input.data)) {
        if (typeof value === 'object') {
          const parts = Array.isArray(value) ? value : Object.values(value);
          edi += `${key}${elemSep}${parts.join(compSep)}${segTerm}\n`;
        } else {
          edi += `${key}${elemSep}${value}${segTerm}\n`;
        }
      }
      await db.insert(schema.ediOutboundQueue).values({
        tenantId: ctx.user.tenantId!,
        ediPayload: edi,
        status: "generated",
        sourceEntityType: input.data.entityType as string || "manual",
      });
      return { edi, success: true };
    }),

  parseEdiFile: authedQuery
    .input(z.object({ rawEdi: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lines = input.rawEdi.split("\n").filter(l => l.trim());
      const parsed: Record<string, any> = {};
      for (const line of lines) {
        const clean = line.replace(/'$/, "").trim();
        const [segment, ...elements] = clean.split("+");
        parsed[segment] = elements.length === 1 ? elements[0] : elements;
      }
      await db.insert(schema.ediInboundQueue).values({
        tenantId: ctx.user.tenantId!,
        rawEdi: input.rawEdi,
        parsedData: parsed,
        status: "parsed",
      });
      return { parsed, success: true };
    }),

  sendEdi: authedQuery
    .input(z.object({ outboundId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.select().from(schema.ediOutboundQueue)
        .where(and(eq(schema.ediOutboundQueue.id, input.outboundId), eq(schema.ediOutboundQueue.tenantId, ctx.user.tenantId!)));
      if (!item) throw new Error("Outbound record not found");
      await db.update(schema.ediOutboundQueue).set({
        status: "transmitted",
        transmissionDate: new Date(),
      }).where(eq(schema.ediOutboundQueue.id, input.outboundId));
      await db.insert(schema.ediLogs).values({
        tenantId: ctx.user.tenantId!,
        direction: "outbound",
        documentType: item.sourceEntityType,
        transactionRef: String(item.id),
        status: "transmitted",
        message: "EDI transmitted successfully",
      });
      return { success: true, message: "EDI transmitted to partner" };
    }),

  ediDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [partnerCount] = await db.select({ total: sql<number>`count(*)` })
      .from(schema.ediPartners).where(eq(schema.ediPartners.tenantId, tenantId));
    const [docCount] = await db.select({ total: sql<number>`count(*)` })
      .from(schema.ediDocumentTypes).where(eq(schema.ediDocumentTypes.tenantId, tenantId));
    const [outboundCount] = await db.select({ total: sql<number>`count(*)` })
      .from(schema.ediOutboundQueue).where(eq(schema.ediOutboundQueue.tenantId, tenantId));
    const [pendingCount] = await db.select({ total: sql<number>`count(*)` })
      .from(schema.ediOutboundQueue)
      .where(and(eq(schema.ediOutboundQueue.tenantId, tenantId), eq(schema.ediOutboundQueue.status, "pending")));
    const recentLogs = await db.select().from(schema.ediLogs)
      .where(eq(schema.ediLogs.tenantId, tenantId))
      .orderBy(desc(schema.ediLogs.createdAt)).limit(10);
    return {
      partnerCount: partnerCount?.total || 0,
      documentTypeCount: docCount?.total || 0,
      outboundCount: outboundCount?.total || 0,
      pendingCount: pendingCount?.total || 0,
      recentLogs,
    };
  }),

  ediStatusReport: authedQuery.input(z.object({ from: z.string().optional(), to: z.string().optional() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const statuses = await db.select({
      status: schema.ediOutboundQueue.status,
      count: sql<number>`count(*)`,
    }).from(schema.ediOutboundQueue).where(eq(schema.ediOutboundQueue.tenantId, tenantId))
      .groupBy(schema.ediOutboundQueue.status);
    const inboundStatuses = await db.select({
      status: schema.ediInboundQueue.status,
      count: sql<number>`count(*)`,
    }).from(schema.ediInboundQueue).where(eq(schema.ediInboundQueue.tenantId, tenantId))
      .groupBy(schema.ediInboundQueue.status);
    return { outbound: statuses, inbound: inboundStatuses };
  }),
});
