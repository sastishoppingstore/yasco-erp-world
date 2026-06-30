import { z } from "zod";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import {
  paymentCertificates,
  certificateApprovals,
  progressBilling,
  constructionProjects,
} from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const constructionPaymentRouter = createRouter({
  /**
   * Generate Payment Certificate from Progress Billing
   * Quick Win #1
   */
  generateCertificate: authedMutation
    .input(
      z.object({
        progressBillingId: z.number(),
        projectId: z.number(),
        retentionPercent: z.number().optional().default(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        // Get progress billing data
        const [billing] = await db
          .select()
          .from(progressBilling)
          .where(
            and(
              eq(progressBilling.id, input.progressBillingId),
              eq(progressBilling.tenantId, ctx.user.tenantId!)
            )
          );

        if (!billing) {
          throw new Error("Progress billing not found");
        }

        // Calculate retention
        const billingAmount = parseFloat(billing.billingAmount!);
        const retentionAmount = (billingAmount * input.retentionPercent) / 100;
        const paymentAmount = billingAmount - retentionAmount;

        // Generate certificate number
        const certNum = `CERT-${input.projectId}-${nanoid(8).toUpperCase()}`;

        // Calculate dates
        const issuedDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

        // Insert certificate
        const [certificate] = await db
          .insert(paymentCertificates)
          .values({
            tenantId: ctx.user.tenantId!,
            progressBillingId: input.progressBillingId,
            certificateNumber: certNum,
            certificateAmount: billingAmount.toString(),
            retentionPercent: input.retentionPercent.toString(),
            retentionAmount: retentionAmount.toString(),
            paymentAmount: paymentAmount.toString(),
            issuedDate: issuedDate,
            dueDate: dueDate,
            status: "draft",
            createdBy: ctx.user.id!,
            createdAt: issuedDate,
            updatedAt: issuedDate,
          })
          .$returningId();

        return {
          success: true,
          certificateId: certificate.id,
          certificateNumber: certNum,
          message: "Payment certificate generated successfully",
        };
      } catch (error) {
        throw new Error(`Failed to generate certificate: ${error}`);
      }
    }),

  /**
   * Approve Certificate (Multi-step workflow)
   */
  approveCertificate: authedMutation
    .input(
      z.object({
        certificateId: z.number(),
        approverRole: z.enum(["pm", "finance", "principal", "client"]),
        comments: z.string().optional(),
        signature: z.string().optional(), // Base64 encoded
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        // Get certificate
        const [cert] = await db
          .select()
          .from(paymentCertificates)
          .where(
            and(
              eq(paymentCertificates.id, input.certificateId),
              eq(paymentCertificates.tenantId, ctx.user.tenantId!)
            )
          );

        if (!cert) {
          throw new Error("Certificate not found");
        }

        // Add approval
        const approvalOrder = 1; // Simplified - in production, calculate based on role hierarchy

        const [approval] = await db
          .insert(certificateApprovals)
          .values({
            certificateId: input.certificateId,
            approverRole: input.approverRole,
            approverUserId: ctx.user.id!,
            approvalOrder: approvalOrder,
            approvalStatus: "approved",
            comments: input.comments,
            signatureBlob: input.signature,
            signatureDate: new Date(),
          })
          .$returningId();

        // Check if all required approvals are complete
        const allApprovals = await db
          .select()
          .from(certificateApprovals)
          .where(eq(certificateApprovals.certificateId, input.certificateId));

        const allApproved = allApprovals.every(
          (a) => a.approvalStatus === "approved"
        );

        let newStatus = "pending_approval";
        if (allApproved && approvalOrder === allApprovals.length) {
          newStatus = "approved";
        }

        // Update certificate status
        await db
          .update(paymentCertificates)
          .set({
            status: newStatus as any,
            updatedAt: new Date(),
          })
          .where(eq(paymentCertificates.id, input.certificateId));

        return {
          success: true,
          certificateId: input.certificateId,
          newStatus: newStatus,
          message: `Certificate approved by ${input.approverRole}`,
        };
      } catch (error) {
        throw new Error(`Failed to approve certificate: ${error}`);
      }
    }),

  /**
   * List Payment Certificates
   */
  listCertificates: authedQuery
    .input(
      z.object({
        projectId: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const conditions = [eq(paymentCertificates.tenantId, ctx.user.tenantId!)];

      if (input.projectId) {
        conditions.push(eq(paymentCertificates.id, input.projectId));
      }

      if (input.status) {
        conditions.push(eq(paymentCertificates.status, input.status as any));
      }

      const certificates = await db
        .select()
        .from(paymentCertificates)
        .where(and(...conditions))
        .orderBy(desc(paymentCertificates.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return {
        success: true,
        data: certificates,
        total: certificates.length,
      };
    }),

  /**
   * Export Certificate to PDF with ZATCA QR
   */
  exportCertificatePdf: authedQuery
    .input(z.object({ certificateId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const [cert] = await db
        .select()
        .from(paymentCertificates)
        .where(
          and(
            eq(paymentCertificates.id, input.certificateId),
            eq(paymentCertificates.tenantId, ctx.user.tenantId!)
          )
        );

      if (!cert) {
        throw new Error("Certificate not found");
      }

      // In production, use jsPDF + jspdf-autotable
      // For now, return certificate data for client-side PDF generation
      return {
        success: true,
        certificateData: cert,
        message: "Use client-side PDF generation (jsPDF)",
      };
    }),

  /**
   * Mark Certificate as Paid
   */
  markAsPaid: authedMutation
    .input(
      z.object({
        certificateId: z.number(),
        paidDate: z.date(),
        paymentReference: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      try {
        await db
          .update(paymentCertificates)
          .set({
            status: "paid",
            paidDate: input.paidDate,
            updatedAt: new Date(),
            notes: input.paymentReference
              ? `Paid: ${input.paymentReference}`
              : undefined,
          })
          .where(
            and(
              eq(paymentCertificates.id, input.certificateId),
              eq(paymentCertificates.tenantId, ctx.user.tenantId!)
            )
          );

        return {
          success: true,
          message: "Certificate marked as paid",
        };
      } catch (error) {
        throw new Error(`Failed to mark as paid: ${error}`);
      }
    }),

  /**
   * Get Certificate Details with Approvals
   */
  getCertificateDetails: authedQuery
    .input(z.object({ certificateId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const [cert] = await db
        .select()
        .from(paymentCertificates)
        .where(
          and(
            eq(paymentCertificates.id, input.certificateId),
            eq(paymentCertificates.tenantId, ctx.user.tenantId!)
          )
        );

      if (!cert) {
        throw new Error("Certificate not found");
      }

      const approvals = await db
        .select()
        .from(certificateApprovals)
        .where(eq(certificateApprovals.certificateId, input.certificateId));

      return {
        success: true,
        certificate: cert,
        approvals: approvals,
      };
    }),

  /**
   * Get Payment Dashboard Summary
   */
  getPaymentSummary: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const certificates = await db
        .select()
        .from(paymentCertificates)
        .where(
          and(
            eq(paymentCertificates.id, input.projectId),
            eq(paymentCertificates.tenantId, ctx.user.tenantId!)
          )
        );

      const totalCertificates = certificates.length;
      const paidCertificates = certificates.filter(
        (c) => c.status === "paid"
      ).length;
      const pendingCertificates = certificates.filter(
        (c) => c.status === "pending_approval"
      ).length;

      const totalAmount = certificates.reduce(
        (sum, c) => sum + parseFloat(c.certificateAmount || "0"),
        0
      );
      const paidAmount = certificates
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + parseFloat(c.paymentAmount || "0"), 0);

      return {
        success: true,
        summary: {
          totalCertificates,
          paidCertificates,
          pendingCertificates,
          totalAmount,
          paidAmount,
          pendingAmount: totalAmount - paidAmount,
        },
      };
    }),
});
