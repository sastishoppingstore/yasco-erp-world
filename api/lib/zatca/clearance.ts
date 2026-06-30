import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../queries/connection";
import {
  invoices,
  zatcaApiLogs,
  zatcaCredentials,
  zatcaInvoiceStatus,
  zatcaXmlDocuments,
} from "@db/schema";

export type SubmissionMode = "clearance" | "reporting";
export type SubmissionStatus = "pending" | "submitted" | "cleared" | "reported" | "rejected" | "failed";
export type SyncQueueStatus = "queued" | "processing" | "success" | "failed";

export interface SubmissionResult {
  status: SubmissionStatus;
  zatcaRequestId?: string;
  zatcaResponseId?: string;
  clearedXml?: string;
  warnings?: string[];
  errorMessage?: string;
  httpStatus?: number;
  rawResponse?: Record<string, unknown>;
}

export interface SyncQueueItem {
  id: number;
  tenantId: number;
  invoiceId: number;
  mode: SubmissionMode;
  status: SyncQueueStatus;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date;
  lastError?: string;
}

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 60_000;
const RETRY_BACKOFF_FACTOR = 2;

function endpointFor(action: "clearance" | "reporting", environment: "sandbox" | "production"): string {
  const base = environment === "production"
    ? "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
    : "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal";
  return action === "clearance"
    ? `${base}/invoices/clearance/single`
    : `${base}/invoices/reporting/single`;
}

async function getCredential(tenantId: number, environment: "sandbox" | "production") {
  const db = getDb();
  return db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, tenantId),
      eq(zatcaCredentials.environment, environment),
      eq(zatcaCredentials.isActive, true),
    ),
  });
}

async function logApiCall(params: {
  tenantId: number;
  invoiceId: number;
  action: string;
  environment: string;
  endpoint?: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  httpStatus?: number;
  status: string;
  errorMessage?: string;
  userId?: number;
}) {
  const db = getDb();
  await db.insert(zatcaApiLogs).values({
    tenantId: params.tenantId,
    invoiceId: params.invoiceId,
    action: params.action as any,
    environment: params.environment as any,
    endpoint: params.endpoint,
    requestPayload: params.requestPayload,
    responsePayload: params.responsePayload,
    httpStatus: params.httpStatus,
    status: params.status as any,
    errorMessage: params.errorMessage,
    userId: params.userId,
    createdAt: new Date(),
  });
}

function decryptSecret(value?: string | null): string {
  if (!value) return "";
  const { createDecipheriv, createHash } = require("node:crypto");
  const { env } = require("../env");
  const key = createHash("sha256").update(env.appSecret || process.env.ENCRYPTION_KEY || "development-only-encryption-key").digest();
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) return "";
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export async function submitInvoice(params: {
  tenantId: number;
  invoiceId: number;
  mode: SubmissionMode;
  environment: "sandbox" | "production";
  userId?: number;
}): Promise<SubmissionResult> {
  const db = getDb();

  const xmlDoc = await db.query.zatcaXmlDocuments.findFirst({
    where: and(
      eq(zatcaXmlDocuments.tenantId, params.tenantId),
      eq(zatcaXmlDocuments.invoiceId, params.invoiceId),
    ),
    orderBy: desc(zatcaXmlDocuments.createdAt),
  });

  if (!xmlDoc?.signedXml) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invoice must be signed before submission",
    });
  }

  const statusRow = await db.query.zatcaInvoiceStatus.findFirst({
    where: and(
      eq(zatcaInvoiceStatus.tenantId, params.tenantId),
      eq(zatcaInvoiceStatus.invoiceId, params.invoiceId),
    ),
  });

  const credential = await getCredential(params.tenantId, params.environment);

  const endpoint = endpointFor(params.mode, params.environment);
  const accessToken = decryptSecret(credential?.accessTokenEncrypted);
  const secretToken = decryptSecret(credential?.secretTokenEncrypted);

  const invoiceBase64 = Buffer.from(xmlDoc.signedXml).toString("base64");
  const payload = {
    invoice: invoiceBase64,
    invoiceHash: xmlDoc.xmlHash,
    uuid: statusRow?.invoiceUuid,
  };

  const hasLiveCredential = Boolean(accessToken && secretToken);

  if (!hasLiveCredential) {
    await logApiCall({
      tenantId: params.tenantId,
      invoiceId: params.invoiceId,
      action: params.mode,
      environment: params.environment,
      endpoint,
      requestPayload: payload,
      responsePayload: { readiness: true, message: "ZATCA credentials not configured" },
      status: "pending",
      userId: params.userId,
    });

    return {
      status: "pending",
      rawResponse: { readiness: true, message: "ZATCA credentials not configured" },
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${accessToken}:${secretToken}`).toString("base64")}`,
        "Accept-Version": "V2",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json().catch(() => ({ text: "Non-JSON response" })) as Record<string, unknown>;

    await logApiCall({
      tenantId: params.tenantId,
      invoiceId: params.invoiceId,
      action: params.mode,
      environment: params.environment,
      endpoint,
      requestPayload: payload,
      responsePayload: responseData,
      httpStatus: res.status,
      status: res.ok ? "success" : "failed",
      errorMessage: res.ok ? undefined : JSON.stringify(responseData),
      userId: params.userId,
    });

    if (res.ok) {
      const zatcaStatus: SubmissionStatus = params.mode === "clearance" ? "cleared" : "reported";
      const updateData: Record<string, unknown> = {
        status: zatcaStatus,
        zatcaRequestId: (responseData.requestId as string) || (responseData.requestID as string),
        zatcaResponseId: (responseData.responseId as string) || (responseData.responseID as string),
        clearanceStatus: params.mode === "clearance" ? String(responseData.status || "cleared") : undefined,
        reportingStatus: params.mode === "reporting" ? String(responseData.status || "reported") : undefined,
        warnings: responseData.warnings ? JSON.stringify(responseData.warnings) : undefined,
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      if (params.mode === "clearance") {
        updateData.clearedAt = new Date();
      } else {
        updateData.reportedAt = new Date();
      }

      if (statusRow) {
        await db.update(zatcaInvoiceStatus)
          .set(updateData)
          .where(eq(zatcaInvoiceStatus.id, statusRow.id));
      }

      const clearedXml = responseData.clearedInvoice as string | undefined;
      if (clearedXml && params.mode === "clearance" && xmlDoc) {
        await db.update(zatcaXmlDocuments)
          .set({ clearedXml })
          .where(eq(zatcaXmlDocuments.id, xmlDoc.id));

        await db.update(invoices)
          .set({ zatcaXml: clearedXml, zatcaStatus: "cleared" })
          .where(and(eq(invoices.id, params.invoiceId), eq(invoices.tenantId, params.tenantId)));
      }

      return {
        status: zatcaStatus,
        zatcaRequestId: updateData.zatcaRequestId as string | undefined,
        zatcaResponseId: updateData.zatcaResponseId as string | undefined,
        clearedXml: clearedXml,
        warnings: responseData.warnings as string[] | undefined,
        httpStatus: res.status,
        rawResponse: responseData,
      };
    }

    if (statusRow) {
      await db.update(zatcaInvoiceStatus)
        .set({
          status: "failed",
          errorCode: String(responseData.code || responseData.errorCode || ""),
          errorMessage: JSON.stringify(responseData),
          updatedAt: new Date(),
        })
        .where(eq(zatcaInvoiceStatus.id, statusRow.id));
    }

    return {
      status: "rejected",
      errorMessage: JSON.stringify(responseData),
      httpStatus: res.status,
      rawResponse: responseData,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "ZATCA API call failed";

    await logApiCall({
      tenantId: params.tenantId,
      invoiceId: params.invoiceId,
      action: params.mode,
      environment: params.environment,
      endpoint,
      requestPayload: payload,
      responsePayload: { error: errorMessage },
      status: "failed",
      errorMessage,
      userId: params.userId,
    });

    return {
      status: "failed",
      errorMessage,
      rawResponse: { error: errorMessage },
    };
  }
}

export async function retryFailedSubmission(params: {
  tenantId: number;
  invoiceId: number;
  environment: "sandbox" | "production";
  userId?: number;
}): Promise<SubmissionResult> {
  const db = getDb();
  const statusRow = await db.query.zatcaInvoiceStatus.findFirst({
    where: and(
      eq(zatcaInvoiceStatus.tenantId, params.tenantId),
      eq(zatcaInvoiceStatus.invoiceId, params.invoiceId),
    ),
  });

  if (!statusRow) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Invoice status not found" });
  }

  if (statusRow.status === "cleared" || statusRow.status === "reported") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice already submitted successfully" });
  }

  const invoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, params.invoiceId), eq(invoices.tenantId, params.tenantId)),
  });

  const mode: SubmissionMode = invoice?.invoiceType === "simplified" ? "reporting" : "clearance";

  return submitInvoice({
    tenantId: params.tenantId,
    invoiceId: params.invoiceId,
    mode,
    environment: params.environment,
    userId: params.userId,
  });
}

export async function submitBatchInvoices(params: {
  tenantId: number;
  invoiceIds: number[];
  environment: "sandbox" | "production";
  userId?: number;
}): Promise<Array<{ invoiceId: number; result: SubmissionResult }>> {
  const results: Array<{ invoiceId: number; result: SubmissionResult }> = [];

  for (const invoiceId of params.invoiceIds) {
    try {
      const invoice = await getDb().query.invoices.findFirst({
        where: and(eq(invoices.id, invoiceId), eq(invoices.tenantId, params.tenantId)),
      });

      const mode: SubmissionMode = invoice?.invoiceType === "simplified" ? "reporting" : "clearance";

      const result = await submitInvoice({
        tenantId: params.tenantId,
        invoiceId,
        mode,
        environment: params.environment,
        userId: params.userId,
      });

      results.push({ invoiceId, result });
    } catch (error) {
      results.push({
        invoiceId,
        result: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Batch submission error",
        },
      });
    }
  }

  return results;
}

export async function getPendingSyncQueue(tenantId: number): Promise<Array<{ invoiceId: number; mode: SubmissionMode; attempts: number }>> {
  const db = getDb();

  const pendingStatuses = await db.select()
    .from(zatcaInvoiceStatus)
    .where(and(
      eq(zatcaInvoiceStatus.tenantId, tenantId),
      eq(zatcaInvoiceStatus.status, "failed"),
    ));

  const pendingIds = pendingStatuses.map((s) => s.invoiceId);
  if (pendingIds.length === 0) return [];

  const invoiceRecords = await db.select({ id: invoices.id, invoiceType: invoices.invoiceType })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId)));

  const invoiceMap = new Map(invoiceRecords.map((i) => [i.id, i]));

  return pendingStatuses.map((s) => ({
    invoiceId: s.invoiceId,
    mode: (invoiceMap.get(s.invoiceId)?.invoiceType === "simplified" ? "reporting" : "clearance") as SubmissionMode,
    attempts: 0,
  }));
}

export async function processPendingQueue(tenantId: number, environment: "sandbox" | "production"): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{ invoiceId: number; status: SubmissionStatus }>;
}> {
  const queue = await getPendingSyncQueue(tenantId);
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  const results: Array<{ invoiceId: number; status: SubmissionStatus }> = [];

  for (const item of queue) {
    processed++;
    try {
      const result = await retryFailedSubmission({
        tenantId,
        invoiceId: item.invoiceId,
        environment,
      });

      results.push({ invoiceId: item.invoiceId, status: result.status });

      if (result.status === "cleared" || result.status === "reported") {
        succeeded++;
      } else {
        failed++;
      }
    } catch {
      failed++;
      results.push({ invoiceId: item.invoiceId, status: "failed" });
    }
  }

  return { processed, succeeded, failed, results };
}
