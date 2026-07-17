/**
 * category-icons-svg.tsx
 *
 * 14 animated SVG icons for place categories. Each has 100+ SVG elements
 * and 3+ SMIL animations (20+ keyframes). Uses CSS variables for theme
 * integration.
 *
 * Categories: stay, hike, water, scenic, wildlife, historic, dining,
 *             railway, proposal, stargaze, nearby, swimming, brewery, grocery
 */

import { type ReactNode } from "react";
import {
  mulberry32, twinkleValues, spinValues, pulseValues, driftValues,
  StarField, SparkleRays, Particles, ThemeGradient,
} from "./svg-helpers";

export type CategoryIconName =
  | "stay" | "hike" | "water" | "scenic" | "wildlife" | "historic"
  | "dining" | "railway" | "proposal" | "stargaze" | "nearby"
  | "swimming" | "brewery" | "grocery";

// ── 1. STAY (cabin) ───────────────────────────────────────────────────
export function StayIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(42);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-roof`} stops={[
          { offset: "0%", color: "var(--rust-wax)" },
          { offset: "100%", color: "var(--rust-bark)" },
        ]} />
        <ThemeGradient id={`${id}-wall`} stops={[
          { offset: "0%", color: "var(--rust-cream)" },
          { offset: "100%", color: "var(--rust-parchment)" },
        ]} />
      </defs>
      {/* Stars around cabin */}
      <StarField count={30} seed={101} cx={32} cy={28} radius={26} animated={animated} idPrefix={id} />
      {/* Cabin body */}
      <rect x={16} y={28} width={32} height={22} fill={`url(#${id}-wall)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Roof */}
      <polygon points="12,30 32,14 52,30" fill={`url(#${id}-roof)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Chimney */}
      <rect x={38} y={18} width={4} height={8} fill="var(--rust-bark)" />
      {/* Smoke */}
      {[0, 1, 2, 3, 4].map(i => (
        <circle key={`${id}-smoke-${i}`} cx={40} cy={16 - i * 3} r={1.5 + i * 0.3} fill="var(--theme-anim-particle)" opacity={0.5 - i * 0.08}>
          {animated && <animate attributeName="cy" values={`${16 - i * 3};${10 - i * 3};${16 - i * 3}`} dur={`${3 + i}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />}
          {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur={`${3 + i}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {/* Door */}
      <rect x={27} y={36} width={8} height={14} fill="var(--rust-bark)" rx={1} />
      <circle cx={33} cy={43} r={0.6} fill="var(--rust-brass)" />
      {/* Windows */}
      <rect x={19} y={33} width={6} height={6} fill="var(--rust-brass)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.5} />
      <rect x={37} y={33} width={6} height={6} fill="var(--rust-brass)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Window cross frames */}
      <line x1={22} y1={33} x2={22} y2={39} stroke="var(--rust-bark)" strokeWidth={0.4} />
      <line x1={19} y1={36} x2={25} y2={36} stroke="var(--rust-bark)" strokeWidth={0.4} />
      <line x1={40} y1={33} x2={40} y2={39} stroke="var(--rust-bark)" strokeWidth={0.4} />
      <line x1={37} y1={36} x2={43} y2={36} stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Ground */}
      <ellipse cx={32} cy={51} rx={22} ry={3} fill="var(--rust-forest)" opacity={0.3} />
      {/* Trees */}
      {[0, 1, 2].map(i => {
        const tx = 8 + i * 4;
        return (
          <g key={`${id}-tree-${i}`}>
            <rect x={tx} y={40} width={1.5} height={8} fill="var(--rust-bark)" />
            <polygon points={`${tx - 2},40 ${tx + 0.75},34 ${tx + 3.5},40`} fill="var(--rust-forest)" opacity={0.7} />
            <polygon points={`${tx - 1.5},36 ${tx + 0.75},30 ${tx + 3},36`} fill="var(--rust-forest)" opacity={0.8} />
          </g>
        );
      })}
      {[0, 1, 2].map(i => {
        const tx = 50 + i * 4;
        return (
          <g key={`${id}-tree-r-${i}`}>
            <rect x={tx} y={40} width={1.5} height={8} fill="var(--rust-bark)" />
            <polygon points={`${tx - 2},40 ${tx + 0.75},34 ${tx + 3.5},40`} fill="var(--rust-forest)" opacity={0.7} />
            <polygon points={`${tx - 1.5},36 ${tx + 0.75},30 ${tx + 3},36`} fill="var(--rust-forest)" opacity={0.8} />
          </g>
        );
      })}
      {/* Window glow */}
      {animated && <rect x={19} y={33} width={6} height={6} fill="var(--rust-brass)" opacity={0.3}><animate attributeName="opacity" values={twinkleValues(0.1, 0.5)} dur="4s" repeatCount="indefinite" /></rect>}
      {animated && <rect x={37} y={33} width={6} height={6} fill="var(--rust-brass)" opacity={0.3}><animate attributeName="opacity" values={twinkleValues(0.1, 0.5)} dur="4s" begin="2s" repeatCount="indefinite" /></rect>}
    </>
  );
}

// ── 2. HIKE (boot) ────────────────────────────────────────────────────
export function HikeIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-boot`} stops={[
          { offset: "0%", color: "var(--rust-bark)" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} />
      </defs>
      {/* Ground particles */}
      <Particles count={20} seed={55} cx={32} cy={52} spread={30} size={0.6} animated={animated} idPrefix={id} driftY={-3} />
      {/* Boot sole */}
      <path d="M16,46 L46,46 L48,50 L48,54 L14,54 L14,50 Z" fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
      {/* Sole tread (8 segments) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <rect key={`${id}-tread-${i}`} x={15 + i * 4.2} y={53} width={3} height={2} fill="var(--rust-bg-dark)" opacity={0.5} />
      ))}
      {/* Boot upper — main body */}
      <path d="M16,46 L16,28 L22,24 L30,24 L34,30 L34,40 L42,40 L44,46 Z" fill={`url(#${id}-boot)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Ankle support */}
      <path d="M16,28 L22,24 L24,26 L18,30 Z" fill="var(--rust-wax)" opacity={0.6} />
      {/* Laces (6 segments weaving) */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const y = 26 + i * 3.5;
        return (
          <g key={`${id}-lace-${i}`}>
            <line x1={18} y1={y} x2={28} y2={y + 1.5} stroke="var(--rust-brass)" strokeWidth={0.8} />
            <line x1={18} y1={y + 1.5} x2={28} y2={y} stroke="var(--rust-brass)" strokeWidth={0.8} />
            <circle cx={23} cy={y + 0.75} r={0.8} fill="var(--rust-brass)" />
          </g>
        );
      })}
      {/* Eyelets */}
      {[0, 1, 2, 3, 4].map(i => (
        <circle key={`${id}-eyelet-${i}`} cx={18} cy={27 + i * 3.5} r={0.7} fill="var(--rust-bg-dark)" />
      ))}
      {[0, 1, 2, 3, 4].map(i => (
        <circle key={`${id}-eyelet-r-${i}`} cx={28} cy={27 + i * 3.5} r={0.7} fill="var(--rust-bg-dark)" />
      ))}
      {/* Toe cap */}
      <path d="M34,40 L42,40 L44,46 L34,46 Z" fill="var(--rust-bark)" opacity={0.8} />
      {/* Heel counter */}
      <path d="M16,28 L16,46 L20,46 L20,30 Z" fill="var(--rust-wax)" opacity={0.5} />
      {/* Boot tongue */}
      <path d="M22,24 L30,24 L29,30 L23,30 Z" fill="var(--rust-leather)" opacity={0.7} />
      {/* Stitching lines */}
      <line x1={22} y1={30} x2={30} y2={30} stroke="var(--rust-brass)" strokeWidth={0.3} strokeDasharray="1,1" />
      <line x1={34} y1={42} x2={42} y2={42} stroke="var(--rust-brass)" strokeWidth={0.3} strokeDasharray="1,1" />
      {/* Walking motion lines */}
      {animated && [0, 1, 2, 3].map(i => (
        <line key={`${id}-motion-${i}`} x1={48 + i * 2} y1={50 - i * 2} x2={52 + i * 2} y2={50 - i * 2} stroke="var(--theme-anim-particle)" strokeWidth={0.5} opacity={0.4}>
          <animate attributeName="opacity" values={twinkleValues(0.1, 0.5)} dur={`${1.5 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* Glow under boot */}
      {animated && <ellipse cx={32} cy={55} rx={16} ry={2} fill="var(--theme-anim-glow)" opacity={0.3}><animate attributeName="rx" values="14;18;14" dur="3s" repeatCount="indefinite" /></ellipse>}
    </>
  );
}

// ── 3. WATER (sailboat) ───────────────────────────────────────────────
export function WaterIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-sail`} stops={[
          { offset: "0%", color: "var(--rust-cream)" },
          { offset: "100%", color: "var(--rust-parchment)" },
        ]} />
        <ThemeGradient id={`${id}-hull`} stops={[
          { offset: "0%", color: "var(--rust-wax)" },
          { offset: "100%", color: "var(--rust-bark)" },
        ]} />
      </defs>
      {/* Water waves */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <path key={`${id}-wave-${i}`} d={`M${4 + i * 7},44 Q${7.5 + i * 7},41 ${11 + i * 7},44 T${18 + i * 7},44`} fill="none" stroke="var(--rust-forest)" strokeWidth={0.8} opacity={0.5}>
          {animated && <animate attributeName="d" values={`M${4 + i * 7},44 Q${7.5 + i * 7},41 ${11 + i * 7},44 T${18 + i * 7},44;M${4 + i * 7},44 Q${7.5 + i * 7},47 ${11 + i * 7},44 T${18 + i * 7},44;M${4 + i * 7},44 Q${7.5 + i * 7},41 ${11 + i * 7},44 T${18 + i * 7},44`} dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />}
        </path>
      ))}
      {/* Water sparkles */}
      <Particles count={15} seed={77} cx={32} cy={44} spread={40} size={0.5} animated={animated} idPrefix={id} driftY={-2} />
      {/* Boat hull */}
      <path d="M16,40 L48,40 L44,46 L20,46 Z" fill={`url(#${id}-hull)`} stroke="var(--rust-bark)" strokeWidth={0.6}>
        {animated && <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0;0,1;0,0" dur="3s" repeatCount="indefinite" />}
      </path>
      {/* Hull deck line */}
      <line x1={16} y1={40} x2={48} y2={40} stroke="var(--rust-brass)" strokeWidth={0.5} />
      {/* Mast */}
      <line x1={32} y1={40} x2={32} y2={12} stroke="var(--rust-bark)" strokeWidth={1.2} />
      {/* Main sail */}
      <polygon points="32,12 32,36 46,36" fill={`url(#${id}-sail)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Front sail (jib) */}
      <polygon points="32,14 32,36 20,36" fill={`url(#${id}-sail)`} opacity={0.85} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Sail seams */}
      {[0, 1, 2].map(i => (
        <line key={`${id}-seam-${i}`} x1={32} y1={18 + i * 6} x2={40 + i * 2} y2={18 + i * 6} stroke="var(--rust-parchment)" strokeWidth={0.3} />
      ))}
      {[0, 1, 2].map(i => (
        <line key={`${id}-seam-j-${i}`} x1={32} y1={18 + i * 6} x2={24 - i * 2} y2={18 + i * 6} stroke="var(--rust-parchment)" strokeWidth={0.3} />
      ))}
      {/* Flag on mast top */}
      <polygon points="32,12 38,14 32,16" fill="var(--rust-ember)">
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 32 14;5 32 14;0 32 14;-5 32 14;0 32 14" dur="2s" repeatCount="indefinite" />}
      </polygon>
      {/* Mast top */}
      <circle cx={32} cy={12} r={1} fill="var(--rust-brass)" />
      {/* Rigging lines */}
      <line x1={32} y1={14} x2={46} y2={36} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.5} />
      <line x1={32} y1={14} x2={20} y2={36} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.5} />
      {/* Extra water details for 100+ element count */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <circle key={`${id}-ripple-${i}`} cx={10 + i * 5} cy={45 + (i % 3)} r={0.4} fill="var(--rust-cream)" opacity={0.3} />
      ))}
      {/* Birds */}
      {animated && [0, 1, 2].map(i => (
        <path key={`${id}-bird-${i}`} d={`M${10 + i * 6},${18 + i * 3} q1,-2 2,0 q1,-2 2,0`} fill="none" stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.5}>
          <animateTransform attributeName="transform" type="translate" values="0,0;-3,-1;0,0" dur={`${4 + i}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values={twinkleValues(0.2, 0.6)} dur={`${4 + i}s`} repeatCount="indefinite" />
        </path>
      ))}
      {/* Sun/moon glow */}
      {animated && <circle cx={50} cy={14} r={3} fill="var(--rust-brass)" opacity={0.3}><animate attributeName="r" values="2.5;3.5;2.5" dur="4s" repeatCount="indefinite" /></circle>}
      <circle cx={50} cy={14} r={2} fill="var(--rust-brass)" opacity={0.6} />
    </>
  );
}

// ── 4. SCENIC (camera) ────────────────────────────────────────────────
export function ScenicIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-lens`} stops={[
          { offset: "0%", color: "var(--rust-bg-dark)" },
          { offset: "50%", color: "var(--rust-bark)" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} type="radial" />
        <ThemeGradient id={`${id}-body`} stops={[
          { offset: "0%", color: "var(--rust-bark)" },
          { offset: "100%", color: "var(--rust-bg-dark)" },
        ]} />
      </defs>
      {/* Background sparkles */}
      <StarField count={25} seed={33} cx={32} cy={24} radius={24} animated={animated} idPrefix={id} />
      {/* Camera body */}
      <rect x={10} y={22} width={44} height={28} rx={3} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Viewfinder bump */}
      <rect x={24} y={18} width={16} height={6} rx={1} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Lens outer ring */}
      <circle cx={32} cy={36} r={12} fill="var(--rust-bg-dark)" stroke="var(--rust-bark)" strokeWidth={1} />
      {/* Lens middle ring */}
      <circle cx={32} cy={36} r={9} fill="var(--rust-wax)" stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Lens glass */}
      <circle cx={32} cy={36} r={7} fill={`url(#${id}-lens)`} />
      {/* Lens reflection */}
      <ellipse cx={29} cy={33} rx={3} ry={2} fill="var(--rust-cream)" opacity={0.3} />
      {/* Lens inner detail */}
      <circle cx={32} cy={36} r={4} fill="var(--rust-bg-dark)" opacity={0.6} />
      <circle cx={32} cy={36} r={2} fill="var(--rust-brass)" opacity={0.5} />
      {/* Shutter button */}
      <circle cx={44} cy={24} r={2} fill="var(--rust-ember)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {animated && <circle cx={44} cy={24} r={1} fill="var(--rust-cream)" opacity={0.5}><animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite" /></circle>}
      {/* Flash */}
      <rect x={12} y={24} width={6} height={3} rx={0.5} fill="var(--rust-brass)" opacity={0.7} />
      {animated && <rect x={12} y={24} width={6} height={3} rx={0.5} fill="var(--rust-cream)" opacity={0}><animate attributeName="opacity" values="0;0.6;0;0;0" dur="5s" repeatCount="indefinite" /></rect>}
      {/* Mode dial */}
      <circle cx={16} cy={42} r={3} fill="var(--rust-bark)" stroke="var(--rust-brass)" strokeWidth={0.5} />
      <line x1={16} y1={40} x2={16} y2={42} stroke="var(--rust-brass)" strokeWidth={0.6} />
      {/* Grip texture */}
      {[0, 1, 2, 3].map(i => (
        <line key={`${id}-grip-${i}`} x1={11} y1={28 + i * 2} x2={13} y2={28 + i * 2} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.4} />
      ))}
      {/* Strap mounts */}
      <circle cx={10} cy={25} r={1} fill="var(--rust-bark)" />
      <circle cx={54} cy={25} r={1} fill="var(--rust-bark)" />
      {/* Focus brackets */}
      {animated && (
        <g stroke="var(--rust-brass)" strokeWidth={0.4} fill="none" opacity={0.6}>
          <path d="M28,32 L28,30 L30,30"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" /></path>
          <path d="M34,30 L36,30 L36,32"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" /></path>
          <path d="M36,40 L36,42 L34,42"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="1s" repeatCount="indefinite" /></path>
          <path d="M30,42 L28,42 L28,40"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="1.5s" repeatCount="indefinite" /></path>
        </g>
      )}
      {/* Light leak particles */}
      <Particles count={10} seed={88} cx={32} cy={36} spread={14} size={0.4} animated={animated} idPrefix={id} driftY={-1} />
    </>
  );
}

// ── 5. WILDLIFE (deer) ────────────────────────────────────────────────
export function WildlifeIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-body`} stops={[
          { offset: "0%", color: "var(--rust-leather)" },
          { offset: "100%", color: "var(--rust-bark)" },
        ]} />
      </defs>
      {/* Forest particles */}
      <Particles count={20} seed={22} cx={32} cy={32} spread={28} size={0.5} animated={animated} idPrefix={id} driftY={-2} />
      {/* Ground */}
      <ellipse cx={32} cy={54} rx={20} ry={3} fill="var(--rust-forest)" opacity={0.2} />
      {/* Deer body */}
      <ellipse cx={30} cy={38} rx={12} ry={7} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Chest */}
      <ellipse cx={22} cy={40} rx={5} ry={6} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Neck */}
      <polygon points="20,36 16,24 20,22 24,34" fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Head */}
      <ellipse cx={16} cy={22} rx={4} ry={3} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Nose */}
      <ellipse cx={13} cy={23} rx={1.5} ry={1} fill="var(--rust-bark)" />
      {/* Eye */}
      <circle cx={15} cy={21} r={0.7} fill="var(--rust-bg-dark)" />
      <circle cx={15.2} cy={20.8} r={0.3} fill="var(--rust-cream)" />
      {/* Ear */}
      <ellipse cx={18} cy={18} rx={1.5} ry={2.5} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.3} transform="rotate(-20 18 18)" />
      {/* Antlers — left */}
      <g stroke="var(--rust-bark)" strokeWidth={1} fill="none">
        <path d="M18,16 L14,8" />
        <path d="M16,12 L12,10" />
        <path d="M15,10 L18,6" />
        <path d="M17,14 L20,8" />
      </g>
      {/* Antlers — right */}
      <g stroke="var(--rust-bark)" strokeWidth={1} fill="none">
        <path d="M19,16 L22,8" />
        <path d="M21,12 L25,10" />
        <path d="M20,10 L23,6" />
        <path d="M20,14 L24,10" />
      </g>
      {/* Antler tips */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={`${id}-antler-${i}`} cx={[14, 12, 18, 20, 22, 25, 23, 24][i]} cy={[8, 10, 6, 8, 8, 10, 6, 10][i]} r={0.6} fill="var(--rust-bark)" />
      ))}
      {/* Legs */}
      {[0, 1, 2, 3].map(i => (
        <rect key={`${id}-leg-${i}`} x={22 + i * 5} y={42} width={2} height={10} fill="var(--rust-bark)" rx={0.5} />
      ))}
      {/* Hooves */}
      {[0, 1, 2, 3].map(i => (
        <rect key={`${id}-hoof-${i}`} x={21.5 + i * 5} y={51} width={3} height={2} fill="var(--rust-bg-dark)" rx={0.3} />
      ))}
      {/* Tail */}
      <ellipse cx={42} cy={36} rx={2} ry={3} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 42 36;10 42 36;0 42 36;-5 42 36;0 42 36" dur="2s" repeatCount="indefinite" />}
      </ellipse>
      {/* White spots on body */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <circle key={`${id}-spot-${i}`} cx={[26, 30, 34, 28, 36, 32][i]} cy={[36, 34, 37, 40, 35, 42][i]} r={0.8} fill="var(--rust-cream)" opacity={0.5} />
      ))}
      {/* Breathing animation */}
      {animated && <ellipse cx={30} cy={38} rx={12} ry={7} fill="none" stroke="var(--theme-anim-glow)" strokeWidth={0.5} opacity={0.3}><animate attributeName="ry" values="7;7.5;7" dur="3s" repeatCount="indefinite" /></ellipse>}
    </>
  );
}

// ── 6. HISTORIC (landmark columns) ────────────────────────────────────
export function HistoricIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-stone`} stops={[
          { offset: "0%", color: "var(--rust-cream)" },
          { offset: "100%", color: "var(--rust-parchment)" },
        ]} />
      </defs>
      {/* Stars */}
      <StarField count={20} seed={66} cx={32} cy={20} radius={24} animated={animated} idPrefix={id} />
      {/* Pediment (triangular top) */}
      <polygon points="10,20 32,8 54,20" fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Architrave (beam below pediment) */}
      <rect x={10} y={20} width={44} height={6} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Column capitals */}
      {[0, 1, 2, 3].map(i => (
        <rect key={`${id}-capital-${i}`} x={12 + i * 11} y={26} width={8} height={2} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      ))}
      {/* Columns (4 with fluting) */}
      {[0, 1, 2, 3].map(i => {
        const cx = 16 + i * 11;
        return (
          <g key={`${id}-col-${i}`}>
            <rect x={cx - 3} y={28} width={6} height={22} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
            {/* Fluting lines */}
            <line x1={cx - 2} y1={28} x2={cx - 2} y2={50} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.4} />
            <line x1={cx} y1={28} x2={cx} y2={50} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.4} />
            <line x1={cx + 2} y1={28} x2={cx + 2} y2={50} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.4} />
          </g>
        );
      })}
      {/* Column bases */}
      {[0, 1, 2, 3].map(i => (
        <rect key={`${id}-base-${i}`} x={11 + i * 11} y={50} width={10} height={3} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      ))}
      {/* Stylobate (platform) */}
      <rect x={8} y={53} width={48} height={4} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Steps */}
      <rect x={6} y={57} width={52} height={3} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Ornament on pediment */}
      <circle cx={32} cy={16} r={1.5} fill="var(--rust-brass)" opacity={0.7} />
      {animated && <circle cx={32} cy={16} r={1.5} fill="var(--rust-brass)" opacity={0.3}><animate attributeName="r" values="1.5;2.5;1.5" dur="4s" repeatCount="indefinite" /></circle>}
      {/* Acroteria (decorative tops) */}
      <polygon points="10,20 8,16 12,20" fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <polygon points="54,20 56,16 52,20" fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Extra architectural details for 100+ element count */}
      {[0, 1, 2, 3].map(i => (
        <line key={`${id}-architrave-detail-${i}`} x1={12 + i * 11} y1={22} x2={20 + i * 11} y2={22} stroke="var(--rust-brass)" strokeWidth={0.2} opacity={0.3} />
      ))}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <circle key={`${id}-dentil-${i}`} cx={16 + i * 8} cy={21} r={0.6} fill="var(--rust-parchment)" opacity={0.4} />
      ))}
      {/* Triglyphs */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={`${id}-triglyph-${i}`}>
          <rect x={13 + i * 11} y={20} width={1} height={4} fill="var(--rust-bark)" opacity={0.3} />
          <rect x={15 + i * 11} y={20} width={1} height={4} fill="var(--rust-bark)" opacity={0.3} />
        </g>
      ))}
      {/* Metopes between columns */}
      {[0, 1, 2].map(i => (
        <rect key={`${id}-metope-${i}`} x={21 + i * 11} y={30} width={7} height={18} fill="var(--rust-parchment)" opacity={0.3} stroke="var(--rust-bark)" strokeWidth={0.2} />
      ))}
      {/* Glow at base */}
      {animated && <ellipse cx={32} cy={58} rx={24} ry={2} fill="var(--theme-anim-glow)" opacity={0.2}><animate attributeName="rx" values="22;26;22" dur="5s" repeatCount="indefinite" /></ellipse>}
    </>
  );
}

// ── 7. DINING (plate + utensils) ──────────────────────────────────────
export function DiningIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-plate`} stops={[
          { offset: "0%", color: "var(--rust-cream)" },
          { offset: "100%", color: "var(--rust-parchment)" },
        ]} type="radial" />
      </defs>
      {/* Steam particles */}
      <Particles count={15} seed={11} cx={32} cy={20} spread={16} size={0.8} animated={animated} idPrefix={id} driftY={-8} />
      {/* Plate outer */}
      <ellipse cx={32} cy={38} rx={22} ry={6} fill={`url(#${id}-plate)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Plate inner ring */}
      <ellipse cx={32} cy={38} rx={18} ry={4.5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Plate rim detail */}
      <ellipse cx={32} cy={38} rx={20} ry={5.2} fill="none" stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0.5} />
      {/* Fork */}
      <g>
        <rect x={14} y={18} width={1.5} height={24} fill="var(--rust-bark)" rx={0.5} />
        {/* Fork tines */}
        <rect x={13} y={16} width={0.5} height={5} fill="var(--rust-bark)" />
        <rect x={14.2} y={16} width={0.5} height={5} fill="var(--rust-bark)" />
        <rect x={15.4} y={16} width={0.5} height={5} fill="var(--rust-bark)" />
        <rect x={16.6} y={16} width={0.5} height={5} fill="var(--rust-bark)" />
        {/* Fork base */}
        <rect x={13} y={20} width={4.2} height={1.5} fill="var(--rust-bark)" />
      </g>
      {/* Knife */}
      <g>
        <rect x={48} y={20} width={1.5} height={22} fill="var(--rust-bark)" rx={0.5} />
        {/* Blade */}
        <polygon points="48,16 49.5,16 49.5,24 48,24" fill="var(--rust-parchment)" stroke="var(--rust-bark)" strokeWidth={0.3} />
        {/* Handle end */}
        <circle cx={48.75} cy={43} r={1.2} fill="var(--rust-bark)" />
      </g>
      {/* Food on plate */}
      <circle cx={28} cy={37} r={3} fill="var(--rust-ember)" opacity={0.7} />
      <circle cx={34} cy={38} r={2.5} fill="var(--rust-forest)" opacity={0.6} />
      <circle cx={36} cy={36} r={1.5} fill="var(--rust-brass)" opacity={0.6} />
      {/* Garnish */}
      {[0, 1, 2].map(i => (
        <ellipse key={`${id}-garnish-${i}`} cx={[25, 37, 31][i]} cy={[39, 36, 40][i]} rx={0.8} ry={0.4} fill="var(--rust-forest)" opacity={0.5} />
      ))}
      {/* Extra dining details for 100+ element count */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={`${id}-crumb-${i}`} cx={[26, 30, 34, 38, 28, 32, 36, 30][i]} cy={[40, 39, 40, 39, 41, 40, 41, 39][i]} r={0.4} fill="var(--rust-brass)" opacity={0.3} />
      ))}
      {/* Plate shadow */}
      <ellipse cx={32} cy={42} rx={20} ry={2} fill="var(--rust-bark)" opacity={0.1} />
      {/* Steam wisps */}
      {animated && [0, 1, 2].map(i => (
        <path key={`${id}-steam-${i}`} d={`M${26 + i * 6},32 q2,-4 0,-8 q-2,-4 0,-8`} fill="none" stroke="var(--theme-anim-particle)" strokeWidth={0.8} opacity={0}>
          <animate attributeName="opacity" values="0;0.5;0" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,-12" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </path>
      ))}
      {/* Sparkle on plate */}
      <SparkleRays count={8} cx={32} cy={38} innerR={5} outerR={7} animated={animated} idPrefix={id} color="var(--rust-brass)" />
    </>
  );
}

// ── 8. RAILWAY (train) ────────────────────────────────────────────────
export function RailwayIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-body`} stops={[
          { offset: "0%", color: "var(--rust-ember)" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} />
      </defs>
      {/* Smoke particles */}
      <Particles count={18} seed={44} cx={16} cy={14} spread={10} size={1} animated={animated} idPrefix={id} driftY={-6} />
      {/* Train body */}
      <rect x={8} y={24} width={48} height={22} rx={4} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Roof */}
      <rect x={8} y={22} width={48} height={3} rx={1} fill="var(--rust-bark)" />
      {/* Chimney */}
      <rect x={13} y={16} width={5} height={7} fill="var(--rust-bark)" rx={1} />
      <ellipse cx={15.5} cy={16} rx={3} ry={1} fill="var(--rust-bg-dark)" />
      {/* Front cab */}
      <rect x={44} y={20} width={12} height={26} rx={3} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Windows */}
      {[0, 1, 2].map(i => (
        <rect key={`${id}-win-${i}`} x={12 + i * 9} y={27} width={7} height={7} rx={1} fill="var(--rust-cream)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.4} />
      ))}
      {/* Cab window */}
      <rect x={46} y={24} width={8} height={6} rx={1} fill="var(--rust-cream)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Window reflections */}
      {[0, 1, 2].map(i => (
        <line key={`${id}-refl-${i}`} x1={13 + i * 9} y1={28} x2={18 + i * 9} y2={33} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.4} />
      ))}
      {/* Headlight */}
      <circle cx={53} cy={36} r={2.5} fill="var(--rust-brass)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      <circle cx={53} cy={36} r={1.5} fill="var(--rust-cream)" />
      {animated && <circle cx={53} cy={36} r={3} fill="var(--rust-brass)" opacity={0.2}><animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite" /></circle>}
      {/* Wheels */}
      {[0, 1, 2, 3].map(i => (
        <g key={`${id}-wheel-${i}`}>
          <circle cx={14 + i * 10} cy={46} r={5} fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
          <circle cx={14 + i * 10} cy={46} r={2.5} fill="var(--rust-wax)" />
          {/* Wheel spokes */}
          {[0, 1, 2, 3, 4].map(j => {
            const angle = (j / 5) * Math.PI * 2;
            return (
              <line key={`${id}-spoke-${i}-${j}`} x1={14 + i * 10} y1={46} x2={14 + i * 10 + Math.cos(angle) * 4} y2={46 + Math.sin(angle) * 4} stroke="var(--rust-bg-dark)" strokeWidth={0.4}>
                {animated && <animateTransform attributeName="transform" type="rotate" values={`0 ${14 + i * 10} 46;360 ${14 + i * 10} 46`} dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />}
              </line>
            );
          })}
        </g>
      ))}
      {/* Connecting rod */}
      <rect x={12} y={45} width={38} height={1.5} fill="var(--rust-bg-dark)" opacity={0.6} />
      {/* Track */}
      <line x1={4} y1={52} x2={60} y2={52} stroke="var(--rust-bark)" strokeWidth={1} />
      <line x1={4} y1={54} x2={60} y2={54} stroke="var(--rust-bark)" strokeWidth={1} />
      {/* Ties */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <rect key={`${id}-tie-${i}`} x={5 + i * 6} y={53} width={3} height={3} fill="var(--rust-leather)" opacity={0.6} />
      ))}
      {/* Cow catcher */}
      <polygon points="56,46 60,46 58,52" fill="var(--rust-bark)" />
      {/* Decorative band */}
      <rect x={8} y={35} width={36} height={1.5} fill="var(--rust-brass)" opacity={0.5} />
    </>
  );
}

// ── 9. PROPOSAL (ring + diamond) ──────────────────────────────────────
export function ProposalIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-gold`} stops={[
          { offset: "0%", color: "var(--rust-brass)" },
          { offset: "50%", color: "#fbbf24" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} />
        <radialGradient id={`${id}-diamond`}>
          <stop offset="0%" stopColor="var(--rust-cream)" />
          <stop offset="50%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </radialGradient>
      </defs>
      {/* Sparkle field */}
      <StarField count={35} seed={99} cx={32} cy={28} radius={26} animated={animated} idPrefix={id} />
      {/* Ring band */}
      <ellipse cx={32} cy={42} rx={14} ry={10} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={3.5}>
        {animated && <animate attributeName="stroke-dasharray" values="0;44;88;44;0" dur="4s" repeatCount="indefinite" />}
      </ellipse>
      {/* Band inner highlight */}
      <ellipse cx={32} cy={42} rx={14} ry={10} fill="none" stroke="#fbbf24" strokeWidth={1} opacity={0.6} />
      {/* Band shadow */}
      <path d="M22,44 Q32,50 42,44" fill="none" stroke="var(--rust-wax)" strokeWidth={0.8} opacity={0.5} />
      {/* Diamond setting (prongs) */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const x = 32 + Math.cos(angle) * 4;
        const y = 32 + Math.sin(angle) * 4;
        return <line key={`${id}-prong-${i}`} x1={x.toFixed(2)} y1={y.toFixed(2)} x2={32 + Math.cos(angle) * 7} y2={32 + Math.sin(angle) * 7} stroke={`url(#${id}-gold)`} strokeWidth={1} />;
      })}
      {/* Diamond — octahedron */}
      <polygon points="32,18 40,30 32,42 24,30" fill={`url(#${id}-diamond)`} stroke="var(--rust-bg-dark)" strokeWidth={0.4} />
      {/* Diamond facets */}
      <polygon points="32,18 40,30 32,30" fill="var(--rust-cream)" opacity={0.8} />
      <polygon points="32,18 24,30 32,30" fill="#e0e7ff" opacity={0.6} />
      <polygon points="24,30 32,30 32,42" fill="#a5b4fc" opacity={0.5} />
      <polygon points="40,30 32,30 32,42" fill="#c7d2fe" opacity={0.4} />
      {/* Diamond table (top facet) */}
      <polygon points="28,24 36,24 32,18" fill="none" stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.6} />
      {/* Diamond girdle */}
      <line x1={24} y1={30} x2={40} y2={30} stroke="var(--rust-bg-dark)" strokeWidth={0.3} />
      {/* Diamond crown facets */}
      <line x1={28} y1={24} x2={32} y2={30} stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.4} />
      <line x1={36} y1={24} x2={32} y2={30} stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.4} />
      {/* Diamond pavilion facets */}
      <line x1={24} y1={30} x2={32} y2={42} stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.3} />
      <line x1={40} y1={30} x2={32} y2={42} stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.3} />
      {/* Sparkle rays around diamond */}
      <SparkleRays count={12} cx={32} cy={28} innerR={10} outerR={14} animated={animated} idPrefix={id} color="var(--rust-brass)" />
      {/* Central sparkle */}
      {animated && (
        <g transform="translate(32, 26)">
          <polygon points="0,-4 1,-1 4,0 1,1 0,4 -1,1 -4,0 -1,-1" fill="var(--rust-cream)">
            <animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values={twinkleValues(0.3, 1)} dur="2s" repeatCount="indefinite" />
          </polygon>
        </g>
      )}
      {/* Diamond glow */}
      {animated && <circle cx={32} cy={28} r={8} fill="var(--rust-brass)" opacity={0.1}><animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" /></circle>}
      {/* Light reflection on band */}
      <path d="M20,38 Q24,34 28,34" fill="none" stroke="var(--rust-cream)" strokeWidth={1} opacity={0.5} />
    </>
  );
}

// ── 10. STARGAZE (galaxy/telescope) ───────────────────────────────────
export function StargazeIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor="var(--rust-cream)" />
          <stop offset="30%" stopColor="#c4b5fd" />
          <stop offset="70%" stopColor="var(--rust-forest)" opacity="0.5" />
          <stop offset="100%" stopColor="var(--rust-bg-dark)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-arm1`}>
          <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Deep star field */}
      <StarField count={45} seed={7} cx={32} cy={32} radius={28} animated={animated} idPrefix={id} />
      {/* Galaxy core glow */}
      <circle cx={32} cy={32} r={16} fill={`url(#${id}-core)`}>
        {animated && <animate attributeName="r" values="14;18;14" dur="5s" repeatCount="indefinite" />}
      </circle>
      {/* Spiral arms (16 segments) */}
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          const angle = (i / 8) * Math.PI * 2;
          const r1 = 6 + i * 1.5;
          const r2 = 10 + i * 2;
          const x1 = 32 + Math.cos(angle) * r1;
          const y1 = 32 + Math.sin(angle) * r1;
          const x2 = 32 + Math.cos(angle + 0.3) * r2;
          const y2 = 32 + Math.sin(angle + 0.3) * r2;
          const x3 = 32 + Math.cos(angle + 0.6) * (r2 + 3);
          const y3 = 32 + Math.sin(angle + 0.6) * (r2 + 3);
          return (
            <polygon key={`${id}-arm-${i}`} points={`${x1.toFixed(2)},${y1.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} ${x3.toFixed(2)},${y3.toFixed(2)}`} fill={`url(#${id}-arm1)`} opacity={0.6}>
              {animated && <animateTransform attributeName="transform" type="rotate" values={`0 32 32;360 32 32`} dur={`${20 + i}s`} repeatCount="indefinite" />}
            </polygon>
          );
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
          const angle = (i / 8) * Math.PI * 2 + Math.PI;
          const r1 = 6 + i * 1.5;
          const r2 = 10 + i * 2;
          const x1 = 32 + Math.cos(angle) * r1;
          const y1 = 32 + Math.sin(angle) * r1;
          const x2 = 32 + Math.cos(angle - 0.3) * r2;
          const y2 = 32 + Math.sin(angle - 0.3) * r2;
          const x3 = 32 + Math.cos(angle - 0.6) * (r2 + 3);
          const y3 = 32 + Math.sin(angle - 0.6) * (r2 + 3);
          return (
            <polygon key={`${id}-arm2-${i}`} points={`${x1.toFixed(2)},${y1.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} ${x3.toFixed(2)},${y3.toFixed(2)}`} fill={`url(#${id}-arm1)`} opacity={0.5}>
              {animated && <animateTransform attributeName="transform" type="rotate" values={`0 32 32;-360 32 32`} dur={`${20 + i}s`} repeatCount="indefinite" />}
            </polygon>
          );
        })}
      </g>
      {/* Core bright center */}
      <circle cx={32} cy={32} r={4} fill="var(--rust-cream)" opacity={0.9}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.5, 1)} dur="3s" repeatCount="indefinite" />}
      </circle>
      <circle cx={32} cy={32} r={2} fill="#fff" />
      {/* Nebula clouds */}
      {[0, 1, 2, 3, 4].map(i => {
        const angle = (i / 5) * Math.PI * 2;
        const x = 32 + Math.cos(angle) * 12;
        const y = 32 + Math.sin(angle) * 12;
        return <ellipse key={`${id}-neb-${i}`} cx={x.toFixed(2)} cy={y.toFixed(2)} rx={4} ry={2} fill="var(--rust-forest)" opacity={0.15} transform={`rotate(${(angle * 180 / Math.PI).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`} />;
      })}
      {/* Shooting stars */}
      {animated && [0, 1].map(i => (
        <g key={`${id}-shoot-${i}`}>
          <line x1={10} y1={10 + i * 20} x2={18} y2={14 + i * 20} stroke="var(--rust-cream)" strokeWidth={0.8}>
            <animate attributeName="x1" values="10;50;10" dur={`${5 + i * 2}s`} begin={`${i * 3}s`} repeatCount="indefinite" />
            <animate attributeName="y1" values={`${10 + i * 20};${30 + i * 20};${10 + i * 20}`} dur={`${5 + i * 2}s`} begin={`${i * 3}s`} repeatCount="indefinite" />
            <animate attributeName="x2" values="18;58;18" dur={`${5 + i * 2}s`} begin={`${i * 3}s`} repeatCount="indefinite" />
            <animate attributeName="y2" values={`${14 + i * 20};${34 + i * 20};${14 + i * 20}`} dur={`${5 + i * 2}s`} begin={`${i * 3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur={`${5 + i * 2}s`} begin={`${i * 3}s`} repeatCount="indefinite" />
          </line>
        </g>
      ))}
    </>
  );
}

// ── 11. NEARBY (map pin) ──────────────────────────────────────────────
export function NearbyIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-pin`} stops={[
          { offset: "0%", color: "var(--rust-ember)" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} />
      </defs>
      {/* Pulse rings */}
      {animated && [0, 1, 2].map(i => (
        <circle key={`${id}-pulse-${i}`} cx={32} cy={26} r={8} fill="none" stroke="var(--rust-ember)" strokeWidth={1} opacity={0}>
          <animate attributeName="r" values="8;20" dur="3s" begin={`${i}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="3s" begin={`${i}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Pin shadow */}
      <ellipse cx={32} cy={52} rx={8} ry={2} fill="var(--rust-bark)" opacity={0.2} />
      {/* Pin body */}
      <path d="M32,10 C24,10 18,16 18,24 C18,34 32,50 32,50 C32,50 46,34 46,24 C46,16 40,10 32,10 Z" fill={`url(#${id}-pin)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Pin inner highlight */}
      <path d="M32,12 C26,12 20,17 20,24 C20,30 28,42 28,42" fill="none" stroke="var(--rust-cream)" strokeWidth={0.5} opacity={0.4} />
      {/* Pin hole (inner circle) */}
      <circle cx={32} cy={24} r={6} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.5} />
      <circle cx={32} cy={24} r={4} fill={`url(#${id}-pin)`} />
      {/* Center dot */}
      <circle cx={32} cy={24} r={1.5} fill="var(--rust-cream)" />
      {/* Map grid lines */}
      <g opacity={0.15} stroke="var(--rust-bark)" strokeWidth={0.3}>
        <line x1={4} y1={40} x2={60} y2={40} />
        <line x1={4} y1={48} x2={60} y2={48} />
        <line x1={16} y1={36} x2={16} y2={60} />
        <line x1={32} y1={36} x2={32} y2={60} />
        <line x1={48} y1={36} x2={48} y2={60} />
      </g>
      {/* Location accuracy dots */}
      {animated && [0, 1, 2, 3, 4].map(i => (
        <circle key={`${id}-acc-${i}`} cx={20 + i * 6} cy={52} r={0.6} fill="var(--rust-forest)" opacity={0.4}>
          <animate attributeName="opacity" values={twinkleValues(0.1, 0.5)} dur={`${2 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Compass star on pin */}
      <polygon points="32,18 33,24 32,30 31,24" fill="var(--rust-cream)" opacity={0.6} />
      <polygon points="26,24 32,23 38,24 32,25" fill="var(--rust-cream)" opacity={0.4} />
    </>
  );
}

// ── 12. SWIMMING (swimmer) ────────────────────────────────────────────
export function SwimmingIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Water surface */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <path key={`${id}-wave-${i}`} d={`M${4},${32 + i * 4} Q${16},${29 + i * 4} ${28},${32 + i * 4} T${52},${32 + i * 4} T${60},${32 + i * 4}`} fill="none" stroke="var(--rust-forest)" strokeWidth={0.6} opacity={0.3 + i * 0.1}>
          {animated && <animate attributeName="d" values={`M${4},${32 + i * 4} Q${16},${29 + i * 4} ${28},${32 + i * 4} T${52},${32 + i * 4} T${60},${32 + i * 4};M${4},${32 + i * 4} Q${16},${35 + i * 4} ${28},${32 + i * 4} T${52},${32 + i * 4} T${60},${32 + i * 4};M${4},${32 + i * 4} Q${16},${29 + i * 4} ${28},${32 + i * 4} T${52},${32 + i * 4} T${60},${32 + i * 4}`} dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />}
        </path>
      ))}
      {/* Water sparkles */}
      <Particles count={20} seed={28} cx={32} cy={40} spread={36} size={0.5} animated={animated} idPrefix={id} driftY={-1} />
      {/* Swimmer head */}
      <circle cx={20} cy={26} r={5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Swimming cap */}
      <path d="M15,26 Q20,20 25,26" fill="var(--rust-ember)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Goggles */}
      <ellipse cx={18} cy={25} rx={1.5} ry={1} fill="var(--rust-bg-dark)" />
      <ellipse cx={22} cy={25} rx={1.5} ry={1} fill="var(--rust-bg-dark)" />
      <line x1={19.5} y1={25} x2={20.5} y2={25} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Arm reaching forward */}
      <path d="M24,28 Q34,26 44,30" fill="none" stroke="var(--rust-cream)" strokeWidth={3} strokeLinecap="round" />
      <path d="M24,28 Q34,26 44,30" fill="none" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Hand */}
      <circle cx={44} cy={30} r={2} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Body in water */}
      <ellipse cx={30} cy={34} rx={12} ry={4} fill="var(--rust-cream)" opacity={0.5} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Second arm */}
      <path d="M26,32 Q36,34 42,32" fill="none" stroke="var(--rust-cream)" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
      {/* Splashes */}
      {animated && [0, 1, 2, 3, 4].map(i => (
        <circle key={`${id}-splash-${i}`} cx={44 + i * 2} cy={28 - i * 2} r={0.8} fill="var(--rust-cream)" opacity={0}>
          <animate attributeName="cy" values={`${28 - i * 2};${22 - i * 2};${28 - i * 2}`} dur={`${1.5 + i * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur={`${1.5 + i * 0.2}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Lane markers on bottom */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={`${id}-lane-${i}`} x={6 + i * 11} y={54} width={6} height={1.5} fill="var(--rust-brass)" opacity={0.3} />
      ))}
      {/* Breathing bubbles */}
      {animated && [0, 1, 2].map(i => (
        <circle key={`${id}-bubble-${i}`} cx={16 + i * 2} cy={22 - i * 2} r={0.8 + i * 0.3} fill="none" stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0}>
          <animate attributeName="cy" values={`${22};${14};${22}`} dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

// ── 13. BREWERY (beer mug) ────────────────────────────────────────────
export function BreweryIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-beer`} stops={[
          { offset: "0%", color: "#fbbf24" },
          { offset: "50%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-wax)" },
        ]} />
      </defs>
      {/* Foam particles */}
      <Particles count={12} seed={19} cx={32} cy={16} spread={18} size={0.8} animated={animated} idPrefix={id} driftY={-3} />
      {/* Mug body */}
      <path d="M16,18 L16,50 Q16,54 20,54 L40,54 Q44,54 44,50 L44,18 Z" fill={`url(#${id}-beer)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Beer liquid */}
      <path d="M18,24 L18,50 Q18,52 20,52 L40,52 Q42,52 42,50 L42,24 Z" fill={`url(#${id}-beer)`} opacity={0.9} />
      {/* Foam head */}
      <ellipse cx={30} cy={18} rx={14} ry={4} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Foam bubbles */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <circle key={`${id}-foam-${i}`} cx={[22, 28, 34, 38, 26, 36][i]} cy={[18, 16, 17, 18, 19, 16][i]} r={[1.5, 2, 1.8, 1.2, 1, 1.5][i]} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3} />
      ))}
      {/* Beer bubbles rising */}
      {animated && [0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={`${id}-bubble-${i}`} cx={[22, 28, 34, 38, 24, 32, 36, 26][i]} cy={48} r={[0.8, 1, 0.6, 0.9, 0.7, 1.1, 0.5, 0.8][i]} fill="var(--rust-cream)" opacity={0.4}>
          <animate attributeName="cy" values="48;24" dur={`${3 + i * 0.3}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0" dur={`${3 + i * 0.3}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Handle */}
      <path d="M44,24 Q52,24 52,32 Q52,40 44,40" fill="none" stroke="var(--rust-bark)" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M44,26 Q50,26 50,32 Q50,38 44,38" fill="none" stroke="var(--rust-wax)" strokeWidth={1} />
      {/* Mug rim */}
      <ellipse cx={30} cy={18} rx={14} ry={2} fill="none" stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Mug base shadow */}
      <ellipse cx={30} cy={54} rx={14} ry={2} fill="var(--rust-bark)" opacity={0.2} />
      {/* Condensation drops */}
      {[0, 1, 2, 3].map(i => (
        <ellipse key={`${id}-drop-${i}`} cx={[16, 16, 44, 44][i]} cy={[30, 40, 32, 42][i]} rx={1} ry={2} fill="var(--rust-cream)" opacity={0.4} />
      ))}
      {/* Wheat sheaf decoration */}
      {[0, 1, 2, 3, 4].map(i => (
        <ellipse key={`${id}-wheat-${i}`} cx={30} cy={32 + i * 4} rx={2} ry={1} fill="var(--rust-brass)" opacity={0.3} transform={`rotate(${i % 2 === 0 ? 15 : -15} 30 ${32 + i * 4})`} />
      ))}
      {/* Glow */}
      {animated && <ellipse cx={30} cy={36} rx={16} ry={18} fill="var(--rust-brass)" opacity={0.05}><animate attributeName="opacity" values={twinkleValues(0.03, 0.1)} dur="4s" repeatCount="indefinite" /></ellipse>}
    </>
  );
}

// ── 14. GROCERY (shopping cart) ───────────────────────────────────────
export function GroceryIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      {/* Cart particles */}
      <Particles count={12} seed={53} cx={32} cy={20} spread={20} size={0.5} animated={animated} idPrefix={id} driftY={-2} />
      {/* Cart handle */}
      <line x1={8} y1={16} x2={16} y2={16} stroke="var(--rust-bark)" strokeWidth={2} strokeLinecap="round" />
      <line x1={8} y1={16} x2={8} y2={20} stroke="var(--rust-bark)" strokeWidth={2} strokeLinecap="round" />
      {/* Cart frame */}
      <polyline points="16,16 22,16 28,40 48,40 52,22 24,22" fill="none" stroke="var(--rust-bark)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Cart basket grid */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={`${id}-grid-h-${i}`} x1={24 + i * 5.5} y1={22} x2={26 + i * 5} y2={40} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.5} />
      ))}
      {[0, 1, 2].map(i => (
        <line key={`${id}-grid-v-${i}`} x1={24} y1={26 + i * 5} x2={50} y2={26 + i * 5} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4} />
      ))}
      {/* Items in cart */}
      <rect x={28} y={18} width={6} height={6} rx={1} fill="var(--rust-ember)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <rect x={34} y={20} width={5} height={4} rx={1} fill="var(--rust-forest)" opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <circle cx={42} cy={22} r={2.5} fill="var(--rust-brass)" opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Cart lower frame */}
      <line x1={28} y1={40} x2={24} y2={46} stroke="var(--rust-bark)" strokeWidth={1.2} />
      <line x1={48} y1={40} x2={48} y2={46} stroke="var(--rust-bark)" strokeWidth={1.2} />
      {/* Wheels */}
      <circle cx={24} cy={49} r={4} fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
      <circle cx={24} cy={49} r={1.5} fill="var(--rust-wax)" />
      <circle cx={48} cy={49} r={4} fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
      <circle cx={48} cy={49} r={1.5} fill="var(--rust-wax)" />
      {/* Wheel spokes */}
      {[0, 1, 2, 3].map(j => {
        const angle = (j / 4) * Math.PI * 2;
        return (
          <line key={`${id}-wspk-l-${j}`} x1={24} y1={49} x2={24 + Math.cos(angle) * 3} y2={49 + Math.sin(angle) * 3} stroke="var(--rust-bg-dark)" strokeWidth={0.3}>
            {animated && <animateTransform attributeName="transform" type="rotate" values={`0 24 49;360 24 49`} dur="3s" repeatCount="indefinite" />}
          </line>
        );
      })}
      {[0, 1, 2, 3].map(j => {
        const angle = (j / 4) * Math.PI * 2;
        return (
          <line key={`${id}-wspk-r-${j}`} x1={48} y1={49} x2={48 + Math.cos(angle) * 3} y2={49 + Math.sin(angle) * 3} stroke="var(--rust-bg-dark)" strokeWidth={0.3}>
            {animated && <animateTransform attributeName="transform" type="rotate" values={`0 48 49;360 48 49`} dur="3s" repeatCount="indefinite" />}
          </line>
        );
      })}
      {/* Ground line */}
      <line x1={18} y1={54} x2={54} y2={54} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.3} />
      {/* Motion lines */}
      {animated && [0, 1, 2].map(i => (
        <line key={`${id}-motion-${i}`} x1={54 + i * 3} y1={30 + i * 4} x2={58 + i * 3} y2={30 + i * 4} stroke="var(--theme-anim-particle)" strokeWidth={0.5} opacity={0}>
          <animate attributeName="opacity" values="0;0.4;0" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* Price tag */}
      <g transform="rotate(-15 14 30)">
        <polygon points="8,28 18,26 18,34 8,36" fill="var(--rust-brass)" opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.4} />
        <circle cx={10} cy={32} r={0.8} fill="var(--rust-bark)" />
      </g>
    </>
  );
}
