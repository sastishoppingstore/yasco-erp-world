import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  auditLogs,
  companySettings,
  invoices,
  moduleRegistry,
  products,
  customers,
  suppliers,
  employees,
  supportTickets,
  projects,
  billOfMaterials,
  workOrders,
  taxRates,
} from "@db/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";

type Status = "complete" | "partial" | "missing";

type Capability = {
  key: string;
  name: string;
  category: string;
  status: Status;
  route?: string;
  note: string;
  priority: "critical" | "high" | "medium";
};

const competitorCoverage: Capability[] = [
  { key: "accounting", name: "Accounting and finance", category: "Core ERP", status: "partial", route: "/app/accounting", note: "COA, journals, ledger and trial balance exist; bank reconciliation, assets and consolidated close need more depth.", priority: "critical" },
  { key: "sales", name: "Sales, invoices and customers", category: "Core ERP", status: "partial", route: "/app/sales", note: "Quotes/orders/invoices/customers exist; commissions, territories, delivery notes and forecasting need completion.", priority: "critical" },
  { key: "saudi-zatca", name: "Saudi VAT and ZATCA billing", category: "Saudi Market", status: "partial", route: "/app/sales/invoices", note: "Saudi VAT, VAT-number validation, TLV QR, local QR rendering and XML archive readiness exist; certified clearance/reporting connector is not live.", priority: "critical" },
  { key: "pos", name: "SAHL-style POS", category: "Retail", status: "partial", route: "/app/pos", note: "POS sales, sessions, hold/resume and cashbox paths exist; device integrations and offline sync need hardening.", priority: "critical" },
  { key: "inventory", name: "Inventory and warehouse", category: "Supply Chain", status: "partial", route: "/app/inventory", note: "Products, stock, movements, warehouses and transfers exist; bins, cycle count, serial/batch depth and valuation reports need completion.", priority: "critical" },
  { key: "purchase", name: "Purchase and suppliers", category: "Supply Chain", status: "partial", route: "/app/purchase", note: "Suppliers, POs, GRN and payments exist; RFQ, comparison, vendor rating and landed cost need completion.", priority: "high" },
  { key: "crm", name: "CRM", category: "Growth", status: "partial", route: "/app/crm", note: "Leads, opportunities and activities exist; automation, scoring, campaigns and territory workflows need completion.", priority: "high" },
  { key: "hr-payroll", name: "HR and payroll", category: "People", status: "partial", route: "/app/hrm", note: "Employees, attendance, leave, payroll and performance exist; Saudi labor/GOSI/WPS rules need production depth.", priority: "high" },
  { key: "manufacturing", name: "Manufacturing and MRP", category: "Operations", status: "partial", route: "/app/manufacturing", note: "BOM, work orders and production exist; routing, MRP, shop floor, quality and costing need completion.", priority: "high" },
  { key: "projects", name: "Projects and timesheets", category: "Services", status: "partial", route: "/app/projects", note: "Projects, tasks and timesheets exist; Gantt, resource planning, project billing and SLA depth need completion.", priority: "medium" },
  { key: "helpdesk", name: "Helpdesk", category: "Service", status: "partial", route: "/app/helpdesk/tickets", note: "Ticketing exists; email-to-ticket, WhatsApp-to-ticket, SLA escalations and CSAT need completion.", priority: "medium" },
  { key: "ecommerce", name: "Ecommerce and website builder", category: "Digital", status: "missing", note: "Public website exists, but operational catalog/cart/checkout/payment/shipping are not complete.", priority: "high" },
  { key: "marketing", name: "Marketing automation", category: "Growth", status: "missing", note: "Public cards exist, but campaign engine, segments, consent, UTM and analytics are not implemented.", priority: "medium" },
  { key: "documents", name: "Documents and digital signature", category: "Governance", status: "partial", note: "Document schema exists; UI, permissions, versioning, sharing and e-sign workflows need completion.", priority: "medium" },
  { key: "workflows", name: "Workflow approvals", category: "Governance", status: "partial", note: "Approval schema exists; runtime engine and module hooks need completion.", priority: "high" },
  { key: "rbac", name: "Roles and permissions", category: "Security", status: "partial", note: "Roles schema and route guards exist; per-module/per-action permission enforcement needs completion.", priority: "critical" },
  { key: "api-webhooks", name: "API and webhooks", category: "Platform", status: "partial", note: "Webhook schema exists; developer keys, event dispatcher, retries and portal docs need completion.", priority: "high" },
  { key: "saas-billing", name: "SaaS billing and plans", category: "Platform", status: "partial", note: "Tenant plan fields exist; subscription billing, limits, upgrades and payment gateway need completion.", priority: "high" },
  { key: "mobile-offline", name: "Mobile app and offline sync", category: "Platform", status: "missing", note: "Responsive UI exists; native app/offline sync engine is not implemented.", priority: "medium" },
  { key: "observability", name: "Launch observability and scale", category: "DevOps", status: "partial", note: "Rate limiter and build split exist; Redis, queues, metrics, tracing, load tests and CDN deployment must be added.", priority: "critical" },
];

function isValidSaudiVatNumber(vatNumber?: string | null) {
  return /^3\d{13}3$/.test((vatNumber || "").replace(/\D/g, ""));
}

function readinessScore(items: Array<{ status: Status }>) {
  const weighted = items.reduce((sum, item) => {
    if (item.status === "complete") return sum + 1;
    if (item.status === "partial") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((weighted / Math.max(items.length, 1)) * 100);
}

export const masterRouter = createRouter({
  competitionCoverage: authedQuery.query(() => {
    const complete = competitorCoverage.filter((item) => item.status === "complete").length;
    const partial = competitorCoverage.filter((item) => item.status === "partial").length;
    const missing = competitorCoverage.filter((item) => item.status === "missing").length;
    return {
      score: readinessScore(competitorCoverage),
      summary: { complete, partial, missing, total: competitorCoverage.length },
      items: competitorCoverage,
    };
  }),

  saudiReadiness: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const settings = await db.query.companySettings.findFirst({
      where: eq(companySettings.tenantId, tenantId),
    });
    const [zatcaInvoices] = await db.select({ value: count() })
      .from(invoices)
      .where(and(eq(invoices.tenantId, tenantId), eq(invoices.invoiceType, "zatca")));
    const [defaultVatRates] = await db.select({ value: count() })
      .from(taxRates)
      .where(and(eq(taxRates.tenantId, tenantId), eq(taxRates.rate, "15"), eq(taxRates.type, "vat")));

    const checks = [
      { key: "company-name", label: "Company English/Arabic name saved", status: settings?.companyName || settings?.companyNameAr ? "complete" : "missing", detail: "Required for Saudi invoice seller identity." },
      { key: "country-currency", label: "Saudi country and SAR currency", status: settings?.defaultCurrency === "SAR" && (settings.country || "").toLowerCase().includes("saudi") ? "complete" : "partial", detail: "Use Saudi Arabia + SAR for Saudi tenants and branches." },
      { key: "vat-number", label: "Saudi VAT number format", status: isValidSaudiVatNumber(settings?.taxNumber) ? "complete" : "missing", detail: "VAT number must be 15 digits, starts with 3 and ends with 3." },
      { key: "cr-number", label: "Commercial registration number", status: settings?.crNumber ? "complete" : "missing", detail: "CR appears on Saudi business invoices and company profile." },
      { key: "zatca-enabled", label: "ZATCA readiness enabled", status: settings?.zatcaEnabled ? "complete" : "partial", detail: "Enables Saudi QR/XML readiness workflow." },
      { key: "vat-rate", label: "Saudi VAT 15%", status: Number(settings?.vatRate || 0) === 15 || defaultVatRates.value > 0 ? "complete" : "missing", detail: "Default VAT should be 15% for standard Saudi VAT invoices." },
      { key: "invoice-history", label: "ZATCA invoice workflow tested", status: zatcaInvoices.value > 0 ? "complete" : "partial", detail: "Create at least one ZATCA test invoice and verify QR scan." },
      { key: "certified-connector", label: "ZATCA Phase 2 certified connector", status: "missing", detail: "Clearance/reporting connector, CSID certificates, hash chain and cryptographic stamp are not live yet." },
    ] as Array<{ key: string; label: string; status: Status; detail: string }>;

    return {
      score: readinessScore(checks),
      checks,
      blockers: checks.filter((check) => check.status === "missing"),
      invoiceCount: zatcaInvoices.value,
    };
  }),

  systemSnapshot: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [
      productCount,
      customerCount,
      supplierCount,
      employeeCount,
      ticketCount,
      projectCount,
      bomCount,
      workOrderCount,
      moduleCount,
      auditCount,
    ] = await Promise.all([
      db.select({ value: count() }).from(products).where(eq(products.tenantId, tenantId)),
      db.select({ value: count() }).from(customers).where(eq(customers.tenantId, tenantId)),
      db.select({ value: count() }).from(suppliers).where(eq(suppliers.tenantId, tenantId)),
      db.select({ value: count() }).from(employees).where(eq(employees.tenantId, tenantId)),
      db.select({ value: count() }).from(supportTickets).where(eq(supportTickets.tenantId, tenantId)),
      db.select({ value: count() }).from(projects).where(eq(projects.tenantId, tenantId)),
      db.select({ value: count() }).from(billOfMaterials).where(eq(billOfMaterials.tenantId, tenantId)),
      db.select({ value: count() }).from(workOrders).where(eq(workOrders.tenantId, tenantId)),
      db.select({ value: count() }).from(moduleRegistry),
      db.select({ value: count() }).from(auditLogs).where(eq(auditLogs.tenantId, tenantId)),
    ]);

    const recentAudit = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.tenantId, tenantId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(8);

    return {
      counts: {
        products: productCount[0]?.value ?? 0,
        customers: customerCount[0]?.value ?? 0,
        suppliers: supplierCount[0]?.value ?? 0,
        employees: employeeCount[0]?.value ?? 0,
        tickets: ticketCount[0]?.value ?? 0,
        projects: projectCount[0]?.value ?? 0,
        boms: bomCount[0]?.value ?? 0,
        workOrders: workOrderCount[0]?.value ?? 0,
        publicModules: moduleCount[0]?.value ?? 0,
        auditLogs: auditCount[0]?.value ?? 0,
      },
      recentAudit,
      generatedAt: new Date().toISOString(),
    };
  }),
});
