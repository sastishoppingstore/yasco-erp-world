/**
 * VoiceCommandButton — Gemini AI + Web Speech API
 * 
 * آواز سنتا ہے → Gemini سے intent سمجھتا ہے → navigate/action کرتا ہے
 * 
 * مثال آوازی حکم:
 *   "Show me invoices"          → /app/sales/invoices
 *   "فواتیر دکھاؤ"               → /app/sales/invoices
 *   "Open dashboard"            → /app
 *   "New customer"              → /app/sales/customers
 *   "Go to reports"             → /app/reports
 *   "Total sales today"         → AI assistant سے جواب
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mic, MicOff, X, Sparkles, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language";
import { trpc } from "@/providers/trpc";

/* ── Navigation Map ──────────────────────────────────────── */
const NAV_MAP: Array<{ keywords: string[]; path: string; label: string; labelAr: string; labelUr: string }> = [
  { keywords: ["dashboard", "home", "main", "لوحة", "لوحة التحكم", "ہوم", "ڈیش بورڈ", "مین"], path: "/app", label: "Dashboard", labelAr: "لوحة التحكم", labelUr: "ڈیش بورڈ" },
  { keywords: ["invoice", "invoices", "فاتورة", "فواتير", "فاتورے", "فواتیر", "billing"], path: "/app/sales/invoices", label: "Invoices", labelAr: "الفواتير", labelUr: "فواتیر" },
  { keywords: ["customer", "customers", "client", "عميل", "عملاء", "کسٹمر", "گاہک"], path: "/app/sales/customers", label: "Customers", labelAr: "العملاء", labelUr: "گاہک" },
  { keywords: ["product", "products", "item", "صنف", "أصناف", "پروڈکٹ", "مصنوعات", "inventory"], path: "/app/inventory/products", label: "Products", labelAr: "الأصناف", labelUr: "مصنوعات" },
  { keywords: ["sales", "sale", "مبيعات", "سیلز", "فروخت"], path: "/app/sales", label: "Sales", labelAr: "المبيعات", labelUr: "فروخت" },
  { keywords: ["purchase", "purchasing", "مشتريات", "خرید", "پرچیز"], path: "/app/purchase/orders", label: "Purchase Orders", labelAr: "أوامر الشراء", labelUr: "خریداری" },
  { keywords: ["supplier", "suppliers", "vendor", "مورد", "موردين", "سپلائر"], path: "/app/purchase/suppliers", label: "Suppliers", labelAr: "الموردون", labelUr: "سپلائر" },
  { keywords: ["employee", "employees", "hr", "staff", "موظف", "موظفون", "ملازم", "ملازمین"], path: "/app/hrm/employees", label: "Employees", labelAr: "الموظفون", labelUr: "ملازمین" },
  { keywords: ["payroll", "salary", "salaries", "راتب", "رواتب", "تنخواہ"], path: "/app/hrm/payroll", label: "Payroll", labelAr: "الرواتب", labelUr: "تنخواہ" },
  { keywords: ["attendance", "حضور", "حاضری"], path: "/app/hrm/attendance", label: "Attendance", labelAr: "الحضور", labelUr: "حاضری" },
  { keywords: ["leave", "leaves", "vacation", "إجازة", "إجازات", "چھٹی", "رخصت"], path: "/app/hrm/leave", label: "Leave", labelAr: "الإجازات", labelUr: "چھٹی" },
  { keywords: ["report", "reports", "تقرير", "تقارير", "رپورٹ", "رپورٹس"], path: "/app/reports", label: "Reports", labelAr: "التقارير", labelUr: "رپورٹس" },
  { keywords: ["accounting", "accounts", "محاسبة", "حساب", "اکاؤنٹنگ"], path: "/app/accounting", label: "Accounting", labelAr: "المحاسبة", labelUr: "اکاؤنٹنگ" },
  { keywords: ["journal", "قيد", "قیود", "جرنل"], path: "/app/accounting/journal-entries", label: "Journal Entries", labelAr: "القيود اليومية", labelUr: "جرنل اندراجات" },
  { keywords: ["project", "projects", "مشروع", "مشاريع", "پروجیکٹ"], path: "/app/projects/list", label: "Projects", labelAr: "المشاريع", labelUr: "پروجیکٹ" },
  { keywords: ["task", "tasks", "مهام", "مهمة", "ٹاسک", "کام"], path: "/app/projects/tasks", label: "Tasks", labelAr: "المهام", labelUr: "کام" },
  { keywords: ["pos", "point of sale", "نقطة البيع", "پی او ایس", "سیلز کاؤنٹر"], path: "/app/pos", label: "POS", labelAr: "نقطة البيع", labelUr: "پی او ایس" },
  { keywords: ["stock", "warehouse", "مخزون", "مستودع", "گودام", "اسٹاک"], path: "/app/inventory/stock", label: "Stock", labelAr: "المخزون", labelUr: "اسٹاک" },
  { keywords: ["setting", "settings", "إعدادات", "سیٹنگ", "ترتیبات"], path: "/app/settings", label: "Settings", labelAr: "الإعدادات", labelUr: "ترتیبات" },
  { keywords: ["helpdesk", "support", "ticket", "tickets", "دعم", "تذاکر", "سپورٹ"], path: "/app/helpdesk/tickets", label: "Help Desk", labelAr: "الدعم الفني", labelUr: "سپورٹ" },
  { keywords: ["cashbox", "cash", "صندوق", "نقدية", "کیش", "صندوق"], path: "/app/cashbox", label: "Cashbox", labelAr: "الصندوق", labelUr: "کیش باکس" },
  { keywords: ["quotation", "quotations", "quote", "عرض سعر", "عروض أسعار", "کوٹیشن"], path: "/app/sales/quotations", label: "Quotations", labelAr: "عروض الأسعار", labelUr: "کوٹیشن" },
  { keywords: ["crm", "lead", "leads", "opportunity", "عميل محتمل", "لیڈ"], path: "/app/crm/leads", label: "Leads", labelAr: "العملاء المحتملون", labelUr: "لیڈ" },
  { keywords: ["zatca", "vat", "tax", "زكاة", "ضريبة", "ٹیکس", "زکوۃ"], path: "/app/reports/zatca-dashboard", label: "ZATCA Dashboard", labelAr: "لوحة ZATCA", labelUr: "ZATCA" },
  { keywords: ["setup", "wizard", "معالج", "سیٹ اپ", "راہنمائی"], path: "/app/setup-wizard", label: "Setup Wizard", labelAr: "معالج الإعداد", labelUr: "راہنمائی" },
];

function matchNavigationIntent(text: string): typeof NAV_MAP[0] | null {
  const lower = text.toLowerCase();
  for (const entry of NAV_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return entry;
    }
  }
  return null;
}

/* ── Types ───────────────────────────────────────────────── */
interface VoiceResult {
  type: "navigate" | "query" | "error" | "unknown";
  transcript: string;
  destination?: string;
  destLabel?: string;
  aiResponse?: string;
}

/* ── Main Component ──────────────────────────────────────── */
export function VoiceCommandButton() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string>("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const askAI = trpc.aiAssistant.ask.useMutation();

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) setSupported(false);
  }, []);

  const clearResult = useCallback(() => {
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => setResult(null), 5000);
  }, []);

  const processTranscript = useCallback(async (transcript: string) => {
    setProcessing(true);
    setResult(null);

    // 1. Try local navigation matching first (instant)
    const navMatch = matchNavigationIntent(transcript);
    if (navMatch) {
      const res: VoiceResult = {
        type: "navigate",
        transcript,
        destination: navMatch.path,
        destLabel: rtl ? navMatch.labelAr : navMatch.label,
      };
      setResult(res);
      setProcessing(false);
      clearResult();
      setTimeout(() => navigate(navMatch.path), 800);
      return;
    }

    // 2. Fallback to AI assistant query
    try {
      const data = await askAI.mutateAsync({ query: transcript });
      setResult({
        type: "query",
        transcript,
        aiResponse: data?.response || (rtl ? "لا توجد إجابة" : "No answer available"),
      });
    } catch {
      setResult({
        type: "error",
        transcript,
        aiResponse: rtl ? "حدث خطأ في الاستجواب" : "Could not process your request",
      });
    }
    setProcessing(false);
    clearResult();
  }, [navigate, rtl, askAI, clearResult]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(rtl ? "المتصفح لا يدعم التعرف على الصوت" : "Voice recognition not supported in this browser");
      return;
    }

    setError("");
    setResult(null);

    const recognition = new SpeechRecognition();
    recognition.lang = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      if (event.error === "no-speech") {
        setError(rtl ? "لم يُسمع أي صوت" : "No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        setError(rtl ? "لم يُمنح إذن الميكروفون" : "Microphone access denied. Please allow microphone.");
      } else {
        setError(rtl ? "خطأ في التعرف على الصوت" : `Voice error: ${event.error}`);
      }
    };

    recognition.start();
  }, [language, rtl, processTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const handleClick = useCallback(() => {
    if (listening) stopListening();
    else startListening();
  }, [listening, startListening, stopListening]);

  if (!supported) return null;

  return (
    <>
      {/* ── Floating Voice Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Result / Status Card */}
        {(result || processing || error) && (
          <div className="voice-float-btn w-72 rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-md shadow-2xl p-4 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  {rtl ? "الأمر الصوتي" : "Voice Command"}
                </span>
              </div>
              <button
                onClick={() => { setResult(null); setError(""); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Transcript */}
            {result?.transcript && (
              <p className="text-[11px] text-slate-400 mb-2 italic">
                "{result.transcript}"
              </p>
            )}

            {/* Processing */}
            {processing && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="flex items-end gap-0.5 h-5 text-emerald-400">
                  <span className="voice-bar" />
                  <span className="voice-bar" />
                  <span className="voice-bar" />
                  <span className="voice-bar" />
                </div>
                <span>{rtl ? "جاري المعالجة..." : "Processing..."}</span>
              </div>
            )}

            {/* Navigate result */}
            {result?.type === "navigate" && result.destLabel && (
              <div className="flex items-center gap-2 text-sm">
                <ChevronRight className="size-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">
                  {rtl ? `جاري الانتقال إلى: ${result.destLabel}` : `Navigating to: ${result.destLabel}`}
                </span>
              </div>
            )}

            {/* AI query result */}
            {result?.type === "query" && result.aiResponse && (
              <p className="text-sm text-slate-200 leading-relaxed">
                {result.aiResponse}
              </p>
            )}

            {/* Error */}
            {(result?.type === "error" || error) && (
              <div className="flex items-start gap-2 text-sm text-red-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error || result?.aiResponse}</span>
              </div>
            )}
          </div>
        )}

        {/* Listening indicator */}
        {listening && !result && (
          <div className="voice-float-btn bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
            <div className="flex items-end gap-0.5 h-5 text-emerald-400">
              <span className="voice-bar" />
              <span className="voice-bar" />
              <span className="voice-bar" />
              <span className="voice-bar" />
            </div>
            <span className="text-sm text-emerald-300 font-medium">
              {rtl ? "جاري الاستماع..." : "Listening..."}
            </span>
          </div>
        )}

        {/* Main mic button */}
        <button
          onClick={handleClick}
          aria-label={listening ? "Stop listening" : "Start voice command"}
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
            "focus:outline-none focus:ring-4 focus:ring-emerald-500/50",
            listening
              ? "bg-red-500 text-white voice-listening"
              : processing
                ? "bg-emerald-700 text-white cursor-wait"
                : "bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95"
          )}
        >
          {listening && (
            <span className="voice-ripple text-red-400 pointer-events-none" />
          )}
          {listening
            ? <MicOff className="size-6 relative z-10" />
            : <Mic className="size-6 relative z-10" />
          }
        </button>

        {/* Label */}
        <span className={cn(
          "text-[10px] font-medium text-center px-2 py-0.5 rounded-full",
          listening ? "bg-red-500/20 text-red-400" : "bg-slate-800/80 text-slate-400"
        )}>
          {listening
            ? (rtl ? "اضغط للإيقاف" : "Tap to stop")
            : (rtl ? "أمر صوتي" : "Voice")
          }
        </span>
      </div>
    </>
  );
}

/* ── Voice Button for AppLayout header ───────────────────── */
export function VoiceCommandHeaderButton() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  const askAI = trpc.aiAssistant.ask.useMutation();

  const processTranscript = useCallback(async (transcript: string) => {
    setStatus(rtl ? "جاري المعالجة..." : "Processing...");
    const navMatch = matchNavigationIntent(transcript);
    if (navMatch) {
      const label = rtl ? navMatch.labelAr : navMatch.label;
      setStatus(`→ ${label}`);
      setTimeout(() => { navigate(navMatch.path); setStatus(""); }, 700);
      return;
    }
    try {
      const data = await askAI.mutateAsync({ query: transcript });
      setStatus(data?.response?.slice(0, 80) || "Done");
      setTimeout(() => setStatus(""), 4000);
    } catch {
      setStatus(rtl ? "خطأ" : "Error");
      setTimeout(() => setStatus(""), 2000);
    }
  }, [navigate, rtl, askAI]);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setStatus("Not supported"); return; }
    const rec = new SpeechRecognition();
    rec.lang = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => processTranscript(e.results[0][0].transcript);
    rec.onerror = () => { setListening(false); setStatus("Error"); };
    rec.start();
    recognitionRef.current = rec;
  }, [listening, language, processTranscript]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        aria-label={listening ? "Stop voice" : "Voice command"}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-200",
          "w-9 h-9 border",
          listening
            ? "bg-red-500/20 border-red-400/50 text-red-300 voice-listening"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        )}
      >
        {listening && <span className="voice-ripple text-red-400 pointer-events-none" />}
        {listening ? <MicOff className="size-4 relative z-10" /> : <Mic className="size-4 relative z-10" />}
      </button>
      {status && (
        <span className="text-xs text-emerald-200 max-w-32 truncate hidden md:block">
          {status}
        </span>
      )}
    </div>
  );
}
