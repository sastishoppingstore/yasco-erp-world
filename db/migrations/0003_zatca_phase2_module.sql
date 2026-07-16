CREATE TABLE `companies` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `company_code` varchar(100),
  `legal_name` varchar(255) NOT NULL,
  `display_name` varchar(255),
  `country_code` varchar(2) NOT NULL DEFAULT 'SA',
  `base_currency` varchar(10) NOT NULL DEFAULT 'SAR',
  `timezone` varchar(50) NOT NULL DEFAULT 'Asia/Riyadh',
  `is_active` boolean DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `companies_id` PRIMARY KEY(`id`),
  CONSTRAINT `companies_tenant_id_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE INDEX `companies_tenant_idx` ON `companies` (`tenant_id`);
--> statement-breakpoint
CREATE INDEX `companies_country_idx` ON `companies` (`country_code`);
--> statement-breakpoint
CREATE TABLE `company_legal_details` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `legal_name_en` varchar(255) NOT NULL,
  `legal_name_ar` varchar(255),
  `vat_number` varchar(15) NOT NULL,
  `cr_number` varchar(100),
  `tax_registration_number` varchar(100),
  `business_activity` varchar(255),
  `company_address` text,
  `building_number` varchar(20),
  `street_name` varchar(255),
  `district` varchar(255),
  `city` varchar(100),
  `postal_code` varchar(20),
  `country` varchar(100) NOT NULL DEFAULT 'Saudi Arabia',
  `contact_person` varchar(255),
  `phone_number` varchar(50),
  `email_address` varchar(320),
  `company_logo` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `company_legal_details_id` PRIMARY KEY(`id`),
  CONSTRAINT `company_legal_details_tenant_id_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE INDEX `company_legal_tenant_idx` ON `company_legal_details` (`tenant_id`);
--> statement-breakpoint
CREATE INDEX `company_legal_vat_idx` ON `company_legal_details` (`vat_number`);
--> statement-breakpoint
CREATE TABLE `zatca_credentials` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `environment` enum('sandbox','production') NOT NULL DEFAULT 'sandbox',
  `vat_number` varchar(15) NOT NULL,
  `organization_identifier` varchar(255),
  `egs_serial_number` varchar(255),
  `device_uuid` varchar(100),
  `otp_encrypted` text,
  `csr_encrypted` text,
  `certificate_encrypted` text,
  `private_key_encrypted` text,
  `public_key_encrypted` text,
  `compliance_csid_encrypted` text,
  `production_csid_encrypted` text,
  `access_token_encrypted` text,
  `secret_token_encrypted` text,
  `is_active` boolean DEFAULT true,
  `last_test_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `zatca_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `zatca_credentials_tenant_idx` ON `zatca_credentials` (`tenant_id`);
--> statement-breakpoint
CREATE INDEX `zatca_credentials_env_idx` ON `zatca_credentials` (`tenant_id`,`environment`);
--> statement-breakpoint
CREATE TABLE `zatca_certificates` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `credential_id` bigint unsigned,
  `certificate_type` enum('ccsid','pcsid','csr','public_key','private_key') NOT NULL,
  `environment` enum('sandbox','production') NOT NULL DEFAULT 'sandbox',
  `serial_number` varchar(255),
  `certificate_hash` varchar(255),
  `encrypted_payload` text NOT NULL,
  `issued_at` timestamp,
  `expires_at` timestamp,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `zatca_certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `zatca_cert_tenant_idx` ON `zatca_certificates` (`tenant_id`);
--> statement-breakpoint
CREATE INDEX `zatca_cert_expiry_idx` ON `zatca_certificates` (`tenant_id`,`expires_at`);
--> statement-breakpoint
CREATE TABLE `zatca_api_logs` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `invoice_id` bigint unsigned,
  `action` enum('generate_xml','generate_qr','sign_invoice','compliance_check','clearance','reporting','sync_status','download_response') NOT NULL,
  `environment` enum('sandbox','production') NOT NULL DEFAULT 'sandbox',
  `endpoint` varchar(500),
  `request_payload` json,
  `response_payload` json,
  `http_status` int,
  `status` enum('success','pending','failed') NOT NULL DEFAULT 'pending',
  `error_code` varchar(100),
  `error_message` text,
  `ip_address` varchar(100),
  `user_agent` text,
  `user_id` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `zatca_api_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `zatca_api_logs_tenant_idx` ON `zatca_api_logs` (`tenant_id`);
--> statement-breakpoint
CREATE INDEX `zatca_api_logs_invoice_idx` ON `zatca_api_logs` (`tenant_id`,`invoice_id`);
--> statement-breakpoint
CREATE INDEX `zatca_api_logs_action_idx` ON `zatca_api_logs` (`tenant_id`,`action`);
--> statement-breakpoint
CREATE TABLE `zatca_invoice_status` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `invoice_id` bigint unsigned NOT NULL,
  `invoice_uuid` varchar(100),
  `invoice_counter` int NOT NULL DEFAULT 0,
  `invoice_hash` varchar(255),
  `previous_invoice_hash` varchar(255),
  `digital_signature` text,
  `status` enum('draft','signed','pending','submitted','cleared','reported','rejected','failed') NOT NULL DEFAULT 'draft',
  `clearance_status` varchar(100),
  `reporting_status` varchar(100),
  `zatca_request_id` varchar(255),
  `zatca_response_id` varchar(255),
  `error_code` varchar(100),
  `error_message` text,
  `warnings` json,
  `submitted_at` timestamp,
  `cleared_at` timestamp,
  `reported_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `zatca_invoice_status_id` PRIMARY KEY(`id`),
  CONSTRAINT `zatca_invoice_status_invoice_uidx` UNIQUE(`tenant_id`,`invoice_id`)
);
--> statement-breakpoint
CREATE INDEX `zatca_invoice_status_status_idx` ON `zatca_invoice_status` (`tenant_id`,`status`);
--> statement-breakpoint
CREATE TABLE `zatca_qr_codes` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `invoice_id` bigint unsigned NOT NULL,
  `tlv_base64` text NOT NULL,
  `qr_image_data_url` text,
  `tags` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `zatca_qr_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `zatca_qr_tenant_invoice_idx` ON `zatca_qr_codes` (`tenant_id`,`invoice_id`);
--> statement-breakpoint
CREATE TABLE `zatca_xml_documents` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `invoice_id` bigint unsigned NOT NULL,
  `document_type` enum('standard','simplified','credit_note','debit_note') NOT NULL DEFAULT 'standard',
  `unsigned_xml` text,
  `signed_xml` text,
  `cleared_xml` text,
  `xml_hash` varchar(255),
  `is_archived` boolean DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `zatca_xml_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `zatca_xml_tenant_invoice_idx` ON `zatca_xml_documents` (`tenant_id`,`invoice_id`);
--> statement-breakpoint
CREATE INDEX `zatca_xml_hash_idx` ON `zatca_xml_documents` (`xml_hash`);
--> statement-breakpoint
CREATE TABLE `zatca_activity_logs` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned,
  `invoice_id` bigint unsigned,
  `action` varchar(100) NOT NULL,
  `message` text,
  `metadata` json,
  `ip_address` varchar(100),
  `user_agent` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `zatca_activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `zatca_activity_tenant_idx` ON `zatca_activity_logs` (`tenant_id`);
--> statement-breakpoint
CREATE INDEX `zatca_activity_invoice_idx` ON `zatca_activity_logs` (`tenant_id`,`invoice_id`);
