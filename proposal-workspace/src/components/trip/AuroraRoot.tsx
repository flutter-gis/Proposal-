"use client";

/**
 * AuroraRoot.tsx
 *
 * ONE centralized <canvas> at z-0 that draws three soft, drifting "aurora"
 * blobs behind the entire app. The palette is driven by useTrip()'s
 * `auroraVariant`, which is page-aware (and day-aware on the Trip page).
 *
 * Performance:
 *   - Single rAF loop for the whole app.
 *   - Pauses when the tab is hidden (visibilitychange).
 *   - Respects prefers-reduced-motion (renders a static gradient instead).
 *   - Cap devicePixelRatio at 2 to avoid retina blowups.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useTrip, type AuroraVariant } from "@/lib/trip-context";

type RGB = [number, number, number];

interface Palette {
  bg: RGB;
  blobs: [RGB, RGB, RGB];
}

const PALETTES: Record<AuroraVariant, Palette> = {
  forest: {
    bg: [26, 36, 28],
    blobs: [
      [45, 74, 58], // rust-forest
      [90, 111, 74], // rust-moss
      [184, 134, 11], // rust-brass
    ],
  },
  homecoming: {
    bg: [40, 28, 20],
    blobs: [
      [184, 84, 31], // rust-ember
      [184, 134, 11], // brass
      [107, 68, 35], // leather
    ],
  },
  moss: {
    bg: [30, 36, 26],
    blobs: [
      [90, 111, 74],
      [45, 74, 58],
      [138, 154, 122],
    ],
  },
  sunset: {
    bg: [42, 24, 18],
    blobs: [
      [184, 84, 31],
      [122, 36, 24],
      [212, 160, 23],
    ],
  },
  cosmic: {
    bg: [20, 16, 32],
    blobs: [
      [60, 40, 90],
      [184, 134, 11],
      [45, 74, 58],
    ],
  },
  dawn: {
    bg: [54, 36, 24],
    blobs: [
      [212, 160, 23],
      [184, 84, 31],
      [250, 243, 227],
    ],
  },
  lake: {
    bg: [22, 30, 40],
    blobs: [
      [60, 100, 130],
      [90, 111, 74],
      [212, 160, 23],
    ],
  },
  goldenhour: {
    bg: [50, 32, 22],
    blobs: [
      [212, 160, 23],
      [184, 84, 31],
      [250, 200, 100],
    ],
  },
  midnight: {
    bg: [16, 14, 28],
    blobs: [
      [40, 30, 70],
      [184, 134, 11],
      [60, 80, 100],
    ],
  },
};

// Precomputed deterministic blob seeds so SSR/CSR match exactly.
const BLOB_SEEDS = [
  { x: 0.18, y: 0.22, r: 0.55, sx: 0.00018, sy: 0.00022, phase: 0 },
  { x: 0.74, y: 0.30, r: 0.50, sx: -0.00021, sy: 0.00016, phase: 1.7 },
  { x: 0.50, y: 0.80, r: 0.60, sx: 0.00015, sy: -0.00019, phase: 3.4 },
];

export default function AuroraRoot() {
  const { auroraVariant } = useTrip();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const visibleRef = useRef<boolean>(true);
  const variantRef = useRef<AuroraVariant>(auroraVariant);

  // Keep latest variant in a ref so the rAF loop doesn't need to restart.
  useEffect(() => {
    variantRef.current = auroraVariant;
  }, [auroraVariant]);

  const palette = useMemo(() => PALETTES[auroraVariant] ?? PALETTES.forest, [auroraVariant]);

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reducedMotion) return; // CSS handles it

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
      if (visibleRef.current && rafRef.current === null) {
        startRef.current = performance.now();
        rafRef.current = requestAnimationFrame(draw);
      } else if (!visibleRef.current && rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (!visibleRef.current) return;
      const t = (now - startRef.current) | 0;

      const pal = PALETTES[variantRef.current] ?? PALETTES.forest;
      // Background fill
      ctx.fillStyle = `rgb(${pal.bg[0]}, ${pal.bg[1]}, ${pal.bg[2]})`;
      ctx.fillRect(0, 0, w, h);

      // Three drifting radial-gradient blobs.
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < BLOB_SEEDS.length; i++) {
        const b = BLOB_SEEDS[i];
        const cx = (b.x + Math.sin(t * b.sx + b.phase) * 0.08) * w;
        const cy = (b.y + Math.cos(t * b.sy + b.phase) * 0.06) * h;
        const radius = Math.max(w, h) * b.r;
        const c = pal.blobs[i];
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.55)`);
        grad.addColorStop(0.5, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.18)`);
        grad.addColorStop(1, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "source-over";

      // Subtle vignette to keep text readable.
      const vg = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.3,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.8
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    };

    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Reduced-motion path: render a static layered gradient instead of canvas.
  if (reducedMotion) {
    const [a, b, c] = palette.blobs;
    return (
      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 18% 22%, rgba(${a[0]},${a[1]},${a[2]},0.55), transparent 55%),
            radial-gradient(circle at 74% 30%, rgba(${b[0]},${b[1]},${b[2]},0.50), transparent 55%),
            radial-gradient(circle at 50% 80%, rgba(${c[0]},${c[1]},${c[2]},0.55), transparent 60%),
            rgb(${palette.bg[0]}, ${palette.bg[1]}, ${palette.bg[2]})
          `,
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
