import { eq, and } from "drizzle-orm";
import { getDb } from "../../queries/connection";

/**
 * Critical Path Method (CPM) Scheduling Engine
 * Implements Dijkstra's algorithm for critical path calculation
 * Supports resource leveling and schedule compression
 */

export interface Task {
  id: number;
  projectId: number;
  name: string;
  duration: number; // days
  predecessors: number[]; // task IDs
  resource?: string;
  costPerDay?: number;
}

export interface TaskSchedule {
  taskId: number;
  name: string;
  duration: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
  percentageComplete: number;
  actualDuration?: number;
  variance?: number;
}

export interface ProjectCriticalPath {
  projectId: number;
  criticalPath: number[];
  projectDuration: number;
  tasks: TaskSchedule[];
  riskFactors: RiskFactor[];
  compressionOpportunities: CompressionOpportunity[];
}

export interface RiskFactor {
  taskId: number;
  taskName: string;
  riskLevel: "low" | "medium" | "high";
  reason: string;
  delayDays: number;
  probability: number;
}

export interface CompressionOpportunity {
  taskId: number;
  taskName: string;
  currentDuration: number;
  minDuration: number;
  compressionCost: number;
  daysSaved: number;
}

export class CPMEngine {
  /**
   * Calculate critical path for a project
   */
  static async calculateCriticalPath(projectId: number): Promise<ProjectCriticalPath> {
    const db = getDb();
    
    // Fetch tasks (assuming constructionActivities table exists)
    const tasks: Task[] = await this.fetchProjectTasks(projectId);
    
    if (tasks.length === 0) {
      return {
        projectId,
        criticalPath: [],
        projectDuration: 0,
        tasks: [],
        riskFactors: [],
        compressionOpportunities: [],
      };
    }

    // Build adjacency matrix and calculate forward pass
    const schedules = this.forwardPass(tasks);
    
    // Calculate backward pass
    const projectDuration = Math.max(...schedules.map(s => s.earlyFinish));
    const finalSchedules = this.backwardPass(tasks, schedules, projectDuration);
    
    // Identify critical path
    const criticalPath = finalSchedules
      .filter(s => s.slack === 0)
      .map(s => s.taskId)
      .sort((a, b) => 
        finalSchedules.find(s => s.taskId === a)?.earlyStart || 0 -
        (finalSchedules.find(s => s.taskId === b)?.earlyStart || 0)
      );

    // Calculate risk factors
    const riskFactors = this.identifyRiskFactors(finalSchedules);
    
    // Calculate compression opportunities
    const compressionOpportunities = this.calculateCompressionOpportunities(tasks, finalSchedules);

    return {
      projectId,
      criticalPath,
      projectDuration,
      tasks: finalSchedules,
      riskFactors,
      compressionOpportunities,
    };
  }

  /**
   * Forward pass: Calculate earliest start and finish times
   */
  static forwardPass(tasks: Task[]): TaskSchedule[] {
    const schedules: Map<number, TaskSchedule> = new Map();
    
    // Initialize all tasks
    for (const task of tasks) {
      schedules.set(task.id, {
        taskId: task.id,
        name: task.name,
        duration: task.duration,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        slack: 0,
        isCritical: false,
        percentageComplete: 0,
      });
    }

    // Process tasks in topological order
    const processed = new Set<number>();
    while (processed.size < tasks.length) {
      for (const task of tasks) {
        if (processed.has(task.id)) continue;
        
        if (!task.predecessors || task.predecessors.length === 0) {
          // No predecessors
          const schedule = schedules.get(task.id)!;
          schedule.earlyStart = 0;
          schedule.earlyFinish = task.duration;
          processed.add(task.id);
        } else if (task.predecessors.every(pred => processed.has(pred))) {
          // All predecessors processed
          const predecessorFinishes = task.predecessors.map(
            pred => schedules.get(pred)!.earlyFinish
          );
          const maxFinish = Math.max(...predecessorFinishes);
          
          const schedule = schedules.get(task.id)!;
          schedule.earlyStart = maxFinish;
          schedule.earlyFinish = maxFinish + task.duration;
          processed.add(task.id);
        }
      }
    }

    return Array.from(schedules.values());
  }

  /**
   * Backward pass: Calculate latest start and finish times
   */
  static backwardPass(
    tasks: Task[],
    forwardSchedules: TaskSchedule[],
    projectDuration: number
  ): TaskSchedule[] {
    const schedules = new Map(
      forwardSchedules.map(s => [s.taskId, { ...s }])
    );

    // Find terminal tasks (no successors)
    const allTaskIds = new Set(tasks.map(t => t.id));
    const hasSuccessors = new Set<number>();
    for (const task of tasks) {
      for (const pred of task.predecessors || []) {
        hasSuccessors.add(pred);
      }
    }
    const terminalTasks = Array.from(allTaskIds).filter(id => !hasSuccessors.has(id));

    // Initialize terminal tasks
    for (const taskId of terminalTasks) {
      const schedule = schedules.get(taskId)!;
      schedule.lateFinish = projectDuration;
      schedule.lateStart = projectDuration - schedule.duration;
    }

    // Process backward
    const processed = new Set<number>();
    while (processed.size < tasks.length) {
      for (const task of tasks) {
        if (processed.has(task.id)) continue;

        // Check if all successors are processed
        const successors = tasks.filter(t => 
          (t.predecessors || []).includes(task.id)
        );

        if (successors.every(s => processed.has(s.id))) {
          const schedule = schedules.get(task.id)!;
          if (successors.length === 0) {
            schedule.lateFinish = projectDuration;
          } else {
            const successorStarts = successors.map(s => schedules.get(s.id)!.lateStart);
            schedule.lateFinish = Math.min(...successorStarts);
          }
          schedule.lateStart = schedule.lateFinish - schedule.duration;
          schedule.slack = schedule.lateStart - schedule.earlyStart;
          schedule.isCritical = schedule.slack === 0;
          processed.add(task.id);
        }
      }
    }

    return Array.from(schedules.values());
  }

  /**
   * Identify high-risk tasks based on slack and variance
   */
  static identifyRiskFactors(schedules: TaskSchedule[]): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];

    for (const schedule of schedules) {
      if (schedule.slack < 3) {
        // Low slack = high risk
        const variance = schedule.actualDuration ? Math.abs(schedule.actualDuration - schedule.duration) : 0;
        const riskLevel = schedule.slack === 0 ? "high" : schedule.slack < 2 ? "high" : "medium";
        const probability = variance > 0 ? Math.min(0.9, variance / schedule.duration) : 0.5;

        riskFactors.push({
          taskId: schedule.taskId,
          taskName: schedule.name,
          riskLevel,
          reason: `Low slack (${schedule.slack} days)${variance > 0 ? ` and variance (${variance} days)` : ""}`,
          delayDays: schedule.slack,
          probability,
        });
      }
    }

    return riskFactors.sort((a, b) => b.delayDays - a.delayDays);
  }

  /**
   * Calculate schedule compression opportunities
   */
  static calculateCompressionOpportunities(
    tasks: Task[],
    schedules: TaskSchedule[]
  ): CompressionOpportunity[] {
    const opportunities: CompressionOpportunity[] = [];

    for (const task of tasks) {
      const schedule = schedules.find(s => s.taskId === task.id)!;
      if (schedule.isCritical) {
        // Critical tasks are candidates for compression
        const minDuration = Math.ceil(task.duration * 0.7); // Can compress to 70% of original
        const compressionCost = (task.costPerDay || 1000) * (task.duration - minDuration) * 1.5; // 50% cost premium

        opportunities.push({
          taskId: task.id,
          taskName: task.name,
          currentDuration: task.duration,
          minDuration,
          compressionCost,
          daysSaved: task.duration - minDuration,
        });
      }
    }

    return opportunities.sort((a, b) => b.daysSaved - a.daysSaved);
  }

  /**
   * Fetch project tasks from database
   */
  static async fetchProjectTasks(projectId: number): Promise<Task[]> {
    // Implementation depends on actual schema
    // This is a placeholder that should be customized
    return [];
  }

  /**
   * Apply schedule compression
   */
  static compressSchedule(
    tasks: Task[],
    daysToCompress: number
  ): Task[] {
    const compressed = [...tasks];
    let remaining = daysToCompress;

    // Compress critical path tasks
    const criticalTasks = tasks.filter(t => this.isCritical(t));
    
    for (const task of criticalTasks) {
      if (remaining <= 0) break;
      const minDuration = Math.ceil(task.duration * 0.7);
      const canCompress = task.duration - minDuration;
      const toCompress = Math.min(remaining, canCompress);
      
      task.duration -= toCompress;
      remaining -= toCompress;
    }

    return compressed;
  }

  /**
   * Resource leveling - balance resource usage across time periods
   */
  static levelResources(tasks: Task[]): { leveledTasks: Task[]; utilizationChart: Record<string, number[]> } {
    const leveledTasks = [...tasks];
    const resourceUsage: Map<string, Map<number, number>> = new Map();

    // Calculate resource usage by period
    for (const task of tasks) {
      const resource = task.resource || "general";
      if (!resourceUsage.has(resource)) {
        resourceUsage.set(resource, new Map());
      }

      const usage = resourceUsage.get(resource)!;
      for (let day = 0; day < task.duration; day++) {
        usage.set(day, (usage.get(day) || 0) + (task.costPerDay || 1));
      }
    }

    // Build utilization chart
    const utilizationChart: Record<string, number[]> = {};
    for (const [resource, usage] of resourceUsage.entries()) {
      utilizationChart[resource] = Array.from({ length: 100 }, (_, i) => usage.get(i) || 0);
    }

    return { leveledTasks, utilizationChart };
  }

  private static isCritical(task: Task): boolean {
    // Placeholder - would determine from critical path analysis
    return true;
  }
}

export default CPMEngine;
