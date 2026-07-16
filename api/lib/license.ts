import * as cookie from "cookie";
import crypto from "node:crypto";
import fs from "node:fs";
import { env } from "./env";
import type { HardwareFingerprint } from "./hardwareFingerprint";
import { detectClockTampering, storeLastVerifiedServerTime, isClockSafe, ClockTamperStatus } from "./timeGuard";

export const DESKTOP_LICENSE_COOKIE = "erp_desktop_license";

export type DesktopLicensePayload = {
  tenantId: number;
  companyName: string;
  plan: string;
  maxDevices: number;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
};

export type LicenseType = "hmac" | "ecdsa" | "rsa";

export type EnhancedLicensePayload = DesktopLicensePayload & {
  hardwareFingerprintHash?: string;
  licenseType?: LicenseType;
  graceDays?: number;
  features?: string[];
  modules?: string[];
  issuedBy?: number;
  signatureMethod?: string;
};

export type LicenseStatus =
  | "active"
  | "expired"
  | "grace"
  | "suspended"
  | "revoked"
  | "blacklisted"
  | "clock_tampered";

export type LicenseVerificationResult = {
  valid: boolean;
  payload: EnhancedLicensePayload | null;
  status: LicenseStatus;
  reason?: string;
  hardwareMatch?: boolean;
  clockSafe?: boolean;
  remainingDays?: number;
  graceDaysLeft?: number;
};

const KEY_TYPE: LicenseType = (process.env.LICENSE_KEY_TYPE as LicenseType) || "hmac";
const GRACE_WINDOW_DAYS = Number(process.env.LICENSE_GRACE_DAYS || "7");

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signPayloadHmac(payloadPart: string) {
  return crypto
    .createHmac("sha256", env.appSecret || "desktop_local_secret")
    .update(payloadPart)
    .digest("base64url");
}

let ecdsaKeyPair: crypto.KeyObject | null = null;
let rsaKeyPair: crypto.KeyObject | null = null;

function getEcdsaKey(): crypto.KeyObject {
  if (!ecdsaKeyPair) {
    const pem = process.env.LICENSE_ECDSA_PRIVATE_KEY;
    if (pem) {
      ecdsaKeyPair = crypto.createPrivateKey(pem);
    } else {
      const { privateKey } = crypto.generateKeyPairSync("ec", {
        namedCurve: "P-256",
      });
      ecdsaKeyPair = privateKey;
    }
  }
  return ecdsaKeyPair;
}

function getRsaKey(): crypto.KeyObject {
  if (!rsaKeyPair) {
    const pem = process.env.LICENSE_RSA_PRIVATE_KEY;
    if (pem) {
      rsaKeyPair = crypto.createPrivateKey(pem);
    } else {
      const { privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
      });
      rsaKeyPair = privateKey;
    }
  }
  return rsaKeyPair;
}

function signPayloadEcdsa(payloadPart: string): string {
  const sign = crypto.createSign("sha256");
  sign.update(payloadPart);
  sign.end();
  return sign.sign(getEcdsaKey(), "base64url");
}

function signPayloadRsa(payloadPart: string): string {
  const sign = crypto.createSign("sha256");
  sign.update(payloadPart);
  sign.end();
  return sign.sign(getRsaKey(), "base64url");
}

function verifyEcdsa(payloadPart: string, signature: string, publicKeyPem?: string): boolean {
  try {
    const publicKey = publicKeyPem
      ? crypto.createPublicKey(publicKeyPem)
      : crypto.createPublicKey(getEcdsaKey());
    const verify = crypto.createVerify("sha256");
    verify.update(payloadPart);
    verify.end();
    return verify.verify(publicKey, Buffer.from(signature, "base64url"));
  } catch {
    return false;
  }
}

function verifyRsa(payloadPart: string, signature: string, publicKeyPem?: string): boolean {
  try {
    const publicKey = publicKeyPem
      ? crypto.createPublicKey(publicKeyPem)
      : crypto.createPublicKey(getRsaKey());
    const verify = crypto.createVerify("sha256");
    verify.update(payloadPart);
    verify.end();
    return verify.verify(publicKey, Buffer.from(signature, "base64url"));
  } catch {
    return false;
  }
}

function signPayload(payloadPart: string): string {
  switch (KEY_TYPE) {
    case "ecdsa": return signPayloadEcdsa(payloadPart);
    case "rsa": return signPayloadRsa(payloadPart);
    default: return signPayloadHmac(payloadPart);
  }
}

function verifySignature(payloadPart: string, signature: string, method?: string): boolean {
  switch (method || KEY_TYPE) {
    case "ecdsa": return verifyEcdsa(payloadPart, signature);
    case "rsa": return verifyRsa(payloadPart, signature);
    default:
      const expected = signPayloadHmac(payloadPart);
      const left = Buffer.from(signature);
      const right = Buffer.from(expected);
      return left.length === right.length && crypto.timingSafeEqual(left, right);
  }
}

function getPrefix(): string {
  switch (KEY_TYPE) {
    case "ecdsa": return "YASCO-EC-";
    case "rsa": return "YASCO-RSA-";
    default: return "YASCO-";
  }
}

export function createDesktopLicense(input: Omit<DesktopLicensePayload, "issuedAt" | "nonce">) {
  const payload: EnhancedLicensePayload = {
    ...input,
    issuedAt: new Date().toISOString(),
    nonce: crypto.randomBytes(12).toString("hex"),
    licenseType: KEY_TYPE,
    signatureMethod: KEY_TYPE,
  };
  const payloadPart = base64Url(JSON.stringify(payload));
  return `${getPrefix()}${payloadPart}.${signPayload(payloadPart)}`;
}

export function createEnhancedLicense(
  input: Omit<EnhancedLicensePayload, "issuedAt" | "nonce">,
): string {
  const payload: EnhancedLicensePayload = {
    ...input,
    issuedAt: new Date().toISOString(),
    nonce: crypto.randomBytes(12).toString("hex"),
    licenseType: KEY_TYPE,
    signatureMethod: KEY_TYPE,
  };
  const payloadPart = base64Url(JSON.stringify(payload));
  return `${getPrefix()}${payloadPart}.${signPayload(payloadPart)}`;
}

export function parseLicenseKey(key: string): {
  prefix: string;
  payloadPart: string;
  signature: string;
  method?: LicenseType;
} {
  const raw = key.trim();
  let prefix = "YASCO-";
  let method: LicenseType | undefined;

  if (raw.startsWith("YASCO-EC-")) {
    prefix = "YASCO-EC-";
    method = "ecdsa";
  } else if (raw.startsWith("YASCO-RSA-")) {
    prefix = "YASCO-RSA-";
    method = "rsa";
  } else if (!raw.startsWith("YASCO-")) {
    throw new Error("Invalid license key format.");
  }

  const [payloadPart, signature] = raw.slice(prefix.length).split(".");
  if (!payloadPart || !signature) throw new Error("Invalid license key format.");

  return { prefix, payloadPart, signature, method };
}

function decodePayload(payloadPart: string): EnhancedLicensePayload {
  return JSON.parse(
    Buffer.from(payloadPart, "base64url").toString("utf8"),
  ) as EnhancedLicensePayload;
}

export function verifyDesktopLicense(key: string): DesktopLicensePayload {
  const result = verifyLicenseAdvanced(key);
  if (!result.valid) throw new Error(result.reason || "License verification failed");
  return result.payload as DesktopLicensePayload;
}

export function verifyLicenseAdvanced(
  key: string,
  options?: {
    hardwareFingerprint?: HardwareFingerprint;
    requireHardwareMatch?: boolean;
    skipClockCheck?: boolean;
  },
): LicenseVerificationResult {
  try {
    const { payloadPart, signature, method } = parseLicenseKey(key);
    const payload = decodePayload(payloadPart);

    if (!verifySignature(payloadPart, signature, method)) {
      return { valid: false, payload: null, status: "revoked", reason: "Invalid license signature." };
    }

    if (!payload.tenantId || !payload.companyName || !payload.plan) {
      return { valid: false, payload: null, status: "revoked", reason: "License payload is incomplete." };
    }

    const expiresAt = new Date(payload.expiresAt).getTime();
    const now = Date.now();

    if (Number.isNaN(Date.parse(payload.expiresAt))) {
      return { valid: false, payload: null, status: "expired", reason: "License has invalid expiry date." };
    }

    const graceMs = (payload.graceDays ?? GRACE_WINDOW_DAYS) * 24 * 60 * 60 * 1000;
    const remainingDays = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24)));

    if (now > expiresAt + graceMs) {
      return { valid: false, payload, status: "expired", reason: "License has expired.", remainingDays: 0 };
    }

    let status: LicenseStatus = "active";
    let graceDaysLeft = 0;

    if (now > expiresAt) {
      status = "grace";
      graceDaysLeft = Math.max(0, Math.ceil((expiresAt + graceMs - now) / (1000 * 60 * 60 * 24)));
    }

    let clockSafe = true;
    if (!options?.skipClockCheck) {
      const clockResult = detectClockTampering();
      clockSafe = clockResult.status === ClockTamperStatus.OK || clockResult.status === ClockTamperStatus.NO_STORED_RECORD;
      if (!clockSafe) {
        status = "clock_tampered";
        return {
          valid: false,
          payload,
          status,
          reason: "System clock tampering detected.",
          clockSafe: false,
          remainingDays,
        };
      }
      if (clockResult.status === ClockTamperStatus.OK) {
        storeLastVerifiedServerTime();
      }
    }

    let hardwareMatch = true;
    if (options?.hardwareFingerprint && payload.hardwareFingerprintHash) {
      hardwareMatch = options.hardwareFingerprint.combinedHash === payload.hardwareFingerprintHash;
      if (!hardwareMatch && options?.requireHardwareMatch) {
        return {
          valid: false,
          payload,
          status: "revoked",
          reason: "Hardware fingerprint does not match.",
          hardwareMatch: false,
          clockSafe,
          remainingDays,
        };
      }
    }

    return {
      valid: true,
      payload,
      status,
      hardwareMatch,
      clockSafe,
      remainingDays,
      graceDaysLeft,
    };
  } catch (err: any) {
    return { valid: false, payload: null, status: "revoked", reason: err.message };
  }
}

export function getLicenseFromHeaders(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const key = cookies[DESKTOP_LICENSE_COOKIE];
  if (!key) return null;
  return verifyDesktopLicense(key);
}

export function requireDesktopLicense(headers: Headers) {
  if (!env.isDesktop) return null;
  const license = getLicenseFromHeaders(headers);
  if (!license) throw new Error("Desktop license activation is required.");
  return license;
}

export function exportActivationRequest(licenseKey: string, hardwareFingerprint: HardwareFingerprint): string {
  const request = {
    version: "1.0",
    type: "activation_request",
    licenseKey: licenseKey.slice(0, 8) + "...",
    licenseKeyHash: crypto.createHash("sha256").update(licenseKey).digest("hex"),
    hardwareFingerprint,
    requestedAt: new Date().toISOString(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  return JSON.stringify(request, null, 2);
}

export function createActivationResponse(
  activationRequestJson: string,
  action: "approve" | "reject" | "transfer",
  adminId: number,
): string {
  const request = JSON.parse(activationRequestJson);
  const response = {
    version: "1.0",
    type: "activation_response",
    action,
    requestHash: request.licenseKeyHash,
    adminId,
    respondedAt: new Date().toISOString(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  const payloadPart = base64Url(JSON.stringify(response));
  const signature = signPayloadHmac(payloadPart);
  return JSON.stringify({ ...response, signature: `${payloadPart}.${signature}` }, null, 2);
}

export function importActivationResponse(responseJson: string): {
  valid: boolean;
  action: string;
  reason?: string;
} {
  try {
    const data = JSON.parse(responseJson);
    if (!data.signature) return { valid: false, action: "error", reason: "Missing signature" };
    const [payloadPart, signature] = data.signature.split(".");
    if (!payloadPart || !signature) return { valid: false, action: "error", reason: "Invalid signature format" };
    const expected = signPayloadHmac(payloadPart);
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
      return { valid: false, action: "error", reason: "Invalid response signature" };
    }
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return { valid: true, action: payload.action };
  } catch {
    return { valid: false, action: "error", reason: "Invalid response format" };
  }
}

export function isWithinGracePeriod(license: DesktopLicensePayload): boolean {
  const expiresAt = new Date(license.expiresAt).getTime();
  const now = Date.now();
  if (now <= expiresAt) return false;
  const graceMs = GRACE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return now <= expiresAt + graceMs;
}

export function getGraceDaysRemaining(license: DesktopLicensePayload): number {
  const expiresAt = new Date(license.expiresAt).getTime();
  const now = Date.now();
  if (now <= expiresAt) return 0;
  const graceMs = GRACE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, Math.ceil((expiresAt + graceMs - now) / (1000 * 60 * 60 * 24)));
  return remaining;
}

export function isLicenseReadOnly(license: DesktopLicensePayload): boolean {
  return isWithinGracePeriod(license);
}

export const GRACE_PERIOD_DAYS = GRACE_WINDOW_DAYS;
