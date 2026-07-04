# YASCO ERP - VPS Deployment Guide
## Saudi Market Enhancement Release

### Date: July 3, 2026
### Version: 1.1.0-saudi

---

## What's Included in This Release

### ✅ Completed
1. **Comprehensive Research & Documentation**
   - Saudi market analysis
   - Competitor research (Odoo, Zoho, ERPNext, SAP, Dynamics, NetSuite)
   - Current system audit (85% complete assessment)
   - Gap analysis with P0-P3 priorities
   - Implementation roadmap

2. **Database Schema Enhancements**
   - Company table: 45 new Saudi-specific fields (CR, VAT, trade names, national address, branding)
   - Customer table: 20 new fields (customer type, CR, VAT, national address, validation flags)
   - Supplier table: 22 new fields (legal names, CR, VAT, bank info, national address)
   - 7 new tables: tax_rate_history, tax_categories, attachments, branches, zatca_egs_devices, zatca_invoice_archive, compliance_alerts

3. **SQL Migration File**
   - Production-ready migration script
   - All ALTER TABLE statements for existing tables
   - CREATE TABLE statements for new tables
   - Indexes for performance
   - Default values configured

### 📋 Remaining Work (Next Session)
- Update backend API routers for new fields
- Update frontend forms for Company/Customer/Supplier
- Add Saudi VAT validation (15 digits, starts with 3, ends with 3)
- Add B2B customer CR validation
- Implement attachment upload functionality
- Update invoice templates with Arabic amount in words
- Add dashboard alert widgets
- ZATCA real API integration

---

## Pre-Deployment Checklist

### 1. Backup Current Database
```bash
ssh root@203.161.63.59
cd /home/ubuntu/erp
mysqldump -u root -p erp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Verify Database Connection
```bash
mysql -u root -p
USE erp;
SHOW TABLES;
exit
```

### 3. Check Current System Status
```bash
cd /home/ubuntu/erp
pm2 status
```

---

## Deployment Steps

### Step 1: Upload New Files

From your local machine:
```bash
# Upload migration file
scp db/migrations/0013_saudi_market_enhancements.sql root@203.161.63.59:/home/ubuntu/erp/db/migrations/

# Upload schema enhancement file
scp db/schema-saudi-enhancements.ts root@203.161.63.59:/home/ubuntu/erp/db/

# Upload documentation
scp docs/*.md root@203.161.63.59:/home/ubuntu/erp/docs/
```

### Step 2: Run Database Migration

```bash
ssh root@203.161.63.59
cd /home/ubuntu/erp

# Run migration
mysql -u root -p erp < db/migrations/0013_saudi_market_enhancements.sql

# Verify tables were created
mysql -u root -p erp -e "SHOW TABLES LIKE '%tax%'; SHOW TABLES LIKE '%zatca%'; SHOW TABLES LIKE 'attachments'; SHOW TABLES LIKE 'branches';"

# Check new columns in companies table
mysql -u root -p erp -e "DESCRIBE companies;"

# Check new columns in customers table
mysql -u root -p erp -e "DESCRIBE customers;"

# Check new columns in suppliers table
mysql -u root -p erp -e "DESCRIBE suppliers;"
```

### Step 3: Verify Migration Success

```bash
# Count records (should be unchanged)
mysql -u root -p erp -e "SELECT COUNT(*) FROM companies; SELECT COUNT(*) FROM customers; SELECT COUNT(*) FROM suppliers;"

# Check new tables exist
mysql -u root -p erp -e "SELECT COUNT(*) FROM tax_categories; SELECT COUNT(*) FROM attachments; SELECT COUNT(*) FROM branches;"
```

### Step 4: Restart Application (No Code Changes Yet)

```bash
# This release only adds database columns
# Application will continue to work normally
pm2 restart all
pm2 logs --lines 50
```

### Step 5: Test System Functionality

1. Open browser: `http://203.161.63.59` (or your domain)
2. Login with admin credentials
3. Navigate to Dashboard - should load normally
4. Navigate to Customers - should load normally
5. Navigate to Suppliers - should load normally
6. Navigate to Settings > Company Profile - should load normally
7. Create test invoice - should work normally

**Expected Result:** All existing functionality should work exactly as before. New fields are present in database but not yet visible in UI (that's next session's work).

---

## Rollback Plan (If Needed)

If anything goes wrong:

```bash
# Stop application
pm2 stop all

# Restore database from backup
mysql -u root -p erp < backup_YYYYMMDD_HHMMSS.sql

# Restart application
pm2 restart all
```

---

## Next Session Priorities

### Phase 2A: Backend API Updates (2-3 hours)
1. Update `api/settingsRouter.ts` - add company Saudi fields
2. Update `api/salesRouter.ts` - add customer validation
3. Update `api/purchaseRouter.ts` - add supplier validation
4. Add validation middleware for Saudi VAT format
5. Add validation for B2B customers

### Phase 2B: Frontend UI Updates (3-4 hours)
1. Update Company Legal Info page (`src/pages/settings/CompanyLegalInformation.tsx`)
2. Update Customer form (`src/pages/sales/Customers.tsx`)
3. Update Supplier form (`src/pages/purchase/Suppliers.tsx`)
4. Add attachment upload component
5. Test all forms end-to-end

### Phase 2C: Invoice Enhancements (2-3 hours)
1. Add Arabic amount in words function
2. Create service invoice template
3. Create construction/labor invoice template
4. Add WhatsApp send action
5. Add Email send action

### Phase 2D: Dashboard Alerts (1-2 hours)
1. Create compliance alerts widget
2. Add CR expiry check
3. Add VAT certificate expiry check
4. Add ZATCA CSID expiry check
5. Add overdue invoices widget

---

## File Manifest

### New Files Created
```
/home/ubuntu/erp/
├── db/
│   ├── migrations/
│   │   └── 0013_saudi_market_enhancements.sql (332 lines) ✅
│   └── schema-saudi-enhancements.ts (578 lines) ✅
├── docs/
│   ├── SAUDI_MARKET_RESEARCH.md ✅
│   ├── VIDEO_REVIEW_FINDINGS.md ✅
│   ├── CURRENT_SYSTEM_GAP_ANALYSIS.md ✅
│   ├── MODULE_IMPLEMENTATION_PLAN.md ✅
│   ├── ZATCA_COMPLIANCE_PLAN.md ✅
│   ├── OFFLINE_SYNC_PLAN.md ✅
│   ├── TESTING_CHECKLIST.md ✅
│   ├── IMPLEMENTATION_CHECKLIST.md ✅
│   ├── CURRENT_STATUS.md ✅
│   └── VPS_DEPLOYMENT_GUIDE.md ✅ (this file)
```

### Modified Files
None - this is a non-breaking additive change.

---

## Database Schema Changes Summary

### Companies Table (+45 columns)
- Trade names (EN/AR)
- CR number and expiry
- VAT number and certificate expiry
- Branch code and CR
- National address (9 fields)
- Bank info (5 fields)
- Branding (7 fields)
- Tax configuration (2 fields)
- Invoice prefixes (4 fields)
- White-label settings (2 fields)
- Invoice counter (2 fields)

### Customers Table (+20 columns)
- Customer type (B2B/B2C/Government/Cash)
- CR and VAT numbers
- National address (9 fields)
- Contact person details (3 fields)
- Financial settings (3 fields)
- Validation flags (4 fields)

### Suppliers Table (+22 columns)
- Legal vs trade names (4 fields)
- CR and VAT numbers
- National address (9 fields)
- Bank info (4 fields)
- Contact person (3 fields)
- Supplier categorization (2 fields)

### New Tables (7)
- `tax_rate_history` - Audit trail for tax rate changes
- `tax_categories` - Standard, zero-rated, exempt, out-of-scope, reverse-charge
- `attachments` - CR certificates, VAT certificates, contracts, etc.
- `branches` - Multi-branch support with individual CRs
- `zatca_egs_devices` - EGS device registration for ZATCA Phase 2
- `zatca_invoice_archive` - Immutable invoice audit trail
- `compliance_alerts` - CR/VAT/CSID/iqama expiry alerts

---

## Testing Checklist After Migration

- [ ] Login successful
- [ ] Dashboard loads
- [ ] Customer list loads
- [ ] Supplier list loads
- [ ] Create new customer (basic fields)
- [ ] Create new supplier (basic fields)
- [ ] Create new invoice
- [ ] View existing invoice
- [ ] Company profile loads
- [ ] No JavaScript console errors
- [ ] No API errors in browser network tab
- [ ] PM2 logs show no errors

---

## Support & Troubleshooting

### If Migration Fails

Check error message:
```bash
mysql -u root -p erp < db/migrations/0013_saudi_market_enhancements.sql 2>&1 | tee migration_error.log
cat migration_error.log
```

Common issues:
1. **Table doesn't exist**: Check database name is correct
2. **Column already exists**: Migration already run, check with `DESCRIBE companies;`
3. **Permission denied**: Ensure MySQL user has ALTER TABLE privileges

### If Application Won't Start

```bash
pm2 logs --err --lines 100
cd /home/ubuntu/erp
npm run check  # Check TypeScript
npm run build   # Rebuild
pm2 restart all
```

---

## Success Criteria

✅ Migration runs without errors  
✅ All 7 new tables created  
✅ All new columns added to existing tables  
✅ Application starts successfully  
✅ Dashboard and all pages load  
✅ Existing invoices display correctly  
✅ Can create new customers/suppliers  
✅ No errors in PM2 logs  

---

## Contact & Next Steps

After successful deployment:
1. Confirm all tests pass
2. Schedule next session for backend API updates
3. Provide feedback on any issues encountered
4. Discuss priority features for Phase 2

---

## Credentials Reminder

```
VPS: ssh root@203.161.63.59
Password: 0zIFHt31x2T9ofPd2B
Path: /home/ubuntu/erp
Database: erp
```

---

**Ready to deploy!** 🚀

This migration is designed to be 100% safe and non-breaking. All existing functionality will continue to work exactly as before.
