CREATE TABLE `advances` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`date` date NOT NULL,
	`purpose` text,
	`status` enum('pending','approved','rejected','deducted') NOT NULL DEFAULT 'pending',
	`approved_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_maintenance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`asset_id` bigint unsigned NOT NULL,
	`maintenance_type` enum('preventive','corrective','predictive') NOT NULL DEFAULT 'preventive',
	`date` date NOT NULL,
	`description` text,
	`cost` decimal(18,4) NOT NULL DEFAULT '0',
	`performed_by` varchar(255),
	`next_due_date` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_maintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`asset_code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`location` varchar(255),
	`purchase_date` date,
	`purchase_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`salvage_value` decimal(18,4) NOT NULL DEFAULT '0',
	`useful_life` int DEFAULT 0,
	`depreciation_method` enum('straight_line','declining_balance','units_of_production') NOT NULL DEFAULT 'straight_line',
	`accumulated_depreciation` decimal(18,4) NOT NULL DEFAULT '0',
	`book_value` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('active','under_maintenance','disposed','sold') NOT NULL DEFAULT 'active',
	`assigned_to` bigint unsigned,
	`serial_number` varchar(255),
	`manufacturer` varchar(255),
	`model` varchar(255),
	`warranty_expiry` date,
	`image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`check_in` timestamp,
	`check_out` timestamp,
	`status` enum('present','absent','late','half_day','on_leave','holiday') NOT NULL DEFAULT 'present',
	`work_hours` decimal(5,2),
	`overtime_hours` decimal(5,2) NOT NULL DEFAULT '0',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`user_id` bigint unsigned,
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` bigint unsigned,
	`old_values` json,
	`new_values` json,
	`ip_address` varchar(100),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bill_of_materials` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`version` varchar(20) NOT NULL DEFAULT '1.0',
	`quantity` int DEFAULT 1,
	`labor_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`overhead_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`total_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bill_of_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bom_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`bom_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`quantity` decimal(18,4) NOT NULL,
	`unit_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`total_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`wastage_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bom_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`logo` text,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`fiscal_year_id` bigint unsigned NOT NULL,
	`account_id` bigint unsigned NOT NULL,
	`cost_center_id` bigint unsigned,
	`january` decimal(18,4) NOT NULL DEFAULT '0',
	`february` decimal(18,4) NOT NULL DEFAULT '0',
	`march` decimal(18,4) NOT NULL DEFAULT '0',
	`april` decimal(18,4) NOT NULL DEFAULT '0',
	`may` decimal(18,4) NOT NULL DEFAULT '0',
	`june` decimal(18,4) NOT NULL DEFAULT '0',
	`july` decimal(18,4) NOT NULL DEFAULT '0',
	`august` decimal(18,4) NOT NULL DEFAULT '0',
	`september` decimal(18,4) NOT NULL DEFAULT '0',
	`october` decimal(18,4) NOT NULL DEFAULT '0',
	`november` decimal(18,4) NOT NULL DEFAULT '0',
	`december` decimal(18,4) NOT NULL DEFAULT '0',
	`total` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashbox_transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`session_id` bigint unsigned,
	`transaction_number` varchar(50) NOT NULL,
	`transaction_type` enum('cash_in','cash_out','sale','purchase','expense','income','transfer','opening_balance','closing_balance','customer_payment','supplier_payment') NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`payment_method` enum('cash','card','transfer','cheque','wallet','other') NOT NULL DEFAULT 'cash',
	`reference_type` varchar(100),
	`reference_id` bigint unsigned,
	`description` text,
	`balance_before` decimal(18,4) NOT NULL DEFAULT '0',
	`balance_after` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'completed',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashbox_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chart_of_accounts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`account_type` enum('asset','liability','equity','revenue','expense','cost_of_sales') NOT NULL,
	`account_category` enum('current_asset','fixed_asset','current_liability','long_term_liability','equity','revenue','expense','cogs','other_income','other_expense') NOT NULL,
	`parent_id` bigint unsigned,
	`level` int DEFAULT 1,
	`is_bank_account` boolean DEFAULT false,
	`is_cash_account` boolean DEFAULT false,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`opening_balance` decimal(18,4) NOT NULL DEFAULT '0',
	`current_balance` decimal(18,4) NOT NULL DEFAULT '0',
	`bank_name` varchar(255),
	`bank_account_number` varchar(100),
	`bank_iban` varchar(100),
	`is_active` boolean DEFAULT true,
	`cost_center_enabled` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chart_of_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`company_name` varchar(255),
	`company_name_ar` varchar(255),
	`trade_name` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`mobile` varchar(50),
	`website` varchar(255),
	`address` text,
	`city` varchar(100),
	`country` varchar(100),
	`zip_code` varchar(20),
	`tax_number` varchar(100),
	`cr_number` varchar(100),
	`vat_rate` decimal(5,2) NOT NULL DEFAULT '15',
	`default_currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`fiscal_year_start` varchar(20) NOT NULL DEFAULT '01-01',
	`date_format` varchar(20) NOT NULL DEFAULT 'DD/MM/YYYY',
	`time_format` enum('12h','24h') NOT NULL DEFAULT '24h',
	`number_format` varchar(20) NOT NULL DEFAULT '#,##0.00',
	`invoice_prefix` varchar(20) NOT NULL DEFAULT 'INV-',
	`invoice_terms` text,
	`purchase_order_prefix` varchar(20) NOT NULL DEFAULT 'PO-',
	`sales_order_prefix` varchar(20) NOT NULL DEFAULT 'SO-',
	`quotation_prefix` varchar(20) NOT NULL DEFAULT 'QUO-',
	`theme` varchar(20) NOT NULL DEFAULT 'light',
	`primary_color` varchar(20) NOT NULL DEFAULT '#2563eb',
	`secondary_color` varchar(20) NOT NULL DEFAULT '#64748b',
	`logo` text,
	`favicon` text,
	`zatca_enabled` boolean DEFAULT false,
	`zatca_sandbox` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_settings_tenant_id_unique` UNIQUE(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `cost_centers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`budget_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cost_centers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_notes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`credit_note_number` varchar(50) NOT NULL,
	`invoice_id` bigint unsigned NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`reason` text,
	`status` enum('draft','applied','refunded') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_activities` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`activity_type` enum('call','email','meeting','task','note','whatsapp','sms') NOT NULL,
	`related_type` enum('lead','opportunity','customer','contact') NOT NULL,
	`related_id` bigint unsigned NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text,
	`due_date` timestamp,
	`completed_at` timestamp,
	`assigned_to` bigint unsigned,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`symbol` varchar(10),
	`exchange_rate` decimal(18,6) NOT NULL DEFAULT '1',
	`is_base` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `currencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`payment_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned,
	`date` date NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`payment_method` enum('cash','bank_transfer','cheque','card','online') NOT NULL,
	`bank_account_id` bigint unsigned,
	`reference` varchar(100),
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`mobile` varchar(50),
	`address` text,
	`city` varchar(100),
	`country` varchar(100) NOT NULL DEFAULT 'Saudi Arabia',
	`tax_number` varchar(100),
	`credit_limit` decimal(18,4) NOT NULL DEFAULT '0',
	`current_balance` decimal(18,4) NOT NULL DEFAULT '0',
	`payment_terms` int DEFAULT 30,
	`customer_group` varchar(100),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`manager_id` bigint unsigned,
	`parent_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `depreciation_entries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`asset_id` bigint unsigned NOT NULL,
	`period` varchar(20) NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`accumulated_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`book_value` decimal(18,4) NOT NULL DEFAULT '0',
	`journal_entry_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `depreciation_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `designations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`parent_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`category_id` bigint unsigned,
	`title` varchar(255) NOT NULL,
	`description` text,
	`file_name` varchar(255),
	`file_path` text,
	`file_size` bigint,
	`mime_type` varchar(100),
	`version` int DEFAULT 1,
	`related_type` varchar(50),
	`related_id` bigint unsigned,
	`uploaded_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned,
	`license_number` varchar(100),
	`license_type` varchar(50),
	`license_expiry` date,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_loans` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`loan_amount` decimal(18,4) NOT NULL,
	`installments` int DEFAULT 0,
	`installment_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`remaining_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`purpose` text,
	`status` enum('pending','approved','rejected','active','completed') NOT NULL DEFAULT 'pending',
	`approved_by` bigint unsigned,
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_code` varchar(50) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`mobile` varchar(50),
	`gender` enum('male','female'),
	`date_of_birth` date,
	`hire_date` date NOT NULL,
	`department_id` bigint unsigned,
	`designation_id` bigint unsigned,
	`manager_id` bigint unsigned,
	`employment_type` enum('full_time','part_time','contract','intern') NOT NULL DEFAULT 'full_time',
	`status` enum('active','on_leave','terminated','resigned','suspended') NOT NULL DEFAULT 'active',
	`basic_salary` decimal(18,4) NOT NULL DEFAULT '0',
	`housing_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`transport_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`other_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`bank_name` varchar(255),
	`bank_account` varchar(100),
	`bank_iban` varchar(100),
	`address` text,
	`emergency_contact` varchar(255),
	`emergency_phone` varchar(50),
	`photo` text,
	`passport_number` varchar(100),
	`national_id` varchar(100),
	`nationality` varchar(100),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fiscal_years` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`is_closed` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fiscal_years_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fuel_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`vehicle_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`odometer` int NOT NULL,
	`liters` decimal(10,2) NOT NULL,
	`cost_per_liter` decimal(10,4),
	`total_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`station` varchar(255),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fuel_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goods_received_notes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`grn_number` varchar(50) NOT NULL,
	`po_id` bigint unsigned,
	`supplier_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`status` enum('draft','posted','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goods_received_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grn_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`grn_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`po_item_id` bigint unsigned,
	`quantity` int NOT NULL,
	`unit_price` decimal(18,4) NOT NULL,
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`batch_number` varchar(100),
	`expiry_date` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grn_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installment_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`installment_id` bigint unsigned NOT NULL,
	`payment_number` varchar(50) NOT NULL,
	`due_date` date NOT NULL,
	`paid_date` date,
	`amount` decimal(18,4) NOT NULL,
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`late_fee` decimal(18,4) NOT NULL DEFAULT '0',
	`payment_method` enum('cash','card','transfer','cheque','wallet','other') DEFAULT 'cash',
	`status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `installment_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`installment_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`invoice_id` bigint unsigned,
	`total_amount` decimal(18,4) NOT NULL,
	`down_payment` decimal(18,4) NOT NULL DEFAULT '0',
	`financed_amount` decimal(18,4) NOT NULL,
	`number_of_installments` int NOT NULL,
	`installment_amount` decimal(18,4) NOT NULL,
	`installment_type` enum('weekly','biweekly','monthly','quarterly','custom') NOT NULL DEFAULT 'monthly',
	`interval_days` int DEFAULT 30,
	`start_date` date NOT NULL,
	`end_date` date,
	`total_paid` decimal(18,4) NOT NULL DEFAULT '0',
	`remaining_amount` decimal(18,4) NOT NULL,
	`status` enum('active','completed','defaulted','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `installments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_balances` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`quantity` int DEFAULT 0,
	`reserved_quantity` int DEFAULT 0,
	`avg_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`total_value` decimal(18,4) NOT NULL DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_balances_id` PRIMARY KEY(`id`),
	CONSTRAINT `inv_bal_unique` UNIQUE(`product_id`,`warehouse_id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`movement_type` enum('purchase','sale','adjustment','transfer_in','transfer_out','return_in','return_out','production_in','production_out','opening') NOT NULL,
	`quantity` int NOT NULL,
	`unit_cost` decimal(18,4),
	`total_cost` decimal(18,4),
	`reference` varchar(100),
	`reference_id` bigint unsigned,
	`batch_number` varchar(100),
	`serial_number` varchar(100),
	`expiry_date` date,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`invoice_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`description` text,
	`quantity` int NOT NULL,
	`unit_price` decimal(18,4) NOT NULL,
	`discount_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`tax_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`invoice_type` enum('standard','simplified','zatca') NOT NULL DEFAULT 'standard',
	`customer_id` bigint unsigned NOT NULL,
	`order_id` bigint unsigned,
	`date` date NOT NULL,
	`due_date` date,
	`sub_total` decimal(18,4) NOT NULL DEFAULT '0',
	`discount_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`shipping_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`paid_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`balance_due` decimal(18,4) NOT NULL DEFAULT '0',
	`zatca_qr_code` text,
	`zatca_xml` text,
	`zatca_status` enum('pending','reported','cleared'),
	`notes` text,
	`terms` text,
	`status` enum('draft','sent','paid','partial','overdue','cancelled','credit_note') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`entry_number` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`reference` varchar(100),
	`reference_type` enum('invoice','payment','adjustment','opening','closing','reversal','other') NOT NULL DEFAULT 'other',
	`description` text NOT NULL,
	`total_debit` decimal(18,4) NOT NULL,
	`total_credit` decimal(18,4) NOT NULL,
	`is_posted` boolean DEFAULT true,
	`is_reversed` boolean DEFAULT false,
	`reversed_entry_id` bigint unsigned,
	`cost_center_id` bigint unsigned,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entry_lines` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`journal_entry_id` bigint unsigned NOT NULL,
	`account_id` bigint unsigned NOT NULL,
	`debit` decimal(18,4) NOT NULL DEFAULT '0',
	`credit` decimal(18,4) NOT NULL DEFAULT '0',
	`description` text,
	`cost_center_id` bigint unsigned,
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`exchange_rate` decimal(18,6) NOT NULL DEFAULT '1',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journal_entry_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`mobile` varchar(50),
	`company` varchar(255),
	`job_title` varchar(255),
	`source` enum('website','referral','social_media','email','call','walk_in','other') NOT NULL DEFAULT 'other',
	`status` enum('new','contacted','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'new',
	`rating` enum('hot','warm','cold') NOT NULL DEFAULT 'warm',
	`estimated_value` decimal(18,4) NOT NULL DEFAULT '0',
	`assigned_to` bigint unsigned,
	`notes` text,
	`next_follow_up` timestamp,
	`is_converted` boolean DEFAULT false,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`leave_type_id` bigint unsigned NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`days` int NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`approved_by` bigint unsigned,
	`approved_at` timestamp,
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_types` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`days_allowed` int DEFAULT 0,
	`is_paid` boolean DEFAULT true,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leave_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`type` enum('info','warning','success','error') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`link` varchar(500),
	`is_read` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`lead_id` bigint unsigned,
	`customer_id` bigint unsigned,
	`stage` enum('prospecting','qualification','proposal','negotiation','closed_won','closed_lost') NOT NULL DEFAULT 'prospecting',
	`probability` int DEFAULT 0,
	`expected_value` decimal(18,4) NOT NULL DEFAULT '0',
	`expected_close_date` date,
	`actual_close_date` date,
	`assigned_to` bigint unsigned,
	`description` text,
	`lost_reason` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_periods` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`status` enum('draft','processing','completed','paid') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payroll_periods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_reviews` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`review_period` varchar(100) NOT NULL,
	`review_date` date NOT NULL,
	`overall_rating` int,
	`goals_achieved` int,
	`skills_rating` int,
	`attendance_rating` int,
	`teamwork_rating` int,
	`comments` text,
	`goals` text,
	`reviewed_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pos_holds` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`hold_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned,
	`items` json NOT NULL,
	`subtotal` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`discount_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`status` enum('held','resumed','cancelled') NOT NULL DEFAULT 'held',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pos_holds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pos_sessions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`branch_id` bigint unsigned,
	`status` enum('open','closed','paused') NOT NULL DEFAULT 'open',
	`opening_balance` decimal(18,4) NOT NULL DEFAULT '0',
	`closing_balance` decimal(18,4) NOT NULL DEFAULT '0',
	`total_sales` decimal(18,4) NOT NULL DEFAULT '0',
	`total_cash` decimal(18,4) NOT NULL DEFAULT '0',
	`total_card` decimal(18,4) NOT NULL DEFAULT '0',
	`total_transfer` decimal(18,4) NOT NULL DEFAULT '0',
	`opened_at` timestamp NOT NULL DEFAULT (now()),
	`closed_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pos_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `print_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('invoice_a4','receipt_80mm','receipt_58mm','quotation','delivery_note') NOT NULL,
	`content` text NOT NULL,
	`is_default` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `print_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`parent_id` bigint unsigned,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `production_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`production_order_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`quantity` int NOT NULL,
	`unit_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`total_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `production_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `production_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`po_number` varchar(50) NOT NULL,
	`work_order_id` bigint unsigned,
	`warehouse_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`total_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`status` enum('draft','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `production_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`sku` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`description` text,
	`category_id` bigint unsigned,
	`brand_id` bigint unsigned,
	`unit_id` bigint unsigned,
	`barcode` varchar(100),
	`qr_code` varchar(255),
	`product_type` enum('goods','service','raw_material','finished_good') NOT NULL DEFAULT 'goods',
	`purchase_price` decimal(18,4) NOT NULL DEFAULT '0',
	`sale_price` decimal(18,4) NOT NULL DEFAULT '0',
	`cost_method` enum('fifo','lifo','weighted_average') NOT NULL DEFAULT 'fifo',
	`reorder_level` int DEFAULT 0,
	`reorder_quantity` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`is_taxable` boolean DEFAULT true,
	`tax_rate` decimal(5,2) NOT NULL DEFAULT '15',
	`weight` decimal(10,4),
	`dimensions` varchar(100),
	`image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_milestones` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`due_date` date,
	`completed_at` timestamp,
	`deliverables` text,
	`status` enum('pending','completed','overdue') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned NOT NULL,
	`parent_id` bigint unsigned,
	`task_code` varchar(50),
	`name` varchar(255) NOT NULL,
	`description` text,
	`assigned_to` bigint unsigned,
	`start_date` date,
	`due_date` date,
	`completed_at` timestamp,
	`estimated_hours` decimal(8,2),
	`actual_hours` decimal(8,2) NOT NULL DEFAULT '0',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('todo','in_progress','review','done','cancelled') NOT NULL DEFAULT 'todo',
	`progress` int DEFAULT 0,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`project_code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`customer_id` bigint unsigned,
	`manager_id` bigint unsigned,
	`start_date` date,
	`end_date` date,
	`budget` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('planning','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
	`progress` int DEFAULT 0,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`po_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`description` text,
	`quantity` int NOT NULL,
	`received_qty` int DEFAULT 0,
	`unit_price` decimal(18,4) NOT NULL,
	`discount_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`tax_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchase_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`po_number` varchar(50) NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`expected_delivery` date,
	`sub_total` decimal(18,4) NOT NULL DEFAULT '0',
	`discount_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`shipping_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`terms` text,
	`status` enum('draft','sent','partial','received','cancelled','invoiced') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`permissions` json,
	`is_system` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salary_slips` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`payroll_period_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`basic_salary` decimal(18,4) NOT NULL DEFAULT '0',
	`housing_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`transport_allowance` decimal(18,4) NOT NULL DEFAULT '0',
	`other_allowances` decimal(18,4) NOT NULL DEFAULT '0',
	`overtime_pay` decimal(18,4) NOT NULL DEFAULT '0',
	`gross_salary` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_deduction` decimal(18,4) NOT NULL DEFAULT '0',
	`social_insurance` decimal(18,4) NOT NULL DEFAULT '0',
	`loan_deduction` decimal(18,4) NOT NULL DEFAULT '0',
	`advance_deduction` decimal(18,4) NOT NULL DEFAULT '0',
	`other_deductions` decimal(18,4) NOT NULL DEFAULT '0',
	`total_deductions` decimal(18,4) NOT NULL DEFAULT '0',
	`net_salary` decimal(18,4) NOT NULL DEFAULT '0',
	`status` enum('draft','approved','paid') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salary_slips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_order_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`description` text,
	`quantity` int NOT NULL,
	`delivered_qty` int DEFAULT 0,
	`unit_price` decimal(18,4) NOT NULL,
	`discount_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`tax_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`quotation_id` bigint unsigned,
	`date` date NOT NULL,
	`delivery_date` date,
	`sub_total` decimal(18,4) NOT NULL DEFAULT '0',
	`discount_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`shipping_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`status` enum('draft','confirmed','processing','shipped','delivered','cancelled','invoiced') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_quotation_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`quotation_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned,
	`description` text,
	`quantity` int NOT NULL,
	`unit_price` decimal(18,4) NOT NULL,
	`discount_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`tax_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_quotation_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_quotations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`quotation_number` varchar(50) NOT NULL,
	`customer_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`expiry_date` date,
	`sub_total` decimal(18,4) NOT NULL DEFAULT '0',
	`discount_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`discount_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`tax_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`tax_percent` decimal(5,2) NOT NULL DEFAULT '15',
	`shipping_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`total_amount` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`terms` text,
	`status` enum('draft','sent','accepted','rejected','expired','converted') NOT NULL DEFAULT 'draft',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_quotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_adjustment_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`adjustment_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`current_qty` int NOT NULL,
	`adjusted_qty` int NOT NULL,
	`difference` int NOT NULL,
	`unit_cost` decimal(18,4),
	`reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_adjustment_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_adjustments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`adjustment_number` varchar(50) NOT NULL,
	`warehouse_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`adjustment_type` enum('damage','expiry','theft','count','other') NOT NULL,
	`total_value` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_adjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_transfer_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`transfer_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`quantity` int NOT NULL,
	`unit_cost` decimal(18,4),
	`batch_number` varchar(100),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_transfer_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_transfers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`transfer_number` varchar(50) NOT NULL,
	`from_warehouse_id` bigint unsigned NOT NULL,
	`to_warehouse_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`status` enum('draft','pending','shipped','received','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`payment_number` varchar(50) NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`amount` decimal(18,4) NOT NULL,
	`payment_method` enum('cash','bank_transfer','cheque','card','online') NOT NULL,
	`bank_account_id` bigint unsigned,
	`reference` varchar(100),
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(50),
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`mobile` varchar(50),
	`address` text,
	`city` varchar(100),
	`country` varchar(100) NOT NULL DEFAULT 'Saudi Arabia',
	`tax_number` varchar(100),
	`credit_limit` decimal(18,4) NOT NULL DEFAULT '0',
	`current_balance` decimal(18,4) NOT NULL DEFAULT '0',
	`payment_terms` int DEFAULT 30,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`ticket_number` varchar(50) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100),
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','waiting','resolved','closed','escalated') NOT NULL DEFAULT 'open',
	`requester_name` varchar(255),
	`requester_email` varchar(320),
	`requester_phone` varchar(50),
	`assigned_to` bigint unsigned,
	`sla_deadline` timestamp,
	`resolved_at` timestamp,
	`closed_at` timestamp,
	`satisfaction` int,
	`source` enum('email','phone','web','chat','whatsapp') NOT NULL DEFAULT 'web',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_rates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`rate` decimal(5,2) NOT NULL,
	`type` enum('vat','gst','sales_tax','withholding','other') NOT NULL DEFAULT 'vat',
	`is_default` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`city` varchar(100),
	`country` varchar(100) NOT NULL DEFAULT 'Saudi Arabia',
	`tax_number` varchar(100),
	`registration_number` varchar(100),
	`logo` text,
	`favicon` text,
	`primary_color` varchar(20) NOT NULL DEFAULT '#2563eb',
	`secondary_color` varchar(20) NOT NULL DEFAULT '#64748b',
	`font` varchar(50) NOT NULL DEFAULT 'Inter',
	`timezone` varchar(50) NOT NULL DEFAULT 'Asia/Riyadh',
	`currency` varchar(10) NOT NULL DEFAULT 'SAR',
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`date_format` varchar(20) NOT NULL DEFAULT 'DD/MM/YYYY',
	`plan` enum('free','starter','professional','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','suspended','trial','cancelled') NOT NULL DEFAULT 'trial',
	`trial_ends_at` timestamp,
	`subscription_ends_at` timestamp,
	`white_label_enabled` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `ticket_comments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ticket_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned,
	`comment` text NOT NULL,
	`is_internal` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timesheets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`employee_id` bigint unsigned NOT NULL,
	`project_id` bigint unsigned,
	`task_id` bigint unsigned,
	`date` date NOT NULL,
	`hours` decimal(5,2) NOT NULL,
	`description` text,
	`billable` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timesheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`conversion_factor` decimal(18,6) NOT NULL DEFAULT '1',
	`base_unit_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`role_id` bigint unsigned NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned,
	`unionId` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role` enum('super_admin','admin','manager','accountant','salesman','cashier','hr','store_keeper','user') NOT NULL DEFAULT 'user',
	`phone` varchar(50),
	`is_active` boolean DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_unionId_unique` UNIQUE(`unionId`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_maintenance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`vehicle_id` bigint unsigned NOT NULL,
	`date` date NOT NULL,
	`maintenance_type` enum('routine','repair','inspection','tire_change','oil_change','other') NOT NULL DEFAULT 'routine',
	`description` text,
	`cost` decimal(18,4) NOT NULL DEFAULT '0',
	`service_provider` varchar(255),
	`next_service_date` date,
	`next_service_odometer` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vehicle_maintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`vehicle_number` varchar(50) NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int,
	`color` varchar(50),
	`plate_number` varchar(50),
	`vin` varchar(100),
	`engine_number` varchar(100),
	`vehicle_type` enum('car','truck','van','bus','bike','other') NOT NULL DEFAULT 'car',
	`fuel_type` enum('petrol','diesel','electric','hybrid') NOT NULL DEFAULT 'petrol',
	`purchase_date` date,
	`purchase_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`current_odometer` int DEFAULT 0,
	`status` enum('active','maintenance','retired','sold') NOT NULL DEFAULT 'active',
	`assigned_driver_id` bigint unsigned,
	`insurance_expiry` date,
	`registration_expiry` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`manager_name` varchar(255),
	`phone` varchar(50),
	`is_active` boolean DEFAULT true,
	`is_primary` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tenant_id` bigint unsigned NOT NULL,
	`wo_number` varchar(50) NOT NULL,
	`bom_id` bigint unsigned,
	`product_id` bigint unsigned NOT NULL,
	`quantity` int NOT NULL,
	`produced_qty` int DEFAULT 0,
	`start_date` date,
	`end_date` date,
	`estimated_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`actual_cost` decimal(18,4) NOT NULL DEFAULT '0',
	`notes` text,
	`status` enum('planned','in_progress','completed','cancelled') NOT NULL DEFAULT 'planned',
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `coa_tenant_idx` ON `chart_of_accounts` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `coa_code_idx` ON `chart_of_accounts` (`code`);--> statement-breakpoint
CREATE INDEX `je_tenant_idx` ON `journal_entries` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `je_date_idx` ON `journal_entries` (`date`);--> statement-breakpoint
CREATE INDEX `prod_tenant_idx` ON `products` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `prod_sku_idx` ON `products` (`sku`);