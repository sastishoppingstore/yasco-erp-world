import { memo, useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";

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
} from "lucide-react";

const menuGroups = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/app" },
      { label: "POS", icon: Store, path: "/app/pos" },
      { label: "Cashbox", icon: Wallet, path: "/app/cashbox" },
      { label: "Installments", icon: CalendarCheck, path: "/app/installments" },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { label: "Accounting", icon: BookOpen, path: "/app/accounting" },
      { label: "Chart of Accounts", icon: Landmark, path: "/app/accounting/coa" },
      { label: "Journal Entries", icon: Receipt, path: "/app/accounting/journal-entries" },
      { label: "General Ledger", icon: BookOpen, path: "/app/accounting/ledger" },
      { label: "Financial Reports", icon: BarChart3, path: "/app/accounting/reports" },
      { label: "Accounting Settings", icon: Settings, path: "/app/accounting/settings" },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      { label: "Products", icon: Package, path: "/app/inventory/products" },
      { label: "Warehouses", icon: Warehouse, path: "/app/inventory/warehouses" },
      { label: "Stock Levels", icon: Package, path: "/app/inventory/stock" },
      { label: "Stock Movements", icon: ShoppingCart, path: "/app/inventory/movements" },
      { label: "Stock Transfers", icon: Truck, path: "/app/inventory/transfers" },
    ],
  },
  {
    title: "SALES",
    items: [
      { label: "Customers", icon: Users, path: "/app/sales/customers" },
      { label: "Quotations", icon: Receipt, path: "/app/sales/quotations" },
      { label: "Sales Orders", icon: ShoppingCart, path: "/app/sales/orders" },
      { label: "Invoices", icon: Receipt, path: "/app/sales/invoices" },
      { label: "Credit Notes", icon: Receipt, path: "/app/sales/credit-notes" },
      { label: "Customer Payments", icon: Landmark, path: "/app/sales/payments" },
    ],
  },
  {
    title: "PURCHASE",
    items: [
      { label: "Suppliers", icon: Building2, path: "/app/purchase/suppliers" },
      { label: "Purchase Orders", icon: ShoppingBag, path: "/app/purchase/orders" },
      { label: "Goods Receipt", icon: Package, path: "/app/purchase/grn" },
      { label: "Supplier Payments", icon: Landmark, path: "/app/purchase/payments" },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Leads", icon: Users, path: "/app/crm/leads" },
      { label: "Opportunities", icon: Briefcase, path: "/app/crm/opportunities" },
      { label: "Activities", icon: BarChart3, path: "/app/crm/activities" },
    ],
  },
  {
    title: "HRM",
    items: [
      { label: "Employees", icon: Users, path: "/app/hrm/employees" },
      { label: "Attendance", icon: Briefcase, path: "/app/hrm/attendance" },
      { label: "Leave Management", icon: Briefcase, path: "/app/hrm/leave" },
      { label: "Payroll", icon: Landmark, path: "/app/hrm/payroll" },
      { label: "Performance", icon: BarChart3, path: "/app/hrm/performance" },
    ],
  },
  {
    title: "MANUFACTURING",
    items: [
      { label: "Bill of Materials", icon: Factory, path: "/app/manufacturing/bom" },
      { label: "Work Orders", icon: Factory, path: "/app/manufacturing/work-orders" },
      { label: "Production", icon: Factory, path: "/app/manufacturing/production" },
    ],
  },
  {
    title: "PROJECTS",
    items: [
      { label: "Projects", icon: FolderKanban, path: "/app/projects/list" },
      { label: "Tasks", icon: FolderKanban, path: "/app/projects/tasks" },
      { label: "Timesheets", icon: Briefcase, path: "/app/projects/timesheets" },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Help Desk", icon: HeadphonesIcon, path: "/app/helpdesk/tickets" },
      { label: "Assets", icon: Building2, path: "/app/assets/list" },
      { label: "Fleet", icon: Truck, path: "/app/assets/fleet" },
    ],
  },
  {
    title: "PLATFORM",
    items: [
      { label: "Growth Engine", icon: Rocket, path: "/app/platform/growth-engine" },
      { label: "Solution Library", icon: Workflow, path: "/app/platform/solutions" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Reports", icon: BarChart3, path: "/app/reports" },
      { label: "Settings", icon: Settings, path: "/app/settings" },
    ],
  },
];

const SidebarContent = memo(function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const { language, setLang } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className={cn("flex items-center gap-3 p-4 border-b border-slate-700", collapsed && "justify-center p-3")}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">YA</div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block font-bold text-lg tracking-tight leading-5">YASCO</span>
            <span className="text-[11px] text-slate-400">Enterprise OS</span>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 py-2">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-3">
            {!collapsed && (
              <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.title}
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
                    isActive && "bg-blue-600/20 text-blue-400 border-r-2 border-blue-500",
                    !isActive && "text-slate-300",
                    collapsed && "justify-center px-3"
                  )}
                >
                  <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </ScrollArea>
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

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking secure session...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="fixed h-full">
          <SidebarContent collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="absolute top-3 left-3 z-50">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="min-h-16 bg-white border-b flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6 shrink-0">
          <div className="flex items-center gap-3 lg:ml-0 ml-10 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-slate-800">
                {menuGroups.flatMap(g => g.items).find(i => i.path === location.pathname)?.label || "Dashboard"}
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 truncate">
                Unified finance, operations, people, and customer workflows
              </p>
            </div>
          </div>
          <div className="order-3 w-full md:order-none md:w-[360px] lg:w-[460px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Search records and actions"
                className="h-10 rounded-full border-slate-200 bg-slate-50 pl-9 pr-20"
                placeholder="Search invoices, customers, stock, reports..."
              />
              <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full border bg-white px-2 py-1 text-[11px] text-slate-500 sm:flex">
                <Command className="size-3" /> K
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden border-emerald-200 bg-emerald-50 text-emerald-700 lg:inline-flex">
              <ShieldCheck className="size-3" />
              Audit ready
            </Badge>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <Plus className="size-4" />
              Quick create
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
            </Button>
            <span className="text-xs text-slate-500 hidden xl:block">{user?.name || "Al Watan Trading Co."}</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
              {(user?.name || "AW").slice(0, 2).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={logout}>
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
