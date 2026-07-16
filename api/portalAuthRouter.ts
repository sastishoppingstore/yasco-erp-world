import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, suppliers, employees } from "@db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "pbkdf2_sha256$" + Buffer.from(String(Math.abs(hash))).toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
  return hash === hashPassword(password);
}

export const portalAuthRouter = createRouter({
  login: publicQuery
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
      portalType: z.enum(["customer", "vendor", "employee"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [users] = await db.execute(sql`
        SELECT * FROM portal_users WHERE email = ${input.email} AND portal_type = ${input.portalType} LIMIT 1
      `);
      const user = (users as any[])?.[0];
      if (!user || !verifyPassword(input.password, user.password_hash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      if (!user.is_active) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account is deactivated" });
      }

      const token = generateToken();
      const refreshToken = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.execute(sql`
        INSERT INTO portal_sessions (portal_user_id, token, refresh_token, expires_at)
        VALUES (${user.id}, ${token}, ${refreshToken}, ${expiresAt})
      `);

      await db.execute(sql`
        UPDATE portal_users SET last_login_at = NOW() WHERE id = ${user.id}
      `);

      let referenceData: any = null;
      if (input.portalType === "customer") {
        referenceData = await db.query.customers.findFirst({ where: eq(customers.id, user.reference_id) });
      } else if (input.portalType === "vendor") {
        referenceData = await db.query.suppliers.findFirst({ where: eq(suppliers.id, user.reference_id) });
      } else if (input.portalType === "employee") {
        referenceData = await db.query.employees.findFirst({ where: eq(employees.id, user.reference_id) });
      }

      return {
        token,
        refreshToken,
        expiresAt,
        user: { id: user.id, name: user.name, email: user.email, portalType: user.portal_type },
        referenceData,
      };
    }),

  refresh: publicQuery
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [sessions] = await db.execute(sql`
        SELECT * FROM portal_sessions WHERE refresh_token = ${input.refreshToken} LIMIT 1
      `);
      const session = (sessions as any[])?.[0];
      if (!session || new Date(session.expires_at) < new Date()) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });
      }

      const newToken = generateToken();
      const newRefreshToken = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.execute(sql`
        UPDATE portal_sessions SET token = ${newToken}, refresh_token = ${newRefreshToken}, expires_at = ${expiresAt}, last_activity_at = NOW()
        WHERE id = ${session.id}
      `);

      return { token: newToken, refreshToken: newRefreshToken, expiresAt };
    }),

  me: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [sessions] = await db.execute(sql`
        SELECT ps.*, pu.* FROM portal_sessions ps
        JOIN portal_users pu ON pu.id = ps.portal_user_id
        WHERE ps.token = ${input.token} LIMIT 1
      `);
      const row = (sessions as any[])?.[0];
      if (!row || new Date(row.expires_at) < new Date()) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session" });
      }

      await db.execute(sql`
        UPDATE portal_sessions SET last_activity_at = NOW() WHERE id = ${row.id}
      `);

      let referenceData: any = null;
      if (row.portal_type === "customer") {
        referenceData = await db.query.customers.findFirst({ where: eq(customers.id, row.reference_id) });
      } else if (row.portal_type === "vendor") {
        referenceData = await db.query.suppliers.findFirst({ where: eq(suppliers.id, row.reference_id) });
      } else if (row.portal_type === "employee") {
        referenceData = await db.query.employees.findFirst({ where: eq(employees.id, row.reference_id) });
      }

      return {
        user: { id: row.id, name: row.name, email: row.email, portalType: row.portal_type },
        referenceData,
      };
    }),

  logout: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.execute(sql`DELETE FROM portal_sessions WHERE token = ${input.token}`);
      return { success: true };
    }),
});
