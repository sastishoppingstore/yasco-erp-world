import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects, projectTasks, projectMilestones, timesheets } from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const projectsRouter = createRouter({
  // Projects
  projectList: authedQuery
    .input(z.object({
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(projects.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(projects.status, input.status as any));
      return db.select().from(projects).where(and(...conditions)).orderBy(desc(projects.createdAt));
    }),

  projectGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const project = await db.query.projects.findFirst({ where: eq(projects.id, input.id) });
      const tasks = await db.select().from(projectTasks).where(eq(projectTasks.projectId, input.id));
      const milestones = await db.select().from(projectMilestones).where(eq(projectMilestones.projectId, input.id));
      return { project, tasks, milestones };
    }),

  projectCreate: authedQuery
    .input(z.object({
      projectCode: z.string(),
      name: z.string(),
      description: z.string().optional(),
      customerId: z.number().optional(),
      managerId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(projects).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  projectUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
      progress: z.number().optional(),
      actualCost: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(projects).set(data).where(eq(projects.id, id));
      return { success: true };
    }),

  // Tasks
  taskList: authedQuery
    .input(z.object({
      projectId: z.number().optional(),
      status: z.string().optional(),
      assignedTo: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(projectTasks.tenantId, tenantId)];
      if (input?.projectId) conditions.push(eq(projectTasks.projectId, input.projectId));
      if (input?.status) conditions.push(eq(projectTasks.status, input.status as any));
      if (input?.assignedTo) conditions.push(eq(projectTasks.assignedTo, input.assignedTo));
      return db.select().from(projectTasks).where(and(...conditions)).orderBy(desc(projectTasks.createdAt));
    }),

  taskCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      assignedTo: z.number().optional(),
      startDate: z.string().optional(),
      dueDate: z.string().optional(),
      estimatedHours: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      parentId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(projectTasks).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  taskUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["todo", "in_progress", "review", "done", "cancelled"]).optional(),
      progress: z.number().optional(),
      actualHours: z.string().optional(),
      completedAt: z.string().optional(),
      assignedTo: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(projectTasks).set({
        ...data,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      }).where(eq(projectTasks.id, id));
      return { success: true };
    }),

  // Milestones
  milestoneList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(projectMilestones.tenantId, tenantId)];
      if (input?.projectId) conditions.push(eq(projectMilestones.projectId, input.projectId));
      return db.select().from(projectMilestones).where(and(...conditions));
    }),

  milestoneCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      deliverables: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(projectMilestones).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  // Timesheets
  timesheetList: authedQuery
    .input(z.object({
      employeeId: z.number().optional(),
      projectId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(timesheets.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(timesheets.employeeId, input.employeeId));
      if (input?.projectId) conditions.push(eq(timesheets.projectId, input.projectId));
      return db.select().from(timesheets).where(and(...conditions)).orderBy(desc(timesheets.date));
    }),

  timesheetCreate: authedQuery
    .input(z.object({
      employeeId: z.number(),
      projectId: z.number().optional(),
      taskId: z.number().optional(),
      date: z.string(),
      hours: z.string(),
      description: z.string().optional(),
      billable: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(timesheets).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),
});
