import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard, Building2, CreditCard, FileWarning, Users,
  Settings, FileText, Key, LogOut, Menu, ShieldCheck,
  BarChart3, Mail, UserCheck, Headphones,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard, path: "/admin" },
  { label: "Companies", labelAr: "الشركات", icon: Building2, path: "/admin/companies" },
  { label: "Plans", labelAr: "الخطط", icon: CreditCard, path: "/admin/plans" },
  { label: "Compliance", labelAr: "الامتثال", icon: FileWarning, path: "/admin/compliance" },
  { label: "Licenses", labelAr: "التراخيص", icon: Key, path: "/admin/license-console" },
  { label: "License Approval", labelAr: "الموافقة", icon: ShieldCheck, path: "/admin/license-approval" },
  { label: "Resellers", labelAr: "الموزعون", icon: Headphones, path: "/admin/resellers" },
  { label: "Reseller Keys", labelAr: "مفاتيح الموزعين", icon: Key, path: "/admin/reseller-keys" },
  { label: "Master Control", labelAr: "التحكم الكامل", icon: Settings, path: "/admin/super-master-control" },
  { label: "SMTP Settings", labelAr: "إعدادات SMTP", icon: Mail, path: "/admin/smtp" },
  { label: "Email Templates", labelAr: "قوالب البريد", icon: FileText, path: "/admin/email-templates" },
  { label: "Impersonate", labelAr: "انتحال", icon: UserCheck, path: "/admin/impersonate" },
  { label: "Audit Logs", labelAr: "سجلات المراجعة", icon: BarChart3, path: "/admin/dashboard" },
  { label: "Invoice Settings", labelAr: "إعدادات الفاتورة", icon: FileText, path: "/admin/invoice-settings" },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const { language, setLang } = useLanguage();
  const rtl = language === "ar";

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <img src="/logo-40.png" alt="YASCO" className="w-10 h-10 rounded-lg object-contain mx-auto" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "super_admin") {
    navigate("/app", { replace: true });
    return null;
  }

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "h-screen bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300",
        "fixed lg:static z-50",
        mobileOpen ? "left-0" : "-left-64 lg:left-0",
        sidebarOpen ? "w-64" : "w-16",
      )}>
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-slate-700 p-4",
          sidebarOpen ? "gap-3" : "justify-center p-3",
        )}>
          <img src="/logo-40.png" alt="YASCO" className="w-8 h-8 rounded-lg object-contain" />
          {sidebarOpen && (
            <div>
              <span className="block font-bold text-sm text-white">YASCO</span>
              <span className="block text-[10px] text-amber-400">Super Admin</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-800",
                  isActive ? "bg-amber-600/20 text-amber-400 border-r-2 border-amber-500" : "text-slate-300",
                  !sidebarOpen && "justify-center px-3",
                )}
                title={!sidebarOpen ? (rtl ? item.labelAr : item.label) : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{rtl ? item.labelAr : item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center border-t border-slate-700 p-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900 text-white shadow-md flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1 hover:bg-slate-800 rounded">
              <Menu className="w-5 h-5" />
            </button>
            <a href="https://yasco.tech" className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors hidden sm:inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {rtl ? "العودة للموقع" : "Back to Site"}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(language === "en" ? "ar" : "en")}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              {language === "en" ? "AR" : "EN"}
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {user?.name || "Super Admin"}
            </span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-800/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {rtl ? "خروج" : "Logout"}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
