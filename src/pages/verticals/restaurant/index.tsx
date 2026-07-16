import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language";
import { useNavigate } from "react-router";
import {
  UtensilsCrossed, Grid, ClipboardList, BookOpen, Truck,
  PlusCircle, RefreshCw, ChefHat, CheckCircle2, ChevronRight, BarChart3
} from "lucide-react";

export default function RestaurantDashboard() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const navigate = useNavigate();

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="size-6 text-red-600" />
            {isAr ? "نظام تشغيل المطاعم والمقاهي" : "Restaurant & Cafe Operations Hub"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "لوحة التحكم الرئيسية للمطعم والوصول السريع للمهام" : "Central management and quick actions dashboard"}
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{isAr ? "إجمالي مبيعات اليوم" : "Today's Gross Sales"}</p>
            <p className="text-2xl font-bold">1,840 SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-200">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 mb-1">{isAr ? "طاولات مشغولة حالياً" : "Active Dining Tables"}</p>
            <p className="text-2xl font-bold text-red-700">3 / 8</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 mb-1">{isAr ? "طلبات قيد التحضير (KDS)" : "Cooking in Kitchen"}</p>
            <p className="text-2xl font-bold text-blue-700">3</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 mb-1">{isAr ? "طلبات التوصيل النشطة" : "Active Deliveries"}</p>
            <p className="text-2xl font-bold text-emerald-700">2</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/app/verticals/restaurant/tables")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
              <Grid className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-1">
                {isAr ? "خريطة الطاولات" : "Tables Layout"}
                <ChevronRight className="size-4 opacity-50" />
              </h3>
              <p className="text-xs text-slate-500">{isAr ? "مراقبة إشغال المقاعد وتوزيع الزبائن" : "Manage table seating & customer status"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/app/verticals/restaurant/kitchen")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
              <ChefHat className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-1">
                {isAr ? "شاشة المطبخ KDS" : "Kitchen KDS"}
                <ChevronRight className="size-4 opacity-50" />
              </h3>
              <p className="text-xs text-slate-500">{isAr ? "متابعة طلبات الطهاة والتحضير" : "Real-time kitchen order pipeline"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/app/verticals/restaurant/menu")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
              <BookOpen className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-1">
                {isAr ? "إدارة المنيو" : "Menu Settings"}
                <ChevronRight className="size-4 opacity-50" />
              </h3>
              <p className="text-xs text-slate-500">{isAr ? "تعديل أسعار الأطباق وتكلفة الغذاء" : "Configure prices, items, and cost ratios"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/app/verticals/restaurant/delivery")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
              <Truck className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-1">
                {isAr ? "طلبات التوصيل" : "Delivery Fleet"}
                <ChevronRight className="size-4 opacity-50" />
              </h3>
              <p className="text-xs text-slate-500">{isAr ? "إسناد الطلبات ومتابعة كباتن الدليفري" : "Assign drivers and dispatch runners"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Operations Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-5 text-red-600" />
              {isAr ? "الأصناف الأكثر مبيعاً اليوم" : "Top Selling Menu Items"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Kabsa Chicken", orders: 32, sales: 1120 },
              { name: "Mandi Meat", orders: 12, sales: 780 },
              { name: "Shawarma Plate", orders: 18, sales: 450 }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-2 border-b">
                <span>{item.name} ({item.orders} {isAr ? "طلب" : "orders"})</span>
                <span className="font-bold text-slate-800">{item.sales} SAR</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isAr ? "الورديات ومبيعات الكاشير" : "Cashier Shifts Status"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span>{isAr ? "الوردية الصباحية (مغلقة)" : "Morning Shift (Closed)"}</span>
              <Badge className="bg-slate-100 text-slate-700">Closed</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>{isAr ? "الوردية المسائية (نشطة)" : "Evening Shift (Active)"}</span>
              <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
