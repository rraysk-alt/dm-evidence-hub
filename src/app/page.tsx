import { getObjections } from "@/lib/content";
import { TranslationWrapper } from "@/components/TranslationWrapper";
import Link from "next/link";
import Image from "next/image";

export const revalidate = false; // static — content is in the repo

export default async function Home() {
  const objections = getObjections();

  return (
    <TranslationWrapper pageId="home">
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-8 h-0.5 bg-[#009AAB] rounded-full" />
          <span className="text-xs font-semibold text-[#009AAB] uppercase tracking-widest">Sales Enablement</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
          Sales Objections<br />Evidence Hub
        </h1>
        <p className="text-gray-500 text-base max-w-lg">
          Evidence-backed responses to the most common objections. Click any category to explore data, studies, and testimonials.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {objections.map((obj) => (
          <Link
            key={obj.id}
            href={`/objection/${obj.id}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer"
          >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
              {obj.coverImage ? (
                <Image
                  src={obj.coverImage}
                  alt={obj.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#009AAB]/10">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <polygon points="8,6 36,20 8,34" fill="#009AAB" opacity="0.4" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-[#009AAB]/0 group-hover:bg-[#009AAB]/10 transition-colors duration-300" />
            </div>

            {/* Text */}
            <div className="p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#009AAB] transition-colors">
                {obj.title}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#009AAB] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View evidence
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>

    {/* Dr. Swann quote banner */}
    <div className="bg-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        <Image
          src="/dr-swann.png"
          alt="Dr. Swann"
          width={320}
          height={380}
          className="w-64 md:w-80 object-cover flex-shrink-0 rounded-2xl"
        />
        <div>
          <p className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
            &ldquo;If you can&apos;t say anything peer-reviewed about your work, then don&apos;t say anything at all!&rdquo;
          </p>
          <p className="text-[#009AAB] text-xl font-semibold mt-6">— Dr. Swann</p>
        </div>
      </div>
    </div>
    </TranslationWrapper>
  );
}
