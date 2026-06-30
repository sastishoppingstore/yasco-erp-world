import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, Shield, FileText, Package,
  Check, ChevronLeft, ChevronRight, Upload, Loader2, Sparkles,
  Globe, Phone, CreditCard, Stamp, PenTool, Palette, Hash,
  Eye, Copy, CheckCircle2, AlertTriangle, Info,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { useCountryDetection } from "@/providers/country-detection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const steps = [
  { key: "company", icon: Building2, titleEn: "Company Information", titleAr: "معلومات الشركة" },
  { key: "address", icon: MapPin, titleEn: "Company Address", titleAr: "عنوان الشركة" },
  { key: "branding", icon: Palette, titleEn: "Logo & Branding", titleAr: "الشعار والعلامة التجارية" },
  { key: "bank", icon: CreditCard, titleEn: "Bank Details", titleAr: "البيانات البنكية" },
  { key: "invoice", icon: FileText, titleEn: "Invoice Settings", titleAr: "إعدادات الفاتورة" },
  { key: "numbering", icon: Hash, titleEn: "Document Numbering", titleAr: "ترقيم المستندات" },
  { key: "business", icon: Package, titleEn: "Business Type", titleAr: "نوع النشاط" },
  { key: "license", icon: Shield, titleEn: "License Activation", titleAr: "تفعيل الترخيص" },
  { key: "done", icon: Check, titleEn: "Complete Setup", titleAr: "اكتمل الإعداد" },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { selectedCountry, timezone, setCountry, setTimezone } = useCountryDetection();
  const isAr = language === "ar";

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  // Step 1: Company Information
  const [companyName, setCompanyName] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Step 2: Address
  const [buildingNo, setBuildingNo] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountryState] = useState(selectedCountry);
  const [tz, setTzState] = useState(timezone);

  // Step 3: Branding
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [invoiceHeaderColor, setInvoiceHeaderColor] = useState("#1E3A5F");
  const [invoiceFooterText, setInvoiceFooterText] = useState("Thank you for your business!");
  const [invoiceFooterTextAr, setInvoiceFooterTextAr] = useState("شكراً لتعاملكم معنا");

  // Step 4: Bank Details
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  // Step 5: Invoice Settings
  const [crNumber, setCrNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [quotationPrefix, setQuotationPrefix] = useState("QT-");
  const [poPrefix, setPoPrefix] = useState("PO-");
  const [receiptPrefix, setReceiptPrefix] = useState("REC-");
  const [defaultTaxRate, setDefaultTaxRate] = useState("15");
  const [currency, setCurrencyState] = useState("SAR");
  const [invoiceTerms, setInvoiceTerms] = useState("");

  // Step 6: Document Numbering
  const [invoiceNextNumber, setInvoiceNextNumber] = useState("1001");
  const [quotationNextNumber, setQuotationNextNumber] = useState("5001");
  const [poNextNumber, setPoNextNumber] = useState("2001");
  const [receiptNextNumber, setReceiptNextNumber] = useState("3001");

  // Step 7: Business Type
  const [businessType, setBusinessType] = useState("construction");

  // Step 8: License
  const [licenseKey, setLicenseKey] = useState("");

  // Print & Email Settings
  const [paperSize, setPaperSize] = useState("A4");
  const [printLogo, setPrintLogo] = useState(true);
  const [printQr, setPrintQr] = useState(true);
  const [printStamp, setPrintStamp] = useState(true);
  const [printSignature, setPrintSignature] = useState(true);
  const [copiesCount, setCopiesCount] = useState("1");
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [sendInvoiceEmail, setSendInvoiceEmail] = useState(true);

  const saveProfileMut = trpc.settings.companySettingsUpdate.useMutation();

  const isPending = saveProfileMut.isPending;

  // Validation per step
  const stepValidation = useMemo(() => {
    switch (steps[step]?.key) {
      case "company":
        return companyName.trim().length > 0;
      case "address":
        return city.trim().length > 0 && country.length > 0;
      case "branding":
        return true;
      case "bank":
        return bankName.trim().length > 0;
      case "invoice":
        return invoicePrefix.trim().length > 0;
      case "numbering":
        return true;
      case "business":
        return businessType.length > 0;
      case "license":
        return true;
      default:
        return true;
    }
  }, [step, companyName, city, country, bankName, invoicePrefix, businessType]);

  const handleNext = async () => {
    setError("");
    try {
      switch (steps[step].key) {
        case "company":
          await saveProfileMut.mutateAsync({
            companyName, companyNameAr, email, phone, website,
          } as any);
          break;
        case "address":
          await saveProfileMut.mutateAsync({
            address: `${buildingNo} ${street}, ${district}`,
            city, country, zipCode,
          } as any);
          setCountry(country);
          setTimezone(tz);
          break;
        case "branding": {
          const brandingData: Record<string, any> = {
            primaryColor: invoiceHeaderColor,
            invoiceFooterText,
            invoiceFooterTextAr,
          };
          if (logoFile) {
            const reader = new FileReader();
            const logoDataUrl = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(logoFile);
            });
            brandingData.logo = logoDataUrl;
          }
          if (signatureFile) {
            const reader = new FileReader();
            const sigDataUrl = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(signatureFile);
            });
            brandingData.signatureImage = sigDataUrl;
          }
          if (stampFile) {
            const reader = new FileReader();
            const stampDataUrl = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(stampFile);
            });
            brandingData.stampImage = stampDataUrl;
          }
          await saveProfileMut.mutateAsync(brandingData as any);
          break;
        }
        case "bank":
          await saveProfileMut.mutateAsync({
            bankName, bankAccountName, bankIban, bankAccountNumber,
          } as any);
          break;
        case "invoice": {
          const taxData: Record<string, any> = {
            invoicePrefix, quotationPrefix, invoiceTerms,
            vatRate: defaultTaxRate, defaultCurrency: currency,
          };
          if (country === "SA") { taxData.crNumber = crNumber; taxData.vatNumber = vatNumber; }
          else { taxData.vatNumber = vatNumber; }
          await saveProfileMut.mutateAsync(taxData as any);
          break;
        }
        case "numbering":
          await saveProfileMut.mutateAsync({
            invoicePrefix,
            quotationPrefix,
            purchaseOrderPrefix: poPrefix,
            salesOrderPrefix: receiptPrefix,
          } as any);
          break;
        case "business":
          await saveProfileMut.mutateAsync({
            businessType,
          } as any);
          break;
        case "license":
          await saveProfileMut.mutateAsync({
            licenseKey,
          } as any);
          break;
      }
      if (step < steps.length - 1) setStep(step + 1);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const handleSkip = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const renderStep = () => {
    switch (steps[step].key) {
      case "company":
        return (
          <div className="space-y-4">
            {!stepValidation && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>{isAr ? "يرجى إدخال اسم الشركة على الأقل" : "Please enter at least the company name"}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "اسم الشركة (إنجليزي)" : "Company Name (English)"} *</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Construction Co." />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "اسم الشركة (عربي)" : "Company Name (Arabic)"} *</Label>
                <Input value={companyNameAr} onChange={(e) => setCompanyNameAr(e.target.value)} placeholder="شركة أ ب ج للإنشاءات" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="info@company.sa" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "رقم الهاتف" : "Phone"}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 50 123 4567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الموقع الإلكتروني" : "Website"}</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.company.sa" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "رقم السجل التجاري" : "CR Number"}</Label>
                <Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="1012345678" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الرقم الضريبي" : "Tax Number / TRN"}</Label>
                <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="310123456700003" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "نسبة ضريبة القيمة المضافة" : "VAT Rate (%)"}</Label>
                <Input value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} type="number" placeholder="15" />
              </div>
            </div>
            {companyName && (
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-xs font-medium text-slate-500 mb-2">{isAr ? "معاينة" : "Preview"}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {companyName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{companyName}</p>
                    {companyNameAr && <p className="text-xs text-slate-500" dir="rtl">{companyNameAr}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "address":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "رقم المبنى" : "Building No"}</Label>
                <Input value={buildingNo} onChange={(e) => setBuildingNo(e.target.value)} placeholder="1234" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الشارع" : "Street"}</Label>
                <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="King Fahd Road" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الحي" : "District"}</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Al Olaya" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "المدينة" : "City"} *</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Riyadh" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الرمز البريدي" : "Zip Code"}</Label>
                <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="12211" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "الدولة" : "Country"} *</Label>
                <Select value={country} onValueChange={setCountryState}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SA">Saudi Arabia</SelectItem>
                    <SelectItem value="AE">UAE</SelectItem>
                    <SelectItem value="PK">Pakistan</SelectItem>
                    <SelectItem value="QA">Qatar</SelectItem>
                    <SelectItem value="OM">Oman</SelectItem>
                    <SelectItem value="BH">Bahrain</SelectItem>
                    <SelectItem value="KW">Kuwait</SelectItem>
                    <SelectItem value="EG">Egypt</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "المنطقة الزمنية" : "Timezone"}</Label>
                <Select value={tz} onValueChange={setTzState}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Riyadh">Asia/Riyadh (UTC+3)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                    <SelectItem value="Asia/Karachi">Asia/Karachi (UTC+5)</SelectItem>
                    <SelectItem value="Asia/Qatar">Asia/Qatar (UTC+3)</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                    <SelectItem value="Europe/Berlin">Europe/Berlin (UTC+1)</SelectItem>
                    <SelectItem value="Africa/Cairo">Africa/Cairo (UTC+2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {country === "SA" && (
              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  {isAr ? "سيتم تفعيل توافق ZATCA تلقائياً للشركات السعودية" : "ZATCA compliance will be auto-enabled for Saudi companies"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
      case "branding":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{isAr ? "شعار الشركة" : "Company Logo"}</Label>
              <p className="text-xs text-muted-foreground">{isAr ? "موصى به: 300x300 بكسل، PNG مع خلفية شفافة" : "Recommended: 300x300px, PNG with transparent background"}</p>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                  <Upload className="size-4 mr-2" />
                  {isAr ? "رفع شعار" : "Upload Logo"}
                </Button>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                {logoFile && <span className="text-sm text-muted-foreground">{logoFile.name}</span>}
              </div>
              {logoFile && (
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border inline-block">
                  <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="h-16 w-16 object-contain" />
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{isAr ? "توقيع المدير" : "Manager Signature"}</Label>
              <p className="text-xs text-muted-foreground">{isAr ? "يظهر على الفواتير والمستندات الرسمية" : "Appears on invoices and official documents"}</p>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => document.getElementById("signature-upload")?.click()}>
                  <PenTool className="size-4 mr-2" />
                  {isAr ? "رفع التوقيع" : "Upload Signature"}
                </Button>
                <input id="signature-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
                {signatureFile && <span className="text-sm text-muted-foreground">{signatureFile.name}</span>}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{isAr ? "ختم الشركة" : "Company Stamp"}</Label>
              <p className="text-xs text-muted-foreground">{isAr ? "يظهر على الفواتير الرسمية" : "Appears on official invoices"}</p>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => document.getElementById("stamp-upload")?.click()}>
                  <Stamp className="size-4 mr-2" />
                  {isAr ? "رفع الختم" : "Upload Stamp"}
                </Button>
                <input id="stamp-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setStampFile(e.target.files?.[0] || null)} />
                {stampFile && <span className="text-sm text-muted-foreground">{stampFile.name}</span>}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{isAr ? "لون رأس الفاتورة" : "Invoice Header Color"}</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={invoiceHeaderColor} onChange={(e) => setInvoiceHeaderColor(e.target.value)} className="w-12 h-10 p-1 rounded border" />
                <span className="text-sm text-muted-foreground">{invoiceHeaderColor}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "نص تذييل الفاتورة (إنجليزي)" : "Invoice Footer Text (English)"}</Label>
                <Input value={invoiceFooterText} onChange={(e) => setInvoiceFooterText(e.target.value)} placeholder="Thank you for your business!" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "نص تذييل الفاتورة (عربي)" : "Invoice Footer Text (Arabic)"}</Label>
                <Input value={invoiceFooterTextAr} onChange={(e) => setInvoiceFooterTextAr(e.target.value)} placeholder="شكراً لتعاملكم معنا" dir="rtl" />
              </div>
            </div>
            {/* Print Settings */}
            <Separator />
            <div className="space-y-3">
              <Label className="text-base font-semibold">{isAr ? "إعدادات الطباعة" : "Print Settings"}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">{isAr ? "حجم الورق" : "Paper Size"}</Label>
                  <Select value={paperSize} onValueChange={setPaperSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210x297mm)</SelectItem>
                      <SelectItem value="THERMAL_80MM">{isAr ? " حراري 80 ملم" : "Thermal 80mm"}</SelectItem>
                      <SelectItem value="THERMAL_58MM">{isAr ? " حراري 58 ملم" : "Thermal 58mm"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">{isAr ? "عدد النسخ" : "Copies"}</Label>
                  <Input value={copiesCount} onChange={(e) => setCopiesCount(e.target.value)} type="number" min="1" max="5" />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={printLogo} onCheckedChange={setPrintLogo} />
                  <Label className="text-sm">{isAr ? "طباعة الشعار" : "Print Logo"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={printQr} onCheckedChange={setPrintQr} />
                  <Label className="text-sm">{isAr ? "طباعة QR" : "Print QR Code"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={printStamp} onCheckedChange={setPrintStamp} />
                  <Label className="text-sm">{isAr ? "طباعة الختم" : "Print Stamp"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={printSignature} onCheckedChange={setPrintSignature} />
                  <Label className="text-sm">{isAr ? "طباعة التوقيع" : "Print Signature"}</Label>
                </div>
              </div>
            </div>
            {/* Email Settings */}
            <Separator />
            <div className="space-y-3">
              <Label className="text-base font-semibold">{isAr ? "إعدادات البريد الإلكتروني" : "Email Settings"}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">{isAr ? "خادم SMTP" : "SMTP Server"}</Label>
                  <Input value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">{isAr ? "المنفذ" : "Port"}</Label>
                  <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                  <Input value={smtpEmail} onChange={(e) => setSmtpEmail(e.target.value)} type="email" placeholder="invoices@company.sa" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">{isAr ? "كلمة المرور" : "Password"}</Label>
                  <Input value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={sendInvoiceEmail} onCheckedChange={setSendInvoiceEmail} />
                <Label className="text-sm">{isAr ? "إرسال نسخة فاتورة بالبريد" : "Send invoice copy via email"}</Label>
              </div>
            </div>
          </div>
        );
      case "bank":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isAr ? "تظهر على الفواتير ومستندات الدفع" : "Shown on invoices and payment documents"}
            </p>
            <div className="space-y-2">
              <Label>{isAr ? "اسم البنك" : "Bank Name"}</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder={isAr ? "البنك الأهلي السعودي" : "Saudi National Bank"} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "اسم الحساب" : "Account Name"}</Label>
              <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder={companyName || "Company Name"} />
            </div>
            <div className="space-y-2">
              <Label>IBAN</Label>
              <Input value={bankIban} onChange={(e) => setBankIban(e.target.value)} placeholder="SA03 8000 0000 6080 1016 7519" />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "رقم الحساب" : "Account Number"}</Label>
              <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="608010167519" />
            </div>
          </div>
        );
      case "invoice":
        return (
          <div className="space-y-4">
            {country === "SA" && (
              <Alert>
                <Shield className="size-4" />
                <AlertDescription>
                  {isAr ? "البيانات الضريبية مطلوبة للتوافق مع ZATCA" : "Tax details required for ZATCA compliance"}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "بادئة الفاتورة" : "Invoice Prefix"}</Label>
                <Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="INV-" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "العملة" : "Currency"}</Label>
                <Select value={currency} onValueChange={setCurrencyState}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "شروط الفاتورة" : "Invoice Terms"}</Label>
              <Textarea value={invoiceTerms} onChange={(e) => setInvoiceTerms(e.target.value)} placeholder={isAr ? "شروط وأحكام الدفع" : "Payment terms and conditions"} />
            </div>
          </div>
        );
      case "numbering":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isAr ? "حدد بادئة ورقم البداية لكل نوع مستند" : "Set prefix and starting number for each document type"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50">
                <div className="flex-1 space-y-1">
                  <Label className="text-sm">{isAr ? "الفواتير" : "Invoices"}</Label>
                  <div className="flex gap-2">
                    <Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="w-24" />
                    <Input value={invoiceNextNumber} onChange={(e) => setInvoiceNextNumber(e.target.value)} type="number" className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50">
                <div className="flex-1 space-y-1">
                  <Label className="text-sm">{isAr ? "عروض الأسعار" : "Quotations"}</Label>
                  <div className="flex gap-2">
                    <Input value={quotationPrefix} onChange={(e) => setQuotationPrefix(e.target.value)} className="w-24" />
                    <Input value={quotationNextNumber} onChange={(e) => setQuotationNextNumber(e.target.value)} type="number" className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50">
                <div className="flex-1 space-y-1">
                  <Label className="text-sm">{isAr ? "أوامر الشراء" : "Purchase Orders"}</Label>
                  <div className="flex gap-2">
                    <Input value={poPrefix} onChange={(e) => setPoPrefix(e.target.value)} className="w-24" />
                    <Input value={poNextNumber} onChange={(e) => setPoNextNumber(e.target.value)} type="number" className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50">
                <div className="flex-1 space-y-1">
                  <Label className="text-sm">{isAr ? "الإيصالات" : "Receipts"}</Label>
                  <div className="flex gap-2">
                    <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value)} className="w-24" />
                    <Input value={receiptNextNumber} onChange={(e) => setReceiptNextNumber(e.target.value)} type="number" className="flex-1" />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {isAr ? "مثال: INV-1001, QT-5001, PO-2001" : "Example: INV-1001, QT-5001, PO-2001"}
            </div>
          </div>
        );
      case "business":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isAr ? "اختر نوع نشاطك لتفعيل الوحدات المناسبة" : "Choose your business type to enable relevant modules"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: "construction", label: "Construction", labelAr: "شركة إنشاءات", icon: "🏗️" },
                { value: "retail", label: "Retail / Trading", labelAr: "تجارة تجزئة", icon: "🏪" },
                { value: "restaurant", label: "Restaurant / Food", labelAr: "مطعم / طعام", icon: "🍽️" },
                { value: "manufacturing", label: "Manufacturing", labelAr: "تصنيع", icon: "🏭" },
                { value: "services", label: "Services", labelAr: "خدمات", icon: "💼" },
                { value: "all", label: "Multi-Business (All)", labelAr: "متعدد الأنشطة", icon: "🏢" },
              ].map((bt) => (
                <button
                  key={bt.value}
                  onClick={() => setBusinessType(bt.value)}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg text-left transition-all ${
                    businessType === bt.value
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">{bt.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{isAr ? bt.labelAr : bt.label}</p>
                  </div>
                  {businessType === bt.value && (
                    <Check className="size-5 text-blue-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case "license":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "مفتاح الترخيص" : "License Key"}</Label>
              <Input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" className="font-mono text-lg tracking-wider" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Globe className="size-4 mr-2" />
                {isAr ? "تفعيل عبر الإنترنت" : "Activate Online"}
              </Button>
              <Button variant="outline" className="flex-1">
                <Phone className="size-4 mr-2" />
                {isAr ? "تفعيل بدون إنترنت" : "Offline Activation"}
              </Button>
            </div>
            <Alert>
              <Shield className="size-4" />
              <AlertDescription>
                {isAr ? "_trials_14_يوم مجاناً مع جميع الميزات" : "14-day free trial with all features. No credit card required."}
              </AlertDescription>
            </Alert>
          </div>
        );
      case "done":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
                <Check className="size-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{isAr ? "تم الإعداد بنجاح!" : "Setup Complete!"}</h3>
                <p className="text-muted-foreground mt-2">
                  {isAr
                    ? "شركتك جاهزة. يمكنك الآن البدء في استخدام النظام."
                    : "Your company is ready. You can start using the ERP now."}
                </p>
              </div>
            </div>

            {/* Configuration Summary */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600" />
                  {isAr ? "ملخص الإعداد" : "Setup Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <Building2 className="size-4 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{isAr ? "الشركة" : "Company"}</p>
                      <p className="text-sm font-medium truncate">{companyName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <MapPin className="size-4 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{isAr ? "الموقع" : "Location"}</p>
                      <p className="text-sm font-medium truncate">{[city, country].filter(Boolean).join(", ") || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <Palette className="size-4 text-purple-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{isAr ? "الشعار" : "Logo"}</p>
                      <p className="text-sm font-medium">{logoFile ? (isAr ? "تم الرفع ✓" : "Uploaded ✓") : (isAr ? "لم يتم الرفع" : "Not uploaded")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <CreditCard className="size-4 text-orange-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{isAr ? "البنك" : "Bank"}</p>
                      <p className="text-sm font-medium truncate">{bankName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <FileText className="size-4 text-cyan-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{isAr ? "بادئة الفاتورة" : "Invoice Prefix"}</p>
                      <p className="text-sm font-medium font-mono">{invoicePrefix}{invoiceNextNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <Package className="size-4 text-indigo-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{isAr ? "نوع النشاط" : "Business Type"}</p>
                      <p className="text-sm font-medium capitalize">{businessType}</p>
                    </div>
                  </div>
                </div>
                {country === "SA" && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-200">
                    <Shield className="size-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-500">{isAr ? "التوافق" : "Compliance"}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">ZATCA Phase 2</Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">VAT 15%</Badge>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                  <Eye className="size-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">{isAr ? "إعدادات الطباعة" : "Print Settings"}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{paperSize}</Badge>
                      {printLogo && <Badge variant="outline" className="text-xs">{isAr ? "شعار" : "Logo"}</Badge>}
                      {printQr && <Badge variant="outline" className="text-xs">QR</Badge>}
                      {printStamp && <Badge variant="outline" className="text-xs">{isAr ? "ختم" : "Stamp"}</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate("/app")}>
                <Sparkles className="size-4 mr-2" />
                {isAr ? "افتح لوحة التحكم" : "Open Dashboard"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/app/settings")}>
                {isAr ? "إعدادات إضافية" : "More Settings"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/app/settings/company-profile")}>
                <Palette className="size-4 mr-2" />
                {isAr ? "تخصيص الهوية البصرية" : "Customize Branding"}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">ERP</div>
          <div>
            <p className="text-lg font-semibold text-white leading-5">{isAr ? "إعداد الشركة" : "Company Setup"}</p>
            <p className="text-xs text-slate-400">{isAr ? "أكمل البيانات للبدء" : "Complete the details to get started"}</p>
          </div>
        </div>

        <Progress value={((step + 1) / steps.length) * 100} className="mb-6" />

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((s, idx) => {
            const StepIcon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-1 shrink-0">
                <div className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  idx < step ? "bg-blue-600 text-white" :
                  idx === step ? "bg-blue-600 text-white ring-2 ring-blue-400" :
                  "bg-slate-700 text-slate-400"
                }`}>
                  {idx < step ? <Check className="size-3" /> : <StepIcon className="size-3" />}
                </div>
                <span className={`text-xs hidden sm:inline ${idx === step ? "text-white" : "text-slate-500"}`}>
                  {isAr ? s.titleAr : s.titleEn}
                </span>
                {idx < steps.length - 1 && <div className={`h-0.5 w-4 sm:w-8 ${idx < step ? "bg-blue-600" : "bg-slate-700"}`} />}
              </div>
            );
          })}
        </div>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">
              {isAr ? steps[step].titleAr : steps[step].titleEn}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isAr ? `الخطوة ${step + 1} من ${steps.length}` : `Step ${step + 1} of ${steps.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {steps[step].key !== "done" && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <Button variant="ghost" className="text-slate-400" onClick={handleSkip}>
                  {isAr ? "تخطي" : "Skip"}
                </Button>
                <div className="flex gap-2">
                  {step > 0 && (
                    <Button variant="outline" className="text-white border-white/20" onClick={() => setStep(step - 1)} disabled={isPending}>
                      <ChevronLeft className="size-4 mr-1" />
                      {isAr ? "السابق" : "Back"}
                    </Button>
                  )}
                  <Button onClick={handleNext} disabled={isPending || !stepValidation}>
                    {isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronRight className="size-4 mr-1" />
                    )}
                    {step === steps.length - 2 ? (isAr ? "إنهاء" : "Finish") : (isAr ? "التالي" : "Next")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
