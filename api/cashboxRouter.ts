import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cashboxTransactions, posSessions, chartOfAccounts } from "@db/schema";
import { eq, and, like, desc, gte, lte, sql } from "drizzle-orm";

export const cashboxRouter = createRouter({
  // TODAY BALANCE
  currentBalance: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
      .from(cashboxTransactions)
      .where(eq(cashboxTransactions.tenantId, ctx.user.tenantId!))
      .orderBy(desc(cashboxTransactions.createdAt))
      .limit(1);
    return { balance: Number(lastTx[0]?.bal || 0) };
  }),

  // TRANSACTION LIST
  transactionList: authedQuery
    .input(z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      type: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(cashboxTransactions.tenantId, ctx.user.tenantId!)];
      if (input?.from) conditions.push(gte(cashboxTransactions.createdAt, new Date(input.from)));
      if (input?.to) conditions.push(lte(cashboxTransactions.createdAt, new Date(input.to)));
      if (input?.type) conditions.push(eq(cashboxTransactions.transactionType, input.type as any));
      if (input?.search) conditions.push(like(cashboxTransactions.description, `%${input.search}%`));

      const offset = ((input?.page || 1) - 1) * (input?.limit || 20);
      const data = await db.select().from(cashboxTransactions)
        .where(and(...conditions))
        .orderBy(desc(cashboxTransactions.createdAt))
        .limit(input?.limit || 20).offset(offset);

      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(cashboxTransactions).where(and(...conditions));

      return { data, total: count, page: input?.page || 1 };
    }),

  // CASH IN
  cashIn: authedQuery
    .input(z.object({
      amount: z.string(),
      description: z.string(),
      paymentMethod: z.enum(["cash", "card", "transfer", "cheque", "wallet", "other"]).default("cash"),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
        .from(cashboxTransactions).where(eq(cashboxTransactions.tenantId, ctx.user.tenantId!))
        .orderBy(desc(cashboxTransactions.createdAt)).limit(1);
      const prevBal = Number(lastTx[0]?.bal || 0);
      const amount = Number(input.amount);
      const txNum = `CI-${Date.now()}`;
      const [{ id }] = await db.insert(cashboxTransactions).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        transactionNumber: txNum,
        transactionType: "cash_in",
        amount: String(amount),
        paymentMethod: input.paymentMethod as any,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
        balanceBefore: String(prevBal),
        balanceAfter: String(prevBal + amount),
        notes: input.notes,
        status: "completed",
      }).$returningId();
      return { id, transactionNumber: txNum, success: true };
    }),

  // CASH OUT
  cashOut: authedQuery
    .input(z.object({
      amount: z.string(),
      description: z.string(),
      paymentMethod: z.enum(["cash", "card", "transfer", "cheque", "wallet", "other"]).default("cash"),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
        .from(cashboxTransactions).where(eq(cashboxTransactions.tenantId, ctx.user.tenantId!))
        .orderBy(desc(cashboxTransactions.createdAt)).limit(1);
      const prevBal = Number(lastTx[0]?.bal || 0);
      const amount = Number(input.amount);
      if (amount > prevBal) throw new Error("Insufficient cashbox balance");
      const txNum = `CO-${Date.now()}`;
      const [{ id }] = await db.insert(cashboxTransactions).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        transactionNumber: txNum,
        transactionType: "cash_out",
        amount: String(amount),
        paymentMethod: input.paymentMethod as any,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
        balanceBefore: String(prevBal),
        balanceAfter: String(prevBal - amount),
        notes: input.notes,
        status: "completed",
      }).$returningId();
      return { id, transactionNumber: txNum, success: true };
    }),

  // EXPENSE
  addExpense: authedQuery
    .input(z.object({
      amount: z.string(),
      description: z.string(),
      category: z.string().optional(),
      paymentMethod: z.enum(["cash", "card", "transfer", "cheque", "wallet", "other"]).default("cash"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
        .from(cashboxTransactions).where(eq(cashboxTransactions.tenantId, ctx.user.tenantId!))
        .orderBy(desc(cashboxTransactions.createdAt)).limit(1);
      const prevBal = Number(lastTx[0]?.bal || 0);
      const amount = Number(input.amount);
      if (amount > prevBal) throw new Error("Insufficient cashbox balance");
      const txNum = `EXP-${Date.now()}`;
      const [{ id }] = await db.insert(cashboxTransactions).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        transactionNumber: txNum,
        transactionType: "expense",
        amount: String(amount),
        paymentMethod: input.paymentMethod as any,
        description: `Expense: ${input.description}`,
        balanceBefore: String(prevBal),
        balanceAfter: String(prevBal - amount),
        notes: input.notes,
        status: "completed",
      }).$returningId();
      return { id, transactionNumber: txNum, success: true };
    }),

  // DAILY SUMMARY
  todaySummary: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const today = new Date().toISOString().split("T")[0];
    const ranges = {
      cashIn: { type: "cash_in" as const },
      cashOut: { type: "cash_out" as const },
      expenses: { type: "expense" as const },
      sales: { type: "sale" as const },
    };
    const results: Record<string, { total: number; count: number }> = {};
    for (const [key, { type }] of Object.entries(ranges)) {
      const data = await db.select({
        total: sql<string>`coalesce(sum(${cashboxTransactions.amount}),0)`,
        count: sql<number>`count(*)`,
      }).from(cashboxTransactions)
        .where(and(
          eq(cashboxTransactions.tenantId, tenantId),
          eq(cashboxTransactions.transactionType, type),
          gte(cashboxTransactions.createdAt, new Date(today)),
        ));
      results[key] = { total: Number(data[0]?.total || 0), count: data[0]?.count || 0 };
    }
    return results;
  }),

  // SUMMARY BY DATE RANGE
  summary: authedQuery
    .input(z.object({ from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(cashboxTransactions.tenantId, ctx.user.tenantId!)];
      if (input.from) conditions.push(gte(cashboxTransactions.createdAt, new Date(input.from)));
      if (input.to) conditions.push(lte(cashboxTransactions.createdAt, new Date(input.to)));

      const totals = await db.select({
        type: cashboxTransactions.transactionType,
        total: sql<string>`coalesce(sum(${cashboxTransactions.amount}),0)`,
        count: sql<number>`count(*)`,
      }).from(cashboxTransactions).where(and(...conditions))
        .groupBy(cashboxTransactions.transactionType);

      const byPayment = await db.select({
        method: cashboxTransactions.paymentMethod,
        total: sql<string>`coalesce(sum(${cashboxTransactions.amount}),0)`,
        count: sql<number>`count(*)`,
      }).from(cashboxTransactions).where(and(...conditions))
        .groupBy(cashboxTransactions.paymentMethod);

      return { totals, byPayment };
    }),

  // CANCEL TRANSACTION
  cancelTransaction: authedQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tx = await db.query.cashboxTransactions.findFirst({
        where: and(eq(cashboxTransactions.id, input.id), eq(cashboxTransactions.tenantId, ctx.user.tenantId!)),
      });
      if (!tx) throw new Error("Transaction not found");
      if (tx.status === "cancelled") throw new Error("Already cancelled");

      // Reverse balance impact
      const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
        .from(cashboxTransactions)
        .where(and(
          eq(cashboxTransactions.tenantId, ctx.user.tenantId!),
          lte(cashboxTransactions.createdAt, tx.createdAt),
          sql`${cashboxTransactions.id} != ${tx.id}`
        ))
        .orderBy(desc(cashboxTransactions.createdAt))
        .limit(1);

      await db.update(cashboxTransactions).set({ status: "cancelled", notes: `Cancelled: ${input.reason || "No reason"}` })
        .where(eq(cashboxTransactions.id, input.id));
      return { success: true };
    }),
});
