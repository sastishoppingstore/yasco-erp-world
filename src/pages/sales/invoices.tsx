import { FormEvent, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useCountryDetection } from "@/providers/country-detection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCode2, FileSignature, Plus, Eye, Printer, QrCode, RefreshCw, Send, Trash2, Pencil, MessageCircle } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import ActionButton3D from "@/components/ui/ActionButton3D";
import SaudiInvoicePrint from "./SaudiInvoicePrint";

type InvoiceItem = { description: string; quantity: number; unitPrice: string; taxPercent: string; totalAmount: string };

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
  const updateInvoice = trpc.sales.invoiceUpdate.useMutation({
    onSuccess: () => {
      refetch();
      invoiceDetail.refetch();
      toast.success("Invoice updated");
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteInvoiceMut = trpc.sales.invoiceDelete.useMutation({
    onSuccess: () => { refetch(); toast.success("Invoice deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const handleDelete = (id: number) => {
    if (confirm("Delete this invoice?")) {
      deleteInvoiceMut.mutate({ id });
    }
  };

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
  const sendWhatsAppInvoice = trpc.whatsapp.sendInvoiceCreated.useMutation({
    onSuccess: () => toast.success("Invoice sent on WhatsApp"),
    onError: (error) => toast.error(error.message),
  });
  const [open, setOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [pendingEditInvoiceId, setPendingEditInvoiceId] = useState<number | null>(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const invoiceDetail = trpc.sales.invoiceGet.useQuery(
    { id: viewInvoiceId! },
    { enabled: !!viewInvoiceId }
  );
  const [statusFilter, setStatusFilter] = useState("");

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Invoice ${detail?.invoice?.invoiceNumber ?? ""}</title></head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [form, setForm] = useState({
    invoiceNumber: "", customerId: 0, date: "", dueDate: "",
    invoiceType: "standard" as "standard" | "simplified" | "zatca",
    subTotal: "0", taxAmount: "0", taxPercent: "15", totalAmount: "0",
    notes: "",
    items: [{ description: "", quantity: 1, unitPrice: "0", taxPercent: "15", totalAmount: "0" }] as InvoiceItem[],
  });

  const resetForm = () => {
    setEditingInvoiceId(null);
    setForm({
      invoiceNumber: `${settings?.invoicePrefix || "INV-"}${Date.now().toString().slice(-6)}`,
      customerId: 0,
      date: new Date().toISOString().slice(0, 10),
      dueDate: "",
      invoiceType: (settings?.zatcaEnabled ? "zatca" : "standard") as "standard" | "simplified" | "zatca",
      subTotal: "0",
      taxAmount: "0",
      taxPercent: String(settings?.vatRate ?? "15"),
      totalAmount: "0",
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: "0", taxPercent: String(settings?.vatRate ?? "15"), totalAmount: "0" }],
    });
  };

  const loadEditForm = (data: NonNullable<typeof invoiceDetail.data>) => {
    if (!data.invoice) return;
    const sourceItems = data.items?.length
      ? data.items
      : [{ description: "", quantity: 1, unitPrice: "0", taxPercent: data.invoice.taxPercent ?? "15", totalAmount: "0" }];
    setEditingInvoiceId(data.invoice.id);
    setForm(recalc({
      invoiceNumber: data.invoice.invoiceNumber,
      customerId: Number(data.invoice.customerId),
      date: data.invoice.date,
      dueDate: data.invoice.dueDate ?? "",
      invoiceType: data.invoice.invoiceType,
      subTotal: String(data.invoice.subTotal),
      taxAmount: String(data.invoice.taxAmount),
      taxPercent: String(data.invoice.taxPercent),
      totalAmount: String(data.invoice.totalAmount),
      notes: data.invoice.notes ?? "",
      items: sourceItems.map((item: any) => ({
        description: item.description ?? "",
        quantity: Number(item.quantity ?? 1),
        unitPrice: String(item.unitPrice ?? "0"),
        taxPercent: String(item.taxPercent ?? data.invoice.taxPercent ?? "15"),
        totalAmount: String(item.totalAmount ?? "0"),
      })),
    }));
    setOpen(true);
  };

  const openEditInvoice = (invoiceId: number) => {
    setPendingEditInvoiceId(invoiceId);
    setViewInvoiceId(invoiceId);
  };

  const addItem = () => {
    setForm(prev => recalc({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: "0", taxPercent: prev.taxPercent, totalAmount: "0" }],
    }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm(prev => recalc({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return recalc({ ...prev, items: newItems });
    });
  };

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
    if (!pendingEditInvoiceId || !detail?.invoice || detail.invoice.id !== pendingEditInvoiceId) return;
    loadEditForm(detail);
    setPendingEditInvoiceId(null);
  }, [pendingEditInvoiceId, detail]);

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
  const selectedInvoiceLocked = Boolean(
    detail?.invoice?.zatcaXml ||
    detail?.invoice?.zatcaStatus === "reported" ||
    detail?.invoice?.zatcaStatus === "cleared" ||
    detail?.invoice?.status === "paid" ||
    detail?.invoice?.status === "partial"
  );

  const submitInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingInvoiceId) {
      updateInvoice.mutate({ id: editingInvoiceId, ...form }, { onSuccess: () => { setOpen(false); setEditingInvoiceId(null); } });
      return;
    }
    createInvoice.mutate({ ...form }, { onSuccess: () => setOpen(false) });
  };

  const handleWhatsAppSend = () => {
    if (!detail?.invoice || !detail.customer || !detail.company) return;
    const phone = detail.customer.mobile || detail.customer.phone;
    if (!phone) {
      toast.error("Customer phone/mobile is required for WhatsApp.");
      return;
    }
    sendWhatsAppInvoice.mutate({
      customerPhone: phone,
      customerName: detail.customer.name,
      invoiceNumber: detail.invoice.invoiceNumber,
      amount: Number(detail.invoice.totalAmount),
      currency: detail.company.defaultCurrency || "SAR",
      companyName: detail.company.companyName || detail.company.companyNameAr || "YASCO ERP",
      language: "ar",
    });
  };

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
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" />New Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingInvoiceId ? "Edit Invoice" : "Create Invoice"}</DialogTitle></DialogHeader>
            <form onSubmit={submitInvoice} className="space-y-4">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="size-3.5 mr-1" />Add Item
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-20">Qty</TableHead>
                        <TableHead className="w-28">Unit Price</TableHead>
                        <TableHead className="w-20">VAT %</TableHead>
                        <TableHead className="w-28 text-right">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                          <TableCell>
                            <Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Item description" className="h-8 text-sm" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="h-8 text-sm" min="0" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", e.target.value)} className="h-8 text-sm" min="0" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={item.taxPercent} onChange={e => updateItem(idx, "taxPercent", e.target.value)} className="h-8 text-sm" min="0" max="100" />
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {Number(item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {form.items.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="size-7 text-red-500 hover:text-red-700" onClick={() => removeItem(idx)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-3">
                <div><Label className="text-xs">Subtotal</Label><Input value={form.subTotal} readOnly className="h-8 font-mono" /></div>
                <div><Label className="text-xs">VAT ({form.taxPercent}%)</Label><Input value={form.taxAmount} readOnly className="h-8 font-mono" /></div>
                <div><Label className="text-xs font-semibold">Grand Total</Label><Input value={form.totalAmount} readOnly className="h-8 font-mono font-bold" /></div>
              </div>
              {(form.invoiceType === "zatca" || settings?.zatcaEnabled) && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  Saudi invoice mode: backend requires company name and Saudi VAT number, then creates ZATCA TLV QR payload, Saudi VAT fields, XML archive data, and pending ZATCA status.
                </div>
              )}
              <Button type="submit" className="w-full" disabled={createInvoice.isPending || updateInvoice.isPending}>
                {editingInvoiceId ? "Update Invoice" : "Create Invoice"}
              </Button>
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
                    <div className="flex justify-end gap-1.5">
                      <ActionButton3D
                        icon={<Eye className="size-3.5" />}
                        label="View"
                        color="blue"
                        onClick={() => setViewInvoiceId(inv.id)}
                      />
                      {(inv.status === "draft" || inv.status === "sent") && (
                        <ActionButton3D
                          icon={<Pencil className="size-3.5" />}
                          label="Edit"
                          color="amber"
                          onClick={() => { setViewInvoiceId(inv.id); openEditInvoice(inv.id); }}
                        />
                      )}
                      {inv.status === "draft" && (
                        <ActionButton3D
                          icon={<Trash2 className="size-3.5" />}
                          label="Delete"
                          color="red"
                          onClick={() => handleDelete(inv.id)}
                        />
                      )}
                      {inv.status === "draft" && (
                        <ActionButton3D
                          icon={<Send className="size-3.5" />}
                          label="Send"
                          color="purple"
                          onClick={() => updateStatus.mutate({ id: inv.id, status: "sent" })}
                        />
                      )}
                      <ActionButton3D
                        icon={<Printer className="size-3.5" />}
                        label="Print"
                        color="emerald"
                        variant="outline"
                        onClick={() => { setViewInvoiceId(inv.id); setTimeout(() => handlePrint(), 1000); }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewInvoiceId} onOpenChange={(next) => !next && setViewInvoiceId(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <QrCode className="h-4 w-4 text-emerald-700" />
                </span>
                Saudi ZATCA Invoice / فاتورة ضريبية
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                {selectedInvoiceId && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => generateXml.mutate({ invoiceId: selectedInvoiceId })}>
                      <FileCode2 className="mr-2 h-4 w-4" />XML
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateQr.mutate({ invoiceId: selectedInvoiceId })}>
                      <QrCode className="mr-2 h-4 w-4" />QR
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => signInvoice.mutate({ invoiceId: selectedInvoiceId })}>
                      <FileSignature className="mr-2 h-4 w-4" />Sign
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => clearInvoice.mutate({ invoiceId: selectedInvoiceId })}>
                      <Send className="mr-2 h-4 w-4" />Clear
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reportInvoice.mutate({ invoiceId: selectedInvoiceId })}>
                      <Send className="mr-2 h-4 w-4" />Report
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => syncZatcaStatus.mutate({ invoiceId: selectedInvoiceId })}>
                      <RefreshCw className="mr-2 h-4 w-4" />Sync
                    </Button>
                    <Button size="sm" variant="outline" disabled={selectedInvoiceLocked} onClick={() => openEditInvoice(selectedInvoiceId)}>
                      <Pencil className="mr-2 h-4 w-4" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleWhatsAppSend}>
                      <MessageCircle className="mr-2 h-4 w-4" />WhatsApp
                    </Button>
                  </>
                )}
                <Button size="sm" onClick={handlePrint} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  <Printer className="mr-2 h-4 w-4" />Print Invoice
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {detail?.invoice && (
            <SaudiInvoicePrint
              ref={printRef}
              invoice={{
                invoiceNumber:  detail.invoice.invoiceNumber,
                date:           detail.invoice.date,
                dueDate:        detail.invoice.dueDate ?? undefined,
                invoiceType:    detail.invoice.invoiceType,
                taxPercent:     detail.invoice.taxPercent,
                subTotal:       detail.invoice.subTotal,
                taxAmount:      detail.invoice.taxAmount,
                totalAmount:    detail.invoice.totalAmount,
                paidAmount:     detail.invoice.paidAmount,
                status:         detail.invoice.status,
                zatcaStatus:    detail.invoice.zatcaStatus ?? undefined,
                zatcaQrCode:    detail.invoice.zatcaQrCode ?? undefined,
                notes:          detail.invoice.notes ?? undefined,
                terms:          detail.invoice.terms ?? undefined,
                hash:           detail.invoice.invoiceHash ?? undefined,
              }}
              company={{
                companyName:     detail.company?.companyName,
                companyNameAr:   detail.company?.companyNameAr ?? undefined,
                address:         detail.company?.address ?? undefined,
                city:            detail.company?.city ?? undefined,
                country:         detail.company?.country ?? undefined,
                phone:           detail.company?.phone ?? undefined,
                email:           detail.company?.email ?? undefined,
                taxNumber:       detail.company?.taxNumber ?? undefined,
                crNumber:        detail.company?.crNumber ?? undefined,
                logo:            detail.company?.logo ?? undefined,
                defaultCurrency: detail.company?.defaultCurrency ?? "SAR",
                invoiceTerms:    detail.company?.invoiceTerms ?? undefined,
              }}
              customer={{
                name:       detail.customer?.name ?? undefined,
                nameAr:     undefined,
                address:    detail.customer?.address ?? detail.customer?.city ?? undefined,
                city:       detail.customer?.city ?? undefined,
                phone:      detail.customer?.phone ?? undefined,
                email:      detail.customer?.email ?? undefined,
                taxNumber:  detail.customer?.taxNumber ?? undefined,
              }}
              items={(detail.items ?? []).map((it: any) => ({
                id:          it.id,
                description: it.description,
                quantity:    it.quantity,
                unitPrice:   it.unitPrice,
                taxPercent:  it.taxPercent,
                totalAmount: it.totalAmount,
              }))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
