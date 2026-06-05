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
  role: mysqlEnum("role", ["super_admin", "admin", "manager", "accountant", "salesman", "cashier", "hr", "store_keeper", "user"]).default("user").notNull(),
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
