import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  products, customers, invoices, invoiceItems, inventoryBalances,
  salesOrders, salesOrderItems, salesQuotations, salesQuotationItems,
  posSessions, posHolds, cashboxTransactions, chartOfAccounts,
} from "@db/schema";
import { eq, and, like, desc, sql, gte, lte, inArray } from "drizzle-orm";

async function getOrCreateWalkInCustomer(db: ReturnType<typeof getDb>, tenantId: number) {
  const existing = await db.query.customers.findFirst({
    where: and(eq(customers.tenantId, tenantId), eq(customers.code, "WALK-IN")),
  });
  if (existing) return existing.id;

  const [{ id }] = await db.insert(customers).values({
    tenantId,
    code: "WALK-IN",
    name: "Walk-in Customer",
    nameAr: "عميل نقدي",
    country: "Saudi Arabia",
    isActive: true,
  }).$returningId();
  return id;
}

export const posRouter = createRouter({
  // ITEMS
  itemSearch: authedQuery
    .input(z.object({ query: z.string(), categoryId: z.number().optional(), warehouseId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [
        eq(products.tenantId, tenantId),
        eq(products.isActive, true),
      ];
      if (input.query) {
        conditions.push(
          sql`(${like(products.name, `%${input.query}%`)} OR ${like(products.barcode, `%${input.query}%`)} OR ${like(products.sku, `%${input.query}%`)})`
        );
      }
      if (input.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
      const items = await db.select().from(products).where(and(...conditions)).limit(20);
      const result = [];
      for (const item of items) {
        let stockQty = 0;
        const stockConditions = [eq(inventoryBalances.productId, item.id), eq(inventoryBalances.tenantId, tenantId)];
        if (input.warehouseId) stockConditions.push(eq(inventoryBalances.warehouseId, input.warehouseId));
        const stock = await db.select({ qty: sql<number>`coalesce(sum(${inventoryBalances.quantity}),0)` })
          .from(inventoryBalances).where(and(...stockConditions));
        stockQty = Number(stock[0]?.qty || 0);
        result.push({ ...item, stockQty, stockQtyDisplay: stockQty });
      }
      return result;
    }),

  itemGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const item = await db.query.products.findFirst({
        where: and(eq(products.tenantId, ctx.user.tenantId!), eq(products.id, input.id)),
      });
      if (!item) return null;
      const stock = await db.select({ qty: sql<number>`coalesce(sum(${inventoryBalances.quantity}),0)` })
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.productId, input.id), eq(inventoryBalances.tenantId, ctx.user.tenantId!)));
      return { ...item, stockQty: Number(stock[0]?.qty || 0) };
    }),

  // CUSTOMERS
  customerSearch: authedQuery
    .input(z.object({ query: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(customers.tenantId, ctx.user.tenantId!)];
      if (input?.query) conditions.push(like(customers.name, `%${input.query}%`));
      return db.select().from(customers).where(and(...conditions)).limit(20);
    }),

  // SESSION
  sessionOpen: authedQuery
    .input(z.object({ openingBalance: z.string().default("0") }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(posSessions).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        openingBalance: input.openingBalance,
        status: "open",
      }).$returningId();
      return { id, success: true };
    }),

  sessionClose: authedQuery
    .input(z.object({ id: z.number(), closingBalance: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const session = await db.query.posSessions.findFirst({
        where: and(eq(posSessions.id, input.id), eq(posSessions.tenantId, ctx.user.tenantId!)),
      });
      if (!session) throw new Error("Session not found");
      await db.update(posSessions).set({
        status: "closed",
        closingBalance: input.closingBalance,
        closedAt: new Date(),
      }).where(eq(posSessions.id, input.id));
      return { success: true };
    }),

  sessionCurrent: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.posSessions.findFirst({
      where: and(eq(posSessions.tenantId, ctx.user.tenantId!), eq(posSessions.userId, ctx.user.id), eq(posSessions.status, "open")),
      orderBy: desc(posSessions.createdAt),
    });
  }),

  // SALE
  createSaleInvoice: authedQuery
    .input(z.object({
      customerId: z.number().optional(),
      date: z.string(),
      dueDate: z.string().optional(),
      paymentMethod: z.enum(["cash", "card", "transfer", "cheque", "wallet", "multiple"]).default("cash"),
      paymentAmount: z.string(),
      subtotal: z.string(),
      taxAmount: z.string().default("0"),
      discountAmount: z.string().default("0"),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        description: z.string().optional(),
        quantity: z.number(),
        unitPrice: z.string(),
        discount: z.string().default("0"),
        taxRate: z.string().default("0"),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const invoiceNumber = `POS-${Date.now()}`;
      const { items, ...invoiceData } = input;
      const customerId = input.customerId ?? await getOrCreateWalkInCustomer(db, tenantId);
      const balanceDue = Math.max(0, Number(input.totalAmount) - Number(input.paymentAmount || 0)).toFixed(4);

      // Create invoice
      const [{ id: invoiceId }] = await db.insert(invoices).values({
        tenantId,
        invoiceNumber,
        customerId,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        subTotal: invoiceData.subtotal,
        discountAmount: invoiceData.discountAmount,
        taxAmount: invoiceData.taxAmount,
        totalAmount: invoiceData.totalAmount,
        paidAmount: invoiceData.paymentAmount,
        balanceDue,
        notes: invoiceData.notes,
        invoiceType: "simplified",
        status: "paid",
        createdBy: ctx.user.id,
      }).$returningId();

      // Create invoice items
      for (const item of items) {
        await db.insert(invoiceItems).values({
          invoiceId,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discount,
          taxPercent: item.taxRate,
          totalAmount: item.totalAmount,
        });
      }

      // Update stock
      for (const item of items) {
        const balances = await db.select().from(inventoryBalances)
          .where(and(
            eq(inventoryBalances.productId, item.productId),
            eq(inventoryBalances.tenantId, tenantId),
        ));
        for (const bal of balances) {
          const newQty = Math.max(0, Number(bal.quantity || 0) - item.quantity);
          await db.update(inventoryBalances).set({ quantity: newQty })
            .where(eq(inventoryBalances.id, bal.id));
        }
      }

      // Cashbox entry for cash sales
      const paymentAmount = Number(input.paymentAmount);
      if (paymentAmount > 0) {
        const lastTx = await db.select({ bal: cashboxTransactions.balanceAfter })
          .from(cashboxTransactions)
          .where(eq(cashboxTransactions.tenantId, tenantId))
          .orderBy(desc(cashboxTransactions.createdAt))
          .limit(1);
        const prevBal = Number(lastTx[0]?.bal || 0);
        const txNum = `CB-${Date.now()}`;
        await db.insert(cashboxTransactions).values({
          tenantId,
          userId: ctx.user.id,
          transactionNumber: txNum,
          transactionType: "sale",
          amount: String(paymentAmount),
          paymentMethod: input.paymentMethod as any,
          referenceType: "invoice",
          referenceId: invoiceId,
          description: `Sale invoice ${invoiceNumber}`,
          balanceBefore: String(prevBal),
          balanceAfter: String(prevBal + paymentAmount),
          status: "completed",
        });
      }

      return { id: invoiceId, invoiceNumber, success: true };
    }),

  holdSale: authedQuery
    .input(z.object({
      customerId: z.number().optional(),
      items: z.array(z.any()),
      subtotal: z.string(),
      taxAmount: z.string(),
      discountAmount: z.string(),
      totalAmount: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const holdNumber = `HLD-${Date.now()}`;
      const [{ id }] = await db.insert(posHolds).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        holdNumber,
        customerId: input.customerId,
        items: input.items,
        subtotal: input.subtotal,
        taxAmount: input.taxAmount,
        discountAmount: input.discountAmount,
        totalAmount: input.totalAmount,
        notes: input.notes,
      }).$returningId();
      return { id, holdNumber, success: true };
    }),

  heldSalesList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(posHolds)
      .where(and(eq(posHolds.tenantId, ctx.user.tenantId!), eq(posHolds.status, "held")))
      .orderBy(desc(posHolds.createdAt));
  }),

  resumeHold: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const hold = await db.query.posHolds.findFirst({
        where: and(eq(posHolds.id, input.id), eq(posHolds.tenantId, ctx.user.tenantId!)),
      });
      if (!hold) throw new Error("Hold not found");
      await db.update(posHolds).set({ status: "resumed" }).where(eq(posHolds.id, input.id));
      return hold;
    }),

  cancelHold: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(posHolds).set({ status: "cancelled" })
        .where(and(eq(posHolds.id, input.id), eq(posHolds.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // TODAY SALE SUMMARY
  todaySummary: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const today = new Date().toISOString().split("T")[0];
    const invoicesToday = await db.select({
      total: sql<string>`coalesce(sum(${invoices.totalAmount}),0)`,
      count: sql<number>`count(*)`,
      cashTotal: sql<string>`0`,
      cardTotal: sql<string>`0`,
      transferTotal: sql<string>`0`,
    }).from(invoices)
      .where(and(eq(invoices.tenantId, tenantId), gte(invoices.createdAt, new Date(today))));
    return {
      totalSales: Number(invoicesToday[0]?.total || 0),
      count: invoicesToday[0]?.count || 0,
      cashTotal: Number(invoicesToday[0]?.cashTotal || 0),
      cardTotal: Number(invoicesToday[0]?.cardTotal || 0),
      transferTotal: Number(invoicesToday[0]?.transferTotal || 0),
    };
  }),

  // REPORTS
  salesReport: authedQuery
    .input(z.object({ from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(invoices.tenantId, ctx.user.tenantId!)];
      if (input.from) conditions.push(gte(invoices.date, input.from));
      if (input.to) conditions.push(lte(invoices.date, input.to));
      return db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.date));
    }),

  topSellingItems: authedQuery
    .input(z.object({ from: z.string().optional(), to: z.string().optional(), limit: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const invoiceRows = await db.select({ id: invoices.id }).from(invoices)
        .where(eq(invoices.tenantId, ctx.user.tenantId!));
      const invoiceIds = invoiceRows.map((row) => row.id);
      if (invoiceIds.length === 0) return [];
      const conditions = [inArray(invoiceItems.invoiceId, invoiceIds)];
      if (input.from) conditions.push(gte(invoiceItems.createdAt, new Date(input.from)));
      if (input.to) conditions.push(lte(invoiceItems.createdAt, new Date(input.to)));
      const data = await db.select({
        productId: invoiceItems.productId,
        totalQty: sql<number>`sum(${invoiceItems.quantity})`,
        totalAmount: sql<string>`sum(${invoiceItems.totalAmount})`,
      }).from(invoiceItems).where(and(...conditions))
        .groupBy(invoiceItems.productId)
        .orderBy(desc(sql`sum(${invoiceItems.quantity})`))
        .limit(input.limit);
      const result = [];
      for (const d of data) {
        const product = await db.query.products.findFirst({ where: eq(products.id, d.productId!) });
        result.push({ ...d, productName: product?.name || "Unknown", productNameAr: product?.nameAr || "" });
      }
      return result;
    }),
});
