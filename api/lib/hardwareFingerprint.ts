import crypto from "node:crypto";
import os from "node:os";
import fs from "node:fs";
import { execSync } from "node:child_process";

export type HardwareFingerprint = {
  cpuHash: string;
  diskSerial: string;
  macHash: string;
  combinedHash: string;
  osHostname: string;
  generatedAt: string;
};

function getCpuInfo(): string {
  try {
    const cpus = os.cpus();
    const model = cpus.length > 0 ? cpus[0].model : "unknown";
    const cores = cpus.length;
    const speed = cpus[0]?.speed ?? 0;
    return `${model}|${cores}|${speed}`;
  } catch {
    return `unknown_cpu_${Date.now()}`;
  }
}

function getDiskSerial(): string {
  try {
    if (process.platform === "linux") {
      const result = execSync(
        "cat /sys/block/sda/serial 2>/dev/null || cat /sys/block/vda/serial 2>/dev/null || echo no_serial",
        { encoding: "utf8", timeout: 3000 },
      );
      return result.trim();
    }
    if (process.platform === "darwin") {
      const result = execSync(
        "diskutil info / | grep -i 'Disk Number' | awk -F: '{print $2}' | xargs || echo no_serial",
        { encoding: "utf8", timeout: 3000 },
      );
      return result.trim();
    }
    if (process.platform === "win32") {
      const result = execSync(
        'wmic diskdrive get serialnumber /value 2>nul | find "SerialNumber" || echo no_serial',
        { encoding: "utf8", timeout: 3000 },
      );
      return result.trim().replace("SerialNumber=", "");
    }
    return "no_serial";
  } catch {
    return "no_serial";
  }
}

function getMacHash(): string {
  try {
    const interfaces = os.networkInterfaces();
    const macs: string[] = [];
    for (const key of Object.keys(interfaces)) {
      const iface = interfaces[key];
      if (!iface) continue;
      for (const addr of iface) {
        if (!addr.internal && addr.mac && addr.mac !== "00:00:00:00:00:00") {
          macs.push(addr.mac);
        }
      }
    }
    macs.sort();
    return crypto.createHash("sha256").update(macs.join("|")).digest("hex");
  } catch {
    return `no_mac_${Date.now()}`;
  }
}

function safeHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function generateHardwareFingerprint(): HardwareFingerprint {
  const cpuRaw = getCpuInfo();
  const diskSerial = getDiskSerial();
  const macHash = getMacHash();
  const osHostname = os.hostname();

  const cpuHash = safeHash(cpuRaw);
  const combinedRaw = [cpuHash, diskSerial, macHash, osHostname].join("::");
  const combinedHash = safeHash(combinedRaw);

  return {
    cpuHash,
    diskSerial,
    macHash,
    combinedHash,
    osHostname,
    generatedAt: new Date().toISOString(),
  };
}

function hammingDistance(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  let dist = 0;
  for (let i = 0; i < maxLen; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

export function calculateToleranceScore(
  current: HardwareFingerprint,
  stored: HardwareFingerprint,
): number {
  let score = 0;
  if (current.cpuHash === stored.cpuHash) score += 40;
  if (current.macHash === stored.macHash) score += 30;
  if (current.diskSerial === stored.diskSerial) score += 20;
  if (current.osHostname === stored.osHostname) score += 10;

  const hd = hammingDistance(
    current.combinedHash,
    stored.combinedHash,
  );
  const normalized = Math.max(0, 100 - (hd / Math.max(current.combinedHash.length, 1)) * 100);
  return Math.round((score + normalized * 0.5) / 1.5);
}

export function verifyHardwareFingerprint(
  storedFingerprint: HardwareFingerprint,
  toleranceThreshold = 60,
): { verified: boolean; score: number; current: HardwareFingerprint } {
  const current = generateHardwareFingerprint();
  const score = calculateToleranceScore(current, storedFingerprint);
  return {
    verified: score >= toleranceThreshold,
    score,
    current,
  };
}

function getFingerprintFilePath(): string {
  const dir = process.env.FINGERPRINT_STORAGE_PATH || "/tmp/yasco";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return `${dir}/hardware_fingerprint.json`;
}

export function storeHardwareFingerprint(): HardwareFingerprint {
  const fp = generateHardwareFingerprint();
  fs.writeFileSync(getFingerprintFilePath(), JSON.stringify(fp, null, 2), "utf8");
  return fp;
}

export function loadStoredHardwareFingerprint(): HardwareFingerprint | null {
  try {
    const data = fs.readFileSync(getFingerprintFilePath(), "utf8");
    return JSON.parse(data) as HardwareFingerprint;
  } catch {
    return null;
  }
}

export function clearHardwareFingerprint(): void {
  try {
    const path = getFingerprintFilePath();
    if (fs.existsSync(path)) fs.unlinkSync(path);
  } catch {
    // ignore
  }
}
