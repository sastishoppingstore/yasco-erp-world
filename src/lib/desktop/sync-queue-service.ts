import { db, SyncQueueItem, OfflineDailyReport } from './dexie-schema';
import { v4 as uuidv4 } from 'uuid';

export interface SyncConflictResolution {
  strategy: 'manual' | 'serverWins' | 'clientWins' | 'merge';
  mergeStrategy?: (local: any, remote: any) => any;
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsFailed: number;
  conflicts: number;
  errors: Array<{ itemId: string; error: string }>;
}

/**
 * Service for managing offline sync queue and conflict resolution
 */
export class SyncQueueService {
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 5000;
  private isSyncing = false;

  /**
   * Add item to sync queue
   */
  async enqueueItem(
    entityType: SyncQueueItem['entityType'],
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    payload: any
  ): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    await db.syncQueue.add({
      id,
      entityType,
      entityId,
      operation,
      payload,
      attemptCount: 0,
      maxAttempts: this.maxRetries,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Get pending items for sync
   */
  async getPendingItems(
    limit: number = 50
  ): Promise<SyncQueueItem[]> {
    return db.syncQueue
      .where('status')
      .equals('pending')
      .limit(limit)
      .toArray();
  }

  /**
   * Update item status
   */
  async updateItemStatus(
    id: string,
    status: SyncQueueItem['status'],
    errorMessage?: string
  ): Promise<void> {
    const now = new Date();
    const nextAttemptAt = new Date(now.getTime() + this.retryDelayMs);

    await db.syncQueue.update(id, {
      status,
      updatedAt: now,
      lastAttemptAt: now,
      nextAttemptAt: status === 'failed' ? nextAttemptAt : undefined,
      errorMessage,
    });
  }

  /**
   * Increment retry attempt count
   */
  async incrementAttemptCount(id: string): Promise<void> {
    const item = await db.syncQueue.get(id);
    if (!item) return;

    const attemptCount = item.attemptCount + 1;
    const status = attemptCount >= item.maxAttempts ? 'failed' : 'pending';

    await db.syncQueue.update(id, {
      attemptCount,
      status,
    });
  }

  /**
   * Process sync conflicts with resolution
   */
  async resolveConflict(
    conflictId: string,
    resolution: SyncConflictResolution
  ): Promise<void> {
    const conflict = await db.syncConflicts.get(conflictId);
    if (!conflict) throw new Error(`Conflict not found: ${conflictId}`);

    let resolvedData: any;

    switch (resolution.strategy) {
      case 'serverWins':
        resolvedData = conflict.remoteVersion;
        break;

      case 'clientWins':
        resolvedData = conflict.localVersion;
        break;

      case 'merge':
        if (!resolution.mergeStrategy) {
          throw new Error('Merge strategy function required for merge resolution');
        }
        resolvedData = resolution.mergeStrategy(
          conflict.localVersion,
          conflict.remoteVersion
        );
        break;

      case 'manual':
        // Manual resolution requires external decision
        break;

      default:
        throw new Error(`Unknown resolution strategy: ${resolution.strategy}`);
    }

    const now = new Date();
    await db.syncConflicts.update(conflictId, {
      resolution: resolution.strategy,
      resolvedAt: now,
      localVersion: resolvedData, // Store resolved version
    });

    // Re-queue the item for sync
    if (resolvedData) {
      const queueItem = await db.syncQueue.get(conflict.entityId);
      if (queueItem) {
        await db.syncQueue.update(queueItem.id, {
          payload: resolvedData,
          status: 'pending',
          attemptCount: 0,
        });
      }
    }
  }

  /**
   * Detect conflicts between local and remote versions
   */
  async detectConflict(
    entityType: SyncQueueItem['entityType'],
    entityId: string,
    localVersion: any,
    remoteVersion: any
  ): Promise<boolean> {
    // Simple conflict detection: if both modified after the same time
    const localUpdated = localVersion.updatedAt || localVersion.createdAt;
    const remoteUpdated = remoteVersion.updatedAt || remoteVersion.createdAt;

    if (!localUpdated || !remoteUpdated) return false;

    const localTime = new Date(localUpdated).getTime();
    const remoteTime = new Date(remoteUpdated).getTime();

    // Conflict exists if both modified in overlapping time window
    const timeWindow = 30000; // 30 seconds
    return Math.abs(localTime - remoteTime) < timeWindow &&
           JSON.stringify(localVersion) !== JSON.stringify(remoteVersion);
  }

  /**
   * Record a conflict for manual resolution
   */
  async recordConflict(
    entityType: SyncQueueItem['entityType'],
    entityId: string,
    localVersion: any,
    remoteVersion: any,
    conflictType: 'updateUpdate' | 'deleteUpdate' | 'updateDelete'
  ): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    await db.syncConflicts.add({
      id,
      entityType,
      entityId,
      localVersion,
      remoteVersion,
      conflictType,
      detectedAt: now,
    });

    // Mark the queue item as having a conflict
    const queueItem = await db.syncQueue.get(entityId);
    if (queueItem) {
      await db.syncQueue.update(queueItem.id, {
        status: 'conflict',
        conflictResolution: 'manual',
      });
    }

    return id;
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts() {
    return db.syncConflicts
      .where('resolvedAt')
      .equals(undefined)
      .toArray();
  }

  /**
   * Merge daily reports (custom merge logic)
   */
  private mergeDailyReports(
    local: OfflineDailyReport,
    remote: OfflineDailyReport
  ): OfflineDailyReport {
    return {
      ...remote, // Start with remote (server) version
      // Override with local for user-visible fields
      workProgress: local.workProgress || remote.workProgress,
      qualityScore: Math.max(local.qualityScore, remote.qualityScore),
      tasksCompleted: [
        ...new Set([...local.tasksCompleted, ...remote.tasksCompleted])
      ],
      // Keep local media references
      photoIds: local.photoIds,
      videoIds: local.videoIds,
      voiceNoteIds: local.voiceNoteIds,
      updatedAt: new Date(),
    };
  }

  /**
   * Perform a sync cycle
   */
  async performSync(
    syncFn: (items: SyncQueueItem[]) => Promise<{
      succeeded: SyncQueueItem[];
      failed: Array<{ item: SyncQueueItem; error: string; remote?: any }>;
    }>
  ): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsFailed: 0,
        conflicts: 0,
        errors: [{ itemId: 'system', error: 'Sync already in progress' }],
      };
    }

    this.isSyncing = true;
    const errors: Array<{ itemId: string; error: string }> = [];
    let conflicts = 0;

    try {
      const pendingItems = await this.getPendingItems();
      if (pendingItems.length === 0) {
        return {
          success: true,
          itemsProcessed: 0,
          itemsFailed: 0,
          conflicts: 0,
          errors: [],
        };
      }

      // Call the sync function with pending items
      const { succeeded, failed } = await syncFn(pendingItems);

      // Update succeeded items
      for (const item of succeeded) {
        await this.updateItemStatus(item.id, 'synced');
      }

      // Handle failed items
      for (const { item, error, remote } of failed) {
        // Check if it's a conflict
        if (remote && await this.detectConflict(item.entityType, item.entityId, item.payload, remote)) {
          await this.recordConflict(
            item.entityType,
            item.entityId,
            item.payload,
            remote,
            'updateUpdate'
          );
          conflicts++;
        } else {
          // Regular failure
          await this.incrementAttemptCount(item.id);
          if (item.attemptCount + 1 >= this.maxRetries) {
            await this.updateItemStatus(item.id, 'failed', error);
          }
          errors.push({ itemId: item.id, error });
        }
      }

      return {
        success: errors.length === 0 && conflicts === 0,
        itemsProcessed: succeeded.length,
        itemsFailed: failed.length,
        conflicts,
        errors,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get sync queue statistics
   */
  async getQueueStats() {
    const [pending, syncing, synced, failed, conflict] = await Promise.all([
      db.syncQueue.where('status').equals('pending').count(),
      db.syncQueue.where('status').equals('syncing').count(),
      db.syncQueue.where('status').equals('synced').count(),
      db.syncQueue.where('status').equals('failed').count(),
      db.syncQueue.where('status').equals('conflict').count(),
    ]);

    return { pending, syncing, synced, failed, conflict };
  }

  /**
   * Clear old synced items (older than 30 days)
   */
  async clearOldSyncedItems(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const itemsToDelete = await db.syncQueue
      .where('status')
      .equals('synced')
      .filter(item => item.updatedAt < cutoffDate)
      .toArray();

    const ids = itemsToDelete.map(item => item.id);
    await db.syncQueue.bulkDelete(ids);

    return ids.length;
  }
}

/**
 * Global sync queue service instance
 */
export const syncQueueService = new SyncQueueService();
