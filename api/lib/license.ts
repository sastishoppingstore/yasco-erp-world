import * as cookie from "cookie";
import crypto from "node:crypto";
import { env } from "./env";

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

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payloadPart: string) {
  return crypto
    .createHmac("sha256", env.appSecret || "desktop_local_secret")
    .update(payloadPart)
    .digest("base64url");
}

export function createDesktopLicense(input: Omit<DesktopLicensePayload, "issuedAt" | "nonce">) {
  const payload: DesktopLicensePayload = {
    ...input,
    issuedAt: new Date().toISOString(),
    nonce: crypto.randomBytes(12).toString("hex"),
  };
  const payloadPart = base64Url(JSON.stringify(payload));
  return `YASCO-${payloadPart}.${signPayload(payloadPart)}`;
}

export function verifyDesktopLicense(key: string): DesktopLicensePayload {
  const raw = key.trim();
  if (!raw.startsWith("YASCO-")) throw new Error("Invalid license key format.");
  const [payloadPart, signature] = raw.slice("YASCO-".length).split(".");
  if (!payloadPart || !signature) throw new Error("Invalid license key format.");

  const expected = signPayload(payloadPart);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    throw new Error("Invalid license signature.");
  }

  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as DesktopLicensePayload;
  if (Number.isNaN(Date.parse(payload.expiresAt)) || new Date(payload.expiresAt).getTime() < Date.now()) {
    throw new Error("License key has expired.");
  }
  if (!payload.tenantId || !payload.companyName || !payload.plan) {
    throw new Error("License key payload is incomplete.");
  }
  return payload;
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
