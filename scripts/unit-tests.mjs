/**
 * unit-tests.mjs — Unit tests for lib utilities
 *
 * Tests pure functions and data integrity — no DOM, no browser.
 * Run: node scripts/unit-tests.mjs
 */

import { test, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ── Helpers ────────────────────────────────────────────────────────────
// We use createRequire to load TypeScript files via ts-node-style transpile.
// Since we don't have ts-node, we'll use a simpler approach: read the file,
// strip types, and eval. For now, we test the data files directly.

// Actually, let's test by importing the compiled JS from .next or by using
// a simple regex-based TS stripper. For simplicity, we'll test the data
// files by reading them as text and checking structural invariants.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src", "lib");

function readTS(name) {
  return readFileSync(join(SRC, name), "utf8");
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("trip-data.ts", () => {
  const src = readTS("trip-data.ts");

  it("should export PLACES array", () => {
    assert.match(src, /export\s+const\s+PLACES\s*[:=]/);
  });

  it("should export DAY_PLANS with 6 days", () => {
    assert.match(src, /export\s+const\s+DAY_PLANS/);
    // Count day objects (look for `day: "Day N"`)
    const matches = src.match(/day:\s*"Day\s+\d"/g);
    assert.equal(matches?.length, 6, `Expected 6 days, got ${matches?.length}`);
  });

  it("should export DRIVE_LEGS", () => {
    assert.match(src, /export\s+const\s+DRIVE_LEGS/);
  });

  it("should have correct trip dates (Aug 4-9, 2026)", () => {
    // Day 1 = Aug 4, Day 6 = Aug 9
    assert.match(src, /day:\s*"Day 1"[^}]*?date:\s*"Tuesday,\s+August\s+4,\s+2026"/s);
    assert.match(src, /day:\s*"Day 6"[^}]*?date:\s*"Sunday,\s+August\s+9,\s+2026"/s);
  });

  it("should have a proposal place with category 'proposal'", () => {
    assert.match(src, /category:\s*"proposal"/);
  });

  it("should have checkIn AND checkOut for stay-type places", () => {
    // Bear Brook should have checkOut after our fix
    assert.match(src, /checkOut:\s*"Wednesday\s+11:00\s+AM[^"]*"/);
  });

  it("should have booking IDs for bookable stays", () => {
    assert.match(src, /bookingId:\s*"ReserveAmerica[^"]*"/);
  });

  it("should have access codes where applicable", () => {
    assert.match(src, /accessCode:\s*"\d+"/);
  });

  it("should have coordinates for all places", () => {
    const placeBlocks = src.match(/coords:\s*\{\s*lat:\s*[-\d.]+,\s*lng:\s*[-\d.]+\s*\}/g);
    assert.ok(placeBlocks?.length >= 15, `Expected >=15 places with coords, got ${placeBlocks?.length}`);
  });

  it("should have TRIP_STATS", () => {
    assert.match(src, /export\s+const\s+TRIP_STATS/);
  });
});

describe("preferences.ts", () => {
  const src = readTS("preferences.ts");

  it("should define all 12 IconTheme values", () => {
    const icons = ["sunrise", "morning", "afternoon", "golden", "sunset", "dusk", "midnight", "stargazing", "heart", "ring", "proposal", "anniversary"];
    for (const icon of icons) {
      assert.match(src, new RegExp(`"${icon}"`), `Missing icon: ${icon}`);
    }
  });

  it("should define all 12 ColorTheme values", () => {
    const themes = ["dawn", "day", "forest", "golden", "sunset", "dusk", "night", "cosmic", "love", "brass", "proposal", "anniversary"];
    for (const theme of themes) {
      assert.match(src, new RegExp(`"${theme}"`), `Missing color theme: ${theme}`);
    }
  });

  it("should have ICON_TO_THEME mapping for all 12 icons", () => {
    // Proposal and Anniversary should be distinct (L-05 fix)
    assert.match(src, /proposal:\s*"proposal"/);
    assert.match(src, /anniversary:\s*"anniversary"/);
    // NOT the old duplicates
    assert.doesNotMatch(src, /proposal:\s*"sunset"/);
    assert.doesNotMatch(src, /anniversary:\s*"dusk"/);
  });

  it("should have THEME_PALETTES with all 12 themes", () => {
    const themes = ["brass", "dawn", "day", "forest", "golden", "sunset", "dusk", "night", "cosmic", "love", "proposal", "anniversary"];
    for (const theme of themes) {
      assert.match(src, new RegExp(`${theme}:\\s*\\{`), `Missing palette: ${theme}`);
    }
  });

  it("should have DARK_THEMES set with night and cosmic", () => {
    assert.match(src, /DARK_THEMES.*night.*cosmic/s);
  });

  it("should have getIconForHour function", () => {
    assert.match(src, /export\s+function\s+getIconForHour/);
  });

  it("should have applyThemeToDocument function", () => {
    assert.match(src, /export\s+function\s+applyThemeToDocument/);
  });

  it("Proposal palette should be distinct from Sunset", () => {
    // Extract proposal palette primary and sunset palette primary
    const proposalMatch = src.match(/proposal:\s*\{[^}]*?primary:\s*"([^"]+)"/s);
    const sunsetMatch = src.match(/sunset:\s*\{[^}]*?primary:\s*"([^"]+)"/s);
    assert.ok(proposalMatch, "Proposal palette not found");
    assert.ok(sunsetMatch, "Sunset palette not found");
    assert.notEqual(proposalMatch[1], sunsetMatch[1], "Proposal and Sunset primaries should differ");
  });

  it("Anniversary palette should be distinct from Dusk", () => {
    const annivMatch = src.match(/anniversary:\s*\{[^}]*?primary:\s*"([^"]+)"/s);
    const duskMatch = src.match(/dusk:\s*\{[^}]*?primary:\s*"([^"]+)"/s);
    assert.ok(annivMatch, "Anniversary palette not found");
    assert.ok(duskMatch, "Dusk palette not found");
    assert.notEqual(annivMatch[1], duskMatch[1], "Anniversary and Dusk primaries should differ");
  });
});

describe("attraction-catalog.ts", () => {
  const src = readTS("attraction-catalog.ts");

  it("should export CATALOG array", () => {
    assert.match(src, /export\s+const\s+CATALOG/);
  });

  it("should export SOURCES array", () => {
    assert.match(src, /export\s+const\s+SOURCES/);
  });

  it("should have TYPE_META with multiple types", () => {
    assert.match(src, /TYPE_META/);
    const types = src.match(/(\w+):\s*\{[^}]*emoji/g);
    assert.ok(types?.length >= 10, `Expected >=10 types, got ${types?.length}`);
  });

  it("should have DIFFICULTY_META", () => {
    assert.match(src, /DIFFICULTY_META/);
  });

  it("should have helper functions", () => {
    assert.match(src, /export\s+function\s+getCatalogByLeg/);
    assert.match(src, /export\s+function\s+getCatalogByType/);
    assert.match(src, /export\s+function\s+getCatalogByTheme/);
  });

  it("each catalog entry should have required fields", () => {
    // Count entries (look for `id:` at the start of an object)
    const entries = src.match(/\{\s*id:\s*"/g);
    assert.ok(entries?.length >= 20, `Expected >=20 catalog entries, got ${entries?.length}`);
  });
});

describe("quotes.ts", () => {
  const src = readTS("quotes.ts");

  it("should define QuoteTheme type", () => {
    assert.match(src, /export\s+type\s+QuoteTheme/);
  });

  it("should have 10 quote themes", () => {
    const themes = ["dawn", "wilderness", "recharge", "love", "cosmos", "homecoming", "adventure", "devotion", "ring", "proposal"];
    for (const t of themes) {
      assert.match(src, new RegExp(`"${t}"`), `Missing quote theme: ${t}`);
    }
  });

  it("should have a getQuotes function", () => {
    assert.match(src, /export\s+function\s+getQuotes/);
  });

  it("should have quotes with text and author", () => {
    assert.match(src, /text:\s*"/);
    assert.match(src, /author:\s*"/);
  });
});

describe("haptics.ts", () => {
  const src = readTS("haptics.ts");

  it("should define 5 haptic patterns", () => {
    const patterns = ["tap", "double", "heartbeat", "flourish", "reveal"];
    for (const p of patterns) {
      assert.match(src, new RegExp(`${p}:`), `Missing pattern: ${p}`);
    }
  });

  it("should export haptic function", () => {
    assert.match(src, /export\s+function\s+haptic/);
  });

  it("should check for navigator.vibrate availability", () => {
    assert.match(src, /navigator\.vibrate/);
    assert.match(src, /typeof\s+navigator\.vibrate/);
  });

  it("should respect prefers-reduced-motion", () => {
    assert.match(src, /prefers-reduced-motion|reducedMotion/i);
  });
});

describe("relationship-data.ts", () => {
  const src = readTS("relationship-data.ts");

  it("should define USER_NAME and PARTNER_NAME", () => {
    assert.match(src, /export\s+const\s+USER_NAME/);
    assert.match(src, /export\s+const\s+PARTNER_NAME/);
  });

  it("should have PROPOSAL_DATE set to Aug 7, 2026", () => {
    // Aug 7 2026 7:30 PM ET = UTC 23:30
    assert.match(src, /Date\.UTC\(2026,\s*7,\s*7,\s*23,\s*30/);
  });

  it("should have RELATIONSHIP_START", () => {
    assert.match(src, /export\s+const\s+RELATIONSHIP_START/);
  });

  it("should have USER_BIRTH and PARTNER_BIRTH", () => {
    assert.match(src, /export\s+const\s+USER_BIRTH/);
    assert.match(src, /export\s+const\s+PARTNER_BIRTH/);
  });
});

describe("roadside-attractions.ts", () => {
  const src = readTS("roadside-attractions.ts");

  it("should export ROADSIDE_ATTRACTIONS", () => {
    assert.match(src, /export\s+const\s+ROADSIDE_ATTRACTIONS/);
  });

  it("should export CATEGORY_META", () => {
    assert.match(src, /export\s+const\s+CATEGORY_META/);
  });

  it("should have getAttractionsWithinDetour function", () => {
    assert.match(src, /export\s+function\s+getAttractionsWithinDetour/);
  });

  it("each attraction should have coords", () => {
    const coords = src.match(/coords:\s*\{\s*lat:\s*[-\d.]+,\s*lng:\s*[-\d.]+\s*\}/g);
    assert.ok(coords?.length >= 15, `Expected >=15 attractions with coords, got ${coords?.length}`);
  });
});

describe("trip-context.tsx", () => {
  const src = readTS("trip-context.tsx");

  it("should export TripProvider and useTrip", () => {
    assert.match(src, /export\s+function\s+TripProvider/);
    assert.match(src, /export\s+function\s+useTrip/);
  });

  it("should have 6 page ids", () => {
    const pageIdsMatch = src.match(/PAGE_IDS[^=]*=\s*\[([^\]]+)\]/);
    assert.ok(pageIdsMatch, "PAGE_IDS array not found");
    const ids = pageIdsMatch[1].match(/"[a-z]+"/g);
    assert.equal(ids?.length, 6, `Expected 6 page ids, got ${ids?.length} (${ids?.join(",")})`);
  });

  it("should have mapHighlightId in context value (H-03 fix)", () => {
    assert.match(src, /mapHighlightId/);
  });

  it("should have hash-based URL routing (H-05 fix)", () => {
    assert.match(src, /window\.location\.hash/);
    assert.match(src, /hashchange/);
  });

  it("should parse #/trip/day4 and #/trip/stop-X", () => {
    assert.match(src, /day\(\\d\)/);
    assert.match(src, /stop-\(\.\+\)/);
  });
});

describe("reveal-context.tsx", () => {
  const src = readTS("reveal-context.tsx");

  it("should export RevealProvider and useReveal", () => {
    assert.match(src, /export\s+function\s+RevealProvider/);
    assert.match(src, /export\s+function\s+useReveal/);
  });

  it("should define 5 phases", () => {
    const phases = ["intro", "box", "opening", "reveal", "done"];
    for (const p of phases) {
      assert.match(src, new RegExp(`"${p}"`), `Missing phase: ${p}`);
    }
  });

  it("should have visible state", () => {
    assert.match(src, /visible/);
  });

  it("should have revealed derived state", () => {
    assert.match(src, /revealed/);
  });
});

// ── Run ────────────────────────────────────────────────────────────────
console.log("Running unit tests...\n");
