"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type Result = { id: string; title: string };

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open on keyboard shortcut cmd+k
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
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
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const go = (id: string) => {
    router.push(`/objection/${id}`);
    setOpen(false);
  };

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
              <span className="text-lg">🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search evidence hub..."
                className="flex-1 text-base outline-none text-gray-800 placeholder-gray-400"
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-[#009AAB] border-t-transparent rounded-full animate-spin" />
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">
                ESC
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="py-2 max-h-72 overflow-y-auto">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => go(r.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[#009AAB]/5 flex items-center gap-3 group transition-colors"
                    >
                      <span className="text-[#009AAB] text-sm">→</span>
                      <span className="text-sm text-gray-800 group-hover:text-[#009AAB] transition-colors">
                        {r.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query && !loading && results.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No results for "{query}"</p>
            )}

            {!query && (
              <p className="px-4 py-4 text-xs text-gray-400 text-center">
                Type to search across all objection pages
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
