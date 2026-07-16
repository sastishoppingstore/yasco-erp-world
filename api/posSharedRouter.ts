import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  loyaltyPrograms, loyaltyCards, loyaltyTransactions,
  giftCards, giftCardTransactions,
  posShifts, cashDrawerLogs, paymentSplits, emvTransactions,
  invoices, invoiceItems,
  customers, products,
} from "@db/schema";
import { eq, and, like, desc, sql, gte, lte, inArray } from "drizzle-orm";

export const posSharedRouter = createRouter({
  // ============ LOYALTY PROGRAMS ============
  loyaltyProgramList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(loyaltyPrograms)
      .where(and(eq(loyaltyPrograms.tenantId, ctx.user.tenantId!), eq(loyaltyPrograms.isActive, true)));
  }),

  loyaltyProgramCreate: authedQuery
    .input(z.object({
      name: z.string(), nameAr: z.string().optional(),
      pointsPerCurrency: z.string().default("1"),
      currencyPerPoint: z.string().default("0.01"),
      pointExpiryDays: z.number().default(365),
      minRedeemPoints: z.number().default(0),
      maxRedeemPercent: z.string().default("100"),
      tierConfig: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(loyaltyPrograms).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return { id, success: true };
    }),

  loyaltyCardEnroll: authedQuery
    .input(z.object({
      programId: z.number(), customerId: z.number(),
      cardNumber: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(loyaltyCards).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return { id, success: true };
    }),

  loyaltyCardBalance: authedQuery
    .input(z.object({ cardNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.query.loyaltyCards.findFirst({
        where: and(eq(loyaltyCards.cardNumber, input.cardNumber), eq(loyaltyCards.tenantId, ctx.user.tenantId!)),
      });
    }),

  loyaltyEarnPoints: authedQuery
    .input(z.object({
      cardId: z.number(), amount: z.string(),
      referenceType: z.string().optional(), referenceId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const card = await db.query.loyaltyCards.findFirst({
        where: and(eq(loyaltyCards.id, input.cardId), eq(loyaltyCards.tenantId, ctx.user.tenantId!)),
      });
      if (!card) throw new Error("Card not found");
      const program = await db.query.loyaltyPrograms.findFirst({ where: eq(loyaltyPrograms.id, card.programId) });
      if (!program) throw new Error("Program not found");
      const points = Math.floor(Number(input.amount) * Number(program.pointsPerCurrency));
      const balBefore = Number(card.currentBalance);
      const balAfter = balBefore + points;
      await db.update(loyaltyCards).set({
        totalPoints: sql`${loyaltyCards.totalPoints} + ${points}`,
        lifetimePoints: sql`${loyaltyCards.lifetimePoints} + ${points}`,
        lifetimeSpend: sql`${loyaltyCards.lifetimeSpend} + ${Number(input.amount)}`,
        currentBalance: String(balAfter),
      }).where(eq(loyaltyCards.id, input.cardId));
      await db.insert(loyaltyTransactions).values({
        tenantId: ctx.user.tenantId!, cardId: input.cardId,
        transactionType: "earn", points, balanceBefore: balBefore, balanceAfter: balAfter,
        referenceType: input.referenceType, referenceId: input.referenceId,
        createdBy: ctx.user.id,
      });
      return { points, balance: balAfter, success: true };
    }),

  loyaltyRedeemPoints: authedQuery
    .input(z.object({
      cardId: z.number(), points: z.number(),
      referenceType: z.string().optional(), referenceId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const card = await db.query.loyaltyCards.findFirst({
        where: and(eq(loyaltyCards.id, input.cardId), eq(loyaltyCards.tenantId, ctx.user.tenantId!)),
      });
      if (!card) throw new Error("Card not found");
      if (Number(card.currentBalance) < input.points) throw new Error("Insufficient points");
      const program = await db.query.loyaltyPrograms.findFirst({ where: eq(loyaltyPrograms.id, card.programId) });
      const balBefore = Number(card.currentBalance);
      const balAfter = balBefore - input.points;
      await db.update(loyaltyCards).set({ currentBalance: String(balAfter) })
        .where(eq(loyaltyCards.id, input.cardId));
      await db.insert(loyaltyTransactions).values({
        tenantId: ctx.user.tenantId!, cardId: input.cardId,
        transactionType: "redeem", points: input.points,
        balanceBefore: balBefore, balanceAfter: balAfter,
        referenceType: input.referenceType, referenceId: input.referenceId,
        createdBy: ctx.user.id,
      });
      // Calculate monetary value
      const value = input.points * Number(program?.currencyPerPoint || 0.01);
      return { value: String(value), balance: balAfter, success: true };
    }),

  // ============ GIFT CARDS ============
  giftCardIssue: authedQuery
    .input(z.object({
      cardNumber: z.string(), pin: z.string().optional(),
      initialBalance: z.string(), recipientEmail: z.string().optional(),
      recipientName: z.string().optional(), message: z.string().optional(),
      expiresAt: z.string().optional(), issuerCustomerId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(giftCards).values({
        tenantId: ctx.user.tenantId!, currentBalance: input.initialBalance,
        ...input, issuedBy: ctx.user.id,
      }).$returningId();
      await db.insert(giftCardTransactions).values({
        giftCardId: id, transactionType: "issue",
        amount: input.initialBalance, balanceBefore: "0",
        balanceAfter: input.initialBalance, createdBy: ctx.user.id,
      });
      return { id, success: true };
    }),

  giftCardBalance: authedQuery
    .input(z.object({ cardNumber: z.string(), pin: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const card = await db.query.giftCards.findFirst({
        where: and(eq(giftCards.cardNumber, input.cardNumber), eq(giftCards.tenantId, ctx.user.tenantId!)),
      });
      if (!card) throw new Error("Gift card not found");
      if (input.pin && card.pin && input.pin !== card.pin) throw new Error("Invalid PIN");
      return card;
    }),

  giftCardRedeem: authedQuery
    .input(z.object({
      cardId: z.number(), amount: z.string(),
      referenceType: z.string().optional(), referenceId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const card = await db.query.giftCards.findFirst({
        where: and(eq(giftCards.id, input.cardId), eq(giftCards.tenantId, ctx.user.tenantId!)),
      });
      if (!card) throw new Error("Gift card not found");
      const redeemAmount = Math.min(Number(input.amount), Number(card.currentBalance));
      const balBefore = Number(card.currentBalance);
      const balAfter = balBefore - redeemAmount;
      await db.update(giftCards).set({ currentBalance: String(balAfter) })
        .where(eq(giftCards.id, input.cardId));
      await db.insert(giftCardTransactions).values({
        giftCardId: input.cardId, transactionType: "redeem",
        amount: String(redeemAmount), balanceBefore: balBefore, balanceAfter: balAfter,
        referenceType: input.referenceType, referenceId: input.referenceId,
        createdBy: ctx.user.id,
      });
      if (balAfter <= 0) {
        await db.update(giftCards).set({ status: "redeemed", redeemedAt: new Date() })
          .where(eq(giftCards.id, input.cardId));
      }
      return { amount: String(redeemAmount), balance: balAfter, success: true };
    }),

  // ============ SHIFT / TILL MANAGEMENT ============
  shiftOpen: authedQuery
    .input(z.object({ openingBalance: z.string().default("0"), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const shiftNumber = `SFT-${Date.now()}`;
      const [{ id }] = await db.insert(posShifts).values({
        tenantId: ctx.user.tenantId!, userId: ctx.user.id,
        shiftNumber, openingBalance: input.openingBalance, status: "open",
        notes: input.notes,
      }).$returningId();
      await db.insert(cashDrawerLogs).values({
        tenantId: ctx.user.tenantId!, userId: ctx.user.id, shiftId: id,
        action: "opening", amount: input.openingBalance,
        balanceBefore: "0", balanceAfter: input.openingBalance,
        description: "Shift opening",
      });
      return { id, shiftNumber, success: true };
    }),

  shiftClose: authedQuery
    .input(z.object({ id: z.number(), closingActual: z.string(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const shift = await db.query.posShifts.findFirst({
        where: and(eq(posShifts.id, input.id), eq(posShifts.tenantId, ctx.user.tenantId!)),
      });
      if (!shift) throw new Error("Shift not found");
      const expected = Number(shift.openingBalance) + Number(shift.cashSales) + Number(shift.cashIn || 0) - Number(shift.cashOut || 0);
      const actual = Number(input.closingActual);
      const difference = actual - expected;
      await db.update(posShifts).set({
        status: "closed", closingExpected: String(expected),
        closingActual: input.closingActual, difference: String(difference),
        closedAt: new Date(), notes: input.notes,
      }).where(eq(posShifts.id, input.id));
      await db.insert(cashDrawerLogs).values({
        tenantId: ctx.user.tenantId!, userId: ctx.user.id, shiftId: input.id,
        action: "closing", amount: input.closingActual,
        balanceBefore: String(expected), balanceAfter: input.closingActual,
        description: `Shift closing. Difference: ${difference}`,
      });
      return { expected, actual, difference, success: true };
    }),

  shiftCurrent: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.posShifts.findFirst({
      where: and(eq(posShifts.tenantId, ctx.user.tenantId!), eq(posShifts.userId, ctx.user.id), eq(posShifts.status, "open")),
      orderBy: desc(posShifts.openedAt),
    });
  }),

  shiftCashIn: authedQuery
    .input(z.object({ shiftId: z.number(), amount: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const shift = await db.query.posShifts.findFirst({
        where: and(eq(posShifts.id, input.shiftId), eq(posShifts.tenantId, ctx.user.tenantId!)),
      });
      if (!shift) throw new Error("Shift not found");
      const balBefore = Number(shift.cashSales) + Number(shift.cashIn || 0) - Number(shift.cashOut || 0);
      const balAfter = balBefore + Number(input.amount);
      await db.update(posShifts).set({
        cashIn: sql`coalesce(${posShifts.cashIn},0) + ${Number(input.amount)}`,
      }).where(eq(posShifts.id, input.shiftId));
      await db.insert(cashDrawerLogs).values({
        tenantId: ctx.user.tenantId!, userId: ctx.user.id, shiftId: input.shiftId,
        action: "cash_in", amount: input.amount,
        balanceBefore: String(balBefore), balanceAfter: String(balAfter),
        description: input.description,
      });
      return { success: true };
    }),

  shiftCashOut: authedQuery
    .input(z.object({ shiftId: z.number(), amount: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const shift = await db.query.posShifts.findFirst({
        where: and(eq(posShifts.id, input.shiftId), eq(posShifts.tenantId, ctx.user.tenantId!)),
      });
      if (!shift) throw new Error("Shift not found");
      const balBefore = Number(shift.cashSales) + Number(shift.cashIn || 0) - Number(shift.cashOut || 0);
      if (balBefore < Number(input.amount)) throw new Error("Insufficient cash in drawer");
      const balAfter = balBefore - Number(input.amount);
      await db.update(posShifts).set({
        cashOut: sql`coalesce(${posShifts.cashOut},0) + ${Number(input.amount)}`,
      }).where(eq(posShifts.id, input.shiftId));
      await db.insert(cashDrawerLogs).values({
        tenantId: ctx.user.tenantId!, userId: ctx.user.id, shiftId: input.shiftId,
        action: "cash_out", amount: input.amount,
        balanceBefore: String(balBefore), balanceAfter: String(balAfter),
        description: input.description,
      });
      return { success: true };
    }),

  shiftHistory: authedQuery
    .input(z.object({ from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(posShifts.tenantId, ctx.user.tenantId!)];
      if (input.from) conditions.push(gte(posShifts.openedAt, new Date(input.from)));
      if (input.to) conditions.push(lte(posShifts.openedAt, new Date(input.to)));
      return db.select().from(posShifts).where(and(...conditions)).orderBy(desc(posShifts.openedAt));
    }),

  cashDrawerLog: authedQuery
    .input(z.object({ shiftId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select().from(cashDrawerLogs)
        .where(and(eq(cashDrawerLogs.shiftId, input.shiftId), eq(cashDrawerLogs.tenantId, ctx.user.tenantId!)))
        .orderBy(desc(cashDrawerLogs.createdAt));
    }),

  // ============ MULTI-PAYMENT SPLIT ============
  paymentSplitCreate: authedQuery
    .input(z.object({
      invoiceId: z.number(),
      splits: z.array(z.object({
        paymentMethod: z.enum(["cash", "card", "transfer", "cheque", "wallet", "loyalty", "gift_card", "credit"]),
        amount: z.string(),
        reference: z.string().optional(),
        giftCardId: z.number().optional(),
        loyaltyCardId: z.number().optional(),
        loyaltyPointsUsed: z.number().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      let totalPaid = 0;
      for (const split of input.splits) {
        totalPaid += Number(split.amount);
        let emvTxId: number | undefined;
        if (split.paymentMethod === "card") {
          const [{ id }] = await db.insert(emvTransactions).values({
            tenantId, invoiceId: input.invoiceId,
            amount: split.amount, status: "pending", createdBy: ctx.user.id,
          }).$returningId();
          emvTxId = id;
        }
        const [{ id: splitId }] = await db.insert(paymentSplits).values({
          tenantId, invoiceId: input.invoiceId,
          paymentMethod: split.paymentMethod, amount: split.amount,
          reference: split.reference, emvTransactionId: emvTxId,
          giftCardId: split.giftCardId, loyaltyPointsUsed: split.loyaltyPointsUsed ? String(split.loyaltyPointsUsed) : undefined,
        }).$returningId();

        // Redeem gift card if used
        if (split.giftCardId) {
          await db.insert(giftCardTransactions).values({
            giftCardId: split.giftCardId, transactionType: "redeem",
            amount: split.amount, balanceBefore: 0, balanceAfter: 0,
            referenceType: "invoice", referenceId: input.invoiceId,
            createdBy: ctx.user.id,
          });
        }
      }
      await db.update(invoices).set({
        paidAmount: String(totalPaid),
        balanceDue: String(Math.max(0, 0)), // simplified: full payment assumed
        status: "paid",
      }).where(eq(invoices.id, input.invoiceId));
      return { success: true };
    }),

  // ============ CUSTOMER FACING DISPLAY ============
  customerDisplayData: authedQuery
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const invoice = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, input.invoiceId), eq(invoices.tenantId, ctx.user.tenantId!)),
      });
      if (!invoice) return null;
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, input.invoiceId));
      const customer = invoice.customerId ? await db.query.customers.findFirst({ where: eq(customers.id, invoice.customerId) }) : null;
      return { invoice, items, customerName: customer?.name };
    }),

  // ============ EMV CARD READER PLACEHOLDERS ============
  emvInitiatePayment: authedQuery
    .input(z.object({ invoiceId: z.number(), amount: z.string(), terminalId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(emvTransactions).values({
        tenantId: ctx.user.tenantId!, invoiceId: input.invoiceId,
        amount: input.amount, terminalId: input.terminalId,
        status: "pending", createdBy: ctx.user.id,
        requestPayload: { initiatedAt: new Date().toISOString() },
      }).$returningId();
      // Placeholder: in production, call payment gateway
      return { id, status: "pending", message: "EMV transaction initiated" };
    }),

  emvProcessResponse: authedQuery
    .input(z.object({
      id: z.number(), status: z.enum(["approved", "declined", "failed"]),
      authCode: z.string().optional(), referenceNumber: z.string().optional(),
      responseCode: z.string().optional(), responseMessage: z.string().optional(),
      cardType: z.string().optional(), cardLastFour: z.string().optional(),
      responsePayload: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updates: any = {
        status: input.status, authCode: input.authCode,
        referenceNumber: input.referenceNumber, responseCode: input.responseCode,
        responseMessage: input.responseMessage, cardType: input.cardType,
        cardLastFour: input.cardLastFour, responsePayload: input.responsePayload || {},
      };
      await db.update(emvTransactions).set(updates).where(and(eq(emvTransactions.id, input.id), eq(emvTransactions.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),
});
