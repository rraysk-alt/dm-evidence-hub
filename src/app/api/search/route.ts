import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getObjections } from "@/lib/notion";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// ── Server-side search index (rebuilt every 30 min) ────────────────────────────
type IndexEntry = { id: string; title: string; excerpt: string };
let searchIndex: IndexEntry[] | null = null;
let indexBuiltAt = 0;
const INDEX_TTL = 30 * 60 * 1000;

/** Fetch the top-level blocks of a page and extract plain text (no deep recursion — fast) */
async function fetchExcerpt(pageId: string): Promise<string> {
  const res = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children?page_size=20`,
    { headers: NOTION_HEADERS, next: { revalidate: 1800 } }
  );
  const data = await res.json();
  const texts: string[] = [];

  for (const block of data.results ?? []) {
    const content = block[block.type];
    if (Array.isArray(content?.rich_text)) {
      const t = content.rich_text.map((rt: any) => rt.plain_text).join("").trim();
      if (t) texts.push(t);
    }
  }
  return texts.join(" ").slice(0, 600);
}

async function buildIndex(): Promise<IndexEntry[]> {
  const now = Date.now();
  if (searchIndex && now - indexBuiltAt < INDEX_TTL) return searchIndex;

  const pages = await getObjections();
  const entries = await Promise.all(
    pages.map(async (p) => ({
      id: p.id,
      title: p.title,
      excerpt: await fetchExcerpt(p.id),
    }))
  );

  searchIndex = entries;
  indexBuiltAt = now;
  return entries;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const index = await buildIndex();

  // Fast keyword fallback — used while OpenAI responds
  const lower = q.toLowerCase();
  const keywordHits = index.filter(
    (p) => p.title.toLowerCase().includes(lower) || p.excerpt.toLowerCase().includes(lower)
  );

  try {
    const pages = index.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.excerpt.slice(0, 350),
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a search engine for a dental orthodontics sales evidence hub.
Given a query and a list of pages (title + content excerpt), return the most relevant pages.
For each result include a short snippet (max 12 words) saying what relevant evidence the page contains.
Return JSON: {"results":[{"id":"...","snippet":"..."},...]}
Only include genuinely relevant pages. Max 5 results. Order by relevance descending.`,
        },
        {
          role: "user",
          content: `Query: "${q}"\n\nPages:\n${JSON.stringify(pages)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 400,
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
    const aiResults: { id: string; snippet: string }[] = parsed.results ?? [];

    const results = aiResults
      .map((r) => {
        const page = index.find((p) => p.id === r.id);
        return page ? { id: r.id, title: page.title, snippet: r.snippet } : null;
      })
      .filter(Boolean);

    return NextResponse.json({ results });
  } catch {
    // Fallback to keyword results without snippets
    return NextResponse.json({
      results: keywordHits.slice(0, 5).map((p) => ({ id: p.id, title: p.title, snippet: "" })),
    });
  }
}
