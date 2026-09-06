"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Site header shared across pages. Includes the link to the separate
 * government jobs portal (a standalone site) opened in a new tab.
 */
export default function Header() {
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setAuthed(Boolean(window.localStorage.getItem("bdgc_token")));
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand-text">
          BD Garments Career
        </Link>

        <nav aria-label="Primary">
          <ul className="nav">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/jobs">Jobs</Link></li>
            <li>
              <a
                className="gov-link"
                href={process.env.NEXT_PUBLIC_GOV_PORTAL_URL || "https://bdgc-gov-frontend.onrender.com"}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the Government Jobs portal"
              >
                Gov Jobs
              </a>
            </li>
            {authed ? (
              <li><Link href="/profile">My Profile</Link></li>
            ) : (
              <>
                <li><Link href="/login">Sign In</Link></li>
                <li><Link className="ghost-btn" href="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}