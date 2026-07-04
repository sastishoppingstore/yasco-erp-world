import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Plus, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn, DataTableAction } from "@/components/ui/data-table";
import { FormSection } from "@/components/ui/form-section";
import { StatusBadge } from "@/components/ui/status-badge";

const emptyForm = {
  code: "",
  name: "",
  branchName: "",
  city: "",
  address: "",
  managerName: "",
  managerPhone: "",
  capacity: "",
  isActive: true,
  notes: "",
};

export default function WarehousesPageRedesigned() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  
  const { data: warehouses, refetch, isLoading } = trpc.inventory.warehouseList.useQuery(undefined);
  
  const createWarehouse = trpc.inventory.warehouseCreate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Warehouse created successfully"); 
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  
  const updateWarehouse = trpc.inventory.warehouseUpdate.useMutation({
    onSuccess: () => { 
      refetch(); 
      toast.success("Warehouse updated successfully");
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

  const openEdit = (w: any) => {
    setForm({
      code: w.code || "",
      name: w.name || "",
      branchName: w.branchName || "",
      city: w.city || "",
      address: w.address || "",
      managerName: w.managerName || "",
      managerPhone: w.managerPhone || "",
      capacity: String(w.capacity || ""),
      isActive: w.isActive !== false,
      notes: w.notes || "",
    });
    setEditingId(w.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateWarehouse.mutate({ id: editingId, ...form });
    } else {
      createWarehouse.mutate(form);
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
      header: "Warehouse Name",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.branchName && (
            <div className="text-xs text-muted-foreground">
              Branch: {row.branchName}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (row) => (
        <div className="text-sm">
          {row.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span>{row.city}</span>
            </div>
          )}
          {row.address && (
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.address}
            </div>
          )}
        </div>
      ),
      width: "250px",
    },
    {
      id: "manager",
      header: "Manager",
      cell: (row) => (
        <div className="text-sm">
          {row.managerName && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground" />
              <span>{row.managerName}</span>
            </div>
          )}
          {row.managerPhone && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Phone className="w-3 h-3" />
              <span>{row.managerPhone}</span>
            </div>
          )}
        </div>
      ),
      width: "200px",
    },
    {
      id: "capacity",
      header: "Capacity",
      cell: (row) => (
        <div className="text-right">
          {row.capacity ? `${Number(row.capacity).toLocaleString()} sqm` : "—"}
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
      label: "Stock Report",
      onClick: () => console.log("Stock report", row.id),
    },
  ];

  const filteredWarehouses = warehouses?.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.city?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage warehouse locations and stock storage facilities"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Warehouses" },
        ]}
        actions={[
          {
            label: "Add Warehouse",
            onClick: () => setOpen(true),
            icon: <Plus className="h-4 w-4" />,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filteredWarehouses}
        searchPlaceholder="Search by name, code, or city..."
        onSearch={setSearchQuery}
        loading={isLoading}
        rowActions={rowActions}
        emptyText="No warehouses found. Add your first warehouse."
      />

      {/* Warehouse Form Sheet */}
      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Warehouse" : "New Warehouse"}
            </SheetTitle>
            <SheetDescription>
              Fill in warehouse information. Fields marked with * are required.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <FormSection title="Basic Information" columns={2}>
              <div className="space-y-2">
                <Label>Warehouse Code *</Label>
                <Input 
                  value={form.code} 
                  onChange={e => set("code", e.target.value)} 
                  placeholder="WH-001"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Warehouse Name *</Label>
                <Input 
                  value={form.name} 
                  onChange={e => set("name", e.target.value)} 
                  placeholder="Main Warehouse"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input 
                  value={form.branchName} 
                  onChange={e => set("branchName", e.target.value)} 
                  placeholder="Head Office"
                />
              </div>

              <div className="space-y-2">
                <Label>City *</Label>
                <Input 
                  value={form.city} 
                  onChange={e => set("city", e.target.value)} 
                  placeholder="Riyadh"
                  required
                />
              </div>
            </FormSection>

            <FormSection title="Location Details" columns={1}>
              <div className="space-y-2">
                <Label>Full Address</Label>
                <Textarea 
                  value={form.address} 
                  onChange={e => set("address", e.target.value)} 
                  rows={3}
                  placeholder="Enter complete warehouse address..."
                />
              </div>
            </FormSection>

            <FormSection title="Manager Information" columns={2}>
              <div className="space-y-2">
                <Label>Manager Name</Label>
                <Input 
                  value={form.managerName} 
                  onChange={e => set("managerName", e.target.value)} 
                  placeholder="Ahmed Ali"
                />
              </div>

              <div className="space-y-2">
                <Label>Manager Phone</Label>
                <Input 
                  value={form.managerPhone} 
                  onChange={e => set("managerPhone", e.target.value)} 
                  placeholder="+966 50 123 4567"
                />
              </div>
            </FormSection>

            <FormSection title="Additional Details" columns={1}>
              <div className="space-y-2">
                <Label>Capacity (Square Meters)</Label>
                <Input 
                  type="number"
                  value={form.capacity} 
                  onChange={e => set("capacity", e.target.value)} 
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={form.notes} 
                  onChange={e => set("notes", e.target.value)} 
                  rows={2}
                  placeholder="Additional notes or instructions..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(checked) => set("isActive", checked)}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active (available for stock operations)
                </Label>
              </div>
            </FormSection>

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWarehouse.isPending || updateWarehouse.isPending}>
                {editingId ? "Update Warehouse" : "Create Warehouse"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
