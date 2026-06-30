import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { employees, iqamaRecords, nitaqatSnapshots, qiwaContracts, qiwaComparisonLogs } from "@db/schema";
import { syncQiwaContract, blockPayrollIfQiwaMismatch } from "./lib/qiwa";
import { getExpiringIqamas, getExpiredIqamas, checkDocumentationBlock } from "./lib/muqeem";
import { getCurrentNitaqatStatus, whatIfAnalysis } from "./lib/nitaqat";

export const saudiComplianceRouter = createRouter({
  // ─── Qiwa ───
  qiwaSyncContract: adminQuery
    .input(z.object({
      employeeId: z.number(),
      basicSalary: z.number(),
      housingAllowance: z.number(),
      transportAllowance: z.number(),
      otherAllowances: z.number(),
      qiwaContractId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return syncQiwaContract(ctx.user.tenantId!, input.employeeId, input);
    }),

  qiwaContractList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select({
        contract: qiwaContracts,
        employeeName: sql`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      })
      .from(qiwaContracts)
      .innerJoin(employees, eq(qiwaContracts.employeeId, employees.id))
      .where(eq(qiwaContracts.tenantId, ctx.user.tenantId!));
    }),

  qiwaCheckPayrollBlock: adminQuery
    .input(z.object({ employeeIds: z.array(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      return blockPayrollIfQiwaMismatch(ctx.user.tenantId!, input.employeeIds);
    }),

  qiwaComparisonLogs: authedQuery
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(qiwaComparisonLogs.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(qiwaComparisonLogs.employeeId, input.employeeId));
      return db.select().from(qiwaComparisonLogs).where(and(...conditions)).orderBy(desc(qiwaComparisonLogs.checkedAt));
    }),

  // ─── Muqeem ───
  iqamaList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      return db.select({
        record: iqamaRecords,
        employeeName: sql`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      })
      .from(iqamaRecords)
      .innerJoin(employees, eq(iqamaRecords.employeeId, employees.id))
      .where(eq(iqamaRecords.tenantId, tenantId));
    }),

  iqamaUpsert: adminQuery
    .input(z.object({
      employeeId: z.number(),
      iqamaNumber: z.string(),
      passportNumber: z.string().optional(),
      issuanceDate: z.string().optional(),
      expiryDate: z.string(),
      profession: z.string().optional(),
      sponsorName: z.string().optional(),
      borderNumber: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.query.iqamaRecords.findFirst({
        where: and(eq(iqamaRecords.tenantId, ctx.user.tenantId!), eq(iqamaRecords.employeeId, input.employeeId)),
      });
      if (existing) {
        await db.update(iqamaRecords).set({ ...input, status: "active" as any }).where(eq(iqamaRecords.id, existing.id));
      } else {
        await db.insert(iqamaRecords).values({ ...input, tenantId: ctx.user.tenantId! } as any);
      }
      return { success: true };
    }),

  iqamaExpiring: authedQuery
    .input(z.object({ withinDays: z.number().default(30) }))
    .query(async ({ input, ctx }) => {
      return getExpiringIqamas(ctx.user.tenantId!, input.withinDays);
    }),

  iqamaExpired: authedQuery
    .query(async ({ ctx }) => {
      return getExpiredIqamas(ctx.user.tenantId!);
    }),

  iqamaCheckBlock: authedQuery
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input, ctx }) => {
      return checkDocumentationBlock(ctx.user.tenantId!, input.employeeId);
    }),

  // ─── Nitaqat ───
  nitaqatStatus: authedQuery
    .query(async ({ ctx }) => {
      return getCurrentNitaqatStatus(ctx.user.tenantId!);
    }),

  nitaqatWhatIf: authedQuery
    .input(z.object({
      hireSaudi: z.number().optional(),
      hireExpat: z.number().optional(),
      fireSaudi: z.number().optional(),
      fireExpat: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return whatIfAnalysis(ctx.user.tenantId!, input);
    }),

  nitaqatSnapshots: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select()
        .from(nitaqatSnapshots)
        .where(eq(nitaqatSnapshots.tenantId, ctx.user.tenantId!))
        .orderBy(desc(nitaqatSnapshots.snapshotDate));
    }),

  nitaqatSnapshotCreate: adminQuery
    .mutation(async ({ ctx }) => {
      const db = getDb();
      const status = await getCurrentNitaqatStatus(ctx.user.tenantId!);
      const { whatIfHireSaudi, whatIfHireExpat, whatIfFireSaudi, whatIfFireExpat, ...snap } = status;
      await db.insert(nitaqatSnapshots).values({
        tenantId: ctx.user.tenantId!,
        snapshotDate: new Date().toISOString().slice(0, 10),
        totalSaudis: status.totalSaudis,
        totalExpats: status.totalExpats,
        saudiRatio: String(status.saudiRatio.toFixed(4)),
        category: status.category,
      } as any);
      return { success: true, status };
    }),
});
