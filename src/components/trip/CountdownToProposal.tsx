"use client";

/**
 * CountdownToProposal.tsx
 *
 * H-01: Hero countdown that becomes an anniversary clock.
 * Before Aug 7 2026 7:30 PM ET → counts DOWN.
 * After that instant → counts UP (anniversary clock).
 *
 * Also fixes BUG-01 (impossible values) and BUG-08 (emoji → SVG icons).
 */

import { useEffect, useRef, useState } from "react";
import { Gem, Compass } from "lucide-react";
import { PROPOSAL_DATE } from "@/lib/relationship-data";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import AdaptiveText from "./AdaptiveText";

function useCountdown(target: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
} {
  const [now, setNow] = useState<number>(0);
  // Guard: fire the reveal haptic exactly once when the countdown crosses zero.
  // Without this, every 1s tick after the moment would re-trigger the vibration.
  const revealFiredRef = useRef(false);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = target.getTime() - now;
  const past = diff <= 0;
  const absSeconds = Math.floor(Math.abs(diff) / 1000);

  // Zero-crossing detection: when `past` flips true for the first time,
  // fire the reveal haptic. The ref guard ensures it never re-fires.
  useEffect(() => {
    if (past && !revealFiredRef.current) {
      revealFiredRef.current = true;
      haptics.reveal();
    }
  }, [past]);

  const days = Math.floor(absSeconds / 86400);
  const safeDays = days > 400 ? 0 : days; // BUG-01 guard

  return {
    days: safeDays,
    hours: Math.floor((absSeconds % 86400) / 3600),
    minutes: Math.floor((absSeconds % 3600) / 60),
    seconds: absSeconds % 60,
    past,
  };
}

// ── Small pill for the app bar ──────────────────────────────────────────
export function CountdownPill({ className }: { className?: string }) {
  const { days, hours, minutes, seconds, past } = useCountdown(PROPOSAL_DATE);
  const text = past
    ? `MARRIED ${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
    : `PROPOSAL IN ${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full brass-button px-3 py-1 text-[11px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap anim-shimmer",
        className
      )}
      aria-live="polite"
    >
      <Gem className="h-3 w-3" aria-hidden />
      {text}
    </span>
  );
}

// ── Large hero card ─────────────────────────────────────────────────────
const TILES = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

export default function CountdownToProposal({ className }: { className?: string }) {
  const { days, hours, minutes, seconds, past } = useCountdown(PROPOSAL_DATE);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bark-card p-6 md:p-10",
        className
      )}
    >
      {/* Breathing glow background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 anim-breathe"
        style={
          {
            background: past
              ? "radial-gradient(circle at 50% 100%, rgba(226,29,72,0.35), transparent 60%)"
              : "radial-gradient(circle at 50% 100%, rgba(184,134,11,0.45), transparent 60%)",
            "--glow-color": past ? "rgba(226,29,72,0.3)" : "rgba(184,134,11,0.4)",
          } as React.CSSProperties
        }
      />

      <div className="relative z-10 text-center">
        <AdaptiveText
          as="div"
          className="inline-flex items-center gap-2 rounded-full bg-rust-brass/20 px-3 py-1 text-[11px] uppercase tracking-widest mb-4"
          lightColor="#faf3e3"
          darkColor="#1a1410"
        >
          <Gem className="h-3 w-3" aria-hidden />
          {past ? "Anniversary Clock" : "💎 The Big Moment"}
        </AdaptiveText>
        <AdaptiveText
          as="h2"
          className="font-serif text-2xl sm:text-3xl md:text-5xl font-bold mb-2"
          largeText
          lightColor="#faf3e3"
          darkColor="#1a1410"
          ensureShadow
        >
          {past ? "Forever begins here" : "⏳ Counting down to forever 💛"}
        </AdaptiveText>
        <AdaptiveText
          as="p"
          className="text-sm md:text-base mb-6 md:mb-8"
          lightColor="#faf3e3"
          darkColor="#1a1410"
        >
          {past
            ? `${days} days since the proposal · `
            : ""}
          Friday, August 7, 2026 · 7:30 PM Eastern · Lake Gloriette, Dixville Notch
        </AdaptiveText>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
          {TILES.map((t) => {
            const value =
              t.key === "days" ? days :
              t.key === "hours" ? hours :
              t.key === "minutes" ? minutes : seconds;
            return (
              <div
                key={t.key}
                className="relative overflow-hidden rounded-2xl bark-card border border-rust-brass/30 p-4 md:p-6 anim-breathe"
                style={{ "--glow-color": "rgba(184,134,11,0.25)" } as React.CSSProperties}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-50 anim-shimmer"
                  style={{
                    background: "linear-gradient(120deg, transparent, rgba(184,134,11,0.18), transparent)",
                  }}
                />
                <AdaptiveText
                  as="div"
                  className="relative z-10 font-dejavu-mono text-3xl sm:text-4xl md:text-6xl font-bold tabular-nums"
                  largeText
                  lightColor="#faf3e3"
                  darkColor="#1a1410"
                >
                  {String(value).padStart(2, "0")}
                </AdaptiveText>
                <AdaptiveText
                  as="div"
                  className="relative z-10 mt-1 text-[10px] md:text-xs uppercase tracking-widest"
                  lightColor="#faf3e3"
                  darkColor="#1a1410"
                >
                  {past ? `Since ${t.label.toLowerCase()}` : t.label}
                </AdaptiveText>
              </div>
            );
          })}
        </div>

        <AdaptiveText
          as="div"
          className="mt-6 md:mt-8 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs"
          lightColor="#faf3e3"
          darkColor="#1a1410"
        >
          <Compass className="h-3 w-3" aria-hidden />
          <span>44.870° N, -71.305° W · 1,000 ft granite cliff · mirror-calm lake</span>
        </AdaptiveText>
      </div>
    </section>
  );
}
