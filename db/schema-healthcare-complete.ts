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
// COMPLETE HEALTHCARE MODULE
// Medical Records, Prescriptions, Vital Signs, Lab Results
// =====================================================

// Medical Records / EMR
export const medicalRecords = mysqlTable("medical_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
  recordNumber: varchar("record_number", { length: 50 }).notNull().unique(),
  recordDate: date("record_date", { mode: "string" }).notNull(),
  doctorId: bigint("doctor_id", { mode: "number", unsigned: true }),
  chiefComplaint: text("chief_complaint"),
  presentIllnessHistory: text("present_illness_history"),
  pastMedicalHistory: text("past_medical_history"),
  familyHistory: text("family_history"),
  socialHistory: text("social_history"),
  allergies: text("allergies"),
  currentMedications: text("current_medications"),
  physicalExamination: text("physical_examination"),
  diagnosis: text("diagnosis"),
  diagnosisCodes: json("diagnosis_codes"), // ICD-10 codes
  treatment: text("treatment"),
  prescriptions: json("prescriptions"),
  labOrders: json("lab_orders"),
  imagingOrders: json("imaging_orders"),
  followUpInstructions: text("follow_up_instructions"),
  followUpDate: date("follow_up_date", { mode: "string" }),
  recordStatus: mysqlEnum("record_status", ["draft", "completed", "reviewed", "signed"]).default("draft"),
  isSigned: boolean("is_signed").default(false),
  signedAt: timestamp("signed_at"),
  signedBy: bigint("signed_by", { mode: "number", unsigned: true }),
  attachments: json("attachments"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("medical_records_tenant_idx").on(table.tenantId),
  index("medical_records_patient_idx").on(table.patientId),
  index("medical_records_doctor_idx").on(table.doctorId),
  index("medical_records_date_idx").on(table.recordDate),
]);

// Prescriptions (Detailed)
export const prescriptionsDetail = mysqlTable("prescriptions_detail", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
  prescriptionNumber: varchar("prescription_number", { length: 50 }).notNull().unique(),
  prescriptionDate: date("prescription_date", { mode: "string" }).notNull(),
  doctorId: bigint("doctor_id", { mode: "number", unsigned: true }).notNull(),
  medicationName: varchar("medication_name", { length: 255 }).notNull(),
  medicationCode: varchar("medication_code", { length: 100 }), // NDC or local code
  genericName: varchar("generic_name", { length: 255 }),
  strength: varchar("strength", { length: 50 }),
  dosageForm: varchar("dosage_form", { length: 50 }), // tablet, capsule, syrup, injection
  route: varchar("route", { length: 50 }), // oral, IV, IM, topical
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }),
  durationDays: int("duration_days"),
  quantity: int("quantity").notNull(),
  refills: int("refills").default(0),
  instructions: text("instructions"),
  indicationsForUse: text("indications_for_use"),
  warnings: text("warnings"),
  isControlledSubstance: boolean("is_controlled_substance").default(false),
  controlledSubstanceSchedule: varchar("controlled_substance_schedule", { length: 10 }),
  substitutionAllowed: boolean("substitution_allowed").default(true),
  status: mysqlEnum("status", ["active", "dispensed", "partial", "discontinued", "expired", "cancelled"]).default("active").notNull(),
  dispensedAt: timestamp("dispensed_at"),
  dispensedBy: bigint("dispensed_by", { mode: "number", unsigned: true }),
  dispensedQuantity: int("dispensed_quantity"),
  pharmacyNotes: text("pharmacy_notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("prescriptions_detail_tenant_idx").on(table.tenantId),
  index("prescriptions_detail_patient_idx").on(table.patientId),
  index("prescriptions_detail_doctor_idx").on(table.doctorId),
  index("prescriptions_detail_date_idx").on(table.prescriptionDate),
  index("prescriptions_detail_status_idx").on(table.status),
]);

// Vital Signs
export const vitalSigns = mysqlTable("vital_signs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
  appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // Celsius
  temperatureUnit: varchar("temperature_unit", { length: 1 }).default("C"), // C or F
  bloodPressureSystolic: int("blood_pressure_systolic"),
  bloodPressureDiastolic: int("blood_pressure_diastolic"),
  heartRate: int("heart_rate"), // BPM
  respiratoryRate: int("respiratory_rate"), // breaths per minute
  oxygenSaturation: decimal("oxygen_saturation", { precision: 5, scale: 2 }), // SpO2 %
  weight: decimal("weight", { precision: 8, scale: 2 }), // kg
  weightUnit: varchar("weight_unit", { length: 3 }).default("kg"),
  height: decimal("height", { precision: 8, scale: 2 }), // cm
  heightUnit: varchar("height_unit", { length: 3 }).default("cm"),
  bmi: decimal("bmi", { precision: 5, scale: 2 }),
  headCircumference: decimal("head_circumference", { precision: 5, scale: 2 }), // for pediatrics
  painScore: int("pain_score"), // 0-10 scale
  glucoseLevel: decimal("glucose_level", { precision: 6, scale: 2 }), // mg/dL
  notes: text("notes"),
  recordedBy: bigint("recorded_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vital_signs_tenant_idx").on(table.tenantId),
  index("vital_signs_patient_idx").on(table.patientId),
  index("vital_signs_date_idx").on(table.recordedAt),
]);

// Lab Results
export const labResults = mysqlTable("lab_results", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  labOrderId: bigint("lab_order_id", { mode: "number", unsigned: true }),
  resultNumber: varchar("result_number", { length: 50 }).notNull().unique(),
  testName: varchar("test_name", { length: 255 }).notNull(),
  testCode: varchar("test_code", { length: 100 }),
  testCategory: varchar("test_category", { length: 100 }), // Hematology, Biochemistry, Microbiology, etc.
  specimenType: varchar("specimen_type", { length: 100 }), // blood, urine, stool, etc.
  collectionDate: timestamp("collection_date"),
  receivedDate: timestamp("received_date"),
  reportedDate: timestamp("reported_date"),
  result: text("result"),
  resultValue: varchar("result_value", { length: 255 }),
  resultUnit: varchar("result_unit", { length: 50 }),
  referenceRange: varchar("reference_range", { length: 255 }),
  isAbnormal: boolean("is_abnormal").default(false),
  abnormalFlag: varchar("abnormal_flag", { length: 10 }), // H (High), L (Low), HH, LL
  interpretation: text("interpretation"),
  methodology: varchar("methodology", { length: 255 }),
  performedBy: varchar("performed_by", { length: 255 }),
  verifiedBy: bigint("verified_by", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "reviewed", "cancelled"]).default("pending").notNull(),
  attachments: json("attachments"), // PDF reports, images
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("lab_results_tenant_idx").on(table.tenantId),
  index("lab_results_patient_idx").on(table.patientId),
  index("lab_results_order_idx").on(table.labOrderId),
  index("lab_results_date_idx").on(table.reportedDate),
]);

// Radiology/Imaging Orders
export const radiologyOrders = mysqlTable("radiology_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  orderDate: date("order_date", { mode: "string" }).notNull(),
  orderedBy: bigint("ordered_by", { mode: "number", unsigned: true }).notNull(),
  examType: varchar("exam_type", { length: 255 }).notNull(), // X-Ray, CT, MRI, Ultrasound, etc.
  examCode: varchar("exam_code", { length: 100 }),
  bodyPart: varchar("body_part", { length: 255 }),
  contrast: boolean("contrast").default(false),
  clinicalIndication: text("clinical_indication"),
  urgency: mysqlEnum("urgency", ["routine", "urgent", "stat"]).default("routine"),
  status: mysqlEnum("status", ["ordered", "scheduled", "in_progress", "completed", "reported", "cancelled"]).default("ordered").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  performedDate: timestamp("performed_date"),
  reportedDate: timestamp("reported_date"),
  findings: text("findings"),
  impression: text("impression"),
  radiologistId: bigint("radiologist_id", { mode: "number", unsigned: true }),
  images: json("images"), // URLs or file paths
  reportAttachment: text("report_attachment"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("radiology_orders_tenant_idx").on(table.tenantId),
  index("radiology_orders_patient_idx").on(table.patientId),
  index("radiology_orders_date_idx").on(table.orderDate),
]);

// Patient Allergies
export const patientAllergies = mysqlTable("patient_allergies", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  allergyType: mysqlEnum("allergy_type", ["drug", "food", "environmental", "other"]).notNull(),
  allergen: varchar("allergen", { length: 255 }).notNull(),
  allergenCode: varchar("allergen_code", { length: 100 }),
  reaction: text("reaction"),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe", "fatal"]).default("mild"),
  onsetDate: date("onset_date", { mode: "string" }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  verifiedBy: bigint("verified_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("patient_allergies_tenant_idx").on(table.tenantId),
  index("patient_allergies_patient_idx").on(table.patientId),
]);

// Immunizations/Vaccinations
export const immunizations = mysqlTable("immunizations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  vaccineName: varchar("vaccine_name", { length: 255 }).notNull(),
  vaccineCode: varchar("vaccine_code", { length: 100 }), // CVX code
  doseNumber: int("dose_number"),
  totalDoses: int("total_doses"),
  administrationDate: date("administration_date", { mode: "string" }).notNull(),
  expirationDate: date("expiration_date", { mode: "string" }),
  lotNumber: varchar("lot_number", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  route: varchar("route", { length: 50 }), // IM, SC, oral
  site: varchar("site", { length: 100 }), // left arm, right arm, etc.
  administeredBy: bigint("administered_by", { mode: "number", unsigned: true }),
  nextDueDate: date("next_due_date", { mode: "string" }),
  adverseReaction: text("adverse_reaction"),
  notes: text("notes"),
  attachments: json("attachments"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("immunizations_tenant_idx").on(table.tenantId),
  index("immunizations_patient_idx").on(table.patientId),
  index("immunizations_date_idx").on(table.administrationDate),
]);

// Patient Billing (Healthcare)
export const healthcareBilling = mysqlTable("healthcare_billing", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
  medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
  billNumber: varchar("bill_number", { length: 50 }).notNull().unique(),
  billDate: date("bill_date", { mode: "string" }).notNull(),
  consultationFee: decimal("consultation_fee", { precision: 18, scale: 4 }).default("0"),
  procedureFee: decimal("procedure_fee", { precision: 18, scale: 4 }).default("0"),
  medicationFee: decimal("medication_fee", { precision: 18, scale: 4 }).default("0"),
  labFee: decimal("lab_fee", { precision: 18, scale: 4 }).default("0"),
  imagingFee: decimal("imaging_fee", { precision: 18, scale: 4 }).default("0"),
  roomCharges: decimal("room_charges", { precision: 18, scale: 4 }).default("0"),
  otherCharges: decimal("other_charges", { precision: 18, scale: 4 }).default("0"),
  subtotal: decimal("subtotal", { precision: 18, scale: 4 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
  insuranceCoverage: decimal("insurance_coverage", { precision: 18, scale: 4 }).default("0"),
  patientResponsibility: decimal("patient_responsibility", { precision: 18, scale: 4 }),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 18, scale: 4 }),
  paymentStatus: mysqlEnum("payment_status", ["unpaid", "partial", "paid", "refunded", "cancelled"]).default("unpaid"),
  insuranceClaimId: bigint("insurance_claim_id", { mode: "number", unsigned: true }),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }), // Link to ZATCA invoice
  lineItems: json("line_items"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("healthcare_billing_tenant_idx").on(table.tenantId),
  index("healthcare_billing_patient_idx").on(table.patientId),
  index("healthcare_billing_date_idx").on(table.billDate),
  index("healthcare_billing_status_idx").on(table.paymentStatus),
]);

// Consent Forms
export const patientConsents = mysqlTable("patient_consents", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  consentType: varchar("consent_type", { length: 100 }).notNull(), // treatment, surgery, data sharing, etc.
  consentTitle: varchar("consent_title", { length: 255 }).notNull(),
  consentText: text("consent_text").notNull(),
  procedureDescription: text("procedure_description"),
  risksAndBenefits: text("risks_and_benefits"),
  alternatives: text("alternatives"),
  isGranted: boolean("is_granted").notNull(),
  signedByPatient: boolean("signed_by_patient").default(false),
  signedByGuardian: boolean("signed_by_guardian").default(false),
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianRelationship: varchar("guardian_relationship", { length: 100 }),
  signatureData: text("signature_data"), // Base64 signature image
  signedAt: timestamp("signed_at"),
  witnessName: varchar("witness_name", { length: 255 }),
  witnessSignature: text("witness_signature"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  notes: text("notes"),
  attachments: json("attachments"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("patient_consents_tenant_idx").on(table.tenantId),
  index("patient_consents_patient_idx").on(table.patientId),
]);

// Medical Procedures
export const medicalProcedures = mysqlTable("medical_procedures", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  medicalRecordId: bigint("medical_record_id", { mode: "number", unsigned: true }),
  procedureCode: varchar("procedure_code", { length: 100 }), // CPT or local code
  procedureName: varchar("procedure_name", { length: 255 }).notNull(),
  procedureDate: timestamp("procedure_date").notNull(),
  performedBy: bigint("performed_by", { mode: "number", unsigned: true }).notNull(),
  assistants: json("assistants"), // Array of user IDs
  anesthesiaType: varchar("anesthesia_type", { length: 100 }),
  indication: text("indication"),
  procedureDetails: text("procedure_details"),
  complications: text("complications"),
  outcome: text("outcome"),
  postOpInstructions: text("post_op_instructions"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date", { mode: "string" }),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
  duration: int("duration"), // minutes
  notes: text("notes"),
  attachments: json("attachments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("medical_procedures_tenant_idx").on(table.tenantId),
  index("medical_procedures_patient_idx").on(table.patientId),
  index("medical_procedures_date_idx").on(table.procedureDate),
]);

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;
export type PrescriptionDetail = typeof prescriptionsDetail.$inferSelect;
export type InsertPrescriptionDetail = typeof prescriptionsDetail.$inferInsert;
export type VitalSign = typeof vitalSigns.$inferSelect;
export type InsertVitalSign = typeof vitalSigns.$inferInsert;
export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = typeof labResults.$inferInsert;
export type RadiologyOrder = typeof radiologyOrders.$inferSelect;
export type InsertRadiologyOrder = typeof radiologyOrders.$inferInsert;
export type PatientAllergy = typeof patientAllergies.$inferSelect;
export type InsertPatientAllergy = typeof patientAllergies.$inferInsert;
export type Immunization = typeof immunizations.$inferSelect;
export type InsertImmunization = typeof immunizations.$inferInsert;
export type HealthcareBilling = typeof healthcareBilling.$inferSelect;
export type InsertHealthcareBilling = typeof healthcareBilling.$inferInsert;
export type PatientConsent = typeof patientConsents.$inferSelect;
export type InsertPatientConsent = typeof patientConsents.$inferInsert;
export type MedicalProcedure = typeof medicalProcedures.$inferSelect;
export type InsertMedicalProcedure = typeof medicalProcedures.$inferInsert;
