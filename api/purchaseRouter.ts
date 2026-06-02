import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  suppliers, purchaseOrders, purchaseOrderItems,
  goodsReceivedNotes, grnItems, supplierPayments
} from "@db/schema";
import { eq, sql, and, like, desc } from "drizzle-orm";

export const purchaseRouter = createRouter({
  // Suppliers
  supplierList: authedQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(suppliers.tenantId, tenantId)];
      if (input?.search) conditions.push(like(suppliers.name, `%${input.search}%`));
      return db.select().from(suppliers).where(and(...conditions)).orderBy(desc(suppliers.createdAt));
    }),

  supplierGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, input.id) });
      const pos = await db.select().from(purchaseOrders).where(eq(purchaseOrders.supplierId, input.id));
      return { supplier, purchaseOrders: pos };
    }),

  supplierCreate: authedQuery
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
      const [{ id }] = await db.insert(suppliers).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Purchase Orders
  poList: authedQuery
    .input(z.object({
      status: z.string().optional(),
      supplierId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(purchaseOrders.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(purchaseOrders.status, input.status as any));
      if (input?.supplierId) conditions.push(eq(purchaseOrders.supplierId, input.supplierId));
      return db.select().from(purchaseOrders).where(and(...conditions)).orderBy(desc(purchaseOrders.createdAt));
    }),

  poCreate: authedQuery
    .input(z.object({
      poNumber: z.string(),
      supplierId: z.number(),
      date: z.string(),
      expectedDelivery: z.string().optional(),
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
      const { items, ...poData } = input;
      const [{ id }] = await db.insert(purchaseOrders).values({
        ...poData,
        tenantId: ctx.user.tenantId!,
      }).$returningId();
      for (const item of items) {
        await db.insert(purchaseOrderItems).values({ ...item, poId: id });
      }
      return { id, success: true };
    }),

  // GRN
  grnList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(goodsReceivedNotes).where(eq(goodsReceivedNotes.tenantId, ctx.user.tenantId!));
    }),

  grnCreate: authedQuery
    .input(z.object({
      grnNumber: z.string(),
      poId: z.number().optional(),
      supplierId: z.number(),
      warehouseId: z.number(),
      date: z.string(),
      totalAmount: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        poItemId: z.number().optional(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
        batchNumber: z.string().optional(),
        expiryDate: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...grnData } = input;
      const [{ id }] = await db.insert(goodsReceivedNotes).values({
        ...grnData,
        tenantId: ctx.user.tenantId!,
      }).$returningId();
      for (const item of items) {
        await db.insert(grnItems).values({ ...item, grnId: id });
      }
      return { id, success: true };
    }),

  // Supplier Payments
  supplierPaymentList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(supplierPayments).where(eq(supplierPayments.tenantId, ctx.user.tenantId!));
    }),

  supplierPaymentCreate: authedQuery
    .input(z.object({
      paymentNumber: z.string(),
      supplierId: z.number(),
      date: z.string(),
      amount: z.string(),
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "card", "online"]),
      reference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(supplierPayments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),
});
