"use client";
import { useEffect, useRef, ReactNode } from "react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";

function getTextNodes(el: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node as Text).textContent ?? "";
    if (text.trim().length < 3) continue;
    const tag = (node as Text).parentElement?.tagName?.toLowerCase() ?? "";
    if (["script", "style", "code", "pre"].includes(tag)) continue;
    nodes.push(node as Text);
  }
  return nodes;
}

export function TranslationWrapper({
  children,
  pageId,
}: {
  children: ReactNode;
  pageId: string;
}) {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  // Maps DOM text node → original English text (captured once on first run)
  const originalsRef = useRef<Map<Text, string>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  const langLabel = LANGUAGES.find((l) => l.code === lang)?.name ?? lang;

  function setStatus(type: "loading" | "error" | "none") {
    const el = statusRef.current;
    if (!el) return;
    if (type === "none") { el.style.display = "none"; return; }
    el.style.display = "flex";
    el.className =
      type === "loading"
        ? "flex items-center gap-2 text-xs text-[#009AAB] mb-5 px-3 py-2 bg-[#009AAB]/5 rounded-lg border border-[#009AAB]/15"
        : "flex items-center text-xs text-red-500 mb-5 px-3 py-2 bg-red-50 rounded-lg border border-red-100";
    el.innerHTML =
      type === "loading"
        ? `<span style="width:12px;height:12px;border:2px solid #009AAB;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;flex-shrink:0"></span> Translating to ${langLabel}…`
        : `Translation failed — showing original`;
  }

  function applyMap(map: Record<string, string>) {
    originalsRef.current.forEach((original, node) => {
      node.textContent = map[original] ?? original;
    });
  }

  function restoreOriginals() {
    originalsRef.current.forEach((original, node) => {
      node.textContent = original;
    });
  }

  useEffect(() => {
    if (!containerRef.current) return;

    // Capture English originals once (first effect run after hydration)
    if (originalsRef.current.size === 0) {
      getTextNodes(containerRef.current).forEach((node) =>
        originalsRef.current.set(node, node.textContent ?? "")
      );
    }

    abortRef.current?.abort();

    if (lang === "en") {
      restoreOriginals();
      setStatus("none");
      return;
    }

    // Session cache hit → apply instantly
    const cacheKey = `trans:${pageId}:${lang}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        applyMap(JSON.parse(cached));
        setStatus("none");
        return;
      }
    } catch {}

    // Collect unique translatable strings (use English originals as source)
    const texts = [...new Set(originalsRef.current.values())];
    if (!texts.length) return;

    abortRef.current = new AbortController();
    setStatus("loading");

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, targetLang: lang, pageId }),
      signal: abortRef.current.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("api");
        return r.json();
      })
      .then(({ translations }) => {
        if (!translations?.length) throw new Error("empty");
        const map: Record<string, string> = {};
        texts.forEach((t, i) => { if (translations[i]) map[t] = translations[i]; });
        applyMap(map);
        setStatus("none");
        try { sessionStorage.setItem(cacheKey, JSON.stringify(map)); } catch {}
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        restoreOriginals();
        setStatus("error");
      });

    return () => { abortRef.current?.abort(); };
  }, [lang, pageId]);

  return (
    <div>
      <div ref={statusRef} style={{ display: "none" }} />
      <div ref={containerRef}>{children}</div>
    </div>
  );
}
