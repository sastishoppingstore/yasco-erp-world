import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building2, Mail, Phone, FileText, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language";

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
};

export default function SuppliersPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: suppliers, refetch } = trpc.purchase.supplierList.useQuery(undefined);
  const createSupplier = trpc.purchase.supplierCreate.useMutation({
    onSuccess: () => { refetch(); toast.success(isAr ? "تم إنشاء المورد" : "Supplier created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateSupplier = trpc.purchase.supplierUpdate.useMutation({
    onSuccess: () => { refetch(); toast.success(isAr ? "تم تحديث المورد" : "Supplier updated"); },
    onError: (e) => toast.error(e.message),
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = suppliers?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.vatNumber?.includes(search) ||
    s.crNumber?.includes(search)
  ) || [];

  const set = (key: keyof typeof form, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({...emptyForm});
    setEditingId(null);
  };

  const openEdit = (c: any) => {
    setForm({
      legalNameEn: c.legalNameEn || "",
      legalNameAr: c.legalNameAr || "",
      name: c.name || "",
      nameAr: c.nameAr || "",
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
      bankName: c.bankName || "",
      bankIban: c.bankIban || "",
      bankAccountNumber: c.bankAccountNumber || "",
      creditLimit: String(c.creditLimit || "0"),
      paymentTerms: c.paymentTerms || 30,
      openingBalance: String(c.openingBalance || "0"),
    });
    setEditingId(c.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSupplier.mutate({ id: editingId, ...form });
    } else {
      createSupplier.mutate(form);
    }
    setOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "الموردون" : "Suppliers"}</h2>
          <p className="text-slate-500">{isAr ? "إدارة علاقات الموردين والمشتريات" : "Manage vendor relationships and procurement"}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{isAr ? "إضافة مورد" : "Add Supplier"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? (isAr ? "تعديل المورد" : "Edit Supplier") : (isAr ? "مورد جديد" : "New Supplier")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{isAr ? "الاسم التجاري" : "Trade Name"} *</Label>
                    <Input value={form.name} onChange={e => set("name", e.target.value)} required />
                  </div>
                  <div>
                    <Label>{isAr ? "الاسم التجاري (عربي)" : "Trade Name (Arabic)"}</Label>
                    <Input dir="rtl" value={form.nameAr} onChange={e => set("nameAr", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{isAr ? "الاسم القانوني (إنجليزي)" : "Legal Name (English)"}</Label>
                    <Input value={form.legalNameEn} onChange={e => set("legalNameEn", e.target.value)} />
                  </div>
                  <div>
                    <Label>{isAr ? "الاسم القانوني (عربي)" : "Legal Name (Arabic)"}</Label>
                    <Input dir="rtl" value={form.legalNameAr} onChange={e => set("legalNameAr", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{isAr ? "رقم السجل التجاري (CR)" : "Commercial Registration (CR)"}</Label>
                    <Input value={form.crNumber} onChange={e => set("crNumber", e.target.value)} placeholder="1010000000" />
                  </div>
                  <div>
                    <Label>{isAr ? "الرقم الضريبي / VAT" : "Saudi VAT Registration No. / TIN"}</Label>
                    <div className="relative">
                      <Input
                        value={form.vatNumber}
                        onChange={e => set("vatNumber", e.target.value.replace(/\D/g, "").slice(0, 15))}
                        maxLength={15}
                        placeholder="300000000000003"
                        className={form.vatNumber && form.vatNumber.length !== 15 && form.vatNumber.length > 0 ? "border-amber-400" : ""}
                      />
                      {form.vatNumber && form.vatNumber.length !== 15 && form.vatNumber.length > 0 && (
                        <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    {form.vatNumber && form.vatNumber.length < 15 && form.vatNumber.length > 0 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {isAr ? "يجب أن يتكون الرقم الضريبي من 15 رقمًا" : "VAT number must be 15 digits"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                    <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
                  </div>
                  <div>
                    <Label>{isAr ? "رقم الجوال" : "Phone"}</Label>
                    <Input value={form.phone} onChange={e => set("phone", e.target.value)} />
                  </div>
                  <div>
                    <Label>{isAr ? "واتساب" : "WhatsApp"}</Label>
                    <Input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">{isAr ? "العنوان الوطني" : "National Address"}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                    <div><Label className="text-xs">{isAr ? "رقم المبنى" : "Building No."}</Label><Input value={form.buildingNumber} onChange={e => set("buildingNumber", e.target.value)} /></div>
                    <div><Label className="text-xs">{isAr ? "اسم الشارع" : "Street"}</Label><Input value={form.streetName} onChange={e => set("streetName", e.target.value)} /></div>
                    <div><Label className="text-xs">{isAr ? "الحي" : "District"}</Label><Input value={form.district} onChange={e => set("district", e.target.value)} /></div>
                    <div><Label className="text-xs">{isAr ? "المدينة" : "City"}</Label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div><Label className="text-xs">{isAr ? "الرمز البريدي" : "Postal Code"}</Label><Input value={form.postalCode} onChange={e => set("postalCode", e.target.value)} /></div>
                    <div><Label className="text-xs">{isAr ? "الرقم الإضافي" : "Additional No."}</Label><Input value={form.additionalNumber} onChange={e => set("additionalNumber", e.target.value)} /></div>
                  </div>
                </div>

                <div>
                  <Label>{isAr ? "العنوان الكامل" : "Full Address"}</Label>
                  <Textarea value={form.address} onChange={e => set("address", e.target.value)} rows={2} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{isAr ? "جهة الاتصال" : "Contact Person"}</Label>
                    <Input value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)} />
                  </div>
                  <div>
                    <Label>{isAr ? "المسمى الوظيفي" : "Job Title"}</Label>
                    <Input value={form.contactTitle} onChange={e => set("contactTitle", e.target.value)} />
                  </div>
                </div>

                <div className="border-t pt-3">
                  <Label className="text-sm font-semibold">{isAr ? "المعلومات البنكية" : "Bank Information"}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                    <div><Label className="text-xs">{isAr ? "اسم البنك" : "Bank Name"}</Label><Input value={form.bankName} onChange={e => set("bankName", e.target.value)} /></div>
                    <div><Label className="text-xs">IBAN</Label><Input value={form.bankIban} onChange={e => set("bankIban", e.target.value)} placeholder="SA0000000000000000000000" /></div>
                    <div><Label className="text-xs">{isAr ? "رقم الحساب" : "Account No."}</Label><Input value={form.bankAccountNumber} onChange={e => set("bankAccountNumber", e.target.value)} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>{isAr ? "الحد الائتماني" : "Credit Limit"} (SAR)</Label>
                    <Input type="number" value={form.creditLimit} onChange={e => set("creditLimit", e.target.value)} />
                  </div>
                  <div>
                    <Label>{isAr ? "شروط الدفع (أيام)" : "Payment Terms (days)"}</Label>
                    <Input type="number" value={form.paymentTerms} onChange={e => set("paymentTerms", Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>{isAr ? "الرصيد الافتتاحي" : "Opening Balance"}</Label>
                    <Input type="number" value={form.openingBalance} onChange={e => set("openingBalance", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4" /> {isAr ? "المرفقات" : "Attachments"}
                  </Label>
                  <p className="text-xs text-slate-400 mb-2">{isAr ? "نسخة السجل التجاري، شهادة VAT، العقد" : "CR copy, VAT certificate, contract"}</p>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center text-sm text-slate-400 hover:border-slate-300 cursor-pointer">
                    <FileText className="w-6 h-6 mx-auto mb-1" />
                    {isAr ? "اضغط لرفع الملفات" : "Click to upload documents"}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit">
                  {editingId ? (isAr ? "تحديث" : "Update") : (isAr ? "إنشاء" : "Create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={isAr ? "بحث باسم المورد أو VAT أو CR..." : "Search by name, VAT, or CR..."}
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">{filtered.length} {isAr ? "مورد" : "suppliers"}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? "الرمز" : "Code"}</TableHead>
                  <TableHead>{isAr ? "المورد" : "Supplier"}</TableHead>
                  <TableHead>{isAr ? "VAT/CR" : "VAT/CR"}</TableHead>
                  <TableHead>{isAr ? "جهة الاتصال" : "Contact"}</TableHead>
                  <TableHead>{isAr ? "IBAN" : "IBAN"}</TableHead>
                  <TableHead className="text-right">{isAr ? "الحد الائتماني" : "Credit Limit"}</TableHead>
                  <TableHead className="text-right">{isAr ? "الرصيد" : "Balance"}</TableHead>
                  <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      {isAr ? "لا يوجد موردون. قم بإضافة مورد جديد." : "No suppliers found. Add a new supplier."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openEdit(s)}>
                      <TableCell className="font-mono text-sm">{s.code}</TableCell>
                      <TableCell>
                        <div className="font-medium">{s.name}</div>
                        {s.nameAr && <div className="text-xs text-slate-500" dir="rtl">{s.nameAr}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">{s.vatNumber ? `VAT: ${s.vatNumber}` : "—"}</div>
                        {s.crNumber && <div className="text-xs text-slate-400 font-mono">CR: {s.crNumber}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{s.email || "N/A"}</div>
                        <div className="text-xs flex items-center gap-1 text-slate-500"><Phone className="w-3 h-3" />{s.phone || "N/A"}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.bankIban ? s.bankIban.slice(0, 10) + '...' : "—"}</TableCell>
                      <TableCell className="text-right font-mono">{Number(s.creditLimit).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{Number(s.currentBalance).toLocaleString()}</TableCell>
                      <TableCell>
                        {s.isActive
                          ? <Badge variant="outline" className="text-emerald-600 border-emerald-200">{isAr ? "نشط" : "Active"}</Badge>
                          : <Badge variant="outline" className="text-slate-400">{isAr ? "غير نشط" : "Inactive"}</Badge>
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
