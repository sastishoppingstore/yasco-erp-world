import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { supportTickets, ticketComments } from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const helpdeskRouter = createRouter({
  ticketList: authedQuery
    .input(z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(supportTickets.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(supportTickets.status, input.status as any));
      if (input?.priority) conditions.push(eq(supportTickets.priority, input.priority as any));
      if (input?.assignedTo) conditions.push(eq(supportTickets.assignedTo, input.assignedTo));
      return db.select().from(supportTickets).where(and(...conditions)).orderBy(desc(supportTickets.createdAt));
    }),

  ticketGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const ticket = await db.query.supportTickets.findFirst({ where: eq(supportTickets.id, input.id) });
      const comments = await db.select().from(ticketComments).where(eq(ticketComments.ticketId, input.id));
      return { ticket, comments };
    }),

  ticketCreate: authedQuery
    .input(z.object({
      ticketNumber: z.string(),
      subject: z.string(),
      description: z.string(),
      category: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      requesterName: z.string().optional(),
      requesterEmail: z.string().optional(),
      requesterPhone: z.string().optional(),
      assignedTo: z.number().optional(),
      source: z.enum(["email", "phone", "web", "chat", "whatsapp"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(supportTickets).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }).$returningId();
      return { id, success: true };
    }),

  ticketUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["open", "in_progress", "waiting", "resolved", "closed", "escalated"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      assignedTo: z.number().optional(),
      resolvedAt: z.string().optional(),
      satisfaction: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData = {
        ...data,
        resolvedAt: data.status === "resolved" ? new Date() : data.resolvedAt ? new Date(data.resolvedAt) : undefined,
        closedAt: data.status === "closed" ? new Date() : undefined,
      };
      await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, id));
      return { success: true };
    }),

  commentCreate: authedQuery
    .input(z.object({
      ticketId: z.number(),
      userId: z.number().optional(),
      comment: z.string(),
      isInternal: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(ticketComments).values(input).$returningId();
      return { id, success: true };
    }),

  helpdeskStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const [totalTickets] = await db.select({ count: sql<number>`count(*)` }).from(supportTickets).where(eq(supportTickets.tenantId, tenantId));
      const [openTickets] = await db.select({ count: sql<number>`count(*)` }).from(supportTickets).where(and(eq(supportTickets.tenantId, tenantId), eq(supportTickets.status, "open")));
      const [resolvedToday] = await db.select({ count: sql<number>`count(*)` }).from(supportTickets).where(and(eq(supportTickets.tenantId, tenantId), eq(supportTickets.status, "resolved"), sql`date(resolved_at) = curdate()`));
      const [highPriority] = await db.select({ count: sql<number>`count(*)` }).from(supportTickets).where(and(eq(supportTickets.tenantId, tenantId), eq(supportTickets.priority, "urgent"), eq(supportTickets.status, "open")));

      return {
        totalTickets: totalTickets.count,
        openTickets: openTickets.count,
        resolvedToday: resolvedToday.count,
        highPriority: highPriority.count,
      };
    }),
});
