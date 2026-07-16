import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../queries/connection";
import { zatcaCertificates, zatcaCredentials } from "@db/schema";
import { generateKeyPair, signXml, extractCertDetails, validateCertificateChain } from "./signingEngine";
import { env } from "../env";

export type CsidType = "compliance" | "production";
export type CertificateStatus = "active" | "expired" | "revoked" | "pending";

export type CsidRecord = {
  id: number;
  tenantId: number;
  csidType: CsidType;
  certificatePem: string;
  privateKeyPem: string;
  publicKeyPem: string;
  serialNumber: string;
  issuer: string;
  subject: string;
  notBefore: Date | null;
  notAfter: Date | null;
  isExpired: boolean;
  daysRemaining: number;
  status: CertificateStatus;
  environment: "sandbox" | "production";
};

function key() {
  return createHash("sha256").update(env.appSecret || process.env.ENCRYPTION_KEY || "development-only-encryption-key").digest();
}

function encryptSecret(value?: string | null): string | undefined {
  if (!value) return undefined;
  const { createCipheriv, randomBytes } = require("node:crypto");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptSecret(value?: string | null): string {
  if (!value) return "";
  const { createDecipheriv } = require("node:crypto");
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) return "";
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export async function getActiveCertificate(
  tenantId: number,
  environment: "sandbox" | "production",
): Promise<CsidRecord | null> {
  const db = getDb();

  const credential = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, tenantId),
      eq(zatcaCredentials.environment, environment),
      eq(zatcaCredentials.isActive, true),
    ),
    orderBy: desc(zatcaCredentials.updatedAt),
  });

  if (!credential) return null;

  const productionPem = decryptSecret(credential.productionCsidEncrypted);
  const compliancePem = decryptSecret(credential.complianceCsidEncrypted);
  const privateKey = decryptSecret(credential.privateKeyEncrypted);
  const publicKey = decryptSecret(credential.publicKeyEncrypted);

  const pcsidCert = productionPem
    ? extractCertDetails(productionPem)
    : null;
  const ccsidCert = compliancePem
    ? extractCertDetails(compliancePem)
    : null;

  if (pcsidCert && !pcsidCert.isExpired) {
    return {
      id: credential.id,
      tenantId,
      csidType: "production",
      certificatePem: productionPem!,
      privateKeyPem: privateKey,
      publicKeyPem: publicKey,
      serialNumber: pcsidCert.serialNumber,
      issuer: pcsidCert.issuer,
      subject: pcsidCert.subject,
      notBefore: pcsidCert.notBefore,
      notAfter: pcsidCert.notAfter,
      isExpired: pcsidCert.isExpired,
      daysRemaining: pcsidCert.daysRemaining,
      status: pcsidCert.isExpired ? "expired" : "active",
      environment,
    };
  }

  if (ccsidCert && !ccsidCert.isExpired) {
    return {
      id: credential.id,
      tenantId,
      csidType: "compliance",
      certificatePem: compliancePem!,
      privateKeyPem: privateKey,
      publicKeyPem: publicKey,
      serialNumber: ccsidCert.serialNumber,
      issuer: ccsidCert.issuer,
      subject: ccsidCert.subject,
      notBefore: ccsidCert.notBefore,
      notAfter: ccsidCert.notAfter,
      isExpired: ccsidCert.isExpired,
      daysRemaining: ccsidCert.daysRemaining,
      status: ccsidCert.isExpired ? "expired" : "active",
      environment,
    };
  }

  return null;
}

export function generateCsrInformation(params: {
  commonName: string;
  organizationName: string;
  countryCode: string;
  emailAddress?: string;
  serialNumber?: string;
  uid?: string;
}): { privateKeyPem: string; publicKeyPem: string; csrPem: string } {
  const keyPair = generateKeyPair("ECDSA-SHA256");

  const forge = require("node-forge");
  const pki = forge.pki;
  const privKey = pki.privateKeyFromPem(keyPair.privateKey);
  const csr = pki.createCertificationRequest();
  csr.publicKey = privKey.publicKey;

  const attrs: Array<{ name: string; value: string }> = [
    { name: "commonName", value: params.commonName },
    { name: "organizationName", value: params.organizationName },
    { name: "countryName", value: params.countryCode },
  ];

  if (params.emailAddress) {
    attrs.push({ name: "emailAddress", value: params.emailAddress });
  }

  if (params.serialNumber) {
    attrs.push({ name: "serialNumber", value: params.serialNumber });
  }

  if (params.uid) {
    attrs.push({ name: "uid", value: params.uid });
  }

  csr.setSubject(attrs);

  const extensions = [
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
    },
  ];

  csr.setAttributes([
    {
      name: "extensionRequest",
      extensions,
    },
  ]);

  csr.sign(privKey);

  return {
    privateKeyPem: keyPair.privateKey,
    publicKeyPem: keyPair.publicKey,
    csrPem: forge.pki.certificationRequestToPem(csr),
  };
}

export async function storeCertificate(params: {
  tenantId: number;
  credentialId: number;
  certificateType: "ccsid" | "pcsid" | "csr" | "public_key" | "private_key";
  environment: "sandbox" | "production";
  payload: string;
  serialNumber?: string;
  expiresAt?: Date;
}): Promise<void> {
  const db = getDb();
  const encryptedPayload = encryptSecret(params.payload);
  if (!encryptedPayload) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to encrypt certificate" });

  await db.insert(zatcaCertificates).values({
    tenantId: params.tenantId,
    credentialId: params.credentialId,
    certificateType: params.certificateType,
    environment: params.environment,
    serialNumber: params.serialNumber,
    certificateHash: createHash("sha256").update(params.payload).digest("base64"),
    encryptedPayload,
    expiresAt: params.expiresAt,
    isActive: true,
    createdAt: new Date(),
  });
}

export async function updateCredentialCsid(params: {
  tenantId: number;
  csidType: "compliance" | "production";
  environment: "sandbox" | "production";
  csidPem: string;
  privateKeyPem: string;
  publicKeyPem?: string;
}): Promise<void> {
  const db = getDb();
  const existingCredential = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, params.tenantId),
      eq(zatcaCredentials.environment, params.environment),
      eq(zatcaCredentials.isActive, true),
    ),
  });

  if (!existingCredential) {
    throw new TRPCError({ code: "NOT_FOUND", message: "No active credential found for this tenant and environment" });
  }

  const updateFields: Record<string, string | undefined> = {
    certificateEncrypted: encryptSecret(params.csidPem),
    privateKeyEncrypted: encryptSecret(params.privateKeyPem),
  };

  if (params.publicKeyPem) {
    updateFields.publicKeyEncrypted = encryptSecret(params.publicKeyPem);
  }

  if (params.csidType === "compliance") {
    updateFields.complianceCsidEncrypted = encryptSecret(params.csidPem);
  } else {
    updateFields.productionCsidEncrypted = encryptSecret(params.csidPem);
  }

  await db.update(zatcaCredentials)
    .set(updateFields)
    .where(eq(zatcaCredentials.id, existingCredential.id));

  const certDetails = extractCertDetails(params.csidPem);

  await storeCertificate({
    tenantId: params.tenantId,
    credentialId: existingCredential.id,
    certificateType: params.csidType === "compliance" ? "ccsid" : "pcsid",
    environment: params.environment,
    payload: params.csidPem,
    serialNumber: certDetails.serialNumber || undefined,
    expiresAt: certDetails.notAfter || undefined,
  });
}

export async function renewCertificate(
  tenantId: number,
  environment: "sandbox" | "production",
): Promise<CsidRecord> {
  const current = await getActiveCertificate(tenantId, environment);
  if (!current) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "No active certificate to renew" });
  }

  const db = getDb();
  const existingCredential = await db.query.zatcaCredentials.findFirst({
    where: and(
      eq(zatcaCredentials.tenantId, tenantId),
      eq(zatcaCredentials.environment, environment),
      eq(zatcaCredentials.isActive, true),
    ),
  });

  if (!existingCredential) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Credential config not found" });
  }

  await db.update(zatcaCertificates)
    .set({ isActive: false })
    .where(and(
      eq(zatcaCertificates.tenantId, tenantId),
      eq(zatcaCertificates.credentialId, existingCredential.id),
      eq(zatcaCertificates.certificateType, current.csidType === "compliance" ? "ccsid" : "pcsid"),
    ));

  return current;
}

export async function revokeCertificate(
  tenantId: number,
  credentialId: number,
): Promise<void> {
  const db = getDb();

  await db.update(zatcaCertificates)
    .set({ isActive: false })
    .where(and(
      eq(zatcaCertificates.tenantId, tenantId),
      eq(zatcaCertificates.credentialId, credentialId),
    ));

  await db.update(zatcaCredentials)
    .set({
      isActive: false,
      complianceCsidEncrypted: undefined,
      productionCsidEncrypted: undefined,
    })
    .where(and(
      eq(zatcaCredentials.tenantId, tenantId),
      eq(zatcaCredentials.id, credentialId),
    ));
}

export async function verifyAndStoreCsid(params: {
  tenantId: number;
  csidPem: string;
  privateKeyPem: string;
  environment: "sandbox" | "production";
  csidType: "compliance" | "production";
  rootCertPem?: string;
}): Promise<{ valid: boolean; errors: string[]; details: CsidRecord }> {
  const validation = validateCertificateChain(params.csidPem, params.rootCertPem);
  const details = extractCertDetails(params.csidPem);

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
      details: {
        id: 0,
        tenantId: params.tenantId,
        csidType: params.csidType,
        certificatePem: params.csidPem,
        privateKeyPem: params.privateKeyPem,
        publicKeyPem: "",
        serialNumber: details.serialNumber,
        issuer: details.issuer,
        subject: details.subject,
        notBefore: details.notBefore,
        notAfter: details.notAfter,
        isExpired: details.isExpired,
        daysRemaining: details.daysRemaining,
        status: "pending",
        environment: params.environment,
      },
    };
  }

  await updateCredentialCsid({
    tenantId: params.tenantId,
    csidType: params.csidType,
    environment: params.environment,
    csidPem: params.csidPem,
    privateKeyPem: params.privateKeyPem,
  });

  return {
    valid: true,
    errors: [],
    details: {
      id: 0,
      tenantId: params.tenantId,
      csidType: params.csidType,
      certificatePem: params.csidPem,
      privateKeyPem: params.privateKeyPem,
      publicKeyPem: "",
      serialNumber: details.serialNumber,
      issuer: details.issuer,
      subject: details.subject,
      notBefore: details.notBefore,
      notAfter: details.notAfter,
      isExpired: details.isExpired,
      daysRemaining: details.daysRemaining,
      status: "active",
      environment: params.environment,
    },
  };
}

export function getCertificateExpiryWarning(daysRemaining: number): string {
  if (daysRemaining <= 0) return "Certificate has expired";
  if (daysRemaining <= 7) return `Certificate expires in ${daysRemaining} day(s) - URGENT renewal needed`;
  if (daysRemaining <= 30) return `Certificate expires in ${daysRemaining} day(s) - Renewal recommended`;
  if (daysRemaining <= 90) return `Certificate expires in ${daysRemaining} day(s)`;
  return `Certificate valid for ${daysRemaining} days`;
}
