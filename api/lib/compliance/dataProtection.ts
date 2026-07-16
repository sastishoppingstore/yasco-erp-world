import { getDb } from "../../queries/connection";
import * as schema from "@db/schema";
import { and, eq, lt, gte, desc, asc, sql } from "drizzle-orm";

export type DataClassificationLevel = 1 | 2 | 3 | 4 | 5;
export type Regulation = "gdpr" | "pdpl" | "ccpa" | "lgpd" | "other";
export type SubjectType = "employee" | "customer" | "supplier" | "contact" | "user";

export interface DataSubjectRequestInput {
  tenantId: number;
  requestType: string;
  subjectType: SubjectType;
  subjectId: number;
  subjectEmail?: string;
  subjectPhone?: string;
  requestDetails?: string;
  regulation?: Regulation;
  createdBy?: number;
}

export class DataProtectionEngine {
  // ── Data Classification ──────────────────────────────────────────────
  async getClassifications(tenantId: number) {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT id, tenant_id, name, name_ar, level, description, color_hex,
             requires_encryption, requires_consent, retention_days, is_system
      FROM data_classifications WHERE tenant_id = ${tenantId}
      ORDER BY level ASC
    `) as any;
    return rows.map((r: any) => ({
      id: r.id, tenantId: r.tenant_id, name: r.name, nameAr: r.name_ar,
      level: r.level, description: r.description, colorHex: r.color_hex,
      requiresEncryption: !!r.requires_encryption, requiresConsent: !!r.requires_consent,
      retentionDays: r.retention_days, isSystem: !!r.is_system,
    }));
  }

  async createClassification(tenantId: number, data: {
    name: string; nameAr?: string; level: number; description?: string;
    colorHex?: string; requiresEncryption?: boolean; requiresConsent?: boolean; retentionDays?: number;
  }) {
    const db = getDb();
    const [ins] = await db.execute(sql`
      INSERT INTO data_classifications (tenant_id, name, name_ar, level, description, color_hex, requires_encryption, requires_consent, retention_days)
      VALUES (${tenantId}, ${data.name}, ${data.nameAr ?? null}, ${data.level}, ${data.description ?? null},
              ${data.colorHex ?? '#6b7280'}, ${data.requiresEncryption ? 1 : 0}, ${data.requiresConsent ? 1 : 0}, ${data.retentionDays ?? null})
    `) as any;
    return ins.insertId;
  }

  // ── Personal Data Inventory ──────────────────────────────────────────
  async getPersonalDataInventory(tenantId: number, subjectType?: string, subjectId?: number) {
    const db = getDb();
    const conditions = [sql`tenant_id = ${tenantId}`];
    if (subjectType && subjectId) {
      conditions.push(sql`data_subject_type = ${subjectType}`);
      conditions.push(sql`data_subject_id = ${subjectId}`);
    }
    const rows = await db.execute(sql`
      SELECT * FROM personal_data_inventory WHERE ${conditions.join(sql` AND `)} ORDER BY category ASC
    `) as any;
    return rows;
  }

  async addPersonalDataEntry(tenantId: number, data: {
    dataSubjectType: string; dataSubjectId?: number;
    category: string; fieldName: string; dataType: string;
    lawfulBasis?: string; purpose?: string; classificationId?: number;
    retentionDays?: number; isEncrypted?: boolean;
  }) {
    const db = getDb();
    const [ins] = await db.execute(sql`
      INSERT INTO personal_data_inventory (tenant_id, data_subject_type, data_subject_id, category, field_name, data_type, lawful_basis, purpose, classification_id, retention_days, is_encrypted)
      VALUES (${tenantId}, ${data.dataSubjectType}, ${data.dataSubjectId ?? null}, ${data.category}, ${data.fieldName},
              ${data.dataType}, ${data.lawfulBasis ?? 'explicit_consent'}, ${data.purpose ?? null},
              ${data.classificationId ?? null}, ${data.retentionDays ?? null}, ${data.isEncrypted ? 1 : 0})
    `) as any;
    return ins.insertId;
  }

  // ── Data Retention Policies ──────────────────────────────────────────
  async getRetentionPolicies(tenantId: number) {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT * FROM data_retention_policies WHERE tenant_id = ${tenantId}
    `) as any;
    return rows;
  }

  async setRetentionPolicy(tenantId: number, data: {
    entityType: string; retentionDays: number; action: string; legalBasis?: string; createdBy?: number;
  }) {
    const db = getDb();
    const existing = await db.execute(sql`
      SELECT id FROM data_retention_policies WHERE tenant_id = ${tenantId} AND entity_type = ${data.entityType} LIMIT 1
    `) as any;
    if (existing.length > 0) {
      await db.execute(sql`
        UPDATE data_retention_policies SET retention_days = ${data.retentionDays}, action = ${data.action},
          legal_basis = ${data.legalBasis ?? null} WHERE id = ${existing[0].id}
      `);
      return existing[0].id;
    }
    const [ins] = await db.execute(sql`
      INSERT INTO data_retention_policies (tenant_id, entity_type, retention_days, action, legal_basis, created_by)
      VALUES (${tenantId}, ${data.entityType}, ${data.retentionDays}, ${data.action}, ${data.legalBasis ?? null}, ${data.createdBy ?? null})
    `) as any;
    return ins.insertId;
  }

  // ── Data Subject Access Requests (DSAR) ──────────────────────────────
  async createSubjectRequest(input: DataSubjectRequestInput): Promise<number> {
    const db = getDb();
    const [ins] = await db.execute(sql`
      INSERT INTO data_subject_requests (tenant_id, request_type, subject_type, subject_id, subject_email, subject_phone, request_details, status, regulation, created_by)
      VALUES (${input.tenantId}, ${input.requestType}, ${input.subjectType}, ${input.subjectId},
              ${input.subjectEmail ?? null}, ${input.subjectPhone ?? null}, ${input.requestDetails ?? null},
              'pending', ${input.regulation ?? 'pdpl'}, ${input.createdBy ?? null})
    `) as any;
    return ins.insertId;
  }

  async listSubjectRequests(tenantId: number, status?: string) {
    const db = getDb();
    const conditions = [sql`tenant_id = ${tenantId}`];
    if (status) conditions.push(sql`status = ${status}`);
    const rows = await db.execute(sql`
      SELECT * FROM data_subject_requests WHERE ${conditions.join(sql` AND `)} ORDER BY created_at DESC
    `) as any;
    return rows;
  }

  async updateSubjectRequest(id: number, data: { status?: string; responseSummary?: string; rejectionReason?: string; assignedTo?: number }) {
    const db = getDb();
    const updates: string[] = [];
    if (data.status) updates.push(`status = '${data.status}'`);
    if (data.responseSummary) updates.push(`response_summary = '${data.responseSummary.replace(/'/g, "''")}'`);
    if (data.rejectionReason) updates.push(`rejection_reason = '${data.rejectionReason.replace(/'/g, "''")}'`);
    if (data.assignedTo) updates.push(`assigned_to = ${data.assignedTo}`);
    if (data.status === "completed") updates.push("completed_at = NOW()");
    if (updates.length > 0) {
      await db.execute(sql`UPDATE data_subject_requests SET ${sql.raw(updates.join(", "))} WHERE id = ${id}`);
    }
  }

  // ── Right to Erasure (GDPR Art. 17 / PDPL Art. 20) ──────────────────
  async executeRightToErasure(tenantId: number, subjectType: string, subjectId: number, requestId: number) {
    const db = getDb();
    const tables: Record<string, string> = {
      employee: "employees", customer: "customers", supplier: "suppliers", user: "users",
    };
    const table = tables[subjectType];
    if (table) {
      const [entity] = await db.execute(sql`
        SELECT id FROM ${sql.raw(table)} WHERE tenant_id = ${tenantId} AND id = ${subjectId} LIMIT 1
      `) as any;
      if (entity) {
        const anonSuffix = `_deleted_${Date.now()}`;
        await db.execute(sql`
          UPDATE ${sql.raw(table)} SET
            email = CONCAT('deleted', ${anonSuffix}, '@anonymous.invalid'),
            phone = 'REDACTED', mobile = 'REDACTED',
            name = 'REDACTED', name_ar = NULL,
            is_active = 0
          WHERE id = ${subjectId}
        `);
      }
    }
    await db.execute(sql`
      UPDATE personal_data_inventory SET expires_at = NOW(), data_processed_at = NULL
      WHERE tenant_id = ${tenantId} AND data_subject_type = ${subjectType} AND data_subject_id = ${subjectId}
    `);
    await this.updateSubjectRequest(requestId, { status: "completed", responseSummary: "Personal data anonymized per erasure request" });
    return { success: true };
  }

  // ── Right to Access (GDPR Art. 15 / PDPL Art. 17) ──────────────────
  async executeRightToAccess(tenantId: number, subjectType: string, subjectId: number): Promise<any> {
    const db = getDb();
    const tables: Record<string, string> = {
      employee: "employees", customer: "customers", supplier: "suppliers", user: "users",
    };
    const entityData = await db.execute(sql`
      SELECT * FROM ${sql.raw(tables[subjectType] || tables.user)} WHERE tenant_id = ${tenantId} AND id = ${subjectId} LIMIT 1
    `) as any;
    const personalData = await db.execute(sql`
      SELECT * FROM personal_data_inventory
      WHERE tenant_id = ${tenantId} AND data_subject_type = ${subjectType} AND data_subject_id = ${subjectId}
    `) as any;
    const consentRecords = await db.execute(sql`
      SELECT * FROM consent_records
      WHERE tenant_id = ${tenantId} AND subject_type = ${subjectType} AND subject_id = ${subjectId}
    `) as any;
    return { entity: entityData[0] ?? null, personalData, consentRecords };
  }

  // ── Retention Enforcement ────────────────────────────────────────────
  async enforceRetention(tenantId: number): Promise<{ deleted: number; archived: number }> {
    const db = getDb();
    const policies = await this.getRetentionPolicies(tenantId);
    let deleted = 0;
    let archived = 0;
    for (const p of policies) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - p.retention_days);
      if (p.action === "delete") {
        await db.execute(sql`
          UPDATE personal_data_inventory SET expires_at = NOW()
          WHERE tenant_id = ${tenantId} AND data_subject_type = ${p.entity_type}
          AND created_at < ${cutoff} AND expires_at IS NULL
        `);
        deleted += 1;
      }
    }
    return { deleted, archived };
  }

  // ── DPA Generation ───────────────────────────────────────────────────
  async generateDpa(tenantId: number, data: {
    processorName: string; processorContact?: string; processorEmail?: string;
    purpose: string; dataCategories: string[]; dataSubjectCategories?: string[];
    processingActivities?: string; securityMeasures?: string;
    effectiveDate: string; expiryDate?: string;
    hasTransfers?: boolean; transferCountries?: string[];
    createdBy?: number;
  }) {
    const db = getDb();
    const [ins] = await db.execute(sql`
      INSERT INTO data_processing_agreements (tenant_id, processor_name, processor_contact, processor_email, purpose, data_categories, data_subject_categories, processing_activities, security_measures, personal_data_transfers, transfer_countries, effective_date, expiry_date, created_by)
      VALUES (${tenantId}, ${data.processorName}, ${data.processorContact ?? null}, ${data.processorEmail ?? null},
              ${data.purpose}, ${JSON.stringify(data.dataCategories)}, ${data.dataSubjectCategories ? JSON.stringify(data.dataSubjectCategories) : null},
              ${data.processingActivities ?? null}, ${data.securityMeasures ?? null},
              ${data.hasTransfers ? 1 : 0}, ${data.transferCountries ? JSON.stringify(data.transferCountries) : null},
              ${new Date(data.effectiveDate)}, ${data.expiryDate ? new Date(data.expiryDate) : null}, ${data.createdBy ?? null})
    `) as any;
    return ins.insertId;
  }

  async listDpas(tenantId: number) {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT * FROM data_processing_agreements WHERE tenant_id = ${tenantId} ORDER BY created_at DESC
    `) as any;
    return rows;
  }
}

export const dataProtectionEngine = new DataProtectionEngine();
