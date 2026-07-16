import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  performanceObligations, contractAssets, contractLiabilities,
  revenueRecognitionSchedules, contractModifications, contractCosts,
  chartOfAccounts, journalEntries, journalEntryLines,
} from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const ifrs15Router = createRouter({
  obligationList: authedQuery
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(performanceObligations.tenantId, ctx.user.tenantId!)];
      if (input?.contractId) conditions.push(eq(performanceObligations.contractId, input.contractId));
      return db.select().from(performanceObligations).where(and(...conditions)).orderBy(desc(performanceObligations.createdAt));
    }),

  obligationCreate: authedQuery
    .input(z.object({
      contractId: z.number().optional(), obligationName: z.string(),
      description: z.string().optional(),
      obligationType: z.enum(["good", "service", "software", "support", "construction"]),
      performanceTiming: z.enum(["point_in_time", "over_time"]),
      transactionPrice: z.string().optional(), standalonePrice: z.string().optional(),
      allocatedAmount: z.string().optional(),
      recognitionMethod: z.enum(["output", "input", "straight_line"]).optional(),
      startDate: z.string().optional(), endDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(performanceObligations).values({
        tenantId: ctx.user.tenantId!, contractId: input.contractId,
        obligationName: input.obligationName, description: input.description,
        obligationType: input.obligationType,
        performanceTiming: input.performanceTiming,
        transactionPrice: input.transactionPrice || "0",
        standalonePrice: input.standalonePrice || "0",
        allocatedAmount: input.allocatedAmount || "0",
        recognitionMethod: input.recognitionMethod || "straight_line",
        startDate: input.startDate, endDate: input.endDate, notes: input.notes,
      }).$returningId();
      return { id, success: true };
    }),

  obligationUpdate: authedQuery
    .input(z.object({
      id: z.number(), completionPercent: z.string().optional(),
      status: z.enum(["identified", "satisfied", "partially_satisfied", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(performanceObligations).set(input).where(eq(performanceObligations.id, input.id));
      return { success: true };
    }),

  contractAssetList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(contractAssets).where(eq(contractAssets.tenantId, ctx.user.tenantId!)).orderBy(desc(contractAssets.createdAt));
    }),

  contractAssetCreate: authedQuery
    .input(z.object({
      contractId: z.number().optional(), obligationId: z.number().optional(),
      assetType: z.enum(["contract_asset", "receivable", "unbilled_receivable"]),
      amount: z.string(), date: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(contractAssets).values({
        tenantId: ctx.user.tenantId!, contractId: input.contractId,
        obligationId: input.obligationId, assetType: input.assetType,
        amount: input.amount, date: input.date,
      }).$returningId();
      return { id, success: true };
    }),

  contractLiabilityList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(contractLiabilities).where(eq(contractLiabilities.tenantId, ctx.user.tenantId!)).orderBy(desc(contractLiabilities.createdAt));
    }),

  contractLiabilityCreate: authedQuery
    .input(z.object({
      contractId: z.number().optional(), obligationId: z.number().optional(),
      liabilityType: z.enum(["deferred_revenue", "advance_billing", "refund_liability"]),
      amount: z.string(), date: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(contractLiabilities).values({
        tenantId: ctx.user.tenantId!, contractId: input.contractId,
        obligationId: input.obligationId, liabilityType: input.liabilityType,
        amount: input.amount, date: input.date,
      }).$returningId();
      return { id, success: true };
    }),

  recognitionScheduleList: authedQuery
    .input(z.object({ obligationId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(revenueRecognitionSchedules.tenantId, ctx.user.tenantId!)];
      if (input?.obligationId) conditions.push(eq(revenueRecognitionSchedules.obligationId, input.obligationId));
      return db.select().from(revenueRecognitionSchedules).where(and(...conditions)).orderBy(revenueRecognitionSchedules.scheduledDate);
    }),

  calculateAllocatedPrice: authedQuery
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const obligations = await db.select().from(performanceObligations)
        .where(and(eq(performanceObligations.tenantId, ctx.user.tenantId!), eq(performanceObligations.contractId, input.contractId)));
      const totalStandalone = obligations.reduce((s, o) => s + Number(o.standalonePrice), 0);
      const totalTransaction = obligations.reduce((s, o) => s + Number(o.transactionPrice), 0);
      for (const obl of obligations) {
        const ssPrice = Number(obl.standalonePrice);
        const allocated = totalStandalone > 0 ? (ssPrice / totalStandalone) * totalTransaction : 0;
        await db.update(performanceObligations).set({
          allocatedAmount: allocated.toFixed(2),
        }).where(eq(performanceObligations.id, obl.id));
      }
      return { success: true, obligationsUpdated: obligations.length };
    }),

  generateSchedule: authedQuery
    .input(z.object({
      obligationId: z.number(),
      startDate: z.string(), endDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const obligation = await db.query.performanceObligations.findFirst({ where: eq(performanceObligations.id, input.obligationId) });
      if (!obligation) throw new Error("Obligation not found");
      const amount = Number(obligation.allocatedAmount);
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      if (months <= 0) throw new Error("Invalid date range");
      const monthlyAmount = amount / months;
      let cumulative = 0;
      await db.delete(revenueRecognitionSchedules).where(eq(revenueRecognitionSchedules.obligationId, input.obligationId));
      for (let i = 0; i < months; i++) {
        const schedDate = new Date(start);
        schedDate.setMonth(schedDate.getMonth() + i);
        cumulative += monthlyAmount;
        await db.insert(revenueRecognitionSchedules).values({
          tenantId: ctx.user.tenantId!,
          contractId: obligation.contractId,
          obligationId: input.obligationId,
          scheduledDate: schedDate.toISOString().split("T")[0],
          recognizedAmount: monthlyAmount.toFixed(2),
          cumulativeAmount: cumulative.toFixed(2),
          recognitionMethod: obligation.recognitionMethod,
        });
      }
      return { success: true, scheduleLength: months, monthlyAmount: monthlyAmount.toFixed(2) };
    }),

  recognizeRevenue: authedQuery
    .input(z.object({
      scheduleId: z.number(), entryNumber: z.string(), date: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const sched = await db.query.revenueRecognitionSchedules.findFirst({ where: eq(revenueRecognitionSchedules.id, input.scheduleId) });
      if (!sched) throw new Error("Schedule not found");
      const amount = Number(sched.recognizedAmount);
      const revAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountType, "revenue"),
      ));
      const assetAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountCategory, "current_asset"),
      ));
      const revAccountId = revAccounts[0]?.id || 1;
      const assetAccountId = assetAccounts[0]?.id || 1;
      const [{ jeId }] = await db.insert(journalEntries).values({
        tenantId: ctx.user.tenantId!, entryNumber: input.entryNumber,
        date: input.date, description: `Revenue recognition - schedule #${input.scheduleId}`,
        totalDebit: amount.toFixed(2), totalCredit: amount.toFixed(2),
        isPosted: true, referenceType: "other",
      }).$returningId();
      await db.insert(journalEntryLines).values([
        { journalEntryId: jeId, accountId: assetAccountId, debit: amount.toFixed(2), credit: "0", description: "Contract asset / receivable" },
        { journalEntryId: jeId, accountId: revAccountId, debit: "0", credit: amount.toFixed(2), description: "Revenue recognized" },
      ]);
      await db.update(revenueRecognitionSchedules).set({ status: "recognized" }).where(eq(revenueRecognitionSchedules.id, input.scheduleId));
      return { journalEntryId: jeId, success: true };
    }),

  contractCostList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(contractCosts).where(eq(contractCosts.tenantId, ctx.user.tenantId!)).orderBy(desc(contractCosts.createdAt));
    }),

  contractCostCreate: authedQuery
    .input(z.object({
      contractId: z.number().optional(), costType: z.enum(["incremental_fulfillment", "mobilization", "setup", "training", "commission"]),
      description: z.string(), amount: z.string(), capitalizedAmount: z.string().optional(),
      amortizationPeriod: z.number().optional(), amortizationMethod: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(contractCosts).values({
        tenantId: ctx.user.tenantId!, contractId: input.contractId,
        costType: input.costType, description: input.description,
        amount: input.amount, capitalizedAmount: input.capitalizedAmount || input.amount,
        amortizationPeriod: input.amortizationPeriod,
        amortizationMethod: input.amortizationMethod, status: "capitalized",
      }).$returningId();
      return { id, success: true };
    }),

  expenseContractCosts: authedQuery
    .input(z.object({ costId: z.number(), entryNumber: z.string(), date: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const cost = await db.query.contractCosts.findFirst({ where: eq(contractCosts.id, input.costId) });
      if (!cost) throw new Error("Cost not found");
      const capitalized = Number(cost.capitalizedAmount);
      const period = cost.amortizationPeriod || 1;
      const monthlyExpense = capitalized / period;
      const expenseAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountType, "expense"),
      ));
      const expenseAccountId = expenseAccounts[0]?.id || 1;
      const [{ jeId }] = await db.insert(journalEntries).values({
        tenantId: ctx.user.tenantId!, entryNumber: input.entryNumber,
        date: input.date, description: `Contract cost amortization - ${cost.description}`,
        totalDebit: monthlyExpense.toFixed(2), totalCredit: monthlyExpense.toFixed(2),
        isPosted: true, referenceType: "other",
      }).$returningId();
      await db.insert(journalEntryLines).values([
        { journalEntryId: jeId, accountId: expenseAccountId, debit: monthlyExpense.toFixed(2), credit: "0", description: "Amortization expense" },
        { journalEntryId: jeId, accountId: expenseAccountId, debit: "0", credit: monthlyExpense.toFixed(2), description: "Capitalized cost reduction" },
      ]);
      await db.update(contractCosts).set({ status: "amortized" }).where(eq(contractCosts.id, input.costId));
      return { journalEntryId: jeId, monthlyExpense: monthlyExpense.toFixed(2), success: true };
    }),

  revenueDashboard: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const obligations = await db.select().from(performanceObligations).where(eq(performanceObligations.tenantId, tenantId));
      const assets = await db.select().from(contractAssets).where(eq(contractAssets.tenantId, tenantId));
      const liabilities = await db.select().from(contractLiabilities).where(eq(contractLiabilities.tenantId, tenantId));
      const schedules = await db.select().from(revenueRecognitionSchedules).where(eq(revenueRecognitionSchedules.tenantId, tenantId));
      const totalDeferred = liabilities.reduce((s, l) => s + Number(l.remainingAmount), 0);
      const totalRecognized = assets.reduce((s, a) => s + Number(a.recognizedRevenue), 0) +
        liabilities.reduce((s, l) => s + Number(l.recognizedAmount), 0);
      const totalContractAssets = assets.reduce((s, a) => s + Number(a.amount), 0);
      const pendingSchedules = schedules.filter(s => s.status === "scheduled").length;
      return {
        totalObligations: obligations.length,
        totalDeferred: totalDeferred.toFixed(2),
        totalRecognized: totalRecognized.toFixed(2),
        totalContractAssets: totalContractAssets.toFixed(2),
        pendingSchedules,
        satisfiedObligations: obligations.filter(o => o.status === "satisfied").length,
        recentSchedules: schedules.filter(s => s.status === "scheduled").slice(0, 10),
      };
    }),
});
