import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { biometricConsentRecords, biometricAccessLogs, biometricTemplates, pdplDataSubjectRequests } from "@db/schema";
import { env } from "./env";

const ENCRYPTION_KEY = createHash("sha256")
  .update(env.appSecret || process.env.ENCRYPTION_KEY || "pdpl-biometric-encryption-key")
  .digest();

function aesEncrypt(plaintext: string): { encrypted: string; iv: string; tag: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

function aesDecrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function hashTemplate(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export interface BiometricConsentInput {
  tenantId: number;
  employeeId: number;
  consentType: "face" | "fingerprint" | "voice" | "gps_location" | "all";
  ipAddress?: string;
  userAgent?: string;
}

export async function recordConsent(input: BiometricConsentInput) {
  const db = getDb();
  await db.insert(biometricConsentRecords).values({
    tenantId: input.tenantId,
    employeeId: input.employeeId,
    consentType: input.consentType,
    isConsented: true,
    consentDate: new Date(),
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    lawfulBasis: "explicit_consent",
    purposeDescription: "Biometric attendance tracking and identity verification per Saudi PDPL requirements",
    retentionPeriodDays: 90,
  } as any);
}

export async function revokeConsent(tenantId: number, employeeId: number, consentType: string) {
  const db = getDb();
  await db
    .update(biometricConsentRecords)
    .set({ isConsented: false as any, revokedAt: new Date() })
    .where(
      and(
        eq(biometricConsentRecords.tenantId, tenantId),
        eq(biometricConsentRecords.employeeId, employeeId),
        eq(biometricConsentRecords.consentType, consentType as any),
      ),
    );
}

export async function storeBiometricTemplate(
  tenantId: number,
  employeeId: number,
  templateType: "face" | "fingerprint" | "voice",
  rawTemplateData: string,
  deviceId?: string,
) {
  const db = getDb();
  const templateHash = hashTemplate(rawTemplateData);
  const { encrypted, iv, tag } = aesEncrypt(rawTemplateData);
  await db.insert(biometricTemplates).values({
    tenantId,
    employeeId,
    templateType,
    templateHash,
    templateDataEncrypted: encrypted,
    encryptionIv: iv,
    encryptionTag: tag,
    deviceId: deviceId || null,
    isActive: true,
    enrolledAt: new Date(),
  } as any);
}

export async function deleteBiometricData(tenantId: number, employeeId: number) {
  const db = getDb();
  await db
    .update(biometricTemplates)
    .set({ isActive: false as any })
    .where(and(eq(biometricTemplates.tenantId, tenantId), eq(biometricTemplates.employeeId, employeeId)));
  await db
    .update(biometricConsentRecords)
    .set({ dataDeletedAt: new Date() })
    .where(and(eq(biometricConsentRecords.tenantId, tenantId), eq(biometricConsentRecords.employeeId, employeeId)));
}

export async function logBiometricAccess(
  tenantId: number,
  action: "enroll" | "verify" | "identify" | "view" | "export" | "delete" | "update",
  accessedBy: number,
  employeeId?: number,
  templateId?: number,
  ipAddress?: string,
  userAgent?: string,
  isAllowed: boolean = true,
  reason?: string,
) {
  const db = getDb();
  await db.insert(biometricAccessLogs).values({
    tenantId,
    templateId: templateId || null,
    employeeId: employeeId || null,
    action,
    accessedBy,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    isAllowed: isAllowed as any,
    reason: reason || null,
    createdAt: new Date(),
  } as any);
}

export async function submitDataSubjectRequest(
  tenantId: number,
  employeeId: number,
  requestType: "access" | "rectification" | "erasure" | "restrict" | "portability" | "objection" | "withdraw_consent",
  requestDetails?: string,
  createdBy?: number,
) {
  const db = getDb();
  await db.insert(pdplDataSubjectRequests).values({
    tenantId,
    employeeId,
    requestType,
    requestDetails: requestDetails || null,
    status: "pending",
    submittedAt: new Date(),
    createdBy: createdBy || null,
  } as any);
}

export async function checkConsentBeforeProcessing(tenantId: number, employeeId: number, templateType: string): Promise<boolean> {
  const db = getDb();
  const consent = await db.query.biometricConsentRecords.findFirst({
    where: and(
      eq(biometricConsentRecords.tenantId, tenantId),
      eq(biometricConsentRecords.employeeId, employeeId),
      eq(biometricConsentRecords.consentType, templateType as any),
      eq(biometricConsentRecords.isConsented, true as any),
      eq(biometricConsentRecords.dataDeletedAt, null as any),
    ),
  });
  return !!consent;
}
