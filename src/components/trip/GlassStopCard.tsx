"use client";

/**
 * GlassStopCard.tsx
 *
 * Two exports:
 *
 *   1. GlassStopCard — glassmorphic stop card with:
 *      - vertical trail-spine connector on the left
 *      - pulsing waypoint dot
 *      - hover lift + glow sweep
 *      - thumbnail with masked edge
 *
 *   2. WaxSealBadge — radial-gradient wax seal with random rotation
 *      and wobble on hover.
 *
 * Both are memoized.
 */

import { memo, useMemo, type ReactNode } from "react";
import type { Place } from "@/lib/trip-data";
import { getImage } from "@/lib/images";
import { LazyImage } from "@/lib/use-lazy-image";
import { CATEGORY_ICON, CATEGORY_COLOR } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface GlassStopCardProps {
  place: Place;
  index: number;
  total: number;
  onSelect?: (place: Place) => void;
  isLast?: boolean;
}

function GlassStopCardImpl({
  place,
  index,
  total,
  onSelect,
  isLast,
}: GlassStopCardProps) {
  const img = getImage(place.imageKeys?.[0] || "franconia_notch", 0);
  const cat = place.category;
  const color = CATEGORY_COLOR[cat] ?? "#5a6f4a";
  const Icon = CATEGORY_ICON[cat] ?? CATEGORY_ICON.nearby;

  return (
    <div className="relative pl-8 sm:pl-10">
      {/* Trail-spine connector */}
      <div
        aria-hidden
        className="absolute left-3 sm:left-4 top-0 w-0.5"
        style={{
          height: isLast ? "2.5rem" : "100%",
          background: `linear-gradient(180deg, ${color}, ${color}55 80%, transparent)`,
        }}
      />
      {/* Pulsing waypoint dot */}
      <span
        aria-hidden
        className="absolute left-1.5 sm:left-2.5 top-3 h-3.5 w-3.5 rounded-full anim-pulse"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 0 3px rgba(250,243,227,0.9), 0 0 8px ${color}`,
        }}
      />

      <button
        type="button"
        onClick={() => onSelect?.(place)}
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl text-left",
          "bg-white/8 backdrop-blur-md border border-white/15",
          "anim-hover-lift anim-glow-sweep tap-feedback",
          "p-3 md:p-4"
        )}
        style={
          {
            // Subtle hover border tint per category
            ["--hover-color" as string]: color,
          } as React.CSSProperties
        }
        aria-label={`Open details for ${place.name}`}
      >
        <div className="flex gap-3 md:gap-4">
          {/* Thumbnail with masked edge */}
          <div
            className="relative h-16 w-20 sm:h-20 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-rust-bark/40"
            style={{
              maskImage:
                "linear-gradient(115deg, transparent 0%, black 14%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(115deg, transparent 0%, black 14%, black 100%)",
            }}
          >
            {img ? (
              <LazyImage
                src={img}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: `${color}55` }}
                aria-hidden
              >
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-rust-brass">
                  <span aria-hidden><Icon className="h-3.5 w-3.5" style={{ color }} /></span>
                  <span>{cat}</span>
                  <span className="opacity-50">·</span>
                  <span className="text-rust-cream/70">Stop {index + 1} of {total}</span>
                </div>
                <h3 className="mt-0.5 font-serif text-base md:text-lg font-bold text-rust-cream truncate group-hover:text-rust-brass transition-colors">
                  {place.name}
                </h3>
              </div>
              {place.lowEffortScenic && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: `${color}33`, color: "#faf3e3" }}
                >
                  Easy
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-xs md:text-sm text-rust-cream/75 leading-relaxed">
              {place.description}
            </p>
            {place.trailDistance && (
              <div className="mt-1.5 text-[10px] text-rust-cream/60">
                🥾 {place.trailDistance}
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

const GlassStopCard = memo(GlassStopCardImpl);
export default GlassStopCard;

// ── WaxSealBadge ─────────────────────────────────────────────────────────
interface WaxSealBadgeProps {
  /** Label / glyph shown on the seal */
  children: ReactNode;
  /** Wax color hex — defaults to rust-wax */
  color?: string;
  /** Size in px (seal is square) — default 56 */
  size?: number;
  className?: string;
}

function WaxSealBadgeImpl({
  children,
  color = "#7a2418",
  size = 56,
  className,
}: WaxSealBadgeProps) {
  // Deterministic per-instance rotation so SSR/CSR match.
  const rotation = useMemo(() => {
    // Hash the children's string representation.
    const s = typeof children === "string" ? children : String(children ?? "");
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) % 24) - 12; // -12°..+12°
  }, [children]);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full anim-wobble wax-seal anim-hover-lift",
        className
      )}
      style={
        {
          width: size,
          height: size,
          backgroundColor: color,
          ["--rot" as string]: `${rotation}deg`,
          transform: `rotate(${rotation}deg)`,
          fontSize: size * 0.32,
        } as React.CSSProperties
      }
      aria-hidden
    >
      {children}
    </span>
  );
}

const WaxSealBadge = memo(WaxSealBadgeImpl);
export { WaxSealBadge };
