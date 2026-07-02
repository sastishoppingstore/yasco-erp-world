# YASCO ERP Saudi SaaS Master Function Inventory

This file is the source-of-truth function list for upgrading the existing `yasco-erp` without removing current features. All new work must be additive or backward-compatible.

## Research Baseline

- Foodics proves Saudi POS/RMS demand for cloud POS, restaurant management, payments, kitchen display, self-ordering, loyalty, accounting, BI, and marketplace integrations.
- Rewaa proves demand for Arabic-first retail/restaurant/service POS with accounting, inventory, purchases, suppliers, customers, users, payments, and e-invoicing.
- Qoyod proves demand for Saudi accounting, POS, restaurant POS, ZATCA compliance, Saudi-hosted data, inventory linkage, and ecommerce/payment integrations.
- ZATCA requires structured electronic invoices, credit notes, and debit notes. Phase 1 started 2021-12-04 and Phase 2 started 2023-01-01.
- ZATCA technical implementation requires UBL 2.1 XML, EN16931/KSA validation rules, QR, invoice hash, previous invoice hash, cryptographic stamp, certificate lifecycle, clearance/reporting, and immutable records.
- Saudi HR/payroll systems must plan for GOSI, Mudad/WPS, Qiwa contracts, iqama/work permit tracking, attendance, payroll, leave, overtime, EOSB, and Saudization/Nitaqat.
- Saudi construction systems must cover BOQ, WBS, budgets, cost codes, subcontractors, variations, progress billing, retention, advance payments, daily reports, manpower/equipment logs, HSE, and document control.

## Platform/SaaS Functions

- Platform super admin dashboard.
- Tenant/company create, activate, suspend, archive, restore.
- Hard delete must remain restricted and audited.
- Company profile, legal profile, VAT, CR, national address.
- Subscription plans: free, starter, professional, enterprise.
- Plan limits: users, branches, warehouses, products, invoices, devices, storage.
- Module toggles per tenant: Accounting, POS, HR, Construction, Workshop, Healthcare, Pharmacy, Inventory, CRM, AI, BI.
- Billing cycles: monthly/yearly/trial/grace period/past due.
- Subscription invoices and payments.
- Coupon/offers system.
- Reseller/partner management.
- White-label branding per tenant/reseller.
- Tenant health dashboard.
- ZATCA readiness dashboard.
- Failed ZATCA submissions dashboard.
- Support tickets.
- Audited support impersonation.
- Feature flags.
- Global announcements.
- Backup/restore request tracking.
- Data export per tenant.
- Strict tenant isolation.

## Core Company Functions

- Multi-company.
- Multi-branch.
- Multi-warehouse.
- Multi-currency with SAR default.
- Arabic/English UI.
- RTL/LTR support.
- Hijri/Gregorian date support.
- Role-based access control.
- Audit logs.
- Approval workflows.
- Document management.
- Notifications: email, in-app, future WhatsApp/SMS.
- Dashboard builder.
- Report builder.
- Import/export Excel/PDF.
- API/webhook integration layer.

## Accounting and Finance

- Chart of accounts.
- Fiscal years.
- Cost centers.
- Journal entries.
- Journal entry lines.
- Bank/cash accounts.
- Customer ledger.
- Supplier ledger.
- AR/AP.
- Sales invoices.
- Credit notes.
- Debit notes.
- Purchase invoices.
- Customer receipts.
- Supplier payments.
- Bank reconciliation.
- Trial balance.
- General ledger.
- Profit and loss.
- Balance sheet.
- Cashflow.
- VAT return report.
- Multi-branch financial reporting.
- Automatic accounting impact from POS, sales, purchases, inventory, payroll, construction billing, workshop billing, and clinic/pharmacy billing.

## ZATCA Invoice Engine

- Standard Tax Invoice.
- Simplified Tax Invoice.
- Credit Note.
- Debit Note.
- UBL 2.1 XML generation.
- EN16931 validation.
- KSA business rule validation.
- VAT 15 percent standard rate.
- Zero-rated supplies.
- Exempt supplies.
- Out-of-scope supplies.
- VAT category codes.
- SAR default currency.
- Seller VAT/CR/national address.
- Buyer VAT/CR/national address when required.
- Invoice UUID.
- Sequential invoice counter.
- Invoice hash.
- Previous invoice hash chain.
- ECDSA signing.
- XAdES signature.
- Cryptographic stamp.
- QR TLV Base64.
- QR image generation.
- CSR generation.
- EGS/device onboarding.
- Compliance CSID storage.
- Production CSID storage.
- Certificate expiry tracking.
- Sandbox mode.
- Production mode.
- Clearance API for standard invoices.
- Reporting API for simplified invoices.
- Retry queue.
- Failure reasons.
- Immutable archive.
- PDF invoice with embedded/linked XML where applicable.
- ZATCA API logs.
- ZATCA activity logs.
- ZATCA global super-admin health view.

## Inventory and Procurement

- Product categories.
- Brands.
- Units.
- Products/services/raw materials/finished goods.
- SKU/barcode/QR.
- Batch number.
- Serial number.
- Expiry date.
- Multi-warehouse stock.
- Stock balances.
- Stock movements.
- Stock transfers.
- Stock adjustments.
- Purchase requisition.
- RFQ.
- Purchase orders.
- Goods received notes.
- Supplier invoices.
- Landed cost.
- Reorder levels.
- Low stock alerts.
- Inventory valuation.
- Pharmacy expiry alerts.

## POS

- Retail POS.
- Restaurant POS.
- Pharmacy POS.
- Wholesale POS.
- Offline-first cashier mode.
- Cashier session open/close.
- Cashbox.
- Cash/card/transfer/wallet payment methods.
- Receipt printer 58mm/80mm.
- A4 invoice print.
- Barcode scanner.
- Customer display.
- Kitchen display.
- Table/order management.
- Discounts/offers.
- Returns/refunds.
- Hold/resume cart.
- Shift close cash count.
- Every taxable sale must use the ZATCA invoice engine.

## HR and Payroll Saudi

- Employee profiles.
- Departments.
- Designations.
- Contracts.
- Iqama tracking.
- Passport tracking.
- Work permit tracking.
- Qiwa contract fields.
- Attendance.
- Shifts.
- Leave.
- Overtime.
- Payroll.
- Saudi/non-Saudi/GCC rules.
- GOSI-ready calculations/reports.
- Mudad/WPS export.
- EOSB.
- Loans/deductions/allowances.
- Payslips.
- Saudization/Nitaqat dashboard.
- Biometric attendance support.

## Construction Management

- Projects.
- BOQ.
- BOQ import.
- WBS.
- Project budgets.
- Cost codes.
- Estimation.
- Tender/RFQ.
- Bid comparison.
- Contracts.
- Subcontractors.
- Variation orders.
- Progress billing.
- Retention.
- Advance payments.
- Payment certificates.
- Daily site reports.
- Manpower logs.
- Equipment logs.
- Material requests.
- Site store.
- HSE inspections.
- Quality inspections.
- Project WIP reporting.
- Job costing.
- Primavera-compatible scheduling fields.

## Workshop Management

- Customer assets.
- Vehicles/equipment.
- Job cards.
- Estimates.
- Inspections.
- Technician assignment.
- Bay scheduling.
- Spare parts issue.
- Labor time.
- Warranty.
- AMC/service contracts.
- Service reminders.
- Workshop invoice through ZATCA.

## Healthcare, Clinic, and Pharmacy

- Patient registration.
- Appointments.
- Doctors.
- EMR-lite.
- Diagnosis notes.
- Prescriptions.
- Pharmacy POS.
- Medicine inventory.
- Batch/expiry.
- Lab orders.
- Radiology orders.
- Insurance fields.
- Clinic billing through ZATCA.
- Future NPHIES/Wasfaty/SFDA integration fields.

## CRM and Operations

- Leads.
- Opportunities.
- Customers.
- Quotations.
- Sales orders.
- Tasks.
- Meetings.
- Helpdesk.
- Customer portal.
- Vendor portal.
- Employee portal.
- Document repository.
- Workflow builder.

## BI and AI

- Sales dashboard.
- Finance dashboard.
- Inventory dashboard.
- HR dashboard.
- Construction profitability dashboard.
- ZATCA compliance dashboard.
- Super admin SaaS revenue dashboard.
- AI assistant.
- AI reports.
- Forecasting.
- OCR invoice import.
- Anomaly detection.
- Voice assistant.

