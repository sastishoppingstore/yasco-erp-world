-- SOC2 / ISO 27001 / GDPR / Saudi PDPL Readiness
-- Migration 0006: Data protection, compliance, audit export tables

-- ============================================================
-- 1. Data Classification Labels
-- ============================================================
CREATE TABLE `data_classifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255),
  `level` int NOT NULL DEFAULT '1',
  `description` text,
  `color_hex` varchar(7) DEFAULT '#6b7280',
  `requires_encryption` tinyint NOT NULL DEFAULT '0',
  `requires_consent` tinyint NOT NULL DEFAULT '0',
  `retention_days` int DEFAULT NULL,
  `is_system` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `data_class_tenant_idx` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Personal Data Inventory
-- ============================================================
CREATE TABLE `personal_data_inventory` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `data_controller` varchar(255) NOT NULL DEFAULT 'tenant',
  `data_subject_type` enum('employee','customer','supplier','contact','user','other') NOT NULL,
  `data_subject_id` bigint unsigned DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `field_name` varchar(255) NOT NULL,
  `data_type` enum('personal','sensitive','biometric','financial','health','criminal','other') NOT NULL,
  `lawful_basis` varchar(255) DEFAULT 'explicit_consent',
  `purpose` text,
  `classification_id` bigint unsigned DEFAULT NULL,
  `storage_location` varchar(255) DEFAULT 'database',
  `retention_days` int DEFAULT NULL,
  `is_encrypted` tinyint NOT NULL DEFAULT '0',
  `is_anonymized` tinyint NOT NULL DEFAULT '0',
  `third_party_sharing` json DEFAULT NULL,
  `data_processed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pdi_tenant_idx` (`tenant_id`),
  KEY `pdi_subject_idx` (`data_subject_type`,`data_subject_id`),
  KEY `pdi_classification_idx` (`classification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Data Retention Policies
-- ============================================================
CREATE TABLE `data_retention_policies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `retention_days` int NOT NULL,
  `action` enum('delete','anonymize','archive','flag_for_review') NOT NULL DEFAULT 'archive',
  `legal_basis` text,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `drp_tenant_idx` (`tenant_id`,`entity_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. Data Subject Access Requests (DSAR)
-- ============================================================
CREATE TABLE `data_subject_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `request_type` enum('access','rectification','erasure','restrict','portability','objection','withdraw_consent') NOT NULL,
  `subject_type` enum('employee','customer','supplier','contact','user') NOT NULL,
  `subject_id` bigint unsigned NOT NULL,
  `subject_email` varchar(320) DEFAULT NULL,
  `subject_phone` varchar(50) DEFAULT NULL,
  `request_details` text,
  `status` enum('pending','verifying','in_progress','completed','rejected','partially_completed') NOT NULL DEFAULT 'pending',
  `assigned_to` bigint unsigned DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `response_summary` text,
  `rejection_reason` text,
  `data_export_file` text,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verification_method` varchar(100) DEFAULT NULL,
  `regulation` enum('gdpr','pdpl','ccpa','lgpd','other') NOT NULL DEFAULT 'pdpl',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dsar_tenant_idx` (`tenant_id`),
  KEY `dsar_subject_idx` (`subject_type`,`subject_id`),
  KEY `dsar_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Data Processing Agreements (DPA)
-- ============================================================
CREATE TABLE `data_processing_agreements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `processor_name` varchar(255) NOT NULL,
  `processor_contact` varchar(255) DEFAULT NULL,
  `processor_email` varchar(320) DEFAULT NULL,
  `purpose` text NOT NULL,
  `data_categories` json NOT NULL,
  `data_subject_categories` json DEFAULT NULL,
  `processing_activities` text,
  `security_measures` text,
  `personal_data_transfers` tinyint NOT NULL DEFAULT '0',
  `transfer_countries` json DEFAULT NULL,
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` enum('draft','active','expired','terminated') NOT NULL DEFAULT 'draft',
  `document_id` bigint unsigned DEFAULT NULL,
  `signed_by_controller` tinyint NOT NULL DEFAULT '0',
  `signed_by_processor` tinyint NOT NULL DEFAULT '0',
  `controller_signed_at` timestamp NULL DEFAULT NULL,
  `processor_signed_at` timestamp NULL DEFAULT NULL,
  `notes` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dpa_tenant_idx` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Security Incident Log
-- ============================================================
CREATE TABLE `security_incidents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `incident_type` enum('data_breach','unauthorized_access','malware','phishing','ddos','insider_threat','physical_breach','policy_violation','other') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `description` text,
  `detected_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `detected_by` bigint unsigned DEFAULT NULL,
  `affected_data` json DEFAULT NULL,
  `affected_users` int DEFAULT '0',
  `root_cause` text,
  `resolution` text,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` bigint unsigned DEFAULT NULL,
  `status` enum('open','investigating','contained','resolved','closed') NOT NULL DEFAULT 'open',
  `notified_authority` tinyint NOT NULL DEFAULT '0',
  `notified_at` timestamp NULL DEFAULT NULL,
  `authority_reference` varchar(255) DEFAULT NULL,
  `notified_affected` tinyint NOT NULL DEFAULT '0',
  `lessons_learned` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sec_inc_tenant_idx` (`tenant_id`),
  KEY `sec_inc_status_idx` (`status`),
  KEY `sec_inc_severity_idx` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Change Management Log
-- ============================================================
CREATE TABLE `change_management_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `change_type` enum('configuration','schema_update','code_deploy','permission_change','data_migration','integration_change','other') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `affected_modules` json DEFAULT NULL,
  `changed_by` bigint unsigned DEFAULT NULL,
  `changed_by_name` varchar(255) DEFAULT NULL,
  `rollback_plan` text,
  `risk_level` enum('low','medium','high') NOT NULL DEFAULT 'low',
  `approval_status` enum('pending','approved','rejected','rolled_back') NOT NULL DEFAULT 'pending',
  `approved_by` bigint unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rolled_back_at` timestamp NULL DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cml_tenant_idx` (`tenant_id`),
  KEY `cml_type_idx` (`change_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Compliance Framework Settings
-- ============================================================
CREATE TABLE `compliance_framework_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `framework` enum('soc2','iso27001','gdpr','pdpl','ccpa','hipaa','pci_dss','other') NOT NULL,
  `is_enabled` tinyint NOT NULL DEFAULT '0',
  `certification_status` enum('not_started','in_progress','auditing','certified','expired') NOT NULL DEFAULT 'not_started',
  `certification_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `auditor_name` varchar(255) DEFAULT NULL,
  `auditor_company` varchar(255) DEFAULT NULL,
  `config` json DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cfs_tenant_idx` (`tenant_id`,`framework`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. Consent Records (GDPR/PDPL)
-- ============================================================
CREATE TABLE `consent_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `subject_type` enum('employee','customer','supplier','contact','user') NOT NULL,
  `subject_id` bigint unsigned NOT NULL,
  `consent_type` varchar(100) NOT NULL,
  `is_consented` tinyint NOT NULL DEFAULT '1',
  `consent_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `consent_version` varchar(20) DEFAULT '1.0',
  `lawful_basis` varchar(255) NOT NULL DEFAULT 'explicit_consent',
  `purpose_description` text,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_ip` varchar(50) DEFAULT NULL,
  `data_deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `consent_tenant_idx` (`tenant_id`),
  KEY `consent_subject_idx` (`subject_type`,`subject_id`),
  KEY `consent_type_idx` (`consent_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
