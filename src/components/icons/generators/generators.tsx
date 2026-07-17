/**
 * generators.tsx — 24 procedural generators for 500+ polygon artistic icons
 *
 * Each generator produces dozens of SVG elements (circles, polygons, lines,
 * paths) using deterministic seeded RNG (mulberry32) for SSR safety.
 *
 * Generators are pure functions — no React state, no side effects.
 * All accept { animated, idPrefix } and return ReactNode arrays.
 */

import { type ReactNode } from "react";
import { mulberry32, twinkleValues, driftValues } from "../svg-helpers";

// ── 1. PineTree — layered cone tree with trunk ────────────────────────
export function PineTree({ x, y, scale, seed, idPrefix, dark = false }: {
  x: number; y: number; scale: number; seed: number; idPrefix: string; dark?: boolean;
}): ReactNode {
  const rng = mulberry32(seed);
  const h = 8 * scale;
  const w = 5 * scale;
  const trunkW = 1.2 * scale;
  const color = dark ? "var(--rust-bg-dark)" : "var(--rust-forest)";
  const layers: ReactNode[] = [];

  // Trunk
  layers.push(<rect key={`${idPrefix}-trunk`} x={x - trunkW/2} y={y} width={trunkW} height={h * 0.3} fill="var(--rust-bark)" rx={0.3} />);

  // 4 cone layers
  for (let i = 0; i < 4; i++) {
    const ly = y - i * h * 0.25;
    const lw = w * (1 - i * 0.15);
    const lh = h * 0.35;
    layers.push(
      <polygon key={`${idPrefix}-cone-${i}`}
        points={`${x - lw/2},${ly} ${x},${ly - lh} ${x + lw/2},${ly}`}
        fill={color} opacity={0.7 + i * 0.07} stroke="var(--rust-bark)" strokeWidth={0.2}
      />
    );
    // Texture dots on each cone layer
    for (let j = 0; j < 6; j++) {
      const dx = (rng() - 0.5) * lw * 0.7;
      const dy = -rng() * lh * 0.6;
      layers.push(
        <circle key={`${idPrefix}-tex-${i}-${j}`} cx={(x + dx).toFixed(2)} cy={(ly + dy).toFixed(2)} r={0.3 * scale} fill="var(--rust-bg-dark)" opacity={0.2} />
      );
    }
  }
  return <g key={`${idPrefix}-tree-${seed}`}>{layers}</g>;
}

// ── 2. MountainRange — layered mountain silhouettes ───────────────────
export function MountainRange({ count, seed, baseY, spread, height, idPrefix, color = "var(--rust-bark)" }: {
  count: number; seed: number; baseY: number; spread: number; height: number; idPrefix: string; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const peaks: ReactNode[] = [];
  const points: string[] = [];
  for (let i = 0; i <= count; i++) {
    const x = (i / count) * spread;
    const y = baseY - height * (0.4 + rng() * 0.6);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  points.push(`${spread},${baseY}`);
  points.push(`0,${baseY}`);
  peaks.push(<polygon key={`${idPrefix}-mtn`} points={points.join(" ")} fill={color} opacity={0.5} />);

  // Snow caps on tallest peaks
  for (let i = 1; i < points.length - 2; i++) {
    const [x1, y1] = points[i].split(",").map(Number);
    const [x2, y2] = points[i + 1].split(",").map(Number);
    if (y1 < baseY - height * 0.7 || y2 < baseY - height * 0.7) {
      peaks.push(<polygon key={`${idPrefix}-snow-${i}`} points={`${x1},${y1} ${(x1+x2)/2},${(y1+y2)/2 + 2} ${x2},${y2}`} fill="var(--rust-cream)" opacity={0.7} />);
    }
  }
  // Texture lines on mountains
  for (let i = 0; i < count * 3; i++) {
    const x = rng() * spread;
    const y = baseY - rng() * height * 0.8;
    const len = 1 + rng() * 3;
    peaks.push(<line key={`${idPrefix}-ridge-${i}`} x1={x.toFixed(1)} y1={y.toFixed(1)} x2={(x + len).toFixed(1)} y2={(y + len * 0.3).toFixed(1)} stroke="var(--rust-bg-dark)" strokeWidth={0.2} opacity={0.2} />);
  }
  return <g key={`${idPrefix}-mountains`}>{peaks}</g>;
}

// ── 3. WaterRipples — concentric ripple rings ─────────────────────────
export function WaterRipples({ cx, cy, count, maxR, seed, idPrefix, animated }: {
  cx: number; cy: number; count: number; maxR: number; seed: number; idPrefix: string; animated: boolean;
}): ReactNode {
  const rng = mulberry32(seed);
  const ripples: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const r = (i / count) * maxR + rng() * 2;
    const opacity = 0.4 - (i / count) * 0.3;
    ripples.push(
      <ellipse key={`${idPrefix}-ripple-${i}`} cx={cx} cy={cy} rx={r.toFixed(1)} ry={r * 0.3} fill="none" stroke="var(--rust-forest)" strokeWidth={0.4} opacity={opacity.toFixed(2)}>
        {animated && <animate attributeName="rx" values={`${r};${r + 2};${r}`} dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />}
      </ellipse>
    );
  }
  return <g key={`${idPrefix}-ripples`}>{ripples}</g>;
}

// ── 4. WaterfallMist — rising mist particles near water ───────────────
export function WaterfallMist({ cx, cy, count, spread, seed, idPrefix, animated }: {
  cx: number; cy: number; count: number; spread: number; seed: number; idPrefix: string; animated: boolean;
}): ReactNode {
  const rng = mulberry32(seed);
  const mist: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy + (rng() - 0.5) * spread;
    const r = 1 + rng() * 3;
    mist.push(
      <circle key={`${idPrefix}-mist-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(1)} fill="var(--rust-cream)" opacity={0.08}>
        {animated && <animate attributeName="cy" values={`${y};${y - 15};${y}`} dur={`${4 + rng() * 3}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" />}
        {animated && <animate attributeName="opacity" values="0.08;0.2;0.08" dur={`${4 + rng() * 3}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" />}
      </circle>
    );
  }
  return <g key={`${idPrefix}-waterfall-mist`}>{mist}</g>;
}

// ── 5. LeafCluster — cluster of overlapping leaf shapes ───────────────
export function LeafCluster({ cx, cy, count, spread, seed, idPrefix, color = "var(--rust-forest)" }: {
  cx: number; cy: number; count: number; spread: number; seed: number; idPrefix: string; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const leaves: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy + (rng() - 0.5) * spread;
    const angle = rng() * 360;
    const len = 2 + rng() * 3;
    const wid = 1 + rng() * 1.5;
    leaves.push(
      <ellipse key={`${idPrefix}-leaf-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={len} ry={wid} fill={color} opacity={0.4 + rng() * 0.4} transform={`rotate(${angle.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} />
    );
    // Leaf vein
    leaves.push(
      <line key={`${idPrefix}-vein-${i}`} x1={(x - len * Math.cos(angle * Math.PI / 180)).toFixed(1)} y1={(y - len * Math.sin(angle * Math.PI / 180)).toFixed(1)} x2={(x + len * Math.cos(angle * Math.PI / 180)).toFixed(1)} y2={(y + len * Math.sin(angle * Math.PI / 180)).toFixed(1)} stroke="var(--rust-bg-dark)" strokeWidth={0.2} opacity={0.3} />
    );
  }
  return <g key={`${idPrefix}-leaf-cluster`}>{leaves}</g>;
}

// ── 6. BrickTexture — repeating brick pattern ─────────────────────────
export function BrickTexture({ x, y, w, h, rows, cols, idPrefix, color = "var(--rust-bark)" }: {
  x: number; y: number; w: number; h: number; rows: number; cols: number; idPrefix: string; color?: string;
}): ReactNode {
  const bricks: ReactNode[] = [];
  const bw = w / cols;
  const bh = h / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (bw / 2);
    for (let c = 0; c < cols; c++) {
      const bx = x + c * bw + offset;
      const by = y + r * bh;
      if (bx + bw > x + w) continue;
      bricks.push(
        <rect key={`${idPrefix}-brick-${r}-${c}`} x={bx.toFixed(1)} y={by.toFixed(1)} width={(bw - 0.3).toFixed(1)} height={(bh - 0.3).toFixed(1)} fill={color} opacity={0.15 + (r + c) % 3 * 0.05} rx={0.2} />
      );
    }
  }
  return <g key={`${idPrefix}-bricks`}>{bricks}</g>;
}

// ── 7. WoodGrain — horizontal wood grain lines ────────────────────────
export function WoodGrain({ x, y, w, h, count, seed, idPrefix, color = "var(--rust-bark)" }: {
  x: number; y: number; w: number; h: number; count: number; seed: number; idPrefix: string; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const lines: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const ly = y + (i / count) * h + rng() * 1.5;
    const amplitude = 0.3 + rng() * 0.8;
    const phase = rng() * Math.PI * 2;
    let path = `M ${x} ${ly.toFixed(1)}`;
    for (let s = 0; s <= 8; s++) {
      const sx = x + (s / 8) * w;
      const sy = ly + Math.sin((s / 8) * Math.PI * 2 + phase) * amplitude;
      path += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }
    lines.push(<path key={`${idPrefix}-grain-${i}`} d={path} fill="none" stroke={color} strokeWidth={0.3} opacity={0.2 + rng() * 0.15} />);
  }
  return <g key={`${idPrefix}-woodgrain`}>{lines}</g>;
}

// ── 8. DiamondSparkle — 4-point sparkle with cross-hatch ──────────────
export function DiamondSparkle({ cx, cy, size, idPrefix, animated }: {
  cx: number; cy: number; size: number; idPrefix: string; animated: boolean;
}): ReactNode {
  return (
    <g key={`${idPrefix}-diamond-sparkle`}>
      <polygon points={`${cx},${cy - size} ${cx + size * 0.2},${cy - size * 0.2} ${cx + size},${cy} ${cx + size * 0.2},${cy + size * 0.2} ${cx},${cy + size} ${cx - size * 0.2},${cy + size * 0.2} ${cx - size},${cy} ${cx - size * 0.2},${cy - size * 0.2}`} fill="var(--rust-cream)" opacity={0.6}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.2, 0.8)} dur="2s" repeatCount="indefinite" />}
      </polygon>
      <line x1={cx - size} y1={cy} x2={cx + size} y2={cy} stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.3} />
      <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} stroke="var(--rust-cream)" strokeWidth={0.3} opacity={0.3} />
    </g>
  );
}

// ── 9. SunRays — radial sun rays ──────────────────────────────────────
export function SunRays({ cx, cy, innerR, outerR, count, idPrefix, animated, color = "var(--rust-brass)" }: {
  cx: number; cy: number; innerR: number; outerR: number; count: number; idPrefix: string; animated: boolean; color?: string;
}): ReactNode {
  const rays: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;
    const midAngle = angle + 0.04;
    const mx = cx + Math.cos(midAngle) * (innerR + outerR) / 2;
    const my = cy + Math.sin(midAngle) * (innerR + outerR) / 2;
    rays.push(
      <polygon key={`${idPrefix}-sunray-${i}`} points={`${x1.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`} fill={color} opacity={0.3}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.1, 0.4)} dur={`${3 + i * 0.1}s`} begin={`${i * 0.05}s`} repeatCount="indefinite" />}
      </polygon>
    );
  }
  return <g key={`${idPrefix}-sunrays`}>{rays}</g>;
}

// ── 10. CloudCluster — soft cloud puffs ───────────────────────────────
export function CloudCluster({ cx, cy, count, spread, seed, idPrefix, opacity = 0.3 }: {
  cx: number; cy: number; count: number; spread: number; seed: number; idPrefix: string; opacity?: number;
}): ReactNode {
  const rng = mulberry32(seed);
  const clouds: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy + (rng() - 0.5) * spread * 0.4;
    const r = 2 + rng() * 4;
    // Each cloud = 3-5 overlapping ellipses
    const puffs = 3 + Math.floor(rng() * 3);
    for (let j = 0; j < puffs; j++) {
      const px = x + (j - puffs / 2) * r * 0.7;
      const py = y + (rng() - 0.5) * r * 0.3;
      const pr = r * (0.6 + rng() * 0.4);
      clouds.push(<ellipse key={`${idPrefix}-cloud-${i}-${j}`} cx={px.toFixed(1)} cy={py.toFixed(1)} rx={pr.toFixed(1)} ry={(pr * 0.5).toFixed(1)} fill="var(--rust-cream)" opacity={opacity} />);
    }
  }
  return <g key={`${idPrefix}-clouds`}>{clouds}</g>;
}

// ── 11. GrassTufts — small grass tuft clusters ────────────────────────
export function GrassTufts({ cx, cy, count, spread, seed, idPrefix, color = "var(--rust-forest)" }: {
  cx: number; cy: number; count: number; spread: number; seed: number; idPrefix: string; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const tufts: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const blades = 3 + Math.floor(rng() * 3);
    for (let j = 0; j < blades; j++) {
      const bx = x + (j - blades / 2) * 0.8;
      const bh = 1.5 + rng() * 2;
      const lean = (rng() - 0.5) * 1;
      tufts.push(
        <line key={`${idPrefix}-grass-${i}-${j}`} x1={bx.toFixed(1)} y1={cy.toFixed(1)} x2={(bx + lean).toFixed(1)} y2={(cy - bh).toFixed(1)} stroke={color} strokeWidth={0.4} opacity={0.5} strokeLinecap="round" />
      );
    }
  }
  return <g key={`${idPrefix}-grass`}>{tufts}</g>;
}

// ── 12. StoneCluster — irregular stone shapes ─────────────────────────
export function StoneCluster({ cx, cy, count, spread, seed, idPrefix, color = "var(--rust-bark)" }: {
  cx: number; cy: number; count: number; spread: number; seed: number; idPrefix: string; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const stones: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy + (rng() - 0.5) * spread * 0.5;
    const rx = 1.5 + rng() * 3;
    const ry = rx * (0.5 + rng() * 0.3);
    stones.push(<ellipse key={`${idPrefix}-stone-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={rx.toFixed(1)} ry={ry.toFixed(1)} fill={color} opacity={0.3 + rng() * 0.2} stroke="var(--rust-bg-dark)" strokeWidth={0.3} />);
    // Stone texture dots
    for (let j = 0; j < 3; j++) {
      stones.push(<circle key={`${idPrefix}-stonetex-${i}-${j}`} cx={(x + (rng() - 0.5) * rx).toFixed(1)} cy={(y + (rng() - 0.5) * ry).toFixed(1)} r={0.3} fill="var(--rust-bg-dark)" opacity={0.2} />);
    }
  }
  return <g key={`${idPrefix}-stones`}>{stones}</g>;
}

// ── 13. WaveField — layered wave paths ────────────────────────────────
export function WaveField({ y, w, count, seed, idPrefix, color = "var(--rust-forest)", animated }: {
  y: number; w: number; count: number; seed: number; idPrefix: string; color?: string; animated: boolean;
}): ReactNode {
  const rng = mulberry32(seed);
  const waves: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const wy = y + i * 1.5;
    const amplitude = 0.5 + rng() * 1;
    let path = `M 0 ${wy.toFixed(1)}`;
    for (let s = 0; s <= 12; s++) {
      const sx = (s / 12) * w;
      const sy = wy + Math.sin((s / 12) * Math.PI * 2 + i) * amplitude;
      path += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }
    waves.push(
      <path key={`${idPrefix}-wave-${i}`} d={path} fill="none" stroke={color} strokeWidth={0.5} opacity={(0.5 - i * 0.05).toFixed(2)}>
        {animated && <animate attributeName="d" values={`${path};${path.replace(/L (\d+\.?\d*) (\d+\.?\d*)/g, (m, x, oy) => `L ${x} ${(parseFloat(oy) + 0.5).toFixed(1)}`)};${path}`} dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />}
      </path>
    );
  }
  return <g key={`${idPrefix}-waves`}>{waves}</g>;
}

// ── 14. SplashDrops — water splash droplets ───────────────────────────
export function SplashDrops({ cx, cy, count, seed, idPrefix, animated }: {
  cx: number; cy: number; count: number; seed: number; idPrefix: string; animated: boolean;
}): ReactNode {
  const rng = mulberry32(seed);
  const drops: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 3 + rng() * 8;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const r = 0.5 + rng() * 1;
    drops.push(
      <circle key={`${idPrefix}-drop-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(1)} fill="var(--rust-cream)" opacity={0.5}>
        {animated && <animate attributeName="cy" values={`${y};${y - 5};${y}`} dur={`${1.5 + rng()}s`} begin={`${rng()}s`} repeatCount="indefinite" />}
        {animated && <animate attributeName="opacity" values="0.5;0;0.5" dur={`${1.5 + rng()}s`} begin={`${rng()}s`} repeatCount="indefinite" />}
      </circle>
    );
  }
  return <g key={`${idPrefix}-splash`}>{drops}</g>;
}

// ── 15. Embers — rising fire embers ───────────────────────────────────
export function Embers({ cx, cy, count, spread, seed, idPrefix, animated }: {
  cx: number; cy: number; count: number; spread: number; seed: number; idPrefix: string; animated: boolean;
}): ReactNode {
  const rng = mulberry32(seed);
  const embers: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy;
    const r = 0.4 + rng() * 0.8;
    embers.push(
      <circle key={`${idPrefix}-ember-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(1)} fill="var(--rust-ember)" opacity={0.6}>
        {animated && <animate attributeName="cy" values={`${y};${y - 20};${y}`} dur={`${2 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
        {animated && <animate attributeName="opacity" values="0.6;0.3;0" dur={`${2 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
        {animated && <animate attributeName="cx" values={`${x};${x + (rng() - 0.5) * 4};${x}`} dur={`${2 + rng() * 2}s`} begin={`${rng() * 2}s`} repeatCount="indefinite" />}
      </circle>
    );
  }
  return <g key={`${idPrefix}-embers`}>{embers}</g>;
}

// ── 16. FloatingLeaves — drifting leaf particles ──────────────────────
export function FloatingLeaves({ count, seed, idPrefix, animated, color = "var(--rust-forest)" }: {
  count: number; seed: number; idPrefix: string; animated: boolean; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const leaves: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = rng() * 64;
    const y = rng() * 64;
    const r = 0.8 + rng() * 1.5;
    const angle = rng() * 360;
    leaves.push(
      <ellipse key={`${idPrefix}-floatleaf-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={r.toFixed(1)} ry={(r * 0.5).toFixed(1)} fill={color} opacity={0.3 + rng() * 0.3} transform={`rotate(${angle.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`}>
        {animated && <animateTransform attributeName="transform" type="rotate" values={`${angle.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)};${(angle + 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)};${angle.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)}`} dur={`${5 + rng() * 5}s`} repeatCount="indefinite" />}
      </ellipse>
    );
  }
  return <g key={`${idPrefix}-floating-leaves`}>{leaves}</g>;
}

// ── 17. GearTeeth — gear teeth around a circle ────────────────────────
export function GearTeeth({ cx, cy, innerR, outerR, count, idPrefix, color = "var(--rust-bark)" }: {
  cx: number; cy: number; innerR: number; outerR: number; count: number; idPrefix: string; color?: string;
}): ReactNode {
  const teeth: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x1 = cx + Math.cos(angle - 0.05) * innerR;
    const y1 = cy + Math.sin(angle - 0.05) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;
    const x3 = cx + Math.cos(angle + 0.05) * innerR;
    const y3 = cy + Math.sin(angle + 0.05) * innerR;
    teeth.push(
      <polygon key={`${idPrefix}-tooth-${i}`} points={`${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}`} fill={color} opacity={0.6} />
    );
  }
  return <g key={`${idPrefix}-gear-teeth`}>{teeth}</g>;
}

// ── 18. WheelSpokes — wheel with spokes ───────────────────────────────
export function WheelSpokes({ cx, cy, r, count, idPrefix, color = "var(--rust-bg-dark)", animated, dur = "3s" }: {
  cx: number; cy: number; r: number; count: number; idPrefix: string; color?: string; animated: boolean; dur?: string;
}): ReactNode {
  const spokes: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = cx + Math.cos(angle) * r * 0.8;
    const y = cy + Math.sin(angle) * r * 0.8;
    spokes.push(
      <line key={`${idPrefix}-spoke-${i}`} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={color} strokeWidth={0.5} opacity={0.6}>
        {animated && <animateTransform attributeName="transform" type="rotate" values={`0 ${cx} ${cy};360 ${cx} ${cy}`} dur={dur} repeatCount="indefinite" />}
      </line>
    );
  }
  // Hub
  spokes.push(<circle key={`${idPrefix}-hub`} cx={cx} cy={cy} r={r * 0.2} fill="var(--rust-brass)" opacity={0.7} />);
  return <g key={`${idPrefix}-wheel`}>{spokes}</g>;
}

// ── 19. ColumnFlutes — vertical fluting lines on a column ─────────────
export function ColumnFlutes({ x, y, w, h, count, idPrefix, color = "var(--rust-bark)" }: {
  x: number; y: number; w: number; h: number; count: number; idPrefix: string; color?: string;
}): ReactNode {
  const flutes: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const fx = x + (i / (count - 1)) * w;
    flutes.push(<line key={`${idPrefix}-flute-${i}`} x1={fx.toFixed(1)} y1={y} x2={fx.toFixed(1)} y2={y + h} stroke={color} strokeWidth={0.3} opacity={0.3} />);
    // Highlight
    flutes.push(<line key={`${idPrefix}-flute-h-${i}`} x1={(fx + 0.5).toFixed(1)} y1={y} x2={(fx + 0.5).toFixed(1)} y2={y + h} stroke="var(--rust-cream)" strokeWidth={0.15} opacity={0.2} />);
  }
  return <g key={`${idPrefix}-flutes`}>{flutes}</g>;
}

// ── 20. Shingles — overlapping roof shingle rows ──────────────────────
export function Shingles({ x, y, w, rows, cols, idPrefix, color = "var(--rust-wax)" }: {
  x: number; y: number; w: number; rows: number; cols: number; idPrefix: string; color?: string;
}): ReactNode {
  const shingles: ReactNode[] = [];
  const sw = w / cols;
  const sh = 2;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (sw / 2);
    for (let c = 0; c < cols; c++) {
      const sx = x + c * sw + offset;
      const sy = y + r * sh;
      shingles.push(
        <rect key={`${idPrefix}-shingle-${r}-${c}`} x={sx.toFixed(1)} y={sy.toFixed(1)} width={(sw * 0.9).toFixed(1)} height={(sh * 0.85).toFixed(1)} fill={color} opacity={0.3 + (r % 2) * 0.1} rx={0.5} />
      );
    }
  }
  return <g key={`${idPrefix}-shingles`}>{shingles}</g>;
}

// ── 21. WindowGrid — paned window grid ────────────────────────────────
export function WindowGrid({ x, y, w, h, rows, cols, idPrefix, color = "var(--rust-brass)" }: {
  x: number; y: number; w: number; h: number; rows: number; cols: number; idPrefix: string; color?: string;
}): ReactNode {
  const grid: ReactNode[] = [];
  const cw = w / cols;
  const ch = h / rows;
  // Glass panes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push(<rect key={`${idPrefix}-pane-${r}-${c}`} x={(x + c * cw + 0.2).toFixed(1)} y={(y + r * ch + 0.2).toFixed(1)} width={(cw - 0.4).toFixed(1)} height={(ch - 0.4).toFixed(1)} fill={color} opacity={0.3} rx={0.2} />);
    }
  }
  // Frame lines
  for (let c = 0; c <= cols; c++) {
    grid.push(<line key={`${idPrefix}-vframe-${c}`} x1={(x + c * cw).toFixed(1)} y1={y} x2={(x + c * cw).toFixed(1)} y2={y + h} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.5} />);
  }
  for (let r = 0; r <= rows; r++) {
    grid.push(<line key={`${idPrefix}-hframe-${r}`} x1={x} y1={(y + r * ch).toFixed(1)} x2={x + w} y2={(y + r * ch).toFixed(1)} stroke="var(--rust-bark)" strokeWidth={0.3} opacity={0.5} />);
  }
  return <g key={`${idPrefix}-windowgrid`}>{grid}</g>;
}

// ── 22. BridgeCables — suspension bridge cables ───────────────────────
export function BridgeCables({ x1, y1, x2, y2, sag, count, idPrefix, color = "var(--rust-bark)" }: {
  x1: number; y1: number; x2: number; y2: number; sag: number; count: number; idPrefix: string; color?: string;
}): ReactNode {
  const cables: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t + sag * Math.sin(t * Math.PI);
    cables.push(<line key={`${idPrefix}-cable-${i}`} x1={x.toFixed(1)} y1={y.toFixed(1)} x2={x.toFixed(1)} y2={(y + 8).toFixed(1)} stroke={color} strokeWidth={0.4} opacity={0.4} />);
  }
  // Main cable curve
  let path = `M ${x1} ${y1}`;
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t + sag * Math.sin(t * Math.PI);
    path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  cables.push(<path key={`${idPrefix}-maincable`} d={path} fill="none" stroke={color} strokeWidth={1} opacity={0.6} />);
  return <g key={`${idPrefix}-bridge-cables`}>{cables}</g>;
}

// ── 23. RivetPattern — evenly spaced rivets ───────────────────────────
export function RivetPattern({ x, y, w, h, rows, cols, idPrefix, color = "var(--rust-brass)" }: {
  x: number; y: number; w: number; h: number; rows: number; cols: number; idPrefix: string; color?: string;
}): ReactNode {
  const rivets: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rx = x + (c / (cols - 1)) * w;
      const ry = y + (r / (rows - 1)) * h;
      rivets.push(<circle key={`${idPrefix}-rivet-${r}-${c}`} cx={rx.toFixed(1)} cy={ry.toFixed(1)} r={0.5} fill={color} opacity={0.5} />);
      rivets.push(<circle key={`${idPrefix}-rivet-h-${r}-${c}`} cx={(rx - 0.15).toFixed(1)} cy={(ry - 0.15).toFixed(1)} r={0.2} fill="var(--rust-cream)" opacity={0.3} />);
    }
  }
  return <g key={`${idPrefix}-rivets`}>{rivets}</g>;
}

// ── 24. StitchPattern — dashed stitching lines ────────────────────────
export function StitchPattern({ x1, y1, x2, y2, count, idPrefix, color = "var(--rust-brass)" }: {
  x1: number; y1: number; x2: number; y2: number; count: number; idPrefix: string; color?: string;
}): ReactNode {
  const stitches: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t1 = i / count;
    const t2 = (i + 0.5) / count;
    const sx1 = x1 + (x2 - x1) * t1;
    const sy1 = y1 + (y2 - y1) * t1;
    const sx2 = x1 + (x2 - x1) * t2;
    const sy2 = y1 + (y2 - y1) * t2;
    stitches.push(<line key={`${idPrefix}-stitch-${i}`} x1={sx1.toFixed(1)} y1={sy1.toFixed(1)} x2={sx2.toFixed(1)} y2={sy2.toFixed(1)} stroke={color} strokeWidth={0.4} opacity={0.4} strokeLinecap="round" />);
  }
  return <g key={`${idPrefix}-stitches`}>{stitches}</g>;
}

// ── 25. AuroraBand — flowing aurora curtain ───────────────────────────
export function AuroraBand({ y, w, h, seed, idPrefix, animated, color = "var(--rust-forest)" }: {
  y: number; w: number; h: number; seed: number; idPrefix: string; animated: boolean; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const bands: ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    let path = `M 0 ${y + i * 3}`;
    for (let s = 0; s <= 16; s++) {
      const sx = (s / 16) * w;
      const sy = y + i * 3 + Math.sin((s / 16) * Math.PI * 2 + i + seed) * h;
      path += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }
    path += ` L ${w} ${y + i * 3 + 10} L 0 ${y + i * 3 + 10} Z`;
    bands.push(
      <path key={`${idPrefix}-aurora-${i}`} d={path} fill={color} opacity={(0.1 - i * 0.02).toFixed(2)}>
        {animated && <animate attributeName="d" values={`${path};${path.replace(/L (\d+\.?\d*) (\d+\.?\d*)/g, (m, x, oy) => `L ${x} ${(parseFloat(oy) + 1).toFixed(1)}`)};${path}`} dur={`${4 + i}s`} repeatCount="indefinite" />}
      </path>
    );
  }
  return <g key={`${idPrefix}-aurora`}>{bands}</g>;
}

// ── 26. MoonCraters — detailed moon surface ───────────────────────────
export function MoonCraters({ cx, cy, r, count, seed, idPrefix }: {
  cx: number; cy: number; r: number; count: number; seed: number; idPrefix: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const craters: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * r * 0.8;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const cr = 0.5 + rng() * 2;
    craters.push(<circle key={`${idPrefix}-crater-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={cr.toFixed(1)} fill="var(--rust-bg-dark)" opacity={0.15} />);
    craters.push(<circle key={`${idPrefix}-crater-rim-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={(cr + 0.3).toFixed(1)} fill="none" stroke="var(--rust-cream)" strokeWidth={0.2} opacity={0.1} />);
  }
  return <g key={`${idPrefix}-moon-craters`}>{craters}</g>;
}

// ── 27. ConstellationGrid — star grid with connecting lines ───────────
export function ConstellationGrid({ count, seed, idPrefix, animated, w = 64, h = 64 }: {
  count: number; seed: number; idPrefix: string; animated: boolean; w?: number; h?: number;
}): ReactNode {
  const rng = mulberry32(seed);
  const stars: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({ x: rng() * w, y: rng() * h, r: 0.3 + rng() * 0.8 });
  }
  const elements: ReactNode[] = [];
  // Stars
  for (let i = 0; i < stars.length; i++) {
    elements.push(
      <circle key={`${idPrefix}-cstar-${i}`} cx={stars[i].x.toFixed(1)} cy={stars[i].y.toFixed(1)} r={stars[i].r.toFixed(1)} fill="var(--rust-cream)" opacity={0.5 + rng() * 0.4}>
        {animated && <animate attributeName="opacity" values={twinkleValues(0.2, 0.9)} dur={`${2 + rng() * 3}s`} begin={`${rng() * 3}s`} repeatCount="indefinite" />}
      </circle>
    );
  }
  // Constellation lines (connect nearest neighbors)
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12 && rng() > 0.7) {
        elements.push(<line key={`${idPrefix}-cline-${i}-${j}`} x1={stars[i].x.toFixed(1)} y1={stars[i].y.toFixed(1)} x2={stars[j].x.toFixed(1)} y2={stars[j].y.toFixed(1)} stroke="var(--rust-cream)" strokeWidth={0.2} opacity={0.15} />);
      }
    }
  }
  return <g key={`${idPrefix}-constellation`}>{elements}</g>;
}

// ── 28. FoamField — foam bubbles on water ─────────────────────────────
export function FoamField({ cx, cy, count, spread, seed, idPrefix }: {
  cx: number; cy: number; count: number; spread: number; seed: number; idPrefix: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const foam: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy + (rng() - 0.5) * spread * 0.3;
    const r = 0.3 + rng() * 1.2;
    foam.push(<circle key={`${idPrefix}-foam-${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(1)} fill="var(--rust-cream)" opacity={0.4 + rng() * 0.3} />);
  }
  return <g key={`${idPrefix}-foam`}>{foam}</g>;
}

// ── 29. SandRipples — sand/desert ripple pattern ──────────────────────
export function SandRipples({ y, w, count, seed, idPrefix, color = "var(--rust-brass)" }: {
  y: number; w: number; count: number; seed: number; idPrefix: string; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const ripples: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const ry = y + i * 1.5;
    let path = `M 0 ${ry.toFixed(1)}`;
    for (let s = 0; s <= 8; s++) {
      const sx = (s / 8) * w;
      const sy = ry + Math.sin((s / 8) * Math.PI * 3 + i) * 0.8;
      path += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }
    ripples.push(<path key={`${idPrefix}-sand-${i}`} d={path} fill="none" stroke={color} strokeWidth={0.3} opacity={0.2} />);
  }
  return <g key={`${idPrefix}-sand-ripples`}>{ripples}</g>;
}

// ── 30. VineStrand — decorative vine with leaves ──────────────────────
export function VineStrand({ x1, y1, x2, y2, leaves, seed, idPrefix, color = "var(--rust-forest)" }: {
  x1: number; y1: number; x2: number; y2: number; leaves: number; seed: number; idPrefix: string; color?: string;
}): ReactNode {
  const rng = mulberry32(seed);
  const vine: ReactNode[] = [];
  // Main stem
  let path = `M ${x1} ${y1}`;
  const segments = 8;
  for (let s = 1; s <= segments; s++) {
    const t = s / segments;
    const sx = x1 + (x2 - x1) * t + Math.sin(t * Math.PI * 2) * 2;
    const sy = y1 + (y2 - y1) * t + Math.cos(t * Math.PI * 2) * 1;
    path += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  }
  vine.push(<path key={`${idPrefix}-vine-stem`} d={path} fill="none" stroke={color} strokeWidth={0.6} opacity={0.5} />);
  // Leaves along the vine
  for (let i = 0; i < leaves; i++) {
    const t = (i + 0.5) / leaves;
    const lx = x1 + (x2 - x1) * t + Math.sin(t * Math.PI * 2) * 2;
    const ly = y1 + (y2 - y1) * t + Math.cos(t * Math.PI * 2) * 1;
    const angle = rng() * 360;
    vine.push(<ellipse key={`${idPrefix}-vineleaf-${i}`} cx={lx.toFixed(1)} cy={ly.toFixed(1)} rx={1.5} ry={0.7} fill={color} opacity={0.5} transform={`rotate(${angle.toFixed(0)} ${lx.toFixed(1)} ${ly.toFixed(1)})`} />);
  }
  return <g key={`${idPrefix}-vine`}>{vine}</g>;
}
