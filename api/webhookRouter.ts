import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

function generateKeyPrefix(): string {
  return "ak_" + crypto.randomBytes(4).toString("hex");
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export const webhookRouter = createRouter({
  // ── Subscriptions ──
  listSubscriptions: authedQuery
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 100;
      const offset = input?.offset || 0;
      const items = await db.select().from(schema.webhookSubscriptions)
        .where(eq(schema.webhookSubscriptions.tenantId, tenantId)).limit(limit).offset(offset);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.webhookSubscriptions).where(eq(schema.webhookSubscriptions.tenantId, tenantId));
      return { items, total: total?.total || 0 };
    }),
  getSubscription: authedQuery.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const [item] = await db.select().from(schema.webhookSubscriptions)
      .where(and(eq(schema.webhookSubscriptions.id, input.id), eq(schema.webhookSubscriptions.tenantId, ctx.user.tenantId!)));
    return item;
  }),
  createSubscription: adminQuery
    .input(z.object({
      name: z.string().min(1), url: z.string().url(),
      eventTypes: z.array(z.string()).min(1),
      format: z.enum(["json", "xml"]).optional(),
      isActive: z.boolean().optional(),
      retryCount: z.number().optional(),
      timeoutMs: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const secret = crypto.randomBytes(32).toString("hex");
      const [item] = await db.insert(schema.webhookSubscriptions).values({
        tenantId: ctx.user.tenantId!,
        name: input.name,
        url: input.url,
        secret,
        eventTypes: input.eventTypes as any,
        format: input.format || "json",
        isActive: input.isActive ?? true,
        retryCount: input.retryCount ?? 3,
        timeoutMs: input.timeoutMs ?? 5000,
      }).$returningId();
      return { ...item, secret };
    }),
  updateSubscription: adminQuery
    .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(schema.webhookSubscriptions).set(input.data)
        .where(and(eq(schema.webhookSubscriptions.id, input.id), eq(schema.webhookSubscriptions.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),
  deleteSubscription: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.delete(schema.webhookSubscriptions)
      .where(and(eq(schema.webhookSubscriptions.id, input.id), eq(schema.webhookSubscriptions.tenantId, ctx.user.tenantId!)));
    return { success: true };
  }),

  // ── Delivery Logs ──
  listDeliveryLogs: authedQuery
    .input(z.object({ subscriptionId: z.number().optional(), limit: z.number().default(50), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [];
      if (input?.subscriptionId) conditions.push(eq(schema.webhookDeliveryLogs.subscriptionId, input.subscriptionId));
      const items = await db.select().from(schema.webhookDeliveryLogs)
        .where(and(...conditions)).orderBy(desc(schema.webhookDeliveryLogs.createdAt))
        .limit(input?.limit || 50).offset(input?.offset || 0);
      const [total] = await db.select({ total: sql<number>`count(*)` })
        .from(schema.webhookDeliveryLogs).where(and(...conditions));
      return { items, total: total?.total || 0 };
    }),

  // ── Event Queue ──
  listEventQueue: authedQuery
    .input(z.object({ status: z.string().optional(), limit: z.number().default(50) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.webhookEventQueue.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(schema.webhookEventQueue.status, input.status as any));
      return db.select().from(schema.webhookEventQueue).where(and(...conditions))
        .orderBy(desc(schema.webhookEventQueue.createdAt)).limit(input?.limit || 50);
    }),

  triggerEvent: adminQuery
    .input(z.object({
      eventType: z.string().min(1),
      payload: z.record(z.string(), z.any()),
      sourceEntityType: z.string().optional(),
      sourceEntityId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const subscriptions = await db.select().from(schema.webhookSubscriptions)
        .where(and(
          eq(schema.webhookSubscriptions.tenantId, ctx.user.tenantId!),
          eq(schema.webhookSubscriptions.isActive, true),
        ));
      const matched: number[] = [];
      for (const sub of subscriptions) {
        const events = sub.eventTypes as string[];
        if (events.includes(input.eventType)) {
          await db.insert(schema.webhookEventQueue).values({
            tenantId: ctx.user.tenantId!,
            eventType: input.eventType,
            payload: input.payload as any,
            sourceEntityType: input.sourceEntityType,
            sourceEntityId: input.sourceEntityId,
          });
          matched.push(sub.id);
        }
      }
      return { success: true, matchedSubscriptions: matched.length };
    }),

  testWebhook: adminQuery
    .input(z.object({ subscriptionId: z.number(), testPayload: z.record(z.string(), z.any()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [sub] = await db.select().from(schema.webhookSubscriptions)
        .where(and(eq(schema.webhookSubscriptions.id, input.subscriptionId), eq(schema.webhookSubscriptions.tenantId, ctx.user.tenantId!)));
      if (!sub) throw new Error("Subscription not found");
      const payload = input.testPayload || { test: true, timestamp: new Date().toISOString() };
      await db.insert(schema.webhookDeliveryLogs).values({
        subscriptionId: sub.id,
        eventType: "test",
        payload: payload as any,
        status: "delivered",
        httpStatus: 200,
        attemptNumber: 1,
        durationMs: 0,
        deliveredAt: new Date(),
      });
      return { success: true, message: "Test webhook logged" };
    }),

  regenerateSecret: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const secret = crypto.randomBytes(32).toString("hex");
    await db.update(schema.webhookSubscriptions).set({ secret })
      .where(and(eq(schema.webhookSubscriptions.id, input.id), eq(schema.webhookSubscriptions.tenantId, ctx.user.tenantId!)));
    return { secret, success: true };
  }),

  webhookDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [activeSubs] = await db.select({ total: sql<number>`count(*)` }).from(schema.webhookSubscriptions)
      .where(and(eq(schema.webhookSubscriptions.tenantId, tenantId), eq(schema.webhookSubscriptions.isActive, true)));
    const [failedDeliveries] = await db.select({ total: sql<number>`count(*)` }).from(schema.webhookDeliveryLogs)
      .where(eq(schema.webhookDeliveryLogs.status, "failed"));
    const [totalEvents] = await db.select({ total: sql<number>`count(*)` }).from(schema.webhookEventQueue)
      .where(eq(schema.webhookEventQueue.tenantId, tenantId));
    const recentDeliveries = await db.select().from(schema.webhookDeliveryLogs)
      .orderBy(desc(schema.webhookDeliveryLogs.createdAt)).limit(10);
    return {
      activeSubscriptions: activeSubs?.total || 0,
      failedDeliveries: failedDeliveries?.total || 0,
      totalEvents: totalEvents?.total || 0,
      recentDeliveries,
    };
  }),

  // ── API Keys ──
  listApiKeys: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.apiKeys)
      .where(eq(schema.apiKeys.tenantId, ctx.user.tenantId!))
      .orderBy(desc(schema.apiKeys.createdAt));
  }),
  generateApiKey: adminQuery
    .input(z.object({
      keyName: z.string().min(1),
      permissions: z.array(z.string()).optional(),
      ipWhitelist: z.array(z.string()).optional(),
      rateLimitPerMinute: z.number().optional(),
      expiresAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const prefix = generateKeyPrefix();
      const rawKey = `${prefix}_${crypto.randomBytes(24).toString("hex")}`;
      const keyHash = hashKey(rawKey);
      const [item] = await db.insert(schema.apiKeys).values({
        tenantId: ctx.user.tenantId!,
        keyName: input.keyName,
        keyHash,
        keyPrefix: prefix,
        permissions: (input.permissions || ["*"]) as any,
        ipWhitelist: (input.ipWhitelist || []) as any,
        rateLimitPerMinute: input.rateLimitPerMinute || 60,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        createdBy: ctx.user.id,
      }).$returningId();
      return { ...item, apiKey: rawKey };
    }),
  revokeApiKey: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.update(schema.apiKeys).set({ isActive: false })
      .where(and(eq(schema.apiKeys.id, input.id), eq(schema.apiKeys.tenantId, ctx.user.tenantId!)));
    return { success: true };
  }),
  deleteApiKey: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.delete(schema.apiKeys)
      .where(and(eq(schema.apiKeys.id, input.id), eq(schema.apiKeys.tenantId, ctx.user.tenantId!)));
    return { success: true };
  }),

  // ── Usage ──
  listUsageLogs: authedQuery
    .input(z.object({ apiKeyId: z.number().optional(), limit: z.number().default(50) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.apiUsageLogs.tenantId, ctx.user.tenantId!)];
      if (input?.apiKeyId) conditions.push(eq(schema.apiUsageLogs.apiKeyId, input.apiKeyId));
      return db.select().from(schema.apiUsageLogs).where(and(...conditions))
        .orderBy(desc(schema.apiUsageLogs.createdAt)).limit(input?.limit || 50);
    }),

  apiUsageDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [totalKeys] = await db.select({ total: sql<number>`count(*)` }).from(schema.apiKeys)
      .where(eq(schema.apiKeys.tenantId, tenantId));
    const [activeKeys] = await db.select({ total: sql<number>`count(*)` }).from(schema.apiKeys)
      .where(and(eq(schema.apiKeys.tenantId, tenantId), eq(schema.apiKeys.isActive, true)));
    const [totalRequests] = await db.select({ total: sql<number>`count(*)` }).from(schema.apiUsageLogs)
      .where(eq(schema.apiUsageLogs.tenantId, tenantId));
    return { totalKeys: totalKeys?.total || 0, activeKeys: activeKeys?.total || 0, totalRequests: totalRequests?.total || 0 };
  }),
});
