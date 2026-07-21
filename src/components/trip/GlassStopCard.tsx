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

import { memo, useMemo, useRef, type ReactNode } from "react";
import type { Place } from "@/lib/trip-data";
import { getImage } from "@/lib/images";
import { LazyImage } from "@/lib/use-lazy-image";
import { CATEGORY_COLOR } from "@/lib/category-icons";
import { Icon as SvgIcon, CATEGORY_TO_ICON } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";
import { useAdaptiveText } from "@/lib/adaptive-text";
import { Share2, Gem } from "lucide-react";

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
  const iconName = CATEGORY_TO_ICON[cat] ?? "nearby";
  // M-06: Proposal stop gets distinct visual treatment — golden glow border,
  // a "The Proposal" badge with a gem icon, and a slow pulse animation.
  const isProposal = cat === "proposal";

  // Adaptive text colors — sample the actual card background and pick the
  // best contrast color in real time. Handles glassmorphic translucent
  // surfaces, gradient backgrounds, and theme switches.
  const titleRef = useRef<HTMLElement>(null);
  const descRef = useRef<HTMLElement>(null);
  const titleColor = useAdaptiveText(titleRef, { largeText: true });
  const descColor = useAdaptiveText(descRef, { largeText: false });

  // M-08: Share button — uses Web Share API on mobile, clipboard fallback.
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/#/trip/stop-${place.id}`;
    const shareText = `Check out this stop on our wilderness trip: ${place.name}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: place.name, text: shareText, url: shareUrl });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
      }
    } catch {
      // user cancelled — non-fatal
    }
  };

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
      {/* Pulsing waypoint dot — proposal stop uses a larger pulsing gold dot */}
      <span
        aria-hidden
        className={cn(
          "absolute top-3 h-3.5 w-3.5 rounded-full",
          isProposal ? "anim-pulse-scale h-5 w-5 left-0 sm:left-1.5" : "anim-pulse left-1.5 sm:left-2.5"
        )}
        style={{
          backgroundColor: isProposal ? "#fbbf24" : color,
          boxShadow: isProposal
            ? `0 0 0 4px rgba(250,243,227,0.9), 0 0 16px #fbbf24, 0 0 32px rgba(251,191,36,0.5)`
            : `0 0 0 3px rgba(250,243,227,0.9), 0 0 8px ${color}`,
        }}
      />

      <button
        type="button"
        onClick={() => onSelect?.(place)}
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl text-left",
          "backdrop-blur-md border anim-hover-lift anim-glow-sweep tap-feedback",
          "p-3 md:p-4",
          // Theme-aware surface: uses --card (dark in dark themes, cream in light)
          // with 80% opacity for the glassmorphic effect.
          "bg-[var(--card)]/80 border-[var(--border)]",
          isProposal && "border-amber-400/60 ring-2 ring-amber-400/30 anim-pulse-glow"
        )}
        style={
          {
            // Subtle hover border tint per category
            ["--hover-color" as string]: isProposal ? "#fbbf24" : color,
          } as React.CSSProperties
        }
        aria-label={`Open details for ${place.name}`}
      >
        {/* M-06: Proposal stop — "The Proposal" banner with gem icon */}
        {isProposal && (
          <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg">
            <Gem className="w-2.5 h-2.5" aria-hidden />
            The Proposal
          </div>
        )}

        <div className="flex gap-3 md:gap-4">
          {/* Thumbnail with masked edge */}
          <div
            className="relative h-16 w-20 sm:h-20 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--card)]/40"
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
                style={{ backgroundColor: `${color}55`, color }}
                aria-hidden
              >
                <SvgIcon name={iconName} size={24} />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-on-brass">
                  <span aria-hidden style={{ color: isProposal ? "#fbbf24" : color }}>
                    <SvgIcon name={iconName} size={14} />
                  </span>
                  <span>{cat}</span>
                  <span className="opacity-50">·</span>
                  <span className="text-muted-light">Stop {index + 1} of {total}</span>
                </div>
                <h3
                  ref={titleRef as React.RefObject<HTMLHeadingElement>}
                  className={cn(
                    "mt-0.5 font-serif text-base md:text-lg font-bold truncate group-hover:text-on-brass transition-colors",
                    isProposal && "text-amber-300"
                  )}
                  style={{ color: isProposal ? undefined : (titleColor ?? undefined) }}
                >
                  {place.name}
                </h3>
              </div>
              {!isProposal && place.lowEffortScenic && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: `${color}33`, color: "var(--text-on-light)" }}
                >
                  Easy
                </span>
              )}
            </div>
            <p
              ref={descRef as React.RefObject<HTMLParagraphElement>}
              className="mt-1 line-clamp-2 text-xs md:text-sm text-muted-light leading-relaxed"
              style={{ color: descColor ?? undefined }}
            >
              {place.description}
            </p>
            {place.trailDistance && (
              <div className="mt-1.5 text-[10px] text-muted-light flex items-center gap-1">
                <SvgIcon name="hike" size={10} /> {place.trailDistance}
              </div>
            )}
          </div>
        </div>

        {/* M-08: Share button — bottom-right, stops propagation so it doesn't open the dialog */}
        <button
          type="button"
          onClick={handleShare}
          className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/15 px-2 py-1 text-[9px] font-semibold text-on-light hover:bg-black/40 transition-colors tap-feedback min-h-[28px] min-w-[28px]"
          aria-label={`Share ${place.name}`}
        >
          <Share2 className="w-2.5 h-2.5" aria-hidden />
        </button>
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
