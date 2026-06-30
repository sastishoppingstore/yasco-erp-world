import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  reportTemplates, reportSchedules,
  invoices, invoiceItems, customers, products, suppliers,
  purchaseOrders, chartOfAccounts, employees, inventoryBalances,
} from "@db/schema";
import { and, eq, desc, sql, asc } from "drizzle-orm";

const MODULE_TABLES: Record<string, { table: any; columns: Record<string, string>; joins?: string }> = {
  sales: {
    table: invoices,
    columns: {
      invoiceNumber: "Invoice Number", date: "Date", customerId: "Customer ID",
      subTotal: "Sub Total", taxAmount: "Tax Amount", totalAmount: "Total Amount",
      paidAmount: "Paid Amount", balanceDue: "Balance Due", status: "Status",
    },
  },
  sales_items: {
    table: invoiceItems,
    columns: {
      invoiceId: "Invoice ID", productId: "Product ID", quantity: "Quantity",
      unitPrice: "Unit Price", discountPercent: "Discount %", taxPercent: "Tax %",
      totalAmount: "Total Amount",
    },
  },
  customers: {
    table: customers,
    columns: {
      name: "Name", email: "Email", phone: "Phone", city: "City",
      creditLimit: "Credit Limit", currentBalance: "Balance", isActive: "Active",
    },
  },
  products: {
    table: products,
    columns: {
      sku: "SKU", name: "Name", purchasePrice: "Purchase Price",
      salePrice: "Sale Price", reorderLevel: "Reorder Level", isActive: "Active",
    },
  },
  purchase: {
    table: purchaseOrders,
    columns: {
      poNumber: "PO Number", date: "Date", supplierId: "Supplier ID",
      subTotal: "Sub Total", taxAmount: "Tax Amount", totalAmount: "Total Amount",
      status: "Status",
    },
  },
  suppliers: {
    table: suppliers,
    columns: { name: "Name", email: "Email", phone: "Phone", city: "City", currentBalance: "Balance" },
  },
  accounts: {
    table: chartOfAccounts,
    columns: {
      code: "Code", name: "Name", accountType: "Type", accountCategory: "Category",
      currentBalance: "Balance", isActive: "Active",
    },
  },
  employees: {
    table: employees,
    columns: {
      employeeCode: "Code", firstName: "First Name", lastName: "Last Name",
      email: "Email", departmentId: "Department", basicSalary: "Basic Salary",
      status: "Status",
    },
  },
  inventory: {
    table: inventoryBalances,
    columns: {
      productId: "Product ID", warehouseId: "Warehouse ID",
      quantity: "Quantity", avgCost: "Avg Cost", totalValue: "Total Value",
    },
  },
};

const AGGREGATIONS = ["sum", "avg", "count", "min", "max", "count_distinct"] as const;

async function executeReportQuery(report: any, tenantId: number): Promise<{ columns: string[]; rows: any[][] }> {
  const db = getDb();
  const cc = report.columnsConfig as any[] || [];
  const fc = report.filtersConfig as any[] || [];
  const sc = report.sortConfig as any;
  const gc = report.groupConfig as any;
  const aggs = report.aggregations as any[] || [];
  const module = report.module || "sales";

  const tableDef = MODULE_TABLES[module];
  if (!tableDef) throw new Error(`Unknown module: ${module}`);

  const selectedCols = cc.length > 0
    ? cc.map((c: any) => sql`${sql.identifier(tableDef.columns[c.field] || c.field)}`)
    : [sql`*`];

  const query = db.select({
    ...(cc.length > 0
      ? Object.fromEntries(cc.map((c: any) => [c.field, sql`${sql.identifier(c.field)}`]))
      : { all: sql`*` }),
  }).from(tableDef.table).where(eq((tableDef.table as any).tenantId, tenantId));

  // Apply filters
  for (const f of fc) {
    const field = sql.identifier(f.field);
    switch (f.operator) {
      case "eq": query.where(eq(sql`${field}`, f.value)); break;
      case "neq": query.where(sql`${field} != ${f.value}`); break;
      case "gt": query.where(sql`${field} > ${f.value}`); break;
      case "gte": query.where(sql`${field} >= ${f.value}`); break;
      case "lt": query.where(sql`${field} < ${f.value}`); break;
      case "lte": query.where(sql`${field} <= ${f.value}`); break;
      case "contains": query.where(sql`${field} LIKE ${`%${f.value}%`}`); break;
      case "in": query.where(sql`${field} IN (${f.value})`); break;
    }
  }

  // Group by
  if (gc?.field) {
    query.groupBy(sql`${sql.identifier(gc.field)}`);
  }

  // Sort
  if (sc?.field) {
    query.orderBy(sc.direction === "desc" ? desc(sql`${sql.identifier(sc.field)}`) : asc(sql`${sql.identifier(sc.field)}`));
  }

  const results = await query;
  const columns = cc.length > 0 ? cc.map((c: any) => c.label || c.field) : Object.keys(results[0] || {});
  const rows = results.map((r: any) => cc.length > 0 ? cc.map((c: any) => r[c.field]) : Object.values(r));

  return { columns, rows };
}

export const reportBuilderRouter = createRouter({
  modules: authedQuery.query(async () => {
    return Object.entries(MODULE_TABLES).map(([key, val]) => ({
      key,
      columns: Object.entries(val.columns).map(([field, label]) => ({ field, label })),
    }));
  }),

  execute: authedQuery
    .input(z.object({
      module: z.string(),
      columnsConfig: z.array(z.object({ field: z.string(), label: z.string() })),
      filtersConfig: z.array(z.object({
        field: z.string(), operator: z.string(), value: z.any(),
      })).optional().default([]),
      sortConfig: z.object({ field: z.string(), direction: z.enum(["asc", "desc"]) }).optional(),
      groupConfig: z.object({ field: z.string() }).optional(),
      aggregations: z.array(z.object({
        field: z.string(), function: z.enum(AGGREGATIONS), label: z.string().optional(),
      })).optional().default([]),
      limit: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await executeReportQuery(input, ctx.user.tenantId!);
      return result;
    }),

  save: authedQuery
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      module: z.string(),
      columnsConfig: z.any(),
      filtersConfig: z.any().optional(),
      sortConfig: z.any().optional(),
      groupConfig: z.any().optional(),
      aggregations: z.any().optional(),
      chartConfig: z.any().optional(),
      isPublic: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [tmpl] = await db.insert(reportTemplates).values({
        tenantId: ctx.user.tenantId!,
        ...input,
        createdBy: ctx.user.id,
      } as any).$returningId();
      return { success: true, id: tmpl!.id };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      columnsConfig: z.any().optional(),
      filtersConfig: z.any().optional(),
      sortConfig: z.any().optional(),
      groupConfig: z.any().optional(),
      aggregations: z.any().optional(),
      chartConfig: z.any().optional(),
      isPublic: z.boolean().optional(),
      isFavorite: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(reportTemplates).set(input).where(and(
        eq(reportTemplates.id, input.id),
        eq(reportTemplates.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  list: authedQuery
    .input(z.object({
      module: z.string().optional(),
      isFavorite: z.boolean().optional(),
      limit: z.number().optional().default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(reportTemplates.tenantId, ctx.user.tenantId!)];
      if (input?.module) conditions.push(eq(reportTemplates.module, input.module));
      if (input?.isFavorite !== undefined) conditions.push(eq(reportTemplates.isFavorite, input.isFavorite));
      return db.query.reportTemplates.findMany({
        where: and(...conditions),
        orderBy: desc(reportTemplates.createdAt),
        limit: input?.limit || 50,
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.query.reportTemplates.findFirst({
        where: and(eq(reportTemplates.id, input.id), eq(reportTemplates.tenantId, ctx.user.tenantId!)),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(reportTemplates).where(and(
        eq(reportTemplates.id, input.id),
        eq(reportTemplates.tenantId, ctx.user.tenantId!),
      ));
      await db.delete(reportSchedules).where(eq(reportSchedules.reportTemplateId, input.id));
      return { success: true };
    }),

  // Schedule management
  schedules: authedQuery
    .input(z.object({ reportTemplateId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(reportSchedules.tenantId, ctx.user.tenantId!)];
      if (input?.reportTemplateId) conditions.push(eq(reportSchedules.reportTemplateId, input.reportTemplateId));
      return db.query.reportSchedules.findMany({
        where: and(...conditions),
        orderBy: desc(reportSchedules.createdAt),
      });
    }),

  createSchedule: authedQuery
    .input(z.object({
      reportTemplateId: z.number(),
      name: z.string(),
      frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly", "cron"]),
      cronExpression: z.string().optional(),
      dayOfWeek: z.number().min(0).max(6).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
      timeOfDay: z.string().optional().default("08:00"),
      format: z.enum(["pdf", "excel", "csv"]).optional().default("pdf"),
      recipientEmails: z.array(z.string().email()),
      isActive: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [sched] = await db.insert(reportSchedules).values({
        tenantId: ctx.user.tenantId!,
        ...input,
        createdBy: ctx.user.id,
      } as any).$returningId();
      return { success: true, id: sched!.id };
    }),

  updateSchedule: authedQuery
    .input(z.object({
      id: z.number(),
      frequency: z.string().optional(),
      timeOfDay: z.string().optional(),
      format: z.string().optional(),
      recipientEmails: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(reportSchedules).set(input).where(and(
        eq(reportSchedules.id, input.id),
        eq(reportSchedules.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  deleteSchedule: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(reportSchedules).where(and(
        eq(reportSchedules.id, input.id),
        eq(reportSchedules.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),
});
