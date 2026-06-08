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
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_tenant_id_unique` UNIQUE(`tenant_id`)
);
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
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_legal_details_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_legal_details_tenant_id_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `company_stamps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`type` enum('logo','stamp') NOT NULL,
	`image_data` text NOT NULL,
	`mime_type` varchar(50) DEFAULT 'image/png',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_stamps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `country_tax_configs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`country_code` varchar(2) NOT NULL DEFAULT 'SA',
	`tax_name` varchar(100) NOT NULL,
	`tax_name_ar` varchar(100),
	`tax_rate` decimal(5,2) NOT NULL DEFAULT '15',
	`tax_number_label` varchar(100),
	`tax_number_label_ar` varchar(100),
	`tax_authority` varchar(100),
	`tax_authority_ar` varchar(100),
	`requires_zatca` boolean DEFAULT false,
	`requires_fbr` boolean DEFAULT false,
	`invoice_note` text,
	`invoice_note_ar` text,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `country_tax_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`discount_type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
	`discount_value` decimal(10,2) NOT NULL,
	`max_uses` int DEFAULT 0,
	`used_count` int DEFAULT 0,
	`min_plan_price` decimal(10,2),
	`applicable_plans` json,
	`starts_at` timestamp,
	`expires_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `deleted_records_tombstone` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(255) NOT NULL,
	`server_id` bigint unsigned,
	`tenant_id` bigint unsigned,
	`deleted_at` timestamp NOT NULL DEFAULT (now()),
	`synced` boolean DEFAULT false,
	CONSTRAINT `deleted_records_tombstone_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `desktop_licenses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`license_key_hash` varchar(128) NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`plan` varchar(50) NOT NULL DEFAULT 'desktop',
	`max_devices` int NOT NULL DEFAULT 1,
	`status` enum('active','revoked','expired') NOT NULL DEFAULT 'active',
	`expires_at` timestamp NOT NULL,
	`issued_by` bigint unsigned,
	`last_activated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `desktop_licenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `desktop_licenses_license_key_hash_unique` UNIQUE(`license_key_hash`)
);
--> statement-breakpoint
CREATE TABLE `device_registrations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`device_id` varchar(255) NOT NULL,
	`device_name` varchar(255),
	`platform` varchar(50),
	`user_id` bigint unsigned,
	`tenant_id` bigint unsigned,
	`last_seen` timestamp,
	`last_sync_at` timestamp,
	`app_version` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `device_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `device_registrations_device_id_unique` UNIQUE(`device_id`)
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`template_key` varchar(100),
	`recipient` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text,
	`status` enum('sent','failed','queued') NOT NULL DEFAULT 'sent',
	`error_message` text,
	`sent_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`template_key` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`subject_ar` varchar(500),
	`body` text NOT NULL,
	`body_ar` text,
	`variables` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_tax_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`show_tax` boolean DEFAULT true,
	`tax_label` varchar(100) DEFAULT 'VAT',
	`tax_label_ar` varchar(100) DEFAULT 'ضريبة القيمة المضافة',
	`tax_percent` decimal(5,2) DEFAULT '15',
	`tax_inclusive` boolean DEFAULT false,
	`show_tax_number` boolean DEFAULT true,
	`show_stamp` boolean DEFAULT true,
	`show_logo` boolean DEFAULT true,
	`show_footer` boolean DEFAULT true,
	`footer_text` text,
	`footer_text_ar` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_tax_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoice_tax_settings_tenant_id_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_themes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100),
	`theme_key` varchar(50) NOT NULL,
	`config` json NOT NULL,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meeting_attendees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`meeting_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`email` varchar(320),
	`name` varchar(255),
	`is_required` boolean DEFAULT true,
	`status` enum('pending','accepted','declined','tentative') NOT NULL DEFAULT 'pending',
	`response_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meeting_attendees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meeting_notes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`meeting_id` bigint unsigned NOT NULL,
	`content` text NOT NULL,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meeting_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`date` date NOT NULL,
	`start_time` varchar(10) NOT NULL,
	`end_time` varchar(10) NOT NULL,
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`meeting_type` enum('online','offline') NOT NULL DEFAULT 'online',
	`location` varchar(255),
	`meeting_link` varchar(500),
	`status` enum('scheduled','in_progress','completed','cancelled','rescheduled') NOT NULL DEFAULT 'scheduled',
	`created_by` bigint unsigned NOT NULL,
	`reminder_sent` boolean DEFAULT false,
	`outcome` text,
	`customer_id` bigint unsigned,
	`related_type` varchar(50),
	`related_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meetings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`template_key` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`title_ar` varchar(500),
	`message` text NOT NULL,
	`message_ar` text,
	`type` enum('info','warning','success','error') NOT NULL DEFAULT 'info',
	`icon` varchar(50),
	`variables` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`description` text,
	`description_ar` text,
	`offer_type` enum('free_days','discount_percentage','discount_fixed','free_upgrade') NOT NULL DEFAULT 'free_days',
	`offer_value` decimal(10,2) NOT NULL,
	`min_duration_months` int DEFAULT 0,
	`plan_id` bigint unsigned,
	`starts_at` timestamp,
	`expires_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`otp_hash` varchar(255) NOT NULL,
	`purpose` enum('registration','login','forgot_password','email_change','sensitive_action') NOT NULL DEFAULT 'login',
	`attempts` int NOT NULL DEFAULT 0,
	`max_attempts` int NOT NULL DEFAULT 5,
	`expires_at` timestamp NOT NULL,
	`is_verified` boolean DEFAULT false,
	`verified_at` timestamp,
	`ip_address` varchar(100),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plan_features` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`plan_id` bigint unsigned NOT NULL,
	`feature_key` varchar(100) NOT NULL,
	`feature_name` varchar(255) NOT NULL,
	`feature_name_ar` varchar(255),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plan_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100),
	`description` text,
	`description_ar` text,
	`price_month` decimal(10,2) NOT NULL DEFAULT '0',
	`price_year` decimal(10,2) NOT NULL DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`product_limit` int DEFAULT 60,
	`user_limit` int DEFAULT 5,
	`branch_limit` int DEFAULT 1,
	`warehouse_limit` int DEFAULT 1,
	`trial_days` int DEFAULT 3,
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`features` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reseller_key_limits` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reseller_user_id` bigint unsigned NOT NULL,
	`max_keys` int NOT NULL DEFAULT 0,
	`keys_used` int NOT NULL DEFAULT 0,
	`set_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reseller_key_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reseller_license_keys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reseller_user_id` bigint unsigned NOT NULL,
	`tenant_id` bigint unsigned,
	`license_key` varchar(255) NOT NULL,
	`license_key_hash` varchar(128) NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`plan` varchar(50) NOT NULL DEFAULT 'standard',
	`max_users` int NOT NULL DEFAULT 5,
	`max_devices` int NOT NULL DEFAULT 1,
	`status` enum('pending','approved','rejected','active','expired','revoked') NOT NULL DEFAULT 'pending',
	`approved_by` bigint unsigned,
	`approved_at` timestamp,
	`rejected_reason` text,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reseller_license_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `reseller_license_keys_license_key_unique` UNIQUE(`license_key`),
	CONSTRAINT `reseller_license_keys_license_key_hash_unique` UNIQUE(`license_key_hash`)
);
--> statement-breakpoint
CREATE TABLE `smtp_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`host` varchar(255) NOT NULL,
	`port` int NOT NULL DEFAULT 587,
	`username` varchar(255),
	`password_encrypted` text,
	`encryption` enum('none','ssl','tls','starttls') NOT NULL DEFAULT 'starttls',
	`sender_name` varchar(255),
	`sender_email` varchar(320) NOT NULL,
	`reply_to_email` varchar(320),
	`is_active` boolean DEFAULT false,
	`test_status` enum('untested','success','failed') NOT NULL DEFAULT 'untested',
	`last_tested_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `smtp_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `smtp_settings_tenant_id_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_invoices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`subscription_id` bigint unsigned NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`billing_period_start` timestamp,
	`billing_period_end` timestamp,
	`paid_at` timestamp,
	`payment_method` varchar(50),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`payment_method` varchar(50),
	`transaction_id` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'completed',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`plan_id` bigint unsigned NOT NULL,
	`status` enum('trial','active','past_due','cancelled','expired','suspended') NOT NULL DEFAULT 'trial',
	`trial_start_at` timestamp,
	`trial_end_at` timestamp,
	`current_period_start_at` timestamp,
	`current_period_end_at` timestamp,
	`cancelled_at` timestamp,
	`grace_period_ends_at` timestamp,
	`billing_cycle` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`product_limit` int DEFAULT 60,
	`user_limit` int DEFAULT 5,
	`branch_limit` int DEFAULT 1,
	`warehouse_limit` int DEFAULT 1,
	`coupon_code` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_tenant_id_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`user_id` bigint unsigned,
	`direction` enum('push','pull') NOT NULL,
	`entity_type` varchar(100),
	`entity_id` varchar(255),
	`action` varchar(50),
	`status` varchar(50) NOT NULL,
	`message` text,
	`details_json` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_attachments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`task_id` bigint unsigned NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_path` text,
	`file_size` bigint,
	`mime_type` varchar(100),
	`uploaded_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_comments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`task_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`comment` text NOT NULL,
	`is_internal` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_comments_id` PRIMARY KEY(`id`)
);
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
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `zatca_credentials_id` PRIMARY KEY(`id`)
);
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
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `zatca_invoice_status_id` PRIMARY KEY(`id`),
	CONSTRAINT `zatca_invoice_status_invoice_uidx` UNIQUE(`tenant_id`,`invoice_id`)
);
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
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','reseller','user_admin','manager','accountant','salesman','cashier','hr','store_keeper','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `company_settings` ADD `ai_api_key` text;--> statement-breakpoint
ALTER TABLE `company_settings` ADD `ai_model` varchar(50) DEFAULT 'gemini-2.0-flash';--> statement-breakpoint
CREATE INDEX `companies_tenant_idx` ON `companies` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `companies_country_idx` ON `companies` (`country_code`);--> statement-breakpoint
CREATE INDEX `company_legal_tenant_idx` ON `company_legal_details` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `company_legal_vat_idx` ON `company_legal_details` (`vat_number`);--> statement-breakpoint
CREATE INDEX `company_stamp_tenant_idx` ON `company_stamps` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `country_tax_tenant_idx` ON `country_tax_configs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `desktop_licenses_tenant_idx` ON `desktop_licenses` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `desktop_licenses_status_idx` ON `desktop_licenses` (`status`);--> statement-breakpoint
CREATE INDEX `invoice_theme_tenant_idx` ON `invoice_themes` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `meeting_tenant_idx` ON `meetings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `meeting_date_idx` ON `meetings` (`tenant_id`,`date`);--> statement-breakpoint
CREATE INDEX `otp_email_idx` ON `otp_codes` (`email`);--> statement-breakpoint
CREATE INDEX `otp_purpose_idx` ON `otp_codes` (`email`,`purpose`);--> statement-breakpoint
CREATE INDEX `reseller_license_reseller_idx` ON `reseller_license_keys` (`reseller_user_id`);--> statement-breakpoint
CREATE INDEX `reseller_license_status_idx` ON `reseller_license_keys` (`status`);--> statement-breakpoint
CREATE INDEX `reseller_license_tenant_idx` ON `reseller_license_keys` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `zatca_activity_tenant_idx` ON `zatca_activity_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `zatca_activity_invoice_idx` ON `zatca_activity_logs` (`tenant_id`,`invoice_id`);--> statement-breakpoint
CREATE INDEX `zatca_api_logs_tenant_idx` ON `zatca_api_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `zatca_api_logs_invoice_idx` ON `zatca_api_logs` (`tenant_id`,`invoice_id`);--> statement-breakpoint
CREATE INDEX `zatca_api_logs_action_idx` ON `zatca_api_logs` (`tenant_id`,`action`);--> statement-breakpoint
CREATE INDEX `zatca_cert_tenant_idx` ON `zatca_certificates` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `zatca_cert_expiry_idx` ON `zatca_certificates` (`tenant_id`,`expires_at`);--> statement-breakpoint
CREATE INDEX `zatca_credentials_tenant_idx` ON `zatca_credentials` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `zatca_credentials_env_idx` ON `zatca_credentials` (`tenant_id`,`environment`);--> statement-breakpoint
CREATE INDEX `zatca_invoice_status_status_idx` ON `zatca_invoice_status` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `zatca_qr_tenant_invoice_idx` ON `zatca_qr_codes` (`tenant_id`,`invoice_id`);--> statement-breakpoint
CREATE INDEX `zatca_xml_tenant_invoice_idx` ON `zatca_xml_documents` (`tenant_id`,`invoice_id`);--> statement-breakpoint
CREATE INDEX `zatca_xml_hash_idx` ON `zatca_xml_documents` (`xml_hash`);