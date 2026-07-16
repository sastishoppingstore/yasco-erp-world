import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { Store, UtensilsCrossed, Pill, Warehouse, Clock, BarChart3, ArrowLeftRight, RotateCcw } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";

function formatCurrency(v: number) {
  return v.toLocaleString(undefined, { minimumFractionDigits: 2 }) + " SAR";
}

export default function PosDashboard() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: todaySales } = trpc.pos.todaySalesSummary.useQuery(undefined);

  const posTypes = [
    { title: isAr ? "بيع تجزئة" : "Retail POS", desc: isAr ? "نقطة بيع تجزئة سريعة" : "Fast retail point of sale", icon: Store, path: "/app/pos", color: "bg-blue-600" },
    { title: isAr ? "مطعم" : "Restaurant POS", desc: isAr ? "إدارة طاولات وأوامر المطبخ" : "Table & kitchen order management", icon: UtensilsCrossed, path: "/app/pos/restaurant", color: "bg-emerald-600" },
    { title: isAr ? "صيدلية" : "Pharmacy POS", desc: isAr ? "وصفات طبية ومواد خاضعة للرقابة" : "Prescriptions & controlled substances", icon: Pill, path: "/app/pos/pharmacy", color: "bg-purple-600" },
    { title: isAr ? "جملة" : "Wholesale POS", desc: isAr ? "فواتير جملة وأسعار الدفعات" : "Bulk invoicing & trade pricing", icon: Warehouse, path: "/app/pos/wholesale", color: "bg-orange-600" },
    { title: isAr ? "إدارة الورديات" : "Shift Management", desc: isAr ? "إدارة الصرافات والأرباح" : "Cash drawer & till management", icon: Clock, path: "/app/pos/shift-management", color: "bg-cyan-600" },
    { title: isAr ? "مرتجعات" : "Returns & Refunds", desc: isAr ? "معالجة المرتجعات واسترداد المبالغ" : "Process returns & refunds", icon: RotateCcw, path: "/app/pos/returns", color: "bg-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{isAr ? "نقطة البيع" : "Point of Sale"}</h2>
        <p className="text-slate-500">{isAr ? "إختر نوع نقطة البيع" : "Choose your POS terminal type"}</p>
      </div>

      {todaySales && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{isAr ? "مبيعات اليوم" : "Today's Sales"}</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(todaySales.totalSales || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{isAr ? "المعاملات" : "Transactions"}</p>
              <p className="text-xl font-bold text-emerald-700">{todaySales.transactionCount || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{isAr ? "الضريبة" : "Tax Collected"}</p>
              <p className="text-xl font-bold text-amber-700">{formatCurrency(todaySales.totalTax || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-violet-200">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{isAr ? "متوسط المعاملة" : "Avg Transaction"}</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(todaySales.avgTransaction || 0)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posTypes.map((mod) => (
          <Link key={mod.path} to={mod.path} className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg mb-1">{mod.title}</CardTitle>
                <p className="text-sm text-slate-500">{mod.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
