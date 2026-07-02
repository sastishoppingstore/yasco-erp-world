# Implementation Steps

## Phase 0: Server Safety

1. Backup source files before every deployment.
2. Backup database before migrations.
3. Keep PM2 rollback files.
4. Do not run destructive git commands.
5. Do not remove existing functions.

## Phase 1: SaaS Foundation

1. Add subscription status API.
2. Add tenant usage API.
3. Add super admin archive/restore.
4. Add global readiness API.
5. Add ZATCA failure API.
6. Add UI cards for SaaS health.
7. Add backend limit checks to product/user/warehouse creation.

## Phase 2: ZATCA Core

1. Verify company legal profile.
2. Verify VAT format.
3. Generate UBL XML.
4. Validate XML.
5. Generate QR.
6. Generate invoice hash.
7. Link previous hash.
8. Sign XML.
9. Store XML and QR.
10. Submit to sandbox.
11. Submit to production.
12. Add failure retry queue.

## Phase 3: Accounting and POS Integration

1. Route every sales invoice through ZATCA engine.
2. Route every POS sale through ZATCA engine.
3. Route credit/debit notes through ZATCA engine.
4. Add accounting impact after successful invoice creation.
5. Add cashier shift close reports.

## Phase 4: HR Saudi

1. Add employee legal fields.
2. Add GOSI-ready payroll outputs.
3. Add Mudad/WPS export.
4. Add Qiwa contract tracking fields.
5. Add EOSB.
6. Add Saudization dashboard.

## Phase 5: Construction

1. BOQ and WBS finalization.
2. Cost code reporting.
3. Subcontractor workflows.
4. Variation orders.
5. Progress billing through ZATCA.
6. Retention and advance payment handling.
7. Daily reports and manpower/equipment logs.

## Phase 6: Workshop

1. Vehicle/equipment asset registry.
2. Job cards.
3. Inspections.
4. Parts issue from inventory.
5. Labor billing.
6. Workshop invoice through ZATCA.

## Phase 7: Healthcare and Pharmacy

1. Patient registration.
2. Appointments.
3. EMR-lite.
4. Prescriptions.
5. Pharmacy batch/expiry stock.
6. Clinic/pharmacy invoice through ZATCA.

## Phase 8: BI and AI

1. Super admin SaaS revenue dashboard.
2. Company finance dashboard.
3. ZATCA compliance dashboard.
4. AI report assistant.
5. Forecasting.
6. OCR import.

## Phase 9: Launch

1. Pilot one company.
2. Run ZATCA sandbox test.
3. Run production onboarding.
4. Verify invoice archive.
5. Verify subscriptions.
6. Verify tenant isolation.
7. Verify backups.
8. Open sales onboarding for more companies.

