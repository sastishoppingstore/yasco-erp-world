import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  leaseContracts, leasePaymentSchedules, leaseModifications, rightOfUseAssets,
  chartOfAccounts, journalEntries, journalEntryLines,
} from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const ifrs16Router = createRouter({
  leaseContractList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(leaseContracts.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(leaseContracts.status, input.status as any));
      return db.select().from(leaseContracts).where(and(...conditions)).orderBy(desc(leaseContracts.createdAt));
    }),

  leaseContractCreate: authedQuery
    .input(z.object({
      leaseCode: z.string(), description: z.string().optional(),
      lessorName: z.string(), leaseType: z.enum(["operating", "finance"]),
      assetId: z.number().optional(), assetCategory: z.string().optional(),
      startDate: z.string(), endDate: z.string(), leaseTermMonths: z.number(),
      rentalPaymentAmount: z.string(), paymentFrequency: z.enum(["monthly", "quarterly", "semi_annual", "annual"]),
      paymentDay: z.number().optional(), currency: z.string().optional(),
      discountRate: z.string(), incentiveAmount: z.string().optional(),
      initialDirectCosts: z.string().optional(),
      residualValueGuarantee: z.string().optional(),
      purchaseOption: z.boolean().optional(), purchaseOptionAmount: z.string().optional(),
      renewalOption: z.boolean().optional(), renewalTermMonths: z.number().optional(),
      terminationOption: z.boolean().optional(), terminationPenaltyAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(leaseContracts).values({
        tenantId: ctx.user.tenantId!, leaseCode: input.leaseCode,
        description: input.description, lessorName: input.lessorName,
        leaseType: input.leaseType, assetId: input.assetId,
        assetCategory: input.assetCategory, startDate: input.startDate,
        endDate: input.endDate, leaseTermMonths: input.leaseTermMonths,
        rentalPaymentAmount: input.rentalPaymentAmount,
        paymentFrequency: input.paymentFrequency, paymentDay: input.paymentDay || 1,
        currency: input.currency || "SAR", discountRate: input.discountRate,
        incentiveAmount: input.incentiveAmount || "0",
        initialDirectCosts: input.initialDirectCosts || "0",
        residualValueGuarantee: input.residualValueGuarantee || "0",
        purchaseOption: input.purchaseOption || false,
        purchaseOptionAmount: input.purchaseOptionAmount || "0",
        renewalOption: input.renewalOption || false,
        renewalTermMonths: input.renewalTermMonths,
        terminationOption: input.terminationOption || false,
        terminationPenaltyAmount: input.terminationPenaltyAmount || "0",
        notes: input.notes, createdBy: ctx.user.id!,
      }).$returningId();
      return { id, success: true };
    }),

  leaseContractGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const contract = await db.query.leaseContracts.findFirst({ where: eq(leaseContracts.id, input.id) });
      const payments = await db.select().from(leasePaymentSchedules).where(eq(leasePaymentSchedules.contractId, input.id)).orderBy(leasePaymentSchedules.paymentDate);
      const modifications = await db.select().from(leaseModifications).where(eq(leaseModifications.contractId, input.id)).orderBy(desc(leaseModifications.modificationDate));
      const rouAssets = await db.select().from(rightOfUseAssets).where(eq(rightOfUseAssets.contractId, input.id));
      return { contract, payments, modifications, rouAssets };
    }),

  leaseContractUpdate: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["active", "expired", "terminated", "amended"]).optional(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(leaseContracts).set(input).where(eq(leaseContracts.id, input.id));
      return { success: true };
    }),

  paymentScheduleList: authedQuery
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.contractId) return db.select().from(leasePaymentSchedules).where(eq(leasePaymentSchedules.contractId, input.contractId)).orderBy(leasePaymentSchedules.paymentDate);
      return db.select().from(leasePaymentSchedules).orderBy(leasePaymentSchedules.paymentDate);
    }),

  paymentScheduleUpdate: authedQuery
    .input(z.object({ id: z.number(), paymentStatus: z.enum(["pending", "paid", "overdue"]), paidDate: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(leasePaymentSchedules).set({ paymentStatus: input.paymentStatus, paidDate: input.paidDate }).where(eq(leasePaymentSchedules.id, input.id));
      return { success: true };
    }),

  modificationList: authedQuery
    .input(z.object({ contractId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.contractId) return db.select().from(leaseModifications).where(eq(leaseModifications.contractId, input.contractId)).orderBy(desc(leaseModifications.modificationDate));
      return db.select().from(leaseModifications);
    }),

  modificationCreate: authedQuery
    .input(z.object({
      contractId: z.number(), modificationDate: z.string(),
      modificationType: z.enum(["extension", "termination", "rent_revision", "asset_change"]),
      description: z.string(), oldPaymentAmount: z.string().optional(),
      newPaymentAmount: z.string().optional(), oldDiscountRate: z.string().optional(),
      newDiscountRate: z.string().optional(), oldLeaseTerm: z.number().optional(),
      newLeaseTerm: z.number().optional(), effectiveDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(leaseModifications).values({
        contractId: input.contractId, modificationDate: input.modificationDate,
        modificationType: input.modificationType, description: input.description,
        oldPaymentAmount: input.oldPaymentAmount || "0",
        newPaymentAmount: input.newPaymentAmount || "0",
        oldDiscountRate: input.oldDiscountRate || "0",
        newDiscountRate: input.newDiscountRate || "0",
        oldLeaseTerm: input.oldLeaseTerm, newLeaseTerm: input.newLeaseTerm,
        effectiveDate: input.effectiveDate,
      }).$returningId();
      return { id, success: true };
    }),

  rightOfUseAssetList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(rightOfUseAssets)
        .innerJoin(leaseContracts, eq(rightOfUseAssets.contractId, leaseContracts.id))
        .where(eq(leaseContracts.tenantId, ctx.user.tenantId!));
    }),

  calculateLeaseLiability: authedQuery
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const contract = await db.query.leaseContracts.findFirst({ where: eq(leaseContracts.id, input.contractId) });
      if (!contract) throw new Error("Contract not found");
      const payment = Number(contract.rentalPaymentAmount);
      const rate = Number(contract.discountRate) / 100;
      const term = contract.leaseTermMonths;
      const freqMap = { monthly: 1, quarterly: 3, semi_annual: 6, annual: 12 };
      const freq = freqMap[contract.paymentFrequency] || 1;
      const periods = Math.ceil(term / freq);
      const periodicRate = rate / (12 / freq);
      let pv = 0;
      for (let i = 1; i <= periods; i++) {
        pv += payment / Math.pow(1 + periodicRate, i);
      }
      const leaseLiability = pv.toFixed(2);
      const incentive = Number(contract.incentiveAmount || 0);
      const directCosts = Number(contract.initialDirectCosts || 0);
      const residual = Number(contract.residualValueGuarantee || 0);
      const rouAsset = (pv - incentive + directCosts + residual).toFixed(2);
      await db.update(leaseContracts).set({ leaseLiability, rightOfUseAsset: rouAsset }).where(eq(leaseContracts.id, input.contractId));
      return { leaseLiability, rightOfUseAsset: rouAsset, presentValue: pv.toFixed(2) };
    }),

  generatePaymentSchedule: authedQuery
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const contract = await db.query.leaseContracts.findFirst({ where: eq(leaseContracts.id, input.contractId) });
      if (!contract) throw new Error("Contract not found");
      const payment = Number(contract.rentalPaymentAmount);
      const rate = Number(contract.discountRate) / 100;
      const term = contract.leaseTermMonths;
      const freqMap = { monthly: 1, quarterly: 3, semi_annual: 6, annual: 12 };
      const freq = freqMap[contract.paymentFrequency] || 1;
      const periods = Math.ceil(term / freq);
      const periodicRate = rate / (12 / freq);
      let outstanding = Number(contract.leaseLiability);
      const schedule = [];
      const startDate = new Date(contract.startDate);
      for (let i = 1; i <= periods; i++) {
        const interest = outstanding * periodicRate;
        const principal = payment - interest;
        outstanding = Math.max(0, outstanding - principal);
        const payDate = new Date(startDate);
        payDate.setMonth(payDate.getMonth() + i * freq);
        schedule.push({
          contractId: input.contractId,
          paymentDate: payDate.toISOString().split("T")[0],
          paymentAmount: payment.toFixed(2),
          principalPortion: principal.toFixed(2),
          interestPortion: interest.toFixed(2),
          outstandingBalance: outstanding.toFixed(2),
        });
      }
      await db.delete(leasePaymentSchedules).where(eq(leasePaymentSchedules.contractId, input.contractId));
      for (const s of schedule) {
        await db.insert(leasePaymentSchedules).values(s);
      }
      return { success: true, paymentsGenerated: schedule.length };
    }),

  journalizeLease: authedQuery
    .input(z.object({ contractId: z.number(), entryNumber: z.string(), date: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const contract = await db.query.leaseContracts.findFirst({ where: eq(leaseContracts.id, input.contractId) });
      if (!contract) throw new Error("Contract not found");
      const rouAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountType, "asset"),
        like(chartOfAccounts.name, "%Right of Use%")
      ));
      const liabAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountType, "liability"),
        like(chartOfAccounts.name, "%Lease%")
      ));
      const rouAccountId = rouAccounts[0]?.id || 1;
      const liabAccountId = liabAccounts[0]?.id || 1;
      const rouAmount = Number(contract.rightOfUseAsset);
      const liabAmount = Number(contract.leaseLiability);
      const [{ jeId }] = await db.insert(journalEntries).values({
        tenantId: ctx.user.tenantId!, entryNumber: input.entryNumber,
        date: input.date, description: `Lease commencement - ${contract.leaseCode} (${contract.lessorName})`,
        totalDebit: rouAmount.toFixed(2), totalCredit: liabAmount.toFixed(2),
        isPosted: true, referenceType: "other",
      }).$returningId();
      await db.insert(journalEntryLines).values([
        { journalEntryId: jeId, accountId: rouAccountId, debit: rouAmount.toFixed(2), credit: "0", description: `ROU Asset - ${contract.leaseCode}` },
        { journalEntryId: jeId, accountId: liabAccountId, debit: "0", credit: liabAmount.toFixed(2), description: `Lease Liability - ${contract.leaseCode}` },
      ]);
      return { id: jeId, success: true };
    }),

  journalizePayment: authedQuery
    .input(z.object({ scheduleId: z.number(), entryNumber: z.string(), date: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const sched = await db.query.leasePaymentSchedules.findFirst({ where: eq(leasePaymentSchedules.id, input.scheduleId) });
      if (!sched) throw new Error("Schedule not found");
      const liabAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountType, "liability"),
        like(chartOfAccounts.name, "%Lease%")
      ));
      const expenseAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountType, "expense"),
        like(chartOfAccounts.name, "%Interest%")
      ));
      const cashAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.isCashAccount, true)
      ));
      const liabAccountId = liabAccounts[0]?.id || 1;
      const expenseAccountId = expenseAccounts[0]?.id || 1;
      const cashAccountId = cashAccounts[0]?.id || 1;
      const payment = Number(sched.paymentAmount);
      const principal = Number(sched.principalPortion);
      const interest = Number(sched.interestPortion);
      const [{ jeId }] = await db.insert(journalEntries).values({
        tenantId: ctx.user.tenantId!, entryNumber: input.entryNumber,
        date: input.date, description: `Lease payment - schedule #${input.scheduleId}`,
        totalDebit: payment.toFixed(2), totalCredit: payment.toFixed(2),
        isPosted: true, referenceType: "payment",
      }).$returningId();
      await db.insert(journalEntryLines).values([
        { journalEntryId: jeId, accountId: liabAccountId, debit: principal.toFixed(2), credit: "0", description: "Lease liability reduction" },
        { journalEntryId: jeId, accountId: expenseAccountId, debit: interest.toFixed(2), credit: "0", description: "Interest expense" },
        { journalEntryId: jeId, accountId: cashAccountId, debit: "0", credit: payment.toFixed(2), description: "Lease payment" },
      ]);
      await db.update(leasePaymentSchedules).set({ paymentStatus: "paid", paidDate: input.date }).where(eq(leasePaymentSchedules.id, input.scheduleId));
      return { id: jeId, success: true };
    }),

  runDepreciation: authedQuery
    .input(z.object({ contractId: z.number(), entryNumber: z.string(), date: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const contract = await db.query.leaseContracts.findFirst({ where: eq(leaseContracts.id, input.contractId) });
      if (!contract) throw new Error("Contract not found");
      const rouAmount = Number(contract.rightOfUseAsset);
      const term = contract.leaseTermMonths;
      if (term <= 0) throw new Error("Invalid lease term");
      const monthlyDep = rouAmount / term;
      const newAccum = Number(contract.accumulatedDepreciation) + monthlyDep;
      const netBook = rouAmount - newAccum;
      await db.update(leaseContracts).set({
        accumulatedDepreciation: newAccum.toFixed(2),
      }).where(eq(leaseContracts.id, input.contractId));
      const depAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        eq(chartOfAccounts.accountType, "expense"),
        like(chartOfAccounts.name, "%Depreciation%")
      ));
      const accumDepAccounts = await db.select().from(chartOfAccounts).where(and(
        eq(chartOfAccounts.tenantId, ctx.user.tenantId!),
        like(chartOfAccounts.name, "%Accum. Depreciation%")
      ));
      const depAccountId = depAccounts[0]?.id || 1;
      const accumAccountId = accumDepAccounts[0]?.id || 2;
      const [{ jeId }] = await db.insert(journalEntries).values({
        tenantId: ctx.user.tenantId!, entryNumber: input.entryNumber,
        date: input.date, description: `ROU Depreciation - ${contract.leaseCode}`,
        totalDebit: monthlyDep.toFixed(2), totalCredit: monthlyDep.toFixed(2),
        isPosted: true, referenceType: "other",
      }).$returningId();
      await db.insert(journalEntryLines).values([
        { journalEntryId: jeId, accountId: depAccountId, debit: monthlyDep.toFixed(2), credit: "0", description: "Depreciation expense" },
        { journalEntryId: jeId, accountId: accumAccountId, debit: "0", credit: monthlyDep.toFixed(2), description: "Accumulated depreciation" },
      ]);
      return { success: true, monthlyDepreciation: monthlyDep.toFixed(2), netBookValue: netBook.toFixed(2), journalEntryId: jeId };
    }),

  leaseDashboard: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const leases = await db.select().from(leaseContracts).where(eq(leaseContracts.tenantId, tenantId));
      const totalLeases = leases.length;
      const totalLiability = leases.reduce((s, l) => s + Number(l.leaseLiability), 0);
      const totalRouAssets = leases.reduce((s, l) => s + Number(l.rightOfUseAsset), 0);
      const totalDepreciation = leases.reduce((s, l) => s + Number(l.accumulatedDepreciation), 0);
      const activeLeases = leases.filter(l => l.status === "active").length;
      const upcomingPayments = await db.select().from(leasePaymentSchedules)
        .innerJoin(leaseContracts, eq(leasePaymentSchedules.contractId, leaseContracts.id))
        .where(and(eq(leaseContracts.tenantId, tenantId), eq(leasePaymentSchedules.paymentStatus, "pending")))
        .orderBy(leasePaymentSchedules.paymentDate).limit(10);
      return {
        totalLeases, totalLiability: totalLiability.toFixed(2),
        totalRouAssets: totalRouAssets.toFixed(2),
        totalDepreciation: totalDepreciation.toFixed(2),
        activeLeases, upcomingPayments,
      };
    }),
});
