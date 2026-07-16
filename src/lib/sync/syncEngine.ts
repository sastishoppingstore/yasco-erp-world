import { connectionDetector } from "./connectionDetector";
import db, { getLocalDb } from "@/lib/db/localDatabase";
import { getDeviceId } from "@/lib/sync/offlineStorage";

class SyncEngine {
  private syncing = false;
  private lastSyncAt: string | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];
  private _status: SyncStatus = {
    state: "unknown",
    pendingCount: 0,
    failedCount: 0,
    lastSyncAt: null,
  };

  constructor() {
    this.loadStatus();
    connectionDetector.onChange((online) => {
      if (online) {
        this._status.state = "online";
        this.notify();
        this.sync();
      } else {
        this._status.state = "offline";
        this.notify();
      }
    });
    window.setInterval(() => {
      if (connectionDetector.isOnline()) {
        this.sync();
      }
    }, 60_000);
  }

  private async loadStatus() {
    await getLocalDb();
    this.lastSyncAt = localStorage.getItem("last_sync_at");
    const pending = await db.syncQueue.where("status").equals("pending").count();
    const failed = await db.syncQueue.where("status").equals("failed").count();
    this._status = {
      state: connectionDetector.isOnline() ? "online" : "offline",
      pendingCount: pending,
      failedCount: failed,
      lastSyncAt: this.lastSyncAt,
    };
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l(this._status));
  }

  get status() {
    return this._status;
  }

  onChange(cb: (status: SyncStatus) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  async sync() {
    if (this.syncing) return;
    if (!connectionDetector.isOnline()) {
      console.log("[Sync] Offline, skipping sync");
      return;
    }

    this.syncing = true;
    this._status.state = "syncing";
    this.notify();

    try {
      // 1. Push pending local changes
      await this.pushChanges();

      // 2. Pull server changes
      await this.pullChanges();

      // 3. Update status
      this.lastSyncAt = new Date().toISOString();
      localStorage.setItem("last_sync_at", this.lastSyncAt);

      const pending = await db.syncQueue.where("status").equals("pending").count();
      const failed = await db.syncQueue.where("status").equals("failed").count();

      this._status = {
        state: connectionDetector.isOnline() ? "online" : "offline",
        pendingCount: pending,
        failedCount: failed,
        lastSyncAt: this.lastSyncAt,
        lastSyncError: undefined,
      };
    } catch (err: any) {
      this._status = {
        ...this._status,
        state: "sync_failed",
        lastSyncError: err.message,
      };
      console.error("[Sync] Sync failed:", err);
    } finally {
      this.syncing = false;
      this.notify();
    }
  }

  private async pushChanges() {
    const { trpcClient } = await import("@/providers/trpc");
    const pendingItems = await db.syncQueue
      .where("status")
      .anyOf("pending", "failed")
      .toArray();

    if (pendingItems.length === 0) return;

    for (const item of pendingItems) {
      try {
        await db.syncQueue.put({ ...item, status: "syncing", updatedAt: new Date().toISOString() } as any);
      } catch {}
    }

    try {
      const changes = pendingItems.map((item) => ({
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action as "create" | "update" | "delete",
        payload: item.payloadJson ? JSON.parse(item.payloadJson) : {},
        deviceId: getDeviceId(),
        localUuid: item.entityId,
      }));

      const result = await (trpcClient as any).sync.push.mutate({ changes });

      for (const res of result.results) {
        const queueItem = pendingItems.find((p) => p.entityId === res.entityId);
        if (!queueItem || !queueItem.id) continue;

        if (res.status === "synced") {
          await db.syncQueue.put({
            ...queueItem,
            status: "synced",
            syncedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any);

          // Update local record sync status
          await updateLocalSyncStatus(queueItem.entityType, queueItem.entityId, "synced", res.serverId);
        } else if (res.status === "conflict") {
          await db.syncQueue.put({
            ...queueItem,
            status: "conflict",
            errorMessage: res.message || "Version conflict",
            payloadJson: JSON.stringify({ ...JSON.parse(queueItem.payloadJson || "{}"), serverVersion: res.serverVersion }),
            updatedAt: new Date().toISOString(),
          } as any);
          await updateLocalSyncStatus(queueItem.entityType, queueItem.entityId, "conflict");
        } else {
          await db.syncQueue.put({
            ...queueItem,
            status: "failed",
            retryCount: (queueItem.retryCount || 0) + 1,
            errorMessage: res.error || "Unknown error",
            updatedAt: new Date().toISOString(),
          } as any);
          await updateLocalSyncStatus(queueItem.entityType, queueItem.entityId, "failed");
        }

        // Log
        await db.syncLogs.add({
          direction: "push",
          entityType: queueItem.entityType,
          entityId: queueItem.entityId,
          action: queueItem.action,
          status: res.status,
          message: res.error || res.message || "",
          createdAt: new Date().toISOString(),
        });
      }

      if (result.conflicts?.length) {
        for (const conflict of result.conflicts) {
          await db.syncLogs.add({
            direction: "push",
            entityType: conflict.entityType,
            entityId: conflict.entityId,
            action: "conflict",
            status: "conflict",
            message: `Version conflict: ${conflict.message}`,
            detailsJson: JSON.stringify(conflict),
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      // Mark all as failed
      for (const item of pendingItems) {
        if (!item.id) continue;
        await db.syncQueue.put({
          ...item,
          status: "failed",
          retryCount: (item.retryCount || 0) + 1,
          errorMessage: err.message,
          updatedAt: new Date().toISOString(),
        } as any);
        await db.syncLogs.add({
          direction: "push",
          entityType: item.entityType,
          entityId: item.entityId,
          action: item.action,
          status: "failed",
          message: err.message,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  private async pullChanges() {
    const { trpcClient } = await import("@/providers/trpc");
    const since = this.lastSyncAt || undefined;

    try {
      const result = await ((trpcClient as any).sync.pull.query({ since }) as Promise<any>);

      if (result?.data) {
        for (const [entityType, records] of Object.entries(result.data) as [string, any[]][]) {
          for (const record of records) {
            await saveServerRecordToLocal(entityType, record);
          }
        }
      }

      // Handle tombstones
      if (result?.tombstones) {
        for (const tombstone of result.tombstones) {
          await deleteLocalRecord(tombstone.entityType, tombstone.entityId);
        }
      }

      await db.syncLogs.add({
        direction: "pull",
        status: "synced",
        message: `Pulled changes since ${since || "beginning"}`,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      await db.syncLogs.add({
        direction: "pull",
        status: "failed",
        message: err.message,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async retryFailedItem(id: number) {
    const item = await db.syncQueue.get(id);
    if (!item) return;
    await db.syncQueue.put({ ...item, status: "pending", updatedAt: new Date().toISOString() } as any);
    this.sync();
  }

  async retryAllFailed() {
    const failed = await db.syncQueue.where("status").equals("failed").toArray();
    for (const item of failed) {
      await db.syncQueue.put({ ...item, status: "pending", updatedAt: new Date().toISOString() } as any);
    }
    this.sync();
  }

  async getStats() {
    const pending = await db.syncQueue.where("status").equals("pending").count();
    const syncing = await db.syncQueue.where("status").equals("syncing").count();
    const failed = await db.syncQueue.where("status").equals("failed").count();
    const conflicted = await db.syncQueue.where("status").equals("conflict").count();
    const synced = await db.syncQueue.where("status").equals("synced").count();
    return { pending, syncing, failed, conflicted, synced };
  }
}

async function updateLocalSyncStatus(entityType: string, entityId: string, status: string, serverId?: number) {
  const tableMap: Record<string, any> = {
    products: db.products,
    customers: db.customers,
    suppliers: db.suppliers,
    invoices: db.invoices,
    sales: db.sales,
    purchases: db.purchases,
    payments: db.payments,
    tasks: db.tasks,
    meetings: db.meetings,
  };
  const table = tableMap[entityType];
  if (!table) return;
  const record = await table.get(entityId);
  if (record) {
    record.syncStatus = status;
    record.lastSyncedAt = new Date().toISOString();
    if (serverId) record.serverId = serverId;
    await table.put(record);
  }
}

async function saveServerRecordToLocal(entityType: string, record: any) {
  const tableMap: Record<string, any> = {
    products: db.products,
    customers: db.customers,
    suppliers: db.suppliers,
    invoices: db.invoices,
    sales: db.sales,
    purchases: db.purchases,
    payments: db.payments,
    tasks: db.tasks,
    meetings: db.meetings,
  };
  const table = tableMap[entityType];
  if (!table) return;

  const localUuid = record.localUuid || record.local_uuid || `server-${record.id}`;
  const existing = await table.get(localUuid);

  const localRecord = {
    localUuid,
    serverId: record.id || record.serverId,
    tenantId: record.tenantId,
    syncStatus: "synced",
    lastSyncedAt: new Date().toISOString(),
    ...record,
  };
  delete localRecord.local_uuid;
  delete localRecord.id;

  if (existing) {
    if (!existing.deletedAt) {
      await table.put(localRecord);
    }
  } else {
    await table.add(localRecord);
  }
}

async function deleteLocalRecord(entityType: string, entityId: string) {
  const tableMap: Record<string, any> = {
    products: db.products,
    customers: db.customers,
    suppliers: db.suppliers,
    invoices: db.invoices,
    sales: db.sales,
    purchases: db.purchases,
    payments: db.payments,
    tasks: db.tasks,
    meetings: db.meetings,
  };
  const table = tableMap[entityType];
  if (!table) return;
  const record = await table.get(entityId);
  if (record) {
    record.deletedAt = new Date().toISOString();
    record.syncStatus = "synced";
    await table.put(record);
  }
}

export interface SyncStatus {
  state: "online" | "offline" | "syncing" | "sync_failed" | "unknown";
  pendingCount: number;
  failedCount: number;
  lastSyncAt: string | null;
  lastSyncError?: string;
}

export const syncEngine = new SyncEngine();
(window as any).__syncEngine = syncEngine;
