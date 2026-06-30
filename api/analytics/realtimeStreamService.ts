import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { AnalyticsEngine, ProjectKPI, PortfolioMetrics } from './metricsEngine';

export interface RealtimeUpdate {
  type: 'kpi-update' | 'portfolio-update' | 'incident-alert' | 'quality-alert' | 'schedule-alert';
  projectId?: string;
  timestamp: Date;
  data: any;
  severity?: 'info' | 'warning' | 'critical';
}

export interface StreamSubscription {
  id: string;
  filters: {
    projectIds?: string[];
    types?: RealtimeUpdate['type'][];
    minSeverity?: 'info' | 'warning' | 'critical';
  };
  callback: (update: RealtimeUpdate) => void;
}

export class RealtimeStreamService extends EventEmitter {
  private redis: Redis;
  private subscriptions: Map<string, StreamSubscription> = new Map();
  private projectKPICache: Map<string, ProjectKPI> = new Map();
  private portfolioMetricsCache: PortfolioMetrics | null = null;
  private updateInterval: NodeJS.Timer | null = null;

  constructor(redisUrl?: string) {
    super();
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.redis.on('message', (channel, message) => {
      this.handleRedisMessage(channel, message);
    });
  }

  /**
   * Start streaming updates at specified interval
   */
  startStreaming(intervalMs: number = 5000) {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(async () => {
      try {
        await this.updateProjectKPIs();
        await this.updatePortfolioMetrics();
      } catch (error) {
        console.error('Stream update error:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop streaming updates
   */
  stopStreaming() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(
    filters: StreamSubscription['filters'],
    callback: StreamSubscription['callback']
  ): string {
    const subscriptionId = `sub-${Date.now()}-${Math.random()}`;
    
    const subscription: StreamSubscription = {
      id: subscriptionId,
      filters,
      callback,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Subscribe to Redis channels based on filters
    if (!filters.projectIds || filters.projectIds.length === 0) {
      this.redis.subscribe('construction:*:updates');
    } else {
      filters.projectIds.forEach((projectId) => {
        this.redis.subscribe(`construction:${projectId}:updates`);
      });
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string) {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Update project KPIs and broadcast changes
   */
  private async updateProjectKPIs() {
    const projects = await this.getActiveProjects();

    for (const projectId of projects) {
      try {
        const kpi = await AnalyticsEngine.calculateProjectKPI(projectId);
        const previousKPI = this.projectKPICache.get(projectId);

        // Check for significant changes
        if (previousKPI && this.hasSignificantChange(previousKPI, kpi)) {
          this.broadcastUpdate({
            type: 'kpi-update',
            projectId,
            timestamp: new Date(),
            data: kpi,
            severity: this.getSeverity(kpi),
          });
        }

        this.projectKPICache.set(projectId, kpi);

        // Cache in Redis for 30 seconds
        await this.redis.setex(
          `kpi:${projectId}`,
          30,
          JSON.stringify(kpi)
        );
      } catch (error) {
        console.error(`Error updating KPI for project ${projectId}:`, error);
      }
    }
  }

  /**
   * Update portfolio metrics and broadcast changes
   */
  private async updatePortfolioMetrics() {
    try {
      const metrics = await AnalyticsEngine.calculatePortfolioMetrics();
      const previousMetrics = this.portfolioMetricsCache;

      if (previousMetrics && this.hasPortfolioChange(previousMetrics, metrics)) {
        this.broadcastUpdate({
          type: 'portfolio-update',
          timestamp: new Date(),
          data: metrics,
          severity: metrics.portfolioHealth === 'red' ? 'critical' : 
                   metrics.portfolioHealth === 'yellow' ? 'warning' : 'info',
        });
      }

      this.portfolioMetricsCache = metrics;

      // Cache in Redis for 30 seconds
      await this.redis.setex(
        'portfolio:metrics',
        30,
        JSON.stringify(metrics)
      );
    } catch (error) {
      console.error('Error updating portfolio metrics:', error);
    }
  }

  /**
   * Broadcast update to all matching subscriptions
   */
  private broadcastUpdate(update: RealtimeUpdate) {
    for (const subscription of this.subscriptions.values()) {
      if (this.matchesFilters(update, subscription.filters)) {
        subscription.callback(update);
      }
    }

    // Also emit as event
    this.emit('update', update);
  }

  /**
   * Handle incoming Redis messages
   */
  private handleRedisMessage(channel: string, message: string) {
    try {
      const update = JSON.parse(message) as RealtimeUpdate;
      this.broadcastUpdate(update);
    } catch (error) {
      console.error('Error parsing Redis message:', error);
    }
  }

  /**
   * Check if subscription filters match the update
   */
  private matchesFilters(update: RealtimeUpdate, filters: StreamSubscription['filters']): boolean {
    // Check project filter
    if (filters.projectIds && update.projectId && !filters.projectIds.includes(update.projectId)) {
      return false;
    }

    // Check type filter
    if (filters.types && !filters.types.includes(update.type)) {
      return false;
    }

    // Check severity filter
    if (filters.minSeverity && update.severity) {
      const severityOrder = { 'info': 0, 'warning': 1, 'critical': 2 };
      if (severityOrder[update.severity] < severityOrder[filters.minSeverity]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if KPI has changed significantly
   */
  private hasSignificantChange(prev: ProjectKPI, curr: ProjectKPI): boolean {
    return (
      Math.abs(prev.schedulePerformance - curr.schedulePerformance) > 0.05 ||
      Math.abs(prev.costPerformance - curr.costPerformance) > 0.05 ||
      Math.abs(prev.progressPercentage - curr.progressPercentage) > 5 ||
      prev.statusHealth !== curr.statusHealth ||
      prev.riskScore !== curr.riskScore
    );
  }

  /**
   * Check if portfolio metrics have changed
   */
  private hasPortfolioChange(prev: PortfolioMetrics, curr: PortfolioMetrics): boolean {
    return (
      prev.portfolioHealth !== curr.portfolioHealth ||
      prev.atRiskProjects !== curr.atRiskProjects ||
      Math.abs(prev.averageProgress - curr.averageProgress) > 5
    );
  }

  /**
   * Get severity level based on KPI
   */
  private getSeverity(kpi: ProjectKPI): RealtimeUpdate['severity'] {
    if (kpi.statusHealth === 'red') return 'critical';
    if (kpi.statusHealth === 'yellow') return 'warning';
    return 'info';
  }

  /**
   * Get list of active projects
   */
  private async getActiveProjects(): Promise<string[]> {
    // This will be implemented based on actual database queries
    // For now, return cached KPI keys
    return Array.from(this.projectKPICache.keys());
  }

  /**
   * Publish custom event to Redis
   */
  async publishEvent(update: RealtimeUpdate) {
    const channel = update.projectId
      ? `construction:${update.projectId}:updates`
      : 'construction:portfolio:updates';

    await this.redis.publish(channel, JSON.stringify(update));
  }

  /**
   * Get cached KPI for a project
   */
  getCachedKPI(projectId: string): ProjectKPI | undefined {
    return this.projectKPICache.get(projectId);
  }

  /**
   * Get cached portfolio metrics
   */
  getCachedPortfolioMetrics(): PortfolioMetrics | null {
    return this.portfolioMetricsCache;
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    this.projectKPICache.clear();
    this.portfolioMetricsCache = null;
    await this.redis.flushdb();
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect() {
    this.stopStreaming();
    this.redis.disconnect();
  }
}
