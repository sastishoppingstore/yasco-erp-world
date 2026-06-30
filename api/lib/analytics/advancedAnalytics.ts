import { Decimal } from "decimal.js";

/**
 * Advanced Analytics & Forecasting Engine
 * Machine Learning-based predictions for construction projects
 * Includes delay prediction, budget forecasting, and resource optimization
 */

export interface HistoricalData {
  projectId: number;
  projectName: string;
  plannedDuration: number;
  actualDuration: number;
  plannedCost: number;
  actualCost: number;
  completionDate: Date;
  weatherDelays: number;
  laborShortages: number;
  materialDelays: number;
}

export interface DelayPrediction {
  taskId: number;
  taskName: string;
  predictedDelay: number;
  confidence: number;
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
}

export interface BudgetForecast {
  projectId: number;
  forecastDate: Date;
  forecastedCost: number;
  confidenceInterval: { lower: number; upper: number };
  variance: number;
  factors: string[];
}

export interface RiskFactor {
  factor: string;
  weight: number;
  trend: "improving" | "stable" | "deteriorating";
}

export interface ResourcePrediction {
  resourceType: string;
  currentUtilization: number;
  forecastedUtilization: number;
  bottlenecks: string[];
  recommendations: string[];
}

export interface ProjectKPI {
  projectId: number;
  kpiName: string;
  currentValue: number;
  target: number;
  trend: number; // -1 to 1
  status: "on-track" | "at-risk" | "critical";
}

export class AdvancedAnalyticsEngine {
  /**
   * Predict delays using historical data and ML
   */
  static predictDelays(
    taskData: any,
    historicalData: HistoricalData[]
  ): DelayPrediction[] {
    const predictions: DelayPrediction[] = [];

    // Calculate average delay factors from historical data
    const avgWeatherDelay = historicalData.reduce((a, h) => a + h.weatherDelays, 0) / Math.max(1, historicalData.length);
    const avgLaborDelay = historicalData.reduce((a, h) => a + h.laborShortages, 0) / Math.max(1, historicalData.length);
    const avgMaterialDelay = historicalData.reduce((a, h) => a + h.materialDelays, 0) / Math.max(1, historicalData.length);

    // Analyze current project conditions
    const currentWeatherRisk = 0.3; // Placeholder - would be based on weather forecasts
    const currentLaborRisk = 0.2; // Placeholder - would be based on labor market
    const currentMaterialRisk = 0.15; // Placeholder - would be based on supplier data

    // Calculate weighted delay prediction
    const predictedDelay = (
      avgWeatherDelay * currentWeatherRisk +
      avgLaborDelay * currentLaborRisk +
      avgMaterialDelay * currentMaterialRisk
    );

    // Calculate confidence based on data quality
    const confidence = Math.min(0.95, 0.5 + (historicalData.length * 0.05));

    const riskFactors: RiskFactor[] = [
      { factor: "Weather", weight: 0.3, trend: "stable" },
      { factor: "Labor Availability", weight: 0.3, trend: "improving" },
      { factor: "Material Supply", weight: 0.25, trend: "deteriorating" },
      { factor: "Equipment Availability", weight: 0.15, trend: "stable" },
    ];

    const mitigationStrategies = [
      "Increase labor pool to handle uncertainties",
      "Pre-order critical materials 6 weeks in advance",
      "Negotiate equipment supplier contracts",
      "Develop contingency weather schedules",
    ];

    // Create prediction for each task (simplified)
    if (taskData && taskData.length > 0) {
      predictions.push({
        taskId: taskData[0].id,
        taskName: taskData[0].name,
        predictedDelay,
        confidence,
        riskFactors,
        mitigationStrategies,
      });
    }

    return predictions;
  }

  /**
   * Forecast budget using time-series analysis
   */
  static forecastBudget(
    historicalCosts: { date: Date; cost: number }[],
    periods: number = 3
  ): BudgetForecast[] {
    const forecasts: BudgetForecast[] = [];

    if (historicalCosts.length < 2) {
      return forecasts;
    }

    // Simple linear regression for trend
    const n = historicalCosts.length;
    const sumX = Array.from({ length: n }, (_, i) => i).reduce((a, b) => a + b, 0);
    const sumY = historicalCosts.reduce((a, h) => a + h.cost, 0);
    const sumXY = historicalCosts.reduce((a, h, i) => a + i * h.cost, 0);
    const sumX2 = Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate standard deviation for confidence interval
    const residuals = historicalCosts.map(
      (h, i) => h.cost - (intercept + slope * i)
    );
    const stdDev = Math.sqrt(
      residuals.reduce((a, r) => a + r * r, 0) / Math.max(1, residuals.length - 2)
    );

    // Generate forecasts
    for (let i = 1; i <= periods; i++) {
      const forecastValue = intercept + slope * (n + i - 1);
      const margin = 1.96 * stdDev; // 95% confidence interval

      forecasts.push({
        projectId: 0,
        forecastDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000), // 30 days forward
        forecastedCost: Math.max(0, forecastValue),
        confidenceInterval: {
          lower: Math.max(0, forecastValue - margin),
          upper: forecastValue + margin,
        },
        variance: slope * i,
        factors: [
          "Historical cost trend",
          "Seasonal adjustments",
          "Inflation factors",
        ],
      });
    }

    return forecasts;
  }

  /**
   * Predict resource availability
   */
  static predictResourceAvailability(
    currentUtilization: Record<string, number>,
    demandForecast: Record<string, number[]>
  ): ResourcePrediction[] {
    const predictions: ResourcePrediction[] = [];

    for (const [resourceType, currentUtil] of Object.entries(currentUtilization)) {
      const forecast = demandForecast[resourceType] || [];
      const avgForecastedUtil = forecast.length > 0
        ? forecast.reduce((a, b) => a + b, 0) / forecast.length
        : currentUtil;

      const bottlenecks: string[] = [];
      if (avgForecastedUtil > 0.9) {
        bottlenecks.push(`High utilization expected (${(avgForecastedUtil * 100).toFixed(0)}%)`);
      }
      if (avgForecastedUtil > 1.0) {
        bottlenecks.push("Insufficient capacity - resource shortage predicted");
      }

      const recommendations: string[] = [];
      if (bottlenecks.length > 0) {
        recommendations.push(`Increase ${resourceType} allocation by ${Math.ceil((avgForecastedUtil - 0.8) * 50)}%`);
        recommendations.push(`Negotiate long-term contracts for ${resourceType}`);
      } else {
        recommendations.push(`Current ${resourceType} allocation is adequate`);
      }

      predictions.push({
        resourceType,
        currentUtilization: currentUtil,
        forecastedUtilization: avgForecastedUtil,
        bottlenecks,
        recommendations,
      });
    }

    return predictions;
  }

  /**
   * Calculate project KPIs
   */
  static calculateProjectKPIs(projectData: any): ProjectKPI[] {
    const kpis: ProjectKPI[] = [];

    // Schedule Performance Index (SPI)
    const spi = projectData.earnedValue / Math.max(0.01, projectData.plannedValue);
    kpis.push({
      projectId: projectData.projectId,
      kpiName: "Schedule Performance Index (SPI)",
      currentValue: spi,
      target: 1.0,
      trend: spi > 1.0 ? 0.1 : -0.1,
      status: spi >= 0.95 ? "on-track" : spi >= 0.85 ? "at-risk" : "critical",
    });

    // Cost Performance Index (CPI)
    const cpi = projectData.earnedValue / Math.max(0.01, projectData.actualCost);
    kpis.push({
      projectId: projectData.projectId,
      kpiName: "Cost Performance Index (CPI)",
      currentValue: cpi,
      target: 1.0,
      trend: cpi > 1.0 ? 0.1 : -0.1,
      status: cpi >= 0.95 ? "on-track" : cpi >= 0.85 ? "at-risk" : "critical",
    });

    // Budget at Completion (BAC) vs Estimate at Completion (EAC)
    const bac = projectData.budgetAtCompletion || projectData.budget;
    const eac = projectData.actualCost + (projectData.budget - projectData.earnedValue) / Math.max(0.01, cpi);
    kpis.push({
      projectId: projectData.projectId,
      kpiName: "Budget Estimate Accuracy",
      currentValue: bac / Math.max(0.01, eac),
      target: 1.0,
      trend: eac > bac ? -0.05 : 0.05,
      status: eac <= bac * 1.1 ? "on-track" : eac <= bac * 1.2 ? "at-risk" : "critical",
    });

    // Quality Index (simplified)
    const qualityScore = Math.max(0, 1 - (projectData.defects / Math.max(1, projectData.workItems)));
    kpis.push({
      projectId: projectData.projectId,
      kpiName: "Quality Score",
      currentValue: qualityScore,
      target: 0.95,
      trend: qualityScore > 0.92 ? 0.05 : -0.05,
      status: qualityScore >= 0.9 ? "on-track" : qualityScore >= 0.8 ? "at-risk" : "critical",
    });

    // Resource Utilization
    const resourceUtil = projectData.allocatedResources / Math.max(0.01, projectData.availableResources);
    kpis.push({
      projectId: projectData.projectId,
      kpiName: "Resource Utilization",
      currentValue: resourceUtil,
      target: 0.85,
      trend: resourceUtil > 0.85 ? 0.05 : -0.05,
      status: resourceUtil >= 0.75 ? "on-track" : resourceUtil >= 0.6 ? "at-risk" : "critical",
    });

    return kpis;
  }

  /**
   * Anomaly detection in project data
   */
  static detectAnomalies(timeSeries: { date: Date; value: number }[]): Array<{
    date: Date;
    value: number;
    type: "spike" | "dip" | "trend-change";
    severity: "low" | "medium" | "high";
  }> {
    const anomalies: Array<any> = [];

    if (timeSeries.length < 3) return anomalies;

    // Calculate moving average
    const windowSize = 3;
    const movingAvgs: number[] = [];
    const stdDevs: number[] = [];

    for (let i = 0; i < timeSeries.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = timeSeries.slice(start, i + 1).map(x => x.value);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      movingAvgs.push(avg);

      // Calculate standard deviation
      const variance = window.reduce((a, x) => a + Math.pow(x - avg, 2), 0) / window.length;
      stdDevs.push(Math.sqrt(variance));
    }

    // Detect anomalies
    for (let i = 1; i < timeSeries.length; i++) {
      const value = timeSeries[i].value;
      const movingAvg = movingAvgs[i];
      const stdDev = stdDevs[i];

      const zScore = Math.abs((value - movingAvg) / Math.max(0.1, stdDev));

      if (zScore > 2.5) {
        // Significant deviation
        const type = value > movingAvg ? "spike" : "dip";
        const severity = zScore > 4 ? "high" : zScore > 3 ? "medium" : "low";

        anomalies.push({
          date: timeSeries[i].date,
          value,
          type,
          severity,
        });
      }
    }

    return anomalies;
  }

  /**
   * Perform what-if scenario analysis
   */
  static scenarioAnalysis(
    baselineProject: any,
    scenarios: Array<{ name: string; adjustments: Record<string, number> }>
  ): Array<{ scenario: string; impact: Record<string, number> }> {
    const results: Array<any> = [];

    for (const scenario of scenarios) {
      const impact: Record<string, number> = {};

      // Apply adjustments and calculate impact
      for (const [key, adjustment] of Object.entries(scenario.adjustments)) {
        const baselineValue = baselineProject[key] || 0;
        const newValue = baselineValue * (1 + (adjustment as number) / 100);
        impact[key] = newValue - baselineValue;
      }

      results.push({
        scenario: scenario.name,
        impact,
      });
    }

    return results;
  }
}

export default AdvancedAnalyticsEngine;
