"use client";
import { ReactNode } from "react";

export function Toggle({
  title,
  children,
  level = 2,
}: {
  title: string;
  children?: ReactNode;
  level?: number;
}) {
  const summaryClass =
    level === 1
      ? "cursor-pointer list-none flex items-center gap-3 py-3 border-b-2 border-[#009AAB] select-none"
      : "cursor-pointer list-none flex items-center gap-2.5 px-4 py-3 bg-gray-50/80 hover:bg-gray-100/80 transition-colors select-none";

  const titleNode =
    level === 1 ? (
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    ) : (
      <span className="text-sm font-semibold text-gray-800">{title}</span>
    );

  return (
    <details
      className={
        level === 1
          ? "mt-6 group"
          : "mt-3 group border border-gray-200 rounded-xl overflow-hidden"
      }
    >
      <summary className={summaryClass}>
        <span
          className="toggle-arrow text-[#009AAB] flex-shrink-0"
          style={{ fontSize: level === 1 ? "13px" : "10px" }}
        >
          ▶
        </span>
        {titleNode}
      </summary>
      <div className="toggle-content">
        <div className={level === 1 ? "pt-4 pb-2" : "px-4 pb-4 pt-2"}>
          {children}
        </div>
      </div>
    </details>
  );
}
