import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

export const olapRouter = createRouter({
  // ── Fact Tables ──
  listFactTables: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.dwFactTables)
      .where(eq(schema.dwFactTables.tenantId, ctx.user.tenantId!));
  }),
  createFactTable: adminQuery
    .input(z.object({
      factName: z.string().min(1), factCode: z.string().optional(),
      description: z.string().optional(), sourceSchema: z.string().optional(),
      sourceTable: z.string().optional(),
      refreshFrequency: z.enum(["realtime", "hourly", "daily", "weekly", "monthly"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.dwFactTables).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return item;
    }),

  // ── Dimension Tables ──
  listDimensions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.dwDimensionTables)
      .where(eq(schema.dwDimensionTables.tenantId, ctx.user.tenantId!));
  }),
  createDimension: adminQuery
    .input(z.object({
      dimensionName: z.string().min(1), dimensionCode: z.string().optional(),
      description: z.string().optional(), sourceTable: z.string().optional(),
      type: z.enum(["conformed", "role_playing", "junk", "degenerated"]).optional(),
      hierarchyLevels: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.dwDimensionTables).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return item;
    }),

  // ── Cubes ──
  listCubes: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.dwCubes)
      .where(eq(schema.dwCubes.tenantId, ctx.user.tenantId!));
  }),
  getCube: authedQuery.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const [cube] = await db.select().from(schema.dwCubes)
      .where(and(eq(schema.dwCubes.id, input.id), eq(schema.dwCubes.tenantId, ctx.user.tenantId!)));
    if (!cube) return null;
    const dimensions = await db.select().from(schema.dwCubeDimensions)
      .where(eq(schema.dwCubeDimensions.cubeId, cube.id));
    const measures = await db.select().from(schema.dwCubeMeasures)
      .where(eq(schema.dwCubeMeasures.cubeId, cube.id));
    return { ...cube, dimensions, measures };
  }),
  createCube: adminQuery
    .input(z.object({
      cubeName: z.string().min(1), cubeCode: z.string().optional(),
      description: z.string().optional(), factTableId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.dwCubes).values({
        tenantId: ctx.user.tenantId!, ...input,
      }).$returningId();
      return item;
    }),
  updateCube: adminQuery
    .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(schema.dwCubes).set(input.data)
        .where(and(eq(schema.dwCubes.id, input.id), eq(schema.dwCubes.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  // ── Cube Dimensions ──
  addCubeDimension: adminQuery
    .input(z.object({ cubeId: z.number(), dimensionId: z.number(), dimensionType: z.enum(["regular", "role_playing"]).optional(), roleName: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.dwCubeDimensions).values(input).$returningId();
      return item;
    }),
  removeCubeDimension: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(schema.dwCubeDimensions).where(eq(schema.dwCubeDimensions.id, input.id));
    return { success: true };
  }),

  // ── Cube Measures ──
  addCubeMeasure: adminQuery
    .input(z.object({
      cubeId: z.number(), measureName: z.string().min(1), measureCode: z.string().optional(),
      aggregationType: z.enum(["sum", "avg", "count", "min", "max", "distinct_count"]),
      sourceColumn: z.string().optional(), format: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.dwCubeMeasures).values(input).$returningId();
      return item;
    }),
  removeCubeMeasure: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(schema.dwCubeMeasures).where(eq(schema.dwCubeMeasures.id, input.id));
    return { success: true };
  }),

  // ── ETL Metadata ──
  listEtlMetadata: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.dwEtlMetadata)
      .where(eq(schema.dwEtlMetadata.tenantId, ctx.user.tenantId!));
  }),

  // ── Certified Data ──
  listCertifiedData: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.dwEpsilonCertifiedData)
      .where(eq(schema.dwEpsilonCertifiedData.tenantId, ctx.user.tenantId!));
  }),

  // ── Functions ──
  runCubeProcess: adminQuery.input(z.object({ cubeId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.update(schema.dwCubes).set({ lastProcessedAt: new Date() })
      .where(and(eq(schema.dwCubes.id, input.cubeId), eq(schema.dwCubes.tenantId, ctx.user.tenantId!)));
    return { success: true, message: "Cube processing started" };
  }),

  getCubeData: authedQuery
    .input(z.object({
      cubeId: z.number(),
      dimensions: z.array(z.number()).optional(),
      measures: z.array(z.number()).optional(),
      filters: z.record(z.string(), z.any()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const [cube] = await db.select().from(schema.dwCubes)
        .where(and(eq(schema.dwCubes.id, input.cubeId), eq(schema.dwCubes.tenantId, ctx.user.tenantId!)));
      if (!cube) throw new Error("Cube not found");
      const dimensions = await db.select().from(schema.dwCubeDimensions)
        .where(eq(schema.dwCubeDimensions.cubeId, cube.id));
      const measures = await db.select().from(schema.dwCubeMeasures)
        .where(eq(schema.dwCubeMeasures.cubeId, cube.id));
      const requestedDims = dimensions.filter(d => !input.dimensions || input.dimensions.includes(d.id));
      const requestedMeasures = measures.filter(m => !input.measures || input.measures.includes(m.id));
      return {
        cube,
        dimensions: requestedDims,
        measures: requestedMeasures,
        rows: [],
        totalRows: 0,
        query: input,
      };
    }),

  olapDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [cubeCount] = await db.select({ total: sql<number>`count(*)` }).from(schema.dwCubes)
      .where(eq(schema.dwCubes.tenantId, tenantId));
    const [dimCount] = await db.select({ total: sql<number>`count(*)` }).from(schema.dwDimensionTables)
      .where(eq(schema.dwDimensionTables.tenantId, tenantId));
    const [measureCount] = await db.select({ total: sql<number>`count(*)` }).from(schema.dwCubeMeasures);
    const [factCount] = await db.select({ total: sql<number>`count(*)` }).from(schema.dwFactTables)
      .where(eq(schema.dwFactTables.tenantId, tenantId));
    return {
      cubeCount: cubeCount?.total || 0,
      dimensionCount: dimCount?.total || 0,
      measureCount: measureCount?.total || 0,
      factTableCount: factCount?.total || 0,
    };
  }),

  dimensionList: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.dwDimensionTables)
      .where(and(eq(schema.dwDimensionTables.tenantId, ctx.user.tenantId!), eq(schema.dwDimensionTables.isActive, true)));
  }),
});
