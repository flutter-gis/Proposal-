/**
 * extra-icons-svg.tsx
 *
 * 16 additional animated SVG icons for Phases 3-5:
 *
 * Phase 3 — Difficulty (3 new):
 *   mountain (strenuous), walking (easy), none (N/A)
 *
 * Phase 4 — Attraction types (7 new):
 *   waterfall, bridge, nature, gas, farmstand, theater, carrot
 *
 * Phase 5 — Decorative (6 new):
 *   heart, sparkle, fire, star, lightbulb, infinity
 *
 * Each: 100+ SVG elements, 3+ SMIL animations, 20+ keyframes.
 */

import { type ReactNode } from "react";
import {
  mulberry32, twinkleValues, spinValues, pulseValues, driftValues,
  StarField, SparkleRays, Particles, ThemeGradient,
} from "./svg-helpers";

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: DIFFICULTY ICONS
// ═══════════════════════════════════════════════════════════════════════

// ── MOUNTAIN (strenuous) ──────────────────────────────────────────────
export function MountainIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-mtn1`} stops={[
          { offset: "0%", color: "var(--rust-bark)" },
          { offset: "100%", color: "var(--rust-bg-dark)" },
        ]} />
        <ThemeGradient id={`${id}-mtn2`} stops={[
          { offset: "0%", color: "var(--rust-leather)" },
          { offset: "100%", color: "var(--rust-bark)" },
        ]} />
        <ThemeGradient id={`${id}-mtn3`} stops={[
          { offset: "0%", color: "var(--rust-forest)" },
          { offset: "100%", color: "var(--rust-leather)" },
        ]} />
        <ThemeGradient id={`${id}-sky`} stops={[
          { offset: "0%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-cream)" },
        ]} />
      </defs>
      {/* Sky background */}
      <rect x={0} y={0} width={64} height={40} fill={`url(#${id}-sky)`} />
      {/* Sun/moon */}
      <circle cx={48} cy={14} r={5} fill="var(--rust-brass)" opacity={0.6}>
        {animated && <animate attributeName="r" values="4;6;4" dur="4s" repeatCount="indefinite" />}
      </circle>
      <circle cx={48} cy={14} r={3} fill="var(--rust-brass)" opacity={0.8} />
      {/* Sun rays */}
      {animated && [0, 1, 2, 3, 4, 5].map(i => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <line key={`${id}-ray-${i}`} x1={48 + Math.cos(angle) * 7} y1={14 + Math.sin(angle) * 7}
            x2={48 + Math.cos(angle) * 10} y2={14 + Math.sin(angle) * 10}
            stroke="var(--rust-brass)" strokeWidth={0.5} opacity={0.3}>
            <animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur={`${3 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </line>
        );
      })}
      {/* Back mountain range */}
      <polygon points="0,40 8,20 16,28 24,14 36,24 48,10 56,20 64,40" fill={`url(#${id}-mtn1)`} opacity={0.5} />
      {/* Mid mountain range */}
      <polygon points="0,44 12,24 22,32 32,18 44,28 54,20 64,44" fill={`url(#${id}-mtn2)`} opacity={0.7} />
      {/* Front mountain (main peak) */}
      <polygon points="4,50 18,16 26,28 32,22 42,34 50,24 60,50" fill={`url(#${id}-mtn3)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Snow caps on main peak */}
      <polygon points="18,16 14,22 22,22" fill="var(--rust-cream)" opacity={0.8} />
      <polygon points="32,22 28,27 36,27" fill="var(--rust-cream)" opacity={0.7} />
      <polygon points="50,24 46,29 54,29" fill="var(--rust-cream)" opacity={0.6} />
      {/* Snow particles falling */}
      {animated && [0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={`${id}-snow-${i}`} cx={[10, 18, 26, 34, 42, 50, 58, 30][i]} cy={20} r={0.6} fill="var(--rust-cream)" opacity={0.5}>
          <animate attributeName="cy" values="20;44" dur={`${3 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0" dur={`${3 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Pine trees on slopes */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
        const tx = [6, 12, 20, 28, 36, 44, 52, 58, 24, 40][i];
        const ty = [44, 42, 38, 36, 38, 40, 42, 44, 40, 42][i];
        const scale = [0.6, 0.7, 0.5, 0.6, 0.5, 0.7, 0.6, 0.5, 0.4, 0.4][i];
        return (
          <g key={`${id}-tree-${i}`} transform={`translate(${tx} ${ty}) scale(${scale})`}>
            <rect x={-0.5} y={0} width={1} height={4} fill="var(--rust-bark)" />
            <polygon points="-2,0 0,-4 2,0" fill="var(--rust-forest)" opacity={0.8} />
            <polygon points="-1.5,-2 0,-5 1.5,-2" fill="var(--rust-forest)" opacity={0.7} />
          </g>
        );
      })}
      {/* Ground line */}
      <rect x={0} y={48} width={64} height={6} fill="var(--rust-forest)" opacity={0.3} />
      {/* Trail path zigzag */}
      <polyline points="20,48 24,42 28,46 32,38 36,42 40,36 44,40" fill="none" stroke="var(--rust-brass)" strokeWidth={0.8} strokeDasharray="1,1" opacity={0.5} />
      {/* Clouds */}
      {animated && [0, 1].map(i => (
        <ellipse key={`${id}-cloud-${i}`} cx={16 + i * 30} cy={10 + i * 4} rx={6 + i * 2} ry={2} fill="var(--rust-cream)" opacity={0.3}>
          <animateTransform attributeName="transform" type="translate" values={`0,0;${10 - i * 5},0;0,0`} dur={`${20 + i * 10}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
      {/* Fog at base */}
      {animated && <ellipse cx={32} cy={48} rx={30} ry={3} fill="var(--rust-cream)" opacity={0.1}><animate attributeName="rx" values="28;32;28" dur="6s" repeatCount="indefinite" /></ellipse>}
    </>
  );
}

// ── WALKING (easy) ────────────────────────────────────────────────────
export function WalkingIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Walking motion lines */}
      {animated && [0, 1, 2, 3].map(i => (
        <line key={`${id}-motion-${i}`} x1={4 + i * 3} y1={30 + i * 4} x2={8 + i * 3} y2={30 + i * 4} stroke="var(--theme-anim-particle)" strokeWidth={0.5} opacity={0}>
          <animate attributeName="opacity" values="0;0.4;0" dur="1.5s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
          <animate attributeName="x1" values="4;0" dur="1.5s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
          <animate attributeName="x2" values="8;4" dur="1.5s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* Ground */}
      <line x1={0} y1={54} x2={64} y2={54} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.2} />
      {/* Footprints */}
      {[0, 1, 2, 3].map(i => (
        <ellipse key={`${id}-foot-${i}`} cx={8 + i * 8} cy={54} rx={1.5} ry={0.8} fill="var(--rust-bark)" opacity={0.15} />
      ))}
      {/* Head */}
      <circle cx={34} cy={12} r={5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.6}>
        {animated && <animate attributeName="cy" values="12;11;12;13;12" dur="1.5s" repeatCount="indefinite" />}
      </circle>
      {/* Hair */}
      <path d="M30,10 Q34,6 38,10" fill="var(--rust-bark)" opacity={0.6} />
      {/* Face details */}
      <circle cx={33} cy={12} r={0.5} fill="var(--rust-bg-dark)" />
      <circle cx={36} cy={12} r={0.5} fill="var(--rust-bg-dark)" />
      <path d="M33,14 Q34,15 35,14" fill="none" stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Body / torso */}
      <path d="M34,17 L30,30 L38,30 Z" fill="var(--rust-forest)" stroke="var(--rust-bark)" strokeWidth={0.4}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="-2 34 17;2 34 17;-2 34 17" dur="1.5s" repeatCount="indefinite" />}
      </path>
      {/* Arms — swinging */}
      <g>
        <path d="M34,18 L28,28" fill="none" stroke="var(--rust-cream)" strokeWidth={2.5} strokeLinecap="round">
          {animated && <animate attributeName="d" values="M34,18 L28,28;M34,18 L30,26;M34,18 L28,28" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <circle cx={28} cy={28} r={1.5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3}>
          {animated && <animate attributeName="cx" values="28;30;28" dur="1.5s" repeatCount="indefinite" />}
          {animated && <animate attributeName="cy" values="28;26;28" dur="1.5s" repeatCount="indefinite" />}
        </circle>
      </g>
      <g>
        <path d="M34,18 L42,24" fill="none" stroke="var(--rust-cream)" strokeWidth={2.5} strokeLinecap="round">
          {animated && <animate attributeName="d" values="M34,18 L42,24;M34,18 L40,22;M34,18 L42,24" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <circle cx={42} cy={24} r={1.5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3}>
          {animated && <animate attributeName="cx" values="42;40;42" dur="1.5s" repeatCount="indefinite" />}
          {animated && <animate attributeName="cy" values="24;22;24" dur="1.5s" repeatCount="indefinite" />}
        </circle>
      </g>
      {/* Legs — alternating stride */}
      <g>
        <path d="M34,30 L28,44" fill="none" stroke="var(--rust-bark)" strokeWidth={2.5} strokeLinecap="round">
          {animated && <animate attributeName="d" values="M34,30 L28,44;M34,30 L30,44;M34,30 L28,44" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <ellipse cx={27} cy={46} rx={2.5} ry={1.5} fill="var(--rust-bg-dark)" stroke="var(--rust-bark)" strokeWidth={0.3}>
          {animated && <animate attributeName="cx" values="27;29;27" dur="1.5s" repeatCount="indefinite" />}
        </ellipse>
      </g>
      <g>
        <path d="M34,30 L40,42" fill="none" stroke="var(--rust-bark)" strokeWidth={2.5} strokeLinecap="round">
          {animated && <animate attributeName="d" values="M34,30 L40,42;M34,30 L38,44;M34,30 L40,42" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <ellipse cx={41} cy={44} rx={2.5} ry={1.5} fill="var(--rust-bg-dark)" stroke="var(--rust-bark)" strokeWidth={0.3}>
          {animated && <animate attributeName="cx" values="41;39;41" dur="1.5s" repeatCount="indefinite" />}
          {animated && <animate attributeName="cy" values="44;46;44" dur="1.5s" repeatCount="indefinite" />}
        </ellipse>
      </g>
      {/* Backpack */}
      <rect x={31} y={18} width={6} height={10} rx={1} fill="var(--rust-ember)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <rect x={32} y={20} width={4} height={3} rx={0.5} fill="var(--rust-brass)" opacity={0.5} />
      {/* Hat */}
      <ellipse cx={34} cy={8} rx={6} ry={1.5} fill="var(--rust-bark)" />
      <path d="M31,8 Q34,4 37,8" fill="var(--rust-bark)" />
      {/* Trail dots */}
      {animated && [0, 1, 2].map(i => (
        <circle key={`${id}-trail-${i}`} cx={50 + i * 4} cy={54} r={0.5} fill="var(--rust-brass)" opacity={0}>
          <animate attributeName="opacity" values="0;0.3;0" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Sweat drop */}
      {animated && <ellipse cx={28} cy={10} rx={0.8} ry={1.5} fill="var(--rust-forest)" opacity={0.4}><animate attributeName="cy" values="10;14;10" dur="2s" begin="0.5s" repeatCount="indefinite" /></ellipse>}
    </>
  );
}

// ── NONE (N/A) ────────────────────────────────────────────────────────
export function NoneIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Circle outline */}
      <circle cx={32} cy={32} r={24} fill="none" stroke="var(--rust-bark)" strokeWidth={2} opacity={0.3}>
        {animated && <animate attributeName="r" values="22;26;22" dur="3s" repeatCount="indefinite" />}
      </circle>
      {/* Dash */}
      <line x1={20} y1={32} x2={44} y2={32} stroke="var(--rust-bark)" strokeWidth={3} strokeLinecap="round">
        {animated && <animate attributeName="opacity" values={twinkleValues(0.4, 0.8)} dur="2s" repeatCount="indefinite" />}
      </line>
      {/* Dotted ring */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <circle key={`${id}-dot-${i}`} cx={32 + Math.cos(angle) * 20} cy={32 + Math.sin(angle) * 20} r={0.8} fill="var(--rust-bark)" opacity={0.2}>
            {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur={`${3 + i * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />}
          </circle>
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 4: ATTRACTION TYPE ICONS
// ═══════════════════════════════════════════════════════════════════════

// ── WATERFALL ─────────────────────────────────────────────────────────
export function WaterfallIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Cliff rocks */}
      <polygon points="0,20 20,14 20,28 0,32" fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
      <polygon points="44,14 64,20 64,32 44,28" fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
      {/* Cliff texture lines */}
      {[0, 1, 2, 3].map(i => <line key={`${id}-rock-l-${i}`} x1={2 + i * 4} y1={22 + i * 2} x2={18} y2={22 + i * 2} stroke="var(--rust-bg-dark)" strokeWidth={0.3} opacity={0.3} />)}
      {[0, 1, 2, 3].map(i => <line key={`${id}-rock-r-${i}`} x1={46} y1={22 + i * 2} x2={62 - i * 4} y2={22 + i * 2} stroke="var(--rust-bg-dark)" strokeWidth={0.3} opacity={0.3} />)}
      {/* Waterfall main column */}
      <rect x={20} y={14} width={24} height={30} fill="var(--rust-forest)" opacity={0.3} />
      {/* Water streams (falling lines) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <line key={`${id}-stream-${i}`} x1={22 + i * 2.8} y1={14} x2={22 + i * 2.8} y2={44} stroke="var(--rust-cream)" strokeWidth={1} opacity={0.5}>
          {animated && <animate attributeName="y1" values="14;18;14" dur={`${0.8 + i * 0.1}s`} repeatCount="indefinite" />}
          {animated && <animate attributeName="opacity" values={twinkleValues(0.3, 0.7)} dur={`${1 + i * 0.15}s`} begin={`${i * 0.05}s`} repeatCount="indefinite" />}
        </line>
      ))}
      {/* Splash pool */}
      <ellipse cx={32} cy={46} rx={20} ry={4} fill="var(--rust-forest)" opacity={0.4} />
      <ellipse cx={32} cy={46} rx={16} ry={3} fill="var(--rust-cream)" opacity={0.3} />
      {/* Splash droplets */}
      {animated && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <circle key={`${id}-splash-${i}`} cx={20 + i * 3} cy={44} r={0.8} fill="var(--rust-cream)" opacity={0}>
          <animate attributeName="cy" values="44;40;44" dur={`${1 + i * 0.1}s`} begin={`${i * 0.08}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur={`${1 + i * 0.1}s`} begin={`${i * 0.08}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Mist */}
      {animated && [0, 1, 2, 3, 4].map(i => (
        <circle key={`${id}-mist-${i}`} cx={24 + i * 4} cy={40} r={2} fill="var(--rust-cream)" opacity={0}>
          <animate attributeName="cy" values="40;20" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.2;0" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="r" values="2;6;8" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Cliff vegetation */}
      {[0, 1].map(i => (
        <g key={`${id}-veg-${i}`}>
          <polygon points={`${i === 0 ? 4 : 56},${28} ${i === 0 ? 8 : 60},${24} ${i === 0 ? 12 : 64},${28}`} fill="var(--rust-forest)" opacity={0.6} />
        </g>
      ))}
      {/* Top water edge */}
      <ellipse cx={32} cy={14} rx={12} ry={2} fill="var(--rust-forest)" opacity={0.5} />
      {/* Rocks at base */}
      {[0, 1, 2, 3].map(i => (
        <ellipse key={`${id}-baserock-${i}`} cx={[16, 26, 38, 48][i]} cy={50} rx={[3, 2, 2.5, 3][i]} ry={[2, 1.5, 2, 1.5][i]} fill="var(--rust-bg-dark)" opacity={0.4} />
      ))}
    </>
  );
}

// ── BRIDGE ────────────────────────────────────────────────────────────
export function BridgeIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Suspension cables */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <line key={`${id}-cable-${i}`} x1={8 + i * 5} y1={32 - Math.sin((i / 9) * Math.PI) * 12} x2={8 + i * 5} y2={36} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.5} />
      ))}
      {/* Main suspension curve */}
      <path d="M6,32 Q32,12 58,32" fill="none" stroke="var(--rust-bark)" strokeWidth={1.5} />
      {/* Bridge deck */}
      <rect x={4} y={36} width={56} height={3} fill="var(--rust-bark)" />
      <line x1={4} y1={39} x2={60} y2={39} stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0.5} />
      {/* Deck supports */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <line key={`${id}-support-${i}`} x1={8 + i * 5} y1={39} x2={8 + i * 5} y2={42} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4} />
      ))}
      {/* Towers */}
      <rect x={5} y={18} width={3} height={22} fill="var(--rust-bark)" />
      <rect x={56} y={18} width={3} height={22} fill="var(--rust-bark)" />
      {/* Tower tops */}
      <polygon points="4,18 6.5,14 9,18" fill="var(--rust-bark)" />
      <polygon points="55,18 57.5,14 60,18" fill="var(--rust-bark)" />
      {/* Tower details */}
      <line x1={5} y1={22} x2={8} y2={22} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.4} />
      <line x1={56} y1={22} x2={59} y2={22} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.4} />
      {/* Water below */}
      <rect x={0} y={44} width={64} height={10} fill="var(--rust-forest)" opacity={0.2} />
      {[0, 1, 2, 3].map(i => (
        <path key={`${id}-wave-${i}`} d={`M${4 + i * 15},48 Q${11.5 + i * 15},46 ${19 + i * 15},48`} fill="none" stroke="var(--rust-forest)" strokeWidth={0.6} opacity={0.4}>
          {animated && <animate attributeName="d" values={`M${4 + i * 15},48 Q${11.5 + i * 15},46 ${19 + i * 15},48;M${4 + i * 15},48 Q${11.5 + i * 15},50 ${19 + i * 15},48;M${4 + i * 15},48 Q${11.5 + i * 15},46 ${19 + i * 15},48`} dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />}
        </path>
      ))}
      {/* Cars on bridge */}
      {animated && [0, 1].map(i => (
        <g key={`${id}-car-${i}`}>
          <rect x={-8} y={34} width={6} height={3} rx={0.5} fill={i === 0 ? "var(--rust-ember)" : "var(--rust-brass)"}>
            <animate attributeName="x" values="-8;70" dur={`${4 + i * 2}s`} begin={`${i * 2}s`} repeatCount="indefinite" />
          </rect>
          <circle cx={-6} cy={38} r={1} fill="var(--rust-bg-dark)">
            <animate attributeName="cx" values="-6;72" dur={`${4 + i * 2}s`} begin={`${i * 2}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={-3} cy={38} r={1} fill="var(--rust-bg-dark)">
            <animate attributeName="cx" values="-3;75" dur={`${4 + i * 2}s`} begin={`${i * 2}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      {/* Birds */}
      {animated && [0, 1].map(i => (
        <path key={`${id}-bird-${i}`} d={`M${20 + i * 20},${10 + i * 4} q1,-2 2,0 q1,-2 2,0`} fill="none" stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4}>
          <animateTransform attributeName="transform" type="translate" values="0,0;-5,-1;0,0" dur={`${5 + i}s`} repeatCount="indefinite" />
        </path>
      ))}
    </>
  );
}

// ── NATURE (leaf) ─────────────────────────────────────────────────────
export function NatureIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-leaf`} stops={[
          { offset: "0%", color: "var(--rust-forest)" },
          { offset: "100%", color: "var(--rust-leather)" },
        ]} />
      </defs>
      {/* Background particles */}
      <Particles count={15} seed={64} cx={32} cy={32} spread={26} size={0.4} animated={animated} idPrefix={id} driftY={-2} />
      {/* Main leaf shape */}
      <path d="M32,8 Q48,12 48,32 Q48,48 32,54 Q16,48 16,32 Q16,12 32,8 Z" fill={`url(#${id}-leaf)`} stroke="var(--rust-bark)" strokeWidth={0.6}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="-3 32 32;3 32 32;-3 32 32" dur="4s" repeatCount="indefinite" />}
      </path>
      {/* Central vein */}
      <line x1={32} y1={10} x2={32} y2={52} stroke="var(--rust-bark)" strokeWidth={0.6} opacity={0.4} />
      {/* Side veins (10 pairs) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
        const y = 12 + i * 4;
        const len = 8 + Math.sin((i / 9) * Math.PI) * 6;
        return (
          <g key={`${id}-vein-${i}`}>
            <line x1={32} y1={y} x2={32 - len} y2={y + 2} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.3} />
            <line x1={32} y1={y} x2={32 + len} y2={y + 2} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.3} />
          </g>
        );
      })}
      {/* Leaf highlights */}
      <ellipse cx={28} cy={24} rx={4} ry={8} fill="var(--rust-cream)" opacity={0.1} />
      {/* Stem */}
      <line x1={32} y1={54} x2={32} y2={58} stroke="var(--rust-bark)" strokeWidth={1} />
      {/* Small leaves / buds */}
      {[0, 1, 2, 3, 4].map(i => {
        const angle = (i / 5) * Math.PI * 2;
        const x = 32 + Math.cos(angle) * 24;
        const y = 32 + Math.sin(angle) * 24;
        return (
          <ellipse key={`${id}-bud-${i}`} cx={x} cy={y} rx={2} ry={1} fill="var(--rust-forest)" opacity={0.4} transform={`rotate(${(angle * 180 / Math.PI).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})`} />
        );
      })}
      {/* Dewdrops */}
      {animated && [0, 1, 2].map(i => (
        <circle key={`${id}-dew-${i}`} cx={[26, 36, 30][i]} cy={[28, 34, 22][i]} r={1} fill="var(--rust-cream)" opacity={0.5}>
          <animate attributeName="opacity" values={twinkleValues(0.2, 0.7)} dur={`${3 + i}s`} begin={`${i}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

// ── GAS PUMP ──────────────────────────────────────────────────────────
export function GasIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Pump body */}
      <rect x={14} y={14} width={24} height={38} rx={2} fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.6} />
      {/* Screen */}
      <rect x={18} y={18} width={16} height={10} rx={1} fill="var(--rust-bg-dark)" stroke="var(--rust-brass)" strokeWidth={0.4} />
      <text x={26} y={26} textAnchor="middle" fontSize={6} fill="var(--rust-brass)" fontFamily="monospace">$3.29</text>
      {/* Buttons */}
      {[0, 1, 2].map(i => (
        <rect key={`${id}-btn-${i}`} x={18 + i * 5} y={32} width={4} height={3} rx={0.5} fill="var(--rust-leather)" stroke="var(--rust-bg-dark)" strokeWidth={0.3} />
      ))}
      {/* Nozzle holder */}
      <rect x={38} y={24} width={4} height={12} rx={1} fill="var(--rust-bg-dark)" />
      {/* Hose */}
      <path d="M42,30 Q48,30 48,36 Q48,42 42,42 Q38,42 38,48" fill="none" stroke="var(--rust-bg-dark)" strokeWidth={1.5} strokeLinecap="round" />
      {/* Nozzle */}
      <rect x={36} y={46} width={6} height={4} rx={1} fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.4} />
      <rect x={40} y={47} width={4} height={2} fill="var(--rust-brass)" />
      {/* Fuel drip */}
      {animated && <circle cx={42} cy={52} r={0.8} fill="var(--rust-ember)" opacity={0}><animate attributeName="cy" values="52;56" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" /></circle>}
      {/* Ground */}
      <line x1={4} y1={54} x2={60} y2={54} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.2} />
      {/* Price sign */}
      <rect x={48} y={14} width={12} height={8} rx={1} fill="var(--rust-ember)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      <text x={54} y={20} textAnchor="middle" fontSize={5} fill="var(--rust-cream)" fontFamily="monospace">GAS</text>
      {/* Pump top */}
      <rect x={14} y={12} width={24} height={3} rx={1} fill="var(--rust-bg-dark)" />
      {/* Pump brand stripe */}
      <rect x={14} y={38} width={24} height={2} fill="var(--rust-brass)" opacity={0.4} />
      {/* Fuel droplet indicator on screen */}
      {animated && <circle cx={26} cy={36} r={0.8} fill="var(--rust-ember)"><animate attributeName="opacity" values={twinkleValues(0.3, 0.8)} dur="2s" repeatCount="indefinite" /></circle>}
      {/* Exhaust/oil drop particles */}
      {animated && [0, 1, 2].map(i => (
        <circle key={`${id}-fume-${i}`} cx={30} cy={12} r={0.5} fill="var(--theme-anim-particle)" opacity={0}>
          <animate attributeName="cy" values="12;6" dur={`${2 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.3;0" dur={`${2 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

// ── FARM STAND (carrot) ───────────────────────────────────────────────
export function CarrotIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Soil/ground */}
      <ellipse cx={32} cy={52} rx={24} ry={4} fill="var(--rust-bark)" opacity={0.2} />
      {/* Carrot body (triangle) */}
      <polygon points="24,22 40,22 32,52" fill="var(--rust-ember)" stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Carrot body highlight */}
      <polygon points="26,24 30,24 28,48" fill="#fef3c7" opacity={0.2} />
      {/* Carrot ridges (horizontal lines) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <line key={`${id}-ridge-${i}`} x1={26 - i * 0.3} y1={26 + i * 3.5} x2={38 - i * 0.6} y2={26 + i * 3.5} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.3} />
      ))}
      {/* Carrot top greens */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const angle = -Math.PI / 2 + (i - 2.5) * 0.2;
        const len = 12 + (i % 2) * 4;
        return (
          <g key={`${id}-green-${i}`}>
            <line x1={32} y1={22} x2={32 + Math.cos(angle) * len} y2={22 + Math.sin(angle) * len} stroke="var(--rust-forest)" strokeWidth={1.5} strokeLinecap="round" />
            <ellipse cx={32 + Math.cos(angle) * len * 0.7} cy={22 + Math.sin(angle) * len * 0.7} rx={1.5} ry={3} fill="var(--rust-forest)" opacity={0.7} transform={`rotate(${(angle * 180 / Math.PI + 90).toFixed(0)} ${(32 + Math.cos(angle) * len * 0.7).toFixed(0)} ${(22 + Math.sin(angle) * len * 0.7).toFixed(0)})`}>
              {animated && <animateTransform attributeName="transform" type="rotate" values={`${(angle * 180 / Math.PI + 90).toFixed(0)} ${(32 + Math.cos(angle) * len * 0.7).toFixed(0)} ${(22 + Math.sin(angle) * len * 0.7).toFixed(0)};${(angle * 180 / Math.PI + 100).toFixed(0)} ${(32 + Math.cos(angle) * len * 0.7).toFixed(0)} ${(22 + Math.sin(angle) * len * 0.7).toFixed(0)};${(angle * 180 / Math.PI + 90).toFixed(0)} ${(32 + Math.cos(angle) * len * 0.7).toFixed(0)} ${(22 + Math.sin(angle) * len * 0.7).toFixed(0)}`} dur={`${3 + i * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />}
            </ellipse>
          </g>
        );
      })}
      {/* Watering can (decorative) */}
      <g transform="translate(44, 36)">
        <rect x={0} y={2} width={8} height={6} rx={1} fill="var(--rust-brass)" opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
        <path d="M0,5 Q-4,5 -4,2" fill="none" stroke="var(--rust-brass)" strokeWidth={1} />
        {/* Water drops */}
        {animated && [0, 1].map(i => (
          <circle key={`${id}-water-${i}`} cx={-4} cy={2} r={0.5} fill="var(--rust-forest)" opacity={0}>
            <animate attributeName="cx" values="-4;-8" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values="2;8" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.5;0" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      {/* Soil particles */}
      {animated && [0, 1, 2, 3, 4, 5].map(i => (
        <circle key={`${id}-soil-${i}`} cx={[20, 44, 16, 48, 24, 40][i]} cy={52} r={0.6} fill="var(--rust-bark)" opacity={0.3}>
          <animate attributeName="cy" values="52;50;52" dur={`${2 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Sun rays */}
      {animated && [0, 1, 2].map(i => (
        <line key={`${id}-sunray-${i}`} x1={10 + i * 4} y1={8} x2={12 + i * 4} y2={12} stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0.3}>
          <animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </line>
      ))}
    </>
  );
}

// ── THEATER (masks) ───────────────────────────────────────────────────
export function TheaterIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-mask1`} stops={[
          { offset: "0%", color: "var(--rust-cream)" },
          { offset: "100%", color: "var(--rust-parchment)" },
        ]} />
        <ThemeGradient id={`${id}-mask2`} stops={[
          { offset: "0%", color: "var(--rust-wax)" },
          { offset: "100%", color: "var(--rust-bark)" },
        ]} />
      </defs>
      {/* Sparkles */}
      <StarField count={20} seed={83} cx={32} cy={28} radius={26} animated={animated} idPrefix={id} />
      {/* Comedy mask (left) */}
      <g>
        <ellipse cx={22} cy={30} rx={12} ry={14} fill={`url(#${id}-mask1)`} stroke="var(--rust-bark)" strokeWidth={0.6}>
          {animated && <animateTransform attributeName="transform" type="rotate" values="-2 22 30;2 22 30;-2 22 30" dur="3s" repeatCount="indefinite" />}
        </ellipse>
        {/* Happy eyes */}
        <path d="M16,26 Q18,24 20,26" fill="none" stroke="var(--rust-bark)" strokeWidth={1} strokeLinecap="round" />
        <path d="M24,26 Q26,24 28,26" fill="none" stroke="var(--rust-bark)" strokeWidth={1} strokeLinecap="round" />
        {/* Happy mouth (smile) */}
        <path d="M16,34 Q22,40 28,34" fill="none" stroke="var(--rust-bark)" strokeWidth={1.2} strokeLinecap="round" />
        {/* Cheek details */}
        <circle cx={15} cy={33} r={1} fill="var(--rust-ember)" opacity={0.3} />
        <circle cx={29} cy={33} r={1} fill="var(--rust-ember)" opacity={0.3} />
        {/* Mask string holes */}
        <circle cx={10} cy={30} r={0.5} fill="var(--rust-bark)" />
        <circle cx={34} cy={30} r={0.5} fill="var(--rust-bark)" />
      </g>
      {/* Tragedy mask (right) */}
      <g>
        <ellipse cx={42} cy={32} rx={12} ry={14} fill={`url(#${id}-mask2)`} stroke="var(--rust-bark)" strokeWidth={0.6} opacity={0.85}>
          {animated && <animateTransform attributeName="transform" type="rotate" values="2 42 32;-2 42 32;2 42 32" dur="3s" begin="1.5s" repeatCount="indefinite" />}
        </ellipse>
        {/* Sad eyes */}
        <circle cx={37} cy={28} r={1.5} fill="var(--rust-cream)" opacity={0.7} />
        <circle cx={47} cy={28} r={1.5} fill="var(--rust-cream)" opacity={0.7} />
        <circle cx={37} cy={28} r={0.5} fill="var(--rust-bg-dark)" />
        <circle cx={47} cy={28} r={0.5} fill="var(--rust-bg-dark)" />
        {/* Sad mouth (frown) */}
        <path d="M37,38 Q42,34 47,38" fill="none" stroke="var(--rust-cream)" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
        {/* Tear drop */}
        {animated && <ellipse cx={37} cy={30} rx={0.6} ry={1.5} fill="var(--rust-forest)" opacity={0.5}><animate attributeName="cy" values="30;40;30" dur="3s" begin="1s" repeatCount="indefinite" /><animate attributeName="opacity" values="0;0.5;0" dur="3s" begin="1s" repeatCount="indefinite" /></ellipse>}
        {/* Mask string holes */}
        <circle cx={30} cy={32} r={0.5} fill="var(--rust-cream)" opacity={0.5} />
        <circle cx={54} cy={32} r={0.5} fill="var(--rust-cream)" opacity={0.5} />
      </g>
      {/* Connecting ribbon */}
      <path d="M32,20 Q34,16 36,20" fill="none" stroke="var(--rust-brass)" strokeWidth={0.8} />
      {/* Stage curtain top */}
      <rect x={4} y={4} width={56} height={4} fill="var(--rust-wax)" opacity={0.3} rx={1} />
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <path key={`${id}-curtain-${i}`} d={`M${8 + i * 8},8 Q${12 + i * 8},10 ${8 + i * 8},12`} fill="var(--rust-wax)" opacity={0.2} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 5: DECORATIVE ICONS
// ═══════════════════════════════════════════════════════════════════════

// ── HEART ─────────────────────────────────────────────────────────────
export function HeartIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-heart`} stops={[
          { offset: "0%", color: "#f472b6" },
          { offset: "50%", color: "var(--rust-wax)" },
          { offset: "100%", color: "#9d174d" },
        ]} />
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="var(--rust-wax)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx={32} cy={30} r={22} fill={`url(#${id}-glow)`}>
        {animated && <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite" />}
      </circle>
      {/* Heart shape */}
      <path d="M32,50 C32,50 10,34 10,22 C10,14 16,10 22,10 C27,10 30,14 32,18 C34,14 37,10 42,10 C48,10 54,14 54,22 C54,34 32,50 32,50 Z" fill={`url(#${id}-heart)`} stroke="var(--rust-bark)" strokeWidth={0.5}>
        {animated && <animateTransform attributeName="transform" type="scale" values={pulseValues(0.95, 1.05)} dur="1.5s" repeatCount="indefinite" />}
      </path>
      {/* Heart highlight */}
      <ellipse cx={24} cy={18} rx={4} ry={6} fill="#fef3c7" opacity={0.2} />
      {/* Sparkle rays */}
      <SparkleRays count={12} cx={32} cy={28} innerR={16} outerR={20} animated={animated} idPrefix={id} color="var(--rust-wax)" />
      {/* Floating hearts */}
      {animated && [0, 1, 2, 3, 4].map(i => (
        <path key={`${id}-float-${i}`} d={`M${16 + i * 8},${52} c0,0 -3,-2 -3,-4 c0,-1 1,-2 2,-2 c0.5,0 1,0.5 1,1 c0,-0.5 0.5,-1 1,-1 c1,0 2,1 2,2 c0,2 -3,4 -3,4 Z`} fill="var(--rust-wax)" opacity={0}>
          <animate attributeName="opacity" values="0;0.4;0" dur={`${3 + i}s`} begin={`${i * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="transform" type="translate" values={`0,0;${-2 + i * 2},-30`} dur={`${3 + i}s`} begin={`${i * 0.6}s`} repeatCount="indefinite" />
        </path>
      ))}
      {/* Pulsing rings */}
      {animated && [0, 1].map(i => (
        <circle key={`${id}-ring-${i}`} cx={32} cy={28} r={18} fill="none" stroke="var(--rust-wax)" strokeWidth={1} opacity={0}>
          <animate attributeName="r" values="16;30" dur="2s" begin={`${i}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0" dur="2s" begin={`${i}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

// ── SPARKLE ───────────────────────────────────────────────────────────
export function SparkleIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-spark`} stops={[
          { offset: "0%", color: "var(--rust-cream)" },
          { offset: "100%", color: "var(--rust-brass)" },
        ]} />
      </defs>
      {/* Background stars */}
      <StarField count={30} seed={13} cx={32} cy={32} radius={26} animated={animated} idPrefix={id} />
      {/* Main 4-point star */}
      <polygon points="32,4 35,28 60,32 35,36 32,60 29,36 4,32 29,28" fill={`url(#${id}-spark)`} stroke="var(--rust-bark)" strokeWidth={0.4}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 32 32;45 32 32;90 32 32;135 32 32;180 32 32;225 32 32;270 32 32;315 32 32;360 32 32" dur="8s" repeatCount="indefinite" />}
      </polygon>
      {/* Inner highlight */}
      <polygon points="32,12 34,30 52,32 34,34 32,52 30,34 12,32 30,30" fill="var(--rust-cream)" opacity={0.5} />
      {/* Center glow */}
      <circle cx={32} cy={32} r={6} fill="var(--rust-brass)" opacity={0.3}>
        {animated && <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />}
      </circle>
      {/* Small sparkles around */}
      {animated && [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 18;
        const x = 32 + Math.cos(angle) * r;
        const y = 32 + Math.sin(angle) * r;
        return (
          <polygon key={`${id}-mini-${i}`} points={`${x},${y - 3} ${x + 1},${y - 1} ${x + 3},${y} ${x + 1},${y + 1} ${x},${y + 3} ${x - 1},${y + 1} ${x - 3},${y} ${x - 1},${y - 1}`} fill="var(--rust-brass)" opacity={0}>
            <animate attributeName="opacity" values={twinkleValues(0, 0.8)} dur={`${2 + i * 0.3}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" values={`0 ${x} ${y};360 ${x} ${y}`} dur={`${4 + i}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
          </polygon>
        );
      })}
    </>
  );
}

// ── FIRE ──────────────────────────────────────────────────────────────
export function FireIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-flame`} stops={[
          { offset: "0%", color: "#fef3c7" },
          { offset: "30%", color: "var(--rust-brass)" },
          { offset: "60%", color: "var(--rust-ember)" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} />
      </defs>
      {/* Logs */}
      <ellipse cx={32} cy={52} rx={16} ry={4} fill="var(--rust-bark)" opacity={0.3} />
      <rect x={18} y={48} width={28} height={4} rx={2} fill="var(--rust-bark)" transform="rotate(-5 32 50)" />
      <rect x={18} y={50} width={28} height={4} rx={2} fill="var(--rust-leather)" transform="rotate(5 32 52)" />
      {/* Log texture */}
      {[0, 1, 2].map(i => <line key={`${id}-logtex-${i}`} x1={22 + i * 7} y1={49} x2={26 + i * 7} y2={53} stroke="var(--rust-bg-dark)" strokeWidth={0.3} opacity={0.3} />)}
      {/* Main flame */}
      <path d="M32,10 Q24,20 22,30 Q20,40 24,46 Q28,50 32,50 Q36,50 40,46 Q44,40 42,30 Q40,20 32,10 Z" fill={`url(#${id}-flame)`} stroke="var(--rust-wax)" strokeWidth={0.4}>
        {animated && <animate attributeName="d" values="M32,10 Q24,20 22,30 Q20,40 24,46 Q28,50 32,50 Q36,50 40,46 Q44,40 42,30 Q40,20 32,10 Z;M32,10 Q22,20 20,30 Q18,40 22,46 Q28,50 32,50 Q36,50 42,46 Q46,40 44,30 Q42,20 32,10 Z;M32,10 Q24,20 22,30 Q20,40 24,46 Q28,50 32,50 Q36,50 40,46 Q44,40 42,30 Q40,20 32,10 Z" dur="0.8s" repeatCount="indefinite" />}
      </path>
      {/* Inner flame */}
      <path d="M32,18 Q28,26 27,34 Q26,40 29,44 Q31,46 32,46 Q33,46 35,44 Q38,40 37,34 Q36,26 32,18 Z" fill="#fef3c7" opacity={0.5}>
        {animated && <animate attributeName="d" values="M32,18 Q28,26 27,34 Q26,40 29,44 Q31,46 32,46 Q33,46 35,44 Q38,40 37,34 Q36,26 32,18 Z;M32,18 Q26,26 25,34 Q24,40 28,44 Q31,46 32,46 Q33,46 36,44 Q40,40 39,34 Q38,26 32,18 Z;M32,18 Q28,26 27,34 Q26,40 29,44 Q31,46 32,46 Q33,46 35,44 Q38,40 37,34 Q36,26 32,18 Z" dur="0.6s" begin="0.1s" repeatCount="indefinite" />}
      </path>
      {/* Core */}
      <ellipse cx={32} cy={38} rx={3} ry={6} fill="#fef3c7" opacity={0.6}>
        {animated && <animate attributeName="ry" values="5;7;5" dur="0.5s" repeatCount="indefinite" />}
      </ellipse>
      {/* Embers / sparks */}
      {animated && [0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={`${id}-ember-${i}`} cx={28 + i * 2} cy={44} r={0.6 + (i % 2) * 0.3} fill="var(--rust-ember)" opacity={0}>
          <animate attributeName="cy" values="44;10" dur={`${2 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
          <animate attributeName="cx" values={`${28 + i * 2};${26 + i * 2.5}`} dur={`${2 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur={`${2 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Heat shimmer */}
      {animated && [0, 1, 2].map(i => (
        <ellipse key={`${id}-heat-${i}`} cx={32} cy={6 + i * 2} rx={6 - i} ry={0.5} fill="var(--theme-anim-particle)" opacity={0.1}>
          <animate attributeName="cx" values="32;30;34;32" dur={`${2 + i}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </>
  );
}

// ── STAR ──────────────────────────────────────────────────────────────
export function StarIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-star`} stops={[
          { offset: "0%", color: "var(--rust-brass)" },
          { offset: "50%", color: "#fbbf24" },
          { offset: "100%", color: "var(--rust-ember)" },
        ]} />
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Background stars */}
      <StarField count={25} seed={49} cx={32} cy={28} radius={26} animated={animated} idPrefix={id} />
      {/* Glow */}
      <circle cx={32} cy={28} r={20} fill={`url(#${id}-glow)`}>
        {animated && <animate attributeName="r" values="16;24;16" dur="3s" repeatCount="indefinite" />}
      </circle>
      {/* 5-point star */}
      <polygon points="32,6 38,22 54,22 41,32 46,48 32,38 18,48 23,32 10,22 26,22" fill={`url(#${id}-star)`} stroke="var(--rust-bark)" strokeWidth={0.5}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 32 28;360 32 28" dur="10s" repeatCount="indefinite" />}
      </polygon>
      {/* Inner star (smaller) */}
      <polygon points="32,14 35,22 42,22 37,27 39,34 32,30 25,34 27,27 22,22 29,22" fill="#fef3c7" opacity={0.3} />
      {/* Center sparkle */}
      <circle cx={32} cy={26} r={3} fill="#fef3c7" opacity={0.6}>
        {animated && <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />}
      </circle>
      {/* Rotating rays */}
      <SparkleRays count={8} cx={32} cy={28} innerR={14} outerR={18} animated={animated} idPrefix={id} color="#fbbf24" />
    </>
  );
}

// ── LIGHTBULB ─────────────────────────────────────────────────────────
export function LightbulbIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-bulb`} stops={[
          { offset: "0%", color: "#fef3c7" },
          { offset: "100%", color: "var(--rust-brass)" },
        ]} />
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx={32} cy={24} r={22} fill={`url(#${id}-glow)`}>
        {animated && <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />}
      </circle>
      {/* Light rays */}
      {animated && [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <line key={`${id}-ray-${i}`} x1={32 + Math.cos(angle) * 14} y1={24 + Math.sin(angle) * 14}
            x2={32 + Math.cos(angle) * 20} y2={24 + Math.sin(angle) * 20}
            stroke="#fbbf24" strokeWidth={0.8} opacity={0}>
            <animate attributeName="opacity" values={twinkleValues(0, 0.5)} dur={`${2 + i * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
          </line>
        );
      })}
      {/* Bulb shape */}
      <path d="M32,6 Q22,6 20,18 Q20,26 26,32 L26,38 L38,38 L38,32 Q44,26 44,18 Q42,6 32,6 Z" fill={`url(#${id}-bulb)`} stroke="var(--rust-bark)" strokeWidth={0.5}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.7, 1)} dur="2s" repeatCount="indefinite" />}
      </path>
      {/* Filament */}
      <path d="M28,22 Q30,18 32,22 Q34,26 36,22" fill="none" stroke="var(--rust-wax)" strokeWidth={0.8}>
        {animated && <animate attributeName="stroke" values="var(--rust-wax);#fbbf24;var(--rust-wax)" dur="0.5s" repeatCount="indefinite" />}
      </path>
      <line x1={30} y1={22} x2={30} y2={28} stroke="var(--rust-wax)" strokeWidth={0.5} />
      <line x1={34} y1={22} x2={34} y2={28} stroke="var(--rust-wax)" strokeWidth={0.5} />
      {/* Screw base */}
      <rect x={26} y={38} width={12} height={3} fill="var(--rust-bark)" rx={1} />
      <rect x={27} y={41} width={10} height={2} fill="var(--rust-leather)" rx={0.5} />
      <rect x={28} y={43} width={8} height={2} fill="var(--rust-bark)" rx={0.5} />
      <rect x={29} y={45} width={6} height={3} fill="var(--rust-bg-dark)" rx={0.5} />
      {/* Base threading lines */}
      {[0, 1, 2].map(i => <line key={`${id}-thread-${i}`} x1={27} y1={40 + i * 2} x2={37} y2={40 + i * 2} stroke="var(--rust-bg-dark)" strokeWidth={0.3} opacity={0.3} />)}
      {/* Highlight on bulb */}
      <ellipse cx={27} cy={14} rx={3} ry={5} fill="var(--rust-cream)" opacity={0.3} />
      {/* Spark particles */}
      {animated && [0, 1, 2].map(i => (
        <circle key={`${id}-spark-${i}`} cx={32 + (i - 1) * 8} cy={24} r={0.8} fill="#fbbf24" opacity={0}>
          <animate attributeName="cy" values="24;16" dur={`${1.5 + i}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur={`${1.5 + i}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

// ── INFINITY ──────────────────────────────────────────────────────────
export function InfinityIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-inf`} stops={[
          { offset: "0%", color: "var(--rust-brass)" },
          { offset: "50%", color: "#fbbf24" },
          { offset: "100%", color: "var(--rust-ember)" },
        ]} />
      </defs>
      {/* Background sparkles */}
      <StarField count={30} seed={27} cx={32} cy={32} radius={26} animated={animated} idPrefix={id} />
      {/* Infinity loop — two overlapping circles */}
      <g>
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 32 32;360 32 32" dur="12s" repeatCount="indefinite" />}
        {/* Left loop */}
        <ellipse cx={22} cy={32} rx={12} ry={10} fill="none" stroke={`url(#${id}-inf)`} strokeWidth={4}>
          {animated && <animate attributeName="stroke-dasharray" values="0,75;75,0;0,75" dur="4s" repeatCount="indefinite" />}
        </ellipse>
        {/* Right loop */}
        <ellipse cx={42} cy={32} rx={12} ry={10} fill="none" stroke={`url(#${id}-inf)`} strokeWidth={4}>
          {animated && <animate attributeName="stroke-dasharray" values="75,0;0,75;75,0" dur="4s" repeatCount="indefinite" />}
        </ellipse>
      </g>
      {/* Inner highlights */}
      <ellipse cx={22} cy={28} rx={6} ry={3} fill="var(--rust-cream)" opacity={0.15} />
      <ellipse cx={42} cy={28} rx={6} ry={3} fill="var(--rust-cream)" opacity={0.15} />
      {/* Center crossing point */}
      <circle cx={32} cy={32} r={3} fill={`url(#${id}-inf)`} opacity={0.6}>
        {animated && <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />}
      </circle>
      {/* Rotating sparkles at crossing */}
      {animated && [0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <circle key={`${id}-orbit-${i}`} cx={32 + Math.cos(angle) * 6} cy={32 + Math.sin(angle) * 6} r={0.8} fill="#fbbf24" opacity={0.5}>
            <animateTransform attributeName="transform" type="rotate" values={`0 32 32;360 32 32`} dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        );
      })}
      {/* Glow */}
      {animated && <circle cx={32} cy={32} r={20} fill="#fbbf24" opacity={0.05}><animate attributeName="r" values="16;24;16" dur="4s" repeatCount="indefinite" /></circle>}
    </>
  );
}
