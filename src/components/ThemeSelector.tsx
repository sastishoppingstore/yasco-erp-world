import { useTheme, themes, type ThemeName } from "@/providers/theme";
import { useLanguage } from "@/providers/language";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export default function ThemeSelector() {
  const { themeName, setTheme } = useTheme();
  const { language } = useLanguage();
  const rtl = language === "ar";

  return (
    <div className="flex flex-wrap gap-3" dir={rtl ? "rtl" : "ltr"}>
      {(Object.keys(themes) as ThemeName[]).map((name) => {
        const t = themes[name];
        const isActive = themeName === name;
        return (
          <button
            key={name}
            onClick={() => setTheme(name)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 min-w-[90px]",
              isActive
                ? "border-current shadow-lg"
                : "border-white/10 hover:border-white/30",
            )}
            style={{ borderColor: isActive ? t.primary : undefined }}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-transform",
                isActive && "scale-110",
              )}
              style={{ background: `linear-gradient(135deg, ${t.primaryLight}, ${t.primaryDark})` }}
            >
              {isActive && <Check className="h-4 w-4 text-white" />}
            </div>
            <span className="text-xs font-medium text-white/80">
              {language === "ar" ? t.labelAr : t.label}
            </span>
            {isActive && (
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                style={{ background: t.primary }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
