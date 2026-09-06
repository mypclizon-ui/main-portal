"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GDPR-style cookies consent popup. Shows once until the user accepts.
 * Consent is stored in localStorage so it doesn't reappear every visit.
 */
export default function CookiesConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const choice = window.localStorage.getItem("bdgc_cookies_consent");
      if (!choice) {
        // Small delay so the page paints first.
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function decide(accept: boolean) {
    try {
      window.localStorage.setItem("bdgc_cookies_consent", accept ? "accepted" : "declined");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            left: "50%",
            bottom: 16,
            transform: "translateX(-50%)",
            maxWidth: 640,
            width: "calc(100% - 32px)",
            background: "#1c2420",
            color: "#f5f5f5",
            borderRadius: 16,
            padding: "1.1rem 1.3rem",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            zIndex: 12000,
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <strong style={{ display: "block", fontSize: "1.02rem", marginBottom: "0.25rem" }}>🍪 We value your privacy</strong>
              We use cookies to improve your browsing experience and analyze site traffic. By clicking "Accept", you consent to our use of cookies.
            </div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button onClick={() => decide(true)} style={{ background: "var(--brand)", color: "#fff", border: "none", borderRadius: 999, padding: "0.5rem 1.2rem", fontWeight: 700, cursor: "pointer" }}>Accept</button>
              <button onClick={() => decide(false)} style={{ background: "transparent", color: "#ddd", border: "1px solid #666", borderRadius: 999, padding: "0.5rem 1.2rem", cursor: "pointer" }}>Decline</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}