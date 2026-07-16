import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  products, productCategories, brands, units, warehouses,
  inventoryBalances, inventoryMovements, stockTransfers,
  stockTransferItems, stockAdjustments, stockAdjustmentItems
} from "@db/schema";
import { eq, sql, and, like, desc } from "drizzle-orm";
import { checkLowStockAndNotify } from "./lib/notifications/events";

export const inventoryRouter = createRouter({
  // Product Categories
  categoryList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(productCategories).where(eq(productCategories.tenantId, ctx.user.tenantId!));
    }),

  categoryCreate: authedQuery
    .input(z.object({ name: z.string(), nameAr: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(productCategories).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Brands
  brandList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(brands).where(eq(brands.tenantId, ctx.user.tenantId!));
    }),

  brandCreate: authedQuery
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(brands).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Units
  unitList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(units).where(eq(units.tenantId, ctx.user.tenantId!));
    }),

  // Warehouses
  warehouseList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(warehouses).where(eq(warehouses.tenantId, ctx.user.tenantId!));
    }),

  warehouseCreate: authedQuery
    .input(z.object({
      code: z.string(),
      name: z.string(),
      address: z.string().optional(),
      managerName: z.string().optional(),
      phone: z.string().optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(warehouses).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Products
  productList: authedQuery
    .input(z.object({
      categoryId: z.number().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(products.tenantId, tenantId)];
      if (input?.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
      if (input?.search) conditions.push(like(products.name, `%${input.search}%`));
      return db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
    }),

  productGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.id),
      });
      const balances = await db.select().from(inventoryBalances)
        .where(eq(inventoryBalances.productId, input.id));
      return { product, balances };
    }),

  productCreate: authedQuery
    .input(z.object({
      sku: z.string(),
      name: z.string(),
      nameAr: z.string().optional(),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      brandId: z.number().optional(),
      unitId: z.number().optional(),
      barcode: z.string().optional(),
      productType: z.enum(["goods", "service", "raw_material", "finished_good"]).optional(),
      purchasePrice: z.string().optional(),
      salePrice: z.string().optional(),
      costMethod: z.enum(["fifo", "lifo", "weighted_average"]).optional(),
      reorderLevel: z.number().optional(),
      taxRate: z.string().optional(),
      isTaxable: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(products).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        costMethod: input.costMethod || "fifo",
      }).$returningId();
      return { id, success: true };
    }),

  productUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      sku: z.string().optional(),
      name: z.string().optional(),
      nameAr: z.string().optional(),
      purchasePrice: z.string().optional(),
      salePrice: z.string().optional(),
      isActive: z.boolean().optional(),
      reorderLevel: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  // Inventory Balances
  inventoryList: authedQuery
    .input(z.object({
      warehouseId: z.number().optional(),
      lowStock: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(inventoryBalances.tenantId, tenantId)];
      if (input?.warehouseId) conditions.push(eq(inventoryBalances.warehouseId, input.warehouseId));
      if (input?.lowStock) conditions.push(sql`quantity <= 10`);

      return db.select({
        id: inventoryBalances.id,
        productId: inventoryBalances.productId,
        warehouseId: inventoryBalances.warehouseId,
        quantity: inventoryBalances.quantity,
        reservedQuantity: inventoryBalances.reservedQuantity,
        avgCost: inventoryBalances.avgCost,
        totalValue: inventoryBalances.totalValue,
        productName: products.name,
        productSku: products.sku,
        warehouseName: warehouses.name,
        reorderLevel: products.reorderLevel,
      })
        .from(inventoryBalances)
        .leftJoin(products, eq(inventoryBalances.productId, products.id))
        .leftJoin(warehouses, eq(inventoryBalances.warehouseId, warehouses.id))
        .where(and(...conditions));
    }),

  // Stock Movements
  movementList: authedQuery
    .input(z.object({
      productId: z.number().optional(),
      warehouseId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(inventoryMovements.tenantId, tenantId)];
      if (input?.productId) conditions.push(eq(inventoryMovements.productId, input.productId));
      if (input?.warehouseId) conditions.push(eq(inventoryMovements.warehouseId, input.warehouseId));
      return db.select().from(inventoryMovements)
        .where(and(...conditions))
        .orderBy(desc(inventoryMovements.createdAt));
    }),

  // Stock Transfers
  transferList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(stockTransfers).where(eq(stockTransfers.tenantId, ctx.user.tenantId!));
    }),

  transferCreate: authedQuery
    .input(z.object({
      transferNumber: z.string(),
      fromWarehouseId: z.number(),
      toWarehouseId: z.number(),
      date: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitCost: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(stockTransfers).values({
        tenantId: ctx.user.tenantId!,
        transferNumber: input.transferNumber,
        fromWarehouseId: input.fromWarehouseId,
        toWarehouseId: input.toWarehouseId,
        date: input.date,
        notes: input.notes,
      }).$returningId();

      for (const item of input.items) {
        await db.insert(stockTransferItems).values({
          transferId: id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        });
      }
      return { id, success: true };
    }),

  // Stock Adjustments
  adjustmentList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(stockAdjustments).where(eq(stockAdjustments.tenantId, ctx.user.tenantId!));
    }),
});
