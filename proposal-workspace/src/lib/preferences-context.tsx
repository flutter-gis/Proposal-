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
  createContext, useCallback, useContext, useEffect, useState,
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
  useEffect(() => {
    if (!prefs || prefs.iconMode !== "auto") return;
    const id = setInterval(() => {
      // Force re-render by updating prefs (which re-computes effectiveIcon)
      setPrefs((p) => (p ? { ...p } : p));
    }, 15 * 60 * 1000); // 15 min
    return () => clearInterval(id);
  }, [prefs?.iconMode]);

  // Update on tab focus (user might have been away for hours)
  useEffect(() => {
    if (!prefs || prefs.iconMode !== "auto") return;
    const onFocus = () => setPrefs((p) => (p ? { ...p } : p));
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
