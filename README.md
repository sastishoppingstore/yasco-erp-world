# YASCO

Enterprise ERP for finance, inventory, sales, purchase, CRM, HRM, manufacturing, projects, support, assets, and platform growth workflows.

## Login

The app now uses first-party authentication:

- Admin password login
- Email OTP login through SMTP
- Secure HTTP-only session cookie
- Protected ERP layout with logout

Default admin credentials:

```text
Username: wafaweb
Password: Wafa@1122
```

Override these in production:

```env
ADMIN_USERNAME=wafaweb
ADMIN_PASSWORD=change-this-password
ADMIN_EMAIL=admin@yourdomain.com
```

## SMTP OTP

Set SMTP variables to enable real email OTP delivery:

```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=no-reply@yourdomain.com
SMTP_SECURE=false
```

For port `587`, keep `SMTP_SECURE=false` so STARTTLS is used. For port `465`, set `SMTP_SECURE=true`.

If SMTP is not configured in development, the login page shows the OTP for testing. In production, missing SMTP configuration blocks OTP sending.

## Saudi Market Configuration

### 1. Company Legal Profile
Configure your Saudi company identity used on ZATCA invoices, QR codes, and tax documents at `/app/settings/company-legal-information`:
- **Legal Name** (English & Arabic) - Must match your ZATCA registration
- **Trade Name** (English & Arabic)
- **VAT Number** - 15-digit Saudi format (starts with 3, ends with 3)
- **Commercial Registration (CR)** 
- **National Address** - Building number, street, district, city, postal code, additional number
- **CR Expiry Date** & **VAT Certificate Expiry** - For alerts
- **Logo, Stamp, Signature** - For invoice branding
- **Branch Code & Branch CR** - For multi-branch setups
- **Bank Information** - Name, IBAN, account number

### 2. Company Profile
Configure your company branding at `/app/settings/company-profile`:
- Company name, logo, brand color
- Invoice prefix, terms
- Default VAT rate
- Invoice header color (used on printed invoices)
- SMTP settings for email
- WhatsApp integration for invoice sending

### 3. ZATCA Integration
Set up ZATCA Phase 2 at `/app/settings/zatca-integration`:
- Switch between **Sandbox** (testing) and **Production**
- Enter OTP code for CSID onboarding
- Upload CSR, certificate, private/public keys
- Compliance CSID and Production CSID (encrypted storage)
- Device UUID and EGS serial number
- Compliance check testing
- Monitor invoice clearance/reporting status

### 4. Customer Setup
Create customers with full Saudi fields at `/app/sales/customers`:
- **Customer Type**: B2B (requires VAT/CR), B2C, Government, Cash Customer
- **Saudi VAT Registration Number / TIN** - 15-digit validation
- **Commercial Registration (CR)** 
- **National Address** fields
- WhatsApp number for invoice delivery
- B2B customers without VAT number get a warning on invoice creation

### 5. Supplier Setup
Create suppliers with full Saudi fields at `/app/purchase/suppliers`:
- Legal name, trade name, CR, VAT number
- National address, bank information (IBAN)
- Contact person, opening balance

### 6. Invoicing
Create invoices at `/app/sales/invoices` with 8 invoice modes:
- **Product Invoice** - SKU/barcode, description, unit, qty, price, discount, VAT
- **Service Invoice** - Description, unit, qty, rate, VAT
- **Labor/Construction Invoice** - Worker name, unit, total hours, rate/hour, VAT
- **Pharmacy, School, Restaurant, Workshop** - Specialized modes

Invoice features:
- ZATCA QR code generation (TLV tags 1-5)
- UBL 2.1 XML generation
- PDF download with white-label branding (tenant logo/name only)
- WhatsApp/Email send
- Amount in words (English & Arabic)
- Invoice hash chain tracking
- Print functionality

### 7. Offline Mode
The system supports offline-first operation:
- POS works without internet
- Invoices queue locally and sync when online
- ZATCA submission retry on reconnection
- Conflict resolution UI at `/app/sync/conflicts`
- Sync status monitoring at `/app/sync/queue`

### 8. Tauri Desktop App
Build the Windows desktop app:
```bash
npm run build:tauri
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Checks

```bash
npm run lint
npm run check
npm run test
```

`npm run check` currently reports existing project-wide Drizzle/tRPC type issues in older modules. The production build passes.
