import { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm here to help with questions about orders, refunds, or how Adyoolau works. What can I help with?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  // Tracks the visible viewport height on mobile so the panel can shrink to
  // sit above the on-screen keyboard instead of being covered by it. Falls
  // back to null (no override) on browsers without the visualViewport API.
  const [viewportHeight, setViewportHeight] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Keep the panel's height in sync with the actual visible viewport while
  // it's open, so opening the keyboard shrinks the panel (keeping the input
  // in view) instead of the keyboard just covering the bottom of a
  // fixed-size box. This only matters on mobile, where the floating-card
  // layout below is replaced by a full-screen one anyway.
  useEffect(() => {
    if (!open || typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;
    const updateHeight = () => setViewportHeight(vv.height);

    updateHeight();
    vv.addEventListener("resize", updateHeight);
    vv.addEventListener("scroll", updateHeight);
    return () => {
      vv.removeEventListener("resize", updateHeight);
      vv.removeEventListener("scroll", updateHeight);
    };
  }, [open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setError("");
    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/support/chat", {
        message: trimmed,
        history: nextMessages.slice(-13, -1), // exclude the just-added user message, it's sent separately
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-navy-900 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[28rem] sm:w-80 sm:overflow-hidden sm:rounded-lg sm:border sm:border-navy-700 sm:shadow-2xl sm:shadow-black/50 sm:w-96"
          style={{
            // Use dvh as the baseline (resizes with the keyboard on modern
            // mobile browsers), then override with the live visualViewport
            // measurement when we have one, as a fallback for browsers
            // where dvh alone doesn't track the keyboard reliably.
            height: viewportHeight ? `${viewportHeight}px` : "100dvh",
          }}
        >
          <div className="flex items-center justify-between border-b border-navy-700/60 bg-navy-800 px-4 py-3">
            <p className="font-display text-sm text-ivory">Adyoolau Support</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-ivory/50 hover:text-ivory"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-gold-500 text-ink"
                    : "bg-navy-800 text-ivory/80"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] rounded-lg bg-navy-800 px-3 py-2 text-sm text-ivory/40">
                Typing…
              </div>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-navy-700/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-ink shadow-lg shadow-black/40 hover:bg-gold-400"
      >
        {open ? (
          <span className="text-2xl leading-none">✕</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </>
  );
}