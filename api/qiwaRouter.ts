import { z } from "zod";
import { createRouter, authedQuery, authedMutation, publicMutation } from "./middleware";
import { getDb } from "./queries/connection";
import {
  qiwaIntegration,
  visaQuotaTracking,
  workerVisaStatus,
  visaExpiryAlerts,
} from "@db/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * QIWA INTEGRATION ROUTER - Phase 1 Sprint 4
 * Saudi Labor Ministry API Integration
 * Handles OAuth2, visa quotas, worker status
 */

// Mock Qiwa API response (in production, call real Qiwa API)
const mockQiwaApi = {
  async getAuthorizationUrl(clientId: string, redirectUri: string) {
    const state = nanoid(32);
    return {
      url: `https://api.qiwa.gov.sa/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`,
      state,
    };
  },

  async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string
  ) {
    // In production: Call Qiwa API
    return {
      access_token: `access_${nanoid(32)}`,
      refresh_token: `refresh_${nanoid(32)}`,
      expires_in: 3600,
      token_type: "Bearer",
    };
  },

  async getVisaQuotas(accessToken: string, orgId: string) {
    // Mock response
    return {
      quotas: [
        {
          skill_category: "Engineers",
          total_quota: 50,
          used_quota: 35,
          available_quota: 15,
        },
        {
          skill_category: "Laborers",
          total_quota: 200,
          used_quota: 150,
          available_quota: 50,
        },
        {
          skill_category: "Supervisors",
          total_quota: 20,
          used_quota: 18,
          available_quota: 2,
        },
      ],
    };
  },

  async getWorkerVisaStatus(accessToken: string, workerId: string) {
    // Mock response
    return {
      visa_number: "VISA-" + nanoid(8),
      visa_expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      sponsorship_status: "active",
      verified: true,
    };
  },
};

export const qiwaRouter = createRouter({
  /**
   * Get Qiwa OAuth Authorization URL
   */
  getAuthorizationUrl: publicMutation
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ input }) => {
      const clientId = process.env.QIWA_CLIENT_ID || "demo_client";
      const redirectUri = process.env.QIWA_REDIRECT_URI || "http://localhost:3000/auth/qiwa/callback";

      const { url, state } = await mockQiwaApi.getAuthorizationUrl(
        clientId,
        redirectUri
      );

      return {
        success: true,
        authUrl: url,
        state,
      };
    }),

  /**
   * Handle Qiwa OAuth Callback
   */
  handleOAuthCallback: authedMutation
    .input(
      z.object({
        code: z.string(),
        state: z.string(),
        orgId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        const clientId = process.env.QIWA_CLIENT_ID || "demo_client";
        const clientSecret = process.env.QIWA_CLIENT_SECRET || "demo_secret";

        // Exchange code for token
        const tokenResponse = await mockQiwaApi.exchangeCodeForToken(
          input.code,
          clientId,
          clientSecret
        );

        const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

        // Insert or update Qiwa integration
        await db
          .insert(qiwaIntegration)
          .values({
            tenantId: ctx.user.tenantId!,
            qiwaOrgId: input.orgId,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            tokenExpiresAt: expiresAt,
            lastSyncAt: new Date(),
            syncStatus: "pending",
            autoSyncEnabled: true,
            syncIntervalMinutes: 60,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        return {
          success: true,
          message: "Qiwa integration completed",
          orgId: input.orgId,
        };
      } catch (error) {
        throw new Error(`OAuth callback failed: ${error}`);
      }
    }),

  /**
   * Sync Visa Quotas from Qiwa
   */
  syncVisaQuotas: authedMutation
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        // Get Qiwa integration
        const [qiwaConfig] = await db
          .select()
          .from(qiwaIntegration)
          .where(eq(qiwaIntegration.tenantId, ctx.user.tenantId!));

        if (!qiwaConfig) {
          throw new Error("Qiwa not configured");
        }

        // Fetch quotas from Qiwa API
        const quotasData = await mockQiwaApi.getVisaQuotas(
          qiwaConfig.accessToken,
          qiwaConfig.qiwaOrgId
        );

        // Upsert quota tracking for project
        for (const quota of quotasData.quotas) {
          await db
            .insert(visaQuotaTracking)
            .values({
              tenantId: ctx.user.tenantId!,
              projectId: input.projectId,
              skillCategory: quota.skill_category,
              totalQuota: quota.total_quota,
              usedQuota: quota.used_quota,
              availableQuota: quota.available_quota,
              qiwaLastUpdatedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
        }

        // Update sync status
        await db
          .update(qiwaIntegration)
          .set({
            lastSyncAt: new Date(),
            syncStatus: "success",
            syncError: null,
            updatedAt: new Date(),
          })
          .where(eq(qiwaIntegration.tenantId, ctx.user.tenantId!));

        return {
          success: true,
          quotasSynced: quotasData.quotas.length,
          message: "Visa quotas synced successfully",
        };
      } catch (error) {
        await db
          .update(qiwaIntegration)
          .set({
            syncStatus: "failed",
            syncError: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(qiwaIntegration.tenantId, ctx.user.tenantId!));

        throw new Error(`Quota sync failed: ${error}`);
      }
    }),

  /**
   * Get Visa Quotas
   */
  getVisaQuotas: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const quotas = await db
        .select()
        .from(visaQuotaTracking)
        .where(
          and(
            eq(visaQuotaTracking.projectId, input.projectId),
            eq(visaQuotaTracking.tenantId, ctx.user.tenantId!)
          )
        );

      return {
        success: true,
        quotas,
        summary: {
          totalQuotas: quotas.reduce((sum, q) => sum + q.totalQuota, 0),
          usedQuotas: quotas.reduce((sum, q) => sum + q.usedQuota, 0),
          availableQuotas: quotas.reduce((sum, q) => sum + q.availableQuota, 0),
        },
      };
    }),

  /**
   * Get Worker Visa Status
   */
  getWorkerVisaStatus: authedQuery
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const [visaStatus] = await db
        .select()
        .from(workerVisaStatus)
        .where(
          and(
            eq(workerVisaStatus.employeeId, input.employeeId),
            eq(workerVisaStatus.tenantId, ctx.user.tenantId!)
          )
        );

      if (!visaStatus) {
        return { success: false, message: "Visa status not found" };
      }

      const expiryDate = new Date(visaStatus.visaExpiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        success: true,
        visaStatus,
        daysUntilExpiry,
        expiryStatus:
          daysUntilExpiry <= 0
            ? "expired"
            : daysUntilExpiry <= 7
            ? "critical"
            : daysUntilExpiry <= 30
            ? "warning"
            : "valid",
      };
    }),

  /**
   * Add/Update Worker Visa Status
   */
  updateWorkerVisaStatus: authedMutation
    .input(
      z.object({
        employeeId: z.number(),
        projectId: z.number(),
        visaNumber: z.string(),
        visaExpiryDate: z.date(),
        sponsorshipStatus: z
          .enum(["active", "transferred", "expired", "pending"])
          .default("active"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        const [{ id }] = await db
          .insert(workerVisaStatus)
          .values({
            tenantId: ctx.user.tenantId!,
            employeeId: input.employeeId,
            projectId: input.projectId,
            visaNumber: input.visaNumber,
            visaExpiryDate: input.visaExpiryDate,
            sponsorshipStatus: input.sponsorshipStatus,
            qiwaVerified: false,
            lastVerifiedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .$returningId();

        // Check if expiry alert needed
        const daysUntilExpiry = Math.ceil(
          (input.visaExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          const alertType =
            daysUntilExpiry <= 7
              ? "7_days"
              : daysUntilExpiry <= 14
              ? "14_days"
              : "30_days";

          await db.insert(visaExpiryAlerts).values({
            tenantId: ctx.user.tenantId!,
            workerVisaStatusId: id,
            employeeId: input.employeeId,
            projectId: input.projectId,
            daysUntilExpiry,
            alertType: alertType as any,
            isAcknowledged: false,
            createdAt: new Date(),
          });
        }

        return {
          success: true,
          visaStatusId: id,
          message: "Visa status updated",
        };
      } catch (error) {
        throw new Error(`Failed to update visa status: ${error}`);
      }
    }),

  /**
   * Get Visa Expiry Alerts
   */
  getVisaExpiryAlerts: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const alerts = await db
        .select()
        .from(visaExpiryAlerts)
        .where(
          and(
            eq(visaExpiryAlerts.projectId, input.projectId),
            eq(visaExpiryAlerts.tenantId, ctx.user.tenantId!),
            eq(visaExpiryAlerts.isAcknowledged, false)
          )
        )
        .orderBy(visaExpiryAlerts.daysUntilExpiry);

      return {
        success: true,
        alerts,
        criticalCount: alerts.filter((a) => a.daysUntilExpiry <= 7).length,
        warningCount: alerts.filter(
          (a) => a.daysUntilExpiry > 7 && a.daysUntilExpiry <= 30
        ).length,
      };
    }),

  /**
   * Acknowledge Visa Expiry Alert
   */
  acknowledgeVisaAlert: authedMutation
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        await db
          .update(visaExpiryAlerts)
          .set({
            isAcknowledged: true,
            acknowledgedAt: new Date(),
            acknowledgedBy: ctx.user.id!,
          })
          .where(
            and(
              eq(visaExpiryAlerts.id, input.alertId),
              eq(visaExpiryAlerts.tenantId, ctx.user.tenantId!)
            )
          );

        return {
          success: true,
          message: "Alert acknowledged",
        };
      } catch (error) {
        throw new Error(`Failed to acknowledge alert: ${error}`);
      }
    }),

  /**
   * Check Qiwa Compliance Status
   */
  checkComplianceStatus: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const quotas = await db
        .select()
        .from(visaQuotaTracking)
        .where(
          and(
            eq(visaQuotaTracking.projectId, input.projectId),
            eq(visaQuotaTracking.tenantId, ctx.user.tenantId!)
          )
        );

      const visaStatuses = await db
        .select()
        .from(workerVisaStatus)
        .where(
          and(
            eq(workerVisaStatus.projectId, input.projectId),
            eq(workerVisaStatus.tenantId, ctx.user.tenantId!)
          )
        );

      const expiredVisa = visaStatuses.filter(
        (v) => new Date(v.visaExpiryDate) < new Date()
      ).length;
      const expiringVisa = visaStatuses.filter((v) => {
        const days = Math.ceil(
          (new Date(v.visaExpiryDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return days > 0 && days <= 30;
      }).length;

      const complianceStatus =
        expiredVisa > 0
          ? "non_compliant"
          : expiringVisa > 0
          ? "warning"
          : "compliant";

      return {
        success: true,
        status: complianceStatus,
        quotaUtilization: quotas,
        expiredVisaCount: expiredVisa,
        expiringVisaCount: expiringVisa,
        totalWorkers: visaStatuses.length,
      };
    }),
});
