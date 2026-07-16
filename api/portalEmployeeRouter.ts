import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  employees, salarySlips, payrollPeriods,
  leaveRequests, leaveTypes, attendance,
  departments, designations,
} from "@db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

async function getSession(token: string) {
  const db = getDb();
  const [rows] = await db.execute(sql`
    SELECT ps.*, pu.* FROM portal_sessions ps
    JOIN portal_users pu ON pu.id = ps.portal_user_id
    WHERE ps.token = ${token} AND ps.expires_at > NOW()
    LIMIT 1
  `);
  return (rows as any[])?.[0] || null;
}

const db = getDb();

export const portalEmployeeRouter = createRouter({
  dashboard: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const tenantId = session.tenant_id;
      const employeeId = session.reference_id;

      const employee = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
      const latestSlip = await db.select().from(salarySlips)
        .where(and(eq(salarySlips.tenantId, tenantId), eq(salarySlips.employeeId, employeeId)))
        .orderBy(desc(salarySlips.createdAt)).limit(1);

      const [pendingLeave] = await db.select({ count: sql<number>`count(*)` }).from(leaveRequests)
        .where(and(eq(leaveRequests.tenantId, tenantId), eq(leaveRequests.employeeId, employeeId), eq(leaveRequests.status, "pending")));

      const todayAttendance = await db.select().from(attendance)
        .where(and(eq(attendance.tenantId, tenantId), eq(attendance.employeeId, employeeId), eq(attendance.date, new Date().toISOString().slice(0, 10))));

      const leaveBalance = await db.select({ typeId: leaveTypes.id, typeName: leaveTypes.name, daysAllowed: leaveTypes.daysAllowed })
        .from(leaveTypes).where(eq(leaveTypes.tenantId, tenantId));

      const usedLeaves = await db.select({
        typeId: leaveRequests.leaveTypeId,
        used: sql<number>`coalesce(sum(days), 0)`,
      }).from(leaveRequests)
        .where(and(eq(leaveRequests.tenantId, tenantId), eq(leaveRequests.employeeId, employeeId), eq(leaveRequests.status, "approved")))
        .groupBy(leaveRequests.leaveTypeId);

      const usedMap = Object.fromEntries(usedLeaves.map((l: any) => [l.typeId, l.used]));

      return {
        employee,
        latestSlip: latestSlip[0] || null,
        pendingLeaves: pendingLeave?.count || 0,
        todayAttendance: todayAttendance[0] || null,
        leaveBalances: leaveBalance.map((lb: any) => ({
          ...lb,
          used: usedMap[lb.typeId] || 0,
          remaining: (lb.daysAllowed || 0) - (usedMap[lb.typeId] || 0),
        })),
      };
    }),

  payslipList: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const slips = await db.select().from(salarySlips)
        .where(and(eq(salarySlips.tenantId, session.tenant_id), eq(salarySlips.employeeId, session.reference_id)))
        .orderBy(desc(salarySlips.createdAt));
      const periods = await db.select().from(payrollPeriods).where(eq(payrollPeriods.tenantId, session.tenant_id));
      return slips.map((slip: any) => ({ ...slip, period: periods.find((p: any) => p.id === slip.payrollPeriodId) }));
    }),

  payslipGet: publicQuery
    .input(z.object({ token: z.string(), id: z.number() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const slip = await db.query.salarySlips.findFirst({ where: eq(salarySlips.id, input.id) });
      const period = slip ? await db.query.payrollPeriods.findFirst({ where: eq(payrollPeriods.id, slip.payrollPeriodId) }) : null;
      const employee = await db.query.employees.findFirst({ where: eq(employees.id, slip?.employeeId) });
      return { slip, period, employee };
    }),

  leaveRequestList: publicQuery
    .input(z.object({ token: z.string(), status: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const conditions = [eq(leaveRequests.tenantId, session.tenant_id), eq(leaveRequests.employeeId, session.reference_id)];
      if (input.status) conditions.push(eq(leaveRequests.status, input.status as any));
      const requests = await db.select().from(leaveRequests).where(and(...conditions)).orderBy(desc(leaveRequests.createdAt));
      const types = await db.select().from(leaveTypes).where(eq(leaveTypes.tenantId, session.tenant_id));
      return requests.map((lr: any) => ({ ...lr, leaveType: types.find((t: any) => t.id === lr.leaveTypeId) }));
    }),

  leaveRequestCreate: publicQuery
    .input(z.object({ token: z.string(), leaveTypeId: z.number(), startDate: z.string(), endDate: z.string(), days: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const [{ id }] = await db.insert(leaveRequests).values({
        tenantId: session.tenant_id,
        employeeId: session.reference_id,
        leaveTypeId: input.leaveTypeId,
        startDate: input.startDate,
        endDate: input.endDate,
        days: input.days,
        reason: input.reason,
        status: "pending",
      }).$returningId();
      return { id, success: true };
    }),

  leaveRequestCancel: publicQuery
    .input(z.object({ token: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      await db.update(leaveRequests).set({ status: "cancelled" })
        .where(and(eq(leaveRequests.id, input.id), eq(leaveRequests.employeeId, session.reference_id)));
      return { success: true };
    }),

  attendanceList: publicQuery
    .input(z.object({ token: z.string(), limit: z.number().default(30) }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      return db.select().from(attendance)
        .where(and(eq(attendance.tenantId, session.tenant_id), eq(attendance.employeeId, session.reference_id)))
        .orderBy(desc(attendance.date)).limit(input.limit);
    }),

  attendanceStats: publicQuery
    .input(z.object({ token: z.string(), month: z.number().optional(), year: z.number().optional() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const now = new Date();
      const year = input.year || now.getFullYear();
      const month = input.month || now.getMonth() + 1;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const records = await db.select().from(attendance)
        .where(and(
          eq(attendance.tenantId, session.tenant_id),
          eq(attendance.employeeId, session.reference_id),
          gte(attendance.date as any, startDate),
          lte(attendance.date as any, `${year}-${String(month).padStart(2, "0")}-31`),
        ));

      const present = records.filter((r: any) => r.status === "present" || r.status === "late").length;
      const absent = records.filter((r: any) => r.status === "absent").length;
      const late = records.filter((r: any) => r.status === "late").length;
      const onLeave = records.filter((r: any) => r.status === "on_leave").length;
      const totalHours = records.reduce((sum: number, r: any) => sum + Number(r.workHours || 0), 0);

      return { total: records.length, present, absent, late, onLeave, totalHours };
    }),

  documentList: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const [rows] = await db.execute(sql`
        SELECT * FROM portal_documents
        WHERE tenant_id = ${session.tenant_id} AND portal_type = 'employee' AND reference_id = ${session.reference_id}
        ORDER BY created_at DESC
      `);
      return rows;
    }),

  documentUpload: publicQuery
    .input(z.object({ token: z.string(), name: z.string(), category: z.string(), fileUrl: z.string(), fileSize: z.number().optional(), mimeType: z.string().optional() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const [result] = await db.execute(sql`
        INSERT INTO portal_documents (tenant_id, portal_type, reference_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by)
        VALUES (${session.tenant_id}, 'employee', ${session.reference_id}, ${input.category}, ${input.name}, ${input.fileUrl}, ${input.fileSize || 0}, ${input.mimeType || "application/octet-stream"}, ${session.id})
      `);
      return { success: true };
    }),

  profile: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const employee = await db.query.employees.findFirst({ where: eq(employees.id, session.reference_id) });
      const department = employee ? await db.query.departments.findFirst({ where: eq(departments.id, employee.departmentId) }) : null;
      const designation = employee ? await db.query.designations.findFirst({ where: eq(designations.id, employee.designationId) }) : null;
      return { portalUser: { id: session.id, name: session.name, email: session.email, portalType: session.portal_type }, employee, department, designation };
    }),

  profileUpdate: publicQuery
    .input(z.object({ token: z.string(), phone: z.string().optional(), mobile: z.string().optional(), address: z.string().optional(), emergencyContact: z.string().optional(), emergencyPhone: z.string().optional() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const updateData: any = {};
      if (input.phone) updateData.phone = input.phone;
      if (input.mobile) updateData.mobile = input.mobile;
      if (input.address) updateData.address = input.address;
      if (input.emergencyContact) updateData.emergencyContact = input.emergencyContact;
      if (input.emergencyPhone) updateData.emergencyPhone = input.emergencyPhone;
      if (Object.keys(updateData).length > 0) {
        await db.update(employees).set(updateData).where(eq(employees.id, session.reference_id));
      }
      return { success: true };
    }),
});
