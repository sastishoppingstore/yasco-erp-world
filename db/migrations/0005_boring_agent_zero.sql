CREATE TABLE `admissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`admission_number` varchar(50) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`date_of_birth` date,
	`gender` enum('male','female'),
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`guardian_name` varchar(255),
	`guardian_phone` varchar(50),
	`guardian_email` varchar(320),
	`applying_for_grade` varchar(50),
	`previous_school` varchar(255),
	`academic_year` varchar(20),
	`status` enum('inquiry','applied','interviewed','accepted','rejected','enrolled','waitlisted') NOT NULL DEFAULT 'inquiry',
	`interview_date` date,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `advance_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned,
	`payment_number` varchar(50) NOT NULL,
	`payment_type` enum('advance','mobilization','progress','retention_release') NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`paid_amount` decimal(18,4) DEFAULT '0',
	`request_date` date,
	`paid_date` date,
	`recovery_method` enum('deduction_from_bills','direct_payment'),
	`recovery_percent` decimal(5,2),
	`recovery_installments` int,
	`installment_amount` decimal(18,4),
	`remaining_amount` decimal(18,4),
	`status` enum('requested','approved','paid','fully_recovered','cancelled') NOT NULL DEFAULT 'requested',
	`bank_guarantee_number` varchar(100),
	`bank_name` varchar(255),
	`guarantee_expiry_date` date,
	`guarantee_amount` decimal(18,4),
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advance_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_automation_rules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`rule_type` varchar(50) NOT NULL,
	`description` text,
	`configuration` json,
	`ai_suggested` boolean DEFAULT false,
	`ai_confidence` decimal(5,2),
	`is_active` boolean DEFAULT true,
	`last_run_at` timestamp,
	`run_count` int DEFAULT 0,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_automation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_automation_suggestions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`rule_type` varchar(50) NOT NULL,
	`source_entity_type` varchar(100),
	`source_entity_id` bigint unsigned,
	`suggested_action` json,
	`confidence` decimal(5,2),
	`status` varchar(50) DEFAULT 'pending',
	`applied_by` bigint unsigned,
	`applied_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_automation_suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_chatbot_sessions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`customer_id` bigint unsigned,
	`session_id` varchar(100) NOT NULL,
	`channel` varchar(50) DEFAULT 'portal',
	`language` varchar(10) DEFAULT 'en',
	`customer_name` varchar(255),
	`customer_email` varchar(320),
	`customer_phone` varchar(50),
	`context` json,
	`ticket_id` bigint unsigned,
	`rating` int,
	`feedback` text,
	`status` varchar(50) DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_chatbot_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_forecast_results` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`forecast_type` varchar(50) NOT NULL,
	`entity_type` varchar(50),
	`entity_id` bigint unsigned,
	`parameters` json,
	`historical_data` json,
	`forecast_data` json,
	`confidence_interval` json,
	`seasonal_patterns` json,
	`reorder_point` int,
	`period_start` date,
	`period_end` date,
	`accuracy_score` decimal(5,2),
	`status` varchar(50) DEFAULT 'completed',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_forecast_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_report_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`natural_language_query` text NOT NULL,
	`parsed_intent` varchar(100),
	`generated_sql` text,
	`result_cache` json,
	`chart_type` varchar(50) DEFAULT 'table',
	`is_favorite` boolean DEFAULT false,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_report_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'info',
	`target_tenants` json,
	`target_plans` json,
	`start_at` timestamp,
	`end_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`key_name` varchar(255) NOT NULL,
	`key_hash` varchar(512) NOT NULL,
	`key_prefix` varchar(8),
	`permissions` json,
	`ip_whitelist` json,
	`rate_limit_per_minute` int DEFAULT 60,
	`is_active` boolean DEFAULT true,
	`expires_at` timestamp,
	`last_used_at` timestamp,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_rate_limits` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`api_key_id` bigint unsigned,
	`interval_start` timestamp,
	`request_count` int DEFAULT 0,
	`limit_per_interval` int DEFAULT 60,
	`interval_seconds` int DEFAULT 60,
	CONSTRAINT `api_rate_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_usage_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`api_key_id` bigint unsigned,
	`endpoint` varchar(255),
	`method` varchar(10),
	`http_status` int,
	`ip_address` varchar(45),
	`user_agent` text,
	`duration_ms` int,
	`request_size` int,
	`response_size` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`patient_id` bigint unsigned NOT NULL,
	`doctor_id` bigint unsigned,
	`appointment_number` varchar(50) NOT NULL,
	`appointment_date` date NOT NULL,
	`start_time` varchar(10) NOT NULL,
	`end_time` varchar(10) NOT NULL,
	`appointment_type` enum('consultation','follow_up','emergency','checkup','procedure','vaccination') NOT NULL DEFAULT 'consultation',
	`status` enum('scheduled','checked_in','in_progress','completed','cancelled','no_show','rescheduled') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_quality_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`batch_number` varchar(100) NOT NULL,
	`inspection_id` bigint unsigned,
	`ncr_id` bigint unsigned,
	`result` enum('pass','fail','rework','quarantine') NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `batch_quality_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bi_data_warehouse_tables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`table_name` varchar(100) NOT NULL,
	`display_name` varchar(255),
	`description` text,
	`source_query` text,
	`refresh_frequency` varchar(50) DEFAULT 'daily',
	`last_refreshed_at` timestamp,
	`next_scheduled_refresh` timestamp,
	`row_count` int DEFAULT 0,
	`retention_days` int DEFAULT 365,
	`is_active` boolean DEFAULT true,
	`config` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bi_data_warehouse_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bi_metrics_definitions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`metric_key` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`description` text,
	`category` varchar(100),
	`unit` varchar(50),
	`calculation_type` varchar(50) DEFAULT 'sql',
	`calculation_sql` text,
	`source_table` varchar(100),
	`dimensions` json,
	`comparison_periods` json,
	`is_precomputed` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bi_metrics_definitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `bi_metrics_definitions_key_unique` UNIQUE(`tenant_id`,`metric_key`)
);
--> statement-breakpoint
CREATE TABLE `bid_comparisons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`rfq_id` bigint unsigned NOT NULL,
	`comparison_date` date NOT NULL,
	`prepared_by` bigint unsigned,
	`criteria` json,
	`summary` text,
	`recommended_supplier_id` bigint unsigned,
	`status` enum('draft','approved') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bid_comparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biometric_access_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`template_id` bigint unsigned,
	`employee_id` bigint unsigned,
	`action` enum('enroll','verify','identify','view','export','delete','update') NOT NULL,
	`accessed_by` bigint unsigned NOT NULL,
	`ip_address` varchar(50),
	`user_agent` text,
	`is_allowed` boolean DEFAULT true,
	`reason` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biometric_access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biometric_consent_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`consent_type` enum('face','fingerprint','voice','gps_location','all') NOT NULL,
	`is_consented` boolean DEFAULT true,
	`consent_date` timestamp NOT NULL DEFAULT (now()),
	`revoked_at` timestamp,
	`ip_address` varchar(50),
	`user_agent` text,
	`lawful_basis` varchar(255) NOT NULL DEFAULT 'explicit_consent',
	`purpose_description` text,
	`retention_period_days` int DEFAULT 90,
	`data_deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biometric_consent_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biometric_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`template_type` enum('face','fingerprint','voice') NOT NULL,
	`template_hash` varchar(255) NOT NULL,
	`template_data_encrypted` text NOT NULL,
	`encryption_iv` varchar(64) NOT NULL,
	`encryption_tag` varchar(64) NOT NULL,
	`device_id` varchar(100),
	`is_active` boolean DEFAULT true,
	`enrolled_at` timestamp NOT NULL DEFAULT (now()),
	`last_used_at` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biometric_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_calendar` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`room_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`status` enum('available','booked','maintenance','blocked') NOT NULL DEFAULT 'available',
	`booking_id` bigint unsigned,
	`rate_override` decimal(18,4),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_calendar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `boq_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`wbs_id` bigint unsigned,
	`item_code` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`unit` varchar(50) NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`unit_rate` decimal(18,4) NOT NULL,
	`total_amount` decimal(18,4) NOT NULL,
	`wastage_percent` decimal(5,2) DEFAULT '0',
	`material_cost` decimal(18,4),
	`labor_cost` decimal(18,4),
	`equipment_cost` decimal(18,4),
	`direct_cost` decimal(18,4),
	`indirect_cost` decimal(18,4),
	`profit_margin` decimal(5,2),
	`tax_rate` decimal(5,2) DEFAULT '15',
	`status` enum('estimated','approved','revised','completed') NOT NULL DEFAULT 'estimated',
	`section` varchar(100),
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `boq_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `capacity_resources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`resource_code` varchar(50) NOT NULL,
	`resource_name` varchar(255) NOT NULL,
	`resource_type` enum('machine','labor','workstation','work_center') NOT NULL,
	`department_id` bigint unsigned,
	`available_hours` decimal(10,2) NOT NULL DEFAULT '0',
	`efficiency_percent` decimal(5,2) NOT NULL DEFAULT '100',
	`utilization_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`calendar_id` bigint unsigned,
	`cost_per_hour` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `capacity_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cash_drawer_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`shift_id` bigint unsigned,
	`user_id` bigint unsigned NOT NULL,
	`action` enum('opening','sale','cash_in','cash_out','payout','refund','loan','pickup','closing') NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`balance_before` decimal(18,4) NOT NULL,
	`balance_after` decimal(18,4) NOT NULL,
	`reference_type` varchar(100),
	`reference_id` bigint unsigned,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cash_drawer_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_timetables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`grade` varchar(50),
	`section` varchar(50),
	`subject` varchar(255) NOT NULL,
	`teacher_id` bigint unsigned,
	`day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
	`start_time` varchar(10) NOT NULL,
	`end_time` varchar(10) NOT NULL,
	`room_number` varchar(50),
	`academic_year` varchar(20),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `class_timetables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`agent_name` varchar(255) NOT NULL,
	`lease_id` bigint unsigned,
	`property_id` bigint unsigned,
	`commission_type` enum('rental','sale','referral') NOT NULL DEFAULT 'rental',
	`commission_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`commission_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`due_date` date,
	`status` enum('pending','approved','paid','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commission_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conflict_resolutions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`device_id` varchar(100),
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(100),
	`local_version` int DEFAULT 0,
	`server_version` int DEFAULT 0,
	`local_payload` json,
	`server_payload` json,
	`resolution` enum('local_wins','server_wins','manual','merged') NOT NULL DEFAULT 'server_wins',
	`resolved_by` bigint unsigned,
	`resolved_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conflict_resolutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consignment_inventory` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`agreed_min_level` decimal(18,4) NOT NULL DEFAULT '0',
	`agreed_max_level` decimal(18,4) NOT NULL DEFAULT '0',
	`unit_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`last_consumption_date` date,
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consignment_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consolidation_eliminations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`group_id` bigint unsigned NOT NULL,
	`entry_type` enum('interco_revenue','interco_expense','interco_receivable','interco_payable','interco_dividend','investment') NOT NULL,
	`source_company_id` bigint unsigned,
	`target_company_id` bigint unsigned,
	`account_id` bigint unsigned,
	`amount` decimal(18,2) NOT NULL DEFAULT '0',
	`elimination_method` enum('line_by_line','proportional') DEFAULT 'line_by_line',
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consolidation_eliminations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consolidation_entries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`group_id` bigint unsigned NOT NULL,
	`period_start` date,
	`period_end` date,
	`entry_type` enum('elimination','reclassification','adjustment','translation') NOT NULL,
	`description` text,
	`amount` decimal(18,2) NOT NULL DEFAULT '0',
	`account_id` bigint unsigned,
	`company_id` bigint unsigned,
	`currency` varchar(10) DEFAULT 'SAR',
	`exchange_rate` decimal(18,6) DEFAULT '1.000000',
	`status` enum('draft','posted','reversed') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consolidation_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consolidation_group_companies` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`group_id` bigint unsigned NOT NULL,
	`company_id` bigint unsigned NOT NULL,
	`ownership_percent` decimal(18,4) NOT NULL DEFAULT '100.0000',
	`consolidation_date` date,
	`is_excluded` boolean DEFAULT false,
	`notes` text,
	CONSTRAINT `consolidation_group_companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consolidation_groups` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`fiscal_year_id` bigint unsigned,
	`base_currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`consolidation_method` enum('equity','proportionate','acquisition') NOT NULL DEFAULT 'equity',
	`elimination_method` enum('line_by_line','proportional') NOT NULL DEFAULT 'line_by_line',
	`status` enum('draft','in_progress','completed') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consolidation_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `construction_contracts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`contract_number` varchar(100) NOT NULL,
	`contract_type` enum('lump_sum','cost_plus','unit_price','design_build','turnkey') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`client_id` bigint unsigned,
	`contractor_id` bigint unsigned,
	`start_date` date,
	`end_date` date,
	`contract_date` date,
	`contract_value` decimal(18,4) NOT NULL DEFAULT '0',
	`currency` varchar(3) DEFAULT 'SAR',
	`payment_terms` text,
	`liquidated_damages_percent` decimal(5,2) DEFAULT '0',
	`warranty_period_months` int DEFAULT 12,
	`retention_percent` decimal(5,2) DEFAULT '10',
	`advance_payment_percent` decimal(5,2) DEFAULT '0',
	`advance_payment_amount` decimal(18,4) DEFAULT '0',
	`insurance_required` boolean DEFAULT true,
	`insurance_amount` decimal(18,4),
	`performance_bond_percent` decimal(5,2) DEFAULT '5',
	`performance_bond_amount` decimal(18,4),
	`status` enum('draft','signed','active','amended','completed','terminated') NOT NULL DEFAULT 'draft',
	`signed_by_client` boolean,
	`signed_by_contractor` boolean,
	`signed_at` timestamp,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `construction_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `construction_projects` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`project_manager_id` bigint unsigned,
	`location` varchar(255),
	`start_date` date,
	`end_date` date,
	`contract_value` decimal(18,4) NOT NULL DEFAULT '0',
	`budget` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`progress` int DEFAULT 0,
	`status` enum('planning','tendering','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
	`project_type` enum('residential','commercial','industrial','infrastructure','renovation') NOT NULL DEFAULT 'residential',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `construction_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_assets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned,
	`obligation_id` bigint unsigned,
	`asset_type` enum('contract_asset','receivable','unbilled_receivable') NOT NULL,
	`amount` decimal(18,2) DEFAULT '0',
	`recognized_revenue` decimal(18,2) DEFAULT '0',
	`billing_amount` decimal(18,2) DEFAULT '0',
	`received_amount` decimal(18,2) DEFAULT '0',
	`status` enum('pending','recognized','billed','collected') NOT NULL DEFAULT 'pending',
	`date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_costs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned,
	`cost_type` enum('incremental_fulfillment','mobilization','setup','training','commission') NOT NULL,
	`description` text,
	`amount` decimal(18,2) DEFAULT '0',
	`capitalized_amount` decimal(18,2) DEFAULT '0',
	`amortization_period` int,
	`amortization_method` varchar(50),
	`status` enum('pending','capitalized','amortized') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_liabilities` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned,
	`obligation_id` bigint unsigned,
	`liability_type` enum('deferred_revenue','advance_billing','refund_liability') NOT NULL,
	`amount` decimal(18,2) DEFAULT '0',
	`recognized_amount` decimal(18,2) DEFAULT '0',
	`remaining_amount` decimal(18,2) DEFAULT '0',
	`status` enum('unearned','partially_recognized','fully_recognized') NOT NULL DEFAULT 'unearned',
	`date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_liabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_modifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`contract_id` bigint unsigned,
	`modification_type` enum('change_order','extension','termination','discount') NOT NULL,
	`description` text,
	`pre_modification_price` decimal(18,2) DEFAULT '0',
	`post_modification_price` decimal(18,2) DEFAULT '0',
	`effect_type` enum('prospective','cumulative') DEFAULT 'prospective',
	`effective_date` date,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_modifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `controlled_substance_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`batch_number` varchar(100),
	`prescription_id` bigint unsigned,
	`patient_name` varchar(255) NOT NULL,
	`patient_id_number` varchar(100),
	`doctor_name` varchar(255),
	`quantity_dispensed` int NOT NULL,
	`balance_before` int NOT NULL,
	`balance_after` int NOT NULL,
	`dispensed_by` bigint unsigned NOT NULL,
	`witnessed_by` bigint unsigned,
	`dispensed_at` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `controlled_substance_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `corrective_preventive_actions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`ncr_id` bigint unsigned NOT NULL,
	`action_type` enum('corrective','preventive') NOT NULL,
	`description` text NOT NULL,
	`assigned_to` bigint unsigned,
	`due_date` date,
	`status` enum('open','in_progress','completed','verified','cancelled') NOT NULL DEFAULT 'open',
	`verification_notes` text,
	`verified_by` bigint unsigned,
	`verified_at` timestamp,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `corrective_preventive_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crew_certifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`certification_type` varchar(255) NOT NULL,
	`certification_number` varchar(100),
	`issued_by` varchar(255),
	`issue_date` date,
	`expiry_date` date,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crew_certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_price_tiers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`price_tier_id` bigint unsigned NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_price_tiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_price_tiers_unique` UNIQUE(`customer_id`,`price_tier_id`)
);
--> statement-breakpoint
CREATE TABLE `cvr_reports` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`report_number` varchar(50) NOT NULL,
	`period_start` date,
	`period_end` date,
	`approved_variations` decimal(18,4) DEFAULT '0',
	`pending_variations` decimal(18,4) DEFAULT '0',
	`original_contract_value` decimal(18,4),
	`revised_contract_value` decimal(18,4),
	`work_completed_value` decimal(18,4),
	`work_remaining_value` decimal(18,4),
	`certified_amount` decimal(18,4),
	`amounts_retention` decimal(18,4),
	`amounts_paid` decimal(18,4),
	`amounts_outstanding` decimal(18,4),
	`total_cost_to_date` decimal(18,4),
	`estimated_final_cost` decimal(18,4),
	`forecast_profit_loss` decimal(18,4),
	`status` enum('draft','reviewed','approved') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cvr_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cycle_count_entries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`schedule_id` bigint unsigned NOT NULL,
	`location_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`expected_quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`variance` decimal(18,4) NOT NULL DEFAULT '0',
	`variance_reason` enum('mispick','putaway_error','damage','theft','system_error','other'),
	`counted_by` bigint unsigned,
	`count_date` timestamp NOT NULL DEFAULT (now()),
	`status` enum('open','verified','adjusted') NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cycle_count_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cycle_count_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`zone_id` bigint unsigned,
	`count_date` date NOT NULL,
	`frequency` enum('daily','weekly','monthly','quarterly','annually') NOT NULL,
	`status` enum('scheduled','in_progress','completed') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cycle_count_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_widgets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`dashboard_id` bigint unsigned NOT NULL,
	`widget_type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`data_source` json,
	`visual_config` json,
	`position_x` int DEFAULT 0,
	`position_y` int DEFAULT 0,
	`width` int DEFAULT 4,
	`height` int DEFAULT 3,
	`is_visible` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboard_widgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboards` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`description` text,
	`layout` json,
	`template_key` varchar(100),
	`is_template` boolean DEFAULT false,
	`is_default` boolean DEFAULT false,
	`is_shared` boolean DEFAULT false,
	`roles` json,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decennial_liability` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned NOT NULL,
	`liability_period_years` int DEFAULT 10,
	`start_date` date,
	`end_date` date,
	`insurance_policy_number` varchar(100),
	`insurance_provider` varchar(255),
	`insurance_amount` decimal(18,4),
	`coverage_details` text,
	`decennial_certificate` varchar(255),
	`status` enum('active','expired','claimed') NOT NULL DEFAULT 'active',
	`last_inspection_date` date,
	`next_inspection_date` date,
	`claims_raised` int DEFAULT 0,
	`claims_amount` decimal(18,4) DEFAULT '0',
	`resolved_claims_amount` decimal(18,4) DEFAULT '0',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decennial_liability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctor_rosters` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`specialization` varchar(255),
	`license_number` varchar(100),
	`consultation_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`max_patients_per_day` int DEFAULT 20,
	`working_days` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `doctor_rosters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_access_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`document_id` bigint unsigned NOT NULL,
	`action` varchar(50) NOT NULL,
	`user_id` bigint unsigned,
	`user_agent` varchar(500),
	`ip_address` varchar(45),
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driver_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`driver_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`start_time` varchar(10),
	`end_time` varchar(10),
	`status` enum('scheduled','on_duty','off_duty','on_leave') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driver_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drug_interactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id_a` bigint unsigned NOT NULL,
	`product_id_b` bigint unsigned NOT NULL,
	`severity` enum('mild','moderate','severe','contraindicated') NOT NULL DEFAULT 'moderate',
	`description` text,
	`description_ar` text,
	`recommendation` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drug_interactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `drug_interaction_pair_unique` UNIQUE(`product_id_a`,`product_id_b`)
);
--> statement-breakpoint
CREATE TABLE `dw_cube_dimensions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`cube_id` bigint unsigned,
	`dimension_id` bigint unsigned,
	`dimension_type` enum('regular','role_playing') DEFAULT 'regular',
	`role_name` varchar(100),
	CONSTRAINT `dw_cube_dimensions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dw_cube_measures` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`cube_id` bigint unsigned,
	`measure_name` varchar(255) NOT NULL,
	`measure_code` varchar(50),
	`aggregation_type` enum('sum','avg','count','min','max','distinct_count') NOT NULL,
	`source_column` varchar(255),
	`format` varchar(50),
	`is_active` boolean DEFAULT true,
	CONSTRAINT `dw_cube_measures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dw_cubes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`cube_name` varchar(255) NOT NULL,
	`cube_code` varchar(50),
	`description` text,
	`fact_table_id` bigint unsigned,
	`status` enum('active','inactive') DEFAULT 'active',
	`last_processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dw_cubes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dw_dimension_tables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`dimension_name` varchar(255) NOT NULL,
	`dimension_code` varchar(50),
	`description` text,
	`source_table` varchar(255),
	`type` enum('conformed','role_playing','junk','degenerated') DEFAULT 'conformed',
	`hierarchy_levels` int DEFAULT 1,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `dw_dimension_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dw_epsilon_certified_data` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`cube_id` bigint unsigned,
	`certification_date` timestamp,
	`certified_by` bigint unsigned,
	`notes` text,
	`version` varchar(50),
	CONSTRAINT `dw_epsilon_certified_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dw_etl_metadata` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`etl_job_id` varchar(100),
	`job_name` varchar(255),
	`job_type` enum('extract','transform','load','full') DEFAULT 'full',
	`source_connector` bigint unsigned,
	`target_connector` bigint unsigned,
	`schedule` varchar(100),
	`last_run_at` timestamp,
	`status` enum('active','paused','disabled') DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dw_etl_metadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dw_fact_tables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`fact_name` varchar(255) NOT NULL,
	`fact_code` varchar(50),
	`description` text,
	`source_schema` varchar(255),
	`source_table` varchar(255),
	`refresh_frequency` enum('realtime','hourly','daily','weekly','monthly') DEFAULT 'daily',
	`status` enum('active','inactive') DEFAULT 'active',
	`last_refreshed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dw_fact_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `e_signature_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`signature_request_id` bigint unsigned NOT NULL,
	`event_type` varchar(50) NOT NULL,
	`metadata` text,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `e_signature_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `e_signature_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`document_id` bigint unsigned NOT NULL,
	`requested_by` bigint unsigned NOT NULL,
	`signer_id` bigint unsigned,
	`signer_email` varchar(320),
	`signer_name` varchar(255),
	`signature_type` enum('draw','type','upload','biometric') NOT NULL DEFAULT 'draw',
	`status` enum('pending','signed','declined','expired') NOT NULL DEFAULT 'pending',
	`message` text,
	`signature_data` text,
	`signed_at` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `e_signature_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_acknowledgements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`outbound_id` bigint unsigned,
	`partner_id` bigint unsigned,
	`ack_type` enum('technical','functional','application') NOT NULL,
	`ack_code` varchar(50),
	`ack_description` text,
	`ack_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `edi_acknowledgements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_document_types` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`document_code` varchar(50) NOT NULL,
	`document_name` varchar(255) NOT NULL,
	`direction` enum('inbound','outbound','both') NOT NULL,
	`edi_standard` varchar(50),
	`status` enum('active','inactive') DEFAULT 'active',
	CONSTRAINT `edi_document_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_inbound_queue` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`partner_id` bigint unsigned,
	`document_type_id` bigint unsigned,
	`raw_edi` text,
	`parsed_data` json,
	`status` enum('received','parsed','mapped','processed','failed') DEFAULT 'received',
	`document_reference` varchar(255),
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `edi_inbound_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`partner_id` bigint unsigned,
	`direction` enum('inbound','outbound'),
	`document_type` varchar(100),
	`transaction_ref` varchar(255),
	`status` varchar(50),
	`message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `edi_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_mappings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`mapping_name` varchar(255) NOT NULL,
	`direction` enum('inbound','outbound') NOT NULL,
	`source_format` varchar(50) DEFAULT 'JSON',
	`target_format` varchar(50) DEFAULT 'EDI',
	`delimiter` varchar(10) DEFAULT '''',
	`segment_terminator` varchar(10) DEFAULT '''',
	`element_separator` varchar(10) DEFAULT '+',
	`component_separator` varchar(10) DEFAULT ':',
	`decimal_notation` varchar(10) DEFAULT '.',
	`release_character` varchar(10) DEFAULT '?',
	`is_default` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `edi_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_outbound_queue` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`partner_id` bigint unsigned,
	`document_type_id` bigint unsigned,
	`source_entity_type` varchar(100),
	`source_entity_id` bigint unsigned,
	`edi_payload` text,
	`status` enum('pending','generated','transmitted','acknowledged','failed') DEFAULT 'pending',
	`acknowledgement` text,
	`transmission_date` timestamp,
	`error_message` text,
	`retry_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `edi_outbound_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_partners` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`partner_code` varchar(50) NOT NULL,
	`partner_name` varchar(255) NOT NULL,
	`partner_type` enum('customer','supplier','logistics','bank','govt') NOT NULL,
	`edi_standard` enum('edifact','x12','tradacoms','custom') NOT NULL,
	`version` varchar(50),
	`sender_id` varchar(100),
	`receiver_id` varchar(100),
	`qualifier` varchar(50),
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `edi_partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edi_transaction_sets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`transaction_set_id` varchar(50) NOT NULL,
	`standard` varchar(50),
	`version` varchar(50),
	`description` text,
	`functional_group` varchar(50),
	`table_definition` json,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `edi_transaction_sets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emv_transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned,
	`transaction_id` varchar(255),
	`terminal_id` varchar(100),
	`card_type` varchar(50),
	`card_last_four` varchar(10),
	`amount` decimal(18,4) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`auth_code` varchar(50),
	`reference_number` varchar(100),
	`status` enum('pending','approved','declined','failed','refunded','voided') NOT NULL DEFAULT 'pending',
	`response_code` varchar(20),
	`response_message` text,
	`request_payload` json,
	`response_payload` json,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emv_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engineering_saudization` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`saudi_engineer_count` int,
	`total_engineer_count` int,
	`saudi_ratio` decimal(5,2),
	`required_ratio` decimal(5,2) DEFAULT '0.25',
	`saudi_supervisor_name` varchar(255),
	`saudi_supervisor_id` bigint unsigned,
	`license_number` varchar(100),
	`license_expiry_date` date,
	`shrh_status` enum('compliant','non_compliant','pending') NOT NULL DEFAULT 'pending',
	`last_audit_date` date,
	`next_audit_date` date,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engineering_saudization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eosb_accruals` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`service_years` decimal(10,4) NOT NULL DEFAULT '0',
	`accrual_rate` decimal(5,4) NOT NULL DEFAULT '0.5000',
	`accrual_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`running_total` decimal(18,4) NOT NULL DEFAULT '0',
	`last_basic_salary` decimal(18,4) NOT NULL DEFAULT '0',
	`is_hijri` boolean DEFAULT true,
	`journal_entry_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eosb_accruals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment_schedule` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`start_date` timestamp,
	`end_date` timestamp,
	`operator_name` varchar(255),
	`purpose` text,
	`status` enum('scheduled','in_use','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `equipment_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment_tracking` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`equipment_code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`asset_id` bigint unsigned,
	`project_id` bigint unsigned,
	`type` varchar(100),
	`hourly_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`daily_rate` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('available','in_use','maintenance','retired') NOT NULL DEFAULT 'available',
	`hours_used` decimal(10,2) NOT NULL DEFAULT '0',
	`location` varchar(255),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `equipment_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_connectors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`connector_name` varchar(255) NOT NULL,
	`connector_type` enum('mysql','postgres','s3','ftp','http','csv','excel','api','custom') NOT NULL,
	`connection_config` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `etl_connectors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_data_quality_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`execution_id` bigint unsigned,
	`rule_id` bigint unsigned,
	`row_ref` varchar(255),
	`field_name` varchar(255),
	`expected_value` text,
	`actual_value` text,
	`severity` varchar(20),
	`status` enum('passed','failed') DEFAULT 'failed',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `etl_data_quality_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_data_quality_rules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`rule_name` varchar(255) NOT NULL,
	`rule_type` enum('not_null','unique','range','format','referenced_integrity','custom') NOT NULL,
	`field_name` varchar(255),
	`validation_config` json,
	`severity` enum('warn','error','block') DEFAULT 'error',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `etl_data_quality_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_execution_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`job_id` bigint unsigned,
	`execution_id` varchar(100),
	`start_time` timestamp,
	`end_time` timestamp,
	`status` enum('running','completed','failed','aborted') DEFAULT 'running',
	`rows_read` int DEFAULT 0,
	`rows_processed` int DEFAULT 0,
	`rows_error` int DEFAULT 0,
	`rows_written` int DEFAULT 0,
	`duration_ms` int,
	`error_message` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `etl_execution_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_job_steps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`job_id` bigint unsigned,
	`step_order` int DEFAULT 0,
	`step_type` enum('extract','transform','load','validate','dedupe','aggregate','join','filter','map') NOT NULL,
	`config` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `etl_job_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_jobs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`job_name` varchar(255) NOT NULL,
	`job_code` varchar(50),
	`description` text,
	`source_connector_id` bigint unsigned,
	`target_connector_id` bigint unsigned,
	`schedule_type` enum('manual','cron','event') DEFAULT 'manual',
	`schedule_expression` varchar(100),
	`batch_size` int DEFAULT 1000,
	`error_handling` enum('skip','abort','retry') DEFAULT 'abort',
	`retry_count` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `etl_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_transformations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`transformation_name` varchar(255) NOT NULL,
	`transformation_type` enum('column_map','datatype_convert','lookup','calculate','conditional','aggregate','sort','dedupe') NOT NULL,
	`source_field` varchar(255),
	`target_field` varchar(255),
	`config` json,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `etl_transformations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`flag_name` varchar(100) NOT NULL,
	`description` text,
	`is_global_default` boolean DEFAULT false,
	`enabled_tenants` json,
	`enabled_plans` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `feature_flags_flag_name_unique` UNIQUE(`flag_name`)
);
--> statement-breakpoint
CREATE TABLE `fee_structures` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`grade` varchar(50),
	`academic_year` varchar(20),
	`tuition_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`admission_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`library_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`sports_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`transport_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`other_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`total_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fee_structures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flights` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`flight_number` varchar(50) NOT NULL,
	`aircraft_registration` varchar(50),
	`aircraft_type` varchar(100),
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`departure_time` timestamp NOT NULL,
	`arrival_time` timestamp NOT NULL,
	`flight_duration` int,
	`total_seats` int DEFAULT 0,
	`booked_seats` int DEFAULT 0,
	`status` enum('scheduled','boarding','departed','in_air','landed','cancelled','delayed','diverted') NOT NULL DEFAULT 'scheduled',
	`delay_reason` text,
	`pilot_id` bigint unsigned,
	`copilot_id` bigint unsigned,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `floor_plans` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`width` int NOT NULL DEFAULT 800,
	`height` int NOT NULL DEFAULT 600,
	`background_image` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `floor_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `folio_charges` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`booking_id` bigint unsigned NOT NULL,
	`charge_type` enum('room','restaurant','minibar','laundry','spa','transport','other') NOT NULL DEFAULT 'other',
	`description` varchar(255) NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`quantity` int DEFAULT 1,
	`total_amount` decimal(18,4) NOT NULL,
	`charge_date` date NOT NULL,
	`posted_to_invoice` boolean DEFAULT false,
	`invoice_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `folio_charges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fuel_cost_analytics` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`vehicle_id` bigint unsigned NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`total_liters` decimal(12,2) NOT NULL DEFAULT '0',
	`total_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`distance_covered` int DEFAULT 0,
	`km_per_liter` decimal(8,2),
	`cost_per_km` decimal(10,4),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fuel_cost_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gift_card_transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`gift_card_id` bigint unsigned NOT NULL,
	`transaction_type` enum('issue','redeem','top_up','refund','expire') NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`balance_before` decimal(18,4) NOT NULL,
	`balance_after` decimal(18,4) NOT NULL,
	`reference_type` varchar(100),
	`reference_id` bigint unsigned,
	`description` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gift_card_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gift_cards` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`card_number` varchar(100) NOT NULL,
	`pin` varchar(10),
	`initial_balance` decimal(18,4) NOT NULL,
	`current_balance` decimal(18,4) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`issuer_customer_id` bigint unsigned,
	`recipient_email` varchar(320),
	`recipient_name` varchar(255),
	`message` text,
	`expires_at` timestamp,
	`status` enum('active','redeemed','expired','cancelled') NOT NULL DEFAULT 'active',
	`issued_by` bigint unsigned,
	`issued_at` timestamp NOT NULL DEFAULT (now()),
	`redeemed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gift_cards_id` PRIMARY KEY(`id`),
	CONSTRAINT `gift_cards_number_unique` UNIQUE(`card_number`)
);
--> statement-breakpoint
CREATE TABLE `gosi_rate_tables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`effective_from` date NOT NULL,
	`effective_to` date,
	`system_type` enum('new','old') NOT NULL DEFAULT 'new',
	`employee_annuities_rate` decimal(5,4) NOT NULL DEFAULT '0.0950',
	`employer_annuities_rate` decimal(5,4) NOT NULL DEFAULT '0.0950',
	`employer_hazards_rate` decimal(5,4) NOT NULL DEFAULT '0.0200',
	`employee_unemployment_rate` decimal(5,4) NOT NULL DEFAULT '0.0075',
	`employer_unemployment_rate` decimal(5,4) NOT NULL DEFAULT '0.0075',
	`contribution_cap` decimal(18,4) NOT NULL DEFAULT '45000.0000',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gosi_rate_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gosi_registrations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`gosi_number` varchar(50),
	`is_subscriber` boolean DEFAULT true,
	`registration_date` date,
	`system_type` enum('new','old') DEFAULT 'new',
	`contribution_cap` decimal(18,4) DEFAULT '45000.0000',
	`last_calculated_at` timestamp,
	`last_contribution` decimal(18,4),
	`needs_update` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gosi_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `gosi_reg_emp_idx` UNIQUE(`tenant_id`,`employee_id`)
);
--> statement-breakpoint
CREATE TABLE `gosi_submission_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`period_month` int NOT NULL,
	`period_year` int NOT NULL,
	`total_employee_share` decimal(18,4) NOT NULL DEFAULT '0',
	`total_employer_share` decimal(18,4) NOT NULL DEFAULT '0',
	`total_contributions` decimal(18,4) NOT NULL DEFAULT '0',
	`employee_count` int NOT NULL DEFAULT 0,
	`submission_date` timestamp,
	`status` enum('draft','submitted','acknowledged','failed') NOT NULL DEFAULT 'draft',
	`reference_number` varchar(100),
	`submission_file` text,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gosi_submission_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gtpl_compliance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`tender_reference` varchar(100),
	`etimad_reference` varchar(100),
	`government_entity` varchar(255),
	`listed_on_etimad` boolean DEFAULT false,
	`saudization_required` boolean DEFAULT true,
	`saudization_percent` decimal(5,2),
	`local_content_percent` decimal(5,2),
	`icv_score` decimal(5,2),
	`compliance_status` enum('compliant','non_compliant','in_progress','not_required') NOT NULL DEFAULT 'in_progress',
	`last_reviewed_date` date,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gtpl_compliance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `heat_stress_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`temperature` decimal(5,2),
	`humidity` decimal(5,2),
	`heat_index` decimal(5,2),
	`work_rest_regime` varchar(100),
	`breaks_provided` boolean,
	`water_available` boolean,
	`shade_available` boolean,
	`incidents_reported` int DEFAULT 0,
	`supervisor_name` varchar(255),
	`status` enum('compliant','non_compliant','partial') NOT NULL DEFAULT 'compliant',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `heat_stress_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotel_bookings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`booking_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned,
	`room_type_id` bigint unsigned NOT NULL,
	`room_id` bigint unsigned,
	`check_in` date NOT NULL,
	`check_out` date NOT NULL,
	`adults` int DEFAULT 1,
	`children` int DEFAULT 0,
	`nightly_rate` decimal(18,4) NOT NULL,
	`total_nights` int NOT NULL,
	`subtotal` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`source` enum('direct','booking.com','expedia','agoda','travel_agency','other') NOT NULL DEFAULT 'direct',
	`channel_booking_id` varchar(255),
	`status` enum('pending','confirmed','checked_in','checked_out','cancelled','no_show') NOT NULL DEFAULT 'pending',
	`special_requests` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hotel_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `housekeeping_schedule` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`room_id` bigint unsigned NOT NULL,
	`assigned_to` bigint unsigned,
	`date` date NOT NULL,
	`task_type` enum('daily_clean','tidy_up','deep_clean','turnover','inspection','repair') NOT NULL DEFAULT 'daily_clean',
	`status` enum('pending','in_progress','completed','skipped','issue_reported') NOT NULL DEFAULT 'pending',
	`notes` text,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `housekeeping_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hse_committees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`committee_name` varchar(255) NOT NULL,
	`formation_date` date,
	`expiry_date` date,
	`members` json,
	`chairperson` varchar(255),
	`meeting_frequency` varchar(100),
	`last_meeting_date` date,
	`next_meeting_date` date,
	`status` enum('active','dissolved') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hse_committees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `impersonation_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`admin_user_id` int NOT NULL,
	`admin_email` varchar(320),
	`tenant_id` bigint unsigned NOT NULL,
	`target_user_id` int,
	`reason` text NOT NULL,
	`approval_ticket` varchar(100),
	`session_token` varchar(255),
	`started_at` timestamp NOT NULL,
	`ended_at` timestamp,
	`duration_seconds` int,
	`actions_log` json,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `impersonation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_claims` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`claim_number` varchar(50) NOT NULL,
	`invoice_id` bigint unsigned,
	`insurance_company_id` bigint unsigned NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`policy_number` varchar(100),
	`member_id` varchar(100),
	`co_pay_amount` decimal(18,4) DEFAULT '0',
	`insured_amount` decimal(18,4) DEFAULT '0',
	`claim_amount` decimal(18,4) DEFAULT '0',
	`status` enum('pending','approved','rejected','paid','partial') NOT NULL DEFAULT 'pending',
	`submitted_at` timestamp,
	`approved_at` timestamp,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insurance_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_claims_healthcare` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`patient_id` bigint unsigned NOT NULL,
	`claim_number` varchar(50) NOT NULL,
	`insurance_provider` varchar(255) NOT NULL,
	`policy_number` varchar(100),
	`claim_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`approved_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','submitted','approved','rejected','paid','partial') NOT NULL DEFAULT 'draft',
	`submission_date` date,
	`approval_date` date,
	`diagnosis` text,
	`treatment` text,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insurance_claims_healthcare_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_companies` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`code` varchar(50),
	`contract_number` varchar(100),
	`discount_percent` decimal(5,2) DEFAULT '0',
	`coverage_percent` decimal(5,2) DEFAULT '100',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insurance_companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intercompany_reconciliations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`intercompany_transaction_id` bigint unsigned NOT NULL,
	`source_company_id` bigint unsigned,
	`target_company_id` bigint unsigned,
	`source_amount` decimal(18,2) DEFAULT '0',
	`target_amount` decimal(18,2) DEFAULT '0',
	`difference` decimal(18,2) DEFAULT '0',
	`reconciled_at` timestamp NOT NULL DEFAULT (now()),
	`reconciled_by` bigint unsigned,
	CONSTRAINT `intercompany_reconciliations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intercompany_transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`transaction_number` varchar(100) NOT NULL,
	`transaction_date` date NOT NULL,
	`source_company_id` bigint unsigned NOT NULL,
	`target_company_id` bigint unsigned NOT NULL,
	`transaction_type` enum('sale','purchase','loan','dividend','expense') NOT NULL,
	`reference_number` varchar(100),
	`total_amount` decimal(18,2) NOT NULL DEFAULT '0',
	`currency` varchar(10) DEFAULT 'SAR',
	`exchange_rate` decimal(18,6) DEFAULT '1.000000',
	`description` text,
	`status` enum('draft','posted','reconciled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intercompany_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_adjustment_reasons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`reason_code` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	`category` enum('damage','loss','theft','breakage','expiry','count_error','return','quality') NOT NULL,
	`requires_approval` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_adjustment_reasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iqama_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`iqama_number` varchar(50) NOT NULL,
	`passport_number` varchar(50),
	`issuance_date` date,
	`expiry_date` date NOT NULL,
	`renewal_date` date,
	`profession` varchar(255),
	`sponsor_name` varchar(255),
	`border_number` varchar(50),
	`status` enum('active','expired','renewed','cancelled') NOT NULL DEFAULT 'active',
	`last_synced_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iqama_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itineraries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`booking_id` bigint unsigned NOT NULL,
	`day` int NOT NULL,
	`date` date,
	`activity` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`start_time` varchar(10),
	`end_time` varchar(10),
	`supplier_id` bigint unsigned,
	`cost` decimal(18,4) NOT NULL DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itineraries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kds_station_products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`station_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kds_station_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `kds_station_products_unique` UNIQUE(`station_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `kds_stations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`station_type` enum('kitchen','bar','grill','salad','pizza','dessert','other') NOT NULL DEFAULT 'kitchen',
	`printer_name` varchar(255),
	`is_active` boolean DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kds_stations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kot_ticket_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`kot_ticket_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`modifiers` json,
	`instructions` text,
	`status` enum('pending','preparing','ready','served','cancelled','held') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kot_ticket_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kot_tickets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`table_order_id` bigint unsigned,
	`restaurant_table_id` bigint unsigned,
	`station_id` bigint unsigned NOT NULL,
	`kot_number` varchar(50) NOT NULL,
	`course` enum('appetizer','main','dessert','drinks','other') NOT NULL DEFAULT 'main',
	`course_sequence` int NOT NULL DEFAULT 0,
	`priority` enum('normal','rush','vip') NOT NULL DEFAULT 'normal',
	`status` enum('pending','preparing','ready','served','cancelled') NOT NULL DEFAULT 'pending',
	`printed` boolean DEFAULT false,
	`print_count` int DEFAULT 0,
	`prepared_by` bigint unsigned,
	`ready_at` timestamp,
	`served_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kot_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`patient_id` bigint unsigned NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`test_name` varchar(255) NOT NULL,
	`ordered_by` bigint unsigned,
	`order_date` date NOT NULL,
	`result_date` date,
	`result` text,
	`status` enum('pending','collected','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lease_contracts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`lease_code` varchar(100) NOT NULL,
	`description` text,
	`lessor_name` varchar(255) NOT NULL,
	`lease_type` enum('operating','finance') NOT NULL,
	`asset_id` bigint unsigned,
	`asset_category` varchar(100),
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`lease_term_months` int NOT NULL,
	`rental_payment_amount` decimal(18,2) NOT NULL DEFAULT '0',
	`payment_frequency` enum('monthly','quarterly','semi_annual','annual') NOT NULL DEFAULT 'monthly',
	`payment_day` int DEFAULT 1,
	`currency` varchar(10) DEFAULT 'SAR',
	`discount_rate` decimal(10,6) NOT NULL DEFAULT '0',
	`incentive_amount` decimal(18,2) DEFAULT '0',
	`initial_direct_costs` decimal(18,2) DEFAULT '0',
	`residual_value_guarantee` decimal(18,2) DEFAULT '0',
	`purchase_option` boolean DEFAULT false,
	`purchase_option_amount` decimal(18,2) DEFAULT '0',
	`renewal_option` boolean DEFAULT false,
	`renewal_term_months` int,
	`termination_option` boolean DEFAULT false,
	`termination_penalty_amount` decimal(18,2) DEFAULT '0',
	`right_of_use_asset` decimal(18,2) DEFAULT '0',
	`lease_liability` decimal(18,2) DEFAULT '0',
	`accumulated_depreciation` decimal(18,2) DEFAULT '0',
	`interest_rate` enum('implicit','incremental') DEFAULT 'incremental',
	`status` enum('active','expired','terminated','amended') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lease_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lease_modifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`contract_id` bigint unsigned NOT NULL,
	`modification_date` date NOT NULL,
	`modification_type` enum('extension','termination','rent_revision','asset_change') NOT NULL,
	`description` text,
	`old_payment_amount` decimal(18,2) DEFAULT '0',
	`new_payment_amount` decimal(18,2) DEFAULT '0',
	`old_discount_rate` decimal(10,6) DEFAULT '0',
	`new_discount_rate` decimal(10,6) DEFAULT '0',
	`old_lease_term` int,
	`new_lease_term` int,
	`gain_loss_amount` decimal(18,2) DEFAULT '0',
	`effective_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lease_modifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lease_payment_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`contract_id` bigint unsigned NOT NULL,
	`payment_date` date NOT NULL,
	`payment_amount` decimal(18,2) NOT NULL DEFAULT '0',
	`principal_portion` decimal(18,2) DEFAULT '0',
	`interest_portion` decimal(18,2) DEFAULT '0',
	`outstanding_balance` decimal(18,2) DEFAULT '0',
	`payment_status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
	`paid_date` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lease_payment_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leases` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`lease_number` varchar(50) NOT NULL,
	`unit_id` bigint unsigned NOT NULL,
	`customer_id` bigint unsigned,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`monthly_rent` decimal(18,4) NOT NULL,
	`security_deposit` decimal(18,4) NOT NULL DEFAULT '0',
	`rent_due_day` int DEFAULT 1,
	`lease_type` enum('residential','commercial','short_term','long_term') NOT NULL DEFAULT 'residential',
	`status` enum('draft','active','expired','terminated','renewed') NOT NULL DEFAULT 'draft',
	`renewal_count` int DEFAULT 0,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_cards` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`program_id` bigint unsigned NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`card_number` varchar(100) NOT NULL,
	`tier` varchar(50) DEFAULT 'standard',
	`total_points` decimal(18,4) DEFAULT '0',
	`lifetime_points` decimal(18,4) DEFAULT '0',
	`lifetime_spend` decimal(18,4) DEFAULT '0',
	`current_balance` decimal(18,4) DEFAULT '0',
	`enrolled_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_cards_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyalty_cards_number_unique` UNIQUE(`card_number`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_programs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`points_per_currency` decimal(10,2) NOT NULL DEFAULT '1',
	`currency_per_point` decimal(10,2) NOT NULL DEFAULT '0.01',
	`point_expiry_days` int DEFAULT 365,
	`min_redeem_points` int DEFAULT 0,
	`max_redeem_percent` decimal(5,2) DEFAULT '100',
	`tier_config` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_programs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`card_id` bigint unsigned NOT NULL,
	`transaction_type` enum('earn','redeem','adjust','expire','transfer') NOT NULL,
	`points` decimal(18,4) NOT NULL,
	`balance_before` decimal(18,4) NOT NULL,
	`balance_after` decimal(18,4) NOT NULL,
	`reference_type` varchar(100),
	`reference_id` bigint unsigned,
	`description` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_airworthiness` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`vehicle_id` bigint unsigned,
	`aircraft_registration` varchar(50),
	`inspection_type` varchar(255) NOT NULL,
	`inspection_date` date NOT NULL,
	`next_due_date` date,
	`airframe_hours` int,
	`engine_hours` int,
	`performed_by` varchar(255),
	`findings` text,
	`corrective_action` text,
	`status` enum('scheduled','in_progress','completed','deferred','aog') NOT NULL DEFAULT 'scheduled',
	`is_airworthy` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_airworthiness_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`unit_id` bigint unsigned NOT NULL,
	`requested_by` bigint unsigned,
	`request_number` varchar(50) NOT NULL,
	`category` varchar(100),
	`description` text NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('reported','assigned','in_progress','resolved','closed','cancelled') NOT NULL DEFAULT 'reported',
	`assigned_to` bigint unsigned,
	`estimated_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`scheduled_date` date,
	`resolved_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `master_production_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`schedule_date` date NOT NULL,
	`planned_quantity` decimal(18,4) NOT NULL,
	`confirmed_quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`available_to_promise` decimal(18,4) NOT NULL DEFAULT '0',
	`demand_source` enum('forecast','sales_order','safety_stock','manual') NOT NULL,
	`status` enum('planned','firmed','closed') NOT NULL DEFAULT 'planned',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `master_production_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_requirements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`wbs_id` bigint unsigned,
	`boq_item_id` bigint unsigned,
	`product_id` bigint unsigned,
	`material_name` varchar(255) NOT NULL,
	`specification` text,
	`required_quantity` decimal(18,4) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`quantity_ordered` decimal(18,4) DEFAULT '0',
	`quantity_received` decimal(18,4) DEFAULT '0',
	`quantity_consumed` decimal(18,4) DEFAULT '0',
	`required_date` date,
	`delivery_date` date,
	`status` enum('planned','ordered','partial','received','consumed') NOT NULL DEFAULT 'planned',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `material_requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mrp_demands` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`demand_type` enum('independent','dependent') NOT NULL,
	`source_type` enum('forecast','sales_order','service','mps') NOT NULL,
	`source_id` varchar(100),
	`product_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`due_date` date NOT NULL,
	`status` enum('open','partially_fulfilled','fulfilled','cancelled') NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mrp_demands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mrp_net_requirements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`gross_requirement` decimal(18,4) NOT NULL DEFAULT '0',
	`scheduled_receipts` decimal(18,4) NOT NULL DEFAULT '0',
	`projected_on_hand` decimal(18,4) NOT NULL DEFAULT '0',
	`net_requirement` decimal(18,4) NOT NULL DEFAULT '0',
	`planned_order_receipt` decimal(18,4) NOT NULL DEFAULT '0',
	`planned_order_release` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mrp_net_requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mrp_planned_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`order_type` enum('purchase','manufacture','transfer') NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`release_date` date,
	`due_date` date NOT NULL,
	`status` enum('planned','released','completed','cancelled') NOT NULL DEFAULT 'planned',
	`parent_plan_id` bigint unsigned,
	`mrp_run_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mrp_planned_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mrp_runs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`run_date` timestamp NOT NULL DEFAULT (now()),
	`horizon_start` date NOT NULL,
	`horizon_end` date NOT NULL,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'running',
	`action_messages` text,
	`execution_time_ms` int,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mrp_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nitaqat_snapshots` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`snapshot_date` date NOT NULL,
	`total_saudis` int NOT NULL DEFAULT 0,
	`total_expats` int NOT NULL DEFAULT 0,
	`saudi_ratio` decimal(5,4) NOT NULL DEFAULT '0',
	`category` enum('platinum','green','yellow','red'),
	`target_ratio` decimal(5,4),
	`forecast_ratio` decimal(5,4),
	`what_if_hire_saudi` int DEFAULT 0,
	`what_if_hire_expat` int DEFAULT 0,
	`what_if_fire_saudi` int DEFAULT 0,
	`what_if_fire_expat` int DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nitaqat_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `non_conformance_reports` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`ncr_number` varchar(100) NOT NULL,
	`inspection_id` bigint unsigned,
	`reference_type` enum('purchase_order','goods_receipt','work_order','production_order','sales_order','other') NOT NULL,
	`reference_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`batch_number` varchar(100),
	`description` text NOT NULL,
	`severity` enum('minor','major','critical') NOT NULL DEFAULT 'minor',
	`status` enum('open','under_review','resolved','closed') NOT NULL DEFAULT 'open',
	`root_cause` text,
	`resolution` text,
	`resolved_by` bigint unsigned,
	`resolved_at` timestamp,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `non_conformance_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offline_operations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`device_id` varchar(100),
	`operation_type` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(100),
	`payload` json,
	`status` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`local_created_at` timestamp,
	`synced_at` timestamp,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `offline_operations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_courses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`table_order_id` bigint unsigned NOT NULL,
	`course` enum('appetizer','main','dessert','drinks','other') NOT NULL DEFAULT 'main',
	`sequence` int NOT NULL DEFAULT 0,
	`timing_minutes` int NOT NULL DEFAULT 0,
	`status` enum('pending','preparing','ready','served','cancelled') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_item_modifiers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_item_id` bigint unsigned,
	`product_id` bigint unsigned NOT NULL,
	`modifier_group` varchar(100) NOT NULL,
	`modifier_name` varchar(255) NOT NULL,
	`modifier_name_ar` varchar(255),
	`price_adjustment` decimal(18,4) DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_item_modifiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parts_inventory_serial` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`part_number` varchar(100) NOT NULL,
	`part_name` varchar(255) NOT NULL,
	`serial_number` varchar(100) NOT NULL,
	`manufacturer` varchar(255),
	`quantity` int DEFAULT 1,
	`condition` enum('new','serviceable','overhauled','unserviceable','scrap') NOT NULL DEFAULT 'new',
	`location` varchar(255),
	`shelf_life` date,
	`installation_date` date,
	`installed_on_aircraft` varchar(50),
	`removal_date` date,
	`tsn` int DEFAULT 0,
	`csi` int DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parts_inventory_serial_id` PRIMARY KEY(`id`),
	CONSTRAINT `parts_inventory_serial_serial_number_unique` UNIQUE(`serial_number`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`patient_number` varchar(50) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`date_of_birth` date,
	`gender` enum('male','female','other'),
	`email` varchar(320),
	`phone` varchar(50),
	`mobile` varchar(50),
	`address` text,
	`blood_group` varchar(10),
	`allergies` text,
	`medical_history` text,
	`emergency_contact_name` varchar(255),
	`emergency_contact_phone` varchar(50),
	`national_id` varchar(100),
	`insurance_provider` varchar(255),
	`insurance_policy_number` varchar(100),
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_splits` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned NOT NULL,
	`payment_method` enum('cash','card','transfer','cheque','wallet','loyalty','gift_card','credit','multiple') NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`reference` varchar(255),
	`emv_transaction_id` bigint unsigned,
	`gift_card_id` bigint unsigned,
	`loyalty_points_used` decimal(18,4),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_splits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`invoice_id` int,
	`transaction_id` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'SAR',
	`gateway` varchar(50) NOT NULL,
	`gateway_transaction_id` varchar(255),
	`gateway_response` json,
	`status` enum('pending','processing','completed','failed','refunded') DEFAULT 'pending',
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_transactions_transaction_id_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `pdpl_data_subject_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`request_type` enum('access','rectification','erasure','restrict','portability','objection','withdraw_consent') NOT NULL,
	`request_details` text,
	`status` enum('pending','in_progress','completed','rejected') NOT NULL DEFAULT 'pending',
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`response_summary` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pdpl_data_subject_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pegging_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`demand_id` bigint unsigned NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`mrp_run_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pegging_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_obligations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned,
	`obligation_name` varchar(255) NOT NULL,
	`description` text,
	`obligation_type` enum('good','service','software','support','construction') NOT NULL,
	`performance_timing` enum('point_in_time','over_time') NOT NULL,
	`transaction_price` decimal(18,2) DEFAULT '0',
	`standalone_price` decimal(18,2) DEFAULT '0',
	`allocated_amount` decimal(18,2) DEFAULT '0',
	`recognition_method` enum('output','input','straight_line') DEFAULT 'straight_line',
	`start_date` date,
	`end_date` date,
	`completion_percent` decimal(8,4) DEFAULT '0',
	`status` enum('identified','satisfied','partially_satisfied','cancelled') NOT NULL DEFAULT 'identified',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_obligations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pharmacy_integration` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`patient_id` bigint unsigned NOT NULL,
	`appointment_id` bigint unsigned,
	`prescription_number` varchar(50) NOT NULL,
	`medication_name` varchar(255) NOT NULL,
	`dosage` varchar(100),
	`frequency` varchar(100),
	`duration_days` int,
	`quantity` int NOT NULL,
	`refills` int DEFAULT 0,
	`status` enum('prescribed','dispensed','partial','cancelled') NOT NULL DEFAULT 'prescribed',
	`prescribed_by` bigint unsigned,
	`dispensed_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pharmacy_integration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `picking_rules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`rule_name` varchar(255) NOT NULL,
	`priority` int NOT NULL DEFAULT 0,
	`strategy` enum('fifo','fefo','lifo','zone','batch','wave') NOT NULL,
	`wave_size` int,
	`is_default` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `picking_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `picking_tasks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`task_number` varchar(50) NOT NULL,
	`source_type` enum('sales_order','transfer_out','manufacturing_issue') NOT NULL,
	`source_id` bigint unsigned,
	`product_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`from_location_id` bigint unsigned,
	`to_location_id` bigint unsigned,
	`assigned_to` bigint unsigned,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `picking_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pos_shifts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`session_id` bigint unsigned,
	`shift_number` varchar(50) NOT NULL,
	`opening_balance` decimal(18,4) NOT NULL DEFAULT '0',
	`closing_expected` decimal(18,4) DEFAULT '0',
	`closing_actual` decimal(18,4) DEFAULT '0',
	`cash_sales` decimal(18,4) DEFAULT '0',
	`card_sales` decimal(18,4) DEFAULT '0',
	`transfer_sales` decimal(18,4) DEFAULT '0',
	`total_sales` decimal(18,4) DEFAULT '0',
	`cash_in` decimal(18,4) DEFAULT '0',
	`cash_out` decimal(18,4) DEFAULT '0',
	`difference` decimal(18,4) DEFAULT '0',
	`status` enum('open','closed','paused') NOT NULL DEFAULT 'open',
	`opened_at` timestamp NOT NULL DEFAULT (now()),
	`closed_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pos_shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ppe_issuance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned,
	`ppe_type` enum('helmet','vest','gloves','goggles','harness','earplug','mask','boots','full_body') NOT NULL,
	`quantity` int,
	`issue_date` date,
	`expiry_date` date,
	`issued_by` varchar(255),
	`condition_` varchar(100),
	`returned` boolean DEFAULT false,
	`return_date` date,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ppe_issuance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescription_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`prescription_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`dosage` varchar(255),
	`frequency` varchar(255),
	`duration_days` int,
	`quantity_prescribed` int NOT NULL,
	`quantity_dispensed` int NOT NULL DEFAULT 0,
	`instructions` text,
	`is_controlled` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prescription_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`prescription_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned,
	`doctor_name` varchar(255),
	`doctor_license` varchar(100),
	`clinic_name` varchar(255),
	`diagnosis` text,
	`date_issued` date NOT NULL,
	`date_expires` date,
	`is_controlled_substance` boolean DEFAULT false,
	`controlled_substance_license` varchar(100),
	`status` enum('active','dispensed','partial','expired','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_tier_breaks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`price_tier_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`category_id` bigint unsigned,
	`min_quantity` int NOT NULL DEFAULT 1,
	`max_quantity` int,
	`unit_price` decimal(18,4) NOT NULL,
	`discount_percent` decimal(5,2) DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_tier_breaks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_tiers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`tier_type` enum('quantity_break','customer_group','trade_discount') NOT NULL DEFAULT 'quantity_break',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_billing` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`milestone_name` varchar(255),
	`billing_period` varchar(50),
	`percentage_complete` decimal(5,2) NOT NULL DEFAULT '0',
	`billed_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`retention_percent` decimal(5,2) NOT NULL DEFAULT '10',
	`retention_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`due_date` date,
	`status` enum('draft','submitted','approved','paid','partial','disputed') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_billing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`property_code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`property_type` enum('residential','commercial','industrial','land','mixed_use') NOT NULL DEFAULT 'residential',
	`address` text,
	`city` varchar(100),
	`district` varchar(100),
	`area_size` decimal(12,2),
	`area_unit` varchar(20) DEFAULT 'sqm',
	`purchase_date` date,
	`purchase_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`current_value` decimal(18,4) NOT NULL DEFAULT '0',
	`property_tax` decimal(18,4) NOT NULL DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_units` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`property_id` bigint unsigned NOT NULL,
	`unit_number` varchar(50) NOT NULL,
	`floor` varchar(50),
	`bedrooms` int DEFAULT 0,
	`bathrooms` int DEFAULT 0,
	`area_size` decimal(12,2),
	`monthly_rent` decimal(18,4) NOT NULL DEFAULT '0',
	`security_deposit` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('vacant','occupied','maintenance','reserved') NOT NULL DEFAULT 'vacant',
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `putaway_rules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`rule_name` varchar(255) NOT NULL,
	`priority` int NOT NULL DEFAULT 0,
	`product_id` bigint unsigned,
	`product_category_id` bigint unsigned,
	`warehouse_id` bigint unsigned NOT NULL,
	`zone_id` bigint unsigned,
	`strategy` enum('fixed','first_empty','near_expiry','fifo','random','last_location') NOT NULL,
	`is_default` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `putaway_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `putaway_tasks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`task_number` varchar(50) NOT NULL,
	`source_type` enum('purchase','return','transfer_in','manufacturing') NOT NULL,
	`source_id` bigint unsigned,
	`product_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`from_location_id` bigint unsigned,
	`to_location_id` bigint unsigned,
	`assigned_to` bigint unsigned,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `putaway_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qiwa_comparison_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned,
	`comparison_type` enum('salary','allowance','contract','all') NOT NULL,
	`expected_value` text,
	`actual_value` text,
	`difference` varchar(255),
	`is_matched` boolean DEFAULT true,
	`checked_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qiwa_comparison_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qiwa_contracts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`qiwa_contract_id` varchar(100),
	`contract_type` enum('full_time','part_time','temporary','probation') DEFAULT 'full_time',
	`basic_salary` decimal(18,4) DEFAULT '0',
	`housing_allowance` decimal(18,4) DEFAULT '0',
	`transport_allowance` decimal(18,4) DEFAULT '0',
	`other_allowances` decimal(18,4) DEFAULT '0',
	`total_salary` decimal(18,4) DEFAULT '0',
	`start_date` date,
	`end_date` date,
	`last_synced_at` timestamp,
	`is_matched` boolean DEFAULT true,
	`mismatch_details` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qiwa_contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `qiwa_contract_emp_idx` UNIQUE(`tenant_id`,`employee_id`)
);
--> statement-breakpoint
CREATE TABLE `qr_order_sessions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`restaurant_table_id` bigint unsigned,
	`session_token` varchar(255) NOT NULL,
	`device_id` varchar(255),
	`status` enum('active','ordered','paid','expired','cancelled') NOT NULL DEFAULT 'active',
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qr_order_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `qr_order_sessions_session_token_unique` UNIQUE(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `quality_blocked_stocks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`batch_number` varchar(100),
	`quantity` decimal(18,4) NOT NULL,
	`reason` enum('qc_fail','ncr_open','capa_pending','quarantine','hold') NOT NULL,
	`inspection_id` bigint unsigned,
	`ncr_id` bigint unsigned,
	`is_released` boolean DEFAULT false,
	`released_by` bigint unsigned,
	`released_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quality_blocked_stocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_inspection_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`inspection_id` bigint unsigned NOT NULL,
	`template_line_id` bigint unsigned NOT NULL,
	`result_value` varchar(255),
	`result_status` enum('pass','fail','na') NOT NULL DEFAULT 'na',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quality_inspection_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_inspection_template_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`template_id` bigint unsigned NOT NULL,
	`checkpoint_name` varchar(255) NOT NULL,
	`checkpoint_type` enum('visual','dimensional','functional','chemical','microbiological','other') NOT NULL DEFAULT 'visual',
	`specification_min` decimal(18,4),
	`specification_max` decimal(18,4),
	`specification_text` text,
	`is_critical` boolean DEFAULT false,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quality_inspection_template_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_inspection_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`applies_to` enum('incoming_material','in_process','final','outgoing') NOT NULL DEFAULT 'incoming_material',
	`is_active` boolean DEFAULT true,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quality_inspection_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_inspections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`template_id` bigint unsigned NOT NULL,
	`reference_type` enum('purchase_order','goods_receipt','work_order','production_order','sales_order','other') NOT NULL,
	`reference_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`batch_number` varchar(100),
	`inspection_date` date NOT NULL,
	`inspected_by` bigint unsigned,
	`overall_result` enum('pass','fail','rework','pending') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quality_inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rent_invoices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`lease_id` bigint unsigned NOT NULL,
	`unit_id` bigint unsigned NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`rent_amount` decimal(18,4) NOT NULL,
	`late_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL,
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`due_date` date NOT NULL,
	`paid_date` date,
	`status` enum('pending','paid','partial','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rent_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_cards` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`student_id` bigint unsigned NOT NULL,
	`academic_year` varchar(20) NOT NULL,
	`term` varchar(50) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`score` decimal(8,2),
	`grade` varchar(10),
	`remarks` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`report_template_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`frequency` varchar(50) NOT NULL,
	`cron_expression` varchar(100),
	`day_of_week` int,
	`day_of_month` int,
	`time_of_day` varchar(10) DEFAULT '08:00',
	`format` varchar(50) DEFAULT 'pdf',
	`recipient_emails` json,
	`last_sent_at` timestamp,
	`next_run_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`module` varchar(100),
	`columns_config` json,
	`filters_config` json,
	`sort_config` json,
	`group_config` json,
	`aggregations` json,
	`chart_config` json,
	`is_favorite` boolean DEFAULT false,
	`is_public` boolean DEFAULT false,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reseller_payouts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reseller_id` int NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`total_revenue` decimal(10,2),
	`total_commission` decimal(10,2),
	`status` enum('pending','processing','paid','cancelled') DEFAULT 'pending',
	`paid_at` timestamp,
	`payment_method` varchar(50),
	`payment_reference` varchar(255),
	`notes` text,
	`details` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reseller_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reseller_tenants` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reseller_id` int NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`monthly_fee` decimal(10,2),
	`commission_amount` decimal(10,2),
	`started_at` timestamp,
	`ended_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reseller_tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_reseller_tenant` UNIQUE(`reseller_id`,`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `resellers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`company_name` varchar(255),
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`commission_rate` decimal(5,2) DEFAULT '10.00',
	`white_label_enabled` boolean DEFAULT false,
	`custom_domain` varchar(255),
	`logo_url` text,
	`favicon_url` text,
	`primary_color` varchar(20),
	`secondary_color` varchar(20),
	`status` enum('active','suspended','inactive') DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resellers_id` PRIMARY KEY(`id`),
	CONSTRAINT `resellers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_tables` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`floor_plan_id` bigint unsigned NOT NULL,
	`table_number` varchar(20) NOT NULL,
	`name` varchar(255),
	`name_ar` varchar(255),
	`capacity` int NOT NULL DEFAULT 4,
	`shape` enum('rectangle','circle','square') NOT NULL DEFAULT 'rectangle',
	`pos_x` int NOT NULL DEFAULT 0,
	`pos_y` int NOT NULL DEFAULT 0,
	`width` int NOT NULL DEFAULT 80,
	`height` int NOT NULL DEFAULT 60,
	`rotation` int NOT NULL DEFAULT 0,
	`status` enum('vacant','occupied','ordered','served','paid','reserved','cleaning') NOT NULL DEFAULT 'vacant',
	`waiter_id` bigint unsigned,
	`current_order_id` bigint unsigned,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurant_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retention_accounts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`subcontractor_id` bigint unsigned,
	`total_retention` decimal(18,4) NOT NULL DEFAULT '0',
	`released_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`remaining_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`expected_release_date` date,
	`status` enum('held','partial_release','released') NOT NULL DEFAULT 'held',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `retention_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenue_recognition_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned,
	`obligation_id` bigint unsigned,
	`scheduled_date` date NOT NULL,
	`recognized_amount` decimal(18,2) DEFAULT '0',
	`cumulative_amount` decimal(18,2) DEFAULT '0',
	`recognition_method` enum('output','input','straight_line') DEFAULT 'straight_line',
	`status` enum('scheduled','recognized','skipped') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revenue_recognition_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rfq_headers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`rfq_number` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`deadline_date` date NOT NULL,
	`expected_delivery_date` date,
	`buyer_id` bigint unsigned,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`status` enum('draft','sent','received','evaluated','closed','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rfq_headers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rfq_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`rfq_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`product_name` varchar(255) NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`unit` varchar(50),
	`target_price` decimal(18,4),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rfq_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rfq_quote_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`quote_id` bigint unsigned NOT NULL,
	`rfq_item_id` bigint unsigned NOT NULL,
	`unit_price` decimal(18,4) NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`total_price` decimal(18,4) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`delivery_date` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rfq_quote_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rfq_supplier_quotes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`rfq_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`submitted_date` timestamp NOT NULL DEFAULT (now()),
	`valid_until` date,
	`delivery_date` date,
	`payment_terms` varchar(255),
	`notes` text,
	`status` enum('draft','submitted','withdrawn') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rfq_supplier_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `right_of_use_assets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`contract_id` bigint unsigned NOT NULL,
	`asset_code` varchar(100),
	`asset_name` varchar(255) NOT NULL,
	`category` varchar(100),
	`cost` decimal(18,2) DEFAULT '0',
	`accumulated_depreciation` decimal(18,2) DEFAULT '0',
	`depreciation_method` enum('straight_line','declining') DEFAULT 'straight_line',
	`useful_life_months` int,
	`depreciation_start_date` date,
	`net_book_value` decimal(18,2) DEFAULT '0',
	`impairment_loss` decimal(18,2) DEFAULT '0',
	`status` enum('active','fully_depreciated','disposed') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `right_of_use_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `room_inventory` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`room_type_id` bigint unsigned NOT NULL,
	`room_number` varchar(50) NOT NULL,
	`floor` varchar(50),
	`status` enum('available','occupied','maintenance','reserved','cleaning') NOT NULL DEFAULT 'available',
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `room_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `room_types` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`description` text,
	`base_price` decimal(18,4) NOT NULL,
	`max_occupancy` int DEFAULT 2,
	`number_of_rooms` int DEFAULT 1,
	`amenities` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `room_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rough_cut_capacity_plans` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`resource_id` bigint unsigned NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`available_capacity` decimal(18,4) NOT NULL DEFAULT '0',
	`required_capacity` decimal(18,4) NOT NULL DEFAULT '0',
	`overload_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`status` enum('draft','confirmed','adjusted') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rough_cut_capacity_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `route_planning` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`route_id` bigint unsigned NOT NULL,
	`vehicle_id` bigint unsigned NOT NULL,
	`driver_id` bigint unsigned,
	`planned_date` date NOT NULL,
	`departure_time` varchar(10),
	`arrival_time` varchar(10),
	`status` enum('planned','in_transit','completed','cancelled') NOT NULL DEFAULT 'planned',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `route_planning_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`route_code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`distance_km` decimal(10,2),
	`estimated_duration` varchar(50),
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `safety_training` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned,
	`training_name` varchar(255) NOT NULL,
	`training_provider` varchar(255),
	`training_date` date,
	`expiry_date` date,
	`certificate_number` varchar(100),
	`certificate_file` varchar(255),
	`training_type` enum('induction','specialized','refresher','emergency'),
	`status` enum('completed','expired','pending') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `safety_training_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sbc_compliance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`sbc_code` varchar(50) NOT NULL,
	`description` text,
	`compliance_required` boolean DEFAULT true,
	`compliance_status` enum('compliant','non_compliant','not_applicable','pending_review') NOT NULL DEFAULT 'pending_review',
	`inspector_name` varchar(255),
	`inspection_date` date,
	`certificate_number` varchar(100),
	`certificate_expiry_date` date,
	`non_compliance_notes` text,
	`corrective_actions` text,
	`corrective_action_date` date,
	`status` enum('active','expired') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sbc_compliance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sca_classification` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`entity_name` varchar(255) NOT NULL,
	`entity_type` enum('contractor','consultant','supplier') NOT NULL,
	`sca_registration_number` varchar(100),
	`classification_grade` enum('first','second','third','fourth','fifth'),
	`specialization` varchar(255),
	`max_project_value` decimal(18,4),
	`expiry_date` date,
	`status` enum('active','suspended','expired') NOT NULL DEFAULT 'active',
	`verification_status` enum('unverified','verified','rejected') NOT NULL DEFAULT 'unverified',
	`verified_at` timestamp,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sca_classification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sfda_serial_numbers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`batch_number` varchar(100),
	`serial_number` varchar(255) NOT NULL,
	`expiry_date` date,
	`status` enum('available','sold','returned','expired','destroyed') NOT NULL DEFAULT 'available',
	`sold_at` timestamp,
	`invoice_item_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sfda_serial_numbers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sfda_serial_numbers_unique` UNIQUE(`serial_number`)
);
--> statement-breakpoint
CREATE TABLE `shipment_tracking` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`tracking_number` varchar(100) NOT NULL,
	`customer_id` bigint unsigned,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`weight` decimal(10,2),
	`volume` decimal(10,2),
	`vehicle_id` bigint unsigned,
	`driver_id` bigint unsigned,
	`route_id` bigint unsigned,
	`dispatched_at` timestamp,
	`estimated_delivery` timestamp,
	`delivered_at` timestamp,
	`status` enum('pending','picked_up','in_transit','delivered','exception','cancelled') NOT NULL DEFAULT 'pending',
	`last_location` varchar(255),
	`current_latitude` decimal(10,7),
	`current_longitude` decimal(10,7),
	`temperature` decimal(5,2),
	`signature` text,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipment_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_daily_reports` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`report_date` date NOT NULL,
	`report_number` varchar(50) NOT NULL,
	`weather_condition` varchar(100),
	`temperature` decimal(5,2),
	`work_description` text,
	`labor_count` int,
	`supervisor_name` varchar(255),
	`equipment_used` text,
	`materials_received` text,
	`materials_used` text,
	`work_completed` text,
	`work_in_progress` text,
	`issues_encountered` text,
	`safety_incidents` text,
	`visitors` text,
	`photos` json,
	`status` enum('draft','submitted','approved') NOT NULL DEFAULT 'draft',
	`submitted_by` bigint unsigned,
	`approved_by` bigint unsigned,
	`approved_at` timestamp,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_daily_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storage_bins` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`location_id` bigint unsigned NOT NULL,
	`bin_code` varchar(50),
	`product_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL DEFAULT '0',
	`lot_number` varchar(100),
	`serial_number` varchar(100),
	`expiry_date` date,
	`putaway_date` date,
	`status` enum('available','allocated','picked','blocked') NOT NULL DEFAULT 'available',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storage_bins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storage_locations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`zone_id` bigint unsigned,
	`location_code` varchar(50) NOT NULL,
	`location_type` enum('rack','floor','bulk','shelf','bin','drawer') NOT NULL,
	`aisle` varchar(50),
	`rack` varchar(50),
	`shelf` varchar(50),
	`bin` varchar(50),
	`capacity` decimal(18,4) NOT NULL DEFAULT '0',
	`used_capacity` decimal(18,4) NOT NULL DEFAULT '0',
	`weight_capacity` decimal(10,2),
	`height_cm` decimal(10,2),
	`length_cm` decimal(10,2),
	`width_cm` decimal(10,2),
	`is_reserved` boolean DEFAULT false,
	`is_blocked` boolean DEFAULT false,
	`status` enum('available','occupied','blocked','reserved') NOT NULL DEFAULT 'available',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storage_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_attendance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`student_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`status` enum('present','absent','late','excused','holiday') NOT NULL DEFAULT 'present',
	`remarks` text,
	`marked_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_fee_invoices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`student_id` bigint unsigned NOT NULL,
	`fee_structure_id` bigint unsigned,
	`invoice_number` varchar(50) NOT NULL,
	`term` varchar(50),
	`amount` decimal(18,4) NOT NULL,
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`due_date` date,
	`status` enum('pending','partial','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_fee_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`student_number` varchar(50) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`date_of_birth` date,
	`gender` enum('male','female'),
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`guardian_name` varchar(255),
	`guardian_phone` varchar(50),
	`guardian_email` varchar(320),
	`grade` varchar(50),
	`section` varchar(50),
	`academic_year` varchar(20),
	`enrollment_date` date,
	`status` enum('active','transferred','graduated','expelled','withdrawn') NOT NULL DEFAULT 'active',
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subcontractor_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`subcontractor_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`payment_number` varchar(50) NOT NULL,
	`payment_date` date,
	`invoice_reference` varchar(100),
	`gross_amount` decimal(18,4) NOT NULL,
	`retention_deducted` decimal(18,4),
	`advance_recovery` decimal(18,4),
	`penalties` decimal(18,4) DEFAULT '0',
	`other_deductions` decimal(18,4) DEFAULT '0',
	`net_amount` decimal(18,4) NOT NULL,
	`paid_amount` decimal(18,4) DEFAULT '0',
	`payment_method` enum('bank_transfer','cheque','cash'),
	`bank_reference` varchar(100),
	`status` enum('pending','approved','paid','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subcontractor_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subcontractor_projects` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`subcontractor_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`scope` text,
	`contract_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`start_date` date,
	`end_date` date,
	`status` enum('pending','active','completed','terminated') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subcontractor_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subcontractors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`contact_person` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`trade` varchar(255),
	`license_number` varchar(100),
	`contract_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`retention_percent` decimal(5,2) NOT NULL DEFAULT '10',
	`retention_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subcontractors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_plans` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL DEFAULT '0',
	`billing_cycle` enum('monthly','yearly','one_time') DEFAULT 'monthly',
	`max_users` int DEFAULT 5,
	`max_branches` int DEFAULT 1,
	`max_invoices_per_month` int DEFAULT 100,
	`max_devices` int DEFAULT 2,
	`max_storage_gb` int DEFAULT 5,
	`modules_included` json,
	`features` json,
	`is_active` boolean DEFAULT true,
	`is_public` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_contracts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`contract_number` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date,
	`terms` text,
	`value` decimal(18,4) NOT NULL DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`status` enum('draft','active','expired','terminated','renewed') NOT NULL DEFAULT 'draft',
	`renewal_reminder_days` int DEFAULT 30,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_evaluations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`evaluation_date` date NOT NULL,
	`evaluator_id` bigint unsigned,
	`quality_score` decimal(5,2) NOT NULL DEFAULT '0',
	`delivery_score` decimal(5,2) NOT NULL DEFAULT '0',
	`price_score` decimal(5,2) NOT NULL DEFAULT '0',
	`service_score` decimal(5,2) NOT NULL DEFAULT '0',
	`overall_score` decimal(5,2) NOT NULL DEFAULT '0',
	`category` enum('excellent','good','average','poor') NOT NULL DEFAULT 'average',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_performance_metrics` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`on_time_delivery_rate` decimal(5,2) NOT NULL DEFAULT '0',
	`quality_acceptance_rate` decimal(5,2) NOT NULL DEFAULT '0',
	`fill_rate` decimal(5,2) NOT NULL DEFAULT '0',
	`lead_time_days` decimal(5,2) NOT NULL DEFAULT '0',
	`return_rate` decimal(5,2) NOT NULL DEFAULT '0',
	`price_competitiveness` decimal(5,2) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_portal_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`is_active` boolean DEFAULT true,
	`last_login` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_portal_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_reconciliation` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`reconciliation_number` varchar(50) NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`total_bookings` int DEFAULT 0,
	`gross_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`commission_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`net_payable` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`balance_due` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','confirmed','paid','disputed') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_reconciliation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_rfq_responses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`rfq_id` bigint unsigned NOT NULL,
	`responded_at` timestamp NOT NULL DEFAULT (now()),
	`response_type` enum('quoted','declined','no_bid') NOT NULL,
	`notes` text,
	CONSTRAINT `supplier_rfq_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`device_id` varchar(100),
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(100),
	`action` enum('create','update','delete') NOT NULL,
	`payload` json,
	`version` int DEFAULT 1,
	`local_uuid` varchar(255),
	`status` enum('pending','synced','failed','conflict') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`retry_count` int DEFAULT 0,
	`synced_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sync_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_stats` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`device_id` varchar(100),
	`total_pushes` int NOT NULL DEFAULT 0,
	`total_pulls` int NOT NULL DEFAULT 0,
	`successful_pushes` int NOT NULL DEFAULT 0,
	`failed_pushes` int NOT NULL DEFAULT 0,
	`successful_pulls` int NOT NULL DEFAULT 0,
	`failed_pulls` int NOT NULL DEFAULT 0,
	`conflicts_resolved` int NOT NULL DEFAULT 0,
	`avg_sync_duration_ms` int NOT NULL DEFAULT 0,
	`last_sync_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sync_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`key` varchar(150) NOT NULL,
	`value` text,
	`category` varchar(100) DEFAULT 'platform',
	`is_secret` boolean DEFAULT false,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_key_unique` UNIQUE(`key`),
	CONSTRAINT `system_settings_key_idx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `table_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`restaurant_table_id` bigint unsigned NOT NULL,
	`waiter_id` bigint unsigned,
	`customer_id` bigint unsigned,
	`guest_count` int NOT NULL DEFAULT 1,
	`order_number` varchar(50) NOT NULL,
	`status` enum('open','in_progress','served','partial','completed','cancelled','transferred') NOT NULL DEFAULT 'open',
	`order_type` enum('dine_in','takeaway','delivery') NOT NULL DEFAULT 'dine_in',
	`split_from_id` bigint unsigned,
	`transferred_to_table_id` bigint unsigned,
	`service_charge_percent` decimal(5,2) DEFAULT '0',
	`service_charge_amount` decimal(18,4) DEFAULT '0',
	`subtotal` decimal(18,4) DEFAULT '0',
	`discount_amount` decimal(18,4) DEFAULT '0',
	`tax_amount` decimal(18,4) DEFAULT '0',
	`total_amount` decimal(18,4) DEFAULT '0',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `table_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_invoices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`subscription_id` bigint unsigned,
	`invoice_number` varchar(50) NOT NULL,
	`invoice_date` date NOT NULL,
	`due_date` date NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`tax_amount` decimal(10,2) DEFAULT '0',
	`discount_amount` decimal(10,2) DEFAULT '0',
	`total_amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'SAR',
	`status` enum('draft','issued','paid','overdue','cancelled','refunded') DEFAULT 'draft',
	`paid_at` timestamp,
	`payment_method` varchar(50),
	`payment_reference` varchar(255),
	`notes` text,
	`line_items` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `tenant_limits_override` (
	`tenant_id` bigint unsigned NOT NULL,
	`max_users` int,
	`max_branches` int,
	`max_invoices_per_month` int,
	`max_devices` int,
	`max_storage_gb` int,
	`override_reason` text,
	`override_by` int,
	`override_at` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_limits_override_tenant_id` PRIMARY KEY(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_module_controls` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`module_key` varchar(100) NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT true,
	`source` enum('plan','override','trial','support') NOT NULL DEFAULT 'plan',
	`limit_json` json,
	`notes` text,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_module_controls_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_module_controls_unique_idx` UNIQUE(`tenant_id`,`module_key`)
);
--> statement-breakpoint
CREATE TABLE `tenant_modules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`module_name` varchar(50) NOT NULL,
	`is_enabled` boolean DEFAULT true,
	`enabled_at` timestamp,
	`disabled_at` timestamp,
	`enabled_by` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_tenant_module` UNIQUE(`tenant_id`,`module_name`)
);
--> statement-breakpoint
CREATE TABLE `tenant_service_events` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`event_type` enum('module_toggle','limit_update','billing_update','backup_request','restore_request','support_action','white_label_update') NOT NULL,
	`status` enum('pending','approved','running','done','failed','cancelled') NOT NULL DEFAULT 'pending',
	`title` varchar(255) NOT NULL,
	`metadata` json,
	`requested_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_service_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_usage` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`user_count` int DEFAULT 0,
	`active_user_count` int DEFAULT 0,
	`branch_count` int DEFAULT 0,
	`invoice_count` int DEFAULT 0,
	`device_count` int DEFAULT 0,
	`storage_mb` bigint DEFAULT 0,
	`api_calls` int DEFAULT 0,
	`snapshot_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_tenant_period` UNIQUE(`tenant_id`,`period_start`,`period_end`)
);
--> statement-breakpoint
CREATE TABLE `travel_bookings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`booking_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`booking_type` enum('flight','hotel','package','car_rental','insurance','visa') NOT NULL,
	`supplier_id` bigint unsigned,
	`booking_date` date NOT NULL,
	`start_date` date,
	`end_date` date,
	`gross_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`commission_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`net_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`source` enum('direct','online','partner','corporate') NOT NULL DEFAULT 'direct',
	`status` enum('pending','confirmed','cancelled','refunded','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `travel_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `travel_suppliers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`supplier_type` enum('airline','hotel','car_rental','insurance','tour_operator','visa','other') NOT NULL,
	`contact_person` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`commission_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`payment_terms` varchar(255),
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `travel_suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `variation_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`contract_id` bigint unsigned,
	`vo_number` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`reason` enum('change_in_scope','design_change','omission','additional_work','regulatory','other') NOT NULL,
	`change_type` enum('addition','deduction','omission') NOT NULL,
	`status` enum('draft','submitted','approved','rejected','implemented') NOT NULL DEFAULT 'draft',
	`original_value` decimal(18,4) NOT NULL DEFAULT '0',
	`change_value` decimal(18,4) NOT NULL DEFAULT '0',
	`revised_value` decimal(18,4) NOT NULL DEFAULT '0',
	`impact_on_time` int,
	`impact_on_cost` decimal(18,4),
	`approved_by` varchar(255),
	`approved_date` date,
	`submitted_by` bigint unsigned,
	`approved_by_user_id` bigint unsigned,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `variation_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouse_zones` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`zone_code` varchar(50) NOT NULL,
	`zone_name` varchar(255) NOT NULL,
	`zone_type` enum('storage','picking','putaway','shipping','receiving','quarantine') NOT NULL,
	`capacity` decimal(18,4) NOT NULL DEFAULT '0',
	`used_capacity` decimal(18,4) NOT NULL DEFAULT '0',
	`color_code` varchar(20),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouse_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wave_picking` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`wave_number` varchar(50) NOT NULL,
	`wave_type` enum('single_order','multi_order','zone') NOT NULL,
	`order_ids` json,
	`total_items` int DEFAULT 0,
	`status` enum('created','released','picking','completed') NOT NULL DEFAULT 'created',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `wave_picking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wbs_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`parent_id` bigint unsigned,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`level` int NOT NULL,
	`description` text,
	`planned_start_date` date,
	`planned_end_date` date,
	`actual_start_date` date,
	`actual_end_date` date,
	`planned_cost` decimal(18,4),
	`actual_cost` decimal(18,4),
	`progress_percent` int DEFAULT 0,
	`weight_percent` decimal(5,2) DEFAULT '0',
	`status` enum('planned','in_progress','completed','delayed','cancelled') NOT NULL DEFAULT 'planned',
	`responsible_person_id` bigint unsigned,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wbs_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_delivery_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`subscription_id` bigint unsigned,
	`event_type` varchar(100),
	`payload` json,
	`status` enum('delivered','failed','retrying') NOT NULL,
	`http_status` int,
	`response_body` text,
	`attempt_number` int DEFAULT 1,
	`duration_ms` int,
	`delivered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_delivery_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_event_queue` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`payload` json,
	`source_entity_type` varchar(100),
	`source_entity_id` bigint unsigned,
	`priority` int DEFAULT 5,
	`status` enum('pending','delivered','failed') DEFAULT 'pending',
	`retry_count` int DEFAULT 0,
	`max_retries` int DEFAULT 5,
	`next_retry_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_event_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_subscriptions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`secret` varchar(512),
	`event_types` json NOT NULL,
	`format` enum('json','xml') DEFAULT 'json',
	`is_active` boolean DEFAULT true,
	`retry_count` int DEFAULT 3,
	`timeout_ms` int DEFAULT 5000,
	`last_triggered_at` timestamp,
	`failure_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_approvals` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`workflow_id` bigint unsigned NOT NULL,
	`workflow_step_id` bigint unsigned,
	`entity_type` varchar(100),
	`entity_id` bigint unsigned,
	`requested_by` bigint unsigned,
	`assigned_to` json,
	`status` varchar(50) DEFAULT 'pending',
	`approved_by` bigint unsigned,
	`approved_at` timestamp,
	`rejection_reason` text,
	`priority` int DEFAULT 0,
	`due_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`workflow_id` bigint unsigned,
	`workflow_step_id` bigint unsigned,
	`entity_type` varchar(100),
	`entity_id` bigint unsigned,
	`action` varchar(100) NOT NULL,
	`status` varchar(50) NOT NULL,
	`message` text,
	`input_data` json,
	`output_data` json,
	`execution_time_ms` int,
	`triggered_by` bigint unsigned,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_steps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`workflow_id` bigint unsigned NOT NULL,
	`step_order` int NOT NULL,
	`step_type` varchar(50) NOT NULL,
	`step_config` json,
	`conditions` json,
	`approval_config` json,
	`is_parallel` boolean DEFAULT false,
	`timeout_minutes` int,
	`escalation_config` json,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`entity_type` varchar(100),
	`trigger_type` varchar(50) NOT NULL,
	`trigger_config` json,
	`is_active` boolean DEFAULT true,
	`version` int DEFAULT 1,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wps_exceptions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`payroll_period_id` bigint unsigned NOT NULL,
	`exception_type` enum('unpaid_leave','disciplinary_deduction','bank_account_change','other') NOT NULL,
	`amount` decimal(18,4) DEFAULT '0',
	`reason` text,
	`approved_by` bigint unsigned,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wps_exceptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wps_submissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`payroll_period_id` bigint unsigned NOT NULL,
	`submission_date` date NOT NULL,
	`bank_format` varchar(50) NOT NULL DEFAULT 'sarie',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`employee_count` int NOT NULL DEFAULT 0,
	`compliance_rate` decimal(5,2),
	`file_content` text,
	`file_name` varchar(255),
	`status` enum('draft','submitted','acknowledged','rejected') NOT NULL DEFAULT 'draft',
	`reference_number` varchar(100),
	`submitted_at` timestamp,
	`acknowledged_at` timestamp,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wps_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ws_collaboration_sessions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`session_name` varchar(255) NOT NULL,
	`session_type` enum('document_review','dashboard','record_edit','chat') NOT NULL,
	`entity_type` varchar(100),
	`entity_id` bigint unsigned,
	`created_by` bigint unsigned,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`ended_at` timestamp,
	CONSTRAINT `ws_collaboration_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ws_connections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`session_id` varchar(255),
	`device_info` varchar(500),
	`connected_at` timestamp DEFAULT (now()),
	`disconnected_at` timestamp,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `ws_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ws_notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`title` varchar(255) NOT NULL,
	`body` text,
	`type` enum('info','warning','error','success') DEFAULT 'info',
	`source_module` varchar(100),
	`source_entity_type` varchar(100),
	`source_entity_id` bigint unsigned,
	`action_url` varchar(1024),
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ws_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ws_presence` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`status` enum('online','away','busy','offline') DEFAULT 'offline',
	`last_seen` timestamp DEFAULT (now()),
	`current_module` varchar(100),
	`custom_status` varchar(255),
	`is_active` boolean DEFAULT true,
	CONSTRAINT `ws_presence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ws_session_activities` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`session_id` bigint unsigned,
	`user_id` bigint unsigned,
	`activity_type` enum('view','edit','comment','approve','reject','mention') NOT NULL,
	`activity_data` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ws_session_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ws_session_participants` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`session_id` bigint unsigned,
	`user_id` bigint unsigned,
	`role` enum('owner','editor','viewer') DEFAULT 'viewer',
	`joined_at` timestamp DEFAULT (now()),
	`left_at` timestamp,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `ws_session_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ws_user_typing` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`session_id` bigint unsigned,
	`user_id` bigint unsigned,
	`is_typing` boolean DEFAULT false,
	`last_typing_at` timestamp DEFAULT (now()),
	CONSTRAINT `ws_user_typing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zatca_offline_queue` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned NOT NULL,
	`action` enum('clearance','reporting') NOT NULL,
	`uuid` varchar(255) NOT NULL,
	`xml_payload` text NOT NULL,
	`signed_xml` text,
	`invoice_hash` varchar(255),
	`previous_invoice_hash` varchar(255),
	`status` enum('pending','submitted','cleared','rejected','retrying') NOT NULL DEFAULT 'pending',
	`retry_count` int DEFAULT 0,
	`last_error` text,
	`zatca_response` text,
	`submitted_at` timestamp,
	`cleared_at` timestamp,
	`next_retry_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `zatca_offline_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `customers` ADD `customer_type` enum('b2b','b2c','government','cash_customer') DEFAULT 'b2b' NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `whatsapp` varchar(50);--> statement-breakpoint
ALTER TABLE `customers` ADD `building_number` varchar(20);--> statement-breakpoint
ALTER TABLE `customers` ADD `street_name` varchar(255);--> statement-breakpoint
ALTER TABLE `customers` ADD `district` varchar(100);--> statement-breakpoint
ALTER TABLE `customers` ADD `postal_code` varchar(20);--> statement-breakpoint
ALTER TABLE `customers` ADD `additional_number` varchar(20);--> statement-breakpoint
ALTER TABLE `customers` ADD `vat_number` varchar(15);--> statement-breakpoint
ALTER TABLE `customers` ADD `cr_number` varchar(100);--> statement-breakpoint
ALTER TABLE `customers` ADD `contact_person` varchar(255);--> statement-breakpoint
ALTER TABLE `customers` ADD `contact_title` varchar(100);--> statement-breakpoint
ALTER TABLE `customers` ADD `opening_balance` decimal(18,4) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `opening_balance_date` date;--> statement-breakpoint
CREATE INDEX `admissions_tenant_idx` ON `admissions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `advance_payments_tenant_idx` ON `advance_payments` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `advance_payments_project_idx` ON `advance_payments` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `ai_automation_tenant_idx` ON `ai_automation_rules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ai_automation_type_idx` ON `ai_automation_rules` (`tenant_id`,`rule_type`);--> statement-breakpoint
CREATE INDEX `ai_automation_sugg_tenant_idx` ON `ai_automation_suggestions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ai_automation_sugg_status_idx` ON `ai_automation_suggestions` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `ai_chatbot_session_tenant_idx` ON `ai_chatbot_sessions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ai_chatbot_session_sid_idx` ON `ai_chatbot_sessions` (`session_id`);--> statement-breakpoint
CREATE INDEX `ai_forecast_tenant_idx` ON `ai_forecast_results` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ai_forecast_type_idx` ON `ai_forecast_results` (`tenant_id`,`forecast_type`);--> statement-breakpoint
CREATE INDEX `ai_report_templates_tenant_idx` ON `ai_report_templates` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `announcements` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_start` ON `announcements` (`start_at`);--> statement-breakpoint
CREATE INDEX `idx_end` ON `announcements` (`end_at`);--> statement-breakpoint
CREATE INDEX `api_keys_tenant_idx` ON `api_keys` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `api_rate_limits_tenant_idx` ON `api_rate_limits` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `api_usage_tenant_idx` ON `api_usage_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `appointments_tenant_idx` ON `appointments` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `appointments_date_idx` ON `appointments` (`tenant_id`,`appointment_date`);--> statement-breakpoint
CREATE INDEX `appointments_patient_idx` ON `appointments` (`patient_id`);--> statement-breakpoint
CREATE INDEX `batch_quality_tenant_idx` ON `batch_quality_records` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `batch_quality_product_idx` ON `batch_quality_records` (`tenant_id`,`product_id`,`batch_number`);--> statement-breakpoint
CREATE INDEX `bi_dw_tenant_idx` ON `bi_data_warehouse_tables` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `bi_metrics_tenant_idx` ON `bi_metrics_definitions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `bi_metrics_category_idx` ON `bi_metrics_definitions` (`tenant_id`,`category`);--> statement-breakpoint
CREATE INDEX `bc_tenant_idx` ON `bid_comparisons` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `bio_access_tenant_idx` ON `biometric_access_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `bio_access_employee_idx` ON `biometric_access_logs` (`employee_id`);--> statement-breakpoint
CREATE INDEX `bio_consent_tenant_idx` ON `biometric_consent_records` (`tenant_id`,`employee_id`);--> statement-breakpoint
CREATE INDEX `bio_tenant_idx` ON `biometric_templates` (`tenant_id`,`employee_id`);--> statement-breakpoint
CREATE INDEX `bio_device_idx` ON `biometric_templates` (`device_id`);--> statement-breakpoint
CREATE INDEX `booking_calendar_tenant_idx` ON `booking_calendar` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `booking_calendar_room_date_idx` ON `booking_calendar` (`room_id`,`date`);--> statement-breakpoint
CREATE INDEX `boq_items_tenant_idx` ON `boq_items` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `boq_items_project_idx` ON `boq_items` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `boq_items_wbs_idx` ON `boq_items` (`tenant_id`,`wbs_id`);--> statement-breakpoint
CREATE INDEX `cr_tenant_idx` ON `capacity_resources` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `cash_drawer_logs_shift_idx` ON `cash_drawer_logs` (`shift_id`);--> statement-breakpoint
CREATE INDEX `class_timetables_tenant_idx` ON `class_timetables` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `commission_records_tenant_idx` ON `commission_records` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `conflict_resolutions_tenant_idx` ON `conflict_resolutions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ci_tenant_idx` ON `consignment_inventory` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `cons_eliminations_group_idx` ON `consolidation_eliminations` (`group_id`);--> statement-breakpoint
CREATE INDEX `cons_entries_group_idx` ON `consolidation_entries` (`group_id`);--> statement-breakpoint
CREATE INDEX `cons_group_companies_group_idx` ON `consolidation_group_companies` (`group_id`);--> statement-breakpoint
CREATE INDEX `cons_groups_tenant_idx` ON `consolidation_groups` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `construction_contracts_tenant_idx` ON `construction_contracts` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `construction_contracts_project_idx` ON `construction_contracts` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `construction_projects_tenant_idx` ON `construction_projects` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `contract_assets_tenant_idx` ON `contract_assets` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `contract_costs_tenant_idx` ON `contract_costs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `contract_liab_tenant_idx` ON `contract_liabilities` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `controlled_substance_tenant_idx` ON `controlled_substance_log` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `capa_tenant_idx` ON `corrective_preventive_actions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `capa_ncr_idx` ON `corrective_preventive_actions` (`ncr_id`);--> statement-breakpoint
CREATE INDEX `crew_certifications_tenant_idx` ON `crew_certifications` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `crew_certifications_emp_idx` ON `crew_certifications` (`employee_id`);--> statement-breakpoint
CREATE INDEX `cvr_reports_tenant_idx` ON `cvr_reports` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `cvr_reports_project_idx` ON `cvr_reports` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `cce_schedule_idx` ON `cycle_count_entries` (`schedule_id`);--> statement-breakpoint
CREATE INDEX `ccs_tenant_idx` ON `cycle_count_schedules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dw_dashboard_idx` ON `dashboard_widgets` (`tenant_id`,`dashboard_id`);--> statement-breakpoint
CREATE INDEX `dashboards_tenant_idx` ON `dashboards` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dashboards_template_idx` ON `dashboards` (`tenant_id`,`template_key`);--> statement-breakpoint
CREATE INDEX `decennial_liability_tenant_idx` ON `decennial_liability` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `decennial_liability_project_idx` ON `decennial_liability` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `doctor_rosters_tenant_idx` ON `doctor_rosters` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `doc_access_tenant_idx` ON `document_access_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `doc_access_doc_idx` ON `document_access_logs` (`tenant_id`,`document_id`);--> statement-breakpoint
CREATE INDEX `driver_schedules_tenant_idx` ON `driver_schedules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `drug_interactions_tenant_idx` ON `drug_interactions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dw_cubes_tenant_idx` ON `dw_cubes` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dw_dims_tenant_idx` ON `dw_dimension_tables` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dw_etl_tenant_idx` ON `dw_etl_metadata` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `dw_facts_tenant_idx` ON `dw_fact_tables` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `esig_log_tenant_idx` ON `e_signature_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `esig_log_req_idx` ON `e_signature_logs` (`signature_request_id`);--> statement-breakpoint
CREATE INDEX `esig_req_tenant_idx` ON `e_signature_requests` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `esig_req_doc_idx` ON `e_signature_requests` (`tenant_id`,`document_id`);--> statement-breakpoint
CREATE INDEX `esig_req_signer_idx` ON `e_signature_requests` (`tenant_id`,`signer_id`);--> statement-breakpoint
CREATE INDEX `edi_acks_tenant_idx` ON `edi_acknowledgements` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `edi_doc_types_tenant_idx` ON `edi_document_types` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `edi_inbound_tenant_idx` ON `edi_inbound_queue` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `edi_logs_tenant_idx` ON `edi_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `edi_mappings_tenant_idx` ON `edi_mappings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `edi_outbound_tenant_idx` ON `edi_outbound_queue` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `edi_partners_tenant_idx` ON `edi_partners` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `edi_txn_sets_tenant_idx` ON `edi_transaction_sets` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `emv_transactions_invoice_idx` ON `emv_transactions` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `engineering_saudization_tenant_idx` ON `engineering_saudization` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `engineering_saudization_project_idx` ON `engineering_saudization` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `eosb_tenant_idx` ON `eosb_accruals` (`tenant_id`,`employee_id`);--> statement-breakpoint
CREATE INDEX `eosb_period_idx` ON `eosb_accruals` (`period_start`,`period_end`);--> statement-breakpoint
CREATE INDEX `equipment_schedule_tenant_idx` ON `equipment_schedule` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `equipment_schedule_equipment_idx` ON `equipment_schedule` (`tenant_id`,`equipment_id`);--> statement-breakpoint
CREATE INDEX `equipment_schedule_project_idx` ON `equipment_schedule` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `equipment_tracking_tenant_idx` ON `equipment_tracking` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `etl_connectors_tenant_idx` ON `etl_connectors` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `etl_dq_rules_tenant_idx` ON `etl_data_quality_rules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `etl_exec_logs_tenant_idx` ON `etl_execution_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `etl_jobs_tenant_idx` ON `etl_jobs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `etl_transforms_tenant_idx` ON `etl_transformations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_name` ON `feature_flags` (`flag_name`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `feature_flags` (`is_active`);--> statement-breakpoint
CREATE INDEX `fee_structures_tenant_idx` ON `fee_structures` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `flights_tenant_idx` ON `flights` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `flights_departure_idx` ON `flights` (`tenant_id`,`departure_time`);--> statement-breakpoint
CREATE INDEX `flights_route_idx` ON `flights` (`origin`,`destination`);--> statement-breakpoint
CREATE INDEX `floor_plans_tenant_idx` ON `floor_plans` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `folio_charges_tenant_idx` ON `folio_charges` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `folio_charges_booking_idx` ON `folio_charges` (`booking_id`);--> statement-breakpoint
CREATE INDEX `fuel_cost_analytics_tenant_idx` ON `fuel_cost_analytics` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `gift_cards_tenant_idx` ON `gift_cards` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `gosi_rates_tenant_idx` ON `gosi_rate_tables` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `gosi_rates_effective_idx` ON `gosi_rate_tables` (`effective_from`,`effective_to`);--> statement-breakpoint
CREATE INDEX `gosi_reg_employee_idx` ON `gosi_registrations` (`employee_id`);--> statement-breakpoint
CREATE INDEX `gosi_sub_tenant_idx` ON `gosi_submission_logs` (`tenant_id`,`period_year`,`period_month`);--> statement-breakpoint
CREATE INDEX `gtpl_compliance_tenant_idx` ON `gtpl_compliance` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `gtpl_compliance_project_idx` ON `gtpl_compliance` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `heat_stress_records_tenant_idx` ON `heat_stress_records` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `heat_stress_records_project_idx` ON `heat_stress_records` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `heat_stress_records_date_idx` ON `heat_stress_records` (`tenant_id`,`date`);--> statement-breakpoint
CREATE INDEX `hotel_bookings_tenant_idx` ON `hotel_bookings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `hotel_bookings_dates_idx` ON `hotel_bookings` (`tenant_id`,`check_in`,`check_out`);--> statement-breakpoint
CREATE INDEX `hotel_bookings_source_idx` ON `hotel_bookings` (`source`);--> statement-breakpoint
CREATE INDEX `housekeeping_tenant_idx` ON `housekeeping_schedule` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `housekeeping_date_idx` ON `housekeeping_schedule` (`tenant_id`,`date`);--> statement-breakpoint
CREATE INDEX `hse_committees_tenant_idx` ON `hse_committees` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `hse_committees_project_idx` ON `hse_committees` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `idx_admin` ON `impersonation_logs` (`admin_user_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant` ON `impersonation_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_started` ON `impersonation_logs` (`started_at`);--> statement-breakpoint
CREATE INDEX `insurance_claims_tenant_idx` ON `insurance_claims` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `insurance_claims_hc_tenant_idx` ON `insurance_claims_healthcare` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `interco_tx_tenant_idx` ON `intercompany_transactions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `iar_tenant_idx` ON `inventory_adjustment_reasons` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `iqama_tenant_idx` ON `iqama_records` (`tenant_id`,`employee_id`);--> statement-breakpoint
CREATE INDEX `iqama_expiry_idx` ON `iqama_records` (`expiry_date`);--> statement-breakpoint
CREATE INDEX `iqama_number_idx` ON `iqama_records` (`iqama_number`);--> statement-breakpoint
CREATE INDEX `itineraries_tenant_idx` ON `itineraries` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `itineraries_booking_idx` ON `itineraries` (`booking_id`);--> statement-breakpoint
CREATE INDEX `kds_stations_tenant_idx` ON `kds_stations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `kot_tickets_order_idx` ON `kot_tickets` (`table_order_id`);--> statement-breakpoint
CREATE INDEX `kot_tickets_station_idx` ON `kot_tickets` (`station_id`,`status`);--> statement-breakpoint
CREATE INDEX `lab_orders_tenant_idx` ON `lab_orders` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `lease_contracts_tenant_idx` ON `lease_contracts` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `lease_mods_contract_idx` ON `lease_modifications` (`contract_id`);--> statement-breakpoint
CREATE INDEX `lease_pay_sched_contract_idx` ON `lease_payment_schedules` (`contract_id`);--> statement-breakpoint
CREATE INDEX `leases_tenant_idx` ON `leases` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `leases_unit_idx` ON `leases` (`unit_id`);--> statement-breakpoint
CREATE INDEX `loyalty_cards_customer_idx` ON `loyalty_cards` (`customer_id`);--> statement-breakpoint
CREATE INDEX `loyalty_cards_program_idx` ON `loyalty_cards` (`program_id`);--> statement-breakpoint
CREATE INDEX `loyalty_programs_tenant_idx` ON `loyalty_programs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `loyalty_transactions_card_idx` ON `loyalty_transactions` (`card_id`);--> statement-breakpoint
CREATE INDEX `maintenance_airworthiness_tenant_idx` ON `maintenance_airworthiness` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `maintenance_requests_tenant_idx` ON `maintenance_requests` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `maintenance_requests_status_idx` ON `maintenance_requests` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `mps_tenant_idx` ON `master_production_schedules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `material_requirements_tenant_idx` ON `material_requirements` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `material_requirements_project_idx` ON `material_requirements` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `mrp_demands_tenant_idx` ON `mrp_demands` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `mrp_nr_tenant_idx` ON `mrp_net_requirements` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `mrp_po_tenant_idx` ON `mrp_planned_orders` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `mrp_runs_tenant_idx` ON `mrp_runs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `nitaqat_tenant_idx` ON `nitaqat_snapshots` (`tenant_id`,`snapshot_date`);--> statement-breakpoint
CREATE INDEX `ncr_tenant_idx` ON `non_conformance_reports` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ncr_status_idx` ON `non_conformance_reports` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `offline_operations_tenant_idx` ON `offline_operations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `offline_operations_status_idx` ON `offline_operations` (`status`);--> statement-breakpoint
CREATE INDEX `parts_inventory_serial_tenant_idx` ON `parts_inventory_serial` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `parts_inventory_serial_part_idx` ON `parts_inventory_serial` (`part_number`);--> statement-breakpoint
CREATE INDEX `patients_tenant_idx` ON `patients` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `patients_phone_idx` ON `patients` (`phone`);--> statement-breakpoint
CREATE INDEX `payment_splits_invoice_idx` ON `payment_splits` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant` ON `payment_transactions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_invoice` ON `payment_transactions` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `payment_transactions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_gateway` ON `payment_transactions` (`gateway`);--> statement-breakpoint
CREATE INDEX `pdpl_tenant_idx` ON `pdpl_data_subject_requests` (`tenant_id`,`employee_id`);--> statement-breakpoint
CREATE INDEX `pegging_tenant_idx` ON `pegging_records` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `perf_obl_tenant_idx` ON `performance_obligations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `pharmacy_integration_tenant_idx` ON `pharmacy_integration` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `pkr_tenant_idx` ON `picking_rules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `pkt_tenant_idx` ON `picking_tasks` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `pos_shifts_tenant_idx` ON `pos_shifts` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `pos_shifts_user_idx` ON `pos_shifts` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `ppe_issuance_tenant_idx` ON `ppe_issuance` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ppe_issuance_project_idx` ON `ppe_issuance` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `prescriptions_tenant_idx` ON `prescriptions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `prescriptions_customer_idx` ON `prescriptions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `price_tiers_tenant_idx` ON `price_tiers` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `progress_billing_tenant_idx` ON `progress_billing` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `properties_tenant_idx` ON `properties` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `property_units_tenant_idx` ON `property_units` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `property_units_property_idx` ON `property_units` (`property_id`);--> statement-breakpoint
CREATE INDEX `pr_tenant_idx` ON `putaway_rules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `pt_tenant_idx` ON `putaway_tasks` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `qiwa_log_tenant_idx` ON `qiwa_comparison_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `qr_order_sessions_table_idx` ON `qr_order_sessions` (`restaurant_table_id`);--> statement-breakpoint
CREATE INDEX `qc_blocked_tenant_idx` ON `quality_blocked_stocks` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `qc_blocked_product_idx` ON `quality_blocked_stocks` (`tenant_id`,`product_id`,`warehouse_id`);--> statement-breakpoint
CREATE INDEX `qc_inspection_lines_inspection_idx` ON `quality_inspection_lines` (`inspection_id`);--> statement-breakpoint
CREATE INDEX `qc_template_lines_template_idx` ON `quality_inspection_template_lines` (`template_id`);--> statement-breakpoint
CREATE INDEX `qc_templates_tenant_idx` ON `quality_inspection_templates` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `qc_inspections_tenant_idx` ON `quality_inspections` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `qc_inspections_ref_idx` ON `quality_inspections` (`tenant_id`,`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `qc_inspections_product_idx` ON `quality_inspections` (`tenant_id`,`product_id`);--> statement-breakpoint
CREATE INDEX `rent_invoices_tenant_idx` ON `rent_invoices` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `rent_invoices_lease_idx` ON `rent_invoices` (`lease_id`);--> statement-breakpoint
CREATE INDEX `rent_invoices_status_idx` ON `rent_invoices` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `report_cards_tenant_idx` ON `report_cards` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `report_cards_student_idx` ON `report_cards` (`student_id`);--> statement-breakpoint
CREATE INDEX `report_schedules_tenant_idx` ON `report_schedules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `report_schedules_next_run_idx` ON `report_schedules` (`next_run_at`);--> statement-breakpoint
CREATE INDEX `report_templates_tenant_idx` ON `report_templates` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `report_templates_module_idx` ON `report_templates` (`tenant_id`,`module`);--> statement-breakpoint
CREATE INDEX `idx_reseller` ON `reseller_payouts` (`reseller_id`);--> statement-breakpoint
CREATE INDEX `idx_period` ON `reseller_payouts` (`period_start`,`period_end`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `reseller_payouts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_reseller` ON `reseller_tenants` (`reseller_id`);--> statement-breakpoint
CREATE INDEX `idx_tenant` ON `reseller_tenants` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_email` ON `resellers` (`email`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `resellers` (`status`);--> statement-breakpoint
CREATE INDEX `restaurant_tables_plan_idx` ON `restaurant_tables` (`floor_plan_id`);--> statement-breakpoint
CREATE INDEX `restaurant_tables_status_idx` ON `restaurant_tables` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `retention_accounts_tenant_idx` ON `retention_accounts` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `rev_rec_sched_tenant_idx` ON `revenue_recognition_schedules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `rfq_tenant_idx` ON `rfq_headers` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `rou_assets_contract_idx` ON `right_of_use_assets` (`contract_id`);--> statement-breakpoint
CREATE INDEX `room_inventory_tenant_idx` ON `room_inventory` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `room_inventory_type_idx` ON `room_inventory` (`room_type_id`);--> statement-breakpoint
CREATE INDEX `room_types_tenant_idx` ON `room_types` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `rccp_tenant_idx` ON `rough_cut_capacity_plans` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `route_planning_tenant_idx` ON `route_planning` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `routes_tenant_idx` ON `routes` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `safety_training_tenant_idx` ON `safety_training` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `safety_training_project_idx` ON `safety_training` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `sbc_compliance_tenant_idx` ON `sbc_compliance` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `sbc_compliance_project_idx` ON `sbc_compliance` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `sca_classification_tenant_idx` ON `sca_classification` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `sfda_serial_product_idx` ON `sfda_serial_numbers` (`product_id`);--> statement-breakpoint
CREATE INDEX `shipment_tracking_tenant_idx` ON `shipment_tracking` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `shipment_tracking_tracking_idx` ON `shipment_tracking` (`tracking_number`);--> statement-breakpoint
CREATE INDEX `shipment_tracking_status_idx` ON `shipment_tracking` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `site_daily_reports_tenant_idx` ON `site_daily_reports` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `site_daily_reports_project_idx` ON `site_daily_reports` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `site_daily_reports_date_idx` ON `site_daily_reports` (`tenant_id`,`report_date`);--> statement-breakpoint
CREATE INDEX `sb_tenant_idx` ON `storage_bins` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `sl_tenant_idx` ON `storage_locations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `student_attendance_tenant_idx` ON `student_attendance` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `student_attendance_student_idx` ON `student_attendance` (`student_id`);--> statement-breakpoint
CREATE INDEX `student_attendance_date_idx` ON `student_attendance` (`tenant_id`,`date`);--> statement-breakpoint
CREATE INDEX `student_fee_invoices_tenant_idx` ON `student_fee_invoices` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `students_tenant_idx` ON `students` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `subcontractor_payments_tenant_idx` ON `subcontractor_payments` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `subcontractor_payments_sub_idx` ON `subcontractor_payments` (`tenant_id`,`subcontractor_id`);--> statement-breakpoint
CREATE INDEX `subcontractor_payments_project_idx` ON `subcontractor_payments` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `subcontractors_tenant_idx` ON `subcontractors` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `subscription_plans` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_public` ON `subscription_plans` (`is_public`);--> statement-breakpoint
CREATE INDEX `sc_tenant_idx` ON `supplier_contracts` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `se_tenant_idx` ON `supplier_evaluations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `spm_tenant_idx` ON `supplier_performance_metrics` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `spu_tenant_idx` ON `supplier_portal_users` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `supplier_reconciliation_tenant_idx` ON `supplier_reconciliation` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `sync_queue_tenant_idx` ON `sync_queue` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `sync_queue_status_idx` ON `sync_queue` (`status`);--> statement-breakpoint
CREATE INDEX `sync_stats_tenant_idx` ON `sync_stats` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `system_settings_category_idx` ON `system_settings` (`category`);--> statement-breakpoint
CREATE INDEX `table_orders_table_idx` ON `table_orders` (`restaurant_table_id`);--> statement-breakpoint
CREATE INDEX `table_orders_status_idx` ON `table_orders` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_tenant` ON `tenant_invoices` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_subscription` ON `tenant_invoices` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `tenant_invoices` (`status`);--> statement-breakpoint
CREATE INDEX `idx_invoice_date` ON `tenant_invoices` (`invoice_date`);--> statement-breakpoint
CREATE INDEX `idx_due_date` ON `tenant_invoices` (`due_date`);--> statement-breakpoint
CREATE INDEX `tenant_module_controls_tenant_idx` ON `tenant_module_controls` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `tenant_module_controls_module_idx` ON `tenant_module_controls` (`module_key`);--> statement-breakpoint
CREATE INDEX `idx_tenant` ON `tenant_modules` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_module` ON `tenant_modules` (`module_name`);--> statement-breakpoint
CREATE INDEX `idx_enabled` ON `tenant_modules` (`is_enabled`);--> statement-breakpoint
CREATE INDEX `tenant_service_events_tenant_idx` ON `tenant_service_events` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `tenant_service_events_type_idx` ON `tenant_service_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `tenant_service_events_status_idx` ON `tenant_service_events` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tenant` ON `tenant_usage` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `idx_period` ON `tenant_usage` (`period_start`,`period_end`);--> statement-breakpoint
CREATE INDEX `travel_bookings_tenant_idx` ON `travel_bookings` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `travel_bookings_type_idx` ON `travel_bookings` (`booking_type`);--> statement-breakpoint
CREATE INDEX `travel_suppliers_tenant_idx` ON `travel_suppliers` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `variation_orders_tenant_idx` ON `variation_orders` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `variation_orders_project_idx` ON `variation_orders` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `variation_orders_contract_idx` ON `variation_orders` (`tenant_id`,`contract_id`);--> statement-breakpoint
CREATE INDEX `wz_tenant_idx` ON `warehouse_zones` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `wp_tenant_idx` ON `wave_picking` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `wbs_items_tenant_idx` ON `wbs_items` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `wbs_items_project_idx` ON `wbs_items` (`tenant_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `wbs_items_parent_idx` ON `wbs_items` (`tenant_id`,`parent_id`);--> statement-breakpoint
CREATE INDEX `webhook_queue_tenant_idx` ON `webhook_event_queue` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `webhook_subs_tenant_idx` ON `webhook_subscriptions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `workflow_approvals_tenant_idx` ON `workflow_approvals` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `workflow_approvals_status_idx` ON `workflow_approvals` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `workflow_approvals_entity_idx` ON `workflow_approvals` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `workflow_logs_tenant_idx` ON `workflow_logs` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `workflow_logs_workflow_idx` ON `workflow_logs` (`tenant_id`,`workflow_id`);--> statement-breakpoint
CREATE INDEX `workflow_logs_entity_idx` ON `workflow_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `workflow_logs_created_idx` ON `workflow_logs` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `workflow_steps_workflow_idx` ON `workflow_steps` (`tenant_id`,`workflow_id`);--> statement-breakpoint
CREATE INDEX `workflows_tenant_idx` ON `workflows` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `workflows_entity_idx` ON `workflows` (`tenant_id`,`entity_type`);--> statement-breakpoint
CREATE INDEX `workflows_trigger_idx` ON `workflows` (`tenant_id`,`trigger_type`);--> statement-breakpoint
CREATE INDEX `wps_exc_tenant_idx` ON `wps_exceptions` (`tenant_id`,`payroll_period_id`);--> statement-breakpoint
CREATE INDEX `wps_tenant_idx` ON `wps_submissions` (`tenant_id`,`payroll_period_id`);--> statement-breakpoint
CREATE INDEX `ws_collab_tenant_idx` ON `ws_collaboration_sessions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ws_conn_tenant_idx` ON `ws_connections` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ws_notif_tenant_idx` ON `ws_notifications` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ws_presence_tenant_idx` ON `ws_presence` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `ws_typing_tenant_idx` ON `ws_user_typing` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `zatca_queue_tenant_idx` ON `zatca_offline_queue` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `zatca_queue_status_idx` ON `zatca_offline_queue` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `zatca_queue_invoice_idx` ON `zatca_offline_queue` (`tenant_id`,`invoice_id`);