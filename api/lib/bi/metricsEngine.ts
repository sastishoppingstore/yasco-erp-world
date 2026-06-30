import { getDb } from "../../queries/connection";
import {
  invoices, invoiceItems, customers, suppliers, products, inventoryBalances,
  purchaseOrders, chartOfAccounts, journalEntries, journalEntryLines,
  employees, attendance, salarySlips,
} from "@db/schema";
import { and, eq, gte, lte, sql, count, sum, avg, desc } from "drizzle-orm";

export interface MetricResult {
  metricKey: string;
  metricName: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  period: string;
  dimensions?: Record<string, any>;
}

export interface TrendResult {
  metricKey: string;
  periods: { label: string; value: number }[];
  trend: "up" | "down" | "stable";
  changePercent: number;
}

export async function calculateMetric(metricKey: string, tenantId: number, options?: { year?: number; month?: number; fromDate?: string; toDate?: string }): Promise<MetricResult> {
  const db = getDb();
  const year = options?.year || new Date().getFullYear();
  const month = options?.month || new Date().getMonth() + 1;
  const fromDate = options?.fromDate || `${year}-${String(month).padStart(2, "0")}-01`;
  const endOfMonth = new Date(year, month, 0).getDate();
  const toDate = options?.toDate || `${year}-${String(month).padStart(2, "0")}-${String(endOfMonth).padStart(2, "0")}`;

  const calculators: Record<string, () => Promise<MetricResult>> = {
    total_revenue: () => computeTotalRevenue(tenantId, fromDate, toDate, year, month),
    net_profit: () => computeNetProfit(tenantId, fromDate, toDate, year, month),
    gross_margin: () => computeGrossMargin(tenantId, fromDate, toDate, year, month),
    total_customers: () => computeTotalCustomers(tenantId),
    total_suppliers: () => computeTotalSuppliers(tenantId),
    total_products: () => computeTotalProducts(tenantId),
    total_employees: () => computeTotalEmployees(tenantId),
    inventory_value: () => computeInventoryValue(tenantId),
    inventory_turnover: () => computeInventoryTurnover(tenantId, fromDate, toDate),
    ar_aging_total: () => computeARAgingTotal(tenantId),
    ap_aging_total: () => computeAPAgingTotal(tenantId),
    avg_invoice_value: () => computeAvgInvoiceValue(tenantId, fromDate, toDate),
    revenue_per_customer: () => computeRevenuePerCustomer(tenantId, fromDate, toDate),
    employee_cost_ratio: () => computeEmployeeCostRatio(tenantId, fromDate, toDate, year, month),
    monthly_recurring_revenue: () => computeMRR(tenantId, year, month),
    cash_conversion_cycle: () => computeCashConversionCycle(tenantId),
  };

  const calculator = calculators[metricKey];
  if (!calculator) throw new Error(`Unknown metric: ${metricKey}`);
  return calculator();
}

export async function calculateTrend(metricKey: string, tenantId: number, periods: number = 6): Promise<TrendResult> {
  const db = getDb();
  const results: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = periods - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const result = await calculateMetric(metricKey, tenantId, { year: y, month: m });
    const monthName = d.toLocaleString("en-US", { month: "short" });
    results.push({ label: `${monthName} ${y}`, value: result.value });
  }
  const values = results.map(r => r.value);
  const first = values[0] || 0;
  const last = values[values.length - 1] || 0;
  const changePercent = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
  const trend: "up" | "down" | "stable" = changePercent > 2 ? "up" : changePercent < -2 ? "down" : "stable";
  return { metricKey, periods: results, trend, changePercent: Math.round(changePercent * 100) / 100 };
}

export async function drillDown(metricKey: string, tenantId: number, dimension: string, options?: { year?: number; month?: number }): Promise<{ dimension: string; value: number }[]> {
  const db = getDb();
  const year = options?.year || new Date().getFullYear();
  const month = options?.month || new Date().getMonth() + 1;

  const drillers: Record<string, () => Promise<{ dimension: string; value: number }[]>> = {
    revenue_by_customer: async () => {
      const rows = await db
        .select({ dimension: customers.name, value: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` })
        .from(invoices)
        .innerJoin(customers, eq(invoices.customerId, customers.id))
        .where(and(eq(invoices.tenantId, tenantId), sql`YEAR(${invoices.date}) = ${year}`, sql`MONTH(${invoices.date}) = ${month}`))
        .groupBy(customers.id)
        .orderBy(desc(sql`COALESCE(SUM(${invoices.totalAmount}), 0)`));
      return rows as any[];
    },
    revenue_by_product: async () => {
      const rows = await db
        .select({ dimension: products.name, value: sql`COALESCE(SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice}), 0)` })
        .from(invoiceItems)
        .innerJoin(products, eq(invoiceItems.productId, products.id))
        .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
        .where(and(eq(invoices.tenantId, tenantId), sql`YEAR(${invoices.date}) = ${year}`, sql`MONTH(${invoices.date}) = ${month}`))
        .groupBy(products.id)
        .orderBy(desc(sql`COALESCE(SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice}), 0)`));
      return rows as any[];
    },
    expenses_by_category: async () => {
      const rows = await db
        .select({ dimension: chartOfAccounts.name, value: sql`COALESCE(SUM(${journalEntryLines.debit}), 0)` })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .innerJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
        .where(and(
          eq(journalEntries.tenantId, tenantId),
          eq(chartOfAccounts.accountType, "expense"),
          eq(journalEntries.isPosted, true),
          sql`YEAR(${journalEntries.date}) = ${year}`,
          sql`MONTH(${journalEntries.date}) = ${month}`,
        ))
        .groupBy(chartOfAccounts.id)
        .orderBy(desc(sql`COALESCE(SUM(${journalEntryLines.debit}), 0)`));
      return rows as any[];
    },
  };
  const driller = drillers[`${metricKey}_by_${dimension}`] || drillers[`revenue_by_customer`];
  if (!driller) throw new Error(`No drill-down available for ${metricKey} by ${dimension}`);
  return driller();
}

async function computeTotalRevenue(tenantId: number, fromDate: string, toDate: string, year: number, month: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db
    .select({ value: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  const [prevRow] = await db
    .select({ value: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` })
    .from(invoices)
    .where(and(
      eq(invoices.tenantId, tenantId),
      gte(invoices.date, `${year - 1}-${String(month).padStart(2, "0")}-01`),
      lte(invoices.date, `${year - 1}-${String(month).padStart(2, "0")}-${new Date(year - 1, month, 0).getDate()}`),
    ));
  const value = Number(row?.value || 0);
  const previousValue = Number(prevRow?.value || 0);
  return { metricKey: "total_revenue", metricName: "Total Revenue", value, previousValue, changePercent: previousValue ? ((value - previousValue) / previousValue) * 100 : 0, period: `${year}-${month}` };
}

async function computeNetProfit(tenantId: number, fromDate: string, toDate: string, year: number, month: number): Promise<MetricResult> {
  const db = getDb();
  const [revenue] = await db
    .select({ value: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  const [expenses] = await db
    .select({ value: sql`COALESCE(SUM(${purchaseOrders.totalAmount}), 0)` })
    .from(purchaseOrders)
    .where(and(eq(purchaseOrders.tenantId, tenantId), gte(purchaseOrders.date, fromDate), lte(purchaseOrders.date, toDate)));
  const rev = Number(revenue?.value || 0);
  const exp = Number(expenses?.value || 0);
  const value = rev - exp;
  return { metricKey: "net_profit", metricName: "Net Profit", value, period: `${year}-${month}` };
}

async function computeGrossMargin(tenantId: number, fromDate: string, toDate: string, year: number, month: number): Promise<MetricResult> {
  const db = getDb();
  const [revenue] = await db
    .select({ value: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  const [cogs] = await db
    .select({ value: sql`COALESCE(SUM(${invoiceItems.quantity} * ${products.purchasePrice}), 0)` })
    .from(invoiceItems)
    .innerJoin(products, eq(invoiceItems.productId, products.id))
    .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  const rev = Number(revenue?.value || 0);
  const cost = Number(cogs?.value || 0);
  const value = rev !== 0 ? ((rev - cost) / rev) * 100 : 0;
  return { metricKey: "gross_margin", metricName: "Gross Margin", value: Math.round(value * 100) / 100, unit: "%", period: `${year}-${month}` } as any;
}

async function computeTotalCustomers(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(customers).where(eq(customers.tenantId, tenantId));
  return { metricKey: "total_customers", metricName: "Total Customers", value: row?.value || 0, period: "current" };
}

async function computeTotalSuppliers(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(suppliers).where(eq(suppliers.tenantId, tenantId));
  return { metricKey: "total_suppliers", metricName: "Total Suppliers", value: row?.value || 0, period: "current" };
}

async function computeTotalProducts(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(products).where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)));
  return { metricKey: "total_products", metricName: "Total Products", value: row?.value || 0, period: "current" };
}

async function computeTotalEmployees(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db.select({ value: count() }).from(employees).where(and(eq(employees.tenantId, tenantId), eq(employees.status, "active")));
  return { metricKey: "total_employees", metricName: "Total Employees", value: row?.value || 0, period: "current" };
}

async function computeInventoryValue(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db
    .select({ value: sql`COALESCE(SUM(${inventoryBalances.totalValue}), 0)` })
    .from(inventoryBalances)
    .where(eq(inventoryBalances.tenantId, tenantId));
  return { metricKey: "inventory_value", metricName: "Inventory Value", value: Number(row?.value || 0), period: "current" };
}

async function computeInventoryTurnover(tenantId: number, fromDate: string, toDate: string): Promise<MetricResult> {
  const db = getDb();
  const [cogs] = await db
    .select({ value: sql`COALESCE(SUM(${invoiceItems.quantity} * ${products.purchasePrice}), 0)` })
    .from(invoiceItems)
    .innerJoin(products, eq(invoiceItems.productId, products.id))
    .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  const [avgInv] = await db
    .select({ value: sql`COALESCE(AVG(${inventoryBalances.totalValue}), 0)` })
    .from(inventoryBalances)
    .where(eq(inventoryBalances.tenantId, tenantId));
  const costOfGoods = Number(cogs?.value || 0);
  const avgInventory = Number(avgInv?.value || 0);
  const value = avgInventory !== 0 ? costOfGoods / avgInventory : 0;
  return { metricKey: "inventory_turnover", metricName: "Inventory Turnover", value: Math.round(value * 100) / 100, period: `${fromDate} to ${toDate}` };
}

async function computeARAgingTotal(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db
    .select({ value: sql`COALESCE(SUM(${invoices.balanceDue}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), sql`${invoices.status} IN ('sent', 'partial', 'overdue')`));
  return { metricKey: "ar_aging_total", metricName: "AR Aging Total", value: Number(row?.value || 0), period: "current" };
}

async function computeAPAgingTotal(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db
    .select({ value: sql`COALESCE(SUM(${purchaseOrders.totalAmount}), 0)` })
    .from(purchaseOrders)
    .where(and(eq(purchaseOrders.tenantId, tenantId), sql`${purchaseOrders.status} IN ('sent', 'partial')`));
  return { metricKey: "ap_aging_total", metricName: "AP Aging Total", value: Number(row?.value || 0), period: "current" };
}

async function computeAvgInvoiceValue(tenantId: number, fromDate: string, toDate: string): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db
    .select({ value: sql`COALESCE(AVG(${invoices.totalAmount}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  return { metricKey: "avg_invoice_value", metricName: "Avg Invoice Value", value: Number(row?.value || 0), period: `${fromDate} to ${toDate}` };
}

async function computeRevenuePerCustomer(tenantId: number, fromDate: string, toDate: string): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db
    .select({ total: sql`COALESCE(SUM(${invoices.totalAmount}), 0)`, cnt: count() })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  const total = Number(row?.total || 0);
  const cnt = Number(row?.cnt || 1);
  return { metricKey: "revenue_per_customer", metricName: "Revenue per Customer", value: total / cnt, period: `${fromDate} to ${toDate}` };
}

async function computeEmployeeCostRatio(tenantId: number, fromDate: string, toDate: string, year: number, month: number): Promise<MetricResult> {
  const db = getDb();
  const [salary] = await db
    .select({ value: sql`COALESCE(SUM(${salarySlips.grossSalary}), 0)` })
    .from(salarySlips)
    .where(and(eq(salarySlips.tenantId, tenantId), eq(sql`YEAR(${salarySlips.createdAt})`, year), eq(sql`MONTH(${salarySlips.createdAt})`, month)));
  const [revenue] = await db
    .select({ value: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), gte(invoices.date, fromDate), lte(invoices.date, toDate)));
  const sal = Number(salary?.value || 0);
  const rev = Number(revenue?.value || 0);
  const value = rev !== 0 ? (sal / rev) * 100 : 0;
  return { metricKey: "employee_cost_ratio", metricName: "Employee Cost Ratio", value: Math.round(value * 100) / 100, unit: "%", period: `${year}-${month}` } as any;
}

async function computeMRR(tenantId: number, year: number, month: number): Promise<MetricResult> {
  const db = getDb();
  const [row] = await db
    .select({ value: sql`COALESCE(SUM(${invoices.totalAmount}), 0)` })
    .from(invoices)
    .where(and(
      eq(invoices.tenantId, tenantId),
      eq(sql`YEAR(${invoices.date})`, year),
      eq(sql`MONTH(${invoices.date})`, month),
      sql`${invoices.status} != 'cancelled'`,
    ));
  return { metricKey: "monthly_recurring_revenue", metricName: "Monthly Recurring Revenue", value: Number(row?.value || 0), period: `${year}-${month}` };
}

async function computeCashConversionCycle(tenantId: number): Promise<MetricResult> {
  const db = getDb();
  const [ar] = await db
    .select({ value: sql`COALESCE(AVG(DATEDIFF(CURDATE(), ${invoices.date})), 0)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), sql`${invoices.status} IN ('sent', 'partial', 'overdue')`));
  const [ap] = await db
    .select({ value: sql`COALESCE(AVG(DATEDIFF(CURDATE(), ${purchaseOrders.date})), 0)` })
    .from(purchaseOrders)
    .where(and(eq(purchaseOrders.tenantId, tenantId), sql`${purchaseOrders.status} IN ('sent', 'partial')`));
  const [inv] = await db
    .select({ value: sql`COALESCE(AVG(DATEDIFF(CURDATE(), ${inventoryMovements.createdAt})), 0)` })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.tenantId, tenantId));
  const arDays = Number(ar?.value || 0);
  const apDays = Number(ap?.value || 0);
  const invDays = Number(inv?.value || 0);
  const value = invDays + arDays - apDays;
  return { metricKey: "cash_conversion_cycle", metricName: "Cash Conversion Cycle", value: Math.round(value), unit: "days", period: "current" } as any;
}
