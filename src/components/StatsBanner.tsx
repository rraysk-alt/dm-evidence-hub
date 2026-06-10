import type { Stat } from "@/lib/content";

export function StatsBanner({ stats }: { stats: Stat[] }) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex-1 min-w-[140px] bg-[#E1F5EE] rounded-xl px-4 py-3 flex flex-col gap-0.5"
        >
          <span className="text-[#009AAB] font-bold text-xl leading-tight">{stat.value}</span>
          <span className="text-gray-800 font-semibold text-sm leading-snug">{stat.label}</span>
          {stat.note && (
            <span className="text-gray-500 text-xs leading-snug">{stat.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}
