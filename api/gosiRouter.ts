import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  gosiRateTables, gosiRegistrations, gosiSubmissionLogs, employees,
} from "@db/schema";
import {
  getActiveGosiRateTable, calculateGosi, autoCalculateEmployeeGosi, calculateGosiForSlip,
} from "./lib/gosi";

export const gosiRouter = createRouter({
  // ─── GOSI Rate Tables ───
  rateTableList: authedQuery
    .input(z.object({ effectiveDate: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      return getActiveGosiRateTable(ctx.user.tenantId!, input?.effectiveDate);
    }),

  rateTableCreate: adminQuery
    .input(z.object({
      name: z.string(),
      effectiveFrom: z.string(),
      effectiveTo: z.string().optional().nullable(),
      systemType: z.enum(["new", "old"]),
      employeeAnnuitiesRate: z.number(),
      employerAnnuitiesRate: z.number(),
      employerHazardsRate: z.number(),
      employeeUnemploymentRate: z.number(),
      employerUnemploymentRate: z.number(),
      contributionCap: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(gosiRateTables).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        effectiveTo: input.effectiveTo || null,
      } as any).$returningId();
      return { id, success: true };
    }),

  rateTableUpdate: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      effectiveFrom: z.string().optional(),
      effectiveTo: z.string().optional().nullable(),
      employeeAnnuitiesRate: z.number().optional(),
      employerAnnuitiesRate: z.number().optional(),
      employerHazardsRate: z.number().optional(),
      employeeUnemploymentRate: z.number().optional(),
      employerUnemploymentRate: z.number().optional(),
      contributionCap: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(gosiRateTables).set(data as any).where(eq(gosiRateTables.id, id));
      return { success: true };
    }),

  // ─── GOSI Registrations ───
  registrationList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      return db.select({
        registration: gosiRegistrations,
        employee: employees,
      })
      .from(gosiRegistrations)
      .innerJoin(employees, eq(gosiRegistrations.employeeId, employees.id))
      .where(eq(gosiRegistrations.tenantId, tenantId));
    }),

  registrationUpsert: authedQuery
    .input(z.object({
      employeeId: z.number(),
      gosiNumber: z.string().optional(),
      isSubscriber: z.boolean().optional(),
      systemType: z.enum(["new", "old"]).optional(),
      contributionCap: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.query.gosiRegistrations.findFirst({
        where: and(eq(gosiRegistrations.tenantId, ctx.user.tenantId!), eq(gosiRegistrations.employeeId, input.employeeId)),
      });
      if (existing) {
        await db.update(gosiRegistrations)
          .set(input as any)
          .where(eq(gosiRegistrations.id, existing.id));
      } else {
        await db.insert(gosiRegistrations).values({
          ...input,
          tenantId: ctx.user.tenantId!,
        } as any);
      }
      return { success: true };
    }),

  // ─── GOSI Calculation ───
  calculate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      basicSalary: z.number(),
      housingAllowance: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      return calculateGosiForSlip(ctx.user.tenantId!, input.employeeId, input.basicSalary, input.housingAllowance);
    }),

  recalculateAll: adminQuery
    .mutation(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const regs = await db.select()
        .from(gosiRegistrations)
        .where(and(eq(gosiRegistrations.tenantId, tenantId), eq(gosiRegistrations.needsUpdate, true as any)));
      const results = [];
      for (const reg of regs) {
        const result = await autoCalculateEmployeeGosi(tenantId, reg.employeeId);
        results.push({ employeeId: reg.employeeId, result });
      }
      return { processed: results.length, results };
    }),

  // ─── GOSI Report ───
  report: authedQuery
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const allRegs = await db.select({
        registration: gosiRegistrations,
        employee: employees,
      })
      .from(gosiRegistrations)
      .innerJoin(employees, eq(gosiRegistrations.employeeId, employees.id))
      .where(and(eq(gosiRegistrations.tenantId, tenantId), eq(gosiRegistrations.isSubscriber, true as any)));

      const rows = [];
      let totalEmployee = 0, totalEmployer = 0;
      for (const { registration, employee } of allRegs) {
        const result = await calculateGosiForSlip(tenantId, employee.id, Number(employee.basicSalary), Number(employee.housingAllowance));
        rows.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          nationality: employee.nationality || "saudi",
          basicSalary: Number(employee.basicSalary),
          housingAllowance: Number(employee.housingAllowance),
          contributionBase: result.contributionBase,
          employeeShare: result.employeeTotal,
          employerShare: result.employerTotal,
          total: result.totalContributions,
        });
        totalEmployee += result.employeeTotal;
        totalEmployer += result.employerTotal;
      }
      return { rows, totalEmployee, totalEmployer, grandTotal: totalEmployee + totalEmployer };
    }),

  // ─── Submission Log ───
  submissionList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select()
        .from(gosiSubmissionLogs)
        .where(eq(gosiSubmissionLogs.tenantId, ctx.user.tenantId!))
        .orderBy(desc(gosiSubmissionLogs.createdAt));
    }),

  submissionCreate: adminQuery
    .input(z.object({
      periodMonth: z.number(),
      periodYear: z.number(),
      totalEmployeeShare: z.string(),
      totalEmployerShare: z.string(),
      employeeCount: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const total = Number(input.totalEmployeeShare) + Number(input.totalEmployerShare);
      const [{ id }] = await db.insert(gosiSubmissionLogs).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        totalContributions: String(total),
        createdBy: ctx.user.id,
        status: "submitted",
        submissionDate: new Date(),
      } as any).$returningId();
      return { id, success: true };
    }),
});
