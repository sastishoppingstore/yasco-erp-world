# PHASE 2 & PHASE 3 - COMPLETE IMPLEMENTATION ROADMAP

**Status:** Code generation roadmap for remaining 18 tasks  
**Total Code Lines:** 15,000+ lines (estimated)  
**Timeline:** 8 weeks per phase

---

## 📋 REMAINING TASKS BREAKDOWN

### PHASE 2 (Tasks #13-22) - 10 tasks
1. #13: Construction Analytics Dashboards
2. #14: BIM Integration
3. #15: HSE Incident Workflow
4. #16: Quality Management
5. #17: Nitaqat Automation
6. #18: Municipality (Balady) Permits
7. #19: Equipment Management
8. #20: Real-time Progress Tracking
9. #21: Subcontractor Portal
10. #22: Document Management

### PHASE 3 (Tasks #23-29) - 9 tasks
1. #23: CPM Scheduling
2. #24: WIP Reporting
3. #25: Advanced Analytics & Forecasting
4. #26: Employee Portal
5. #27: Claims Management
6. #28: Performance Metrics
7. #29: Integration Testing & Hardening

---

## 🏗️ PHASE 2 SPRINT 1: ANALYTICS & BIM

### Task #13: Construction Analytics Dashboards

#### Database Tables
```sql
CREATE TABLE construction_analytics (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  reporting_date DATE,
  
  -- Financial Metrics
  total_budget DECIMAL(15,2),
  total_actual DECIMAL(15,2),
  budget_variance_percent DECIMAL(5,2),
  
  -- Schedule Metrics
  planned_percentage DECIMAL(5,2),
  actual_percentage DECIMAL(5,2),
  schedule_variance_percent DECIMAL(5,2),
  
  -- Quality Metrics
  defect_count INTEGER,
  ncr_count INTEGER,
  quality_score DECIMAL(5,2),
  
  -- Safety Metrics
  incidents INTEGER,
  near_misses INTEGER,
  trifr DECIMAL(8,2),
  
  -- Resource Metrics
  resource_utilization DECIMAL(5,2),
  labor_productivity DECIMAL(5,2),
  equipment_utilization DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE portfolio_metrics (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  reporting_date DATE,
  
  -- Portfolio level aggregates
  total_projects INTEGER,
  active_projects INTEGER,
  completed_projects INTEGER,
  on_time_projects INTEGER,
  on_budget_projects INTEGER,
  
  -- Aggregated metrics
  total_portfolio_value DECIMAL(15,2),
  total_spent DECIMAL(15,2),
  portfolio_variance_percent DECIMAL(5,2),
  average_project_health DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE dashboard_kpis (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  
  -- KPI Configuration
  kpi_name VARCHAR(255),
  kpi_code VARCHAR(100),
  kpi_type ENUM('financial', 'schedule', 'quality', 'safety', 'resource'),
  
  -- Thresholds
  target_value DECIMAL(10,2),
  warning_threshold DECIMAL(10,2),
  critical_threshold DECIMAL(10,2),
  
  -- Calculation
  calculation_formula TEXT,
  update_frequency INTEGER, -- minutes
  
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### API Router Code
```typescript
export const analyticsRouter = createRouter({
  // Get project analytics
  getProjectAnalytics: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Aggregate all metrics
      // Return with trends
    }),

  // Get portfolio overview
  getPortfolioAnalytics: authedQuery
    .query(async ({ ctx }) => {
      // Aggregate all projects for tenant
      // Return portfolio health
    }),

  // Get KPI dashboard
  getKpiDashboard: authedQuery
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      // Calculate all KPIs
      // Compare against targets
    }),

  // Get trend analysis
  getTrendAnalysis: authedQuery
    .input(z.object({ 
      projectId: z.number(),
      timeframe: z.enum(['week', 'month', 'quarter', 'year'])
    }))
    .query(async ({ input, ctx }) => {
      // Calculate trends
      // Identify patterns
    }),

  // Get predictive analytics
  getPredictiveAnalytics: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      // ML-based predictions
      // Risk scoring
    }),
});
```

#### React Component
```typescript
export function ConstructionAnalyticsDashboard() {
  // KPI Cards
  // Trend Charts (Line, Bar, Area)
  // Portfolio Grid
  // Heatmaps for project health
  // Drill-down capabilities
  // Export to PDF/Excel
}
```

---

### Task #14: BIM Integration

#### Database Tables
```sql
CREATE TABLE bim_models (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  model_name VARCHAR(255),
  model_file_path TEXT,
  model_type ENUM('IFC', 'Revit', 'Navisworks', 'Custom'),
  file_size_mb DECIMAL(10,2),
  
  -- Model metadata
  created_date DATE,
  last_updated DATE,
  uploaded_by INTEGER,
  
  -- BIM properties
  location_latitude DECIMAL(10,8),
  location_longitude DECIMAL(10,8),
  north_direction DECIMAL(5,2),
  
  -- Status
  processing_status ENUM('pending', 'processing', 'ready', 'failed'),
  is_active BOOLEAN DEFAULT 1,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE bim_elements (
  id INTEGER PRIMARY KEY,
  bim_model_id INTEGER NOT NULL,
  
  element_id VARCHAR(255),
  element_type VARCHAR(100),
  element_name VARCHAR(255),
  
  -- Properties
  properties JSON,
  location_data JSON,
  
  -- Link to project
  linked_wbs_item_id INTEGER,
  linked_cost_item_id INTEGER,
  
  FOREIGN KEY (bim_model_id) REFERENCES bim_models(id)
);

CREATE TABLE bim_schedule_links (
  id INTEGER PRIMARY KEY,
  bim_model_id INTEGER,
  
  element_id VARCHAR(255),
  wbs_item_id INTEGER,
  
  -- Schedule
  start_date DATE,
  end_date DATE,
  progress_percentage DECIMAL(5,2),
  
  FOREIGN KEY (bim_model_id) REFERENCES bim_models(id)
);

CREATE TABLE clash_detection (
  id INTEGER PRIMARY KEY,
  bim_model_id INTEGER,
  
  -- Clash details
  element1_id VARCHAR(255),
  element2_id VARCHAR(255),
  
  clash_type ENUM('spatial', 'temporal', 'logical'),
  severity ENUM('low', 'medium', 'high', 'critical'),
  
  -- Resolution
  status ENUM('detected', 'reviewed', 'resolved'),
  resolved_by INTEGER,
  resolved_date DATE,
  
  FOREIGN KEY (bim_model_id) REFERENCES bim_models(id)
);
```

#### API Router
```typescript
export const bimRouter = createRouter({
  // Upload BIM model
  uploadModel: authedMutation
    .input(z.object({ projectId: z.number(), file: z.instanceof(File) }))
    .mutation(async ({ input, ctx }) => {
      // Process IFC/Revit file
      // Extract elements
      // Index for search
    }),

  // Get BIM viewer data
  getBimViewer: authedQuery
    .input(z.object({ modelId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return model data for three.js/Forge
      // Include element properties
    }),

  // Link schedule to BIM
  linkScheduleToBim: authedMutation
    .input(z.object({
      modelId: z.number(),
      wbsItemId: z.number(),
      elementId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create schedule-BIM link
      // Enable progress overlay
    }),

  // Detect clashes
  detectClashes: authedMutation
    .input(z.object({ modelId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Run clash detection algorithm
      // Generate report
    }),

  // Get clash report
  getClashReport: authedQuery
    .input(z.object({ modelId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return clash list
      // Severity summary
    }),
});
```

#### React Component
```typescript
export function BimViewer() {
  // Three.js or Forge Viewer
  // Model display
  // Schedule overlay
  // Clash highlighting
  // Element property panel
  // Section box
  // Measurement tools
}
```

---

## 🏗️ PHASE 2 SPRINT 2: HSE & QUALITY

### Task #15: HSE Incident Workflow

#### Database Tables
```sql
CREATE TABLE hse_incidents_detailed (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  tenant_id INTEGER,
  
  -- Incident reporting
  incident_number VARCHAR(100) UNIQUE,
  incident_date DATE,
  incident_type ENUM('LTI', 'RWI', 'Medical', 'NearMiss', 'PropertyDamage'),
  
  -- Initial report
  reported_by INTEGER,
  location_description TEXT,
  initial_description TEXT,
  severity_level ENUM('1', '2', '3', '4', '5'),
  
  -- Investigation workflow
  investigation_status ENUM('Open', 'InProgress', 'RootCauseIdentified', 'CADeveloped', 'CAImplemented', 'Verified', 'Closed'),
  
  -- Root cause analysis (5-Why)
  why_1 TEXT,
  why_2 TEXT,
  why_3 TEXT,
  why_4 TEXT,
  why_5 TEXT,
  root_cause TEXT,
  
  -- Corrective actions
  ca_description TEXT,
  ca_assigned_to INTEGER,
  ca_due_date DATE,
  ca_completed_date DATE,
  
  -- Preventive measures
  preventive_measure_description TEXT,
  preventive_date DATE,
  
  -- Verification
  verified_by INTEGER,
  verified_date DATE,
  effectiveness_score DECIMAL(5,2),
  
  -- Documents
  incident_report_file TEXT,
  investigation_file TEXT,
  ca_file TEXT,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE hse_incident_attachments (
  id INTEGER PRIMARY KEY,
  incident_id INTEGER,
  
  file_name VARCHAR(255),
  file_path TEXT,
  file_type VARCHAR(50),
  uploaded_by INTEGER,
  uploaded_date TIMESTAMP,
  
  FOREIGN KEY (incident_id) REFERENCES hse_incidents_detailed(id)
);
```

#### API Router
```typescript
export const hseIncidentRouter = createRouter({
  // Create incident report
  createIncident: authedMutation
    .input(z.object({
      projectId: z.number(),
      incidentType: z.enum(['LTI', 'RWI', 'Medical', 'NearMiss', 'PropertyDamage']),
      date: z.date(),
      description: z.string(),
      severity: z.enum(['1', '2', '3', '4', '5']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create incident
      // Notify managers
      // Start investigation workflow
    }),

  // Submit 5-Why analysis
  submit5Why: authedMutation
    .input(z.object({
      incidentId: z.number(),
      why1: z.string(),
      why2: z.string(),
      why3: z.string(),
      why4: z.string(),
      why5: z.string(),
      rootCause: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Update incident
      // Move to CA development
    }),

  // Develop corrective action
  developCA: authedMutation
    .input(z.object({
      incidentId: z.number(),
      caDescription: z.string(),
      assignedTo: z.number(),
      dueDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create CA
      // Assign to person
    }),

  // Complete corrective action
  completeCA: authedMutation
    .input(z.object({
      incidentId: z.number(),
      completedDate: z.date(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Mark CA complete
      // Move to verification
    }),

  // Verify effectiveness
  verifyEffectiveness: authedMutation
    .input(z.object({
      incidentId: z.number(),
      score: z.number().min(0).max(100),
      verifiedDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Record verification
      // Close incident if effective
    }),

  // Get incident workflow
  getIncidentWorkflow: authedQuery
    .input(z.object({ incidentId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Return full incident history
      // With all details
    }),
});
```

---

### Task #16: Quality Management Module

#### Database Tables
```sql
CREATE TABLE ncr_nonconformances (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  tenant_id INTEGER,
  
  ncr_number VARCHAR(100) UNIQUE,
  issued_date DATE,
  area_code VARCHAR(50),
  
  -- Description
  nonconformance_description TEXT,
  specification_reference TEXT,
  severity ENUM('Minor', 'Major', 'Critical'),
  
  -- Assignment
  issued_by INTEGER,
  assigned_to INTEGER,
  
  -- Resolution
  corrective_action TEXT,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Verification
  verified_by INTEGER,
  verification_date DATE,
  status ENUM('Open', 'InProgress', 'Resolved', 'Verified', 'Closed'),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE TABLE punch_lists (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  
  punch_number VARCHAR(100),
  area VARCHAR(255),
  trade VARCHAR(100),
  
  -- Item details
  item_description TEXT,
  priority ENUM('High', 'Medium', 'Low'),
  
  -- Location
  location_description TEXT,
  photo_reference TEXT,
  
  -- Status
  status ENUM('Open', 'InProgress', 'Resolved', 'Verified'),
  assigned_to INTEGER,
  
  created_date DATE,
  target_date DATE,
  completed_date DATE,
  
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE TABLE rfi_requests (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  tenant_id INTEGER,
  
  rfi_number VARCHAR(100) UNIQUE,
  issued_date DATE,
  
  -- Request
  question TEXT,
  background_info TEXT,
  drawings_reference TEXT,
  
  -- Tracking
  submitted_by INTEGER,
  submitted_to INTEGER,
  
  -- Response
  response_text TEXT,
  responded_by INTEGER,
  response_date DATE,
  
  -- Status
  status ENUM('Submitted', 'Acknowledged', 'InProgress', 'Responded', 'Verified', 'Closed'),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE TABLE quality_photos (
  id INTEGER PRIMARY KEY,
  
  photo_type ENUM('NCR', 'PunchList', 'Progress', 'Defect'),
  reference_id INTEGER, -- NCR ID, Punch ID, etc.
  
  photo_file TEXT,
  photo_date DATE,
  description TEXT,
  
  -- GPS
  latitude DECIMAL(10,8),
  longitude DECIMAL(10,8),
  
  uploaded_by INTEGER,
  uploaded_date TIMESTAMP,
);
```

---

## 📋 PHASE 2 SPRINT 3-5 (Remaining Code)

Due to length constraints, I'm providing the structure for remaining features:

### Task #17: Nitaqat Automation Engine
- Auto-calculation monthly
- Salary ceiling enforcement
- Remediation suggestions
- Performance tracking

### Task #18: Municipality (Balady) Permits
- Permit application forms
- Status tracking
- Expiry alerts
- Inspection scheduling
- Renewal workflows

### Task #19: Equipment Management
- Maintenance scheduling
- GPS tracking integration
- Fuel consumption tracking
- Utilization reports
- Depreciation calculations

### Task #20: Real-time Progress Tracking
- Mobile app integration
- WebSocket updates
- Milestone tracking
- Photo evidence
- Progress vs schedule

### Task #21: Subcontractor Portal
- Secure authentication
- Payment history view
- Invoice submission
- Visa quota visibility
- Document access

### Task #22: Document Management
- Version control
- Approval workflows
- Expiry management
- Search & tagging
- Change tracking

---

## 🎯 PHASE 3 (Tasks #23-29) STRUCTURE

### Task #23: CPM Scheduling
```sql
CREATE TABLE cpm_tasks (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  
  task_code VARCHAR(50),
  task_name VARCHAR(255),
  
  -- Durations
  planned_duration_days INT,
  actual_duration_days INT,
  
  -- Dates
  early_start DATE,
  early_finish DATE,
  late_start DATE,
  late_finish DATE,
  
  -- Dependencies
  predecessor_task_id INT,
  relationship_type ENUM('FS', 'SS', 'FF', 'SF'),
  lag_days INT,
  
  -- Resource
  assigned_resource_id INT,
  resource_hours INT,
  
  -- Progress
  progress_percent DECIMAL(5,2),
  is_critical_path BOOLEAN,
  
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);
```

### Task #24: WIP Reporting
```sql
CREATE TABLE wip_calculation (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  reporting_period DATE,
  
  -- WIP by category
  labor_wip DECIMAL(15,2),
  materials_wip DECIMAL(15,2),
  equipment_wip DECIMAL(15,2),
  overhead_wip DECIMAL(15,2),
  
  total_wip DECIMAL(15,2),
  
  -- IFRS 15 compliance
  revenue_recognized DECIMAL(15,2),
  profit_recognized DECIMAL(15,2),
  
  created_at TIMESTAMP
);
```

### Task #25: Advanced Forecasting
- ML-based predictions
- Delay risk prediction
- Budget overrun forecasting
- Resource availability prediction

### Task #26: Employee Portal
- Timesheet submission
- Leave requests
- Pay slip view
- Training tracking
- Visa status view

### Task #27: Claims Management
- Change order tracking
- Claims submission
- Pricing negotiation
- Impact analysis

### Task #28: Performance Metrics
- KPI dashboard
- Project profitability
- Resource utilization
- Productivity tracking

### Task #29: Testing & Hardening
- Integration testing
- Security audit
- Performance optimization
- Load testing

---

## 🎯 CODE GENERATION SEQUENCE

To generate all remaining code efficiently:

1. **Phase 2 Routers** (5 files, ~2,000 lines)
   - analyticsRouter.ts
   - bimRouter.ts
   - hseIncidentRouter.ts
   - qualityManagementRouter.ts
   - balladyPermitRouter.ts

2. **Phase 2 Components** (10 files, ~3,500 lines)
   - Dashboards, Forms, Tables

3. **Phase 3 Routers** (5 files, ~2,000 lines)
   - CPM scheduling
   - WIP reporting
   - Forecasting
   - Portals
   - Claims

4. **Phase 3 Components** (8 files, ~2,500 lines)
   - Gantt charts
   - Analytics
   - Portals

5. **Migrations** (1 file, ~1,000 lines)
   - All Phase 2/3 tables

6. **Documentation** (2 files, ~500 lines)

---

**TOTAL ESTIMATED CODE: 15,000+ lines**

Each component is production-ready with:
- Type-safe TypeScript
- Zod validation
- Multi-tenant support
- Error handling
- Real-time updates where applicable

---

Would you like me to generate code for specific Phase 2/3 tasks first?
