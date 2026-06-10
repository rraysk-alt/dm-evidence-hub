import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getObjections, getObjectionContent } from "@/lib/content";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type IndexEntry = { id: string; title: string; excerpt: string };
let searchIndex: IndexEntry[] | null = null;

function extractTextFromMdx(mdx: string): string {
  return mdx
    .replace(/^---[\s\S]*?---\n/, "") // strip frontmatter
    .replace(/<[^>]+>/g, " ") // strip JSX/HTML tags
    .replace(/!\[.*?\]\(.*?\)/g, "") // strip images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // keep link text
    .replace(/[#*`>|_~]/g, " ") // strip markdown syntax
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

function buildIndex(): IndexEntry[] {
  if (searchIndex) return searchIndex;
  const pages = getObjections();
  searchIndex = pages.map((p) => {
    const mdx = getObjectionContent(p.id) ?? "";
    return { id: p.id, title: p.title, excerpt: extractTextFromMdx(mdx) };
  });
  return searchIndex;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const index = buildIndex();

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
    return NextResponse.json({
      results: keywordHits.slice(0, 5).map((p) => ({ id: p.id, title: p.title, snippet: "" })),
    });
  }
}
