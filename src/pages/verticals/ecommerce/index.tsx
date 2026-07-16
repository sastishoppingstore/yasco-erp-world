import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/providers/language";
import ActionButton3D from "@/components/ui/ActionButton3D";
import {
  Globe, ShoppingCart, RefreshCw, Layers, CheckCircle2,
  AlertTriangle, Truck, ArrowUpRight, Search, Printer, DollarSign
} from "lucide-react";

interface EcomOrder {
  id: string;
  channel: "Shopify" | "Salla" | "Zid" | "WhatsApp";
  customerName: string;
  totalAmount: number;
  paymentMethod: "COD" | "Mada" | "Card";
  fulfillmentStatus: "pending" | "packed" | "shipped" | "delivered";
  courier: string;
  date: string;
}

const initialOrders: EcomOrder[] = [
  { id: "ECO-1001", channel: "Salla", customerName: "Abdulrahman Al-Dosari", totalAmount: 249, paymentMethod: "Mada", fulfillmentStatus: "delivered", courier: "Aramex", date: "2026-07-08" },
  { id: "ECO-1002", channel: "Shopify", customerName: "Faisal bin Ahmed", totalAmount: 480, paymentMethod: "COD", fulfillmentStatus: "shipped", courier: "SMSA Express", date: "2026-07-08" },
  { id: "ECO-1003", channel: "Zid", customerName: "Lujain Al-Subaie", totalAmount: 180, paymentMethod: "Card", fulfillmentStatus: "packed", courier: "DHL", date: "2026-07-07" },
  { id: "ECO-1004", channel: "WhatsApp", customerName: "Rayan bin Khalid", totalAmount: 95, paymentMethod: "COD", fulfillmentStatus: "pending", courier: "Self Dispatch", date: "2026-07-08" }
];

export default function EcommercePage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [orders, setOrders] = useState<EcomOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const filteredOrders = orders.filter(o => {
    return o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.channel.toLowerCase().includes(search.toLowerCase());
  });

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert(isAr ? "تمت المزامنة بنجاح مع منصات سلة، زد وشوبيفاي!" : "Synced successfully with Salla, Zid, and Shopify channels!");
    }, 1500);
  };

  const updateFulfillment = (id: string, status: EcomOrder["fulfillmentStatus"]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, fulfillmentStatus: status } : o));
  };

  const channelBadges: Record<string, string> = {
    Shopify: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Salla: "bg-blue-100 text-blue-800 border-blue-200",
    Zid: "bg-purple-100 text-purple-800 border-purple-200",
    WhatsApp: "bg-green-100 text-green-800 border-green-200"
  };

  const statusBadges: Record<string, string> = {
    pending: "bg-slate-100 text-slate-700 border-slate-200",
    packed: "bg-yellow-100 text-yellow-700 border-yellow-200",
    shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200"
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="size-6 text-fuchsia-600" />
            {isAr ? "بوابة التجارة الإلكترونية ومزامنة القنوات" : "E-Commerce Channel Sync Portal"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "متابعة وتحديث مبيعات منصات سلة، زد وشوبيفاي وتأكيد التوصيل COD" : "Monitor sales channels (Salla, Zid, Shopify), inventory sync, and COD reconciliations"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton3D
            icon={<RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />}
            label={syncing ? (isAr ? "جاري المزامنة..." : "Syncing...") : (isAr ? "مزامنة القنوات" : "Sync Channels Now")}
            color="indigo"
            onClick={triggerSync}
            disabled={syncing}
          />
        </div>
      </div>

      {/* API Integrations Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">SALLA.SA API</span>
              <p className="font-bold text-lg mt-0.5">{isAr ? "متصل ومزامن" : "Connected & Synced"}</p>
              <span className="text-[10px] text-emerald-600">Last sync: 5 mins ago</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">ZID.SA API</span>
              <p className="font-bold text-lg mt-0.5">{isAr ? "متصل ومزامن" : "Connected & Synced"}</p>
              <span className="text-[10px] text-purple-600">Last sync: 12 mins ago</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">SHOPIFY API</span>
              <p className="font-bold text-lg mt-0.5">{isAr ? "متصل ومزامن" : "Connected & Synced"}</p>
              <span className="text-[10px] text-indigo-600">Last sync: 20 mins ago</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">{isAr ? "الطلبات المستوردة مؤخراً" : "Recent Channel Orders"}</CardTitle>
                <CardDescription>{isAr ? "الطلبات المستوردة تلقائياً من المتاجر الإلكترونية" : "Auto-imported online storefront orders"}</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder={isAr ? "بحث بالعميل/القناة..." : "Search client/channel..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {filteredOrders.map(order => (
                  <div key={order.id} className="py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{order.id}</span>
                        <Badge variant="outline" className={`text-[10px] ${channelBadges[order.channel]}`}>
                          {order.channel}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${statusBadges[order.fulfillmentStatus]}`}>
                          {order.fulfillmentStatus}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">{order.customerName}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{isAr ? "التاريخ" : "Date"}: {order.date}</span>
                        <span>{isAr ? "شركة الشحن" : "Courier"}: {order.courier}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold">{order.totalAmount} SAR</p>
                        <span className="text-[10px] text-slate-500 uppercase">{order.paymentMethod}</span>
                      </div>

                      <Select
                        value={order.fulfillmentStatus}
                        onValueChange={(val) => updateFulfillment(order.id, val as EcomOrder["fulfillmentStatus"])}
                      >
                        <SelectTrigger className="h-8 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{isAr ? "انتظار" : "Pending"}</SelectItem>
                          <SelectItem value="packed">{isAr ? "معبأ" : "Packed"}</SelectItem>
                          <SelectItem value="shipped">{isAr ? "مشحون" : "Shipped"}</SelectItem>
                          <SelectItem value="delivered">{isAr ? "مستلم" : "Delivered"}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500" title={isAr ? "طباعة بوليصة الشحن" : "Print Waybill"}>
                        <Printer className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingCart className="size-12 mx-auto mb-2 text-slate-300" />
                    <p>{isAr ? "لا توجد طلبات مزامنة" : "No synced orders found"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{isAr ? "مستودع الشحن الفوري" : "Order Fulfillment & COD"}</CardTitle>
              <CardDescription>{isAr ? "تتبع تحصيل الدفع عند الاستلام COD" : "Fulfillment routes and payment clearance"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border rounded-lg bg-slate-50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{isAr ? "شحنات COD معلقة التحصيل" : "Pending COD Collections"}</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">2</Badge>
                </div>
                <p className="text-xl font-bold">575 SAR</p>
                <p className="text-[10px] text-slate-400">{isAr ? "تحت التسوية مع سمسا وأرامكس" : "Pending settlement from SMSA/Aramex"}</p>
              </div>

              <div className="rounded-lg bg-blue-50/50 p-3 border border-blue-100">
                <div className="flex gap-2">
                  <Truck className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-bold">{isAr ? "ربط بوليصات الشحن (Bayan)" : "Bayan Transport Link"}</p>
                    <p className="mt-1">{isAr ? "بوابة الهيئة العامة للنقل (TGA) متصلة لإنشاء بوليصات النقل والشحن تلقائياً." : "Directway connection with TGA portal for courier/freight trip waybill clearance."}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">{isAr ? "صحة مخزون المتاجر" : "Channel Stock Health"}</p>
                <div className="flex justify-between text-xs py-1 border-b">
                  <span>Salla Stock Sync</span>
                  <span className="text-emerald-600 font-bold">100% OK</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b">
                  <span>Shopify Stock Sync</span>
                  <span className="text-emerald-600 font-bold">100% OK</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span>Zid Stock Sync</span>
                  <span className="text-amber-600 font-bold">98% (2 Mismatches)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
