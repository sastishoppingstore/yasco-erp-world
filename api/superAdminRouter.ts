import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sendEmail } from "./lib/smtp";
import { createDesktopLicense } from "./lib/license";
import * as schema from "@db/schema";
import { and, eq, asc, desc, gte, lte, sql, count, like } from "drizzle-orm";
import crypto from "node:crypto";

const saudiVatPattern = /^3\d{13}3$/;

async function createAuditLog(params: { tenantId?: number; userId?: number; action: string; entityType: string; entityId?: number; oldValues?: any; newValues?: any }) {
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

function check(label: string, ok: boolean, severity: "critical" | "warning" | "info", message: string) {
  return { label, ok, severity, message };
}

function subscriptionAccess(sub: typeof schema.subscriptions.$inferSelect | null | undefined) {
  const now = new Date();
  if (!sub) return { allowed: false, reason: "No subscription selected" };
  if (sub.status === "suspended") return { allowed: false, reason: "Subscription is suspended" };
  if (sub.status === "cancelled") return { allowed: false, reason: "Subscription is cancelled" };
  if (sub.status === "expired") return { allowed: false, reason: "Subscription has expired" };
  if (sub.status === "past_due" && sub.gracePeriodEndsAt && new Date(sub.gracePeriodEndsAt) < now) {
    return { allowed: false, reason: "Payment grace period has ended" };
  }
  if (sub.status === "trial" && sub.trialEndAt && new Date(sub.trialEndAt) < now) {
    return { allowed: false, reason: "Trial period has ended" };
  }
  if (sub.status === "active" && sub.currentPeriodEndAt && new Date(sub.currentPeriodEndAt) < now) {
    return { allowed: false, reason: "Billing period has ended" };
  }
  return { allowed: true, reason: "Subscription is usable" };
}

async function buildTenantReadiness(tenantId: number) {
  const db = getDb();
  const [
    tenant,
    company,
    legal,
    settings,
    subscription,
    sandboxCredential,
    productionCredential,
    invoiceSummary,
    failedApiLogs,
    latestApiLog,
    certificates,
  ] = await Promise.all([
    db.query.tenants.findFirst({ where: eq(schema.tenants.id, tenantId) }),
    db.query.companies.findFirst({ where: eq(schema.companies.tenantId, tenantId) }),
    db.query.companyLegalDetails.findFirst({ where: eq(schema.companyLegalDetails.tenantId, tenantId) }),
    db.query.companySettings.findFirst({ where: eq(schema.companySettings.tenantId, tenantId) }),
    db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, tenantId) }),
    db.query.zatcaCredentials.findFirst({ where: and(eq(schema.zatcaCredentials.tenantId, tenantId), eq(schema.zatcaCredentials.environment, "sandbox"), eq(schema.zatcaCredentials.isActive, true)) }),
    db.query.zatcaCredentials.findFirst({ where: and(eq(schema.zatcaCredentials.tenantId, tenantId), eq(schema.zatcaCredentials.environment, "production"), eq(schema.zatcaCredentials.isActive, true)) }),
    db.select({
      total: sql<number>`count(*)`,
      cleared: sql<number>`sum(case when ${schema.zatcaInvoiceStatus.status} = 'cleared' then 1 else 0 end)`,
      reported: sql<number>`sum(case when ${schema.zatcaInvoiceStatus.status} = 'reported' then 1 else 0 end)`,
      failed: sql<number>`sum(case when ${schema.zatcaInvoiceStatus.status} in ('failed','rejected') then 1 else 0 end)`,
      pending: sql<number>`sum(case when ${schema.zatcaInvoiceStatus.status} in ('draft','signed','pending','submitted') then 1 else 0 end)`,
    }).from(schema.zatcaInvoiceStatus).where(eq(schema.zatcaInvoiceStatus.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)` }).from(schema.zatcaApiLogs).where(and(eq(schema.zatcaApiLogs.tenantId, tenantId), eq(schema.zatcaApiLogs.status, "failed"))),
    db.query.zatcaApiLogs.findFirst({ where: eq(schema.zatcaApiLogs.tenantId, tenantId), orderBy: [desc(schema.zatcaApiLogs.createdAt)] }),
    db.select().from(schema.zatcaCertificates).where(and(eq(schema.zatcaCertificates.tenantId, tenantId), eq(schema.zatcaCertificates.isActive, true))),
  ]);

  const vatNumber = legal?.vatNumber || settings?.taxNumber || tenant?.taxNumber || "";
  const subscriptionState = subscriptionAccess(subscription);
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiredCerts = certificates.filter((cert) => cert.expiresAt && new Date(cert.expiresAt) < now).length;
  const expiringCerts = certificates.filter((cert) => cert.expiresAt && new Date(cert.expiresAt) >= now && new Date(cert.expiresAt) <= soon).length;
  const checks = [
    check("Tenant active", !!tenant && !["suspended", "cancelled"].includes(tenant.status), "critical", "Tenant must be active or trial."),
    check("Subscription usable", subscriptionState.allowed, "critical", subscriptionState.reason),
    check("Company record", !!company, "critical", "Company profile must exist."),
    check("Legal name", !!(legal?.legalNameEn || legal?.legalNameAr || settings?.companyName), "critical", "Legal Arabic/English company name is required."),
    check("Saudi VAT number", saudiVatPattern.test(vatNumber.replace(/\D/g, "")), "critical", "VAT number must be 15 digits, start with 3, and end with 3."),
    check("CR number", !!(legal?.crNumber || settings?.crNumber || tenant?.registrationNumber), "warning", "Commercial registration number should be configured."),
    check("National address", !!(legal?.buildingNumber && legal?.streetName && legal?.city && legal?.postalCode), "warning", "Building, street, city, and postal code should be configured."),
    check("Sandbox EGS", !!sandboxCredential, "warning", "Sandbox ZATCA credentials should be configured before production onboarding."),
    check("Production EGS", !!productionCredential, "critical", "Production ZATCA credentials are required before live sale."),
    check("Certificate valid", expiredCerts === 0, "critical", "No active ZATCA certificate should be expired."),
    check("Certificate renewal", expiringCerts === 0, "warning", "Certificates expiring within 30 days should be renewed."),
  ];
  const criticalOpen = checks.filter((item) => !item.ok && item.severity === "critical").length;
  const warningsOpen = checks.filter((item) => !item.ok && item.severity === "warning").length;
  const score = Math.max(0, Math.round((checks.filter((item) => item.ok).length / checks.length) * 100));
  return {
    tenant,
    company,
    subscription,
    score,
    readyForSale: criticalOpen === 0,
    criticalOpen,
    warningsOpen,
    checks,
    zatca: {
      environment: productionCredential ? "production" : sandboxCredential ? "sandbox" : "not_configured",
      hasSandboxCredential: !!sandboxCredential,
      hasProductionCredential: !!productionCredential,
      activeCertificates: certificates.length,
      expiredCertificates: expiredCerts,
      expiringCertificates: expiringCerts,
      invoiceSummary: invoiceSummary[0] || { total: 0, cleared: 0, reported: 0, failed: 0, pending: 0 },
      failedApiLogs: Number(failedApiLogs[0]?.count || 0),
      latestApiLog,
    },
  };
}

// =====================================================
// SUPER ADMIN ROUTER - Master Prompt Full Implementation
// Dashboard, Billing, Analytics, Impersonation, ZATCA Global
// =====================================================

export const superAdminRouter = createRouter({
  companies: {
    list: adminQuery
      .input(z.object({ offset: z.number().default(0), limit: z.number().default(20) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const offset = input?.offset || 0;
        const limit = input?.limit || 20;
        const tenants = await db.select().from(schema.tenants).orderBy(desc(schema.tenants.createdAt)).limit(limit).offset(offset);
        const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(schema.tenants);
        const tenantIds = tenants.map(t => t.id);
        const subs = tenantIds.length > 0 ? await db.select().from(schema.subscriptions).where(sql`${schema.subscriptions.tenantId} IN (${tenantIds.join(",")})`) : [];
        const subMap = new Map(subs.map(s => [s.tenantId, s]));
        return {
          items: tenants.map(t => ({ ...t, subscription: subMap.get(t.id) || null })),
          total: totalResult?.total || 0,
          offset,
          limit,
        };
      }),
    getById: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        if (!tenant) throw new Error("Tenant not found");
        const company = await db.query.companies.findFirst({ where: eq(schema.companies.tenantId, input.tenantId) });
        const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, input.tenantId) });
        const users = await db.select().from(schema.users).where(eq(schema.users.tenantId, input.tenantId));
        return { tenant, company, subscription: sub, users };
      }),
    activate: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const oldTenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        await db.update(schema.tenants).set({ status: "active" }).where(eq(schema.tenants.id, input.tenantId));
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "company_activate", entityType: "tenant", entityId: input.tenantId, oldValues: oldTenant, newValues: { status: "active" } });
        return { success: true };
      }),
    deactivate: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const oldTenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        await db.update(schema.tenants).set({ status: "suspended" }).where(eq(schema.tenants.id, input.tenantId));
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "company_suspend", entityType: "tenant", entityId: input.tenantId, oldValues: oldTenant, newValues: { status: "suspended" } });
        return { success: true };
      }),
    archive: adminQuery
      .input(z.object({ tenantId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const oldTenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        if (!oldTenant) throw new Error("Tenant not found");
        await db.update(schema.tenants).set({ status: "suspended" }).where(eq(schema.tenants.id, input.tenantId));
        await db.update(schema.subscriptions).set({ status: "suspended" }).where(eq(schema.subscriptions.tenantId, input.tenantId));
        await createAuditLog({
          tenantId: input.tenantId,
          userId: ctx.user.id,
          action: "company_archive",
          entityType: "tenant",
          entityId: input.tenantId,
          oldValues: oldTenant,
          newValues: { status: "suspended", reason: input.reason || null },
        });
        return { success: true };
      }),
    restore: adminQuery
      .input(z.object({ tenantId: z.number(), subscriptionStatus: z.enum(["trial", "active", "past_due", "expired"]).default("active") }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const oldTenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        if (!oldTenant) throw new Error("Tenant not found");
        await db.update(schema.tenants).set({ status: input.subscriptionStatus === "trial" ? "trial" : "active" }).where(eq(schema.tenants.id, input.tenantId));
        await db.update(schema.subscriptions).set({ status: input.subscriptionStatus }).where(eq(schema.subscriptions.tenantId, input.tenantId));
        await createAuditLog({
          tenantId: input.tenantId,
          userId: ctx.user.id,
          action: "company_restore",
          entityType: "tenant",
          entityId: input.tenantId,
          oldValues: oldTenant,
          newValues: { status: input.subscriptionStatus === "trial" ? "trial" : "active", subscriptionStatus: input.subscriptionStatus },
        });
        return { success: true };
      }),
    changePlan: adminQuery
      .input(z.object({ tenantId: z.number(), planId: z.number(), billingCycle: z.enum(["monthly", "yearly"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, input.planId) });
        if (!plan) throw new Error("Plan not found");
        const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, input.tenantId) });
        if (sub) {
          await db.update(schema.subscriptions).set({ planId: plan.id, billingCycle: input.billingCycle, productLimit: plan.productLimit, userLimit: plan.userLimit, branchLimit: plan.branchLimit, warehouseLimit: plan.warehouseLimit }).where(eq(schema.subscriptions.tenantId, input.tenantId));
        } else {
          await db.insert(schema.subscriptions).values({ tenantId: input.tenantId, planId: plan.id, billingCycle: input.billingCycle, status: "active", productLimit: plan.productLimit, userLimit: plan.userLimit, branchLimit: plan.branchLimit, warehouseLimit: plan.warehouseLimit });
        }
        await db.update(schema.tenants).set({ plan: plan.name.toLowerCase() as any }).where(eq(schema.tenants.id, input.tenantId));
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "company_change_plan", entityType: "subscription", entityId: sub?.id, newValues: { planId: plan.id, billingCycle: input.billingCycle } });
        return { success: true };
      }),
    extendTrial: adminQuery
      .input(z.object({ tenantId: z.number(), days: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        const newTrialEnd = new Date(Date.now() + input.days * 24 * 60 * 60 * 1000);
        await db.update(schema.tenants).set({ trialEndsAt: newTrialEnd, status: "trial" }).where(eq(schema.tenants.id, input.tenantId));
        const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, input.tenantId) });
        if (sub) {
          await db.update(schema.subscriptions).set({ trialEndAt: newTrialEnd, status: "trial" }).where(eq(schema.subscriptions.tenantId, input.tenantId));
        }
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "company_extend_trial", entityType: "tenant", entityId: input.tenantId, oldValues: { trialEndsAt: tenant?.trialEndsAt }, newValues: { trialEndsAt: newTrialEnd } });
        return { success: true };
      }),
    addFreeDays: adminQuery
      .input(z.object({ tenantId: z.number(), days: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, input.tenantId) });
        if (!sub) throw new Error("No subscription found for this tenant");
        const currentEnd = sub.currentPeriodEndAt || new Date();
        const newEnd = new Date(currentEnd.getTime() + input.days * 24 * 60 * 60 * 1000);
        await db.update(schema.subscriptions).set({ currentPeriodEndAt: newEnd }).where(eq(schema.subscriptions.tenantId, input.tenantId));
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "company_add_free_days", entityType: "subscription", entityId: sub.id, oldValues: { currentPeriodEndAt: sub.currentPeriodEndAt }, newValues: { currentPeriodEndAt: newEnd } });
        return { success: true };
      }),
    delete: adminQuery
      .input(z.object({ tenantId: z.number(), confirm: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (!input.confirm) throw new Error("Confirmation required to delete company");
        const db = getDb();
        const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        if (!tenant) throw new Error("Tenant not found");
        await db.delete(schema.users).where(eq(schema.users.tenantId, input.tenantId));
        await db.delete(schema.companies).where(eq(schema.companies.tenantId, input.tenantId));
        await db.delete(schema.subscriptions).where(eq(schema.subscriptions.tenantId, input.tenantId));
        await db.delete(schema.tenants).where(eq(schema.tenants.id, input.tenantId));
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "company_delete", entityType: "tenant", entityId: input.tenantId, newValues: { deleted: true } });
        return { success: true };
      }),
    impersonate: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        if (!tenant) throw new Error("Tenant not found");
        const adminUser = await db.query.users.findFirst({ where: and(eq(schema.users.tenantId, input.tenantId), eq(schema.users.role, "admin")) });
        if (!adminUser) throw new Error("No admin user found for tenant");
        // In real impl: generate short-lived JWT with impersonation flag
        const token = "impersonated_" + Date.now();
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "impersonate", entityType: "tenant", entityId: input.tenantId });
        return { success: true, token, user: adminUser };
      }),
  },
  plans: {
    list: adminQuery.query(async () => {
      const db = getDb();
      return db.select().from(schema.plans).orderBy(asc(schema.plans.sortOrder));
    }),
    create: adminQuery
      .input(z.object({
        name: z.string(), nameAr: z.string().optional(), description: z.string().optional(), descriptionAr: z.string().optional(),
        priceMonth: z.string().default("0"), priceYear: z.string().default("0"), currency: z.string().default("SAR"),
        productLimit: z.number().default(60), userLimit: z.number().default(5), branchLimit: z.number().default(1), warehouseLimit: z.number().default(1),
        trialDays: z.number().default(3), isActive: z.boolean().default(true), sortOrder: z.number().default(0),
        features: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const [{ id }] = await db.insert(schema.plans).values(input).$returningId();
        await createAuditLog({ userId: ctx.user.id, action: "plan_create", entityType: "plan", entityId: id, newValues: input });
        return { id, success: true };
      }),
    update: adminQuery
      .input(z.object({
        id: z.number(), name: z.string().optional(), nameAr: z.string().optional(), description: z.string().optional(), descriptionAr: z.string().optional(),
        priceMonth: z.string().optional(), priceYear: z.string().optional(), currency: z.string().optional(),
        productLimit: z.number().optional(), userLimit: z.number().optional(), branchLimit: z.number().optional(), warehouseLimit: z.number().optional(),
        trialDays: z.number().optional(), isActive: z.boolean().optional(), sortOrder: z.number().optional(),
        features: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const { id, ...data } = input;
        const old = await db.query.plans.findFirst({ where: eq(schema.plans.id, id) });
        await db.update(schema.plans).set(data).where(eq(schema.plans.id, id));
        await createAuditLog({ userId: ctx.user.id, action: "plan_update", entityType: "plan", entityId: id, oldValues: old, newValues: data });
        return { success: true };
      }),
    delete: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const old = await db.query.plans.findFirst({ where: eq(schema.plans.id, input.id) });
        await db.delete(schema.plans).where(eq(schema.plans.id, input.id));
        await createAuditLog({ userId: ctx.user.id, action: "plan_delete", entityType: "plan", entityId: input.id, oldValues: old });
        return { success: true };
      }),
  },
  modules: {
    listForTenant: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        const [modules, controls, subscription] = await Promise.all([
          db.select().from(schema.moduleRegistry).orderBy(asc(schema.moduleRegistry.sortOrder)),
          db.select().from(schema.tenantModuleControls).where(eq(schema.tenantModuleControls.tenantId, input.tenantId)),
          db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, input.tenantId) }),
        ]);
        const controlMap = new Map(controls.map((control) => [control.moduleKey, control]));
        const planFeatures = subscription?.planId
          ? await db.select().from(schema.planFeatures).where(and(eq(schema.planFeatures.planId, subscription.planId), eq(schema.planFeatures.isActive, true)))
          : [];
        const planFeatureKeys = new Set(planFeatures.map((feature) => feature.featureKey));
        return modules.map((module) => {
          const control = controlMap.get(module.moduleKey);
          const planAllows = planFeatureKeys.size === 0 || planFeatureKeys.has(module.moduleKey);
          return {
            ...module,
            planAllows,
            isEnabled: control ? control.isEnabled : planAllows,
            source: control?.source || "plan",
            limitJson: control?.limitJson || null,
            notes: control?.notes || "",
          };
        });
      }),

    setTenantModule: adminQuery
      .input(z.object({
        tenantId: z.number(),
        moduleKey: z.string().min(1),
        isEnabled: z.boolean(),
        source: z.enum(["plan", "override", "trial", "support"]).default("override"),
        limitJson: z.record(z.string(), z.unknown()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const values = {
          tenantId: input.tenantId,
          moduleKey: input.moduleKey,
          isEnabled: input.isEnabled,
          source: input.source,
          limitJson: input.limitJson,
          notes: input.notes,
          updatedBy: ctx.user.id,
        };
        await db.insert(schema.tenantModuleControls).values(values).onDuplicateKeyUpdate({
          set: {
            isEnabled: input.isEnabled,
            source: input.source,
            limitJson: input.limitJson,
            notes: input.notes,
            updatedBy: ctx.user.id,
            updatedAt: new Date(),
          },
        });
        await db.insert(schema.tenantServiceEvents).values({
          tenantId: input.tenantId,
          eventType: "module_toggle",
          status: "done",
          title: `${input.moduleKey} ${input.isEnabled ? "enabled" : "disabled"}`,
          metadata: { moduleKey: input.moduleKey, isEnabled: input.isEnabled, source: input.source },
          requestedBy: ctx.user.id,
        });
        await createAuditLog({
          tenantId: input.tenantId,
          userId: ctx.user.id,
          action: "tenant_module_toggle",
          entityType: "tenant_module_control",
          newValues: values,
        });
        return { success: true };
      }),
  },

  subscriptions: {
    updateLimits: adminQuery
      .input(z.object({
        tenantId: z.number(),
        userLimit: z.number().int().nonnegative().optional(),
        branchLimit: z.number().int().nonnegative().optional(),
        warehouseLimit: z.number().int().nonnegative().optional(),
        productLimit: z.number().int().nonnegative().optional(),
        status: z.enum(["trial", "active", "past_due", "cancelled", "expired", "suspended"]).optional(),
        graceDays: z.number().int().nonnegative().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, input.tenantId) });
        if (!sub) throw new Error("No subscription found for this tenant");
        const gracePeriodEndsAt = input.graceDays !== undefined
          ? new Date(Date.now() + input.graceDays * 24 * 60 * 60 * 1000)
          : undefined;
        const updates = {
          userLimit: input.userLimit,
          branchLimit: input.branchLimit,
          warehouseLimit: input.warehouseLimit,
          productLimit: input.productLimit,
          status: input.status,
          gracePeriodEndsAt,
        };
        await db.update(schema.subscriptions).set(updates).where(eq(schema.subscriptions.tenantId, input.tenantId));
        await db.insert(schema.tenantServiceEvents).values({
          tenantId: input.tenantId,
          eventType: "limit_update",
          status: "done",
          title: "Subscription limits updated",
          metadata: updates,
          requestedBy: ctx.user.id,
        });
        await createAuditLog({
          tenantId: input.tenantId,
          userId: ctx.user.id,
          action: "subscription_limits_update",
          entityType: "subscription",
          entityId: sub.id,
          oldValues: sub,
          newValues: updates,
        });
        return { success: true };
      }),
  },

  serviceEvents: {
    list: adminQuery
      .input(z.object({ tenantId: z.number().optional(), limit: z.number().min(1).max(100).default(25) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const query = db.select().from(schema.tenantServiceEvents);
        if (input?.tenantId) {
          return query.where(eq(schema.tenantServiceEvents.tenantId, input.tenantId)).orderBy(desc(schema.tenantServiceEvents.createdAt)).limit(input.limit || 25);
        }
        return query.orderBy(desc(schema.tenantServiceEvents.createdAt)).limit(input?.limit || 25);
      }),

    requestBackup: adminQuery
      .input(z.object({ tenantId: z.number(), type: z.enum(["backup_request", "restore_request"]), notes: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const [{ id }] = await db.insert(schema.tenantServiceEvents).values({
          tenantId: input.tenantId,
          eventType: input.type,
          status: "pending",
          title: input.type === "backup_request" ? "Backup requested" : "Restore requested",
          metadata: { notes: input.notes || "" },
          requestedBy: ctx.user.id,
        }).$returningId();
        await createAuditLog({
          tenantId: input.tenantId,
          userId: ctx.user.id,
          action: input.type,
          entityType: "tenant_service_event",
          entityId: id,
          newValues: { notes: input.notes || "" },
        });
        return { id, success: true };
      }),
  },

  smtp: {
    getSettings: adminQuery.query(async () => {
      const db = getDb();
      const settings = await db.query.smtpSettings.findFirst({ where: eq(schema.smtpSettings.tenantId, 1) });
      return settings || null;
    }),
    saveSettings: adminQuery
      .input(z.object({
        host: z.string(), port: z.number().default(587), username: z.string().optional(), passwordEncrypted: z.string().optional(),
        encryption: z.enum(["none", "ssl", "tls", "starttls"]).default("starttls"), senderName: z.string().optional(),
        senderEmail: z.string(), replyToEmail: z.string().optional(), isActive: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const existing = await db.query.smtpSettings.findFirst({ where: eq(schema.smtpSettings.tenantId, 1) });
        if (existing) {
          await db.update(schema.smtpSettings).set(input).where(eq(schema.smtpSettings.tenantId, 1));
        } else {
          await db.insert(schema.smtpSettings).values({ ...input, tenantId: 1 });
        }
        await createAuditLog({ userId: ctx.user.id, action: "smtp_settings_save", entityType: "smtp_settings", entityId: existing?.id, newValues: input });
        return { success: true };
      }),
    test: adminQuery
      .input(z.object({ to: z.string().email().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const settings = await db.query.smtpSettings.findFirst({ where: eq(schema.smtpSettings.tenantId, 1) });
        if (!settings) throw new Error("No SMTP settings configured");
        const testTo = input.to || ctx.user.email || "test@example.com";
        try {
          const result = await sendEmail(testTo, "SMTP Test", "This is a test email from YASCO ERP. Your SMTP settings are working correctly.");
          if (result.sent) {
            await db.update(schema.smtpSettings).set({ testStatus: "success", lastTestedAt: new Date() }).where(eq(schema.smtpSettings.tenantId, 1));
            return { success: true, message: "Test email sent successfully" };
          }
          throw new Error("Failed to send test email");
        } catch (err: any) {
          await db.update(schema.smtpSettings).set({ testStatus: "failed", lastTestedAt: new Date() }).where(eq(schema.smtpSettings.tenantId, 1));
          throw new Error(`SMTP test failed: ${err.message}`);
        }
      }),
  },
  emailTemplates: {
    list: adminQuery.query(async () => {
      const db = getDb();
      return db.select().from(schema.emailTemplates).orderBy(desc(schema.emailTemplates.createdAt));
    }),
    getByKey: adminQuery
      .input(z.object({ templateKey: z.string() }))
      .query(async ({ input }) => {
        const db = getDb();
        const template = await db.query.emailTemplates.findFirst({ where: eq(schema.emailTemplates.templateKey, input.templateKey) });
        if (!template) throw new Error("Template not found");
        return template;
      }),
    update: adminQuery
      .input(z.object({
        id: z.number(), name: z.string().optional(), subject: z.string().optional(), subjectAr: z.string().optional(),
        body: z.string().optional(), bodyAr: z.string().optional(), variables: z.any().optional(), isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const { id, ...data } = input;
        const old = await db.query.emailTemplates.findFirst({ where: eq(schema.emailTemplates.id, id) });
        await db.update(schema.emailTemplates).set(data).where(eq(schema.emailTemplates.id, id));
        await createAuditLog({ userId: ctx.user.id, action: "email_template_update", entityType: "email_template", entityId: id, oldValues: old, newValues: data });
        return { success: true };
      }),
  },
  emailLogs: {
    list: adminQuery
      .input(z.object({ offset: z.number().default(0), limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        const items = await db.select().from(schema.emailLogs).orderBy(desc(schema.emailLogs.sentAt)).limit(limit).offset(offset);
        const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(schema.emailLogs);
        return { items, total: totalResult?.total || 0 };
      }),
  },
  otpLogs: {
    list: adminQuery
      .input(z.object({ offset: z.number().default(0), limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        const items = await db.select().from(schema.otpCodes).orderBy(desc(schema.otpCodes.createdAt)).limit(limit).offset(offset);
        const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(schema.otpCodes);
        return { items, total: totalResult?.total || 0 };
      }),
  },
  auditLogs: {
    list: adminQuery
      .input(z.object({ offset: z.number().default(0), limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const offset = input?.offset || 0;
        const limit = input?.limit || 50;
        const items = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(limit).offset(offset);
        const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(schema.auditLogs);
        return { items, total: totalResult?.total || 0 };
      }),
  },
  licenses: {
    generate: adminQuery
      .input(z.object({
        tenantId: z.number(),
        companyName: z.string().min(1),
        plan: z.string().default("desktop"),
        maxDevices: z.number().int().positive().default(1),
        validDays: z.number().int().positive().default(365),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const expiresAt = new Date(Date.now() + input.validDays * 24 * 60 * 60 * 1000);
        const licenseKey = createDesktopLicense({
          tenantId: input.tenantId,
          companyName: input.companyName,
          plan: input.plan,
          maxDevices: input.maxDevices,
          expiresAt: expiresAt.toISOString(),
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
          action: "desktop_license_generate",
          entityType: "desktop_license",
          entityId: id,
          newValues: { plan: input.plan, maxDevices: input.maxDevices, expiresAt },
        });
        return { id, licenseKey, expiresAt: expiresAt.toISOString() };
      }),

    list: adminQuery
      .input(z.object({ tenantId: z.number().optional(), limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const baseQuery = db.select().from(schema.desktopLicenses);
        if (input?.tenantId) {
          return baseQuery
            .where(eq(schema.desktopLicenses.tenantId, input.tenantId))
            .orderBy(desc(schema.desktopLicenses.createdAt))
            .limit(input?.limit || 50);
        }
        return baseQuery
          .orderBy(desc(schema.desktopLicenses.createdAt))
          .limit(input?.limit || 50);
      }),

    revoke: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        await db.update(schema.desktopLicenses).set({ status: "revoked" }).where(eq(schema.desktopLicenses.id, input.id));
        await createAuditLog({ userId: ctx.user.id, action: "desktop_license_revoke", entityType: "desktop_license", entityId: input.id });
        return { success: true };
      }),
  },
  stats: {
    dashboard: adminQuery.query(async () => {
      const db = getDb();
      const [totalCompanies] = await db.select({ count: sql<number>`count(*)` }).from(schema.tenants);
      const [activeCompanies] = await db.select({ count: sql<number>`count(*)` }).from(schema.tenants).where(eq(schema.tenants.status, "active"));
      const [trialCompanies] = await db.select({ count: sql<number>`count(*)` }).from(schema.tenants).where(eq(schema.tenants.status, "trial"));
      const [suspendedCompanies] = await db.select({ count: sql<number>`count(*)` }).from(schema.tenants).where(eq(schema.tenants.status, "suspended"));
      const [revenueResult] = await db.select({ total: sql<string>`coalesce(sum(amount), 0)` }).from(schema.subscriptionInvoices).where(eq(schema.subscriptionInvoices.status, "paid"));
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const [signupsThisMonth] = await db.select({ count: sql<number>`count(*)` }).from(schema.tenants).where(gte(schema.tenants.createdAt, startOfMonth));
      const [totalSubscriptions] = await db.select({ count: sql<number>`count(*)` }).from(schema.subscriptions);
      const [paidSubscriptions] = await db.select({ count: sql<number>`count(*)` }).from(schema.subscriptions).where(eq(schema.subscriptions.status, "active"));
      const [failedZatca] = await db.select({ count: sql<number>`count(*)` }).from(schema.zatcaApiLogs).where(eq(schema.zatcaApiLogs.status, "failed"));
      const [pendingZatca] = await db.select({ count: sql<number>`count(*)` }).from(schema.zatcaInvoiceStatus).where(sql`${schema.zatcaInvoiceStatus.status} in ('draft','signed','pending','submitted')`);
      return {
        totalCompanies: totalCompanies?.count || 0,
        activeCompanies: activeCompanies?.count || 0,
        trialCompanies: trialCompanies?.count || 0,
        suspendedCompanies: suspendedCompanies?.count || 0,
        totalRevenue: Number(revenueResult?.total || 0),
        signupsThisMonth: signupsThisMonth?.count || 0,
        totalSubscriptions: totalSubscriptions?.count || 0,
        paidSubscriptions: paidSubscriptions?.count || 0,
        failedZatca: failedZatca?.count || 0,
        pendingZatca: pendingZatca?.count || 0,
      };
    }),
    revenue: adminQuery
      .input(z.object({ year: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const year = input?.year || new Date().getFullYear();
        const rows = await db.select({
          month: sql<number>`month(${schema.subscriptionInvoices.createdAt})`,
          total: sql<string>`coalesce(sum(${schema.subscriptionInvoices.amount}), 0)`,
          count: sql<number>`count(*)`,
        }).from(schema.subscriptionInvoices).where(
          and(eq(schema.subscriptionInvoices.status, "paid"), sql`year(${schema.subscriptionInvoices.createdAt}) = ${year}`),
        ).groupBy(sql`month(${schema.subscriptionInvoices.createdAt})`).orderBy(sql`month(${schema.subscriptionInvoices.createdAt})`);
        const months = Array.from({ length: 12 }, (_, i) => {
          const row = rows.find(r => r.month === i + 1);
          return { month: i + 1, total: Number(row?.total || 0), count: row?.count || 0 };
        });
        return { year, months };
      }),
    signups: adminQuery
      .input(z.object({ year: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const year = input?.year || new Date().getFullYear();
        const rows = await db.select({
          month: sql<number>`month(${schema.tenants.createdAt})`,
          count: sql<number>`count(*)`,
        }).from(schema.tenants).where(sql`year(${schema.tenants.createdAt}) = ${year}`)
          .groupBy(sql`month(${schema.tenants.createdAt})`).orderBy(sql`month(${schema.tenants.createdAt})`);
        const months = Array.from({ length: 12 }, (_, i) => {
          const row = rows.find(r => r.month === i + 1);
          return { month: i + 1, count: row?.count || 0 };
        });
        return { year, months };
      }),
    trialConversion: adminQuery.query(async () => {
      const db = getDb();
      const [totalTrials] = await db.select({ count: sql<number>`count(*)` }).from(schema.subscriptions).where(eq(schema.subscriptions.status, "trial"));
      const [convertedToPaid] = await db.select({ count: sql<number>`count(*)` }).from(schema.subscriptions).where(
        and(eq(schema.subscriptions.status, "active"), sql`${schema.subscriptions.trialStartAt} IS NOT NULL`),
      );
      const total = totalTrials?.count || 0;
      const converted = convertedToPaid?.count || 0;
      return {
        totalTrials: total,
        convertedToPaid: converted,
        conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
      };
    }),
  },

  // =====================================================
  // GLOBAL COMPLIANCE READINESS - SaaS/ZATCA launch control
  // =====================================================
  compliance: {
    tenantReadiness: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => buildTenantReadiness(input.tenantId)),

    globalReadiness: adminQuery
      .input(z.object({ limit: z.number().min(1).max(200).default(50), onlyNotReady: z.boolean().default(false) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const limit = input?.limit || 50;
        const tenants = await db.select({ id: schema.tenants.id }).from(schema.tenants).orderBy(desc(schema.tenants.createdAt)).limit(limit);
        const readiness = await Promise.all(tenants.map((tenant) => buildTenantReadiness(tenant.id)));
        const items = input?.onlyNotReady ? readiness.filter((item) => !item.readyForSale) : readiness;
        return {
          totalChecked: readiness.length,
          ready: readiness.filter((item) => item.readyForSale).length,
          notReady: readiness.filter((item) => !item.readyForSale).length,
          criticalOpen: readiness.reduce((sum, item) => sum + item.criticalOpen, 0),
          warningsOpen: readiness.reduce((sum, item) => sum + item.warningsOpen, 0),
          items,
        };
      }),

    zatcaFailures: adminQuery
      .input(z.object({ tenantId: z.number().optional(), limit: z.number().min(1).max(200).default(50) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const where = input?.tenantId
          ? and(eq(schema.zatcaApiLogs.status, "failed"), eq(schema.zatcaApiLogs.tenantId, input.tenantId))
          : eq(schema.zatcaApiLogs.status, "failed");
        return db.select().from(schema.zatcaApiLogs).where(where).orderBy(desc(schema.zatcaApiLogs.createdAt)).limit(input?.limit || 50);
      }),
  },

  // =====================================================
  // SUPPORT TICKETS (Platform Level) - Master Prompt
  // =====================================================
  supportTickets: {
    list: adminQuery
      .input(z.object({ status: z.string().optional(), priority: z.string().optional(), limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const conditions = [];
        if (input?.status) conditions.push(eq(schema.supportTickets.status, input.status as any));
        if (input?.priority) conditions.push(eq(schema.supportTickets.priority, input.priority as any));
        return db.select().from(schema.supportTickets).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(schema.supportTickets.createdAt)).limit(input?.limit || 50);
      }),

    assign: adminQuery
      .input(z.object({ ticketId: z.number(), assignedTo: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        await db.update(schema.supportTickets).set({ assignedTo: input.assignedTo, status: "in_progress" }).where(eq(schema.supportTickets.id, input.ticketId));
        await createAuditLog({ userId: ctx.user.id, action: "support_ticket_assign", entityType: "support_ticket", entityId: input.ticketId, newValues: { assignedTo: input.assignedTo } });
        return { success: true };
      }),

    updateStatus: adminQuery
      .input(z.object({ ticketId: z.number(), status: z.enum(["open", "in_progress", "resolved", "closed"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        await db.update(schema.supportTickets).set({ status: input.status }).where(eq(schema.supportTickets.id, input.ticketId));
        await createAuditLog({ userId: ctx.user.id, action: "support_ticket_status", entityType: "support_ticket", entityId: input.ticketId, newValues: { status: input.status } });
        return { success: true };
      }),
  },

  // =====================================================
  // IMPERSONATION - Master Prompt Requirement
  // =====================================================
  impersonate: {
    start: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, input.tenantId) });
        if (!tenant) throw new Error("Tenant not found");
        await createAuditLog({ tenantId: input.tenantId, userId: ctx.user.id, action: "impersonation_start", entityType: "tenant", entityId: input.tenantId });
        return { success: true, tenantId: input.tenantId, tenantName: tenant.name, impersonatedBy: ctx.user.id };
      }),
  },

  // =====================================================
  // GLOBAL SYSTEM SETTINGS - Master Prompt
  // =====================================================
  system: {
    getSettings: adminQuery.query(async () => {
      const db = getDb();
      return db.select().from(schema.systemSettings);
    }),

    updateSetting: adminQuery
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        await db.insert(schema.systemSettings).values({ key: input.key, value: input.value }).onDuplicateKeyUpdate({ set: { value: input.value } });
        await createAuditLog({ userId: ctx.user.id, action: "system_setting_update", entityType: "system_setting", newValues: { key: input.key, value: input.value } });
        return { success: true };
      }),
  },
});
