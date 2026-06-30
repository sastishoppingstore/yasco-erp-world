import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Search, Plus, Users, Star, Phone, Mail, Building2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-700",
  blacklisted: "bg-red-100 text-red-700",
};

export default function SubcontractorManagement() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", nameAr: "", tradeName: "", crNumber: "", vatNumber: "",
    phone: "", email: "", address: "", city: "", specialty: "",
    creditLimit: "", paymentTerms: "30", status: "active",
  });

  const { data: subcontractors, refetch } = trpc.construction.subcontractorList.useQuery(undefined);
  const createMut = trpc.construction.subcontractorCreate.useMutation({
    onSuccess: () => { refetch(); setOpen(false); toast.success(isAr ? "تم إنشاء المقاول" : "Subcontractor created"); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = subcontractors?.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.tradeName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "إدارة مقاولي الباطن" : "Subcontractor Management"}</h2>
          <p className="text-muted-foreground">{isAr ? "إدارة وتقييم مقاولي الباطن" : "Manage and evaluate subcontractors"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{isAr ? "إضافة مقاول" : "Add Subcontractor"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{isAr ? "إضافة مقاول باطن" : "Add Subcontractor"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form as any); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{isAr ? "الاسم (إنجليزي)" : "Name (EN)"}</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><Label>{isAr ? "الاسم (عربي)" : "Name (AR)"}</Label><Input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{isAr ? "الاسم التجاري" : "Trade Name"}</Label><Input value={form.tradeName} onChange={e => setForm({...form, tradeName: e.target.value})} /></div>
                <div><Label>{isAr ? "التخصص" : "Specialty"}</Label><Input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder={isAr ? "سباكة، كهرباء، تكييف..." : "Plumbing, Electrical, HVAC..."} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{isAr ? "رقم السجل التجاري" : "CR Number"}</Label><Input value={form.crNumber} onChange={e => setForm({...form, crNumber: e.target.value})} /></div>
                <div><Label>{isAr ? "الرقم الضريبي" : "VAT Number"}</Label><Input value={form.vatNumber} onChange={e => setForm({...form, vatNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{isAr ? "الهاتف" : "Phone"}</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{isAr ? "العنوان" : "Address"}</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div><Label>{isAr ? "المدينة" : "City"}</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{isAr ? "حد الائتمان" : "Credit Limit"}</Label><Input type="number" value={form.creditLimit} onChange={e => setForm({...form, creditLimit: e.target.value})} /></div>
                <div><Label>{isAr ? "شروط الدفع (أيام)" : "Payment Terms (days)"}</Label><Input type="number" value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createMut.isPending}>{isAr ? "إضافة" : "Add Subcontractor"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={isAr ? "بحث في المقاولين..." : "Search subcontractors..."} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? "الكود" : "Code"}</TableHead>
                <TableHead>{isAr ? "اسم المقاول" : "Name"}</TableHead>
                <TableHead>{isAr ? "التخصص" : "Specialty"}</TableHead>
                <TableHead>{isAr ? "الهاتف" : "Phone"}</TableHead>
                <TableHead className="text-right">{isAr ? "حد الائتمان" : "Credit Limit"}</TableHead>
                <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isAr ? "لا يوجد مقاولين" : "No subcontractors found"}</p>
                </TableCell></TableRow>
              ) : filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.subcontractorCode}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      {s.tradeName && <p className="text-xs text-muted-foreground">{s.tradeName}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{s.specialty || "—"}</TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{s.creditLimit ? Number(s.creditLimit).toLocaleString() : "—"}</TableCell>
                  <TableCell><Badge className={statusColors[s.status] || ""}>{s.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
