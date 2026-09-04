"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initPageTransitions } from "@/scripts/custom";

/**
 * Swup-style page transitions on top of the Next router. Renders nothing;
 * it bridges custom.js to the router: internal link clicks run the leave
 * animation before router.push, and a pathname change kicks off the enter
 * animation. The header is fixed in the layout and stays put; only the
 * page content (.site-page in layout.js) changes.
 *
 * Two hooks per route change: a layout effect hides the new page before it
 * paints, and a passive effect starts the enter once the page scripts have
 * booted. Passive effects run in tree order, so <SiteScripts /> (rendered
 * before this in layout.js) has already called initSite() by then and every
 * ScrollTrigger measured the page untransformed.
 * All timing and motion live in custom.css (Page transitions section).
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const transitions = useRef(null);
  const mountedLayout = useRef(false);
  const mountedEffect = useRef(false);

  useEffect(() => {
    transitions.current = initPageTransitions({ navigate: (href) => router.push(href) });
    return () => {
      transitions.current?.destroy();
      transitions.current = null;
    };
  }, [router]);

  useLayoutEffect(() => {
    if (!mountedLayout.current) {
      mountedLayout.current = true;
      return;
    }
    transitions.current?.onRouteChange();
  }, [pathname]);

  useEffect(() => {
    if (!mountedEffect.current) {
      mountedEffect.current = true;
      return;
    }
    transitions.current?.onRouteReady();
  }, [pathname]);

  return null;
}
