-- Saudi HR Compliance Engine
-- Migration 0006: GOSI, WPS, Qiwa, Muqeem, Nitaqat, EOSB, Biometric, PDPL

-- ============================================================
-- 1. GOSI Rate Tables (effective-dated, not hardcoded)
-- ============================================================
CREATE TABLE `gosi_rate_tables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `system_type` enum('new','old') NOT NULL DEFAULT 'new',
  `employee_annuities_rate` decimal(5,4) NOT NULL DEFAULT '0.0950',
  `employer_annuities_rate` decimal(5,4) NOT NULL DEFAULT '0.0950',
  `employer_hazards_rate` decimal(5,4) NOT NULL DEFAULT '0.0200',
  `employee_unemployment_rate` decimal(5,4) NOT NULL DEFAULT '0.0075',
  `employer_unemployment_rate` decimal(5,4) NOT NULL DEFAULT '0.0075',
  `contribution_cap` decimal(18,4) NOT NULL DEFAULT '45000.0000',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `gosi_rates_tenant_idx` (`tenant_id`),
  KEY `gosi_rates_effective_idx` (`effective_from`,`effective_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. GOSI Registrations per employee
-- ============================================================
CREATE TABLE `gosi_registrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `gosi_number` varchar(50) DEFAULT NULL,
  `is_subscriber` tinyint NOT NULL DEFAULT '1',
  `registration_date` date DEFAULT NULL,
  `system_type` enum('new','old') DEFAULT 'new',
  `contribution_cap` decimal(18,4) DEFAULT '45000.0000',
  `last_calculated_at` timestamp NULL DEFAULT NULL,
  `last_contribution` decimal(18,4) DEFAULT NULL,
  `needs_update` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gosi_reg_emp_idx` (`tenant_id`,`employee_id`),
  KEY `gosi_reg_employee_idx` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. GOSI Submission Log
-- ============================================================
CREATE TABLE `gosi_submission_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `period_month` int NOT NULL,
  `period_year` int NOT NULL,
  `total_employee_share` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `total_employer_share` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `total_contributions` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `employee_count` int NOT NULL DEFAULT '0',
  `submission_date` timestamp NULL DEFAULT NULL,
  `status` enum('draft','submitted','acknowledged','failed') DEFAULT 'draft',
  `reference_number` varchar(100) DEFAULT NULL,
  `submission_file` text,
  `notes` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `gosi_sub_tenant_idx` (`tenant_id`,`period_year`,`period_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. WPS Submissions
-- ============================================================
CREATE TABLE `wps_submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `payroll_period_id` bigint unsigned NOT NULL,
  `submission_date` date NOT NULL,
  `bank_format` varchar(50) NOT NULL DEFAULT 'sarie',
  `total_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `employee_count` int NOT NULL DEFAULT '0',
  `compliance_rate` decimal(5,2) DEFAULT NULL,
  `file_content` longtext,
  `file_name` varchar(255) DEFAULT NULL,
  `status` enum('draft','submitted','acknowledged','rejected') DEFAULT 'draft',
  `reference_number` varchar(100) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `wps_tenant_idx` (`tenant_id`,`payroll_period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. WPS Exceptions
-- ============================================================
CREATE TABLE `wps_exceptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `payroll_period_id` bigint unsigned NOT NULL,
  `exception_type` enum('unpaid_leave','disciplinary_deduction','bank_account_change','other') NOT NULL,
  `amount` decimal(18,4) DEFAULT '0.0000',
  `reason` text,
  `approved_by` bigint unsigned DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `wps_exc_tenant_idx` (`tenant_id`,`payroll_period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Qiwa Contracts
-- ============================================================
CREATE TABLE `qiwa_contracts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `qiwa_contract_id` varchar(100) DEFAULT NULL,
  `contract_type` enum('full_time','part_time','temporary','probation') DEFAULT 'full_time',
  `basic_salary` decimal(18,4) DEFAULT '0.0000',
  `housing_allowance` decimal(18,4) DEFAULT '0.0000',
  `transport_allowance` decimal(18,4) DEFAULT '0.0000',
  `other_allowances` decimal(18,4) DEFAULT '0.0000',
  `total_salary` decimal(18,4) DEFAULT '0.0000',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `last_synced_at` timestamp NULL DEFAULT NULL,
  `is_matched` tinyint NOT NULL DEFAULT '1',
  `mismatch_details` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qiwa_contract_emp_idx` (`tenant_id`,`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Qiwa Comparison Logs
-- ============================================================
CREATE TABLE `qiwa_comparison_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned DEFAULT NULL,
  `comparison_type` enum('salary','allowance','contract','all') NOT NULL,
  `expected_value` text,
  `actual_value` text,
  `difference` varchar(255) DEFAULT NULL,
  `is_match` tinyint NOT NULL DEFAULT '1',
  `checked_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `qiwa_log_tenant_idx` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Iqama Records
-- ============================================================
CREATE TABLE `iqama_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `iqama_number` varchar(50) NOT NULL,
  `passport_number` varchar(50) DEFAULT NULL,
  `issuance_date` date DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `renewal_date` date DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `sponsor_name` varchar(255) DEFAULT NULL,
  `border_number` varchar(50) DEFAULT NULL,
  `status` enum('active','expired','renewed','cancelled') DEFAULT 'active',
  `last_synced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `iqama_tenant_idx` (`tenant_id`,`employee_id`),
  KEY `iqama_expiry_idx` (`expiry_date`),
  KEY `iqama_number_idx` (`iqama_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. Nitaqat Snapshots
-- ============================================================
CREATE TABLE `nitaqat_snapshots` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `snapshot_date` date NOT NULL,
  `total_saudis` int NOT NULL DEFAULT '0',
  `total_expats` int NOT NULL DEFAULT '0',
  `saudi_ratio` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `category` enum('platinum','green','yellow','red') DEFAULT NULL,
  `target_ratio` decimal(5,4) DEFAULT NULL,
  `forecast_ratio` decimal(5,4) DEFAULT NULL,
  `what_if_hire_saudi` int DEFAULT '0',
  `what_if_hire_expat` int DEFAULT '0',
  `what_if_fire_saudi` int DEFAULT '0',
  `what_if_fire_expat` int DEFAULT '0',
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `nitaqat_tenant_idx` (`tenant_id`,`snapshot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. EOSB Accruals (continuous accrual records)
-- ============================================================
CREATE TABLE `eosb_accruals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `service_years` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `accrual_rate` decimal(5,4) NOT NULL DEFAULT '0.5000',
  `accrual_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `running_total` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `last_basic_salary` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `is_hijri` tinyint NOT NULL DEFAULT '1',
  `journal_entry_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `eosb_tenant_idx` (`tenant_id`,`employee_id`),
  KEY `eosb_period_idx` (`period_start`,`period_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. Biometric Templates (encrypted, store only template hash)
-- ============================================================
CREATE TABLE `biometric_templates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `template_type` enum('face','fingerprint','voice') NOT NULL,
  `template_hash` varchar(255) NOT NULL,
  `template_data_encrypted` text NOT NULL,
  `encryption_iv` varchar(64) NOT NULL,
  `encryption_tag` varchar(64) NOT NULL,
  `device_id` varchar(100) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `enrolled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bio_tenant_idx` (`tenant_id`,`employee_id`),
  KEY `bio_device_idx` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. Biometric Consent Records (PDPL)
-- ============================================================
CREATE TABLE `biometric_consent_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `consent_type` enum('face','fingerprint','voice','gps_location','all') NOT NULL,
  `is_consented` tinyint NOT NULL DEFAULT '1',
  `consent_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `lawful_basis` varchar(255) NOT NULL DEFAULT 'explicit_consent',
  `purpose_description` text,
  `retention_period_days` int DEFAULT '90',
  `data_deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bio_consent_tenant_idx` (`tenant_id`,`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. PDPL Data Subject Requests
-- ============================================================
CREATE TABLE `pdpl_data_subject_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `request_type` enum('access','rectification','erasure','restrict','portability','objection','withdraw_consent') NOT NULL,
  `request_details` text,
  `status` enum('pending','in_progress','completed','rejected') DEFAULT 'pending',
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `response_summary` text,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pdpl_tenant_idx` (`tenant_id`,`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. Biometric Access Logs
-- ============================================================
CREATE TABLE `biometric_access_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `template_id` bigint unsigned DEFAULT NULL,
  `employee_id` bigint unsigned DEFAULT NULL,
  `action` enum('enroll','verify','identify','view','export','delete','update') NOT NULL,
  `accessed_by` bigint unsigned NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text,
  `is_allowed` tinyint NOT NULL DEFAULT '1',
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bio_access_tenant_idx` (`tenant_id`),
  KEY `bio_access_employee_idx` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
