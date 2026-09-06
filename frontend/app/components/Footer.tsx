"use client";

import Link from "next/link";

const SOCIALS = [
  { label: "Facebook", url: "https://facebook.com/bdgarmentscareer", icon: "f" },
  { label: "Twitter / X", url: "https://twitter.com/bdgarmentscareer", icon: "𝕏" },
  { label: "LinkedIn", url: "https://linkedin.com/company/bdgarmentscareer", icon: "in" },
  { label: "WhatsApp", url: "https://wa.me/8801712345678", icon: "wa" },
  { label: "YouTube", url: "https://youtube.com/@bdgarmentscareer", icon: "▶" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const govUrl = typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_GOV_PORTAL_URL || "https://bdgc-gov-portal"
    : "#";

  return (
    <footer className="site-footer">
      <div className="container" style={{ paddingBlock: "2.4rem 1.4rem" }}>
        {/* Link columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.6rem", marginBottom: "2rem" }}>
          <div>
            <h4 className="widget-title" style={{ color: "#fff" }}>About</h4>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
              Empowering the workforce behind Bangladesh&apos;s garment export industry with
              real jobs and career guidance.
            </p>
          </div>
          <div>
            <h4 className="widget-title" style={{ color: "#fff" }}>Quick Links</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li style={{ marginBottom: "0.4rem" }}><Link href="/jobs">Browse Jobs</Link></li>
              <li style={{ marginBottom: "0.4rem" }}><Link href="/profile">My Profile</Link></li>
              <li style={{ marginBottom: "0.4rem" }}><Link href="/signup">Sign Up</Link></li>
              <li><Link href={govUrl} target="_blank" rel="noopener noreferrer">Gov Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="widget-title" style={{ color: "#fff" }}>Contact</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, color: "var(--ink-soft)", fontSize: "0.9rem" }}>
              <li>Dhaka, Bangladesh</li>
              <li>info@bdgarmentscareer.com</li>
              <li>+880 1712-345678</li>
            </ul>
          </div>
          <div>
            <h4 className="widget-title" style={{ color: "#fff" }}>Follow Us</h4>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)", color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.85rem",
                    transition: "background 0.2s ease, transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--brand)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: "1.2rem", textAlign: "center", color: "var(--ink-soft)", fontSize: "0.9rem" }}>
          © {year} BD Garments Career. All rights reserved.
        </div>
      </div>
    </footer>
  );
}