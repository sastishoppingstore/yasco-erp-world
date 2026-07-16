import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { employees, eosbAccruals } from "@db/schema";
import { calculateEosb, calculateMonthlyAccrual, getEosbStatement } from "./lib/eosb";

export const eosbRouter = createRouter({
  calculate: authedQuery
    .input(z.object({
      hireDate: z.string(),
      terminationDate: z.string(),
      basicSalary: z.number(),
      isResignation: z.boolean(),
    }))
    .query(async ({ input }) => {
      return calculateEosb(input);
    }),

  monthlyAccrual: adminQuery
    .input(z.object({
      employeeId: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return calculateMonthlyAccrual(ctx.user.tenantId!, input.employeeId, input.periodStart, input.periodEnd);
    }),

  runBatchAccrual: adminQuery
    .input(z.object({
      periodStart: z.string(),
      periodEnd: z.string(),
      employeeIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(employees.tenantId, tenantId), eq(employees.status, "active" as any)];
      if (input.employeeIds && input.employeeIds.length > 0) {
        conditions.push(sql`${employees.id} IN (${input.employeeIds.join(",")})`);
      }
      const activeEmployees = await db.select().from(employees).where(and(...conditions));
      const results = [];
      for (const emp of activeEmployees) {
        const result = await calculateMonthlyAccrual(tenantId, emp.id, input.periodStart, input.periodEnd);
        results.push({ employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, result });
      }
      return { processed: results.length, results };
    }),

  statement: authedQuery
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input, ctx }) => {
      return getEosbStatement(ctx.user.tenantId!, input.employeeId);
    }),

  accrualList: authedQuery
    .input(z.object({ employeeId: z.number() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(eosbAccruals.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(eosbAccruals.employeeId, input.employeeId));
      return db.select().from(eosbAccruals).where(and(...conditions)).orderBy(desc(eosbAccruals.periodEnd));
    }),

  summary: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const activeEmps = await db.select().from(employees)
        .where(and(eq(employees.tenantId, tenantId), eq(employees.status, "active" as any)));
      let totalAccrued = 0;
      const employeeAccruals = [];
      for (const emp of activeEmps) {
        const last = await db.select()
          .from(eosbAccruals)
          .where(and(eq(eosbAccruals.tenantId, tenantId), eq(eosbAccruals.employeeId, emp.id)))
          .orderBy(desc(eosbAccruals.periodEnd))
          .limit(1);
        if (last.length > 0) {
          totalAccrued += Number(last[0].runningTotal);
          employeeAccruals.push({ employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, totalAccrued: Number(last[0].runningTotal) });
        }
      }
      return { totalEmployees: activeEmps.length, totalAccrued, employeeAccruals };
    }),
});
