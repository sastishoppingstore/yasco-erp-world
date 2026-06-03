import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sendEmail } from "./lib/smtp";
import * as schema from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const emailRouter = createRouter({
  templates: {
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(schema.emailTemplates).where(
        and(eq(schema.emailTemplates.isActive, true), eq(schema.emailTemplates.tenantId, ctx.user.tenantId!)),
      ).orderBy(desc(schema.emailTemplates.createdAt));
    }),
  },
  test: {
    send: adminQuery
      .input(z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        let smtpConfig = await db.query.smtpSettings.findFirst({ where: eq(schema.smtpSettings.tenantId, 1) });
        const result = await sendEmail(input.to, input.subject, input.body);
        await db.insert(schema.emailLogs).values({
          tenantId: 1,
          templateKey: "test",
          recipient: input.to,
          subject: input.subject,
          body: input.body,
          status: result.sent ? "sent" : "failed",
          errorMessage: result.sent ? null : "SMTP error",
        });
        if (!result.sent) throw new Error("Failed to send test email");
        return { success: true, message: "Test email sent successfully" };
      }),
  },
});
