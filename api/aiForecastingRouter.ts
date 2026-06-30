import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  invoices, invoiceItems, products, customers,
  purchaseOrders, inventoryBalances, inventoryMovements,
  aiForecastResults, journalEntries, chartOfAccounts,
  customerPayments, supplierPayments,
} from "@db/schema";
import { and, eq, gte, lte, sql, count, desc, asc } from "drizzle-orm";

function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (data[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const yPred = data.map((_, i) => slope * i + intercept);
  const ssRes = data.reduce((a, y, i) => a + (y - yPred[i]) ** 2, 0);
  const ssTot = data.reduce((a, y) => a + (y - yMean) ** 2, 0);
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
  return { slope, intercept, r2 };
}

function detectSeasonality(data: number[]): { periods: number[]; strength: number } {
  if (data.length < 6) return { periods: [], strength: 0 };
  const autocorr: number[] = [];
  for (let lag = 1; lag <= Math.floor(data.length / 2); lag++) {
    const n = data.length - lag;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (data[i] - mean) * (data[i + lag] - mean);
      den += (data[i] - mean) ** 2;
    }
    autocorr.push(den !== 0 ? num / den : 0);
  }
  const periods = autocorr.map((v, i) => ({ lag: i + 1, value: Math.abs(v) })).sort((a, b) => b.value - a.value).slice(0, 3).filter(p => p.value > 0.3).map(p => p.lag);
  const strength = periods.length > 0 ? autocorr[periods[0] - 1] || 0 : 0;
  return { periods, strength: Math.abs(strength) };
}

function forecast(data: number[], periods: number): { values: number[]; lower: number[]; upper: number[]; confidence: number } {
  if (data.length < 3) {
    const last = data[data.length - 1] || 0;
    return { values: Array(periods).fill(last), lower: Array(periods).fill(last * 0.9), upper: Array(periods).fill(last * 1.1), confidence: 0.5 };
  }
  const ma = movingAverage(data, Math.min(3, data.length));
  const reg = linearRegression([...data, ...ma.slice(-3)]);
  const seasonality = detectSeasonality(data);
  const values: number[] = [];
  const n = data.length;
  for (let i = 0; i < periods; i++) {
    let v = reg.slope * (n + i) + reg.intercept;
    if (seasonality.periods.length > 0) {
      const seasonalLag = seasonality.periods[0];
      const seasonalComponent = i < seasonalLag ? (data[n - seasonalLag + i] || 0) - (reg.slope * (n - seasonalLag + i) + reg.intercept) : values[i - seasonalLag] - (reg.slope * (n + i - seasonalLag) + reg.intercept);
      v += seasonalComponent * Math.min(seasonality.strength, 0.5);
    }
    values.push(Math.max(0, v));
  }
  const residuals = data.map((v, i) => Math.abs(v - (reg.slope * i + reg.intercept)));
  const stdErr = residuals.reduce((a, b) => a + b, 0) / Math.max(residuals.length, 1);
  const confidence = Math.min(Math.max(reg.r2, 0.3), 0.95);
  const z = 1.96;
  const lower = values.map(v => Math.max(0, v - z * stdErr));
  const upper = values.map(v => v + z * stdErr);
  return { values, lower, upper, confidence };
}

export const aiForecastingRouter = createRouter({
  demand: authedQuery
    .input(z.object({
      productIds: z.array(z.number()).optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      forecastPeriods: z.number().min(1).max(24).optional().default(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const fromDate = input.fromDate || `${new Date().getFullYear() - 1}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
      const toDate = input.toDate || new Date().toISOString().slice(0, 10);

      const salesData = await db
        .select({
          month: sql<string>`DATE_FORMAT(${invoices.date}, '%Y-%m')`,
          productId: invoiceItems.productId,
          productName: products.name,
          totalQty: sql<string>`SUM(${invoiceItems.quantity})`,
          totalRevenue: sql<string>`SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice})`,
        })
        .from(invoices)
        .innerJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
        .innerJoin(products, eq(invoiceItems.productId, products.id))
        .where(and(
          eq(invoices.tenantId, ctx.user.tenantId!),
          input.productIds?.length ? sql`${invoiceItems.productId} IN (${input.productIds.join(",")})` : sql`1=1`,
          gte(invoices.date, fromDate),
          lte(invoices.date, toDate),
        ))
        .groupBy(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`, invoiceItems.productId)
        .orderBy(asc(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`));

      const grouped: Record<string, { month: string; qty: number; revenue: number }[]> = {};
      for (const r of salesData) {
        const key = `${r.productId}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ month: r.month, qty: Number(r.totalQty), revenue: Number(r.totalRevenue) });
      }

      const forecasts: any[] = [];
      for (const [productKey, data] of Object.entries(grouped)) {
        const qtyData = data.map(d => d.qty);
        const revData = data.map(d => d.revenue);
        const qtyFc = forecast(qtyData, input.forecastPeriods);
        const revFc = forecast(revData, input.forecastPeriods);
        const seasonality = detectSeasonality(qtyData);
        const product = salesData.find(s => `${s.productId}` === productKey);
        forecasts.push({
          productId: parseInt(productKey),
          productName: product?.productName || `Product ${productKey}`,
          historical: data,
          forecast: {
            periods: Array.from({ length: input.forecastPeriods }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() + i + 1);
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            }),
            qty: qtyFc.values,
            qtyLower: qtyFc.lower,
            qtyUpper: qtyFc.upper,
            revenue: revFc.values,
            revenueLower: revFc.lower,
            revenueUpper: revFc.upper,
            confidence: qtyFc.confidence,
          },
          seasonality: { periods: seasonality.periods, strength: seasonality.strength },
        });
      }

      await db.insert(aiForecastResults).values({
        tenantId: ctx.user.tenantId!,
        forecastType: "demand",
        parameters: input,
        historicalData: salesData,
        forecastData: forecasts,
        seasonalPatterns: forecasts.map(f => f.seasonality),
        periodStart: fromDate,
        periodEnd: toDate,
        createdBy: ctx.user.id,
      } as any);

      return { success: true, data: forecasts, type: "demand" };
    }),

  sales: authedQuery
    .input(z.object({
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      forecastPeriods: z.number().min(1).max(24).optional().default(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const fromDate = input.fromDate || `${new Date().getFullYear() - 2}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
      const toDate = input.toDate || new Date().toISOString().slice(0, 10);

      const data = await db
        .select({
          month: sql<string>`DATE_FORMAT(${invoices.date}, '%Y-%m')`,
          total: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
          count: count(),
        })
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, ctx.user.tenantId!),
          gte(invoices.date, fromDate),
          lte(invoices.date, toDate),
        ))
        .groupBy(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`)
        .orderBy(asc(sql`DATE_FORMAT(${invoices.date}, '%Y-%m')`));

      const values = data.map(d => Number(d.total));
      const fc = forecast(values, input.forecastPeriods);
      const seasonality = detectSeasonality(values);

      const result = {
        historical: data,
        forecast: {
          periods: Array.from({ length: input.forecastPeriods }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() + i + 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          }),
          values: fc.values,
          lower: fc.lower,
          upper: fc.upper,
          confidence: fc.confidence,
        },
        seasonality: { periods: seasonality.periods, strength: seasonality.strength },
        trend: linearRegression(values),
      };

      await db.insert(aiForecastResults).values({
        tenantId: ctx.user.tenantId!,
        forecastType: "sales",
        parameters: input,
        historicalData: data,
        forecastData: result,
        seasonalPatterns: seasonality,
        periodStart: fromDate,
        periodEnd: toDate,
        createdBy: ctx.user.id,
      } as any);

      return { success: true, data: result, type: "sales" };
    }),

  cashflow: authedQuery
    .input(z.object({
      fromDate: z.string().optional(),
      forecastPeriods: z.number().min(1).max(12).optional().default(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const fromDate = input.fromDate || `${new Date().getFullYear() - 1}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
      const toDate = new Date().toISOString().slice(0, 10);

      const ar = await db
        .select({
          month: sql<string>`DATE_FORMAT(${customerPayments.date}, '%Y-%m')`,
          inflow: sql<string>`COALESCE(SUM(${customerPayments.amount}), 0)`,
        })
        .from(customerPayments)
        .where(and(eq(customerPayments.tenantId, ctx.user.tenantId!), gte(customerPayments.date, fromDate)))
        .groupBy(sql`DATE_FORMAT(${customerPayments.date}, '%Y-%m')`)
        .orderBy(asc(sql`DATE_FORMAT(${customerPayments.date}, '%Y-%m')`));

      const ap = await db
        .select({
          month: sql<string>`DATE_FORMAT(${supplierPayments.date}, '%Y-%m')`,
          outflow: sql<string>`COALESCE(SUM(${supplierPayments.amount}), 0)`,
        })
        .from(supplierPayments)
        .where(and(eq(supplierPayments.tenantId, ctx.user.tenantId!), gte(supplierPayments.date, fromDate)))
        .groupBy(sql`DATE_FORMAT(${supplierPayments.date}, '%Y-%m')`)
        .orderBy(asc(sql`DATE_FORMAT(${supplierPayments.date}, '%Y-%m')`));

      const monthlyMap: Record<string, { inflow: number; outflow: number; net: number }> = {};
      for (const r of ar) {
        if (!monthlyMap[r.month]) monthlyMap[r.month] = { inflow: 0, outflow: 0, net: 0 };
        monthlyMap[r.month].inflow = Number(r.inflow);
      }
      for (const r of ap) {
        if (!monthlyMap[r.month]) monthlyMap[r.month] = { inflow: 0, outflow: 0, net: 0 };
        monthlyMap[r.month].outflow = Number(r.outflow);
      }
      const months = Object.keys(monthlyMap).sort();
      for (const m of months) {
        monthlyMap[m].net = monthlyMap[m].inflow - monthlyMap[m].outflow;
      }
      const netValues = months.map(m => monthlyMap[m].net);
      const fc = forecast(netValues.length > 0 ? netValues : [0], input.forecastPeriods);
      const currentBalance = await db
        .select({ value: sql<string>`COALESCE(SUM(${chartOfAccounts.currentBalance}), 0)` })
        .from(chartOfAccounts)
        .where(and(eq(chartOfAccounts.tenantId, ctx.user.tenantId!), eq(chartOfAccounts.accountType, "asset"), eq(chartOfAccounts.isCashAccount, true)));

      const result = {
        historical: months.map(m => ({ month: m, ...monthlyMap[m] })),
        forecast: {
          periods: Array.from({ length: input.forecastPeriods }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() + i + 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          }),
          netCashflow: fc.values,
          lower: fc.lower,
          upper: fc.upper,
          confidence: fc.confidence,
        },
        currentCashBalance: Number(currentBalance[0]?.value || 0),
      };

      await db.insert(aiForecastResults).values({
        tenantId: ctx.user.tenantId!,
        forecastType: "cashflow",
        parameters: input,
        forecastData: result,
        periodStart: fromDate,
        periodEnd: toDate,
        createdBy: ctx.user.id,
      } as any);

      return { success: true, data: result, type: "cashflow" };
    }),

  reorderPoints: authedQuery
    .input(z.object({
      productIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const productsData = input?.productIds?.length
        ? await db.select().from(products).where(and(eq(products.tenantId, ctx.user.tenantId!), sql`${products.id} IN (${input.productIds.join(",")})`))
        : await db.select().from(products).where(eq(products.tenantId, ctx.user.tenantId!));

      const reorderPoints: any[] = [];
      for (const p of productsData) {
        const sales = await db
          .select({ qty: sql<string>`COALESCE(SUM(${invoiceItems.quantity}), 0)` })
          .from(invoiceItems)
          .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
          .where(and(
            eq(invoiceItems.productId, p.id),
            eq(invoices.tenantId, ctx.user.tenantId!),
            gte(invoices.date, `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`),
          ));

        const currentStock = await db
          .select({ qty: inventoryBalances.quantity })
          .from(inventoryBalances)
          .where(and(eq(inventoryBalances.productId, p.id), eq(inventoryBalances.tenantId, ctx.user.tenantId!)))
          .limit(1);

        const monthlySales = Number(sales[0]?.qty || 0);
        const currentQty = currentStock[0]?.qty || 0;
        const avgMonthlyDemand = Math.max(monthlySales, 1);
        const leadTimeDays = 7;
        const leadTimeMonths = leadTimeDays / 30;
        const safetyStock = Math.ceil(avgMonthlyDemand * 0.25);
        const reorderPoint = Math.ceil(avgMonthlyDemand * leadTimeMonths + safetyStock);
        const daysUntilStockout = avgMonthlyDemand > 0 ? Math.floor((currentQty / avgMonthlyDemand) * 30) : 999;

        reorderPoints.push({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          currentQty,
          avgMonthlyDemand,
          safetyStock,
          suggestedReorderPoint: Math.max(reorderPoint, p.reorderLevel || 0),
          currentReorderLevel: p.reorderLevel,
          daysUntilStockout,
          suggestedReorderQty: Math.ceil(avgMonthlyDemand * 1.5),
          leadTimeDays,
        });
      }

      return { success: true, data: reorderPoints.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout) };
    }),

  history: authedQuery
    .input(z.object({
      forecastType: z.enum(["demand", "sales", "cashflow", "reorder_points"]).optional(),
      limit: z.number().optional().default(20),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(aiForecastResults.tenantId, ctx.user.tenantId!)];
      if (input?.forecastType) conditions.push(eq(aiForecastResults.forecastType, input.forecastType));
      return db.select()
        .from(aiForecastResults)
        .where(and(...conditions))
        .orderBy(desc(aiForecastResults.createdAt))
        .limit(input?.limit || 20);
    }),
});
