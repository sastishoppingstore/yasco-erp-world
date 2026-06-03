import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { LanguageProvider } from "@/providers/language"
import { CountryDetectionProvider, useCountryDetection } from "@/providers/country-detection"
import { useLanguage } from "@/providers/language"
import App from './App.tsx'

function CountryLanguageBridge() {
  const { selectedCountry, language: detectedLanguage, isRtl } = useCountryDetection();
  const { language, setLang } = useLanguage();
  const initialSync = useRef(true);

  useEffect(() => {
    if (initialSync.current) {
      initialSync.current = false;
      const nextLanguage = isRtl || detectedLanguage === "ar" ? "ar" : "en";
      if (language !== nextLanguage) {
        setLang(nextLanguage);
      }
    }
  }, [selectedCountry, detectedLanguage, isRtl]);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CountryDetectionProvider>
          <CountryLanguageBridge />
          <TRPCProvider>
            <App />
          </TRPCProvider>
        </CountryDetectionProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
