"use client";
import { useState, useEffect, useRef } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage, LANGUAGES, type Lang } from "@/context/LanguageContext";

const links = [
  { label: "Marketing Materials", href: "https://docs.google.com/presentation/d/174AIXWPeWtSaF4cDMsnNmzGXUt2Hw3nM1gB3-nej-FI/edit?usp=sharing" },
  { label: "Evidence Search Tool", href: "https://docs.google.com/forms/d/e/1FAIpQLSduFQlv2xWo0PIi_MqJ1bBXjybpZds4phT8tmjoqtg0TDiVUA/viewform" },
  { label: "DM Ortho. Report", href: "https://drive.google.com/file/d/1wDLcYpvDJEVuz4QOQTI43ORjtOkzhCyg/view?usp=sharing" },
  { label: "Evidence Overview", href: "https://rraysk-alt.github.io/dm-evidence-hub/" },
  { label: "DM Myths Playlist", href: "https://www.youtube.com/watch?v=qC8KvkrebPg&list=PLp10aZZZC0JkHpUoI83aqCW1z2JW3E8Jn" },
];

export function NavLinks() {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useLanguage();

  // Close resources dropdown on outside click
  useEffect(() => {
    if (!resourcesOpen) return;
    const handler = (e: MouseEvent) => {
      if (!resourcesRef.current?.contains(e.target as Node)) setResourcesOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [resourcesOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-nav]")) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  return (
    <div data-nav className="relative flex items-center gap-2">
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-2">
        {/* Resources dropdown */}
        <div ref={resourcesRef} className="relative">
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-[#009AAB] bg-white border border-gray-200 rounded-lg hover:border-[#009AAB]/40 transition-all font-medium"
          >
            Resources
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${resourcesOpen ? "rotate-180" : ""}`}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {resourcesOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 min-w-[210px]">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setResourcesOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#009AAB]/5 hover:text-[#009AAB] transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#009AAB]/40 flex-shrink-0" />
                  {link.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-auto text-gray-300">
                    <path d="M2 2h6v6M2 8l6-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-gray-200" />
        <LanguageSelector />
      </div>

      {/* Mobile: search + hamburger */}
      <div className="flex md:hidden items-center gap-1">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-200/60 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#009AAB]/5 hover:text-[#009AAB] border-b border-gray-50 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#009AAB] flex-shrink-0" />
              {link.label}
            </a>
          ))}
          <div className="px-4 py-3 border-t border-gray-50 flex flex-wrap gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code as Lang); setMobileOpen(false); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-all ${
                  lang === l.code
                    ? "bg-[#009AAB]/10 text-[#009AAB] font-semibold border border-[#009AAB]/20"
                    : "text-gray-500 hover:bg-gray-100 border border-transparent"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
