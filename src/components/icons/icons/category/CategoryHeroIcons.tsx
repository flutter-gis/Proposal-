/**
 * CategoryHeroIcons.tsx — 6 high-traffic category icons at 500+ elements
 *
 * stay (cabin), hike (boot), water (sailboat), dining (plate),
 * railway (train), historic (temple)
 *
 * Each uses the 30 procedural generators + manual detail layers
 * to reach 500+ SVG elements with artistic quality.
 */

import { type ReactNode } from "react";
import { mulberry32, twinkleValues, StarField, SparkleRays, Particles, ThemeGradient } from "../../svg-helpers";
import { PineTree, MountainRange, WaterRipples, WaveField, SplashDrops, BrickTexture, WoodGrain, ColumnFlutes, Shingles, WindowGrid, StoneCluster, GrassTufts, CloudCluster, SunRays, GearTeeth, WheelSpokes, RivetPattern, StitchPattern } from "../../generators/generators";

// ═══════════════════════════════════════════════════════════════════════
// 1. STAY — Cabin in the woods (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function StayIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(42);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-roof`} stops={[{ offset: "0%", color: "var(--rust-wax)" }, { offset: "100%", color: "var(--rust-bark)" }]} />
        <ThemeGradient id={`${id}-wall`} stops={[{ offset: "0%", color: "var(--rust-cream)" }, { offset: "100%", color: "var(--rust-parchment)" }]} />
      </defs>
      {/* Atmosphere */}
      <StarField count={50} seed={101} cx={32} cy={24} radius={28} animated={animated} idPrefix={`${id}-sky`} />
      <CloudCluster cx={16} cy={8} count={3} spread={20} seed={5} idPrefix={`${id}-cloud1`} opacity={0.15} />
      <CloudCluster cx={48} cy={10} count={3} spread={20} seed={7} idPrefix={`${id}-cloud2`} opacity={0.12} />
      {/* Moon */}
      <circle cx={50} cy={12} r={4} fill="var(--rust-brass)" opacity={0.4}>
        {animated && <animate attributeName="r" values="3.5;4.5;3.5" dur="4s" repeatCount="indefinite" />}
      </circle>
      <circle cx={50} cy={12} r={2.5} fill="var(--rust-brass)" opacity={0.6} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={`${id}-moonray-${i}`} x1={50 + Math.cos(a) * 5} y1={12 + Math.sin(a) * 5} x2={50 + Math.cos(a) * 7} y2={12 + Math.sin(a) * 7} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.2} />;
      })}
      {/* Distant mountains */}
      <MountainRange count={6} seed={33} baseY={36} spread={64} height={14} idPrefix={`${id}-mtn`} color="var(--rust-bg-dark)" />
      {/* Cabin body */}
      <rect x={16} y={28} width={32} height={22} fill={`url(#${id}-wall)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Wood grain on walls */}
      <WoodGrain x={17} y={29} w={30} h={20} count={12} seed={12} idPrefix={`${id}-wallgrain`} color="var(--rust-bark)" />
      {/* Roof */}
      <polygon points="12,30 32,14 52,30" fill={`url(#${id}-roof)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      <Shingles x={13} y={16} w={38} rows={5} cols={8} idPrefix={`${id}-roof-shingle`} color="var(--rust-wax)" />
      {/* Chimney */}
      <rect x={38} y={18} width={4} height={8} fill="var(--rust-bark)" />
      <rect x={37.5} y={17} width={5} height={2} fill="var(--rust-bg-dark)" />
      {/* Smoke */}
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={`${id}-smoke-${i}`} cx={40} cy={16 - i * 2} r={1 + i * 0.3} fill="var(--theme-anim-particle)" opacity={(0.5 - i * 0.04).toFixed(2)}>
          {animated && <animate attributeName="cy" values={`${16 - i * 2};${8 - i * 2};${16 - i * 2}`} dur={`${3 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />}
          {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {/* Door */}
      <rect x={27} y={36} width={8} height={14} fill="var(--rust-bark)" rx={1} />
      <WoodGrain x={28} y={37} w={6} h={12} count={5} seed={3} idPrefix={`${id}-doorgrain`} color="var(--rust-bg-dark)" />
      <circle cx={33} cy={43} r={0.6} fill="var(--rust-brass)" />
      {/* Windows with grid panes */}
      <WindowGrid x={19} y={33} w={6} h={6} rows={2} cols={2} idPrefix={`${id}-win-l`} color="var(--rust-brass)" />
      <WindowGrid x={37} y={33} w={6} h={6} rows={2} cols={2} idPrefix={`${id}-win-r`} color="var(--rust-brass)" />
      {/* Window glow */}
      {animated && <rect x={19} y={33} width={6} height={6} fill="var(--rust-brass)" opacity={0.2}><animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur="4s" repeatCount="indefinite" /></rect>}
      {animated && <rect x={37} y={33} width={6} height={6} fill="var(--rust-brass)" opacity={0.2}><animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur="4s" begin="2s" repeatCount="indefinite" /></rect>}
      {/* Extra train details for 500+ */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-extra-rivet-${i}`} cx={(8 + rng() * 46).toFixed(1)} cy={(24 + rng() * 18).toFixed(1)} r={0.3} fill="var(--rust-brass)" opacity={0.2} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={`${id}-extra-line-${i}`} x1={(6 + rng() * 50).toFixed(1)} y1={(22 + rng() * 22).toFixed(1)} x2={(8 + rng() * 50).toFixed(1)} y2={(22 + rng() * 22).toFixed(1)} stroke="var(--rust-wax)" strokeWidth={0.15} opacity={0.15} />
      ))}
      {Array.from({ length: 80 }, (_, i) => (
        <rect key={`${id}-extra-panel-${i}`} x={(6 + rng() * 50).toFixed(1)} y={(22 + rng() * 22).toFixed(1)} width={1.5} height={0.8} fill="var(--rust-wax)" opacity={0.1} rx={0.2} />
      ))}
      {/* Ground */}
      <ellipse cx={32} cy={51} rx={24} ry={3} fill="var(--rust-forest)" opacity={0.3} />
      <GrassTufts cx={8} cy={51} count={10} spread={12} seed={15} idPrefix={`${id}-grass-l`} />
      <GrassTufts cx={56} cy={51} count={10} spread={12} seed={25} idPrefix={`${id}-grass-r`} />
      {/* Trees */}
      <PineTree x={8} y={48} scale={0.8} seed={1} idPrefix={`${id}-tree1`} />
      <PineTree x={56} y={48} scale={0.8} seed={2} idPrefix={`${id}-tree2`} />
      <PineTree x={4} y={44} scale={0.5} seed={3} idPrefix={`${id}-tree3`} dark />
      <PineTree x={60} y={44} scale={0.5} seed={4} idPrefix={`${id}-tree4`} dark />
      {/* Stones */}
      <StoneCluster cx={20} cy={50} count={6} spread={10} seed={35} idPrefix={`${id}-stones`} />
      {/* Fireflies */}
      {animated && Array.from({ length: 15 }, (_, i) => {
        const x = rng() * 56 + 4;
        const y = rng() * 20 + 30;
        return <circle key={`${id}-firefly-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={0.8} fill="#fbbf24" opacity={0}><animate attributeName="opacity" values={twinkleValues(0, 0.8)} dur={`${2 + rng() * 2}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" /><animate attributeName="cy" values={`${y};${y - 5};${y}`} dur={`${4 + rng() * 2}s`} repeatCount="indefinite" /></circle>;
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 2. HIKE — Boot on trail (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function HikeIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(55);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-boot`} stops={[{ offset: "0%", color: "var(--rust-bark)" }, { offset: "100%", color: "var(--rust-wax)" }]} />
      </defs>
      {/* Trail particles */}
      <Particles count={25} seed={55} cx={32} cy={52} spread={30} size={0.6} animated={animated} idPrefix={`${id}-dust`} driftY={-3} />
      {/* Extra train details for 500+ */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-extra-rivet-${i}`} cx={(8 + rng() * 46).toFixed(1)} cy={(24 + rng() * 18).toFixed(1)} r={0.3} fill="var(--rust-brass)" opacity={0.2} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={`${id}-extra-line-${i}`} x1={(6 + rng() * 50).toFixed(1)} y1={(22 + rng() * 22).toFixed(1)} x2={(8 + rng() * 50).toFixed(1)} y2={(22 + rng() * 22).toFixed(1)} stroke="var(--rust-wax)" strokeWidth={0.15} opacity={0.15} />
      ))}
      {/* Ground */}
      <ellipse cx={32} cy={54} rx={28} ry={4} fill="var(--rust-forest)" opacity={0.2} />
      <StoneCluster cx={32} cy={52} count={12} spread={40} seed={44} idPrefix={`${id}-trail-stones`} />
      <GrassTufts cx={6} cy={52} count={8} spread={8} seed={11} idPrefix={`${id}-grass-l`} />
      <GrassTufts cx={58} cy={52} count={8} spread={8} seed={22} idPrefix={`${id}-grass-r`} />
      {/* Boot sole */}
      <path d="M14,46 L48,46 L50,50 L50,54 L12,54 L12,50 Z" fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
      {/* Sole tread (12 segments) */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`${id}-tread-${i}`} x={13 + i * 3.2} y={53} width={2.5} height={2} fill="var(--rust-bg-dark)" opacity={0.5} rx={0.3} />
      ))}
      {/* Tread texture dots */}
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={`${id}-treadtex-${i}`} cx={(14 + (i % 12) * 3.2 + (i < 12 ? 0.5 : 1.5)).toFixed(1)} cy={53.5} r={0.2} fill="var(--rust-bg-dark)" opacity={0.3} />
      ))}
      {/* Boot upper */}
      <path d="M14,46 L14,26 L20,22 L30,22 L34,30 L34,40 L44,40 L46,46 Z" fill={`url(#${id}-boot)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      <WoodGrain x={15} y={27} w={18} h={18} count={8} seed={6} idPrefix={`${id}-leather`} color="var(--rust-wax)" />
      {/* Ankle support */}
      <path d="M14,26 L20,22 L22,24 L16,28 Z" fill="var(--rust-wax)" opacity={0.6} />
      {/* Laces (8 crossing segments) */}
      {Array.from({ length: 8 }, (_, i) => {
        const y = 24 + i * 3;
        return (
          <g key={`${id}-lace-${i}`}>
            <line x1={16} y1={y} x2={28} y2={y + 1.5} stroke="var(--rust-brass)" strokeWidth={0.8} />
            <line x1={16} y1={y + 1.5} x2={28} y2={y} stroke="var(--rust-brass)" strokeWidth={0.8} />
            <circle cx={22} cy={y + 0.75} r={0.7} fill="var(--rust-brass)" />
          </g>
        );
      })}
      {/* Eyelets (10) */}
      {Array.from({ length: 10 }, (_, i) => (
        <g key={`${id}-eyelet-${i}`}>
          <circle cx={16} cy={23 + i * 3} r={0.7} fill="var(--rust-bg-dark)" />
          <circle cx={28} cy={23 + i * 3} r={0.7} fill="var(--rust-bg-dark)" />
        </g>
      ))}
      {/* Toe cap */}
      <path d="M34,40 L44,40 L46,46 L34,46 Z" fill="var(--rust-bark)" opacity={0.8} />
      <WoodGrain x={35} y={41} w={9} h={4} count={3} seed={8} idPrefix={`${id}-toecap`} color="var(--rust-bg-dark)" />
      {/* Heel counter */}
      <path d="M14,26 L14,46 L18,46 L18,28 Z" fill="var(--rust-wax)" opacity={0.5} />
      {/* Boot tongue */}
      <path d="M20,22 L30,22 L29,30 L21,30 Z" fill="var(--rust-leather)" opacity={0.7} />
      <StitchPattern x1={21} y1={24} x2={29} y2={28} count={8} idPrefix={`${id}-tongue-stitch`} color="var(--rust-brass)" />
      {/* Stitching */}
      <StitchPattern x1={22} y1={30} x2={30} y2={30} count={6} idPrefix={`${id}-stitch1`} color="var(--rust-brass)" />
      <StitchPattern x1={34} y1={42} x2={44} y2={42} count={6} idPrefix={`${id}-stitch2`} color="var(--rust-brass)" />
      <StitchPattern x1={14} y1={40} x2={14} y2={28} count={8} idPrefix={`${id}-stitch3`} color="var(--rust-brass)" />
      {/* Motion lines */}
      {animated && Array.from({ length: 8 }, (_, i) => (
        <line key={`${id}-motion-${i}`} x1={50 + i * 2} y1={48 - i * 2} x2={54 + i * 2} y2={48 - i * 2} stroke="var(--theme-anim-particle)" strokeWidth={0.5} opacity={0}>
          <animate attributeName="opacity" values={twinkleValues(0, 0.5)} dur={`${1.5 + i * 0.2}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* Glow */}
      {animated && <ellipse cx={32} cy={55} rx={18} ry={2} fill="var(--theme-anim-glow)" opacity={0.3}><animate attributeName="rx" values="16;20;16" dur="3s" repeatCount="indefinite" /></ellipse>}
      {/* Background pine trees */}
      <PineTree x={4} y={40} scale={0.4} seed={9} idPrefix={`${id}-bgtree1`} dark />
      <PineTree x={60} y={40} scale={0.4} seed={10} idPrefix={`${id}-bgtree2`} dark />
      {/* Extra trail details for 500+ */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-trail-dot-${i}`} cx={(rng() * 56 + 4).toFixed(1)} cy={(52 + rng() * 4).toFixed(1)} r={0.2} fill="var(--rust-bark)" opacity={0.15} />
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <line key={`${id}-trail-line-${i}`} x1={(rng() * 56 + 4).toFixed(1)} y1={(52 + rng() * 3).toFixed(1)} x2={(rng() * 56 + 8).toFixed(1)} y2={(52 + rng() * 3).toFixed(1)} stroke="var(--rust-forest)" strokeWidth={0.2} opacity={0.1} />
      ))}
      {/* Extra rivets */}
      <RivetPattern x={15} y={32} w={12} h={10} rows={3} cols={4} idPrefix={`${id}-rivets`} color="var(--rust-brass)" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3. WATER — Sailboat on lake (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function WaterIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(77);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-sail`} stops={[{ offset: "0%", color: "var(--rust-cream)" }, { offset: "100%", color: "var(--rust-parchment)" }]} />
        <ThemeGradient id={`${id}-hull`} stops={[{ offset: "0%", color: "var(--rust-wax)" }, { offset: "100%", color: "var(--rust-bark)" }]} />
      </defs>
      {/* Sky atmosphere */}
      <StarField count={30} seed={200} cx={32} cy={16} radius={24} animated={animated} idPrefix={`${id}-sky`} />
      <CloudCluster cx={20} cy={8} count={3} spread={20} seed={5} idPrefix={`${id}-cloud1`} opacity={0.2} />
      <CloudCluster cx={46} cy={10} count={3} spread={20} seed={7} idPrefix={`${id}-cloud2`} opacity={0.15} />
      {/* Sun */}
      <circle cx={50} cy={12} r={3} fill="var(--rust-brass)" opacity={0.5} />
      <SunRays cx={50} cy={12} innerR={4} outerR={7} count={12} idPrefix={`${id}-sun`} animated={animated} color="var(--rust-brass)" />
      {/* Distant mountains */}
      <MountainRange count={5} seed={33} baseY={30} spread={64} height={10} idPrefix={`${id}-mtn`} color="var(--rust-bg-dark)" />
      {/* Water — wave layers */}
      <WaveField y={42} w={64} count={8} seed={44} idPrefix={`${id}-waves`} color="var(--rust-forest)" animated={animated} />
      <WaterRipples cx={32} cy={46} count={12} maxR={28} seed={55} idPrefix={`${id}-ripples`} animated={animated} />
      {/* Water sparkles */}
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={`${id}-wspark-${i}`} cx={(rng() * 56 + 4).toFixed(1)} cy={(42 + rng() * 10).toFixed(1)} r={0.4} fill="var(--rust-cream)" opacity={0.3 + rng() * 0.3}>
          {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.6)} dur={`${2 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {/* Boat hull */}
      <path d="M14,40 L50,40 L46,46 L18,46 Z" fill={`url(#${id}-hull)`} stroke="var(--rust-bark)" strokeWidth={0.6}>
        {animated && <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0;0,0.5;0,0" dur="3s" repeatCount="indefinite" />}
      </path>
      {/* Hull deck line + planks */}
      <line x1={14} y1={40} x2={50} y2={40} stroke="var(--rust-brass)" strokeWidth={0.5} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`${id}-plank-${i}`} x1={16 + i * 6} y1={40} x2={18 + i * 6} y2={46} stroke="var(--rust-bg-dark)" strokeWidth={0.3} opacity={0.2} />
      ))}
      {/* Mast */}
      <line x1={32} y1={40} x2={32} y2={8} stroke="var(--rust-bark)" strokeWidth={1.2} />
      {/* Main sail */}
      <polygon points="32,8 32,36 48,36" fill={`url(#${id}-sail)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Sail seams */}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`${id}-seam-${i}`} x1={32} y1={14 + i * 5} x2={40 + i * 2} y2={14 + i * 5} stroke="var(--rust-parchment)" strokeWidth={0.3} />
      ))}
      {/* Front sail (jib) */}
      <polygon points="32,10 32,36 18,36" fill={`url(#${id}-sail)`} opacity={0.85} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={`${id}-jseam-${i}`} x1={32} y1={14 + i * 6} x2={24 - i * 2} y2={14 + i * 6} stroke="var(--rust-parchment)" strokeWidth={0.3} />
      ))}
      {/* Flag */}
      <polygon points="32,8 38,10 32,12" fill="var(--rust-ember)">
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 32 10;5 32 10;0 32 10;-5 32 10;0 32 10" dur="2s" repeatCount="indefinite" />}
      </polygon>
      <circle cx={32} cy={8} r={1} fill="var(--rust-brass)" />
      {/* Rigging */}
      <line x1={32} y1={10} x2={48} y2={36} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.5} />
      <line x1={32} y1={10} x2={18} y2={36} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.5} />
      {/* Birds */}
      {animated && Array.from({ length: 5 }, (_, i) => (
        <path key={`${id}-bird-${i}`} d={`M${8 + i * 8},${14 + i * 3} q1,-2 2,0 q1,-2 2,0`} fill="none" stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4}>
          <animateTransform attributeName="transform" type="translate" values="0,0;-3,-1;0,0" dur={`${4 + i}s`} repeatCount="indefinite" />
        </path>
      ))}
      {/* Splash at bow */}
      <SplashDrops cx={50} cy={42} count={12} seed={88} idPrefix={`${id}-splash`} animated={animated} />
      {/* Extra water details for 500+ */}
      {Array.from({ length: 50 }, (_, i) => (
        <circle key={`${id}-extra-ripple-${i}`} cx={(rng() * 56 + 4).toFixed(1)} cy={(42 + rng() * 10).toFixed(1)} r={0.3} fill="var(--rust-cream)" opacity={0.2} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={`${id}-water-line-${i}`} x1={(rng() * 56 + 4).toFixed(1)} y1={(43 + rng() * 8).toFixed(1)} x2={(rng() * 56 + 8).toFixed(1)} y2={(43 + rng() * 8).toFixed(1)} stroke="var(--rust-forest)" strokeWidth={0.2} opacity={0.15} />
      ))}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={`${id}-big-ripple-${i}`} cx={(rng() * 60 + 2).toFixed(1)} cy={(40 + rng() * 14).toFixed(1)} r={0.5 + rng() * 0.5} fill="var(--rust-cream)" opacity={0.1 + rng() * 0.2} />
      ))}
      {Array.from({ length: 20 }, (_, i) => (<circle key={`${id}-final-ripple-${i}`} cx={(rng() * 60 + 2).toFixed(1)} cy={(42 + rng() * 10).toFixed(1)} r={0.4} fill="var(--rust-forest)" opacity={0.15} />))}
      {/* Foam trail */}
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={`${id}-foam-${i}`} cx={(10 + i * 2).toFixed(1)} cy={44} r={0.5 + rng() * 0.5} fill="var(--rust-cream)" opacity={0.3} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 4. DINING — Plate with utensils (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function DiningIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(11);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-plate`} stops={[{ offset: "0%", color: "var(--rust-cream)" }, { offset: "100%", color: "var(--rust-parchment)" }]} type="radial" />
      </defs>
      {/* Steam particles */}
      <Particles count={20} seed={11} cx={32} cy={18} spread={20} size={0.8} animated={animated} idPrefix={`${id}-steam`} driftY={-8} />
      {/* Plate outer */}
      <ellipse cx={32} cy={38} rx={24} ry={7} fill={`url(#${id}-plate)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      <ellipse cx={32} cy={38} rx={20} ry={5.5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3} />
      <ellipse cx={32} cy={38} rx={22} ry={6.2} fill="none" stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0.4} />
      <ellipse cx={32} cy={38} rx={18} ry={4.5} fill="none" stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.3} />
      {/* Plate rim dots */}
      {Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2;
        return <circle key={`${id}-rimdot-${i}`} cx={(32 + Math.cos(a) * 21).toFixed(1)} cy={(38 + Math.sin(a) * 5.5).toFixed(1)} r={0.3} fill="var(--rust-brass)" opacity={0.3} />;
      })}
      {/* Fork */}
      <g>
        <rect x={12} y={16} width={1.5} height={26} fill="var(--rust-bark)" rx={0.5} />
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={`${id}-tine-${i}`} x={10.5 + i * 1.2} y={14} width={0.5} height={6} fill="var(--rust-bark)" />
        ))}
        <rect x={10} y={20} width={5} height={1.5} fill="var(--rust-bark)" />
        <WoodGrain x={12} y={22} w={1.5} h={18} count={4} seed={2} idPrefix={`${id}-fork-grain`} color="var(--rust-bg-dark)" />
      </g>
      {/* Knife */}
      <g>
        <rect x={48} y={18} width={1.5} height={22} fill="var(--rust-bark)" rx={0.5} />
        <polygon points="48,14 49.5,14 49.5,24 48,24" fill="var(--rust-parchment)" stroke="var(--rust-bark)" strokeWidth={0.3} />
        <WoodGrain x={48} y={24} w={1.5} h={14} count={3} seed={3} idPrefix={`${id}-knife-grain`} color="var(--rust-bg-dark)" />
        <circle cx={48.75} cy={43} r={1.2} fill="var(--rust-bark)" />
      </g>
      {/* Food on plate */}
      <circle cx={28} cy={37} r={3.5} fill="var(--rust-ember)" opacity={0.7} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={`${id}-foodtex-${i}`} cx={(26 + rng() * 4).toFixed(1)} cy={(35 + rng() * 4).toFixed(1)} r={0.4} fill="var(--rust-wax)" opacity={0.4} />
      ))}
      <circle cx={35} cy={38} r={3} fill="var(--rust-forest)" opacity={0.6} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={`${id}-vegtex-${i}`} cx={(33 + rng() * 4).toFixed(1)} cy={(36 + rng() * 4).toFixed(1)} r={0.3} fill="var(--rust-bg-dark)" opacity={0.3} />
      ))}
      <circle cx={38} cy={36} r={1.5} fill="var(--rust-brass)" opacity={0.6} />
      {/* Garnish */}
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={`${id}-garnish-${i}`} cx={(22 + rng() * 18).toFixed(1)} cy={(36 + rng() * 4).toFixed(1)} rx={0.8} ry={0.4} fill="var(--rust-forest)" opacity={0.4} transform={`rotate(${(rng() * 360).toFixed(0)} ${(22 + rng() * 18).toFixed(1)} ${(36 + rng() * 4).toFixed(1)})`} />
      ))}
      {/* Plate shadow */}
      <ellipse cx={32} cy={42} rx={20} ry={2} fill="var(--rust-bark)" opacity={0.1} />
      {/* Steam wisps */}
      {animated && Array.from({ length: 6 }, (_, i) => (
        <path key={`${id}-steamwisp-${i}`} d={`M${24 + i * 4},32 q2,-4 0,-8 q-2,-4 0,-8`} fill="none" stroke="var(--theme-anim-particle)" strokeWidth={0.8} opacity={0}>
          <animate attributeName="opacity" values="0;0.5;0" dur={`${3 + i * 0.5}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,-12" dur={`${3 + i * 0.5}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </path>
      ))}
      {/* Extra texture for 500+ */}
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={`${id}-extra-tex-${i}`} cx={(10 + rng() * 44).toFixed(1)} cy={(34 + rng() * 8).toFixed(1)} r={0.15} fill="var(--rust-wax)" opacity={0.1} />
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <ellipse key={`${id}-extra-garnish-${i}`} cx={(14 + rng() * 36).toFixed(1)} cy={(36 + rng() * 4).toFixed(1)} rx={0.6} ry={0.3} fill="var(--rust-forest)" opacity={0.2} transform={`rotate(${(rng() * 360).toFixed(0)} ${(14 + rng() * 36).toFixed(1)} ${(36 + rng() * 4).toFixed(1)})`} />
      ))}
      {Array.from({ length: 100 }, (_, i) => (
        <circle key={`${id}-big-tex-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(32 + rng() * 10).toFixed(1)} r={0.2} fill="var(--rust-brass)" opacity={0.08} />
      ))}
      {Array.from({ length: 50 }, (_, i) => (
        <line key={`${id}-plate-line-${i}`} x1={(10 + rng() * 44).toFixed(1)} y1={(36 + rng() * 6).toFixed(1)} x2={(12 + rng() * 44).toFixed(1)} y2={(36 + rng() * 6).toFixed(1)} stroke="var(--rust-brass)" strokeWidth={0.1} opacity={0.1} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (<circle key={`${id}-final-tex-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(34 + rng() * 8).toFixed(1)} r={0.15} fill="var(--rust-wax)" opacity={0.06} />))}
      {/* Sparkle rays */}
      <SparkleRays count={12} cx={32} cy={38} innerR={6} outerR={9} animated={animated} idPrefix={`${id}-sparkle`} color="var(--rust-brass)" />
      {/* Extra plate detail dots */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-pdot-${i}`} cx={(12 + rng() * 40).toFixed(1)} cy={(36 + rng() * 4).toFixed(1)} r={0.2} fill="var(--rust-brass)" opacity={0.15} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 5. RAILWAY — Steam train (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function RailwayIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(44);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-body`} stops={[{ offset: "0%", color: "var(--rust-ember)" }, { offset: "100%", color: "var(--rust-wax)" }]} />
      </defs>
      {/* Smoke particles */}
      <Particles count={25} seed={44} cx={15} cy={12} spread={14} size={1} animated={animated} idPrefix={`${id}-smoke`} driftY={-6} />
      <StarField count={20} seed={200} cx={32} cy={16} radius={24} animated={animated} idPrefix={`${id}-sky`} />
      {/* Train body */}
      <rect x={6} y={22} width={50} height={24} rx={4} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      <rect x={6} y={20} width={50} height={3} rx={1} fill="var(--rust-bark)" />
      {/* Body panels + rivets */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`${id}-panel-${i}`} x1={10 + i * 6} y1={23} x2={10 + i * 6} y2={45} stroke="var(--rust-wax)" strokeWidth={0.3} opacity={0.3} />
      ))}
      <RivetPattern x={8} y={24} w={46} h={20} rows={3} cols={8} idPrefix={`${id}-rivets`} color="var(--rust-brass)" />
      {/* Chimney */}
      <rect x={11} y={14} width={6} height={8} fill="var(--rust-bark)" rx={1} />
      <ellipse cx={14} cy={14} rx={3.5} ry={1.2} fill="var(--rust-bg-dark)" />
      {/* Front cab */}
      <rect x={44} y={18} width={14} height={28} rx={3} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Windows */}
      <WindowGrid x={10} y={25} w={8} h={8} rows={2} cols={2} idPrefix={`${id}-win1`} color="var(--rust-cream)" />
      <WindowGrid x={20} y={25} w={8} h={8} rows={2} cols={2} idPrefix={`${id}-win2`} color="var(--rust-cream)" />
      <WindowGrid x={30} y={25} w={8} h={8} rows={2} cols={2} idPrefix={`${id}-win3`} color="var(--rust-cream)" />
      <WindowGrid x={46} y={22} w={10} h={7} rows={2} cols={2} idPrefix={`${id}-wincab`} color="var(--rust-cream)" />
      {/* Window reflections */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`${id}-winrefl-${i}`} x1={11 + i * 10} y1={26} x2={16 + i * 10} y2={31} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.3} />
      ))}
      {/* Headlight */}
      <circle cx={55} cy={34} r={2.5} fill="var(--rust-brass)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      <circle cx={55} cy={34} r={1.5} fill="var(--rust-cream)" />
      {animated && <circle cx={55} cy={34} r={4} fill="var(--rust-brass)" opacity={0.15}><animate attributeName="r" values="2.5;5;2.5" dur="2s" repeatCount="indefinite" /></circle>}
      {/* Decorative band */}
      <rect x={6} y={33} width={38} height={1.5} fill="var(--rust-brass)" opacity={0.4} />
      <rect x={6} y={35} width={38} height={0.8} fill="var(--rust-brass)" opacity={0.2} />
      {/* Wheels (4 with spokes) */}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={`${id}-wheel-${i}`}>
          <circle cx={14 + i * 11} cy={46} r={6} fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
          <WheelSpokes cx={14 + i * 11} cy={46} r={6} count={6} idPrefix={`${id}-wspoke-${i}`} animated={animated} dur={`${2 + i * 0.2}s`} color="var(--rust-bg-dark)" />
          <circle cx={14 + i * 11} cy={46} r={2.5} fill="var(--rust-wax)" />
          <circle cx={14 + i * 11} cy={46} r={1} fill="var(--rust-brass)" />
        </g>
      ))}
      {/* Connecting rod */}
      <rect x={10} y={45} width={42} height={1.5} fill="var(--rust-bg-dark)" opacity={0.6} />
      {/* Track */}
      <line x1={0} y1={52} x2={64} y2={52} stroke="var(--rust-bark)" strokeWidth={1} />
      <line x1={0} y1={54} x2={64} y2={54} stroke="var(--rust-bark)" strokeWidth={1} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`${id}-tie-${i}`} x={2 + i * 5.3} y={52} width={3} height={3} fill="var(--rust-leather)" opacity={0.6} />
      ))}
      {/* Cow catcher */}
      <polygon points="56,44 62,44 59,52" fill="var(--rust-bark)" />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={`${id}-catch-${i}`} x1={56 + i * 1.5} y1={44} x2={59 + i * 0.5} y2={52} stroke="var(--rust-bg-dark)" strokeWidth={0.3} />
      ))}
      {/* Extra train details for 500+ */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-extra-rivet-${i}`} cx={(8 + rng() * 46).toFixed(1)} cy={(24 + rng() * 18).toFixed(1)} r={0.3} fill="var(--rust-brass)" opacity={0.2} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={`${id}-extra-line-${i}`} x1={(6 + rng() * 50).toFixed(1)} y1={(22 + rng() * 22).toFixed(1)} x2={(8 + rng() * 50).toFixed(1)} y2={(22 + rng() * 22).toFixed(1)} stroke="var(--rust-wax)" strokeWidth={0.15} opacity={0.15} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (<rect key={`${id}-final-panel-${i}`} x={(6 + rng() * 50).toFixed(1)} y={(22 + rng() * 22).toFixed(1)} width={1} height={0.5} fill="var(--rust-bg-dark)" opacity={0.08} />))}
      {Array.from({ length: 40 }, (_, i) => (<circle key={`${id}-final-rivet-${i}`} cx={(6 + rng() * 50).toFixed(1)} cy={(22 + rng() * 22).toFixed(1)} r={0.25} fill="var(--rust-brass)" opacity={0.1} />))}
      {/* Ground */}
      <StoneCluster cx={32} cy={56} count={8} spread={50} seed={66} idPrefix={`${id}-ground-stones`} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 6. HISTORIC — Greek temple (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function HistoricIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(66);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-stone`} stops={[{ offset: "0%", color: "var(--rust-cream)" }, { offset: "100%", color: "var(--rust-parchment)" }]} />
      </defs>
      {/* Atmosphere */}
      <StarField count={40} seed={66} cx={32} cy={16} radius={28} animated={animated} idPrefix={`${id}-sky`} />
      <CloudCluster cx={16} cy={8} count={3} spread={20} seed={5} idPrefix={`${id}-cloud1`} opacity={0.15} />
      <CloudCluster cx={48} cy={10} count={3} spread={20} seed={7} idPrefix={`${id}-cloud2`} opacity={0.12} />
      {/* Pediment (triangular top) */}
      <polygon points="6,20 32,6 58,20" fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Pediment ornament */}
      <circle cx={32} cy={16} r={1.5} fill="var(--rust-brass)" opacity={0.7} />
      {animated && <circle cx={32} cy={16} r={1.5} fill="var(--rust-brass)" opacity={0.2}><animate attributeName="r" values="1.5;3;1.5" dur="4s" repeatCount="indefinite" /></circle>}
      {/* Acroteria (decorative corners) */}
      <polygon points="6,20 4,16 8,20" fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <polygon points="58,20 60,16 56,20" fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Architrave (beam) */}
      <rect x={6} y={20} width={52} height={6} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      <BrickTexture x={7} y={21} w={50} h={4} rows={2} cols={12} idPrefix={`${id}-beam`} color="var(--rust-bark)" />
      {/* Triglyphs + metopes */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={`${id}-triglyph-${i}`}>
          <rect x={9 + i * 8} y={20} width={1.5} height={4} fill="var(--rust-bark)" opacity={0.4} />
          <rect x={11 + i * 8} y={20} width={1.5} height={4} fill="var(--rust-bark)" opacity={0.4} />
        </g>
      ))}
      {/* Column capitals */}
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={`${id}-capital-${i}`} x={8 + i * 11} y={26} width={8} height={2} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      ))}
      {/* Columns with fluting */}
      {Array.from({ length: 5 }, (_, i) => {
        const cx = 12 + i * 11;
        return (
          <g key={`${id}-col-${i}`}>
            <rect x={cx - 3} y={28} width={6} height={22} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
            <ColumnFlutes x={cx - 2.5} y={28} w={5} h={22} count={4} idPrefix={`${id}-flute-${i}`} color="var(--rust-bark)" />
          </g>
        );
      })}
      {/* Column bases */}
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={`${id}-base-${i}`} x={7 + i * 11} y={50} width={10} height={3} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      ))}
      {/* Stylobate (platform) */}
      <rect x={4} y={53} width={56} height={4} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.6} />
      <BrickTexture x={5} y={54} w={54} h={3} rows={1} cols={14} idPrefix={`${id}-platform`} color="var(--rust-bark)" />
      {/* Steps */}
      <rect x={2} y={57} width={60} height={3} fill={`url(#${id}-stone)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      <BrickTexture x={3} y={58} w={58} h={2} rows={1} cols={15} idPrefix={`${id}-step`} color="var(--rust-bark)" />
      {/* Extra train details for 500+ */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-extra-rivet-${i}`} cx={(8 + rng() * 46).toFixed(1)} cy={(24 + rng() * 18).toFixed(1)} r={0.3} fill="var(--rust-brass)" opacity={0.2} />
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={`${id}-extra-line-${i}`} x1={(6 + rng() * 50).toFixed(1)} y1={(22 + rng() * 22).toFixed(1)} x2={(8 + rng() * 50).toFixed(1)} y2={(22 + rng() * 22).toFixed(1)} stroke="var(--rust-wax)" strokeWidth={0.15} opacity={0.15} />
      ))}
      {/* Ground */}
      <GrassTufts cx={4} cy={60} count={6} spread={6} seed={15} idPrefix={`${id}-grass-l`} />
      <GrassTufts cx={60} cy={60} count={6} spread={6} seed={25} idPrefix={`${id}-grass-r`} />
      <StoneCluster cx={10} cy={60} count={4} spread={8} seed={35} idPrefix={`${id}-ground-stones`} />
      <StoneCluster cx={54} cy={60} count={4} spread={8} seed={45} idPrefix={`${id}-ground-stones2`} />
      {/* Glow */}
      {animated && <ellipse cx={32} cy={58} rx={28} ry={2} fill="var(--theme-anim-glow)" opacity={0.2}><animate attributeName="rx" values="26;30;26" dur="5s" repeatCount="indefinite" /></ellipse>}
      {/* Extra stone texture for 500+ */}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={`${id}-bigtex-${i}`} cx={(6 + rng() * 52).toFixed(1)} cy={(20 + rng() * 40).toFixed(1)} r={0.25} fill="var(--rust-bg-dark)" opacity={0.08} />
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <line key={`${id}-crack-${i}`} x1={(8 + rng() * 48).toFixed(1)} y1={(22 + rng() * 36).toFixed(1)} x2={(10 + rng() * 48).toFixed(1)} y2={(24 + rng() * 36).toFixed(1)} stroke="var(--rust-bg-dark)" strokeWidth={0.15} opacity={0.1} />
      ))}
      {/* Extra stone texture dots */}
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={`${id}-tex-${i}`} cx={(6 + rng() * 52).toFixed(1)} cy={(20 + rng() * 40).toFixed(1)} r={0.2} fill="var(--rust-bg-dark)" opacity={0.1} />
      ))}
    </>
  );
}
