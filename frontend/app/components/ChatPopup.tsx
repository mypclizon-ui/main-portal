"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Floating chat popup widget. Opens a small chat panel in the corner.
 * (Demo UI — wire it to a real backend or support platform as needed.)
 */
export default function ChatPopup() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hi! 👋 How can we help you find your next garment job today?" },
  ]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setMessage("");
    // Simple canned reply for demo.
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Thanks! Our team will get back to you shortly. You can also browse jobs above. 😊" },
      ]);
    }, 600);
  }

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              bottom: 88,
              right: 20,
              width: 320,
              maxWidth: "calc(100vw - 40px)",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              overflow: "hidden",
              zIndex: 10000,
              display: "flex",
              flexDirection: "column",
              fontFamily: "var(--font-body)",
            }}
          >
            <div style={{ background: "var(--brand)", color: "#fff", padding: "0.9rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontWeight: 700 }}>💬 Garments Career Help</strong>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }} aria-label="Close chat">×</button>
            </div>
            <div style={{ padding: "1rem", minHeight: 180, maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", background: m.from === "user" ? "var(--brand)" : "var(--bg-soft)", color: m.from === "user" ? "#fff" : "var(--ink)", padding: "0.5rem 0.8rem", borderRadius: 14, maxWidth: "85%", fontSize: "0.9rem" }}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={send} style={{ display: "flex", gap: "0.4rem", padding: "0.6rem", borderTop: "1px solid var(--line)" }}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message…"
                style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 999, padding: "0.55rem 0.9rem", outline: "none", fontSize: "0.9rem" }}
              />
              <button type="submit" style={{ background: "var(--brand)", color: "#fff", border: "none", borderRadius: 999, padding: "0.55rem 1rem", fontWeight: 700, cursor: "pointer" }}>Send</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "var(--brand)",
          color: "#fff",
          border: "none",
          boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
          cursor: "pointer",
          fontSize: "1.6rem",
          display: "grid",
          placeItems: "center",
          zIndex: 10001,
        }}
        aria-label="Open chat"
      >
        {open ? "×" : "💬"}
      </motion.button>
    </>
  );
}