import { createQueue, createWorker, QUEUES } from "./config";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { eq, and, lte } from "drizzle-orm";

const queue = createQueue(QUEUES.maintenance.name, { attempts: 1 });

export type MaintenanceJobData = {
  type: "depreciation-calc" | "overdue-check" | "eosb-accrual" | "gosi-recalc";
  tenantId?: number;
};

async function processMaintenance(job: { data: MaintenanceJobData }): Promise<{ processed: number }> {
  const { type, tenantId } = job.data;
  const db = getDb();
  let processed = 0;

  try {
    switch (type) {
      case "depreciation-calc": {
        const assets = await db.query.assets.findMany({
          where: tenantId ? eq(schema.assets.tenantId, tenantId) : undefined,
        });
        for (const asset of assets) {
          if (asset.status === "active" && asset.usefulLife && asset.purchasePrice) {
            const monthlyDep = Number(asset.purchasePrice) / (Number(asset.usefulLife) * 12);
            await db.insert(schema.depreciationEntries).values({
              tenantId: asset.tenantId,
              assetId: asset.id,
              period: new Date().toISOString().slice(0, 7),
              amount: monthlyDep.toFixed(2),
              method: "straight-line",
            });
            processed++;
          }
        }
        break;
      }
      case "overdue-check": {
        const today = new Date().toISOString().slice(0, 10);
        const overdueInvoices = await db.query.invoices.findMany({
          where: and(
            eq(schema.invoices.status, "overdue"),
            lte(schema.invoices.dueDate, today),
          ),
        });
        processed = overdueInvoices.length;
        break;
      }
      case "eosb-accrual": {
        const employees = await db.query.employees.findMany({
          where: and(
            tenantId ? eq(schema.employees.tenantId, tenantId) : undefined,
            eq(schema.employees.isActive, true),
          ),
        });
        processed = employees.length;
        break;
      }
      case "gosi-recalc": {
        const employees = await db.query.employees.findMany({
          where: and(
            tenantId ? eq(schema.employees.tenantId, tenantId) : undefined,
            eq(schema.employees.isActive, true),
          ),
        });
        processed = employees.length;
        break;
      }
    }
  } catch (error: any) {
    console.error(`[maintenance] ${type} failed:`, error.message);
    throw error;
  }

  return { processed };
}

const worker = createWorker<MaintenanceJobData>(QUEUES.maintenance.name, processMaintenance, {
  concurrency: QUEUES.maintenance.concurrency,
});

worker.on("completed", (job) => {
  console.log(`[maintenance] job ${job.id} completed (${job.data.type})`);
});

worker.on("failed", (job, err) => {
  console.error(`[maintenance] job ${job?.id} failed:`, err.message);
});

export async function scheduleMaintenanceJob(data: MaintenanceJobData): Promise<void> {
  await queue.add(data.type, data);
}

export { queue as maintenanceQueue, worker as maintenanceWorker };
