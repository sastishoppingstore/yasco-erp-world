import { createQueue, createWorker, QUEUES } from "./config";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

const queue = createQueue(QUEUES.export.name, { attempts: 1 });

export type ExportJobData = {
  entity: string;
  tenantId: number;
  userId: number;
  format: "csv" | "xlsx";
  filters?: Record<string, any>;
};

const ENTITY_TABLE_MAP: Record<string, any> = {
  customers: schema.customers,
  suppliers: schema.suppliers,
  products: schema.products,
  invoices: schema.invoices,
  purchaseOrders: schema.purchaseOrders,
  employees: schema.employees,
  journalEntries: schema.journalEntries,
};

async function processExport(job: { data: ExportJobData }): Promise<{ url?: string; records: number }> {
  const { entity, tenantId, format, filters } = job.data;
  const db = getDb();

  const table = ENTITY_TABLE_MAP[entity];
  if (!table) throw new Error(`Unknown entity: ${entity}`);

  try {
    let query = db.select().from(table).where(eq(table.tenantId, tenantId)) as any;

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && table[key]) {
          query = query.where(eq(table[key], value));
        }
      }
    }

    const rows = await query.limit(10000);

    const { generateExportFile } = await import("../lib/exportGenerator");
    const url = await generateExportFile(rows, entity, format);

    return { url, records: rows.length };
  } catch (error: any) {
    console.error(`[export] Failed to export ${entity}:`, error.message);
    throw error;
  }
}

const worker = createWorker<ExportJobData>(QUEUES.export.name, processExport, {
  concurrency: QUEUES.export.concurrency,
});

worker.on("completed", (job) => {
  console.log(`[export] job ${job.id} completed (${job.data.entity})`);
});

worker.on("failed", (job, err) => {
  console.error(`[export] job ${job?.id} failed:`, err.message);
});

export async function exportDataJob(data: ExportJobData): Promise<void> {
  await queue.add("data-export", data);
}

export { queue as exportQueue, worker as exportWorker };
