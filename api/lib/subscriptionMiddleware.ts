import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

/**
 * Module Access Control
 * Checks if a tenant has access to a specific module
 */
export async function checkModuleAccess(tenantId: number, moduleName: string): Promise<void> {
  const db = getDb();
  
  // Check if module is enabled for this tenant
  const moduleAccess = await db.query.tenantModules.findFirst({
    where: and(
      eq(schema.tenantModules.tenantId, tenantId),
      eq(schema.tenantModules.moduleName, moduleName)
    )
  });
  
  // If not found or disabled, deny access
  if (!moduleAccess || !moduleAccess.isEnabled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Module "${moduleName}" is not enabled for your subscription. Please upgrade your plan or contact support.`
    });
  }
}

/**
 * Get Subscription Limits
 * Returns the effective limits for a tenant (plan + overrides)
 */
export async function getSubscriptionLimits(tenantId: number) {
  const db = getDb();
  
  // Get tenant and subscription
  const tenant = await db.query.tenants.findFirst({
    where: eq(schema.tenants.id, tenantId)
  });
  
  if (!tenant) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tenant not found"
    });
  }
  
  // Get subscription plan
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.tenantId, tenantId)
  });
  
  const plan = await db.query.subscriptionPlans.findFirst({
    where: eq(schema.subscriptionPlans.name, tenant.plan)
  });
  
  if (!plan) {
    // Default limits if no plan found
    return {
      maxUsers: 2,
      maxBranches: 1,
      maxInvoicesPerMonth: 50,
      maxDevices: 1,
      maxStorageGb: 1
    };
  }
  
  // Check for override
  const override = await db.query.tenantLimitsOverride.findFirst({
    where: eq(schema.tenantLimitsOverride.tenantId, tenantId)
  });
  
  // If override exists and not expired, use override values
  if (override) {
    const now = new Date();
    const isExpired = override.expiresAt && new Date(override.expiresAt) < now;
    
    if (!isExpired) {
      return {
        maxUsers: override.maxUsers ?? plan.maxUsers ?? 2,
        maxBranches: override.maxBranches ?? plan.maxBranches ?? 1,
        maxInvoicesPerMonth: override.maxInvoicesPerMonth ?? plan.maxInvoicesPerMonth ?? 50,
        maxDevices: override.maxDevices ?? plan.maxDevices ?? 1,
        maxStorageGb: override.maxStorageGb ?? plan.maxStorageGb ?? 1
      };
    }
  }
  
  // Return plan limits
  return {
    maxUsers: plan.maxUsers ?? 2,
    maxBranches: plan.maxBranches ?? 1,
    maxInvoicesPerMonth: plan.maxInvoicesPerMonth ?? 50,
    maxDevices: plan.maxDevices ?? 1,
    maxStorageGb: plan.maxStorageGb ?? 1
  };
}

/**
 * Check User Limit
 * Ensures tenant hasn't exceeded user limit
 */
export async function checkUserLimit(tenantId: number): Promise<void> {
  const db = getDb();
  const limits = await getSubscriptionLimits(tenantId);
  
  // Count active users
  const [result] = await db
    .select({ count: schema.users.id })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.tenantId, tenantId),
        eq(schema.users.isActive, true)
      )
    );
  
  const activeUserCount = Number(result?.count ?? 0);
  
  if (activeUserCount >= limits.maxUsers) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `User limit reached (${limits.maxUsers}). Please upgrade your plan to add more users.`
    });
  }
}

/**
 * Check Branch Limit
 * Ensures tenant hasn't exceeded branch limit
 */
export async function checkBranchLimit(tenantId: number): Promise<void> {
  const db = getDb();
  const limits = await getSubscriptionLimits(tenantId);
  
  // Count branches
  const branches = await db.query.branches.findMany({
    where: eq(schema.branches.tenantId, tenantId)
  });
  
  if (branches.length >= limits.maxBranches) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Branch limit reached (${limits.maxBranches}). Please upgrade your plan to add more branches.`
    });
  }
}

/**
 * Check Invoice Limit
 * Ensures tenant hasn't exceeded monthly invoice limit
 */
export async function checkInvoiceLimit(tenantId: number): Promise<void> {
  const db = getDb();
  const limits = await getSubscriptionLimits(tenantId);
  
  // Get current month start/end
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Count invoices this month
  const [result] = await db
    .select({ count: schema.invoices.id })
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.tenantId, tenantId),
        schema.invoices.invoiceDate >= monthStart.toISOString().split('T')[0],
        schema.invoices.invoiceDate <= monthEnd.toISOString().split('T')[0]
      )
    );
  
  const invoiceCount = Number(result?.count ?? 0);
  
  if (invoiceCount >= limits.maxInvoicesPerMonth) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Monthly invoice limit reached (${limits.maxInvoicesPerMonth}). Please upgrade your plan or wait until next month.`
    });
  }
}

/**
 * Check Subscription Status
 * Ensures subscription is active and not expired
 */
export async function checkSubscriptionStatus(tenantId: number): Promise<void> {
  const db = getDb();
  
  const tenant = await db.query.tenants.findFirst({
    where: eq(schema.tenants.id, tenantId)
  });
  
  if (!tenant) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tenant not found"
    });
  }
  
  // Check tenant status
  if (tenant.status === "suspended") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account has been suspended. Please contact support."
    });
  }
  
  if (tenant.status === "cancelled") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your subscription has been cancelled. Please renew to continue."
    });
  }
  
  // Check trial expiry
  if (tenant.status === "trial" && tenant.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(tenant.trialEndsAt);
    
    if (trialEnd < now) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your trial period has ended. Please subscribe to continue."
      });
    }
  }
  
  // Check subscription expiry
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.tenantId, tenantId)
  });
  
  if (subscription) {
    const now = new Date();
    
    if (subscription.status === "suspended") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your subscription has been suspended. Please contact support."
      });
    }
    
    if (subscription.status === "cancelled") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your subscription has been cancelled. Please renew to continue."
      });
    }
    
    if (subscription.status === "expired") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your subscription has expired. Please renew to continue."
      });
    }
    
    // Check grace period for past_due
    if (subscription.status === "past_due" && subscription.gracePeriodEndsAt) {
      const graceEnd = new Date(subscription.gracePeriodEndsAt);
      
      if (graceEnd < now) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Payment grace period has ended. Please update your payment method."
        });
      }
    }
  }
}

/**
 * Track Usage
 * Records API call usage for tracking
 */
export async function trackUsage(tenantId: number): Promise<void> {
  // This would typically increment a counter in Redis for real-time tracking
  // For now, we'll skip implementation as it requires Redis setup
  // TODO: Implement Redis-based rate limiting and usage tracking
}

/**
 * Combined Subscription Check
 * Runs all necessary checks before allowing operation
 */
export async function enforceSubscription(
  tenantId: number,
  options: {
    checkStatus?: boolean;
    checkModule?: string;
    checkUserLimit?: boolean;
    checkBranchLimit?: boolean;
    checkInvoiceLimit?: boolean;
  } = {}
): Promise<void> {
  const {
    checkStatus = true,
    checkModule,
    checkUserLimit = false,
    checkBranchLimit = false,
    checkInvoiceLimit = false
  } = options;
  
  // Always check subscription status
  if (checkStatus) {
    await checkSubscriptionStatus(tenantId);
  }
  
  // Check module access if specified
  if (checkModule) {
    await checkModuleAccess(tenantId, checkModule);
  }
  
  // Check limits if requested
  if (checkUserLimit) {
    await checkUserLimit(tenantId);
  }
  
  if (checkBranchLimit) {
    await checkBranchLimit(tenantId);
  }
  
  if (checkInvoiceLimit) {
    await checkInvoiceLimit(tenantId);
  }
  
  // Track usage
  await trackUsage(tenantId);
}
