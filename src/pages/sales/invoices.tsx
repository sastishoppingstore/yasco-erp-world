import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useCountryDetection } from "@/providers/country-detection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCode2, FileSignature, Plus, Eye, Printer, QrCode, RefreshCw, Send } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

export default function InvoicesPage() {
  const { data: invoices, refetch } = trpc.sales.invoiceList.useQuery(undefined);
  const { data: customers } = trpc.sales.customerList.useQuery(undefined);
  const { data: settings } = trpc.settings.companySettingsGet.useQuery();
  const countryDetection = useCountryDetection();
  const createInvoice = trpc.sales.invoiceCreate.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Invoice created");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateStatus = trpc.sales.invoiceUpdateStatus.useMutation({ onSuccess: () => refetch() });
  const generateXml = trpc.zatca.generateXml.useMutation({
    onSuccess: () => {
      toast.success("ZATCA UBL XML generated");
      invoiceDetail.refetch();
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const generateQr = trpc.zatca.generateQrCode.useMutation({
    onSuccess: () => {
      toast.success("ZATCA QR generated");
      invoiceDetail.refetch();
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const signInvoice = trpc.zatca.signInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice signed for ZATCA workflow");
      invoiceDetail.refetch();
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const clearInvoice = trpc.zatca.clearanceInvoice.useMutation({
    onSuccess: () => toast.success("ZATCA clearance workflow logged"),
    onError: (error) => toast.error(error.message),
  });
  const reportInvoice = trpc.zatca.reportInvoice.useMutation({
    onSuccess: () => toast.success("ZATCA reporting workflow logged"),
    onError: (error) => toast.error(error.message),
  });
  const syncZatcaStatus = trpc.zatca.syncStatus.useMutation({
    onSuccess: () => toast.success("ZATCA status synced"),
    onError: (error) => toast.error(error.message),
  });
  const [open, setOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
  const invoiceDetail = trpc.sales.invoiceGet.useQuery(
    { id: viewInvoiceId! },
    { enabled: !!viewInvoiceId }
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [form, setForm] = useState({
    invoiceNumber: "", customerId: 0, date: "", dueDate: "",
    invoiceType: "standard" as "standard" | "simplified" | "zatca",
    subTotal: "0", taxAmount: "0", taxPercent: "15", totalAmount: "0",
    notes: "",
    items: [{ description: "", quantity: 1, unitPrice: "0", taxPercent: "15", totalAmount: "0" }],
  });

  useEffect(() => {
    const isSaudiContext =
      countryDetection.selectedCountry === "SA" ||
      (settings?.country || "").toLowerCase().includes("saudi") ||
      settings?.defaultCurrency === "SAR" ||
      settings?.zatcaEnabled;
    setForm((prev) => ({
      ...prev,
      taxPercent: String(settings?.vatRate ?? (isSaudiContext ? "15" : prev.taxPercent)),
      invoiceType: isSaudiContext ? "zatca" : prev.invoiceType,
      items: prev.items.map((item) => ({ ...item, taxPercent: String(settings?.vatRate ?? (isSaudiContext ? "15" : item.taxPercent)) })),
    }));
  }, [countryDetection.selectedCountry, settings]);

  const recalc = (next: typeof form) => {
    const subTotal = next.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
    const taxRate = Number(next.taxPercent || 0);
    const taxAmount = Number((subTotal * taxRate / 100).toFixed(2));
    return {
      ...next,
      subTotal: subTotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: (subTotal + taxAmount).toFixed(2),
      items: next.items.map((item) => ({
        ...item,
        taxPercent: next.taxPercent,
        totalAmount: (Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2),
      })),
    };
  };

  const selectedCustomer = customers?.find((customer) => customer.id === form.customerId);
  const detail = invoiceDetail.data;

  useEffect(() => {
    let active = true;
    const payload = detail?.invoice?.zatcaQrCode;
    if (!payload) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 220,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then((url) => {
      if (active) setQrDataUrl(url);
    }).catch(() => {
      if (active) setQrDataUrl("");
    });
    return () => {
      active = false;
    };
  }, [detail?.invoice?.zatcaQrCode]);

  const filtered = invoices?.filter(i => !statusFilter || i.status === statusFilter) || [];
  const selectedInvoiceId = detail?.invoice?.id;

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Invoices</h2><p className="text-slate-500">Manage sales invoices with ZATCA compliance</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => setForm((prev) => recalc({
            ...prev,
            invoiceNumber: prev.invoiceNumber || `${settings?.invoicePrefix || "INV-"}${Date.now().toString().slice(-6)}`,
            date: prev.date || new Date().toISOString().slice(0, 10),
          }))}><Plus className="w-4 h-4 mr-2" />New Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createInvoice.mutate({ ...form }, { onSuccess: () => setOpen(false) }); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Invoice #</Label><Input value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Invoice Type</Label>
                  <Select value={form.invoiceType} onValueChange={v => setForm({...form, invoiceType: v as typeof form.invoiceType})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Tax Invoice</SelectItem>
                      <SelectItem value="simplified">Simplified Invoice</SelectItem>
                      <SelectItem value="zatca">Saudi ZATCA Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>VAT %</Label><Input type="number" value={form.taxPercent} onChange={e => setForm(recalc({...form, taxPercent: e.target.value}))} /></div>
                <div><Label>Currency</Label><Input value={settings?.defaultCurrency || "SAR"} disabled /></div>
              </div>
              <div><Label>Customer</Label>
                <Select onValueChange={v => setForm({...form, customerId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {selectedCustomer && (
                <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="font-medium text-slate-800">{selectedCustomer.name}</div>
                  <div>{selectedCustomer.address || selectedCustomer.city || "No address saved"}</div>
                  <div>Tax/VAT: {selectedCustomer.taxNumber || "Not provided"}</div>
                </div>
              )}
              <div><Label>Description</Label><Input value={form.items[0].description} onChange={e => {
                const newItems = [...form.items]; newItems[0].description = e.target.value; setForm(recalc({...form, items: newItems}));
              }} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Qty</Label><Input type="number" value={form.items[0].quantity} onChange={e => {
                  const newItems = [...form.items]; newItems[0].quantity = Number(e.target.value); setForm(recalc({...form, items: newItems}));
                }} /></div>
                <div><Label>Unit Price</Label><Input type="number" value={form.items[0].unitPrice} onChange={e => {
                  const newItems = [...form.items]; newItems[0].unitPrice = e.target.value; setForm(recalc({...form, items: newItems}));
                }} /></div>
                <div><Label>Total</Label><Input value={form.totalAmount} readOnly /></div>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-3">
                <div><Label>Subtotal</Label><Input value={form.subTotal} readOnly /></div>
                <div><Label>VAT</Label><Input value={form.taxAmount} readOnly /></div>
                <div><Label>Grand Total</Label><Input value={form.totalAmount} readOnly /></div>
              </div>
              {(form.invoiceType === "zatca" || settings?.zatcaEnabled) && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  Saudi invoice mode: backend requires company name and Saudi VAT number, then creates ZATCA TLV QR payload, Saudi VAT fields, XML archive data, and pending ZATCA status.
                </div>
              )}
              <Button type="submit" className="w-full">Create Invoice</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["draft", "sent", "paid", "partial", "overdue"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Paid</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell><span className="text-xs">{inv.invoiceType === "zatca" ? "ZATCA" : inv.invoiceType}</span></TableCell>
                  <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(inv.totalAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.paidAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[inv.status] || ""}`}>{inv.status}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewInvoiceId(inv.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewInvoiceId} onOpenChange={(next) => !next && setViewInvoiceId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>Invoice Preview</span>
              <div className="flex flex-wrap justify-end gap-2">
                {selectedInvoiceId && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => generateXml.mutate({ invoiceId: selectedInvoiceId })}><FileCode2 className="mr-2 h-4 w-4" />XML</Button>
                    <Button size="sm" variant="outline" onClick={() => generateQr.mutate({ invoiceId: selectedInvoiceId })}><QrCode className="mr-2 h-4 w-4" />QR</Button>
                    <Button size="sm" variant="outline" onClick={() => signInvoice.mutate({ invoiceId: selectedInvoiceId })}><FileSignature className="mr-2 h-4 w-4" />Sign</Button>
                    <Button size="sm" variant="outline" onClick={() => clearInvoice.mutate({ invoiceId: selectedInvoiceId })}><Send className="mr-2 h-4 w-4" />Clear</Button>
                    <Button size="sm" variant="outline" onClick={() => reportInvoice.mutate({ invoiceId: selectedInvoiceId })}><Send className="mr-2 h-4 w-4" />Report</Button>
                    <Button size="sm" variant="outline" onClick={() => syncZatcaStatus.mutate({ invoiceId: selectedInvoiceId })}><RefreshCw className="mr-2 h-4 w-4" />Sync</Button>
                  </>
                )}
                <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {detail?.invoice && (
            <div className="space-y-6 rounded-lg bg-white p-4 text-slate-900 print:p-0">
              <div className="flex items-start justify-between gap-6 border-b border-emerald-900/20 pb-4">
                <div className="flex gap-4">
                  {detail.company?.logo ? <img src={detail.company.logo} alt="Company logo" className="h-16 w-16 rounded object-contain" /> : <div className="flex h-16 w-16 items-center justify-center rounded bg-emerald-100 font-bold text-emerald-700">LOGO</div>}
                  <div>
                    <h3 className="text-xl font-bold">{detail.company?.companyName || "Company Name"}</h3>
                    {detail.company?.companyNameAr && <p className="text-sm font-medium" dir="rtl">{detail.company.companyNameAr}</p>}
                    <p className="text-sm text-slate-600">{detail.company?.address} {detail.company?.city}</p>
                    <p className="text-sm text-slate-600">{detail.company?.phone} {detail.company?.email}</p>
                    <p className="text-xs text-slate-500">VAT: {detail.company?.taxNumber || "Missing"} | CR: {detail.company?.crNumber || "Missing"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">TAX INVOICE</div>
                  <div className="text-sm font-semibold" dir="rtl">فاتورة ضريبية</div>
                  <div className="font-mono text-sm">{detail.invoice.invoiceNumber}</div>
                  <div className="text-sm text-slate-600">{detail.invoice.date}</div>
                  {detail.invoice.invoiceType === "zatca" && <div className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"><QrCode className="mr-1 h-3 w-3" />Saudi ZATCA Ready</div>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-semibold uppercase text-slate-500">Bill To</div>
                  <div className="font-semibold">{detail.customer?.name}</div>
                  <div className="text-sm text-slate-600">{detail.customer?.address || detail.customer?.city}</div>
                  <div className="text-sm text-slate-600">{detail.customer?.phone || detail.customer?.email}</div>
                  <div className="text-xs text-slate-500">Customer VAT/Tax: {detail.customer?.taxNumber || "Not provided"}</div>
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Invoice Type</span><span className="text-right capitalize">{detail.invoice.invoiceType}</span>
                    <span className="text-slate-500">Currency</span><span className="text-right">{detail.company?.defaultCurrency || "SAR"}</span>
                    <span className="text-slate-500">VAT % / ضريبة</span><span className="text-right">{detail.invoice.taxPercent}%</span>
                    <span className="text-slate-500">ZATCA Status</span><span className="text-right">{detail.invoice.zatcaStatus || "N/A"}</span>
                    <span className="text-slate-500">Place of Supply</span><span className="text-right">{detail.company?.country || "Saudi Arabia"}</span>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader><TableRow><TableHead>Description / الوصف</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Unit</TableHead><TableHead className="text-right">VAT %</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {detail.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{Number(item.unitPrice).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.taxPercent}%</TableCell>
                      <TableCell className="text-right">{Number(item.totalAmount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <div className="rounded-lg border p-3 text-sm text-slate-600">
                  <div className="font-semibold text-slate-800">Terms</div>
                  <p>{detail.invoice.terms || detail.company?.invoiceTerms || "Thank you for your business."}</p>
                  {detail.invoice.zatcaQrCode && <p className="mt-2 text-xs">ZATCA TLV QR payload is stored with this invoice for Saudi VAT compliance readiness.</p>}
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border p-3 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{Number(detail.invoice.subTotal).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>VAT</span><span>{Number(detail.invoice.taxAmount).toLocaleString()}</span></div>
                    <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>{Number(detail.invoice.totalAmount).toLocaleString()}</span></div>
                  </div>
                  {qrDataUrl && (
                    <div className="rounded-lg border p-3 text-center">
                      <img src={qrDataUrl} alt="ZATCA QR code" className="mx-auto h-40 w-40 bg-white" />
                      <div className="mt-2 text-xs font-medium text-slate-600">ZATCA QR / رمز الاستجابة</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
