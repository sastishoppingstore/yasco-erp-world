import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  boolean,
  mysqlEnum,
  date,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// =====================================================
// TASK #17: NITAQAT AUTOMATION ENGINE
// =====================================================

export const nitaqatComplianceRecords = mysqlTable("nitaqat_compliance_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  companyId: int("company_id"),
  reportingMonth: date("reporting_month").notNull(),
  totalSaudiEmployees: int("total_saudi_employees").notNull().default(0),
  totalForeignEmployees: int("total_foreign_employees").notNull().default(0),
  saudizationPercentage: decimal("saudization_percentage", { precision: 5, scale: 2 }).notNull(),
  nitaqatLevel: mysqlEnum("nitaqat_level", ["green", "yellow", "red", "platinum"]).notNull(),
  salaryFloor: decimal("salary_floor", { precision: 15, scale: 2 }),
  salaryCeiling: decimal("salary_ceiling", { precision: 15, scale: 2 }),
  totalSalaryCost: decimal("total_salary_cost", { precision: 15, scale: 2 }),
  complianceStatus: mysqlEnum("compliance_status", ["compliant", "warning", "non_compliant", "remediation_in_progress"]).notNull(),
  remediationPlan: text("remediation_plan"),
  remediationDeadline: timestamp("remediation_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("nitaqat_tenant_idx").on(table.tenantId),
  index("nitaqat_month_idx").on(table.reportingMonth),
  uniqueIndex("nitaqat_unique_month").on(table.tenantId, table.reportingMonth),
]);

export type NitaqatComplianceRecord = typeof nitaqatComplianceRecords.$inferSelect;
export type InsertNitaqatComplianceRecord = typeof nitaqatComplianceRecords.$inferInsert;

export const nitaqatRemediationSuggestions = mysqlTable("nitaqat_remediation_suggestions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  nitaqatRecordId: int("nitaqat_record_id").notNull(),
  suggestionType: mysqlEnum("suggestion_type", [
    "hire_saudi",
    "reduce_foreign",
    "salary_adjustment",
    "role_restructuring",
    "training_program",
    "replacement_plan",
    "contract_review"
  ]).notNull(),
  description: text("description").notNull(),
  estimatedImpact: decimal("estimated_impact", { precision: 5, scale: 2 }),
  implementationCost: decimal("implementation_cost", { precision: 15, scale: 2 }),
  timelineWeeks: int("timeline_weeks"),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "rejected"]).default("pending").notNull(),
  assignedTo: int("assigned_to"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("remediation_tenant_idx").on(table.tenantId),
  index("remediation_record_idx").on(table.nitaqatRecordId),
]);

export type NitaqatRemediationSuggestion = typeof nitaqatRemediationSuggestions.$inferSelect;
export type InsertNitaqatRemediationSuggestion = typeof nitaqatRemediationSuggestions.$inferInsert;

export const salaryCeilingRules = mysqlTable("salary_ceiling_rules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ruleCode: varchar("rule_code", { length: 50 }).notNull(),
  jobTitle: varchar("job_title", { length: 255 }),
  industryCategory: varchar("industry_category", { length: 100 }),
  minSalary: decimal("min_salary", { precision: 15, scale: 2 }).notNull(),
  maxSalary: decimal("max_salary", { precision: 15, scale: 2 }).notNull(),
  ruleType: mysqlEnum("rule_type", ["fixed", "percentage_based", "experience_based"]).notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("salary_ceiling_tenant_idx").on(table.tenantId),
  uniqueIndex("salary_ceiling_unique").on(table.tenantId, table.ruleCode),
]);

export type SalaryCeilingRule = typeof salaryCeilingRules.$inferSelect;
export type InsertSalaryCeilingRule = typeof salaryCeilingRules.$inferInsert;

// =====================================================
// TASK #18: MUNICIPALITY PERMIT TRACKING (BALADY)
// =====================================================

export const baladyPermitApplications = mysqlTable("balady_permit_applications", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  applicationNumber: varchar("application_number", { length: 100 }).notNull().unique(),
  projectId: int("project_id"),
  permitType: mysqlEnum("permit_type", [
    "construction_permit",
    "occupancy_permit",
    "demolition_permit",
    "renovation_permit",
    "usage_change_permit",
    "billboard_permit"
  ]).notNull(),
  propertyNumber: varchar("property_number", { length: 100 }).notNull(),
  propertyLocation: text("property_location").notNull(),
  applicantName: varchar("applicant_name", { length: 255 }).notNull(),
  applicantCR: varchar("applicant_cr", { length: 50 }),
  applicantEmail: varchar("applicant_email", { length: 320 }),
  applicantPhone: varchar("applicant_phone", { length: 50 }),
  contractorName: varchar("contractor_name", { length: 255 }),
  contractorLicense: varchar("contractor_license", { length: 100 }),
  designerName: varchar("designer_name", { length: 255 }),
  designerLicense: varchar("designer_license", { length: 100 }),
  projectValue: decimal("project_value", { precision: 15, scale: 2 }),
  estimatedCompletionDate: date("estimated_completion_date"),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  status: mysqlEnum("status", [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "revision_required",
    "cancelled"
  ]).default("draft").notNull(),
  approvalDate: timestamp("approval_date"),
  rejectionReason: text("rejection_reason"),
  documents: json("documents"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("balady_tenant_idx").on(table.tenantId),
  index("balady_status_idx").on(table.status),
  uniqueIndex("balady_app_number").on(table.tenantId, table.applicationNumber),
]);

export type BaladyPermitApplication = typeof baladyPermitApplications.$inferSelect;
export type InsertBaladyPermitApplication = typeof baladyPermitApplications.$inferInsert;

export const baladyPermitTracking = mysqlTable("balady_permit_tracking", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  applicationId: int("application_id").notNull(),
  permitNumber: varchar("permit_number", { length: 100 }).unique(),
  issuanceDate: date("issuance_date"),
  expiryDate: date("expiry_date"),
  daysUntilExpiry: int("days_until_expiry"),
  status: mysqlEnum("status", ["valid", "expired", "expiring_soon", "suspended", "cancelled"]).notNull(),
  trackedAt: timestamp("tracked_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("permit_tracking_tenant_idx").on(table.tenantId),
  index("permit_tracking_app_idx").on(table.applicationId),
]);

export type BaladyPermitTracking = typeof baladyPermitTracking.$inferSelect;
export type InsertBaladyPermitTracking = typeof baladyPermitTracking.$inferInsert;

export const permitInspections = mysqlTable("permit_inspections", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  applicationId: int("application_id").notNull(),
  inspectionType: mysqlEnum("inspection_type", [
    "foundation",
    "structural",
    "MEP",
    "finishing",
    "final",
    "safety",
    "accessibility"
  ]).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  actualDate: timestamp("actual_date"),
  inspector: varchar("inspector", { length: 255 }),
  inspectorId: int("inspector_id"),
  result: mysqlEnum("result", ["passed", "failed", "partial", "conditional", "pending"]),
  findings: text("findings"),
  requiredCorrections: text("required_corrections"),
  reinspectionScheduled: timestamp("reinspection_scheduled"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "rescheduled"]).notNull(),
  notes: text("notes"),
  attachments: json("attachments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("inspection_tenant_idx").on(table.tenantId),
  index("inspection_app_idx").on(table.applicationId),
  index("inspection_date_idx").on(table.scheduledDate),
]);

export type PermitInspection = typeof permitInspections.$inferSelect;
export type InsertPermitInspection = typeof permitInspections.$inferInsert;

// =====================================================
// TASK #19: ADVANCED EQUIPMENT MANAGEMENT
// =====================================================

export const equipmentMaintenanceSchedules = mysqlTable("equipment_maintenance_schedules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  equipmentId: int("equipment_id").notNull(),
  maintenanceType: mysqlEnum("maintenance_type", [
    "preventive",
    "predictive",
    "corrective",
    "emergency"
  ]).notNull(),
  scheduleFrequency: mysqlEnum("schedule_frequency", [
    "daily",
    "weekly",
    "bi_weekly",
    "monthly",
    "quarterly",
    "semi_annual",
    "annual",
    "on_demand"
  ]).notNull(),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextDueDate: date("next_due_date").notNull(),
  maintenanceTaskList: json("maintenance_task_list"),
  estimatedDowntime: int("estimated_downtime"),
  estimatedCost: decimal("estimated_cost", { precision: 15, scale: 2 }),
  assignedTechnicianId: int("assigned_technician_id"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "overdue", "cancelled"]).notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("maintenance_tenant_idx").on(table.tenantId),
  index("maintenance_equipment_idx").on(table.equipmentId),
  index("maintenance_due_idx").on(table.nextDueDate),
]);

export type EquipmentMaintenanceSchedule = typeof equipmentMaintenanceSchedules.$inferSelect;
export type InsertEquipmentMaintenanceSchedule = typeof equipmentMaintenanceSchedules.$inferInsert;

export const equipmentGpsTracking = mysqlTable("equipment_gps_tracking", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  equipmentId: int("equipment_id").notNull(),
  gpsDeviceId: varchar("gps_device_id", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  altitude: decimal("altitude", { precision: 8, scale: 2 }),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  heading: int("heading"),
  accuracy: decimal("accuracy", { precision: 6, scale: 2 }),
  projectId: int("project_id"),
  status: mysqlEnum("status", ["active", "idle", "maintenance", "inactive"]).notNull(),
  lastUpdateAt: timestamp("last_update_at").defaultNow(),
  geofenceStatus: mysqlEnum("geofence_status", ["inside", "outside", "unknown"]),
  alertGenerated: boolean("alert_generated").default(false),
  batteryLevel: int("battery_level"),
  signalStrength: int("signal_strength"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("gps_tenant_idx").on(table.tenantId),
  index("gps_equipment_idx").on(table.equipmentId),
  index("gps_project_idx").on(table.projectId),
  index("gps_update_idx").on(table.lastUpdateAt),
]);

export type EquipmentGpsTracking = typeof equipmentGpsTracking.$inferSelect;
export type InsertEquipmentGpsTracking = typeof equipmentGpsTracking.$inferInsert;

export const equipmentUtilizationReports = mysqlTable("equipment_utilization_reports", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  equipmentId: int("equipment_id").notNull(),
  reportDate: date("report_date").notNull(),
  operatingHours: decimal("operating_hours", { precision: 8, scale: 2 }),
  utilizationPercentage: decimal("utilization_percentage", { precision: 5, scale: 2 }),
  projectsUsed: json("projects_used"),
  idleTime: decimal("idle_time", { precision: 8, scale: 2 }),
  downtime: decimal("downtime", { precision: 8, scale: 2 }),
  maintenanceTime: decimal("maintenance_time", { precision: 8, scale: 2 }),
  costPerHour: decimal("cost_per_hour", { precision: 10, scale: 2 }),
  totalCostForPeriod: decimal("total_cost_for_period", { precision: 15, scale: 2 }),
  fuelConsumption: decimal("fuel_consumption", { precision: 8, scale: 2 }),
  productionOutput: text("production_output"),
  status: mysqlEnum("status", ["draft", "submitted", "approved"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("utilization_tenant_idx").on(table.tenantId),
  index("utilization_equipment_idx").on(table.equipmentId),
  index("utilization_date_idx").on(table.reportDate),
]);

export type EquipmentUtilizationReport = typeof equipmentUtilizationReports.$inferSelect;
export type InsertEquipmentUtilizationReport = typeof equipmentUtilizationReports.$inferInsert;

export const fuelConsumptionLogs = mysqlTable("fuel_consumption_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  equipmentId: int("equipment_id").notNull(),
  fuelType: mysqlEnum("fuel_type", ["diesel", "petrol", "lpg", "electric", "hybrid"]).notNull(),
  litersConsumed: decimal("liters_consumed", { precision: 8, scale: 2 }).notNull(),
  costPerLiter: decimal("cost_per_liter", { precision: 8, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  odometer: bigint("odometer", { mode: "number", unsigned: true }),
  operatingHours: decimal("operating_hours", { precision: 8, scale: 2 }),
  fuelEfficiency: decimal("fuel_efficiency", { precision: 6, scale: 2 }),
  vehicleRegistration: varchar("vehicle_registration", { length: 50 }),
  driverId: int("driver_id"),
  projectId: int("project_id"),
  vendorId: int("vendor_id"),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  refuelingDate: date("refueling_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("fuel_tenant_idx").on(table.tenantId),
  index("fuel_equipment_idx").on(table.equipmentId),
  index("fuel_date_idx").on(table.refuelingDate),
]);

export type FuelConsumptionLog = typeof fuelConsumptionLogs.$inferSelect;
export type InsertFuelConsumptionLog = typeof fuelConsumptionLogs.$inferInsert;
