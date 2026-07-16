import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  invoices, invoiceItems, products, customers,
  purchaseOrders, purchaseOrderItems,
  salesOrders, salesOrderItems,
  chartOfAccounts, journalEntries, journalEntryLines,
  inventoryBalances, inventoryMovements,
  cashboxTransactions,
} from "@db/schema";
import { eq, sql, and, gte, lte, like, desc, sum } from "drizzle-orm";

export const reportsRouter = createRouter({
  salesReport: authedQuery
    .input(z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      groupBy: z.enum(["day", "month", "year"]).default("month"),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(invoices.tenantId, tenantId)];
      if (input.from) conditions.push(gte(invoices.date, input.from));
      if (input.to) conditions.push(lte(invoices.date, input.to));

      const dateFormat = input.groupBy === "day" ? invoices.date
        : input.groupBy === "year" ? sql`date_format(${invoices.date}, '%Y')`
        : sql`date_format(${invoices.date}, '%Y-%m')`;

      const rows = await db.select({
        period: dateFormat,
        count: sql<number>`count(*)`,
        subtotal: sql<number>`coalesce(sum(${invoices.subTotal}), 0)`,
        tax: sql<number>`coalesce(sum(${invoices.taxAmount}), 0)`,
        total: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)`,
        paid: sql<number>`coalesce(sum(${invoices.paidAmount}), 0)`,
        balance: sql<number>`coalesce(sum(${invoices.balanceDue}), 0)`,
      })
        .from(invoices)
        .where(and(...conditions))
        .groupBy(sql`1`)
        .orderBy(sql`1`);

      const [{ totalRevenue, totalTax, totalPaid, invoiceCount }] = await db.select({
        totalRevenue: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)`,
        totalTax: sql<number>`coalesce(sum(${invoices.taxAmount}), 0)`,
        totalPaid: sql<number>`coalesce(sum(${invoices.paidAmount}), 0)`,
        invoiceCount: sql<number>`count(*)`,
      }).from(invoices).where(and(...conditions));

      return { rows, summary: { totalRevenue, totalTax, totalPaid, invoiceCount } };
    }),

  inventoryReport: authedQuery
    .input(z.object({ categoryId: z.number().optional() }).optional())
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const rows = await db.select({
        productId: products.id,
        sku: products.sku,
        name: products.name,
        salePrice: products.salePrice,
        purchasePrice: products.purchasePrice,
        quantity: sql<number>`coalesce(${inventoryBalances.quantity}, 0)`,
        totalValue: sql<number>`coalesce(${inventoryBalances.totalValue}, 0)`,
      })
        .from(products)
        .leftJoin(inventoryBalances, eq(products.id, inventoryBalances.productId))
        .where(eq(products.tenantId, tenantId))
        .orderBy(desc(inventoryBalances.totalValue));

      const [{ totalProducts, totalQty, totalValue }] = await db.select({
        totalProducts: sql<number>`count(distinct ${products.id})`,
        totalQty: sql<number>`coalesce(sum(${inventoryBalances.quantity}), 0)`,
        totalValue: sql<number>`coalesce(sum(${inventoryBalances.totalValue}), 0)`,
      })
        .from(products)
        .leftJoin(inventoryBalances, eq(products.id, inventoryBalances.productId))
        .where(eq(products.tenantId, tenantId));

      return { rows, summary: { totalProducts, totalQty, totalValue } };
    }),

  financialReport: authedQuery
    .input(z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(journalEntries.tenantId, tenantId), eq(journalEntries.isPosted, true)];
      if (input.from) conditions.push(gte(journalEntries.date, input.from));
      if (input.to) conditions.push(lte(journalEntries.date, input.to));

      const rows = await db.select({
        accountId: chartOfAccounts.id,
        code: chartOfAccounts.code,
        name: chartOfAccounts.name,
        accountType: chartOfAccounts.accountType,
        accountCategory: chartOfAccounts.accountCategory,
        debit: sql<number>`coalesce(sum(${journalEntryLines.debit}), 0)`,
        credit: sql<number>`coalesce(sum(${journalEntryLines.credit}), 0)`,
        net: sql<number>`coalesce(sum(${journalEntryLines.debit}), 0) - coalesce(sum(${journalEntryLines.credit}), 0)`,
      })
        .from(chartOfAccounts)
        .leftJoin(journalEntryLines, eq(chartOfAccounts.id, journalEntryLines.accountId))
        .leftJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(and(...conditions))
        .groupBy(chartOfAccounts.id)
        .orderBy(chartOfAccounts.code);

      const revenue = rows.filter(r => r.accountType === "revenue").reduce((s, r) => s + r.net, 0);
      const expenses = rows.filter(r => r.accountType === "expense").reduce((s, r) => s + Math.abs(r.net), 0);
      const cogs = rows.filter(r => r.accountType === "cost_of_sales").reduce((s, r) => s + Math.abs(r.net), 0);
      const assets = rows.filter(r => r.accountType === "asset").reduce((s, r) => s + r.net, 0);
      const liabilities = rows.filter(r => r.accountType === "liability").reduce((s, r) => s + r.net, 0);
      const equity = rows.filter(r => r.accountType === "equity").reduce((s, r) => s + r.net, 0);

      return {
        rows,
        summary: {
          revenue: Math.abs(revenue),
          expenses: Math.abs(expenses),
          cogs: Math.abs(cogs),
          grossProfit: Math.abs(revenue) - Math.abs(cogs),
          netProfit: Math.abs(revenue) - Math.abs(cogs) - Math.abs(expenses),
          totalAssets: Math.abs(assets),
          totalLiabilities: Math.abs(liabilities),
          totalEquity: Math.abs(equity),
        },
      };
    }),

  taxReport: authedQuery
    .input(z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(invoices.tenantId, tenantId)];
      if (input.from) conditions.push(gte(invoices.date, input.from));
      if (input.to) conditions.push(lte(invoices.date, input.to));

      const rows = await db.select({
        invoiceId: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        date: invoices.date,
        customerId: invoices.customerId,
        subtotal: invoices.subTotal,
        taxPercent: invoices.taxPercent,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
      })
        .from(invoices)
        .where(and(...conditions))
        .orderBy(desc(invoices.date));

      const totals = rows.reduce((acc, r) => ({
        totalSubtotal: acc.totalSubtotal + Number(r.subtotal),
        totalTax: acc.totalTax + Number(r.taxAmount),
        totalAmount: acc.totalAmount + Number(r.totalAmount),
        count: acc.count + 1,
      }), { totalSubtotal: 0, totalTax: 0, totalAmount: 0, count: 0 });

      return { rows, summary: totals };
    }),

  agingReport: authedQuery
    .input(z.object({ asOfDate: z.string().optional() }).optional())
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const rows = await db.select({
        customerId: customers.id,
        customerName: customers.name,
        customerCode: customers.code,
        total: sql<number>`coalesce(sum(${invoices.balanceDue}), 0)`,
        current: sql<number>`coalesce(sum(case when ${invoices.balanceDue} > 0 and ${invoices.dueDate} >= curdate() then ${invoices.balanceDue} else 0 end), 0)`,
        days1to30: sql<number>`coalesce(sum(case when ${invoices.balanceDue} > 0 and ${invoices.dueDate} between date_sub(curdate(), interval 30 day) and curdate() then ${invoices.balanceDue} else 0 end), 0)`,
        days31to60: sql<number>`coalesce(sum(case when ${invoices.balanceDue} > 0 and ${invoices.dueDate} between date_sub(curdate(), interval 60 day) and date_sub(curdate(), interval 31 day) then ${invoices.balanceDue} else 0 end), 0)`,
        days61to90: sql<number>`coalesce(sum(case when ${invoices.balanceDue} > 0 and ${invoices.dueDate} between date_sub(curdate(), interval 90 day) and date_sub(curdate(), interval 61 day) then ${invoices.balanceDue} else 0 end), 0)`,
        days91plus: sql<number>`coalesce(sum(case when ${invoices.balanceDue} > 0 and ${invoices.dueDate} < date_sub(curdate(), interval 90 day) then ${invoices.balanceDue} else 0 end), 0)`,
      })
        .from(customers)
        .leftJoin(invoices, eq(customers.id, invoices.customerId))
        .where(and(eq(customers.tenantId, tenantId), eq(invoices.tenantId, tenantId)))
        .groupBy(customers.id)
        .having(sql`coalesce(sum(${invoices.balanceDue}), 0) > 0`)
        .orderBy(desc(sql`coalesce(sum(${invoices.balanceDue}), 0)`));

      const total = rows.reduce((s, r) => s + Number(r.total), 0);
      return { rows, summary: { totalOutstanding: total, customerCount: rows.length } };
    }),

  purchaseReport: authedQuery
    .input(z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(purchaseOrders.tenantId, tenantId)];
      if (input.from) conditions.push(gte(purchaseOrders.date, input.from));
      if (input.to) conditions.push(lte(purchaseOrders.date, input.to));

      const rows = await db.select({
        period: sql`date_format(${purchaseOrders.date}, '%Y-%m')`,
        count: sql<number>`count(*)`,
        subtotal: sql<number>`coalesce(sum(${purchaseOrders.subTotal}), 0)`,
        tax: sql<number>`coalesce(sum(${purchaseOrders.taxAmount}), 0)`,
        total: sql<number>`coalesce(sum(${purchaseOrders.totalAmount}), 0)`,
      })
        .from(purchaseOrders)
        .where(and(...conditions))
        .groupBy(sql`1`)
        .orderBy(sql`1`);

      const [{ totalAmount, poCount }] = await db.select({
        totalAmount: sql<number>`coalesce(sum(${purchaseOrders.totalAmount}), 0)`,
        poCount: sql<number>`count(*)`,
      }).from(purchaseOrders).where(and(...conditions));

      return { rows, summary: { totalAmount, poCount } };
    }),
});
