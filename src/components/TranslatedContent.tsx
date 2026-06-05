"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { NotionRenderer } from "@/components/NotionRenderer";
import type { Block } from "@/lib/notion";

function collectTexts(blocks: Block[]): string[] {
  const texts = new Set<string>();
  function walk(bs: Block[]) {
    for (const block of bs) {
      const content = (block as any)[block.type];
      if (Array.isArray(content?.rich_text)) {
        for (const rt of content.rich_text) {
          if (rt.plain_text?.trim()) texts.add(rt.plain_text);
        }
      }
      if (block.type === "table_row" && Array.isArray(content?.cells)) {
        for (const cell of content.cells) {
          for (const rt of cell) {
            if (rt.plain_text?.trim()) texts.add(rt.plain_text);
          }
        }
      }
      if (block.children) walk(block.children);
    }
  }
  walk(blocks);
  return [...texts];
}

function applyTranslations(blocks: Block[], map: Record<string, string>): Block[] {
  return blocks.map((block) => {
    const content = (block as any)[block.type];
    const nb: Block = { ...block };
    if (Array.isArray(content?.rich_text)) {
      nb[block.type] = {
        ...content,
        rich_text: content.rich_text.map((rt: any) => ({
          ...rt,
          plain_text: map[rt.plain_text] ?? rt.plain_text,
        })),
      };
    }
    if (block.type === "table_row" && Array.isArray(content?.cells)) {
      nb[block.type] = {
        ...content,
        cells: content.cells.map((cell: any[]) =>
          cell.map((rt: any) => ({ ...rt, plain_text: map[rt.plain_text] ?? rt.plain_text }))
        ),
      };
    }
    if (block.children) nb.children = applyTranslations(block.children, map);
    return nb;
  });
}

type Status = "idle" | "translating" | "done" | "error";

export function TranslatedContent({ blocks, pageId }: { blocks: Block[]; pageId: string }) {
  const { lang } = useLanguage();
  const [displayBlocks, setDisplayBlocks] = useState(blocks);
  const [status, setStatus] = useState<Status>("idle");

  const langLabel = LANGUAGES.find((l) => l.code === lang)?.name ?? lang.toUpperCase();
  const abortRef = useRef<AbortController | null>(null);

  const translate = useCallback(async (targetLang: string) => {
    if (targetLang === "en") { setDisplayBlocks(blocks); setStatus("idle"); return; }

    // Check browser cache first
    const cacheKey = `trans:${pageId}:${targetLang}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) { setDisplayBlocks(JSON.parse(cached)); setStatus("done"); return; }
    } catch {}

    const texts = collectTexts(blocks);
    if (!texts.length) return;

    // Cancel any previous in-flight request (e.g. user switched languages fast)
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setStatus("translating");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, targetLang, pageId }),
        signal,
      });

      if (!res.ok) throw new Error("API error");

      const { translations } = await res.json();
      if (!translations?.length) throw new Error("Empty response");

      const map: Record<string, string> = {};
      texts.forEach((t, i) => { map[t] = translations[i] ?? t; });

      const translated = applyTranslations(blocks, map);
      setDisplayBlocks(translated);
      setStatus("done");
      try { sessionStorage.setItem(cacheKey, JSON.stringify(translated)); } catch {}
    } catch (err: any) {
      if (err?.name === "AbortError") return; // language changed — ignore this result
      setStatus("error");
      setDisplayBlocks(blocks);
    }
  }, [blocks, pageId]);

  useEffect(() => { translate(lang); }, [lang, translate]);

  return (
    <div>
      {/* Status bar */}
      {status === "translating" && (
        <div className="flex items-center gap-2 text-xs text-[#009AAB] mb-5 px-3 py-2 bg-[#009AAB]/5 rounded-lg border border-[#009AAB]/15">
          <div className="w-3 h-3 border-2 border-[#009AAB] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Translating to {langLabel}…
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center justify-between text-xs text-red-500 mb-5 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
          <span>Translation failed — showing original</span>
          <button
            onClick={() => translate(lang)}
            className="underline hover:no-underline ml-3"
          >
            Retry
          </button>
        </div>
      )}
      <NotionRenderer blocks={displayBlocks} />
    </div>
  );
}
