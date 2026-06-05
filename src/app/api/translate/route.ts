import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  es: "Spanish",
  de: "German",
  pt: "Portuguese",
};

// ── Server-side cache: pageId:lang → original→translated map ──────────────────
const serverCache = new Map<string, Record<string, string>>();

function isTranslatable(text: string): boolean {
  const t = text.trim();
  if (t.length < 5) return false;
  if (/^[\d\s%.,±\-+×/()[\]°]+$/.test(t)) return false;
  if (t.startsWith("http")) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const { texts, targetLang, pageId } = await req.json();

  if (!texts?.length || targetLang === "en") {
    return NextResponse.json({ translations: texts });
  }

  const langName = LANG_NAMES[targetLang] ?? targetLang;
  const cacheKey = pageId ? `${pageId}:${targetLang}` : null;

  // Return from server cache instantly if available
  if (cacheKey && serverCache.has(cacheKey)) {
    const map = serverCache.get(cacheKey)!;
    return NextResponse.json({ translations: texts.map((t: string) => map[t] ?? t) });
  }

  // Filter and cap to avoid timeout (Vercel free = 10s limit)
  const toTranslate = (texts as string[]).filter(isTranslatable).slice(0, 80);
  if (!toTranslate.length) return NextResponse.json({ translations: texts });

  // ── Encode as numbered document (much faster than JSON array) ─────────────
  const document = toTranslate.map((t, i) => `[${i + 1}] ${t}`).join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Translate each line to ${langName}. Keep the [N] marker at the start of each line exactly as-is. Keep brand names unchanged: DentalMonitoring, DM, SmartSTL, iTero, SureSmile, Invisalign. Return only the translated numbered lines, nothing else.`,
        },
        { role: "user", content: document },
      ],
      temperature: 0.1,
      max_tokens: 2500,
    });

    // ── Parse [1] line\n[2] line\n... ──────────────────────────────────────
    const output = response.choices[0].message.content ?? "";
    const translated = new Array(toTranslate.length).fill("");

    for (const line of output.split("\n")) {
      const match = line.match(/^\[(\d+)\]\s*(.*)/);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        if (idx >= 0 && idx < toTranslate.length) translated[idx] = match[2].trim();
      }
    }

    // Build map: original → translated (fallback to original if parse missed)
    const map: Record<string, string> = {};
    toTranslate.forEach((orig, i) => { map[orig] = translated[i] || orig; });

    if (cacheKey) serverCache.set(cacheKey, map);

    return NextResponse.json({ translations: texts.map((t: string) => map[t] ?? t) });
  } catch (err) {
    console.error("[translate]", err);
    return NextResponse.json({ translations: texts });
  }
}
