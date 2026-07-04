# YASCO ERP - Saudi Market Implementation Checklist
## Date: July 3, 2026

## Research Phase ✅ COMPLETED
- [x] Saudi ERP market research completed
- [x] Competitive analysis (Odoo, Zoho, ERPNext, SAP, Dynamics, NetSuite)
- [x] Video review findings documented
- [x] Current system gap analysis completed
- [x] Module implementation plan created
- [x] ZATCA compliance plan documented
- [x] Offline sync plan documented
- [x] Testing checklist prepared

## Priority P0 - Compliance Critical (MUST DO)

### 1. Company Legal Profile Enhancement
- [ ] Add `tradeNameEn` and `tradeNameAr` fields
- [ ] Add `additionalNumber` to national address
- [ ] Add `branchCode` and `branchCr` fields
- [ ] Add `defaultTaxRate` with effective date tracking
- [ ] Add tax categories enum (standard, zero-rated, exempt, out-of-scope, reverse-charge)
- [ ] Add CR expiry date and VAT certificate expiry date
- [ ] Add immutable invoice counter per branch/device
- [ ] Create alert system for expiring CR/VAT certificates
- [ ] Update company profile UI with all new fields
- [ ] Create migration for new fields

### 2. Customer Master Data Enhancement  
- [ ] Add `customerType` enum: B2B, B2C, Government, CashCustomer
- [ ] Add `crNumber` with validation for B2B
- [ ] Add Saudi VAT/TIN validation (15-digit format starting with 3, ending with 3)
- [ ] Add national address fields (building, street, district, city, postal, additionalNumber)
- [ ] Add `whatsapp` field
- [ ] Add `contactPerson` and `contactJobTitle` fields
- [ ] Add `customerGroup` / `customerCategory`
- [ ] Add attachments schema linked to customers (CR copy, VAT cert, contract, PO)
- [ ] Add opening balance date
- [ ] Create B2B customer VAT validation check before invoice creation
- [ ] Update customer form UI with all fields
- [ ] Create migration for customer enhancements

### 3. Supplier Master Data Enhancement
- [ ] Add `legalNameEn` and `legalNameAr` (separate from trade name)
- [ ] Add `crNumber` field
- [ ] Add Saudi VAT/TIN validation
- [ ] Add national address fields
- [ ] Add `bankName`, `iban`, `accountNumber`
- [ ] Add `contactPerson` and `contactJobTitle`
- [ ] Add `whatsapp` field
- [ ] Add attachments schema for suppliers
- [ ] Create supplier ledger report
- [ ] Update supplier form UI
- [ ] Create migration for supplier enhancements

### 4. ZATCA Module Critical Enhancements
- [ ] Implement ICV (Invoice Counter Value) tracking per device
- [ ] Implement PIH (Previous Invoice Hash) linking in XML
- [ ] Add cryptographic stamp (ECDSA signing) - integrate actual ZATCA SDK
- [ ] Implement CSR auto-generation workflow for ZATCA onboarding
- [ ] Build B2C reporting workflow (reporting without clearance)
- [ ] Build B2B clearance workflow with real ZATCA API integration
- [ ] Add compliance error explanation engine (EN/AR/UR)
- [ ] Implement Debit Note flow
- [ ] Add Branch/Device EGS unit mapping table and UI
- [ ] Enforce invoice immutability - no edit after issue
- [ ] Enforce no deletion of issued invoices
- [ ] Build ZATCA compliance test sandbox interaction
- [ ] Build ZATCA production onboarding wizard
- [ ] Implement PDF/A-3 with embedded XML
- [ ] Add ZATCA invoice type auto-selection based on customer type

## Priority P1 - High Business Value

### 5. Premium Invoice Template with Multiple Modes
- [ ] Add Arabic amount in words generator
- [ ] Build Service Invoice mode (columns: Sr#, Description, Unit, Hours, Rate/Hour, VAT, Total)
- [ ] Build Construction/Labor Invoice mode (worker names, hours, rate, VAT)
- [ ] Build Pharmacy Invoice mode (batch, expiry, prescription ref)
- [ ] Build School Fee Invoice mode (student, class, fee description, term)
- [ ] Build Restaurant POS Receipt mode (table, items, modifiers)
- [ ] Build Workshop Job Card Invoice mode (vehicle, job card ref, parts, labor)
- [ ] Add company website in invoice footer
- [ ] Enhance 3D soft-shadow cards on invoice
- [ ] Make brand color dynamic based on tenant primary color
- [ ] Build WhatsApp send invoice action
- [ ] Build Email send invoice action with PDF attachment
- [ ] Build XML download action
- [ ] Create invoice template selector in invoice form

### 6. Dashboard Saudi Alerts
- [ ] Add ZATCA CSID expiry alert widget
- [ ] Add CR expiry alert widget
- [ ] Add VAT certificate expiry alert widget
- [ ] Add employee iqama expiry alert widget
- [ ] Add employee contract expiry alert widget
- [ ] Add employee GOSI non-compliance alert widget
- [ ] Add low stock prominent widget
- [ ] Add pending approvals widget
- [ ] Add overdue invoices widget
- [ ] Add receivables aging widget
- [ ] Add AI insights panel on dashboard
- [ ] Create mobile card-style dashboard layout

### 7. AI Assistant Enhancement
- [ ] Implement role-safe query execution (tenant + role filtering)
- [ ] Add multi-lingual response support (Urdu, Arabic, English)
- [ ] Build "today sales" command
- [ ] Build "low stock" command
- [ ] Build "pending invoices" command
- [ ] Build "customer balance" command
- [ ] Build "supplier balance" command
- [ ] Build "VAT due" command
- [ ] Build "expiring iqama" command
- [ ] Build "project profit" command
- [ ] Build "cashbox closing" command
- [ ] Enable AI to create draft invoices with confirmation
- [ ] Enable AI to create quotations with confirmation
- [ ] Enable AI to create POs with confirmation
- [ ] Build ZATCA error explainer in simple language
- [ ] Make voice input button work universally across app

## Priority P2 - Vertical Module Completion

### 8. Pharmacy Module Completion
- [ ] Add prescription attachment to sale
- [ ] Add controlled item flag to products
- [ ] Enhance batch/expiry tracking with near-expiry alerts
- [ ] Build insurance claim integration
- [ ] Build pharmacy-specific POS template
- [ ] Add pharmacist field to sale
- [ ] Add prescription number to invoice

### 9. Hospital/Clinic Module Completion
- [ ] Build full patient management CRUD
- [ ] Build appointment scheduling with calendar view
- [ ] Build OPD (Out-Patient Department) billing workflow
- [ ] Build IPD (In-Patient Department) basic workflow
- [ ] Build lab test order and result tracking placeholder
- [ ] Build radiology order tracking placeholder
- [ ] Build insurance claim workflow
- [ ] Build patient invoice template

### 10. School Module Completion
- [ ] Build full fee voucher generation
- [ ] Build transport management (routes, vehicles, fees)
- [ ] Build exam management and grade tracking
- [ ] Build report card generation
- [ ] Build parent portal access
- [ ] Build student attendance tracking
- [ ] Build school fee invoice template

### 11. Restaurant/Cafe Module Completion
- [ ] Build table management UI
- [ ] Build KOT (Kitchen Order Ticket) generation
- [ ] Build item modifiers (extra cheese, no onions, etc.)
- [ ] Build kitchen display screen placeholder
- [ ] Build delivery/takeaway workflow
- [ ] Build restaurant shift closing report
- [ ] Build restaurant POS receipt template

## Priority P3 - Infrastructure & Security

### 12. Security Enhancements
- [ ] Implement branch-level permissions in middleware
- [ ] Build 2FA with TOTP (Google Authenticator style)
- [ ] Implement rate limiting on API endpoints
- [ ] Build session management UI
- [ ] Audit all queries to ensure tenantId filtering
- [ ] Add IP whitelisting for Super Admin
- [ ] Add failed login attempt tracking

### 13. Offline Architecture Enhancements
- [ ] Implement local invoice numbering safety per branch/device
- [ ] Enhance ZATCA sync queue with detailed retry log
- [ ] Build offline status indicator component (visible across app)
- [ ] Ensure Manual Sync Now button works reliably
- [ ] Build data loss prevention testing scenarios
- [ ] Add sync progress percentage indicator
- [ ] Build conflict resolution improvements

### 14. UI/UX Refinements
- [ ] Ensure all pages have Arabic RTL perfection
- [ ] Ensure desktop 100% zoom is pixel-perfect
- [ ] Build global search for invoices/customers/products
- [ ] Add quick action FAB buttons on mobile
- [ ] Refine empty states with helpful CTAs
- [ ] Add loading skeletons for all lists
- [ ] Build print-optimized CSS for all reports
- [ ] Add export to Excel on all major lists

## Testing Phase

### 15. Unit Testing
- [ ] Test customer VAT validation
- [ ] Test supplier CR validation
- [ ] Test invoice immutability
- [ ] Test ZATCA QR generation
- [ ] Test UBL XML generation
- [ ] Test tax calculation with different rates
- [ ] Test multi-tenant isolation

### 16. Integration Testing
- [ ] Test customer create → invoice create → ZATCA submit flow
- [ ] Test offline invoice create → sync → ZATCA submit
- [ ] Test credit note against issued invoice
- [ ] Test VAT rate change effective date
- [ ] Test branch user cannot access another branch data
- [ ] Test tenant isolation

### 17. Critical Acceptance Tests (Before Deploy)
- [ ] Super Admin creates tenant with logo, CR, VAT, brand color
- [ ] Company admin creates branch
- [ ] Create B2B customer with CR/VAT fields
- [ ] Create product/service/labor items
- [ ] Create construction labor invoice with all fields
- [ ] Verify invoice PDF shows tenant branding only
- [ ] Verify invoice is locked after issue
- [ ] Create credit note referencing original invoice
- [ ] Verify VAT report shows correct output VAT
- [ ] Test Arabic/English invoice print
- [ ] Test offline invoice queue and sync
- [ ] Verify build succeeds without errors
- [ ] Test mobile responsive on 3 devices
- [ ] Test desktop at 100% zoom

## Deployment Phase

### 18. Pre-Deployment
- [ ] Run `npm install`
- [ ] Run `npm run build` - verify no errors
- [ ] Run `npm run lint` - fix all critical issues
- [ ] Run database migrations on staging
- [ ] Backup production database
- [ ] Test VPS connection

### 19. VPS Deployment
- [ ] SSH to VPS: `ssh root@203.161.63.59`
- [ ] Stop PM2 services
- [ ] Backup current `/home/ubuntu/erp` directory
- [ ] Upload new build files
- [ ] Run database migrations on production
- [ ] Update `.env` file with production credentials
- [ ] Start PM2 services
- [ ] Verify API health endpoint
- [ ] Verify frontend loads
- [ ] Test login
- [ ] Test one invoice creation end-to-end
- [ ] Monitor logs for 10 minutes

### 20. Post-Deployment Documentation
- [ ] Create CHANGELOG.md with all changes
- [ ] Create DATABASE_MIGRATION_NOTES.md
- [ ] Create TESTING_REPORT.md with screenshots
- [ ] Generate sample Saudi ZATCA invoice PDF
- [ ] Generate sample POS receipt
- [ ] Generate sample construction labor invoice
- [ ] Update README with new configuration steps
- [ ] Document CR/VAT/ZATCA/SMTP/WhatsApp setup
- [ ] Document VAT rate configuration
- [ ] Document invoice branding configuration

## Success Criteria
- ✅ All P0 items completed
- ✅ All 17 critical acceptance tests pass
- ✅ Build succeeds with zero errors
- ✅ Database migrations run successfully
- ✅ VPS deployment completes without errors
- ✅ System accessible and functional on live VPS
- ✅ Documentation complete and accurate
