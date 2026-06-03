import { memo, useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";
import { useCountryDetection } from "@/providers/country-detection";

import {
  LayoutDashboard,
  BookOpen,
  Package,
  ShoppingCart,
  ShoppingBag,
  Users,
  Briefcase,
  Factory,
  FolderKanban,
  HeadphonesIcon,
  Truck,
  Settings,
  BarChart3,
  Receipt,
  Landmark,
  Building2,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Menu,
  Languages,
  Search,
  Bell,
  Plus,
  ShieldCheck,
  Command,
  Rocket,
  LogOut,
  Workflow,
  Store,
  Wallet,
  CalendarCheck,
  CreditCard,
  HelpCircle,
  Newspaper,
  Sparkles,
} from "lucide-react";

import { AiAssistantPanel } from "./AiAssistantPanel";

const menuGroups = [
  {
    title: "MAIN",
    titleAr: "الرئيسية",
    items: [
      { label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard, path: "/app" },
      { label: "POS", labelAr: "نقطة البيع", icon: Store, path: "/app/pos" },
      { label: "Cashbox", labelAr: "الصندوق", icon: Wallet, path: "/app/cashbox" },
      { label: "Installments", labelAr: "التقسيط", icon: CalendarCheck, path: "/app/installments" },
    ],
  },
  {
    title: "FINANCE",
    titleAr: "المالية",
    items: [
      { label: "Accounting", labelAr: "المحاسبة", icon: BookOpen, path: "/app/accounting" },
      { label: "Chart of Accounts", labelAr: "دليل الحسابات", icon: Landmark, path: "/app/accounting/coa" },
      { label: "Journal Entries", labelAr: "القيود اليومية", icon: Receipt, path: "/app/accounting/journal-entries" },
      { label: "General Ledger", labelAr: "الأستاذ العام", icon: BookOpen, path: "/app/accounting/ledger" },
      { label: "Financial Reports", labelAr: "التقارير المالية", icon: BarChart3, path: "/app/accounting/reports" },
      { label: "Accounting Settings", labelAr: "إعدادات المحاسبة", icon: Settings, path: "/app/accounting/settings" },
    ],
  },
  {
    title: "INVENTORY",
    titleAr: "المخزون",
    items: [
      { label: "Products", labelAr: "الأصناف", icon: Package, path: "/app/inventory/products" },
      { label: "Warehouses", labelAr: "المستودعات", icon: Warehouse, path: "/app/inventory/warehouses" },
      { label: "Stock Levels", labelAr: "أرصدة المخزون", icon: Package, path: "/app/inventory/stock" },
      { label: "Stock Movements", labelAr: "حركات المخزون", icon: ShoppingCart, path: "/app/inventory/movements" },
      { label: "Stock Transfers", labelAr: "تحويلات المخزون", icon: Truck, path: "/app/inventory/transfers" },
    ],
  },
  {
    title: "SALES",
    titleAr: "المبيعات",
    items: [
      { label: "Customers", labelAr: "العملاء", icon: Users, path: "/app/sales/customers" },
      { label: "Quotations", labelAr: "عروض الأسعار", icon: Receipt, path: "/app/sales/quotations" },
      { label: "Sales Orders", labelAr: "أوامر البيع", icon: ShoppingCart, path: "/app/sales/orders" },
      { label: "Invoices", labelAr: "الفواتير", icon: Receipt, path: "/app/sales/invoices" },
      { label: "Credit Notes", labelAr: "إشعارات دائنة", icon: Receipt, path: "/app/sales/credit-notes" },
      { label: "Customer Payments", labelAr: "مدفوعات العملاء", icon: Landmark, path: "/app/sales/payments" },
    ],
  },
  {
    title: "PURCHASE",
    titleAr: "المشتريات",
    items: [
      { label: "Suppliers", labelAr: "الموردون", icon: Building2, path: "/app/purchase/suppliers" },
      { label: "Purchase Orders", labelAr: "أوامر الشراء", icon: ShoppingBag, path: "/app/purchase/orders" },
      { label: "Goods Receipt", labelAr: "استلام البضاعة", icon: Package, path: "/app/purchase/grn" },
      { label: "Supplier Payments", labelAr: "مدفوعات الموردين", icon: Landmark, path: "/app/purchase/payments" },
    ],
  },
  {
    title: "CRM",
    titleAr: "إدارة العملاء",
    items: [
      { label: "Leads", labelAr: "العملاء المحتملون", icon: Users, path: "/app/crm/leads" },
      { label: "Opportunities", labelAr: "الفرص", icon: Briefcase, path: "/app/crm/opportunities" },
      { label: "Activities", labelAr: "الأنشطة", icon: BarChart3, path: "/app/crm/activities" },
    ],
  },
  {
    title: "HRM",
    titleAr: "الموارد البشرية",
    items: [
      { label: "Employees", labelAr: "الموظفون", icon: Users, path: "/app/hrm/employees" },
      { label: "Attendance", labelAr: "الحضور", icon: Briefcase, path: "/app/hrm/attendance" },
      { label: "Leave Management", labelAr: "إدارة الإجازات", icon: Briefcase, path: "/app/hrm/leave" },
      { label: "Payroll", labelAr: "الرواتب", icon: Landmark, path: "/app/hrm/payroll" },
      { label: "Performance", labelAr: "الأداء", icon: BarChart3, path: "/app/hrm/performance" },
    ],
  },
  {
    title: "MANUFACTURING",
    titleAr: "التصنيع",
    items: [
      { label: "Bill of Materials", labelAr: "قائمة المواد", icon: Factory, path: "/app/manufacturing/bom" },
      { label: "Work Orders", labelAr: "أوامر العمل", icon: Factory, path: "/app/manufacturing/work-orders" },
      { label: "Production", labelAr: "الإنتاج", icon: Factory, path: "/app/manufacturing/production" },
    ],
  },
  {
    title: "PROJECTS",
    titleAr: "المشاريع",
    items: [
      { label: "Projects", labelAr: "المشاريع", icon: FolderKanban, path: "/app/projects/list" },
      { label: "Tasks", labelAr: "المهام", icon: FolderKanban, path: "/app/projects/tasks" },
      { label: "Timesheets", labelAr: "سجلات الوقت", icon: Briefcase, path: "/app/projects/timesheets" },
    ],
  },
  {
    title: "OPERATIONS",
    titleAr: "التشغيل",
    items: [
      { label: "Help Desk", labelAr: "الدعم الفني", icon: HeadphonesIcon, path: "/app/helpdesk/tickets" },
      { label: "Assets", labelAr: "الأصول", icon: Building2, path: "/app/assets/list" },
      { label: "Fleet", labelAr: "الأسطول", icon: Truck, path: "/app/assets/fleet" },
    ],
  },
  {
    title: "PLATFORM",
    titleAr: "المنصة",
    items: [
      { label: "Growth Engine", labelAr: "محرك النمو", icon: Rocket, path: "/app/platform/growth-engine" },
      { label: "Solution Library", labelAr: "مكتبة الحلول", icon: Workflow, path: "/app/platform/solutions" },
    ],
  },
  {
    title: "SYSTEM",
    titleAr: "النظام",
    items: [
      { label: "Reports", labelAr: "التقارير", icon: BarChart3, path: "/app/reports" },
      { label: "ZATCA Status", labelAr: "حالة الفوترة", icon: ShieldCheck, path: "/app/reports/zatca-status" },
      { label: "Master Control", labelAr: "التحكم الرئيسي", icon: ShieldCheck, path: "/app/admin/master-control" },
      { label: "Settings", labelAr: "الإعدادات", icon: Settings, path: "/app/settings" },
      { label: "Company Legal Info", labelAr: "بيانات الشركة القانونية", icon: Building2, path: "/app/settings/company-legal-information" },
      { label: "ZATCA Integration", labelAr: "ربط هيئة الزكاة", icon: ShieldCheck, path: "/app/settings/zatca-integration" },
    ],
  },
];

const countryThemes: Record<string, { shell: string; badge: string; tax: string; product: string }> = {
  SA: { shell: "from-emerald-950 via-green-900 to-emerald-900", badge: "border-emerald-300/40 bg-emerald-400/15 text-emerald-50", tax: "Saudi VAT / ZATCA", product: "نسخة السعودية" },
  PK: { shell: "from-green-950 via-emerald-900 to-lime-900", badge: "border-lime-300/40 bg-lime-400/15 text-lime-50", tax: "Pakistan Sales Tax / FBR", product: "Pakistan Edition" },
  AE: { shell: "from-slate-950 via-emerald-900 to-red-950", badge: "border-red-200/40 bg-white/15 text-white", tax: "UAE VAT / FTA", product: "UAE Edition" },
  US: { shell: "from-blue-950 via-slate-900 to-emerald-900", badge: "border-blue-300/40 bg-blue-400/15 text-blue-50", tax: "US Sales Tax", product: "US Edition" },
};

const SidebarContent = memo(function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const { language, setLang, dir } = useLanguage();
  const rtl = language === "ar";

  return (
    <div dir={dir} className="flex h-full min-h-0 flex-col bg-slate-900 text-white">
      <div className={cn("flex items-center gap-3 p-4 border-b border-slate-700", collapsed && "justify-center p-3")}>
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm">YA</div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block font-bold text-lg tracking-tight leading-5">YASCO</span>
            <span className="text-[11px] text-slate-400">Enterprise OS</span>
          </div>
        )}
      </div>
      <nav
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2 pr-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700"
        aria-label={rtl ? "قائمة النظام" : "ERP navigation"}
      >
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-3">
            {!collapsed && (
              <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {rtl ? group.titleAr : group.title}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-slate-800",
                    isActive && "bg-emerald-600/20 text-emerald-400",
                    isActive && (rtl ? "border-l-2 border-emerald-500" : "border-r-2 border-emerald-500"),
                    !isActive && "text-slate-300",
                    collapsed && "justify-center px-3"
                  )}
                >
                  <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                  {!collapsed && <span className="truncate">{rtl ? item.labelAr : item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className={cn("border-t border-slate-700 p-3", collapsed && "p-2")}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(language === "en" ? "ar" : "en")}
          className={cn(
            "w-full text-slate-300 hover:text-white hover:bg-slate-800",
            collapsed ? "justify-center px-0" : "justify-start gap-2"
          )}
        >
          <Languages className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{language === "en" ? "العربية" : "English"}</span>}
        </Button>
      </div>
    </div>
  );
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const { language, dir } = useLanguage();
  const countryDetection = useCountryDetection();
  const rtl = language === "ar";
  const theme = countryThemes[countryDetection.selectedCountry] ?? countryThemes.US;
  const activeItem = menuGroups.flatMap(g => g.items).find(i => i.path === location.pathname);

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking secure session...
      </div>
    );
  }

  return (
    <div dir={dir} className="flex h-dvh overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden h-dvh lg:block transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("sticky top-0 h-dvh", collapsed ? "w-16" : "w-64")}>
          <SidebarContent collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className={cn("absolute top-3 z-50", rtl ? "right-3" : "left-3")}>
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side={rtl ? "right" : "left"} className="h-dvh p-0 w-64">
          <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className={cn("min-h-16 bg-gradient-to-r text-white shadow-md flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6 shrink-0", theme.shell)}>
          <div className={cn("flex items-center gap-3 min-w-0", rtl ? "lg:mr-0 mr-10" : "lg:ml-0 ml-10")}>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex hover:bg-white/10 text-white"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white">
                {activeItem ? (rtl ? activeItem.labelAr : activeItem.label) : (rtl ? "لوحة التحكم" : "Dashboard")}
              </h1>
              <p className="hidden sm:block text-xs text-emerald-200 truncate">
                {rtl ? "نظام ERP عالمي ذكي" : "Global Smart ERP"}
              </p>
            </div>
          </div>
          <div className="order-3 w-full md:order-none md:w-[360px] lg:w-[460px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-100" />
              <Input
                aria-label="Search records and actions"
                className="h-10 rounded-full border-white/20 bg-white/10 text-white placeholder:text-emerald-100/70 pl-9 pr-20 focus-visible:ring-emerald-400"
                placeholder={rtl ? "ابحث في الفواتير والعملاء والمخزون والتقارير..." : "Search invoices, customers, stock, reports..."}
              />
              <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[11px] text-white sm:flex">
                <Command className="size-3" /> K
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("hidden lg:inline-flex", theme.badge)}>
              {countryDetection.countryFlag}
              <span className="mx-1">{countryDetection.selectedCountry}</span>
              {theme.tax}
            </Badge>
            <Badge variant="outline" className="hidden border-emerald-400/30 bg-emerald-400/10 text-emerald-100 xl:inline-flex">
              <ShieldCheck className="size-3 mr-1" />
              {rtl ? `مرخص: ${theme.product}` : `Licensed: ${theme.product}`}
            </Badge>
            <AiAssistantPanel 
              trigger={
                <Button variant="outline" size="sm" className="hidden sm:inline-flex border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white">
                  <Sparkles className="size-4 mr-1" />
                  {rtl ? "المساعد الذكي" : "AI Assistant"}
                </Button>
              }
            />
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative hover:bg-white/10 text-white">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" />
            </Button>
            <span className="text-xs text-emerald-100 hidden xl:block">{user?.name || "Al Watan Trading Co."}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-600 border border-white/20 flex items-center justify-center text-white text-xs font-medium">
              {(user?.name || "AW").slice(0, 2).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" aria-label={rtl ? "تسجيل الخروج" : "Sign out"} onClick={logout} className="hover:bg-white/10 text-white">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
