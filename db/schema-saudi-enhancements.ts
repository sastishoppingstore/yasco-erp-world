/**
 * YASCO ERP - Saudi Arabia Market Enhancements
 * Database Schema Extensions for ZATCA Phase 2, Saudi Labor Law, and Market Requirements
 * 
 * This file contains schema additions that enhance the existing system without breaking changes.
 * All changes are additive - existing columns remain untouched.
 * 
 * @date 2026-07-03
 */

import {
  mysqlTable,
  serial,
  varchar,
  text,
  bigint,
  decimal,
  boolean,
  timestamp,
  date,
  mysqlEnum,
  json,
  index,
  int,
  unique,
} from "drizzle-orm/mysql-core";

// =====================================================
// 1. COMPANY LEGAL PROFILE - SAUDI ENHANCEMENTS
// =====================================================

/**
 * Enhanced companies table with Saudi Arabia specific fields
 * Extends existing companies table with trade names, national address, and compliance fields
 */
export const companiesSaudiEnhancement = mysqlTable("companies", {
  // ... existing fields remain ...
  
  // Trade Names
  tradeNameEn: varchar("trade_name_en", { length: 255 }),
  tradeNameAr: varchar("trade_name_ar", { length: 255 }),
  legalNameAr: varchar("legal_name_ar", { length: 255 }),
  
  // Saudi Legal Registration
  commercialRegistration: varchar("commercial_registration", { length: 100 }), // CR Number
  crExpiryDate: date("cr_expiry_date", { mode: "string" }),
  vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }), // 15-digit Saudi VAT / TIN
  vatCertificateExpiryDate: date("vat_certificate_expiry_date", { mode: "string" }),
  
  // Branch Information
  branchCode: varchar("branch_code", { length: 50 }),
  branchCr: varchar("branch_cr", { length: 100 }),
  
  // Saudi National Address
  buildingNumber: varchar("building_number", { length: 10 }),
  streetName: varchar("street_name", { length: 255 }),
  streetNameAr: varchar("street_name_ar", { length: 255 }),
  district: varchar("district", { length: 255 }),
  districtAr: varchar("district_ar", { length: 255 }),
  cityName: varchar("city_name", { length: 100 }),
  cityNameAr: varchar("city_name_ar", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  additionalNumber: varchar("additional_number", { length: 10 }),
  
  // Bank Information
  bankName: varchar("bank_name", { length: 255 }),
  bankNameAr: varchar("bank_name_ar", { length: 255 }),
  iban: varchar("iban", { length: 34 }), // Saudi IBAN is 24 chars, but allow up to 34 for international
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  swiftCode: varchar("swift_code", { length: 11 }),
  
  // Branding Assets
  logoUrl: text("logo_url"),
  stampUrl: text("stamp_url"),
  signatureUrl: text("signature_url"),
  brandPrimaryColor: varchar("brand_primary_color", { length: 7 }).default("#1e40af"), // Hex color
  brandSecondaryColor: varchar("brand_secondary_color", { length: 7 }).default("#3b82f6"),
  invoiceHeaderColor: varchar("invoice_header_color", { length: 7 }).default("#1e40af"),
  companyWebsite: varchar("company_website", { length: 255 }),
  companyEmail: varchar("company_email", { length: 320 }),
  companyPhone: varchar("company_phone", { length: 50 }),
  companyMobile: varchar("company_mobile", { length: 50 }),
  companyWhatsapp: varchar("company_whatsapp", { length: 50 }),
  
  // Tax Configuration
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 2 }).default("15.00").notNull(),
  defaultTaxRateEffectiveDate: date("default_tax_rate_effective_date", { mode: "string" }),
  
  // Invoice Configuration
  invoicePrefix: varchar("invoice_prefix", { length: 10 }).default("INV"),
  quotationPrefix: varchar("quotation_prefix", { length: 10 }).default("QT"),
  orderPrefix: varchar("order_prefix", { length: 10 }).default("SO"),
  poPrefix: varchar("po_prefix", { length: 10 }).default("PO"),
  invoiceTermsEn: text("invoice_terms_en"),
  invoiceTermsAr: text("invoice_terms_ar"),
  
  // White Label Settings
  whiteLabelEnabled: boolean("white_label_enabled").default(true),
  allowCustomBranding: boolean("allow_custom_branding").default(true),
  
  // ZATCA Invoice Counter (immutable after first invoice)
  invoiceCounter: int("invoice_counter").default(0).notNull(),
  lastInvoiceNumber: varchar("last_invoice_number", { length: 100 }),
});

// =====================================================
// 2. TAX RATE HISTORY - FOR AUDIT TRAIL
// =====================================================

/**
 * Tax Rate History
 * Track all changes to default tax rate with effective dates
 * Required for audit and to ensure old invoices maintain their original tax rate
 */
export const taxRateHistory = mysqlTable("tax_rate_history", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(),
  effectiveDate: date("effective_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }), // null = currently active
  reason: text("reason"),
  changedBy: bigint("changed_by", { mode: "number", unsigned: true }),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
}, (table) => [
  index("tax_rate_history_tenant_idx").on(table.tenantId),
  index("tax_rate_history_date_idx").on(table.effectiveDate),
]);

export type TaxRateHistory = typeof taxRateHistory.$inferSelect;
export type InsertTaxRateHistory = typeof taxRateHistory.$inferInsert;

// =====================================================
// 3. TAX CATEGORIES - SAUDI TAX SYSTEM
// =====================================================

/**
 * Tax Categories
 * Saudi Arabia has multiple VAT treatment categories
 */
export const taxCategories = mysqlTable("tax_categories", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "standard", // 15% VAT
    "zero_rated", // 0% VAT but input VAT can be reclaimed
    "exempt", // No VAT, input VAT cannot be reclaimed
    "out_of_scope", // Not subject to VAT
    "reverse_charge", // Customer pays VAT directly to ZATCA
  ]).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("tax_categories_tenant_idx").on(table.tenantId),
  unique("tax_categories_code").on(table.tenantId, table.code),
]);

export type TaxCategory = typeof taxCategories.$inferSelect;
export type InsertTaxCategory = typeof taxCategories.$inferInsert;

// =====================================================
// 4. CUSTOMERS - SAUDI ENHANCEMENTS
// =====================================================

/**
 * Enhanced customers table with Saudi Arabia B2B/B2C requirements
 */
export const customersSaudiEnhancement = mysqlTable("customers", {
  // ... existing fields remain ...
  
  // Customer Classification
  customerType: mysqlEnum("customer_type", [
    "b2b", // Business to Business (requires CR and VAT)
    "b2c", // Business to Consumer (individual)
    "government", // Government entity
    "cash_customer", // Walk-in cash customer
  ]).default("b2c").notNull(),
  
  // Saudi Legal Registration
  commercialRegistration: varchar("commercial_registration", { length: 100 }), // CR Number
  vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }), // 15-digit Saudi VAT / TIN
  
  // Saudi National Address
  buildingNumber: varchar("building_number", { length: 10 }),
  streetName: varchar("street_name", { length: 255 }),
  streetNameAr: varchar("street_name_ar", { length: 255 }),
  district: varchar("district", { length: 255 }),
  districtAr: varchar("district_ar", { length: 255 }),
  cityName: varchar("city_name", { length: 100 }),
  cityNameAr: varchar("city_name_ar", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  additionalNumber: varchar("additional_number", { length: 10 }),
  
  // Contact Information
  contactPerson: varchar("contact_person", { length: 255 }),
  contactJobTitle: varchar("contact_job_title", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  
  // Financial Information
  openingBalanceDate: date("opening_balance_date", { mode: "string" }),
  creditLimitCheckEnabled: boolean("credit_limit_check_enabled").default(true),
  
  // Customer Category/Segment
  customerCategory: varchar("customer_category", { length: 100 }), // VIP, Regular, Wholesale, etc.
  customerSegment: varchar("customer_segment", { length: 100 }), // Retail, Corporate, Government, etc.
  
  // Tax Settings
  taxCategoryId: bigint("tax_category_id", { mode: "number", unsigned: true }), // Link to tax_categories
  
  // Warnings and Validations
  vatValidated: boolean("vat_validated").default(false),
  crValidated: boolean("cr_validated").default(false),
  lastVatCheckDate: timestamp("last_vat_check_date"),
  lastCrCheckDate: timestamp("last_cr_check_date"),
});

// =====================================================
// 5. SUPPLIERS - SAUDI ENHANCEMENTS
// =====================================================

/**
 * Enhanced suppliers table with Saudi Arabia requirements
 */
export const suppliersSaudiEnhancement = mysqlTable("suppliers", {
  // ... existing fields remain ...
  
  // Legal Names (separate from trade name)
  legalNameEn: varchar("legal_name_en", { length: 255 }),
  legalNameAr: varchar("legal_name_ar", { length: 255 }),
  tradeNameEn: varchar("trade_name_en", { length: 255 }),
  tradeNameAr: varchar("trade_name_ar", { length: 255 }),
  
  // Saudi Legal Registration
  commercialRegistration: varchar("commercial_registration", { length: 100 }), // CR Number
  vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }), // 15-digit Saudi VAT / TIN
  
  // Saudi National Address
  buildingNumber: varchar("building_number", { length: 10 }),
  streetName: varchar("street_name", { length: 255 }),
  streetNameAr: varchar("street_name_ar", { length: 255 }),
  district: varchar("district", { length: 255 }),
  districtAr: varchar("district_ar", { length: 255 }),
  cityName: varchar("city_name", { length: 100 }),
  cityNameAr: varchar("city_name_ar", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  additionalNumber: varchar("additional_number", { length: 10 }),
  
  // Bank Information
  bankName: varchar("bank_name", { length: 255 }),
  bankNameAr: varchar("bank_name_ar", { length: 255 }),
  iban: varchar("iban", { length: 34 }),
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  
  // Contact Information
  contactPerson: varchar("contact_person", { length: 255 }),
  contactJobTitle: varchar("contact_job_title", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  
  // Financial Information
  openingBalanceDate: date("opening_balance_date", { mode: "string" }),
  
  // Supplier Category
  supplierCategory: varchar("supplier_category", { length: 100 }), // Local, International, Service Provider, etc.
  supplierType: varchar("supplier_type", { length: 100 }), // Manufacturer, Distributor, Contractor, etc.
  
  // Tax Settings
  taxCategoryId: bigint("tax_category_id", { mode: "number", unsigned: true }),
  
  // Validations
  vatValidated: boolean("vat_validated").default(false),
  crValidated: boolean("cr_validated").default(false),
  lastVatCheckDate: timestamp("last_vat_check_date"),
  lastCrCheckDate: timestamp("last_cr_check_date"),
});

// =====================================================
// 6. ATTACHMENTS - FOR CR, VAT CERTIFICATES, CONTRACTS
// =====================================================

/**
 * Attachments Table
 * Store documents for customers, suppliers, invoices, employees, projects
 */
export const attachments = mysqlTable("attachments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  entityType: mysqlEnum("entity_type", [
    "customer",
    "supplier",
    "employee",
    "invoice",
    "quotation",
    "purchase_order",
    "project",
    "contract",
    "product",
    "other",
  ]).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }).notNull(),
  documentType: mysqlEnum("document_type", [
    "cr_certificate", // Commercial Registration
    "vat_certificate", // VAT Registration Certificate
    "contract",
    "purchase_order",
    "invoice",
    "receipt",
    "iqama", // Resident ID
    "passport",
    "work_permit",
    "gosi_certificate",
    "insurance",
    "other",
  ]).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: int("file_size"), // in bytes
  filePath: text("file_path").notNull(), // S3/local path
  mimeType: varchar("mime_type", { length: 100 }),
  description: text("description"),
  expiryDate: date("expiry_date", { mode: "string" }), // for documents that expire
  reminderDays: int("reminder_days").default(30), // days before expiry to send reminder
  uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
}, (table) => [
  index("attachments_tenant_idx").on(table.tenantId),
  index("attachments_entity_idx").on(table.entityType, table.entityId),
  index("attachments_expiry_idx").on(table.expiryDate),
]);

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

// =====================================================
// 7. BRANCHES - SAUDI ENHANCEMENTS
// =====================================================

/**
 * Branches Table Enhancement
 * Each branch may have its own CR, address, and ZATCA EGS device
 */
export const branches = mysqlTable("branches", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  
  // Branch Legal Information
  commercialRegistration: varchar("commercial_registration", { length: 100 }),
  vatRegistrationNumber: varchar("vat_registration_number", { length: 15 }),
  
  // Saudi National Address
  buildingNumber: varchar("building_number", { length: 10 }),
  streetName: varchar("street_name", { length: 255 }),
  streetNameAr: varchar("street_name_ar", { length: 255 }),
  district: varchar("district", { length: 255 }),
  districtAr: varchar("district_ar", { length: 255 }),
  cityName: varchar("city_name", { length: 100 }),
  cityNameAr: varchar("city_name_ar", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  additionalNumber: varchar("additional_number", { length: 10 }),
  
  // Contact Information
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  
  // Branch Manager
  managerId: bigint("manager_id", { mode: "number", unsigned: true }),
  
  // Branch Settings
  isHeadOffice: boolean("is_head_office").default(false),
  isActive: boolean("is_active").default(true),
  
  // ZATCA EGS Devices for this branch
  egsDevices: json("egs_devices"), // Array of device UUIDs
  
  // Invoice Counter per Branch
  invoiceCounter: int("invoice_counter").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("branches_tenant_idx").on(table.tenantId),
  unique("branches_code").on(table.tenantId, table.code),
]);

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;

// =====================================================
// 8. ZATCA EGS DEVICES - FOR PHASE 2 COMPLIANCE
// =====================================================

/**
 * ZATCA EGS Devices
 * Each device (POS terminal, branch, etc.) that issues invoices needs its own EGS registration
 */
export const zatcaEgsDevices = mysqlTable("zatca_egs_devices", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }),
  deviceUuid: varchar("device_uuid", { length: 255 }).notNull(), // UUID for ZATCA
  deviceName: varchar("device_name", { length: 255 }).notNull(),
  deviceType: mysqlEnum("device_type", [
    "pos_terminal",
    "desktop",
    "mobile",
    "web",
    "kiosk",
  ]).notNull(),
  serialNumber: varchar("serial_number", { length: 255 }),
  
  // ZATCA Onboarding Status
  onboardingStatus: mysqlEnum("onboarding_status", [
    "not_started",
    "csr_generated",
    "compliance_csid_obtained",
    "compliance_check_passed",
    "production_csid_obtained",
    "active",
    "suspended",
  ]).default("not_started").notNull(),
  
  // ZATCA Credentials (encrypted)
  complianceCsid: text("compliance_csid"), // Encrypted
  productionCsid: text("production_csid"), // Encrypted
  privateKey: text("private_key"), // Encrypted
  publicKey: text("public_key"),
  certificate: text("certificate"),
  csrContent: text("csr_content"),
  
  // Invoice Counter for this device
  invoiceCounter: int("invoice_counter").default(0).notNull(), // ICV - Invoice Counter Value
  lastInvoiceHash: varchar("last_invoice_hash", { length: 255 }), // PIH - Previous Invoice Hash
  
  // Status
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("zatca_devices_tenant_idx").on(table.tenantId),
  index("zatca_devices_branch_idx").on(table.branchId),
  unique("zatca_devices_uuid").on(table.deviceUuid),
]);

export type ZatcaEgsDevice = typeof zatcaEgsDevices.$inferSelect;
export type InsertZatcaEgsDevice = typeof zatcaEgsDevices.$inferInsert;

// =====================================================
// 9. ZATCA INVOICE ARCHIVE - IMMUTABLE AUDIT TRAIL
// =====================================================

/**
 * ZATCA Invoice Archive
 * Immutable record of all ZATCA-submitted invoices
 * Once created, records cannot be edited or deleted
 */
export const zatcaInvoiceArchive = mysqlTable("zatca_invoice_archive", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  deviceId: bigint("device_id", { mode: "number", unsigned: true }),
  
  // Invoice Identification
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  invoiceType: mysqlEnum("invoice_type", [
    "standard", // B2B - requires clearance
    "simplified", // B2C - reporting only
    "credit_note",
    "debit_note",
  ]).notNull(),
  
  // ZATCA Identifiers
  uuid: varchar("uuid", { length: 255 }).notNull(), // Invoice UUID
  icv: int("icv").notNull(), // Invoice Counter Value
  pih: varchar("pih", { length: 255 }).notNull(), // Previous Invoice Hash
  invoiceHash: varchar("invoice_hash", { length: 255 }).notNull(), // SHA-256 hash
  
  // UBL XML
  ublXml: text("ubl_xml").notNull(),
  
  // QR Code
  qrCode: text("qr_code").notNull(), // TLV base64
  
  // PDF/A-3
  pdfPath: text("pdf_path"),
  
  // Cryptographic Signature
  signature: text("signature"), // ECDSA signature
  signatureAlgorithm: varchar("signature_algorithm", { length: 50 }),
  
  // ZATCA Submission
  submissionStatus: mysqlEnum("submission_status", [
    "draft", // Not yet submitted
    "pending", // Queued for submission
    "cleared", // B2B cleared
    "reported", // B2C reported
    "failed", // Submission failed
    "warning", // Submitted with warnings
    "rejected", // Rejected by ZATCA
  ]).default("draft").notNull(),
  clearanceStatus: varchar("clearance_status", { length: 50 }),
  reportingStatus: varchar("reporting_status", { length: 50 }),
  
  // ZATCA Response
  zatcaRequestId: varchar("zatca_request_id", { length: 255 }),
  zatcaResponse: json("zatca_response"),
  zatcaErrors: json("zatca_errors"),
  zatcaWarnings: json("zatca_warnings"),
  
  // Timestamps
  issuedAt: timestamp("issued_at").notNull(),
  submittedAt: timestamp("submitted_at"),
  clearedAt: timestamp("cleared_at"),
  reportedAt: timestamp("reported_at"),
  
  // Immutability
  isImmutable: boolean("is_immutable").default(true).notNull(), // Cannot edit or delete
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("zatca_archive_tenant_idx").on(table.tenantId),
  index("zatca_archive_invoice_idx").on(table.invoiceId),
  index("zatca_archive_uuid_idx").on(table.uuid),
  index("zatca_archive_status_idx").on(table.submissionStatus),
  unique("zatca_archive_invoice").on(table.tenantId, table.invoiceNumber),
]);

export type ZatcaInvoiceArchive = typeof zatcaInvoiceArchive.$inferSelect;
export type InsertZatcaInvoiceArchive = typeof zatcaInvoiceArchive.$inferInsert;

// =====================================================
// 10. COMPLIANCE ALERTS - CR, VAT, IQAMA EXPIRY
// =====================================================

/**
 * Compliance Alerts
 * Track expiring documents and generate alerts
 */
export const complianceAlerts = mysqlTable("compliance_alerts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  alertType: mysqlEnum("alert_type", [
    "cr_expiry",
    "vat_cert_expiry",
    "csid_expiry",
    "iqama_expiry",
    "passport_expiry",
    "contract_expiry",
    "gosi_non_compliance",
    "low_stock",
    "overdue_invoice",
    "credit_limit_exceeded",
  ]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  message: text("message").notNull(),
  expiryDate: date("expiry_date", { mode: "string" }),
  daysRemaining: int("days_remaining"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "dismissed"]).default("active").notNull(),
  acknowledgedBy: bigint("acknowledged_by", { mode: "number", unsigned: true }),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("compliance_alerts_tenant_idx").on(table.tenantId),
  index("compliance_alerts_type_idx").on(table.alertType),
  index("compliance_alerts_status_idx").on(table.status),
]);

export type ComplianceAlert = typeof complianceAlerts.$inferSelect;
export type InsertComplianceAlert = typeof complianceAlerts.$inferInsert;
