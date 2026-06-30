import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  chartOfAccounts, invoiceItems, products, invoices,
  aiAutomationRules, aiAutomationSuggestions, companySettings,
} from "@db/schema";
import { and, eq, sql, desc, like } from "drizzle-orm";
import { generateResponse } from "./services/gemini";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "office_supplies": ["office", "stationery", "paper", "printer", "toner", "pen", "desk", "chair", "furniture"],
  "utilities": ["electricity", "water", "gas", "internet", "phone", "utility", "sewa"],
  "rent": ["rent", "lease", "rental", "مكتب", "إيجار"],
  "salary": ["salary", "wage", "payroll", "employee", "staff"],
  "transportation": ["fuel", "petrol", "diesel", "transport", "delivery", "shipping", "taxi", "car"],
  "marketing": ["advert", "marketing", "social media", "google ads", "facebook", "promotion", "brand"],
  "maintenance": ["repair", "maintenance", "fix", "service charge", "AMC"],
  "travel": ["flight", "hotel", "travel", "ticket", "accommodation", "booking"],
  "legal": ["legal", "lawyer", "consultant", "consulting", "professional fee"],
  "software": ["software", "license", "subscription", "saas", "cloud", "hosting"],
  "food": ["food", "restaurant", "catering", "lunch", "coffee"],
  "raw_materials": ["raw material", "fabric", "steel", "wood", "plastic", "chemical"],
  "packaging": ["packaging", "box", "carton", "label", "sticker"],
  "insurance": ["insurance", "takaful"],
};

function suggestCategory(description: string): { category: string; confidence: number } {
  const desc = description.toLowerCase();
  let bestMatch = { category: "other", confidence: 0 };
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matched = keywords.filter(k => desc.includes(k)).length;
    if (matched > 0) {
      const confidence = matched / keywords.length;
      if (confidence > bestMatch.confidence) {
        bestMatch = { category, confidence };
      }
    }
  }
  return bestMatch;
}

function detectAnomaly(amount: number, historicalAvg: number, stdDev: number): { isAnomaly: boolean; reason: string } {
  if (historicalAvg === 0) return { isAnomaly: false, reason: "" };
  const zScore = Math.abs((amount - historicalAvg) / Math.max(stdDev, 1));
  if (zScore > 3) return { isAnomaly: true, reason: `Transaction amount (${amount}) is ${zScore.toFixed(1)} standard deviations from the mean (${historicalAvg.toFixed(2)})` };
  if (amount > historicalAvg * 5) return { isAnomaly: true, reason: `Transaction is 5x higher than historical average (${historicalAvg.toFixed(2)})` };
  return { isAnomaly: false, reason: "" };
}

export const aiAutomationRouter = createRouter({
  categorizeExpense: authedQuery
    .input(z.object({
      description: z.string(),
      amount: z.number().optional(),
      aiSuggestion: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const ruleBased = suggestCategory(input.description);

      let aiCategory = ruleBased;
      if (input.aiSuggestion) {
        const settings = await db.query.companySettings.findFirst({
          where: eq(companySettings.tenantId, ctx.user.tenantId!),
          columns: { aiApiKey: true, aiModel: true },
        });
        if (settings?.aiApiKey) {
          const aiResp = await generateResponse({
            query: `Categorize this expense description into one of these categories: ${Object.keys(CATEGORY_KEYWORDS).join(", ")}, other.\nDescription: "${input.description}"\nAmount: ${input.amount || "N/A"}\n\nRespond with just the category name.`,
            apiKey: settings.aiApiKey,
            model: settings.aiModel,
          });
          if (aiResp && Object.keys(CATEGORY_KEYWORDS).includes(aiResp.trim().toLowerCase())) {
            aiCategory = { category: aiResp.trim().toLowerCase(), confidence: 0.8 };
          }
        }
      }

      const suggestion = await db.insert(aiAutomationSuggestions).values({
        tenantId: ctx.user.tenantId!,
        ruleType: "expense_categorization",
        sourceEntityType: "expense",
        suggestedAction: { category: aiCategory.category, description: input.description, amount: input.amount },
        confidence: aiCategory.confidence,
        status: "pending",
      } as any).$returningId();

      return {
        success: true,
        suggestedCategory: aiCategory.category,
        confidence: aiCategory.confidence,
        method: aiCategory.confidence > 0.5 ? "ai" : "rule_based",
        suggestionId: suggestion?.[0]?.id,
      };
    }),

  matchBankTransaction: authedQuery
    .input(z.object({
      bankDescription: z.string(),
      bankAmount: z.number(),
      bankDate: z.string(),
      confidenceThreshold: z.number().optional().default(0.6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const matchingInvoices = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          totalAmount: invoices.totalAmount,
          date: invoices.date,
          status: invoices.status,
        })
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, ctx.user.tenantId!),
          sql`ABS(CAST(${invoices.totalAmount} AS DECIMAL(18,4)) - ${input.bankAmount}) < 0.01`,
        ))
        .orderBy(desc(invoices.date))
        .limit(5);

      const suggestions = matchingInvoices.map(inv => {
        const descWords = input.bankDescription.toLowerCase().split(" ");
        const invWords = inv.invoiceNumber.toLowerCase().includes(descWords.join(" ")) ? 1 : 0;
        const confidence = inv.totalAmount === String(input.bankAmount) ? 0.95 : 0.7;
        return {
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          amount: inv.totalAmount,
          date: inv.date,
          confidence,
          matchType: "exact_amount",
        };
      });

      const suggestion = await db.insert(aiAutomationSuggestions).values({
        tenantId: ctx.user.tenantId!,
        ruleType: "bank_matching",
        sourceEntityType: "bank_transaction",
        suggestedAction: { bankDescription: input.bankDescription, bankAmount: input.bankAmount, matches: suggestions },
        confidence: suggestions.length > 0 ? Math.max(...suggestions.map(s => s.confidence)) : 0,
        status: "pending",
      } as any);

      return {
        success: true,
        matches: suggestions.filter(s => s.confidence >= input.confidenceThreshold),
        totalCandidates: suggestions.length,
      };
    }),

  detectAnomaly: authedQuery
    .input(z.object({
      entityType: z.enum(["invoice", "payment", "expense", "purchase"]),
      entityId: z.number(),
      amount: z.number(),
      description: z.string().optional(),
      department: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const historicalData = await db
        .select({
          avgAmount: sql<string>`COALESCE(AVG(${invoices.totalAmount}), 0)`,
          stdAmount: sql<string>`COALESCE(STD(${invoices.totalAmount}), 0)`,
        })
        .from(invoices)
        .where(eq(invoices.tenantId, ctx.user.tenantId!));

      const avg = Number(historicalData[0]?.avgAmount || 0);
      const std = Number(historicalData[0]?.stdAmount || 0);
      const anomaly = detectAnomaly(input.amount, avg, std);

      if (anomaly.isAnomaly) {
        await db.insert(aiAutomationSuggestions).values({
          tenantId: ctx.user.tenantId!,
          ruleType: "anomaly_detection",
          sourceEntityType: input.entityType,
          sourceEntityId: input.entityId,
          suggestedAction: { flag: true, reason: anomaly.reason, amount: input.amount, avg, std },
          confidence: 0.85,
          status: "pending",
        } as any);
      }

      return {
        isAnomaly: anomaly.isAnomaly,
        reason: anomaly.reason,
        historicalAvg: avg,
        historicalStd: std,
      };
    }),

  rules: authedQuery
    .input(z.object({
      ruleType: z.enum(["expense_categorization", "bank_matching", "anomaly_detection", "all"]).optional().default("all"),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(aiAutomationRules.tenantId, ctx.user.tenantId!)];
      if (input?.ruleType && input.ruleType !== "all") conditions.push(eq(aiAutomationRules.ruleType, input.ruleType));
      return db.query.aiAutomationRules.findMany({
        where: and(...conditions),
        orderBy: desc(aiAutomationRules.createdAt),
      });
    }),

  createRule: authedQuery
    .input(z.object({
      name: z.string(),
      ruleType: z.enum(["expense_categorization", "bank_matching", "anomaly_detection"]),
      description: z.string().optional(),
      configuration: z.any(),
      isActive: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [rule] = await db.insert(aiAutomationRules).values({
        tenantId: ctx.user.tenantId!,
        name: input.name,
        ruleType: input.ruleType,
        description: input.description,
        configuration: input.configuration,
        isActive: input.isActive,
        createdBy: ctx.user.id,
      } as any).$returningId();
      return { success: true, ruleId: rule?.id };
    }),

  suggestions: authedQuery
    .input(z.object({
      status: z.enum(["pending", "applied", "dismissed"]).optional(),
      ruleType: z.string().optional(),
      limit: z.number().optional().default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(aiAutomationSuggestions.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(aiAutomationSuggestions.status, input.status));
      if (input?.ruleType) conditions.push(eq(aiAutomationSuggestions.ruleType, input.ruleType));
      return db.query.aiAutomationSuggestions.findMany({
        where: and(...conditions),
        orderBy: desc(aiAutomationSuggestions.createdAt),
        limit: input?.limit || 50,
      });
    }),

  applySuggestion: authedQuery
    .input(z.object({ suggestionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(aiAutomationSuggestions)
        .set({ status: "applied", appliedBy: ctx.user.id, appliedAt: new Date() })
        .where(and(eq(aiAutomationSuggestions.id, input.suggestionId), eq(aiAutomationSuggestions.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  dismissSuggestion: authedQuery
    .input(z.object({ suggestionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(aiAutomationSuggestions)
        .set({ status: "dismissed" })
        .where(and(eq(aiAutomationSuggestions.id, input.suggestionId), eq(aiAutomationSuggestions.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),
});
