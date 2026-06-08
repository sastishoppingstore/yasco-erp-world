import { relations } from "drizzle-orm";
import * as schema from "./schema";

export const tenantsRelations = relations(schema.tenants, ({ many }) => ({
  users: many(schema.users),
  roles: many(schema.roles),
  userRoles: many(schema.userRoles),
  fiscalYears: many(schema.fiscalYears),
  chartOfAccounts: many(schema.chartOfAccounts),
  costCenters: many(schema.costCenters),
  journalEntries: many(schema.journalEntries),
  budgets: many(schema.budgets),
  productCategories: many(schema.productCategories),
  brands: many(schema.brands),
  units: many(schema.units),
  warehouses: many(schema.warehouses),
  products: many(schema.products),
  inventoryBalances: many(schema.inventoryBalances),
  inventoryMovements: many(schema.inventoryMovements),
  stockTransfers: many(schema.stockTransfers),
  stockAdjustments: many(schema.stockAdjustments),
  customers: many(schema.customers),
  salesQuotations: many(schema.salesQuotations),
  salesOrders: many(schema.salesOrders),
  invoices: many(schema.invoices),
  creditNotes: many(schema.creditNotes),
  customerPayments: many(schema.customerPayments),
  suppliers: many(schema.suppliers),
  purchaseOrders: many(schema.purchaseOrders),
  goodsReceivedNotes: many(schema.goodsReceivedNotes),
  supplierPayments: many(schema.supplierPayments),
  leads: many(schema.leads),
  opportunities: many(schema.opportunities),
  crmActivities: many(schema.crmActivities),
  departments: many(schema.departments),
  designations: many(schema.designations),
  employees: many(schema.employees),
  attendance: many(schema.attendance),
  leaveTypes: many(schema.leaveTypes),
  leaveRequests: many(schema.leaveRequests),
  payrollPeriods: many(schema.payrollPeriods),
  salarySlips: many(schema.salarySlips),
  employeeLoans: many(schema.employeeLoans),
  advances: many(schema.advances),
  performanceReviews: many(schema.performanceReviews),
  billOfMaterials: many(schema.billOfMaterials),
  workOrders: many(schema.workOrders),
  productionOrders: many(schema.productionOrders),
  projects: many(schema.projects),
  projectTasks: many(schema.projectTasks),
  projectMilestones: many(schema.projectMilestones),
  timesheets: many(schema.timesheets),
  supportTickets: many(schema.supportTickets),
  assets: many(schema.assets),
  assetMaintenance: many(schema.assetMaintenance),
  depreciationEntries: many(schema.depreciationEntries),
  vehicles: many(schema.vehicles),
  fuelRecords: many(schema.fuelRecords),
  vehicleMaintenance: many(schema.vehicleMaintenance),
  drivers: many(schema.drivers),
  documentCategories: many(schema.documentCategories),
  documents: many(schema.documents),
  companySettings: many(schema.companySettings),
  taxRates: many(schema.taxRates),
  currencies: many(schema.currencies),
  auditLogs: many(schema.auditLogs),
  notifications: many(schema.notifications),
}));

export const usersRelations = relations(schema.users, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.users.tenantId], references: [schema.tenants.id] }),
  userRoles: many(schema.userRoles),
  createdJournalEntries: many(schema.journalEntries),
  createdInventoryMovements: many(schema.inventoryMovements),
  createdStockTransfers: many(schema.stockTransfers),
  createdStockAdjustments: many(schema.stockAdjustments),
  createdSalesQuotations: many(schema.salesQuotations),
  createdSalesOrders: many(schema.salesOrders),
  createdInvoices: many(schema.invoices),
  createdCreditNotes: many(schema.creditNotes),
  createdCustomerPayments: many(schema.customerPayments),
  createdPurchaseOrders: many(schema.purchaseOrders),
  createdGoodsReceivedNotes: many(schema.goodsReceivedNotes),
  createdSupplierPayments: many(schema.supplierPayments),
  createdLeads: many(schema.leads),
  createdOpportunities: many(schema.opportunities),
  createdCrmActivities: many(schema.crmActivities),
  createdWorkOrders: many(schema.workOrders),
  createdProductionOrders: many(schema.productionOrders),
  createdProjects: many(schema.projects),
  createdSupportTickets: many(schema.supportTickets),
  ticketComments: many(schema.ticketComments),
  uploadedDocuments: many(schema.documents),
  assignedLeads: many(schema.leads),
  assignedOpportunities: many(schema.opportunities),
  assignedCrmActivities: many(schema.crmActivities),
  assignedProjectTasks: many(schema.projectTasks),
  assignedSupportTickets: many(schema.supportTickets),
  assignedAssets: many(schema.assets),
  auditLogs: many(schema.auditLogs),
  notifications: many(schema.notifications),
}));

export const rolesRelations = relations(schema.roles, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.roles.tenantId], references: [schema.tenants.id] }),
  userRoles: many(schema.userRoles),
}));

export const userRolesRelations = relations(schema.userRoles, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.userRoles.tenantId], references: [schema.tenants.id] }),
  user: one(schema.users, { fields: [schema.userRoles.userId], references: [schema.users.id] }),
  role: one(schema.roles, { fields: [schema.userRoles.roleId], references: [schema.roles.id] }),
}));

export const fiscalYearsRelations = relations(schema.fiscalYears, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.fiscalYears.tenantId], references: [schema.tenants.id] }),
  budgets: many(schema.budgets),
}));

export const chartOfAccountsRelations = relations(schema.chartOfAccounts, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.chartOfAccounts.tenantId], references: [schema.tenants.id] }),
  parent: one(schema.chartOfAccounts, { fields: [schema.chartOfAccounts.parentId], references: [schema.chartOfAccounts.id] }),
  children: many(schema.chartOfAccounts),
  journalEntryLines: many(schema.journalEntryLines),
  budgets: many(schema.budgets),
  customerPayments: many(schema.customerPayments),
  supplierPayments: many(schema.supplierPayments),
}));

export const costCentersRelations = relations(schema.costCenters, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.costCenters.tenantId], references: [schema.tenants.id] }),
  journalEntries: many(schema.journalEntries),
  journalEntryLines: many(schema.journalEntryLines),
  budgets: many(schema.budgets),
}));

export const journalEntriesRelations = relations(schema.journalEntries, ({ many, one }) => ({
  tenant: one(schema.tenants, { fields: [schema.journalEntries.tenantId], references: [schema.tenants.id] }),
  lines: many(schema.journalEntryLines),
  costCenter: one(schema.costCenters, { fields: [schema.journalEntries.costCenterId], references: [schema.costCenters.id] }),
  reversedEntry: one(schema.journalEntries, { fields: [schema.journalEntries.reversedEntryId], references: [schema.journalEntries.id] }),
  reversals: many(schema.journalEntries),
  createdBy: one(schema.users, { fields: [schema.journalEntries.createdBy], references: [schema.users.id] }),
  depreciationEntries: many(schema.depreciationEntries),
}));

export const journalEntryLinesRelations = relations(schema.journalEntryLines, ({ one }) => ({
  journalEntry: one(schema.journalEntries, { fields: [schema.journalEntryLines.journalEntryId], references: [schema.journalEntries.id] }),
  account: one(schema.chartOfAccounts, { fields: [schema.journalEntryLines.accountId], references: [schema.chartOfAccounts.id] }),
  costCenter: one(schema.costCenters, { fields: [schema.journalEntryLines.costCenterId], references: [schema.costCenters.id] }),
}));

export const budgetsRelations = relations(schema.budgets, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.budgets.tenantId], references: [schema.tenants.id] }),
  fiscalYear: one(schema.fiscalYears, { fields: [schema.budgets.fiscalYearId], references: [schema.fiscalYears.id] }),
  account: one(schema.chartOfAccounts, { fields: [schema.budgets.accountId], references: [schema.chartOfAccounts.id] }),
  costCenter: one(schema.costCenters, { fields: [schema.budgets.costCenterId], references: [schema.costCenters.id] }),
}));

export const productCategoriesRelations = relations(schema.productCategories, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.productCategories.tenantId], references: [schema.tenants.id] }),
  parent: one(schema.productCategories, { fields: [schema.productCategories.parentId], references: [schema.productCategories.id] }),
  children: many(schema.productCategories),
  products: many(schema.products),
}));

export const brandsRelations = relations(schema.brands, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.brands.tenantId], references: [schema.tenants.id] }),
  products: many(schema.products),
}));

export const unitsRelations = relations(schema.units, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.units.tenantId], references: [schema.tenants.id] }),
  baseUnit: one(schema.units, { fields: [schema.units.baseUnitId], references: [schema.units.id] }),
  childUnits: many(schema.units),
  products: many(schema.products),
}));

export const warehousesRelations = relations(schema.warehouses, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.warehouses.tenantId], references: [schema.tenants.id] }),
  inventoryBalances: many(schema.inventoryBalances),
  inventoryMovements: many(schema.inventoryMovements),
  fromStockTransfers: many(schema.stockTransfers),
  toStockTransfers: many(schema.stockTransfers),
  stockAdjustments: many(schema.stockAdjustments),
  goodsReceivedNotes: many(schema.goodsReceivedNotes),
  productionOrders: many(schema.productionOrders),
}));

export const productsRelations = relations(schema.products, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.products.tenantId], references: [schema.tenants.id] }),
  category: one(schema.productCategories, { fields: [schema.products.categoryId], references: [schema.productCategories.id] }),
  brand: one(schema.brands, { fields: [schema.products.brandId], references: [schema.brands.id] }),
  unit: one(schema.units, { fields: [schema.products.unitId], references: [schema.units.id] }),
  inventoryBalances: many(schema.inventoryBalances),
  inventoryMovements: many(schema.inventoryMovements),
  stockTransferItems: many(schema.stockTransferItems),
  stockAdjustmentItems: many(schema.stockAdjustmentItems),
  salesQuotationItems: many(schema.salesQuotationItems),
  salesOrderItems: many(schema.salesOrderItems),
  invoiceItems: many(schema.invoiceItems),
  purchaseOrderItems: many(schema.purchaseOrderItems),
  grnItems: many(schema.grnItems),
  billOfMaterials: many(schema.billOfMaterials),
  bomItems: many(schema.bomItems),
  workOrders: many(schema.workOrders),
  productionItems: many(schema.productionItems),
}));

export const inventoryBalancesRelations = relations(schema.inventoryBalances, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.inventoryBalances.tenantId], references: [schema.tenants.id] }),
  product: one(schema.products, { fields: [schema.inventoryBalances.productId], references: [schema.products.id] }),
  warehouse: one(schema.warehouses, { fields: [schema.inventoryBalances.warehouseId], references: [schema.warehouses.id] }),
}));

export const inventoryMovementsRelations = relations(schema.inventoryMovements, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.inventoryMovements.tenantId], references: [schema.tenants.id] }),
  product: one(schema.products, { fields: [schema.inventoryMovements.productId], references: [schema.products.id] }),
  warehouse: one(schema.warehouses, { fields: [schema.inventoryMovements.warehouseId], references: [schema.warehouses.id] }),
  createdBy: one(schema.users, { fields: [schema.inventoryMovements.createdBy], references: [schema.users.id] }),
}));

export const stockTransfersRelations = relations(schema.stockTransfers, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.stockTransfers.tenantId], references: [schema.tenants.id] }),
  fromWarehouse: one(schema.warehouses, { fields: [schema.stockTransfers.fromWarehouseId], references: [schema.warehouses.id] }),
  toWarehouse: one(schema.warehouses, { fields: [schema.stockTransfers.toWarehouseId], references: [schema.warehouses.id] }),
  createdBy: one(schema.users, { fields: [schema.stockTransfers.createdBy], references: [schema.users.id] }),
  items: many(schema.stockTransferItems),
}));

export const stockTransferItemsRelations = relations(schema.stockTransferItems, ({ one }) => ({
  transfer: one(schema.stockTransfers, { fields: [schema.stockTransferItems.transferId], references: [schema.stockTransfers.id] }),
  product: one(schema.products, { fields: [schema.stockTransferItems.productId], references: [schema.products.id] }),
}));

export const stockAdjustmentsRelations = relations(schema.stockAdjustments, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.stockAdjustments.tenantId], references: [schema.tenants.id] }),
  warehouse: one(schema.warehouses, { fields: [schema.stockAdjustments.warehouseId], references: [schema.warehouses.id] }),
  createdBy: one(schema.users, { fields: [schema.stockAdjustments.createdBy], references: [schema.users.id] }),
  items: many(schema.stockAdjustmentItems),
}));

export const stockAdjustmentItemsRelations = relations(schema.stockAdjustmentItems, ({ one }) => ({
  adjustment: one(schema.stockAdjustments, { fields: [schema.stockAdjustmentItems.adjustmentId], references: [schema.stockAdjustments.id] }),
  product: one(schema.products, { fields: [schema.stockAdjustmentItems.productId], references: [schema.products.id] }),
}));

export const customersRelations = relations(schema.customers, ({ many, one }) => ({
  tenant: one(schema.tenants, { fields: [schema.customers.tenantId], references: [schema.tenants.id] }),
  invoices: many(schema.invoices),
  salesQuotations: many(schema.salesQuotations),
  salesOrders: many(schema.salesOrders),
  creditNotes: many(schema.creditNotes),
  customerPayments: many(schema.customerPayments),
  opportunities: many(schema.opportunities),
  projects: many(schema.projects),
}));

export const salesQuotationsRelations = relations(schema.salesQuotations, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.salesQuotations.tenantId], references: [schema.tenants.id] }),
  customer: one(schema.customers, { fields: [schema.salesQuotations.customerId], references: [schema.customers.id] }),
  createdBy: one(schema.users, { fields: [schema.salesQuotations.createdBy], references: [schema.users.id] }),
  items: many(schema.salesQuotationItems),
  salesOrders: many(schema.salesOrders),
}));

export const salesQuotationItemsRelations = relations(schema.salesQuotationItems, ({ one }) => ({
  quotation: one(schema.salesQuotations, { fields: [schema.salesQuotationItems.quotationId], references: [schema.salesQuotations.id] }),
  product: one(schema.products, { fields: [schema.salesQuotationItems.productId], references: [schema.products.id] }),
}));

export const salesOrdersRelations = relations(schema.salesOrders, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.salesOrders.tenantId], references: [schema.tenants.id] }),
  customer: one(schema.customers, { fields: [schema.salesOrders.customerId], references: [schema.customers.id] }),
  quotation: one(schema.salesQuotations, { fields: [schema.salesOrders.quotationId], references: [schema.salesQuotations.id] }),
  createdBy: one(schema.users, { fields: [schema.salesOrders.createdBy], references: [schema.users.id] }),
  items: many(schema.salesOrderItems),
  invoices: many(schema.invoices),
}));

export const salesOrderItemsRelations = relations(schema.salesOrderItems, ({ one }) => ({
  order: one(schema.salesOrders, { fields: [schema.salesOrderItems.orderId], references: [schema.salesOrders.id] }),
  product: one(schema.products, { fields: [schema.salesOrderItems.productId], references: [schema.products.id] }),
}));

export const invoicesRelations = relations(schema.invoices, ({ many, one }) => ({
  tenant: one(schema.tenants, { fields: [schema.invoices.tenantId], references: [schema.tenants.id] }),
  customer: one(schema.customers, { fields: [schema.invoices.customerId], references: [schema.customers.id] }),
  order: one(schema.salesOrders, { fields: [schema.invoices.orderId], references: [schema.salesOrders.id] }),
  createdBy: one(schema.users, { fields: [schema.invoices.createdBy], references: [schema.users.id] }),
  items: many(schema.invoiceItems),
  creditNotes: many(schema.creditNotes),
  customerPayments: many(schema.customerPayments),
}));

export const invoiceItemsRelations = relations(schema.invoiceItems, ({ one }) => ({
  invoice: one(schema.invoices, { fields: [schema.invoiceItems.invoiceId], references: [schema.invoices.id] }),
  product: one(schema.products, { fields: [schema.invoiceItems.productId], references: [schema.products.id] }),
}));

export const creditNotesRelations = relations(schema.creditNotes, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.creditNotes.tenantId], references: [schema.tenants.id] }),
  invoice: one(schema.invoices, { fields: [schema.creditNotes.invoiceId], references: [schema.invoices.id] }),
  customer: one(schema.customers, { fields: [schema.creditNotes.customerId], references: [schema.customers.id] }),
  createdBy: one(schema.users, { fields: [schema.creditNotes.createdBy], references: [schema.users.id] }),
}));

export const customerPaymentsRelations = relations(schema.customerPayments, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.customerPayments.tenantId], references: [schema.tenants.id] }),
  customer: one(schema.customers, { fields: [schema.customerPayments.customerId], references: [schema.customers.id] }),
  invoice: one(schema.invoices, { fields: [schema.customerPayments.invoiceId], references: [schema.invoices.id] }),
  bankAccount: one(schema.chartOfAccounts, { fields: [schema.customerPayments.bankAccountId], references: [schema.chartOfAccounts.id] }),
  createdBy: one(schema.users, { fields: [schema.customerPayments.createdBy], references: [schema.users.id] }),
}));

export const suppliersRelations = relations(schema.suppliers, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.suppliers.tenantId], references: [schema.tenants.id] }),
  purchaseOrders: many(schema.purchaseOrders),
  goodsReceivedNotes: many(schema.goodsReceivedNotes),
  supplierPayments: many(schema.supplierPayments),
}));

export const purchaseOrdersRelations = relations(schema.purchaseOrders, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.purchaseOrders.tenantId], references: [schema.tenants.id] }),
  supplier: one(schema.suppliers, { fields: [schema.purchaseOrders.supplierId], references: [schema.suppliers.id] }),
  createdBy: one(schema.users, { fields: [schema.purchaseOrders.createdBy], references: [schema.users.id] }),
  items: many(schema.purchaseOrderItems),
  goodsReceivedNotes: many(schema.goodsReceivedNotes),
}));

export const purchaseOrderItemsRelations = relations(schema.purchaseOrderItems, ({ one, many }) => ({
  po: one(schema.purchaseOrders, { fields: [schema.purchaseOrderItems.poId], references: [schema.purchaseOrders.id] }),
  product: one(schema.products, { fields: [schema.purchaseOrderItems.productId], references: [schema.products.id] }),
  grnItems: many(schema.grnItems),
}));

export const goodsReceivedNotesRelations = relations(schema.goodsReceivedNotes, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.goodsReceivedNotes.tenantId], references: [schema.tenants.id] }),
  po: one(schema.purchaseOrders, { fields: [schema.goodsReceivedNotes.poId], references: [schema.purchaseOrders.id] }),
  supplier: one(schema.suppliers, { fields: [schema.goodsReceivedNotes.supplierId], references: [schema.suppliers.id] }),
  warehouse: one(schema.warehouses, { fields: [schema.goodsReceivedNotes.warehouseId], references: [schema.warehouses.id] }),
  createdBy: one(schema.users, { fields: [schema.goodsReceivedNotes.createdBy], references: [schema.users.id] }),
  items: many(schema.grnItems),
}));

export const grnItemsRelations = relations(schema.grnItems, ({ one }) => ({
  grn: one(schema.goodsReceivedNotes, { fields: [schema.grnItems.grnId], references: [schema.goodsReceivedNotes.id] }),
  product: one(schema.products, { fields: [schema.grnItems.productId], references: [schema.products.id] }),
  poItem: one(schema.purchaseOrderItems, { fields: [schema.grnItems.poItemId], references: [schema.purchaseOrderItems.id] }),
}));

export const supplierPaymentsRelations = relations(schema.supplierPayments, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.supplierPayments.tenantId], references: [schema.tenants.id] }),
  supplier: one(schema.suppliers, { fields: [schema.supplierPayments.supplierId], references: [schema.suppliers.id] }),
  bankAccount: one(schema.chartOfAccounts, { fields: [schema.supplierPayments.bankAccountId], references: [schema.chartOfAccounts.id] }),
  createdBy: one(schema.users, { fields: [schema.supplierPayments.createdBy], references: [schema.users.id] }),
}));

export const leadsRelations = relations(schema.leads, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.leads.tenantId], references: [schema.tenants.id] }),
  assignedTo: one(schema.users, { fields: [schema.leads.assignedTo], references: [schema.users.id] }),
  createdBy: one(schema.users, { fields: [schema.leads.createdBy], references: [schema.users.id] }),
  opportunities: many(schema.opportunities),
}));

export const opportunitiesRelations = relations(schema.opportunities, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.opportunities.tenantId], references: [schema.tenants.id] }),
  lead: one(schema.leads, { fields: [schema.opportunities.leadId], references: [schema.leads.id] }),
  customer: one(schema.customers, { fields: [schema.opportunities.customerId], references: [schema.customers.id] }),
  assignedTo: one(schema.users, { fields: [schema.opportunities.assignedTo], references: [schema.users.id] }),
  createdBy: one(schema.users, { fields: [schema.opportunities.createdBy], references: [schema.users.id] }),
}));

export const crmActivitiesRelations = relations(schema.crmActivities, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.crmActivities.tenantId], references: [schema.tenants.id] }),
  assignedTo: one(schema.users, { fields: [schema.crmActivities.assignedTo], references: [schema.users.id] }),
  createdBy: one(schema.users, { fields: [schema.crmActivities.createdBy], references: [schema.users.id] }),
}));

export const departmentsRelations = relations(schema.departments, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.departments.tenantId], references: [schema.tenants.id] }),
  manager: one(schema.employees, { fields: [schema.departments.managerId], references: [schema.employees.id] }),
  parent: one(schema.departments, { fields: [schema.departments.parentId], references: [schema.departments.id] }),
  children: many(schema.departments),
  employees: many(schema.employees),
}));

export const designationsRelations = relations(schema.designations, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.designations.tenantId], references: [schema.tenants.id] }),
  employees: many(schema.employees),
}));

export const employeesRelations = relations(schema.employees, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.employees.tenantId], references: [schema.tenants.id] }),
  department: one(schema.departments, { fields: [schema.employees.departmentId], references: [schema.departments.id] }),
  designation: one(schema.designations, { fields: [schema.employees.designationId], references: [schema.designations.id] }),
  manager: one(schema.employees, { fields: [schema.employees.managerId], references: [schema.employees.id] }),
  subordinates: many(schema.employees),
  managedDepartments: many(schema.departments),
  attendance: many(schema.attendance),
  leaveRequests: many(schema.leaveRequests),
  salarySlips: many(schema.salarySlips),
  employeeLoans: many(schema.employeeLoans),
  advances: many(schema.advances),
  performanceReviews: many(schema.performanceReviews),
  timesheets: many(schema.timesheets),
  driver: many(schema.drivers),
  managedProjects: many(schema.projects),
}));

export const attendanceRelations = relations(schema.attendance, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.attendance.tenantId], references: [schema.tenants.id] }),
  employee: one(schema.employees, { fields: [schema.attendance.employeeId], references: [schema.employees.id] }),
}));

export const leaveTypesRelations = relations(schema.leaveTypes, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.leaveTypes.tenantId], references: [schema.tenants.id] }),
  leaveRequests: many(schema.leaveRequests),
}));

export const leaveRequestsRelations = relations(schema.leaveRequests, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.leaveRequests.tenantId], references: [schema.tenants.id] }),
  employee: one(schema.employees, { fields: [schema.leaveRequests.employeeId], references: [schema.employees.id] }),
  leaveType: one(schema.leaveTypes, { fields: [schema.leaveRequests.leaveTypeId], references: [schema.leaveTypes.id] }),
  approvedBy: one(schema.employees, { fields: [schema.leaveRequests.approvedBy], references: [schema.employees.id] }),
}));

export const payrollPeriodsRelations = relations(schema.payrollPeriods, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.payrollPeriods.tenantId], references: [schema.tenants.id] }),
  salarySlips: many(schema.salarySlips),
}));

export const salarySlipsRelations = relations(schema.salarySlips, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.salarySlips.tenantId], references: [schema.tenants.id] }),
  payrollPeriod: one(schema.payrollPeriods, { fields: [schema.salarySlips.payrollPeriodId], references: [schema.payrollPeriods.id] }),
  employee: one(schema.employees, { fields: [schema.salarySlips.employeeId], references: [schema.employees.id] }),
}));

export const employeeLoansRelations = relations(schema.employeeLoans, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.employeeLoans.tenantId], references: [schema.tenants.id] }),
  employee: one(schema.employees, { fields: [schema.employeeLoans.employeeId], references: [schema.employees.id] }),
  approvedBy: one(schema.employees, { fields: [schema.employeeLoans.approvedBy], references: [schema.employees.id] }),
}));

export const advancesRelations = relations(schema.advances, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.advances.tenantId], references: [schema.tenants.id] }),
  employee: one(schema.employees, { fields: [schema.advances.employeeId], references: [schema.employees.id] }),
  approvedBy: one(schema.employees, { fields: [schema.advances.approvedBy], references: [schema.employees.id] }),
}));

export const performanceReviewsRelations = relations(schema.performanceReviews, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.performanceReviews.tenantId], references: [schema.tenants.id] }),
  employee: one(schema.employees, { fields: [schema.performanceReviews.employeeId], references: [schema.employees.id] }),
  reviewedBy: one(schema.employees, { fields: [schema.performanceReviews.reviewedBy], references: [schema.employees.id] }),
}));

export const billOfMaterialsRelations = relations(schema.billOfMaterials, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.billOfMaterials.tenantId], references: [schema.tenants.id] }),
  product: one(schema.products, { fields: [schema.billOfMaterials.productId], references: [schema.products.id] }),
  bomItems: many(schema.bomItems),
  workOrders: many(schema.workOrders),
}));

export const bomItemsRelations = relations(schema.bomItems, ({ one }) => ({
  bom: one(schema.billOfMaterials, { fields: [schema.bomItems.bomId], references: [schema.billOfMaterials.id] }),
  product: one(schema.products, { fields: [schema.bomItems.productId], references: [schema.products.id] }),
}));

export const workOrdersRelations = relations(schema.workOrders, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.workOrders.tenantId], references: [schema.tenants.id] }),
  bom: one(schema.billOfMaterials, { fields: [schema.workOrders.bomId], references: [schema.billOfMaterials.id] }),
  product: one(schema.products, { fields: [schema.workOrders.productId], references: [schema.products.id] }),
  createdBy: one(schema.users, { fields: [schema.workOrders.createdBy], references: [schema.users.id] }),
  productionOrders: many(schema.productionOrders),
}));

export const productionOrdersRelations = relations(schema.productionOrders, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.productionOrders.tenantId], references: [schema.tenants.id] }),
  workOrder: one(schema.workOrders, { fields: [schema.productionOrders.workOrderId], references: [schema.workOrders.id] }),
  warehouse: one(schema.warehouses, { fields: [schema.productionOrders.warehouseId], references: [schema.warehouses.id] }),
  createdBy: one(schema.users, { fields: [schema.productionOrders.createdBy], references: [schema.users.id] }),
  items: many(schema.productionItems),
}));

export const productionItemsRelations = relations(schema.productionItems, ({ one }) => ({
  productionOrder: one(schema.productionOrders, { fields: [schema.productionItems.productionOrderId], references: [schema.productionOrders.id] }),
  product: one(schema.products, { fields: [schema.productionItems.productId], references: [schema.products.id] }),
}));

export const projectsRelations = relations(schema.projects, ({ many, one }) => ({
  tenant: one(schema.tenants, { fields: [schema.projects.tenantId], references: [schema.tenants.id] }),
  customer: one(schema.customers, { fields: [schema.projects.customerId], references: [schema.customers.id] }),
  manager: one(schema.employees, { fields: [schema.projects.managerId], references: [schema.employees.id] }),
  createdBy: one(schema.users, { fields: [schema.projects.createdBy], references: [schema.users.id] }),
  tasks: many(schema.projectTasks),
  milestones: many(schema.projectMilestones),
  timesheets: many(schema.timesheets),
}));

export const projectTasksRelations = relations(schema.projectTasks, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.projectTasks.tenantId], references: [schema.tenants.id] }),
  project: one(schema.projects, { fields: [schema.projectTasks.projectId], references: [schema.projects.id] }),
  parent: one(schema.projectTasks, { fields: [schema.projectTasks.parentId], references: [schema.projectTasks.id] }),
  children: many(schema.projectTasks),
  assignedTo: one(schema.users, { fields: [schema.projectTasks.assignedTo], references: [schema.users.id] }),
  timesheets: many(schema.timesheets),
}));

export const projectMilestonesRelations = relations(schema.projectMilestones, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.projectMilestones.tenantId], references: [schema.tenants.id] }),
  project: one(schema.projects, { fields: [schema.projectMilestones.projectId], references: [schema.projects.id] }),
}));

export const timesheetsRelations = relations(schema.timesheets, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.timesheets.tenantId], references: [schema.tenants.id] }),
  employee: one(schema.employees, { fields: [schema.timesheets.employeeId], references: [schema.employees.id] }),
  project: one(schema.projects, { fields: [schema.timesheets.projectId], references: [schema.projects.id] }),
  task: one(schema.projectTasks, { fields: [schema.timesheets.taskId], references: [schema.projectTasks.id] }),
}));

export const supportTicketsRelations = relations(schema.supportTickets, ({ many, one }) => ({
  tenant: one(schema.tenants, { fields: [schema.supportTickets.tenantId], references: [schema.tenants.id] }),
  assignedTo: one(schema.users, { fields: [schema.supportTickets.assignedTo], references: [schema.users.id] }),
  createdBy: one(schema.users, { fields: [schema.supportTickets.createdBy], references: [schema.users.id] }),
  comments: many(schema.ticketComments),
}));

export const ticketCommentsRelations = relations(schema.ticketComments, ({ one }) => ({
  ticket: one(schema.supportTickets, { fields: [schema.ticketComments.ticketId], references: [schema.supportTickets.id] }),
  user: one(schema.users, { fields: [schema.ticketComments.userId], references: [schema.users.id] }),
}));

export const assetsRelations = relations(schema.assets, ({ many, one }) => ({
  tenant: one(schema.tenants, { fields: [schema.assets.tenantId], references: [schema.tenants.id] }),
  assignedTo: one(schema.users, { fields: [schema.assets.assignedTo], references: [schema.users.id] }),
  maintenance: many(schema.assetMaintenance),
  depreciation: many(schema.depreciationEntries),
}));

export const assetMaintenanceRelations = relations(schema.assetMaintenance, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.assetMaintenance.tenantId], references: [schema.tenants.id] }),
  asset: one(schema.assets, { fields: [schema.assetMaintenance.assetId], references: [schema.assets.id] }),
}));

export const depreciationEntriesRelations = relations(schema.depreciationEntries, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.depreciationEntries.tenantId], references: [schema.tenants.id] }),
  asset: one(schema.assets, { fields: [schema.depreciationEntries.assetId], references: [schema.assets.id] }),
  journalEntry: one(schema.journalEntries, { fields: [schema.depreciationEntries.journalEntryId], references: [schema.journalEntries.id] }),
}));

export const vehiclesRelations = relations(schema.vehicles, ({ many, one }) => ({
  tenant: one(schema.tenants, { fields: [schema.vehicles.tenantId], references: [schema.tenants.id] }),
  assignedDriver: one(schema.drivers, { fields: [schema.vehicles.assignedDriverId], references: [schema.drivers.id] }),
  fuelRecords: many(schema.fuelRecords),
  maintenance: many(schema.vehicleMaintenance),
}));

export const fuelRecordsRelations = relations(schema.fuelRecords, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.fuelRecords.tenantId], references: [schema.tenants.id] }),
  vehicle: one(schema.vehicles, { fields: [schema.fuelRecords.vehicleId], references: [schema.vehicles.id] }),
}));

export const vehicleMaintenanceRelations = relations(schema.vehicleMaintenance, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.vehicleMaintenance.tenantId], references: [schema.tenants.id] }),
  vehicle: one(schema.vehicles, { fields: [schema.vehicleMaintenance.vehicleId], references: [schema.vehicles.id] }),
}));

export const driversRelations = relations(schema.drivers, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.drivers.tenantId], references: [schema.tenants.id] }),
  employee: one(schema.employees, { fields: [schema.drivers.employeeId], references: [schema.employees.id] }),
  vehicles: many(schema.vehicles),
}));

export const documentCategoriesRelations = relations(schema.documentCategories, ({ one, many }) => ({
  tenant: one(schema.tenants, { fields: [schema.documentCategories.tenantId], references: [schema.tenants.id] }),
  parent: one(schema.documentCategories, { fields: [schema.documentCategories.parentId], references: [schema.documentCategories.id] }),
  children: many(schema.documentCategories),
  documents: many(schema.documents),
}));

export const documentsRelations = relations(schema.documents, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.documents.tenantId], references: [schema.tenants.id] }),
  category: one(schema.documentCategories, { fields: [schema.documents.categoryId], references: [schema.documentCategories.id] }),
  uploadedBy: one(schema.users, { fields: [schema.documents.uploadedBy], references: [schema.users.id] }),
}));

export const companySettingsRelations = relations(schema.companySettings, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.companySettings.tenantId], references: [schema.tenants.id] }),
}));

export const taxRatesRelations = relations(schema.taxRates, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.taxRates.tenantId], references: [schema.tenants.id] }),
}));

export const currenciesRelations = relations(schema.currencies, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.currencies.tenantId], references: [schema.tenants.id] }),
}));

export const auditLogsRelations = relations(schema.auditLogs, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.auditLogs.tenantId], references: [schema.tenants.id] }),
  user: one(schema.users, { fields: [schema.auditLogs.userId], references: [schema.users.id] }),
}));

export const notificationsRelations = relations(schema.notifications, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.notifications.tenantId], references: [schema.tenants.id] }),
  user: one(schema.users, { fields: [schema.notifications.userId], references: [schema.users.id] }),
}));

export const resellerKeyLimitsRelations = relations(schema.resellerKeyLimits, ({ one }) => ({
  reseller: one(schema.users, { fields: [schema.resellerKeyLimits.resellerUserId], references: [schema.users.id] }),
  setter: one(schema.users, { fields: [schema.resellerKeyLimits.setBy], references: [schema.users.id] }),
}));

export const resellerLicenseKeysRelations = relations(schema.resellerLicenseKeys, ({ one }) => ({
  reseller: one(schema.users, { fields: [schema.resellerLicenseKeys.resellerUserId], references: [schema.users.id] }),
  approver: one(schema.users, { fields: [schema.resellerLicenseKeys.approvedBy], references: [schema.users.id] }),
  tenant: one(schema.tenants, { fields: [schema.resellerLicenseKeys.tenantId], references: [schema.tenants.id] }),
}));

export const invoiceThemesRelations = relations(schema.invoiceThemes, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.invoiceThemes.tenantId], references: [schema.tenants.id] }),
}));

export const companyStampsRelations = relations(schema.companyStamps, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.companyStamps.tenantId], references: [schema.tenants.id] }),
}));

export const countryTaxConfigsRelations = relations(schema.countryTaxConfigs, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.countryTaxConfigs.tenantId], references: [schema.tenants.id] }),
}));

export const invoiceTaxSettingsRelations = relations(schema.invoiceTaxSettings, ({ one }) => ({
  tenant: one(schema.tenants, { fields: [schema.invoiceTaxSettings.tenantId], references: [schema.tenants.id] }),
}));
