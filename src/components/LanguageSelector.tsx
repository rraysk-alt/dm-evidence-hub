"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage, LANGUAGES, type Lang } from "@/context/LanguageContext";

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-[#009AAB] bg-white border border-gray-200 rounded-lg hover:border-[#009AAB]/40 transition-all"
        title="Change language"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 min-w-[130px]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                lang === l.code
                  ? "bg-[#009AAB]/8 text-[#009AAB] font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
              {lang === l.code && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#009AAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
