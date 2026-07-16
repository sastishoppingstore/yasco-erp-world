import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { setLanguage } from "@/lib/i18n";

type RtlLanguages = "ar" | "ur" | "dv" | "he" | "ku" | "fa" | "ps" | "sd" | "ug" | "yi";

const rtlSet = new Set<string>(["ar", "ur", "dv", "he", "ku", "fa", "ps", "sd", "ug", "yi"]);

function isRtlLang(lang: string): boolean {
  const base = lang.split("-")[0];
  return rtlSet.has(base);
}

interface CountryInfo {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  dialCode: string;
}

interface LocalizationProfile {
  language: string;
  languageAr: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  isRtl: boolean;
}

const countries: CountryInfo[] = [
  { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية", flag: "🇸🇦", dialCode: "966" },
  { code: "PK", name: "Pakistan", nameAr: "باكستان", flag: "🇵🇰", dialCode: "92" },
  { code: "AE", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", flag: "🇦🇪", dialCode: "971" },
  { code: "QA", name: "Qatar", nameAr: "قطر", flag: "🇶🇦", dialCode: "974" },
  { code: "OM", name: "Oman", nameAr: "عمان", flag: "🇴🇲", dialCode: "968" },
  { code: "BH", name: "Bahrain", nameAr: "البحرين", flag: "🇧🇭", dialCode: "973" },
  { code: "KW", name: "Kuwait", nameAr: "الكويت", flag: "🇰🇼", dialCode: "965" },
  { code: "IN", name: "India", nameAr: "الهند", flag: "🇮🇳", dialCode: "91" },
  { code: "BD", name: "Bangladesh", nameAr: "بنغلاديش", flag: "🇧🇩", dialCode: "880" },
  { code: "GB", name: "United Kingdom", nameAr: "المملكة المتحدة", flag: "🇬🇧", dialCode: "44" },
  { code: "DE", name: "Germany", nameAr: "ألمانيا", flag: "🇩🇪", dialCode: "49" },
  { code: "FR", name: "France", nameAr: "فرنسا", flag: "🇫🇷", dialCode: "33" },
  { code: "US", name: "United States", nameAr: "الولايات المتحدة", flag: "🇺🇸", dialCode: "1" },
  { code: "CA", name: "Canada", nameAr: "كندا", flag: "🇨🇦", dialCode: "1" },
  { code: "AU", name: "Australia", nameAr: "أستراليا", flag: "🇦🇺", dialCode: "61" },
  { code: "TR", name: "Turkey", nameAr: "تركيا", flag: "🇹🇷", dialCode: "90" },
  { code: "EG", name: "Egypt", nameAr: "مصر", flag: "🇪🇬", dialCode: "20" },
  { code: "MY", name: "Malaysia", nameAr: "ماليزيا", flag: "🇲🇾", dialCode: "60" },
  { code: "ID", name: "Indonesia", nameAr: "إندونيسيا", flag: "🇮🇩", dialCode: "62" },
  { code: "ZA", name: "South Africa", nameAr: "جنوب أفريقيا", flag: "🇿🇦", dialCode: "27" },
  { code: "NG", name: "Nigeria", nameAr: "نيجيريا", flag: "🇳🇬", dialCode: "234" },
];

const localizationProfiles: Record<string, LocalizationProfile> = {
  SA: { language: "ar", languageAr: "العربية", currency: "SAR", currencySymbol: "﷼", timezone: "Asia/Riyadh", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: true },
  PK: { language: "ur", languageAr: "الأردية", currency: "PKR", currencySymbol: "₨", timezone: "Asia/Karachi", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  AE: { language: "ar", languageAr: "العربية", currency: "AED", currencySymbol: "د.إ", timezone: "Asia/Dubai", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: true },
  QA: { language: "ar", languageAr: "العربية", currency: "QAR", currencySymbol: "﷼", timezone: "Asia/Qatar", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: true },
  OM: { language: "ar", languageAr: "العربية", currency: "OMR", currencySymbol: "﷼", timezone: "Asia/Muscat", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.000", isRtl: true },
  BH: { language: "ar", languageAr: "العربية", currency: "BHD", currencySymbol: "د.ب", timezone: "Asia/Bahrain", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.000", isRtl: true },
  KW: { language: "ar", languageAr: "العربية", currency: "KWD", currencySymbol: "د.ك", timezone: "Asia/Kuwait", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.000", isRtl: true },
  IN: { language: "hi", languageAr: "الهندية", currency: "INR", currencySymbol: "₹", timezone: "Asia/Kolkata", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  BD: { language: "bn", languageAr: "البنغالية", currency: "BDT", currencySymbol: "৳", timezone: "Asia/Dhaka", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  GB: { language: "en", languageAr: "الإنجليزية", currency: "GBP", currencySymbol: "£", timezone: "Europe/London", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  DE: { language: "de", languageAr: "الألمانية", currency: "EUR", currencySymbol: "€", timezone: "Europe/Berlin", dateFormat: "DD.MM.YYYY", numberFormat: "#,##0.00", isRtl: false },
  FR: { language: "fr", languageAr: "الفرنسية", currency: "EUR", currencySymbol: "€", timezone: "Europe/Paris", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  US: { language: "en", languageAr: "الإنجليزية", currency: "USD", currencySymbol: "$", timezone: "America/New_York", dateFormat: "MM/DD/YYYY", numberFormat: "#,##0.00", isRtl: false },
  CA: { language: "en", languageAr: "الإنجليزية", currency: "CAD", currencySymbol: "$", timezone: "America/Toronto", dateFormat: "YYYY-MM-DD", numberFormat: "#,##0.00", isRtl: false },
  AU: { language: "en", languageAr: "الإنجليزية", currency: "AUD", currencySymbol: "$", timezone: "Australia/Sydney", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  TR: { language: "tr", languageAr: "التركية", currency: "TRY", currencySymbol: "₺", timezone: "Europe/Istanbul", dateFormat: "DD.MM.YYYY", numberFormat: "#,##0.00", isRtl: false },
  EG: { language: "ar", languageAr: "العربية", currency: "EGP", currencySymbol: "E£", timezone: "Africa/Cairo", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: true },
  MY: { language: "ms", languageAr: "الملايوية", currency: "MYR", currencySymbol: "RM", timezone: "Asia/Kuala_Lumpur", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  ID: { language: "id", languageAr: "الإندونيسية", currency: "IDR", currencySymbol: "Rp", timezone: "Asia/Jakarta", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
  ZA: { language: "en", languageAr: "الإنجليزية", currency: "ZAR", currencySymbol: "R", timezone: "Africa/Johannesburg", dateFormat: "YYYY/MM/DD", numberFormat: "#,##0.00", isRtl: false },
  NG: { language: "en", languageAr: "الإنجليزية", currency: "NGN", currencySymbol: "₦", timezone: "Africa/Lagos", dateFormat: "DD/MM/YYYY", numberFormat: "#,##0.00", isRtl: false },
};

const timezoneToCountry: Record<string, string> = {
  "Asia/Riyadh": "SA",
  "Asia/Karachi": "PK",
  "Asia/Dubai": "AE",
  "Asia/Qatar": "QA",
  "Asia/Muscat": "OM",
  "Asia/Bahrain": "BH",
  "Asia/Kuwait": "KW",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Dhaka": "BD",
  "Europe/London": "GB",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Europe/Istanbul": "TR",
  "Asia/Istanbul": "TR",
  "Africa/Cairo": "EG",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Jakarta": "ID",
  "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG",
  "America/Sao_Paulo": "BR",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Singapore": "SG",
  "Asia/Bangkok": "TH",
  "Asia/Manila": "PH",
  "Asia/Tehran": "IR",
  "Asia/Baghdad": "IQ",
  "Asia/Amman": "JO",
  "Asia/Beirut": "LB",
  "Asia/Damascus": "SY",
  "Asia/Jerusalem": "IL",
  "Europe/Moscow": "RU",
  "Europe/Amsterdam": "NL",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Athens": "GR",
  "Europe/Lisbon": "PT",
  "Europe/Dublin": "IE",
  "Europe/Vienna": "AT",
  "Europe/Brussels": "BE",
  "Europe/Zurich": "CH",
  "Pacific/Auckland": "NZ",
  "America/Mexico_City": "MX",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Bogota": "CO",
  "America/Lima": "PE",
};

const navLangToCountry: Record<string, string> = {
  "ar-SA": "SA", "ar-AE": "AE", "ar-QA": "QA", "ar-OM": "OM",
  "ar-BH": "BH", "ar-KW": "KW", "ar-EG": "EG",
  "ur-PK": "PK", "hi-IN": "IN", "bn-BD": "BD", "tr-TR": "TR",
  "ms-MY": "MY", "id-ID": "ID", "de-DE": "DE", "fr-FR": "FR",
};

function detectCountry(): { countryCode: string; source: "timezone" | "lang" | "default" } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && timezoneToCountry[tz]) {
      return { countryCode: timezoneToCountry[tz], source: "timezone" };
    }
  } catch {}

  try {
    const navLang = navigator.language;
    if (navLang && navLangToCountry[navLang]) {
      return { countryCode: navLangToCountry[navLang], source: "lang" };
    }
  } catch {}

  return { countryCode: "US", source: "default" };
}

function detectLanguage(countryCode: string): string {
  const profile = localizationProfiles[countryCode];
  if (profile) return profile.language;

  try {
    const navLang = navigator.language;
    if (navLang) return navLang.split("-")[0];
  } catch {}

  return "en";
}

function getProfile(countryCode: string): LocalizationProfile {
  return localizationProfiles[countryCode] ?? localizationProfiles["US"];
}

function getCurrencySymbol(currencyCode: string, countryCode: string): string {
  const selectedProfile = getProfile(countryCode);
  if (selectedProfile.currency === currencyCode) return selectedProfile.currencySymbol;
  const matchedProfile = Object.values(localizationProfiles).find((profile) => profile.currency === currencyCode);
  return matchedProfile?.currencySymbol ?? currencyCode;
}

function applyCountryProfile(
  countryCode: string,
  setters: {
    setDetectedCountry?: (code: string) => void;
    setSelectedCountryState: (code: string) => void;
    setLanguageState: (language: string) => void;
    setCurrencyState: (currency: string) => void;
    setTimezoneState: (timezone: string) => void;
    setTaxProfileState: (profile: string) => void;
    setDetectionBannerVisible?: (visible: boolean) => void;
  },
  timezoneOverride?: string,
) {
  const profile = getProfile(countryCode);
  setters.setDetectedCountry?.(countryCode);
  setters.setSelectedCountryState(countryCode);
  setters.setLanguageState(profile.language);
  setters.setCurrencyState(profile.currency);
  setters.setTimezoneState(timezoneOverride || profile.timezone);
  setters.setTaxProfileState(countryCode);
  setters.setDetectionBannerVisible?.(true);
}

const LS_PREFIX = "country_detection_";

interface PersistedOverrides {
  selectedCountry?: string;
  language?: string;
  currency?: string;
  timezone?: string;
  taxProfile?: string;
}

function loadOverrides(): PersistedOverrides {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}overrides`);
    if (raw) return JSON.parse(raw) as PersistedOverrides;
  } catch {}
  return {};
}

function saveOverrides(overrides: PersistedOverrides) {
  try {
    localStorage.setItem(`${LS_PREFIX}overrides`, JSON.stringify(overrides));
  } catch {}
}

interface CountryDetectionContextType {
  detectedCountry: string;
  selectedCountry: string;
  country: CountryInfo | null;
  countryName: string;
  countryFlag: string;
  language: string;
  setLanguage: (lang: string) => void;
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  taxProfile: string;
  setTaxProfile: (profile: string) => void;
  isRtl: boolean;
  dateFormat: string;
  numberFormat: string;
  detectionBannerVisible: boolean;
  dismissBanner: () => void;
  dismiss: () => void;
  resetDetection: () => void;
  setCountry: (code: string) => void;
  changeCountry: (c: CountryInfo) => void;
  availableCountries: Array<CountryInfo>;
  countries: Array<CountryInfo>;
}

const CountryDetectionContext = createContext<CountryDetectionContextType>({
  detectedCountry: "US",
  selectedCountry: "US",
  country: null,
  countryName: "United States",
  countryFlag: "🇺🇸",
  language: "en",
  setLanguage: () => {},
  currency: "USD",
  currencySymbol: "$",
  setCurrency: () => {},
  timezone: "America/New_York",
  setTimezone: () => {},
  taxProfile: "US",
  setTaxProfile: () => {},
  isRtl: false,
  dateFormat: "MM/DD/YYYY",
  numberFormat: "#,##0.00",
  detectionBannerVisible: true,
  dismissBanner: () => {},
  dismiss: () => {},
  resetDetection: () => {},
  setCountry: () => {},
  changeCountry: () => {},
  availableCountries: countries,
  countries: countries,
});

export function CountryDetectionProvider({ children }: { children: ReactNode }) {
  const overrides = loadOverrides();
  const initialDetection = typeof window !== "undefined" ? detectCountry() : { countryCode: "US", source: "default" as const };

  const [detectedCountry, setDetectedCountry] = useState(initialDetection.countryCode);
  const [selectedCountry, setSelectedCountryState] = useState(overrides.selectedCountry ?? initialDetection.countryCode);
  const [language, setLanguageState] = useState(overrides.language ?? detectLanguage(initialDetection.countryCode));
  const [currency, setCurrencyState] = useState(overrides.currency ?? getProfile(initialDetection.countryCode).currency);
  const [timezone, setTimezoneState] = useState(overrides.timezone ?? getProfile(initialDetection.countryCode).timezone);
  const [taxProfile, setTaxProfileState] = useState(overrides.taxProfile ?? initialDetection.countryCode);
  const [detectionBannerVisible, setDetectionBannerVisible] = useState(
    initialDetection.source !== "default" && !overrides.selectedCountry
  );

  // IP/edge-based detection hook. IP is only a suggestion; legal tax country
  // still comes from company, branch, invoice place of supply, and admin confirmation.
  useEffect(() => {
    if (overrides.selectedCountry) return; // User already made a choice
    const fetchIpData = async () => {
      try {
        const edgeRes = await fetch("/api/localization/detect");
        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          if (edgeData?.countryCode) {
            applyCountryProfile(edgeData.countryCode, {
              setDetectedCountry,
              setSelectedCountryState,
              setLanguageState,
              setCurrencyState,
              setTimezoneState,
              setTaxProfileState,
              setDetectionBannerVisible,
            });
            return;
          }
        }

        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data?.country_code) {
            applyCountryProfile(data.country_code, {
              setDetectedCountry,
              setSelectedCountryState,
              setLanguageState,
              setCurrencyState,
              setTimezoneState,
              setTaxProfileState,
              setDetectionBannerVisible,
            }, data.timezone);
          }
        }
      } catch (err) {
        console.error("IP detection failed, falling back to timezone", err);
      }
    };
    fetchIpData();
  }, [overrides.selectedCountry]);


  useEffect(() => {
    setLanguage(language);
    if (isRtlLang(language)) {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    saveOverrides({
      selectedCountry: selectedCountry !== detectedCountry ? selectedCountry : undefined,
      language: language !== detectLanguage(detectedCountry) ? language : undefined,
      currency,
      timezone,
      taxProfile: taxProfile !== detectedCountry ? taxProfile : undefined,
    });
  }, [selectedCountry, language, currency, timezone, taxProfile, detectedCountry]);

  const profile = getProfile(selectedCountry);

  const setCountry = useCallback((code: string) => {
    applyCountryProfile(code, {
      setSelectedCountryState,
      setLanguageState,
      setCurrencyState,
      setTimezoneState,
      setTaxProfileState,
    });
    setDetectionBannerVisible(false);
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
  }, []);

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
  }, []);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
  }, []);

  const setTaxProfile = useCallback((p: string) => {
    setTaxProfileState(p);
  }, []);

  const dismissBanner = useCallback(() => {
    setDetectionBannerVisible(false);
    saveOverrides({
      selectedCountry,
      language,
      currency,
      timezone,
      taxProfile,
    });
  }, [selectedCountry, language, currency, timezone, taxProfile]);

  const resetDetection = useCallback(() => {
    const d = detectCountry();
    setDetectedCountry(d.countryCode);
    setSelectedCountryState(d.countryCode);
    const p = getProfile(d.countryCode);
    setLanguageState(p.language);
    setCurrencyState(p.currency);
    setTimezoneState(p.timezone);
    setTaxProfileState(d.countryCode);
    setDetectionBannerVisible(true);
    try {
      localStorage.removeItem(`${LS_PREFIX}overrides`);
    } catch {}
  }, []);

  const countryInfo = countries.find((c) => c.code === selectedCountry) ?? countries.find((c) => c.code === "US")!;

  const value: CountryDetectionContextType = {
    detectedCountry,
    selectedCountry,
    country: countryInfo,
    countryName: countryInfo.name,
    countryFlag: countryInfo.flag,
    language,
    setLanguage,
    currency,
    currencySymbol: getCurrencySymbol(currency, selectedCountry),
    setCurrency,
    timezone,
    setTimezone,
    taxProfile,
    setTaxProfile,
    isRtl: profile.isRtl || isRtlLang(language),
    dateFormat: profile.dateFormat,
    numberFormat: profile.numberFormat,
    detectionBannerVisible,
    dismissBanner,
    dismiss: dismissBanner,
    resetDetection,
    setCountry,
    changeCountry: (c: CountryInfo) => setCountry(c.code),
    availableCountries: countries,
    countries: countries,
  };

  return (
    <CountryDetectionContext.Provider value={value}>
      {children}
    </CountryDetectionContext.Provider>
  );
}

export const useCountryDetection = () => useContext(CountryDetectionContext);
