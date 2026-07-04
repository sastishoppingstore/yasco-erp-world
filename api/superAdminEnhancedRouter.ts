import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { getSubscriptionLimits } from "./lib/subscriptionMiddleware";
import * as schema from "@db/schema";
import { and, eq, desc, sql, gte, lte } from "drizzle-orm";

/**
 * Enhanced Super Admin Router
 * Comprehensive tenant management, module control, billing, and monitoring
 */

export const superAdminEnhancedRouter = createRouter({
  
  // =====================================================
  // MODULE MANAGEMENT
  // =====================================================
  
  modules: {
    /**
     * Get all modules for a tenant
     */
    list: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        
        const modules = await db.query.tenantModules.findMany({
          where: eq(schema.tenantModules.tenantId, input.tenantId)
        });
        
        // Define all available modules
        const allModules = [
          { name: 'accounting', label: 'Accounting & Finance', category: 'core' },
          { name: 'inventory', label: 'Inventory Management', category: 'core' },
          { name: 'sales', label: 'Sales & Invoicing', category: 'core' },
          { name: 'purchase', label: 'Purchase & Procurement', category: 'core' },
          { name: 'crm', label: 'CRM', category: 'sales' },
          { name: 'reports', label: 'Reports & Analytics', category: 'core' },
          { name: 'pos', label: 'Point of Sale', category: 'sales' },
          { name: 'hrm', label: 'HR & Payroll', category: 'operations' },
          { name: 'projects', label: 'Project Management', category: 'operations' },
          { name: 'manufacturing', label: 'Manufacturing', category: 'operations' },
          { name: 'assets', label: 'Asset Management', category: 'operations' },
          { name: 'construction', label: 'Construction', category: 'industry' },
          { name: 'workshop', label: 'Workshop/Garage', category: 'industry' },
          { name: 'healthcare', label: 'Hospital/Clinic', category: 'industry' },
          { name: 'education', label: 'Education', category: 'industry' },
          { name: 'hotel', label: 'Hotel Management', category: 'industry' },
          { name: 'transport', label: 'Transport & Fleet', category: 'industry' },
          { name: 'aviation', label: 'Aviation', category: 'industry' },
        ];
        
        const moduleMap = new Map(modules.map(m => [m.moduleName, m]));
        
        return allModules.map(mod => ({
          ...mod,
          isEnabled: moduleMap.get(mod.name)?.isEnabled ?? false,
          enabledAt: moduleMap.get(mod.name)?.enabledAt,
          enabledBy: moduleMap.get(mod.name)?.enabledBy,
        }));
      }),
    
    /**
     * Enable a module for a tenant
     */
    enable: adminQuery
      .input(z.object({
        tenantId: z.number(),
        moduleName: z.string(),
        notes: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        
        // Check if module record exists
        const existing = await db.query.tenantModules.findFirst({
          where: and(
            eq(schema.tenantModules.tenantId, input.tenantId),
            eq(schema.tenantModules.moduleName, input.moduleName)
          )
        });
        
        if (existing) {
          // Update existing
          await db.update(schema.tenantModules)
            .set({
              isEnabled: true,
              enabledAt: new Date(),
              enabledBy: ctx.user.id,
              notes: input.notes
            })
            .where(
              and(
                eq(schema.tenantModules.tenantId, input.tenantId),
                eq(schema.tenantModules.moduleName, input.moduleName)
              )
            );
        } else {
          // Insert new
          await db.insert(schema.tenantModules).values({
            tenantId: input.tenantId,
            moduleName: input.moduleName,
            isEnabled: true,
            enabledAt: new Date(),
            enabledBy: ctx.user.id,
            notes: input.notes
          });
        }
        
        // Audit log
        await db.insert(schema.auditLogs).values({
          tenantId: input.tenantId,
          userId: ctx.user.id,
          action: 'module_enabled',
          entityType: 'tenant_module',
          newValues: { moduleName: input.moduleName }
        });
        
        return { success: true };
      }),
    
    /**
     * Disable a module for a tenant
     */
    disable: adminQuery
      .input(z.object({
        tenantId: z.number(),
        moduleName: z.string(),
        notes: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        
        await db.update(schema.tenantModules)
          .set({
            isEnabled: false,
            disabledAt: new Date(),
            notes: input.notes
          })
          .where(
            and(
              eq(schema.tenantModules.tenantId, input.tenantId),
              eq(schema.tenantModules.moduleName, input.moduleName)
            )
          );
        
        // Audit log
        await db.insert(schema.auditLogs).values({
          tenantId: input.tenantId,
          userId: ctx.user.id,
          action: 'module_disabled',
          entityType: 'tenant_module',
          newValues: { moduleName: input.moduleName, notes: input.notes }
        });
        
        return { success: true };
      }),
  },
  
  // =====================================================
  // USAGE TRACKING & LIMITS
  // =====================================================
  
  usage: {
    /**
     * Get current usage for a tenant
     */
    current: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        
        // Get limits
        const limits = await getSubscriptionLimits(input.tenantId);
        
        // Count users
        const [userResult] = await db
          .select({
            total: sql<number>`count(*)`,
            active: sql<number>`sum(case when is_active = 1 then 1 else 0 end)`
          })
          .from(schema.users)
          .where(eq(schema.users.tenantId, input.tenantId));
        
        // Count branches
        const branches = await db.query.branches.findMany({
          where: eq(schema.branches.tenantId, input.tenantId)
        });
        
        // Count invoices this month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const [invoiceResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.invoices)
          .where(
            and(
              eq(schema.invoices.tenantId, input.tenantId),
              gte(schema.invoices.createdAt, monthStart),
              lte(schema.invoices.createdAt, monthEnd)
            )
          );
        
        // TODO: Count devices (needs device table)
        // TODO: Calculate storage (needs file tracking)
        
        const usage = {
          users: {
            current: Number(userResult?.total ?? 0),
            active: Number(userResult?.active ?? 0),
            limit: limits.maxUsers,
            percentage: Math.round((Number(userResult?.total ?? 0) / limits.maxUsers) * 100)
          },
          branches: {
            current: branches.length,
            limit: limits.maxBranches,
            percentage: Math.round((branches.length / limits.maxBranches) * 100)
          },
          invoices: {
            current: Number(invoiceResult?.count ?? 0),
            limit: limits.maxInvoicesPerMonth,
            percentage: Math.round((Number(invoiceResult?.count ?? 0) / limits.maxInvoicesPerMonth) * 100)
          },
          devices: {
            current: 0, // TODO
            limit: limits.maxDevices,
            percentage: 0
          },
          storage: {
            current: 0, // TODO
            limit: limits.maxStorageGb,
            percentage: 0
          }
        };
        
        return { usage, limits };
      }),
    
    /**
     * Get usage history for a tenant
     */
    history: adminQuery
      .input(z.object({
        tenantId: z.number(),
        months: z.number().default(6)
      }))
      .query(async ({ input }) => {
        const db = getDb();
        
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - input.months, 1);
        
        const usage = await db.query.tenantUsage.findMany({
          where: and(
            eq(schema.tenantUsage.tenantId, input.tenantId),
            gte(schema.tenantUsage.periodStart, startDate.toISOString().split('T')[0])
          ),
          orderBy: [desc(schema.tenantUsage.periodStart)]
        });
        
        return usage;
      }),
  },
  
  // =====================================================
  // SUBSCRIPTION PLANS
  // =====================================================
  
  plans: {
    /**
     * List all subscription plans
     */
    list: adminQuery.query(async () => {
      const db = getDb();
      
      const plans = await db.query.subscriptionPlans.findMany({
        orderBy: [schema.subscriptionPlans.sortOrder]
      });
      
      return plans;
    }),
    
    /**
     * Create a new subscription plan
     */
    create: adminQuery
      .input(z.object({
        name: z.string(),
        displayName: z.string(),
        description: z.string().optional(),
        price: z.number(),
        billingCycle: z.enum(['monthly', 'yearly', 'one_time']),
        maxUsers: z.number(),
        maxBranches: z.number(),
        maxInvoicesPerMonth: z.number(),
        maxDevices: z.number(),
        maxStorageGb: z.number(),
        modulesIncluded: z.array(z.string()),
        features: z.record(z.any()).optional(),
        isActive: z.boolean().default(true),
        isPublic: z.boolean().default(true),
        sortOrder: z.number().default(0)
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        
        const [result] = await db.insert(schema.subscriptionPlans).values({
          ...input,
          modulesIncluded: JSON.stringify(input.modulesIncluded),
          features: input.features ? JSON.stringify(input.features) : undefined
        });
        
        return { id: result.insertId, success: true };
      }),
    
    /**
     * Update subscription plan
     */
    update: adminQuery
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        maxUsers: z.number().optional(),
        maxBranches: z.number().optional(),
        maxInvoicesPerMonth: z.number().optional(),
        maxDevices: z.number().optional(),
        maxStorageGb: z.number().optional(),
        modulesIncluded: z.array(z.string()).optional(),
        features: z.record(z.any()).optional(),
        isActive: z.boolean().optional(),
        isPublic: z.boolean().optional()
      }))
      .mutation(async ({ input }) => {
        const db = getDb();
        
        const { id, ...updateData } = input;
        
        await db.update(schema.subscriptionPlans)
          .set({
            ...updateData,
            modulesIncluded: updateData.modulesIncluded ? JSON.stringify(updateData.modulesIncluded) : undefined,
            features: updateData.features ? JSON.stringify(updateData.features) : undefined
          })
          .where(eq(schema.subscriptionPlans.id, id));
        
        return { success: true };
      }),
  },
  
  // =====================================================
  // TENANT HEALTH MONITORING
  // =====================================================
  
  health: {
    /**
     * Get health dashboard for all tenants
     */
    dashboard: adminQuery.query(async () => {
      const db = getDb();
      
      // Get all tenants with stats
      const tenants = await db.select().from(schema.tenants).limit(100);
      
      const healthData = await Promise.all(
        tenants.map(async (tenant) => {
          // Count failed ZATCA submissions in last 24h
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          const [failedZatca] = await db
            .select({ count: sql<number>`count(*)` })
            .from(schema.zatcaApiLogs)
            .where(
              and(
                eq(schema.zatcaApiLogs.tenantId, tenant.id),
                eq(schema.zatcaApiLogs.status, 'failed'),
                gte(schema.zatcaApiLogs.createdAt, oneDayAgo)
              )
            );
          
          // Get subscription
          const subscription = await db.query.subscriptions.findFirst({
            where: eq(schema.subscriptions.tenantId, tenant.id)
          });
          
          // Calculate health score
          let score = 100;
          if (tenant.status !== 'active' && tenant.status !== 'trial') score -= 50;
          if (subscription?.status === 'past_due') score -= 20;
          if (Number(failedZatca?.count ?? 0) > 10) score -= 15;
          
          return {
            tenantId: tenant.id,
            name: tenant.name,
            status: tenant.status,
            plan: tenant.plan,
            subscriptionStatus: subscription?.status,
            healthScore: Math.max(0, score),
            failedZatcaCount: Number(failedZatca?.count ?? 0),
            needsAttention: score < 70
          };
        })
      );
      
      return healthData.sort((a, b) => a.healthScore - b.healthScore);
    }),
    
    /**
     * Get detailed health for one tenant
     */
    detail: adminQuery
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        const db = getDb();
        
        const tenant = await db.query.tenants.findFirst({
          where: eq(schema.tenants.id, input.tenantId)
        });
        
        if (!tenant) {
          throw new Error('Tenant not found');
        }
        
        // Database size (approximate)
        const [dbSize] = await db.execute(
          sql`SELECT 
            SUM(data_length + index_length) / 1024 / 1024 as size_mb 
          FROM information_schema.tables 
          WHERE table_schema = DATABASE()`
        );
        
        // Failed invoices
        const [failedInvoices] = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.zatcaInvoiceStatus)
          .where(
            and(
              eq(schema.zatcaInvoiceStatus.tenantId, input.tenantId),
              sql`status IN ('failed', 'rejected')`
            )
          );
        
        // Last activity
        const [lastActivity] = await db
          .select({ lastLogin: sql<Date>`MAX(last_login_at)` })
          .from(schema.users)
          .where(eq(schema.users.tenantId, input.tenantId));
        
        return {
          tenant,
          metrics: {
            dbSizeMb: Number(dbSize?.size_mb ?? 0),
            failedInvoices: Number(failedInvoices?.count ?? 0),
            lastActivity: lastActivity?.lastLogin
          }
        };
      }),
  },
  
  // =====================================================
  // IMPERSONATION
  // =====================================================
  
  impersonate: {
    /**
     * Start impersonation session
     */
    start: adminQuery
      .input(z.object({
        tenantId: z.number(),
        targetUserId: z.number().optional(),
        reason: z.string(),
        approvalTicket: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        
        // Create impersonation log
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        await db.insert(schema.impersonationLogs).values({
          adminUserId: ctx.user.id,
          adminEmail: ctx.user.email,
          tenantId: input.tenantId,
          targetUserId: input.targetUserId,
          reason: input.reason,
          approvalTicket: input.approvalTicket,
          sessionToken,
          startedAt: new Date(),
          ipAddress: ctx.req.headers.get('x-forwarded-for') ?? ctx.req.headers.get('cf-connecting-ip') ?? 'unknown',
          userAgent: ctx.req.headers.get('user-agent') ?? 'unknown'
        });
        
        return { sessionToken, success: true };
      }),
    
    /**
     * End impersonation session
     */
    end: adminQuery
      .input(z.object({ sessionToken: z.string() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        
        const log = await db.query.impersonationLogs.findFirst({
          where: eq(schema.impersonationLogs.sessionToken, input.sessionToken)
        });
        
        if (!log) {
          throw new Error('Session not found');
        }
        
        const endedAt = new Date();
        const durationSeconds = Math.floor((endedAt.getTime() - new Date(log.startedAt).getTime()) / 1000);
        
        await db.update(schema.impersonationLogs)
          .set({
            endedAt,
            durationSeconds
          })
          .where(eq(schema.impersonationLogs.sessionToken, input.sessionToken));
        
        return { success: true, durationSeconds };
      }),
  },
});
