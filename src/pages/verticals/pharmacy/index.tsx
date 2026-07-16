import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language";
import {
  Pill, Package, ShoppingBag, FileWarning, AlertTriangle, Store, ClipboardList, TrendingUp, DollarSign
} from "lucide-react";

const statsCards = [
  { label: "Total Medications", labelAr: "إجمالي الأدوية", value: "1,284", icon: Pill, color: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700" },
  { label: "Low Stock Items", labelAr: "أصناف منخفضة المخزون", value: "23", icon: AlertTriangle, color: "from-amber-50 to-amber-100 border-amber-200 text-amber-700" },
  { label: "Near Expiry (30d)", labelAr: "قريب الصلاحية (30 يوم)", value: "45", icon: FileWarning, color: "from-rose-50 to-rose-100 border-rose-200 text-rose-700" },
  { label: "Pending Prescriptions", labelAr: "وصفات معلقة", value: "12", icon: ClipboardList, color: "from-blue-50 to-blue-100 border-blue-200 text-blue-700" },
  { label: "Today's Sales", labelAr: "مبيعات اليوم", value: "8,450 SAR", icon: DollarSign, color: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700" },
  { label: "Monthly Revenue", labelAr: "الإيرادات الشهرية", value: "142,000 SAR", icon: TrendingUp, color: "from-blue-50 to-blue-100 border-blue-200 text-blue-700" },
];

const lowStockItems = [
  { name: "Amoxicillin 500mg", batch: "BATCH-0234", stock: 15, minLevel: 50, expiry: "2026-09-15" },
  { name: "Paracetamol 500mg", batch: "BATCH-0456", stock: 30, minLevel: 100, expiry: "2026-12-20" },
  { name: "Omeprazole 20mg", batch: "BATCH-0789", stock: 8, minLevel: 40, expiry: "2026-08-10" },
  { name: "Atorvastatin 10mg", batch: "BATCH-0123", stock: 20, minLevel: 60, expiry: "2027-01-05" },
  { name: "Metformin 500mg", batch: "BATCH-0567", stock: 12, minLevel: 80, expiry: "2026-10-30" },
];

const quickActions = [
  { label: "New Prescription", labelAr: "وصفة جديدة", icon: ClipboardList, path: "/app/verticals/pharmacy/prescriptions", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Pharmacy POS", labelAr: "نقطة بيع الصيدلية", icon: Store, path: "/app/pos/pharmacy", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Stock Check", labelAr: "فحص المخزون", icon: Package, path: "/app/verticals/pharmacy/stock", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Supplier Order", labelAr: "طلب مورد", icon: ShoppingBag, path: "/app/verticals/pharmacy/suppliers", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

export default function PharmacyDashboard() {
  const { language, isAr } = useLanguage();
  const rtl = language === "ar";
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{rtl ? "لوحة الصيدلية" : "Pharmacy Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">{rtl ? "إدارة المخزون الدوائي والوصفات والصلاحية" : "Manage medications, prescriptions, and expiry"}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statsCards.map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br ${stat.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <stat.icon className="size-4" />
                <p className="text-xs font-medium">{rtl ? stat.labelAr : stat.label}</p>
              </div>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{rtl ? "تنبيهات المخزون" : "Stock Alerts"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.batch} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{rtl ? `الكمية: ${item.stock} | الحد: ${item.minLevel}` : `Stock: ${item.stock} | Min: ${item.minLevel}`}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">{item.expiry}</Badge>
                    <p className="text-xs text-rose-600 font-medium mt-1">{rtl ? "منخفض" : "Low Stock"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{rtl ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${action.color} hover:shadow-md transition-all`}
                >
                  <action.icon className="size-6" />
                  <span className="text-xs font-medium text-center">{rtl ? action.labelAr : action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
