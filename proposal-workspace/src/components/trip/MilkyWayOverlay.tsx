"use client";

/**
 * MilkyWayOverlay.tsx
 *
 * A lightweight SVG/CSS Milky Way overlay that activates ONLY when the user
 * selects the "stargazing" icon (which resolves to the "cosmic" color theme).
 *
 * Renders a diagonal band of ~150 soft star points stretching across the
 * viewport, plus a faint purple-blue gas haze. Sits above AuroraRoot (z-1)
 * but below all content (z-10+) so it never interferes with interaction.
 *
 * Performance:
 *   - Pure CSS animation (no rAF loop) — driven by `animation` keyframes
 *   - Pauses when prefers-reduced-motion is set (renders static)
 *   - 150 star positions are deterministic (seeded) — no reflow on rerender
 *
 * Mounted conditionally inside AppContent, gated on `effectiveIcon === "stargazing"`.
 */

import { useMemo } from "react";

interface Star {
  top: number;     // %
  left: number;    // %
  size: number;    // px
  delay: number;   // s
  duration: number; // s
  opacity: number; // 0..1
}

// Deterministic pseudo-random generator so star positions are stable
// across renders (avoids reflow flicker).
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_COUNT = 150;

export default function MilkyWayOverlay() {
  const stars = useMemo<Star[]>(() => {
    const rng = mulberry32(42); // stable seed
    return Array.from({ length: STAR_COUNT }, () => {
      // Bias star positions toward a diagonal band running from top-left
      // to bottom-right (the classic Milky Way orientation in the sky).
      const t = rng();
      const bandCenter = 30 + t * 40; // 30% → 70% across viewport
      const bandJitter = (rng() - 0.5) * 25; // ±12.5% perpendicular
      // Rotate the position by ~25° to make the band diagonal
      const angle = -25 * (Math.PI / 180);
      const dx = (t - 0.5) * 100;
      const dy = bandJitter;
      const left = 50 + dx * Math.cos(angle) - dy * Math.sin(angle);
      const top = 50 + dx * Math.sin(angle) + dy * Math.cos(angle);
      return {
        top: Math.max(0, Math.min(100, top)),
        left: Math.max(0, Math.min(100, left)),
        size: 0.5 + rng() * 2.5,
        delay: rng() * 5,
        duration: 2.5 + rng() * 3.5,
        opacity: 0.3 + rng() * 0.7,
      };
    });
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Milky Way gas haze — two large soft gradients along the diagonal band */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 30% at 30% 35%, rgba(120, 80, 180, 0.18), transparent 60%),
            radial-gradient(ellipse 70% 25% at 70% 65%, rgba(80, 100, 200, 0.15), transparent 60%),
            radial-gradient(ellipse 60% 20% at 50% 50%, rgba(200, 180, 240, 0.08), transparent 70%)
          `,
          transform: "rotate(-25deg) scale(1.4)",
          transformOrigin: "center",
        }}
      />

      {/* Star field — 150 deterministic points with staggered twinkle */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.left}
            cy={s.top}
            r={s.size / 10}
            fill="#fff8e0"
            style={{
              opacity: s.opacity,
              animation: `wr-mw-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </svg>

      {/* Keyframes injected inline so the component is self-contained */}
      <style>{`
        @keyframes wr-mw-twinkle {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes wr-mw-twinkle {
            0%, 100% { opacity: 0.6; }
          }
        }
      `}</style>
    </div>
  );
}
