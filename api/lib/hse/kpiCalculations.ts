/**
 * HSE KPI Calculation Engine
 * Implements TRIFR, LTIFR, SFR and other construction safety metrics
 */

export interface IncidentData {
  incidentId: number;
  incidentDate: Date;
  incidentType: 'fatal' | 'ltie' | 'minor' | 'near_miss' | 'medical_treatment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  hoursWorked?: number;
  workersAffected?: number;
  daysLost?: number;
  bodyPart?: string;
  description: string;
  reportedBy: number;
  investigatedBy?: number;
  rootCause?: string;
  correctionActions?: string[];
}

export interface SafetyAudit {
  auditId: number;
  auditDate: Date;
  auditType: 'internal' | 'external' | 'regulatory';
  findings: number;
  criticalFindings: number;
  complianceRate: number;
  auditedBy: number;
}

export interface SafetyTrainingRecord {
  trainingId: number;
  employeeId: number;
  trainingType: string;
  completionDate: Date;
  expiryDate?: Date;
  certificationNumber?: string;
}

export interface HSEKPICalculationResult {
  period: {
    startDate: Date;
    endDate: Date;
    daysInPeriod: number;
  };
  
  // Main KPIs
  trifr: number; // Total Recordable Incident Frequency Rate
  ltifr: number; // Lost Time Incident Frequency Rate
  sfr: number;   // Severity Frequency Rate
  
  // Supporting Metrics
  recordableIncidents: number;
  lostTimeIncidents: number;
  fatalIncidents: number;
  totalWorkersCount: number;
  totalManHours: number;
  totalDaysLost: number;
  totalAuditFindings: number;
  trainingComplianceRate: number;
  
  // Trend Analysis
  trend: 'improving' | 'stable' | 'deteriorating';
  trendValue: number; // Percentage change
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

/**
 * Calculate TRIFR (Total Recordable Incident Frequency Rate)
 * Formula: (Number of Recordable Incidents / Total Man Hours Worked) x 200,000
 * 200,000 represents 100 employees working 50 weeks per year, 40 hours per week
 */
export function calculateTRIFR(
  recordableIncidents: number,
  totalManHours: number
): number {
  if (totalManHours === 0) return 0;
  return (recordableIncidents / totalManHours) * 200000;
}

/**
 * Calculate LTIFR (Lost Time Incident Frequency Rate)
 * Formula: (Number of Lost Time Incidents / Total Man Hours Worked) x 200,000
 */
export function calculateLTIFR(
  lostTimeIncidents: number,
  totalManHours: number
): number {
  if (totalManHours === 0) return 0;
  return (lostTimeIncidents / totalManHours) * 200000;
}

/**
 * Calculate SFR (Severity Frequency Rate)
 * Formula: (Total Days Lost / Total Man Hours Worked) x 200,000
 */
export function calculateSFR(
  totalDaysLost: number,
  totalManHours: number
): number {
  if (totalManHours === 0) return 0;
  return (totalDaysLost / totalManHours) * 200000;
}

/**
 * Calculate AIFR (All Injury Frequency Rate)
 * Includes all injuries requiring treatment
 */
export function calculateAIFR(
  allInjuries: number,
  totalManHours: number
): number {
  if (totalManHours === 0) return 0;
  return (allInjuries / totalManHours) * 200000;
}

/**
 * Calculate ASR (Average Severity Rate)
 * Days lost per injury
 */
export function calculateASR(
  totalDaysLost: number,
  recordableIncidents: number
): number {
  if (recordableIncidents === 0) return 0;
  return totalDaysLost / recordableIncidents;
}

/**
 * Classify incident severity
 */
export function classifyIncidentSeverity(
  incidentType: IncidentData['incidentType'],
  daysLost: number,
  workersAffected: number
): 'critical' | 'high' | 'medium' | 'low' {
  if (incidentType === 'fatal') return 'critical';
  if (incidentType === 'ltie' && daysLost > 30) return 'critical';
  if (incidentType === 'ltie' && daysLost > 10) return 'high';
  if (incidentType === 'ltie') return 'medium';
  if (incidentType === 'medical_treatment') return 'medium';
  if (incidentType === 'minor') return 'low';
  return 'low';
}

/**
 * Analyze incident trends
 */
export function analyzeIncidentTrend(
  currentPeriodIncidents: IncidentData[],
  previousPeriodIncidents: IncidentData[],
  currentManHours: number,
  previousManHours: number
): {
  trend: 'improving' | 'stable' | 'deteriorating';
  percentageChange: number;
  currentKPI: number;
  previousKPI: number;
} {
  const currentTRIFR = calculateTRIFR(currentPeriodIncidents.length, currentManHours);
  const previousTRIFR = calculateTRIFR(previousPeriodIncidents.length, previousManHours);
  
  const percentageChange = previousTRIFR === 0 
    ? 0 
    : ((currentTRIFR - previousTRIFR) / previousTRIFR) * 100;
  
  let trend: 'improving' | 'stable' | 'deteriorating' = 'stable';
  if (percentageChange < -5) trend = 'improving';
  if (percentageChange > 5) trend = 'deteriorating';
  
  return {
    trend,
    percentageChange,
    currentKPI: currentTRIFR,
    previousKPI: previousTRIFR,
  };
}

/**
 * Determine overall risk level
 */
export function determineRiskLevel(
  trifr: number,
  ltifr: number,
  fatalIncidents: number,
  auditComplianceRate: number
): 'low' | 'medium' | 'high' | 'critical' {
  // Industry benchmarks for construction (per 200,000 hours)
  // Excellent: TRIFR < 5, Good: 5-10, Fair: 10-20, Poor: > 20
  
  if (fatalIncidents > 0) return 'critical';
  if (trifr > 25 || auditComplianceRate < 50) return 'critical';
  if (trifr > 15 || auditComplianceRate < 70) return 'high';
  if (trifr > 10 || auditComplianceRate < 85) return 'medium';
  return 'low';
}

/**
 * Generate risk mitigation recommendations
 */
export function generateRecommendations(
  riskLevel: string,
  trifr: number,
  auditFindings: SafetyAudit[],
  incidentTypes: Map<string, number>
): string[] {
  const recommendations: string[] = [];
  
  if (riskLevel === 'critical') {
    recommendations.push('URGENT: Implement immediate safety stop measures on all sites');
    recommendations.push('URGENT: Conduct full HSE audit and compliance review');
    recommendations.push('URGENT: Escalate to management and regulatory authorities');
  }
  
  if (trifr > 10) {
    recommendations.push('Increase safety training frequency and frequency');
    recommendations.push('Implement additional PPE requirements');
    recommendations.push('Enhance incident investigation processes');
  }
  
  // Analyze incident patterns
  const ltieCount = incidentTypes.get('ltie') || 0;
  if (ltieCount > 0) {
    recommendations.push('Review ergonomic hazards and work procedures');
    recommendations.push('Implement targeted prevention programs for high-risk tasks');
  }
  
  const nearMissCount = incidentTypes.get('near_miss') || 0;
  if (nearMissCount > 0) {
    recommendations.push('Strengthen near-miss reporting and investigation culture');
    recommendations.push('Use near-miss data to predict and prevent actual incidents');
  }
  
  // Audit findings
  const criticalFindings = auditFindings.filter(a => a.criticalFindings > 0);
  if (criticalFindings.length > 0) {
    recommendations.push(`Address ${criticalFindings.length} critical audit findings immediately`);
    recommendations.push('Assign ownership and deadlines for corrective actions');
  }
  
  recommendations.push('Conduct monthly safety committee meetings');
  recommendations.push('Provide monthly HSE briefings to all workers');
  
  return recommendations;
}

/**
 * Calculate comprehensive HSE KPI dashboard data
 */
export function calculateHSEKPIs(
  currentIncidents: IncidentData[],
  previousIncidents: IncidentData[],
  totalWorkers: number,
  currentManHours: number,
  previousManHours: number,
  auditHistory: SafetyAudit[],
  trainingRecords: SafetyTrainingRecord[],
  periodStart: Date,
  periodEnd: Date
): HSEKPICalculationResult {
  
  // Categorize incidents
  const recordableIncidents = currentIncidents.filter(i => 
    ['fatal', 'ltie', 'medical_treatment'].includes(i.incidentType)
  ).length;
  
  const lostTimeIncidents = currentIncidents.filter(i => 
    i.incidentType === 'ltie'
  ).length;
  
  const fatalIncidents = currentIncidents.filter(i => 
    i.incidentType === 'fatal'
  ).length;
  
  const totalDaysLost = currentIncidents.reduce((sum, i) => 
    sum + (i.daysLost || 0), 0
  );
  
  // Calculate KPIs
  const trifr = calculateTRIFR(recordableIncidents, currentManHours);
  const ltifr = calculateLTIFR(lostTimeIncidents, currentManHours);
  const sfr = calculateSFR(totalDaysLost, currentManHours);
  
  // Analyze trends
  const trendAnalysis = analyzeIncidentTrend(
    currentIncidents,
    previousIncidents,
    currentManHours,
    previousManHours
  );
  
  // Calculate training compliance
  const today = new Date();
  const currentValidTraining = trainingRecords.filter(t => 
    !t.expiryDate || new Date(t.expiryDate) > today
  ).length;
  const trainingComplianceRate = trainingRecords.length > 0 
    ? (currentValidTraining / trainingRecords.length) * 100 
    : 0;
  
  // Calculate audit compliance
  const recentAudits = auditHistory.filter(a => 
    new Date(a.auditDate) > new Date(periodStart)
  );
  
  const totalAuditFindings = recentAudits.reduce((sum, a) => 
    sum + a.findings, 0
  );
  
  const avgComplianceRate = recentAudits.length > 0
    ? recentAudits.reduce((sum, a) => sum + a.complianceRate, 0) / recentAudits.length
    : 100;
  
  // Determine risk level
  const riskLevel = determineRiskLevel(trifr, ltifr, fatalIncidents, avgComplianceRate);
  
  // Generate recommendations
  const incidentTypes = new Map<string, number>();
  currentIncidents.forEach(i => {
    incidentTypes.set(i.incidentType, (incidentTypes.get(i.incidentType) || 0) + 1);
  });
  
  const recommendations = generateRecommendations(
    riskLevel,
    trifr,
    recentAudits,
    incidentTypes
  );
  
  // Calculate days in period
  const daysInPeriod = Math.floor(
    (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    period: {
      startDate: periodStart,
      endDate: periodEnd,
      daysInPeriod,
    },
    trifr,
    ltifr,
    sfr,
    recordableIncidents,
    lostTimeIncidents,
    fatalIncidents,
    totalWorkersCount: totalWorkers,
    totalManHours: currentManHours,
    totalDaysLost,
    totalAuditFindings,
    trainingComplianceRate,
    trend: trendAnalysis.trend,
    trendValue: trendAnalysis.percentageChange,
    riskLevel,
    recommendations,
  };
}

/**
 * Calculate per-site HSE metrics
 */
export function calculateSiteMetrics(
  siteIncidents: IncidentData[],
  siteWorkers: number,
  siteManHours: number
): {
  siteTRIFR: number;
  siteLTIFR: number;
  siteSFR: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  const recordable = siteIncidents.filter(i => 
    ['fatal', 'ltie', 'medical_treatment'].includes(i.incidentType)
  ).length;
  
  const lostTime = siteIncidents.filter(i => 
    i.incidentType === 'ltie'
  ).length;
  
  const daysLost = siteIncidents.reduce((sum, i) => 
    sum + (i.daysLost || 0), 0
  );
  
  const siteTRIFR = calculateTRIFR(recordable, siteManHours);
  const siteLTIFR = calculateLTIFR(lostTime, siteManHours);
  const siteSFR = calculateSFR(daysLost, siteManHours);
  
  const riskLevel = determineRiskLevel(siteTRIFR, siteLTIFR, 
    siteIncidents.filter(i => i.incidentType === 'fatal').length, 80
  );
  
  return {
    siteTRIFR,
    siteLTIFR,
    siteSFR,
    riskLevel,
  };
}
