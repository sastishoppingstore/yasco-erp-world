import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function DirectionProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.documentElement.style.setProperty('--direction', dir);
  }, [i18n.language]);

  return <>{children}</>;
}
