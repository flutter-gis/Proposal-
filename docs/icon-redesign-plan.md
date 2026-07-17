# 500+ Polygon Artistic SVG Icon System — Redesign Plan

**Status:** Draft v1
**Scope:** All 33 icons currently in `src/components/icons/`
**Goal:** Lift every icon from ~80–150 elements to **500+ elements** with professional illustration quality, while keeping the bundled JS under 100 KB gzipped and render cost acceptable on mobile.

---

## 1. Current State Audit

### 1.1 File inventory (2,687 LOC total)

| File | LOC | Element tags | Role |
|---|---|---|---|
| `Icon.tsx` | 82 | 0 | Base `<svg viewBox="0 0 64 64">` wrapper, `useId`, `memo`, ARIA |
| `IconRegistry.ts` | 135 | 0 | Name → renderer map, category/day/type/difficulty maps |
| `svg-helpers.tsx` | 245 | 3 | `mulberry32`, `twinkleValues`/`spinValues`/`pulseValues`/`driftValues`, `StarField`, `SparkleRays`, `Particles`, `ThemeGradient` |
| `category-icons-svg.tsx` | 925 | 242 | 14 icons (~17 visible tags + generator calls per icon) |
| `day-icons-svg.tsx` | 289 | 61 | 3 icons (`car`, `lightning`, `croissant`) |
| `extra-icons-svg.tsx` | 831 | 169 | 16 icons (~10 visible tags + generator calls per icon) |
| `emoji-dictionary.ts` | 138 | 0 | Emoji → icon name map |
| `useIconPause.ts` | 42 | 0 | IntersectionObserver → pause SMIL offscreen |

### 1.2 Estimated rendered element counts (current)

Sampling from generator expansions (`StarField` 30, `Particles` 20, `SparkleRays` 8–12) plus inline JSX, the average icon renders **80–150 SVG elements**. The existing `icon-component-tests.mjs` asserts `>= 100`. Lowest: `NoneIcon` (~16), `WalkingIcon` (~50). Highest: `StargazeIcon` (~110), `CarIcon` (~95), `ProposalIcon` (~80).

### 1.3 Strengths to preserve

- ✅ Deterministic SSR via `mulberry32` seeded RNG
- ✅ Memoized via `React.memo(IconImpl)`
- ✅ CSS-variable-driven theming (every color is `var(--rust-*)`)
- ✅ Offscreen SMIL pause via IntersectionObserver + `prefers-reduced-motion`
- ✅ `useId()`-sanitized gradient IDs (no collisions in multi-instance pages)
- ✅ Per-icon `hasAnimations` flag already in registry

### 1.4 Gaps to close

- ❌ No code-splitting — all 33 icons bundled upfront
- ❌ No `<defs>` `<symbol>` reuse (each motif is re-emitted inline)
- ❌ No module-level precomputation of static element trees
- ❌ Only 4 generators (`StarField`, `SparkleRays`, `Particles`, `ThemeGradient`) — insufficient to reach 500+ without manual bloat
- ❌ `FarmstandIcon` is silently aliased to `CarrotIcon` (no dedicated farm-stand art)
- ❌ Test threshold is `>= 100` — must be raised to `>= 500`

---

## 2. Proposed File Structure

Keep `Icon.tsx`, `IconRegistry.ts`, `emoji-dictionary.ts`, `useIconPause.ts` unchanged in role. Move all icon bodies into a one-file-per-icon tree, and split `svg-helpers.tsx` into a `generators/` package.

```
src/components/icons/
├── Icon.tsx                       (unchanged — 82 LOC)
├── IconRegistry.ts                (updated — switch to lazy loader)
├── emoji-dictionary.ts            (unchanged — 138 LOC)
├── useIconPause.ts                (unchanged — 42 LOC)
├── types.ts                       (NEW — IconRenderer signature, IconEntry, layer types)
│
├── generators/                    (NEW — shared procedural art toolkit)
│   ├── index.ts                   (barrel export, ~50 LOC)
│   ├── rng.ts                     (mulberry32 + twinkleValues/spinValues/pulseValues/driftValues + new range/seed helpers)
│   ├── gradients.ts               (ThemeGradient + MultiStop, ConicGradientApprox, RadialGlow, VignetteMask)
│   ├── starfield.ts               (StarField, SparkleBurst, GalaxyArm, ShootingStars, Constellation)
│   ├── particles.ts               (Particles, DustField, MistCloud, Bubbles, Embers, FloatingLeaves)
│   ├── sparkles.ts                (SparkleRays, DiamondSparkle, LensFlare, SunRays)
│   ├── nature.ts                  (LeafCluster, PineTree, BushCluster, GrassTufts, VineStrand, FlowerCluster)
│   ├── terrain.ts                 (MountainRange, StoneCluster, BrickTexture, WoodGrain, Cobblestone, SandRipples)
│   ├── water.ts                   (WaterRipples, WaterfallMist, WaveField, SplashDrops, FoamField)
│   ├── sky.ts                     (CloudCluster, Sunburst, MoonCraters, AuroraBand, ConstellationGrid)
│   ├── texture.ts                 (FurTexture, SnowField, SandDots, SparkleDust, StitchPattern, RivetPattern)
│   ├── mechanical.ts              (GearTeeth, RailTies, WheelSpokes, ChainLinks, BoltHeads)
│   └── architectural.ts           (ColumnFlutes, RoofTiles, WindowGrid, BridgeCables, Shingles)
│
├── layers/                        (NEW — composable layer primitives)
│   ├── AtmosphereLayer.tsx        (sky + sun/moon + clouds + background stars)
│   ├── DistantBackgroundLayer.tsx (mountains, hills, treeline)
│   ├── MidgroundLayer.tsx         (icon body silhouette + textured fill)
│   ├── DetailLayer.tsx            (surface textures, seams, rivets)
│   ├── ForegroundLayer.tsx        (focal subject full-detail)
│   ├── GlowLayer.tsx              (sparkle bursts, light rays, reflections)
│   └── ParticleLayer.tsx          (ambient particles, animation-driven elements)
│
└── icons/                         (NEW — one file per icon)
    ├── index.ts                   (barrel — exports all 33 renderers)
    ├── hero/                      (4 icons — target 700–1,000 elements)
    │   ├── ProposalIcon.tsx
    │   ├── StargazeIcon.tsx
    │   ├── CarIcon.tsx
    │   └── LightningIcon.tsx
    ├── category/                  (13 icons — target 500–700 elements)
    │   ├── StayIcon.tsx
    │   ├── HikeIcon.tsx
    │   ├── WaterIcon.tsx
    │   ├── ScenicIcon.tsx
    │   ├── WildlifeIcon.tsx
    │   ├── HistoricIcon.tsx
    │   ├── DiningIcon.tsx
    │   ├── RailwayIcon.tsx
    │   ├── NearbyIcon.tsx
    │   ├── SwimmingIcon.tsx
    │   ├── BreweryIcon.tsx
    │   ├── GroceryIcon.tsx
    │   └── CroissantIcon.tsx
    └── secondary/                 (16 icons — target 500–600 elements)
        ├── MountainIcon.tsx
        ├── WalkingIcon.tsx
        ├── NoneIcon.tsx
        ├── WaterfallIcon.tsx
        ├── BridgeIcon.tsx
        ├── NatureIcon.tsx
        ├── GasIcon.tsx
        ├── CarrotIcon.tsx
        ├── FarmstandIcon.tsx      (NEW — split from CarrotIcon alias)
        ├── TheaterIcon.tsx
        ├── HeartIcon.tsx
        ├── SparkleIcon.tsx
        ├── FireIcon.tsx
        ├── StarIcon.tsx
        ├── LightbulbIcon.tsx
        └── InfinityIcon.tsx
```

### 2.1 Migration strategy for `IconRegistry.ts`

Switch the registry to a **lazy loader** so each icon's renderer module is code-split. Only icons actually used on a page are shipped.

```ts
// IconRegistry.ts (proposed)
import type { ComponentType } from "react";
import type { IconRenderer } from "./types";

type IconEntry = {
  loader: () => Promise<{ default: IconRenderer }>;
  hasAnimations: boolean;
  // Module-level cache for the resolved renderer
  _cached?: IconRenderer;
};

export const ICON_REGISTRY: Record<IconName, IconEntry> = {
  proposal: { loader: () => import("./icons/hero/ProposalIcon"), hasAnimations: true },
  // ...
};

export function resolveIcon(name: IconName): IconRenderer | undefined {
  const entry = ICON_REGISTRY[name];
  if (!entry) return undefined;
  if (entry._cached) return entry._cached;
  // Synchronous fallback: import statically for SSR critical icons
  throw new Error(`Icon ${name} not yet loaded — wrap in <Suspense> or use preloadIcon()`);
}

export async function preloadIcon(name: IconName): Promise<IconRenderer> {
  const entry = ICON_REGISTRY[name];
  if (entry._cached) return entry._cached;
  const mod = await entry.loader();
  entry._cached = mod.default;
  return mod.default;
}
```

`Icon.tsx` then accepts either a sync `IconRenderer` (preloaded) or a `Promise` (via React 19 `use()`), wrapped in `<Suspense>`. For SSR, a `preloadIconsForRoute()` helper can warm the cache for icons known to render above the fold.

**Fallback option (lower risk):** keep registry sync, but rely on Next.js's `dynamic()` with `ssr: false` for the rare icons used only on client. The above lazy-loader is preferred for hero icons.

---

## 3. The 7-Layer Artistic System

Every icon composes seven layers. Generators produce the bulk of each layer's elements; icon-specific JSX only handles the focal subject and a few hero details.

| # | Layer | Element budget | Role | Primary generators |
|---|---|---|---|---|
| 1 | **Defs** | 12–40 | Gradients, filters, `<symbol>` motifs, patterns | `gradients.ts`, inline `<pattern>` defs |
| 2 | **Atmosphere** | 60–100 | Sky rect, sun/moon + halo + rays, clouds, background stars | `sky.ts`, `starfield.ts` |
| 3 | **Distant Background** | 80–120 | Mountain ranges, hills, distant treeline, haze | `terrain.ts`, `nature.ts` |
| 4 | **Midground** | 100–150 | Main icon silhouette + textured fills (brick, leaf, water) | `texture.ts`, `architectural.ts` |
| 5 | **Detail** | 100–150 | Surface textures, seams, rivets, stitching, panel gaps | `texture.ts`, `mechanical.ts` |
| 6 | **Foreground** | 60–100 | Focal subject with full detail (face, features, edges) | inline JSX + `sparkles.ts` |
| 7 | **Glow & Particles** | 60–100 | Sparkle bursts, light rays, ambient dust, animation-driven | `sparkles.ts`, `particles.ts` |

**Total per icon: 472–760 elements** (defs count toward total but are not "shape" elements — count them as bonus). Hero icons push Layers 4–6 to ~150–200 each for **800–1,000 elements**.

### 3.1 Layer composition contract

Each icon's renderer returns this shape:

```tsx
export function ProposalIcon(id: string, animated: boolean): ReactNode {
  return (
    <>
      <defs>{/* Layer 1 */}</defs>
      <AtmosphereLayer id={id} animated={animated} variant="night-sparkle" />
      <DistantBackgroundLayer id={id} animated={animated} variant="soft-haze" />
      {/* Layer 4: Midground — icon-specific */}
      <g>{/* ring band, prongs, diamond silhouette */}</g>
      {/* Layer 5: Detail — icon-specific + generator calls */}
      <DiamondFacets cx={32} cy={28} r={10} id={id} />
      <RivetPattern /* along band */ id={id} />
      {/* Layer 6: Foreground — icon-specific */}
      <g>{/* hero highlights, table facet, girdle */}</g>
      {/* Layer 7: Glow + Particles */}
      <GlowLayer id={id} animated={animated} variant="sparkle-burst" center={[32, 28]} />
      <ParticleLayer id={id} animated={animated} variant="gold-dust" />
    </>
  );
}
```

Layer components accept a `variant` prop so the same `<AtmosphereLayer>` can render night-sparkle, dawn-haze, storm-clouds, etc. Variants are deterministic — no per-render RNG.

---

## 4. Procedural Generator Catalog

20 new generators + 4 existing (StarField, SparkleRays, Particles, ThemeGradient) = 24 total. Each is a pure function returning `ReactNode`, deterministic via `mulberry32(seed)`.

### 4.1 Existing (keep, refactor for performance)

| Generator | File | Output | Notes |
|---|---|---|---|
| `mulberry32` | `rng.ts` | RNG fn | Already deterministic |
| `twinkleValues`/`spinValues`/`pulseValues`/`driftValues` | `rng.ts` | keyframe strings | Memoize at module level by args |
| `StarField` | `starfield.ts` | N circles | Add `variant: "pinpoint" \| "glow" \| "diffraction"` |
| `SparkleRays` | `sparkles.ts` | N polygons | Add `tapered: boolean` for ray tip variation |
| `Particles` | `particles.ts` | N circles | Add `shape: "dot" \| "spark" \| "leaf"` |
| `ThemeGradient` | `gradients.ts` | `<linearGradient>`/`<radialGradient>` | Add `<pattern>` support |

### 4.2 New generators (signatures + element yields)

| Generator | Signature | Yields | Used by |
|---|---|---|---|
| **SparkleBurst** | `(cx, cy, count, innerR, outerR, seed) → ReactNode` | 4-point star polygons, ~20–60 elems | proposal, stargaze, sparkle, lightbulb, fire |
| **GalaxyArm** | `(cx, cy, arms, segmentsPerArm, rotation, seed) → ReactNode` | 30–80 polygons | stargaze |
| **ShootingStars** | `(count, seed, bounds) → ReactNode` | 4–8 animated lines + trails | stargaze, none |
| **Constellation** | `(stars: [x,y][], connections: [i,j][], seed) → ReactNode` | stars + connector lines | stargaze, nearby |
| **DustField** | `(count, bounds, seed, drift) → ReactNode` | 30–60 dots | car, hike, walking, mountain |
| **MistCloud** | `(cx, cy, puffs, seed) → ReactNode` | 12–24 overlapping ellipses | waterfall, bridge, swimming, mountain |
| **Bubbles** | `(count, bounds, seed, direction) → ReactNode` | 15–40 circles with rim highlight | brewery, swimming, dining |
| **Embers** | `(count, source: [x,y], seed) → ReactNode` | 20–50 flickering dots rising | fire, lightning, brewery |
| **FloatingLeaves** | `(count, bounds, seed) → ReactNode` | 15–30 small leaf polygons | nature, hike, scenic |
| **DiamondSparkle** | `(cx, cy, size) → ReactNode` | 12–20 facets + central 4-point star | proposal, sparkle |
| **LensFlare** | `(cx, cy, rayCount, seed) → ReactNode` | 8–16 rings + hex ghosts | scenic, lightning |
| **SunRays** | `(cx, cy, rayCount, innerR, outerR, seed) → ReactNode` | 12–24 tapered polygons | mountain, croissant, fire |
| **LeafCluster** | `(cx, cy, count, size, seed, variant) → ReactNode` | 20–60 leaf polygons | nature, wildlife, farmstand, carrot |
| **PineTree** | `(cx, baseY, height, seed) → ReactNode` | 8–15 triangles + trunk | mountain, stay, scenic, hike |
| **BushCluster** | `(cx, cy, count, seed) → ReactNode` | 15–30 overlapping circles | wildlife, stay, nature, farmstand |
| **GrassTufts** | `(y, xStart, xEnd, count, seed) → ReactNode` | 30–60 blade lines | hike, walking, nature, farmstand |
| **VineStrand** | `(x1, y1, x2, y2, leaves, seed) → ReactNode` | 10–20 leaf pairs | nature, historic, dining |
| **FlowerCluster** | `(cx, cy, count, seed) → ReactNode` | 8–20 flower heads (5-petal each) | nature, farmstand, grocery |
| **MountainRange** | `(y, peaks, seed, palette) → ReactNode` | 3 layers × 15–25 polys | mountain, scenic, waterfall, bridge |
| **StoneCluster** | `(cx, cy, count, seed) → ReactNode` | 20–40 polygons | waterfall, historic, bridge, mountain |
| **BrickTexture** | `(x, y, w, h, brickW, brickH, seed) → ReactNode` | 30–80 rects | stay, historic, brewery, gas |
| **WoodGrain** | `(x, y, w, h, seed) → ReactNode` | 15–30 curved lines | stay, hike, dining, railway, bridge |
| **Cobblestone** | `(x, y, w, h, seed) → ReactNode` | 30–60 polygons | historic, nearby, theater |
| **SandRipples** | `(cx, cy, w, h, seed) → ReactNode` | 20–40 wavy lines | swimming, water, bridge |
| **WaterRipples** | `(cx, cy, rings, maxR, seed) → ReactNode` | 6–12 concentric ellipses | water, swimming, waterfall, bridge |
| **WaterfallMist** | `(cx, topY, bottomY, width, seed) → ReactNode` | 20–40 fading circles | waterfall |
| **WaveField** | `(y, count, amplitude, seed) → ReactNode` | 8–16 wave paths | water, swimming, bridge |
| **SplashDrops** | `(cx, cy, count, seed) → ReactNode` | 12–24 small circles | water, swimming, waterfall |
| **FoamField** | `(cx, cy, count, seed) → ReactNode` | 20–40 tiny circles | water, swimming, brewery |
| **CloudCluster** | `(cx, cy, puffs, seed) → ReactNode` | 8–16 overlapping ellipses | mountain, bridge, railway, car |
| **Sunburst** | `(cx, cy, rays, innerR, outerR, seed) → ReactNode` | 24–48 tapered polygons | lightning, sparkle, fire |
| **MoonCraters** | `(cx, cy, r, seed) → ReactNode` | 8–15 small circles | stargaze, none |
| **AuroraBand** | `(y, width, seed) → ReactNode` | 5–10 wavy gradient paths | stargaze |
| **ConstellationGrid** | `(bounds, spacing, seed) → ReactNode` | 20–40 dots + sparse lines | nearby, stargaze |
| **FurTexture** | `(bounds, density, seed) → ReactNode` | 40–80 short curved lines | wildlife |
| **SnowField** | `(bounds, count, seed) → ReactNode` | 30–60 dots | mountain, stargaze, stay |
| **SparkleDust** | `(bounds, count, seed) → ReactNode` | 30–50 tiny 4-point stars | proposal, sparkle, stargaze, lightbulb |
| **StitchPattern** | `(x1, y1, x2, y2, stitchLen, seed) → ReactNode` | 10–30 dashed segments | hike, stay, dining |
| **RivetPattern** | `(points: [x,y][], seed) → ReactNode` | N circles + N highlight dots | car, railway, bridge, gas |
| **GearTeeth** | `(cx, cy, r, teeth, seed) → ReactNode` | 2N polygons (tooth + gap) | railway, gas, lightbulb |
| **RailTies** | `(x1, x2, y, count, seed) → ReactNode` | N rects | railway, bridge |
| **WheelSpokes** | `(cx, cy, r, count, seed) → ReactNode` | N lines + N lug nuts | car, railway, grocery |
| **ChainLinks** | `(x1, y1, x2, y2, links, seed) → ReactNode` | N ellipses + N rects | bridge, railway |
| **BoltHeads** | `(points: [x,y][], size, seed) → ReactNode` | 6-point polygons × N | bridge, railway, gas |
| **ColumnFlutes** | `(cx, yTop, yBottom, count) → ReactNode` | N vertical lines | historic |
| **RoofTiles** | `(x, y, w, h, tileW, tileH, seed) → ReactNode` | 20–60 arcs | stay, historic, gas |
| **WindowGrid** | `(x, y, w, h, cols, rows, seed) → ReactNode` | cols×rows rects + frames | stay, historic, railway |
| **BridgeCables** | `(x1, y1, x2, y2, count, sag, seed) → ReactNode` | N catenary curves | bridge |
| **Shingles** | `(x, y, w, h, rows, seed) → ReactNode` | 20–50 scalloped rows | stay, farmstand |

**Total generator count: 24 (4 existing + 20 new).**

### 4.3 Generator performance contract

Every generator must:
1. Be a pure function (no closures over module state except cached RNG tables)
2. Accept `seed: number` and use `mulberry32(seed)` — never `Math.random()`
3. Round all coords to 2 decimal places (`x.toFixed(2)`) for SSR-stable output
4. Memoize heavy sub-computations via module-level `Map<seed, result>` where the result is the same across renders
5. Accept `animated: boolean` and only emit `<animate>` children when true
6. Tag every emitted element with `key={`${idPrefix}-${kind}-${i}`}` for React reconciliation

---

## 5. Per-Icon Artistic Specifications

### 5.1 Hero Icons (4) — Target 700–1,000 elements

#### 💍 `proposal` — Engagement ring with brilliant-cut diamond
**Theme:** Champagne gold + diamond refractions + golden dust
**Layers:**
- **L1 Defs (40):** `gold-band` linearGradient (3 stops), `diamond-radial` radialGradient (4 stops), `diamond-facet` linearGradient × 4 facets, `<pattern id="gold-hammer">` (8 elements), `<filter id="diamond-glow">` (3 elements), `<symbol id="sparkle-4pt">` (1 polygon)
- **L2 Atmosphere (90):** Deep night-sky radial vignette (1), `StarField` count=60 variant="diffraction", `SparkleDust` count=40, `AuroraBand` faint gold (8 elems)
- **L3 Distant Background (60):** Soft radial haze, no mountains — keep focus on ring
- **L4 Midground (180):** Ring band ellipse (1) + `BrickTexture`-style engraved pattern along band (40 facets) + inner highlight ellipse (1) + shadow arc path (1) + 6 prongs (6 lines) + diamond silhouette octahedron (1 polygon) + `DiamondFacets` brilliant-cut (32 polygons: 8 crown + 8 pavilion + 16 girdle facets)
- **L5 Detail (200):** Each diamond facet gets a gradient-refraction sub-polygon (32), table facet highlight (4), girdle polish marks (16 small lines), prong tips with rivulets (12 small ellipses), band millgrain beading (`RivetPattern` 40 beads), inner band inscription marks (20 dashes)
- **L6 Foreground (120):** Hero sparkle 4-point star at table (1) + `DiamondSparkle` (20 facets glow) + secondary sparkle bursts at pavilion tip (8) + light-reflection arc on band (1 path) + lens-flare ghost hexes (6)
- **L7 Glow & Particles (110):** `SparkleBurst` count=60 around diamond, `SparkleRays` count=24 rotating, gold-dust `Particles` count=30 rising, animated central sparkle (1)

**Estimated total: 800 elements.** Colors: `var(--rust-brass)`, `var(--rust-wax)`, `var(--rust-cream)`, `#fbbf24`, `#fef3c7`, `#e0e7ff`, `#a5b4fc`.

#### 🌌 `stargaze` — Spiral galaxy with nebula + deep star field
**Theme:** Deep cosmos — purple core, lavender arms, white stars
**Layers:**
- **L1 Defs (35):** `galaxy-core` radialGradient (5 stops), `arm-1`/`arm-2` radialGradients, `nebula-purple`/`nebula-pink` radialGradients, `<filter id="star-glow">` (3 elements), `<symbol id="diffraction-spike">` (2 polygons)
- **L2 Atmosphere (260):** Deep-space radial vignette (1), `StarField` count=120 variant="diffraction" (yields 120 circles + 120×2 diffraction spike polygons = 360 elements but counted as one generator call), `SparkleDust` count=60, `ConstellationGrid` sparse (30 dots + 8 lines)
- **L3 Distant Background (80):** 5 `AuroraBand` purple/pink/lavender/teal/gold wavy gradient paths, faint distant galaxy spirals (3 small `GalaxyArm` calls × 8 polys)
- **L4 Midground (180):** `GalaxyArm` arms=2 segmentsPerArm=20 (yields 80 polys), core glow ellipse (1), `MoonCraters` replaced with bright core cluster (15 circles)
- **L5 Detail (160):** Spiral arm density boost (`GalaxyArm` second pass with 40 small dots along arms), 6 `nebula` cloud ellipses with rotation transforms, 12 brighter "named" stars with diffraction spikes
- **L6 Foreground (80):** Core bright center (3 nested circles), central white-hot point (1), `ShootingStars` count=2 (8 elements)
- **L7 Glow & Particles (60):** `SparkleBurst` count=30 slow-rotating, animated galaxy rotation via `animateTransform` on arm groups (existing pattern), faint particle drift

**Estimated total: 875 elements.** Colors: `var(--rust-cream)`, `#c4b5fd`, `#a78bfa`, `#ddd6fe`, `var(--rust-forest)`, `var(--rust-bg-dark)`.

#### 🚗 `car` — Vintage road-trip car with scenery
**Theme:** Sunset drive — ember/wax car, brass road, forest backdrop
**Layers:**
- **L1 Defs (35):** `car-body` linearGradient (3 stops), `window` linearGradient, `sky-sunset` linearGradient (4 stops), `<pattern id="cobblestone-road">` (40 elements), `<pattern id="dust-particle">` (3 elements), `<symbol id="pine-tree">` (3 elements)
- **L2 Atmosphere (110):** Sunset sky rect (1), sun disc + halo + 12 `SunRays`, `CloudCluster` 3 clusters × 8 puffs = 24, `StarField` count=15 faint daytime stars
- **L3 Distant Background (90):** `MountainRange` 3 layers × 15 segments = 45 polys, distant `PineTree` cluster 15 trees × 3 polys via `<use>` = 18 effective elements (1 symbol def + 15 uses + 2 trunk overrides)
- **L4 Midground (160):** Car body path (1), hood (1), roof (1), windshield (1), rear window (1), side window (1), door panel (1), `Cobblestone` road pattern via `<use>` × 30 (30 elements), ground shadow ellipse (1)
- **L5 Detail (180):** Panel gaps (8 lines), door seams (4), `RivetPattern` along chassis (24 rivets × 2 = 48 elements), `BrickTexture`-style grille (12 rects), headlight chrome ring (3 circles), 2 wheels × (`WheelSpokes` 10 + 5 lug nuts + brake disc + tire tread 16 segments) = 64 elements, bumper chrome strips (4), exhaust pipe (1), roof rack bars (3), cargo box lashing straps (4)
- **L6 Foreground (90):** Headlight bulb (2), headlight glow halo (1 animated), 3 headlight beams (3 animated lines), taillight lens (2), `LensFlare` on windshield (8 elements), driver silhouette through window (5 elements)
- **L7 Glow & Particles (80):** `DustField` count=40 behind car, `Embers` count=20 from exhaust (animated), motion-blur lines (4), `SparkleDust` count=15 on chrome

**Estimated total: 745 elements.** Colors: `var(--rust-ember)`, `var(--rust-wax)`, `var(--rust-bark)`, `var(--rust-brass)`, `var(--rust-cream)`, `var(--rust-forest)`, `var(--rust-bg-dark)`.

#### ⚡ `lightning` — Stormy sky with fractal bolt
**Theme:** Electric storm — brass bolt, ember glow, dark bark clouds
**Layers:**
- **L1 Defs (30):** `bolt-gradient` linearGradient (3 stops), `glow-radial`, `cloud-dark` linearGradient, `<filter id="bloom">`, `<symbol id="spark-cross">` (2 polygons)
- **L2 Atmosphere (180):** Storm sky rect (1), `CloudCluster` 5 dark clouds × 16 puffs = 80, `StarField` count=40 faint through cloud gaps, rain streaks (30 lines)
- **L3 Distant Background (80):** Distant treeline silhouette (15 polys), power poles (2 × 5 elements), power lines (4 catenary curves)
- **L4 Midground (150):** Main lightning bolt 12-segment zigzag (1 polygon) + `LightningBranches` fractal (16 branch polylines), bolt inner highlight (1), bolt edge lines (2), secondary bolt (8 segments), ground impact ellipse (1)
- **L5 Detail (120):** Bolt edge crackles (12 small lines), 8 branch arcs (animated), energy halo rings (3 concentric animated circles), cloud-base flashes (4 animated ellipses)
- **L6 Foreground (90):** Central bolt glow (1 animated radial), `Sunburst` count=24 around impact point, `LensFlare` (6 ghosts), spark particles (8 animated)
- **L7 Glow & Particles (80):** `Embers` count=40 rising from impact, `SparkleBurst` count=20, ground steam wisps (8 animated paths)

**Estimated total: 730 elements.** Colors: `#fbbf24`, `var(--rust-brass)`, `var(--rust-ember)`, `var(--rust-bark)`, `var(--rust-bg-dark)`, `var(--rust-cream)`.

### 5.2 Category Icons (13) — Target 500–700 elements

| Icon | Theme | Key layers (abbreviated) | Est. elements |
|---|---|---|---|
| **stay** (cabin) | Cozy night | StarField(50) + PineTree(12) + BushCluster(20) + cabin(1) + BrickTexture chimney(40) + WoodGrain walls(25) + WindowGrid(2×4 panes) + RoofTiles(30) + Smoke(8) + GlowLayer | 580 |
| **hike** (boot) | Trail dust | DustField(40) + GrassTufts(40) + PineTree(8) + boot(1) + StitchPattern laces(20) + RivetPattern eyelets(20) + WoodGrain sole(20) + FurTexture collar(30) + motion lines | 520 |
| **water** (sailboat) | Calm sea | WaveField(16) + CloudCluster(3×8) + SunRays(12) + boat hull(1) + WoodGrain mast(15) + StitchPattern sails(20) + Rigging lines(8) + FoamField(30) + birds(3) | 560 |
| **scenic** (camera) | Golden hour | StarField(30) + Sunburst(20) + camera body(1) + GearTeeth dial(16) + RivetPattern screws(20) + LensFlare(10) + WindowGrid viewfinder(6) + GripTexture(20) + LightLeak particles | 540 |
| **wildlife** (deer) | Forest glade | BushCluster(40) + PineTree(15) + DustField(30) + deer body(1) + FurTexture(60) + antler branches(16) + LeafCluster foreground(20) + eye detail(4) + spots(8) | 620 |
| **historic** (temple) | Moonlit marble | StarField(40) + MoonCraters(12) + Cobblestone base(40) + 4 columns × (ColumnFlutes 5 + RivetPattern 6) = 44 + BrickTexture architrave(30) + RoofTiles pediment(20) + acroteria(6) | 600 |
| **dining** (plate+utensils) | Candlelit | SparkleDust(40) + plate(1) + Cobblestone plate rim(30) + food items(8) + SteamParticles(20) + ForkTines(8) + KnifeBlade grind lines(10) + GarnishCluster(12) + SparkleBurst(20) | 540 |
| **railway** (train) | Dawn smoke | CloudCluster(3×10) + MountainRange(2×15) + train body(1) + BrickTexture boiler(40) + RivetPattern(30) + WindowGrid(3×4 panes=12) + 4 wheels × WheelSpokes(8+5)=52 + RailTies(12) + ChainLinks coupler(6) + Embers smoke(30) | 660 |
| **nearby** (map pin) | Cartographic | ConstellationGrid(40) + Cobblestone street(40) + pin body(1) + RivetPattern bevel(20) + WindowGrid blocks(16) + CompassRose(16) + SparkleBurst(20) + pulse rings(3) | 580 |
| **swimming** (swimmer) | Poolside | WaveField(20) + FoamField(40) + WaterRipples(12) + SunRays(12) + swimmer body(1) + GoggleStrap(6) + WaterDrops(20) + LaneMarkers(8) + SplashDrops(24) + Bubbles(20) | 580 |
| **brewery** (beer mug) | Tavern warmth | SparkleDust(30) + mug body(1) + WoodGrain table(20) + BrickTexture wall(40) + WheatSheaf(15) + FoamBubbles(20) + rising Bubbles(30) + CondensationDrops(12) + Handle highlights(8) + GlowLayer | 540 |
| **grocery** (cart) | Market bustle | DustField(20) + cart frame(1) + WindowGrid basket(20) + FoodItems varied(20) + 2 wheels × WheelSpokes(8+4)=24 + RivetPattern(15) + PriceTag(6) + BrickTexture floor(30) + MotionLines(4) | 540 |
| **croissant** (pastry) | Morning bakery | SteamParticles(20) + SunRays(12) + plate(1) + Cobblestone plate(30) + CroissantLayers(8) + FlakyTexture(40) + CoffeeCup(15) + Crumbs(15) + SparkleBurst(20) + WheatGrain(10) | 560 |

### 5.3 Secondary Icons (16) — Target 500–600 elements

| Icon | Key generators | Est. elements |
|---|---|---|
| **mountain** | MountainRange(45) + SnowField(50) + PineTree(15) + CloudCluster(40) + SunRays(12) + TrailZigzag + FrostCracks on peaks | 590 |
| **walking** | DustField(40) + GrassTufts(50) + PineTree(8) + figure(1) + StitchPattern clothing(20) + BackpackStraps(8) + Footprints(8) + SweatDrops(4) + SunRays(12) | 510 |
| **none** | SparkleDust(60) + DottedRing(36) + ConstellationGrid(40) + RadialGlow(8) + center dash(1) + pulse rings(3) + ambient sparkles(30) | 540 *(note: visual stays minimal but elements push count via texture)* |
| **waterfall** | MountainRange(30) + StoneCluster(40) + WaterfallMist(40) + WaveField(16) + SplashDrops(30) + CliffVines(15) + Baserocks(12) + SunRays(8) | 540 |
| **bridge** | CloudCluster(24) + MountainRange(30) + BridgeCables(20) + RailTies(12) + WaveField(12) + RivetPattern(30) + TowerDetail(20) + cars(2) + birds(2) | 550 |
| **nature** (leaf) | LeafCluster bg(40) + SparkleDust(30) + main leaf(1) + VeinPattern(20) + DewDrops(15) + BushCluster(20) + GrassTufts(30) + FloatingLeaves(15) | 540 |
| **gas** (pump) | CloudCluster(16) + pump body(1) + BrickTexture base(30) + ScreenGrid(12) + ButtonRow(6) + HoseCurves(8) + NozzleRivets(12) + PriceSign(8) + DustField(20) + Embers(15) | 510 |
| **carrot** | GrassTufts(40) + SoilTexture(30) + carrot body(1) + RootHairs(20) + LeafCluster top(30) + DewDrops(12) + BushCluster(15) + SunRays(8) + SparkleDust(20) | 530 |
| **farmstand** (NEW) | MountainRange(30) + BushCluster(40) + stand structure(1) + RoofTiles awning(40) + ProduceBins(8 × 4 items=32) + WoodGrain posts(15) + PriceTags(6) + FlowerCluster(20) + GrassTufts(30) | 590 |
| **theater** (masks) | Cobblestone(30) + CurtainFolds(20) + stage(1) + MaskTragedy(15) + MaskComedy(15) + SparkleBurst(30) + SunRays footlights(12) + DustField(20) + StarField(20) | 540 |
| **heart** | SparkleDust(40) + AuroraBand(8) + heart body(1) + HighlightGradient(4) + StitchPattern(15) + PulseRings(6) + SparkleBurst(30) + FloatingHearts(15) + GlowLayer | 540 |
| **sparkle** | SparkleBurst(80) + SparkleRays(24) + LensFlare(12) + SparkleDust(60) + Sunburst(20) + StarField(40) + central 4-point star(1) + rotation anim | 620 |
| **fire** | Embers(50) + FlameTongues(20) + LogStack(8) + WoodGrain(15) + SmokeWisps(15) + SparkleBurst(30) + Sunburst(16) + AshDots(20) + GlowLayer | 540 |
| **star** | StarField(80) + SparkleBurst(40) + SunRays(24) + central 5-point star(1) + GlowRings(8) + SparkleDust(50) + ConstellationLines(10) + rotation anim | 580 |
| **lightbulb** | SparkleDust(30) + bulb glass(1) + FilamentCoil(12) + ScrewThreads(8) + ContactPoints(4) + SunRays(20) + LensFlare(8) + Embers(15) + GlowLayer + WireDetail(6) | 530 |
| **infinity** | SparkleDust(40) + GradientFlow bands(16) + infinity path(1) + OutlineStitch(20) + SparkleBurst(30) + ParticleStream(40) + AuroraBand(8) + GlowLayer | 540 |

---

## 6. SVG Element-Type Strategy

| Element | Use case | Byte cost | Render cost | Verdict |
|---|---|---|---|---|
| `<circle>` | Stars, sun, dots, particles, bubbles | Low | Lowest | **Default for round/small** |
| `<line>` | Rays, spokes, stitches, veins, cracks | Lowest | Lowest | **Default for thin straight** |
| `<rect>` | Bricks, beams, ties, plaques, tiles | Low | Low | **Default for axis-aligned** |
| `<ellipse>` | Ovals, glows, ripples, drops, halos | Low | Low | **Default for soft/round fills** |
| `<polygon>` | Facets, mountains, roofs, leaves, sparks | Medium | Medium | **Use for faceted detail** |
| `<polyline>` | Trails, zigzags, lightning branches | Medium | Low | **Use for open multi-point** |
| `<path>` | Organic curves, smoke, flames, hair | High | Medium | **Reserve for hero shapes only** |
| `<use>` | Repeated motifs via `<symbol>` | Lowest | Low | **Aggressive use for repeated motifs** |

**Rule of thumb:** One `<path>` with complex `d` ≈ 5 `<polygon>`s ≈ 20 `<line>`s in byte cost. Prefer many simple elements over few complex paths — they read as "polygons" and count toward the 500+ budget transparently.

### 6.1 `<symbol>` + `<use>` reuse pattern

Define repeated motifs once in `<defs>`:

```tsx
<defs>
  <symbol id={`${id}-pine`} viewBox="0 0 6 12">
    <rect x={2.5} y={8} width={1} height={4} fill="var(--rust-bark)" />
    <polygon points="0,8 3,2 6,8" fill="var(--rust-forest)" />
    <polygon points="1,5 3,0 5,5" fill="var(--rust-forest)" opacity={0.8} />
  </symbol>
</defs>
{/* 15 trees via <use> — 1 def + 15 uses = 16 elements */}
{trees.map((t, i) => (
  <use key={`${id}-tree-${i}`} href={`#${id}-pine`} x={t.x} y={t.y} width={t.w} height={t.h} />
))}
```

This pattern is critical for PineTree (used in 6 icons), MountainRange segments, and rivet patterns.

---

## 7. Bundle Size Strategy (<100 KB gzipped)

### 7.1 Estimated bundle breakdown

| Component | Uncompressed | Gzipped |
|---|---|---|
| `generators/` (24 files, ~100 LOC each) | ~30 KB | ~7 KB |
| `layers/` (7 files, ~80 LOC each) | ~15 KB | ~3 KB |
| `icons/hero/` (4 files, ~250 LOC each) | ~25 KB | ~6 KB |
| `icons/category/` (13 files, ~150 LOC each) | ~40 KB | ~9 KB |
| `icons/secondary/` (16 files, ~120 LOC each) | ~40 KB | ~9 KB |
| `Icon.tsx` + `IconRegistry.ts` + `types.ts` | ~6 KB | ~2 KB |
| **Total** | **~156 KB** | **~36 KB** |

This leaves comfortable headroom under 100 KB. With Next.js's tree-shaking and code-splitting, only icons rendered on a page are shipped — typically 5–15 KB gzipped per route.

### 7.2 Code-splitting via lazy registry

```ts
// Hero icons preloaded on home route
export async function preloadHomeIcons() {
  await Promise.all([
    preloadIcon("car"), preloadIcon("lightning"),
    preloadIcon("proposal"), preloadIcon("stargaze"),
    preloadIcon("croissant"), preloadIcon("hike"),
  ]);
}
```

`<Icon>` wraps its content in `<Suspense fallback={null}>` so unloaded icons render nothing until their chunk arrives (typically <50 ms).

### 7.3 Module-level memoization

Static (non-animated) element trees are computed **once** per icon at module load, not per render:

```tsx
// ProposalIcon.tsx
let staticCache: ReactNode | null = null;

export function ProposalIcon(id: string, animated: boolean): ReactNode {
  if (!staticCache) {
    staticCache = (
      <>
        {/* All non-animated layers */}
      </>
    );
  }
  return (
    <>
      {staticCache}
      {/* Animated layers — recomputed each render but cheap */}
    </>
  );
}
```

**Caveat:** This works because the icon's `id` only affects gradient/filter IDs, which can be parameterized via a `cssVar`-only approach OR by using `useId()` at the `<Icon>` level (already done) and passing the prefix through. The static cache stores the JSX *structure*; gradient IDs are resolved via closure over `id`. To make caching work, the cached tree must use `${id}-*` references that resolve at render time — achievable by storing a factory function rather than the rendered JSX:

```tsx
const staticFactory = (id: string) => (<>...</>);
let staticCache: { [id: string]: ReactNode } = {};
export function ProposalIcon(id: string, animated: boolean) {
  if (!staticCache[id]) staticCache[id] = staticFactory(id);
  return <>{staticCache[id]}{animatedParts(id, animated)}</>;
}
```

Since `useId()` produces a stable ID per component instance, this cache hits on every subsequent render of the same instance.

### 7.4 What NOT to do

- ❌ Don't use `<text>` for labels (huge byte cost, font issues) — current `GasIcon` uses `<text>` for "$3.29" and "GAS" — replace with vector glyphs or omit
- ❌ Don't use `<filter>` with `feGaussianBlur` on more than 2 elements per icon (expensive at runtime)
- ❌ Don't animate more than ~30 elements per icon (SMIL is CPU-heavy on mobile) — current icons already approach this limit
- ❌ Don't emit SVG comments (`{/* ... */}`) in production — Next.js strips them, but verify
- ❌ Don't use `transform` on individual elements when a parent `<g transform>` would do (fewer attributes)

---

## 8. Performance & SSR Safety

### 8.1 SSR safety checklist (per generator)

1. ✅ `mulberry32(seed)` — no `Math.random()`
2. ✅ All coords rounded via `toFixed(2)` — prevents hydration mismatches from float precision
3. ✅ No `Date.now()` or `performance.now()` in render path
4. ✅ No `useEffect` for initial render — `<Icon>` is pure SVG
5. ✅ `useId()` sanitized (strip `:`) — already done
6. ✅ Animation `begin` offsets are constant strings, not computed from time
7. ✅ `<animate>` `dur` values are constant strings

### 8.2 Render performance budget

- Each icon's render function should complete in <2 ms on a mid-range mobile (Pixel 5)
- 33 icons × 2 ms = 66 ms — acceptable for first paint
- Module-level caching reduces subsequent renders to <0.5 ms per icon
- `<Icon>` already wrapped in `React.memo` — re-renders only on `name`/`size`/`animated`/`className` change
- Theme changes (CSS variable flips) do **not** trigger React re-render — they're handled by the browser's CSS engine

### 8.3 Animation performance

- SMIL `<animate>` is paused via `useIconPause` IntersectionObserver when offscreen — already implemented
- `prefers-reduced-motion` is respected — already implemented
- **Don't add new SMIL animations** — keep the existing 3–5 per icon
- Animated elements should be **minimized**: only animate the focal subject + 1–2 supporting elements
- For "ambient" animation (twinkling stars, drifting particles), keep durations ≥ 2 s to avoid CPU thrash

### 8.4 DOM weight budget

33 icons × 500 elements = 16,500 SVG elements if all rendered simultaneously. Realistically, a page shows 8–15 icons at once = 4,000–7,500 elements. Modern browsers handle this fine, but:
- Use `content-visibility: auto` on icon containers where supported
- Avoid `will-change` on SVG (it forces layer promotion)
- The `useIconPause` hook already sets `display: none` on `<animate>` elements when offscreen — this is the single biggest perf win

---

## 9. Test & Validation Strategy

### 9.1 Update `scripts/icon-component-tests.mjs`

Change the element-count threshold from 100 → 500:

```js
test(`${name}: ${count} elements (>= 500)`, count >= 500, `${count} elements`);
```

Add a new test for hero icons requiring `>= 700`:

```js
const HERO_ICONS = ["proposal", "stargaze", "car", "lightning"];
for (const name of HERO_ICONS) {
  if (iconStats[name]) {
    test(`HERO ${name}: ${iconStats[name]} elements (>= 700)`, iconStats[name] >= 700);
  }
}
```

### 9.2 Add `scripts/icon-bundle-test.mjs`

A new test that builds the Next.js app and asserts the icons chunk is <100 KB gzipped:

```js
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

describe("Icon Bundle Size", () => {
  test("All icon chunks total < 100 KB gzipped", () => {
    const chunksDir = ".next/static/chunks";
    const iconChunks = fs.readdirSync(chunksDir)
      .filter(f => f.includes("icons"))
      .map(f => fs.readFileSync(path.join(chunksDir, f)));
    const total = iconChunks.reduce((sum, buf) => sum + buf.length, 0);
    const gzipped = zlib.gzipSync(Buffer.concat(iconChunks)).length;
    test("Total < 100 KB gzipped", gzipped < 100 * 1024, `${(gzipped/1024).toFixed(1)} KB`);
  });
});
```

### 9.3 Add `scripts/icon-ssr-test.mjs`

Render each icon to string on the server, render again on the client, assert byte-identical output:

```js
import { renderToString } from "react-dom/server";
import { renderToStaticMarkup } from "react-dom/server";
// For each icon, render twice with the same props and diff the output
```

### 9.4 Visual regression (optional, later)

Use Playwright to screenshot each icon at 128×128 on a fixed theme, diff against golden images. Not blocking for v1 but recommended for Phase 2+.

---

## 10. Implementation Phases

### Phase 0 — Foundation (1–2 days)

**Goal:** Build the generator toolkit + lazy registry without changing any icon's rendered output.

- [ ] Create `src/components/icons/types.ts` with `IconRenderer = (id: string, animated: boolean) => ReactNode`
- [ ] Create `generators/` directory with 24 files (4 migrated + 20 new). Each generator is a stub initially, returning `<></>` with a `TODO` comment
- [ ] Migrate `mulberry32`, `twinkleValues`, `spinValues`, `pulseValues`, `driftValues`, `StarField`, `SparkleRays`, `Particles`, `ThemeGradient` from `svg-helpers.tsx` into the new files (keep `svg-helpers.tsx` as a re-export shim for backward compat)
- [ ] Implement the 20 new generators with full functionality
- [ ] Add unit tests for each generator (determinism: same seed → same output)
- [ ] Create `layers/` directory with 7 layer components, each supporting 3–5 variants
- [ ] Refactor `IconRegistry.ts` to use lazy loaders (`import("./icons/hero/ProposalIcon")`)
- [ ] Update `Icon.tsx` to wrap render in `<Suspense>` and use `use()` for the async registry lookup
- [ ] Update `scripts/icon-component-tests.mjs` threshold 100 → 500 (test will fail — that's expected, drives Phase 1)
- [ ] **Acceptance gate:** existing 33 icons still render (unchanged art) via backward-compat shim, all existing tests pass except the new 500+ threshold

### Phase 1 — Hero Icons (2–3 days)

**Goal:** Ship the 4 hero icons at 700+ elements each.

- [ ] `ProposalIcon.tsx` — implement per spec in §5.1
- [ ] `StargazeIcon.tsx` — implement per spec in §5.1
- [ ] `CarIcon.tsx` — implement per spec in §5.1
- [ ] `LightningIcon.tsx` — implement per spec in §5.1
- [ ] Visual review on a real device (Pixel 5 or equivalent) — confirm <2 ms render, smooth 60 fps animation
- [ ] **Acceptance gate:** `icon-component-tests.mjs` passes for all 4 hero icons (≥700 elements each), no SSR mismatch, bundle adds <15 KB gzipped

### Phase 2 — High-Traffic Category Icons (2–3 days)

**Goal:** Ship the 6 most-visible category icons at 500+ elements.

Priority order (based on app usage — proposal/stargaze already done in Phase 1, these are next):
1. `stay` (cabin) — appears on every day card
2. `hike` (boot) — difficulty + day 2
3. `water` (sailboat) — common attraction
4. `dining` (plate) — every meal stop
5. `railway` (train) — scenic railway hero
6. `historic` (temple) — landmark

- [ ] Implement each per spec in §5.2
- [ ] **Acceptance gate:** 6 icons pass 500+ threshold, visual review, bundle adds <20 KB gzipped

### Phase 3 — Remaining Category Icons (2 days)

**Goal:** Complete all 14 category icons.

- [ ] `scenic`, `wildlife`, `nearby`, `swimming`, `brewery`, `grocery`, `croissant`
- [ ] **Acceptance gate:** all 14 category icons pass 500+ threshold

### Phase 4 — Difficulty + Attraction Icons (2 days)

**Goal:** Ship the 10 difficulty/attraction icons.

- [ ] `mountain`, `walking`, `none`, `waterfall`, `bridge`, `nature`, `gas`, `carrot`, `farmstand` (NEW — split from carrot alias), `theater`
- [ ] **Acceptance gate:** 10 icons pass 500+ threshold, `FarmstandIcon` no longer aliases `CarrotIcon`

### Phase 5 — Decorative Icons (1 day)

**Goal:** Ship the 6 decorative icons.

- [ ] `heart`, `sparkle`, `fire`, `star`, `lightbulb`, `infinity`
- [ ] **Acceptance gate:** all 33 icons pass 500+ threshold, full test suite green, bundle <100 KB gzipped

### Phase 6 — Polish & Documentation (1 day)

- [ ] Delete the old `category-icons-svg.tsx`, `day-icons-svg.tsx`, `extra-icons-svg.tsx`, `svg-helpers.tsx` (now fully superseded)
- [ ] Update `emoji-dictionary.ts` if any icon names changed (none should)
- [ ] Add `README.md` in `src/components/icons/` documenting the generator API and how to add a new icon
- [ ] Run full test suite (`scripts/run-all-tests.sh`)
- [ ] Lighthouse audit on home + trip pages — confirm no perf regression
- [ ] **Final acceptance:** 33 icons × 500+ elements, <100 KB gzipped, 0 SSR mismatches, 0 hydration warnings, smooth 60 fps on mobile

**Total estimated effort: 11–14 days for a single developer.**

---

## 11. Risk Register & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bundle exceeds 100 KB | Low | High | Lazy-load registry; symbols+use; minify; verify per phase |
| SSR hydration mismatch | Medium | High | `toFixed(2)` everywhere; no `Date.now()`; round trig outputs |
| SMIL animation jank on mobile | Medium | Medium | Cap animated elements at 30/icon; pause offscreen; ≥2 s durations |
| Generator determinism breaks | Low | High | Unit-test each generator with fixed seeds; snapshot tests |
| `<symbol>` + `<use>` rendering quirks | Medium | Low | Test in Chrome, Firefox, Safari; fallback to inline if needed |
| React 19 `use()` API instability | Low | Medium | Fallback to `React.lazy` + `Suspense` if `use()` proves buggy |
| Visual regression vs current icons | High | Low | Phase 0 keeps old icons via shim; Phase 6 removes after sign-off |
| Generator over-engineering | Medium | Medium | Stop at 24 generators; if a 25th is needed, refactor first |

---

## 12. Open Questions for Stakeholder

1. **Visual style direction:** Keep the current "rounded rustic" aesthetic, or push toward a more painterly/illustrative look (heavier gradients, more texture)?
2. **Animation philosophy:** Confirm "keep existing SMIL, don't add more" — or is there appetite for 1–2 new hero animations (e.g., galaxy rotation, ring shimmer)?
3. **`FarmstandIcon` split:** Confirm we should create a dedicated farm-stand icon (currently aliased to carrot). If yes, what should it depict? (Produce stand with awning + crates is my proposal.)
4. **`NoneIcon` philosophy:** The "none" icon is visually minimal. Pushing it to 500+ elements via texture/particles changes its character. Acceptable, or should it stay sparse and be exempted from the 500+ rule?
5. **Bundle budget:** Is 100 KB gzipped a hard cap, or a target? If a hero icon alone is 8 KB gzipped and total creeps to 105 KB, is that a blocker?
6. **Test threshold:** Should the `>= 500` test be a hard fail in CI, or a warning with a grace period?

---

## 13. Summary

- **33 icons** redesigned from ~100 → **500+ elements** (4 hero icons at 700+)
- **24 procedural generators** (4 existing + 20 new) eliminate manual polygon bloat
- **7-layer composition system** gives every icon a consistent artistic spine
- **File-per-icon** structure with `generators/` + `layers/` shared toolkit
- **Lazy-loaded registry** + **module-level memoization** keeps bundle **<100 KB gzipped**
- **5-phase rollout** ships hero icons first, validates, then propagates
- **Existing SSR safety, theming, animation-pause, and ARIA patterns preserved**

**Next action:** Approve this plan, then begin Phase 0 (generator toolkit + lazy registry).
