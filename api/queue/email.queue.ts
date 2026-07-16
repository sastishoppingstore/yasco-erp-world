import { sendEmail } from "../lib/smtp";
import { createQueue, createWorker, QUEUES } from "./config";

const queue = createQueue(QUEUES.email.name, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });

export type EmailJobData = {
  to: string;
  subject: string;
  body?: string;
  html?: string;
  tenantId?: number;
  userId?: number;
};

async function processEmail(job: { data: EmailJobData }): Promise<{ sent: boolean; messageId?: string }> {
  const { to, subject, body, html } = job.data;
  const result = await sendEmail(html ? { to, subject, html, text: body } : { to, subject, text: body || subject });
  return { sent: result.sent, messageId: `email_${Date.now()}` };
}

const worker = createWorker<EmailJobData>(QUEUES.email.name, processEmail, { concurrency: QUEUES.email.concurrency });

worker.on("completed", (job) => {
  console.log(`[email] job ${job.id} completed -> ${job.to}`);
});

worker.on("failed", (job, err) => {
  console.error(`[email] job ${job?.id} failed:`, err.message);
});

export async function sendEmailJob(data: EmailJobData): Promise<void> {
  await queue.add("send-email", data);
}

export { queue as emailQueue, worker as emailWorker };
