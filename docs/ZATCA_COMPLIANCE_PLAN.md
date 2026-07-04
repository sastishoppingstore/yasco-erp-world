# ZATCA Compliance Implementation Plan

## Overview
ZATCA (Zakat, Tax and Customs Authority) Phase 2 e-invoicing (Fatoora) requires:
1. Generation of UBL 2.1 XML for each invoice
2. Cryptographic stamping (ECDSA signing)
3. QR code with 5 TLV tags
4. B2B: Real-time clearance via ZATCA API
5. B2C: Reporting within 24 hours
6. Invoice hash chain linking
7. PDF/A-3 with embedded XML

## Current State
- ✅ UBL 2.1 XML generation with basic fields
- ✅ QR code generation (TLV tag 1-5)
- ✅ UUID generation
- ✅ Invoice hash (SHA-256)
- ✅ Previous invoice hash (PIH) tracking in database
- ✅ CSID management fields (encrypted)
- ✅ Sandbox/production mode switch
- ✅ Encrypted credential storage
- ✅ ZATCA API logging
- ✅ Status tracking: pending, cleared, reported, failed
- ✅ Offline invoice queue with retry
- ✅ XML/PDF archive

## Implementation Plan

### Step 1: Complete UBL 2.1 XML (Week 1)
Current XML is basic. Need full UBL 2.1 compliant XML with:
- Complete Invoice/cac:Signature with cryptographic stamp
- Complete cac:AccountingSupplierParty with all fields
- Complete cac:AccountingCustomerParty with all fields
- cac:Delivery fields
- cac:PaymentMeans
- cac:PaymentTerms
- cac:AllowanceCharge (discounts)
- cac:TaxTotal with correct sub-tax breakdowns
- cac:LegalMonetaryTotal with all amount types
- cac:InvoiceLine with all 23 UBL fields per line
- cac:StandardItemIdentification (GTIN)
- cac:Country fields
- Correct InvoiceTypeCode mapping
- AdditionalDocumentReference for QR and PIH

### Step 2: Cryptographic Stamp Integration (Week 1-2)
- Integrate ECDSA signing using the CSID certificate private key
- Generate proper XAdES-BES signature
- Include signing certificate reference
- Create proper digest values and signature values
- Validate against ZATCA SDK

### Step 3: B2B Clearance Workflow (Week 2)
- Submit invoice XML to ZATCA clearance API
- Handle clearance response (clearance code, cleared status)
- Handle rejection (error code, error message)
- Retry logic with exponential backoff
- Clearance status polling
- Webhook for clearance status update

### Step 4: B2C Reporting Workflow (Week 2)
- Simplified submission to ZATCA reporting API
- Reporting status tracking
- Batch reporting for offline invoices
- Report within 24-hour window

### Step 5: CSR Generation & CSID Onboarding (Week 2-3)
- CSR generation form with required fields:
  - Organization name (EN/AR)
  - Organization identifier (VAT number)
  - Serial number (EGS serial)
  - Unit name
  - Branch name
  - Industry code
- Submit CSR to ZATCA for compliance CSID
- Submit compliance CSID for production CSID
- Certificate renewal workflow

### Step 6: Invoice Hash Chain (Week 1 - Already Partial)
- Current: hash stored in DB per invoice
- Need: Link each invoice hash to previous invoice hash in XML
- Maintain chain per device/EGS unit
- Handle chain breaks (first invoice of day/device)
- Store hash in SQL for audit

### Step 7: ICV Management (Week 1)
- ICV = Invoice Counter Value per device/EGS unit
- Auto-increment per device
- Reset tracking per day
- Include in XML and QR

### Step 8: PDF/A-3 with Embedded XML (Week 2)
- Use pdf-lib to create PDF/A-3
- Embed UBL XML as attachment
- Ensure PDF/A-3 compliance
- Visual invoice + machine-readable XML in one file

### Step 9: Compliance Error Handling (Week 3)
- Map ZATCA error codes to human-readable messages
- Provide explanations in English, Arabic, Urdu
- Guided resolution steps per error
- Error categorization (validation, system, clearance)

### Step 10: Production Onboarding Wizard (Week 3)
- Step-by-step wizard for ZATCA production setup
- Environment selection (sandbox first → production)
- Credential input with encrypted storage
- Compliance check testing
- Production CSID request
- Invoice counter initialization
- Hash chain initialization

## Key Tables Required

```sql
-- Already exists: zatca_credentials, zatca_certificates, zatca_api_logs, zatca_qr_codes, zatca_xml_documents, zatca_invoice_status, zatca_activity_logs, e_invoice_documents, tax_credentials, tax_integrations, tax_submissions, tax_submission_logs
```

## Critical Rules (Immutable)
1. Never edit an issued invoice
2. Never delete an issued invoice
3. Use credit note for corrections
4. Use cancel workflow for voiding
5. Old invoices locked with old tax rate
            
## ZATCA API Endpoints
- /compliance: Compliance check submission
- /clearance/single: Single invoice clearance
- /clearance/batch: Batch clearance (future)
- /reporting/single: Single invoice reporting
- /reporting/batch: Batch reporting
- /certificates/csr: CSR generation request
