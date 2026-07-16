ALTER TABLE `invoices` ADD CONSTRAINT `inv_num_idx` UNIQUE(`tenant_id`,`invoice_number`);--> statement-breakpoint
CREATE INDEX `inv_tenant_idx` ON `invoices` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `inv_date_idx` ON `invoices` (`date`);