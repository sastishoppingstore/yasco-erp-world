import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  customers, salesQuotations, salesQuotationItems,
  salesOrders, salesOrderItems, invoices, invoiceItems,
  creditNotes, customerPayments, companySettings, auditLogs
} from "@db/schema";
import { eq, sql, and, like, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { onInvoiceCreated, onPaymentReceived } from "./lib/notifications/events";

function encodeZatcaTlv(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const buf = new Uint8Array(2 + valueBytes.length);
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
  const combined = Buffer.concat(parts.map((part) => Buffer.from(part)));
  return combined.toString("base64");
}

function buildSaudiInvoiceXml(input: {
  invoiceNumber: string;
  date: string;
  sellerName: string;
  vatNumber: string;
  crNumber?: string | null;
  currency: string;
  subTotal: string;
  taxAmount: string;
  totalAmount: string;
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${input.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${input.date}</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${input.currency}</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme><cbc:CompanyID>${input.vatNumber}</cbc:CompanyID></cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${input.sellerName}</cbc:RegistrationName>
        ${input.crNumber ? `<cbc:CompanyID>${input.crNumber}</cbc:CompanyID>` : ""}
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${input.currency}">${input.subTotal}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${input.currency}">${input.subTotal}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${input.currency}">${input.totalAmount}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${input.currency}">${input.totalAmount}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:TaxTotal><cbc:TaxAmount currencyID="${input.currency}">${input.taxAmount}</cbc:TaxAmount></cac:TaxTotal>
</Invoice>`;
}

function isSaudiCompany(settings: typeof companySettings.$inferSelect | undefined) {
  const country = (settings?.country || "").toLowerCase();
  return country.includes("saudi") || country.includes("ksa") || settings?.defaultCurrency === "SAR";
}

function isValidSaudiVatNumber(vatNumber: string) {
  const cleaned = vatNumber.replace(/\D/g, "");
  return /^3\d{13}3$/.test(cleaned);
}

export const salesRouter = createRouter({
  // Customers
  customerList: authedQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(customers.tenantId, tenantId)];
      if (input?.search) conditions.push(like(customers.name, `%${input.search}%`));
      return db.select().from(customers).where(and(...conditions)).orderBy(desc(customers.createdAt));
    }),

  customerGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      return db.query.customers.findFirst({
        where: and(eq(customers.tenantId, tenantId), eq(customers.id, input.id)),
      });
    }),

  customerCreate: authedQuery
    .input(z.object({
      code: z.string().optional(),
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      taxNumber: z.string().optional(),
      creditLimit: z.string().optional(),
      paymentTerms: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(customers).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        code: input.code || `CUST-${Date.now()}`,
      }).$returningId();
      return { id, success: true };
    }),

  quotationList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(salesQuotations.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(salesQuotations.status, input.status as any));
      if (input?.customerId) conditions.push(eq(salesQuotations.customerId, input.customerId));
      return db.select().from(salesQuotations).where(and(...conditions)).orderBy(desc(salesQuotations.createdAt));
    }),

  quotationCreate: authedQuery
    .input(z.object({
      quotationNumber: z.string(),
      customerId: z.number(),
      date: z.string(),
      expiryDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...quotationData } = input;
      const [{ id }] = await db.insert(salesQuotations).values({
        ...quotationData,
        tenantId: ctx.user.tenantId!,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(salesQuotationItems).values({ ...item, quotationId: id });
      }
      return { id, success: true };
    }),

  orderList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(salesOrders.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(salesOrders.status, input.status as any));
      if (input?.customerId) conditions.push(eq(salesOrders.customerId, input.customerId));
      return db.select().from(salesOrders).where(and(...conditions)).orderBy(desc(salesOrders.createdAt));
    }),

  orderCreate: authedQuery
    .input(z.object({
      orderNumber: z.string(),
      customerId: z.number(),
      date: z.string(),
      deliveryDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...orderData } = input;
      const [{ id }] = await db.insert(salesOrders).values({
        ...orderData,
        tenantId: ctx.user.tenantId!,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(salesOrderItems).values({ ...item, orderId: id });
      }
      return { id, success: true };
    }),

  invoiceList: authedQuery
    .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(invoices.tenantId, ctx.user.tenantId!)];
      if (input?.status) conditions.push(eq(invoices.status, input.status as any));
      if (input?.customerId) conditions.push(eq(invoices.customerId, input.customerId));
      return db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.createdAt));
    }),

  invoiceGet: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const invoice = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)),
      });
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, input.id));
      const customer = invoice ? await db.query.customers.findFirst({
        where: and(eq(customers.id, invoice.customerId), eq(customers.tenantId, tenantId)),
      }) : null;
      const company = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, tenantId),
      });
      return { invoice, items, customer, company };
    }),

  invoiceCreate: authedQuery
    .input(z.object({
      invoiceNumber: z.string(),
      invoiceType: z.enum(["standard", "simplified", "zatca"]).optional(),
      customerId: z.number(),
      date: z.string(),
      dueDate: z.string().optional(),
      subTotal: z.string(),
      taxAmount: z.string().optional(),
      taxPercent: z.string().optional(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number().optional(),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        taxPercent: z.string().optional(),
        totalAmount: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { items, ...invoiceData } = input;
      const tenantId = ctx.user.tenantId!;
      const settings = await db.query.companySettings.findFirst({
        where: eq(companySettings.tenantId, tenantId),
      });
      const saudiInvoice = isSaudiCompany(settings) || invoiceData.invoiceType === "zatca";
      const currency = settings?.defaultCurrency || (saudiInvoice ? "SAR" : "USD");
      const taxPercent = invoiceData.taxPercent || (settings?.vatRate ? String(settings.vatRate) : saudiInvoice ? "15" : "0");
      const taxAmount = invoiceData.taxAmount || "0";
      const invoiceType = saudiInvoice ? "zatca" : (invoiceData.invoiceType || "standard");
      const sellerName = settings?.companyName || settings?.companyNameAr || "";
      const vatNumber = settings?.taxNumber || "";
      if (saudiInvoice) {
        if (!sellerName.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saudi ZATCA invoices require company name in Settings before billing.",
          });
        }
        if (!isValidSaudiVatNumber(vatNumber)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saudi ZATCA invoices require a valid 15-digit VAT number that starts and ends with 3.",
          });
        }
      }
      const timestamp = new Date(`${invoiceData.date}T00:00:00.000Z`).toISOString();
      const zatcaQrCode = saudiInvoice
        ? buildZatcaQrPayload(sellerName, vatNumber, timestamp, invoiceData.totalAmount, taxAmount)
        : undefined;
      const zatcaXml = saudiInvoice
        ? buildSaudiInvoiceXml({
            invoiceNumber: invoiceData.invoiceNumber,
            date: invoiceData.date,
            sellerName,
            vatNumber,
            crNumber: settings?.crNumber,
            currency,
            subTotal: invoiceData.subTotal,
            taxAmount,
            totalAmount: invoiceData.totalAmount,
          })
        : undefined;
      const [{ id }] = await db.insert(invoices).values({
        ...invoiceData,
        tenantId,
        invoiceType,
        taxPercent,
        taxAmount,
        zatcaQrCode,
        zatcaXml,
        zatcaStatus: saudiInvoice ? "pending" : undefined,
        terms: settings?.invoiceTerms,
        balanceDue: invoiceData.totalAmount,
        status: "draft",
      }).$returningId();
      for (const item of items) {
        await db.insert(invoiceItems).values({ ...item, invoiceId: id });
      }
      await db.insert(auditLogs).values({
        tenantId,
        userId: ctx.user.id,
        action: "invoice_create",
        entityType: "invoice",
        entityId: id,
        newValues: {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceType,
          customerId: invoiceData.customerId,
          totalAmount: invoiceData.totalAmount,
          taxAmount,
          taxPercent,
          saudiInvoice,
          zatcaStatus: saudiInvoice ? "pending" : null,
        },
        createdAt: new Date(),
      });

      onInvoiceCreated(tenantId, id).catch((err) =>
        console.error("[notify] onInvoiceCreated error:", err)
      );

      return { id, success: true };
    }),

  invoiceUpdateStatus: authedQuery
    .input(z.object({ id: z.number(), status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(invoices).set({ status: input.status }).where(eq(invoices.id, input.id));
      return { success: true };
    }),

  // Credit Notes
  creditNoteList: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      return db.select().from(creditNotes).where(eq(creditNotes.tenantId, ctx.user.tenantId!));
    }),

  creditNoteCreate: authedQuery
    .input(z.object({
      creditNoteNumber: z.string(),
      customerId: z.number(),
      invoiceId: z.number().optional(),
      date: z.string(),
      amount: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(creditNotes).values({
        ...input,
        tenantId: ctx.user.tenantId!,
        invoiceId: input.invoiceId || 0,
        status: "draft",
      }).$returningId();
      return { id, success: true };
    }),

  // Customer Payments
  paymentList: authedQuery
    .input(z.object({
      customerId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const conditions = [eq(customerPayments.tenantId, tenantId)];
      if (input?.customerId) conditions.push(eq(customerPayments.customerId, input.customerId));
      return db.select().from(customerPayments).where(and(...conditions));
    }),

  paymentCreate: authedQuery
    .input(z.object({
      paymentNumber: z.string(),
      customerId: z.number(),
      invoiceId: z.number().optional(),
      date: z.string(),
      amount: z.string(),
      paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "card", "online"]),
      reference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [{ id }] = await db.insert(customerPayments).values({ ...input, tenantId: ctx.user.tenantId! }).$returningId();
      if (input.invoiceId) {
        onPaymentReceived(ctx.user.tenantId!, input.customerId, input.invoiceId, input.amount).catch((err) =>
          console.error("[notify] onPaymentReceived error:", err)
        );
      }
      return { id, success: true };
    }),
});
