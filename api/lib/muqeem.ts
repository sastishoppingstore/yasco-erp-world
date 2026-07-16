import { z } from "zod";
import { eq, and, lt, sql } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { iqamaRecords } from "@db/schema";

export const IqamaNumberSchema = z.string().regex(/^\d{10}$/, "Iqama number must be exactly 10 digits");
export const PassportNumberSchema = z.string().regex(/^[A-Za-z0-9]{6,20}$/, "Invalid passport number format");

export function validateIqamaNumber(iqama: string): boolean {
  return IqamaNumberSchema.safeParse(iqama.replace(/\s/g, "")).success;
}

export function validatePassportNumber(passport: string): boolean {
  return PassportNumberSchema.safeParse(passport.replace(/\s/g, "")).success;
}

export async function getExpiringIqamas(tenantId: number, withinDays: number = 30) {
  const db = getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return db
    .select()
    .from(iqamaRecords)
    .where(
      and(
        eq(iqamaRecords.tenantId, tenantId),
        eq(iqamaRecords.status, "active" as any),
        sql`${iqamaRecords.expiryDate} <= ${cutoffStr}`,
        sql`${iqamaRecords.expiryDate} >= ${new Date().toISOString().slice(0, 10)}`,
      ),
    );
}

export async function getExpiredIqamas(tenantId: number) {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  return db
    .select()
    .from(iqamaRecords)
    .where(
      and(
        eq(iqamaRecords.tenantId, tenantId),
        eq(iqamaRecords.status, "active" as any),
        sql`${iqamaRecords.expiryDate} < ${today}`,
      ),
    );
}

export async function checkDocumentationBlock(tenantId: number, employeeId: number): Promise<{ blocked: boolean; reason: string | null }> {
  const db = getDb();
  const iqama = await db.query.iqamaRecords.findFirst({
    where: and(eq(iqamaRecords.tenantId, tenantId), eq(iqamaRecords.employeeId, employeeId)),
  });
  if (!iqama) return { blocked: false, reason: null };
  const today = new Date().toISOString().slice(0, 10);
  if (iqama.expiryDate < today) {
    return { blocked: true, reason: `Iqama expired on ${iqama.expiryDate}` };
  }
  return { blocked: false, reason: null };
}
