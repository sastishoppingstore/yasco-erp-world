-- Document Management & E-Signatures
-- Migration 0006: document_versions, document_access_logs, e_signature_requests, e_signature_logs

-- ============================================================
-- 1. Document Versions
-- ============================================================
CREATE TABLE `document_versions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `document_id` bigint unsigned NOT NULL,
  `version_number` int NOT NULL DEFAULT '1',
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` text,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `checksum_sha256` varchar(64) DEFAULT NULL,
  `change_notes` text,
  `uploaded_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `doc_ver_tenant_idx` (`tenant_id`,`document_id`),
  KEY `doc_ver_doc_idx` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Document Access Logs
-- ============================================================
CREATE TABLE `document_access_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `document_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `access_type` enum('view','download','upload','update','delete','share','print') NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `is_allowed` tinyint NOT NULL DEFAULT '1',
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `doc_access_tenant_idx` (`tenant_id`,`document_id`),
  KEY `doc_access_user_idx` (`user_id`),
  KEY `doc_access_type_idx` (`access_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. E-Signature Requests
-- ============================================================
CREATE TABLE `e_signature_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `document_id` bigint unsigned NOT NULL,
  `requested_by` bigint unsigned NOT NULL,
  `signer_id` bigint unsigned DEFAULT NULL,
  `signer_email` varchar(320) DEFAULT NULL,
  `signer_name` varchar(255) DEFAULT NULL,
  `signature_type` enum('draw','type','upload','biometric') NOT NULL DEFAULT 'draw',
  `status` enum('pending','viewed','signed','declined','expired') NOT NULL DEFAULT 'pending',
  `message` text,
  `expires_at` timestamp NULL DEFAULT NULL,
  `signed_at` timestamp NULL DEFAULT NULL,
  `declined_at` timestamp NULL DEFAULT NULL,
  `decline_reason` text,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `esig_req_tenant_idx` (`tenant_id`,`document_id`),
  KEY `esig_req_signer_idx` (`signer_id`),
  KEY `esig_req_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. E-Signature Logs
-- ============================================================
CREATE TABLE `e_signature_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `signature_request_id` bigint unsigned NOT NULL,
  `event_type` enum('created','viewed','signed','declined','expired','verified','audit_export') NOT NULL,
  `signature_data` json DEFAULT NULL,
  `signature_hash` varchar(255) DEFAULT NULL,
  `certificate_info` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `esig_log_tenant_idx` (`tenant_id`),
  KEY `esig_log_request_idx` (`signature_request_id`),
  KEY `esig_log_event_idx` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Document Expiry Reminders
-- ============================================================
CREATE TABLE `document_expiry_reminders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `document_id` bigint unsigned NOT NULL,
  `reminder_type` enum('iqama_expiry','trade_license','insurance','contract_renewal','visa_expiry','other') NOT NULL,
  `expiry_date` date NOT NULL,
  `reminder_days_before` int NOT NULL DEFAULT '30',
  `notify_user_ids` json DEFAULT NULL,
  `last_reminded_at` timestamp NULL DEFAULT NULL,
  `reminder_count` int NOT NULL DEFAULT '0',
  `status` enum('active','triggered','expired','dismissed') NOT NULL DEFAULT 'active',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `doc_rem_tenant_idx` (`tenant_id`),
  KEY `doc_rem_expiry_idx` (`expiry_date`),
  KEY `doc_rem_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. IoT Devices
-- ============================================================
CREATE TABLE `iot_devices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `device_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_online` tinyint NOT NULL DEFAULT '0',
  `last_seen` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `iot_devices_uidx` (`tenant_id`,`device_id`),
  KEY `iot_devices_type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. IoT Sensor Data
-- ============================================================
CREATE TABLE `iot_sensor_data` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `device_id` bigint unsigned NOT NULL,
  `sensor_type` varchar(100) NOT NULL,
  `value` decimal(18,6) NOT NULL,
  `unit` varchar(50) NOT NULL DEFAULT '',
  `recorded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `iot_sensor_tenant_idx` (`tenant_id`,`device_id`),
  KEY `iot_sensor_type_idx` (`sensor_type`),
  KEY `iot_sensor_recorded_idx` (`recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. IoT Threshold Alerts
-- ============================================================
CREATE TABLE `iot_threshold_alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `device_id` bigint unsigned NOT NULL,
  `sensor_type` varchar(100) NOT NULL,
  `min_value` decimal(18,6) DEFAULT NULL,
  `max_value` decimal(18,6) DEFAULT NULL,
  `enabled` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `iot_threshold_tenant_idx` (`tenant_id`,`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. IoT Alert Events
-- ============================================================
CREATE TABLE `iot_alert_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `device_id` bigint unsigned NOT NULL,
  `sensor_type` varchar(100) NOT NULL,
  `value` decimal(18,6) NOT NULL,
  `threshold_min` decimal(18,6) DEFAULT NULL,
  `threshold_max` decimal(18,6) DEFAULT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `acknowledged` tinyint NOT NULL DEFAULT '0',
  `acknowledged_by` bigint unsigned DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `iot_alert_tenant_idx` (`tenant_id`,`device_id`),
  KEY `iot_alert_severity_idx` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. Plugin Installations
-- ============================================================
CREATE TABLE `plugin_installations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `plugin_name` varchar(255) NOT NULL,
  `version` varchar(50) NOT NULL DEFAULT '1.0.0',
  `manifest` json DEFAULT NULL,
  `is_enabled` tinyint NOT NULL DEFAULT '1',
  `config` json DEFAULT NULL,
  `installed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `plugin_tenant_idx` (`tenant_id`),
  KEY `plugin_name_idx` (`plugin_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. Plugin Hook Execution Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS `plugin_hook_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `plugin_name` varchar(255) NOT NULL,
  `hook_name` varchar(255) NOT NULL,
  `status` enum('success','failed') NOT NULL DEFAULT 'success',
  `input_context` json DEFAULT NULL,
  `output_result` json DEFAULT NULL,
  `error_message` text,
  `execution_time_ms` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `plugin_hook_tenant_idx` (`tenant_id`),
  KEY `plugin_hook_name_idx` (`plugin_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
