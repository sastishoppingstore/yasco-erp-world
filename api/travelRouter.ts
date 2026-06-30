import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { travelBookings, travelSuppliers, itineraries, supplierReconciliation } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const travelRouter = createRouter({
  bookingList: authedQuery
    .input(z.object({ status: z.string().optional(), bookingType: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(travelBookings.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(travelBookings.status, input.status as any));
      if (input?.bookingType) conditions.push(eq(travelBookings.bookingType, input.bookingType as any));
      return db.select().from(travelBookings).where(and(...conditions)).orderBy(desc(travelBookings.createdAt));
    }),

  bookingCreate: authedQuery
    .input(z.object({
      bookingNumber: z.string(), customerId: z.number(),
      bookingType: z.enum(["flight", "hotel", "package", "car_rental", "insurance", "visa"]),
      supplierId: z.number().optional(), bookingDate: z.string(),
      startDate: z.string().optional(), endDate: z.string().optional(),
      grossAmount: z.string().optional(), commissionAmount: z.string().optional(),
      netAmount: z.string().optional(), paidAmount: z.string().optional(),
      currency: z.string().optional(), source: z.enum(["direct", "online", "partner", "corporate"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(travelBookings).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  supplierList: authedQuery
    .input(z.object({ supplierType: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(travelSuppliers.tenantId, ctx.user.tenantId!)];
      if (input?.supplierType) conditions.push(eq(travelSuppliers.supplierType, input.supplierType as any));
      return db.select().from(travelSuppliers).where(and(...conditions));
    }),

  itineraryList: authedQuery
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select().from(itineraries).where(and(eq(itineraries.tenantId, ctx.user.tenantId!), eq(itineraries.bookingId, input.bookingId))).orderBy(itineraries.day);
    }),

  reconciliationList: authedQuery
    .input(z.object({ supplierId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(supplierReconciliation.tenantId, ctx.user.tenantId!)];
      if (input?.supplierId) conditions.push(eq(supplierReconciliation.supplierId, input.supplierId));
      return db.select().from(supplierReconciliation).where(and(...conditions)).orderBy(desc(supplierReconciliation.createdAt));
    }),

  travelStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [totalBookings] = await db.select({ count: sql<number>`count(*)` }).from(travelBookings).where(eq(travelBookings.tenantId, tenantId));
      const [confirmedBookings] = await db.select({ count: sql<number>`count(*)` }).from(travelBookings).where(and(eq(travelBookings.tenantId, tenantId), eq(travelBookings.status, "confirmed")));
      const [totalSuppliers] = await db.select({ count: sql<number>`count(*)` }).from(travelSuppliers).where(eq(travelSuppliers.tenantId, tenantId));
      return { totalBookings: totalBookings.count, confirmedBookings: confirmedBookings.count, totalSuppliers: totalSuppliers.count };
    }),
});
