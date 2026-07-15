"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SlidePage {
  id: string;
  label: string;
  bg?: string;
  content: ReactNode;
}

interface SlideDeckProps {
  pages: SlidePage[];
  current: number;
  onChange: (idx: number) => void;
}

/**
 * SlideDeck — ultra-fast page switcher.
 * Only renders the ACTIVE page (not all pages).
 * Uses CSS transform for GPU-accelerated transition.
 * No Framer Motion — pure CSS for zero overhead.
 *
 * G-03: Direction-aware page transitions.
 *   - Forward swipe/click → next page slides in from the right
 *   - Backward swipe/click → previous page slides in from the left
 *   - Subtle blur + scale for depth, ~420ms cubic-bezier ease
 *   - Honors prefers-reduced-motion via CSS override
 */
export default function SlideDeck({ pages, current, onChange }: SlideDeckProps) {
  const total = pages.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);
  const horizontalRef = useRef<boolean | null>(null);

  // G-03: track direction for the transition class
  const prevPageRef = useRef<number>(current);
  const [direction, setDirection] = useState<"forward" | "backward" | null>(null);

  useEffect(() => {
    if (current !== prevPageRef.current) {
      setDirection(current > prevPageRef.current ? "forward" : "backward");
      prevPageRef.current = current;
    }
  }, [current]);

  // Keep a ref to current so the keyboard handler always sees the latest
  // value without needing to re-subscribe on every page change.
  const currentRef = useRef<number>(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const goTo = useCallback(
    (idx: number) => {
      const next = Math.max(0, Math.min(total - 1, idx));
      if (next !== currentRef.current) onChange(next);
    },
    [total, onChange]
  );

  // Keyboard nav — subscribes ONCE (no re-subscription on page change)
  // DISABLED on Trip page so arrow keys change days instead of pages.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Don't hijack arrows if focus is inside a focusable carousel/figure
      const active = document.activeElement;
      if (active) {
        const role = active.getAttribute("aria-roledescription");
        if (role === "carousel") return; // let the inner carousel handle it
      }
      // Skip page-level arrow nav on Trip page — the Carousel handles day switching
      const currentActivePage = pages[currentRef.current];
      if (currentActivePage?.id === "trip") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goTo(currentRef.current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goTo(currentRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, pages]);

  // Touch swipe — DISABLED on Trip page so swipe can change days instead
  // of changing tabs. The bottom tab bar is sufficient for tab navigation.
  const activePage = pages[current];
  const swipeDisabled = activePage?.id === "trip";

  const onTouchStart = (e: React.TouchEvent) => {
    if (swipeDisabled) return;
    if (e.touches.length !== 1) return;
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
    horizontalRef.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (swipeDisabled) return;
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.touches[0].clientX - touchX.current;
    const dy = e.touches[0].clientY - touchY.current;
    if (horizontalRef.current === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      horizontalRef.current = Math.abs(dx) > Math.abs(dy) * 1.3;
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeDisabled) return;
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    touchY.current = null;
    if (horizontalRef.current === false) return;
    if (Math.abs(dx) < 60) return;
    goTo(dx < 0 ? current + 1 : current - 1);
    horizontalRef.current = null;
  };

  const transitionClass =
    direction === "forward"
      ? "anim-page-forward"
      : direction === "backward"
        ? "anim-page-backward"
        : "anim-fade-in-up";

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Only render the active page — massive perf win */}
      <div
        key={activePage.id}
        className={cn(
          "h-full overflow-y-auto overflow-x-hidden",
          transitionClass
        )}
      >
        {/* Top spacer for app bar; bottom spacer for tab bar */}
        <div className="pt-14 lg:pt-16" />
        {activePage.content}
        <div className="h-16 lg:h-20" />
      </div>
    </div>
  );
}
