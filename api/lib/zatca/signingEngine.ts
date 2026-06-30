import { createHash, createSign, createVerify, generateKeyPairSync, randomUUID } from "node:crypto";

export type SignatureAlgorithm = "RSA-SHA256" | "ECDSA-SHA256";

export type KeyPair = {
  privateKey: string;
  publicKey: string;
  algorithm: SignatureAlgorithm;
};

export type SignatureResult = {
  signature: string;
  signatureAlgorithm: SignatureAlgorithm;
  signingTime: string;
  certificateHash: string;
};

function sha256Base64(value: string): string {
  return createHash("sha256").update(value).digest("base64");
}

function certFingerprint(certPem: string): string {
  return sha256Base64(certPem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, ""));
}

export function generateKeyPair(algorithm: SignatureAlgorithm = "ECDSA-SHA256"): KeyPair {
  if (algorithm === "RSA-SHA256") {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    return { privateKey, publicKey, algorithm };
  }

  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "secp256k1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { privateKey, publicKey, algorithm };
}

export function signXml(
  unsignedXml: string,
  privateKeyPem: string,
  algorithm: SignatureAlgorithm = "ECDSA-SHA256",
): SignatureResult {
  const signer = createSign(algorithm);
  signer.update(unsignedXml);
  signer.end();
  const signature = signer.sign(privateKeyPem, "base64");
  const signingTime = new Date().toISOString();

  return {
    signature,
    signatureAlgorithm: algorithm,
    signingTime,
    certificateHash: sha256Base64(privateKeyPem),
  };
}

export function verifySignature(
  xml: string,
  signature: string,
  publicKeyPem: string,
  algorithm: SignatureAlgorithm = "ECDSA-SHA256",
): boolean {
  try {
    const verifier = createVerify(algorithm);
    verifier.update(xml);
    verifier.end();
    return verifier.verify(publicKeyPem, signature, "base64");
  } catch {
    return false;
  }
}

export function computeInvoiceHash(xml: string): string {
  return createHash("sha256").update(xml).digest("base64");
}

export type PdfMetadata = {
  title: string;
  author: string;
  subject: string;
  producer: string;
};

export function generatePadesPlaceholder(
  pdfBuffer: Buffer,
  signature: string,
  certificatePem: string,
  metadata?: PdfMetadata,
): Buffer {
  const attachXml = Buffer.from(signature, "base64");
  const pdfContent = pdfBuffer.toString("binary");
  const certB64 = Buffer.from(certificatePem).toString("base64");

  const padesBlock = `
%PAdES-LTV
/Type /Metadata
/Subtype /XML
/Length ${attachXml.length}
>> stream
<Signature>${signature}</Signature>
<Certificate>${certB64}</Certificate>
endstream
endobj
`;

  const modifiedPdf = pdfContent.replace(
    "%%EOF",
    `${padesBlock}\n%%EOF`,
  );

  return Buffer.from(modifiedPdf, "binary");
}

export function createCsrPem(
  privateKeyPem: string,
  commonName: string,
  organizationName: string,
  countryCode: string,
  emailAddress?: string,
): string {
  const { createPrivateKey } = require("node:crypto");
  const key = createPrivateKey(privateKeyPem);

  const csrAttrs: Array<{ name: string; value: string }> = [
    { name: "commonName", value: commonName },
    { name: "organizationName", value: organizationName },
    { name: "countryName", value: countryCode },
  ];

  if (emailAddress) {
    csrAttrs.push({ name: "emailAddress", value: emailAddress });
  }

  const forge = require("node-forge");
  const pki = forge.pki;
  const privKey = pki.privateKeyFromPem(privateKeyPem);
  const cert = pki.createCertificationRequest();
  cert.publicKey = privKey.publicKey;
  cert.setSubject(csrAttrs.map((attr) => ({
    name: attr.name,
    value: attr.value,
  })));
  cert.sign(privKey);

  return forge.pki.certificationRequestToPem(cert);
}

export function extractPublicKeyFromCertificate(certPem: string): string {
  try {
    const forge = require("node-forge");
    const pki = forge.pki;
    const cert = pki.certificateFromPem(certPem);
    return pki.publicKeyToPem(cert.publicKey);
  } catch {
    return "";
  }
}

export function validateCertificateChain(
  certPem: string,
  rootCertPem?: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const forge = require("node-forge");
    const pki = forge.pki;

    const cert = pki.certificateFromPem(certPem);
    const now = new Date();

    if (cert.validity.notBefore > now) {
      errors.push("Certificate is not yet valid (notBefore > now)");
    }
    if (cert.validity.notAfter < now) {
      errors.push("Certificate has expired (notAfter < now)");
    }

    if (rootCertPem) {
      try {
        const caCert = pki.certificateFromPem(rootCertPem);
        const caStore = pki.createCaStore([caCert]);
        if (!pki.verifyCertificateChain(caStore, [cert])) {
          errors.push("Certificate chain verification failed");
        }
      } catch {
        errors.push("Failed to verify certificate chain against CA");
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`Failed to parse certificate: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { valid: false, errors };
  }
}

export function extractCertDetails(certPem: string): {
  serialNumber: string;
  issuer: string;
  subject: string;
  notBefore: Date | null;
  notAfter: Date | null;
  isExpired: boolean;
  daysRemaining: number;
} {
  try {
    const forge = require("node-forge");
    const pki = forge.pki;
    const cert = pki.certificateFromPem(certPem);
    const now = new Date();
    const notAfter = cert.validity.notAfter;
    const daysRemaining = notAfter
      ? Math.ceil((notAfter.getTime() - now.getTime()) / 86400000)
      : 0;

    return {
      serialNumber: cert.serialNumber,
      issuer: cert.issuer?.attributes?.map((a: { name?: string; value?: string }) => `${a.name}=${a.value}`).join(", ") || "",
      subject: cert.subject?.attributes?.map((a: { name?: string; value?: string }) => `${a.name}=${a.value}`).join(", ") || "",
      notBefore: cert.validity.notBefore || null,
      notAfter: notAfter || null,
      isExpired: notAfter ? notAfter < now : true,
      daysRemaining,
    };
  } catch {
    return {
      serialNumber: "",
      issuer: "",
      subject: "",
      notBefore: null,
      notAfter: null,
      isExpired: true,
      daysRemaining: 0,
    };
  }
}
