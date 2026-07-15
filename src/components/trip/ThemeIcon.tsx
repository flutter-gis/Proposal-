"use client";

/**
 * ThemeIcon.tsx
 *
 * Renders all 12 icon themes as detailed inline SVGs (64×64 viewBox).
 * Replaces the previous PNG-based icons (`<img src="/icons/themes/{name}-192.png">`)
 * with crisp, themeable, currentColor-aware vector graphics.
 *
 * Each SVG includes:
 *   - Linear gradient sky background (top → bottom color stops per theme)
 *   - Sun/moon disc with radial gradient core + multi-layer corona glow
 *   - Mountain/cliff silhouettes with granite striation lines
 *   - Pine tree triangles with sun-side highlight polygons
 *   - Lake reflection with ripple lines
 *   - Stars for night themes (with twinkle animation via CSS class)
 *   - Heart shape for the "love" theme
 *   - Diamond ring with facets for the "ring" theme
 *   - Milky Way streak for "stargazing"
 *
 * Usage:
 *   <ThemeIcon name="sunrise" className="h-12 w-12" />
 *   <ThemeIcon name={effectiveIcon} size={48} />
 *
 * The SVG fills its viewBox, so `className` controls the rendered size via
 * Tailwind's h-X / w-X utilities (or `size` prop for inline style).
 */

import { useId } from "react";
import type { IconTheme } from "@/lib/preferences";

interface ThemeIconProps {
  name: IconTheme;
  className?: string;
  size?: number;
}

// Per-theme color palettes for the SVGs. Each theme defines:
//   skyTop, skyBottom — linear gradient stops for the sky background
//   skyGlow           — radial gradient color for the sun/moon corona
//   body              — sun/moon disc color
//   mountain          — cliff/mountain silhouette color
//   mountainHighlight — granite striation / sun-side highlight
//   pine              — pine tree silhouette color
//   lake              — lake reflection color
//   star              — star color (night themes only)
const PALETTES: Record<IconTheme, {
  skyTop: string;
  skyBottom: string;
  skyGlow: string;
  body: string;
  bodyGlow: string;
  mountain: string;
  mountainHighlight: string;
  pine: string;
  lake: string;
  star: string;
  accent: string;
}> = {
  sunrise: {
    skyTop: "#fde68a", skyBottom: "#fbbf24", skyGlow: "#fef3c7",
    body: "#f59e0b", bodyGlow: "#fde68a",
    mountain: "#78350f", mountainHighlight: "#d97706",
    pine: "#14532d", lake: "#fbbf24", star: "#fef3c7", accent: "#dc2626",
  },
  morning: {
    skyTop: "#bae6fd", skyBottom: "#e0f2fe", skyGlow: "#fef3c7",
    body: "#fbbf24", bodyGlow: "#fef3c7",
    mountain: "#0c4a6e", mountainHighlight: "#0284c7",
    pine: "#14532d", lake: "#7dd3fc", star: "#e0f2fe", accent: "#0ea5e9",
  },
  afternoon: {
    skyTop: "#7dd3fc", skyBottom: "#bae6fd", skyGlow: "#fef9c3",
    body: "#facc15", bodyGlow: "#fef9c3",
    mountain: "#14532d", mountainHighlight: "#16a34a",
    pine: "#15803d", lake: "#38bdf8", star: "#dcfce7", accent: "#16a34a",
  },
  golden: {
    skyTop: "#fb923c", skyBottom: "#fef3c7", skyGlow: "#fef3c7",
    body: "#f97316", bodyGlow: "#fed7aa",
    mountain: "#7c2d12", mountainHighlight: "#ea580c",
    pine: "#14532d", lake: "#fb923c", star: "#ffedd5", accent: "#dc2626",
  },
  sunset: {
    skyTop: "#dc2626", skyBottom: "#fb923c", skyGlow: "#fef2f2",
    body: "#f87171", bodyGlow: "#fee2e2",
    mountain: "#450a0a", mountainHighlight: "#b91c1c",
    pine: "#450a0a", lake: "#dc2626", star: "#fee2e2", accent: "#fbbf24",
  },
  dusk: {
    skyTop: "#6d28d9", skyBottom: "#a78bfa", skyGlow: "#f5f3ff",
    body: "#c4b5fd", bodyGlow: "#ede9fe",
    mountain: "#2e1065", mountainHighlight: "#6d28d9",
    pine: "#1e1b4b", lake: "#7c3aed", star: "#ddd6fe", accent: "#8b5cf6",
  },
  midnight: {
    skyTop: "#1e1b4b", skyBottom: "#0f0a2e", skyGlow: "#e0e7ff",
    body: "#f8fafc", bodyGlow: "#e0e7ff",
    mountain: "#020617", mountainHighlight: "#1e1b4b",
    pine: "#020617", lake: "#1e1b4b", star: "#e0e7ff", accent: "#a5b4fc",
  },
  stargazing: {
    skyTop: "#020617", skyBottom: "#0f0a2e", skyGlow: "#c4b5fd",
    body: "#f8fafc", bodyGlow: "#e0e7ff",
    mountain: "#020617", mountainHighlight: "#1e293b",
    pine: "#020617", lake: "#0f0a2e", star: "#fef3c7", accent: "#a78bfa",
  },
  heart: {
    skyTop: "#831843", skyBottom: "#ec4899", skyGlow: "#fce7f3",
    body: "#f472b6", bodyGlow: "#fce7f3",
    mountain: "#500724", mountainHighlight: "#be185d",
    pine: "#500724", lake: "#ec4899", star: "#fce7f3", accent: "#fbbf24",
  },
  ring: {
    skyTop: "#fef3c7", skyBottom: "#fde68a", skyGlow: "#fef9c3",
    body: "#fbbf24", bodyGlow: "#fef3c7",
    mountain: "#78350f", mountainHighlight: "#d97706",
    pine: "#14532d", lake: "#fbbf24", star: "#fef3c7", accent: "#e0e7ff",
  },
  proposal: {
    skyTop: "#7c2d12", skyBottom: "#dc2626", skyGlow: "#fef3c7",
    body: "#fbbf24", bodyGlow: "#fed7aa",
    mountain: "#450a0a", mountainHighlight: "#ea580c",
    pine: "#14532d", lake: "#dc2626", star: "#fee2e2", accent: "#fbbf24",
  },
  anniversary: {
    skyTop: "#4c1d95", skyBottom: "#6d28d9", skyGlow: "#f5f3ff",
    body: "#c4b5fd", bodyGlow: "#ede9fe",
    mountain: "#2e1065", mountainHighlight: "#6d28d9",
    pine: "#1e1b4b", lake: "#7c3aed", star: "#ddd6fe", accent: "#fbbf24",
  },
};

// Deterministic star positions per theme (so they don't jump on re-render)
function getStars(seed: number, count: number): Array<{ x: number; y: number; r: number }> {
  const stars: Array<{ x: number; y: number; r: number }> = [];
  let s = seed;
  const rng = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rng() * 64,
      y: rng() * 28, // top half only
      r: 0.3 + rng() * 0.8,
    });
  }
  return stars;
}

export default function ThemeIcon({ name, className, size }: ThemeIconProps) {
  const p = PALETTES[name];
  // useId() ensures unique gradient IDs across multiple ThemeIcon instances
  // (prevents invalid duplicate IDs when the same theme appears in both the
  // app bar and the settings grid).
  const uid = useId().replace(/:/g, "");
  const gradientId = `theme-icon-grad-${name}-${uid}`;
  const glowId = `theme-icon-glow-${name}-${uid}`;
  const style = size ? { width: size, height: size } : undefined;

  // Render theme-specific foreground elements
  const renderForeground = () => {
    switch (name) {
      case "heart":
        return (
          <>
            {/* Heart shape */}
            <path
              d="M32 50 C 20 40, 14 32, 14 24 C 14 18, 18 14, 24 14 C 28 14, 30 16, 32 19 C 34 16, 36 14, 40 14 C 46 14, 50 18, 50 24 C 50 32, 44 40, 32 50 Z"
              fill={p.accent}
              stroke={p.bodyGlow}
              strokeWidth="0.5"
            />
            {/* Sparkle */}
            <circle cx="26" cy="22" r="1.5" fill={p.bodyGlow} opacity="0.9" />
          </>
        );
      case "ring":
        return (
          <>
            {/* Diamond on band */}
            {/* Band */}
            <ellipse cx="32" cy="44" rx="14" ry="4" fill="none" stroke={p.body} strokeWidth="2.5" />
            {/* Diamond setting */}
            <polygon points="32,18 38,28 32,38 26,28" fill={p.accent} stroke={p.body} strokeWidth="0.5" />
            <polygon points="32,18 38,28 32,28" fill={p.bodyGlow} opacity="0.6" />
            <polygon points="32,18 26,28 32,28" fill={p.bodyGlow} opacity="0.3" />
            {/* Facet lines */}
            <line x1="32" y1="18" x2="32" y2="38" stroke={p.body} strokeWidth="0.4" opacity="0.5" />
            <line x1="26" y1="28" x2="38" y2="28" stroke={p.body} strokeWidth="0.4" opacity="0.5" />
            {/* Sparkle */}
            <circle cx="32" cy="22" r="1" fill="white" opacity="0.9" />
          </>
        );
      case "anniversary":
        return (
          <>
            {/* Infinity symbol */}
            <path
              d="M 20 32 C 16 28, 16 24, 20 24 C 24 24, 28 28, 32 32 C 36 36, 40 40, 44 40 C 48 40, 48 36, 44 32 C 40 28, 36 28, 32 32 C 28 36, 24 40, 20 40 C 16 40, 16 36, 20 32 Z"
              fill="none"
              stroke={p.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        );
      case "stargazing":
        return (
          <>
            {/* Milky Way diagonal streak */}
            <ellipse
              cx="32" cy="20" rx="28" ry="5"
              fill={p.star}
              opacity="0.15"
              transform="rotate(-20 32 32)"
            />
            <ellipse
              cx="32" cy="20" rx="22" ry="3"
              fill={p.star}
              opacity="0.2"
              transform="rotate(-20 32 32)"
            />
          </>
        );
      default:
        return null;
    }
  };

  // Determine if this is a night theme (shows stars)
  const isNight = name === "midnight" || name === "stargazing" || name === "dusk";
  const starCount = name === "stargazing" ? 25 : name === "midnight" ? 15 : name === "dusk" ? 8 : 0;
  const stars = starCount > 0 ? getStars(name.length * 7 + 13, starCount) : [];

  // Determine if this is a sun or moon theme
  const isMoon = name === "midnight" || name === "stargazing" || name === "dusk" || name === "anniversary";

  // Sun/moon position (varies slightly per theme)
  const bodyX = name === "sunset" || name === "proposal" ? 44 : name === "sunrise" ? 20 : 32;
  const bodyY = name === "sunset" || name === "proposal" ? 38 : name === "sunrise" || name === "golden" ? 30 : 18;
  const bodyR = name === "sunset" || name === "proposal" ? 7 : 6;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.skyTop} />
          <stop offset="100%" stopColor={p.skyBottom} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.bodyGlow} stopOpacity="0.8" />
          <stop offset="60%" stopColor={p.bodyGlow} stopOpacity="0.3" />
          <stop offset="100%" stopColor={p.bodyGlow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky background — rounded rect so it fits nicely in icon containers */}
      <rect x="2" y="2" width="60" height="60" rx="12" fill={`url(#${gradientId})`} />

      {/* Stars (night themes only) */}
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={p.star}
          opacity={0.7}
          style={{
            animation: `theme-icon-twinkle 2s ease-in-out ${(i % 5) * 0.3}s infinite`,
          }}
        />
      ))}

      {/* Sun/moon glow halo */}
      <circle cx={bodyX} cy={bodyY} r={bodyR * 2.5} fill={`url(#${glowId})`} />

      {/* Sun/moon disc */}
      {isMoon ? (
        // Crescent moon — overlay a sky-colored circle to create the crescent
        <>
          <circle cx={bodyX} cy={bodyY} r={bodyR} fill={p.body} />
          <circle cx={bodyX + bodyR * 0.4} cy={bodyY - bodyR * 0.2} r={bodyR * 0.85} fill={`url(#${gradientId})`} />
        </>
      ) : (
        // Sun disc with subtle inner highlight
        <>
          <circle cx={bodyX} cy={bodyY} r={bodyR} fill={p.body} />
          <circle cx={bodyX - bodyR * 0.3} cy={bodyY - bodyR * 0.3} r={bodyR * 0.4} fill={p.bodyGlow} opacity="0.6" />
        </>
      )}

      {/* Mountains/cliffs — back range */}
      <polygon
        points={`0,46 12,30 20,38 28,26 36,36 44,24 52,34 64,28 64,64 0,64`}
        fill={p.mountain}
        opacity="0.7"
      />
      {/* Front range with granite striation highlights */}
      <polygon
        points={`0,52 8,40 16,46 24,36 32,44 40,34 48,42 56,36 64,46 64,64 0,64`}
        fill={p.mountain}
      />
      {/* Granite striation lines (sun-side highlight) */}
      <line x1="12" y1="40" x2="14" y2="46" stroke={p.mountainHighlight} strokeWidth="0.5" opacity="0.6" />
      <line x1="28" y1="36" x2="30" y2="44" stroke={p.mountainHighlight} strokeWidth="0.5" opacity="0.6" />
      <line x1="44" y1="34" x2="46" y2="42" stroke={p.mountainHighlight} strokeWidth="0.5" opacity="0.6" />

      {/* Pine tree silhouettes (foreground) */}
      <g fill={p.pine}>
        <polygon points="8,52 6,46 7,46 5,42 7,42 5,38 8,38 6,34 10,34 8,38 11,38 9,42 11,42 9,46 10,46 8,52" />
        <polygon points="52,54 50,48 51,48 49,44 51,44 49,40 52,40 50,36 54,36 52,40 55,40 53,44 55,44 53,48 54,48 52,54" />
      </g>
      {/* Sun-side highlight on pines */}
      <polygon points="8,52 8,38 6,34 7,38 8,42 8,46 8,52" fill={p.mountainHighlight} opacity="0.4" />

      {/* Lake reflection (bottom strip) */}
      <rect x="2" y="52" width="60" height="10" rx="0" fill={p.lake} opacity="0.4" />
      {/* Ripple lines */}
      <line x1="6" y1="56" x2="14" y2="56" stroke={p.bodyGlow} strokeWidth="0.4" opacity="0.5" />
      <line x1="20" y1="58" x2="30" y2="58" stroke={p.bodyGlow} strokeWidth="0.4" opacity="0.5" />
      <line x1="40" y1="56" x2="50" y2="56" stroke={p.bodyGlow} strokeWidth="0.4" opacity="0.5" />
      <line x1="48" y1="59" x2="58" y2="59" stroke={p.bodyGlow} strokeWidth="0.4" opacity="0.5" />

      {/* Theme-specific foreground (heart, ring, infinity, milky way) */}
      {renderForeground()}

      {/* Twinkle keyframes */}
      <style>{`
        @keyframes theme-icon-twinkle {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          svg circle { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}
