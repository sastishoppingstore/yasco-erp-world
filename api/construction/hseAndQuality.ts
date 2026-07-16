export interface HSEIncident {
  id: string;
  projectId: string;
  incidentType: 'near-miss' | 'injury' | 'property-damage' | 'environmental' | 'health-hazard';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedDate: Date;
  incidentDate: Date;
  location: string;
  description: string;
  witnesses: string[];
  immediateAction: string;
  preventiveMeasures?: string;
  status: 'reported' | 'investigating' | 'under-review' | 'closed';
  rootCauseAnalysis?: RootCauseAnalysis;
  correctiveActions: CorrectiveAction[];
  documents: Document[];
  photos: string[];
  investigationStartDate?: Date;
  investigationEndDate?: Date;
  investigator?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RootCauseAnalysis {
  id: string;
  incidentId: string;
  fiveWhy: FiveWhyAnalysis;
  contributingFactors: string[];
  rootCauses: string[];
  analysis: string;
  completedDate?: Date;
  completedBy?: string;
}

export interface FiveWhyAnalysis {
  level1: { why: string; answer: string };
  level2: { why: string; answer: string };
  level3: { why: string; answer: string };
  level4: { why: string; answer: string };
  level5: { why: string; answer: string };
}

export interface CorrectiveAction {
  id: string;
  incidentId: string;
  action: string;
  owner: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'completed' | 'overdue';
  completionDate?: Date;
  completionNotes?: string;
  verifiedBy?: string;
  verifiedDate?: Date;
  effectiveness?: 'effective' | 'ineffective' | 'pending-review';
}

export interface NCR {
  id: string;
  projectId: string;
  ncrNumber: string;
  description: string;
  area: string;
  trade: string;
  severity: 'minor' | 'major' | 'critical';
  dateIdentified: Date;
  identifiedBy: string;
  requiredActionType: 'rework' | 'accept-as-is' | 'repair' | 'other';
  requiredAction: string;
  proposedSolution?: string;
  contractorResponse?: string;
  clientApproval?: 'pending' | 'approved' | 'rejected';
  status: 'open' | 'in-progress' | 'completed' | 'closed';
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  photoBefore?: string[];
  photoAfter?: string[];
  punchListItem?: boolean;
  relatedRFI?: string;
  comments: Comment[];
  history: AuditTrail[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface AuditTrail {
  id: string;
  action: string;
  changedBy: string;
  changedAt: Date;
  previousValue?: any;
  newValue?: any;
  reason?: string;
}

export interface PunchListItem {
  id: string;
  projectId: string;
  area: string;
  trade: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'completed' | 'pending-inspection';
  completionDate?: Date;
  inspectionDate?: Date;
  inspectionResult?: 'pass' | 'fail' | 'partial';
  photos: string[];
  relatedNCR?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityPhotoDocumentation {
  id: string;
  projectId: string;
  photoType: 'progress' | 'defect' | 'rework' | 'completion' | 'other';
  area: string;
  trade: string;
  description: string;
  photoUrl: string;
  location: {
    latitude: number;
    longitude: number;
    elevation?: number;
    description: string;
  };
  takenBy: string;
  takenDate: Date;
  metadata: {
    timestamp: Date;
    camera?: string;
    quality?: 'low' | 'medium' | 'high';
  };
  geoTagged: boolean;
  relatedNCR?: string;
  relatedPunchListItem?: string;
  tags: string[];
  createdAt: Date;
}

export interface RFI {
  id: string;
  projectId: string;
  rfiNumber: string;
  subject: string;
  description: string;
  issuedBy: string;
  issuedDate: Date;
  issuedTo: string;
  category: 'design' | 'specification' | 'coordination' | 'schedule' | 'cost' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: string[];
  targetResponseDate: Date;
  responseReceived?: boolean;
  responseDate?: Date;
  response?: string;
  respondedBy?: string;
  status: 'open' | 'pending-response' | 'responded' | 'closed';
  impactOnSchedule?: number; // days
  impactOnCost?: number;
  impactAssessment?: string;
  relatedClash?: string;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export class HSEIncidentWorkflow {
  /**
   * Create new HSE incident
   */
  static createIncident(data: Partial<HSEIncident>): HSEIncident {
    const incident: HSEIncident = {
      id: `INC-${Date.now()}`,
      projectId: data.projectId || '',
      incidentType: data.incidentType || 'near-miss',
      severity: data.severity || 'low',
      reportedBy: data.reportedBy || '',
      reportedDate: new Date(),
      incidentDate: data.incidentDate || new Date(),
      location: data.location || '',
      description: data.description || '',
      witnesses: data.witnesses || [],
      immediateAction: data.immediateAction || '',
      preventiveMeasures: data.preventiveMeasures,
      status: 'reported',
      correctiveActions: [],
      documents: [],
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return incident;
  }

  /**
   * Start investigation on incident
   */
  static startInvestigation(incident: HSEIncident, investigator: string): HSEIncident {
    return {
      ...incident,
      status: 'investigating',
      investigator,
      investigationStartDate: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Complete 5-Why analysis
   */
  static completeFiveWhyAnalysis(
    incident: HSEIncident,
    fiveWhy: FiveWhyAnalysis,
    completedBy: string
  ): HSEIncident {
    const rootCauseAnalysis: RootCauseAnalysis = {
      id: `RCA-${Date.now()}`,
      incidentId: incident.id,
      fiveWhy,
      contributingFactors: [],
      rootCauses: this.extractRootCauses(fiveWhy),
      analysis: this.generateRCAReport(fiveWhy),
      completedDate: new Date(),
      completedBy,
    };

    return {
      ...incident,
      rootCauseAnalysis,
      updatedAt: new Date(),
    };
  }

  /**
   * Add corrective action
   */
  static addCorrectiveAction(
    incident: HSEIncident,
    action: Omit<CorrectiveAction, 'id' | 'incidentId'>
  ): HSEIncident {
    const correctiveAction: CorrectiveAction = {
      id: `CA-${Date.now()}`,
      incidentId: incident.id,
      ...action,
      status: 'open',
    };

    return {
      ...incident,
      correctiveActions: [...incident.correctiveActions, correctiveAction],
      updatedAt: new Date(),
    };
  }

  /**
   * Complete corrective action
   */
  static completeCorrectiveAction(
    incident: HSEIncident,
    actionId: string,
    completionNotes: string,
    completedBy: string
  ): HSEIncident {
    const actions = incident.correctiveActions.map((ca) =>
      ca.id === actionId
        ? {
            ...ca,
            status: 'completed' as const,
            completionDate: new Date(),
            completionNotes,
            verifiedBy: completedBy,
            verifiedDate: new Date(),
          }
        : ca
    );

    return {
      ...incident,
      correctiveActions: actions,
      updatedAt: new Date(),
    };
  }

  /**
   * Close incident
   */
  static closeIncident(incident: HSEIncident): HSEIncident {
    // Verify all corrective actions are completed
    const allActionsCompleted = incident.correctiveActions.every(
      (ca) => ca.status === 'completed'
    );

    if (!allActionsCompleted) {
      throw new Error('Cannot close incident with pending corrective actions');
    }

    return {
      ...incident,
      status: 'closed',
      investigationEndDate: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate NCR from incident
   */
  static createNCRFromIncident(
    incident: HSEIncident,
    area: string,
    trade: string
  ): NCR {
    return {
      id: `NCR-${Date.now()}`,
      projectId: incident.projectId,
      ncrNumber: `NCR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      description: incident.description,
      area,
      trade,
      severity: incident.severity === 'critical' ? 'critical' : 
               incident.severity === 'high' ? 'major' : 'minor',
      dateIdentified: incident.reportedDate,
      identifiedBy: incident.reportedBy,
      requiredActionType: 'rework',
      requiredAction: incident.immediateAction,
      status: 'open',
      targetCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      comments: [],
      history: [
        {
          id: `AUD-${Date.now()}`,
          action: 'NCR Created from HSE Incident',
          changedBy: incident.reportedBy,
          changedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Extract root causes from 5-Why analysis
   */
  private static extractRootCauses(fiveWhy: FiveWhyAnalysis): string[] {
    return [fiveWhy.level5.answer].filter((c) => c && c.trim().length > 0);
  }

  /**
   * Generate RCA report
   */
  private static generateRCAReport(fiveWhy: FiveWhyAnalysis): string {
    return `
5-Why Root Cause Analysis:

Level 1: Why?
${fiveWhy.level1.why}
Answer: ${fiveWhy.level1.answer}

Level 2: Why?
${fiveWhy.level2.why}
Answer: ${fiveWhy.level2.answer}

Level 3: Why?
${fiveWhy.level3.why}
Answer: ${fiveWhy.level3.answer}

Level 4: Why?
${fiveWhy.level4.why}
Answer: ${fiveWhy.level4.answer}

Level 5: Why?
${fiveWhy.level5.why}
Answer: ${fiveWhy.level5.answer}

Root Cause: ${fiveWhy.level5.answer}
    `.trim();
  }
}

export class QualityManagement {
  /**
   * Create NCR
   */
  static createNCR(data: Partial<NCR>): NCR {
    return {
      id: `NCR-${Date.now()}`,
      projectId: data.projectId || '',
      ncrNumber: data.ncrNumber || `NCR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      description: data.description || '',
      area: data.area || '',
      trade: data.trade || '',
      severity: data.severity || 'minor',
      dateIdentified: data.dateIdentified || new Date(),
      identifiedBy: data.identifiedBy || '',
      requiredActionType: data.requiredActionType || 'rework',
      requiredAction: data.requiredAction || '',
      status: 'open',
      targetCompletionDate: data.targetCompletionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      comments: [],
      history: [
        {
          id: `AUD-${Date.now()}`,
          action: 'NCR Created',
          changedBy: data.identifiedBy || 'System',
          changedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Create punch list item
   */
  static createPunchListItem(data: Partial<PunchListItem>): PunchListItem {
    return {
      id: `PLI-${Date.now()}`,
      projectId: data.projectId || '',
      area: data.area || '',
      trade: data.trade || '',
      description: data.description || '',
      location: data.location || '',
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo || '',
      dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'open',
      photos: data.photos || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Create quality photo documentation
   */
  static createQualityPhoto(data: Partial<QualityPhotoDocumentation>): QualityPhotoDocumentation {
    return {
      id: `QP-${Date.now()}`,
      projectId: data.projectId || '',
      photoType: data.photoType || 'progress',
      area: data.area || '',
      trade: data.trade || '',
      description: data.description || '',
      photoUrl: data.photoUrl || '',
      location: data.location || { latitude: 0, longitude: 0, description: '' },
      takenBy: data.takenBy || '',
      takenDate: data.takenDate || new Date(),
      metadata: data.metadata || { timestamp: new Date() },
      geoTagged: data.geoTagged || false,
      tags: data.tags || [],
      createdAt: new Date(),
    };
  }

  /**
   * Create RFI
   */
  static createRFI(data: Partial<RFI>): RFI {
    return {
      id: `RFI-${Date.now()}`,
      projectId: data.projectId || '',
      rfiNumber: data.rfiNumber || `RFI-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      subject: data.subject || '',
      description: data.description || '',
      issuedBy: data.issuedBy || '',
      issuedDate: data.issuedDate || new Date(),
      issuedTo: data.issuedTo || '',
      category: data.category || 'design',
      priority: data.priority || 'medium',
      attachments: data.attachments || [],
      targetResponseDate: data.targetResponseDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'open',
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Respond to RFI
   */
  static respondToRFI(rfi: RFI, response: string, respondedBy: string): RFI {
    return {
      ...rfi,
      response,
      respondedBy,
      responseDate: new Date(),
      responseReceived: true,
      status: 'responded',
      updatedAt: new Date(),
    };
  }

  /**
   * Close RFI
   */
  static closeRFI(rfi: RFI): RFI {
    return {
      ...rfi,
      status: 'closed',
      updatedAt: new Date(),
    };
  }

  /**
   * Add comment to NCR
   */
  static addComment(ncr: NCR, content: string, author: string): NCR {
    const comment: Comment = {
      id: `CMT-${Date.now()}`,
      author,
      content,
      createdAt: new Date(),
    };

    const auditTrail: AuditTrail = {
      id: `AUD-${Date.now()}`,
      action: 'Comment Added',
      changedBy: author,
      changedAt: new Date(),
      newValue: content,
    };

    return {
      ...ncr,
      comments: [...ncr.comments, comment],
      history: [...ncr.history, auditTrail],
      updatedAt: new Date(),
    };
  }
}
