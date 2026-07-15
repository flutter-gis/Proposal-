"use client";

/**
 * Carousel.tsx
 *
 * Pure CSS-transform slide deck (NO Framer Motion for the slides themselves).
 * Only renders the active slide — siblings are unmounted to keep DOM light.
 * Memoized DaySlide-compatible API.
 *
 * Side arrows are glassmorphic. Below the slides is a "journey progress
 * spine" — a row of colored segments, one per slide, that fills as you
 * progress.
 *
 * Keyboard nav (←/→) and touch swipe are supported.
 */

import {
  Children,
  memo,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselProps {
  /** All slides — each child is one slide */
  children: ReactNode;
  /** Index of the active slide (controlled) */
  index: number;
  /** Called when the user changes slide */
  onChange: (idx: number) => void;
  /** Accent color per slide (used for the spine segment fill). */
  accents?: string[];
  /** Optional labels for the spine segments / aria-labels */
  labels?: string[];
  /** Whether to render the journey spine below the slides */
  showSpine?: boolean;
  /** Whether to render side arrows (desktop) */
  showArrows?: boolean;
  /** Slide height CSS — defaults to 100% of parent */
  className?: string;
}

function CarouselImpl({
  children,
  index,
  onChange,
  accents,
  labels,
  showSpine = true,
  showArrows = true,
  className,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const total = slides.length;
  const current = ((index % total) + total) % total;

  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);
  const horizontalRef = useRef<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (delta: number) => {
      const next = (current + delta + total) % total;
      onChange(next);
    },
    [current, total, onChange]
  );

  // Keyboard nav — scoped to the carousel container only (not global).
  // Avoids collision with SlideDeck's global ArrowLeft/Right handler.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!node.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        go(-1);
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
    horizontalRef.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.touches[0].clientX - touchX.current;
    const dy = e.touches[0].clientY - touchY.current;
    if (horizontalRef.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      horizontalRef.current = Math.abs(dx) > Math.abs(dy) * 1.3;
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - touchX.current;
    touchX.current = null;
    touchY.current = null;
    if (horizontalRef.current === false) return;
    if (Math.abs(dx) < 60) return;
    go(dx < 0 ? 1 : -1);
    horizontalRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn("relative outline-none focus-visible:ring-2 focus-visible:ring-rust-brass/40 rounded-2xl", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Slide carousel — use left/right arrow keys to navigate when focused"
    >
      {/* Slide viewport — only renders active slide */}
      <div className="relative overflow-hidden">
        {/* CSS transform keeps a GPU-accelerated crossfade */}
        <div
          key={current}
          className="anim-fade-in-up"
          style={{ animationDuration: "0.45s" }}
        >
          {slides[current]}
        </div>
      </div>

      {/* Side arrows (desktop) */}
      {showArrows && total > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className={cn(
              "absolute left-2 top-1/2 z-30 hidden -translate-y-1/2 md:flex",
              "h-11 w-11 items-center justify-center rounded-full",
              "bg-rust-bark/40 backdrop-blur-md border border-rust-brass/30 text-rust-cream",
              "hover:bg-rust-bark/60 hover:text-rust-brass tap-feedback transition-colors"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className={cn(
              "absolute right-2 top-1/2 z-30 hidden -translate-y-1/2 md:flex",
              "h-11 w-11 items-center justify-center rounded-full",
              "bg-rust-bark/40 backdrop-blur-md border border-rust-brass/30 text-rust-cream",
              "hover:bg-rust-bark/60 hover:text-rust-brass tap-feedback transition-colors"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Journey progress spine */}
      {showSpine && total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => {
            const accent = accents?.[i] ?? "#b8860b";
            const label = labels?.[i] ?? `Slide ${i + 1}`;
            const isDone = i <= current;
            return (
              <button
                key={i}
                onClick={() => onChange(i)}
                aria-label={label}
                aria-current={i === current ? "true" : undefined}
                className={cn(
                  "group relative h-2 rounded-full transition-all",
                  i === current ? "w-10" : "w-6 hover:w-8"
                )}
                style={{
                  background: isDone ? accent : "rgba(61, 40, 23, 0.15)",
                }}
              >
                <span className="sr-only">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const Carousel = memo(CarouselImpl);
export default Carousel;
