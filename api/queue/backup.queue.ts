import { createQueue, createWorker, QUEUES } from "./config";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

const queue = createQueue(QUEUES.backup.name, { attempts: 2, backoff: { type: "exponential", delay: 60000 } });

export type BackupJobData = {
  tenantId?: number;
  type: "full" | "tenant" | "files";
};

async function processBackup(job: { data: BackupJobData }): Promise<{ backupId: string; size?: number }> {
  const { tenantId, type } = job.data;
  const db = getDb();
  const backupId = `backup_${type}_${Date.now()}`;

  try {
    const { createBackup } = await import("../lib/backupEngine");
    const result = await createBackup({ tenantId, type });
    return { backupId: result.backupId, size: result.size };
  } catch (error: any) {
    console.error(`[backup] Backup failed:`, error.message);
    throw error;
  }
}

const worker = createWorker<BackupJobData>(QUEUES.backup.name, processBackup, {
  concurrency: QUEUES.backup.concurrency,
});

worker.on("completed", (job) => {
  console.log(`[backup] job ${job.id} completed (${job.data.type})`);
});

worker.on("failed", (job, err) => {
  console.error(`[backup] job ${job?.id} failed:`, err.message);
});

export async function scheduleBackupJob(data: BackupJobData): Promise<void> {
  await queue.add("tenant-backup", data);
}

export { queue as backupQueue, worker as backupWorker };
