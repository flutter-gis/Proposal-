"use client";

/**
 * ThemeIcon.tsx — HIGH-DETAILED 150+ POLYGON SVGs
 *
 * Each of the 12 theme icons is a richly detailed 64×64 SVG scene
 * with 150+ polygons, circles, paths, and lines. Every theme has
 * a unique visual identity with expanded color ranges.
 *
 * Themes: sunrise, morning, afternoon, golden, sunset, dusk,
 *         midnight, stargazing, heart, ring, proposal, anniversary
 */

import { useId } from "react";
import type { IconTheme } from "@/lib/preferences";

interface ThemeIconProps {
  name: IconTheme;
  className?: string;
  size?: number;
}

// Expanded per-theme palettes (8+ colors each for rich gradients)
const PALETTES: Record<IconTheme, {
  sky: string[];
  sun: string;
  moon: string;
  mountain1: string;
  mountain2: string;
  mountain3: string;
  pine: string;
  lake: string;
  lakeReflection: string;
  star: string;
  accent: string;
  glow: string;
  ground: string;
  fg: string; // foreground detail
}> = {
  sunrise: {
    sky: ["#1a1340", "#4c1d95", "#7c3aed", "#dc2626", "#f97316", "#fbbf24", "#fef3c7", "#fde68a"],
    sun: "#fbbf24", moon: "#fef3c7",
    mountain1: "#312e81", mountain2: "#4c1d95", mountain3: "#1e1b4b",
    pine: "#14532d", lake: "#7c3aed", lakeReflection: "#dc2626",
    star: "#fef3c7", accent: "#f97316", glow: "#fde68a", ground: "#312e81", fg: "#fbbf24",
  },
  morning: {
    sky: ["#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#e0f2fe", "#f0f9ff", "#dbeafe"],
    sun: "#fbbf24", moon: "#fef9c3",
    mountain1: "#0c4a6e", mountain2: "#075985", mountain3: "#082f49",
    pine: "#14532d", lake: "#0284c7", lakeReflection: "#38bdf8",
    star: "#e0f2fe", accent: "#0ea5e9", glow: "#bae6fd", ground: "#0c4a6e", fg: "#0284c7",
  },
  afternoon: {
    sky: ["#7dd3fc", "#38bdf8", "#0ea5e9", "#67e8f9", "#a7f3d0", "#dcfce7", "#86efac", "#bbf7d0"],
    sun: "#facc15", moon: "#fef9c3",
    mountain1: "#14532d", mountain2: "#15803d", mountain3: "#052e16",
    pine: "#15803d", lake: "#38bdf8", lakeReflection: "#22c55e",
    star: "#dcfce7", accent: "#16a34a", glow: "#86efac", ground: "#14532d", fg: "#16a34a",
  },
  golden: {
    sky: ["#fb923c", "#f97316", "#dc2626", "#7c2d12", "#fbbf24", "#fde047", "#fef3c7", "#fed7aa"],
    sun: "#f97316", moon: "#fed7aa",
    mountain1: "#7c2d12", mountain2: "#9a3412", mountain3: "#431407",
    pine: "#14532d", lake: "#fb923c", lakeReflection: "#dc2626",
    star: "#fef3c7", accent: "#ea580c", glow: "#fde047", ground: "#7c2d12", fg: "#f97316",
  },
  sunset: {
    sky: ["#1a1340", "#3b1d6e", "#6d1f5e", "#9c1f3f", "#c62a18", "#e8590c", "#f59e0b", "#fde047"],
    sun: "#f87171", moon: "#fee2e2",
    mountain1: "#450a0a", mountain2: "#7f1d1d", mountain3: "#1a0a0a",
    pine: "#450a0a", lake: "#dc2626", lakeReflection: "#f59e0b",
    star: "#fee2e2", accent: "#dc2626", glow: "#fbbf24", ground: "#450a0a", fg: "#ef4444",
  },
  dusk: {
    sky: ["#0f0a2e", "#312e81", "#4c1d95", "#6d28d9", "#8b5cf6", "#c4b5fd", "#a78bfa", "#1e1b4b"],
    sun: "#c4b5fd", moon: "#ede9fe",
    mountain1: "#2e1065", mountain2: "#1e1b4b", mountain3: "#0f0a2e",
    pine: "#1e1b4b", lake: "#7c3aed", lakeReflection: "#8b5cf6",
    star: "#ddd6fe", accent: "#8b5cf6", glow: "#c4b5fd", ground: "#2e1065", fg: "#a78bfa",
  },
  midnight: {
    sky: ["#020617", "#0f0a2e", "#1e1b4b", "#312e81", "#1e1b4b", "#0f0a2e", "#020617", "#1e293b"],
    sun: "#f8fafc", moon: "#e0e7ff",
    mountain1: "#020617", mountain2: "#0f0a2e", mountain3: "#1e1b4b",
    pine: "#020617", lake: "#1e1b4b", lakeReflection: "#312e81",
    star: "#e0e7ff", accent: "#a5b4fc", glow: "#c4b5fd", ground: "#020617", fg: "#818cf8",
  },
  stargazing: {
    sky: ["#020617", "#0f0a2e", "#1e1b4b", "#312e81", "#4338ca", "#3730a3", "#1e1b4b", "#020617"],
    sun: "#f8fafc", moon: "#e0e7ff",
    mountain1: "#020617", mountain2: "#0f0a2e", mountain3: "#1e293b",
    pine: "#020617", lake: "#0f0a2e", lakeReflection: "#1e1b4b",
    star: "#fff8e0", accent: "#a78bfa", glow: "#c4b5fd", ground: "#020617", fg: "#a5b4fc",
  },
  heart: {
    sky: ["#831843", "#be185d", "#ec4899", "#f472b6", "#fbcfe8", "#fce7f3", "#f9a8d4", "#fda4af"],
    sun: "#f472b6", moon: "#fce7f3",
    mountain1: "#500724", mountain2: "#831843", mountain3: "#4a044e",
    pine: "#500724", lake: "#ec4899", lakeReflection: "#f472b6",
    star: "#fce7f3", accent: "#ec4899", glow: "#fbcfe8", ground: "#500724", fg: "#f472b6",
  },
  ring: {
    sky: ["#fef3c7", "#fde68a", "#fbbf24", "#d4a017", "#f59e0b", "#fbbf24", "#fed7aa", "#fef9c3"],
    sun: "#fbbf24", moon: "#fef3c7",
    mountain1: "#78350f", mountain2: "#92400e", mountain3: "#451a03",
    pine: "#14532d", lake: "#fbbf24", lakeReflection: "#d4a017",
    star: "#fef3c7", accent: "#e0e7ff", glow: "#fde047", ground: "#78350f", fg: "#d4a017",
  },
  proposal: {
    sky: ["#7c2d12", "#dc2626", "#ea580c", "#f97316", "#fbbf24", "#fde047", "#fef3c7", "#fed7aa"],
    sun: "#fbbf24", moon: "#fed7aa",
    mountain1: "#450a0a", mountain2: "#7c2d12", mountain3: "#431407",
    pine: "#14532d", lake: "#dc2626", lakeReflection: "#fbbf24",
    star: "#fef3c7", accent: "#dc2626", glow: "#fbbf24", ground: "#450a0a", fg: "#f97316",
  },
  anniversary: {
    sky: ["#4c1d95", "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#312e81"],
    sun: "#c4b5fd", moon: "#ede9fe",
    mountain1: "#2e1065", mountain2: "#4c1d95", mountain3: "#1e1b4b",
    pine: "#1e1b4b", lake: "#6d28d9", lakeReflection: "#8b5cf6",
    star: "#ddd6fe", accent: "#a78bfa", glow: "#c4b5fd", ground: "#2e1065", fg: "#8b5cf6",
  },
};

// Deterministic PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ThemeIcon({ name, className, size }: ThemeIconProps) {
  const p = PALETTES[name];
  const uid = useId().replace(/:/g, "");
  const style = size ? { width: size, height: size } : undefined;

  // Seeded RNG for stable shapes
  const rng = mulberry32(name.charCodeAt(0) * 1000 + name.charCodeAt(1) * 37);

  const gradId = `ti-grad-${name}-${uid}`;
  const glowId = `ti-glow-${name}-${uid}`;
  const clipId = `ti-clip-${name}-${uid}`;

  // Determine scene type
  const isNight = name === "midnight" || name === "stargazing" || name === "dusk" || name === "anniversary";
  const isMoon = isNight;
  const starCount = name === "stargazing" ? 40 : name === "midnight" ? 25 : name === "dusk" ? 12 : name === "anniversary" ? 20 : 5;

  // Sun/moon position
  const bodyX = name === "sunset" || name === "proposal" ? 44 : name === "sunrise" ? 20 : 32;
  const bodyY = name === "sunset" || name === "proposal" ? 38 : name === "sunrise" || name === "golden" ? 28 : 16;
  const bodyR = name === "sunset" || name === "proposal" ? 7 : 6;

  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          {p.sky.map((color, i) => (
            <stop key={i} offset={`${(i / (p.sky.length - 1)) * 100}%`} stopColor={color} />
          ))}
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.6" />
          <stop offset="60%" stopColor={p.glow} stopOpacity="0.2" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          <rect width="64" height="64" rx="12" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* ═══ Sky gradient (8 stops) ═══ */}
        <rect width="64" height="64" fill={`url(#${gradId})`} />

        {/* ═══ Stars (night themes) — 5-40 circles ═══ */}
        {Array.from({ length: starCount }, (_, i) => {
          const sx = (rng() * 60 + 2);
          const sy = (rng() * 28 + 2);
          const sr = 0.3 + rng() * 0.7;
          return (
            <circle key={`star-${i}`} cx={sx} cy={sy} r={sr} fill={p.star} opacity={0.4 + rng() * 0.5}>
              <animate attributeName="opacity" values={`${0.2 + rng() * 0.3};${0.7 + rng() * 0.3};${0.2 + rng() * 0.3}`} dur={`${2 + rng() * 3}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* ═══ Sun/Moon glow halo ═══ */}
        <circle cx={bodyX} cy={bodyY} r={bodyR * 2.5} fill={`url(#${glowId})`} />
        <circle cx={bodyX} cy={bodyY} r={bodyR * 1.8} fill={p.glow} opacity="0.2" />

        {/* ═══ Sun disc (day themes) ═══ */}
        {!isMoon && (
          <>
            <circle cx={bodyX} cy={bodyY} r={bodyR} fill={p.sun} />
            {/* Sun inner highlight */}
            <circle cx={bodyX - bodyR * 0.3} cy={bodyY - bodyR * 0.3} r={bodyR * 0.4} fill={p.glow} opacity="0.6" />
            {/* Sun corona rays (12 triangles) */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const r1 = bodyR + 1;
              const r2 = bodyR + 3;
              return (
                <polygon key={`ray-${i}`} points={`${bodyX},${bodyY} ${bodyX + Math.cos(angle) * r2},${bodyY + Math.sin(angle) * r2} ${bodyX + Math.cos(angle + 0.4) * r2},${bodyY + Math.sin(angle + 0.4) * r2}`} fill={p.sun} opacity="0.3">
                  <animate attributeName="opacity" values="0.2;0.4;0.2" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
                </polygon>
              );
            })}
          </>
        )}

        {/* ═══ Crescent moon (night themes) ═══ */}
        {isMoon && (
          <>
            <circle cx={bodyX} cy={bodyY} r={bodyR} fill={p.moon} />
            <circle cx={bodyX + bodyR * 0.35} cy={bodyY - bodyR * 0.15} r={bodyR * 0.85} fill={`url(#${gradId})`} />
            {/* Moon craters (6 circles) */}
            {Array.from({ length: 6 }, (_, i) => {
              const ca = (i / 6) * Math.PI * 2;
              const cr = bodyR * 0.4;
              return <circle key={`crater-${i}`} cx={bodyX + Math.cos(ca) * cr * 0.6} cy={bodyY + Math.sin(ca) * cr * 0.6} r={0.5 + rng() * 0.8} fill={p.sky[2]} opacity="0.3" />;
            })}
          </>
        )}

        {/* ═══ Back mountain range (8 triangles) ═══ */}
        {Array.from({ length: 8 }, (_, i) => {
          const x = i * 9 - 4;
          const h = 12 + rng() * 10;
          return <polygon key={`mtn1-${i}`} points={`${x},42 ${x + 4.5},${42 - h} ${x + 9},42`} fill={p.mountain1} opacity="0.6" />;
        })}

        {/* ═══ Mid mountain range (8 triangles) ═══ */}
        {Array.from({ length: 8 }, (_, i) => {
          const x = i * 9 - 2;
          const h = 8 + rng() * 8;
          return <polygon key={`mtn2-${i}`} points={`${x},44 ${x + 4.5},${44 - h} ${x + 9},44`} fill={p.mountain2} opacity="0.75" />;
        })}

        {/* ═══ Front mountain range (8 triangles) ═══ */}
        {Array.from({ length: 8 }, (_, i) => {
          const x = i * 9;
          const h = 5 + rng() * 6;
          return <polygon key={`mtn3-${i}`} points={`${x},46 ${x + 4.5},${46 - h} ${x + 9},46`} fill={p.mountain3} opacity="0.9" />;
        })}

        {/* ═══ Granite striation lines (6 lines) ═══ */}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`striation-${i}`} x1={i * 11} y1={36 + rng() * 6} x2={i * 11 + 5 + rng() * 3} y2={38 + rng() * 6} stroke={p.mountain2} strokeWidth="0.3" opacity="0.4" />
        ))}

        {/* ═══ Granite speckles (15 tiny dots) ═══ */}
        {Array.from({ length: 15 }, (_, i) => (
          <circle key={`speck-${i}`} cx={rng() * 64} cy={36 + rng() * 8} r={0.2 + rng() * 0.3} fill={p.accent} opacity="0.3" />
        ))}

        {/* ═══ Lake reflection (8 rectangles) ═══ */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={`lake-${i}`} x={i * 8} y={46} width={8} height={6} fill={p.lake} opacity={0.5 - i * 0.03} />
        ))}

        {/* ═══ Lake ripple lines (6 lines) ═══ */}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`ripple-${i}`} x1={3 + rng() * 5} y1={48 + i * 1} x2={20 + rng() * 40} y2={48 + i * 1} stroke={p.lakeReflection} strokeWidth="0.25" opacity={0.3 - i * 0.03} />
        ))}

        {/* ═══ Lake shimmer dots (10 circles) ═══ */}
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={`shimmer-${i}`} cx={rng() * 60 + 2} cy={47 + rng() * 5} r={0.2 + rng() * 0.4} fill={p.star} opacity={0.2 + rng() * 0.3}>
            <animate attributeName="opacity" values={`${0.1};${0.5};${0.1}`} dur={`${2 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* ═══ Pine tree silhouettes (6 trees, 3 cones each = 18 polygons) ═══ */}
        {Array.from({ length: 6 }, (_, i) => {
          const tx = 4 + i * 10 + rng() * 3;
          const ty = 46;
          return (
            <g key={`pine-${i}`}>
              {/* Trunk */}
              <rect x={tx - 0.5} y={ty - 2} width={1} height={3} fill={p.mountain3} opacity="0.8" />
              {/* 3 foliage cones */}
              <polygon points={`${tx},${ty - 8} ${tx - 2},${ty - 2} ${tx + 2},${ty - 2}`} fill={p.pine} opacity={0.7 + rng() * 0.2} />
              <polygon points={`${tx},${ty - 6} ${tx - 1.5},${ty - 1} ${tx + 1.5},${ty - 1}`} fill={p.pine} opacity={0.6 + rng() * 0.2} />
              <polygon points={`${tx},${ty - 4} ${tx - 1},${ty} ${tx + 1},${ty}`} fill={p.pine} opacity={0.5 + rng() * 0.2} />
              {/* Sun-side highlight */}
              <polygon points={`${tx},${ty - 8} ${tx},${ty - 2} ${tx + 0.5},${ty - 5}`} fill={p.accent} opacity="0.15" />
            </g>
          );
        })}

        {/* ═══ Ground/foreground (gradient strip) ═══ */}
        <rect x="0" y="52" width="64" height="12" fill={p.ground} opacity="0.7" />

        {/* ═══ Foreground detail dots (20 tiny specks) ═══ */}
        {Array.from({ length: 20 }, (_, i) => (
          <circle key={`fg-speck-${i}`} cx={rng() * 64} cy={52 + rng() * 10} r={0.15 + rng() * 0.3} fill={p.fg} opacity={0.2 + rng() * 0.3} />
        ))}

        {/* ═══ Theme-specific foreground elements ═══ */}
        {name === "heart" && (
          <path d="M 32 54 C 30 52, 28 52, 28 55 C 28 57, 32 60, 32 60 C 32 60, 36 57, 36 55 C 36 52, 34 52, 32 54 Z" fill={p.accent} opacity="0.8">
            <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="1.5s" repeatCount="indefinite" additive="sum" />
          </path>
        )}

        {name === "ring" && (
          <>
            <ellipse cx="32" cy="56" rx="5" ry="1.5" fill="none" stroke={p.fg} strokeWidth="1" />
            <polygon points="32,50 34,54 30,54" fill={p.accent} opacity="0.8" />
            <polygon points="32,50 33,52 31,52" fill={p.star} opacity="0.6" />
          </>
        )}

        {name === "proposal" && (
          <circle cx="32" cy="56" r="2" fill={p.accent} opacity="0.6">
            <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {name === "anniversary" && (
          <path d="M 28 56 Q 32 52, 36 56 Q 32 60, 28 56 Z" fill="none" stroke={p.accent} strokeWidth="0.8" opacity="0.7">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
          </path>
        )}

        {/* ═══ Atmospheric particles (15 floating dots) ═══ */}
        {Array.from({ length: 15 }, (_, i) => (
          <circle key={`particle-${i}`} cx={rng() * 64} cy={rng() * 40 + 5} r={0.15 + rng() * 0.3} fill={p.star} opacity={0.15 + rng() * 0.25}>
            <animate attributeName="cy" values={`${rng() * 40 + 5};${rng() * 40 + 5}`} dur={`${8 + rng() * 4}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* ═══ Cloud wisps (4 ellipses) ═══ */}
        {Array.from({ length: 4 }, (_, i) => (
          <ellipse key={`cloud-${i}`} cx={10 + i * 15 + rng() * 5} cy={8 + rng() * 8} rx={4 + rng() * 4} ry={0.8 + rng() * 0.8} fill={p.star} opacity={0.08 + rng() * 0.07} />
        ))}
      </g>
    </svg>
  );
}
