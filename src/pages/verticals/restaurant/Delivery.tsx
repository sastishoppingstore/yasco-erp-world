import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language";
import { Truck, MessageSquare, CheckCircle2, User, Search, MapPin } from "lucide-react";

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  amount: number;
  paymentMethod: "COD" | "Paid";
  driverName: string;
  status: "pending" | "dispatched" | "delivered";
}

const initialDeliveries: DeliveryOrder[] = [
  { id: "DEL-401", customerName: "Mohammed bin Zayed", customerPhone: "+966 50 444 5555", address: "Al-Malaz District, Riyadh", amount: 120, paymentMethod: "COD", driverName: "Ahmed", status: "dispatched" },
  { id: "DEL-402", customerName: "Sara Al-Otaibi", customerPhone: "+966 55 111 2222", address: "Olaya Street, Riyadh", amount: 85, paymentMethod: "Paid", driverName: "Yasin", status: "delivered" },
  { id: "DEL-403", customerName: "Fahad bin Khalid", customerPhone: "+966 53 777 8888", address: "Al-Yasmin District, Riyadh", amount: 210, paymentMethod: "COD", driverName: "Unassigned", status: "pending" }
];

export default function RestaurantDeliveryPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(initialDeliveries);

  const assignDriver = (id: string, driver: string) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, driverName: driver, status: "dispatched" as const } : d));
  };

  const markDelivered = (id: string) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: "delivered" as const } : d));
  };

  const statusColors: Record<string, string> = {
    pending: "bg-slate-100 text-slate-700 border-slate-200",
    dispatched: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200"
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="size-6 text-red-600" />
            {isAr ? "إدارة طلبات التوصيل والدليفري" : "Delivery & Dispatch Center"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "متابعة كابتن التوصيل، الطلبات المرسلة، وتحصيل مبالغ الدفع عند الاستلام" : "Track delivery drivers, dispatched orders, and COD collections"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deliveries list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{isAr ? "سجل التوصيل" : "Active Dispatch Log"}</CardTitle>
              <CardDescription>{isAr ? "حالة طلبات التوصيل الحالية وعناوين الزبائن" : "Current delivery runs, courier names, and destinations"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {deliveries.map(del => (
                  <div key={del.id} className="py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{del.id}</span>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[del.status]}`}>
                          {del.status}
                        </Badge>
                        <Badge variant="ghost" className={`text-[10px] ${del.paymentMethod === "COD" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"}`}>
                          {del.paymentMethod}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">{del.customerName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="size-3 text-slate-400" />
                        {del.address}
                      </p>
                      <p className="text-xs text-slate-400">
                        Driver: <span className="font-semibold text-slate-600">{del.driverName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-3">
                        <p className="text-sm font-bold">{del.amount} SAR</p>
                      </div>

                      {del.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => assignDriver(del.id, "Ahmed")} className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white">
                            {isAr ? "إسناد إلى أحمد" : "Assign Ahmed"}
                          </Button>
                          <Button size="sm" onClick={() => assignDriver(del.id, "Yasin")} className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white">
                            {isAr ? "إسناد إلى ياسين" : "Assign Yasin"}
                          </Button>
                        </div>
                      )}
                      {del.status === "dispatched" && (
                        <Button size="sm" onClick={() => markDelivered(del.id)} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                          {isAr ? "تأكيد التوصيل" : "Mark Delivered"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dispatch status sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{isAr ? "إحصاءات تحصيل المبالغ" : "Driver Settlement & COD"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-xs text-slate-500">{isAr ? "إجمالي مبالغ COD المعلقة" : "Total Pending COD Cash"}</span>
                <p className="text-xl font-bold mt-1">330 SAR</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? "بانتظار تسوية السائقين عند انتهاء الوردية" : "Awaiting driver cash drop-off at shift closure"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
