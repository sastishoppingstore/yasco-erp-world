import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCountryDetection } from "@/providers/country-detection";
import { useLanguage } from "@/providers/language";
import { cn } from "@/lib/utils";
import { Globe, MapPin, X, Check } from "lucide-react";

const STORAGE_KEY = "country-banner-dismissed";

export function CountryDetectionBanner() {
  const {
    country,
    detectedCountry,
    countries = [],
    changeCountry,
    dismiss,
  } = useCountryDetection();

  const { dir } = useLanguage();
  const isRtl = dir === "rtl";

  const [dismissed, setDismissed] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [visible, setVisible] = useState(false);

  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== "true") {
      setDismissed(false);
      requestAnimationFrame(() => setVisible(true));
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setAnimatingOut(true);
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      setAnimatingOut(false);
      localStorage.setItem(STORAGE_KEY, "true");
      dismiss?.();
    }, 300);
  }, [dismiss]);

  const handleKeepSettings = useCallback(() => {
    handleDismiss();
  }, [handleDismiss]);

  const handleCountrySelect = useCallback(
    (c: (typeof countries)[number]) => {
      changeCountry?.(c);
      setShowSelector(false);
      handleDismiss();
    },
    [changeCountry, handleDismiss]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowSelector(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowSelector(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const currentCountry = country || detectedCountry;

  if (dismissed && !animatingOut) return null;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
          to { transform: translateY(0); opacity: 1; max-height: 200px; }
        }
        @keyframes slideUp {
          from { transform: translateY(0); opacity: 1; max-height: 200px; }
          to { transform: translateY(-100%); opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
        }
      `}</style>
      <div
        dir={dir}
        className={cn(
          "relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 text-white shadow-md",
          animatingOut || !visible
            ? "animate-[slideUp_300ms_ease-in_forwards]"
            : "animate-[slideDown_400ms_ease-out]"
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <MapPin className="size-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {currentCountry?.flag && (
                    <span className="text-base leading-none">{currentCountry.flag}</span>
                  )}
                  <span>{currentCountry?.name || "Unknown"}</span>
                </span>
                <Badge
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white text-[11px] px-2 py-0"
                >
                  <Globe className="mr-1 size-3" />
                  {isRtl ? "تم الكشف" : "Detected"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-emerald-50/90 leading-relaxed">
                {isRtl
                  ? `تم ضبط اللغة والعملة والمنطقة الزمنية وقواعد الضرائب حسب منطقتك. يمكنك تغيير ذلك في أي وقت.`
                  : `We detected your region as ${currentCountry?.name || "your current location"}. Language, currency, timezone, and tax rules have been adjusted. You can change this anytime.`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <Button
                ref={triggerRef}
                variant="secondary"
                size="sm"
                onClick={() => setShowSelector((prev) => !prev)}
                className="bg-white/15 text-white hover:bg-white/25 hover:text-white border-0"
              >
                <Globe className="size-3.5" />
                <span>{isRtl ? "تغيير الدولة" : "Change Country"}</span>
              </Button>

              {showSelector && (
                <div
                  ref={selectorRef}
                  className={cn(
                    "absolute bottom-full left-0 z-50 mb-2 w-72 rounded-lg border border-emerald-400/30 bg-white p-3 shadow-xl",
                    isRtl && "left-auto right-0"
                  )}
                >
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    {isRtl ? "اختر دولتك" : "Select your country"}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {countries.map((c) => {
                      const isActive = c.code === currentCountry?.code;
                      return (
                        <button
                          key={c.code}
                          onClick={() => handleCountrySelect(c)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <span className="text-base leading-none">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                          {isActive && <Check className="mr-auto size-3 shrink-0 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleKeepSettings}
              className="text-white/80 hover:text-white hover:bg-white/10 border-0"
            >
              {isRtl ? "احتفاظ" : "Keep Settings"}
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDismiss}
              aria-label={isRtl ? "إغلاق" : "Dismiss"}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
