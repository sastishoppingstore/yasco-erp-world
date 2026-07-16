-- POS Verticals: Restaurant, Pharmacy, Wholesale + Shared Infrastructure

-- =====================================================
-- RESTAURANT: Floor Plans & Tables
-- =====================================================
CREATE TABLE `floor_plans` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255),
  `width` int NOT NULL DEFAULT 800,
  `height` int NOT NULL DEFAULT 600,
  `background_image` text,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `floor_plans_id` PRIMARY KEY(`id`)
);
CREATE INDEX `floor_plans_tenant_idx` ON `floor_plans` (`tenant_id`);

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
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `restaurant_tables_id` PRIMARY KEY(`id`)
);
CREATE INDEX `restaurant_tables_plan_idx` ON `restaurant_tables` (`floor_plan_id`);
CREATE INDEX `restaurant_tables_status_idx` ON `restaurant_tables` (`tenant_id`, `status`);

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
CREATE INDEX `table_orders_table_idx` ON `table_orders` (`restaurant_table_id`);
CREATE INDEX `table_orders_status_idx` ON `table_orders` (`tenant_id`, `status`);

-- =====================================================
-- RESTAURANT: KDS (Kitchen Display System) & KOT (Kitchen Order Ticket)
-- =====================================================
CREATE TABLE `kds_stations` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255),
  `station_type` enum('kitchen','bar','grill','salad','pizza','dessert','other') NOT NULL DEFAULT 'kitchen',
  `printer_name` varchar(255),
  `is_active` boolean NOT NULL DEFAULT true,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `kds_stations_id` PRIMARY KEY(`id`)
);
CREATE INDEX `kds_stations_tenant_idx` ON `kds_stations` (`tenant_id`);

CREATE TABLE `kds_station_products` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `station_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `kds_station_products_id` PRIMARY KEY(`id`),
  CONSTRAINT `kds_station_products_unique` UNIQUE(`station_id`, `product_id`)
);

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
  `printed` boolean NOT NULL DEFAULT false,
  `print_count` int NOT NULL DEFAULT 0,
  `prepared_by` bigint unsigned,
  `ready_at` timestamp,
  `served_at` timestamp,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `kot_tickets_id` PRIMARY KEY(`id`)
);
CREATE INDEX `kot_tickets_order_idx` ON `kot_tickets` (`table_order_id`);
CREATE INDEX `kot_tickets_station_idx` ON `kot_tickets` (`station_id`, `status`);

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

-- =====================================================
-- RESTAURANT: Course/Modifier Handling
-- =====================================================
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

-- =====================================================
-- PHARMACY: Prescriptions & Insurance
-- =====================================================
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
  `is_controlled_substance` boolean NOT NULL DEFAULT false,
  `controlled_substance_license` varchar(100),
  `status` enum('active','dispensed','partial','expired','cancelled') NOT NULL DEFAULT 'active',
  `notes` text,
  `created_by` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`)
);
CREATE INDEX `prescriptions_tenant_idx` ON `prescriptions` (`tenant_id`);
CREATE INDEX `prescriptions_customer_idx` ON `prescriptions` (`customer_id`);

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
  `is_controlled` boolean NOT NULL DEFAULT false,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `prescription_items_id` PRIMARY KEY(`id`)
);

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
CREATE INDEX `controlled_substance_tenant_idx` ON `controlled_substance_log` (`tenant_id`);

CREATE TABLE `insurance_companies` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255),
  `code` varchar(50),
  `contract_number` varchar(100),
  `discount_percent` decimal(5,2) DEFAULT '0',
  `coverage_percent` decimal(5,2) DEFAULT '100',
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `insurance_companies_id` PRIMARY KEY(`id`)
);

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
CREATE INDEX `insurance_claims_tenant_idx` ON `insurance_claims` (`tenant_id`);

-- =====================================================
-- SHARED: Loyalty Programs
-- =====================================================
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
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `loyalty_programs_id` PRIMARY KEY(`id`)
);
CREATE INDEX `loyalty_programs_tenant_idx` ON `loyalty_programs` (`tenant_id`);

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
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `loyalty_cards_id` PRIMARY KEY(`id`),
  CONSTRAINT `loyalty_cards_number_unique` UNIQUE(`card_number`)
);
CREATE INDEX `loyalty_cards_customer_idx` ON `loyalty_cards` (`customer_id`);
CREATE INDEX `loyalty_cards_program_idx` ON `loyalty_cards` (`program_id`);

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
CREATE INDEX `loyalty_transactions_card_idx` ON `loyalty_transactions` (`card_id`);

-- =====================================================
-- SHARED: Gift Cards
-- =====================================================
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
CREATE INDEX `gift_cards_tenant_idx` ON `gift_cards` (`tenant_id`);

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

-- =====================================================
-- SHARED: Shift/Till Management
-- =====================================================
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
CREATE INDEX `pos_shifts_tenant_idx` ON `pos_shifts` (`tenant_id`);
CREATE INDEX `pos_shifts_user_idx` ON `pos_shifts` (`user_id`, `status`);

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
CREATE INDEX `cash_drawer_logs_shift_idx` ON `cash_drawer_logs` (`shift_id`);

-- =====================================================
-- WHOLESALE: Pricing & Discounts
-- =====================================================
CREATE TABLE `price_tiers` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255),
  `tier_type` enum('quantity_break','customer_group','trade_discount') NOT NULL DEFAULT 'quantity_break',
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `price_tiers_id` PRIMARY KEY(`id`)
);
CREATE INDEX `price_tiers_tenant_idx` ON `price_tiers` (`tenant_id`);

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

CREATE TABLE `customer_price_tiers` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `price_tier_id` bigint unsigned NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `customer_price_tiers_id` PRIMARY KEY(`id`),
  CONSTRAINT `customer_price_tiers_unique` UNIQUE(`customer_id`, `price_tier_id`)
);

-- =====================================================
-- SHARED: EMV / Multi-Payment
-- =====================================================
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
CREATE INDEX `emv_transactions_invoice_idx` ON `emv_transactions` (`invoice_id`);

-- =====================================================
-- SHARED: Multi-Payment Splits
-- =====================================================
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
CREATE INDEX `payment_splits_invoice_idx` ON `payment_splits` (`invoice_id`);

-- =====================================================
-- SHARED: QR Ordering / Self-Service Kiosk
-- =====================================================
CREATE TABLE `qr_order_sessions` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `restaurant_table_id` bigint unsigned,
  `session_token` varchar(255) NOT NULL UNIQUE,
  `device_id` varchar(255),
  `status` enum('active','ordered','paid','expired','cancelled') NOT NULL DEFAULT 'active',
  `expires_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `qr_order_sessions_id` PRIMARY KEY(`id`)
);
CREATE INDEX `qr_order_sessions_table_idx` ON `qr_order_sessions` (`restaurant_table_id`);

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
CREATE INDEX `sfda_serial_product_idx` ON `sfda_serial_numbers` (`product_id`);

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
  CONSTRAINT `drug_interaction_pair_unique` UNIQUE(`product_id_a`, `product_id_b`)
);
CREATE INDEX `drug_interactions_tenant_idx` ON `drug_interactions` (`tenant_id`);
