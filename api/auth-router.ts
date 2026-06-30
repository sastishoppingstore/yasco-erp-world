import * as cookie from "cookie";
import crypto from "node:crypto";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { env } from "./lib/env";
import { createLocalAdminUser, LOCAL_ADMIN_TENANT_ID } from "./lib/localUser";
import { requireDesktopLicense } from "./lib/license";
import { sendEmail } from "./lib/smtp";
import { signSessionToken } from "./kimi/session";
import { findUserByUnionId, upsertUser } from "./queries/users";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { templateEngine } from "./lib/notifications/templates";

const LOCAL_CLIENT_ID = "local-auth";
const OTP_TTL_MS = 10 * 60 * 1000;
const otpStore = new Map<string, { hash: string; expiresAt: number; attempts: number }>();

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hashOtp(email: string, otp: string) {
  return crypto
    .createHmac("sha256", env.appSecret || "development-secret")
    .update(`${email}:${otp}`)
    .digest("hex");
}

function timingSafeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function ensureLocalUser(input: {
  unionId: string;
  name: string;
  email?: string;
  role: "super_admin" | "admin" | "user";
}) {
  try {
    await upsertUser({
      tenantId: LOCAL_ADMIN_TENANT_ID,
      unionId: input.unionId,
      name: input.name,
      email: input.email,
      role: input.role,
      isActive: true,
      lastLoginAt: new Date(),
    });

    const user = await findUserByUnionId(input.unionId);
    if (!user) throw new Error("Unable to create local user.");
    return user;
  } catch (error) {
    if (env.isDesktop && input.unionId === `local:${normalizeUsername(env.adminUsername)}`) {
      console.warn("[auth] Using desktop local admin fallback because database is unavailable.", error);
      return createLocalAdminUser();
    }
    throw error;
  }
}

async function setLocalSession(ctx: { req: Request; resHeaders: Headers }, unionId: string) {
  const token = await signSessionToken({
    unionId,
    clientId: env.appId || LOCAL_CLIENT_ID,
  });
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

export const authRouter = createRouter({
  passwordLogin: publicQuery
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      requireDesktopLicense(ctx.req.headers);
      const username = normalizeUsername(input.username);
      const expectedUsername = normalizeUsername(env.adminUsername);
      const validUsername = timingSafeEqualString(username, expectedUsername);
      const validPassword = timingSafeEqualString(input.password, env.adminPassword);

      if (!validUsername || !validPassword) {
        throw new Error("Invalid username or password.");
      }

      const unionId = `local:${expectedUsername}`;
      const user = await ensureLocalUser({
        unionId,
        name: "YASCO Admin",
        email: env.adminEmail || undefined,
        role: "admin",
      });
      await setLocalSession(ctx, unionId);
      return { success: true, user };
    }),

  requestEmailOtp: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const email = normalizeEmail(input.email);
      const otp = generateOtp();
      otpStore.set(email, {
        hash: hashOtp(email, otp),
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0,
      });

      const tpl = await templateEngine.getTemplate(null, "account_otp");
      const subject = tpl ? templateEngine.compile(tpl, { otp_code: otp, expiry_minutes: "10" }, "en").subject : "Your YASCO login OTP";
      const bodyEn = tpl ? templateEngine.compile(tpl, { otp_code: otp, expiry_minutes: "10" }, "en").body : `Your YASCO login OTP is ${otp}.\n\nThis code expires in 10 minutes. If you did not request it, ignore this email.`;
      const bodyAr = tpl ? templateEngine.compile(tpl, { otp_code: otp, expiry_minutes: "10" }, "ar").body : "";
      const fullBody = bodyAr ? `${bodyEn}\n\n---\n${bodyAr}` : bodyEn;
      const result = await sendEmail(email, subject, fullBody);

      return {
        success: true,
        sent: result.sent,
        expiresInSeconds: OTP_TTL_MS / 1000,
        devOtp: env.isProduction ? undefined : result.sent ? undefined : otp,
      };
    }),

  verifyEmailOtp: publicQuery
    .input(z.object({
      email: z.string().email(),
      otp: z.string().regex(/^\d{6}$/),
    }))
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      const record = otpStore.get(email);
      if (!record || record.expiresAt < Date.now()) {
        otpStore.delete(email);
        throw new Error("OTP expired. Please request a new code.");
      }

      if (record.attempts >= 5) {
        otpStore.delete(email);
        throw new Error("Too many OTP attempts. Please request a new code.");
      }

      record.attempts += 1;
      const validOtp = timingSafeEqualString(record.hash, hashOtp(email, input.otp));
      if (!validOtp) {
        throw new Error("Invalid OTP.");
      }

      otpStore.delete(email);
      const isAdminEmail = !!env.adminEmail && normalizeEmail(env.adminEmail) === email;
      const unionId = `email:${email}`;
      const user = await ensureLocalUser({
        unionId,
        name: email.split("@")[0] || "YASCO User",
        email,
        role: isAdminEmail ? "admin" : "user",
      });
      await setLocalSession(ctx, unionId);
      return { success: true, user };
    }),

  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
