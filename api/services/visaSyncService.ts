/**
 * Visa Sync Service
 * 
 * Handles hourly/scheduled synchronization of visa data from Qiwa API.
 * Includes error handling, tracking, and notification triggering.
 */

import { z } from "zod";
import { QiwaAuthState } from "./qiwaOAuth2Service";
import { QiwaAPIClient } from "./qiwaAPIClient";

export interface SyncConfig {
  enabled: boolean;
  intervalMinutes: number;
  batchSize: number;
  maxConcurrency: number;
}

export interface SyncResult {
  syncId: string;
  tenantId: number;
  startedAt: Date;
  completedAt?: Date;
  status: "in_progress" | "completed" | "failed" | "partial";
  visasSynced: number;
  visasFailed: number;
  quotaSynced: number;
  quotaFailed: number;
  sponsorshipsSynced: number;
  sponsorshipsFailed: number;
  error?: string;
  alerts: SyncAlert[];
}

export interface SyncAlert {
  type: "visa_expiry" | "visa_expired" | "quota_low" | "sponsorship_transfer";
  severity: "info" | "warning" | "critical";
  resourceId: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface SyncJob {
  jobId: string;
  tenantId: number;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: "scheduled" | "running" | "completed" | "failed";
  result?: SyncResult;
  error?: string;
}

/**
 * Visa Sync Service
 */
export class VisaSyncService {
  private apiClient: QiwaAPIClient;
  private syncJobs: Map<string, SyncJob> = new Map();

  constructor(apiClient: QiwaAPIClient) {
    this.apiClient = apiClient;
  }

  /**
   * Start sync job
   */
  private createSyncJob(tenantId: number): SyncJob {
    const jobId = `sync_${tenantId}_${Date.now()}`;
    const job: SyncJob = {
      jobId,
      tenantId,
      scheduledAt: new Date(),
      status: "scheduled",
    };
    this.syncJobs.set(jobId, job);
    return job;
  }

  /**
   * Create sync result
   */
  private createSyncResult(tenantId: number): SyncResult {
    return {
      syncId: `result_${tenantId}_${Date.now()}`,
      tenantId,
      startedAt: new Date(),
      status: "in_progress",
      visasSynced: 0,
      visasFailed: 0,
      quotaSynced: 0,
      quotaFailed: 0,
      sponsorshipsSynced: 0,
      sponsorshipsFailed: 0,
      alerts: [],
    };
  }

  /**
   * Perform full sync for tenant
   */
  async syncTenantData(
    tenantId: number,
    authState: QiwaAuthState
  ): Promise<SyncResult> {
    const result = this.createSyncResult(tenantId);
    const job = this.createSyncJob(tenantId);
    job.startedAt = new Date();
    job.status = "running";

    try {
      // Sync visas
      const visaResult = await this.syncVisas(authState);
      result.visasSynced = visaResult.synced;
      result.visasFailed = visaResult.failed;
      result.alerts.push(...visaResult.alerts);

      // Sync quotas
      const quotaResult = await this.syncQuotas(authState);
      result.quotaSynced = quotaResult.synced;
      result.quotaFailed = quotaResult.failed;
      result.alerts.push(...quotaResult.alerts);

      // Sync sponsorships
      const sponsorshipResult = await this.syncSponsorships(authState);
      result.sponsorshipsSynced = sponsorshipResult.synced;
      result.sponsorshipsFailed = sponsorshipResult.failed;
      result.alerts.push(...sponsorshipResult.alerts);

      result.status = result.visasFailed > 0 || result.quotaFailed > 0 || result.sponsorshipsFailed > 0
        ? "partial"
        : "completed";
      result.completedAt = new Date();

      job.status = "completed";
      job.result = result;
    } catch (error) {
      result.status = "failed";
      result.error = error instanceof Error ? error.message : "Unknown error";
      result.completedAt = new Date();

      job.status = "failed";
      job.error = result.error;
    }

    job.completedAt = new Date();
    return result;
  }

  /**
   * Sync visa data
   */
  private async syncVisas(authState: QiwaAuthState): Promise<{
    synced: number;
    failed: number;
    alerts: SyncAlert[];
  }> {
    const alerts: SyncAlert[] = [];
    let synced = 0;
    let failed = 0;

    try {
      const response = await this.apiClient.listVisas(authState, {
        limit: 1000,
        offset: 0,
      });

      if (!response.success || !response.data) {
        return { synced: 0, failed: 1, alerts };
      }

      const { visas } = response.data as any;

      for (const visa of visas) {
        try {
          // Calculate days until expiry
          const now = new Date();
          const expiryDate = new Date(visa.expiryDate);
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Create alerts based on expiry
          if (daysUntilExpiry < 0) {
            alerts.push({
              type: "visa_expired",
              severity: "critical",
              resourceId: visa.visaNumber,
              message: `Visa ${visa.visaNumber} has expired`,
              metadata: {
                visaNumber: visa.visaNumber,
                workerName: visa.workerName,
                expiryDate: visa.expiryDate,
              },
            });
          } else if (daysUntilExpiry <= 7) {
            alerts.push({
              type: "visa_expiry",
              severity: "critical",
              resourceId: visa.visaNumber,
              message: `Visa ${visa.visaNumber} expires in ${daysUntilExpiry} days`,
              metadata: {
                visaNumber: visa.visaNumber,
                workerName: visa.workerName,
                daysUntilExpiry,
                expiryDate: visa.expiryDate,
              },
            });
          } else if (daysUntilExpiry <= 30) {
            alerts.push({
              type: "visa_expiry",
              severity: "warning",
              resourceId: visa.visaNumber,
              message: `Visa ${visa.visaNumber} expires in ${daysUntilExpiry} days`,
              metadata: {
                visaNumber: visa.visaNumber,
                workerName: visa.workerName,
                daysUntilExpiry,
                expiryDate: visa.expiryDate,
              },
            });
          }

          synced++;
        } catch (error) {
          failed++;
          console.error(`Failed to process visa ${visa.visaNumber}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to sync visas:", error);
      failed++;
    }

    return { synced, failed, alerts };
  }

  /**
   * Sync quota data
   */
  private async syncQuotas(authState: QiwaAuthState): Promise<{
    synced: number;
    failed: number;
    alerts: SyncAlert[];
  }> {
    const alerts: SyncAlert[] = [];
    let synced = 0;
    let failed = 0;

    try {
      const response = await this.apiClient.getQuota(authState);

      if (!response.success || !response.data) {
        return { synced: 0, failed: 1, alerts };
      }

      const quotas = Array.isArray(response.data) ? response.data : [response.data];

      for (const quota of quotas) {
        try {
          // Alert if quota usage is high
          if (quota.percentageUsed >= 90) {
            alerts.push({
              type: "quota_low",
              severity: "critical",
              resourceId: quota.skillCategory,
              message: `Quota for ${quota.skillCategory} is ${quota.percentageUsed}% used`,
              metadata: {
                skillCategory: quota.skillCategory,
                usedQuota: quota.usedQuota,
                totalQuota: quota.totalQuota,
                availableQuota: quota.availableQuota,
                percentageUsed: quota.percentageUsed,
              },
            });
          } else if (quota.percentageUsed >= 75) {
            alerts.push({
              type: "quota_low",
              severity: "warning",
              resourceId: quota.skillCategory,
              message: `Quota for ${quota.skillCategory} is ${quota.percentageUsed}% used`,
              metadata: {
                skillCategory: quota.skillCategory,
                usedQuota: quota.usedQuota,
                totalQuota: quota.totalQuota,
                availableQuota: quota.availableQuota,
                percentageUsed: quota.percentageUsed,
              },
            });
          }

          synced++;
        } catch (error) {
          failed++;
          console.error(`Failed to process quota ${quota.skillCategory}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to sync quotas:", error);
      failed++;
    }

    return { synced, failed, alerts };
  }

  /**
   * Sync sponsorship data
   */
  private async syncSponsorships(authState: QiwaAuthState): Promise<{
    synced: number;
    failed: number;
    alerts: SyncAlert[];
  }> {
    const alerts: SyncAlert[] = [];
    let synced = 0;
    let failed = 0;

    try {
      const response = await this.apiClient.listSponsorships(authState, {
        limit: 1000,
        offset: 0,
      });

      if (!response.success || !response.data) {
        return { synced: 0, failed: 1, alerts };
      }

      const { sponsorships } = response.data as any;

      for (const sponsorship of sponsorships) {
        try {
          // Alert if transfer is pending
          if (sponsorship.status === "transfer_pending") {
            alerts.push({
              type: "sponsorship_transfer",
              severity: "info",
              resourceId: sponsorship.sponsorshipId,
              message: `Sponsorship transfer pending for worker ${sponsorship.workerName}`,
              metadata: {
                sponsorshipId: sponsorship.sponsorshipId,
                workerId: sponsorship.workerId,
                workerName: sponsorship.workerName,
                currentSponsor: sponsorship.currentSponsor,
                newSponsor: sponsorship.newSponsor,
              },
            });
          }

          synced++;
        } catch (error) {
          failed++;
          console.error(`Failed to process sponsorship ${sponsorship.sponsorshipId}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to sync sponsorships:", error);
      failed++;
    }

    return { synced, failed, alerts };
  }

  /**
   * Get sync job status
   */
  getSyncJobStatus(jobId: string): SyncJob | undefined {
    return this.syncJobs.get(jobId);
  }

  /**
   * Get all sync jobs for tenant
   */
  getTenantSyncJobs(tenantId: number): SyncJob[] {
    return Array.from(this.syncJobs.values()).filter((job) => job.tenantId === tenantId);
  }

  /**
   * Clean up old sync jobs (older than 24 hours)
   */
  cleanupOldJobs(maxAgeHours: number = 24): number {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    let removed = 0;

    for (const [jobId, job] of this.syncJobs.entries()) {
      const age = now.getTime() - job.scheduledAt.getTime();
      if (age > maxAge) {
        this.syncJobs.delete(jobId);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Schema for sync result
 */
export const SyncResultSchema = z.object({
  syncId: z.string(),
  tenantId: z.number(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  status: z.enum(["in_progress", "completed", "failed", "partial"]),
  visasSynced: z.number(),
  visasFailed: z.number(),
  quotaSynced: z.number(),
  quotaFailed: z.number(),
  sponsorshipsSynced: z.number(),
  sponsorshipsFailed: z.number(),
  error: z.string().optional(),
  alerts: z.array(
    z.object({
      type: z.enum(["visa_expiry", "visa_expired", "quota_low", "sponsorship_transfer"]),
      severity: z.enum(["info", "warning", "critical"]),
      resourceId: z.string(),
      message: z.string(),
      metadata: z.record(z.any()).optional(),
    })
  ),
});

/**
 * Schema for sync config
 */
export const SyncConfigSchema = z.object({
  enabled: z.boolean(),
  intervalMinutes: z.number().min(15).max(1440),
  batchSize: z.number().min(1).max(1000),
  maxConcurrency: z.number().min(1).max(10),
});
