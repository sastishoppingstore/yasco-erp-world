import { FormEvent, useEffect, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useCountryDetection } from "@/providers/country-detection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Trash2, Search, X, Eye, Printer, Pencil, Send,
  FileCode2, FileSignature, QrCode, RefreshCw, MessageCircle,
  AlertTriangle,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import ActionButton3D from "@/components/ui/ActionButton3D";
import SaudiInvoicePrint from "./SaudiInvoicePrint";

// ─── Types ───────────────────────────────────────────────────────────────────
type InvoiceMode = "product" | "service" | "labor" | "construction" | "pharmacy" | "school" | "restaurant" | "workshop";
type InvoiceItem = {
  description: string; quantity: number; unitPrice: string;
  taxPercent: string; totalAmount: string; unit?: string;
  totalHours?: number; ratePerHour?: number; sku?: string; discountPercent?: number;
};

const INVOICE_MODES: { value: InvoiceMode; label: string }[] = [
  { value: "product", label: "Product" },
  { value: "service", label: "Service" },
  { value: "labor", label: "Labor" },
  { value: "construction", label: "Construction" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "school", label: "School Fee" },
  { value: "restaurant", label: "Restaurant" },
  { value: "workshop", label: "Workshop" },
];

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-slate-100 text-slate-600",
  sent:      "bg-blue-100 text-blue-700",
  paid:      "bg-emerald-100 text-emerald-700",
  partial:   "bg-amber-100 text-amber-700",
  overdue:   "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvoicesPage() {
  // Data
  const { data: invoices, refetch } = trpc.sales.invoiceList.useQuery(undefined);
  const { data: customers, refetch: refetchCustomers } = trpc.sales.customerList.useQuery(undefined);
  const { data: products } = trpc.inventory.productList.useQuery(undefined);
  const { data: settings } = trpc.settings.companySettingsGet.useQuery();
  const countryDetection = useCountryDetection();

  // Mutations
  const createInvoice = trpc.sales.invoiceCreate.useMutation({
    onSuccess: () => { refetch(); toast.success("Invoice created"); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateInvoice = trpc.sales.invoiceUpdate.useMutation({
    onSuccess: () => { refetch(); invoiceDetail.refetch(); toast.success("Invoice updated"); setOpen(false); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteInvoice = trpc.sales.invoiceDelete.useMutation({
    onSuccess: () => { refetch(); toast.success("Invoice deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatus = trpc.sales.invoiceUpdateStatus.useMutation({ onSuccess: () => refetch() });
  const generateXml   = trpc.zatca.generateXml.useMutation({ onSuccess: () => { toast.success("XML generated"); invoiceDetail.refetch(); refetch(); }, onError: (e) => toast.error(e.message) });
  const generateQr    = trpc.zatca.generateQrCode.useMutation({ onSuccess: () => { toast.success("QR generated"); invoiceDetail.refetch(); refetch(); }, onError: (e) => toast.error(e.message) });
  const signInvoice   = trpc.zatca.signInvoice.useMutation({ onSuccess: () => { toast.success("Signed"); invoiceDetail.refetch(); refetch(); }, onError: (e) => toast.error(e.message) });
  const clearInvoice  = trpc.zatca.clearanceInvoice.useMutation({ onSuccess: () => toast.success("Clearance logged"), onError: (e) => toast.error(e.message) });
  const reportInvoice = trpc.zatca.reportInvoice.useMutation({ onSuccess: () => toast.success("Reported"), onError: (e) => toast.error(e.message) });
  const syncStatus    = trpc.zatca.syncStatus.useMutation({ onSuccess: () => toast.success("Status synced"), onError: (e) => toast.error(e.message) });
  const sendWhatsApp  = trpc.whatsapp.sendInvoiceCreated.useMutation({ onSuccess: () => toast.success("Sent on WhatsApp"), onError: (e) => toast.error(e.message) });

  const quickCreateCustomer = trpc.sales.customerCreate.useMutation({
    onSuccess: (res) => {
      refetchCustomers();
      setForm(p => ({ ...p, customerId: Number(res.id) }));
      setCustSearch(qCustForm.name);
      setCustDropOpen(false);
      setCustQuickOpen(false);
      setQCustForm({ name: "", nameAr: "", customerType: "b2b", vatNumber: "", crNumber: "", phone: "", whatsapp: "", email: "", city: "" });
      toast.success("Customer created & selected");
    },
    onError: (e) => toast.error(e.message),
  });

  const quickCreateProduct = trpc.inventory.productCreate.useMutation({
    onSuccess: (res) => {
      if (prodIdx !== null) {
        updateItemFields(prodIdx, {
          description: qProdForm.name,
          sku: qProdForm.sku,
          unitPrice: qProdForm.salePrice,
          taxPercent: qProdForm.taxRate,
        });
      }
      setProdDropOpen(false);
      setProdQuickOpen(false);
      setProdIdx(null);
      setProdSearch("");
      setQProdForm({ sku: "", name: "", nameAr: "", salePrice: "0", purchasePrice: "0", taxRate: "15", barcode: "" });
      toast.success("Product created & added");
    },
    onError: (e) => toast.error(e.message),
  });

  // UI State
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingEditId, setPendingEditId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pendingPrintId, setPendingPrintId] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Customer search
  const [custSearch, setCustSearch] = useState("");
  const [custDropOpen, setCustDropOpen] = useState(false);
  const [custQuickOpen, setCustQuickOpen] = useState(false);
  const [qCustForm, setQCustForm] = useState({ name: "", nameAr: "", customerType: "b2b" as const, vatNumber: "", crNumber: "", phone: "", whatsapp: "", email: "", city: "" });

  // Product search
  const [prodIdx, setProdIdx] = useState<number | null>(null);
  const [prodSearch, setProdSearch] = useState("");
  const [prodDropOpen, setProdDropOpen] = useState(false);
  const [prodQuickOpen, setProdQuickOpen] = useState(false);
  const [qProdForm, setQProdForm] = useState({ sku: "", name: "", nameAr: "", salePrice: "0", purchasePrice: "0", taxRate: "15", barcode: "" });

  // Invoice form
  const emptyForm = () => ({
    invoiceNumber: `${settings?.invoicePrefix || "INV-"}${Date.now().toString().slice(-6)}`,
    customerId: 0,
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    invoiceType: (settings?.zatcaEnabled ? "zatca" : "standard") as "standard" | "simplified" | "zatca",
    invoiceMode: "product" as InvoiceMode,
    subTotal: "0", taxAmount: "0", taxPercent: String(settings?.vatRate ?? "15"),
    totalAmount: "0", discountAmount: "0", taxableAmount: "0",
    notes: "", poNumber: "", contractNumber: "", projectReference: "", workedMonth: "",
    items: [{ description: "", quantity: 1, unitPrice: "0", taxPercent: String(settings?.vatRate ?? "15"), totalAmount: "0", unit: "", sku: "" }] as InvoiceItem[],
  });
  const [form, setForm] = useState(emptyForm);

  const invoiceDetail = trpc.sales.invoiceGet.useQuery({ id: viewId! }, { enabled: !!viewId });
  const detail = invoiceDetail.data;

  // Recalculate totals
  const recalc = (next: typeof form, syncItemTax = false) => {
    const isLabor = next.invoiceMode === "labor" || next.invoiceMode === "construction";
    let subTotal = 0;
    let lineDiscountTotal = 0;
    let taxAmount = 0;
    const items = next.items.map((item) => {
      const qty = Number(item.quantity || 0);
      const rate = isLabor ? Number(item.ratePerHour || item.unitPrice || 0) : Number(item.unitPrice || 0);
      const hrs = Number(item.totalHours || qty);
      const lineGross = isLabor ? hrs * rate : qty * rate;
      const lineDiscount = lineGross * Number(item.discountPercent || 0) / 100;
      const lineTaxPercent = Number(syncItemTax ? next.taxPercent : item.taxPercent || next.taxPercent || 0);
      const lineTaxable = Math.max(lineGross - lineDiscount, 0);
      subTotal += lineGross;
      lineDiscountTotal += lineDiscount;
      taxAmount += lineTaxable * lineTaxPercent / 100;
      return {
        ...item,
        taxPercent: syncItemTax ? next.taxPercent : String(item.taxPercent ?? next.taxPercent),
        totalAmount: lineTaxable.toFixed(2),
      };
    });
    const invoiceDiscount = Number(next.discountAmount || 0);
    const totalDiscount = lineDiscountTotal + invoiceDiscount;
    const taxable = Math.max(subTotal - totalDiscount, 0);
    taxAmount = +taxAmount.toFixed(2);
    return {
      ...next,
      subTotal: subTotal.toFixed(2),
      discountAmount: invoiceDiscount.toFixed(2),
      taxableAmount: taxable.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: (taxable + taxAmount).toFixed(2),
      items,
    };
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return recalc({ ...prev, items });
    });
  };

  const updateItemFields = (idx: number, fields: Partial<InvoiceItem>) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], ...fields };
      return recalc({ ...prev, items });
    });
  };

  const addItem = () => setForm(prev => recalc({ ...prev, items: [...prev.items, { description: "", quantity: 1, unitPrice: "0", taxPercent: prev.taxPercent, totalAmount: "0", unit: "", sku: "" }] }));
  const removeItem = (idx: number) => { if (form.items.length > 1) setForm(prev => recalc({ ...prev, items: prev.items.filter((_, i) => i !== idx) })); };

  const openNew = () => { setEditingId(null); setCustSearch(""); setForm(emptyForm()); setOpen(true); };

  const loadEdit = (data: NonNullable<typeof detail>) => {
    if (!data.invoice) return;
    const inv = data.invoice;
    const src = data.items?.length ? data.items : [{ description: "", quantity: 1, unitPrice: "0", taxPercent: inv.taxPercent ?? "15", totalAmount: "0" }];
    const cust = customers?.find(c => c.id === Number(inv.customerId));
    if (cust) setCustSearch(cust.name);
    setEditingId(inv.id);
    setForm(recalc({
      invoiceNumber: inv.invoiceNumber, customerId: Number(inv.customerId),
      date: inv.date, dueDate: inv.dueDate ?? "",
      invoiceType: inv.invoiceType, invoiceMode: (inv.invoiceMode as InvoiceMode) || "product",
      subTotal: String(inv.subTotal), taxAmount: String(inv.taxAmount),
      taxPercent: String(inv.taxPercent), totalAmount: String(inv.totalAmount),
      discountAmount: String(inv.discountAmount || "0"),
      taxableAmount: String(inv.taxableAmount || inv.subTotal || "0"),
      notes: inv.notes ?? "", poNumber: inv.poNumber ?? "",
      contractNumber: inv.contractNumber ?? "", projectReference: inv.projectReference ?? "",
      workedMonth: inv.workedMonth ?? "",
      items: src.map((it: any) => ({
        description: it.description ?? "", quantity: Number(it.quantity ?? 1),
        unitPrice: String(it.unitPrice ?? "0"), taxPercent: String(it.taxPercent ?? inv.taxPercent ?? "15"),
        totalAmount: String(it.totalAmount ?? "0"), unit: it.unit ?? "", sku: it.sku ?? "",
        totalHours: it.totalHours, ratePerHour: it.ratePerHour, discountPercent: it.discountPercent ?? 0,
      })),
    }));
    setOpen(true);
  };

  // Effects
  useEffect(() => {
    if (!pendingEditId || !detail?.invoice || detail.invoice.id !== pendingEditId) return;
    loadEdit(detail);
    setPendingEditId(null);
  }, [pendingEditId, detail]);

  useEffect(() => {
    const isSA = countryDetection.selectedCountry === "SA" || (settings?.country || "").toLowerCase().includes("saudi") || settings?.defaultCurrency === "SAR" || settings?.zatcaEnabled;
    setForm(prev => recalc({ ...prev, taxPercent: String(settings?.vatRate ?? (isSA ? "15" : prev.taxPercent)), invoiceType: isSA ? "zatca" : prev.invoiceType, items: prev.items.map(it => ({ ...it, taxPercent: String(settings?.vatRate ?? (isSA ? "15" : it.taxPercent)) })) }));
  }, [countryDetection.selectedCountry, settings]);

  useEffect(() => {
    const payload = detail?.invoice?.zatcaQrCode;
    if (!payload) { setQrDataUrl(""); return; }
    let active = true;
    QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 2, width: 220, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(url => { if (active) setQrDataUrl(url); }).catch(() => { if (active) setQrDataUrl(""); });
    return () => { active = false; };
  }, [detail?.invoice?.zatcaQrCode]);

  useEffect(() => {
    if (!pendingPrintId || detail?.invoice?.id !== pendingPrintId || !printRef.current) return;
    const timer = window.setTimeout(() => {
      handlePrint();
      setPendingPrintId(null);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [pendingPrintId, detail?.invoice?.id]);

  // Helpers
  const selectedCustomer = customers?.find(c => c.id === form.customerId);
  const filteredInvoices = invoices?.filter(i => !statusFilter || i.status === statusFilter) || [];
  const selectedInvoiceId = detail?.invoice?.id;
  const isLocked = Boolean(detail?.invoice?.zatcaXml || detail?.invoice?.zatcaStatus === "reported" || detail?.invoice?.zatcaStatus === "cleared" || detail?.invoice?.status === "paid" || detail?.invoice?.status === "partial");

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) { toast.error("Invoice is still loading. Try print again."); return; }
    const w = window.open("", "_blank");
    if (!w) { toast.error("Popup blocked. Please allow popups for printing."); return; }
    w.document.write(`<html><head><title>Invoice</title><style>body{margin:0;background:white;color:#111827;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:10mm}</style></head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    window.setTimeout(() => {
      w.print();
      w.close();
    }, 250);
  };

  const handleWhatsApp = () => {
    if (!detail?.invoice || !detail.customer || !detail.company) return;
    const phone = detail.customer.mobile || detail.customer.phone;
    if (!phone) { toast.error("Customer phone required"); return; }
    sendWhatsApp.mutate({ customerPhone: phone, customerName: detail.customer.name, invoiceNumber: detail.invoice.invoiceNumber, amount: Number(detail.invoice.totalAmount), currency: detail.company.defaultCurrency || "SAR", companyName: detail.company.companyName || "ERP", language: "ar" });
  };

  const submitInvoice = (e: FormEvent) => {
    e.preventDefault();
    if (!form.customerId) { toast.error("Please select a customer"); return; }
    if (editingId) { updateInvoice.mutate({ id: editingId, ...form }); return; }
    createInvoice.mutate({ ...form });
  };

  const filteredCustomers = customers?.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
    (c.vatNumber || "").includes(custSearch) ||
    (c.crNumber || "").includes(custSearch) ||
    (c.phone || "").includes(custSearch)
  ) || [];

  const filteredProducts = (search: string) => products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || "").includes(search)
  ) || [];

  // ─── Invoice Form Dialog ──────────────────────────────────────────────────
  const InvoiceFormDialog = (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditingId(null); setCustSearch(""); } }}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white text-slate-950 [&_[data-slot=input]]:bg-white [&_[data-slot=input]]:text-slate-950 [&_[data-slot=input]]:placeholder:text-slate-400 [&_[data-slot=input]]:caret-slate-950 [&_[data-slot=select-trigger]]:bg-white [&_[data-slot=select-trigger]]:text-slate-950 [&_[data-slot=textarea]]:bg-white [&_[data-slot=textarea]]:text-slate-950 [&_[data-slot=textarea]]:caret-slate-950">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {editingId ? "Edit Invoice" : "New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submitInvoice} className="space-y-5">
          {/* Row 1: Invoice# / Date / Due Date */}
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs text-slate-500">Invoice #</Label><Input value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} className="h-9 mt-1" required /></div>
            <div><Label className="text-xs text-slate-500">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-9 mt-1" required /></div>
            <div><Label className="text-xs text-slate-500">Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="h-9 mt-1" /></div>
          </div>

          {/* Invoice Mode Tabs */}
          <div>
            <Label className="text-xs text-slate-500 mb-2 block">Invoice Mode</Label>
            <div className="flex flex-wrap gap-1.5">
              {INVOICE_MODES.map(m => (
                <button key={m.value} type="button"
                  onClick={() => setForm({ ...form, invoiceMode: m.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.invoiceMode === m.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type / VAT% / Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Invoice Type</Label>
              <Select value={form.invoiceType} onValueChange={v => setForm({ ...form, invoiceType: v as any })}>
                <SelectTrigger className="h-9 mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Tax</SelectItem>
                  <SelectItem value="simplified">Simplified</SelectItem>
                  <SelectItem value="zatca">Saudi ZATCA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs text-slate-500">VAT %</Label><Input type="number" value={form.taxPercent} onChange={e => setForm(recalc({ ...form, taxPercent: e.target.value }, true))} className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-slate-500">Currency</Label><Input value={settings?.defaultCurrency || "SAR"} disabled className="h-9 mt-1 bg-slate-50" /></div>
          </div>

          {/* Labor month */}
          {(form.invoiceMode === "labor" || form.invoiceMode === "construction") && (
            <div><Label className="text-xs text-slate-500">Worked Month</Label><Input type="month" value={form.workedMonth} onChange={e => setForm({ ...form, workedMonth: e.target.value })} className="h-9 mt-1" /></div>
          )}

          {/* PO / Contract / Project */}
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs text-slate-500">PO Number</Label><Input value={form.poNumber} onChange={e => setForm({ ...form, poNumber: e.target.value })} placeholder="PO-001" className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-slate-500">Contract #</Label><Input value={form.contractNumber} onChange={e => setForm({ ...form, contractNumber: e.target.value })} placeholder="CONT-001" className="h-9 mt-1" /></div>
            <div><Label className="text-xs text-slate-500">Project Ref</Label><Input value={form.projectReference} onChange={e => setForm({ ...form, projectReference: e.target.value })} placeholder="PRJ-001" className="h-9 mt-1" /></div>
          </div>

          {/* Customer Search */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">
              Customer
              {selectedCustomer && <span className="ml-2 text-emerald-600 text-[11px]">✓ Selected</span>}
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input
                value={custSearch}
                onChange={e => { setCustSearch(e.target.value); setCustDropOpen(true); if (!e.target.value) setForm(p => ({ ...p, customerId: 0 })); }}
                onFocus={() => setCustDropOpen(true)}
                onBlur={() => setTimeout(() => setCustDropOpen(false), 150)}
                placeholder="Type name, VAT number, or phone..."
                className="pl-8 pr-8 h-9"
                autoComplete="off"
              />
              {custSearch && (
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                  onClick={() => { setCustSearch(""); setForm(p => ({ ...p, customerId: 0 })); setCustDropOpen(false); }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {custDropOpen && custSearch.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button key={c.id} type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-slate-50 last:border-0"
                      onClick={() => { setForm(p => ({ ...p, customerId: c.id })); setCustSearch(c.name); setCustDropOpen(false); }}>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-slate-400">{[c.vatNumber && `VAT: ${c.vatNumber}`, c.phone, c.city].filter(Boolean).join(" · ")}</div>
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">No customer found</div>}
                  <button type="button"
                    className="w-full text-left px-3 py-2.5 text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center gap-2 border-t border-slate-100"
                    onClick={() => { setQCustForm(p => ({ ...p, name: custSearch })); setCustQuickOpen(true); setCustDropOpen(false); }}>
                    <Plus className="w-3.5 h-3.5" /> Create Customer: "{custSearch}"
                  </button>
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs">
                <span className="font-semibold text-emerald-800">{selectedCustomer.name}</span>
                <span className="text-slate-500 ml-3">
                  {[(selectedCustomer as any).vatNumber && `VAT: ${(selectedCustomer as any).vatNumber}`, (selectedCustomer as any).crNumber && `CR: ${(selectedCustomer as any).crNumber}`, selectedCustomer.phone, selectedCustomer.city].filter(Boolean).join(" · ")}
                </span>
                {(selectedCustomer as any).customerType === "b2b" && !(selectedCustomer as any).vatNumber && (
                  <div className="mt-1 text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> B2B customer has no VAT — ZATCA might reject this</div>
                )}
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Items / Products</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs"><Plus className="w-3.5 h-3.5 mr-1" />Add Item</Button>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-visible bg-white text-slate-950">
              <Table className="bg-white text-slate-950">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-8 text-xs">#</TableHead>
                    {(form.invoiceMode === "labor" || form.invoiceMode === "construction") ? (
                      <><TableHead className="text-xs">Worker / Work</TableHead><TableHead className="w-16 text-xs">Unit</TableHead><TableHead className="w-16 text-xs">Hours</TableHead><TableHead className="w-20 text-xs">Rate/Hr</TableHead><TableHead className="w-14 text-xs">VAT%</TableHead></>
                    ) : (
                      <><TableHead className="text-xs">Product / Service</TableHead><TableHead className="w-14 text-xs">Unit</TableHead><TableHead className="w-14 text-xs">Qty</TableHead><TableHead className="w-24 text-xs">Price</TableHead><TableHead className="w-12 text-xs">Disc%</TableHead><TableHead className="w-14 text-xs">VAT%</TableHead></>
                    )}
                    <TableHead className="w-24 text-right text-xs">Total</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-slate-400 text-xs">{idx + 1}</TableCell>
                      {(form.invoiceMode === "labor" || form.invoiceMode === "construction") ? (
                        <>
                          <TableCell><input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Worker name / work" className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 placeholder:text-slate-400 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" /></TableCell>
                          <TableCell><input value={item.unit || "day"} onChange={e => updateItem(idx, "unit", e.target.value)} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" /></TableCell>
                          <TableCell><input type="number" value={item.totalHours ?? item.quantity} onChange={e => { updateItem(idx, "totalHours", Number(e.target.value)); updateItem(idx, "quantity", Number(e.target.value)); }} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" min="0" /></TableCell>
                          <TableCell><input type="number" value={item.ratePerHour ?? item.unitPrice} onChange={e => { updateItem(idx, "ratePerHour", Number(e.target.value)); updateItem(idx, "unitPrice", e.target.value); }} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" min="0" /></TableCell>
                          <TableCell><input type="number" value={item.taxPercent} onChange={e => updateItem(idx, "taxPercent", e.target.value)} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" min="0" max="100" /></TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="relative min-w-[180px]">
                            <div className="relative">
                              <input
                                value={prodIdx === idx ? prodSearch : (item.sku ? `[${item.sku}] ${item.description}` : item.description)}
                                onChange={e => { setProdSearch(e.target.value); setProdIdx(idx); setProdDropOpen(true); updateItem(idx, "description", e.target.value); }}
                                onFocus={() => { setProdIdx(idx); setProdSearch(item.sku ? `[${item.sku}] ${item.description}` : item.description); setProdDropOpen(true); }}
                                onBlur={() => setTimeout(() => setProdDropOpen(false), 150)}
                                placeholder="Product name or SKU..."
                                className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 placeholder:text-slate-400 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                autoComplete="off"
                              />
                              {prodDropOpen && prodIdx === idx && prodSearch.length > 0 && (
                                <div className="absolute z-50 left-0 top-full mt-0.5 w-72 bg-white text-slate-950 border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                  {filteredProducts(prodSearch).map(p => (
                                    <button key={p.id} type="button"
                                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-50 last:border-0"
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={() => { updateItemFields(idx, { description: p.name, sku: p.sku || "", unitPrice: String(p.salePrice), taxPercent: String((p as any).taxRate || form.taxPercent) }); setProdDropOpen(false); setProdIdx(null); setProdSearch(""); }}>
                                      <div className="text-xs font-medium text-slate-900">{p.name}</div>
                                      <div className="text-[10px] text-slate-400">{p.sku} · SAR {Number(p.salePrice).toLocaleString()}</div>
                                    </button>
                                  ))}
                                  {filteredProducts(prodSearch).length === 0 && <div className="px-3 py-2 text-xs text-slate-400">No product found</div>}
                                  <button type="button"
                                    className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 text-xs font-medium flex items-center gap-1.5 border-t border-slate-100"
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => { setQProdForm(p => ({ ...p, name: prodSearch })); setProdQuickOpen(true); setProdDropOpen(false); }}>
                                    <Plus className="w-3 h-3" /> Create Product: "{prodSearch}"
                                  </button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell><input value={item.unit || "pcs"} onChange={e => updateItem(idx, "unit", e.target.value)} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" /></TableCell>
                          <TableCell><input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" min="0" /></TableCell>
                          <TableCell><input type="number" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", e.target.value)} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" min="0" /></TableCell>
                          <TableCell><input type="number" value={item.discountPercent || 0} onChange={e => updateItem(idx, "discountPercent", Number(e.target.value))} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" min="0" max="100" /></TableCell>
                          <TableCell><input type="number" value={item.taxPercent} onChange={e => updateItem(idx, "taxPercent", e.target.value)} className="h-8 w-full text-xs bg-white text-slate-950 caret-slate-950 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" min="0" max="100" /></TableCell>
                        </>
                      )}
                      <TableCell className="text-right font-mono text-xs font-semibold">{Number(item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 grid grid-cols-4 gap-4 text-center">
            <div><div className="text-xs text-slate-500 mb-1">Subtotal</div><div className="font-mono font-semibold">{Number(form.subTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
            <div><div className="text-xs text-slate-500 mb-1">Discount</div><Input value={form.discountAmount} onChange={e => setForm(recalc({ ...form, discountAmount: e.target.value }))} className="h-8 text-center font-mono text-sm" /></div>
            <div><div className="text-xs text-slate-500 mb-1">VAT ({form.taxPercent}%)</div><div className="font-mono font-semibold">{Number(form.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
            <div><div className="text-xs text-slate-500 mb-1 font-semibold">Grand Total</div><div className="font-mono font-bold text-lg text-emerald-700">{Number(form.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs text-slate-500">Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 text-sm resize-none" placeholder="Add notes..." />
          </div>

          {form.invoiceType === "zatca" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Saudi ZATCA mode: QR code, XML, and invoice hash will be generated automatically when company tax settings are complete.
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={createInvoice.isPending || updateInvoice.isPending}>
            {editingId ? "Update Invoice" : "Create Invoice"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  // ─── Quick Customer Dialog ────────────────────────────────────────────────
  const QuickCustomerDialog = (
    <Dialog open={custQuickOpen} onOpenChange={setCustQuickOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create New Customer</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); quickCreateCustomer.mutate(qCustForm); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Name (English) *</Label><Input value={qCustForm.name} onChange={e => setQCustForm(p => ({ ...p, name: e.target.value }))} required className="mt-1" /></div>
            <div><Label className="text-xs">Name (Arabic)</Label><Input dir="rtl" value={qCustForm.nameAr} onChange={e => setQCustForm(p => ({ ...p, nameAr: e.target.value }))} className="mt-1" /></div>
          </div>
          <div>
            <Label className="text-xs">Customer Type</Label>
            <Select value={qCustForm.customerType} onValueChange={v => setQCustForm(p => ({ ...p, customerType: v as any }))}>
              <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="b2b">B2B Company</SelectItem>
                <SelectItem value="b2c">B2C Individual</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="cash_customer">Cash Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">VAT Number (15 digits)</Label><Input value={qCustForm.vatNumber} onChange={e => setQCustForm(p => ({ ...p, vatNumber: e.target.value.replace(/\D/g, "").slice(0, 15) }))} placeholder="300000000000003" maxLength={15} className="mt-1" /></div>
            <div><Label className="text-xs">CR Number</Label><Input value={qCustForm.crNumber} onChange={e => setQCustForm(p => ({ ...p, crNumber: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Phone</Label><Input value={qCustForm.phone} onChange={e => setQCustForm(p => ({ ...p, phone: e.target.value }))} placeholder="+9665XXXXXXXX" className="mt-1" /></div>
            <div><Label className="text-xs">WhatsApp</Label><Input value={qCustForm.whatsapp} onChange={e => setQCustForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+9665XXXXXXXX" className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Email</Label><Input type="email" value={qCustForm.email} onChange={e => setQCustForm(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">City</Label><Input value={qCustForm.city} onChange={e => setQCustForm(p => ({ ...p, city: e.target.value }))} className="mt-1" /></div>
          </div>
          <Button type="submit" className="w-full" disabled={quickCreateCustomer.isPending}>Create and Select Customer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  // ─── Quick Product Dialog ─────────────────────────────────────────────────
  const QuickProductDialog = (
    <Dialog open={prodQuickOpen} onOpenChange={v => { setProdQuickOpen(v); if (!v) { setProdIdx(null); setProdSearch(""); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create New Product</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); quickCreateProduct.mutate(qProdForm); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">SKU *</Label><Input value={qProdForm.sku} onChange={e => setQProdForm(p => ({ ...p, sku: e.target.value }))} required className="mt-1" /></div>
            <div><Label className="text-xs">Barcode</Label><Input value={qProdForm.barcode} onChange={e => setQProdForm(p => ({ ...p, barcode: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Name (English) *</Label><Input value={qProdForm.name} onChange={e => setQProdForm(p => ({ ...p, name: e.target.value }))} required className="mt-1" /></div>
            <div><Label className="text-xs">Name (Arabic)</Label><Input dir="rtl" value={qProdForm.nameAr} onChange={e => setQProdForm(p => ({ ...p, nameAr: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Sale Price</Label><Input type="number" value={qProdForm.salePrice} onChange={e => setQProdForm(p => ({ ...p, salePrice: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Purchase Price</Label><Input type="number" value={qProdForm.purchasePrice} onChange={e => setQProdForm(p => ({ ...p, purchasePrice: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Tax Rate %</Label><Input type="number" value={qProdForm.taxRate} onChange={e => setQProdForm(p => ({ ...p, taxRate: e.target.value }))} className="mt-1" /></div>
          </div>
          <Button type="submit" className="w-full" disabled={quickCreateProduct.isPending}>Create and Add Product</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  // ─── Main Return ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-slate-500 text-sm">Create Saudi ZATCA-ready invoices and manage billing.</p>
        </div>
        <Button onClick={openNew} size="lg" className="font-semibold">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "draft", "sent", "paid", "partial", "overdue"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Invoice #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">VAT</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-slate-400">No invoices found. Click "New Invoice" to create one.</TableCell></TableRow>
              ) : filteredInvoices.map(inv => (
                <TableRow key={inv.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono font-semibold text-sm">{inv.invoiceNumber}</TableCell>
                  <TableCell><span className="text-xs px-2 py-0.5 rounded bg-slate-100">{inv.invoiceType === "zatca" ? "ZATCA" : inv.invoiceType}</span></TableCell>
                  <TableCell className="text-sm">{new Date(inv.date).toLocaleDateString("en-SA")}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{Number(inv.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{Number(inv.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-sm">{Number(inv.totalAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{Number(inv.paidAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status] || ""}`}>{inv.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ActionButton3D icon={<Eye className="size-3.5" />} label="View" color="blue" onClick={() => setViewId(inv.id)} />
                      {(inv.status === "draft" || inv.status === "sent") && (
                        <ActionButton3D icon={<Pencil className="size-3.5" />} label="Edit" color="amber" onClick={() => { setPendingEditId(inv.id); setViewId(inv.id); }} />
                      )}
                      {inv.status === "draft" && (
                        <>
                          <ActionButton3D icon={<Send className="size-3.5" />} label="Send" color="purple" onClick={() => updateStatus.mutate({ id: inv.id, status: "sent" })} />
                          <ActionButton3D icon={<Trash2 className="size-3.5" />} label="Delete" color="red" onClick={() => { if (confirm("Are you sure you want to delete?")) deleteInvoice.mutate({ id: inv.id }); }} />
                        </>
                      )}
                      <ActionButton3D icon={<Printer className="size-3.5" />} label="Print" color="emerald" variant="outline" onClick={() => { setViewId(inv.id); setPendingPrintId(inv.id); }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Render Dialogs */}
      {InvoiceFormDialog}
      {QuickCustomerDialog}
      {QuickProductDialog}

      {/* Invoice View/Print Dialog */}
      <Dialog open={!!viewId} onOpenChange={v => !v && setViewId(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 flex-wrap">
              <span className="flex items-center gap-2"><QrCode className="h-5 w-5 text-emerald-600" /> Saudi ZATCA Invoice</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedInvoiceId && (<>
                  <Button size="sm" variant="outline" onClick={() => generateXml.mutate({ invoiceId: selectedInvoiceId })}><FileCode2 className="mr-1 h-3.5 w-3.5" />XML</Button>
                  <Button size="sm" variant="outline" onClick={() => generateQr.mutate({ invoiceId: selectedInvoiceId })}><QrCode className="mr-1 h-3.5 w-3.5" />QR</Button>
                  <Button size="sm" variant="outline" onClick={() => signInvoice.mutate({ invoiceId: selectedInvoiceId })}><FileSignature className="mr-1 h-3.5 w-3.5" />Sign</Button>
                  <Button size="sm" variant="outline" onClick={() => clearInvoice.mutate({ invoiceId: selectedInvoiceId })}><Send className="mr-1 h-3.5 w-3.5" />Clear</Button>
                  <Button size="sm" variant="outline" onClick={() => reportInvoice.mutate({ invoiceId: selectedInvoiceId })}><Send className="mr-1 h-3.5 w-3.5" />Report</Button>
                  <Button size="sm" variant="outline" onClick={() => syncStatus.mutate({ invoiceId: selectedInvoiceId })}><RefreshCw className="mr-1 h-3.5 w-3.5" />Sync</Button>
                  <Button size="sm" variant="outline" disabled={isLocked} onClick={() => { setPendingEditId(selectedInvoiceId); setViewId(selectedInvoiceId); }}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
                  <Button size="sm" variant="outline" onClick={handleWhatsApp}><MessageCircle className="mr-1 h-3.5 w-3.5" />WhatsApp</Button>
                </>)}
                <Button size="sm" onClick={handlePrint} className="bg-emerald-700 hover:bg-emerald-800 text-white"><Printer className="mr-1 h-3.5 w-3.5" />Print</Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {detail?.invoice && (
            <SaudiInvoicePrint
              ref={printRef}
              invoice={{ invoiceNumber: detail.invoice.invoiceNumber, date: detail.invoice.date, time: detail.invoice.time ?? new Date().toLocaleTimeString("en-SA"), dueDate: detail.invoice.dueDate ?? undefined, invoiceType: detail.invoice.invoiceType, invoiceMode: detail.invoice.invoiceMode ?? "product", taxPercent: detail.invoice.taxPercent, subTotal: detail.invoice.subTotal, discountAmount: detail.invoice.discountAmount || "0", taxableAmount: detail.invoice.taxableAmount || detail.invoice.subTotal || "0", taxAmount: detail.invoice.taxAmount, totalAmount: detail.invoice.totalAmount, paidAmount: detail.invoice.paidAmount, balanceDue: detail.invoice.balanceDue || "0", status: detail.invoice.status, zatcaStatus: detail.invoice.zatcaStatus ?? undefined, zatcaQrCode: detail.invoice.zatcaQrCode ?? undefined, notes: detail.invoice.notes ?? undefined, terms: detail.invoice.terms ?? undefined, uuid: detail.invoice.uuid ?? undefined, hash: detail.invoice.invoiceHash ?? undefined, poNumber: detail.invoice.poNumber ?? undefined, contractNumber: detail.invoice.contractNumber ?? undefined, projectReference: detail.invoice.projectReference ?? undefined, workedMonth: detail.invoice.workedMonth ?? undefined, paymentMethod: detail.invoice.paymentMethod ?? undefined, paymentTerms: detail.invoice.paymentTerms ?? undefined, cashier: detail.invoice.cashier ?? undefined, createdBy: detail.invoice.createdBy ?? undefined }}
              company={{ companyName: detail.company?.companyName, companyNameAr: detail.company?.companyNameAr ?? undefined, address: detail.company?.address ?? undefined, city: detail.company?.city ?? undefined, country: detail.company?.country ?? undefined, phone: detail.company?.phone ?? undefined, email: detail.company?.email ?? undefined, website: detail.company?.website ?? undefined, taxNumber: detail.company?.taxNumber ?? undefined, crNumber: detail.company?.crNumber ?? undefined, logo: detail.company?.logo ?? undefined, defaultCurrency: detail.company?.defaultCurrency ?? "SAR", invoiceTerms: detail.company?.invoiceTerms ?? undefined }}
              customer={{ name: detail.customer?.name ?? undefined, nameAr: detail.customer?.nameAr ?? undefined, address: detail.customer?.address ?? detail.customer?.city ?? undefined, city: detail.customer?.city ?? undefined, phone: detail.customer?.phone ?? undefined, email: detail.customer?.email ?? undefined, taxNumber: detail.customer?.taxNumber ?? undefined, crNumber: detail.customer?.crNumber ?? undefined, contactPerson: detail.customer?.contactPerson ?? undefined }}
              items={(detail.items ?? []).map((it: any) => ({ id: it.id, description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, taxPercent: it.taxPercent, totalAmount: it.totalAmount, unit: it.unit, totalHours: it.totalHours, ratePerHour: it.ratePerHour, sku: it.sku, discountPercent: it.discountPercent }))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
