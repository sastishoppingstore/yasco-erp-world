import { trpc } from "@/providers/trpc";
import type { HardwareFingerprint } from "../../api/lib/hardwareFingerprint";

export type LicenseStatus = "active" | "expired" | "grace" | "suspended" | "revoked" | "blacklisted" | "clock_tampered";

export type LicenseInfo = {
  tenantId: number;
  companyName: string;
  plan: string;
  maxDevices: number;
  issuedAt: string;
  expiresAt: string;
  nonce?: string;
  hardwareFingerprintHash?: string;
  graceDays?: number;
  features?: string[];
  modules?: string[];
};

export type LicenseVerificationResult = {
  valid: boolean;
  payload: LicenseInfo | null;
  status: LicenseStatus;
  reason?: string;
  hardwareMatch?: boolean;
  clockSafe?: boolean;
  remainingDays?: number;
  graceDaysLeft?: number;
};

export type ActivationFile = {
  version: string;
  type: "activation_request" | "activation_response";
  licenseKeyHash?: string;
  hardwareFingerprint?: HardwareFingerprint;
  action?: string;
  adminId?: number;
  requestedAt?: string;
  respondedAt?: string;
  nonce: string;
  signature?: string;
};

export async function verifyLicenseKey(key: string): Promise<LicenseVerificationResult> {
  try {
    const result = await trpc.licenseAdmin.verify.fetch({ key });
    return result as LicenseVerificationResult;
  } catch {
    return { valid: false, payload: null, status: "revoked", reason: "Verification request failed" };
  }
}

export function generateActivationRequestFile(
  licenseKey: string,
  hardwareFingerprint: HardwareFingerprint,
): string {
  const content: ActivationFile = {
    version: "1.0",
    type: "activation_request",
    licenseKeyHash: hashString(licenseKey),
    hardwareFingerprint,
    requestedAt: new Date().toISOString(),
    nonce: generateNonce(),
  };
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `activation-request-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return JSON.stringify(content, null, 2);
}

export function readActivationResponseFile(file: File): Promise<ActivationFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string) as ActivationFile;
        resolve(content);
      } catch (err) {
        reject(new Error("Invalid activation response file format"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function isLicenseReadOnly(status: LicenseStatus, remainingDays?: number, graceDaysLeft?: number): boolean {
  if (status === "grace" && (graceDaysLeft ?? 0) > 0) return true;
  if (status === "expired" || status === "revoked" || status === "suspended" || status === "blacklisted") return true;
  if (status === "clock_tampered") return true;
  return false;
}

export function getLicenseStatusLabel(status: LicenseStatus): string {
  const labels: Record<LicenseStatus, string> = {
    active: "Active",
    expired: "Expired",
    grace: "Grace Period",
    suspended: "Suspended",
    revoked: "Revoked",
    blacklisted: "Blacklisted",
    clock_tampered: "Clock Tampered",
  };
  return labels[status] || status;
}

export function getLicenseStatusColor(status: LicenseStatus): string {
  const colors: Record<LicenseStatus, string> = {
    active: "bg-green-100 text-green-800 border-green-300",
    expired: "bg-red-100 text-red-800 border-red-300",
    grace: "bg-yellow-100 text-yellow-800 border-yellow-300",
    suspended: "bg-orange-100 text-orange-800 border-orange-300",
    revoked: "bg-gray-100 text-gray-800 border-gray-300",
    blacklisted: "bg-red-200 text-red-900 border-red-400",
    clock_tampered: "bg-purple-100 text-purple-800 border-purple-300",
  };
  return colors[status] || "bg-slate-100 text-slate-800 border-slate-300";
}

export function daysUntilExpiry(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatExpiryDate(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hashString(input: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return crypto.subtle ? "hashed" : btoa(input).slice(0, 20);
}

function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
