-- Industry Vertical Packs: Healthcare, Education, Hotel, Construction, Transport, Real Estate, Travel, Aviation
-- Extends core schema with vertical-specific tables for YASCO ERP

-- =====================================================
-- 40. HEALTHCARE VERTICAL
-- =====================================================
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
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
CREATE INDEX `patients_tenant_idx` ON `patients` (`tenant_id`);
CREATE INDEX `patients_phone_idx` ON `patients` (`phone`);

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
CREATE INDEX `appointments_tenant_idx` ON `appointments` (`tenant_id`);
CREATE INDEX `appointments_date_idx` ON `appointments` (`tenant_id`, `appointment_date`);
CREATE INDEX `appointments_patient_idx` ON `appointments` (`patient_id`);

CREATE TABLE `doctor_rosters` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `specialization` varchar(255),
  `license_number` varchar(100),
  `consultation_fee` decimal(18,4) NOT NULL DEFAULT '0',
  `max_patients_per_day` int NOT NULL DEFAULT 20,
  `working_days` json,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `doctor_rosters_id` PRIMARY KEY(`id`)
);
CREATE INDEX `doctor_rosters_tenant_idx` ON `doctor_rosters` (`tenant_id`);

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
CREATE INDEX `insurance_claims_hc_tenant_idx` ON `insurance_claims_healthcare` (`tenant_id`);

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
CREATE INDEX `lab_orders_tenant_idx` ON `lab_orders` (`tenant_id`);

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
  `refills` int NOT NULL DEFAULT 0,
  `status` enum('prescribed','dispensed','partial','cancelled') NOT NULL DEFAULT 'prescribed',
  `prescribed_by` bigint unsigned,
  `dispensed_at` timestamp,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `pharmacy_integration_id` PRIMARY KEY(`id`)
);
CREATE INDEX `pharmacy_integration_tenant_idx` ON `pharmacy_integration` (`tenant_id`);

-- =====================================================
-- 41. EDUCATION VERTICAL
-- =====================================================
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
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
CREATE INDEX `students_tenant_idx` ON `students` (`tenant_id`);

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
CREATE INDEX `admissions_tenant_idx` ON `admissions` (`tenant_id`);

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
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `fee_structures_id` PRIMARY KEY(`id`)
);
CREATE INDEX `fee_structures_tenant_idx` ON `fee_structures` (`tenant_id`);

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
CREATE INDEX `student_fee_invoices_tenant_idx` ON `student_fee_invoices` (`tenant_id`);

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
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `class_timetables_id` PRIMARY KEY(`id`)
);
CREATE INDEX `class_timetables_tenant_idx` ON `class_timetables` (`tenant_id`);

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
CREATE INDEX `student_attendance_tenant_idx` ON `student_attendance` (`tenant_id`);
CREATE INDEX `student_attendance_student_idx` ON `student_attendance` (`student_id`);
CREATE INDEX `student_attendance_date_idx` ON `student_attendance` (`tenant_id`, `date`);

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
CREATE INDEX `report_cards_tenant_idx` ON `report_cards` (`tenant_id`);
CREATE INDEX `report_cards_student_idx` ON `report_cards` (`student_id`);

-- =====================================================
-- 42. HOTEL VERTICAL
-- =====================================================
CREATE TABLE `room_types` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255),
  `description` text,
  `base_price` decimal(18,4) NOT NULL,
  `max_occupancy` int NOT NULL DEFAULT 2,
  `number_of_rooms` int NOT NULL DEFAULT 1,
  `amenities` json,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `room_types_id` PRIMARY KEY(`id`)
);
CREATE INDEX `room_types_tenant_idx` ON `room_types` (`tenant_id`);

CREATE TABLE `room_inventory` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `room_type_id` bigint unsigned NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `floor` varchar(50),
  `status` enum('available','occupied','maintenance','reserved','cleaning') NOT NULL DEFAULT 'available',
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `room_inventory_id` PRIMARY KEY(`id`)
);
CREATE INDEX `room_inventory_tenant_idx` ON `room_inventory` (`tenant_id`);
CREATE INDEX `room_inventory_type_idx` ON `room_inventory` (`room_type_id`);

CREATE TABLE `hotel_bookings` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `booking_number` varchar(50) NOT NULL,
  `customer_id` bigint unsigned,
  `room_type_id` bigint unsigned NOT NULL,
  `room_id` bigint unsigned,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `adults` int NOT NULL DEFAULT 1,
  `children` int NOT NULL DEFAULT 0,
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
CREATE INDEX `hotel_bookings_tenant_idx` ON `hotel_bookings` (`tenant_id`);
CREATE INDEX `hotel_bookings_dates_idx` ON `hotel_bookings` (`tenant_id`, `check_in`, `check_out`);
CREATE INDEX `hotel_bookings_source_idx` ON `hotel_bookings` (`source`);

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
CREATE INDEX `booking_calendar_tenant_idx` ON `booking_calendar` (`tenant_id`);
CREATE INDEX `booking_calendar_room_date_idx` ON `booking_calendar` (`room_id`, `date`);

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
CREATE INDEX `housekeeping_tenant_idx` ON `housekeeping_schedule` (`tenant_id`);
CREATE INDEX `housekeeping_date_idx` ON `housekeeping_schedule` (`tenant_id`, `date`);

CREATE TABLE `folio_charges` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `booking_id` bigint unsigned NOT NULL,
  `charge_type` enum('room','restaurant','minibar','laundry','spa','transport','other') NOT NULL DEFAULT 'other',
  `description` varchar(255) NOT NULL,
  `amount` decimal(18,4) NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `total_amount` decimal(18,4) NOT NULL,
  `charge_date` date NOT NULL,
  `posted_to_invoice` boolean NOT NULL DEFAULT false,
  `invoice_id` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `folio_charges_id` PRIMARY KEY(`id`)
);
CREATE INDEX `folio_charges_tenant_idx` ON `folio_charges` (`tenant_id`);
CREATE INDEX `folio_charges_booking_idx` ON `folio_charges` (`booking_id`);

-- =====================================================
-- 43. CONSTRUCTION VERTICAL
-- =====================================================
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
  `progress` int NOT NULL DEFAULT 0,
  `status` enum('planning','tendering','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
  `project_type` enum('residential','commercial','industrial','infrastructure','renovation') NOT NULL DEFAULT 'residential',
  `created_by` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `construction_projects_id` PRIMARY KEY(`id`)
);
CREATE INDEX `construction_projects_tenant_idx` ON `construction_projects` (`tenant_id`);

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
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `subcontractors_id` PRIMARY KEY(`id`)
);
CREATE INDEX `subcontractors_tenant_idx` ON `subcontractors` (`tenant_id`);

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
CREATE INDEX `equipment_tracking_tenant_idx` ON `equipment_tracking` (`tenant_id`);

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
CREATE INDEX `progress_billing_tenant_idx` ON `progress_billing` (`tenant_id`);

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
CREATE INDEX `retention_accounts_tenant_idx` ON `retention_accounts` (`tenant_id`);

-- =====================================================
-- 44. TRANSPORT / LOGISTICS VERTICAL
-- =====================================================
CREATE TABLE `routes` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `route_code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `origin` varchar(255) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `distance_km` decimal(10,2),
  `estimated_duration` varchar(50),
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
CREATE INDEX `routes_tenant_idx` ON `routes` (`tenant_id`);

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
CREATE INDEX `route_planning_tenant_idx` ON `route_planning` (`tenant_id`);

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
CREATE INDEX `driver_schedules_tenant_idx` ON `driver_schedules` (`tenant_id`);

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
CREATE INDEX `shipment_tracking_tenant_idx` ON `shipment_tracking` (`tenant_id`);
CREATE INDEX `shipment_tracking_tracking_idx` ON `shipment_tracking` (`tracking_number`);
CREATE INDEX `shipment_tracking_status_idx` ON `shipment_tracking` (`tenant_id`, `status`);

CREATE TABLE `fuel_cost_analytics` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `vehicle_id` bigint unsigned NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `total_liters` decimal(12,2) NOT NULL DEFAULT '0',
  `total_cost` decimal(18,4) NOT NULL DEFAULT '0',
  `distance_covered` int NOT NULL DEFAULT 0,
  `km_per_liter` decimal(8,2),
  `cost_per_km` decimal(10,4),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `fuel_cost_analytics_id` PRIMARY KEY(`id`)
);
CREATE INDEX `fuel_cost_analytics_tenant_idx` ON `fuel_cost_analytics` (`tenant_id`);

-- =====================================================
-- 45. REAL ESTATE VERTICAL
-- =====================================================
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
  `area_unit` varchar(20) NOT NULL DEFAULT 'sqm',
  `purchase_date` date,
  `purchase_cost` decimal(18,4) NOT NULL DEFAULT '0',
  `current_value` decimal(18,4) NOT NULL DEFAULT '0',
  `property_tax` decimal(18,4) NOT NULL DEFAULT '0',
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
CREATE INDEX `properties_tenant_idx` ON `properties` (`tenant_id`);

CREATE TABLE `property_units` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `property_id` bigint unsigned NOT NULL,
  `unit_number` varchar(50) NOT NULL,
  `floor` varchar(50),
  `bedrooms` int NOT NULL DEFAULT 0,
  `bathrooms` int NOT NULL DEFAULT 0,
  `area_size` decimal(12,2),
  `monthly_rent` decimal(18,4) NOT NULL DEFAULT '0',
  `security_deposit` decimal(18,4) NOT NULL DEFAULT '0',
  `status` enum('vacant','occupied','maintenance','reserved') NOT NULL DEFAULT 'vacant',
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `property_units_id` PRIMARY KEY(`id`)
);
CREATE INDEX `property_units_tenant_idx` ON `property_units` (`tenant_id`);
CREATE INDEX `property_units_property_idx` ON `property_units` (`property_id`);

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
  `rent_due_day` int NOT NULL DEFAULT 1,
  `lease_type` enum('residential','commercial','short_term','long_term') NOT NULL DEFAULT 'residential',
  `status` enum('draft','active','expired','terminated','renewed') NOT NULL DEFAULT 'draft',
  `renewal_count` int NOT NULL DEFAULT 0,
  `notes` text,
  `created_by` bigint unsigned,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `leases_id` PRIMARY KEY(`id`)
);
CREATE INDEX `leases_tenant_idx` ON `leases` (`tenant_id`);
CREATE INDEX `leases_unit_idx` ON `leases` (`unit_id`);

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
CREATE INDEX `rent_invoices_tenant_idx` ON `rent_invoices` (`tenant_id`);
CREATE INDEX `rent_invoices_lease_idx` ON `rent_invoices` (`lease_id`);
CREATE INDEX `rent_invoices_status_idx` ON `rent_invoices` (`tenant_id`, `status`);

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
CREATE INDEX `maintenance_requests_tenant_idx` ON `maintenance_requests` (`tenant_id`);
CREATE INDEX `maintenance_requests_status_idx` ON `maintenance_requests` (`tenant_id`, `status`);

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
CREATE INDEX `commission_records_tenant_idx` ON `commission_records` (`tenant_id`);

-- =====================================================
-- 46. TRAVEL AGENCY VERTICAL
-- =====================================================
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
CREATE INDEX `travel_bookings_tenant_idx` ON `travel_bookings` (`tenant_id`);
CREATE INDEX `travel_bookings_type_idx` ON `travel_bookings` (`booking_type`);

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
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `travel_suppliers_id` PRIMARY KEY(`id`)
);
CREATE INDEX `travel_suppliers_tenant_idx` ON `travel_suppliers` (`tenant_id`);

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
CREATE INDEX `itineraries_tenant_idx` ON `itineraries` (`tenant_id`);
CREATE INDEX `itineraries_booking_idx` ON `itineraries` (`booking_id`);

CREATE TABLE `supplier_reconciliation` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `supplier_id` bigint unsigned NOT NULL,
  `reconciliation_number` varchar(50) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `total_bookings` int NOT NULL DEFAULT 0,
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
CREATE INDEX `supplier_reconciliation_tenant_idx` ON `supplier_reconciliation` (`tenant_id`);

-- =====================================================
-- 47. AVIATION VERTICAL
-- =====================================================
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
  `total_seats` int NOT NULL DEFAULT 0,
  `booked_seats` int NOT NULL DEFAULT 0,
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
CREATE INDEX `flights_tenant_idx` ON `flights` (`tenant_id`);
CREATE INDEX `flights_departure_idx` ON `flights` (`tenant_id`, `departure_time`);
CREATE INDEX `flights_route_idx` ON `flights` (`origin`, `destination`);

CREATE TABLE `crew_certifications` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `employee_id` bigint unsigned NOT NULL,
  `certification_type` varchar(255) NOT NULL,
  `certification_number` varchar(100),
  `issued_by` varchar(255),
  `issue_date` date,
  `expiry_date` date,
  `is_active` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `crew_certifications_id` PRIMARY KEY(`id`)
);
CREATE INDEX `crew_certifications_tenant_idx` ON `crew_certifications` (`tenant_id`);
CREATE INDEX `crew_certifications_emp_idx` ON `crew_certifications` (`employee_id`);

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
  `is_airworthy` boolean NOT NULL DEFAULT true,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `maintenance_airworthiness_id` PRIMARY KEY(`id`)
);
CREATE INDEX `maintenance_airworthiness_tenant_idx` ON `maintenance_airworthiness` (`tenant_id`);

CREATE TABLE `parts_inventory_serial` (
  `id` serial AUTO_INCREMENT NOT NULL,
  `tenant_id` bigint unsigned NOT NULL,
  `part_number` varchar(100) NOT NULL,
  `part_name` varchar(255) NOT NULL,
  `serial_number` varchar(100) NOT NULL,
  `manufacturer` varchar(255),
  `quantity` int NOT NULL DEFAULT 1,
  `condition` enum('new','serviceable','overhauled','unserviceable','scrap') NOT NULL DEFAULT 'new',
  `location` varchar(255),
  `shelf_life` date,
  `installation_date` date,
  `installed_on_aircraft` varchar(50),
  `removal_date` date,
  `tsn` int NOT NULL DEFAULT 0,
  `csi` int NOT NULL DEFAULT 0,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `parts_inventory_serial_id` PRIMARY KEY(`id`),
  CONSTRAINT `parts_inventory_serial_unique` UNIQUE(`serial_number`)
);
CREATE INDEX `parts_inventory_serial_tenant_idx` ON `parts_inventory_serial` (`tenant_id`);
CREATE INDEX `parts_inventory_serial_part_idx` ON `parts_inventory_serial` (`part_number`);
