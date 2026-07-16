import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, asc, isNull, sql } from "drizzle-orm";

export const chatRouter = createRouter({
  myConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    return db.select().from(schema.chatConversations)
      .where(and(eq(schema.chatConversations.tenantId, tenantId), eq(schema.chatConversations.status, "active")))
      .orderBy(desc(schema.chatConversations.lastMessageAt));
  }),
  adminConversations: authedQuery.query(async () => {
    const db = getDb();
    return db.select().from(schema.chatConversations).where(eq(schema.chatConversations.status, "active"))
      .orderBy(desc(schema.chatConversations.lastMessageAt));
  }),
  messages: authedQuery.input(z.object({ conversationId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(schema.chatMessages).where(eq(schema.chatMessages.conversationId, input.conversationId))
      .orderBy(asc(schema.chatMessages.createdAt));
  }),
  startConversation: authedQuery.input(z.object({ subject: z.string().optional(), message: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [conv] = await db.insert(schema.chatConversations).values({ tenantId, status: "active" }).$returningId();
      await db.insert(schema.chatMessages).values({ conversationId: conv.id, senderType: "tenant", senderName: ctx.user.name || "User", message: input.message });
      return conv;
    }),
  sendMessage: authedQuery.input(z.object({ conversationId: z.number(), message: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const senderType = ctx.user.role === "admin" || ctx.user.role === "superadmin" ? "admin" : "tenant";
      await db.insert(schema.chatMessages).values({ conversationId: input.conversationId, senderId: ctx.user.id, senderType: senderType as any, senderName: ctx.user.name || "User", message: input.message });
      await db.update(schema.chatConversations).set({ lastMessageAt: new Date() }).where(eq(schema.chatConversations.id, input.conversationId));
      return { success: true };
    }),
  resolveConversation: authedQuery.input(z.object({ conversationId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(schema.chatConversations).set({ status: "resolved" }).where(eq(schema.chatConversations.id, input.conversationId));
    return { success: true };
  }),
  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const isAdmin = ctx.user.role === "admin" || ctx.user.role === "superadmin";
    const result = await db.select({ count: sql<number>`count(*)` }).from(schema.chatMessages)
      .innerJoin(schema.chatConversations, eq(schema.chatMessages.conversationId, schema.chatConversations.id))
      .where(and(
        isAdmin ? eq(schema.chatConversations.tenantId, tenantId) : eq(schema.chatConversations.tenantId, tenantId),
        isNull(schema.chatMessages.readAt),
        sql`${schema.chatMessages.senderType} != ${isAdmin ? "tenant" : "admin"}`
      ));
    return result[0]?.count || 0;
  }),
  markRead: authedQuery.input(z.object({ conversationId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(schema.chatMessages).set({ readAt: new Date() }).where(and(eq(schema.chatMessages.conversationId, input.conversationId), isNull(schema.chatMessages.readAt)));
    return { success: true };
  }),
});
