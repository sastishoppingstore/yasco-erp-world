import { memo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";
import { useCountryDetection } from "@/providers/country-detection";
import { trpc } from "@/providers/trpc";

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
  Globe,
  Search,
  Bell,
  ShieldCheck,
  Command,
  Rocket,
  LogOut,
  Workflow,
  Store,
  Wallet,
  CalendarCheck,
  CreditCard,
  Sparkles,
  Key,
  Palette,
  FileText,
  User,
  X,
  ChevronDown,
  Wrench,
  ClipboardList,
  Car,
  ParkingCircle,
  FileWarning,
} from "lucide-react";

import { AiAssistantPanel } from "./AiAssistantPanel";
import { SyncStatusBar } from "./sync/SyncStatusBar";
import { VoiceCommandButton, VoiceCommandHeaderButton } from "./VoiceCommand";
import { useCategoryModules, getStoredCategory, BusinessCategory } from "@/hooks/useCategoryModules";

const categoryGroupVisibility: Record<string, string[]> = {
  hospital: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  workshop: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'WORKSHOP', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  construction: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  retail: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  restaurant: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  hotel: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  manufacturing: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  education: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  transport: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  real_estate: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  services: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'PROJECTS', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
  all: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'PROJECTS', 'WORKSHOP', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
};

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
      { label: "Saudi GOSI Payroll", labelAr: "الرواتب والتأمينات", icon: ShieldCheck, path: "/app/hrm/saudi-payroll" },
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
    title: "WORKSHOP",
    titleAr: "الورشة",
    items: [
      { label: "Workshop Dashboard", labelAr: "لوحة الورشة", icon: Wrench, path: "/app/verticals/workshop" },
      { label: "Job Cards", labelAr: "بطاقات العمل", icon: ClipboardList, path: "/app/verticals/workshop/job-cards" },
      { label: "Vehicles", labelAr: "المركبات", icon: Car, path: "/app/verticals/workshop/vehicles" },
      { label: "Estimates", labelAr: "التقديرات", icon: FileText, path: "/app/verticals/workshop/estimates" },
      { label: "Technicians", labelAr: "الفنيين", icon: Users, path: "/app/verticals/workshop/technicians" },
      { label: "Inspections", labelAr: "الفحوصات", icon: Search, path: "/app/verticals/workshop/inspections" },
      { label: "Bay Schedule", labelAr: "جدول الرافعات", icon: ParkingCircle, path: "/app/verticals/workshop/bays" },
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
      { label: "Financial Statements", labelAr: "القوائم المالية", icon: Receipt, path: "/app/reports/financial" },
      { label: "ZATCA Dashboard", labelAr: "لوحة الزكاة والضريبة", icon: ShieldCheck, path: "/app/reports/zatca-dashboard" },
      { label: "ZATCA Status", labelAr: "حالة الفوترة", icon: ShieldCheck, path: "/app/reports/zatca-status" },
      { label: "Sync Status", labelAr: "حالة المزامنة", icon: Workflow, path: "/app/sync/queue" },
      { label: "Master Control", labelAr: "التحكم الرئيسي", icon: ShieldCheck, path: "/app/admin/master-control" },
      { label: "Company Profile", labelAr: "ملف الشركة", icon: Palette, path: "/app/settings/company-profile" },
      { label: "Branches", labelAr: "الفروع", icon: Building2, path: "/app/branches" },
      { label: "Settings", labelAr: "الإعدادات", icon: Settings, path: "/app/settings" },
      { label: "Company Legal Info", labelAr: "بيانات الشركة القانونية", icon: Building2, path: "/app/settings/company-legal-information" },
      { label: "ZATCA Integration", labelAr: "ربط هيئة الزكاة", icon: ShieldCheck, path: "/app/settings/zatca-integration" },
    ],
  },
];

const adminMenuItems = [
  { label: "Super Admin Dashboard", labelAr: "لوحة المشرف العام", icon: ShieldCheck, path: "/app/admin/super-dashboard", roles: ["super_admin"] },
  { label: "Platform Master Control", labelAr: "التحكم الكامل للمنصة", icon: ShieldCheck, path: "/app/admin/super-master-control", roles: ["super_admin"] },
  { label: "Companies", labelAr: "الشركات", icon: Building2, path: "/app/admin/super-companies", roles: ["super_admin"] },
  { label: "Compliance Center", labelAr: "مركز الامتثال", icon: FileWarning, path: "/app/admin/super-compliance", roles: ["super_admin"] },
  { label: "Plans", labelAr: "الخطط", icon: CreditCard, path: "/app/admin/super-plans", roles: ["super_admin"] },
  { label: "Reseller Management", labelAr: "إدارة الموزعين", icon: Users, path: "/app/admin/super-resellers", roles: ["super_admin"] },
  { label: "SMTP Settings", labelAr: "إعدادات البريد", icon: Settings, path: "/app/admin/super-smtp", roles: ["super_admin"] },
  { label: "Email Templates", labelAr: "قوالب البريد", icon: FileText, path: "/app/admin/super-email-templates", roles: ["super_admin"] },
  { label: "License Approval", labelAr: "الموافقة على الترخيص", icon: ShieldCheck, path: "/app/admin/license-approval", roles: ["admin", "super_admin"] },
  { label: "My License Keys", labelAr: "مفاتيح الترخيص", icon: Key, path: "/app/admin/reseller-keys", roles: ["reseller"] },
  { label: "Invoice Settings", labelAr: "إعدادات الفاتورة", icon: Palette, path: "/app/admin/invoice-settings", roles: ["user_admin", "admin", "super_admin"] },
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
  const { user } = useAuth();
  const rtl = language === "ar";
  const { data: companySettings } = trpc.settings.companySettingsGet.useQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const userAdminItems = adminMenuItems.filter(item => item.roles.includes(user?.role || ""));

  const storedCategory = getStoredCategory();
  const visibleGroups = categoryGroupVisibility[storedCategory] || categoryGroupVisibility.all;

  const displayName = companySettings?.companyName || "YASCO ERP";
  const displayAr = companySettings?.companyNameAr;
  const logo = companySettings?.logo;
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  // Filter menu items by search query
  const filteredGroups = menuGroups.filter(g => visibleGroups.includes(g.title));
  const allItems = filteredGroups.flatMap(g => g.items.map(item => ({ ...item, group: rtl ? g.titleAr : g.title })));
  const filteredItems = searchQuery.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.labelAr.includes(searchQuery)
      )
    : null;

  return (
    <div dir={dir} className="flex h-full min-h-0 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-slate-700", collapsed && "justify-center p-3")}>
        {logo ? (
          <img src={logo} alt={displayName} className="w-8 h-8 rounded-lg object-contain bg-white" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm">{initials}</div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <span className="block font-bold text-lg tracking-tight leading-5 truncate">{displayName}</span>
            {displayAr && <span className="block text-[11px] text-slate-400 truncate" dir="rtl">{displayAr}</span>}
            {!displayAr && <span className="text-[11px] text-slate-400">Enterprise ERP</span>}
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={rtl ? "ابحث في القائمة..." : "Search menu..."}
              className="w-full bg-slate-800 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg outline-none placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500"
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2 pr-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700"
        aria-label={rtl ? "قائمة النظام" : "ERP navigation"}
      >
        {/* Search results */}
        {filteredItems ? (
          <div className="mb-3">
            {filteredItems.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-400">{rtl ? "لا توجد نتائج" : "No results found"}</p>
            ) : (
              filteredItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => { setSearchQuery(""); onNavigate?.(); }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-slate-800",
                      isActive && "bg-emerald-600/20 text-emerald-400",
                      isActive && (rtl ? "border-l-2 border-emerald-500" : "border-r-2 border-emerald-500"),
                      !isActive && "text-slate-300",
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="truncate block">{rtl ? item.labelAr : item.label}</span>
                      <span className="text-[10px] text-slate-500">{item.group}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        ) : (
          filteredGroups.map((group) => (
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
                    title={collapsed ? (rtl ? item.labelAr : item.label) : undefined}
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
          ))
        )}

        {userAdminItems.length > 0 && !filteredItems && (
          <div className="mb-3">
            {!collapsed && (
              <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {rtl ? "الإدارة" : "ADMIN"}
              </div>
            )}
            {userAdminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  title={collapsed ? (rtl ? item.labelAr : item.label) : undefined}
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
        )}
      </nav>

      {/* Bottom Actions */}
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

// User Profile Dropdown Component
function UserProfileDropdown({ user, logout, rtl }: { user: { name?: string; role?: string } | null; logout: () => void; rtl: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full hover:bg-white/10 transition-colors p-1 pr-2"
        aria-label="User menu"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-emerald-600 border border-white/20 flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </div>
        <span className="text-xs text-white hidden xl:block max-w-20 truncate">{user?.name || ""}</span>
        <ChevronDown className="size-3 text-white/70 hidden xl:block" />
      </button>

      {open && (
        <div className={cn(
          "absolute top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50",
          rtl ? "left-0" : "right-0"
        )}>
          {/* User info */}
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || "user"}</p>
          </div>

          <Link
            to="/app/settings/company-profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="size-4 text-slate-400" />
            {rtl ? "ملف الشركة" : "Company Profile"}
          </Link>
          <Link
            to="/app/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="size-4 text-slate-400" />
            {rtl ? "الإعدادات" : "Settings"}
          </Link>
          <Link
            to="/app/setup-wizard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Sparkles className="size-4 text-slate-400" />
            {rtl ? "معالج الإعداد" : "Setup Wizard"}
          </Link>

          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-start"
            >
              <LogOut className="size-4" />
              {rtl ? "تسجيل الخروج" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const { language, dir } = useLanguage();
  const countryDetection = useCountryDetection();
  const rtl = language === "ar";
  const theme = countryThemes[countryDetection.selectedCountry] ?? countryThemes.US;

  // Breadcrumb: find active item label
  const allNavItems = menuGroups.flatMap(g => g.items);
  const activeItem = allNavItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + "/"));

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <img src="/logo-40.png" alt="YASCO" className="w-10 h-10 rounded-lg object-contain mx-auto" />
          <p className="text-sm text-slate-500">Checking secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="flex h-dvh overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden h-dvh lg:block transition-all duration-300 shrink-0 overflow-y-auto",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className={cn("absolute top-3 z-50", rtl ? "right-3" : "left-3")}>
            <Menu className="w-5 h-5 text-white" />
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
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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

          {/* Search Bar */}
          <div className="order-3 w-full md:order-none md:w-[360px] lg:w-[460px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-100" />
              <Input
                aria-label="Search records and actions"
                className="h-10 rounded-full border-white/20 bg-white/10 text-white placeholder:text-emerald-100/70 pl-9 pr-20 focus-visible:ring-emerald-400"
                placeholder={rtl ? "ابحث في الفواتير والعملاء والمخزون..." : "Search invoices, customers, stock..."}
              />
              <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[11px] text-white sm:flex">
                <Command className="size-3" /> K
              </div>
            </div>
          </div>

          {/* Right Actions */}
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
            {/* Voice Command Header Button */}
            <VoiceCommandHeaderButton />

            {/* Language Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(language === "en" ? "ar" : "en")}
              className="border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white gap-1.5 px-2.5"
              aria-label={rtl ? "تغيير اللغة" : "Change language"}
            >
              <Globe className="size-4" />
              <span className="text-xs font-semibold">{language === "en" ? "AR" : "EN"}</span>
            </Button>

            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative hover:bg-white/10 text-white">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" />
            </Button>
            <SyncStatusBar />

            {/* User Profile Dropdown */}
            <UserProfileDropdown user={user} logout={logout} rtl={rtl} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Floating Voice Command Button */}
      <VoiceCommandButton />
    </div>
  );
}
