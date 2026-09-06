"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Wraps page content with a subtle fade/slide on route change for smooth,
 * professional navigation animations.
 */
export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}