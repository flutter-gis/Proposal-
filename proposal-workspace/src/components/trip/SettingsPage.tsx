"use client";

/**
 * SettingsPage.tsx — cleaned up
 *
 * Color theme always follows the icon (no separate color picker).
 * Settings contains:
 *   - Icon mode: auto (time-based) or manual (pick one)
 *   - Icon picker grid with 12 themes
 *   - 🐌 Reduced motion toggle
 */

import { memo } from "react";
import { usePreferences } from "@/lib/preferences-context";
import { ICON_LIST } from "@/lib/preferences";
import { FlyIn } from "./FlyIn";
import { Settings as SettingsIcon, Sparkles, Clock, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

function SettingsPageImpl() {
  const {
    prefs, effectiveIcon, palette,
    setIconMode, setManualIcon, setReducedMotion,
  } = usePreferences();

  return (
    <section className="px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <h1 className="sr-only">Settings — Icon & Theme Preferences</h1>
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <FlyIn className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rust-bark/80 px-3 py-1 text-[11px] uppercase tracking-widest text-rust-bg">
            <SettingsIcon className="w-3 h-3" /> Settings
          </div>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-rust-bark">
            ⚙️ Make it yours ✨
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-rust-bark/70">
            Choose an app icon — the color theme follows automatically.
            In auto mode, the icon changes with the time of day.
          </p>
        </FlyIn>

        {/* Current icon preview */}
        <FlyIn className="leather-card parchment-texture rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img
                src={`/icons/themes/${effectiveIcon}-192.png`}
                alt={`${effectiveIcon} icon`}
                className="h-20 w-20 rounded-2xl shadow-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-rust-ember font-semibold">
                📍 Current Icon
              </div>
              <div className="font-serif text-xl font-bold text-rust-bark capitalize">
                {effectiveIcon}
              </div>
              <div className="text-xs text-rust-bark/60 mt-0.5">
                {prefs.iconMode === "auto"
                  ? "Auto-switching based on time of day"
                  : "✋ Manually selected"}
              </div>
            </div>
            <div className="flex-shrink-0">
              <span
                className="block h-12 w-12 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: palette.primary }}
                role="img"
                aria-label="Current theme color"
              />
            </div>
          </div>
        </FlyIn>

        {/* Icon mode toggle + picker */}
        <FlyIn className="leather-card parchment-texture rounded-3xl p-6 mb-6">
          <h3 className="mb-4 font-serif text-lg font-bold text-rust-bark flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rust-brass" />
            📱 App Icon
          </h3>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => setIconMode("auto")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all tap-feedback",
                prefs.iconMode === "auto"
                  ? "bg-rust-forest text-rust-cream shadow-md"
                  : "bg-rust-cream/50 text-rust-bark/70 hover:bg-rust-cream"
              )}
            >
              <Clock className="w-4 h-4" />
              🕐 Auto (time-based)
            </button>
            <button
              onClick={() => setIconMode("manual")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all tap-feedback",
                prefs.iconMode === "manual"
                  ? "bg-rust-forest text-rust-cream shadow-md"
                  : "bg-rust-cream/50 text-rust-bark/70 hover:bg-rust-cream"
              )}
            >
              <Sparkles className="w-4 h-4" />
              ✋ Manual
            </button>
          </div>

          {/* Auto mode info */}
          {prefs.iconMode === "auto" && (
            <div className="mb-4 rounded-xl bg-rust-forest/10 p-3 text-xs text-rust-bark/70">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-rust-forest" />
                <span className="font-semibold">Auto-switching active</span>
              </div>
              The icon changes throughout the day: sunrise → morning → afternoon →
              golden hour → sunset → dusk → midnight → stargazing.
            </div>
          )}

          {/* Icon picker grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {ICON_LIST.map((icon) => {
              const isSelected = prefs.manualIcon === icon.name;
              const isCurrent = effectiveIcon === icon.name;
              return (
                <button
                  key={icon.name}
                  onClick={() => {
                    // Guard: skip the state write when the user clicks the
                    // already-selected icon. Prevents unnecessary re-renders
                    // (and the brief flash on the checkmark badge).
                    if (isSelected && prefs.iconMode === "manual") return;
                    setManualIcon(icon.name);
                    if (prefs.iconMode === "auto") setIconMode("manual");
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all tap-feedback",
                    isSelected
                      ? "bg-rust-brass/20 border-2 border-rust-brass"
                      : "bg-rust-cream/50 border-2 border-transparent hover:bg-rust-cream"
                  )}
                  aria-label={`Select ${icon.label} icon`}
                >
                  <img
                    src={`/icons/themes/${icon.name}-192.png`}
                    alt={`${icon.label} icon`}
                    className="h-12 w-12 rounded-xl shadow-sm"
                    loading="lazy"
                  />
                  <div className="text-[10px] font-semibold text-rust-bark text-center leading-tight">
                    {icon.label}
                  </div>
                  {icon.timeRange && (
                    <div className="text-[8px] text-rust-bark/50 text-center">
                      {icon.timeRange}
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rust-forest flex items-center justify-center">
                      <Check className="w-3 h-3 text-rust-cream" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </FlyIn>

        {/* 🎬 Motion preference */}
        <FlyIn className="leather-card parchment-texture rounded-3xl p-6 mb-6">
          <h3 className="mb-4 font-serif text-lg font-bold text-rust-bark">
            🎬 Motion
          </h3>
          <button
            onClick={() => setReducedMotion(!prefs.reducedMotion)}
            className={cn(
              "w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all tap-feedback",
              prefs.reducedMotion
                ? "bg-rust-forest/15"
                : "bg-rust-cream/50 hover:bg-rust-cream"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("h-5 w-5 rounded-full", prefs.reducedMotion ? "bg-rust-forest" : "bg-rust-brass/30")} />
              <div>
                <div className="text-sm font-semibold text-rust-bark">
                  🐌 Reduced motion
                </div>
                <div className="text-xs text-rust-bark/60">
                  Minimize animations and transitions 🌬️
                </div>
              </div>
            </div>
            <div className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              prefs.reducedMotion ? "bg-rust-forest" : "bg-rust-bark/20"
            )}>
              <div className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                prefs.reducedMotion ? "translate-x-5" : "translate-x-0.5"
              )} />
            </div>
          </button>
        </FlyIn>

        {/* Reset & Replay */}
        <FlyIn className="leather-card parchment-texture rounded-3xl p-6 mb-6">
          <h3 className="mb-4 font-serif text-lg font-bold text-rust-bark">
            🔄 Replay Opening
          </h3>
          <p className="text-xs text-rust-bark/60 mb-4 leading-relaxed">
            Reset the engagement reveal so it plays again next time you visit.
            This clears the session cache — the 3D sunset forest, ring box,
            and celebration will replay from the beginning.
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-rust-wax/20 border border-rust-wax/40 text-rust-wax hover:bg-rust-wax/30 transition-all tap-feedback"
          >
            <RotateCcw className="w-4 h-4" />
            Reset & 🔄 Replay Opening
          </button>
        </FlyIn>

        {/* About */}
        <FlyIn className="text-center text-xs text-rust-bark/50 italic">
          Preferences are saved locally. The PWA icon + colors update automatically.
        </FlyIn>
      </div>
    </section>
  );
}

const SettingsPage = memo(SettingsPageImpl);
export default SettingsPage;
