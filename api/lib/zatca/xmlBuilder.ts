import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";

export const ZATCA_REASON_CODES = {
  IB: "01", // Incorrect in accordance with Business agreements
  RETURN_OF_GOODS: "02",
  PRICE_ADJUSTMENT: "03",
  BAD_DEBTS: "04",
  OTHER: "05",
} as const;

export type ZatcaReasonCode = keyof typeof ZATCA_REASON_CODES;

const REASON_CODE_LABELS: Record<ZatcaReasonCode, string> = {
  IB: "Incorrect in accordance with Business agreements",
  RETURN_OF_GOODS: "Return of goods",
  PRICE_ADJUSTMENT: "Price adjustment",
  BAD_DEBTS: "Bad debts",
  OTHER: "Other",
};

export type InvoiceLine = {
  id: number;
  quantity: number;
  unitCode?: string;
  lineExtensionAmount: number;
  taxPercent: number;
  taxAmount: number;
  taxCategory?: "S" | "E" | "Z" | "O";
  itemName: string;
  unitPrice: number;
  discountAmount?: number;
};

export type SupplierParty = {
  streetName: string;
  buildingNumber: string;
  district: string;
  city: string;
  postalCode: string;
  countryCode: string;
  vatNumber: string;
  legalName: string;
  additionalId?: string;
  crNumber?: string;
  phone?: string;
  email?: string;
};

export type CustomerParty = {
  vatNumber?: string;
  legalName: string;
  streetName?: string;
  buildingNumber?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  additionalId?: string;
};

export type InvoiceTotals = {
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  taxPercent: number;
  totalAmount: number;
  shippingAmount?: number;
  prepaidAmount?: number;
  payableAmount?: number;
};

export type ZatcaExtension = {
  signature: string;
  publicKey: string;
  certificateHash: string;
  invoiceHash: string;
  previousInvoiceHash: string;
  signedXml: string;
};

function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function fmt(amount: number): string {
  return amount.toFixed(2);
}

export function buildZatcaXml(params: {
  invoiceNumber: string;
  uuid?: string;
  issueDate: string;
  issueTime: string;
  invoiceType: "standard" | "simplified" | "credit_note" | "debit_note";
  currency?: string;
  supplier: SupplierParty;
  customer: CustomerParty;
  lines: InvoiceLine[];
  totals: InvoiceTotals;
  previousInvoiceHash?: string;
  signature?: string;
  publicKey?: string;
  certificateHash?: string;
  invoiceCounter?: number;
}): { xml: string; invoiceHash: string } {
  const uuid = params.uuid || randomUUID();
  const currency = params.currency || "SAR";
  const profileId = params.invoiceType === "standard" ? "reporting:1.0" : "reporting:1.0";
  const clearanceProfile = params.invoiceType === "standard" ? "clearance:1.0" : "reporting:1.0";
  const invoiceTypeCode = params.invoiceType === "standard" ? "0100000" : "0200000";
  const documentTypeCode = params.invoiceType === "credit_note" ? "381" : params.invoiceType === "debit_note" ? "383" : "388";
  const invoiceTypeName = params.invoiceType === "credit_note" ? "0200000" : params.invoiceType === "debit_note" ? "0300000" : invoiceTypeCode;

  const linesXml = params.lines.map((line, index) => {
    const taxCategory = line.taxCategory || "S";
    const lineDiscount = line.discountAmount || 0;
    const lineTotal = line.lineExtensionAmount;
    return `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="${line.unitCode || "PCE"}">${line.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${fmt(lineTotal)}</cbc:LineExtensionAmount>
      <cac:AllowanceCharge>
        <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
        <cbc:AllowanceChargeReason>Discount</cbc:AllowanceChargeReason>
        <cbc:Amount currencyID="${currency}">${fmt(lineDiscount)}</cbc:Amount>
      </cac:AllowanceCharge>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${fmt(line.taxAmount)}</cbc:TaxAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${xmlEscape(line.itemName)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${taxCategory}</cbc:ID>
          <cbc:Percent>${fmt(line.taxPercent)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${fmt(line.unitPrice)}</cbc:PriceAmount>
        <cbc:BaseQuantity unitCode="${line.unitCode || "PCE"}">${line.quantity}</cbc:BaseQuantity>
      </cac:Price>
    </cac:InvoiceLine>`;
  }).join("");

  const taxSubtotalLines = aggregateTaxCategoryTotals(params.lines, currency);

  const supplierAdditionalId = params.supplier.additionalId
    ? `<cac:PartyIdentification><cbc:ID schemeID="CRN">${xmlEscape(params.supplier.additionalId)}</cbc:ID></cac:PartyIdentification>`
    : params.supplier.crNumber
      ? `<cac:PartyIdentification><cbc:ID schemeID="CRN">${xmlEscape(params.supplier.crNumber)}</cbc:ID></cac:PartyIdentification>`
      : "";

  const customerVatBlock = params.customer.vatNumber
    ? `<cac:PartyTaxScheme><cbc:CompanyID>${xmlEscape(params.customer.vatNumber)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>`
    : `<cac:PartyTaxScheme><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>`;

  const customerAdditionalId = params.customer.additionalId
    ? `<cac:PartyIdentification><cbc:ID schemeID="CRN">${xmlEscape(params.customer.additionalId)}</cbc:ID></cac:PartyIdentification>`
    : "";

  const customerAddressLines = params.customer.streetName
    ? `
        <cac:PostalAddress>
          <cbc:StreetName>${xmlEscape(params.customer.streetName)}</cbc:StreetName>
          <cbc:BuildingNumber>${xmlEscape(params.customer.buildingNumber || "")}</cbc:BuildingNumber>
          <cbc:CitySubdivisionName>${xmlEscape(params.customer.district || "")}</cbc:CitySubdivisionName>
          <cbc:CityName>${xmlEscape(params.customer.city || "")}</cbc:CityName>
          <cbc:PostalZone>${xmlEscape(params.customer.postalCode || "")}</cbc:PostalZone>
          <cac:Country><cbc:IdentificationCode>${xmlEscape(params.customer.countryCode || "SA")}</cbc:IdentificationCode></cac:Country>
        </cac:PostalAddress>`
    : "";

  const icvBlock = params.invoiceCounter
    ? `<cac:AdditionalDocumentReference><cbc:ID>ICV</cbc:ID><cbc:UUID>${uuid}</cbc:UUID></cac:AdditionalDocumentReference>`
    : "";

  const pihBlock = params.previousInvoiceHash
    ? `<cac:AdditionalDocumentReference><cbc:ID>PIH</cbc:ID><cbc:UUID>${params.previousInvoiceHash}</cbc:UUID></cac:AdditionalDocumentReference>`
    : "";

  const creditNoteBlock = (params.invoiceType === "credit_note" || params.invoiceType === "debit_note")
    ? `  <cac:BillingReference><cac:InvoiceDocumentReference><cbc:ID>${xmlEscape(params.customer.vatNumber || "")}</cbc:ID></cac:InvoiceDocumentReference></cac:BillingReference>
  <cac:DiscrepancyResponse><cbc:ReferenceID>${xmlEscape(params.customer.vatNumber || "")}</cbc:ReferenceID><cbc:Description>Correction</cbc:Description></cac:DiscrepancyResponse>`
    : "";

  const unsignedXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"
  xmlns:xades141="http://uri.etsi.org/01903/v1.4.1#">
  <cbc:ProfileID>${clearanceProfile}</cbc:ProfileID>
  <cbc:ID>${xmlEscape(params.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${params.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${params.issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${invoiceTypeName}">${documentTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${currency}</cbc:TaxCurrencyCode>
  <cbc:BuyerReference>${xmlEscape(params.customer.legalName)}</cbc:BuyerReference>
  ${icvBlock}
  ${pihBlock}
  ${creditNoteBlock}
  <cac:AccountingSupplierParty>
    <cac:Party>
      ${supplierAdditionalId}
      <cac:PostalAddress>
        <cbc:StreetName>${xmlEscape(params.supplier.streetName)}</cbc:StreetName>
        <cbc:BuildingNumber>${xmlEscape(params.supplier.buildingNumber)}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${xmlEscape(params.supplier.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${xmlEscape(params.supplier.city)}</cbc:CityName>
        <cbc:PostalZone>${xmlEscape(params.supplier.postalCode)}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${xmlEscape(params.supplier.countryCode)}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(params.supplier.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${xmlEscape(params.supplier.legalName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${customerAdditionalId}
      ${customerAddressLines}
      ${customerVatBlock}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${xmlEscape(params.customer.legalName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReason>Discount</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="${currency}">${fmt(params.totals.discountAmount)}</cbc:Amount>
  </cac:AllowanceCharge>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${fmt(params.totals.taxAmount)}</cbc:TaxAmount>
    ${taxSubtotalLines}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${fmt(params.totals.subTotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${fmt(params.totals.subTotal - params.totals.discountAmount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${fmt(params.totals.totalAmount)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${currency}">${fmt(params.totals.discountAmount)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="${currency}">${fmt(params.totals.payableAmount || params.totals.totalAmount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${linesXml}
</Invoice>`;

  const invoiceHash = createHash("sha256").update(unsignedXml).digest("base64");

  return { xml: unsignedXml, invoiceHash };
}

function aggregateTaxCategoryTotals(lines: InvoiceLine[], currency: string): string {
  const categories = new Map<string, { taxable: number; tax: number; percent: number }>();

  for (const line of lines) {
    const cat = line.taxCategory || "S";
    const existing = categories.get(cat) || { taxable: 0, tax: 0, percent: line.taxPercent };
    existing.taxable += line.lineExtensionAmount;
    existing.tax += line.taxAmount;
    categories.set(cat, existing);
  }

  return Array.from(categories.entries()).map(([cat, vals]) => `
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${fmt(vals.taxable)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${fmt(vals.tax)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${cat}</cbc:ID>
        <cbc:Percent>${fmt(vals.percent)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`).join("");
}

export function buildCreditNoteXml(params: {
  invoiceNumber: string;
  billingReferenceId: string;
  uuid?: string;
  issueDate: string;
  issueTime: string;
  currency?: string;
  supplier: SupplierParty;
  customer: CustomerParty;
  lines: InvoiceLine[];
  totals: InvoiceTotals;
  reasonCode?: ZatcaReasonCode;
  reason?: string;
}): { xml: string; invoiceHash: string } {
  const uuid = params.uuid || randomUUID();
  const currency = params.currency || "SAR";
  const rc = params.reasonCode || "OTHER";
  const reasonCode = ZATCA_REASON_CODES[rc];
  const reasonLabel = REASON_CODE_LABELS[rc];
  const reason = params.reason || reasonLabel;

  const linesXml = params.lines.map((line, index) => {
    const taxCategory = line.taxCategory || "S";
    return `
    <cac:CreditNoteLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:CreditedQuantity unitCode="${line.unitCode || "PCE"}">${line.quantity}</cbc:CreditedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${fmt(line.lineExtensionAmount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${fmt(line.taxAmount)}</cbc:TaxAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${xmlEscape(line.itemName)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${taxCategory}</cbc:ID>
          <cbc:Percent>${fmt(line.taxPercent)}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${fmt(line.unitPrice)}</cbc:PriceAmount>
      </cac:Price>
    </cac:CreditNoteLine>`;
  }).join("");

  const supplierAdditionalId = params.supplier.crNumber
    ? `<cac:PartyIdentification><cbc:ID schemeID="CRN">${xmlEscape(params.supplier.crNumber)}</cbc:ID></cac:PartyIdentification>`
    : "";

  const unsignedXml = `<?xml version="1.0" encoding="UTF-8"?>
<CreditNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${xmlEscape(params.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${params.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${params.issueTime}</cbc:IssueTime>
  <cbc:CreditNoteTypeCode name="0200000">381</cbc:CreditNoteTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${currency}</cbc:TaxCurrencyCode>
  <cbc:InstructionNote>${reasonCode} - ${xmlEscape(reason)}</cbc:InstructionNote>
  <cac:DiscrepancyResponse>
    <cbc:ReferenceID>${xmlEscape(params.billingReferenceId)}</cbc:ReferenceID>
    <cbc:Description>${xmlEscape(reason)}</cbc:Description>
  </cac:DiscrepancyResponse>
  <cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>${xmlEscape(params.billingReferenceId)}</cbc:ID>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      ${supplierAdditionalId}
      <cac:PostalAddress>
        <cbc:StreetName>${xmlEscape(params.supplier.streetName)}</cbc:StreetName>
        <cbc:BuildingNumber>${xmlEscape(params.supplier.buildingNumber)}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${xmlEscape(params.supplier.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${xmlEscape(params.supplier.city)}</cbc:CityName>
        <cbc:PostalZone>${xmlEscape(params.supplier.postalCode)}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${xmlEscape(params.supplier.countryCode)}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(params.supplier.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(params.supplier.legalName)}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(params.customer.vatNumber || "")}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(params.customer.legalName)}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${fmt(params.totals.taxAmount)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${fmt(params.totals.subTotal)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${fmt(params.totals.taxAmount)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${fmt(params.totals.taxPercent)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${fmt(params.totals.subTotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${fmt(params.totals.subTotal - params.totals.discountAmount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${fmt(params.totals.totalAmount)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${fmt(params.totals.payableAmount || params.totals.totalAmount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${linesXml}
</CreditNote>`;

  const invoiceHash = createHash("sha256").update(unsignedXml).digest("base64");
  return { xml: unsignedXml, invoiceHash };
}

export function buildDebitNoteXml(params: {
  invoiceNumber: string;
  billingReferenceId: string;
  uuid?: string;
  issueDate: string;
  issueTime: string;
  currency?: string;
  supplier: SupplierParty;
  customer: CustomerParty;
  lines: InvoiceLine[];
  totals: InvoiceTotals;
  reasonCode?: ZatcaReasonCode;
  reason?: string;
}): { xml: string; invoiceHash: string } {
  const uuid = params.uuid || randomUUID();
  const currency = params.currency || "SAR";
  const rc = params.reasonCode || "OTHER";
  const reasonCode = ZATCA_REASON_CODES[rc];
  const reasonLabel = REASON_CODE_LABELS[rc];
  const reason = params.reason || reasonLabel;

  const linesXml = params.lines.map((line, index) => {
    const taxCategory = line.taxCategory || "S";
    return `
    <cac:DebitNoteLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:DebitedQuantity unitCode="${line.unitCode || "PCE"}">${line.quantity}</cbc:DebitedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${fmt(line.lineExtensionAmount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${fmt(line.taxAmount)}</cbc:TaxAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${xmlEscape(line.itemName)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${taxCategory}</cbc:ID>
          <cbc:Percent>${fmt(line.taxPercent)}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${fmt(line.unitPrice)}</cbc:PriceAmount>
      </cac:Price>
    </cac:DebitNoteLine>`;
  }).join("");

  const unsignedXml = `<?xml version="1.0" encoding="UTF-8"?>
<DebitNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:DebitNote-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${xmlEscape(params.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${params.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${params.issueTime}</cbc:IssueTime>
  <cbc:DebitNoteTypeCode name="0300000">383</cbc:DebitNoteTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${currency}</cbc:TaxCurrencyCode>
  <cbc:InstructionNote>${reasonCode} - ${xmlEscape(reason)}</cbc:InstructionNote>
  <cac:DiscrepancyResponse>
    <cbc:ReferenceID>${xmlEscape(params.billingReferenceId)}</cbc:ReferenceID>
    <cbc:Description>${xmlEscape(reason)}</cbc:Description>
  </cac:DiscrepancyResponse>
  <cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>${xmlEscape(params.billingReferenceId)}</cbc:ID>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(params.supplier.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(params.supplier.legalName)}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(params.customer.vatNumber || "")}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(params.customer.legalName)}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${fmt(params.totals.taxAmount)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${fmt(params.totals.subTotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${fmt(params.totals.subTotal - params.totals.discountAmount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${fmt(params.totals.totalAmount)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${fmt(params.totals.payableAmount || params.totals.totalAmount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${linesXml}
</DebitNote>`;

  const invoiceHash = createHash("sha256").update(unsignedXml).digest("base64");
  return { xml: unsignedXml, invoiceHash };
}

export function wrapWithExtensions(unsignedXml: string, ext: ZatcaExtension): string {
  const { signature, publicKey, certificateHash, invoiceHash, previousInvoiceHash, signedXml } = ext;
  const signatureValue = signature;
  const signingTime = new Date().toISOString();

  const extensionsBlock = `
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
      <ext:ExtensionContent>
        <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="signature">
          <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
            <ds:Reference URI="">
              <ds:Transforms>
                <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
              </ds:Transforms>
              <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
              <ds:DigestValue>${invoiceHash}</ds:DigestValue>
            </ds:Reference>
          </ds:SignedInfo>
          <ds:SignatureValue>${signatureValue}</ds:SignatureValue>
          <ds:KeyInfo>
            <ds:X509Data>
              <ds:X509SubjectName>CN=${certificateHash}</ds:X509SubjectName>
              <ds:X509Certificate>${publicKey}</ds:X509Certificate>
            </ds:X509Data>
          </ds:KeyInfo>
          <ds:Object>
            <xades:QualifyingProperties Target="signature">
              <xades:SignedProperties>
                <xades:SignedSignatureProperties>
                  <xades:SigningTime>${signingTime}</xades:SigningTime>
                  <xades:SigningCertificate>
                    <xades:Cert>
                      <xades:CertDigest>
                        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                        <ds:DigestValue>${certificateHash}</ds:DigestValue>
                      </xades:CertDigest>
                      <xades:IssuerSerial>
                        <ds:X509IssuerName>CN=ZATCA-Phase2</ds:X509IssuerName>
                        <ds:X509SerialNumber>1</ds:X509SerialNumber>
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
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:zatca:extension:invoice</ext:ExtensionURI>
      <ext:ExtensionContent>
        <InvoiceExtensions xmlns="urn:zatca:extension:invoice:1.0">
          <PreviousInvoiceHash>${previousInvoiceHash}</PreviousInvoiceHash>
          <InvoiceHash>${invoiceHash}</InvoiceHash>
          <DigitalSignature>${signatureValue}</DigitalSignature>
          <PublicKey>${publicKey}</PublicKey>
          <CertificateHash>${certificateHash}</CertificateHash>
        </InvoiceExtensions>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>`;

  return unsignedXml.replace("</Invoice>", `${extensionsBlock}\n</Invoice>`);
}

export function buildBase64QrPayload(params: {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalAmount: number;
  taxAmount: number;
  invoiceHash: string;
  digitalSignature: string;
  publicKey: string;
  signature: string;
}): string {
  const tags: Array<[number, string]> = [
    [1, params.sellerName],
    [2, params.vatNumber],
    [3, params.timestamp],
    [4, params.totalAmount.toFixed(2)],
    [5, params.taxAmount.toFixed(2)],
    [6, params.invoiceHash],
    [7, params.digitalSignature],
    [8, params.publicKey],
    [9, params.signature],
  ];

  const parts = tags.map(([tag, value]) => {
    const bytes = new TextEncoder().encode(value || "");
    const out = new Uint8Array(2 + bytes.length);
    out[0] = tag;
    out[1] = bytes.length;
    out.set(bytes, 2);
    return out;
  });

  const merged = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }

  return Buffer.from(merged).toString("base64");
}
