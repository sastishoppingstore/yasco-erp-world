import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  workshopJobCards, workshopJobParts, workshopJobLabor,
  workshopVehicles, workshopEstimates, workshopEstimateItems,
  workshopTechnicians, workshopInspections, workshopServiceTypes,
  workshopBaySchedule, workshopPayments,
} from "../db/schema-workshop";
import { eq, and, desc, sql, gte, lte, like } from "drizzle-orm";

export const workshopRouter = createRouter({
  // ─── Job Cards ────────────────────────────────────────
  jobCardList: authedQuery
    .input(z.object({ status: z.string().optional(), search: z.string().optional(), technicianId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workshopJobCards.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(workshopJobCards.status, input.status as any));
      if (input?.technicianId) conditions.push(eq(workshopJobCards.technicianId, input.technicianId));
      return db.select().from(workshopJobCards).where(and(...conditions)).orderBy(desc(workshopJobCards.createdAt));
    }),

  jobCardGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const job = await db.select().from(workshopJobCards).where(eq(workshopJobCards.id, input.id)).limit(1);
      const parts = await db.select().from(workshopJobParts).where(eq(workshopJobParts.jobCardId, input.id));
      const labor = await db.select().from(workshopJobLabor).where(eq(workshopJobLabor.jobCardId, input.id));
      return { job: job[0], parts, labor };
    }),

  jobCardCreate: authedQuery
    .input(z.object({
      vehicleId: z.number(), customerId: z.number(),
      jobNumber: z.string(), serviceType: z.string(),
      description: z.string().optional(), estimatedCost: z.string().optional(),
      technicianId: z.number().optional(), priority: z.string().optional(),
      estimatedHours: z.number().optional(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopJobCards).values({
        ...input, tenantId: ctx.user.tenantId!, status: "pending",
      }).$returningId();
      return { id, success: true };
    }),

  jobCardUpdate: authedQuery
    .input(z.object({ id: z.number(), status: z.string().optional(), technicianId: z.number().optional(), priority: z.string().optional(), actualCost: z.string().optional(), actualHours: z.number().optional(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "in_progress") updateData.startDate = sql`(datetime('now'))`;
      if (data.status === "completed" || data.status === "delivered") updateData.completionDate = sql`(datetime('now'))`;
      await db.update(workshopJobCards).set(updateData).where(eq(workshopJobCards.id, id));
      return { success: true };
    }),

  jobCardDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(workshopJobCards).where(eq(workshopJobCards.id, input.id));
      return { success: true };
    }),

  // ─── Job Parts ────────────────────────────────────────
  jobPartAdd: authedQuery
    .input(z.object({ jobCardId: z.number(), partName: z.string(), partNumber: z.string().optional(), quantity: z.number().optional(), unitPrice: z.string().optional(), totalPrice: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopJobParts).values({ ...input }).$returningId();
      return { id, success: true };
    }),

  jobPartRemove: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(workshopJobParts).where(eq(workshopJobParts.id, input.id));
      return { success: true };
    }),

  // ─── Job Labor ────────────────────────────────────────
  jobLaborAdd: authedQuery
    .input(z.object({ jobCardId: z.number(), technicianId: z.number().optional(), description: z.string(), hours: z.number().optional(), rate: z.string().optional(), total: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopJobLabor).values({ ...input }).$returningId();
      return { id, success: true };
    }),

  // ─── Vehicles ─────────────────────────────────────────
  vehicleList: authedQuery
    .input(z.object({ customerId: z.number().optional(), search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workshopVehicles.tenantId, ctx.user.tenantId!)];
      if (input?.customerId) conditions.push(eq(workshopVehicles.customerId, input.customerId));
      return db.select().from(workshopVehicles).where(and(...conditions)).orderBy(desc(workshopVehicles.createdAt));
    }),

  vehicleLookup: authedQuery
    .input(z.object({ plateNumber: z.string().optional(), vin: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workshopVehicles.tenantId, ctx.user.tenantId!)];
      if (input.plateNumber) conditions.push(eq(workshopVehicles.plateNumber, input.plateNumber));
      if (input.vin) conditions.push(eq(workshopVehicles.vin, input.vin));
      return db.select().from(workshopVehicles).where(and(...conditions)).limit(1);
    }),

  vehicleCreate: authedQuery
    .input(z.object({
      customerId: z.number(), make: z.string(), model: z.string(), year: z.number(),
      plateNumber: z.string().optional(), vin: z.string().optional(),
      color: z.string().optional(), mileage: z.string().optional(),
      nextServiceMileage: z.string().optional(), nextServiceDate: z.string().optional(),
      insuranceCompany: z.string().optional(), policyNumber: z.string().optional(),
      insuranceExpiry: z.string().optional(), registrationExpiry: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopVehicles).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  vehicleUpdate: authedQuery
    .input(z.object({ id: z.number(), mileage: z.string().optional(), nextServiceMileage: z.string().optional(), nextServiceDate: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(workshopVehicles).set(data).where(eq(workshopVehicles.id, id));
      return { success: true };
    }),

  vehicleHistory: authedQuery
    .input(z.object({ vehicleId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(workshopJobCards).where(eq(workshopJobCards.vehicleId, input.vehicleId)).orderBy(desc(workshopJobCards.createdAt));
    }),

  // ─── Estimates ────────────────────────────────────────
  estimateList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workshopEstimates.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(workshopEstimates.status, input.status as any));
      return db.select().from(workshopEstimates).where(and(...conditions)).orderBy(desc(workshopEstimates.createdAt));
    }),

  estimateCreate: authedQuery
    .input(z.object({
      vehicleId: z.number(), customerId: z.number(), estimateNumber: z.string(),
      partsTotal: z.string().optional(), laborTotal: z.string().optional(),
      subletTotal: z.string().optional(), taxAmount: z.string().optional(),
      totalAmount: z.string(), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopEstimates).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  estimateApprove: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(workshopEstimates).set({ status: "approved", approvedAt: sql`(datetime('now'))` }).where(eq(workshopEstimates.id, input.id));
      return { success: true };
    }),

  estimateConvertToJob: authedQuery
    .input(z.object({ estimateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [est] = await db.select().from(workshopEstimates).where(eq(workshopEstimates.id, input.estimateId)).limit(1);
      if (!est) throw new Error("Estimate not found");
      const items = await db.select().from(workshopEstimateItems).where(eq(workshopEstimateItems.estimateId, input.estimateId));
      const jobCount = await db.select({ count: sql<number>`count(*)` }).from(workshopJobCards).where(eq(workshopJobCards.tenantId, ctx.user.tenantId!));
      const jobNumber = `EST-JOB-${(jobCount[0]?.count || 0) + 1}`;
      const [{ jobId }] = await db.insert(workshopJobCards).values({
        vehicleId: est.vehicleId, customerId: est.customerId,
        jobNumber, serviceType: "Estimate Conversion",
        estimatedCost: est.totalAmount, tenantId: ctx.user.tenantId!,
        status: "pending",
      }).$returningId();
      await db.update(workshopEstimates).set({ status: "converted", convertedToJobId: jobId }).where(eq(workshopEstimates.id, input.estimateId));
      return { jobId, success: true };
    }),

  // ─── Technicians ──────────────────────────────────────
  technicianList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(workshopTechnicians).where(eq(workshopTechnicians.tenantId, ctx.user.tenantId!));
    }),

  technicianCreate: authedQuery
    .input(z.object({
      name: z.string(), phone: z.string().optional(), email: z.string().optional(),
      specialty: z.string().optional(), hourlyRate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopTechnicians).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  technicianUpdate: authedQuery
    .input(z.object({ id: z.number(), name: z.string().optional(), phone: z.string().optional(), hourlyRate: z.string().optional(), isActive: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(workshopTechnicians).set(data).where(eq(workshopTechnicians.id, id));
      return { success: true };
    }),

  technicianSchedule: authedQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const techs = await db.select().from(workshopTechnicians).where(eq(workshopTechnicians.tenantId, ctx.user.tenantId!));
      const jobs = await db.select().from(workshopJobCards).where(and(
        eq(workshopJobCards.tenantId, ctx.user.tenantId!),
        eq(workshopJobCards.status, "in_progress"),
      ));
      return techs.map(t => ({
        ...t,
        activeJobs: jobs.filter(j => j.technicianId === t.id),
      }));
    }),

  // ─── Inspections ──────────────────────────────────────
  inspectionList: authedQuery
    .input(z.object({ jobCardId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workshopInspections.tenantId, ctx.user.tenantId!)];
      if (input?.jobCardId) conditions.push(eq(workshopInspections.jobCardId, input.jobCardId));
      return db.select().from(workshopInspections).where(and(...conditions)).orderBy(desc(workshopInspections.createdAt));
    }),

  inspectionCreate: authedQuery
    .input(z.object({ jobCardId: z.number(), checklistJson: z.string().optional(), photos: z.string().optional(), customerSignature: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopInspections).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // ─── Service Types ────────────────────────────────────
  serviceTypeList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(workshopServiceTypes).where(eq(workshopServiceTypes.tenantId, ctx.user.tenantId!));
    }),

  serviceTypeCreate: authedQuery
    .input(z.object({ name: z.string(), nameAr: z.string().optional(), description: z.string().optional(), estimatedHours: z.number().optional(), defaultPrice: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopServiceTypes).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // ─── Bay Schedule ─────────────────────────────────────
  bayList: authedQuery
    .input(z.object({ date: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workshopBaySchedule.tenantId, ctx.user.tenantId!)];
      if (input?.date) conditions.push(eq(workshopBaySchedule.date, input.date));
      return db.select().from(workshopBaySchedule).where(and(...conditions)).orderBy(workshopBaySchedule.bayNumber);
    }),

  bayUpdate: authedQuery
    .input(z.object({ id: z.number(), status: z.string(), jobCardId: z.number().optional(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(workshopBaySchedule).set(data).where(eq(workshopBaySchedule.id, id));
      return { success: true };
    }),

  // ─── Payments ─────────────────────────────────────────
  paymentList: authedQuery
    .input(z.object({ jobCardId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workshopPayments.tenantId, ctx.user.tenantId!)];
      if (input?.jobCardId) conditions.push(eq(workshopPayments.jobCardId, input.jobCardId));
      return db.select().from(workshopPayments).where(and(...conditions)).orderBy(desc(workshopPayments.createdAt));
    }),

  paymentCreate: authedQuery
    .input(z.object({ jobCardId: z.number().optional(), estimateId: z.number().optional(), amount: z.string(), paymentMethod: z.string().optional(), referenceNumber: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workshopPayments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // ─── Stats ────────────────────────────────────────────
  workshopStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [activeJobs] = await db.select({ count: sql<number>`count(*)` }).from(workshopJobCards).where(and(eq(workshopJobCards.tenantId, tenantId), eq(workshopJobCards.status, "in_progress")));
      const [pendingJobs] = await db.select({ count: sql<number>`count(*)` }).from(workshopJobCards).where(and(eq(workshopJobCards.tenantId, tenantId), eq(workshopJobCards.status, "pending")));
      const [qcJobs] = await db.select({ count: sql<number>`count(*)` }).from(workshopJobCards).where(and(eq(workshopJobCards.tenantId, tenantId), eq(workshopJobCards.status, "quality_check")));
      const [completedToday] = await db.select({ count: sql<number>`count(*)` }).from(workshopJobCards).where(and(eq(workshopJobCards.tenantId, tenantId), eq(workshopJobCards.status, "completed"), gte(workshopJobCards.completionDate, sql`date('now')`)));
      const [totalVehicles] = await db.select({ count: sql<number>`count(*)` }).from(workshopVehicles).where(eq(workshopVehicles.tenantId, tenantId));
      const [totalTechs] = await db.select({ count: sql<number>`count(*)` }).from(workshopTechnicians).where(eq(workshopTechnicians.tenantId, tenantId));
      const [totalRevenue] = await db.select({ total: sql<string>`coalesce(sum(cast(amount as real)), '0')` }).from(workshopPayments).where(eq(workshopPayments.tenantId, tenantId));
      return {
        activeJobs: activeJobs.count, pendingJobs: pendingJobs.count,
        qualityCheck: qcJobs.count, completedToday: completedToday.count,
        totalVehicles: totalVehicles.count, totalTechnicians: totalTechs.count,
        totalRevenue: totalRevenue.total,
      };
    }),
});
