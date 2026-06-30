import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  invoices, customers, products, supportTickets, ticketComments,
  aiChatbotSessions, companySettings,
} from "@db/schema";
import { and, eq, desc, like, sql } from "drizzle-orm";
import { generateResponse } from "./services/gemini";

const FAQ_CATEGORIES: Record<string, { en: string; ar: string }[]> = {
  shipping: [
    { en: "What are your shipping options?", ar: "ما هي خيارات الشحن المتاحة؟" },
    { en: "How long does delivery take?", ar: "كم تستغرق عملية التوصيل؟" },
    { en: "Do you ship internationally?", ar: "هل تشحنون دولياً؟" },
  ],
  returns: [
    { en: "What is your return policy?", ar: "ما هي سياسة الإرجاع؟" },
    { en: "How do I return an item?", ar: "كيف يمكنني إرجاع منتج؟" },
    { en: "When will I get my refund?", ar: "متى سأسترد أموالي؟" },
  ],
  orders: [
    { en: "How do I track my order?", ar: "كيف يمكنني تتبع طلبي؟" },
    { en: "Can I change my order?", ar: "هل يمكنني تعديل طلبي؟" },
    { en: "How do I cancel an order?", ar: "كيف يمكنني إلغاء طلب؟" },
  ],
  payment: [
    { en: "What payment methods do you accept?", ar: "ما هي طرق الدفع المقبولة؟" },
    { en: "Is my payment secure?", ar: "هل مدفوعاتي آمنة؟" },
    { en: "Do you offer installment plans?", ar: "هل تقدمون خطط تقسيط؟" },
  ],
};

async function getAiConfig(ctx: any) {
  const db = getDb();
  const settings = await db.query.companySettings.findFirst({
    where: eq(companySettings.tenantId, ctx.user.tenantId!),
    columns: { aiApiKey: true, aiModel: true },
  });
  return { apiKey: settings?.aiApiKey || "", model: settings?.aiModel || "gemini-2.0-flash" };
}

async function saveSession(ctx: any, sessionId: string, customerInfo: any) {
  const db = getDb();
  await db.insert(aiChatbotSessions).values({
    tenantId: ctx.user?.tenantId,
    sessionId,
    channel: "portal",
    language: "en",
    customerName: customerInfo?.name,
    customerEmail: customerInfo?.email,
    customerPhone: customerInfo?.phone,
    status: "active",
  } as any).onDuplicateKeyUpdate({
    set: { updatedAt: new Date() },
  });
}

async function lookupOrderStatus(orderRef: string, tenantId?: number): Promise<string> {
  const db = getDb();
  const invoice = await db.query.invoices.findFirst({
    where: and(
      tenantId ? eq(invoices.tenantId, tenantId) : sql`1=1`,
      sql`${invoices.invoiceNumber} LIKE ${`%${orderRef}%`}`,
    ),
  });
  if (!invoice) return "Order not found. Please check your order number.";
  return `Order #${invoice.invoiceNumber} is **${invoice.status}**. Amount: ${invoice.totalAmount}. Due: ${invoice.dueDate || "N/A"}.`;
}

async function createSupportTicket(ctx: any, subject: string, description: string, customerInfo: any): Promise<number> {
  const db = getDb();
  const [ticket] = await db.insert(supportTickets).values({
    tenantId: ctx.user?.tenantId!,
    ticketNumber: `CHAT-${Date.now()}`,
    subject,
    description,
    requesterName: customerInfo?.name || "Chat Customer",
    requesterEmail: customerInfo?.email || "",
    requesterPhone: customerInfo?.phone || "",
    source: "chat",
    status: "open",
    priority: "medium",
    createdBy: ctx.user?.id,
  } as any).$returningId();
  return ticket?.id || 0;
}

function detectFAQIntent(query: string): { category: string; answer: string } | null {
  const q = query.toLowerCase();
  if (q.includes("ship") || q.includes("delivery") || q.includes("توصيل") || q.includes("شحن")) {
    return { category: "shipping", answer: "We offer standard (3-5 days), express (1-2 days), and international shipping. Delivery times vary by location. / نقدم الشحن العادي (3-5 أيام) والسريع (1-2 أيام) والدولي. تختلف أوقات التوصيل حسب الموقع." };
  }
  if (q.includes("return") || q.includes("refund") || q.includes("إرجاع") || q.includes("استرجاع")) {
    return { category: "returns", answer: "You can return items within 14 days of delivery. Items must be unused and in original packaging. Refunds are processed within 5-7 business days. / يمكنك إرجاع المنتجات خلال 14 يومًا من التوصيل. يجب أن تكون المنتجات غير مستعملة وفي عبوتها الأصلية." };
  }
  if (q.includes("track") || q.includes("order status") || q.includes("تتبع") || q.includes("حالة الطلب")) {
    return { category: "orders", answer: "You can track your order using the order number. Please provide your order number to check status. / يمكنك تتبع طلبك باستخدام رقم الطلب. يرجى تقديم رقم طلبك للتحقق من الحالة." };
  }
  if (q.includes("payment") || q.includes("pay") || q.includes("دفع") || q.includes("الدفع")) {
    return { category: "payment", answer: "We accept Visa, Mastercard, Mada, Apple Pay, bank transfer, and cash on delivery. / نقبل فيزا وماستركارد ومدى وأبل باي والتحويل البنكي والدفع عند الاستلام." };
  }
  return null;
}

export const aiChatbotRouter = createRouter({
  message: publicQuery
    .input(z.object({
      message: z.string(),
      sessionId: z.string(),
      customerId: z.number().optional(),
      customerName: z.string().optional(),
      customerEmail: z.string().optional(),
      customerPhone: z.string().optional(),
      language: z.enum(["en", "ar"]).optional().default("en"),
      channel: z.string().optional().default("portal"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await saveSession(ctx, input.sessionId, { name: input.customerName, email: input.customerEmail, phone: input.customerPhone });

      const faq = detectFAQIntent(input.message);
      if (faq) {
        return {
          response: faq.answer,
          type: "faq",
          category: faq.category,
          language: input.language,
          suggestions: ["Track my order", "Return policy", "Payment methods", "Contact support"],
        };
      }

      const orderMatch = input.message.match(/(?:order|invoice|طلب|فاتورة)\s*[#:]?\s*([A-Za-z0-9-]+)/i);
      if (orderMatch) {
        const status = await lookupOrderStatus(orderMatch[1], ctx.user?.tenantId);
        return {
          response: status,
          type: "order_status",
          orderRef: orderMatch[1],
          language: input.language,
          suggestions: ["Create support ticket", "Track another order", "Talk to agent"],
        };
      }

      if (input.message.toLowerCase().includes("ticket") || input.message.toLowerCase().includes("support") || input.message.toLowerCase().includes("agent") || input.message.toLowerCase().includes("بلاغ") || input.message.toLowerCase().includes("دعم")) {
        return {
          response: input.language === "ar" ? "يمكنك إنشاء تذكرة دعم. يرجى وصف مشكلتك وسيتم إنشاء تذكرة لفريق الدعم." : "I can create a support ticket for you. Please describe your issue and I'll open a ticket for the support team.",
          type: "ticket_creation_prompt",
          language: input.language,
          suggestions: ["Create ticket", "Talk to agent", "Back to menu"],
        };
      }

      const aiConfig = await getAiConfig(ctx);
      let aiResponse = "";
      if (aiConfig.apiKey) {
        const context = await db.query.aiChatbotSessions.findFirst({
          where: eq(aiChatbotSessions.sessionId, input.sessionId),
        });
        aiResponse = await generateResponse({
          query: `[Customer chatbot - ${input.language === "ar" ? "respond in Arabic" : "respond in English"}]\nCustomer: ${input.message}\nContext: ${JSON.stringify(context?.context || {})}\n\nBe helpful, concise, and friendly. If you cannot help, offer to create a support ticket.`,
          ...aiConfig,
        }) || "";
      }

      if (!aiResponse) {
        aiResponse = input.language === "ar"
          ? "شكراً لتواصلك! كيف يمكنني مساعدتك؟ يمكنك الاستفسار عن طلب، أو سياسة الإرجاع، أو إنشاء تذكرة دعم."
          : "Thank you for reaching out! How can I help you? You can ask about your order, return policy, payment options, or create a support ticket.";
      }

      return {
        response: aiResponse,
        type: "general",
        language: input.language,
        suggestions: ["Track order", "Return policy", "Payment info", "Create ticket", "Talk to agent"],
      };
    }),

  createTicket: publicQuery
    .input(z.object({
      sessionId: z.string(),
      subject: z.string(),
      description: z.string(),
      customerName: z.string().optional(),
      customerEmail: z.string().optional(),
      customerPhone: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const ticketId = await createSupportTicket(ctx, input.subject, input.description, {
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
      });
      await db.update(aiChatbotSessions)
        .set({ ticketId, status: "ticket_created" })
        .where(eq(aiChatbotSessions.sessionId, input.sessionId));
      return { success: true, ticketId, ticketNumber: `CHAT-${Date.now()}` };
    }),

  faq: publicQuery
    .input(z.object({
      category: z.string().optional(),
      language: z.enum(["en", "ar"]).optional().default("en"),
    }).optional())
    .query(async ({ input }) => {
      const categories = Object.entries(FAQ_CATEGORIES).map(([key, qs]) => ({
        category: key,
        questions: qs.map(q => input?.language === "ar" ? q.ar : q.en),
      }));
      if (input?.category) return categories.filter(c => c.category === input.category);
      return categories;
    }),

  sessions: authedQuery
    .input(z.object({ limit: z.number().optional().default(50) }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      return db.query.aiChatbotSessions.findMany({
        where: eq(aiChatbotSessions.tenantId, ctx.user.tenantId!),
        orderBy: desc(aiChatbotSessions.createdAt),
        limit: input?.limit || 50,
      });
    }),

  rate: publicQuery
    .input(z.object({ sessionId: z.string(), rating: z.number().min(1).max(5), feedback: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(aiChatbotSessions)
        .set({ rating: input.rating, feedback: input.feedback })
        .where(eq(aiChatbotSessions.sessionId, input.sessionId));
      return { success: true };
    }),
});
