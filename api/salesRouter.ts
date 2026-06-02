import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  customers, salesQuotations, salesQuotationItems,
  salesOrders, salesOrderItems, invoices, invoiceItems,
  creditNotes, customerPayments
} from "@db/schema";
import { eq, sql, and, like, desc } from "drizzle-orm";

export const salesRouter = createRouter({
  // Customers
  customerList: authedQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(customers.tenantId, tenantId)];
      if (input?.search) conditions.push(like(customers.name, `%${input.search}%`));
      return db.select().from(customers).where(and(...conditions)).orderBy(desc(customers.createdAt));
    }),

  customerGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      return db.query.customers.findFirst({
        where: and(eq(customers.tenantId, tenantId), eq(customers.id, input.id)),
      });
    }),

  customerCreate: authedQuery
    .input(z.object({
      code: z.string().optional(),
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      taxNumber: z.string().optional(),
      creditLimit: z.string().optional(),
      paymentTerms: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(customers).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        code: input.code || `CUST-${Date.now()}`,
      }).$returningId();
      return { id, success: true };
    }),

  quotationList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(salesQuotations.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(salesQuotations.status, input.status as any));
      if (input?.customerId) conditions.push(eq(salesQuotations.customerId, input.customerId));
      return db.select().from(salesQuotations).where(and(...conditions)).orderBy(desc(salesQuotations.createdAt));
    }),

  quotationCreate: authedQuery
    .input(z.object({
      quotationNumber: z.string(),
      customerId: z.number(),
      date: z.string(),
      expiryDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...quotationData } = input;
      const [{ id }] = await db.insert(salesQuotations).values({
        ...quotationData,
        tenantId: ctx.user.tenantId!,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(salesQuotationItems).values({ ...item, quotationId: id });
      }
      return { id, success: true };
    }),

  orderList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(salesOrders.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(salesOrders.status, input.status as any));
      if (input?.customerId) conditions.push(eq(salesOrders.customerId, input.customerId));
      return db.select().from(salesOrders).where(and(...conditions)).orderBy(desc(salesOrders.createdAt));
    }),

  orderCreate: authedQuery
    .input(z.object({
      orderNumber: z.string(),
      customerId: z.number(),
      date: z.string(),
      deliveryDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...orderData } = input;
      const [{ id }] = await db.insert(salesOrders).values({
        ...orderData,
        tenantId: ctx.user.tenantId!,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(salesOrderItems).values({ ...item, orderId: id });
      }
      return { id, success: true };
    }),

  invoiceList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(invoices.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(invoices.status, input.status as any));
      if (input?.customerId) conditions.push(eq(invoices.customerId, input.customerId));
      return db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.createdAt));
    }),

  invoiceGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const invoice = await db.query.invoices.findFirst({ where: eq(invoices.id, input.id) });
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, input.id));
      const customer = invoice ? await db.query.customers.findFirst({ where: eq(customers.id, invoice.customerId) }) : null;
      return { invoice, items, customer };
    }),

  invoiceCreate: authedQuery
    .input(z.object({
      invoiceNumber: z.string(),
      invoiceType: z.enum(["standard", "simplified", "zatca"]).optional(),
      customerId: z.number(),
      date: z.string(),
      dueDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      taxPercent: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        taxPercent: z.string().optional(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...invoiceData } = input;
      const [{ id }] = await db.insert(invoices).values({
        ...invoiceData,
        tenantId: ctx.user.tenantId!,
        balanceDue: invoiceData.totalAmount,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(invoiceItems).values({ ...item, invoiceId: id });
      }
      return { id, success: true };
    }),

  invoiceUpdateStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(invoices).set({ status: input.status }).where(eq(invoices.id, input.id));
      return { success: true };
    }),

  // Credit Notes
  creditNoteList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(creditNotes).where(eq(creditNotes.tenantId, ctx.user.tenantId!));
    }),

  creditNoteCreate: authedQuery
    .input(z.object({
      creditNoteNumber: z.string(),
      customerId: z.number(),
      invoiceId: z.number().optional(),
      date: z.string(),
      amount: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(creditNotes).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        invoiceId: input.invoiceId || 0,
        status: "draft",
      }).$returningId();
      return { id, success: true };
    }),

  // Customer Payments
  paymentList: authedQuery
    .input(z.object({
      customerId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(customerPayments.tenantId, tenantId)];
      if (input?.customerId) conditions.push(eq(customerPayments.customerId, input.customerId));
      return db.select().from(customerPayments).where(and(...conditions));
    }),

  paymentCreate: authedQuery
    .input(z.object({
      paymentNumber: z.string(),
      customerId: z.number(),
      invoiceId: z.number().optional(),
      date: z.string(),
      amount: z.string(),
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "card", "online"]),
      reference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(customerPayments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),
});
