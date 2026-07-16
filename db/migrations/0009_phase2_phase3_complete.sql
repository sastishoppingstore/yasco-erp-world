-- PHASE 2 & PHASE 3 DATABASE MIGRATIONS
-- Complete construction ERP schema

-- ============================================
-- PHASE 2: ANALYTICS, BIM, QUALITY
-- ============================================

CREATE TABLE IF NOT EXISTS construction_analytics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
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
  defect_count INT,
  ncr_count INT,
  quality_score DECIMAL(5,2),
  incidents INT,
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
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  model_name VARCHAR(255),
  model_file_path TEXT,
  model_type VARCHAR(50),
  file_size_mb DECIMAL(10,2),
  
  created_date DATE,
  last_updated DATE,
  uploaded_by BIGINT UNSIGNED,
  
  processing_status VARCHAR(50) DEFAULT 'pending',
  is_active BOOLEAN DEFAULT 1,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS ncr_nonconformances (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  ncr_number VARCHAR(100) UNIQUE,
  issued_date DATE,
  area_code VARCHAR(50),
  
  nonconformance_description VARCHAR(255),
  specification_reference VARCHAR(255),
  severity VARCHAR(50),
  
  issued_by INT,
  assigned_to BIGINT UNSIGNED,
  
  corrective_action VARCHAR(255),
  target_completion_date DATE,
  actual_completion_date DATE,
  
  verified_by INT,
  verification_date DATE,
  status VARCHAR(50) DEFAULT 'Open',
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS punch_lists (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  punch_number VARCHAR(100),
  area VARCHAR(255),
  trade VARCHAR(100),
  
  item_description VARCHAR(255),
  priority VARCHAR(50),
  
  location_description VARCHAR(255),
  photo_reference VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'Open',
  assigned_to BIGINT UNSIGNED,
  
  created_date DATE,
  target_date DATE,
  completed_date DATE,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS rfi_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  rfi_number VARCHAR(100) UNIQUE,
  issued_date DATE,
  
  question VARCHAR(255),
  background_info VARCHAR(255),
  drawings_reference VARCHAR(255),
  
  submitted_by INT,
  submitted_to INT,
  
  response_text VARCHAR(255),
  responded_by INT,
  response_date DATE,
  
  status VARCHAR(50) DEFAULT 'Submitted',
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  equipment_id BIGINT UNSIGNED,
  maintenance_type VARCHAR(100),
  scheduled_date DATE,
  actual_date DATE,
  
  estimated_downtime INT,
  maintenance_cost DECIMAL(10,2),
  
  performed_by INT,
  status VARCHAR(50) DEFAULT 'Scheduled',
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS equipment_usage (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  equipment_id BIGINT UNSIGNED,
  usage_hours DECIMAL(10,2),
  operated_by INT,
  usage_date DATE,
  
  fuel_quantity DECIMAL(10,2),
  fuel_cost DECIMAL(10,2),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS balady_permits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  permit_number VARCHAR(100) UNIQUE,
  permit_type VARCHAR(100),
  application_date DATE,
  scope VARCHAR(255),
  
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
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  task_code VARCHAR(50),
  task_name VARCHAR(255),
  
  planned_duration_days INT,
  actual_duration_days INT,
  
  early_start DATE,
  early_finish DATE,
  late_start DATE,
  late_finish DATE,
  
  predecessor_task_id BIGINT UNSIGNED,
  relationship_type VARCHAR(10),
  lag_days INT,
  
  assigned_resource_id BIGINT UNSIGNED,
  resource_hours INT,
  
  progress_percent DECIMAL(5,2),
  is_critical_path BOOLEAN,
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS wip_calculation (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
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
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  prediction_type VARCHAR(100),
  predicted_date DATE,
  
  delay_risk_score DECIMAL(5,2),
  delay_risk_level VARCHAR(50),
  predicted_delay_days INT,
  
  budget_overrun_score DECIMAL(5,2),
  projected_overrun DECIMAL(15,2),
  
  resource_shortage_score DECIMAL(5,2),
  confidence DECIMAL(5,2),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS claims_change_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  co_number VARCHAR(100) UNIQUE,
  claim_type VARCHAR(100),
  claim_basis VARCHAR(255),
  
  requested_amount DECIMAL(15,2),
  proposed_amount DECIMAL(15,2),
  approved_amount DECIMAL(15,2),
  
  scope VARCHAR(255),
  impacted_tasks JSON,
  
  status VARCHAR(50) DEFAULT 'Submitted',
  submitted_date DATE,
  approved_date DATE,
  
  schedule_impact INT,
  cost_impact DECIMAL(15,2),
  quality_impact VARCHAR(50),
  
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS employee_timesheets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  employee_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED,
  
  week_start_date DATE,
  daily_hours JSON,
  total_hours DECIMAL(10,2),
  
  status VARCHAR(50) DEFAULT 'Submitted',
  approved_by INT,
  approved_date DATE,
  
  notes TEXT,
  
  created_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE TABLE IF NOT EXISTS employee_leave_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  employee_id BIGINT UNSIGNED NOT NULL,
  
  start_date DATE,
  end_date DATE,
  leave_type VARCHAR(50),
  leave_days INT,
  
  reason VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Submitted',
  
  approved_by INT,
  approved_date DATE,
  
  created_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
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
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  reporting_date DATE,
  
  total_projects INT,
  active_projects INT,
  completed_projects INT,
  on_time_projects INT,
  on_budget_projects INT,
  
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
