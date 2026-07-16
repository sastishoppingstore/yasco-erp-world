import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";
import * as schema from "@db/schema";
import { and, eq, asc, desc, gte, lte, sql } from "drizzle-orm";
import crypto from "node:crypto";

function hashOtp(email: string, otp: string) {
  return crypto.createHmac("sha256", env.appSecret || env.encryptionKey).update(`${email}:${otp}`).digest("hex");
}

async function getTenantUsage(tenantId: number) {
  const db = getDb();
  const [[products], [users], [warehouses], [invoices]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(schema.products).where(eq(schema.products.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)` }).from(schema.users).where(eq(schema.users.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)` }).from(schema.warehouses).where(eq(schema.warehouses.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)` }).from(schema.invoices).where(eq(schema.invoices.tenantId, tenantId)),
  ]);
  return {
    products: Number(products?.count || 0),
    users: Number(users?.count || 0),
    warehouses: Number(warehouses?.count || 0),
    invoices: Number(invoices?.count || 0),
  };
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
  return { allowed: true, reason: "Subscription is active" };
}

export const saasRouter = createRouter({
  plans: {
    list: publicQuery.query(async () => {
      const db = getDb();
      const plans = await db.select().from(schema.plans).where(eq(schema.plans.isActive, true)).orderBy(asc(schema.plans.sortOrder));
      const result = [];
      for (const plan of plans) {
        const features = await db.select().from(schema.planFeatures).where(and(eq(schema.planFeatures.planId, plan.id), eq(schema.planFeatures.isActive, true)));
        result.push({ ...plan, features });
      }
      return result;
    }),
    getById: publicQuery
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, input.planId) });
        if (!plan) throw new Error("Plan not found");
        const features = await db.select().from(schema.planFeatures).where(and(eq(schema.planFeatures.planId, plan.id), eq(schema.planFeatures.isActive, true)));
        return { ...plan, features };
      }),
  },
  subscription: {
    mySubscription: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, ctx.user.tenantId!) });
      if (!sub) return null;
      const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, sub.planId) });
      return { ...sub, plan };
    }),
    selectPlan: authedQuery
      .input(z.object({ planId: z.number(), billingCycle: z.enum(["monthly", "yearly"]), couponCode: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, input.planId) });
        if (!plan || !plan.isActive) throw new Error("Plan not found or inactive");
        const tenantId = ctx.user.tenantId!;
        const existing = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, tenantId) });
        const subData = {
          tenantId,
          planId: plan.id,
          billingCycle: input.billingCycle,
          status: "active" as const,
          currentPeriodStartAt: new Date(),
          currentPeriodEndAt: new Date(Date.now() + (input.billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000),
          productLimit: plan.productLimit,
          userLimit: plan.userLimit,
          branchLimit: plan.branchLimit,
          warehouseLimit: plan.warehouseLimit,
          couponCode: input.couponCode || null,
        };
        if (existing) {
          await db.update(schema.subscriptions).set(subData).where(eq(schema.subscriptions.tenantId, tenantId));
        } else {
          await db.insert(schema.subscriptions).values(subData);
        }
        await db.update(schema.tenants).set({ plan: plan.name.toLowerCase() as any, status: "active" }).where(eq(schema.tenants.id, tenantId));
        return { success: true };
      }),
    startTrial: authedQuery.mutation(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const existing = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, tenantId) });
      if (existing) {
        await db.update(schema.subscriptions).set({ status: "trial", trialStartAt: new Date(), trialEndAt: trialEnd }).where(eq(schema.subscriptions.tenantId, tenantId));
      } else {
        const freePlan = await db.query.plans.findFirst({ where: and(eq(schema.plans.isActive, true), eq(schema.plans.name, "free")) });
        await db.insert(schema.subscriptions).values({
          tenantId,
          planId: freePlan?.id || 1,
          status: "trial",
          trialStartAt: new Date(),
          trialEndAt: trialEnd,
          productLimit: freePlan?.productLimit || 30,
          userLimit: freePlan?.userLimit || 3,
          branchLimit: freePlan?.branchLimit || 1,
          warehouseLimit: freePlan?.warehouseLimit || 1,
        });
      }
      await db.update(schema.tenants).set({ status: "trial", trialEndsAt: trialEnd }).where(eq(schema.tenants.id, tenantId));
      return { success: true, trialEndsAt: trialEnd };
    }),
    upgradePlan: authedQuery
      .input(z.object({ planId: z.number(), billingCycle: z.enum(["monthly", "yearly"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, input.planId) });
        if (!plan || !plan.isActive) throw new Error("Plan not found or inactive");
        const tenantId = ctx.user.tenantId!;
        await db.update(schema.subscriptions).set({
          planId: plan.id,
          billingCycle: input.billingCycle,
          status: "active",
          productLimit: plan.productLimit,
          userLimit: plan.userLimit,
          branchLimit: plan.branchLimit,
          warehouseLimit: plan.warehouseLimit,
          currentPeriodStartAt: new Date(),
          currentPeriodEndAt: new Date(Date.now() + (input.billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000),
        }).where(eq(schema.subscriptions.tenantId, tenantId));
        await db.update(schema.tenants).set({ plan: plan.name.toLowerCase() as any, status: "active" }).where(eq(schema.tenants.id, tenantId));
        return { success: true };
      }),
    cancel: authedQuery.mutation(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      await db.update(schema.subscriptions).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(schema.subscriptions.tenantId, tenantId));
      await db.update(schema.tenants).set({ status: "cancelled" }).where(eq(schema.tenants.id, tenantId));
      return { success: true };
    }),
    getLimits: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, ctx.user.tenantId!) });
      if (sub) {
        return { productLimit: sub.productLimit, userLimit: sub.userLimit, branchLimit: sub.branchLimit, warehouseLimit: sub.warehouseLimit };
      }
      return { productLimit: 30, userLimit: 3, branchLimit: 1, warehouseLimit: 1 };
    }),
    status: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [tenant, sub, usage] = await Promise.all([
        db.query.tenants.findFirst({ where: eq(schema.tenants.id, tenantId) }),
        db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, tenantId) }),
        getTenantUsage(tenantId),
      ]);
      const plan = sub ? await db.query.plans.findFirst({ where: eq(schema.plans.id, sub.planId) }) : null;
      const access = subscriptionAccess(sub);
      const limits = {
        products: sub?.productLimit ?? 30,
        users: sub?.userLimit ?? 3,
        warehouses: sub?.warehouseLimit ?? 1,
        branches: sub?.branchLimit ?? 1,
      };
      return {
        allowed: access.allowed && tenant?.status !== "suspended" && tenant?.status !== "cancelled",
        reason: tenant?.status === "suspended" ? "Company is suspended" : tenant?.status === "cancelled" ? "Company is cancelled" : access.reason,
        tenant,
        subscription: sub,
        plan,
        limits,
        usage,
        utilization: {
          products: limits.products ? Math.round((usage.products / limits.products) * 100) : 0,
          users: limits.users ? Math.round((usage.users / limits.users) * 100) : 0,
          warehouses: limits.warehouses ? Math.round((usage.warehouses / limits.warehouses) * 100) : 0,
        },
      };
    }),
    checkProductLimit: authedQuery
      .input(z.object({ count: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const tenantId = ctx.user.tenantId!;
        const sub = await db.query.subscriptions.findFirst({ where: eq(schema.subscriptions.tenantId, tenantId) });
        const limit = sub?.productLimit || 30;
        const [result] = await db.select({ current: sql<number>`count(*)` }).from(schema.products).where(eq(schema.products.tenantId, tenantId));
        const current = result?.current || 0;
        const allowed = (current + input.count) <= limit;
        return { allowed, current, limit };
      }),
  },
  coupon: {
    validate: publicQuery
      .input(z.object({ code: z.string(), planId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        const coupon = await db.query.coupons.findFirst({ where: eq(schema.coupons.code, input.code) });
        if (!coupon) throw new Error("Invalid coupon code");
        if (!coupon.isActive) throw new Error("Coupon is no longer active");
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error("Coupon has expired");
        if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) throw new Error("Coupon is not yet valid");
        const maxUses = coupon.maxUses ?? 0;
        const usedCount = coupon.usedCount ?? 0;
        if (maxUses > 0 && usedCount >= maxUses) throw new Error("Coupon usage limit reached");
        if (coupon.applicablePlans) {
          const planIds = coupon.applicablePlans as number[];
          if (!planIds.includes(input.planId)) throw new Error("Coupon not applicable for this plan");
        }
        const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, input.planId) });
        if (coupon.minPlanPrice && plan) {
          const price = Math.max(Number(plan.priceMonth), Number(plan.priceYear));
          if (price < Number(coupon.minPlanPrice)) throw new Error("Minimum plan price not met");
        }
        return {
          valid: true,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.description,
          code: coupon.code,
        };
      }),
  },
  offers: {
    list: publicQuery.query(async () => {
      const db = getDb();
      const now = new Date();
      return db.select().from(schema.offers).where(and(
        eq(schema.offers.isActive, true),
        sql`(${schema.offers.startsAt} IS NULL OR ${schema.offers.startsAt} <= ${now})`,
        sql`(${schema.offers.expiresAt} IS NULL OR ${schema.offers.expiresAt} >= ${now})`,
      )).orderBy(desc(schema.offers.createdAt));
    }),
  },
});
