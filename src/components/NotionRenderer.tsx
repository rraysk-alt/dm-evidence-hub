import type { Block } from "@/lib/notion";

type RichText = { plain_text: string; href?: string | null; annotations?: any };

function renderRichText(texts: RichText[]) {
  return texts.map((t, i) => {
    let node: React.ReactNode = t.plain_text;
    const a = t.annotations ?? {};
    if (a.bold) node = <strong key={i}>{node}</strong>;
    if (a.italic) node = <em key={i}>{node}</em>;
    if (a.code) node = <code key={i} className="bg-gray-100 px-1 rounded text-sm font-mono">{node}</code>;
    if (t.href) node = <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="text-[#009AAB] underline">{node}</a>;
    return <span key={i}>{node}</span>;
  });
}

function TableBlock({ block }: { block: Block }) {
  const rows = block.children ?? [];
  if (!rows.length) return null;
  const hasHeader = (block as any).table?.has_column_header;

  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-200 text-sm">
        <tbody>
          {rows.map((row, ri) => {
            const cells = (row as any).table_row?.cells ?? [];
            const isHeader = hasHeader && ri === 0;
            const Tag = isHeader ? "th" : "td";
            return (
              <tr key={row.id} className={isHeader ? "bg-[#009AAB] text-white" : ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {cells.map((cell: RichText[], ci: number) => (
                  <Tag key={ci} className="border border-gray-200 px-3 py-2 text-left font-normal">
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

function BlockRenderer({ block }: { block: Block }) {
  const type = block.type;
  const content = (block as any)[type];

  switch (type) {
    case "heading_1":
      if (content.is_toggleable) {
        return (
          <details className="mt-6 group" open>
            <summary className="cursor-pointer list-none flex items-center gap-2 pb-2 border-b-2 border-[#009AAB]">
              <span className="text-[#009AAB] text-sm transition-transform group-open:rotate-90 select-none">▶</span>
              <h1 className="text-2xl font-bold text-gray-900">{renderRichText(content.rich_text)}</h1>
            </summary>
            <div className="mt-3">
              {block.children && <NotionRenderer blocks={block.children} />}
            </div>
          </details>
        );
      }
      return (
        <>
          <h1 className="text-2xl font-bold mt-8 mb-3 text-gray-900 border-b-2 border-[#009AAB] pb-2">
            {renderRichText(content.rich_text)}
          </h1>
          {block.children && <NotionRenderer blocks={block.children} />}
        </>
      );
    case "heading_2":
      if (content.is_toggleable || block.has_children) {
        return (
          <details className="mt-4 group border border-gray-200 rounded-lg overflow-hidden">
            <summary className="cursor-pointer list-none flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="text-[#009AAB] text-xs transition-transform group-open:rotate-90 select-none">▶</span>
              <h2 className="text-base font-semibold text-gray-800">{renderRichText(content.rich_text)}</h2>
            </summary>
            <div className="px-4 pb-4 pt-2">
              {block.children && <NotionRenderer blocks={block.children} />}
            </div>
          </details>
        );
      }
      return (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
            {renderRichText(content.rich_text)}
          </h2>
          {block.children && <NotionRenderer blocks={block.children} />}
        </>
      );
    case "heading_3":
      if (content.is_toggleable || block.has_children) {
        return (
          <details className="mt-3 group">
            <summary className="cursor-pointer list-none flex items-center gap-2 py-1">
              <span className="text-[#009AAB] text-xs transition-transform group-open:rotate-90 select-none">▶</span>
              <h3 className="text-sm font-semibold text-gray-700">{renderRichText(content.rich_text)}</h3>
            </summary>
            <div className="ml-4 mt-1">
              {block.children && <NotionRenderer blocks={block.children} />}
            </div>
          </details>
        );
      }
      return (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-1 text-gray-700">
            {renderRichText(content.rich_text)}
          </h3>
          {block.children && <NotionRenderer blocks={block.children} />}
        </>
      );
    case "paragraph":
      if (!content.rich_text?.length) return <div className="h-2" />;
      return (
        <p className="text-gray-700 leading-relaxed my-2">
          {renderRichText(content.rich_text)}
        </p>
      );
    case "bulleted_list_item":
      return (
        <li className="text-gray-700 ml-4 my-1 list-disc">
          {renderRichText(content.rich_text)}
          {block.children && (
            <ul className="ml-4">
              <NotionRenderer blocks={block.children} />
            </ul>
          )}
        </li>
      );
    case "numbered_list_item":
      return (
        <li className="text-gray-700 ml-4 my-1 list-decimal">
          {renderRichText(content.rich_text)}
        </li>
      );
    case "image": {
      const url = content.type === "external" ? content.external.url : content.file?.url;
      const caption = content.caption?.map((t: RichText) => t.plain_text).join("") ?? "";
      if (!url) return null;
      return (
        <figure className="my-6">
          <img src={url} alt={caption} className="rounded-lg max-w-full shadow-sm" />
          {caption && <figcaption className="text-sm text-gray-500 mt-1 text-center">{caption}</figcaption>}
        </figure>
      );
    }
    case "table":
      return <TableBlock block={block} />;
    case "table_row":
      return null; // rendered by TableBlock
    case "divider":
      return <hr className="my-6 border-gray-200" />;
    case "quote":
      return (
        <blockquote className="border-l-4 border-[#009AAB] pl-4 my-4 text-gray-600 italic">
          {renderRichText(content.rich_text)}
        </blockquote>
      );
    case "callout": {
      const emoji = content.icon?.emoji ?? "💡";
      return (
        <div className="flex gap-3 bg-[#009AAB]/10 border border-[#009AAB]/20 rounded-lg p-4 my-4">
          <span className="text-xl flex-shrink-0">{emoji}</span>
          <div className="text-gray-700">{renderRichText(content.rich_text)}</div>
        </div>
      );
    }
    case "toggle":
      return (
        <details className="my-3 border border-gray-200 rounded-lg">
          <summary className="cursor-pointer px-4 py-3 font-medium text-gray-800 hover:bg-gray-50">
            {renderRichText(content.rich_text)}
          </summary>
          <div className="px-4 pb-3 pt-1">
            {block.children && <NotionRenderer blocks={block.children} />}
          </div>
        </details>
      );
    case "video": {
      const url = content.type === "external" ? content.external.url : content.file?.url;
      if (!url) return null;
      return (
        <div className="my-6">
          <video controls className="rounded-lg max-w-full shadow-sm w-full">
            <source src={url} />
          </video>
        </div>
      );
    }
    case "embed":
    case "bookmark": {
      const url = content.url;
      if (!url) return null;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="block border border-gray-200 rounded-lg p-3 my-3 text-[#009AAB] hover:bg-gray-50 truncate text-sm">
          🔗 {url}
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
      <Tag key={`list-${rendered.length}`} className="my-2 pl-2">
        {listBuffer.map((b) => <BlockRenderer key={b.id} block={b} />)}
      </Tag>
    );
    listBuffer = [];
    listType = null;
  }

  for (const block of blocks) {
    const isList = block.type === "bulleted_list_item" || block.type === "numbered_list_item";
    if (isList) {
      if (listType !== block.type) {
        flushList();
        listType = block.type;
      }
      listBuffer.push(block);
    } else {
      flushList();
      rendered.push(<BlockRenderer key={block.id} block={block} />);
    }
  }
  flushList();

  return <>{rendered}</>;
}
