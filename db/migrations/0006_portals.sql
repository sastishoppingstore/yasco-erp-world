-- Portal System Tables
-- Adds portal_users, portal_sessions, portal_documents, portal_messages,
-- portal_templates, and enhanced sync stats table

CREATE TABLE IF NOT EXISTS portal_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  portal_type ENUM('customer', 'vendor', 'employee') NOT NULL,
  reference_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified_at TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_portal_user (tenant_id, portal_type, email),
  INDEX idx_portal_users_tenant (tenant_id),
  INDEX idx_portal_users_type (portal_type),
  INDEX idx_portal_users_ref (tenant_id, portal_type, reference_id)
);

CREATE TABLE IF NOT EXISTS portal_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  portal_user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_user (portal_user_id),
  FOREIGN KEY (portal_user_id) REFERENCES portal_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS portal_documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  portal_type ENUM('customer', 'vendor', 'employee') NOT NULL,
  reference_id BIGINT UNSIGNED NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT UNSIGNED,
  mime_type VARCHAR(100),
  file_path TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  notes TEXT,
  uploaded_by BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_portal_docs_tenant (tenant_id),
  INDEX idx_portal_docs_type (portal_type),
  INDEX idx_portal_docs_ref (portal_type, reference_id)
);

CREATE TABLE IF NOT EXISTS portal_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  sender_type ENUM('customer', 'vendor', 'employee', 'admin') NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  receiver_type ENUM('customer', 'vendor', 'employee', 'admin') NOT NULL,
  receiver_id BIGINT UNSIGNED NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  parent_id BIGINT UNSIGNED,
  attachment_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_msgs_tenant (tenant_id),
  INDEX idx_portal_msgs_sender (sender_type, sender_id),
  INDEX idx_portal_msgs_receiver (receiver_type, receiver_id),
  FOREIGN KEY (parent_id) REFERENCES portal_messages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS portal_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  portal_type ENUM('customer', 'vendor', 'employee', 'all') DEFAULT 'all',
  template_type ENUM('email', 'sms') NOT NULL,
  template_key VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  variables JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_portal_template (tenant_id, template_key, template_type),
  INDEX idx_portal_templates_tenant (tenant_id)
);

CREATE TABLE IF NOT EXISTS portal_notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  portal_type ENUM('customer', 'vendor', 'employee') NOT NULL,
  portal_user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  reference_type VARCHAR(100),
  reference_id BIGINT UNSIGNED,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portal_notif_user (portal_user_id),
  INDEX idx_portal_notif_read (portal_user_id, is_read),
  FOREIGN KEY (portal_user_id) REFERENCES portal_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_stats (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  device_id VARCHAR(255),
  total_pushes BIGINT UNSIGNED DEFAULT 0,
  total_pulls BIGINT UNSIGNED DEFAULT 0,
  successful_pushes BIGINT UNSIGNED DEFAULT 0,
  failed_pushes BIGINT UNSIGNED DEFAULT 0,
  successful_pulls BIGINT UNSIGNED DEFAULT 0,
  failed_pulls BIGINT UNSIGNED DEFAULT 0,
  conflicts_resolved BIGINT UNSIGNED DEFAULT 0,
  conflicts_pending BIGINT UNSIGNED DEFAULT 0,
  last_sync_at TIMESTAMP NULL,
  avg_sync_duration_ms BIGINT UNSIGNED DEFAULT 0,
  data_upload_bytes BIGINT UNSIGNED DEFAULT 0,
  data_download_bytes BIGINT UNSIGNED DEFAULT 0,
  is_online BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sync_stats_tenant (tenant_id),
  INDEX idx_sync_stats_device (device_id),
  UNIQUE KEY uk_sync_stats_device (tenant_id, device_id)
);

-- Add portal_access columns to customers, suppliers, employees
ALTER TABLE customers ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS portal_user_id BIGINT UNSIGNED;

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS portal_user_id BIGINT UNSIGNED;

ALTER TABLE employees ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS portal_user_id BIGINT UNSIGNED;

-- Add sync tracking columns
ALTER TABLE sync_logs ADD COLUMN IF NOT EXISTS batch_id VARCHAR(36);
ALTER TABLE sync_logs ADD COLUMN IF NOT EXISTS duration_ms INT UNSIGNED;
ALTER TABLE sync_logs ADD COLUMN IF NOT EXISTS record_count INT UNSIGNED;
ALTER TABLE sync_logs ADD COLUMN IF NOT EXISTS conflict_count INT UNSIGNED;
