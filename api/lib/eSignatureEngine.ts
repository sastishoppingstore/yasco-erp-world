import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc } from "drizzle-orm";
import crypto from "node:crypto";

/**
 * E-Signature Engine
 *
 * Provides electronic signature capabilities for approvals, contracts,
 * and HR documents within the YASCO ERP system.
 *
 * === Saudi E-Transactions Law Compatibility ===
 * This engine implements basic electronic signature capture and verification.
 * However, for full legal compliance with the Saudi Electronic Transactions
 * Law (issued by Royal Decree No. M/18, 1428H), you MUST:
 * 1. Integrate with a licensed Saudi PKI/Certificate Authority (e.g., NCA-approved CA)
 * 2. Use qualified electronic signatures (QES) for legally binding contracts
 * 3. Ensure audit trails meet the retention requirements (minimum 10 years)
 * 4. Validate signer identity through national ID (Iqama/National ID) verification
 * 5. Consider integrating with Saudi e-signature platforms like "Nafith" or "Yakeen"
 *    for additional identity verification. This engine provides the basic framework
 *    but should be augmented with CA-issued digital certificates for enforceability.
 */

export interface SignatureCapture {
  type: "draw" | "type" | "upload" | "biometric";
  data: string;
  hash?: string;
}

export interface SignatureRequestResult {
  id: number;
  status: string;
  signatureUrl?: string;
}

export class ESignatureEngine {
  async createRequest(tenantId: number, data: {
    documentId: number; requestedBy: number;
    signerId?: number; signerEmail?: string; signerName?: string;
    signatureType?: string; message?: string; expiresAt?: string;
  }): Promise<SignatureRequestResult> {
    const db = getDb();
    const [req] = await db.insert(schema.eSignatureRequests).values({
      tenantId, documentId: data.documentId,
      requestedBy: data.requestedBy,
      signerId: data.signerId, signerEmail: data.signerEmail,
      signerName: data.signerName,
      signatureType: (data.signatureType as any) ?? "draw",
      status: "pending", message: data.message,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }).$returningId();

    await db.insert(schema.eSignatureLogs).values({
      tenantId, signatureRequestId: req.id,
      eventType: "created",
      metadata: JSON.stringify({ requestedBy: data.requestedBy, method: data.signatureType ?? "draw" }),
    });

    return { id: req.id, status: "pending" };
  }

  async sign(tenantId: number, requestId: number, signature: SignatureCapture): Promise<{ success: boolean; hash: string }> {
    const db = getDb();
    const [req] = await db.select().from(schema.eSignatureRequests).where(
      and(eq(schema.eSignatureRequests.id, requestId), eq(schema.eSignatureRequests.tenantId, tenantId)),
    ).limit(1);
    if (!req) throw new Error("Signature request not found");
    if (req.status !== "pending") throw new Error(`Signature request is ${req.status}`);

    const signatureHash = this.hashSignature(signature.data);
    const certificateInfo = null;

    await db.update(schema.eSignatureRequests).set({
      status: "signed", signedAt: new Date(),
      ipAddress: undefined, userAgent: undefined,
    }).where(eq(schema.eSignatureRequests.id, requestId));

    await db.insert(schema.eSignatureLogs).values({
      tenantId, signatureRequestId: requestId,
      eventType: "signed",
      signatureData: JSON.stringify({ type: signature.type, dataPreview: signature.data.substring(0, 100) }),
      signatureHash,
      certificateInfo: certificateInfo ? JSON.stringify(certificateInfo) : null,
      metadata: JSON.stringify({ signatureType: signature.type }),
    });

    return { success: true, hash: signatureHash };
  }

  async decline(tenantId: number, requestId: number, reason?: string): Promise<{ success: boolean }> {
    const db = getDb();
    const [req] = await db.select().from(schema.eSignatureRequests).where(
      and(eq(schema.eSignatureRequests.id, requestId), eq(schema.eSignatureRequests.tenantId, tenantId)),
    ).limit(1);
    if (!req) throw new Error("Signature request not found");

    await db.update(schema.eSignatureRequests).set({
      status: "declined", declinedAt: new Date(), declineReason: reason,
    }).where(eq(schema.eSignatureRequests.id, requestId));

    await db.insert(schema.eSignatureLogs).values({
      tenantId, signatureRequestId: requestId,
      eventType: "declined",
      metadata: JSON.stringify({ reason }),
    });

    return { success: true };
  }

  async verify(tenantId: number, requestId: number): Promise<{ valid: boolean; details: any }> {
    const db = getDb();
    const [req] = await db.select().from(schema.eSignatureRequests).where(
      and(eq(schema.eSignatureRequests.id, requestId), eq(schema.eSignatureRequests.tenantId, tenantId)),
    ).limit(1);
    if (!req) throw new Error("Signature request not found");

    const logs = await db.select().from(schema.eSignatureLogs).where(
      and(eq(schema.eSignatureLogs.signatureRequestId, requestId), eq(schema.eSignatureLogs.eventType, "signed")),
    ).limit(1);

    await db.insert(schema.eSignatureLogs).values({
      tenantId, signatureRequestId: requestId,
      eventType: "verified",
      metadata: JSON.stringify({ verifiedAt: new Date().toISOString(), valid: logs.length > 0 }),
    });

    return {
      valid: req.status === "signed" && logs.length > 0,
      details: {
        status: req.status,
        signedAt: req.signedAt,
        signerName: req.signerName,
        hasSignatureHash: logs.length > 0 ? !!logs[0].signatureHash : false,
      },
    };
  }

  hashSignature(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  async getAuditTrail(tenantId: number, requestId: number) {
    const db = getDb();
    const logs = await db.select().from(schema.eSignatureLogs).where(
      and(eq(schema.eSignatureLogs.signatureRequestId, requestId), eq(schema.eSignatureLogs.tenantId, tenantId)),
    ).orderBy(asc(schema.eSignatureLogs.createdAt));
    return logs.map(l => ({
      event: l.eventType, timestamp: l.createdAt,
      metadata: l.metadata ? JSON.parse(typeof l.metadata === "string" ? l.metadata : JSON.stringify(l.metadata)) : null,
      signatureHash: l.signatureHash,
      ipAddress: l.ipAddress,
    }));
  }

  async getSignatureImage(requestId: number): Promise<string | null> {
    const db = getDb();
    const [log] = await db.select().from(schema.eSignatureLogs).where(
      and(eq(schema.eSignatureLogs.signatureRequestId, requestId), eq(schema.eSignatureLogs.eventType, "signed")),
    ).orderBy(desc(schema.eSignatureLogs.createdAt)).limit(1);
    if (!log?.signatureData) return null;
    const data = typeof log.signatureData === "string" ? JSON.parse(log.signatureData) : log.signatureData;
    return data?.dataPreview ?? null;
  }
}

export const eSignatureEngine = new ESignatureEngine();
