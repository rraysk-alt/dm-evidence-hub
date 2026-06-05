"use client";
import { useLanguage, LANGUAGES, type Lang } from "@/context/LanguageContext";

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg px-1.5 py-1 bg-white">
      {LANGUAGES.map((l, i) => (
        <span key={l.code} className="flex items-center">
          <button
            onClick={() => setLang(l.code as Lang)}
            title={l.name}
            className={`px-1.5 py-0.5 text-xs font-medium rounded transition-all ${
              lang === l.code
                ? "text-[#009AAB] bg-[#009AAB]/10 font-semibold"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-0.5">{l.flag}</span>{l.label}
          </button>
          {i < LANGUAGES.length - 1 && (
            <span className="text-gray-200 text-xs select-none mx-0.5">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
