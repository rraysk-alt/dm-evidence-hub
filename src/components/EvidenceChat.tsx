"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const WEBHOOK_URL =
  "https://marketing-nam.app.n8n.cloud/webhook/d105c3ad-3488-438c-b405-b856c90ce80e/chat";

const WELCOME =
  "I'm the DM Evidence AI ChatBot, I can answer any question on DM's studies, fire away!";

const STARTERS = [
  "What studies do we have on chairtime reduction?",
  "What's the strongest evidence on AI accuracy?",
  "Which studies cover patient compliance?",
];

type FollowUp = { num: string; label: string };

type Msg = {
  role: "user" | "bot";
  text: string;
  followUps?: FollowUp[];
  followUpTitle?: string;
};

const OPTION_RE = /\*\*(\d)\*\*\s*(?:→|->|–|-)\s*([^\n]+)/g;

/** Split a bot answer into the main body and the trailing "What next?" options. */
function parseBotMessage(raw: string): Msg {
  const parts = raw.split(/\n\s*---\s*\n/);
  if (parts.length > 1) {
    const tail = parts[parts.length - 1];
    const options: FollowUp[] = [];
    let m: RegExpExecArray | null;
    const re = new RegExp(OPTION_RE.source, "g");
    while ((m = re.exec(tail)) !== null) {
      options.push({ num: m[1], label: m[2].trim() });
    }
    if (options.length > 0) {
      const titleMatch = tail.match(/\*\*([^*\n]+)\*\*/);
      return {
        role: "bot",
        text: parts.slice(0, -1).join("\n\n---\n\n").trim(),
        followUps: options,
        followUpTitle: titleMatch ? titleMatch[1].replace(/Reply with a number:?/i, "").trim() : undefined,
      };
    }
  }
  return { role: "bot", text: raw };
}

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("dm-evidence-chat-session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("dm-evidence-chat-session", id);
  }
  return id;
}

const mdComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-[#00808F] underline decoration-[#84CFE8] decoration-2 underline-offset-2 hover:text-[#009BAD] hover:decoration-[#009BAD] after:content-['_↗'] after:text-[0.85em] after:opacity-80"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="mt-4 mb-2 border-b-2 border-[#C9E8F4] pb-1 text-[15px] font-semibold text-[#007987]"
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="my-2 leading-relaxed" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="my-2 list-disc pl-5 space-y-1" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="my-2 list-decimal pl-5 space-y-1" />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="my-3 rounded-lg border-l-4 border-[#009BAD] bg-[#E6F5FA] px-4 py-3 not-italic [&>p]:my-0"
    />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-[#C9E8F4]">
      <table {...props} className="w-full border-collapse text-[12.5px]" />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="border border-[#009BAD] bg-[#009BAD] px-3 py-2 text-left font-semibold text-white"
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="border border-[#C9E8F4] px-3 py-2 align-top" />
  ),
  hr: () => <hr className="my-4 border-t border-[#C9E8F4]" />,
};

export function EvidenceChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Let the nav AskBar open the chat and submit a question.
  useEffect(() => {
    const handler = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<{ q?: string }>).detail?.q;
      if (q) sendRef.current(q);
    };
    window.addEventListener("dm-chat:ask", handler);
    return () => window.removeEventListener("dm-chat:ask", handler);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          sessionId: getSessionId(),
          chatInput: trimmed,
        }),
      });
      const data = await res.json();
      const output: string =
        data.output ?? data.text ?? "Sorry, something went wrong. Please try again.";
      setMessages((m) => [...m, parseBotMessage(output)]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Sorry, I couldn't reach the evidence library. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }
  sendRef.current = send;

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close evidence chat" : "Open evidence chat"}
        className={
          open
            ? "fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#009BAD] text-white shadow-lg transition hover:bg-[#007987] hover:shadow-xl"
            : "fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-full bg-[#009BAD] py-3.5 pl-5 pr-6 text-white shadow-lg transition hover:bg-[#007987] hover:shadow-xl"
        }
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 3C7.03 3 3 6.58 3 11c0 2.05.87 3.92 2.3 5.33-.18 1.18-.65 2.4-1.55 3.35-.18.19-.05.5.21.49 1.84-.07 3.43-.76 4.61-1.5 1.05.34 2.2.53 3.43.53 4.97 0 9-3.58 9-8s-4.03-8-9-8z" />
            </svg>
            <span className="text-[14px] font-semibold whitespace-nowrap">Ask the Evidence Bot</span>
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[60] flex h-[640px] max-h-[75vh] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b-[3px] border-[#009BAD] bg-white px-4 py-3">
            <Image src="/logo.png" alt="DentalMonitoring" width={150} height={28} className="h-6 w-auto" />
            <p className="mt-1.5 text-[15px] font-bold text-[#009BAD]">
              The DM Evidence AI ChatBot
            </p>
            <p className="text-[12px] text-gray-500">
              Evidence-based answers from the evidence library
            </p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F7FBFD] px-4 py-4">
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#009BAD] px-4 py-2.5 text-[13.5px] leading-relaxed text-white">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex flex-col items-start gap-2">
                  <div className="max-w-[95%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-[13.5px] text-[#333337] shadow-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-col items-start gap-1.5 pl-1">
                      {msg.followUpTitle && (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                          {msg.followUpTitle}
                        </span>
                      )}
                      {msg.followUps.map((f) => (
                        <button
                          key={f.num}
                          onClick={() => send(f.label)}
                          disabled={busy}
                          className="rounded-full border border-[#009BAD] bg-white px-3.5 py-1.5 text-left text-[12.5px] font-medium text-[#007987] transition hover:bg-[#009BAD] hover:text-white disabled:opacity-50"
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
            {messages.length === 1 && !busy && (
              <div className="flex flex-col items-start gap-1.5 pl-1 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Try asking
                </span>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-[#009BAD] bg-white px-3.5 py-1.5 text-left text-[12.5px] font-medium text-[#007987] transition hover:bg-[#009BAD] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {busy && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm w-fit">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#009BAD] [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#009BAD] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#009BAD] [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any DM study..."
              className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-[13.5px] outline-none transition focus:border-[#009BAD] focus:ring-2 focus:ring-[#C9E8F4]"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#009BAD] text-white transition hover:bg-[#007987] disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
