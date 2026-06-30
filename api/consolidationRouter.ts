import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  consolidationGroups, consolidationGroupCompanies, consolidationEntries,
  consolidationEliminations, intercompanyTransactions, intercompanyReconciliations,
  companies, chartOfAccounts,
} from "@db/schema";
import { eq, sql, and, desc, like } from "drizzle-orm";

export const consolidationRouter = createRouter({
  consolidationGroupList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(consolidationGroups)
        .where(eq(consolidationGroups.tenantId, ctx.user.tenantId!))
        .orderBy(desc(consolidationGroups.createdAt));
    }),

  consolidationGroupCreate: authedQuery
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      fiscalYearId: z.number().optional(),
      baseCurrency: z.string().optional(),
      consolidationMethod: z.enum(["equity", "proportionate", "acquisition"]).optional(),
      eliminationMethod: z.enum(["line_by_line", "proportional"]).optional(),
      companyIds: z.array(z.object({ companyId: z.number(), ownershipPercent: z.string().optional() })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(consolidationGroups).values({
        tenantId: ctx.user.tenantId!,
        name: input.name,
        description: input.description,
        fiscalYearId: input.fiscalYearId,
        baseCurrency: input.baseCurrency || "SAR",
        consolidationMethod: input.consolidationMethod || "equity",
        eliminationMethod: input.eliminationMethod || "line_by_line",
      }).$returningId();
      if (input.companyIds) {
        for (const c of input.companyIds) {
          await db.insert(consolidationGroupCompanies).values({
            groupId: id, companyId: c.companyId,
            ownershipPercent: c.ownershipPercent || "100.0000",
          });
        }
      }
      return { id, success: true };
    }),

  consolidationGroupUpdate: authedQuery
    .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), status: z.enum(["draft", "in_progress", "completed"]).optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(consolidationGroups).set(input).where(eq(consolidationGroups.id, input.id));
      return { success: true };
    }),

  consolidationGroupDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(consolidationGroups).where(eq(consolidationGroups.id, input.id));
      return { success: true };
    }),

  consolidationGroupGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const group = await db.query.consolidationGroups.findFirst({ where: eq(consolidationGroups.id, input.id) });
      const companies = await db.select().from(consolidationGroupCompanies).where(eq(consolidationGroupCompanies.groupId, input.id));
      const entries = await db.select().from(consolidationEntries).where(eq(consolidationEntries.groupId, input.id));
      const eliminations = await db.select().from(consolidationEliminations).where(eq(consolidationEliminations.groupId, input.id));
      return { group, companies, entries, eliminations };
    }),

  consolidationEntryList: authedQuery
    .input(z.object({ groupId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(consolidationEntries.groupId, input?.groupId || 0)];
      if (input?.groupId) conditions.push(eq(consolidationEntries.groupId, input.groupId));
      return db.select().from(consolidationEntries).where(and(...conditions)).orderBy(desc(consolidationEntries.createdAt));
    }),

  consolidationEntryCreate: authedQuery
    .input(z.object({
      groupId: z.number(), periodStart: z.string().optional(), periodEnd: z.string().optional(),
      entryType: z.enum(["elimination", "reclassification", "adjustment", "translation"]),
      description: z.string(), amount: z.string().optional(), accountId: z.number().optional(),
      companyId: z.number().optional(), currency: z.string().optional(), exchangeRate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(consolidationEntries).values({
        groupId: input.groupId, periodStart: input.periodStart, periodEnd: input.periodEnd,
        entryType: input.entryType, description: input.description,
        amount: input.amount || "0", accountId: input.accountId, companyId: input.companyId,
        currency: input.currency || "SAR", exchangeRate: input.exchangeRate || "1.000000",
        createdBy: ctx.user.id!,
      }).$returningId();
      return { id, success: true };
    }),

  consolidationEliminationList: authedQuery
    .input(z.object({ groupId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.groupId) return db.select().from(consolidationEliminations).where(eq(consolidationEliminations.groupId, input.groupId));
      return db.select().from(consolidationEliminations);
    }),

  consolidationDashboard: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const totalGroups = await db.select({ count: sql<number>`count(*)` }).from(consolidationGroups).where(eq(consolidationGroups.tenantId, tenantId));
      const pendingConsolidations = await db.select({ count: sql<number>`count(*)` }).from(consolidationGroups).where(and(eq(consolidationGroups.tenantId, tenantId), eq(consolidationGroups.status, "in_progress")));
      const allTx = await db.select().from(intercompanyTransactions).where(eq(intercompanyTransactions.tenantId, tenantId));
      const unmatched = allTx.filter(t => t.status !== "reconciled").length;
      const groups = await db.select().from(consolidationGroups).where(eq(consolidationGroups.tenantId, tenantId)).orderBy(desc(consolidationGroups.createdAt));
      return {
        totalGroups: totalGroups[0]?.count || 0,
        pendingConsolidations: pendingConsolidations[0]?.count || 0,
        unmatchedInterco: unmatched,
        recentGroups: groups.slice(0, 5),
      };
    }),

  companyList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(companies).where(eq(companies.tenantId, ctx.user.tenantId!));
    }),

  intercompanyTransactionList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(intercompanyTransactions.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(intercompanyTransactions.status, input.status as any));
      return db.select().from(intercompanyTransactions).where(and(...conditions)).orderBy(desc(intercompanyTransactions.transactionDate));
    }),

  intercompanyTransactionCreate: authedQuery
    .input(z.object({
      transactionNumber: z.string(), transactionDate: z.string(),
      sourceCompanyId: z.number(), targetCompanyId: z.number(),
      transactionType: z.enum(["sale", "purchase", "loan", "dividend", "expense"]),
      referenceNumber: z.string().optional(), totalAmount: z.string(),
      currency: z.string().optional(), exchangeRate: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(intercompanyTransactions).values({
        tenantId: ctx.user.tenantId!, transactionNumber: input.transactionNumber,
        transactionDate: input.transactionDate, sourceCompanyId: input.sourceCompanyId,
        targetCompanyId: input.targetCompanyId, transactionType: input.transactionType,
        referenceNumber: input.referenceNumber, totalAmount: input.totalAmount,
        currency: input.currency || "SAR", exchangeRate: input.exchangeRate || "1.000000",
        description: input.description, createdBy: ctx.user.id!,
      }).$returningId();
      return { id, success: true };
    }),

  checkIntercompanyMatch: authedQuery
    .input(z.object({ transactionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const tx = await db.query.intercompanyTransactions.findFirst({ where: eq(intercompanyTransactions.id, input.transactionId) });
      if (!tx) return { matched: false };
      const matches = await db.select().from(intercompanyTransactions).where(
        and(eq(intercompanyTransactions.sourceCompanyId, tx.targetCompanyId),
            eq(intercompanyTransactions.targetCompanyId, tx.sourceCompanyId),
            eq(intercompanyTransactions.totalAmount, tx.totalAmount as any),
            eq(intercompanyTransactions.status, "posted"))
      );
      return { matched: matches.length > 0, matches };
    }),

  currencyTranslation: authedQuery
    .input(z.object({ groupId: z.number(), fromCurrency: z.string(), toCurrency: z.string(), exchangeRate: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rate = Number(input.exchangeRate);
      const entries = await db.select().from(consolidationEntries).where(eq(consolidationEntries.groupId, input.groupId));
      for (const entry of entries) {
        const newAmount = (Number(entry.amount) * rate).toFixed(2);
        await db.update(consolidationEntries).set({
          amount: newAmount, currency: input.toCurrency, exchangeRate: input.exchangeRate,
        }).where(eq(consolidationEntries.id, entry.id));
      }
      return { success: true, entriesTranslated: entries.length };
    }),

  runConsolidation: authedQuery
    .input(z.object({ groupId: z.number(), periodStart: z.string(), periodEnd: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(consolidationGroups).set({ status: "in_progress" }).where(eq(consolidationGroups.id, input.groupId));
      const groupCompanies = await db.select().from(consolidationGroupCompanies).where(eq(consolidationGroupCompanies.groupId, input.groupId));
      const intercoTx = await db.select().from(intercompanyTransactions).where(
        and(eq(intercompanyTransactions.status, "posted"),
            sql`${intercompanyTransactions.transactionDate} >= ${input.periodStart}`,
            sql`${intercompanyTransactions.transactionDate} <= ${input.periodEnd}`)
      );
      for (const tx of intercoTx) {
        const existingElimination = await db.select().from(consolidationEliminations)
          .where(and(eq(consolidationEliminations.groupId, input.groupId),
                     eq(consolidationEliminations.sourceCompanyId, tx.sourceCompanyId),
                     eq(consolidationEliminations.targetCompanyId, tx.targetCompanyId)));
        if (existingElimination.length === 0) {
          await db.insert(consolidationEliminations).values({
            groupId: input.groupId,
            entryType: tx.transactionType === "sale" ? "interco_revenue" : "interco_expense",
            sourceCompanyId: tx.sourceCompanyId, targetCompanyId: tx.targetCompanyId,
            amount: tx.totalAmount, description: `Auto-elimination for ${tx.transactionNumber}`,
          });
        }
      }
      await db.update(consolidationGroups).set({ status: "completed" }).where(eq(consolidationGroups.id, input.groupId));
      return { success: true, eliminationsCreated: intercoTx.length };
    }),
});
