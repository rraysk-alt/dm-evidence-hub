import Image from "next/image";
import { Toggle } from "./Toggle";
import { Callout } from "./Callout";
import { YouTube } from "./YouTube";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  Toggle,
  Callout,
  YouTube,

  // Standard markdown elements with DM styling
  h1: ({ children }) => (
    <div className="mt-8 mb-3">
      <h2 className="text-xl font-bold text-gray-900 border-b-2 border-[#009AAB] pb-2">
        {children}
      </h2>
    </div>
  ),
  h2: ({ children }) => (
    <div className="mt-5 mb-2">
      <h3 className="text-lg font-semibold text-gray-800">{children}</h3>
    </div>
  ),
  h3: ({ children }) => (
    <div className="mt-4 mb-1">
      <h4 className="text-base font-semibold text-gray-700">{children}</h4>
    </div>
  ),
  p: ({ children }) => (
    <p className="text-gray-600 leading-relaxed my-2 text-sm">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-800">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-gray-500">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#009AAB] underline decoration-[#009AAB]/30 hover:decoration-[#009AAB] transition-all"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-3 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 space-y-0.5 list-decimal ml-4">{children}</ol>,
  li: ({ children }) => (
    <li className="text-gray-700 text-sm list-none flex items-start gap-2.5 py-1.5">
      <span className="w-2 h-2 rounded-full bg-[#009AAB] flex-shrink-0 mt-1.5" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#009AAB] pl-4 my-4 text-gray-500 italic text-sm bg-[#009AAB]/5 py-3 pr-4 rounded-r-lg">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-gray-100" />,
  code: ({ children }) => (
    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-[#009AAB]">
      {children}
    </code>
  ),
  img: ({ src, alt }) => {
    if (!src) return null;
    return (
      <figure className="my-6">
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="rounded-xl max-w-full shadow-sm w-full object-cover"
        />
        {alt && <figcaption className="text-xs text-gray-400 mt-2 text-center">{alt}</figcaption>}
      </figure>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-5 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-gray-100">{children}</tr>,
  th: ({ children }) => (
    <th className="bg-[#009AAB] text-white px-4 py-2.5 text-left font-medium text-sm">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-gray-700 text-sm">{children}</td>
  ),
};
