# YASCO ERP - Current System Gap Analysis

## Audit Date: July 3, 2026
## Codebase: React/Vite + Hono/trpc + MySQL/Drizzle + Tauri

## Executive Summary
The system is already extremely comprehensive with 110+ API routers, 9000+ lines of routes, advanced ZATCA Phase 2 compliance, offline sync, multi-tenant architecture, and 15+ industry verticals. This analysis identifies remaining gaps and improvement areas.

---

## 1. Company Legal Profile

### ✅ Already Implemented
- Company legal name (EN/AR)
- VAT number (15-digit Saudi validation)
- CR number
- Building number, street, district, city, postal code
- Logo, stamp, signature placeholders
- Bank name, IBAN, account number
- Brand color, invoice theme
- ZATCA sandbox/production switch
- CSID fields (encrypted storage)

### 🔴 Gaps to Fix
- Add `tradeNameEn` / `tradeNameAr`
- Add `additionalNumber` to national address
- Add branch code, branch CR
- Add default tax rate with effective date tracking (Super Admin controlled)
- Add tax categories: standard, zero-rated, exempt, out-of-scope, reverse-charge
- Immutable invoice counter per branch/device
- Never overwrite old invoice tax settings after issue
- CR expiry date, VAT certificate expiry alerts

---

## 2. Customer Master Data

### ✅ Already Implemented
- Customer name (EN/AR)
- Tax number field
- Credit limit, payment terms
- Phone, email, city, address
- Opening balance (via balance field)
- Active/inactive status

### 🔴 Gaps to Fix
- Customer type: B2B company, B2C individual, government, cash customer
- CR number validation for B2B customers
- Saudi VAT Registration Number / TIN validation (check if 15-digit Saudi format)
- National address fields (building number, street, district, city, postal code, additional number)
- WhatsApp field
- Contact person with job title
- Attachments: CR copy, VAT certificate, contract, PO
- Warning when B2B customer has no VAT number
- Auto-select invoice type based on customer type
- Customer group/category
- Opening balance date
- Credit limit check before invoice creation

---

## 3. Supplier Master Data

### ✅ Already Implemented
- Supplier name (EN/AR)
- Tax number
- Credit limit, payment terms
- Phone, email, city, address

### 🔴 Gaps to Fix
- Supplier legal name EN/AR (separate from trade name)
- CR number
- Saudi VAT Registration Number / TIN validation
- National address fields
- Bank name, IBAN, account number
- Contact person
- WhatsApp field
- Opening balance
- Supplier ledger report
- Attachments: CR copy, VAT certificate, contract

---

## 4. ZATCA / FATOORA Module

### ✅ Already Implemented
- Phase 1 and Phase 2 readiness
- Standard Tax Invoice
- Simplified Tax Invoice
- Credit note flow
- UBL XML generation
- QR code generation (TLV tags 1-5)
- UUID generation
- Invoice hash chain (SHA-256)
- CSID onboarding fields (OTP, CSR, certificate, keys)
- Compliance CSID / Production CSID
- Sandbox / production switch
- Encrypted credential storage (AES-256-GCM)
- ZATCA API logs
- Status tracking: pending, cleared, reported, failed
- Offline invoice queue
- Retry mechanism
- XML archive
- PDF archive preview
- Immutable invoice audit log

### 🔴 Gaps to Fix
- ICV (Invoice Counter Value) tracking per device
- PIH (Previous Invoice Hash) linking in XML
- Cryptographic stamp (ECDSA signing) placeholder - needs actual ZATCA SDK integration
- CSR generation workflow (auto-generate CSR for ZATCA)
- B2C reporting workflow (reporting without clearance)
- B2B clearance workflow with ZATCA API
- Compliance error explanation in simple English/Arabic/Urdu
- Debit note flow
- Branch/device EGS unit mapping per device
- Invoice counter management per branch
- Cancel/credit-note flow disallowing edit of issued invoices
- Never allow deletion of issued invoices (already partially done)
- ZATCA compliance check testing (sandbox interaction)
- ZATCA production onboarding wizard
- PDF/A-3 with embedded XML

---

## 5. Invoice Design

### ✅ Already Implemented
- Premium A4 template with 3D cards
- Logo top-left
- Company name top-center
- "TAX INVOICE / قاتورة ضريبية" title
- QR code top-right
- Seller card, Buyer card
- Status badges
- Summary box with subtotal, tax, total
- Amount in words (EN)
- VAT labeling correct
- ZATSA QR display
- Print, PDF download
- Invoice header with all standard fields
- Product line items

### 🔴 Gaps to Fix
- Amount in words Arabic
- Service invoice mode columns (Sr#, Description, Unit, Total Hours, Rate/Hour, VAT, Total)
- Construction / labor invoice mode
- Pharma invoice mode
- School fee invoice mode
- Restaurant POS receipt mode
- Workshop job-card invoice mode
- Company website in footer
- 3D soft-shadow card refinement
- Brand color boxes using tenant primary color (dynamic)
- No platform branding on client-facing invoice (already tenant-only)
- WhatsApp send action
- Email send action with attachment
- XML download action
- Multiple invoice type templates

---

## 6. Core Modules

### ✅ Already Implemented
- Dashboard (role-based, with KPIs)
- Accounting (COA, JE, GL, TB, BS, P&L, Cash Flow)
- Sales (customers, quotations, orders, invoices, credit notes, payments)
- Purchase (suppliers, POs, GRN, payments, requisitions)
- Inventory (products, warehouses, stock, movements, adjustments, transfers)
- HRM (employees, attendance, leave, payroll, Saudi payroll, GOSI, WPS, EOSB)
- CRM (leads, opportunities, activities)
- Manufacturing (BOM, work orders, production)
- Projects (projects, tasks, timesheets)
- Workshop (job cards, vehicles, estimates, technicians, inspections, bays)
- POS (retail, restaurant, pharmacy, wholesale)
- Cashbox, Installments
- Platform (Growth Engine, Solution Library)
- Admin (website, master control, reseller, licenses)
- Reports (financial, ZATCA, custom)
- Settings (company profile, ZATCA, legal info)
- Branch management
- Documents
- Sync (queue, logs, conflicts, devices, settings)
- AI (chatbot, reports, forecasting, automation, voice)
- BI (dashboard builder, report builder)
- EDI, Webhooks, OLAP, ETL
- Construction (WBS, BOQ, contracts, variations, subcontractors, HSE, compliance)
- Healthcare (patients, appointments, roster, insurance)
- Education (students, admissions, fees, schedules, report cards)
- Hotel (rooms, bookings, housekeeping, folio billing)
- Transport (fleet, routes, drivers, maintenance, shipments)
- Real Estate (properties, leases, rent invoicing, maintenance, commissions)
- Travel (bookings, suppliers, itineraries, reconciliation)
- Aviation (flights, crew, maintenance, parts)
- WMS (zones, locations, putaway, picking, cycle count)
- SCM (supplier evaluation, RFQ, bids, contracts, portal)
- MRP II (MPS, capacity, MRP runs, pegging)
- Consolidation, IFRS 15, IFRS 16
- Mobile pages
- Portal (customer, vendor, employee)
- Help Desk, Assets, Fleet
- Collaboration (sessions, presence, notifications)
- Workflow builder & editor
- Plugin marketplace
- Compliance (data protection, audit, security)
- Notification channels & templates

### 🔴 Gaps/Improvements
- Dashboard needs ZATCA alerts, CSID expiry, CR expiry, VAT alerts
- Employee iqama/GOSI/contract expiry alerts
- Low stock alerts more prominent
- Pending approvals widget
- Overdue invoices widget
- AI insights panel
- Mobile card-style dashboard

---

## 7. Security & Multi-Tenancy

### ✅ Already Implemented
- Tenant isolation via tenantId on all tables
- RBAC via middleware
- Encrypted secrets (AES-256-GCM)
- JWT auth
- Audit logs
- Soft delete patterns

### 🔴 Gaps
- Branch-level permissions
- 2FA readiness (OTP exists but no TOTP)
- Rate limiting
- Session management UI
- No tenant can access another tenant's data (verify all queries filter by tenantId)

---

## 8. Offline Architecture

### ✅ Already Implemented
- Dexie (IndexedDB) local store
- Sync queue with pending/failed/conflict states
- Sync engine with retry
- Conflict resolution UI
- Device management
- Offline settings
- Local database status page
- Background sync

### 🔴 Gaps
- Local invoice numbering per branch/device
- ZATCA sync queue with retry log (exists but needs enhanced status tracking)
- Offline status indicator (UI component exists but may need refinement)
- Manual Sync Now button exists
- Need to ensure no data loss scenario testing

---

## 9. AI Assistant

### ✅ Already Implemented
- Chatbot page
- Voice input page
- AI reports page
- AI forecasting page
- AI automation page

### 🔴 Gaps
- Role-safe query execution (AI must not expose another tenant's data)
- Multi-lingual (Urdu, Arabic, English) support in AI responses
- Specific commands: today sales, low stock, pending invoices, customer balance, supplier balance, VAT due, expiring iqama, project profit, cashbox closing
- AI can create draft invoices, quotations, POs after confirmation
- AI can explain ZATCA errors
- Voice input button should work universally

---

## 10. Vertical Modules (New Additions)

### 🔴 Need to Build/Enhance
- **Pharmacy**: Prescription attachment, controlled item flag, batch/expiry tracking, insurance integration with Pharmacy POS
- **Hospital/Clinic**: Full patient management, appointment scheduling, OPD/IPD billing, lab/radiology links, insurance claims
- **School**: Full fee voucher generation, transport management, exam/grades tracking, report cards
- **Restaurant/Cafe**: Table management, KOT (Kitchen Order Ticket), modifiers, kitchen display, delivery/takeaway, shift closing

Note: These modules already have basic page stubs but need functional completion.

---

## Priority Ranking

### P0 (Immediate - Compliance Critical)
1. ZATCA B2B clearance and B2C reporting workflow
2. Invoice immutability enforcement
3. Customer CR/VAT validation
4. Tax rate effective-date tracking

### P1 (High Business Value)
5. Enhanced Saudi invoice template with all modes
6. Customer supplier enhancements (attachments, national address)
7. AI assistant enhancements
8. Dashboard alerts (ZATCA, CR, VAT, iqama expiries)

### P2 (Medium)
9. Pharmacy/Hospital/School vertical completion
10. Restaurant POS enhancements
11. Offline sync enhancements

### P3 (Nice to Have)
12. 2FA implementation
13. Branch-level permissions
14. Rate limiting
