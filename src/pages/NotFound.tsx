import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { Home, ArrowLeft, SearchX, LayoutDashboard, ShoppingCart, Users, Package } from "lucide-react";
import { useLanguage } from "@/providers/language";

export default function NotFound() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const rtl = language === "ar";

  const quickLinks = [
    { label: "Dashboard", labelAr: "لوحة التحكم", path: "/app", icon: LayoutDashboard },
    { label: "Sales & Invoices", labelAr: "المبيعات والفواتير", path: "/app/sales/invoices", icon: ShoppingCart },
    { label: "Customers", labelAr: "العملاء", path: "/app/sales/customers", icon: Users },
    { label: "Products", labelAr: "الأصناف", path: "/app/inventory/products", icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4" dir={rtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center">
            <SearchX className="w-14 h-14 text-slate-300" />
          </div>
        </div>

        {/* Error code */}
        <h1 className="text-8xl font-black tracking-tighter text-slate-100 select-none">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-bold text-slate-800 mt-2 mb-2">
          {rtl ? "الصفحة غير موجودة" : "Page not found"}
        </h2>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
          {rtl
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك العودة أو الانتقال لأحد الأقسام أدناه."
            : "The page you're looking for doesn't exist or has been moved. Go back or navigate to one of the sections below."
          }
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {rtl ? "رجوع" : "Go Back"}
          </Button>
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Link to="/app">
              <Home className="w-4 h-4" />
              {rtl ? "الرئيسية" : "Dashboard"}
            </Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide font-medium">
            {rtl ? "روابط سريعة" : "Quick links"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-slate-700 hover:text-blue-700"
              >
                <link.icon className="size-4 text-slate-400" />
                {rtl ? link.labelAr : link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
