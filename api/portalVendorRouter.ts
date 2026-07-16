import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  purchaseOrders, purchaseOrderItems,
  supplierPayments, invoices,
  suppliers,
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

export const portalVendorRouter = createRouter({
  dashboard: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const tenantId = session.tenant_id;
      const supplierId = session.reference_id;

      const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, supplierId) });
      const recentPOs = await db.select().from(purchaseOrders)
        .where(and(eq(purchaseOrders.tenantId, tenantId), eq(purchaseOrders.supplierId, supplierId)))
        .orderBy(desc(purchaseOrders.createdAt)).limit(5);
      const recentPayments = await db.select().from(supplierPayments)
        .where(and(eq(supplierPayments.tenantId, tenantId), eq(supplierPayments.supplierId, supplierId)))
        .orderBy(desc(supplierPayments.createdAt)).limit(5);

      const poStats = await db.select({
        total: sql<number>`count(*)`,
        pending: sql<number>`sum(case when status = 'sent' then 1 else 0 end)`,
        completed: sql<number>`sum(case when status in ('received','completed') then 1 else 0 end)`,
        totalAmount: sql<number>`coalesce(sum(total_amount), 0)`,
      }).from(purchaseOrders).where(and(eq(purchaseOrders.tenantId, tenantId), eq(purchaseOrders.supplierId, supplierId)));

      const [paymentStats] = await db.select({ totalPaid: sql<number>`coalesce(sum(amount), 0)` }).from(supplierPayments)
        .where(and(eq(supplierPayments.tenantId, tenantId), eq(supplierPayments.supplierId, supplierId)));

      return { supplier, recentPOs, recentPayments, stats: poStats[0], totalPaid: paymentStats?.totalPaid || 0 };
    }),

  poList: publicQuery
    .input(z.object({ token: z.string(), status: z.string().optional() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const conditions = [eq(purchaseOrders.tenantId, session.tenant_id), eq(purchaseOrders.supplierId, session.reference_id)];
      if (input.status) conditions.push(eq(purchaseOrders.status, input.status as any));
      return db.select().from(purchaseOrders).where(and(...conditions)).orderBy(desc(purchaseOrders.createdAt));
    }),

  poGet: publicQuery
    .input(z.object({ token: z.string(), id: z.number() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const po = await db.query.purchaseOrders.findFirst({ where: eq(purchaseOrders.id, input.id) });
      const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, input.id));
      return { po, items };
    }),

  invoiceList: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      return db.select().from(invoices)
        .where(and(eq(invoices.tenantId, session.tenant_id), eq(invoices.customerId, session.reference_id)))
        .orderBy(desc(invoices.createdAt));
    }),

  invoiceCreate: publicQuery
    .input(z.object({ token: z.string(), poId: z.number(), invoiceNumber: z.string(), amount: z.string(), taxAmount: z.string().optional(), totalAmount: z.string() }))
    .mutation(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const po = await db.query.purchaseOrders.findFirst({ where: eq(purchaseOrders.id, input.poId) });
      if (!po) throw new Error("Purchase order not found");
      const [{ id }] = await db.insert(invoices).values({
        tenantId: session.tenant_id,
        invoiceNumber: input.invoiceNumber,
        customerId: session.reference_id,
        date: new Date().toISOString().slice(0, 10),
        subTotal: input.amount,
        taxAmount: input.taxAmount || "0",
        totalAmount: input.totalAmount,
        paidAmount: "0",
        balanceDue: input.totalAmount,
        invoiceType: "standard",
        status: "sent",
        notes: `Vendor invoice against PO: ${po.poNumber}`,
      }).$returningId();
      return { id, invoiceNumber: input.invoiceNumber, success: true };
    }),

  paymentList: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      return db.select().from(supplierPayments)
        .where(and(eq(supplierPayments.tenantId, session.tenant_id), eq(supplierPayments.supplierId, session.reference_id)))
        .orderBy(desc(supplierPayments.createdAt));
    }),

  profile: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await getSession(input.token);
      if (!session) throw new Error("Unauthorized");
      const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, session.reference_id) });
      return { portalUser: { id: session.id, name: session.name, email: session.email, portalType: session.portal_type }, supplier };
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
        await db.update(suppliers).set(updateData).where(eq(suppliers.id, session.reference_id));
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
        WHERE tenant_id = ${session.tenant_id} AND receiver_type = 'vendor' AND receiver_id = ${session.reference_id}
        ORDER BY created_at DESC
      `);
      return rows;
    }),
});
