import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Upload, Image as ImageIcon, Barcode } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn, DataTableAction } from "@/components/ui/data-table";
import { FormSection } from "@/components/ui/form-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartSearchInput, SmartSearchOption } from "@/components/ui/smart-search-input";

import { FileUpload } from "@/components/ui/file-upload";

const emptyForm = {
  sku: "",
  barcode: "",
  name: "",
  nameAr: "",
  categoryId: undefined as number | undefined,
  brandName: "",
  unitOfMeasure: "pcs",
  purchasePrice: "0",
  salePrice: "0",
  vatRate: "15",
  costMethod: "fifo" as const,
  productType: "goods" as const,
  openingStock: "0",
  defaultWarehouseId: undefined as number | undefined,
  reorderLevel: "0",
  enableBatchExpiry: false,
  enableSerialNumber: false,
  isActive: true,
  description: "",
  image: "",
  attachments: [] as string[],
};

export default function ProductsPageRedesigned() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data: products, refetch, isLoading } = trpc.inventory.productList.useQuery(undefined);
  const { data: categories } = trpc.inventory.categoryList.useQuery(undefined);
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery(undefined);
  
  const createProduct = trpc.inventory.productCreate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Product created successfully"); 
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  
  const updateProduct = trpc.inventory.productUpdate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Product updated successfully");
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

  const openEdit = (p: any) => {
    setForm({
      sku: p.sku || "",
      barcode: p.barcode || "",
      name: p.name || "",
      nameAr: p.nameAr || "",
      categoryId: p.categoryId,
      brandName: p.brandName || "",
      unitOfMeasure: p.unitOfMeasure || "pcs",
      purchasePrice: String(p.purchasePrice || "0"),
      salePrice: String(p.salePrice || "0"),
      vatRate: String(p.vatRate || "15"),
      costMethod: p.costMethod || "fifo",
      productType: p.productType || "goods",
      openingStock: String(p.openingStock || "0"),
      defaultWarehouseId: p.defaultWarehouseId,
      reorderLevel: String(p.reorderLevel || "0"),
      enableBatchExpiry: p.enableBatchExpiry || false,
      enableSerialNumber: p.enableSerialNumber || false,
      isActive: p.isActive !== false,
      description: p.description || "",
    });
    setEditingId(p.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      defaultWarehouseId: form.defaultWarehouseId ? Number(form.defaultWarehouseId) : undefined,
    };
    
    if (editingId) {
      updateProduct.mutate({ id: editingId, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  // Search category for SmartSearchInput example
  const searchCategories = async (query: string): Promise<SmartSearchOption[]> => {
    if (!categories) return [];
    return categories
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      .map(c => ({
        id: c.id,
        label: c.name,
        sublabel: `${c.productCount || 0} products`,
        data: c,
      }));
  };

  // Table columns
  const columns: DataTableColumn<any>[] = [
    {
      id: "sku",
      header: "SKU",
      accessorKey: "sku",
      width: "120px",
    },
    {
      id: "name",
      header: "Product Name",
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
          goods: { label: "Goods", status: "active" },
          service: { label: "Service", status: "confirmed" },
          bundle: { label: "Bundle", status: "zatca_ready" },
        };
        const type = typeMap[row.productType] || typeMap.goods;
        return <StatusBadge status={type.status}>{type.label}</StatusBadge>;
      },
      width: "100px",
    },
    {
      id: "costMethod",
      header: "Cost Method",
      cell: (row) => (
        <span className="text-xs font-medium uppercase">{row.costMethod}</span>
      ),
      width: "120px",
    },
    {
      id: "purchasePrice",
      header: "Purchase",
      cell: (row) => (
        <div className="text-right font-mono">
          {Number(row.purchasePrice).toLocaleString()} SAR
        </div>
      ),
      width: "120px",
    },
    {
      id: "salePrice",
      header: "Sale",
      cell: (row) => (
        <div className="text-right font-mono">
          {Number(row.salePrice).toLocaleString()} SAR
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
      label: "View Stock",
      onClick: () => console.log("View stock", row.id),
    },
    {
      label: "Price History",
      onClick: () => console.log("Price history", row.id),
    },
  ];

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode?.includes(searchQuery)
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog and inventory items"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Products" },
        ]}
        actions={[
          {
            label: "Add Product",
            onClick: () => setOpen(true),
            icon: <Plus className="h-4 w-4" />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search by name, SKU, or barcode..."
        onSearch={setSearchQuery}
        loading={isLoading}
        rowActions={rowActions}
        emptyText="No products found. Add your first product."
      />

      {/* Product Form Sheet */}
      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Product" : "New Product"}
            </SheetTitle>
            <SheetDescription>
              Fill in product information. Fields marked with * are required.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <FormSection title="Basic Information" columns={2}>
              <div className="space-y-2">
                <Label>SKU / Code *</Label>
                <Input 
                  value={form.sku} 
                  onChange={e => set("sku", e.target.value)} 
                  placeholder="PROD-001"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Barcode / QR Code</Label>
                <div className="relative">
                  <Input 
                    value={form.barcode} 
                    onChange={e => set("barcode", e.target.value)} 
                    placeholder="1234567890123"
                  />
                  <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Name (English) *</Label>
                <Input 
                  value={form.name} 
                  onChange={e => set("name", e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Product Name (Arabic)</Label>
                <Input 
                  dir="rtl" 
                  value={form.nameAr} 
                  onChange={e => set("nameAr", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={form.categoryId?.toString()} 
                  onValueChange={(v) => set("categoryId", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Input 
                  value={form.brandName} 
                  onChange={e => set("brandName", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Unit of Measure</Label>
                <Select 
                  value={form.unitOfMeasure} 
                  onValueChange={(v) => set("unitOfMeasure", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="ltr">Liters</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="sqm">Square Meter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select 
                  value={form.productType} 
                  onValueChange={(v: any) => set("productType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goods">Goods</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormSection>

            <FormSection title="Pricing & Tax" columns={3}>
              <div className="space-y-2">
                <Label>Purchase Price (SAR)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={form.purchasePrice} 
                  onChange={e => set("purchasePrice", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Sale Price (SAR) *</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={form.salePrice} 
                  onChange={e => set("salePrice", e.target.value)} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>VAT Rate (%)</Label>
                <Input 
                  type="number" 
                  value={form.vatRate} 
                  onChange={e => set("vatRate", e.target.value)} 
                />
              </div>
            </FormSection>

            <FormSection title="Inventory Settings" columns={2}>
              <div className="space-y-2">
                <Label>Cost Method</Label>
                <Select 
                  value={form.costMethod} 
                  onValueChange={(v: any) => set("costMethod", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fifo">FIFO</SelectItem>
                    <SelectItem value="lifo">LIFO</SelectItem>
                    <SelectItem value="weighted_average">Weighted Average</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Warehouse</Label>
                <Select 
                  value={form.defaultWarehouseId?.toString()} 
                  onValueChange={(v) => set("defaultWarehouseId", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map(w => (
                      <SelectItem key={w.id} value={w.id.toString()}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Opening Stock</Label>
                <Input 
                  type="number" 
                  value={form.openingStock} 
                  onChange={e => set("openingStock", e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input 
                  type="number" 
                  value={form.reorderLevel} 
                  onChange={e => set("reorderLevel", e.target.value)} 
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="batch"
                  checked={form.enableBatchExpiry}
                  onCheckedChange={(checked) => set("enableBatchExpiry", checked)}
                />
                <Label htmlFor="batch" className="cursor-pointer">
                  Track Batch & Expiry
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="serial"
                  checked={form.enableSerialNumber}
                  onCheckedChange={(checked) => set("enableSerialNumber", checked)}
                />
                <Label htmlFor="serial" className="cursor-pointer">
                  Track Serial Numbers
                </Label>
              </div>
            </FormSection>

            <FormSection title="Product Image & Attachments" columns={1}>
              <div className="space-y-4">
                <FileUpload
                  label="Product Image"
                  description="Upload product image (JPG, PNG, WebP - Max 5MB)"
                  value={form.image}
                  onChange={(file) => set("image", file)}
                  accept="image/*"
                  multiple={false}
                  maxSize={5}
                  preview={true}
                />

                <FileUpload
                  label="Attachments (Optional)"
                  description="Upload certificates, manuals, or other documents (PDF, DOC, Images - Max 5 files)"
                  value={form.attachments}
                  onChange={(files) => set("attachments", files)}
                  accept="image/*,.pdf,.doc,.docx"
                  multiple={true}
                  maxSize={5}
                  maxFiles={5}
                  preview={true}
                />
              </div>
            </FormSection>

            <FormSection title="Description" columns={1} noDivider>
              <div className="space-y-2">
                <Label>Product Description</Label>
                <Textarea 
                  value={form.description} 
                  onChange={e => set("description", e.target.value)} 
                  rows={3}
                  placeholder="Enter product description, specifications, or notes..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(checked) => set("isActive", checked)}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active (available for sale)
                </Label>
              </div>
            </FormSection>

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {editingId ? "Update Product" : "Create Product"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
