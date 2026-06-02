import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  billOfMaterials, bomItems, workOrders, productionOrders, productionItems
} from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const manufacturingRouter = createRouter({
  // BOM
  bomList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(billOfMaterials).where(eq(billOfMaterials.tenantId, ctx.user.tenantId!));
    }),

  bomCreate: authedQuery
    .input(z.object({
      productId: z.number(),
      version: z.string().optional(),
      quantity: z.number().optional(),
      laborCost: z.string().optional(),
      overheadCost: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.string(),
        unitCost: z.string().optional(),
        wastagePercent: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...bomData } = input;
      const [{ id }] = await db.insert(billOfMaterials).values({
        ...bomData,
        tenantId: ctx.user.tenantId!,
      }).$returningId();
      for (const item of items) {
        await db.insert(bomItems).values({
          ...item,
          bomId: id,
          totalCost: item.unitCost ? (Number(item.quantity) * Number(item.unitCost)).toString() : "0",
        });
      }
      return { id, success: true };
    }),

  bomGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const bom = await db.query.billOfMaterials.findFirst({ where: eq(billOfMaterials.id, input.id) });
      const items = await db.select().from(bomItems).where(eq(bomItems.bomId, input.id));
      return { bom, items };
    }),

  // Work Orders
  workOrderList: authedQuery
    .input(z.object({
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(workOrders.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(workOrders.status, input.status as any));
      return db.select().from(workOrders).where(and(...conditions)).orderBy(desc(workOrders.createdAt));
    }),

  workOrderCreate: authedQuery
    .input(z.object({
      woNumber: z.string(),
      bomId: z.number().optional(),
      productId: z.number(),
      quantity: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      estimatedCost: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(workOrders).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  workOrderUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["planned", "in_progress", "completed", "cancelled"]).optional(),
      producedQty: z.number().optional(),
      actualCost: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(workOrders).set(data).where(eq(workOrders.id, id));
      return { success: true };
    }),

  // Production Orders
  productionOrderList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(productionOrders).where(eq(productionOrders.tenantId, ctx.user.tenantId!));
    }),

  productionOrderCreate: authedQuery
    .input(z.object({
      poNumber: z.string(),
      workOrderId: z.number().optional(),
      warehouseId: z.number(),
      date: z.string(),
      totalCost: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitCost: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...poData } = input;
      const [{ id }] = await db.insert(productionOrders).values({
        ...poData,
        tenantId: ctx.user.tenantId!,
      }).$returningId();
      for (const item of items) {
        await db.insert(productionItems).values({
          ...item,
          productionOrderId: id,
          totalCost: item.unitCost ? (item.quantity * Number(item.unitCost)).toString() : "0",
        });
      }
      return { id, success: true };
    }),
});
