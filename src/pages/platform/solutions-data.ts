import {
  BadgeCheck,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ClipboardCheck,
  CreditCard,
  Factory,
  FileCheck2,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  Globe2,
  HeadphonesIcon,
  Landmark,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Package,
  PackageCheck,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  WalletCards,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type SolutionScreen = {
  slug: string;
  title: string;
  area: string;
  summary: string;
  icon: LucideIcon;
  impact: string;
  owner: string;
};

const finance = [
  ["cash-flow-command", "Cash Flow Command", "Daily cash, bank, receivables, payables, and shortfall alerts.", WalletCards, "Cash visibility"],
  ["bank-reconciliation", "Bank Reconciliation", "Match bank feeds, payments, receipts, fees, and unresolved differences.", Landmark, "Faster close"],
  ["budget-control", "Budget Control", "Department budgets, cost center limits, variance approval, and alerts.", Calculator, "Spend control"],
  ["expense-claims", "Expense Claims", "Employee claims, receipts, approvals, reimbursement, and ledger posting.", Receipt, "Policy control"],
  ["tax-compliance", "Tax Compliance", "VAT setup, return checks, invoice tax quality, and audit-ready reports.", FileCheck2, "Compliance"],
  ["financial-close", "Financial Close", "Close checklist, journals, reconciliations, trial balance, and sign-off.", BadgeCheck, "Close speed"],
  ["fixed-asset-depreciation", "Fixed Asset Depreciation", "Asset register, depreciation runs, disposals, and book value tracking.", Building2, "Asset accuracy"],
  ["treasury-board", "Treasury Board", "Bank position, payment calendar, liquidity risk, and cash movements.", Banknote, "Liquidity control"],
  ["profitability-analysis", "Profitability Analysis", "Customer, product, project, branch, and cost-center margin insights.", LineChart, "Margin growth"],
  ["approval-matrix", "Approval Matrix", "Amount-based approval routing for finance, purchase, HR, and operations.", Workflow, "Governance"],
] as const;

const sales = [
  ["sales-pipeline", "Sales Pipeline", "Lead stage movement, conversion risk, next activity, and forecast value.", LineChart, "Revenue growth"],
  ["quote-control", "Quote Control", "Discount limits, margin checks, quote approvals, and expiry follow-up.", FileText, "Margin safety"],
  ["order-fulfillment", "Order Fulfillment", "Confirmed orders, pick/pack/ship progress, invoicing, and delivery risk.", ShoppingCart, "Delivery speed"],
  ["customer-360", "Customer 360", "Balances, invoices, quotes, tickets, activities, and credit exposure in one screen.", Users, "Retention"],
  ["credit-control", "Credit Control", "Credit limits, overdue invoices, dunning actions, and blocked orders.", ShieldCheck, "Cash recovery"],
  ["sales-commission", "Sales Commission", "Rep targets, paid invoices, commission rules, and approval status.", Banknote, "Sales focus"],
  ["returns-management", "Returns Management", "Returns, credit notes, replacement approvals, and quality reasons.", Receipt, "Customer trust"],
  ["price-list-studio", "Price List Studio", "Customer price lists, tier pricing, branch pricing, and margin guardrails.", Calculator, "Pricing control"],
  ["subscription-billing", "Subscription Billing", "Recurring invoices, renewals, proration, payment follow-up, and churn risk.", CreditCard, "Recurring revenue"],
  ["field-sales-route", "Field Sales Route", "Visit plans, geo routes, order capture, collections, and follow-ups.", Truck, "Field productivity"],
] as const;

const inventory = [
  ["stock-health", "Stock Health", "Available, reserved, reorder, ageing, and negative-stock exceptions.", Boxes, "Stock accuracy"],
  ["reorder-planning", "Reorder Planning", "Demand, lead time, reorder quantity, supplier choice, and draft POs.", PackageCheck, "No stockouts"],
  ["warehouse-operations", "Warehouse Operations", "Receiving, putaway, picking, transfers, cycle counts, and adjustments.", Package, "Warehouse speed"],
  ["batch-serial-trace", "Batch & Serial Trace", "Traceability from receipt to sale, expiry, warranty, and recall actions.", GitBranch, "Traceability"],
  ["landed-cost", "Landed Cost", "Freight, duty, insurance, and handling allocation into inventory value.", Calculator, "True costing"],
  ["cycle-counts", "Cycle Counts", "Count plans, variance approvals, recounts, and stock adjustment posting.", ClipboardCheck, "Inventory trust"],
  ["stock-ageing", "Stock Ageing", "Slow-moving, obsolete, expiry risk, and liquidation action planning.", Gauge, "Working capital"],
  ["barcode-control", "Barcode Control", "Barcode labels, scan receiving, scan picking, and packing validation.", PackageCheck, "Scan accuracy"],
  ["multi-warehouse-transfer", "Multi-Warehouse Transfer", "Transfer request, dispatch, in-transit stock, receipt, and variance.", Truck, "Branch stock"],
  ["inventory-valuation", "Inventory Valuation", "FIFO/average valuation, movement audit, and GL tie-out.", Landmark, "Audit value"],
] as const;

const purchase = [
  ["supplier-scorecards", "Supplier Scorecards", "Price, delivery, quality, payment terms, and issue history.", ShoppingBag, "Better sourcing"],
  ["purchase-planning", "Purchase Planning", "Demand-driven purchase suggestions, approvals, and supplier selection.", PackageCheck, "Procurement speed"],
  ["po-approval", "PO Approval", "PO thresholds, budget checks, supplier risk, and approval chain.", Workflow, "Spend control"],
  ["grn-quality", "GRN Quality", "Receipt validation, QC holds, shortages, damage, and batch capture.", ClipboardCheck, "Quality control"],
  ["supplier-bills", "Supplier Bills", "Three-way match, bill approval, tax checks, and due-date planning.", Receipt, "AP control"],
  ["payment-run", "Payment Run", "Supplier payment batches, bank files, approvals, and remittance advice.", Banknote, "Payment control"],
  ["rfq-management", "RFQ Management", "Supplier RFQs, comparative quotes, winner selection, and PO conversion.", FileText, "Sourcing control"],
  ["contract-purchasing", "Contract Purchasing", "Supplier contracts, price validity, terms, renewals, and compliance.", FileCheck2, "Contract control"],
  ["import-procurement", "Import Procurement", "Import shipments, landed cost, ETA, customs, and receiving.", Globe2, "Import visibility"],
  ["vendor-portal", "Vendor Portal", "Supplier self-service for quotes, PO acknowledgements, invoices, and status.", Users, "Supplier speed"],
] as const;

const people = [
  ["employee-lifecycle", "Employee Lifecycle", "Hiring, onboarding, documents, roles, payroll, and exit workflow.", Users, "HR control"],
  ["attendance-control", "Attendance Control", "Daily attendance, late rules, overtime, shifts, and exceptions.", Gauge, "Time accuracy"],
  ["leave-approvals", "Leave Approvals", "Leave balance, request routing, calendar conflicts, and payroll impact.", ClipboardCheck, "Policy control"],
  ["payroll-exceptions", "Payroll Exceptions", "Salary changes, deductions, loans, unpaid leave, and approval checks.", Banknote, "Payroll accuracy"],
  ["performance-goals", "Performance Goals", "Review cycles, ratings, goals, training needs, and manager comments.", LineChart, "Team growth"],
  ["document-expiry", "Document Expiry", "ID, visa, contract, certification, license, and asset document reminders.", FileCheck2, "Compliance"],
  ["shift-planning", "Shift Planning", "Shift rosters, coverage gaps, swaps, overtime risk, and attendance sync.", Workflow, "Coverage"],
  ["loan-advances", "Loan & Advances", "Employee loans, advances, installments, deductions, and balances.", CreditCard, "Payroll control"],
  ["training-matrix", "Training Matrix", "Skill gaps, training plans, compliance courses, and completion tracking.", BadgeCheck, "Capability"],
  ["hr-service-desk", "HR Service Desk", "Employee HR requests, documents, letters, approvals, and SLA.", HeadphonesIcon, "HR service"],
] as const;

const operations = [
  ["project-profitability", "Project Profitability", "Budget, cost, time, billing, margin, and risk by project.", FolderKanban, "Project margin"],
  ["task-command", "Task Command", "Task stages, owners, deadlines, blockers, and workload visibility.", ClipboardCheck, "Execution"],
  ["timesheet-billing", "Timesheet Billing", "Approved time, billable hours, client billing, and utilization.", Receipt, "Revenue capture"],
  ["helpdesk-sla", "Helpdesk SLA", "Ticket priority, SLA timers, escalations, resolution, and satisfaction.", HeadphonesIcon, "Service quality"],
  ["asset-maintenance", "Asset Maintenance", "Asset service plans, downtime, costs, warranty, and assignments.", Building2, "Asset uptime"],
  ["fleet-operations", "Fleet Operations", "Vehicles, fuel, service, drivers, renewals, and cost per km.", Truck, "Fleet control"],
  ["manufacturing-control", "Manufacturing Control", "BOM, work orders, reservations, production output, and variance.", Factory, "Production control"],
  ["quality-checks", "Quality Checks", "Inspection plans, failed checks, holds, corrective actions, and release.", BadgeCheck, "Quality"],
  ["branch-operations", "Branch Operations", "Branch sales, stock, cash, approvals, and performance dashboard.", Building2, "Branch control"],
  ["executive-command", "Executive Command", "Cross-module KPIs, exceptions, approvals, cash, growth, and risk.", LayoutDashboard, "Leadership"],
] as const;

const platform = [
  ["role-permissions", "Role Permissions", "RBAC by module, action, branch, amount, and sensitive data access.", LockKeyhole, "Security"],
  ["audit-center", "Audit Center", "Who changed what, when, before/after values, and exportable trails.", ShieldCheck, "Audit readiness"],
  ["workflow-builder", "Workflow Builder", "No-code rules for approvals, reminders, escalations, and auto-posting.", Workflow, "Automation"],
  ["notification-center", "Notification Center", "Email, in-app, SMS-ready alerts, reminders, and digest settings.", Zap, "Response speed"],
  ["migration-control", "Migration Control", "Import masters, opening balances, validation, mapping, and cutover checklist.", FileCheck2, "Switching"],
  ["data-quality", "Data Quality", "Duplicate checks, missing fields, invalid tax IDs, and master-data cleanup.", BadgeCheck, "Clean data"],
  ["api-integrations", "API Integrations", "Integration status, tokens, logs, retries, and connected apps.", GitBranch, "Connectivity"],
  ["ai-exceptions", "AI Exceptions", "Smart suggestions for overdue, low stock, margin risk, and approval anomalies.", Zap, "Decision speed"],
  ["tenant-control", "Tenant Control", "Companies, branches, fiscal calendars, currencies, languages, and branding.", Globe2, "Scalability"],
  ["security-posture", "Security Posture", "Session control, admin activity, login risk, OTP policy, and secure settings.", LockKeyhole, "Trust"],
] as const;

const groups = [
  ["Finance", finance],
  ["Sales", sales],
  ["Inventory", inventory],
  ["Purchase", purchase],
  ["People", people],
  ["Operations", operations],
  ["Platform", platform],
] as const;

export const solutionScreens: SolutionScreen[] = groups.flatMap(([area, items]) =>
  items.map(([slug, title, summary, icon, impact], index) => ({
    slug,
    title,
    area,
    summary,
    icon,
    impact,
    owner: ["Finance Lead", "Operations Lead", "Admin", "Department Manager"][index % 4],
  })),
);
