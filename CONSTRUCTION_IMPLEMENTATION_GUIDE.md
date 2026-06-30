# YASCO CONSTRUCTION ERP - DETAILED IMPLEMENTATION GUIDE

## 🎯 VISION
Transform YASCO ERP into world-class construction management system with Windows desktop app for site teams, full Saudi Arabia compliance, and enterprise-grade features competing with HAL ERP, SAP Construction, and Oracle.

---

## 📊 CURRENT STATUS ASSESSMENT

### What Already Exists ✅
- **22+ Database Tables**: Projects, WBS, BOQ, contracts, subcontractors, equipment, billing, safety, compliance
- **70+ tRPC APIs**: CRUD operations for all core entities
- **Tauri v2 Desktop Foundation**: React + TypeScript + Rust native commands ready
- **Compliance Frameworks**: Qiwa, ZATCA, Nitaqat, GOSI libraries present
- **Queue System**: BullMQ + Redis for background jobs
- **Security**: Biometric auth, hardware fingerprinting, license keys

### What's Missing ❌
1. **Windows Desktop App for Site Teams** (Field operations)
2. **Real-time Job Costing Engine** (Actual vs. Budget tracking)
3. **Payment Certificate Workflow** (SAR formatting, ZATCA integration, approvals)
4. **Qiwa Full Integration** (OAuth2, visa quota, worker sync)
5. **Analytics Dashboards** (KPIs, portfolio view, real-time updates)
6. **Quality Management** (NCR, punch lists, defect tracking)
7. **BIM Viewer** (3D model integration)
8. **Municipality Permits** (Balady integration)

### What's Incomplete ⚠️
- Nitaqat automation (calc exists, UI/alerts missing)
- HSE workflow (tables exist, incident investigation missing)
- ZATCA testing (router exists, production validation needed)
- Document management (basic only)
- Equipment tracking (no GPS, preventive maintenance)

---

## 🏗️ PHASE 1: FOUNDATION (Weeks 1-8)

### Sprint 1-2: Windows Desktop App + Payment Certs

**Windows Desktop App Architecture:**
```
Tauri v2 Window (React Component)
├── Offline-First Store (Dexie IndexedDB)
├── Sync Queue (BullMQ events)
├── Biometric Auth (Tauri plugin)
├── Camera/Photo (Tauri shell commands)
├── Voice-to-Text (Windows API)
└── Auto-Sync Service (background when online)

Main Process (Rust):
├── Hardware fingerprinting
├── System notifications
├── Camera integration
├── Audio recording
└── Process monitoring
```

**Payment Certificate Workflow:**
```
Progress Billing Data
    ↓
Auto-Generate Certificate
    ↓
Send for Approval (Role-based routing)
    ↓
E-Sign (ZATCA integration)
    ↓
Generate PDF with QR
    ↓
Record Payment Schedule
    ↓
Send Notification
```

**Key Database Additions:**
```sql
-- Payment Certificates
CREATE TABLE paymentCertificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  progressBillingId INT,
  certificateNumber VARCHAR(50) UNIQUE,
  certificateAmount DECIMAL(15,2),
  retentionAmount DECIMAL(15,2),
  paymentAmount DECIMAL(15,2),
  status ENUM('draft', 'pending', 'approved', 'signed', 'paid'),
  zatcaQrCode TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (progressBillingId) REFERENCES progressBilling(id)
);

-- Certificate Approvals (multi-step)
CREATE TABLE certificateApprovals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  certificateId INT,
  approverRole ENUM('pm', 'finance', 'principal'),
  approverUserId INT,
  status ENUM('pending', 'approved', 'rejected'),
  signatureBlob LONGBLOB,
  approvedAt TIMESTAMP,
  FOREIGN KEY (certificateId) REFERENCES paymentCertificates(id)
);

-- Offline Sync Queue
CREATE TABLE syncQueue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,
  operationType ENUM('create', 'update', 'delete'),
  entityType VARCHAR(50),
  entityId INT,
  payload JSON,
  syncStatus ENUM('pending', 'synced', 'failed'),
  retryCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  syncedAt TIMESTAMP
);
```

**API Endpoints (tRPC):**
```typescript
// Payment Certificate
export const paymentCertRouter = createRouter({
  generateFromBilling: authedMutation
    .input(z.object({ progressBillingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Auto-calculate retention, taxes
      // Generate certificate
      // Send for approval to PM
    }),

  approve: authedMutation
    .input(z.object({ 
      certificateId: z.number(),
      approverRole: z.enum(['pm', 'finance', 'principal']),
      signature: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate approver role
      // Store approval with signature
      // If all approved → auto-sign with ZATCA
      // Generate PDF
    }),

  list: authedQuery
    .input(z.object({ 
      projectId: z.number().optional(),
      status: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      // Return certificates with approval status
    }),

  exportPDF: authedQuery
    .input(z.object({ certificateId: z.number() }))
    .query(async ({ input }) => {
      // Generate PDF with SAR formatting
      // Add ZATCA QR code
      // Return binary
    })
});
```

**Desktop App Components:**
```
src/pages/construction/DesktopApp.tsx
├── Layout (offline indicator, sync status)
├── DailyReportForm
│   ├── Photo upload (batch)
│   ├── Weather conditions
│   ├── Workers present (count + names)
│   ├── Equipment status
│   ├── Incidents (voice-to-text)
│   └── Voice notes
├── OfflineQueue
│   ├── Pending uploads
│   ├── Retry failed
│   └── Sync now button
└── QuickDashboard
    ├── Project status
    ├── Today's tasks
    └── Notifications
```

**Implementation Checklist:**
- [ ] Create Tauri window configuration
- [ ] Implement Dexie schema for offline cache
- [ ] Build sync conflict resolution logic
- [ ] Create payment certificate schema
- [ ] Build approval workflow routing
- [ ] Implement ZATCA e-signature integration
- [ ] Create PDF generation with QR codes
- [ ] Test offline→online sync
- [ ] Build installer for Windows

---

### Sprint 3-4: Job Costing + Qiwa Integration

**Job Costing Engine:**
```
Invoice Received
    ↓
Parse (Amount, Category, WBS Item)
    ↓
Allocate to WBS (Child rolls up to parent)
    ↓
Calculate Variance (Actual vs Budget)
    ↓
Check Thresholds (5%, 10%, 20%)
    ↓
Generate Alert if breached
    ↓
Update Real-time Dashboard
```

**Database Schema:**
```sql
CREATE TABLE jobCostingDetails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT,
  wbsItemId INT,
  costCategoryId INT,  -- Labor, Materials, Equipment, etc.
  budgetAmount DECIMAL(15,2),
  actualAmount DECIMAL(15,2),
  forecastAmount DECIMAL(15,2),
  variancePercent DECIMAL(5,2),
  varianceType ENUM('budget', 'schedule', 'quality'),
  status ENUM('on_track', 'warning', 'critical'),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES constructionProjects(id),
  FOREIGN KEY (wbsItemId) REFERENCES wbsItems(id)
);

-- Alerts
CREATE TABLE costVarianceAlerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT,
  jobCostingDetailId INT,
  thresholdPercent INT,  -- 5, 10, 20
  alertSeverity ENUM('warning', 'critical'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledgedBy INT,
  acknowledgedAt TIMESTAMP
);
```

**Qiwa Integration (OAuth2):**
```
User Clicks "Login with Qiwa"
    ↓
Redirect to Qiwa OAuth Endpoint
    ↓
User approves scopes
    ↓
Qiwa returns Auth Code
    ↓
Backend exchanges Code for Token
    ↓
Store Token in Redis (TTL 24h)
    ↓
Sync Visa Quotas Hourly
    ↓
Fetch Worker Statuses
    ↓
Update Dashboard in Real-time
```

**API Integration:**
```typescript
// Qiwa OAuth endpoints
export const qiwaRouter = createRouter({
  getAuthUrl: publicQuery
    .query(async () => {
      const state = nanoid();
      const url = new URL('https://api.qiwa.gov.sa/oauth/authorize');
      url.searchParams.append('client_id', env.QIWA_CLIENT_ID);
      url.searchParams.append('redirect_uri', env.QIWA_REDIRECT_URI);
      url.searchParams.append('response_type', 'code');
      url.searchParams.append('scope', 'visa_quotas workers');
      url.searchParams.append('state', state);
      // Cache state
      return url.toString();
    }),

  handleCallback: publicMutation
    .input(z.object({ code: z.string(), state: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Exchange code for token
      const token = await exchangeQiwaCode(input.code);
      // Store in Redis
      // Fetch quotas
      // Sync to DB
      return { success: true, quotasFetched: true };
    }),

  getVisaQuotas: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return cached quotas from DB
      // If >1h old → fetch from Qiwa
    }),

  getWorkerVisaStatus: authedQuery
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return visa status from Qiwa
      // Check expiry dates
      // Return alerts
    })
});
```

**Database Schema:**
```sql
CREATE TABLE qiwaIntegration (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenantId INT,
  qiwaOrgId VARCHAR(100),
  accessToken VARCHAR(500),
  refreshToken VARCHAR(500),
  tokenExpiresAt TIMESTAMP,
  lastSyncAt TIMESTAMP,
  syncStatus ENUM('success', 'failed', 'pending'),
  UNIQUE KEY (tenantId)
);

CREATE TABLE visaQuotaTracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT,
  skillCategory VARCHAR(100),
  totalQuota INT,
  usedQuota INT,
  availableQuota INT,
  qiwaLastUpdatedAt TIMESTAMP
);

CREATE TABLE workerVisaStatus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employeeId INT,
  projectId INT,
  visaNumber VARCHAR(50),
  visaExpiryDate DATE,
  sponsorshipStatus ENUM('active', 'transferred', 'expired'),
  qiwaVerified BOOLEAN,
  expiryAlertSent BOOLEAN,
  lastVerifiedAt TIMESTAMP
);
```

---

### Sprint 5-6: Dashboards + Compliance Testing

**HSE KPI Dashboard:**
```
TRIFR (Total Recordable Incident Frequency Rate) = (Incidents / Hours Worked) × 200,000
LTIFR (Lost Time Incident Frequency Rate) = (Lost Time Incidents / Hours Worked) × 200,000
Near-Miss Frequency = Near-Misses / Month
Safety Training Completion % = Completed / Total Required
```

**Nitaqat Display & Alerts:**
```
Calculate Nitaqat Category:
- Count total workforce
- Count Saudi employees
- Calculate percentage
- Assign category (Platinum/Gold/Silver/Bronze)
- Show salary ceiling status
- Alert if approaching threshold
```

**Implementation:**
- [ ] Create job costing schema
- [ ] Build variance calculation engine
- [ ] Implement invoice parsing
- [ ] Create cost variance dashboard
- [ ] Implement Qiwa OAuth2
- [ ] Build visa quota display
- [ ] Create HSE KPI calculations
- [ ] Build real-time chart updates
- [ ] Create Nitaqat dashboard
- [ ] Implement ZATCA Phase 2 testing

**Testing:**
- [ ] Job costing accuracy (±0.5% of manual)
- [ ] Qiwa token refresh working
- [ ] Visa expiry alerts triggering
- [ ] ZATCA QR code validation
- [ ] Dashboard performance (<2s load)

---

## 🎨 PHASE 2: INTELLIGENCE & COMPLIANCE (Weeks 9-16)

### Sprint 1-2: Analytics Dashboards
- Project KPI dashboard (budget, schedule, quality, safety)
- Portfolio view (50+ projects overview)
- Real-time WebSocket updates
- Drill-down capability
- Export to PowerPoint/Excel

### Sprint 3-4: BIM + Quality
- BIM 3D viewer (IFC/Revit support)
- Quality punch list management
- NCR (Non-Conformance) workflow
- RFI (Request for Information) tracking
- Photo documentation with GIS tags

### Sprint 5-6: Compliance Automation
- Nitaqat automation engine
- HSE incident investigation workflow
- Municipality permit tracking
- Real-time progress tracking from desktop app

---

## 🚀 PHASE 3: ADVANCED FEATURES (Weeks 17-24)

### Sprint 1-2: Scheduling & WIP
- CPM (Critical Path Method) scheduling
- WIP reporting for IFRS 15
- Gantt chart visualization

### Sprint 3: Portals & Forecasting
- Subcontractor self-service portal
- Employee portal
- Advanced forecasting with ML
- Claims & change order management

### Sprint 4: Production Hardening
- Security audit & penetration testing
- Performance optimization
- Load testing (10,000+ projects)
- Production deployment

---

## 📋 QUICK WIN FEATURES (1-2 weeks each)

### 1. Payment Certificates ✅
- [ ] Auto-generate from billing
- [ ] Multi-step approvals
- [ ] ZATCA e-signature
- [ ] PDF export with QR

### 2. Visa Quota Dashboard ✅
- [ ] Real-time quota display
- [ ] Category breakdown
- [ ] Expiry alerts
- [ ] Compliance status

### 3. HSE KPI Dashboard ✅
- [ ] TRIFR/LTIFR calculation
- [ ] Trend charts
- [ ] Training completion tracking
- [ ] Incident heatmap

### 4. Nitaqat Display ✅
- [ ] Category calculation
- [ ] Salary ceiling enforcement
- [ ] Compliance dashboard
- [ ] Automated alerts

### 5. ZATCA Compliance ✅
- [ ] Phase 2 production testing
- [ ] Invoice compliance
- [ ] QR code generation
- [ ] Archive storage

---

## 💰 COST & TIMELINE

| Phase | Timeline | Team | Budget | Deliverables |
|---|---|---|---|---|
| **Phase 1** | Weeks 1-8 | 5-6 FTE | $120K | Desktop app, payment certs, job costing, Qiwa, HSE dashboard |
| **Phase 2** | Weeks 9-16 | 5-6 FTE | $125K | Dashboards, BIM, quality mgmt, Nitaqat automation |
| **Phase 3** | Weeks 17-24 | 3-4 FTE | $87K | CPM, WIP, forecasting, portals, hardening |
| **Total** | 24 weeks | - | **$332K** | Production-ready world-class ERP |

---

## ✅ SUCCESS CRITERIA

**Phase 1:**
- [ ] Desktop app runs offline on Windows 10/11
- [ ] Sync success rate 99%+
- [ ] Payment certs generated in <5 seconds
- [ ] Qiwa integration 100% working
- [ ] ZATCA Phase 2 certified

**Phase 2:**
- [ ] Dashboards load in <2 seconds
- [ ] BIM viewer 3D models render <5 seconds
- [ ] Nitaqat automation 80% manual work reduction
- [ ] Quality workflow reduces defects by 40%

**Phase 3:**
- [ ] System handles 10,000+ projects simultaneously
- [ ] 99.9% uptime SLA maintained
- [ ] All Saudi compliance requirements met
- [ ] Outperforms HAL ERP in construction features

---

## 🔐 SECURITY & COMPLIANCE

**Data Protection:**
- [ ] End-to-end encryption for sensitive data
- [ ] PDPL data privacy compliance
- [ ] Audit logging for all actions
- [ ] Role-based access control
- [ ] Secure offline storage (Dexie encryption)

**Compliance:**
- [ ] ZATCA Phase 2 certified
- [ ] Qiwa API integration secure
- [ ] GOSI calculations verified
- [ ] HSE documentation complete
- [ ] Penetration testing passed

---

## 📱 WINDOWS APP DISTRIBUTION

**Distribution Strategy:**
1. **Direct Download**: EXE installer from website
2. **Windows Store**: Deploy to Microsoft Store
3. **Enterprise MSI**: For large organizations
4. **Auto-Updates**: Tauri built-in (delta updates)

**Build Pipeline:**
```
npm run build:tauri
→ Creates EXE installer
→ Signs with certificate
→ Creates MSI for enterprise
→ Uploads to release server
→ Auto-update service fetches new versions
```

---

## 🎓 TRAINING & ADOPTION

**User Groups:**
1. **Site Managers** - Desktop app for daily reports
2. **Project Managers** - Dashboards and approvals
3. **Finance Team** - Payment certificates and job costing
4. **HSE Team** - Incident tracking and compliance
5. **Executives** - Portfolio dashboards

**Training Materials:**
- [ ] Video tutorials (5-10 min each)
- [ ] User guides (PDF + interactive)
- [ ] Admin documentation
- [ ] API documentation for integrations
- [ ] Troubleshooting guides

---

## 📞 SUPPORT & MAINTENANCE

**SLA Targets:**
- Critical issues: 1-hour response
- High priority: 4-hour response
- Medium priority: 1-day response
- Low priority: 3-day response

**Maintenance Windows:**
- Monthly security updates
- Quarterly feature updates
- Ad-hoc hotfixes as needed

---

## 🎯 NEXT IMMEDIATE STEPS

**This Week:**
1. [ ] Confirm 5-6 FTE team allocation
2. [ ] Set up Tauri development environment
3. [ ] Review Qiwa API documentation
4. [ ] Create payment certificate mockups
5. [ ] Schedule ZATCA Phase 2 testing

**Week 1-2 (Sprint 1):**
1. [ ] Build Tauri window structure
2. [ ] Implement Dexie offline store
3. [ ] Create payment certificate schema
4. [ ] Build offline sync service
5. [ ] Develop desktop app installer

**Week 3-4 (Sprint 2):**
1. [ ] Build daily report forms
2. [ ] Implement photo capture
3. [ ] Build sync queue UI
4. [ ] Implement job costing engine
5. [ ] Create cost variance dashboard

---

## 📚 REFERENCE MATERIALS

**Competitor Analysis:**
- HAL ERP Construction: Portfolio dashboards, BIM integration, Saudization automation
- SAP Construction: CPM scheduling, WIP reporting, resource planning
- Oracle: Enterprise features, forecasting, claims management
- Odoo: Document management, collaborative tools, mobile app

**Best Practices:**
- Construction Industry Institute (CII)
- PMI (Project Management Institute)
- FIDIC Contract Standards
- Saudi Arabian Building Code

---

## 🏁 CONCLUSION

YASCO is well-positioned to become a world-class construction ERP with:
- Existing 22+ database tables (foundation ready)
- Tauri desktop app framework (production code available)
- Compliance libraries (Qiwa, ZATCA, Nitaqat in place)
- Queue system (real-time calculations possible)

**3-phase, 24-week roadmap will deliver:**
✅ Windows desktop app for site teams  
✅ Real-time job costing and dashboards  
✅ Full Saudi Arabia compliance  
✅ Enterprise features (BIM, scheduling, forecasting)  
✅ Production-ready system competing with HAL/SAP  

**Investment: $332,000 | Timeline: 24 weeks | Team: 5-6 FTE**