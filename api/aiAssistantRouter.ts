import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  invoices, invoiceItems, customers, suppliers,
  products, inventoryBalances, purchaseOrders,
  salarySlips, payrollPeriods, attendance,
  projects, cashboxTransactions, complianceProfiles,
  aiChatLogs,
} from "@db/schema";
import { and, eq, gte, sql, count, desc } from "drizzle-orm";

function todayDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function currentMonth() {
  return new Date().getMonth() + 1;
}

function currentYear() {
  return new Date().getFullYear();
}

function formatCurrency(val: string | number | null | undefined): string {
  const n = Number(val) || 0;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isRole(ctx: any, ...roles: string[]) {
  return roles.includes(ctx.user.role);
}

type QueryResult = {
  response: string;
  data?: any;
  queryType: string;
  suggestions?: string[];
};

async function handleTotalSalesToday(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const today = todayDate();
  const rows = await db
    .select({
      total: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      count: count(),
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, ctx.user.tenantId!),
        eq(invoices.date, today),
      ),
    );
  const total = rows[0].total;
  const count_ = rows[0].count;
  return {
    response: `Total sales for today (${today}) is **${formatCurrency(total)}** across **${count_}** invoice${count_ !== 1 ? "s" : ""}.`,
    data: { total, count: count_, date: today },
    queryType: "total_sales_today",
    suggestions: ["Show me the breakdown", "Compare with yesterday", "List today's invoices"],
  };
}

async function handleProfitThisMonth(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const start = monthStart();
  const month = currentMonth();
  const year = currentYear();

  const sales = await db
    .select({
      total: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, ctx.user.tenantId!),
        gte(invoices.date, start),
      ),
    );

  const costs = await db
    .select({
      total: sql<string>`COALESCE(SUM(${purchaseOrders.totalAmount}), 0)`,
    })
    .from(purchaseOrders)
    .where(
      and(
        eq(purchaseOrders.tenantId, ctx.user.tenantId!),
        gte(purchaseOrders.date, start),
      ),
    );

  const revenue = Number(sales[0].total);
  const expense = Number(costs[0].total);
  const profit = revenue - expense;

  return {
    response: `Profit for ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}: **${formatCurrency(profit)}** (Revenue: ${formatCurrency(revenue)}, Costs: ${formatCurrency(expense)}).`,
    data: { revenue, costs: expense, profit, month, year },
    queryType: "profit_this_month",
    suggestions: ["Show last month", "Break down by category", "Show profit margin"],
  };
}

async function handleLowStock(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const items = await db
    .select({
      productId: inventoryBalances.productId,
      productName: products.name,
      sku: products.sku,
      quantity: inventoryBalances.quantity,
      reorderLevel: products.reorderLevel,
    })
    .from(inventoryBalances)
    .innerJoin(products, eq(inventoryBalances.productId, products.id))
    .where(
      and(
        eq(inventoryBalances.tenantId, ctx.user.tenantId!),
        sql`${inventoryBalances.quantity} < ${products.reorderLevel}`,
      ),
    )
    .orderBy(sql`${inventoryBalances.quantity} ASC`);

  if (items.length === 0) {
    return {
      response: "All inventory items are above their reorder levels. No low stock alerts.",
      data: [],
      queryType: "low_stock",
      suggestions: ["Show all inventory", "Check stock valuation", "View purchase orders"],
    };
  }

  const lines = items.map(
    (i) => `- **${i.productName}** (${i.sku}): ${i.quantity} in stock, reorder at ${i.reorderLevel}`,
  );

  return {
    response: `Found **${items.length}** item${items.length !== 1 ? "s" : ""} below reorder level:\n\n${lines.join("\n")}`,
    data: items,
    queryType: "low_stock",
    suggestions: ["Create purchase orders", "Show detailed inventory", "Export low stock report"],
  };
}

async function handleCustomerBalance(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      currentBalance: customers.currentBalance,
    })
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, ctx.user.tenantId!),
        sql`${customers.currentBalance} > 0`,
      ),
    )
    .orderBy(sql`CAST(${customers.currentBalance} AS DECIMAL(18,4)) DESC`);

  if (rows.length === 0) {
    return {
      response: "No customer has an outstanding balance.",
      data: [],
      queryType: "customer_balance",
      suggestions: ["Show all customers", "Check supplier balances", "View invoices"],
    };
  }

  const totalBalance = rows.reduce((a, r) => a + Number(r.currentBalance), 0);
  const lines = rows.slice(0, 10).map(
    (r) => `- **${r.name}**: ${formatCurrency(r.currentBalance)}`,
  );

  return {
    response: `Total outstanding customer balance: **${formatCurrency(totalBalance)}** across **${rows.length}** customer${rows.length !== 1 ? "s" : ""}.\n\nTop balances:\n${lines.join("\n")}${rows.length > 10 ? `\n... and ${rows.length - 10} more` : ""}`,
    data: rows,
    queryType: "customer_balance",
    suggestions: ["Show detailed aging", "Send reminders", "Check supplier balances"],
  };
}

async function handleSupplierBalance(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const rows = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      currentBalance: suppliers.currentBalance,
    })
    .from(suppliers)
    .where(
      and(
        eq(suppliers.tenantId, ctx.user.tenantId!),
        sql`${suppliers.currentBalance} > 0`,
      ),
    )
    .orderBy(sql`CAST(${suppliers.currentBalance} AS DECIMAL(18,4)) DESC`);

  if (rows.length === 0) {
    return {
      response: "No supplier has an outstanding balance.",
      data: [],
      queryType: "supplier_balance",
      suggestions: ["Show all suppliers", "Check customer balances", "View purchase orders"],
    };
  }

  const totalBalance = rows.reduce((a, r) => a + Number(r.currentBalance), 0);
  const lines = rows.slice(0, 10).map(
    (r) => `- **${r.name}**: ${formatCurrency(r.currentBalance)}`,
  );

  return {
    response: `Total outstanding supplier balance: **${formatCurrency(totalBalance)}** across **${rows.length}** supplier${rows.length !== 1 ? "s" : ""}.\n\nTop balances:\n${lines.join("\n")}${rows.length > 10 ? `\n... and ${rows.length - 10} more` : ""}`,
    data: rows,
    queryType: "supplier_balance",
    suggestions: ["Show detailed aging", "Schedule payments", "Check customer balances"],
  };
}

async function handlePendingInvoices(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      totalAmount: invoices.totalAmount,
      balanceDue: invoices.balanceDue,
      status: invoices.status,
      date: invoices.date,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, ctx.user.tenantId!),
        sql`${invoices.status} IN ('sent', 'partial')`,
      ),
    )
    .orderBy(desc(invoices.date));

  if (rows.length === 0) {
    return {
      response: "No pending invoices found.",
      data: [],
      queryType: "pending_invoices",
      suggestions: ["Show all invoices", "Create new invoice", "Check paid invoices"],
    };
  }

  const totalDue = rows.reduce((a, r) => a + Number(r.balanceDue), 0);
  const lines = rows.slice(0, 15).map(
    (r) => `- **${r.invoiceNumber}** (${r.date}) — ${formatCurrency(r.balanceDue)} [${r.status}]`,
  );

  return {
    response: `Found **${rows.length}** pending invoice${rows.length !== 1 ? "s" : ""} with total due **${formatCurrency(totalDue)}**.\n\n${lines.join("\n")}${rows.length > 15 ? `\n... and ${rows.length - 15} more` : ""}`,
    data: rows,
    queryType: "pending_invoices",
    suggestions: ["Send reminders", "Show overdue invoices", "View invoice details"],
  };
}

async function handleBestSellingItem(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const rows = await db
    .select({
      productId: invoiceItems.productId,
      productName: products.name,
      totalQty: sql<string>`SUM(${invoiceItems.quantity})`,
      totalRevenue: sql<string>`SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice})`,
    })
    .from(invoiceItems)
    .innerJoin(products, eq(invoiceItems.productId, products.id))
    .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
    .where(eq(invoices.tenantId, ctx.user.tenantId!))
    .groupBy(invoiceItems.productId, products.name)
    .orderBy(sql`SUM(${invoiceItems.quantity}) DESC`)
    .limit(10);

  if (rows.length === 0) {
    return {
      response: "No sales data available yet.",
      data: [],
      queryType: "best_selling_item",
      suggestions: ["Create an invoice", "View products", "Check inventory"],
    };
  }

  const lines = rows.map(
    (r, i) => `${i + 1}. **${r.productName}** — sold ${r.totalQty} units, revenue ${formatCurrency(r.totalRevenue)}`,
  );

  return {
    response: `Best selling items:\n\n${lines.join("\n")}`,
    data: rows,
    queryType: "best_selling_item",
    suggestions: ["Show low performers", "View inventory levels", "Create purchase order"],
  };
}

async function handlePayrollSummary(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const period = await db
    .select()
    .from(payrollPeriods)
    .where(
      and(
        eq(payrollPeriods.tenantId, ctx.user.tenantId!),
        eq(payrollPeriods.month, currentMonth()),
        eq(payrollPeriods.year, currentYear()),
      ),
    )
    .limit(1);

  if (period.length === 0) {
    return {
      response: `No payroll period found for ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}.`,
      data: [],
      queryType: "payroll_summary",
      suggestions: ["Create payroll period", "Show last period", "View salary slips"],
    };
  }

  const slips = await db
    .select({
      totalGross: sql<string>`COALESCE(SUM(${salarySlips.grossSalary}), 0)`,
      totalDeductions: sql<string>`COALESCE(SUM(${salarySlips.totalDeductions}), 0)`,
      totalNet: sql<string>`COALESCE(SUM(${salarySlips.netSalary}), 0)`,
      count: count(),
    })
    .from(salarySlips)
    .where(
      and(
        eq(salarySlips.tenantId, ctx.user.tenantId!),
        eq(salarySlips.payrollPeriodId, period[0].id),
      ),
    );

  return {
    response: `Payroll summary for **${period[0].name}**: ${slips[0].count} employee${slips[0].count !== 1 ? "s" : ""}, gross **${formatCurrency(slips[0].totalGross)}**, deductions **${formatCurrency(slips[0].totalDeductions)}**, net pay **${formatCurrency(slips[0].totalNet)}**.`,
    data: { period: period[0], ...slips[0] },
    queryType: "payroll_summary",
    suggestions: ["View salary slips", "Run payroll", "Show employee details"],
  };
}

async function handleAttendance(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const today = todayDate();
  const rows = await db
    .select({
      status: attendance.status,
      count: count(),
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.tenantId, ctx.user.tenantId!),
        eq(attendance.date, today),
      ),
    )
    .groupBy(attendance.status);

  if (rows.length === 0) {
    return {
      response: `No attendance records for today (${today}).`,
      data: [],
      queryType: "employee_attendance",
      suggestions: ["Take attendance", "Show weekly view", "View leave requests"],
    };
  }

  const total = rows.reduce((a, r) => a + Number(r.count), 0);
  const lines = rows.map((r) => `- **${r.status}**: ${r.count}`);

  return {
    response: `Attendance for **${today}**: **${total}** employee${total !== 1 ? "s" : ""} recorded.\n\n${lines.join("\n")}`,
    data: rows,
    queryType: "employee_attendance",
    suggestions: ["Show absentees", "View this week", "Check overtime"],
  };
}

async function handleProjectStatus(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const rows = await db
    .select({
      status: projects.status,
      count: count(),
      totalBudget: sql<string>`COALESCE(SUM(${projects.budget}), 0)`,
    })
    .from(projects)
    .where(eq(projects.tenantId, ctx.user.tenantId!))
    .groupBy(projects.status);

  if (rows.length === 0) {
    return {
      response: "No projects found.",
      data: [],
      queryType: "project_status",
      suggestions: ["Create a project", "View tasks", "Check timesheets"],
    };
  }

  const lines = rows.map(
    (r) => `- **${r.status}**: ${r.count} project${r.count !== 1 ? "s" : ""} (budget: ${formatCurrency(r.totalBudget)})`,
  );

  return {
    response: `Project summary by status:\n\n${lines.join("\n")}`,
    data: rows,
    queryType: "project_status",
    suggestions: ["Active projects", "Overdue tasks", "Project details"],
  };
}

async function handleTaxReport(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const rows = await db
    .select({
      taxPercent: invoices.taxPercent,
      totalTax: sql<string>`COALESCE(SUM(${invoices.taxAmount}), 0)`,
      totalAmount: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      count: count(),
    })
    .from(invoices)
    .where(eq(invoices.tenantId, ctx.user.tenantId!))
    .groupBy(invoices.taxPercent);

  if (rows.length === 0) {
    return {
      response: "No invoice data available for tax report.",
      data: [],
      queryType: "tax_report",
      suggestions: ["Create invoices", "Check tax rates", "View compliance status"],
    };
  }

  const grandTax = rows.reduce((a, r) => a + Number(r.totalTax), 0);
  const lines = rows.map(
    (r) => `- **${r.taxPercent}%** tax: ${formatCurrency(r.totalTax)} tax amount on ${formatCurrency(r.totalAmount)} (${r.count} invoice${r.count !== 1 ? "s" : ""})`,
  );

  return {
    response: `Tax report summary:\n\n${lines.join("\n")}\n\nTotal tax amount: **${formatCurrency(grandTax)}**`,
    data: rows,
    queryType: "tax_report",
    suggestions: ["Export report", "View by period", "Check VAT return"],
  };
}

async function handleCashboxClosing(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const today = todayDate();
  const rows = await db
    .select({
      transactionType: cashboxTransactions.transactionType,
      totalAmount: sql<string>`COALESCE(SUM(${cashboxTransactions.amount}), 0)`,
      count: count(),
    })
    .from(cashboxTransactions)
    .where(
      and(
        eq(cashboxTransactions.tenantId, ctx.user.tenantId!),
        sql`DATE(${cashboxTransactions.createdAt}) = ${today}`,
        eq(cashboxTransactions.status, "completed"),
      ),
    )
    .groupBy(cashboxTransactions.transactionType);

  if (rows.length === 0) {
    return {
      response: `No cashbox transactions for today (${today}).`,
      data: [],
      queryType: "cashbox_closing",
      suggestions: ["Open cashbox", "Record transaction", "View balance"],
    };
  }

  const cashIn = rows.filter((r) => ["cash_in", "sale", "income", "customer_payment"].includes(r.transactionType));
  const cashOut = rows.filter((r) => ["cash_out", "purchase", "expense", "supplier_payment"].includes(r.transactionType));
  const totalIn = cashIn.reduce((a, r) => a + Number(r.totalAmount), 0);
  const totalOut = cashOut.reduce((a, r) => a + Number(r.totalAmount), 0);
  const lines = rows.map((r) => `- **${r.transactionType}**: ${formatCurrency(r.totalAmount)} (${r.count} tx)`);

  return {
    response: `Cashbox summary for **${today}**:\n\nInflows: **${formatCurrency(totalIn)}**\nOutflows: **${formatCurrency(totalOut)}**\nNet: **${formatCurrency(totalIn - totalOut)}**\n\n${lines.join("\n")}`,
    data: { date: today, inflows: totalIn, outflows: totalOut, net: totalIn - totalOut, details: rows },
    queryType: "cashbox_closing",
    suggestions: ["Print closing report", "View balance", "Record opening"],
  };
}

async function handleComplianceStatus(ctx: any): Promise<QueryResult> {
  const db = getDb();
  const zatcaInvoices = await db
    .select({
      status: invoices.zatcaStatus,
      count: count(),
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, ctx.user.tenantId!),
        sql`${invoices.zatcaStatus} IS NOT NULL`,
      ),
    )
    .groupBy(invoices.zatcaStatus);

  const profiles = await db
    .select()
    .from(complianceProfiles)
    .where(eq(complianceProfiles.tenantId, ctx.user.tenantId!));

  if (zatcaInvoices.length === 0 && profiles.length === 0) {
    return {
      response: "No compliance data available.",
      data: [],
      queryType: "compliance_status",
      suggestions: ["Configure compliance profiles", "Enable ZATCA", "View tax report"],
    };
  }

  const lines: string[] = [];
  if (profiles.length > 0) {
    lines.push("**Compliance Profiles:**");
    for (const p of profiles) {
      lines.push(`- ${p.profileName} (${p.countryCode}) — ${p.isActive ? "Active" : "Inactive"}`);
    }
  }
  if (zatcaInvoices.length > 0) {
    lines.push("**ZATCA Status:**");
    for (const z of zatcaInvoices) {
      lines.push(`- ${z.status}: ${z.count} invoice${z.count !== 1 ? "s" : ""}`);
    }
  }

  return {
    response: `Compliance status:\n\n${lines.join("\n")}`,
    data: { zatcaInvoices, complianceProfiles: profiles },
    queryType: "compliance_status",
    suggestions: ["Update compliance config", "Submit ZATCA reports", "View full report"],
  };
}

function detectIntent(query: string): { handler: (ctx: any) => Promise<QueryResult>; type: string } | null {
  const q = query.toLowerCase().trim();

  const patterns: { regex: RegExp; type: string }[] = [
    { regex: /total.*sales.*today|sales.*today|today.*sales/i, type: "total_sales_today" },
    { regex: /profit.*(this|current).*month|profit.*month|month.*profit/i, type: "profit_this_month" },
    { regex: /low.*stock|stock.*alert|reorder|items.*below/i, type: "low_stock" },
    { regex: /customer.*(balance|due|outstanding)|balance.*customer/i, type: "customer_balance" },
    { regex: /supplier.*(balance|due|outstanding)|balance.*supplier|vendor.*balance/i, type: "supplier_balance" },
    { regex: /pending.*invoice|unpaid.*invoice|outstanding.*invoice/i, type: "pending_invoices" },
    { regex: /best.*sell|top.*product|most.*sold|popular.*item/i, type: "best_selling_item" },
    { regex: /payroll.*(summary|total|overview)|salary.*summary/i, type: "payroll_summary" },
    { regex: /attendance.*(today|summary|status)|who.*(present|absent)/i, type: "employee_attendance" },
    { regex: /project.*(status|summary|overview)|status.*project/i, type: "project_status" },
    { regex: /tax.*(report|summary|return)|vat.*report/i, type: "tax_report" },
    { regex: /cashbox.*(closing|summary|today)|closing.*cash/i, type: "cashbox_closing" },
    { regex: /compliance.*(status|report)|zatca|fbr.*status/i, type: "compliance_status" },
  ];

  for (const p of patterns) {
    if (p.regex.test(q)) {
      return { handler: handlerMap[p.type], type: p.type };
    }
  }

  return null;
}

const handlerMap: Record<string, (ctx: any) => Promise<QueryResult>> = {
  total_sales_today: handleTotalSalesToday,
  profit_this_month: handleProfitThisMonth,
  low_stock: handleLowStock,
  customer_balance: handleCustomerBalance,
  supplier_balance: handleSupplierBalance,
  pending_invoices: handlePendingInvoices,
  best_selling_item: handleBestSellingItem,
  payroll_summary: handlePayrollSummary,
  employee_attendance: handleAttendance,
  project_status: handleProjectStatus,
  tax_report: handleTaxReport,
  cashbox_closing: handleCashboxClosing,
  compliance_status: handleComplianceStatus,
};

function roleAccess(queryType: string, ctx: any): boolean {
  if (isRole(ctx, "super_admin", "admin")) return true;
  const financial = ["total_sales_today", "profit_this_month", "pending_invoices", "best_selling_item", "tax_report", "customer_balance", "supplier_balance"];
  const hr = ["payroll_summary", "employee_attendance"];
  const inventory = ["low_stock"];
  const ops = ["project_status", "cashbox_closing", "compliance_status"];

  if (financial.includes(queryType)) return isRole(ctx, "accountant", "manager", "salesman");
  if (hr.includes(queryType)) return isRole(ctx, "hr", "manager");
  if (inventory.includes(queryType)) return isRole(ctx, "store_keeper", "manager");
  if (ops.includes(queryType)) return isRole(ctx, "manager", "cashier");

  return false;
}

async function saveChatLog(ctx: any, query: string, response: string, queryType: string, sessionId?: string, ms?: number) {
  const db = getDb();
  await db.insert(aiChatLogs).values({
    tenantId: ctx.user.tenantId!,
    userId: ctx.user.id,
    sessionId: sessionId || null,
    query,
    response,
    queryType,
    processingTimeMs: ms || 0,
  });
}

export const aiAssistantRouter = createRouter({
  ask: authedQuery
    .input(z.object({
      query: z.string(),
      sessionId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const start = Date.now();
      const intent = detectIntent(input.query);

      if (!intent) {
        const fallback = {
          response: `I'm not sure how to answer that. I can help with: total sales today, profit this month, low stock items, customer/supplier balances, pending invoices, best selling items, payroll summary, attendance, project status, tax report, cashbox closing, and compliance status.`,
          data: null,
          queryType: "unknown",
          suggestions: [
            "total sales today",
            "profit this month",
            "low stock items",
            "customer balances",
            "pending invoices",
            "best selling item",
            "payroll summary",
            "project status",
            "tax report",
            "cashbox closing",
            "compliance status",
          ],
        };
        await saveChatLog(ctx, input.query, fallback.response, "unknown", input.sessionId, Date.now() - start);
        return fallback;
      }

      if (!roleAccess(intent.type, ctx)) {
        const denied = {
          response: "You do not have permission to access this information.",
          data: null,
          queryType: intent.type,
          suggestions: [],
        };
        await saveChatLog(ctx, input.query, denied.response, intent.type, input.sessionId, Date.now() - start);
        return denied;
      }

      try {
        const result = await intent.handler(ctx);
        await saveChatLog(ctx, input.query, result.response, result.queryType, input.sessionId, Date.now() - start);
        return result;
      } catch (err: any) {
        const errorResp = {
          response: `Sorry, an error occurred while processing your request: ${err.message || "Unknown error"}`,
          data: null,
          queryType: intent.type,
          suggestions: ["Try again", "Ask a different question", "Contact support"],
        };
        await saveChatLog(ctx, input.query, errorResp.response, intent.type, input.sessionId, Date.now() - start);
        return errorResp;
      }
    }),

  chatHistory: authedQuery
    .input(z.object({
      sessionId: z.string().optional(),
      limit: z.number().min(1).max(100).optional().default(20),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [
        eq(aiChatLogs.tenantId, ctx.user.tenantId!),
        eq(aiChatLogs.userId, ctx.user.id!),
      ];
      if (input?.sessionId) conditions.push(eq(aiChatLogs.sessionId, input.sessionId));
      return db
        .select()
        .from(aiChatLogs)
        .where(and(...conditions))
        .orderBy(desc(aiChatLogs.createdAt))
        .limit(input?.limit || 20);
    }),

  clearHistory: authedQuery
    .input(z.object({
      sessionId: z.string().optional(),
    }).optional())
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [
        eq(aiChatLogs.tenantId, ctx.user.tenantId!),
        eq(aiChatLogs.userId, ctx.user.id!),
      ];
      if (input?.sessionId) conditions.push(eq(aiChatLogs.sessionId, input.sessionId));
      await db.delete(aiChatLogs).where(and(...conditions));
      return { success: true };
    }),
});
