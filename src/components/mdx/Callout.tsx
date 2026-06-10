import { ReactNode } from "react";

export function Callout({ emoji = "💡", children }: { emoji?: string; children?: ReactNode }) {
  return (
    <div className="flex gap-3 bg-[#009AAB]/8 border border-[#009AAB]/15 rounded-xl p-4 my-4">
      <span className="text-xl flex-shrink-0">{emoji}</span>
      <div className="text-gray-700 text-sm">{children}</div>
    </div>
  );
}
