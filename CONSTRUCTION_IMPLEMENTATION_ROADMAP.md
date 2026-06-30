# CONSTRUCTION ERP IMPLEMENTATION ROADMAP
**Q3 2026 - Q1 2027**

---

## PHASE 1: CRITICAL FOUNDATION (Q3 2026 - 6-8 weeks)
**Focus:** Field operations, core compliance automation, payment workflows

### Sprint 1.1: Mobile Field App Architecture (Weeks 1-2)
**Deliverables:**
- Offline-first SQLite database schema (mirror of critical tables)
- Sync engine (conflict resolution, versioning)
- GPS & geolocation services
- Photo capture with metadata (timestamp, coordinates, orientation)

**Technical Stack:**
- React Native OR Tauri (cross-platform)
- TanStack Query for offline caching
- Expo for rapid deployment
- SQLite for offline storage

**Success Criteria:**
- App works 100% offline
- Photos auto-sync when online
- Zero data loss on app crash

**Owner:** Mobile Team (2 developers)

---

### Sprint 1.2: Daily Report & Incident Capture (Weeks 2-3)
**Deliverables:**
- Daily report form (weather, labor, equipment, materials, work completed)
- Photo gallery with location tagging
- Incident/safety report form
- Auto-timestamp & GPS capture

**Database Changes:**
```sql
ALTER TABLE site_daily_reports 
ADD COLUMN gps_latitude DECIMAL(10,8),
ADD COLUMN gps_longitude DECIMAL(10,8),
ADD COLUMN offline_sync_id VARCHAR(255);

-- Photo metadata table
CREATE TABLE daily_report_photos (
  id SERIAL PRIMARY KEY,
  report_id BIGINT NOT NULL,
  photo_url VARCHAR(255),
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(10,8),
  captured_at TIMESTAMP,
  uploaded_at TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES site_daily_reports(id)
);
```

**API Endpoints:**
- POST /construction/daily-report/photo-upload (batch)
- POST /construction/daily-report/sync-offline
- GET /construction/daily-report/{id}/photos

**Success Criteria:**
- 95% of photos upload successfully
- Zero duplicate records after sync

**Owner:** Backend (1 dev) + Mobile (1 dev)

---

### Sprint 1.3: Job Costing Integration (Weeks 3-4)
**Deliverables:**
- Cost code master table & hierarchy
- Labor cost tracking (timesheet → job cost)
- Material consumption tracking
- Equipment cost allocation

**Database Tables:**
```sql
-- Cost code hierarchy
CREATE TABLE cost_codes (
  id SERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL,
  parent_id BIGINT,
  code VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  level INT,
  category ENUM('labor', 'material', 'equipment', 'overhead'),
  budget_amount DECIMAL(18,4),
  UNIQUE KEY (project_id, code)
);

-- Actual labor costs (from timesheets)
CREATE TABLE labor_cost_tracking (
  id SERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL,
  cost_code_id BIGINT,
  employee_id BIGINT,
  work_date DATE,
  hours DECIMAL(10,2),
  rate DECIMAL(18,4),
  total_cost DECIMAL(18,4),
  FOREIGN KEY (cost_code_id) REFERENCES cost_codes(id)
);

-- Material consumption
CREATE TABLE material_cost_tracking (
  id SERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL,
  material_req_id BIGINT,
  cost_code_id BIGINT,
  quantity_consumed DECIMAL(18,4),
  unit_cost DECIMAL(18,4),
  total_cost DECIMAL(18,4),
  consumed_date DATE,
  FOREIGN KEY (material_req_id) REFERENCES material_requirements(id)
);

-- Equipment cost allocation
CREATE TABLE equipment_cost_tracking (
  id SERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL,
  equipment_id BIGINT,
  cost_code_id BIGINT,
  hours_used DECIMAL(10,2),
  rate DECIMAL(18,4),
  total_cost DECIMAL(18,4),
  usage_date DATE,
  FOREIGN KEY (equipment_id) REFERENCES equipment_tracking(id)
);
```

**APIs to Create:**
- GET /construction/{projectId}/cost-codes (with hierarchy)
- POST /construction/{projectId}/cost-codes/rollup (WBS level aggregation)
- GET /construction/{projectId}/job-costing/summary (actual vs budget)
- GET /construction/{projectId}/job-costing/by-cost-code

**Business Logic:**
```typescript
// Calculate total cost for WBS item
function calculateWbsActualCost(wbsId: number): decimal {
  return (
    laborCosts.sum(costCode.wbsId = wbsId) +
    materialCosts.sum(costCode.wbsId = wbsId) +
    equipmentCosts.sum(costCode.wbsId = wbsId)
  )
}

// Calculate variance
function calculateWbsVariance(wbsId: number): {
  plannedCost: decimal,
  actualCost: decimal,
  variance: decimal,
  variancePercent: decimal
}
```

**Success Criteria:**
- Labor costs auto-calculated from timesheets
- Material consumption auto-deducted from material tracking
- Equipment costs tracked by project & WBS

**Owner:** Backend (1.5 devs)

---

### Sprint 1.4: Payment Certificate Automation (Weeks 4-5)
**Deliverables:**
- Automated RA bill generation from progress
- Certificate approval workflow UI
- Digital signature integration
- PDF export

**Database Changes:**
```sql
-- Certificate workflow tracking
CREATE TABLE payment_certificates (
  id SERIAL PRIMARY KEY,
  billing_id BIGINT NOT NULL,
  certificate_number VARCHAR(50) UNIQUE,
  engineer_signed_by VARCHAR(255),
  engineer_signed_at TIMESTAMP,
  client_signed_by VARCHAR(255),
  client_signed_at TIMESTAMP,
  certificate_pdf_url VARCHAR(255),
  status ENUM('draft', 'engineer_review', 'client_review', 'signed', 'released'),
  FOREIGN KEY (billing_id) REFERENCES progress_billing(id)
);

-- Signature records (for audit)
CREATE TABLE signature_records (
  id SERIAL PRIMARY KEY,
  certificate_id BIGINT,
  signer_name VARCHAR(255),
  signer_role ENUM('engineer', 'client'),
  signed_at TIMESTAMP,
  signature_image_url VARCHAR(255),
  ip_address VARCHAR(45),
  FOREIGN KEY (certificate_id) REFERENCES payment_certificates(id)
);
```

**Workflow:**
1. Progress logged in field app → auto-calculates % completion
2. System auto-generates RA bill from BOQ
3. Bill submitted to engineer for review
4. Engineer approves & signs (digital signature)
5. Bill forwarded to client
6. Client approves & signs
7. Payment certified & invoice released

**APIs:**
- POST /construction/billing/auto-generate (from progress)
- POST /construction/certificates/{id}/engineer-sign (digital sig)
- POST /construction/certificates/{id}/client-sign
- GET /construction/certificates/{id}/pdf

**Success Criteria:**
- 100% of RA bills auto-generated
- 95% acceptance rate on workflow

**Owner:** Backend (1 dev) + Frontend (0.5 dev)

---

### Sprint 1.5: Qiwa Full Integration (Weeks 5-6)
**Deliverables:**
- Real-time Qiwa API calls (visa, permit, salary sync)
- Compliance dashboard
- Expiry alerts
- Payroll block logic

**Database Enhancements:**
```sql
-- Real-time Qiwa sync log
CREATE TABLE qiwa_sync_logs (
  id SERIAL PRIMARY KEY,
  tenant_id BIGINT,
  employee_id BIGINT,
  action VARCHAR(50),  -- 'create_contract', 'update_salary', 'renew_permit'
  qiwa_response JSON,
  sync_status ENUM('success', 'failed', 'partial'),
  error_message TEXT,
  synced_at TIMESTAMP,
  next_sync_date DATE
);

-- Visa quota tracking
CREATE TABLE visa_quotas (
  id SERIAL PRIMARY KEY,
  tenant_id BIGINT,
  employer_id BIGINT,
  total_quota INT,
  saudi_quota INT,
  expatriate_quota INT,
  used_visas INT,
  available_visas INT,
  last_updated TIMESTAMP
);
```

**Integration Points:**
1. **Hire new employee** → Auto-create Qiwa contract
2. **Salary change** → Auto-sync to Qiwa
3. **Permit expires in 30 days** → Alert HR
4. **Visa quota full** → Block new hires
5. **Skill mismatch** → Flag for HR

**Qiwa API Calls to Implement:**
```typescript
// Create/update work contract
POST /api/qiwa/contracts
{
  employeeId: number,
  basicSalary: number,
  housingAllowance: number,
  transportAllowance: number,
  otherAllowances: number,
  jobTitle: string,
  jobDescription: string
}

// Get visa quota & status
GET /api/qiwa/visa-quota

// Get employee permit status
GET /api/qiwa/employee/{employeeId}/permit-status

// Get Nitaqat band status
GET /api/qiwa/saudization-status
```

**Success Criteria:**
- 100% of employees synced to Qiwa automatically
- Zero manual Qiwa data entry
- 48-hour permit expiry alert delivery

**Owner:** Backend (1.5 devs)

---

### Sprint 1.6: Qiwa Compliance Dashboard (Weeks 6-7)
**Deliverables:**
- Real-time Qiwa status display
- Nitaqat band status with color coding
- Work permit expiry calendar
- Visa quota utilization chart
- Compliance alerts

**Frontend Components:**
```tsx
// Qiwa Overview Card (Dashboard)
<QiwaComplianceCard>
  - Nitaqat Band: [Green] 65% Saudi
  - Active Visas: 45/50 (90%)
  - Expiring Permits: 3 in next 30 days
  - Last Sync: 2 hours ago
</QiwaComplianceCard>

// Permit Expiry Calendar
<PermitExpiryCalendar
  showExpiringIn={30}
  onClick={handleEmployeeClick}
/>

// Quota Utilization
<QuotaChart
  totalQuota={50}
  usedSaudi={30}
  usedExpatriate={15}
  remaining={5}
/>
```

**Success Criteria:**
- Dashboard loads in <2 seconds
- Alert delivery 100% reliable
- 95% user adoption rate

**Owner:** Frontend (1 dev)

---

### Sprint 1.7: Quality Management MVP (Weeks 7-8)
**Deliverables:**
- Inspection checklist templates
- Photo-based punch lists
- Defect tracking workflow
- Sign-off process

**Database Tables:**
```sql
CREATE TABLE inspection_checklists (
  id SERIAL PRIMARY KEY,
  project_id BIGINT,
  phase VARCHAR(100),  -- 'foundation', 'structure', 'finishing'
  template_name VARCHAR(255),
  items JSON,  -- Array of checklist items
  created_at TIMESTAMP
);

CREATE TABLE inspections (
  id SERIAL PRIMARY KEY,
  project_id BIGINT,
  checklist_id BIGINT,
  inspection_date DATE,
  inspector_name VARCHAR(255),
  items_status JSON,  -- { item_id: 'pass'|'fail'|'na' }
  findings TEXT,
  photos JSON,  -- Array of photo IDs
  status ENUM('draft', 'in_progress', 'completed', 'defects_noted'),
  FOREIGN KEY (checklist_id) REFERENCES inspection_checklists(id)
);

CREATE TABLE punch_lists (
  id SERIAL PRIMARY KEY,
  project_id BIGINT,
  inspection_id BIGINT,
  description TEXT,
  location VARCHAR(255),
  severity ENUM('critical', 'major', 'minor'),
  photos JSON,
  assigned_to BIGINT,
  status ENUM('open', 'in_progress', 'completed', 'accepted'),
  due_date DATE,
  completion_date DATE,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id)
);
```

**Success Criteria:**
- Punch lists linked to photos
- 90% defect completion rate
- Zero duplicate punch items

**Owner:** Backend (0.5 dev) + Frontend (1 dev)

---

## PHASE 1 DELIVERABLES SUMMARY

| Component | Status | Impact |
|---|---|---|
| Mobile field app | ✅ Production ready | Field teams 100% mobile |
| Job costing | ✅ WBS-level tracking | Accurate profitability |
| Payment workflow | ✅ Automated bills | 50% faster billing |
| Qiwa integration | ✅ Real-time sync | 0 manual compliance checks |
| Quality tracking | ✅ Photo-linked defects | 80% faster punch list |

**Phase 1 Outcome:** YASCO construction becomes **field-operational** with **automated Saudi compliance**

---

## PHASE 2: ADVANCED CAPABILITIES (Q4 2026 - 6-8 weeks)
**Focus:** Dashboards, BIM integration, HSE automation, enterprise reporting

### Sprint 2.1: Project Dashboard (Weeks 1-2)
- Portfolio KPI cards (active projects, contract value, budget variance)
- Project status Gantt chart
- Schedule performance index (SPI) & cost performance index (CPI)
- Risk alerts (overdue milestones, non-compliant items)

### Sprint 2.2: Financial Dashboard (Weeks 2-3)
- Project profitability by status
- Cash flow visualization (billed vs. paid vs. retained)
- Subcontractor payment status
- Budget vs. actual by WBS level

### Sprint 2.3: BIM Integration MVP (Weeks 3-5)
- IFC file upload & parsing
- 3D model viewer (Three.js)
- Basic take-off estimation
- CDE integration (Autodesk Docs API)

### Sprint 2.4: HSE Automation (Weeks 5-6)
- Incident investigation workflow
- Safety KPI dashboards (LTIFR, TRIFR, near-miss rates)
- Corrective action tracking
- Integration with training records

### Sprint 2.5: Nitaqat Automation (Week 6-7)
- Real-time Nitaqat band status
- What-if analysis (hire X Saudis → green zone)
- Compliance alerts
- Historical trend reporting

### Sprint 2.6: Document Management (Week 7-8)
- RFI workflow (creation, distribution, responses)
- Drawing version control
- CDE integration for centralized repository
- Mark-up & annotation tools

---

## PHASE 3: ENTERPRISE MATURITY (2027 - 6-8 weeks)
**Focus:** CPM scheduling, WIP reporting, advanced analytics, portals

### Sprint 3.1: Construction Scheduling (CPM)
- Gantt charts with critical path highlighting
- Resource leveling
- Delay analysis & tracking

### Sprint 3.2: WIP Reporting
- IFRS 15 revenue recognition
- Gross margin tracking
- Completion certificates with cost certification

### Sprint 3.3: Advanced Financial Analytics
- Profitability by project/phase/cost code
- Cash flow forecasting
- Subcontractor performance metrics

### Sprint 3.4: Subcontractor Portal
- Self-service payment status
- Compliance uploads (insurance, certifications)
- Communication hub

### Sprint 3.5: Municipality Integration
- Balady permit tracking
- Building permit approval workflows
- Deadline management

---

## TECHNICAL ARCHITECTURE RECOMMENDATIONS

### Backend Enhancements
```
Current: tRPC with Drizzle ORM
Additions:
- Job queue system (Bull/Sidekiq) for async tasks:
  * Qiwa API sync (daily)
  * Payroll calculations (weekly)
  * Report generation (on-demand)
  * Photo processing (background)
  
- Real-time updates (WebSocket):
  * Daily report submissions
  * Payment approvals
  * Compliance alerts
  
- Document storage:
  * Cloud storage (AWS S3/Azure Blob)
  * CDN for fast photo delivery
  * Virus scanning for uploads
```

### Frontend Enhancements
```
Current: React + Vite
Additions:
- Charts & visualization:
  * Recharts (or Nivo) for financial dashboards
  * Three.js for 3D BIM viewer
  * Mapbox for GPS visualizations
  
- State management:
  * TanStack Query for server state (already using)
  * Zustand for local state (already using)
  * Real-time updates via WebSocket
  
- Responsive design:
  * Mobile-first for field teams
  * Tablet optimization for site supervision
  * Desktop dashboards for office use
```

### Mobile App Architecture
```
Framework: React Native (Expo) OR Tauri
Database: SQLite (offline) → PostgreSQL (cloud)
Sync: 
  * One-way push for reports/photos (client → server)
  * Selective pull for project data (server → client)
  * Conflict resolution: server wins (latest timestamp)
  
Deployment:
  * iOS: App Store
  * Android: Google Play + internal distribution
  * Desktop (Tauri): Direct executable
```

---

## RESOURCE ALLOCATION

### Phase 1 (6-8 weeks)
- Backend: 2.5 FTE (job costing, Qiwa, payment workflow)
- Frontend: 1 FTE (dashboards, workflows)
- Mobile: 2 FTE (app, offline sync)
- QA: 1 FTE (full regression testing)
- **Total: 6.5 FTE**

### Phase 2 (6-8 weeks)
- Backend: 1.5 FTE (BIM, HSE, dashboard APIs)
- Frontend: 2 FTE (dashboards, BIM viewer, workflows)
- Mobile: 0.5 FTE (maintenance)
- QA: 1 FTE (integration testing)
- **Total: 5 FTE**

### Phase 3 (6-8 weeks)
- Backend: 1.5 FTE (CPM, WIP, portals)
- Frontend: 1.5 FTE (advanced dashboards)
- Mobile: 0.5 FTE (maintenance)
- **Total: 3.5 FTE**

---

## KEY RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Qiwa API changes | Medium | High | Weekly API monitoring, version pinning |
| ZATCA Phase 2 deadline miss | Low | Critical | Parallel staging & prod environments |
| BIM file parsing complexity | Medium | Medium | Start with simple IFC, use libraries |
| Mobile app adoption resistance | Low | Medium | Incentivize field teams, provide training |
| Job costing accuracy issues | Medium | High | Extensive UAT, parallel run period |

---

## SUCCESS METRICS

### Q3 2026 (Phase 1)
- ✅ 90%+ daily reports submitted via mobile app
- ✅ 0 manual Qiwa compliance checks
- ✅ 50% reduction in billing cycle time
- ✅ 95% job costing accuracy vs. manual

### Q4 2026 (Phase 2)
- ✅ 80%+ project managers using dashboards daily
- ✅ 50%+ projects using BIM for take-offs
- ✅ 100% HSE incident tracking
- ✅ Zero unresolved Nitaqat compliance issues

### Q1 2027 (Phase 3)
- ✅ WIP reporting 100% automated
- ✅ 40%+ revenue increase vs. pre-ERP
- ✅ 95%+ user adoption across all modules
- ✅ YASCO becomes industry leader in Saudi construction ERP

---

## DEPENDENCIES & BLOCKERS

### External Dependencies
1. **Qiwa API Credentials** - Required by Sprint 1.5
2. **ZATCA Phase 2 Credentials** - Required before Phase 1 end
3. **BIM Software SDKs** - Required by Sprint 2.3
4. **iOS/Android Certificates** - Required before mobile release

### Internal Dependencies
1. HR module must be finalized (for labor cost tracking)
2. Accounting module must support journal entry automation
3. Assets module must track equipment depreciation

---

## BUDGET ESTIMATE (Development Only)

| Phase | Effort | Cost (@ $100/hr) | Timeline |
|---|---|---|---|
| Phase 1 | 260 days (6.5 FTE × 40 days) | $208,000 | Q3 2026 (8 weeks) |
| Phase 2 | 200 days (5 FTE × 40 days) | $160,000 | Q4 2026 (8 weeks) |
| Phase 3 | 140 days (3.5 FTE × 40 days) | $112,000 | Q1 2027 (8 weeks) |
| **Total** | **600 days** | **$480,000** | **6 months** |

**Note:** Does not include infrastructure, licensing, or maintenance.

---

## CONCLUSION

This roadmap transforms YASCO from **35% complete** to **90% complete enterprise ERP** in 6 months. The focus on **field operations, Saudi compliance automation, and real-time dashboards** positions YASCO as the leading construction ERP for the Saudi market.
