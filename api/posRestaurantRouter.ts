import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  floorPlans, restaurantTables, tableOrders,
  kdsStations, kdsStationProducts, kotTickets, kotTicketItems,
  orderCourses, orderItemModifiers, qrOrderSessions,
  products, customers, invoices, invoiceItems, inventoryBalances,
} from "@db/schema";
import { eq, and, like, desc, sql, gte, lte, inArray } from "drizzle-orm";

export const posRestaurantRouter = createRouter({
  // ============ FLOOR PLANS ============
  floorPlanList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(floorPlans)
      .where(and(eq(floorPlans.tenantId, ctx.user.tenantId!), eq(floorPlans.isActive, true)))
      .orderBy(desc(floorPlans.createdAt));
  }),

  floorPlanCreate: authedQuery
    .input(z.object({ name: z.string(), nameAr: z.string().optional(), width: z.number().default(800), height: z.number().default(600) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(floorPlans).values({
        tenantId: ctx.user.tenantId!, name: input.name, nameAr: input.nameAr,
        width: input.width, height: input.height,
      }).$returningId();
      return { id, success: true };
    }),

  // ============ TABLES ============
  tableList: authedQuery
    .input(z.object({ floorPlanId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select().from(restaurantTables)
        .where(and(eq(restaurantTables.tenantId, ctx.user.tenantId!), eq(restaurantTables.floorPlanId, input.floorPlanId)))
        .orderBy(restaurantTables.tableNumber);
    }),

  tableCreate: authedQuery
    .input(z.object({
      floorPlanId: z.number(), tableNumber: z.string(), name: z.string().optional(), nameAr: z.string().optional(),
      capacity: z.number().default(4), shape: z.enum(["rectangle", "circle", "square"]).default("rectangle"),
      posX: z.number().default(0), posY: z.number().default(0),
      width: z.number().default(80), height: z.number().default(60),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(restaurantTables).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return { id, success: true };
    }),

  tableUpdate: authedQuery
    .input(z.object({
      id: z.number(), posX: z.number().optional(), posY: z.number().optional(),
      status: z.enum(["vacant", "occupied", "ordered", "served", "paid", "reserved", "cleaning"]).optional(),
      waiterId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(restaurantTables).set(data).where(and(eq(restaurantTables.id, id), eq(restaurantTables.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  tableDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(restaurantTables).set({ isActive: false })
        .where(and(eq(restaurantTables.id, input.id), eq(restaurantTables.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // ============ TABLE ORDERS ============
  tableOrderCreate: authedQuery
    .input(z.object({
      restaurantTableId: z.number(), waiterId: z.number().optional(),
      customerId: z.number().optional(), guestCount: z.number().default(1),
      orderType: z.enum(["dine_in", "takeaway", "delivery"]).default("dine_in"),
      serviceChargePercent: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(), productName: z.string().optional(),
        quantity: z.number(), unitPrice: z.string(), modifiers: z.any().optional(),
        instructions: z.string().optional(), course: z.enum(["appetizer", "main", "dessert", "drinks", "other"]).default("main"),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const orderNumber = `TO-${Date.now()}`;
      let subtotal = 0;
      for (const item of input.items) subtotal += Number(item.unitPrice) * item.quantity;
      const servicePct = Number(input.serviceChargePercent || 0);
      const serviceCharge = subtotal * (servicePct / 100);

      const [{ id: orderId }] = await db.insert(tableOrders).values({
        tenantId, restaurantTableId: input.restaurantTableId,
        waiterId: input.waiterId, customerId: input.customerId,
        guestCount: input.guestCount, orderNumber,
        orderType: input.orderType,
        serviceChargePercent: String(servicePct),
        serviceChargeAmount: String(serviceCharge),
        subtotal: String(subtotal),
        totalAmount: String(subtotal + serviceCharge),
        createdBy: ctx.user.id,
      }).$returningId();

      await db.update(restaurantTables).set({ status: "ordered", currentOrderId: orderId })
        .where(eq(restaurantTables.id, input.restaurantTableId));

      // KDS: assign items to stations, create KOT tickets
      const stations = await db.select().from(kdsStations)
        .where(and(eq(kdsStations.tenantId, tenantId), eq(kdsStations.isActive, true)));
      const stationProducts = await db.select().from(kdsStationProducts)
        .where(inArray(kdsStationProducts.stationId, stations.map(s => s.id)));

      const courseMap: Record<string, number> = { appetizer: 0, main: 1, dessert: 2, drinks: 3, other: 4 };
      const kotTicketsMap = new Map<number, typeof kotTickets.$inferInsert & { items: any[] }>();

      for (const item of input.items) {
        // Find station for this product
        const sp = stationProducts.find(sp => sp.productId === item.productId);
        const stationId = sp?.stationId || stations[0]?.id;
        if (!stationId) continue;

        const key = stationId;
        if (!kotTicketsMap.has(key)) {
          const kotNumber = `KOT-${Date.now()}-${key}`;
          kotTicketsMap.set(key, {
            tenantId, tableOrderId: orderId,
            restaurantTableId: input.restaurantTableId,
            stationId: key, kotNumber,
            course: item.course, courseSequence: courseMap[item.course] || 0,
            items: [],
          });
        }
        const entry = kotTicketsMap.get(key)!;
        entry.items.push({
          productId: item.productId, productName: item.productName || `Product #${item.productId}`,
          quantity: item.quantity, modifiers: item.modifiers || null,
          instructions: item.instructions || null,
        });
      }

      for (const [, ticket] of kotTicketsMap) {
        const { items, ...ticketData } = ticket;
        const [{ id: ticketId }] = await db.insert(kotTickets).values(ticketData).$returningId();
        for (const ti of items) {
          await db.insert(kotTicketItems).values({ kotTicketId: ticketId, ...ti });
        }
      }

      return { id: orderId, orderNumber, success: true };
    }),

  tableOrderList: authedQuery
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(tableOrders.tenantId, ctx.user.tenantId!)];
      if (input.status) conditions.push(eq(tableOrders.status, input.status as any));
      return db.select().from(tableOrders).where(and(...conditions)).orderBy(desc(tableOrders.createdAt));
    }),

  tableOrderGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db.query.tableOrders.findFirst({
        where: and(eq(tableOrders.id, input.id), eq(tableOrders.tenantId, ctx.user.tenantId!)),
      });
      if (!order) return null;
      const tickets = await db.select().from(kotTickets).where(eq(kotTickets.tableOrderId, input.id));
      const ticketIds = tickets.map(t => t.id);
      const items = ticketIds.length ? await db.select().from(kotTicketItems).where(inArray(kotTicketItems.kotTicketId, ticketIds)) : [];
      return { ...order, tickets, ticketItems: items };
    }),

  tableOrderUpdateStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["open", "in_progress", "served", "partial", "completed", "cancelled", "transferred"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(tableOrders).set({ status: input.status })
        .where(and(eq(tableOrders.id, input.id), eq(tableOrders.tenantId, ctx.user.tenantId!)));
      if (input.status === "completed" || input.status === "cancelled") {
        const order = await db.query.tableOrders.findFirst({ where: eq(tableOrders.id, input.id) });
        if (order?.restaurantTableId) {
          await db.update(restaurantTables).set({ status: input.status === "completed" ? "paid" : "vacant", currentOrderId: null })
            .where(eq(restaurantTables.id, order.restaurantTableId));
        }
      }
      return { success: true };
    }),

  // ============ ORDER SPLITTING ============
  tableOrderSplit: authedQuery
    .input(z.object({
      orderId: z.number(), newTableId: z.number(),
      itemIds: z.array(z.number()), // KOT ticket item IDs to move
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const origOrder = await db.query.tableOrders.findFirst({
        where: and(eq(tableOrders.id, input.orderId), eq(tableOrders.tenantId, tenantId)),
      });
      if (!origOrder) throw new Error("Order not found");

      const splitNumber = `TO-${Date.now()}`;
      const [{ id: newOrderId }] = await db.insert(tableOrders).values({
        tenantId, restaurantTableId: input.newTableId,
        waiterId: origOrder.waiterId, customerId: origOrder.customerId,
        guestCount: 1, orderNumber: splitNumber,
        orderType: origOrder.orderType, splitFromId: input.orderId,
      }).$returningId();

      // Move items to new KOT tickets
      const itemsToMove = await db.select().from(kotTicketItems)
        .where(inArray(kotTicketItems.id, input.itemIds));
      for (const item of itemsToMove) {
        await db.insert(kotTicketItems).values({
          kotTicketId: item.kotTicketId, productId: item.productId,
          productName: item.productName, quantity: item.quantity,
          modifiers: item.modifiers, instructions: item.instructions,
        });
      }

      await db.update(restaurantTables).set({ status: "ordered", currentOrderId: newOrderId })
        .where(eq(restaurantTables.id, input.newTableId));

      return { id: newOrderId, success: true };
    }),

  // ============ TABLE TRANSFER ============
  tableOrderTransfer: authedQuery
    .input(z.object({ orderId: z.number(), fromTableId: z.number(), toTableId: z.number(), newWaiterId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      await db.update(tableOrders).set({
        restaurantTableId: input.toTableId,
        waiterId: input.newWaiterId,
        status: "transferred",
      }).where(and(eq(tableOrders.id, input.orderId), eq(tableOrders.tenantId, tenantId)));
      await db.update(restaurantTables).set({ status: "vacant", currentOrderId: null })
        .where(eq(restaurantTables.id, input.fromTableId));
      await db.update(restaurantTables).set({ status: "occupied", currentOrderId: input.orderId })
        .where(eq(restaurantTables.id, input.toTableId));
      return { success: true };
    }),

  // ============ HOLD/RELEASE ITEMS ============
  kotItemHold: authedQuery
    .input(z.object({ id: z.number(), hold: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const item = await db.query.kotTicketItems.findFirst({ where: eq(kotTicketItems.id, input.id) });
      if (!item) throw new Error("Item not found");
      await db.update(kotTicketItems).set({ status: input.hold ? "held" : "pending" })
        .where(eq(kotTicketItems.id, input.id));
      return { success: true };
    }),

  // ============ KDS / KOT ============
  kdsStationList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(kdsStations)
      .where(and(eq(kdsStations.tenantId, ctx.user.tenantId!), eq(kdsStations.isActive, true)))
      .orderBy(kdsStations.sortOrder);
  }),

  kdsStationCreate: authedQuery
    .input(z.object({
      name: z.string(), nameAr: z.string().optional(),
      stationType: z.enum(["kitchen", "bar", "grill", "salad", "pizza", "dessert", "other"]).default("kitchen"),
      printerName: z.string().optional(), sortOrder: z.number().default(0),
      productIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { productIds, ...stationData } = input;
      const [{ id }] = await db.insert(kdsStations).values({
        tenantId: ctx.user.tenantId!, ...stationData,
      }).$returningId();
      if (productIds?.length) {
        for (const pid of productIds) {
          await db.insert(kdsStationProducts).values({ stationId: id, productId: pid });
        }
      }
      return { id, success: true };
    }),

  kotPendingTickets: authedQuery
    .input(z.object({ stationId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(kotTickets.tenantId, ctx.user.tenantId!)];
      if (input.stationId) conditions.push(eq(kotTickets.stationId, input.stationId));
      conditions.push(sql`${kotTickets.status} IN ('pending','preparing')`);
      const tickets = await db.select().from(kotTickets).where(and(...conditions)).orderBy(kotTickets.courseSequence, kotTickets.createdAt);
      const ticketIds = tickets.map(t => t.id);
      const items = ticketIds.length ? await db.select().from(kotTicketItems).where(inArray(kotTicketItems.kotTicketId, ticketIds)) : [];
      return tickets.map(t => ({ ...t, items: items.filter(i => i.kotTicketId === t.id) }));
    }),

  kotUpdateStatus: authedQuery
    .input(z.object({
      id: z.number(), status: z.enum(["pending", "preparing", "ready", "served", "cancelled"]),
      preparedBy: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updates: any = { status: input.status };
      if (input.status === "preparing") updates.preparedBy = input.preparedBy;
      if (input.status === "ready") updates.readyAt = new Date();
      if (input.status === "served") updates.servedAt = new Date();
      await db.update(kotTickets).set(updates).where(eq(kotTickets.id, input.id));
      return { success: true };
    }),

  // ============ QR ORDERING ============
  qrSessionCreate: authedQuery
    .input(z.object({ restaurantTableId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const token = `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const [{ id }] = await db.insert(qrOrderSessions).values({
        tenantId: ctx.user.tenantId!, restaurantTableId: input.restaurantTableId,
        sessionToken: token, expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      }).$returningId();
      return { id, token, success: true };
    }),

  // ============ SERVICE CHARGE ============
  tableOrderSetServiceCharge: authedQuery
    .input(z.object({ orderId: z.number(), percent: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db.query.tableOrders.findFirst({
        where: and(eq(tableOrders.id, input.orderId), eq(tableOrders.tenantId, ctx.user.tenantId!)),
      });
      if (!order) throw new Error("Order not found");
      const pct = Number(input.percent);
      const serviceCharge = Number(order.subtotal) * (pct / 100);
      await db.update(tableOrders).set({
        serviceChargePercent: String(pct),
        serviceChargeAmount: String(serviceCharge),
        totalAmount: String(Number(order.subtotal) + serviceCharge - Number(order.discountAmount || 0) + Number(order.taxAmount || 0)),
      }).where(eq(tableOrders.id, input.orderId));
      return { success: true };
    }),
});
