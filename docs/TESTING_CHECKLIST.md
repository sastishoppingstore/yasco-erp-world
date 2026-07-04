# YASCO ERP - Testing Checklist

## Build & Compilation Tests
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes without errors (frontend + backend)
- [ ] `npm run lint` passes (if available)
- [ ] `npm run check` TypeScript checks pass
- [ ] Tauri build completes (npm run build:tauri)

## Critical Acceptance Tests

### Test 1: Super Admin Company Creation
- [ ] Super Admin can create a new company tenant
- [ ] Company logo upload works
- [ ] CR number saved correctly
- [ ] VAT number saved with 15-digit validation
- [ ] National address saved correctly
- [ ] Brand color selection works
- [ ] Invoice settings save correctly
- [ ] ZATCA sandbox/production mode switch works
- [ ] White-label enabled/disabled toggle works

### Test 2: Company Admin Setup
- [ ] Branch can be created
- [ ] Customer with CR/VAT can be created
  - [ ] Customer type (B2B/B2C/Government/Cash) selection works
  - [ ] CR number field accepts input
  - [ ] VAT number field validates 15-digit Saudi format
  - [ ] National address fields work
  - [ ] WhatsApp number field works
  - [ ] Contact person fields work
  - [ ] Credit limit works
- [ ] Product/Service/Labor items can be created
- [ ] Supplier with CR/VAT can be created

### Test 3: Construction/Labor Invoice
- [ ] Worked month field exists
- [ ] Invoice number auto-generated
- [ ] Issue date and time recorded
- [ ] Due date works
- [ ] Seller legal info displayed correctly (tenant CR, VAT, address)
- [ ] Buyer legal info displayed correctly (customer CR, VAT, address)
- [ ] PO number field works
- [ ] Worker/service line items add/edit/remove works
- [ ] Total hours calculated correctly
- [ ] Rate/hour field works
- [ ] VAT 15% calculated correctly
- [ ] Grand total calculated correctly
- [ ] Amount in words (English) generated
- [ ] Amount in words (Arabic) generated
- [ ] QR code generated and displayed
- [ ] Company website in footer

### Test 4: Invoice White-Label Verification
- [ ] Invoice PDF shows tenant logo (not platform logo)
- [ ] Invoice PDF shows tenant company name (not YASCO)
- [ ] Invoice header color matches tenant brand color
- [ ] No platform branding anywhere on client invoice

### Test 5: Invoice Immutability
- [ ] Draft invoice can be edited
- [ ] Issued invoice cannot be edited
- [ ] Paid invoice cannot be edited
- [ ] ZATCA-cleared invoice cannot be edited
- [ ] Invoice cannot be deleted after issue
- [ ] Cancel workflow exists for issued invoices
- [ ] Credit note corrects original invoice

### Test 6: Credit Note Flow
- [ ] Credit note references original invoice number
- [ ] Credit note reason field works
- [ ] Credit note amount does not exceed invoice total
- [ ] Credit note updates customer balance
- [ ] ZATCA credit note XML generated
- [ ] ZATCA credit note reported/cleared

### Test 7: VAT Report
- [ ] Output VAT report shows correct amounts
- [ ] Input VAT report shows correct amounts
- [ ] VAT return draft generated
- [ ] Effective-date VAT rates respected
- [ ] Old invoices show old VAT rate
- [ ] New invoices show new VAT rate

### Test 8: Arabic/English Bilingual
- [ ] RTL layout works correctly (Arabic mode)
- [ ] LTR layout works correctly (English mode)
- [ ] Invoice prints correctly in Arabic
- [ ] Invoice prints correctly in English
- [ ] Arabic text renders with appropriate font
- [ ] Sidebar direction changes with language
- [ ] Date formats correct per locale

### Test 9: Offline Mode
- [ ] POS works offline
- [ ] Invoice created offline stores in queue
- [ ] Customer created offline stores in queue
- [ ] Sync queue displays pending items
- [ ] When online, sync works automatically
- [ ] Conflict resolution UI works
- [ ] Offline status indicator shows correctly
- [ ] Manual Sync Now button works
- [ ] No data loss after offline operation + sync

### Test 10: POS Core
- [ ] Retail POS loads with products
- [ ] Barcode scanner input works
- [ ] Cart add/remove works
- [ ] Discount application works
- [ ] Payment processing works (cash/card)
- [ ] Receipt prints with QR code
- [ ] Shift opening/closing works
- [ ] Cashbox balance correct
- [ ] Daily closing report generates

### Test 11: Role Permissions
- [ ] Super Admin sees all companies
- [ ] Company Admin sees only own tenant data
- [ ] User without permission cannot access restricted page
- [ ] Branch user sees only own branch data

### Test 12: Cross-Tenant Isolation
- [ ] Company A user cannot see Company B data
- [ ] API returns 404/403 for cross-tenant access
- [ ] Search/filter limited to own tenant
- [ ] Reports show only own tenant data

### Test 13: ZATCA Invoice Creation
- [ ] Standard Tax Invoice creates with all required fields
- [ ] Simplified Tax Invoice creates with minimal fields
- [ ] UBL XML generated correctly
- [ ] QR code generated with correct TLV tags
- [ ] Invoice hash calculated
- [ ] Previous invoice hash linked
- [ ] [Sandbox] Clearance submission works
- [ ] [Sandbox] Reporting submission works
- [ ] Compliance check passes

### Test 14: Mobile Responsive
- [ ] Dashboard renders correctly on mobile (375px)
- [ ] Invoice list renders correctly on mobile
- [ ] Customer creation works on mobile
- [ ] POS works on tablet (768px)
- [ ] Sidebar collapses on mobile
- [ ] Touch targets are adequate (44px minimum)
- [ ] Swipe gestures work where implemented

### Test 15: UI Polish
- [ ] Loading states shown during data fetch
- [ ] Empty states shown when no data
- [ ] Error handling with user-friendly messages
- [ ] Status chips with correct colors
- [ ] Table filters work
- [ ] Export buttons work (CSV/Excel/PDF)
- [ ] Print functionality works
- [ ] Smooth animations present
- [ ] 3D card effects display correctly
- [ ] Glass panel effects display correctly

## Performance Tests
- [ ] Page load < 3 seconds
- [ ] Invoice list loads < 2 seconds (100 items)
- [ ] Search returns results < 1 second
- [ ] Build time < 60 seconds
- [ ] Bundle size < 2MB initial load
- [ ] Memory usage stable after 1 hour use

## Security Tests
- [ ] JWT tokens expire correctly
- [ ] API endpoints reject unauthenticated requests
- [ ] SQL injection not possible (ORM used)
- [ ] XSS not possible (React escaping)
- [ ] ZATCA credentials encrypted at rest
- [ ] SMTP passwords encrypted at rest
- [ ] No API keys exposed in frontend code
- [ ] Rate limiting works on auth endpoints

## Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari
- [ ] PWA installable
- [ ] Tauri desktop app
