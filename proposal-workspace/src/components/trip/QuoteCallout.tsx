"use client";

/**
 * QuoteCallout.tsx — Robust quote carousel (BUG-03 fix)
 *
 * Features per spec H-03:
 * - Pause on hover, resume on leave
 * - Clear interval on tab-hide, reset on tab-show
 * - ArrowLeft/ArrowRight keyboard navigation
 * - 9s interval with visible progress bar
 * - Both quote body + dot indicator driven from same idx state (no desync)
 */

import { useEffect, useMemo, useState, useRef } from "react";
import { getQuotes, type QuoteTheme, type Quote } from "@/lib/quotes";
import { cn } from "@/lib/utils";

interface QuoteCalloutProps {
  theme: QuoteTheme;
  count?: number;
  intervalMs?: number;
  autoRotate?: boolean;
  light?: boolean;
  seed?: string;
  className?: string;
  showDots?: boolean;
}

export default function QuoteCallout({
  theme,
  count = 4,
  intervalMs = 9000,
  autoRotate = true,
  light = false,
  seed,
  className,
  showDots = true,
}: QuoteCalloutProps) {
  const s = seed ?? theme;
  const quotes: Quote[] = useMemo(() => getQuotes(theme, count, s), [theme, count, s]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset index when theme changes
  useEffect(() => {
    setIdx(0);
    setProgress(0);
  }, [theme, s, count]);

  // Auto-advance with pause-on-hover + visibility handling
  useEffect(() => {
    if (!autoRotate || quotes.length <= 1) return;

    const startTimers = () => {
      // Clear any existing
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);

      const tickMs = 50;
      const ticks = intervalMs / tickMs;
      let tickCount = 0;

      progressRef.current = setInterval(() => {
        if (paused) return;
        tickCount++;
        setProgress((tickCount / ticks) * 100);
      }, tickMs);

      intervalRef.current = setInterval(() => {
        if (paused) return;
        tickCount = 0;
        setProgress(0);
        setIdx((i) => (i + 1) % quotes.length);
      }, intervalMs);
    };

    startTimers();

    // Handle tab visibility — clear on hide, restart on show
    const onVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
      } else {
        startTimers();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [autoRotate, intervalMs, quotes.length, paused]);

  // Keyboard navigation — scoped to the figure element only (not global).
  // Avoids collision with SlideDeck's global ArrowLeft/Right handler which
  // would otherwise advance both the quote AND the page on a single keypress.
  const figureRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = figureRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Only handle if the focus is inside this figure
      if (!node.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        setIdx((i) => (i - 1 + quotes.length) % quotes.length);
        setProgress(0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        setIdx((i) => (i + 1) % quotes.length);
        setProgress(0);
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [quotes.length]);

  if (quotes.length === 0) return null;
  const q = quotes[idx % quotes.length];

  return (
    <figure
      ref={figureRef}
      tabIndex={0}
      className={cn(
        "relative overflow-hidden rounded-2xl border outline-none focus-visible:ring-2 focus-visible:ring-rust-brass/50",
        light
          ? "bg-white/8 border-white/15 backdrop-blur-md text-rust-cream"
          : "leather-card text-rust-bark",
        "p-6 md:p-8",
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Rotating quotes — use left/right arrow keys to navigate when focused"
    >
      {/* Decorative quote glyph */}
      <span
        aria-hidden
        className={cn(
          "absolute -top-3 left-4 font-serif text-6xl leading-none select-none",
          light ? "text-rust-brass/60" : "text-rust-brass/40"
        )}
      >
        "
      </span>

      <blockquote
        key={q.text}
        className={cn(
          "relative z-10 anim-fade-in-up font-serif italic leading-relaxed text-lg md:text-xl",
          light ? "text-rust-cream" : "text-rust-bark"
        )}
      >
        {q.text}
      </blockquote>

      <figcaption
        className={cn(
          "relative z-10 mt-3 text-sm uppercase tracking-widest",
          light ? "text-rust-brass" : "text-rust-ember"
        )}
      >
        — {q.author}
        {q.source && (
          <span className={cn("ml-1 italic normal-case tracking-normal", light ? "text-rust-cream/60" : "text-rust-bark/60")}>
            · {q.source}
          </span>
        )}
      </figcaption>

      {/* Progress bar */}
      {autoRotate && quotes.length > 1 && (
        <div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 transition-opacity",
            paused ? "opacity-30" : "opacity-100"
          )}
          style={{
            width: `${progress}%`,
            background: light ? "#b8860b" : "#b8541f",
          }}
          aria-hidden
        />
      )}

      {/* Rotation dots — driven from same idx as the quote body */}
      {showDots && quotes.length > 1 && (
        <div className="relative z-10 mt-4 flex items-center gap-1.5" role="tablist">
          {quotes.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Quote ${i + 1}`}
              onClick={() => { setIdx(i); setProgress(0); }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === idx
                  ? light
                    ? "w-6 bg-rust-brass"
                    : "w-6 bg-rust-ember"
                  : light
                  ? "w-1.5 bg-rust-cream/30 hover:bg-rust-cream/60"
                  : "w-1.5 bg-rust-bark/20 hover:bg-rust-bark/40"
              )}
            >
              <span className="sr-only">Quote {i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
