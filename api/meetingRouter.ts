import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sendEmail } from "./lib/smtp";
import * as schema from "@db/schema";
import { and, eq, asc, desc, gte, lte, sql } from "drizzle-orm";

export const meetingRouter = createRouter({
  list: authedQuery
    .input(z.object({ status: z.string().optional(), dateFrom: z.string().optional(), dateTo: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(schema.meetings.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(schema.meetings.status, input.status as any));
      if (input?.dateFrom) conditions.push(gte(schema.meetings.date, input.dateFrom));
      if (input?.dateTo) conditions.push(lte(schema.meetings.date, input.dateTo));
      return db.select().from(schema.meetings).where(and(...conditions)).orderBy(desc(schema.meetings.date));
    }),
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const meeting = await db.query.meetings.findFirst({ where: eq(schema.meetings.id, input.id) });
      if (!meeting) throw new Error("Meeting not found");
      const attendees = await db.select().from(schema.meetingAttendees).where(eq(schema.meetingAttendees.meetingId, input.id));
      const notes = await db.select().from(schema.meetingNotes).where(eq(schema.meetingNotes.meetingId, input.id)).orderBy(desc(schema.meetingNotes.createdAt));
      return { ...meeting, attendees, notes };
    }),
  create: authedQuery
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      date: z.string().min(1),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      timezone: z.string().default("UTC"),
      meetingType: z.enum(["online", "offline"]).default("online"),
      location: z.string().optional(),
      meetingLink: z.string().optional(),
      attendees: z.array(z.object({ userId: z.number().optional(), email: z.string().optional(), name: z.string().optional() })).optional(),
      customerId: z.number().optional(),
      relatedType: z.string().optional(),
      relatedId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [{ id }] = await db.insert(schema.meetings).values({
        tenantId,
        title: input.title,
        description: input.description || null,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        timezone: input.timezone,
        meetingType: input.meetingType,
        location: input.location || null,
        meetingLink: input.meetingLink || null,
        createdBy: ctx.user.id,
        customerId: input.customerId || null,
        relatedType: input.relatedType || null,
        relatedId: input.relatedId || null,
      }).$returningId();
      if (input.attendees && input.attendees.length > 0) {
        for (const attendee of input.attendees) {
          await db.insert(schema.meetingAttendees).values({
            meetingId: id,
            userId: attendee.userId || null,
            email: attendee.email || null,
            name: attendee.name || null,
            isRequired: true,
            status: "pending",
          });
          const recipientEmail = attendee.email;
          if (recipientEmail) {
            try {
              await sendEmail(recipientEmail, `Meeting Invitation: ${input.title}`, `You have been invited to a meeting.\n\nTitle: ${input.title}\nDate: ${input.date}\nTime: ${input.startTime} - ${input.endTime}\nTimezone: ${input.timezone}\n\n${input.meetingLink ? `Meeting Link: ${input.meetingLink}` : ""}\n${input.location ? `Location: ${input.location}` : ""}`);
            } catch { }
          }
        }
      }
      return { id, success: true };
    }),
  update: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      timezone: z.string().optional(),
      meetingType: z.enum(["online", "offline"]).optional(),
      location: z.string().optional(),
      meetingLink: z.string().optional(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "rescheduled"]).optional(),
      customerId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      const old = await db.query.meetings.findFirst({ where: eq(schema.meetings.id, id) });
      await db.update(schema.meetings).set(data).where(eq(schema.meetings.id, id));
      return { success: true };
    }),
  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const meeting = await db.query.meetings.findFirst({ where: eq(schema.meetings.id, input.id) });
      if (!meeting) throw new Error("Meeting not found");
      await db.update(schema.meetings).set({ status: "cancelled" }).where(eq(schema.meetings.id, input.id));
      const attendees = await db.select().from(schema.meetingAttendees).where(eq(schema.meetingAttendees.meetingId, input.id));
      for (const attendee of attendees) {
        const recipientEmail = attendee.email;
        if (recipientEmail) {
          try {
            await sendEmail(recipientEmail, `Meeting Cancelled: ${meeting.title}`, `The meeting "${meeting.title}" scheduled for ${meeting.date} has been cancelled.`);
          } catch { }
        }
      }
      return { success: true };
    }),
  addNote: authedQuery
    .input(z.object({ meetingId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(schema.meetingNotes).values({
        meetingId: input.meetingId,
        content: input.content,
        createdBy: ctx.user.id,
      }).$returningId();
      return { id, success: true };
    }),
  updateAttendance: authedQuery
    .input(z.object({ meetingId: z.number(), attendeeId: z.number(), status: z.enum(["pending", "accepted", "declined", "tentative"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(schema.meetingAttendees).set({ status: input.status }).where(
        and(eq(schema.meetingAttendees.id, input.attendeeId), eq(schema.meetingAttendees.meetingId, input.meetingId)),
      );
      return { success: true };
    }),
  myMeetings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const createdMeetings = await db.select().from(schema.meetings).where(
      and(eq(schema.meetings.tenantId, tenantId), eq(schema.meetings.createdBy, ctx.user.id)),
    ).orderBy(desc(schema.meetings.date));
    const attendeeRecords = await db.select().from(schema.meetingAttendees).where(eq(schema.meetingAttendees.userId, ctx.user.id));
    const meetingIds = attendeeRecords.map(a => a.meetingId);
    let attendingMeetings: any[] = [];
    if (meetingIds.length > 0) {
      const idsStr = meetingIds.join(",");
      attendingMeetings = await db.select().from(schema.meetings).where(and(eq(schema.meetings.tenantId, tenantId), sql`${schema.meetings.id} IN (${idsStr})`));
    }
    const seen = new Set<number>();
    const all = [...createdMeetings, ...attendingMeetings].filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }),
});
