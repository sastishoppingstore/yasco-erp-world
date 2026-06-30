import { createQueue, createWorker, QUEUES } from "./config";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { and, lte, eq } from "drizzle-orm";

const queue = createQueue(QUEUES.cleanup.name, { attempts: 1 });

export type CleanupJobData = {
  type: "log-rotation" | "temp-files" | "orphaned-uploads";
  olderThanDays?: number;
};

async function processCleanup(job: { data: CleanupJobData }): Promise<{ removed: number }> {
  const { type, olderThanDays = 30 } = job.data;
  const db = getDb();
  let removed = 0;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffStr = cutoffDate.toISOString();

    switch (type) {
      case "log-rotation": {
        const result = await db.delete(schema.auditLogs)
          .where(lte(schema.auditLogs.createdAt, cutoffStr));
        removed = result.rowCount || 0;
        break;
      }
      case "temp-files": {
        const result = await db.delete(schema.notifications)
          .where(and(
            eq(schema.notifications.isRead, true),
            lte(schema.notifications.createdAt, cutoffStr),
          ));
        removed = result.rowCount || 0;
        break;
      }
      case "orphaned-uploads": {
        removed = 0;
        break;
      }
    }
  } catch (error: any) {
    console.error(`[cleanup] ${type} failed:`, error.message);
    throw error;
  }

  return { removed };
}

const worker = createWorker<CleanupJobData>(QUEUES.cleanup.name, processCleanup, {
  concurrency: QUEUES.cleanup.concurrency,
});

worker.on("completed", (job) => {
  console.log(`[cleanup] job ${job.id} completed (${job.data.type}): ${job.returnvalue?.removed} items`);
});

worker.on("failed", (job, err) => {
  console.error(`[cleanup] job ${job?.id} failed:`, err.message);
});

export async function scheduleCleanupJob(data: CleanupJobData): Promise<void> {
  await queue.add("log-rotation", data);
}

export { queue as cleanupQueue, worker as cleanupWorker };
