import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { installments, installmentPayments, customers, invoices } from "@db/schema";
import { eq, and, like, desc, gte, lte, sql } from "drizzle-orm";

export const installmentsRouter = createRouter({
  // LIST
  list: authedQuery
    .input(z.object({
      status: z.string().optional(),
      customerId: z.number().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(installments.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(installments.status, input.status as any));
      if (input?.customerId) conditions.push(eq(installments.customerId, input.customerId));
      if (input?.search) {
        conditions.push(
          sql`${like(installments.installmentNumber, `%${input.search}%`)}`
        );
      }
      const offset = ((input?.page || 1) - 1) * (input?.limit || 20);
      const data = await db.select().from(installments)
        .where(and(...conditions))
        .orderBy(desc(installments.createdAt))
        .limit(input?.limit || 20).offset(offset);

      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(installments).where(and(...conditions));

      // Get customer names
      const result = [];
      for (const inst of data) {
        const customer = inst.customerId
          ? await db.query.customers.findFirst({ where: eq(customers.id, inst.customerId) })
          : null;
        result.push({ ...inst, customerName: customer?.name || "Walk-in" });
      }
      return { data: result, total: count, page: input?.page || 1 };
    }),

  // GET BY ID
  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const inst = await db.query.installments.findFirst({
        where: and(eq(installments.id, input.id), eq(installments.tenantId, ctx.user.tenantId!)),
      });
      if (!inst) return null;
      const customer = inst.customerId
        ? await db.query.customers.findFirst({ where: eq(customers.id, inst.customerId) })
        : null;
      const payments = await db.select().from(installmentPayments)
        .where(eq(installmentPayments.installmentId, inst.id))
        .orderBy(installmentPayments.dueDate);
      return { ...inst, customerName: customer?.name || "Walk-in", payments };
    }),

  // CREATE
  create: authedQuery
    .input(z.object({
      customerId: z.number(),
      invoiceId: z.number().optional(),
      totalAmount: z.string(),
      downPayment: z.string().default("0"),
      numberOfInstallments: z.number(),
      installmentType: z.enum(["weekly", "biweekly", "monthly", "quarterly", "custom"]).default("monthly"),
      intervalDays: z.number().default(30),
      startDate: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const total = Number(input.totalAmount);
      const downPayment = Number(input.downPayment);
      const financed = total - downPayment;
      const installmentAmount = financed / input.numberOfInstallments;
      const installmentNumber = `INST-${Date.now()}`;

      const endDate = new Date(input.startDate);
      endDate.setDate(endDate.getDate() + input.intervalDays * input.numberOfInstallments);

      const [{ id }] = await db.insert(installments).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        installmentNumber,
        customerId: input.customerId,
        invoiceId: input.invoiceId,
        totalAmount: String(total),
        downPayment: String(downPayment),
        financedAmount: String(financed),
        numberOfInstallments: input.numberOfInstallments,
        installmentAmount: String(installmentAmount),
        installmentType: input.installmentType,
        intervalDays: input.intervalDays,
        startDate: input.startDate,
        endDate: endDate.toISOString().split("T")[0],
        totalPaid: String(downPayment),
        remainingAmount: String(financed),
        status: "active",
        notes: input.notes,
      }).$returningId();

      // Generate installment payment schedule
      for (let i = 1; i <= input.numberOfInstallments; i++) {
        const dueDate = new Date(input.startDate);
        dueDate.setDate(dueDate.getDate() + input.intervalDays * i);
        await db.insert(installmentPayments).values({
          tenantId: ctx.user.tenantId!,
          installmentId: id,
          paymentNumber: `${installmentNumber}-P${i.toString().padStart(2, "0")}`,
          dueDate: dueDate.toISOString().split("T")[0],
          amount: String(installmentAmount),
          status: "pending",
        });
      }

      return { id, installmentNumber, success: true };
    }),

  // RECORD PAYMENT
  recordPayment: authedQuery
    .input(z.object({
      installmentPaymentId: z.number(),
      paidAmount: z.string(),
      paymentMethod: z.enum(["cash", "card", "transfer", "cheque", "wallet", "other"]).default("cash"),
      paidDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const payment = await db.query.installmentPayments.findFirst({
        where: and(eq(installmentPayments.id, input.installmentPaymentId), eq(installmentPayments.tenantId, ctx.user.tenantId!)),
      });
      if (!payment) throw new Error("Payment not found");
      if (payment.status === "paid") throw new Error("Already paid");

      const paidDate = input.paidDate || new Date().toISOString().split("T")[0];
      await db.update(installmentPayments).set({
        paidAmount: input.paidAmount,
        paidDate,
        paymentMethod: input.paymentMethod as any,
        status: "paid",
        notes: input.notes,
      }).where(eq(installmentPayments.id, input.installmentPaymentId));

      // Update installment totals
      const inst = await db.query.installments.findFirst({
        where: eq(installments.id, payment.installmentId),
      });
      if (inst) {
        const payments = await db.select({
          totalPaid: sql<string>`coalesce(sum(${installmentPayments.paidAmount}),0)`,
        }).from(installmentPayments)
          .where(and(eq(installmentPayments.installmentId, inst.id), eq(installmentPayments.status, "paid")));

        const totalPaid = Number(payments[0]?.totalPaid || 0) + Number(inst.downPayment);
        const remaining = Number(inst.totalAmount) - totalPaid;
        const newStatus = remaining <= 0 ? "completed" : "active";

        await db.update(installments).set({
          totalPaid: String(totalPaid),
          remainingAmount: String(Math.max(0, remaining)),
          status: newStatus as any,
        }).where(eq(installments.id, inst.id));

        // Cashbox entry
        const { cashboxTransactions } = await import("@db/schema");
        const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
          .from(cashboxTransactions)
          .where(eq(cashboxTransactions.tenantId, ctx.user.tenantId!))
          .orderBy(desc(cashboxTransactions.createdAt))
          .limit(1);
        const prevBal = Number(lastTx[0]?.bal || 0);
        const amount = Number(input.paidAmount);
        await db.insert(cashboxTransactions).values({
          tenantId: ctx.user.tenantId!,
          userId: ctx.user.id,
          transactionNumber: `IP-${Date.now()}`,
          transactionType: "customer_payment",
          amount: String(amount),
          paymentMethod: input.paymentMethod as any,
          referenceType: "installment",
          referenceId: inst.id,
          description: `Installment payment for ${inst.installmentNumber}`,
          balanceBefore: String(prevBal),
          balanceAfter: String(prevBal + amount),
          status: "completed",
        });
      }

      return { success: true };
    }),

  // OVERDUE INSTALLMENTS
  overdue: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    const overduePayments = await db.select().from(installmentPayments)
      .where(and(
        eq(installmentPayments.tenantId, ctx.user.tenantId!),
        eq(installmentPayments.status, "pending"),
        lte(installmentPayments.dueDate, today),
      )).orderBy(installmentPayments.dueDate);

    const result = [];
    for (const p of overduePayments) {
      const inst = await db.query.installments.findFirst({
        where: eq(installments.id, p.installmentId),
      });
      const customer = inst?.customerId
        ? await db.query.customers.findFirst({ where: eq(customers.id, inst.customerId) })
        : null;
      result.push({ ...p, installment: inst, customerName: customer?.name || "Unknown" });
    }
    return result;
  }),

  // SUMMARY
  summary: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const active = await db.select({
      total: sql<string>`coalesce(sum(${installments.remainingAmount}),0)`,
      count: sql<number>`count(*)`,
    }).from(installments).where(and(eq(installments.tenantId, tenantId), eq(installments.status, "active")));
    const completed = await db.select({
      count: sql<number>`count(*)`,
    }).from(installments).where(and(eq(installments.tenantId, tenantId), eq(installments.status, "completed")));
    const defaulted = await db.select({
      count: sql<number>`count(*)`,
    }).from(installments).where(and(eq(installments.tenantId, tenantId), eq(installments.status, "defaulted")));

    return {
      activeTotal: Number(active[0]?.total || 0),
      activeCount: active[0]?.count || 0,
      completedCount: completed[0]?.count || 0,
      defaultedCount: defaulted[0]?.count || 0,
    };
  }),
});
