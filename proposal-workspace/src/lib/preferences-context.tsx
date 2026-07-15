"use client";

/**
 * preferences-context.tsx
 *
 * React context for user preferences (icon theme, color theme, motion).
 * Loads from localStorage on mount, saves on change.
 *
 * Also handles:
 *   - Auto-updating the PWA icons when the icon changes
 *   - Periodic re-check when in 'auto' mode (every 15 min) so the icon
 *     transitions naturally as time passes
 */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";
import {
  loadPreferences, savePreferences, getEffectiveIcon, getEffectiveTheme,
  updatePWAIcons, applyThemeToDocument, type Preferences, type IconTheme,
  type ColorTheme, type ThemePalette, THEME_PALETTES,
} from "./preferences";

interface PreferencesContextValue {
  prefs: Preferences;
  effectiveIcon: IconTheme;
  effectiveTheme: ColorTheme;
  palette: ThemePalette;
  setIconMode: (mode: "auto" | "manual") => void;
  setManualIcon: (icon: IconTheme) => void;
  setThemeMode: (mode: "auto" | "manual") => void;
  setManualTheme: (theme: ColorTheme) => void;
  setReducedMotion: (reduced: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  // Anti-loop guard: tracks the last auto-resolved icon so we can skip
  // unnecessary state writes when the 15-min interval or window focus
  // event fires but the auto-icon hasn't actually changed. Without this,
  // every focus event spreads prefs into a new object reference, causing
  // consumers (EngagementReveal3D, AuroraRoot, etc.) to re-mount.
  const lastAutoIconRef = useRef<IconTheme | null>(null);

  // Load on mount
  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  // Save when prefs change
  useEffect(() => {
    if (prefs) savePreferences(prefs);
  }, [prefs]);

  // Compute effective icon + theme
  const effectiveIcon = prefs ? getEffectiveIcon(prefs) : "ring";
  const effectiveTheme = prefs ? getEffectiveTheme(prefs) : "brass";
  const palette = THEME_PALETTES[effectiveTheme];

  // Update PWA icons when effective icon changes
  useEffect(() => {
    if (prefs) updatePWAIcons(effectiveIcon);
  }, [effectiveIcon, prefs]);

  // CRITICAL: Apply theme to document whenever effective theme changes.
  // This sets ALL CSS custom properties on :root so every element updates.
  useEffect(() => {
    if (prefs) applyThemeToDocument(effectiveTheme);
  }, [effectiveTheme, prefs]);

  // In auto mode, re-check every 15 minutes so the icon transitions
  // naturally as time passes. Guard against unnecessary re-renders by
  // comparing the auto-resolved icon to the last one we saw — only update
  // state if it actually changed.
  useEffect(() => {
    if (!prefs || prefs.iconMode !== "auto") return;
    const id = setInterval(() => {
      const nextIcon = getEffectiveIcon(prefs);
      if (lastAutoIconRef.current === null) {
        lastAutoIconRef.current = nextIcon;
        return;
      }
      if (nextIcon === lastAutoIconRef.current) return;
      lastAutoIconRef.current = nextIcon;
      // Icon changed — force re-render so consumers pick up the new icon
      setPrefs((p) => (p ? { ...p } : p));
    }, 15 * 60 * 1000); // 15 min
    return () => clearInterval(id);
  }, [prefs?.iconMode]);

  // Update on tab focus (user might have been away for hours).
  // Same guard: only re-render if the auto-icon actually changed.
  useEffect(() => {
    if (!prefs || prefs.iconMode !== "auto") return;
    const onFocus = () => {
      const nextIcon = getEffectiveIcon(prefs);
      if (lastAutoIconRef.current === null) {
        lastAutoIconRef.current = nextIcon;
        return;
      }
      if (nextIcon === lastAutoIconRef.current) return;
      lastAutoIconRef.current = nextIcon;
      setPrefs((p) => (p ? { ...p } : p));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [prefs?.iconMode]);

  const setIconMode = useCallback((mode: "auto" | "manual") => {
    setPrefs((p) => (p ? { ...p, iconMode: mode } : p));
  }, []);

  const setManualIcon = useCallback((icon: IconTheme) => {
    setPrefs((p) => (p ? { ...p, manualIcon: icon } : p));
  }, []);

  const setThemeMode = useCallback((mode: "auto" | "manual") => {
    setPrefs((p) => (p ? { ...p, themeMode: mode } : p));
  }, []);

  const setManualTheme = useCallback((theme: ColorTheme) => {
    setPrefs((p) => (p ? { ...p, manualTheme: theme } : p));
  }, []);

  const setReducedMotion = useCallback((reduced: boolean) => {
    setPrefs((p) => (p ? { ...p, reducedMotion: reduced } : p));
  }, []);

  const value: PreferencesContextValue = {
    prefs: prefs ?? {
      iconMode: "auto",
      manualIcon: "ring",
      themeMode: "auto",
      manualTheme: "brass",
      reducedMotion: false,
    },
    effectiveIcon,
    effectiveTheme,
    palette,
    setIconMode,
    setManualIcon,
    setThemeMode,
    setManualTheme,
    setReducedMotion,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  }
  return ctx;
}
