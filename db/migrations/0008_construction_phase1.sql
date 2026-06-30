-- Construction Module - Phase 1 Implementation
-- Payment Certificates, Job Costing, Qiwa Integration, HSE & Nitaqat

-- ============================================
-- PAYMENT CERTIFICATES
-- ============================================

CREATE TABLE IF NOT EXISTS payment_certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  progress_billing_id INTEGER NOT NULL,
  
  -- Certificate Details
  certificate_number TEXT UNIQUE NOT NULL,
  certificate_amount TEXT NOT NULL,
  retention_percent TEXT DEFAULT '5',
  retention_amount TEXT NOT NULL,
  payment_amount TEXT NOT NULL,
  
  -- Status & Workflow
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending_approval', 'approved', 'signed', 'paid', 'disputed')),
  
  -- Dates
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- ZATCA Integration
  zatca_invoice_id TEXT,
  zatca_qr_code TEXT,
  zatca_signature TEXT,
  zatca_certification_status TEXT DEFAULT 'pending' CHECK(zatca_certification_status IN ('pending', 'certified', 'failed')),
  
  -- Metadata
  created_by INTEGER NOT NULL,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_id INTEGER NOT NULL,
  
  -- Approval Details
  approver_role TEXT NOT NULL CHECK(approver_role IN ('pm', 'finance', 'principal', 'client')),
  approver_user_id INTEGER NOT NULL,
  approval_order INTEGER NOT NULL,
  
  -- Status
  approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
  
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  category_name TEXT NOT NULL,
  category_code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS job_costing_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  -- Relationship
  project_id INTEGER NOT NULL,
  wbs_item_id INTEGER,
  cost_category_id INTEGER NOT NULL,
  
  -- Budget vs Actual
  budget_amount TEXT NOT NULL,
  actual_amount TEXT DEFAULT '0',
  forecast_amount TEXT DEFAULT '0',
  
  -- Variance Analysis
  variance_amount TEXT DEFAULT '0',
  variance_percent TEXT DEFAULT '0',
  variance_type TEXT CHECK(variance_type IN ('favorable', 'unfavorable')),
  
  -- Status
  status TEXT DEFAULT 'on_track' CHECK(status IN ('on_track', 'warning', 'critical')),
  
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  project_id INTEGER NOT NULL,
  job_costing_detail_id INTEGER NOT NULL,
  
  -- Alert Details
  threshold_percent INTEGER,
  alert_severity TEXT NOT NULL CHECK(alert_severity IN ('warning', 'critical')),
  
  message TEXT NOT NULL,
  variance_details TEXT, -- JSON
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT 0,
  resolved_by INTEGER,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER UNIQUE NOT NULL,
  
  -- OAuth Details
  qiwa_org_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP NOT NULL,
  
  -- Sync Status
  last_sync_at TIMESTAMP,
  sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('success', 'failed', 'pending')),
  sync_error TEXT,
  
  -- Configuration
  auto_sync_enabled BOOLEAN DEFAULT 1,
  sync_interval_minutes INTEGER DEFAULT 60,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS visa_quota_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  project_id INTEGER NOT NULL,
  skill_category TEXT NOT NULL,
  
  -- Quota Details
  total_quota INTEGER NOT NULL,
  used_quota INTEGER DEFAULT 0,
  available_quota INTEGER NOT NULL,
  
  -- Last Updated
  qiwa_last_updated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE INDEX idx_visa_quota_project ON visa_quota_tracking(project_id);

CREATE TABLE IF NOT EXISTS worker_visa_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  employee_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  
  -- Visa Details
  visa_number TEXT NOT NULL,
  visa_expiry_date DATE NOT NULL,
  sponsorship_status TEXT DEFAULT 'active' CHECK(sponsorship_status IN ('active', 'transferred', 'expired', 'pending')),
  
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  worker_visa_status_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  
  -- Alert Details
  days_until_expiry INTEGER NOT NULL,
  alert_type TEXT NOT NULL CHECK(alert_type IN ('30_days', '14_days', '7_days', 'expired')),
  
  -- Status
  is_acknowledged BOOLEAN DEFAULT 0,
  acknowledged_by INTEGER,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  project_id INTEGER NOT NULL,
  reporting_period DATE NOT NULL,
  
  -- Workforce Metrics
  total_workforce INTEGER NOT NULL,
  saudi_count INTEGER NOT NULL,
  non_saudi_count INTEGER NOT NULL,
  
  -- Calculations
  nitaqat_percentage TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('platinum', 'gold', 'silver', 'bronze')),
  
  -- Compliance
  salary_ceiling_violations INTEGER DEFAULT 0,
  compliance_status TEXT DEFAULT 'compliant' CHECK(compliance_status IN ('compliant', 'warning', 'non_compliant')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

CREATE INDEX idx_nitaqat_project ON nitaqat_tracking(project_id);

CREATE TABLE IF NOT EXISTS nitaqat_compliance_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  project_id INTEGER NOT NULL,
  
  -- Alert Type
  alert_type TEXT NOT NULL CHECK(alert_type IN ('category_drop', 'salary_ceiling_breach', 'threshold_warning', 'non_compliance')),
  
  severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'critical')),
  
  message TEXT NOT NULL,
  details TEXT, -- JSON
  
  -- Resolution
  is_acknowledged BOOLEAN DEFAULT 0,
  acknowledged_at TIMESTAMP,
  acknowledged_by INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES construction_projects(id)
);

-- ============================================
-- HSE & SAFETY
-- ============================================

CREATE TABLE IF NOT EXISTS hse_safety_incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  project_id INTEGER NOT NULL,
  reported_by INTEGER NOT NULL,
  
  -- Incident Details
  incident_type TEXT NOT NULL CHECK(incident_type IN ('lost_time', 'restricted_work', 'medical_treatment', 'near_miss', 'property_damage')),
  
  incident_date DATE NOT NULL,
  incident_description TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Severity
  severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Investigation
  investigation_status TEXT DEFAULT 'open' CHECK(investigation_status IN ('open', 'in_progress', 'completed', 'closed')),
  
  root_cause_analysis TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  
  -- Assignment
  investigated_by INTEGER,
  assigned_to INTEGER,
  
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  
  project_id INTEGER NOT NULL,
  reporting_period DATE NOT NULL,
  
  -- Incident Metrics
  total_incidents INTEGER DEFAULT 0,
  lost_time_incidents INTEGER DEFAULT 0,
  restricted_work_incidents INTEGER DEFAULT 0,
  near_misses INTEGER DEFAULT 0,
  
  -- Hours Worked
  total_hours_worked TEXT DEFAULT '0',
  
  -- Calculated KPIs
  trifr TEXT, -- Total Recordable Incident Frequency Rate
  ltifr TEXT, -- Lost Time Incident Frequency Rate
  sfr TEXT, -- Safety Frequency Rate
  
  -- Training
  training_completion_percent TEXT DEFAULT '0',
  
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  -- Operation Details
  operation_type TEXT NOT NULL CHECK(operation_type IN ('create', 'update', 'delete')),
  
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  
  -- Payload
  payload TEXT NOT NULL, -- JSON
  
  -- Sync Status
  sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending', 'synced', 'failed', 'conflict')),
  
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  last_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sync_queue_status ON sync_queue(sync_status);
CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
