import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setLanguage, t } from "@/lib/i18n";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLang: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("language") as Language | null;
      if (saved === "ar" || saved === "en") return saved;
    }
    if (typeof navigator !== "undefined") {
      const lang = navigator.language?.startsWith("ar") ? "ar" : "en";
      return lang as Language;
    }
    return "en";
  });

  useEffect(() => {
    setLanguage(language);
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLang = (lang: Language) => {
    setLangState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLang,
        t: (key: string) => t(key, language),
        dir: language === "ar" ? "rtl" : "ltr",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
