import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../queries/connection";
import {
  invoices,
  zatcaInvoiceStatus,
  zatcaXmlDocuments,
  zatcaQrCodes,
  zatcaActivityLogs,
  zatcaApiLogs,
} from "@db/schema";
import { EMPTY_HASH, computePih } from "./hashChain";

const ZATCA_RETENTION_YEARS = 6;

export interface ArchiveEntry {
  id: number;
  tenantId: number;
  invoiceId: number;
  invoiceNumber: string;
  invoiceUuid: string;
  invoiceHash: string;
  previousInvoiceHash: string;
  chainHash: string;
  signedXml: string;
  clearedXml?: string;
  qrPayload?: string;
  digitalSignature?: string;
  status: string;
  submittedAt?: Date;
  createdAt: Date;
  archiveHash: string;
}

export interface ArchiveManifest {
  id: string;
  tenantId: number;
  exportedAt: Date;
  entryCount: number;
  startDate: string;
  endDate: string;
  totalArchiveHash: string;
  entries: string[];
}

export interface ArchiveVerificationResult {
  manifestHash: string;
  totalEntries: number;
  intactEntries: number;
  tamperedEntries: number;
  brokenChainLinks: number;
  details: Array<{
    invoiceId: number;
    invoiceNumber: string;
    status: "intact" | "tampered" | "broken_chain";
    error?: string;
  }>;
}

function sha256Base64(value: string): string {
  return createHash("sha256").update(value).digest("base64");
}

export async function archiveInvoice(params: {
  tenantId: number;
  invoiceId: number;
}): Promise<ArchiveEntry> {
  const db = getDb();

  const invoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, params.invoiceId), eq(invoices.tenantId, params.tenantId)),
  });

  if (!invoice) throw new Error(`Invoice ${params.invoiceId} not found`);

  const statusRow = await db.query.zatcaInvoiceStatus.findFirst({
    where: and(
      eq(zatcaInvoiceStatus.tenantId, params.tenantId),
      eq(zatcaInvoiceStatus.invoiceId, params.invoiceId),
    ),
  });

  const xmlDoc = await db.query.zatcaXmlDocuments.findFirst({
    where: and(
      eq(zatcaXmlDocuments.tenantId, params.tenantId),
      eq(zatcaXmlDocuments.invoiceId, params.invoiceId),
    ),
    orderBy: desc(zatcaXmlDocuments.createdAt),
  });

  const qrCode = await db.query.zatcaQrCodes.findFirst({
    where: and(
      eq(zatcaQrCodes.tenantId, params.tenantId),
      eq(zatcaQrCodes.invoiceId, params.invoiceId),
    ),
    orderBy: desc(zatcaQrCodes.createdAt),
  });

  const invoiceHash = statusRow?.invoiceHash || sha256Base64(xmlDoc?.signedXml || xmlDoc?.unsignedXml || "");
  const previousInvoiceHash = statusRow?.previousInvoiceHash || EMPTY_HASH;
  const chainHash = computePih(previousInvoiceHash, invoiceHash);

  const archiveContent = [
    invoice.invoiceNumber,
    statusRow?.invoiceUuid || "",
    invoiceHash,
    previousInvoiceHash,
    xmlDoc?.signedXml || xmlDoc?.unsignedXml || "",
    qrCode?.tlvBase64 || "",
    statusRow?.digitalSignature || "",
    invoice.date,
  ].join("|");

  const archiveHash = sha256Base64(archiveContent);

  if (xmlDoc) {
    await db.update(zatcaXmlDocuments)
      .set({ isArchived: true })
      .where(eq(zatcaXmlDocuments.id, xmlDoc.id));
  }

  return {
    id: 0,
    tenantId: params.tenantId,
    invoiceId: params.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    invoiceUuid: statusRow?.invoiceUuid || "",
    invoiceHash,
    previousInvoiceHash,
    chainHash,
    signedXml: xmlDoc?.signedXml || xmlDoc?.unsignedXml || "",
    clearedXml: xmlDoc?.clearedXml || undefined,
    qrPayload: qrCode?.tlvBase64 || undefined,
    digitalSignature: statusRow?.digitalSignature || undefined,
    status: statusRow?.status || invoice.zatcaStatus || "draft",
    submittedAt: statusRow?.submittedAt || undefined,
    createdAt: new Date(),
    archiveHash,
  };
}

export async function createArchiveManifest(params: {
  tenantId: number;
  startDate?: string;
  endDate?: string;
}): Promise<ArchiveManifest> {
  const db = getDb();

  const conditions = [eq(zatcaInvoiceStatus.tenantId, params.tenantId)];

  if (params.startDate) {
    conditions.push(sql`${zatcaInvoiceStatus.createdAt} >= ${new Date(params.startDate)}`);
  }
  if (params.endDate) {
    conditions.push(sql`${zatcaInvoiceStatus.createdAt} <= ${new Date(params.endDate)}`);
  }

  const statusRows = await db.select()
    .from(zatcaInvoiceStatus)
    .where(and(...conditions))
    .orderBy(zatcaInvoiceStatus.invoiceCounter);

  const entryHashes: string[] = [];
  let previousHash = EMPTY_HASH;

  for (const row of statusRows) {
    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, row.invoiceId), eq(invoices.tenantId, params.tenantId)),
    });

    const content = [
      invoice?.invoiceNumber || "",
      row.invoiceUuid || "",
      row.invoiceHash || "",
      previousHash,
      row.digitalSignature || "",
    ].join("|");

    const entryHash = sha256Base64(content);
    entryHashes.push(entryHash);
    previousHash = entryHash;
  }

  const totalArchiveHash = sha256Base64(entryHashes.join(":"));

  return {
    id: randomUUID(),
    tenantId: params.tenantId,
    exportedAt: new Date(),
    entryCount: entryHashes.length,
    startDate: params.startDate || "beginning",
    endDate: params.endDate || "present",
    totalArchiveHash,
    entries: entryHashes,
  };
}

export async function verifyArchiveIntegrity(
  tenantId: number,
  manifest?: ArchiveManifest,
): Promise<ArchiveVerificationResult> {
  const db = getDb();

  const statusRows = await db.select()
    .from(zatcaInvoiceStatus)
    .where(eq(zatcaInvoiceStatus.tenantId, tenantId))
    .orderBy(zatcaInvoiceStatus.invoiceCounter);

  const details: ArchiveVerificationResult["details"] = [];
  let intactEntries = 0;
  let tamperedEntries = 0;
  let brokenChainLinks = 0;
  let previousHash = EMPTY_HASH;

  for (const row of statusRows) {
    const invoice = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, row.invoiceId), eq(invoices.tenantId, params.tenantId)),
    });

    const invoiceNumber = invoice?.invoiceNumber || "";
    const invoiceHash = row.invoiceHash || "";
    const pih = row.previousInvoiceHash || EMPTY_HASH;

    if (pih !== previousHash) {
      brokenChainLinks++;
      details.push({
        invoiceId: row.invoiceId,
        invoiceNumber,
        status: "broken_chain",
        error: `Expected PIH ${previousHash}, found ${pih}`,
      });
      tamperedEntries++;
      continue;
    }

    const expectedChainHash = computePih(previousHash, invoiceHash);
    previousHash = invoiceHash;

    const xmlDoc = await db.query.zatcaXmlDocuments.findFirst({
      where: and(
        eq(zatcaXmlDocuments.tenantId, params.tenantId),
        eq(zatcaXmlDocuments.invoiceId, row.invoiceId),
      ),
      orderBy: desc(zatcaXmlDocuments.createdAt),
    });

    if (xmlDoc) {
      const actualHash = sha256Base64(xmlDoc.signedXml || xmlDoc.unsignedXml || "");
      if (actualHash !== invoiceHash) {
        tamperedEntries++;
        details.push({
          invoiceId: row.invoiceId,
          invoiceNumber,
          status: "tampered",
          error: `XML content hash mismatch: expected ${invoiceHash}, found ${actualHash}`,
        });
        continue;
      }
    }

    intactEntries++;
    details.push({
      invoiceId: row.invoiceId,
      invoiceNumber,
      status: "intact",
    });
  }

  const entryHashes = statusRows.map((r) => r.invoiceHash || "").join(":");
  const manifestHash = sha256Base64(entryHashes);

  if (manifest) {
    const computedManifestHash = manifest.totalArchiveHash;
    if (manifestHash !== computedManifestHash) {
      details.push({
        invoiceId: 0,
        invoiceNumber: "MANIFEST",
        status: "tampered",
        error: "Manifest hash mismatch",
      });
      tamperedEntries++;
    }
  }

  return {
    manifestHash,
    totalEntries: statusRows.length,
    intactEntries,
    tamperedEntries,
    brokenChainLinks,
    details,
  };
}

export async function exportArchive(params: {
  tenantId: number;
  startDate?: string;
  endDate?: string;
}): Promise<{ manifest: ArchiveManifest; entries: ArchiveEntry[] }> {
  const db = getDb();

  const conditions = [eq(zatcaInvoiceStatus.tenantId, params.tenantId)];

  if (params.startDate) {
    conditions.push(sql`${zatcaInvoiceStatus.createdAt} >= ${new Date(params.startDate)}`);
  }
  if (params.endDate) {
    conditions.push(sql`${zatcaInvoiceStatus.createdAt} <= ${new Date(params.endDate)}`);
  }

  const statusRows = await db.select()
    .from(zatcaInvoiceStatus)
    .where(and(...conditions))
    .orderBy(zatcaInvoiceStatus.invoiceCounter);

  const entries: ArchiveEntry[] = [];

  for (const row of statusRows) {
    const entry = await archiveInvoice({
      tenantId: params.tenantId,
      invoiceId: row.invoiceId,
    });
    entries.push(entry);
  }

  const manifest = await createArchiveManifest({
    tenantId: params.tenantId,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return { manifest, entries };
}

export function generateArchiveFileName(tenantId: number): string {
  const date = new Date().toISOString().split("T")[0];
  return `zatca_archive_tenant_${tenantId}_${date}.json`;
}

export function serializeArchive(manifest: ArchiveManifest, entries: ArchiveEntry[]): string {
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() + ZATCA_RETENTION_YEARS);

  const archive = {
    manifest,
    entries: entries.map((e) => ({
      invoiceId: e.invoiceId,
      invoiceNumber: e.invoiceNumber,
      invoiceUuid: e.invoiceUuid,
      invoiceHash: e.invoiceHash,
      previousInvoiceHash: e.previousInvoiceHash,
      chainHash: e.chainHash,
      status: e.status,
      submittedAt: e.submittedAt?.toISOString(),
      archivedAt: e.createdAt.toISOString(),
      archiveHash: e.archiveHash,
    })),
    exportedAt: new Date().toISOString(),
    archiveVersion: "2.0",
    format: "ZATCA Phase 2 Archive",
    retentionYears: ZATCA_RETENTION_YEARS,
    retentionExpiry: retentionDate.toISOString(),
  };

  return JSON.stringify(archive, null, 2);
}
