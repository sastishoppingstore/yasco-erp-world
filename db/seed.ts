import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

const DEMO_TENANT_ID = 1;

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // 1. Seed Chart of Accounts
  const coaData = [
    { tenantId: DEMO_TENANT_ID, code: "1000", name: "Assets", accountType: "asset" as const, accountCategory: "current_asset" as const, level: 1 },
    { tenantId: DEMO_TENANT_ID, code: "1100", name: "Current Assets", accountType: "asset" as const, accountCategory: "current_asset" as const, parentId: 1, level: 2 },
    { tenantId: DEMO_TENANT_ID, code: "1110", name: "Cash in Hand", accountType: "asset" as const, accountCategory: "current_asset" as const, parentId: 2, level: 3, isCashAccount: true, openingBalance: "50000" },
    { tenantId: DEMO_TENANT_ID, code: "1120", name: "Bank Account - Al Rajhi", accountType: "asset" as const, accountCategory: "current_asset" as const, parentId: 2, level: 3, isBankAccount: true, bankName: "Al Rajhi Bank", bankAccountNumber: "SA0380000000608010167519", openingBalance: "250000" },
    { tenantId: DEMO_TENANT_ID, code: "1130", name: "Accounts Receivable", accountType: "asset" as const, accountCategory: "current_asset" as const, parentId: 2, level: 3, openingBalance: "125000" },
    { tenantId: DEMO_TENANT_ID, code: "1140", name: "Inventory", accountType: "asset" as const, accountCategory: "current_asset" as const, parentId: 2, level: 3, openingBalance: "180000" },
    { tenantId: DEMO_TENANT_ID, code: "1200", name: "Fixed Assets", accountType: "asset" as const, accountCategory: "fixed_asset" as const, parentId: 1, level: 2 },
    { tenantId: DEMO_TENANT_ID, code: "1210", name: "Building", accountType: "asset" as const, accountCategory: "fixed_asset" as const, parentId: 7, level: 3, openingBalance: "500000" },
    { tenantId: DEMO_TENANT_ID, code: "1220", name: "Equipment", accountType: "asset" as const, accountCategory: "fixed_asset" as const, parentId: 7, level: 3, openingBalance: "150000" },
    { tenantId: DEMO_TENANT_ID, code: "1230", name: "Vehicles", accountType: "asset" as const, accountCategory: "fixed_asset" as const, parentId: 7, level: 3, openingBalance: "200000" },
    { tenantId: DEMO_TENANT_ID, code: "2000", name: "Liabilities", accountType: "liability" as const, accountCategory: "current_liability" as const, level: 1 },
    { tenantId: DEMO_TENANT_ID, code: "2100", name: "Accounts Payable", accountType: "liability" as const, accountCategory: "current_liability" as const, parentId: 11, level: 2, openingBalance: "85000" },
    { tenantId: DEMO_TENANT_ID, code: "2200", name: "VAT Payable", accountType: "liability" as const, accountCategory: "current_liability" as const, parentId: 11, level: 2, openingBalance: "22500" },
    { tenantId: DEMO_TENANT_ID, code: "2300", name: "Salaries Payable", accountType: "liability" as const, accountCategory: "current_liability" as const, parentId: 11, level: 2, openingBalance: "120000" },
    { tenantId: DEMO_TENANT_ID, code: "3000", name: "Equity", accountType: "equity" as const, accountCategory: "equity" as const, level: 1 },
    { tenantId: DEMO_TENANT_ID, code: "3100", name: "Capital", accountType: "equity" as const, accountCategory: "equity" as const, parentId: 15, level: 2, openingBalance: "800000" },
    { tenantId: DEMO_TENANT_ID, code: "3200", name: "Retained Earnings", accountType: "equity" as const, accountCategory: "equity" as const, parentId: 15, level: 2, openingBalance: "245500" },
    { tenantId: DEMO_TENANT_ID, code: "4000", name: "Revenue", accountType: "revenue" as const, accountCategory: "revenue" as const, level: 1 },
    { tenantId: DEMO_TENANT_ID, code: "4100", name: "Sales Revenue", accountType: "revenue" as const, accountCategory: "revenue" as const, parentId: 18, level: 2, openingBalance: "0" },
    { tenantId: DEMO_TENANT_ID, code: "4200", name: "Service Revenue", accountType: "revenue" as const, accountCategory: "revenue" as const, parentId: 18, level: 2, openingBalance: "0" },
    { tenantId: DEMO_TENANT_ID, code: "5000", name: "Expenses", accountType: "expense" as const, accountCategory: "expense" as const, level: 1 },
    { tenantId: DEMO_TENANT_ID, code: "5100", name: "Cost of Goods Sold", accountType: "expense" as const, accountCategory: "cogs" as const, parentId: 21, level: 2, openingBalance: "0" },
    { tenantId: DEMO_TENANT_ID, code: "5200", name: "Rent Expense", accountType: "expense" as const, accountCategory: "expense" as const, parentId: 21, level: 2, openingBalance: "0" },
    { tenantId: DEMO_TENANT_ID, code: "5300", name: "Salaries Expense", accountType: "expense" as const, accountCategory: "expense" as const, parentId: 21, level: 2, openingBalance: "0" },
    { tenantId: DEMO_TENANT_ID, code: "5400", name: "Utilities Expense", accountType: "expense" as const, accountCategory: "expense" as const, parentId: 21, level: 2, openingBalance: "0" },
    { tenantId: DEMO_TENANT_ID, code: "5500", name: "Marketing Expense", accountType: "expense" as const, accountCategory: "expense" as const, parentId: 21, level: 2, openingBalance: "0" },
  ];

  for (const coa of coaData) {
    await db.insert(schema.chartOfAccounts).values(coa);
  }
  console.log("Chart of Accounts seeded");

  // 2. Seed Product Categories
  const categories = [
    { tenantId: DEMO_TENANT_ID, name: "Electronics", description: "Electronic devices and accessories" },
    { tenantId: DEMO_TENANT_ID, name: "Furniture", description: "Office and home furniture" },
    { tenantId: DEMO_TENANT_ID, name: "Raw Materials", description: "Manufacturing raw materials" },
    { tenantId: DEMO_TENANT_ID, name: "Finished Goods", description: "Completed products for sale" },
    { tenantId: DEMO_TENANT_ID, name: "Services", description: "Service offerings" },
  ];
  for (const cat of categories) {
    await db.insert(schema.productCategories).values(cat);
  }

  // 3. Seed Brands
  const brands = [
    { tenantId: DEMO_TENANT_ID, name: "Samsung" },
    { tenantId: DEMO_TENANT_ID, name: "Apple" },
    { tenantId: DEMO_TENANT_ID, name: "Sony" },
    { tenantId: DEMO_TENANT_ID, name: "LG" },
    { tenantId: DEMO_TENANT_ID, name: "Generic" },
  ];
  for (const brand of brands) {
    await db.insert(schema.brands).values(brand);
  }

  // 4. Seed Units
  const units = [
    { tenantId: DEMO_TENANT_ID, name: "Piece", symbol: "pc", conversionFactor: "1" },
    { tenantId: DEMO_TENANT_ID, name: "Kilogram", symbol: "kg", conversionFactor: "1" },
    { tenantId: DEMO_TENANT_ID, name: "Meter", symbol: "m", conversionFactor: "1" },
    { tenantId: DEMO_TENANT_ID, name: "Box", symbol: "box", conversionFactor: "12" },
    { tenantId: DEMO_TENANT_ID, name: "Liter", symbol: "L", conversionFactor: "1" },
  ];
  for (const unit of units) {
    await db.insert(schema.units).values(unit);
  }

  // 5. Seed Warehouses
  const warehouses = [
    { tenantId: DEMO_TENANT_ID, code: "WH-001", name: "Main Warehouse Riyadh", address: "King Fahd Road, Riyadh", isPrimary: true },
    { tenantId: DEMO_TENANT_ID, code: "WH-002", name: "Jeddah Branch", address: "Tahlia Street, Jeddah" },
    { tenantId: DEMO_TENANT_ID, code: "WH-003", name: "Dammam Warehouse", address: "King Saud Street, Dammam" },
  ];
  for (const wh of warehouses) {
    await db.insert(schema.warehouses).values(wh);
  }

  // 6. Seed Products
  const products = [
    { tenantId: DEMO_TENANT_ID, sku: "PROD-001", name: "Samsung Galaxy S24", categoryId: 1, brandId: 1, unitId: 1, productType: "goods" as const, purchasePrice: "2800", salePrice: "3500", costMethod: "fifo" as const, reorderLevel: 10, barcode: "8806095012345" },
    { tenantId: DEMO_TENANT_ID, sku: "PROD-002", name: "iPhone 15 Pro", categoryId: 1, brandId: 2, unitId: 1, productType: "goods" as const, purchasePrice: "3800", salePrice: "4800", costMethod: "fifo" as const, reorderLevel: 8, barcode: "194253401234" },
    { tenantId: DEMO_TENANT_ID, sku: "PROD-003", name: "Sony WH-1000XM5", categoryId: 1, brandId: 3, unitId: 1, productType: "goods" as const, purchasePrice: "900", salePrice: "1200", costMethod: "weighted_average" as const, reorderLevel: 15, barcode: "4548736123456" },
    { tenantId: DEMO_TENANT_ID, sku: "PROD-004", name: "LG OLED 55\" TV", categoryId: 1, brandId: 4, unitId: 1, productType: "goods" as const, purchasePrice: "3200", salePrice: "4200", costMethod: "fifo" as const, reorderLevel: 5, barcode: "8806098765432" },
    { tenantId: DEMO_TENANT_ID, sku: "PROD-005", name: "Office Desk", categoryId: 2, brandId: 5, unitId: 1, productType: "goods" as const, purchasePrice: "450", salePrice: "650", costMethod: "fifo" as const, reorderLevel: 8, barcode: "DESK0012345" },
    { tenantId: DEMO_TENANT_ID, sku: "PROD-006", name: "Steel Sheet 2mm", categoryId: 3, brandId: 5, unitId: 2, productType: "raw_material" as const, purchasePrice: "25", salePrice: "35", costMethod: "weighted_average" as const, reorderLevel: 100, barcode: "STEEL123456" },
    { tenantId: DEMO_TENANT_ID, sku: "PROD-007", name: "Premium Consulting Service", categoryId: 5, brandId: 5, unitId: 1, productType: "service" as const, purchasePrice: "0", salePrice: "500", costMethod: "fifo" as const, reorderLevel: 0 },
  ];
  for (const prod of products) {
    await db.insert(schema.products).values(prod);
  }

  // 7. Seed Inventory Balances
  const invBalances = [
    { tenantId: DEMO_TENANT_ID, productId: 1, warehouseId: 1, quantity: 45, avgCost: "2800", totalValue: "126000" },
    { tenantId: DEMO_TENANT_ID, productId: 1, warehouseId: 2, quantity: 20, avgCost: "2800", totalValue: "56000" },
    { tenantId: DEMO_TENANT_ID, productId: 2, warehouseId: 1, quantity: 32, avgCost: "3800", totalValue: "121600" },
    { tenantId: DEMO_TENANT_ID, productId: 3, warehouseId: 1, quantity: 60, avgCost: "900", totalValue: "54000" },
    { tenantId: DEMO_TENANT_ID, productId: 4, warehouseId: 1, quantity: 15, avgCost: "3200", totalValue: "48000" },
    { tenantId: DEMO_TENANT_ID, productId: 4, warehouseId: 2, quantity: 8, avgCost: "3200", totalValue: "25600" },
    { tenantId: DEMO_TENANT_ID, productId: 5, warehouseId: 1, quantity: 25, avgCost: "450", totalValue: "11250" },
    { tenantId: DEMO_TENANT_ID, productId: 6, warehouseId: 1, quantity: 500, avgCost: "25", totalValue: "12500" },
    { tenantId: DEMO_TENANT_ID, productId: 6, warehouseId: 3, quantity: 300, avgCost: "25", totalValue: "7500" },
  ];
  for (const bal of invBalances) {
    await db.insert(schema.inventoryBalances).values(bal);
  }

  // 8. Seed Customers
  const customers = [
    { tenantId: DEMO_TENANT_ID, code: "CUST-001", name: "Abdullah Trading Co.", email: "info@abdullahtrading.sa", phone: "+966-11-456-7890", address: "Olaya District, Riyadh", city: "Riyadh", creditLimit: "500000", paymentTerms: 30 },
    { tenantId: DEMO_TENANT_ID, code: "CUST-002", name: "Al Faisal Holdings", email: "accounts@alfaisal.com", phone: "+966-12-654-3210", address: "Al Balad, Jeddah", city: "Jeddah", creditLimit: "1000000", paymentTerms: 45 },
    { tenantId: DEMO_TENANT_ID, code: "CUST-003", name: "Saudi Electronics Ltd", email: "procurement@saudielec.sa", phone: "+966-13-789-4561", address: "Industrial Area, Dammam", city: "Dammam", creditLimit: "300000", paymentTerms: 30 },
    { tenantId: DEMO_TENANT_ID, code: "CUST-004", name: "Modern Furniture Co.", email: "sales@modernfurniture.sa", phone: "+966-11-234-5678", address: "Al Mohammadiyah, Riyadh", city: "Riyadh", creditLimit: "200000", paymentTerms: 15 },
    { tenantId: DEMO_TENANT_ID, code: "CUST-005", name: "Gulf Consulting Group", email: "contact@gulfconsulting.sa", phone: "+966-11-876-5432", address: "King Fahd Road, Riyadh", city: "Riyadh", creditLimit: "150000", paymentTerms: 15 },
  ];
  for (const cust of customers) {
    await db.insert(schema.customers).values(cust);
  }

  // 9. Seed Suppliers
  const suppliers = [
    { tenantId: DEMO_TENANT_ID, code: "SUP-001", name: "Samsung Saudi Arabia", email: "b2b@samsung.sa", phone: "+966-11-200-1234", address: "King Fahd Road, Riyadh", city: "Riyadh", creditLimit: "2000000", paymentTerms: 60 },
    { tenantId: DEMO_TENANT_ID, code: "SUP-002", name: "Apple Authorized Reseller KSA", email: "orders@appleksa.com", phone: "+966-12-345-6789", address: "Tahlia Street, Jeddah", city: "Jeddah", creditLimit: "1500000", paymentTerms: 45 },
    { tenantId: DEMO_TENANT_ID, code: "SUP-003", name: "Sony Middle East", email: "sales@sonyme.com", phone: "+966-11-567-8901", address: "Olaya District, Riyadh", city: "Riyadh", creditLimit: "800000", paymentTerms: 30 },
    { tenantId: DEMO_TENANT_ID, code: "SUP-004", name: "Steel Industries Co.", email: "sales@steelindustries.sa", phone: "+966-13-456-7890", address: "2nd Industrial City, Dammam", city: "Dammam", creditLimit: "500000", paymentTerms: 30 },
    { tenantId: DEMO_TENANT_ID, code: "SUP-005", name: "LG Electronics KSA", email: "business@lgksa.com", phone: "+966-11-789-0123", address: "Al Worood, Riyadh", city: "Riyadh", creditLimit: "1000000", paymentTerms: 45 },
  ];
  for (const sup of suppliers) {
    await db.insert(schema.suppliers).values(sup);
  }

  // 10. Seed Departments
  const departments = [
    { tenantId: DEMO_TENANT_ID, name: "Administration", description: "Executive and admin functions" },
    { tenantId: DEMO_TENANT_ID, name: "Finance", description: "Accounting and finance" },
    { tenantId: DEMO_TENANT_ID, name: "Sales", description: "Sales and customer relations" },
    { tenantId: DEMO_TENANT_ID, name: "Procurement", description: "Purchasing and inventory" },
    { tenantId: DEMO_TENANT_ID, name: "Human Resources", description: "HR and personnel" },
    { tenantId: DEMO_TENANT_ID, name: "IT Department", description: "Information technology" },
    { tenantId: DEMO_TENANT_ID, name: "Production", description: "Manufacturing and production" },
    { tenantId: DEMO_TENANT_ID, name: "Quality Control", description: "Quality assurance" },
  ];
  for (const dept of departments) {
    await db.insert(schema.departments).values(dept);
  }

  // 11. Seed Designations
  const designations = [
    { tenantId: DEMO_TENANT_ID, name: "General Manager" },
    { tenantId: DEMO_TENANT_ID, name: "Finance Manager" },
    { tenantId: DEMO_TENANT_ID, name: "Sales Manager" },
    { tenantId: DEMO_TENANT_ID, name: "Accountant" },
    { tenantId: DEMO_TENANT_ID, name: "Sales Executive" },
    { tenantId: DEMO_TENANT_ID, name: "HR Manager" },
    { tenantId: DEMO_TENANT_ID, name: "IT Specialist" },
    { tenantId: DEMO_TENANT_ID, name: "Warehouse Supervisor" },
    { tenantId: DEMO_TENANT_ID, name: "Production Manager" },
    { tenantId: DEMO_TENANT_ID, name: "Quality Inspector" },
  ];
  for (const desig of designations) {
    await db.insert(schema.designations).values(desig);
  }

  // 12. Seed Employees
  const employees = [
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-001", firstName: "Mohammed", lastName: "Al-Rashid", email: "m.alrashid@company.sa", phone: "+966-55-123-4567", gender: "male" as const, hireDate: "2020-01-15", departmentId: 1, designationId: 1, employmentType: "full_time" as const, basicSalary: "25000", housingAllowance: "8000", transportAllowance: "2500", otherAllowance: "2000" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-002", firstName: "Fatima", lastName: "Al-Zahra", email: "f.alzahra@company.sa", phone: "+966-56-234-5678", gender: "female" as const, hireDate: "2020-03-01", departmentId: 2, designationId: 2, employmentType: "full_time" as const, basicSalary: "18000", housingAllowance: "6000", transportAllowance: "2000", otherAllowance: "1500" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-003", firstName: "Omar", lastName: "Hassan", email: "o.hassan@company.sa", phone: "+966-55-345-6789", gender: "male" as const, hireDate: "2021-02-10", departmentId: 3, designationId: 3, employmentType: "full_time" as const, basicSalary: "16000", housingAllowance: "5500", transportAllowance: "2000", otherAllowance: "1500" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-004", firstName: "Aisha", lastName: "Khan", email: "a.khan@company.sa", phone: "+966-56-456-7890", gender: "female" as const, hireDate: "2021-06-15", departmentId: 2, designationId: 4, employmentType: "full_time" as const, basicSalary: "9000", housingAllowance: "4000", transportAllowance: "1500", otherAllowance: "1000" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-005", firstName: "Khalid", lastName: "Al-Farsi", email: "k.alfarsi@company.sa", phone: "+966-55-567-8901", gender: "male" as const, hireDate: "2022-01-20", departmentId: 3, designationId: 5, employmentType: "full_time" as const, basicSalary: "8000", housingAllowance: "3500", transportAllowance: "1500", otherAllowance: "800" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-006", firstName: "Sara", lastName: "Al-Otaibi", email: "s.alotaibi@company.sa", phone: "+966-56-678-9012", gender: "female" as const, hireDate: "2022-04-01", departmentId: 5, designationId: 6, employmentType: "full_time" as const, basicSalary: "14000", housingAllowance: "5000", transportAllowance: "2000", otherAllowance: "1500" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-007", firstName: "Ahmed", lastName: "Saeed", email: "a.saeed@company.sa", phone: "+966-55-789-0123", gender: "male" as const, hireDate: "2022-08-15", departmentId: 6, designationId: 7, employmentType: "full_time" as const, basicSalary: "12000", housingAllowance: "4500", transportAllowance: "1500", otherAllowance: "1000" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-008", firstName: "Noor", lastName: "Al-Qasimi", email: "n.alqasimi@company.sa", phone: "+966-56-890-1234", gender: "female" as const, hireDate: "2023-01-10", departmentId: 4, designationId: 8, employmentType: "full_time" as const, basicSalary: "8500", housingAllowance: "3500", transportAllowance: "1200", otherAllowance: "800" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-009", firstName: "Yusuf", lastName: "Al-Mutairi", email: "y.almutairi@company.sa", phone: "+966-55-901-2345", gender: "male" as const, hireDate: "2023-03-01", departmentId: 7, designationId: 9, employmentType: "full_time" as const, basicSalary: "15000", housingAllowance: "5500", transportAllowance: "2000", otherAllowance: "1500" },
    { tenantId: DEMO_TENANT_ID, employeeCode: "EMP-010", firstName: "Lina", lastName: "Al-Harbi", email: "l.alharbi@company.sa", phone: "+966-56-012-3456", gender: "female" as const, hireDate: "2023-06-01", departmentId: 8, designationId: 10, employmentType: "full_time" as const, basicSalary: "8500", housingAllowance: "3500", transportAllowance: "1200", otherAllowance: "800" },
  ];
  for (const emp of employees) {
    await db.insert(schema.employees).values(emp);
  }

  // 13. Seed Leave Types
  const leaveTypes = [
    { tenantId: DEMO_TENANT_ID, name: "Annual Leave", daysAllowed: 30, isPaid: true, description: "Standard annual leave entitlement" },
    { tenantId: DEMO_TENANT_ID, name: "Sick Leave", daysAllowed: 15, isPaid: true, description: "Medical leave with certificate" },
    { tenantId: DEMO_TENANT_ID, name: "Emergency Leave", daysAllowed: 5, isPaid: true, description: "Unplanned emergency situations" },
    { tenantId: DEMO_TENANT_ID, name: "Unpaid Leave", daysAllowed: 90, isPaid: false, description: "Extended leave without pay" },
    { tenantId: DEMO_TENANT_ID, name: "Hajj Leave", daysAllowed: 10, isPaid: true, description: "Pilgrimage leave - once every 5 years" },
  ];
  for (const lt of leaveTypes) {
    await db.insert(schema.leaveTypes).values(lt);
  }

  // 14. Seed Cost Centers
  const costCenters = [
    { tenantId: DEMO_TENANT_ID, code: "CC-001", name: "Head Office Riyadh", description: "Main corporate office", budgetAmount: "500000" },
    { tenantId: DEMO_TENANT_ID, code: "CC-002", name: "Jeddah Branch", description: "Western region operations", budgetAmount: "300000" },
    { tenantId: DEMO_TENANT_ID, code: "CC-003", name: "Dammam Branch", description: "Eastern region operations", budgetAmount: "250000" },
    { tenantId: DEMO_TENANT_ID, code: "CC-004", name: "Production Facility", description: "Manufacturing operations", budgetAmount: "800000" },
    { tenantId: DEMO_TENANT_ID, code: "CC-005", name: "IT Operations", description: "Technology infrastructure", budgetAmount: "200000" },
  ];
  for (const cc of costCenters) {
    await db.insert(schema.costCenters).values(cc);
  }

  // 15. Seed Fiscal Year
  await db.insert(schema.fiscalYears).values({
    tenantId: DEMO_TENANT_ID,
    name: "FY 2025-2026",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isClosed: false,
  });

  // 16. Seed Journal Entries
  const journalEntries = [
    { tenantId: DEMO_TENANT_ID, entryNumber: "JE-00001", date: "2025-01-15", reference: "INV-00001", referenceType: "invoice" as const, description: "Sales to Abdullah Trading", totalDebit: "3500", totalCredit: "3500", isPosted: true },
    { tenantId: DEMO_TENANT_ID, entryNumber: "JE-00002", date: "2025-01-20", reference: "PAY-00001", referenceType: "payment" as const, description: "Received payment from customer", totalDebit: "3500", totalCredit: "3500", isPosted: true },
    { tenantId: DEMO_TENANT_ID, entryNumber: "JE-00003", date: "2025-02-01", reference: "SAL-00001", referenceType: "other" as const, description: "Monthly salary accrual", totalDebit: "95000", totalCredit: "95000", isPosted: true },
    { tenantId: DEMO_TENANT_ID, entryNumber: "JE-00004", date: "2025-02-10", reference: "INV-00002", referenceType: "invoice" as const, description: "Sales to Al Faisal Holdings", totalDebit: "12000", totalCredit: "12000", isPosted: true },
    { tenantId: DEMO_TENANT_ID, entryNumber: "JE-00005", date: "2025-03-01", reference: "ADJ-00001", referenceType: "adjustment" as const, description: "Inventory adjustment", totalDebit: "2500", totalCredit: "2500", isPosted: true },
  ];
  for (const je of journalEntries) {
    await db.insert(schema.journalEntries).values(je);
  }

  // 17. Seed Journal Entry Lines
  const jeLines = [
    { journalEntryId: 1, accountId: 4, debit: "3500", credit: "0", description: "Bank deposit - Sales" },
    { journalEntryId: 1, accountId: 19, debit: "0", credit: "3500", description: "Sales Revenue" },
    { journalEntryId: 2, accountId: 3, debit: "3500", credit: "0", description: "Cash received" },
    { journalEntryId: 2, accountId: 5, debit: "0", credit: "3500", description: "AR reduction" },
    { journalEntryId: 3, accountId: 24, debit: "95000", credit: "0", description: "Salary expense" },
    { journalEntryId: 3, accountId: 14, debit: "0", credit: "95000", description: "Salary payable" },
    { journalEntryId: 4, accountId: 5, debit: "12000", credit: "0", description: "AR - Al Faisal" },
    { journalEntryId: 4, accountId: 19, debit: "0", credit: "12000", description: "Sales Revenue" },
    { journalEntryId: 5, accountId: 23, debit: "2500", credit: "0", description: "COGS adjustment" },
    { journalEntryId: 5, accountId: 6, debit: "0", credit: "2500", description: "Inventory reduction" },
  ];
  for (const line of jeLines) {
    await db.insert(schema.journalEntryLines).values(line);
  }

  // 18. Seed Invoices
  const invoices = [
    { tenantId: DEMO_TENANT_ID, invoiceNumber: "INV-25001", invoiceType: "standard" as const, customerId: 1, date: "2025-01-15", dueDate: "2025-02-15", subTotal: "3500", taxAmount: "525", taxPercent: "15", totalAmount: "4025", paidAmount: "4025", balanceDue: "0", status: "paid" as const },
    { tenantId: DEMO_TENANT_ID, invoiceNumber: "INV-25002", invoiceType: "standard" as const, customerId: 2, date: "2025-02-10", dueDate: "2025-03-27", subTotal: "12000", taxAmount: "1800", taxPercent: "15", totalAmount: "13800", paidAmount: "5000", balanceDue: "8800", status: "partial" as const },
    { tenantId: DEMO_TENANT_ID, invoiceNumber: "INV-25003", invoiceType: "zatca" as const, customerId: 3, date: "2025-03-01", dueDate: "2025-04-01", subTotal: "8400", taxAmount: "1260", taxPercent: "15", totalAmount: "9660", paidAmount: "0", balanceDue: "9660", status: "sent" as const },
    { tenantId: DEMO_TENANT_ID, invoiceNumber: "INV-25004", invoiceType: "standard" as const, customerId: 1, date: "2025-03-20", dueDate: "2025-04-20", subTotal: "9600", taxAmount: "1440", taxPercent: "15", totalAmount: "11040", paidAmount: "0", balanceDue: "11040", status: "draft" as const },
    { tenantId: DEMO_TENANT_ID, invoiceNumber: "INV-25005", invoiceType: "standard" as const, customerId: 5, date: "2025-04-05", dueDate: "2025-04-20", subTotal: "5000", taxAmount: "750", taxPercent: "15", totalAmount: "5750", paidAmount: "0", balanceDue: "5750", status: "draft" as const },
  ];
  for (const inv of invoices) {
    await db.insert(schema.invoices).values(inv);
  }

  // 19. Seed Invoice Items
  const invoiceItems = [
    { invoiceId: 1, productId: 1, description: "Samsung Galaxy S24", quantity: 1, unitPrice: "3500", taxPercent: "15", totalAmount: "3500" },
    { invoiceId: 2, productId: 4, description: "LG OLED 55\" TV", quantity: 2, unitPrice: "4200", taxPercent: "15", totalAmount: "8400" },
    { invoiceId: 2, productId: 3, description: "Sony Headphones", quantity: 3, unitPrice: "1200", taxPercent: "15", totalAmount: "3600" },
    { invoiceId: 3, productId: 2, description: "iPhone 15 Pro", quantity: 2, unitPrice: "4800", taxPercent: "15", totalAmount: "9600" },
    { invoiceId: 3, productId: 5, description: "Office Desk", quantity: 3, unitPrice: "650", taxPercent: "15", totalAmount: "1950" },
  ];
  for (const item of invoiceItems) {
    await db.insert(schema.invoiceItems).values(item);
  }

  // 20. Seed Purchase Orders
  const purchaseOrders = [
    { tenantId: DEMO_TENANT_ID, poNumber: "PO-25001", supplierId: 1, date: "2025-01-10", expectedDelivery: "2025-02-10", subTotal: "140000", taxAmount: "21000", totalAmount: "161000", status: "received" as const },
    { tenantId: DEMO_TENANT_ID, poNumber: "PO-25002", supplierId: 4, date: "2025-02-15", expectedDelivery: "2025-03-15", subTotal: "25000", taxAmount: "3750", totalAmount: "28750", status: "partial" as const },
    { tenantId: DEMO_TENANT_ID, poNumber: "PO-25003", supplierId: 5, date: "2025-03-20", expectedDelivery: "2025-04-20", subTotal: "96000", taxAmount: "14400", totalAmount: "110400", status: "sent" as const },
  ];
  for (const po of purchaseOrders) {
    await db.insert(schema.purchaseOrders).values(po);
  }

  // 21. Seed Leads
  const leads = [
    { tenantId: DEMO_TENANT_ID, firstName: "Fahad", lastName: "Al-Saud", email: "fahad@example.com", phone: "+966-55-111-2222", company: "Al Saud Trading", source: "website" as const, status: "qualified" as const, rating: "hot" as const, estimatedValue: "250000", assignedTo: 1 },
    { tenantId: DEMO_TENANT_ID, firstName: "Nora", lastName: "Al-Rashid", email: "nora@example.com", phone: "+966-56-333-4444", company: "Desert Rose Co.", source: "referral" as const, status: "proposal" as const, rating: "warm" as const, estimatedValue: "150000", assignedTo: 3 },
    { tenantId: DEMO_TENANT_ID, firstName: "Sami", lastName: "Hassan", email: "sami@example.com", phone: "+966-55-555-6666", company: "Hassan Group", source: "social_media" as const, status: "new" as const, rating: "warm" as const, estimatedValue: "100000", assignedTo: 3 },
    { tenantId: DEMO_TENANT_ID, firstName: "Reem", lastName: "Al-Qarni", email: "reem@example.com", phone: "+966-56-777-8888", company: "Al-Qarni Enterprises", source: "call" as const, status: "contacted" as const, rating: "cold" as const, estimatedValue: "75000", assignedTo: 5 },
  ];
  for (const lead of leads) {
    await db.insert(schema.leads).values(lead);
  }

  // 22. Seed Projects
  const projects = [
    { tenantId: DEMO_TENANT_ID, projectCode: "PRJ-001", name: "ERP Implementation", description: "Company-wide ERP system rollout", customerId: 5, managerId: 1, startDate: "2025-01-01", endDate: "2025-06-30", budget: "500000", priority: "high" as const, status: "active" as const, progress: 65 },
    { tenantId: DEMO_TENANT_ID, projectCode: "PRJ-002", name: "Warehouse Expansion", description: "Expand main warehouse capacity by 50%", customerId: 1, managerId: 9, startDate: "2025-02-15", endDate: "2025-08-15", budget: "300000", priority: "medium" as const, status: "active" as const, progress: 30 },
    { tenantId: DEMO_TENANT_ID, projectCode: "PRJ-003", name: "Digital Transformation", description: "Cloud migration and digital tools", customerId: 2, managerId: 7, startDate: "2025-03-01", endDate: "2025-12-31", budget: "800000", priority: "urgent" as const, status: "active" as const, progress: 15 },
  ];
  for (const proj of projects) {
    await db.insert(schema.projects).values(proj);
  }

  // 23. Seed Project Tasks
  const tasks = [
    { tenantId: DEMO_TENANT_ID, projectId: 1, name: "Requirements Gathering", assignedTo: 7, status: "done" as const, progress: 100, estimatedHours: "80", actualHours: "75", priority: "high" as const },
    { tenantId: DEMO_TENANT_ID, projectId: 1, name: "System Design", assignedTo: 7, status: "done" as const, progress: 100, estimatedHours: "120", actualHours: "130", priority: "high" as const },
    { tenantId: DEMO_TENANT_ID, projectId: 1, name: "Development Phase 1", assignedTo: 7, status: "in_progress" as const, progress: 70, estimatedHours: "400", actualHours: "280", priority: "high" as const },
    { tenantId: DEMO_TENANT_ID, projectId: 1, name: "User Training", assignedTo: 6, status: "todo" as const, progress: 0, estimatedHours: "60", priority: "medium" as const },
    { tenantId: DEMO_TENANT_ID, projectId: 2, name: "Site Survey", assignedTo: 9, status: "done" as const, progress: 100, estimatedHours: "40", actualHours: "35", priority: "medium" as const },
    { tenantId: DEMO_TENANT_ID, projectId: 2, name: "Foundation Work", assignedTo: 9, status: "in_progress" as const, progress: 40, estimatedHours: "200", actualHours: "80", priority: "high" as const },
  ];
  for (const task of tasks) {
    await db.insert(schema.projectTasks).values(task);
  }

  // 24. Seed Support Tickets
  const tickets = [
    { tenantId: DEMO_TENANT_ID, ticketNumber: "TKT-00001", subject: "System login issue", description: "Unable to login to the ERP system after password reset", category: "IT Support", priority: "high" as const, status: "resolved" as const, requesterName: "Ahmed Al-Farsi", requesterEmail: "k.alfarsi@company.sa", assignedTo: 7, source: "email" as const },
    { tenantId: DEMO_TENANT_ID, ticketNumber: "TKT-00002", subject: "Printer not working", description: "The HP printer in the finance department is not responding", category: "Hardware", priority: "medium" as const, status: "in_progress" as const, requesterName: "Fatima Al-Zahra", requesterEmail: "f.alzahra@company.sa", assignedTo: 7, source: "web" as const },
    { tenantId: DEMO_TENANT_ID, ticketNumber: "TKT-00003", subject: "New user account request", description: "Please create an account for new sales executive joining next week", category: "IT Support", priority: "low" as const, status: "open" as const, requesterName: "Sara Al-Otaibi", requesterEmail: "s.alotaibi@company.sa", assignedTo: 7, source: "web" as const },
    { tenantId: DEMO_TENANT_ID, ticketNumber: "TKT-00004", subject: "Invoice discrepancy", description: "Invoice INV-25002 shows incorrect tax calculation", category: "Finance", priority: "urgent" as const, status: "open" as const, requesterName: "Mohammed Al-Rashid", requesterEmail: "m.alrashid@company.sa", assignedTo: 2, source: "email" as const },
  ];
  for (const ticket of tickets) {
    await db.insert(schema.supportTickets).values(ticket);
  }

  // 25. Seed Assets
  const assetsList = [
    { tenantId: DEMO_TENANT_ID, assetCode: "AST-001", name: "Main Office Building", category: "Property", location: "King Fahd Road, Riyadh", purchaseDate: "2020-01-01", purchaseCost: "500000", salvageValue: "100000", usefulLife: 20, depreciationMethod: "straight_line" as const, bookValue: "475000", serialNumber: "BLDG-001" },
    { tenantId: DEMO_TENANT_ID, assetCode: "AST-002", name: "Dell Server Rack", category: "IT Equipment", location: "Server Room, Main Office", purchaseDate: "2023-06-01", purchaseCost: "75000", salvageValue: "5000", usefulLife: 5, depreciationMethod: "straight_line" as const, bookValue: "61000", serialNumber: "DELL-SRV-2023-001" },
    { tenantId: DEMO_TENANT_ID, assetCode: "AST-003", name: "Toyota Land Cruiser", category: "Vehicle", location: "Parking, Main Office", purchaseDate: "2024-01-15", purchaseCost: "200000", salvageValue: "40000", usefulLife: 8, depreciationMethod: "straight_line" as const, bookValue: "180000", serialNumber: "VIN-JTMHU09J504012345" },
    { tenantId: DEMO_TENANT_ID, assetCode: "AST-004", name: "CNC Machine", category: "Manufacturing Equipment", location: "Production Floor", purchaseDate: "2022-03-01", purchaseCost: "150000", salvageValue: "15000", usefulLife: 10, depreciationMethod: "straight_line" as const, bookValue: "123750", serialNumber: "CNC-2022-004" },
  ];
  for (const asset of assetsList) {
    await db.insert(schema.assets).values(asset);
  }

  // 26. Seed Vehicles
  const vehicles = [
    { tenantId: DEMO_TENANT_ID, vehicleNumber: "V-001", make: "Toyota", model: "Land Cruiser", year: 2024, plateNumber: "KSA-1234", fuelType: "petrol" as const, purchaseDate: "2024-01-15", purchaseCost: "200000", currentOdometer: 15000, status: "active" as const },
    { tenantId: DEMO_TENANT_ID, vehicleNumber: "V-002", make: "Hyundai", model: "H-1 Van", year: 2023, plateNumber: "KSA-5678", fuelType: "diesel" as const, purchaseDate: "2023-08-01", purchaseCost: "95000", currentOdometer: 28000, status: "active" as const },
    { tenantId: DEMO_TENANT_ID, vehicleNumber: "V-003", make: "Ford", model: "F-150", year: 2022, plateNumber: "KSA-9012", fuelType: "petrol" as const, purchaseDate: "2022-05-20", purchaseCost: "130000", currentOdometer: 45000, status: "maintenance" as const },
  ];
  for (const vehicle of vehicles) {
    await db.insert(schema.vehicles).values(vehicle);
  }

  // 27. Seed Tax Rates
  const taxRates = [
    { tenantId: DEMO_TENANT_ID, name: "Saudi VAT 15%", rate: "15", type: "vat" as const, isDefault: true, isActive: true },
    { tenantId: DEMO_TENANT_ID, name: "Zero Rate", rate: "0", type: "vat" as const, isDefault: false, isActive: true },
    { tenantId: DEMO_TENANT_ID, name: "Exempt", rate: "0", type: "vat" as const, isDefault: false, isActive: true },
    { tenantId: DEMO_TENANT_ID, name: "Withholding Tax 2.5%", rate: "2.5", type: "withholding" as const, isDefault: false, isActive: true },
  ];
  for (const tax of taxRates) {
    await db.insert(schema.taxRates).values(tax);
  }

  // 28. Seed Currencies
  const currencies = [
    { tenantId: DEMO_TENANT_ID, code: "SAR", name: "Saudi Riyal", symbol: "SR", exchangeRate: "1", isBase: true, isActive: true },
    { tenantId: DEMO_TENANT_ID, code: "USD", name: "US Dollar", symbol: "$", exchangeRate: "3.75", isBase: false, isActive: true },
    { tenantId: DEMO_TENANT_ID, code: "EUR", name: "Euro", symbol: "EUR", exchangeRate: "4.05", isBase: false, isActive: true },
    { tenantId: DEMO_TENANT_ID, code: "AED", name: "UAE Dirham", symbol: "AED", exchangeRate: "1.02", isBase: false, isActive: true },
    { tenantId: DEMO_TENANT_ID, code: "PKR", name: "Pakistani Rupee", symbol: "Rs", exchangeRate: "0.0135", isBase: false, isActive: true },
  ];
  for (const curr of currencies) {
    await db.insert(schema.currencies).values(curr);
  }

  // 29. Seed Company Settings
  await db.insert(schema.companySettings).values({
    tenantId: DEMO_TENANT_ID,
    companyName: "Al Watan Trading & Manufacturing Co.",
    companyNameAr: "شركة الوطن للتجارة والصناعة",
    tradeName: "Al Watan Co.",
    email: "info@alwatancompany.sa",
    phone: "+966-11-454-0000",
    website: "www.alwatancompany.sa",
    address: "King Fahd Road, Al Olaya District",
    city: "Riyadh",
    country: "Saudi Arabia",
    zipCode: "11321",
    taxNumber: "310123456700003",
    crNumber: "1010123456",
    vatRate: "15",
    defaultCurrency: "SAR",
    fiscalYearStart: "01-01",
    dateFormat: "DD/MM/YYYY",
    invoicePrefix: "INV-",
    purchaseOrderPrefix: "PO-",
    salesOrderPrefix: "SO-",
    quotationPrefix: "QUO-",
    theme: "light",
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    zatcaEnabled: true,
    zatcaSandbox: true,
  });

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
