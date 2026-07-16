// Multi-tenant ERP System for Saudi Arabia - Schema-based + tenant_id isolation
import { getDb } from "../api/queries/connection";

export const TENANT_SCHEMAS = ['public', 'tenant_'] as const;

export async function setTenantSchema(tenantId: number) {
  const db = getDb();
  await db.execute(`SET search_path TO tenant_${tenantId}, public`);
}

export function getTenantSchema(tenantId: number): string {
  return `tenant_${tenantId}`;
}