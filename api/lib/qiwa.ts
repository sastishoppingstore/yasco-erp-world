import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "../queries/connection";
import {
  employees, qiwaContracts, qiwaComparisonLogs,
} from "@db/schema";

export interface QiwaContractMirror {
  employeeId: number;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  totalSalary: number;
  isMatched: boolean;
  mismatchDetails: string | null;
}

export function validateQiwaSalary(
  qiwaBasic: number,
  qiwaHousing: number,
  qiwaTransport: number,
  qiwaOther: number,
  payrollBasic: number,
  payrollHousing: number,
  payrollTransport: number,
  payrollOther: number,
  tolerancePercent: number = 1,
): { isMatch: boolean; differences: string[] } {
  const differences: string[] = [];
  const tolerance = tolerancePercent / 100;
  const checks: [string, number, number][] = [
    ["Basic Salary", qiwaBasic, payrollBasic],
    ["Housing Allowance", qiwaHousing, payrollHousing],
    ["Transport Allowance", qiwaTransport, payrollTransport],
    ["Other Allowances", qiwaOther, payrollOther],
  ];
  for (const [label, expected, actual] of checks) {
    if (expected === 0 && actual === 0) continue;
    if (expected === 0) {
      differences.push(`${label}: expected 0, got ${actual}`);
      continue;
    }
    const deviation = Math.abs((actual - expected) / expected);
    if (deviation > tolerance) {
      differences.push(`${label}: expected ${expected}, got ${actual} (${(deviation * 100).toFixed(1)}% off)`);
    }
  }
  return { isMatch: differences.length === 0, differences };
}

export async function syncQiwaContract(
  tenantId: number,
  employeeId: number,
  qiwaData: {
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    otherAllowances: number;
    qiwaContractId?: string;
  },
): Promise<QiwaContractMirror> {
  const db = getDb();
  const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  if (!emp) throw new Error("Employee not found");

  const payrollBasic = Number(emp.basicSalary);
  const payrollHousing = Number(emp.housingAllowance);
  const payrollTransport = Number(emp.transportAllowance);
  const payrollOther = Number(emp.otherAllowance);
  const total = qiwaData.basicSalary + qiwaData.housingAllowance + qiwaData.transportAllowance + qiwaData.otherAllowances;

  const { isMatch, differences } = validateQiwaSalary(
    qiwaData.basicSalary, qiwaData.housingAllowance, qiwaData.transportAllowance, qiwaData.otherAllowances,
    payrollBasic, payrollHousing, payrollTransport, payrollOther,
  );

  await db
    .insert(qiwaContracts)
    .values({
      tenantId,
      employeeId,
      qiwaContractId: qiwaData.qiwaContractId || null,
      basicSalary: String(qiwaData.basicSalary),
      housingAllowance: String(qiwaData.housingAllowance),
      transportAllowance: String(qiwaData.transportAllowance),
      otherAllowances: String(qiwaData.otherAllowances),
      totalSalary: String(total),
      lastSyncedAt: new Date(),
      isMatched: isMatch as any,
      mismatchDetails: isMatch ? null : differences.join("; "),
    } as any)
    .onDuplicateKeyUpdate({
      set: {
        basicSalary: String(qiwaData.basicSalary),
        housingAllowance: String(qiwaData.housingAllowance),
        transportAllowance: String(qiwaData.transportAllowance),
        otherAllowances: String(qiwaData.otherAllowances),
        totalSalary: String(total),
        lastSyncedAt: new Date(),
        isMatched: isMatch as any,
        mismatchDetails: isMatch ? null : differences.join("; "),
      } as any,
    });

  await db.insert(qiwaComparisonLogs).values({
    tenantId,
    employeeId,
    comparisonType: "all",
    expectedValue: JSON.stringify(qiwaData),
    actualValue: JSON.stringify({ basicSalary: payrollBasic, housingAllowance: payrollHousing, transportAllowance: payrollTransport, otherAllowances: payrollOther }),
    difference: isMatch ? null : differences.join("; "),
    isMatched: isMatch as any,
  } as any);

  return {
    employeeId,
    basicSalary: qiwaData.basicSalary,
    housingAllowance: qiwaData.housingAllowance,
    transportAllowance: qiwaData.transportAllowance,
    otherAllowances: qiwaData.otherAllowances,
    totalSalary: total,
    isMatched: isMatch,
    mismatchDetails: isMatch ? null : differences.join("; "),
  };
}

export async function blockPayrollIfQiwaMismatch(tenantId: number, employeeIds: number[]): Promise<{ blocked: boolean; mismatchedEmployees: number[] }> {
  const db = getDb();
  const mismatched: number[] = [];
  for (const employeeId of employeeIds) {
    const contract = await db.query.qiwaContracts.findFirst({
      where: and(eq(qiwaContracts.tenantId, tenantId), eq(qiwaContracts.employeeId, employeeId)),
    });
    if (contract && !contract.isMatched) {
      mismatched.push(employeeId);
    }
  }
  return { blocked: mismatched.length > 0, mismatchedEmployees: mismatched };
}
