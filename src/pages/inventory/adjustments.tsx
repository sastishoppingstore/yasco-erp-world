import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Search, Plus, Package, ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  approved: "bg-emerald-100 text-emerald-700",
  applied: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

const typeColors: Record<string, string> = {
  addition: "bg-emerald-100 text-emerald-700",
  subtraction: "bg-red-100 text-red-700",
  damage: "bg-orange-100 text-orange-700",
  expiry: "bg-purple-100 text-purple-700",
  audit: "bg-blue-100 text-blue-700",
};

export default function StockAdjustments() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    adjustmentDate: new Date().toISOString().slice(0, 10),
    adjustmentType: "addition",
    reason: "",
    warehouseId: 0,
    items: [{ productId: 0, productName: "", quantity: 0, unitCost: "0", notes: "" }] as { productId: number; productName: string; quantity: number; unitCost: string; notes: string }[],
  });

  const { data: adjustments, refetch } = trpc.inventory.adjustmentList.useQuery(undefined);
  const { data: products } = trpc.inventory.productList.useQuery(undefined);
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery(undefined);
  const createMut = trpc.inventory.adjustmentCreate.useMutation({
    onSuccess: () => { refetch(); setOpen(false); toast.success(isAr ? "تم إنشاء التعديل" : "Adjustment created"); },
    onError: (e) => toast.error(e.message),
  });

  const addItem = () => setForm(prev => ({
    ...prev,
    items: [...prev.items, { productId: 0, productName: "", quantity: 0, unitCost: "0", notes: "" }],
  }));
  const removeItem = (i: number) => setForm(prev => ({
    ...prev,
    items: prev.items.filter((_, idx) => idx !== i),
  }));
  const updateItem = (i: number, field: string, value: any) => setForm(prev => ({
    ...prev,
    items: prev.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
  }));

  const filtered = adjustments?.filter(a =>
    !search || a.adjustmentNumber.toLowerCase().includes(search.toLowerCase()) || a.reason?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "تعديلات المخزون" : "Stock Adjustments"}</h2>
          <p className="text-muted-foreground">{isAr ? "تسجيل تعديلات المخزون والجرد" : "Record inventory adjustments and stock counts"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{isAr ? "تعديل جديد" : "New Adjustment"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isAr ? "تعديل مخزون جديد" : "New Stock Adjustment"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form as any); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{isAr ? "التاريخ" : "Date"}</Label><Input type="date" value={form.adjustmentDate} onChange={e => setForm({...form, adjustmentDate: e.target.value})} /></div>
                <div><Label>{isAr ? "نوع التعديل" : "Type"}</Label>
                  <Select value={form.adjustmentType} onValueChange={v => setForm({...form, adjustmentType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="addition">{isAr ? "إضافة" : "Addition"}</SelectItem>
                      <SelectItem value="subtraction">{isAr ? "خصم" : "Subtraction"}</SelectItem>
                      <SelectItem value="damage">{isAr ? "تلف" : "Damage"}</SelectItem>
                      <SelectItem value="expiry">{isAr ? "انتهاء صلاحية" : "Expiry"}</SelectItem>
                      <SelectItem value="audit">{isAr ? "جرد" : "Audit"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{isAr ? "المستودع" : "Warehouse"}</Label>
                  <Select value={String(form.warehouseId)} onValueChange={v => setForm({...form, warehouseId: Number(v)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{warehouses?.map(w => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>{isAr ? "السبب" : "Reason"}</Label><Textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder={isAr ? "سبب التعديل..." : "Reason for adjustment..."} /></div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">{isAr ? "الأصناف" : "Items"}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="size-3.5 mr-1" />{isAr ? "إضافة" : "Add"}</Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>#</TableHead>
                        <TableHead>{isAr ? "المنتج" : "Product"}</TableHead>
                        <TableHead className="w-24">{isAr ? "الكمية" : "Qty (+/-)"}</TableHead>
                        <TableHead className="w-24">{isAr ? "تكلفة الوحدة" : "Unit Cost"}</TableHead>
                        <TableHead>{isAr ? "ملاحظات" : "Notes"}</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                          <TableCell>
                            <Select value={String(item.productId)} onValueChange={v => {
                              const product = products?.find(p => p.id === Number(v));
                              updateItem(idx, "productId", Number(v));
                              updateItem(idx, "productName", product?.name || "");
                            }}>
                              <SelectTrigger className="h-8"><SelectValue placeholder={isAr ? "اختر المنتج" : "Select product"} /></SelectTrigger>
                              <SelectContent>{products?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><Input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="h-8 text-sm" /></TableCell>
                          <TableCell><Input type="number" value={item.unitCost} onChange={e => updateItem(idx, "unitCost", e.target.value)} className="h-8 text-sm" /></TableCell>
                          <TableCell><Input value={item.notes} onChange={e => updateItem(idx, "notes", e.target.value)} className="h-8 text-sm" /></TableCell>
                          <TableCell>{form.items.length > 1 && <Button type="button" variant="ghost" size="icon" className="size-7 text-red-500" onClick={() => removeItem(idx)}><XCircle className="size-3.5" /></Button>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>{isAr ? "إنشاء التعديل" : "Create Adjustment"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={isAr ? "بحث..." : "Search..."} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? "رقم التعديل" : "Adj #"}</TableHead>
                <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{isAr ? "النوع" : "Type"}</TableHead>
                <TableHead>{isAr ? "السبب" : "Reason"}</TableHead>
                <TableHead>{isAr ? "الأصناف" : "Items"}</TableHead>
                <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <ArrowUpDown className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isAr ? "لا توجد تعديلات" : "No adjustments found"}</p>
                </TableCell></TableRow>
              ) : filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.adjustmentNumber}</TableCell>
                  <TableCell>{new Date(a.adjustmentDate).toLocaleDateString()}</TableCell>
                  <TableCell><Badge className={typeColors[a.adjustmentType]}>{a.adjustmentType}</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate">{a.reason || "—"}</TableCell>
                  <TableCell>{a.itemCount || 0}</TableCell>
                  <TableCell><Badge className={statusColors[a.status]}>{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
