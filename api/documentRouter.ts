import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { and, eq, desc, asc, sql } from "drizzle-orm";
import { documentEngine } from "./lib/documentEngine";
import { eSignatureEngine } from "./lib/eSignatureEngine";

export const documentRouter = createRouter({
  list: authedQuery
    .input(z.object({
      categoryId: z.number().optional(),
      relatedType: z.string().optional(),
      relatedId: z.number().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(schema.documents.tenantId, tenantId)];
      if (input?.categoryId) conditions.push(eq(schema.documents.categoryId, input.categoryId));
      if (input?.relatedType) conditions.push(eq(schema.documents.relatedType, input.relatedType));
      if (input?.relatedId) conditions.push(eq(schema.documents.relatedId, input.relatedId));
      if (input?.search) conditions.push(sql`(title LIKE ${`%${input.search}%`} OR description LIKE ${`%${input.search}%`})`);
      const items = await db.select().from(schema.documents).where(and(...conditions))
        .orderBy(desc(schema.documents.createdAt)).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
      const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(schema.documents).where(and(...conditions));
      return { items, total };
    }),
  get: authedQuery.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const db = getDb();
    const [doc] = await db.select().from(schema.documents).where(
      and(eq(schema.documents.id, input.id), eq(schema.documents.tenantId, ctx.user.tenantId!)),
    ).limit(1);
    if (!doc) throw new Error("Document not found");
    await documentEngine.logAccess(ctx.user.tenantId!, input.id, ctx.user.id, "view");
    return doc;
  }),
  create: authedQuery
    .input(z.object({
      categoryId: z.number().optional(), title: z.string().min(1),
      description: z.string().optional(), fileName: z.string(),
      fileSize: z.number(), mimeType: z.string(),
      relatedType: z.string().optional(), relatedId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await documentEngine.upload(ctx.user.tenantId!, { ...input, uploadedBy: ctx.user.id });
      return result;
    }),
  update: authedQuery
    .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), categoryId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const check = await documentEngine.checkAccess(ctx.user.tenantId!, input.id, ctx.user.id, "update");
      if (!check.allowed) throw new Error(check.reason ?? "Access denied");
      await db.update(schema.documents).set({
        title: input.title, description: input.description, categoryId: input.categoryId,
      }).where(and(eq(schema.documents.id, input.id), eq(schema.documents.tenantId, ctx.user.tenantId!)));
      await documentEngine.logAccess(ctx.user.tenantId!, input.id, ctx.user.id, "update");
      return { success: true };
    }),
  delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const check = await documentEngine.checkAccess(ctx.user.tenantId!, input.id, ctx.user.id, "delete");
    if (!check.allowed) throw new Error(check.reason ?? "Access denied");
    await db.delete(schema.documents).where(and(eq(schema.documents.id, input.id), eq(schema.documents.tenantId, ctx.user.tenantId!)));
    await documentEngine.logAccess(ctx.user.tenantId!, input.id, ctx.user.id, "delete");
    return { success: true };
  }),
  createVersion: authedQuery
    .input(z.object({ documentId: z.number(), fileName: z.string(), fileSize: z.number(), mimeType: z.string(), changeNotes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return documentEngine.createVersion(ctx.user.tenantId!, input.documentId, { ...input, uploadedBy: ctx.user.id });
    }),
  getVersions: authedQuery.input(z.object({ documentId: z.number() })).query(async ({ input, ctx }) => {
    return documentEngine.getVersions(ctx.user.tenantId!, input.documentId);
  }),
  getUploadUrl: authedQuery
    .input(z.object({ fileName: z.string(), mimeType: z.string() }))
    .query(async ({ input, ctx }) => {
      const key = `documents/${ctx.user.tenantId!}/uploads/${Date.now()}_${input.fileName}`;
      return { url: documentEngine.getPresignedUrl("upload", key), key };
    }),
  setExpiryAlert: authedQuery
    .input(z.object({
      documentId: z.number(), reminderType: z.string(), expiryDate: z.string(),
      reminderDaysBefore: z.number().default(30), notifyUserIds: z.array(z.number()),
    }))
    .mutation(async ({ input, ctx }) => {
      await documentEngine.setExpiryAlert(ctx.user.tenantId!, { ...input, createdBy: ctx.user.id });
      return { success: true };
    }),
  getExpiring: authedQuery.input(z.object({ withinDays: z.number().default(30) }).optional()).query(async ({ input, ctx }) => {
      return documentEngine.getExpiringDocuments(ctx.user.tenantId!, input?.withinDays ?? 30);
    }),
  getDocumentTypes: authedQuery.query(async () => {
    return documentEngine.getDocumentTypes();
  }),
  getCategories: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(schema.documentCategories).where(eq(schema.documentCategories.tenantId, ctx.user.tenantId!));
  }),
  createCategory: adminQuery
    .input(z.object({ name: z.string(), description: z.string().optional(), parentId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [cat] = await db.insert(schema.documentCategories).values({
        tenantId: ctx.user.tenantId!, name: input.name, description: input.description, parentId: input.parentId,
      }).$returningId();
      return cat;
    }),
  getAccessLogs: authedQuery.input(z.object({ documentId: z.number().optional(), limit: z.number().default(50) })).query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.documentAccessLogs.tenantId, ctx.user.tenantId!)];
      if (input.documentId) conditions.push(eq(schema.documentAccessLogs.documentId, input.documentId));
      return db.select().from(schema.documentAccessLogs).where(and(...conditions)).orderBy(desc(schema.documentAccessLogs.createdAt)).limit(input.limit);
    }),

  // ── E-Signatures ──
  createSignatureRequest: authedQuery
    .input(z.object({
      documentId: z.number(), signerId: z.number().optional(), signerEmail: z.string().optional(),
      signerName: z.string().optional(), signatureType: z.string().optional(), message: z.string().optional(), expiresAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return eSignatureEngine.createRequest(ctx.user.tenantId!, { ...input, requestedBy: ctx.user.id });
    }),
  listSignatureRequests: authedQuery
    .input(z.object({ status: z.string().optional(), limit: z.number().default(50) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(schema.eSignatureRequests.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(schema.eSignatureRequests.status, input.status as any));
      return db.select().from(schema.eSignatureRequests).where(and(...conditions)).orderBy(desc(schema.eSignatureRequests.createdAt)).limit(input?.limit ?? 50);
    }),
  signDocument: authedQuery
    .input(z.object({ requestId: z.number(), signatureData: z.string(), signatureType: z.enum(["draw", "type", "upload", "biometric"]) }))
    .mutation(async ({ input, ctx }) => {
      return eSignatureEngine.sign(ctx.user.tenantId!, input.requestId, { type: input.signatureType, data: input.signatureData });
    }),
  declineSignature: authedQuery
    .input(z.object({ requestId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return eSignatureEngine.decline(ctx.user.tenantId!, input.requestId, input.reason);
    }),
  verifySignature: authedQuery.input(z.object({ requestId: z.number() })).query(async ({ input, ctx }) => {
      return eSignatureEngine.verify(ctx.user.tenantId!, input.requestId);
    }),
  getSignatureAuditTrail: authedQuery.input(z.object({ requestId: z.number() })).query(async ({ input, ctx }) => {
      return eSignatureEngine.getAuditTrail(ctx.user.tenantId!, input.requestId);
    }),
});
