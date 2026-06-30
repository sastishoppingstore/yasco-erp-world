import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { flights, crewCertifications, maintenanceAirworthiness, partsInventorySerial } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const aviationRouter = createRouter({
  flightList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(flights.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(flights.status, input.status as any));
      return db.select().from(flights).where(and(...conditions)).orderBy(desc(flights.departureTime));
    }),

  flightCreate: authedQuery
    .input(z.object({
      flightNumber: z.string(), origin: z.string(), destination: z.string(),
      departureTime: z.string(), arrivalTime: z.string(),
      aircraftRegistration: z.string().optional(), aircraftType: z.string().optional(),
      flightDuration: z.number().optional(), totalSeats: z.number().optional(),
      pilotId: z.number().optional(), copilotId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(flights).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  flightUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["scheduled", "boarding", "departed", "in_air", "landed", "cancelled", "delayed", "diverted"]).optional(),
      bookedSeats: z.number().optional(), delayReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(flights).set(data).where(eq(flights.id, id));
      return { success: true };
    }),

  crewCertificationList: authedQuery
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(crewCertifications.tenantId, ctx.user.tenantId!)];
      if (input?.employeeId) conditions.push(eq(crewCertifications.employeeId, input.employeeId));
      return db.select().from(crewCertifications).where(and(...conditions));
    }),

  maintenanceAirworthinessList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(maintenanceAirworthiness.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(maintenanceAirworthiness.status, input.status as any));
      return db.select().from(maintenanceAirworthiness).where(and(...conditions)).orderBy(desc(maintenanceAirworthiness.inspectionDate));
    }),

  partsList: authedQuery
    .input(z.object({ partNumber: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(partsInventorySerial.tenantId, ctx.user.tenantId!)];
      if (input?.partNumber) conditions.push(eq(partsInventorySerial.partNumber, input.partNumber));
      return db.select().from(partsInventorySerial).where(and(...conditions));
    }),

  aviationStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [todayFlights] = await db.select({ count: sql<number>`count(*)` }).from(flights).where(and(eq(flights.tenantId, tenantId), sql`date(departure_time) = curdate()`));
      const [scheduled] = await db.select({ count: sql<number>`count(*)` }).from(flights).where(and(eq(flights.tenantId, tenantId), eq(flights.status, "scheduled")));
      const [inAir] = await db.select({ count: sql<number>`count(*)` }).from(flights).where(and(eq(flights.tenantId, tenantId), eq(flights.status, "in_air")));
      return { todayFlights: todayFlights.count, scheduledFlights: scheduled.count, inAirFlights: inAir.count };
    }),
});
