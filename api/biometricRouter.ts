import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { biometricTemplates, biometricConsentRecords, biometricAccessLogs, pdplDataSubjectRequests, employees } from "@db/schema";
import {
  recordConsent, revokeConsent, storeBiometricTemplate, deleteBiometricData,
  logBiometricAccess, checkConsentBeforeProcessing, submitDataSubjectRequest,
} from "./lib/pdpl";

export const biometricRouter = createRouter({
  // ─── Consent ───
  recordConsent: authedQuery
    .input(z.object({
      employeeId: z.number(),
      consentType: z.enum(["face", "fingerprint", "voice", "gps_location", "all"]),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await recordConsent({ ...input, tenantId: ctx.user.tenantId! });
      await logBiometricAccess(ctx.user.tenantId!, "enroll", ctx.user.id!, input.employeeId, undefined, input.ipAddress, input.userAgent, true, "Consent recorded");
      return { success: true };
    }),

  revokeConsent: authedQuery
    .input(z.object({ employeeId: z.number(), consentType: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await revokeConsent(ctx.user.tenantId!, input.employeeId, input.consentType);
      return { success: true };
    }),

  checkConsent: authedQuery
    .input(z.object({ employeeId: z.number(), templateType: z.string() }))
    .query(async ({ input, ctx }) => {
      return { consented: await checkConsentBeforeProcessing(ctx.user.tenantId!, input.employeeId, input.templateType) };
    }),

  // ─── Templates ───
  enroll: adminQuery
    .input(z.object({
      employeeId: z.number(),
      templateType: z.enum(["face", "fingerprint", "voice"]),
      templateData: z.string(),
      deviceId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const hasConsent = await checkConsentBeforeProcessing(ctx.user.tenantId!, input.employeeId, input.templateType);
      if (!hasConsent) throw new Error("No PDPL consent recorded for this biometric type");
      await storeBiometricTemplate(ctx.user.tenantId!, input.employeeId, input.templateType, input.templateData, input.deviceId);
      await logBiometricAccess(ctx.user.tenantId!, "enroll", ctx.user.id!, input.employeeId, undefined, undefined, undefined, true, "Template enrolled");
      return { success: true };
    }),

  listTemplates: authedQuery
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(biometricTemplates.tenantId, tenantId), eq(biometricTemplates.isActive, true as any)];
      if (input?.employeeId) conditions.push(eq(biometricTemplates.employeeId, input.employeeId));
      return db.select({
        id: biometricTemplates.id,
        employeeId: biometricTemplates.employeeId,
        templateType: biometricTemplates.templateType,
        deviceId: biometricTemplates.deviceId,
        enrolledAt: biometricTemplates.enrolledAt,
        lastUsedAt: biometricTemplates.lastUsedAt,
        employeeName: sql`CONCAT(${employees.firstName}, ' ', ${employees.lastName})`,
      })
      .from(biometricTemplates)
      .innerJoin(employees, eq(biometricTemplates.employeeId, employees.id))
      .where(and(...conditions))
      .orderBy(desc(biometricTemplates.enrolledAt));
    }),

  deleteTemplate: adminQuery
    .input(z.object({ employeeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteBiometricData(ctx.user.tenantId!, input.employeeId);
      await logBiometricAccess(ctx.user.tenantId!, "delete", ctx.user.id!, input.employeeId, undefined, undefined, undefined, true, "Template deleted per request");
      return { success: true };
    }),

  // ─── Access Logs ───
  accessLogs: adminQuery
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(biometricAccessLogs.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(biometricAccessLogs.employeeId, input.employeeId));
      return db.select().from(biometricAccessLogs).where(and(...conditions)).orderBy(desc(biometricAccessLogs.createdAt));
    }),

  // ─── PDPL Data Subject Requests ───
  submitRequest: authedQuery
    .input(z.object({
      employeeId: z.number(),
      requestType: z.enum(["access", "rectification", "erasure", "restrict", "portability", "objection", "withdraw_consent"]),
      requestDetails: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await submitDataSubjectRequest(ctx.user.tenantId!, input.employeeId, input.requestType, input.requestDetails, ctx.user.id);
      return { success: true };
    }),

  listRequests: authedQuery
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(pdplDataSubjectRequests.tenantId, tenantId)];
      if (input?.employeeId) conditions.push(eq(pdplDataSubjectRequests.employeeId, input.employeeId));
      return db.select().from(pdplDataSubjectRequests).where(and(...conditions)).orderBy(desc(pdplDataSubjectRequests.submittedAt));
    }),

  updateRequestStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "rejected"]),
      responseSummary: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: any = { status: input.status };
      if (input.responseSummary) updateData.responseSummary = input.responseSummary;
      if (input.status === "completed") updateData.completedAt = new Date();
      await db.update(pdplDataSubjectRequests).set(updateData).where(eq(pdplDataSubjectRequests.id, input.id));
      return { success: true };
    }),
});
