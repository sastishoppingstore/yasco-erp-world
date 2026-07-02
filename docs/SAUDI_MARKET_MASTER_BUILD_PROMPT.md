# YASCO ERP Saudi-First Master Build Prompt

Build YASCO ERP as a Saudi-first, multi-tenant SaaS platform for thousands of companies and 50k+ day-one users. Do not remove existing modules or flows. Every new function must extend the current platform, reuse shared tenant isolation, permissions, audit logs, and the central ZATCA invoice engine.

## Market Position

Saudi ERP/POS buyers are split across vertical tools and generic suites:

- Restaurant/POS competitors: Foodics, Sapaad, POSRocket-style restaurant stacks.
- Generic cloud ERP: Odoo, Zoho, Oracle NetSuite, SAP Business One, Microsoft Dynamics partners.
- HR/payroll: Ramco, Bayzat-style HR suites, local payroll/GOSI providers.
- ZATCA specialists: invoice-only tools and local system integrators.
- Enterprise integrators: solutions by stc, Ejada, Elm-adjacent providers, Oracle/SAP partners.

YASCO must win by being one SaaS platform where POS, accounting, HR, workshop, construction, hospital, pharmacy, real estate, hotel, education, manufacturing, and services all share the same company setup, subscription control, permissions, inventory, accounting, and ZATCA invoice engine.

## Non-Negotiable Architecture

- Strict tenant isolation on every database query and mutation.
- Platform Super Admin sees tenant metadata, health, plans, billing, modules, and compliance status.
- Company Admin manages only their own company, branches, users, warehouses, settings, operations, and reports.
- Subscription limits must be enforced in backend services, not only in UI.
- Feature flags and module enablement must be checked before protected module actions.
- Sensitive support impersonation must require approval and write immutable audit logs.
- Arabic/English, RTL/LTR, Hijri/Gregorian, SAR, Saudi VAT, GOSI/Mudad-ready HR, and ZATCA Phase 2 must remain default Saudi behavior.

## Shared ZATCA Invoice Engine

All sales flows must call the same invoice engine:

- Accounting sales invoices.
- Retail POS.
- Restaurant POS.
- Pharmacy POS.
- Workshop job-card invoices.
- Hospital/clinic invoices.
- Construction progress billing.
- Real estate rent invoices.
- Education fee invoices.
- Hotel folio invoices.

The engine must support:

- UBL 2.1 XML.
- Standard tax invoice, simplified tax invoice, credit note, debit note.
- VAT 15%, zero-rated, exempt, and out-of-scope category handling.
- Seller/buyer VAT, CR, national address, branch, device, UUID, counter, issue date/time, currency, VAT breakdown.
- Invoice hash and previous invoice hash chain.
- ECDSA signing, XAdES signature, QR TLV Base64, optional PDF/A-3 embedded XML.
- Sandbox/production modes, EGS onboarding, CSR/certificate lifecycle, clearance/reporting queue, retry, failure reason, audit trail.
- Immutable archive: no edit/delete after issue/report/clear/payment. Use credit/debit notes only.

## Build Priority

1. Super Admin + tenant/company system.
2. Subscription plans, module limits, feature flags, tenant health.
3. ZATCA invoice engine and compliance dashboard.
4. Accounting + POS wired to the same invoice engine.
5. Inventory/warehouse.
6. HR/payroll Saudi.
7. Construction.
8. Workshop.
9. Hospital/clinic/pharmacy.
10. BI, reports, exports, backup/restore, monitoring.

## Current Invoice UI Requirements

- Invoice list must expose View, Edit, Delete, Send, Print, and WhatsApp actions.
- Edit/delete are allowed only before invoice issue/payment/ZATCA reporting/clearance.
- Print must show Saudi bilingual invoice with VAT, QR, company/customer identities, and totals.
- WhatsApp must send invoice notification to customer phone/mobile using configured WhatsApp provider.
- Visual treatment should use compact 3D colored action buttons without breaking dense ERP layout.

## Definition of Done

- Database schema/migrations.
- APIs with tenant and permission checks.
- UI screens for Super Admin and Company Admin.
- Audit events for every sensitive action.
- Background workers for queues and retries.
- Tests for tenant isolation, permissions, VAT calculation, ZATCA XML/QR/hash, immutable invoice behavior, and high-volume invoice creation.
- Seed data for plans, modules, roles, Saudi company, sample customers, and sample invoices.
- Deployment guide and compliance checklist.
