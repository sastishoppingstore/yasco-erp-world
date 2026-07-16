import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: authedQuery
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0), unreadOnly: z.boolean().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const limit = input?.limit || 50;
      const offset = input?.offset || 0;
      const conditions = [eq(schema.notifications.tenantId, tenantId), eq(schema.notifications.userId, ctx.user.id)];
      if (input?.unreadOnly) conditions.push(eq(schema.notifications.isRead, false));
      const items = await db.select().from(schema.notifications).where(and(...conditions)).orderBy(desc(schema.notifications.createdAt)).limit(limit).offset(offset);
      const [totalResult] = await db.select({ total: sql<number>`count(*)` }).from(schema.notifications).where(and(...conditions));
      const [unreadResult] = await db.select({ count: sql<number>`count(*)` }).from(schema.notifications).where(
        and(eq(schema.notifications.tenantId, tenantId), eq(schema.notifications.userId, ctx.user.id), eq(schema.notifications.isRead, false)),
      );
      return { items, total: totalResult?.total || 0, unreadCount: unreadResult?.count || 0 };
    }),
  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(schema.notifications).set({ isRead: true }).where(
        and(eq(schema.notifications.id, input.id), eq(schema.notifications.userId, ctx.user.id)),
      );
      return { success: true };
    }),
  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.update(schema.notifications).set({ isRead: true }).where(
      and(eq(schema.notifications.tenantId, ctx.user.tenantId!), eq(schema.notifications.userId, ctx.user.id), eq(schema.notifications.isRead, false)),
    );
    return { success: true };
  }),
  getPreferences: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const prefs = await db.query.notificationTemplates.findFirst({
      where: eq(schema.notificationTemplates.tenantId, ctx.user.tenantId!),
    });
    return {
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: false,
      pushEnabled: true,
      categories: prefs ? [prefs.templateKey] : [],
    };
  }),
  updatePreferences: authedQuery
    .input(z.object({
      emailEnabled: z.boolean(),
      smsEnabled: z.boolean(),
      whatsappEnabled: z.boolean(),
      pushEnabled: z.boolean(),
      categories: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const existing = await db.query.notificationTemplates.findFirst({ where: eq(schema.notificationTemplates.tenantId, tenantId) });
      if (existing) {
        await db.update(schema.notificationTemplates).set({
          variables: input as any,
        }).where(eq(schema.notificationTemplates.tenantId, tenantId));
      } else {
        await db.insert(schema.notificationTemplates).values({
          tenantId,
          templateKey: "user_preferences",
          name: "User Notification Preferences",
          title: "Notification Preferences",
          message: JSON.stringify(input),
          type: "info",
          variables: input as any,
        });
      }
      return { success: true };
    }),
});
