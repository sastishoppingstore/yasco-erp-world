import { Link } from "react-router";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GitBranch,
  Globe2,
  LockKeyhole,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const valuePillars = [
  {
    title: "Switch without business disruption",
    description: "Guided migration, chart-of-accounts mapping, opening balances, item masters, customers, suppliers, and historical imports.",
    icon: Rocket,
    score: 94,
  },
  {
    title: "Automate the boring work",
    description: "Approval chains, recurring invoices, reorder rules, payment reminders, SLA escalation, and payroll checks.",
    icon: Workflow,
    score: 91,
  },
  {
    title: "Enterprise control from day one",
    description: "RBAC, maker-checker approvals, audit trails, document locks, branch controls, and exception dashboards.",
    icon: ShieldCheck,
    score: 96,
  },
];

const migrationPlan = [
  "Company structure, branches, currencies, taxes, and fiscal year",
  "Chart of accounts, cost centers, opening balances, and ledgers",
  "Customers, suppliers, price lists, credit limits, and payment terms",
  "Products, warehouses, stock lots, serials, batches, and reorder rules",
  "Employees, payroll components, leave balances, attendance policy, and assets",
];

const automations = [
  { title: "Lead to cash", detail: "Lead score, quote approval, order confirmation, invoice posting, receipt allocation.", icon: TrendingUp },
  { title: "Procure to pay", detail: "Reorder alert, purchase approval, GRN validation, supplier bill, payment release.", icon: PackageCheck },
  { title: "Hire to retire", detail: "Onboarding checklist, document expiry reminders, leave approval, payroll exception scan.", icon: ClipboardCheck },
  { title: "Service to loyalty", detail: "Ticket SLA, escalation, warranty validation, replacement approval, customer follow-up.", icon: GitBranch },
];

const enterpriseControls = [
  { label: "Role-based permissions", icon: LockKeyhole },
  { label: "Approval matrix", icon: Workflow },
  { label: "Audit-ready history", icon: FileCheck2 },
  { label: "Multi-company operations", icon: Building2 },
  { label: "Global localization", icon: Globe2 },
  { label: "AI exception assistant", icon: Bot },
];

const industryTemplates = [
  { name: "Trading & Distribution", modules: "Sales, purchase, warehouses, fleet, receivables", readiness: 92 },
  { name: "Manufacturing", modules: "BOM, work orders, production costing, raw material planning", readiness: 86 },
  { name: "Services & Projects", modules: "CRM, projects, timesheets, billing, helpdesk, profitability", readiness: 89 },
  { name: "Retail & Branch Ops", modules: "Branch stock, approvals, cash control, customer loyalty", readiness: 84 },
];

const boardMetrics = [
  { label: "Manual work reduced", value: "38%" },
  { label: "Close cycle faster", value: "5 days" },
  { label: "Stock leakage visibility", value: "24/7" },
  { label: "Approval control", value: "100%" },
];

export default function GrowthEnginePage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border bg-slate-950 text-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                <Sparkles className="size-3" />
                Customer switching engine
              </Badge>
              <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
                ERP value beyond feature checklists
              </Badge>
            </div>
            <div>
              <h2 className="max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Give customers a clear reason to leave their old ERP: faster rollout, deeper automation, tighter control, and cleaner daily work.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                This cockpit turns YASCO into a sales, implementation, and success system. It shows exactly how the customer will migrate, automate, govern, and scale.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
                <Link to="/app/settings">
                  Start enterprise setup
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/app/reports">Open board reports</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Value proof pack</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {boardMetrics.map((metric) => (
                <div key={metric.label} className="rounded-lg bg-white/10 p-3">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="mt-1 text-xs text-slate-300">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {valuePillars.map((pillar) => (
          <Card key={pillar.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <pillar.icon className="size-5" />
                </div>
                <span className="text-sm font-semibold">{pillar.score}%</span>
              </div>
              <h3 className="mt-4 font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{pillar.description}</p>
              <Progress value={pillar.score} className="mt-4 [&>div]:bg-blue-600" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Migration Command Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {migrationPlan.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-lg border p-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{step}</p>
                  <p className="mt-1 text-xs text-slate-500">Validated with owner, sample checked, and ready for go-live rehearsal.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold">Automation Studio</CardTitle>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <Zap className="size-3" />
                Ready to configure
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {automations.map((automation) => (
              <div key={automation.title} className="rounded-lg border p-4">
                <automation.icon className="size-5 text-blue-600" />
                <h3 className="mt-3 text-sm font-semibold">{automation.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{automation.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Industry Launch Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {industryTemplates.map((template) => (
              <div key={template.name} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{template.name}</h3>
                  <Badge variant="outline">{template.readiness}% rollout ready</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{template.modules}</p>
                <Progress value={template.readiness} className="mt-3 [&>div]:bg-emerald-600" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Enterprise Control Checklist</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {enterpriseControls.map((control) => (
              <div key={control.label} className="rounded-lg border bg-slate-50 p-3">
                <control.icon className="size-4 text-blue-600" />
                <p className="mt-3 text-sm font-medium">{control.label}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  Included
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
