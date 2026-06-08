import { z } from "zod";
import crypto from "node:crypto";
import { and, eq, desc, sql, lt } from "drizzle-orm";
import { createRouter, superAdminQuery, adminQuery, resellerQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

function generateLicenseKey(prefix = "ERP") {
  const seg1 = crypto.randomBytes(4).toString("hex").toUpperCase();
  const seg2 = crypto.randomBytes(4).toString("hex").toUpperCase();
  const seg3 = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${seg1}-${seg2}-${seg3}`;
}

export const licenseKeyRouter = createRouter({
  // ================================================
  // SUPER ADMIN: Manage reseller key limits
  // ================================================
  resellerLimits: {
    list: superAdminQuery.query(async () => {
      const db = getDb();
      const limits = await db.select().from(schema.resellerKeyLimits)
        .orderBy(desc(schema.resellerKeyLimits.createdAt));
      const userIds = limits.map(l => l.resellerUserId);
      const users = userIds.length > 0
        ? await db.select().from(schema.users).where(sql`${schema.users.id} IN (${userIds.join(",")})`)
        : [];
      const userMap = new Map(users.map(u => [u.id, u]));
      return limits.map(l => ({
        ...l,
        reseller: userMap.get(l.resellerUserId) || null,
      }));
    }),

    setLimit: superAdminQuery
      .input(z.object({
        resellerUserId: z.number(),
        maxKeys: z.number().int().min(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const existing = await db.query.resellerKeyLimits.findFirst({
          where: eq(schema.resellerKeyLimits.resellerUserId, input.resellerUserId),
        });
        if (existing) {
          await db.update(schema.resellerKeyLimits)
            .set({ maxKeys: input.maxKeys, setBy: ctx.user.id })
            .where(eq(schema.resellerKeyLimits.id, existing.id));
        } else {
          await db.insert(schema.resellerKeyLimits).values({
            resellerUserId: input.resellerUserId,
            maxKeys: input.maxKeys,
            setBy: ctx.user.id,
          });
        }
        return { success: true };
      }),
  },

  // ================================================
  // RESELLER: Generate license keys
  // ================================================
  reseller: {
    myQuota: resellerQuery.query(async ({ ctx }) => {
      const db = getDb();
      const limit = await db.query.resellerKeyLimits.findFirst({
        where: eq(schema.resellerKeyLimits.resellerUserId, ctx.user.id),
      });
      const pendingCount = await db.select({ count: sql<number>`count(*)` })
        .from(schema.resellerLicenseKeys)
        .where(and(
          eq(schema.resellerLicenseKeys.resellerUserId, ctx.user.id),
          eq(schema.resellerLicenseKeys.status, "pending"),
        )).then(r => Number(r[0]?.count || 0));
      return {
        maxKeys: limit?.maxKeys || 0,
        keysUsed: limit?.keysUsed || 0,
        pendingCount,
        remaining: (limit?.maxKeys || 0) - (limit?.keysUsed || 0),
      };
    }),

    myKeys: resellerQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.resellerLicenseKeys)
        .where(eq(schema.resellerLicenseKeys.resellerUserId, ctx.user.id))
        .orderBy(desc(schema.resellerLicenseKeys.createdAt));
    }),

    generate: resellerQuery
      .input(z.object({
        companyName: z.string().min(1),
        plan: z.string().default("standard"),
        maxUsers: z.number().int().positive().default(5),
        maxDevices: z.number().int().positive().default(1),
        validDays: z.number().int().positive().default(365),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const limit = await db.query.resellerKeyLimits.findFirst({
          where: eq(schema.resellerKeyLimits.resellerUserId, ctx.user.id),
        });
        if (!limit || limit.keysUsed >= limit.maxKeys) {
          throw new Error("Key generation quota exhausted. Contact Super Admin.");
        }
        const licenseKey = generateLicenseKey();
        const licenseKeyHash = crypto.createHash("sha256").update(licenseKey).digest("hex");
        const expiresAt = new Date(Date.now() + input.validDays * 24 * 60 * 60 * 1000);
        const [{ id }] = await db.insert(schema.resellerLicenseKeys).values({
          resellerUserId: ctx.user.id,
          licenseKey,
          licenseKeyHash,
          companyName: input.companyName,
          plan: input.plan,
          maxUsers: input.maxUsers,
          maxDevices: input.maxDevices,
          status: "pending",
          expiresAt,
        }).$returningId();
        await db.update(schema.resellerKeyLimits)
          .set({ keysUsed: sql`${schema.resellerKeyLimits.keysUsed} + 1` })
          .where(eq(schema.resellerKeyLimits.id, limit.id));
        return { id, licenseKey, expiresAt: expiresAt.toISOString() };
      }),
  },

  // ================================================
  // ADMIN + SUPER ADMIN: Approve/Reject keys
  // ================================================
  approval: {
    pendingKeys: adminQuery.query(async () => {
      const db = getDb();
      const keys = await db.select().from(schema.resellerLicenseKeys)
        .where(eq(schema.resellerLicenseKeys.status, "pending"))
        .orderBy(desc(schema.resellerLicenseKeys.createdAt));
      const resellerIds = [...new Set(keys.map(k => k.resellerUserId))];
      const resellers = resellerIds.length > 0
        ? await db.select().from(schema.users).where(sql`${schema.users.id} IN (${resellerIds.join(",")})`)
        : [];
      const resellerMap = new Map(resellers.map(u => [u.id, u]));
      return keys.map(k => ({
        ...k,
        reseller: resellerMap.get(k.resellerUserId) || null,
      }));
    }),

    allKeys: adminQuery
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const db = getDb();
        const condition = input?.status ? eq(schema.resellerLicenseKeys.status, input.status as any) : undefined;
        const query = db.select().from(schema.resellerLicenseKeys);
        if (condition) query.where(condition);
        return query.orderBy(desc(schema.resellerLicenseKeys.createdAt));
      }),

    approve: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const key = await db.query.resellerLicenseKeys.findFirst({ where: eq(schema.resellerLicenseKeys.id, input.id) });
        if (!key) throw new Error("License key not found");
        if (key.status !== "pending") throw new Error("Only pending keys can be approved");
        await db.update(schema.resellerLicenseKeys)
          .set({ status: "approved", approvedBy: ctx.user.id, approvedAt: new Date() })
          .where(eq(schema.resellerLicenseKeys.id, input.id));
        return { success: true };
      }),

    reject: adminQuery
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = getDb();
        const key = await db.query.resellerLicenseKeys.findFirst({ where: eq(schema.resellerLicenseKeys.id, input.id) });
        if (!key) throw new Error("License key not found");
        if (key.status !== "pending") throw new Error("Only pending keys can be rejected");
        await db.update(schema.resellerLicenseKeys)
          .set({ status: "rejected", approvedBy: ctx.user.id, rejectedReason: input.reason })
          .where(eq(schema.resellerLicenseKeys.id, input.id));
        const limit = await db.query.resellerKeyLimits.findFirst({
          where: eq(schema.resellerKeyLimits.resellerUserId, key.resellerUserId),
        });
        if (limit) {
          await db.update(schema.resellerKeyLimits)
            .set({ keysUsed: sql`GREATEST(${schema.resellerKeyLimits.keysUsed} - 1, 0)` })
            .where(eq(schema.resellerKeyLimits.id, limit.id));
        }
        return { success: true };
      }),

    revoke: adminQuery
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.update(schema.resellerLicenseKeys)
          .set({ status: "revoked" })
          .where(eq(schema.resellerLicenseKeys.id, input.id));
        return { success: true };
      }),
  },

  // ================================================
  // PUBLIC: Verify a license key
  // ================================================
  verify: authedQuery
    .input(z.object({ key: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const hash = crypto.createHash("sha256").update(input.key).digest("hex");
      const record = await db.query.resellerLicenseKeys.findFirst({
        where: eq(schema.resellerLicenseKeys.licenseKeyHash, hash),
      });
      if (!record) return { valid: false, reason: "Key not found" };
      if (record.status === "revoked") return { valid: false, reason: "Key has been revoked" };
      if (record.status === "rejected") return { valid: false, reason: "Key was rejected" };
      if (record.status === "pending") return { valid: false, reason: "Key is pending approval" };
      if (record.expiresAt < new Date()) return { valid: false, reason: "Key has expired" };
      return { valid: true, key: { ...record, licenseKey: undefined, licenseKeyHash: undefined } };
    }),
});
