import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { patients, appointments, doctorRosters, insuranceClaimsHealthcare, labOrders, pharmacyIntegration } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const healthcareRouter = createRouter({
  patientList: authedQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(patients.tenantId, ctx.user.tenantId!)];
      if (input?.search) conditions.push(eq(patients.phone, input.search));
      return db.select().from(patients).where(and(...conditions)).orderBy(desc(patients.createdAt));
    }),

  patientGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.patients.findFirst({ where: eq(patients.id, input.id) });
    }),

  patientCreate: authedQuery
    .input(z.object({
      patientNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      address: z.string().optional(),
      bloodGroup: z.string().optional(),
      allergies: z.string().optional(),
      medicalHistory: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      nationalId: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insurancePolicyNumber: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(patients).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  appointmentList: authedQuery
    .input(z.object({ patientId: z.number().optional(), date: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(appointments.tenantId, ctx.user.tenantId!)];
      if (input?.patientId) conditions.push(eq(appointments.patientId, input.patientId));
      if (input?.date) conditions.push(eq(appointments.appointmentDate, input.date));
      return db.select().from(appointments).where(and(...conditions)).orderBy(desc(appointments.appointmentDate));
    }),

  appointmentCreate: authedQuery
    .input(z.object({
      patientId: z.number(),
      doctorId: z.number().optional(),
      appointmentNumber: z.string(),
      appointmentDate: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      appointmentType: z.enum(["consultation", "follow_up", "emergency", "checkup", "procedure", "vaccination"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(appointments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  doctorRosterList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(doctorRosters).where(eq(doctorRosters.tenantId, ctx.user.tenantId!));
    }),

  doctorRosterCreate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      specialization: z.string().optional(),
      licenseNumber: z.string().optional(),
      consultationFee: z.string().optional(),
      maxPatientsPerDay: z.number().optional(),
      workingDays: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(doctorRosters).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  insuranceClaimList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(insuranceClaimsHealthcare.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(insuranceClaimsHealthcare.status, input.status as any));
      return db.select().from(insuranceClaimsHealthcare).where(and(...conditions)).orderBy(desc(insuranceClaimsHealthcare.createdAt));
    }),

  insuranceClaimCreate: authedQuery
    .input(z.object({
      patientId: z.number(),
      claimNumber: z.string(),
      insuranceProvider: z.string(),
      policyNumber: z.string().optional(),
      claimAmount: z.string().optional(),
      diagnosis: z.string().optional(),
      treatment: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(insuranceClaimsHealthcare).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  labOrderList: authedQuery
    .input(z.object({ patientId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(labOrders.tenantId, ctx.user.tenantId!)];
      if (input?.patientId) conditions.push(eq(labOrders.patientId, input.patientId));
      return db.select().from(labOrders).where(and(...conditions)).orderBy(desc(labOrders.orderDate));
    }),

  pharmacyList: authedQuery
    .input(z.object({ patientId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(pharmacyIntegration.tenantId, ctx.user.tenantId!)];
      if (input?.patientId) conditions.push(eq(pharmacyIntegration.patientId, input.patientId));
      return db.select().from(pharmacyIntegration).where(and(...conditions));
    }),

  healthcareStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [totalPatients] = await db.select({ count: sql<number>`count(*)` }).from(patients).where(eq(patients.tenantId, tenantId));
      const [todayAppointments] = await db.select({ count: sql<number>`count(*)` }).from(appointments).where(and(eq(appointments.tenantId, tenantId), eq(appointments.appointmentDate, sql`curdate()`)));
      const [pendingClaims] = await db.select({ count: sql<number>`count(*)` }).from(insuranceClaimsHealthcare).where(and(eq(insuranceClaimsHealthcare.tenantId, tenantId), eq(insuranceClaimsHealthcare.status, "submitted")));
      return { totalPatients: totalPatients.count, todayAppointments: todayAppointments.count, pendingClaims: pendingClaims.count };
    }),
});
