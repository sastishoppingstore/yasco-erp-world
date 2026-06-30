import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "@db/schema";

type CommandResult = {
  success: boolean;
  response: string;
  responseAr?: string;
  action?: "navigate" | "execute" | "query" | "confirm";
  data?: any;
};

function getApiKey(ctx: any): string | undefined {
  return ctx?.geminiApiKey || env.geminiApiKey || undefined;
}

async function queryWithGemini(
  prompt: string,
  apiKey: string,
  systemContext?: string,
): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: systemContext
        ? { role: "user", parts: [{ text: systemContext }] }
        : undefined,
    });
    return result.response.text().trim();
  } catch (err: any) {
    console.error("[voice] Gemini error:", err.message);
    return null;
  }
}

async function getEntitySummary(tenantId: number, entity: "sales" | "inventory" | "hr"): Promise<string> {
  const db = getDb();
  const tenantFilter = eq(schema.invoices.tenantId, tenantId);

  try {
    if (entity === "sales") {
      const today = await db
        .select({ count: sql<number>`count(*)`, total: sql<number>`coalesce(sum(total),0)` })
        .from(schema.invoices)
        .where(and(tenantFilter, sql`date >= curdate()`));
      const pending = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.invoices)
        .where(and(tenantFilter, eq(schema.invoices.status, "draft")));
      return `Today's sales: ${today[0]?.count ?? 0} invoices, total ${today[0]?.total ?? 0}. Pending: ${pending[0]?.count ?? 0}`;
    }
    if (entity === "inventory") {
      const lowStock = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.products)
        .where(and(eq(schema.products.tenantId, tenantId), sql`stock_quantity < 10`));
      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.products)
        .where(eq(schema.products.tenantId, tenantId));
      return `Products: ${total[0]?.count ?? 0} total. Low stock items: ${lowStock[0]?.count ?? 0}`;
    }
    if (entity === "hr") {
      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.employees)
        .where(eq(schema.employees.tenantId, tenantId));
      const present = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.attendance)
        .where(and(eq(schema.attendance.tenantId, tenantId), sql`date = curdate()`));
      return `Total employees: ${total[0]?.count ?? 0}. Present today: ${present[0]?.count ?? 0}`;
    }
    return "";
  } catch {
    return "Unable to fetch data.";
  }
}

export const aiVoiceRouter = createRouter({
  process: authedQuery
    .input(z.object({
      transcript: z.string().min(1).max(2000),
      language: z.enum(["en", "ar"]).optional().default("en"),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const apiKey = getApiKey(ctx);
      const db = getDb();
      const tenantId = ctx.user?.tenantId || 0;
      const t = input.transcript.toLowerCase().trim();

      const NAV_COMMANDS: Record<string, { route: string; en: string; ar: string }> = {
        "go to dashboard": { route: "/app", en: "Opening dashboard", ar: "جاري فتح لوحة التحكم" },
        "open sales": { route: "/app/sales", en: "Opening sales module", ar: "جاري فتح المبيعات" },
        "open reports": { route: "/app/reports", en: "Opening reports", ar: "جاري فتح التقارير" },
        "create invoice": { route: "/app/sales/invoices/new", en: "Opening new invoice form", ar: "جاري فتح نموذج الفاتورة الجديدة" },
        "check stock": { route: "/app/inventory/stock", en: "Opening inventory stock levels", ar: "جاري فتح مستويات المخزون" },
        "record payment": { route: "/app/sales/payments", en: "Opening payment recording", ar: "جاري فتح تسجيل الدفعات" },
        "open accounting": { route: "/app/accounting", en: "Opening accounting module", ar: "جاري فتح المحاسبة" },
        "open inventory": { route: "/app/inventory", en: "Opening inventory module", ar: "جاري فتح المخزون" },
        "open purchase": { route: "/app/purchase", en: "Opening purchase module", ar: "جاري فتح المشتريات" },
        "open hrm": { route: "/app/hrm", en: "Opening HR module", ar: "جاري فتح الموارد البشرية" },
        "open pos": { route: "/app/pos", en: "Opening POS", ar: "جاري فتح نقطة البيع" },
        "open customers": { route: "/app/sales/customers", en: "Opening customers", ar: "جاري فتح العملاء" },
        "open suppliers": { route: "/app/purchase/suppliers", en: "Opening suppliers", ar: "جاري فتح الموردين" },
        "open manufacturing": { route: "/app/manufacturing", en: "Opening manufacturing", ar: "جاري فتح التصنيع" },
        "open projects": { route: "/app/projects", en: "Opening projects", ar: "جاري فتح المشاريع" },
        "go to settings": { route: "/app/settings", en: "Opening settings", ar: "جاري فتح الإعدادات" },
      };

      for (const [cmd, nav] of Object.entries(NAV_COMMANDS)) {
        if (t.includes(cmd) || t.includes(cmd.replace(/^go to /, ""))) {
          return { success: true, response: input.language === "ar" ? nav.ar : nav.en, action: "navigate" as const, data: { route: nav.route } };
        }
      }

      if (t.includes("summary") || t.includes("quick overview") || t.includes("ملخص")) {
        const salesSummary = await getEntitySummary(tenantId, "sales");
        const invSummary = await getEntitySummary(tenantId, "inventory");
        const hrSummary = await getEntitySummary(tenantId, "hr");
        const summary = input.language === "ar"
          ? `ملخص سريع: ${salesSummary.replace("Today's sales", "مبيعات اليوم")}. ${hrSummary.replace("Total employees", "إجمالي الموظفين")}`
          : `Quick overview: ${salesSummary} | ${invSummary} | ${hrSummary}`;
        return { success: true, response: summary, action: "query" as const };
      }

      if (apiKey) {
        const systemCtx = `You are a voice assistant for YASCO ERP. The user said: "${input.transcript}". 
Language: ${input.language}. Respond concisely (1-2 sentences). 
If they're asking to navigate somewhere, respond with just the route name.
If they're asking about business data, explain you need a more specific question.
If they're greeting, greet back.
Respond in ${input.language === "ar" ? "Arabic" : "English"}.`;

        const aiResponse = await queryWithGemini(input.transcript, apiKey, systemCtx);
        if (aiResponse) {
          return { success: true, response: aiResponse, action: "query" as const };
        }
      }

      return {
        success: false,
        response: input.language === "ar"
          ? "لم أتعرف على الأمر. الأوامر المتاحة: افتح المبيعات، التقارير، المخزون، أنشئ فاتورة، سجل دفعة، لوحة التحكم، ملخص سريع."
          : "Command not recognized. Try: open sales, reports, stock, create invoice, record payment, dashboard, quick summary.",
        action: "query" as const,
      };
    }),

  commands: authedQuery
    .input(z.object({ language: z.enum(["en", "ar"]).optional().default("en") }).optional())
    .query(async ({ input }) => {
      return [
        { command: "go to dashboard", description: input?.language === "ar" ? "الذهاب إلى لوحة التحكم" : "Go to dashboard" },
        { command: "open sales", description: input?.language === "ar" ? "فتح المبيعات" : "Open sales" },
        { command: "create invoice", description: input?.language === "ar" ? "إنشاء فاتورة جديدة" : "Create invoice" },
        { command: "check stock", description: input?.language === "ar" ? "فحص المخزون" : "Check stock" },
        { command: "record payment", description: input?.language === "ar" ? "تسجيل دفعة" : "Record payment" },
        { command: "quick summary", description: input?.language === "ar" ? "ملخص سريع" : "Quick summary" },
        { command: "open reports", description: input?.language === "ar" ? "فتح التقارير" : "Open reports" },
        { command: "open accounting", description: input?.language === "ar" ? "فتح المحاسبة" : "Open accounting" },
        { command: "open inventory", description: input?.language === "ar" ? "فتح المخزون" : "Open inventory" },
        { command: "open HR", description: input?.language === "ar" ? "فتح الموارد البشرية" : "Open HR" },
        { command: "open customers", description: input?.language === "ar" ? "فتح العملاء" : "Open customers" },
      ];
    }),

  transcribe: authedQuery
    .input(z.object({
      audioBase64: z.string(),
      language: z.string().optional().default("en"),
      mimeType: z.string().optional().default("audio/wav"),
    }))
    .mutation(async ({ input }) => {
      const apiKey = env.geminiApiKey;
      if (!apiKey) {
        return { success: false, transcript: "", error: "AI service not configured. Set GEMINI_API_KEY." };
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const audioData = input.audioBase64.includes(",")
          ? input.audioBase64.split(",")[1]
          : input.audioBase64;

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: input.mimeType,
              data: audioData,
            },
          },
          { text: `Transcribe this audio accurately in ${input.language === "ar" ? "Arabic" : "English"}. Return only the transcription, no explanation.` },
        ]);

        const transcript = result.response.text().trim();
        return { success: true, transcript, language: input.language };
      } catch (err: any) {
        console.error("[voice] transcription error:", err.message);
        return { success: false, transcript: "", error: err.message };
      }
    }),

  synthesize: authedQuery
    .input(z.object({
      text: z.string().min(1).max(5000),
      language: z.string().optional().default("en"),
      voice: z.string().optional().default("default"),
    }))
    .mutation(async ({ input }) => {
      try {
        const geminiApiKey = env.geminiApiKey;
        if (geminiApiKey) {
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

          const langInstruction = input.language === "ar"
            ? "Respond in Arabic. Format this text for Arabic text-to-speech:"
            : "Respond in English. Format this text for English text-to-speech:";

          const result = await model.generateContent(`${langInstruction} ${input.text}`);
          const enhanced = result.response.text().trim();

          const ssml = input.language === "ar"
            ? `<speak><lang xml:lang="ar-SA">${enhanced.replace(/[<>]/g, "")}</lang></speak>`
            : `<speak>${enhanced.replace(/[<>]/g, "")}</speak>`;

          return {
            success: true,
            ssml,
            text: enhanced,
            language: input.language,
            note: "Use browsers' SpeechSynthesis API (frontend) or Edge-TTS / Google Cloud TTS (server) for audio playback.",
          };
        }

        return {
          success: true,
          ssml: `<speak>${input.text.replace(/[<>]/g, "")}</speak>`,
          text: input.text,
          language: input.language,
          note: "Use Web Speech API (SpeechSynthesis) on the frontend for TTS.",
        };
      } catch (err: any) {
        console.error("[voice] synthesis error:", err.message);
        return { success: false, ssml: "", text: "", error: err.message };
      }
    }),

  processAudio: authedQuery
    .input(z.object({
      audioBase64: z.string(),
      language: z.enum(["en", "ar"]).optional().default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      const transcribeResult = await aiVoiceRouter.transcribe.mutation({
        audioBase64: input.audioBase64,
        language: input.language,
      }, ctx as any);

      if (!transcribeResult.success || !transcribeResult.transcript) {
        return {
          success: false,
          transcript: "",
          response: input.language === "ar" ? "تعذر التعرف على الصوت" : "Could not recognize audio",
          action: "query" as const,
        };
      }

      const processResult = await aiVoiceRouter.process.mutation({
        transcript: transcribeResult.transcript,
        language: input.language,
      }, ctx as any);

      return {
        success: processResult.success,
        transcript: transcribeResult.transcript,
        response: processResult.response,
        action: processResult.action,
        data: processResult.data,
      };
    }),
});
