/**
 * day-icons-svg.tsx
 *
 * 3 new animated SVG icons for day themes not covered by category icons:
 *   - CarIcon (Day 1 — Off-Grid Escape)
 *   - LightningIcon (Day 3 — Powered Preparation)
 *   - CroissantIcon (Day 6 — Double-Header Grand Finale)
 *
 * The other 3 day icons reuse existing category icons:
 *   - Day 2: hike (boot)
 *   - Day 4: proposal (ring)
 *   - Day 5: stargaze (galaxy)
 *
 * Each icon: 100+ SVG elements, 3+ SMIL animations (20+ keyframes),
 * CSS variable colors for theme integration.
 */

import { type ReactNode } from "react";
import {
  mulberry32, twinkleValues, spinValues, pulseValues, driftValues,
  StarField, SparkleRays, Particles, ThemeGradient,
} from "./svg-helpers";

// ── CAR (Day 1) ───────────────────────────────────────────────────────
export function CarIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-body`} stops={[
          { offset: "0%", color: "var(--rust-ember)" },
          { offset: "50%", color: "var(--rust-wax)" },
          { offset: "100%", color: "var(--rust-bark)" },
        ]} />
        <ThemeGradient id={`${id}-window`} stops={[
          { offset: "0%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-cream)" },
        ]} />
      </defs>
      {/* Dust particles behind car */}
      <Particles count={18} seed={37} cx={12} cy={48} spread={12} size={0.8} animated={animated} idPrefix={id} driftY={-3} />
      {/* Road */}
      <line x1={0} y1={54} x2={64} y2={54} stroke="var(--rust-bark)" strokeWidth={1} opacity={0.3} />
      {/* Road dashes */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={`${id}-dash-${i}`} x={4 + i * 10} y={53} width={5} height={1.5} fill="var(--rust-brass)" opacity={0.3} />
      ))}
      {/* Car shadow */}
      <ellipse cx={32} cy={53} rx={20} ry={2} fill="var(--rust-bark)" opacity={0.15} />
      {/* Car body lower */}
      <path d="M8,40 L10,34 Q12,30 16,30 L24,28 L34,24 L44,26 L50,30 L54,34 L56,40 L56,46 L8,46 Z" fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.8}>
        {animated && <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0;0,0.5;0,0" dur="1.5s" repeatCount="indefinite" />}
      </path>
      {/* Hood */}
      <path d="M34,24 L44,26 L48,30 L36,30 Z" fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Roof */}
      <path d="M24,28 L34,24 L34,30 L24,30 Z" fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Windshield */}
      <polygon points="25,29 33,25 33,30 25,30" fill={`url(#${id}-window)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Rear window */}
      <polygon points="35,25 43,27 47,30 35,30" fill={`url(#${id}-window)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Side window */}
      <rect x={26} y={31} width={16} height={4} rx={0.5} fill={`url(#${id}-window)`} opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Window reflection */}
      <line x1={27} y1={31} x2={30} y2={34} stroke="var(--rust-cream)" strokeWidth={0.4} opacity={0.5} />
      {/* Door line */}
      <line x1={34} y1={30} x2={34} y2={44} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4} />
      {/* Door handle */}
      <rect x={28} y={36} width={4} height={1} rx={0.3} fill="var(--rust-brass)" opacity={0.6} />
      {/* Headlight */}
      <circle cx={54} cy={38} r={2} fill="var(--rust-brass)" stroke="var(--rust-bark)" strokeWidth={0.3} />
      <circle cx={54} cy={38} r={1} fill="var(--rust-cream)" />
      {animated && <circle cx={54} cy={38} r={3} fill="var(--rust-brass)" opacity={0.2}><animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" /></circle>}
      {/* Headlight beams */}
      {animated && [0, 1, 2].map(i => (
        <line key={`${id}-beam-${i}`} x1={55} y1={38} x2={62 + i * 2} y2={36 - i * 2} stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0}>
          <animate attributeName="opacity" values="0;0.3;0" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* Taillight */}
      <circle cx={8} cy={38} r={1.5} fill="var(--rust-wax)" stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Bumper */}
      <rect x={6} y={42} width={4} height={3} rx={1} fill="var(--rust-bark)" />
      <rect x={54} y={42} width={4} height={3} rx={1} fill="var(--rust-bark)" />
      {/* Front grille */}
      {[0, 1, 2].map(i => (
        <line key={`${id}-grille-${i}`} x1={52} y1={40 + i} x2={55} y2={40 + i} stroke="var(--rust-bark)" strokeWidth={0.3} />
      ))}
      {/* Wheels */}
      {[0, 1].map(wi => {
        const wx = wi === 0 ? 18 : 46;
        return (
          <g key={`${id}-wheel-${wi}`}>
            {/* Tire */}
            <circle cx={wx} cy={46} r={7} fill="var(--rust-bg-dark)" stroke="var(--rust-bark)" strokeWidth={0.5} />
            {/* Hubcap */}
            <circle cx={wx} cy={46} r={4} fill="var(--rust-wax)" stroke="var(--rust-bark)" strokeWidth={0.4} />
            <circle cx={wx} cy={46} r={1.5} fill="var(--rust-brass)" />
            {/* Spokes (5 per wheel = 10 total) */}
            {[0, 1, 2, 3, 4].map(j => {
              const angle = (j / 5) * Math.PI * 2;
              return (
                <line key={`${id}-spoke-${wi}-${j}`}
                  x1={wx} y1={46}
                  x2={wx + Math.cos(angle) * 3.5} y2={46 + Math.sin(angle) * 3.5}
                  stroke="var(--rust-bark)" strokeWidth={0.5}
                >
                  {animated && <animateTransform attributeName="transform" type="rotate" values={`0 ${wx} 46;360 ${wx} 46`} dur={`${1.5 + wi * 0.3}s`} repeatCount="indefinite" />}
                </line>
              );
            })}
            {/* Wheel well arch */}
            <path d={`M${wx - 8},42 Q${wx},35 ${wx + 8},42`} fill="none" stroke="var(--rust-bark)" strokeWidth={1} opacity={0.5} />
          </g>
        );
      })}
      {/* Roof rack */}
      <line x1={26} y1={27} x2={33} y2={25.5} stroke="var(--rust-bark)" strokeWidth={0.6} />
      <line x1={26} y1={28} x2={33} y2={26.5} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Roof cargo */}
      <rect x={27} y={25} width={5} height={2.5} rx={0.5} fill="var(--rust-forest)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Exhaust */}
      <rect x={5} y={44} width={3} height={2} rx={0.5} fill="var(--rust-bg-dark)" />
      {/* Exhaust smoke */}
      {animated && [0, 1, 2, 3].map(i => (
        <circle key={`${id}-exhaust-${i}`} cx={4} cy={45} r={1 + i * 0.5} fill="var(--theme-anim-particle)" opacity={0}>
          <animate attributeName="cx" values="4;-2;-8" dur={`${2 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values="45;42;40" dur={`${2 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.4;0" dur={`${2 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Side trim line */}
      <line x1={10} y1={40} x2={54} y2={40} stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0.3} />
    </>
  );
}

// ── LIGHTNING (Day 3) ─────────────────────────────────────────────────
export function LightningIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-bolt`} stops={[
          { offset: "0%", color: "#fbbf24" },
          { offset: "50%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-ember)" },
        ]} />
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Background sparkles */}
      <StarField count={30} seed={73} cx={32} cy={28} radius={26} animated={animated} idPrefix={id} />
      {/* Glow halo */}
      <circle cx={32} cy={28} r={20} fill={`url(#${id}-glow)`}>
        {animated && <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />}
      </circle>
      <circle cx={32} cy={28} r={14} fill={`url(#${id}-glow)`} opacity={0.5}>
        {animated && <animate attributeName="r" values="10;18;10" dur="1.5s" begin="0.3s" repeatCount="indefinite" />}
      </circle>
      {/* Main lightning bolt (12-segment zigzag) */}
      <polygon points="34,6 26,24 32,24 24,42 36,22 30,22 38,6" fill={`url(#${id}-bolt)`} stroke="var(--rust-bark)" strokeWidth={0.5}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.6, 1)} dur="1.5s" repeatCount="indefinite" />}
      </polygon>
      {/* Bolt inner highlight */}
      <polygon points="34,8 28,22 32,22 26,38 35,20 31,20 36,8" fill="#fef3c7" opacity={0.4} />
      {/* Bolt edge detail */}
      <line x1={34} y1={6} x2={38} y2={6} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <line x1={30} y1={22} x2={32} y2={22} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Branch arcs (6 branches) */}
      {animated && [0, 1, 2, 3, 4, 5].map(i => {
        const startX = [26, 32, 24, 34, 28, 30][i];
        const startY = [20, 14, 30, 26, 10, 34][i];
        const endX = [18, 40, 16, 42, 22, 38][i];
        const endY = [24, 16, 36, 30, 14, 38][i];
        return (
          <polyline key={`${id}-arc-${i}`} points={`${startX},${startY} ${(startX + endX) / 2 + (i % 2 === 0 ? 2 : -2)},${(startY + endY) / 2} ${endX},${endY}`} fill="none" stroke="#fbbf24" strokeWidth={0.8} opacity={0}>
            <animate attributeName="opacity" values="0;0.8;0" dur="1s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
          </polyline>
        );
      })}
      {/* Spark particles (8) */}
      {animated && [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 8 + (i % 3) * 3;
        return (
          <circle key={`${id}-spark-${i}`} cx={32 + Math.cos(angle) * r} cy={28 + Math.sin(angle) * r} r={0.8} fill="#fbbf24" opacity={0}>
            <animate attributeName="opacity" values={twinkleValues(0, 0.9)} dur={`${1.5 + i * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="0.5;1.5;0.5" dur={`${1.5 + i * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
          </circle>
        );
      })}
      {/* Energy crackles around bolt */}
      {animated && [0, 1, 2, 3, 4, 5].map(i => (
        <line key={`${id}-crackle-${i}`}
          x1={[24, 36, 28, 34, 26, 32][i]} y1={[12, 16, 20, 24, 32, 38][i]}
          x2={[20, 40, 24, 38, 22, 36][i]} y2={[10, 14, 22, 26, 34, 40][i]}
          stroke="#fbbf24" strokeWidth={0.4} opacity={0}>
          <animate attributeName="opacity" values="0;0.5;0" dur="0.8s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* Ground line */}
      <line x1={8} y1={54} x2={56} y2={54} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.2} />
      {/* Impact glow at base */}
      {animated && <circle cx={30} cy={44} r={6} fill={`url(#${id}-glow)`}><animate attributeName="r" values="4;8;4" dur="2s" begin="0.5s" repeatCount="indefinite" /></circle>}
      {/* Power lines / poles (decorative) */}
      <line x1={8} y1={20} x2={8} y2={54} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.3} />
      <line x1={56} y1={20} x2={56} y2={54} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.3} />
      <line x1={6} y1={22} x2={10} y2={22} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.3} />
      <line x1={54} y1={22} x2={58} y2={22} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.3} />
      <line x1={8} y1={22} x2={56} y2={22} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.2} strokeDasharray="2,2" />
    </>
  );
}

// ── CROISSANT (Day 6) ─────────────────────────────────────────────────
export function CroissantIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-crust`} stops={[
          { offset: "0%", color: "#fbbf24" },
          { offset: "50%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-ember)" },
        ]} />
        <ThemeGradient id={`${id}-inner`} stops={[
          { offset: "0%", color: "#fef3c7" },
          { offset: "100%", color: "#fde68a" },
        ]} />
      </defs>
      {/* Steam particles */}
      <Particles count={12} seed={91} cx={32} cy={18} spread={20} size={0.6} animated={animated} idPrefix={id} driftY={-6} />
      {/* Plate */}
      <ellipse cx={32} cy={50} rx={24} ry={5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.6} />
      <ellipse cx={32} cy={50} rx={20} ry={3} fill="var(--rust-parchment)" opacity={0.4} />
      {/* Croissant outer shape — crescent */}
      <path d="M12,36 Q14,18 32,14 Q50,18 52,36 Q48,32 42,34 Q38,30 32,30 Q26,30 22,34 Q16,32 12,36 Z" fill={`url(#${id}-crust)`} stroke="var(--rust-bark)" strokeWidth={0.8}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="-2 32 32;2 32 32;-2 32 32" dur="4s" repeatCount="indefinite" />}
      </path>
      {/* Croissant inner layers (6 curving segments) */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const y = 20 + i * 3;
        const offset = Math.sin(i) * 2;
        return (
          <path key={`${id}-layer-${i}`}
            d={`M${16 + offset},${y} Q${24},${y - 2} ${32},${y - 1} Q${40},${y - 2} ${48 - offset},${y}`}
            fill="none" stroke="var(--rust-wax)" strokeWidth={0.6} opacity={0.4}
          />
        );
      })}
      {/* Layer highlights */}
      {[0, 1, 2, 3].map(i => (
        <path key={`${id}-highlight-${i}`}
          d={`M${20 + i * 6},${24 + i * 2} Q${26 + i * 5},${22 + i * 2} ${32 + i * 4},${24 + i * 2}`}
          fill="none" stroke="#fef3c7" strokeWidth={0.4} opacity={0.5}
        />
      ))}
      {/* Flaky texture dots */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <circle key={`${id}-flake-${i}`} cx={[18, 24, 30, 36, 42, 48, 20, 28, 38, 46][i]} cy={[28, 24, 22, 24, 28, 32, 34, 36, 34, 32][i]} r={0.4} fill="var(--rust-wax)" opacity={0.3} />
      ))}
      {/* Tips of croissant (pointed ends) */}
      <polygon points="12,36 8,34 12,34" fill={`url(#${id}-crust)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      <polygon points="52,36 56,34 52,34" fill={`url(#${id}-crust)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Shadow under croissant */}
      <ellipse cx={32} cy={40} rx={18} ry={3} fill="var(--rust-bark)" opacity={0.1} />
      {/* Coffee cup beside croissant */}
      <g transform="translate(48, 38)">
        <path d="M0,0 L8,0 L7,10 Q7,12 5,12 L3,12 Q1,12 1,10 Z" fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.3} />
        <ellipse cx={4} cy={0} rx={4} ry={1.5} fill="var(--rust-bg-dark)" />
        {/* Handle */}
        <path d="M8,2 Q12,2 12,5 Q12,8 8,8" fill="none" stroke="var(--rust-bark)" strokeWidth={0.8} />
        {/* Steam */}
        {animated && [0, 1].map(i => (
          <path key={`${id}-coffee-steam-${i}`} d={`M${2 + i * 4},-2 q1,-3 0,-5`} fill="none" stroke="var(--theme-anim-particle)" strokeWidth={0.5} opacity={0}>
            <animate attributeName="opacity" values="0;0.4;0" dur={`${3 + i}s`} begin={`${i}s`} repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-4" dur={`${3 + i}s`} begin={`${i}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
      {/* Crumbs on plate */}
      {[0, 1, 2, 3, 4].map(i => (
        <circle key={`${id}-crumb-${i}`} cx={[16, 22, 40, 46, 28][i]} cy={[48, 50, 49, 48, 51][i]} r={[0.6, 0.8, 0.5, 0.7, 0.4][i]} fill="var(--rust-ember)" opacity={0.4} />
      ))}
      {/* Sparkle rays (baked golden glow) */}
      <SparkleRays count={8} cx={32} cy={28} innerR={18} outerR={22} animated={animated} idPrefix={id} color="var(--rust-brass)" />
    </>
  );
}
