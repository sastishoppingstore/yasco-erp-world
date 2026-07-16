CREATE TABLE `ecommerce_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`channel` enum('Shopify','Salla','Zid','WhatsApp') NOT NULL DEFAULT 'Salla',
	`customer_name` varchar(255) NOT NULL,
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`payment_method` enum('COD','Mada','Card') NOT NULL DEFAULT 'Mada',
	`fulfillment_status` enum('pending','packed','shipped','delivered') NOT NULL DEFAULT 'pending',
	`courier` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ecommerce_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `laundry_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`customer_name` varchar(255) NOT NULL,
	`customer_phone` varchar(50) NOT NULL,
	`items_count` int NOT NULL DEFAULT 1,
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('received','washing','ironing','ready','delivered') NOT NULL DEFAULT 'received',
	`payment_status` enum('paid','unpaid') NOT NULL DEFAULT 'unpaid',
	`garment_details` text,
	`date` date NOT NULL,
	`delivery_type` enum('pickup','delivery') NOT NULL DEFAULT 'pickup',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `laundry_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salon_appointments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`client_name` varchar(255) NOT NULL,
	`client_phone` varchar(50) NOT NULL,
	`service` varchar(255) NOT NULL,
	`stylist_name` varchar(255) NOT NULL,
	`time` varchar(50) NOT NULL,
	`status` enum('scheduled','in-service','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`price` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salon_appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `customer_type`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `whatsapp`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `building_number`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `street_name`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `district`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `postal_code`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `additional_number`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `vat_number`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `cr_number`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `contact_person`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `contact_title`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `opening_balance`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `opening_balance_date`;