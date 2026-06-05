import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  Building2, Users, CreditCard, TrendingUp, DollarSign, Activity,
  Settings, Mail, FileText, ShieldAlert, BarChart3, Package,
  Loader2, Sparkles, ArrowUpRight,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000, signups: 12 },
  { month: "Feb", revenue: 52000, signups: 18 },
  { month: "Mar", revenue: 48000, signups: 15 },
  { month: "Apr", revenue: 61000, signups: 22 },
  { month: "May", revenue: 58000, signups: 20 },
  { month: "Jun", revenue: 72000, signups: 28 },
];

const recentSignups = [
  { name: "Alfa Corp", email: "info@alfacorp.com", plan: "Business", date: "2026-06-02", status: "active" },
  { name: "Beta LLC", email: "contact@betallc.com", plan: "Starter", date: "2026-06-01", status: "trial" },
  { name: "Gamma Trading", email: "admin@gammatrading.com", plan: "Enterprise", date: "2026-05-30", status: "active" },
  { name: "Delta Services", email: "ceo@deltaservices.com", plan: "Business", date: "2026-05-28", status: "active" },
];

const recentEmails = [
  { to: "info@alfacorp.com", subject: "Welcome to YASCO", status: "sent", date: "2026-06-02" },
  { to: "contact@betallc.com", subject: "Trial Expiring Soon", status: "sent", date: "2026-06-01" },
  { to: "admin@gammatrading.com", subject: "Invoice #INV-2026-001", status: "failed", date: "2026-05-30" },
  { to: "ceo@deltaservices.com", subject: "Plan Upgrade Confirmed", status: "sent", date: "2026-05-28" },
];

export default function SuperAdminDashboard() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const statsQuery = trpc.superAdmin.stats.dashboard.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const stats = statsQuery.data ?? {
    totalCompanies: 156,
    activeCompanies: 128,
    trialCompanies: 22,
    totalRevenue: 58200,
    revenueGrowth: 12.5,
  };
  const monthlyRevenue = "monthlyRevenue" in stats ? Number(stats.monthlyRevenue) : Number(stats.totalRevenue || 0);

  const statCards = [
    { label: isAr ? "إجمالي الشركات" : "Total Companies", value: stats.totalCompanies, icon: Building2, color: "text-blue-600 bg-blue-50" },
    { label: isAr ? "نشطة" : "Active", value: stats.activeCompanies, icon: Activity, color: "text-green-600 bg-green-50" },
    { label: isAr ? "تجريبية" : "Trial", value: stats.trialCompanies, icon: Sparkles, color: "text-purple-600 bg-purple-50" },
    { label: isAr ? "الإيرادات الشهرية" : "Monthly Revenue", value: `${(monthlyRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "text-orange-600 bg-orange-50", suffix: "SAR" },
  ];

  const quickLinks = [
    { label: isAr ? "إدارة الخطط" : "Manage Plans", icon: Package, path: "/super-admin/plans", color: "bg-blue-50 text-blue-600" },
    { label: isAr ? "إدارة الشركات" : "Manage Companies", icon: Building2, path: "/super-admin/companies", color: "bg-green-50 text-green-600" },
    { label: isAr ? "إعدادات SMTP" : "SMTP Settings", icon: Mail, path: "/super-admin/smtp", color: "bg-purple-50 text-purple-600" },
    { label: isAr ? "قوالب البريد" : "Email Templates", icon: FileText, path: "/super-admin/email-templates", color: "bg-orange-50 text-orange-600" },
    { label: isAr ? "سجلات المراجعة" : "Audit Logs", icon: ShieldAlert, path: "/super-admin/audit-logs", color: "bg-red-50 text-red-600" },
    { label: isAr ? "التقارير" : "Reports", icon: BarChart3, path: "/super-admin/reports", color: "bg-cyan-50 text-cyan-600" },
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
                  <Badge variant="outline" className="text-xs">
                    <ArrowUpRight className="size-3 mr-1 text-green-500" />
                    {statsQuery.isLoading ? "..." : "+12%"}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
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
                <BarChart data={revenueData}>
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
                <LineChart data={revenueData}>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{isAr ? "الروابط السريعة" : "Quick Links"}</CardTitle>
              <CardDescription>{isAr ? "إدارة المنصة" : "Manage your platform"}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.label} to={link.path} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-50 transition-colors">
                    <div className={`rounded-lg p-2 ${link.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "آخر عمليات التسجيل" : "Recent Signups"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSignups.map((s) => (
                <div key={s.email} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">
                      {s.plan}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "سجلات البريد الإلكتروني" : "Recent Email Logs"}</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "إلى" : "To"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الموضوع" : "Subject"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody>
              {recentEmails.map((e) => (
                <tr key={`${e.to}-${e.subject}`} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm">{e.to}</td>
                  <td className="px-4 py-3 text-sm">{e.subject}</td>
                  <td className="px-4 py-3">
                    <Badge variant={e.status === "sent" ? "default" : "destructive"} className="text-xs">
                      {e.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
