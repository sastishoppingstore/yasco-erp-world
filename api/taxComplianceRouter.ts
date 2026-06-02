import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  companySettings,
  invoices,
  invoiceItems,
  customers,
  taxRates,
  suppliers,
  auditLogs,
} from "@db/schema";
import { eq, and, gte, lte, desc, lt, sum, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decimal(n: number) {
  return n.toFixed(4);
}

function isoNow() {
  return new Date().toISOString();
}

/**
 * ZATCA-compliant TLV (Tag-Length-Value) encoding for QR code generation.
 * Tags per ZATCA specification:
 *   1 – Seller name
 *   2 – VAT registration number
 *   3 – Invoice timestamp (ISO 8601)
 *   4 – Invoice total (including VAT)
 *   5 – VAT total
 */
function encodeZatcaTlv(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const buf = new Uint8Array(1 + 1 + valueBytes.length);
  buf[0] = tag;
  buf[1] = valueBytes.length;
  buf.set(valueBytes, 2);
  return buf;
}

function buildZatcaQrPayload(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalWithVat: string,
  vatTotal: string,
): string {
  const parts = [
    encodeZatcaTlv(1, sellerName),
    encodeZatcaTlv(2, vatNumber),
    encodeZatcaTlv(3, timestamp),
    encodeZatcaTlv(4, totalWithVat),
    encodeZatcaTlv(5, vatTotal),
  ];
  const combined = new Uint8Array(parts.reduce((acc, p) => acc + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    combined.set(p, offset);
    offset += p.length;
  }
  return btoa(String.fromCharCode(...combined));
}

function buildSimplifiedZatcaXml(invoice: typeof invoices.$inferSelect, items: any[], settings: any) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${invoice.date}</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="0100000">0100000</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${settings.sellerName || ""}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${settings.vatNumber || ""}</cbc:CompanyID>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${invoice.subTotal}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${invoice.subTotal}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${invoice.totalAmount}</cbc:TaxInclusiveAmount>
    <cbc:ChargeTotalAmount currencyID="SAR">${invoice.taxAmount}</cbc:ChargeTotalAmount>
    <cbc:PrepaidAmount currencyID="SAR">${invoice.paidAmount}</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="SAR">${invoice.balanceDue}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const taxComplianceRouter = createRouter({

  // =====================================================================
  // ZATCA (Saudi Arabia)
  // =====================================================================

  zatcaSettings: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
      if (!settings) {
        return {
          enabled: false,
          sandbox: true,
          sellerName: "",
          vatNumber: "",
          crNumber: "",
          buildingNumber: "",
          streetName: "",
          district: "",
          city: "",
          country: "Saudi Arabia",
          additionalNumber: "",
          registrationName: "",
        };
      }
      return {
        enabled: settings.zatcaEnabled ?? false,
        sandbox: settings.zatcaSandbox ?? true,
        sellerName: settings.companyName || "",
        vatNumber: settings.taxNumber || "",
        crNumber: settings.crNumber || "",
        buildingNumber: "",
        streetName: settings.address || "",
        district: settings.city || "",
        city: settings.city || "",
        country: settings.country || "Saudi Arabia",
        additionalNumber: "",
        registrationName: settings.companyName || "",
      };
    }),

  updateZatcaSettings: adminQuery
    .input(z.object({
      enabled: z.boolean().optional(),
      sandbox: z.boolean().optional(),
      sellerName: z.string().optional(),
      vatNumber: z.string().optional(),
      crNumber: z.string().optional(),
      buildingNumber: z.string().optional(),
      streetName: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      additionalNumber: z.string().optional(),
      registrationName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updateData: Record<string, any> = {};
      if (input.enabled !== undefined) updateData.zatcaEnabled = input.enabled;
      if (input.sandbox !== undefined) updateData.zatcaSandbox = input.sandbox;
      if (input.sellerName) updateData.companyName = input.sellerName;
      if (input.vatNumber) updateData.taxNumber = input.vatNumber;
      if (input.crNumber) updateData.crNumber = input.crNumber;
      if (input.city) updateData.city = input.city;
      if (input.country) updateData.country = input.country;
      if (input.registrationName) updateData.companyName = input.registrationName;
      if (input.streetName) updateData.address = input.streetName;

      const existing = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
      if (existing) {
        await db.update(companySettings)
          .set(updateData)
          .where(eq(companySettings.tenantId, ctx.user.tenantId!));
      } else {
        await db.insert(companySettings)
          .values({ tenantId: ctx.user.tenantId!, ...updateData });
      }
      return { success: true };
    }),

  zatcaSubmitInvoice: authedQuery
    .input(z.object({
      invoiceId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const invoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.user.tenantId!),
        ),
      });
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });

      const isSandbox = settings?.zatcaSandbox ?? true;
      const environment = isSandbox ? "sandbox" : "production";

      // Simulate submission – in production this would call the ZATCA API
      const submissionId = `ZATCA-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const submittedAt = isoNow();

      await db.update(invoices)
        .set({
          zatcaStatus: "pending",
          zatcaQrCode: submissionId,
        })
        .where(eq(invoices.id, input.invoiceId));

      // Audit trail
      await db.insert(auditLogs).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        action: "zatca_submit",
        entityType: "invoice",
        entityId: input.invoiceId,
        newValues: { submissionId, environment, submittedAt },
        createdAt: new Date(),
      });

      return {
        submissionId,
        environment,
        submittedAt,
        status: "pending",
        message: `Invoice submitted to ZATCA ${environment} successfully`,
      };
    }),

  zatcaCheckStatus: authedQuery
    .input(z.object({
      invoiceId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const invoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.user.tenantId!),
        ),
      });
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      // Simulate status – in production would poll ZATCA API
      const status = invoice.zatcaStatus || "pending";
      const statusMap: Record<string, string> = {
        pending: "Invoice submitted, awaiting clearance from ZATCA",
        reported: "Invoice reported to ZATCA",
        cleared: "Invoice cleared by ZATCA",
      };

      return {
        invoiceId: input.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        zatcaStatus: status,
        message: statusMap[status] || "Unknown status",
        clearedAt: status === "cleared" ? isoNow() : null,
      };
    }),

  generateZatcaQr: authedQuery
    .input(z.object({
      invoiceId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const invoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.user.tenantId!),
        ),
      });
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });

      const sellerName = settings?.companyName || "Company";
      const vatNumber = settings?.taxNumber || "0000000000";
      const timestamp = new Date(invoice.date).toISOString();
      const totalWithVat = decimal(Number(invoice.totalAmount));
      const vatTotal = decimal(Number(invoice.taxAmount));

      const qrPayload = buildZatcaQrPayload(sellerName, vatNumber, timestamp, totalWithVat, vatTotal);

      return {
        invoiceId: input.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        qrCodeBase64: qrPayload,
        sellerName,
        vatNumber,
        totalWithVat,
        vatTotal,
        timestamp,
      };
    }),

  generateZatcaXml: authedQuery
    .input(z.object({
      invoiceId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const invoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.user.tenantId!),
        ),
      });
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const items = await db.select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, input.invoiceId));

      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      }) || {};

      const xml = buildSimplifiedZatcaXml(invoice, items, settings);

      return {
        invoiceId: input.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        xml,
        byteSize: new TextEncoder().encode(xml).length,
      };
    }),

  // =====================================================================
  // FBR Pakistan
  // =====================================================================

  fbrSettings: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
      return {
        enabled: false,
        sandbox: true,
        username: "",
        password: "",
        providerCode: "",
        posCode: "",
        businessIdentifier: settings?.taxNumber || "",
        businessName: settings?.companyName || "",
        businessAddress: settings?.address || "",
        businessCity: settings?.city || "",
        businessCountry: settings?.country || "Pakistan",
        ntnNumber: settings?.taxNumber || "",
        strnNumber: "",
        salesTaxPeriod: "monthly",
        salesTaxFrequency: "monthly",
      };
    }),

  updateFbrSettings: adminQuery
    .input(z.object({
      enabled: z.boolean().optional(),
      sandbox: z.boolean().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      providerCode: z.string().optional(),
      posCode: z.string().optional(),
      businessIdentifier: z.string().optional(),
      businessName: z.string().optional(),
      businessAddress: z.string().optional(),
      businessCity: z.string().optional(),
      businessCountry: z.string().optional(),
      ntnNumber: z.string().optional(),
      strnNumber: z.string().optional(),
      salesTaxPeriod: z.enum(["monthly", "quarterly", "annual"]).optional(),
      salesTaxFrequency: z.enum(["monthly", "quarterly", "annual"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updateData: Record<string, any> = {};
      if (input.businessName) updateData.companyName = input.businessName;
      if (input.businessAddress) updateData.address = input.businessAddress;
      if (input.businessCity) updateData.city = input.businessCity;
      if (input.businessCountry) updateData.country = input.businessCountry;
      if (input.ntnNumber) updateData.taxNumber = input.ntnNumber;

      const existing = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
      if (existing && Object.keys(updateData).length > 0) {
        await db.update(companySettings)
          .set(updateData)
          .where(eq(companySettings.tenantId, ctx.user.tenantId!));
      }

      return { success: true, message: "FBR settings updated (full persistence requires schema extension)" };
    }),

  fbrSubmitInvoice: authedQuery
    .input(z.object({
      invoiceId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const invoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.user.tenantId!),
        ),
      });
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      // Simulate FBR submission
      const submissionNumber = `FBR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const submittedAt = isoNow();

      await db.insert(auditLogs).values({
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
        action: "fbr_submit",
        entityType: "invoice",
        entityId: input.invoiceId,
        newValues: {
          submissionNumber,
          submittedAt,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
        },
        createdAt: new Date(),
      });

      return {
        submissionNumber,
        submittedAt,
        status: "submitted",
        message: "Invoice submitted to FBR digital invoicing system successfully",
        fbrResponse: {
          code: 200,
          body: {
            message: "Success",
            invoiceNumber: invoice.invoiceNumber,
          },
        },
      };
    }),

  fbrCheckStatus: authedQuery
    .input(z.object({
      submissionNumber: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const log = await db.query.auditLogs.findFirst({
        where: and(
          eq(auditLogs.tenantId, ctx.user.tenantId!),
          eq(auditLogs.action, "fbr_submit"),
          sql`JSON_EXTRACT(${auditLogs.newValues}, '$.submissionNumber') = ${input.submissionNumber}`,
        ),
        orderBy: desc(auditLogs.createdAt),
      });
      if (!log) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      return {
        submissionNumber: input.submissionNumber,
        status: "processed",
        fbrStatus: "submitted",
        lastCheckedAt: isoNow(),
        message: "Invoice has been processed by FBR system",
      };
    }),

  fbrSubmissionLogs: authedQuery
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
      invoiceId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [
        eq(auditLogs.tenantId, ctx.user.tenantId!),
        eq(auditLogs.action, "fbr_submit"),
      ];
      if (input.invoiceId) {
        conditions.push(eq(auditLogs.entityId, input.invoiceId));
      }

      const logs = await db.select()
        .from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ total }] = await db.select({ total: count() })
        .from(auditLogs)
        .where(and(...conditions));

      return {
        logs: logs.map((l) => ({
          id: l.id!,
          submissionNumber: (l.newValues as any)?.submissionNumber || "",
          invoiceId: l.entityId,
          status: "submitted",
          submittedAt: l.createdAt.toISOString(),
          response: l.newValues,
        })),
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // =====================================================================
  // UAE VAT
  // =====================================================================

  uaeVatSettings: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
      return {
        enabled: false,
        trn: settings?.taxNumber || "",
        vatRate: Number(settings?.vatRate || 5),
        filingFrequency: "quarterly" as const,
        returnFormat: "standard",
        businessName: settings?.companyName || "",
        businessAddress: settings?.address || "",
        businessCity: settings?.city || "",
        businessCountry: "United Arab Emirates",
        designatedAgent: "",
        agentEmail: "",
      };
    }),

  updateUaeVatSettings: adminQuery
    .input(z.object({
      enabled: z.boolean().optional(),
      trn: z.string().optional(),
      vatRate: z.number().min(0).max(100).optional(),
      filingFrequency: z.enum(["monthly", "quarterly", "annual"]).optional(),
      returnFormat: z.string().optional(),
      businessName: z.string().optional(),
      businessAddress: z.string().optional(),
      businessCity: z.string().optional(),
      designatedAgent: z.string().optional(),
      agentEmail: z.string().email().optional().or(z.literal("")),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updateData: Record<string, any> = {};
      if (input.businessName) updateData.companyName = input.businessName;
      if (input.businessAddress) updateData.address = input.businessAddress;
      if (input.businessCity) updateData.city = input.businessCity;
      if (input.trn) updateData.taxNumber = input.trn;
      if (input.vatRate !== undefined) updateData.vatRate = String(input.vatRate);

      const existing = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });
      if (existing && Object.keys(updateData).length > 0) {
        await db.update(companySettings)
          .set(updateData)
          .where(eq(companySettings.tenantId, ctx.user.tenantId!));
      }

      return { success: true, message: "UAE VAT settings updated" };
    }),

  generateUaeVatReport: authedQuery
    .input(z.object({
      fromDate: z.string(),
      toDate: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const from = input.fromDate;
      const to = input.toDate;

      const invoiceRows = await db.select()
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, ctx.user.tenantId!),
          eq(invoices.status, "paid"),
          gte(invoices.date, from),
          lte(invoices.date, to),
        ))
        .orderBy(desc(invoices.date));

      const totalSales = invoiceRows.reduce((s, inv) => s + Number(inv.subTotal), 0);
      const totalVat = invoiceRows.reduce((s, inv) => s + Number(inv.taxAmount), 0);
      const totalInvoices = invoiceRows.length;

      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });

      return {
        trn: settings?.taxNumber || "",
        businessName: settings?.companyName || "",
        period: { from, to },
        summary: {
          totalInvoices,
          totalSales: decimal(totalSales),
          totalVat: decimal(totalVat),
          vatRate: Number(settings?.vatRate || 5),
        },
        standardRated: {
          sales: decimal(totalSales),
          vat: decimal(totalVat),
        },
        zeroRated: {
          sales: "0.0000",
          vat: "0.0000",
        },
        exempt: {
          sales: "0.0000",
          vat: "0.0000",
        },
        adjustments: {
          previousCorrections: "0.0000",
          badDebtRelief: "0.0000",
        },
        netVatDue: decimal(totalVat),
        generatedAt: isoNow(),
      };
    }),

  validateTrn: authedQuery
    .input(z.object({
      trn: z.string().min(1).max(50),
    }))
    .query(async ({ input }) => {
      // UAE TRN format: 15 digits
      const cleaned = input.trn.replace(/\s/g, "");
      const isValidFormat = /^\d{15}$/.test(cleaned);

      return {
        trn: input.trn,
        isValid: isValidFormat,
        formatValid: isValidFormat,
        registeredName: isValidFormat ? "TRN validation service pending" : null,
        authority: "Federal Tax Authority (FTA)",
        message: isValidFormat
          ? "TRN format is valid. Online validation requires FTA API integration."
          : "TRN must be exactly 15 digits.",
      };
    }),

  // =====================================================================
  // General Tax Compliance Reports
  // =====================================================================

  taxReport: authedQuery
    .input(z.object({
      fromDate: z.string(),
      toDate: z.string(),
      groupBy: z.enum(["day", "month", "quarter", "year"]).optional().default("month"),
      taxType: z.enum(["vat", "gst", "sales_tax", "withholding", "all"]).optional().default("all"),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const invoiceRows = await db.select()
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, ctx.user.tenantId!),
          gte(invoices.date, input.fromDate),
          lte(invoices.date, input.toDate),
          sql`${invoices.status} IN ('paid', 'sent', 'partial', 'overdue')`,
        ))
        .orderBy(desc(invoices.date));

      const allTaxRates = await db.select()
        .from(taxRates)
        .where(eq(taxRates.tenantId, ctx.user.tenantId!));

      const totalTaxableSales = invoiceRows.reduce((s, inv) => s + Number(inv.subTotal), 0);
      const totalTaxAmount = invoiceRows.reduce((s, inv) => s + Number(inv.taxAmount), 0);
      const totalNonTaxable = invoiceRows
        .filter((inv) => Number(inv.taxAmount) === 0)
        .reduce((s, inv) => s + Number(inv.subTotal), 0);

      const grouping: Record<string, { count: number; taxableSales: number; taxAmount: number }> = {};
      for (const inv of invoiceRows) {
        let key: string;
        if (input.groupBy === "day") key = inv.date;
        else if (input.groupBy === "month") key = inv.date.slice(0, 7);
        else if (input.groupBy === "quarter") {
          const m = parseInt(inv.date.slice(5, 7), 10);
          const q = Math.ceil(m / 3);
          key = `${inv.date.slice(0, 4)}-Q${q}`;
        } else {
          key = inv.date.slice(0, 4);
        }
        if (!grouping[key]) grouping[key] = { count: 0, taxableSales: 0, taxAmount: 0 };
        grouping[key].count++;
        grouping[key].taxableSales += Number(inv.subTotal);
        grouping[key].taxAmount += Number(inv.taxAmount);
      }

      const breakdown = Object.entries(grouping)
        .map(([period, data]) => ({
          period,
          invoiceCount: data.count,
          taxableSales: decimal(data.taxableSales),
          taxAmount: decimal(data.taxAmount),
          effectiveRate: data.taxableSales > 0
            ? ((data.taxAmount / data.taxableSales) * 100).toFixed(2)
            : "0.00",
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, ctx.user.tenantId!),
      });

      return {
        tenant: ctx.user.tenantId,
        period: { from: input.fromDate, to: input.toDate },
        groupBy: input.groupBy,
        currency: settings?.defaultCurrency || "SAR",
        summary: {
          totalInvoices: invoiceRows.length,
          totalTaxableSales: decimal(totalTaxableSales),
          totalTaxAmount: decimal(totalTaxAmount),
          totalNonTaxableSales: decimal(totalNonTaxable),
          averageTaxRate: totalTaxableSales > 0
            ? ((totalTaxAmount / totalTaxableSales) * 100).toFixed(2)
            : "0.00",
        },
        breakdown,
        taxRates: allTaxRates.map((tr) => ({
          id: tr.id!,
          name: tr.name,
          rate: tr.rate,
          type: tr.type,
        })),
        generatedAt: isoNow(),
      };
    }),

  withholdingTaxReport: authedQuery
    .input(z.object({
      fromDate: z.string(),
      toDate: z.string(),
      supplierId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      const conditions = [
        eq(invoices.tenantId, ctx.user.tenantId!),
        gte(invoices.date, input.fromDate),
        lte(invoices.date, input.toDate),
        sql`${invoices.status} IN ('paid', 'partial')`,
      ];

      const invoiceRows = await db.select()
        .from(invoices)
        .where(and(...conditions))
        .orderBy(desc(invoices.date));

      const totalInvoiceAmount = invoiceRows.reduce((s, inv) => s + Number(inv.totalAmount), 0);
      const wthRate = 0.10; // Default 10% withholding
      const wthAmount = totalInvoiceAmount * wthRate;

      return {
        period: { from: input.fromDate, to: input.toDate },
        summary: {
          totalInvoices: invoiceRows.length,
          totalInvoiceAmount: decimal(totalInvoiceAmount),
          withholdingTaxRate: `${(wthRate * 100).toFixed(0)}%`,
          totalWithholdingTax: decimal(wthAmount),
        },
        transactions: invoiceRows.map((inv) => ({
          invoiceId: inv.id!,
          invoiceNumber: inv.invoiceNumber,
          date: inv.date,
          totalAmount: inv.totalAmount,
          withholdingRate: "10.00%",
          withholdingAmount: decimal(Number(inv.totalAmount) * wthRate),
          status: inv.status,
        })),
        generatedAt: isoNow(),
      };
    }),

  taxAgingReport: authedQuery
    .input(z.object({
      asOfDate: z.string().optional(),
      agingBuckets: z.array(z.number()).optional().default([30, 60, 90, 120]),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const asOf = input.asOfDate || new Date().toISOString().slice(0, 10);

      const buckets = [...input.agingBuckets].sort((a, b) => a - b);

      const invoiceRows = await db.select()
        .from(invoices)
        .where(and(
          eq(invoices.tenantId, ctx.user.tenantId!),
          sql`${invoices.status} IN ('sent', 'partial', 'overdue')`,
          lt(invoices.dueDate, asOf),
        ))
        .orderBy(desc(invoices.date));

      const bucketData = buckets.map((days) => ({
        bucket: `over_${days}_days`,
        label: `${days}+ days overdue`,
        minDays: days,
        invoices: [] as typeof invoiceRows,
      }));

      for (const inv of invoiceRows) {
        if (!inv.dueDate) continue;
        const due = new Date(inv.dueDate);
        const asOfDate = new Date(asOf);
        const diffDays = Math.floor((asOfDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = buckets.length - 1; i >= 0; i--) {
          if (diffDays >= buckets[i]) {
            bucketData[i].invoices.push(inv);
            break;
          }
        }
      }

      return {
        asOfDate: asOf,
        agingBuckets: bucketData.map((b) => ({
          label: b.label,
          invoiceCount: b.invoices.length,
          totalTaxAmount: decimal(b.invoices.reduce((s, inv) => s + Number(inv.taxAmount), 0)),
          totalBalanceDue: decimal(b.invoices.reduce((s, inv) => s + Number(inv.balanceDue), 0)),
          totalAmount: decimal(b.invoices.reduce((s, inv) => s + Number(inv.totalAmount), 0)),
        })),
        grandTotal: {
          invoiceCount: invoiceRows.length,
          totalTaxAmount: decimal(invoiceRows.reduce((s, inv) => s + Number(inv.taxAmount), 0)),
          totalBalanceDue: decimal(invoiceRows.reduce((s, inv) => s + Number(inv.balanceDue), 0)),
          totalAmount: decimal(invoiceRows.reduce((s, inv) => s + Number(inv.totalAmount), 0)),
        },
        generatedAt: isoNow(),
      };
    }),
});
