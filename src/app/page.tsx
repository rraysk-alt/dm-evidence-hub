import { getObjections } from "@/lib/notion";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const objections = await getObjections();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Sales Objections – Evidence Hub
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {objections.map((obj) => (
          <Link
            key={obj.id}
            href={`/objection/${obj.id}`}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
              {obj.coverImage ? (
                <img
                  src={obj.coverImage}
                  alt={obj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#009AAB]/10">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <polygon points="8,6 36,20 8,34" fill="#009AAB" opacity="0.4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-800 leading-snug">{obj.title}</p>
              {obj.usp && (
                <span className="inline-block mt-2 text-xs bg-[#009AAB]/10 text-[#009AAB] rounded-full px-2 py-0.5 font-medium">
                  {obj.usp}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
