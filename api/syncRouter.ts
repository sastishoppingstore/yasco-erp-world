import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, gte, inArray, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const SYNCABLE_TABLES = [
  "products", "customers", "suppliers", "invoices", "invoiceItems",
  "sales", "saleItems", "purchases", "purchaseItems",
  "payments", "tasks", "meetings",
] as const;

const tableMap: Record<string, any> = {
  products: schema.products,
  customers: schema.customers,
  suppliers: schema.suppliers,
  invoices: schema.invoices,
  invoiceItems: schema.invoiceItems,
  sales: schema.sales,
  saleItems: schema.saleItems,
  purchases: schema.purchases,
  purchaseItems: schema.purchaseItems,
  payments: schema.payments,
  tasks: schema.tasks,
  meetings: schema.meetings,
};

function generateUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const syncRouter = createRouter({
  // Register device
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
        where: eq(schema.deviceRegistrations.deviceId, input.deviceId),
      });
      if (existing) {
        await db.update(schema.deviceRegistrations)
          .set({
            lastSeen: new Date(),
            deviceName: input.deviceName || existing.deviceName,
            platform: input.platform || existing.platform,
            appVersion: input.appVersion || existing.appVersion,
            lastSyncAt: new Date(),
          })
          .where(eq(schema.deviceRegistrations.deviceId, input.deviceId));
        return { deviceId: input.deviceId, registered: true, message: "Device updated" };
      }
      await db.insert(schema.deviceRegistrations).values({
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
      await db.insert(schema.auditLogs).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        action: "device_registered",
        entityType: "device",
        entityId: input.deviceId,
        newValue: JSON.stringify({ deviceName: input.deviceName, platform: input.platform }),
        ipAddress: ctx.req?.header("x-forwarded-for") || ctx.req?.header("x-real-ip") || "",
      });
      return { deviceId: input.deviceId, registered: true, message: "Device registered" };
    }),

  // Pull changes from server
  pull: authedQuery
    .input(z.object({
      since: z.string().optional(),
      entityTypes: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const sinceDate = input.since || new Date(0).toISOString();
      const types = input.entityTypes || [...SYNCABLE_TABLES];
      const result: Record<string, any[]> = {};
      const deletedResult: Record<string, any[]> = {};

      for (const type of types) {
        const tbl = tableMap[type];
        if (!tbl) continue;
        try {
          const records = await db.select().from(tbl).where(
            and(
              eq(tbl.tenantId, tenantId),
              gte(tbl.updatedAt || tbl.createdAt, new Date(sinceDate)),
            ),
          );
          result[type] = records.map((r: any) => ({
            ...r,
            local_uuid: r.localUuid || r.id,
            sync_status: "synced",
          }));
        } catch (e) {
          result[type] = [];
        }
      }

      // Get deleted records (tombstones)
      const tombstones = await db.select().from(schema.deletedRecordsTombstone)
        .where(and(
          eq(schema.deletedRecordsTombstone.tenantId, tenantId),
          gte(schema.deletedRecordsTombstone.deletedAt, new Date(sinceDate)),
        ));

      return {
        data: result,
        tombstones,
        serverTime: new Date().toISOString(),
      };
    }),

  // Push changes to server
  push: authedQuery
    .input(z.object({
      changes: z.array(z.object({
        entityType: z.string(),
        entityId: z.string(),
        action: z.enum(["create", "update", "delete"]),
        payload: z.any(),
        deviceId: z.string().optional(),
        localUuid: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const results: any[] = [];
      const conflicts: any[] = [];

      for (const change of input.changes) {
        try {
          const tbl = tableMap[change.entityType];
          if (!tbl) {
            results.push({ entityId: change.entityId, status: "failed", error: "Unknown entity type" });
            continue;
          }

          const payload = change.payload || {};
          const localUuid = change.localUuid || change.entityId;

          if (change.action === "create") {
            const insertData = {
              ...payload,
              tenantId,
              localUuid,
              updatedAt: new Date(),
            };
            delete insertData.id;
            delete insertData.serverId;
            const [inserted] = await db.insert(tbl).values(insertData);
            const serverId = Number(inserted.insertId);
            results.push({
              entityId: change.entityId,
              localUuid,
              serverId,
              status: "synced",
              action: "create",
            });
            await db.insert(schema.auditLogs).values({
              tenantId,
              userId: ctx.user.id,
              action: "sync_create",
              entityType: change.entityType,
              entityId: String(serverId),
              newValue: JSON.stringify(payload),
            });
          } else if (change.action === "update") {
            // Check for conflict
            const existing = await db.select().from(tbl).where(
              and(eq(tbl.tenantId, tenantId), eq(tbl.localUuid, localUuid))
            ).limit(1);

            if (existing.length > 0) {
              const current = existing[0];
              const clientVersion = payload.version || 0;
              const serverVersion = current.version || 0;

              if (clientVersion < serverVersion) {
                // Conflict detected
                conflicts.push({
                  entityType: change.entityType,
                  entityId: change.entityId,
                  localUuid,
                  serverVersion: current,
                  clientVersion: payload,
                  message: "Version conflict: server has newer version",
                });
                results.push({
                  entityId: change.entityId,
                  localUuid,
                  status: "conflict",
                  serverVersion: current,
                });
                continue;
              }

              const updateData = {
                ...payload,
                tenantId,
                updatedAt: new Date(),
                version: serverVersion + 1,
              };
              delete updateData.id;
              delete updateData.serverId;
              delete updateData.localUuid;
              delete updateData.createdAt;

              await db.update(tbl)
                .set(updateData)
                .where(and(eq(tbl.tenantId, tenantId), eq(tbl.localUuid, localUuid)));

              results.push({
                entityId: change.entityId,
                localUuid,
                serverId: current.serverId || current.id,
                status: "synced",
                action: "update",
              });
            }
          } else if (change.action === "delete") {
            const existing = await db.select().from(tbl).where(
              and(eq(tbl.tenantId, tenantId), eq(tbl.localUuid, localUuid))
            ).limit(1);

            if (existing.length > 0) {
              await db.update(tbl)
                .set({ deletedAt: new Date(), updatedAt: new Date() })
                .where(and(eq(tbl.tenantId, tenantId), eq(tbl.localUuid, localUuid)));

              await db.insert(schema.deletedRecordsTombstone).values({
                entityType: change.entityType,
                entityId: localUuid,
                serverId: existing[0].serverId || existing[0].id,
                tenantId,
                deletedAt: new Date(),
              });

              results.push({
                entityId: change.entityId,
                localUuid,
                status: "synced",
                action: "delete",
              });
            }
          }
        } catch (error: any) {
          results.push({
            entityId: change.entityId,
            status: "failed",
            error: error.message,
          });
        }
      }

      // Update device last sync time
      if (input.changes.length > 0 && input.changes[0].deviceId) {
        await db.update(schema.deviceRegistrations)
          .set({ lastSyncAt: new Date(), lastSeen: new Date() })
          .where(eq(schema.deviceRegistrations.deviceId, input.changes[0].deviceId!));
      }

      return { results, conflicts, serverTime: new Date().toISOString() };
    }),

  // Resolve conflict
  resolveConflict: authedQuery
    .input(z.object({
      entityType: z.string(),
      localUuid: z.string(),
      resolution: z.enum(["keep_local", "keep_server", "merge"]),
      mergedPayload: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tbl = tableMap[input.entityType];
      if (!tbl) throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown entity type" });

      const existing = await db.select().from(tbl).where(
        and(eq(tbl.tenantId, ctx.user.tenantId!), eq(tbl.localUuid, input.localUuid))
      ).limit(1);

      if (existing.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });

      if (input.resolution === "keep_local") {
        // Local version already in DB, just update version
        await db.update(tbl)
          .set({ version: sql`version + 1`, updatedAt: new Date() })
          .where(eq(tbl.localUuid, input.localUuid));
      } else if (input.resolution === "keep_server") {
        // Server version stays, nothing to do
      } else if (input.resolution === "merge" && input.mergedPayload) {
        await db.update(tbl)
          .set({ ...input.mergedPayload, updatedAt: new Date(), version: sql`version + 1` })
          .where(eq(tbl.localUuid, input.localUuid));
      }

      await db.insert(schema.auditLogs).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        action: "sync_conflict_resolved",
        entityType: input.entityType,
        entityId: input.localUuid,
        newValue: JSON.stringify({ resolution: input.resolution, mergedPayload: input.mergedPayload }),
      });

      return { success: true, message: `Conflict resolved: ${input.resolution}` };
    }),

  // Sync status
  status: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const devices = await db.select().from(schema.deviceRegistrations)
      .where(eq(schema.deviceRegistrations.tenantId, tenantId));
    return {
      devices,
      serverTime: new Date().toISOString(),
    };
  }),

  // Sync logs
  logs: authedQuery
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const items = await db.select().from(schema.syncLogs)
        .where(eq(schema.syncLogs.tenantId, tenantId))
        .orderBy(desc(schema.syncLogs.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
      const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(schema.syncLogs)
        .where(eq(schema.syncLogs.tenantId, tenantId));
      return { items, total: totalResult?.total || 0 };
    }),

  // List registered devices
  listDevices: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return await db.select().from(schema.deviceRegistrations)
      .where(eq(schema.deviceRegistrations.tenantId, ctx.user.tenantId!))
      .orderBy(desc(schema.deviceRegistrations.lastSeen));
  }),

  // Deactivate device
  deactivateDevice: authedQuery
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(schema.deviceRegistrations)
        .set({ isActive: false })
        .where(and(
          eq(schema.deviceRegistrations.deviceId, input.deviceId),
          eq(schema.deviceRegistrations.tenantId, ctx.user.tenantId!),
        ));
      return { success: true };
    }),
});
