import { Queue, Worker, QueueEvents, type JobsOptions, type WorkerOptions } from "bullmq";
import { getRedis, isRedisReady } from "../lib/redis";

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
  removeOnComplete: { age: 86400 * 3, count: 1000 },
  removeOnFail: { age: 86400 * 7, count: 500 },
};

const DEFAULT_WORKER_OPTIONS: Partial<WorkerOptions> = {
  concurrency: 5,
  lockDuration: 60000,
};

class MockRedis {
  on() { return this; }
  off() { return this; }
  connect() { return Promise.resolve(this); }
  disconnect() { return Promise.resolve(); }
  quit() { return Promise.resolve("OK"); }
}

let queueRedis: any = null;

function getConnection() {
  if (queueRedis) return queueRedis;
  const redis = getRedis();
  if (!redis) {
    console.warn("[queue] Redis not configured — using mock (queues disabled)");
    queueRedis = new MockRedis();
    return queueRedis;
  }
  queueRedis = redis;
  return redis;
}

export function createQueue(name: string, defaultJobOptions?: Partial<JobsOptions>): Queue | null {
  const conn = getConnection();
  if (!conn) return null;
  return new Queue(name, {
    connection: conn,
    defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, ...defaultJobOptions },
  });
}

export function createWorker<T = any, R = any>(
  name: string,
  processor: (job: { data: T; id?: string }) => Promise<R>,
  opts?: Partial<WorkerOptions>,
): Worker<T, R> | null {
  const conn = getConnection();
  if (!conn) return null;
  return new Worker<T, R>(name, async (job) => processor(job), {
    ...DEFAULT_WORKER_OPTIONS,
    ...opts,
    connection: conn,
  });
}

export function createQueueEvents(name: string): QueueEvents | null {
  const conn = getConnection();
  if (!conn) return null;
  return new QueueEvents(name, { connection: conn });
}

export type QueueDefinition = {
  name: string;
  concurrency?: number;
};

export const QUEUES = {
  email: { name: "email", concurrency: 10 },
  taxCompliance: { name: "tax-compliance", concurrency: 5 },
  report: { name: "report", concurrency: 3 },
  export: { name: "export", concurrency: 2 },
  backup: { name: "backup", concurrency: 1 },
  maintenance: { name: "maintenance", concurrency: 2 },
  cleanup: { name: "cleanup", concurrency: 1 },
} as const satisfies Record<string, QueueDefinition>;

export type QueueName = keyof typeof QUEUES;
