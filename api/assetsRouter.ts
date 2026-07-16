import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { assets, assetMaintenance, depreciationEntries, vehicles, fuelRecords, vehicleMaintenance, drivers } from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const assetsRouter = createRouter({
  // Assets
  assetList: authedQuery
    .input(z.object({
      status: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(assets.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(assets.status, input.status as any));
      if (input?.category) conditions.push(eq(assets.category, input.category));
      return db.select().from(assets).where(and(...conditions)).orderBy(desc(assets.createdAt));
    }),

  assetGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const asset = await db.query.assets.findFirst({ where: eq(assets.id, input.id) });
      const maintenance = await db.select().from(assetMaintenance).where(eq(assetMaintenance.assetId, input.id));
      const depreciation = await db.select().from(depreciationEntries).where(eq(depreciationEntries.assetId, input.id));
      return { asset, maintenance, depreciation };
    }),

  assetCreate: authedQuery
    .input(z.object({
      assetCode: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      purchaseDate: z.string().optional(),
      purchaseCost: z.string().optional(),
      salvageValue: z.string().optional(),
      usefulLife: z.number().optional(),
      depreciationMethod: z.enum(["straight_line", "declining_balance", "units_of_production"]).optional(),
      serialNumber: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      assignedTo: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const purchaseCost = Number(input.purchaseCost || 0);
      const [{ id }] = await db.insert(assets).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        bookValue: purchaseCost.toString(),
        accumulatedDepreciation: "0",
      }).$returningId();
      return { id, success: true };
    }),

  assetUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      location: z.string().optional(),
      status: z.enum(["active", "under_maintenance", "disposed", "sold"]).optional(),
      assignedTo: z.number().optional(),
      bookValue: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(assets).set(data).where(eq(assets.id, id));
      return { success: true };
    }),

  // Maintenance
  maintenanceCreate: authedQuery
    .input(z.object({
      assetId: z.number(),
      maintenanceType: z.enum(["preventive", "corrective", "predictive"]).optional(),
      date: z.string(),
      description: z.string().optional(),
      cost: z.string().optional(),
      performedBy: z.string().optional(),
      nextDueDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(assetMaintenance).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Depreciation
  depreciationList: authedQuery
    .input(z.object({
      assetId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(depreciationEntries.tenantId, tenantId)];
      if (input?.assetId) conditions.push(eq(depreciationEntries.assetId, input.assetId));
      return db.select().from(depreciationEntries).where(and(...conditions));
    }),

  // Vehicles
  vehicleList: authedQuery
    .input(z.object({
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(vehicles.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(vehicles.status, input.status as any));
      return db.select().from(vehicles).where(and(...conditions));
    }),

  vehicleCreate: authedQuery
    .input(z.object({
      vehicleNumber: z.string(),
      make: z.string(),
      model: z.string(),
      year: z.number().optional(),
      plateNumber: z.string().optional(),
      vin: z.string().optional(),
      vehicleType: z.enum(["car", "truck", "van", "bus", "bike", "other"]).optional(),
      fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"]).optional(),
      purchaseDate: z.string().optional(),
      purchaseCost: z.string().optional(),
      assignedDriverId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(vehicles).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Fuel Records
  fuelList: authedQuery
    .input(z.object({
      vehicleId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(fuelRecords.tenantId, tenantId)];
      if (input?.vehicleId) conditions.push(eq(fuelRecords.vehicleId, input.vehicleId));
      return db.select().from(fuelRecords).where(and(...conditions)).orderBy(desc(fuelRecords.date));
    }),

  fuelCreate: authedQuery
    .input(z.object({
      vehicleId: z.number(),
      date: z.string(),
      odometer: z.number(),
      liters: z.string(),
      costPerLiter: z.string().optional(),
      totalCost: z.string().optional(),
      station: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(fuelRecords).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Vehicle Maintenance
  vehicleMaintenanceList: authedQuery
    .input(z.object({ vehicleId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(vehicleMaintenance.tenantId, tenantId)];
      if (input?.vehicleId) conditions.push(eq(vehicleMaintenance.vehicleId, input.vehicleId));
      return db.select().from(vehicleMaintenance).where(and(...conditions));
    }),

  // Drivers
  driverList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(drivers).where(eq(drivers.tenantId, ctx.user.tenantId!));
    }),

  assetStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const [totalAssets] = await db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.tenantId, tenantId));
      const [activeAssets] = await db.select({ count: sql<number>`count(*)` }).from(assets).where(and(eq(assets.tenantId, tenantId), eq(assets.status, "active")));
      const [totalVehicles] = await db.select({ count: sql<number>`count(*)` }).from(vehicles).where(eq(vehicles.tenantId, tenantId));
      const [totalValue] = await db.select({ total: sql<number>`coalesce(sum(book_value), 0)` }).from(assets).where(eq(assets.tenantId, tenantId));

      return {
        totalAssets: totalAssets.count,
        activeAssets: activeAssets.count,
        totalVehicles: totalVehicles.count,
        totalValue: Number(totalValue.total),
      };
    }),
});
