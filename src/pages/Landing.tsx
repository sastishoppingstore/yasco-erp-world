import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Factory,
  Globe2,
  GraduationCap,
  Hotel,
  Landmark,
  Languages,
  Layers,
  Lock,
  Package,
  ReceiptText,
  ShieldCheck,
  Stethoscope,
  Store,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language";

const metrics = [
  { value: "45+", en: "Saudi business categories", ar: "فئة أعمال سعودية" },
  { value: "15%", en: "VAT ready invoicing", ar: "فواتير ضريبية جاهزة" },
  { value: "24/7", en: "Branch operations view", ar: "متابعة تشغيل الفروع" },
];

const verticals = [
  { icon: Wrench, en: "Workshop", ar: "ورش السيارات", detailEn: "Job cards, bays, parts, approvals", detailAr: "بطاقات عمل، مواقف، قطع، موافقات" },
  { icon: Stethoscope, en: "Clinic", ar: "العيادات", detailEn: "Patients, appointments, billing, pharmacy", detailAr: "مرضى، مواعيد، فواتير، صيدلية" },
  { icon: Building2, en: "Construction", ar: "المقاولات", detailEn: "BOQ, projects, site costs, retention", detailAr: "كميات، مشاريع، تكاليف موقع، مستخلصات" },
  { icon: Store, en: "Retail and POS", ar: "التجزئة ونقاط البيع", detailEn: "Barcode, stock, shifts, invoices", detailAr: "باركود، مخزون، ورديات، فواتير" },
  { icon: Truck, en: "Logistics and Travel", ar: "اللوجستيات والسفر", detailEn: "Trips, shipments, packages, suppliers", detailAr: "رحلات، شحنات، باقات، موردون" },
  { icon: Factory, en: "Manufacturing", ar: "التصنيع", detailEn: "BOM, production, QC, batches", detailAr: "مواد، إنتاج، جودة، دفعات" },
  { icon: Hotel, en: "Hospitality", ar: "الضيافة", detailEn: "Bookings, rooms, housekeeping, folios", detailAr: "حجوزات، غرف، نظافة، حسابات" },
  { icon: GraduationCap, en: "Education", ar: "التعليم", detailEn: "Students, fees, attendance, guardians", detailAr: "طلاب، رسوم، حضور، أولياء أمور" },
];

const modules = [
  { icon: ReceiptText, en: "POS and invoices", ar: "نقاط البيع والفواتير" },
  { icon: Package, en: "Inventory and WMS", ar: "المخزون والمستودعات" },
  { icon: Landmark, en: "Accounting", ar: "المحاسبة" },
  { icon: Users, en: "HR and payroll", ar: "الموارد البشرية والرواتب" },
  { icon: BarChart3, en: "Reports", ar: "التقارير" },
  { icon: CreditCard, en: "Payments", ar: "المدفوعات" },
  { icon: Layers, en: "Workflows", ar: "سير العمل" },
  { icon: ShieldCheck, en: "Compliance", ar: "الامتثال" },
];

const compliance = [
  { en: "ZATCA-ready invoice model, QR and immutable issue flow", ar: "نموذج فواتير جاهز للزكاة والضريبة مع QR ومنع تعديل الفاتورة بعد الإصدار" },
  { en: "Saudi HR fields for Iqama, GOSI, WPS, leaves and EOSB", ar: "حقول موارد بشرية سعودية للإقامة والتأمينات وحماية الأجور والإجازات ونهاية الخدمة" },
  { en: "Tenant, branch and role controls for every operational screen", ar: "صلاحيات حسب الشركة والفرع والدور لكل شاشة تشغيلية" },
];

const workflowSteps = [
  { en: "Select business activity", ar: "اختيار النشاط التجاري" },
  { en: "Activate modules", ar: "تفعيل الوحدات" },
  { en: "Run operations", ar: "تشغيل العمليات" },
  { en: "Report profit and compliance", ar: "تقارير الربح والامتثال" },
];

function DashboardPreview({ isAr }: { isAr: boolean }) {
  const rows = [
    { code: "INV-1048", name: isAr ? "ورشة الرياض" : "Riyadh Auto Care", status: isAr ? "مدفوعة" : "Paid", amount: "4,280 SAR" },
    { code: "JOB-338", name: isAr ? "بطاقة عمل سيارة" : "Vehicle job card", status: isAr ? "بانتظار اعتماد" : "Approval", amount: "1,650 SAR" },
    { code: "BOQ-092", name: isAr ? "مشروع فلل" : "Villa project BOQ", status: isAr ? "قيد التسعير" : "Pricing", amount: "82,400 SAR" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 text-white shadow-2xl shadow-slate-950/40">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{isAr ? "لوحة تشغيل Rawafed" : "Rawafed Operations"}</p>
            <p className="text-xs text-slate-400">{isAr ? "فرع الرياض الرئيسي" : "Riyadh main branch"}</p>
          </div>
        </div>
        <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
          {isAr ? "نشط" : "Live"}
        </Badge>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3">
        {[
          ["124,680", isAr ? "مبيعات اليوم" : "Today sales"],
          ["38", isAr ? "طلبات مفتوحة" : "Open orders"],
          ["7", isAr ? "تنبيهات امتثال" : "Compliance alerts"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 px-5 pb-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold">{isAr ? "حركة اليوم" : "Today activity"}</p>
            <p className="text-xs text-slate-400">ZATCA queue: 0</p>
          </div>
          <div className="divide-y divide-white/10">
            {rows.map((row) => (
              <div key={row.code} className="grid grid-cols-[0.8fr_1fr_0.9fr] items-center gap-3 px-4 py-3 text-sm">
                <span className="font-mono text-xs text-slate-400">{row.code}</span>
                <span className="truncate font-medium">{row.name}</span>
                <span className="text-end">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">{row.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold">{isAr ? "تخصيص النشاط" : "Vertical configuration"}</p>
          <div className="mt-4 space-y-3">
            {[
              [isAr ? "وحدات مفعلة" : "Enabled modules", "18"],
              [isAr ? "نماذج مخصصة" : "Custom forms", "42"],
              [isAr ? "صلاحيات" : "Permissions", "96"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="font-semibold text-emerald-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { language, setLang, dir } = useLanguage();
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);

  return (
    <main dir={dir} className="min-h-screen bg-[#f6f3ed] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f6f3ed]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-40.png" alt="Rawafed" className="h-10 w-10 rounded-xl" />
            <div>
              <p className="text-base font-black tracking-tight">Rawafed</p>
              <p className="text-xs font-medium text-slate-500">{t("Saudi Business OS", "نظام تشغيل الأعمال السعودي")}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#verticals">{t("Verticals", "الأنشطة")}</a>
            <a href="#modules">{t("Modules", "الوحدات")}</a>
            <a href="#compliance">{t("Compliance", "الامتثال")}</a>
            <a href="#pricing">{t("Plans", "الباقات")}</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-300 bg-white/70"
              onClick={() => setLang(isAr ? "en" : "ar")}
            >
              <Languages className="h-4 w-4" />
              {isAr ? "EN" : "عربي"}
            </Button>
            <Button asChild size="sm" className="hidden bg-slate-950 text-white hover:bg-slate-800 sm:inline-flex">
              <Link to="/login">{t("Login", "دخول")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-24 lg:pt-16">
        <div className="flex flex-col justify-center">
          <Badge className="w-fit border-emerald-700/20 bg-emerald-700/10 px-3 py-1 text-emerald-800 hover:bg-emerald-700/10">
            {t("Arabic-first ERP, POS, CRM and HRMS for Saudi Arabia", "ERP وPOS وCRM وHRMS عربي أولا للسوق السعودي")}
          </Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t("One premium operating system for every Saudi business vertical.", "نظام تشغيلي احترافي لكل نشاط تجاري في السعودية.")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {t(
              "Rawafed lets a workshop, clinic, contractor, restaurant, hotel, school, factory or online seller select its activity and instantly receive the right dashboard, forms, routes, reports and Saudi compliance controls.",
              "Rawafed يجعل الورشة أو العيادة أو المقاول أو المطعم أو الفندق أو المدرسة أو المصنع أو المتجر الإلكتروني يختار نشاطه، ثم تظهر له لوحة العمل والنماذج والمسارات والتقارير والامتثال المناسب."
            )}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-slate-950 px-6 text-white hover:bg-slate-800">
              <Link to="/register" className="gap-2">
                {t("Start business setup", "ابدأ إعداد النشاط")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 border-slate-300 bg-white/70 px-6">
              <Link to="/app">{t("Open system preview", "فتح معاينة النظام")}</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {metrics.map((item) => (
              <div key={item.en} className="border-s-2 border-emerald-700 ps-4">
                <p className="text-2xl font-black text-slate-950">{item.value}</p>
                <p className="text-sm font-medium text-slate-600">{t(item.en, item.ar)}</p>
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview isAr={isAr} />
      </section>

      <section id="verticals" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">{t("Configured by activity", "مهيأ حسب النشاط")}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {t("A tenant sees only the tools it needs. Super admin sees everything.", "المستأجر يرى أدوات نشاطه فقط، والسوبر أدمن يرى كل شيء.")}
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {verticals.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.en} className="rounded-2xl border-slate-200 bg-[#fbfaf7] shadow-none transition hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-xl hover:shadow-slate-200/70">
                  <CardContent className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-slate-950">{t(item.en, item.ar)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{t(item.detailEn, item.detailAr)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">{t("Universal core", "النواة الموحدة")}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {t("One accounting, invoice, inventory and HR foundation behind every vertical.", "محاسبة وفواتير ومخزون ورواتب موحدة خلف كل نشاط.")}
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              {t(
                "Vertical screens can change, but finance, tax, permissions, audit logs and reports stay consistent across the whole platform.",
                "قد تختلف شاشات النشاط، لكن المالية والضريبة والصلاحيات وسجل التدقيق والتقارير تبقى موحدة في كل المنصة."
              )}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.en} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-slate-900">{t(item.en, item.ar)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="compliance" className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">
              <Lock className="me-2 h-3.5 w-3.5" />
              {t("Saudi compliance layer", "طبقة امتثال سعودية")}
            </Badge>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              {t("Built around VAT, ZATCA, payroll and branch control from day one.", "مصمم من البداية للضريبة والزكاة والرواتب والفروع.")}
            </h2>
          </div>
          <div className="space-y-4">
            {compliance.map((item) => (
              <div key={item.en} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                <p className="leading-7 text-slate-200">{t(item.en, item.ar)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">{t("Simple onboarding", "تهيئة سهلة")}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {t("From activity selection to a working dashboard in minutes.", "من اختيار النشاط إلى لوحة تشغيل جاهزة خلال دقائق.")}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {workflowSteps.map((step, index) => (
                <div key={step.en} className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm font-black text-emerald-700">0{index + 1}</p>
                  <p className="mt-3 min-h-12 font-bold leading-6">{t(step.en, step.ar)}</p>
                  <ChevronRight className="mt-4 h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-600">
              <Globe2 className="h-4 w-4 text-emerald-700" />
              {t("Arabic RTL and English LTR included", "يدعم العربية RTL والإنجليزية LTR")}
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              {t("Give every branch a serious system, not another spreadsheet.", "امنح كل فرع نظاما احترافيا بدل الجداول اليدوية.")}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-slate-950 px-6 text-white hover:bg-slate-800">
              <Link to="/register">{t("Create company", "إنشاء شركة")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 border-slate-300 px-6">
              <Link to="/login">{t("Login to dashboard", "الدخول للوحة التحكم")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
