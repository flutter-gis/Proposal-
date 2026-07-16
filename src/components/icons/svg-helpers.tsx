/**
 * svg-helpers.ts — Shared utilities for generating 100+ polygon SVG icons
 *
 * Provides programmatic generators for repetitive elements (star fields,
 * sparkle rays, wheel spokes, particle systems) so each icon can reach
 * 100+ SVG elements without hundreds of lines of manual code.
 *
 * All generators produce deterministic output (seeded RNG) for SSR safety.
 */

import { type ReactNode } from "react";

// ── Seeded RNG (deterministic for SSR) ────────────────────────────────
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Animation value generators (20+ keyframes) ───────────────────────

/** Generate 21 opacity values for a twinkle/pulse animation (20 frames). */
export function twinkleValues(min = 0.2, max = 1): string {
  const rng = mulberry32(Math.floor((min + max) * 1000));
  const vals: string[] = [];
  for (let i = 0; i < 21; i++) {
    vals.push((min + rng() * (max - min)).toFixed(2));
  }
  return vals.join(";");
}

/** Generate 21 rotation values for a spin animation (20 frames, 360°). */
export function spinValues(steps = 20): string {
  const vals: string[] = [];
  for (let i = 0; i <= steps; i++) {
    vals.push(((i / steps) * 360).toFixed(1));
  }
  return vals.join(";");
}

/** Generate 21 scale values for a pulse animation. */
export function pulseValues(min = 0.8, max = 1.2): string {
  const vals: string[] = [];
  for (let i = 0; i < 21; i++) {
    const t = i / 20;
    const wave = Math.sin(t * Math.PI * 2);
    vals.push((min + (max - min) * (0.5 + wave * 0.5)).toFixed(3));
  }
  return vals.join(";");
}

/** Generate 21 Y-offset values for a bob/drift animation. */
export function driftValues(amplitude = 3, steps = 20): string {
  const vals: string[] = [];
  for (let i = 0; i <= steps; i++) {
    vals.push((Math.sin((i / steps) * Math.PI * 2) * amplitude).toFixed(2));
  }
  return vals.join(";");
}

// ── Star field generator ─────────────────────────────────────────────

interface StarOptions {
  count: number;
  seed: number;
  cx: number;
  cy: number;
  radius: number;
  animated: boolean;
  idPrefix: string;
}

/** Generate a field of twinkling stars (circles with SMIL animate). */
export function StarField({ count, seed, cx, cy, radius, animated, idPrefix }: StarOptions): ReactNode {
  const rng = mulberry32(seed);
  const stars: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const r = rng() * radius;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const size = 0.3 + rng() * 1.2;
    const delay = rng() * 3;
    stars.push(
      <circle
        key={`${idPrefix}-star-${i}`}
        cx={x.toFixed(2)}
        cy={y.toFixed(2)}
        r={size.toFixed(2)}
        fill="currentColor"
        opacity={0.4 + rng() * 0.4}
      >
        {animated && (
          <animate
            attributeName="opacity"
            values={twinkleValues(0.1, 0.9)}
            dur={`${2 + rng() * 3}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        )}
      </circle>
    );
  }
  return <>{stars}</>;
}

// ── Sparkle ray generator ────────────────────────────────────────────

interface SparkleOptions {
  count: number;
  cx: number;
  cy: number;
  innerR: number;
  outerR: number;
  animated: boolean;
  idPrefix: string;
  color?: string;
}

/** Generate rotating sparkle rays around a center point. */
export function SparkleRays({ count, cx, cy, innerR, outerR, animated, idPrefix, color = "currentColor" }: SparkleOptions): ReactNode {
  const rays: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;
    const midAngle = angle + 0.05;
    const mx = cx + Math.cos(midAngle) * (innerR + outerR) / 2;
    const my = cy + Math.sin(midAngle) * (innerR + outerR) / 2;
    rays.push(
      <polygon
        key={`${idPrefix}-ray-${i}`}
        points={`${x1.toFixed(2)},${y1.toFixed(2)} ${mx.toFixed(2)},${my.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`}
        fill={color}
        opacity="0.6"
      >
        {animated && (
          <animate
            attributeName="opacity"
            values={twinkleValues(0.2, 0.8)}
            dur={`${2 + i * 0.15}s`}
            begin={`${i * 0.1}s`}
            repeatCount="indefinite"
          />
        )}
      </polygon>
    );
  }
  return <>{rays}</>;
}

// ── Particle system generator ────────────────────────────────────────

interface ParticleOptions {
  count: number;
  seed: number;
  cx: number;
  cy: number;
  spread: number;
  size: number;
  animated: boolean;
  idPrefix: string;
  driftY?: number;
}

/** Generate floating particles (dust, sparks, bubbles, etc.). */
export function Particles({ count, seed, cx, cy, spread, size, animated, idPrefix, driftY = 8 }: ParticleOptions): ReactNode {
  const rng = mulberry32(seed);
  const particles: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy + (rng() - 0.5) * spread;
    const s = size * (0.5 + rng() * 0.8);
    particles.push(
      <circle
        key={`${idPrefix}-particle-${i}`}
        cx={x.toFixed(2)}
        cy={y.toFixed(2)}
        r={s.toFixed(2)}
        fill="currentColor"
        opacity={0.3 + rng() * 0.4}
      >
        {animated && (
          <>
            <animate
              attributeName="cy"
              values={`${y.toFixed(2)};${(y - driftY).toFixed(2)};${y.toFixed(2)}`}
              dur={`${3 + rng() * 2}s`}
              begin={`${rng() * 2}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values={twinkleValues(0.1, 0.5)}
              dur={`${3 + rng() * 2}s`}
              begin={`${rng() * 2}s`}
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>
    );
  }
  return <>{particles}</>;
}

// ── Theme gradient def ───────────────────────────────────────────────

interface GradientDefOptions {
  id: string;
  stops: { offset: string; color: string }[];
  type?: "linear" | "radial";
  angle?: number;
}

/** Generate a <defs> gradient that references CSS variables. */
export function ThemeGradient({ id, stops, type = "linear", angle = 135 }: GradientDefOptions): ReactNode {
  if (type === "radial") {
    return (
      <radialGradient id={id}>
        {stops.map((s, i) => (
          <stop key={i} offset={s.offset} stopColor={s.color} />
        ))}
      </radialGradient>
    );
  }
  const x1 = 50 - Math.cos((angle * Math.PI) / 180) * 50;
  const y1 = 50 - Math.sin((angle * Math.PI) / 180) * 50;
  const x2 = 50 + Math.cos((angle * Math.PI) / 180) * 50;
  const y2 = 50 + Math.sin((angle * Math.PI) / 180) * 50;
  return (
    <linearGradient id={id} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
      {stops.map((s, i) => (
        <stop key={i} offset={s.offset} stopColor={s.color} />
      ))}
    </linearGradient>
  );
}
