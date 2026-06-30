import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { vehicles, fuelRecords, vehicleMaintenance, drivers, routes, routePlanning, driverSchedules, shipmentTracking, fuelCostAnalytics } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const transportRouter = createRouter({
  routeList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(routes).where(eq(routes.tenantId, ctx.user.tenantId!));
    }),

  routeCreate: authedQuery
    .input(z.object({
      routeCode: z.string(), name: z.string(), origin: z.string(), destination: z.string(),
      distanceKm: z.string().optional(), estimatedDuration: z.string().optional(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(routes).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  routePlanningList: authedQuery
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(routePlanning.tenantId, ctx.user.tenantId!)];
      if (input?.date) conditions.push(eq(routePlanning.plannedDate, input.date));
      return db.select().from(routePlanning).where(and(...conditions)).orderBy(desc(routePlanning.plannedDate));
    }),

  driverScheduleList: authedQuery
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(driverSchedules.tenantId, ctx.user.tenantId!)];
      if (input?.date) conditions.push(eq(driverSchedules.date, input.date));
      return db.select().from(driverSchedules).where(and(...conditions));
    }),

  shipmentList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(shipmentTracking.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(shipmentTracking.status, input.status as any));
      return db.select().from(shipmentTracking).where(and(...conditions)).orderBy(desc(shipmentTracking.createdAt));
    }),

  shipmentCreate: authedQuery
    .input(z.object({
      trackingNumber: z.string(), origin: z.string(), destination: z.string(),
      customerId: z.number().optional(), weight: z.string().optional(), volume: z.string().optional(),
      vehicleId: z.number().optional(), driverId: z.number().optional(), routeId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(shipmentTracking).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  shipmentUpdate: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "picked_up", "in_transit", "delivered", "exception", "cancelled"]).optional(), lastLocation: z.string().optional(), currentLatitude: z.string().optional(), currentLongitude: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(shipmentTracking).set(data).where(eq(shipmentTracking.id, id));
      return { success: true };
    }),

  fuelAnalyticsList: authedQuery
    .input(z.object({ vehicleId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(fuelCostAnalytics.tenantId, ctx.user.tenantId!)];
      if (input?.vehicleId) conditions.push(eq(fuelCostAnalytics.vehicleId, input.vehicleId));
      return db.select().from(fuelCostAnalytics).where(and(...conditions));
    }),

  transportStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [totalVehicles] = await db.select({ count: sql<number>`count(*)` }).from(vehicles).where(eq(vehicles.tenantId, tenantId));
      const [activeShipments] = await db.select({ count: sql<number>`count(*)` }).from(shipmentTracking).where(and(eq(shipmentTracking.tenantId, tenantId), eq(shipmentTracking.status, "in_transit")));
      const [totalDrivers] = await db.select({ count: sql<number>`count(*)` }).from(drivers).where(eq(drivers.tenantId, tenantId));
      const [monthlyFuelCost] = await db.select({ total: sql<number>`coalesce(sum(total_cost), 0)` }).from(fuelRecords).where(and(eq(fuelRecords.tenantId, tenantId), sql`date_format(date, '%Y-%m') = date_format(curdate(), '%Y-%m')`));
      return { totalVehicles: totalVehicles.count, activeShipments: activeShipments.count, totalDrivers: totalDrivers.count, monthlyFuelCost: Number(monthlyFuelCost.total) };
    }),
});
