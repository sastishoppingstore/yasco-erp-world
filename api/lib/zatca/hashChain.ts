import { createHash } from "node:crypto";
import { getDb } from "../../queries/connection";
import { and, eq, desc, isNull, sql } from "drizzle-orm";
import { zatcaInvoiceStatus } from "@db/schema";

export const EMPTY_HASH = createHash("sha256").update("").digest("base64");

function sha256Base64(xml: string): string {
  return createHash("sha256").update(xml, "utf-8").digest("base64");
}

function canonicalize(xml: string): string {
  return xml.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/>\s+</g, "><").trim();
}

export function computeInvoiceXmlHash(xml: string): string {
  return sha256Base64(canonicalize(xml));
}

export function computePih(previousInvoiceHash: string | null, currentInvoiceHash: string): string {
  const prev = previousInvoiceHash || EMPTY_HASH;
  return sha256Base64(prev + currentInvoiceHash);
}

export async function getLastInvoiceHash(tenantId: number): Promise<string | null> {
  const db = getDb();
  const last = await db.query.zatcaInvoiceStatus.findFirst({
    where: and(eq(zatcaInvoiceStatus.tenantId, tenantId)),
    orderBy: desc(zatcaInvoiceStatus.invoiceCounter),
  });
  if (!last?.invoiceHash) return null;
  return last.invoiceHash;
}

export async function getOrCreatePihChain(tenantId: number): Promise<{
  previousInvoiceHash: string;
  invoiceCounter: number;
}> {
  const db = getDb();
  const lastStatus = await db.query.zatcaInvoiceStatus.findFirst({
    where: and(eq(zatcaInvoiceStatus.tenantId, tenantId)),
    orderBy: desc(zatcaInvoiceStatus.invoiceCounter),
  });

  const previousInvoiceHash = lastStatus?.invoiceHash || EMPTY_HASH;
  const invoiceCounter = (lastStatus?.invoiceCounter || 0) + 1;

  return { previousInvoiceHash, invoiceCounter };
}

export async function recordInvoiceHash(
  tenantId: number,
  invoiceId: number,
  invoiceHash: string,
  previousInvoiceHash: string,
  invoiceCounter: number,
  uuid: string,
): Promise<void> {
  const db = getDb();
  await db.insert(zatcaInvoiceStatus).values({
    tenantId,
    invoiceId,
    invoiceHash,
    previousInvoiceHash,
    invoiceCounter,
    uuid,
    status: "pending",
  } as any);
}
