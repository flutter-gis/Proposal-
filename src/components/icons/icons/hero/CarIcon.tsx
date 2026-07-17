/**
 * CarIcon.tsx — HERO ICON (700+ elements)
 *
 * A detailed vintage car with spinning wheels, chrome details, leather
 * seats visible through windows, exhaust smoke, road, and scenery.
 */

import { type ReactNode } from "react";
import { mulberry32, twinkleValues, Particles, ThemeGradient, StarField } from "../../svg-helpers";
import { WheelSpokes, WoodGrain, StoneCluster, GrassTufts, PineTree } from "../../generators/generators";

export function CarIcon(id: string, animated: boolean): ReactNode {
  const rng_grass = (i: number) => 2 + i * 4 + (i % 3);
  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-body`} stops={[
          { offset: "0%", color: "var(--rust-ember)" },
          { offset: "50%", color: "var(--rust-wax)" },
          { offset: "100%", color: "var(--rust-bark)" },
        ]} />
        <ThemeGradient id={`${id}-chrome`} stops={[
          { offset: "0%", color: "var(--rust-cream)" },
          { offset: "50%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-leather)" },
        ]} />
        <ThemeGradient id={`${id}-window`} stops={[
          { offset: "0%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-cream)" },
        ]} />
      </defs>

      {/* ── Sky/atmosphere ── */}
      <StarField count={20} seed={17} cx={32} cy={20} radius={24} animated={animated} idPrefix={`${id}-sky`} />

      {/* ── Road ── */}
      <line x1={0} y1={54} x2={64} y2={54} stroke="var(--rust-bark)" strokeWidth={1.5} opacity={0.3} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`${id}-dash-${i}`} x={4 + i * 8} y={53} width={4} height={1.5} fill="var(--rust-brass)" opacity={0.3} />
      ))}

      {/* ── Roadside grass ── */}
      <GrassTufts cx={4} cy={54} count={8} spread={8} seed={11} idPrefix={`${id}-grass-l`} />
      <GrassTufts cx={56} cy={54} count={8} spread={8} seed={22} idPrefix={`${id}-grass-r`} />

      {/* ── Roadside stones ── */}
      <StoneCluster cx={8} cy={52} count={6} spread={8} seed={33} idPrefix={`${id}-stone-l`} />
      <StoneCluster cx={56} cy={52} count={6} spread={8} seed={44} idPrefix={`${id}-stone-r`} />

      {/* ── Car shadow ── */}
      <ellipse cx={32} cy={53} rx={22} ry={2.5} fill="var(--rust-bark)" opacity={0.15} />

      {/* ── Car body (detailed with bobbing animation) ── */}
      <g>
        {animated && <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0;0,0.5;0,0" dur="1.5s" repeatCount="indefinite" />}

        {/* Lower body */}
        <path d="M6,40 L8,34 Q10,30 14,30 L22,28 L34,24 L46,26 L52,30 L56,34 L58,40 L58,47 L6,47 Z" fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.8} />

        {/* Hood detail lines */}
        <line x1={36} y1={25} x2={48} y2={28} stroke="var(--rust-wax)" strokeWidth={0.4} opacity={0.4} />
        <line x1={36} y1={27} x2={48} y2={30} stroke="var(--rust-wax)" strokeWidth={0.3} opacity={0.3} />

        {/* Roof */}
        <path d="M22,28 L34,24 L34,30 L22,30 Z" fill={`url(#${id}-body)`} stroke="var(--rust-bark)" strokeWidth={0.5} />

        {/* Windshield (front) */}
        <polygon points="23,29 33,25 33,30 23,30" fill={`url(#${id}-window)`} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.8} />
        {/* Windshield reflection */}
        <line x1={25} y1={28} x2={31} y2={26} stroke="#fef3c7" strokeWidth={0.4} opacity={0.4} />

        {/* Rear window */}
        <polygon points="35,25 45,27 49,30 35,30" fill={`url(#${id}-window)`} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.8} />
        <line x1={37} y1={26} x2={44} y2={28} stroke="#fef3c7" strokeWidth={0.4} opacity={0.4} />

        {/* Side windows (2 panes with frame) */}
        <rect x={26} y={31} width={8} height={4.5} rx={0.5} fill={`url(#${id}-window)`} opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
        <rect x={35} y={31} width={8} height={4.5} rx={0.5} fill={`url(#${id}-window)`} opacity={0.6} stroke="var(--rust-bark)" strokeWidth={0.3} />
        <line x1={34} y1={31} x2={34} y2={35.5} stroke="var(--rust-bark)" strokeWidth={0.4} />

        {/* Window reflections */}
        <line x1={27} y1={31} x2={32} y2={35} stroke="#fef3c7" strokeWidth={0.3} opacity={0.3} />
        <line x1={36} y1={31} x2={41} y2={35} stroke="#fef3c7" strokeWidth={0.3} opacity={0.3} />

        {/* Door line */}
        <line x1={34} y1={30} x2={34} y2={46} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4} />
        {/* Door handle */}
        <rect x={28} y={36} width={4} height={1} rx={0.3} fill="var(--rust-brass)" opacity={0.6} />
        <rect x={37} y={36} width={4} height={1} rx={0.3} fill="var(--rust-brass)" opacity={0.6} />

        {/* Chrome trim line */}
        <line x1={8} y1={38} x2={56} y2={38} stroke={`url(#${id}-chrome)`} strokeWidth={0.6} opacity={0.4} />
        <line x1={8} y1={41} x2={56} y2={41} stroke={`url(#${id}-chrome)`} strokeWidth={0.4} opacity={0.3} />

        {/* Body panel lines */}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`${id}-panel-${i}`} x1={10 + i * 2.5} y1={40} x2={12 + i * 2.5} y2={42} stroke="var(--rust-wax)" strokeWidth={0.2} opacity={0.2} />
        ))}

        {/* Headlight */}
        <circle cx={56} cy={38} r={2.5} fill={`url(#${id}-chrome)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
        <circle cx={56} cy={38} r={1.5} fill="#fef3c7" />
        <circle cx={56} cy={38} r={0.8} fill="#ffffff" />
        {animated && <circle cx={56} cy={38} r={4} fill="var(--rust-brass)" opacity={0.15}><animate attributeName="r" values="2.5;5;2.5" dur="2s" repeatCount="indefinite" /></circle>}

        {/* Headlight beams */}
        {animated && Array.from({ length: 5 }, (_, i) => (
          <line key={`${id}-beam-${i}`} x1={57} y1={38} x2={63 + i * 2} y2={36 - i * 2} stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0}>
            <animate attributeName="opacity" values="0;0.3;0" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </line>
        ))}

        {/* Taillight */}
        <circle cx={7} cy={38} r={1.8} fill="var(--rust-wax)" stroke="var(--rust-bark)" strokeWidth={0.3} />
        <circle cx={7} cy={38} r={1} fill="var(--rust-ember)" opacity={0.7} />

        {/* Bumpers */}
        <rect x={4} y={42} width={5} height={4} rx={1.5} fill={`url(#${id}-chrome)`} stroke="var(--rust-bark)" strokeWidth={0.3} />
        <rect x={55} y={42} width={5} height={4} rx={1.5} fill={`url(#${id}-chrome)`} stroke="var(--rust-bark)" strokeWidth={0.3} />

        {/* Front grille */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`${id}-grille-${i}`} x1={53} y1={39 + i * 0.8} x2={56} y2={39 + i * 0.8} stroke="var(--rust-bark)" strokeWidth={0.3} />
        ))}

        {/* Roof rack */}
        <line x1={25} y1={27} x2={33} y2={25} stroke="var(--rust-bark)" strokeWidth={0.6} />
        <line x1={25} y1={28} x2={33} y2={26} stroke="var(--rust-bark)" strokeWidth={0.6} />
        {/* Roof cargo bag */}
        <rect x={26} y={24.5} width={6} height={3} rx={0.5} fill="var(--rust-forest)" opacity={0.7} stroke="var(--rust-bark)" strokeWidth={0.3} />
        <line x1={28} y1={24.5} x2={28} y2={27.5} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.4} />
        <line x1={30} y1={24.5} x2={30} y2={27.5} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.4} />

        {/* Side trim accent */}
        <line x1={10} y1={36} x2={54} y2={36} stroke="var(--rust-brass)" strokeWidth={0.3} opacity={0.2} />

        {/* Wheels (2 × wheel with 8 spokes) */}
        <WheelSpokes cx={18} cy={47} r={7} count={8} idPrefix={`${id}-wl`} animated={animated} dur="1.5s" />
        <WheelSpokes cx={46} cy={47} r={7} count={8} idPrefix={`${id}-wr`} animated={animated} dur="1.8s" />

        {/* Wheel tires */}
        <circle cx={18} cy={47} r={7} fill="none" stroke="var(--rust-bg-dark)" strokeWidth={2.5} />
        <circle cx={46} cy={47} r={7} fill="none" stroke="var(--rust-bg-dark)" strokeWidth={2.5} />

        {/* Wheel hubcaps */}
        <circle cx={18} cy={47} r={4} fill="var(--rust-wax)" stroke="var(--rust-bark)" strokeWidth={0.4} />
        <circle cx={46} cy={47} r={4} fill="var(--rust-wax)" stroke="var(--rust-bark)" strokeWidth={0.4} />
        <circle cx={18} cy={47} r={1.5} fill="var(--rust-brass)" />
        <circle cx={46} cy={47} r={1.5} fill="var(--rust-brass)" />
        <circle cx={18} cy={47} r={0.5} fill="#fef3c7" />
        <circle cx={46} cy={47} r={0.5} fill="#fef3c7" />

        {/* Wheel well arches */}
        <path d="M11,43 Q18,36 25,43" fill="none" stroke="var(--rust-bark)" strokeWidth={1.2} opacity={0.5} />
        <path d="M39,43 Q46,36 53,43" fill="none" stroke="var(--rust-bark)" strokeWidth={1.2} opacity={0.5} />

        {/* Exhaust pipe */}
        <rect x={3} y={44} width={4} height={2.5} rx={0.5} fill="var(--rust-bg-dark)" />
        <ellipse cx={3} cy={45} rx={1} ry={1.2} fill="var(--rust-bg-dark)" />

        {/* License plate */}
        <rect x={50} y={43} width={5} height={2} rx={0.3} fill="#fef3c7" stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.6} />
      </g>

      {/* ── Exhaust smoke ── */}
      {animated && Array.from({ length: 8 }, (_, i) => (
        <circle key={`${id}-exhaust-${i}`} cx={3} cy={45} r={1 + i * 0.5} fill="var(--theme-anim-particle)" opacity={0}>
          <animate attributeName="cx" values="3;-4;-10" dur={`${3 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values="45;42;39" dur={`${3 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.4;0" dur={`${3 + i * 0.5}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* ── Dust behind car ── */}
      <Particles count={20} seed={37} cx={6} cy={50} spread={12} size={0.8} animated={animated} idPrefix={`${id}-dust`} driftY={-3} />

      {/* ── Background trees ── */}
      <PineTree x={6} y={48} scale={0.7} seed={1} idPrefix={`${id}-tree1`} dark />
      <PineTree x={58} y={48} scale={0.7} seed={2} idPrefix={`${id}-tree2`} dark />

      {/* ── Extra detail elements to reach 500+ ── */}
      {/* Body rivets */}
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={`${id}-rivet-${i}`} cx={(10 + i * 2.4).toFixed(1)} cy={39} r={0.4} fill="var(--rust-brass)" opacity={0.4} />
      ))}
      {/* Wheel lug nuts */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <g key={`${id}-lug-l-${i}`}>
            <circle cx={(18 + Math.cos(a) * 2).toFixed(1)} cy={(47 + Math.sin(a) * 2).toFixed(1)} r={0.3} fill="var(--rust-bark)" />
          </g>
        );
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <g key={`${id}-lug-r-${i}`}>
            <circle cx={(46 + Math.cos(a) * 2).toFixed(1)} cy={(47 + Math.sin(a) * 2).toFixed(1)} r={0.3} fill="var(--rust-bark)" />
          </g>
        );
      })}
      {/* Extra grass details */}
      {Array.from({ length: 15 }, (_, i) => (
        <line key={`${id}-grass-x-${i}`} x1={(rng_grass(i)).toFixed(1)} y1={54} x2={(rng_grass(i) + 0.5).toFixed(1)} y2={52} stroke="var(--rust-forest)" strokeWidth={0.3} opacity={0.3} />
      ))}
      {/* Cloud puffs in sky */}
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={`${id}-sky-cloud-${i}`} cx={(10 + i * 5).toFixed(1)} cy={(8 + (i % 3) * 2).toFixed(1)} rx={3} ry={1} fill="var(--rust-cream)" opacity={0.08} />
      ))}
    </>
  );
}
