"use client";

/**
 * DayHeader.tsx
 *
 * 8-layer CSS texture stack for each day slide:
 *   1. Mesh gradient (per-day colors)
 *   2. Color grade overlay
 *   3. SVG scene silhouettes (pines / lake / beach / cliff / stars / road)
 *   4. CSS particles (dust / mist / sparkles / embers — depending on day)
 *   5. SVG film grain
 *   6. Vignette
 *   7. Glassmorphic content card
 *   8. Day number badge
 *
 * NO canvas — every animation is CSS. Six day textures with unique palettes.
 */

import { memo } from "react";
import type { DayPlan } from "@/lib/trip-data";
import { cn } from "@/lib/utils";
import { Icon as SvgIcon, DAY_ICON_MAP } from "@/components/icons/Icon";

interface DayTexture {
  // Mesh gradient stops (top-left, top-right, bottom-left, bottom-right)
  mesh: string;
  // Color-grade overlay (multiplies over the mesh)
  grade: string;
  // Silhouette fill
  silhouette: string;
  // Particle CSS class — see globals.css (.css-dust, .css-mist, .css-sparkles, .css-stardust, .css-embers)
  particle: string;
  // Accent color for text/borders
  accent: string;
  // Soft text color for body
  body: string;
}

const DAY_TEXTURES: DayTexture[] = [
  // Day 1 — Off-Grid Escape (forest greens)
  {
    mesh: `
      radial-gradient(circle at 20% 20%, #2d4a3a 0%, transparent 55%),
      radial-gradient(circle at 80% 20%, #1a2d24 0%, transparent 55%),
      radial-gradient(circle at 50% 90%, #6b4423 0%, transparent 60%),
      linear-gradient(135deg, #1a2d24 0%, #2d4a3a 100%)`,
    grade: "linear-gradient(180deg, rgba(45,74,58,0.25), rgba(26,20,16,0.55))",
    silhouette: "#0e1a13",
    particle: "css-dust",
    accent: "#b8860b",
    body: "#ede0c4",
  },
  // Day 2 — Still Waters & Wildlife (lake blues + moss)
  {
    mesh: `
      radial-gradient(circle at 25% 25%, #5a6f4a 0%, transparent 55%),
      radial-gradient(circle at 75% 30%, #2d4a3a 0%, transparent 50%),
      radial-gradient(circle at 50% 90%, #2b4a5a 0%, transparent 60%),
      linear-gradient(135deg, #1c2a26 0%, #2d4a3a 100%)`,
    grade: "linear-gradient(180deg, rgba(60,90,80,0.25), rgba(20,28,40,0.55))",
    silhouette: "#0e1c1a",
    particle: "css-mist",
    accent: "#d4a017",
    body: "#ede0c4",
  },
  // Day 3 — Powered Preparation (ember + forest)
  {
    mesh: `
      radial-gradient(circle at 30% 30%, #b8541f 0%, transparent 50%),
      radial-gradient(circle at 75% 25%, #2d4a3a 0%, transparent 55%),
      radial-gradient(circle at 50% 95%, #7a2418 0%, transparent 60%),
      linear-gradient(135deg, #2a1a14 0%, #3d2817 100%)`,
    grade: "linear-gradient(180deg, rgba(184,84,31,0.18), rgba(40,20,12,0.55))",
    silhouette: "#1a0e08",
    particle: "css-embers",
    accent: "#d4a017",
    body: "#faf3e3",
  },
  // Day 4 — The Big Proposal Day (rose + golden hour)
  {
    mesh: `
      radial-gradient(circle at 25% 25%, #b8541f 0%, transparent 50%),
      radial-gradient(circle at 75% 25%, #d4a017 0%, transparent 50%),
      radial-gradient(circle at 50% 90%, #7a2418 0%, transparent 60%),
      linear-gradient(135deg, #4a2014 0%, #6b3018 100%)`,
    grade: "linear-gradient(180deg, rgba(212,160,23,0.20), rgba(60,18,12,0.55))",
    silhouette: "#1a0808",
    particle: "css-sparkles",
    accent: "#ffd76b",
    body: "#faf3e3",
  },
  // Day 5 — Frontier Horizons & Dark Skies (cosmic)
  {
    mesh: `
      radial-gradient(circle at 25% 20%, #2d3a6a 0%, transparent 55%),
      radial-gradient(circle at 75% 20%, #4a3a6a 0%, transparent 55%),
      radial-gradient(circle at 50% 90%, #1a2d24 0%, transparent 60%),
      linear-gradient(135deg, #0e0e1c 0%, #1a1a2e 100%)`,
    grade: "linear-gradient(180deg, rgba(60,40,90,0.20), rgba(10,8,20,0.55))",
    silhouette: "#08081a",
    particle: "css-stardust",
    accent: "#d4a017",
    body: "#ede0c4",
  },
  // Day 6 — Double-Header Grand Finale (homecoming amber)
  {
    mesh: `
      radial-gradient(circle at 20% 25%, #b8860b 0%, transparent 55%),
      radial-gradient(circle at 75% 25%, #b8541f 0%, transparent 55%),
      radial-gradient(circle at 50% 90%, #2d4a3a 0%, transparent 60%),
      linear-gradient(135deg, #3d2817 0%, #4a3020 100%)`,
    grade: "linear-gradient(180deg, rgba(184,134,11,0.20), rgba(40,24,14,0.55))",
    silhouette: "#1a0e08",
    particle: "css-dust",
    accent: "#d4a017",
    body: "#faf3e3",
  },
];

function SceneSilhouettes({ kind, fill }: { kind: DayPlan["theme"]; fill: string }) {
  // Choose a silhouette set based on the day's theme keyword.
  const k = kind.toLowerCase();
  if (k.includes("moment") || k.includes("propose")) {
    // cliff + lake
    return (
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[40%] w-full" aria-hidden>
        <path fill={fill} fillOpacity="0.85" d="M0 320 L0 200 L120 180 L220 90 L340 110 L460 60 L600 80 L760 40 L900 70 L1040 110 L1180 80 L1320 130 L1440 110 L1440 320 Z" />
        <path fill={fill} fillOpacity="0.6" d="M0 320 L0 240 L160 230 L320 250 L500 220 L680 240 L860 210 L1040 240 L1220 220 L1440 240 L1440 320 Z" />
      </svg>
    );
  }
  if (k.includes("celebrate") || k.includes("dark")) {
    // stars + horizon
    return (
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 36 }).map((_, i) => {
          const x = (i * 137) % 1440;
          const y = (i * 53) % 140;
          const r = (i % 3) * 0.4 + 0.6;
          return <circle key={i} cx={x} cy={y} r={r} fill={fill} opacity="0.7" />;
        })}
        <path fill={fill} fillOpacity="0.85" d="M0 320 L0 240 L200 230 L380 250 L560 220 L760 240 L960 215 L1160 240 L1340 220 L1440 240 L1440 320 Z" />
      </svg>
    );
  }
  if (k.includes("recharge")) {
    // beach + sun
    return (
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[40%] w-full" aria-hidden>
        <circle cx="1200" cy="80" r="40" fill={fill} opacity="0.55" />
        <path fill={fill} fillOpacity="0.85" d="M0 320 L0 220 L240 210 L460 230 L720 215 L980 230 L1240 215 L1440 225 L1440 320 Z" />
      </svg>
    );
  }
  if (k.includes("explore")) {
    // lake + pines
    return (
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[40%] w-full" aria-hidden>
        <path fill={fill} fillOpacity="0.85" d="M0 320 L0 220 L80 180 L120 220 L200 160 L260 220 L360 180 L440 220 L540 170 L620 220 L740 180 L820 220 L940 170 L1020 220 L1140 180 L1240 220 L1340 180 L1440 220 L1440 320 Z" />
        <path fill={fill} fillOpacity="0.5" d="M0 320 L0 250 L240 240 L460 250 L720 245 L980 250 L1240 245 L1440 250 L1440 320 Z" />
      </svg>
    );
  }
  if (k.includes("detox")) {
    // road + pines
    return (
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[40%] w-full" aria-hidden>
        <path fill={fill} fillOpacity="0.85" d="M0 320 L0 220 L80 180 L120 220 L200 160 L260 220 L360 180 L440 220 L540 170 L620 220 L740 180 L820 220 L940 170 L1020 220 L1140 180 L1240 220 L1340 180 L1440 220 L1440 320 Z" />
      </svg>
    );
  }
  // farewell / default — rolling hills
  return (
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[35%] w-full" aria-hidden>
      <path fill={fill} fillOpacity="0.85" d="M0 320 L0 230 L240 210 L460 235 L720 215 L980 235 L1240 215 L1440 230 L1440 320 Z" />
    </svg>
  );
}

function DayHeaderImpl({ day, index }: { day: DayPlan; index: number }) {
  const tex = DAY_TEXTURES[index % DAY_TEXTURES.length];
  return (
    <header
      className="relative overflow-hidden rounded-3xl"
      style={{ background: tex.mesh, minHeight: 260 }}
    >
      {/* Layer 1: mesh gradient (already on the parent) */}

      {/* Layer 2: color grade overlay */}
      <div aria-hidden className="absolute inset-0" style={{ background: tex.grade, mixBlendMode: "multiply" }} />

      {/* Layer 3: SVG scene silhouettes */}
      <SceneSilhouettes kind={day.theme} fill={tex.silhouette} />

      {/* Layer 4: CSS particles */}
      <div aria-hidden className={cn("pointer-events-none absolute inset-0", tex.particle)} />

      {/* Layer 5: SVG film grain */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08] mix-blend-overlay">
        <filter id={`grain-${index}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${index})`} />
      </svg>

      {/* Layer 6: vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Layer 7: glassmorphic content card */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 md:py-14">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 md:p-7">
          {/* Day number badge + theme */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-widest font-bold anim-breathe"
              style={
                {
                  backgroundColor: `${tex.accent}22`,
                  color: tex.accent,
                  "--glow-color": `${tex.accent}55`,
                } as React.CSSProperties
              }
            >
              <span aria-hidden style={{ display: "inline-flex", alignItems: "center" }}>
                <SvgIcon name={DAY_ICON_MAP[index] ?? "nearby"} size={16} />
              </span>
              {day.day} · {day.theme}
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: `${tex.accent}cc` }}>
                Day
              </div>
              <div className="font-serif text-xl sm:text-3xl font-bold" style={{ color: tex.accent }}>
                {index + 1}
              </div>
            </div>
          </div>

          {/* Title (shimmer) */}
          <h2
            className="font-serif text-2xl sm:text-3xl md:text-5xl font-bold anim-shimmer leading-tight"
            style={{
              backgroundImage: `linear-gradient(90deg, ${tex.body}, ${tex.accent}, ${tex.body})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {day.title}
          </h2>
          <div className="mt-1 text-xs md:text-sm" style={{ color: `${tex.body}cc` }}>
            {day.date}
          </div>

          {/* Description */}
          <p className="mt-3 text-sm md:text-base leading-relaxed" style={{ color: tex.body }}>
            {day.description}
          </p>

          {/* Floating chips */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {day.highlights.slice(0, 4).map((h, i) => (
              <span
                key={i}
                className="anim-float rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: tex.body,
                  borderColor: `${tex.accent}44`,
                  border: "1px solid",
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                {h}
              </span>
            ))}
            {day.highlights.length > 4 && (
              <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ color: `${tex.body}99` }}>
                +{day.highlights.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const DayHeader = memo(DayHeaderImpl);
export default DayHeader;
