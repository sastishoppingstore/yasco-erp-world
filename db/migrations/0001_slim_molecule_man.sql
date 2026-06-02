CREATE TABLE `ai_chat_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`user_id` bigint unsigned,
	`session_id` varchar(100),
	`query` text NOT NULL,
	`response` text,
	`query_type` varchar(50),
	`context` json,
	`tokens_used` int,
	`processing_time_ms` int,
	`rating` int,
	`feedback` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_chat_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_webhooks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`secret` varchar(255),
	`events` json,
	`is_active` boolean DEFAULT true,
	`last_triggered_at` timestamp,
	`failure_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`workflow_id` bigint unsigned,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` bigint unsigned,
	`requested_by` bigint unsigned,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`current_step` int DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_workflows` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`entity_type` varchar(100) NOT NULL,
	`trigger_event` varchar(100),
	`steps` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_profiles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`country_code` varchar(2) NOT NULL,
	`profile_name` varchar(255) NOT NULL,
	`requires_vat_number` boolean DEFAULT false,
	`requires_cr_number` boolean DEFAULT false,
	`requires_ntn` boolean DEFAULT false,
	`requires_strn` boolean DEFAULT false,
	`requires_cnic` boolean DEFAULT false,
	`requires_trn` boolean DEFAULT false,
	`has_province_tax` boolean DEFAULT false,
	`has_withholding_tax` boolean DEFAULT false,
	`has_digital_invoice` boolean DEFAULT false,
	`has_qr_code` boolean DEFAULT false,
	`has_e_invoice` boolean DEFAULT false,
	`invoice_languages` json,
	`tax_types` json,
	`config` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(2) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`dial_code` varchar(10),
	`flag_emoji` varchar(10),
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `e_invoice_documents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`invoice_id` bigint unsigned,
	`country_code` varchar(2) NOT NULL,
	`document_type` varchar(50) NOT NULL,
	`xml_payload` text,
	`json_payload` json,
	`qr_code` text,
	`hash` varchar(255),
	`previous_hash` varchar(255),
	`digital_signature` text,
	`certificate_id` varchar(255),
	`status` enum('draft','submitted','cleared','reported','rejected') NOT NULL DEFAULT 'draft',
	`submission_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `e_invoice_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `localization_profiles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`country_code` varchar(2) NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`date_format` varchar(20) NOT NULL DEFAULT 'DD/MM/YYYY',
	`number_format` varchar(20) NOT NULL DEFAULT '#,##0.00',
	`is_rtl` boolean DEFAULT false,
	`tax_profile` varchar(50),
	`is_default` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `localization_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_registry` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`module_key` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`description` text,
	`description_ar` text,
	`icon_name` varchar(100),
	`category` varchar(100),
	`feature_count` int DEFAULT 0,
	`route` varchar(255),
	`is_erp_module` boolean DEFAULT true,
	`is_visible_on_website` boolean DEFAULT true,
	`requires_login` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `module_registry_id` PRIMARY KEY(`id`),
	CONSTRAINT `module_registry_module_key_unique` UNIQUE(`module_key`)
);
--> statement-breakpoint
CREATE TABLE `partner_accounts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`partner_type` enum('reseller','affiliate','referral','integration_partner') NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`contact_name` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`commission_rate` decimal(5,2) NOT NULL DEFAULT '0',
	`total_earned` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('active','suspended','terminated') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`country_code` varchar(2) NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`tax_profile` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`user_id` bigint unsigned,
	`event_type` varchar(100) NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`ip_address` varchar(100),
	`user_agent` text,
	`details` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_credentials` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`integration_id` bigint unsigned,
	`credential_type` varchar(50) NOT NULL,
	`encrypted_value` text NOT NULL,
	`expires_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_identifiers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` bigint unsigned,
	`country_code` varchar(2) NOT NULL,
	`identifier_type` varchar(50) NOT NULL,
	`identifier_value` varchar(255) NOT NULL,
	`is_verified` boolean DEFAULT false,
	`verified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_identifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_integrations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`country_code` varchar(2) NOT NULL,
	`integration_type` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`is_enabled` boolean DEFAULT false,
	`is_sandbox` boolean DEFAULT true,
	`endpoint_url` varchar(500),
	`sandbox_url` varchar(500),
	`api_version` varchar(50),
	`test_connection_at` timestamp,
	`last_sync_at` timestamp,
	`config` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_profiles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`country_code` varchar(2) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`tax_type` enum('vat','gst','sales_tax','withholding','income_tax','other') NOT NULL DEFAULT 'vat',
	`default_rate` decimal(5,2) NOT NULL DEFAULT '0',
	`has_reverse_charge` boolean DEFAULT false,
	`has_zero_rated` boolean DEFAULT false,
	`has_exempt` boolean DEFAULT false,
	`has_withholding` boolean DEFAULT false,
	`has_digital_invoicing` boolean DEFAULT false,
	`has_qr_code` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`config` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_rules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`tax_profile_id` bigint unsigned,
	`name` varchar(255) NOT NULL,
	`rate` decimal(5,2) NOT NULL,
	`rule_type` enum('standard','reduced','zero','exempt','reverse_charge','withholding') NOT NULL DEFAULT 'standard',
	`applies_to` enum('goods','services','both','specific') NOT NULL DEFAULT 'both',
	`min_amount` decimal(18,4),
	`max_amount` decimal(18,4),
	`is_active` boolean DEFAULT true,
	`effective_from` date,
	`effective_to` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_submission_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`submission_id` bigint unsigned NOT NULL,
	`action` varchar(100) NOT NULL,
	`status` varchar(50) NOT NULL,
	`message` text,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_submission_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_submissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`integration_id` bigint unsigned,
	`submission_type` varchar(50) NOT NULL,
	`submission_number` varchar(100),
	`status` enum('pending','submitted','accepted','rejected','error') NOT NULL DEFAULT 'pending',
	`payload` json,
	`response` json,
	`error_code` varchar(50),
	`error_message` text,
	`retry_count` int DEFAULT 0,
	`submitted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_usage_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`active_users` int DEFAULT 0,
	`storage_used` bigint DEFAULT 0,
	`api_calls` int DEFAULT 0,
	`invoices_generated` int DEFAULT 0,
	`transactions_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `website_hero_slides` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`headline` varchar(500) NOT NULL,
	`headline_ar` varchar(500),
	`subheadline` text,
	`subheadline_ar` text,
	`cta_text` varchar(100),
	`cta_text_ar` varchar(100),
	`cta_url` varchar(500),
	`secondary_cta_text` varchar(100),
	`secondary_cta_text_ar` varchar(100),
	`secondary_cta_url` varchar(500),
	`background_class` varchar(100),
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `website_hero_slides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `website_module_cards` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`module_key` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`description` text,
	`description_ar` text,
	`icon_name` varchar(100),
	`gradient_from` varchar(50),
	`gradient_to` varchar(50),
	`feature_count` int DEFAULT 0,
	`detail_url` varchar(255),
	`is_visible` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`admin_editable` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `website_module_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `website_sections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`section_key` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`subtitle` text,
	`subtitle_ar` text,
	`content` json,
	`is_visible` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `website_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `website_sections_section_key_unique` UNIQUE(`section_key`)
);
