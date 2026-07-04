# Module Implementation Plan - YASCO ERP

## Phase 1: Saudi Compliance Foundation (Week 1-2)

### 1.1 Company Legal Profile Enhancement
**Status:** Upgrade Existing
**Files:** `src/pages/settings/company-legal-information.tsx`, `db/schema.ts`, `api/zatcaRouter.ts`

Changes:
- Add `tradeNameEn`, `tradeNameAr` fields
- Add `additionalNumber` to national address
- Add `branchCode`, `branchCr` fields
- Add `vatRateEffectiveDate` tracking table
- Add `taxCategories` enum field
- Add CR expiry date, VAT certificate expiry date
- Add stamp/signature upload fields with preview
- Make invoice header color dynamic from tenant primary color

### 1.2 Customer Master Enhancement
**Status:** Upgrade Existing
**Files:** `src/pages/sales/customers.tsx`, `db/schema.ts`, `api/salesRouter.ts`

Changes:
- Add `customerType` enum: b2b, b2c, government, cash_customer
- Add `crNumber` field
- Add `vatNumber` with 15-digit Saudi format validation
- Add `nationalAddress` fields (building, street, district, city, postal, additional)
- Add `whatsapp` field
- Add `contactPerson`, `contactTitle` fields
- Add `openingBalance`, `openingBalanceDate` fields
- Add attachments section (CR copy, VAT cert, contract, PO)
- Add VAT number validation warning on invoice create
- Auto-select invoice type based on customer type

### 1.3 Supplier Master Enhancement
**Status:** Upgrade Existing
**Files:** `src/pages/purchase/suppliers.tsx`, `db/schema.ts`, `api/purchaseRouter.ts`

Changes:
- Add `legalNameEn`, `legalNameAr` fields
- Add `crNumber` field
- Add `vatNumber` with 15-digit Saudi format validation
- Add `nationalAddress` fields
- Add `whatsapp` field
- Add `contactPerson`, `contactTitle`
- Add `bankName`, `bankIban`, `bankAccountNumber`
- Add `openingBalance` field
- Add attachments section
- Add supplier ledger report

### 1.4 ZATCA Module Completion
**Status:** Upgrade Existing
**Files:** `api/zatcaRouter.ts`, `src/pages/settings/zatca-integration.tsx`, `src/lib/zatca/invoiceXmlGenerator.ts`

Changes:
- Implement ICV (Invoice Counter Value) per device
- Implement PIH (Previous Invoice Hash) in XML generation
- Add ECDSA cryptographic stamp placeholder with ZATCA SDK integration points
- Add CSR generation workflow (form fields for CSR generation)
- Add B2C reporting workflow endpoint
- Add B2B clearance workflow endpoint
- Add compliance check testing against ZATCA sandbox
- Add compliance error explanation API (EN/AR/UR languages)
- Add debit note flow
- Add branch/device EGS unit mapping
- Add cancel invoice flow (instead of delete)
- Add credit note from issued invoice flow (instead of edit)
- Enforce no-delete for issued invoices
- Add ZATCA onboarding wizard

## Phase 2: Invoice & Document Enhancement (Week 3-4)

### 2.1 Enhanced Invoice Template
**Status:** Upgrade Existing
**Files:** `src/pages/sales/SaudiInvoicePrint.tsx`, `src/pages/sales/invoices.tsx`

Changes:
- Add invoice type modes: product, service, labor, construction, pharmacy, school, restaurant, workshop
- Add service/labor columns: Sr#, Description, Unit, Total Hours, Rate/Hour, VAT%, VAT Amount, Total
- Add product columns: SKU/Barcode, Description, Unit, Qty, Unit Price, Discount, Taxable Amount, VAT%, VAT Amount, Line Total
- Add amount in words Arabic
- Add company website in footer
- Dynamic brand color usage from tenant settings
- 3D soft-shadow card refinement
- WhatsApp send button
- Email send with PDF attachment
- XML download button
- QR preview modal

### 2.2 Invoice Actions Completion
**Status:** Upgrade Existing
**Files:** `src/pages/sales/invoices.tsx`

Changes:
- Print button
- PDF download (already exists)
- WhatsApp send (already partially exists)
- Email send with attachment
- XML download
- ZATCA status view modal
- QR preview modal
- Credit note from invoice
- Lock invoice after issue

### 2.3 Invoice Immutability
**Status:** New Implementation
**Files:** `api/salesRouter.ts`, `api/zatcaRouter.ts`

Changes:
- Block edit of invoices with zatcaXml, zatcaStatus reported/cleared, or status paid/partial
- Block deletion of any issued invoice
- Add cancel workflow for issued invoices
- Add credit note generation for corrections
- Never allow changing customer/VAT/tax data on locked invoice

## Phase 3: Dashboard & Alerts (Week 3)

### 3.1 Enhanced Dashboard
**Status:** Upgrade Existing
**Files:** `src/pages/Dashboard.tsx`

Changes:
- Role-based dashboard with different widgets per role
- Revenue, expenses, profit cards
- Receivables/payables aging
- ZATCA alerts (expiring CSID, failed invoices)
- VAT alerts (due date, return preparation)
- Expiring CR/VAT certificate alerts
- Employee iqama/contract/GOSI expiry alerts
- Low stock alerts
- Pending approvals widget
- Overdue invoices widget
- AI insights panel
- Mobile card UI layout
- Desktop analytics with charts

## Phase 4: AI Assistant Enhancement (Week 4)

### 4.1 Role-Safe AI
**Status:** Upgrade Existing
**Files:** `src/pages/ai/Chatbot.tsx`, `api/aiChatbotRouter.ts`

Changes:
- Implement role-safe data querying (AI filters by user's tenant + role permissions)
- Support queries: today sales, low stock, pending invoices, customer balance, supplier balance, VAT due, expiring iqamas, project profit, cashbox closing
- Multi-lingual responses (English, Arabic, Urdu)
- Voice input button (HTML Speech Recognition API)
- AI can create draft invoices, quotations, POs, and follow-up tasks after user confirmation
- AI can explain ZATCA compliance errors in simple language

## Phase 5: Vertical Module Completion (Week 5-6)

### 5.1 Pharmacy Module
**Status:** Complete Existing Stubs
**Files:** `src/pages/verticals/pharmacy/*`, `api/pharmacyRouter.ts`

- Prescription management with attachment
- Controlled substance flag
- Batch/expiry tracking integration with inventory
- Insurance/customer integration
- Pharmacy POS integration

### 5.2 Hospital/Clinic Completion
**Status:** Complete Existing Stubs
**Files:** `src/pages/verticals/healthcare/*`, `api/healthcareRouter.ts`

- Full patient registration with medical history
- Appointment booking with calendar
- OPD billing
- IPD admission/discharge/billing
- Lab/radiology order placeholders
- Insurance claim management
- Integration with pharmacy for in-house pharmacy

### 5.3 School Module Completion
**Status:** Complete Existing Stubs
**Files:** `src/pages/verticals/education/*`, `api/educationRouter.ts`

- Full fee voucher generation with installment plans
- Transport fee management
- Exam/grades tracking
- Report card generation
- Parent portal integration
- Integration with HRM for teacher payroll

### 5.4 Restaurant Enhancement
**Status:** Complete Existing Stubs
**Files:** `src/pages/pos/restaurant.tsx`

- Table management with visual layout
- KOT (Kitchen Order Ticket) generation
- Menu item modifiers
- Kitchen display screen (placeholder)
- Delivery/takeaway order management
- Shift closing report
- Integration with inventory for ingredient tracking

## Phase 6: Testing & Deployment (Week 6-7)

### 6.1 Critical Testing Scenarios
- Super Admin creates tenant with logo, CR, VAT
- Company admin creates branch, customer with CR/VAT
- Construction labor invoice with all fields
- Invoice PDF shows tenant branding only
- Invoice locked after issue
- Credit note references original invoice
- VAT report output
- Arabic/English print
- Offline invoice queues and syncs
- Build succeeds

### 6.2 Test Automation
- Unit tests for critical functions
- E2E flow tests for invoicing
- Mobile responsive testing
- Arabic RTL testing
- ZATCA invoice creation testing
- Role permission testing
- Cross-tenant isolation testing
