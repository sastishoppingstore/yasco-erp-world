import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  invoices, customers, suppliers, products, employees,
  inventoryBalances, journalEntries, supportTickets,
  projects, purchaseOrders
} from "@db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const [totalCustomers] = await db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.tenantId, tenantId));
      const [totalSuppliers] = await db.select({ count: sql<number>`count(*)` }).from(suppliers).where(eq(suppliers.tenantId, tenantId));
      const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.tenantId, tenantId));
      const [totalEmployees] = await db.select({ count: sql<number>`count(*)` }).from(employees).where(eq(employees.tenantId, tenantId));

      const [revenueResult] = await db.select({
        total: sql<number>`coalesce(sum(total_amount), 0)`
      }).from(invoices).where(and(eq(invoices.tenantId, tenantId), eq(invoices.status, "paid")));

      const [payableResult] = await db.select({
        total: sql<number>`coalesce(sum(total_amount), 0)`
      }).from(purchaseOrders).where(and(eq(purchaseOrders.tenantId, tenantId), eq(purchaseOrders.status, "invoiced")));

      const [openTickets] = await db.select({ count: sql<number>`count(*)` })
        .from(supportTickets)
        .where(and(eq(supportTickets.tenantId, tenantId), eq(supportTickets.status, "open")));

      const [activeProjects] = await db.select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(and(eq(projects.tenantId, tenantId), eq(projects.status, "active")));

      const [lowStockItems] = await db.select({ count: sql<number>`count(*)` })
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.tenantId, tenantId), sql`quantity <= 10`));

      return {
        totalCustomers: totalCustomers.count,
        totalSuppliers: totalSuppliers.count,
        totalProducts: totalProducts.count,
        totalEmployees: totalEmployees.count,
        totalRevenue: Number(revenueResult.total),
        totalPayable: Number(payableResult.total),
        openTickets: openTickets.count,
        activeProjects: activeProjects.count,
        lowStockItems: lowStockItems.count,
      };
    }),

  revenueByMonth: authedQuery
    .input(z.object({ year: z.number() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const year = input?.year || new Date().getFullYear();

      const result = await db.select({
        month: sql<string>`month(date)`,
        total: sql<number>`coalesce(sum(total_amount), 0)`,
      })
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, tenantId),
          sql`year(date) = ${year}`
        ))
        .groupBy(sql`month(date)`);

      return result;
    }),

  expenseByCategory: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const result = await db.select({
        type: journalEntries.referenceType,
        total: sql<number>`coalesce(sum(total_debit), 0)`,
      })
        .from(journalEntries)
        .where(eq(journalEntries.tenantId, tenantId))
        .groupBy(journalEntries.referenceType);

      return result;
    }),

  recentInvoices: authedQuery
    .input(z.object({ limit: z.number().default(5) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 5;

      return db.select().from(invoices)
        .where(eq(invoices.tenantId, tenantId))
        .orderBy(sql`created_at desc`)
        .limit(limit);
    }),

  topCustomers: authedQuery
    .input(z.object({ limit: z.number().default(5) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 5;

      return db.select().from(customers)
        .where(eq(customers.tenantId, tenantId))
        .orderBy(sql`current_balance desc`)
        .limit(limit);
    }),
});
