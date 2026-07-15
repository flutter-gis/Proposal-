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
 * The SlideDeck renders an inner `<div className="h-full overflow-y-auto">`
 * as its scroll container. We locate it by selecting the first descendant
 * of the page wrapper with `overflow-y-auto`. This is intentionally loose
 * — if the SlideDeck layout changes, this selector still finds the right
 * element as long as it uses Tailwind's `overflow-y-auto` utility.
 */

import { useEffect, useRef } from "react";

export default function ScrollProgressTrail() {
  const trailRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = trailRef.current;
    if (!el) return;

    // Find the SlideDeck's scroll container. It's the first descendant
    // element with `overflow-y-auto` (Tailwind utility) inside the page.
    // We use a small polling loop because the SlideDeck may not have
    // rendered its active page on mount.
    let scrollContainer: HTMLElement | null = null;
    const findContainer = (): HTMLElement | null => {
      const candidate = document.querySelector<HTMLElement>(
        "main [class*='overflow-y-auto']"
      );
      return candidate;
    };

    const update = () => {
      rafRef.current = null;
      if (!scrollContainer) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const max = scrollHeight - clientHeight;
      const progress = max > 0 ? scrollTop / max : 0;
      // Clamp to [0, 1] for safety
      const clamped = Math.max(0, Math.min(1, progress));
      el.style.transform = `scaleX(${clamped})`;
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    const attach = () => {
      scrollContainer = findContainer();
      if (!scrollContainer) {
        // SlideDeck hasn't rendered yet — retry shortly
        setTimeout(attach, 200);
        return;
      }
      scrollContainer.addEventListener("scroll", onScroll, { passive: true });
      // Also observe resize — content height changes (e.g. images loading)
      // should refresh the progress bar.
      const ro = new ResizeObserver(() => onScroll());
      ro.observe(scrollContainer);
      update(); // initial paint
      // Store for cleanup
      (attach as any)._ro = ro;
    };

    attach();

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", onScroll);
      }
      const ro = (attach as any)._ro as ResizeObserver | undefined;
      ro?.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
