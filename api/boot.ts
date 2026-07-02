import "dotenv/config";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { Paths } from "@contracts/constants";

// High-Traffic Readiness: Basic in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 300;

const rateLimiter = async (c: any, next: any) => {
  const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    const data = rateLimitMap.get(ip)!;
    if (now > data.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      if (data.count >= MAX_REQUESTS_PER_WINDOW) {
        return c.json({ error: "Too Many Requests. Please slow down." }, 429);
      }
      data.count++;
    }
  }
  
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  await next();
};

const app = new Hono<{ Bindings: HttpBindings }>();

app.get("/api/localization/detect", (c) => {
  const headerCountry =
    c.req.header("cf-ipcountry") ||
    c.req.header("x-vercel-ip-country") ||
    c.req.header("x-country-code") ||
    c.req.header("cloudfront-viewer-country");
  const countryCode = headerCountry?.toUpperCase();
  const supportedCountries = new Set([
    "SA", "PK", "AE", "QA", "OM", "BH", "KW", "IN", "BD", "GB",
    "DE", "FR", "US", "CA", "AU", "TR", "EG", "MY", "ID", "ZA", "NG",
  ]);

  return c.json({
    countryCode: countryCode && supportedCountries.has(countryCode) ? countryCode : null,
    source: countryCode ? "edge-header" : "unavailable",
  });
});

app.get("/api/ping", (c) => c.json({ ok: true, ts: Date.now() }));
app.on("HEAD", "/api/ping", (c) => c.body(null, 204));

// ── Health Check ─────────────────────────────────────────────────────
app.get("/api/health", async (c) => {
  let dbStatus = "connected";
  let redisStatus: string | undefined;
  try {
    const { getDb } = await import("./queries/connection");
    const db = getDb();
    await db.execute("SELECT 1" as any);
  } catch {
    dbStatus = "disconnected";
  }
  if (env.enableRedis) {
    try {
      const { isRedisReady } = await import("./lib/redis");
      redisStatus = isRedisReady() ? "connected" : "disconnected";
    } catch {
      redisStatus = "disconnected";
    }
  }
  const mem = process.memoryUsage();
  return c.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    app: env.appName,
    version: env.appVersion,
    db: dbStatus,
    redis: redisStatus,
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    },
    ts: Date.now(),
  });
});

// Apply rate limiting to API routes
app.use("/api/trpc", rateLimiter, bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", rateLimiter, bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.use("/api/trpc", (c) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  }),
);
app.use("/api/trpc/*", (c) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  }),
);
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

async function bootstrap() {
  if (env.enableRedis) {
    try {
      const { connectRedis } = await import("./lib/redis");
      const connected = await connectRedis();
      if (connected) {
        const { startAllWorkers } = await import("./queue/index");
        startAllWorkers();
      }
    } catch (err: any) {
      console.warn("[bootstrap] Redis/queue init skipped:", err.message);
    }
  }

  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  const host = process.env.HOST || "0.0.0.0";
  serve({ fetch: app.fetch, port, hostname: host }, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
