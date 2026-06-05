const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

export type ObjectionPage = {
  id: string;
  title: string;
  coverImage: string | null;
  status: string | null;
  scope: string | null;
  usp: string | null;
  regions: string[];
};

export type Block = {
  id: string;
  type: string;
  has_children: boolean;
  children?: Block[];
  [key: string]: any;
};

function extractCoverImage(page: any): string | null {
  const cover = page.cover;
  if (!cover) return null;
  if (cover.type === "external") return cover.external.url;
  if (cover.type === "file") return cover.file.url;
  return null;
}

function extractTitle(page: any): string {
  const name = page.properties?.["Name"];
  if (name?.type === "title") {
    return name.title.map((t: any) => t.plain_text).join("");
  }
  return "Untitled";
}

async function getFirstImageBlock(pageId: string): Promise<string | null> {
  const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=5`, {
    headers,
    next: { revalidate: 1800 },
  });
  const data = await res.json();
  const imgBlock = (data.results ?? []).find((b: any) => b.type === "image");
  if (!imgBlock) return null;
  const img = imgBlock.image;
  return img?.type === "external" ? img.external.url : img?.file?.url ?? null;
}

export async function getObjections(): Promise<ObjectionPage[]> {
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
    next: { revalidate: 1800 },
  });
  const data = await res.json();
  const pages = data.results ?? [];

  const objections = await Promise.all(
    pages.map(async (page: any) => {
      const props = page.properties;
      const coverImage = extractCoverImage(page) ?? await getFirstImageBlock(page.id);
      return {
        id: page.id,
        title: extractTitle(page),
        coverImage,
        status: props["Status"]?.select?.name ?? null,
        scope: props["Scope"]?.select?.name ?? null,
        usp: props["Objection USP"]?.select?.name ?? null,
        regions: props["Primary Region"]?.multi_select?.map((s: any) => s.name) ?? [],
      };
    })
  );
  return objections;
}

export async function getObjectionById(id: string): Promise<ObjectionPage | null> {
  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers,
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;
  const page = await res.json();
  const props = page.properties;
  return {
    id: page.id,
    title: extractTitle(page),
    coverImage: extractCoverImage(page),
    status: props["Status"]?.select?.name ?? null,
    scope: props["Scope"]?.select?.name ?? null,
    usp: props["Objection USP"]?.select?.name ?? null,
    regions: props["Primary Region"]?.multi_select?.map((s: any) => s.name) ?? [],
  };
}

export async function getPageBlocks(pageId: string): Promise<Block[]> {
  return fetchBlockChildren(pageId);
}

async function fetchBlockChildren(blockId: string): Promise<Block[]> {
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
    headers,
    next: { revalidate: 1800 },
  });
  const data = await res.json();
  const blocks: Block[] = data.results ?? [];

  await Promise.all(
    blocks.map(async (block) => {
      if (block.has_children) {
        block.children = await fetchBlockChildren(block.id);
      }
    })
  );

  return blocks;
}
