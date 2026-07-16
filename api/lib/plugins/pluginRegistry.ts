export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  hooks: string[];
  permissions: string[];
  icon?: string;
  homepage?: string;
  configSchema?: Record<string, any>;
}

export interface PluginInstance {
  id: number;
  tenantId: number;
  manifest: PluginManifest;
  isEnabled: boolean;
  config: Record<string, any>;
  installedAt: string;
}

export interface HookHandler {
  hook: string;
  handler: (context: any) => Promise<any>;
  priority: number;
  pluginName: string;
}

const PLUGIN_STORE: PluginManifest[] = [
  {
    name: "zatca-enhanced", version: "1.0.0",
    description: "Enhanced ZATCA e-invoicing with real-time clearance",
    author: "YASCO", icon: "receipt",
    hooks: ["before_create_invoice", "after_create_invoice"],
    permissions: ["invoices:read", "invoices:write"],
    configSchema: { sandbox: { type: "boolean", default: true }, autoClear: { type: "boolean", default: false } },
  },
  {
    name: "crm-whatsapp", version: "1.0.0",
    description: "WhatsApp Business integration for CRM activities",
    author: "YASCO", icon: "message-circle",
    hooks: ["after_create_lead", "before_sync"],
    permissions: ["crm:read", "crm:write", "notifications:send"],
    configSchema: { webhookUrl: { type: "string" }, autoReply: { type: "boolean", default: false } },
  },
  {
    name: "bi-reports", version: "1.0.0",
    description: "Advanced BI dashboards with Power BI/Tableau export",
    author: "YASCO", icon: "bar-chart-3",
    hooks: ["after_sync", "before_generate_report"],
    permissions: ["reports:read", "data:export"],
  },
  {
    name: "inventory-barcode", version: "1.0.0",
    description: "Barcode/QR scanning for inventory operations",
    author: "YASCO", icon: "scan",
    hooks: ["before_create_inventory_movement", "after_create_inventory_movement"],
    permissions: ["inventory:read", "inventory:write"],
  },
  {
    name: "payment-gateway", version: "1.0.0",
    description: "Online payment gateway (Mada, STC Pay, Apple Pay)",
    author: "YASCO", icon: "credit-card",
    hooks: ["after_create_invoice"],
    permissions: ["invoices:read", "payments:write"],
    configSchema: { provider: { type: "string", enum: ["mada", "stcpay", "applepay", "tap"] }, merchantId: { type: "string" } },
  },
  {
    name: "sms-notify", version: "1.0.0",
    description: "SMS notifications via local Saudi providers",
    author: "YASCO", icon: "message-square",
    hooks: ["after_create_invoice", "after_create_lead"],
    permissions: ["notifications:send"],
  },
];

class PluginRegistry {
  private installed: Map<string, PluginManifest> = new Map();
  private hooks: Map<string, HookHandler[]> = new Map();

  getStore(): PluginManifest[] {
    return PLUGIN_STORE;
  }

  getFromStore(name: string): PluginManifest | undefined {
    return PLUGIN_STORE.find(p => p.name === name);
  }

  register(manifest: PluginManifest) {
    this.installed.set(manifest.name, manifest);
  }

  unregister(name: string) {
    this.installed.delete(name);
    this.hooks.forEach((handlers, hook) => {
      this.hooks.set(hook, handlers.filter(h => h.pluginName !== name));
    });
  }

  getInstalled(): PluginManifest[] {
    return Array.from(this.installed.values());
  }

  isInstalled(name: string): boolean {
    return this.installed.has(name);
  }

  registerHook(name: string, handler: HookHandler) {
    const existing = this.hooks.get(name) || [];
    existing.push(handler);
    existing.sort((a, b) => a.priority - b.priority);
    this.hooks.set(name, existing);
  }

  getHookHandlers(name: string): HookHandler[] {
    return this.hooks.get(name) || [];
  }

  async executeHook(name: string, context: any): Promise<any[]> {
    const handlers = this.getHookHandlers(name);
    const results: any[] = [];
    for (const handler of handlers) {
      try {
        const result = await handler.handler(context);
        results.push({ plugin: handler.pluginName, success: true, result });
      } catch (err: any) {
        results.push({ plugin: handler.pluginName, success: false, error: err.message });
      }
    }
    return results;
  }

  reset() {
    this.installed.clear();
    this.hooks.clear();
  }
}

export const pluginRegistry = new PluginRegistry();
