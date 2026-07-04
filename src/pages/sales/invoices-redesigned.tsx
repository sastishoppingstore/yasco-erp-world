import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Trash2, Eye, Printer, Send, FileCode2, QrCode, 
  AlertTriangle, DollarSign, Calculator
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn, DataTableAction } from "@/components/ui/data-table";
import { FormSection } from "@/components/ui/form-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartSearchInput, SmartSearchOption } from "@/components/ui/smart-search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type InvoiceMode = "product" | "service" | "labor" | "construction" | "pharmacy" | "school" | "restaurant" | "workshop";
type InvoiceItem = {
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: string;
  unit?: string;
  discountPercent?: number;
  taxPercent: string;
  totalAmount: string;
  // Labor/Construction specific
  totalHours?: number;
  ratePerHour?: number;
};

const INVOICE_MODES = [
  { value: "product" as const, label: "Product Invoice" },
  { value: "service" as const, label: "Service Invoice" },
  { value: "labor" as const, label: "Labor / Construction" },
  { value: "pharmacy" as const, label: "Pharmacy" },
  { value: "school" as const, label: "School Fee" },
  { value: "restaurant" as const, label: "Restaurant" },
  { value: "workshop" as const, label: "Workshop" },
];

const emptyItem = (vatRate: string): InvoiceItem => ({
  description: "",
  quantity: 1,
  unitPrice: "0",
  taxPercent: vatRate,
  totalAmount: "0",
  unit: "pcs",
});

const emptyForm = (settings: any) => ({
  invoiceNumber: `${settings?.invoicePrefix || "INV-"}${Date.now().toString().slice(-6)}`,
  customerId: 0,
  date: new Date().toISOString().slice(0, 10),
  dueDate: "",
  invoiceType: (settings?.zatcaEnabled ? "zatca" : "standard") as "standard" | "simplified" | "zatca",
  invoiceMode: "product" as InvoiceMode,
  taxPercent: String(settings?.vatRate ?? "15"),
  currency: settings?.defaultCurrency || "SAR",
  poNumber: "",
  contractNumber: "",
  projectReference: "",
  workedMonth: "",
  subTotal: "0",
  discountAmount: "0",
  taxableAmount: "0",
  taxAmount: "0",
  totalAmount: "0",
  notes: "",
  items: [emptyItem(String(settings?.vatRate ?? "15"))],
});

export default function InvoicesPageRedesigned() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data: invoices, refetch, isLoading } = trpc.sales.invoiceList.useQuery(undefined);
  const { data: customers } = trpc.sales.customerList.useQuery(undefined);
  const { data: products } = trpc.inventory.productList.useQuery(undefined);
  const { data: settings } = trpc.settings.companySettingsGet.useQuery();
  
  const createInvoice = trpc.sales.invoiceCreate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Invoice created successfully"); 
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  
  const updateInvoice = trpc.sales.invoiceUpdate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Invoice updated successfully");
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(() => emptyForm(settings));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<SmartSearchOption | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Record<number, SmartSearchOption | null>>({});

  const set = (key: string, value: any) => {
    setForm(prev => recalculate({ ...prev, [key]: value }));
  };

  // Recalculate totals
  const recalculate = (data: typeof form) => {
    const isLabor = data.invoiceMode === "labor" || data.invoiceMode === "construction";
    
    let subTotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;

    const updatedItems = data.items.map(item => {
      const qty = Number(item.quantity || 0);
      const rate = isLabor ? Number(item.ratePerHour || item.unitPrice || 0) : Number(item.unitPrice || 0);
      const hours = Number(item.totalHours || qty);
      
      const lineSubtotal = isLabor ? hours * rate : qty * rate;
      const lineDiscount = lineSubtotal * (Number(item.discountPercent || 0) / 100);
      const lineTaxable = Math.max(lineSubtotal - lineDiscount, 0);
      const lineTax = lineTaxable * (Number(item.taxPercent || 0) / 100);
      
      subTotal += lineSubtotal;
      totalDiscountAmount += lineDiscount;
      totalTaxAmount += lineTax;

      return {
        ...item,
        totalAmount: (lineTaxable + lineTax).toFixed(2),
      };
    });

    const invoiceDiscount = Number(data.discountAmount || 0);
    const finalSubtotal = subTotal;
    const finalDiscount = totalDiscountAmount + invoiceDiscount;
    const taxableAmount = Math.max(finalSubtotal - finalDiscount, 0);
    const finalTax = totalTaxAmount;
    const finalTotal = taxableAmount + finalTax;

    return {
      ...data,
      items: updatedItems,
      subTotal: finalSubtotal.toFixed(2),
      taxableAmount: taxableAmount.toFixed(2),
      taxAmount: finalTax.toFixed(2),
      totalAmount: finalTotal.toFixed(2),
    };
  };

  const resetForm = () => {
    setForm(emptyForm(settings));
    setEditingId(null);
    setSelectedCustomer(null);
    setSelectedProducts({});
  };

  const addItem = () => {
    setForm(prev => recalculate({
      ...prev,
      items: [...prev.items, emptyItem(prev.taxPercent)]
    }));
  };

  const removeItem = (idx: number) => {
    if (form.items.length === 1) return;
    setForm(prev => recalculate({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return recalculate({ ...prev, items });
    });
  };

  // Smart search functions with auto-create
  const searchCustomers = async (query: string): Promise<SmartSearchOption[]> => {
    if (!customers) return [];
    const filtered = customers
      .filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.vatNumber?.includes(query) ||
        c.phone?.includes(query)
      )
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        label: c.name,
        sublabel: c.vatNumber ? `VAT: ${c.vatNumber}` : c.phone || "",
        data: c,
      }));
    
    // If exact match not found, show the typed name as an option to create
    if (query && !filtered.find(c => c.label.toLowerCase() === query.toLowerCase())) {
      return [
        ...filtered,
        {
          id: `new_${Date.now()}`,
          label: query,
          sublabel: "Click to use this new customer",
          data: { isNew: true, name: query },
        }
      ];
    }
    
    return filtered;
  };

  const createCustomer = async (query: string): Promise<SmartSearchOption | null> => {
    // Create a temporary customer that will be saved when invoice is created
    const tempId = `temp_${Date.now()}`;
    const tempCustomer = {
      id: tempId,
      label: query,
      sublabel: "Temporary customer (will be saved with invoice)",
      data: {
        isTemporary: true,
        name: query,
        nameAr: "",
        customerType: "cash_customer" as const,
        email: "",
        phone: "",
        vatNumber: "",
      },
    };
    
    // Show success message
    toast.success(`Using "${query}" as temporary customer`);
    
    return tempCustomer;
  };

  const searchProducts = async (query: string, itemIdx: number): Promise<SmartSearchOption[]> => {
    if (!products) return [];
    const filtered = products
      .filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku?.toLowerCase().includes(query.toLowerCase()) ||
        p.barcode?.includes(query)
      )
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        label: p.name,
        sublabel: `${p.sku || ""} - ${Number(p.salePrice).toLocaleString()} SAR`,
        data: p,
      }));
    
    // If exact match not found, show the typed name as an option to create
    if (query && !filtered.find(p => p.label.toLowerCase() === query.toLowerCase())) {
      return [
        ...filtered,
        {
          id: `new_${Date.now()}`,
          label: query,
          sublabel: "Click to use this new product",
          data: { isNew: true, name: query },
        }
      ];
    }
    
    return filtered;
  };

  const handleProductSelect = (option: SmartSearchOption | null, idx: number) => {
    if (!option) return;
    
    // If it's an existing product, autofill the details
    if (option.data && !option.data.isNew && !option.data.isTemporary) {
      updateItem(idx, "description", option.label);
      updateItem(idx, "sku", option.data.sku || "");
      updateItem(idx, "unitPrice", String(option.data.salePrice || "0"));
      updateItem(idx, "taxPercent", String(option.data.vatRate || form.taxPercent));
      updateItem(idx, "unit", option.data.unitOfMeasure || "pcs");
      toast.success(`Product "${option.label}" added to invoice`);
    } else {
      // New or temporary product - just use the name
      updateItem(idx, "description", option.label);
      updateItem(idx, "unitPrice", "0");
      toast.success(`Using "${option.label}" as temporary product`);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!form.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (form.items.length === 0 || !form.items.some(i => i.description)) {
      toast.error("Please add at least one item");
      return;
    }

    const payload = {
      ...form,
      customerId: Number(form.customerId),
    };

    if (editingId) {
      updateInvoice.mutate({ id: editingId, ...payload });
    } else {
      createInvoice.mutate(payload);
    }
  };

  // Table columns
  const columns: DataTableColumn<any>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      width: "120px",
    },
    {
      id: "date",
      header: "Date",
      cell: (row) => new Date(row.date).toLocaleDateString(),
      width: "100px",
    },
    {
      id: "customer",
      header: "Customer",
      cell: (row) => {
        const customer = customers?.find(c => c.id === row.customerId);
        return customer?.name || "—";
      },
    },
    {
      id: "mode",
      header: "Mode",
      cell: (row) => {
        const mode = INVOICE_MODES.find(m => m.value === row.invoiceMode);
        return <Badge variant="outline">{mode?.label || "Product"}</Badge>;
      },
      width: "120px",
    },
    {
      id: "total",
      header: "Total",
      cell: (row) => (
        <div className="text-right font-mono font-semibold">
          {Number(row.totalAmount).toLocaleString()} {row.currency || "SAR"}
        </div>
      ),
      width: "140px",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const statusMap: Record<string, any> = {
          draft: "draft",
          sent: "sent",
          paid: "paid",
          partial: "pending",
          overdue: "overdue",
          cancelled: "cancelled",
        };
        return (
          <StatusBadge status={statusMap[row.status] || "draft"}>
            {row.status}
          </StatusBadge>
        );
      },
      width: "100px",
    },
    {
      id: "zatca",
      header: "ZATCA",
      cell: (row) => {
        if (!row.zatcaStatus) return <span className="text-muted-foreground">—</span>;
        const zatcaMap: Record<string, any> = {
          cleared: "zatca_cleared",
          reported: "zatca_reported",
          ready: "zatca_ready",
          failed: "failed",
        };
        return (
          <StatusBadge status={zatcaMap[row.zatcaStatus] || "pending"} dot={false}>
            {row.zatcaStatus}
          </StatusBadge>
        );
      },
      width: "100px",
    },
  ];

  // Row actions
  const rowActions = (row: any): DataTableAction<any>[] => [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => console.log("View", row.id),
    },
    {
      label: "Edit",
      onClick: () => console.log("Edit", row.id),
    },
    {
      label: "Print",
      icon: <Printer className="h-4 w-4" />,
      onClick: () => console.log("Print", row.id),
    },
    {
      label: "Send",
      icon: <Send className="h-4 w-4" />,
      onClick: () => console.log("Send", row.id),
    },
    {
      label: "Generate XML",
      icon: <FileCode2 className="h-4 w-4" />,
      onClick: () => console.log("Generate XML", row.id),
    },
  ];

  const filteredInvoices = invoices?.filter(i =>
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customers?.find(c => c.id === i.customerId)?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isLabor = form.invoiceMode === "labor" || form.invoiceMode === "construction";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create and manage sales invoices with ZATCA compliance"
        breadcrumbs={[
          { label: "Sales", href: "/app/sales" },
          { label: "Invoices" },
        ]}
        actions={[
          {
            label: "New Invoice",
            onClick: () => setOpen(true),
            icon: <Plus className="h-4 w-4" />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredInvoices}
        searchPlaceholder="Search by invoice number or customer..."
        onSearch={setSearchQuery}
        loading={isLoading}
        rowActions={rowActions}
        emptyText="No invoices found. Create your first invoice."
      />

      {/* Invoice Form Sheet */}
      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <SheetContent className="w-full max-w-none sm:max-w-[95vw] lg:max-w-[1400px] overflow-y-auto p-0" side="right">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <SheetHeader>
              <SheetTitle className="text-2xl">
                {editingId ? "Edit Invoice" : "New Invoice"}
              </SheetTitle>
              <SheetDescription>
                Fill in invoice details. Fields marked with * are required.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <FormSection title="Invoice Header" columns={3}>
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input 
                  value={form.invoiceNumber} 
                  onChange={e => set("invoiceNumber", e.target.value)} 
                  required 
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input 
                  type="date" 
                  value={form.date} 
                  onChange={e => set("date", e.target.value)} 
                  required 
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date" 
                  value={form.dueDate} 
                  onChange={e => set("dueDate", e.target.value)} 
                  className="h-11"
                />
              </div>
            </FormSection>

            <FormSection title="Invoice Type & Mode" columns={1}>
              <div className="space-y-3">
                <Label>Invoice Mode *</Label>
                <div className="flex flex-wrap gap-2">
                  {INVOICE_MODES.map(mode => (
                    <Button
                      key={mode.value}
                      type="button"
                      size="default"
                      variant={form.invoiceMode === mode.value ? "default" : "outline"}
                      onClick={() => set("invoiceMode", mode.value)}
                      className="min-w-[140px]"
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Invoice Type</Label>
                  <Select 
                    value={form.invoiceType} 
                    onValueChange={v => set("invoiceType", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Tax Invoice</SelectItem>
                      <SelectItem value="simplified">Simplified Tax Invoice</SelectItem>
                      <SelectItem value="zatca">Saudi ZATCA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>VAT Rate (%)</Label>
                  <Input 
                    type="number" 
                    value={form.taxPercent} 
                    onChange={e => set("taxPercent", e.target.value)} 
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input 
                    value={form.currency} 
                    disabled 
                    className="bg-muted h-11" 
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Customer" columns={1}>
              <div className="space-y-2">
                <Label>Search and Select Customer *</Label>
                <SmartSearchInput
                  value={selectedCustomer?.id.toString()}
                  onSelect={(option) => {
                    if (option) {
                      setSelectedCustomer(option);
                      set("customerId", option.id);
                    } else {
                      setSelectedCustomer(null);
                      set("customerId", 0);
                    }
                  }}
                  onSearch={searchCustomers}
                  onCreate={createCustomer}
                  placeholder="Type customer name, VAT, or phone..."
                  emptyText="No customers found"
                  createText="Create new customer"
                  allowCreate={true}
                  showBadge={!!selectedCustomer}
                  badgeText="Selected"
                  className="h-11"
                />
                {selectedCustomer && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Selected</Badge>
                    <span>{selectedCustomer.label}</span>
                    {selectedCustomer.sublabel && (
                      <span className="text-xs">({selectedCustomer.sublabel})</span>
                    )}
                  </div>
                )}
              </div>
            </FormSection>

            {isLabor && (
              <FormSection title="Labor/Construction Details" columns={1}>
                <div className="space-y-2">
                  <Label>Worked Month</Label>
                  <Input 
                    type="month" 
                    value={form.workedMonth} 
                    onChange={e => set("workedMonth", e.target.value)} 
                    className="h-11"
                  />
                </div>
              </FormSection>
            )}

            <FormSection title="Reference Numbers" columns={3}>
              <div className="space-y-2">
                <Label>PO Number</Label>
                <Input 
                  value={form.poNumber} 
                  onChange={e => set("poNumber", e.target.value)} 
                  placeholder="PO-001"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Contract Number</Label>
                <Input 
                  value={form.contractNumber} 
                  onChange={e => set("contractNumber", e.target.value)} 
                  placeholder="CONT-001"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Project Reference</Label>
                <Input 
                  value={form.projectReference} 
                  onChange={e => set("projectReference", e.target.value)} 
                  placeholder="PRJ-001"
                  className="h-11"
                />
              </div>
            </FormSection>

            <FormSection title="Invoice Items" columns={1}>
              <div className="space-y-4">
                {form.items.map((item, idx) => (
                  <Card key={idx} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Product / Service / Item *</Label>
                              <SmartSearchInput
                                value={selectedProducts[idx]?.id.toString()}
                                onSelect={(option) => {
                                  if (option) {
                                    setSelectedProducts(prev => ({ ...prev, [idx]: option }));
                                    handleProductSelect(option, idx);
                                  } else {
                                    setSelectedProducts(prev => ({ ...prev, [idx]: null }));
                                  }
                                }}
                                onSearch={(query) => searchProducts(query, idx)}
                                onCreate={async (query) => {
                                  const tempProduct = {
                                    id: `temp_${Date.now()}`,
                                    label: query,
                                    sublabel: "Temporary item (will be saved with invoice)",
                                    data: { isTemporary: true, name: query },
                                  };
                                  updateItem(idx, "description", query);
                                  toast.success(`Using "${query}" as temporary item`);
                                  return tempProduct;
                                }}
                                placeholder="Type product name, SKU, or barcode..."
                                emptyText="No products found"
                                createText="Use this item"
                                allowCreate={true}
                                showBadge={!!selectedProducts[idx]}
                                badgeText={selectedProducts[idx]?.data?.isTemporary ? "Temp" : "Selected"}
                                className="h-11"
                              />
                              {selectedProducts[idx] && (
                                <div className="text-xs text-muted-foreground">
                                  {selectedProducts[idx]?.data?.isTemporary ? (
                                    <span className="text-amber-600">
                                      ⚠️ Temporary item - will be saved with invoice
                                    </span>
                                  ) : (
                                    <span className="text-green-600">
                                      ✓ {selectedProducts[idx]?.sublabel}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {isLabor ? (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-sm">Total Hours</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.totalHours || item.quantity}
                                    onChange={e => updateItem(idx, "totalHours", Number(e.target.value))}
                                    className="h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm">Rate per Hour</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.ratePerHour || item.unitPrice}
                                    onChange={e => updateItem(idx, "ratePerHour", Number(e.target.value))}
                                    className="h-11"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-2">
                                  <Label className="text-sm">Quantity</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                                    className="h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm">Unit Price (SAR)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={e => updateItem(idx, "unitPrice", e.target.value)}
                                    className="h-11"
                                  />
                                </div>
                              </>
                            )}

                            <div className="space-y-2">
                              <Label className="text-sm">VAT %</Label>
                              <Input
                                type="number"
                                value={item.taxPercent}
                                onChange={e => updateItem(idx, "taxPercent", e.target.value)}
                                className="h-11"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Line Total</Label>
                              <Input
                                value={`${Number(item.totalAmount).toLocaleString()} SAR`}
                                disabled
                                className="bg-muted font-mono font-bold h-11"
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length === 1}
                          className="mt-8 h-11 w-11"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full h-12 text-base"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Another Item
                </Button>
              </div>
            </FormSection>

            <FormSection title="Invoice Summary" columns={1} noDivider>
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-base">
                    <span className="text-muted-foreground font-medium">Subtotal:</span>
                    <span className="font-mono font-semibold text-lg">{Number(form.subTotal).toLocaleString()} {form.currency}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-base border-t pt-4">
                    <span className="text-muted-foreground font-medium">Discount Amount:</span>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={form.discountAmount}
                        onChange={e => set("discountAmount", e.target.value)}
                        className="h-10 w-32 text-right font-mono"
                        placeholder="0.00"
                      />
                      <span className="font-mono font-semibold">{form.currency}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-base">
                    <span className="text-muted-foreground font-medium">Taxable Amount:</span>
                    <span className="font-mono font-semibold text-lg">{Number(form.taxableAmount).toLocaleString()} {form.currency}</span>
                  </div>

                  <div className="flex justify-between items-center text-base">
                    <span className="text-muted-foreground font-medium">VAT ({form.taxPercent}%):</span>
                    <span className="font-mono font-semibold text-lg">{Number(form.taxAmount).toLocaleString()} {form.currency}</span>
                  </div>

                  <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t-2">
                    <span>Total Amount:</span>
                    <span className="font-mono text-primary">{Number(form.totalAmount).toLocaleString()} {form.currency}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2 mt-4">
                <Label className="text-base">Notes / Terms</Label>
                <Textarea
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                  rows={4}
                  placeholder="Add any additional notes, payment terms, or conditions..."
                  className="text-base"
                />
              </div>
            </FormSection>

            <div className="sticky bottom-0 bg-background border-t-2 pt-6 pb-2 -mx-6 px-6 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }} className="h-11 px-6">
                Cancel
              </Button>
              <Button type="button" variant="secondary" className="h-11 px-6">
                Save as Draft
              </Button>
              <Button type="submit" disabled={createInvoice.isPending || updateInvoice.isPending} className="h-11 px-8">
                {editingId ? "Update Invoice" : "Create Invoice"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
