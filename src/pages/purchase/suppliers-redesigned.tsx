import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn, DataTableAction } from "@/components/ui/data-table";
import { FormSection } from "@/components/ui/form-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileUpload } from "@/components/ui/file-upload";

const emptyForm = {
  legalNameEn: "",
  legalNameAr: "",
  name: "",
  nameAr: "",
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
  bankName: "",
  bankIban: "",
  bankAccountNumber: "",
  creditLimit: "0",
  paymentTerms: 30,
  openingBalance: "0",
  attachments: [] as string[],
};

export default function SuppliersPageRedesigned() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data: suppliers, refetch, isLoading } = trpc.purchase.supplierList.useQuery(undefined);
  
  const createSupplier = trpc.purchase.supplierCreate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Supplier created successfully"); 
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  
  const updateSupplier = trpc.purchase.supplierUpdate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Supplier updated successfully");
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");

  const set = (key: keyof typeof form, value: any) => 
    setForm(prev => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openEdit = (s: any) => {
    setForm({
      legalNameEn: s.legalNameEn || "",
      legalNameAr: s.legalNameAr || "",
      name: s.name || "",
      nameAr: s.nameAr || "",
      crNumber: s.crNumber || "",
      vatNumber: s.vatNumber || "",
      email: s.email || "",
      phone: s.phone || "",
      whatsapp: s.whatsapp || "",
      buildingNumber: s.buildingNumber || "",
      streetName: s.streetName || "",
      district: s.district || "",
      city: s.city || "",
      postalCode: s.postalCode || "",
      additionalNumber: s.additionalNumber || "",
      address: s.address || "",
      contactPerson: s.contactPerson || "",
      contactTitle: s.contactTitle || "",
      bankName: s.bankName || "",
      bankIban: s.bankIban || "",
      bankAccountNumber: s.bankAccountNumber || "",
      creditLimit: String(s.creditLimit || "0"),
      paymentTerms: s.paymentTerms || 30,
      openingBalance: String(s.openingBalance || "0"),
      attachments: s.attachments || [],
    });
    setEditingId(s.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateSupplier.mutate({ id: editingId, ...form });
    } else {
      createSupplier.mutate(form);
    }
  };

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
      header: "Supplier",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name || row.legalNameEn}</div>
          {row.nameAr && (
            <div className="text-xs text-muted-foreground" dir="rtl">
              {row.nameAr}
            </div>
          )}
        </div>
      ),
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
      id: "bank",
      header: "Bank Details",
      cell: (row) => (
        <div className="text-xs">
          {row.bankName && <div>{row.bankName}</div>}
          {row.bankIban && <div className="text-muted-foreground font-mono">{row.bankIban}</div>}
        </div>
      ),
      width: "200px",
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

  const filteredSuppliers = suppliers?.filter(s =>
    (s.name || s.legalNameEn || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery) ||
    s.vatNumber?.includes(searchQuery)
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage supplier relationships and payment terms"
        breadcrumbs={[
          { label: "Purchase", href: "/app/purchase" },
          { label: "Suppliers" },
        ]}
        actions={[
          {
            label: "Add Supplier",
            onClick: () => setOpen(true),
            icon: <Plus className="h-4 w-4" />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredSuppliers}
        searchPlaceholder="Search by name, email, VAT, or phone..."
        onSearch={setSearchQuery}
        loading={isLoading}
        rowActions={rowActions}
        emptyText="No suppliers found. Add your first supplier."
      />

      {/* Supplier Form Sheet */}
      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Supplier" : "New Supplier"}
            </SheetTitle>
            <SheetDescription>
              Fill in supplier information. Fields marked with * are required.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <FormSection title="Basic Information" columns={2}>
              <div className="space-y-2">
                <Label>Legal Name (English) *</Label>
                <Input 
                  value={form.legalNameEn} 
                  onChange={e => set("legalNameEn", e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Legal Name (Arabic)</Label>
                <Input 
                  dir="rtl" 
                  value={form.legalNameAr} 
                  onChange={e => set("legalNameAr", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Trade Name (English)</Label>
                <Input 
                  value={form.name} 
                  onChange={e => set("name", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Trade Name (Arabic)</Label>
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
                <Input
                  value={form.vatNumber}
                  onChange={e => set("vatNumber", e.target.value.replace(/\D/g, "").slice(0, 15))}
                  maxLength={15}
                  placeholder="300000000000003"
                />
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

            <FormSection title="Bank Information" columns={3}>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={form.bankName} onChange={e => set("bankName", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input 
                  value={form.bankIban} 
                  onChange={e => set("bankIban", e.target.value)} 
                  placeholder="SA00 0000 0000 0000 0000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input value={form.bankAccountNumber} onChange={e => set("bankAccountNumber", e.target.value)} />
              </div>
            </FormSection>

            <FormSection title="Documents & Attachments" columns={1}>
              <FileUpload
                label="Upload Documents"
                description="CR copy, VAT certificate, bank certificate, contracts (PDF, Images - Max 5 files)"
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
              <Button type="submit" disabled={createSupplier.isPending || updateSupplier.isPending}>
                {editingId ? "Update Supplier" : "Create Supplier"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
