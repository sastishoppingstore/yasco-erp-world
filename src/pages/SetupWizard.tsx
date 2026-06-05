import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, Shield, FileText, Package, Users, UserPlus,
  Check, ChevronLeft, ChevronRight, Upload, Save, Loader2, ArrowRight, Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const steps = [
  { key: "profile", icon: Building2, titleEn: "Business Profile", titleAr: "ملف الشركة" },
  { key: "country", icon: MapPin, titleEn: "Country & Timezone", titleAr: "الدولة والمنطقة الزمنية" },
  { key: "tax", icon: Shield, titleEn: "Tax Documents", titleAr: "المستندات الضريبية" },
  { key: "invoice", icon: FileText, titleEn: "Invoice Settings", titleAr: "إعدادات الفواتير" },
  { key: "product", icon: Package, titleEn: "Add First Product", titleAr: "أضف أول منتج" },
  { key: "customer", icon: Users, titleEn: "Add First Customer", titleAr: "أضف أول عميل" },
  { key: "employee", icon: UserPlus, titleEn: "Add First Employee", titleAr: "أضف أول موظف" },
  { key: "done", icon: Check, titleEn: "Done", titleAr: "اكتمل" },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { selectedCountry, timezone, setCountry, setTimezone } = useCountryDetection();
  const isAr = language === "ar";

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  // Step 1: Profile
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Step 2: Country & Timezone
  const [country, setCountryState] = useState(selectedCountry);
  const [tz, setTzState] = useState(timezone);

  // Step 3: Tax
  const [crNumber, setCrNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [ntnNumber, setNtnNumber] = useState("");
  const [strnNumber, setStrnNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [trnNumber, setTrnNumber] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");

  // Step 4: Invoice
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [invoiceTerms, setInvoiceTerms] = useState("");
  const [defaultTaxRate, setDefaultTaxRate] = useState("15");
  const [currency, setCurrencyState] = useState("SAR");

  // Step 5: Product
  const [productName, setProductName] = useState("");
  const [productSku, setProductSku] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBarcode, setProductBarcode] = useState("");

  // Step 6: Customer
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Step 7: Employee
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeRole, setEmployeeRole] = useState("user");

  const saveProfileMut = trpc.settings.companySettingsUpdate.useMutation();
  const saveTaxMut = trpc.settings.companySettingsUpdate.useMutation();
  const saveInvoiceMut = trpc.settings.companySettingsUpdate.useMutation();
  const createProductMut = trpc.inventory.productCreate.useMutation();
  const createCustomerMut = trpc.sales.customerCreate.useMutation();
  const createEmployeeMut = trpc.hrm.employeeCreate.useMutation();

  const isPending = saveProfileMut.isPending || saveTaxMut.isPending || saveInvoiceMut.isPending ||
    createProductMut.isPending || createCustomerMut.isPending || createEmployeeMut.isPending;

  const handleNext = async () => {
    setError("");
    try {
      switch (steps[step].key) {
        case "profile":
          await saveProfileMut.mutateAsync({ companyName, address, phone } as any);
          break;
        case "country":
          setCountry(country);
          setTimezone(tz);
          break;
        case "tax":
          const taxData: Record<string, any> = {};
          if (country === "SA") { taxData.crNumber = crNumber; taxData.vatNumber = vatNumber; }
          else if (country === "PK") { taxData.ntnNumber = ntnNumber; taxData.strnNumber = strnNumber; taxData.cnic = cnic; }
          else if (country === "AE") { taxData.trnNumber = trnNumber; taxData.tradeLicense = tradeLicense; }
          if (Object.keys(taxData).length > 0) await saveTaxMut.mutateAsync(taxData as any);
          break;
        case "invoice":
          await saveInvoiceMut.mutateAsync({ invoicePrefix, invoiceTerms, vatRate: String(defaultTaxRate), defaultCurrency: currency } as any);
          break;
        case "product":
          await createProductMut.mutateAsync({ name: productName, sku: productSku, price: Number(productPrice), barcode: productBarcode } as any);
          break;
        case "customer":
          await createCustomerMut.mutateAsync({ name: customerName, email: customerEmail, phone: customerPhone } as any);
          break;
        case "employee":
          if (employeeName && employeeEmail) {
            await createEmployeeMut.mutateAsync({ name: employeeName, email: employeeEmail, role: employeeRole } as any);
          }
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
      case "profile":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "اسم الشركة" : "Company Name"}</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={isAr ? "اسم الشركة" : "Company Name"} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "العنوان" : "Address"}</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={isAr ? "عنوان الشركة" : "Company Address"} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "رقم الهاتف" : "Phone"}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 5X XXX XXXX" />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "شعار الشركة" : "Logo"}</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                  <Upload className="size-4 mr-2" />
                  {isAr ? "رفع شعار" : "Upload Logo"}
                </Button>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                {logoFile && <span className="text-sm text-muted-foreground">{logoFile.name}</span>}
              </div>
            </div>
          </div>
        );
      case "country":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "الدولة" : "Country"}</Label>
              <Select value={country} onValueChange={setCountryState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
        );
      case "tax":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              {isAr ? "أدخل المستندات الضريبية المطلوبة حسب الدولة" : "Enter tax documents required for your country"}
            </p>
            {country === "SA" && (
              <>
                <div className="space-y-2">
                  <Label>{isAr ? "رقم السجل التجاري" : "Commercial Registration (CR)"}</Label>
                  <Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="CR Number" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "رقم ضريبة القيمة المضافة" : "VAT Number"}</Label>
                  <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="3-1234-5678-9012" />
                </div>
              </>
            )}
            {country === "PK" && (
              <>
                <div className="space-y-2">
                  <Label>NTN Number</Label>
                  <Input value={ntnNumber} onChange={(e) => setNtnNumber(e.target.value)} placeholder="NTN" />
                </div>
                <div className="space-y-2">
                  <Label>STRN Number</Label>
                  <Input value={strnNumber} onChange={(e) => setStrnNumber(e.target.value)} placeholder="STRN" />
                </div>
                <div className="space-y-2">
                  <Label>CNIC</Label>
                  <Input value={cnic} onChange={(e) => setCnic(e.target.value)} placeholder="XXXXX-XXXXXXX-X" />
                </div>
              </>
            )}
            {country === "AE" && (
              <>
                <div className="space-y-2">
                  <Label>TRN Number</Label>
                  <Input value={trnNumber} onChange={(e) => setTrnNumber(e.target.value)} placeholder="1234567890123" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "الرخصة التجارية" : "Trade License"}</Label>
                  <Input value={tradeLicense} onChange={(e) => setTradeLicense(e.target.value)} placeholder="Trade License" />
                </div>
              </>
            )}
            {!["SA", "PK", "AE"].includes(country) && (
              <div className="space-y-2">
                <Label>{isAr ? "الرقم الضريبي" : "Tax Number"}</Label>
                <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="Tax Number" />
              </div>
            )}
          </div>
        );
      case "invoice":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "بادئة الفاتورة" : "Invoice Prefix"}</Label>
                <Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="INV-" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "نسبة الضريبة الافتراضية" : "Default Tax Rate (%)"}</Label>
                <Input value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} type="number" placeholder="15" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "شروط الفاتورة" : "Invoice Terms"}</Label>
              <Textarea value={invoiceTerms} onChange={(e) => setInvoiceTerms(e.target.value)}
                placeholder={isAr ? "شروط وأحكام الفاتورة" : "Invoice terms and conditions"} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "العملة" : "Currency"}</Label>
              <Select value={currency} onValueChange={setCurrencyState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
        );
      case "product":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "اسم المنتج" : "Product Name"}</Label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={isAr ? "اسم المنتج" : "Product Name"} />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={productSku} onChange={(e) => setProductSku(e.target.value)} placeholder="SKU-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "السعر" : "Price"}</Label>
                <Input value={productPrice} onChange={(e) => setProductPrice(e.target.value)} type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input value={productBarcode} onChange={(e) => setProductBarcode(e.target.value)} placeholder="Barcode" />
              </div>
            </div>
          </div>
        );
      case "customer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "اسم العميل" : "Customer Name"}</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={isAr ? "اسم العميل" : "Customer Name"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email" placeholder="customer@company.com" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "رقم الهاتف" : "Phone"}</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+966 5X XXX XXXX" />
              </div>
            </div>
          </div>
        );
      case "employee":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "اسم الموظف" : "Employee Name"}</Label>
              <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder={isAr ? "اسم الموظف" : "Employee Name"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={employeeEmail} onChange={(e) => setEmployeeEmail(e.target.value)} type="email" placeholder="employee@company.com" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الدور" : "Role"}</Label>
                <Select value={employeeRole} onValueChange={setEmployeeRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case "done":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
              <Check className="size-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{isAr ? "تم الإعداد بنجاح!" : "Setup Complete!"}</h3>
              <p className="text-muted-foreground mt-2">
                {isAr
                  ? "شركتك جاهزة. يمكنك الآن البدء في استخدام ياسكو."
                  : "Your company is ready. You can start using YASCO now."}
              </p>
            </div>
            <Button size="lg" onClick={() => navigate("/app")}>
              <Sparkles className="size-4 mr-2" />
              {isAr ? "افتح لوحة التحكم" : "Open Dashboard"}
            </Button>
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
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">YA</div>
          <div>
            <p className="text-lg font-semibold text-white leading-5">YASCO</p>
            <p className="text-xs text-slate-400">{isAr ? "إعداد الشركة" : "Company Setup"}</p>
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
                  <Button onClick={handleNext} disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronRight className="size-4 mr-1" />
                    )}
                    {isAr ? "التالي" : "Next"}
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
