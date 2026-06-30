import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../queries/connection";
import {
  employees, gosiRateTables, gosiRegistrations, gosiSubmissionLogs,
} from "@db/schema";

export interface GosiCalculationInput {
  basicSalary: number;
  housingAllowance: number;
  nationality?: string | null;
  isNewSystem?: boolean;
  contributionCap?: number;
}

export interface GosiRateRow {
  id?: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  systemType: "new" | "old";
  employeeAnnuitiesRate: number;
  employerAnnuitiesRate: number;
  employerHazardsRate: number;
  employeeUnemploymentRate: number;
  employerUnemploymentRate: number;
  contributionCap: number;
}

export interface GosiCalculationResult {
  contributionBase: number;
  isExpat: boolean;
  employeeAnnuities: number;
  employeeUnemployment: number;
  employeeTotal: number;
  employerAnnuities: number;
  employerHazards: number;
  employerUnemployment: number;
  employerTotal: number;
  totalContributions: number;
  rates: {
    employeeAnnuitiesRate: number;
    employeeUnemploymentRate: number;
    employerAnnuitiesRate: number;
    employerHazardsRate: number;
    employerUnemploymentRate: number;
  };
}

const DEFAULT_RATES_NEW: GosiRateRow = {
  effectiveFrom: "2024-07-03",
  effectiveTo: null,
  systemType: "new",
  employeeAnnuitiesRate: 0.095,
  employerAnnuitiesRate: 0.095,
  employerHazardsRate: 0.02,
  employeeUnemploymentRate: 0.0075,
  employerUnemploymentRate: 0.0075,
  contributionCap: 45000,
};

const DEFAULT_RATES_OLD: GosiRateRow = {
  effectiveFrom: "2000-01-01",
  effectiveTo: "2024-07-02",
  systemType: "old",
  employeeAnnuitiesRate: 0.09,
  employerAnnuitiesRate: 0.09,
  employerHazardsRate: 0.01,
  employeeUnemploymentRate: 0.005,
  employerUnemploymentRate: 0.02,
  contributionCap: 45000,
};

export async function getActiveGosiRateTable(
  tenantId: number,
  effectiveDate?: string,
): Promise<GosiRateRow[]> {
  const db = getDb();
  const date = effectiveDate || new Date().toISOString().slice(0, 10);
  const rates = await db
    .select()
    .from(gosiRateTables)
    .where(
      and(
        eq(gosiRateTables.tenantId, tenantId),
        eq(gosiRateTables.isActive, true as any),
        sql`${gosiRateTables.effectiveFrom} <= ${date}`,
        sql`(${gosiRateTables.effectiveTo} IS NULL OR ${gosiRateTables.effectiveTo} >= ${date})`,
      ),
    )
    .orderBy(desc(gosiRateTables.effectiveFrom));
  if (rates.length > 0) {
    return rates.map(mapRateRow);
  }
  return [DEFAULT_RATES_NEW, DEFAULT_RATES_OLD];
}

function mapRateRow(r: typeof gosiRateTables.$inferSelect): GosiRateRow {
  return {
    effectiveFrom: r.effectiveFrom,
    effectiveTo: r.effectiveTo,
    systemType: r.systemType as "new" | "old",
    employeeAnnuitiesRate: Number(r.employeeAnnuitiesRate),
    employerAnnuitiesRate: Number(r.employerAnnuitiesRate),
    employerHazardsRate: Number(r.employerHazardsRate),
    employeeUnemploymentRate: Number(r.employeeUnemploymentRate),
    employerUnemploymentRate: Number(r.employerUnemploymentRate),
    contributionCap: Number(r.contributionCap),
  };
}

export function calculateGosi(input: GosiCalculationInput, rates: GosiRateRow): GosiCalculationResult {
  const isExpat = input.nationality !== "saudi" && input.nationality !== "Saudi";
  const contributionBase = Math.min(
    input.basicSalary + input.housingAllowance,
    input.contributionCap ?? rates.contributionCap ?? 45000,
  );
  if (isExpat) {
    return {
      contributionBase,
      isExpat: true,
      employeeAnnuities: 0,
      employeeUnemployment: 0,
      employeeTotal: 0,
      employerAnnuities: 0,
      employerHazards: contributionBase * rates.employerHazardsRate,
      employerUnemployment: 0,
      employerTotal: contributionBase * rates.employerHazardsRate,
      totalContributions: contributionBase * rates.employerHazardsRate,
      rates: {
        employeeAnnuitiesRate: 0,
        employeeUnemploymentRate: 0,
        employerAnnuitiesRate: 0,
        employerHazardsRate: rates.employerHazardsRate,
        employerUnemploymentRate: 0,
      },
    };
  }
  const employeeAnnuities = contributionBase * rates.employeeAnnuitiesRate;
  const employeeUnemployment = contributionBase * rates.employeeUnemploymentRate;
  const employerAnnuities = contributionBase * rates.employerAnnuitiesRate;
  const employerHazards = contributionBase * rates.employerHazardsRate;
  const employerUnemployment = contributionBase * rates.employerUnemploymentRate;
  return {
    contributionBase,
    isExpat: false,
    employeeAnnuities,
    employeeUnemployment,
    employeeTotal: employeeAnnuities + employeeUnemployment,
    employerAnnuities,
    employerHazards,
    employerUnemployment,
    employerTotal: employerAnnuities + employerHazards + employerUnemployment,
    totalContributions: employeeAnnuities + employeeUnemployment + employerAnnuities + employerHazards + employerUnemployment,
    rates: {
      employeeAnnuitiesRate: rates.employeeAnnuitiesRate,
      employeeUnemploymentRate: rates.employeeUnemploymentRate,
      employerAnnuitiesRate: rates.employerAnnuitiesRate,
      employerHazardsRate: rates.employerHazardsRate,
      employerUnemploymentRate: rates.employerUnemploymentRate,
    },
  };
}

export async function autoCalculateEmployeeGosi(
  tenantId: number,
  employeeId: number,
): Promise<GosiCalculationResult | null> {
  const db = getDb();
  const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  if (!emp) return null;
  const reg = await db.query.gosiRegistrations.findFirst({
    where: and(eq(gosiRegistrations.tenantId, tenantId), eq(gosiRegistrations.employeeId, employeeId)),
  });
  if (reg && !reg.isSubscriber) return null;
  const rates = await getActiveGosiRateTable(tenantId);
  const rate = rates.find((r) => r.systemType === (reg?.systemType || "new")) || rates[0];
  const result = calculateGosi(
    {
      basicSalary: Number(emp.basicSalary),
      housingAllowance: Number(emp.housingAllowance),
      nationality: emp.nationality,
      contributionCap: reg?.contributionCap ? Number(reg.contributionCap) : undefined,
    },
    rate,
  );
  await db
    .update(gosiRegistrations)
    .set({
      lastCalculatedAt: new Date(),
      lastContribution: String(result.employeeTotal + result.employerTotal) as any,
      needsUpdate: false as any,
    })
    .where(and(eq(gosiRegistrations.tenantId, tenantId), eq(gosiRegistrations.employeeId, employeeId)));
  return result;
}

export async function flagGosiUpdateOnSalaryChange(tenantId: number, employeeId: number) {
  const db = getDb();
  await db
    .update(gosiRegistrations)
    .set({ needsUpdate: true as any })
    .where(and(eq(gosiRegistrations.tenantId, tenantId), eq(gosiRegistrations.employeeId, employeeId)));
}

export async function calculateGosiForSlip(
  tenantId: number,
  employeeId: number,
  basicSalary: number,
  housingAllowance: number,
): Promise<GosiCalculationResult> {
  const rates = await getActiveGosiRateTable(tenantId);
  const reg = await db.query.gosiRegistrations.findFirst({
    where: and(eq(gosiRegistrations.tenantId, tenantId), eq(gosiRegistrations.employeeId, employeeId)),
  });
  const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  const rate = rates.find((r) => r.systemType === (reg?.systemType || "new")) || rates[0];
  return calculateGosi(
    {
      basicSalary,
      housingAllowance,
      nationality: emp?.nationality,
      contributionCap: reg?.contributionCap ? Number(reg.contributionCap) : undefined,
    },
    rate,
  );
}
