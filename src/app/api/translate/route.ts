import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  es: "Spanish",
  de: "German",
  pt: "Portuguese",
};

// ── Server-side cache (persists across warm Vercel function instances) ─────────
// Key: "pageId:lang" → map of original→translated strings
const serverCache = new Map<string, Record<string, string>>();

// ── Skip strings that don't need translation ───────────────────────────────────
function isTranslatable(text: string): boolean {
  const t = text.trim();
  if (t.length < 4) return false;                          // too short
  if (/^[\d\s%.,±\-+×/()[\]]+$/.test(t)) return false;   // numbers/symbols only
  if (t.startsWith("http")) return false;                  // URLs
  if (/^\d{4}$/.test(t)) return false;                    // years
  return true;
}

export async function POST(req: NextRequest) {
  const { texts, targetLang, pageId } = await req.json();

  if (!texts?.length || targetLang === "en") {
    return NextResponse.json({ translations: texts });
  }

  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const cacheKey = pageId ? `${pageId}:${targetLang}` : null;

  // 1. Check server-side cache — return instantly if already translated
  if (cacheKey && serverCache.has(cacheKey)) {
    const cachedMap = serverCache.get(cacheKey)!;
    const translations = texts.map((t: string) => cachedMap[t] ?? t);
    return NextResponse.json({ translations });
  }

  // 2. Filter to only strings that actually need translating
  const toTranslate = texts.filter(isTranslatable);
  if (!toTranslate.length) {
    return NextResponse.json({ translations: texts });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Translate to ${langName}. Rules: keep brand names exact (DentalMonitoring, DM, SmartSTL, iTero, SureSmile, Invisalign), keep numbers/units unchanged. Return ONLY: {"t":["translation1","translation2",...]} — same length as input, same order.`,
        },
        {
          role: "user",
          content: JSON.stringify(toTranslate),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content ?? "{}");
    const translated: string[] = result.t ?? result.translations ?? toTranslate;

    if (translated.length !== toTranslate.length) {
      return NextResponse.json({ translations: texts });
    }

    // Build full map (translated + passthrough for non-translatable)
    const map: Record<string, string> = {};
    toTranslate.forEach((orig: string, i: number) => { map[orig] = translated[i] ?? orig; });

    // Store in server-side cache
    if (cacheKey) serverCache.set(cacheKey, map);

    const translations = texts.map((t: string) => map[t] ?? t);
    return NextResponse.json({ translations });
  } catch (err) {
    console.error("[translate]", err);
    return NextResponse.json({ translations: texts });
  }
}
