import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { iotHub } from "./lib/iot/hub";

export const iotRouter = createRouter({
  listDevices: authedQuery.query(async ({ ctx }) => {
    return iotHub.listDevices(ctx.user.tenantId!);
  }),
  getDevice: authedQuery.input(z.object({ deviceId: z.string() })).query(async ({ input, ctx }) => {
    return iotHub.getDevice(ctx.user.tenantId!, input.deviceId);
  }),
  registerDevice: adminQuery
    .input(z.object({
      deviceId: z.string().min(1), name: z.string().min(1), type: z.string().min(1),
      location: z.string().optional(), metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return iotHub.registerDevice(ctx.user.tenantId!, input);
    }),
  updateDeviceStatus: adminQuery
    .input(z.object({ deviceId: z.string(), isOnline: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await iotHub.updateDeviceStatus(ctx.user.tenantId!, input.deviceId, input.isOnline);
      return { success: true };
    }),
  deleteDevice: adminQuery.input(z.object({ deviceId: z.string() })).mutation(async ({ input, ctx }) => {
    await iotHub.deleteDevice(ctx.user.tenantId!, input.deviceId);
    return { success: true };
  }),

  // ── Sensor Data ──
  querySensorData: authedQuery
    .input(z.object({
      deviceId: z.number().optional(), sensorType: z.string().optional(),
      from: z.string().optional(), to: z.string().optional(), limit: z.number().default(100),
    }))
    .query(async ({ input, ctx }) => {
      return iotHub.querySensorData(ctx.user.tenantId!, input.deviceId, input.sensorType, input.from, input.to, input.limit);
    }),
  getLatestReadings: authedQuery.input(z.object({ deviceId: z.number() })).query(async ({ input, ctx }) => {
    return iotHub.getLatestReadings(ctx.user.tenantId!, input.deviceId);
  }),
  ingestData: authedQuery
    .input(z.object({
      deviceId: z.string(), readings: z.array(z.object({
        sensorType: z.string(), value: z.number(), unit: z.string(), timestamp: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      await iotHub.ingestData(ctx.user.tenantId!, input.deviceId, input.readings);
      return { success: true };
    }),

  // ── Threshold Alerts ──
  setThreshold: adminQuery
    .input(z.object({ deviceId: z.number(), sensorType: z.string(), minValue: z.number().optional(), maxValue: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const id = await iotHub.setThreshold(ctx.user.tenantId!, input.deviceId, input.sensorType, input.minValue, input.maxValue);
      return { id, success: true };
    }),
  listThresholds: authedQuery.input(z.object({ deviceId: z.number().optional() })).query(async ({ input, ctx }) => {
    return iotHub.listThresholds(ctx.user.tenantId!, input.deviceId);
  }),

  // ── Dashboard ──
  getDashboard: authedQuery.query(async ({ ctx }) => {
    return iotHub.getDashboardData(ctx.user.tenantId!);
  }),
});
