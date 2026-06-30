import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/providers/language";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Scale, Package, Truck, Search, Plus, Trash2, DollarSign,
  Percent, CreditCard, Landmark, Building2, Receipt, Copy,
  BarChart3, Tags,
} from "lucide-react";

export default function WholesalePOSPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";

  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerModal, setCustomerModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentModal, setPaymentModal] = useState(false);
  const [priceTiers, setPriceTiers] = useState<any[]>([]);
  const [tradeDiscountPct, setTradeDiscountPct] = useState("0");
  const [taxExempt, setTaxExempt] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [frequentItems, setFrequentItems] = useState<any[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const trpcUtils = trpc.useUtils();

  useEffect(() => {
    searchRef.current?.focus();
    trpcUtils.posWholesale.priceTierList.fetch().then(setPriceTiers);
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 1) { setItems([]); return; }
    const result = await trpcUtils.pos.itemSearch.fetch({ query: q });
    setItems(result || []);
  }, [trpcUtils]);

  const handleAddItem = useCallback((item: any) => {
    setCart(prev => {
      const existing = prev.find((i: any) => i.productId === item.id);
      if (existing) {
        return prev.map((i: any) =>
          i.productId === item.id
            ? { ...i, quantity: i.quantity + 1, totalAmount: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [...prev, {
        productId: item.id, name: item.name, nameAr: item.nameAr,
        quantity: 1, unitPrice: Number(item.salePrice || 0),
        discount: 0, taxRate: Number(item.taxRate || 0),
        totalAmount: Number(item.salePrice || 0),
      }];
    });
    setSearchQuery("");
    setItems([]);
    searchRef.current?.focus();
  }, []);

  const handleQtyChange = useCallback((productId: number, qty: number) => {
    setCart(prev => prev.map((i: any) =>
      i.productId === productId
        ? { ...i, quantity: Math.max(1, qty), totalAmount: Math.max(1, qty) * i.unitPrice - i.discount }
        : i
    ));
  }, []);

  const handleCustomerSelect = useCallback(async (c: any) => {
    setSelectedCustomer(c);
    setCustomerModal(false);
    if (c) {
      // Load frequent items
      const freq = await trpcUtils.posWholesale.customerFrequentItems.fetch({ customerId: c.id, limit: 5 });
      setFrequentItems(freq || []);
    }
  }, [trpcUtils]);

  const handleCustomerSearch = useCallback(async (q: string) => {
    const result = await trpcUtils.pos.customerSearch.fetch({ query: q });
    setCustomers(result || []);
  }, [trpcUtils]);

  const subtotal = cart.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);
  const discountTotal = cart.reduce((s: number, i: any) => s + i.discount, 0);
  const tradeDisc = subtotal * (Number(tradeDiscountPct) / 100);
  const taxTotal = taxExempt ? 0 : cart.reduce((s: number, i: any) => s + (i.totalAmount * i.taxRate / 100), 0);
  const grandTotal = subtotal - discountTotal - tradeDisc + taxTotal;

  const handlePayment = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      await trpcUtils.posWholesale.createBulkInvoice.mutate({
        customerId: selectedCustomer?.id,
        date: new Date().toISOString().split("T")[0],
        paymentMethod: paymentMethod as any,
        paymentAmount: String(grandTotal),
        subtotal: String(subtotal),
        taxAmount: String(taxTotal),
        discountAmount: String(discountTotal),
        tradeDiscountPercent: tradeDiscountPct,
        totalAmount: String(grandTotal),
        taxExempt,
        notes: remarks,
        items: cart.map((i: any) => ({
          productId: i.productId, description: i.name,
          quantity: i.quantity, unitPrice: String(i.unitPrice),
          discount: String(i.discount), taxRate: String(i.taxRate),
          totalAmount: String(i.quantity * i.unitPrice),
        })),
      });
      toast.success("Wholesale invoice created");
      setCart([]);
      setSelectedCustomer(null);
      setPaymentModal(false);
    } catch (e: any) {
      toast.error(e.message || "Sale failed");
    }
  }, [cart, selectedCustomer, paymentMethod, grandTotal, subtotal, taxTotal, discountTotal, tradeDiscountPct, taxExempt, remarks, trpcUtils]);

  const handleLoadLastOrder = useCallback(async () => {
    if (!selectedCustomer) return;
    const last = await trpcUtils.posWholesale.customerLastOrder.fetch({ customerId: selectedCustomer.id });
    if (last?.items) {
      setCart(last.items.map((i: any) => ({
        productId: i.productId, name: `Product #${i.productId}`,
        quantity: i.quantity, unitPrice: Number(i.unitPrice),
        discount: 0, taxRate: 0, totalAmount: Number(i.unitPrice) * i.quantity,
      })));
      toast.success("Last order loaded");
    }
  }, [selectedCustomer, trpcUtils]);

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div dir={dir} className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#123c2e] text-white px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm font-bold flex items-center gap-2">
            <Truck className="size-4" /> Wholesale POS
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 lg:border-r bg-white">
          <div className="p-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder={rtl ? "ابحث بالاسم أو الباركود..." : "Search by name or barcode..."}
                className="pl-10 h-12 text-lg font-medium"
              />
            </div>
            {items.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-green-50 cursor-pointer border-b last:border-0" onClick={() => handleAddItem(item)}>
                    <div className="flex items-center gap-3">
                      <Package className="size-5 text-gray-400 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{rtl && item.nameAr ? item.nameAr : item.name}</p>
                        <p className="text-xs text-gray-500">{rtl ? "متوفر" : "Stock"}: {item.stockQty}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">{formatCurrency(Number(item.salePrice))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 p-3 overflow-auto">
            {frequentItems.length > 0 && selectedCustomer && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase flex items-center gap-1">
                  <Copy className="size-3" /> {rtl ? "المنتجات المتكررة" : "Frequent Items"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {frequentItems.map((f: any) => (
                    <Badge key={f.productId} variant="secondary" className="cursor-pointer text-xs" onClick={() => handleAddItem({ id: f.productId, name: f.productName, salePrice: f.salePrice })}>
                      {f.productName} ({f.totalQty})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.slice(0, 20).map(item => (
                <div key={item.id} className="border rounded-xl p-3 hover:border-green-500 hover:shadow-md cursor-pointer transition-all text-center bg-white" onClick={() => handleAddItem(item)}>
                  <div className="w-12 h-12 mx-auto rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                    <Package className="size-6 text-blue-700" />
                  </div>
                  <p className="text-xs font-medium truncate">{rtl && item.nameAr ? item.nameAr : item.name}</p>
                  <p className="text-sm font-bold text-blue-700 mt-1">{formatCurrency(Number(item.salePrice))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col bg-white min-h-0">
          <div className="p-3 border-b shrink-0 space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2 h-10" onClick={() => setCustomerModal(true)}>
              <Building2 className="size-4 text-gray-400" />
              {selectedCustomer ? selectedCustomer.name : (rtl ? "اختيار عميل" : "Select Customer")}
            </Button>
            {selectedCustomer && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleLoadLastOrder}>
                  <Copy className="size-3 mr-1" /> {rtl ? "آخر طلب" : "Last Order"}
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <Scale className="size-16 mb-4 opacity-30" />
                <p className="text-sm">{rtl ? "السلة فارغة" : "Cart is empty"}</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {cart.map((item: any, idx: number) => (
                  <div key={item.productId} className="border rounded-lg p-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate flex-1">{rtl && item.nameAr ? item.nameAr : item.name}</p>
                      <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => setCart((prev: any) => prev.filter((_: any, j: number) => j !== idx))}>
                        <Trash2 className="size-3 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => handleQtyChange(item.productId, item.quantity - 1)}>-</Button>
                        <Input type="number" value={item.quantity} onChange={e => handleQtyChange(item.productId, parseInt(e.target.value) || 1)} className="w-14 h-7 text-center border-0 text-sm" />
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => handleQtyChange(item.productId, item.quantity + 1)}>+</Button>
                      </div>
                      <span className="text-sm font-bold ml-auto">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-3 space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-gray-400" />
              <Input
                type="number"
                value={tradeDiscountPct}
                onChange={e => setTradeDiscountPct(e.target.value)}
                placeholder={rtl ? "خصم تجاري %" : "Trade Disc. %"}
                className="h-8 text-sm"
              />
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input type="checkbox" checked={taxExempt} onChange={e => setTaxExempt(e.target.checked)} />
                {rtl ? "معفى من الضريبة" : "Tax Exempt"}
              </label>
            </div>
            <div className="flex justify-between text-sm text-gray-500"><span>{rtl ? "المجموع الفرعي" : "Subtotal"}</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-red-500"><span>{rtl ? "خصم تجاري" : "Trade Disc."}</span><span>-{formatCurrency(tradeDisc)}</span></div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>{rtl ? "الإجمالي" : "Total"}</span><span className="text-blue-700">{formatCurrency(grandTotal)}</span></div>
            <Button className="w-full bg-blue-700 hover:bg-blue-800" disabled={cart.length === 0} onClick={() => setPaymentModal(true)}>
              <DollarSign className="size-4 mr-2" /> {rtl ? "دفع" : "Pay"}
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Modal */}
      <Dialog open={customerModal} onOpenChange={setCustomerModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{rtl ? "اختيار عميل" : "Select Customer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input onChange={e => handleCustomerSearch(e.target.value)} placeholder={rtl ? "بحث عن عميل..." : "Search customer..."} />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {customers.map(c => (
                <div key={c.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border" onClick={() => handleCustomerSelect(c)}>
                  <p className="text-sm font-medium">{rtl && c.nameAr ? c.nameAr : c.name}</p>
                  <p className="text-xs text-gray-500">{rtl ? "الرصيد" : "Balance"}: {formatCurrency(Number(c.currentBalance))} / {rtl ? "حد ائتماني" : "Limit"}: {formatCurrency(Number(c.creditLimit))}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{rtl ? "الدفع" : "Payment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-700">{formatCurrency(grandTotal)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["cash", "card", "transfer", "cheque", "credit"].map(m => (
                <Button key={m} variant={paymentMethod === m ? "default" : "outline"} className={paymentMethod === m ? "bg-blue-700" : ""} onClick={() => setPaymentMethod(m)}>
                  {m === "cash" && <DollarSign className="size-4 mr-1" />}
                  {m === "credit" && <CreditCard className="size-4 mr-1" />}
                  {rtl ? (m === "cash" ? "نقدي" : m === "card" ? "بطاقة" : m === "transfer" ? "تحويل" : m === "cheque" ? "شيك" : "آجل") : m}
                </Button>
              ))}
            </div>
            {paymentMethod === "credit" && (
              <p className="text-sm text-yellow-600 flex items-center gap-2">
                <AlertTriangle className="size-4" /> {rtl ? "سيتم إضافة المبلغ إلى رصيد العميل" : "Amount will be added to customer balance"}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={handlePayment}>
              {rtl ? "تأكيد" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
