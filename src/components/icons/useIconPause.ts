"use client";

/**
 * useIconPause.ts
 *
 * IntersectionObserver hook that pauses SMIL animations when an icon
 * scrolls offscreen. Returns a ref + a boolean "paused" state.
 *
 * When paused, the Icon component adds a CSS class that sets
 * `animate, animateTransform { display: none }` — zero CPU cost.
 */

import { useEffect, useRef, useState, type RefObject } from "react";

export function useIconPause<T extends Element = SVGSVGElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion — always pause
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setPaused(!entry.isIntersecting);
        }
      },
      { rootMargin: "50px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, paused];
}
