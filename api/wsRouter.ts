import { z } from "zod";
import crypto from "crypto";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { wsBus } from "./wsServer";

export const wsRouter = createRouter({
  // ── Connections ──
  listConnections: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.wsConnections)
      .where(eq(schema.wsConnections.tenantId, ctx.user.tenantId!))
      .orderBy(desc(schema.wsConnections.connectedAt));
  }),
  recordConnection: authedQuery
    .input(z.object({ deviceInfo: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.wsConnections).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        sessionId: crypto.randomUUID(),
        deviceInfo: input.deviceInfo || "web",
        isActive: true,
      }).$returningId();
      wsBus.setPresence(`user:${ctx.user.id}`, {
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        status: "online",
      });
      return item;
    }),
  disconnect: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.update(schema.wsConnections).set({
      isActive: false,
      disconnectedAt: new Date(),
    }).where(and(eq(schema.wsConnections.userId, ctx.user.id), eq(schema.wsConnections.isActive, true)));
    wsBus.removePresence(`user:${ctx.user.id}`);
    return { success: true };
  }),

  // ── Presence ──
  setPresence: authedQuery
    .input(z.object({
      status: z.enum(["online", "away", "busy", "offline"]),
      currentModule: z.string().optional(),
      customStatus: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.select().from(schema.wsPresence)
        .where(and(eq(schema.wsPresence.userId, ctx.user.id), eq(schema.wsPresence.tenantId, ctx.user.tenantId!)));
      if (existing.length > 0) {
        await db.update(schema.wsPresence).set({
          status: input.status,
          currentModule: input.currentModule,
          customStatus: input.customStatus,
          lastSeen: new Date(),
        }).where(eq(schema.wsPresence.id, existing[0].id));
      } else {
        await db.insert(schema.wsPresence).values({
          tenantId: ctx.user.tenantId!,
          userId: ctx.user.id,
          status: input.status,
          currentModule: input.currentModule,
          customStatus: input.customStatus,
        });
      }
      wsBus.setPresence(`user:${ctx.user.id}`, {
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        status: input.status,
        currentModule: input.currentModule,
        customStatus: input.customStatus,
      });
      return { success: true };
    }),
  getPresence: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.wsPresence)
      .where(eq(schema.wsPresence.tenantId, ctx.user.tenantId!));
  }),
  getOnlineUsers: authedQuery.query(async ({ ctx }) => {
    return wsBus.getOnlineUsers(ctx.user.tenantId!);
  }),

  // ── Notifications ──
  listNotifications: authedQuery
    .input(z.object({ limit: z.number().default(50), unreadOnly: z.boolean().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [
        eq(schema.wsNotifications.tenantId, ctx.user.tenantId!),
        eq(schema.wsNotifications.userId, ctx.user.id),
      ];
      if (input?.unreadOnly) conditions.push(eq(schema.wsNotifications.isRead, false));
      const items = await db.select().from(schema.wsNotifications)
        .where(and(...conditions)).orderBy(desc(schema.wsNotifications.createdAt))
        .limit(input?.limit || 50);
      const [unreadResult] = await db.select({ count: sql<number>`count(*)` }).from(schema.wsNotifications)
        .where(and(eq(schema.wsNotifications.tenantId, ctx.user.tenantId!), eq(schema.wsNotifications.userId, ctx.user.id), eq(schema.wsNotifications.isRead, false)));
      return { items, unreadCount: unreadResult?.count || 0 };
    }),
  createNotification: adminQuery
    .input(z.object({
      userId: z.number(), title: z.string().min(1), body: z.string().optional(),
      type: z.enum(["info", "warning", "error", "success"]).optional(),
      sourceModule: z.string().optional(), sourceEntityType: z.string().optional(),
      sourceEntityId: z.number().optional(), actionUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.wsNotifications).values({
        tenantId: ctx.user.tenantId!,
        userId: input.userId,
        title: input.title,
        body: input.body,
        type: input.type || "info",
        sourceModule: input.sourceModule,
        sourceEntityType: input.sourceEntityType,
        sourceEntityId: input.sourceEntityId,
        actionUrl: input.actionUrl,
      }).$returningId();
      wsBus.sendNotification(ctx.user.tenantId!, input.userId, {
        id: item.id,
        title: input.title,
        body: input.body,
        type: input.type || "info",
        createdAt: new Date(),
      });
      return item;
    }),
  markNotificationRead: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.update(schema.wsNotifications).set({ isRead: true, readAt: new Date() })
      .where(and(eq(schema.wsNotifications.id, input.id), eq(schema.wsNotifications.userId, ctx.user.id)));
    return { success: true };
  }),
  markAllNotificationsRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.update(schema.wsNotifications).set({ isRead: true, readAt: new Date() })
      .where(and(eq(schema.wsNotifications.tenantId, ctx.user.tenantId!), eq(schema.wsNotifications.userId, ctx.user.id), eq(schema.wsNotifications.isRead, false)));
    return { success: true };
  }),

  // ── Collaboration Sessions ──
  listSessions: authedQuery
    .input(z.object({ isActive: z.boolean().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.wsCollaborationSessions.tenantId, ctx.user.tenantId!)];
      if (input?.isActive !== undefined) conditions.push(eq(schema.wsCollaborationSessions.isActive, input.isActive));
      return db.select().from(schema.wsCollaborationSessions).where(and(...conditions))
        .orderBy(desc(schema.wsCollaborationSessions.createdAt));
    }),
  getSession: authedQuery.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const [session] = await db.select().from(schema.wsCollaborationSessions)
      .where(and(eq(schema.wsCollaborationSessions.id, input.id), eq(schema.wsCollaborationSessions.tenantId, ctx.user.tenantId!)));
    if (!session) return null;
    const participants = await db.select().from(schema.wsSessionParticipants)
      .where(eq(schema.wsSessionParticipants.sessionId, session.id));
    const activities = await db.select().from(schema.wsSessionActivities)
      .where(eq(schema.wsSessionActivities.sessionId, session.id))
      .orderBy(desc(schema.wsSessionActivities.createdAt)).limit(50);
    return { ...session, participants, activities };
  }),
  createSession: authedQuery
    .input(z.object({
      sessionName: z.string().min(1),
      sessionType: z.enum(["document_review", "dashboard", "record_edit", "chat"]),
      entityType: z.string().optional(), entityId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.wsCollaborationSessions).values({
        tenantId: ctx.user.tenantId!,
        sessionName: input.sessionName,
        sessionType: input.sessionType,
        entityType: input.entityType,
        entityId: input.entityId,
        createdBy: ctx.user.id,
      }).$returningId();
      await db.insert(schema.wsSessionParticipants).values({
        sessionId: item.id,
        userId: ctx.user.id,
        role: "owner",
      });
      wsBus.broadcast(ctx.user.tenantId!, "session_created", {
        sessionId: item.id,
        sessionName: input.sessionName,
        sessionType: input.sessionType,
      });
      return item;
    }),
  joinSession: authedQuery.input(z.object({ sessionId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const existing = await db.select().from(schema.wsSessionParticipants)
      .where(and(eq(schema.wsSessionParticipants.sessionId, input.sessionId), eq(schema.wsSessionParticipants.userId, ctx.user.id)));
    if (existing.length === 0) {
      await db.insert(schema.wsSessionParticipants).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        role: "viewer",
      });
    } else {
      await db.update(schema.wsSessionParticipants).set({ isActive: true, leftAt: null })
        .where(eq(schema.wsSessionParticipants.id, existing[0].id));
    }
    wsBus.broadcast(ctx.user.tenantId!, "participant_joined", {
      sessionId: input.sessionId,
      userId: ctx.user.id,
    });
    return { success: true };
  }),
  leaveSession: authedQuery.input(z.object({ sessionId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.update(schema.wsSessionParticipants).set({ isActive: false, leftAt: new Date() })
      .where(and(eq(schema.wsSessionParticipants.sessionId, input.sessionId), eq(schema.wsSessionParticipants.userId, ctx.user.id)));
    wsBus.broadcast(ctx.user.tenantId!, "participant_left", {
      sessionId: input.sessionId,
      userId: ctx.user.id,
    });
    return { success: true };
  }),
  endSession: authedQuery.input(z.object({ sessionId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    await db.update(schema.wsCollaborationSessions).set({ isActive: false, endedAt: new Date() })
      .where(and(eq(schema.wsCollaborationSessions.id, input.sessionId), eq(schema.wsCollaborationSessions.tenantId, ctx.user.tenantId!)));
    await db.update(schema.wsSessionParticipants).set({ isActive: false })
      .where(eq(schema.wsSessionParticipants.sessionId, input.sessionId));
    wsBus.broadcast(ctx.user.tenantId!, "session_ended", { sessionId: input.sessionId });
    return { success: true };
  }),

  // ── Session Activities ──
  recordActivity: authedQuery
    .input(z.object({
      sessionId: z.number(),
      activityType: z.enum(["view", "edit", "comment", "approve", "reject", "mention"]),
      activityData: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [item] = await db.insert(schema.wsSessionActivities).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        activityType: input.activityType,
        activityData: (input.activityData || {}) as any,
      }).$returningId();
      wsBus.broadcast(ctx.user.tenantId!, "activity", {
        sessionId: input.sessionId,
        userId: ctx.user.id,
        activityType: input.activityType,
        activityData: input.activityData,
        createdAt: new Date(),
      });
      return item;
    }),
  listActivities: authedQuery.input(z.object({ sessionId: z.number(), limit: z.number().default(100) })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(schema.wsSessionActivities)
      .where(eq(schema.wsSessionActivities.sessionId, input.sessionId))
      .orderBy(desc(schema.wsSessionActivities.createdAt)).limit(input.limit);
  }),

  // ── Typing Indicator ──
  setTyping: authedQuery
    .input(z.object({ sessionId: z.number(), isTyping: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.select().from(schema.wsUserTyping)
        .where(and(eq(schema.wsUserTyping.sessionId, input.sessionId), eq(schema.wsUserTyping.userId, ctx.user.id)));
      if (existing.length > 0) {
        await db.update(schema.wsUserTyping).set({ isTyping: input.isTyping, lastTypingAt: new Date() })
          .where(eq(schema.wsUserTyping.id, existing[0].id));
      } else {
        await db.insert(schema.wsUserTyping).values({
          tenantId: ctx.user.tenantId!,
          sessionId: input.sessionId,
          userId: ctx.user.id,
          isTyping: input.isTyping,
        });
      }
      wsBus.broadcast(ctx.user.tenantId!, "typing", {
        sessionId: input.sessionId,
        userId: ctx.user.id,
        isTyping: input.isTyping,
      });
      return { success: true };
    }),

  // ── Dashboard ──
  wsDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [activeSessions] = await db.select({ total: sql<number>`count(*)` })
      .from(schema.wsCollaborationSessions)
      .where(and(eq(schema.wsCollaborationSessions.tenantId, tenantId), eq(schema.wsCollaborationSessions.isActive, true)));
    const [unreadNotifs] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.wsNotifications)
      .where(and(eq(schema.wsNotifications.tenantId, tenantId), eq(schema.wsNotifications.userId, ctx.user.id), eq(schema.wsNotifications.isRead, false)));
    const onlineUsers = wsBus.getOnlineUsers(tenantId);
    const recentActivities = await db.select().from(schema.wsSessionActivities)
      .orderBy(desc(schema.wsSessionActivities.createdAt)).limit(10);
    return {
      activeSessions: activeSessions?.total || 0,
      unreadNotifications: unreadNotifs?.count || 0,
      onlineUsers: onlineUsers.length,
      activeCollaborators: onlineUsers,
      recentActivities,
    };
  }),
});
