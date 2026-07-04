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
} from "drizzle-orm/mysql-core";

// =====================================================
// WORKSHOP MODULE ENHANCEMENTS
// Warranty Tracking, Service Reminders, Parts Integration
// =====================================================

// Warranty Management
export const warranties = mysqlTable("warranties", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }),
  jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }),
  warrantyNumber: varchar("warranty_number", { length: 50 }).notNull().unique(),
  warrantyType: mysqlEnum("warranty_type", ["manufacturer", "extended", "service", "parts", "labor"]).notNull(),
  coverageType: varchar("coverage_type", { length: 100 }), // powertrain, bumper-to-bumper, etc.
  providerName: varchar("provider_name", { length: 255 }),
  providerContact: varchar("provider_contact", { length: 255 }),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }),
  mileageLimit: int("mileage_limit"),
  currentMileage: int("current_mileage"),
  coveredItems: json("covered_items"), // Array of parts/services covered
  exclusions: text("exclusions"),
  claimProcess: text("claim_process"),
  deductible: decimal("deductible", { precision: 10, scale: 2 }).default("0"),
  coverageAmount: decimal("coverage_amount", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["active", "expired", "cancelled", "claimed", "void"]).default("active").notNull(),
  documentUrl: text("document_url"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("warranties_tenant_idx").on(table.tenantId),
  index("warranties_vehicle_idx").on(table.vehicleId),
  index("warranties_status_idx").on(table.status),
  index("warranties_dates_idx").on(table.startDate, table.endDate),
]);

// Warranty Claims
export const warrantyClaims = mysqlTable("warranty_claims", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  warrantyId: bigint("warranty_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
  jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }),
  claimNumber: varchar("claim_number", { length: 50 }).notNull().unique(),
  claimDate: date("claim_date", { mode: "string" }).notNull(),
  failureDescription: text("failure_description").notNull(),
  failureDate: date("failure_date", { mode: "string" }),
  mileageAtFailure: int("mileage_at_failure"),
  partsReplaced: json("parts_replaced"),
  laborHours: decimal("labor_hours", { precision: 8, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).default("0"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  claimedAmount: decimal("claimed_amount", { precision: 10, scale: 2 }),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "submitted", "pending_approval", "approved", "rejected", "paid", "partial"]).default("draft").notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  rejectionReason: text("rejection_reason"),
  approverComments: text("approver_comments"),
  attachments: json("attachments"), // Photos, receipts, etc.
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("warranty_claims_tenant_idx").on(table.tenantId),
  index("warranty_claims_warranty_idx").on(table.warrantyId),
  index("warranty_claims_vehicle_idx").on(table.vehicleId),
  index("warranty_claims_status_idx").on(table.status),
  index("warranty_claims_date_idx").on(table.claimDate),
]);

// Service Reminders
export const serviceReminders = mysqlTable("service_reminders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  reminderType: mysqlEnum("reminder_type", ["scheduled_maintenance", "oil_change", "tire_rotation", "inspection", "registration_renewal", "insurance_renewal", "warranty_expiry", "custom"]).notNull(),
  serviceTitle: varchar("service_title", { length: 255 }).notNull(),
  serviceDescription: text("service_description"),
  dueDate: date("due_date", { mode: "string" }),
  dueMileage: int("due_mileage"),
  currentMileage: int("current_mileage"),
  reminderIntervalDays: int("reminder_interval_days"),
  reminderIntervalMiles: int("reminder_interval_miles"),
  lastServiceDate: date("last_service_date", { mode: "string" }),
  lastServiceMileage: int("last_service_mileage"),
  priority: mysqlEnum("priority", ["low", "normal", "high", "critical"]).default("normal"),
  notificationMethod: json("notification_method"), // ["sms", "email", "whatsapp", "app"]
  autoSchedule: boolean("auto_schedule").default(false),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["active", "sent", "scheduled", "completed", "snoozed", "cancelled"]).default("active").notNull(),
  sentAt: timestamp("sent_at"),
  snoozedUntil: date("snoozed_until", { mode: "string" }),
  completedAt: timestamp("completed_at"),
  completedJobCardId: bigint("completed_job_card_id", { mode: "number", unsigned: true }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("service_reminders_tenant_idx").on(table.tenantId),
  index("service_reminders_vehicle_idx").on(table.vehicleId),
  index("service_reminders_customer_idx").on(table.customerId),
  index("service_reminders_due_date_idx").on(table.dueDate),
  index("service_reminders_status_idx").on(table.status),
]);

// Service History
export const serviceHistory = mysqlTable("service_history", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
  jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }),
  serviceDate: date("service_date", { mode: "string" }).notNull(),
  mileage: int("mileage"),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  servicesPerformed: json("services_performed"),
  partsReplaced: json("parts_replaced"),
  technicianId: bigint("technician_id", { mode: "number", unsigned: true }),
  laborHours: decimal("labor_hours", { precision: 8, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  nextServiceDue: date("next_service_due", { mode: "string" }),
  nextServiceMileage: int("next_service_mileage"),
  recommendations: text("recommendations"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("service_history_tenant_idx").on(table.tenantId),
  index("service_history_vehicle_idx").on(table.vehicleId),
  index("service_history_date_idx").on(table.serviceDate),
]);

// Vehicle Parts Inventory
export const vehicleParts = mysqlTable("vehicle_parts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  partNumber: varchar("part_number", { length: 100 }).notNull(),
  partName: varchar("part_name", { length: 255 }).notNull(),
  description: text("description"),
  manufacturer: varchar("manufacturer", { length: 255 }),
  category: varchar("category", { length: 100 }), // Engine, Brakes, Electrical, etc.
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleYear: varchar("vehicle_year", { length: 10 }),
  compatibleVehicles: json("compatible_vehicles"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  quantityInStock: int("quantity_in_stock").default(0),
  reorderLevel: int("reorder_level").default(5),
  reorderQuantity: int("reorder_quantity").default(10),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  warehouseLocation: varchar("warehouse_location", { length: 100 }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("vehicle_parts_tenant_idx").on(table.tenantId),
  index("vehicle_parts_number_idx").on(table.partNumber),
  index("vehicle_parts_category_idx").on(table.category),
  index("vehicle_parts_stock_idx").on(table.quantityInStock),
]);

// Parts Usage (linked to job cards)
export const partsUsage = mysqlTable("parts_usage", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }).notNull(),
  partId: bigint("part_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  isWarrantyClaim: boolean("is_warranty_claim").default(false),
  warrantyClaimId: bigint("warranty_claim_id", { mode: "number", unsigned: true }),
  issuedBy: bigint("issued_by", { mode: "number", unsigned: true }),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
}, (table) => [
  index("parts_usage_tenant_idx").on(table.tenantId),
  index("parts_usage_job_card_idx").on(table.jobCardId),
  index("parts_usage_part_idx").on(table.partId),
]);

// Job Card Labor Details
export const jobCardLabor = mysqlTable("job_card_labor", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  jobCardId: bigint("job_card_id", { mode: "number", unsigned: true }).notNull(),
  technicianId: bigint("technician_id", { mode: "number", unsigned: true }).notNull(),
  serviceDescription: varchar("service_description", { length: 255 }).notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  hoursWorked: decimal("hours_worked", { precision: 8, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  isWarrantyClaim: boolean("is_warranty_claim").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("job_card_labor_tenant_idx").on(table.tenantId),
  index("job_card_labor_job_card_idx").on(table.jobCardId),
  index("job_card_labor_technician_idx").on(table.technicianId),
]);

// Vehicle Inspection Checklist Items
export const inspectionChecklistItems = mysqlTable("inspection_checklist_items", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Engine, Brakes, Tires, Lights, etc.
  itemName: varchar("item_name", { length: 255 }).notNull(),
  condition: mysqlEnum("condition", ["good", "fair", "poor", "failed", "not_applicable"]).notNull(),
  notes: text("notes"),
  requiresAttention: boolean("requires_attention").default(false),
  priorityLevel: mysqlEnum("priority_level", ["low", "medium", "high", "critical"]).default("low"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  photo: text("photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("inspection_checklist_items_tenant_idx").on(table.tenantId),
  index("inspection_checklist_items_inspection_idx").on(table.inspectionId),
]);

export type Warranty = typeof warranties.$inferSelect;
export type InsertWarranty = typeof warranties.$inferInsert;
export type WarrantyClaim = typeof warrantyClaims.$inferSelect;
export type InsertWarrantyClaim = typeof warrantyClaims.$inferInsert;
export type ServiceReminder = typeof serviceReminders.$inferSelect;
export type InsertServiceReminder = typeof serviceReminders.$inferInsert;
export type ServiceHistory = typeof serviceHistory.$inferSelect;
export type InsertServiceHistory = typeof serviceHistory.$inferInsert;
export type VehiclePart = typeof vehicleParts.$inferSelect;
export type InsertVehiclePart = typeof vehicleParts.$inferInsert;
export type PartsUsage = typeof partsUsage.$inferSelect;
export type InsertPartsUsage = typeof partsUsage.$inferInsert;
export type JobCardLabor = typeof jobCardLabor.$inferSelect;
export type InsertJobCardLabor = typeof jobCardLabor.$inferInsert;
export type InspectionChecklistItem = typeof inspectionChecklistItems.$inferSelect;
export type InsertInspectionChecklistItem = typeof inspectionChecklistItems.$inferInsert;
