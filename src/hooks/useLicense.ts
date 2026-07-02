import { useState, useEffect, useCallback } from "react";

const LICENSE_KEY = "yasco-license-key";
const TRIAL_KEY = "yasco-trial-license";

export interface LicenseInfo {
  key: string;
  activatedAt: string;
  expiresAt: string;
  type: "full" | "trial";
  status: "active" | "expired" | "invalid";
}

function generateTrialLicense(): LicenseInfo {
  const now = new Date();
  const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  return {
    key: `TRIAL-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    type: "trial",
    status: "active",
  };
}

function validateLicenseKey(key: string): boolean {
  if (!key || key.trim().length < 10) return false;
  if (key.startsWith("TRIAL-")) return true;
  const cleaned = key.replace(/[^A-Za-z0-9]/g, "");
  return cleaned.length >= 10;
}

function parseLicense(raw: string | null): LicenseInfo | null {
  if (!raw) return null;
  try {
    const license: LicenseInfo = JSON.parse(raw);
    if (!license.key || !license.expiresAt) return null;
    if (new Date(license.expiresAt) < new Date()) {
      return { ...license, status: "expired" };
    }
    return { ...license, status: "active" };
  } catch {
    return null;
  }
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(LICENSE_KEY);
    const parsed = parseLicense(raw);
    setLicense(parsed);
    setIsLoaded(true);
  }, []);

  const activate = useCallback((key: string): { success: boolean; message: string } => {
    if (!validateLicenseKey(key)) {
      return { success: false, message: "Invalid license key format" };
    }
    const now = new Date();
    const expires = key.startsWith("TRIAL-")
      ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const newLicense: LicenseInfo = {
      key: key.trim(),
      activatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      type: key.startsWith("TRIAL-") ? "trial" : "full",
      status: "active",
    };
    localStorage.setItem(LICENSE_KEY, JSON.stringify(newLicense));
    setLicense(newLicense);
    return { success: true, message: "License activated successfully" };
  }, []);

  const startTrial = useCallback((): { success: boolean; message: string } => {
    const trialLicense = generateTrialLicense();
    localStorage.setItem(LICENSE_KEY, JSON.stringify(trialLicense));
    setLicense(trialLicense);
    return { success: true, message: "14-day trial activated" };
  }, []);

  const revoke = useCallback(() => {
    localStorage.removeItem(LICENSE_KEY);
    localStorage.removeItem(TRIAL_KEY);
    setLicense(null);
  }, []);

  const isLicensed = license?.status === "active";
  const isExpired = license?.status === "expired";

  return { license, isLoaded, isLicensed, isExpired, activate, startTrial, revoke };
}
