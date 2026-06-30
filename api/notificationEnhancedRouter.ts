import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc } from "drizzle-orm";
import { notificationDispatcher, type ChannelType } from "./lib/notifications/channels";
import { templateEngine, SYSTEM_TEMPLATES } from "./lib/notifications/templates";

export const notificationEnhancedRouter = createRouter({
  // ── Channels ──
  getChannelConfig: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const settings = await db.query.companySettings.findFirst({
      where: eq(schema.companySettings.tenantId, ctx.user.tenantId!),
    });
    return {
      emailEnabled: true, smsEnabled: !!process.env.SMS_API_KEY,
      whatsappEnabled: !!process.env.WHATSAPP_API_KEY, pushEnabled: true,
      voiceEnabled: false,
      smsProvider: process.env.SMS_PROVIDER ?? "twilio",
      whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? `${process.env.WHATSAPP_PHONE_NUMBER_ID?.substring(0, 4)}...` : null,
    };
  }),
  send: adminQuery
    .input(z.object({
      channel: z.enum(["email", "sms", "whatsapp", "push", "voice"]),
      to: z.string(), subject: z.string().optional(), body: z.string(),
      bodyAr: z.string().optional(), userId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await notificationDispatcher.dispatch(ctx.user.tenantId!, input.userId ?? ctx.user.id, [input.channel as ChannelType], {
        to: input.to, subject: input.subject, body: input.body, bodyAr: input.bodyAr,
      });
      return result;
    }),
  sendTemplate: adminQuery
    .input(z.object({
      templateKey: z.string(), channel: z.enum(["email", "sms", "whatsapp", "push"]),
      to: z.string(), variables: z.record(z.string(), z.any()),
      userId: z.number().optional(), language: z.enum(["en", "ar"]).default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      const template = await templateEngine.getTemplate(ctx.user.tenantId!, input.templateKey);
      if (!template) throw new Error(`Template '${input.templateKey}' not found`);
      const compiled = templateEngine.compile(template, input.variables, input.language);
      const result = await notificationDispatcher.dispatch(ctx.user.tenantId!, input.userId ?? ctx.user.id, [input.channel as ChannelType], {
        to: input.to, subject: compiled.subject, body: compiled.body, bodyAr: compiled.bodyAr,
      });
      return result;
    }),

  // ── Templates ──
  listTemplates: authedQuery.query(async ({ ctx }) => {
    return templateEngine.listTemplates(ctx.user.tenantId!);
  }),
  getTemplate: authedQuery.input(z.object({ key: z.string() })).query(async ({ input, ctx }) => {
    return templateEngine.getTemplate(ctx.user.tenantId!, input.key);
  }),
  saveTemplate: adminQuery
    .input(z.object({
      templateKey: z.string(), name: z.string(), title: z.string(), titleAr: z.string().optional(),
      message: z.string(), messageAr: z.string().optional(), type: z.string().optional(),
      variables: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await templateEngine.saveTemplate(ctx.user.tenantId!, input);
      return { id, success: true };
    }),
  getSystemTemplates: authedQuery.query(() => SYSTEM_TEMPLATES),
  getTemplateVariables: authedQuery.input(z.object({ key: z.string() })).query(async ({ input }) => {
    return templateEngine.getVariables(input.key);
  }),
  preview: authedQuery
    .input(z.object({ templateKey: z.string(), variables: z.record(z.string(), z.any()), language: z.enum(["en", "ar"]).default("en") }))
    .query(async ({ input, ctx }) => {
      const template = await templateEngine.getTemplate(ctx.user.tenantId!, input.templateKey);
      if (!template) throw new Error("Template not found");
      return templateEngine.compile(template, input.variables, input.language);
    }),

  // ── Delivery Logs ──
  getLogs: authedQuery
    .input(z.object({ templateKey: z.string().optional(), limit: z.number().default(50) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.emailLogs.tenantId, ctx.user.tenantId!)];
      if (input?.templateKey) conditions.push(eq(schema.emailLogs.templateKey, input.templateKey));
      return db.select().from(schema.emailLogs).where(and(...conditions)).orderBy(desc(schema.emailLogs.sentAt)).limit(input?.limit ?? 50);
    }),
});
