import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  dashboards, dashboardWidgets, biMetricsDefinitions,
} from "@db/schema";
import { and, eq, desc, asc } from "drizzle-orm";
import { calculateMetric, calculateTrend, drillDown } from "./lib/bi/metricsEngine";

const WIDGET_TYPES = ["line_chart", "bar_chart", "pie_chart", "table", "kpi_card", "gauge"] as const;

const DASHBOARD_TEMPLATES: Record<string, { name: string; nameAr: string; description: string; widgets: any[] }> = {
  executive: {
    name: "Executive Dashboard", nameAr: "لوحة القيادة التنفيذية", description: "High-level KPIs for executives",
    widgets: [
      { widgetType: "kpi_card", title: "Total Revenue", dataSource: { metricKey: "total_revenue" }, positionX: 0, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Net Profit", dataSource: { metricKey: "net_profit" }, positionX: 3, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Gross Margin", dataSource: { metricKey: "gross_margin" }, positionX: 6, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Inventory Value", dataSource: { metricKey: "inventory_value" }, positionX: 9, positionY: 0, width: 3, height: 2 },
      { widgetType: "line_chart", title: "Revenue Trend", dataSource: { metricKey: "total_revenue", trend: true }, positionX: 0, positionY: 2, width: 6, height: 4 },
      { widgetType: "bar_chart", title: "Revenue by Customer", dataSource: { metricKey: "revenue_by_customer", drillDown: true }, positionX: 6, positionY: 2, width: 6, height: 4 },
    ],
  },
  sales: {
    name: "Sales Dashboard", nameAr: "لوحة المبيعات", description: "Sales performance metrics",
    widgets: [
      { widgetType: "kpi_card", title: "Monthly Revenue", dataSource: { metricKey: "total_revenue" }, positionX: 0, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Avg Invoice Value", dataSource: { metricKey: "avg_invoice_value" }, positionX: 3, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Total Customers", dataSource: { metricKey: "total_customers" }, positionX: 6, positionY: 0, width: 3, height: 2 },
      { widgetType: "bar_chart", title: "Sales by Month", dataSource: { metricKey: "total_revenue", trend: true }, positionX: 0, positionY: 2, width: 12, height: 4 },
    ],
  },
  finance: {
    name: "Finance Dashboard", nameAr: "لوحة المالية", description: "Financial health metrics",
    widgets: [
      { widgetType: "kpi_card", title: "AR Aging", dataSource: { metricKey: "ar_aging_total" }, positionX: 0, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "AP Aging", dataSource: { metricKey: "ap_aging_total" }, positionX: 3, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Cash Conversion Cycle", dataSource: { metricKey: "cash_conversion_cycle" }, positionX: 6, positionY: 0, width: 3, height: 2 },
      { widgetType: "line_chart", title: "Cash Flow Projection", dataSource: { metricKey: "cashflow", custom: true }, positionX: 0, positionY: 2, width: 12, height: 4 },
    ],
  },
  inventory: {
    name: "Inventory Dashboard", nameAr: "لوحة المخزون", description: "Inventory and stock metrics",
    widgets: [
      { widgetType: "kpi_card", title: "Inventory Value", dataSource: { metricKey: "inventory_value" }, positionX: 0, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Inventory Turnover", dataSource: { metricKey: "inventory_turnover" }, positionX: 3, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Total Products", dataSource: { metricKey: "total_products" }, positionX: 6, positionY: 0, width: 3, height: 2 },
    ],
  },
  hr: {
    name: "HR Dashboard", nameAr: "لوحة الموارد البشرية", description: "HR and workforce metrics",
    widgets: [
      { widgetType: "kpi_card", title: "Total Employees", dataSource: { metricKey: "total_employees" }, positionX: 0, positionY: 0, width: 3, height: 2 },
      { widgetType: "kpi_card", title: "Employee Cost Ratio", dataSource: { metricKey: "employee_cost_ratio" }, positionX: 3, positionY: 0, width: 3, height: 2 },
    ],
  },
};

export const dashboardBuilderRouter = createRouter({
  list: authedQuery
    .input(z.object({ templateKey: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(dashboards.tenantId, ctx.user.tenantId!)];
      if (input?.templateKey) conditions.push(eq(dashboards.templateKey, input.templateKey));
      return db.query.dashboards.findMany({
        where: and(...conditions),
        orderBy: desc(dashboards.createdAt),
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const dashboard = await db.query.dashboards.findFirst({
        where: and(eq(dashboards.id, input.id), eq(dashboards.tenantId, ctx.user.tenantId!)),
      });
      if (!dashboard) return null;
      const widgets = await db.query.dashboardWidgets.findMany({
        where: and(eq(dashboardWidgets.dashboardId, input.id), eq(dashboardWidgets.tenantId, ctx.user.tenantId!)),
        orderBy: [asc(dashboardWidgets.positionY), asc(dashboardWidgets.positionX)],
      });
      return { ...dashboard, widgets };
    }),

  create: authedQuery
    .input(z.object({
      name: z.string(),
      nameAr: z.string().optional(),
      description: z.string().optional(),
      templateKey: z.string().optional(),
      isDefault: z.boolean().optional().default(false),
      roles: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [dash] = await db.insert(dashboards).values({
        tenantId: ctx.user.tenantId!,
        name: input.name,
        nameAr: input.nameAr,
        description: input.description,
        templateKey: input.templateKey,
        isDefault: input.isDefault,
        roles: input.roles || null,
        createdBy: ctx.user.id,
      } as any).$returningId();

      if (input.templateKey && DASHBOARD_TEMPLATES[input.templateKey]) {
        const tmpl = DASHBOARD_TEMPLATES[input.templateKey];
        for (const w of tmpl.widgets) {
          await db.insert(dashboardWidgets).values({
            tenantId: ctx.user.tenantId!,
            dashboardId: dash!.id,
            ...w,
          } as any);
        }
      }

      return { success: true, id: dash!.id };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameAr: z.string().optional(),
      description: z.string().optional(),
      layout: z.any().optional(),
      isDefault: z.boolean().optional(),
      isShared: z.boolean().optional(),
      roles: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(dashboards).set(input).where(and(
        eq(dashboards.id, input.id),
        eq(dashboards.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(dashboardWidgets).where(and(
        eq(dashboardWidgets.dashboardId, input.id),
        eq(dashboardWidgets.tenantId, ctx.user.tenantId!),
      ));
      await db.delete(dashboards).where(and(
        eq(dashboards.id, input.id),
        eq(dashboards.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  // Widget CRUD
  addWidget: authedQuery
    .input(z.object({
      dashboardId: z.number(),
      widgetType: z.enum(WIDGET_TYPES),
      title: z.string(),
      titleAr: z.string().optional(),
      dataSource: z.any(),
      visualConfig: z.any().optional(),
      positionX: z.number().optional().default(0),
      positionY: z.number().optional().default(0),
      width: z.number().optional().default(4),
      height: z.number().optional().default(3),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [widget] = await db.insert(dashboardWidgets).values({
        tenantId: ctx.user.tenantId!,
        ...input,
      } as any).$returningId();
      return { success: true, id: widget!.id };
    }),

  updateWidget: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      titleAr: z.string().optional(),
      dataSource: z.any().optional(),
      visualConfig: z.any().optional(),
      positionX: z.number().optional(),
      positionY: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      isVisible: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(dashboardWidgets).set(input).where(and(
        eq(dashboardWidgets.id, input.id),
        eq(dashboardWidgets.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  deleteWidget: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(dashboardWidgets).where(and(
        eq(dashboardWidgets.id, input.id),
        eq(dashboardWidgets.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  // Data execution for widgets
  executeWidget: authedQuery
    .input(z.object({
      widgetId: z.number(),
      dashboardId: z.number(),
      period: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const widget = await db.query.dashboardWidgets.findFirst({
        where: and(
          eq(dashboardWidgets.id, input.widgetId),
          eq(dashboardWidgets.dashboardId, input.dashboardId),
          eq(dashboardWidgets.tenantId, ctx.user.tenantId!),
        ),
      });
      if (!widget) throw new Error("Widget not found");

      const ds = widget.dataSource as any;
      if (ds?.metricKey) {
        if (ds.trend) {
          const trend = await calculateTrend(ds.metricKey, ctx.user.tenantId!);
          return { type: widget.widgetType, title: widget.title, data: trend.periods, trend: trend.trend, changePercent: trend.changePercent };
        }
        if (ds.drillDown) {
          const dd = await drillDown(ds.metricKey, ctx.user.tenantId!, "customer");
          return { type: widget.widgetType, title: widget.title, data: dd };
        }
        const metric = await calculateMetric(ds.metricKey, ctx.user.tenantId!);
        return { type: widget.widgetType, title: widget.title, data: metric };
      }

      return { type: widget.widgetType, title: widget.title, data: null };
    }),

  // Templates
  templates: authedQuery.query(async () => {
    return Object.entries(DASHBOARD_TEMPLATES).map(([key, tmpl]) => ({
      key,
      name: tmpl.name,
      nameAr: tmpl.nameAr,
      description: tmpl.description,
      widgetCount: tmpl.widgets.length,
    }));
  }),

  duplicate: authedQuery
    .input(z.object({ id: z.number(), newName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const source = await db.query.dashboards.findFirst({
        where: and(eq(dashboards.id, input.id), eq(dashboards.tenantId, ctx.user.tenantId!)),
      });
      if (!source) throw new Error("Dashboard not found");
      const [dash] = await db.insert(dashboards).values({
        tenantId: ctx.user.tenantId!,
        name: input.newName,
        nameAr: source.nameAr,
        description: source.description,
        templateKey: source.templateKey,
        createdBy: ctx.user.id,
      } as any).$returningId();
      const widgets = await db.query.dashboardWidgets.findMany({
        where: eq(dashboardWidgets.dashboardId, input.id),
      });
      for (const w of widgets) {
        await db.insert(dashboardWidgets).values({
          tenantId: ctx.user.tenantId!,
          dashboardId: dash!.id,
          widgetType: w.widgetType,
          title: w.title,
          titleAr: w.titleAr,
          dataSource: w.dataSource,
          visualConfig: w.visualConfig,
          positionX: w.positionX,
          positionY: w.positionY,
          width: w.width,
          height: w.height,
        } as any);
      }
      return { success: true, id: dash!.id };
    }),
});
