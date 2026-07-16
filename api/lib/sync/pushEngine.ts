import { z } from "zod";
import { getDb } from "../../queries/connection";
import { syncLogs, deviceRegistrations, syncQueue, syncStats } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { DeltaSyncEngine, SyncChange, generateUuid } from "./deltaSyncEngine";

const pushChangeSchema = z.object({
  entityType: z.string(),
  entityId: z.union([z.string(), z.number()]),
  action: z.enum(["create", "update", "delete"]),
  payload: z.record(z.any()),
  version: z.number().default(1),
  deviceId: z.string().optional(),
  localUuid: z.string().optional(),
  timestamp: z.string().optional(),
});

const batchPushSchema = z.object({
  tenantId: z.number(),
  userId: z.number().optional(),
  deviceId: z.string().optional(),
  changes: z.array(pushChangeSchema),
  batchId: z.string().optional(),
});

export type BatchPushInput = z.infer<typeof batchPushSchema>;

export class PushEngine {
  private db: ReturnType<typeof getDb>;
  private deltaEngine: DeltaSyncEngine;

  constructor() {
    this.db = getDb();
    this.deltaEngine = new DeltaSyncEngine();
  }

  async pushChanges(input: BatchPushInput): Promise<{
    results: Array<{ entityId: string | number; status: string; error?: string; serverId?: number }>;
    conflicts: any[];
    batchId: string;
  }> {
    const batchId = input.batchId || generateUuid();
    const startTime = Date.now();
    const tenantId = input.tenantId;
    const conflicts: any[] = [];
    const results: Array<{ entityId: string | number; status: string; error?: string; serverId?: number }> = [];

    try {
      const changes: SyncChange[] = input.changes.map(c => ({
        entityType: c.entityType,
        entityId: c.entityId,
        action: c.action,
        payload: c.payload,
        version: c.version || 1,
        deviceId: c.deviceId || input.deviceId,
        localUuid: c.localUuid || String(c.entityId),
        timestamp: c.timestamp || new Date().toISOString(),
      }));

      const { conflicts: detectedConflicts, cleanChanges } = await this.deltaEngine.detectConflicts(changes, tenantId);

      conflicts.push(...detectedConflicts.map(c => ({
        entityType: c.entityType,
        entityId: c.entityId,
        localUuid: c.localUuid,
        serverVersion: c.serverVersion,
        clientVersion: c.clientVersion,
        isFinancialEntry: c.isFinancialEntry,
        message: c.isFinancialEntry
          ? "Financial entry conflict — requires human review"
          : "Version conflict detected",
      })));

      const { applied, failed } = await this.deltaEngine.applyChanges(cleanChanges, tenantId);

      for (const change of cleanChanges) {
        results.push({ entityId: change.entityId, status: "synced" });
      }
      for (const fail of failed) {
        results.push({ entityId: fail.entityId, status: "failed", error: fail.error });
      }

      if (input.deviceId) {
        await this.db.update(deviceRegistrations)
          .set({ lastSyncAt: new Date(), lastSeen: new Date() })
          .where(eq(deviceRegistrations.deviceId, input.deviceId));
      }

      await this.updateSyncStats(tenantId, input.deviceId, "push", applied, failed.length, conflicts.length, Date.now() - startTime);

      for (const change of changes) {
        await this.db.insert(syncLogs).values({
          tenantId,
          direction: "push",
          entityType: change.entityType,
          entityId: String(change.entityId),
          action: change.action,
          status: change.action === "delete" ? "synced" : "synced",
          batchId,
          durationMs: Date.now() - startTime,
        });
      }

      return { results, conflicts, batchId };
    } catch (error: any) {
      return {
        results: input.changes.map(c => ({ entityId: c.entityId, status: "failed", error: error.message })),
        conflicts: [],
        batchId,
      };
    }
  }

  private async updateSyncStats(
    tenantId: number,
    deviceId: string | undefined,
    direction: "push" | "pull",
    successCount: number,
    failCount: number,
    conflictCount: number,
    durationMs: number,
  ) {
    try {
      const existing = await this.db.query.syncStats.findFirst({
        where: and(
          eq(syncStats.tenantId, tenantId),
          deviceId ? eq(syncStats.deviceId, deviceId) : sql`1=1`,
        ),
      });

      if (existing) {
        await this.db.update(syncStats)
          .set({
            totalPushes: sql`${syncStats.totalPushes} + ${direction === "push" ? 1 : 0}`,
            totalPulls: sql`${syncStats.totalPulls} + ${direction === "pull" ? 1 : 0}`,
            successfulPushes: sql`${syncStats.successfulPushes} + ${direction === "push" ? successCount : 0}`,
            failedPushes: sql`${syncStats.failedPushes} + ${direction === "push" ? failCount : 0}`,
            successfulPulls: sql`${syncStats.successfulPulls} + ${direction === "pull" ? successCount : 0}`,
            failedPulls: sql`${syncStats.failedPulls} + ${direction === "pull" ? failCount : 0}`,
            conflictsResolved: sql`${syncStats.conflictsResolved} + ${conflictCount}`,
            lastSyncAt: new Date(),
            avgSyncDurationMs: sql`(${syncStats.avgSyncDurationMs} + ${durationMs}) / 2`,
          })
          .where(eq(syncStats.id, existing.id));
      } else {
        await this.db.insert(syncStats).values({
          tenantId,
          deviceId: deviceId || "unknown",
          totalPushes: direction === "push" ? 1 : 0,
          totalPulls: direction === "pull" ? 1 : 0,
          successfulPushes: direction === "push" ? successCount : 0,
          failedPushes: direction === "push" ? failCount : 0,
          successfulPulls: direction === "pull" ? successCount : 0,
          failedPulls: direction === "pull" ? failCount : 0,
          conflictsPending: conflictCount,
          lastSyncAt: new Date(),
          avgSyncDurationMs: durationMs,
        });
      }
    } catch {
      // Stats update is best-effort
    }
  }
}

export const pushEngine = new PushEngine();
