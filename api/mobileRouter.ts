import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, asc, sql } from "drizzle-orm";

export const mobileRouter = createRouter({
  // ── Approvals ──
  getPendingApprovals: authedQuery.input(z.object({ limit: z.number().default(20) })).query(async ({ input, ctx }) => {
    const db = getDb();
    return db.select().from(schema.approvalRequests).where(
      and(eq(schema.approvalRequests.tenantId, ctx.user.tenantId!), eq(schema.approvalRequests.status, "pending")),
    ).orderBy(desc(schema.approvalRequests.createdAt)).limit(input.limit);
  }),
  approveRequest: authedQuery
    .input(z.object({ requestId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(schema.approvalRequests).set({
        status: "approved", notes: input.notes,
      }).where(eq(schema.approvalRequests.id, input.requestId));
      return { success: true };
    }),
  rejectRequest: authedQuery
    .input(z.object({ requestId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(schema.approvalRequests).set({
        status: "rejected", notes: input.notes,
      }).where(eq(schema.approvalRequests.id, input.requestId));
      return { success: true };
    }),

  // ── Attendance (GPS Clock In/Out) ──
  clockIn: authedQuery
    .input(z.object({ employeeId: z.number(), latitude: z.number(), longitude: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const today = new Date().toISOString().split("T")[0];
      const existing = await db.select().from(schema.attendance).where(
        and(eq(schema.attendance.tenantId, ctx.user.tenantId!), eq(schema.attendance.employeeId, input.employeeId), eq(schema.attendance.date, today)),
      ).limit(1);
      if (existing.length > 0) throw new Error("Already clocked in today");
      const [att] = await db.insert(schema.attendance).values({
        tenantId: ctx.user.tenantId!, employeeId: input.employeeId,
        date: today, checkIn: new Date(), status: "present",
        notes: input.notes ? `GPS: ${input.latitude},${input.longitude} | ${input.notes}` : `GPS: ${input.latitude},${input.longitude}`,
      }).$returningId();
      return { id: att.id, success: true, checkIn: new Date() };
    }),
  clockOut: authedQuery
    .input(z.object({ employeeId: z.number(), latitude: z.number().optional(), longitude: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const today = new Date().toISOString().split("T")[0];
      const [record] = await db.select().from(schema.attendance).where(
        and(eq(schema.attendance.tenantId, ctx.user.tenantId!), eq(schema.attendance.employeeId, input.employeeId), eq(schema.attendance.date, today)),
      ).limit(1);
      if (!record) throw new Error("No clock-in record found for today");
      const checkIn = record.checkIn ? new Date(record.checkIn) : new Date();
      const diffMs = new Date().getTime() - checkIn.getTime();
      const workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      await db.update(schema.attendance).set({
        checkOut: new Date(), workHours: String(workHours),
      }).where(eq(schema.attendance.id, record.id));
      return { success: true, checkOut: new Date(), workHours };
    }),
  getTodayAttendance: authedQuery.input(z.object({ employeeId: z.number() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    const [record] = await db.select().from(schema.attendance).where(
      and(eq(schema.attendance.tenantId, ctx.user.tenantId!), eq(schema.attendance.employeeId, input.employeeId), eq(schema.attendance.date, today)),
    ).limit(1);
    return record ?? null;
  }),
  getMyAttendance: authedQuery
    .input(z.object({ employeeId: z.number(), from: z.string().optional(), to: z.string().optional(), limit: z.number().default(30) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.attendance.tenantId, ctx.user.tenantId!), eq(schema.attendance.employeeId, input.employeeId)];
      if (input.from) conditions.push(sql`date >= ${input.from}`);
      if (input.to) conditions.push(sql`date <= ${input.to}`);
      return db.select().from(schema.attendance).where(and(...conditions)).orderBy(desc(schema.attendance.date)).limit(input.limit);
    }),

  // ── Quick Sales ──
  quickSaleProducts: authedQuery
    .input(z.object({ search: z.string().optional(), limit: z.number().default(20), offset: z.number().default(0) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.products.tenantId, ctx.user.tenantId!), eq(schema.products.isActive, true)];
      if (input.search) conditions.push(sql`(name LIKE ${`%${input.search}%`} OR sku LIKE ${`%${input.search}%`} OR barcode LIKE ${`%${input.search}%`})`);
      return db.select({
        id: schema.products.id, sku: schema.products.sku, name: schema.products.name,
        nameAr: schema.products.nameAr, salePrice: schema.products.salePrice,
        image: schema.products.image,
      }).from(schema.products).where(and(...conditions)).limit(input.limit).offset(input.offset);
    }),
  quickSaleCreate: authedQuery
    .input(z.object({
      customerId: z.number().optional(), customerName: z.string().optional(),
      items: z.array(z.object({ productId: z.number(), quantity: z.number().min(1), unitPrice: z.number() })),
      paymentMethod: z.string().default("cash"), notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const orderNumber = `MOB-${Date.now()}`;
      const subTotal = input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      const orderIdResult = await db.execute(
        `INSERT INTO sales_orders (tenant_id, order_number, customer_id, date, sub_total, total_amount, status, created_by, created_at)
         VALUES (?, ?, ?, CURDATE(), ?, ?, 'confirmed', ?, NOW())`,
        [ctx.user.tenantId!, orderNumber, input.customerId ?? null, subTotal, subTotal, ctx.user.id],
      ) as any;
      const orderId = orderIdResult.insertId;
      for (const item of input.items) {
        await db.execute(
          `INSERT INTO sales_order_items (order_id, product_id, quantity, unit_price, total_amount)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice],
        );
      }
      return { orderId, orderNumber, success: true };
    }),
  getCustomers: authedQuery.input(z.object({ search: z.string().optional(), limit: z.number().default(20) })).query(async ({ input, ctx }) => {
    const db = getDb();
    const conditions = [eq(schema.customers.tenantId, ctx.user.tenantId!), eq(schema.customers.isActive, true)];
    if (input.search) conditions.push(sql`(name LIKE ${`%${input.search}%`} OR phone LIKE ${`%${input.search}%`})`);
    return db.select({ id: schema.customers.id, name: schema.customers.name, phone: schema.customers.phone }).from(schema.customers)
      .where(and(...conditions)).limit(input.limit);
  }),

  // ── Site Expenses ──
  submitSiteExpense: authedQuery
    .input(z.object({
      projectName: z.string(),
      category: z.string(),
      amount: z.number(),
      description: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      receiptImage: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const entryNumber = `EXP-${Date.now()}`;
      await db.insert(schema.journalEntries).values({
        tenantId: ctx.user.tenantId!,
        entryNumber,
        date: new Date().toISOString().split("T")[0],
        reference: `Site: ${input.projectName}`,
        description: `Site expense - ${input.category}: ${input.description || ""}`,
        totalDebit: String(input.amount),
        totalCredit: String(input.amount),
        isPosted: true,
        referenceType: "other",
        createdBy: ctx.user.id,
      });
      return { success: true, entryNumber };
    }),

  getMySiteExpenses: authedQuery
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select({
        id: schema.journalEntries.id,
        entryNumber: schema.journalEntries.entryNumber,
        date: schema.journalEntries.date,
        reference: schema.journalEntries.reference,
        description: schema.journalEntries.description,
        totalDebit: schema.journalEntries.totalDebit,
        createdAt: schema.journalEntries.createdAt,
      })
        .from(schema.journalEntries)
        .where(and(
          eq(schema.journalEntries.tenantId, ctx.user.tenantId!),
          eq(schema.journalEntries.createdBy, ctx.user.id!),
          sql`${schema.journalEntries.reference} LIKE 'Site:%'`,
        ))
        .orderBy(desc(schema.journalEntries.createdAt))
        .limit(input.limit);
    }),

  // ── Mobile Dashboard ──
  getDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const today = new Date().toISOString().split("T")[0];
    const todaySales = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM sales_orders WHERE tenant_id = ? AND DATE(created_at) = ? AND status != 'cancelled'`,
      [tenantId, today],
    ) as any;
    const pendingApprovals = await db.select({ count: sql<number>`count(*)` }).from(schema.approvalRequests)
      .where(and(eq(schema.approvalRequests.tenantId, tenantId), eq(schema.approvalRequests.status, "pending")));
    const notifications = await db.select({ count: sql<number>`count(*)` }).from(schema.notifications)
      .where(and(eq(schema.notifications.tenantId, tenantId), eq(schema.notifications.userId, ctx.user.id), eq(schema.notifications.isRead, false)));
    const todayAttendance = await db.execute(
      `SELECT COUNT(*) as count FROM attendance WHERE tenant_id = ? AND date = ? AND status = 'present'`,
      [tenantId, today],
    ) as any;
    return {
      todaySalesAmount: Number(todaySales[0]?.total ?? 0),
      pendingApprovals: Number(pendingApprovals[0]?.count ?? 0),
      unreadNotifications: Number(notifications[0]?.count ?? 0),
      todayPresent: Number(todayAttendance[0]?.count ?? 0),
    };
  }),
});
