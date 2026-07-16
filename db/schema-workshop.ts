import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const workshopJobCards = sqliteTable("workshop_job_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  customerId: integer("customer_id").notNull(),
  jobNumber: text("job_number").notNull(),
  serviceType: text("service_type").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "in_progress", "quality_check", "completed", "delivered", "cancelled"] }).default("pending").notNull(),
  priority: text("priority", { enum: ["normal", "urgent", "express"] }).default("normal"),
  estimatedCost: text("estimated_cost"),
  actualCost: text("actual_cost"),
  technicianId: integer("technician_id"),
  estimatedHours: real("estimated_hours"),
  actualHours: real("actual_hours"),
  startDate: text("start_date"),
  completionDate: text("completion_date"),
  warrantyMonths: integer("warranty_months").default(3),
  customerApproval: integer("customer_approval", { mode: "boolean" }).default(false),
  approvedAt: text("approved_at"),
  invoiceId: integer("invoice_id"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const workshopJobParts = sqliteTable("workshop_job_parts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobCardId: integer("job_card_id").notNull(),
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  quantity: real("quantity").default(1),
  unitPrice: text("unit_price"),
  totalPrice: text("total_price"),
  supplierId: integer("supplier_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopJobLabor = sqliteTable("workshop_job_labor", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobCardId: integer("job_card_id").notNull(),
  technicianId: integer("technician_id"),
  description: text("description"),
  hours: real("hours"),
  rate: text("rate"),
  total: text("total"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopVehicles = sqliteTable("workshop_vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  customerId: integer("customer_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  plateNumber: text("plate_number"),
  vin: text("vin"),
  color: text("color"),
  mileage: text("mileage"),
  nextServiceMileage: text("next_service_mileage"),
  nextServiceDate: text("next_service_date"),
  insuranceCompany: text("insurance_company"),
  policyNumber: text("policy_number"),
  insuranceExpiry: text("insurance_expiry"),
  registrationExpiry: text("registration_expiry"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopEstimates = sqliteTable("workshop_estimates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  customerId: integer("customer_id").notNull(),
  estimateNumber: text("estimate_number").notNull(),
  status: text("status", { enum: ["draft", "pending", "approved", "rejected", "converted"] }).default("draft").notNull(),
  partsTotal: text("parts_total"),
  laborTotal: text("labor_total"),
  subletTotal: text("sublet_total"),
  taxAmount: text("tax_amount"),
  totalAmount: text("total_amount").notNull(),
  notes: text("notes"),
  sentMethod: text("sent_method"),
  sentAt: text("sent_at"),
  approvedAt: text("approved_at"),
  convertedToJobId: integer("converted_to_job_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopEstimateItems = sqliteTable("workshop_estimate_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  estimateId: integer("estimate_id").notNull(),
  type: text("type", { enum: ["part", "labor", "sublet"] }).notNull(),
  description: text("description").notNull(),
  quantity: real("quantity").default(1),
  unitPrice: text("unit_price"),
  total: text("total"),
});

export const workshopTechnicians = sqliteTable("workshop_technicians", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  specialty: text("specialty"),
  hourlyRate: text("hourly_rate"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  jobsCompleted: integer("jobs_completed").default(0),
  avgRating: real("avg_rating"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopInspections = sqliteTable("workshop_inspections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  jobCardId: integer("job_card_id").notNull(),
  checklistJson: text("checklist_json"),
  photos: text("photos"),
  customerSignature: text("customer_signature"),
  technicianSignature: text("technician_signature"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopServiceTypes = sqliteTable("workshop_service_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  estimatedHours: real("estimated_hours"),
  defaultPrice: text("default_price"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopBaySchedule = sqliteTable("workshop_bay_schedule", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  bayNumber: integer("bay_number").notNull(),
  jobCardId: integer("job_card_id"),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  status: text("status", { enum: ["available", "occupied", "maintenance", "reserved"] }).default("available"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const workshopPayments = sqliteTable("workshop_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  jobCardId: integer("job_card_id"),
  estimateId: integer("estimate_id"),
  amount: text("amount").notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "bank_transfer", "sadad", "wallet", "insurance"] }).default("cash"),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});
