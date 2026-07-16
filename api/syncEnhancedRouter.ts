import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { syncLogs, deviceRegistrations, syncStats } from "@db/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { pushEngine } from "./lib/sync/pushEngine";
import { pullEngine, pullInputSchema } from "./lib/sync/pullEngine";
import { isFinancialEntity, generateUuid } from "./lib/sync/deltaSyncEngine";

export const syncEnhancedRouter = createRouter({
  // ==========================================
  // Push / Pull
  // ==========================================

  push: authedQuery
    .input(z.object({
      deviceId: z.string().optional(),
      changes: z.array(z.object({
        entityType: z.string(),
        entityId: z.union([z.string(), z.number()]),
        action: z.enum(["create", "update", "delete"]),
        payload: z.record(z.any()),
        version: z.number().default(1),
        localUuid: z.string().optional(),
        timestamp: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      return pushEngine.pushChanges({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        deviceId: input.deviceId,
        changes: input.changes,
        batchId: generateUuid(),
      });
    }),

  pull: authedQuery
    .input(z.object({
      deviceId: z.string().optional(),
      since: z.string().optional(),
      entityTypes: z.array(z.string()).optional(),
      batchSize: z.number().default(500),
      page: z.number().default(1),
    }))
    .query(async ({ input, ctx }) => {
      return pullEngine.pullChanges({
        tenantId: ctx.user.tenantId!,
        deviceId: input.deviceId,
        since: input.since,
        entityTypes: input.entityTypes,
        batchSize: input.batchSize,
        page: input.page,
      });
    }),

  // ==========================================
  // Device Management
  // ==========================================

  registerDevice: authedQuery
    .input(z.object({
      deviceId: z.string(),
      deviceName: z.string().optional(),
      platform: z.string().optional(),
      appVersion: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.query.deviceRegistrations.findFirst({
        where: eq(deviceRegistrations.deviceId, input.deviceId),
      });
      if (existing) {
        await db.update(deviceRegistrations)
          .set({
            lastSeen: new Date(),
            deviceName: input.deviceName || existing.deviceName,
            platform: input.platform || existing.platform,
            appVersion: input.appVersion || existing.appVersion,
            lastSyncAt: new Date(),
          })
          .where(eq(deviceRegistrations.deviceId, input.deviceId));
        return { deviceId: input.deviceId, registered: true, message: "Device updated" };
      }
      await db.insert(deviceRegistrations).values({
        deviceId: input.deviceId,
        deviceName: input.deviceName || "Unknown",
        platform: input.platform || "unknown",
        userId: ctx.user.id,
        tenantId: ctx.user.tenantId!,
        lastSeen: new Date(),
        lastSyncAt: new Date(),
        appVersion: input.appVersion || "1.0.0",
        isActive: true,
      });
      return { deviceId: input.deviceId, registered: true, message: "Device registered" };
    }),

  listDevices: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(deviceRegistrations)
      .where(eq(deviceRegistrations.tenantId, ctx.user.tenantId!))
      .orderBy(desc(deviceRegistrations.lastSeen));
  }),

  deactivateDevice: authedQuery
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(deviceRegistrations)
        .set({ isActive: false })
        .where(and(
          eq(deviceRegistrations.deviceId, input.deviceId),
          eq(deviceRegistrations.tenantId, ctx.user.tenantId!),
        ));
      return { success: true };
    }),

  // ==========================================
  // Sync Status / Health Monitoring
  // ==========================================

  health: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;

    const deviceCount = await db.select({ count: sql<number>`count(*)` }).from(deviceRegistrations)
      .where(and(eq(deviceRegistrations.tenantId, tenantId), eq(deviceRegistrations.isActive, true)));

    const recentPulls = await db.select({ count: sql<number>`count(*)` }).from(syncLogs)
      .where(and(eq(syncLogs.tenantId, tenantId), eq(syncLogs.direction, "pull"), gte(syncLogs.createdAt, new Date(Date.now() - 3600000))));

    const recentPushes = await db.select({ count: sql<number>`count(*)` }).from(syncLogs)
      .where(and(eq(syncLogs.tenantId, tenantId), eq(syncLogs.direction, "push"), gte(syncLogs.createdAt, new Date(Date.now() - 3600000))));

    const failedRecent = await db.select({ count: sql<number>`count(*)` }).from(syncLogs)
      .where(and(eq(syncLogs.tenantId, tenantId), eq(syncLogs.status, "failed"), gte(syncLogs.createdAt, new Date(Date.now() - 3600000))));

    const stats = await db.select().from(syncStats).where(eq(syncStats.tenantId, tenantId));

    return {
      status: failedRecent[0]?.count > 0 ? "degraded" : "healthy",
      activeDevices: deviceCount[0]?.count || 0,
      pullsLastHour: recentPulls[0]?.count || 0,
      pushesLastHour: recentPushes[0]?.count || 0,
      failedLastHour: failedRecent[0]?.count || 0,
      stats,
      serverTime: new Date().toISOString(),
    };
  }),

  stats: authedQuery
    .input(z.object({ deviceId: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(syncStats.tenantId, tenantId)];
      if (input?.deviceId) conditions.push(eq(syncStats.deviceId, input.deviceId));

      const allStats = await db.select().from(syncStats).where(and(...conditions));

      const totals = allStats.reduce((acc, s) => ({
        totalPushes: acc.totalPushes + Number(s.totalPushes || 0),
        totalPulls: acc.totalPulls + Number(s.totalPulls || 0),
        successfulPushes: acc.successfulPushes + Number(s.successfulPushes || 0),
        failedPushes: acc.failedPushes + Number(s.failedPushes || 0),
        successfulPulls: acc.successfulPulls + Number(s.successfulPulls || 0),
        failedPulls: acc.failedPulls + Number(s.failedPulls || 0),
        conflictsResolved: acc.conflictsResolved + Number(s.conflictsResolved || 0),
        conflictsPending: acc.conflictsPending + Number(s.conflictsPending || 0),
      }), { totalPushes: 0, totalPulls: 0, successfulPushes: 0, failedPushes: 0, successfulPulls: 0, failedPulls: 0, conflictsResolved: 0, conflictsPending: 0 });

      return {
        ...totals,
        successRate: totals.totalPushes + totals.totalPulls > 0
          ? Math.round(((totals.successfulPushes + totals.successfulPulls) / (totals.totalPushes + totals.totalPulls)) * 100)
          : 100,
        deviceStats: allStats,
      };
    }),

  // ==========================================
  // Force Full Sync
  // ==========================================

  forceFullSync: authedQuery
    .input(z.object({ deviceId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId!;
      const result = await pullEngine.pullChanges({
        tenantId,
        deviceId: input.deviceId,
        since: new Date(0).toISOString(),
        batchSize: 1000,
        page: 1,
      });

      return {
        message: "Full sync completed",
        recordsPulled: result.totalCount,
        tables: Object.keys(result.data).length,
        serverTime: result.serverTime,
      };
    }),

  // ==========================================
  // Logs
  // ==========================================

  logs: authedQuery
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      direction: z.enum(["push", "pull"]).optional(),
      status: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(syncLogs.tenantId, tenantId)];
      if (input.direction) conditions.push(eq(syncLogs.direction, input.direction));
      if (input.status) conditions.push(eq(syncLogs.status, input.status));

      const items = await db.select().from(syncLogs)
        .where(and(...conditions))
        .orderBy(desc(syncLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(syncLogs)
        .where(and(...conditions));

      return { items, total: totalResult?.total || 0 };
    }),

  // ==========================================
  // Conflict Detection Helper
  // ==========================================

  isFinancialEntity: authedQuery
    .input(z.object({ entityType: z.string() }))
    .query(({ input }) => {
      return { isFinancial: isFinancialEntity(input.entityType) };
    }),

  // ==========================================
  // Sync Dashboard Data
  // ==========================================

  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;

    const deviceCount = await db.select({ count: sql<number>`count(*)` }).from(deviceRegistrations)
      .where(eq(deviceRegistrations.tenantId, tenantId));
    const activeDeviceCount = await db.select({ count: sql<number>`count(*)` }).from(deviceRegistrations)
      .where(and(eq(deviceRegistrations.tenantId, tenantId), eq(deviceRegistrations.isActive, true)));

    const last24hLogs = await db.select({ count: sql<number>`count(*)` }).from(syncLogs)
      .where(and(eq(syncLogs.tenantId, tenantId), gte(syncLogs.createdAt, new Date(Date.now() - 86400000))));

    const failedLogs = await db.select({ count: sql<number>`count(*)` }).from(syncLogs)
      .where(and(eq(syncLogs.tenantId, tenantId), eq(syncLogs.status, "failed"), gte(syncLogs.createdAt, new Date(Date.now() - 86400000))));

    const avgDuration = await db.select({ avg: sql<number>`coalesce(avg(duration_ms), 0)` }).from(syncLogs)
      .where(and(eq(syncLogs.tenantId, tenantId), gte(syncLogs.createdAt, new Date(Date.now() - 86400000))));

    const recentLogs = await db.select().from(syncLogs)
      .where(eq(syncLogs.tenantId, tenantId))
      .orderBy(desc(syncLogs.createdAt))
      .limit(20);

    const statsRows = await db.select().from(syncStats).where(eq(syncStats.tenantId, tenantId));

    return {
      devices: { total: deviceCount[0]?.count || 0, active: activeDeviceCount[0]?.count || 0 },
      logs24h: last24hLogs[0]?.count || 0,
      failed24h: failedLogs[0]?.count || 0,
      avgDurationMs: Math.round(avgDuration[0]?.avg || 0),
      recentLogs,
      stats: statsRows,
    };
  }),
});
