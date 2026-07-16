import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  employees, salarySlips, wpsSubmissions, wpsExceptions,
} from "@db/schema";
import { generateWpsFile, WpsSubmissionInput, validateSarieIban } from "./lib/wps";

export const wpsRouter = createRouter({
  // ─── WPS Submission ───
  generate: adminQuery
    .input(WpsSubmissionInput)
    .mutation(async ({ input, ctx }) => {
      const file = generateWpsFile(input);
      const db = getDb();
      const [{ id }] = await db.insert(wpsSubmissions).values({
        tenantId: ctx.user.tenantId!,
        payrollPeriodId: input.payrollPeriodId,
        submissionDate: input.paymentDate,
        bankFormat: input.bankFormat,
        totalAmount: String(file.totalAmount),
        employeeCount: file.employeeCount,
        complianceRate: String(file.complianceRate),
        fileContent: file.fileContent,
        fileName: file.fileName,
        status: "draft",
        createdBy: ctx.user.id,
      } as any).$returningId();
      return { id, file, success: true };
    }),

  submit: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(wpsSubmissions)
        .set({ status: "submitted" as any, submittedAt: new Date() })
        .where(and(eq(wpsSubmissions.id, input.id), eq(wpsSubmissions.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  list: authedQuery
    .input(z.object({ payrollPeriodId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(wpsSubmissions.tenantId, tenantId)];
      if (input?.payrollPeriodId) conditions.push(eq(wpsSubmissions.payrollPeriodId, input.payrollPeriodId));
      return db.select().from(wpsSubmissions).where(and(...conditions)).orderBy(desc(wpsSubmissions.createdAt));
    }),

  getFile: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const sub = await db.query.wpsSubmissions.findFirst({
        where: and(eq(wpsSubmissions.id, input.id), eq(wpsSubmissions.tenantId, ctx.user.tenantId!)),
      });
      if (!sub) throw new Error("WPS submission not found");
      return sub;
    }),

  // ─── Exceptions ───
  exceptionList: authedQuery
    .input(z.object({ payrollPeriodId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(wpsExceptions.tenantId, tenantId)];
      if (input?.payrollPeriodId) conditions.push(eq(wpsExceptions.payrollPeriodId, input.payrollPeriodId));
      return db.select().from(wpsExceptions).where(and(...conditions)).orderBy(desc(wpsExceptions.createdAt));
    }),

  exceptionCreate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      payrollPeriodId: z.number(),
      exceptionType: z.enum(["unpaid_leave", "disciplinary_deduction", "bank_account_change", "other"]),
      amount: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(wpsExceptions).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        amount: String(input.amount),
        status: "pending",
      } as any).$returningId();
      return { id, success: true };
    }),

  exceptionApprove: adminQuery
    .input(z.object({ id: z.number(), approved: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(wpsExceptions)
        .set({ status: input.approved ? "approved" as any : "rejected" as any, approvedBy: ctx.user.id })
        .where(eq(wpsExceptions.id, input.id));
      return { success: true };
    }),

  // ─── Compliance ───
  complianceStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const total = await db.select({ count: sql<number>`count(*)` }).from(wpsSubmissions).where(eq(wpsSubmissions.tenantId, tenantId));
      const compliant = await db.select({ count: sql<number>`count(*)` }).from(wpsSubmissions)
        .where(and(eq(wpsSubmissions.tenantId, tenantId), sql`${wpsSubmissions.complianceRate} >= 90`));
      return {
        totalSubmissions: total[0].count,
        compliantSubmissions: compliant[0].count,
        complianceRate: total[0].count > 0 ? Math.round((compliant[0].count / total[0].count) * 100) : 100,
      };
    }),

  validateIban: authedQuery
    .input(z.object({ iban: z.string() }))
    .query(async ({ input }) => {
      return { valid: validateSarieIban(input.iban) };
    }),
});
