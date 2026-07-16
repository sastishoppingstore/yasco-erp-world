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
import { Search, Plus, FileText, CheckCircle2, XCircle, Clock, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  converted: "bg-blue-100 text-blue-700",
};

export default function PurchaseRequisitions() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    requestDate: new Date().toISOString().slice(0, 10),
    requiredDate: "",
    priority: "medium",
    department: "",
    justification: "",
    items: [{ description: "", quantity: 1, unit: "PCS", estimatedPrice: "" }] as { description: string; quantity: number; unit: string; estimatedPrice: string }[],
  });

  const { data: requisitions, refetch } = trpc.purchase.requisitionList.useQuery(undefined);
  const { data: suppliers } = trpc.purchase.supplierList.useQuery(undefined);
  const createMut = trpc.purchase.requisitionCreate.useMutation({
    onSuccess: () => { refetch(); setOpen(false); toast.success(isAr ? "تم إنشاء طلب الشراء" : "Requisition created"); },
    onError: (e) => toast.error(e.message),
  });
  const approveMut = trpc.purchase.requisitionApprove.useMutation({
    onSuccess: () => { refetch(); toast.success(isAr ? "تم الموافقة" : "Requisition approved"); },
    onError: (e) => toast.error(e.message),
  });
  const rejectMut = trpc.purchase.requisitionReject.useMutation({
    onSuccess: () => { refetch(); toast.success(isAr ? "تم الرفض" : "Requisition rejected"); },
    onError: (e) => toast.error(e.message),
  });

  const addItem = () => setForm(prev => ({
    ...prev,
    items: [...prev.items, { description: "", quantity: 1, unit: "PCS", estimatedPrice: "" }],
  }));
  const removeItem = (i: number) => setForm(prev => ({
    ...prev,
    items: prev.items.filter((_, idx) => idx !== i),
  }));
  const updateItem = (i: number, field: string, value: any) => setForm(prev => ({
    ...prev,
    items: prev.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
  }));

  const filtered = requisitions?.filter(r =>
    !search || r.requisitionNumber.toLowerCase().includes(search.toLowerCase()) || r.department?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "طلبات الشراء" : "Purchase Requisitions"}</h2>
          <p className="text-muted-foreground">{isAr ? "إدارة طلبات الشراء والموافقات" : "Manage purchase requests and approvals"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{isAr ? "طلب جديد" : "New Requisition"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isAr ? "طلب شراء جديد" : "New Purchase Requisition"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form as any); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{isAr ? "تاريخ الطلب" : "Request Date"}</Label><Input type="date" value={form.requestDate} onChange={e => setForm({...form, requestDate: e.target.value})} /></div>
                <div><Label>{isAr ? "تاريخ الحاجة" : "Required By"}</Label><Input type="date" value={form.requiredDate} onChange={e => setForm({...form, requiredDate: e.target.value})} /></div>
                <div><Label>{isAr ? "الأولوية" : "Priority"}</Label>
                  <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{isAr ? "منخفضة" : "Low"}</SelectItem>
                      <SelectItem value="medium">{isAr ? "متوسطة" : "Medium"}</SelectItem>
                      <SelectItem value="high">{isAr ? "عالية" : "High"}</SelectItem>
                      <SelectItem value="urgent">{isAr ? "عاجلة" : "Urgent"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>{isAr ? "القسم" : "Department"}</Label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder={isAr ? "قسم المشتريات" : "Procurement Department"} /></div>
              <div><Label>{isAr ? "التبرير" : "Justification"}</Label><Textarea value={form.justification} onChange={e => setForm({...form, justification: e.target.value})} placeholder={isAr ? "سبب الطلب..." : "Reason for request..."} /></div>

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
                        <TableHead>{isAr ? "الوصف" : "Description"}</TableHead>
                        <TableHead className="w-20">{isAr ? "الكمية" : "Qty"}</TableHead>
                        <TableHead className="w-20">{isAr ? "الوحدة" : "Unit"}</TableHead>
                        <TableHead className="w-28">{isAr ? "السعر المقدر" : "Est. Price"}</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                          <TableCell><Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} className="h-8 text-sm" /></TableCell>
                          <TableCell><Input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="h-8 text-sm" min="1" /></TableCell>
                          <TableCell><Input value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="h-8 text-sm" /></TableCell>
                          <TableCell><Input type="number" value={item.estimatedPrice} onChange={e => updateItem(idx, "estimatedPrice", e.target.value)} className="h-8 text-sm" /></TableCell>
                          <TableCell>{form.items.length > 1 && <Button type="button" variant="ghost" size="icon" className="size-7 text-red-500" onClick={() => removeItem(idx)}><Trash2 className="size-3.5" /></Button>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>{isAr ? "إرسال الطلب" : "Submit Requisition"}</Button>
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
                <TableHead>{isAr ? "رقم الطلب" : "Req #"}</TableHead>
                <TableHead>{isAr ? "القسم" : "Department"}</TableHead>
                <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{isAr ? "الحاجة بحلول" : "Required By"}</TableHead>
                <TableHead>{isAr ? "الأولوية" : "Priority"}</TableHead>
                <TableHead>{isAr ? "الأصناف" : "Items"}</TableHead>
                <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                <TableHead className="text-right">{isAr ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isAr ? "لا توجد طلبات" : "No requisitions found"}</p>
                </TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.requisitionNumber}</TableCell>
                  <TableCell>{r.department || "—"}</TableCell>
                  <TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>{r.requiredDate ? new Date(r.requiredDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell><Badge variant={r.priority === "urgent" ? "destructive" : r.priority === "high" ? "default" : "secondary"}>{r.priority}</Badge></TableCell>
                  <TableCell>{r.itemCount || 0}</TableCell>
                  <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {r.status === "pending" && (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => approveMut.mutate({ id: r.id })}><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => rejectMut.mutate({ id: r.id })}><XCircle className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
