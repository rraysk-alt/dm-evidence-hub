import { getObjectionById, getPageBlocks, getObjections } from "@/lib/notion";
import { NotionRenderer } from "@/components/NotionRenderer";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 1800; // 30 min — Notion S3 URLs expire after ~1hr

export async function generateStaticParams() {
  const objections = await getObjections();
  return objections.map((o) => ({ id: o.id }));
}

export default async function ObjectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [objection, blocks] = await Promise.all([
    getObjectionById(id),
    getPageBlocks(id),
  ]);

  if (!objection) notFound();

  // Skip the first image block — we show it as the hero
  const heroImage = blocks.find((b) => b.type === "image");
  const contentBlocks = blocks.filter((b) => b !== heroImage);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#009AAB] hover:underline mb-6">
        ← Back to Evidence Hub
      </Link>

      {heroImage && (() => {
        const content = (heroImage as any).image;
        const url = content?.type === "external" ? content.external.url : content?.file?.url;
        return url ? (
          <div className="rounded-xl overflow-hidden mb-8 max-h-64 bg-gray-100">
            <img src={url} alt={objection.title} className="w-full h-64 object-cover" />
          </div>
        ) : null;
      })()}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {objection.usp && (
          <span className="text-xs bg-[#009AAB]/10 text-[#009AAB] rounded-full px-3 py-1 font-medium">
            {objection.usp}
          </span>
        )}
        {objection.scope && (
          <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
            {objection.scope}
          </span>
        )}
        {objection.regions.map((r) => (
          <span key={r} className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
            {r}
          </span>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{objection.title}</h1>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <NotionRenderer blocks={contentBlocks} />
      </div>
    </div>
  );
}
