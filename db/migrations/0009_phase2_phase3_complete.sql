-- PHASE 2 & PHASE 3 DATABASE MIGRATIONS
-- Complete construction ERP schema

-- ============================================
-- PHASE 2: ANALYTICS, BIM, QUALITY
-- ============================================

CREATE TABLE IF NOT EXISTS construction_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  
  -- Quality & Safety
  defect_count INTEGER,
  ncr_count INTEGER,
  quality_score DECIMAL(5,2),
  incidents INTEGER,
  trifr DECIMAL(8,2),
  
  -- Resource
  resource_utilization DECIMAL(5,2),
  labor_productivity DECIMAL(5,2),
  equipment_utilization DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS bim_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  model_name VARCHAR(255),
  model_file_path TEXT,
  model_type VARCHAR(50),
  file_size_mb DECIMAL(10,2),
  
  created_date DATE,
  last_updated DATE,
  uploaded_by INTEGER,
  
  processing_status VARCHAR(50) DEFAULT 'pending',
  is_active BOOLEAN DEFAULT 1,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS ncr_nonconformances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  ncr_number VARCHAR(100) UNIQUE,
  issued_date DATE,
  area_code VARCHAR(50),
  
  nonconformance_description TEXT,
  specification_reference TEXT,
  severity VARCHAR(50),
  
  issued_by INTEGER,
  assigned_to INTEGER,
  
  corrective_action TEXT,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  verified_by INTEGER,
  verification_date DATE,
  status VARCHAR(50) DEFAULT 'Open',
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS punch_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  punch_number VARCHAR(100),
  area VARCHAR(255),
  trade VARCHAR(100),
  
  item_description TEXT,
  priority VARCHAR(50),
  
  location_description TEXT,
  photo_reference TEXT,
  
  status VARCHAR(50) DEFAULT 'Open',
  assigned_to INTEGER,
  
  created_date DATE,
  target_date DATE,
  completed_date DATE,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS rfi_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  rfi_number VARCHAR(100) UNIQUE,
  issued_date DATE,
  
  question TEXT,
  background_info TEXT,
  drawings_reference TEXT,
  
  submitted_by INTEGER,
  submitted_to INTEGER,
  
  response_text TEXT,
  responded_by INTEGER,
  response_date DATE,
  
  status VARCHAR(50) DEFAULT 'Submitted',
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  equipment_id INTEGER,
  maintenance_type VARCHAR(100),
  scheduled_date DATE,
  actual_date DATE,
  
  estimated_downtime INTEGER,
  maintenance_cost DECIMAL(10,2),
  
  performed_by INTEGER,
  status VARCHAR(50) DEFAULT 'Scheduled',
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS equipment_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  equipment_id INTEGER,
  usage_hours DECIMAL(10,2),
  operated_by INTEGER,
  usage_date DATE,
  
  fuel_quantity DECIMAL(10,2),
  fuel_cost DECIMAL(10,2),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS balady_permits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  permit_number VARCHAR(100) UNIQUE,
  permit_type VARCHAR(100),
  application_date DATE,
  scope TEXT,
  
  status VARCHAR(50) DEFAULT 'Submitted',
  approval_date DATE,
  expiry_date DATE,
  
  inspector VARCHAR(255),
  inspection_date DATE,
  inspection_status VARCHAR(50),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- ============================================
-- PHASE 3: SCHEDULING, WIP, FORECASTING
-- ============================================

CREATE TABLE IF NOT EXISTS cpm_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  task_code VARCHAR(50),
  task_name VARCHAR(255),
  
  planned_duration_days INTEGER,
  actual_duration_days INTEGER,
  
  early_start DATE,
  early_finish DATE,
  late_start DATE,
  late_finish DATE,
  
  predecessor_task_id INTEGER,
  relationship_type VARCHAR(10),
  lag_days INTEGER,
  
  assigned_resource_id INTEGER,
  resource_hours INTEGER,
  
  progress_percent DECIMAL(5,2),
  is_critical_path BOOLEAN,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS wip_calculation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  reporting_period DATE,
  
  labor_wip DECIMAL(15,2),
  materials_wip DECIMAL(15,2),
  equipment_wip DECIMAL(15,2),
  overhead_wip DECIMAL(15,2),
  
  total_wip DECIMAL(15,2),
  
  revenue_recognized DECIMAL(15,2),
  profit_recognized DECIMAL(15,2),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS predictive_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  prediction_type VARCHAR(100),
  predicted_date DATE,
  
  delay_risk_score DECIMAL(5,2),
  delay_risk_level VARCHAR(50),
  predicted_delay_days INTEGER,
  
  budget_overrun_score DECIMAL(5,2),
  projected_overrun DECIMAL(15,2),
  
  resource_shortage_score DECIMAL(5,2),
  confidence DECIMAL(5,2),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS claims_change_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  
  co_number VARCHAR(100) UNIQUE,
  claim_type VARCHAR(100),
  claim_basis TEXT,
  
  requested_amount DECIMAL(15,2),
  proposed_amount DECIMAL(15,2),
  approved_amount DECIMAL(15,2),
  
  scope TEXT,
  impacted_tasks JSON,
  
  status VARCHAR(50) DEFAULT 'Submitted',
  submitted_date DATE,
  approved_date DATE,
  
  schedule_impact INTEGER,
  cost_impact DECIMAL(15,2),
  quality_impact VARCHAR(50),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS employee_timesheets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  project_id INTEGER,
  
  week_start_date DATE,
  daily_hours JSON,
  total_hours DECIMAL(10,2),
  
  status VARCHAR(50) DEFAULT 'Submitted',
  approved_by INTEGER,
  approved_date DATE,
  
  notes TEXT,
  
  created_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE TABLE IF NOT EXISTS employee_leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  
  start_date DATE,
  end_date DATE,
  leave_type VARCHAR(50),
  leave_days INTEGER,
  
  reason TEXT,
  status VARCHAR(50) DEFAULT 'Submitted',
  
  approved_by INTEGER,
  approved_date DATE,
  
  created_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  reporting_period DATE,
  
  schedule_performance DECIMAL(5,2),
  cost_performance DECIMAL(5,2),
  quality_performance DECIMAL(5,2),
  safety_performance DECIMAL(5,2),
  
  labor_productivity DECIMAL(10,2),
  equipment_productivity DECIMAL(10,2),
  material_efficiency DECIMAL(5,2),
  
  project_health_score DECIMAL(5,2),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS portfolio_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  reporting_date DATE,
  
  total_projects INTEGER,
  active_projects INTEGER,
  completed_projects INTEGER,
  on_time_projects INTEGER,
  on_budget_projects INTEGER,
  
  total_portfolio_value DECIMAL(15,2),
  total_spent DECIMAL(15,2),
  portfolio_variance_percent DECIMAL(5,2),
  average_project_health DECIMAL(5,2),
  
  created_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indexes for performance
CREATE INDEX idx_analytics_project ON construction_analytics(project_id);
CREATE INDEX idx_bim_project ON bim_models(project_id);
CREATE INDEX idx_ncr_project ON ncr_nonconformances(project_id);
CREATE INDEX idx_punch_project ON punch_lists(project_id);
CREATE INDEX idx_permits_project ON balady_permits(project_id);
CREATE INDEX idx_cpm_project ON cpm_tasks(project_id);
CREATE INDEX idx_wip_project ON wip_calculation(project_id);
CREATE INDEX idx_claims_project ON claims_change_orders(project_id);
CREATE INDEX idx_performance_project ON performance_metrics(project_id);
CREATE INDEX idx_portfolio_tenant ON portfolio_metrics(tenant_id);

-- Foreign key constraints
ALTER TABLE equipment_maintenance ADD CONSTRAINT fk_equipment_project 
  FOREIGN KEY (project_id) REFERENCES construction_projects(id);
  
ALTER TABLE equipment_usage ADD CONSTRAINT fk_usage_project 
  FOREIGN KEY (project_id) REFERENCES construction_projects(id);
