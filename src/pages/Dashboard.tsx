import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language";
import { useAuth } from "@/hooks/useAuth";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, Package, Receipt, TrendingUp, AlertTriangle, Building2, FolderKanban,
  HeadphonesIcon, ShieldCheck, Store, ShoppingCart, Landmark,
  Clock, AlertCircle, FileText, Shield, Wallet, CreditCard,
  ArrowUpRight, ArrowDownRight, Calendar, Zap,
  ExternalLink, Activity, BookOpen, BarChart3, Sparkles,
  PlusCircle, ChevronRight, ClipboardList, ChefHat, Grid, Shirt,
  Scissors, Dumbbell,
} from "lucide-react";
import { Link } from "react-router";
import DashboardCustomizer from "@/components/dashboard/DashboardCustomizer";
import { getStoredCategory } from "@/config/businessCatalog";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const quickActions = [
  { label: "New Invoice", labelAr: "فاتورة جديدة", icon: Receipt, path: "/app/sales/invoices", color: "bg-blue-500 hover:bg-blue-600" },
  { label: "New Quotation", labelAr: "عرض سعر جديد", icon: FileText, path: "/app/sales/quotations", color: "bg-emerald-500 hover:bg-emerald-600" },
  { label: "New Project", labelAr: "مشروع جديد", icon: FolderKanban, path: "/app/projects/list", color: "bg-purple-500 hover:bg-purple-600" },
  { label: "New Employee", labelAr: "موظف جديد", icon: Users, path: "/app/hrm/employees", color: "bg-indigo-500 hover:bg-indigo-600" },
  { label: "POS Sale", labelAr: "بيع نقطة البيع", icon: Store, path: "/app/pos/retail", color: "bg-green-500 hover:bg-green-600" },
  { label: "Purchase Order", labelAr: "أمر شراء", icon: ShoppingCart, path: "/app/purchase/orders", color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Stock Count", labelAr: "جرد المخزون", icon: Package, path: "/app/inventory/stock", color: "bg-cyan-500 hover:bg-cyan-600" },
  { label: "Payroll Run", labelAr: "تشغيل الرواتب", icon: Landmark, path: "/app/hrm/payroll", color: "bg-rose-500 hover:bg-rose-600" },
  { label: "Journal Entry", labelAr: "قيد يومي", icon: BookOpen, path: "/app/accounting/journal-entries", color: "bg-teal-500 hover:bg-teal-600" },
  { label: "Customer", labelAr: "عميل جديد", icon: Users, path: "/app/sales/customers", color: "bg-violet-500 hover:bg-violet-600" },
  { label: "Product", labelAr: "صنف جديد", icon: Package, path: "/app/inventory/products", color: "bg-amber-500 hover:bg-amber-600" },
  { label: "Reports", labelAr: "التقارير", icon: BarChart3, path: "/app/reports", color: "bg-slate-600 hover:bg-slate-700" },
];

export default function Dashboard() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined);
  const { data: revenueByMonth } = trpc.dashboard.revenueByMonth.useQuery({ year: 2026 });
  const { data: recentInvoices } = trpc.dashboard.recentInvoices.useQuery({ limit: 5 });
  const { data: topCustomers } = trpc.dashboard.topCustomers.useQuery({ limit: 5 });
  const { data: companySettings } = trpc.settings.companySettingsGet.useQuery();
  const { data: zatcaStatus } = trpc.zatca.dashboard.useQuery(undefined, { retry: false });

  // Scroll animation hooks
  const statsBar = useScrollAnimation({ threshold: 0.1 });
  const quickActionsAnim = useStaggeredAnimation(12, { threshold: 0.05 });
  const kpiAnim = useStaggeredAnimation(8, { threshold: 0.1 });
  const chartsAnim = useScrollAnimation({ threshold: 0.1 });
  const bottomAnim = useScrollAnimation({ threshold: 0.05 });
  const alertsAnim = useScrollAnimation({ threshold: 0.1 });

  const companyName = companySettings?.companyName || (rtl ? "شركتك" : "Your Company");
  const userName = user?.name || (rtl ? "المستخدم" : "User");

  // Summary calculations
  const totalRevenue = stats?.totalRevenue || 0;
  const totalCustomers = stats?.totalCustomers || 0;
  const totalSuppliers = stats?.totalSuppliers || 0;
  const totalProducts = stats?.totalProducts || 0;
  const totalEmployees = stats?.totalEmployees || 0;
  const activeProjects = stats?.activeProjects || 0;
  const lowStockItems = stats?.lowStockItems || 0;
  const openTickets = stats?.openTickets || 0;

  // FIX: revenueData must be defined BEFORE revenueTrend (hoisting bug fix)
  const revenueData = revenueByMonth?.map((r) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
      Number(r.month) - 1
    ] || `M${r.month}`,
    amount: Number(r.total),
  })) || [];

  const revenueTrend = revenueData.length >= 2
    ? ((revenueData[revenueData.length - 1]?.amount - revenueData[revenueData.length - 2]?.amount) / (revenueData[revenueData.length - 2]?.amount || 1)) * 100
    : 0;

  const storedCategory = getStoredCategory();

  // Dynamic vertical-specific KPI cards
  const getVerticalKpiCards = () => {
    switch (storedCategory) {
      case "workshop":
        return [
          { title: "Active Bays", titleAr: "الرافعات النشطة", value: "3 / 4", icon: Clock, suffix: "", color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Pending Estimates", titleAr: "تقديرات معلقة", value: 3, icon: FileText, suffix: "", color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Job Cards Today", titleAr: "بطاقات عمل اليوم", value: 12, icon: ClipboardList, suffix: "", color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Active Technicians", titleAr: "الفنيين النشطين", value: 5, icon: Users, suffix: "", color: "text-indigo-600", bg: "bg-indigo-50" }
        ];
      case "hospital":
        return [
          { title: "Appointments Today", titleAr: "مواعيد اليوم", value: 18, icon: Calendar, suffix: "", color: "text-teal-600", bg: "bg-teal-50" },
          { title: "Admitted Patients", titleAr: "المرضى المنومين", value: 4, icon: Users, suffix: "", color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Pending Claims", titleAr: "مطالبات معلقة", value: 15, icon: ShieldCheck, suffix: "", color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Duty Doctors", titleAr: "الأطباء المناوبين", value: 6, icon: Users, suffix: "", color: "text-indigo-600", bg: "bg-indigo-50" }
        ];
      case "construction":
        return [
          { title: "Active Projects", titleAr: "المشاريع النشطة", value: stats?.activeProjects || 0, icon: FolderKanban, suffix: "", color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Daily Site Logs", titleAr: "تقارير الموقع اليومية", value: 8, icon: FileText, suffix: "", color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Subcontractors", titleAr: "مقاولين الباطن", value: 6, icon: Building2, suffix: "", color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Safety Audits", titleAr: "عمليات تدقيق السلامة", value: 3, icon: ShieldCheck, suffix: "", color: "text-emerald-600", bg: "bg-emerald-50" }
        ];
      case "restaurant":
        return [
          { title: "Occupied Tables", titleAr: "الطاولات المشغولة", value: "5 / 12", icon: Grid, suffix: "", color: "text-red-600", bg: "bg-red-50" },
          { title: "KDS Queue", titleAr: "طلب في المطبخ", value: 3, icon: ChefHat, suffix: "", color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Fulfillment Today", titleAr: "مبيعات اليوم", value: stats?.totalRevenue || 0, icon: TrendingUp, suffix: " SAR", color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Delivery Orders", titleAr: "طلبات التوصيل", icon: Truck, value: 4, suffix: "", color: "text-indigo-600", bg: "bg-indigo-50" }
        ];
      case "laundry":
        return [
          { title: "Received Garments", titleAr: "الملابس المستلمة", value: 18, icon: Shirt, suffix: " items", color: "text-slate-600", bg: "bg-slate-50" },
          { title: "In Wash/Iron", titleAr: "تحت الغسيل والكي", value: 10, icon: RefreshCw, suffix: " items", color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Ready for Pickup", titleAr: "جاهز للتسليم", value: 5, icon: CheckCircle2, suffix: " orders", color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Sales Revenue", titleAr: "مبيعات اليوم", value: stats?.totalRevenue || 0, icon: DollarSign, suffix: " SAR", color: "text-indigo-600", bg: "bg-indigo-50" }
        ];
      case "salon":
        return [
          { title: "Today's Bookings", titleAr: "حجوزات اليوم", value: 14, icon: Calendar, suffix: "", color: "text-rose-600", bg: "bg-rose-50" },
          { title: "Stylists On Duty", titleAr: "المصففات المتواجدات", value: 4, icon: Users, suffix: "", color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Service Revenue", titleAr: "مبيعات الخدمات", value: stats?.totalRevenue || 0, icon: DollarSign, suffix: " SAR", color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Product Sales", titleAr: "مبيعات المنتجات", value: 120, icon: Package, suffix: " SAR", color: "text-amber-600", bg: "bg-amber-50" }
        ];
      case "gym":
        return [
          { title: "Active Members", titleAr: "المشتركين النشطين", value: 450, icon: Users, suffix: "", color: "text-lime-600", bg: "bg-lime-50" },
          { title: "Checked In Today", titleAr: "حضور اليوم", value: 85, icon: CheckCircle2, suffix: "", color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Frozen Memberships", titleAr: "الاشتراكات المجمدة", value: 8, icon: Clock, suffix: "", color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Expiring Soon", titleAr: "ينتهي قريباً", value: 14, icon: AlertCircle, suffix: " members", color: "text-rose-600", bg: "bg-rose-50" }
        ];
      case "ecommerce":
        return [
          { title: "Online Orders Today", titleAr: "طلبات المتجر اليوم", value: 24, icon: ShoppingCart, suffix: "", color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
          { title: "Shopify Sync Health", titleAr: "حالة ربط شوبيفاي", value: "100% OK", icon: ShieldCheck, suffix: "", color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Pending COD", titleAr: "دفع عند الاستلام معلق", value: 575, icon: DollarSign, suffix: " SAR", color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Shipped Today", titleAr: "تم شحنها اليوم", value: 18, icon: Truck, suffix: " parcels", color: "text-indigo-600", bg: "bg-indigo-50" }
        ];
      default:
        return [
          { title: "Today's Sales", titleAr: "مبيعات اليوم", value: stats?.totalRevenue || 0, icon: TrendingUp, suffix: " SAR", color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Total Customers", titleAr: "إجمالي العملاء", value: stats?.totalCustomers || 0, icon: Users, suffix: "", color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Total Suppliers", titleAr: "إجمالي الموردين", value: stats?.totalSuppliers || 0, icon: Building2, suffix: "", color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Products", titleAr: "الأصناف", value: stats?.totalProducts || 0, icon: Package, suffix: "", color: "text-orange-600", bg: "bg-orange-50" }
        ];
    }
  };

  const kpiCards = getVerticalKpiCards();

  const zatcaFailed = zatcaStatus?.failedInvoices || 0;
  const zatcaPending = zatcaStatus?.pendingInvoices || 0;

  const alerts = [
    { label: "Low stock items need reorder", labelAr: "أصناف منخفضة المخزون تحتاج إعادة طلب", count: stats?.lowStockItems || 0, severity: "warning", icon: AlertTriangle, path: "/app/inventory/stock", action: rtl ? "عرض المخزون" : "View Stock" },
    { label: "ZATCA invoices pending clearance", labelAr: "فواتير ZATCA في انتظار الموافقة", count: zatcaPending, severity: "info", icon: Shield, path: "/app/reports/zatca-status", action: rtl ? "عرض" : "View" },
    { label: "ZATCA invoices failed", labelAr: "فواتير ZATCA فاشلة", count: zatcaFailed, severity: "critical", icon: Shield, path: "/app/reports/zatca-status", action: rtl ? "إعادة المحاولة" : "Retry" },
    { label: "Employees with expiring Iqama", labelAr: "موظفون بإقامة منتهية الصلاحية", count: 0, severity: "warning", icon: Clock, path: "/app/hrm/employees", action: rtl ? "عرض الموظفين" : "View Employees" },
    { label: "Overdue invoices", labelAr: "فواتير متأخرة", count: 0, severity: "critical", icon: CreditCard, path: "/app/sales/invoices", action: rtl ? "تحصيل" : "Collect" },
  ].filter(a => a.count > 0);

  const severityColors: Record<string, string> = {
    critical: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  // Empty state: show setup prompt for brand new users
  const isNewUser = totalCustomers === 0 && totalProducts === 0 && totalRevenue === 0 && !statsLoading;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Company Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">
            {rtl ? `مرحباً ${userName} 👋` : `Welcome back, ${userName} 👋`}
          </h2>
          <p className="text-sm text-slate-500">
            {companyName} · {new Date().toLocaleDateString(rtl ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            <ShieldCheck className="size-3 mr-1" />
            {rtl ? "مرخص" : "Licensed"}
          </Badge>
          <Link to="/app/setup-wizard">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2">
              <Sparkles className="size-4" />
              {rtl ? "إعداد الشركة" : "Setup Wizard"}
            </Button>
          </Link>
          <DashboardCustomizer />
        </div>
      </div>

      {/* Empty State for new users */}
      {isNewUser && (
        <Card className="border-dashed border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {rtl ? "مرحباً بك في YASCO ERP! 🎉" : "Welcome to YASCO ERP! 🎉"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {rtl
                ? "ابدأ بإعداد شركتك. أضف عملاءك وأصنافك وأصدر أول فاتورة خلال دقائق."
                : "Get started by setting up your company. Add customers, products, and issue your first invoice in minutes."
              }
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/app/setup-wizard">
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Sparkles className="size-4" />
                  {rtl ? "بدء الإعداد" : "Start Setup Wizard"}
                </Button>
              </Link>
              <Link to="/app/sales/customers">
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="size-4" />
                  {rtl ? "إضافة عميل" : "Add Customer"}
                </Button>
              </Link>
              <Link to="/app/inventory/products">
                <Button variant="outline" className="gap-2">
                  <Package className="size-4" />
                  {rtl ? "إضافة صنف" : "Add Product"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats Bar — fade up animation */}
      <div
        ref={statsBar.ref}
        className={cn(
          "flex items-center gap-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 overflow-x-auto animate-fade-up",
          statsBar.isVisible && "visible"
        )}
      >
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">{rtl ? "الإيرادات" : "Revenue"}</p>
            <p className="text-sm font-bold">{totalRevenue.toLocaleString()} SAR</p>
          </div>
          {revenueTrend !== 0 && (
            <span className={cn("text-[10px] font-medium flex items-center", revenueTrend > 0 ? "text-emerald-600" : "text-red-600")}>
              {revenueTrend > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(revenueTrend).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="w-px h-8 bg-slate-300 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">{rtl ? "العملاء" : "Customers"}</p>
            <p className="text-sm font-bold">{totalCustomers}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-300 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">{rtl ? "الموردون" : "Suppliers"}</p>
            <p className="text-sm font-bold">{totalSuppliers}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-300 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Package className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">{rtl ? "الأصناف" : "Products"}</p>
            <p className="text-sm font-bold">{totalProducts}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-300 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500">{rtl ? "الموظفون" : "Employees"}</p>
            <p className="text-sm font-bold">{totalEmployees}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions — staggered scale-in */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-slate-600 flex items-center gap-2">
          <Zap className="size-4" />
          {rtl ? "إجراءات سريعة" : "Quick Actions"}
        </h3>
        <div ref={quickActionsAnim.ref} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
          {quickActions.map((action, i) => (
            <Link key={action.path} to={action.path}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl text-white text-center animate-scale-in",
                  action.color,
                  quickActionsAnim.isVisible && "visible",
                )}
                style={quickActionsAnim.getItemStyle(i)}
              >
                <action.icon className="size-5" />
                <span className="text-[10px] font-medium leading-tight">{rtl ? action.labelAr : action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-600 flex items-center gap-2">
            <AlertCircle className="size-4" />
            {rtl ? "تنبيهات" : "Alerts"}
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">{alerts.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert, i) => (
              <Link key={i} to={alert.path}>
                <div className={cn("p-3 rounded-lg border flex items-center gap-3 hover:shadow-sm transition-all group", severityColors[alert.severity])}>
                  <alert.icon className="size-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{rtl ? alert.labelAr : alert.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-bold">{alert.count}</p>
                      <span className="text-[10px] opacity-70">{rtl ? alert.action : alert.action}</span>
                    </div>
                  </div>
                  <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards — staggered fade-up */}
      <div ref={kpiAnim.ref} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((kpi, i) => (
          <Card
            key={i}
            className="hover:shadow-md transition-shadow card-lift"
            style={kpiAnim.getItemStyle(i)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", kpi.bg)}>
                  <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-slate-500">{rtl ? kpi.titleAr : kpi.title}</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-20 mt-1" />
                ) : (
                  <p className="text-xl font-bold">
                    {kpi.title === "Today's Sales"
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

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-blue-600" />
              <p className="text-xs text-blue-700 font-medium">{rtl ? "ذمم مدينة" : "Receivables"}</p>
            </div>
            <p className="text-lg font-bold text-blue-800 mt-1">
              {statsLoading ? "—" : `${totalRevenue.toLocaleString()} SAR`}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-orange-600" />
              <p className="text-xs text-orange-700 font-medium">{rtl ? "ذمم دائنة" : "Payables"}</p>
            </div>
            <p className="text-lg font-bold text-orange-800 mt-1">
              {statsLoading ? "—" : "0 SAR"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-600" />
              <p className="text-xs text-emerald-700 font-medium">{rtl ? "الإيرادات" : "Revenue"}</p>
            </div>
            <p className="text-lg font-bold text-emerald-800 mt-1">{totalRevenue.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-purple-600" />
              <p className="text-xs text-purple-700 font-medium">{rtl ? "المشاريع النشطة" : "Active Projects"}</p>
            </div>
            <p className="text-lg font-bold text-purple-800 mt-1">{activeProjects}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{rtl ? "الإيرادات الشهرية" : "Revenue by Month"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} SAR`, rtl ? "الإيرادات" : "Revenue"]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{rtl ? "نظرة عامة" : "Business Overview"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: rtl ? "الإيرادات" : "Revenue", value: stats?.totalRevenue || 1 },
                    { name: rtl ? "المدينون" : "Receivables", value: stats?.totalCustomers || 1 },
                    { name: rtl ? "الموردون" : "Payables", value: stats?.totalSuppliers || 1 },
                    { name: rtl ? "الأصناف" : "Products", value: stats?.totalProducts || 1 },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
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
            <CardTitle className="text-base font-semibold">{rtl ? "آخر الفواتير" : "Recent Invoices"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices?.length === 0 && <p className="text-sm text-slate-500">{rtl ? "لا توجد فواتير بعد" : "No invoices yet"}</p>}
              {recentInvoices?.slice(0, 5).map((inv) => (
                <Link
                  key={inv.id}
                  to={`/app/sales/invoices`}
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
            <CardTitle className="text-base font-semibold">{rtl ? "أفضل العملاء" : "Top Customers"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers?.length === 0 && <p className="text-sm text-slate-500">{rtl ? "لا يوجد عملاء بعد" : "No customers yet"}</p>}
              {topCustomers?.slice(0, 5).map((cust, i) => (
                <div key={cust.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
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
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {rtl ? "إجراءات مطلوبة" : "Exception Queue"}
              <Badge variant="outline" className="text-[10px]">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: rtl ? "فواتير في انتظار الموافقة" : "Invoices waiting approval", value: 12, tone: "bg-amber-50 text-amber-700", icon: FileText, path: "/app/sales/invoices" },
              { label: rtl ? "أصناف منخفضة المخزون" : "Stock below reorder point", value: stats?.lowStockItems || 0, tone: "bg-red-50 text-red-700", icon: Package, path: "/app/inventory/stock" },
              { label: rtl ? "مشاريع بدون سجلات وقت" : "Projects missing timesheets", value: 7, tone: "bg-cyan-50 text-cyan-700", icon: Clock, path: "/app/projects/timesheets" },
              { label: rtl ? "تذاكر دعم متأخرة" : "Overdue support tickets", value: stats?.openTickets || 0, tone: "bg-blue-50 text-blue-700", icon: HeadphonesIcon, path: "/app/helpdesk/tickets" },
              { label: rtl ? "أوامر شراء معلقة" : "Pending purchase orders", value: 2, tone: "bg-purple-50 text-purple-700", icon: ShoppingCart, path: "/app/purchase/orders" },
              { label: rtl ? "إجازات في الانتظار" : "Pending leave requests", value: 3, tone: "bg-indigo-50 text-indigo-700", icon: Calendar, path: "/app/hrm/leave" },
            ].filter(item => item.value > 0).map((item) => (
              <Link key={item.label} to={item.path} className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <item.icon className="size-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", item.tone)}>
                  {item.value}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
