"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initSite } from "@/scripts/custom";

/**
 * Boots custom.js (Lenis + GSAP + ScrollTrigger) on the client.
 * Re-runs on every route change so animations bind to the new page.
 */
export default function SiteScripts() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanup = initSite();
    return cleanup;
  }, [pathname]);

  return null;
}
