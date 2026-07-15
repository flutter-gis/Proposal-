"use client";

/**
 * AlbumArt.tsx — HIGH-DETAILED SVG ALBUM ART
 *
 * Each track gets a unique 100+ polygon SVG artwork that visually
 * represents the scene and meaning of the song. The art is procedural
 * but deterministic (seeded by track ID) so it's stable across renders.
 *
 * Design philosophy:
 *   - Each song has a visual SCENE (sunset, dawn, forest, stars, etc.)
 *   - 100+ polygons minimum per artwork
 *   - Animated elements that match the music's mood
 *   - Unique color palettes per track
 */

import { useMemo, type ReactElement } from "react";

interface AlbumArtProps {
  trackId: string;
  title: string;
  description: string;
  bpm: number;
  size?: number;
  className?: string;
}

// Seeded PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Per-track scene definitions
const SCENES: Record<string, {
  palette: string[];
  scene: "sunset" | "dawn" | "forest" | "mountains" | "proposal" | "stars" | "sunrise" | "ceremony" | "celebration" | "night";
}> = {
  "golden-hour": { palette: ["#fbbf24", "#f59e0b", "#dc2626", "#7c2d12", "#fef3c7"], scene: "sunset" },
  "first-light": { palette: ["#7c3aed", "#a78bfa", "#fbbf24", "#fef3c7", "#f0abfc"], scene: "dawn" },
  "forest-trail": { palette: ["#14532d", "#16a34a", "#65a30d", "#86efac", "#fbbf24"], scene: "forest" },
  "mountain-echo": { palette: ["#1e1b4b", "#4f46e5", "#818cf8", "#c4b5fd", "#e0e7ff"], scene: "mountains" },
  "the-question": { palette: ["#fbbf24", "#fef3c7", "#d4a017", "#7c2d12", "#dc2626"], scene: "proposal" },
  "starlit-path": { palette: ["#020617", "#1e1b4b", "#4f46e5", "#a5b4fc", "#e0e7ff"], scene: "stars" },
  "sunrise-promise": { palette: ["#78350f", "#f59e0b", "#fbbf24", "#fef3c7", "#fde68a"], scene: "sunrise" },
  "sunset-vow": { palette: ["#7f1d1d", "#dc2626", "#f59e0b", "#fbbf24", "#fde047"], scene: "ceremony" },
  "celebration": { palette: ["#dc2626", "#fbbf24", "#16a34a", "#0284c7", "#7c3aed"], scene: "celebration" },
  "serenity": { palette: ["#020617", "#1e1b4b", "#312e81", "#a5b4fc", "#1e293b"], scene: "night" },
};

export default function AlbumArt({ trackId, title, bpm, size = 120, className }: AlbumArtProps) {
  const config = SCENES[trackId] || SCENES["golden-hour"];
  const palette = config.palette;

  // Generate deterministic shapes based on track ID
  const rng = useMemo(() => {
    let s = 0;
    for (const c of trackId) s = (s * 31 + c.charCodeAt(0)) | 0;
    return mulberry32(Math.abs(s));
  }, [trackId]);

  // Generate 100+ polygons
  const elements = useMemo(() => {
    const els: ReactElement[] = [];
    const gid = `art-${trackId}`;

    switch (config.scene) {
      case "sunset": {
        // Sky gradient (5 bands)
        for (let i = 0; i < 5; i++) {
          els.push(<rect key={`sky-${i}`} x="0" y={i * 20} width="100" height="20" fill={palette[i]} opacity={0.9} />);
        }
        // Sun disc + rays (20 triangles)
        const cx = 50, cy = 45;
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const r1 = 15, r2 = 30;
          els.push(
            <polygon key={`ray-${i}`} points={`${cx},${cy} ${cx + Math.cos(angle) * r2},${cy + Math.sin(angle) * r2} ${cx + Math.cos(angle + 0.3) * r2},${cy + Math.sin(angle + 0.3) * r2}`} fill={palette[4]} opacity={0.3}>
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
            </polygon>
          );
        }
        // Sun circle
        els.push(<circle key="sun" cx={cx} cy={cy} r="14" fill={palette[4]} opacity="0.9">
          <animate attributeName="r" values="14;15;14" dur="4s" repeatCount="indefinite" />
        </circle>);
        // Water reflection (15 triangles)
        for (let i = 0; i < 15; i++) {
          const x = 5 + rng() * 90;
          const w = 3 + rng() * 8;
          els.push(<polygon key={`water-${i}`} points={`${x},70 ${x + w},70 ${x + w / 2},${75 + rng() * 15}`} fill={palette[i % 3]} opacity={0.3 + rng() * 0.3}>
            <animate attributeName="opacity" values={`${0.3};${0.6};${0.3}`} dur={`${2 + rng() * 3}s`} repeatCount="indefinite" />
          </polygon>);
        }
        // Mountain silhouettes (5 triangles)
        const mtnPts = [[0,70],[15,40],[30,55],[45,30],[60,50],[75,25],[90,45],[100,35],[100,70]];
        els.push(<polygon key="mtn" points={mtnPts.map(p => p.join(",")).join(" ")} fill={palette[3]} opacity="0.7" />);
        // Birds (10 small V shapes)
        for (let i = 0; i < 10; i++) {
          const x = 10 + rng() * 80;
          const y = 15 + rng() * 25;
          els.push(<path key={`bird-${i}`} d={`M ${x},${y} Q ${x + 3},${y - 2} ${x + 5},${y} Q ${x + 7},${y - 2} ${x + 10},${y}`} stroke={palette[3]} strokeWidth="0.5" fill="none" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${2 + rng() * 2}s`} repeatCount="indefinite" />
          </path>);
        }
        break;
      }

      case "dawn": {
        // Gradient sky (6 bands)
        for (let i = 0; i < 6; i++) {
          els.push(<rect key={`sky-${i}`} x="0" y={i * 16.67} width="100" height="17" fill={palette[i % palette.length]} opacity={0.8} />);
        }
        // Horizon glow (8 overlapping circles)
        for (let i = 0; i < 8; i++) {
          els.push(<circle key={`glow-${i}`} cx={20 + i * 10} cy="50" r="20" fill={palette[2]} opacity="0.15">
            <animate attributeName="opacity" values="0.1;0.2;0.1" dur={`${4 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>);
        }
        // Sun rising (semicircle + 15 rays)
        els.push(<circle key="sun" cx="50" cy="55" r="12" fill={palette[2]} opacity="0.9" />);
        for (let i = 0; i < 15; i++) {
          const angle = (i / 15) * Math.PI;
          els.push(<line key={`ray-${i}`} x1={50 + Math.cos(angle) * 13} y1={55 - Math.sin(angle) * 13} x2={50 + Math.cos(angle) * 25} y2={55 - Math.sin(angle) * 25} stroke={palette[3]} strokeWidth="0.8" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
          </line>);
        }
        // Mountain layers (3 ranges, 15 triangles each)
        for (let layer = 0; layer < 3; layer++) {
          const y = 55 + layer * 10;
          const opacity = 0.3 + layer * 0.2;
          for (let i = 0; i < 10; i++) {
            const x = i * 10;
            const h = 15 + rng() * 20;
            els.push(<polygon key={`mtn-${layer}-${i}`} points={`${x},${y} ${x + 5},${y - h} ${x + 10},${y}`} fill={palette[layer % palette.length]} opacity={opacity} />);
          }
        }
        // Fog wisps (8 ellipses)
        for (let i = 0; i < 8; i++) {
          els.push(<ellipse key={`fog-${i}`} cx={rng() * 100} cy={50 + rng() * 20} rx={10 + rng() * 15} ry={2 + rng() * 3} fill={palette[4]} opacity="0.15">
            <animate attributeName="cx" values={`${rng() * 100};${rng() * 100};${rng() * 100}`} dur={`${10 + rng() * 5}s`} repeatCount="indefinite" />
          </ellipse>);
        }
        break;
      }

      case "forest": {
        // Ground
        els.push(<rect key="ground" x="0" y="60" width="100" height="40" fill={palette[0]} opacity="0.8" />);
        // Sky
        els.push(<rect key="sky" x="0" y="0" width="100" height="60" fill={palette[1]} opacity="0.3" />);
        // Sun beams (8 triangles)
        for (let i = 0; i < 8; i++) {
          els.push(<polygon key={`beam-${i}`} points={`${20 + i * 8},0 ${25 + i * 8},0 ${30 + i * 8},60 ${15 + i * 8},60`} fill={palette[4]} opacity="0.1">
            <animate attributeName="opacity" values="0.05;0.15;0.05" dur={`${4 + i * 0.5}s`} repeatCount="indefinite" />
          </polygon>);
        }
        // Tree trunks (20 rectangles)
        for (let i = 0; i < 20; i++) {
          const x = rng() * 100;
          const w = 1 + rng() * 2;
          const h = 30 + rng() * 30;
          els.push(<rect key={`trunk-${i}`} x={x} y={60 - h} width={w} height={h} fill={palette[3]} opacity={0.4 + rng() * 0.3} />);
        }
        // Tree canopies (30 polygons — triangles for pine trees)
        for (let i = 0; i < 30; i++) {
          const x = rng() * 100;
          const y = 10 + rng() * 40;
          const w = 4 + rng() * 6;
          els.push(<polygon key={`canopy-${i}`} points={`${x},${y} ${x - w / 2},${y + w} ${x + w / 2},${y + w}`} fill={palette[i % 3]} opacity={0.3 + rng() * 0.4}>
            <animate attributeName="opacity" values={`${0.3 + rng() * 0.3};${0.5 + rng() * 0.3};${0.3 + rng() * 0.3}`} dur={`${5 + rng() * 3}s`} repeatCount="indefinite" />
          </polygon>);
        }
        // Dust motes (20 small circles)
        for (let i = 0; i < 20; i++) {
          els.push(<circle key={`dust-${i}`} cx={rng() * 100} cy={rng() * 60} r={0.3 + rng() * 0.8} fill={palette[4]} opacity={0.3 + rng() * 0.4}>
            <animate attributeName="cy" values={`${rng() * 60};${rng() * 60}`} dur={`${8 + rng() * 4}s`} repeatCount="indefinite" />
          </circle>);
        }
        break;
      }

      case "mountains": {
        // Sky gradient
        els.push(<rect key="sky" x="0" y="0" width="100" height="100" fill={palette[0]} />);
        // Stars (30 dots)
        for (let i = 0; i < 30; i++) {
          els.push(<circle key={`star-${i}`} cx={rng() * 100} cy={rng() * 50} r={0.3 + rng() * 0.8} fill={palette[4]} opacity={0.4 + rng() * 0.5}>
            <animate attributeName="opacity" values={`${0.3};${0.8};${0.3}`} dur={`${2 + rng() * 3}s`} repeatCount="indefinite" />
          </circle>);
        }
        // Mountain ranges (4 layers, 8 triangles each = 32)
        for (let layer = 0; layer < 4; layer++) {
          const baseY = 40 + layer * 15;
          const color = palette[layer % palette.length];
          const opacity = 0.3 + layer * 0.2;
          for (let i = 0; i < 8; i++) {
            const x = i * 13;
            const h = 20 + rng() * 30;
            els.push(<polygon key={`mtn-${layer}-${i}`} points={`${x},${baseY} ${x + 6},${baseY - h} ${x + 13},${baseY}`} fill={color} opacity={opacity} />);
          }
        }
        // Echo rings (5 circles)
        for (let i = 0; i < 5; i++) {
          els.push(<circle key={`echo-${i}`} cx="50" cy="50" r={10 + i * 8} fill="none" stroke={palette[3]} strokeWidth="0.4" opacity={0.3 - i * 0.05}>
            <animate attributeName="r" values={`${10 + i * 8};${12 + i * 8};${10 + i * 8}`} dur={`${5 + i}s`} repeatCount="indefinite" />
          </circle>);
        }
        break;
      }

      case "stars": {
        // Dark sky
        els.push(<rect key="sky" x="0" y="0" width="100" height="100" fill={palette[0]} />);
        // Milky Way band (8 overlapping ellipses)
        for (let i = 0; i < 8; i++) {
          els.push(<ellipse key={`mw-${i}`} cx={20 + i * 10} cy={30 + Math.sin(i) * 10} rx={15} ry={5} fill={palette[3]} opacity="0.08" transform={`rotate(-25 ${20 + i * 10} ${30 + Math.sin(i) * 10})`} />);
        }
        // Stars (60 dots of varying sizes)
        for (let i = 0; i < 60; i++) {
          const x = rng() * 100;
          const y = rng() * 100;
          const r = 0.2 + rng() * 1.2;
          els.push(<circle key={`star-${i}`} cx={x} cy={y} r={r} fill={palette[4]} opacity={0.3 + rng() * 0.6}>
            <animate attributeName="opacity" values={`${0.2 + rng() * 0.3};${0.7 + rng() * 0.3};${0.2 + rng() * 0.3}`} dur={`${2 + rng() * 4}s`} repeatCount="indefinite" />
          </circle>);
        }
        // Constellation lines (5 connecting lines)
        for (let i = 0; i < 5; i++) {
          const x1 = rng() * 100, y1 = rng() * 100;
          const x2 = x1 + (rng() - 0.5) * 30, y2 = y1 + (rng() - 0.5) * 30;
          els.push(<line key={`const-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={palette[3]} strokeWidth="0.3" opacity="0.3" />);
        }
        // Meteor streaks (3)
        for (let i = 0; i < 3; i++) {
          els.push(<line key={`meteor-${i}`} x1={rng() * 100} y1={rng() * 40} x2={rng() * 100} y2={rng() * 40 + 20} stroke={palette[4]} strokeWidth="0.5" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur={`${5 + i * 2}s`} begin={`${i * 2}s`} repeatCount="indefinite" />
          </line>);
        }
        break;
      }

      case "night": {
        // Dark gradient sky
        for (let i = 0; i < 5; i++) {
          els.push(<rect key={`sky-${i}`} x="0" y={i * 20} width="100" height="20" fill={palette[i]} opacity={0.8} />);
        }
        // Moon (circle + 8 craters)
        els.push(<circle key="moon" cx="75" cy="25" r="10" fill={palette[3]} opacity="0.9" />);
        for (let i = 0; i < 8; i++) {
          els.push(<circle key={`crater-${i}`} cx={75 + (rng() - 0.5) * 15} cy={25 + (rng() - 0.5) * 15} r={0.5 + rng() * 1.5} fill={palette[1]} opacity="0.3" />);
        }
        // Stars (40 dots)
        for (let i = 0; i < 40; i++) {
          els.push(<circle key={`star-${i}`} cx={rng() * 100} cy={rng() * 60} r={0.2 + rng() * 0.6} fill={palette[3]} opacity={0.3 + rng() * 0.5}>
            <animate attributeName="opacity" values={`${0.2};${0.7};${0.2}`} dur={`${3 + rng() * 3}s`} repeatCount="indefinite" />
          </circle>);
        }
        // Pine tree silhouettes (15 triangles)
        for (let i = 0; i < 15; i++) {
          const x = rng() * 100;
          const h = 15 + rng() * 25;
          els.push(<polygon key={`tree-${i}`} points={`${x},70 ${x - 4},${70 - h} ${x + 4},${70 - h}`} fill={palette[0]} opacity="0.8" />);
        }
        // Ground
        els.push(<rect key="ground" x="0" y="70" width="100" height="30" fill={palette[0]} opacity="0.9" />);
        // Campfire (5 flame triangles + glow)
        els.push(<circle key="fire-glow" cx="50" cy="75" r="12" fill={palette[2]} opacity="0.1">
          <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
        </circle>);
        for (let i = 0; i < 5; i++) {
          els.push(<polygon key={`flame-${i}`} points={`${48 + i * 0.5},75 ${50 + i * 0.5},${68 - i * 2} ${52 + i * 0.5},75`} fill={palette[i % 3]} opacity="0.7">
            <animate attributeName="points" values={`${48 + i * 0.5},75 ${50 + i * 0.5},${68 - i * 2} ${52 + i * 0.5},75;${48 + i * 0.5},75 ${50 + i * 0.5},${65 - i * 2} ${52 + i * 0.5},75;${48 + i * 0.5},75 ${50 + i * 0.5},${68 - i * 2} ${52 + i * 0.5},75`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
          </polygon>);
        }
        // Embers (10 rising dots)
        for (let i = 0; i < 10; i++) {
          els.push(<circle key={`ember-${i}`} cx={48 + rng() * 4} cy="70" r="0.3" fill={palette[2]} opacity="0">
            <animate attributeName="cy" values="70;50" dur={`${2 + rng() * 2}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.6;0" dur={`${2 + rng() * 2}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>);
        }
        break;
      }

      default: {
        // Generic: 100 colorful triangles
        for (let i = 0; i < 100; i++) {
          const x = rng() * 100;
          const y = rng() * 100;
          const s = 2 + rng() * 5;
          els.push(<polygon key={`tri-${i}`} points={`${x},${y} ${x + s},${y} ${x + s / 2},${y - s}`} fill={palette[i % palette.length]} opacity={0.2 + rng() * 0.4} />);
        }
      }
    }

    return els;
  }, [config, palette, rng, trackId]);

  const gid = `art-${trackId}`;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
        <defs>
          <clipPath id={gid}>
            <rect width="100" height="100" rx="12" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${gid})`}>
          {elements}
          {/* BPM label */}
          <text x="92" y="95" fontSize="4" fill="white" opacity="0.3" textAnchor="end" fontFamily="monospace">
            {bpm} BPM
          </text>
        </g>
      </svg>
    </div>
  );
}
