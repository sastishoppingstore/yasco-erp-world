import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, asc, lt, gte, sql } from "drizzle-orm";
import { env } from "./env";

const TENANT_SCOPED = (tenantId: number) => eq(schema.documents.tenantId, tenantId);

export interface UploadResult {
  id: number;
  url?: string;
  fields?: Record<string, string>;
}

export interface VersionInfo {
  id: number;
  versionNumber: number;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  uploadedBy: number | null;
}

export interface ExpiryAlertConfig {
  documentId: number;
  reminderType: string;
  expiryDate: string;
  reminderDaysBefore: number;
  notifyUserIds: number[];
}

export interface AccessCheck {
  allowed: boolean;
  reason?: string;
}

export class DocumentEngine {
  async upload(tenantId: number, data: {
    categoryId?: number; title: string; description?: string;
    fileName: string; fileSize: number; mimeType: string;
    relatedType?: string; relatedId?: number; uploadedBy: number;
  }): Promise<UploadResult> {
    const db = getDb();
    const [doc] = await db.insert(schema.documents).values({
      tenantId, categoryId: data.categoryId, title: data.title,
      description: data.description, fileName: data.fileName,
      filePath: `documents/${tenantId}/${data.relatedType ?? "general"}/${Date.now()}_${data.fileName}`,
      fileSize: data.fileSize, mimeType: data.mimeType,
      version: 1, relatedType: data.relatedType, relatedId: data.relatedId,
      uploadedBy: data.uploadedBy,
    }).$returningId();
    await db.insert(schema.documentVersions).values({
      tenantId, documentId: doc.id, versionNumber: 1,
      fileName: data.fileName,
      filePath: `documents/${tenantId}/${data.relatedType ?? "general"}/${Date.now()}_${data.fileName}`,
      fileSize: data.fileSize, mimeType: data.mimeType,
      uploadedBy: data.uploadedBy, changeNotes: "Initial upload",
    });
    return { id: doc.id, url: this.getPresignedUrl("upload", `documents/${tenantId}/${data.relatedType ?? "general"}/${Date.now()}_${data.fileName}`) };
  }

  async createVersion(tenantId: number, documentId: number, data: {
    fileName: string; fileSize: number; mimeType: string;
    changeNotes?: string; uploadedBy: number;
  }): Promise<VersionInfo> {
    const db = getDb();
    const [doc] = await db.select().from(schema.documents).where(
      and(TENANT_SCOPED(tenantId), eq(schema.documents.id, documentId)),
    ).limit(1);
    if (!doc) throw new Error("Document not found");
    const newVersion = (doc.version ?? 0) + 1;
    const [ver] = await db.insert(schema.documentVersions).values({
      tenantId, documentId, versionNumber: newVersion,
      fileName: data.fileName,
      filePath: `documents/${tenantId}/v${newVersion}/${Date.now()}_${data.fileName}`,
      fileSize: data.fileSize, mimeType: data.mimeType,
      uploadedBy: data.uploadedBy, changeNotes: data.changeNotes,
    }).$returningId();
    await db.update(schema.documents).set({
      version: newVersion, fileName: data.fileName,
      filePath: `documents/${tenantId}/v${newVersion}/${Date.now()}_${data.fileName}`,
      fileSize: data.fileSize, mimeType: data.mimeType,
    }).where(eq(schema.documents.id, documentId));
    return { id: ver.id, versionNumber: newVersion, fileName: data.fileName, fileSize: data.fileSize, createdAt: new Date(), uploadedBy: data.uploadedBy };
  }

  async getVersions(tenantId: number, documentId: number): Promise<VersionInfo[]> {
    const db = getDb();
    const versions = await db.select().from(schema.documentVersions).where(
      and(eq(schema.documentVersions.tenantId, tenantId), eq(schema.documentVersions.documentId, documentId)),
    ).orderBy(desc(schema.documentVersions.versionNumber));
    return versions.map(v => ({
      id: v.id, versionNumber: v.versionNumber, fileName: v.fileName,
      fileSize: v.fileSize, createdAt: v.createdAt, uploadedBy: v.uploadedBy,
    }));
  }

  getPresignedUrl(operation: "upload" | "download", key: string): string | undefined {
    if (!env.enableS3) return undefined;
    const s3Url = `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com/${key}`;
    return s3Url;
  }

  async logAccess(tenantId: number, documentId: number, userId: number | null, accessType: string, allowed = true, reason?: string) {
    const db = getDb();
    await db.insert(schema.documentAccessLogs).values({
      tenantId, documentId, userId, accessType: accessType as any,
      isAllowed: allowed, reason, createdAt: new Date(),
    });
  }

  async checkAccess(tenantId: number, documentId: number, userId: number, requiredPermission = "view"): Promise<AccessCheck> {
    const db = getDb();
    const doc = await db.query.documents.findFirst({
      where: and(TENANT_SCOPED(tenantId), eq(schema.documents.id, documentId)),
    });
    if (!doc) return { allowed: false, reason: "Document not found" };
    if (doc.uploadedBy === userId) return { allowed: true };
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (user && ["admin", "super_admin"].includes(user.role)) return { allowed: true };
    return { allowed: false, reason: "Insufficient permissions" };
  }

  async setExpiryAlert(tenantId: number, config: ExpiryAlertConfig & { createdBy: number }) {
    const db = getDb();
    await db.insert(schema.documentExpiryReminders).values({
      tenantId, documentId: config.documentId,
      reminderType: config.reminderType as any,
      expiryDate: new Date(config.expiryDate),
      reminderDaysBefore: config.reminderDaysBefore,
      notifyUserIds: JSON.stringify(config.notifyUserIds),
      createdBy: config.createdBy, status: "active",
    });
  }

  async getExpiringDocuments(tenantId: number, withinDays = 30) {
    const db = getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return db.select().from(schema.documentExpiryReminders).where(
      and(eq(schema.documentExpiryReminders.tenantId, tenantId),
          eq(schema.documentExpiryReminders.status, "active"),
          lte(schema.documentExpiryReminders.expiryDate, cutoff.toISOString().split("T")[0]),
          gte(schema.documentExpiryReminders.expiryDate, new Date().toISOString().split("T")[0])),
    );
  }

  async getDocumentTypes(): Promise<{ key: string; label: string; labelAr: string; fields: string[] }[]> {
    return [
      { key: "contract", label: "Contract", labelAr: "عقد", fields: ["title", "party_name", "start_date", "end_date", "value"] },
      { key: "id_copy", label: "ID Copy (Iqama/National)", labelAr: "نسخة هوية", fields: ["id_number", "holder_name", "expiry_date", "issuer"] },
      { key: "certificate", label: "Certificate", labelAr: "شهادة", fields: ["title", "issuing_body", "issue_date", "expiry_date", "reference_number"] },
      { key: "invoice_scan", label: "Scanned Invoice (OCR)", labelAr: "فاتورة ممسوحة", fields: ["invoice_number", "supplier", "amount", "date", "tax_number"] },
      { key: "trade_license", label: "Trade License (CR)", labelAr: "سجل تجاري", fields: ["cr_number", "company_name", "issue_date", "expiry_date", "activity"] },
      { key: "insurance", label: "Insurance Policy", labelAr: "وثيقة تأمين", fields: ["policy_number", "insured_party", "coverage_type", "start_date", "end_date", "premium"] },
      { key: "bank_document", label: "Bank Document", labelAr: "مستند بنكي", fields: ["bank_name", "account_number", "document_type", "date"] },
      { key: "other", label: "Other", labelAr: "أخرى", fields: ["title"] },
    ];
  }
}

export const documentEngine = new DocumentEngine();
