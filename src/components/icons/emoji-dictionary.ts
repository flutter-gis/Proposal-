/**
 * emoji-dictionary.ts — Complete emoji → SVG icon mapping
 *
 * Maps every emoji used in the codebase to its animated SVG icon name.
 * Use <Icon name={EMOJI_TO_ICON['💎']} /> or look up by name directly.
 *
 * Icons not yet built fall back to "nearby" (map pin).
 * Icons marked with * are reused from category icons.
 */

import type { IconName } from "./IconRegistry";

// ── Complete emoji → IconName dictionary ───────────────────────────────
// When you see an emoji in source, replace it with <Icon name={...} />
export const EMOJI_TO_ICON: Record<string, IconName> = {
  // ── Category / Stop types ────────────────────────────────────────────
  "🛏️": "stay",
  "🛏": "stay",
  "🥾": "hike",
  "🚣": "water",
  "📸": "scenic",
  "📷": "scenic",
  "🦌": "wildlife",
  "🏛️": "historic",
  "🏛": "historic",
  "🍽️": "dining",
  "🍽": "dining",
  "🚂": "railway",
  "💍": "proposal",
  "🌌": "stargaze",
  "📍": "nearby",
  "🏊": "swimming",
  "🍺": "brewery",
  "🛒": "grocery",

  // ── Day icons ────────────────────────────────────────────────────────
  "🚗": "car",
  "⚡": "lightning",
  "🥐": "croissant",

  // ── Difficulty ───────────────────────────────────────────────────────
  "⛰️": "mountain",
  "⛰": "mountain",
  "🚶": "walking",

  // ── Attraction types ────────────────────────────────────────────────
  "💦": "waterfall",
  "🌉": "bridge",
  "🌿": "nature",
  "🍃": "nature",
  "⛽": "gas",
  "🥕": "farmstand",
  "🎭": "theater",

  // ── Decorative ───────────────────────────────────────────────────────
  "❤️": "heart",
  "❤": "heart",
  "💗": "heart",
  "💕": "heart",
  "💚": "heart",
  "💛": "heart",
  "✨": "sparkle",
  "🔥": "fire",
  "⭐": "star",
  "💡": "lightbulb",
  "♾️": "infinity",
  "♾": "infinity",

  // ── Nature / scenery ────────────────────────────────────────────────
  "🌲": "nature",
  "🌱": "nature",
  "🌹": "nature",
  "🌅": "sparkle",
  "🌆": "sparkle",
  "🌇": "sparkle",
  "🌙": "sparkle",
  "🌤️": "sparkle",
  "🌬️": "nature",
  "🌫️": "nature",

  // ── UI / status ─────────────────────────────────────────────────────
  "✓": "none",
  "✔": "none",
  "✅": "none",
  "🔄": "none",
  "📋": "none",
  "📞": "none",
  "📱": "none",
  "📵": "none",
  "🕐": "none",
  "📅": "none",
  "📊": "none",
  "📜": "none",
  "🪞": "none",
  "🪨": "mountain",
  "🖼️": "scenic",
  "🖼": "scenic",
  "🗺️": "nearby",
  "🗺": "nearby",
  "🛣️": "nearby",
  "🛣": "nearby",

  // ── Activity / objects ──────────────────────────────────────────────
  "🐕": "wildlife",
  "🚻": "none",
  "🤐": "none",
  "🛰️": "sparkle",
  "🛰": "sparkle",
  "🌍": "sparkle",
  "👁️": "none",
  "👁": "none",
  "💌": "heart",
  "🎬": "sparkle",
  "🎉": "sparkle",
  "⚙️": "none",
  "⚙": "none",
  "🐌": "none",
  "🎨": "sparkle",
  "⚡": "lightning",
};

// ── Reverse: IconName → default emoji (for fallback) ──────────────────
export const ICON_TO_EMOJI: Record<IconName, string> = {
  stay: "🛏️", hike: "🥾", water: "🚣", scenic: "📸", wildlife: "🦌",
  historic: "🏛️", dining: "🍽️", railway: "🚂", proposal: "💍",
  stargaze: "🌌", nearby: "📍", swimming: "🏊", brewery: "🍺", grocery: "🛒",
  car: "🚗", lightning: "⚡", croissant: "🥐",
  mountain: "⛰️", walking: "🚶", none: "—",
  waterfall: "💦", bridge: "🌉", nature: "🌿", gas: "⛽",
  farmstand: "🥕", theater: "🎭", carrot: "🥕",
  heart: "❤️", sparkle: "✨", fire: "🔥", star: "⭐",
  lightbulb: "💡", infinity: "♾️",
};

// ── Helper: resolve any emoji to an IconName ──────────────────────────
export function emojiToIcon(emoji: string): IconName {
  return EMOJI_TO_ICON[emoji] ?? "nearby";
}
