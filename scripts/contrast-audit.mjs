/**
 * contrast-audit.mjs — Detect text/background contrast issues across all 12 themes
 *
 * For each theme, switches to it, then samples text colors vs backgrounds
 * on every page. Reports any contrast ratio below WCAG AA (4.5:1 for normal
 * text, 3:1 for large text).
 *
 * Run: node scripts/contrast-audit.mjs
 */

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const URL = process.env.URL || "http://localhost:81/";
const issues = [];

function ab(...args) {
  const r = spawnSync("agent-browser", args, { encoding: "utf8", timeout: 60000 });
  return (r.stdout || "") + (r.stderr || "");
}

function evalJS(code) {
  const raw = ab("eval", code).trim();
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    if (typeof parsed === "object" && parsed !== null) return JSON.stringify(parsed);
    return String(parsed);
  } catch {
    return raw.replace(/^"|"$/g, "");
  }
}

// ── Color utilities ───────────────────────────────────────────────────

/** Parse any CSS color (hex, rgb, rgba) to {r,g,b} 0-255. */
function parseColor(css) {
  if (!css) return null;
  css = css.trim();
  // hex
  const hex = css.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (h.length === 6 || h.length === 8) {
      return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
    }
  }
  // rgb / rgba
  const rgb = css.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const parts = rgb[1].split(",").map(s => parseFloat(s.trim()));
    return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
}

/** Relative luminance per WCAG. */
function luminance({ r, g, b }) {
  const toLin = (c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

/** Contrast ratio per WCAG (1-21). */
function contrastRatio(c1, c2) {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Check if an element's text color has sufficient contrast against its background. */
function checkElementContrast(el, label) {
  if (!el) return null;
  const style = getComputedStyle(el);
  const color = parseColor(style.color);
  // Walk up to find a non-transparent background
  let bgEl = el;
  let bg = null;
  for (let i = 0; i < 10 && bgEl; i++) {
    const bgCss = getComputedStyle(bgEl).backgroundColor;
    if (bgCss && bgCss !== "rgba(0, 0, 0, 0)" && bgCss !== "transparent") {
      bg = parseColor(bgCss);
      break;
    }
    bgEl = bgEl.parentElement;
  }
  if (!color || !bg) return null;
  const ratio = contrastRatio(color, bg);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight) || 400;
  // Large text = >=18.66px (24px in px? actually 18.66px = 14pt) OR >=14px if bold
  const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
  const threshold = isLarge ? 3.0 : 4.5;
  return { ratio, threshold, pass: ratio >= threshold, isLarge, color: style.color, bg: getComputedStyle(bgEl).backgroundColor, fontSize, label };
}

// ── Main ──────────────────────────────────────────────────────────────

console.log(`\n=== Contrast Audit: ${URL} ===\n`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

const themes = [
  "Sunrise", "Morning", "Afternoon", "Golden Hour", "Sunset", "Dusk",
  "Midnight", "Stargazing", "Heart", "Ring", "Proposal", "Anniversary"
];

const pages = [
  { hash: "", name: "Home" },
  { hash: "#/trip", name: "Trip" },
  { hash: "#/map", name: "Map" },
  { hash: "#/proposal", name: "Proposal" },
  { hash: "#/us", name: "Us" },
  { hash: "#/settings", name: "Settings" },
];

for (const theme of themes) {
  // Go to settings and switch theme
  ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "1500");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Manual')?.click()");
  ab("wait", "300");
  evalJS(`Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select ${theme} icon')?.click()`);
  ab("wait", "500");

  for (const page of pages) {
    ab("eval", `window.location.hash = '${page.hash}'; window.dispatchEvent(new Event('hashchange'));`);
    ab("wait", "1500");

    // Sample text elements
    const result = evalJS(`(() => {
      const results = [];
      // Check headings, paragraphs, spans, buttons, labels
      const selectors = ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'button', 'a', 'label', 'div'];
      const seen = new Set();
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (seen.has(el)) continue;
          seen.add(el);
          // Only check elements with direct text content
          const text = el.textContent?.trim();
          if (!text || text.length < 2) continue;
          // Skip elements with no visible text
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          // Skip elements inside other elements we'll check (avoid duplicates)
          if (el.parentElement && seen.has(el.parentElement) && el.parentElement.textContent.trim() === text) continue;
          results.push({ tag: el.tagName, text: text.substring(0, 40), fontSize: parseFloat(style.fontSize), color: style.color });
          if (results.length >= 30) return JSON.stringify(results);
        }
      }
      return JSON.stringify(results);
    })()`);

    let samples;
    try {
      samples = JSON.parse(result);
    } catch {
      continue;
    }

    for (const s of samples) {
      // For each sample, get its actual rendered background by checking the element
      const checkResult = evalJS(`(() => {
        const els = document.querySelectorAll('${s.tag.toLowerCase()}');
        for (const el of els) {
          if (el.textContent.trim().startsWith(${JSON.stringify(s.text.substring(0, 20))})) {
            const r = el.getBoundingClientRect();
            if (r.width === 0) continue;
            const style = getComputedStyle(el);
            let bgEl = el;
            let bg = null;
            for (let i = 0; i < 10 && bgEl; i++) {
              const bgCss = getComputedStyle(bgEl).backgroundColor;
              if (bgCss && bgCss !== 'rgba(0, 0, 0, 0)' && bgCss !== 'transparent') {
                bg = bgCss;
                break;
              }
              bgEl = bgEl.parentElement;
            }
            return JSON.stringify({ color: style.color, bg: bg || 'none', fontSize: style.fontSize, fontWeight: style.fontWeight });
          }
        }
        return 'not found';
      })()`);

      if (checkResult === "not found") continue;
      let info;
      try { info = JSON.parse(checkResult); } catch { continue; }

      const fg = parseColor(info.color);
      const bg = parseColor(info.bg);
      if (!fg || !bg) continue;

      const ratio = contrastRatio(fg, bg);
      const fs = parseFloat(info.fontSize);
      const fw = parseInt(info.fontWeight) || 400;
      const isLarge = fs >= 24 || (fs >= 18.66 && fw >= 700);
      const threshold = isLarge ? 3.0 : 4.5;

      if (ratio < threshold) {
        issues.push({
          theme,
          page: page.name,
          tag: s.tag,
          text: s.text,
          color: info.color,
          background: info.bg,
          ratio: ratio.toFixed(2),
          threshold,
          isLarge,
          fontSize: info.fontSize,
        });
      }
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────
console.log(`\n=== Contrast Audit Results ===\n`);
console.log(`Total issues found: ${issues.length}\n`);

// Group by theme
const byTheme = {};
for (const issue of issues) {
  if (!byTheme[issue.theme]) byTheme[issue.theme] = [];
  byTheme[issue.theme].push(issue);
}

for (const theme of Object.keys(byTheme).sort()) {
  console.log(`\n── ${theme} (${byTheme[theme].length} issues) ──`);
  for (const i of byTheme[theme].slice(0, 10)) {
    console.log(`  [${i.page}] <${i.tag}> "${i.text.substring(0,30)}" — ratio ${i.ratio}:${i.threshold} (color=${i.color}, bg=${i.background}, ${i.fontSize})`);
  }
  if (byTheme[theme].length > 10) {
    console.log(`  ... and ${byTheme[theme].length - 10} more`);
  }
}

writeFileSync("/tmp/contrast-issues.json", JSON.stringify(issues, null, 2));
console.log(`\nDetailed results: /tmp/contrast-issues.json`);
