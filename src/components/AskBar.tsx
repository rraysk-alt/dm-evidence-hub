"use client";

import { useState } from "react";

/** Teal ask-bar in the nav — opens the EvidenceChat widget with the typed question. */
export function AskBar() {
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("dm-chat:ask", { detail: { q: q.trim() } })
    );
    setQ("");
  }

  return (
    <form onSubmit={submit} className="hidden md:block flex-1 max-w-md mx-6">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask the Evidence Bot anything..."
          className="w-full rounded-full bg-[#009BAD] py-2.5 pl-5 pr-12 text-[13.5px] font-medium text-white placeholder-white/90 shadow-sm outline-none transition hover:bg-[#008A9B] focus:bg-white focus:text-[#333337] focus:placeholder-gray-400 focus:ring-2 focus:ring-[#009BAD]"
        />
        <button
          type="submit"
          aria-label="Ask the Evidence Bot"
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 [input:focus~&]:bg-[#009BAD] [input:focus~&]:text-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
