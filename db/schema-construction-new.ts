import { sqliteTable, text, integer, decimal, timestamp, boolean, json } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================
// PAYMENT CERTIFICATES - Quick Win #1
// ============================================

export const paymentCertificates = sqliteTable("payment_certificates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  progressBillingId: integer("progress_billing_id").notNull(),
  
  // Certificate Details
  certificateNumber: text("certificate_number").unique().notNull(),
  certificateAmount: decimal("certificate_amount", { precision: 15, scale: 2 }).notNull(),
  retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default("5"),
  retentionAmount: decimal("retention_amount", { precision: 15, scale: 2 }).notNull(),
  paymentAmount: decimal("payment_amount", { precision: 15, scale: 2 }).notNull(),
  
  // Status & Workflow
  status: text("status", { 
    enum: ["draft", "pending_approval", "approved", "signed", "paid", "disputed"] 
  }).default("draft"),
  
  // Dates
  issuedDate: timestamp("issued_date", { mode: "date" }).notNull(),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  paidDate: timestamp("paid_date", { mode: "date" }),
  
  // ZATCA Integration
  zatcaInvoiceId: text("zatca_invoice_id"),
  zatcaQrCode: text("zatca_qr_code"),
  zatcaSignature: text("zatca_signature"),
  zatcaCertificationStatus: text("zatca_certification_status", {
    enum: ["pending", "certified", "failed"]
  }).default("pending"),
  
  // Metadata
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  notes: text("notes"),
});

export const certificateApprovals = sqliteTable("certificate_approvals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  certificateId: integer("certificate_id").notNull(),
  
  // Approval Details
  approverRole: text("approver_role", { 
    enum: ["pm", "finance", "principal", "client"] 
  }).notNull(),
  approverUserId: integer("approver_user_id").notNull(),
  approvalOrder: integer("approval_order").notNull(), // 1, 2, 3...
  
  // Status
  approvalStatus: text("approval_status", { 
    enum: ["pending", "approved", "rejected"] 
  }).default("pending"),
  
  // Signature & Comments
  comments: text("comments"),
  signatureBlob: text("signature_blob"), // Base64 encoded
  signatureDate: timestamp("signature_date", { mode: "date" }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  approvedAt: timestamp("approved_at", { mode: "date" }),
});

// ============================================
// JOB COSTING - Critical Feature #2
// ============================================

export const jobCostingCategories = sqliteTable("job_costing_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  categoryName: text("category_name").notNull(), // Labor, Materials, Equipment, etc.
  categoryCode: text("category_code").unique().notNull(),
  description: text("description"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const jobCostingDetails = sqliteTable("job_costing_details", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  // Relationship
  projectId: integer("project_id").notNull(),
  wbsItemId: integer("wbs_item_id"), // NULL for project-level costing
  costCategoryId: integer("cost_category_id").notNull(),
  
  // Budget vs Actual
  budgetAmount: decimal("budget_amount", { precision: 15, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 15, scale: 2 }).default("0"),
  forecastAmount: decimal("forecast_amount", { precision: 15, scale: 2 }).default("0"),
  
  // Variance Analysis
  varianceAmount: decimal("variance_amount", { precision: 15, scale: 2 }).default("0"),
  variancePercent: decimal("variance_percent", { precision: 5, scale: 2 }).default("0"),
  varianceType: text("variance_type", { 
    enum: ["favorable", "unfavorable"] 
  }),
  
  // Status
  status: text("status", { 
    enum: ["on_track", "warning", "critical"] 
  }).default("on_track"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const costVarianceAlerts = sqliteTable("cost_variance_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  projectId: integer("project_id").notNull(),
  jobCostingDetailId: integer("job_costing_detail_id").notNull(),
  
  // Alert Details
  thresholdPercent: integer("threshold_percent"), // 5, 10, 20
  alertSeverity: text("alert_severity", { 
    enum: ["warning", "critical"] 
  }).notNull(),
  
  message: text("message").notNull(),
  varianceDetails: json("variance_details"),
  
  // Resolution
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
  resolutionNotes: text("resolution_notes"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at", { mode: "date" }),
});

// ============================================
// QIWA INTEGRATION - Critical #3
// ============================================

export const qiwaIntegration = sqliteTable("qiwa_integration", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").unique().notNull(),
  
  // OAuth Details
  qiwaOrgId: text("qiwa_org_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }).notNull(),
  
  // Sync Status
  lastSyncAt: timestamp("last_sync_at", { mode: "date" }),
  syncStatus: text("sync_status", { 
    enum: ["success", "failed", "pending"] 
  }).default("pending"),
  syncError: text("sync_error"),
  
  // Configuration
  autoSyncEnabled: boolean("auto_sync_enabled").default(true),
  syncIntervalMinutes: integer("sync_interval_minutes").default(60),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const visaQuotaTracking = sqliteTable("visa_quota_tracking", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  projectId: integer("project_id").notNull(),
  skillCategory: text("skill_category").notNull(), // Software Engineers, Laborers, etc.
  
  // Quota Details
  totalQuota: integer("total_quota").notNull(),
  usedQuota: integer("used_quota").default(0),
  availableQuota: integer("available_quota").notNull(),
  
  // Last Updated
  qiwaLastUpdatedAt: timestamp("qiwa_last_updated_at", { mode: "date" }),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const workerVisaStatus = sqliteTable("worker_visa_status", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  employeeId: integer("employee_id").notNull(),
  projectId: integer("project_id").notNull(),
  
  // Visa Details
  visaNumber: text("visa_number").notNull(),
  visaExpiryDate: timestamp("visa_expiry_date", { mode: "date" }).notNull(),
  sponsorshipStatus: text("sponsorship_status", { 
    enum: ["active", "transferred", "expired", "pending"] 
  }).default("active"),
  
  // Verification
  qiwaVerified: boolean("qiwa_verified").default(false),
  lastVerifiedAt: timestamp("last_verified_at", { mode: "date" }),
  
  // Alerts
  expiryAlertSent: boolean("expiry_alert_sent").default(false),
  expiryAlertDate: timestamp("expiry_alert_date", { mode: "date" }),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const visaExpiryAlerts = sqliteTable("visa_expiry_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  workerVisaStatusId: integer("worker_visa_status_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  projectId: integer("project_id").notNull(),
  
  // Alert Details
  daysUntilExpiry: integer("days_until_expiry").notNull(),
  alertType: text("alert_type", { 
    enum: ["30_days", "14_days", "7_days", "expired"] 
  }).notNull(),
  
  // Status
  isAcknowledged: boolean("is_acknowledged").default(false),
  acknowledgedBy: integer("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at", { mode: "date" }),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ============================================
// NITAQAT SAUDIZATION - High Priority
// ============================================

export const nitaqatTracking = sqliteTable("nitaqat_tracking", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  projectId: integer("project_id").notNull(),
  reportingPeriod: timestamp("reporting_period", { mode: "date" }).notNull(),
  
  // Workforce Metrics
  totalWorkforce: integer("total_workforce").notNull(),
  saudiCount: integer("saudi_count").notNull(),
  nonSaudiCount: integer("non_saudi_count").notNull(),
  
  // Calculations
  nitaqatPercentage: decimal("nitaqat_percentage", { precision: 5, scale: 2 }).notNull(),
  category: text("category", { 
    enum: ["platinum", "gold", "silver", "bronze"] 
  }).notNull(),
  
  // Compliance
  salaryCeilingViolations: integer("salary_ceiling_violations").default(0),
  complianceStatus: text("compliance_status", { 
    enum: ["compliant", "warning", "non_compliant"] 
  }).default("compliant"),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  calculatedAt: timestamp("calculated_at", { mode: "date" }).defaultNow(),
});

export const nitaqatComplianceAlerts = sqliteTable("nitaqat_compliance_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  projectId: integer("project_id").notNull(),
  
  // Alert Type
  alertType: text("alert_type", { 
    enum: ["category_drop", "salary_ceiling_breach", "threshold_warning", "non_compliance"] 
  }).notNull(),
  
  severity: text("severity", { 
    enum: ["info", "warning", "critical"] 
  }).notNull(),
  
  message: text("message").notNull(),
  details: json("details"),
  
  // Resolution
  isAcknowledged: boolean("is_acknowledged").default(false),
  acknowledgedAt: timestamp("acknowledged_at", { mode: "date" }),
  acknowledgedBy: integer("acknowledged_by"),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ============================================
// HSE & SAFETY - High Priority
// ============================================

export const hseSafetyIncidents = sqliteTable("hse_safety_incidents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  projectId: integer("project_id").notNull(),
  reportedBy: integer("reported_by").notNull(),
  
  // Incident Details
  incidentType: text("incident_type", { 
    enum: ["lost_time", "restricted_work", "medical_treatment", "near_miss", "property_damage"] 
  }).notNull(),
  
  incidentDate: timestamp("incident_date", { mode: "date" }).notNull(),
  incidentDescription: text("incident_description").notNull(),
  location: text("location").notNull(),
  
  // Severity
  severity: text("severity", { 
    enum: ["low", "medium", "high", "critical"] 
  }).notNull(),
  
  // Investigation
  investigationStatus: text("investigation_status", { 
    enum: ["open", "in_progress", "completed", "closed"] 
  }).default("open"),
  
  rootCauseAnalysis: text("root_cause_analysis"),
  correctiveActions: text("corrective_actions"),
  preventiveMeasures: text("preventive_measures"),
  
  // Assignment
  investigatedBy: integer("investigated_by"),
  assignedTo: integer("assigned_to"),
  
  // Dates
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  investigationStartedAt: timestamp("investigation_started_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
});

export const hseKpiMetrics = sqliteTable("hse_kpi_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  
  projectId: integer("project_id").notNull(),
  reportingPeriod: timestamp("reporting_period", { mode: "date" }).notNull(),
  
  // Incident Metrics
  totalIncidents: integer("total_incidents").default(0),
  lostTimeIncidents: integer("lost_time_incidents").default(0),
  restrictedWorkIncidents: integer("restricted_work_incidents").default(0),
  nearMisses: integer("near_misses").default(0),
  
  // Hours Worked
  totalHoursWorked: decimal("total_hours_worked", { precision: 12, scale: 2 }).default("0"),
  
  // Calculated KPIs
  trifr: decimal("trifr", { precision: 8, scale: 2 }), // Total Recordable Incident Frequency Rate
  ltifr: decimal("ltifr", { precision: 8, scale: 2 }), // Lost Time Incident Frequency Rate
  sfr: decimal("sfr", { precision: 8, scale: 2 }), // Safety Frequency Rate
  
  // Training
  trainingCompletionPercent: decimal("training_completion_percent", { precision: 5, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  calculatedAt: timestamp("calculated_at", { mode: "date" }).defaultNow(),
});

// ============================================
// OFFLINE SYNC QUEUE
// ============================================

export const syncQueue = sqliteTable("sync_queue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  userId: integer("user_id").notNull(),
  
  // Operation Details
  operationType: text("operation_type", { 
    enum: ["create", "update", "delete"] 
  }).notNull(),
  
  entityType: text("entity_type").notNull(), // e.g., "daily_report", "incident", "cost"
  entityId: integer("entity_id"),
  
  // Payload
  payload: json("payload").notNull(),
  
  // Sync Status
  syncStatus: text("sync_status", { 
    enum: ["pending", "synced", "failed", "conflict"] 
  }).default("pending"),
  
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  lastError: text("last_error"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  syncedAt: timestamp("synced_at", { mode: "date" }),
  nextRetryAt: timestamp("next_retry_at", { mode: "date" }),
});

// ============================================
// RELATIONS
// ============================================

export const paymentCertificateApprovals = relations(paymentCertificates, ({ many }) => ({
  approvals: many(certificateApprovals),
}));

export const certificateApprovalsRelation = relations(certificateApprovals, ({ one }) => ({
  certificate: one(paymentCertificates, {
    fields: [certificateApprovals.certificateId],
    references: [paymentCertificates.id],
  }),
}));

export const jobCostingDetailsVariances = relations(jobCostingDetails, ({ many }) => ({
  variances: many(costVarianceAlerts),
}));

export const costVarianceAlertsDetails = relations(costVarianceAlerts, ({ one }) => ({
  jobCostingDetail: one(jobCostingDetails, {
    fields: [costVarianceAlerts.jobCostingDetailId],
    references: [jobCostingDetails.id],
  }),
}));

export const visaQuotasTracking = relations(visaQuotaTracking, ({ many }) => ({
  workerStatuses: many(workerVisaStatus),
}));

export const workerVisaStatuses = relations(workerVisaStatus, ({ many, one }) => ({
  alerts: many(visaExpiryAlerts),
  quota: one(visaQuotaTracking, {
    fields: [workerVisaStatus.projectId],
    references: [visaQuotaTracking.projectId],
  }),
}));

export const nitaqatAlerts = relations(nitaqatTracking, ({ many }) => ({
  alerts: many(nitaqatComplianceAlerts),
}));

export const hseIncidentMetrics = relations(hseSafetyIncidents, ({ many }) => ({
  metrics: many(hseKpiMetrics),
}));
