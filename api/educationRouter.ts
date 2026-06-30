import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { students, admissions, feeStructures, studentFeeInvoices, classTimetables, studentAttendance, reportCards } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const educationRouter = createRouter({
  studentList: authedQuery
    .input(z.object({ grade: z.string().optional(), status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(students.tenantId, ctx.user.tenantId!)];
      if (input?.grade) conditions.push(eq(students.grade, input.grade));
      if (input?.status) conditions.push(eq(students.status, input.status as any));
      return db.select().from(students).where(and(...conditions)).orderBy(desc(students.createdAt));
    }),

  studentCreate: authedQuery
    .input(z.object({
      studentNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(["male", "female"]).optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      guardianName: z.string().optional(),
      guardianPhone: z.string().optional(),
      guardianEmail: z.string().optional(),
      grade: z.string().optional(),
      section: z.string().optional(),
      academicYear: z.string().optional(),
      enrollmentDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(students).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  admissionList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(admissions.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(admissions.status, input.status as any));
      return db.select().from(admissions).where(and(...conditions)).orderBy(desc(admissions.createdAt));
    }),

  admissionCreate: authedQuery
    .input(z.object({
      admissionNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(["male", "female"]).optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      guardianName: z.string().optional(),
      guardianPhone: z.string().optional(),
      guardianEmail: z.string().optional(),
      applyingForGrade: z.string().optional(),
      previousSchool: z.string().optional(),
      academicYear: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(admissions).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  feeStructureList: authedQuery
    .input(z.object({ grade: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(feeStructures.tenantId, ctx.user.tenantId!)];
      if (input?.grade) conditions.push(eq(feeStructures.grade, input.grade));
      return db.select().from(feeStructures).where(and(...conditions));
    }),

  feeInvoiceList: authedQuery
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(studentFeeInvoices.tenantId, ctx.user.tenantId!)];
      if (input?.studentId) conditions.push(eq(studentFeeInvoices.studentId, input.studentId));
      return db.select().from(studentFeeInvoices).where(and(...conditions)).orderBy(desc(studentFeeInvoices.createdAt));
    }),

  classTimetableList: authedQuery
    .input(z.object({ grade: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(classTimetables.tenantId, ctx.user.tenantId!)];
      if (input?.grade) conditions.push(eq(classTimetables.grade, input.grade));
      return db.select().from(classTimetables).where(and(...conditions));
    }),

  attendanceList: authedQuery
    .input(z.object({ studentId: z.number().optional(), date: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(studentAttendance.tenantId, ctx.user.tenantId!)];
      if (input?.studentId) conditions.push(eq(studentAttendance.studentId, input.studentId));
      if (input?.date) conditions.push(eq(studentAttendance.date, input.date));
      return db.select().from(studentAttendance).where(and(...conditions)).orderBy(desc(studentAttendance.date));
    }),

  attendanceCreate: authedQuery
    .input(z.object({
      studentId: z.number(),
      date: z.string(),
      status: z.enum(["present", "absent", "late", "excused", "holiday"]).optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(studentAttendance).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  reportCardList: authedQuery
    .input(z.object({ studentId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(reportCards.tenantId, ctx.user.tenantId!)];
      if (input?.studentId) conditions.push(eq(reportCards.studentId, input.studentId));
      return db.select().from(reportCards).where(and(...conditions));
    }),

  educationStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [totalStudents] = await db.select({ count: sql<number>`count(*)` }).from(students).where(eq(students.tenantId, tenantId));
      const [pendingAdmissions] = await db.select({ count: sql<number>`count(*)` }).from(admissions).where(and(eq(admissions.tenantId, tenantId), eq(admissions.status, "applied")));
      const [todayAttendance] = await db.select({ count: sql<number>`count(*)` }).from(studentAttendance).where(and(eq(studentAttendance.tenantId, tenantId), eq(studentAttendance.date, sql`curdate()`)));
      return { totalStudents: totalStudents.count, pendingAdmissions: pendingAdmissions.count, todayAttendance: todayAttendance.count };
    }),
});
