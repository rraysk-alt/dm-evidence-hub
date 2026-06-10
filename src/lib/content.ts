import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/objections");

export type Objection = {
  id: string;
  title: string;
  coverImage: string | null;
};

export function getObjections(): Objection[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((filename) => {
    const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8"));
    return { id: data.id, title: data.title, coverImage: data.coverImage ?? null };
  });
}

export function getObjectionById(id: string): Objection | null {
  const filePath = path.join(CONTENT_DIR, `${id}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  return { id: data.id, title: data.title, coverImage: data.coverImage ?? null };
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
