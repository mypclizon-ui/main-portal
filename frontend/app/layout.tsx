import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageWrapper from "./components/PageWrapper";
import ChatPopup from "./components/ChatPopup";
import CookiesConsent from "./components/CookiesConsent";

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
        <Footer />
        <ChatPopup />
        <CookiesConsent />
      </body>
    </html>
  );
}