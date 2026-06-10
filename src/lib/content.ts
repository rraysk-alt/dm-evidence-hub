import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/objections");

export type Stat = {
  value: string;
  label: string;
  note?: string;
};

export type Objection = {
  id: string;
  title: string;
  coverImage: string | null;
  stats?: Stat[];
};

function parseObjection(data: Record<string, unknown>): Objection {
  return {
    id: data.id as string,
    title: data.title as string,
    coverImage: (data.coverImage as string) ?? null,
    stats: (data.stats as Stat[]) ?? undefined,
  };
}

export function getObjections(): Objection[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((filename) => {
    const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8"));
    return parseObjection(data);
  });
}

export function getObjectionById(id: string): Objection | null {
  const filePath = path.join(CONTENT_DIR, `${id}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  return parseObjection(data);
}

export function getObjectionContent(id: string): string | null {
  const filePath = path.join(CONTENT_DIR, `${id}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { content } = matter(fs.readFileSync(filePath, "utf8"));
  return content;
}

export function getAllIds(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}
