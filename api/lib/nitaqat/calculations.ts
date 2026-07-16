/**
 * Nitaqat Compliance Calculation Engine
 * Implementation of Saudi Arabia's Nitaqat program for workforce localization
 * Targets various nationalities with different percentage requirements
 */

export type NitaqatLevel = 'platinum' | 'gold' | 'silver' | 'bronze' | 'red' | 'non-compliant';
export type WorkforceCategory = 'management' | 'technical' | 'administrative' | 'skilled_labor' | 'general_labor';

export interface NitaqatRequirements {
  category: WorkforceCategory;
  saudiPercentageMin: number;
  gccPercentageMin: number;
  expatRatioLimit: number;
}

// Nitaqat requirements by category
const NITAQAT_REQUIREMENTS: Record<WorkforceCategory, NitaqatRequirements> = {
  management: {
    category: 'management',
    saudiPercentageMin: 100, // 100% Saudi management required
    gccPercentageMin: 0,
    expatRatioLimit: 0,
  },
  technical: {
    category: 'technical',
    saudiPercentageMin: 50,
    gccPercentageMin: 75, // 75% Saudi+GCC combined
    expatRatioLimit: 25,
  },
  administrative: {
    category: 'administrative',
    saudiPercentageMin: 70,
    gccPercentageMin: 85,
    expatRatioLimit: 15,
  },
  skilled_labor: {
    category: 'skilled_labor',
    saudiPercentageMin: 40,
    gccPercentageMin: 60,
    expatRatioLimit: 40,
  },
  general_labor: {
    category: 'general_labor',
    saudiPercentageMin: 30,
    gccPercentageMin: 50,
    expatRatioLimit: 50,
  },
};

export interface EmployeeNationality {
  employeeId: number;
  name: string;
  nationality: 'saudi' | 'gcc' | 'other';
  category: WorkforceCategory;
  salaryLevel: number;
}

export interface NitaqatComplianceResult {
  overallLevel: NitaqatLevel;
  scorePercentage: number;
  
  // Category-level breakdown
  byCategory: {
    [key in WorkforceCategory]: {
      category: WorkforceCategory;
      totalEmployees: number;
      saudiEmployees: number;
      gccEmployees: number;
      expatEmployees: number;
      saudiPercentage: number;
      gccPercentage: number;
      expatPercentage: number;
      requirementsMet: boolean;
      complianceStatus: 'compliant' | 'warning' | 'non-compliant';
      saudiMinRequired: number;
      gccMinRequired: number;
    };
  };
  
  // Overall summary
  totalEmployees: number;
  totalSaudiEmployees: number;
  totalGccEmployees: number;
  totalExpatEmployees: number;
  totalSaudiPercentage: number;
  totalGccPercentage: number;
  totalExpatPercentage: number;
  
  // Compliance breakdown
  compliantCategories: number;
  warningCategories: number;
  nonCompliantCategories: number;
  
  // Recommendations
  gaps: string[];
  recommendations: string[];
  
  // Next review date
  reviewDate: Date;
  lastReviewDate: Date;
}

/**
 * Calculate Nitaqat level based on score
 * Platinum: 90+
 * Gold: 80-89
 * Silver: 70-79
 * Bronze: 60-69
 * Red: 40-59
 * Non-compliant: <40
 */
export function getNitaqatLevel(scorePercentage: number): NitaqatLevel {
  if (scorePercentage >= 90) return 'platinum';
  if (scorePercentage >= 80) return 'gold';
  if (scorePercentage >= 70) return 'silver';
  if (scorePercentage >= 60) return 'bronze';
  if (scorePercentage >= 40) return 'red';
  return 'non-compliant';
}

/**
 * Get benefits for each Nitaqat level
 */
export function getNitaqatBenefits(level: NitaqatLevel): {
  expatQuotaIncrease: number;
  bankingPreferences: boolean;
  governmentContractPriority: boolean;
  publicTenderDiscount: number;
  sponsorshipBenefits: string[];
} {
  const benefits = {
    platinum: {
      expatQuotaIncrease: 50,
      bankingPreferences: true,
      governmentContractPriority: true,
      publicTenderDiscount: 10,
      sponsorshipBenefits: [
        'Priority in government contracts',
        'Increase in foreign worker quota',
        'Banking sector privileges',
        'Labor-related support',
        'Government endorsement for bidding'
      ]
    },
    gold: {
      expatQuotaIncrease: 40,
      bankingPreferences: true,
      governmentContractPriority: true,
      publicTenderDiscount: 7,
      sponsorshipBenefits: [
        'Priority in government contracts',
        'Increase in foreign worker quota',
        'Banking sector preferences'
      ]
    },
    silver: {
      expatQuotaIncrease: 30,
      bankingPreferences: false,
      governmentContractPriority: false,
      publicTenderDiscount: 5,
      sponsorshipBenefits: [
        'Moderate foreign worker quota increase',
        'Basic labor market support'
      ]
    },
    bronze: {
      expatQuotaIncrease: 20,
      bankingPreferences: false,
      governmentContractPriority: false,
      publicTenderDiscount: 2,
      sponsorshipBenefits: [
        'Limited foreign worker quota adjustment'
      ]
    },
    red: {
      expatQuotaIncrease: 0,
      bankingPreferences: false,
      governmentContractPriority: false,
      publicTenderDiscount: 0,
      sponsorshipBenefits: [
        'Required to submit corrective action plan'
      ]
    },
    'non-compliant': {
      expatQuotaIncrease: -50,
      bankingPreferences: false,
      governmentContractPriority: false,
      publicTenderDiscount: -5,
      sponsorshipBenefits: [
        'Subject to penalties',
        'Reduced foreign worker quota',
        'Restricted government contract eligibility',
        'Potential debarment from tenders'
      ]
    }
  };
  
  return benefits[level];
}

/**
 * Calculate category compliance
 */
function calculateCategoryCompliance(
  employees: EmployeeNationality[],
  category: WorkforceCategory
) {
  const categoryEmployees = employees.filter(e => e.category === category);
  const requirements = NITAQAT_REQUIREMENTS[category];
  
  const totalCount = categoryEmployees.length;
  const saudiCount = categoryEmployees.filter(e => e.nationality === 'saudi').length;
  const gccCount = categoryEmployees.filter(e => e.nationality === 'gcc').length;
  const expatCount = categoryEmployees.filter(e => e.nationality === 'other').length;
  
  const saudiPercent = totalCount > 0 ? (saudiCount / totalCount) * 100 : 0;
  const gccPercent = totalCount > 0 ? (gccCount / totalCount) * 100 : 0;
  const expatPercent = totalCount > 0 ? (expatCount / totalCount) * 100 : 0;
  const saudiPlusGcc = saudiPercent + gccPercent;
  
  const saudiMinRequired = Math.ceil((totalCount * requirements.saudiPercentageMin) / 100);
  const gccMinRequired = Math.ceil((totalCount * requirements.gccPercentageMin) / 100);
  
  const saudiMet = saudiCount >= saudiMinRequired;
  const gccMet = saudiPlusGcc >= gccMinRequired;
  const requirementsMet = saudiMet && gccMet;
  
  let complianceStatus: 'compliant' | 'warning' | 'non-compliant' = 'compliant';
  if (!requirementsMet) {
    const shortfall = Math.max(
      saudiMinRequired - saudiCount,
      gccMinRequired - (saudiCount + gccCount)
    );
    complianceStatus = shortfall > 2 ? 'non-compliant' : 'warning';
  }
  
  return {
    category,
    totalEmployees: totalCount,
    saudiEmployees: saudiCount,
    gccEmployees: gccCount,
    expatEmployees: expatCount,
    saudiPercentage: saudiPercent,
    gccPercentage: gccPercent,
    expatPercentage: expatPercent,
    requirementsMet,
    complianceStatus,
    saudiMinRequired,
    gccMinRequired,
  };
}

/**
 * Calculate overall Nitaqat compliance score
 */
export function calculateNitaqatCompliance(
  employees: EmployeeNationality[],
  lastReviewDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
): NitaqatComplianceResult {
  
  const categories = Object.keys(NITAQAT_REQUIREMENTS) as WorkforceCategory[];
  const categoryResults: Record<WorkforceCategory, any> = {} as any;
  
  let compliantCount = 0;
  let warningCount = 0;
  let nonCompliantCount = 0;
  
  for (const category of categories) {
    const result = calculateCategoryCompliance(employees, category);
    categoryResults[category] = result;
    
    if (result.complianceStatus === 'compliant') compliantCount++;
    if (result.complianceStatus === 'warning') warningCount++;
    if (result.complianceStatus === 'non-compliant') nonCompliantCount++;
  }
  
  // Calculate overall statistics
  const totalEmployees = employees.length;
  const totalSaudiEmployees = employees.filter(e => e.nationality === 'saudi').length;
  const totalGccEmployees = employees.filter(e => e.nationality === 'gcc').length;
  const totalExpatEmployees = employees.filter(e => e.nationality === 'other').length;
  
  const totalSaudiPercentage = totalEmployees > 0 
    ? (totalSaudiEmployees / totalEmployees) * 100 
    : 0;
  const totalGccPercentage = totalEmployees > 0 
    ? (totalGccEmployees / totalEmployees) * 100 
    : 0;
  const totalExpatPercentage = totalEmployees > 0 
    ? (totalExpatEmployees / totalEmployees) * 100 
    : 0;
  
  // Calculate compliance score
  const categoryScores = Object.values(categoryResults).map((result: any) => {
    if (result.complianceStatus === 'compliant') return 100;
    if (result.complianceStatus === 'warning') return 70;
    return 30;
  });
  
  const scorePercentage = categoryScores.length > 0
    ? categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
    : 0;
  
  // Identify gaps and recommendations
  const gaps: string[] = [];
  const recommendations: string[] = [];
  
  for (const category of categories) {
    const result = categoryResults[category];
    if (result.complianceStatus !== 'compliant') {
      const saudiGap = Math.max(0, result.saudiMinRequired - result.saudiEmployees);
      const gccGap = Math.max(0, result.gccMinRequired - (result.saudiEmployees + result.gccEmployees));
      
      if (saudiGap > 0) {
        gaps.push(`${category}: Need ${saudiGap} more Saudi employees`);
        recommendations.push(`Recruit ${saudiGap} Saudi nationals for ${category} positions`);
      }
      if (gccGap > 0) {
        gaps.push(`${category}: Need ${gccGap} more GCC employees`);
        recommendations.push(`Recruit ${gccGap} GCC nationals for ${category} positions`);
      }
    }
  }
  
  // Level-specific recommendations
  const level = getNitaqatLevel(scorePercentage);
  if (level === 'non-compliant') {
    recommendations.push('Submit compliance improvement plan to MHRSD within 60 days');
    recommendations.push('Risk of penalties and reduced foreign worker quotas');
    recommendations.push('May be excluded from government contracts');
  } else if (level === 'red') {
    recommendations.push('Implement urgent recruitment plan for Saudi workers');
    recommendations.push('Review all workforce planning to align with Nitaqat');
  }
  
  // Review date (annual review)
  const reviewDate = new Date();
  reviewDate.setFullYear(reviewDate.getFullYear() + 1);
  
  return {
    overallLevel: level,
    scorePercentage,
    byCategory: categoryResults,
    totalEmployees,
    totalSaudiEmployees,
    totalGccEmployees,
    totalExpatEmployees,
    totalSaudiPercentage,
    totalGccPercentage,
    totalExpatPercentage,
    compliantCategories: compliantCount,
    warningCategories: warningCount,
    nonCompliantCategories: nonCompliantCount,
    gaps,
    recommendations,
    reviewDate,
    lastReviewDate,
  };
}

/**
 * Predict Nitaqat level impact on business
 */
export function predictNitaqatImpact(currentLevel: NitaqatLevel) {
  const benefits = getNitaqatBenefits(currentLevel);
  
  return {
    level: currentLevel,
    benefits,
    impact: {
      canBidGovernmentContracts: currentLevel !== 'non-compliant' && currentLevel !== 'red',
      canAccessBankingServices: benefits.bankingPreferences,
      expatQuotaBonus: benefits.expatQuotaIncrease,
      tenderDiscountEligibility: benefits.publicTenderDiscount > 0,
      governmentPriority: benefits.governmentContractPriority,
    },
    recommendations: [
      currentLevel === 'platinum' || currentLevel === 'gold' 
        ? 'Maintain current performance levels to retain benefits'
        : 'Focus on recruitment and workforce development to improve level',
      'Monitor workforce metrics monthly to ensure compliance',
      'Document all hiring and training initiatives for audits',
    ]
  };
}

/**
 * Calculate required headcount for target level
 */
export function calculateHeadcountForLevel(
  currentEmployees: EmployeeNationality[],
  targetLevel: NitaqatLevel
): {
  category: WorkforceCategory;
  currentHeadcount: number;
  requiredHeadcount: number;
  saudiRequired: number;
  gccRequired: number;
  gapAnalysis: string;
}[] {
  const categories = Object.keys(NITAQAT_REQUIREMENTS) as WorkforceCategory[];
  const results = [];
  
  // Estimate scoring requirement for target level
  let targetScore = 85;
  if (targetLevel === 'gold') targetScore = 85;
  if (targetLevel === 'silver') targetScore = 75;
  if (targetLevel === 'bronze') targetScore = 65;
  
  for (const category of categories) {
    const categoryEmployees = currentEmployees.filter(e => e.category === category);
    const requirements = NITAQAT_REQUIREMENTS[category];
    
    const saudiRequired = Math.ceil(
      (categoryEmployees.length * requirements.saudiPercentageMin) / 100
    );
    const gccRequired = Math.ceil(
      (categoryEmployees.length * requirements.gccPercentageMin) / 100
    );
    
    results.push({
      category,
      currentHeadcount: categoryEmployees.length,
      requiredHeadcount: gccRequired,
      saudiRequired,
      gccRequired,
      gapAnalysis: `Category requires ${saudiRequired} Saudi and ${gccRequired} Saudi+GCC total`,
    });
  }
  
  return results;
}
