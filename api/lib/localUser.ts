import type { User } from "@db/schema";
import { env } from "./env";

export const LOCAL_ADMIN_TENANT_ID = 1;

export function localAdminUnionId() {
  return `local:${env.adminUsername.trim().toLowerCase()}`;
}

export function createLocalAdminUser(): User {
  const now = new Date();
  return {
    id: 1,
    tenantId: LOCAL_ADMIN_TENANT_ID,
    unionId: localAdminUnionId(),
    name: "YASCO Admin",
    email: env.adminEmail || null,
    avatar: null,
    role: "admin",
    phone: null,
    isActive: true,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  };
}
