import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language";
import { ChefHat, CheckCircle2, Clock, Volume2 } from "lucide-react";

interface KdsOrder {
  id: string;
  table: string;
  items: string[];
  timeElapsed: number; // in mins
  status: "pending" | "preparing" | "ready";
  waiter: string;
}

const initialOrders: KdsOrder[] = [
  { id: "ORD-501", table: "Table 4", items: ["1x Kabsa Chicken", "2x Mint Lemonade"], timeElapsed: 8, status: "preparing", waiter: "Saeed" },
  { id: "ORD-502", table: "Table 12", items: ["1x Shawarma Plate", "1x Hummus", "1x Pepsi"], timeElapsed: 2, status: "pending", waiter: "Yousef" },
  { id: "ORD-503", table: "Delivery #3392", items: ["2x Mandi Meat", "1x Greek Salad"], timeElapsed: 15, status: "preparing", waiter: "Driver Dispatch" }
];

export default function RestaurantKitchenPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [orders, setOrders] = useState<KdsOrder[]>(initialOrders);

  const updateStatus = (id: string, status: KdsOrder["status"]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const completeOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="size-6 text-red-600" />
            {isAr ? "شاشة المطبخ KDS" : "Kitchen Display System (KDS)"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "شاشة تحضير الطلبات المباشرة للطهاة وموظفي المطبخ" : "Live food preparation queue and elapsed timing monitors"}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Volume2 className="size-4" />
          {isAr ? "اختبار التنبيه الصوتي" : "Test Sound"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map(order => (
          <Card key={order.id} className={`border-t-4 shadow-sm ${
            order.status === "pending" ? "border-t-yellow-500 bg-yellow-50/10" :
            order.status === "preparing" ? "border-t-blue-500 bg-blue-50/5 animate-pulse" : "border-t-emerald-500 bg-emerald-50/5"
          }`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{order.id} ({order.table})</span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="size-3" />
                  {order.timeElapsed} mins
                </span>
              </div>
              <CardDescription>Waiter: {order.waiter}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-1.5 text-sm font-semibold text-slate-800">
                {order.items.map((item, idx) => (
                  <li key={idx} className="bg-white p-2 rounded border shadow-sm">{item}</li>
                ))}
              </ul>

              <div className="flex gap-2 justify-end pt-2 border-t">
                {order.status === "pending" && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full" onClick={() => updateStatus(order.id, "preparing")}>
                    {isAr ? "بدء التحضير" : "Start Preparing"}
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full" onClick={() => updateStatus(order.id, "ready")}>
                    {isAr ? "جاهز للتسليم" : "Mark Ready"}
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button size="sm" variant="outline" className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50" onClick={() => completeOrder(order.id)}>
                    {isAr ? "تسليم وإقفال" : "Serve & Archive"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
            <CheckCircle2 className="size-16 mx-auto mb-3 text-emerald-500" />
            <p className="font-semibold">{isAr ? "لا توجد طلبات نشطة في المطبخ حالياً" : "All orders completed! The kitchen queue is empty."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
