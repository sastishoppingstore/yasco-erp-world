import { createQueue, createWorker, QUEUES } from "./config";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

const queue = createQueue(QUEUES.report.name, { attempts: 2, backoff: { type: "fixed", delay: 60000 } });

export type ReportJobData = {
  type: "pdf" | "xlsx" | "csv";
  reportId: number;
  tenantId: number;
  userId: number;
  params?: Record<string, any>;
};

async function processReport(job: { data: ReportJobData }): Promise<{ url?: string; message: string }> {
  const { type, reportId, tenantId, params } = job.data;
  const db = getDb();

  try {
    if (type === "pdf") {
      const { generatePdfReport } = await import("../lib/reportPdfGenerator");
      const url = await generatePdfReport(tenantId, reportId, params);
      return { url, message: `Report #${reportId} generated as PDF` };
    }

    if (type === "xlsx" || type === "csv") {
      const { generateSpreadsheetReport } = await import("../lib/reportSpreadsheetGenerator");
      const url = await generateSpreadsheetReport(tenantId, reportId, type, params);
      return { url, message: `Report #${reportId} generated as ${type.toUpperCase()}` };
    }

    return { message: `Report #${reportId} generated as ${type.toUpperCase()}` };
  } catch (error: any) {
    console.error(`[report] Failed to generate report #${reportId}:`, error.message);
    throw error;
  }
}

const worker = createWorker<ReportJobData>(QUEUES.report.name, processReport, {
  concurrency: QUEUES.report.concurrency,
});

worker.on("completed", (job) => {
  console.log(`[report] job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[report] job ${job?.id} failed:`, err.message);
});

export async function generateReportJob(data: ReportJobData): Promise<void> {
  await queue.add("generate-report", data);
}

export { queue as reportQueue, worker as reportWorker };
