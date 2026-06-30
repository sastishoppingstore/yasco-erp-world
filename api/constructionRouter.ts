import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  constructionProjects, subcontractors, subcontractorProjects, equipmentTracking, progressBilling, retentionAccounts,
  wbsItems, boqItems, constructionContracts, variationOrders, advancePayments, cvrReports, decennialLiability,
  siteDailyReports, subcontractorPayments, sbcCompliance, scaClassification, gtplCompliance, hseCommittees,
  heatStressRecords, engineeringSaudization, safetyTraining, ppeIssuance, equipmentSchedule, materialRequirements,
} from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const constructionRouter = createRouter({
  projectList: authedQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(constructionProjects.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(constructionProjects.status, input.status as any));
      return db.select().from(constructionProjects).where(and(...conditions)).orderBy(desc(constructionProjects.createdAt));
    }),

  projectCreate: authedQuery
    .input(z.object({
      projectCode: z.string(),
      name: z.string(),
      description: z.string().optional(),
      projectManagerId: z.number().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      contractValue: z.string().optional(),
      budget: z.string().optional(),
      projectType: z.enum(["residential", "commercial", "industrial", "infrastructure", "renovation"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(constructionProjects).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  projectUpdate: authedQuery
    .input(z.object({ id: z.number(), progress: z.number().optional(), status: z.enum(["planning", "tendering", "active", "on_hold", "completed", "cancelled"]).optional(), actualCost: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(constructionProjects).set(data).where(eq(constructionProjects.id, id));
      return { success: true };
    }),

  subcontractorList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(subcontractors).where(eq(subcontractors.tenantId, ctx.user.tenantId!));
    }),

  subcontractorCreate: authedQuery
    .input(z.object({
      code: z.string().optional(),
      name: z.string(),
      contactPerson: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      trade: z.string().optional(),
      licenseNumber: z.string().optional(),
      contractAmount: z.string().optional(),
      retentionPercent: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(subcontractors).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  equipmentList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(equipmentTracking.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(equipmentTracking.projectId, input.projectId));
      return db.select().from(equipmentTracking).where(and(...conditions));
    }),

  progressBillingList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(progressBilling.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(progressBilling.projectId, input.projectId));
      return db.select().from(progressBilling).where(and(...conditions)).orderBy(desc(progressBilling.createdAt));
    }),

  retentionList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(retentionAccounts.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(retentionAccounts.projectId, input.projectId));
      return db.select().from(retentionAccounts).where(and(...conditions));
    }),

  // ---- WBS Items ----
  wbsList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(wbsItems.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(wbsItems.projectId, input.projectId));
      return db.select().from(wbsItems).where(and(...conditions));
    }),

  wbsCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      parentId: z.number().optional(),
      code: z.string(),
      name: z.string(),
      level: z.number(),
      description: z.string().optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      actualStartDate: z.string().optional(),
      actualEndDate: z.string().optional(),
      plannedCost: z.string().optional(),
      actualCost: z.string().optional(),
      progressPercent: z.number().optional(),
      weightPercent: z.string().optional(),
      status: z.enum(["planned", "in_progress", "completed", "delayed", "cancelled"]).optional(),
      responsiblePersonId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(wbsItems).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  wbsUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      actualStartDate: z.string().optional(),
      actualEndDate: z.string().optional(),
      plannedCost: z.string().optional(),
      actualCost: z.string().optional(),
      progressPercent: z.number().optional(),
      weightPercent: z.string().optional(),
      status: z.enum(["planned", "in_progress", "completed", "delayed", "cancelled"]).optional(),
      responsiblePersonId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(wbsItems).set(data).where(eq(wbsItems.id, id));
      return { success: true };
    }),

  // ---- BOQ Items ----
  boqList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(boqItems.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(boqItems.projectId, input.projectId));
      return db.select().from(boqItems).where(and(...conditions));
    }),

  boqCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      wbsId: z.number().optional(),
      itemCode: z.string(),
      description: z.string(),
      unit: z.string(),
      quantity: z.string(),
      unitRate: z.string(),
      totalAmount: z.string(),
      wastagePercent: z.string().optional(),
      materialCost: z.string().optional(),
      laborCost: z.string().optional(),
      equipmentCost: z.string().optional(),
      directCost: z.string().optional(),
      indirectCost: z.string().optional(),
      profitMargin: z.string().optional(),
      taxRate: z.string().optional(),
      status: z.enum(["estimated", "approved", "revised", "completed"]).optional(),
      section: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(boqItems).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  boqUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      unit: z.string().optional(),
      quantity: z.string().optional(),
      unitRate: z.string().optional(),
      totalAmount: z.string().optional(),
      wastagePercent: z.string().optional(),
      materialCost: z.string().optional(),
      laborCost: z.string().optional(),
      equipmentCost: z.string().optional(),
      directCost: z.string().optional(),
      indirectCost: z.string().optional(),
      profitMargin: z.string().optional(),
      taxRate: z.string().optional(),
      status: z.enum(["estimated", "approved", "revised", "completed"]).optional(),
      section: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(boqItems).set(data).where(eq(boqItems.id, id));
      return { success: true };
    }),

  // ---- Construction Contracts ----
  contractList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(constructionContracts.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(constructionContracts.projectId, input.projectId));
      return db.select().from(constructionContracts).where(and(...conditions));
    }),

  contractCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      contractNumber: z.string(),
      contractType: z.enum(["lump_sum", "cost_plus", "unit_price", "design_build", "turnkey"]),
      title: z.string(),
      description: z.string().optional(),
      clientId: z.number().optional(),
      contractorId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      contractDate: z.string().optional(),
      contractValue: z.string().optional(),
      currency: z.string().optional(),
      paymentTerms: z.string().optional(),
      liquidatedDamagesPercent: z.string().optional(),
      warrantyPeriodMonths: z.number().optional(),
      retentionPercent: z.string().optional(),
      advancePaymentPercent: z.string().optional(),
      advancePaymentAmount: z.string().optional(),
      insuranceRequired: z.boolean().optional(),
      insuranceAmount: z.string().optional(),
      performanceBondPercent: z.string().optional(),
      performanceBondAmount: z.string().optional(),
      status: z.enum(["draft", "signed", "active", "amended", "completed", "terminated"]).optional(),
      signedByClient: z.boolean().optional(),
      signedByContractor: z.boolean().optional(),
      signedAt: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(constructionContracts).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  contractUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      contractValue: z.string().optional(),
      status: z.enum(["draft", "signed", "active", "amended", "completed", "terminated"]).optional(),
      signedByClient: z.boolean().optional(),
      signedByContractor: z.boolean().optional(),
      signedAt: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(constructionContracts).set(data).where(eq(constructionContracts.id, id));
      return { success: true };
    }),

  // ---- Variation Orders ----
  variationList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(variationOrders.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(variationOrders.projectId, input.projectId));
      return db.select().from(variationOrders).where(and(...conditions));
    }),

  variationCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      contractId: z.number().optional(),
      voNumber: z.string(),
      title: z.string(),
      description: z.string().optional(),
      reason: z.enum(["change_in_scope", "design_change", "omission", "additional_work", "regulatory", "other"]),
      changeType: z.enum(["addition", "deduction", "omission"]),
      status: z.enum(["draft", "submitted", "approved", "rejected", "implemented"]).optional(),
      originalValue: z.string().optional(),
      changeValue: z.string().optional(),
      revisedValue: z.string().optional(),
      impactOnTime: z.number().optional(),
      impactOnCost: z.string().optional(),
      approvedBy: z.string().optional(),
      approvedDate: z.string().optional(),
      submittedBy: z.number().optional(),
      approvedByUserId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(variationOrders).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  variationUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "submitted", "approved", "rejected", "implemented"]).optional(),
      changeValue: z.string().optional(),
      revisedValue: z.string().optional(),
      impactOnTime: z.number().optional(),
      impactOnCost: z.string().optional(),
      approvedBy: z.string().optional(),
      approvedDate: z.string().optional(),
      approvedByUserId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(variationOrders).set(data).where(eq(variationOrders.id, id));
      return { success: true };
    }),

  // ---- Advance Payments ----
  advancePaymentList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(advancePayments.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(advancePayments.projectId, input.projectId));
      return db.select().from(advancePayments).where(and(...conditions));
    }),

  advancePaymentCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      contractId: z.number().optional(),
      paymentNumber: z.string(),
      paymentType: z.enum(["advance", "mobilization", "progress", "retention_release"]),
      amount: z.string(),
      paidAmount: z.string().optional(),
      requestDate: z.string().optional(),
      paidDate: z.string().optional(),
      recoveryMethod: z.enum(["deduction_from_bills", "direct_payment"]).optional(),
      recoveryPercent: z.string().optional(),
      recoveryInstallments: z.number().optional(),
      installmentAmount: z.string().optional(),
      remainingAmount: z.string().optional(),
      status: z.enum(["requested", "approved", "paid", "fully_recovered", "cancelled"]).optional(),
      bankGuaranteeNumber: z.string().optional(),
      bankName: z.string().optional(),
      guaranteeExpiryDate: z.string().optional(),
      guaranteeAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(advancePayments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  advancePaymentUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      paidAmount: z.string().optional(),
      paidDate: z.string().optional(),
      remainingAmount: z.string().optional(),
      status: z.enum(["requested", "approved", "paid", "fully_recovered", "cancelled"]).optional(),
      bankGuaranteeNumber: z.string().optional(),
      bankName: z.string().optional(),
      guaranteeExpiryDate: z.string().optional(),
      guaranteeAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(advancePayments).set(data).where(eq(advancePayments.id, id));
      return { success: true };
    }),

  // ---- CVR Reports ----
  cvrList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(cvrReports.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(cvrReports.projectId, input.projectId));
      return db.select().from(cvrReports).where(and(...conditions));
    }),

  cvrCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      reportNumber: z.string(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
      approvedVariations: z.string().optional(),
      pendingVariations: z.string().optional(),
      originalContractValue: z.string().optional(),
      revisedContractValue: z.string().optional(),
      workCompletedValue: z.string().optional(),
      workRemainingValue: z.string().optional(),
      certifiedAmount: z.string().optional(),
      amountsRetention: z.string().optional(),
      amountsPaid: z.string().optional(),
      amountsOutstanding: z.string().optional(),
      totalCostToDate: z.string().optional(),
      estimatedFinalCost: z.string().optional(),
      forecastProfitLoss: z.string().optional(),
      status: z.enum(["draft", "reviewed", "approved"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(cvrReports).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  cvrUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      workCompletedValue: z.string().optional(),
      workRemainingValue: z.string().optional(),
      certifiedAmount: z.string().optional(),
      amountsRetention: z.string().optional(),
      amountsPaid: z.string().optional(),
      amountsOutstanding: z.string().optional(),
      totalCostToDate: z.string().optional(),
      estimatedFinalCost: z.string().optional(),
      forecastProfitLoss: z.string().optional(),
      status: z.enum(["draft", "reviewed", "approved"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(cvrReports).set(data).where(eq(cvrReports.id, id));
      return { success: true };
    }),

  // ---- Decennial Liability ----
  decennialList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(decennialLiability.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(decennialLiability.projectId, input.projectId));
      return db.select().from(decennialLiability).where(and(...conditions));
    }),

  decennialCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      contractId: z.number(),
      liabilityPeriodYears: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      insurancePolicyNumber: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insuranceAmount: z.string().optional(),
      coverageDetails: z.string().optional(),
      decennialCertificate: z.string().optional(),
      status: z.enum(["active", "expired", "claimed"]).optional(),
      lastInspectionDate: z.string().optional(),
      nextInspectionDate: z.string().optional(),
      claimsRaised: z.number().optional(),
      claimsAmount: z.string().optional(),
      resolvedClaimsAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(decennialLiability).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  decennialUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "expired", "claimed"]).optional(),
      lastInspectionDate: z.string().optional(),
      nextInspectionDate: z.string().optional(),
      claimsRaised: z.number().optional(),
      claimsAmount: z.string().optional(),
      resolvedClaimsAmount: z.string().optional(),
      insurancePolicyNumber: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insuranceAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(decennialLiability).set(data).where(eq(decennialLiability.id, id));
      return { success: true };
    }),

  // ---- Site Daily Reports ----
  siteDailyReportList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(siteDailyReports.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(siteDailyReports.projectId, input.projectId));
      return db.select().from(siteDailyReports).where(and(...conditions));
    }),

  siteDailyReportCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      reportDate: z.string(),
      reportNumber: z.string(),
      weatherCondition: z.string().optional(),
      temperature: z.string().optional(),
      workDescription: z.string().optional(),
      laborCount: z.number().optional(),
      supervisorName: z.string().optional(),
      equipmentUsed: z.string().optional(),
      materialsReceived: z.string().optional(),
      materialsUsed: z.string().optional(),
      workCompleted: z.string().optional(),
      workInProgress: z.string().optional(),
      issuesEncountered: z.string().optional(),
      safetyIncidents: z.string().optional(),
      visitors: z.string().optional(),
      photos: z.any().optional(),
      status: z.enum(["draft", "submitted", "approved"]).optional(),
      submittedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(siteDailyReports).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  siteDailyReportUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      weatherCondition: z.string().optional(),
      temperature: z.string().optional(),
      workDescription: z.string().optional(),
      laborCount: z.number().optional(),
      supervisorName: z.string().optional(),
      equipmentUsed: z.string().optional(),
      materialsReceived: z.string().optional(),
      materialsUsed: z.string().optional(),
      workCompleted: z.string().optional(),
      workInProgress: z.string().optional(),
      issuesEncountered: z.string().optional(),
      safetyIncidents: z.string().optional(),
      visitors: z.string().optional(),
      photos: z.any().optional(),
      status: z.enum(["draft", "submitted", "approved"]).optional(),
      approvedBy: z.number().optional(),
      approvedAt: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(siteDailyReports).set(data).where(eq(siteDailyReports.id, id));
      return { success: true };
    }),

  // ---- Subcontractor Payments ----
  subcontractorPaymentList: authedQuery
    .input(z.object({ projectId: z.number().optional(), subcontractorId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(subcontractorPayments.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(subcontractorPayments.projectId, input.projectId));
      if (input?.subcontractorId) conditions.push(eq(subcontractorPayments.subcontractorId, input.subcontractorId));
      return db.select().from(subcontractorPayments).where(and(...conditions));
    }),

  subcontractorPaymentCreate: authedQuery
    .input(z.object({
      subcontractorId: z.number(),
      projectId: z.number(),
      paymentNumber: z.string(),
      paymentDate: z.string().optional(),
      invoiceReference: z.string().optional(),
      grossAmount: z.string(),
      retentionDeducted: z.string().optional(),
      advanceRecovery: z.string().optional(),
      penalties: z.string().optional(),
      otherDeductions: z.string().optional(),
      netAmount: z.string(),
      paidAmount: z.string().optional(),
      paymentMethod: z.enum(["bank_transfer", "cheque", "cash"]).optional(),
      bankReference: z.string().optional(),
      status: z.enum(["pending", "approved", "paid", "cancelled"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(subcontractorPayments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  subcontractorPaymentUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      paidAmount: z.string().optional(),
      paymentMethod: z.enum(["bank_transfer", "cheque", "cash"]).optional(),
      bankReference: z.string().optional(),
      status: z.enum(["pending", "approved", "paid", "cancelled"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(subcontractorPayments).set(data).where(eq(subcontractorPayments.id, id));
      return { success: true };
    }),

  // ---- SBC Compliance ----
  sbcComplianceList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(sbcCompliance.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(sbcCompliance.projectId, input.projectId));
      return db.select().from(sbcCompliance).where(and(...conditions));
    }),

  sbcComplianceCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      sbcCode: z.string(),
      description: z.string().optional(),
      complianceRequired: z.boolean().optional(),
      complianceStatus: z.enum(["compliant", "non_compliant", "not_applicable", "pending_review"]).optional(),
      inspectorName: z.string().optional(),
      inspectionDate: z.string().optional(),
      certificateNumber: z.string().optional(),
      certificateExpiryDate: z.string().optional(),
      nonComplianceNotes: z.string().optional(),
      correctiveActions: z.string().optional(),
      correctiveActionDate: z.string().optional(),
      status: z.enum(["active", "expired"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(sbcCompliance).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  sbcComplianceUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      complianceStatus: z.enum(["compliant", "non_compliant", "not_applicable", "pending_review"]).optional(),
      inspectorName: z.string().optional(),
      inspectionDate: z.string().optional(),
      certificateNumber: z.string().optional(),
      certificateExpiryDate: z.string().optional(),
      nonComplianceNotes: z.string().optional(),
      correctiveActions: z.string().optional(),
      correctiveActionDate: z.string().optional(),
      status: z.enum(["active", "expired"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(sbcCompliance).set(data).where(eq(sbcCompliance.id, id));
      return { success: true };
    }),

  // ---- SCA Classification ----
  scaClassificationList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(scaClassification).where(eq(scaClassification.tenantId, ctx.user.tenantId!));
    }),

  scaClassificationCreate: authedQuery
    .input(z.object({
      entityName: z.string(),
      entityType: z.enum(["contractor", "consultant", "supplier"]),
      scaRegistrationNumber: z.string().optional(),
      classificationGrade: z.enum(["first", "second", "third", "fourth", "fifth"]).optional(),
      specialization: z.string().optional(),
      maxProjectValue: z.string().optional(),
      expiryDate: z.string().optional(),
      status: z.enum(["active", "suspended", "expired"]).optional(),
      verificationStatus: z.enum(["unverified", "verified", "rejected"]).optional(),
      verifiedAt: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(scaClassification).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  scaClassificationUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      entityName: z.string().optional(),
      classificationGrade: z.enum(["first", "second", "third", "fourth", "fifth"]).optional(),
      specialization: z.string().optional(),
      maxProjectValue: z.string().optional(),
      expiryDate: z.string().optional(),
      status: z.enum(["active", "suspended", "expired"]).optional(),
      verificationStatus: z.enum(["unverified", "verified", "rejected"]).optional(),
      verifiedAt: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(scaClassification).set(data).where(eq(scaClassification.id, id));
      return { success: true };
    }),

  // ---- GTPL Compliance ----
  gtplComplianceList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(gtplCompliance.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(gtplCompliance.projectId, input.projectId));
      return db.select().from(gtplCompliance).where(and(...conditions));
    }),

  gtplComplianceCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      tenderReference: z.string().optional(),
      etimadReference: z.string().optional(),
      governmentEntity: z.string().optional(),
      listedOnEtimad: z.boolean().optional(),
      saudizationRequired: z.boolean().optional(),
      saudizationPercent: z.string().optional(),
      localContentPercent: z.string().optional(),
      icvScore: z.string().optional(),
      complianceStatus: z.enum(["compliant", "non_compliant", "in_progress", "not_required"]).optional(),
      lastReviewedDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(gtplCompliance).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  gtplComplianceUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      listedOnEtimad: z.boolean().optional(),
      saudizationRequired: z.boolean().optional(),
      saudizationPercent: z.string().optional(),
      localContentPercent: z.string().optional(),
      icvScore: z.string().optional(),
      complianceStatus: z.enum(["compliant", "non_compliant", "in_progress", "not_required"]).optional(),
      lastReviewedDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(gtplCompliance).set(data).where(eq(gtplCompliance.id, id));
      return { success: true };
    }),

  // ---- HSE Committees ----
  hseCommitteeList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(hseCommittees.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(hseCommittees.projectId, input.projectId));
      return db.select().from(hseCommittees).where(and(...conditions));
    }),

  hseCommitteeCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      committeeName: z.string(),
      formationDate: z.string().optional(),
      expiryDate: z.string().optional(),
      members: z.any().optional(),
      chairperson: z.string().optional(),
      meetingFrequency: z.string().optional(),
      lastMeetingDate: z.string().optional(),
      nextMeetingDate: z.string().optional(),
      status: z.enum(["active", "dissolved"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(hseCommittees).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  hseCommitteeUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      committeeName: z.string().optional(),
      expiryDate: z.string().optional(),
      members: z.any().optional(),
      chairperson: z.string().optional(),
      meetingFrequency: z.string().optional(),
      lastMeetingDate: z.string().optional(),
      nextMeetingDate: z.string().optional(),
      status: z.enum(["active", "dissolved"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(hseCommittees).set(data).where(eq(hseCommittees.id, id));
      return { success: true };
    }),

  // ---- Heat Stress Records ----
  heatStressList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(heatStressRecords.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(heatStressRecords.projectId, input.projectId));
      return db.select().from(heatStressRecords).where(and(...conditions));
    }),

  heatStressCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      date: z.string(),
      temperature: z.string().optional(),
      humidity: z.string().optional(),
      heatIndex: z.string().optional(),
      workRestRegime: z.string().optional(),
      breaksProvided: z.boolean().optional(),
      waterAvailable: z.boolean().optional(),
      shadeAvailable: z.boolean().optional(),
      incidentsReported: z.number().optional(),
      supervisorName: z.string().optional(),
      status: z.enum(["compliant", "non_compliant", "partial"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(heatStressRecords).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  heatStressUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      temperature: z.string().optional(),
      humidity: z.string().optional(),
      heatIndex: z.string().optional(),
      workRestRegime: z.string().optional(),
      breaksProvided: z.boolean().optional(),
      waterAvailable: z.boolean().optional(),
      shadeAvailable: z.boolean().optional(),
      incidentsReported: z.number().optional(),
      supervisorName: z.string().optional(),
      status: z.enum(["compliant", "non_compliant", "partial"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(heatStressRecords).set(data).where(eq(heatStressRecords.id, id));
      return { success: true };
    }),

  // ---- Engineering Saudization ----
  engineeringSaudizationList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(engineeringSaudization.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(engineeringSaudization.projectId, input.projectId));
      return db.select().from(engineeringSaudization).where(and(...conditions));
    }),

  engineeringSaudizationCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      saudiEngineerCount: z.number().optional(),
      totalEngineerCount: z.number().optional(),
      saudiRatio: z.string().optional(),
      requiredRatio: z.string().optional(),
      saudiSupervisorName: z.string().optional(),
      saudiSupervisorId: z.number().optional(),
      licenseNumber: z.string().optional(),
      licenseExpiryDate: z.string().optional(),
      shrhStatus: z.enum(["compliant", "non_compliant", "pending"]).optional(),
      lastAuditDate: z.string().optional(),
      nextAuditDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(engineeringSaudization).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  engineeringSaudizationUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      saudiEngineerCount: z.number().optional(),
      totalEngineerCount: z.number().optional(),
      saudiRatio: z.string().optional(),
      saudiSupervisorName: z.string().optional(),
      saudiSupervisorId: z.number().optional(),
      licenseNumber: z.string().optional(),
      licenseExpiryDate: z.string().optional(),
      shrhStatus: z.enum(["compliant", "non_compliant", "pending"]).optional(),
      lastAuditDate: z.string().optional(),
      nextAuditDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(engineeringSaudization).set(data).where(eq(engineeringSaudization.id, id));
      return { success: true };
    }),

  // ---- Safety Training ----
  safetyTrainingList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(safetyTraining.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(safetyTraining.projectId, input.projectId));
      return db.select().from(safetyTraining).where(and(...conditions));
    }),

  safetyTrainingCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      employeeId: z.number().optional(),
      trainingName: z.string(),
      trainingProvider: z.string().optional(),
      trainingDate: z.string().optional(),
      expiryDate: z.string().optional(),
      certificateNumber: z.string().optional(),
      certificateFile: z.string().optional(),
      trainingType: z.enum(["induction", "specialized", "refresher", "emergency"]).optional(),
      status: z.enum(["completed", "expired", "pending"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(safetyTraining).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  safetyTrainingUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      trainingProvider: z.string().optional(),
      trainingDate: z.string().optional(),
      expiryDate: z.string().optional(),
      certificateNumber: z.string().optional(),
      certificateFile: z.string().optional(),
      trainingType: z.enum(["induction", "specialized", "refresher", "emergency"]).optional(),
      status: z.enum(["completed", "expired", "pending"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(safetyTraining).set(data).where(eq(safetyTraining.id, id));
      return { success: true };
    }),

  // ---- PPE Issuance ----
  ppeIssuanceList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(ppeIssuance.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(ppeIssuance.projectId, input.projectId));
      return db.select().from(ppeIssuance).where(and(...conditions));
    }),

  ppeIssuanceCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      employeeId: z.number().optional(),
      ppeType: z.enum(["helmet", "vest", "gloves", "goggles", "harness", "earplug", "mask", "boots", "full_body"]),
      quantity: z.number().optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      issuedBy: z.string().optional(),
      condition_: z.string().optional(),
      returned: z.boolean().optional(),
      returnDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(ppeIssuance).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  ppeIssuanceUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      quantity: z.number().optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      issuedBy: z.string().optional(),
      condition_: z.string().optional(),
      returned: z.boolean().optional(),
      returnDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(ppeIssuance).set(data).where(eq(ppeIssuance.id, id));
      return { success: true };
    }),

  // ---- Equipment Schedule ----
  equipmentScheduleList: authedQuery
    .input(z.object({ projectId: z.number().optional(), equipmentId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(equipmentSchedule.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(equipmentSchedule.projectId, input.projectId));
      if (input?.equipmentId) conditions.push(eq(equipmentSchedule.equipmentId, input.equipmentId));
      return db.select().from(equipmentSchedule).where(and(...conditions));
    }),

  equipmentScheduleCreate: authedQuery
    .input(z.object({
      equipmentId: z.number(),
      projectId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      operatorName: z.string().optional(),
      purpose: z.string().optional(),
      status: z.enum(["scheduled", "in_use", "completed", "cancelled"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(equipmentSchedule).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  equipmentScheduleUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      operatorName: z.string().optional(),
      purpose: z.string().optional(),
      status: z.enum(["scheduled", "in_use", "completed", "cancelled"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(equipmentSchedule).set(data).where(eq(equipmentSchedule.id, id));
      return { success: true };
    }),

  // ---- Material Requirements ----
  materialRequirementList: authedQuery
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(materialRequirements.tenantId, ctx.user.tenantId!)];
      if (input?.projectId) conditions.push(eq(materialRequirements.projectId, input.projectId));
      return db.select().from(materialRequirements).where(and(...conditions));
    }),

  materialRequirementCreate: authedQuery
    .input(z.object({
      projectId: z.number(),
      wbsId: z.number().optional(),
      boqItemId: z.number().optional(),
      productId: z.number().optional(),
      materialName: z.string(),
      specification: z.string().optional(),
      requiredQuantity: z.string(),
      unit: z.string(),
      quantityOrdered: z.string().optional(),
      quantityReceived: z.string().optional(),
      quantityConsumed: z.string().optional(),
      requiredDate: z.string().optional(),
      deliveryDate: z.string().optional(),
      status: z.enum(["planned", "ordered", "partial", "received", "consumed"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(materialRequirements).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      return { id, success: true };
    }),

  materialRequirementUpdate: authedQuery
    .input(z.object({
      id: z.number(),
      quantityOrdered: z.string().optional(),
      quantityReceived: z.string().optional(),
      quantityConsumed: z.string().optional(),
      deliveryDate: z.string().optional(),
      status: z.enum(["planned", "ordered", "partial", "received", "consumed"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(materialRequirements).set(data).where(eq(materialRequirements.id, id));
      return { success: true };
    }),

  constructionStats: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const [activeProjects] = await db.select({ count: sql<number>`count(*)` }).from(constructionProjects).where(and(eq(constructionProjects.tenantId, tenantId), eq(constructionProjects.status, "active")));
      const [totalContractValue] = await db.select({ total: sql<number>`coalesce(sum(contract_value), 0)` }).from(constructionProjects).where(eq(constructionProjects.tenantId, tenantId));
      const [totalSubs] = await db.select({ count: sql<number>`count(*)` }).from(subcontractors).where(eq(subcontractors.tenantId, tenantId));
      const [totalWbs] = await db.select({ count: sql<number>`count(*)` }).from(wbsItems).where(eq(wbsItems.tenantId, tenantId));
      const [totalBoq] = await db.select({ count: sql<number>`count(*)` }).from(boqItems).where(eq(boqItems.tenantId, tenantId));
      const [activeContracts] = await db.select({ count: sql<number>`count(*)` }).from(constructionContracts).where(and(eq(constructionContracts.tenantId, tenantId), eq(constructionContracts.status, "active")));
      const [pendingVariations] = await db.select({ count: sql<number>`count(*)` }).from(variationOrders).where(and(eq(variationOrders.tenantId, tenantId), eq(variationOrders.status, "submitted")));
      return {
        activeProjects: activeProjects.count,
        totalContractValue: Number(totalContractValue.total),
        totalSubcontractors: totalSubs.count,
        totalWbsItems: totalWbs.count,
        totalBoqItems: totalBoq.count,
        activeContracts: activeContracts.count,
        pendingVariations: pendingVariations.count,
      };
    }),
});
