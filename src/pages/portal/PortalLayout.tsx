import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard, FileText, Wallet, ShoppingCart, HeadphonesIcon,
  User, Package, LogOut, Menu, Bell, Search, ChevronLeft, ChevronRight,
  Building2, Clock, CalendarDays, Upload,
} from "lucide-react";

const customerNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/portal/customer" },
  { label: "Invoices", icon: FileText, path: "/portal/customer/invoices" },
  { label: "Payments", icon: Wallet, path: "/portal/customer/payments" },
  { label: "Orders", icon: ShoppingCart, path: "/portal/customer/orders" },
  { label: "Support Tickets", icon: HeadphonesIcon, path: "/portal/customer/tickets" },
  { label: "Profile", icon: User, path: "/portal/customer/profile" },
];

const vendorNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/portal/vendor" },
  { label: "Purchase Orders", icon: Package, path: "/portal/vendor/purchase-orders" },
  { label: "Invoices", icon: FileText, path: "/portal/vendor/invoices" },
  { label: "Payments", icon: Wallet, path: "/portal/vendor/payments" },
  { label: "Profile", icon: Building2, path: "/portal/vendor/profile" },
];

const employeeNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/portal/employee" },
  { label: "Payslips", icon: FileText, path: "/portal/employee/payslips" },
  { label: "Leave Requests", icon: CalendarDays, path: "/portal/employee/leave" },
  { label: "Attendance", icon: Clock, path: "/portal/employee/attendance" },
  { label: "Documents", icon: Upload, path: "/portal/employee/documents" },
  { label: "Profile", icon: User, path: "/portal/employee/profile" },
];

const portalColors: Record<string, { shell: string; sidebar: string; accent: string }> = {
  customer: { shell: "from-blue-700 via-blue-600 to-indigo-700", sidebar: "bg-white border-r", accent: "text-blue-600" },
  vendor:   { shell: "from-emerald-700 via-emerald-600 to-teal-700", sidebar: "bg-white border-r", accent: "text-emerald-600" },
  employee: { shell: "from-purple-700 via-purple-600 to-violet-700", sidebar: "bg-white border-r", accent: "text-purple-600" },
};

export default function PortalLayout({ portalType, children }: { portalType: "customer" | "vendor" | "employee"; children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = portalColors[portalType];

  const nav = portalType === "customer" ? customerNav : portalType === "vendor" ? vendorNav : employeeNav;
  const activeItem = nav.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + "/"));

  const handleLogout = () => {
    localStorage.removeItem(`portal_token_${portalType}`);
    navigate(`/portal/${portalType}/login`);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <aside className={cn("hidden lg:block transition-all duration-300 shrink-0", collapsed ? "w-16" : "w-56", theme.sidebar)}>
        <div className={cn("flex items-center gap-3 px-4 border-b h-16", collapsed && "justify-center px-2")}>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white", portalType === "customer" ? "bg-blue-600" : portalType === "vendor" ? "bg-emerald-600" : "bg-purple-600")}>YA</div>
          {!collapsed && <span className="font-bold text-base tracking-tight">YASCO {portalType.toUpperCase()} Portal</span>}
        </div>
        <nav className="py-2">
          {nav.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  isActive ? cn("bg-slate-100 font-medium", theme.accent) : "text-slate-600 hover:bg-slate-50",
                  collapsed && "justify-center px-3"
                )}
              >
                <item.icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 mt-auto">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-500" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="absolute top-3 left-3 z-50">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-56">
          <div className="flex items-center gap-3 px-4 border-b h-16">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white", portalType === "customer" ? "bg-blue-600" : portalType === "vendor" ? "bg-emerald-600" : "bg-purple-600")}>YA</div>
            <span className="font-bold text-base">YASCO Portal</span>
          </div>
          <nav className="py-2">
            {nav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                  className={cn("flex items-center gap-3 px-4 py-2.5 text-sm", isActive ? cn("bg-slate-100 font-medium", theme.accent) : "text-slate-600")}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-500" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={cn("h-16 bg-gradient-to-r text-white shadow-sm flex items-center justify-between px-4 lg:px-6 shrink-0", theme.shell)}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden lg:flex hover:bg-white/10 text-white" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            <h1 className="text-sm font-semibold">{activeItem?.label || "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
              <Input className="h-9 w-48 lg:w-64 rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/60 pl-9 text-sm" placeholder="Search..." />
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white"><Bell className="size-4" /></Button>
            <Badge variant="outline" className="border-white/20 text-white text-xs">{portalType}</Badge>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
