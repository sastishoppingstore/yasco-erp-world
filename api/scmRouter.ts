import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  supplierEvaluations, supplierContracts, rfqHeaders, rfqItems,
  rfqSupplierQuotes, rfqQuoteLines, bidComparisons, supplierPortalUsers,
  supplierRfqResponses, supplierPerformanceMetrics, consignmentInventory,
  suppliers, purchaseOrders
} from "@db/schema";
import { eq, sql, and, desc, gte, lte } from "drizzle-orm";

export const scmRouter = createRouter({
  // Supplier Evaluations
  evaluationList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(supplierEvaluations).where(eq(supplierEvaluations.tenantId, ctx.user.tenantId!)).orderBy(desc(supplierEvaluations.createdAt));
  }),
  evaluationCreate: authedQuery.input(z.object({
    supplierId: z.number(), evaluationDate: z.string(),
    qualityScore: z.string(), deliveryScore: z.string(),
    priceScore: z.string(), serviceScore: z.string(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const overall = ((Number(input.qualityScore) + Number(input.deliveryScore) + Number(input.priceScore) + Number(input.serviceScore)) / 4).toFixed(2);
    const avg = Number(overall);
    const category = avg >= 90 ? "excellent" : avg >= 75 ? "good" : avg >= 60 ? "average" : "poor";
    const [{ id }] = await db.insert(supplierEvaluations).values({
      ...input, overallScore: overall, category: category as any,
      tenantId: ctx.user.tenantId!, evaluatorId: ctx.user.id,
    }).$returningId();
    return { id, success: true };
  }),

  // Supplier Contracts
  contractList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(supplierContracts).where(eq(supplierContracts.tenantId, ctx.user.tenantId!)).orderBy(desc(supplierContracts.createdAt));
  }),
  contractCreate: authedQuery.input(z.object({
    supplierId: z.number(), contractNumber: z.string(), title: z.string(),
    startDate: z.string(), endDate: z.string().optional(),
    terms: z.string().optional(), value: z.string(), currency: z.string().optional(),
    renewalReminderDays: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(supplierContracts).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // RFQ
  rfqList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(rfqHeaders).where(eq(rfqHeaders.tenantId, ctx.user.tenantId!)).orderBy(desc(rfqHeaders.createdAt));
  }),
  rfqGet: authedQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const header = await db.query.rfqHeaders.findFirst({ where: eq(rfqHeaders.id, input.id) });
    const items = await db.select().from(rfqItems).where(eq(rfqItems.rfqId, input.id));
    const quotes = await db.select().from(rfqSupplierQuotes).where(eq(rfqSupplierQuotes.rfqId, input.id));
    const quoteLines = await Promise.all(quotes.map(q => db.select().from(rfqQuoteLines).where(eq(rfqQuoteLines.quoteId, q.id))));
    return { header, items, quotes, quoteLines: quoteLines.flat() };
  }),
  rfqCreate: authedQuery.input(z.object({
    rfqNumber: z.string(), title: z.string(), description: z.string().optional(),
    deadlineDate: z.string(), expectedDeliveryDate: z.string().optional(),
    currency: z.string().optional(), notes: z.string().optional(),
    items: z.array(z.object({
      productId: z.number().optional(), productName: z.string(),
      quantity: z.string(), unit: z.string().optional(), targetPrice: z.string().optional(),
    })),
    supplierIds: z.array(z.number()).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const { items, supplierIds, ...headerData } = input;
    const [{ id }] = await db.insert(rfqHeaders).values({ ...headerData, tenantId: ctx.user.tenantId!, buyerId: ctx.user.id }).$returningId();
    for (const item of items) {
      await db.insert(rfqItems).values({ ...item, rfqId: id });
    }
    if (supplierIds) {
      for (const sid of supplierIds) {
        await db.insert(rfqSupplierQuotes).values({ rfqId: id, supplierId: sid, status: "draft" });
      }
    }
    return { id, success: true };
  }),

  // RFQ Supplier Quotes
  quoteList: authedQuery.input(z.object({ rfqId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(rfqSupplierQuotes).where(eq(rfqSupplierQuotes.rfqId, input.rfqId));
  }),

  // Bid Comparisons
  bidComparisonList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(bidComparisons).where(eq(bidComparisons.tenantId, ctx.user.tenantId!)).orderBy(desc(bidComparisons.createdAt));
  }),
  createBidComparison: authedQuery.input(z.object({
    rfqId: z.number(), comparisonDate: z.string(),
    criteria: z.any(), summary: z.string().optional(),
    recommendedSupplierId: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(bidComparisons).values({
      ...input, tenantId: ctx.user.tenantId!, preparedBy: ctx.user.id,
    }).$returningId();
    return { id, success: true };
  }),

  // Supplier Portal Users
  portalUserList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(supplierPortalUsers).where(eq(supplierPortalUsers.tenantId, ctx.user.tenantId!));
  }),
  portalUserCreate: authedQuery.input(z.object({
    supplierId: z.number(), email: z.string(), name: z.string(),
    phone: z.string().optional(), passwordHash: z.string(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(supplierPortalUsers).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // Performance Metrics
  performanceMetricList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(supplierPerformanceMetrics).where(eq(supplierPerformanceMetrics.tenantId, ctx.user.tenantId!)).orderBy(desc(supplierPerformanceMetrics.createdAt));
  }),

  // Consignment Inventory
  consignmentList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(consignmentInventory).where(eq(consignmentInventory.tenantId, ctx.user.tenantId!));
  }),

  // Supplier Scorecard
  supplierScorecard: authedQuery.input(z.object({ supplierId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const evals = await db.select().from(supplierEvaluations).where(eq(supplierEvaluations.supplierId, input.supplierId));
    const metrics = await db.select().from(supplierPerformanceMetrics).where(eq(supplierPerformanceMetrics.supplierId, input.supplierId));
    const contracts = await db.select().from(supplierContracts).where(eq(supplierContracts.supplierId, input.supplierId));
    return { evaluations: evals, performanceMetrics: metrics, contracts };
  }),

  // Evaluate Supplier (calculate overall)
  evaluateSupplier: authedQuery.input(z.object({ supplierId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const evals = await db.select().from(supplierEvaluations).where(eq(supplierEvaluations.supplierId, input.supplierId));
    if (evals.length === 0) return { avgQuality: 0, avgDelivery: 0, avgPrice: 0, avgService: 0, overall: 0, category: "N/A" };
    const avgQuality = evals.reduce((s, e) => s + Number(e.qualityScore), 0) / evals.length;
    const avgDelivery = evals.reduce((s, e) => s + Number(e.deliveryScore), 0) / evals.length;
    const avgPrice = evals.reduce((s, e) => s + Number(e.priceScore), 0) / evals.length;
    const avgService = evals.reduce((s, e) => s + Number(e.serviceScore), 0) / evals.length;
    const overall = (avgQuality + avgDelivery + avgPrice + avgService) / 4;
    const category = overall >= 90 ? "excellent" : overall >= 75 ? "good" : overall >= 60 ? "average" : "poor";
    return { avgQuality, avgDelivery, avgPrice, avgService, overall, category };
  }),

  // RFQ Dashboard
  rfqDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const open = await db.select({ count: sql<number>`count(*)` }).from(rfqHeaders).where(and(eq(rfqHeaders.tenantId, tenantId), eq(rfqHeaders.status, "sent")));
    const evaluated = await db.select({ count: sql<number>`count(*)` }).from(rfqHeaders).where(and(eq(rfqHeaders.tenantId, tenantId), eq(rfqHeaders.status, "evaluated")));
    const closed = await db.select({ count: sql<number>`count(*)` }).from(rfqHeaders).where(and(eq(rfqHeaders.tenantId, tenantId), eq(rfqHeaders.status, "closed")));
    return {
      openRfqs: Number(open[0]?.count || 0),
      evaluatedRfqs: Number(evaluated[0]?.count || 0),
      closedRfqs: Number(closed[0]?.count || 0),
    };
  }),

  // SCM Dashboard
  scmDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const totalSuppliers = await db.select({ count: sql<number>`count(*)` }).from(suppliers).where(eq(suppliers.tenantId, tenantId));
    const totalContracts = await db.select({ count: sql<number>`count(*)` }).from(supplierContracts).where(eq(supplierContracts.tenantId, tenantId));
    const activeContracts = await db.select({ count: sql<number>`count(*)` }).from(supplierContracts).where(and(eq(supplierContracts.tenantId, tenantId), eq(supplierContracts.status, "active")));
    const totalEvaluations = await db.select({ count: sql<number>`count(*)` }).from(supplierEvaluations).where(eq(supplierEvaluations.tenantId, tenantId));
    return {
      totalSuppliers: Number(totalSuppliers[0]?.count || 0),
      totalContracts: Number(totalContracts[0]?.count || 0),
      activeContracts: Number(activeContracts[0]?.count || 0),
      totalEvaluations: Number(totalEvaluations[0]?.count || 0),
    };
  }),
});
