"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { NotionRenderer } from "@/components/NotionRenderer";
import type { Block } from "@/lib/notion";

// ── Collect all unique plain_text strings from blocks ──────────────────────────
function collectTexts(blocks: Block[]): string[] {
  const texts = new Set<string>();
  function walk(bs: Block[]) {
    for (const block of bs) {
      const content = (block as any)[block.type];
      // Standard rich_text fields
      if (Array.isArray(content?.rich_text)) {
        for (const rt of content.rich_text) {
          if (rt.plain_text?.trim()) texts.add(rt.plain_text);
        }
      }
      // Table row cells
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

// ── Deep-clone blocks applying translation map ─────────────────────────────────
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

// ── Component ──────────────────────────────────────────────────────────────────
export function TranslatedContent({ blocks, pageId }: { blocks: Block[]; pageId: string }) {
  const { lang } = useLanguage();
  const [displayBlocks, setDisplayBlocks] = useState(blocks);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (lang === "en") {
      setDisplayBlocks(blocks);
      return;
    }

    // Check session cache first
    const cacheKey = `trans:${pageId}:${lang}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setDisplayBlocks(JSON.parse(cached));
        return;
      }
    } catch {}

    const texts = collectTexts(blocks);
    if (!texts.length) return;

    setTranslating(true);

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, targetLang: lang }),
    })
      .then((r) => r.json())
      .then(({ translations }: { translations: string[] }) => {
        if (!translations?.length) return;
        const map: Record<string, string> = {};
        texts.forEach((t, i) => { map[t] = translations[i] ?? t; });
        const translated = applyTranslations(blocks, map);
        setDisplayBlocks(translated);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(translated)); } catch {}
      })
      .catch(() => setDisplayBlocks(blocks))
      .finally(() => setTranslating(false));
  }, [lang, blocks, pageId]);

  return (
    <div className="relative">
      {translating && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <div className="w-3 h-3 border-2 border-[#009AAB] border-t-transparent rounded-full animate-spin" />
          Translating…
        </div>
      )}
      <NotionRenderer blocks={displayBlocks} />
    </div>
  );
}
