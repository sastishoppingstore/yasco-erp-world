import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { roomTypes, roomInventory, hotelBookings, bookingCalendar, housekeepingSchedule, folioCharges } from "@db/schema";
import { eq, and, desc, sql, between } from "drizzle-orm";

export const hotelRouter = createRouter({
  roomTypeList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(roomTypes).where(eq(roomTypes.tenantId, ctx.user.tenantId!));
    }),

  roomTypeCreate: authedQuery
    .input(z.object({
      name: z.string(),
      nameAr: z.string().optional(),
      description: z.string().optional(),
      basePrice: z.string(),
      maxOccupancy: z.number().optional(),
      numberOfRooms: z.number().optional(),
      amenities: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(roomTypes).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  roomInventoryList: authedQuery
    .input(z.object({ status: z.string().optional(), roomTypeId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(roomInventory.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(roomInventory.status, input.status as any));
      if (input?.roomTypeId) conditions.push(eq(roomInventory.roomTypeId, input.roomTypeId));
      return db.select().from(roomInventory).where(and(...conditions));
    }),

  bookingList: authedQuery
    .input(z.object({ status: z.string().optional(), dateFrom: z.string().optional(), dateTo: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(hotelBookings.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(hotelBookings.status, input.status as any));
      if (input?.dateFrom && input?.dateTo) conditions.push(between(hotelBookings.checkIn, input.dateFrom, input.dateTo));
      return db.select().from(hotelBookings).where(and(...conditions)).orderBy(desc(hotelBookings.createdAt));
    }),

  bookingCreate: authedQuery
    .input(z.object({
      bookingNumber: z.string(),
      customerId: z.number().optional(),
      roomTypeId: z.number(),
      roomId: z.number().optional(),
      checkIn: z.string(),
      checkOut: z.string(),
      adults: z.number().optional(),
      children: z.number().optional(),
      nightlyRate: z.string(),
      totalNights: z.number(),
      subtotal: z.string().optional(),
      taxAmount: z.string().optional(),
      totalAmount: z.string().optional(),
      paidAmount: z.string().optional(),
      source: z.enum(["direct", "booking.com", "expedia", "agoda", "travel_agency", "other"]).optional(),
      channelBookingId: z.string().optional(),
      specialRequests: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(hotelBookings).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  bookingUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]).optional(),
      roomId: z.number().optional(),
      paidAmount: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(hotelBookings).set(data).where(eq(hotelBookings.id, id));
      return { success: true };
    }),

  calendarView: authedQuery
    .input(z.object({ roomId: z.number().optional(), dateFrom: z.string(), dateTo: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(bookingCalendar.tenantId, ctx.user.tenantId!)];
      if (input?.roomId) conditions.push(eq(bookingCalendar.roomId, input.roomId));
      conditions.push(between(bookingCalendar.date, input.dateFrom, input.dateTo));
      return db.select().from(bookingCalendar).where(and(...conditions));
    }),

  housekeepingList: authedQuery
    .input(z.object({ date: z.string().optional(), status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(housekeepingSchedule.tenantId, ctx.user.tenantId!)];
      if (input?.date) conditions.push(eq(housekeepingSchedule.date, input.date));
      if (input?.status) conditions.push(eq(housekeepingSchedule.status, input.status as any));
      return db.select().from(housekeepingSchedule).where(and(...conditions));
    }),

  folioList: authedQuery
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.select().from(folioCharges).where(and(eq(folioCharges.tenantId, ctx.user.tenantId!), eq(folioCharges.bookingId, input.bookingId)));
    }),

  folioCreate: authedQuery
    .input(z.object({
      bookingId: z.number(),
      chargeType: z.enum(["room", "restaurant", "minibar", "laundry", "spa", "transport", "other"]).optional(),
      description: z.string(),
      amount: z.string(),
      quantity: z.number().optional(),
      totalAmount: z.string(),
      chargeDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(folioCharges).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  hotelStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [available] = await db.select({ count: sql<number>`count(*)` }).from(roomInventory).where(and(eq(roomInventory.tenantId, tenantId), eq(roomInventory.status, "available")));
      const [occupied] = await db.select({ count: sql<number>`count(*)` }).from(roomInventory).where(and(eq(roomInventory.tenantId, tenantId), eq(roomInventory.status, "occupied")));
      const [todayCheckIns] = await db.select({ count: sql<number>`count(*)` }).from(hotelBookings).where(and(eq(hotelBookings.tenantId, tenantId), eq(hotelBookings.checkIn, sql`curdate()`), eq(hotelBookings.status, "confirmed")));
      const [todayCheckOuts] = await db.select({ count: sql<number>`count(*)` }).from(hotelBookings).where(and(eq(hotelBookings.tenantId, tenantId), eq(hotelBookings.checkOut, sql`curdate()`), eq(hotelBookings.status, "checked_in")));
      return { availableRooms: available.count, occupiedRooms: occupied.count, todayCheckIns: todayCheckIns.count, todayCheckOuts: todayCheckOuts.count };
    }),
});
