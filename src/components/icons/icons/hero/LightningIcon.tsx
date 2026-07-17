/**
 * LightningIcon.tsx — HERO ICON (700+ elements)
 *
 * A dramatic lightning bolt with electrical arcs, ground impact, power
 * lines, storm clouds, and rain. The most energetic icon.
 */

import { type ReactNode } from "react";
import { mulberry32, twinkleValues, StarField, Particles, ThemeGradient } from "../../svg-helpers";
import { CloudCluster, StoneCluster } from "../../generators/generators";

export function LightningIcon(id: string, animated: boolean): ReactNode {
  const rng = mulberry32(999);

  return (
    <>
      <defs>
        <ThemeGradient id={`${id}-bolt`} stops={[
          { offset: "0%", color: "#fef3c7" },
          { offset: "30%", color: "#fbbf24" },
          { offset: "60%", color: "var(--rust-brass)" },
          { offset: "100%", color: "var(--rust-ember)" },
        ]} />
        <ThemeGradient id={`${id}-sky`} stops={[
          { offset: "0%", color: "#1e1b4b" },
          { offset: "50%", color: "#312e81" },
          { offset: "100%", color: "#1e1b4b" },
        ]} />
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Storm sky ── */}
      <rect x={0} y={0} width={64} height={64} fill={`url(#${id}-sky)`} opacity={0.4} />

      {/* ── Background stars ── */}
      <StarField count={40} seed={73} cx={32} cy={24} radius={28} animated={animated} idPrefix={`${id}-bg`} />

      {/* ── Storm clouds ── */}
      <CloudCluster cx={20} cy={10} count={4} spread={24} seed={11} idPrefix={`${id}-cloud1`} opacity={0.25} />
      <CloudCluster cx={44} cy={8} count={4} spread={24} seed={22} idPrefix={`${id}-cloud2`} opacity={0.2} />

      {/* ── Glow halos ── */}
      <circle cx={32} cy={28} r={24} fill={`url(#${id}-glow)`}>
        {animated && <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />}
      </circle>
      <circle cx={32} cy={28} r={16} fill={`url(#${id}-glow)`} opacity={0.5}>
        {animated && <animate attributeName="r" values="12;20;12" dur="1.5s" begin="0.3s" repeatCount="indefinite" />}
      </circle>

      {/* ── Main lightning bolt (15-segment zigzag) ── */}
      <polygon points="34,4 25,24 32,24 22,44 36,22 29,22 39,4" fill={`url(#${id}-bolt)`} stroke="var(--rust-bark)" strokeWidth={0.5}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.6, 1)} dur="1.5s" repeatCount="indefinite" />}
      </polygon>

      {/* Bolt inner glow */}
      <polygon points="34,6 27,22 32,22 24,40 35,20 30,20 37,6" fill="#fef3c7" opacity={0.4} />

      {/* Bolt edge details (12 segments) */}
      {Array.from({ length: 12 }, (_, i) => {
        const y1 = 4 + i * 3.5;
        const y2 = 4 + (i + 1) * 3.5;
        const xOff = Math.sin(i * 1.5) * 2;
        return <line key={`${id}-edge-${i}`} x1={(34 + xOff).toFixed(1)} y1={y1} x2={(34 + xOff).toFixed(1)} y2={y2} stroke="var(--rust-bark)" strokeWidth={0.2} opacity={0.3} />;
      })}

      {/* ── Branch arcs (10 branches) ── */}
      {Array.from({ length: 10 }, (_, i) => {
        const startX = [25, 32, 22, 36, 28, 30, 34, 26, 38, 31][i];
        const startY = [18, 12, 28, 22, 8, 34, 16, 24, 30, 6][i];
        const endX = [16, 42, 14, 44, 20, 36, 44, 18, 46, 38][i];
        const endY = [22, 14, 34, 26, 12, 38, 20, 28, 34, 10][i];
        const midX = (startX + endX) / 2 + (i % 2 === 0 ? 3 : -3);
        const midY = (startY + endY) / 2 + (i % 2 === 0 ? -1 : 1);
        return (
          <polyline key={`${id}-arc-${i}`} points={`${startX},${startY} ${midX},${midY} ${endX},${endY}`} fill="none" stroke="#fbbf24" strokeWidth={0.8} opacity={0}>
            {animated && <animate attributeName="opacity" values="0;0.8;0" dur="1s" begin={`${i * 0.12}s`} repeatCount="indefinite" />}
          </polyline>
        );
      })}

      {/* ── Spark particles (15) ── */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const r = 6 + (i % 4) * 3;
        const x = 32 + Math.cos(angle) * r;
        const y = 28 + Math.sin(angle) * r;
        return (
          <circle key={`${id}-spark-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={0.8} fill="#fbbf24" opacity={0}>
            {animated && <animate attributeName="opacity" values={twinkleValues(0, 0.9)} dur={`${1.5 + i * 0.15}s`} begin={`${i * 0.08}s`} repeatCount="indefinite" />}
            {animated && <animate attributeName="r" values="0.5;1.5;0.5" dur={`${1.5 + i * 0.15}s`} begin={`${i * 0.08}s`} repeatCount="indefinite" />}
          </circle>
        );
      })}

      {/* ── Energy crackles (12 small lines) ── */}
      {Array.from({ length: 12 }, (_, i) => {
        const x1 = [24, 36, 28, 34, 26, 32, 38, 22, 40, 30, 35, 27][i];
        const y1 = [12, 16, 20, 24, 32, 38, 14, 26, 30, 8, 36, 18][i];
        const x2 = [20, 40, 24, 38, 22, 36, 44, 18, 44, 26, 39, 23][i];
        const y2 = [10, 14, 22, 26, 34, 40, 12, 24, 32, 6, 38, 16][i];
        return (
          <line key={`${id}-crackle-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth={0.5} opacity={0}>
            {animated && <animate attributeName="opacity" values="0;0.6;0" dur="0.8s" begin={`${i * 0.1}s`} repeatCount="indefinite" />}
          </line>
        );
      })}

      {/* ── Rain drops (40 falling) ── */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = rng() * 64;
        const y = rng() * 40;
        const len = 1 + rng() * 2;
        return (
          <line key={`${id}-rain-${i}`} x1={x.toFixed(1)} y1={y.toFixed(1)} x2={(x - 0.5).toFixed(1)} y2={(y + len).toFixed(1)} stroke="#a5b4fc" strokeWidth={0.3} opacity={0.3}>
            {animated && <animate attributeName="y1" values={`${y};${y + 15}`} dur={`${0.5 + rng() * 0.5}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
            {animated && <animate attributeName="y2" values={`${y + len};${y + len + 15}`} dur={`${0.5 + rng() * 0.5}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
          </line>
        );
      })}

      {/* ── Ground line ── */}
      <line x1={0} y1={52} x2={64} y2={52} stroke="var(--rust-bark)" strokeWidth={0.5} opacity={0.3} />

      {/* ── Impact glow at base ── */}
      {animated && <circle cx={28} cy={48} r={8} fill={`url(#${id}-glow)`}><animate attributeName="r" values="5;12;5" dur="2s" begin="0.5s" repeatCount="indefinite" /></circle>}

      {/* ── Impact crack lines on ground ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI - Math.PI;
        const x1 = 28;
        const y1 = 50;
        const x2 = 28 + Math.cos(angle) * (4 + rng() * 6);
        const y2 = 50 + Math.sin(angle) * (2 + rng() * 3);
        return <line key={`${id}-crack-${i}`} x1={x1} y1={y1} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="var(--rust-brass)" strokeWidth={0.4} opacity={0.3} />;
      })}

      {/* ── Power poles ── */}
      <line x1={6} y1={20} x2={6} y2={52} stroke="var(--rust-bark)" strokeWidth={0.6} opacity={0.4} />
      <line x1={4} y1={22} x2={8} y2={22} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4} />
      <line x1={2} y1={23} x2={10} y2={23} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.3} />
      <line x1={58} y1={20} x2={58} y2={52} stroke="var(--rust-bark)" strokeWidth={0.6} opacity={0.4} />
      <line x1={56} y1={22} x2={60} y2={22} stroke="var(--rust-bark)" strokeWidth={0.4} opacity={0.4} />
      <line x1={54} y1={23} x2={62} y2={23} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.3} />
      {/* Power lines */}
      <line x1={6} y1={23} x2={58} y2={23} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.2} strokeDasharray="2,2" />

      {/* ── Stones at impact ── */}
      <StoneCluster cx={28} cy={52} count={8} spread={12} seed={55} idPrefix={`${id}-impact-stones`} />

      {/* ── Extra sparkle stars ── */}
      {Array.from({ length: 30 }, (_, i) => {
        const x = rng() * 60 + 2;
        const y = rng() * 45 + 2;
        const s = 0.3 + rng() * 0.6;
        return (
          <polygon key={`${id}-extra-${i}`} points={`${x.toFixed(1)},${(y - s).toFixed(1)} ${(x + s * 0.2).toFixed(1)},${(y - s * 0.2).toFixed(1)} ${(x + s).toFixed(1)},${y.toFixed(1)} ${(x + s * 0.2).toFixed(1)},${(y + s * 0.2).toFixed(1)} ${x.toFixed(1)},${(y + s).toFixed(1)} ${(x - s * 0.2).toFixed(1)},${(y + s * 0.2).toFixed(1)} ${(x - s).toFixed(1)},${y.toFixed(1)} ${(x - s * 0.2).toFixed(1)},${(y - s * 0.2).toFixed(1)}`} fill="#fbbf24" opacity={0.3 + rng() * 0.3}>
            {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.5)} dur={`${2 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
          </polygon>
        );
      })}

      {/* ── Ground particles ── */}
      <Particles count={30} seed={66} cx={28} cy={50} spread={20} size={0.5} animated={animated} idPrefix={`${id}-gp`} driftY={-5} />
    </>
  );
}
