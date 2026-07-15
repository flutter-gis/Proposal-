"use client";

/**
 * AlbumArt.tsx
 *
 * Generates unique, high-quality SVG album art for each composition.
 * Each track gets a distinct visual identity matching its mood.
 * The art is procedurally generated — no image files needed.
 */

import { useMemo } from "react";

interface AlbumArtProps {
  trackId: string;
  title: string;
  description: string;
  bpm: number;
  size?: number;
  className?: string;
}

// Per-track visual themes
const TRACK_THEMES: Record<string, {
  bgGradient: [string, string];
  accent: string;
  shapes: "waves" | "mountains" | "stars" | "circles" | "rings" | "fire" | "leaves" | "butterflies" | "snowflakes" | "hearts";
  mood: string;
}> = {
  "golden-hour": {
    bgGradient: ["#fbbf24", "#dc2626"],
    accent: "#fef3c7",
    shapes: "waves",
    mood: "Warm sunset over golden water",
  },
  "first-light": {
    bgGradient: ["#7c3aed", "#fbbf24"],
    accent: "#fef3c7",
    shapes: "rings",
    mood: "Dawn breaking over mountains",
  },
  "forest-trail": {
    bgGradient: ["#14532d", "#16a34a"],
    accent: "#86efac",
    shapes: "leaves",
    mood: "Sunlight through forest canopy",
  },
  "mountain-echo": {
    bgGradient: ["#1e1b4b", "#4f46e5"],
    accent: "#c4b5fd",
    shapes: "mountains",
    mood: "Vast mountain panorama",
  },
  "the-question": {
    bgGradient: ["#7c2d12", "#fbbf24"],
    accent: "#fef3c7",
    shapes: "rings",
    mood: "Intimate golden hour proposal",
  },
  "starlit-path": {
    bgGradient: ["#020617", "#4f46e5"],
    accent: "#e0e7ff",
    shapes: "stars",
    mood: "Milky Way over dark sky",
  },
  "sunrise-promise": {
    bgGradient: ["#78350f", "#f59e0b"],
    accent: "#fef3c7",
    shapes: "circles",
    mood: "Bright hopeful morning",
  },
  "sunset-vow": {
    bgGradient: ["#7f1d1d", "#f59e0b"],
    accent: "#fde047",
    shapes: "waves",
    mood: "Warm ceremonial sunset",
  },
  "celebration": {
    bgGradient: ["#dc2626", "#fbbf24"],
    accent: "#fef3c7",
    shapes: "butterflies",
    mood: "Joyful golden butterflies",
  },
  "serenity": {
    bgGradient: ["#1e1b4b", "#312e81"],
    accent: "#a5b4fc",
    shapes: "snowflakes",
    mood: "Peaceful midnight snowfall",
  },
};

export default function AlbumArt({ trackId, title, description, bpm, size = 120, className }: AlbumArtProps) {
  const theme = TRACK_THEMES[trackId] || TRACK_THEMES["golden-hour"];

  // Deterministic pseudo-random for stable shapes
  const seed = useMemo(() => {
    let s = 0;
    for (const c of trackId) s = (s * 31 + c.charCodeAt(0)) | 0;
    return Math.abs(s);
  }, [trackId]);

  const rng = useMemo(() => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }, [seed]);

  const shapes = useMemo(() => {
    const arr: { x: number; y: number; r: number; opacity: number; delay: number }[] = [];
    const count = theme.shapes === "stars" ? 40 : theme.shapes === "snowflakes" ? 30 : 12;
    for (let i = 0; i < count; i++) {
      arr.push({
        x: rng() * 100,
        y: rng() * 100,
        r: 1 + rng() * 4,
        opacity: 0.2 + rng() * 0.6,
        delay: rng() * 5,
      });
    }
    return arr;
  }, [rng, theme.shapes]);

  const gradientId = `album-grad-${trackId}`;
  const glowId = `album-glow-${trackId}`;

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
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.bgGradient[0]} />
            <stop offset="100%" stopColor={theme.bgGradient[1]} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background gradient */}
        <rect width="100" height="100" fill={`url(#${gradientId})`} />

        {/* Glow */}
        <rect width="100" height="100" fill={`url(#${glowId})`} />

        {/* Shapes based on theme */}
        {theme.shapes === "stars" && shapes.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.3} fill={theme.accent} opacity={s.opacity}>
            <animate attributeName="opacity" values={`${s.opacity};${s.opacity * 0.3};${s.opacity}`} dur={`${2 + s.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {theme.shapes === "waves" && [0, 1, 2, 3, 4].map(i => (
          <path
            key={i}
            d={`M0 ${50 + i * 8} Q 25 ${45 + i * 8}, 50 ${50 + i * 8} T 100 ${50 + i * 8}`}
            fill="none"
            stroke={theme.accent}
            strokeWidth="0.8"
            opacity={0.3 - i * 0.04}
          >
            <animate attributeName="d" values={`M0 ${50 + i * 8} Q 25 ${45 + i * 8}, 50 ${50 + i * 8} T 100 ${50 + i * 8};M0 ${50 + i * 8} Q 25 ${55 + i * 8}, 50 ${50 + i * 8} T 100 ${50 + i * 8};M0 ${50 + i * 8} Q 25 ${45 + i * 8}, 50 ${50 + i * 8} T 100 ${50 + i * 8}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          </path>
        ))}

        {theme.shapes === "mountains" && [0, 1, 2].map(i => (
          <polygon
            key={i}
            points={`${i * 30},80 ${15 + i * 30},${30 + i * 15} ${30 + i * 30},80`}
            fill={theme.accent}
            opacity={0.15 + i * 0.1}
          />
        ))}

        {theme.shapes === "rings" && [0, 1, 2, 3, 4].map(i => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={10 + i * 8}
            fill="none"
            stroke={theme.accent}
            strokeWidth="0.5"
            opacity={0.4 - i * 0.06}
          >
            <animate attributeName="r" values={`${10 + i * 8};${12 + i * 8};${10 + i * 8}`} dur={`${4 + i}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {theme.shapes === "circles" && shapes.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={theme.accent} opacity={s.opacity * 0.5} />
        ))}

        {theme.shapes === "leaves" && shapes.slice(0, 8).map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx="3" ry="1.5" fill={theme.accent} opacity={s.opacity * 0.4} transform={`rotate(${s.delay * 72} ${s.x} ${s.y})`} />
        ))}

        {theme.shapes === "butterflies" && shapes.slice(0, 6).map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            <ellipse cx="-1.5" cy="0" rx="2" ry="3" fill={theme.accent} opacity={s.opacity * 0.5} />
            <ellipse cx="1.5" cy="0" rx="2" ry="3" fill={theme.accent} opacity={s.opacity * 0.5} />
          </g>
        ))}

        {theme.shapes === "snowflakes" && shapes.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.5} fill={theme.accent} opacity={s.opacity}>
            <animate attributeName="cy" values={`${s.y};${s.y + 100}`} dur={`${5 + s.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {theme.shapes === "fire" && shapes.slice(0, 8).map((s, i) => (
          <circle key={i} cx={s.x} cy={80 - s.r * 5} r={s.r} fill={theme.accent} opacity={s.opacity * 0.4}>
            <animate attributeName="cy" values={`${80 - s.r * 5};${80 - s.r * 5 - 20}`} dur={`${2 + s.delay}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values={`${s.opacity * 0.4};0`} dur={`${2 + s.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {theme.shapes === "hearts" && shapes.slice(0, 6).map((s, i) => (
          <path
            key={i}
            d={`M ${s.x} ${s.y} C ${s.x - 2} ${s.y - 2}, ${s.x - 4} ${s.y}, ${s.x} ${s.y + 3} C ${s.x + 4} ${s.y}, ${s.x + 2} ${s.y - 2}, ${s.x} ${s.y} Z`}
            fill={theme.accent}
            opacity={s.opacity * 0.4}
          />
        ))}

        {/* BPM indicator (bottom-right) */}
        <text
          x="92"
          y="94"
          fontSize="5"
          fill={theme.accent}
          opacity="0.4"
          textAnchor="end"
          fontFamily="monospace"
        >
          {bpm} BPM
        </text>
      </svg>
    </div>
  );
}
