import { getDb } from "../../queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, asc, gte, lte, sql } from "drizzle-orm";

export interface Soc2Export {
  framework: "SOC2";
  generatedAt: string;
  organization: string;
  periodStart: string;
  periodEnd: string;
  auditLogs: any[];
  accessLogs: any[];
  changeManagement: any[];
  securityIncidents: any[];
}

export interface AuditExportFilter {
  tenantId: number;
  from?: string;
  to?: string;
  framework?: string;
}

export class AuditExportService {
  async exportSoc2(filter: AuditExportFilter): Promise<Soc2Export> {
    const db = getDb();
    const company = await db.query.companySettings.findFirst({ where: eq(schema.companySettings.tenantId, filter.tenantId) });
    const from = filter.from ? new Date(filter.from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const to = filter.to ? new Date(filter.to) : new Date();

    const auditLogs = await this.getAuditLogs(filter.tenantId, from, to);
    const accessLogs = await this.getAccessLogs(filter.tenantId, from, to);
    const changeManagement = await this.getChangeManagement(filter.tenantId, from, to);
    const securityIncidents = await this.getSecurityIncidents(filter.tenantId, from, to);

    return {
      framework: "SOC2",
      generatedAt: new Date().toISOString(),
      organization: company?.companyName ?? "Unknown",
      periodStart: from.toISOString(),
      periodEnd: to.toISOString(),
      auditLogs, accessLogs, changeManagement, securityIncidents,
    };
  }

  async exportAuditLogs(tenantId: number, from?: string, to?: string) {
    return this.getAuditLogs(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  async exportAccessLogs(tenantId: number, from?: string, to?: string) {
    return this.getAccessLogs(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  async exportChangeManagement(tenantId: number, from?: string, to?: string) {
    return this.getChangeManagement(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  async exportSecurityIncidents(tenantId: number, from?: string, to?: string) {
    return this.getSecurityIncidents(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  async getComplianceDashboardStats(tenantId: number) {
    const db = getDb();
    const totalAuditLogs = (await db.execute(sql`SELECT COUNT(*) as count FROM audit_logs WHERE tenant_id = ${tenantId}`) as any)[0]?.count ?? 0;
    const totalAccessLogs = (await db.execute(sql`SELECT COUNT(*) as count FROM document_access_logs WHERE tenant_id = ${tenantId}`) as any)[0]?.count ?? 0;
    const openIncidents = (await db.execute(sql`SELECT COUNT(*) as count FROM security_incidents WHERE tenant_id = ${tenantId} AND status NOT IN ('resolved','closed')`) as any)[0]?.count ?? 0;
    const pendingDsars = (await db.execute(sql`SELECT COUNT(*) as count FROM data_subject_requests WHERE tenant_id = ${tenantId} AND status IN ('pending','in_progress','verifying')`) as any)[0]?.count ?? 0;
    const totalChanges = (await db.execute(sql`SELECT COUNT(*) as count FROM change_management_logs WHERE tenant_id = ${tenantId}`) as any)[0]?.count ?? 0;
    const frameworks = await db.execute(sql`SELECT * FROM compliance_framework_settings WHERE tenant_id = ${tenantId}`) as any;

    return {
      totalAuditLogs, totalAccessLogs, openIncidents, pendingDsars, totalChanges,
      frameworks: frameworks.map((f: any) => ({
        framework: f.framework, isEnabled: !!f.is_enabled,
        certificationStatus: f.certification_status,
        certificationDate: f.certification_date,
        expiryDate: f.expiry_date,
        auditor: f.auditor_name,
      })),
    };
  }

  private async getAuditLogs(tenantId: number, from?: Date, to?: Date): Promise<any[]> {
    const db = getDb();
    const conditions = [eq(schema.auditLogs.tenantId, tenantId)];
    if (from) conditions.push(gte(schema.auditLogs.createdAt, from));
    if (to) conditions.push(lte(schema.auditLogs.createdAt, to));
    const rows = await db.select().from(schema.auditLogs).where(and(...conditions))
      .orderBy(desc(schema.auditLogs.createdAt)).limit(1000);
    return rows.map(r => ({
      timestamp: r.createdAt, user: r.userId, action: r.action,
      entityType: r.entityType, entityId: r.entityId,
      changes: { old: r.oldValues, new: r.newValues },
      ipAddress: r.ipAddress,
    }));
  }

  private async getAccessLogs(tenantId: number, from?: Date, to?: Date): Promise<any[]> {
    const db = getDb();
    const conditions = [sql`tenant_id = ${tenantId}`];
    if (from) conditions.push(sql`created_at >= ${from}`);
    if (to) conditions.push(sql`created_at <= ${to}`);
    const rows = await db.execute(sql`
      SELECT * FROM document_access_logs WHERE ${conditions.join(sql` AND `)} ORDER BY created_at DESC LIMIT 1000
    `) as any;
    return rows.map((r: any) => ({
      timestamp: r.created_at, documentId: r.document_id,
      userId: r.user_id, accessType: r.access_type,
      allowed: !!r.is_allowed, ipAddress: r.ip_address,
    }));
  }

  private async getChangeManagement(tenantId: number, from?: Date, to?: Date): Promise<any[]> {
    const db = getDb();
    const conditions = [sql`tenant_id = ${tenantId}`];
    if (from) conditions.push(sql`created_at >= ${from}`);
    if (to) conditions.push(sql`created_at <= ${to}`);
    const rows = await db.execute(sql`
      SELECT * FROM change_management_logs WHERE ${conditions.join(sql` AND `)} ORDER BY created_at DESC LIMIT 500
    `) as any;
    return rows.map((r: any) => ({
      timestamp: r.created_at, changeType: r.change_type,
      title: r.title, description: r.description,
      changedBy: r.changed_by, riskLevel: r.risk_level,
      approvalStatus: r.approval_status, rollbackPlan: r.rollback_plan,
    }));
  }

  private async getSecurityIncidents(tenantId: number, from?: Date, to?: Date): Promise<any[]> {
    const db = getDb();
    const conditions = [sql`tenant_id = ${tenantId}`];
    if (from) conditions.push(sql`detected_at >= ${from}`);
    if (to) conditions.push(sql`detected_at <= ${to}`);
    const rows = await db.execute(sql`
      SELECT * FROM security_incidents WHERE ${conditions.join(sql` AND `)} ORDER BY detected_at DESC LIMIT 500
    `) as any;
    return rows.map((r: any) => ({
      detectedAt: r.detected_at, incidentType: r.incident_type,
      severity: r.severity, title: r.title, description: r.description,
      rootCause: r.root_cause, resolution: r.resolution,
      status: r.status, notifiedAuthority: !!r.notified_authority,
    }));
  }
}

export const auditExportService = new AuditExportService();
