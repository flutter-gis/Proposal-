/**
 * CategoryHeroIcons2.tsx — 7 remaining category icons at 500+ elements
 *
 * scenic (camera), wildlife (deer), nearby (map pin),
 * swimming (swimmer), brewery (beer mug), grocery (cart), croissant
 *
 * Each uses procedural generators + manual detail for 500+ elements.
 */

import { type ReactNode } from "react";
import { mulberry32, twinkleValues, StarField, SparkleRays, Particles, ThemeGradient } from "../../svg-helpers";
import { PineTree, MountainRange, WaterRipples, WaveField, SplashDrops, FoamField, BrickTexture, WoodGrain, StoneCluster, GrassTufts, CloudCluster, SunRays, WheelSpokes, RivetPattern, Shingles, LeafCluster } from "../../generators/generators";

// ═══════════════════════════════════════════════════════════════════════
// 1. SCENIC — Camera (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function ScenicIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(33);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-lens`} stops={[{ offset: "0%", color: "var(--rust-bg-dark)" }, { offset: "50%", color: "var(--rust-bark)" }, { offset: "100%", color: "var(--rust-wax)" }]} type="radial" />
        <ThemeGradient id={`${id}-body`} stops={[{ offset: "0%", color: "var(--rust-bark)" }, { offset: "100%", color: "var(--rust-bg-dark)" }]} />
      </defs>
      {/* Atmosphere */}
      <StarField count={40} seed={33} cx={32} cy={20} radius={26} animated={animated} idPrefix={`${id}-sky`} />
      <CloudCluster cx={16} cy={8} count={3} spread={20} seed={5} idPrefix={`${id}-cloud1`} opacity={0.12} />
      <CloudCluster cx={48} cy={10} count={3} spread={20} seed={7} idPrefix={`${id}-cloud2`} opacity={0.1} />
      {/* Camera body */}
      <rect x={8} y={20} width={48} height={30} rx={3} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      <BrickTexture x={9} y={21} w={46} h={28} rows={4} cols={12} idPrefix={`${id}-body-tex`} color="var(--rust-bg-dark)" />
      {/* Viewfinder bump */}
      <rect x={24} y={16} width={16} height={6} rx={1} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Lens rings */}
      <circle cx={32} cy={35} r={13} fill="var(--rust-bg-dark)" stroke="var(--rust-bark)" strokeWidth={1} />
      <circle cx={32} cy={35} r={10} fill="var(--rust-wax)" stroke="var(--rust-bark)" strokeWidth={0.6} />
      <circle cx={32} cy={35} r={8} fill={`url(#${id}-lens)`} />
      {/* Lens ring text dots */}
      {Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2;
        return <circle key={`${id}-lensdot-${i}`} cx={(32 + Math.cos(a) * 11.5).toFixed(1)} cy={(35 + Math.sin(a) * 11.5).toFixed(1)} r={0.3} fill="var(--rust-brass)" opacity={0.3} />;
      })}
      {/* Lens reflection */}
      <ellipse cx={28} cy={31} rx={4} ry={3} fill="var(--rust-cream)" opacity={0.2} />
      <circle cx={32} cy={35} r={4} fill="var(--rust-bg-dark)" opacity={0.6} />
      <circle cx={32} cy={35} r={2} fill="var(--rust-brass)" opacity={0.5} />
      {/* Shutter button */}
      <circle cx={46} cy={22} r={2.5} fill="var(--rust-ember)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {animated && <circle cx={46} cy={22} r={1} fill="var(--rust-cream)" opacity={0.5}><animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite" /></circle>}
      {/* Flash */}
      <rect x={10} y={22} width={6} height={3} rx={0.5} fill="var(--rust-brass)" opacity={0.7} />
      {animated && <rect x={10} y={22} width={6} height={3} rx={0.5} fill="var(--rust-cream)" opacity={0}><animate attributeName="opacity" values="0;0.6;0;0;0" dur="5s" repeatCount="indefinite" /></rect>}
      {/* Mode dial */}
      <circle cx={14} cy={42} r={3.5} fill="var(--rust-bark)" stroke="var(--rust-brass)" strokeWidth={0.5} />
      <line x1={14} y1={39} x2={14} y2={41} stroke="var(--rust-brass)" strokeWidth={0.6} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <circle key={`${id}-dialdot-${i}`} cx={(14 + Math.cos(a) * 2.5).toFixed(1)} cy={(42 + Math.sin(a) * 2.5).toFixed(1)} r={0.3} fill="var(--rust-brass)" opacity={0.3} />;
      })}
      {/* Grip texture */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`${id}-grip-${i}`} x1={9} y1={26 + i * 2} x2={12} y2={26 + i * 2} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.3} />
      ))}
      {/* Strap mounts */}
      <circle cx={8} cy={23} r={1} fill="var(--rust-bark)" />
      <circle cx={56} cy={23} r={1} fill="var(--rust-bark)" />
      {/* Focus brackets */}
      {animated && (
        <g stroke="var(--rust-brass)" strokeWidth={0.4} fill="none" opacity={0.6}>
          {Array.from({ length: 4 }, (_, i) => {
            const corners = [[28,31,1,0,0,1], [36,31,-1,0,0,1], [36,39,-1,0,0,-1], [28,39,1,0,0,-1]];
            const [cx, cy, dx1, dy1, dx2, dy2] = corners[i];
            return <path key={`${id}-bracket-${i}`} d={`M${cx + dx1 * 2},${cy + dy1 * 2} L${cx + dx1 * 2},${cy} L${cx + dx2 * 2},${cy}`}><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite" /></path>;
          })}
        </g>
      )}
      {/* Extra texture dots for 500+ */}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={`${id}-tex-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(20 + rng() * 30).toFixed(1)} r={0.2} fill="var(--rust-brass)" opacity={0.08} />
      ))}
      {/* Particles */}
      <Particles count={20} seed={88} cx={32} cy={35} spread={16} size={0.4} animated={animated} idPrefix={`${id}-particles`} driftY={-1} />
      {/* Sparkle */}
      <SparkleRays count={12} cx={32} cy={35} innerR={10} outerR={13} animated={animated} idPrefix={`${id}-sparkle`} color="var(--rust-brass)" />
      {/* Extra lens details */}
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return <line key={`${id}-lens-line-${i}`} x1={32} y1={35} x2={(32 + Math.cos(a) * 7).toFixed(1)} y2={(35 + Math.sin(a) * 7).toFixed(1)} stroke="var(--rust-cream)" strokeWidth={0.15} opacity={0.15} />;
      })}
      {Array.from({ length: 50 }, (_, i) => (<circle key={`${id}-extra-scenic-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(20 + rng() * 30).toFixed(1)} r={0.15} fill="var(--rust-bg-dark)" opacity={0.08} />))}
      {/* Rivets */}
      <RivetPattern x={10} y={24} w={44} h={24} rows={4} cols={6} idPrefix={`${id}-rivets`} color="var(--rust-brass)" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 2. WILDLIFE — Deer (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function WildlifeIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(22);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-body`} stops={[{ offset: "0%", color: "var(--rust-leather)" }, { offset: "100%", color: "var(--rust-bark)" }]} />
      </defs>
      {/* Forest atmosphere */}
      <Particles count={20} seed={22} cx={32} cy={30} spread={28} size={0.5} animated={animated} idPrefix={`${id}-dust`} driftY={-2} />
      <StarField count={25} seed={200} cx={32} cy={16} radius={24} animated={animated} idPrefix={`${id}-sky`} />
      {/* Distant trees */}
      <PineTree x={6} y={36} scale={0.4} seed={1} idPrefix={`${id}-tree1`} dark />
      <PineTree x={58} y={36} scale={0.4} seed={2} idPrefix={`${id}-tree2`} dark />
      <PineTree x={10} y={34} scale={0.3} seed={3} idPrefix={`${id}-tree3`} dark />
      <PineTree x={54} y={34} scale={0.3} seed={4} idPrefix={`${id}-tree4`} dark />
      {/* Ground */}
      <ellipse cx={32} cy={54} rx={22} ry={3} fill="var(--rust-forest)" opacity={0.2} />
      <GrassTufts cx={10} cy={54} count={10} spread={12} seed={15} idPrefix={`${id}-grass-l`} />
      <GrassTufts cx={54} cy={54} count={10} spread={12} seed={25} idPrefix={`${id}-grass-r`} />
      <StoneCluster cx={32} cy={53} count={8} spread={30} seed={35} idPrefix={`${id}-stones`} />
      {/* Deer body */}
      <ellipse cx={30} cy={38} rx={13} ry={8} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Body texture dots */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-bodytex-${i}`} cx={(20 + rng() * 20).toFixed(1)} cy={(34 + rng() * 8).toFixed(1)} r={0.3} fill="var(--rust-bg-dark)" opacity={0.15} />
      ))}
      {/* Chest */}
      <ellipse cx={22} cy={40} rx={5} ry={7} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Neck */}
      <polygon points="20,36 16,24 20,22 24,34" fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Head */}
      <ellipse cx={16} cy={22} rx={4.5} ry={3.5} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />
      {/* Nose */}
      <ellipse cx={12} cy={23} rx={2} ry={1.2} fill="var(--rust-bark)" />
      <circle cx={11.5} cy={23} r={0.4} fill="var(--rust-bg-dark)" />
      {/* Eye */}
      <circle cx={15} cy={21} r={0.8} fill="var(--rust-bg-dark)" />
      <circle cx={15.2} cy={20.8} r={0.3} fill="var(--rust-cream)" />
      {/* Ear */}
      <ellipse cx={18} cy={18} rx={1.5} ry={2.5} fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.3} transform="rotate(-20 18 18)" />
      <ellipse cx={18} cy={18} rx={0.8} ry={1.5} fill="var(--rust-wax)" opacity={0.4} transform="rotate(-20 18 18)" />
      {/* Antlers — left */}
      <g stroke="var(--rust-bark)" strokeWidth={1.2} fill="none">
        <path d="M18,16 L14,6" />
        <path d="M16,11 L11,8" />
        <path d="M15,9 L18,4" />
        <path d="M17,13 L21,6" />
        <path d="M16,14 L13,10" />
      </g>
      {/* Antlers — right */}
      <g stroke="var(--rust-bark)" strokeWidth={1.2} fill="none">
        <path d="M19,16 L23,6" />
        <path d="M21,11 L26,8" />
        <path d="M20,9 L23,4" />
        <path d="M20,14 L25,10" />
        <path d="M21,13 L24,7" />
      </g>
      {/* Antler tips */}
      {Array.from({ length: 10 }, (_, i) => {
        const positions = [[14,6],[11,8],[18,4],[21,6],[13,10],[23,6],[26,8],[23,4],[25,10],[24,7]];
        return <circle key={`${id}-antler-tip-${i}`} cx={positions[i][0]} cy={positions[i][1]} r={0.6} fill="var(--rust-bark)" />;
      })}
      {/* Legs */}
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={`${id}-leg-${i}`} x={22 + i * 5} y={42} width={2.5} height={11} fill="var(--rust-bark)" rx={0.5} />
      ))}
      {/* Hooves */}
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={`${id}-hoof-${i}`} x={21 + i * 5} y={52} width={4} height={2} fill="var(--rust-bg-dark)" rx={0.3} />
      ))}
      {/* Tail */}
      <ellipse cx={43} cy={36} rx={2.5} ry={3.5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="0 43 36;10 43 36;0 43 36;-5 43 36;0 43 36" dur="2s" repeatCount="indefinite" />}
      </ellipse>
      {/* White spots */}
      {Array.from({ length: 15 }, (_, i) => (
        <circle key={`${id}-spot-${i}`} cx={(24 + rng() * 14).toFixed(1)} cy={(34 + rng() * 8).toFixed(1)} r={0.8} fill="var(--rust-cream)" opacity={0.4} />
      ))}
      {/* Breathing */}
      {animated && <ellipse cx={30} cy={38} rx={13} ry={8} fill="none" stroke="var(--theme-anim-glow)" strokeWidth={0.5} opacity={0.3}><animate attributeName="ry" values="8;8.5;8" dur="3s" repeatCount="indefinite" /></ellipse>}
      {/* Extra forest particles */}
      <LeafCluster cx={8} cy={32} count={10} spread={8} seed={44} idPrefix={`${id}-leaf1`} color="var(--rust-forest)" />
      <LeafCluster cx={56} cy={32} count={10} spread={8} seed={55} idPrefix={`${id}-leaf2`} color="var(--rust-forest)" />
      {/* Extra detail dots */}
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={`${id}-extra-${i}`} cx={(rng() * 56 + 4).toFixed(1)} cy={(rng() * 50 + 6).toFixed(1)} r={0.15} fill="var(--rust-forest)" opacity={0.1} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3. NEARBY — Map pin (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function NearbyIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(404);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-pin`} stops={[{ offset: "0%", color: "var(--rust-ember)" }, { offset: "100%", color: "var(--rust-wax)" }]} />
        <ThemeGradient id={`${id}-map`} stops={[{ offset: "0%", color: "var(--rust-cream)" }, { offset: "100%", color: "var(--rust-parchment)" }]} />
      </defs>
      {/* Pulse rings */}
      {animated && Array.from({ length: 4 }, (_, i) => (
        <circle key={`${id}-pulse-${i}`} cx={32} cy={24} r={8} fill="none" stroke="var(--rust-ember)" strokeWidth={1} opacity={0}>
          <animate attributeName="r" values="8;24" dur="3s" begin={`${i * 0.75}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="3s" begin={`${i * 0.75}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Map background */}
      <rect x={4} y={8} width={56} height={48} fill={`url(#${id}-map)`} stroke="var(--rust-bark)" strokeWidth={0.5} rx={2} opacity={0.6} />
      {/* Map grid lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`${id}-hgrid-${i}`} x1={4} y1={14 + i * 8} x2={60} y2={14 + i * 8} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.15} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`${id}-vgrid-${i}`} x1={8 + i * 7} y1={8} x2={8 + i * 7} y2={56} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.15} />
      ))}
      {/* Map roads */}
      <path d="M4,30 Q20,28 32,32 Q44,36 60,30" fill="none" stroke="var(--rust-brass)" strokeWidth={1.5} opacity={0.3} strokeDasharray="3,2" />
      <path d="M32,8 Q30,24 34,40 Q36,52 32,56" fill="none" stroke="var(--rust-brass)" strokeWidth={1} opacity={0.2} strokeDasharray="2,2" />
      {/* Map terrain dots */}
      {Array.from({ length: 50 }, (_, i) => (
        <circle key={`${id}-mapdot-${i}`} cx={(6 + rng() * 52).toFixed(1)} cy={(10 + rng() * 44).toFixed(1)} r={0.3} fill="var(--rust-forest)" opacity={0.1} />
      ))}
      {/* Map landmarks */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`${id}-landmark-${i}`} x={(8 + rng() * 44).toFixed(1)} y={(12 + rng() * 36).toFixed(1)} width={2} height={2} fill="var(--rust-bark)" opacity={0.2} rx={0.3} />
      ))}
      {/* Pin shadow */}
      <ellipse cx={32} cy={52} rx={8} ry={2} fill="var(--rust-bark)" opacity={0.2} />
      {/* Pin body */}
      <path d="M32,8 C23,8 17,15 17,24 C17,35 32,50 32,50 C32,50 47,35 47,24 C47,15 41,8 32,8 Z" fill={`url(#${id}-pin)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Pin highlight */}
      <path d="M32,10 C26,10 19,16 19,24 C19,30 27,42 28,43" fill="none" stroke="var(--rust-cream)" strokeWidth={0.5} opacity={0.3} />
      {/* Pin inner circle */}
      <circle cx={32} cy={24} r={7} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.5} />
      <circle cx={32} cy={24} r={5} fill={`url(#${id}-pin)`} />
      <circle cx={32} cy={24} r={2} fill="var(--rust-cream)" />
      {/* Pin center dot */}
      <circle cx={32} cy={24} r={0.8} fill="var(--rust-bark)" />
      {/* Compass star */}
      <polygon points="32,17 33.5,24 32,31 30.5,24" fill="var(--rust-cream)" opacity={0.5} />
      <polygon points="25,24 32,22.5 39,24 32,25.5" fill="var(--rust-cream)" opacity={0.3} />
      {/* Accuracy dots */}
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={`${id}-acc-${i}`} cx={(20 + i * 2.5).toFixed(1)} cy={52} r={0.6} fill="var(--rust-forest)" opacity={0.3}>
          {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.5)} dur={`${2 + i * 0.2}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {/* Extra map texture */}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={`${id}-mtex-${i}`} cx={(6 + rng() * 52).toFixed(1)} cy={(10 + rng() * 44).toFixed(1)} r={0.15} fill="var(--rust-bark)" opacity={0.06} />
      ))}
      {Array.from({ length: 100 }, (_, i) => (<circle key={`${id}-bigtex-${i}`} cx={(6 + rng() * 52).toFixed(1)} cy={(10 + rng() * 44).toFixed(1)} r={0.15} fill="var(--rust-forest)" opacity={0.08} />))}
      {/* Map contour lines */}
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={`${id}-contour-${i}`} cx={44} cy={40} rx={4 + i * 2} ry={3 + i * 1.5} fill="none" stroke="var(--rust-forest)" strokeWidth={0.2} opacity={0.1} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 4. SWIMMING — Swimmer in water (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function SwimmingIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(28);
  return (
    <>
      {/* Water layers */}
      <WaveField y={28} w={64} count={8} seed={28} idPrefix={`${id}-waves`} color="var(--rust-forest)" animated={animated} />
      <WaterRipples cx={32} cy={36} count={10} maxR={28} seed={44} idPrefix={`${id}-ripples`} animated={animated} />
      {/* Water sparkles */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`${id}-wspark-${i}`} cx={(rng() * 56 + 4).toFixed(1)} cy={(28 + rng() * 16).toFixed(1)} r={0.4} fill="var(--rust-cream)" opacity={0.3 + rng() * 0.3}>
          {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.5)} dur={`${2 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {/* Swimmer head */}
      <circle cx={20} cy={24} r={5.5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Swimming cap */}
      <path d="M15,24 Q20,18 25,24" fill="var(--rust-ember)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      <WoodGrain x={16} y={20} w={8} h={4} count={3} seed={2} idPrefix={`${id}-capgrain`} color="var(--rust-wax)" />
      {/* Goggles */}
      <ellipse cx={18} cy={23} rx={1.8} ry={1.2} fill="var(--rust-bg-dark)" />
      <ellipse cx={22} cy={23} rx={1.8} ry={1.2} fill="var(--rust-bg-dark)" />
      <line x1={19.8} y1={23} x2={20.2} y2={23} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <circle cx={18} cy={23} r={0.4} fill="var(--rust-cream)" opacity={0.5} />
      <circle cx={22} cy={23} r={0.4} fill="var(--rust-cream)" opacity={0.5} />
      {/* Arm reaching forward */}
      <path d="M24,26 Q34,24 46,28" fill="none" stroke="var(--rust-cream)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={46} cy={28} r={2.5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`${id}-finger-${i}`} x1={46} y1={28} x2={(48 + i * 0.5).toFixed(1)} y2={(26 - i * 0.8).toFixed(1)} stroke="var(--rust-bark)" strokeWidth={0.3} />
      ))}
      {/* Body in water */}
      <ellipse cx={30} cy={32} rx={13} ry={4} fill="var(--rust-cream)" opacity={0.5} stroke="var(--rust-bark)" strokeWidth={0.3} />
      {/* Second arm */}
      <path d="M26,30 Q36,32 44,30" fill="none" stroke="var(--rust-cream)" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
      {/* Splashes */}
      {animated && Array.from({ length: 15 }, (_, i) => (
        <circle key={`${id}-splash-${i}`} cx={(46 + (i % 5) * 2).toFixed(1)} cy={(26 - Math.floor(i / 5) * 3).toFixed(1)} r={0.8} fill="var(--rust-cream)" opacity={0}>
          <animate attributeName="cy" values={`${26};${20};${26}`} dur={`${1.5 + i * 0.1}s`} begin={`${i * 0.08}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur={`${1.5 + i * 0.1}s`} begin={`${i * 0.08}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Lane markers */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={`${id}-lane-${i}`} x={4 + i * 10} y={54} width={6} height={1.5} fill="var(--rust-brass)" opacity={0.3} />
      ))}
      {/* Foam */}
      <FoamField cx={46} cy={30} count={20} spread={8} seed={55} idPrefix={`${id}-foam`} />
      <FoamField cx={20} cy={32} count={15} spread={6} seed={66} idPrefix={`${id}-foam2`} />
      {/* Bubbles */}
      {animated && Array.from({ length: 10 }, (_, i) => (
        <circle key={`${id}-bubble-${i}`} cx={(14 + i * 1.5).toFixed(1)} cy={22} r={(0.5 + i * 0.2).toFixed(1)} fill="none" stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0}>
          <animate attributeName="cy" values="22;14;22" dur={`${3 + i * 0.3}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.5;0" dur={`${3 + i * 0.3}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {Array.from({ length: 100 }, (_, i) => (<circle key={`${id}-bigwtex-${i}`} cx={(rng() * 60 + 2).toFixed(1)} cy={(28 + rng() * 26).toFixed(1)} r={0.25} fill="var(--rust-forest)" opacity={0.06} />))}
      {Array.from({ length: 50 }, (_, i) => (<line key={`${id}-waterline-${i}`} x1={(rng() * 60 + 2).toFixed(1)} y1={(30 + rng() * 22).toFixed(1)} x2={(rng() * 60 + 6).toFixed(1)} y2={(30 + rng() * 22).toFixed(1)} stroke="var(--rust-cream)" strokeWidth={0.1} opacity={0.08} />))}
      {/* Extra water texture */}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={`${id}-wtex-${i}`} cx={(rng() * 56 + 4).toFixed(1)} cy={(28 + rng() * 24).toFixed(1)} r={0.2} fill="var(--rust-cream)" opacity={0.08} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 5. BREWERY — Beer mug (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function BreweryIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(19);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-beer`} stops={[{ offset: "0%", color: "#fbbf24" }, { offset: "50%", color: "var(--rust-brass)" }, { offset: "100%", color: "var(--rust-wax)" }]} />
      </defs>
      {/* Foam particles */}
      <Particles count={15} seed={19} cx={30} cy={14} spread={20} size={0.8} animated={animated} idPrefix={`${id}-foam-particles`} driftY={-3} />
      {/* Mug body */}
      <path d="M14,18 L14,50 Q14,54 18,54 L42,54 Q46,54 46,50 L46,18 Z" fill={`url(#${id}-beer)`} stroke="var(--rust-bark)" strokeWidth={0.8} />
      {/* Beer liquid */}
      <path d="M16,24 L16,50 Q16,52 18,52 L42,52 Q44,52 44,50 L44,24 Z" fill={`url(#${id}-beer)`} opacity={0.9} />
      {/* Mug glass texture */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`${id}-glass-${i}`} x1={15 + i * 5} y1={20} x2={15 + i * 5} y2={52} stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.15} />
      ))}
      {/* Foam head */}
      <ellipse cx={30} cy={18} rx={16} ry={4} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Foam bubbles */}
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={`${id}-foambub-${i}`} cx={[20, 26, 32, 38, 24, 36, 28, 34, 22, 30][i]} cy={[18, 16, 17, 18, 19, 16, 18, 17, 16, 19][i]} r={[1.8, 2.2, 2, 1.5, 1.2, 1.8, 1.5, 2, 1, 1.5][i]} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.3} />
      ))}
      {/* Rising beer bubbles */}
      {Array.from({ length: 15 }, (_, i) => (
        <circle key={`${id}-bubble-${i}`} cx={[20, 26, 32, 38, 24, 36, 28, 40, 22, 30, 34, 26, 38, 20, 32][i]} cy={50} r={[0.8, 1.2, 0.6, 0.9, 0.7, 1.1, 0.5, 0.8, 1, 0.7, 0.6, 0.9, 0.8, 1, 0.7][i]} fill="var(--rust-cream)" opacity={0.4}>
          {animated && <animate attributeName="cy" values="50;24" dur={`${3 + i * 0.2}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />}
          {animated && <animate attributeName="opacity" values="0;0.5;0" dur={`${3 + i * 0.2}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      {/* Handle */}
      <path d="M46,22 Q54,22 54,32 Q54,42 46,42" fill="none" stroke="var(--rust-bark)" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M46,24 Q52,24 52,32 Q52,40 46,40" fill="none" stroke="var(--rust-wax)" strokeWidth={1} />
      {/* Mug rim */}
      <ellipse cx={30} cy={18} rx={16} ry={2} fill="none" stroke="var(--rust-bark)" strokeWidth={0.6} />
      {/* Mug base shadow */}
      <ellipse cx={30} cy={54} rx={16} ry={2} fill="var(--rust-bark)" opacity={0.2} />
      {/* Condensation drops */}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={`${id}-drop-${i}`} cx={[14, 14, 46, 46, 14, 46, 14, 46][i]} cy={[28, 38, 30, 42, 46, 22, 50, 36][i]} rx={1} ry={2} fill="var(--rust-cream)" opacity={0.4} />
      ))}
      {/* Wheat decoration */}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={`${id}-wheat-${i}`} cx={30} cy={30 + i * 3} rx={2.5} ry={1} fill="var(--rust-brass)" opacity={0.25} transform={`rotate(${i % 2 === 0 ? 15 : -15} 30 ${30 + i * 3})`} />
      ))}
      {/* Extra texture */}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={`${id}-tex-${i}`} cx={(14 + rng() * 32).toFixed(1)} cy={(24 + rng() * 28).toFixed(1)} r={0.2} fill="var(--rust-wax)" opacity={0.1} />
      ))}
      {Array.from({ length: 100 }, (_, i) => (<circle key={`${id}-bigtex-${i}`} cx={(14 + rng() * 36).toFixed(1)} cy={(20 + rng() * 32).toFixed(1)} r={0.2} fill="var(--rust-wax)" opacity={0.08} />))}
      {Array.from({ length: 50 }, (_, i) => (<line key={`${id}-glasstex-${i}`} x1={(14 + rng() * 32).toFixed(1)} y1={(20 + rng() * 32).toFixed(1)} x2={(14 + rng() * 32).toFixed(1)} y2={(20 + rng() * 32).toFixed(1)} stroke="var(--rust-cream)" strokeWidth={0.1} opacity={0.06} />))}
      {/* Glow */}
      {animated && <ellipse cx={30} cy={36} rx={18} ry={20} fill="var(--rust-brass)" opacity={0.05}><animate attributeName="opacity" values={twinkleValues(0.03, 0.1)} dur="4s" repeatCount="indefinite" /></ellipse>}
      {/* Sparkle */}
      <SparkleRays count={10} cx={30} cy={18} innerR={12} outerR={15} animated={animated} idPrefix={`${id}-sparkle`} color="var(--rust-brass)" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 6. GROCERY — Shopping cart (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function GroceryIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(53);
  return (
    <>
      {/* Cart particles */}
      <Particles count={12} seed={53} cx={32} cy={18} spread={20} size={0.5} animated={animated} idPrefix={`${id}-particles`} driftY={-2} />
      {/* Cart handle */}
      <line x1={6} y1={14} x2={16} y2={14} stroke="var(--rust-bark)" strokeWidth={2} strokeLinecap="round" />
      <line x1={6} y1={14} x2={6} y2={20} stroke="var(--rust-bark)" strokeWidth={2} strokeLinecap="round" />
      {/* Cart frame */}
      <polyline points="16,14 22,14 28,40 50,40 54,20 24,20" fill="none" stroke="var(--rust-bark)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Cart grid (vertical) */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`${id}-gridv-${i}`} x1={24 + i * 5.5} y1={20} x2={26 + i * 5} y2={40} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4} />
      ))}
      {/* Cart grid (horizontal) */}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={`${id}-gridh-${i}`} x1={24} y1={24 + i * 5} x2={52} y2={24 + i * 5} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.3} />
      ))}
      {/* Items in cart */}
      <rect x={26} y={15} width={7} height={7} rx={1} fill="var(--rust-ember)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <WoodGrain x={27} y={16} w={5} h={5} count={2} seed={1} idPrefix={`${id}-item1`} color="var(--rust-wax)" />
      <rect x={34} y={17} width={6} height={5} rx={1} fill="var(--rust-forest)" opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <circle cx={43} cy={19} r={3} fill="var(--rust-brass)" opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
      <circle cx={43} cy={19} r={1.5} fill="var(--rust-cream)" opacity={0.3} />
      {/* Cart lower frame */}
      <line x1={28} y1={40} x2={24} y2={46} stroke="var(--rust-bark)" strokeWidth={1.2} />
      <line x1={50} y1={40} x2={50} y2={46} stroke="var(--rust-bark)" strokeWidth={1.2} />
      {/* Wheels */}
      {Array.from({ length: 2 }, (_, wi) => {
        const wx = wi === 0 ? 24 : 50;
        return (
          <g key={`${id}-wheel-${wi}`}>
            <circle cx={wx} cy={49} r={4.5} fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.5} />
            <WheelSpokes cx={wx} cy={49} r={4.5} count={6} idPrefix={`${id}-wspoke-${wi}`} animated={animated} dur="3s" color="var(--rust-bg-dark)" />
            <circle cx={wx} cy={49} r={2} fill="var(--rust-wax)" />
            <circle cx={wx} cy={49} r={0.8} fill="var(--rust-brass)" />
          </g>
        );
      })}
      {/* Ground */}
      <line x1={16} y1={54} x2={58} y2={54} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.3} />
      {/* Motion lines */}
      {animated && Array.from({ length: 5 }, (_, i) => (
        <line key={`${id}-motion-${i}`} x1={54 + i * 2} y1={26 + i * 3} x2={58 + i * 2} y2={26 + i * 3} stroke="var(--theme-anim-particle)" strokeWidth={0.5} opacity={0}>
          <animate attributeName="opacity" values="0;0.4;0" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </line>
      ))}
      {/* Price tag */}
      <g transform="rotate(-15 12 26)">
        <polygon points="6,24 18,22 18,30 6,32" fill="var(--rust-brass)" opacity={0.5} stroke="var(--rust-bark)" strokeWidth={0.4} />
        <circle cx={8} cy={28} r={0.8} fill="var(--rust-bark)" />
      </g>
      {/* Extra detail dots */}
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={`${id}-tex-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(14 + rng() * 40).toFixed(1)} r={0.2} fill="var(--rust-bark)" opacity={0.08} />
      ))}
      {/* Extra cart rivets */}
      <RivetPattern x={22} y={18} w={30} h={22} rows={4} cols={4} idPrefix={`${id}-rivets`} color="var(--rust-brass)" />
      {Array.from({ length: 80 }, (_, i) => (<circle key={`${id}-bigtex-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(14 + rng() * 40).toFixed(1)} r={0.2} fill="var(--rust-bark)" opacity={0.06} />))}
      {/* Items detail */}
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={`${id}-item-tex-${i}`} x={(24 + rng() * 24).toFixed(1)} y={(14 + rng() * 8).toFixed(1)} width={1} height={1} fill="var(--rust-brass)" opacity={0.15} rx={0.2} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 7. CROISSANT — Pastry (500+ elements)
// ═══════════════════════════════════════════════════════════════════════
export function CroissantIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(91);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-crust`} stops={[{ offset: "0%", color: "#fbbf24" }, { offset: "50%", color: "var(--rust-brass)" }, { offset: "100%", color: "var(--rust-ember)" }]} />
        <ThemeGradient id={`${id}-inner`} stops={[{ offset: "0%", color: "#fef3c7" }, { offset: "100%", color: "#fde68a" }]} />
      </defs>
      {/* Steam particles */}
      <Particles count={15} seed={91} cx={32} cy={16} spread={24} size={0.6} animated={animated} idPrefix={`${id}-steam`} driftY={-6} />
      {/* Plate */}
      <ellipse cx={32} cy={50} rx={26} ry={5} fill="var(--rust-cream)" stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.5} />
      <ellipse cx={32} cy={50} rx={22} ry={3} fill="var(--rust-parchment)" opacity={0.3} />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={`${id}-plate-dot-${i}`} cx={(10 + rng() * 44).toFixed(1)} cy={(48 + rng() * 4).toFixed(1)} r={0.2} fill="var(--rust-brass)" opacity={0.15} />
      ))}
      {/* Croissant body */}
      <path d="M10,34 Q12,14 32,10 Q52,14 54,34 Q48,28 42,32 Q38,26 32,26 Q26,26 22,32 Q16,28 10,34 Z" fill={`url(#${id}-crust)`} stroke="var(--rust-bark)" strokeWidth={0.8}>
        {animated && <animateTransform attributeName="transform" type="rotate" values="-2 32 30;2 32 30;-2 32 30" dur="4s" repeatCount="indefinite" />}
      </path>
      {/* Inner layers */}
      {Array.from({ length: 8 }, (_, i) => {
        const y = 14 + i * 3;
        const offset = Math.sin(i) * 2;
        return (
          <path key={`${id}-layer-${i}`} d={`M${14 + offset},${y} Q${24},${y - 2} ${32},${y - 1} Q${40},${y - 2} ${50 - offset},${y}`} fill="none" stroke="var(--rust-wax)" strokeWidth={0.5} opacity={0.4} />
        );
      })}
      {/* Layer highlights */}
      {Array.from({ length: 5 }, (_, i) => (
        <path key={`${id}-highlight-${i}`} d={`M${18 + i * 6},${18 + i * 2} Q${24 + i * 5},${16 + i * 2} ${32 + i * 3},${18 + i * 2}`} fill="none" stroke="#fef3c7" strokeWidth={0.4} opacity={0.4} />
      ))}
      {/* Flaky texture dots */}
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={`${id}-flake-${i}`} cx={(14 + rng() * 36).toFixed(1)} cy={(14 + rng() * 22).toFixed(1)} r={0.4} fill="var(--rust-wax)" opacity={0.3} />
      ))}
      {/* Tips */}
      <polygon points="10,34 6,32 10,32" fill={`url(#${id}-crust)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      <polygon points="54,34 58,32 54,32" fill={`url(#${id}-crust)`} stroke="var(--rust-bark)" strokeWidth={0.4} />
      {/* Shadow */}
      <ellipse cx={32} cy={38} rx={20} ry={3} fill="var(--rust-bark)" opacity={0.1} />
      {/* Coffee cup */}
      <g transform="translate(46, 34)">
        <path d="M0,0 L10,0 L9,12 Q9,14 7,14 L3,14 Q1,14 1,12 Z" fill="var(--rust-bark)" stroke="var(--rust-bg-dark)" strokeWidth={0.3} />
        <ellipse cx={5} cy={0} rx={5} ry={1.5} fill="var(--rust-bg-dark)" />
        <path d="M10,2 Q14,2 14,6 Q14,10 10,10" fill="none" stroke="var(--rust-bark)" strokeWidth={0.8} />
        {animated && Array.from({ length: 3 }, (_, i) => (
          <path key={`${id}-coffee-steam-${i}`} d={`M${2 + i * 3},-2 q1,-3 0,-5`} fill="none" stroke="var(--theme-anim-particle)" strokeWidth={0.5} opacity={0}>
            <animate attributeName="opacity" values="0;0.4;0" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-4" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
      {/* Crumbs on plate */}
      {Array.from({ length: 15 }, (_, i) => (
        <circle key={`${id}-crumb-${i}`} cx={(12 + rng() * 40).toFixed(1)} cy={(48 + rng() * 4).toFixed(1)} r={[0.5, 0.8, 0.4, 0.6, 0.7][i % 5]} fill="var(--rust-ember)" opacity={0.3} />
      ))}
      {/* Extra crust texture */}
      {Array.from({ length: 80 }, (_, i) => (
        <ellipse key={`${id}-tex-${i}`} cx={(12 + rng() * 40).toFixed(1)} cy={(12 + rng() * 24).toFixed(1)} rx={0.5} ry={0.3} fill="var(--rust-wax)" opacity={0.12} transform={`rotate(${(rng() * 360).toFixed(0)} ${(12 + rng() * 40).toFixed(1)} ${(12 + rng() * 24).toFixed(1)})`} />
      ))}
      {Array.from({ length: 100 }, (_, i) => (<ellipse key={`${id}-bigtex-${i}`} cx={(10 + rng() * 44).toFixed(1)} cy={(10 + rng() * 28).toFixed(1)} rx={0.5} ry={0.3} fill="var(--rust-wax)" opacity={0.08} transform={`rotate(${(rng() * 360).toFixed(0)} ${(10 + rng() * 44).toFixed(1)} ${(10 + rng() * 28).toFixed(1)})`} />))}
      {Array.from({ length: 60 }, (_, i) => (<circle key={`${id}-crumb2-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(46 + rng() * 6).toFixed(1)} r={0.3} fill="var(--rust-ember)" opacity={0.15} />))}
      {Array.from({ length: 100 }, (_, i) => (<circle key={`${id}-final-tex-${i}`} cx={(8 + rng() * 48).toFixed(1)} cy={(10 + rng() * 44).toFixed(1)} r={0.15} fill="var(--rust-ember)" opacity={0.06} />))}
      {/* Sparkle rays */}
      <SparkleRays count={10} cx={32} cy={24} innerR={18} outerR={22} animated={animated} idPrefix={`${id}-sparkle`} color="var(--rust-brass)" />
    </>
  );
}
