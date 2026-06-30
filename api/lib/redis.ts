import { Redis } from "ioredis";
import { env } from "./env";

let redisClient: Redis | null = null;
let redisReady = false;

export function getRedis(): Redis | null {
  if (!env.enableRedis || !env.redisUrl) return null;
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
      },
      lazyConnect: true,
    });

    redisClient.on("ready", () => { redisReady = true; });
    redisClient.on("error", (err) => {
      console.error("[redis] connection error:", err.message);
      redisReady = false;
    });
    redisClient.on("close", () => { redisReady = false; });
  }
  return redisClient;
}

export async function connectRedis(): Promise<boolean> {
  if (!env.enableRedis) return false;
  try {
    const client = getRedis();
    if (!client) return false;
    if (redisReady) return true;
    await client.connect();
    redisReady = true;
    console.log("[redis] connected successfully");
    return true;
  } catch (err: any) {
    console.warn("[redis] connection failed (non-fatal):", err.message);
    return false;
  }
}

export function isRedisReady(): boolean {
  return redisReady;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisReady = false;
  }
}

export class CacheManager {
  private DEFAULT_TTL = 300;
  private PREFIX = "cache:";

  async get<T>(key: string): Promise<T | null> {
    const client = getRedis();
    if (!client) return null;
    try {
      const raw = await client.get(`${this.PREFIX}${key}`);
      return raw ? JSON.parse(raw) as T : null;
    } catch { return null; }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      const keyFull = `${this.PREFIX}${key}`;
      const t = ttl ?? this.DEFAULT_TTL;
      await client.setex(keyFull, t, JSON.stringify(value));
    } catch { /* ignore */ }
  }

  async del(key: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      await client.del(`${this.PREFIX}${key}`);
    } catch { /* ignore */ }
  }

  async delPattern(pattern: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      const keys = await client.keys(`${this.PREFIX}${pattern}`);
      if (keys.length > 0) await client.del(...keys);
    } catch { /* ignore */ }
  }

  async remember<T>(key: string, ttl: number, fetchFn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }
}

export class SessionStore {
  private PREFIX = "session:";
  private DEFAULT_TTL = 7 * 86400;

  async get(sessionId: string): Promise<Record<string, any> | null> {
    const client = getRedis();
    if (!client) return null;
    try {
      const raw = await client.get(`${this.PREFIX}${sessionId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  async set(sessionId: string, data: Record<string, any>, ttl?: number): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      await client.setex(`${this.PREFIX}${sessionId}`, ttl ?? this.DEFAULT_TTL, JSON.stringify(data));
    } catch { /* ignore */ }
  }

  async del(sessionId: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      await client.del(`${this.PREFIX}${sessionId}`);
    } catch { /* ignore */ }
  }

  async touch(sessionId: string, ttl?: number): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      await client.expire(`${this.PREFIX}${sessionId}`, ttl ?? this.DEFAULT_TTL);
    } catch { /* ignore */ }
  }
}

export class RateLimiter {
  private PREFIX = "ratelimit:";

  async check(key: string, limit: number, windowSec = 60): Promise<{ allowed: boolean; remaining: number; reset: number }> {
    const client = getRedis();
    if (!client) return { allowed: true, remaining: limit, reset: Math.floor(Date.now() / 1000) + windowSec };
    try {
      const now = Math.floor(Date.now() / 1000);
      const windowKey = `${this.PREFIX}${key}:${Math.floor(now / windowSec)}`;
      const count = await client.incr(windowKey);
      if (count === 1) await client.expire(windowKey, windowSec);
      const reset = (Math.floor(now / windowSec) + 1) * windowSec;
      return { allowed: count <= limit, remaining: Math.max(0, limit - count), reset };
    } catch {
      return { allowed: true, remaining: limit, reset: Math.floor(Date.now() / 1000) + windowSec };
    }
  }
}

export const cache = new CacheManager();
export const sessionStore = new SessionStore();
export const rateLimiter = new RateLimiter();
