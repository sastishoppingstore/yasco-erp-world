import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  warehouseZones, storageLocations, storageBins, putawayRules, putawayTasks,
  pickingRules, pickingTasks, wavePicking, cycleCountSchedules, cycleCountEntries,
  inventoryAdjustmentReasons, products, warehouses
} from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const wmsRouter = createRouter({
  // Zones
  zoneList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(warehouseZones).where(eq(warehouseZones.tenantId, ctx.user.tenantId!));
  }),
  zoneCreate: authedQuery.input(z.object({
    warehouseId: z.number(), zoneCode: z.string(), zoneName: z.string(),
    zoneType: z.enum(["storage","picking","putaway","shipping","receiving","quarantine"]),
    capacity: z.string().optional(), colorCode: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(warehouseZones).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // Locations
  locationList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(storageLocations).where(eq(storageLocations.tenantId, ctx.user.tenantId!));
  }),
  locationCreate: authedQuery.input(z.object({
    warehouseId: z.number(), zoneId: z.number().optional(), locationCode: z.string(),
    locationType: z.enum(["rack","floor","bulk","shelf","bin","drawer"]),
    aisle: z.string().optional(), rack: z.string().optional(), shelf: z.string().optional(), bin: z.string().optional(),
    capacity: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(storageLocations).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // Storage Bins
  storageBinList: authedQuery.input(z.object({ locationId: z.number().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    if (input?.locationId) return db.select().from(storageBins).where(eq(storageBins.locationId, input.locationId));
    return db.select().from(storageBins);
  }),

  // Putaway Rules
  putawayRuleList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(putawayRules).where(eq(putawayRules.tenantId, ctx.user.tenantId!));
  }),
  putawayRuleCreate: authedQuery.input(z.object({
    ruleName: z.string(), warehouseId: z.number(),
    strategy: z.enum(["fixed","first_empty","near_expiry","fifo","random","last_location"]),
    productId: z.number().optional(), zoneId: z.number().optional(), isDefault: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(putawayRules).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // Putaway Tasks
  putawayTaskList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(putawayTasks).where(eq(putawayTasks.tenantId, ctx.user.tenantId!)).orderBy(desc(putawayTasks.createdAt));
  }),
  putawayTaskComplete: authedQuery.input(z.object({ id: z.number(), toLocationId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(putawayTasks).set({ status: "completed", toLocationId: input.toLocationId, completedAt: new Date() }).where(eq(putawayTasks.id, input.id));
    return { success: true };
  }),

  // Picking Rules
  pickingRuleList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(pickingRules).where(eq(pickingRules.tenantId, ctx.user.tenantId!));
  }),
  pickingRuleCreate: authedQuery.input(z.object({
    ruleName: z.string(),
    strategy: z.enum(["fifo","fefo","lifo","zone","batch","wave"]),
    waveSize: z.number().optional(), isDefault: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(pickingRules).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // Picking Tasks
  pickingTaskList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(pickingTasks).where(eq(pickingTasks.tenantId, ctx.user.tenantId!)).orderBy(desc(pickingTasks.createdAt));
  }),
  pickingTaskComplete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(pickingTasks).set({ status: "completed", completedAt: new Date() }).where(eq(pickingTasks.id, input.id));
    return { success: true };
  }),

  // Wave Picking
  waveList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(wavePicking).where(eq(wavePicking.tenantId, ctx.user.tenantId!)).orderBy(desc(wavePicking.createdAt));
  }),
  createWave: authedQuery.input(z.object({
    waveType: z.enum(["single_order","multi_order","zone"]),
    orderIds: z.array(z.number()),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const waveNum = `WAVE-${Date.now()}`;
    const [{ id }] = await db.insert(wavePicking).values({
      tenantId: ctx.user.tenantId!, waveNumber: waveNum, waveType: input.waveType,
      orderIds: input.orderIds, totalItems: input.orderIds.length, status: "created",
    }).$returningId();
    return { id, waveNumber: waveNum, success: true };
  }),
  completeWave: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(wavePicking).set({ status: "completed", completedAt: new Date() }).where(eq(wavePicking.id, input.id));
    return { success: true };
  }),

  // Cycle Count Schedules
  cycleCountList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(cycleCountSchedules).where(eq(cycleCountSchedules.tenantId, ctx.user.tenantId!)).orderBy(desc(cycleCountSchedules.createdAt));
  }),
  cycleCountCreate: authedQuery.input(z.object({
    warehouseId: z.number(), zoneId: z.number().optional(), countDate: z.string(),
    frequency: z.enum(["daily","weekly","monthly","quarterly","annually"]),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [{ id }] = await db.insert(cycleCountSchedules).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
    return { id, success: true };
  }),

  // Cycle Count Entries
  cycleCountEntryList: authedQuery.input(z.object({ scheduleId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(cycleCountEntries).where(eq(cycleCountEntries.scheduleId, input.scheduleId));
  }),
  cycleCountEntryCreate: authedQuery.input(z.object({
    scheduleId: z.number(), locationId: z.number(), productId: z.number(),
    expectedQuantity: z.string(), actualQuantity: z.string(),
    varianceReason: z.enum(["mispick","putaway_error","damage","theft","system_error","other"]).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const variance = (Number(input.actualQuantity) - Number(input.expectedQuantity)).toFixed(4);
    const [{ id }] = await db.insert(cycleCountEntries).values({
      ...input, variance, countedBy: ctx.user.id, status: "open",
    }).$returningId();
    return { id, success: true };
  }),

  // Inventory Adjustment Reasons
  adjustmentReasonList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(inventoryAdjustmentReasons).where(eq(inventoryAdjustmentReasons.tenantId, ctx.user.tenantId!));
  }),

  // Suggest Location (putaway suggestion)
  suggestLocation: authedQuery.input(z.object({ productId: z.number(), warehouseId: z.number(), quantity: z.number() })).query(async ({ input }) => {
    const db = getDb();
    // Find applicable putaway rules
    const rules = await db.select().from(putawayRules)
      .where(and(eq(putawayRules.warehouseId, input.warehouseId), eq(putawayRules.isActive, true)))
      .orderBy(putawayRules.priority);
    // Find available locations
    const locations = await db.select().from(storageLocations)
      .where(and(eq(storageLocations.warehouseId, input.warehouseId), eq(storageLocations.status, "available")));
    const suggested: any[] = [];
    for (const rule of rules) {
      if (rule.strategy === "first_empty") {
        const loc = locations.find(l => l.zoneId === rule.zoneId && l.status === "available" && Number(l.usedCapacity) === 0);
        if (loc) suggested.push({ location: loc, rule: rule.ruleName });
      } else if (rule.strategy === "fixed" && rule.productId === input.productId) {
        const fixedLoc = locations.find(l => l.zoneId === rule.zoneId);
        if (fixedLoc) suggested.push({ location: fixedLoc, rule: rule.ruleName });
      }
    }
    if (suggested.length === 0 && locations.length > 0) {
      suggested.push({ location: locations[0], rule: "default" });
    }
    return suggested;
  }),

  // Get location by product
  getLocationByProduct: authedQuery.input(z.object({ productId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const bins = await db.select().from(storageBins).where(eq(storageBins.productId, input.productId));
    const locationIds = [...new Set(bins.map(b => b.locationId))];
    const locations = await Promise.all(locationIds.map(id => db.query.storageLocations.findFirst({ where: eq(storageLocations.id, id) })));
    return { bins, locations: locations.filter(Boolean) };
  }),

  // Generate putaway task from receipt
  generatePutawayTask: authedQuery.input(z.object({
    sourceType: z.enum(["purchase","return","transfer_in","manufacturing"]),
    sourceId: z.number(), productId: z.number(), quantity: z.string(),
    toLocationId: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const taskNum = `PA-${Date.now()}`;
    const [{ id }] = await db.insert(putawayTasks).values({
      tenantId: ctx.user.tenantId!, taskNumber: taskNum, ...input,
    }).$returningId();
    return { id, taskNumber: taskNum, success: true };
  }),

  // Generate picking task from sales order
  generatePickingTask: authedQuery.input(z.object({
    sourceType: z.enum(["sales_order","transfer_out","manufacturing_issue"]),
    sourceId: z.number(), productId: z.number(), quantity: z.string(),
    fromLocationId: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const taskNum = `PK-${Date.now()}`;
    const [{ id }] = await db.insert(pickingTasks).values({
      tenantId: ctx.user.tenantId!, taskNumber: taskNum, ...input,
    }).$returningId();
    return { id, taskNumber: taskNum, success: true };
  }),

  // WMS Dashboard
  wmsDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const totalLocations = await db.select({ count: sql<number>`count(*)` }).from(storageLocations).where(eq(storageLocations.tenantId, tenantId));
    const occupied = await db.select({ count: sql<number>`count(*)` }).from(storageLocations).where(and(eq(storageLocations.tenantId, tenantId), eq(storageLocations.status, "occupied")));
    const activePutaway = await db.select({ count: sql<number>`count(*)` }).from(putawayTasks).where(and(eq(putawayTasks.tenantId, tenantId), eq(putawayTasks.status, "in_progress")));
    const activePicking = await db.select({ count: sql<number>`count(*)` }).from(pickingTasks).where(and(eq(pickingTasks.tenantId, tenantId), eq(pickingTasks.status, "in_progress")));
    const pendingCycle = await db.select({ count: sql<number>`count(*)` }).from(cycleCountSchedules).where(and(eq(cycleCountSchedules.tenantId, tenantId), eq(cycleCountSchedules.status, "scheduled")));
    const total = Number(totalLocations[0]?.count || 0);
    return {
      totalLocations: total,
      occupiedLocations: Number(occupied[0]?.count || 0),
      occupancyRate: total > 0 ? ((Number(occupied[0]?.count || 0) / total) * 100).toFixed(1) : "0",
      activePutawayTasks: Number(activePutaway[0]?.count || 0),
      activePickingTasks: Number(activePicking[0]?.count || 0),
      pendingCycleCounts: Number(pendingCycle[0]?.count || 0),
    };
  }),
});
