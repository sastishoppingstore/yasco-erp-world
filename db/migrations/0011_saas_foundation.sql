-- Migration: SaaS Foundation Tables
-- Description: Subscription plans, tenant modules, usage tracking, and limits

-- =====================================================
-- 1. SUBSCRIPTION PLANS
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_cycle ENUM('monthly', 'yearly', 'one_time') DEFAULT 'monthly',
  
  -- Limits
  max_users INT DEFAULT 5,
  max_branches INT DEFAULT 1,
  max_invoices_per_month INT DEFAULT 100,
  max_devices INT DEFAULT 2,
  max_storage_gb INT DEFAULT 5,
  
  -- Modules included (JSON array)
  modules_included JSON,
  
  -- Features (JSON object)
  features JSON,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active),
  INDEX idx_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TENANT MODULES
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  module_name VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  enabled_at TIMESTAMP,
  disabled_at TIMESTAMP,
  enabled_by INT,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_tenant_module (tenant_id, module_name),
  INDEX idx_tenant (tenant_id),
  INDEX idx_module (module_name),
  INDEX idx_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TENANT USAGE TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage metrics
  user_count INT DEFAULT 0,
  active_user_count INT DEFAULT 0,
  branch_count INT DEFAULT 0,
  invoice_count INT DEFAULT 0,
  device_count INT DEFAULT 0,
  storage_mb BIGINT DEFAULT 0,
  api_calls INT DEFAULT 0,
  
  -- Snapshot date
  snapshot_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant (tenant_id),
  INDEX idx_period (period_start, period_end),
  UNIQUE KEY unique_tenant_period (tenant_id, period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TENANT LIMITS OVERRIDE
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_limits_override (
  tenant_id BIGINT UNSIGNED PRIMARY KEY,
  
  -- Custom limits
  max_users INT,
  max_branches INT,
  max_invoices_per_month INT,
  max_devices INT,
  max_storage_gb INT,
  
  -- Override details
  override_reason TEXT,
  override_by INT,
  override_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TENANT INVOICES (SaaS Billing)
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED,
  
  -- Invoice details
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Currency
  currency VARCHAR(10) DEFAULT 'SAR',
  
  -- Status
  status ENUM('draft', 'issued', 'paid', 'overdue', 'cancelled', 'refunded') DEFAULT 'draft',
  
  -- Payment
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Metadata
  notes TEXT,
  line_items JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tenant (tenant_id),
  INDEX idx_subscription (subscription_id),
  INDEX idx_status (status),
  INDEX idx_invoice_date (invoice_date),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. PAYMENT TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT UNSIGNED NOT NULL,
  invoice_id INT,
  
  -- Transaction details
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SAR',
  
  -- Gateway
  gateway VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  gateway_response JSON,
  
  -- Status
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  
  -- Timestamps
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tenant (tenant_id),
  INDEX idx_invoice (invoice_id),
  INDEX idx_status (status),
  INDEX idx_gateway (gateway)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. RESELLERS
-- =====================================================
CREATE TABLE IF NOT EXISTS resellers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Reseller details
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(320) UNIQUE NOT NULL,
  phone VARCHAR(50),
  
  -- Commission
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  
  -- White-label settings
  white_label_enabled BOOLEAN DEFAULT FALSE,
  custom_domain VARCHAR(255),
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  
  -- Status
  status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. RESELLER TENANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS reseller_tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reseller_id INT NOT NULL,
  tenant_id BIGINT UNSIGNED NOT NULL,
  
  -- Pricing
  monthly_fee DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  
  -- Dates
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_reseller_tenant (reseller_id, tenant_id),
  INDEX idx_reseller (reseller_id),
  INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. RESELLER PAYOUTS
-- =====================================================
CREATE TABLE IF NOT EXISTS reseller_payouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reseller_id INT NOT NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Amounts
  total_revenue DECIMAL(10,2),
  total_commission DECIMAL(10,2),
  
  -- Status
  status ENUM('pending', 'processing', 'paid', 'cancelled') DEFAULT 'pending',
  
  -- Payment
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Metadata
  notes TEXT,
  details JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_reseller (reseller_id),
  INDEX idx_period (period_start, period_end),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. ANNOUNCEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Severity
  severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
  
  -- Targeting (null = all tenants)
  target_tenants JSON,
  target_plans JSON,
  
  -- Schedule
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Created by
  created_by INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active),
  INDEX idx_start (start_at),
  INDEX idx_end (end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. FEATURE FLAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Flag details
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Rollout
  is_global_default BOOLEAN DEFAULT FALSE,
  enabled_tenants JSON,
  enabled_plans JSON,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (flag_name),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. SUPPORT IMPERSONATION LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS impersonation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Who impersonated
  admin_user_id INT NOT NULL,
  admin_email VARCHAR(320),
  
  -- Target
  tenant_id BIGINT UNSIGNED NOT NULL,
  target_user_id INT,
  
  -- Reason
  reason TEXT NOT NULL,
  approval_ticket VARCHAR(100),
  
  -- Session
  session_token VARCHAR(255),
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_seconds INT,
  
  -- Actions performed
  actions_log JSON,
  
  -- IP address
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_admin (admin_user_id),
  INDEX idx_tenant (tenant_id),
  INDEX idx_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEED DATA: Default Subscription Plans
-- =====================================================
INSERT INTO subscription_plans (name, display_name, description, price, billing_cycle, max_users, max_branches, max_invoices_per_month, max_devices, max_storage_gb, modules_included, features, is_active, is_public, sort_order)
VALUES
-- Free Trial
('free', 'Free Trial', '30-day trial with basic features', 0.00, 'one_time', 2, 1, 50, 1, 1, 
  JSON_ARRAY('accounting', 'inventory', 'sales', 'purchase', 'reports'),
  JSON_OBJECT('zatca', true, 'support', 'email', 'backup_retention_days', 7),
  TRUE, TRUE, 1),

-- Starter Plan
('starter', 'Starter', 'Perfect for small businesses', 299.00, 'monthly', 5, 2, 500, 3, 10,
  JSON_ARRAY('accounting', 'inventory', 'sales', 'purchase', 'crm', 'reports', 'pos'),
  JSON_OBJECT('zatca', true, 'support', 'email', 'backup_retention_days', 30, 'api_access', true),
  TRUE, TRUE, 2),

-- Professional Plan
('professional', 'Professional', 'For growing businesses with advanced needs', 999.00, 'monthly', 25, 10, 5000, 10, 50,
  JSON_ARRAY('accounting', 'inventory', 'sales', 'purchase', 'crm', 'reports', 'pos', 'hrm', 'projects', 'manufacturing', 'assets', 'construction', 'workshop'),
  JSON_OBJECT('zatca', true, 'support', 'priority', 'backup_retention_days', 90, 'api_access', true, 'custom_reports', true, 'workflow_automation', true),
  TRUE, TRUE, 3),

-- Enterprise Plan
('enterprise', 'Enterprise', 'Unlimited features for large organizations', 2999.00, 'monthly', 999, 999, 999999, 999, 500,
  JSON_ARRAY('accounting', 'inventory', 'sales', 'purchase', 'crm', 'reports', 'pos', 'hrm', 'projects', 'manufacturing', 'assets', 'construction', 'workshop', 'healthcare', 'education', 'hotel', 'transport', 'aviation'),
  JSON_OBJECT('zatca', true, 'support', 'dedicated', 'backup_retention_days', 365, 'api_access', true, 'custom_reports', true, 'workflow_automation', true, 'white_label', true, 'sla', '99.9%', 'custom_integrations', true),
  TRUE, TRUE, 4);

-- =====================================================
-- SEED DATA: Feature Flags
-- =====================================================
INSERT INTO feature_flags (flag_name, description, is_global_default, is_active)
VALUES
('ai_assistant', 'AI-powered chatbot assistant', FALSE, TRUE),
('voice_commands', 'Voice command interface', FALSE, TRUE),
('construction_module', 'Construction project management', FALSE, TRUE),
('hospital_module', 'Hospital/Clinic management', FALSE, TRUE),
('advanced_analytics', 'Advanced BI and analytics', FALSE, TRUE),
('mobile_app', 'Mobile application access', TRUE, TRUE),
('api_access', 'REST API access', FALSE, TRUE),
('webhook_integrations', 'Webhook integrations', FALSE, TRUE),
('custom_workflows', 'Custom workflow builder', FALSE, TRUE),
('white_label', 'White-label branding', FALSE, TRUE);
