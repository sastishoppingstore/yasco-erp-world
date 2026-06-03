-- Sync System Tables
-- Adds device_registrations, sync_logs, deleted_records_tombstone to MySQL

CREATE TABLE IF NOT EXISTS device_registrations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  platform VARCHAR(50),
  user_id BIGINT UNSIGNED,
  tenant_id BIGINT UNSIGNED,
  last_seen TIMESTAMP NULL,
  last_sync_at TIMESTAMP NULL,
  app_version VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_tenant (tenant_id),
  INDEX idx_device_user (user_id)
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED,
  user_id BIGINT UNSIGNED,
  direction ENUM('push', 'pull') NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  action VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  message TEXT,
  details_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sync_logs_tenant (tenant_id),
  INDEX idx_sync_logs_created (created_at)
);

CREATE TABLE IF NOT EXISTS deleted_records_tombstone (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  server_id BIGINT UNSIGNED,
  tenant_id BIGINT UNSIGNED,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced BOOLEAN DEFAULT FALSE,
  INDEX idx_tombstone_tenant (tenant_id),
  INDEX idx_tombstone_entity (entity_type, entity_id)
);

-- Add sync metadata columns to existing tables
-- These are added as optional columns so existing queries continue working

-- Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Suppliers
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Meetings
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS local_uuid VARCHAR(36) UNIQUE;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP NULL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);
