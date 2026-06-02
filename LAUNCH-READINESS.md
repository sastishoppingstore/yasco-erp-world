# YASCO ERP — Launch Readiness & Performance Architecture

> **Tech stack:** Node.js · Hono · tRPC · React · Drizzle ORM · MySQL (PlanetScale) · Redis · AWS S3  
> **Deployment target:** Cloudflare CDN + Vercel Edge / dedicated VPS  
> **Target load:** 10,000 concurrent users across 1,000+ tenants

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Cloudflare CDN                          │
│  (static assets: JS/CSS/fonts/images, edge caching, DDoS WAF)   │
└────────────┬────────────────────┬────────────────────────────────┘
             │                    │
             ▼                    ▼
┌────────────────────┐  ┌──────────────────────┐
│  Public Website     │  │  ERP App (SPA)       │
│  (Landing, Login,   │  │  /app/* routes       │
│   Marketing pages)  │  │  React + tRPC client  │
│  Deployed via CDN   │  │  Vite-built chunks    │
└────────────────────┘  └──────────┬───────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Hono API Server (Node.js)                     │
│  @hono/node-server · tRPC fetchRequestHandler · 50 MB body limit │
│  /api/trpc — all ERP procedures · /api/health — health check     │
│  22 module routers: auth, accounting, inventory, sales, purchase,│
│  CRM, HRM, manufacturing, projects, helpdesk, assets, settings,  │
│  POS, cashbox, installments, reports, website, localization,     │
│  taxCompliance, aiAssistant                                       │
└──────┬──────────────────────┬──────────────────┬─────────────────┘
       │                      │                  │
       ▼                      ▼                  ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  MySQL (Write)│    │ MySQL (Read) │    │   Redis       │
│  Primary      │    │  Replica(s)  │    │  Cluster      │
│  (PlanetScale)│    │  Reporting   │    │ Session Cache │
│  Drizzle ORM  │    │  Analytics   │    │ Query Cache   │
└──────────────┘    └──────────────┘    │ Page Cache    │
                                        │ Rate Limiter  │
                                        └──────────────┘
┌──────────────────────────────────────────────────────────────────┐
│                     AWS S3 / Object Storage                       │
│  Company logos · invoice PDFs · product images · documents       │
│  Presigned URLs via @aws-sdk/s3-request-presigner                │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│                    BullMQ Background Jobs                         │
│  Email sending · ZATCA/FBR submission · Report generation        │
│  Data export · Backup tasks · Depreciation calculations          │
└──────────────────────────────────────────────────────────────────┘
```

### 1.1 CDN-First Static Assets

All frontend assets are served via Cloudflare or Vercel Edge CDN:

- **Vite build output** goes to `dist/public/` with content-hashed filenames (`[name]-[hash].js`).
- `Cache-Control: public, max-age=31536000, immutable` for hashed assets.
- `index.html` and non-hashed assets: `Cache-Control: public, max-age=600, must-revalidate`.
- CDN edge cache: 7–30 days for immutable assets, 10 min for HTML.

### 1.2 Separate Public Website & ERP App

| Surface | Route prefix | Cache strategy | Auth required |
|---|---|---|---|
| Public website | `/` (Landing, Login) | Full page CDN cache, SWR | No |
| ERP application | `/app/*` | SPA with tRPC data fetching | Yes |
| Public API | `/api/trpc` (public procs) | Short-lived CDN cache | No |
| Protected API | `/api/trpc` (auth procs) | No CDN cache, Redis-backed | Yes |

### 1.3 Read/Write Database Split

- **Write primary**: All `INSERT`, `UPDATE`, `DELETE` operations go to the MySQL writer.
- **Read replicas**: Reporting queries (dashboard, analytics, exports) route to read replicas via Drizzle ORM connection switching.
- **Connection pooling**: MySQL connections managed via `mysql2` pool with `connectionLimit: 50` (adjust per instance).

### 1.4 Object Storage for Media/Files

- **Service**: AWS S3 (or S3-compatible: MinIO, DigitalOcean Spaces, Wasabi).
- **SDK**: `@aws-sdk/client-s3` (already in `package.json`).
- **Pattern**: Files uploaded → S3 via presigned POST URLs. File references stored in `documents.filePath` and entity image fields (`products.image`, `tenants.logo`, `employees.photo`, etc.).
- **Presigned URLs**: `@aws-sdk/s3-request-presigner` generates short-lived (5 min) read URLs; assets served through CDN with longer cache when possible.
- **Expiry lifecycle**: S3 lifecycle policy — delete orphaned uploads after 7 days, archive old documents to Glacier after 1 year.

---

## 2. Caching Strategy

### 2.1 Browser Caching

| Asset type | Cache header | Strategy |
|---|---|---|
| JS/CSS with hash in filename | `max-age=31536000, immutable` | Cache forever; hash change breaks cache |
| Font files (woff2) | `max-age=31536000, immutable` | Cache forever |
| Images (png/jpg/webp/avif) | `max-age=2592000, public` | 30 days |
| `index.html` / shell | `max-age=600, must-revalidate` | 10 min; ETag for validation |
| API responses (public) | `max-age=60, s-maxage=300` | 1 min browser, 5 min CDN |

### 2.2 CDN Caching (Cloudflare)

- **Cache rule**: Cache on `GET` with `200` status, exclude `/api/trpc` (except public procedures).
- **Edge TTL**: 30 days for hashed assets, 10 min for HTML, 5 min for public API.
- **Cache key**: Based on URL + `Accept-Encoding`; exclude `?` query params for static assets.
- **Stale-while-revalidate**: `s-maxage=300, stale-while-revalidate=86400` for HTML pages.
- **Cache purge**: On deploy, purge CDN cache for `index.html`, `/`, `/login`, and `/*.js` / `/*.css`.

### 2.3 Redis Caching Layers

Redis caches the following (configured in `api/lib/redis.ts`):

| Cache name | Key pattern | TTL | Invalidation strategy |
|---|---|---|---|
| Session cache | `session:{sid}` | 7 days | On logout / password change |
| Query cache | `query:{tenant}:{entity}:{hash}` | 60–300 s | Write-through on mutations |
| Page cache | `page:{tenant}:{route}` | 30 s | Time-based expiry |
| Rate limiter | `ratelimit:{ip\|user}:{endpoint}` | 60 s | Sliding window |
| ID generation | `id:{entity}` | Persistent | Atomic increment |

**Redis memory budget**: 4 GB cluster (ElastiCache / Upstash). Monitor `evicted_keys` and `used_memory` metrics.

### 2.4 API Response Caching (Public Endpoints)

Public tRPC procedures (e.g., website content, module cards, countries list):

```typescript
const cachedPublicQuery = publicQuery.use(async (opts) => {
  const cacheKey = `public:${opts.path}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  const result = await opts.next();
  await redis.setex(cacheKey, 300, JSON.stringify(result));
  return result;
});
```

### 2.5 Service Worker (Offline Support)

`public/sw.js` caches the app shell at install time and serves from cache on repeat visits:

- **Install**: Cache `/`, `/index.html`, `/manifest.json`.
- **Fetch**: Cache-first for same-origin non-API requests. Network-first for API. Cache API responses optimistically.
- **Activate**: Purge old cache versions.
- **Future**: Add Background Sync for offline mutations (pending reconnection).

---

## 3. Database Optimization

### 3.1 Current Indexes (Defined in `db/schema.ts`)

| Table | Index | Columns |
|---|---|---|
| `chart_of_accounts` | `coa_tenant_idx` | `tenant_id` |
| `chart_of_accounts` | `coa_code_idx` | `code` |
| `journal_entries` | `je_tenant_idx` | `tenant_id` |
| `journal_entries` | `je_date_idx` | `date` |
| `products` | `prod_tenant_idx` | `tenant_id` |
| `products` | `prod_sku_idx` | `sku` |
| `inventory_balances` | `inv_bal_unique` | `product_id`, `warehouse_id` (unique) |

### 3.2 New Recommended Indexes

For tables without explicit indexes, add the following to `db/schema.ts`:

| Table | Index name | Columns | Rationale |
|---|---|---|---|
| `users` | `users_tenant_idx` | `tenant_id`, `role` | All user lookups scoped by tenant |
| `customers` | `cust_tenant_idx` | `tenant_id`, `code` | Customer search within tenant |
| `customers` | `cust_email_idx` | `tenant_id`, `email` | Duplicate check on email |
| `invoices` | `inv_tenant_status_idx` | `tenant_id`, `status`, `date` | Dashboard invoice queries |
| `invoices` | `inv_customer_idx` | `tenant_id`, `customer_id` | Customer invoice history |
| `invoice_items` | `inv_item_invoice_idx` | `invoice_id` | FK join on invoice items |
| `sales_orders` | `so_tenant_status_idx` | `tenant_id`, `status` | Sales pipeline view |
| `purchase_orders` | `po_tenant_status_idx` | `tenant_id`, `status` | PO tracking |
| `inventory_movements` | `inv_mov_product_idx` | `tenant_id`, `product_id`, `created_at` | Stock movement history |
| `inventory_movements` | `inv_mov_warehouse_idx` | `warehouse_id` | Warehouse-centric queries |
| `leads` | `leads_tenant_status_idx` | `tenant_id`, `status`, `assigned_to` | Sales pipeline filters |
| `employees` | `emp_tenant_dept_idx` | `tenant_id`, `department_id` | Department employee lists |
| `attendance` | `att_emp_date_idx` | `tenant_id`, `employee_id`, `date` | Attendance lookup by date range |
| `journal_entry_lines` | `jel_entry_idx` | `journal_entry_id` | FK join on journal lines |
| `tax_submissions` | `tax_sub_tenant_status_idx` | `tenant_id`, `status`, `created_at` | Tax submission monitoring |
| `audit_logs` | `audit_tenant_entity_idx` | `tenant_id`, `entity_type`, `entity_id` | Entity audit trail |
| `notifications` | `notif_user_read_idx` | `user_id`, `is_read`, `created_at` | User notification inbox |

### 3.3 Query Optimization Patterns

**Always filter by `tenantId` first** — every multi-tenant query must include `eq(table.tenantId, ctx.user.tenantId!)` in the WHERE clause.

**Use Drizzle prepared statements** — all queries go through the ORM, which parameterizes inputs and prevents SQL injection.

**Pagination pattern**:
```typescript
// Cursor-based for large lists
const items = await db.select()
  .from(table)
  .where(and(...conditions, cursor ? lt(table.id, cursor) : undefined))
  .orderBy(desc(table.id))
  .limit(limit + 1);
const hasMore = items.length > limit;
return { items: items.slice(0, limit), nextCursor: hasMore ? items[limit - 1].id : null };
```

**Avoid N+1** — use `db.query.table.findMany({ with: { relation: true } })` for eager loading. For dashboards, use batch queries or a dedicated aggregation endpoint.

**Use `$returningId()`** for inserts to avoid a separate SELECT after mutation:
```typescript
const [{ id }] = await db.insert(table).values(data).$returningId();
```

### 3.4 Connection Pooling

```typescript
// api/queries/connection.ts — production pool
import { createPool } from "mysql2/promise";

const pool = createPool(env.databaseUrl, {
  connectionLimit: 50,
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export function getDb(replica = false) {
  return drizzle(replica ? pool : pool, {
    mode: "planetscale",
    schema: fullSchema,
  });
}
```

### 3.5 Read Replicas for Reporting

- **Reporting queries** (dashboard aggregations, report generation, data export) use a read replica connection.
- Switch via `getDb(true)` which points to `DATABASE_REPLICA_URL`.
- Dashboard data is also cached in Redis for 30–120 seconds to absorb repeated page views.

```typescript
const db = input.reportType === "real-time" ? getDb() : getDb(true);
```

---

## 4. Queue & Background Jobs

### 4.1 BullMQ Job Queue

Add `bullmq` and `ioredis` to dependencies. Jobs are defined in `api/queue/` directory:

| Queue name | Job type | Priority | Retry | Description |
|---|---|---|---|---|
| `email` | `send-email` | High | 3×, 30s delay | SMTP email delivery (OTP, invoices, reports) |
| `tax-compliance` | `zatca-submit` | High | 5×, exponential backoff | Submit invoice to ZATCA/FBR e-invoicing API |
| `report` | `generate-report` | Low | 2×, 60s delay | Generate PDF/XLSX reports asynchronously |
| `export` | `data-export` | Low | 1× | Export large datasets (CSV/XLSX) |
| `backup` | `tenant-backup` | Low | 2× | Nightly tenant database backup |
| `maintenance` | `depreciation-calc` | Low | 1× | Monthly asset depreciation entries |
| `maintenance` | `overdue-check` | Medium | 2× | Daily invoice/installment overdue check |
| `cleanup` | `log-rotation` | Low | 1× | Archive/delete old audit logs |

**Job structure pattern**:
```typescript
// api/queue/email.queue.ts
import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis";

export const emailQueue = new Queue("email", { connection: redis });

new Worker("email", async (job) => {
  const { to, subject, body } = job.data;
  await sendEmail(to, subject, body);
}, { connection: redis, concurrency: 10 });
```

### 4.2 Worker Process Scaling

- **Main process**: Serves HTTP + runs lightweight, latency-sensitive workers (email, overdue check).
- **Dedicated worker processes**: Run separately for CPU-heavy jobs (report generation, data export, ZATCA submission).
- **In production**, run 2–4 worker processes per instance:

```json
// package.json
"scripts": {
  "start": "node dist/boot.js",
  "worker:email": "node dist/queue/email.worker.js",
  "worker:report": "node dist/queue/report.worker.js",
  "worker:tax": "node dist/queue/tax.worker.js",
  "backup:cron": "node dist/scripts/backup.js"
}
```

BullMQ sandbox workers for isolation, or use separate Node processes with PM2 / supervisord.

---

## 5. API Rate Limiting

### 5.1 Rate Limit Tiers

| Tier | Limit | Window | Scope | Applied to |
|---|---|---|---|---|
| Public | 60 req/min | 60 s sliding | Per IP | Unauthenticated `/api/trpc` procedures |
| Authenticated | 300 req/min | 60 s sliding | Per user ID | All `/api/trpc` authenticated procedures |
| Admin | 600 req/min | 60 s sliding | Per admin user | Admin-only procedures |
| Webhook | 30 req/min | 60 s sliding | Per IP | External webhook endpoints |

### 5.2 Implementation (Redis-backed)

```typescript
// api/middleware/rateLimit.ts
import { redis } from "../lib/redis";

async function checkRateLimit(key: string, limit: number, window = 60) {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `${key}:${Math.floor(now / window)}`;
  const count = await redis.incr(windowKey);
  if (count === 1) await redis.expire(windowKey, window);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), reset: (Math.floor(now / window) + 1) * window };
}
```

### 5.3 Rate Limit Headers

Every response includes:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1717348800
```

On rate limit breach, return `429 Too Many Requests` with `Retry-After` header.

### 5.4 Burst Handling

- Allow bursts of up to 2× the rate limit in a 10-second window via a token bucket algorithm.
- Burst capacity: `limit / 6` tokens, refill rate: `limit / 60` tokens per second.
- Critical client endpoints (invoice creation, payment posting) get burst priority.

---

## 6. Monitoring & Logging

### 6.1 Health Check Endpoint

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 3600,
  "version": "0.0.1",
  "db": "connected",
  "redis": "connected",
  "queue": "healthy",
  "memory": { "rss": 120, "heapUsed": 64, "heapTotal": 128 },
  "ts": 1717348800000
}
```

Health check runs every 30 seconds from the load balancer / monitoring service. `db` / `redis` / `queue` fields return `"disconnected"` if connectivity fails (server stays up but alerts fire).

### 6.2 Application Performance Monitoring (Sentry)

- **Sentry** for error tracking and performance monitoring.
- Capture all unhandled exceptions and tRPC errors with breadcrumbs (user ID, tenant ID, request path).
- Performance tracing: 0.1 sampling rate for tRPC procedures; 1.0 for critical mutations (invoice creation, ZATCA submission).

```typescript
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: env.sentryDsn, tracesSampleRate: 0.1 });
```

### 6.3 Structured Logging

Use `pino` or `console` with structured JSON format:

```typescript
export function logger(context: string) {
  return {
    info: (msg: string, data?: Record<string, unknown>) =>
      console.log(JSON.stringify({ level: "info", context, msg, ts: new Date().toISOString(), ...data })),
    error: (msg: string, err?: Error, data?: Record<string, unknown>) =>
      console.error(JSON.stringify({ level: "error", context, msg, err: err?.message, stack: err?.stack, ts: new Date().toISOString(), ...data })),
  };
}
```

**Log levels**: `debug`, `info`, `warn`, `error`, `fatal`. Production runs at `info`.

### 6.4 Error Tracking

- **tRPC errors**: All `TRPCError` instances are logged with path, input, user context, and stack trace.
- **Unhandled rejections**: `process.on("unhandledRejection", ...)` captures and sends to Sentry.
- **Uncaught exceptions**: `process.on("uncaughtException", ...)` logs, flushes Sentry, then exits with code 1.
- **Error categorization**: Predefined error codes (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`, `TIMEOUT`, `RATE_LIMITED`).

### 6.5 Uptime Monitoring

- External uptime checks every 60 seconds from at least 3 geographic regions (e.g., Better Uptime, Checkly, or UptimeRobot).
- Synthetic browser checks for critical user flows: login → dashboard → invoice creation.
- Alert on 2 consecutive failures (PagerDuty / Slack / email).

### 6.6 Slow Query Log

- MySQL `long_query_time = 1` second, logged to `mysql-slow.log`.
- Monitored via Amazon RDS Performance Insights or PlanetScale query insights.
- Alert on queries averaging > 500 ms or scanning > 10,000 rows.

### 6.7 Prometheus Metrics Endpoint

```
GET /api/metrics
```

Exposes:
```
http_requests_total{method,path,status}  — request counter
http_request_duration_seconds{method,path} — histogram
db_query_duration_seconds{query}          — histogram
db_connections_active                     — gauge
redis_operations_total{operation}         — counter
queue_job_duration_seconds{queue,job}     — histogram
queue_jobs_completed_total{queue,job}     — counter
active_users{tenant}                      — gauge
```

---

## 7. Security

### 7.1 DDoS Protection (Cloudflare)

- Cloudflare Always Online and Under Attack Mode for extreme events.
- Rate limiting rules at the edge (100 req/s per IP before reaching origin).
- Geo-blocking for non-target regions (optional, configurable per tenant).

### 7.2 Bot Protection

- Cloudflare Bot Management or Bot Fight Mode.
- Challenge JS-based and AI-based bot detection.
- Block known crawler IP ranges for `/api/*` paths.

### 7.3 WAF Rules (Cloudflare)

- Block SQL injection patterns and XSS in URL/body (Cloudflare Managed Rules).
- Rate limit `/api/auth/*` endpoints (10 req/min per IP — brute force protection).
- Block requests without valid `User-Agent` header.
- Allow only `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` methods.

### 7.4 CORS Configuration

```typescript
// api/boot.ts
app.use("*", cors({
  origin: env.isProduction ? ["https://yascoerp.com", "https://app.yascoerp.com"] : "*",
  credentials: true,
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400,
}));
```

### 7.5 HTTPS Everywhere

- TLS termination at Cloudflare edge (minimum TLS 1.2, prefer 1.3).
- HTTP → HTTPS redirect via Cloudflare Always Use HTTPS.
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
- Content Security Policy headers on all HTML responses.

### 7.6 SQL Injection Prevention

- All database queries go through **Drizzle ORM** with parameterized queries.
- Raw SQL is never used. If absolutely necessary, use `sql\`...\`` template literals which Drizzle parameterizes.
- User input is validated via **Zod schemas** before reaching any query.

### 7.7 XSS Prevention

- React's built-in JSX escaping handles most XSS vectors.
- CSP header: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' ...`.
- `dangerouslySetInnerHTML` is never used. Rich text rendered via marked/sanitize-html.
- All user-generated content is sanitized before display (especially descriptions, notes, comments).

### 7.8 CSRF Protection

- tRPC endpoints are not susceptible to CSRF via same-site cookies (`SameSite=Lax` / `None`).
- All mutations require authentication via JWT cookie (`kimi_sid`), not Basic Auth or URL tokens.
- `Content-Type: application/json` enforcement on tRPC POST requests (non-trivial to forge cross-origin).
- CSRF token for any non-tRPC form POST endpoints.

---

## 8. Deployment Checklist

### Pre-launch

- [ ] **Run database migrations**: `npm run db:migrate` against production DB. Verify `drizzle-kit migrate` completes cleanly.
- [ ] **Verify all indexes**: Run `SHOW INDEX FROM` on every table in production. Confirm all current + recommended indexes exist.
- [ ] **Seed initial data**: Countries, default tax rates, module registry, website module cards, localization profiles.
- [ ] **Warm up CDN cache**: Hit `/`, `/login`, `/manifest.json`, all hashed JS/CSS bundles via curl/crawler after deploy.
- [ ] **Run load tests**: Target 10,000 concurrent users using k6/artillery. Mixed workload: 60% authenticated page views, 20% list queries, 10% mutations, 10% public endpoints.
- [ ] **Stress test database**: Write-heavy scenario (100 concurrent invoice creations). Verify no deadlocks, measure P99 write latency.
- [ ] **Test failover**: Kill the primary DB connection, verify read replicas serve traffic. Kill Redis, verify graceful degradation (no crash).
- [ ] **Verify SSL certificates**: Cloudflare edge cert valid. Check `certificates expire` with `openssl s_client`. Set calendar reminder for renewal.
- [ ] **Configure backup schedule**: Daily MySQL dump via `mysqldump` or PlanetScale backup. Weekly full S3 backup of uploaded files. 30-day retention.
- [ ] **Set up monitoring alerts**: PagerDuty / Slack webhooks for: 5xx error rate > 1%, P99 latency > 3s, DB connection pool exhaustion, Redis memory > 80%, queue backlog > 1,000 jobs.
- [ ] **Test rollback procedure**: `git revert` + `npm run build` + deploy previous `dist/`. Verify DB migration rollback script.
- [ ] **Verify all API rate limits**: Automated test hits public API 70 times in 60 seconds → expects 429. Same for authenticated/admin tiers.
- [ ] **Test country detection**: Set `CF-IPCountry` / `x-forwarded-country` headers, verify localization profile selection, currency, date format, tax profile.
- [ ] **Verify ZATCA/FBR/UAE compliance modules**: Test invoice submission to sandbox endpoints for each jurisdiction. Verify QR code generation, XML payload format.
- [ ] **Test mobile responsiveness**: Render every module page at 375px viewport width. Fix layout breaks, overlapping elements, unreadable text.
- [ ] **Run Lighthouse audit**: Target 90+ Performance, 90+ Accessibility, 90+ Best Practices, 95+ SEO. Test on mobile and desktop profiles.
- [ ] **Generate SEO sitemap**: Generate `/sitemap.xml` with all public pages (landing, login, solution pages). Submit to Google Search Console.
- [ ] **Verify Open Graph tags**: Check `<meta>` tags on `/`, `/platform/solutions/*` via Facebook Sharing Debugger / LinkedIn Post Inspector.
- [ ] **Check all 100+ module cards render correctly**: Confirm `website_module_cards` table has all 100+ records. Each card shows icon, title, description, gradient, feature count on the landing/solutions page.

### Launch Day

- [ ] **Monitor error rates**: Watch Sentry dashboard. Alert on any new error class appearing > 5 times in 5 minutes.
- [ ] **Watch database connections**: PlanetScale / RDS connection count. Ensure pool size matches `max_connections`.
- [ ] **Monitor CDN cache hit ratio**: Target > 90% for static assets, > 70% for HTML. If below, purge cache or adjust TTLs.
- [ ] **Track API response times**: P50 < 150ms, P95 < 500ms, P99 < 2s for tRPC queries. Mutations P99 < 5s.
- [ ] **Watch user registration rate**: Sign-ups per minute. If > 50/min, ensure tenant provisioning pipeline can keep up.
- [ ] **Monitor queue backlog**: BullMQ dashboard. No queue should exceed 1,000 pending jobs. If so, spin up additional workers.
- [ ] **Have rollback plan ready**: `git checkout <previous-tag> && npm run build && npm run start` documented and accessible. DB rollback scripts prepared.

### Post-launch (First 72 Hours)

- [ ] **Analyze traffic patterns**: Geographic distribution, peak concurrency, most-hit endpoints, device breakdown.
- [ ] **Optimize slow queries**: Check MySQL slow query log. Add missing indexes, rewrite N+1 patterns, introduce caching.
- [ ] **Review error logs**: Sentry issues grouped by category. Fix top-10 most frequent errors.
- [ ] **Adjust rate limits**: Based on observed real traffic patterns. Increase authenticated tier if users hit limits during normal use.
- [ ] **Review CDN analytics**: Cache hit ratio, bandwidth savings, origin offload percentage.
- [ ] **Check queue worker throughput**: Verify workers are keeping up with peak load. Adjust concurrency or add instances.

---

## 9. Scaling Strategy

### 9.1 Horizontal Scaling for API Servers

- Stateless API servers behind a load balancer (Cloudflare Load Balancer / Nginx / HAProxy).
- **Session**: JWT cookie (no server-side session storage needed).
- **Database**: Connection pool size per instance: `50 / number_of_instances`.
- **Target**: Start with 2 instances (each `c5.xlarge` or equivalent). Scale to 10+ instances under peak.

### 9.2 Database Read Replicas

- **1 writer + N readers** topology.
- Writer handles all mutations; readers serve dashboard, reports, exports, and list queries.
- Add read replicas when read query latency exceeds 200ms P95.
- **PlanetScale**: Automatic read-only replicas with zero-downtime branching.

### 9.3 Redis Cluster

- **Cluster mode**: Redis Cluster with 3+ shards and replica nodes.
- **Eviction policy**: `allkeys-lru` for cache keys; `noeviction` for session data (separate Redis instance or database).
- **Memory sizing**: Start with 4 GB, scale to 16 GB as needed.
- **Backup**: Redis RDB snapshots every 60 minutes to S3 (for cache warm-up after restart).

### 9.4 Auto-scaling Configuration

```yaml
# docker-compose / K8s scaling policy
api-server:
  min: 2
  max: 10
  targetCPUUtilization: 70
  scaleUp: 
    cooldown: 60s
    evaluationPeriods: 2
  scaleDown:
    cooldown: 300s
    evaluationPeriods: 5

worker-email:
  min: 1
  max: 3
  targetQueueDepth: 500

worker-tax:
  min: 1
  max: 4
  targetQueueDepth: 200
```

### 9.5 Multi-region Deployment

- **Primary region**: Middle East (Bahrain/Saudi Arabia) — low latency for core user base.
- **Secondary region**: EU (Frankfurt) — for European customers, disaster recovery.
- **Global CDN**: Cloudflare serves static assets from 330+ PoPs.
- **Database**: PlanetScale automatically replicating across regions. Write region is primary; other regions serve reads with sub-50ms replication lag.
- **DNS failover**: Cloudflare Load Balancer with geo-steering and failover to secondary region.

---

## 10. Lighthouse Performance Targets

| Metric | Target | Measurement | Strategy |
|---|---|---|---|
| **Performance** | 90+ | Lighthouse score | Code splitting, CDN, lazy loading, optimized images |
| **Accessibility** | 90+ | Lighthouse score | ARIA labels, semantic HTML, keyboard navigation, color contrast |
| **Best Practices** | 90+ | Lighthouse score | HTTPS, no deprecated APIs, proper image sizing, error logging |
| **SEO** | 95+ | Lighthouse score | Meta tags, semantic structure, sitemap, structured data (JSON-LD) |
| **First Contentful Paint (FCP)** | < 1.5 s | Web Vitals | Inline critical CSS, preload hero images, minimize render-blocking |
| **Largest Contentful Paint (LCP)** | < 2.5 s | Web Vitals | Optimize hero image (webp/avif, responsive), lazy-load below-fold |
| **First Input Delay (FID)** | < 100 ms | Web Vitals | Code splitting, debounced handlers, web workers for heavy computation |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Web Vitals | Explicit dimensions on images, skeleton screens, stable font loading |
| **Time to Interactive (TTI)** | < 3.5 s | Lighthouse | Reduce JS bundle size via manual chunks (vendor, ui, charts, forms, query) |
| **Total Blocking Time (TBT)** | < 200 ms | Lighthouse | Break up long tasks, defer non-critical JS, use `requestIdleCallback` |

### Vite Manual Chunks (already configured in `vite.config.ts`)

```
vendor       → react, react-dom, react-router
ui           → @radix-ui components (dialog, dropdown, select, tabs)
charts       → recharts
forms        → react-hook-form, @hookform/resolvers, zod
query        → @tanstack/react-query, @trpc/client, @trpc/react-query, @trpc/server
```

Each page is lazy-loaded via `React.lazy()` (~100+ route-level chunks). Only the current route's chunk is fetched.

---

## Appendices

### A. Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string (writer) |
| `DATABASE_REPLICA_URL` | No | MySQL connection string (reader) |
| `REDIS_URL` | No | Redis connection string |
| `SENTRY_DSN` | No | Sentry project DSN |
| `APP_ID` | Yes | Application ID (Kimi OAuth) |
| `APP_SECRET` | Yes | Application secret (JWT signing) |
| `KIMI_AUTH_URL` | Yes | Kimi OAuth server URL |
| `KIMI_OPEN_URL` | Yes | Kimi Open Platform URL |
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address |
| `AWS_ACCESS_KEY_ID` | No | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | No | S3 secret key |
| `AWS_REGION` | No | S3 region |
| `S3_BUCKET` | No | S3 bucket name |
| `NODE_ENV` | No | `production` or `development` |
| `PORT` | No | HTTP server port (default 3000) |

### B. Key Dependencies for Production

| Package | Purpose |
|---|---|
| `hono` + `@hono/node-server` | HTTP framework & Node.js server |
| `@trpc/server` | Type-safe API procedures |
| `drizzle-orm` + `mysql2` | Database ORM & driver |
| `jose` | JWT signing & verification |
| `@aws-sdk/client-s3` | Object storage uploads |
| `@aws-sdk/s3-request-presigner` | Presigned URL generation |
| `bullmq` + `ioredis` | Background job queue |
| `pino` | Structured JSON logging |
| `@sentry/node` | Error tracking & APM |
| `zod` | Input validation |
| `superjson` | tRPC serialization |

### C. Database Connection URLs

```
# Writer (primary)
DATABASE_URL=mysql://user:pass@primary-host:3306/erp?ssl={"rejectUnauthorized":true}

# Reader (replica) — for reporting & analytics
DATABASE_REPLICA_URL=mysql://user:pass@replica-host:3306/erp?ssl={"rejectUnauthorized":true}
```
