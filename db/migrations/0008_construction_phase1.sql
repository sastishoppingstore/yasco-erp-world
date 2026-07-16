-- Construction Module - Phase 1 Implementation
-- Payment Certificates, Job Costing, Qiwa Integration, HSE & Nitaqat

-- ============================================
-- PAYMENT CERTIFICATES
-- ============================================

CREATE TABLE IF NOT EXISTS payment_certificates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  progress_billing_id BIGINT UNSIGNED NOT NULL,
  
  -- Certificate Details
  certificate_number VARCHAR(255) UNIQUE NOT NULL,
  certificate_amount VARCHAR(255) NOT NULL,
  retention_percent VARCHAR(255) DEFAULT '5',
  retention_amount VARCHAR(255) NOT NULL,
  payment_amount VARCHAR(255) NOT NULL,
  
  -- Status & Workflow
  status VARCHAR(255) DEFAULT 'draft' ,
  
  -- Dates
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- ZATCA Integration
  zatca_invoice_id VARCHAR(255),
  zatca_qr_code VARCHAR(255),
  zatca_signature VARCHAR(255),
  zatca_certification_status VARCHAR(255) DEFAULT 'pending' ,
  
  -- Metadata
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (progress_billing_id) REFERENCES progress_billing(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_payment_certs_tenant ON payment_certificates(tenant_id);
CREATE INDEX idx_payment_certs_project ON payment_certificates(progress_billing_id);
CREATE INDEX idx_payment_certs_status ON payment_certificates(status);

CREATE TABLE IF NOT EXISTS certificate_approvals (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  certificate_id BIGINT UNSIGNED NOT NULL,
  
  -- Approval Details
  approver_role VARCHAR(255) NOT NULL ,
  approver_user_id BIGINT UNSIGNED NOT NULL,
  approval_order INT NOT NULL,
  
  -- Status
  approval_status VARCHAR(255) DEFAULT 'pending' ,
  
  -- Signature & Comments
  comments TEXT,
  signature_blob TEXT,
  signature_date TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  
  FOREIGN KEY (certificate_id) REFERENCES payment_certificates(id),
  FOREIGN KEY (approver_user_id) REFERENCES users(id)
);

CREATE INDEX idx_cert_approvals_cert ON certificate_approvals(certificate_id);

-- ============================================
-- JOB COSTING
-- ============================================

CREATE TABLE IF NOT EXISTS job_costing_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  category_name VARCHAR(255) NOT NULL,
  category_code VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS job_costing_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  -- Relationship
  project_id BIGINT UNSIGNED NOT NULL,
  wbs_item_id BIGINT UNSIGNED,
  cost_category_id BIGINT UNSIGNED NOT NULL,
  
  -- Budget vs Actual
  budget_amount VARCHAR(255) NOT NULL,
  actual_amount VARCHAR(255) DEFAULT '0',
  forecast_amount VARCHAR(255) DEFAULT '0',
  
  -- Variance Analysis
  variance_amount VARCHAR(255) DEFAULT '0',
  variance_percent VARCHAR(255) DEFAULT '0',
  variance_type VARCHAR(255) ,
  
  -- Status
  status VARCHAR(255) DEFAULT 'on_track' ,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (wbs_item_id) REFERENCES wbs_items(id),
  FOREIGN KEY (cost_category_id) REFERENCES job_costing_categories(id)
);

CREATE INDEX idx_job_costing_project ON job_costing_details(project_id);
CREATE INDEX idx_job_costing_wbs ON job_costing_details(wbs_item_id);
CREATE INDEX idx_job_costing_status ON job_costing_details(status);

CREATE TABLE IF NOT EXISTS cost_variance_alerts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  project_id BIGINT UNSIGNED NOT NULL,
  job_costing_detail_id BIGINT UNSIGNED NOT NULL,
  
  -- Alert Details
  threshold_percent INT,
  alert_severity VARCHAR(255) NOT NULL ,
  
  message TEXT NOT NULL,
  variance_details VARCHAR(255), -- JSON
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT 0,
  resolved_by BIGINT UNSIGNED,
  resolved_at TIMESTAMP,
  resolution_notes VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (job_costing_detail_id) REFERENCES job_costing_details(id),
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE INDEX idx_cost_alerts_project ON cost_variance_alerts(project_id);
CREATE INDEX idx_cost_alerts_status ON cost_variance_alerts(is_resolved);

-- ============================================
-- QIWA INTEGRATION
-- ============================================

CREATE TABLE IF NOT EXISTS qiwa_integration (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED UNIQUE NOT NULL,
  
  -- OAuth Details
  qiwa_org_id VARCHAR(255) NOT NULL,
  access_token VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255),
  token_expires_at TIMESTAMP NOT NULL,
  
  -- Sync Status
  last_sync_at TIMESTAMP,
  sync_status VARCHAR(255) DEFAULT 'pending' ,
  sync_error VARCHAR(255),
  
  -- Configuration
  auto_sync_enabled BOOLEAN DEFAULT 1,
  sync_interval_minutes INT DEFAULT 60,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS visa_quota_tracking (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  project_id BIGINT UNSIGNED NOT NULL,
  skill_category VARCHAR(255) NOT NULL,
  
  -- Quota Details
  total_quota INT NOT NULL,
  used_quota INT DEFAULT 0,
  available_quota INT NOT NULL,
  
  -- Last Updated
  qiwa_last_updated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE INDEX idx_visa_quota_project ON visa_quota_tracking(project_id);

CREATE TABLE IF NOT EXISTS worker_visa_status (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  employee_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NOT NULL,
  
  -- Visa Details
  visa_number VARCHAR(255) NOT NULL,
  visa_expiry_date DATE NOT NULL,
  sponsorship_status VARCHAR(255) DEFAULT 'active' ,
  
  -- Verification
  qiwa_verified BOOLEAN DEFAULT 0,
  last_verified_at TIMESTAMP,
  
  -- Alerts
  expiry_alert_sent BOOLEAN DEFAULT 0,
  expiry_alert_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE INDEX idx_worker_visa_project ON worker_visa_status(project_id);
CREATE INDEX idx_worker_visa_expiry ON worker_visa_status(visa_expiry_date);

CREATE TABLE IF NOT EXISTS visa_expiry_alerts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  worker_visa_status_id BIGINT UNSIGNED NOT NULL,
  employee_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NOT NULL,
  
  -- Alert Details
  days_until_expiry INT NOT NULL,
  alert_type VARCHAR(255) NOT NULL ,
  
  -- Status
  is_acknowledged BOOLEAN DEFAULT 0,
  acknowledged_by INT,
  acknowledged_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (worker_visa_status_id) REFERENCES worker_visa_status(id),
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

-- ============================================
-- NITAQAT SAUDIZATION
-- ============================================

CREATE TABLE IF NOT EXISTS nitaqat_tracking (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  project_id BIGINT UNSIGNED NOT NULL,
  reporting_period DATE NOT NULL,
  
  -- Workforce Metrics
  total_workforce INT NOT NULL,
  saudi_count INT NOT NULL,
  non_saudi_count INT NOT NULL,
  
  -- Calculations
  nitaqat_percentage VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL ,
  
  -- Compliance
  salary_ceiling_violations INT DEFAULT 0,
  compliance_status VARCHAR(255) DEFAULT 'compliant' ,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE INDEX idx_nitaqat_project ON nitaqat_tracking(project_id);

CREATE TABLE IF NOT EXISTS nitaqat_compliance_alerts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  project_id BIGINT UNSIGNED NOT NULL,
  
  -- Alert Type
  alert_type VARCHAR(255) NOT NULL ,
  
  severity VARCHAR(255) NOT NULL ,
  
  message TEXT NOT NULL,
  details VARCHAR(255), -- JSON
  
  -- Resolution
  is_acknowledged BOOLEAN DEFAULT 0,
  acknowledged_at TIMESTAMP,
  acknowledged_by INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

-- ============================================
-- HSE & SAFETY
-- ============================================

CREATE TABLE IF NOT EXISTS hse_safety_incidents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  project_id BIGINT UNSIGNED NOT NULL,
  reported_by BIGINT UNSIGNED NOT NULL,
  
  -- Incident Details
  incident_type VARCHAR(255) NOT NULL ,
  
  incident_date DATE NOT NULL,
  incident_description VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  
  -- Severity
  severity VARCHAR(255) NOT NULL ,
  
  -- Investigation
  investigation_status VARCHAR(255) DEFAULT 'open' ,
  
  root_cause_analysis VARCHAR(255),
  corrective_actions VARCHAR(255),
  preventive_measures VARCHAR(255),
  
  -- Assignment
  investigated_by INT,
  assigned_to BIGINT UNSIGNED,
  
  -- Dates
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  investigation_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id),
  FOREIGN KEY (reported_by) REFERENCES users(id)
);

CREATE INDEX idx_hse_incidents_project ON hse_safety_incidents(project_id);
CREATE INDEX idx_hse_incidents_status ON hse_safety_incidents(investigation_status);

CREATE TABLE IF NOT EXISTS hse_kpi_metrics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  project_id BIGINT UNSIGNED NOT NULL,
  reporting_period DATE NOT NULL,
  
  -- Incident Metrics
  total_incidents INT DEFAULT 0,
  lost_time_incidents INT DEFAULT 0,
  restricted_work_incidents INT DEFAULT 0,
  near_misses INT DEFAULT 0,
  
  -- Hours Worked
  total_hours_worked VARCHAR(255) DEFAULT '0',
  
  -- Calculated KPIs
  trifr VARCHAR(255), -- Total Recordable Incident Frequency Rate
  ltifr VARCHAR(255), -- Lost Time Incident Frequency Rate
  sfr VARCHAR(255), -- Safety Frequency Rate
  
  -- Training
  training_completion_percent VARCHAR(255) DEFAULT '0',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE INDEX idx_hse_kpi_project ON hse_kpi_metrics(project_id);

-- ============================================
-- OFFLINE SYNC QUEUE
-- ============================================

CREATE TABLE IF NOT EXISTS sync_queue (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  
  -- Operation Details
  operation_type VARCHAR(255) NOT NULL ,
  
  entity_type VARCHAR(255) NOT NULL,
  entity_id BIGINT UNSIGNED,
  
  -- Payload
  payload VARCHAR(255) NOT NULL, -- JSON
  
  -- Sync Status
  sync_status VARCHAR(255) DEFAULT 'pending' ,
  
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  
  last_error VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sync_queue_status ON sync_queue(sync_status);
CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
