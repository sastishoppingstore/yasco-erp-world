import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { 
  patients, appointments, doctorRosters, insuranceClaimsHealthcare
} from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const healthcareCompleteRouter = createRouter({
  // PATIENTS
  patientList: authedQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(patients.tenantId, ctx.user.tenantId!)];
      if (input?.search) {
        conditions.push(sql`(${patients.firstName} LIKE ${'%' + input.search + '%'} OR ${patients.phone} LIKE ${'%' + input.search + '%'})`);
      }
      return db.select().from(patients).where(and(...conditions)).orderBy(desc(patients.createdAt)).limit(100);
    }),

  patientCreate: authedQuery
    .input(z.object({
      patientNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      bloodGroup: z.string().optional(),
      allergies: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insurancePolicyNumber: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(patients).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // APPOINTMENTS
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
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(appointments).values({ ...input, tenantId: ctx.user.tenantId!, createdBy: ctx.user.id }).$returningId();
      return { id, success: true };
    }),

  // DOCTORS
  doctorList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(doctorRosters).where(eq(doctorRosters.tenantId, ctx.user.tenantId!));
    }),

  // INSURANCE CLAIMS
  claimList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(insuranceClaimsHealthcare.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(insuranceClaimsHealthcare.status, input.status as any));
      return db.select().from(insuranceClaimsHealthcare).where(and(...conditions));
    }),

  claimCreate: authedQuery
    .input(z.object({
      patientId: z.number(),
      claimNumber: z.string(),
      insuranceProvider: z.string(),
      claimAmount: z.string(),
      diagnosis: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(insuranceClaimsHealthcare).values({ ...input, tenantId: ctx.user.tenantId!, createdBy: ctx.user.id }).$returningId();
      return { id, success: true };
    }),

  // STATS
  stats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [totalPatients] = await db.select({ count: sql<number>`count(*)` }).from(patients).where(eq(patients.tenantId, tenantId));
      const [todayAppointments] = await db.select({ count: sql<number>`count(*)` }).from(appointments).where(and(eq(appointments.tenantId, tenantId), eq(appointments.appointmentDate, sql`curdate()`)));
      return { totalPatients: totalPatients.count, todayAppointments: todayAppointments.count };
    }),
});
