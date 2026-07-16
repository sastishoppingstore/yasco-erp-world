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
  Shirt, RefreshCw, PlusCircle, Search, ClipboardList, CheckCircle2,
  Clock, Truck, MessageSquare, Printer, DollarSign, Eye, AlertTriangle
} from "lucide-react";

interface LaundryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  itemsCount: number;
  totalAmount: number;
  status: "received" | "washing" | "ironing" | "ready" | "delivered";
  paymentStatus: "paid" | "unpaid";
  garmentDetails: string;
  date: string;
  deliveryType: "pickup" | "delivery";
}

const initialOrders: LaundryOrder[] = [
  { id: "LND-2026-001", customerName: "Mohammed Al-Saeed", customerPhone: "+966 50 123 4567", itemsCount: 5, totalAmount: 75, status: "ready", paymentStatus: "paid", garmentDetails: "3 Thobes, 2 Shirts", date: "2026-07-08", deliveryType: "pickup" },
  { id: "LND-2026-002", customerName: "Sara Al-Otaibi", customerPhone: "+966 55 987 6543", itemsCount: 8, totalAmount: 120, status: "washing", paymentStatus: "unpaid", garmentDetails: "2 Abayas, 4 Dresses, 2 Jackets", date: "2026-07-08", deliveryType: "delivery" },
  { id: "LND-2026-003", customerName: "Fahad bin Khalid", customerPhone: "+966 53 111 2222", itemsCount: 12, totalAmount: 180, status: "ironing", paymentStatus: "paid", garmentDetails: "10 Suits, 2 Coats", date: "2026-07-07", deliveryType: "pickup" },
  { id: "LND-2026-004", customerName: "Khalid Al-Dossary", customerPhone: "+966 54 444 5555", itemsCount: 4, totalAmount: 50, status: "received", paymentStatus: "unpaid", garmentDetails: "4 Shirts", date: "2026-07-08", deliveryType: "pickup" },
  { id: "LND-2026-005", customerName: "Ahmed bin Zayed", customerPhone: "+966 56 777 8888", itemsCount: 2, totalAmount: 40, status: "delivered", paymentStatus: "paid", garmentDetails: "1 Carpet (Small)", date: "2026-07-06", deliveryType: "delivery" }
];

export default function LaundryPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [orders, setOrders] = useState<LaundryOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  // New Order Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [garmentDetails, setGarmentDetails] = useState("");
  const [itemsCount, setItemsCount] = useState(1);
  const [totalAmount, setTotalAmount] = useState(15);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (id: string, newStatus: LaundryOrder["status"]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    const newOrder: LaundryOrder = {
      id: `LND-2026-0${orders.length + 1}`,
      customerName,
      customerPhone,
      itemsCount,
      totalAmount,
      status: "received",
      paymentStatus: "unpaid",
      garmentDetails,
      date: new Date().toISOString().split("T")[0],
      deliveryType
    };

    setOrders([newOrder, ...orders]);
    setNewOrderOpen(false);
    // Reset Form
    setCustomerName("");
    setCustomerPhone("");
    setGarmentDetails("");
    setItemsCount(1);
    setTotalAmount(15);
  };

  const sendWhatsAppNotification = (order: LaundryOrder) => {
    const message = isAr
      ? `مرحباً ${order.customerName}، ملابسك جاهزة للاستلام في مغسلتنا. رقم الطلب: ${order.id}. المبلغ المطلوب: ${order.totalAmount} ريال.`
      : `Hello ${order.customerName}, your garments are ready for collection. Order ID: ${order.id}. Total amount: ${order.totalAmount} SAR.`;
    window.open(`https://wa.me/${order.customerPhone.replace(/\s+/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const statusBadges: Record<string, { label: string; labelAr: string; color: string }> = {
    received: { label: "Received", labelAr: "تم الاستلام", color: "bg-slate-100 text-slate-700 border-slate-200" },
    washing: { label: "Washing", labelAr: "جاري الغسيل", color: "bg-blue-100 text-blue-700 border-blue-200" },
    ironing: { label: "Ironing", labelAr: "جاري الكي", color: "bg-orange-100 text-orange-700 border-orange-200" },
    ready: { label: "Ready", labelAr: "جاهز للاستلام", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    delivered: { label: "Delivered", labelAr: "تم التسليم", color: "bg-violet-100 text-violet-700 border-violet-200" }
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shirt className="size-6 text-blue-600" />
            {isAr ? "نظام إدارة المغسلة والعناية بالملابس" : "Laundry & Garment Care Management"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "متابعة استلام الملابس، الغسيل، الكي، والتسليم مع التنبيهات" : "Track garment intake, washing, ironing, delivery and notifications"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton3D
            icon={<PlusCircle className="size-4" />}
            label={isAr ? "طلب استلام جديد" : "New Garment Intake"}
            color="emerald"
            onClick={() => setNewOrderOpen(true)}
          />
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-slate-500 mb-1">
              <span className="text-xs">{isAr ? "استلام اليوم" : "Intake Today"}</span>
              <Shirt className="size-4" />
            </div>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-blue-600 mb-1">
              <span className="text-xs">{isAr ? "تحت الغسيل" : "Washing"}</span>
              <RefreshCw className="size-4 animate-spin-slow" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{orders.filter(o => o.status === "washing").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-orange-600 mb-1">
              <span className="text-xs">{isAr ? "تحت الكي" : "Ironing"}</span>
              <ClipboardList className="size-4" />
            </div>
            <p className="text-2xl font-bold text-orange-700">{orders.filter(o => o.status === "ironing").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-emerald-600 mb-1">
              <span className="text-xs">{isAr ? "جاهز للتسليم" : "Ready"}</span>
              <CheckCircle2 className="size-4" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{orders.filter(o => o.status === "ready").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-slate-500 mb-1">
              <span className="text-xs">{isAr ? "الدخل اليومي" : "Daily Income"}</span>
              <DollarSign className="size-4" />
            </div>
            <p className="text-2xl font-bold">{orders.reduce((acc, o) => acc + o.totalAmount, 0)} SAR</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workflows Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders Pipeline (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">{isAr ? "سجل طلبات المغسلة" : "Garment Intake Register"}</CardTitle>
                <CardDescription>{isAr ? "إدارة حالة الطلبات والتسليم للزبائن" : "Manage statuses and customer notifications"}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    placeholder={isAr ? "بحث بالاسم/الهاتف..." : "Search name/phone..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isAr ? "الكل" : "All Status"}</SelectItem>
                    <SelectItem value="received">{isAr ? "تم الاستلام" : "Received"}</SelectItem>
                    <SelectItem value="washing">{isAr ? "غسيل" : "Washing"}</SelectItem>
                    <SelectItem value="ironing">{isAr ? "كي" : "Ironing"}</SelectItem>
                    <SelectItem value="ready">{isAr ? "جاهز" : "Ready"}</SelectItem>
                    <SelectItem value="delivered">{isAr ? "سلمت" : "Delivered"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {filteredOrders.map(order => (
                  <div key={order.id} className="py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{order.id}</span>
                        <Badge variant="outline" className={`text-[10px] ${statusBadges[order.status].color}`}>
                          {isAr ? statusBadges[order.status].labelAr : statusBadges[order.status].label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {order.deliveryType === "pickup" ? (
                            <span className="flex items-center gap-1"><Clock className="size-3" /> {isAr ? "استلام من المحل" : "Self Pickup"}</span>
                          ) : (
                            <span className="flex items-center gap-1"><Truck className="size-3" /> {isAr ? "توصيل للمنزل" : "Delivery"}</span>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">{order.customerName} · <span className="text-xs text-slate-500 font-normal">{order.customerPhone}</span></p>
                      <p className="text-xs text-slate-500">{order.garmentDetails} ({order.itemsCount} {isAr ? "قطع" : "items"})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-3">
                        <p className="text-sm font-bold">{order.totalAmount} SAR</p>
                        <Badge variant="ghost" className={`text-[10px] ${order.paymentStatus === "paid" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                          {order.paymentStatus === "paid" ? (isAr ? "مدفوعة" : "Paid") : (isAr ? "غير مدفوعة" : "Unpaid")}
                        </Badge>
                      </div>

                      {/* Status transitions */}
                      <Select
                        value={order.status}
                        onValueChange={(val) => updateOrderStatus(order.id, val as LaundryOrder["status"])}
                      >
                        <SelectTrigger className="h-8 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="received">{isAr ? "استلام" : "Received"}</SelectItem>
                          <SelectItem value="washing">{isAr ? "غسيل" : "Washing"}</SelectItem>
                          <SelectItem value="ironing">{isAr ? "كي" : "Ironing"}</SelectItem>
                          <SelectItem value="ready">{isAr ? "جاهز" : "Ready"}</SelectItem>
                          <SelectItem value="delivered">{isAr ? "تم التسليم" : "Delivered"}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-slate-500"
                        title={isAr ? "طباعة تيكيت الملابس" : "Print Garment Tags"}
                      >
                        <Printer className="size-4" />
                      </Button>

                      {order.status === "ready" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => sendWhatsAppNotification(order)}
                          className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700"
                          title={isAr ? "إشعار واتساب بالجاهزية" : "Send Ready Alert via WhatsApp"}
                        >
                          <MessageSquare className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Shirt className="size-12 mx-auto mb-2 text-slate-300" />
                    <p>{isAr ? "لا توجد طلبات تطابق معايير البحث" : "No laundry orders match your criteria"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Garment Intake / New Order (Right column) */}
        <div className="space-y-4">
          {newOrderOpen ? (
            <Card className="border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base text-emerald-700">{isAr ? "استلام ملابس جديدة" : "New Garment Intake Details"}</CardTitle>
                <CardDescription>{isAr ? "سجل تفاصيل الغسيل والزبون هنا" : "Register customer & garment specification"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{isAr ? "اسم العميل" : "Customer Name"} *</Label>
                    <Input required placeholder="Ahmed Al-Kharji" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "رقم الجوال" : "Mobile Phone"} *</Label>
                    <Input required placeholder="+966 50 000 0000" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "الملابس المستلمة (التفاصيل والعدد)" : "Garments & Tags"} *</Label>
                    <Input required placeholder="2 Thobe (White), 1 Suit (Dry Clean)" value={garmentDetails} onChange={(e) => setGarmentDetails(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{isAr ? "إجمالي القطع" : "Items Count"}</Label>
                      <Input type="number" min="1" value={itemsCount} onChange={(e) => setItemsCount(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>{isAr ? "المبلغ الإجمالي (ريال)" : "Total (SAR)"}</Label>
                      <Input type="number" min="5" value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "طريقة التسليم" : "Type"}</Label>
                    <Select value={deliveryType} onValueChange={(val) => setDeliveryType(val as "pickup" | "delivery")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">{isAr ? "استلام من المحل" : "Self Pickup"}</SelectItem>
                        <SelectItem value="delivery">{isAr ? "توصيل للمنزل" : "Home Delivery"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setNewOrderOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{isAr ? "حفظ واستلام" : "Intake & Save"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isAr ? "تيكيت الملابس السريع" : "Quick Garment Tagging"}</CardTitle>
                <CardDescription>{isAr ? "طباعة تيكيتات الباركود للملابس لتعليقها" : "Print barcode labels to attach to garments"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-dashed rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center">
                  <Printer className="size-8 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold">{isAr ? "تيكيت لاصق للملابس" : "Sticky Garment Label Preview"}</p>
                  <div className="w-full mt-3 p-2 bg-white border text-left text-[10px] font-mono leading-tight space-y-1">
                    <div className="flex justify-between border-b pb-1">
                      <span>LAUNDRY TAG</span>
                      <span>2026-07-08</span>
                    </div>
                    <div className="font-bold text-center py-1">LND-2026-004</div>
                    <div>Cust: Khalid Al-Dossary</div>
                    <div>Item 1 of 4: White Shirt</div>
                    <div>Wash & Iron | Normal Care</div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full gap-2">
                    <Printer className="size-3.5" />
                    {isAr ? "طباعة تجريبية" : "Print Test Tag"}
                  </Button>
                </div>

                <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                  <div className="flex gap-2">
                    <AlertTriangle className="size-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-bold">{isAr ? "ضريبة القيمة المضافة 15%" : "Saudi VAT 15%"}</p>
                      <p className="mt-1">{isAr ? "جميع الفواتير المصدرة ترحل وتنتج رمز QR متوافق تماماً مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)." : "All billing invoices generated are logged and stamp-compliant with ZATCA rules."}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
