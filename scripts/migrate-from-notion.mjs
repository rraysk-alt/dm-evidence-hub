import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { createWriteStream } from "fs";
import https from "https";
import http from "http";

const TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "2d294c44cb4b8077bbd4cb5d2018f189";
if (!TOKEN) { console.error("Set NOTION_TOKEN env var"); process.exit(1); }
const CONTENT_DIR = path.join(process.cwd(), "content/objections");
const IMAGES_DIR = path.join(process.cwd(), "public/images/objections");

// ── Notion API helpers ────────────────────────────────────────────────────────

async function notionFetch(endpoint, method = "GET", body = null) {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Notion API error ${res.status}: ${endpoint}`);
  return res.json();
}

async function getBlocks(blockId) {
  const data = await notionFetch(`blocks/${blockId}/children?page_size=100`);
  const blocks = data.results;

  // Recursively fetch children
  for (const block of blocks) {
    if (block.has_children) {
      block.children = await getBlocks(block.id);
      await sleep(80);
    }
  }
  return blocks;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Image downloader ──────────────────────────────────────────────────────────

async function downloadImage(url, destPath) {
  if (!url || url.startsWith("/")) return url;
  try {
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    const file = createWriteStream(destPath);
    await new Promise((resolve, reject) => {
      const protocol = url.startsWith("https") ? https : http;
      protocol
        .get(url, (res) => {
          if (res.statusCode === 302 || res.statusCode === 301) {
            protocol.get(res.headers.location, (res2) => {
              res2.pipe(file);
              file.on("finish", () => file.close(resolve));
              file.on("error", reject);
            });
          } else {
            res.pipe(file);
            file.on("finish", () => file.close(resolve));
            file.on("error", reject);
          }
        })
        .on("error", reject);
    });
    return destPath.replace(path.join(process.cwd(), "public"), "");
  } catch (e) {
    console.warn(`  ⚠ Could not download image: ${url.slice(0, 60)}...`);
    return url;
  }
}

// ── Rich text → Markdown ──────────────────────────────────────────────────────

function richTextToMd(texts) {
  if (!texts?.length) return "";
  return texts
    .map((t) => {
      let text = t.plain_text ?? "";
      // Escape MDX special chars in plain text (not inside links)
      const a = t.annotations ?? {};
      if (a.code) return `\`${text}\``;
      if (t.href) {
        if (a.bold) text = `**${text}**`;
        if (a.italic) text = `*${text}*`;
        return `[${text}](${t.href})`;
      }
      if (a.bold && a.italic) return `***${text}***`;
      if (a.bold) return `**${text}**`;
      if (a.italic) return `*${text}*`;
      return text;
    })
    .join("");
}

// ── Block → MDX ──────────────────────────────────────────────────────────────

let imageCounter = 0;
let firstImagePath = null;

async function blocksToMdx(blocks, pageId, indent = "") {
  const lines = [];

  for (const block of blocks) {
    const type = block.type;
    const content = block[type] ?? {};
    const rt = content.rich_text ?? [];
    const text = richTextToMd(rt);
    const children = block.children ?? [];

    switch (type) {
      case "heading_1": {
        if (content.is_toggleable || children.length) {
          const childMdx = await blocksToMdx(children, pageId, "  ");
          lines.push(`<Toggle title="${escAttr(richTextToMd(rt))}" level={1}>\n\n${childMdx}\n</Toggle>\n`);
        } else {
          lines.push(`# ${text}\n`);
        }
        break;
      }
      case "heading_2": {
        if (content.is_toggleable || children.length) {
          const childMdx = await blocksToMdx(children, pageId, "  ");
          lines.push(`<Toggle title="${escAttr(richTextToMd(rt))}" level={2}>\n\n${childMdx}\n</Toggle>\n`);
        } else {
          lines.push(`## ${text}\n`);
        }
        break;
      }
      case "heading_3": {
        if (content.is_toggleable || children.length) {
          const childMdx = await blocksToMdx(children, pageId, "  ");
          lines.push(`<Toggle title="${escAttr(richTextToMd(rt))}" level={2}>\n\n${childMdx}\n</Toggle>\n`);
        } else {
          lines.push(`### ${text}\n`);
        }
        break;
      }
      case "paragraph": {
        if (!rt.length) {
          lines.push("");
          break;
        }
        lines.push(`${text}\n`);
        break;
      }
      case "bulleted_list_item": {
        const hasText = rt.length > 0;
        if (!hasText && children.length) {
          const childMdx = await blocksToMdx(children, pageId);
          lines.push(childMdx);
        } else {
          lines.push(`- ${text}`);
          if (children.length) {
            const childMdx = await blocksToMdx(children, pageId);
            // indent children
            const indented = childMdx
              .split("\n")
              .map((l) => (l.trim() ? `  ${l}` : l))
              .join("\n");
            lines.push(indented);
          }
        }
        break;
      }
      case "numbered_list_item": {
        lines.push(`1. ${text}`);
        break;
      }
      case "image": {
        const url = content.type === "external" ? content.external?.url : content.file?.url;
        const caption = content.caption?.map((t) => t.plain_text).join("") ?? "";
        if (!url) break;
        const ext = url.includes(".png") ? "png" : url.includes(".gif") ? "gif" : "jpg";
        const imgFile = `${pageId}/image-${++imageCounter}.${ext}`;
        const destPath = path.join(IMAGES_DIR, imgFile);
        const localUrl = await downloadImage(url, destPath);
        if (!firstImagePath) firstImagePath = localUrl;
        lines.push(`![${caption}](${localUrl})\n`);
        break;
      }
      case "divider": {
        lines.push("---\n");
        break;
      }
      case "quote": {
        lines.push(`> ${text}\n`);
        break;
      }
      case "callout": {
        const emoji = content.icon?.emoji ?? "💡";
        const childMdx = children.length ? await blocksToMdx(children, pageId) : "";
        lines.push(`<Callout emoji="${emoji}">\n\n${text}${childMdx ? "\n\n" + childMdx : ""}\n\n</Callout>\n`);
        break;
      }
      case "toggle": {
        const childMdx = await blocksToMdx(children, pageId);
        lines.push(`<Toggle title="${escAttr(richTextToMd(rt))}" level={2}>\n\n${childMdx}\n</Toggle>\n`);
        break;
      }
      case "video":
      case "embed":
      case "link_preview": {
        const url = content.url ?? (content.type === "external" ? content.external?.url : null);
        if (!url) break;
        const ytId = getYouTubeId(url);
        if (ytId) {
          lines.push(`<YouTube id="${ytId}" />\n`);
        } else {
          lines.push(`[${url}](${url})\n`);
        }
        break;
      }
      case "bookmark": {
        const url = content.url;
        if (url) lines.push(`[${url}](${url})\n`);
        break;
      }
      case "table": {
        const tableRows = children;
        if (!tableRows.length) break;
        const hasHeader = content.has_column_header;
        const mdRows = tableRows.map((row) => {
          const cells = (row.table_row?.cells ?? []).map((cell) => richTextToMd(cell));
          return `| ${cells.join(" | ")} |`;
        });
        if (hasHeader && mdRows.length > 0) {
          const colCount = (tableRows[0].table_row?.cells ?? []).length;
          const sep = `| ${Array(colCount).fill("---").join(" | ")} |`;
          lines.push(mdRows[0]);
          lines.push(sep);
          lines.push(...mdRows.slice(1));
        } else {
          lines.push(...mdRows);
        }
        lines.push("");
        break;
      }
      default:
        break;
    }
  }

  return lines.join("\n");
}

function escAttr(str) {
  return str.replace(/"/g, "&quot;");
}

function getYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Fetching pages from Notion...\n");

  const db = await notionFetch(`databases/${DATABASE_ID}/query`, "POST", {});

  for (const page of db.results) {
    imageCounter = 0;
    firstImagePath = null;
    const id = page.id;
    const title =
      page.properties?.Name?.title?.[0]?.plain_text ?? "Untitled";

    // Cover image
    let coverImage = null;
    const cover = page.cover;
    if (cover) {
      const coverUrl =
        cover.type === "external" ? cover.external?.url : cover.file?.url;
      if (coverUrl) {
        const ext = coverUrl.includes(".png") ? "png" : "jpg";
        const destPath = path.join(IMAGES_DIR, `${id}/cover.${ext}`);
        coverImage = await downloadImage(coverUrl, destPath);
        console.log(`  📷 Cover: ${coverImage}`);
      }
    }

    console.log(`\n📄 Migrating: "${title}" (${id})`);

    const blocks = await getBlocks(id);
    const mdxContent = await blocksToMdx(blocks, id);

    const frontmatter = [
      "---",
      `id: "${id}"`,
      `title: "${title.replace(/"/g, '\\"')}"`,
      (coverImage ?? firstImagePath) ? `coverImage: "${coverImage ?? firstImagePath}"` : `coverImage: null`,
      "---",
      "",
    ].join("\n");

    const filePath = path.join(CONTENT_DIR, `${id}.mdx`);
    await fs.writeFile(filePath, frontmatter + mdxContent, "utf8");
    console.log(`  ✅ Saved → content/objections/${id}.mdx`);

    await sleep(300);
  }

  console.log("\n✨ Migration complete!");
  console.log(`   ${db.results.length} pages → content/objections/`);
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
