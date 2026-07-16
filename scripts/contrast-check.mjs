/**
 * contrast-check.mjs — Quick palette-level contrast check
 *
 * Checks each theme's text colors against their backgrounds using the
 * palette definitions directly (no browser needed).
 *
 * Run: node scripts/contrast-check.mjs
 */

import { readFileSync } from "node:fs";

const src = readFileSync("src/lib/preferences.ts", "utf8");

// Extract all theme palettes by parsing the THEME_PALETTES object
function parsePalettes(src) {
  const palettes = {};
  const blockMatch = src.match(/THEME_PALETTES[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!blockMatch) return palettes;
  const block = blockMatch[1];

  // Match each theme block: `themename: { ... }`
  const themeRegex = /(\w+):\s*\{([^}]+)\}/g;
  let m;
  while ((m = themeRegex.exec(block)) !== null) {
    const name = m[1];
    const body = m[2];
    const palette = {};
    // Match key: "value" pairs
    const kvRegex = /(\w+):\s*"([^"]+)"/g;
    let kv;
    while ((kv = kvRegex.exec(body)) !== null) {
      palette[kv[1]] = kv[2];
    }
    if (Object.keys(palette).length > 0) {
      palettes[name] = palette;
    }
  }
  return palettes;
}

function parseColor(css) {
  if (!css) return null;
  css = css.trim();
  if (css.startsWith("#")) {
    let h = css.slice(1);
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (h.length === 6 || h.length === 8) {
      return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
    }
  }
  const rgb = css.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const parts = rgb[1].split(",").map(s => parseFloat(s.trim()));
    return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
}

function luminance({ r, g, b }) {
  const toLin = (c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrastRatio(c1, c2) {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const palettes = parsePalettes(src);
console.log(`\n=== Palette Contrast Check (${Object.keys(palettes).length} themes) ===\n`);

const issues = [];

for (const [themeName, p] of Object.entries(palettes)) {
  const bg = parseColor(p.bg);
  const bgDark = parseColor(p.bgDark);
  const cream = parseColor(p.cream);
  const parchment = parseColor(p.parchment);
  const text = parseColor(p.text);
  const textMuted = parseColor(p.textMuted);
  const textOnDark = parseColor(p.textOnDark);
  const primary = parseColor(p.primary);
  const accent = parseColor(p.accent);
  const brass = parseColor(p.brass);
  const bark = parseColor(p.bark);

  // Key contrast checks:
  // 1. text on bg (main body text)
  // 2. textOnDark on bgDark (dark section text)
  // 3. textMuted on bg (secondary text)
  // 4. cream on bg (card text on page bg)
  // 5. primary on bg (links/accents)
  // 6. brass on bg (gold accents)
  // 7. bark on cream (dark text on light card)
  // 8. textOnDark on bark (light text on dark card)

  const checks = [
    { name: "text on bg (body)", fg: text, bg, threshold: 4.5 },
    { name: "textOnDark on bgDark (dark sections)", fg: textOnDark, bg: bgDark, threshold: 4.5 },
    { name: "textMuted on bg (secondary text)", fg: textMuted, bg, threshold: 4.5 },
    { name: "bark on cream (dark text on light card)", fg: bark, bg: cream, threshold: 4.5 },
    { name: "bark on parchment (dark text on parchment)", fg: bark, bg: parchment, threshold: 4.5 },
    { name: "text on cream (text on card)", fg: text, bg: cream, threshold: 4.5 },
    { name: "textOnDark on bark (light on dark card)", fg: textOnDark, bg: bark, threshold: 4.5 },
    { name: "primary on bg (links)", fg: primary, bg, threshold: 4.5 },
    { name: "brass on bg (gold accents)", fg: brass, bg, threshold: 4.5 },
    { name: "brass on cream (gold on card)", fg: brass, bg: cream, threshold: 4.5 },
    { name: "accent on bg", fg: accent, bg, threshold: 4.5 },
    { name: "primary on cream", fg: primary, bg: cream, threshold: 4.5 },
    // Large text checks (threshold 3.0)
    { name: "brass on parchment (large)", fg: brass, bg: parchment, threshold: 3.0 },
    { name: "accent on cream (large)", fg: accent, bg: cream, threshold: 3.0 },
  ];

  for (const c of checks) {
    if (!c.fg || !c.bg) continue;
    const ratio = contrastRatio(c.fg, c.bg);
    if (ratio < c.threshold) {
      issues.push({
        theme: themeName,
        check: c.name,
        ratio: ratio.toFixed(2),
        threshold: c.threshold,
        fg: `rgb(${c.fg.r},${c.fg.g},${c.fg.b})`,
        bg: `rgb(${c.bg.r},${c.bg.g},${c.bg.b})`,
      });
    }
  }
}

// Report
console.log(`Total issues: ${issues.length}\n`);

// Group by theme
const byTheme = {};
for (const i of issues) {
  if (!byTheme[i.theme]) byTheme[i.theme] = [];
  byTheme[i.theme].push(i);
}

for (const theme of Object.keys(byTheme).sort()) {
  console.log(`\n── ${theme} (${byTheme[theme].length} issues) ──`);
  for (const i of byTheme[theme]) {
    console.log(`  ✗ ${i.check}: ${i.ratio}:${i.threshold} — fg=${i.fg}, bg=${i.bg}`);
  }
}

// Summary of most problematic themes
console.log(`\n── Themes by issue count ──`);
for (const [theme, list] of Object.entries(byTheme).sort((a,b) => b[1].length - a[1].length)) {
  console.log(`  ${theme}: ${list.length} issues`);
}
