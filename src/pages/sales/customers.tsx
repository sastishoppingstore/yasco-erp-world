import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Building2, FileText, Upload, AlertTriangle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language";

type CustomerType = "b2b" | "b2c" | "government" | "cash_customer";

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
};

export default function CustomersPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: customers, refetch } = trpc.sales.customerList.useQuery(undefined);
  const createCustomer = trpc.sales.customerCreate.useMutation({
    onSuccess: () => { refetch(); toast.success(isAr ? "تم إنشاء العميل" : "Customer created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateCustomer = trpc.sales.customerUpdate.useMutation({
    onSuccess: () => { refetch(); toast.success(isAr ? "تم تحديث العميل" : "Customer updated"); },
    onError: (e) => toast.error(e.message),
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = customers?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.vatNumber?.includes(search) ||
    c.crNumber?.includes(search)
  ) || [];

  const set = (key: keyof typeof form, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

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
    setOpen(false);
    resetForm();
  };

  const CustTypeBadge = ({ type }: { type: string }) => {
    const map: Record<string, { label: string; color: string }> = {
      b2b: { label: "B2B", color: "bg-blue-100 text-blue-700" },
      b2c: { label: "B2C", color: "bg-green-100 text-green-700" },
      government: { label: "Government", color: "bg-purple-100 text-purple-700" },
      cash_customer: { label: "Cash", color: "bg-amber-100 text-amber-700" },
    };
    const m = map[type] || map.b2b;
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.color}`}>{m.label}</span>;
  };

  const isB2B = form.customerType === "b2b";
  const vatHelper = isB2B
    ? (isAr ? "مطلوب للفواتير الضريبية القياسية" : "Required for standard tax invoices")
    : (isAr ? "اختياري للفواتير المبسطة" : "Optional for simplified invoices");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "العملاء" : "Customers"}</h2>
          <p className="text-slate-500">{isAr ? "إدارة علاقات العملاء والأرصدة" : "Manage customer relationships and balances"}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />{isAr ? "إضافة عميل" : "Add Customer"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? (isAr ? "تعديل العميل" : "Edit Customer") : (isAr ? "عميل جديد" : "New Customer")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <Label className="text-sm font-semibold">{isAr ? "نوع العميل" : "Customer Type"}</Label>
                  <Select value={form.customerType} onValueChange={(v: CustomerType) => set("customerType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2b">{isAr ? "شركة (B2B)" : "B2B Company"}</SelectItem>
                      <SelectItem value="b2c">{isAr ? "فرد (B2C)" : "B2C Individual"}</SelectItem>
                      <SelectItem value="government">{isAr ? "حكومي" : "Government"}</SelectItem>
                      <SelectItem value="cash_customer">{isAr ? "عميل نقدي" : "Cash Customer"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"} *</Label>
                    <Input value={form.name} onChange={e => set("name", e.target.value)} required />
                  </div>
                  <div>
                    <Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                    <Input dir="rtl" value={form.nameAr} onChange={e => set("nameAr", e.target.value)} />
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
                        className={isB2B && form.vatNumber && form.vatNumber.length !== 15 ? "border-amber-400" : ""}
                      />
                      {isB2B && form.vatNumber && form.vatNumber.length !== 15 && (
                        <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{vatHelper}</p>
                    {isB2B && form.vatNumber.length < 15 && form.vatNumber.length > 0 && (
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
                    <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+9665XXXXXXXX" />
                  </div>
                  <div>
                    <Label>{isAr ? "واتساب" : "WhatsApp"}</Label>
                    <Input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+9665XXXXXXXX" />
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
                ref={searchRef}
                placeholder={isAr ? "بحث بالاسم أو البريد أو VAT أو CR..." : "Search by name, email, VAT, or CR..."}
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">
              {filtered.length} {isAr ? "عميل" : "customers"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? "الرمز" : "Code"}</TableHead>
                  <TableHead>{isAr ? "العميل" : "Customer"}</TableHead>
                  <TableHead>{isAr ? "النوع" : "Type"}</TableHead>
                  <TableHead>{isAr ? "VAT/CR" : "VAT/CR"}</TableHead>
                  <TableHead>{isAr ? "جهة الاتصال" : "Contact"}</TableHead>
                  <TableHead className="text-right">{isAr ? "الحد الائتماني" : "Credit Limit"}</TableHead>
                  <TableHead className="text-right">{isAr ? "الرصيد" : "Balance"}</TableHead>
                  <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-right">{isAr ? "إجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                      {isAr ? "لا يوجد عملاء. قم بإضافة عميل جديد." : "No customers found. Add a new customer."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(c => (
                    <TableRow key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openEdit(c)}>
                      <TableCell className="font-mono text-sm">{c.code}</TableCell>
                      <TableCell>
                        <div className="font-medium">{c.name}</div>
                        {c.nameAr && <div className="text-xs text-slate-500" dir="rtl">{c.nameAr}</div>}
                      </TableCell>
                      <TableCell><CustTypeBadge type={c.customerType} /></TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">{c.vatNumber ? `VAT: ${c.vatNumber}` : "—"}</div>
                        {c.crNumber && <div className="text-xs text-slate-400 font-mono">CR: {c.crNumber}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{c.email || "N/A"}</div>
                        <div className="text-xs flex items-center gap-1 text-slate-500"><Phone className="w-3 h-3" />{c.phone || "N/A"}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{Number(c.creditLimit).toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-mono font-semibold ${Number(c.currentBalance) > 0 ? "text-amber-600" : ""}`}>
                        {Number(c.currentBalance).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {c.isActive
                          ? <Badge variant="outline" className="text-emerald-600 border-emerald-200">{isAr ? "نشط" : "Active"}</Badge>
                          : <Badge variant="outline" className="text-slate-400">{isAr ? "غير نشط" : "Inactive"}</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(c); }}>
                          <UserCheck className="w-4 h-4" />
                        </Button>
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
