import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Building2, MapPin, Shield, FileText, Palette, Check,
  ChevronLeft, ChevronRight, Upload, Loader2, Globe, CreditCard,
  Stethoscope, Wrench, Factory, Store, UtensilsCrossed, Hotel,
  GraduationCap, Truck, Home, Briefcase, Zap, Sparkles,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  BUSINESS_CATALOG,
  MODULE_CHOICES,
  getDefaultModulesForCategory,
  getBusinessCatalogItem,
  getSaudiBusinessCoverage,
  saveBusinessSelection,
} from "@/config/businessCatalog";
import type { BusinessCategory } from "@/config/businessCatalog";

const COMPANY_ONBOARDING_KEY = "yasco-company-profile";

const steps = [
  { key: "company", icon: Building2, titleEn: "Company Information", titleAr: "معلومات الشركة" },
  { key: "address", icon: MapPin, titleEn: "Company Address", titleAr: "عنوان الشركة" },
  { key: "tax", icon: Shield, titleEn: "Tax & Legal", titleAr: "البيانات الضريبية" },
  { key: "category", icon: Briefcase, titleEn: "Business Category", titleAr: "فئة النشاط" },
  { key: "branding", icon: Palette, titleEn: "Branding", titleAr: "العلامة التجارية" },
  { key: "done", icon: Check, titleEn: "Complete", titleAr: "اكتمل" },
];

const iconMap = {
  Stethoscope,
  Wrench,
  Factory,
  Store,
  UtensilsCrossed,
  Hotel,
  GraduationCap,
  Truck,
  Home,
  Briefcase,
  Zap,
  Globe,
  Sparkles,
};

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { selectedCountry, setCountry } = useCountryDetection();
  const isAr = language === "ar";
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountryState] = useState(selectedCountry);
  const [crNumber, setCrNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory | "">("");
  const [businessSubCategory, setBusinessSubCategory] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [invoiceColor, setInvoiceColor] = useState("#1E3A5F");

  const validation = useMemo(() => {
    switch (steps[step]?.key) {
      case "company": return companyName.trim().length > 0;
      case "address": return city.trim().length > 0;
      case "tax": return true;
      case "category": return businessCategory.length > 0;
      case "branding": return true;
      default: return true;
    }
  }, [step, companyName, city, businessCategory]);

  const handleNext = async () => {
    if (steps[step].key === "address") {
      setCountry(country);
    }
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    const profile = {
      companyName, companyNameAr, email, phone, website,
      buildingNo, street, district, city, zipCode, country,
      crNumber, vatNumber, businessCategory, businessSubCategory,
      selectedModules,
      enabledModules: selectedModules,
      invoiceColor, completedAt: new Date().toISOString(),
    };
    localStorage.setItem(COMPANY_ONBOARDING_KEY, JSON.stringify(profile));
    if (businessCategory) saveBusinessSelection(businessCategory, selectedModules, businessSubCategory);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    toast.success(isAr ? "تم حفظ معلومات الشركة" : "Company information saved");
    navigate("/register");
  };

  const renderStep = () => {
    switch (steps[step].key) {
      case "company":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "اسم الشركة (إنجليزي)" : "Company Name (English)"} *</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="ABC Company" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "اسم الشركة (عربي)" : "Company Name (Arabic)"}</Label>
                <Input value={companyNameAr} onChange={e => setCompanyNameAr(e.target.value)} placeholder="شركة أ ب ج" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="info@company.sa" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "رقم الهاتف" : "Phone"}</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966 50 123 4567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الموقع الإلكتروني" : "Website"}</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.company.sa" />
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
                <Input value={buildingNo} onChange={e => setBuildingNo(e.target.value)} placeholder="1234" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الشارع" : "Street"}</Label>
                <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="King Fahd Road" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الحي" : "District"}</Label>
              <Input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Al Olaya" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "المدينة" : "City"} *</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Riyadh" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الرمز البريدي" : "Zip Code"}</Label>
                <Input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="12211" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الدولة" : "Country"} *</Label>
              <Select value={country} onValueChange={v => { setCountryState(v); setCountry(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SA">{isAr ? "السعودية" : "Saudi Arabia"}</SelectItem>
                  <SelectItem value="AE">{isAr ? "الإمارات" : "UAE"}</SelectItem>
                  <SelectItem value="PK">{isAr ? "باكستان" : "Pakistan"}</SelectItem>
                  <SelectItem value="QA">{isAr ? "قطر" : "Qatar"}</SelectItem>
                  <SelectItem value="EG">{isAr ? "مصر" : "Egypt"}</SelectItem>
                  <SelectItem value="IN">{isAr ? "الهند" : "India"}</SelectItem>
                  <SelectItem value="US">{isAr ? "أمريكا" : "United States"}</SelectItem>
                  <SelectItem value="GB">{isAr ? "بريطانيا" : "United Kingdom"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "tax":
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
                <Label>{isAr ? "رقم السجل التجاري" : "CR Number"}</Label>
                <Input value={crNumber} onChange={e => setCrNumber(e.target.value)} placeholder="1012345678" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الرقم الضريبي" : "VAT Number"}</Label>
                <Input value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="310123456700003" />
              </div>
            </div>
          </div>
        );
      case "category":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isAr ? "اختر فئة نشاطك لتفعيل الوحدات المناسبة" : "Choose your business category to enable relevant modules"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BUSINESS_CATALOG.map(cat => {
                const Icon = iconMap[cat.icon as keyof typeof iconMap] || Briefcase;
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setBusinessCategory(cat.value);
                      setBusinessSubCategory(cat.subCategories?.[0] || "");
                      setSelectedModules(getDefaultModulesForCategory(cat.value));
                    }}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl text-center transition-all ${
                      businessCategory === cat.value
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${cat.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <span className="text-xs font-medium">{isAr ? cat.labelAr : cat.label}</span>
                  </button>
                );
              })}
            </div>
            {businessCategory && businessCategory !== "all" && (
              <div className="rounded-xl border bg-slate-50 p-4">
                {getSaudiBusinessCoverage(businessCategory) && (
                  <div className="mb-4 rounded-lg border bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {isAr ? "إعداد سعودي مقترح" : "Saudi preset"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {getSaudiBusinessCoverage(businessCategory)?.managementSystem}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {getSaudiBusinessCoverage(businessCategory)?.workflows.slice(0, 6).map((workflow) => (
                        <span key={workflow} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                          {workflow}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(getBusinessCatalogItem(businessCategory).subCategories?.length || 0) > 0 && (
                  <div className="mb-4 space-y-2">
                    <Label>{isAr ? "النشاط الفرعي" : "Sub-category"}</Label>
                    <Select value={businessSubCategory} onValueChange={setBusinessSubCategory}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={isAr ? "اختر النشاط الفرعي" : "Select sub-category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getBusinessCatalogItem(businessCategory).subCategories?.map((subCategory, index) => (
                          <SelectItem key={subCategory} value={subCategory}>
                            {isAr ? (getBusinessCatalogItem(businessCategory).subCategoriesAr?.[index] || subCategory) : subCategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{isAr ? "الوحدات المفعلة" : "Enabled modules"}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAr ? "يمكنك تعديلها حسب احتياج النشاط" : "Adjust these for the tenant's exact workflow"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModules(getDefaultModulesForCategory(businessCategory))}
                  >
                    {isAr ? "استعادة الافتراضي" : "Preset"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MODULE_CHOICES.map((module) => {
                    const checked = selectedModules.includes(module.id);
                    return (
                      <label key={module.id} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setSelectedModules((current) =>
                              value
                                ? Array.from(new Set([...current, module.id]))
                                : current.filter((id) => id !== module.id),
                            );
                          }}
                        />
                        <span>{isAr ? module.labelAr : module.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      case "branding":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "شعار الشركة" : "Company Logo"}</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                  <Upload className="size-4 mr-2" />{isAr ? "رفع شعار" : "Upload Logo"}
                </Button>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                {logoFile && <span className="text-sm text-muted-foreground">{logoFile.name}</span>}
              </div>
              {logoFile && (
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border inline-block">
                  <img src={URL.createObjectURL(logoFile)} alt="Logo" className="h-16 w-16 object-contain" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "لون رأس الفاتورة" : "Invoice Header Color"}</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={invoiceColor} onChange={e => setInvoiceColor(e.target.value)} className="w-12 h-10 p-1 rounded border" />
                <span className="text-sm text-muted-foreground">{invoiceColor}</span>
              </div>
            </div>
          </div>
        );
      case "done":
        return (
          <div className="space-y-4 py-4">
            <div className="text-center space-y-3">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
                <Check className="size-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">{isAr ? "تم الإعداد!" : "Setup Complete!"}</h3>
              <p className="text-muted-foreground text-sm">
                {isAr ? "شركتك جاهزة. يمكنك المتابعة للتسجيل." : "Your company profile is ready. You can proceed to registration."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <Building2 className="size-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">{isAr ? "الشركة" : "Company"}</p>
                  <p className="text-sm font-medium truncate">{companyName || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <MapPin className="size-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">{isAr ? "الموقع" : "Location"}</p>
                  <p className="text-sm font-medium truncate">{[city, country].filter(Boolean).join(", ") || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <Briefcase className="size-4 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">{isAr ? "الفئة" : "Category"}</p>
                  <p className="text-sm font-medium capitalize">{businessCategory}</p>
                  {businessSubCategory && <p className="text-xs text-slate-500 truncate">{businessSubCategory}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <Shield className="size-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">{isAr ? "السجل التجاري" : "CR Number"}</p>
                  <p className="text-sm font-medium font-mono">{crNumber || "—"}</p>
                </div>
              </div>
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
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">YA</div>
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
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <Button variant="ghost" className="text-slate-400" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}>
                <ChevronLeft className="size-4 mr-1" />{isAr ? "السابق" : "Back"}
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!validation}>
                  {isAr ? "التالي" : "Next"}<ChevronRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                  {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
                  {isAr ? "إنهاء وتسجيل" : "Complete & Register"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
