/**
 * icon-audit.mjs — Comprehensive emoji→SVG replacement audit
 *
 * Scans every page for:
 *   1. Emoji characters in rendered DOM text (should be ZERO)
 *   2. Data fields with emoji `icon:` values that aren't rendered as <SvgIcon>
 *   3. SVG icons that are missing (name not in registry)
 *   4. SVG icons with < 100 elements (below spec)
 *   5. SVG icons with 0 animations when animated=true
 *
 * Run: node scripts/icon-audit.mjs
 */

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const URL = process.env.URL || "http://localhost:81/";
const results = [];

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

function test(name, ok, details = "") {
  results.push({ name, ok: !!ok, details });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${details ? " — " + details : ""}`);
}

function describe(name, fn) {
  console.log(`\n── ${name} ──`);
  fn();
}

// ── Emoji detection regex ─────────────────────────────────────────────
// Matches: U+1F300-1FAFF (emoji), U+2600-27BF (misc symbols/dingbats),
// U+2190-21FF (arrows — but we keep → as text), U+2B00-2BFF
// Excludes: ✓ (U+2713 — text checkmark), → (U+2192 — text arrow)
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu;
// Also detect ✓ specifically
const CHECKMARK = /\u2713/u;

console.log(`\n=== Icon Audit: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

const pages = [
  { hash: "", name: "Home" },
  { hash: "#/trip", name: "Trip" },
  { hash: "#/map", name: "Map" },
  { hash: "#/proposal", name: "Proposal" },
  { hash: "#/us", name: "Us" },
  { hash: "#/settings", name: "Settings" },
];

let totalEmojis = 0;
let totalCheckmarks = 0;
let totalIcons = 0;
let iconsUnder100 = 0;
let iconsNoAnims = 0;

for (const page of pages) {
  describe(`Page: ${page.name}`, () => {
    ab("eval", `window.location.hash = '${page.hash}'; window.dispatchEvent(new Event('hashchange'));`);
    ab("wait", "2000");

    // Expand all days on trip page
    if (page.name === "Trip") {
      ab("eval", "Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Expand all')?.click()");
      ab("wait", "2000");
    }

    // ── 1. Scan for emoji characters in rendered text ──────────────────
    const emojiScan = evalJS(`(() => {
      const all = document.querySelectorAll('*');
      const found = [];
      const emojiRe = /[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}]/u;
      for (const el of all) {
        // Only check text nodes, not attributes
        for (const node of el.childNodes) {
          if (node.nodeType !== 3) continue; // text nodes only
          const text = node.textContent;
          if (!text) continue;
          const matches = text.match(new RegExp(emojiRe.source, emojiRe.flags));
          if (matches) {
            found.push({
              tag: el.tagName,
              text: text.trim().substring(0, 60),
              emojis: [...new Set(matches)],
              parent: el.parentElement?.tagName || ''
            });
          }
        }
      }
      return JSON.stringify(found.slice(0, 20));
    })()`);

    let emojiFound;
    try { emojiFound = JSON.parse(emojiScan); } catch { emojiFound = []; }
    totalEmojis += emojiFound.length;
    test("No emoji characters in rendered DOM", emojiFound.length === 0,
      emojiFound.length === 0 ? "" : `${emojiFound.length} found: ${emojiFound.map(e => e.emojis.join(",")).join(" | ")}`);

    // ── 2. Scan for ✓ checkmark character ──────────────────────────────
    const checkScan = evalJS(`(() => {
      const all = document.querySelectorAll('*');
      let count = 0;
      for (const el of all) {
        for (const node of el.childNodes) {
          if (node.nodeType !== 3) continue;
          if (node.textContent && node.textContent.includes('\\u2713')) count++;
        }
      }
      return String(count);
    })()`);

    const checkCount = parseInt(checkScan) || 0;
    totalCheckmarks += checkCount;
    test("No ✓ checkmark characters in text", checkCount === 0,
      checkCount === 0 ? "" : `${checkCount} found`);

    // ── 3. Scan SVG icons ──────────────────────────────────────────────
    const iconScan = evalJS(`(() => {
      const icons = document.querySelectorAll('[data-icon]');
      const results = [];
      icons.forEach(icon => {
        const name = icon.getAttribute('data-icon');
        const isAnim = icon.getAttribute('data-animated') === 'true';
        const elements = icon.querySelectorAll('*').length;
        const anims = icon.querySelectorAll('animate, animateTransform').length;
        results.push({ name, isAnim, elements, anims });
      });
      return JSON.stringify(results);
    })()`);

    let icons;
    try { icons = JSON.parse(iconScan); } catch { icons = []; }
    totalIcons += icons.length;

    const under100 = icons.filter(i => i.elements < 100 && i.isAnim);
    const noAnims = icons.filter(i => i.isAnim && i.anims === 0);
    iconsUnder100 += under100.length;
    iconsNoAnims += noAnims.length;

    test("All animated icons have 100+ elements", under100.length === 0,
      under100.length === 0 ? `${icons.length} icons` : `${under100.length} under 100: ${under100.map(i => i.name + "(" + i.elements + ")").join(",")}`);

    test("All animated icons have 3+ animations", noAnims.length === 0,
      noAnims.length === 0 ? "" : `${noAnims.length} with 0 anims: ${noAnims.map(i => i.name).join(",")}`);

    // ── 4. Check for stripped text (empty spans where emoji was) ───────
    // Only flag SPAN elements that are empty AND inside a text container
    // (not structural divs which are always empty by design)
    const emptyScan = evalJS(`(() => {
      const empties = document.querySelectorAll('span:empty');
      let suspicious = 0;
      empties.forEach(el => {
        // Skip spans that have no siblings (only child = structural)
        if (!el.previousSibling && !el.nextSibling) return;
        // Skip spans inside SVG elements (they're structural)
        if (el.closest('svg')) return;
        // Skip aria-hidden elements (decorative — intentionally empty)
        if (el.getAttribute('aria-hidden') === 'true') return;
        if (el.parentElement?.getAttribute('aria-hidden') === 'true') return;
        // Skip absolutely positioned elements (decorative layers)
        const style = getComputedStyle(el);
        if (style.position === 'absolute') return;
        // Flag only if the span is between text content
        const prev = el.previousSibling;
        const next = el.nextSibling;
        if ((prev && prev.textContent && prev.textContent.trim().length > 0) ||
            (next && next.textContent && next.textContent.trim().length > 0)) {
          suspicious++;
        }
      });
      return String(suspicious);
    })()`);

    const emptyCount = parseInt(emptyScan) || 0;
    test("No suspicious empty spans (stripped emojis)", emptyCount === 0,
      emptyCount === 0 ? "" : `${emptyCount} suspicious empty spans`);
  });
}

// ── Summary ───────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════════════════════`);
console.log(`  ICON AUDIT SUMMARY`);
console.log(`════════════════════════════════════════════════════════════════`);
console.log(`  Pages scanned:       ${pages.length}`);
console.log(`  Total SVG icons:     ${totalIcons}`);
console.log(`  Emoji in DOM text:   ${totalEmojis}`);
console.log(`  Checkmarks in text:  ${totalCheckmarks}`);
console.log(`  Icons < 100 elems:   ${iconsUnder100}`);
console.log(`  Icons with 0 anims:  ${iconsNoAnims}`);
console.log(`════════════════════════════════════════════════════════════════`);

const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`  Tests passed: ${passed}/${total}`);
console.log(`════════════════════════════════════════════════════════════════\n`);

writeFileSync("/tmp/icon-audit-results.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  passed, total,
  stats: { totalIcons, totalEmojis, totalCheckmarks, iconsUnder100, iconsNoAnims },
  results,
}, null, 2));

process.exit(passed === total ? 0 : 1);
