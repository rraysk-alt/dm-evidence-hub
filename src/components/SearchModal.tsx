"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type Result = { id: string; title: string; snippet?: string };

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults([]); }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Longer debounce (600ms) — gives user time to finish typing before OpenAI call
  useEffect(() => {
    const t = setTimeout(() => search(query), 600);
    return () => clearTimeout(t);
  }, [query, search]);

  const go = (id: string) => { router.push(`/objection/${id}`); setOpen(false); };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-md transition-all"
        title="Search (⌘K)"
      >
        <span className="text-base">🔍</span>
        <span className="hidden lg:inline text-xs text-gray-400">⌘K</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 flex-shrink-0">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about the evidence…"
                className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-[#009AAB] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              <kbd
                onClick={() => setOpen(false)}
                className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 cursor-pointer hover:text-gray-600"
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="py-1.5 max-h-80 overflow-y-auto divide-y divide-gray-50">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => go(r.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[#009AAB]/5 flex items-start gap-3 group transition-colors"
                    >
                      <span className="text-[#009AAB] mt-0.5 flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 group-hover:text-[#009AAB] transition-colors block">
                          {r.title}
                        </span>
                        {r.snippet && (
                          <span className="text-xs text-gray-400 mt-0.5 block leading-relaxed">
                            {r.snippet}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query.length >= 2 && !loading && results.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {query.length < 2 && (
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-gray-400">
                  Ask a question or search by keyword
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {["chair time savings", "AI accuracy", "patient compliance", "ROI evidence"].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => setQuery(hint)}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-[#009AAB]/10 hover:text-[#009AAB] transition-colors"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
