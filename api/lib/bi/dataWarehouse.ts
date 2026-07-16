import { getDb } from "../../queries/connection";
import {
  invoices, invoiceItems, customers, suppliers, products, inventoryBalances,
  inventoryMovements, purchaseOrders, purchaseOrderItems, chartOfAccounts,
  journalEntries, journalEntryLines, employees, attendance,
} from "@db/schema";
import {
  and, eq, gte, lte, sql, count, sum, desc, avg,
} from "drizzle-orm";
import { biDataWarehouseTables } from "@db/schema";

type RefreshResult = { tableName: string; rowsInserted: number; durationMs: number; error?: string };

export async function refreshDataWarehouseTable(tableName: string, tenantId: number): Promise<RefreshResult> {
  const db = getDb();
  const start = Date.now();
  try {
    const tableDef = await db.query.biDataWarehouseTables.findFirst({
      where: and(
        eq(biDataWarehouseTables.tenantId, tenantId),
        eq(biDataWarehouseTables.tableName, tableName),
      ),
    });
    if (!tableDef) throw new Error(`Table definition not found: ${tableName}`);

    const builders: Record<string, () => Promise<number>> = {
      dw_monthly_sales: () => buildMonthlySales(tenantId),
      dw_daily_sales: () => buildDailySales(tenantId),
      dw_customer_summary: () => buildCustomerSummary(tenantId),
      dw_supplier_summary: () => buildSupplierSummary(tenantId),
      dw_inventory_snapshot: () => buildInventorySnapshot(tenantId),
      dw_product_performance: () => buildProductPerformance(tenantId),
      dw_financial_summary: () => buildFinancialSummary(tenantId),
      dw_ar_aging: () => buildARAging(tenantId),
      dw_ap_aging: () => buildAPAging(tenantId),
      dw_employee_summary: () => buildEmployeeSummary(tenantId),
    };

    const builder = builders[tableName];
    if (!builder) throw new Error(`No builder for table: ${tableName}`);

    const rowsInserted = await builder();

    await db.update(biDataWarehouseTables)
      .set({
        lastRefreshedAt: new Date(),
        rowCount: rowsInserted,
      })
      .where(eq(biDataWarehouseTables.id, tableDef.id));

    return { tableName, rowsInserted, durationMs: Date.now() - start };
  } catch (err: any) {
    return { tableName, rowsInserted: 0, durationMs: Date.now() - start, error: err.message };
  }
}

export async function refreshAllWarehouseTables(tenantId: number): Promise<RefreshResult[]> {
  const db = getDb();
  const tables = await db.query.biDataWarehouseTables.findMany({
    where: and(eq(biDataWarehouseTables.tenantId, tenantId), eq(biDataWarehouseTables.isActive, true)),
  });
  const results: RefreshResult[] = [];
  for (const t of tables) {
    results.push(await refreshDataWarehouseTable(t.tableName, tenantId));
  }
  return results;
}

export async function cleanOldData(tenantId: number, retentionDays = 365): Promise<number> {
  const db = getDb();
  const tables = await db.query.biDataWarehouseTables.findMany({
    where: eq(biDataWarehouseTables.tenantId, tenantId),
  });
  let totalDeleted = 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  for (const t of tables) {
    const tableRaw = `dw_${t.tableName}`;
    try {
      await db.execute(sql`DELETE FROM ${sql.identifier(tableRaw)} WHERE created_at < ${cutoff}`);
      totalDeleted++;
    } catch { }
  }
  return totalDeleted;
}

export async function initializeDefaultWarehouseTables(tenantId: number): Promise<void> {
  const db = getDb();
  const defaults: { tableName: string; displayName: string; description: string; refreshFrequency: string; retentionDays: number }[] = [
    { tableName: "dw_monthly_sales", displayName: "Monthly Sales", description: "Monthly sales aggregation by product and customer", refreshFrequency: "monthly", retentionDays: 1825 },
    { tableName: "dw_daily_sales", displayName: "Daily Sales", description: "Daily sales transactions", refreshFrequency: "daily", retentionDays: 365 },
    { tableName: "dw_customer_summary", displayName: "Customer Summary", description: "Customer lifetime value and metrics", refreshFrequency: "daily", retentionDays: 730 },
    { tableName: "dw_supplier_summary", displayName: "Supplier Summary", description: "Supplier performance metrics", refreshFrequency: "daily", retentionDays: 730 },
    { tableName: "dw_inventory_snapshot", displayName: "Inventory Snapshot", description: "Daily inventory levels and valuation", refreshFrequency: "daily", retentionDays: 365 },
    { tableName: "dw_product_performance", displayName: "Product Performance", description: "Product sales and margin analysis", refreshFrequency: "daily", retentionDays: 730 },
    { tableName: "dw_financial_summary", displayName: "Financial Summary", description: "P&L and balance sheet summaries", refreshFrequency: "monthly", retentionDays: 2555 },
    { tableName: "dw_ar_aging", displayName: "AR Aging", description: "Accounts receivable aging snapshot", refreshFrequency: "daily", retentionDays: 365 },
    { tableName: "dw_ap_aging", displayName: "AP Aging", description: "Accounts payable aging snapshot", refreshFrequency: "daily", retentionDays: 365 },
    { tableName: "dw_employee_summary", displayName: "Employee Summary", description: "Employee cost and headcount metrics", refreshFrequency: "monthly", retentionDays: 1825 },
  ];
  for (const def of defaults) {
    const existing = await db.query.biDataWarehouseTables.findFirst({
      where: and(eq(biDataWarehouseTables.tenantId, tenantId), eq(biDataWarehouseTables.tableName, def.tableName)),
    });
    if (!existing) {
      await db.insert(biDataWarehouseTables).values({ tenantId, ...def } as any);
    }
  }
}

async function buildMonthlySales(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      year: sql`YEAR(${invoices.date})`,
      month: sql`MONTH(${invoices.date})`,
      customerId: invoices.customerId,
      customerName: customers.name,
      productId: invoiceItems.productId,
      productName: products.name,
      totalQty: sql`SUM(${invoiceItems.quantity})`,
      totalRevenue: sql`SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice})`,
      totalTax: sql`SUM(${invoices.taxAmount})`,
      invoiceCount: count(),
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .innerJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
    .innerJoin(products, eq(invoiceItems.productId, products.id))
    .where(eq(invoices.tenantId, tenantId))
    .groupBy(sql`YEAR(${invoices.date})`, sql`MONTH(${invoices.date})`, invoices.customerId, invoiceItems.productId);
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_monthly_sales (tenant_id, year, month, customer_id, customer_name, product_id, product_name, total_qty, total_revenue, total_tax, invoice_count, created_at)
      VALUES (${tenantId}, ${r.year}, ${r.month}, ${r.customerId}, ${r.customerName}, ${r.productId}, ${r.productName}, ${r.totalQty}, ${r.totalRevenue}, ${r.totalTax}, ${r.invoiceCount}, NOW())
      ON DUPLICATE KEY UPDATE total_qty = VALUES(total_qty), total_revenue = VALUES(total_revenue), total_tax = VALUES(total_tax), invoice_count = VALUES(invoice_count)
    `);
  }
  return rows.length;
}

async function buildDailySales(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      date: invoices.date,
      customerId: invoices.customerId,
      customerName: customers.name,
      invoiceId: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      totalAmount: invoices.totalAmount,
      taxAmount: invoices.taxAmount,
      balanceDue: invoices.balanceDue,
      status: invoices.status,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.tenantId, tenantId))
    .orderBy(desc(invoices.date));
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_daily_sales (tenant_id, date, customer_id, customer_name, invoice_id, invoice_number, total_amount, tax_amount, balance_due, status, created_at)
      VALUES (${tenantId}, ${r.date}, ${r.customerId}, ${r.customerName}, ${r.invoiceId}, ${r.invoiceNumber}, ${r.totalAmount}, ${r.taxAmount}, ${r.balanceDue}, ${r.status}, NOW())
      ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount), balance_due = VALUES(balance_due), status = VALUES(status)
    `);
  }
  return rows.length;
}

async function buildCustomerSummary(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      customerId: customers.id,
      customerName: customers.name,
      totalRevenue: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      totalPaid: sql`COALESCE(SUM(${invoices.paidAmount}), 0)`,
      balanceDue: sql`COALESCE(SUM(${invoices.balanceDue}), 0)`,
      invoiceCount: count(invoices.id),
      lastInvoiceDate: sql`MAX(${invoices.date})`,
      avgInvoiceValue: sql`COALESCE(AVG(${invoices.totalAmount}), 0)`,
    })
    .from(customers)
    .leftJoin(invoices, eq(customers.id, invoices.customerId))
    .where(eq(customers.tenantId, tenantId))
    .groupBy(customers.id);
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_customer_summary (tenant_id, customer_id, customer_name, total_revenue, total_paid, balance_due, invoice_count, last_invoice_date, avg_invoice_value, created_at)
      VALUES (${tenantId}, ${r.customerId}, ${r.customerName}, ${r.totalRevenue}, ${r.totalPaid}, ${r.balanceDue}, ${r.invoiceCount}, ${r.lastInvoiceDate}, ${r.avgInvoiceValue}, NOW())
      ON DUPLICATE KEY UPDATE total_revenue = VALUES(total_revenue), total_paid = VALUES(total_paid), balance_due = VALUES(balance_due), invoice_count = VALUES(invoice_count), last_invoice_date = VALUES(last_invoice_date), avg_invoice_value = VALUES(avg_invoice_value)
    `);
  }
  return rows.length;
}

async function buildSupplierSummary(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      supplierId: suppliers.id,
      supplierName: suppliers.name,
      totalPurchases: sql`COALESCE(SUM(${purchaseOrders.totalAmount}), 0)`,
      poCount: count(purchaseOrders.id),
      balanceDue: sql`COALESCE(SUM(${purchaseOrders.totalAmount} - ${purchaseOrders.discountAmount}), 0)`,
      lastPoDate: sql`MAX(${purchaseOrders.date})`,
      avgPoValue: sql`COALESCE(AVG(${purchaseOrders.totalAmount}), 0)`,
    })
    .from(suppliers)
    .leftJoin(purchaseOrders, eq(suppliers.id, purchaseOrders.supplierId))
    .where(eq(suppliers.tenantId, tenantId))
    .groupBy(suppliers.id);
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_supplier_summary (tenant_id, supplier_id, supplier_name, total_purchases, po_count, balance_due, last_po_date, avg_po_value, created_at)
      VALUES (${tenantId}, ${r.supplierId}, ${r.supplierName}, ${r.totalPurchases}, ${r.poCount}, ${r.balanceDue}, ${r.lastPoDate}, ${r.avgPoValue}, NOW())
      ON DUPLICATE KEY UPDATE total_purchases = VALUES(total_purchases), po_count = VALUES(po_count), balance_due = VALUES(balance_due), last_po_date = VALUES(last_po_date), avg_po_value = VALUES(avg_po_value)
    `);
  }
  return rows.length;
}

async function buildInventorySnapshot(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      sku: products.sku,
      categoryId: products.categoryId,
      quantity: inventoryBalances.quantity,
      avgCost: inventoryBalances.avgCost,
      totalValue: inventoryBalances.totalValue,
      salePrice: products.salePrice,
      reorderLevel: products.reorderLevel,
    })
    .from(products)
    .leftJoin(inventoryBalances, eq(products.id, inventoryBalances.productId))
    .where(eq(products.tenantId, tenantId));
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_inventory_snapshot (tenant_id, product_id, product_name, sku, category_id, quantity, avg_cost, total_value, sale_price, reorder_level, snapshot_date, created_at)
      VALUES (${tenantId}, ${r.productId}, ${r.productName}, ${r.sku}, ${r.categoryId}, ${r.quantity}, ${r.avgCost}, ${r.totalValue}, ${r.salePrice}, ${r.reorderLevel}, CURDATE(), NOW())
      ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), avg_cost = VALUES(avg_cost), total_value = VALUES(total_value), sale_price = VALUES(sale_price), reorder_level = VALUES(reorder_level)
    `);
  }
  return rows.length;
}

async function buildProductPerformance(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      sku: products.sku,
      totalQtySold: sql`COALESCE(SUM(${invoiceItems.quantity}), 0)`,
      totalRevenue: sql`COALESCE(SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice}), 0)`,
      totalCost: sql`COALESCE(SUM(${invoiceItems.quantity} * ${products.purchasePrice}), 0)`,
      totalProfit: sql`COALESCE(SUM(${invoiceItems.quantity} * (${invoiceItems.unitPrice} - ${products.purchasePrice})), 0)`,
      orderCount: count(invoiceItems.id),
    })
    .from(products)
    .leftJoin(invoiceItems, eq(products.id, invoiceItems.productId))
    .where(eq(products.tenantId, tenantId))
    .groupBy(products.id);
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_product_performance (tenant_id, product_id, product_name, sku, total_qty_sold, total_revenue, total_cost, total_profit, order_count, created_at)
      VALUES (${tenantId}, ${r.productId}, ${r.productName}, ${r.sku}, ${r.totalQtySold}, ${r.totalRevenue}, ${r.totalCost}, ${r.totalProfit}, ${r.orderCount}, NOW())
      ON DUPLICATE KEY UPDATE total_qty_sold = VALUES(total_qty_sold), total_revenue = VALUES(total_revenue), total_cost = VALUES(total_cost), total_profit = VALUES(total_profit), order_count = VALUES(order_count)
    `);
  }
  return rows.length;
}

async function buildFinancialSummary(tenantId: number): Promise<number> {
  const db = getDb();
  const revenue = await db
    .select({ total: sql`COALESCE(SUM(${journalEntryLines.credit}), 0)` })
    .from(journalEntryLines)
    .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
    .innerJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
    .where(and(
      eq(journalEntries.tenantId, tenantId),
      eq(chartOfAccounts.accountType, "revenue"),
      eq(journalEntries.isPosted, true),
    ));
  const expenses = await db
    .select({ total: sql`COALESCE(SUM(${journalEntryLines.debit}), 0)` })
    .from(journalEntryLines)
    .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
    .innerJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
    .where(and(
      eq(journalEntries.tenantId, tenantId),
      eq(chartOfAccounts.accountType, "expense"),
      eq(journalEntries.isPosted, true),
    ));
  const assets = await db
    .select({ total: sql`COALESCE(SUM(${chartOfAccounts.currentBalance}), 0)` })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.accountType, "asset")));
  const liabilities = await db
    .select({ total: sql`COALESCE(SUM(${chartOfAccounts.currentBalance}), 0)` })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.accountType, "liability")));
  const equity = await db
    .select({ total: sql`COALESCE(SUM(${chartOfAccounts.currentBalance}), 0)` })
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.tenantId, tenantId), eq(chartOfAccounts.accountType, "equity")));
  const rev = Number(revenue[0]?.total || 0);
  const exp = Number(expenses[0]?.total || 0);
  const asst = Number(assets[0]?.total || 0);
  const liab = Number(liabilities[0]?.total || 0);
  const eqty = Number(equity[0]?.total || 0);

  await db.execute(sql`
    INSERT INTO dw_financial_summary (tenant_id, total_revenue, total_expenses, gross_profit, total_assets, total_liabilities, total_equity, snapshot_date, created_at)
    VALUES (${tenantId}, ${rev}, ${exp}, ${rev - exp}, ${asst}, ${liab}, ${eqty}, CURDATE(), NOW())
  `);
  return 1;
}

async function buildARAging(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      customerId: customers.id,
      customerName: customers.name,
      current: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) <= 0 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
      days1to30: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) BETWEEN 1 AND 30 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
      days31to60: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) BETWEEN 31 AND 60 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
      days61to90: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) BETWEEN 61 AND 90 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
      days91plus: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) > 90 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
      totalDue: sql`COALESCE(SUM(${invoices.balanceDue}), 0)`,
    })
    .from(customers)
    .innerJoin(invoices, eq(customers.id, invoices.customerId))
    .where(and(eq(customers.tenantId, tenantId), sql`${invoices.status} IN ('sent', 'partial', 'overdue')`))
    .groupBy(customers.id);
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_ar_aging (tenant_id, customer_id, customer_name, current, days_1_30, days_31_60, days_61_90, days_91_plus, total_due, snapshot_date, created_at)
      VALUES (${tenantId}, ${r.customerId}, ${r.customerName}, ${r.current}, ${r.days1to30}, ${r.days31to60}, ${r.days61to90}, ${r.days91plus}, ${r.totalDue}, CURDATE(), NOW())
      ON DUPLICATE KEY UPDATE current = VALUES(current), days_1_30 = VALUES(days_1_30), days_31_60 = VALUES(days_31_60), days_61_90 = VALUES(days_61_90), days_91_plus = VALUES(days_91_plus), total_due = VALUES(total_due)
    `);
  }
  return rows.length;
}

async function buildAPAging(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      supplierId: suppliers.id,
      supplierName: suppliers.name,
      current: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${purchaseOrders.date}) <= 0 THEN ${purchaseOrders.totalAmount} - ${purchaseOrders.discountAmount} ELSE 0 END), 0)`,
      days1to30: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${purchaseOrders.date}) BETWEEN 1 AND 30 THEN ${purchaseOrders.totalAmount} - ${purchaseOrders.discountAmount} ELSE 0 END), 0)`,
      days31to60: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${purchaseOrders.date}) BETWEEN 31 AND 60 THEN ${purchaseOrders.totalAmount} - ${purchaseOrders.discountAmount} ELSE 0 END), 0)`,
      days61to90: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${purchaseOrders.date}) BETWEEN 61 AND 90 THEN ${purchaseOrders.totalAmount} - ${purchaseOrders.discountAmount} ELSE 0 END), 0)`,
      days91plus: sql`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${purchaseOrders.date}) > 90 THEN ${purchaseOrders.totalAmount} - ${purchaseOrders.discountAmount} ELSE 0 END), 0)`,
      totalDue: sql`COALESCE(SUM(${purchaseOrders.totalAmount} - ${purchaseOrders.discountAmount}), 0)`,
    })
    .from(suppliers)
    .innerJoin(purchaseOrders, eq(suppliers.id, purchaseOrders.supplierId))
    .where(and(eq(suppliers.tenantId, tenantId), sql`${purchaseOrders.status} IN ('sent', 'partial')`))
    .groupBy(suppliers.id);
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_ap_aging (tenant_id, supplier_id, supplier_name, current, days_1_30, days_31_60, days_61_90, days_91_plus, total_due, snapshot_date, created_at)
      VALUES (${tenantId}, ${r.supplierId}, ${r.supplierName}, ${r.current}, ${r.days1to30}, ${r.days31to60}, ${r.days61to90}, ${r.days91plus}, ${r.totalDue}, CURDATE(), NOW())
      ON DUPLICATE KEY UPDATE current = VALUES(current), days_1_30 = VALUES(days_1_30), days_31_60 = VALUES(days_31_60), days_61_90 = VALUES(days_61_90), days_91_plus = VALUES(days_91_plus), total_due = VALUES(total_due)
    `);
  }
  return rows.length;
}

async function buildEmployeeSummary(tenantId: number): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({
      employeeId: employees.id,
      employeeName: sql`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      departmentId: employees.departmentId,
      basicSalary: employees.basicSalary,
      status: employees.status,
      attendanceCount: count(attendance.id),
      avgWorkHours: sql`COALESCE(AVG(${attendance.workHours}), 0)`,
    })
    .from(employees)
    .leftJoin(attendance, eq(employees.id, attendance.employeeId))
    .where(eq(employees.tenantId, tenantId))
    .groupBy(employees.id);
  for (const r of rows) {
    await db.execute(sql`
      INSERT INTO dw_employee_summary (tenant_id, employee_id, employee_name, department_id, basic_salary, status, attendance_count, avg_work_hours, created_at)
      VALUES (${tenantId}, ${r.employeeId}, ${r.employeeName}, ${r.departmentId}, ${r.basicSalary}, ${r.status}, ${r.attendanceCount}, ${r.avgWorkHours}, NOW())
      ON DUPLICATE KEY UPDATE basic_salary = VALUES(basic_salary), status = VALUES(status), attendance_count = VALUES(attendance_count), avg_work_hours = VALUES(avg_work_hours)
    `);
  }
  return rows.length;
}
