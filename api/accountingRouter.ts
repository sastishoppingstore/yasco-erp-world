import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  chartOfAccounts, journalEntries, journalEntryLines,
  costCenters, budgets, fiscalYears
} from "@db/schema";
import { eq, sql, and, like, desc } from "drizzle-orm";

export const accountingRouter = createRouter({
  // Chart of Accounts
  coaList: authedQuery
    .input(z.object({ type: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(chartOfAccounts.tenantId, tenantId)];
      if (input?.type) {
        conditions.push(eq(chartOfAccounts.accountType, input.type as any));
      }
      return db.select().from(chartOfAccounts).where(and(...conditions)).orderBy(chartOfAccounts.code);
    }),

  coaCreate: authedQuery
    .input(z.object({
      code: z.string(),
      name: z.string(),
      nameAr: z.string().optional(),
      accountType: z.enum(["asset", "liability", "equity", "revenue", "expense", "cost_of_sales"]),
      accountCategory: z.enum(["current_asset", "fixed_asset", "current_liability", "long_term_liability", "equity", "revenue", "expense", "cogs", "other_income", "other_expense"]),
      parentId: z.number().optional(),
      openingBalance: z.string().optional(),
      isBankAccount: z.boolean().optional(),
      isCashAccount: z.boolean().optional(),
      currency: z.string().optional(),
      bankName: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      bankIban: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(chartOfAccounts).values({
        tenantId: ctx.user.tenantId!,
        code: input.code,
        name: input.name,
        nameAr: input.nameAr,
        accountType: input.accountType,
        accountCategory: input.accountCategory,
        parentId: input.parentId,
        openingBalance: input.openingBalance || "0",
        currentBalance: input.openingBalance || "0",
        isBankAccount: input.isBankAccount || false,
        isCashAccount: input.isCashAccount || false,
        currency: input.currency || "SAR",
        bankName: input.bankName,
        bankAccountNumber: input.bankAccountNumber,
        bankIban: input.bankIban,
      }).$returningId();
      return { id, success: true };
    }),

  // Journal Entries
  journalEntryList: authedQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(journalEntries.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(journalEntries.isPosted, input.status === "posted"));
      return db.select().from(journalEntries)
        .where(and(...conditions))
        .orderBy(desc(journalEntries.date));
    }),

  journalEntryCreate: authedQuery
    .input(z.object({
      entryNumber: z.string(),
      date: z.string(),
      reference: z.string().optional(),
      referenceType: z.enum(["invoice", "payment", "adjustment", "opening", "closing", "reversal", "other"]).optional(),
      description: z.string(),
      costCenterId: z.number().optional(),
      lines: z.array(z.object({
        accountId: z.number(),
        debit: z.string().optional(),
        credit: z.string().optional(),
        description: z.string().optional(),
        costCenterId: z.number().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const totalDebit = input.lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
      const totalCredit = input.lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);

      const [{ id }] = await db.insert(journalEntries).values({
        tenantId: ctx.user.tenantId!,
        entryNumber: input.entryNumber,
        date: input.date,
        reference: input.reference,
        referenceType: input.referenceType || "other",
        description: input.description,
        totalDebit: totalDebit.toString(),
        totalCredit: totalCredit.toString(),
        costCenterId: input.costCenterId,
        isPosted: true,
      }).$returningId();

      for (const line of input.lines) {
        await db.insert(journalEntryLines).values({
          journalEntryId: id,
          accountId: line.accountId,
          debit: line.debit || "0",
          credit: line.credit || "0",
          description: line.description,
          costCenterId: line.costCenterId,
        });
      }

      return { id, success: true };
    }),

  journalEntryGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const entry = await db.query.journalEntries.findFirst({
        where: eq(journalEntries.id, input.id),
      });
      const lines = await db.select().from(journalEntryLines)
        .where(eq(journalEntryLines.journalEntryId, input.id));
      return { entry, lines };
    }),

  // Trial Balance
  trialBalance: authedQuery
    .input(z.object({ asOfDate: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      return db.select({
        accountId: chartOfAccounts.id,
        code: chartOfAccounts.code,
        name: chartOfAccounts.name,
        accountType: chartOfAccounts.accountType,
        debit: sql<number>`coalesce(sum(${journalEntryLines.debit}), 0)`,
        credit: sql<number>`coalesce(sum(${journalEntryLines.credit}), 0)`,
      })
        .from(chartOfAccounts)
        .leftJoin(journalEntryLines, eq(chartOfAccounts.id, journalEntryLines.accountId))
        .leftJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(and(
          eq(chartOfAccounts.tenantId, tenantId),
          eq(journalEntries.isPosted, true),
        ))
        .groupBy(chartOfAccounts.id);
    }),

  // Cost Centers
  costCenterList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      return db.select().from(costCenters).where(eq(costCenters.tenantId, tenantId));
    }),

  costCenterCreate: authedQuery
    .input(z.object({
      code: z.string(),
      name: z.string(),
      description: z.string().optional(),
      budgetAmount: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(costCenters).values({
        tenantId: ctx.user.tenantId!,
        code: input.code,
        name: input.name,
        description: input.description,
        budgetAmount: input.budgetAmount || "0",
      }).$returningId();
      return { id, success: true };
    }),

  // Fiscal Years
  fiscalYearList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      return db.select().from(fiscalYears).where(eq(fiscalYears.tenantId, tenantId));
    }),
});
