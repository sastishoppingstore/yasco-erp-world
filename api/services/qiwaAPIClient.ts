/**
 * Qiwa API Integration Service
 * 
 * Handles all API calls to Qiwa for visa and labor management.
 * Includes error handling, retry logic, and response parsing.
 */

import { z } from "zod";
import { QiwaAuthState } from "./qiwaOAuth2Service";

export interface QiwaAPIConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  retried: number;
  timestamp: Date;
}

/**
 * Qiwa Visa Status Types
 */
export type VisaStatus = "active" | "expired" | "suspended" | "transferred" | "pending";

export interface VisaData {
  visaNumber: string;
  workerName: string;
  nationality: string;
  passportNumber: string;
  issuedDate: Date;
  expiryDate: Date;
  status: VisaStatus;
  sponsorshipStatus: string;
  jobTitle: string;
  salary: number;
}

/**
 * Qiwa Quota Information
 */
export interface QuotaData {
  skillCategory: string;
  totalQuota: number;
  usedQuota: number;
  availableQuota: number;
  percentageUsed: number;
  lastUpdated: Date;
}

/**
 * Qiwa Worker Information
 */
export interface WorkerData {
  workerId: string;
  name: string;
  nationality: string;
  position: string;
  visaStatus: VisaStatus;
  visaExpiryDate: Date;
  sponsorshipStatus: string;
  joinDate: Date;
}

/**
 * Qiwa Sponsorship Information
 */
export interface SponsorshipData {
  sponsorshipId: string;
  workerId: string;
  workerName: string;
  status: string;
  transferredDate?: Date;
  currentSponsor: string;
  newSponsor?: string;
  expiryDate: Date;
}

/**
 * Retry policy with exponential backoff
 */
async function executeWithRetry<T>(
  fn: () => Promise<Response>,
  config: RetryConfig = { maxRetries: 3, delay: 1000, backoffMultiplier: 2 }
): Promise<{ response: Response; retriedCount: number }> {
  let lastError: Error | null = null;
  let retriedCount = 0;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fn();

      // Retry on 5xx errors or rate limit (429)
      if (response.status >= 500 || response.status === 429) {
        if (attempt < config.maxRetries) {
          const delay = config.delay * Math.pow(config.backoffMultiplier, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retriedCount = attempt + 1;
          continue;
        }
      }

      return { response, retriedCount };
    } catch (error) {
      lastError = error as Error;
      if (attempt < config.maxRetries) {
        const delay = config.delay * Math.pow(config.backoffMultiplier, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retriedCount = attempt + 1;
        continue;
      }
    }
  }

  throw lastError || new Error("Failed after all retries");
}

/**
 * Qiwa API Client
 */
export class QiwaAPIClient {
  private baseUrl: string;
  private timeout: number;
  private retryConfig: RetryConfig;

  constructor(config: QiwaAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retryConfig = {
      maxRetries: config.maxRetries,
      delay: config.retryDelay,
      backoffMultiplier: 2,
    };
  }

  /**
   * Make authenticated API request with retry
   */
  private async makeRequest<T>(
    endpoint: string,
    authState: QiwaAuthState,
    options: RequestInit & { data?: Record<string, any> } = {}
  ): Promise<APIResponse<T>> {
    const startTime = new Date();
    let retriedCount = 0;

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const body = options.data ? JSON.stringify(options.data) : undefined;

      const { response, retriedCount: retries } = await executeWithRetry(
        () =>
          fetch(url, {
            ...options,
            headers: {
              "Authorization": `Bearer ${authState.accessToken}`,
              "Content-Type": "application/json",
              ...options.headers,
            },
            body,
          }),
        this.retryConfig
      );

      retriedCount = retries;

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: error.code || String(response.status),
            message: error.message || response.statusText,
            details: error,
          },
          retried: retriedCount,
          timestamp: startTime,
        };
      }

      const data: T = await response.json();
      return {
        success: true,
        data,
        retried: retriedCount,
        timestamp: startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        retried: retriedCount,
        timestamp: startTime,
      };
    }
  }

  /**
   * Get visa information for a worker
   */
  async getWorkerVisa(authState: QiwaAuthState, visaNumber: string): Promise<APIResponse<VisaData>> {
    return this.makeRequest<VisaData>(`/api/v1/visa/${visaNumber}`, authState, {
      method: "GET",
    });
  }

  /**
   * List all visas for organization
   */
  async listVisas(
    authState: QiwaAuthState,
    filters?: {
      status?: VisaStatus;
      expiryDateFrom?: Date;
      expiryDateTo?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<APIResponse<{ visas: VisaData[]; total: number }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.expiryDateFrom) params.append("expiryDateFrom", filters.expiryDateFrom.toISOString());
    if (filters?.expiryDateTo) params.append("expiryDateTo", filters.expiryDateTo.toISOString());
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const endpoint = `/api/v1/visa?${params.toString()}`;
    return this.makeRequest<{ visas: VisaData[]; total: number }>(endpoint, authState, {
      method: "GET",
    });
  }

  /**
   * Get quota information
   */
  async getQuota(
    authState: QiwaAuthState,
    skillCategory?: string
  ): Promise<APIResponse<QuotaData | QuotaData[]>> {
    const endpoint = skillCategory ? `/api/v1/quota/${skillCategory}` : "/api/v1/quota";
    return this.makeRequest<QuotaData | QuotaData[]>(endpoint, authState, {
      method: "GET",
    });
  }

  /**
   * Get worker information
   */
  async getWorker(authState: QiwaAuthState, workerId: string): Promise<APIResponse<WorkerData>> {
    return this.makeRequest<WorkerData>(`/api/v1/workers/${workerId}`, authState, {
      method: "GET",
    });
  }

  /**
   * List all workers
   */
  async listWorkers(
    authState: QiwaAuthState,
    filters?: {
      status?: VisaStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<APIResponse<{ workers: WorkerData[]; total: number }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const endpoint = `/api/v1/workers?${params.toString()}`;
    return this.makeRequest<{ workers: WorkerData[]; total: number }>(endpoint, authState, {
      method: "GET",
    });
  }

  /**
   * Get sponsorship information
   */
  async getSponsorship(authState: QiwaAuthState, sponsorshipId: string): Promise<APIResponse<SponsorshipData>> {
    return this.makeRequest<SponsorshipData>(`/api/v1/sponsorship/${sponsorshipId}`, authState, {
      method: "GET",
    });
  }

  /**
   * List all sponsorships
   */
  async listSponsorships(
    authState: QiwaAuthState,
    filters?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<APIResponse<{ sponsorships: SponsorshipData[]; total: number }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));

    const endpoint = `/api/v1/sponsorship?${params.toString()}`;
    return this.makeRequest<{ sponsorships: SponsorshipData[]; total: number }>(endpoint, authState, {
      method: "GET",
    });
  }

  /**
   * Verify visa status with Qiwa
   */
  async verifyVisa(authState: QiwaAuthState, visaNumber: string): Promise<APIResponse<{ verified: boolean; status: VisaStatus }>> {
    return this.makeRequest<{ verified: boolean; status: VisaStatus }>(
      `/api/v1/visa/${visaNumber}/verify`,
      authState,
      {
        method: "POST",
      }
    );
  }

  /**
   * Sync visa data for organization
   */
  async syncVisaData(authState: QiwaAuthState): Promise<APIResponse<{ synced: number; failed: number; timestamp: Date }>> {
    return this.makeRequest<{ synced: number; failed: number; timestamp: Date }>(
      "/api/v1/visa/sync",
      authState,
      {
        method: "POST",
        data: {
          timestamp: new Date().toISOString(),
        },
      }
    );
  }

  /**
   * Get API health status
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        timeout: this.timeout,
      });
      return {
        healthy: response.ok,
        message: response.statusText,
      };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Schema for API response
 */
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
  retried: z.number(),
  timestamp: z.date(),
});

/**
 * Schema for visa data
 */
export const VisaDataSchema = z.object({
  visaNumber: z.string(),
  workerName: z.string(),
  nationality: z.string(),
  passportNumber: z.string(),
  issuedDate: z.date(),
  expiryDate: z.date(),
  status: z.enum(["active", "expired", "suspended", "transferred", "pending"]),
  sponsorshipStatus: z.string(),
  jobTitle: z.string(),
  salary: z.number(),
});

/**
 * Schema for quota data
 */
export const QuotaDataSchema = z.object({
  skillCategory: z.string(),
  totalQuota: z.number(),
  usedQuota: z.number(),
  availableQuota: z.number(),
  percentageUsed: z.number(),
  lastUpdated: z.date(),
});
