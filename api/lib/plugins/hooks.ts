import { pluginRegistry, type HookHandler } from "./pluginRegistry";

/**
 * Hook definitions for the YASCO ERP plugin system.
 *
 * Hook points allow plugins to intercept and extend core CRUD operations.
 * Each hook receives a context object with the relevant data and can
 * modify it, log it, or trigger side effects.
 *
 * Error handling: One plugin failure does NOT affect other plugins.
 * Each handler is wrapped in try/catch and errors are collected.
 */

export type HookName =
  | "before_create_invoice"
  | "after_create_invoice"
  | "before_update_invoice"
  | "after_update_invoice"
  | "before_create_lead"
  | "after_create_lead"
  | "before_create_customer"
  | "after_create_customer"
  | "before_create_purchase_order"
  | "after_create_purchase_order"
  | "before_create_inventory_movement"
  | "after_create_inventory_movement"
  | "before_sync"
  | "after_sync"
  | "before_generate_report"
  | "after_generate_report"
  | "before_send_notification"
  | "after_send_notification";

export const HOOK_DEFINITIONS: { name: HookName; description: string; contextExample: Record<string, string> }[] = [
  { name: "before_create_invoice", description: "Before an invoice is created", contextExample: { invoiceData: "Invoice object", tenantId: "number" } },
  { name: "after_create_invoice", description: "After an invoice is created", contextExample: { invoice: "Created invoice", tenantId: "number" } },
  { name: "before_update_invoice", description: "Before an invoice is updated", contextExample: { invoiceId: "number", changes: "Partial invoice object" } },
  { name: "after_update_invoice", description: "After an invoice is updated", contextExample: { invoice: "Updated invoice" } },
  { name: "before_create_lead", description: "Before a lead is created", contextExample: { leadData: "Lead object" } },
  { name: "after_create_lead", description: "After a lead is created", contextExample: { lead: "Created lead" } },
  { name: "before_create_customer", description: "Before a customer is created", contextExample: { customerData: "Customer object" } },
  { name: "after_create_customer", description: "After a customer is created", contextExample: { customer: "Created customer" } },
  { name: "before_create_purchase_order", description: "Before a purchase order is created", contextExample: { poData: "PurchaseOrder object" } },
  { name: "after_create_purchase_order", description: "After a purchase order is created", contextExample: { po: "Created purchase order" } },
  { name: "before_create_inventory_movement", description: "Before inventory movement is recorded", contextExample: { movementData: "Movement object" } },
  { name: "after_create_inventory_movement", description: "After inventory movement is recorded", contextExample: { movement: "Created movement" } },
  { name: "before_sync", description: "Before data sync operation", contextExample: { syncType: "push|pull", entities: "string[]" } },
  { name: "after_sync", description: "After data sync operation", contextExample: { syncResult: "Sync result", syncedEntities: "number" } },
  { name: "before_generate_report", description: "Before a report is generated", contextExample: { reportType: "string", params: "object" } },
  { name: "after_generate_report", description: "After a report is generated", contextExample: { report: "Report data" } },
  { name: "before_send_notification", description: "Before a notification is sent", contextExample: { channel: "string", recipient: "string", message: "object" } },
  { name: "after_send_notification", description: "After a notification is sent", contextExample: { result: "SendResult" } },
];

export function registerPluginHook(pluginName: string, hook: HookName, handler: (context: any) => Promise<any>, priority = 100) {
  const hookHandler: HookHandler = { hook, handler, priority, pluginName };
  pluginRegistry.registerHook(hook, hookHandler);
}

export async function executeHooks(name: HookName, context: any): Promise<any[]> {
  return pluginRegistry.executeHook(name, context);
}

export function getHookDescriptions() {
  return HOOK_DEFINITIONS;
}
