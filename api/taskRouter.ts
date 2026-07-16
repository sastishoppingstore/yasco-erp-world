import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, asc, desc, gte, lte, sql, like } from "drizzle-orm";

export const taskRouter = createRouter({
  list: authedQuery
    .input(z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.number().optional(),
      projectId: z.number().positive(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(schema.projectTasks.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(schema.projectTasks.status, input.status as any));
      if (input?.priority) conditions.push(eq(schema.projectTasks.priority, input.priority as any));
      if (input?.assignedTo) conditions.push(eq(schema.projectTasks.assignedTo, input.assignedTo));
      if (input?.projectId) conditions.push(eq(schema.projectTasks.projectId, input.projectId));
      if (input?.search) conditions.push(like(schema.projectTasks.name, `%${input.search}%`));
      return db.select().from(schema.projectTasks).where(and(...conditions)).orderBy(desc(schema.projectTasks.createdAt));
    }),
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const task = await db.query.projectTasks.findFirst({ where: eq(schema.projectTasks.id, input.id) });
      if (!task) throw new Error("Task not found");
      const comments = await db.select().from(schema.taskComments).where(eq(schema.taskComments.taskId, input.id)).orderBy(desc(schema.taskComments.createdAt));
      const attachments = await db.select().from(schema.taskAttachments).where(eq(schema.taskAttachments.taskId, input.id)).orderBy(desc(schema.taskAttachments.createdAt));
      return { ...task, comments, attachments };
    }),
  create: authedQuery
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      dueDate: z.string().optional(),
      assignedTo: z.number().optional(),
      projectId: z.number().positive(),
      relatedCustomerId: z.number().optional(),
      relatedInvoiceId: z.number().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [{ id }] = await db.insert(schema.projectTasks).values({
        tenantId,
        projectId: input.projectId,
        name: input.title,
        description: input.description || null,
        assignedTo: input.assignedTo || null,
        dueDate: input.dueDate || null,
        priority: input.priority || "medium",
        status: "todo",
        createdBy: ctx.user.id,
      }).$returningId();
      if (input.assignedTo) {
        const assignedUser = await db.query.users.findFirst({ where: eq(schema.users.id, input.assignedTo) });
        if (assignedUser) {
          await db.insert(schema.notifications).values({
            tenantId,
            userId: input.assignedTo,
            type: "info",
            title: "New Task Assigned",
            message: `You have been assigned a new task: ${input.title}`,
            link: `/tasks/${id}`,
          });
        }
      }
      return { id, success: true };
    }),
  update: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      status: z.enum(["todo", "in_progress", "review", "done", "cancelled"]).optional(),
      dueDate: z.string().optional(),
      assignedTo: z.number().optional(),
      progress: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "done") updateData.completedAt = new Date();
      await db.update(schema.projectTasks).set(updateData).where(eq(schema.projectTasks.id, id));
      return { success: true };
    }),
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.taskComments).where(eq(schema.taskComments.taskId, input.id));
      await db.delete(schema.taskAttachments).where(eq(schema.taskAttachments.taskId, input.id));
      await db.delete(schema.projectTasks).where(eq(schema.projectTasks.id, input.id));
      return { success: true };
    }),
  addComment: authedQuery
    .input(z.object({ taskId: z.number(), comment: z.string().min(1), isInternal: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(schema.taskComments).values({
        tenantId: ctx.user.tenantId!,
        taskId: input.taskId,
        userId: ctx.user.id,
        comment: input.comment,
        isInternal: input.isInternal || false,
      }).$returningId();
      return { id, success: true };
    }),
  addAttachment: authedQuery
    .input(z.object({ taskId: z.number(), fileName: z.string(), filePath: z.string(), fileSize: z.number().optional(), mimeType: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(schema.taskAttachments).values({
        tenantId: ctx.user.tenantId!,
        taskId: input.taskId,
        fileName: input.fileName,
        filePath: input.filePath,
        fileSize: input.fileSize || null,
        mimeType: input.mimeType || null,
        uploadedBy: ctx.user.id,
      }).$returningId();
      return { id, success: true };
    }),
  myTasks: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.projectTasks).where(
      and(eq(schema.projectTasks.tenantId, ctx.user.tenantId!), eq(schema.projectTasks.assignedTo, ctx.user.id)),
    ).orderBy(desc(schema.projectTasks.createdAt));
  }),
  kanbanBoard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const tasks = await db.select().from(schema.projectTasks).where(eq(schema.projectTasks.tenantId, tenantId)).orderBy(desc(schema.projectTasks.createdAt));
    return {
      todo: tasks.filter(t => t.status === "todo"),
      in_progress: tasks.filter(t => t.status === "in_progress"),
      review: tasks.filter(t => t.status === "review"),
      done: tasks.filter(t => t.status === "done"),
      cancelled: tasks.filter(t => t.status === "cancelled"),
    };
  }),
  calendarData: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const tasks = await db.select().from(schema.projectTasks).where(
      and(eq(schema.projectTasks.tenantId, tenantId), sql`${schema.projectTasks.dueDate} IS NOT NULL`),
    ).orderBy(asc(schema.projectTasks.dueDate));
    return tasks.map(t => ({
      id: t.id,
      title: t.name,
      start: t.dueDate,
      end: t.dueDate,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo,
    }));
  }),
});
