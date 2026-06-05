import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  es: "Spanish",
  de: "German",
  pt: "Portuguese",
};

export async function POST(req: NextRequest) {
  const { texts, targetLang } = await req.json();

  if (!texts?.length || targetLang === "en") {
    return NextResponse.json({ translations: texts });
  }

  const langName = LANG_NAMES[targetLang] ?? targetLang;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional medical and dental translator specialising in orthodontics.
Translate the following texts to ${langName}.
Rules:
- Preserve brand/product names exactly: DentalMonitoring, DM, SmartSTL, iTero, SureSmile, Invisalign, etc.
- Preserve scientific/clinical terms (you may add a translation in parentheses if helpful)
- Preserve numbers, percentages, units
- Return ONLY valid JSON in this exact format: {"translations": ["...", "...", ...]}
- The output array must have the SAME length as the input array, in the same order.`,
        },
        {
          role: "user",
          content: JSON.stringify(texts),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content ?? "{}");
    const translations: string[] = result.translations ?? texts;

    // Safety: ensure same length
    if (translations.length !== texts.length) {
      return NextResponse.json({ translations: texts });
    }

    return NextResponse.json({ translations });
  } catch (err) {
    console.error("[translate]", err);
    return NextResponse.json({ translations: texts }); // fallback to original
  }
}
