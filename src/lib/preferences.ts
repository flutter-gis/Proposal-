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
  | "dawn"      // warm amber
  | "day"       // bright blue
  | "forest"    // deep green
  | "golden"    // orange/gold
  | "sunset"    // red/orange
  | "dusk"      // purple/violet
  | "night"     // deep indigo
  | "cosmic"    // starry blue
  | "love"      // rose/pink
  | "brass";    // gold/brown (default)

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
  proposal: "sunset",
  anniversary: "dusk",
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
    primary: "#d97706", accent: "#f59e0b", forest: "#92400e", bark: "#451a03",
    ember: "#ea580c", wax: "#b91c1c", brass: "#f59e0b", sage: "#a16207", leather: "#92400e",
    border: "#fde68a", borderDark: "#78350f",
    chart1: "#d97706", chart2: "#f59e0b", chart3: "#ea580c",
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
    primary: "#0284c7", accent: "#0ea5e9", forest: "#0369a1", bark: "#082f49",
    ember: "#0ea5e9", wax: "#0c4a6e", brass: "#0ea5e9", sage: "#0284c7", leather: "#0369a1",
    border: "#bae6fd", borderDark: "#0c4a6e",
    chart1: "#0284c7", chart2: "#0ea5e9", chart3: "#38bdf8",
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
    primary: "#16a34a", accent: "#15803d", forest: "#15803d", bark: "#052e16",
    ember: "#65a30d", wax: "#166534", brass: "#4d7c0f", sage: "#84cc16", leather: "#166534",
    border: "#bbf7d0", borderDark: "#14532d",
    chart1: "#16a34a", chart2: "#65a30d", chart3: "#84cc16",
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
    primary: "#f97316", accent: "#ea580c", forest: "#c2410c", bark: "#431407",
    ember: "#f97316", wax: "#9a3412", brass: "#fb923c", sage: "#fdba74", leather: "#9a3412",
    border: "#fed7aa", borderDark: "#7c2d12",
    chart1: "#f97316", chart2: "#ea580c", chart3: "#fb923c",
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
    ember: "#ef4444", wax: "#991b1b", brass: "#f87171", sage: "#fca5a5", leather: "#991b1b",
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
    ember: "#8b5cf6", wax: "#5b21b6", brass: "#a78bfa", sage: "#c4b5fd", leather: "#5b21b6",
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
    bg: "#1e1b4b", bgDark: "#0f0a2e", cream: "#e0e7ff", parchment: "#3730a3",
    text: "#e0e7ff", textMuted: "#a5b4fc", textOnDark: "#e0e7ff",
    primary: "#818cf8", accent: "#6366f1", forest: "#6366f1", bark: "#e0e7ff",
    ember: "#a5b4fc", wax: "#818cf8", brass: "#a5b4fc", sage: "#818cf8", leather: "#c7d2fe",
    border: "#4338ca", borderDark: "#312e81",
    chart1: "#6366f1", chart2: "#818cf8", chart3: "#a5b4fc",
    aurora1: "#6366f1", aurora2: "#4f46e5", aurora3: "#4338ca",
    cardGradient: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
    cardDarkGradient: "linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 100%)",
    buttonGradient: "linear-gradient(180deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)",
    animGlow: "rgba(99,102,241,0.4)",
    animParticle: "rgba(224,231,255,0.5)",
  },
  cosmic: {
    bg: "#0f0a2e", bgDark: "#020617", cream: "#e0e7ff", parchment: "#1e293b",
    text: "#e0e7ff", textMuted: "#94a3b8", textOnDark: "#e0e7ff",
    primary: "#a78bfa", accent: "#8b5cf6", forest: "#8b5cf6", bark: "#e0e7ff",
    ember: "#c4b5fd", wax: "#a78bfa", brass: "#c4b5fd", sage: "#a78bfa", leather: "#c4b5fd",
    border: "#312e81", borderDark: "#1e1b4b",
    chart1: "#8b5cf6", chart2: "#a78bfa", chart3: "#c4b5fd",
    aurora1: "#8b5cf6", aurora2: "#6366f1", aurora3: "#4338ca",
    cardGradient: "linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 100%)",
    cardDarkGradient: "linear-gradient(135deg, #0f0a2e 0%, #020617 100%)",
    buttonGradient: "linear-gradient(180deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)",
    animGlow: "rgba(139,92,246,0.4)",
    animParticle: "rgba(196,181,253,0.5)",
  },
  love: {
    bg: "#fdf2f8", bgDark: "#831843", cream: "#fef5f9", parchment: "#fce7f3",
    text: "#831843", textMuted: "#9d174d", textOnDark: "#fdf2f8",
    primary: "#ec4899", accent: "#db2777", forest: "#be185d", bark: "#500724",
    ember: "#f472b6", wax: "#9d174d", brass: "#f9a8d4", sage: "#ec4899", leather: "#9d174d",
    border: "#fbcfe8", borderDark: "#831843",
    chart1: "#ec4899", chart2: "#f472b6", chart3: "#f9a8d4",
    aurora1: "#f472b6", aurora2: "#ec4899", aurora3: "#db2777",
    cardGradient: "linear-gradient(135deg, #fef5f9 0%, #fce7f3 100%)",
    cardDarkGradient: "linear-gradient(135deg, #831843 0%, #500724 100%)",
    buttonGradient: "linear-gradient(180deg, #f9a8d4 0%, #ec4899 50%, #db2777 100%)",
    animGlow: "rgba(236,72,153,0.4)",
    animParticle: "rgba(253,242,248,0.6)",
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
export function applyThemeToDocument(theme: ColorTheme): void {
  if (typeof document === "undefined") return;

  const palette = THEME_PALETTES[theme];
  if (!palette) return;

  const root = document.documentElement;

  // Set data-theme attribute for any CSS that uses [data-theme="..."]
  root.setAttribute("data-theme", theme);

  // Apply ALL CSS custom properties — these drive every color in the app
  const vars: Record<string, string> = {
    "--rust-bg": palette.bg,
    "--rust-bg-dark": palette.bgDark,
    "--rust-cream": palette.cream,
    "--rust-parchment": palette.parchment,
    "--rust-forest": palette.forest,
    "--rust-bark": palette.bark,
    "--rust-ember": palette.ember,
    "--rust-wax": palette.wax,
    "--rust-brass": palette.brass,
    "--rust-sage": palette.sage,
    "--rust-leather": palette.leather,
    "--background": palette.bg,
    "--foreground": palette.text,
    "--card": palette.cream,
    "--card-foreground": palette.text,
    "--popover": palette.cream,
    "--popover-foreground": palette.text,
    "--primary": palette.primary,
    "--primary-foreground": palette.cream,
    "--secondary": palette.parchment,
    "--secondary-foreground": palette.text,
    "--muted": palette.parchment,
    "--muted-foreground": palette.textMuted,
    "--accent": palette.accent,
    "--accent-foreground": palette.cream,
    "--destructive": palette.wax,
    "--border": palette.border,
    "--input": palette.border,
    "--ring": palette.brass,
    "--chart-1": palette.chart1,
    "--chart-2": palette.chart2,
    "--chart-3": palette.chart3,
    "--chart-4": palette.wax,
    "--chart-5": palette.sage,
    "--sidebar": palette.parchment,
    "--sidebar-foreground": palette.text,
    "--sidebar-primary": palette.primary,
    "--sidebar-primary-foreground": palette.cream,
    "--sidebar-accent": palette.accent,
    "--sidebar-accent-foreground": palette.cream,
    "--sidebar-border": palette.border,
    "--sidebar-ring": palette.brass,
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
