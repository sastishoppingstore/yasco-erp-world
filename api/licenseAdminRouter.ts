import { z } from "zod";
import crypto from "node:crypto";
import { and, eq, desc, sql, gte, lte, inArray } from "drizzle-orm";
import { createRouter, superAdminQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { createEnhancedLicense, createDesktopLicense, verifyLicenseAdvanced, exportActivationRequest, createActivationResponse, importActivationResponse } from "./lib/license";
import { generateHardwareFingerprint, verifyHardwareFingerprint } from "./lib/hardwareFingerprint";
import { detectClockTampering, storeLastVerifiedServerTime } from "./lib/timeGuard";

async function createAuditLog(params: {
  tenantId?: number;
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
}) {
  const db = getDb();
  await db.insert(schema.auditLogs).values({
    tenantId: params.tenantId || 1,
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    oldValues: params.oldValues,
    newValues: params.newValues,
  });
}

const licenseStatusEnum = z.enum(["active", "expired", "grace", "suspended", "revoked", "blacklisted"]);

export const licenseAdminRouter = createRouter({
  // ─── License Key Generation ───────────────────────────────────────
  generate: superAdminQuery
    .input(z.object({
      tenantId: z.number(),
      companyName: z.string().min(1),
      plan: z.string().default("desktop"),
      maxDevices: z.number().int().positive().default(1),
      validDays: z.number().int().positive().default(365),
      graceDays: z.number().int().min(0).default(7),
      features: z.array(z.string()).optional(),
      modules: z.array(z.string()).optional(),
      hardwareFingerprintHash: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const expiresAt = new Date(Date.now() + input.validDays * 24 * 60 * 60 * 1000);
      const licenseKey = createEnhancedLicense({
        tenantId: input.tenantId,
        companyName: input.companyName,
        plan: input.plan,
        maxDevices: input.maxDevices,
        expiresAt: expiresAt.toISOString(),
        graceDays: input.graceDays,
        features: input.features,
        modules: input.modules,
        hardwareFingerprintHash: input.hardwareFingerprintHash,
        issuedBy: ctx.user.id,
      });
      const licenseKeyHash = crypto.createHash("sha256").update(licenseKey).digest("hex");
      const [{ id }] = await db.insert(schema.desktopLicenses).values({
        tenantId: input.tenantId,
        companyName: input.companyName,
        plan: input.plan,
        maxDevices: input.maxDevices,
        expiresAt,
        issuedBy: ctx.user.id,
        licenseKeyHash,
        status: "active",
      }).$returningId();
      await createAuditLog({
        tenantId: input.tenantId,
        userId: ctx.user.id,
        action: "license_generate",
        entityType: "desktop_license",
        entityId: id,
        newValues: { plan: input.plan, maxDevices: input.maxDevices, expiresAt, graceDays: input.graceDays },
      });
      return { id, licenseKey, expiresAt: expiresAt.toISOString() };
    }),

  // ─── List all licenses ────────────────────────────────────────────
  list: superAdminQuery
    .input(z.object({
      status: licenseStatusEnum.optional(),
      tenantId: z.number().optional(),
      search: z.string().optional(),
      offset: z.number().default(0),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const offset = input?.offset || 0;
      const limit = input?.limit || 50;
      const conditions: any[] = [];
      if (input?.status) conditions.push(eq(schema.desktopLicenses.status, input.status));
      if (input?.tenantId) conditions.push(eq(schema.desktopLicenses.tenantId, input.tenantId));
      if (input?.search) {
        conditions.push(
          sql`(${schema.desktopLicenses.companyName} LIKE ${`%${input.search}%`})`,
        );
      }
      const baseQuery = db.select().from(schema.desktopLicenses);
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const query = where ? baseQuery.where(where) : baseQuery;
      const items = await query.orderBy(desc(schema.desktopLicenses.createdAt)).limit(limit).offset(offset);
      const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(schema.desktopLicenses);
      const tenantIds = [...new Set(items.map(i => i.tenantId))];
      const tenants = tenantIds.length > 0
        ? await db.select({ id: schema.tenants.id, name: schema.tenants.name, email: schema.tenants.email })
            .from(schema.tenants).where(sql`${schema.tenants.id} IN (${tenantIds.join(",")})`)
        : [];
      const tenantMap = new Map(tenants.map(t => [t.id, t]));
      return {
        items: items.map(item => ({
          ...item,
          tenant: tenantMap.get(item.tenantId) || null,
        })),
        total: totalResult?.total || 0,
        offset,
        limit,
      };
    }),

  // ─── Get single license detail ────────────────────────────────────
  getById: superAdminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const license = await db.query.desktopLicenses.findFirst({
        where: eq(schema.desktopLicenses.id, input.id),
      });
      if (!license) throw new Error("License not found");
      const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, license.tenantId) });
      return { ...license, tenant };
    }),

  // ─── Extend license ───────────────────────────────────────────────
  extend: superAdminQuery
    .input(z.object({ id: z.number(), additionalDays: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const license = await db.query.desktopLicenses.findFirst({ where: eq(schema.desktopLicenses.id, input.id) });
      if (!license) throw new Error("License not found");
      const currentExpiry = license.expiresAt || new Date();
      const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()) + input.additionalDays * 24 * 60 * 60 * 1000);
      await db.update(schema.desktopLicenses)
        .set({ expiresAt: newExpiry, status: "active" })
        .where(eq(schema.desktopLicenses.id, input.id));
      await createAuditLog({
        tenantId: license.tenantId,
        userId: ctx.user.id,
        action: "license_extend",
        entityType: "desktop_license",
        entityId: input.id,
        oldValues: { expiresAt: license.expiresAt },
        newValues: { expiresAt: newExpiry },
      });
      return { success: true, newExpiry: newExpiry.toISOString() };
    }),

  // ─── Upgrade/Downgrade plan ───────────────────────────────────────
  changePlan: superAdminQuery
    .input(z.object({ id: z.number(), plan: z.string(), maxDevices: z.number().int().positive().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const license = await db.query.desktopLicenses.findFirst({ where: eq(schema.desktopLicenses.id, input.id) });
      if (!license) throw new Error("License not found");
      const updateData: any = { plan: input.plan };
      if (input.maxDevices) updateData.maxDevices = input.maxDevices;
      await db.update(schema.desktopLicenses)
        .set(updateData)
        .where(eq(schema.desktopLicenses.id, input.id));
      await createAuditLog({
        tenantId: license.tenantId,
        userId: ctx.user.id,
        action: "license_change_plan",
        entityType: "desktop_license",
        entityId: input.id,
        oldValues: { plan: license.plan, maxDevices: license.maxDevices },
        newValues: updateData,
      });
      return { success: true };
    }),

  // ─── Suspend license ──────────────────────────────────────────────
  suspend: superAdminQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const license = await db.query.desktopLicenses.findFirst({ where: eq(schema.desktopLicenses.id, input.id) });
      if (!license) throw new Error("License not found");
      await db.update(schema.desktopLicenses)
        .set({ status: "revoked" })
        .where(eq(schema.desktopLicenses.id, input.id));
      await createAuditLog({
        tenantId: license.tenantId,
        userId: ctx.user.id,
        action: "license_suspend",
        entityType: "desktop_license",
        entityId: input.id,
        oldValues: { status: license.status },
        newValues: { status: "revoked", reason: input.reason },
      });
      return { success: true };
    }),

  // ─── Revoke license ───────────────────────────────────────────────
  revoke: superAdminQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const license = await db.query.desktopLicenses.findFirst({ where: eq(schema.desktopLicenses.id, input.id) });
      if (!license) throw new Error("License not found");
      await db.update(schema.desktopLicenses)
        .set({ status: "revoked" })
        .where(eq(schema.desktopLicenses.id, input.id));
      await createAuditLog({
        tenantId: license.tenantId,
        userId: ctx.user.id,
        action: "license_revoke",
        entityType: "desktop_license",
        entityId: input.id,
        oldValues: { status: license.status },
        newValues: { status: "revoked", reason: input.reason },
      });
      return { success: true };
    }),

  // ─── Blacklist license ────────────────────────────────────────────
  blacklist: superAdminQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const license = await db.query.desktopLicenses.findFirst({ where: eq(schema.desktopLicenses.id, input.id) });
      if (!license) throw new Error("License not found");
      await db.update(schema.desktopLicenses)
        .set({ status: "revoked" })
        .where(eq(schema.desktopLicenses.id, input.id));
      await createAuditLog({
        tenantId: license.tenantId,
        userId: ctx.user.id,
        action: "license_blacklist",
        entityType: "desktop_license",
        entityId: input.id,
        oldValues: { status: license.status },
        newValues: { status: "blacklisted", reason: input.reason },
      });
      return { success: true };
    }),

  // ─── Verify a license key ─────────────────────────────────────────
  verify: adminQuery
    .input(z.object({ key: z.string().min(1) }))
    .query(async ({ input }) => {
      const result = verifyLicenseAdvanced(input.key);
      return result;
    }),

  // ─── Hardware fingerprint management ──────────────────────────────
  generateFingerprint: superAdminQuery.query(async () => {
    const fp = generateHardwareFingerprint();
    return fp;
  }),

  verifyFingerprint: superAdminQuery
    .input(z.object({
      storedCpuHash: z.string(),
      storedDiskSerial: z.string(),
      storedMacHash: z.string(),
      storedCombinedHash: z.string(),
      storedOsHostname: z.string(),
      storedGeneratedAt: z.string(),
    }))
    .query(async ({ input }) => {
      const result = verifyHardwareFingerprint({
        cpuHash: input.storedCpuHash,
        diskSerial: input.storedDiskSerial,
        macHash: input.storedMacHash,
        combinedHash: input.storedCombinedHash,
        osHostname: input.storedOsHostname,
        generatedAt: input.storedGeneratedAt,
      });
      return result;
    }),

  // ─── Clock tamper check ───────────────────────────────────────────
  checkClock: superAdminQuery.query(async () => {
    const result = detectClockTampering();
    if (result.status === "ok" || result.status === "no_stored_record") {
      storeLastVerifiedServerTime();
    }
    return result;
  }),

  // ─── Offline activation ──────────────────────────────────────────
  exportActivationRequest: superAdminQuery
    .input(z.object({ licenseKey: z.string(), hardwareJson: z.string() }))
    .query(async ({ input }) => {
      const hardware = JSON.parse(input.hardwareJson);
      const requestJson = exportActivationRequest(input.licenseKey, hardware);
      return { requestJson };
    }),

  createActivationResponse: superAdminQuery
    .input(z.object({
      activationRequestJson: z.string(),
      action: z.enum(["approve", "reject", "transfer"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const responseJson = createActivationResponse(
        input.activationRequestJson,
        input.action,
        ctx.user.id,
      );
      return { responseJson };
    }),

  importActivationResponse: superAdminQuery
    .input(z.object({ responseJson: z.string() }))
    .query(async ({ input }) => {
      const result = importActivationResponse(input.responseJson);
      return result;
    }),

  // ─── License usage analytics ──────────────────────────────────────
  usageAnalytics: superAdminQuery
    .input(z.object({ months: z.number().default(6) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const months = input?.months || 6;
      const since = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
      const totalLicenses = await db.select({ count: sql<number>`count(*)` }).from(schema.desktopLicenses);
      const activeLicenses = await db.select({ count: sql<number>`count(*)` }).from(schema.desktopLicenses)
        .where(eq(schema.desktopLicenses.status, "active"));
      const expiredLicenses = await db.select({ count: sql<number>`count(*)` }).from(schema.desktopLicenses)
        .where(sql`${schema.desktopLicenses.expiresAt} < NOW()`);
      const revokedLicenses = await db.select({ count: sql<number>`count(*)` }).from(schema.desktopLicenses)
        .where(eq(schema.desktopLicenses.status, "revoked"));
      const byPlan = await db.select({
        plan: schema.desktopLicenses.plan,
        count: sql<number>`count(*)`,
      }).from(schema.desktopLicenses)
        .groupBy(schema.desktopLicenses.plan);

      const byMonth = await db.select({
        month: sql<string>`DATE_FORMAT(${schema.desktopLicenses.createdAt}, '%Y-%m')`,
        count: sql<number>`count(*)`,
      }).from(schema.desktopLicenses)
        .where(gte(schema.desktopLicenses.createdAt, since))
        .groupBy(sql`DATE_FORMAT(${schema.desktopLicenses.createdAt}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${schema.desktopLicenses.createdAt}, '%Y-%m')`);

      return {
        total: totalLicenses[0]?.count || 0,
        active: activeLicenses[0]?.count || 0,
        expired: expiredLicenses[0]?.count || 0,
        revoked: revokedLicenses[0]?.count || 0,
        byPlan,
        byMonth,
      };
    }),

  // ─── License transfer history ─────────────────────────────────────
  transferHistory: superAdminQuery
    .input(z.object({ tenantId: z.number().optional(), licenseId: z.number().optional(), limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions: any[] = [eq(schema.auditLogs.entityType, "desktop_license")];
      if (input?.tenantId) conditions.push(eq(schema.auditLogs.tenantId, input.tenantId));
      if (input?.licenseId) conditions.push(eq(schema.auditLogs.entityId, input.licenseId));
      const logs = await db.select()
        .from(schema.auditLogs)
        .where(and(...conditions))
        .orderBy(desc(schema.auditLogs.createdAt))
        .limit(input?.limit || 50);
      const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))] as number[];
      const users = userIds.length > 0
        ? await db.select().from(schema.users).where(sql`${schema.users.id} IN (${userIds.join(",")})`)
        : [];
      const userMap = new Map(users.map(u => [u.id, u]));
      return logs.map(log => ({
        ...log,
        user: log.userId ? userMap.get(log.userId) || null : null,
      }));
    }),

  // ─── Payment integration placeholders ─────────────────────────────
  paymentMethods: superAdminQuery.query(async () => {
    return {
      stripe: { enabled: !!process.env.STRIPE_SECRET_KEY, label: "Stripe" },
      paytabs: { enabled: !!process.env.PAYTAB_SERVER_KEY, label: "PayTabs" },
      hyperpay: { enabled: !!process.env.HYPERPAY_ENTITY_ID, label: "HyperPay" },
      moyasar: { enabled: !!process.env.MOYASAR_API_KEY, label: "Moyasar" },
    };
  }),
});
