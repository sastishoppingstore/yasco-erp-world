import { z } from "zod";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import {
  jobCostingDetails,
  costVarianceAlerts,
  jobCostingCategories,
  constructionProjects,
  wbsItems,
} from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const jobCostingRouter = createRouter({
  /**
   * Create Job Costing Category
   */
  createCategory: authedMutation
    .input(
      z.object({
        categoryName: z.string(),
        categoryCode: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        const [{ id }] = await db
          .insert(jobCostingCategories)
          .values({
            tenantId: ctx.user.tenantId!,
            ...input,
          })
          .$returningId();

        return {
          success: true,
          categoryId: id,
          message: "Category created",
        };
      } catch (error) {
        throw new Error(`Failed to create category: ${error}`);
      }
    }),

  /**
   * Initialize Job Costing for Project
   */
  initializeProjectCosting: authedMutation
    .input(
      z.object({
        projectId: z.number(),
        wbsItemId: z.number().optional(),
        costCategoryId: z.number(),
        budgetAmount: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        const [{ id }] = await db
          .insert(jobCostingDetails)
          .values({
            tenantId: ctx.user.tenantId!,
            projectId: input.projectId,
            wbsItemId: input.wbsItemId,
            costCategoryId: input.costCategoryId,
            budgetAmount: input.budgetAmount,
            actualAmount: "0",
            forecastAmount: input.budgetAmount,
            varianceAmount: "0",
            variancePercent: "0",
            status: "on_track",
          })
          .$returningId();

        return {
          success: true,
          jobCostingId: id,
          message: "Job costing initialized",
        };
      } catch (error) {
        throw new Error(`Failed to initialize costing: ${error}`);
      }
    }),

  /**
   * Update Actual Costs (from Invoice)
   */
  updateActualCost: authedMutation
    .input(
      z.object({
        jobCostingDetailId: z.number(),
        amountToAdd: z.string(),
        invoiceReference: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        // Get existing job costing
        const [costing] = await db
          .select()
          .from(jobCostingDetails)
          .where(
            and(
              eq(jobCostingDetails.id, input.jobCostingDetailId),
              eq(jobCostingDetails.tenantId, ctx.user.tenantId!)
            )
          );

        if (!costing) {
          throw new Error("Job costing not found");
        }

        // Calculate new actual amount
        const currentActual = parseFloat(costing.actualAmount || "0");
        const newActual = currentActual + parseFloat(input.amountToAdd);
        const budgetAmount = parseFloat(costing.budgetAmount || "0");

        // Calculate variance
        const varianceAmount = newActual - budgetAmount;
        const variancePercent = (varianceAmount / budgetAmount) * 100;
        const varianceType =
          varianceAmount > 0 ? "unfavorable" : "favorable";

        // Determine status
        let status = "on_track";
        if (Math.abs(variancePercent) > 20) {
          status = "critical";
        } else if (Math.abs(variancePercent) > 10) {
          status = "warning";
        }

        // Update costing
        await db
          .update(jobCostingDetails)
          .set({
            actualAmount: newActual.toString(),
            varianceAmount: varianceAmount.toString(),
            variancePercent: variancePercent.toFixed(2),
            varianceType: varianceType as any,
            status: status as any,
            updatedAt: new Date(),
          })
          .where(eq(jobCostingDetails.id, input.jobCostingDetailId));

        // Generate alert if variance exceeds threshold
        if (Math.abs(variancePercent) > 10) {
          await db.insert(costVarianceAlerts).values({
            tenantId: ctx.user.tenantId!,
            projectId: costing.projectId,
            jobCostingDetailId: input.jobCostingDetailId,
            thresholdPercent: Math.abs(variancePercent) > 20 ? 20 : 10,
            alertSeverity:
              Math.abs(variancePercent) > 20 ? "critical" : "warning",
            message: `Cost variance of ${variancePercent.toFixed(2)}% detected. Budget: ${budgetAmount}, Actual: ${newActual}`,
            varianceDetails: {
              invoiceReference: input.invoiceReference,
              variance: varianceAmount,
              variancePercent: variancePercent,
            },
          });
        }

        return {
          success: true,
          newActualAmount: newActual,
          variance: varianceAmount,
          variancePercent: variancePercent.toFixed(2),
          status: status,
        };
      } catch (error) {
        throw new Error(`Failed to update cost: ${error}`);
      }
    }),

  /**
   * Get Job Costing Details by Project
   */
  getProjectCostingDetails: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const costings = await db
        .select()
        .from(jobCostingDetails)
        .where(
          and(
            eq(jobCostingDetails.projectId, input.projectId),
            eq(jobCostingDetails.tenantId, ctx.user.tenantId!)
          )
        )
        .orderBy(jobCostingDetails.createdAt);

      // Calculate project-level summary
      let totalBudget = 0;
      let totalActual = 0;
      let totalForecast = 0;

      costings.forEach((c) => {
        totalBudget += parseFloat(c.budgetAmount || "0");
        totalActual += parseFloat(c.actualAmount || "0");
        totalForecast += parseFloat(c.forecastAmount || "0");
      });

      const projectVariance = totalActual - totalBudget;
      const projectVariancePercent = (projectVariance / totalBudget) * 100;

      return {
        success: true,
        costings: costings,
        summary: {
          totalBudget,
          totalActual,
          totalForecast,
          projectVariance,
          projectVariancePercent: projectVariancePercent.toFixed(2),
          costingCount: costings.length,
        },
      };
    }),

  /**
   * Get Cost Variance Alerts
   */
  getVarianceAlerts: authedQuery
    .input(
      z.object({
        projectId: z.number(),
        severity: z.enum(["warning", "critical"]).optional(),
        isResolved: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const conditions = [
        eq(costVarianceAlerts.projectId, input.projectId),
        eq(costVarianceAlerts.tenantId, ctx.user.tenantId!),
        eq(costVarianceAlerts.isResolved, input.isResolved),
      ];

      if (input.severity) {
        conditions.push(eq(costVarianceAlerts.alertSeverity, input.severity));
      }

      const alerts = await db
        .select()
        .from(costVarianceAlerts)
        .where(and(...conditions))
        .orderBy(desc(costVarianceAlerts.createdAt));

      return {
        success: true,
        alerts: alerts,
        count: alerts.length,
      };
    }),

  /**
   * Resolve Variance Alert
   */
  resolveVarianceAlert: authedMutation
    .input(
      z.object({
        alertId: z.number(),
        resolutionNotes: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        await db
          .update(costVarianceAlerts)
          .set({
            isResolved: true,
            resolvedBy: ctx.user.id!,
            resolvedAt: new Date(),
            resolutionNotes: input.resolutionNotes,
          })
          .where(
            and(
              eq(costVarianceAlerts.id, input.alertId),
              eq(costVarianceAlerts.tenantId, ctx.user.tenantId!)
            )
          );

        return {
          success: true,
          message: "Alert resolved",
        };
      } catch (error) {
        throw new Error(`Failed to resolve alert: ${error}`);
      }
    }),

  /**
   * Calculate Cost Forecast
   * Projects final cost based on burn rate
   */
  calculateCostForecast: authedMutation
    .input(z.object({ jobCostingDetailId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        const [costing] = await db
          .select()
          .from(jobCostingDetails)
          .where(
            and(
              eq(jobCostingDetails.id, input.jobCostingDetailId),
              eq(jobCostingDetails.tenantId, ctx.user.tenantId!)
            )
          );

        if (!costing) {
          throw new Error("Job costing not found");
        }

        const budgetAmount = parseFloat(costing.budgetAmount || "0");
        const actualAmount = parseFloat(costing.actualAmount || "0");
        const currentVariancePercent =
          parseFloat(costing.variancePercent || "0");

        // Forecast = Budget + (Budget * Current Variance %)
        const forecastAmount = budgetAmount + (budgetAmount * currentVariancePercent) / 100;

        // Update forecast
        await db
          .update(jobCostingDetails)
          .set({
            forecastAmount: forecastAmount.toString(),
            updatedAt: new Date(),
          })
          .where(eq(jobCostingDetails.id, input.jobCostingDetailId));

        return {
          success: true,
          forecastAmount,
          forecastVariance: forecastAmount - budgetAmount,
          forecastVariancePercent: (
            ((forecastAmount - budgetAmount) / budgetAmount) *
            100
          ).toFixed(2),
        };
      } catch (error) {
        throw new Error(`Failed to calculate forecast: ${error}`);
      }
    }),

  /**
   * Get Job Costing Dashboard
   */
  getJobCostingDashboard: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      // Get all costings
      const costings = await db
        .select()
        .from(jobCostingDetails)
        .where(
          and(
            eq(jobCostingDetails.projectId, input.projectId),
            eq(jobCostingDetails.tenantId, ctx.user.tenantId!)
          )
        );

      // Get alerts
      const alerts = await db
        .select()
        .from(costVarianceAlerts)
        .where(
          and(
            eq(costVarianceAlerts.projectId, input.projectId),
            eq(costVarianceAlerts.tenantId, ctx.user.tenantId!),
            eq(costVarianceAlerts.isResolved, false)
          )
        );

      // Calculate metrics
      const totalBudget = costings.reduce(
        (sum, c) => sum + parseFloat(c.budgetAmount || "0"),
        0
      );
      const totalActual = costings.reduce(
        (sum, c) => sum + parseFloat(c.actualAmount || "0"),
        0
      );
      const criticalCount = costings.filter(
        (c) => c.status === "critical"
      ).length;
      const warningCount = costings.filter(
        (c) => c.status === "warning"
      ).length;

      return {
        success: true,
        dashboard: {
          totalBudget,
          totalActual,
          totalVariance: totalActual - totalBudget,
          totalVariancePercent: ((totalActual - totalBudget) / totalBudget * 100).toFixed(2),
          costingCount: costings.length,
          criticalCount,
          warningCount,
          onTrackCount: costings.filter((c) => c.status === "on_track").length,
          alertCount: alerts.length,
        },
        costings,
        alerts,
      };
    }),
});
