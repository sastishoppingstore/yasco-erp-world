import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, FileText, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

type Item = {
  description: string;
  quantity: number;
  unitPrice: string;
  taxPercent: string;
};

export default function QuickInvoicePage() {
  const navigate = useNavigate();
  const { data: settings } = trpc.settings.companySettingsGet.useQuery();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerVat, setCustomerVat] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, unitPrice: "0", taxPercent: "15" },
  ]);

  const createCustomer = trpc.sales.customerCreate.useMutation();
  const createInvoice = trpc.sales.invoiceCreate.useMutation({
    onSuccess: () => {
      toast.success("Invoice created successfully");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerVat("");
      setNotes("");
      setItems([{ description: "", quantity: 1, unitPrice: "0", taxPercent: "15" }]);
    },
    onError: (e) => toast.error(e.message),
  });

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: "0", taxPercent: "15" }]);
  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };
  const updateItem = (i: number, field: keyof Item, value: string | number) => {
    setItems(items.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };

  const calcSubTotal = () => items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice || 0)), 0);
  const calcTax = () => items.reduce((s, it) => {
    const lineTotal = Number(it.quantity) * Number(it.unitPrice || 0);
    return s + lineTotal * Number(it.taxPercent || 0) / 100;
  }, 0);
  const subTotal = calcSubTotal();
  const taxAmount = calcTax();
  const total = subTotal + taxAmount;

  const isSubmitting = createCustomer.isPending || createInvoice.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (!items[0].description.trim()) { toast.error("At least one item is required"); return; }

    const invoiceNumber = `${settings?.invoicePrefix || "INV-"}${Date.now().toString().slice(-6)}`;
    const date = new Date().toISOString().slice(0, 10);

    try {
      const { id: customerId } = await createCustomer.mutateAsync({
        name: customerName.trim(),
        phone: customerPhone.trim() || undefined,
        vatNumber: customerVat.trim() || undefined,
      });

      await createInvoice.mutateAsync({
        invoiceNumber,
        customerId,
        date,
        subTotal: subTotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        taxPercent: "15",
        taxableAmount: subTotal.toFixed(2),
        totalAmount: total.toFixed(2),
        notes: notes.trim() || undefined,
        items: items.map(it => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxPercent: it.taxPercent,
          totalAmount: (Number(it.quantity) * Number(it.unitPrice || 0) * (1 + Number(it.taxPercent || 0) / 100)).toFixed(2),
        })),
      });
    } catch (err: any) {
      if (!err?.message?.includes("already exists")) {
        toast.error(err?.message || "Failed to create invoice");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-100">
          <FileText className="w-7 h-7 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Quick Invoice</h1>
          <p className="text-slate-500">Create Saudi ZATCA-compliant invoices in seconds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-lg border-2 border-slate-200">
          <CardContent className="p-6 space-y-5">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Ahmed Al-Saud"
                  className="h-12 text-base px-4 bg-white"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Phone Number</Label>
                <Input
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +9665XXXXXXXX"
                  className="h-12 text-base px-4 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">VAT Number (optional)</Label>
                <Input
                  value={customerVat}
                  onChange={e => setCustomerVat(e.target.value.replace(/\D/g, "").slice(0, 15))}
                  placeholder="e.g. 300000000000003"
                  maxLength={15}
                  className="h-12 text-base px-4 bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-slate-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Items / Products
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-9">
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs text-slate-500">Product / Service</Label>
                      <Input
                        value={item.description}
                        onChange={e => updateItem(idx, "description", e.target.value)}
                        placeholder="e.g. Consulting Service"
                        className="h-11 text-base px-4 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                        min="1"
                        className="h-11 text-base px-4 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Unit Price (SAR)</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={e => updateItem(idx, "unitPrice", e.target.value)}
                        min="0"
                        step="0.01"
                        className="h-11 text-base px-4 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">VAT %</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={item.taxPercent}
                          onChange={e => updateItem(idx, "taxPercent", e.target.value)}
                          min="0"
                          max="100"
                          className="h-11 text-base px-4 bg-white"
                        />
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)}
                            className="text-red-400 hover:text-red-600 p-2 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-slate-200">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Subtotal</div>
                <div className="text-2xl font-bold font-mono">{subTotal.toFixed(2)}</div>
                <div className="text-xs text-slate-400">SAR</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">VAT (15%)</div>
                <div className="text-2xl font-bold font-mono text-amber-600">{taxAmount.toFixed(2)}</div>
                <div className="text-xs text-slate-400">SAR</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Total</div>
                <div className="text-2xl font-bold font-mono text-emerald-700">{total.toFixed(2)}</div>
                <div className="text-xs text-slate-400">SAR</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-4 text-center text-white">
                <div className="text-xs opacity-80 mb-1">ZATCA Status</div>
                <div className="text-sm font-semibold">Auto-compliant</div>
                <div className="text-xs opacity-80">QR + XML generated</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes for the invoice..."
                rows={2}
                className="bg-white text-base resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" disabled={isSubmitting}
            className="h-14 text-lg font-bold flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><CheckCircle className="w-5 h-5 mr-2" /> Create Invoice</>
            )}
          </Button>
          <Button type="button" variant="outline" size="lg"
            onClick={() => navigate("/app/sales/invoices")}
            className="h-14 text-base">
            View All Invoices
          </Button>
        </div>
      </form>
    </div>
  );
}
