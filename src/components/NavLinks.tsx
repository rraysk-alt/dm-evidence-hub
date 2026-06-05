"use client";
import { useState, useEffect } from "react";
import { SearchModal } from "@/components/SearchModal";
import { LanguageSelector } from "@/components/LanguageSelector";

const links = [
  { label: "Marketing Materials", href: "https://docs.google.com/presentation/d/174AIXWPeWtSaF4cDMsnNmzGXUt2Hw3nM1gB3-nej-FI/edit?usp=sharing" },
  { label: "Evidence Search Tool", href: "https://docs.google.com/forms/d/e/1FAIpQLSduFQlv2xWo0PIi_MqJ1bBXjybpZds4phT8tmjoqtg0TDiVUA/viewform" },
  { label: "DM Ortho. Report", href: "https://drive.google.com/file/d/1wDLcYpvDJEVuz4QOQTI43ORjtOkzhCyg/view?usp=sharing" },
  { label: "Evidence Overview", href: "https://rraysk-alt.github.io/dm-evidence-hub/" },
  { label: "DM Myths Playlist", href: "https://www.youtube.com/watch?v=qC8KvkrebPg&list=PLp10aZZZC0JkHpUoI83aqCW1z2JW3E8Jn" },
];

export function NavLinks() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Close menu on outside click
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
    <div data-nav className="relative">
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {links.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-3 py-2 text-sm text-gray-600 hover:text-[#009AAB] transition-colors whitespace-nowrap group"
          >
            {link.label}
            <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#009AAB] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
            {i < links.length - 1 && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200" />
            )}
          </a>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <SearchModal />
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <LanguageSelector />
      </div>

      {/* Mobile: search + hamburger */}
      <div className="flex md:hidden items-center gap-1">
        <SearchModal />
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
          <div className="px-4 py-3">
            <LanguageSelector />
          </div>
        </div>
      )}
    </div>
  );
}
