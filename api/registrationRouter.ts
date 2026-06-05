import { z } from "zod";
import crypto from "node:crypto";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sendEmail } from "./lib/smtp";
import * as schema from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(email: string, otp: string) {
  return crypto.createHmac("sha256", "saas-secret-key").update(`${email}:${otp}`).digest("hex");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

const supportedCountries = [
  { code: "SA", name: "Saudi Arabia", nameAr: "السعودية", dialCode: "+966", currency: "SAR", language: "ar", timezone: "Asia/Riyadh", taxProfile: "vat_15" },
  { code: "AE", name: "United Arab Emirates", nameAr: "الإمارات", dialCode: "+971", currency: "AED", language: "ar", timezone: "Asia/Dubai", taxProfile: "vat_5" },
  { code: "EG", name: "Egypt", nameAr: "مصر", dialCode: "+20", currency: "EGP", language: "ar", timezone: "Africa/Cairo", taxProfile: "vat_14" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", dialCode: "+965", currency: "KWD", language: "ar", timezone: "Asia/Kuwait", taxProfile: "vat_0" },
  { code: "QA", name: "Qatar", nameAr: "قطر", dialCode: "+974", currency: "QAR", language: "ar", timezone: "Asia/Qatar", taxProfile: "vat_0" },
  { code: "BH", name: "Bahrain", nameAr: "البحرين", dialCode: "+973", currency: "BHD", language: "ar", timezone: "Asia/Bahrain", taxProfile: "vat_10" },
  { code: "OM", name: "Oman", nameAr: "عمان", dialCode: "+968", currency: "OMR", language: "ar", timezone: "Asia/Muscat", taxProfile: "vat_5" },
  { code: "JO", name: "Jordan", nameAr: "الأردن", dialCode: "+962", currency: "JOD", language: "ar", timezone: "Asia/Amman", taxProfile: "vat_16" },
  { code: "US", name: "United States", nameAr: "الولايات المتحدة", dialCode: "+1", currency: "USD", language: "en", timezone: "America/New_York", taxProfile: "sales_tax" },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", dialCode: "+44", currency: "GBP", language: "en", timezone: "Europe/London", taxProfile: "vat_20" },
];

export const registrationRouter = createRouter({
  register: publicQuery
    .input(z.object({
      companyName: z.string().min(1),
      ownerName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      password: z.string().min(6),
      confirmPassword: z.string().min(1),
      country: z.string().min(1),
      city: z.string().min(1),
      businessType: z.string().min(1),
      industry: z.string().min(1),
      employeesCount: z.coerce.number().int().positive(),
      currency: z.string().min(1),
      language: z.string().min(1),
      timezone: z.string().min(1),
      taxRegistered: z.boolean(),
      taxNumber: z.string().optional(),
      address: z.string().min(1),
      logo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.password !== input.confirmPassword) throw new Error("Passwords do not match");
      const email = normalizeEmail(input.email);
      const db = getDb();
      const existingUser = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
      if (existingUser) throw new Error("Email already registered");
      const slug = input.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
      const [tenant] = await db.insert(schema.tenants).values({
        name: input.companyName,
        slug,
        email,
        phone: input.phone,
        address: input.address,
        city: input.city,
        country: input.country,
        currency: input.currency,
        language: input.language,
        timezone: input.timezone,
        status: "trial",
        plan: "free",
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      }).$returningId();
      await db.insert(schema.companies).values({
        tenantId: tenant.id,
        legalName: input.companyName,
        displayName: input.companyName,
        countryCode: input.country,
        baseCurrency: input.currency,
        timezone: input.timezone,
        isActive: true,
      });
      const passwordHash = hashPassword(input.password);
      const unionId = `email:${email}`;
      await db.insert(schema.users).values({
        tenantId: tenant.id,
        unionId,
        name: input.ownerName,
        email,
        phone: input.phone,
        role: "admin",
        isActive: true,
      });
      const otp = generateOtp();
      const otpHash = hashOtp(email, otp);
      await db.insert(schema.otpCodes).values({
        email,
        otpHash,
        purpose: "registration",
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        ipAddress: ctx.clientIp || null,
      });
      const result = await sendEmail(email, "Verify your email address", `Your OTP for registration is: ${otp}\n\nThis code expires in 10 minutes.`);
      return { tenantId: tenant.id, email, message: "Registration successful. Please verify your email with the OTP sent." };
    }),
  verifyOtp: publicQuery
    .input(z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/), purpose: z.string() }))
    .mutation(async ({ input }) => {
      const email = normalizeEmail(input.email);
      const db = getDb();
      const records = await db.select().from(schema.otpCodes).where(
        and(eq(schema.otpCodes.email, email), eq(schema.otpCodes.purpose, input.purpose as any), eq(schema.otpCodes.isVerified, false)),
      ).orderBy(desc(schema.otpCodes.createdAt)).limit(1);
      if (records.length === 0) throw new Error("No OTP found. Please request a new one.");
      const record = records[0];
      if (new Date(record.expiresAt) < new Date()) throw new Error("OTP has expired. Please request a new one.");
      if (record.attempts >= record.maxAttempts) throw new Error("Too many invalid attempts. Please request a new OTP.");
      const otpHash = hashOtp(email, input.otp);
      if (record.otpHash !== otpHash) {
        await db.update(schema.otpCodes).set({ attempts: record.attempts + 1 }).where(eq(schema.otpCodes.id, record.id));
        throw new Error("Invalid OTP code.");
      }
      await db.update(schema.otpCodes).set({ isVerified: true, verifiedAt: new Date() }).where(eq(schema.otpCodes.id, record.id));
      const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
      return { success: true, message: "Email verified successfully.", tenantId: user?.tenantId ?? null };
    }),
  resendOtp: publicQuery
    .input(z.object({ email: z.string().email(), purpose: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      const db = getDb();
      const recentOtp = await db.select().from(schema.otpCodes).where(
        and(eq(schema.otpCodes.email, email), eq(schema.otpCodes.purpose, input.purpose as any)),
      ).orderBy(desc(schema.otpCodes.createdAt)).limit(1);
      if (recentOtp.length > 0) {
        const elapsed = Date.now() - new Date(recentOtp[0].createdAt).getTime();
        if (elapsed < 30 * 1000) throw new Error("Please wait 30 seconds before requesting a new OTP.");
      }
      const otp = generateOtp();
      const otpHash = hashOtp(email, otp);
      await db.insert(schema.otpCodes).values({
        email,
        otpHash,
        purpose: input.purpose as any,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        ipAddress: ctx.clientIp || null,
      });
      const result = await sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}\n\nThis code expires in 10 minutes.`);
      return { success: true, message: "OTP sent successfully." };
    }),
  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      const db = getDb();
      const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
      if (!user) throw new Error("No account found with this email address.");
      const otp = generateOtp();
      const otpHash = hashOtp(email, otp);
      await db.insert(schema.otpCodes).values({
        email,
        otpHash,
        purpose: "forgot_password",
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        ipAddress: ctx.clientIp || null,
      });
      const result = await sendEmail(email, "Password Reset OTP", `Your OTP for password reset is: ${otp}\n\nThis code expires in 10 minutes.`);
      return { success: true, message: "OTP sent to your email." };
    }),
  resetPassword: publicQuery
    .input(z.object({
      email: z.string().email(),
      otp: z.string().regex(/^\d{6}$/),
      newPassword: z.string().min(6),
      confirmPassword: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      if (input.newPassword !== input.confirmPassword) throw new Error("Passwords do not match");
      const email = normalizeEmail(input.email);
      const db = getDb();
      const records = await db.select().from(schema.otpCodes).where(
        and(eq(schema.otpCodes.email, email), eq(schema.otpCodes.purpose, "forgot_password"), eq(schema.otpCodes.isVerified, false)),
      ).orderBy(desc(schema.otpCodes.createdAt)).limit(1);
      if (records.length === 0) throw new Error("No OTP found. Please request a new one.");
      const record = records[0];
      if (new Date(record.expiresAt) < new Date()) throw new Error("OTP has expired. Please request a new one.");
      if (record.attempts >= record.maxAttempts) throw new Error("Too many invalid attempts.");
      const otpHash = hashOtp(email, input.otp);
      if (record.otpHash !== otpHash) {
        await db.update(schema.otpCodes).set({ attempts: record.attempts + 1 }).where(eq(schema.otpCodes.id, record.id));
        throw new Error("Invalid OTP.");
      }
      await db.update(schema.otpCodes).set({ isVerified: true, verifiedAt: new Date() }).where(eq(schema.otpCodes.id, record.id));
      return { success: true, message: "Password reset successfully." };
    }),
  checkEmail: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const email = normalizeEmail(input.email);
      const db = getDb();
      const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
      return { exists: !!user };
    }),
  detectCountry: publicQuery.query(async () => {
    return supportedCountries;
  }),
});
