import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

// High-Traffic Readiness: Basic in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
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
  
  // Occasional cleanup to prevent memory leaks
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

app.get(Paths.oauthCallback, createOAuthCallbackHandler());

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

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  const host = process.env.HOST || "0.0.0.0";
  serve({ fetch: app.fetch, port, hostname: host }, () => {
    console.log(`Server running on http://${host}:${port}/ (High-Traffic Optimized)`);
  });
}
