import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) return NextResponse.json({ results: [] });

  const res = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      filter: { value: "page", property: "object" },
      page_size: 8,
    }),
    cache: "no-store",
  });

  const data = await res.json();

  const results = (data.results ?? [])
    .filter((p: any) => {
      // Only include pages that are children of our database
      const parent = p.parent;
      return (
        parent?.type === "database_id" &&
        parent.database_id.replace(/-/g, "") ===
          (process.env.NOTION_DATABASE_ID ?? "").replace(/-/g, "")
      );
    })
    .map((p: any) => {
      const title =
        p.properties?.Name?.title?.map((t: any) => t.plain_text).join("") ??
        "Untitled";
      return { id: p.id, title };
    });

  return NextResponse.json({ results });
}
