import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, FileText, AlertTriangle, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn, DataTableAction } from "@/components/ui/data-table";
import { FormSection } from "@/components/ui/form-section";
import { StatusBadge } from "@/components/ui/status-badge";

type CustomerType = "b2b" | "b2c" | "government" | "cash_customer";

import { FileUpload } from "@/components/ui/file-upload";

const emptyForm = {
  name: "",
  nameAr: "",
  customerType: "b2b" as CustomerType,
  crNumber: "",
  vatNumber: "",
  email: "",
  phone: "",
  whatsapp: "",
  buildingNumber: "",
  streetName: "",
  district: "",
  city: "",
  postalCode: "",
  additionalNumber: "",
  address: "",
  contactPerson: "",
  contactTitle: "",
  creditLimit: "0",
  paymentTerms: 30,
  openingBalance: "0",
  openingBalanceDate: "",
  attachments: [] as string[],
};

export default function CustomersPageRedesigned() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data: customers, refetch, isLoading } = trpc.sales.customerList.useQuery(undefined);
  const createCustomer = trpc.sales.customerCreate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success(isAr ? "Customer created successfully" : "Customer created successfully"); 
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateCustomer = trpc.sales.customerUpdate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success(isAr ? "Customer updated successfully" : "Customer updated successfully");
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  const set = (key: keyof typeof form, value: string | number) => 
    setForm(prev => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openEdit = (c: any) => {
    setForm({
      name: c.name || "",
      nameAr: c.nameAr || "",
      customerType: c.customerType || "b2b",
      crNumber: c.crNumber || "",
      vatNumber: c.vatNumber || "",
      email: c.email || "",
      phone: c.phone || "",
      whatsapp: c.whatsapp || "",
      buildingNumber: c.buildingNumber || "",
      streetName: c.streetName || "",
      district: c.district || "",
      city: c.city || "",
      postalCode: c.postalCode || "",
      additionalNumber: c.additionalNumber || "",
      address: c.address || "",
      contactPerson: c.contactPerson || "",
      contactTitle: c.contactTitle || "",
      creditLimit: String(c.creditLimit || "0"),
      paymentTerms: c.paymentTerms || 30,
      openingBalance: String(c.openingBalance || "0"),
      openingBalanceDate: c.openingBalanceDate || "",
    });
    setEditingId(c.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCustomer.mutate({ id: editingId, ...form });
    } else {
      createCustomer.mutate(form);
    }
  };

  const isB2B = form.customerType === "b2b";
  const vatHelper = isB2B
    ? "Required for standard tax invoices"
    : "Optional for simplified invoices";

  // Table columns
  const columns: DataTableColumn<any>[] = [
    {
      id: "code",
      header: "Code",
      accessorKey: "code",
      width: "100px",
    },
    {
      id: "name",
      header: "Customer",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.nameAr && (
            <div className="text-xs text-muted-foreground" dir="rtl">
              {row.nameAr}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => {
        const typeMap: Record<string, { label: string; status: any }> = {
          b2b: { label: "B2B", status: "confirmed" },
          b2c: { label: "B2C", status: "active" },
          government: { label: "Government", status: "zatca_ready" },
          cash_customer: { label: "Cash", status: "pending" },
        };
        const type = typeMap[row.customerType] || typeMap.b2b;
        return <StatusBadge status={type.status}>{type.label}</StatusBadge>;
      },
      width: "100px",
    },
    {
      id: "vat",
      header: "VAT / CR",
      cell: (row) => (
        <div className="text-xs font-mono">
          {row.vatNumber ? <div>VAT: {row.vatNumber}</div> : <div className="text-muted-foreground">—</div>}
          {row.crNumber && <div className="text-muted-foreground">CR: {row.crNumber}</div>}
        </div>
      ),
      width: "180px",
    },
    {
      id: "contact",
      header: "Contact",
      cell: (row) => (
        <div className="text-sm space-y-1">
          {row.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span className="truncate">{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
      width: "200px",
    },
    {
      id: "creditLimit",
      header: "Credit Limit",
      cell: (row) => (
        <div className="text-right font-mono">
          {Number(row.creditLimit).toLocaleString()} SAR
        </div>
      ),
      width: "120px",
    },
    {
      id: "balance",
      header: "Balance",
      cell: (row) => (
        <div className={`text-right font-mono font-semibold ${Number(row.currentBalance) > 0 ? "text-amber-600" : ""}`}>
          {Number(row.currentBalance).toLocaleString()} SAR
        </div>
      ),
      width: "120px",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"}>
          {row.isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
      width: "100px",
    },
  ];

  // Row actions
  const rowActions = (row: any): DataTableAction<any>[] => [
    {
      label: "Edit",
      onClick: () => openEdit(row),
    },
    {
      label: "View Transactions",
      onClick: () => console.log("View transactions", row.id),
    },
    {
      label: "Send Statement",
      onClick: () => console.log("Send statement", row.id),
    },
  ];

  const filteredCustomers = customers?.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.vatNumber?.includes(searchQuery) ||
    c.crNumber?.includes(searchQuery)
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer relationships and account balances"
        breadcrumbs={[
          { label: "Sales", href: "/app/sales" },
          { label: "Customers" },
        ]}
        actions={[
          {
            label: "Add Customer",
            onClick: () => setOpen(true),
            icon: <Plus className="h-4 w-4" />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredCustomers}
        searchPlaceholder="Search by name, email, VAT, or CR..."
        onSearch={setSearchQuery}
        loading={isLoading}
        rowActions={rowActions}
        emptyText="No customers found. Add your first customer."
      />

      {/* Customer Form Sheet */}
      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Customer" : "New Customer"}
            </SheetTitle>
            <SheetDescription>
              Fill in customer information. Fields marked with * are required.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <FormSection title="Basic Information" columns={2}>
              <div className="space-y-2">
                <Label>Customer Type *</Label>
                <Select 
                  value={form.customerType} 
                  onValueChange={(v: CustomerType) => set("customerType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2b">B2B Company</SelectItem>
                    <SelectItem value="b2c">B2C Individual</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="cash_customer">Cash Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input 
                  value={form.name} 
                  onChange={e => set("name", e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input 
                  dir="rtl" 
                  value={form.nameAr} 
                  onChange={e => set("nameAr", e.target.value)} 
                />
              </div>
            </FormSection>

            <FormSection title="Saudi Tax & Legal Information" columns={2}>
              <div className="space-y-2">
                <Label>Commercial Registration (CR)</Label>
                <Input 
                  value={form.crNumber} 
                  onChange={e => set("crNumber", e.target.value)} 
                  placeholder="1010000000" 
                />
              </div>

              <div className="space-y-2">
                <Label>Saudi VAT Registration No. / TIN</Label>
                <div className="relative">
                  <Input
                    value={form.vatNumber}
                    onChange={e => set("vatNumber", e.target.value.replace(/\D/g, "").slice(0, 15))}
                    maxLength={15}
                    placeholder="300000000000003"
                    className={isB2B && form.vatNumber && form.vatNumber.length !== 15 ? "border-amber-400" : ""}
                  />
                  {isB2B && form.vatNumber && form.vatNumber.length !== 15 && (
                    <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{vatHelper}</p>
                {isB2B && form.vatNumber.length < 15 && form.vatNumber.length > 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    VAT number must be 15 digits
                  </p>
                )}
              </div>
            </FormSection>

            <FormSection title="Contact Information" columns={3}>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={form.email} 
                  onChange={e => set("email", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={form.phone} 
                  onChange={e => set("phone", e.target.value)} 
                  placeholder="+9665XXXXXXXX" 
                />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input 
                  value={form.whatsapp} 
                  onChange={e => set("whatsapp", e.target.value)} 
                  placeholder="+9665XXXXXXXX" 
                />
              </div>
            </FormSection>

            <FormSection title="National Address" columns={2}>
              <div className="space-y-2">
                <Label>Building Number</Label>
                <Input value={form.buildingNumber} onChange={e => set("buildingNumber", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Street Name</Label>
                <Input value={form.streetName} onChange={e => set("streetName", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>District</Label>
                <Input value={form.district} onChange={e => set("district", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => set("city", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input value={form.postalCode} onChange={e => set("postalCode", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Additional Number</Label>
                <Input value={form.additionalNumber} onChange={e => set("additionalNumber", e.target.value)} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Full Address</Label>
                <Textarea 
                  value={form.address} 
                  onChange={e => set("address", e.target.value)} 
                  rows={2} 
                />
              </div>
            </FormSection>

            <FormSection title="Contact Person" columns={2}>
              <div className="space-y-2">
                <Label>Contact Person Name</Label>
                <Input value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input value={form.contactTitle} onChange={e => set("contactTitle", e.target.value)} />
              </div>
            </FormSection>

            <FormSection title="Documents & Attachments" columns={1}>
              <FileUpload
                label="Upload Documents"
                description="CR copy, VAT certificate, contracts, or other documents (PDF, Images - Max 5 files)"
                value={form.attachments}
                onChange={(files) => set("attachments", files)}
                accept="image/*,.pdf,.doc,.docx"
                multiple={true}
                maxSize={5}
                maxFiles={5}
                preview={true}
              />
            </FormSection>

            <FormSection title="Financial Settings" columns={3} noDivider>
              <div className="space-y-2">
                <Label>Credit Limit (SAR)</Label>
                <Input 
                  type="number" 
                  value={form.creditLimit} 
                  onChange={e => set("creditLimit", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Terms (days)</Label>
                <Input 
                  type="number" 
                  value={form.paymentTerms} 
                  onChange={e => set("paymentTerms", Number(e.target.value))} 
                />
              </div>

              <div className="space-y-2">
                <Label>Opening Balance (SAR)</Label>
                <Input 
                  type="number" 
                  value={form.openingBalance} 
                  onChange={e => set("openingBalance", e.target.value)} 
                />
              </div>
            </FormSection>

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCustomer.isPending || updateCustomer.isPending}>
                {editingId ? "Update Customer" : "Create Customer"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
