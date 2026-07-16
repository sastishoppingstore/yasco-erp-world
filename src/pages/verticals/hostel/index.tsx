import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language";
import {
  Hotel, CalendarCheck, Receipt, Wrench, Users, Building2, CreditCard, FileText, Plus, ArrowRight, Bed, DoorOpen, ClipboardList
} from "lucide-react";

const statsCards = [
  { label: "Total Rooms", labelAr: "إجمالي الغرف", value: "48", icon: Bed, color: "from-blue-50 to-blue-100 border-blue-200 text-blue-700" },
  { label: "Occupied", labelAr: "مشغول", value: "32", icon: DoorOpen, color: "from-amber-50 to-amber-100 border-amber-200 text-amber-700" },
  { label: "Available", labelAr: "متاح", value: "16", icon: Hotel, color: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700" },
  { label: "Due Checkout", labelAr: "موعد المغادرة", value: "8", icon: CalendarCheck, color: "from-rose-50 to-rose-100 border-rose-200 text-rose-700" },
  { label: "Pending Maintenance", labelAr: "صيانة معلقة", value: "3", icon: Wrench, color: "from-slate-50 to-slate-100 border-slate-200 text-slate-700" },
  { label: "Monthly Revenue", labelAr: "الإيرادات الشهرية", value: "48,000 SAR", icon: CreditCard, color: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700" },
];

const recentBookings = [
  { id: "BKG-001", guest: "Ahmed Al-Otaibi", room: "203", checkIn: "2026-07-05", checkOut: "2026-07-10", status: "Checked In", amount: "3,000 SAR" },
  { id: "BKG-002", guest: "Mohammed Al-Ghamdi", room: "105", checkIn: "2026-07-06", checkOut: "2026-07-08", status: "Checked In", amount: "1,200 SAR" },
  { id: "BKG-003", guest: "Khalid Al-Harbi", room: "310", checkIn: "2026-07-08", checkOut: "2026-07-15", status: "Upcoming", amount: "4,200 SAR" },
  { id: "BKG-004", guest: "Saud Al-Dosari", room: "407", checkIn: "2026-07-04", checkOut: "2026-07-07", status: "Checked Out", amount: "1,800 SAR" },
  { id: "BKG-005", guest: "Fahad Al-Mutairi", room: "112", checkIn: "2026-07-07", checkOut: "2026-07-09", status: "Checked In", amount: "1,000 SAR" },
];

const statusColor: Record<string, string> = {
  "Checked In": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Checked Out": "bg-slate-100 text-slate-600 border-slate-200",
  "Upcoming": "bg-blue-100 text-blue-700 border-blue-200",
  "Cancelled": "bg-rose-100 text-rose-700 border-rose-200",
};

const quickActions = [
  { label: "New Booking", labelAr: "حجز جديد", icon: CalendarCheck, path: "/app/verticals/hostel/bookings", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Room Status", labelAr: "حالة الغرف", icon: DoorOpen, path: "/app/verticals/hostel/rooms", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Rent Invoice", labelAr: "فاتورة إيجار", icon: Receipt, path: "/app/verticals/hostel/rent-invoicing", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Housekeeping", labelAr: "خدمة التنظيف", icon: Wrench, path: "/app/verticals/hostel/housekeeping", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

export default function HostelDashboard() {
  const { language, isAr } = useLanguage();
  const rtl = language === "ar";
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{rtl ? "لوحة السكن" : "Hostel Dashboard"}</h1>
          <p className="text-sm text-muted-foreground">{rtl ? "إدارة غرف السكن والحجوزات والفواتير" : "Manage rooms, bookings, and billing"}</p>
        </div>
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
            <CardTitle className="text-sm font-medium">{rtl ? "الحجوزات الأخيرة" : "Recent Bookings"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.guest}</p>
                    <p className="text-xs text-muted-foreground">{rtl ? `غرفة ${b.room}` : `Room ${b.room}`} | {b.checkIn} - {b.checkOut}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColor[b.status] || ""}>{rtl ? { "Checked In": "مسجل", "Checked Out": "مغادر", "Upcoming": "قادم", "Cancelled": "ملغي" }[b.status] || b.status : b.status}</Badge>
                    <p className="text-xs font-medium mt-1">{b.amount}</p>
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
