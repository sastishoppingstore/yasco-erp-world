import { sql } from 'drizzle-orm';
import { db } from '../lib/db';
import { 
  constructionProjects,
  projectSchedules,
  projectBudget,
  constructionMaterials,
  constructionEquipment,
  constructionHSE,
  constructionQuality
} from '../../db/schema-construction-new';

export interface ProjectKPI {
  projectId: string;
  projectName: string;
  schedulePerformance: number; // Schedule Variance
  costPerformance: number; // Cost Variance
  progressPercentage: number;
  budgetedCost: number;
  actualCost: number;
  earmarkedValue: number;
  statusHealth: 'green' | 'yellow' | 'red';
  hseIncidents: number;
  qualityIssues: number;
  riskScore: number;
}

export interface PortfolioMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onScheduleProjects: number;
  withinBudgetProjects: number;
  overBudgetProjects: number;
  atRiskProjects: number;
  totalBudget: number;
  totalSpent: number;
  portfolioHealth: 'green' | 'yellow' | 'red';
  averageProgress: number;
  totalHSEIncidents: number;
  totalQualityIssues: number;
}

export interface TimeSeriesMetric {
  date: Date;
  value: number;
  projectId?: string;
  category?: string;
}

export class AnalyticsEngine {
  /**
   * Calculate KPIs for a single project
   */
  static async calculateProjectKPI(projectId: string): Promise<ProjectKPI> {
    const [project] = await db
      .select()
      .from(constructionProjects)
      .where(sql`${constructionProjects.id} = ${projectId}`)
      .limit(1);

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const [schedule] = await db
      .select({
        plannedStartDate: projectSchedules.plannedStartDate,
        plannedEndDate: projectSchedules.plannedEndDate,
        actualStartDate: projectSchedules.actualStartDate,
        actualEndDate: projectSchedules.actualEndDate,
        progressPercentage: projectSchedules.progressPercentage,
      })
      .from(projectSchedules)
      .where(sql`${projectSchedules.projectId} = ${projectId}`)
      .limit(1);

    const [budget] = await db
      .select({
        budgetedCost: projectBudget.budgetedCost,
        actualCost: projectBudget.actualCost,
        earmarkedValue: projectBudget.earmarkedValue,
      })
      .from(projectBudget)
      .where(sql`${projectBudget.projectId} = ${projectId}`)
      .limit(1);

    const hseCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(constructionHSE)
      .where(sql`${constructionHSE.projectId} = ${projectId} AND ${constructionHSE.status} != 'closed'`);

    const qualityCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(constructionQuality)
      .where(sql`${constructionQuality.projectId} = ${projectId} AND ${constructionQuality.status} != 'resolved'`);

    // Calculate Schedule Performance Index (SPI)
    const schedulePerformance = this.calculateSPI(schedule);
    
    // Calculate Cost Performance Index (CPI)
    const costPerformance = this.calculateCPI(budget);

    // Calculate risk score
    const riskScore = this.calculateRiskScore({
      schedulePerformance,
      costPerformance,
      hseIncidents: hseCount[0]?.count || 0,
      qualityIssues: qualityCount[0]?.count || 0,
    });

    // Determine health status
    const statusHealth = this.determineHealthStatus(schedulePerformance, costPerformance, riskScore);

    return {
      projectId,
      projectName: project.projectName,
      schedulePerformance,
      costPerformance,
      progressPercentage: schedule?.progressPercentage || 0,
      budgetedCost: budget?.budgetedCost || 0,
      actualCost: budget?.actualCost || 0,
      earmarkedValue: budget?.earmarkedValue || 0,
      statusHealth,
      hseIncidents: hseCount[0]?.count || 0,
      qualityIssues: qualityCount[0]?.count || 0,
      riskScore,
    };
  }

  /**
   * Calculate portfolio metrics for all projects
   */
  static async calculatePortfolioMetrics(): Promise<PortfolioMetrics> {
    const projects = await db
      .select({
        id: constructionProjects.id,
        status: constructionProjects.status,
      })
      .from(constructionProjects);

    const projectKPIs = await Promise.all(
      projects.map((p) => this.calculateProjectKPI(p.id).catch(() => null))
    );

    const validKPIs = projectKPIs.filter(Boolean) as ProjectKPI[];

    const budgetData = await db
      .select({
        totalBudgeted: sql`SUM(${projectBudget.budgetedCost})`,
        totalActual: sql`SUM(${projectBudget.actualCost})`,
      })
      .from(projectBudget);

    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const onScheduleProjects = validKPIs.filter((k) => k.schedulePerformance >= 0.95).length;
    const withinBudgetProjects = validKPIs.filter((k) => k.costPerformance >= 0.95).length;
    const overBudgetProjects = validKPIs.filter((k) => k.costPerformance < 0.95).length;
    const atRiskProjects = validKPIs.filter((k) => k.riskScore >= 70).length;

    const totalHSEIncidents = validKPIs.reduce((sum, k) => sum + k.hseIncidents, 0);
    const totalQualityIssues = validKPIs.reduce((sum, k) => sum + k.qualityIssues, 0);

    const averageProgress =
      validKPIs.length > 0
        ? validKPIs.reduce((sum, k) => sum + k.progressPercentage, 0) / validKPIs.length
        : 0;

    const totalBudget = Number(budgetData[0]?.totalBudgeted) || 0;
    const totalSpent = Number(budgetData[0]?.totalActual) || 0;

    // Determine portfolio health
    const portfolioHealth =
      atRiskProjects / Math.max(projects.length, 1) > 0.3
        ? 'red'
        : atRiskProjects / Math.max(projects.length, 1) > 0.15
          ? 'yellow'
          : 'green';

    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      onScheduleProjects,
      withinBudgetProjects,
      overBudgetProjects,
      atRiskProjects,
      totalBudget,
      totalSpent,
      portfolioHealth,
      averageProgress,
      totalHSEIncidents,
      totalQualityIssues,
    };
  }

  /**
   * Get time series data for trend analysis
   */
  static async getTimeSeriesMetrics(
    projectId: string,
    startDate: Date,
    endDate: Date,
    metric: 'progress' | 'cost' | 'schedule'
  ): Promise<TimeSeriesMetric[]> {
    const query = sql`
      SELECT 
        DATE(created_at) as date,
        CASE 
          WHEN ${metric} = 'progress' THEN progress_percentage
          WHEN ${metric} = 'cost' THEN actual_cost
          WHEN ${metric} = 'schedule' THEN schedule_variance
        END as value,
        ${projectId} as project_id
      FROM project_schedules
      WHERE project_id = ${projectId}
        AND created_at BETWEEN ${startDate} AND ${endDate}
      ORDER BY created_at ASC
    `;

    const results = await db.execute(query);
    return results as TimeSeriesMetric[];
  }

  /**
   * Calculate Schedule Performance Index
   */
  private static calculateSPI(schedule: any): number {
    if (!schedule) return 1;
    
    const planned = schedule.plannedEndDate.getTime() - schedule.plannedStartDate.getTime();
    const actual = Math.min(
      new Date().getTime(),
      schedule.actualEndDate?.getTime() || new Date().getTime()
    ) - (schedule.actualStartDate?.getTime() || schedule.plannedStartDate.getTime());

    return planned > 0 ? (actual / planned) * (schedule.progressPercentage / 100) : 1;
  }

  /**
   * Calculate Cost Performance Index
   */
  private static calculateCPI(budget: any): number {
    if (!budget || budget.budgetedCost === 0) return 1;
    
    const earnedValue = (budget.actualCost / budget.budgetedCost) * budget.budgetedCost;
    return budget.budgetedCost > 0 ? earnedValue / budget.budgetedCost : 1;
  }

  /**
   * Calculate overall risk score
   */
  private static calculateRiskScore(factors: {
    schedulePerformance: number;
    costPerformance: number;
    hseIncidents: number;
    qualityIssues: number;
  }): number {
    const scheduleRisk = Math.max(0, (1 - factors.schedulePerformance) * 40);
    const costRisk = Math.max(0, (1 - factors.costPerformance) * 30);
    const hseRisk = Math.min(factors.hseIncidents * 5, 20);
    const qualityRisk = Math.min(factors.qualityIssues * 3, 10);

    return Math.min(100, scheduleRisk + costRisk + hseRisk + qualityRisk);
  }

  /**
   * Determine health status based on metrics
   */
  private static determineHealthStatus(
    schedulePerformance: number,
    costPerformance: number,
    riskScore: number
  ): 'green' | 'yellow' | 'red' {
    if (riskScore >= 70 || schedulePerformance < 0.9 || costPerformance < 0.9) {
      return 'red';
    }
    if (riskScore >= 40 || schedulePerformance < 0.95 || costPerformance < 0.95) {
      return 'yellow';
    }
    return 'green';
  }
}
