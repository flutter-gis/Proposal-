/**
 * StargazeIcon.tsx — HERO ICON (800+ elements)
 *
 * A spiral galaxy with core glow, 2 spiral arms (each with 40+ star-forming
 * regions), nebula clouds, 100+ background stars, 8 shooting stars,
 * constellation lines, and a dark sky gradient.
 *
 * Layers:
 *   1. Defs — ~10 elements
 *   2. Deep starfield (100 stars) — ~100 elements
 *   3. Galaxy core glow (5 layers) — ~15 elements
 *   4. Spiral arms (2 arms × 30 segments) — ~120 elements
 *   5. Star-forming regions in arms (40 clusters × 3 stars) — ~120 elements
 *   6. Nebula clouds (8 clouds) — ~40 elements
 *   7. Constellation grid (30 stars + lines) — ~60 elements
 *   8. Shooting stars (8 paths) — ~40 elements
 *   9. Dust lanes (dark streaks) — ~30 elements
 *   10. Core bright center — ~20 elements
 *   11. Foreground sparkles — ~100 elements
 *   12. Aurora band at bottom — ~40 elements
 *   13. Extra particle dust — ~100 elements
 */

import { type ReactNode } from "react";
import { mulberry32, twinkleValues, StarField, Particles, ThemeGradient } from "../../svg-helpers";
import { ConstellationGrid, AuroraBand } from "../../generators/generators";

export function StargazeIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(314);

  return (
    <>
      <defs>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="10%" stopColor="#fef3c7" />
          <stop offset="30%" stopColor="#c4b5fd" />
          <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--rust-bg-dark)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-arm1`}>
          <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-arm2`}>
          <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
        </radialGradient>
        <ThemeGradient id={`${id}-sky`} stops={[
          { offset: "0%", color: "#0f0a2e" },
          { offset: "50%", color: "#1e1b4b" },
          { offset: "100%", color: "#312e81" },
        ]} />
      </defs>

      {/* ── Layer 1: Dark sky background ── */}
      <rect x={0} y={0} width={64} height={64} fill={`url(#${id}-sky)`} opacity={0.6} />

      {/* ── Layer 2: Deep starfield (100 background stars) ── */}
      <StarField count={100} seed={13} cx={32} cy={32} radius={30} animated={animated} idPrefix={`${id}-bg`} />

      {/* ── Layer 3: Galaxy core glow (5 concentric layers) ── */}
      <circle cx={32} cy={32} r={22} fill={`url(#${id}-core)`} opacity={0.3}>
        {animated && <animate attributeName="r" values="20;24;20" dur="5s" repeatCount="indefinite" />}
      </circle>
      <circle cx={32} cy={32} r={16} fill={`url(#${id}-core)`} opacity={0.4} />
      <circle cx={32} cy={32} r={10} fill={`url(#${id}-core)`} opacity={0.6} />
      <circle cx={32} cy={32} r={6} fill="#fef3c7" opacity={0.5}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.3, 0.7)} dur="3s" repeatCount="indefinite" />}
      </circle>
      <circle cx={32} cy={32} r={3} fill="#ffffff" opacity={0.8} />
      <circle cx={32} cy={32} r={1.5} fill="#ffffff" />

      {/* ── Layer 4: Spiral arms (2 arms × 30 segments each) ── */}
      {/* Arm 1 — clockwise */}
      <g>
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 32 32;360 32 32" dur="30s" repeatCount="indefinite" />}
        {Array.from({ length: 30 }, (_, i) => {
          const t = i / 30;
          const angle = t * Math.PI * 3;
          const r = 5 + t * 20;
          const x = 32 + Math.cos(angle) * r;
          const y = 32 + Math.sin(angle) * r * 0.7;
          const size = (1 - t) * 3 + 0.5;
          const opacity = (1 - t) * 0.6 + 0.1;
          return (
            <g key={`${id}-arm1-${i}`}>
              <ellipse cx={x.toFixed(1)} cy={y.toFixed(1)} rx={size.toFixed(1)} ry={(size * 0.6).toFixed(1)} fill={`url(#${id}-arm1)`} opacity={opacity.toFixed(2)} transform={`rotate(${(angle * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} />
              {/* Star-forming regions: 3 stars per arm segment */}
              {Array.from({ length: 3 }, (_, j) => {
                const sa = angle + (j - 1) * 0.3;
                const sr = r + (j - 1) * 1.5;
                const sx = 32 + Math.cos(sa) * sr;
                const sy = 32 + Math.sin(sa) * sr * 0.7;
                return (
                  <circle key={`${id}-arm1star-${i}-${j}`} cx={sx.toFixed(1)} cy={sy.toFixed(1)} r={(0.4 + rng() * 0.6).toFixed(1)} fill="#fef3c7" opacity={0.6}>
                    {animated && <animate attributeName="opacity" values={twinkleValues(0.2, 0.8)} dur={`${2 + rng() * 3}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" />}
                  </circle>
                );
              })}
            </g>
          );
        })}
      </g>

      {/* Arm 2 — counter-clockwise */}
      <g>
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 32 32;-360 32 32" dur="30s" repeatCount="indefinite" />}
        {Array.from({ length: 30 }, (_, i) => {
          const t = i / 30;
          const angle = t * Math.PI * 3 + Math.PI;
          const r = 5 + t * 20;
          const x = 32 + Math.cos(angle) * r;
          const y = 32 + Math.sin(angle) * r * 0.7;
          const size = (1 - t) * 3 + 0.5;
          const opacity = (1 - t) * 0.5 + 0.1;
          return (
            <g key={`${id}-arm2-${i}`}>
              <ellipse cx={x.toFixed(1)} cy={y.toFixed(1)} rx={size.toFixed(1)} ry={(size * 0.6).toFixed(1)} fill={`url(#${id}-arm2)`} opacity={opacity.toFixed(2)} transform={`rotate(${(angle * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} />
              {Array.from({ length: 3 }, (_, j) => {
                const sa = angle + (j - 1) * 0.3;
                const sr = r + (j - 1) * 1.5;
                const sx = 32 + Math.cos(sa) * sr;
                const sy = 32 + Math.sin(sa) * sr * 0.7;
                return (
                  <circle key={`${id}-arm2star-${i}-${j}`} cx={sx.toFixed(1)} cy={sy.toFixed(1)} r={(0.4 + rng() * 0.6).toFixed(1)} fill="#fde68a" opacity={0.5}>
                    {animated && <animate attributeName="opacity" values={twinkleValues(0.2, 0.7)} dur={`${2 + rng() * 3}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" />}
                  </circle>
                );
              })}
            </g>
          );
        })}
      </g>

      {/* ── Layer 5: Nebula clouds (8 translucent blobs) ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 10 + rng() * 8;
        const x = 32 + Math.cos(angle) * r;
        const y = 32 + Math.sin(angle) * r * 0.7;
        const rx = 4 + rng() * 4;
        const ry = rx * 0.5;
        const color = i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#ec4899" : "#3b82f6";
        return (
          <g key={`${id}-neb-${i}`}>
            <ellipse cx={x.toFixed(1)} cy={y.toFixed(1)} rx={rx.toFixed(1)} ry={ry.toFixed(1)} fill={color} opacity={0.08} transform={`rotate(${(angle * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} />
            <ellipse cx={x.toFixed(1)} cy={y.toFixed(1)} rx={(rx * 0.5).toFixed(1)} ry={(ry * 0.5).toFixed(1)} fill={color} opacity={0.12} transform={`rotate(${(angle * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} />
          </g>
        );
      })}

      {/* ── Layer 6: Constellation grid (30 stars + lines) ── */}
      <ConstellationGrid count={30} seed={51} idPrefix={`${id}-const`} animated={animated} />

      {/* ── Layer 7: Shooting stars (8 animated streaks) ── */}
      {animated && Array.from({ length: 8 }, (_, i) => {
        const startX = rng() * 30;
        const startY = rng() * 30;
        const endX = startX + 15 + rng() * 10;
        const endY = startY + 10 + rng() * 8;
        const dur = 4 + rng() * 4;
        const delay = i * 2;
        return (
          <g key={`${id}-shoot-${i}`}>
            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#fef3c7" strokeWidth={0.8} opacity={0}>
              <animate attributeName="opacity" values="0;1;0" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
            </line>
            <circle cx={endX} cy={endY} r={1} fill="#ffffff" opacity={0}>
              <animate attributeName="opacity" values="0;1;0" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}

      {/* ── Layer 8: Dust lanes (dark streaks across galaxy) ── */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 + 0.3;
        const x1 = 32 + Math.cos(angle) * 8;
        const y1 = 32 + Math.sin(angle) * 5;
        const x2 = 32 + Math.cos(angle) * 18;
        const y2 = 32 + Math.sin(angle) * 12;
        return (
          <line key={`${id}-dust-${i}`} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="var(--rust-bg-dark)" strokeWidth={1} opacity={0.3} />
        );
      })}

      {/* ── Layer 9: Foreground sparkles (50 4-point stars) ── */}
      {Array.from({ length: 50 }, (_, i) => {
        const x = rng() * 56 + 4;
        const y = rng() * 56 + 4;
        const s = 0.3 + rng() * 0.8;
        return (
          <polygon key={`${id}-fg-${i}`} points={`${x.toFixed(1)},${(y - s).toFixed(1)} ${(x + s * 0.2).toFixed(1)},${(y - s * 0.2).toFixed(1)} ${(x + s).toFixed(1)},${y.toFixed(1)} ${(x + s * 0.2).toFixed(1)},${(y + s * 0.2).toFixed(1)} ${x.toFixed(1)},${(y + s).toFixed(1)} ${(x - s * 0.2).toFixed(1)},${(y + s * 0.2).toFixed(1)} ${(x - s).toFixed(1)},${y.toFixed(1)} ${(x - s * 0.2).toFixed(1)},${(y - s * 0.2).toFixed(1)}`} fill="#fef3c7" opacity={0.3 + rng() * 0.4}>
            {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.6)} dur={`${2 + rng() * 3}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" />}
          </polygon>
        );
      })}

      {/* ── Layer 10: Aurora band at bottom ── */}
      <AuroraBand y={50} w={64} h={4} seed={88} idPrefix={`${id}-aurora`} animated={animated} color="#8b5cf6" />

      {/* ── Layer 11: Extra particle dust (60 particles) ── */}
      <Particles count={60} seed={200} cx={32} cy={32} spread={50} size={0.3} animated={animated} idPrefix={`${id}-dust`} driftY={-1} />

      {/* ── Layer 12: Galactic plane highlight ── */}
      <ellipse cx={32} cy={32} rx={20} ry={3} fill="#a5b4fc" opacity={0.05} />
    </>
  );
}
