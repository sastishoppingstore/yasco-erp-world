import {
  Building2, Users, DollarSign, Activity,
  Mail, FileText, ShieldAlert, BarChart3, Package,
  Key, Sparkles, FileWarning, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

export default function SuperAdminDashboard() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const statsQuery = trpc.superAdmin.stats.dashboard.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const revenueQuery = trpc.superAdmin.stats.revenue.useQuery(undefined, { refetchInterval: 60000 });
  const signupsQuery = trpc.superAdmin.stats.signups.useQuery(undefined, { refetchInterval: 60000 });
  const readinessQuery = trpc.superAdmin.compliance.globalReadiness.useQuery(
    { limit: 100, onlyNotReady: false },
    { refetchInterval: 60000 },
  );

  const stats = statsQuery.data ?? {
    totalCompanies: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    totalRevenue: 0,
    signupsThisMonth: 0,
    totalSubscriptions: 0,
    paidSubscriptions: 0,
    suspendedCompanies: 0,
    failedZatca: 0,
    pendingZatca: 0,
  };
  const readiness = readinessQuery.data;
  const readinessPercent = readiness?.totalChecked
    ? Math.round((readiness.ready / readiness.totalChecked) * 100)
    : 0;

  const monthNames = isAr
    ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartData = (revenueQuery.data?.months || []).map(m => ({
    month: monthNames[m.month - 1] || String(m.month),
    revenue: m.total,
    signups: (signupsQuery.data?.months.find((s: any) => s.month === m.month)?.count || 0),
  }));

  const statCards = [
    { label: isAr ? "إجمالي الشركات" : "Total Companies", value: stats.totalCompanies, icon: Building2, color: "text-blue-600 bg-blue-50" },
    { label: isAr ? "نشطة" : "Active", value: stats.activeCompanies, icon: Activity, color: "text-green-600 bg-green-50" },
    { label: isAr ? "تجريبية" : "Trial", value: stats.trialCompanies, icon: Sparkles, color: "text-indigo-600 bg-indigo-50" },
    { label: isAr ? "الإيرادات" : "Revenue", value: `${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "text-orange-600 bg-orange-50" },
  ];

  const complianceCards = [
    { label: isAr ? "جاهزة للبيع" : "Ready for sale", value: readiness?.ready || 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: isAr ? "مشاكل حرجة" : "Critical issues", value: readiness?.criticalOpen || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { label: isAr ? "ZATCA فاشلة" : "Failed ZATCA", value: stats.failedZatca, icon: FileWarning, color: "text-amber-600 bg-amber-50" },
    { label: isAr ? "شركات موقوفة" : "Suspended", value: stats.suspendedCompanies, icon: ShieldAlert, color: "text-slate-600 bg-slate-100" },
  ];

  const quickLinks = [
    { label: isAr ? "إدارة الخطط" : "Manage Plans", icon: Package, path: "/app/admin/super-plans" },
    { label: isAr ? "إدارة الشركات" : "Manage Companies", icon: Building2, path: "/app/admin/super-companies" },
    { label: isAr ? "مركز الامتثال" : "Compliance Center", icon: FileWarning, path: "/app/admin/super-compliance" },
    { label: isAr ? "التراخيص" : "Licenses", icon: Key, path: "/app/admin/license-console" },
    { label: isAr ? "إعدادات SMTP" : "SMTP Settings", icon: Mail, path: "/app/admin/super-smtp" },
    { label: isAr ? "قوالب البريد" : "Email Templates", icon: FileText, path: "/app/admin/super-email-templates" },
    { label: isAr ? "الموافقة على الترخيص" : "License Approval", icon: ShieldAlert, path: "/app/admin/license-approval" },
    { label: isAr ? "سجلات المراجعة" : "Audit Logs", icon: BarChart3, path: "/app/admin/super-dashboard" },
    { label: isAr ? "انتحال الشخصية" : "Impersonate", icon: Users, path: "/app/admin/impersonate" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "لوحة الإدارة" : "Super Admin Dashboard"}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? "نظرة عامة على المنصة" : "Platform overview and management"}
          </p>
        </div>
        <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
          <ShieldAlert className="size-3 mr-1" />
          {isAr ? "صلاحيات كاملة" : "Full Access"}
        </Badge>
      </div>

      <section className="relative overflow-hidden rounded-lg bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-8 top-6 size-20 rounded-full border border-emerald-300/30" />
          <div className="absolute right-10 top-8 size-14 rotate-45 border border-sky-300/30" />
          <div className="absolute bottom-6 left-1/3 h-px w-56 bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
        </div>
        <div className="relative grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <Badge className="mb-3 border-emerald-300/30 bg-emerald-400/15 text-emerald-50">
              <Sparkles className="mr-1 size-3" />
              {isAr ? "منصة SaaS سعودية" : "Saudi SaaS control"}
            </Badge>
            <h2 className="text-xl font-semibold">
              {isAr ? "تحكم في آلاف الشركات من لوحة واحدة" : "Control thousands of companies from one panel"}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {isAr
                ? "تابع الاشتراكات، الجاهزية القانونية، الفوترة الإلكترونية، الترخيص، والتنبيهات قبل البيع."
                : "Track subscriptions, legal readiness, ZATCA invoicing, licenses and sales blockers before onboarding customers."}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span>{isAr ? "جاهزية الإطلاق" : "Launch readiness"}</span>
              <span className="font-bold">{readinessPercent}%</span>
            </div>
            <Progress value={readinessPercent} className="mt-3 h-2" />
            <Button asChild size="sm" className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">
              <a href="/app/admin/super-compliance">{isAr ? "فتح مركز الامتثال" : "Open compliance center"}</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{statsQuery.isLoading ? "..." : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {complianceCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{readinessQuery.isLoading || statsQuery.isLoading ? "..." : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "الإيرادات الشهرية" : "Monthly Revenue"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "الاشتراكات الشهرية" : "Monthly Signups"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "الروابط السريعة" : "Quick Links"}</CardTitle>
            <CardDescription>{isAr ? "إدارة المنصة" : "Manage your platform"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a key={link.label} href={link.path} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-50 transition-colors">
                    <div className={`rounded-lg p-2 bg-slate-100 text-slate-600`}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium">{link.label}</span>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "ملخص المنصة" : "Platform Summary"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm">{isAr ? "إجمالي الشركات" : "Total Companies"}</span>
                <span className="font-bold">{stats.totalCompanies}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm">{isAr ? "الاشتراكات النشطة" : "Active Subscriptions"}</span>
                <span className="font-bold">{stats.paidSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm">{isAr ? "الاشتراكات التجريبية" : "Trial Subscriptions"}</span>
                <span className="font-bold">{stats.trialCompanies}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm">{isAr ? "تسجيلات هذا الشهر" : "Signups This Month"}</span>
                <span className="font-bold">{stats.signupsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm">{isAr ? "إجمالي الإيرادات" : "Total Revenue"}</span>
                <span className="font-bold">{stats.totalRevenue.toLocaleString()} SAR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
