CREATE TABLE IF NOT EXISTS `tenant_module_controls` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `module_key` varchar(100) NOT NULL,
  `is_enabled` boolean NOT NULL DEFAULT true,
  `source` enum('plan','override','trial','support') NOT NULL DEFAULT 'plan',
  `limit_json` json,
  `notes` text,
  `updated_by` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `tenant_module_controls_id` PRIMARY KEY(`id`),
  CONSTRAINT `tenant_module_controls_unique_idx` UNIQUE(`tenant_id`,`module_key`)
);

CREATE INDEX `tenant_module_controls_tenant_idx` ON `tenant_module_controls` (`tenant_id`);
CREATE INDEX `tenant_module_controls_module_idx` ON `tenant_module_controls` (`module_key`);

CREATE TABLE IF NOT EXISTS `tenant_service_events` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `event_type` enum('module_toggle','limit_update','billing_update','backup_request','restore_request','support_action','white_label_update') NOT NULL,
  `status` enum('pending','approved','running','done','failed','cancelled') NOT NULL DEFAULT 'pending',
  `title` varchar(255) NOT NULL,
  `metadata` json,
  `requested_by` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `tenant_service_events_id` PRIMARY KEY(`id`)
);

CREATE INDEX `tenant_service_events_tenant_idx` ON `tenant_service_events` (`tenant_id`);
CREATE INDEX `tenant_service_events_type_idx` ON `tenant_service_events` (`event_type`);
CREATE INDEX `tenant_service_events_status_idx` ON `tenant_service_events` (`status`);

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `key` varchar(150) NOT NULL,
  `value` text,
  `category` varchar(100) DEFAULT 'platform',
  `is_secret` boolean DEFAULT false,
  `updated_by` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
  CONSTRAINT `system_settings_key_idx` UNIQUE(`key`)
);

CREATE INDEX `system_settings_category_idx` ON `system_settings` (`category`);
