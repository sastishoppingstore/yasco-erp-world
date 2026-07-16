-- New Verticals: Laundry, Salon, Gym, E-commerce

-- =====================================================
-- LAUNDRY: Orders & Stages
-- =====================================================
CREATE TABLE `laundry_orders` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `items_count` int NOT NULL DEFAULT 1,
  `total_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `status` enum('received','washing','ironing','ready','delivered') NOT NULL DEFAULT 'received',
  `payment_status` enum('paid','unpaid') NOT NULL DEFAULT 'unpaid',
  `garment_details` text,
  `date` date NOT NULL,
  `delivery_type` enum('pickup','delivery') NOT NULL DEFAULT 'pickup',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `laundry_orders_id` PRIMARY KEY(`id`)
);
CREATE INDEX `laundry_orders_tenant_idx` ON `laundry_orders` (`tenant_id`);

-- =====================================================
-- SALON: Appointments & Staff
-- =====================================================
CREATE TABLE `salon_appointments` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_phone` varchar(50) NOT NULL,
  `service` varchar(255) NOT NULL,
  `stylist_name` varchar(255) NOT NULL,
  `time` varchar(50) NOT NULL,
  `status` enum('scheduled','in-service','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `price` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `salon_appointments_id` PRIMARY KEY(`id`)
);
CREATE INDEX `salon_appointments_tenant_idx` ON `salon_appointments` (`tenant_id`);

-- =====================================================
-- GYM: Members & Check-ins
-- =====================================================
CREATE TABLE `gym_members` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `membership_plan` varchar(255) NOT NULL,
  `status` enum('active','frozen','expired') NOT NULL DEFAULT 'active',
  `expiry_date` date NOT NULL,
  `last_check_in` varchar(100),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `gym_members_id` PRIMARY KEY(`id`)
);
CREATE INDEX `gym_members_tenant_idx` ON `gym_members` (`tenant_id`);

-- =====================================================
-- E-COMMERCE: Channel Sync Orders
-- =====================================================
CREATE TABLE `ecommerce_orders` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `channel` enum('Shopify','Salla','Zid','WhatsApp') NOT NULL DEFAULT 'Salla',
  `customer_name` varchar(255) NOT NULL,
  `total_amount` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `payment_method` enum('COD','Mada','Card') NOT NULL DEFAULT 'Mada',
  `fulfillment_status` enum('pending','packed','shipped','delivered') NOT NULL DEFAULT 'pending',
  `courier` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ecommerce_orders_id` PRIMARY KEY(`id`)
);
CREATE INDEX `ecommerce_orders_tenant_idx` ON `ecommerce_orders` (`tenant_id`);
