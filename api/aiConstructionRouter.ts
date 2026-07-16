import { createRouter } from "@/server/createRouter";
import { authedMutation, authedQuery } from "@/server/trpc";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

/**
 * ADVANCED AI ROUTER - COMPLETE INTELLIGENCE LAYER
 * Integrates Claude AI for construction project intelligence
 */

const client = new Anthropic();

// Input validation schemas
const insightsSchema = z.object({
  metrics: z.object({
    budget: z.number(),
    schedule: z.number(),
    quality: z.number(),
    safety: z.number(),
  }),
  projectContext: z.string().optional(),
});

const forecastSchema = z.object({
  projectId: z.number(),
  historicalData: z.array(
    z.object({
      date: z.string(),
      spent: z.number(),
      planned: z.number(),
    })
  ),
});

const riskAnalysisSchema = z.object({
  projectId: z.number(),
  factors: z.array(z.string()),
  currentStatus: z.string().optional(),
});

const documentAnalysisSchema = z.object({
  documentType: z.enum(["bid", "invoice", "contract", "report", "rfi"]),
  content: z.string(),
});

const chatSchema = z.object({
  message: z.string(),
  context: z.object({
    projectId: z.number().optional(),
    conversationHistory: z.array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    ).optional(),
  }).optional(),
});

/**
 * INSIGHTS GENERATION - Analyze project metrics using AI
 */
const generateConstructionInsights = authedQuery
  .input(insightsSchema)
  .query(async ({ input, ctx }) => {
    try {
      const prompt = `You are an expert construction project manager. Analyze these project metrics and provide 5 specific, actionable insights:

Budget Progress: ${input.metrics.budget}%
Schedule Progress: ${input.metrics.schedule}%
Quality Score: ${input.metrics.quality}/100
Safety Score: ${input.metrics.safety}/100
${input.projectContext ? `Project Context: ${input.projectContext}` : ""}

Provide insights in this JSON format:
{
  "insights": [
    "insight 1",
    "insight 2",
    ...
  ],
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["action 1", "action 2"],
  "priority": "critical|high|medium|low"
}`;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: ["Analysis complete"] };

      return {
        success: true,
        data: analysis,
        message: "AI analysis generated successfully",
      };
    } catch (error: any) {
      console.error("AI insights error:", error);
      return {
        success: false,
        message: error.message || "Failed to generate insights",
        data: null,
      };
    }
  });

/**
 * BUDGET FORECASTING - ML-powered budget predictions
 */
const forecastBudget = authedMutation
  .input(forecastSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      // Analyze historical spending pattern
      const avgDailySpend = input.historicalData.reduce((sum, d) => sum + d.spent, 0) / input.historicalData.length;
      const variance = Math.max(...input.historicalData.map(d => d.spent)) - Math.min(...input.historicalData.map(d => d.spent));

      const prompt = `As a construction finance expert, forecast the remaining budget needs based on:
Historical Data: ${JSON.stringify(input.historicalData)}
Average Daily Spend: SAR ${avgDailySpend.toFixed(2)}
Spending Variance: SAR ${variance.toFixed(2)}

Provide:
1. Forecasted final project cost
2. Projected completion date
3. Risk level
4. Recommended actions`;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      return {
        success: true,
        forecast: textContent.text,
        avgDailySpend,
        variance,
      };
    } catch (error: any) {
      throw new Error(`Forecasting failed: ${error.message}`);
    }
  });

/**
 * RISK ANALYSIS - Identify project risks
 */
const analyzeProjectRisks = authedQuery
  .input(riskAnalysisSchema)
  .query(async ({ input, ctx }) => {
    try {
      const prompt = `As a construction risk management expert, analyze these project factors:
Factors: ${input.factors.join(", ")}
Current Status: ${input.currentStatus || "In progress"}

For each factor, provide:
1. Risk level (1-10)
2. Potential impact
3. Mitigation strategies
4. Early warning signs

Format as JSON with factor names as keys.`;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      const risks = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        risks,
        overallRiskLevel: Object.values(risks).reduce((a: any, b: any) => (a.riskLevel || 0) + (b.riskLevel || 0), 0) / Object.keys(risks).length,
      };
    } catch (error: any) {
      throw new Error(`Risk analysis failed: ${error.message}`);
    }
  });

/**
 * DOCUMENT ANALYSIS - AI-powered document review
 */
const analyzeDocument = authedMutation
  .input(documentAnalysisSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const docDescriptions = {
        bid: "construction bid proposal",
        invoice: "construction invoice or payment certificate",
        contract: "construction contract agreement",
        report: "project status report or inspection report",
        rfi: "Request for Information (RFI)",
      };

      const prompt = `You are a construction document expert. Review this ${docDescriptions[input.documentType]}:

${input.content}

Provide analysis in JSON format:
{
  "summary": "brief summary",
  "key_items": ["item1", "item2"],
  "issues": ["issue1", "issue2"],
  "compliance_check": "compliant|issues|missing_info",
  "action_items": ["action1", "action2"],
  "estimated_cost_impact": "amount or percentage if applicable",
  "timeline_impact": "days or description if applicable"
}`;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        analysis,
        documentType: input.documentType,
      };
    } catch (error: any) {
      throw new Error(`Document analysis failed: ${error.message}`);
    }
  });

/**
 * AI CHAT - Conversational construction assistant
 */
const chatWithAI = authedMutation
  .input(chatSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const systemPrompt = `You are an expert construction project management AI assistant. You provide:
- Real-time project insights and recommendations
- Budget and cost analysis
- Schedule optimization suggestions
- Safety and compliance guidance
- Quality assurance recommendations
- Qiwa/Nitaqat/ZATCA compliance help

Be specific, actionable, and reference Saudi construction standards when relevant.`;

      const messages = [
        ...(input.context?.conversationHistory || []),
        {
          role: "user" as const,
          content: input.message,
        },
      ];

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      return {
        success: true,
        reply: textContent.text,
        conversationId: ctx.user.id,
      };
    } catch (error: any) {
      throw new Error(`Chat failed: ${error.message}`);
    }
  });

/**
 * SCHEDULE OPTIMIZATION - AI suggests schedule improvements
 */
const optimizeSchedule = authedMutation
  .input(
    z.object({
      projectId: z.number(),
      tasks: z.array(
        z.object({
          name: z.string(),
          duration: z.number(),
          dependencies: z.array(z.number()).optional(),
          resources: z.array(z.string()).optional(),
        })
      ),
      constraints: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const prompt = `As a construction scheduling expert, optimize this project schedule:

Tasks:
${input.tasks.map((t, i) => `${i + 1}. ${t.name} (${t.duration} days)${t.dependencies?.length ? ` - Depends on: ${t.dependencies.join(", ")}` : ""}`).join("\n")}

Constraints: ${input.constraints?.join(", ") || "None specified"}

Provide:
1. Optimized task sequence
2. Critical path
3. Resource leveling suggestions
4. Compression opportunities
5. Risk factors

Format as JSON.`;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      const optimization = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        optimization,
        message: "Schedule optimization complete",
      };
    } catch (error: any) {
      throw new Error(`Schedule optimization failed: ${error.message}`);
    }
  });

/**
 * COMPLIANCE CHECK - Verify Saudi regulatory compliance
 */
const checkSaudiCompliance = authedQuery
  .input(
    z.object({
      complianceType: z.enum(["qiwa", "nitaqat", "zatca", "hse", "balady", "all"]),
      projectData: z.record(z.any()).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      const prompt = `You are a Saudi Arabia construction compliance expert. Check ${input.complianceType} compliance:

Project Data: ${JSON.stringify(input.projectData || {})}

Provide compliance status in JSON:
{
  "compliant": true/false,
  "checks": [
    {
      "requirement": "requirement name",
      "status": "compliant|non_compliant|pending",
      "details": "explanation"
    }
  ],
  "issues": ["issue1", "issue2"],
  "actions_required": ["action1", "action2"],
  "deadline": "date if applicable"
}`;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      const compliance = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        compliance,
        timestamp: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Compliance check failed: ${error.message}`);
    }
  });

/**
 * QUALITY RECOMMENDATIONS - AI suggests quality improvements
 */
const generateQualityRecommendations = authedQuery
  .input(
    z.object({
      defectType: z.string(),
      location: z.string().optional(),
      severity: z.enum(["critical", "major", "minor"]),
      history: z.array(z.string()).optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      const prompt = `As a construction quality manager, provide recommendations for:

Defect Type: ${input.defectType}
Severity: ${input.severity}
Location: ${input.location || "Not specified"}
Similar Past Issues: ${input.history?.join(", ") || "None"}

Provide in JSON:
{
  "root_cause": "likely cause",
  "immediate_actions": ["action1", "action2"],
  "corrective_actions": ["correction1", "correction2"],
  "preventive_measures": ["measure1", "measure2"],
  "estimated_cost": "cost estimate",
  "timeline": "time to fix",
  "verification_method": "how to verify fix"
}`;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        recommendations,
      };
    } catch (error: any) {
      throw new Error(`Quality recommendations failed: ${error.message}`);
    }
  });

export const aiRouter = createRouter()
  .query("generateConstructionInsights", generateConstructionInsights)
  .mutation("forecastBudget", forecastBudget)
  .query("analyzeProjectRisks", analyzeProjectRisks)
  .mutation("analyzeDocument", analyzeDocument)
  .mutation("chatWithAI", chatWithAI)
  .mutation("optimizeSchedule", optimizeSchedule)
  .query("checkSaudiCompliance", checkSaudiCompliance)
  .query("generateQualityRecommendations", generateQualityRecommendations);
