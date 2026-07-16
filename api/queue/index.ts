export { createQueue, createWorker, createQueueEvents, QUEUES } from "./config";
export type { QueueName, QueueDefinition } from "./config";
export type { EmailJobData } from "./email.queue";
export type { TaxJobData } from "./tax.queue";
export type { ReportJobData } from "./report.queue";
export type { ExportJobData } from "./export.queue";
export type { BackupJobData } from "./backup.queue";
export type { MaintenanceJobData } from "./maintenance.queue";
export type { CleanupJobData } from "./cleanup.queue";

export { emailQueue, sendEmailJob } from "./email.queue";
export { taxQueue, submitTaxJob } from "./tax.queue";
export { reportQueue, generateReportJob } from "./report.queue";
export { exportQueue, exportDataJob } from "./export.queue";
export { backupQueue, scheduleBackupJob } from "./backup.queue";
export { maintenanceQueue, scheduleMaintenanceJob } from "./maintenance.queue";
export { cleanupQueue, scheduleCleanupJob } from "./cleanup.queue";

import { isRedisReady } from "../lib/redis";
import { emailWorker } from "./email.queue";
import { taxWorker } from "./tax.queue";
import { reportWorker } from "./report.queue";
import { exportWorker } from "./export.queue";
import { backupWorker } from "./backup.queue";
import { maintenanceWorker } from "./maintenance.queue";
import { cleanupWorker } from "./cleanup.queue";

const workers = [emailWorker, taxWorker, reportWorker, exportWorker, backupWorker, maintenanceWorker, cleanupWorker];

export function startAllWorkers(): void {
  if (!isRedisReady()) {
    console.warn("[queue] Redis not available — workers not started");
    return;
  }
  console.log(`[queue] ${workers.length} workers registered (awaiting jobs)`);
}

export async function closeAllWorkers(): Promise<void> {
  for (const w of workers) {
    try { await w.close(); } catch { /* ignore */ }
  }
}
