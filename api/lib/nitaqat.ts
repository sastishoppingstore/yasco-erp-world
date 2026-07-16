import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { employees, nitaqatSnapshots } from "@db/schema";

export interface NitaqatRatio {
  totalSaudis: number;
  totalExpats: number;
  totalEmployees: number;
  saudiRatio: number;
  category: "platinum" | "green" | "yellow" | "red";
}

export interface NitaqatTargets {
  platinum: number;
  green: number;
  yellow: number;
  red: number;
}

const NITAQAT_TARGETS: Record<string, NitaqatTargets> = {
  large: { platinum: 0.12, green: 0.08, yellow: 0.06, red: 0 },
  medium: { platinum: 0.20, green: 0.13, yellow: 0.08, red: 0 },
  small: { platinum: 0.30, green: 0.20, yellow: 0.12, red: 0 },
  very_small: { platinum: 0.51, green: 0.40, yellow: 0.20, red: 0 },
};

const COMPANY_SIZE_CATEGORIES = ["very_small", "small", "medium", "large"];

function determineCompanySize(totalEmployees: number): string {
  if (totalEmployees <= 9) return "very_small";
  if (totalEmployees <= 49) return "small";
  if (totalEmployees <= 499) return "medium";
  return "large";
}

export function calculateSaudiRatio(saudis: number, expats: number): number {
  const total = saudis + expats;
  if (total === 0) return 0;
  return saudis / total;
}

export function determineCategory(ratio: number, targets: NitaqatTargets): NitaqatRatio["category"] {
  if (ratio >= targets.platinum) return "platinum";
  if (ratio >= targets.green) return "green";
  if (ratio >= targets.yellow) return "yellow";
  return "red";
}

export async function getCurrentNitaqatStatus(tenantId: number): Promise<NitaqatRatio> {
  const db = getDb();
  const all = await db
    .select()
    .from(employees)
    .where(and(eq(employees.tenantId, tenantId), eq(employees.status, "active" as any)));
  const saudis = all.filter((e) => e.nationality === "saudi" || e.nationality === "Saudi");
  const expats = all.filter((e) => e.nationality && e.nationality !== "saudi" && e.nationality !== "Saudi");
  const totalSaudis = saudis.length;
  const totalExpats = expats.length;
  const saudiRatio = calculateSaudiRatio(totalSaudis, totalExpats);
  const companySize = determineCompanySize(all.length);
  const targets = NITAQAT_TARGETS[companySize];
  const category = determineCategory(saudiRatio, targets);
  return { totalSaudis, totalExpats, totalEmployees: all.length, saudiRatio, category };
}

export async function whatIfAnalysis(
  tenantId: number,
  scenario: { hireSaudi?: number; hireExpat?: number; fireSaudi?: number; fireExpat?: number },
): Promise<{ current: NitaqatRatio; projected: NitaqatRatio; targetRatio: number; shortfall: number }> {
  const current = await getCurrentNitaqatStatus(tenantId);
  const companySize = determineCompanySize(current.totalEmployees);
  const targets = NITAQAT_TARGETS[companySize];

  let projectedSaudis = current.totalSaudis + (scenario.hireSaudi || 0) - (scenario.fireSaudi || 0);
  let projectedExpats = current.totalExpats + (scenario.hireExpat || 0) - (scenario.fireExpat || 0);
  if (projectedSaudis < 0) projectedSaudis = 0;
  if (projectedExpats < 0) projectedExpats = 0;
  const projectedRatio = calculateSaudiRatio(projectedSaudis, projectedExpats);
  const projectedCategory = determineCategory(projectedRatio, targets);

  return {
    current,
    projected: {
      totalSaudis: projectedSaudis,
      totalExpats: projectedExpats,
      totalEmployees: projectedSaudis + projectedExpats,
      saudiRatio: projectedRatio,
      category: projectedCategory,
    },
    targetRatio: targets.green,
    shortfall: Math.max(0, targets.green - projectedRatio),
  };
}
