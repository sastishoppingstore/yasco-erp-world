import {
  mysqlTable,
  serial,
  varchar,
  text,
  time,
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
// 1. TENANTS & SaaS
// =====================================================

export const tenants = mysqlTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia").notNull(),
  taxNumber: varchar("tax_number", { length: 100 }),
  registrationNumber: varchar("registration_number", { length: 100 }),
  logo: text("logo"),
  favicon: text("favicon"),
  primaryColor: varchar("primary_color", { length: 20 }).default("#2563eb").notNull(),
  secondaryColor: varchar("secondary_color", { length: 20 }).default("#64748b").notNull(),
  font: varchar("font", { length: 50 }).default("Inter").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Riyadh").notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  dateFormat: varchar("date_format", { length: 20 }).default("DD/MM/YYYY").notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "trial", "cancelled"]).default("trial").notNull(),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  whiteLabelEnabled: boolean("white_label_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// =====================================================
// 1.1 SUBSCRIPTION PLANS
// =====================================================

export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "yearly", "one_time"]).default("monthly"),
  maxUsers: int("max_users").default(5),
  maxBranches: int("max_branches").default(1),
  maxInvoicesPerMonth: int("max_invoices_per_month").default(100),
  maxDevices: int("max_devices").default(2),
  maxStorageGb: int("max_storage_gb").default(5),
  modulesIncluded: json("modules_included"),
  features: json("features"),
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_active").on(table.isActive),
  index("idx_public").on(table.isPublic),
]);

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// =====================================================
// 1.2 TENANT MODULES
// =====================================================

export const tenantModules = mysqlTable("tenant_modules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  moduleName: varchar("module_name", { length: 50 }).notNull(),
  isEnabled: boolean("is_enabled").default(true),
  enabledAt: timestamp("enabled_at"),
  disabledAt: timestamp("disabled_at"),
  enabledBy: int("enabled_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("unique_tenant_module").on(table.tenantId, table.moduleName),
  index("idx_tenant").on(table.tenantId),
  index("idx_module").on(table.moduleName),
  index("idx_enabled").on(table.isEnabled),
]);

export type TenantModule = typeof tenantModules.$inferSelect;
export type InsertTenantModule = typeof tenantModules.$inferInsert;

// =====================================================
// 1.3 TENANT USAGE TRACKING
// =====================================================

export const tenantUsage = mysqlTable("tenant_usage", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  userCount: int("user_count").default(0),
  activeUserCount: int("active_user_count").default(0),
  branchCount: int("branch_count").default(0),
  invoiceCount: int("invoice_count").default(0),
  deviceCount: int("device_count").default(0),
  storageMb: bigint("storage_mb", { mode: "number" }).default(0),
  apiCalls: int("api_calls").default(0),
  snapshotAt: timestamp("snapshot_at").defaultNow().notNull(),
}, (table) => [
  index("idx_tenant").on(table.tenantId),
  index("idx_period").on(table.periodStart, table.periodEnd),
  uniqueIndex("unique_tenant_period").on(table.tenantId, table.periodStart, table.periodEnd),
]);

export type TenantUsage = typeof tenantUsage.$inferSelect;
export type InsertTenantUsage = typeof tenantUsage.$inferInsert;

// =====================================================
// 1.4 TENANT LIMITS OVERRIDE
// =====================================================

export const tenantLimitsOverride = mysqlTable("tenant_limits_override", {
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).primaryKey(),
  maxUsers: int("max_users"),
  maxBranches: int("max_branches"),
  maxInvoicesPerMonth: int("max_invoices_per_month"),
  maxDevices: int("max_devices"),
  maxStorageGb: int("max_storage_gb"),
  overrideReason: text("override_reason"),
  overrideBy: int("override_by"),
  overrideAt: timestamp("override_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type TenantLimitsOverride = typeof tenantLimitsOverride.$inferSelect;
export type InsertTenantLimitsOverride = typeof tenantLimitsOverride.$inferInsert;

// =====================================================
// 1.5 TENANT INVOICES (SaaS Billing)
// =====================================================

export const tenantInvoices = mysqlTable("tenant_invoices", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  subscriptionId: bigint("subscription_id", { mode: "number", unsigned: true }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  status: mysqlEnum("status", ["draft", "issued", "paid", "overdue", "cancelled", "refunded"]).default("draft"),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 255 }),
  notes: text("notes"),
  lineItems: json("line_items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_tenant").on(table.tenantId),
  index("idx_subscription").on(table.subscriptionId),
  index("idx_status").on(table.status),
  index("idx_invoice_date").on(table.invoiceDate),
  index("idx_due_date").on(table.dueDate),
]);

export type TenantInvoice = typeof tenantInvoices.$inferSelect;
export type InsertTenantInvoice = typeof tenantInvoices.$inferInsert;

// =====================================================
// 1.6 PAYMENT TRANSACTIONS
// =====================================================

export const paymentTransactions = mysqlTable("payment_transactions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: int("invoice_id"),
  transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  gateway: varchar("gateway", { length: 50 }).notNull(),
  gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
  gatewayResponse: json("gateway_response"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "refunded"]).default("pending"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_tenant").on(table.tenantId),
  index("idx_invoice").on(table.invoiceId),
  index("idx_status").on(table.status),
  index("idx_gateway").on(table.gateway),
]);

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

// =====================================================
// 1.7 RESELLERS
// =====================================================

export const resellers = mysqlTable("resellers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  whiteLabelEnabled: boolean("white_label_enabled").default(false),
  customDomain: varchar("custom_domain", { length: 255 }),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: varchar("primary_color", { length: 20 }),
  secondaryColor: varchar("secondary_color", { length: 20 }),
  status: mysqlEnum("status", ["active", "suspended", "inactive"]).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_email").on(table.email),
  index("idx_status").on(table.status),
]);

export type Reseller = typeof resellers.$inferSelect;
export type InsertReseller = typeof resellers.$inferInsert;

// =====================================================
// 1.8 RESELLER TENANTS
// =====================================================

export const resellerTenants = mysqlTable("reseller_tenants", {
  id: serial("id").primaryKey(),
  resellerId: int("reseller_id").notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("unique_reseller_tenant").on(table.resellerId, table.tenantId),
  index("idx_reseller").on(table.resellerId),
  index("idx_tenant").on(table.tenantId),
]);

export type ResellerTenant = typeof resellerTenants.$inferSelect;
export type InsertResellerTenant = typeof resellerTenants.$inferInsert;

// =====================================================
// 1.9 RESELLER PAYOUTS
// =====================================================

export const resellerPayouts = mysqlTable("reseller_payouts", {
  id: serial("id").primaryKey(),
  resellerId: int("reseller_id").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }),
  totalCommission: decimal("total_commission", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pending", "processing", "paid", "cancelled"]).default("pending"),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 255 }),
  notes: text("notes"),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_reseller").on(table.resellerId),
  index("idx_period").on(table.periodStart, table.periodEnd),
  index("idx_status").on(table.status),
]);

export type ResellerPayout = typeof resellerPayouts.$inferSelect;
export type InsertResellerPayout = typeof resellerPayouts.$inferInsert;

// =====================================================
// 1.10 ANNOUNCEMENTS
// =====================================================

export const announcements = mysqlTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  targetTenants: json("target_tenants"),
  targetPlans: json("target_plans"),
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_active").on(table.isActive),
  index("idx_start").on(table.startAt),
  index("idx_end").on(table.endAt),
]);

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// =====================================================
// 1.11 FEATURE FLAGS
// =====================================================

export const featureFlags = mysqlTable("feature_flags", {
  id: serial("id").primaryKey(),
  flagName: varchar("flag_name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isGlobalDefault: boolean("is_global_default").default(false),
  enabledTenants: json("enabled_tenants"),
  enabledPlans: json("enabled_plans"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("idx_name").on(table.flagName),
  index("idx_active").on(table.isActive),
]);

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

// =====================================================
// 1.12 SUPPORT IMPERSONATION LOGS
// =====================================================

export const impersonationLogs = mysqlTable("impersonation_logs", {
  id: serial("id").primaryKey(),
  adminUserId: int("admin_user_id").notNull(),
  adminEmail: varchar("admin_email", { length: 320 }),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  targetUserId: int("target_user_id"),
  reason: text("reason").notNull(),
  approvalTicket: varchar("approval_ticket", { length: 100 }),
  sessionToken: varchar("session_token", { length: 255 }),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationSeconds: int("duration_seconds"),
  actionsLog: json("actions_log"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_admin").on(table.adminUserId),
  index("idx_tenant").on(table.tenantId),
  index("idx_started").on(table.startedAt),
]);

export type ImpersonationLog = typeof impersonationLogs.$inferSelect;
export type InsertImpersonationLog = typeof impersonationLogs.$inferInsert;

export const companies = mysqlTable("companies", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().unique(),
  companyCode: varchar("company_code", { length: 100 }),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  countryCode: varchar("country_code", { length: 2 }).default("SA").notNull(),
  baseCurrency: varchar("base_currency", { length: 10 }).default("SAR").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Riyadh").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("companies_tenant_idx").on(table.tenantId),
  index("companies_country_idx").on(table.countryCode),
]);

// =====================================================
// 2. USERS & RBAC
// =====================================================

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["super_admin", "admin", "reseller", "user_admin", "manager", "accountant", "salesman", "cashier", "hr", "store_keeper", "user"]).default("user").notNull(),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  permissions: json("permissions"),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;

export const userRoles = mysqlTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 3. ACCOUNTING & FINANCE
// =====================================================

export const fiscalYears = mysqlTable("fiscal_years", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  isClosed: boolean("is_closed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chartOfAccounts = mysqlTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  accountType: mysqlEnum("account_type", [
    "asset", "liability", "equity", "revenue", "expense", "cost_of_sales"
  ]).notNull(),
  accountCategory: mysqlEnum("account_category", [
    "current_asset", "fixed_asset", "current_liability", "long_term_liability",
    "equity", "revenue", "expense", "cogs", "other_income", "other_expense"
  ]).notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  level: int("level").default(1),
  isBankAccount: boolean("is_bank_account").default(false),
  isCashAccount: boolean("is_cash_account").default(false),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  openingBalance: decimal("opening_balance", { precision: 18, scale: 4 }).default("0").notNull(),
  currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).default("0").notNull(),
  bankName: varchar("bank_name", { length: 255 }),
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  bankIban: varchar("bank_iban", { length: 100 }),
  isActive: boolean("is_active").default(true),
  costCenterEnabled: boolean("cost_center_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("coa_tenant_idx").on(table.tenantId),
  index("coa_code_idx").on(table.code),
]);

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;

export const costCenters = mysqlTable("cost_centers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  budgetAmount: decimal("budget_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  actualAmount: decimal("actual_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = mysqlTable("journal_entries", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  reference: varchar("reference", { length: 100 }),
  referenceType: mysqlEnum("reference_type", ["invoice", "payment", "adjustment", "opening", "closing", "reversal", "other"]).default("other").notNull(),
  description: text("description").notNull(),
  totalDebit: decimal("total_debit", { precision: 18, scale: 4 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 18, scale: 4 }).notNull(),
  isPosted: boolean("is_posted").default(true),
  isReversed: boolean("is_reversed").default(false),
  reversedEntryId: bigint("reversed_entry_id", { mode: "number", unsigned: true }),
  costCenterId: bigint("cost_center_id", { mode: "number", unsigned: true }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("je_tenant_idx").on(table.tenantId),
  index("je_date_idx").on(table.date),
]);

export const journalEntryLines = mysqlTable("journal_entry_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }).notNull(),
  accountId: bigint("account_id", { mode: "number", unsigned: true }).notNull(),
  debit: decimal("debit", { precision: 18, scale: 4 }).default("0").notNull(),
  credit: decimal("credit", { precision: 18, scale: 4 }).default("0").notNull(),
  description: text("description"),
  costCenterId: bigint("cost_center_id", { mode: "number", unsigned: true }),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default("1").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = mysqlTable("budgets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  fiscalYearId: bigint("fiscal_year_id", { mode: "number", unsigned: true }).notNull(),
  accountId: bigint("account_id", { mode: "number", unsigned: true }).notNull(),
  costCenterId: bigint("cost_center_id", { mode: "number", unsigned: true }),
  january: decimal("january", { precision: 18, scale: 4 }).default("0").notNull(),
  february: decimal("february", { precision: 18, scale: 4 }).default("0").notNull(),
  march: decimal("march", { precision: 18, scale: 4 }).default("0").notNull(),
  april: decimal("april", { precision: 18, scale: 4 }).default("0").notNull(),
  may: decimal("may", { precision: 18, scale: 4 }).default("0").notNull(),
  june: decimal("june", { precision: 18, scale: 4 }).default("0").notNull(),
  july: decimal("july", { precision: 18, scale: 4 }).default("0").notNull(),
  august: decimal("august", { precision: 18, scale: 4 }).default("0").notNull(),
  september: decimal("september", { precision: 18, scale: 4 }).default("0").notNull(),
  october: decimal("october", { precision: 18, scale: 4 }).default("0").notNull(),
  november: decimal("november", { precision: 18, scale: 4 }).default("0").notNull(),
  december: decimal("december", { precision: 18, scale: 4 }).default("0").notNull(),
  total: decimal("total", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 4. INVENTORY MANAGEMENT
// =====================================================

export const productCategories = mysqlTable("product_categories", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brands = mysqlTable("brands", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const units = mysqlTable("units", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  conversionFactor: decimal("conversion_factor", { precision: 18, scale: 6 }).default("1").notNull(),
  baseUnitId: bigint("base_unit_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const warehouses = mysqlTable("warehouses", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  managerName: varchar("manager_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  brandId: bigint("brand_id", { mode: "number", unsigned: true }),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }),
  barcode: varchar("barcode", { length: 100 }),
  qrCode: varchar("qr_code", { length: 255 }),
  productType: mysqlEnum("product_type", ["goods", "service", "raw_material", "finished_good"]).default("goods").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 18, scale: 4 }).default("0").notNull(),
  salePrice: decimal("sale_price", { precision: 18, scale: 4 }).default("0").notNull(),
  costMethod: mysqlEnum("cost_method", ["fifo", "lifo", "weighted_average"]).default("fifo").notNull(),
  reorderLevel: int("reorder_level").default(0),
  reorderQuantity: int("reorder_quantity").default(0),
  isActive: boolean("is_active").default(true),
  isTaxable: boolean("is_taxable").default(true),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("15").notNull(),
  weight: decimal("weight", { precision: 10, scale: 4 }),
  dimensions: varchar("dimensions", { length: 100 }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("prod_tenant_idx").on(table.tenantId),
  index("prod_sku_idx").on(table.sku),
]);

export const inventoryBalances = mysqlTable("inventory_balances", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").default(0),
  reservedQuantity: int("reserved_quantity").default(0),
  avgCost: decimal("avg_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  totalValue: decimal("total_value", { precision: 18, scale: 4 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("inv_bal_unique").on(table.productId, table.warehouseId),
]);

export const inventoryMovements = mysqlTable("inventory_movements", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  movementType: mysqlEnum("movement_type", [
    "purchase", "sale", "adjustment", "transfer_in", "transfer_out",
    "return_in", "return_out", "production_in", "production_out", "opening"
  ]).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 18, scale: 4 }),
  totalCost: decimal("total_cost", { precision: 18, scale: 4 }),
  reference: varchar("reference", { length: 100 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  batchNumber: varchar("batch_number", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  expiryDate: date("expiry_date", { mode: "string" }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockTransfers = mysqlTable("stock_transfers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull(),
  fromWarehouseId: bigint("from_warehouse_id", { mode: "number", unsigned: true }).notNull(),
  toWarehouseId: bigint("to_warehouse_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["draft", "pending", "shipped", "received", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockTransferItems = mysqlTable("stock_transfer_items", {
  id: serial("id").primaryKey(),
  transferId: bigint("transfer_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 18, scale: 4 }),
  batchNumber: varchar("batch_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockAdjustments = mysqlTable("stock_adjustments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  adjustmentNumber: varchar("adjustment_number", { length: 50 }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  adjustmentType: mysqlEnum("adjustment_type", ["damage", "expiry", "theft", "count", "other"]).notNull(),
  totalValue: decimal("total_value", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockAdjustmentItems = mysqlTable("stock_adjustment_items", {
  id: serial("id").primaryKey(),
  adjustmentId: bigint("adjustment_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  currentQty: int("current_qty").notNull(),
  adjustedQty: int("adjusted_qty").notNull(),
  difference: int("difference").notNull(),
  unitCost: decimal("unit_cost", { precision: 18, scale: 4 }),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 5. SALES MANAGEMENT
// =====================================================

export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia").notNull(),
  taxNumber: varchar("tax_number", { length: 100 }),
  creditLimit: decimal("credit_limit", { precision: 18, scale: 4 }).default("0").notNull(),
  currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).default("0").notNull(),
  paymentTerms: int("payment_terms").default(30),
  customerGroup: varchar("customer_group", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const salesQuotations = mysqlTable("sales_quotations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  quotationNumber: varchar("quotation_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  expiryDate: date("expiry_date", { mode: "string" }),
  subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default("0").notNull(),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  terms: text("terms"),
  status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected", "expired", "converted"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesQuotationItems = mysqlTable("sales_quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: bigint("quotation_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  description: text("description"),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesOrders = mysqlTable("sales_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  quotationId: bigint("quotation_id", { mode: "number", unsigned: true }),
  date: date("date", { mode: "string" }).notNull(),
  deliveryDate: date("delivery_date", { mode: "string" }),
  subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default("0").notNull(),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["draft", "confirmed", "processing", "shipped", "delivered", "cancelled", "invoiced"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesOrderItems = mysqlTable("sales_order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  description: text("description"),
  quantity: int("quantity").notNull(),
  deliveredQty: int("delivered_qty").default(0),
  unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = mysqlTable("invoices", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  invoiceType: mysqlEnum("invoice_type", ["standard", "simplified", "zatca"]).default("standard").notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }),
  date: date("date", { mode: "string" }).notNull(),
  dueDate: date("due_date", { mode: "string" }),
  subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default("0").notNull(),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  balanceDue: decimal("balance_due", { precision: 18, scale: 4 }).default("0").notNull(),
  zatcaQrCode: text("zatca_qr_code"),
  zatcaXml: text("zatca_xml"),
  zatcaStatus: mysqlEnum("zatca_status", ["pending", "reported", "cleared"]),
  notes: text("notes"),
  terms: text("terms"),
  status: mysqlEnum("status", ["draft", "sent", "paid", "partial", "overdue", "cancelled", "credit_note"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("inv_tenant_idx").on(table.tenantId),
  dateIdx: index("inv_date_idx").on(table.date),
  numIdx: uniqueIndex("inv_num_idx").on(table.tenantId, table.invoiceNumber),
}));

export const invoiceItems = mysqlTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  description: text("description"),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditNotes = mysqlTable("credit_notes", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  creditNoteNumber: varchar("credit_note_number", { length: 50 }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["draft", "applied", "refunded"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerPayments = mysqlTable("customer_payments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  date: date("date", { mode: "string" }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "bank_transfer", "cheque", "card", "online"]).notNull(),
  bankAccountId: bigint("bank_account_id", { mode: "number", unsigned: true }),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 6. PURCHASE MANAGEMENT
// =====================================================

export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia").notNull(),
  taxNumber: varchar("tax_number", { length: 100 }),
  creditLimit: decimal("credit_limit", { precision: 18, scale: 4 }).default("0").notNull(),
  currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).default("0").notNull(),
  paymentTerms: int("payment_terms").default(30),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseOrders = mysqlTable("purchase_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  poNumber: varchar("po_number", { length: 50 }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  expectedDelivery: date("expected_delivery", { mode: "string" }),
  subTotal: decimal("sub_total", { precision: 18, scale: 4 }).default("0").notNull(),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  shippingAmount: decimal("shipping_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  terms: text("terms"),
  status: mysqlEnum("status", ["draft", "sent", "partial", "received", "cancelled", "invoiced"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseOrderItems = mysqlTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  poId: bigint("po_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  description: text("description"),
  quantity: int("quantity").notNull(),
  receivedQty: int("received_qty").default(0),
  unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goodsReceivedNotes = mysqlTable("goods_received_notes", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  grnNumber: varchar("grn_number", { length: 50 }).notNull(),
  poId: bigint("po_id", { mode: "number", unsigned: true }),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["draft", "posted", "cancelled"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const grnItems = mysqlTable("grn_items", {
  id: serial("id").primaryKey(),
  grnId: bigint("grn_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  poItemId: bigint("po_item_id", { mode: "number", unsigned: true }),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  expiryDate: date("expiry_date", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierPayments = mysqlTable("supplier_payments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "bank_transfer", "cheque", "card", "online"]).notNull(),
  bankAccountId: bigint("bank_account_id", { mode: "number", unsigned: true }),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 7. CRM
// =====================================================

export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  source: mysqlEnum("source", ["website", "referral", "social_media", "email", "call", "walk_in", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).default("new").notNull(),
  rating: mysqlEnum("rating", ["hot", "warm", "cold"]).default("warm").notNull(),
  estimatedValue: decimal("estimated_value", { precision: 18, scale: 4 }).default("0").notNull(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  notes: text("notes"),
  nextFollowUp: timestamp("next_follow_up"),
  isConverted: boolean("is_converted").default(false),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const opportunities = mysqlTable("opportunities", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  leadId: bigint("lead_id", { mode: "number", unsigned: true }),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  stage: mysqlEnum("stage", ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]).default("prospecting").notNull(),
  probability: int("probability").default(0),
  expectedValue: decimal("expected_value", { precision: 18, scale: 4 }).default("0").notNull(),
  expectedCloseDate: date("expected_close_date", { mode: "string" }),
  actualCloseDate: date("actual_close_date", { mode: "string" }),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  description: text("description"),
  lostReason: text("lost_reason"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmActivities = mysqlTable("crm_activities", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  activityType: mysqlEnum("activity_type", ["call", "email", "meeting", "task", "note", "whatsapp", "sms"]).notNull(),
  relatedType: mysqlEnum("related_type", ["lead", "opportunity", "customer", "contact"]).notNull(),
  relatedId: bigint("related_id", { mode: "number", unsigned: true }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 8. HRM
// =====================================================

export const departments = mysqlTable("departments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  managerId: bigint("manager_id", { mode: "number", unsigned: true }),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const designations = mysqlTable("designations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employees = mysqlTable("employees", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeCode: varchar("employee_code", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  gender: mysqlEnum("gender", ["male", "female"]),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  hireDate: date("hire_date", { mode: "string" }).notNull(),
  departmentId: bigint("department_id", { mode: "number", unsigned: true }),
  designationId: bigint("designation_id", { mode: "number", unsigned: true }),
  managerId: bigint("manager_id", { mode: "number", unsigned: true }),
  employmentType: mysqlEnum("employment_type", ["full_time", "part_time", "contract", "intern"]).default("full_time").notNull(),
  status: mysqlEnum("status", ["active", "on_leave", "terminated", "resigned", "suspended"]).default("active").notNull(),
  basicSalary: decimal("basic_salary", { precision: 18, scale: 4 }).default("0").notNull(),
  housingAllowance: decimal("housing_allowance", { precision: 18, scale: 4 }).default("0").notNull(),
  transportAllowance: decimal("transport_allowance", { precision: 18, scale: 4 }).default("0").notNull(),
  otherAllowance: decimal("other_allowance", { precision: 18, scale: 4 }).default("0").notNull(),
  bankName: varchar("bank_name", { length: 255 }),
  bankAccount: varchar("bank_account", { length: 100 }),
  bankIban: varchar("bank_iban", { length: 100 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 50 }),
  photo: text("photo"),
  passportNumber: varchar("passport_number", { length: 100 }),
  nationalId: varchar("national_id", { length: 100 }),
  nationality: varchar("nationality", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = mysqlTable("attendance", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: mysqlEnum("status", ["present", "absent", "late", "half_day", "on_leave", "holiday"]).default("present").notNull(),
  workHours: decimal("work_hours", { precision: 5, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveTypes = mysqlTable("leave_types", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  daysAllowed: int("days_allowed").default(0),
  isPaid: boolean("is_paid").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveRequests = mysqlTable("leave_requests", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  leaveTypeId: bigint("leave_type_id", { mode: "number", unsigned: true }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  days: int("days").notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payrollPeriods = mysqlTable("payroll_periods", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  status: mysqlEnum("status", ["draft", "processing", "completed", "paid"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salarySlips = mysqlTable("salary_slips", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  payrollPeriodId: bigint("payroll_period_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  basicSalary: decimal("basic_salary", { precision: 18, scale: 4 }).default("0").notNull(),
  housingAllowance: decimal("housing_allowance", { precision: 18, scale: 4 }).default("0").notNull(),
  transportAllowance: decimal("transport_allowance", { precision: 18, scale: 4 }).default("0").notNull(),
  otherAllowances: decimal("other_allowances", { precision: 18, scale: 4 }).default("0").notNull(),
  overtimePay: decimal("overtime_pay", { precision: 18, scale: 4 }).default("0").notNull(),
  grossSalary: decimal("gross_salary", { precision: 18, scale: 4 }).default("0").notNull(),
  taxDeduction: decimal("tax_deduction", { precision: 18, scale: 4 }).default("0").notNull(),
  socialInsurance: decimal("social_insurance", { precision: 18, scale: 4 }).default("0").notNull(),
  loanDeduction: decimal("loan_deduction", { precision: 18, scale: 4 }).default("0").notNull(),
  advanceDeduction: decimal("advance_deduction", { precision: 18, scale: 4 }).default("0").notNull(),
  otherDeductions: decimal("other_deductions", { precision: 18, scale: 4 }).default("0").notNull(),
  totalDeductions: decimal("total_deductions", { precision: 18, scale: 4 }).default("0").notNull(),
  netSalary: decimal("net_salary", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["draft", "approved", "paid"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employeeLoans = mysqlTable("employee_loans", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  loanAmount: decimal("loan_amount", { precision: 18, scale: 4 }).notNull(),
  installments: int("installments").default(0),
  installmentAmount: decimal("installment_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  purpose: text("purpose"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "active", "completed"]).default("pending").notNull(),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const advances = mysqlTable("advances", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  purpose: text("purpose"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "deducted"]).default("pending").notNull(),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const performanceReviews = mysqlTable("performance_reviews", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  reviewPeriod: varchar("review_period", { length: 100 }).notNull(),
  reviewDate: date("review_date", { mode: "string" }).notNull(),
  overallRating: int("overall_rating"),
  goalsAchieved: int("goals_achieved"),
  skillsRating: int("skills_rating"),
  attendanceRating: int("attendance_rating"),
  teamworkRating: int("teamwork_rating"),
  comments: text("comments"),
  goals: text("goals"),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 9. MANUFACTURING
// =====================================================

export const billOfMaterials = mysqlTable("bill_of_materials", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  version: varchar("version", { length: 20 }).default("1.0").notNull(),
  quantity: int("quantity").default(1),
  laborCost: decimal("labor_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  overheadCost: decimal("overhead_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bomItems = mysqlTable("bom_items", {
  id: serial("id").primaryKey(),
  bomId: bigint("bom_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  wastagePercent: decimal("wastage_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workOrders = mysqlTable("work_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  woNumber: varchar("wo_number", { length: 50 }).notNull(),
  bomId: bigint("bom_id", { mode: "number", unsigned: true }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  producedQty: int("produced_qty").default(0),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  estimatedCost: decimal("estimated_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["planned", "in_progress", "completed", "cancelled"]).default("planned").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productionOrders = mysqlTable("production_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  poNumber: varchar("po_number", { length: 50 }).notNull(),
  workOrderId: bigint("work_order_id", { mode: "number", unsigned: true }),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "cancelled"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productionItems = mysqlTable("production_items", {
  id: serial("id").primaryKey(),
  productionOrderId: bigint("production_order_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 10. PROJECT MANAGEMENT
// =====================================================

export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectCode: varchar("project_code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  managerId: bigint("manager_id", { mode: "number", unsigned: true }),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  budget: decimal("budget", { precision: 18, scale: 4 }).default("0").notNull(),
  actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["planning", "active", "on_hold", "completed", "cancelled"]).default("planning").notNull(),
  progress: int("progress").default(0),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectTasks = mysqlTable("project_tasks", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  taskCode: varchar("task_code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  startDate: date("start_date", { mode: "string" }),
  dueDate: date("due_date", { mode: "string" }),
  completedAt: timestamp("completed_at"),
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }).default("0").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "done", "cancelled"]).default("todo").notNull(),
  progress: int("progress").default(0),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectMilestones = mysqlTable("project_milestones", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date", { mode: "string" }),
  completedAt: timestamp("completed_at"),
  deliverables: text("deliverables"),
  status: mysqlEnum("status", ["pending", "completed", "overdue"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timesheets = mysqlTable("timesheets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  taskId: bigint("task_id", { mode: "number", unsigned: true }),
  date: date("date", { mode: "string" }).notNull(),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  description: text("description"),
  billable: boolean("billable").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 11. HELP DESK
// =====================================================

export const supportTickets = mysqlTable("support_tickets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "waiting", "resolved", "closed", "escalated"]).default("open").notNull(),
  requesterName: varchar("requester_name", { length: 255 }),
  requesterEmail: varchar("requester_email", { length: 320 }),
  requesterPhone: varchar("requester_phone", { length: 50 }),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  slaDeadline: timestamp("sla_deadline"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  satisfaction: int("satisfaction"),
  source: mysqlEnum("source", ["email", "phone", "web", "chat", "whatsapp"]).default("web").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketComments = mysqlTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: bigint("ticket_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  comment: text("comment").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 12. ASSET MANAGEMENT
// =====================================================

export const assets = mysqlTable("assets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  assetCode: varchar("asset_code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  location: varchar("location", { length: 255 }),
  purchaseDate: date("purchase_date", { mode: "string" }),
  purchaseCost: decimal("purchase_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  salvageValue: decimal("salvage_value", { precision: 18, scale: 4 }).default("0").notNull(),
  usefulLife: int("useful_life").default(0),
  depreciationMethod: mysqlEnum("depreciation_method", ["straight_line", "declining_balance", "units_of_production"]).default("straight_line").notNull(),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 18, scale: 4 }).default("0").notNull(),
  bookValue: decimal("book_value", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "under_maintenance", "disposed", "sold"]).default("active").notNull(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  serialNumber: varchar("serial_number", { length: 255 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  model: varchar("model", { length: 255 }),
  warrantyExpiry: date("warranty_expiry", { mode: "string" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assetMaintenance = mysqlTable("asset_maintenance", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  assetId: bigint("asset_id", { mode: "number", unsigned: true }).notNull(),
  maintenanceType: mysqlEnum("maintenance_type", ["preventive", "corrective", "predictive"]).default("preventive").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 18, scale: 4 }).default("0").notNull(),
  performedBy: varchar("performed_by", { length: 255 }),
  nextDueDate: date("next_due_date", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const depreciationEntries = mysqlTable("depreciation_entries", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  assetId: bigint("asset_id", { mode: "number", unsigned: true }).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  accumulatedAmount: decimal("accumulated_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  bookValue: decimal("book_value", { precision: 18, scale: 4 }).default("0").notNull(),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 13. FLEET MANAGEMENT
// =====================================================

export const vehicles = mysqlTable("vehicles", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleNumber: varchar("vehicle_number", { length: 50 }).notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year"),
  color: varchar("color", { length: 50 }),
  plateNumber: varchar("plate_number", { length: 50 }),
  vin: varchar("vin", { length: 100 }),
  engineNumber: varchar("engine_number", { length: 100 }),
  vehicleType: mysqlEnum("vehicle_type", ["car", "truck", "van", "bus", "bike", "other"]).default("car").notNull(),
  fuelType: mysqlEnum("fuel_type", ["petrol", "diesel", "electric", "hybrid"]).default("petrol").notNull(),
  purchaseDate: date("purchase_date", { mode: "string" }),
  purchaseCost: decimal("purchase_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  currentOdometer: int("current_odometer").default(0),
  status: mysqlEnum("status", ["active", "maintenance", "retired", "sold"]).default("active").notNull(),
  assignedDriverId: bigint("assigned_driver_id", { mode: "number", unsigned: true }),
  insuranceExpiry: date("insurance_expiry", { mode: "string" }),
  registrationExpiry: date("registration_expiry", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fuelRecords = mysqlTable("fuel_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  odometer: int("odometer").notNull(),
  liters: decimal("liters", { precision: 10, scale: 2 }).notNull(),
  costPerLiter: decimal("cost_per_liter", { precision: 10, scale: 4 }),
  totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  station: varchar("station", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicleMaintenance = mysqlTable("vehicle_maintenance", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  maintenanceType: mysqlEnum("maintenance_type", ["routine", "repair", "inspection", "tire_change", "oil_change", "other"]).default("routine").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 18, scale: 4 }).default("0").notNull(),
  serviceProvider: varchar("service_provider", { length: 255 }),
  nextServiceDate: date("next_service_date", { mode: "string" }),
  nextServiceOdometer: int("next_service_odometer"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = mysqlTable("drivers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  licenseNumber: varchar("license_number", { length: 100 }),
  licenseType: varchar("license_type", { length: 50 }),
  licenseExpiry: date("license_expiry", { mode: "string" }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// DESKTOP LICENSES
// =====================================================

export const desktopLicenses = mysqlTable("desktop_licenses", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  licenseKeyHash: varchar("license_key_hash", { length: 128 }).notNull().unique(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).default("desktop").notNull(),
  maxDevices: int("max_devices").default(1).notNull(),
  status: mysqlEnum("status", ["active", "revoked", "expired"]).default("active").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  issuedBy: bigint("issued_by", { mode: "number", unsigned: true }),
  lastActivatedAt: timestamp("last_activated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("desktop_licenses_tenant_idx").on(table.tenantId),
  index("desktop_licenses_status_idx").on(table.status),
]);

// =====================================================
// 14. DOCUMENT MANAGEMENT
// =====================================================

export const documentCategories = mysqlTable("document_categories", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileName: varchar("file_name", { length: 255 }),
  filePath: text("file_path"),
  fileSize: bigint("file_size", { mode: "number" }),
  mimeType: varchar("mime_type", { length: 100 }),
  version: int("version").default(1),
  relatedType: varchar("related_type", { length: 50 }),
  relatedId: bigint("related_id", { mode: "number", unsigned: true }),
  uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentAccessLogs = mysqlTable("document_access_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  documentId: bigint("document_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  userAgent: varchar("user_agent", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("doc_access_tenant_idx").on(table.tenantId),
  index("doc_access_doc_idx").on(table.tenantId, table.documentId),
]);

export const eSignatureRequests = mysqlTable("e_signature_requests", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  documentId: bigint("document_id", { mode: "number", unsigned: true }).notNull(),
  requestedBy: bigint("requested_by", { mode: "number", unsigned: true }).notNull(),
  signerId: bigint("signer_id", { mode: "number", unsigned: true }),
  signerEmail: varchar("signer_email", { length: 320 }),
  signerName: varchar("signer_name", { length: 255 }),
  signatureType: mysqlEnum("signature_type", ["draw", "type", "upload", "biometric"]).default("draw").notNull(),
  status: mysqlEnum("status", ["pending", "signed", "declined", "expired"]).default("pending").notNull(),
  message: text("message"),
  signatureData: text("signature_data"),
  signedAt: timestamp("signed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("esig_req_tenant_idx").on(table.tenantId),
  index("esig_req_doc_idx").on(table.tenantId, table.documentId),
  index("esig_req_signer_idx").on(table.tenantId, table.signerId!),
]);

export const eSignatureLogs = mysqlTable("e_signature_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  signatureRequestId: bigint("signature_request_id", { mode: "number", unsigned: true }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  metadata: text("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("esig_log_tenant_idx").on(table.tenantId),
  index("esig_log_req_idx").on(table.signatureRequestId),
]);

// =====================================================
// 15. SETTINGS & CONFIG
// =====================================================

export const companySettings = mysqlTable("company_settings", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().unique(),
  companyName: varchar("company_name", { length: 255 }),
  companyNameAr: varchar("company_name_ar", { length: 255 }),
  tradeName: varchar("trade_name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  taxNumber: varchar("tax_number", { length: 100 }),
  crNumber: varchar("cr_number", { length: 100 }),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15").notNull(),
  defaultCurrency: varchar("default_currency", { length: 10 }).default("SAR").notNull(),
  fiscalYearStart: varchar("fiscal_year_start", { length: 20 }).default("01-01").notNull(),
  dateFormat: varchar("date_format", { length: 20 }).default("DD/MM/YYYY").notNull(),
  timeFormat: mysqlEnum("time_format", ["12h", "24h"]).default("24h").notNull(),
  numberFormat: varchar("number_format", { length: 20 }).default("#,##0.00").notNull(),
  invoicePrefix: varchar("invoice_prefix", { length: 20 }).default("INV-").notNull(),
  invoiceTerms: text("invoice_terms"),
  purchaseOrderPrefix: varchar("purchase_order_prefix", { length: 20 }).default("PO-").notNull(),
  salesOrderPrefix: varchar("sales_order_prefix", { length: 20 }).default("SO-").notNull(),
  quotationPrefix: varchar("quotation_prefix", { length: 20 }).default("QUO-").notNull(),
  theme: varchar("theme", { length: 20 }).default("light").notNull(),
  primaryColor: varchar("primary_color", { length: 20 }).default("#2563eb").notNull(),
  secondaryColor: varchar("secondary_color", { length: 20 }).default("#64748b").notNull(),
  logo: text("logo"),
  favicon: text("favicon"),
  zatcaEnabled: boolean("zatca_enabled").default(false),
  zatcaSandbox: boolean("zatca_sandbox").default(true),
  aiApiKey: text("ai_api_key"),
  aiModel: varchar("ai_model", { length: 50 }).default("gemini-2.0-flash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const companyLegalDetails = mysqlTable("company_legal_details", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().unique(),
  legalNameEn: varchar("legal_name_en", { length: 255 }).notNull(),
  legalNameAr: varchar("legal_name_ar", { length: 255 }),
  vatNumber: varchar("vat_number", { length: 15 }).notNull(),
  crNumber: varchar("cr_number", { length: 100 }),
  taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),
  businessActivity: varchar("business_activity", { length: 255 }),
  companyAddress: text("company_address"),
  buildingNumber: varchar("building_number", { length: 20 }),
  streetName: varchar("street_name", { length: 255 }),
  district: varchar("district", { length: 255 }),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("Saudi Arabia").notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  emailAddress: varchar("email_address", { length: 320 }),
  companyLogo: text("company_logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("company_legal_tenant_idx").on(table.tenantId),
  index("company_legal_vat_idx").on(table.vatNumber),
]);

export const taxRates = mysqlTable("tax_rates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["vat", "gst", "sales_tax", "withholding", "other"]).default("vat").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const currencies = mysqlTable("currencies", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }),
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default("1").notNull(),
  isBase: boolean("is_base").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 16. AUDIT LOGS & ACTIVITY
// =====================================================

export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["info", "warning", "success", "error"]).default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 17. POS & SALE SESSIONS
// =====================================================

export const posSessions = mysqlTable("pos_sessions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  branchId: bigint("branch_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["open", "closed", "paused"]).default("open").notNull(),
  openingBalance: decimal("opening_balance", { precision: 18, scale: 4 }).default("0").notNull(),
  closingBalance: decimal("closing_balance", { precision: 18, scale: 4 }).default("0").notNull(),
  totalSales: decimal("total_sales", { precision: 18, scale: 4 }).default("0").notNull(),
  totalCash: decimal("total_cash", { precision: 18, scale: 4 }).default("0").notNull(),
  totalCard: decimal("total_card", { precision: 18, scale: 4 }).default("0").notNull(),
  totalTransfer: decimal("total_transfer", { precision: 18, scale: 4 }).default("0").notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PosSession = typeof posSessions.$inferSelect;

export const posHolds = mysqlTable("pos_holds", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  holdNumber: varchar("hold_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  items: json("items").notNull(),
  subtotal: decimal("subtotal", { precision: 18, scale: 4 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["held", "resumed", "cancelled"]).default("held").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// =====================================================
// 18. CASHBOX
// =====================================================

export const cashboxTransactions = mysqlTable("cashbox_transactions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  sessionId: bigint("session_id", { mode: "number", unsigned: true }),
  transactionNumber: varchar("transaction_number", { length: 50 }).notNull(),
  transactionType: mysqlEnum("transaction_type", [
    "cash_in", "cash_out", "sale", "purchase", "expense",
    "income", "transfer", "opening_balance", "closing_balance",
    "customer_payment", "supplier_payment"
  ]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "transfer", "cheque", "wallet", "other"]).default("cash").notNull(),
  referenceType: varchar("reference_type", { length: 100 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  description: text("description"),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).default("0").notNull(),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("completed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CashboxTransaction = typeof cashboxTransactions.$inferSelect;

// =====================================================
// 19. INSTALLMENTS
// =====================================================

export const installments = mysqlTable("installments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  installmentNumber: varchar("installment_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
  downPayment: decimal("down_payment", { precision: 18, scale: 4 }).default("0").notNull(),
  financedAmount: decimal("financed_amount", { precision: 18, scale: 4 }).notNull(),
  numberOfInstallments: int("number_of_installments").notNull(),
  installmentAmount: decimal("installment_amount", { precision: 18, scale: 4 }).notNull(),
  installmentType: mysqlEnum("installment_type", ["weekly", "biweekly", "monthly", "quarterly", "custom"]).default("monthly").notNull(),
  intervalDays: int("interval_days").default(30),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }),
  totalPaid: decimal("total_paid", { precision: 18, scale: 4 }).default("0").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }).notNull(),
  status: mysqlEnum("status", ["active", "completed", "defaulted", "cancelled"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Installment = typeof installments.$inferSelect;

export const installmentPayments = mysqlTable("installment_payments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  installmentId: bigint("installment_id", { mode: "number", unsigned: true }).notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  paidDate: date("paid_date", { mode: "string" }),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  lateFee: decimal("late_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "transfer", "cheque", "wallet", "other"]).default("cash"),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type InstallmentPayment = typeof installmentPayments.$inferSelect;

// =====================================================
// 20. PRINT TEMPLATES
// =====================================================

export const printTemplates = mysqlTable("print_templates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["invoice_a4", "receipt_80mm", "receipt_58mm", "quotation", "delivery_note"]).notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// =====================================================
// 21. LOCALIZATION & COUNTRY DETECTION
// =====================================================

export const countries = mysqlTable("countries", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  dialCode: varchar("dial_code", { length: 10 }),
  flagEmoji: varchar("flag_emoji", { length: 10 }),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const regions = mysqlTable("regions", {
  id: serial("id").primaryKey(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  taxProfile: varchar("tax_profile", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const localizationProfiles = mysqlTable("localization_profiles", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  dateFormat: varchar("date_format", { length: 20 }).default("DD/MM/YYYY").notNull(),
  numberFormat: varchar("number_format", { length: 20 }).default("#,##0.00").notNull(),
  isRtl: boolean("is_rtl").default(false),
  taxProfile: varchar("tax_profile", { length: 50 }),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 22. TAX COMPLIANCE
// =====================================================

export const taxProfiles = mysqlTable("tax_profiles", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  taxType: mysqlEnum("tax_type", ["vat", "gst", "sales_tax", "withholding", "income_tax", "other"]).default("vat").notNull(),
  defaultRate: decimal("default_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  hasReverseCharge: boolean("has_reverse_charge").default(false),
  hasZeroRated: boolean("has_zero_rated").default(false),
  hasExempt: boolean("has_exempt").default(false),
  hasWithholding: boolean("has_withholding").default(false),
  hasDigitalInvoicing: boolean("has_digital_invoicing").default(false),
  hasQrCode: boolean("has_qr_code").default(false),
  isActive: boolean("is_active").default(true),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taxRules = mysqlTable("tax_rules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  taxProfileId: bigint("tax_profile_id", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  ruleType: mysqlEnum("rule_type", ["standard", "reduced", "zero", "exempt", "reverse_charge", "withholding"]).default("standard").notNull(),
  appliesTo: mysqlEnum("applies_to", ["goods", "services", "both", "specific"]).default("both").notNull(),
  minAmount: decimal("min_amount", { precision: 18, scale: 4 }),
  maxAmount: decimal("max_amount", { precision: 18, scale: 4 }),
  isActive: boolean("is_active").default(true),
  effectiveFrom: date("effective_from"),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taxIdentifiers = mysqlTable("tax_identifiers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  identifierType: varchar("identifier_type", { length: 50 }).notNull(),
  identifierValue: varchar("identifier_value", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const taxIntegrations = mysqlTable("tax_integrations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  integrationType: varchar("integration_type", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isEnabled: boolean("is_enabled").default(false),
  isSandbox: boolean("is_sandbox").default(true),
  endpointUrl: varchar("endpoint_url", { length: 500 }),
  sandboxUrl: varchar("sandbox_url", { length: 500 }),
  apiVersion: varchar("api_version", { length: 50 }),
  testConnectionAt: timestamp("test_connection_at"),
  lastSyncAt: timestamp("last_sync_at"),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const taxCredentials = mysqlTable("tax_credentials", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  integrationId: bigint("integration_id", { mode: "number", unsigned: true }),
  credentialType: varchar("credential_type", { length: 50 }).notNull(),
  encryptedValue: text("encrypted_value").notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const taxSubmissions = mysqlTable("tax_submissions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  integrationId: bigint("integration_id", { mode: "number", unsigned: true }),
  submissionType: varchar("submission_type", { length: 50 }).notNull(),
  submissionNumber: varchar("submission_number", { length: 100 }),
  status: mysqlEnum("status", ["pending", "submitted", "accepted", "rejected", "error"]).default("pending").notNull(),
  payload: json("payload"),
  response: json("response"),
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taxSubmissionLogs = mysqlTable("tax_submission_logs", {
  id: serial("id").primaryKey(),
  submissionId: bigint("submission_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  message: text("message"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eInvoiceDocuments = mysqlTable("e_invoice_documents", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  xmlPayload: text("xml_payload"),
  jsonPayload: json("json_payload"),
  qrCode: text("qr_code"),
  hash: varchar("hash", { length: 255 }),
  previousHash: varchar("previous_hash", { length: 255 }),
  digitalSignature: text("digital_signature"),
  certificateId: varchar("certificate_id", { length: 255 }),
  status: mysqlEnum("status", ["draft", "submitted", "cleared", "reported", "rejected"]).default("draft").notNull(),
  submissionId: bigint("submission_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const zatcaCredentials = mysqlTable("zatca_credentials", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  environment: mysqlEnum("environment", ["sandbox", "production"]).default("sandbox").notNull(),
  vatNumber: varchar("vat_number", { length: 15 }).notNull(),
  organizationIdentifier: varchar("organization_identifier", { length: 255 }),
  egsSerialNumber: varchar("egs_serial_number", { length: 255 }),
  deviceUuid: varchar("device_uuid", { length: 100 }),
  otpEncrypted: text("otp_encrypted"),
  csrEncrypted: text("csr_encrypted"),
  certificateEncrypted: text("certificate_encrypted"),
  privateKeyEncrypted: text("private_key_encrypted"),
  publicKeyEncrypted: text("public_key_encrypted"),
  complianceCsidEncrypted: text("compliance_csid_encrypted"),
  productionCsidEncrypted: text("production_csid_encrypted"),
  accessTokenEncrypted: text("access_token_encrypted"),
  secretTokenEncrypted: text("secret_token_encrypted"),
  isActive: boolean("is_active").default(true),
  lastTestAt: timestamp("last_test_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("zatca_credentials_tenant_idx").on(table.tenantId),
  index("zatca_credentials_env_idx").on(table.tenantId, table.environment),
]);

export const zatcaCertificates = mysqlTable("zatca_certificates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  credentialId: bigint("credential_id", { mode: "number", unsigned: true }),
  certificateType: mysqlEnum("certificate_type", ["ccsid", "pcsid", "csr", "public_key", "private_key"]).notNull(),
  environment: mysqlEnum("environment", ["sandbox", "production"]).default("sandbox").notNull(),
  serialNumber: varchar("serial_number", { length: 255 }),
  certificateHash: varchar("certificate_hash", { length: 255 }),
  encryptedPayload: text("encrypted_payload").notNull(),
  issuedAt: timestamp("issued_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("zatca_cert_tenant_idx").on(table.tenantId),
  index("zatca_cert_expiry_idx").on(table.tenantId, table.expiresAt),
]);

export const zatcaApiLogs = mysqlTable("zatca_api_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  action: mysqlEnum("action", ["generate_xml", "generate_qr", "sign_invoice", "compliance_check", "clearance", "reporting", "sync_status", "download_response"]).notNull(),
  environment: mysqlEnum("environment", ["sandbox", "production"]).default("sandbox").notNull(),
  endpoint: varchar("endpoint", { length: 500 }),
  requestPayload: json("request_payload"),
  responsePayload: json("response_payload"),
  httpStatus: int("http_status"),
  status: mysqlEnum("status", ["success", "pending", "failed"]).default("pending").notNull(),
  errorCode: varchar("error_code", { length: 100 }),
  errorMessage: text("error_message"),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("zatca_api_logs_tenant_idx").on(table.tenantId),
  index("zatca_api_logs_invoice_idx").on(table.tenantId, table.invoiceId),
  index("zatca_api_logs_action_idx").on(table.tenantId, table.action),
]);

export const zatcaInvoiceStatus = mysqlTable("zatca_invoice_status", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  invoiceUuid: varchar("invoice_uuid", { length: 100 }),
  invoiceCounter: int("invoice_counter").default(0).notNull(),
  invoiceHash: varchar("invoice_hash", { length: 255 }),
  previousInvoiceHash: varchar("previous_invoice_hash", { length: 255 }),
  digitalSignature: text("digital_signature"),
  status: mysqlEnum("status", ["draft", "signed", "pending", "submitted", "cleared", "reported", "rejected", "failed"]).default("draft").notNull(),
  clearanceStatus: varchar("clearance_status", { length: 100 }),
  reportingStatus: varchar("reporting_status", { length: 100 }),
  zatcaRequestId: varchar("zatca_request_id", { length: 255 }),
  zatcaResponseId: varchar("zatca_response_id", { length: 255 }),
  errorCode: varchar("error_code", { length: 100 }),
  errorMessage: text("error_message"),
  warnings: json("warnings"),
  submittedAt: timestamp("submitted_at"),
  clearedAt: timestamp("cleared_at"),
  reportedAt: timestamp("reported_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("zatca_invoice_status_invoice_uidx").on(table.tenantId, table.invoiceId),
  index("zatca_invoice_status_status_idx").on(table.tenantId, table.status),
]);

export const zatcaQrCodes = mysqlTable("zatca_qr_codes", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  tlvBase64: text("tlv_base64").notNull(),
  qrImageDataUrl: text("qr_image_data_url"),
  tags: json("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("zatca_qr_tenant_invoice_idx").on(table.tenantId, table.invoiceId),
]);

export const zatcaXmlDocuments = mysqlTable("zatca_xml_documents", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  documentType: mysqlEnum("document_type", ["standard", "simplified", "credit_note", "debit_note"]).default("standard").notNull(),
  unsignedXml: text("unsigned_xml"),
  signedXml: text("signed_xml"),
  clearedXml: text("cleared_xml"),
  xmlHash: varchar("xml_hash", { length: 255 }),
  isArchived: boolean("is_archived").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("zatca_xml_tenant_invoice_idx").on(table.tenantId, table.invoiceId),
  index("zatca_xml_hash_idx").on(table.xmlHash),
]);

export const zatcaActivityLogs = mysqlTable("zatca_activity_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  message: text("message"),
  metadata: json("metadata"),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("zatca_activity_tenant_idx").on(table.tenantId),
  index("zatca_activity_invoice_idx").on(table.tenantId, table.invoiceId),
]);

export const complianceProfiles = mysqlTable("compliance_profiles", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  profileName: varchar("profile_name", { length: 255 }).notNull(),
  requiresVatNumber: boolean("requires_vat_number").default(false),
  requiresCrNumber: boolean("requires_cr_number").default(false),
  requiresNtn: boolean("requires_ntn").default(false),
  requiresStrin: boolean("requires_strn").default(false),
  requiresCnic: boolean("requires_cnic").default(false),
  requiresTrn: boolean("requires_trn").default(false),
  hasProvinceTax: boolean("has_province_tax").default(false),
  hasWithholdingTax: boolean("has_withholding_tax").default(false),
  hasDigitalInvoice: boolean("has_digital_invoice").default(false),
  hasQrCode: boolean("has_qr_code").default(false),
  hasEInvoice: boolean("has_e_invoice").default(false),
  invoiceLanguages: json("invoice_languages"),
  taxTypes: json("tax_types"),
  config: json("config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 23. WEBSITE MANAGEMENT
// =====================================================

export const moduleRegistry = mysqlTable("module_registry", {
  id: serial("id").primaryKey(),
  moduleKey: varchar("module_key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  iconName: varchar("icon_name", { length: 100 }),
  category: varchar("category", { length: 100 }),
  featureCount: int("feature_count").default(0),
  route: varchar("route", { length: 255 }),
  isErpModule: boolean("is_erp_module").default(true),
  isVisibleOnWebsite: boolean("is_visible_on_website").default(true),
  requiresLogin: boolean("requires_login").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const websiteModuleCards = mysqlTable("website_module_cards", {
  id: serial("id").primaryKey(),
  moduleKey: varchar("module_key", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  iconName: varchar("icon_name", { length: 100 }),
  gradientFrom: varchar("gradient_from", { length: 50 }),
  gradientTo: varchar("gradient_to", { length: 50 }),
  featureCount: int("feature_count").default(0),
  detailUrl: varchar("detail_url", { length: 255 }),
  isVisible: boolean("is_visible").default(true),
  sortOrder: int("sort_order").default(0),
  adminEditable: boolean("admin_editable").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const websiteSections = mysqlTable("website_sections", {
  id: serial("id").primaryKey(),
  sectionKey: varchar("section_key", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  subtitle: text("subtitle"),
  subtitleAr: text("subtitle_ar"),
  content: json("content"),
  isVisible: boolean("is_visible").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const websiteHeroSlides = mysqlTable("website_hero_slides", {
  id: serial("id").primaryKey(),
  headline: varchar("headline", { length: 500 }).notNull(),
  headlineAr: varchar("headline_ar", { length: 500 }),
  subheadline: text("subheadline"),
  subheadlineAr: text("subheadline_ar"),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaTextAr: varchar("cta_text_ar", { length: 100 }),
  ctaUrl: varchar("cta_url", { length: 500 }),
  secondaryCtaText: varchar("secondary_cta_text", { length: 100 }),
  secondaryCtaTextAr: varchar("secondary_cta_text_ar", { length: 100 }),
  secondaryCtaUrl: varchar("secondary_cta_url", { length: 500 }),
  backgroundClass: varchar("background_class", { length: 100 }),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 24. AI ASSISTANT
// =====================================================

export const aiChatLogs = mysqlTable("ai_chat_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  sessionId: varchar("session_id", { length: 100 }),
  query: text("query").notNull(),
  response: text("response"),
  queryType: varchar("query_type", { length: 50 }),
  context: json("context"),
  tokensUsed: int("tokens_used"),
  processingTimeMs: int("processing_time_ms"),
  rating: int("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 25. APPROVAL WORKFLOWS
// =====================================================

export const approvalWorkflows = mysqlTable("approval_workflows", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  triggerEvent: varchar("trigger_event", { length: 100 }),
  steps: json("steps"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const approvalRequests = mysqlTable("approval_requests", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  workflowId: bigint("workflow_id", { mode: "number", unsigned: true }),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  currentStep: int("current_step").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// =====================================================
// 26. API WEBHOOKS & PARTNERS
// =====================================================

export const apiWebhooks = mysqlTable("api_webhooks", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  secret: varchar("secret", { length: 255 }),
  events: json("events"),
  isActive: boolean("is_active").default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount: int("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partnerAccounts = mysqlTable("partner_accounts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  partnerType: mysqlEnum("partner_type", ["reseller", "affiliate", "referral", "integration_partner"]).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  totalEarned: decimal("total_earned", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "terminated"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 27. SECURITY & TENANT USAGE
// =====================================================

export const securityLogs = mysqlTable("security_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenantUsageLogs = mysqlTable("tenant_usage_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  activeUsers: int("active_users").default(0),
  storageUsed: bigint("storage_used", { mode: "number" }).default(0),
  apiCalls: int("api_calls").default(0),
  invoicesGenerated: int("invoices_generated").default(0),
  transactionsCount: int("transactions_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 28. SUBSCRIPTION PLANS
// =====================================================

export const plans = mysqlTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  priceMonth: decimal("price_month", { precision: 10, scale: 2 }).default("0").notNull(),
  priceYear: decimal("price_year", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  productLimit: int("product_limit").default(60),
  userLimit: int("user_limit").default(5),
  branchLimit: int("branch_limit").default(1),
  warehouseLimit: int("warehouse_limit").default(1),
  trialDays: int("trial_days").default(3),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  features: json("features"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

export const planFeatures = mysqlTable("plan_features", {
  id: serial("id").primaryKey(),
  planId: bigint("plan_id", { mode: "number", unsigned: true }).notNull(),
  featureKey: varchar("feature_key", { length: 100 }).notNull(),
  featureName: varchar("feature_name", { length: 255 }).notNull(),
  featureNameAr: varchar("feature_name_ar", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().unique(),
  planId: bigint("plan_id", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["trial", "active", "past_due", "cancelled", "expired", "suspended"]).default("trial").notNull(),
  trialStartAt: timestamp("trial_start_at"),
  trialEndAt: timestamp("trial_end_at"),
  currentPeriodStartAt: timestamp("current_period_start_at"),
  currentPeriodEndAt: timestamp("current_period_end_at"),
  cancelledAt: timestamp("cancelled_at"),
  gracePeriodEndsAt: timestamp("grace_period_ends_at"),
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "yearly"]).default("monthly").notNull(),
  productLimit: int("product_limit").default(60),
  userLimit: int("user_limit").default(5),
  branchLimit: int("branch_limit").default(1),
  warehouseLimit: int("warehouse_limit").default(1),
  couponCode: varchar("coupon_code", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;

export const tenantModuleControls = mysqlTable("tenant_module_controls", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  moduleKey: varchar("module_key", { length: 100 }).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  source: mysqlEnum("source", ["plan", "override", "trial", "support"]).default("plan").notNull(),
  limitJson: json("limit_json"),
  notes: text("notes"),
  updatedBy: bigint("updated_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  tenantModuleIdx: uniqueIndex("tenant_module_controls_unique_idx").on(table.tenantId, table.moduleKey),
  tenantIdx: index("tenant_module_controls_tenant_idx").on(table.tenantId),
  moduleIdx: index("tenant_module_controls_module_idx").on(table.moduleKey),
}));

export const tenantServiceEvents = mysqlTable("tenant_service_events", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  eventType: mysqlEnum("event_type", ["module_toggle", "limit_update", "billing_update", "backup_request", "restore_request", "support_action", "white_label_update"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "running", "done", "failed", "cancelled"]).default("pending").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  metadata: json("metadata"),
  requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdx: index("tenant_service_events_tenant_idx").on(table.tenantId),
  eventTypeIdx: index("tenant_service_events_type_idx").on(table.eventType),
  statusIdx: index("tenant_service_events_status_idx").on(table.status),
}));

export const systemSettings = mysqlTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 150 }).notNull().unique(),
  value: text("value"),
  category: varchar("category", { length: 100 }).default("platform"),
  isSecret: boolean("is_secret").default(false),
  updatedBy: bigint("updated_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  keyIdx: uniqueIndex("system_settings_key_idx").on(table.key),
  categoryIdx: index("system_settings_category_idx").on(table.category),
}));

export const subscriptionInvoices = mysqlTable("subscription_invoices", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  subscriptionId: bigint("subscription_id", { mode: "number", unsigned: true }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  billingPeriodStart: timestamp("billing_period_start"),
  billingPeriodEnd: timestamp("billing_period_end"),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPayments = mysqlTable("subscription_payments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("completed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 29. OTP CODES
// =====================================================

export const otpCodes = mysqlTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  otpHash: varchar("otp_hash", { length: 255 }).notNull(),
  purpose: mysqlEnum("purpose", ["registration", "login", "forgot_password", "email_change", "sensitive_action"]).default("login").notNull(),
  attempts: int("attempts").default(0).notNull(),
  maxAttempts: int("max_attempts").default(5).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("otp_email_idx").on(table.email),
  index("otp_purpose_idx").on(table.email, table.purpose),
]);

// =====================================================
// 30. SMTP SETTINGS & EMAIL
// =====================================================

export const smtpSettings = mysqlTable("smtp_settings", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().unique(),
  host: varchar("host", { length: 255 }).notNull(),
  port: int("port").default(587).notNull(),
  username: varchar("username", { length: 255 }),
  passwordEncrypted: text("password_encrypted"),
  encryption: mysqlEnum("encryption", ["none", "ssl", "tls", "starttls"]).default("starttls").notNull(),
  senderName: varchar("sender_name", { length: 255 }),
  senderEmail: varchar("sender_email", { length: 320 }).notNull(),
  replyToEmail: varchar("reply_to_email", { length: 320 }),
  isActive: boolean("is_active").default(false),
  testStatus: mysqlEnum("test_status", ["untested", "success", "failed"]).default("untested").notNull(),
  lastTestedAt: timestamp("last_tested_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const emailTemplates = mysqlTable("email_templates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  templateKey: varchar("template_key", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  subjectAr: varchar("subject_ar", { length: 500 }),
  body: text("body").notNull(),
  bodyAr: text("body_ar"),
  variables: json("variables"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const emailLogs = mysqlTable("email_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  templateKey: varchar("template_key", { length: 100 }),
  recipient: varchar("recipient", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body"),
  status: mysqlEnum("status", ["sent", "failed", "queued"]).default("sent").notNull(),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// =====================================================
// 31. NOTIFICATION TEMPLATES
// =====================================================

export const notificationTemplates = mysqlTable("notification_templates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  templateKey: varchar("template_key", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("title_ar", { length: 500 }),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  type: mysqlEnum("type", ["info", "warning", "success", "error"]).default("info").notNull(),
  icon: varchar("icon", { length: 50 }),
  variables: json("variables"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 32. COUPONS & OFFERS
// =====================================================

export const coupons = mysqlTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: mysqlEnum("discount_type", ["percentage", "fixed"]).default("percentage").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxUses: int("max_uses").default(0),
  usedCount: int("used_count").default(0),
  minPlanPrice: decimal("min_plan_price", { precision: 10, scale: 2 }),
  applicablePlans: json("applicable_plans"),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const offers = mysqlTable("offers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  offerType: mysqlEnum("offer_type", ["free_days", "discount_percentage", "discount_fixed", "free_upgrade"]).default("free_days").notNull(),
  offerValue: decimal("offer_value", { precision: 10, scale: 2 }).notNull(),
  minDurationMonths: int("min_duration_months").default(0),
  planId: bigint("plan_id", { mode: "number", unsigned: true }),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 33. MEETINGS
// =====================================================

export const meetings = mysqlTable("meetings", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: date("date", { mode: "string" }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  meetingType: mysqlEnum("meeting_type", ["online", "offline"]).default("online").notNull(),
  location: varchar("location", { length: 255 }),
  meetingLink: varchar("meeting_link", { length: 500 }),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled", "rescheduled"]).default("scheduled").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).notNull(),
  reminderSent: boolean("reminder_sent").default(false),
  outcome: text("outcome"),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  relatedType: varchar("related_type", { length: 50 }),
  relatedId: bigint("related_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("meeting_tenant_idx").on(table.tenantId),
  index("meeting_date_idx").on(table.tenantId, table.date),
]);

export const meetingAttendees = mysqlTable("meeting_attendees", {
  id: serial("id").primaryKey(),
  meetingId: bigint("meeting_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  email: varchar("email", { length: 320 }),
  name: varchar("name", { length: 255 }),
  isRequired: boolean("is_required").default(true),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "tentative"]).default("pending").notNull(),
  responseMessage: text("response_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingNotes = mysqlTable("meeting_notes", {
  id: serial("id").primaryKey(),
  meetingId: bigint("meeting_id", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 34. TASK COMMENTS & ATTACHMENTS
// =====================================================

export const taskComments = mysqlTable("task_comments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  taskId: bigint("task_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  comment: text("comment").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskAttachments = mysqlTable("task_attachments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  taskId: bigint("task_id", { mode: "number", unsigned: true }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: text("file_path"),
  fileSize: bigint("file_size", { mode: "number" }),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedBy: bigint("uploaded_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 35. SYNC SYSTEM
// =====================================================

export const deviceRegistrations = mysqlTable("device_registrations", {
  id: serial("id").primaryKey(),
  deviceId: varchar("device_id", { length: 255 }).notNull().unique(),
  deviceName: varchar("device_name", { length: 255 }),
  platform: varchar("platform", { length: 50 }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  lastSeen: timestamp("last_seen"),
  lastSyncAt: timestamp("last_sync_at"),
  appVersion: varchar("app_version", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const syncLogs = mysqlTable("sync_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  direction: mysqlEnum("direction", ["push", "pull"]).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id", { length: 255 }),
  action: varchar("action", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull(),
  message: text("message"),
  detailsJson: json("details_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deletedRecordsTombstone = mysqlTable("deleted_records_tombstone", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  serverId: bigint("server_id", { mode: "number", unsigned: true }),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  deletedAt: timestamp("deleted_at").defaultNow().notNull(),
  synced: boolean("synced").default(false),
});

// =====================================================
// 36. RESELLER LICENSE KEY SYSTEM
// =====================================================

export const resellerKeyLimits = mysqlTable("reseller_key_limits", {
  id: serial("id").primaryKey(),
  resellerUserId: bigint("reseller_user_id", { mode: "number", unsigned: true }).notNull(),
  maxKeys: int("max_keys").default(0).notNull(),
  keysUsed: int("keys_used").default(0).notNull(),
  setBy: bigint("set_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const resellerLicenseKeys = mysqlTable("reseller_license_keys", {
  id: serial("id").primaryKey(),
  resellerUserId: bigint("reseller_user_id", { mode: "number", unsigned: true }).notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  licenseKey: varchar("license_key", { length: 255 }).notNull().unique(),
  licenseKeyHash: varchar("license_key_hash", { length: 128 }).notNull().unique(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).default("standard").notNull(),
  maxUsers: int("max_users").default(5).notNull(),
  maxDevices: int("max_devices").default(1).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "active", "expired", "revoked"]).default("pending").notNull(),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  approvedAt: timestamp("approved_at"),
  rejectedReason: text("rejected_reason"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("reseller_license_reseller_idx").on(table.resellerUserId),
  index("reseller_license_status_idx").on(table.status),
  index("reseller_license_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 37. INVOICE THEMES
// =====================================================

export const invoiceThemes = mysqlTable("invoice_themes", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  themeKey: varchar("theme_key", { length: 50 }).notNull(),
  config: json("config").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("invoice_theme_tenant_idx").on(table.tenantId),
]);

export const companyStamps = mysqlTable("company_stamps", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["logo", "stamp"]).notNull(),
  imageData: text("image_data").notNull(),
  mimeType: varchar("mime_type", { length: 50 }).default("image/png"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("company_stamp_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 38. COUNTRY TAX CONFIG
// =====================================================

export const countryTaxConfigs = mysqlTable("country_tax_configs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  countryCode: varchar("country_code", { length: 2 }).default("SA").notNull(),
  taxName: varchar("tax_name", { length: 100 }).notNull(),
  taxNameAr: varchar("tax_name_ar", { length: 100 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("15").notNull(),
  taxNumberLabel: varchar("tax_number_label", { length: 100 }),
  taxNumberLabelAr: varchar("tax_number_label_ar", { length: 100 }),
  taxAuthority: varchar("tax_authority", { length: 100 }),
  taxAuthorityAr: varchar("tax_authority_ar", { length: 100 }),
  requiresZatca: boolean("requires_zatca").default(false),
  requiresFbr: boolean("requires_fbr").default(false),
  invoiceNote: text("invoice_note"),
  invoiceNoteAr: text("invoice_note_ar"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("country_tax_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 39. INVOICE CUSTOM TAX SETTINGS (per company)
// =====================================================

export const invoiceTaxSettings = mysqlTable("invoice_tax_settings", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull().unique(),
  showTax: boolean("show_tax").default(true),
  taxLabel: varchar("tax_label", { length: 100 }).default("VAT"),
  taxLabelAr: varchar("tax_label_ar", { length: 100 }).default("ضريبة القيمة المضافة"),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).default("15"),
  taxInclusive: boolean("tax_inclusive").default(false),
  showTaxNumber: boolean("show_tax_number").default(true),
  showStamp: boolean("show_stamp").default(true),
  showLogo: boolean("show_logo").default(true),
  showFooter: boolean("show_footer").default(true),
  footerText: text("footer_text"),
  footerTextAr: text("footer_text_ar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// =====================================================
// 40. POS VERTICALS - Restaurant
// =====================================================

export const floorPlans = mysqlTable("floor_plans", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  width: int("width").default(800).notNull(),
  height: int("height").default(600).notNull(),
  backgroundImage: text("background_image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("floor_plans_tenant_idx").on(table.tenantId),
]);

export const restaurantTables = mysqlTable("restaurant_tables", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  floorPlanId: bigint("floor_plan_id", { mode: "number", unsigned: true }).notNull(),
  tableNumber: varchar("table_number", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }),
  nameAr: varchar("name_ar", { length: 255 }),
  capacity: int("capacity").default(4).notNull(),
  shape: mysqlEnum("shape", ["rectangle", "circle", "square"]).default("rectangle").notNull(),
  posX: int("pos_x").default(0).notNull(),
  posY: int("pos_y").default(0).notNull(),
  width: int("width").default(80).notNull(),
  height: int("height").default(60).notNull(),
  rotation: int("rotation").default(0).notNull(),
  status: mysqlEnum("status", ["vacant", "occupied", "ordered", "served", "paid", "reserved", "cleaning"]).default("vacant").notNull(),
  waiterId: bigint("waiter_id", { mode: "number", unsigned: true }),
  currentOrderId: bigint("current_order_id", { mode: "number", unsigned: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("restaurant_tables_plan_idx").on(table.floorPlanId),
  index("restaurant_tables_status_idx").on(table.tenantId, table.status),
]);

export const tableOrders = mysqlTable("table_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  restaurantTableId: bigint("restaurant_table_id", { mode: "number", unsigned: true }).notNull(),
  waiterId: bigint("waiter_id", { mode: "number", unsigned: true }),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  guestCount: int("guest_count").default(1).notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "served", "partial", "completed", "cancelled", "transferred"]).default("open").notNull(),
  orderType: mysqlEnum("order_type", ["dine_in", "takeaway", "delivery"]).default("dine_in").notNull(),
  splitFromId: bigint("split_from_id", { mode: "number", unsigned: true }),
  transferredToTableId: bigint("transferred_to_table_id", { mode: "number", unsigned: true }),
  serviceChargePercent: decimal("service_charge_percent", { precision: 5, scale: 2 }).default("0"),
  serviceChargeAmount: decimal("service_charge_amount", { precision: 18, scale: 4 }).default("0"),
  subtotal: decimal("subtotal", { precision: 18, scale: 4 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 18, scale: 4 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("table_orders_table_idx").on(table.restaurantTableId),
  index("table_orders_status_idx").on(table.tenantId, table.status),
]);

export const kdsStations = mysqlTable("kds_stations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  stationType: mysqlEnum("station_type", ["kitchen", "bar", "grill", "salad", "pizza", "dessert", "other"]).default("kitchen").notNull(),
  printerName: varchar("printer_name", { length: 255 }),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("kds_stations_tenant_idx").on(table.tenantId),
]);

export const kdsStationProducts = mysqlTable("kds_station_products", {
  id: serial("id").primaryKey(),
  stationId: bigint("station_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueIdx: uniqueIndex("kds_station_products_unique").on(table.stationId, table.productId),
}));

export const kotTickets = mysqlTable("kot_tickets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  tableOrderId: bigint("table_order_id", { mode: "number", unsigned: true }),
  restaurantTableId: bigint("restaurant_table_id", { mode: "number", unsigned: true }),
  stationId: bigint("station_id", { mode: "number", unsigned: true }).notNull(),
  kotNumber: varchar("kot_number", { length: 50 }).notNull(),
  course: mysqlEnum("course", ["appetizer", "main", "dessert", "drinks", "other"]).default("main").notNull(),
  courseSequence: int("course_sequence").default(0).notNull(),
  priority: mysqlEnum("priority", ["normal", "rush", "vip"]).default("normal").notNull(),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "served", "cancelled"]).default("pending").notNull(),
  printed: boolean("printed").default(false),
  printCount: int("print_count").default(0),
  preparedBy: bigint("prepared_by", { mode: "number", unsigned: true }),
  readyAt: timestamp("ready_at"),
  servedAt: timestamp("served_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("kot_tickets_order_idx").on(table.tableOrderId),
  index("kot_tickets_station_idx").on(table.stationId, table.status),
]);

export const kotTicketItems = mysqlTable("kot_ticket_items", {
  id: serial("id").primaryKey(),
  kotTicketId: bigint("kot_ticket_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  modifiers: json("modifiers"),
  instructions: text("instructions"),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "served", "cancelled", "held"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderCourses = mysqlTable("order_courses", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  tableOrderId: bigint("table_order_id", { mode: "number", unsigned: true }).notNull(),
  course: mysqlEnum("course", ["appetizer", "main", "dessert", "drinks", "other"]).default("main").notNull(),
  sequence: int("sequence").default(0).notNull(),
  timingMinutes: int("timing_minutes").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "served", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItemModifiers = mysqlTable("order_item_modifiers", {
  id: serial("id").primaryKey(),
  orderItemId: bigint("order_item_id", { mode: "number", unsigned: true }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  modifierGroup: varchar("modifier_group", { length: 100 }).notNull(),
  modifierName: varchar("modifier_name", { length: 255 }).notNull(),
  modifierNameAr: varchar("modifier_name_ar", { length: 255 }),
  priceAdjustment: decimal("price_adjustment", { precision: 18, scale: 4 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 41. POS VERTICALS - Pharmacy
// =====================================================

export const prescriptions = mysqlTable("prescriptions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  prescriptionNumber: varchar("prescription_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  doctorName: varchar("doctor_name", { length: 255 }),
  doctorLicense: varchar("doctor_license", { length: 100 }),
  clinicName: varchar("clinic_name", { length: 255 }),
  diagnosis: text("diagnosis"),
  dateIssued: date("date_issued", { mode: "string" }).notNull(),
  dateExpires: date("date_expires", { mode: "string" }),
  isControlledSubstance: boolean("is_controlled_substance").default(false),
  controlledSubstanceLicense: varchar("controlled_substance_license", { length: 100 }),
  status: mysqlEnum("status", ["active", "dispensed", "partial", "expired", "cancelled"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("prescriptions_tenant_idx").on(table.tenantId),
  index("prescriptions_customer_idx").on(table.customerId),
]);

export const prescriptionItems = mysqlTable("prescription_items", {
  id: serial("id").primaryKey(),
  prescriptionId: bigint("prescription_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  dosage: varchar("dosage", { length: 255 }),
  frequency: varchar("frequency", { length: 255 }),
  durationDays: int("duration_days"),
  quantityPrescribed: int("quantity_prescribed").notNull(),
  quantityDispensed: int("quantity_dispensed").default(0).notNull(),
  instructions: text("instructions"),
  isControlled: boolean("is_controlled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const controlledSubstanceLog = mysqlTable("controlled_substance_log", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  prescriptionId: bigint("prescription_id", { mode: "number", unsigned: true }),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  patientIdNumber: varchar("patient_id_number", { length: 100 }),
  doctorName: varchar("doctor_name", { length: 255 }),
  quantityDispensed: int("quantity_dispensed").notNull(),
  balanceBefore: int("balance_before").notNull(),
  balanceAfter: int("balance_after").notNull(),
  dispensedBy: bigint("dispensed_by", { mode: "number", unsigned: true }).notNull(),
  witnessedBy: bigint("witnessed_by", { mode: "number", unsigned: true }),
  dispensedAt: timestamp("dispensed_at").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("controlled_substance_tenant_idx").on(table.tenantId),
]);

export const insuranceCompanies = mysqlTable("insurance_companies", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  code: varchar("code", { length: 50 }),
  contractNumber: varchar("contract_number", { length: 100 }),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  coveragePercent: decimal("coverage_percent", { precision: 5, scale: 2 }).default("100"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insuranceClaims = mysqlTable("insurance_claims", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  claimNumber: varchar("claim_number", { length: 50 }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  insuranceCompanyId: bigint("insurance_company_id", { mode: "number", unsigned: true }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  policyNumber: varchar("policy_number", { length: 100 }),
  memberId: varchar("member_id", { length: 100 }),
  coPayAmount: decimal("co_pay_amount", { precision: 18, scale: 4 }).default("0"),
  insuredAmount: decimal("insured_amount", { precision: 18, scale: 4 }).default("0"),
  claimAmount: decimal("claim_amount", { precision: 18, scale: 4 }).default("0"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "paid", "partial"]).default("pending").notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("insurance_claims_tenant_idx").on(table.tenantId),
]);

export const drugInteractions = mysqlTable("drug_interactions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productIdA: bigint("product_id_a", { mode: "number", unsigned: true }).notNull(),
  productIdB: bigint("product_id_b", { mode: "number", unsigned: true }).notNull(),
  severity: mysqlEnum("severity", ["mild", "moderate", "severe", "contraindicated"]).default("moderate").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueIdx: uniqueIndex("drug_interaction_pair_unique").on(table.productIdA, table.productIdB),
  tenantIdx: index("drug_interactions_tenant_idx").on(table.tenantId),
}));

export const sfdaSerialNumbers = mysqlTable("sfda_serial_numbers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 255 }).notNull(),
  expiryDate: date("expiry_date", { mode: "string" }),
  status: mysqlEnum("status", ["available", "sold", "returned", "expired", "destroyed"]).default("available").notNull(),
  soldAt: timestamp("sold_at"),
  invoiceItemId: bigint("invoice_item_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueIdx: uniqueIndex("sfda_serial_numbers_unique").on(table.serialNumber),
  productIdx: index("sfda_serial_product_idx").on(table.productId),
}));

// =====================================================
// 42. POS VERTICALS - Shared: Loyalty
// =====================================================

export const loyaltyPrograms = mysqlTable("loyalty_programs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  pointsPerCurrency: decimal("points_per_currency", { precision: 10, scale: 2 }).default("1").notNull(),
  currencyPerPoint: decimal("currency_per_point", { precision: 10, scale: 2 }).default("0.01").notNull(),
  pointExpiryDays: int("point_expiry_days").default(365),
  minRedeemPoints: int("min_redeem_points").default(0),
  maxRedeemPercent: decimal("max_redeem_percent", { precision: 5, scale: 2 }).default("100"),
  tierConfig: json("tier_config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("loyalty_programs_tenant_idx").on(table.tenantId),
]);

export const loyaltyCards = mysqlTable("loyalty_cards", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  programId: bigint("program_id", { mode: "number", unsigned: true }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  cardNumber: varchar("card_number", { length: 100 }).notNull(),
  tier: varchar("tier", { length: 50 }).default("standard"),
  totalPoints: decimal("total_points", { precision: 18, scale: 4 }).default("0"),
  lifetimePoints: decimal("lifetime_points", { precision: 18, scale: 4 }).default("0"),
  lifetimeSpend: decimal("lifetime_spend", { precision: 18, scale: 4 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).default("0"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  uniqueIdx: uniqueIndex("loyalty_cards_number_unique").on(table.cardNumber),
  customerIdx: index("loyalty_cards_customer_idx").on(table.customerId),
  programIdx: index("loyalty_cards_program_idx").on(table.programId),
}));

export const loyaltyTransactions = mysqlTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  cardId: bigint("card_id", { mode: "number", unsigned: true }).notNull(),
  transactionType: mysqlEnum("transaction_type", ["earn", "redeem", "adjust", "expire", "transfer"]).notNull(),
  points: decimal("points", { precision: 18, scale: 4 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).notNull(),
  referenceType: varchar("reference_type", { length: 100 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  description: text("description"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("loyalty_transactions_card_idx").on(table.cardId),
]);

// =====================================================
// 43. POS VERTICALS - Shared: Gift Cards
// =====================================================

export const giftCards = mysqlTable("gift_cards", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  cardNumber: varchar("card_number", { length: 100 }).notNull(),
  pin: varchar("pin", { length: 10 }),
  initialBalance: decimal("initial_balance", { precision: 18, scale: 4 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 18, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  issuerCustomerId: bigint("issuer_customer_id", { mode: "number", unsigned: true }),
  recipientEmail: varchar("recipient_email", { length: 320 }),
  recipientName: varchar("recipient_name", { length: 255 }),
  message: text("message"),
  expiresAt: timestamp("expires_at"),
  status: mysqlEnum("status", ["active", "redeemed", "expired", "cancelled"]).default("active").notNull(),
  issuedBy: bigint("issued_by", { mode: "number", unsigned: true }),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  uniqueIdx: uniqueIndex("gift_cards_number_unique").on(table.cardNumber),
  tenantIdx: index("gift_cards_tenant_idx").on(table.tenantId),
}));

export const giftCardTransactions = mysqlTable("gift_card_transactions", {
  id: serial("id").primaryKey(),
  giftCardId: bigint("gift_card_id", { mode: "number", unsigned: true }).notNull(),
  transactionType: mysqlEnum("transaction_type", ["issue", "redeem", "top_up", "refund", "expire"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).notNull(),
  referenceType: varchar("reference_type", { length: 100 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  description: text("description"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 44. POS VERTICALS - Shared: Shift/Till
// =====================================================

export const posShifts = mysqlTable("pos_shifts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  sessionId: bigint("session_id", { mode: "number", unsigned: true }),
  shiftNumber: varchar("shift_number", { length: 50 }).notNull(),
  openingBalance: decimal("opening_balance", { precision: 18, scale: 4 }).default("0").notNull(),
  closingExpected: decimal("closing_expected", { precision: 18, scale: 4 }).default("0"),
  closingActual: decimal("closing_actual", { precision: 18, scale: 4 }).default("0"),
  cashSales: decimal("cash_sales", { precision: 18, scale: 4 }).default("0"),
  cardSales: decimal("card_sales", { precision: 18, scale: 4 }).default("0"),
  transferSales: decimal("transfer_sales", { precision: 18, scale: 4 }).default("0"),
  totalSales: decimal("total_sales", { precision: 18, scale: 4 }).default("0"),
  cashIn: decimal("cash_in", { precision: 18, scale: 4 }).default("0"),
  cashOut: decimal("cash_out", { precision: 18, scale: 4 }).default("0"),
  difference: decimal("difference", { precision: 18, scale: 4 }).default("0"),
  status: mysqlEnum("status", ["open", "closed", "paused"]).default("open").notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("pos_shifts_tenant_idx").on(table.tenantId),
  index("pos_shifts_user_idx").on(table.userId, table.status),
]);

export const cashDrawerLogs = mysqlTable("cash_drawer_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  shiftId: bigint("shift_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  action: mysqlEnum("action", ["opening", "sale", "cash_in", "cash_out", "payout", "refund", "loan", "pickup", "closing"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 18, scale: 4 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 18, scale: 4 }).notNull(),
  referenceType: varchar("reference_type", { length: 100 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("cash_drawer_logs_shift_idx").on(table.shiftId),
]);

// =====================================================
// 45. POS VERTICALS - Wholesale: Pricing
// =====================================================

export const priceTiers = mysqlTable("price_tiers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  tierType: mysqlEnum("tier_type", ["quantity_break", "customer_group", "trade_discount"]).default("quantity_break").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("price_tiers_tenant_idx").on(table.tenantId),
]);

export const priceTierBreaks = mysqlTable("price_tier_breaks", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  priceTierId: bigint("price_tier_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  minQuantity: int("min_quantity").default(1).notNull(),
  maxQuantity: int("max_quantity"),
  unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerPriceTiers = mysqlTable("customer_price_tiers", {
  id: serial("id").primaryKey(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  priceTierId: bigint("price_tier_id", { mode: "number", unsigned: true }).notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueIdx: uniqueIndex("customer_price_tiers_unique").on(table.customerId, table.priceTierId),
}));

// =====================================================
// 46. POS VERTICALS - Shared: EMV & Payment
// =====================================================

export const emvTransactions = mysqlTable("emv_transactions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  transactionId: varchar("transaction_id", { length: 255 }),
  terminalId: varchar("terminal_id", { length: 100 }),
  cardType: varchar("card_type", { length: 50 }),
  cardLastFour: varchar("card_last_four", { length: 10 }),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  authCode: varchar("auth_code", { length: 50 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  status: mysqlEnum("status", ["pending", "approved", "declined", "failed", "refunded", "voided"]).default("pending").notNull(),
  responseCode: varchar("response_code", { length: 20 }),
  responseMessage: text("response_message"),
  requestPayload: json("request_payload"),
  responsePayload: json("response_payload"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("emv_transactions_invoice_idx").on(table.invoiceId),
]);

export const paymentSplits = mysqlTable("payment_splits", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "transfer", "cheque", "wallet", "loyalty", "gift_card", "credit", "multiple"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  reference: varchar("reference", { length: 255 }),
  emvTransactionId: bigint("emv_transaction_id", { mode: "number", unsigned: true }),
  giftCardId: bigint("gift_card_id", { mode: "number", unsigned: true }),
  loyaltyPointsUsed: decimal("loyalty_points_used", { precision: 18, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("payment_splits_invoice_idx").on(table.invoiceId),
]);

// =====================================================
// 47. POS VERTICALS - QR Ordering
// =====================================================

export const qrOrderSessions = mysqlTable("qr_order_sessions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  restaurantTableId: bigint("restaurant_table_id", { mode: "number", unsigned: true }),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  deviceId: varchar("device_id", { length: 255 }),
  status: mysqlEnum("status", ["active", "ordered", "paid", "expired", "cancelled"]).default("active").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("qr_order_sessions_table_idx").on(table.restaurantTableId),
]);

// =====================================================
// 40. HEALTHCARE VERTICAL
// =====================================================

export const patients = mysqlTable("patients", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientNumber: varchar("patient_number", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  address: text("address"),
  bloodGroup: varchar("blood_group", { length: 10 }),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
  nationalId: varchar("national_id", { length: 100 }),
  insuranceProvider: varchar("insurance_provider", { length: 255 }),
  insurancePolicyNumber: varchar("insurance_policy_number", { length: 100 }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("patients_tenant_idx").on(table.tenantId),
  index("patients_phone_idx").on(table.phone),
]);

export const appointments = mysqlTable("appointments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  doctorId: bigint("doctor_id", { mode: "number", unsigned: true }),
  appointmentNumber: varchar("appointment_number", { length: 50 }).notNull(),
  appointmentDate: date("appointment_date", { mode: "string" }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  appointmentType: mysqlEnum("appointment_type", ["consultation", "follow_up", "emergency", "checkup", "procedure", "vaccination"]).default("consultation").notNull(),
  status: mysqlEnum("status", ["scheduled", "checked_in", "in_progress", "completed", "cancelled", "no_show", "rescheduled"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("appointments_tenant_idx").on(table.tenantId),
  index("appointments_date_idx").on(table.tenantId, table.appointmentDate),
  index("appointments_patient_idx").on(table.patientId),
]);

export const doctorRosters = mysqlTable("doctor_rosters", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  specialization: varchar("specialization", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  consultationFee: decimal("consultation_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  maxPatientsPerDay: int("max_patients_per_day").default(20),
  workingDays: json("working_days"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("doctor_rosters_tenant_idx").on(table.tenantId),
]);

export const insuranceClaimsHealthcare = mysqlTable("insurance_claims_healthcare", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  claimNumber: varchar("claim_number", { length: 50 }).notNull(),
  insuranceProvider: varchar("insurance_provider", { length: 255 }).notNull(),
  policyNumber: varchar("policy_number", { length: 100 }),
  claimAmount: decimal("claim_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  approvedAmount: decimal("approved_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "paid", "partial"]).default("draft").notNull(),
  submissionDate: date("submission_date", { mode: "string" }),
  approvalDate: date("approval_date", { mode: "string" }),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("insurance_claims_hc_tenant_idx").on(table.tenantId),
]);

export const labOrders = mysqlTable("lab_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  testName: varchar("test_name", { length: 255 }).notNull(),
  orderedBy: bigint("ordered_by", { mode: "number", unsigned: true }),
  orderDate: date("order_date", { mode: "string" }).notNull(),
  resultDate: date("result_date", { mode: "string" }),
  result: text("result"),
  status: mysqlEnum("status", ["pending", "collected", "processing", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("lab_orders_tenant_idx").on(table.tenantId),
]);

export const pharmacyIntegration = mysqlTable("pharmacy_integration", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  patientId: bigint("patient_id", { mode: "number", unsigned: true }).notNull(),
  appointmentId: bigint("appointment_id", { mode: "number", unsigned: true }),
  prescriptionNumber: varchar("prescription_number", { length: 50 }).notNull(),
  medicationName: varchar("medication_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  durationDays: int("duration_days"),
  quantity: int("quantity").notNull(),
  refills: int("refills").default(0),
  status: mysqlEnum("status", ["prescribed", "dispensed", "partial", "cancelled"]).default("prescribed").notNull(),
  prescribedBy: bigint("prescribed_by", { mode: "number", unsigned: true }),
  dispensedAt: timestamp("dispensed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pharmacy_integration_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 41. EDUCATION VERTICAL
// =====================================================

export const students = mysqlTable("students", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  studentNumber: varchar("student_number", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  gender: mysqlEnum("gender", ["male", "female"]),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianPhone: varchar("guardian_phone", { length: 50 }),
  guardianEmail: varchar("guardian_email", { length: 320 }),
  grade: varchar("grade", { length: 50 }),
  section: varchar("section", { length: 50 }),
  academicYear: varchar("academic_year", { length: 20 }),
  enrollmentDate: date("enrollment_date", { mode: "string" }),
  status: mysqlEnum("status", ["active", "transferred", "graduated", "expelled", "withdrawn"]).default("active").notNull(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("students_tenant_idx").on(table.tenantId),
]);

export const admissions = mysqlTable("admissions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  admissionNumber: varchar("admission_number", { length: 50 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  gender: mysqlEnum("gender", ["male", "female"]),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianPhone: varchar("guardian_phone", { length: 50 }),
  guardianEmail: varchar("guardian_email", { length: 320 }),
  applyingForGrade: varchar("applying_for_grade", { length: 50 }),
  previousSchool: varchar("previous_school", { length: 255 }),
  academicYear: varchar("academic_year", { length: 20 }),
  status: mysqlEnum("status", ["inquiry", "applied", "interviewed", "accepted", "rejected", "enrolled", "waitlisted"]).default("inquiry").notNull(),
  interviewDate: date("interview_date", { mode: "string" }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("admissions_tenant_idx").on(table.tenantId),
]);

export const feeStructures = mysqlTable("fee_structures", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 50 }),
  academicYear: varchar("academic_year", { length: 20 }),
  tuitionFee: decimal("tuition_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  admissionFee: decimal("admission_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  libraryFee: decimal("library_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  sportsFee: decimal("sports_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  transportFee: decimal("transport_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  otherFee: decimal("other_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  totalFee: decimal("total_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("fee_structures_tenant_idx").on(table.tenantId),
]);

export const studentFeeInvoices = mysqlTable("student_fee_invoices", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  feeStructureId: bigint("fee_structure_id", { mode: "number", unsigned: true }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  term: varchar("term", { length: 50 }),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  dueDate: date("due_date", { mode: "string" }),
  status: mysqlEnum("status", ["pending", "partial", "paid", "overdue", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("student_fee_invoices_tenant_idx").on(table.tenantId),
]);

export const classTimetables = mysqlTable("class_timetables", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  grade: varchar("grade", { length: 50 }),
  section: varchar("section", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  teacherId: bigint("teacher_id", { mode: "number", unsigned: true }),
  dayOfWeek: mysqlEnum("day_of_week", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  roomNumber: varchar("room_number", { length: 50 }),
  academicYear: varchar("academic_year", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("class_timetables_tenant_idx").on(table.tenantId),
]);

export const studentAttendance = mysqlTable("student_attendance", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["present", "absent", "late", "excused", "holiday"]).default("present").notNull(),
  remarks: text("remarks"),
  markedBy: bigint("marked_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("student_attendance_tenant_idx").on(table.tenantId),
  index("student_attendance_student_idx").on(table.studentId),
  index("student_attendance_date_idx").on(table.tenantId, table.date),
]);

export const reportCards = mysqlTable("report_cards", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  term: varchar("term", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  score: decimal("score", { precision: 8, scale: 2 }),
  grade: varchar("grade", { length: 10 }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("report_cards_tenant_idx").on(table.tenantId),
  index("report_cards_student_idx").on(table.studentId),
]);

// =====================================================
// 42. HOTEL VERTICAL
// =====================================================

export const roomTypes = mysqlTable("room_types", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 18, scale: 4 }).notNull(),
  maxOccupancy: int("max_occupancy").default(2),
  numberOfRooms: int("number_of_rooms").default(1),
  amenities: json("amenities"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("room_types_tenant_idx").on(table.tenantId),
]);

export const roomInventory = mysqlTable("room_inventory", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  roomTypeId: bigint("room_type_id", { mode: "number", unsigned: true }).notNull(),
  roomNumber: varchar("room_number", { length: 50 }).notNull(),
  floor: varchar("floor", { length: 50 }),
  status: mysqlEnum("status", ["available", "occupied", "maintenance", "reserved", "cleaning"]).default("available").notNull(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("room_inventory_tenant_idx").on(table.tenantId),
  index("room_inventory_type_idx").on(table.roomTypeId),
]);

export const hotelBookings = mysqlTable("hotel_bookings", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  bookingNumber: varchar("booking_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  roomTypeId: bigint("room_type_id", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }),
  checkIn: date("check_in", { mode: "string" }).notNull(),
  checkOut: date("check_out", { mode: "string" }).notNull(),
  adults: int("adults").default(1),
  children: int("children").default(0),
  nightlyRate: decimal("nightly_rate", { precision: 18, scale: 4 }).notNull(),
  totalNights: int("total_nights").notNull(),
  subtotal: decimal("subtotal", { precision: 18, scale: 4 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  source: mysqlEnum("source", ["direct", "booking.com", "expedia", "agoda", "travel_agency", "other"]).default("direct").notNull(),
  channelBookingId: varchar("channel_booking_id", { length: 255 }),
  status: mysqlEnum("status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]).default("pending").notNull(),
  specialRequests: text("special_requests"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("hotel_bookings_tenant_idx").on(table.tenantId),
  index("hotel_bookings_dates_idx").on(table.tenantId, table.checkIn, table.checkOut),
  index("hotel_bookings_source_idx").on(table.source),
]);

export const bookingCalendar = mysqlTable("booking_calendar", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["available", "booked", "maintenance", "blocked"]).default("available").notNull(),
  bookingId: bigint("booking_id", { mode: "number", unsigned: true }),
  rateOverride: decimal("rate_override", { precision: 18, scale: 4 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("booking_calendar_tenant_idx").on(table.tenantId),
  index("booking_calendar_room_date_idx").on(table.roomId, table.date),
]);

// =====================================================
// 48. SAUDI HR COMPLIANCE ENGINE
// =====================================================

export const gosiRateTables = mysqlTable("gosi_rate_tables", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  effectiveFrom: date("effective_from", { mode: "string" }).notNull(),
  effectiveTo: date("effective_to", { mode: "string" }),
  systemType: mysqlEnum("system_type", ["new", "old"]).default("new").notNull(),
  employeeAnnuitiesRate: decimal("employee_annuities_rate", { precision: 5, scale: 4 }).default("0.0950").notNull(),
  employerAnnuitiesRate: decimal("employer_annuities_rate", { precision: 5, scale: 4 }).default("0.0950").notNull(),
  employerHazardsRate: decimal("employer_hazards_rate", { precision: 5, scale: 4 }).default("0.0200").notNull(),
  employeeUnemploymentRate: decimal("employee_unemployment_rate", { precision: 5, scale: 4 }).default("0.0075").notNull(),
  employerUnemploymentRate: decimal("employer_unemployment_rate", { precision: 5, scale: 4 }).default("0.0075").notNull(),
  contributionCap: decimal("contribution_cap", { precision: 18, scale: 4 }).default("45000.0000").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("gosi_rates_tenant_idx").on(table.tenantId),
  index("gosi_rates_effective_idx").on(table.effectiveFrom, table.effectiveTo),
]);

export const gosiRegistrations = mysqlTable("gosi_registrations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  gosiNumber: varchar("gosi_number", { length: 50 }),
  isSubscriber: boolean("is_subscriber").default(true),
  registrationDate: date("registration_date", { mode: "string" }),
  systemType: mysqlEnum("system_type", ["new", "old"]).default("new"),
  contributionCap: decimal("contribution_cap", { precision: 18, scale: 4 }).default("45000.0000"),
  lastCalculatedAt: timestamp("last_calculated_at"),
  lastContribution: decimal("last_contribution", { precision: 18, scale: 4 }),
  needsUpdate: boolean("needs_update").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  uniqueIdx: uniqueIndex("gosi_reg_emp_idx").on(table.tenantId, table.employeeId),
  employeeIdx: index("gosi_reg_employee_idx").on(table.employeeId),
}));

export const gosiSubmissionLogs = mysqlTable("gosi_submission_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  periodMonth: int("period_month").notNull(),
  periodYear: int("period_year").notNull(),
  totalEmployeeShare: decimal("total_employee_share", { precision: 18, scale: 4 }).default("0").notNull(),
  totalEmployerShare: decimal("total_employer_share", { precision: 18, scale: 4 }).default("0").notNull(),
  totalContributions: decimal("total_contributions", { precision: 18, scale: 4 }).default("0").notNull(),
  employeeCount: int("employee_count").default(0).notNull(),
  submissionDate: timestamp("submission_date"),
  status: mysqlEnum("status", ["draft", "submitted", "acknowledged", "failed"]).default("draft").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  submissionFile: text("submission_file"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("gosi_sub_tenant_idx").on(table.tenantId, table.periodYear, table.periodMonth),
]);

export const wpsSubmissions = mysqlTable("wps_submissions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  payrollPeriodId: bigint("payroll_period_id", { mode: "number", unsigned: true }).notNull(),
  submissionDate: date("submission_date", { mode: "string" }).notNull(),
  bankFormat: varchar("bank_format", { length: 50 }).notNull().default("sarie"),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  employeeCount: int("employee_count").default(0).notNull(),
  complianceRate: decimal("compliance_rate", { precision: 5, scale: 2 }),
  fileContent: text("file_content"),
  fileName: varchar("file_name", { length: 255 }),
  status: mysqlEnum("status", ["draft", "submitted", "acknowledged", "rejected"]).default("draft").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  submittedAt: timestamp("submitted_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("wps_tenant_idx").on(table.tenantId, table.payrollPeriodId),
]);

export const wpsExceptions = mysqlTable("wps_exceptions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  payrollPeriodId: bigint("payroll_period_id", { mode: "number", unsigned: true }).notNull(),
  exceptionType: mysqlEnum("exception_type", ["unpaid_leave", "disciplinary_deduction", "bank_account_change", "other"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).default("0"),
  reason: text("reason"),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("wps_exc_tenant_idx").on(table.tenantId, table.payrollPeriodId),
]);

export const qiwaContracts = mysqlTable("qiwa_contracts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  qiwaContractId: varchar("qiwa_contract_id", { length: 100 }),
  contractType: mysqlEnum("contract_type", ["full_time", "part_time", "temporary", "probation"]).default("full_time"),
  basicSalary: decimal("basic_salary", { precision: 18, scale: 4 }).default("0"),
  housingAllowance: decimal("housing_allowance", { precision: 18, scale: 4 }).default("0"),
  transportAllowance: decimal("transport_allowance", { precision: 18, scale: 4 }).default("0"),
  otherAllowances: decimal("other_allowances", { precision: 18, scale: 4 }).default("0"),
  totalSalary: decimal("total_salary", { precision: 18, scale: 4 }).default("0"),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  lastSyncedAt: timestamp("last_synced_at"),
  isMatched: boolean("is_matched").default(true),
  mismatchDetails: text("mismatch_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  uniqueIdx: uniqueIndex("qiwa_contract_emp_idx").on(table.tenantId, table.employeeId),
}));

export const qiwaComparisonLogs = mysqlTable("qiwa_comparison_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  comparisonType: mysqlEnum("comparison_type", ["salary", "allowance", "contract", "all"]).notNull(),
  expectedValue: text("expected_value"),
  actualValue: text("actual_value"),
  difference: varchar("difference", { length: 255 }),
  isMatched: boolean("is_matched").default(true),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
}, (table) => [
  index("qiwa_log_tenant_idx").on(table.tenantId),
]);

export const iqamaRecords = mysqlTable("iqama_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  iqamaNumber: varchar("iqama_number", { length: 50 }).notNull(),
  passportNumber: varchar("passport_number", { length: 50 }),
  issuanceDate: date("issuance_date", { mode: "string" }),
  expiryDate: date("expiry_date", { mode: "string" }).notNull(),
  renewalDate: date("renewal_date", { mode: "string" }),
  profession: varchar("profession", { length: 255 }),
  sponsorName: varchar("sponsor_name", { length: 255 }),
  borderNumber: varchar("border_number", { length: 50 }),
  status: mysqlEnum("status", ["active", "expired", "renewed", "cancelled"]).default("active").notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("iqama_tenant_idx").on(table.tenantId, table.employeeId),
  index("iqama_expiry_idx").on(table.expiryDate),
  index("iqama_number_idx").on(table.iqamaNumber),
]);

export const nitaqatSnapshots = mysqlTable("nitaqat_snapshots", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  snapshotDate: date("snapshot_date", { mode: "string" }).notNull(),
  totalSaudis: int("total_saudis").default(0).notNull(),
  totalExpats: int("total_expats").default(0).notNull(),
  saudiRatio: decimal("saudi_ratio", { precision: 5, scale: 4 }).default("0").notNull(),
  category: mysqlEnum("category", ["platinum", "green", "yellow", "red"]),
  targetRatio: decimal("target_ratio", { precision: 5, scale: 4 }),
  forecastRatio: decimal("forecast_ratio", { precision: 5, scale: 4 }),
  whatIfHireSaudi: int("what_if_hire_saudi").default(0),
  whatIfHireExpat: int("what_if_hire_expat").default(0),
  whatIfFireSaudi: int("what_if_fire_saudi").default(0),
  whatIfFireExpat: int("what_if_fire_expat").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("nitaqat_tenant_idx").on(table.tenantId, table.snapshotDate),
]);

export const eosbAccruals = mysqlTable("eosb_accruals", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  serviceYears: decimal("service_years", { precision: 10, scale: 4 }).default("0").notNull(),
  accrualRate: decimal("accrual_rate", { precision: 5, scale: 4 }).default("0.5000").notNull(),
  accrualAmount: decimal("accrual_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  runningTotal: decimal("running_total", { precision: 18, scale: 4 }).default("0").notNull(),
  lastBasicSalary: decimal("last_basic_salary", { precision: 18, scale: 4 }).default("0").notNull(),
  isHijri: boolean("is_hijri").default(true),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("eosb_tenant_idx").on(table.tenantId, table.employeeId),
  index("eosb_period_idx").on(table.periodStart, table.periodEnd),
]);

export const biometricTemplates = mysqlTable("biometric_templates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  templateType: mysqlEnum("template_type", ["face", "fingerprint", "voice"]).notNull(),
  templateHash: varchar("template_hash", { length: 255 }).notNull(),
  templateDataEncrypted: text("template_data_encrypted").notNull(),
  encryptionIv: varchar("encryption_iv", { length: 64 }).notNull(),
  encryptionTag: varchar("encryption_tag", { length: 64 }).notNull(),
  deviceId: varchar("device_id", { length: 100 }),
  isActive: boolean("is_active").default(true),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bio_tenant_idx").on(table.tenantId, table.employeeId),
  index("bio_device_idx").on(table.deviceId),
]);

export const biometricConsentRecords = mysqlTable("biometric_consent_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  consentType: mysqlEnum("consent_type", ["face", "fingerprint", "voice", "gps_location", "all"]).notNull(),
  isConsented: boolean("is_consented").default(true),
  consentDate: timestamp("consent_date").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  lawfulBasis: varchar("lawful_basis", { length: 255 }).default("explicit_consent").notNull(),
  purposeDescription: text("purpose_description"),
  retentionPeriodDays: int("retention_period_days").default(90),
  dataDeletedAt: timestamp("data_deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bio_consent_tenant_idx").on(table.tenantId, table.employeeId),
]);

export const biometricAccessLogs = mysqlTable("biometric_access_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  templateId: bigint("template_id", { mode: "number", unsigned: true }),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  action: mysqlEnum("action", ["enroll", "verify", "identify", "view", "export", "delete", "update"]).notNull(),
  accessedBy: bigint("accessed_by", { mode: "number", unsigned: true }).notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  isAllowed: boolean("is_allowed").default(true),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bio_access_tenant_idx").on(table.tenantId),
  index("bio_access_employee_idx").on(table.employeeId),
]);

export const pdplDataSubjectRequests = mysqlTable("pdpl_data_subject_requests", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  requestType: mysqlEnum("request_type", ["access", "rectification", "erasure", "restrict", "portability", "objection", "withdraw_consent"]).notNull(),
  requestDetails: text("request_details"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "rejected"]).default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  responseSummary: text("response_summary"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pdpl_tenant_idx").on(table.tenantId, table.employeeId),
]);

export const housekeepingSchedule = mysqlTable("housekeeping_schedule", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }).notNull(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  date: date("date", { mode: "string" }).notNull(),
  taskType: mysqlEnum("task_type", ["daily_clean", "tidy_up", "deep_clean", "turnover", "inspection", "repair"]).default("daily_clean").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "skipped", "issue_reported"]).default("pending").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("housekeeping_tenant_idx").on(table.tenantId),
  index("housekeeping_date_idx").on(table.tenantId, table.date),
]);

export const folioCharges = mysqlTable("folio_charges", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  bookingId: bigint("booking_id", { mode: "number", unsigned: true }).notNull(),
  chargeType: mysqlEnum("charge_type", ["room", "restaurant", "minibar", "laundry", "spa", "transport", "other"]).default("other").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  quantity: int("quantity").default(1),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
  chargeDate: date("charge_date", { mode: "string" }).notNull(),
  postedToInvoice: boolean("posted_to_invoice").default(false),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("folio_charges_tenant_idx").on(table.tenantId),
  index("folio_charges_booking_idx").on(table.bookingId),
]);

// =====================================================
// 43. CONSTRUCTION VERTICAL
// =====================================================

export const constructionProjects = mysqlTable("construction_projects", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectCode: varchar("project_code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectManagerId: bigint("project_manager_id", { mode: "number", unsigned: true }),
  location: varchar("location", { length: 255 }),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  contractValue: decimal("contract_value", { precision: 18, scale: 4 }).default("0").notNull(),
  budget: decimal("budget", { precision: 18, scale: 4 }).default("0").notNull(),
  actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  progress: int("progress").default(0),
  status: mysqlEnum("status", ["planning", "tendering", "active", "on_hold", "completed", "cancelled"]).default("planning").notNull(),
  projectType: mysqlEnum("project_type", ["residential", "commercial", "industrial", "infrastructure", "renovation"]).default("residential").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("construction_projects_tenant_idx").on(table.tenantId),
]);

export const subcontractors = mysqlTable("subcontractors", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  trade: varchar("trade", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  contractAmount: decimal("contract_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default("10").notNull(),
  retentionAmount: decimal("retention_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("subcontractors_tenant_idx").on(table.tenantId),
]);

export const subcontractorProjects = mysqlTable("subcontractor_projects", {
  id: serial("id").primaryKey(),
  subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  scope: text("scope"),
  contractAmount: decimal("contract_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  status: mysqlEnum("status", ["pending", "active", "completed", "terminated"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const equipmentTracking = mysqlTable("equipment_tracking", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  equipmentCode: varchar("equipment_code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  assetId: bigint("asset_id", { mode: "number", unsigned: true }),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  type: varchar("type", { length: 100 }),
  hourlyRate: decimal("hourly_rate", { precision: 18, scale: 4 }).default("0").notNull(),
  dailyRate: decimal("daily_rate", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["available", "in_use", "maintenance", "retired"]).default("available").notNull(),
  hoursUsed: decimal("hours_used", { precision: 10, scale: 2 }).default("0").notNull(),
  location: varchar("location", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("equipment_tracking_tenant_idx").on(table.tenantId),
]);

export const progressBilling = mysqlTable("progress_billing", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  milestoneName: varchar("milestone_name", { length: 255 }),
  billingPeriod: varchar("billing_period", { length: 50 }),
  percentageComplete: decimal("percentage_complete", { precision: 5, scale: 2 }).default("0").notNull(),
  billedAmount: decimal("billed_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default("10").notNull(),
  retentionAmount: decimal("retention_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  dueDate: date("due_date", { mode: "string" }),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "paid", "partial", "disputed"]).default("draft").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("progress_billing_tenant_idx").on(table.tenantId),
]);

export const retentionAccounts = mysqlTable("retention_accounts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }),
  totalRetention: decimal("total_retention", { precision: 18, scale: 4 }).default("0").notNull(),
  releasedAmount: decimal("released_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  expectedReleaseDate: date("expected_release_date", { mode: "string" }),
  status: mysqlEnum("status", ["held", "partial_release", "released"]).default("held").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("retention_accounts_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 44. TRANSPORT / LOGISTICS VERTICAL
// =====================================================

export const routes = mysqlTable("routes", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  routeCode: varchar("route_code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
  estimatedDuration: varchar("estimated_duration", { length: 50 }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("routes_tenant_idx").on(table.tenantId),
]);

export const routePlanning = mysqlTable("route_planning", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  routeId: bigint("route_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
  driverId: bigint("driver_id", { mode: "number", unsigned: true }),
  plannedDate: date("planned_date", { mode: "string" }).notNull(),
  departureTime: varchar("departure_time", { length: 10 }),
  arrivalTime: varchar("arrival_time", { length: 10 }),
  status: mysqlEnum("status", ["planned", "in_transit", "completed", "cancelled"]).default("planned").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("route_planning_tenant_idx").on(table.tenantId),
]);

export const driverSchedules = mysqlTable("driver_schedules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  driverId: bigint("driver_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  status: mysqlEnum("status", ["scheduled", "on_duty", "off_duty", "on_leave"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("driver_schedules_tenant_idx").on(table.tenantId),
]);

export const shipmentTracking = mysqlTable("shipment_tracking", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  volume: decimal("volume", { precision: 10, scale: 2 }),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }),
  driverId: bigint("driver_id", { mode: "number", unsigned: true }),
  routeId: bigint("route_id", { mode: "number", unsigned: true }),
  dispatchedAt: timestamp("dispatched_at"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  status: mysqlEnum("status", ["pending", "picked_up", "in_transit", "delivered", "exception", "cancelled"]).default("pending").notNull(),
  lastLocation: varchar("last_location", { length: 255 }),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 7 }),
  currentLongitude: decimal("current_longitude", { precision: 10, scale: 7 }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  signature: text("signature"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("shipment_tracking_tenant_idx").on(table.tenantId),
  index("shipment_tracking_tracking_idx").on(table.trackingNumber),
  index("shipment_tracking_status_idx").on(table.tenantId, table.status),
]);

export const fuelCostAnalytics = mysqlTable("fuel_cost_analytics", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  totalLiters: decimal("total_liters", { precision: 12, scale: 2 }).default("0").notNull(),
  totalCost: decimal("total_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  distanceCovered: int("distance_covered").default(0),
  kmPerLiter: decimal("km_per_liter", { precision: 8, scale: 2 }),
  costPerKm: decimal("cost_per_km", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("fuel_cost_analytics_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 45. REAL ESTATE VERTICAL
// =====================================================

export const properties = mysqlTable("properties", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  propertyCode: varchar("property_code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  propertyType: mysqlEnum("property_type", ["residential", "commercial", "industrial", "land", "mixed_use"]).default("residential").notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  areaSize: decimal("area_size", { precision: 12, scale: 2 }),
  areaUnit: varchar("area_unit", { length: 20 }).default("sqm"),
  purchaseDate: date("purchase_date", { mode: "string" }),
  purchaseCost: decimal("purchase_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  currentValue: decimal("current_value", { precision: 18, scale: 4 }).default("0").notNull(),
  propertyTax: decimal("property_tax", { precision: 18, scale: 4 }).default("0").notNull(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("properties_tenant_idx").on(table.tenantId),
]);

export const propertyUnits = mysqlTable("property_units", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  propertyId: bigint("property_id", { mode: "number", unsigned: true }).notNull(),
  unitNumber: varchar("unit_number", { length: 50 }).notNull(),
  floor: varchar("floor", { length: 50 }),
  bedrooms: int("bedrooms").default(0),
  bathrooms: int("bathrooms").default(0),
  areaSize: decimal("area_size", { precision: 12, scale: 2 }),
  monthlyRent: decimal("monthly_rent", { precision: 18, scale: 4 }).default("0").notNull(),
  securityDeposit: decimal("security_deposit", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["vacant", "occupied", "maintenance", "reserved"]).default("vacant").notNull(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("property_units_tenant_idx").on(table.tenantId),
  index("property_units_property_idx").on(table.propertyId),
]);

export const leases = mysqlTable("leases", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  leaseNumber: varchar("lease_number", { length: 50 }).notNull(),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 18, scale: 4 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 18, scale: 4 }).default("0").notNull(),
  rentDueDay: int("rent_due_day").default(1),
  leaseType: mysqlEnum("lease_type", ["residential", "commercial", "short_term", "long_term"]).default("residential").notNull(),
  status: mysqlEnum("status", ["draft", "active", "expired", "terminated", "renewed"]).default("draft").notNull(),
  renewalCount: int("renewal_count").default(0),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("leases_tenant_idx").on(table.tenantId),
  index("leases_unit_idx").on(table.unitId),
]);

export const rentInvoices = mysqlTable("rent_invoices", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  leaseId: bigint("lease_id", { mode: "number", unsigned: true }).notNull(),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  rentAmount: decimal("rent_amount", { precision: 18, scale: 4 }).notNull(),
  lateFee: decimal("late_fee", { precision: 18, scale: 4 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  paidDate: date("paid_date", { mode: "string" }),
  status: mysqlEnum("status", ["pending", "paid", "partial", "overdue", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("rent_invoices_tenant_idx").on(table.tenantId),
  index("rent_invoices_lease_idx").on(table.leaseId),
  index("rent_invoices_status_idx").on(table.tenantId, table.status),
]);

export const maintenanceRequests = mysqlTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  unitId: bigint("unit_id", { mode: "number", unsigned: true }).notNull(),
  requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
  requestNumber: varchar("request_number", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["reported", "assigned", "in_progress", "resolved", "closed", "cancelled"]).default("reported").notNull(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  estimatedCost: decimal("estimated_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  actualCost: decimal("actual_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  scheduledDate: date("scheduled_date", { mode: "string" }),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("maintenance_requests_tenant_idx").on(table.tenantId),
  index("maintenance_requests_status_idx").on(table.tenantId, table.status),
]);

export const commissionRecords = mysqlTable("commission_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  agentName: varchar("agent_name", { length: 255 }).notNull(),
  leaseId: bigint("lease_id", { mode: "number", unsigned: true }),
  propertyId: bigint("property_id", { mode: "number", unsigned: true }),
  commissionType: mysqlEnum("commission_type", ["rental", "sale", "referral"]).default("rental").notNull(),
  commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  dueDate: date("due_date", { mode: "string" }),
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("commission_records_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 46. TRAVEL AGENCY VERTICAL
// =====================================================

export const travelBookings = mysqlTable("travel_bookings", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  bookingNumber: varchar("booking_number", { length: 50 }).notNull(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }).notNull(),
  bookingType: mysqlEnum("booking_type", ["flight", "hotel", "package", "car_rental", "insurance", "visa"]).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  bookingDate: date("booking_date", { mode: "string" }).notNull(),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  grossAmount: decimal("gross_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  netAmount: decimal("net_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  source: mysqlEnum("source", ["direct", "online", "partner", "corporate"]).default("direct").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "refunded", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("travel_bookings_tenant_idx").on(table.tenantId),
  index("travel_bookings_type_idx").on(table.bookingType),
]);

export const travelSuppliers = mysqlTable("travel_suppliers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  supplierType: mysqlEnum("supplier_type", ["airline", "hotel", "car_rental", "insurance", "tour_operator", "visa", "other"]).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  paymentTerms: varchar("payment_terms", { length: 255 }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("travel_suppliers_tenant_idx").on(table.tenantId),
]);

export const itineraries = mysqlTable("itineraries", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  bookingId: bigint("booking_id", { mode: "number", unsigned: true }).notNull(),
  day: int("day").notNull(),
  date: date("date", { mode: "string" }),
  activity: varchar("activity", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  cost: decimal("cost", { precision: 18, scale: 4 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("itineraries_tenant_idx").on(table.tenantId),
  index("itineraries_booking_idx").on(table.bookingId),
]);

export const supplierReconciliation = mysqlTable("supplier_reconciliation", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  reconciliationNumber: varchar("reconciliation_number", { length: 50 }).notNull(),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  totalBookings: int("total_bookings").default(0),
  grossAmount: decimal("gross_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  netPayable: decimal("net_payable", { precision: 18, scale: 4 }).default("0").notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  balanceDue: decimal("balance_due", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["draft", "confirmed", "paid", "disputed"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("supplier_reconciliation_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 47. AVIATION VERTICAL
// =====================================================

export const flights = mysqlTable("flights", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  flightNumber: varchar("flight_number", { length: 50 }).notNull(),
  aircraftRegistration: varchar("aircraft_registration", { length: 50 }),
  aircraftType: varchar("aircraft_type", { length: 100 }),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  flightDuration: int("flight_duration"),
  totalSeats: int("total_seats").default(0),
  bookedSeats: int("booked_seats").default(0),
  status: mysqlEnum("status", ["scheduled", "boarding", "departed", "in_air", "landed", "cancelled", "delayed", "diverted"]).default("scheduled").notNull(),
  delayReason: text("delay_reason"),
  pilotId: bigint("pilot_id", { mode: "number", unsigned: true }),
  copilotId: bigint("copilot_id", { mode: "number", unsigned: true }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("flights_tenant_idx").on(table.tenantId),
  index("flights_departure_idx").on(table.tenantId, table.departureTime),
  index("flights_route_idx").on(table.origin, table.destination),
]);

export const crewCertifications = mysqlTable("crew_certifications", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  certificationType: varchar("certification_type", { length: 255 }).notNull(),
  certificationNumber: varchar("certification_number", { length: 100 }),
  issuedBy: varchar("issued_by", { length: 255 }),
  issueDate: date("issue_date", { mode: "string" }),
  expiryDate: date("expiry_date", { mode: "string" }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("crew_certifications_tenant_idx").on(table.tenantId),
  index("crew_certifications_emp_idx").on(table.employeeId),
]);

export const maintenanceAirworthiness = mysqlTable("maintenance_airworthiness", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  vehicleId: bigint("vehicle_id", { mode: "number", unsigned: true }),
  aircraftRegistration: varchar("aircraft_registration", { length: 50 }),
  inspectionType: varchar("inspection_type", { length: 255 }).notNull(),
  inspectionDate: date("inspection_date", { mode: "string" }).notNull(),
  nextDueDate: date("next_due_date", { mode: "string" }),
  airframeHours: int("airframe_hours"),
  engineHours: int("engine_hours"),
  performedBy: varchar("performed_by", { length: 255 }),
  findings: text("findings"),
  correctiveAction: text("corrective_action"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "deferred", "aog"]).default("scheduled").notNull(),
  isAirworthy: boolean("is_airworthy").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("maintenance_airworthiness_tenant_idx").on(table.tenantId),
]);

export const partsInventorySerial = mysqlTable("parts_inventory_serial", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  partNumber: varchar("part_number", { length: 100 }).notNull(),
  partName: varchar("part_name", { length: 255 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().unique(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  quantity: int("quantity").default(1),
  condition: mysqlEnum("condition", ["new", "serviceable", "overhauled", "unserviceable", "scrap"]).default("new").notNull(),
  location: varchar("location", { length: 255 }),
  shelfLife: date("shelf_life", { mode: "string" }),
  installationDate: date("installation_date", { mode: "string" }),
  installedOnAircraft: varchar("installed_on_aircraft", { length: 50 }),
  removalDate: date("removal_date", { mode: "string" }),
  tsn: int("tsn").default(0),
  csi: int("csi").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("parts_inventory_serial_tenant_idx").on(table.tenantId),
  index("parts_inventory_serial_part_idx").on(table.partNumber),
]);

// =====================================================
// 50. AI REPORTS
// =====================================================

export const aiReportTemplates = mysqlTable("ai_report_templates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  naturalLanguageQuery: text("natural_language_query").notNull(),
  parsedIntent: varchar("parsed_intent", { length: 100 }),
  generatedSql: text("generated_sql"),
  resultCache: json("result_cache"),
  chartType: varchar("chart_type", { length: 50 }).default("table"),
  isFavorite: boolean("is_favorite").default(false),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("ai_report_templates_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 51. AI FORECASTING
// =====================================================

export const aiForecastResults = mysqlTable("ai_forecast_results", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  forecastType: varchar("forecast_type", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  parameters: json("parameters"),
  historicalData: json("historical_data"),
  forecastData: json("forecast_data"),
  confidenceInterval: json("confidence_interval"),
  seasonalPatterns: json("seasonal_patterns"),
  reorderPoint: int("reorder_point"),
  periodStart: date("period_start", { mode: "string" }),
  periodEnd: date("period_end", { mode: "string" }),
  accuracyScore: decimal("accuracy_score", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("completed"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ai_forecast_tenant_idx").on(table.tenantId),
  index("ai_forecast_type_idx").on(table.tenantId, table.forecastType),
]);

// =====================================================
// 52. AI CHATBOT SESSIONS
// =====================================================

export const aiChatbotSessions = mysqlTable("ai_chatbot_sessions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  channel: varchar("channel", { length: 50 }).default("portal"),
  language: varchar("language", { length: 10 }).default("en"),
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 320 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  context: json("context"),
  ticketId: bigint("ticket_id", { mode: "number", unsigned: true }),
  rating: int("rating"),
  feedback: text("feedback"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("ai_chatbot_session_tenant_idx").on(table.tenantId),
  index("ai_chatbot_session_sid_idx").on(table.sessionId),
]);

// =====================================================
// 53. AI AUTOMATION RULES
// =====================================================

export const aiAutomationRules = mysqlTable("ai_automation_rules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  ruleType: varchar("rule_type", { length: 50 }).notNull(),
  description: text("description"),
  configuration: json("configuration"),
  aiSuggested: boolean("ai_suggested").default(false),
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  lastRunAt: timestamp("last_run_at"),
  runCount: int("run_count").default(0),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("ai_automation_tenant_idx").on(table.tenantId),
  index("ai_automation_type_idx").on(table.tenantId, table.ruleType),
]);

export const aiAutomationSuggestions = mysqlTable("ai_automation_suggestions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ruleType: varchar("rule_type", { length: 50 }).notNull(),
  sourceEntityType: varchar("source_entity_type", { length: 100 }),
  sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
  suggestedAction: json("suggested_action"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  appliedBy: bigint("applied_by", { mode: "number", unsigned: true }),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ai_automation_sugg_tenant_idx").on(table.tenantId),
  index("ai_automation_sugg_status_idx").on(table.tenantId, table.status),
]);

// =====================================================
// 54. BI DATA WAREHOUSE
// =====================================================

export const biDataWarehouseTables = mysqlTable("bi_data_warehouse_tables", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  tableName: varchar("table_name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  description: text("description"),
  sourceQuery: text("source_query"),
  refreshFrequency: varchar("refresh_frequency", { length: 50 }).default("daily"),
  lastRefreshedAt: timestamp("last_refreshed_at"),
  nextScheduledRefresh: timestamp("next_scheduled_refresh"),
  rowCount: int("row_count").default(0),
  retentionDays: int("retention_days").default(365),
  isActive: boolean("is_active").default(true),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("bi_dw_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 55. BI METRICS
// =====================================================

export const biMetricsDefinitions = mysqlTable("bi_metrics_definitions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  metricKey: varchar("metric_key", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  calculationType: varchar("calculation_type", { length: 50 }).default("sql"),
  calculationSql: text("calculation_sql"),
  sourceTable: varchar("source_table", { length: 100 }),
  dimensions: json("dimensions"),
  comparisonPeriods: json("comparison_periods"),
  isPrecomputed: boolean("is_precomputed").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("bi_metrics_definitions_key_unique").on(table.tenantId, table.metricKey),
  index("bi_metrics_tenant_idx").on(table.tenantId),
  index("bi_metrics_category_idx").on(table.tenantId, table.category),
]);

// =====================================================
// 56. DASHBOARDS
// =====================================================

export const dashboards = mysqlTable("dashboards", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  layout: json("layout"),
  templateKey: varchar("template_key", { length: 100 }),
  isTemplate: boolean("is_template").default(false),
  isDefault: boolean("is_default").default(false),
  isShared: boolean("is_shared").default(false),
  roles: json("roles"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("dashboards_tenant_idx").on(table.tenantId),
  index("dashboards_template_idx").on(table.tenantId, table.templateKey),
]);

export const dashboardWidgets = mysqlTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  dashboardId: bigint("dashboard_id", { mode: "number", unsigned: true }).notNull(),
  widgetType: varchar("widget_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  dataSource: json("data_source"),
  visualConfig: json("visual_config"),
  positionX: int("position_x").default(0),
  positionY: int("position_y").default(0),
  width: int("width").default(4),
  height: int("height").default(3),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("dw_dashboard_idx").on(table.tenantId, table.dashboardId),
]);

// =====================================================
// 57. REPORT TEMPLATES & SCHEDULES
// =====================================================

export const reportTemplates = mysqlTable("report_templates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  module: varchar("module", { length: 100 }),
  columnsConfig: json("columns_config"),
  filtersConfig: json("filters_config"),
  sortConfig: json("sort_config"),
  groupConfig: json("group_config"),
  aggregations: json("aggregations"),
  chartConfig: json("chart_config"),
  isFavorite: boolean("is_favorite").default(false),
  isPublic: boolean("is_public").default(false),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("report_templates_tenant_idx").on(table.tenantId),
  index("report_templates_module_idx").on(table.tenantId, table.module),
]);

export const reportSchedules = mysqlTable("report_schedules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  reportTemplateId: bigint("report_template_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  cronExpression: varchar("cron_expression", { length: 100 }),
  dayOfWeek: int("day_of_week"),
  dayOfMonth: int("day_of_month"),
  timeOfDay: varchar("time_of_day", { length: 10 }).default("08:00"),
  format: varchar("format", { length: 50 }).default("pdf"),
  recipientEmails: json("recipient_emails"),
  lastSentAt: timestamp("last_sent_at"),
  nextRunAt: timestamp("next_run_at"),
  isActive: boolean("is_active").default(true),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("report_schedules_tenant_idx").on(table.tenantId),
  index("report_schedules_next_run_idx").on(table.nextRunAt),
]);

// =====================================================
// 58. WORKFLOWS
// =====================================================

export const workflows = mysqlTable("workflows", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  entityType: varchar("entity_type", { length: 100 }),
  triggerType: varchar("trigger_type", { length: 50 }).notNull(),
  triggerConfig: json("trigger_config"),
  isActive: boolean("is_active").default(true),
  version: int("version").default(1),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("workflows_tenant_idx").on(table.tenantId),
  index("workflows_entity_idx").on(table.tenantId, table.entityType),
  index("workflows_trigger_idx").on(table.tenantId, table.triggerType),
]);

export const workflowSteps = mysqlTable("workflow_steps", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  workflowId: bigint("workflow_id", { mode: "number", unsigned: true }).notNull(),
  stepOrder: int("step_order").notNull(),
  stepType: varchar("step_type", { length: 50 }).notNull(),
  stepConfig: json("step_config"),
  conditions: json("conditions"),
  approvalConfig: json("approval_config"),
  isParallel: boolean("is_parallel").default(false),
  timeoutMinutes: int("timeout_minutes"),
  escalationConfig: json("escalation_config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("workflow_steps_workflow_idx").on(table.tenantId, table.workflowId),
]);

export const workflowApprovals = mysqlTable("workflow_approvals", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  workflowId: bigint("workflow_id", { mode: "number", unsigned: true }).notNull(),
  workflowStepId: bigint("workflow_step_id", { mode: "number", unsigned: true }),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  requestedBy: bigint("requested_by", { mode: "number", unsigned: true }),
  assignedTo: json("assigned_to"),
  status: varchar("status", { length: 50 }).default("pending"),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  priority: int("priority").default(0),
  dueAt: timestamp("due_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("workflow_approvals_tenant_idx").on(table.tenantId),
  index("workflow_approvals_status_idx").on(table.tenantId, table.status),
  index("workflow_approvals_entity_idx").on(table.entityType, table.entityId),
]);

export const workflowLogs = mysqlTable("workflow_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  workflowId: bigint("workflow_id", { mode: "number", unsigned: true }),
  workflowStepId: bigint("workflow_step_id", { mode: "number", unsigned: true }),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  message: text("message"),
  inputData: json("input_data"),
  outputData: json("output_data"),
  executionTimeMs: int("execution_time_ms"),
  triggeredBy: bigint("triggered_by", { mode: "number", unsigned: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("workflow_logs_tenant_idx").on(table.tenantId),
  index("workflow_logs_workflow_idx").on(table.tenantId, table.workflowId),
  index("workflow_logs_entity_idx").on(table.entityType, table.entityId),
  index("workflow_logs_created_idx").on(table.tenantId, table.createdAt),
]);

// =====================================================
// 59. QUALITY CONTROL
// =====================================================

export const qualityInspectionTemplates = mysqlTable("quality_inspection_templates", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  appliesTo: mysqlEnum("applies_to", ["incoming_material", "in_process", "final", "outgoing"]).default("incoming_material").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("qc_templates_tenant_idx").on(table.tenantId),
]);

export const qualityInspectionTemplateLines = mysqlTable("quality_inspection_template_lines", {
  id: serial("id").primaryKey(),
  templateId: bigint("template_id", { mode: "number", unsigned: true }).notNull(),
  checkpointName: varchar("checkpoint_name", { length: 255 }).notNull(),
  checkpointType: mysqlEnum("checkpoint_type", ["visual", "dimensional", "functional", "chemical", "microbiological", "other"]).default("visual").notNull(),
  specificationMin: decimal("specification_min", { precision: 18, scale: 4 }),
  specificationMax: decimal("specification_max", { precision: 18, scale: 4 }),
  specificationText: text("specification_text"),
  isCritical: boolean("is_critical").default(false),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("qc_template_lines_template_idx").on(table.templateId),
]);

export const qualityInspections = mysqlTable("quality_inspections", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  templateId: bigint("template_id", { mode: "number", unsigned: true }).notNull(),
  referenceType: mysqlEnum("reference_type", ["purchase_order", "goods_receipt", "work_order", "production_order", "sales_order", "other"]).notNull(),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  batchNumber: varchar("batch_number", { length: 100 }),
  inspectionDate: date("inspection_date", { mode: "string" }).notNull(),
  inspectedBy: bigint("inspected_by", { mode: "number", unsigned: true }),
  overallResult: mysqlEnum("overall_result", ["pass", "fail", "rework", "pending"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("qc_inspections_tenant_idx").on(table.tenantId),
  index("qc_inspections_ref_idx").on(table.tenantId, table.referenceType, table.referenceId),
  index("qc_inspections_product_idx").on(table.tenantId, table.productId),
]);

export const qualityInspectionLines = mysqlTable("quality_inspection_lines", {
  id: serial("id").primaryKey(),
  inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }).notNull(),
  templateLineId: bigint("template_line_id", { mode: "number", unsigned: true }).notNull(),
  resultValue: varchar("result_value", { length: 255 }),
  resultStatus: mysqlEnum("result_status", ["pass", "fail", "na"]).default("na").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("qc_inspection_lines_inspection_idx").on(table.inspectionId),
]);

export const nonConformanceReports = mysqlTable("non_conformance_reports", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ncrNumber: varchar("ncr_number", { length: 100 }).notNull(),
  inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }),
  referenceType: mysqlEnum("reference_type", ["purchase_order", "goods_receipt", "work_order", "production_order", "sales_order", "other"]).notNull(),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  batchNumber: varchar("batch_number", { length: 100 }),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["minor", "major", "critical"]).default("minor").notNull(),
  status: mysqlEnum("status", ["open", "under_review", "resolved", "closed"]).default("open").notNull(),
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  resolvedBy: bigint("resolved_by", { mode: "number", unsigned: true }),
  resolvedAt: timestamp("resolved_at"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("ncr_tenant_idx").on(table.tenantId),
  index("ncr_status_idx").on(table.tenantId, table.status),
]);

export const correctivePreventiveActions = mysqlTable("corrective_preventive_actions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ncrId: bigint("ncr_id", { mode: "number", unsigned: true }).notNull(),
  actionType: mysqlEnum("action_type", ["corrective", "preventive"]).notNull(),
  description: text("description").notNull(),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  dueDate: date("due_date", { mode: "string" }),
  status: mysqlEnum("status", ["open", "in_progress", "completed", "verified", "cancelled"]).default("open").notNull(),
  verificationNotes: text("verification_notes"),
  verifiedBy: bigint("verified_by", { mode: "number", unsigned: true }),
  verifiedAt: timestamp("verified_at"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("capa_tenant_idx").on(table.tenantId),
  index("capa_ncr_idx").on(table.ncrId),
]);

export const batchQualityRecords = mysqlTable("batch_quality_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }),
  ncrId: bigint("ncr_id", { mode: "number", unsigned: true }),
  result: mysqlEnum("result", ["pass", "fail", "rework", "quarantine"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("batch_quality_tenant_idx").on(table.tenantId),
  index("batch_quality_product_idx").on(table.tenantId, table.productId, table.batchNumber),
]);

export const qualityBlockedStocks = mysqlTable("quality_blocked_stocks", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  reason: mysqlEnum("reason", ["qc_fail", "ncr_open", "capa_pending", "quarantine", "hold"]).notNull(),
  inspectionId: bigint("inspection_id", { mode: "number", unsigned: true }),
  ncrId: bigint("ncr_id", { mode: "number", unsigned: true }),
  isReleased: boolean("is_released").default(false),
  releasedBy: bigint("released_by", { mode: "number", unsigned: true }),
  releasedAt: timestamp("released_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("qc_blocked_tenant_idx").on(table.tenantId),
  index("qc_blocked_product_idx").on(table.tenantId, table.productId, table.warehouseId),
]);

// =====================================================
// 60. ZATCA OFFLINE QUEUE
// =====================================================

export const zatcaOfflineQueue = mysqlTable("zatca_offline_queue", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  action: mysqlEnum("action", ["clearance", "reporting"]).notNull(),
  uuid: varchar("uuid", { length: 255 }).notNull(),
  xmlPayload: text("xml_payload").notNull(),
  signedXml: text("signed_xml"),
  invoiceHash: varchar("invoice_hash", { length: 255 }),
  previousInvoiceHash: varchar("previous_invoice_hash", { length: 255 }),
  status: mysqlEnum("status", ["pending", "submitted", "cleared", "rejected", "retrying"]).default("pending").notNull(),
  retryCount: int("retry_count").default(0),
  lastError: text("last_error"),
  zatcaResponse: text("zatca_response"),
  submittedAt: timestamp("submitted_at"),
  clearedAt: timestamp("cleared_at"),
  nextRetryAt: timestamp("next_retry_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("zatca_queue_tenant_idx").on(table.tenantId),
  index("zatca_queue_status_idx").on(table.tenantId, table.status),
  index("zatca_queue_invoice_idx").on(table.tenantId, table.invoiceId),
]);

// =====================================================
// 61. CONSTRUCTION ENHANCEMENTS
// =====================================================

export const wbsItems = mysqlTable("wbs_items", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  level: int("level").notNull(),
  description: text("description"),
  plannedStartDate: date("planned_start_date", { mode: "string" }),
  plannedEndDate: date("planned_end_date", { mode: "string" }),
  actualStartDate: date("actual_start_date", { mode: "string" }),
  actualEndDate: date("actual_end_date", { mode: "string" }),
  plannedCost: decimal("planned_cost", { precision: 18, scale: 4 }),
  actualCost: decimal("actual_cost", { precision: 18, scale: 4 }),
  progressPercent: int("progress_percent").default(0),
  weightPercent: decimal("weight_percent", { precision: 5, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["planned", "in_progress", "completed", "delayed", "cancelled"]).default("planned").notNull(),
  responsiblePersonId: bigint("responsible_person_id", { mode: "number", unsigned: true }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("wbs_items_tenant_idx").on(table.tenantId),
  index("wbs_items_project_idx").on(table.tenantId, table.projectId),
  index("wbs_items_parent_idx").on(table.tenantId, table.parentId),
]);

export const boqItems = mysqlTable("boq_items", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  wbsId: bigint("wbs_id", { mode: "number", unsigned: true }),
  itemCode: varchar("item_code", { length: 50 }).notNull(),
  description: text("description").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  unitRate: decimal("unit_rate", { precision: 18, scale: 4 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).notNull(),
  wastagePercent: decimal("wastage_percent", { precision: 5, scale: 2 }).default("0"),
  materialCost: decimal("material_cost", { precision: 18, scale: 4 }),
  laborCost: decimal("labor_cost", { precision: 18, scale: 4 }),
  equipmentCost: decimal("equipment_cost", { precision: 18, scale: 4 }),
  directCost: decimal("direct_cost", { precision: 18, scale: 4 }),
  indirectCost: decimal("indirect_cost", { precision: 18, scale: 4 }),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("15"),
  status: mysqlEnum("status", ["estimated", "approved", "revised", "completed"]).default("estimated").notNull(),
  section: varchar("section", { length: 100 }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("boq_items_tenant_idx").on(table.tenantId),
  index("boq_items_project_idx").on(table.tenantId, table.projectId),
  index("boq_items_wbs_idx").on(table.tenantId, table.wbsId),
]);

export const constructionContracts = mysqlTable("construction_contracts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  contractNumber: varchar("contract_number", { length: 100 }).notNull(),
  contractType: mysqlEnum("contract_type", ["lump_sum", "cost_plus", "unit_price", "design_build", "turnkey"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  clientId: bigint("client_id", { mode: "number", unsigned: true }),
  contractorId: bigint("contractor_id", { mode: "number", unsigned: true }),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  contractDate: date("contract_date", { mode: "string" }),
  contractValue: decimal("contract_value", { precision: 18, scale: 4 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR"),
  paymentTerms: text("payment_terms"),
  liquidatedDamagesPercent: decimal("liquidated_damages_percent", { precision: 5, scale: 2 }).default("0"),
  warrantyPeriodMonths: int("warranty_period_months").default(12),
  retentionPercent: decimal("retention_percent", { precision: 5, scale: 2 }).default("10"),
  advancePaymentPercent: decimal("advance_payment_percent", { precision: 5, scale: 2 }).default("0"),
  advancePaymentAmount: decimal("advance_payment_amount", { precision: 18, scale: 4 }).default("0"),
  insuranceRequired: boolean("insurance_required").default(true),
  insuranceAmount: decimal("insurance_amount", { precision: 18, scale: 4 }),
  performanceBondPercent: decimal("performance_bond_percent", { precision: 5, scale: 2 }).default("5"),
  performanceBondAmount: decimal("performance_bond_amount", { precision: 18, scale: 4 }),
  status: mysqlEnum("status", ["draft", "signed", "active", "amended", "completed", "terminated"]).default("draft").notNull(),
  signedByClient: boolean("signed_by_client"),
  signedByContractor: boolean("signed_by_contractor"),
  signedAt: timestamp("signed_at"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("construction_contracts_tenant_idx").on(table.tenantId),
  index("construction_contracts_project_idx").on(table.tenantId, table.projectId),
]);

export const variationOrders = mysqlTable("variation_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  voNumber: varchar("vo_number", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  reason: mysqlEnum("reason", ["change_in_scope", "design_change", "omission", "additional_work", "regulatory", "other"]).notNull(),
  changeType: mysqlEnum("change_type", ["addition", "deduction", "omission"]).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "implemented"]).default("draft").notNull(),
  originalValue: decimal("original_value", { precision: 18, scale: 4 }).default("0").notNull(),
  changeValue: decimal("change_value", { precision: 18, scale: 4 }).default("0").notNull(),
  revisedValue: decimal("revised_value", { precision: 18, scale: 4 }).default("0").notNull(),
  impactOnTime: int("impact_on_time"),
  impactOnCost: decimal("impact_on_cost", { precision: 18, scale: 4 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedDate: date("approved_date", { mode: "string" }),
  submittedBy: bigint("submitted_by", { mode: "number", unsigned: true }),
  approvedByUserId: bigint("approved_by_user_id", { mode: "number", unsigned: true }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("variation_orders_tenant_idx").on(table.tenantId),
  index("variation_orders_project_idx").on(table.tenantId, table.projectId),
  index("variation_orders_contract_idx").on(table.tenantId, table.contractId),
]);

export const advancePayments = mysqlTable("advance_payments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentType: mysqlEnum("payment_type", ["advance", "mobilization", "progress", "retention_release"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 4 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0"),
  requestDate: date("request_date", { mode: "string" }),
  paidDate: date("paid_date", { mode: "string" }),
  recoveryMethod: mysqlEnum("recovery_method", ["deduction_from_bills", "direct_payment"]),
  recoveryPercent: decimal("recovery_percent", { precision: 5, scale: 2 }),
  recoveryInstallments: int("recovery_installments"),
  installmentAmount: decimal("installment_amount", { precision: 18, scale: 4 }),
  remainingAmount: decimal("remaining_amount", { precision: 18, scale: 4 }),
  status: mysqlEnum("status", ["requested", "approved", "paid", "fully_recovered", "cancelled"]).default("requested").notNull(),
  bankGuaranteeNumber: varchar("bank_guarantee_number", { length: 100 }),
  bankName: varchar("bank_name", { length: 255 }),
  guaranteeExpiryDate: date("guarantee_expiry_date", { mode: "string" }),
  guaranteeAmount: decimal("guarantee_amount", { precision: 18, scale: 4 }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("advance_payments_tenant_idx").on(table.tenantId),
  index("advance_payments_project_idx").on(table.tenantId, table.projectId),
]);

export const cvrReports = mysqlTable("cvr_reports", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  reportNumber: varchar("report_number", { length: 50 }).notNull(),
  periodStart: date("period_start", { mode: "string" }),
  periodEnd: date("period_end", { mode: "string" }),
  approvedVariations: decimal("approved_variations", { precision: 18, scale: 4 }).default("0"),
  pendingVariations: decimal("pending_variations", { precision: 18, scale: 4 }).default("0"),
  originalContractValue: decimal("original_contract_value", { precision: 18, scale: 4 }),
  revisedContractValue: decimal("revised_contract_value", { precision: 18, scale: 4 }),
  workCompletedValue: decimal("work_completed_value", { precision: 18, scale: 4 }),
  workRemainingValue: decimal("work_remaining_value", { precision: 18, scale: 4 }),
  certifiedAmount: decimal("certified_amount", { precision: 18, scale: 4 }),
  amountsRetention: decimal("amounts_retention", { precision: 18, scale: 4 }),
  amountsPaid: decimal("amounts_paid", { precision: 18, scale: 4 }),
  amountsOutstanding: decimal("amounts_outstanding", { precision: 18, scale: 4 }),
  totalCostToDate: decimal("total_cost_to_date", { precision: 18, scale: 4 }),
  estimatedFinalCost: decimal("estimated_final_cost", { precision: 18, scale: 4 }),
  forecastProfitLoss: decimal("forecast_profit_loss", { precision: 18, scale: 4 }),
  status: mysqlEnum("status", ["draft", "reviewed", "approved"]).default("draft").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("cvr_reports_tenant_idx").on(table.tenantId),
  index("cvr_reports_project_idx").on(table.tenantId, table.projectId),
]);

export const decennialLiability = mysqlTable("decennial_liability", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
  liabilityPeriodYears: int("liability_period_years").default(10),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  insurancePolicyNumber: varchar("insurance_policy_number", { length: 100 }),
  insuranceProvider: varchar("insurance_provider", { length: 255 }),
  insuranceAmount: decimal("insurance_amount", { precision: 18, scale: 4 }),
  coverageDetails: text("coverage_details"),
  decennialCertificate: varchar("decennial_certificate", { length: 255 }),
  status: mysqlEnum("status", ["active", "expired", "claimed"]).default("active").notNull(),
  lastInspectionDate: date("last_inspection_date", { mode: "string" }),
  nextInspectionDate: date("next_inspection_date", { mode: "string" }),
  claimsRaised: int("claims_raised").default(0),
  claimsAmount: decimal("claims_amount", { precision: 18, scale: 4 }).default("0"),
  resolvedClaimsAmount: decimal("resolved_claims_amount", { precision: 18, scale: 4 }).default("0"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("decennial_liability_tenant_idx").on(table.tenantId),
  index("decennial_liability_project_idx").on(table.tenantId, table.projectId),
]);

export const siteDailyReports = mysqlTable("site_daily_reports", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  reportDate: date("report_date", { mode: "string" }).notNull(),
  reportNumber: varchar("report_number", { length: 50 }).notNull(),
  weatherCondition: varchar("weather_condition", { length: 100 }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  workDescription: text("work_description"),
  laborCount: int("labor_count"),
  supervisorName: varchar("supervisor_name", { length: 255 }),
  equipmentUsed: text("equipment_used"),
  materialsReceived: text("materials_received"),
  materialsUsed: text("materials_used"),
  workCompleted: text("work_completed"),
  workInProgress: text("work_in_progress"),
  issuesEncountered: text("issues_encountered"),
  safetyIncidents: text("safety_incidents"),
  visitors: text("visitors"),
  photos: json("photos"),
  status: mysqlEnum("status", ["draft", "submitted", "approved"]).default("draft").notNull(),
  submittedBy: bigint("submitted_by", { mode: "number", unsigned: true }),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("site_daily_reports_tenant_idx").on(table.tenantId),
  index("site_daily_reports_project_idx").on(table.tenantId, table.projectId),
  index("site_daily_reports_date_idx").on(table.tenantId, table.reportDate),
]);

export const subcontractorPayments = mysqlTable("subcontractor_payments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  subcontractorId: bigint("subcontractor_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentDate: date("payment_date", { mode: "string" }),
  invoiceReference: varchar("invoice_reference", { length: 100 }),
  grossAmount: decimal("gross_amount", { precision: 18, scale: 4 }).notNull(),
  retentionDeducted: decimal("retention_deducted", { precision: 18, scale: 4 }),
  advanceRecovery: decimal("advance_recovery", { precision: 18, scale: 4 }),
  penalties: decimal("penalties", { precision: 18, scale: 4 }).default("0"),
  otherDeductions: decimal("other_deductions", { precision: 18, scale: 4 }).default("0"),
  netAmount: decimal("net_amount", { precision: 18, scale: 4 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 4 }).default("0"),
  paymentMethod: mysqlEnum("payment_method", ["bank_transfer", "cheque", "cash"]),
  bankReference: varchar("bank_reference", { length: 100 }),
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("subcontractor_payments_tenant_idx").on(table.tenantId),
  index("subcontractor_payments_sub_idx").on(table.tenantId, table.subcontractorId),
  index("subcontractor_payments_project_idx").on(table.tenantId, table.projectId),
]);

export const sbcCompliance = mysqlTable("sbc_compliance", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  sbcCode: varchar("sbc_code", { length: 50 }).notNull(),
  description: text("description"),
  complianceRequired: boolean("compliance_required").default(true),
  complianceStatus: mysqlEnum("compliance_status", ["compliant", "non_compliant", "not_applicable", "pending_review"]).default("pending_review").notNull(),
  inspectorName: varchar("inspector_name", { length: 255 }),
  inspectionDate: date("inspection_date", { mode: "string" }),
  certificateNumber: varchar("certificate_number", { length: 100 }),
  certificateExpiryDate: date("certificate_expiry_date", { mode: "string" }),
  nonComplianceNotes: text("non_compliance_notes"),
  correctiveActions: text("corrective_actions"),
  correctiveActionDate: date("corrective_action_date", { mode: "string" }),
  status: mysqlEnum("status", ["active", "expired"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("sbc_compliance_tenant_idx").on(table.tenantId),
  index("sbc_compliance_project_idx").on(table.tenantId, table.projectId),
]);

export const scaClassification = mysqlTable("sca_classification", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  entityName: varchar("entity_name", { length: 255 }).notNull(),
  entityType: mysqlEnum("entity_type", ["contractor", "consultant", "supplier"]).notNull(),
  scaRegistrationNumber: varchar("sca_registration_number", { length: 100 }),
  classificationGrade: mysqlEnum("classification_grade", ["first", "second", "third", "fourth", "fifth"]),
  specialization: varchar("specialization", { length: 255 }),
  maxProjectValue: decimal("max_project_value", { precision: 18, scale: 4 }),
  expiryDate: date("expiry_date", { mode: "string" }),
  status: mysqlEnum("status", ["active", "suspended", "expired"]).default("active").notNull(),
  verificationStatus: mysqlEnum("verification_status", ["unverified", "verified", "rejected"]).default("unverified").notNull(),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("sca_classification_tenant_idx").on(table.tenantId),
]);

export const gtplCompliance = mysqlTable("gtpl_compliance", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  tenderReference: varchar("tender_reference", { length: 100 }),
  etimadReference: varchar("etimad_reference", { length: 100 }),
  governmentEntity: varchar("government_entity", { length: 255 }),
  listedOnEtimad: boolean("listed_on_etimad").default(false),
  saudizationRequired: boolean("saudization_required").default(true),
  saudizationPercent: decimal("saudization_percent", { precision: 5, scale: 2 }),
  localContentPercent: decimal("local_content_percent", { precision: 5, scale: 2 }),
  icvScore: decimal("icv_score", { precision: 5, scale: 2 }),
  complianceStatus: mysqlEnum("compliance_status", ["compliant", "non_compliant", "in_progress", "not_required"]).default("in_progress").notNull(),
  lastReviewedDate: date("last_reviewed_date", { mode: "string" }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("gtpl_compliance_tenant_idx").on(table.tenantId),
  index("gtpl_compliance_project_idx").on(table.tenantId, table.projectId),
]);

export const hseCommittees = mysqlTable("hse_committees", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  committeeName: varchar("committee_name", { length: 255 }).notNull(),
  formationDate: date("formation_date", { mode: "string" }),
  expiryDate: date("expiry_date", { mode: "string" }),
  members: json("members"),
  chairperson: varchar("chairperson", { length: 255 }),
  meetingFrequency: varchar("meeting_frequency", { length: 100 }),
  lastMeetingDate: date("last_meeting_date", { mode: "string" }),
  nextMeetingDate: date("next_meeting_date", { mode: "string" }),
  status: mysqlEnum("status", ["active", "dissolved"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("hse_committees_tenant_idx").on(table.tenantId),
  index("hse_committees_project_idx").on(table.tenantId, table.projectId),
]);

export const heatStressRecords = mysqlTable("heat_stress_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  heatIndex: decimal("heat_index", { precision: 5, scale: 2 }),
  workRestRegime: varchar("work_rest_regime", { length: 100 }),
  breaksProvided: boolean("breaks_provided"),
  waterAvailable: boolean("water_available"),
  shadeAvailable: boolean("shade_available"),
  incidentsReported: int("incidents_reported").default(0),
  supervisorName: varchar("supervisor_name", { length: 255 }),
  status: mysqlEnum("status", ["compliant", "non_compliant", "partial"]).default("compliant").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("heat_stress_records_tenant_idx").on(table.tenantId),
  index("heat_stress_records_project_idx").on(table.tenantId, table.projectId),
  index("heat_stress_records_date_idx").on(table.tenantId, table.date),
]);

export const engineeringSaudization = mysqlTable("engineering_saudization", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  saudiEngineerCount: int("saudi_engineer_count"),
  totalEngineerCount: int("total_engineer_count"),
  saudiRatio: decimal("saudi_ratio", { precision: 5, scale: 2 }),
  requiredRatio: decimal("required_ratio", { precision: 5, scale: 2 }).default("0.25"),
  saudiSupervisorName: varchar("saudi_supervisor_name", { length: 255 }),
  saudiSupervisorId: bigint("saudi_supervisor_id", { mode: "number", unsigned: true }),
  licenseNumber: varchar("license_number", { length: 100 }),
  licenseExpiryDate: date("license_expiry_date", { mode: "string" }),
  shrhStatus: mysqlEnum("shrh_status", ["compliant", "non_compliant", "pending"]).default("pending").notNull(),
  lastAuditDate: date("last_audit_date", { mode: "string" }),
  nextAuditDate: date("next_audit_date", { mode: "string" }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("engineering_saudization_tenant_idx").on(table.tenantId),
  index("engineering_saudization_project_idx").on(table.tenantId, table.projectId),
]);

export const safetyTraining = mysqlTable("safety_training", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  trainingName: varchar("training_name", { length: 255 }).notNull(),
  trainingProvider: varchar("training_provider", { length: 255 }),
  trainingDate: date("training_date", { mode: "string" }),
  expiryDate: date("expiry_date", { mode: "string" }),
  certificateNumber: varchar("certificate_number", { length: 100 }),
  certificateFile: varchar("certificate_file", { length: 255 }),
  trainingType: mysqlEnum("training_type", ["induction", "specialized", "refresher", "emergency"]),
  status: mysqlEnum("status", ["completed", "expired", "pending"]).default("pending").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("safety_training_tenant_idx").on(table.tenantId),
  index("safety_training_project_idx").on(table.tenantId, table.projectId),
]);

export const ppeIssuance = mysqlTable("ppe_issuance", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  ppeType: mysqlEnum("ppe_type", ["helmet", "vest", "gloves", "goggles", "harness", "earplug", "mask", "boots", "full_body"]).notNull(),
  quantity: int("quantity"),
  issueDate: date("issue_date", { mode: "string" }),
  expiryDate: date("expiry_date", { mode: "string" }),
  issuedBy: varchar("issued_by", { length: 255 }),
  condition_: varchar("condition_", { length: 100 }),
  returned: boolean("returned").default(false),
  returnDate: date("return_date", { mode: "string" }),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("ppe_issuance_tenant_idx").on(table.tenantId),
  index("ppe_issuance_project_idx").on(table.tenantId, table.projectId),
]);

export const equipmentSchedule = mysqlTable("equipment_schedule", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  equipmentId: bigint("equipment_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  operatorName: varchar("operator_name", { length: 255 }),
  purpose: text("purpose"),
  status: mysqlEnum("status", ["scheduled", "in_use", "completed", "cancelled"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("equipment_schedule_tenant_idx").on(table.tenantId),
  index("equipment_schedule_equipment_idx").on(table.tenantId, table.equipmentId),
  index("equipment_schedule_project_idx").on(table.tenantId, table.projectId),
]);

export const materialRequirements = mysqlTable("material_requirements", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  wbsId: bigint("wbs_id", { mode: "number", unsigned: true }),
  boqItemId: bigint("boq_item_id", { mode: "number", unsigned: true }),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  materialName: varchar("material_name", { length: 255 }).notNull(),
  specification: text("specification"),
  requiredQuantity: decimal("required_quantity", { precision: 18, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  quantityOrdered: decimal("quantity_ordered", { precision: 18, scale: 4 }).default("0"),
  quantityReceived: decimal("quantity_received", { precision: 18, scale: 4 }).default("0"),
  quantityConsumed: decimal("quantity_consumed", { precision: 18, scale: 4 }).default("0"),
  requiredDate: date("required_date", { mode: "string" }),
  deliveryDate: date("delivery_date", { mode: "string" }),
  status: mysqlEnum("status", ["planned", "ordered", "partial", "received", "consumed"]).default("planned").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("material_requirements_tenant_idx").on(table.tenantId),
  index("material_requirements_project_idx").on(table.tenantId, table.projectId),
]);

// =====================================================
// 62. SYNC ENGINE TABLES (ENHANCED)
// =====================================================

export const syncStats = mysqlTable("sync_stats", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  deviceId: varchar("device_id", { length: 100 }),
  totalPushes: int("total_pushes").default(0).notNull(),
  totalPulls: int("total_pulls").default(0).notNull(),
  successfulPushes: int("successful_pushes").default(0).notNull(),
  failedPushes: int("failed_pushes").default(0).notNull(),
  successfulPulls: int("successful_pulls").default(0).notNull(),
  failedPulls: int("failed_pulls").default(0).notNull(),
  conflictsResolved: int("conflicts_resolved").default(0).notNull(),
  avgSyncDurationMs: int("avg_sync_duration_ms").default(0).notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("sync_stats_tenant_idx").on(table.tenantId),
]);

export const syncQueue = mysqlTable("sync_queue", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  deviceId: varchar("device_id", { length: 100 }),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  payload: json("payload"),
  version: int("version").default(1),
  localUuid: varchar("local_uuid", { length: 255 }),
  status: mysqlEnum("status", ["pending", "synced", "failed", "conflict"]).default("pending").notNull(),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  syncedAt: timestamp("synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sync_queue_tenant_idx").on(table.tenantId),
  index("sync_queue_status_idx").on(table.status),
]);

export const conflictResolutions = mysqlTable("conflict_resolutions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  deviceId: varchar("device_id", { length: 100 }),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  localVersion: int("local_version").default(0),
  serverVersion: int("server_version").default(0),
  localPayload: json("local_payload"),
  serverPayload: json("server_payload"),
  resolution: mysqlEnum("resolution", ["local_wins", "server_wins", "manual", "merged"]).default("server_wins").notNull(),
  resolvedBy: bigint("resolved_by", { mode: "number", unsigned: true }),
  resolvedAt: timestamp("resolved_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("conflict_resolutions_tenant_idx").on(table.tenantId),
]);

export const offlineOperations = mysqlTable("offline_operations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  deviceId: varchar("device_id", { length: 100 }),
  operationType: varchar("operation_type", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  payload: json("payload"),
  status: mysqlEnum("status", ["pending", "synced", "failed"]).default("pending").notNull(),
  localCreatedAt: timestamp("local_created_at"),
  syncedAt: timestamp("synced_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("offline_operations_tenant_idx").on(table.tenantId),
  index("offline_operations_status_idx").on(table.status),
]);

// =====================================================
// 64. MRP II
// =====================================================

export const masterProductionSchedules = mysqlTable("master_production_schedules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  scheduleDate: date("schedule_date", { mode: "string" }).notNull(),
  plannedQuantity: decimal("planned_quantity", { precision: 18, scale: 4 }).notNull(),
  confirmedQuantity: decimal("confirmed_quantity", { precision: 18, scale: 4 }).default("0").notNull(),
  availableToPromise: decimal("available_to_promise", { precision: 18, scale: 4 }).default("0").notNull(),
  demandSource: mysqlEnum("demand_source", ["forecast", "sales_order", "safety_stock", "manual"]).notNull(),
  status: mysqlEnum("status", ["planned", "firmed", "closed"]).default("planned").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("mps_tenant_idx").on(table.tenantId),
]);

export const capacityResources = mysqlTable("capacity_resources", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  resourceCode: varchar("resource_code", { length: 50 }).notNull(),
  resourceName: varchar("resource_name", { length: 255 }).notNull(),
  resourceType: mysqlEnum("resource_type", ["machine", "labor", "workstation", "work_center"]).notNull(),
  departmentId: bigint("department_id", { mode: "number", unsigned: true }),
  availableHours: decimal("available_hours", { precision: 10, scale: 2 }).default("0").notNull(),
  efficiencyPercent: decimal("efficiency_percent", { precision: 5, scale: 2 }).default("100").notNull(),
  utilizationPercent: decimal("utilization_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  calendarId: bigint("calendar_id", { mode: "number", unsigned: true }),
  costPerHour: decimal("cost_per_hour", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("cr_tenant_idx").on(table.tenantId),
]);

export const roughCutCapacityPlans = mysqlTable("rough_cut_capacity_plans", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  resourceId: bigint("resource_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  availableCapacity: decimal("available_capacity", { precision: 18, scale: 4 }).default("0").notNull(),
  requiredCapacity: decimal("required_capacity", { precision: 18, scale: 4 }).default("0").notNull(),
  overloadPercent: decimal("overload_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["draft", "confirmed", "adjusted"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("rccp_tenant_idx").on(table.tenantId),
]);

export const mrpDemands = mysqlTable("mrp_demands", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  demandType: mysqlEnum("demand_type", ["independent", "dependent"]).notNull(),
  sourceType: mysqlEnum("source_type", ["forecast", "sales_order", "service", "mps"]).notNull(),
  sourceId: varchar("source_id", { length: 100 }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["open", "partially_fulfilled", "fulfilled", "cancelled"]).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mrp_demands_tenant_idx").on(table.tenantId),
]);

export const mrpRuns = mysqlTable("mrp_runs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  runDate: timestamp("run_date").defaultNow().notNull(),
  horizonStart: date("horizon_start", { mode: "string" }).notNull(),
  horizonEnd: date("horizon_end", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  actionMessages: text("action_messages"),
  executionTimeMs: int("execution_time_ms"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mrp_runs_tenant_idx").on(table.tenantId),
]);

export const mrpPlannedOrders = mysqlTable("mrp_planned_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  orderType: mysqlEnum("order_type", ["purchase", "manufacture", "transfer"]).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  releaseDate: date("release_date", { mode: "string" }),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  status: mysqlEnum("status", ["planned", "released", "completed", "cancelled"]).default("planned").notNull(),
  parentPlanId: bigint("parent_plan_id", { mode: "number", unsigned: true }),
  mrpRunId: bigint("mrp_run_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mrp_po_tenant_idx").on(table.tenantId),
]);

export const mrpNetRequirements = mysqlTable("mrp_net_requirements", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  grossRequirement: decimal("gross_requirement", { precision: 18, scale: 4 }).default("0").notNull(),
  scheduledReceipts: decimal("scheduled_receipts", { precision: 18, scale: 4 }).default("0").notNull(),
  projectedOnHand: decimal("projected_on_hand", { precision: 18, scale: 4 }).default("0").notNull(),
  netRequirement: decimal("net_requirement", { precision: 18, scale: 4 }).default("0").notNull(),
  plannedOrderReceipt: decimal("planned_order_receipt", { precision: 18, scale: 4 }).default("0").notNull(),
  plannedOrderRelease: decimal("planned_order_release", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mrp_nr_tenant_idx").on(table.tenantId),
]);

export const peggingRecords = mysqlTable("pegging_records", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  demandId: bigint("demand_id", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  mrpRunId: bigint("mrp_run_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pegging_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 65. WMS
// =====================================================

export const warehouseZones = mysqlTable("warehouse_zones", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  zoneCode: varchar("zone_code", { length: 50 }).notNull(),
  zoneName: varchar("zone_name", { length: 255 }).notNull(),
  zoneType: mysqlEnum("zone_type", ["storage", "picking", "putaway", "shipping", "receiving", "quarantine"]).notNull(),
  capacity: decimal("capacity", { precision: 18, scale: 4 }).default("0").notNull(),
  usedCapacity: decimal("used_capacity", { precision: 18, scale: 4 }).default("0").notNull(),
  colorCode: varchar("color_code", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("wz_tenant_idx").on(table.tenantId),
]);

export const storageLocations = mysqlTable("storage_locations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  zoneId: bigint("zone_id", { mode: "number", unsigned: true }),
  locationCode: varchar("location_code", { length: 50 }).notNull(),
  locationType: mysqlEnum("location_type", ["rack", "floor", "bulk", "shelf", "bin", "drawer"]).notNull(),
  aisle: varchar("aisle", { length: 50 }),
  rack: varchar("rack", { length: 50 }),
  shelf: varchar("shelf", { length: 50 }),
  bin: varchar("bin", { length: 50 }),
  capacity: decimal("capacity", { precision: 18, scale: 4 }).default("0").notNull(),
  usedCapacity: decimal("used_capacity", { precision: 18, scale: 4 }).default("0").notNull(),
  weightCapacity: decimal("weight_capacity", { precision: 10, scale: 2 }),
  heightCm: decimal("height_cm", { precision: 10, scale: 2 }),
  lengthCm: decimal("length_cm", { precision: 10, scale: 2 }),
  widthCm: decimal("width_cm", { precision: 10, scale: 2 }),
  isReserved: boolean("is_reserved").default(false),
  isBlocked: boolean("is_blocked").default(false),
  status: mysqlEnum("status", ["available", "occupied", "blocked", "reserved"]).default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("sl_tenant_idx").on(table.tenantId),
]);

export const storageBins = mysqlTable("storage_bins", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  locationId: bigint("location_id", { mode: "number", unsigned: true }).notNull(),
  binCode: varchar("bin_code", { length: 50 }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).default("0").notNull(),
  lotNumber: varchar("lot_number", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  expiryDate: date("expiry_date", { mode: "string" }),
  putawayDate: date("putaway_date", { mode: "string" }),
  status: mysqlEnum("status", ["available", "allocated", "picked", "blocked"]).default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sb_tenant_idx").on(table.tenantId),
]);

export const putawayRules = mysqlTable("putaway_rules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  priority: int("priority").default(0).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  productCategoryId: bigint("product_category_id", { mode: "number", unsigned: true }),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  zoneId: bigint("zone_id", { mode: "number", unsigned: true }),
  strategy: mysqlEnum("strategy", ["fixed", "first_empty", "near_expiry", "fifo", "random", "last_location"]).notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pr_tenant_idx").on(table.tenantId),
]);

export const putawayTasks = mysqlTable("putaway_tasks", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  taskNumber: varchar("task_number", { length: 50 }).notNull(),
  sourceType: mysqlEnum("source_type", ["purchase", "return", "transfer_in", "manufacturing"]).notNull(),
  sourceId: bigint("source_id", { mode: "number", unsigned: true }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  fromLocationId: bigint("from_location_id", { mode: "number", unsigned: true }),
  toLocationId: bigint("to_location_id", { mode: "number", unsigned: true }),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("pt_tenant_idx").on(table.tenantId),
]);

export const pickingRules = mysqlTable("picking_rules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  priority: int("priority").default(0).notNull(),
  strategy: mysqlEnum("strategy", ["fifo", "fefo", "lifo", "zone", "batch", "wave"]).notNull(),
  waveSize: int("wave_size"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pkr_tenant_idx").on(table.tenantId),
]);

export const pickingTasks = mysqlTable("picking_tasks", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  taskNumber: varchar("task_number", { length: 50 }).notNull(),
  sourceType: mysqlEnum("source_type", ["sales_order", "transfer_out", "manufacturing_issue"]).notNull(),
  sourceId: bigint("source_id", { mode: "number", unsigned: true }),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  fromLocationId: bigint("from_location_id", { mode: "number", unsigned: true }),
  toLocationId: bigint("to_location_id", { mode: "number", unsigned: true }),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("pkt_tenant_idx").on(table.tenantId),
]);

export const wavePicking = mysqlTable("wave_picking", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  waveNumber: varchar("wave_number", { length: 50 }).notNull(),
  waveType: mysqlEnum("wave_type", ["single_order", "multi_order", "zone"]).notNull(),
  orderIds: json("order_ids"),
  totalItems: int("total_items").default(0),
  status: mysqlEnum("status", ["created", "released", "picking", "completed"]).default("created").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("wp_tenant_idx").on(table.tenantId),
]);

export const cycleCountSchedules = mysqlTable("cycle_count_schedules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  zoneId: bigint("zone_id", { mode: "number", unsigned: true }),
  countDate: date("count_date", { mode: "string" }).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly", "annually"]).notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ccs_tenant_idx").on(table.tenantId),
]);

export const cycleCountEntries = mysqlTable("cycle_count_entries", {
  id: serial("id").primaryKey(),
  scheduleId: bigint("schedule_id", { mode: "number", unsigned: true }).notNull(),
  locationId: bigint("location_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  expectedQuantity: decimal("expected_quantity", { precision: 18, scale: 4 }).default("0").notNull(),
  actualQuantity: decimal("actual_quantity", { precision: 18, scale: 4 }).default("0").notNull(),
  variance: decimal("variance", { precision: 18, scale: 4 }).default("0").notNull(),
  varianceReason: mysqlEnum("variance_reason", ["mispick", "putaway_error", "damage", "theft", "system_error", "other"]),
  countedBy: bigint("counted_by", { mode: "number", unsigned: true }),
  countDate: timestamp("count_date").defaultNow().notNull(),
  status: mysqlEnum("status", ["open", "verified", "adjusted"]).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("cce_schedule_idx").on(table.scheduleId),
]);

export const inventoryAdjustmentReasons = mysqlTable("inventory_adjustment_reasons", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  reasonCode: varchar("reason_code", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["damage", "loss", "theft", "breakage", "expiry", "count_error", "return", "quality"]).notNull(),
  requiresApproval: boolean("requires_approval").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("iar_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 66. SCM
// =====================================================

export const supplierEvaluations = mysqlTable("supplier_evaluations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  evaluationDate: date("evaluation_date", { mode: "string" }).notNull(),
  evaluatorId: bigint("evaluator_id", { mode: "number", unsigned: true }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).default("0").notNull(),
  deliveryScore: decimal("delivery_score", { precision: 5, scale: 2 }).default("0").notNull(),
  priceScore: decimal("price_score", { precision: 5, scale: 2 }).default("0").notNull(),
  serviceScore: decimal("service_score", { precision: 5, scale: 2 }).default("0").notNull(),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }).default("0").notNull(),
  category: mysqlEnum("category", ["excellent", "good", "average", "poor"]).default("average").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("se_tenant_idx").on(table.tenantId),
]);

export const supplierContracts = mysqlTable("supplier_contracts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  contractNumber: varchar("contract_number", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }),
  terms: text("terms"),
  value: decimal("value", { precision: 18, scale: 4 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["draft", "active", "expired", "terminated", "renewed"]).default("draft").notNull(),
  renewalReminderDays: int("renewal_reminder_days").default(30),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("sc_tenant_idx").on(table.tenantId),
]);

export const rfqHeaders = mysqlTable("rfq_headers", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  rfqNumber: varchar("rfq_number", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  deadlineDate: date("deadline_date", { mode: "string" }).notNull(),
  expectedDeliveryDate: date("expected_delivery_date", { mode: "string" }),
  buyerId: bigint("buyer_id", { mode: "number", unsigned: true }),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "received", "evaluated", "closed", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("rfq_tenant_idx").on(table.tenantId),
]);

export const rfqItems = mysqlTable("rfq_items", {
  id: serial("id").primaryKey(),
  rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  targetPrice: decimal("target_price", { precision: 18, scale: 4 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rfqSupplierQuotes = mysqlTable("rfq_supplier_quotes", {
  id: serial("id").primaryKey(),
  rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  submittedDate: timestamp("submitted_date").defaultNow().notNull(),
  validUntil: date("valid_until", { mode: "string" }),
  deliveryDate: date("delivery_date", { mode: "string" }),
  paymentTerms: varchar("payment_terms", { length: 255 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["draft", "submitted", "withdrawn"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rfqQuoteLines = mysqlTable("rfq_quote_lines", {
  id: serial("id").primaryKey(),
  quoteId: bigint("quote_id", { mode: "number", unsigned: true }).notNull(),
  rfqItemId: bigint("rfq_item_id", { mode: "number", unsigned: true }).notNull(),
  unitPrice: decimal("unit_price", { precision: 18, scale: 4 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
  totalPrice: decimal("total_price", { precision: 18, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  deliveryDate: date("delivery_date", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bidComparisons = mysqlTable("bid_comparisons", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
  comparisonDate: date("comparison_date", { mode: "string" }).notNull(),
  preparedBy: bigint("prepared_by", { mode: "number", unsigned: true }),
  criteria: json("criteria"),
  summary: text("summary"),
  recommendedSupplierId: bigint("recommended_supplier_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "approved"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bc_tenant_idx").on(table.tenantId),
]);

export const supplierPortalUsers = mysqlTable("supplier_portal_users", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("spu_tenant_idx").on(table.tenantId),
]);

export const supplierRfqResponses = mysqlTable("supplier_rfq_responses", {
  id: serial("id").primaryKey(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  rfqId: bigint("rfq_id", { mode: "number", unsigned: true }).notNull(),
  respondedAt: timestamp("responded_at").defaultNow().notNull(),
  responseType: mysqlEnum("response_type", ["quoted", "declined", "no_bid"]).notNull(),
  notes: text("notes"),
});

export const supplierPerformanceMetrics = mysqlTable("supplier_performance_metrics", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  qualityAcceptanceRate: decimal("quality_acceptance_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  fillRate: decimal("fill_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  leadTimeDays: decimal("lead_time_days", { precision: 5, scale: 2 }).default("0").notNull(),
  returnRate: decimal("return_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  priceCompetitiveness: decimal("price_competitiveness", { precision: 5, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("spm_tenant_idx").on(table.tenantId),
]);

export const consignmentInventory = mysqlTable("consignment_inventory", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  warehouseId: bigint("warehouse_id", { mode: "number", unsigned: true }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }).default("0").notNull(),
  agreedMinLevel: decimal("agreed_min_level", { precision: 18, scale: 4 }).default("0").notNull(),
  agreedMaxLevel: decimal("agreed_max_level", { precision: 18, scale: 4 }).default("0").notNull(),
  unitCost: decimal("unit_cost", { precision: 18, scale: 4 }).default("0").notNull(),
  lastConsumptionDate: date("last_consumption_date", { mode: "string" }),
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ci_tenant_idx").on(table.tenantId),
]);

// =====================================================
// 63. MULTI-COMPANY CONSOLIDATION
// =====================================================

export const consolidationGroups = mysqlTable("consolidation_groups", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  fiscalYearId: bigint("fiscal_year_id", { mode: "number", unsigned: true }),
  baseCurrency: varchar("base_currency", { length: 10 }).default("SAR").notNull(),
  consolidationMethod: mysqlEnum("consolidation_method", ["equity", "proportionate", "acquisition"]).default("equity").notNull(),
  eliminationMethod: mysqlEnum("elimination_method", ["line_by_line", "proportional"]).default("line_by_line").notNull(),
  status: mysqlEnum("status", ["draft", "in_progress", "completed"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("cons_groups_tenant_idx").on(table.tenantId),
]);

export type ConsolidationGroup = typeof consolidationGroups.$inferSelect;
export type InsertConsolidationGroup = typeof consolidationGroups.$inferInsert;

export const consolidationGroupCompanies = mysqlTable("consolidation_group_companies", {
  id: serial("id").primaryKey(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).notNull(),
  companyId: bigint("company_id", { mode: "number", unsigned: true }).notNull(),
  ownershipPercent: decimal("ownership_percent", { precision: 18, scale: 4 }).default("100.0000").notNull(),
  consolidationDate: date("consolidation_date"),
  isExcluded: boolean("is_excluded").default(false),
  notes: text("notes"),
}, (table) => [
  index("cons_group_companies_group_idx").on(table.groupId),
]);

export type ConsolidationGroupCompany = typeof consolidationGroupCompanies.$inferSelect;
export type InsertConsolidationGroupCompany = typeof consolidationGroupCompanies.$inferInsert;

export const consolidationEntries = mysqlTable("consolidation_entries", {
  id: serial("id").primaryKey(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  entryType: mysqlEnum("entry_type", ["elimination", "reclassification", "adjustment", "translation"]).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0").notNull(),
  accountId: bigint("account_id", { mode: "number", unsigned: true }),
  companyId: bigint("company_id", { mode: "number", unsigned: true }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default("1.000000"),
  status: mysqlEnum("status", ["draft", "posted", "reversed"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("cons_entries_group_idx").on(table.groupId),
]);

export type ConsolidationEntry = typeof consolidationEntries.$inferSelect;
export type InsertConsolidationEntry = typeof consolidationEntries.$inferInsert;

export const consolidationEliminations = mysqlTable("consolidation_eliminations", {
  id: serial("id").primaryKey(),
  groupId: bigint("group_id", { mode: "number", unsigned: true }).notNull(),
  entryType: mysqlEnum("entry_type", ["interco_revenue", "interco_expense", "interco_receivable", "interco_payable", "interco_dividend", "investment"]).notNull(),
  sourceCompanyId: bigint("source_company_id", { mode: "number", unsigned: true }),
  targetCompanyId: bigint("target_company_id", { mode: "number", unsigned: true }),
  accountId: bigint("account_id", { mode: "number", unsigned: true }),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0").notNull(),
  eliminationMethod: mysqlEnum("elimination_method", ["line_by_line", "proportional"]).default("line_by_line"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("cons_eliminations_group_idx").on(table.groupId),
]);

export type ConsolidationElimination = typeof consolidationEliminations.$inferSelect;
export type InsertConsolidationElimination = typeof consolidationEliminations.$inferInsert;

export const intercompanyTransactions = mysqlTable("intercompany_transactions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  transactionNumber: varchar("transaction_number", { length: 100 }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  sourceCompanyId: bigint("source_company_id", { mode: "number", unsigned: true }).notNull(),
  targetCompanyId: bigint("target_company_id", { mode: "number", unsigned: true }).notNull(),
  transactionType: mysqlEnum("transaction_type", ["sale", "purchase", "loan", "dividend", "expense"]).notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  totalAmount: decimal("total_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 6 }).default("1.000000"),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "posted", "reconciled"]).default("draft").notNull(),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("interco_tx_tenant_idx").on(table.tenantId),
]);

export type IntercompanyTransaction = typeof intercompanyTransactions.$inferSelect;
export type InsertIntercompanyTransaction = typeof intercompanyTransactions.$inferInsert;

export const intercompanyReconciliations = mysqlTable("intercompany_reconciliations", {
  id: serial("id").primaryKey(),
  intercompanyTransactionId: bigint("intercompany_transaction_id", { mode: "number", unsigned: true }).notNull(),
  sourceCompanyId: bigint("source_company_id", { mode: "number", unsigned: true }),
  targetCompanyId: bigint("target_company_id", { mode: "number", unsigned: true }),
  sourceAmount: decimal("source_amount", { precision: 18, scale: 2 }).default("0"),
  targetAmount: decimal("target_amount", { precision: 18, scale: 2 }).default("0"),
  difference: decimal("difference", { precision: 18, scale: 2 }).default("0"),
  reconciledAt: timestamp("reconciled_at").defaultNow().notNull(),
  reconciledBy: bigint("reconciled_by", { mode: "number", unsigned: true }),
});

export type IntercompanyReconciliation = typeof intercompanyReconciliations.$inferSelect;
export type InsertIntercompanyReconciliation = typeof intercompanyReconciliations.$inferInsert;

// =====================================================
// 64. IFRS 16 - LEASE ACCOUNTING
// =====================================================

export const leaseContracts = mysqlTable("lease_contracts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  leaseCode: varchar("lease_code", { length: 100 }).notNull(),
  description: text("description"),
  lessorName: varchar("lessor_name", { length: 255 }).notNull(),
  leaseType: mysqlEnum("lease_type", ["operating", "finance"]).notNull(),
  assetId: bigint("asset_id", { mode: "number", unsigned: true }),
  assetCategory: varchar("asset_category", { length: 100 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  leaseTermMonths: int("lease_term_months").notNull(),
  rentalPaymentAmount: decimal("rental_payment_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  paymentFrequency: mysqlEnum("payment_frequency", ["monthly", "quarterly", "semi_annual", "annual"]).default("monthly").notNull(),
  paymentDay: int("payment_day").default(1),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  discountRate: decimal("discount_rate", { precision: 10, scale: 6 }).default("0").notNull(),
  incentiveAmount: decimal("incentive_amount", { precision: 18, scale: 2 }).default("0"),
  initialDirectCosts: decimal("initial_direct_costs", { precision: 18, scale: 2 }).default("0"),
  residualValueGuarantee: decimal("residual_value_guarantee", { precision: 18, scale: 2 }).default("0"),
  purchaseOption: boolean("purchase_option").default(false),
  purchaseOptionAmount: decimal("purchase_option_amount", { precision: 18, scale: 2 }).default("0"),
  renewalOption: boolean("renewal_option").default(false),
  renewalTermMonths: int("renewal_term_months"),
  terminationOption: boolean("termination_option").default(false),
  terminationPenaltyAmount: decimal("termination_penalty_amount", { precision: 18, scale: 2 }).default("0"),
  rightOfUseAsset: decimal("right_of_use_asset", { precision: 18, scale: 2 }).default("0"),
  leaseLiability: decimal("lease_liability", { precision: 18, scale: 2 }).default("0"),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 18, scale: 2 }).default("0"),
  interestRate: mysqlEnum("interest_rate", ["implicit", "incremental"]).default("incremental"),
  status: mysqlEnum("status", ["active", "expired", "terminated", "amended"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("lease_contracts_tenant_idx").on(table.tenantId),
]);

export type LeaseContract = typeof leaseContracts.$inferSelect;
export type InsertLeaseContract = typeof leaseContracts.$inferInsert;

export const leasePaymentSchedules = mysqlTable("lease_payment_schedules", {
  id: serial("id").primaryKey(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  principalPortion: decimal("principal_portion", { precision: 18, scale: 2 }).default("0"),
  interestPortion: decimal("interest_portion", { precision: 18, scale: 2 }).default("0"),
  outstandingBalance: decimal("outstanding_balance", { precision: 18, scale: 2 }).default("0"),
  paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  paidDate: date("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("lease_pay_sched_contract_idx").on(table.contractId),
]);

export type LeasePaymentSchedule = typeof leasePaymentSchedules.$inferSelect;
export type InsertLeasePaymentSchedule = typeof leasePaymentSchedules.$inferInsert;

export const leaseModifications = mysqlTable("lease_modifications", {
  id: serial("id").primaryKey(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
  modificationDate: date("modification_date").notNull(),
  modificationType: mysqlEnum("modification_type", ["extension", "termination", "rent_revision", "asset_change"]).notNull(),
  description: text("description"),
  oldPaymentAmount: decimal("old_payment_amount", { precision: 18, scale: 2 }).default("0"),
  newPaymentAmount: decimal("new_payment_amount", { precision: 18, scale: 2 }).default("0"),
  oldDiscountRate: decimal("old_discount_rate", { precision: 10, scale: 6 }).default("0"),
  newDiscountRate: decimal("new_discount_rate", { precision: 10, scale: 6 }).default("0"),
  oldLeaseTerm: int("old_lease_term"),
  newLeaseTerm: int("new_lease_term"),
  gainLossAmount: decimal("gain_loss_amount", { precision: 18, scale: 2 }).default("0"),
  effectiveDate: date("effective_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("lease_mods_contract_idx").on(table.contractId),
]);

export type LeaseModification = typeof leaseModifications.$inferSelect;
export type InsertLeaseModification = typeof leaseModifications.$inferInsert;

export const rightOfUseAssets = mysqlTable("right_of_use_assets", {
  id: serial("id").primaryKey(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }).notNull(),
  assetCode: varchar("asset_code", { length: 100 }),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  cost: decimal("cost", { precision: 18, scale: 2 }).default("0"),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 18, scale: 2 }).default("0"),
  depreciationMethod: mysqlEnum("depreciation_method", ["straight_line", "declining"]).default("straight_line"),
  usefulLifeMonths: int("useful_life_months"),
  depreciationStartDate: date("depreciation_start_date"),
  netBookValue: decimal("net_book_value", { precision: 18, scale: 2 }).default("0"),
  impairmentLoss: decimal("impairment_loss", { precision: 18, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "fully_depreciated", "disposed"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("rou_assets_contract_idx").on(table.contractId),
]);

export type RightOfUseAsset = typeof rightOfUseAssets.$inferSelect;
export type InsertRightOfUseAsset = typeof rightOfUseAssets.$inferInsert;

// =====================================================
// 65. IFRS 15 - REVENUE RECOGNITION
// =====================================================

export const performanceObligations = mysqlTable("performance_obligations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  obligationName: varchar("obligation_name", { length: 255 }).notNull(),
  description: text("description"),
  obligationType: mysqlEnum("obligation_type", ["good", "service", "software", "support", "construction"]).notNull(),
  performanceTiming: mysqlEnum("performance_timing", ["point_in_time", "over_time"]).notNull(),
  transactionPrice: decimal("transaction_price", { precision: 18, scale: 2 }).default("0"),
  standalonePrice: decimal("standalone_price", { precision: 18, scale: 2 }).default("0"),
  allocatedAmount: decimal("allocated_amount", { precision: 18, scale: 2 }).default("0"),
  recognitionMethod: mysqlEnum("recognition_method", ["output", "input", "straight_line"]).default("straight_line"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  completionPercent: decimal("completion_percent", { precision: 8, scale: 4 }).default("0"),
  status: mysqlEnum("status", ["identified", "satisfied", "partially_satisfied", "cancelled"]).default("identified").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("perf_obl_tenant_idx").on(table.tenantId),
]);

export type PerformanceObligation = typeof performanceObligations.$inferSelect;
export type InsertPerformanceObligation = typeof performanceObligations.$inferInsert;

export const contractAssets = mysqlTable("contract_assets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  obligationId: bigint("obligation_id", { mode: "number", unsigned: true }),
  assetType: mysqlEnum("asset_type", ["contract_asset", "receivable", "unbilled_receivable"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0"),
  recognizedRevenue: decimal("recognized_revenue", { precision: 18, scale: 2 }).default("0"),
  billingAmount: decimal("billing_amount", { precision: 18, scale: 2 }).default("0"),
  receivedAmount: decimal("received_amount", { precision: 18, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "recognized", "billed", "collected"]).default("pending").notNull(),
  date: date("date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("contract_assets_tenant_idx").on(table.tenantId),
]);

export type ContractAsset = typeof contractAssets.$inferSelect;
export type InsertContractAsset = typeof contractAssets.$inferInsert;

export const contractLiabilities = mysqlTable("contract_liabilities", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  obligationId: bigint("obligation_id", { mode: "number", unsigned: true }),
  liabilityType: mysqlEnum("liability_type", ["deferred_revenue", "advance_billing", "refund_liability"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0"),
  recognizedAmount: decimal("recognized_amount", { precision: 18, scale: 2 }).default("0"),
  remainingAmount: decimal("remaining_amount", { precision: 18, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["unearned", "partially_recognized", "fully_recognized"]).default("unearned").notNull(),
  date: date("date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("contract_liab_tenant_idx").on(table.tenantId),
]);

export type ContractLiability = typeof contractLiabilities.$inferSelect;
export type InsertContractLiability = typeof contractLiabilities.$inferInsert;

export const revenueRecognitionSchedules = mysqlTable("revenue_recognition_schedules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  obligationId: bigint("obligation_id", { mode: "number", unsigned: true }),
  scheduledDate: date("scheduled_date").notNull(),
  recognizedAmount: decimal("recognized_amount", { precision: 18, scale: 2 }).default("0"),
  cumulativeAmount: decimal("cumulative_amount", { precision: 18, scale: 2 }).default("0"),
  recognitionMethod: mysqlEnum("recognition_method", ["output", "input", "straight_line"]).default("straight_line"),
  status: mysqlEnum("status", ["scheduled", "recognized", "skipped"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("rev_rec_sched_tenant_idx").on(table.tenantId),
]);

export type RevenueRecognitionSchedule = typeof revenueRecognitionSchedules.$inferSelect;
export type InsertRevenueRecognitionSchedule = typeof revenueRecognitionSchedules.$inferInsert;

export const contractModifications = mysqlTable("contract_modifications", {
  id: serial("id").primaryKey(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  modificationType: mysqlEnum("modification_type", ["change_order", "extension", "termination", "discount"]).notNull(),
  description: text("description"),
  preModificationPrice: decimal("pre_modification_price", { precision: 18, scale: 2 }).default("0"),
  postModificationPrice: decimal("post_modification_price", { precision: 18, scale: 2 }).default("0"),
  effectType: mysqlEnum("effect_type", ["prospective", "cumulative"]).default("prospective"),
  effectiveDate: date("effective_date"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContractModification = typeof contractModifications.$inferSelect;
export type InsertContractModification = typeof contractModifications.$inferInsert;

export const contractCosts = mysqlTable("contract_costs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contract_id", { mode: "number", unsigned: true }),
  costType: mysqlEnum("cost_type", ["incremental_fulfillment", "mobilization", "setup", "training", "commission"]).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 18, scale: 2 }).default("0"),
  capitalizedAmount: decimal("capitalized_amount", { precision: 18, scale: 2 }).default("0"),
  amortizationPeriod: int("amortization_period"),
  amortizationMethod: varchar("amortization_method", { length: 50 }),
  status: mysqlEnum("status", ["pending", "capitalized", "amortized"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("contract_costs_tenant_idx").on(table.tenantId),
]);

export type ContractCost = typeof contractCosts.$inferSelect;
export type InsertContractCost = typeof contractCosts.$inferInsert;

// =====================================================
// 67. EDI INTEGRATION
// =====================================================

export const ediPartners = mysqlTable("edi_partners", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  partnerCode: varchar("partner_code", { length: 50 }).notNull(),
  partnerName: varchar("partner_name", { length: 255 }).notNull(),
  partnerType: mysqlEnum("partner_type", ["customer", "supplier", "logistics", "bank", "govt"]).notNull(),
  ediStandard: mysqlEnum("edi_standard", ["edifact", "x12", "tradacoms", "custom"]).notNull(),
  version: varchar("version", { length: 50 }),
  senderId: varchar("sender_id", { length: 100 }),
  receiverId: varchar("receiver_id", { length: 100 }),
  qualifier: varchar("qualifier", { length: 50 }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("edi_partners_tenant_idx").on(table.tenantId),
]);

export const ediDocumentTypes = mysqlTable("edi_document_types", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  documentCode: varchar("document_code", { length: 50 }).notNull(),
  documentName: varchar("document_name", { length: 255 }).notNull(),
  direction: mysqlEnum("direction", ["inbound", "outbound", "both"]).notNull(),
  ediStandard: varchar("edi_standard", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
}, (table) => [
  index("edi_doc_types_tenant_idx").on(table.tenantId),
]);

export const ediMappings = mysqlTable("edi_mappings", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  mappingName: varchar("mapping_name", { length: 255 }).notNull(),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  sourceFormat: varchar("source_format", { length: 50 }).default("JSON"),
  targetFormat: varchar("target_format", { length: 50 }).default("EDI"),
  delimiter: varchar("delimiter", { length: 10 }).default("'"),
  segmentTerminator: varchar("segment_terminator", { length: 10 }).default("'"),
  elementSeparator: varchar("element_separator", { length: 10 }).default("+"),
  componentSeparator: varchar("component_separator", { length: 10 }).default(":"),
  decimalNotation: varchar("decimal_notation", { length: 10 }).default("."),
  releaseCharacter: varchar("release_character", { length: 10 }).default("?"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("edi_mappings_tenant_idx").on(table.tenantId),
]);

export const ediTransactionSets = mysqlTable("edi_transaction_sets", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  transactionSetId: varchar("transaction_set_id", { length: 50 }).notNull(),
  standard: varchar("standard", { length: 50 }),
  version: varchar("version", { length: 50 }),
  description: text("description"),
  functionalGroup: varchar("functional_group", { length: 50 }),
  tableDefinition: json("table_definition"),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("edi_txn_sets_tenant_idx").on(table.tenantId),
]);

export const ediOutboundQueue = mysqlTable("edi_outbound_queue", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
  documentTypeId: bigint("document_type_id", { mode: "number", unsigned: true }),
  sourceEntityType: varchar("source_entity_type", { length: 100 }),
  sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
  ediPayload: text("edi_payload"),
  status: mysqlEnum("status", ["pending", "generated", "transmitted", "acknowledged", "failed"]).default("pending"),
  acknowledgement: text("acknowledgement"),
  transmissionDate: timestamp("transmission_date"),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("edi_outbound_tenant_idx").on(table.tenantId),
]);

export const ediInboundQueue = mysqlTable("edi_inbound_queue", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
  documentTypeId: bigint("document_type_id", { mode: "number", unsigned: true }),
  rawEdi: text("raw_edi"),
  parsedData: json("parsed_data"),
  status: mysqlEnum("status", ["received", "parsed", "mapped", "processed", "failed"]).default("received"),
  documentReference: varchar("document_reference", { length: 255 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("edi_inbound_tenant_idx").on(table.tenantId),
]);

export const ediAcknowledgements = mysqlTable("edi_acknowledgements", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  outboundId: bigint("outbound_id", { mode: "number", unsigned: true }),
  partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
  ackType: mysqlEnum("ack_type", ["technical", "functional", "application"]).notNull(),
  ackCode: varchar("ack_code", { length: 50 }),
  ackDescription: text("ack_description"),
  ackDate: timestamp("ack_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("edi_acks_tenant_idx").on(table.tenantId),
]);

export const ediLogs = mysqlTable("edi_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  partnerId: bigint("partner_id", { mode: "number", unsigned: true }),
  direction: mysqlEnum("direction", ["inbound", "outbound"]),
  documentType: varchar("document_type", { length: 100 }),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  status: varchar("status", { length: 50 }),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("edi_logs_tenant_idx").on(table.tenantId),
]);

export type EdiPartner = typeof ediPartners.$inferSelect;
export type InsertEdiPartner = typeof ediPartners.$inferInsert;
export type EdiDocumentType = typeof ediDocumentTypes.$inferSelect;
export type InsertEdiDocumentType = typeof ediDocumentTypes.$inferInsert;
export type EdiMapping = typeof ediMappings.$inferSelect;
export type InsertEdiMapping = typeof ediMappings.$inferInsert;
export type EdiTransactionSet = typeof ediTransactionSets.$inferSelect;
export type InsertEdiTransactionSet = typeof ediTransactionSets.$inferInsert;
export type EdiOutboundQueue = typeof ediOutboundQueue.$inferSelect;
export type InsertEdiOutboundQueue = typeof ediOutboundQueue.$inferInsert;
export type EdiInboundQueue = typeof ediInboundQueue.$inferSelect;
export type InsertEdiInboundQueue = typeof ediInboundQueue.$inferInsert;
export type EdiAcknowledgement = typeof ediAcknowledgements.$inferSelect;
export type InsertEdiAcknowledgement = typeof ediAcknowledgements.$inferInsert;
export type EdiLog = typeof ediLogs.$inferSelect;
export type InsertEdiLog = typeof ediLogs.$inferInsert;

// =====================================================
// 68. WEBHOOK & API GATEWAY
// =====================================================

export const webhookSubscriptions = mysqlTable("webhook_subscriptions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  secret: varchar("secret", { length: 512 }),
  eventTypes: json("event_types").notNull(),
  format: mysqlEnum("format", ["json", "xml"]).default("json"),
  isActive: boolean("is_active").default(true),
  retryCount: int("retry_count").default(3),
  timeoutMs: int("timeout_ms").default(5000),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount: int("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("webhook_subs_tenant_idx").on(table.tenantId),
]);

export const webhookDeliveryLogs = mysqlTable("webhook_delivery_logs", {
  id: serial("id").primaryKey(),
  subscriptionId: bigint("subscription_id", { mode: "number", unsigned: true }),
  eventType: varchar("event_type", { length: 100 }),
  payload: json("payload"),
  status: mysqlEnum("status", ["delivered", "failed", "retrying"]).notNull(),
  httpStatus: int("http_status"),
  responseBody: text("response_body"),
  attemptNumber: int("attempt_number").default(1),
  durationMs: int("duration_ms"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhookEventQueue = mysqlTable("webhook_event_queue", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: json("payload"),
  sourceEntityType: varchar("source_entity_type", { length: 100 }),
  sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
  priority: int("priority").default(5),
  status: mysqlEnum("status", ["pending", "delivered", "failed"]).default("pending"),
  retryCount: int("retry_count").default(0),
  maxRetries: int("max_retries").default(5),
  nextRetryAt: timestamp("next_retry_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("webhook_queue_tenant_idx").on(table.tenantId),
]);

export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 512 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 8 }),
  permissions: json("permissions"),
  ipWhitelist: json("ip_whitelist"),
  rateLimitPerMinute: int("rate_limit_per_minute").default(60),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("api_keys_tenant_idx").on(table.tenantId),
]);

export const apiUsageLogs = mysqlTable("api_usage_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  apiKeyId: bigint("api_key_id", { mode: "number", unsigned: true }),
  endpoint: varchar("endpoint", { length: 255 }),
  method: varchar("method", { length: 10 }),
  httpStatus: int("http_status"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  durationMs: int("duration_ms"),
  requestSize: int("request_size"),
  responseSize: int("response_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("api_usage_tenant_idx").on(table.tenantId),
]);

export const apiRateLimits = mysqlTable("api_rate_limits", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  apiKeyId: bigint("api_key_id", { mode: "number", unsigned: true }),
  intervalStart: timestamp("interval_start"),
  requestCount: int("request_count").default(0),
  limitPerInterval: int("limit_per_interval").default(60),
  intervalSeconds: int("interval_seconds").default(60),
}, (table) => [
  index("api_rate_limits_tenant_idx").on(table.tenantId),
]);

export type WebhookSubscription = typeof webhookSubscriptions.$inferSelect;
export type InsertWebhookSubscription = typeof webhookSubscriptions.$inferInsert;
export type WebhookDeliveryLog = typeof webhookDeliveryLogs.$inferSelect;
export type InsertWebhookDeliveryLog = typeof webhookDeliveryLogs.$inferInsert;
export type WebhookEventQueue = typeof webhookEventQueue.$inferSelect;
export type InsertWebhookEventQueue = typeof webhookEventQueue.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;
export type InsertApiUsageLog = typeof apiUsageLogs.$inferInsert;
export type ApiRateLimit = typeof apiRateLimits.$inferSelect;
export type InsertApiRateLimit = typeof apiRateLimits.$inferInsert;

// =====================================================
// 69. OLAP & DATA WAREHOUSE
// =====================================================

export const dwFactTables = mysqlTable("dw_fact_tables", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  factName: varchar("fact_name", { length: 255 }).notNull(),
  factCode: varchar("fact_code", { length: 50 }),
  description: text("description"),
  sourceSchema: varchar("source_schema", { length: 255 }),
  sourceTable: varchar("source_table", { length: 255 }),
  refreshFrequency: mysqlEnum("refresh_frequency", ["realtime", "hourly", "daily", "weekly", "monthly"]).default("daily"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  lastRefreshedAt: timestamp("last_refreshed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("dw_facts_tenant_idx").on(table.tenantId),
]);

export const dwDimensionTables = mysqlTable("dw_dimension_tables", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  dimensionName: varchar("dimension_name", { length: 255 }).notNull(),
  dimensionCode: varchar("dimension_code", { length: 50 }),
  description: text("description"),
  sourceTable: varchar("source_table", { length: 255 }),
  type: mysqlEnum("type", ["conformed", "role_playing", "junk", "degenerated"]).default("conformed"),
  hierarchyLevels: int("hierarchy_levels").default(1),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("dw_dims_tenant_idx").on(table.tenantId),
]);

export const dwCubes = mysqlTable("dw_cubes", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  cubeName: varchar("cube_name", { length: 255 }).notNull(),
  cubeCode: varchar("cube_code", { length: 50 }),
  description: text("description"),
  factTableId: bigint("fact_table_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  lastProcessedAt: timestamp("last_processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("dw_cubes_tenant_idx").on(table.tenantId),
]);

export const dwCubeDimensions = mysqlTable("dw_cube_dimensions", {
  id: serial("id").primaryKey(),
  cubeId: bigint("cube_id", { mode: "number", unsigned: true }),
  dimensionId: bigint("dimension_id", { mode: "number", unsigned: true }),
  dimensionType: mysqlEnum("dimension_type", ["regular", "role_playing"]).default("regular"),
  roleName: varchar("role_name", { length: 100 }),
});

export const dwCubeMeasures = mysqlTable("dw_cube_measures", {
  id: serial("id").primaryKey(),
  cubeId: bigint("cube_id", { mode: "number", unsigned: true }),
  measureName: varchar("measure_name", { length: 255 }).notNull(),
  measureCode: varchar("measure_code", { length: 50 }),
  aggregationType: mysqlEnum("aggregation_type", ["sum", "avg", "count", "min", "max", "distinct_count"]).notNull(),
  sourceColumn: varchar("source_column", { length: 255 }),
  format: varchar("format", { length: 50 }),
  isActive: boolean("is_active").default(true),
});

export const dwEtlMetadata = mysqlTable("dw_etl_metadata", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  etlJobId: varchar("etl_job_id", { length: 100 }),
  jobName: varchar("job_name", { length: 255 }),
  jobType: mysqlEnum("job_type", ["extract", "transform", "load", "full"]).default("full"),
  sourceConnector: bigint("source_connector", { mode: "number", unsigned: true }),
  targetConnector: bigint("target_connector", { mode: "number", unsigned: true }),
  schedule: varchar("schedule", { length: 100 }),
  lastRunAt: timestamp("last_run_at"),
  status: mysqlEnum("status", ["active", "paused", "disabled"]).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("dw_etl_tenant_idx").on(table.tenantId),
]);

export const dwEpsilonCertifiedData = mysqlTable("dw_epsilon_certified_data", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  cubeId: bigint("cube_id", { mode: "number", unsigned: true }),
  certificationDate: timestamp("certification_date"),
  certifiedBy: bigint("certified_by", { mode: "number", unsigned: true }),
  notes: text("notes"),
  version: varchar("version", { length: 50 }),
});

export type DwFactTable = typeof dwFactTables.$inferSelect;
export type InsertDwFactTable = typeof dwFactTables.$inferInsert;
export type DwDimensionTable = typeof dwDimensionTables.$inferSelect;
export type InsertDwDimensionTable = typeof dwDimensionTables.$inferInsert;
export type DwCube = typeof dwCubes.$inferSelect;
export type InsertDwCube = typeof dwCubes.$inferInsert;
export type DwCubeDimension = typeof dwCubeDimensions.$inferSelect;
export type InsertDwCubeDimension = typeof dwCubeDimensions.$inferInsert;
export type DwCubeMeasure = typeof dwCubeMeasures.$inferSelect;
export type InsertDwCubeMeasure = typeof dwCubeMeasures.$inferInsert;
export type DwEtlMetadata = typeof dwEtlMetadata.$inferSelect;
export type InsertDwEtlMetadata = typeof dwEtlMetadata.$inferInsert;
export type DwEpsilonCertifiedData = typeof dwEpsilonCertifiedData.$inferSelect;
export type InsertDwEpsilonCertifiedData = typeof dwEpsilonCertifiedData.$inferInsert;

// =====================================================
// 70. ETL PIPELINE
// =====================================================

export const etlConnectors = mysqlTable("etl_connectors", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  connectorName: varchar("connector_name", { length: 255 }).notNull(),
  connectorType: mysqlEnum("connector_type", ["mysql", "postgres", "s3", "ftp", "http", "csv", "excel", "api", "custom"]).notNull(),
  connectionConfig: json("connection_config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("etl_connectors_tenant_idx").on(table.tenantId),
]);

export const etlJobs = mysqlTable("etl_jobs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  jobCode: varchar("job_code", { length: 50 }),
  description: text("description"),
  sourceConnectorId: bigint("source_connector_id", { mode: "number", unsigned: true }),
  targetConnectorId: bigint("target_connector_id", { mode: "number", unsigned: true }),
  scheduleType: mysqlEnum("schedule_type", ["manual", "cron", "event"]).default("manual"),
  scheduleExpression: varchar("schedule_expression", { length: 100 }),
  batchSize: int("batch_size").default(1000),
  errorHandling: mysqlEnum("error_handling", ["skip", "abort", "retry"]).default("abort"),
  retryCount: int("retry_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("etl_jobs_tenant_idx").on(table.tenantId),
]);

export const etlJobSteps = mysqlTable("etl_job_steps", {
  id: serial("id").primaryKey(),
  jobId: bigint("job_id", { mode: "number", unsigned: true }),
  stepOrder: int("step_order").default(0),
  stepType: mysqlEnum("step_type", ["extract", "transform", "load", "validate", "dedupe", "aggregate", "join", "filter", "map"]).notNull(),
  config: json("config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const etlTransformations = mysqlTable("etl_transformations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  transformationName: varchar("transformation_name", { length: 255 }).notNull(),
  transformationType: mysqlEnum("transformation_type", ["column_map", "datatype_convert", "lookup", "calculate", "conditional", "aggregate", "sort", "dedupe"]).notNull(),
  sourceField: varchar("source_field", { length: 255 }),
  targetField: varchar("target_field", { length: 255 }),
  config: json("config"),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("etl_transforms_tenant_idx").on(table.tenantId),
]);

export const etlExecutionLogs = mysqlTable("etl_execution_logs", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  jobId: bigint("job_id", { mode: "number", unsigned: true }),
  executionId: varchar("execution_id", { length: 100 }),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: mysqlEnum("status", ["running", "completed", "failed", "aborted"]).default("running"),
  rowsRead: int("rows_read").default(0),
  rowsProcessed: int("rows_processed").default(0),
  rowsError: int("rows_error").default(0),
  rowsWritten: int("rows_written").default(0),
  durationMs: int("duration_ms"),
  errorMessage: text("error_message"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("etl_exec_logs_tenant_idx").on(table.tenantId),
]);

export const etlDataQualityRules = mysqlTable("etl_data_quality_rules", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleType: mysqlEnum("rule_type", ["not_null", "unique", "range", "format", "referenced_integrity", "custom"]).notNull(),
  fieldName: varchar("field_name", { length: 255 }),
  validationConfig: json("validation_config"),
  severity: mysqlEnum("severity", ["warn", "error", "block"]).default("error"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("etl_dq_rules_tenant_idx").on(table.tenantId),
]);

export const etlDataQualityLogs = mysqlTable("etl_data_quality_logs", {
  id: serial("id").primaryKey(),
  executionId: bigint("execution_id", { mode: "number", unsigned: true }),
  ruleId: bigint("rule_id", { mode: "number", unsigned: true }),
  rowRef: varchar("row_ref", { length: 255 }),
  fieldName: varchar("field_name", { length: 255 }),
  expectedValue: text("expected_value"),
  actualValue: text("actual_value"),
  severity: varchar("severity", { length: 20 }),
  status: mysqlEnum("status", ["passed", "failed"]).default("failed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EtlConnector = typeof etlConnectors.$inferSelect;
export type InsertEtlConnector = typeof etlConnectors.$inferInsert;
export type EtlJob = typeof etlJobs.$inferSelect;
export type InsertEtlJob = typeof etlJobs.$inferInsert;
export type EtlJobStep = typeof etlJobSteps.$inferSelect;
export type InsertEtlJobStep = typeof etlJobSteps.$inferInsert;
export type EtlTransformation = typeof etlTransformations.$inferSelect;
export type InsertEtlTransformation = typeof etlTransformations.$inferInsert;
export type EtlExecutionLog = typeof etlExecutionLogs.$inferSelect;
export type InsertEtlExecutionLog = typeof etlExecutionLogs.$inferInsert;
export type EtlDataQualityRule = typeof etlDataQualityRules.$inferSelect;
export type InsertEtlDataQualityRule = typeof etlDataQualityRules.$inferInsert;
export type EtlDataQualityLog = typeof etlDataQualityLogs.$inferSelect;
export type InsertEtlDataQualityLog = typeof etlDataQualityLogs.$inferInsert;

// =====================================================
// 71. REAL-TIME COLLABORATION (WebSockets)
// =====================================================

export const wsConnections = mysqlTable("ws_connections", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  sessionId: varchar("session_id", { length: 255 }),
  deviceInfo: varchar("device_info", { length: 500 }),
  connectedAt: timestamp("connected_at").defaultNow(),
  disconnectedAt: timestamp("disconnected_at"),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("ws_conn_tenant_idx").on(table.tenantId),
]);

export const wsPresence = mysqlTable("ws_presence", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["online", "away", "busy", "offline"]).default("offline"),
  lastSeen: timestamp("last_seen").defaultNow(),
  currentModule: varchar("current_module", { length: 100 }),
  customStatus: varchar("custom_status", { length: 255 }),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("ws_presence_tenant_idx").on(table.tenantId),
]);

export const wsNotifications = mysqlTable("ws_notifications", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  type: mysqlEnum("type", ["info", "warning", "error", "success"]).default("info"),
  sourceModule: varchar("source_module", { length: 100 }),
  sourceEntityType: varchar("source_entity_type", { length: 100 }),
  sourceEntityId: bigint("source_entity_id", { mode: "number", unsigned: true }),
  actionUrl: varchar("action_url", { length: 1024 }),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ws_notif_tenant_idx").on(table.tenantId),
]);

export const wsCollaborationSessions = mysqlTable("ws_collaboration_sessions", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  sessionName: varchar("session_name", { length: 255 }).notNull(),
  sessionType: mysqlEnum("session_type", ["document_review", "dashboard", "record_edit", "chat"]).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
}, (table) => [
  index("ws_collab_tenant_idx").on(table.tenantId),
]);

export const wsSessionParticipants = mysqlTable("ws_session_participants", {
  id: serial("id").primaryKey(),
  sessionId: bigint("session_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).default("viewer"),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
});

export const wsSessionActivities = mysqlTable("ws_session_activities", {
  id: serial("id").primaryKey(),
  sessionId: bigint("session_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  activityType: mysqlEnum("activity_type", ["view", "edit", "comment", "approve", "reject", "mention"]).notNull(),
  activityData: json("activity_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wsUserTyping = mysqlTable("ws_user_typing", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  sessionId: bigint("session_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  isTyping: boolean("is_typing").default(false),
  lastTypingAt: timestamp("last_typing_at").defaultNow(),
}, (table) => [
  index("ws_typing_tenant_idx").on(table.tenantId),
]);

export type WsConnection = typeof wsConnections.$inferSelect;
export type InsertWsConnection = typeof wsConnections.$inferInsert;
export type WsPresence = typeof wsPresence.$inferSelect;
export type InsertWsPresence = typeof wsPresence.$inferInsert;
export type WsNotification = typeof wsNotifications.$inferSelect;
export type InsertWsNotification = typeof wsNotifications.$inferInsert;
export type WsCollaborationSession = typeof wsCollaborationSessions.$inferSelect;
export type InsertWsCollaborationSession = typeof wsCollaborationSessions.$inferInsert;
export type WsSessionParticipant = typeof wsSessionParticipants.$inferSelect;
export type InsertWsSessionParticipant = typeof wsSessionParticipants.$inferInsert;
export type WsSessionActivity = typeof wsSessionActivities.$inferSelect;
export type InsertWsSessionActivity = typeof wsSessionActivities.$inferInsert;
export type WsUserTyping = typeof wsUserTyping.$inferSelect;
export type InsertWsUserTyping = typeof wsUserTyping.$inferInsert;

// =====================================================
// 21. Laundry Module
// =====================================================
export const laundryOrders = mysqlTable("laundry_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  itemsCount: int("items_count").default(1).notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  status: mysqlEnum("status", ["received", "washing", "ironing", "ready", "delivered"]).default("received").notNull(),
  paymentStatus: mysqlEnum("payment_status", ["paid", "unpaid"]).default("unpaid").notNull(),
  garmentDetails: text("garment_details"),
  date: date("date", { mode: "string" }).notNull(),
  deliveryType: mysqlEnum("delivery_type", ["pickup", "delivery"]).default("pickup").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 22. Salon & Spa Module
// =====================================================
export const salonAppointments = mysqlTable("salon_appointments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 50 }).notNull(),
  service: varchar("service", { length: 255 }).notNull(),
  stylistName: varchar("stylist_name", { length: 255 }).notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["scheduled", "in-service", "completed", "cancelled"]).default("scheduled").notNull(),
  price: decimal("price", { precision: 18, scale: 4 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 23. Gym & Fitness Module
// =====================================================
export const gymMembers = mysqlTable("gym_members", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  membershipPlan: varchar("membership_plan", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "frozen", "expired"]).default("active").notNull(),
  expiryDate: date("expiry_date", { mode: "string" }).notNull(),
  lastCheckIn: varchar("last_check_in", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================================================
// 24. E-commerce Channel Module
// =====================================================
export const ecommerceOrders = mysqlTable("ecommerce_orders", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  channel: mysqlEnum("channel", ["Shopify", "Salla", "Zid", "WhatsApp"]).default("Salla").notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 4 }).default("0").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["COD", "Mada", "Card"]).default("Mada").notNull(),
  fulfillmentStatus: mysqlEnum("fulfillment_status", ["pending", "packed", "shipped", "delivered"]).default("pending").notNull(),
  courier: varchar("courier", { length: 255 }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatConversations = mysqlTable("chat_conversations", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).notNull(),
  subject: varchar("subject", { length: 255 }),
  status: mysqlEnum("status", ["active", "resolved", "closed"]).default("active").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversation_id", { mode: "number", unsigned: true }).notNull(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }),
  senderType: mysqlEnum("sender_type", ["admin", "support", "tenant", "user"]).default("tenant").notNull(),
  senderName: varchar("sender_name", { length: 255 }),
  message: text("message").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
