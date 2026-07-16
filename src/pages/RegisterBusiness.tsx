import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, ChevronLeft, ChevronRight, Check, Globe, Shield, Lock, User, Mail, Phone, Users, Clock, Briefcase, Palette, Sparkles, Stethoscope, Wrench, Factory, Store, UtensilsCrossed, Hotel, GraduationCap, Truck, Home, Zap } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { useCountryDetection } from "@/providers/country-detection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  MODULE_CHOICES,
  getDefaultModulesForCategory,
  getBusinessCatalogItem,
  saveBusinessSelection,
} from "@/config/businessCatalog";
import type { BusinessCategory } from "@/config/businessCatalog";

const iconMap: Record<string, React.ComponentType<any>> = {
  Stethoscope, Wrench, Factory, Store, UtensilsCrossed, Hotel,
  GraduationCap, Truck, Home, Briefcase, Zap, Sparkles,
};

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  timezone: z.string().min(1, "Timezone is required"),
  businessType: z.string().min(1, "Business type is required"),
  industry: z.string().min(1, "Category is required"),
  employeesCount: z.string().min(1, "Employee count is required"),
  currency: z.string().min(1, "Currency is required"),
  language: z.string().min(1, "Language is required"),
  selectedModules: z.array(z.string()).optional(),
  themeColor: z.string().optional(),
  taxRegistered: z.boolean(),
  taxNumber: z.string().optional(),
  crNumber: z.string().optional(),
  ntnNumber: z.string().optional(),
  strnNumber: z.string().optional(),
  trnNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const businessTypes = [
  { value: "sole_proprietorship", label: "Sole Proprietorship", labelAr: "مؤسسة فردية" },
  { value: "llc", label: "Limited Liability Company", labelAr: "شركة ذات مسؤولية محدودة" },
  { value: "corporation", label: "Corporation", labelAr: "شركة مساهمة" },
  { value: "partnership", label: "Partnership", labelAr: "شركة تضامن" },
  { value: "branch", label: "Branch", labelAr: "فرع شركة" },
];

const employeeRanges = [
  { value: "1-5", label: "1-5" },
  { value: "6-20", label: "6-20" },
  { value: "21-50", label: "21-50" },
  { value: "51-200", label: "51-200" },
  { value: "201+", label: "201+" },
];

const steps = [
  { title: "Basic Info", titleAr: "المعلومات الأساسية", icon: User },
  { title: "Location", titleAr: "الموقع", icon: Globe },
  { title: "Business Details", titleAr: "تفاصيل النشاط", icon: Briefcase },
  { title: "Services & Theme", titleAr: "الخدمات والمظهر", icon: Palette },
  { title: "Tax Info", titleAr: "البيانات الضريبية", icon: Shield },
  { title: "Password", titleAr: "كلمة المرور", icon: Lock },
];

export default function RegisterBusiness() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { selectedCountry, setCountry, timezone, setTimezone, currency, setCurrency } = useCountryDetection();
  const isAr = language === "ar";

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [categoryModules, setCategoryModules] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | "">("");

  const registerMutation = trpc.registration.register.useMutation({
    onSuccess: (data) => {
      navigate(`/verify-otp?email=${form.getValues("email")}`);
    },
    onError: (err) => setError(err.message),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      ownerName: "",
      email: "",
      phone: "",
      country: selectedCountry,
      city: "",
      timezone: timezone,
      businessType: "",
      industry: "",
      employeesCount: "",
      currency: currency,
      language: language,
      selectedModules: [],
      themeColor: "#1E3A5F",
      taxRegistered: false,
      taxNumber: "",
      crNumber: "",
      ntnNumber: "",
      strnNumber: "",
      trnNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    form.setValue("country", selectedCountry);
    form.setValue("timezone", timezone);
    form.setValue("currency", currency);
  }, [selectedCountry, timezone, currency, form]);

  const watchedCountry = form.watch("country");
  const taxRegistered = form.watch("taxRegistered");
  const watchedModules = form.watch("selectedModules") || [];
  const watchedThemeColor = form.watch("themeColor") || "#1E3A5F";

  const handleCategorySelect = (cat: BusinessCategory) => {
    setSelectedCategory(cat);
    form.setValue("industry", cat);
    const defaultMods = getDefaultModulesForCategory(cat);
    setCategoryModules(defaultMods);
    form.setValue("selectedModules", defaultMods);
  };

  const toggleModule = (moduleId: string) => {
    const current = form.getValues("selectedModules") || [];
    const updated = current.includes(moduleId)
      ? current.filter((m) => m !== moduleId)
      : [...current, moduleId];
    form.setValue("selectedModules", updated);
  };

  const getTaxFields = () => {
    if (!taxRegistered) return null;
    switch (watchedCountry) {
      case "SA":
        return (
          <>
            <FormField control={form.control} name="crNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "رقم السجل التجاري" : "Commercial Registration (CR)"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={isAr ? "رقم السجل التجاري" : "CR Number"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="taxNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "رقم ضريبة القيمة المضافة" : "VAT Number"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="3-1234-5678-9012" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </>
        );
      case "PK":
        return (
          <>
            <FormField control={form.control} name="ntnNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "رقم NTN" : "NTN Number"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="NTN Number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="strnNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "رقم STRN" : "STRN Number"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="STRN Number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </>
        );
      case "AE":
        return (
          <FormField control={form.control} name="trnNumber" render={({ field }) => (
            <FormItem>
              <FormLabel>{isAr ? "رقم TRN" : "TRN Number"}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="1234567890123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        );
      default:
        return (
          <FormField control={form.control} name="taxNumber" render={({ field }) => (
            <FormItem>
              <FormLabel>{isAr ? "الرقم الضريبي" : "Tax Number"}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={isAr ? "الرقم الضريبي" : "Tax Number"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        );
    }
  };

  const onNext = async () => {
    const fieldsByStep = [
      ["companyName", "ownerName", "email", "phone"],
      ["country", "city", "timezone"],
      ["businessType", "employeesCount", "currency", "language"],
      ["industry", "selectedModules", "themeColor"],
      ["taxRegistered"],
      ["password", "confirmPassword"],
    ];
    const fields = fieldsByStep[currentStep];
    if (taxRegistered && currentStep === 4) {
      const taxFields = {
        SA: ["crNumber", "taxNumber"],
        PK: ["ntnNumber", "strnNumber"],
        AE: ["trnNumber"],
      }[watchedCountry] ?? ["taxNumber"];
      fields.push(...taxFields);
    }
    const isValid = await form.trigger(fields as any);
    if (!isValid) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const onBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    setError("");
    const values = form.getValues();
    const payload: Record<string, any> = {
      companyName: values.companyName,
      ownerName: values.ownerName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      city: values.city,
      timezone: values.timezone,
      businessType: values.businessType,
      industry: values.industry,
      employeesCount: values.employeesCount,
      currency: values.currency,
      language: values.language,
      selectedModules: values.selectedModules,
      themeColor: values.themeColor,
      taxRegistered: values.taxRegistered,
      password: values.password,
    };
    if (values.taxRegistered) {
      switch (watchedCountry) {
        case "SA":
          payload.crNumber = values.crNumber;
          payload.taxNumber = values.taxNumber;
          break;
        case "PK":
          payload.ntnNumber = values.ntnNumber;
          payload.strnNumber = values.strnNumber;
          break;
        case "AE":
          payload.trnNumber = values.trnNumber;
          break;
        default:
          payload.taxNumber = values.taxNumber;
      }
    }
    const category = values.industry as BusinessCategory;
    const selectedMods = values.selectedModules || [];
    saveBusinessSelection(category, selectedMods, values.themeColor);
    registerMutation.mutate(payload as any);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "اسم الشركة" : "Company Name"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={isAr ? "اسم الشركة" : "Company Name"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ownerName" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "اسم المالك" : "Owner Name"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={isAr ? "اسم المالك" : "Owner Name"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="email@company.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isAr ? "رقم الهاتف" : "Phone"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+966 5X XXX XXXX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "الدولة" : "Country"}</FormLabel>
                <Select onValueChange={(value) => { field.onChange(value); setCountry(value); }} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isAr ? "اختر الدولة" : "Select Country"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية" },
                      { code: "AE", name: "UAE", nameAr: "الإمارات" },
                      { code: "PK", name: "Pakistan", nameAr: "باكستان" },
                      { code: "QA", name: "Qatar", nameAr: "قطر" },
                      { code: "OM", name: "Oman", nameAr: "عمان" },
                      { code: "BH", name: "Bahrain", nameAr: "البحرين" },
                      { code: "KW", name: "Kuwait", nameAr: "الكويت" },
                      { code: "EG", name: "Egypt", nameAr: "مصر" },
                      { code: "IN", name: "India", nameAr: "الهند" },
                      { code: "US", name: "United States", nameAr: "الولايات المتحدة" },
                      { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة" },
                      { code: "DE", name: "Germany", nameAr: "ألمانيا" },
                      { code: "FR", name: "France", nameAr: "فرنسا" },
                      { code: "TR", name: "Turkey", nameAr: "تركيا" },
                    ].map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {isAr ? c.nameAr : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "المدينة" : "City"}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={isAr ? "المدينة" : "City"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timezone" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "المنطقة الزمنية" : "Timezone"}</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="businessType" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "نوع النشاط" : "Business Type"}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isAr ? "اختر النوع" : "Select Type"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessTypes.map((bt) => (
                      <SelectItem key={bt.value} value={bt.value}>
                        {isAr ? bt.labelAr : bt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="employeesCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isAr ? "عدد الموظفين" : "Employees"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isAr ? "اختر" : "Select"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeeRanges.map((er) => (
                        <SelectItem key={er.value} value={er.value}>{er.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isAr ? "العملة" : "Currency"}</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isAr ? "اللغة" : "Language"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        );
      case 3: {
        const catalogEntries = Object.entries(MODULE_CHOICES) as [BusinessCategory, typeof MODULE_CHOICES[BusinessCategory]][];
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">{isAr ? "اختر قطاع نشاطك التجاري" : "Select Your Business Category"}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {catalogEntries.map(([catKey, catVal]) => {
                  const catInfo = getBusinessCatalogItem(catKey);
                  const isSelected = selectedCategory === catKey;
                  const CatIcon = iconMap[catVal.icon] || Store;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => handleCategorySelect(catKey as BusinessCategory)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className={`rounded-full p-2 ${isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                        <CatIcon className="size-5" />
                      </div>
                      <span className="text-sm font-medium leading-tight">{isAr ? catVal.labelAr : catVal.label}</span>
                      {isSelected && <Check className="size-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedCategory && (
              <div>
                <h3 className="font-semibold mb-2">{isAr ? "اختر الخدمات التي تحتاجها" : "Select Services You Need"}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {isAr ? "اختر الخدمات المناسبة لنشاطك التجاري" : "Choose the services relevant to your business"}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {categoryModules.map((modId) => {
                    const modInfo = MODULE_CHOICES[selectedCategory]?.modules?.find((m) => m.id === modId);
                    return (
                      <label
                        key={modId}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          watchedModules.includes(modId) ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <Checkbox
                          checked={watchedModules.includes(modId)}
                          onCheckedChange={() => toggleModule(modId)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{modInfo?.label || modId}</p>
                          {modInfo?.desc && (
                            <p className="text-xs text-muted-foreground truncate">{modInfo.desc}</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-2">{isAr ? "اختر لون لوحة التحكم" : "Dashboard Theme Color"}</h3>
              <div className="flex gap-3 flex-wrap items-center">
                {["#1E3A5F", "#0F766E", "#7C3AED", "#DC2626", "#D97706", "#059669", "#2563EB", "#BE185D"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => form.setValue("themeColor", color)}
                    className={`size-10 rounded-full border-2 transition-all ${
                      watchedThemeColor === color ? "border-blue-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">{isAr ? "أو" : "or"}</Label>
                  <Input
                    type="color"
                    value={watchedThemeColor}
                    onChange={(e) => form.setValue("themeColor", e.target.value)}
                    className="size-10 p-1 cursor-pointer border rounded"
                  />
                </div>
              </div>
              <div
                className="mt-3 h-2 rounded-full transition-all"
                style={{ background: `linear-gradient(90deg, ${watchedThemeColor}, ${watchedThemeColor}88, ${watchedThemeColor}44)` }}
              />
            </div>
          </div>
        );
      }
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Switch
                checked={taxRegistered}
                onCheckedChange={(v) => form.setValue("taxRegistered", v)}
              />
              <div>
                <p className="font-medium">{isAr ? "مسجل ضريبيًا" : "Tax Registered"}</p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "هل أنت مسجل في الضريبة؟" : "Are you registered for tax?"}
                </p>
              </div>
            </div>
            {taxRegistered && getTaxFields()}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "كلمة المرور" : "Password"}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="••••••••" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>{isAr ? "تأكيد كلمة المرور" : "Confirm Password"}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="••••••••" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="hidden lg:flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-xl">YA</div>
              <div>
                <p className="text-2xl font-bold">YASCO</p>
                <p className="text-sm text-slate-400">Enterprise OS</p>
              </div>
            </div>
            <div className="space-y-4">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Building2 className="size-3 mr-1" />
                {isAr ? "تسجيل شركة جديدة" : "New Business Registration"}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight">
                {isAr ? "انضم إلى ياسكو" : "Join YASCO"}
              </h1>
              <p className="text-slate-300 leading-relaxed">
                {isAr
                  ? "قم بتسجيل شركتك في دقائق وابدأ في إدارة أعمالك بكفاءة. نوفر لك نظام ERP متكامل."
                  : "Register your business in minutes and start managing your operations efficiently. We provide a complete ERP system."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe, text: isAr ? "دعم 20+ دولة" : "20+ Countries" },
                { icon: Shield, text: isAr ? "امتثال ضريبي" : "Tax Compliance" },
                { icon: Users, text: isAr ? "إدارة متعددة" : "Multi-User" },
                { icon: Clock, text: isAr ? "إعداد سريع" : "Quick Setup" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 rounded-lg bg-white/5 p-3">
                  <item.icon className="size-4 text-blue-400" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-8">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl">{isAr ? "تسجيل الشركة" : "Register Business"}</CardTitle>
              <CardDescription>
                {isAr ? `الخطوة ${currentStep + 1} من ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
              </CardDescription>
              <Progress value={progress} className="mt-2" />
              <div className="flex gap-1 mt-3">
                {steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={idx} className="flex items-center gap-1">
                      <div className={`flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        idx < currentStep ? "bg-blue-600 text-white" :
                        idx === currentStep ? "bg-blue-600 text-white" :
                        "bg-slate-200 text-slate-500"
                      }`}>
                        {idx < currentStep ? <Check className="size-3" /> : <StepIcon className="size-3" />}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`h-0.5 w-6 ${idx < currentStep ? "bg-blue-600" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Form {...form}>
                <form onSubmit={(e) => { e.preventDefault(); currentStep === steps.length - 1 ? onSubmit() : onNext(); }} className="space-y-6">
                  {renderStep()}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    {currentStep > 0 ? (
                      <Button type="button" variant="outline" onClick={onBack}>
                        <ChevronLeft className="size-4 mr-1" />
                        {isAr ? "السابق" : "Back"}
                      </Button>
                    ) : (
                      <div />
                    )}
                    {currentStep < steps.length - 1 ? (
                      <Button type="submit">
                        {isAr ? "التالي" : "Next"}
                        <ChevronRight className="size-4 ml-1" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={registerMutation.isPending}>
                        {registerMutation.isPending
                          ? (isAr ? "جاري التسجيل..." : "Registering...")
                          : (isAr ? "تسجيل" : "Register")}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  {isAr ? "تسجيل الدخول" : "Sign in"}
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
