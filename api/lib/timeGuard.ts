import crypto from "node:crypto";
import fs from "node:fs";
import { env } from "./env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function deriveKey(): Buffer {
  const raw = env.encryptionKey || env.appSecret || "yasco-timeguard-fallback-key-2026!!";
  return crypto.createHash("sha256").update(raw).digest();
}

function encrypt(plaintext: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function decrypt(ciphertext: string): string {
  const key = deriveKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export type TimeStampRecord = {
  serverTime: string;
  clientTime: string;
  signature: string;
  nonce: string;
};

function createSignedTimestamp(): TimeStampRecord {
  const serverTime = new Date().toISOString();
  const clientTime = new Date().toISOString();
  const nonce = crypto.randomBytes(8).toString("hex");
  const raw = `${serverTime}:${clientTime}:${nonce}:${env.appSecret || "timeguard-secret"}`;
  const signature = crypto.createHmac("sha384", env.appSecret || "timeguard-secret").update(raw).digest("base64url");
  return { serverTime, clientTime, signature, nonce };
}

function verifyTimestampSignature(record: TimeStampRecord): boolean {
  const raw = `${record.serverTime}:${record.clientTime}:${record.nonce}:${env.appSecret || "timeguard-secret"}`;
  const expected = crypto.createHmac("sha384", env.appSecret || "timeguard-secret").update(raw).digest("base64url");
  if (record.signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(record.signature), Buffer.from(expected));
}

function getStoragePath(): string {
  const dir = process.env.TIMEGUARD_STORAGE_PATH || "/tmp/yasco";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return `${dir}/timeguard.dat`;
}

export function storeLastVerifiedServerTime(): TimeStampRecord {
  const record = createSignedTimestamp();
  const encrypted = encrypt(JSON.stringify(record));
  fs.writeFileSync(getStoragePath(), encrypted, "utf8");
  return record;
}

export function loadLastVerifiedServerTime(): TimeStampRecord | null {
  try {
    const encrypted = fs.readFileSync(getStoragePath(), "utf8");
    const decrypted = decrypt(encrypted);
    const record = JSON.parse(decrypted) as TimeStampRecord;
    if (!verifyTimestampSignature(record)) return null;
    return record;
  } catch {
    return null;
  }
}

export enum ClockTamperStatus {
  OK = "ok",
  ROLLBACK_DETECTED = "rollback_detected",
  STORED_CORRUPT = "stored_corrupt",
  NO_STORED_RECORD = "no_stored_record",
}

export type ClockTamperResult = {
  status: ClockTamperStatus;
  currentTime: string;
  lastStoredTime: string | null;
  driftMs: number;
};

export function detectClockTampering(): ClockTamperResult {
  const now = new Date();
  const currentIso = now.toISOString();
  try {
    const record = loadLastVerifiedServerTime();
    if (!record) {
      return {
        status: ClockTamperStatus.NO_STORED_RECORD,
        currentTime: currentIso,
        lastStoredTime: null,
        driftMs: 0,
      };
    }
    const storedTime = new Date(record.serverTime).getTime();
    const currentTime = now.getTime();
    const driftMs = currentTime - storedTime;
    if (driftMs < 0 && Math.abs(driftMs) > 5000) {
      return {
        status: ClockTamperStatus.ROLLBACK_DETECTED,
        currentTime: currentIso,
        lastStoredTime: record.serverTime,
        driftMs,
      };
    }
    return {
      status: ClockTamperStatus.OK,
      currentTime: currentIso,
      lastStoredTime: record.serverTime,
      driftMs,
    };
  } catch {
    return {
      status: ClockTamperStatus.STORED_CORRUPT,
      currentTime: currentIso,
      lastStoredTime: null,
      driftMs: 0,
    };
  }
}

export function isClockSafe(): boolean {
  const result = detectClockTampering();
  return result.status === ClockTamperStatus.OK || result.status === ClockTamperStatus.NO_STORED_RECORD;
}

export function clearTimeGuard(): void {
  try {
    const path = getStoragePath();
    if (fs.existsSync(path)) fs.unlinkSync(path);
  } catch {
    // ignore
  }
}
