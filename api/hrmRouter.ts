import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  departments, designations, employees, attendance,
  leaveTypes, leaveRequests, payrollPeriods, salarySlips,
  employeeLoans, advances, performanceReviews
} from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

function combineDateTime(dateValue: string, timeValue?: string) {
  if (!timeValue) return undefined;
  return new Date(`${dateValue}T${timeValue}:00`);
}

export const hrmRouter = createRouter({
  // Departments
  departmentList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(departments).where(eq(departments.tenantId, ctx.user.tenantId!));
    }),

  departmentCreate: authedQuery
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(departments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Designations
  designationList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(designations).where(eq(designations.tenantId, ctx.user.tenantId!));
    }),

  designationCreate: authedQuery
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(designations).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Employees
  employeeList: authedQuery
    .input(z.object({
      departmentId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(employees.tenantId, tenantId)];
      if (input?.departmentId) conditions.push(eq(employees.departmentId, input.departmentId));
      if (input?.status) conditions.push(eq(employees.status, input.status as any));
      return db.select().from(employees).where(and(...conditions)).orderBy(desc(employees.createdAt));
    }),

  employeeGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const employee = await db.query.employees.findFirst({ where: eq(employees.id, input.id) });
      return { employee };
    }),

  employeeCreate: authedQuery
    .input(z.object({
      employeeCode: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      gender: z.enum(["male", "female"]).optional(),
      dateOfBirth: z.string().optional(),
      hireDate: z.string(),
      departmentId: z.number().optional(),
      designationId: z.number().optional(),
      employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).optional(),
      basicSalary: z.string().optional(),
      housingAllowance: z.string().optional(),
      transportAllowance: z.string().optional(),
      otherAllowance: z.string().optional(),
      bankName: z.string().optional(),
      bankAccount: z.string().optional(),
      bankIban: z.string().optional(),
      address: z.string().optional(),
      emergencyContact: z.string().optional(),
      emergencyPhone: z.string().optional(),
      passportNumber: z.string().optional(),
      nationalId: z.string().optional(),
      nationality: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(employees).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  employeeUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      departmentId: z.number().optional(),
      designationId: z.number().optional(),
      status: z.enum(["active", "on_leave", "terminated", "resigned", "suspended"]).optional(),
      basicSalary: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(employees).set(data).where(eq(employees.id, id));
      return { success: true };
    }),

  // Attendance
  attendanceList: authedQuery
    .input(z.object({
      employeeId: z.number().optional(),
      date: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(attendance.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(attendance.employeeId, input.employeeId));
      if (input?.date) conditions.push(eq(attendance.date, input.date));
      return db.select().from(attendance).where(and(...conditions)).orderBy(desc(attendance.date));
    }),

  attendanceCreate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      date: z.string(),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
      status: z.enum(["present", "absent", "late", "half_day", "on_leave", "holiday"]).optional(),
      workHours: z.string().optional(),
      overtimeHours: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(attendance).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        checkIn: combineDateTime(input.date, input.checkIn),
        checkOut: combineDateTime(input.date, input.checkOut),
      }).$returningId();
      return { id, success: true };
    }),

  // Leave Types
  leaveTypeList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(leaveTypes).where(eq(leaveTypes.tenantId, ctx.user.tenantId!));
    }),

  leaveTypeCreate: authedQuery
    .input(z.object({ name: z.string(), daysAllowed: z.number().optional(), isPaid: z.boolean().optional(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(leaveTypes).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Leave Requests
  leaveRequestList: authedQuery
    .input(z.object({
      employeeId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(leaveRequests.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(leaveRequests.employeeId, input.employeeId));
      if (input?.status) conditions.push(eq(leaveRequests.status, input.status as any));
      return db.select().from(leaveRequests).where(and(...conditions)).orderBy(desc(leaveRequests.createdAt));
    }),

  leaveRequestCreate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      leaveTypeId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      days: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(leaveRequests).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  leaveRequestUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected", "cancelled"]),
      approvedBy: z.number().optional(),
      rejectionReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData = {
        ...data,
        approvedAt: data.status === "approved" ? new Date() : undefined,
      };
      await db.update(leaveRequests).set(updateData).where(eq(leaveRequests.id, id));
      return { success: true };
    }),

  // Payroll Periods
  payrollPeriodList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(payrollPeriods).where(eq(payrollPeriods.tenantId, ctx.user.tenantId!));
    }),

  payrollPeriodCreate: authedQuery
    .input(z.object({
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      month: z.number(),
      year: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(payrollPeriods).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Salary Slips
  salarySlipList: authedQuery
    .input(z.object({
      payrollPeriodId: z.number().optional(),
      employeeId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(salarySlips.tenantId, tenantId)];
      if (input?.payrollPeriodId) conditions.push(eq(salarySlips.payrollPeriodId, input.payrollPeriodId));
      if (input?.employeeId) conditions.push(eq(salarySlips.employeeId, input.employeeId));
      return db.select().from(salarySlips).where(and(...conditions));
    }),

  salarySlipCreate: authedQuery
    .input(z.object({
      payrollPeriodId: z.number(),
      employeeId: z.number(),
      basicSalary: z.string().optional(),
      housingAllowance: z.string().optional(),
      transportAllowance: z.string().optional(),
      otherAllowances: z.string().optional(),
      overtimePay: z.string().optional(),
      grossSalary: z.string().optional(),
      taxDeduction: z.string().optional(),
      socialInsurance: z.string().optional(),
      loanDeduction: z.string().optional(),
      advanceDeduction: z.string().optional(),
      otherDeductions: z.string().optional(),
      totalDeductions: z.string().optional(),
      netSalary: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(salarySlips).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Employee Loans
  loanList: authedQuery
    .input(z.object({
      employeeId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(employeeLoans.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(employeeLoans.employeeId, input.employeeId));
      if (input?.status) conditions.push(eq(employeeLoans.status, input.status as any));
      return db.select().from(employeeLoans).where(and(...conditions));
    }),

  loanCreate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      loanAmount: z.string(),
      installments: z.number().optional(),
      installmentAmount: z.string().optional(),
      purpose: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(employeeLoans).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        remainingAmount: input.loanAmount,
      }).$returningId();
      return { id, success: true };
    }),

  // Advances
  advanceList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(advances).where(eq(advances.tenantId, ctx.user.tenantId!));
    }),

  // Performance Reviews
  performanceReviewList: authedQuery
    .input(z.object({
      employeeId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(performanceReviews.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(performanceReviews.employeeId, input.employeeId));
      return db.select().from(performanceReviews).where(and(...conditions));
    }),

  performanceReviewCreate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      reviewPeriod: z.string(),
      reviewDate: z.string(),
      overallRating: z.number().optional(),
      goalsAchieved: z.number().optional(),
      skillsRating: z.number().optional(),
      attendanceRating: z.number().optional(),
      teamworkRating: z.number().optional(),
      comments: z.string().optional(),
      goals: z.string().optional(),
      reviewedBy: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(performanceReviews).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // HRM Stats
  hrmStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const [totalEmployees] = await db.select({ count: sql<number>`count(*)` }).from(employees).where(eq(employees.tenantId, tenantId));
      const [activeEmployees] = await db.select({ count: sql<number>`count(*)` }).from(employees).where(and(eq(employees.tenantId, tenantId), eq(employees.status, "active")));
      const [onLeave] = await db.select({ count: sql<number>`count(*)` }).from(employees).where(and(eq(employees.tenantId, tenantId), eq(employees.status, "on_leave")));
      const [pendingLeaves] = await db.select({ count: sql<number>`count(*)` }).from(leaveRequests).where(and(eq(leaveRequests.tenantId, tenantId), eq(leaveRequests.status, "pending")));
      const [pendingLoans] = await db.select({ count: sql<number>`count(*)` }).from(employeeLoans).where(and(eq(employeeLoans.tenantId, tenantId), eq(employeeLoans.status, "pending")));

      return {
        totalEmployees: totalEmployees.count,
        activeEmployees: activeEmployees.count,
        onLeave: onLeave.count,
        pendingLeaves: pendingLeaves.count,
        pendingLoans: pendingLoans.count,
      };
    }),
});
