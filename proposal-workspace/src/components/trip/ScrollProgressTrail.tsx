"use client";

/**
 * ScrollProgressTrail.tsx
 *
 * A 2px golden progress line fixed at the top of the viewport that fills
 * as the user scrolls through the SlideDeck's custom scroll container.
 *
 * Uses transform: scaleX() (GPU-composited) for buttery-smooth updates.
 * Uses requestAnimationFrame to throttle scroll events to one paint per
 * frame. The progress element itself is position:fixed so it stays
 * anchored to the viewport even during crossfade page transitions.
 *
 * IMPORTANT: Re-attaches to the scroll container whenever `currentPage`
 * changes. The SlideDeck uses `key={activePage.id}` which unmounts and
 * remounts the scroll container on every tab change — without this
 * re-attachment, the progress bar would point to a detached element.
 */

import { useEffect, useRef } from "react";
import { useTrip } from "@/lib/trip-context";

export default function ScrollProgressTrail() {
  const trailRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentPage } = useTrip();

  useEffect(() => {
    const el = trailRef.current;
    if (!el) return;

    let scrollContainer: HTMLElement | null = null;

    const findContainer = (): HTMLElement | null => {
      const scope =
        document.querySelector<HTMLElement>("#main-content") ?? document;
      return scope.querySelector<HTMLElement>("[class*='overflow-y-auto']");
    };

    const update = () => {
      rafRef.current = null;
      if (!scrollContainer) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const max = scrollHeight - clientHeight;
      const progress = max > 0 ? scrollTop / max : 0;
      const clamped = Math.max(0, Math.min(1, progress));
      el.style.transform = `scaleX(${clamped})`;
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    const cleanup = () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", onScroll);
        scrollContainer = null;
      }
      if (roRef.current) {
        roRef.current.disconnect();
        roRef.current = null;
      }
      if (retryRef.current) {
        clearTimeout(retryRef.current);
        retryRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const attach = () => {
      scrollContainer = findContainer();
      if (!scrollContainer) {
        // SlideDeck hasn't rendered yet — retry shortly (with cleanup tracking)
        retryRef.current = setTimeout(attach, 200);
        return;
      }
      scrollContainer.addEventListener("scroll", onScroll, { passive: true });
      const ro = new ResizeObserver(() => onScroll());
      ro.observe(scrollContainer);
      roRef.current = ro;
      update(); // initial paint
    };

    attach();

    return cleanup;
  }, [currentPage]); // Re-run on page change — fixes the stale-listener bug

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 200,
        pointerEvents: "none",
        backgroundColor: "rgba(184, 134, 11, 0.15)",
      }}
    >
      <div
        ref={trailRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "var(--rust-brass, #b8860b)",
          transformOrigin: "left center",
          transform: "scaleX(0)",
          willChange: "transform",
          boxShadow: "0 0 8px rgba(184, 134, 11, 0.6)",
        }}
      />
    </div>
  );
}
