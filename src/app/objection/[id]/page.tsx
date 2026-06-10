import { getObjectionById, getObjectionContent, getAllIds } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx";
import { TranslationWrapper } from "@/components/TranslationWrapper";
import { StatsBanner } from "@/components/StatsBanner";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = false; // static

export async function generateStaticParams() {
  return getAllIds().map((id) => ({ id }));
}

export default async function ObjectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const objection = getObjectionById(id);
  const content = getObjectionContent(id);

  if (!objection || content === null) notFound();

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

      {/* Compact header */}
      <div className="flex items-start gap-4 mb-8">
        {objection.coverImage && (
          <Image
            src={objection.coverImage}
            alt={objection.title}
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 shadow-sm border border-gray-100"
          />
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {objection.title}
        </h1>
      </div>

      {/* Stats banner */}
      {objection.stats && <StatsBanner stats={objection.stats} />}

      {/* MDX Content — wrapped for client-side translation */}
      <div className="space-y-1">
        <TranslationWrapper pageId={id}>
          <MDXRemote source={content} components={mdxComponents} />
        </TranslationWrapper>
      </div>
    </div>
  );
}
