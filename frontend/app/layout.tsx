import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import PageWrapper from "./components/PageWrapper";

export const metadata: Metadata = {
  title: "BD Garments Career — Job Portal",
  description: "Find the latest garment, textile and RMG jobs across Bangladesh.",
};

/**
 * Fonts are loaded from the local CSS font stack (globals.css) so the
 * project builds and runs without external network access to Google Fonts.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <PageWrapper>{children}</PageWrapper>
        <footer className="site-footer">
          <div className="container" style={{ paddingBlock: "1.6rem", textAlign: "center", color: "var(--ink-soft)", fontSize: "0.92rem" }}>
            © {new Date().getFullYear()} BD Garments Career. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}