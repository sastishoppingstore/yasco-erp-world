import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { properties, propertyUnits, leases, rentInvoices, maintenanceRequests, commissionRecords } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const realEstateRouter = createRouter({
  propertyList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(properties).where(eq(properties.tenantId, ctx.user.tenantId!)).orderBy(desc(properties.createdAt));
    }),

  propertyCreate: authedQuery
    .input(z.object({
      propertyCode: z.string(), name: z.string(),
      propertyType: z.enum(["residential", "commercial", "industrial", "land", "mixed_use"]).optional(),
      address: z.string().optional(), city: z.string().optional(), district: z.string().optional(),
      areaSize: z.string().optional(), purchaseDate: z.string().optional(), purchaseCost: z.string().optional(),
      currentValue: z.string().optional(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(properties).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  unitList: authedQuery
    .input(z.object({ propertyId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(propertyUnits.tenantId, ctx.user.tenantId!)];
      if (input?.propertyId) conditions.push(eq(propertyUnits.propertyId, input.propertyId));
      return db.select().from(propertyUnits).where(and(...conditions));
    }),

  leaseList: authedQuery
    .input(z.object({ status: z.string().optional(), unitId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(leases.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(leases.status, input.status as any));
      if (input?.unitId) conditions.push(eq(leases.unitId, input.unitId));
      return db.select().from(leases).where(and(...conditions)).orderBy(desc(leases.createdAt));
    }),

  leaseCreate: authedQuery
    .input(z.object({
      leaseNumber: z.string(), unitId: z.number(), customerId: z.number().optional(),
      startDate: z.string(), endDate: z.string(), monthlyRent: z.string(),
      securityDeposit: z.string().optional(), rentDueDay: z.number().optional(),
      leaseType: z.enum(["residential", "commercial", "short_term", "long_term"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(leases).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  rentInvoiceList: authedQuery
    .input(z.object({ leaseId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(rentInvoices.tenantId, ctx.user.tenantId!)];
      if (input?.leaseId) conditions.push(eq(rentInvoices.leaseId, input.leaseId));
      if (input?.status) conditions.push(eq(rentInvoices.status, input.status as any));
      return db.select().from(rentInvoices).where(and(...conditions)).orderBy(desc(rentInvoices.createdAt));
    }),

  maintenanceRequestList: authedQuery
    .input(z.object({ status: z.string().optional(), unitId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(maintenanceRequests.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(maintenanceRequests.status, input.status as any));
      if (input?.unitId) conditions.push(eq(maintenanceRequests.unitId, input.unitId));
      return db.select().from(maintenanceRequests).where(and(...conditions)).orderBy(desc(maintenanceRequests.createdAt));
    }),

  commissionList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(commissionRecords).where(eq(commissionRecords.tenantId, ctx.user.tenantId!)).orderBy(desc(commissionRecords.createdAt));
    }),

  realEstateStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [totalProperties] = await db.select({ count: sql<number>`count(*)` }).from(properties).where(eq(properties.tenantId, tenantId));
      const [vacantUnits] = await db.select({ count: sql<number>`count(*)` }).from(propertyUnits).where(and(eq(propertyUnits.tenantId, tenantId), eq(propertyUnits.status, "vacant")));
      const [activeLeases] = await db.select({ count: sql<number>`count(*)` }).from(leases).where(and(eq(leases.tenantId, tenantId), eq(leases.status, "active")));
      const [overdueRent] = await db.select({ count: sql<number>`count(*)` }).from(rentInvoices).where(and(eq(rentInvoices.tenantId, tenantId), eq(rentInvoices.status, "overdue")));
      return { totalProperties: totalProperties.count, vacantUnits: vacantUnits.count, activeLeases: activeLeases.count, overdueRent: overdueRent.count };
    }),
});
