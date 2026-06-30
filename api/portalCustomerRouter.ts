import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  invoices, invoiceItems, customerPayments,
  salesOrders, salesOrderItems,
  supportTickets, ticketComments,
  customers, companySettings,
} from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

const db = getDb();

async function getSession(token: string) {
  const [rows] = await db.execute(sql`
    SELECT ps.*, pu.* FROM portal_sessions ps
    JOIN portal_users pu ON pu.id = ps.portal_user_id
    WHERE ps.token = ${token} AND ps.expires_at > NOW()
    LIMIT 1
  `);
  return (rows as any[])?.[0] || null;
}

export const portalCustomerRouter = createRouter({
  dashboard: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const tenantId = session.tenant_id;
      const customerId = session.reference_id;

      const customer = await db.query.customers.findFirst({ where: eq(customers.id, customerId) });
      const recentInvoices = await db.select().from(invoices)
        .where(and(eq(invoices.tenantId, tenantId), eq(invoices.customerId, customerId)))
        .orderBy(desc(invoices.createdAt)).limit(5);
      const recentOrders = await db.select().from(salesOrders)
        .where(and(eq(salesOrders.tenantId, tenantId), eq(salesOrders.customerId, customerId)))
        .orderBy(desc(salesOrders.createdAt)).limit(5);
      const openTickets = await db.select({ count: sql<number>`count(*)` }).from(supportTickets)
        .where(and(eq(supportTickets.tenantId, tenantId), eq(supportTickets.status, "open"), eq(supportTickets.source, "web")));

      const invoiceStats = await db.select({
        total: sql<number>`count(*)`,
        paid: sql<number>`sum(case when status = 'paid' then 1 else 0 end)`,
        overdue: sql<number>`sum(case when status = 'overdue' then 1 else 0 end)`,
        totalAmount: sql<number>`coalesce(sum(total_amount), 0)`,
        paidAmount: sql<number>`coalesce(sum(paid_amount), 0)`,
      }).from(invoices).where(and(eq(invoices.tenantId, tenantId), eq(invoices.customerId, customerId)));

      return { customer, recentInvoices, recentOrders, openTickets: openTickets[0]?.count || 0, stats: invoiceStats[0] };
    }),

  invoiceList: publicQuery
    .input(z.object({ token: z.string(), status: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const conditions = [eq(invoices.tenantId, session.tenant_id), eq(invoices.customerId, session.reference_id)];
      if (input.status) conditions.push(eq(invoices.status, input.status as any));
      return db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.createdAt));
    }),

  invoiceGet: publicQuery
    .input(z.object({ token: z.string(), id: z.number() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const invoice = await db.query.invoices.findFirst({ where: eq(invoices.id, input.id) });
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, input.id));
      const company = await db.query.companySettings.findFirst({ where: eq(companySettings.tenantId, session.tenant_id) });
      return { invoice, items, company };
    }),

  paymentList: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      return db.select().from(customerPayments)
        .where(and(eq(customerPayments.tenantId, session.tenant_id), eq(customerPayments.customerId, session.reference_id)))
        .orderBy(desc(customerPayments.createdAt));
    }),

  initiatePayment: publicQuery
    .input(z.object({
      token: z.string(), invoiceId: z.number(), amount: z.string(),
      paymentMethod: z.enum(["card", "bank_transfer", "online"]),
    }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const paymentNumber = `ONL-${Date.now().toString().slice(-8)}`;
      const [{ id }] = await db.insert(customerPayments).values({
        tenantId: session.tenant_id,
        paymentNumber,
        customerId: session.reference_id,
        invoiceId: input.invoiceId,
        date: new Date().toISOString().slice(0, 10),
        amount: input.amount,
        paymentMethod: input.paymentMethod as any,
        notes: "Online payment via customer portal",
      }).$returningId();
      return { id, paymentNumber, redirectUrl: `/portal/payment-gateway/${id}?method=${input.paymentMethod}&amount=${input.amount}`, message: "Payment initiated" };
    }),

  orderList: publicQuery
    .input(z.object({ token: z.string(), status: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const conditions = [eq(salesOrders.tenantId, session.tenant_id), eq(salesOrders.customerId, session.reference_id)];
      if (input.status) conditions.push(eq(salesOrders.status, input.status as any));
      return db.select().from(salesOrders).where(and(...conditions)).orderBy(desc(salesOrders.createdAt));
    }),

  orderGet: publicQuery
    .input(z.object({ token: z.string(), id: z.number() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const order = await db.query.salesOrders.findFirst({ where: eq(salesOrders.id, input.id) });
      const items = await db.select().from(salesOrderItems).where(eq(salesOrderItems.orderId, input.id));
      return { order, items };
    }),

  ticketList: publicQuery
    .input(z.object({ token: z.string(), status: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const customer = await db.query.customers.findFirst({ where: eq(customers.id, session.reference_id) });
      const conditions = [eq(supportTickets.tenantId, session.tenant_id), eq(supportTickets.requesterEmail, customer?.email || "")];
      if (input.status) conditions.push(eq(supportTickets.status, input.status as any));
      return db.select().from(supportTickets).where(and(...conditions)).orderBy(desc(supportTickets.createdAt));
    }),

  ticketCreate: publicQuery
    .input(z.object({ token: z.string(), subject: z.string(), description: z.string(), priority: z.enum(["low", "medium", "high", "urgent"]).optional() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const customer = await db.query.customers.findFirst({ where: eq(customers.id, session.reference_id) });
      const ticketNumber = `PTK-${Date.now().toString().slice(-6)}`;
      const [{ id }] = await db.insert(supportTickets).values({
        tenantId: session.tenant_id,
        ticketNumber,
        subject: input.subject,
        description: input.description,
        priority: input.priority || "medium",
        requesterName: session.name,
        requesterEmail: customer?.email || session.email,
        requesterPhone: customer?.phone || "",
        source: "web",
      }).$returningId();
      return { id, ticketNumber, success: true };
    }),

  ticketComments: publicQuery
    .input(z.object({ token: z.string(), ticketId: z.number() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      return db.select().from(ticketComments)
        .where(and(eq(ticketComments.ticketId, input.ticketId), eq(ticketComments.isInternal, false)))
        .orderBy(ticketComments.createdAt);
    }),

  addComment: publicQuery
    .input(z.object({ token: z.string(), ticketId: z.number(), comment: z.string() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const [{ id }] = await db.insert(ticketComments).values({
        ticketId: input.ticketId,
        comment: input.comment,
        isInternal: false,
      }).$returningId();
      return { id, success: true };
    }),

  profile: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const customer = await db.query.customers.findFirst({ where: eq(customers.id, session.reference_id) });
      return { portalUser: { id: session.id, name: session.name, email: session.email, portalType: session.portal_type }, customer };
    }),

  profileUpdate: publicQuery
    .input(z.object({ token: z.string(), name: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), address: z.string().optional(), city: z.string().optional() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.phone) updateData.phone = input.phone;
      if (input.email) updateData.email = input.email;
      if (input.address) updateData.address = input.address;
      if (input.city) updateData.city = input.city;
      if (Object.keys(updateData).length > 0) {
        await db.update(customers).set(updateData).where(eq(customers.id, session.reference_id));
        if (input.name) await db.execute(sql`UPDATE portal_users SET name = ${input.name} WHERE id = ${session.id}`);
      }
      return { success: true };
    }),

  messages: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const [rows] = await db.execute(sql`
        SELECT * FROM portal_messages
        WHERE tenant_id = ${session.tenant_id} AND receiver_type = 'customer' AND receiver_id = ${session.reference_id}
        ORDER BY created_at DESC
      `);
      return rows;
    }),
});
