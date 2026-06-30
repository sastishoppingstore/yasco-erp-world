import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { employees, eosbAccruals } from "@db/schema";

export interface EosbCalculationInput {
  hireDate: string;
  terminationDate: string;
  basicSalary: number;
  isResignation: boolean;
  yearsOfService?: number;
}

export interface EosbAccrualResult {
  yearsOfService: number;
  fullYears: number;
  partialYearFraction: number;
  firstFiveYearsRate: number;
  afterFiveYearsRate: number;
  firstFiveYearEntitlement: number;
  afterFiveYearEntitlement: number;
  totalEntitlement: number;
  monthlyAccrualRate: number;
  vestingPercent: number;
  isResignation: boolean;
}

const GREGORIAN_DAYS_PER_YEAR = 365.25;
const HIJRI_DAYS_PER_YEAR = 354.367;

function hijriYearsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.getTime() - s.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  return days / HIJRI_DAYS_PER_YEAR;
}

function gregorianYearsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.getTime() - s.getTime();
  return ms / (1000 * 60 * 60 * 24 * GREGORIAN_DAYS_PER_YEAR);
}

function getVestingPercent(yearsOfService: number, isResignation: boolean): number {
  if (!isResignation) return 1;
  if (yearsOfService < 2) return 0;
  if (yearsOfService < 5) return 0.3333;
  if (yearsOfService < 10) return 0.6667;
  return 1;
}

export function calculateEosb(input: EosbCalculationInput): EosbAccrualResult {
  const years = hijriYearsBetween(input.hireDate, input.terminationDate);
  const fullYears = Math.floor(years);
  const partialYearFraction = years - fullYears;
  const firstFiveYears = Math.min(fullYears, 5);
  const afterFiveYears = Math.max(0, fullYears - 5);
  const firstFiveYearEntitlement = firstFiveYears * (0.5 * input.basicSalary) + (partialYearFraction <= 0 ? 0 : 0);
  const afterFiveYearEntitlement = afterFiveYears * (1 * input.basicSalary);
  const partialEntitlement = partialYearFraction * (fullYears < 5 ? 0.5 * input.basicSalary : 1 * input.basicSalary);
  const totalBeforeVesting = firstFiveYearEntitlement + afterFiveYearEntitlement + partialEntitlement;
  const vestingPercent = getVestingPercent(years, input.isResignation);
  const totalEntitlement = totalBeforeVesting * vestingPercent;

  return {
    yearsOfService: years,
    fullYears,
    partialYearFraction,
    firstFiveYearsRate: 0.5,
    afterFiveYearsRate: 1,
    firstFiveYearEntitlement,
    afterFiveYearEntitlement,
    totalEntitlement,
    monthlyAccrualRate: totalBeforeVesting / (years * 12 || 1),
    vestingPercent,
    isResignation: input.isResignation,
  };
}

export async function calculateMonthlyAccrual(
  tenantId: number,
  employeeId: number,
  periodStart: string,
  periodEnd: string,
): Promise<EosbAccrualResult> {
  const db = getDb();
  const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  if (!emp || !emp.hireDate) throw new Error("Employee or hire date not found");

  const latest = await db
    .select()
    .from(eosbAccruals)
    .where(and(eq(eosbAccruals.tenantId, tenantId), eq(eosbAccruals.employeeId, employeeId)))
    .orderBy(desc(eosbAccruals.periodEnd))
    .limit(1);

  const runningTotal = latest.length > 0 ? Number(latest[0].runningTotal) : 0;

  const result = calculateEosb({
    hireDate: emp.hireDate,
    terminationDate: periodEnd,
    basicSalary: Number(emp.basicSalary),
    isResignation: false,
  });

  const newAccrual = result.totalEntitlement - runningTotal;

  await db.insert(eosbAccruals).values({
    tenantId,
    employeeId,
    periodStart,
    periodEnd,
    serviceYears: String(result.yearsOfService),
    accrualRate: String(result.firstFiveYearsRate),
    accrualAmount: String(Math.max(0, newAccrual)),
    runningTotal: String(result.totalEntitlement),
    lastBasicSalary: String(Number(emp.basicSalary)),
    isHijri: true,
  } as any);

  return result;
}

export async function getEosbStatement(tenantId: number, employeeId: number) {
  const db = getDb();
  const accruals = await db
    .select()
    .from(eosbAccruals)
    .where(and(eq(eosbAccruals.tenantId, tenantId), eq(eosbAccruals.employeeId, employeeId)))
    .orderBy(desc(eosbAccruals.periodEnd));
  const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  const totalAccrued = accruals.length > 0 ? Number(accruals[0].runningTotal) : 0;
  return { employee: emp, accruals, totalAccrued };
}
