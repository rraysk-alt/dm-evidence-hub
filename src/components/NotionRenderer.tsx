import type { Block } from "@/lib/notion";

type RichText = { plain_text: string; href?: string | null; annotations?: any };

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function renderRichText(texts: RichText[]) {
  return texts.map((t, i) => {
    let node: React.ReactNode = t.plain_text;
    const a = t.annotations ?? {};
    if (a.bold) node = <strong key={i}>{node}</strong>;
    if (a.italic) node = <em key={i}>{node}</em>;
    if (a.code) node = <code key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-[#009AAB]">{node}</code>;
    if (t.href) node = <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="text-[#009AAB] underline decoration-[#009AAB]/30 hover:decoration-[#009AAB] transition-all">{node}</a>;
    return <span key={i}>{node}</span>;
  });
}

function TableBlock({ block }: { block: Block }) {
  const rows = block.children ?? [];
  if (!rows.length) return null;
  const hasHeader = (block as any).table?.has_column_header;
  return (
    <div className="overflow-x-auto my-5 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">
        <tbody>
          {rows.map((row, ri) => {
            const cells = (row as any).table_row?.cells ?? [];
            const isHeader = hasHeader && ri === 0;
            const Tag = isHeader ? "th" : "td";
            return (
              <tr key={row.id} className={isHeader ? "bg-[#009AAB] text-white" : ri % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                {cells.map((cell: RichText[], ci: number) => (
                  <Tag key={ci} className="border-b border-gray-100 px-4 py-2.5 text-left font-normal last:border-r-0">
                    {renderRichText(cell)}
                  </Tag>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Smooth toggle wrapper using CSS grid trick
function Toggle({ summary, children, level = 1 }: { summary: React.ReactNode; children?: React.ReactNode; level?: number }) {
  const summaryClass = level === 1
    ? "cursor-pointer list-none flex items-center gap-3 py-3 border-b-2 border-[#009AAB] select-none"
    : "cursor-pointer list-none flex items-center gap-2.5 px-4 py-3 bg-gray-50/80 hover:bg-gray-100/80 transition-colors select-none";

  return (
    <details className={level === 1 ? "mt-6 group" : "mt-3 group border border-gray-200 rounded-xl overflow-hidden"}>
      <summary className={summaryClass}>
        <span className="toggle-arrow text-[#009AAB] flex-shrink-0" style={{ fontSize: level === 1 ? "13px" : "10px" }}>▶</span>
        {summary}
      </summary>
      <div className="toggle-content">
        <div className={level === 1 ? "pt-4 pb-2" : "px-4 pb-4 pt-2"}>
          {children}
        </div>
      </div>
    </details>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  const type = block.type;
  const content = (block as any)[type];

  switch (type) {
    case "heading_1":
      if (content.is_toggleable) {
        return (
          <Toggle
            level={1}
            summary={<h2 className="text-xl font-bold text-gray-900">{renderRichText(content.rich_text)}</h2>}
          >
            {block.children && <NotionRenderer blocks={block.children} />}
          </Toggle>
        );
      }
      return (
        <div className="mt-8 mb-3">
          <h2 className="text-xl font-bold text-gray-900 border-b-2 border-[#009AAB] pb-2">
            {renderRichText(content.rich_text)}
          </h2>
          {block.children && <NotionRenderer blocks={block.children} />}
        </div>
      );

    case "heading_2":
      if (content.is_toggleable || block.has_children) {
        return (
          <Toggle
            level={2}
            summary={<h3 className="text-sm font-semibold text-gray-800">{renderRichText(content.rich_text)}</h3>}
          >
            {block.children && <NotionRenderer blocks={block.children} />}
          </Toggle>
        );
      }
      return (
        <div className="mt-5 mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{renderRichText(content.rich_text)}</h3>
          {block.children && <NotionRenderer blocks={block.children} />}
        </div>
      );

    case "heading_3":
      if (content.is_toggleable || block.has_children) {
        return (
          <Toggle
            level={2}
            summary={<h4 className="text-sm font-medium text-gray-700">{renderRichText(content.rich_text)}</h4>}
          >
            {block.children && <NotionRenderer blocks={block.children} />}
          </Toggle>
        );
      }
      return (
        <div className="mt-4 mb-1">
          <h4 className="text-base font-semibold text-gray-700">{renderRichText(content.rich_text)}</h4>
          {block.children && <NotionRenderer blocks={block.children} />}
        </div>
      );

    case "paragraph": {
      if (!content.rich_text?.length) return <div className="h-3" />;
      const texts: RichText[] = content.rich_text;
      const allBold = texts.length > 0 && texts.every((t: RichText) => t.annotations?.bold);
      const firstChar = texts[0]?.plain_text?.trim()[0];
      const isCitation = firstChar === "(" && texts.some((t: RichText) => t.href || t.annotations?.italic);

      // All-bold paragraph → mini section header
      if (allBold) {
        return (
          <div className="flex items-center gap-2 mt-6 mb-3">
            <span className="w-1 h-4 rounded-full bg-[#009AAB] flex-shrink-0" />
            <p className="text-sm font-semibold text-gray-800">{renderRichText(texts)}</p>
          </div>
        );
      }

      // Citation paragraph → footnote style
      if (isCitation) {
        return (
          <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-2 pl-3 border-l-2 border-gray-200 italic">
            {renderRichText(texts)}
          </p>
        );
      }

      return (
        <p className="text-gray-600 leading-relaxed my-2 text-sm">
          {renderRichText(texts)}
        </p>
      );
    }

    case "bulleted_list_item": {
      const hasText = content.rich_text?.length > 0;
      // Empty bullet with only children (e.g. a video pasted under a bullet) — skip the orphan dot
      if (!hasText && block.children) {
        return (
          <div className="my-2">
            <NotionRenderer blocks={block.children} />
          </div>
        );
      }
      return (
        <li className="text-gray-700 text-sm list-none flex items-start gap-2.5 py-1.5">
          <span className="w-2 h-2 rounded-full bg-[#009AAB] flex-shrink-0 mt-1.5" />
          <span className="flex-1">
            {renderRichText(content.rich_text)}
            {block.children && (
              <div className="mt-2 pl-1">
                <NotionRenderer blocks={block.children} />
              </div>
            )}
          </span>
        </li>
      );
    }

    case "numbered_list_item":
      return (
        <li className="text-gray-600 text-sm ml-4 my-1.5 list-decimal">
          {renderRichText(content.rich_text)}
        </li>
      );

    case "image": {
      const url = content.type === "external" ? content.external.url : content.file?.url;
      const caption = content.caption?.map((t: RichText) => t.plain_text).join("") ?? "";
      if (!url) return null;
      return (
        <figure className="my-6">
          <img src={url} alt={caption} loading="lazy" decoding="async" className="rounded-xl max-w-full shadow-sm w-full object-cover" />
          {caption && <figcaption className="text-xs text-gray-400 mt-2 text-center">{caption}</figcaption>}
        </figure>
      );
    }

    case "table":
      return <TableBlock block={block} />;
    case "table_row":
      return null;

    case "divider":
      return <hr className="my-6 border-gray-100" />;

    case "quote":
      return (
        <blockquote className="border-l-4 border-[#009AAB] pl-4 my-4 text-gray-500 italic text-sm bg-[#009AAB]/5 py-3 pr-4 rounded-r-lg">
          {renderRichText(content.rich_text)}
        </blockquote>
      );

    case "callout": {
      const emoji = content.icon?.emoji ?? "💡";
      return (
        <div className="flex gap-3 bg-[#009AAB]/8 border border-[#009AAB]/15 rounded-xl p-4 my-4">
          <span className="text-xl flex-shrink-0">{emoji}</span>
          <div className="text-gray-700 text-sm">{renderRichText(content.rich_text)}</div>
        </div>
      );
    }

    case "toggle":
      return (
        <Toggle
          level={2}
          summary={<span className="text-sm font-medium text-gray-800">{renderRichText(content.rich_text)}</span>}
        >
          {block.children && <NotionRenderer blocks={block.children} />}
        </Toggle>
      );

    case "video": {
      const url = content.type === "external" ? content.external.url : content.file?.url;
      if (!url) return null;
      const caption = content.caption?.map((t: RichText) => t.plain_text).join("") ?? "";
      const youtubeId = getYouTubeId(url);
      if (youtubeId) {
        return (
          <figure className="my-6">
            <div className="relative w-full rounded-xl overflow-hidden shadow-sm" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {caption && <figcaption className="text-xs text-gray-400 mt-2 text-center">{caption}</figcaption>}
          </figure>
        );
      }
      return (
        <div className="my-6">
          <video controls className="rounded-xl max-w-full shadow-sm w-full">
            <source src={url} />
          </video>
        </div>
      );
    }

    case "embed": {
      const url = content.url;
      if (!url) return null;
      const youtubeId = getYouTubeId(url);
      if (youtubeId) {
        return (
          <figure className="my-6">
            <div className="relative w-full rounded-xl overflow-hidden shadow-sm" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </figure>
        );
      }
      return (
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-2 border border-gray-200 rounded-xl p-3 my-3 text-[#009AAB] hover:bg-[#009AAB]/5 hover:border-[#009AAB]/30 truncate text-sm transition-all">
          🔗 <span className="truncate">{url}</span>
        </a>
      );
    }

    case "bookmark": {
      const url = content.url;
      if (!url) return null;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-2 border border-gray-200 rounded-xl p-3 my-3 text-[#009AAB] hover:bg-[#009AAB]/5 hover:border-[#009AAB]/30 truncate text-sm transition-all">
          🔗 <span className="truncate">{url}</span>
        </a>
      );
    }

    case "link_preview": {
      const url = content.url;
      if (!url) return null;
      const youtubeId = getYouTubeId(url);
      if (youtubeId) {
        return (
          <figure className="my-6">
            <div className="relative w-full rounded-xl overflow-hidden shadow-sm" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </figure>
        );
      }
      return (
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-2 border border-gray-200 rounded-xl p-3 my-3 text-[#009AAB] hover:bg-[#009AAB]/5 hover:border-[#009AAB]/30 truncate text-sm transition-all">
          🔗 <span className="truncate">{url}</span>
        </a>
      );
    }

    default:
      return null;
  }
}

export function NotionRenderer({ blocks }: { blocks: Block[] }) {
  const rendered: React.ReactNode[] = [];
  let listBuffer: Block[] = [];
  let listType: string | null = null;

  function flushList() {
    if (!listBuffer.length) return;
    const Tag = listType === "bulleted_list_item" ? "ul" : "ol";
    rendered.push(
      <Tag key={`list-${rendered.length}`} className="my-3 space-y-0.5">
        {listBuffer.map((b) => <BlockRenderer key={b.id} block={b} />)}
      </Tag>
    );
    listBuffer = [];
    listType = null;
  }

  for (const block of blocks) {
    const isList = block.type === "bulleted_list_item" || block.type === "numbered_list_item";
    if (isList) {
      if (listType !== block.type) { flushList(); listType = block.type; }
      listBuffer.push(block);
    } else {
      flushList();
      rendered.push(<BlockRenderer key={block.id} block={block} />);
    }
  }
  flushList();
  return <>{rendered}</>;
}
