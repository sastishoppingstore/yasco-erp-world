import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  invoices, invoiceItems, customers, suppliers, products,
  inventoryBalances, purchaseOrders, aiReportTemplates,
} from "@db/schema";
import { and, eq, gte, lte, sql, count, desc, like } from "drizzle-orm";
import { generateResponse } from "./services/gemini";

const REPORT_HANDLERS: Record<string, (ctx: any, params: any) => Promise<any>> = {
  top_selling_products: async (ctx, { fromDate, toDate, limit }) => {
    const db = getDb();
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        productNameAr: products.nameAr,
        sku: products.sku,
        totalQty: sql<string>`SUM(${invoiceItems.quantity})`,
        totalRevenue: sql<string>`SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice})`,
        avgPrice: sql<string>`AVG(${invoiceItems.unitPrice})`,
      })
      .from(invoiceItems)
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(and(
        eq(invoices.tenantId, ctx.user.tenantId!),
        fromDate ? gte(invoices.date, fromDate) : sql`1=1`,
        toDate ? lte(invoices.date, toDate) : sql`1=1`,
      ))
      .groupBy(invoiceItems.productId)
      .orderBy(desc(sql`SUM(${invoiceItems.quantity})`))
      .limit(limit || 10);
    return { type: "table", data: rows };
  },

  sales_summary: async (ctx, { fromDate, toDate }) => {
    const db = getDb();
    const rows = await db
      .select({
        period: sql<string>`DATE_FORMAT(${invoices.date}, '%Y-%m')`,
        count: count(),
        total: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
        tax: sql<string>`COALESCE(SUM(${invoices.taxAmount}), 0)`,
        paid: sql<string>`COALESCE(SUM(${invoices.paidAmount}), 0)`,
        balance: sql<string>`COALESCE(SUM(${invoices.balanceDue}), 0)`,
      })
      .from(invoices)
      .where(and(
        eq(invoices.tenantId, ctx.user.tenantId!),
        fromDate ? gte(invoices.date, fromDate) : sql`1=1`,
        toDate ? lte(invoices.date, toDate) : sql`1=1`,
      ))
      .groupBy(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`)
      .orderBy(desc(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`));
    return { type: "table", data: rows };
  },

  customer_aging: async (ctx) => {
    const db = getDb();
    const rows = await db
      .select({
        customerId: customers.id,
        customerName: customers.name,
        current: sql<string>`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) <= 0 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
        days1to30: sql<string>`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) BETWEEN 1 AND 30 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
        days31to60: sql<string>`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) BETWEEN 31 AND 60 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
        days61to90: sql<string>`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) BETWEEN 61 AND 90 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
        days91plus: sql<string>`COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), ${invoices.dueDate}) > 90 THEN ${invoices.balanceDue} ELSE 0 END), 0)`,
        totalDue: sql<string>`COALESCE(SUM(${invoices.balanceDue}), 0)`,
      })
      .from(customers)
      .innerJoin(invoices, eq(customers.id, invoices.customerId))
      .where(and(eq(customers.tenantId, ctx.user.tenantId!), sql`${invoices.status} IN ('sent', 'partial', 'overdue')`))
      .groupBy(customers.id)
      .orderBy(desc(sql`COALESCE(SUM(${invoices.balanceDue}), 0)`));
    return { type: "table", data: rows };
  },

  inventory_status: async (ctx, { lowStockOnly }) => {
    const db = getDb();
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        productNameAr: products.nameAr,
        sku: products.sku,
        quantity: inventoryBalances.quantity,
        avgCost: inventoryBalances.avgCost,
        totalValue: inventoryBalances.totalValue,
        reorderLevel: products.reorderLevel,
        status: sql<string>`CASE WHEN ${inventoryBalances.quantity} <= 0 THEN 'out_of_stock' WHEN ${inventoryBalances.quantity} < ${products.reorderLevel} THEN 'low_stock' ELSE 'in_stock' END`,
      })
      .from(products)
      .leftJoin(inventoryBalances, eq(products.id, inventoryBalances.productId))
      .where(and(
        eq(products.tenantId, ctx.user.tenantId!),
        lowStockOnly ? sql`${inventoryBalances.quantity} < ${products.reorderLevel}` : sql`1=1`,
      ))
      .orderBy(sql`${inventoryBalances.quantity} ASC`);
    return { type: "table", data: rows };
  },

  profit_analysis: async (ctx, { fromDate, toDate }) => {
    const db = getDb();
    const sales = await db
      .select({
        period: sql<string>`DATE_FORMAT(${invoices.date}, '%Y-%m')`,
        revenue: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
        cost: sql<string>`COALESCE(SUM(${invoiceItems.quantity} * ${products.purchasePrice}), 0)`,
        count: count(),
      })
      .from(invoices)
      .innerJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .where(and(
        eq(invoices.tenantId, ctx.user.tenantId!),
        fromDate ? gte(invoices.date, fromDate) : sql`1=1`,
        toDate ? lte(invoices.date, toDate) : sql`1=1`,
      ))
      .groupBy(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`)
      .orderBy(desc(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`));
    const data = sales.map(r => ({
      ...r,
      revenue: Number(r.revenue),
      cost: Number(r.cost),
      profit: Number(r.revenue) - Number(r.cost),
      margin: Number(r.revenue) !== 0 ? ((Number(r.revenue) - Number(r.cost)) / Number(r.revenue) * 100).toFixed(2) : "0.00",
    }));
    return { type: "bar", data };
  },

  expense_breakdown: async (ctx, { fromDate, toDate }) => {
    const db = getDb();
    const rows = await db
      .select({
        category: purchaseOrders.status,
        total: sql<string>`COALESCE(SUM(${purchaseOrders.totalAmount}), 0)`,
        count: count(),
      })
      .from(purchaseOrders)
      .where(and(
        eq(purchaseOrders.tenantId, ctx.user.tenantId!),
        fromDate ? gte(purchaseOrders.date, fromDate) : sql`1=1`,
        toDate ? lte(purchaseOrders.date, toDate) : sql`1=1`,
      ))
      .groupBy(purchaseOrders.status);
    return { type: "pie", data: rows };
  },
};

async function parseNLQuery(query: string): Promise<{ intent: string; params: Record<string, any>; confidence: number }> {
  const q = query.toLowerCase();
  const intents = [
    { regex: /top\s+(\d+)?\s*sell(ing)?\s*(product|item)/i, intent: "top_selling_products", extract: (m: RegExpMatchArray) => ({ limit: parseInt(m[1] || "10") }) },
    { regex: /sales\s*(summary|report|overview)/i, intent: "sales_summary", extract: () => ({}) },
    { regex: /(customer|ar|receivable).*aging/i, intent: "customer_aging", extract: () => ({}) },
    { regex: /(inventory|stock)\s*(status|report|level)/i, intent: "inventory_status", extract: () => ({}) },
    { regex: /low\s*stock/i, intent: "inventory_status", extract: () => ({ lowStockOnly: true }) },
    { regex: /profit\s*(analysis|margin|breakdown)/i, intent: "profit_analysis", extract: () => ({}) },
    { regex: /expense\s*(breakdown|by.category|analysis)/i, intent: "expense_breakdown", extract: () => ({}) },
  ];
  for (const intent of intents) {
    const m = q.match(intent.regex);
    if (m) return { intent: intent.intent, params: intent.extract(m), confidence: 0.85 };
  }
  return { intent: "unknown", params: {}, confidence: 0 };
}

async function getAiConfig(ctx: any) {
  const db = getDb();
  const { companySettings } = await import("@db/schema");
  const settings = await db.query.companySettings.findFirst({
    where: eq(companySettings.tenantId, ctx.user.tenantId!),
    columns: { aiApiKey: true, aiModel: true },
  });
  return { apiKey: settings?.aiApiKey || "", model: settings?.aiModel || "gemini-2.0-flash" };
}

export const aiReportsRouter = createRouter({
  generate: authedQuery
    .input(z.object({
      query: z.string(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      limit: z.number().optional(),
      language: z.enum(["en", "ar"]).optional().default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const parsed = await parseNLQuery(input.query);

      if (parsed.intent === "unknown") {
        const aiConfig = await getAiConfig(ctx);
        const aiResp = await generateResponse({
          query: `Generate a report SQL query for: ${input.query}. Return the intent and parameters.`,
          ...aiConfig,
        });
        return { success: false, message: "Could not understand query. Try: 'top 5 selling products', 'sales summary', 'customer aging', 'inventory status', 'profit analysis', 'expense breakdown'", aiSuggestion: aiResp };
      }

      const handler = REPORT_HANDLERS[parsed.intent];
      if (!handler) return { success: false, message: `Unknown report type: ${parsed.intent}` };

      const result = await handler(ctx, { ...parsed.params, fromDate: input.fromDate, toDate: input.toDate });

      const aiConfig = await getAiConfig(ctx);
      let naturalResponse = "";
      if (aiConfig.apiKey) {
        naturalResponse = await generateResponse({
          query: `${input.query}\n\nReport data: ${JSON.stringify(result.data)}`,
          ...aiConfig,
        }) || "";
      }

      const template = await db.insert(aiReportTemplates).values({
        tenantId: ctx.user.tenantId!,
        name: `${parsed.intent} - ${new Date().toISOString().slice(0, 10)}`,
        naturalLanguageQuery: input.query,
        parsedIntent: parsed.intent,
        resultCache: result,
        chartType: result.type,
        createdBy: ctx.user.id,
      } as any).$returningId();

      return {
        success: true,
        intent: parsed.intent,
        chartType: result.type,
        data: result.data,
        templateId: template?.[0]?.id,
        naturalResponse,
        language: input.language,
      };
    }),

  saved: authedQuery
    .input(z.object({ limit: z.number().optional().default(50) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.query.aiReportTemplates.findMany({
        where: eq(aiReportTemplates.tenantId, ctx.user.tenantId!),
        orderBy: desc(aiReportTemplates.createdAt),
        limit: input?.limit || 50,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.query.aiReportTemplates.findFirst({
        where: and(eq(aiReportTemplates.id, input.id), eq(aiReportTemplates.tenantId, ctx.user.tenantId!)),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(aiReportTemplates).where(and(
        eq(aiReportTemplates.id, input.id),
        eq(aiReportTemplates.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),
});
