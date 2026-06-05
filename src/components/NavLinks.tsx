"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const externalLinks = [
  { label: "Marketing Materials", href: "https://docs.google.com/presentation/d/174AIXWPeWtSaF4cDMsnNmzGXUt2Hw3nM1gB3-nej-FI/edit?usp=sharing" },
  { label: "Evidence Search Tool", href: "https://docs.google.com/forms/d/e/1FAIpQLSduFQlv2xWo0PIi_MqJ1bBXjybpZds4phT8tmjoqtg0TDiVUA/viewform" },
  { label: "DM Ortho. Report", href: "https://drive.google.com/file/d/1wDLcYpvDJEVuz4QOQTI43ORjtOkzhCyg/view?usp=sharing" },
  { label: "Comprehensive DM Evidence Overview", href: "https://rraysk-alt.github.io/dm-evidence-hub/" },
  { label: "DM Myths Playlist", href: "https://www.youtube.com/watch?v=qC8KvkrebPg&list=PLp10aZZZC0JkHpUoI83aqCW1z2JW3E8Jn" },
];

export function NavLinks() {
  const pathname = usePathname();
  const isHub = pathname === "/" || pathname.startsWith("/objection");

  return (
    <div className="hidden md:flex items-center gap-1 text-sm">
      {externalLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-all whitespace-nowrap"
        >
          {link.label}
        </a>
      ))}
      <Link
        href="/"
        className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
          isHub
            ? "bg-[#009AAB] text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
        }`}
      >
        Evidence Hub
      </Link>
    </div>
  );
}
