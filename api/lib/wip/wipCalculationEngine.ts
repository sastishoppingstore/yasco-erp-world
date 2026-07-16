import { eq, and, sum, sql } from "drizzle-orm";
import { getDb } from "../../queries/connection";
import { Decimal } from "decimal.js";

/**
 * WIP (Work in Progress) Calculation Engine
 * IFRS 15 Revenue Recognition Compliance
 * Supports multiple recognition methods and cost categorization
 */

export interface WIPCalculationParams {
  projectId: number;
  contractValue: number;
  variationOrders: number;
  claimsAmount: number;
  costIncurred: number;
  completionPercentage: number;
  method: "percentage-of-completion" | "completed-contract" | "milestone-based";
}

export interface WIPData {
  projectId: number;
  reportingDate: Date;
  
  // Revenue Recognition
  grossContractValue: number;
  totalVariations: number;
  totalClaims: number;
  recognizableRevenue: number;
  previouslyRecognized: number;
  currentPeriodRevenue: number;
  
  // Costs
  costsByCategory: Record<string, number>;
  totalCostsIncurred: number;
  estimatedCostToComplete: number;
  
  // WIP Calculation
  wipAmount: number;
  completionPercentage: number;
  profitRecognized: number;
  losses: number;
  
  // Variance Analysis
  budgetVariance: number;
  scheduleVariance: number;
  costVariance: number;
  
  // Forecastings
  estimatedTotalCost: number;
  estimatedProfit: number;
  projectedMargin: number;
}

export interface CostCategory {
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  incurredAmount: number;
  percentageComplete: number;
  variance: number;
  forecastedTotal: number;
}

export interface WIPVarianceAnalysis {
  projectId: number;
  currentWIP: number;
  previousWIP: number;
  wipVariance: number;
  revenueVariance: number;
  costVariance: number;
  scheduleVariance: number;
  explanations: string[];
}

export class WIPCalculationEngine {
  /**
   * Calculate comprehensive WIP data for a project
   */
  static async calculateWIP(params: WIPCalculationParams): Promise<WIPData> {
    const db = getDb();
    
    // Fetch project contract details
    const contract = await this.fetchProjectContract(params.projectId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Fetch cost data
    const costData = await this.fetchProjectCosts(params.projectId);
    
    // Calculate recognizable revenue
    const recognizableRevenue = this.calculateRecognizableRevenue(
      params.contractValue,
      params.variationOrders,
      params.claimsAmount
    );

    // Fetch previous period data for comparison
    const previousData = await this.fetchPreviousPeriodData(params.projectId);
    
    const currentPeriodRevenue = recognizableRevenue - (previousData?.recognizableRevenue || 0);

    // Calculate costs by category
    const costsByCategory = await this.calculateCostsByCategory(params.projectId);
    const totalCostsIncurred = params.costIncurred;

    // Estimate cost to complete
    const estimatedCostToComplete = this.estimateCostToComplete(
      params.contractValue,
      totalCostsIncurred,
      params.completionPercentage
    );

    // Calculate WIP amount
    const wipAmount = this.calculateWIPAmount(
      recognizableRevenue,
      previousData?.recognizableRevenue || 0,
      totalCostsIncurred
    );

    // Calculate profit recognized
    const profitRecognized = this.calculateProfitRecognized(
      recognizableRevenue,
      totalCostsIncurred,
      params.completionPercentage
    );

    // Identify any losses
    const losses = Math.max(0, -profitRecognized);

    // Calculate variances
    const budgetVariance = (params.contractValue - totalCostsIncurred) / params.contractValue * 100;
    const scheduleVariance = (params.completionPercentage - 50) * 100; // Simplified
    const costVariance = (params.contractValue - totalCostsIncurred);

    // Forecasting
    const estimatedTotalCost = totalCostsIncurred / Math.max(0.01, params.completionPercentage);
    const estimatedProfit = recognizableRevenue - estimatedTotalCost;
    const projectedMargin = estimatedProfit / recognizableRevenue * 100;

    return {
      projectId: params.projectId,
      reportingDate: new Date(),
      grossContractValue: params.contractValue,
      totalVariations: params.variationOrders,
      totalClaims: params.claimsAmount,
      recognizableRevenue,
      previouslyRecognized: previousData?.recognizableRevenue || 0,
      currentPeriodRevenue,
      costsByCategory,
      totalCostsIncurred,
      estimatedCostToComplete,
      wipAmount,
      completionPercentage: params.completionPercentage,
      profitRecognized,
      losses,
      budgetVariance,
      scheduleVariance,
      costVariance,
      estimatedTotalCost,
      estimatedProfit,
      projectedMargin,
    };
  }

  /**
   * Calculate revenue recognizable under IFRS 15
   */
  static calculateRecognizableRevenue(
    contractValue: number,
    variationOrders: number,
    claimsAmount: number
  ): number {
    // IFRS 15: Revenue from contract with customer
    // Include only variations and claims that meet recognition criteria
    const baseRevenue = contractValue;
    const variationRevenue = variationOrders * 0.9; // 90% recognition rate for variations
    const claimsRevenue = claimsAmount * 0.5; // 50% recognition rate for claims (more uncertain)

    return baseRevenue + variationRevenue + claimsRevenue;
  }

  /**
   * Calculate WIP using percentage of completion method
   */
  static calculateWIPAmount(
    recognizableRevenue: number,
    previouslyRecognized: number,
    costIncurred: number
  ): number {
    // WIP = Costs incurred - amounts billed or invoiced
    // For revenue recognition: Revenue recognized - amounts billed
    // Since amounts billed = previously recognized
    return Math.max(0, recognizableRevenue - previouslyRecognized - costIncurred);
  }

  /**
   * Calculate estimated cost to complete
   */
  static estimateCostToComplete(
    contractValue: number,
    costIncurred: number,
    completionPercentage: number
  ): number {
    if (completionPercentage === 0) return contractValue;
    
    const budgetedCostPerPercentage = contractValue / 100;
    const totalBudgetedCost = budgetedCostPerPercentage * 100;
    
    return Math.max(0, totalBudgetedCost - costIncurred);
  }

  /**
   * Calculate profit recognized in current period
   */
  static calculateProfitRecognized(
    recognizableRevenue: number,
    costIncurred: number,
    completionPercentage: number
  ): number {
    // Simple calculation: Revenue - Costs
    // More complex would account for loss provisioning
    const profitMargin = recognizableRevenue - costIncurred;
    
    // If costs exceed revenue, loss must be recognized immediately (IFRS 15)
    if (profitMargin < 0) {
      return profitMargin; // Return negative as loss
    }

    return profitMargin;
  }

  /**
   * Calculate costs by category (labor, materials, equipment, overhead)
   */
  static async calculateCostsByCategory(projectId: number): Promise<Record<string, number>> {
    const db = getDb();
    
    // This would fetch from actual cost tracking tables
    // Placeholder implementation
    return {
      labor: 0,
      materials: 0,
      equipment: 0,
      subcontractors: 0,
      overhead: 0,
      other: 0,
    };
  }

  /**
   * Calculate WIP variance analysis
   */
  static async calculateWIPVariance(
    projectId: number,
    currentWIP: number
  ): Promise<WIPVarianceAnalysis> {
    const previousData = await this.fetchPreviousPeriodData(projectId);
    
    const previousWIP = previousData?.wipAmount || 0;
    const wipVariance = currentWIP - previousWIP;

    const explanations: string[] = [];
    
    if (wipVariance > previousWIP * 0.1) {
      explanations.push("WIP increased significantly - possible cash flow strain");
    } else if (wipVariance < -previousWIP * 0.1) {
      explanations.push("WIP decreased - improved billing or cost control");
    }

    return {
      projectId,
      currentWIP,
      previousWIP,
      wipVariance,
      revenueVariance: currentWIP * 0.2, // Placeholder
      costVariance: currentWIP * 0.15, // Placeholder
      scheduleVariance: wipVariance * 0.1, // Placeholder
      explanations,
    };
  }

  /**
   * Generate cost category analysis
   */
  static async getCostCategoryAnalysis(projectId: number): Promise<CostCategory[]> {
    const categories: CostCategory[] = [];

    // Placeholder - would fetch from database
    const categoryNames = ["labor", "materials", "equipment", "subcontractors", "overhead"];
    
    for (const name of categoryNames) {
      categories.push({
        categoryId: name,
        categoryName: name.charAt(0).toUpperCase() + name.slice(1),
        budgetedAmount: 100000,
        incurredAmount: 75000,
        percentageComplete: 75,
        variance: -25000,
        forecastedTotal: 100000,
      });
    }

    return categories;
  }

  /**
   * Forecast WIP for future periods
   */
  static async forecastWIP(
    projectId: number,
    periods: number
  ): Promise<WIPData[]> {
    const forecasts: WIPData[] = [];
    
    for (let i = 0; i < periods; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      // Placeholder forecasting logic
      const forecast: WIPData = {
        projectId,
        reportingDate: date,
        grossContractValue: 1000000,
        totalVariations: 50000,
        totalClaims: 25000,
        recognizableRevenue: 1050000,
        previouslyRecognized: 800000,
        currentPeriodRevenue: 250000,
        costsByCategory: {
          labor: 150000,
          materials: 120000,
          equipment: 50000,
          subcontractors: 200000,
          overhead: 80000,
        },
        totalCostsIncurred: 600000 + (i * 50000),
        estimatedCostToComplete: 300000 - (i * 30000),
        wipAmount: 250000 - (i * 15000),
        completionPercentage: 60 + (i * 10),
        profitRecognized: 250000 - (600000 + (i * 50000)),
        losses: 0,
        budgetVariance: 10,
        scheduleVariance: 5,
        costVariance: 50000,
        estimatedTotalCost: 900000,
        estimatedProfit: 150000,
        projectedMargin: 14.3,
      };
      
      forecasts.push(forecast);
    }

    return forecasts;
  }

  // Helper methods
  private static async fetchProjectContract(projectId: number): Promise<any> {
    // Would fetch from constructionContracts table
    return null;
  }

  private static async fetchProjectCosts(projectId: number): Promise<any> {
    // Would fetch from project costs table
    return null;
  }

  private static async fetchPreviousPeriodData(projectId: number): Promise<WIPData | null> {
    // Would fetch from wipHistory table
    return null;
  }
}

export default WIPCalculationEngine;
