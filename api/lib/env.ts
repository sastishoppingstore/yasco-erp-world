import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  // ── Core ─────────────────────────────────────────────────────────
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  appName: process.env.APP_NAME ?? "YASCO ERP",
  appVersion: process.env.APP_VERSION ?? "1.0.0",
  isProduction: process.env.NODE_ENV === "production",
  isDesktop: process.env.ERP_DESKTOP_MODE === "true",

  // ── Database ─────────────────────────────────────────────────────
  databaseUrl: required("DATABASE_URL"),
  databaseReplicaUrl: process.env.DATABASE_REPLICA_URL ?? "",

  // ── Auth / OAuth ─────────────────────────────────────────────────
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "Admin@2025!",
  adminEmail: process.env.ADMIN_EMAIL ?? "",

  // ── Email / SMTP ─────────────────────────────────────────────────
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "",
  smtpSecure: process.env.SMTP_SECURE === "true",

  // ── AI ───────────────────────────────────────────────────────────
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",

  // ── AWS / S3 ─────────────────────────────────────────────────────
  s3AccessKey: process.env.AWS_ACCESS_KEY_ID ?? "",
  s3SecretKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  s3Region: process.env.AWS_REGION ?? "me-south-1",
  s3Bucket: process.env.S3_BUCKET ?? "",

  // ── Monitoring ───────────────────────────────────────────────────
  sentryDsn: process.env.SENTRY_DSN ?? "",

  // ── Cache / Queue ────────────────────────────────────────────────
  redisUrl: process.env.REDIS_URL ?? "",

  // ── Security ─────────────────────────────────────────────────────
  encryptionKey: process.env.ENCRYPTION_KEY ?? process.env.APP_SECRET ?? "default-enc-key-32chars-minimum!",

  // ── Feature Flags ────────────────────────────────────────────────
  enableBulkEmail: process.env.ENABLE_BULK_EMAIL === "true",
  enableS3: !!process.env.S3_BUCKET,
  enableRedis: !!process.env.REDIS_URL,
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? "50"),
};
