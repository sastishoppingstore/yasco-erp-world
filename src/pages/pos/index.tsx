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
import { toast } from "sonner";
import {
  Search, Plus, Trash2, Printer, Download, Send, Clock,
  User, Hash, ShoppingCart, DollarSign, Percent, Receipt,
  X, PauseCircle, CreditCard, Landmark, Wallet,
  ArrowLeft, CheckCircle2, AlertCircle, Package,
} from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  nameAr: string;
  barcode: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  totalAmount: number;
  stockQty: number;
}

export default function POSPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentModal, setPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [remarks, setRemarks] = useState("");
  const [session, setSession] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerModal, setCustomerModal] = useState(false);
  const [heldSales, setHeldSales] = useState<any[]>([]);
  const [heldModal, setHeldModal] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const itemSearch = trpc.pos.itemSearch.useMutation();
  const customerSearchMut = trpc.pos.customerSearch.useMutation();
  const heldList = trpc.pos.heldSalesList.useQuery(undefined, { enabled: false });
  const createSale = trpc.pos.createSaleInvoice.useMutation();
  const holdSale = trpc.pos.holdSale.useMutation();
  const resumeHold = trpc.pos.resumeHold.useMutation();
  const sessionCurrent = trpc.pos.sessionCurrent.useQuery(undefined, { enabled: false });

  // Focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
    sessionCurrent.refetch().then(r => setSession(r.data || null));
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 1) { setItems([]); return; }
    const result = await itemSearch.mutateAsync({ query: q });
    setItems(result || []);
  }, [itemSearch]);

  const handleAddItem = useCallback((item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === item.id);
      if (existing) {
        return prev.map(i =>
          i.productId === item.id
            ? { ...i, quantity: i.quantity + 1, totalAmount: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      const unitPrice = Number(item.salePrice || 0);
      return [...prev, {
        productId: item.id,
        name: item.name,
        nameAr: item.nameAr || item.name,
        barcode: item.barcode || "",
        sku: item.sku || "",
        quantity: 1,
        unitPrice,
        discount: 0,
        taxRate: Number(item.taxRate || 0),
        totalAmount: unitPrice,
        stockQty: item.stockQty || 0,
      }];
    });
    setSearchQuery("");
    setItems([]);
    searchRef.current?.focus();
  }, []);

  const handleQtyChange = useCallback((productId: number, qty: number) => {
    setCart(prev => prev.map(i =>
      i.productId === productId
        ? { ...i, quantity: Math.max(1, qty), totalAmount: Math.max(1, qty) * i.unitPrice - i.discount }
        : i
    ));
  }, []);

  const handlePriceChange = useCallback((productId: number, price: number) => {
    setCart(prev => prev.map(i =>
      i.productId === productId
        ? { ...i, unitPrice: Math.max(0, price), totalAmount: i.quantity * Math.max(0, price) - i.discount }
        : i
    ));
  }, []);

  const handleDiscountChange = useCallback((productId: number, discount: number) => {
    setCart(prev => prev.map(i =>
      i.productId === productId
        ? { ...i, discount: Math.max(0, discount), totalAmount: i.quantity * i.unitPrice - Math.max(0, discount) }
        : i
    ));
  }, []);

  const handleRemoveItem = useCallback((productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discountTotal = cart.reduce((sum, i) => sum + i.discount, 0);
  const taxTotal = cart.reduce((sum, i) => sum + (i.totalAmount * i.taxRate / 100), 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const handlePayment = useCallback(async () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    try {
      await createSale.mutateAsync({
        customerId: selectedCustomer?.id,
        date: new Date().toISOString().split("T")[0],
        paymentMethod: paymentMethod as any,
        paymentAmount: String(grandTotal),
        subtotal: String(subtotal),
        taxAmount: String(taxTotal),
        discountAmount: String(discountTotal),
        totalAmount: String(grandTotal),
        notes: remarks,
        items: cart.map(i => ({
          productId: i.productId,
          description: i.name,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          discount: String(i.discount),
          taxRate: String(i.taxRate),
          totalAmount: String(i.totalAmount),
        })),
      });
      toast.success("Sale completed successfully!");
      setCart([]);
      setSelectedCustomer(null);
      setRemarks("");
      setPaymentModal(false);
      setCashReceived("");
      searchRef.current?.focus();
    } catch (e: any) {
      toast.error(e.message || "Sale failed");
    }
  }, [cart, selectedCustomer, paymentMethod, grandTotal, subtotal, taxTotal, discountTotal, remarks, createSale]);

  const handleHold = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      await holdSale.mutateAsync({
        customerId: selectedCustomer?.id,
        items: cart,
        subtotal: String(subtotal),
        taxAmount: String(taxTotal),
        discountAmount: String(discountTotal),
        totalAmount: String(grandTotal),
        notes: remarks,
      });
      toast.success("Sale held");
      setCart([]);
      setSelectedCustomer(null);
      setRemarks("");
    } catch (e: any) {
      toast.error(e.message || "Hold failed");
    }
  }, [cart, selectedCustomer, subtotal, taxTotal, discountTotal, grandTotal, remarks, holdSale]);

  const handleResumeHold = useCallback(async (hold: any) => {
    try {
      await resumeHold.mutateAsync({ id: hold.id });
      setCart(hold.items || []);
      setSelectedCustomer(hold.customerId ? { id: hold.customerId } : null);
      setRemarks(hold.notes || "");
      setHeldModal(false);
      toast.success("Hold resumed");
    } catch (e: any) {
      toast.error(e.message || "Failed to resume");
    }
  }, [resumeHold]);

  const handleCustomerSearch = useCallback(async (q: string) => {
    setCustomerSearch(q);
    if (q.length < 1) { setCustomers([]); return; }
    const result = await customerSearchMut.mutateAsync({ query: q });
    setCustomers(result || []);
  }, [customerSearchMut]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "F4") { e.preventDefault(); handleSearch(searchQuery); }
      if (e.key === "F8") { e.preventDefault(); setHeldModal(true); heldList.refetch(); }
      if (e.key === "F11") { e.preventDefault(); if (cart.length > 0) setPaymentModal(true); }
      if (e.key === "F12") { e.preventDefault(); handlePayment(); }
      if (e.key === "Escape") { setPaymentModal(false); setHeldModal(false); setCustomerModal(false); }
      if (e.key === "Delete" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        // Remove last item
        setCart(prev => prev.slice(0, -1));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setCart([]);
        setSelectedCustomer(null);
        setRemarks("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        // Print placeholder
        toast.info("Print invoice (simulated)");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart, searchQuery, handleSearch, handlePayment, heldList]);

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div dir={dir} className="h-full flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-[#123c2e] text-white px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm font-bold">
            POS
          </div>
          <span className="text-sm opacity-80 hidden sm:inline">
            {new Date().toLocaleDateString(rtl ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-white/30 text-white text-xs">
            <Clock className="size-3 mr-1" />
            {new Date().toLocaleTimeString()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 h-8 px-2"
            onClick={() => setHeldModal(true)}
          >
            <PauseCircle className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        {/* Left Panel - Items & Search */}
        <div className="flex-1 flex flex-col min-h-0 lg:border-r bg-white">
          {/* Search */}
          <div className="p-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder={rtl ? "بحث بالاسم أو الباركود..." : "Search by name, barcode, or SKU..."}
                className="pl-10 h-12 text-lg font-medium"
              />
            </div>
            {/* Search Results */}
            {items.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 hover:bg-green-50 cursor-pointer border-b last:border-0 transition-colors"
                    onClick={() => handleAddItem(item)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Package className="size-5 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{rtl && item.nameAr ? item.nameAr : item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.barcode && <span className="mr-2">#{item.barcode}</span>}
                          {rtl ? "متوفر" : "Stock"}: {item.stockQty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">{formatCurrency(Number(item.salePrice))}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        <Plus className="size-3 mr-1" />
                        {rtl ? "إضافة" : "Add"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Items Grid */}
          <div className="flex-1 p-3 overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
              {items.slice(0, 20).map(item => (
                <div
                  key={item.id}
                  className="border rounded-xl p-3 hover:border-green-500 hover:shadow-md cursor-pointer transition-all text-center bg-white"
                  onClick={() => handleAddItem(item)}
                >
                  <div className="w-12 h-12 mx-auto rounded-lg bg-green-100 flex items-center justify-center mb-2">
                    <Package className="size-6 text-green-700" />
                  </div>
                  <p className="text-xs font-medium truncate">{rtl && item.nameAr ? item.nameAr : item.name}</p>
                  <p className="text-sm font-bold text-green-700 mt-1">{formatCurrency(Number(item.salePrice))}</p>
                  <p className="text-[10px] text-gray-400">{rtl ? "متوفر" : "Stock"}: {item.stockQty}</p>
                </div>
              ))}
              {searchQuery && items.length === 0 && !itemSearch.isPending && (
                <div className="col-span-full text-center py-8 text-gray-400">
                  {rtl ? "لا توجد نتائج" : "No items found"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Cart / Invoice */}
        <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col bg-white min-h-0">
          {/* Customer & Info */}
          <div className="p-3 border-b shrink-0">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-10"
              onClick={() => setCustomerModal(true)}
            >
              <User className="size-4 text-gray-400" />
              {selectedCustomer ? selectedCustomer.name : (rtl ? "اختيار عميل" : "Select Customer")}
            </Button>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <ShoppingCart className="size-16 mb-4 opacity-30" />
                <p className="text-sm">{rtl ? "السلة فارغة" : "Cart is empty"}</p>
                <p className="text-xs mt-1">{rtl ? "ابحث عن منتج وأضفه" : "Search and add items"}</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {cart.map((item, idx) => (
                  <div key={item.productId} className="border rounded-lg p-2 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{rtl && item.nameAr ? item.nameAr : item.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {rtl ? "رمز" : "Code"}: {item.sku || item.barcode || `#${item.productId}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => handleRemoveItem(item.productId)}>
                        <Trash2 className="size-3 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="size-7"
                          onClick={() => handleQtyChange(item.productId, item.quantity - 1)}>-</Button>
                        <Input
                          ref={qtyRef}
                          type="number"
                          value={item.quantity}
                          onChange={e => handleQtyChange(item.productId, parseInt(e.target.value) || 1)}
                          className="w-14 h-7 text-center border-0 text-sm"
                        />
                        <Button variant="ghost" size="icon" className="size-7"
                          onClick={() => handleQtyChange(item.productId, item.quantity + 1)}>+</Button>
                      </div>
                      <Input
                        ref={priceRef}
                        type="number"
                        value={item.unitPrice}
                        onChange={e => handlePriceChange(item.productId, parseFloat(e.target.value) || 0)}
                        className="w-20 h-7 text-sm text-right"
                      />
                      <span className="text-sm font-bold min-w-[60px] text-right">
                        {formatCurrency(item.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Percent className="size-3 mr-1" />
                        <input
                          type="number"
                          value={item.discount}
                          onChange={e => handleDiscountChange(item.productId, parseFloat(e.target.value) || 0)}
                          className="w-14 h-6 border rounded px-1 text-xs"
                          placeholder="0"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {rtl ? "الخصم" : "Discount"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Totals */}
          <div className="border-t p-3 space-y-2 shrink-0">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{rtl ? "المجموع الفرعي" : "Subtotal"}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{rtl ? "الخصم" : "Discount"}</span>
              <span className="text-red-500">-{formatCurrency(discountTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{rtl ? "الضريبة" : "Tax"}</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{rtl ? "الإجمالي" : "Total"}</span>
              <span className="text-green-700">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button variant="outline" onClick={handleHold} disabled={cart.length === 0}>
                <PauseCircle className="size-4 mr-2" />
                {rtl ? "تعليق" : "Hold"}
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-800 text-white"
                disabled={cart.length === 0}
                onClick={() => setPaymentModal(true)}
              >
                <DollarSign className="size-4 mr-2" />
                {rtl ? "دفع" : "Pay"} (F11)
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => { setCart([]); setSelectedCustomer(null); }}>
                <X className="size-3 mr-1" />
                {rtl ? "جديد" : "New"} (Ctrl+N)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{rtl ? "الدفع" : "Payment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">{rtl ? "المبلغ الإجمالي" : "Total Amount"}</p>
              <p className="text-3xl font-bold text-green-700">{formatCurrency(grandTotal)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{rtl ? "طريقة الدفع" : "Payment Method"}</label>
              <div className="grid grid-cols-3 gap-2">
                {["cash", "card", "transfer"].map(method => (
                  <Button
                    key={method}
                    variant={paymentMethod === method ? "default" : "outline"}
                    className={paymentMethod === method ? "bg-green-700" : ""}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === "cash" && <DollarSign className="size-4 mr-1" />}
                    {method === "card" && <CreditCard className="size-4 mr-1" />}
                    {method === "transfer" && <Landmark className="size-4 mr-1" />}
                    {rtl
                      ? (method === "cash" ? "نقدي" : method === "card" ? "بطاقة" : "تحويل")
                      : method.charAt(0).toUpperCase() + method.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {paymentMethod === "cash" && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">{rtl ? "المبلغ المقبوض" : "Cash Received"}</label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  placeholder="0"
                  className="text-lg h-12"
                />
                {parseFloat(cashReceived) >= grandTotal && (
                  <p className="text-sm text-green-600 mt-1">
                    {rtl ? "الباقي" : "Change"}: {formatCurrency(parseFloat(cashReceived) - grandTotal)}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{rtl ? "ملاحظات" : "Remarks"}</label>
              <Input
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={rtl ? "ملاحظات..." : "Remarks..."}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPaymentModal(false)}>
              {rtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800"
              onClick={handlePayment}
              disabled={createSale.isPending}
            >
              {createSale.isPending ? (
                <span className="flex items-center gap-2"><span className="animate-spin">⟳</span> {rtl ? "جاري..." : "Processing..."}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  {rtl ? "تأكيد الدفع" : "Confirm Payment"} (F12)
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Modal */}
      <Dialog open={customerModal} onOpenChange={setCustomerModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{rtl ? "اختيار عميل" : "Select Customer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input
              value={customerSearch}
              onChange={e => handleCustomerSearch(e.target.value)}
              placeholder={rtl ? "بحث عن عميل..." : "Search customer..."}
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              <div
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border"
                onClick={() => { setSelectedCustomer(null); setCustomerModal(false); }}
              >
                <p className="text-sm font-medium">{rtl ? "عميل نقدي" : "Walk-in Customer"}</p>
              </div>
              {customers.map(c => (
                <div
                  key={c.id}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border"
                  onClick={() => { setSelectedCustomer(c); setCustomerModal(false); }}
                >
                  <p className="text-sm font-medium">{rtl && c.nameAr ? c.nameAr : c.name}</p>
                  <p className="text-xs text-gray-500">{c.phone || c.email || ""}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Held Sales Modal */}
      <Dialog open={heldModal} onOpenChange={setHeldModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{rtl ? "المبيعات المعلقة" : "Held Sales"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
            {heldList.data?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">{rtl ? "لا توجد مبيعات معلقة" : "No held sales"}</p>
            )}
            {heldList.data?.map(hold => (
              <div
                key={hold.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleResumeHold(hold)}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{hold.holdNumber}</p>
                  <Badge>{rtl ? "معلق" : "Held"}</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(hold.createdAt).toLocaleString()}
                </p>
                <p className="text-sm font-bold text-green-700 mt-1">
                  {formatCurrency(Number(hold.totalAmount))}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard shortcuts help */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white/90 backdrop-blur border rounded-lg p-2 text-[10px] text-gray-400 shadow-lg">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>F2 {rtl ? "بحث" : "Search"}</span>
            <span>F11 {rtl ? "دفع" : "Pay"}</span>
            <span>F12 {rtl ? "حفظ" : "Save"}</span>
            <span>Esc {rtl ? "إلغاء" : "Cancel"}</span>
            <span>Del {rtl ? "حذف" : "Delete"}</span>
            <span>Ctrl+N {rtl ? "جديد" : "New"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
