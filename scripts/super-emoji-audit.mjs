/**
 * super-emoji-audit.mjs — Exhaustive emoji audit
 *
 * Scans:
 *   1. Every page in the app for emoji characters in rendered DOM text
 *   2. Every source file for emoji characters in code
 *   3. All data files for emoji fields
 *   4. All comments for stray emojis
 *
 * Run: node scripts/super-emoji-audit.mjs
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const URL = process.env.URL || "http://localhost:81/";
const results = [];

function ab(...args) {
  const r = spawnSync("agent-browser", args, { encoding: "utf8", timeout: 60000 });
  return (r.stdout || "") + (r.stderr || "");
}
function evalJS(code) {
  const raw = ab("eval", code).trim();
  try { const p = JSON.parse(raw); return typeof p === "string" ? p : JSON.stringify(p); }
  catch { return raw.replace(/^"|"$/g, ""); }
}
function test(name, ok, details = "") {
  results.push({ name, ok: !!ok, details });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${details ? " — " + details : ""}`);
}

// ── Emoji regex ───────────────────────────────────────────────────────
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;

// ── Part 1: Scan rendered DOM on all 6 pages ──────────────────────────
console.log(`\n=== SUPER EMOJI AUDIT: ${URL} ===`);
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

let totalDOMEmojis = 0;
for (const page of pages) {
  ab("eval", `window.location.hash = '${page.hash}'; window.dispatchEvent(new Event('hashchange'));`);
  ab("wait", "2000");
  if (page.name === "Trip") {
    ab("eval", "Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Expand all')?.click()");
    ab("wait", "2000");
  }
  const count = parseInt(evalJS(`(() => {
    const all = document.querySelectorAll('*');
    let c = 0;
    const re = /[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{1F600}-\\u{1F64F}\\u{1F680}-\\u{1F6FF}]/u;
    for (const el of all) {
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && n.textContent && re.test(n.textContent)) c++;
      }
    }
    return String(c);
  })()`));
  totalDOMEmojis += count;
  test(`${page.name}: zero emojis in DOM`, count === 0, `${count} found`);
}

test("TOTAL: zero emojis across all 6 pages", totalDOMEmojis === 0, `${totalDOMEmojis} total`);

// ── Part 2: Scan ALL source files ─────────────────────────────────────
console.log("\n── Source File Scan ──");

const EXTENSIONS = [".tsx", ".ts", ".css", ".json", ".mjs", ".sh"];
let sourceEmojis = 0;
let sourceFilesWithEmojis = 0;

function scanDir(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fpath = join(dir, entry);
    const stat = statSync(fpath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
      scanDir(fpath);
    } else {
      const ext = extname(fpath);
      if (!EXTENSIONS.includes(ext)) continue;
      const content = readFileSync(fpath, "utf8");
      const matches = content.match(new RegExp(EMOJI_RE.source, EMOJI_RE.flags + "g"));
      if (matches) {
        sourceEmojis += matches.length;
        sourceFilesWithEmojis++;
        console.log(`  ✗ ${fpath}: ${matches.length} emojis: ${[...new Set(matches)].join("")}`);
      }
    }
  }
}

scanDir("src");
scanDir("scripts");
test("Zero emojis in ALL source files", sourceEmojis === 0, `${sourceEmojis} in ${sourceFilesWithEmojis} files`);

// ── Part 3: Check for empty emoji/icon fields ─────────────────────────
console.log("\n── Empty Field Scan ──");
let emptyFields = 0;
const srcFiles = readdirSync("src/lib").filter(f => f.endsWith(".ts"));
for (const fname of srcFiles) {
  const content = readFileSync(join("src/lib", fname), "utf8");
  const emptyMatches = content.match(/emoji:\s*""/g);
  if (emptyMatches) {
    emptyFields += emptyMatches.length;
  }
}
test("No empty emoji: '' fields (should be removed)", emptyFields === 0, `${emptyFields} empty fields`);

// ── Part 4: Check sprite is working ───────────────────────────────────
console.log("\n── Sprite Check ──");
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const spriteCount = parseInt(evalJS("document.querySelectorAll('symbol[id^=\"icon-\"]').length"));
test("Icon sprite mounted with symbols", spriteCount > 0, `${spriteCount} symbols`);

const useCount = parseInt(evalJS("document.querySelectorAll('use[href^=\"#icon-\"]').length"));
test("Icons using <use> references", useCount > 0, `${useCount} references`);

const animCount = parseInt(evalJS("document.querySelectorAll('[data-icon] animate, [data-icon] animateTransform').length"));
test("Zero SMIL animations in icon instances", animCount === 0, `${animCount} found`);

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n════════════════════════════════════════════════════════════════`);
console.log(`  SUPER EMOJI AUDIT SUMMARY`);
console.log(`  DOM emojis:     ${totalDOMEmojis}`);
console.log(`  Source emojis:  ${sourceEmojis}`);
console.log(`  Empty fields:   ${emptyFields}`);
console.log(`  Sprite symbols: ${spriteCount}`);
console.log(`  <use> refs:     ${useCount}`);
console.log(`  SMIL anims:     ${animCount}`);
console.log(`  Tests passed:   ${passed}/${total}`);
console.log(`════════════════════════════════════════════════════════════════\n`);

writeFileSync("/tmp/super-emoji-audit.json", JSON.stringify({ passed, total, results }, null, 2));
process.exit(passed === total ? 0 : 1);
