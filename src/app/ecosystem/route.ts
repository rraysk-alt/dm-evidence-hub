import { readFile } from "node:fs/promises";
import path from "node:path";

// The Evidence Ecosystem page: a self-contained HTML page (map + walkthrough)
// served as-is. It sits behind the same Google sign-in as the rest of the Hub
// (see middleware.ts), and is deliberately NOT in public/, which is ungated.
// Not linked from the Hub's menu: people reach it through a shared link.
// To update: replace content/pages/ecosystem.html and redeploy.
export const dynamic = "force-static";

export async function GET() {
  const html = await readFile(
    path.join(process.cwd(), "content/pages/ecosystem.html"),
    "utf8",
  );
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
