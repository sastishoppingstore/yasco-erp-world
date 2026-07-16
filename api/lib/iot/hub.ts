import { getDb } from "../../queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, asc, gte, lte, sql } from "drizzle-orm";

export interface IotDevice {
  id: number;
  tenantId: number;
  deviceId: string;
  name: string;
  type: string;
  location?: string;
  isOnline: boolean;
  lastSeen?: Date;
  metadata?: Record<string, any>;
}

export interface SensorReading {
  id: number;
  deviceId: number;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface ThresholdAlert {
  id: number;
  deviceId: number;
  sensorType: string;
  minValue?: number;
  maxValue?: number;
  enabled: boolean;
}

const SENSOR_TABLE = "iot_sensor_data";
const DEVICE_TABLE = "iot_devices";
const ALERT_TABLE = "iot_threshold_alerts";

export class IoTHub {
  async registerDevice(tenantId: number, data: {
    deviceId: string; name: string; type: string;
    location?: string; metadata?: Record<string, any>;
  }): Promise<IotDevice> {
    const db = getDb();
    const existing = await db.execute(sql`
      SELECT id FROM ${sql.raw(DEVICE_TABLE)} WHERE tenant_id = ${tenantId} AND device_id = ${data.deviceId} LIMIT 1
    `);
    if ((existing as any[]).length > 0) {
      await db.execute(sql`
        UPDATE ${sql.raw(DEVICE_TABLE)} SET name = ${data.name}, type = ${data.type},
          location = ${data.location ?? null}, metadata = ${data.metadata ? JSON.stringify(data.metadata) : null},
          is_online = 1, last_seen = NOW()
        WHERE tenant_id = ${tenantId} AND device_id = ${data.deviceId}
      `);
      return this.getDevice(tenantId, data.deviceId)!;
    }
    await db.execute(sql`
      INSERT INTO ${sql.raw(DEVICE_TABLE)} (tenant_id, device_id, name, type, location, metadata, is_online, last_seen)
      VALUES (${tenantId}, ${data.deviceId}, ${data.name}, ${data.type},
              ${data.location ?? null}, ${data.metadata ? JSON.stringify(data.metadata) : null}, 1, NOW())
    `);
    return this.getDevice(tenantId, data.deviceId)!;
  }

  async getDevice(tenantId: number, deviceId: string): Promise<IotDevice | null> {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT id, tenant_id, device_id, name, type, location, is_online, last_seen, metadata
      FROM ${sql.raw(DEVICE_TABLE)} WHERE tenant_id = ${tenantId} AND device_id = ${deviceId} LIMIT 1
    `) as any;
    if (!rows.length) return null;
    return this.mapDevice(rows[0]);
  }

  async listDevices(tenantId: number): Promise<IotDevice[]> {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT id, tenant_id, device_id, name, type, location, is_online, last_seen, metadata
      FROM ${sql.raw(DEVICE_TABLE)} WHERE tenant_id = ${tenantId} ORDER BY last_seen DESC
    `) as any;
    return rows.map(this.mapDevice);
  }

  async updateDeviceStatus(tenantId: number, deviceId: string, isOnline: boolean) {
    const db = getDb();
    await db.execute(sql`
      UPDATE ${sql.raw(DEVICE_TABLE)} SET is_online = ${isOnline ? 1 : 0},
        last_seen = ${isOnline ? sql`NOW()` : sql`last_seen`}
      WHERE tenant_id = ${tenantId} AND device_id = ${deviceId}
    `);
  }

  async ingestData(tenantId: number, deviceId: string, readings: { sensorType: string; value: number; unit: string; timestamp?: string }[]) {
    const device = await this.getDevice(tenantId, deviceId);
    if (!device) throw new Error(`Device ${deviceId} not found`);
    const db = getDb();
    for (const r of readings) {
      await db.execute(sql`
        INSERT INTO ${sql.raw(SENSOR_TABLE)} (tenant_id, device_id, sensor_type, value, unit, recorded_at)
        VALUES (${tenantId}, ${device.id}, ${r.sensorType}, ${r.value}, ${r.unit},
                ${r.timestamp ? new Date(r.timestamp) : sql`NOW()`})
      `);
    }
    await this.updateDeviceStatus(tenantId, deviceId, true);
    await this.evaluateThresholds(tenantId, device.id, readings);
  }

  async querySensorData(tenantId: number, deviceId?: number, sensorType?: string, from?: string, to?: string, limit = 100) {
    const db = getDb();
    const conditions = [sql`tenant_id = ${tenantId}`];
    if (deviceId) conditions.push(sql`device_id = ${deviceId}`);
    if (sensorType) conditions.push(sql`sensor_type = ${sensorType}`);
    if (from) conditions.push(sql`recorded_at >= ${new Date(from)}`);
    if (to) conditions.push(sql`recorded_at <= ${new Date(to)}`);
    const rows = await db.execute(sql`
      SELECT id, tenant_id, device_id, sensor_type, value, unit, recorded_at
      FROM ${sql.raw(SENSOR_TABLE)} WHERE ${conditions.join(sql` AND `)}
      ORDER BY recorded_at DESC LIMIT ${limit}
    `) as any;
    return rows.map((r: any) => ({
      id: r.id, deviceId: r.device_id, sensorType: r.sensor_type,
      value: r.value, unit: r.unit, timestamp: r.recorded_at,
    }));
  }

  async getLatestReadings(tenantId: number, deviceId: number): Promise<SensorReading[]> {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT s1.* FROM ${sql.raw(SENSOR_TABLE)} s1
      INNER JOIN (
        SELECT sensor_type, MAX(recorded_at) AS max_ts
        FROM ${sql.raw(SENSOR_TABLE)}
        WHERE tenant_id = ${tenantId} AND device_id = ${deviceId}
        GROUP BY sensor_type
      ) s2 ON s1.sensor_type = s2.sensor_type AND s1.recorded_at = s2.max_ts
      WHERE s1.tenant_id = ${tenantId} AND s1.device_id = ${deviceId}
    `) as any;
    return rows.map((r: any) => ({
      id: r.id, deviceId: r.device_id, sensorType: r.sensor_type,
      value: r.value, unit: r.unit, timestamp: r.recorded_at,
    }));
  }

  async setThreshold(tenantId: number, deviceId: number, sensorType: string, minValue?: number, maxValue?: number): Promise<number> {
    const db = getDb();
    const existing = await db.execute(sql`
      SELECT id FROM ${sql.raw(ALERT_TABLE)}
      WHERE tenant_id = ${tenantId} AND device_id = ${deviceId} AND sensor_type = ${sensorType} LIMIT 1
    `) as any;
    if (existing.length > 0) {
      await db.execute(sql`
        UPDATE ${sql.raw(ALERT_TABLE)} SET min_value = ${minValue ?? null}, max_value = ${maxValue ?? null}
        WHERE id = ${existing[0].id}
      `);
      return existing[0].id;
    }
    const result = await db.execute(sql`
      INSERT INTO ${sql.raw(ALERT_TABLE)} (tenant_id, device_id, sensor_type, min_value, max_value, enabled)
      VALUES (${tenantId}, ${deviceId}, ${sensorType}, ${minValue ?? null}, ${maxValue ?? null}, 1)
    `) as any;
    return result.insertId;
  }

  async listThresholds(tenantId: number, deviceId?: number): Promise<ThresholdAlert[]> {
    const db = getDb();
    const conditions = [sql`tenant_id = ${tenantId}`];
    if (deviceId) conditions.push(sql`device_id = ${deviceId}`);
    const rows = await db.execute(sql`
      SELECT id, device_id, sensor_type, min_value, max_value, enabled
      FROM ${sql.raw(ALERT_TABLE)} WHERE ${conditions.join(sql` AND `)}
    `) as any;
    return rows.map((r: any) => ({
      id: r.id, deviceId: r.device_id, sensorType: r.sensor_type,
      minValue: r.min_value, maxValue: r.max_value, enabled: !!r.enabled,
    }));
  }

  async deleteDevice(tenantId: number, deviceId: string) {
    const db = getDb();
    await db.execute(sql`DELETE FROM ${sql.raw(DEVICE_TABLE)} WHERE tenant_id = ${tenantId} AND device_id = ${deviceId}`);
    await db.execute(sql`DELETE FROM ${sql.raw(SENSOR_TABLE)} WHERE tenant_id = ${tenantId} AND device_id = (SELECT id FROM ${sql.raw(DEVICE_TABLE)} WHERE tenant_id = ${tenantId} AND device_id = ${deviceId})`);
    await db.execute(sql`DELETE FROM ${sql.raw(ALERT_TABLE)} WHERE tenant_id = ${tenantId} AND device_id = (SELECT id FROM ${sql.raw(DEVICE_TABLE)} WHERE tenant_id = ${tenantId} AND device_id = ${deviceId})`);
  }

  async getDashboardData(tenantId: number) {
    const devices = await this.listDevices(tenantId);
    const total = devices.length;
    const online = devices.filter(d => d.isOnline).length;
    const alerts = await this.listThresholds(tenantId);
    const activeAlerts = alerts.filter(a => a.enabled);
    return { totalDevices: total, onlineDevices: online, offlineDevices: total - online, activeAlerts: activeAlerts.length, devices };
  }

  private async evaluateThresholds(tenantId: number, devicePk: number, readings: { sensorType: string; value: number }[]) {
    const alerts = await this.listThresholds(tenantId, devicePk);
    for (const reading of readings) {
      const matched = alerts.find(a => a.sensorType === reading.sensorType && a.enabled);
      if (!matched) continue;
      if ((matched.minValue !== undefined && reading.value < matched.minValue) ||
          (matched.maxValue !== undefined && reading.value > matched.maxValue)) {
        const device = await this.getDevice(tenantId, (await this.listDevices(tenantId)).find(d => d.id === devicePk)?.deviceId ?? "");
        if (device) {
          await this.createAlertEvent(tenantId, devicePk, reading.sensorType, reading.value, matched);
        }
      }
    }
  }

  private async createAlertEvent(tenantId: number, deviceId: number, sensorType: string, value: number, threshold: ThresholdAlert) {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO iot_alert_events (tenant_id, device_id, sensor_type, value, threshold_min, threshold_max, severity)
      VALUES (${tenantId}, ${deviceId}, ${sensorType}, ${value},
              ${threshold.minValue ?? null}, ${threshold.maxValue ?? null},
              ${threshold.maxValue !== undefined && value > threshold.maxValue ? 'high' : 'medium'})
    `);
  }

  private mapDevice(r: any): IotDevice {
    return {
      id: r.id, tenantId: r.tenant_id, deviceId: r.device_id,
      name: r.name, type: r.type, location: r.location,
      isOnline: !!r.is_online, lastSeen: r.last_seen,
      metadata: r.metadata ? (typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata) : undefined,
    };
  }
}

export const iotHub = new IoTHub();
