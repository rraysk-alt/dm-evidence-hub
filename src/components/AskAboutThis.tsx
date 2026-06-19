"use client";

// Contextual nudge shown on each objection page: one-click prompts that open the
// Evidence Bot pre-loaded with a question about THIS objection. Meets reps at the
// moment of need, which drives far more intentful chatbot use than a generic launcher.
export function AskAboutThis({ title }: { title: string }) {
  const ask = (q: string) =>
    window.dispatchEvent(new CustomEvent("dm-chat:ask", { detail: { q } }));

  const prompts = [
    {
      label: "Strongest evidence?",
      q: `What's the strongest evidence and which DM studies address the "${title}" objection? Give me specifics I can cite to a prospect.`,
    },
    {
      label: "Quick rebuttal",
      q: `Give me a concise, persuasive rebuttal to the "${title}" objection, backed by DentalMonitoring studies.`,
    },
  ];

  return (
    <div className="mb-8 flex flex-col gap-2 rounded-xl border border-[#009AAB]/20 bg-[#E1F5EE]/50 px-4 py-3 sm:flex-row sm:items-center">
      <span className="flex items-center gap-2 text-sm font-semibold text-[#007987]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M12 3C7.03 3 3 6.58 3 11c0 2.05.87 3.92 2.3 5.33-.18 1.18-.65 2.4-1.55 3.35-.18.19-.05.5.21.49 1.84-.07 3.43-.76 4.61-1.5 1.05.34 2.2.53 3.43.53 4.97 0 9-3.58 9-8s-4.03-8-9-8z" />
        </svg>
        Ask the Evidence Bot:
      </span>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => ask(p.q)}
            className="rounded-full border border-[#009AAB] bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#007987] transition hover:bg-[#009AAB] hover:text-white"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
