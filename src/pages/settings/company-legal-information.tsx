import { useEffect, useState } from "react";
import { Building2, Save, ShieldCheck, Globe, Stamp, FileText, AlertTriangle, Hash, Banknote, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";

const emptyForm = {
  legalNameEn: "",
  legalNameAr: "",
  tradeNameEn: "",
  tradeNameAr: "",
  vatNumber: "",
  crNumber: "",
  taxRegistrationNumber: "",
  businessActivity: "",
  companyAddress: "",
  buildingNumber: "",
  streetName: "",
  district: "",
  city: "",
  postalCode: "",
  additionalNumber: "",
  country: "Saudi Arabia",
  contactPerson: "",
  phoneNumber: "",
  emailAddress: "",
  website: "",
  companyLogo: "",
  companyStamp: "",
  companySignature: "",
  crExpiryDate: "",
  vatCertExpiryDate: "",
  branchCode: "",
  branchCr: "",
  iban: "",
  bankAccountNumber: "",
  bankName: "",
};

export default function CompanyLegalInformationPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data, refetch } = trpc.zatca.companyLegalGet.useQuery();
  const save = trpc.zatca.companyLegalSave.useMutation({
    onSuccess: () => {
      toast.success(isAr ? "تم حفظ المعلومات القانونية للشركة" : "Company legal information saved");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data) setForm({ ...emptyForm, ...data });
  }, [data]);

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const vatValid = /^3\d{13}3$/.test(form.vatNumber.replace(/\D/g, ""));

  const clearFormats = [
    { label: "Logo", key: "companyLogo" as const },
    { label: "Company Stamp", key: "companyStamp" as const },
    { label: "Signature", key: "companySignature" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "المعلومات القانونية للشركة" : "Company Legal Information"}</h2>
          <p className="text-slate-500">
            {isAr ? "بيانات البائع المستخدمة في فواتير ZATCA ورموز QR و XML والمستندات الضريبية" : "Seller identity used on ZATCA invoices, QR codes, XML, and tax documents."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {form.vatNumber && (
            <Badge variant={vatValid ? "outline" : "destructive"} className={vatValid ? "text-emerald-600 border-emerald-200" : ""}>
              {vatValid ? (isAr ? "رقم ضريبي صحيح" : "Valid VAT No.") : (isAr ? "رقم ضريبي غير صحيح" : "Invalid VAT Format")}
            </Badge>
          )}
          <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
            <Save className="mr-2 h-4 w-4" /> {isAr ? "حفظ الملف القانوني" : "Save Legal Profile"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="entity" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="entity"><Building2 className="w-4 h-4 mr-1" />{isAr ? "الكيان القانوني" : "Legal Entity"}</TabsTrigger>
          <TabsTrigger value="address"><Globe className="w-4 h-4 mr-1" />{isAr ? "العنوان" : "Address"}</TabsTrigger>
          <TabsTrigger value="branding"><Stamp className="w-4 h-4 mr-1" />{isAr ? "العلامة التجارية" : "Branding"}</TabsTrigger>
          <TabsTrigger value="bank"><Banknote className="w-4 h-4 mr-1" />{isAr ? "البنك" : "Bank"}</TabsTrigger>
          <TabsTrigger value="branch"><Hash className="w-4 h-4 mr-1" />{isAr ? "الفرع" : "Branch"}</TabsTrigger>
        </TabsList>

        <TabsContent value="entity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> {isAr ? "الكيان القانوني" : "Legal Entity"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{isAr ? "الاسم القانوني (إنجليزي)" : "Legal Name (English)"} *</Label>
                <Input value={form.legalNameEn} onChange={(e) => setField("legalNameEn", e.target.value)} />
              </div>
              <div>
                <Label>{isAr ? "الاسم القانوني (عربي)" : "Legal Name (Arabic)"}</Label>
                <Input dir="rtl" value={form.legalNameAr} onChange={(e) => setField("legalNameAr", e.target.value)} />
              </div>
              <div>
                <Label>{isAr ? "الاسم التجاري (إنجليزي)" : "Trade Name (English)"}</Label>
                <Input value={form.tradeNameEn} onChange={(e) => setField("tradeNameEn", e.target.value)} />
              </div>
              <div>
                <Label>{isAr ? "الاسم التجاري (عربي)" : "Trade Name (Arabic)"}</Label>
                <Input dir="rtl" value={form.tradeNameAr} onChange={(e) => setField("tradeNameAr", e.target.value)} />
              </div>
              <div className="relative">
                <Label>{isAr ? "الرقم الضريبي / VAT (15 رقمًا)" : "VAT Number (15 digits)"} <span className="text-red-500">*</span></Label>
                <Input
                  value={form.vatNumber}
                  maxLength={15}
                  placeholder="300000000000003"
                  onChange={(e) => setField("vatNumber", e.target.value.replace(/\D/g, ""))}
                  className={`${form.vatNumber && !vatValid ? "border-red-400 pr-8" : ""}`}
                />
                {form.vatNumber && !vatValid && (
                  <AlertTriangle className="absolute right-2 bottom-2.5 w-4 h-4 text-red-500" />
                )}
                {form.vatNumber && !vatValid && (
                  <p className="text-xs text-red-500 mt-1">{isAr ? "يجب أن يبدأ بـ 3 وينتهي بـ 3 ويتكون من 15 رقمًا" : "Must start with 3, end with 3, and be 15 digits"}</p>
                )}
              </div>
              <div>
                <Label>{isAr ? "رقم السجل التجاري (CR)" : "Commercial Registration (CR)"}</Label>
                <Input value={form.crNumber} onChange={(e) => setField("crNumber", e.target.value)} placeholder="1010000000" />
              </div>
              <div>
                <Label>{isAr ? "رقم التسجيل الضريبي" : "Tax Registration Number"}</Label>
                <Input value={form.taxRegistrationNumber} onChange={(e) => setField("taxRegistrationNumber", e.target.value)} />
              </div>
              <div>
                <Label>{isAr ? "النشاط التجاري" : "Business Activity"}</Label>
                <Input value={form.businessActivity} onChange={(e) => setField("businessActivity", e.target.value)} />
              </div>
              <div>
                <Label>{isAr ? "تاريخ انتهاء السجل التجاري" : "CR Expiry Date"}</Label>
                <Input type="date" value={form.crExpiryDate} onChange={(e) => setField("crExpiryDate", e.target.value)} />
              </div>
              <div>
                <Label>{isAr ? "تاريخ انتهاء شهادة VAT" : "VAT Certificate Expiry"}</Label>
                <Input type="date" value={form.vatCertExpiryDate} onChange={(e) => setField("vatCertExpiryDate", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> {isAr ? "العنوان الوطني" : "National Address"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>{isAr ? "العنوان الكامل" : "Full Address"}</Label>
                <Textarea value={form.companyAddress} onChange={(e) => setField("companyAddress", e.target.value)} rows={2} />
              </div>
              <div><Label>{isAr ? "رقم المبنى" : "Building Number"}</Label><Input value={form.buildingNumber} onChange={(e) => setField("buildingNumber", e.target.value)} /></div>
              <div><Label>{isAr ? "اسم الشارع" : "Street Name"}</Label><Input value={form.streetName} onChange={(e) => setField("streetName", e.target.value)} /></div>
              <div><Label>{isAr ? "الحي" : "District"}</Label><Input value={form.district} onChange={(e) => setField("district", e.target.value)} /></div>
              <div><Label>{isAr ? "المدينة" : "City"}</Label><Input value={form.city} onChange={(e) => setField("city", e.target.value)} /></div>
              <div><Label>{isAr ? "الرمز البريدي" : "Postal Code"}</Label><Input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} /></div>
              <div><Label>{isAr ? "الرقم الإضافي" : "Additional Number"}</Label><Input value={form.additionalNumber} onChange={(e) => setField("additionalNumber", e.target.value)} /></div>
              <div><Label>{isAr ? "الدولة" : "Country"}</Label><Input value={form.country} onChange={(e) => setField("country", e.target.value)} /></div>
              <Separator className="md:col-span-2" />
              <div><Label>{isAr ? "رقم الجوال" : "Phone Number"}</Label><Input value={form.phoneNumber} onChange={(e) => setField("phoneNumber", e.target.value)} /></div>
              <div><Label>{isAr ? "البريد الإلكتروني" : "Email Address"}</Label><Input type="email" value={form.emailAddress} onChange={(e) => setField("emailAddress", e.target.value)} /></div>
              <div><Label>{isAr ? "الموقع الإلكتروني" : "Website"}</Label><Input value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://example.com" /></div>
              <div><Label>{isAr ? "جهة الاتصال" : "Contact Person"}</Label><Input value={form.contactPerson} onChange={(e) => setField("contactPerson", e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Stamp className="h-5 w-5" /> {isAr ? "العلامة التجارية والشعار" : "Branding & Logo"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              {clearFormats.map(({ label, key }) => (
                <div key={key}>
                  <Label className="mb-2 block">{isAr ? label : label}</Label>
                  {form[key] && (
                    <div className="mb-2 w-24 h-24 rounded-lg border overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img src={form[key]} alt={label} className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <Input
                    value={form[key]}
                    placeholder={isAr ? "رابط الصورة أو base64" : "Image URL or base64"}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr ? "استخدم رابط URL أو بيانات base64" : "Use URL or base64 data"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" /> {isAr ? "المعلومات البنكية" : "Bank Information"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>{isAr ? "اسم البنك" : "Bank Name"}</Label>
                <Input value={form.bankName} onChange={(e) => setField("bankName", e.target.value)} placeholder={isAr ? "البنك الأهلي السعودي" : "National Commercial Bank"} />
              </div>
              <div>
                <Label>IBAN</Label>
                <Input value={form.iban} onChange={(e) => setField("iban", e.target.value.toUpperCase())} placeholder="SA0000000000000000000000" maxLength={24} />
              </div>
              <div>
                <Label>{isAr ? "رقم الحساب" : "Account Number"}</Label>
                <Input value={form.bankAccountNumber} onChange={(e) => setField("bankAccountNumber", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Hash className="h-5 w-5" /> {isAr ? "معلومات الفرع" : "Branch Information"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{isAr ? "رمز الفرع" : "Branch Code"}</Label>
                <Input value={form.branchCode} onChange={(e) => setField("branchCode", e.target.value)} placeholder="001" />
                <p className="text-xs text-slate-400 mt-1">{isAr ? "يستخدم في ترقيم الفواتير لكل فرع" : "Used for per-branch invoice numbering"}</p>
              </div>
              <div>
                <Label>{isAr ? "السجل التجاري للفرع" : "Branch CR"}</Label>
                <Input value={form.branchCr} onChange={(e) => setField("branchCr", e.target.value)} />
                <p className="text-xs text-slate-400 mt-1">{isAr ? "إذا كان للفرع سجل تجاري مستقل" : "If branch has independent CR"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
