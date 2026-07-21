"use client";

/**
 * ScenePreview.tsx
 *
 * A 3D scene preview carousel that lets users cycle through all 12 wilderness
 * scenes one after another. Displays the scene name, description, and a
 * full-screen 3D canvas. Auto-advances every 8 seconds, or users can
 * navigate manually with prev/next buttons.
 *
 * Mounted on the Settings page below the icon picker.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, X } from "lucide-react";
import { usePreferences } from "@/lib/preferences-context";
import { getSceneForIcon } from "./WildernessScenes";
import type { IconTheme } from "@/lib/preferences";
import { ICON_LIST } from "@/lib/preferences";

const SCENE_DESCRIPTIONS: Record<IconTheme, { title: string; description: string }> = {
  sunrise: { title: "Lake Gloriette at Dawn", description: "Misty lake with gliding loon, cattail reeds, merganser ducks, and golden rim light on Table Rock" },
  morning: { title: "Bear Brook Forest Trail", description: "Sunlit forest with 120 dust motes, ferns, mossy boulders, deer, and darting chipmunk" },
  afternoon: { title: "Kayak on Pawtuckaway Lake", description: "Sparkling water with red kayak, dragonflies, circling osprey, lily pads, and granite islands" },
  golden: { title: "Cliff Overlook with Easel", description: "Golden hour cliff with artist's easel, half-finished painting, turpentine jar, and whiskey jay" },
  sunset: { title: "Lake Gloriette Cliff Edge", description: "Crimson sunset with Adirondack chairs, champagne bucket, color-shifting cliff, and bat in flight" },
  dusk: { title: "Twilight Forest Path", description: "200 fireflies, glowing mushrooms, barred owl with yellow eyes, and pine silhouettes" },
  midnight: { title: "Coleman Cabin Campfire", description: "Cabin with warm window, 3-layer campfire with embers, crescent moon, and 400 stars" },
  stargazing: { title: "Little Diamond Pond Dock", description: "1,000 Milky Way stars, meteor streaks, mirror pond, and wooden dock under Bortle Class 2 sky" },
  heart: { title: "Wildflower Meadow", description: "18 flowers in 7 colors, 200 grass blades, 3 honeybees, picnic blanket, and butterfly sparkles" },
  ring: { title: "Ring Closeup", description: "Velvet cushion with gold ring, faceted diamond, 7 rotating light prisms, and floating sparkles" },
  proposal: { title: "The Proposal Moment", description: "Kneeling figure at cliff edge, open ring box with glowing diamond, 30 falling rose petals" },
  anniversary: { title: "Anniversary Eternal", description: "Intertwined pine trees, pulsing heart constellation, eternal flame, and 500 stars" },
};

export default function ScenePreview() {
  const { setManualIcon, prefs } = usePreferences();
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIcon = ICON_LIST[idx].name as IconTheme;
  const SceneComponent = getSceneForIcon(currentIcon);
  const desc = SCENE_DESCRIPTIONS[currentIcon];

  const goNext = useCallback(() => {
    setIdx((i) => (i + 1) % ICON_LIST.length);
  }, []);

  const goPrev = useCallback(() => {
    setIdx((i) => (i - 1 + ICON_LIST.length) % ICON_LIST.length);
  }, []);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (!active || !autoPlay) return;
    timerRef.current = setTimeout(goNext, 8000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, autoPlay, idx, goNext]);

  // When user selects a scene, also set it as the active theme
  const selectScene = useCallback((icon: IconTheme) => {
    setManualIcon(icon);
    if (prefs.iconMode === "auto") {
      // Switch to manual so the selected scene sticks
      // (setManualIcon in the context already does this)
    }
  }, [setManualIcon, prefs.iconMode]);

  if (!active) {
    return (
      <div className="leather-card parchment-texture rounded-2xl p-6 mt-6">
        <h3 className="font-lobster text-2xl text-on-light mb-2">
          3D Scene Preview
        </h3>
        <p className="text-sm text-on-light/70 mb-4">
          Preview all 12 wilderness 3D scenes one after another. Each scene
          has unique terrain, wildlife, and atmospheric effects.
        </p>
        <button
          onClick={() => setActive(true)}
          className="brass-button anim-glow-sweep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider tap-feedback min-h-[44px]"
        >
          <Play className="w-4 h-4" />
          Start Scene Preview
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[250] bg-[var(--card)]/95 backdrop-blur-md flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--rust-brass)]/30">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-on-brass font-bold">
            Scene {idx + 1} / {ICON_LIST.length}
          </span>
          <span className="text-sm font-serif text-on-dark">
            {desc.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            aria-label={autoPlay ? "Pause" : "Play"}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-on-dark hover:bg-[var(--rust-brass)]/20 transition-colors tap-feedback"
          >
            {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setActive(false)}
            aria-label="Close preview"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-on-dark hover:bg-[var(--rust-brass)]/20 transition-colors tap-feedback"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 1.4, 5.0], fov: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <SceneComponent phase="reveal" />
          </Suspense>
        </Canvas>

        {/* Scene info overlay */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-md px-4">
          <h2 className="font-pacifico text-3xl text-white mb-2" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
            {desc.title}
          </h2>
          <p className="text-sm text-amber-100/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {desc.description}
          </p>
        </div>

        {/* Nav arrows */}
        <button
          onClick={goPrev}
          aria-label="Previous scene"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-[var(--card)]/60 text-on-dark hover:bg-rust-brass/30 transition-colors tap-feedback"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goNext}
          aria-label="Next scene"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-[var(--card)]/60 text-on-dark hover:bg-rust-brass/30 transition-colors tap-feedback"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Footer — select as active scene */}
      <div className="px-4 py-4 bg-[var(--card)] border-t border-[var(--rust-brass)]/30 text-center">
        <button
          onClick={() => {
            selectScene(currentIcon);
            setActive(false);
          }}
          className="brass-button anim-glow-sweep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider tap-feedback min-h-[44px]"
        >
          Set "{ICON_LIST[idx].label}" as active theme
        </button>
      </div>

      {/* Scene dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {ICON_LIST.map((icon, i) => (
          <button
            key={icon.name}
            onClick={() => setIdx(i)}
            aria-label={`Go to ${icon.label} scene`}
            className={`h-2 rounded-full transition-all tap-feedback ${
              i === idx ? "w-6 bg-rust-brass" : "w-2 bg-[var(--card)]/30 hover:bg-[var(--card)]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
