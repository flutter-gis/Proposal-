"use client";

/**
 * preferences.ts
 *
 * User preferences for icon theme + display settings.
 * Persisted to localStorage. Shared via React context.
 *
 * Icon modes:
 *   - 'auto'  — automatically switches based on time of day
 *   - 'manual' — user picks a specific icon theme
 *
 * Theme modes:
 *   - 'auto'  — follows icon theme color palette
 *   - 'manual' — user picks a specific color theme
 */

export type IconMode = "auto" | "manual";
export type ThemeMode = "auto" | "manual";

export type IconTheme =
  | "sunrise"
  | "morning"
  | "afternoon"
  | "golden"
  | "sunset"
  | "dusk"
  | "midnight"
  | "stargazing"
  | "heart"
  | "ring"
  | "proposal"
  | "anniversary";

export type ColorTheme =
  | "dawn"        // warm amber
  | "day"         // bright blue
  | "forest"      // deep green
  | "golden"      // orange/gold
  | "sunset"      // red/orange
  | "dusk"        // purple/violet
  | "night"       // deep indigo
  | "cosmic"      // starry blue
  | "love"        // rose/pink
  | "brass"       // gold/brown (default)
  | "proposal"    // L-05: distinct from sunset — rose-gold + champagne
  | "anniversary";// L-05: distinct from dusk — champagne gold + deep plum

export interface Preferences {
  iconMode: IconMode;
  manualIcon: IconTheme;
  themeMode: ThemeMode;
  manualTheme: ColorTheme;
  reducedMotion: boolean;
}

const STORAGE_KEY = "wilderness-romance-prefs";

const DEFAULT_PREFS: Preferences = {
  iconMode: "auto",
  manualIcon: "ring",
  themeMode: "auto", // Always follows icon — no manual override
  manualTheme: "brass",
  reducedMotion: false,
};

// ── Time-of-day → icon mapping ──────────────────────────────────────────
const TIME_SLOTS: { hour: number; icon: IconTheme }[] = [
  { hour: 1, icon: "stargazing" },   // 1–5 AM
  { hour: 5, icon: "sunrise" },      // 5–8 AM
  { hour: 8, icon: "morning" },      // 8 AM–12 PM
  { hour: 12, icon: "afternoon" },   // 12–5 PM
  { hour: 17, icon: "golden" },      // 5–7 PM
  { hour: 19, icon: "sunset" },      // 7–8 PM
  { hour: 20, icon: "dusk" },        // 8–9 PM
  { hour: 21, icon: "midnight" },    // 9 PM–1 AM
];

export function getIconForHour(hour: number): IconTheme {
  for (let i = TIME_SLOTS.length - 1; i >= 0; i--) {
    if (hour >= TIME_SLOTS[i].hour) return TIME_SLOTS[i].icon;
  }
  return "stargazing"; // before 5 AM
}

export function getCurrentAutoIcon(): IconTheme {
  return getIconForHour(new Date().getHours());
}

// ── Icon → color theme mapping ──────────────────────────────────────────
export const ICON_TO_THEME: Record<IconTheme, ColorTheme> = {
  sunrise: "dawn",
  morning: "day",
  afternoon: "forest",
  golden: "golden",
  sunset: "sunset",
  dusk: "dusk",
  midnight: "night",
  stargazing: "cosmic",
  heart: "love",
  ring: "brass",
  proposal: "proposal",      // L-05: now distinct
  anniversary: "anniversary", // L-05: now distinct
};

// ── Color theme palettes ────────────────────────────────────────────────
// Each theme defines a COMPLETE set of CSS variables that drive every
// color in the app. When the theme changes, ALL these variables update
// simultaneously via the data-theme attribute on <html>.

export interface ThemePalette {
  // Core background + text
  bg: string;            // page background
  bgDark: string;        // darker bg variant (for dark sections)
  cream: string;         // light card background
  parchment: string;     // slightly darker card background
  text: string;          // primary text color
  textMuted: string;     // secondary text color
  textOnDark: string;    // text on dark backgrounds

  // Brand colors
  primary: string;       // primary brand color (buttons, active states)
  accent: string;        // accent color (highlights, links)
  forest: string;        // forest green (nature elements)
  bark: string;          // dark brown (dark cards)
  ember: string;         // warm orange (accents)
  wax: string;           // deep red (seals, emotional)
  brass: string;         // gold (premium elements)
  sage: string;          // muted green (subtle accents)
  leather: string;       // brown (borders, secondary)

  // Borders + shadows
  border: string;        // card borders
  borderDark: string;    // borders on dark cards

  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;

  // Aurora background colors (for AuroraRoot canvas)
  aurora1: string;
  aurora2: string;
  aurora3: string;

  // Gradient directions for cards
  cardGradient: string;    // CSS for light cards
  cardDarkGradient: string; // CSS for dark cards
  buttonGradient: string;  // CSS for primary buttons

  // Animation tuning
  animGlow: string;       // glow color for breathing animations
  animParticle: string;   // particle color for dust/sparkle effects
}

export const THEME_PALETTES: Record<ColorTheme, ThemePalette> = {
  brass: {
    bg: "#f5ebd6", bgDark: "#1a1410", cream: "#faf3e3", parchment: "#ede0c4",
    text: "#3d2817", textMuted: "#6b4423", textOnDark: "#faf3e3",
    primary: "#2d4a3a", accent: "#b8541f", forest: "#2d4a3a", bark: "#3d2817",
    ember: "#b8541f", wax: "#7a2418", brass: "#b8860b", sage: "#8a9a7a", leather: "#6b4423",
    border: "#d4c4a4", borderDark: "#4a3525",
    chart1: "#2d4a3a", chart2: "#b8541f", chart3: "#b8860b",
    aurora1: "#2d4a3a", aurora2: "#b8860b", aurora3: "#7a2418",
    cardGradient: "linear-gradient(135deg, #faf3e3 0%, #ede0c4 100%)",
    cardDarkGradient: "linear-gradient(135deg, #2a2018 0%, #1a1410 100%)",
    buttonGradient: "linear-gradient(180deg, #d4a017 0%, #b8860b 50%, #8a6408 100%)",
    animGlow: "rgba(184,134,11,0.3)",
    animParticle: "rgba(251,235,200,0.4)",
  },
  dawn: {
    bg: "#fef3c7", bgDark: "#78350f", cream: "#fffbeb", parchment: "#fef3c7",
    text: "#78350f", textMuted: "#92400e", textOnDark: "#fef3c7",
    primary: "#b45309", accent: "#c2410c", forest: "#92400e", bark: "#451a03",
    ember: "#ea580c", wax: "#b91c1c", brass: "#b45309", sage: "#a16207", leather: "#92400e",
    border: "#fde68a", borderDark: "#78350f",
    chart1: "#b45309", chart2: "#d97706", chart3: "#ea580c",
    aurora1: "#fbbf24", aurora2: "#f97316", aurora3: "#dc2626",
    cardGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    cardDarkGradient: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    buttonGradient: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
    animGlow: "rgba(245,158,11,0.4)",
    animParticle: "rgba(254,243,199,0.6)",
  },
  day: {
    bg: "#e0f2fe", bgDark: "#0c4a6e", cream: "#f0f9ff", parchment: "#e0f2fe",
    text: "#0c4a6e", textMuted: "#075985", textOnDark: "#e0f2fe",
    primary: "#0369a1", accent: "#0c4a6e", forest: "#0369a1", bark: "#082f49",
    ember: "#0ea5e9", wax: "#0c4a6e", brass: "#0369a1", sage: "#0284c7", leather: "#0369a1",
    border: "#bae6fd", borderDark: "#0c4a6e",
    chart1: "#0369a1", chart2: "#0ea5e9", chart3: "#38bdf8",
    aurora1: "#38bdf8", aurora2: "#0ea5e9", aurora3: "#0284c7",
    cardGradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    cardDarkGradient: "linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)",
    buttonGradient: "linear-gradient(180deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)",
    animGlow: "rgba(14,165,233,0.3)",
    animParticle: "rgba(224,242,254,0.5)",
  },
  forest: {
    bg: "#f0fdf4", bgDark: "#14532d", cream: "#f7fef9", parchment: "#dcfce7",
    text: "#14532d", textMuted: "#166534", textOnDark: "#f0fdf4",
    primary: "#15803d", accent: "#166534", forest: "#15803d", bark: "#052e16",
    ember: "#65a30d", wax: "#166534", brass: "#4d7c0f", sage: "#84cc16", leather: "#166534",
    border: "#bbf7d0", borderDark: "#14532d",
    chart1: "#15803d", chart2: "#65a30d", chart3: "#84cc16",
    aurora1: "#22c55e", aurora2: "#16a34a", aurora3: "#15803d",
    cardGradient: "linear-gradient(135deg, #f7fef9 0%, #dcfce7 100%)",
    cardDarkGradient: "linear-gradient(135deg, #14532d 0%, #052e16 100%)",
    buttonGradient: "linear-gradient(180deg, #4ade80 0%, #16a34a 50%, #15803d 100%)",
    animGlow: "rgba(22,163,74,0.3)",
    animParticle: "rgba(240,253,244,0.5)",
  },
  golden: {
    bg: "#fff7ed", bgDark: "#7c2d12", cream: "#fffbeb", parchment: "#ffedd5",
    text: "#7c2d12", textMuted: "#9a3412", textOnDark: "#fff7ed",
    primary: "#c2410c", accent: "#9a3412", forest: "#c2410c", bark: "#431407",
    ember: "#f97316", wax: "#9a3412", brass: "#c2410c", sage: "#fdba74", leather: "#9a3412",
    border: "#fed7aa", borderDark: "#7c2d12",
    chart1: "#c2410c", chart2: "#ea580c", chart3: "#fb923c",
    aurora1: "#fb923c", aurora2: "#f97316", aurora3: "#dc2626",
    cardGradient: "linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%)",
    cardDarkGradient: "linear-gradient(135deg, #7c2d12 0%, #431407 100%)",
    buttonGradient: "linear-gradient(180deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
    animGlow: "rgba(249,115,22,0.4)",
    animParticle: "rgba(255,247,237,0.6)",
  },
  sunset: {
    bg: "#fef2f2", bgDark: "#7f1d1d", cream: "#fff5f5", parchment: "#fee2e2",
    text: "#7f1d1d", textMuted: "#991b1b", textOnDark: "#fef2f2",
    primary: "#dc2626", accent: "#b91c1c", forest: "#991b1b", bark: "#450a0a",
    ember: "#ef4444", wax: "#991b1b", brass: "#b91c1c", sage: "#fca5a5", leather: "#991b1b",
    border: "#fecaca", borderDark: "#7f1d1d",
    chart1: "#dc2626", chart2: "#ef4444", chart3: "#f87171",
    aurora1: "#ef4444", aurora2: "#dc2626", aurora3: "#991b1b",
    cardGradient: "linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)",
    cardDarkGradient: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)",
    buttonGradient: "linear-gradient(180deg, #f87171 0%, #dc2626 50%, #b91c1c 100%)",
    animGlow: "rgba(220,38,38,0.4)",
    animParticle: "rgba(254,242,242,0.5)",
  },
  dusk: {
    bg: "#f5f3ff", bgDark: "#4c1d95", cream: "#faf5ff", parchment: "#ede9fe",
    text: "#4c1d95", textMuted: "#5b21b6", textOnDark: "#f5f3ff",
    primary: "#7c3aed", accent: "#6d28d9", forest: "#5b21b6", bark: "#2e1065",
    ember: "#8b5cf6", wax: "#5b21b6", brass: "#6d28d9", sage: "#c4b5fd", leather: "#5b21b6",
    border: "#ddd6fe", borderDark: "#4c1d95",
    chart1: "#7c3aed", chart2: "#8b5cf6", chart3: "#a78bfa",
    aurora1: "#8b5cf6", aurora2: "#7c3aed", aurora3: "#6d28d9",
    cardGradient: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)",
    cardDarkGradient: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
    buttonGradient: "linear-gradient(180deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)",
    animGlow: "rgba(124,58,237,0.4)",
    animParticle: "rgba(245,243,255,0.5)",
  },
  night: {
    bg: "#1e1b4b", bgDark: "#0f0a2e", cream: "#2a2660", parchment: "#3730a3",
    text: "#e0e7ff", textMuted: "#a5b4fc", textOnDark: "#e0e7ff",
    primary: "#a5b4fc", accent: "#818cf8", forest: "#6366f1", bark: "#0f0a2e",
    ember: "#c7d2fe", wax: "#818cf8", brass: "#c7d2fe", sage: "#a5b4fc", leather: "#6366f1",
    border: "#4338ca", borderDark: "#1e1b4b",
    chart1: "#818cf8", chart2: "#a5b4fc", chart3: "#c7d2fe",
    aurora1: "#6366f1", aurora2: "#4f46e5", aurora3: "#4338ca",
    cardGradient: "linear-gradient(135deg, #2a2660 0%, #1e1b4b 100%)",
    cardDarkGradient: "linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 100%)",
    buttonGradient: "linear-gradient(180deg, #a5b4fc 0%, #818cf8 50%, #6366f1 100%)",
    animGlow: "rgba(99,102,241,0.4)",
    animParticle: "rgba(224,231,255,0.5)",
  },
  cosmic: {
    bg: "#0f0a2e", bgDark: "#020617", cream: "#1e1b4b", parchment: "#1e293b",
    text: "#e0e7ff", textMuted: "#94a3b8", textOnDark: "#e0e7ff",
    primary: "#c4b5fd", accent: "#a78bfa", forest: "#8b5cf6", bark: "#020617",
    ember: "#ddd6fe", wax: "#a78bfa", brass: "#ddd6fe", sage: "#c4b5fd", leather: "#8b5cf6",
    border: "#312e81", borderDark: "#1e1b4b",
    chart1: "#a78bfa", chart2: "#c4b5fd", chart3: "#ddd6fe",
    aurora1: "#8b5cf6", aurora2: "#6366f1", aurora3: "#4338ca",
    cardGradient: "linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 100%)",
    cardDarkGradient: "linear-gradient(135deg, #0f0a2e 0%, #020617 100%)",
    buttonGradient: "linear-gradient(180deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%)",
    animGlow: "rgba(139,92,246,0.4)",
    animParticle: "rgba(196,181,253,0.5)",
  },
  love: {
    bg: "#fdf2f8", bgDark: "#831843", cream: "#fef5f9", parchment: "#fce7f3",
    text: "#831843", textMuted: "#9d174d", textOnDark: "#fdf2f8",
    primary: "#be185d", accent: "#9d174d", forest: "#be185d", bark: "#500724",
    ember: "#f472b6", wax: "#9d174d", brass: "#be185d", sage: "#ec4899", leather: "#9d174d",
    border: "#fbcfe8", borderDark: "#831843",
    chart1: "#be185d", chart2: "#ec4899", chart3: "#f472b6",
    aurora1: "#f472b6", aurora2: "#ec4899", aurora3: "#db2777",
    cardGradient: "linear-gradient(135deg, #fef5f9 0%, #fce7f3 100%)",
    cardDarkGradient: "linear-gradient(135deg, #831843 0%, #500724 100%)",
    buttonGradient: "linear-gradient(180deg, #f9a8d4 0%, #ec4899 50%, #db2777 100%)",
    animGlow: "rgba(236,72,153,0.4)",
    animParticle: "rgba(253,242,248,0.6)",
  },
  // L-05: Proposal — rose-gold + champagne, distinct from sunset's pure red
  proposal: {
    bg: "#fff5f0", bgDark: "#7c2d3a", cream: "#fffaf5", parchment: "#ffe8d6",
    text: "#7c2d3a", textMuted: "#9a4456", textOnDark: "#fff5f0",
    primary: "#c2185b", accent: "#ad1457", forest: "#a8385a", bark: "#4a1828",
    ember: "#e91e63", wax: "#ad1457", brass: "#c2185b", sage: "#d4749a", leather: "#9a4456",
    border: "#ffd6c4", borderDark: "#7c2d3a",
    chart1: "#c2185b", chart2: "#e91e63", chart3: "#f48fb1",
    aurora1: "#f48fb1", aurora2: "#e91e63", aurora3: "#c2185b",
    cardGradient: "linear-gradient(135deg, #fffaf5 0%, #ffe8d6 100%)",
    cardDarkGradient: "linear-gradient(135deg, #7c2d3a 0%, #4a1828 100%)",
    buttonGradient: "linear-gradient(180deg, #f48fb1 0%, #e91e63 50%, #c2185b 100%)",
    animGlow: "rgba(233,30,99,0.35)",
    animParticle: "rgba(255,245,240,0.6)",
  },
  // L-05: Anniversary — champagne gold + deep plum, distinct from dusk's pure violet
  anniversary: {
    bg: "#faf6f0", bgDark: "#3d1f3d", cream: "#fffcf5", parchment: "#f0e0c8",
    text: "#3d1f3d", textMuted: "#5d3a5d", textOnDark: "#faf6f0",
    primary: "#b8860b", accent: "#8b6914", forest: "#5d3a5d", bark: "#2a0e2a",
    ember: "#d4a017", wax: "#6d2878", brass: "#d4af37", sage: "#b8860b", leather: "#5d3a5d",
    border: "#e8d4a8", borderDark: "#3d1f3d",
    chart1: "#b8860b", chart2: "#d4af37", chart3: "#8b6914",
    aurora1: "#d4af37", aurora2: "#b8860b", aurora3: "#6d2878",
    cardGradient: "linear-gradient(135deg, #fffcf5 0%, #f0e0c8 100%)",
    cardDarkGradient: "linear-gradient(135deg, #3d1f3d 0%, #2a0e2a 100%)",
    buttonGradient: "linear-gradient(180deg, #e8c878 0%, #d4af37 50%, #b8860b 100%)",
    animGlow: "rgba(212,175,55,0.4)",
    animParticle: "rgba(250,246,240,0.6)",
  },
};

// ── Icon metadata ───────────────────────────────────────────────────────
export interface IconMeta {
  name: IconTheme;
  label: string;
  description: string;
  emoji: string;
  timeRange?: string;
}

export const ICON_LIST: IconMeta[] = [
  { name: "sunrise", label: "Sunrise", description: "Dawn over the mountains", emoji: "🌅", timeRange: "5–8 AM" },
  { name: "morning", label: "Morning", description: "Bright sky, scattered clouds", emoji: "☀️", timeRange: "8 AM–12 PM" },
  { name: "afternoon", label: "Afternoon", description: "Pine forest in full sun", emoji: "🌲", timeRange: "12–5 PM" },
  { name: "golden", label: "Golden Hour", description: "Warm light on the cliff", emoji: "🌇", timeRange: "5–7 PM" },
  { name: "sunset", label: "Sunset", description: "Sun dipping below horizon", emoji: "🌆", timeRange: "7–8 PM" },
  { name: "dusk", label: "Dusk", description: "Twilight and fireflies", emoji: "🌆", timeRange: "8–9 PM" },
  { name: "midnight", label: "Midnight", description: "Full moon over pines", emoji: "🌙", timeRange: "9 PM–1 AM" },
  { name: "stargazing", label: "Stargazing", description: "Milky Way at Bortle Class 2", emoji: "🌌", timeRange: "1–5 AM" },
  { name: "heart", label: "Heart", description: "Love-themed rose", emoji: "❤️" },
  { name: "ring", label: "Ring", description: "The engagement ring", emoji: "💍" },
  { name: "proposal", label: "Proposal", description: "The cliff at golden hour", emoji: "💎" },
  { name: "anniversary", label: "Anniversary", description: "Eternal infinity symbol", emoji: "♾️" },
];

// ── Preferences storage ─────────────────────────────────────────────────
export function loadPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: Preferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// ── Resolve effective icon + theme ──────────────────────────────────────
export function getEffectiveIcon(prefs: Preferences): IconTheme {
  if (prefs.iconMode === "auto") return getCurrentAutoIcon();
  return prefs.manualIcon;
}

export function getEffectiveTheme(prefs: Preferences): ColorTheme {
  if (prefs.themeMode === "auto") {
    return ICON_TO_THEME[getEffectiveIcon(prefs)];
  }
  return prefs.manualTheme;
}

// ── Dynamic PWA manifest icon update ────────────────────────────────────
export function updatePWAIcons(icon: IconTheme): void {
  if (typeof document === "undefined") return;

  const iconBase = `/icons/themes/${icon}`;

  // Update ALL icon links
  const iconLinks = document.querySelectorAll('link[rel="icon"]');
  iconLinks.forEach((link) => {
    const el = link as HTMLLinkElement;
    const sizes = el.getAttribute("sizes");
    if (sizes === "32x32" || sizes === "192x192") el.href = `${iconBase}-192.png`;
    if (sizes === "512x512") el.href = `${iconBase}-512.png`;
  });

  // Update apple-touch-icon
  const apple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
  if (apple) apple.href = `${iconBase}-apple-180.png`;

  // Update shortcut icon
  const shortcut = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
  if (shortcut) shortcut.href = `${iconBase}-192.png`;
}

// ── Apply theme to document ─────────────────────────────────────────────
// Sets ALL CSS custom properties on :root so every element that references
// them updates instantly. This is the KEY function that makes themes work.
//
// Theme 7.2 (audit): For dark themes (night, cosmic), `--card` and `--popover`
// must be dark surface colors, not the light `cream` value. Otherwise cards
// render as bright rectangles on a near-black background.
//
// Contrast fix: We now derive semantic text colors that adapt to the theme:
//   --text-on-light   — dark text for use on light backgrounds (cream, parchment, bg)
//   --text-on-dark    — light text for use on dark backgrounds (bark, bgDark)
//   --text-muted-light — muted dark text for secondary content on light bg
//   --text-muted-dark  — muted light text for secondary content on dark bg
// These ensure text is ALWAYS visible regardless of which theme is active.
const DARK_THEMES: ReadonlySet<ColorTheme> = new Set(["night", "cosmic"]);

/** Compute relative luminance (WCAG) for contrast calculations. */
function relLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length < 6) return 0;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Darken a hex color by a factor (0-1, lower = darker). */
function darken(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex;
  const r = Math.round(parseInt(h.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(h.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(h.slice(4, 6), 16) * factor);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

/** Lighten a hex color by mixing with white (0-1, higher = lighter). */
function lighten(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const nr = Math.round(r + (255 - r) * factor);
  const ng = Math.round(g + (255 - g) * factor);
  const nb = Math.round(b + (255 - b) * factor);
  return "#" + [nr, ng, nb].map(v => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Given a background hex, return a text color (dark or light) that achieves
 * at least the target contrast ratio. Tries the palette's text and textOnDark
 * first, then falls back to pure black/white.
 */
function bestTextColor(bgHex: string, lightColor: string, darkColor: string, target = 4.5): string {
  const bgLum = relLuminance(bgHex);
  const lightLum = relLuminance(lightColor);
  const darkLum = relLuminance(darkColor);
  // Contrast = (lighter + 0.05) / (darker + 0.05)
  const lightContrast = (Math.max(bgLum, lightLum) + 0.05) / (Math.min(bgLum, lightLum) + 0.05);
  const darkContrast = (Math.max(bgLum, darkLum) + 0.05) / (Math.min(bgLum, darkLum) + 0.05);
  if (lightContrast >= target) return lightColor;
  if (darkContrast >= target) return darkColor;
  // Neither passes — pick the better one and darken/lighten to meet target
  return bgLum > 0.4 ? darken(darkColor, 0.3) : lighten(lightColor, 0.3);
}

export function applyThemeToDocument(theme: ColorTheme): void {
  if (typeof document === "undefined") return;

  const palette = THEME_PALETTES[theme];
  if (!palette) return;

  const root = document.documentElement;
  const isDark = DARK_THEMES.has(theme);

  // ── Semantic text colors that adapt to theme ────────────────────────
  // In light themes: text-on-light = dark, text-on-dark = light
  // In dark themes: text-on-light = light (because "light" surfaces are actually
  //   dark in dark themes), text-on-dark = light
  // The key insight: components use text-on-light when they're on a cream/parchment
  // surface, and text-on-dark when on a bark/bgDark surface.
  const textOnLight = isDark ? palette.textOnDark : palette.text;
  const textOnDark = palette.textOnDark;
  const textMutedLight = isDark ? palette.textMuted : palette.textMuted;
  const textMutedDark = palette.textMuted;

  // For dark themes, bark must stay DARK (it's used as bark-card background).
  // The original night/cosmic palettes set bark to a light color which broke
  // bark-card backgrounds. Fix: always use a dark bark for the background,
  // and use textOnDark for text on bark-card.
  const darkBark = isDark ? palette.bgDark : palette.bark;

  // For dark themes, use a dark surface for cards; for light themes, use cream.
  const cardSurface = isDark ? palette.bgDark : palette.cream;
  const cardFg = isDark ? palette.textOnDark : palette.text;
  const popoverSurface = isDark ? palette.bgDark : palette.cream;
  const popoverFg = isDark ? palette.textOnDark : palette.text;
  const mutedSurface = isDark ? palette.bgDark : palette.parchment;

  // Compute best text colors for common backgrounds
  const textOnBg = bestTextColor(palette.bg, palette.textOnDark, palette.text);
  const textOnCream = bestTextColor(palette.cream, palette.textOnDark, palette.text);
  const textOnParchment = bestTextColor(palette.parchment, palette.textOnDark, palette.text);
  const textOnBrass = bestTextColor(palette.brass, "#ffffff", "#1a1410");
  const textOnPrimary = bestTextColor(palette.primary, "#ffffff", "#1a1410");
  const textOnAccent = bestTextColor(palette.accent, "#ffffff", "#1a1410");

  // Set data-theme attribute for any CSS that uses [data-theme="..."]
  root.setAttribute("data-theme", theme);

  // Apply ALL CSS custom properties — these drive every color in the app
  const vars: Record<string, string> = {
    "--rust-bg": palette.bg,
    "--rust-bg-dark": palette.bgDark,
    "--rust-cream": palette.cream,
    "--rust-parchment": palette.parchment,
    "--rust-forest": palette.forest,
    "--rust-bark": darkBark,
    "--rust-ember": palette.ember,
    "--rust-wax": palette.wax,
    "--rust-brass": palette.brass,
    "--rust-sage": palette.sage,
    "--rust-leather": palette.leather,
    "--background": palette.bg,
    "--foreground": textOnBg,
    "--card": cardSurface,
    "--card-foreground": cardFg,
    "--popover": popoverSurface,
    "--popover-foreground": popoverFg,
    "--primary": palette.primary,
    "--primary-foreground": textOnPrimary,
    "--secondary": mutedSurface,
    "--secondary-foreground": cardFg,
    "--muted": mutedSurface,
    "--muted-foreground": textMutedLight,
    "--accent": palette.accent,
    "--accent-foreground": textOnAccent,
    "--destructive": palette.wax,
    "--border": isDark ? palette.borderDark : palette.border,
    "--input": palette.border,
    "--ring": palette.brass,
    "--chart-1": palette.chart1,
    "--chart-2": palette.chart2,
    "--chart-3": palette.chart3,
    "--chart-4": palette.wax,
    "--chart-5": palette.sage,
    "--sidebar": palette.parchment,
    "--sidebar-foreground": textOnParchment,
    "--sidebar-primary": palette.primary,
    "--sidebar-primary-foreground": textOnPrimary,
    "--sidebar-accent": palette.accent,
    "--sidebar-accent-foreground": textOnAccent,
    "--sidebar-border": palette.border,
    "--sidebar-ring": palette.brass,
    // ── Semantic text colors (contrast-safe) ──────────────────────────
    // Use these in components instead of raw text/bark to guarantee contrast.
    "--text-on-light": textOnLight,        // dark text for cream/parchment/bg
    "--text-on-dark": textOnDark,          // light text for bark/bgDark
    "--text-muted-light": textMutedLight,  // muted text on light surfaces
    "--text-muted-dark": textMutedDark,    // muted text on dark surfaces
    "--text-on-bg": textOnBg,              // best text on page background
    "--text-on-cream": textOnCream,        // best text on cream cards
    "--text-on-brass": textOnBrass,        // best text on brass buttons
    "--text-on-primary": textOnPrimary,    // best text on primary buttons
    "--text-on-accent": textOnAccent,      // best text on accent backgrounds
    // Theme-specific extras
    "--theme-text-on-dark": palette.textOnDark,
    "--theme-border-dark": palette.borderDark,
    "--theme-card-gradient": palette.cardGradient,
    "--theme-card-dark-gradient": palette.cardDarkGradient,
    "--theme-button-gradient": palette.buttonGradient,
    "--theme-anim-glow": palette.animGlow,
    "--theme-anim-particle": palette.animParticle,
    "--theme-aurora-1": palette.aurora1,
    "--theme-aurora-2": palette.aurora2,
    "--theme-aurora-3": palette.aurora3,
    // Per-theme animation speed multiplier (0.7 = slower/calmer, 1.2 = faster/energetic)
    "--theme-anim-speed": theme === "cosmic" ? "0.7" : theme === "love" ? "1.2" : "1",
    // Per-theme particle density (for atmospheric effects)
    "--theme-particle-density": theme === "cosmic" || theme === "night" ? "high" : "normal",
  };

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  // Apply theme-specific animation class to body
  document.body.setAttribute("data-theme-anim", theme);
}
