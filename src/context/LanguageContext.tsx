"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "fr" | "es" | "de" | "ja";

export const LANGUAGES: { code: Lang; label: string; flag: string; name: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧", name: "English" },
  { code: "fr", label: "FR", flag: "🇫🇷", name: "French" },
  { code: "es", label: "ES", flag: "🇪🇸", name: "Spanish" },
  { code: "de", label: "DE", flag: "🇩🇪", name: "German" },
  { code: "ja", label: "JA", flag: "🇯🇵", name: "Japanese" },
];

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Persist language choice across pages
  useEffect(() => {
    const saved = localStorage.getItem("dm-lang") as Lang | null;
    if (saved && LANGUAGES.find((l) => l.code === saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("dm-lang", l);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
