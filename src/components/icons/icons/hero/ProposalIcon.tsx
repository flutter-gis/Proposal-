/**
 * ProposalIcon.tsx — HERO ICON (700+ elements)
 *
 * An ornate engagement ring with a brilliant-cut diamond, gold band with
 * pavé-set side stones, rose-gold prongs, sparkle burst, and a starfield
 * background. The most detailed icon in the system.
 *
 * Layers:
 *   1. Defs (gradients, filters) — ~15 elements
 *   2. Atmosphere (starfield, glow) — ~120 elements
 *   3. Ring band (gold with facets) — ~100 elements
 *   4. Pavé side stones (12 small diamonds) — ~60 elements
 *   5. Diamond (octahedron with facets) — ~80 elements
 *   6. Prongs (4 gold prongs) — ~20 elements
 *   7. Sparkle burst (rotating rays + stars) — ~120 elements
 *   8. Light reflections & highlights — ~60 elements
 *   9. Floating particles — ~80 elements
 *   10. Band engraving & texture — ~60 elements
 */

import { type ReactNode } from "react";
import { mulberry32, twinkleValues, StarField, SparkleRays, Particles, ThemeGradient } from "../../svg-helpers";
import { DiamondSparkle, SunRays } from "../../generators/generators";

export function ProposalIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(777);

  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-gold-band`} stops={[
          { offset: "0%", color: "#fbbf24" },
          { offset: "30%", color: "var(--rust-brass)" },
          { offset: "60%", color: "#d4af37" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} />
        <ThemeGradient id={`${id}-gold-bright`} stops={[
          { offset: "0%", color: "#fef3c7" },
          { offset: "50%", color: "#fbbf24" },
          { offset: "100%", color: "var(--rust-brass)" },
        ]} />
        <radialGradient id={`${id}-diamond-glow`}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#e0e7ff" />
          <stop offset="70%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </radialGradient>
        <radialGradient id={`${id}-aura`}>
          <stop offset="0%" stopColor="var(--rust-brass)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--rust-brass)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Layer 1: Atmosphere — Starfield + Aura ── */}
      <circle cx={32} cy={28} r={28} fill={`url(#${id}-aura)`} />
      <StarField count={60} seed={42} cx={32} cy={28} radius={28} animated={animated} idPrefix={id} />

      {/* ── Layer 2: Ring band — Gold torus with facets ── */}
      {/* Band outer */}
      <ellipse cx={32} cy={42} rx={15} ry={11} fill="none" stroke={`url(#${id}-gold-band)`} strokeWidth={4}>
        {animated && <animate attributeName="stroke-dasharray" values="0;47;94;47;0" dur="6s" repeatCount="indefinite" />}
      </ellipse>
      {/* Band inner highlight */}
      <ellipse cx={32} cy={42} rx={15} ry={11} fill="none" stroke="#fbbf24" strokeWidth={1.5} opacity={0.6} />
      {/* Band inner shadow */}
      <ellipse cx={32} cy={42} rx={14} ry={10} fill="none" stroke="var(--rust-wax)" strokeWidth={0.8} opacity={0.4} />

      {/* Band facets — 30 segments around the band */}
      {Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const x1 = 32 + Math.cos(angle) * 15;
        const y1 = 42 + Math.sin(angle) * 11;
        const x2 = 32 + Math.cos(angle) * 13;
        const y2 = 42 + Math.sin(angle) * 9.5;
        return (
          <line key={`${id}-band-facet-${i}`} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="var(--rust-wax)" strokeWidth={0.3} opacity={0.3} />
        );
      })}

      {/* Band highlights — 15 bright segments */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2 - Math.PI / 4;
        const x1 = 32 + Math.cos(angle) * 15;
        const y1 = 42 + Math.sin(angle) * 11;
        const x2 = 32 + Math.cos(angle + 0.1) * 15;
        const y2 = 42 + Math.sin(angle + 0.1) * 11;
        return (
          <line key={`${id}-band-hl-${i}`} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#fef3c7" strokeWidth={0.6} opacity={0.4} />
        );
      })}

      {/* ── Layer 3: Pavé side stones (12 small diamonds on band) ── */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 + Math.PI / 12;
        const x = 32 + Math.cos(angle) * 15;
        const y = 42 + Math.sin(angle) * 11;
        // Skip stones where the main diamond sits
        if (y < 34) return null;
        return (
          <g key={`${id}-pave-${i}`}>
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={1.2} fill="#fef3c7" stroke="var(--rust-brass)" strokeWidth={0.2} opacity={0.8} />
            <circle cx={(x - 0.3).toFixed(1)} cy={(y - 0.3).toFixed(1)} r={0.4} fill="#ffffff" opacity={0.5} />
            {/* Pavé setting prongs */}
            <line x1={(x - 1).toFixed(1)} y1={y.toFixed(1)} x2={(x - 0.5).toFixed(1)} y2={y.toFixed(1)} stroke={`url(#${id}-gold-bright)`} strokeWidth={0.4} />
            <line x1={(x + 0.5).toFixed(1)} y1={y.toFixed(1)} x2={(x + 1).toFixed(1)} y2={y.toFixed(1)} stroke={`url(#${id}-gold-bright)`} strokeWidth={0.4} />
          </g>
        );
      })}

      {/* ── Layer 4: Engraving on band (decorative scrollwork) ── */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const x = 32 + Math.cos(angle) * 14.5;
        const y = 42 + Math.sin(angle) * 10.5;
        if (y < 34) return null;
        return (
          <circle key={`${id}-engrave-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={0.3} fill="var(--rust-wax)" opacity={0.4} />
        );
      })}
      {/* Band texture lines */}
      {Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const x = 32 + Math.cos(angle) * 14;
        const y = 42 + Math.sin(angle) * 10;
        if (y < 35) return null;
        return (
          <line key={`${id}-btext-${i}`} x1={x.toFixed(1)} y1={y.toFixed(1)} x2={(32 + Math.cos(angle) * 16).toFixed(1)} y2={(42 + Math.sin(angle) * 12).toFixed(1)} stroke="var(--rust-bg-dark)" strokeWidth={0.15} opacity={0.15} />
        );
      })}

      {/* ── Layer 5: Prongs (4 gold prongs holding diamond) ── */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const baseX = 32 + Math.cos(angle) * 5;
        const baseY = 32 + Math.sin(angle) * 5;
        const tipX = 32 + Math.cos(angle) * 8;
        const tipY = 32 + Math.sin(angle) * 8;
        return (
          <g key={`${id}-prong-${i}`}>
            <path d={`M ${baseX.toFixed(1)} ${baseY.toFixed(1)} Q ${(baseX + tipX) / 2 + Math.cos(angle + 1) * 1.5} ${(baseY + tipY) / 2 + Math.sin(angle + 1) * 1.5} ${tipX.toFixed(1)} ${tipY.toFixed(1)}`} fill="none" stroke={`url(#${id}-gold-bright)`} strokeWidth={1.5} strokeLinecap="round" />
            <circle cx={tipX.toFixed(1)} cy={tipY.toFixed(1)} r={0.8} fill={`url(#${id}-gold-bright)`} />
            <circle cx={(tipX - 0.2).toFixed(1)} cy={(tipY - 0.2).toFixed(1)} r={0.3} fill="#fef3c7" opacity={0.5} />
          </g>
        );
      })}

      {/* ── Layer 6: Diamond — brilliant cut with facets ── */}
      {/* Diamond glow */}
      <circle cx={32} cy={28} r={12} fill={`url(#${id}-diamond-glow)`} opacity={0.15}>
        {animated && <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite" />}
      </circle>

      {/* Diamond table (top flat facet) */}
      <polygon points="28,20 36,20 38,24 34,26 30,26 26,24" fill="#e0e7ff" stroke="var(--rust-bg-dark)" strokeWidth={0.3} />
      {/* Diamond crown facets (8 triangles) */}
      {Array.from({ length: 8 }, (_, i) => {
        const a1 = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
        const r1 = 4;
        const r2 = 8;
        const x1 = 32 + Math.cos(a1) * r1;
        const y1 = 26 + Math.sin(a1) * r1 * 0.7;
        const x2 = 32 + Math.cos(a2) * r1;
        const y2 = 26 + Math.sin(a2) * r1 * 0.7;
        const x3 = 32 + Math.cos((a1 + a2) / 2) * r2;
        const y3 = 22 + Math.sin((a1 + a2) / 2) * r2 * 0.7;
        const shade = i % 2 === 0 ? "#c7d2fe" : "#e0e7ff";
        return <polygon key={`${id}-crown-${i}`} points={`${x1.toFixed(1)},${y1.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`} fill={shade} stroke="var(--rust-bg-dark)" strokeWidth={0.2} opacity={0.8} />;
      })}
      {/* Diamond pavilion facets (8 triangles pointing down) */}
      {Array.from({ length: 8 }, (_, i) => {
        const a1 = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
        const r = 8;
        const x1 = 32 + Math.cos(a1) * r;
        const y1 = 22 + Math.sin(a1) * r * 0.7;
        const x2 = 32 + Math.cos(a2) * r;
        const y2 = 22 + Math.sin(a2) * r * 0.7;
        const shade = i % 2 === 0 ? "#a5b4fc" : "#c7d2fe";
        return <polygon key={`${id}-pavilion-${i}`} points={`${x1.toFixed(1)},${y1.toFixed(1)} 32,34 ${x2.toFixed(1)},${y2.toFixed(1)}`} fill={shade} stroke="var(--rust-bg-dark)" strokeWidth={0.2} opacity={0.7} />;
      })}
      {/* Diamond culet (bottom point) */}
      <polygon points="30,34 34,34 32,36" fill="#818cf8" opacity={0.5} />
      {/* Diamond girdle (equator line) */}
      <ellipse cx={32} cy={22} rx={8} ry={5.6} fill="none" stroke="var(--rust-bg-dark)" strokeWidth={0.4} />
      {/* Diamond table outline */}
      <polygon points="28,20 36,20 38,24 34,26 30,26 26,24" fill="none" stroke="#ffffff" strokeWidth={0.2} opacity={0.5} />
      {/* Internal facet lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x = 32 + Math.cos(a) * 8;
        const y = 22 + Math.sin(a) * 5.6;
        return <line key={`${id}-facet-line-${i}`} x1={32} y1={26} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="#ffffff" strokeWidth={0.15} opacity={0.3} />;
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x = 32 + Math.cos(a) * 8;
        const y = 22 + Math.sin(a) * 5.6;
        return <line key={`${id}-pav-line-${i}`} x1={x.toFixed(1)} y1={y.toFixed(1)} x2={32} y2={34} stroke="#ffffff" strokeWidth={0.15} opacity={0.2} />;
      })}

      {/* Diamond sparkle highlights (20 points) */}
      {Array.from({ length: 20 }, (_, i) => {
        const a = rng() * Math.PI * 2;
        const r = 2 + rng() * 8;
        const x = 32 + Math.cos(a) * r;
        const y = 26 + Math.sin(a) * r * 0.7;
        const s = 0.5 + rng() * 1;
        return (
          <polygon key={`${id}-dh-${i}`} points={`${x},${y - s} ${x + s * 0.2},${y - s * 0.2} ${x + s},${y} ${x + s * 0.2},${y + s * 0.2} ${x},${y + s} ${x - s * 0.2},${y + s * 0.2} ${x - s},${y} ${x - s * 0.2},${y - s * 0.2}`} fill="#ffffff" opacity={0.3 + rng() * 0.4}>
            {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.7)} dur={`${1.5 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
          </polygon>
        );
      })}

      {/* ── Layer 7: Sparkle burst — rotating rays around diamond ── */}
      <SunRays cx={32} cy={26} innerR={10} outerR={16} count={24} idPrefix={id} animated={animated} color="var(--rust-brass)" />
      <SparkleRays count={16} cx={32} cy={26} innerR={9} outerR={14} animated={animated} idPrefix={`${id}-spark2`} color="#fef3c7" />

      {/* Central rotating sparkle */}
      {animated && (
        <g transform="translate(32, 26)">
          <polygon points="0,-5 1,-1 5,0 1,1 0,5 -1,1 -5,0 -1,-1" fill="#ffffff">
            <animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values={twinkleValues(0.3, 1)} dur="2s" repeatCount="indefinite" />
          </polygon>
        </g>
      )}

      {/* ── Layer 8: Light reflections on band ── */}
      <path d="M19,38 Q24,34 28,34" fill="none" stroke="#fef3c7" strokeWidth={1.2} opacity={0.5} strokeLinecap="round" />
      <path d="M20,40 Q25,37 29,37" fill="none" stroke="#fbbf24" strokeWidth={0.6} opacity={0.3} strokeLinecap="round" />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = Math.PI * 1.2 + (i / 8) * Math.PI * 0.6;
        const x = 32 + Math.cos(angle) * 14;
        const y = 42 + Math.sin(angle) * 10;
        return <line key={`${id}-refl-${i}`} x1={x.toFixed(1)} y1={y.toFixed(1)} x2={(x + 1).toFixed(1)} y2={(y + 0.5).toFixed(1)} stroke="#fef3c7" strokeWidth={0.4} opacity={0.3} />;
      })}

      {/* ── Layer 9: Floating gold particles ── */}
      <Particles count={40} seed={99} cx={32} cy={28} radius={24} spread={40} size={0.5} animated={animated} idPrefix={`${id}-float`} driftY={-4} />

      {/* ── Layer 10: Extra diamond sparkles ── */}
      {Array.from({ length: 15 }, (_, i) => {
        const x = rng() * 48 + 8;
        const y = rng() * 48 + 8;
        const s = 0.4 + rng() * 0.8;
        return <DiamondSparkle key={`${id}-extra-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} size={s} idPrefix={`${id}-ex${i}`} animated={animated} />;
      })}

      {/* ── Band shadow on ground ── */}
      <ellipse cx={32} cy={52} rx={14} ry={2} fill="var(--rust-bg-dark)" opacity={0.1} />
    </>
  );
}
