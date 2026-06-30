import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  priceTiers, priceTierBreaks, customerPriceTiers,
  products, customers, invoices, invoiceItems, inventoryBalances,
  salesOrders, salesOrderItems,
} from "@db/schema";
import { eq, and, like, desc, sql, gte, lte, inArray } from "drizzle-orm";
import { checkLowStockAndNotify } from "./lib/notifications/events";

async function getOrCreateWalkInCustomer(db: ReturnType<typeof getDb>, tenantId: number) {
  const existing = await db.query.customers.findFirst({
    where: and(eq(customers.tenantId, tenantId), eq(customers.code, "WALK-IN")),
  });
  if (existing) return existing.id;
  const [{ id }] = await db.insert(customers).values({
    tenantId, code: "WALK-IN", name: "Walk-in Customer",
    nameAr: "عميل نقدي", country: "Saudi Arabia", isActive: true,
  }).$returningId();
  return id;
}

export const posWholesaleRouter = createRouter({
  // ============ PRICE TIERS ============
  priceTierList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(priceTiers)
      .where(and(eq(priceTiers.tenantId, ctx.user.tenantId!), eq(priceTiers.isActive, true)));
  }),

  priceTierCreate: authedQuery
    .input(z.object({
      name: z.string(), nameAr: z.string().optional(),
      tierType: z.enum(["quantity_break", "customer_group", "trade_discount"]).default("quantity_break"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(priceTiers).values({ tenantId: ctx.user.tenantId!, ...input }).$returningId();
      return { id, success: true };
    }),

  priceTierBreaksList: authedQuery
    .input(z.object({ priceTierId: z.number(), productId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [
        eq(priceTierBreaks.priceTierId, input.priceTierId),
        eq(priceTierBreaks.tenantId, ctx.user.tenantId!),
      ];
      if (input.productId) conditions.push(eq(priceTierBreaks.productId, input.productId));
      return db.select().from(priceTierBreaks).where(and(...conditions)).orderBy(priceTierBreaks.minQuantity);
    }),

  priceTierBreakCreate: authedQuery
    .input(z.object({
      priceTierId: z.number(), productId: z.number().optional(),
      categoryId: z.number().optional(), minQuantity: z.number().default(1),
      maxQuantity: z.number().optional(), unitPrice: z.string(),
      discountPercent: z.string().default("0"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(priceTierBreaks).values({ tenantId: ctx.user.tenantId!, ...input });
      return { success: true };
    }),

  customerPriceTierSet: authedQuery
    .input(z.object({ customerId: z.number(), priceTierId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.query.customerPriceTiers.findFirst({
        where: and(eq(customerPriceTiers.customerId, input.customerId), eq(customerPriceTiers.priceTierId, input.priceTierId)),
      });
      if (!existing) {
        await db.insert(customerPriceTiers).values({
          customerId: input.customerId, priceTierId: input.priceTierId,
          tenantId: ctx.user.tenantId!,
        });
      }
      return { success: true };
    }),

  getEffectivePrice: authedQuery
    .input(z.object({ customerId: z.number().optional(), productId: z.number(), quantity: z.number().default(1) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, input.productId), eq(products.tenantId, ctx.user.tenantId!)),
      });
      if (!product) throw new Error("Product not found");
      let effectivePrice = Number(product.salePrice);

      if (input.customerId && input.quantity > 1) {
        // Check customer's price tier
        const cpt = await db.query.customerPriceTiers.findFirst({
          where: and(eq(customerPriceTiers.customerId, input.customerId), eq(customerPriceTiers.tenantId, ctx.user.tenantId!)),
        });
        if (cpt) {
          const breaks = await db.select().from(priceTierBreaks)
            .where(and(
              eq(priceTierBreaks.priceTierId, cpt.priceTierId),
              eq(priceTierBreaks.tenantId, ctx.user.tenantId!),
              lte(priceTierBreaks.minQuantity, input.quantity),
              sql`(${priceTierBreaks.maxQuantity} IS NULL OR ${priceTierBreaks.maxQuantity} >= ${input.quantity})`,
            ))
            .orderBy(desc(priceTierBreaks.minQuantity)).limit(1);
          if (breaks.length) {
            effectivePrice = Number(breaks[0].unitPrice);
          }
        }
      }
      return { ...product, effectivePrice, effectivePriceDisplay: effectivePrice };
    }),

  // ============ BULK SALE INVOICE ============
  createBulkInvoice: authedQuery
    .input(z.object({
      customerId: z.number().optional(), date: z.string(),
      dueDate: z.string().optional(),
      paymentMethod: z.enum(["cash", "card", "transfer", "cheque", "wallet", "credit", "multiple"]).default("cash"),
      paymentAmount: z.string(),
      subtotal: z.string(), taxAmount: z.string().default("0"),
      discountAmount: z.string().default("0"), tradeDiscountPercent: z.string().default("0"),
      totalAmount: z.string(), taxExempt: z.boolean().default(false),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(), description: z.string().optional(),
        quantity: z.number(), unitPrice: z.string(),
        discount: z.string().default("0"), taxRate: z.string().default("0"),
        totalAmount: z.string(), batchNumber: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const invoiceNumber = `WS-${Date.now()}`;
      const { items, ...invoiceData } = input;
      const customerId = input.customerId ?? await getOrCreateWalkInCustomer(db, tenantId);

      // Check credit limit for credit sales
      if (input.paymentMethod === "credit") {
        const customer = await db.query.customers.findFirst({ where: eq(customers.id, customerId) });
        if (customer) {
          const newBalance = Number(customer.currentBalance) + Number(input.totalAmount);
          if (Number(customer.creditLimit) > 0 && newBalance > Number(customer.creditLimit)) {
            throw new Error(`Credit limit exceeded. Limit: ${customer.creditLimit}, New balance: ${newBalance}`);
          }
        }
      }

      const balanceDue = Math.max(0, Number(input.totalAmount) - Number(input.paymentAmount || 0)).toFixed(4);
      const tradeDisc = Number(input.tradeDiscountPercent);

      const [{ id: invoiceId }] = await db.insert(invoices).values({
        tenantId, invoiceNumber, customerId,
        date: invoiceData.date, dueDate: invoiceData.dueDate,
        subTotal: invoiceData.subtotal,
        discountAmount: String(Number(input.discountAmount) + (Number(input.subtotal) * tradeDisc / 100)),
        taxAmount: input.taxExempt ? "0" : invoiceData.taxAmount,
        totalAmount: invoiceData.totalAmount,
        paidAmount: invoiceData.paymentAmount, balanceDue,
        notes: invoiceData.notes, invoiceType: "standard",
        status: balanceDue > 0 ? "partial" : "paid",
        createdBy: ctx.user.id,
      }).$returningId();

      for (const item of items) {
        await db.insert(invoiceItems).values({
          invoiceId, productId: item.productId, description: item.description,
          quantity: item.quantity, unitPrice: item.unitPrice,
          discountPercent: item.discount, taxPercent: input.taxExempt ? "0" : item.taxRate,
          totalAmount: item.totalAmount,
        });
      }

      // Update stock
      for (const item of items) {
        const balances = await db.select().from(inventoryBalances)
          .where(and(eq(inventoryBalances.productId, item.productId), eq(inventoryBalances.tenantId, tenantId)));
        for (const bal of balances) {
          const newQty = Math.max(0, Number(bal.quantity || 0) - item.quantity);
          await db.update(inventoryBalances).set({ quantity: newQty }).where(eq(inventoryBalances.id, bal.id));
        }
      }

      checkLowStockAndNotify(tenantId).catch((err) =>
        console.error("[notify] Wholesale checkLowStock error:", err)
      );
      return { id: invoiceId, invoiceNumber, success: true };
    }),

  // ============ QUICK ORDER TEMPLATES ============
  customerLastOrder: authedQuery
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const lastOrder = await db.query.salesOrders.findFirst({
        where: and(eq(salesOrders.customerId, input.customerId), eq(salesOrders.tenantId, ctx.user.tenantId!)),
        orderBy: desc(salesOrders.createdAt),
      });
      if (!lastOrder) return null;
      const items = await db.select().from(salesOrderItems).where(eq(salesOrderItems.orderId, lastOrder.id));
      return { order: lastOrder, items };
    }),

  customerFrequentItems: authedQuery
    .input(z.object({ customerId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const customerOrders = await db.select({ id: salesOrders.id }).from(salesOrders)
        .where(and(eq(salesOrders.customerId, input.customerId), eq(salesOrders.tenantId, ctx.user.tenantId!)));
      const orderIds = customerOrders.map(o => o.id);
      if (!orderIds.length) return [];
      const freq = await db.select({
        productId: salesOrderItems.productId,
        totalQty: sql<number>`sum(${salesOrderItems.quantity})`,
        orderCount: sql<number>`count(distinct ${salesOrderItems.orderId})`,
      }).from(salesOrderItems)
        .where(and(inArray(salesOrderItems.orderId, orderIds), sql`${salesOrderItems.productId} IS NOT NULL`))
        .groupBy(salesOrderItems.productId)
        .orderBy(desc(sql`sum(${salesOrderItems.quantity})`))
        .limit(input.limit);
      const result = [];
      for (const f of freq) {
        const product = await db.query.products.findFirst({ where: eq(products.id, f.productId!) });
        result.push({ ...f, productName: product?.name, salePrice: product?.salePrice });
      }
      return result;
    }),
});
