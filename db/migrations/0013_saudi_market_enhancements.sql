-- =====================================================
-- YASCO ERP - Saudi Market Enhancement Migration
-- Version: 0013
-- Date: 2026-07-03
-- Description: Add Saudi Arabia specific fields for ZATCA Phase 2 compliance
-- =====================================================

-- =====================================================
-- 1. COMPANIES TABLE - SAUDI ENHANCEMENTS
-- =====================================================

ALTER TABLE `companies` 
ADD COLUMN `trade_name_en` VARCHAR(255) AFTER `display_name`,
ADD COLUMN `trade_name_ar` VARCHAR(255) AFTER `trade_name_en`,
ADD COLUMN `legal_name_ar` VARCHAR(255) AFTER `legal_name`,
ADD COLUMN `commercial_registration` VARCHAR(100) AFTER `legal_name_ar`,
ADD COLUMN `cr_expiry_date` DATE AFTER `commercial_registration`,
ADD COLUMN `vat_registration_number` VARCHAR(15) AFTER `cr_expiry_date`,
ADD COLUMN `vat_certificate_expiry_date` DATE AFTER `vat_registration_number`,
ADD COLUMN `branch_code` VARCHAR(50) AFTER `vat_certificate_expiry_date`,
ADD COLUMN `branch_cr` VARCHAR(100) AFTER `branch_code`,
ADD COLUMN `building_number` VARCHAR(10) AFTER `branch_cr`,
ADD COLUMN `street_name` VARCHAR(255) AFTER `building_number`,
ADD COLUMN `street_name_ar` VARCHAR(255) AFTER `street_name`,
ADD COLUMN `district` VARCHAR(255) AFTER `street_name_ar`,
ADD COLUMN `district_ar` VARCHAR(255) AFTER `district`,
ADD COLUMN `city_name` VARCHAR(100) AFTER `district_ar`,
ADD COLUMN `city_name_ar` VARCHAR(100) AFTER `city_name`,
ADD COLUMN `postal_code` VARCHAR(10) AFTER `city_name_ar`,
ADD COLUMN `additional_number` VARCHAR(10) AFTER `postal_code`,
ADD COLUMN `bank_name` VARCHAR(255) AFTER `additional_number`,
ADD COLUMN `bank_name_ar` VARCHAR(255) AFTER `bank_name`,
ADD COLUMN `iban` VARCHAR(34) AFTER `bank_name_ar`,
ADD COLUMN `bank_account_number` VARCHAR(100) AFTER `iban`,
ADD COLUMN `swift_code` VARCHAR(11) AFTER `bank_account_number`,
ADD COLUMN `logo_url` TEXT AFTER `swift_code`,
ADD COLUMN `stamp_url` TEXT AFTER `logo_url`,
ADD COLUMN `signature_url` TEXT AFTER `stamp_url`,
ADD COLUMN `brand_primary_color` VARCHAR(7) DEFAULT '#1e40af' AFTER `signature_url`,
ADD COLUMN `brand_secondary_color` VARCHAR(7) DEFAULT '#3b82f6' AFTER `brand_primary_color`,
ADD COLUMN `invoice_header_color` VARCHAR(7) DEFAULT '#1e40af' AFTER `brand_secondary_color`,
ADD COLUMN `company_website` VARCHAR(255) AFTER `invoice_header_color`,
ADD COLUMN `company_email` VARCHAR(320) AFTER `company_website`,
ADD COLUMN `company_phone` VARCHAR(50) AFTER `company_email`,
ADD COLUMN `company_mobile` VARCHAR(50) AFTER `company_phone`,
ADD COLUMN `company_whatsapp` VARCHAR(50) AFTER `company_mobile`,
ADD COLUMN `default_tax_rate` DECIMAL(5,2) DEFAULT 15.00 NOT NULL AFTER `company_whatsapp`,
ADD COLUMN `default_tax_rate_effective_date` DATE AFTER `default_tax_rate`,
ADD COLUMN `invoice_prefix` VARCHAR(10) DEFAULT 'INV' AFTER `default_tax_rate_effective_date`,
ADD COLUMN `quotation_prefix` VARCHAR(10) DEFAULT 'QT' AFTER `invoice_prefix`,
ADD COLUMN `order_prefix` VARCHAR(10) DEFAULT 'SO' AFTER `quotation_prefix`,
ADD COLUMN `po_prefix` VARCHAR(10) DEFAULT 'PO' AFTER `order_prefix`,
ADD COLUMN `invoice_terms_en` TEXT AFTER `po_prefix`,
ADD COLUMN `invoice_terms_ar` TEXT AFTER `invoice_terms_en`,
ADD COLUMN `white_label_enabled` BOOLEAN DEFAULT TRUE AFTER `invoice_terms_ar`,
ADD COLUMN `allow_custom_branding` BOOLEAN DEFAULT TRUE AFTER `white_label_enabled`,
ADD COLUMN `invoice_counter` INT DEFAULT 0 NOT NULL AFTER `allow_custom_branding`,
ADD COLUMN `last_invoice_number` VARCHAR(100) AFTER `invoice_counter`;

-- =====================================================
-- 2. CUSTOMERS TABLE - SAUDI ENHANCEMENTS
-- =====================================================

ALTER TABLE `customers`
ADD COLUMN `customer_type` ENUM('b2b', 'b2c', 'government', 'cash_customer') DEFAULT 'b2c' NOT NULL AFTER `name_ar`,
ADD COLUMN `commercial_registration` VARCHAR(100) AFTER `customer_type`,
ADD COLUMN `vat_registration_number` VARCHAR(15) AFTER `commercial_registration`,
ADD COLUMN `building_number` VARCHAR(10) AFTER `address`,
ADD COLUMN `street_name` VARCHAR(255) AFTER `building_number`,
ADD COLUMN `street_name_ar` VARCHAR(255) AFTER `street_name`,
ADD COLUMN `district` VARCHAR(255) AFTER `street_name_ar`,
ADD COLUMN `district_ar` VARCHAR(255) AFTER `district`,
ADD COLUMN `city_name` VARCHAR(100) AFTER `district_ar`,
ADD COLUMN `city_name_ar` VARCHAR(100) AFTER `city_name`,
ADD COLUMN `postal_code` VARCHAR(10) AFTER `city_name_ar`,
ADD COLUMN `additional_number` VARCHAR(10) AFTER `postal_code`,
ADD COLUMN `contact_person` VARCHAR(255) AFTER `additional_number`,
ADD COLUMN `contact_job_title` VARCHAR(255) AFTER `contact_person`,
ADD COLUMN `whatsapp` VARCHAR(50) AFTER `mobile`,
ADD COLUMN `opening_balance_date` DATE AFTER `current_balance`,
ADD COLUMN `credit_limit_check_enabled` BOOLEAN DEFAULT TRUE AFTER `credit_limit`,
ADD COLUMN `customer_category` VARCHAR(100) AFTER `customer_group`,
ADD COLUMN `customer_segment` VARCHAR(100) AFTER `customer_category`,
ADD COLUMN `tax_category_id` BIGINT UNSIGNED AFTER `customer_segment`,
ADD COLUMN `vat_validated` BOOLEAN DEFAULT FALSE AFTER `tax_category_id`,
ADD COLUMN `cr_validated` BOOLEAN DEFAULT FALSE AFTER `vat_validated`,
ADD COLUMN `last_vat_check_date` TIMESTAMP NULL AFTER `cr_validated`,
ADD COLUMN `last_cr_check_date` TIMESTAMP NULL AFTER `last_vat_check_date`;

-- =====================================================
-- 3. SUPPLIERS TABLE - SAUDI ENHANCEMENTS
-- =====================================================

ALTER TABLE `suppliers`
ADD COLUMN `legal_name_en` VARCHAR(255) AFTER `name`,
ADD COLUMN `legal_name_ar` VARCHAR(255) AFTER `legal_name_en`,
ADD COLUMN `trade_name_en` VARCHAR(255) AFTER `legal_name_ar`,
ADD COLUMN `trade_name_ar` VARCHAR(255) AFTER `trade_name_en`,
ADD COLUMN `commercial_registration` VARCHAR(100) AFTER `name_ar`,
ADD COLUMN `vat_registration_number` VARCHAR(15) AFTER `commercial_registration`,
ADD COLUMN `building_number` VARCHAR(10) AFTER `address`,
ADD COLUMN `street_name` VARCHAR(255) AFTER `building_number`,
ADD COLUMN `street_name_ar` VARCHAR(255) AFTER `street_name`,
ADD COLUMN `district` VARCHAR(255) AFTER `street_name_ar`,
ADD COLUMN `district_ar` VARCHAR(255) AFTER `district`,
ADD COLUMN `city_name` VARCHAR(100) AFTER `district_ar`,
ADD COLUMN `city_name_ar` VARCHAR(100) AFTER `city_name`,
ADD COLUMN `postal_code` VARCHAR(10) AFTER `city_name_ar`,
ADD COLUMN `additional_number` VARCHAR(10) AFTER `postal_code`,
ADD COLUMN `bank_name` VARCHAR(255) AFTER `additional_number`,
ADD COLUMN `bank_name_ar` VARCHAR(255) AFTER `bank_name`,
ADD COLUMN `iban` VARCHAR(34) AFTER `bank_name_ar`,
ADD COLUMN `bank_account_number` VARCHAR(100) AFTER `iban`,
ADD COLUMN `contact_person` VARCHAR(255) AFTER `bank_account_number`,
ADD COLUMN `contact_job_title` VARCHAR(255) AFTER `contact_person`,
ADD COLUMN `whatsapp` VARCHAR(50) AFTER `mobile`,
ADD COLUMN `opening_balance_date` DATE AFTER `current_balance`,
ADD COLUMN `supplier_category` VARCHAR(100) AFTER `opening_balance_date`,
ADD COLUMN `supplier_type` VARCHAR(100) AFTER `supplier_category`,
ADD COLUMN `tax_category_id` BIGINT UNSIGNED AFTER `supplier_type`,
ADD COLUMN `vat_validated` BOOLEAN DEFAULT FALSE AFTER `tax_category_id`,
ADD COLUMN `cr_validated` BOOLEAN DEFAULT FALSE AFTER `vat_validated`,
ADD COLUMN `last_vat_check_date` TIMESTAMP NULL AFTER `cr_validated`,
ADD COLUMN `last_cr_check_date` TIMESTAMP NULL AFTER `last_vat_check_date`;

-- =====================================================
-- 4. NEW TABLE: TAX RATE HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS `tax_rate_history` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `tax_rate` DECIMAL(5,2) NOT NULL,
  `effective_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `reason` TEXT,
  `changed_by` BIGINT UNSIGNED,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `tax_rate_history_tenant_idx` (`tenant_id`),
  INDEX `tax_rate_history_date_idx` (`effective_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. NEW TABLE: TAX CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS `tax_categories` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name_en` VARCHAR(255) NOT NULL,
  `name_ar` VARCHAR(255) NOT NULL,
  `category` ENUM('standard', 'zero_rated', 'exempt', 'out_of_scope', 'reverse_charge') NOT NULL,
  `tax_rate` DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `tax_categories_tenant_idx` (`tenant_id`),
  UNIQUE KEY `tax_categories_code` (`tenant_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. NEW TABLE: ATTACHMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS `attachments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `entity_type` ENUM('customer', 'supplier', 'employee', 'invoice', 'quotation', 'purchase_order', 'project', 'contract', 'product', 'other') NOT NULL,
  `entity_id` BIGINT UNSIGNED NOT NULL,
  `document_type` ENUM('cr_certificate', 'vat_certificate', 'contract', 'purchase_order', 'invoice', 'receipt', 'iqama', 'passport', 'work_permit', 'gosi_certificate', 'insurance', 'other') NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT,
  `file_path` TEXT NOT NULL,
  `mime_type` VARCHAR(100),
  `description` TEXT,
  `expiry_date` DATE NULL,
  `reminder_days` INT DEFAULT 30,
  `uploaded_by` BIGINT UNSIGNED,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `attachments_tenant_idx` (`tenant_id`),
  INDEX `attachments_entity_idx` (`entity_type`, `entity_id`),
  INDEX `attachments_expiry_idx` (`expiry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. NEW TABLE: BRANCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS `branches` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name_en` VARCHAR(255) NOT NULL,
  `name_ar` VARCHAR(255),
  `commercial_registration` VARCHAR(100),
  `vat_registration_number` VARCHAR(15),
  `building_number` VARCHAR(10),
  `street_name` VARCHAR(255),
  `street_name_ar` VARCHAR(255),
  `district` VARCHAR(255),
  `district_ar` VARCHAR(255),
  `city_name` VARCHAR(100),
  `city_name_ar` VARCHAR(100),
  `postal_code` VARCHAR(10),
  `additional_number` VARCHAR(10),
  `phone` VARCHAR(50),
  `email` VARCHAR(320),
  `manager_id` BIGINT UNSIGNED,
  `is_head_office` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `egs_devices` JSON,
  `invoice_counter` INT DEFAULT 0 NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `branches_tenant_idx` (`tenant_id`),
  UNIQUE KEY `branches_code` (`tenant_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. NEW TABLE: ZATCA EGS DEVICES
-- =====================================================

CREATE TABLE IF NOT EXISTS `zatca_egs_devices` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED,
  `device_uuid` VARCHAR(255) NOT NULL,
  `device_name` VARCHAR(255) NOT NULL,
  `device_type` ENUM('pos_terminal', 'desktop', 'mobile', 'web', 'kiosk') NOT NULL,
  `serial_number` VARCHAR(255),
  `onboarding_status` ENUM('not_started', 'csr_generated', 'compliance_csid_obtained', 'compliance_check_passed', 'production_csid_obtained', 'active', 'suspended') DEFAULT 'not_started' NOT NULL,
  `compliance_csid` TEXT,
  `production_csid` TEXT,
  `private_key` TEXT,
  `public_key` TEXT,
  `certificate` TEXT,
  `csr_content` TEXT,
  `invoice_counter` INT DEFAULT 0 NOT NULL,
  `last_invoice_hash` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_used_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `zatca_devices_tenant_idx` (`tenant_id`),
  INDEX `zatca_devices_branch_idx` (`branch_id`),
  UNIQUE KEY `zatca_devices_uuid` (`device_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. NEW TABLE: ZATCA INVOICE ARCHIVE
-- =====================================================

CREATE TABLE IF NOT EXISTS `zatca_invoice_archive` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `invoice_id` BIGINT UNSIGNED NOT NULL,
  `device_id` BIGINT UNSIGNED,
  `invoice_number` VARCHAR(100) NOT NULL,
  `invoice_type` ENUM('standard', 'simplified', 'credit_note', 'debit_note') NOT NULL,
  `uuid` VARCHAR(255) NOT NULL,
  `icv` INT NOT NULL,
  `pih` VARCHAR(255) NOT NULL,
  `invoice_hash` VARCHAR(255) NOT NULL,
  `ubl_xml` TEXT NOT NULL,
  `qr_code` TEXT NOT NULL,
  `pdf_path` TEXT,
  `signature` TEXT,
  `signature_algorithm` VARCHAR(50),
  `submission_status` ENUM('draft', 'pending', 'cleared', 'reported', 'failed', 'warning', 'rejected') DEFAULT 'draft' NOT NULL,
  `clearance_status` VARCHAR(50),
  `reporting_status` VARCHAR(50),
  `zatca_request_id` VARCHAR(255),
  `zatca_response` JSON,
  `zatca_errors` JSON,
  `zatca_warnings` JSON,
  `issued_at` TIMESTAMP NOT NULL,
  `submitted_at` TIMESTAMP NULL,
  `cleared_at` TIMESTAMP NULL,
  `reported_at` TIMESTAMP NULL,
  `is_immutable` BOOLEAN DEFAULT TRUE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `zatca_archive_tenant_idx` (`tenant_id`),
  INDEX `zatca_archive_invoice_idx` (`invoice_id`),
  INDEX `zatca_archive_uuid_idx` (`uuid`),
  INDEX `zatca_archive_status_idx` (`submission_status`),
  UNIQUE KEY `zatca_archive_invoice` (`tenant_id`, `invoice_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. NEW TABLE: COMPLIANCE ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS `compliance_alerts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `alert_type` ENUM('cr_expiry', 'vat_cert_expiry', 'csid_expiry', 'iqama_expiry', 'passport_expiry', 'contract_expiry', 'gosi_non_compliance', 'low_stock', 'overdue_invoice', 'credit_limit_exceeded') NOT NULL,
  `severity` ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium' NOT NULL,
  `entity_type` VARCHAR(50),
  `entity_id` BIGINT UNSIGNED,
  `message` TEXT NOT NULL,
  `expiry_date` DATE,
  `days_remaining` INT,
  `status` ENUM('active', 'acknowledged', 'resolved', 'dismissed') DEFAULT 'active' NOT NULL,
  `acknowledged_by` BIGINT UNSIGNED,
  `acknowledged_at` TIMESTAMP NULL,
  `resolved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `compliance_alerts_tenant_idx` (`tenant_id`),
  INDEX `compliance_alerts_type_idx` (`alert_type`),
  INDEX `compliance_alerts_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. INSERT DEFAULT TAX CATEGORIES
-- =====================================================

-- Note: These will be inserted per tenant via application logic
-- Sample for reference:
-- INSERT INTO `tax_categories` (`tenant_id`, `code`, `name_en`, `name_ar`, `category`, `tax_rate`, `description`, `is_active`)
-- VALUES 
-- (1, 'S', 'Standard Rate', 'الضريبة القياسية', 'standard', 15.00, 'Standard VAT rate 15%', TRUE),
-- (1, 'Z', 'Zero Rated', 'معدل الصفر', 'zero_rated', 0.00, 'Zero rated supplies', TRUE),
-- (1, 'E', 'Exempt', 'معفاة', 'exempt', 0.00, 'Exempt supplies', TRUE),
-- (1, 'O', 'Out of Scope', 'خارج النطاق', 'out_of_scope', 0.00, 'Out of scope supplies', TRUE);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Run this migration with:
-- mysql -u root -p erp_database < /path/to/0013_saudi_market_enhancements.sql
