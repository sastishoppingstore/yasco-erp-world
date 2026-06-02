import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Package,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Building2,
  FolderKanban,
  HeadphonesIcon,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
  Store,
  Wallet,
  CalendarCheck,
  ShoppingCart,
  Landmark,
  Percent,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const operatingHealth = [
  { label: "Finance close readiness", value: 91 },
  { label: "Inventory accuracy", value: 87 },
  { label: "Sales pipeline hygiene", value: 78 },
  { label: "Service SLA control", value: 94 },
];

const enterpriseSignals = [
  { label: "Multi-company", value: "Ready", icon: Building2 },
  { label: "Role security", value: "RBAC", icon: LockKeyhole },
  { label: "Audit trails", value: "Tracked", icon: FileCheck2 },
  { label: "Localization", value: "Global", icon: Globe2 },
];

const workflows = [
  {
    title: "Lead to cash",
    detail: "CRM, quotation, sales order, invoice, receipt, and ledger stay connected.",
    progress: 88,
    icon: CircleDollarSign,
  },
  {
    title: "Procure to pay",
    detail: "Supplier pricing, purchase order, GRN, bill, payment, and stock valuation.",
    progress: 82,
    icon: ClipboardCheck,
  },
  {
    title: "Plan to produce",
    detail: "BOM, work orders, raw material reservation, production cost, and finished goods.",
    progress: 76,
    icon: Boxes,
  },
];

const differentiators = [
  "Faster onboarding with industry templates",
  "Unified data model across every department",
  "Executive dashboards without spreadsheet exports",
  "Built-in approval, audit, and exception controls",
];

const moduleCards = [
  {
    title: "Point of Sale",
    titleAr: "نقطة البيع",
    icon: Store,
    path: "/app/pos",
    gradient: "from-emerald-500 to-green-700",
    desc: "POS sale screen",
  },
  {
    title: "Cashbox",
    titleAr: "الصندوق",
    icon: Wallet,
    path: "/app/cashbox",
    gradient: "from-blue-500 to-blue-700",
    desc: "Cash management",
  },
  {
    title: "Installments",
    titleAr: "التقسيط",
    icon: CalendarCheck,
    path: "/app/installments",
    gradient: "from-purple-500 to-purple-700",
    desc: "Installment plans",
  },
  {
    title: "Sales",
    titleAr: "المبيعات",
    icon: ShoppingCart,
    path: "/app/sales",
    gradient: "from-orange-500 to-orange-700",
    desc: "Customers & invoices",
  },
  {
    title: "Inventory",
    titleAr: "المخزون",
    icon: Package,
    path: "/app/inventory",
    gradient: "from-cyan-500 to-cyan-700",
    desc: "Products & stock",
  },
  {
    title: "Accounting",
    titleAr: "المحاسبة",
    icon: Landmark,
    path: "/app/accounting",
    gradient: "from-indigo-500 to-indigo-700",
    desc: "Finance & reports",
  },
];

export default function Dashboard() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined);
  const { data: revenueByMonth } = trpc.dashboard.revenueByMonth.useQuery({ year: 2025 });
  const { data: recentInvoices } = trpc.dashboard.recentInvoices.useQuery({ limit: 5 });
  const { data: topCustomers } = trpc.dashboard.topCustomers.useQuery({ limit: 5 });

  const revenueData = revenueByMonth?.map((r) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
      Number(r.month) - 1
    ] || `M${r.month}`,
    amount: Number(r.total),
  })) || [];

  const kpiCards = [
    { title: "Total Revenue", value: stats?.totalRevenue || 0, icon: TrendingUp, suffix: " SAR", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, suffix: "", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Suppliers", value: stats?.totalSuppliers || 0, icon: Building2, suffix: "", color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Products", value: stats?.totalProducts || 0, icon: Package, suffix: "", color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Employees", value: stats?.totalEmployees || 0, icon: Users, suffix: "", color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Open Tickets", value: stats?.openTickets || 0, icon: HeadphonesIcon, suffix: "", color: "text-red-600", bg: "bg-red-50" },
    { title: "Active Projects", value: stats?.activeProjects || 0, icon: FolderKanban, suffix: "", color: "text-cyan-600", bg: "bg-cyan-50" },
    { title: "Low Stock Items", value: stats?.lowStockItems || 0, icon: AlertTriangle, suffix: "", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      {/* SAHL-style Module Tiles */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{rtl ? "الوحدات السريعة" : "Quick Modules"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {moduleCards.map((mod) => (
            <Link key={mod.path} to={mod.path}>
              <div className={cn(
                "relative overflow-hidden rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                "bg-gradient-to-br", mod.gradient,
              )}>
                <mod.icon className="size-8 mb-2 opacity-90" />
                <h3 className="font-semibold text-sm leading-tight">{rtl ? mod.titleAr : mod.title}</h3>
                <p className="text-[10px] opacity-80 mt-1">{mod.desc}</p>
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <mod.icon className="size-24" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="overflow-hidden rounded-lg border bg-slate-950 text-white">
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_280px] lg:p-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                  <Sparkles className="size-3" />
                  World-class ERP cockpit
                </Badge>
                <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
                  Built to replace fragmented tools
                </Badge>
              </div>
              <div>
                <h2 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
                  Run finance, sales, inventory, HR, projects, support, and manufacturing from one operating system.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  YASCO gives customers the control they expect from enterprise platforms with a faster, cleaner experience for daily teams.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
                  <Link to="/app/reports">
                    View executive reports
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/app/platform/growth-engine">Open growth engine</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Adoption confidence</p>
                  <p className="mt-1 text-3xl font-bold">96%</p>
                </div>
                <ShieldCheck className="size-9 text-emerald-300" />
              </div>
              <div className="mt-5 space-y-3">
                {differentiators.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Enterprise Readiness</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {enterpriseSignals.map((signal) => (
              <div key={signal.label} className="rounded-lg border bg-slate-50 p-3">
                <signal.icon className="size-4 text-blue-600" />
                <p className="mt-3 text-xs text-slate-500">{signal.label}</p>
                <p className="text-sm font-semibold text-slate-900">{signal.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-500">{kpi.title}</p>
                {statsLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">
                    {kpi.title === "Total Revenue"
                      ? Number(kpi.value).toLocaleString()
                      : kpi.value}
                    {kpi.suffix}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Operating Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {operatingHealth.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <Progress value={item.value} className="[&>div]:bg-blue-600" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold">Automation Workflows</CardTitle>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                <Zap className="size-3" />
                42 active rules
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {workflows.map((workflow) => (
              <div key={workflow.title} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <workflow.icon className="size-5 text-blue-600" />
                  <span className="text-sm font-semibold">{workflow.progress}%</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{workflow.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{workflow.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} SAR`, "Revenue"]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Business Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Revenue", value: stats?.totalRevenue || 1 },
                    { name: "Payables", value: stats?.totalPayable || 1 },
                    { name: "Customers", value: stats?.totalCustomers || 1 },
                    { name: "Products", value: stats?.totalProducts || 1 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Customers */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices?.length === 0 && <p className="text-sm text-slate-500">No invoices yet</p>}
              {recentInvoices?.slice(0, 5).map((inv) => (
                <Link
                  key={inv.id}
                  to={`/sales/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{new Date(inv.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{Number(inv.totalAmount).toLocaleString()} SAR</p>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      inv.status === "paid" && "bg-emerald-100 text-emerald-700",
                      inv.status === "partial" && "bg-amber-100 text-amber-700",
                      inv.status === "draft" && "bg-slate-200 text-slate-700",
                      inv.status === "sent" && "bg-blue-100 text-blue-700",
                    )}>
                      {inv.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers?.length === 0 && <p className="text-sm text-slate-500">No customers yet</p>}
              {topCustomers?.slice(0, 5).map((cust, i) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{cust.name}</p>
                      <p className="text-xs text-slate-500">{cust.city || "N/A"}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{Number(cust.currentBalance).toLocaleString()} SAR</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Exception Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Invoices waiting approval", value: 12, tone: "bg-amber-50 text-amber-700" },
              { label: "Stock below reorder point", value: stats?.lowStockItems || 0, tone: "bg-red-50 text-red-700" },
              { label: "Tickets breaching SLA", value: 3, tone: "bg-blue-50 text-blue-700" },
              { label: "Projects missing timesheets", value: 7, tone: "bg-cyan-50 text-cyan-700" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="size-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", item.tone)}>
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
