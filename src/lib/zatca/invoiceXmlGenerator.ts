// ZATCA-compliant UBL 2.1 XML Generator for Saudi Arabia e-Invoicing
// Compliant with ZATCA Phase 2 specifications (FATOORAH)

export interface ZatcaInvoiceData {
  uuid: string;
  invoiceNumber: string;
  invoiceType: 'standard' | 'simplified'; // standard=B2B clearance, simplified=B2C reporting
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:MM:SS
  previousInvoiceHash?: string;
  sellerName: string;
  sellerNameAr?: string;
  sellerVatNumber: string; // Must start and end with 3, 15 digits
  sellerCrNumber?: string;
  sellerStreet?: string;
  sellerCity?: string;
  sellerPostalCode?: string;
  sellerCountryCode?: string;
  buyerName?: string;
  buyerVatNumber?: string; // Required for B2B
  buyerStreet?: string;
  buyerCity?: string;
  lineItems: Array<{
    id: number;
    description: string;
    quantity: number;
    unitCode?: string;
    unitPrice: number;
    discount?: number;
    vatRate: number; // e.g. 15 for 15%
    vatAmount: number;
    lineTotal: number;       // excl VAT
    lineTotalWithVat: number; // incl VAT
  }>;
  subtotal: number;          // excl VAT
  totalDiscount?: number;
  vatAmount: number;         // 15% VAT
  total: number;             // incl VAT
  currency?: string;         // default SAR
  notes?: string;
}

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function generateZatcaXml(data: ZatcaInvoiceData): string {
  const currency = data.currency || 'SAR';
  const invoiceTypeCode = '388'; // Tax invoice
  // 0100000 = Standard (B2B), 0200000 = Simplified (B2C)
  const invoiceSubTypeCode = data.invoiceType === 'standard' ? '0100000' : '0200000';
  const pih = data.previousInvoiceHash ||
    'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZhNTdlOQ==';

  const lineItemsXml = data.lineItems.map(item => `
    <cac:InvoiceLine>
      <cbc:ID>${item.id}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="${xmlEscape(item.unitCode || 'PCE')}">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${item.lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${item.vatAmount.toFixed(2)}</cbc:TaxAmount>
        <cbc:RoundingAmount currencyID="${currency}">${item.lineTotalWithVat.toFixed(2)}</cbc:RoundingAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${xmlEscape(item.description)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${item.vatRate}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
        <cbc:BaseQuantity unitCode="${xmlEscape(item.unitCode || 'PCE')}">1</cbc:BaseQuantity>
      </cac:Price>
    </cac:InvoiceLine>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:ext:ledgerSignature</ext:ExtensionURI>
      <ext:ExtensionContent>
        <ds:Signature Id="signature">
          <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
            <ds:Reference Id="invoiceSignedData" URI="">
              <ds:Transforms>
                <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
              </ds:Transforms>
              <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
              <ds:DigestValue></ds:DigestValue>
            </ds:Reference>
            <ds:Reference URI="#certificate">
              <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
              <ds:DigestValue></ds:DigestValue>
            </ds:Reference>
          </ds:SignedInfo>
          <ds:SignatureValue></ds:SignatureValue>
          <ds:KeyInfo Id="certificate">
            <ds:X509Data>
              <ds:X509Certificate></ds:X509Certificate>
            </ds:X509Data>
          </ds:KeyInfo>
          <ds:Object>
            <xades:QualifyingProperties Target="#signature">
              <xades:SignedProperties Id="signatureSignedProperties">
                <xades:SignedSignatureProperties>
                  <xades:SigningTime>2024-01-01T00:00:00Z</xades:SigningTime>
                  <xades:SigningCertificate>
                    <xades:Cert>
                      <xades:CertDigest>
                        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                        <ds:DigestValue></ds:DigestValue>
                      </xades:CertDigest>
                      <xades:IssuerSerial>
                        <ds:X509IssuerName></ds:X509IssuerName>
                        <ds:X509SerialNumber>0</ds:X509SerialNumber>
                      </xades:IssuerSerial>
                    </xades:Cert>
                  </xades:SigningCertificate>
                </xades:SignedSignatureProperties>
              </xades:SignedProperties>
            </xades:QualifyingProperties>
          </ds:Object>
        </ds:Signature>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${xmlEscape(data.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${xmlEscape(data.uuid)}</cbc:UUID>
  <cbc:IssueDate>${xmlEscape(data.issueDate)}</cbc:IssueDate>
  <cbc:IssueTime>${xmlEscape(data.issueTime)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${invoiceSubTypeCode}">${invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:Note languageID="ar">${xmlEscape(data.notes || '')}</cbc:Note>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${currency}</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${xmlEscape(data.invoiceNumber)}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${pih}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${xmlEscape(data.sellerCrNumber || '')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${xmlEscape(data.sellerStreet || '')}</cbc:StreetName>
        <cbc:CityName>${xmlEscape(data.sellerCity || '')}</cbc:CityName>
        <cbc:PostalZone>${xmlEscape(data.sellerPostalCode || '')}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${xmlEscape(data.sellerCountryCode || 'SA')}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(data.sellerVatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${xmlEscape(data.sellerName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PostalAddress>
        <cbc:StreetName>${xmlEscape(data.buyerStreet || '')}</cbc:StreetName>
        <cbc:CityName>${xmlEscape(data.buyerCity || '')}</cbc:CityName>
        <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      ${data.buyerVatNumber
        ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(data.buyerVatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>`
        : ''}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${xmlEscape(data.buyerName || '')}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${data.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currency}">${data.subtotal.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currency}">${data.vatAmount.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${data.lineItems[0]?.vatRate || 15}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${data.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${data.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${data.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${currency}">${(data.totalDiscount || 0).toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PrepaidAmount currencyID="${currency}">0.00</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="${currency}">${data.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lineItemsXml}
</Invoice>`;
}

// ─────────────────────────────────────────────
// QR Code TLV generator (ZATCA Phase 2 spec)
// ─────────────────────────────────────────────
export interface QrTlvInput {
  sellerName: string;       // Tag 1
  vatNumber: string;        // Tag 2
  timestamp: string;        // Tag 3 (ISO 8601)
  invoiceTotal: string;     // Tag 4 (inc VAT)
  vatTotal: string;         // Tag 5
}

export function generateQrTlv(input: QrTlvInput & { xmlHash?: string; signature?: string; publicKey?: string; caSignature?: string }): string {
  function tlv(tag: number, value: string): Uint8Array {
    const bytes = new TextEncoder().encode(value || '');
    const out = new Uint8Array(2 + bytes.length);
    out[0] = tag;
    out[1] = bytes.length;
    out.set(bytes, 2);
    return out;
  }

  const parts = [
    tlv(1, input.sellerName),
    tlv(2, input.vatNumber),
    tlv(3, input.timestamp),
    tlv(4, input.invoiceTotal),
    tlv(5, input.vatTotal),
  ];

  if (input.xmlHash) parts.push(tlv(6, input.xmlHash));
  if (input.signature) parts.push(tlv(7, input.signature));
  if (input.publicKey) parts.push(tlv(8, input.publicKey));
  if (input.caSignature) parts.push(tlv(9, input.caSignature));

  const totalLen = parts.reduce((sum, p) => sum + p.length, 0);
  const merged = new Uint8Array(totalLen);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }

  let binary = '';
  merged.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

// ─────────────────────────────────────────────
// Invoice validator
// ─────────────────────────────────────────────
export function validateZatcaInvoice(data: ZatcaInvoiceData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.invoiceNumber) errors.push('Invoice number is required');
  if (!data.sellerVatNumber) errors.push('Seller VAT number is required');
  if (!/^3\d{13}3$/.test(data.sellerVatNumber.replace(/\s/g, ''))) {
    errors.push('VAT number must be 15 digits starting and ending with 3');
  }
  if (!data.uuid) errors.push('UUID (universally unique identifier) is required');
  if (!data.issueDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.issueDate)) {
    errors.push('Issue date must be in YYYY-MM-DD format');
  }
  if (!data.issueTime || !/^\d{2}:\d{2}:\d{2}$/.test(data.issueTime)) {
    errors.push('Issue time must be in HH:MM:SS format');
  }
  if (!data.lineItems || data.lineItems.length === 0) {
    errors.push('At least one line item is required');
  }
  if (data.invoiceType === 'standard' && !data.buyerVatNumber) {
    errors.push('Buyer VAT number is required for standard B2B invoices (clearance)');
  }
  if (data.subtotal < 0) errors.push('Subtotal cannot be negative');
  if (data.vatAmount < 0) errors.push('VAT amount cannot be negative');

  // VAT cross-check
  const vatRate = data.lineItems[0]?.vatRate || 15;
  const expectedVat = parseFloat((data.subtotal * vatRate / 100).toFixed(2));
  const actualVat = parseFloat(data.vatAmount.toFixed(2));
  if (Math.abs(expectedVat - actualVat) > 0.05) {
    errors.push(`VAT amount mismatch: expected ~${expectedVat} (15% of ${data.subtotal}) but got ${actualVat}`);
  }

  // Total cross-check
  const expectedTotal = parseFloat((data.subtotal + data.vatAmount).toFixed(2));
  const actualTotal = parseFloat(data.total.toFixed(2));
  if (Math.abs(expectedTotal - actualTotal) > 0.05) {
    errors.push(`Invoice total mismatch: expected ${expectedTotal} but got ${actualTotal}`);
  }

  return { valid: errors.length === 0, errors };
}
