# Vector Graphics DSL / Library Research

**Question:** Is there a dedicated art/design coding language or library better suited than raw JSX `<polygon>`/`<circle>`/`<path>` SVG for the 33-icon, 500+ element system?

**Context:** Next.js 16 + React 19. Existing system already has: deterministic SSR RNG (`mulberry32`), `React.memo`, CSS-variable theming (`--rust-*`), SMIL animations paused offscreen via `IntersectionObserver`, `useId()`-sanitized gradient IDs, per-icon `hasAnimations`. Budget: <100 KB gzipped, 20+ icons on screen at once, mobile 60 fps. `@react-three/fiber` + `three` + `lucide-react` are already installed.

**Method:** 15 web searches across the 10 approach categories; findings cross-checked against the existing `docs/icon-redesign-plan.md`.

---

## TL;DR Recommendation

**Stay with JSX SVG.** No alternative DSL or library beats the current approach on the combination of **SSR safety + CSS-variable theming + zero-runtime bundle + 500-element art quality + 20-instance performance** that this project requires. The existing `icon-redesign-plan.md` (lazy registry + 24 generators + 7-layer system + `<symbol>` reuse + code-splitting) is the right path. The one tactical upgrade worth borrowing from this research is **SVG `<symbol>` sprites via `<use>`** (already noted as a gap in §1.4 of the plan) and **React Server Components** to push icon *source* off the client bundle entirely.

The alternatives each fail at least one hard constraint:

| Approach | Why it loses |
|---|---|
| SVG.js / Paper.js / Snap.svg / Two.js | Imperative DOM-mutation libs; add 20–300 KB to render SVG you can already emit as JSX; no SSR story for the imperative calls |
| Fabric.js / Konva (react-konva) | Canvas-only; lose CSS variables, accessibility, crisp export; `react-konva` pulls the whole Konva package and breaks SSR (no `window`) |
| D3.js | Data-viz oriented; ~300 KB, imperative; SVG output is identical to what JSX emits — no quality gain, large bundle cost |
| p5.js | 4.8 MB unminified (~2.5× D3+three combined); canvas-first; SSR-hostile; aimed at sketches, not icon systems |
| tsParticles | Particle backgrounds only; not an icon authoring tool |
| WebGL / GLSL fragment shaders | Highest perf ceiling, but each icon becomes a shader program; no CSS-variable theming, no SSR, GPU battery cost, huge authoring effort for 33 distinct icons |
| WebGPU compute shaders | Not shipping in Safari/Firefox stable; years from cross-browser |
| Lottie (lottie-react) | `lottie-web` reaches ~1.3 MB, uses `window` → SSR crashes (`document is not defined`); JSON animations can't be themed via CSS vars; designed for AE exports, not code-authored art |
| Rive | `.riv` files are 50–80% smaller than Lottie and ~200 KB runtime; but art is authored in the Rive editor, not code; loses the deterministic procedural generation that makes the current system compact |
| Iconify / IcoMoon / Fontello | Catalog/delivery tools for *off-the-shelf* icons, not a generation language; can't produce 500-element custom art |
| COLRv1 / variable-font glyphs | Cross-browser now (Chrome 98+, FF, Safari 16.4+), but glyphs are single-color/palette-aware, not 500-polyline illustrations; authoring tooling (FontLab/Glyphs) is offline and disconnected from code/CI |
| CSS Houdini Paint API | Chromium-only; no Firefox/Safari; paints into `<canvas>`-like surface, loses SVG DOM theming |
| react-three-fiber (3D) | Already installed, but 3D meshes are the wrong model for 2D illustrated icons; ~500 KB minimum; overkill |

---

## 1. SVG DSLs / Languages

### 1.1 SVG.js (`@svgdotjs/svg.js`)
- **What:** Lightweight (no deps), OO chaining API for creating/manipulating SVG imperatively: `const rect = draw.rect(100,100).fill('#f06')`.
- **Bundle:** ~20–30 KB gzipped (3.2.x).
- **Fit:** Adds a runtime layer to emit the exact same SVG elements JSX already produces. No SSR advantage (the imperative `draw.*` calls run client-side). No CSS-variable theming win — you'd still write `var(--rust-*)` into attributes manually.
- **Verdict:** ❌ Net negative. JSX is already a declarative SVG DSL with better tree-shaking.

### 1.2 D3.js
- **What:** Data-joins + SVG/Canvas/WebGL output. The SVG output is byte-identical to hand-written SVG.
- **Bundle:** ~280 KB full; tree-shakable to ~30–80 KB for selected modules, but still heavy for icon use.
- **Fit:** Optimized for *data-driven* visualization (scales, axes, force layouts). Icons here are not data-bound — they're parametric art. D3 offers nothing the existing `generators/` plan doesn't already do with `Array.from`.
- **Verdict:** ❌ Wrong tool; data-viz bias, no quality gain, bundle cost.

### 1.3 Snap.svg / Two.js / Paper.js
- **Snap.svg** (Adobe, ~90 KB) — abandoned-ish; imperative. Stack Overflow consensus: "SVG.js is more OO, Snap syntax more concise" — both solve a *manipulation* problem this project doesn't have.
- **Two.js** — renderer-agnostic (SVG/Canvas/WebGL); aimed at 2D drawing sketches.
- **Paper.js** — Canvas-based vector scripting with a full boolean-ops/boolean-path toolkit (~340 KB). Powerful for *interactive* editors (Penpot-like); wasteful for static icon emission.
- **Verdict:** ❌ All three are imperative manipulation/editing libraries. They add runtime to produce the same SVG. None improve the *quality ceiling* of 500-element art.

### 1.4 Fabric.js / Konva (react-konva)
- **What:** Canvas scene graphs with object model, selection, serialization. `react-konva` gives declarative `<Rect>`/`<Circle>` mirroring SVG ergonomics.
- **Bundle:** Fabric.js ~300 KB minified; Konva ~150 KB + `react-konva` imports the *whole* Konva package (issue #35, not tree-shakeable).
- **Critical failures:**
  - **SSR broken** — Canvas needs a browser; `react-konva` requires `window`/`canvas` polyfills server-side, else hydration errors.
  - **Loses CSS-variable theming** — Canvas pixels can't read `var(--rust-accent)`; you'd rebuild theme propagation in JS.
  - **Loses accessibility** — no DOM nodes for `role="img"`/`aria-label`.
  - **Loses crisp SVG export** — a documented SVG-vs-Canvas strength.
- **Perf:** Canvas wins at *thousands* of objects; at 500 elements × 20 instances = 10k, SVG with `<symbol>` reuse is still smooth on mobile per the jointjs/apexcharts benchmarks. The crossover where Canvas becomes necessary is above this project's ceiling.
- **Verdict:** ❌ Wrong tradeoff. Sacrifices SSR + theming + a11y for perf headroom you don't need.

---

## 2. Generative Art Libraries

### 2.1 p5.js
- **Bundle:** **4.8 MB unminified** (per p5.js issue #6776 — ~2.5× D3+three.js *combined*). Even tree-shaken, far above the 100 KB total icon budget.
- **SSR:** Canvas/DOM-first; the v2.0 RFC's #1 goal is *minimizing bundle size*, i.e. it's a known problem.
- **Fit:** A creative-coding sketchbook API (`setup()`/`draw()`). Designed for fullscreen generative art, not 64×64 themed icon glyphs. No CSS-var theming, no SMIL, no declarative React integration.
- **Verdict:** ❌ Bundle alone disqualifies it.

### 2.2 tsParticles
- A particle *background/effects* engine (`@tsparticles/react` v4.3.x). Excellent for full-page confetti/dust. Not an icon authoring system; can't render a "cabin" or "sailboat".
- **Verdict:** ❌ Different problem domain. (The current `Particles` generator already covers the dust-mote use case at ~0 KB.)

---

## 3. Shader-Based Approaches

### 3.1 WebGL fragment shaders (GLSL)
- **Strength:** Highest performance ceiling — a single shader can paint a 4K galaxy at 60 fps. `webgl-react` (ryohey) and the React 2026 shader tutorials show clean patterns.
- **Critical failures for this project:**
  - **No CSS variables** — uniforms must be re-uploaded per theme change in JS; breaks the `var(--rust-*)` contract.
  - **No SSR** — WebGL needs a GL context; server emits nothing, client hydrates from blank.
  - **Authoring model mismatch** — each icon becomes a GLSL program. "Cabin", "sailboat", "croissant" as signed-distance-field shaders is a research project, not an icon set.
  - **Battery/thermal** — 20 simultaneous WebGL contexts (or one atlas) is heavy on mobile GPUs.
- **Verdict:** ❌ Wrong abstraction for illustrated 2D icons. Worth considering only if a *single* hero background effect is needed (the project already has `MilkyWayOverlay.tsx` for that role).

### 3.2 WebGPU compute shaders
- Not stable in Safari (WebKit position still evolving) or Firefox. Years from "works in all browsers".
- **Verdict:** ❌ Not shippable today.

---

## 4. Lottie / Rive / Bodymovin (Vector Animation Formats)

### 4.1 Lottie (`lottie-react` / `lottie-web` / dotLottie)
- **Bundle:** `lottie-web` can reach **~1.3 MB** in real apps (Medium case study); `@dotlottie/react-player` ~16 KB → 51 KB after a recent migration.
- **SSR:** Hard fail — `lottie-web`'s `createTag()` references `document`, producing `ReferenceError` under Next.js SSR (SO #77612357, lottie-web issue #2739). Requires `next/dynamic` with `ssr: false` + a loading fallback for every icon.
- **Theming:** Lottie JSON colors are baked at export; no CSS-variable integration. Theming means shipping one JSON per theme × icon = 33 × N.
- **Art model:** Animations are authored in After Effects + Bodymovin — *offline*, not procedural. The current system's compactness comes from `mulberry32` + generators; Lottie would replace that with hand-tuned AE files (larger, non-deterministic, non-themeable).
- **Verdict:** ❌ SSR + theming + bundle triple-fail. Good fit only for a one-off *animated* hero illustration, not a 33-icon system.

### 4.2 Rive (`@rive-app/react-canvas`)
- **Strengths:** `.riv` files are 50–80% smaller than Lottie; runtime ~200 KB; supports a state-machine model (interactive). The single strongest "switch" candidate if the goal were *rich animation*.
- **Failures for this project:**
  - Canvas-rendered → same SSR/a11y/theming losses as Konva.
  - Authored in the Rive editor (proprietary `.rev` source) → disconnects art from code/CI/determinism.
  - 200 KB runtime alone exceeds the 100 KB *total* icon budget.
- **Verdict:** ⚠️ Tempting but wrong. Use only for a dedicated animated mascot/motion-design piece, not the icon system.

---

## 5. OpenType / Variable Fonts & Icon Font Generators

### 5.1 COLRv1 color fonts
- **Status:** Cross-browser — Chrome 98+, Edge, Firefox, Safari 16.4+, Samsung Internet. `font-palette` CSS property lets you swap palettes (CSS-Tricks, WebKit position #415).
- **Capability ceiling:** Palette-aware gradients + variable axes (e.g. *Nabla*, *Merit Badge*). But each glyph is a *single colored shape with layered paints* — not 500 discrete polygons. There is no "galaxy with 100 stars and 8 shooting-star trails" glyph.
- **Tooling:** Authored in FontLab 8 / Glyphs / FontCreator — offline GUI tools, disconnected from `mulberry32`/CI/determinism.
- **Theming:** `font-palette` swaps palettes only; can't map to the full `--rust-*` token set the way SVG `fill="var(--rust-accent)"` does.
- **Verdict:** ❌ Capability mismatch. Great for single-color/duotone logo fonts; can't express the planned 7-layer illustrated icons.

### 5.2 Iconify / IcoMoon / Fontello
- **Iconify:** 300k+ open-source icons, unified `<Icon icon="mdi:home" />`. Rewritten React component (2024) is modern + tree-shakeable. But it's a *catalog delivery* system — you pull pre-made icons. Can't generate 500-element custom art. Useful as a fallback for generic UI icons (the project already has `lucide-react` for this).
- **IcoMoon / Fontello:** Generate *icon fonts* (ligature-based). Single-color only; fonts flash unstyled content on load; no CSS-var theming; SVG sprites explicitly beat them (allsvgicons/svggenie comparisons).
- **Verdict:** ❌ Not a generation language. Keep `lucide-react` for chrome; keep the JSX system for hero art.

---

## 6. Procedural Texture / Noise Libraries

- **simplex-noise** (npm): fast, ~2 KB; works browser + Node (SSR-safe). `noisejs` (josephg): 2D/3D Perlin + simplex, ~10M queries/sec.
- **Fit:** These are *inputs* to generators, not rendering systems. The current `svg-helpers.tsx` already uses `mulberry32` (deterministic) for placement. Adding `simplex-noise` would improve organic distributions (mist clouds, sand ripples, fur texture) without changing the rendering substrate.
- **Verdict:** ✅ **Drop-in enhancement** for the existing `generators/terrain.ts`, `particles.ts`, `texture.ts` files in the redesign plan. No architecture change; ~2 KB cost. This is the single most actionable "yes" from the research.

---

## 7. React-Specific Rendering Libraries

### 7.1 react-three-fiber (R3F)
- **Already installed** in this project (`@react-three/fiber` ^9.6, `@react-three/drei` ^10.7, `three` ^0.185).
- **Fit for icons:** R3F is a React renderer for *Three.js* — 3D scenes, meshes, materials, lights. A 64×64 illustrated icon is fundamentally a 2D vector composition; forcing it into 3D meshes (extruded shapes, orthographic camera, shader materials) adds ~500 KB minimum and a GPU context per icon for no visual gain.
- **Where it *is* useful here:** The project already has `EngagementReveal3D.tsx` — R3F is the right tool for that 3D ring reveal. It is the wrong tool for the 2D icon set.
- **Verdict:** ❌ for icons; ✅ already correctly used for the 3D reveal scene.

### 7.2 react-konva
- See §1.4. Canvas scene-graph with declarative React bindings. SSR-broken, theming-broken, a11y-broken.
- **Verdict:** ❌

### 7.3 react-art
- Legacy React reconciler for SVG/Canvas. Largely superseded by native React DOM SVG support (which this project uses). Low activity (LibHunt: "React Konva is more popular than ART").
- **Verdict:** ❌ Abandoned direction.

---

## 8. Canvas2D Rendering

- **Performance truth:** Canvas outperforms SVG only at *high mark counts* (thousands). At 500 elements × 20 instances, SVG with `<symbol>`+`<use>` reuse is documented as smooth (jointjs, apexcharts, vijayt benchmarks). SVG wins on interactivity, styling, crisp export, and accessibility.
- **What you'd lose switching to Canvas2D:** CSS-variable theming (Canvas can't read `var()`), `role="img"`/`aria-label`, crisp re-render on theme switch without a full redraw, declarative React reconciliation, SSR HTML.
- **Verdict:** ❌ Premature optimization. The bottleneck (if any) is *animation*, solved by the existing offscreen-pause + `prefers-reduced-motion` pattern, not by switching renderers.

---

## 9. Emerging Standards

### 9.1 CSS Houdini Paint API
- **Status:** Chromium-only. Firefox/WebKit have not shipped it (MDN, web.dev, iamvdo). `paint()` worklets can't be polyfilled cross-browser.
- **Fit:** Paints into a canvas-like surface inside CSS `background-image: paint(...)`. Loses the SVG DOM (no theming via `var()` into the paint worklet beyond registered properties, no per-element `aria-label`).
- **Verdict:** ❌ Not cross-browser; wrong abstraction.

### 9.2 WebGPU
- See §3.2. Not stable cross-browser.

---

## 10. Master Comparison Table

Scoring: ✅ strong / ⚠️ partial / ❌ fails. Weighted by this project's hard constraints (SSR, CSS-var theming, <100 KB, 500-element art, 20-instance mobile perf, maturity).

| Approach | SSR-safe | CSS-var theme | Bundle (gz) | 500-elem art | 20× mobile perf | Animation | Maturity | Net |
|---|---|---|---|---|---|---|---|---|
| **JSX SVG (current + plan)** | ✅ | ✅ | ~0 (tree-shaken) | ✅ | ✅ (w/ `<symbol>`) | ✅ SMIL | ✅ | ✅ **Keep** |
| SVG.js | ⚠️ imperative | ✅ | ~25 KB | ✅ | ✅ | ⚠️ | ✅ | ❌ redundant |
| D3.js | ⚠️ | ✅ | 30–280 KB | ✅ | ✅ | ⚠️ | ✅ | ❌ data-viz bias |
| Snap.svg / Two.js / Paper.js | ⚠️ | ✅ | 90–340 KB | ✅ | ✅ | ⚠️ | ⚠️ Snap stale | ❌ editing-biased |
| Fabric.js / react-konva | ❌ canvas | ❌ | 150–300 KB | ✅ | ✅ | ⚠️ | ✅ | ❌ SSR+theme fail |
| p5.js | ❌ | ❌ | ~4.8 MB | ✅ | ✅ | ✅ | ✅ | ❌ bundle |
| tsParticles | ❌ | ⚠️ | ~50 KB | ❌ | ✅ | ✅ | ✅ | ❌ not icons |
| WebGL/GLSL shaders | ❌ | ❌ uniforms | ~50 KB+ | ⚠️ SDF only | ✅ | ✅ | ✅ | ❌ abstraction |
| WebGPU | ❌ | ❌ | n/a | ⚠️ | ✅ | ✅ | ❌ not shipped | ❌ |
| Lottie (lottie-react) | ❌ `document` | ❌ baked | 16 KB–1.3 MB | ✅ | ⚠️ | ✅ | ✅ | ❌ SSR+theme |
| Rive (`@rive-app`) | ❌ canvas | ❌ | ~200 KB | ✅ | ✅ | ✅✅ state machine | ⚠️ | ⚠️ editor-bound |
| Iconify | ✅ | ⚠️ | ~15 KB | ❌ catalog | ✅ | ❌ | ✅ | ❌ not generative |
| IcoMoon/Fontello fonts | ⚠️ FOUT | ❌ 1-color | ~10 KB | ❌ | ✅ | ❌ | ✅ | ❌ capability |
| COLRv1 variable font | ✅ | ⚠️ palette | ~50 KB | ❌ layered paints | ✅ | ⚠️ | ⚠️ | ❌ capability |
| react-three-fiber | ⚠️ | ❌ | ~500 KB+ | ⚠️ 3D | ⚠️ GPU | ✅ | ✅ | ❌ for 2D icons |
| react-art | ⚠️ | ✅ | small | ✅ | ✅ | ⚠️ | ❌ stale | ❌ legacy |
| CSS Houdini Paint | ❌ Chromium | ⚠️ | ~0 | ⚠️ | ✅ | ❌ | ❌ | ❌ |
| **simplex-noise (as generator input)** | ✅ | n/a | ~2 KB | ✅ better organic | n/a | n/a | ✅ | ✅ **Add** |

---

## 11. Recommendation — What to Actually Do

### 11.1 Do not switch rendering substrates
The JSX-SVG approach is, for this project's constraint set, the **objectively correct** choice. Every alternative sacrifices at least one of {SSR, CSS-variable theming, <100 KB bundle, 500-element art quality, cross-browser, mobile 60 fps}. The existing `docs/icon-redesign-plan.md` is well-reasoned; proceed with it.

### 11.2 Borrow the two genuine wins from this research

1. **SVG `<symbol>` sprites + `<use href="#id">`** (already flagged as a gap in plan §1.4). This is the single highest-leverage optimization for *multi-instance* rendering: a 500-element icon used 5 times on a page renders 500 elements once + 5 `<use>` references, not 2,500. Confirm the plan's `<symbol>` motif reuse covers *full-icon* reuse, not just motif reuse. Build-pipeline options: `svg-sprite-loader`, `svgr` with sprite mode, or a hand-rolled `<defs>` injector mounted once per route.
2. **`simplex-noise` as a generator input** (~2 KB). Swap `mulberry32`-only placement in `generators/terrain.ts`, `particles.ts`, `texture.ts`, `sky.ts` for simplex-noise-driven fields. Produces visibly more organic mist/sand/fur/cloud distributions at negligible cost. Keep `mulberry32` for SSR determinism seeding (seed the simplex instance from it).

### 11.3 One additional lever the plan doesn't yet mention

**React Server Components for icon *source*.** On Next.js 16, an icon's renderer function can be a Server Component that emits the SVG string into the RSC payload — the *generator code itself* (the 24 generator modules, ~all of the icon LOC) never ships to the client. Only the resulting SVG markup crosses the wire. This can take the client icon budget from "<100 KB" to "near 0 KB of JS" while keeping full SSR. Caveat: SMIL animations and `useIconPause` (client `IntersectionObserver`) need a thin client island wrapper — which the existing `Icon.tsx` ("use client") already is. Worth adding as a Phase 0.5 experiment on one hero icon.

### 11.4 Where each *rejected* approach could still earn a place
- **Rive** — if a future "animated proposal ring reveal" hero moment is wanted (state-machine interactivity), not for the 33-icon set.
- **R3F** — already used for `EngagementReveal3D`; correct as-is.
- **WebGL shaders** — only for full-bleed background scenes (the project's `MilkyWayOverlay.tsx`), never per-icon.
- **Iconify / lucide-react** — already covers generic UI chrome icons; keep separate from the art icons.

---

## 12. Next Actions

1. **Approve** the existing `docs/icon-redesign-plan.md` Phase 0 (generator toolkit + lazy registry) — this research confirms JSX SVG is the right substrate.
2. **Add** `simplex-noise` (`bun add simplex-noise`) and seed it from `mulberry32` in the organic-distribution generators (terrain, particles, texture, sky).
3. **Specify** the `<symbol>` + `<use>` full-icon reuse contract in plan §3.1 — decide whether each icon emits a `<symbol>` into a route-level `<defs>` or stays inline. Multi-instance pages (day cards, attraction lists) are the payoff target.
4. **Prototype** one hero icon (e.g. `StargazeIcon`) as a React Server Component to measure the client-JS reduction; if clean, fold into Phase 1.
5. **No action** on SVG.js / D3 / Paper.js / Fabric / Konva / p5 / Lottie / Rive / shaders / Houdini / WebGPU / COLRv1 — each fails a hard constraint documented above.

---

*Research sources: 15 web searches (SVG DSL comparisons, p5 bundle, WebGL-in-React, Lottie-vs-Rive, Iconify, COLRv1/WebKit, simplex-noise, react-konva SSR, SVG-sprite patterns, Houdini browser support). Cross-referenced against the project's `docs/icon-redesign-plan.md` (720 LOC) and `package.json` (Next 16, React 19, R3F + three already installed).*
