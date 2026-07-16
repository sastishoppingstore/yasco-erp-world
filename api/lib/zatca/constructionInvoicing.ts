/**
 * ZATCA Fatoora E-Invoicing System for Construction
 * Saudi Arabia's Phase 2 E-Invoicing compliance
 * Supports construction-specific requirements and payment certificates
 */

import { createHash } from 'crypto';
import QRCode from 'qrcode';

export interface InvoiceParty {
  name: string;
  registrationNumber: string; // CR or Tax ID
  taxId: string; // VAT Registration Number
  street: string;
  city: string;
  postalCode: string;
  countryCode: string; // ISO 3166-1 alpha-2
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineExtensionAmount: number; // quantity * unitPrice
  taxableAmount: number;
  taxAmount: number;
  itemTaxRate: number; // percentage
  itemCode?: string; // For construction phases or line items
}

export interface ConstructionInvoice {
  // Invoice basics
  invoiceNumber: string;
  invoiceTypeCode: string; // 388 = Invoice, 381 = Credit Note, 383 = Debit Note
  invoiceDate: Date;
  invoiceDueDate: Date;
  
  // Parties
  supplier: InvoiceParty;
  customer: InvoiceParty;
  
  // Construction-specific
  projectName: string;
  projectNumber: string;
  contractNumber: string;
  paymentCertificateNumber?: string; // For milestone billing
  progressPercentage?: number;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Payment terms
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit';
  paymentTerms: string;
  discountAmount?: number;
  
  // Summary
  subtotal: number;
  totalTaxAmount: number;
  totalInvoiceAmount: number;
  retentionAmount?: number;
  netPayableAmount?: number;
  
  // ZATCA fields
  zatcaTransactionId?: string;
  zatcaComplianceStatus?: string;
  zatcaSignature?: string;
  zatcaQrCode?: string;
  zatcaHash?: string;
  
  // Reference
  previousInvoiceHash?: string; // For chaining
  notes?: string;
  internalNotes?: string;
}

export interface ZatcaInvoiceResponse {
  success: boolean;
  invoiceNumber: string;
  qrCode: string;
  hash: string;
  transactionId?: string;
  status: 'pending' | 'compliant' | 'rejected';
  errorMessage?: string;
  complianceTimestamp: Date;
}

/**
 * Format ISO 8601 timestamp for ZATCA
 */
function formatZatcaTimestamp(date: Date): string {
  return date.toISOString().slice(0, 19) + 'Z';
}

/**
 * Serialize invoice data for hashing
 */
function serializeInvoiceForHash(invoice: ConstructionInvoice): string {
  const data = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: formatZatcaTimestamp(invoice.invoiceDate),
    invoiceDueDate: formatZatcaTimestamp(invoice.invoiceDueDate),
    supplierTaxId: invoice.supplier.taxId,
    customerTaxId: invoice.customer.taxId,
    lineItemsCount: invoice.lineItems.length,
    totalTaxAmount: invoice.totalTaxAmount.toFixed(2),
    totalInvoiceAmount: invoice.totalInvoiceAmount.toFixed(2),
    previousInvoiceHash: invoice.previousInvoiceHash || '',
  };
  return JSON.stringify(data);
}

/**
 * Calculate SHA256 hash for invoice
 */
function calculateInvoiceHash(invoice: ConstructionInvoice): string {
  const serialized = serializeInvoiceForHash(invoice);
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Generate ZATCA-compliant QR code
 */
export async function generateZatcaQRCode(
  invoice: ConstructionInvoice,
  signature: string,
  hash: string
): Promise<string> {
  
  const qrData = {
    seller_name: invoice.supplier.name,
    seller_vat: invoice.supplier.taxId,
    invoice_date: formatZatcaTimestamp(invoice.invoiceDate),
    invoice_total: invoice.totalInvoiceAmount.toFixed(2),
    vat_total: invoice.totalTaxAmount.toFixed(2),
    invoice_hash: hash,
    signature: signature,
    signature_algorithm: 'sha256',
  };
  
  const qrContent = Object.entries(qrData)
    .map(([key, value]) => `${key}:${value}`)
    .join('\n');
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `ZA${timestamp}${random}`.toUpperCase();
}

/**
 * Format line item for ZATCA XML
 */
function formatLineItem(item: InvoiceLineItem, lineNumber: number): string {
  return `
    <Invoice.Item>
      <ItemSequenceNumber>${lineNumber}</ItemSequenceNumber>
      <Description>${item.description}</Description>
      <Quantity>
        <Value>${item.quantity}</Value>
        <Unit>UNIT</Unit>
      </Quantity>
      <UnitPrice>${item.unitPrice.toFixed(2)}</UnitPrice>
      <LineExtensionAmount>${item.lineExtensionAmount.toFixed(2)}</LineExtensionAmount>
      <TaxableAmount>${item.taxableAmount.toFixed(2)}</TaxableAmount>
      <ItemTaxRate>${item.itemTaxRate}</ItemTaxRate>
      <ItemTaxAmount>${item.taxAmount.toFixed(2)}</ItemTaxAmount>
      ${item.itemCode ? `<ItemCode>${item.itemCode}</ItemCode>` : ''}
    </Invoice.Item>
  `;
}

/**
 * Generate ZATCA-compliant XML invoice
 */
export function generateZatcaInvoiceXML(invoice: ConstructionInvoice): string {
  const lineItemsXml = invoice.lineItems
    .map((item, idx) => formatLineItem(item, idx + 1))
    .join('\n');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${invoice.invoiceDate.toISOString().split('T')[0]}</cbc:IssueDate>
  <cbc:IssueTime>${invoice.invoiceDate.toISOString().split('T')[1].split('.')[0]}Z</cbc:IssueTime>
  <cbc:DueDate>${invoice.invoiceDueDate.toISOString().split('T')[0]}</cbc:DueDate>
  <cbc:InvoiceTypeCode>${invoice.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  
  <!-- Construction Project Reference -->
  <cac:OrderReference>
    <cbc:ID>${invoice.projectNumber}</cbc:ID>
    <cbc:SalesOrderID>${invoice.contractNumber}</cbc:SalesOrderID>
  </cac:OrderReference>
  
  <!-- Supplier Party -->
  <cac:AccountingSupplierParty>
    <cac:PartyIdentification>
      <cbc:ID schemeID="SA-VAT">${invoice.supplier.taxId}</cbc:ID>
    </cac:PartyIdentification>
    <cac:PartyName>
      <cbc:Name>${invoice.supplier.name}</cbc:Name>
    </cac:PartyName>
    <cac:PostalAddress>
      <cbc:StreetName>${invoice.supplier.street}</cbc:StreetName>
      <cbc:CityName>${invoice.supplier.city}</cbc:CityName>
      <cbc:PostalZone>${invoice.supplier.postalCode}</cbc:PostalZone>
      <cac:Country>
        <cbc:IdentificationCode>${invoice.supplier.countryCode}</cbc:IdentificationCode>
      </cac:Country>
    </cac:PostalAddress>
  </cac:AccountingSupplierParty>
  
  <!-- Customer Party -->
  <cac:AccountingCustomerParty>
    <cac:PartyIdentification>
      <cbc:ID schemeID="SA-VAT">${invoice.customer.taxId}</cbc:ID>
    </cac:PartyIdentification>
    <cac:PartyName>
      <cbc:Name>${invoice.customer.name}</cbc:Name>
    </cac:PartyName>
    <cac:PostalAddress>
      <cbc:StreetName>${invoice.customer.street}</cbc:StreetName>
      <cbc:CityName>${invoice.customer.city}</cbc:CityName>
      <cbc:PostalZone>${invoice.customer.postalCode}</cbc:PostalZone>
      <cac:Country>
        <cbc:IdentificationCode>${invoice.customer.countryCode}</cbc:IdentificationCode>
      </cac:Country>
    </cac:PostalAddress>
  </cac:AccountingCustomerParty>
  
  <!-- Line Items -->
  ${lineItemsXml}
  
  <!-- Tax Summary -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${invoice.totalTaxAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${invoice.totalTaxAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:Percent>15</cbc:Percent>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <!-- Totals -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${invoice.totalInvoiceAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    ${invoice.retentionAmount ? `<cbc:RetentionAmount currencyID="SAR">${invoice.retentionAmount.toFixed(2)}</cbc:RetentionAmount>` : ''}
    <cbc:PayableAmount currencyID="SAR">${(invoice.netPayableAmount || invoice.totalInvoiceAmount).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
</Invoice>`;
  
  return xml;
}

/**
 * Create ZATCA-compliant invoice
 */
export async function createZatcaInvoice(
  invoice: ConstructionInvoice,
  previousInvoiceHash?: string
): Promise<ZatcaInvoiceResponse> {
  
  try {
    // Add previous hash for chaining
    if (previousInvoiceHash) {
      invoice.previousInvoiceHash = previousInvoiceHash;
    }
    
    // Generate transaction ID
    invoice.zatcaTransactionId = generateTransactionId();
    
    // Calculate hash
    const hash = calculateInvoiceHash(invoice);
    invoice.zatcaHash = hash;
    
    // Generate signature (simplified - in production use digital signature)
    const signature = createHash('sha256')
      .update(hash + invoice.zatcaTransactionId)
      .digest('hex');
    invoice.zatcaSignature = signature;
    
    // Generate QR code
    const qrCode = await generateZatcaQRCode(invoice, signature, hash);
    invoice.zatcaQrCode = qrCode;
    
    // Validate VAT rates (15% for Saudi Arabia)
    const isValid = invoice.lineItems.every(item => item.itemTaxRate === 15);
    
    return {
      success: true,
      invoiceNumber: invoice.invoiceNumber,
      qrCode,
      hash,
      transactionId: invoice.zatcaTransactionId,
      status: isValid ? 'compliant' : 'pending',
      complianceTimestamp: new Date(),
    };
    
  } catch (error) {
    return {
      success: false,
      invoiceNumber: invoice.invoiceNumber,
      qrCode: '',
      hash: '',
      status: 'rejected',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      complianceTimestamp: new Date(),
    };
  }
}

/**
 * Create payment certificate invoice (for progress billing)
 */
export function createPaymentCertificateInvoice(
  supplier: InvoiceParty,
  customer: InvoiceParty,
  projectName: string,
  projectNumber: string,
  contractNumber: string,
  certificateNumber: string,
  invoiceDate: Date,
  workItems: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[],
  retentionPercent: number = 5,
  previousInvoiceHash?: string
): ConstructionInvoice {
  
  const lineItems: InvoiceLineItem[] = workItems.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineExtensionAmount: item.quantity * item.unitPrice,
    taxableAmount: item.quantity * item.unitPrice,
    taxAmount: (item.quantity * item.unitPrice) * 0.15,
    itemTaxRate: 15,
    itemCode: 'PC-' + certificateNumber,
  }));
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineExtensionAmount, 0);
  const totalTaxAmount = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const grossAmount = subtotal + totalTaxAmount;
  const retentionAmount = (grossAmount * retentionPercent) / 100;
  const netPayableAmount = grossAmount - retentionAmount;
  
  const dueDateObj = new Date(invoiceDate);
  dueDateObj.setDate(dueDateObj.getDate() + 30); // 30-day payment terms
  
  return {
    invoiceNumber: certificateNumber,
    invoiceTypeCode: '388', // Standard invoice
    invoiceDate,
    invoiceDueDate: dueDateObj,
    supplier,
    customer,
    projectName,
    projectNumber,
    contractNumber,
    paymentCertificateNumber: certificateNumber,
    lineItems,
    paymentMethod: 'bank_transfer',
    paymentTerms: 'NET 30',
    subtotal,
    totalTaxAmount,
    totalInvoiceAmount: grossAmount,
    retentionAmount,
    netPayableAmount,
    previousInvoiceHash,
    notes: `Payment Certificate #${certificateNumber} for ${projectName}`,
  };
}

/**
 * Validate invoice compliance
 */
export function validateInvoiceCompliance(invoice: ConstructionInvoice): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!invoice.invoiceNumber) errors.push('Invoice number is required');
  if (!invoice.supplier.taxId) errors.push('Supplier tax ID is required');
  if (!invoice.customer.taxId) errors.push('Customer tax ID is required');
  if (invoice.lineItems.length === 0) errors.push('At least one line item is required');
  
  // Validate VAT
  invoice.lineItems.forEach((item, idx) => {
    if (item.itemTaxRate !== 15) {
      errors.push(`Line item ${idx + 1}: VAT rate must be 15% for Saudi Arabia`);
    }
    if (item.taxAmount !== (item.taxableAmount * 0.15)) {
      errors.push(`Line item ${idx + 1}: Tax amount mismatch`);
    }
  });
  
  // Validate totals
  const calculatedSubtotal = invoice.lineItems.reduce((sum, item) => 
    sum + item.lineExtensionAmount, 0
  );
  if (Math.abs(calculatedSubtotal - invoice.subtotal) > 0.01) {
    errors.push('Subtotal mismatch');
  }
  
  const calculatedTax = invoice.lineItems.reduce((sum, item) => 
    sum + item.taxAmount, 0
  );
  if (Math.abs(calculatedTax - invoice.totalTaxAmount) > 0.01) {
    errors.push('Tax total mismatch');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
