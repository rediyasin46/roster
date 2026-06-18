import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18nData from '../../i18n.json';

export type SupportedLang = 'en' | 'am' | 'om' | 'ti' | 'so' | 'si';

// Recursive deep-get helper: t('nav.home') → string
function deepGet(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj) as string ?? path;
}

interface LanguageContextType {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: (key: string) => string;
  tRaw: <T = unknown>(key: string) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'rosterbook-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SupportedLang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
      if (saved && saved in i18nData) return saved;
    }
    return 'en';
  });

  const setLang = (newLang: SupportedLang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  // Returns translated string; falls back to English, then the key itself
  const t = (key: string): string => {
    const translations = i18nData[lang] as Record<string, unknown>;
    const result = deepGet(translations, key);
    if (result && result !== key) return result;
    // Fallback to English
    const enTranslations = i18nData['en'] as Record<string, unknown>;
    return deepGet(enTranslations, key);
  };

  // Returns raw value (array, object, etc.)
  const tRaw = <T = unknown>(key: string): T => {
    const translations = i18nData[lang] as Record<string, unknown>;
    const result = deepGet(translations, key);
    if (result && result !== key) return result as T;
    const enTranslations = i18nData['en'] as Record<string, unknown>;
    return deepGet(enTranslations, key) as T;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tRaw }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
