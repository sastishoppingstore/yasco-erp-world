import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import {
  Building2, Palette, CreditCard, Mail, MessageSquare, Phone,
  Stamp, PenTool, Upload, Save, Loader2, Hash, Globe, Shield,
  FileText, Printer, CheckCircle2, Image, Eye, Copy, Info,
} from "lucide-react";

export default function CompanyProfilePage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: settings, refetch } = trpc.settings.companySettingsGet.useQuery();
  const updateSettings = trpc.settings.companySettingsUpdate.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState({
    companyName: "", companyNameAr: "", tradeName: "", email: "", phone: "", mobile: "", website: "",
    address: "", city: "", country: "Saudi Arabia", zipCode: "",
    taxNumber: "", crNumber: "", vatRate: "15", defaultCurrency: "SAR", invoiceTerms: "",
    logo: "", theme: "light", primaryColor: "#1E3A5F", secondaryColor: "#64748b",
    invoicePrefix: "INV-", quotationPrefix: "QT-", purchaseOrderPrefix: "PO-", salesOrderPrefix: "SO-",
    invoiceFooterText: "", invoiceFooterTextAr: "",
    zatcaEnabled: true, zatcaSandbox: true,
  });

  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [invoiceHeaderColor, setInvoiceHeaderColor] = useState("#1E3A5F");
  const [printLogo, setPrintLogo] = useState(true);
  const [printQr, setPrintQr] = useState(true);
  const [printStamp, setPrintStamp] = useState(true);
  const [printSignature, setPrintSignature] = useState(true);
  const [paperSize, setPaperSize] = useState("A4");
  const [printerName, setPrinterName] = useState("");
  const [copiesCount, setCopiesCount] = useState("2");
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smsProvider, setSmsProvider] = useState("none");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [whatsappApiKey, setWhatsappApiKey] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");
  const [deliveryNotePrefix, setDeliveryNotePrefix] = useState("DN-");
  const [receiptPrefix, setReceiptPrefix] = useState("REC-");
  const [creditNotePrefix, setCreditNotePrefix] = useState("CN-");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(prev => ({
        ...prev,
        companyName: settings.companyName ?? "",
        companyNameAr: settings.companyNameAr ?? "",
        tradeName: settings.tradeName ?? "",
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        mobile: settings.mobile ?? "",
        website: settings.website ?? "",
        address: settings.address ?? "",
        city: settings.city ?? "",
        country: settings.country ?? "Saudi Arabia",
        zipCode: settings.zipCode ?? "",
        taxNumber: settings.taxNumber ?? "",
        crNumber: settings.crNumber ?? "",
        vatRate: settings.vatRate ?? "15",
        defaultCurrency: settings.defaultCurrency ?? "SAR",
        invoiceTerms: settings.invoiceTerms ?? "",
        logo: settings.logo ?? "",
        theme: settings.theme ?? "light",
        primaryColor: settings.primaryColor ?? "#1E3A5F",
        secondaryColor: settings.secondaryColor ?? "#64748b",
        invoicePrefix: settings.invoicePrefix ?? "INV-",
        quotationPrefix: settings.quotationPrefix ?? "QT-",
        purchaseOrderPrefix: settings.purchaseOrderPrefix ?? "PO-",
        salesOrderPrefix: settings.salesOrderPrefix ?? "SO-",
        invoiceFooterText: settings.invoiceFooterText ?? "",
        invoiceFooterTextAr: settings.invoiceFooterTextAr ?? "",
        zatcaEnabled: settings.zatcaEnabled ?? true,
        zatcaSandbox: settings.zatcaSandbox ?? true,
      }));
      setInvoiceHeaderColor(settings.primaryColor ?? "#1E3A5F");
      setBankName(settings.bankName ?? "");
      setBankAccountName(settings.bankAccountName ?? "");
      setBankIban(settings.bankIban ?? "");
      setBankAccountNumber(settings.bankAccountNumber ?? "");
      setPaperSize(settings.paperSize ?? "A4");
      setPrinterName(settings.printerName ?? "");
      setCopiesCount(String(settings.copiesCount ?? 2));
      setPrintLogo(settings.printLogo ?? true);
      setPrintQr(settings.printQr ?? true);
      setPrintStamp(settings.printStamp ?? true);
      setPrintSignature(settings.printSignature ?? true);
      setSmtpServer(settings.smtpServer ?? "smtp.gmail.com");
      setSmtpPort(String(settings.smtpPort ?? 587));
      setSmtpEmail(settings.smtpEmail ?? "");
      setSmtpPassword(settings.smtpPassword ?? "");
      setSmsProvider(settings.smsProvider ?? "none");
      setSmsApiKey(settings.smsApiKey ?? "");
      setWhatsappApiKey(settings.whatsappApiKey ?? "");
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      ...form,
      primaryColor: invoiceHeaderColor,
      bankName,
      bankAccountName,
      bankIban,
      bankAccountNumber,
      paperSize,
      printerName,
      copiesCount: parseInt(copiesCount) || 1,
      printLogo,
      printQr,
      printStamp,
      printSignature,
      smtpServer,
      smtpPort: parseInt(smtpPort) || 587,
      smtpEmail,
      smtpPassword,
      smsProvider,
      smsApiKey,
      whatsappApiKey,
      invoiceFooterText: form.invoiceFooterText,
      invoiceFooterTextAr: form.invoiceFooterTextAr,
    } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isAr ? "ملف الشركة" : "Company Profile"}</h2>
          <p className="text-slate-500">{isAr ? "إدارة العلامة التجارية والإعدادات" : "Manage branding and settings"}</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          {saved ? (isAr ? "تم الحفظ" : "Saved") : (isAr ? "حفظ" : "Save")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="branding"><Palette className="size-3.5 mr-1" />{isAr ? "العلامة التجارية" : "Branding"}</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="size-3.5 mr-1" />{isAr ? "معاينة" : "Preview"}</TabsTrigger>
          <TabsTrigger value="print"><Printer className="size-3.5 mr-1" />{isAr ? "الطباعة" : "Print"}</TabsTrigger>
          <TabsTrigger value="bank"><CreditCard className="size-3.5 mr-1" />{isAr ? "البنك" : "Bank"}</TabsTrigger>
          <TabsTrigger value="email"><Mail className="size-3.5 mr-1" />{isAr ? "البريد" : "Email"}</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="size-3.5 mr-1" />{isAr ? "رسائل" : "SMS"}</TabsTrigger>
          <TabsTrigger value="numbering"><Hash className="size-3.5 mr-1" />{isAr ? "الترقيم" : "Numbering"}</TabsTrigger>
        </TabsList>

        {/* BRANDING TAB */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "الهوية البصرية" : "Visual Identity"}</CardTitle>
              <CardDescription>{isAr ? "تظهر على جميع الفواتير والمستندات" : "Appears on all invoices and documents"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "اسم الشركة (إنجليزي)" : "Company Name (English)"}</Label>
                  <Input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "اسم الشركة (عربي)" : "Company Name (Arabic)"}</Label>
                  <Input value={form.companyNameAr} onChange={e => setForm({...form, companyNameAr: e.target.value})} dir="rtl" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>{isAr ? "شعار الشركة" : "Company Logo"}</Label>
                <div className="flex items-center gap-4">
                  {form.logo ? (
                    <img src={form.logo} alt="Logo" className="h-16 w-16 object-contain border rounded-lg p-1" />
                  ) : (
                    <div className="h-16 w-16 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-400">
                      <Image className="size-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} placeholder="Logo URL or base64" />
                    <p className="text-xs text-slate-500 mt-1">{isAr ? "الصق رابط الشعار أو استخدم base64" : "Paste logo URL or use base64"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "توقيع المدير" : "Manager Signature"}</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("sig-upload")?.click()}>
                      <PenTool className="size-3.5 mr-1" /> {isAr ? "رفع" : "Upload"}
                    </Button>
                    <input id="sig-upload" type="file" accept="image/*" className="hidden" onChange={e => setSignatureFile(e.target.files?.[0] || null)} />
                    {signatureFile && <span className="text-xs text-green-600"><CheckCircle2 className="size-3.5 inline mr-1" />{signatureFile.name}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "ختم الشركة" : "Company Stamp"}</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("stamp-upload")?.click()}>
                      <Stamp className="size-3.5 mr-1" /> {isAr ? "رفع" : "Upload"}
                    </Button>
                    <input id="stamp-upload" type="file" accept="image/*" className="hidden" onChange={e => setStampFile(e.target.files?.[0] || null)} />
                    {stampFile && <span className="text-xs text-green-600"><CheckCircle2 className="size-3.5 inline mr-1" />{stampFile.name}</span>}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>{isAr ? "لون رأس الفاتورة" : "Invoice Header Color"}</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={invoiceHeaderColor} onChange={e => setInvoiceHeaderColor(e.target.value)} className="w-12 h-10 p-1 rounded border" />
                  <span className="text-sm text-muted-foreground">{invoiceHeaderColor}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "تذييل الفاتورة (إنجليزي)" : "Invoice Footer (English)"}</Label>
                  <Input value={form.invoiceFooterText || ""} onChange={e => setForm({...form, invoiceFooterText: e.target.value})} placeholder="Thank you for your business!" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "تذييل الفاتورة (عربي)" : "Invoice Footer (Arabic)"}</Label>
                  <Input value={form.invoiceFooterTextAr || ""} onChange={e => setForm({...form, invoiceFooterTextAr: e.target.value})} placeholder="شكراً لتعاملكم معنا" dir="rtl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="size-4" />
                {isAr ? "معاينة الفاتورة" : "Invoice Preview"}
              </CardTitle>
              <CardDescription>{isAr ? "كيف ستبدو فاتورتك مع الإعدادات الحالية" : "How your invoice will look with current settings"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Invoice Header Preview */}
                <div style={{ background: `linear-gradient(135deg, ${invoiceHeaderColor}, ${invoiceHeaderColor}dd)`, color: "white", padding: "16px 20px" }}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {form.logo ? (
                        <img src={form.logo} alt="Logo" className="h-12 w-12 object-contain rounded-lg bg-white p-1" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
                          {form.companyName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-base">{form.companyName || "Company Name"}</p>
                        {form.companyNameAr && <p className="text-sm opacity-90" dir="rtl">{form.companyNameAr}</p>}
                        <p className="text-xs opacity-75 mt-0.5">
                          {form.address && `${form.address}, `}
                          {form.city && `${form.city}, `}
                          {form.country}
                        </p>
                        <p className="text-xs opacity-75">
                          {form.phone && `Tel: ${form.phone}`}
                          {form.email && ` | ${form.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold tracking-wide">{isAr ? "فاتورة" : "INVOICE"}</p>
                      <p className="text-xs opacity-80 mt-1">{form.invoicePrefix}1001</p>
                      {form.zatcaEnabled && (
                        <Badge className="mt-1 bg-white/20 text-white border-white/30 text-[10px]">ZATCA</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Meta */}
                <div className="flex justify-between p-4 bg-slate-50 border-b text-xs">
                  <div>
                    <p className="text-slate-500">{isAr ? "رقم الفاتورة" : "Invoice #"}</p>
                    <p className="font-semibold">{form.invoicePrefix}1001</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{isAr ? "التاريخ" : "Date"}</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{isAr ? "الحالة" : "Status"}</p>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Draft</Badge>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: invoiceHeaderColor }} className="text-white">
                        <th className="p-2 text-left rounded-tl">#</th>
                        <th className="p-2 text-left">{isAr ? "الوصف" : "Description"}</th>
                        <th className="p-2 text-center">{isAr ? "الكمية" : "Qty"}</th>
                        <th className="p-2 text-right">{isAr ? "السعر" : "Price"}</th>
                        <th className="p-2 text-right rounded-tr">{isAr ? "الإجمالي" : "Total"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">1</td>
                        <td className="p-2">{isAr ? "مثال على صنف" : "Sample Item"}</td>
                        <td className="p-2 text-center">10</td>
                        <td className="p-2 text-right">100.00</td>
                        <td className="p-2 text-right font-semibold">1,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Preview */}
                <div className="flex justify-end p-4 border-t">
                  <div className="w-48 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">{isAr ? "المجموع الفرعي" : "Subtotal"}</span><span>1,000.00 SAR</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">{isAr ? "ضريبة القيمة المضافة" : "VAT (15%)"}</span><span>150.00 SAR</span></div>
                    <div className="flex justify-between font-bold text-sm border-t pt-1" style={{ color: invoiceHeaderColor }}>
                      <span>{isAr ? "الإجمالي" : "TOTAL"}</span><span>1,150.00 SAR</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t text-center text-[10px] text-slate-500">
                  {form.invoiceFooterText || "Thank you for your business!"}
                  {form.invoiceFooterTextAr && <div dir="rtl">{form.invoiceFooterTextAr}</div>}
                  {form.bankName && <div className="mt-1">{isAr ? "البنك:" : "Bank:"} {form.bankName} | IBAN: {form.bankIban}</div>}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Info className="size-3.5" />
                {isAr ? "هذه معاينة تقريبية. التنسيق الفعلي قد يختلف حسب إعدادات الطباعة." : "This is an approximate preview. Actual formatting may vary based on print settings."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRINT TAB */}
        <TabsContent value="print" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "إعدادات الطباعة" : "Print Settings"}</CardTitle>
              <CardDescription>{isAr ? "تكوين الطابعة وحجم الورق" : "Configure printer and paper"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "حجم الورق" : "Paper Size"}</Label>
                  <Select value={paperSize} onValueChange={setPaperSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210 x 297mm)</SelectItem>
                      <SelectItem value="A5">A5 (148 x 210mm)</SelectItem>
                      <SelectItem value="THERMAL_80">Thermal 80mm</SelectItem>
                      <SelectItem value="THERMAL_58">Thermal 58mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "الطابعة" : "Printer"}</Label>
                  <Input value={printerName} onChange={e => setPrinterName(e.target.value)} placeholder="EPSON TM-T88VI" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "عدد النسخ" : "Copies"}</Label>
                  <Input value={copiesCount} onChange={e => setCopiesCount(e.target.value)} type="number" min="1" max="5" />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>{isAr ? "عناصر الفاتورة" : "Invoice Elements"}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: isAr ? "طباعة الشعار" : "Print Logo", value: printLogo, onChange: setPrintLogo },
                    { label: isAr ? "طباعة رمز QR (ZATCA)" : "Print QR Code (ZATCA)", value: printQr, onChange: setPrintQr },
                    { label: isAr ? "طباعة الختم" : "Print Stamp", value: printStamp, onChange: setPrintStamp },
                    { label: isAr ? "طباعة التوقيع" : "Print Signature", value: printSignature, onChange: setPrintSignature },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="text-sm">{item.label}</Label>
                      <Switch checked={item.value} onCheckedChange={item.onChange} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BANK TAB */}
        <TabsContent value="bank" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "البيانات البنكية" : "Bank Details"}</CardTitle>
              <CardDescription>{isAr ? "تظهر على الفواتير ومستندات الدفع" : "Shown on invoices and payment documents"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isAr ? "اسم البنك" : "Bank Name"}</Label>
                <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder={isAr ? "البنك الأهلي السعودي" : "Saudi National Bank"} />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "اسم الحساب" : "Account Name"}</Label>
                <Input value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder={form.companyName || "Company Name"} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IBAN</Label>
                  <Input value={bankIban} onChange={e => setBankIban(e.target.value)} placeholder="SA03 8000 0000 6080 1016 7519" className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "رقم الحساب" : "Account Number"}</Label>
                  <Input value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="608010167519" className="font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMAIL TAB */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "إعدادات البريد الإلكتروني" : "Email Settings"}</CardTitle>
              <CardDescription>{isAr ? "إرسال الفواتير عبر البريد" : "Send invoices via email"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Server</Label>
                  <Input value={smtpServer} onChange={e => setSmtpServer(e.target.value)} placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "البريد الإلكتروني" : "Email Address"}</Label>
                <Input value={smtpEmail} onChange={e => setSmtpEmail(e.target.value)} type="email" placeholder="invoices@company.sa" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "كلمة المرور" : "Password"}</Label>
                <Input value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} type="password" placeholder="••••••••" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS / WHATSAPP TAB */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "الرسائل القصيرة" : "SMS Settings"}</CardTitle>
              <CardDescription>{isAr ? "إرسال الفواتير عبر SMS" : "Send invoices via SMS"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isAr ? "مزود الخدمة" : "SMS Provider"}</Label>
                <Select value={smsProvider} onValueChange={setSmsProvider}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{isAr ? "غير مفعل" : "None"}</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="smsgateway">SMS Gateway</SelectItem>
                    <SelectItem value="unifonic">Unifonic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {smsProvider !== "none" && (
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} type="password" placeholder="••••••••" />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "واتساب" : "WhatsApp"}</CardTitle>
              <CardDescription>{isAr ? "إرسال الفواتير عبر واتساب" : "Send invoices via WhatsApp"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isAr ? "مفتاح API" : "WhatsApp Business API Key"}</Label>
                <Input value={whatsappApiKey} onChange={e => setWhatsappApiKey(e.target.value)} type="password" placeholder="••••••••" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NUMBERING TAB */}
        <TabsContent value="numbering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "ترقيم المستندات" : "Document Numbering"}</CardTitle>
              <CardDescription>{isAr ? "بادئة ورقم البداية لكل نوع مستند" : "Prefix and starting number for each document type"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: isAr ? "الفواتير" : "Invoices", prefix: form.invoicePrefix, key: "invoicePrefix", example: "INV-1001" },
                { label: isAr ? "عروض الأسعار" : "Quotations", prefix: form.quotationPrefix, key: "quotationPrefix", example: "QT-5001" },
                { label: isAr ? "أوامر الشراء" : "Purchase Orders", prefix: form.purchaseOrderPrefix, key: "purchaseOrderPrefix", example: "PO-2001" },
                { label: isAr ? "أوامر البيع" : "Sales Orders", prefix: form.salesOrderPrefix, key: "salesOrderPrefix", example: "SO-3001" },
                { label: isAr ? "إشعارات التسليم" : "Delivery Notes", prefix: deliveryNotePrefix, key: "deliveryNote", example: "DN-4001" },
                { label: isAr ? "الإيصالات" : "Receipts", prefix: receiptPrefix, key: "receipt", example: "REC-6001" },
                { label: isAr ? "إشعارات دائنة" : "Credit Notes", prefix: creditNotePrefix, key: "creditNote", example: "CN-7001" },
              ].map((doc) => (
                <div key={doc.key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{doc.label}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{doc.example}</Badge>
                    </div>
                  </div>
                  <Input
                    value={doc.prefix}
                    onChange={e => {
                      if (doc.key === "deliveryNote") setDeliveryNotePrefix(e.target.value);
                      else if (doc.key === "receipt") setReceiptPrefix(e.target.value);
                      else if (doc.key === "creditNote") setCreditNotePrefix(e.target.value);
                      else setForm({...form, [doc.key]: e.target.value});
                    }}
                    className="w-24 font-mono"
                    placeholder="INV-"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
