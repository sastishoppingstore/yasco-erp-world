import { Hono } from "hono";
import { z } from "zod";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import {
  hseSafetyIncidents,
  hseKpiMetrics,
  nitaqatTracking,
  nitaqatComplianceAlerts,
} from "@db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

/**
 * HSE & SAFETY ROUTER - Phase 1 Sprint 5
 * Quick Wins: HSE KPI Dashboard + Nitaqat Compliance
 */

export const hseSafetyRouter = createRouter({
  /**
   * Submit Safety Incident
   */
  submitIncident: authedMutation
    .input(
      z.object({
        projectId: z.number(),
        incidentType: z.enum([
          "lost_time",
          "restricted_work",
          "medical_treatment",
          "near_miss",
          "property_damage",
        ]),
        incidentDate: z.date(),
        description: z.string(),
        location: z.string(),
        severity: z.enum(["low", "medium", "high", "critical"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        const [{ id }] = await db
          .insert(hseSafetyIncidents)
          .values({
            tenantId: ctx.user.tenantId!,
            projectId: input.projectId,
            reportedBy: ctx.user.id!,
            incidentType: input.incidentType,
            incidentDate: input.incidentDate,
            incidentDescription: input.description,
            location: input.location,
            severity: input.severity,
            investigationStatus: "open",
            createdAt: new Date(),
          })
          .$returningId();

        return {
          success: true,
          incidentId: id,
          message: "Incident reported successfully",
        };
      } catch (error) {
        throw new Error(`Failed to submit incident: ${error}`);
      }
    }),

  /**
   * Calculate HSE KPIs
   * TRIFR = (Total Recordable Incidents / Hours Worked) × 200,000
   * LTIFR = (Lost Time Incidents / Hours Worked) × 200,000
   * SFR = (Safety Frequency Rate)
   */
  calculateHseKpis: authedMutation
    .input(
      z.object({
        projectId: z.number(),
        reportingPeriod: z.date(),
        totalHoursWorked: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        // Get incidents for reporting period
        const incidents = await db
          .select()
          .from(hseSafetyIncidents)
          .where(
            and(
              eq(hseSafetyIncidents.projectId, input.projectId),
              eq(hseSafetyIncidents.tenantId, ctx.user.tenantId!),
              gte(hseSafetyIncidents.incidentDate, input.reportingPeriod),
              lte(
                hseSafetyIncidents.incidentDate,
                new Date(input.reportingPeriod.getTime() + 30 * 24 * 60 * 60 * 1000)
              )
            )
          );

        // Count incidents by type
        const totalIncidents = incidents.length;
        const lostTimeIncidents = incidents.filter(
          (i) => i.incidentType === "lost_time"
        ).length;
        const restrictedWorkIncidents = incidents.filter(
          (i) => i.incidentType === "restricted_work"
        ).length;
        const nearMisses = incidents.filter(
          (i) => i.incidentType === "near_miss"
        ).length;

        // Calculate KPIs
        const hoursWorked = parseFloat(input.totalHoursWorked);
        const trifr =
          hoursWorked > 0
            ? ((totalIncidents / hoursWorked) * 200000).toFixed(2)
            : "0";
        const ltifr =
          hoursWorked > 0
            ? ((lostTimeIncidents / hoursWorked) * 200000).toFixed(2)
            : "0";
        const sfr =
          hoursWorked > 0
            ? (((lostTimeIncidents + restrictedWorkIncidents) / hoursWorked) * 200000).toFixed(2)
            : "0";

        // Insert KPI metrics
        const [{ id }] = await db
          .insert(hseKpiMetrics)
          .values({
            tenantId: ctx.user.tenantId!,
            projectId: input.projectId,
            reportingPeriod: input.reportingPeriod,
            totalIncidents,
            lostTimeIncidents,
            restrictedWorkIncidents,
            nearMisses,
            totalHoursWorked: input.totalHoursWorked,
            trifr,
            ltifr,
            sfr,
            trainingCompletionPercent: "0",
            createdAt: new Date(),
            calculatedAt: new Date(),
          })
          .$returningId();

        return {
          success: true,
          kpiId: id,
          metrics: {
            trifr,
            ltifr,
            sfr,
            totalIncidents,
            lostTimeIncidents,
            nearMisses,
          },
        };
      } catch (error) {
        throw new Error(`Failed to calculate KPIs: ${error}`);
      }
    }),

  /**
   * Get HSE KPI Dashboard
   */
  getHseDashboard: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const kpis = await db
        .select()
        .from(hseKpiMetrics)
        .where(
          and(
            eq(hseKpiMetrics.projectId, input.projectId),
            eq(hseKpiMetrics.tenantId, ctx.user.tenantId!)
          )
        )
        .orderBy(desc(hseKpiMetrics.reportingPeriod))
        .limit(12); // Last 12 months

      const incidents = await db
        .select()
        .from(hseSafetyIncidents)
        .where(
          and(
            eq(hseSafetyIncidents.projectId, input.projectId),
            eq(hseSafetyIncidents.tenantId, ctx.user.tenantId!)
          )
        )
        .orderBy(desc(hseSafetyIncidents.incidentDate))
        .limit(10);

      const latestKpi = kpis.length > 0 ? kpis[0] : null;

      return {
        success: true,
        latestKpi,
        historicalKpis: kpis,
        recentIncidents: incidents,
        summary: latestKpi
          ? {
              trifr: latestKpi.trifr,
              ltifr: latestKpi.ltifr,
              sfr: latestKpi.sfr,
              totalIncidents: latestKpi.totalIncidents,
              nearMisses: latestKpi.nearMisses,
              trainingCompletion: latestKpi.trainingCompletionPercent,
            }
          : null,
      };
    }),

  /**
   * Nitaqat - Calculate Saudization Percentage
   */
  calculateNitaqat: authedMutation
    .input(
      z.object({
        projectId: z.number(),
        reportingPeriod: z.date(),
        totalWorkforce: z.number(),
        saudiCount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        const saudiPercentage =
          ((input.saudiCount / input.totalWorkforce) * 100).toFixed(2);

        // Determine category
        const percentage = parseFloat(saudiPercentage);
        let category = "bronze";
        if (percentage >= 90) category = "platinum";
        else if (percentage >= 75) category = "gold";
        else if (percentage >= 50) category = "silver";

        // Determine compliance status
        let complianceStatus = "compliant";
        if (percentage < 50) complianceStatus = "non_compliant";
        else if (percentage < 60) complianceStatus = "warning";

        const [{ id }] = await db
          .insert(nitaqatTracking)
          .values({
            tenantId: ctx.user.tenantId!,
            projectId: input.projectId,
            reportingPeriod: input.reportingPeriod,
            totalWorkforce: input.totalWorkforce,
            saudiCount: input.saudiCount,
            nonSaudiCount: input.totalWorkforce - input.saudiCount,
            nitaqatPercentage: saudiPercentage,
            category: category as any,
            salaryCeilingViolations: 0,
            complianceStatus: complianceStatus as any,
            createdAt: new Date(),
            calculatedAt: new Date(),
          })
          .$returningId();

        // Generate alert if non-compliant
        if (complianceStatus !== "compliant") {
          await db.insert(nitaqatComplianceAlerts).values({
            tenantId: ctx.user.tenantId!,
            projectId: input.projectId,
            alertType: complianceStatus === "non_compliant" ? "non_compliance" : "threshold_warning",
            severity: complianceStatus === "non_compliant" ? "critical" : "warning",
            message: `Nitaqat ${category} - ${saudiPercentage}% Saudization (${input.saudiCount}/${input.totalWorkforce})`,
            createdAt: new Date(),
          });
        }

        return {
          success: true,
          nitaqatId: id,
          percentage: saudiPercentage,
          category,
          complianceStatus,
        };
      } catch (error) {
        throw new Error(`Failed to calculate Nitaqat: ${error}`);
      }
    }),

  /**
   * Get Nitaqat Dashboard
   */
  getNitaqatDashboard: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const trackings = await db
        .select()
        .from(nitaqatTracking)
        .where(
          and(
            eq(nitaqatTracking.projectId, input.projectId),
            eq(nitaqatTracking.tenantId, ctx.user.tenantId!)
          )
        )
        .orderBy(desc(nitaqatTracking.reportingPeriod));

      const alerts = await db
        .select()
        .from(nitaqatComplianceAlerts)
        .where(
          and(
            eq(nitaqatComplianceAlerts.projectId, input.projectId),
            eq(nitaqatComplianceAlerts.tenantId, ctx.user.tenantId!),
            eq(nitaqatComplianceAlerts.isAcknowledged, false)
          )
        );

      const latest = trackings.length > 0 ? trackings[0] : null;

      return {
        success: true,
        current: latest,
        historical: trackings,
        alerts,
        categoryBreakdown: latest
          ? {
              saudis: latest.saudiCount,
              nonSaudis: latest.nonSaudiCount,
              percentage: latest.nitaqatPercentage,
              category: latest.category,
              compliance: latest.complianceStatus,
            }
          : null,
      };
    }),

  /**
   * Get Compliance Alerts
   */
  getComplianceAlerts: authedQuery
    .input(
      z.object({
        projectId: z.number(),
        onlyUnacknowledged: z.boolean().default(true),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const conditions = [
        eq(nitaqatComplianceAlerts.projectId, input.projectId),
        eq(nitaqatComplianceAlerts.tenantId, ctx.user.tenantId!),
      ];

      if (input.onlyUnacknowledged) {
        conditions.push(eq(nitaqatComplianceAlerts.isAcknowledged, false));
      }

      const alerts = await db
        .select()
        .from(nitaqatComplianceAlerts)
        .where(and(...conditions))
        .orderBy(desc(nitaqatComplianceAlerts.createdAt));

      return {
        success: true,
        alerts,
        count: alerts.length,
      };
    }),

  /**
   * Acknowledge Alert
   */
  acknowledgeAlert: authedMutation
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        await db
          .update(nitaqatComplianceAlerts)
          .set({
            isAcknowledged: true,
            acknowledgedAt: new Date(),
            acknowledgedBy: ctx.user.id!,
          })
          .where(
            and(
              eq(nitaqatComplianceAlerts.id, input.alertId),
              eq(nitaqatComplianceAlerts.tenantId, ctx.user.tenantId!)
            )
          );

        return {
          success: true,
          message: "Alert acknowledged",
        };
      } catch (error) {
        throw new Error(`Failed to acknowledge alert: ${error}`);
      }
    }),
});
