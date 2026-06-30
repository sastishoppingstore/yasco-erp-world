import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../queries/connection";
import { zatcaCredentials, zatcaInvoiceStatus, zatcaXmlDocuments } from "@db/schema";
import { generateKeyPair } from "./signingEngine";
import { storeCertificate, updateCredentialCsid, verifyAndStoreCsid } from "./certificates";
import { env } from "../env";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type OnboardingStep =
  | "generate_csr"
  | "submit_otp"
  | "receive_compliance_csid"
  | "run_compliance_tests"
  | "exchange_production_csid"
  | "complete";

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  csrPem?: string;
  privateKeyPem?: string;
  publicKeyPem?: string;
  complianceCsid?: string;
  productionCsid?: string;
  complianceTestResults?: ComplianceTestResult[];
  errors: string[];
  status: "in_progress" | "completed" | "failed";
  environment: "sandbox" | "production";
}

export interface ComplianceTestResult {
  testId: number;
  testName: string;
  invoiceType: "standard" | "simplified" | "credit_note" | "debit_note";
  status: "pending" | "passed" | "failed";
  errorMessage?: string;
  invoiceId?: number;
  submittedAt?: Date;
}

const COMPLIANCE_TEST_INVOICES: Array<{
  name: string;
  invoiceType: "standard" | "simplified" | "credit_note" | "debit_note";
  description: string;
}> = [
  { name: "Standard B2B Invoice", invoiceType: "standard", description: "Standard invoice with full VAT" },
  { name: "Simplified B2C Invoice", invoiceType: "simplified", description: "Simplified invoice for B2C reporting" },
  { name: "Zero-rated Invoice", invoiceType: "standard", description: "Standard invoice with zero-rated VAT (Z)" },
  { name: "Exempt Invoice", invoiceType: "standard", description: "Standard invoice with exempt VAT (E)" },
  { name: "Credit Note", invoiceType: "credit_note", description: "Credit note against a standard invoice" },
  { name: "Debit Note", invoiceType: "debit_note", description: "Debit note against a standard invoice" },
];

function key() {
  return createHash("sha256").update(env.appSecret || process.env.ENCRYPTION_KEY || "development-only-encryption-key").digest();
}

function encryptSecret(value?: string | null): string | undefined {
  if (!value) return undefined;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
}

export async function startOnboarding(params: {
  tenantId: number;
  environment: "sandbox" | "production";
  vatNumber: string;
  organizationIdentifier?: string;
  egsSerialNumber?: string;
  commonName: string;
}): Promise<OnboardingState> {
  const db = getDb();

  const existing = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, params.tenantId),
      eq(zatcaCredentials.environment, params.environment),
      eq(zatcaCredentials.isActive, true),
    ),
  });

  if (existing?.productionCsidEncrypted) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Production CSID already configured. Use renewal if needed.",
    });
  }

  const keyPair = generateKeyPair("ECDSA-SHA256");

  const forge = require("node-forge");
  const pki = forge.pki;
  const privKey = pki.privateKeyFromPem(keyPair.privateKey);
  const csr = pki.createCertificationRequest();
  csr.publicKey = privKey.publicKey;

  csr.setSubject([
    { name: "commonName", value: params.commonName },
    { name: "organizationName", value: params.organizationIdentifier || params.vatNumber },
    { name: "countryName", value: "SA" },
  ]);

  csr.sign(privKey);
  const csrPem = forge.pki.certificationRequestToPem(csr);

  const credentialId = existing?.id;
  if (existing) {
    await db.update(zatcaCredentials).set({
      csrEncrypted: encryptSecret(csrPem),
      privateKeyEncrypted: encryptSecret(keyPair.privateKey),
      publicKeyEncrypted: encryptSecret(keyPair.publicKey),
      vatNumber: params.vatNumber,
      organizationIdentifier: params.organizationIdentifier,
      egsSerialNumber: params.egsSerialNumber,
      updatedAt: new Date(),
    }).where(eq(zatcaCredentials.id, existing.id));
  } else {
    const [{ id }] = await db.insert(zatcaCredentials).values({
      tenantId: params.tenantId,
      environment: params.environment,
      vatNumber: params.vatNumber,
      organizationIdentifier: params.organizationIdentifier,
      egsSerialNumber: params.egsSerialNumber,
      csrEncrypted: encryptSecret(csrPem),
      privateKeyEncrypted: encryptSecret(keyPair.privateKey),
      publicKeyEncrypted: encryptSecret(keyPair.publicKey),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).$returningId();
  }

  await storeCertificate({
    tenantId: params.tenantId,
    credentialId: credentialId || 0,
    certificateType: "csr",
    environment: params.environment,
    payload: csrPem,
  });

  return {
    currentStep: "submit_otp",
    completedSteps: ["generate_csr"],
    csrPem,
    privateKeyPem: keyPair.privateKey,
    publicKeyPem: keyPair.publicKey,
    errors: [],
    status: "in_progress",
    environment: params.environment,
  };
}

export async function submitOtp(params: {
  tenantId: number;
  otp: string;
  environment: "sandbox" | "production";
}): Promise<OnboardingState> {
  const db = getDb();

  const credential = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, params.tenantId),
      eq(zatcaCredentials.environment, params.environment),
      eq(zatcaCredentials.isActive, true),
    ),
  });

  if (!credential) {
    throw new TRPCError({ code: "NOT_FOUND", message: "No onboarding in progress. Start with CSR generation." });
  }

  await db.update(zatcaCredentials)
    .set({
      otpEncrypted: encryptSecret(params.otp),
      updatedAt: new Date(),
    })
    .where(eq(zatcaCredentials.id, credential.id));

  return {
    currentStep: "receive_compliance_csid",
    completedSteps: ["generate_csr", "submit_otp"],
    csrPem: "",
    errors: [],
    status: "in_progress",
    environment: params.environment,
  };
}

export async function storeComplianceCsid(params: {
  tenantId: number;
  csidPem: string;
  privateKeyPem: string;
  environment: "sandbox" | "production";
}): Promise<OnboardingState> {
  const result = await verifyAndStoreCsid({
    tenantId: params.tenantId,
    csidPem: params.csidPem,
    privateKeyPem: params.privateKeyPem,
    environment: params.environment,
    csidType: "compliance",
  });

  if (!result.valid) {
    return {
      currentStep: "receive_compliance_csid",
      completedSteps: ["generate_csr", "submit_otp"],
      errors: result.errors,
      status: "failed",
      environment: params.environment,
    };
  }

  return {
    currentStep: "run_compliance_tests",
    completedSteps: ["generate_csr", "submit_otp", "receive_compliance_csid"],
    complianceCsid: params.csidPem,
    privateKeyPem: params.privateKeyPem,
    errors: [],
    status: "in_progress",
    environment: params.environment,
  };
}

export function getComplianceTestTypes(): Array<{
  name: string;
  invoiceType: "standard" | "simplified" | "credit_note" | "debit_note";
  description: string;
}> {
  return COMPLIANCE_TEST_INVOICES;
}

export async function recordComplianceTestResult(params: {
  tenantId: number;
  testId: number;
  status: "passed" | "failed";
  invoiceId?: number;
  errorMessage?: string;
}): Promise<ComplianceTestResult[]> {
  const db = getDb();

  const credential = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, params.tenantId),
      eq(zatcaCredentials.isActive, true),
    ),
  });

  if (credential) {
    await db.update(zatcaCredentials)
      .set({ lastTestAt: new Date() })
      .where(eq(zatcaCredentials.id, credential.id));
  }

  const allResults: ComplianceTestResult[] = COMPLIANCE_TEST_INVOICES.map((test, index) => ({
    testId: index,
    testName: test.name,
    invoiceType: test.invoiceType,
    status: index === params.testId ? params.status : "pending",
    invoiceId: index === params.testId ? params.invoiceId : undefined,
    errorMessage: index === params.testId ? params.errorMessage : undefined,
    submittedAt: index === params.testId ? new Date() : undefined,
  }));

  return allResults;
}

export async function completeOnboarding(params: {
  tenantId: number;
  productionCsidPem: string;
  privateKeyPem: string;
  environment: "sandbox" | "production";
}): Promise<OnboardingState> {
  const result = await verifyAndStoreCsid({
    tenantId: params.tenantId,
    csidPem: params.productionCsidPem,
    privateKeyPem: params.privateKeyPem,
    environment: params.environment,
    csidType: "production",
  });

  if (!result.valid) {
    return {
      currentStep: "exchange_production_csid",
      completedSteps: ["generate_csr", "submit_otp", "receive_compliance_csid", "run_compliance_tests"],
      errors: result.errors,
      status: "failed",
      environment: params.environment,
    };
  }

  return {
    currentStep: "complete",
    completedSteps: [
      "generate_csr", "submit_otp", "receive_compliance_csid",
      "run_compliance_tests", "exchange_production_csid", "complete",
    ],
    productionCsid: params.productionCsidPem,
    errors: [],
    status: "completed",
    environment: params.environment,
  };
}

export async function getOnboardingState(
  tenantId: number,
  environment: "sandbox" | "production",
): Promise<OnboardingState | null> {
  const db = getDb();

  const credential = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, tenantId),
      eq(zatcaCredentials.environment, environment),
      eq(zatcaCredentials.isActive, true),
    ),
  });

  if (!credential) return null;

  const completedSteps: OnboardingStep[] = [];
  if (credential.csrEncrypted) completedSteps.push("generate_csr");
  if (credential.otpEncrypted) completedSteps.push("submit_otp");
  if (credential.complianceCsidEncrypted) completedSteps.push("receive_compliance_csid");

  const hasComplianceInvoice = await db.query.zatcaInvoiceStatus.findFirst({
    where: eq(zatcaInvoiceStatus.tenantId, tenantId),
  });
  if (hasComplianceInvoice) completedSteps.push("run_compliance_tests");

  if (credential.productionCsidEncrypted) {
    completedSteps.push("exchange_production_csid");
    completedSteps.push("complete");
  }

  const currentStep = credential.productionCsidEncrypted
    ? "complete"
    : credential.complianceCsidEncrypted
      ? "run_compliance_tests"
      : credential.otpEncrypted
        ? "receive_compliance_csid"
        : credential.csrEncrypted
          ? "submit_otp"
          : "generate_csr";

  return {
    currentStep,
    completedSteps,
    errors: [],
    status: credential.productionCsidEncrypted ? "completed" : "in_progress",
    environment: credential.environment,
  };
}

export async function resetOnboarding(
  tenantId: number,
  environment: "sandbox" | "production",
): Promise<void> {
  const db = getDb();

  await db.update(zatcaCredentials)
    .set({
      otpEncrypted: undefined,
      csrEncrypted: undefined,
      certificateEncrypted: undefined,
      complianceCsidEncrypted: undefined,
      productionCsidEncrypted: undefined,
      privateKeyEncrypted: undefined,
      publicKeyEncrypted: undefined,
      isActive: true,
      updatedAt: new Date(),
    })
    .where(and(
      eq(zatcaCredentials.tenantId, tenantId),
      eq(zatcaCredentials.environment, environment),
    ));
}
