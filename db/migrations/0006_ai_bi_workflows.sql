-- ============================================
-- AI Reports
-- ============================================
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

CREATE INDEX `ai_report_templates_tenant_idx` ON `ai_report_templates` (`tenant_id`);

-- ============================================
-- AI Forecasting
-- ============================================
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

CREATE INDEX `ai_forecast_tenant_idx` ON `ai_forecast_results` (`tenant_id`);
CREATE INDEX `ai_forecast_type_idx` ON `ai_forecast_results` (`tenant_id`, `forecast_type`);

-- ============================================
-- AI Chatbot Sessions
-- ============================================
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

CREATE INDEX `ai_chatbot_session_tenant_idx` ON `ai_chatbot_sessions` (`tenant_id`);
CREATE INDEX `ai_chatbot_session_sid_idx` ON `ai_chatbot_sessions` (`session_id`);

-- ============================================
-- AI Automation Rules
-- ============================================
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

CREATE INDEX `ai_automation_tenant_idx` ON `ai_automation_rules` (`tenant_id`);
CREATE INDEX `ai_automation_type_idx` ON `ai_automation_rules` (`tenant_id`, `rule_type`);

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

CREATE INDEX `ai_automation_sugg_tenant_idx` ON `ai_automation_suggestions` (`tenant_id`);
CREATE INDEX `ai_automation_sugg_status_idx` ON `ai_automation_suggestions` (`tenant_id`, `status`);

-- ============================================
-- BI Data Warehouse
-- ============================================
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

CREATE INDEX `bi_dw_tenant_idx` ON `bi_data_warehouse_tables` (`tenant_id`);

-- ============================================
-- BI Metrics Definitions
-- ============================================
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
  CONSTRAINT `bi_metrics_definitions_key_unique` UNIQUE(`tenant_id`, `metric_key`)
);

CREATE INDEX `bi_metrics_tenant_idx` ON `bi_metrics_definitions` (`tenant_id`);
CREATE INDEX `bi_metrics_category_idx` ON `bi_metrics_definitions` (`tenant_id`, `category`);

-- ============================================
-- Dashboards
-- ============================================
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

CREATE INDEX `dashboards_tenant_idx` ON `dashboards` (`tenant_id`);
CREATE INDEX `dashboards_template_idx` ON `dashboards` (`tenant_id`, `template_key`);

-- ============================================
-- Dashboard Widgets
-- ============================================
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

CREATE INDEX `dw_dashboard_idx` ON `dashboard_widgets` (`tenant_id`, `dashboard_id`);

-- ============================================
-- Report Templates
-- ============================================
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

CREATE INDEX `report_templates_tenant_idx` ON `report_templates` (`tenant_id`);
CREATE INDEX `report_templates_module_idx` ON `report_templates` (`tenant_id`, `module`);

-- ============================================
-- Report Schedules
-- ============================================
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

CREATE INDEX `report_schedules_tenant_idx` ON `report_schedules` (`tenant_id`);
CREATE INDEX `report_schedules_next_run_idx` ON `report_schedules` (`next_run_at`);

-- ============================================
-- Workflows
-- ============================================
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

CREATE INDEX `workflows_tenant_idx` ON `workflows` (`tenant_id`);
CREATE INDEX `workflows_entity_idx` ON `workflows` (`tenant_id`, `entity_type`);
CREATE INDEX `workflows_trigger_idx` ON `workflows` (`tenant_id`, `trigger_type`);

-- ============================================
-- Workflow Steps
-- ============================================
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

CREATE INDEX `workflow_steps_workflow_idx` ON `workflow_steps` (`tenant_id`, `workflow_id`);

-- ============================================
-- Workflow Approvals
-- ============================================
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

CREATE INDEX `workflow_approvals_tenant_idx` ON `workflow_approvals` (`tenant_id`);
CREATE INDEX `workflow_approvals_status_idx` ON `workflow_approvals` (`tenant_id`, `status`);
CREATE INDEX `workflow_approvals_entity_idx` ON `workflow_approvals` (`entity_type`, `entity_id`);

-- ============================================
-- Workflow Logs
-- ============================================
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

CREATE INDEX `workflow_logs_tenant_idx` ON `workflow_logs` (`tenant_id`);
CREATE INDEX `workflow_logs_workflow_idx` ON `workflow_logs` (`tenant_id`, `workflow_id`);
CREATE INDEX `workflow_logs_entity_idx` ON `workflow_logs` (`entity_type`, `entity_id`);
CREATE INDEX `workflow_logs_created_idx` ON `workflow_logs` (`tenant_id`, `created_at`);
