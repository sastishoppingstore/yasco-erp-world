# ZATCA and SaaS Super Admin Requirements

## ZATCA Compliance Scope

The invoice module must be treated as a shared platform service. POS, sales, construction progress billing, workshop billing, clinic billing, pharmacy POS, restaurant POS, and subscription billing must all call the same invoice engine.

## Mandatory Invoice Types

- Standard Tax Invoice.
- Simplified Tax Invoice.
- Credit Note.
- Debit Note.

## Mandatory Technical Components

- UBL 2.1 XML generator.
- EN16931 validation.
- KSA-specific business validation.
- XML syntax validation.
- VAT calculation validation.
- ZATCA QR TLV Base64.
- Invoice UUID.
- Invoice counter.
- Invoice hash.
- Previous invoice hash.
- ECDSA signing.
- XAdES XML signature.
- Cryptographic stamp.
- Certificate lifecycle.
- Sandbox onboarding.
- Production onboarding.
- Clearance flow.
- Reporting flow.
- Retry and queue flow.
- Immutable archive.
- API logs and activity logs.

## Company Readiness Checks

Each company must pass:

- Active tenant status.
- Usable subscription status.
- Company profile exists.
- Legal company name exists.
- Saudi VAT number is valid: 15 digits, starts with `3`, ends with `3`.
- CR number configured.
- National address configured.
- Sandbox ZATCA credential configured.
- Production ZATCA credential configured before live sale.
- No expired active ZATCA certificate.
- Certificate renewal warning before expiry.

## SaaS Super Admin Required Screens

- Global dashboard.
- Companies list.
- Company detail.
- Company activate/suspend/archive/restore.
- Plan management.
- Subscription management.
- Billing invoices.
- Payments.
- Coupons/offers.
- ZATCA readiness dashboard.
- ZATCA failed submissions.
- Tenant usage and limits.
- Resellers.
- White-label.
- Support tickets.
- SMTP/email templates.
- Desktop license management.
- Audit logs.
- Support impersonation with audit.
- System settings.

## Tenant Subscription Enforcement

Backend must enforce:

- Product limit.
- User limit.
- Warehouse limit.
- Branch limit.
- Invoice limit when added.
- Device/license limit.
- Trial expiry.
- Grace period expiry.
- Suspended/cancelled tenant blocking.

## Non-Destructive Upgrade Rule

- Do not remove existing routes.
- Do not remove existing UI pages.
- Do not drop existing DB columns/tables.
- New features should use new routes, new procedures, or backward-compatible fields.
- Risky actions must be additive, audited alternatives first. Example: add `archive` and `restore`; keep existing `delete` untouched unless explicitly requested.

