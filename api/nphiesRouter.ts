import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { eq, and, desc, sql } from "drizzle-orm";

const nphiesStatusSchema = z.object({
  memberId: z.string(),
  providerId: z.string(),
  payerId: z.string(),
  serviceType: z.string(),
  serviceDate: z.string(),
});

const claimSubmissionSchema = z.object({
  patientId: z.number(),
  encounterId: z.number(),
  payerId: z.string(),
  diagnosisCodes: z.array(z.string()),
  procedures: z.array(z.object({
    code: z.string(),
    date: z.string(),
    fee: z.number(),
  })),
  totalFee: z.number(),
  notes: z.string().optional(),
});

export const nphiesRouter = createRouter({
  checkEligibility: authedQuery
    .input(nphiesStatusSchema)
    .query(async ({ input }) => {
      const eligibilityResult = {
        eligible: true,
        memberName: "---",
        payerName: "---",
        coverageStatus: "active",
        copayAmount: 0,
        deductibleRemaining: 0,
        maxBenefitRemaining: 500000,
        planType: "comprehensive",
        effectiveDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        networkStatus: "in_network",
        preAuthRequired: false,
        limitations: [] as string[],
        rawResponse: {
          eligibilityId: `ELG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          payerId: input.payerId,
          memberId: input.memberId,
        },
      };

      return eligibilityResult;
    }),

  submitClaim: authedQuery
    .input(claimSubmissionSchema)
    .mutation(async ({ input, ctx }) => {
      const claimId = `NPHIES-${Date.now()}`;
      const claimRecord = {
        id: Math.floor(Math.random() * 1000000),
        claimId,
        patientId: input.patientId,
        encounterId: input.encounterId,
        totalFee: input.totalFee,
        status: "submitted",
        submittedAt: new Date().toISOString(),
        payerId: input.payerId,
        diagnosisCodes: input.diagnosisCodes,
        procedureCount: input.procedures.length,
        notes: input.notes,
        tenantId: ctx.user.tenantId,
        createdBy: ctx.user.id,
      };

      return {
        success: true,
        claimId,
        submittedAt: claimRecord.submittedAt,
        estimatedProcessingDays: 14,
        status: "submitted",
        claimRecord,
      };
    }),

  getClaimStatus: authedQuery
    .input(z.object({ claimId: z.string() }))
    .query(async ({ input }) => {
      const claimStatus = {
        claimId: input.claimId,
        status: "processing",
        payerClaimId: `PAYER-${input.claimId}`,
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        adjudication: {
          status: "in_progress",
          totalBilled: 12500,
          totalApproved: 11200,
          totalDenied: 1300,
          patientResponsibility: 500,
          payerResponsibility: 10700,
        },
        statusHistory: [
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: "submitted", note: "Claim submitted electronically" },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: "accepted", note: "Claim accepted by payer" },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "in_adjudication", note: "Under review by adjudicator" },
        ],
      };

      return claimStatus;
    }),

  getPayerList: authedQuery.query(async () => {
    return [
      { id: "Bupa", name: "Bupa Arabia", type: "insurance" },
      { id: "Tawuniya", name: "Tawuniya", type: "insurance" },
      { id: "MedGulf", name: "MedGulf", type: "insurance" },
      { id: "GlobeMed", name: "GlobeMed/Saudi Care", type: "insurance" },
      { id: "Allianz", name: "Allianz Saudi Fransi", type: "insurance" },
      { id: "AXA", name: "AXA Cooperative", type: "insurance" },
      { id: "AlRajhi", name: "Al Rajhi Takaful", type: "insurance" },
      { id: "GIG", name: "Gulf Insurance Group", type: "insurance" },
      { id: "Walaa", name: "Walaa Cooperative", type: "insurance" },
      { id: "ACIG", name: "ACIG", type: "insurance" },
      { id: "MOH", name: "Ministry of Health", type: "government" },
      { id: "CCHI", name: "Council of Health Insurance", type: "regulator" },
    ];
  }),

  getServiceCodes: authedQuery.query(async () => {
    return [
      { code: "99201-99205", description: "Office/outpatient new visit", category: "consultation" },
      { code: "99211-99215", description: "Office/outpatient established visit", category: "consultation" },
      { code: "93000-93010", description: "ECG (electrocardiogram)", category: "diagnostic" },
      { code: "80048-80053", description: "Basic metabolic panel", category: "lab" },
      { code: "85025-85027", description: "CBC (complete blood count)", category: "lab" },
      { code: "71045-71048", description: "Chest X-ray", category: "radiology" },
      { code: "70551-70553", description: "MRI brain", category: "radiology" },
      { code: "J3420-J3490", description: "Injectable medications", category: "pharmacy" },
      { code: "G0101-G0103", description: "Cancer screening", category: "preventive" },
      { code: "99221-99223", description: "Inpatient initial care", category: "inpatient" },
      { code: "99231-99233", description: "Inpatient subsequent care", category: "inpatient" },
      { code: "99281-99285", description: "Emergency department visit", category: "emergency" },
    ];
  }),

  getDiagnosisCodes: authedQuery.query(async () => {
    return [
      { code: "E11.9", description: "Type 2 diabetes without complications", category: "endocrine" },
      { code: "I10", description: "Essential (primary) hypertension", category: "cardio" },
      { code: "J45.9", description: "Unspecified asthma", category: "respiratory" },
      { code: "M54.5", description: "Low back pain", category: "musculo" },
      { code: "J06.9", description: "Acute upper respiratory infection", category: "respiratory" },
      { code: "N39.0", description: "Urinary tract infection", category: "renal" },
      { code: "K21.9", description: "GERD without esophagitis", category: "gi" },
      { code: "F32.9", description: "Major depressive disorder", category: "mental" },
      { code: "E78.5", description: "Hyperlipidemia", category: "endocrine" },
      { code: "L20.8", description: "Atopic dermatitis", category: "derma" },
    ];
  }),

  getDashboard: authedQuery.query(async ({ ctx }) => {
    return {
      submittedClaims: 156,
      approvedClaims: 132,
      deniedClaims: 12,
      pendingClaims: 11,
      totalBilled: 1875000,
      totalApproved: 1632000,
      avgProcessingDays: 14,
      activeEligibilityChecks: 89,
      payerDistribution: [
        { payer: "Bupa Arabia", count: 52, amount: 624000 },
        { payer: "Tawuniya", count: 38, amount: 456000 },
        { payer: "MedGulf", count: 28, amount: 336000 },
        { payer: "GlobeMed", count: 22, amount: 264000 },
        { payer: "Allianz", count: 16, amount: 192000 },
      ],
      recentClaims: [
        { id: "NPHIES-20250101-001", patientName: "Ahmed Al-Otaibi", payer: "Bupa Arabia", amount: 12500, status: "submitted", date: new Date().toISOString() },
        { id: "NPHIES-20250101-002", patientName: "Mohammed Al-Qahtani", payer: "Tawuniya", amount: 8900, status: "approved", date: new Date().toISOString() },
        { id: "NPHIES-20250101-003", patientName: "Sara Al-Harbi", payer: "MedGulf", amount: 15200, status: "denied", date: new Date().toISOString() },
      ],
    };
  }),
});
