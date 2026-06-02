import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { leads, opportunities, crmActivities, customers } from "@db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export const crmRouter = createRouter({
  // Leads
  leadList: authedQuery
    .input(z.object({
      status: z.string().optional(),
      assignedTo: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(leads.tenantId, tenantId)];
      if (input?.status) conditions.push(eq(leads.status, input.status as any));
      if (input?.assignedTo) conditions.push(eq(leads.assignedTo, input.assignedTo));
      return db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt));
    }),

  leadGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const lead = await db.query.leads.findFirst({ where: eq(leads.id, input.id) });
      const activities = await db.select().from(crmActivities)
        .where(and(eq(crmActivities.relatedType, "lead"), eq(crmActivities.relatedId, input.id)));
      return { lead, activities };
    }),

  leadCreate: authedQuery
    .input(z.object({
      firstName: z.string(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      company: z.string().optional(),
      jobTitle: z.string().optional(),
      source: z.enum(["website", "referral", "social_media", "email", "call", "walk_in", "other"]).optional(),
      status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
      rating: z.enum(["hot", "warm", "cold"]).optional(),
      estimatedValue: z.string().optional(),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(leads).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  leadUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
      assignedTo: z.number().optional(),
      rating: z.enum(["hot", "warm", "cold"]).optional(),
      notes: z.string().optional(),
      nextFollowUp: z.string().optional(),
      isConverted: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(leads).set({
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
      }).where(eq(leads.id, id));
      return { success: true };
    }),

  // Opportunities
  opportunityList: authedQuery
    .input(z.object({
      stage: z.string().optional(),
      assignedTo: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(opportunities.tenantId, tenantId)];
      if (input?.stage) conditions.push(eq(opportunities.stage, input.stage as any));
      if (input?.assignedTo) conditions.push(eq(opportunities.assignedTo, input.assignedTo));
      return db.select().from(opportunities).where(and(...conditions)).orderBy(desc(opportunities.createdAt));
    }),

  opportunityCreate: authedQuery
    .input(z.object({
      name: z.string(),
      leadId: z.number().optional(),
      customerId: z.number().optional(),
      stage: z.enum(["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
      probability: z.number().optional(),
      expectedValue: z.string().optional(),
      expectedCloseDate: z.string().optional(),
      assignedTo: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(opportunities).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  opportunityUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      stage: z.enum(["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
      probability: z.number().optional(),
      expectedValue: z.string().optional(),
      actualCloseDate: z.string().optional(),
      lostReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(opportunities).set(data).where(eq(opportunities.id, id));
      return { success: true };
    }),

  // Activities
  activityList: authedQuery
    .input(z.object({
      relatedType: z.string().optional(),
      relatedId: z.number().optional(),
      assignedTo: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(crmActivities.tenantId, tenantId)];
      if (input?.relatedType) conditions.push(eq(crmActivities.relatedType, input.relatedType as any));
      if (input?.relatedId) conditions.push(eq(crmActivities.relatedId, input.relatedId));
      if (input?.assignedTo) conditions.push(eq(crmActivities.assignedTo, input.assignedTo));
      return db.select().from(crmActivities).where(and(...conditions)).orderBy(desc(crmActivities.createdAt));
    }),

  activityCreate: authedQuery
    .input(z.object({
      activityType: z.enum(["call", "email", "meeting", "task", "note", "whatsapp", "sms"]),
      relatedType: z.enum(["lead", "opportunity", "customer", "contact"]),
      relatedId: z.number(),
      subject: z.string(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      assignedTo: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(crmActivities).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      }).$returningId();
      return { id, success: true };
    }),

  // CRM Dashboard Stats
  crmStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const [totalLeads] = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.tenantId, tenantId));
      const [totalOpportunities] = await db.select({ count: sql<number>`count(*)` }).from(opportunities).where(eq(opportunities.tenantId, tenantId));
      const [totalCustomers] = await db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.tenantId, tenantId));
      const [pipelineValue] = await db.select({
        total: sql<number>`coalesce(sum(expected_value), 0)`
      }).from(opportunities).where(and(eq(opportunities.tenantId, tenantId), eq(opportunities.stage, "negotiation")));

      return {
        totalLeads: totalLeads.count,
        totalOpportunities: totalOpportunities.count,
        totalCustomers: totalCustomers.count,
        pipelineValue: Number(pipelineValue.total),
      };
    }),
});
