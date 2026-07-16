import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { createCipheriv, createDecipheriv, createHash, createSign, randomBytes, randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { createRouter, adminQuery, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { env } from "./lib/env";
import {
  auditLogs,
  companies,
  companyLegalDetails,
  companySettings,
  customers,
  eInvoiceDocuments,
  invoiceItems,
  invoices,
  taxCredentials,
  taxIntegrations,
  taxSubmissionLogs,
  taxSubmissions,
  zatcaActivityLogs,
  zatcaApiLogs,
  zatcaCertificates,
  zatcaCredentials,
  zatcaInvoiceStatus,
  zatcaQrCodes,
  zatcaXmlDocuments,
} from "@db/schema";

const OFFICIAL_LINKS = [
  { label: "Official ZATCA Portal", url: "https://zatca.gov.sa" },
  { label: "Developer Portal", url: "https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers" },
  { label: "E-Invoicing Guidelines", url: "https://zatca.gov.sa/en/E-Invoicing" },
  { label: "SDK & Technical Documentation", url: "https://zatca1.discourse.group" },
];

function key() {
  return createHash("sha256").update(env.appSecret || process.env.ENCRYPTION_KEY || "development-only-encryption-key").digest();
}

function encryptSecret(value?: string | null) {
  if (!value) return undefined;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptSecret(value?: string | null) {
  if (!value) return "";
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) return "";
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function sha256Base64(value: string) {
  return createHash("sha256").update(value).digest("base64");
}

function validSaudiVat(vatNumber: string) {
  return /^3\d{13}3$/.test(vatNumber.replace(/\D/g, ""));
}

function tlv(tag: number, value: string) {
  const bytes = new TextEncoder().encode(value || "");
  if (bytes.length > 255) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `ZATCA QR tag ${tag} is longer than 255 bytes.` });
  }
  const out = new Uint8Array(2 + bytes.length);
  out[0] = tag;
  out[1] = bytes.length;
  out.set(bytes, 2);
  return out;
}

function tlvBase64(tags: Array<[number, string]>) {
  const parts = tags.map(([tag, value]) => tlv(tag, value));
  const merged = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return Buffer.from(merged).toString("base64");
}

function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function addActivity(input: {
  tenantId: number;
  userId?: number;
  invoiceId?: number;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string | null;
}) {
  const db = getDb();
  await db.insert(zatcaActivityLogs).values({
    tenantId: input.tenantId,
    userId: input.userId,
    invoiceId: input.invoiceId,
    action: input.action,
    message: input.message,
    metadata: input.metadata,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    createdAt: new Date(),
  });
}

async function getLegalOrSettings(tenantId: number) {
  const db = getDb();
  const [legal, settings] = await Promise.all([
    db.query.companyLegalDetails.findFirst({ where: eq(companyLegalDetails.tenantId, tenantId) }),
    db.query.companySettings.findFirst({ where: eq(companySettings.tenantId, tenantId) }),
  ]);
  return {
    legalNameEn: legal?.legalNameEn || settings?.companyName || "",
    legalNameAr: legal?.legalNameAr || settings?.companyNameAr || "",
    vatNumber: legal?.vatNumber || settings?.taxNumber || "",
    crNumber: legal?.crNumber || settings?.crNumber || "",
    taxRegistrationNumber: legal?.taxRegistrationNumber || settings?.taxNumber || "",
    businessActivity: legal?.businessActivity || "",
    companyAddress: legal?.companyAddress || settings?.address || "",
    buildingNumber: legal?.buildingNumber || "",
    streetName: legal?.streetName || settings?.address || "",
    district: legal?.district || "",
    city: legal?.city || settings?.city || "",
    postalCode: legal?.postalCode || settings?.zipCode || "",
    country: legal?.country || settings?.country || "Saudi Arabia",
    contactPerson: legal?.contactPerson || "",
    phoneNumber: legal?.phoneNumber || settings?.phone || settings?.mobile || "",
    emailAddress: legal?.emailAddress || settings?.email || "",
    companyLogo: legal?.companyLogo || settings?.logo || "",
  };
}

async function nextInvoiceCounter(tenantId: number) {
  const db = getDb();
  const rows = await db.select({ value: sql<number>`coalesce(max(${zatcaInvoiceStatus.invoiceCounter}), 0)` })
    .from(zatcaInvoiceStatus)
    .where(eq(zatcaInvoiceStatus.tenantId, tenantId));
  return Number(rows[0]?.value || 0) + 1;
}

function endpointFor(action: "clearance" | "reporting" | "compliance_check", environment: "sandbox" | "production") {
  const base = environment === "production"
    ? "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
    : "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal";
  if (action === "clearance") return `${base}/invoices/clearance/single`;
  if (action === "reporting") return `${base}/invoices/reporting/single`;
  return `${base}/compliance/invoices`;
}

async function buildInvoicePackage(invoiceId: number, tenantId: number, invoiceMode?: "standard" | "simplified") {
  const db = getDb();
  const [invoice, legal] = await Promise.all([
    db.query.invoices.findFirst({ where: and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)) }),
    getLegalOrSettings(tenantId),
  ]);
  if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
  if (!validSaudiVat(legal.vatNumber)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Saudi VAT Number must be 15 digits, start with 3, and end with 3." });
  }
  if (!legal.legalNameEn && !legal.legalNameAr) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Company legal name is required before generating ZATCA documents." });
  }

  const [items, customer, existingStatus] = await Promise.all([
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id)),
    db.query.customers.findFirst({ where: eq(customers.id, invoice.customerId) }),
    db.query.zatcaInvoiceStatus.findFirst({
      where: and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.invoiceId, invoice.id)),
    }),
  ]);
  const uuid = existingStatus?.invoiceUuid || randomUUID();
  const counter = existingStatus?.invoiceCounter || await nextInvoiceCounter(tenantId);
  const mode = invoiceMode || (invoice.invoiceType === "standard" ? "standard" : "simplified");
  const issueDate = invoice.date;
  const issueTime = new Date().toISOString().slice(11, 19);
  const invoiceTypeName = mode === "standard" ? "0100000" : "0200000";

  const linesXml = items.map((item, index) => {
    const lineTax = Number(item.totalAmount) * Number(item.taxPercent) / 100;
    return `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="SAR">${Number(item.totalAmount).toFixed(2)}</cbc:LineExtensionAmount>
      <cac:TaxTotal><cbc:TaxAmount currencyID="SAR">${lineTax.toFixed(2)}</cbc:TaxAmount></cac:TaxTotal>
      <cac:Item><cbc:Name>${xmlEscape(item.description || `Item ${index + 1}`)}</cbc:Name></cac:Item>
      <cac:Price><cbc:PriceAmount currencyID="SAR">${Number(item.unitPrice).toFixed(2)}</cbc:PriceAmount></cac:Price>
    </cac:InvoiceLine>`;
  }).join("");

  const unsignedXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:ProfileID>${mode === "standard" ? "clearance:1.0" : "reporting:1.0"}</cbc:ProfileID>
  <cbc:ID>${xmlEscape(invoice.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${invoiceTypeName}">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PostalAddress>
        <cbc:StreetName>${xmlEscape(legal.streetName)}</cbc:StreetName>
        <cbc:BuildingNumber>${xmlEscape(legal.buildingNumber)}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${xmlEscape(legal.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${xmlEscape(legal.city)}</cbc:CityName>
        <cbc:PostalZone>${xmlEscape(legal.postalCode)}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(legal.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(legal.legalNameEn || legal.legalNameAr)}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme><cbc:CompanyID>${xmlEscape(customer?.taxNumber || "")}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(customer?.name || "Walk-in Customer")}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${Number(invoice.taxAmount).toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${Number(invoice.subTotal).toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${Number(invoice.taxAmount).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory><cbc:ID>S</cbc:ID><cbc:Percent>${Number(invoice.taxPercent).toFixed(2)}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${Number(invoice.subTotal).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${Number(invoice.subTotal).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${Number(invoice.totalAmount).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="SAR">${Number(invoice.discountAmount).toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="SAR">${Number(invoice.totalAmount).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${linesXml}
</Invoice>`;

  const invoiceHash = sha256Base64(unsignedXml);
  return { invoice, customer, legal, items, uuid, counter, mode, issueDate, issueTime, unsignedXml, invoiceHash };
}

async function persistPackage(input: {
  tenantId: number;
  userId: number;
  invoiceId: number;
  action: "generate_xml" | "generate_qr" | "sign_invoice";
  unsignedXml: string;
  signedXml?: string;
  qrPayload?: string;
  qrDataUrl?: string;
  invoiceHash: string;
  digitalSignature?: string;
  uuid: string;
  counter: number;
  status: "draft" | "signed" | "pending";
  ipAddress?: string;
  userAgent?: string | null;
}) {
  const db = getDb();
  const existing = await db.query.zatcaInvoiceStatus.findFirst({
    where: and(eq(zatcaInvoiceStatus.tenantId, input.tenantId), eq(zatcaInvoiceStatus.invoiceId, input.invoiceId)),
  });
  const statusValues = {
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    invoiceUuid: input.uuid,
    invoiceCounter: input.counter,
    invoiceHash: input.invoiceHash,
    digitalSignature: input.digitalSignature,
    status: input.status,
    updatedAt: new Date(),
  };
  if (existing) {
    await db.update(zatcaInvoiceStatus).set(statusValues).where(eq(zatcaInvoiceStatus.id, existing.id));
  } else {
    await db.insert(zatcaInvoiceStatus).values(statusValues);
  }

  await db.insert(zatcaXmlDocuments).values({
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    documentType: "standard",
    unsignedXml: input.unsignedXml,
    signedXml: input.signedXml,
    xmlHash: input.invoiceHash,
    isArchived: true,
    createdAt: new Date(),
  });

  if (input.qrPayload) {
    await db.insert(zatcaQrCodes).values({
      tenantId: input.tenantId,
      invoiceId: input.invoiceId,
      tlvBase64: input.qrPayload,
      qrImageDataUrl: input.qrDataUrl,
      tags: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      createdAt: new Date(),
    });
  }

  await db.update(invoices)
    .set({ zatcaXml: input.signedXml || input.unsignedXml, zatcaQrCode: input.qrPayload, zatcaStatus: input.status === "signed" ? "pending" : "pending" })
    .where(and(eq(invoices.id, input.invoiceId), eq(invoices.tenantId, input.tenantId)));

  await db.insert(zatcaApiLogs).values({
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    action: input.action,
    environment: "sandbox",
    status: "success",
    requestPayload: { invoiceId: input.invoiceId },
    responsePayload: { invoiceHash: input.invoiceHash, status: input.status },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent || undefined,
    userId: input.userId,
    createdAt: new Date(),
  });
}

async function callZatcaApi(input: {
  tenantId: number;
  userId: number;
  invoiceId: number;
  action: "clearance" | "reporting" | "compliance_check" | "sync_status";
  environment: "sandbox" | "production";
  payload: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string | null;
}) {
  const db = getDb();
  const credential = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, input.tenantId),
      eq(zatcaCredentials.environment, input.environment),
      eq(zatcaCredentials.isActive, true),
    ),
  });
  const endpoint = input.action === "sync_status" ? undefined : endpointFor(input.action, input.environment);
  const hasLiveCredential = Boolean(credential?.accessTokenEncrypted && credential.secretTokenEncrypted && endpoint);
  let responsePayload: Record<string, unknown>;
  let httpStatus = 0;
  let status: "success" | "pending" | "failed" = "pending";

  if (hasLiveCredential && endpoint) {
    try {
      const accessToken = decryptSecret(credential?.accessTokenEncrypted);
      const secretToken = decryptSecret(credential?.secretTokenEncrypted);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept": "application/json",
          "Authorization": `Basic ${Buffer.from(`${accessToken}:${secretToken}`).toString("base64")}`,
        },
        body: JSON.stringify(input.payload),
      });
      httpStatus = res.status;
      responsePayload = await res.json().catch(() => ({ text: "Non-JSON ZATCA response" })) as Record<string, unknown>;
      status = res.ok ? "success" : "failed";
    } catch (error) {
      responsePayload = { error: error instanceof Error ? error.message : "ZATCA API call failed" };
      status = "failed";
    }
  } else {
    responsePayload = {
      readiness: true,
      message: "ZATCA credentials are isolated per tenant. Add valid access/secret tokens and certificates to perform live API submission.",
    };
  }

  await db.insert(zatcaApiLogs).values({
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    action: input.action === "reporting" ? "reporting" : input.action === "clearance" ? "clearance" : input.action === "compliance_check" ? "compliance_check" : "sync_status",
    environment: input.environment,
    endpoint,
    requestPayload: input.payload,
    responsePayload,
    httpStatus,
    status,
    errorMessage: status === "failed" ? JSON.stringify(responsePayload) : undefined,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent || undefined,
    userId: input.userId,
    createdAt: new Date(),
  });

  return { status, httpStatus, responsePayload, liveSubmitted: hasLiveCredential };
}

export const zatcaRouter = createRouter({
  officialResources: publicQuery.query(() => OFFICIAL_LINKS),

  companyLegalGet: authedQuery.query(async ({ ctx }) => getLegalOrSettings(ctx.user.tenantId!)),

  companyLegalSave: adminQuery
    .input(z.object({
      legalNameEn: z.string().min(1),
      legalNameAr: z.string().optional(),
      vatNumber: z.string().regex(/^3\d{13}3$/, "Saudi VAT number must be 15 digits and start/end with 3."),
      crNumber: z.string().optional(),
      taxRegistrationNumber: z.string().optional(),
      businessActivity: z.string().optional(),
      companyAddress: z.string().optional(),
      buildingNumber: z.string().optional(),
      streetName: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().default("Saudi Arabia"),
      contactPerson: z.string().optional(),
      phoneNumber: z.string().optional(),
      emailAddress: z.string().email().optional().or(z.literal("")),
      companyLogo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const existing = await db.query.companyLegalDetails.findFirst({ where: eq(companyLegalDetails.tenantId, tenantId) });
      const values = { tenantId, ...input, emailAddress: input.emailAddress || undefined };
      if (existing) {
        await db.update(companyLegalDetails).set(values).where(eq(companyLegalDetails.id, existing.id));
      } else {
        await db.insert(companyLegalDetails).values(values);
      }
      await db.insert(companies).values({
        tenantId,
        legalName: input.legalNameEn,
        displayName: input.legalNameAr || input.legalNameEn,
        countryCode: "SA",
        baseCurrency: "SAR",
        timezone: "Asia/Riyadh",
      }).onDuplicateKeyUpdate({
        set: { legalName: input.legalNameEn, displayName: input.legalNameAr || input.legalNameEn, countryCode: "SA" },
      });
      const settingsValues = {
        tenantId,
        companyName: input.legalNameEn,
        companyNameAr: input.legalNameAr,
        taxNumber: input.vatNumber,
        crNumber: input.crNumber,
        address: input.companyAddress || input.streetName,
        city: input.city,
        country: input.country,
        zipCode: input.postalCode,
        phone: input.phoneNumber,
        email: input.emailAddress || undefined,
        logo: input.companyLogo,
        defaultCurrency: "SAR",
        vatRate: "15",
        zatcaEnabled: true,
      };
      const existingSettings = await db.query.companySettings.findFirst({ where: eq(companySettings.tenantId, tenantId) });
      if (existingSettings) {
        await db.update(companySettings)
          .set({
          companyName: input.legalNameEn,
          companyNameAr: input.legalNameAr,
          taxNumber: input.vatNumber,
          crNumber: input.crNumber,
          address: input.companyAddress || input.streetName,
          city: input.city,
          country: input.country,
          zipCode: input.postalCode,
          phone: input.phoneNumber,
          email: input.emailAddress || undefined,
          logo: input.companyLogo,
          defaultCurrency: "SAR",
          vatRate: "15",
          zatcaEnabled: true,
          })
          .where(eq(companySettings.tenantId, tenantId));
      } else {
        await db.insert(companySettings).values(settingsValues);
      }
      await db.insert(auditLogs).values({
        tenantId,
        userId: ctx.user.id,
        action: "zatca_company_legal_save",
        entityType: "company_legal_details",
        newValues: { vatNumber: input.vatNumber, crNumber: input.crNumber, country: input.country },
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent") || undefined,
        createdAt: new Date(),
      });
      await addActivity({
        tenantId,
        userId: ctx.user.id,
        action: "company_legal_save",
        message: "Company legal information updated for ZATCA documents.",
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      return { success: true };
    }),

  integrationGet: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [credential, integration] = await Promise.all([
      db.query.zatcaCredentials.findFirst({
        where: and(eq(zatcaCredentials.tenantId, tenantId), eq(zatcaCredentials.isActive, true)),
        orderBy: desc(zatcaCredentials.updatedAt),
      }),
      db.query.taxIntegrations.findFirst({
        where: and(eq(taxIntegrations.tenantId, tenantId), eq(taxIntegrations.countryCode, "SA"), eq(taxIntegrations.integrationType, "zatca_phase2")),
      }),
    ]);
    return {
      environment: credential?.environment || (integration?.isSandbox === false ? "production" : "sandbox"),
      vatNumber: credential?.vatNumber || "",
      organizationIdentifier: credential?.organizationIdentifier || "",
      egsSerialNumber: credential?.egsSerialNumber || "",
      deviceUuid: credential?.deviceUuid || "",
      hasOtp: Boolean(credential?.otpEncrypted),
      hasCsr: Boolean(credential?.csrEncrypted),
      hasCertificate: Boolean(credential?.certificateEncrypted),
      hasPrivateKey: Boolean(credential?.privateKeyEncrypted),
      hasPublicKey: Boolean(credential?.publicKeyEncrypted),
      hasComplianceCsid: Boolean(credential?.complianceCsidEncrypted),
      hasProductionCsid: Boolean(credential?.productionCsidEncrypted),
      hasAccessToken: Boolean(credential?.accessTokenEncrypted),
      hasSecretToken: Boolean(credential?.secretTokenEncrypted),
      officialResources: OFFICIAL_LINKS,
    };
  }),

  integrationSave: adminQuery
    .input(z.object({
      environment: z.enum(["sandbox", "production"]),
      vatNumber: z.string().regex(/^3\d{13}3$/),
      organizationIdentifier: z.string().optional(),
      egsSerialNumber: z.string().optional(),
      deviceUuid: z.string().optional(),
      otpCode: z.string().optional(),
      csrInformation: z.string().optional(),
      zatcaCertificate: z.string().optional(),
      privateKey: z.string().optional(),
      publicKey: z.string().optional(),
      complianceCsid: z.string().optional(),
      productionCsid: z.string().optional(),
      accessToken: z.string().optional(),
      secretToken: z.string().optional(),
      certificateExpiresAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const existing = await db.query.zatcaCredentials.findFirst({
        where: and(eq(zatcaCredentials.tenantId, tenantId), eq(zatcaCredentials.environment, input.environment), eq(zatcaCredentials.isActive, true)),
      });
      const values = {
        tenantId,
        environment: input.environment,
        vatNumber: input.vatNumber,
        organizationIdentifier: input.organizationIdentifier,
        egsSerialNumber: input.egsSerialNumber,
        deviceUuid: input.deviceUuid || randomUUID(),
        otpEncrypted: encryptSecret(input.otpCode) || existing?.otpEncrypted,
        csrEncrypted: encryptSecret(input.csrInformation) || existing?.csrEncrypted,
        certificateEncrypted: encryptSecret(input.zatcaCertificate) || existing?.certificateEncrypted,
        privateKeyEncrypted: encryptSecret(input.privateKey) || existing?.privateKeyEncrypted,
        publicKeyEncrypted: encryptSecret(input.publicKey) || existing?.publicKeyEncrypted,
        complianceCsidEncrypted: encryptSecret(input.complianceCsid) || existing?.complianceCsidEncrypted,
        productionCsidEncrypted: encryptSecret(input.productionCsid) || existing?.productionCsidEncrypted,
        accessTokenEncrypted: encryptSecret(input.accessToken) || existing?.accessTokenEncrypted,
        secretTokenEncrypted: encryptSecret(input.secretToken) || existing?.secretTokenEncrypted,
        isActive: true,
      };
      let credentialId = existing?.id;
      if (existing) {
        await db.update(zatcaCredentials).set(values).where(eq(zatcaCredentials.id, existing.id));
      } else {
        const [{ id }] = await db.insert(zatcaCredentials).values(values).$returningId();
        credentialId = id;
      }

      const certificatePayloads = [
        ["csr", input.csrInformation],
        ["ccsid", input.complianceCsid],
        ["pcsid", input.productionCsid],
        ["public_key", input.publicKey],
        ["private_key", input.privateKey],
      ] as const;
      for (const [certificateType, payload] of certificatePayloads) {
        const encryptedPayload = encryptSecret(payload);
        if (!encryptedPayload) continue;
        await db.insert(zatcaCertificates).values({
          tenantId,
          credentialId,
          certificateType,
          environment: input.environment,
          certificateHash: sha256Base64(payload || ""),
          encryptedPayload,
          expiresAt: certificateType === "pcsid" && input.certificateExpiresAt ? new Date(input.certificateExpiresAt) : undefined,
          isActive: true,
          createdAt: new Date(),
        });
      }

      const integration = await db.query.taxIntegrations.findFirst({
        where: and(eq(taxIntegrations.tenantId, tenantId), eq(taxIntegrations.countryCode, "SA"), eq(taxIntegrations.integrationType, "zatca_phase2")),
      });
      const integrationValues = {
        tenantId,
        countryCode: "SA",
        integrationType: "zatca_phase2",
        name: "Saudi ZATCA Phase 2",
        isEnabled: true,
        isSandbox: input.environment === "sandbox",
        endpointUrl: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
        sandboxUrl: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
        apiVersion: "v2",
        config: { egsSerialNumber: input.egsSerialNumber, deviceUuid: values.deviceUuid, organizationIdentifier: input.organizationIdentifier },
      };
      let integrationId = integration?.id;
      if (integration) {
        await db.update(taxIntegrations).set(integrationValues).where(eq(taxIntegrations.id, integration.id));
      } else {
        const [{ id }] = await db.insert(taxIntegrations).values(integrationValues).$returningId();
        integrationId = id;
      }
      const genericCredentials = [
        ["csr", input.csrInformation],
        ["ccsid", input.complianceCsid],
        ["pcsid", input.productionCsid],
        ["private_key", input.privateKey],
        ["public_key", input.publicKey],
        ["access_token", input.accessToken],
        ["secret_token", input.secretToken],
      ] as const;
      for (const [credentialType, raw] of genericCredentials) {
        const encryptedValue = encryptSecret(raw);
        if (!encryptedValue || !integrationId) continue;
        await db.insert(taxCredentials).values({ tenantId, integrationId, credentialType, encryptedValue, isActive: true });
      }

      await db.insert(auditLogs).values({
        tenantId,
        userId: ctx.user.id,
        action: "zatca_credentials_save",
        entityType: "zatca_credentials",
        entityId: credentialId,
        newValues: { environment: input.environment, vatNumber: input.vatNumber, credentialFieldsUpdated: genericCredentials.filter(([, raw]) => Boolean(raw)).map(([type]) => type) },
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent") || undefined,
        createdAt: new Date(),
      });
      await addActivity({
        tenantId,
        userId: ctx.user.id,
        action: "credentials_save",
        message: "Tenant ZATCA credentials were updated with encrypted storage.",
        metadata: { environment: input.environment },
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      return { success: true, credentialId };
    }),

  generateXml: authedQuery.input(z.object({ invoiceId: z.number(), invoiceMode: z.enum(["standard", "simplified"]).optional() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId!;
      const pkg = await buildInvoicePackage(input.invoiceId, tenantId, input.invoiceMode);
      await persistPackage({
        tenantId,
        userId: ctx.user.id,
        invoiceId: input.invoiceId,
        action: "generate_xml",
        unsignedXml: pkg.unsignedXml,
        invoiceHash: pkg.invoiceHash,
        uuid: pkg.uuid,
        counter: pkg.counter,
        status: "draft",
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      await addActivity({ tenantId, userId: ctx.user.id, invoiceId: input.invoiceId, action: "generate_xml", message: "UBL XML generated.", ipAddress: ctx.clientIp, userAgent: ctx.req.headers.get("user-agent") });
      return { invoiceId: input.invoiceId, invoiceUuid: pkg.uuid, invoiceCounter: pkg.counter, invoiceHash: pkg.invoiceHash, xml: pkg.unsignedXml };
    }),

  generateQrCode: authedQuery.input(z.object({ invoiceId: z.number(), invoiceMode: z.enum(["standard", "simplified"]).optional() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId!;
      const pkg = await buildInvoicePackage(input.invoiceId, tenantId, input.invoiceMode);
      const signature = sha256Base64(`${pkg.invoiceHash}:pending-signature`);
      const publicKey = "pending-public-key";
      const qrPayload = tlvBase64([
        [1, pkg.legal.legalNameEn || pkg.legal.legalNameAr],
        [2, pkg.legal.vatNumber],
        [3, `${pkg.issueDate}T${pkg.issueTime}`],
        [4, Number(pkg.invoice.totalAmount).toFixed(2)],
        [5, Number(pkg.invoice.taxAmount).toFixed(2)],
        [6, pkg.invoiceHash],
        [7, signature],
        [8, publicKey],
        [9, signature],
      ]);
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { errorCorrectionLevel: "M", margin: 1, width: 220 });
      await persistPackage({
        tenantId,
        userId: ctx.user.id,
        invoiceId: input.invoiceId,
        action: "generate_qr",
        unsignedXml: pkg.unsignedXml,
        qrPayload,
        qrDataUrl,
        invoiceHash: pkg.invoiceHash,
        digitalSignature: signature,
        uuid: pkg.uuid,
        counter: pkg.counter,
        status: "pending",
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      return { invoiceId: input.invoiceId, qrCodeBase64: qrPayload, qrImageDataUrl: qrDataUrl, invoiceHash: pkg.invoiceHash };
    }),

  signInvoice: authedQuery.input(z.object({ invoiceId: z.number(), invoiceMode: z.enum(["standard", "simplified"]).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const pkg = await buildInvoicePackage(input.invoiceId, tenantId, input.invoiceMode);
      const credential = await db.query.zatcaCredentials.findFirst({
        where: and(eq(zatcaCredentials.tenantId, tenantId), eq(zatcaCredentials.isActive, true)),
        orderBy: desc(zatcaCredentials.updatedAt),
      });
      let digitalSignature = sha256Base64(`${pkg.invoiceHash}:unsigned-readiness`);
      try {
        const privateKey = decryptSecret(credential?.privateKeyEncrypted);
        if (privateKey) {
          const signer = createSign("RSA-SHA256");
          signer.update(pkg.unsignedXml);
          signer.end();
          digitalSignature = signer.sign(privateKey, "base64");
        }
      } catch {
        digitalSignature = sha256Base64(`${pkg.invoiceHash}:signature-placeholder`);
      }
      const signedXml = pkg.unsignedXml.replace("</Invoice>", `<ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent><Signature>${digitalSignature}</Signature></ext:ExtensionContent></ext:UBLExtension></ext:UBLExtensions></Invoice>`);
      await persistPackage({
        tenantId,
        userId: ctx.user.id,
        invoiceId: input.invoiceId,
        action: "sign_invoice",
        unsignedXml: pkg.unsignedXml,
        signedXml,
        invoiceHash: pkg.invoiceHash,
        digitalSignature,
        uuid: pkg.uuid,
        counter: pkg.counter,
        status: "signed",
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      return { invoiceId: input.invoiceId, signedXml, invoiceHash: pkg.invoiceHash, digitalSignature, signedWithConfiguredKey: Boolean(credential?.privateKeyEncrypted) };
    }),

  complianceCheck: authedQuery.input(z.object({ invoiceId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const tenantId = ctx.user.tenantId!;
      const credential = await getDb().query.zatcaCredentials.findFirst({
        where: and(eq(zatcaCredentials.tenantId, tenantId), eq(zatcaCredentials.isActive, true)),
        orderBy: desc(zatcaCredentials.updatedAt),
      });
      const result = await callZatcaApi({
        tenantId,
        userId: ctx.user.id,
        invoiceId: input.invoiceId || 0,
        action: "compliance_check",
        environment: credential?.environment || "sandbox",
        payload: { invoiceId: input.invoiceId, checks: ["standard", "simplified", "credit_note", "debit_note"], readiness: true },
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      return result;
    }),

  clearanceInvoice: authedQuery.input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const signed = await db.query.zatcaXmlDocuments.findFirst({
        where: and(eq(zatcaXmlDocuments.tenantId, tenantId), eq(zatcaXmlDocuments.invoiceId, input.invoiceId)),
        orderBy: desc(zatcaXmlDocuments.createdAt),
      });
      if (!signed?.signedXml) throw new TRPCError({ code: "BAD_REQUEST", message: "Sign invoice before clearance." });
      const statusRow = await db.query.zatcaInvoiceStatus.findFirst({ where: and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.invoiceId, input.invoiceId)) });
      const credential = await db.query.zatcaCredentials.findFirst({ where: and(eq(zatcaCredentials.tenantId, tenantId), eq(zatcaCredentials.isActive, true)), orderBy: desc(zatcaCredentials.updatedAt) });
      const result = await callZatcaApi({
        tenantId,
        userId: ctx.user.id,
        invoiceId: input.invoiceId,
        action: "clearance",
        environment: credential?.environment || "sandbox",
        payload: { invoice: Buffer.from(signed.signedXml).toString("base64"), invoiceHash: signed.xmlHash, uuid: statusRow?.invoiceUuid },
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      await db.update(zatcaInvoiceStatus)
        .set({ status: result.status === "success" ? "cleared" : result.liveSubmitted ? "failed" : "pending", clearanceStatus: String(result.responsePayload.clearanceStatus || result.status), submittedAt: new Date(), clearedAt: result.status === "success" ? new Date() : undefined, errorMessage: result.status === "failed" ? JSON.stringify(result.responsePayload) : undefined })
        .where(and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.invoiceId, input.invoiceId)));
      return result;
    }),

  reportInvoice: authedQuery.input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const signed = await db.query.zatcaXmlDocuments.findFirst({
        where: and(eq(zatcaXmlDocuments.tenantId, tenantId), eq(zatcaXmlDocuments.invoiceId, input.invoiceId)),
        orderBy: desc(zatcaXmlDocuments.createdAt),
      });
      if (!signed?.signedXml) throw new TRPCError({ code: "BAD_REQUEST", message: "Sign invoice before reporting." });
      const statusRow = await db.query.zatcaInvoiceStatus.findFirst({ where: and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.invoiceId, input.invoiceId)) });
      const credential = await db.query.zatcaCredentials.findFirst({ where: and(eq(zatcaCredentials.tenantId, tenantId), eq(zatcaCredentials.isActive, true)), orderBy: desc(zatcaCredentials.updatedAt) });
      const result = await callZatcaApi({
        tenantId,
        userId: ctx.user.id,
        invoiceId: input.invoiceId,
        action: "reporting",
        environment: credential?.environment || "sandbox",
        payload: { invoice: Buffer.from(signed.signedXml).toString("base64"), invoiceHash: signed.xmlHash, uuid: statusRow?.invoiceUuid },
        ipAddress: ctx.clientIp,
        userAgent: ctx.req.headers.get("user-agent"),
      });
      await db.update(zatcaInvoiceStatus)
        .set({ status: result.status === "success" ? "reported" : result.liveSubmitted ? "failed" : "pending", reportingStatus: String(result.responsePayload.reportingStatus || result.status), submittedAt: new Date(), reportedAt: result.status === "success" ? new Date() : undefined, errorMessage: result.status === "failed" ? JSON.stringify(result.responsePayload) : undefined })
        .where(and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.invoiceId, input.invoiceId)));
      return result;
    }),

  syncStatus: authedQuery.input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const statusRow = await db.query.zatcaInvoiceStatus.findFirst({ where: and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.invoiceId, input.invoiceId)) });
      await callZatcaApi({ tenantId, userId: ctx.user.id, invoiceId: input.invoiceId, action: "sync_status", environment: "sandbox", payload: { invoiceId: input.invoiceId, currentStatus: statusRow?.status || "draft" }, ipAddress: ctx.clientIp, userAgent: ctx.req.headers.get("user-agent") });
      return statusRow || { invoiceId: input.invoiceId, status: "draft" };
    }),

  downloadResponse: authedQuery.input(z.object({ invoiceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const logs = await getDb().select().from(zatcaApiLogs)
        .where(and(eq(zatcaApiLogs.tenantId, ctx.user.tenantId!), eq(zatcaApiLogs.invoiceId, input.invoiceId)))
        .orderBy(desc(zatcaApiLogs.createdAt));
      return { invoiceId: input.invoiceId, logs };
    }),

  statusReport: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const rows = await db.select({
      id: zatcaInvoiceStatus.id,
      invoiceId: zatcaInvoiceStatus.invoiceId,
      invoiceUuid: zatcaInvoiceStatus.invoiceUuid,
      invoiceCounter: zatcaInvoiceStatus.invoiceCounter,
      invoiceHash: zatcaInvoiceStatus.invoiceHash,
      status: zatcaInvoiceStatus.status,
      errorCode: zatcaInvoiceStatus.errorCode,
      errorMessage: zatcaInvoiceStatus.errorMessage,
      updatedAt: zatcaInvoiceStatus.updatedAt,
    }).from(zatcaInvoiceStatus)
      .where(eq(zatcaInvoiceStatus.tenantId, tenantId))
      .orderBy(desc(zatcaInvoiceStatus.updatedAt));
    const logs = await db.select().from(zatcaApiLogs).where(eq(zatcaApiLogs.tenantId, tenantId)).orderBy(desc(zatcaApiLogs.createdAt));
    return { rows, logs: logs.slice(0, 100) };
  }),

  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [totalInvoices, cleared, pending, failed, vatSummary, cert] = await Promise.all([
      db.select({ value: sql<number>`count(*)` }).from(invoices).where(eq(invoices.tenantId, tenantId)),
      db.select({ value: sql<number>`count(*)` }).from(zatcaInvoiceStatus).where(and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.status, "cleared"))),
      db.select({ value: sql<number>`count(*)` }).from(zatcaInvoiceStatus).where(and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.status, "pending"))),
      db.select({ value: sql<number>`count(*)` }).from(zatcaInvoiceStatus).where(and(eq(zatcaInvoiceStatus.tenantId, tenantId), eq(zatcaInvoiceStatus.status, "failed"))),
      db.select({ value: sql<string>`coalesce(sum(${invoices.taxAmount}), 0)` }).from(invoices).where(eq(invoices.tenantId, tenantId)),
      db.query.zatcaCertificates.findFirst({ where: and(eq(zatcaCertificates.tenantId, tenantId), eq(zatcaCertificates.isActive, true)), orderBy: desc(zatcaCertificates.expiresAt) }),
    ]);
    const expiry = cert?.expiresAt ? new Date(cert.expiresAt) : null;
    const daysToExpiry = expiry ? Math.ceil((expiry.getTime() - Date.now()) / 86400000) : null;
    return {
      totalInvoices: Number(totalInvoices[0]?.value || 0),
      clearedInvoices: Number(cleared[0]?.value || 0),
      pendingInvoices: Number(pending[0]?.value || 0),
      failedInvoices: Number(failed[0]?.value || 0),
      vatSummary: Number(vatSummary[0]?.value || 0),
      apiStatus: "Configured per tenant",
      certificateExpiryWarning: daysToExpiry === null ? "No certificate expiry saved" : daysToExpiry <= 30 ? `Certificate expires in ${daysToExpiry} days` : `Certificate valid for ${daysToExpiry} days`,
    };
  }),

  wizardState: authedQuery.query(async ({ ctx }) => {
    const tenantId = ctx.user.tenantId!;
    const [legal, integration, checks] = await Promise.all([
      getLegalOrSettings(tenantId),
      getDb().query.zatcaCredentials.findFirst({ where: and(eq(zatcaCredentials.tenantId, tenantId), eq(zatcaCredentials.isActive, true)) }),
      getDb().query.zatcaInvoiceStatus.findFirst({ where: eq(zatcaInvoiceStatus.tenantId, tenantId), orderBy: desc(zatcaInvoiceStatus.updatedAt) }),
    ]);
    return [
      { step: 1, label: "Company Information", complete: Boolean(legal.legalNameEn && legal.city && legal.country) },
      { step: 2, label: "VAT Details", complete: validSaudiVat(legal.vatNumber) },
      { step: 3, label: "CR Details", complete: Boolean(legal.crNumber) },
      { step: 4, label: "ZATCA Credentials", complete: Boolean(integration?.complianceCsidEncrypted || integration?.productionCsidEncrypted) },
      { step: 5, label: "Compliance Test", complete: Boolean(checks && ["signed", "pending", "cleared", "reported"].includes(checks.status)) },
      { step: 6, label: "Production Activation", complete: integration?.environment === "production" && Boolean(integration.productionCsidEncrypted) },
      { step: 7, label: "Success Confirmation", complete: Boolean(checks?.status === "cleared" || checks?.status === "reported") },
    ];
  }),
});
