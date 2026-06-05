import { getObjectionById, getPageBlocks, getObjections } from "@/lib/notion";
import { NotionRenderer } from "@/components/NotionRenderer";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 1800;

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

  // Use the Notion page cover as hero — never steal content image blocks
  const heroUrl = objection.coverImage;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#009AAB] transition-colors mb-6 group"
      >
        <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#009AAB] group-hover:bg-[#009AAB]/5 transition-all shadow-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Back to Evidence Hub
      </Link>

      {/* Compact header: small thumbnail + title side by side */}
      <div className="flex items-start gap-4 mb-8">
        {heroUrl && (
          <img
            src={heroUrl}
            alt={objection.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 shadow-sm border border-gray-100"
          />
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {objection.title}
        </h1>
      </div>

      {/* Content — all blocks, nothing removed */}
      <div className="space-y-1">
        <NotionRenderer blocks={blocks} />
      </div>
    </div>
  );
}
