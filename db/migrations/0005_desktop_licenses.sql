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

CREATE INDEX `desktop_licenses_tenant_idx` ON `desktop_licenses` (`tenant_id`);
CREATE INDEX `desktop_licenses_status_idx` ON `desktop_licenses` (`status`);
