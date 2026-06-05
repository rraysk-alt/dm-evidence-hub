const links = [
  { label: "Marketing Materials", href: "https://docs.google.com/presentation/d/174AIXWPeWtSaF4cDMsnNmzGXUt2Hw3nM1gB3-nej-FI/edit?usp=sharing" },
  { label: "Evidence Search Tool", href: "https://docs.google.com/forms/d/e/1FAIpQLSduFQlv2xWo0PIi_MqJ1bBXjybpZds4phT8tmjoqtg0TDiVUA/viewform" },
  { label: "DM Ortho. Report", href: "https://drive.google.com/file/d/1wDLcYpvDJEVuz4QOQTI43ORjtOkzhCyg/view?usp=sharing" },
  { label: "Comprehensive DM Evidence Overview", href: "https://rraysk-alt.github.io/dm-evidence-hub/" },
  { label: "DM Myths Playlist", href: "https://www.youtube.com/watch?v=qC8KvkrebPg&list=PLp10aZZZC0JkHpUoI83aqCW1z2JW3E8Jn" },
];

export function NavLinks() {
  return (
    <div className="hidden md:flex items-center">
      {links.map((link, i) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative px-4 py-2 text-sm text-gray-600 hover:text-[#009AAB] transition-colors whitespace-nowrap group"
        >
          {link.label}
          <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#009AAB] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
          {i < links.length - 1 && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200" />
          )}
        </a>
      ))}
    </div>
  );
}
