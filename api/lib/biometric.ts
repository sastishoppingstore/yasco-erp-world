import { z } from "zod";

export type BiometricMethod = "face" | "fingerprint" | "voice" | "pin" | "qr" | "gps" | "manual";

export interface BiometricDeviceConfig {
  deviceId: string;
  deviceType: "zkteco_face" | "zkteco_fingerprint" | "mobile_gps" | "qr_scanner";
  ipAddress?: string;
  port?: number;
  serialNumber?: string;
  location?: { lat: number; lng: number; radius: number };
  isOffline: boolean;
}

export interface GeoFenceConfig {
  lat: number;
  lng: number;
  radiusMeters: number;
  strictness: "soft" | "hard";
}

export interface BiometricMatchResult {
  matched: boolean;
  employeeId?: number;
  confidence: number;
  method: BiometricMethod;
  deviceId?: string;
  timestamp: string;
}

export interface AttendanceRecord {
  employeeId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  method: BiometricMethod;
  deviceId?: string;
  geoLocation?: { lat: number; lng: number };
}

export class BiometricEngine {
  private devices: Map<string, BiometricDeviceConfig> = new Map();

  registerDevice(config: BiometricDeviceConfig) {
    this.devices.set(config.deviceId, config);
  }

  getDevice(deviceId: string): BiometricDeviceConfig | undefined {
    return this.devices.get(deviceId);
  }

  async matchLocal(templateHash: string, storedHashes: string[]): Promise<{ matched: boolean; confidence: number }> {
    const SIMILARITY_THRESHOLD = 0.85;
    for (const hash of storedHashes) {
      const similarity = this.hammingSimilarity(templateHash, hash);
      if (similarity >= SIMILARITY_THRESHOLD) {
        return { matched: true, confidence: similarity };
      }
    }
    return { matched: false, confidence: 0 };
  }

  private hammingSimilarity(a: string, b: string): number {
    if (a.length !== b.length) return 0;
    let distance = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) distance++;
    }
    return 1 - distance / a.length;
  }

  async verifyGpsWithinFence(lat: number, lng: number, fence: GeoFenceConfig): Promise<boolean> {
    const R = 6371000;
    const dLat = ((lat - fence.lat) * Math.PI) / 180;
    const dLng = ((lng - fence.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((fence.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= fence.radiusMeters;
  }

  async isOfflineCapable(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    return device?.isOffline ?? false;
  }

  getFallbackMethods(): BiometricMethod[] {
    return ["pin", "qr", "manual"];
  }
}
