# Custom Emoji / Symbol Rendering — Alternatives to Inline SVG

**Question:** The current system renders 500–800 element SVG icons inline. When 20+ render simultaneously, DOM bloat (~10,000+ nodes) slows the page. What are the alternatives, and which preserves CSS-variable theming + SSR + crispness while cutting the cost?

**Context:** Next.js 16 + React 19. Icons use `fill="currentColor"` and `var(--rust-*)` CSS-variable stop-colors (see `StargazeIcon.tsx` ~800 elements, `svg-helpers.tsx` generators). Deterministic SSR via `mulberry32`. SMIL animations paused offscreen via `IntersectionObserver`. Budget: <100 KB gzipped, mobile 60 fps.

**Method:** 10 targeted web searches (COLRv1 theming, OpenType-SVG status, SVG `<use>` perf, data-URI CSS-var limits, canvas pre-render, bitmap sprites, web components SSR, nanoemoji/picosvg, font-palette override-colors, Cloud Four stress test). Cross-checked against the existing `docs/vector-graphics-dsl-research.md` and the actual icon source.

---

## TL;DR Recommendation

**Adopt SVG `<symbol>` sprites referenced via `<use>`.** It is the *only* approach that simultaneously (a) cuts document-DOM nodes ~95% on multi-instance pages, (b) preserves the existing `var(--rust-*)` per-token theming model (CSS custom properties inherit through the `<use>` shadow boundary), (c) stays vector-crisp at 12px and 48px, (d) is fully SSR-safe (an inline sprite is just HTML), (e) keeps the bundle tiny, (f) works in every browser, and (g) requires **no re-authoring** of the 500-element artwork — only a build-wrapping step. This closes the gap flagged in `docs/icon-redesign-plan.md` §1.4 and is the single highest-leverage change.

Everything else fails at least one hard constraint:

| # | Approach | Verdict | Why |
|---|---|---|---|
| 1 | **COLRv1 color font** | ⚠️ Partial | Themable *but only at palette-index granularity* (not per-element `var()`); picosvg subset forbids filters + **SMIL dies** (fonts can't run `<animate>`); full re-authoring. |
| 2 | OpenType SVG font | ❌ | **Chrome never shipped it** (Chromium #40336440). No CSS-var theming. |
| 3 | Bitmap PNG/WebP sprites | ❌ | Baked pixels → **no dynamic theming**; needs sprite-per-theme-per-DPI; soft at 12px. |
| 4 | Canvas pre-render | ❌ | Colors baked at render → theme change = full re-render; **no SSR**; loses SMIL. |
| 5 | **SVG `<symbol>` + `<use>`** | ✅ **Adopt** | 1 def + N `<use>` nodes; `var()` + `currentColor` penetrate the shadow tree; SSR-safe; crisp. |
| 6 | CSS `background-image` data-URI SVG | ❌ | `currentColor` / `var()` **cannot penetrate** an image resource (SO, GitHub issue #553). Mask trick = monochrome only. |
| 7 | Web Components | ⚠️ Wrapper only | `var()` pierces shadow DOM ✓, but perf = whatever's inside; DSD-SSR is fiddly. Use *around* `<use>`, not instead. |
| 8 | Dedicated "emoji design language" | ❌ (none exist) | No turnkey DSL. nanoemoji/picosvg is purpose-built *for the font path* (#1) with all its limits. |

---

## 1. COLRv1 Color Fonts

**What:** OpenType color-font format (the one Noto Color Emoji uses). A glyph is a directed acyclic graph of paint ops: solid fills, linear/radial/conic gradients, blending modes (screen/multiply/…), transforms. Variable-font axes can animate gradient stops & transforms at runtime.

**Custom-designable?** Yes.
- **nanoemoji** (Google) — compiles SVG → COLRv1. The supported SVG subset is enforced by **picosvg** (no filters, limited gradients, no arbitrary clip rules).
- **fontmake** / **Glyphs 8** / **FontLab 8** — GUI/font-engine authoring.
- **COLR Pak** (Fontra fork) — open-source visual paint-graph editor.
- **Fontpainter** — quick mono→COLRv1 conversion.
- Reference builds: `googlefonts/color-fonts` (test COLRv1 + OT-SVG samples).

**CSS-variable theming — the nuance that matters:**
- The `font-palette` property + the `@font-palette-values` at-rule with the **`override-colors`** descriptor lets CSS remap the font's named palette entries. The descriptor accepts `<color>`, so `override-colors: 0 var(--rust-accent); 1 var(--rust-sky);` **does resolve CSS variables** (MDN; reddit r/css "font-palette + COLRv1: CSS recolouring for entire icon systems"; Text Lab "Animating Font Palette" Chrome 121+).
- **BUT** this is *palette-index* theming. Every glyph must be authored against a shared palette (index 0 = primary, 1 = secondary, …). You recolor index N globally across the whole icon set. It is **not** per-element arbitrary `fill="var(--rust-foo)"` like the current SVG. A 12-color-role illustrated galaxy can be mapped to 12 palette entries, but every icon shares that 12-entry mapping — coarser than the current model where each of 800 elements can independently reference any `--rust-*` token.
- Variable COLRv1 axes (Chrome) can additionally animate gradient stops/transforms via `font-variation-settings`.

**Killer constraints for this codebase:**
- **SMIL is gone.** Fonts cannot execute `<animate>`/`<animateTransform>`. The entire twinkle/spin/pulse/drift animation system in `svg-helpers.tsx` would have to be rebuilt as variable-axis animation (Chrome-only smooth palette animation) or dropped. This is a hard loss.
- **picosvg subset** forbids SVG filters and constrains gradients — the current icons' radial gradients are OK, but any future filter usage is out.
- **Procedural generation breaks.** The `mulberry32` + generator architecture produces *runtime* element counts. A font is a fixed compile-time artifact; you'd freeze each icon into one shape (no deterministic per-instance variation).

**Evaluation:**

| Criterion | COLRv1 |
|---|---|
| 20+ icons perf | ✅ 20 text nodes, GPU-cached |
| CSS-var theming | ⚠️ Palette-index only (coarser than current per-element `var()`) |
| Scalability 12–48px | ✅ vector, crisp |
| SSR | ✅ it's text |
| Bundle | ✅ one font (~tens of KB) |
| Cross-browser | ✅ Chrome 98+, FF 121+, Safari 16.4+; ⚠️ `font-palette` *animation* Chrome 121+ only |
| Authoring 500-elem art | ❌ full re-author in picosvg subset; **lose SMIL**; lose procedural generation |

**Verdict:** ⚠️ Fascinating and improving fast, but wrong fit. Theming is palette-index (not per-token), and SMIL/procedural generation — two pillars of the current system — don't survive the move. Keep watching; revisit only if the project ever drops SMIL in favor of pure static art.

---

## 2. OpenType SVG Fonts (SVG table in OpenType)

**What:** Full SVG markup embedded in a font's `SVG ` table (OpenType 1.9.1 spec, Microsoft Learn). Each glyph is a complete SVG document.

**Status — effectively dead for web:**
- The standalone `.svg` *font* format is **deprecated and removed** from Chrome/Firefox/Edge (CanIUse ~15%, BaseWatch "not in Baseline").
- The **OpenType SVG *table*** is a different thing and is still in the spec — **but Chromium explicitly never shipped it**: issue #40336440 — *"We currently have no plans to support SVG for OpenType."* Firefox supports it; Safari historically supported it. Chrome's ~65% market share means **most users see nothing**.
- Google's own guidance (Coherent Labs docs, nanoemoji README): *"shipping font files with an SVG table should be avoided"*; nanoemoji exists specifically to convert SVG fonts → COLRv1.

**Theming:** None. The embedded SVG is a static, self-contained resource. No `var()`, no `currentColor` leakage from the page.

**Verdict:** ❌ Dead on arrival for web. Use COLRv1 (#1) instead if you go the font route at all.

---

## 3. Bitmap Emoji (PNG / WebP Sprites)

**What:** Pre-render every icon to PNG/WebP at multiple sizes (1x/2x/3x), pack into a sprite sheet, address via CSS `background-position`.

**Performance:** Excellent — one HTTP request, then CSS background blits. 20 icons = 20 styled elements, zero SVG parsing.

**Theming — fails the hard requirement:** Pixels are baked. To support the `--rust-*` token set you'd need either (a) one full sprite sheet per theme combination (combinatorial explosion), or (b) CSS `filter: hue-rotate()/sepia()` hacks that cannot hit arbitrary named tokens precisely. This breaks dynamic theming.

**Quality at different DPIs:** Needs @2x/@3x sprites for retina; lossless WebP is ~60% smaller than PNG (nickb.dev). But: a 500-element galaxy scaled to 12px becomes mud; downscaling a 48px raster to 12px is acceptable but never as crisp as vector. The small-size legibility loss is material for an illustrated icon set.

**SSR:** ✅ (just CSS backgrounds).

**Verdict:** ❌ Fast, but abandons dynamic theming and vector crispness. Only viable if you freeze the theme set to ≤2 fixed palettes and accept raster softness — not this project.

---

## 4. Canvas Pre-Rendering (SVG → canvas → image)

**What:** Draw each SVG to an offscreen `<canvas>` once per (icon, theme, size) combo, then use the canvas as an `<img>`/`background-image` source (`toDataURL` or `transferToImageBitmap`).

**Does it preserve CSS-variable theming? No, not dynamically.** The canvas capture bakes the colors present at draw time. Changing `--rust-accent` at runtime does **not** re-paint the already-rasterized canvas — you must re-render. So this is thematically identical to bitmap sprites (#3) with extra steps. It also **loses SMIL animation** (canvas is a static snapshot).

**Performance:** Great *after* pre-render (bitmap blits), but the pre-render itself is expensive and must repeat on every theme/DPI change.

**SSR:** ❌ Canvas is client-only. Requires a fallback for first paint.

**Verdict:** ❌ Same theming problem as bitmaps, plus no SSR and no animation. Useful only if the theme set is tiny and fixed and animation is unwanted.

---

## 5. SVG `<symbol>` + `<use>` — THE RECOMMENDED APPROACH

**What:** Define each 500-element icon ONCE as a `<symbol>` inside a hidden `<svg>` sprite. Reference it N times via `<use href="#icon-stargaze">`.

**DOM-node reduction (the core win):**
- Inline today: 20 icons × 500 elements = **~10,000 document-DOM nodes**.
- `<symbol>`+`<use>`: 1 symbol definition (500 nodes) + 20 `<use>` references = **~520 document-DOM nodes**.
- **~95% reduction** in the document tree. (The renderer still paints 10,000 elements in the shadow trees, but style/layout recalc, mutation observers, and DOM-API costs — the actual bottlenecks at this scale — drop dramatically. Shared `<defs>`/gradients are deduplicated.)
- SO ("Does reusing symbols improve SVG performance?"): *"a `<use>` element is very compact (1 node)…"*. Cloud Four's stress test, joanleon.dev, and Stan Sagalovskiy's Medium benchmark all rank `<symbol>`+`<use>` sprite as the **most performant** technique for reusable multi-instance icons.

**CSS-variable theming — works:**
- CSS custom properties **inherit through the `<use>` shadow boundary** (Codrops "Styling SVG `<use>` Content with CSS"; CSS-Tricks; freeCodeCamp "multi-colored icons with SVG symbols and CSS variables").
- So `fill="var(--rust-accent)"` and `stop-color="var(--rust-sky)"` inside the `<symbol>` resolve against the `<use>` host's (or its ancestors') custom properties. **The existing `--rust-*` theming model is preserved verbatim.** `currentColor` also works.

**What changes for this codebase (the migration cost):**
1. **Gradient IDs become a non-issue.** Today `Icon.tsx` calls `useId()` and passes `id` to every renderer to avoid cross-instance collisions. With `<symbol>`, defs live *inside* the symbol and are referenced *relatively* — there's exactly one definition, so collisions vanish. The per-instance `id` plumbing can be removed.
2. **SMIL inside `<symbol>`/`<use>` works** in Chrome/Firefox/Safari (the shadow clone runs its own animation timeline). The existing `useIconPause` (IntersectionObserver) must target the `<use>` host element rather than the inner `<svg>`; pausing SMIL is done by setting the host's style (e.g. a class that sets `--anim-state: paused` consumed by a CSS rule, or detaching via `display:none`). Verify the current pause mechanism works on `<use>`; if not, a small adapter is needed.
3. **Build step.** Each icon's render output is wrapped in `<symbol id="icon-<name>" viewBox="0 0 64 64">`. Emit all symbols into one sprite `<svg>` mounted once (e.g. in the root layout, `aria-hidden`, `position:absolute; width:0; height:0`). `Icon.tsx` then emits `<svg><use href={`#icon-${name}`} /></svg>` (or `<use>` directly inside a sized container).
4. **Procedural generation still works** — the generators run at sprite-build/render time and emit the symbol content once. Determinism (`mulberry32`) is unaffected.
5. **Theme switching is instant** — flipping `--rust-accent` re-resolves the custom properties across all `<use>` clones with no re-render of the DOM.

**Evaluation:**

| Criterion | `<symbol>`+`<use>` |
|---|---|
| 20+ icons perf | ✅ ~520 vs ~10,000 document nodes; best-in-class for multi-instance |
| CSS-var theming | ✅ `var()` + `currentColor` penetrate shadow tree |
| Scalability 12–48px | ✅ vector |
| SSR | ✅ inline sprite is plain HTML |
| Bundle | ✅ one def + N tiny `<use>` |
| Cross-browser | ✅ universal |
| Authoring 500-elem art | ✅ **no re-authoring** — wrap existing output in `<symbol>` |

**Verdict:** ✅ **Adopt.** See implementation section below.

---

## 6. CSS `background-image` with Data-URI SVG

**What:** Embed the SVG as a `data:` URI in `background-image`. Zero DOM nodes per icon (it's a background on an existing element).

**Can CSS variables penetrate it? No.**
- Confirmed across multiple sources: `currentColor` and CSS custom properties **do not work** inside an SVG used as `background-image` or `<img>` — the SVG is an opaque image resource with no CSS context (SO #49381592 *"There is no way to use CSS' currentColor within your SVG when it's a background image"*; GitHub QuickFolders #553 *"External SVGs Do Not Inherit CSS Context (Variables, currentColor)"*).
- **Workarounds and their limits:**
  - *Mask technique* — use the SVG as a `mask`, then set `background-color: var(--rust-accent)`. **Monochrome only.** Cannot recolor a 12-role illustrated galaxy.
  - *Adactio's "SVG source as a custom property"* — declare the whole SVG string as `--icon-stargaze: url("data:image/svg+xml,…")`. But the colors are baked *into the string at declaration time*; switching themes means re-declaring every icon's string. No runtime dynamic theming.
  - *CSS Linked Parameters* (kizu.dev draft) — would let CSS values flow into linked SVG resources. **Not shipped** in any browser.

**Verdict:** ❌ Breaks multi-color dynamic theming outright. Only viable for monochrome UI chrome icons (where the mask trick is genuinely elegant). Not for this illustrated set.

---

## 7. Web Components (`<app-icon>`)

**What:** A custom element that encapsulates icon rendering, optionally with Shadow DOM.

**Theming:** ✅ CSS custom properties pierce shadow-DOM boundaries (they inherit). So `--rust-*` flows in. (You don't *have* to use Shadow DOM — light-DOM custom elements are simpler and let global CSS apply directly.)

**Performance:** A wash, **determined by what's inside**. If the component inlines the SVG, the DOM cost is identical to inline SVG. If it internally uses `<symbol>`+`<use>`, it inherits those wins. So Web Components are a **packaging/encapsulation layer, not a perf strategy**.

**SSR:** Workable but fiddly. Declarative Shadow DOM (`<template shadowrootmode="open">`) enables SSR but adds per-instance template overhead and requires a hydration boundary. Without DSD, the custom element renders as an empty unknown tag until JS loads → blank icons on slow connections (FOUC). For a content-driven Next.js app where icons appear above the fold, this is a real downside vs. plain inline SVG/`<use>` which paint immediately from SSR HTML.

**Verdict:** ⚠️ Reasonable as an *ergonomic wrapper* layered **on top of** the `<use>` approach (e.g. `<app-icon name="stargaze">` that emits `<use href="#icon-stargaze">`). Do not adopt it *instead of* `<use>` — it adds hydration complexity without a perf gain, and SSR is clumsier than raw HTML.

---

## 8. Dedicated "Emoji Design Language" / Tool

**Is there something purpose-built?** No turnkey DSL for custom *web* symbol systems exists. The landscape:

- **nanoemoji + picosvg** (Google) — the closest thing to a purpose-built toolchain, but it targets the **font path** (#1 COLRv1). It is a *compiler*, not an authoring language, and inherits all of #1's constraints (no SMIL, palette-index theming, picosvg subset).
- **OpenMoji** — open-source SVG emoji *set* + style guide (4,000+ glyphs, CC BY-SA). An authoring *framework/reference*, not a runtime. Useful as a style reference; cannot render your custom icons.
- **Twemoji / Noto Color Emoji** — asset libraries, not authoring languages.
- **Iconify / IcoMoon / Fontello** — catalog/delivery for *off-the-shelf* icons; can't produce 500-element custom art (already noted in `vector-graphics-dsl-research.md` §5.2).

**For a procedural system like this codebase** (mulberry32 + 24 generators), there is genuinely no off-the-shelf DSL. JSX-SVG-with-generators **is** the bespoke design language. The leverage is in the *delivery substrate* (`<symbol>`+`<use>`), not in switching authoring tools.

**Verdict:** ❌ (nothing to adopt). The only purpose-built toolchain (nanoemoji/picosvg) targets the font path and is unsuitable for the reasons in #1.

---

## Master Comparison

Scoring: ✅ strong / ⚠️ partial / ❌ fails. Weighted by this project's hard constraints (CSS-var theming, SSR, 500-element art, mobile 60fps with 20+ instances, crisp 12–48px, <100 KB, cross-browser).

| Approach | DOM nodes (20 icons) | CSS-var theme | Crisp all sizes | SSR | Bundle | Cross-browser | Authoring | Net |
|---|---|---|---|---|---|---|---|---|
| Current inline SVG | ~10,000 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ perf risk |
| **1. COLRv1 font** | ~20 (text) | ⚠️ palette-only | ✅ | ✅ | ✅ | ⚠️ partial | ❌ re-author + lose SMIL | ❌ |
| **2. OpenType SVG font** | ~20 | ❌ | ✅ | ✅ | ✅ | ❌ Chrome no | ❌ | ❌ |
| **3. Bitmap sprites** | ~20 | ❌ baked | ❌ raster | ✅ | ⚠️ | ✅ | ⚠️ render pipeline | ❌ |
| **4. Canvas pre-render** | ~20 | ❌ baked | ❌ raster | ❌ | ✅ | ✅ | ⚠️ | ❌ |
| **5. `<symbol>`+`<use>`** | **~520** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ wrap-only | ✅ **Adopt** |
| **6. Data-URI bg SVG** | 0 | ❌ opaque | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| **7. Web Components** | = inline or `<use>` | ✅ | ✅ | ⚠️ DSD | ✅ | ✅ | ⚠️ | ⚠️ wrapper |
| **8. Emoji DSL/tool** | n/a | n/a | n/a | n/a | n/a | n/a | ❌ none exists | ❌ |

---

## Implementation Approach (for this codebase)

### Phase 1 — Sprite + `<use>` (the win)

1. **Sprite component.** Add `src/components/icons/IconSprite.tsx` — a server component that renders one hidden `<svg aria-hidden style={{position:'absolute',width:0,height:0,overflow:'hidden'}}>` containing a `<symbol id={`icon-${name}`} viewBox="0 0 64 64">` for every registered icon. Mount it **once** in `src/app/layout.tsx` (or per-route if bundle-splitting). Because it's pure SVG, it's SSR-safe and adds no JS.

2. **Refactor `Icon.tsx`.** Replace the inline `entry.render(id, animated)` call with:
   ```tsx
   <svg viewBox="0 0 64 64" width={size} height={size} className={className}
        style={style} role={isHidden?'presentation':'img'} aria-hidden={isHidden||undefined}
        aria-label={isHidden?undefined:ariaLabel} data-icon={name}>
     <use href={`#icon-${name}`} />
   </svg>
   ```
   Remove the `useId()`/`id` plumbing — gradient IDs are now scoped inside each `<symbol>`, so cross-instance collisions are structurally impossible.

3. **Generator output → symbol content.** Each icon's existing `render()` function already returns SVG children. In the sprite, wrap that output in `<symbol>`. The `var(--rust-*)` references resolve against the `<use>` host's inherited custom properties, exactly as today.

4. **Animation pause.** Confirm `useIconPause.ts` works when targeting the `<use>` host. If SMIL pause needs adjustment, add a CSS-variable toggle (e.g. host gets class `icon-paused` → a rule sets `--anim-running: 0` consumed by a thin wrapper), or keep the existing `display:none`-style approach. (SMIL in shadow clones runs per-`<use>`, so pausing the host pauses that clone only.)

5. **Measure.** Before/after on a multi-instance page (e.g. day cards, attraction catalog): document DOM node count should drop from ~10,000 to ~520; first-paint and theme-switch latency should both improve. Cloud Four's `svg-icon-stress-test` repo is the benchmark template.

### Phase 2 — Optional refinements

6. **Web Component wrapper (optional DX).** If a cleaner consumer API is wanted, wrap the `<use>` emit in a light-DOM `<app-icon name="stargaze">` custom element. Keep it light-DOM (no Shadow DOM) so global CSS and SSR stay simple. Only do this if the JSX `<Icon name="…" />` API feels insufficient.

7. **RSC for sprite source (from existing plan §11.3).** Make the sprite a React Server Component so the generator *code* stays off the client bundle; only the SVG markup crosses the wire. Already noted in `vector-graphics-dsl-research.md`.

### What NOT to do

- Do **not** migrate to COLRv1/OpenType-SVG fonts — you'd lose SMIL, lose per-element `var()`, and re-author everything for a coarser theming model.
- Do **not** switch to bitmaps/canvas/data-URI backgrounds — dynamic theming breaks.
- Do **not** adopt Web Components as a *replacement* for `<use>` — they add hydration cost without a perf win.

---

## Sources

- COLRv1: developer.chrome.com/blog/colrv1-fonts; css-tricks.com/colrv1-and-css-font-palette; simoncozens.github.io/colrv1-rocks; nabla.typearture.com/whatisCOLRV1.html; chromestatus.com/feature/6326528091095040 (Variable COLRv1); blog.logrocket.com/creating-custom-css-typography-colrv1.
- COLRv1 tooling: github.com/googlefonts/nanoemoji; github.com/googlefonts/color-fonts; typedrawers.com (COLR Pak, Fontpainter); forum.glyphsapp.com.
- font-palette theming: MDN `@font-palette-values`/`override-colors`; textlab.dev "Animating Font Palette" (Chrome 121+); reddit r/css font-palette thread.
- OpenType SVG: learn.microsoft.com/en-us/typography/spec/svg; issues.chromium.org/40336440 (Chrome won't ship); caniuse.com/svg-fonts; font-converters.com (deprecated).
- `<symbol>`+`<use>`: cloudfour.com/thinks/svg-icon-stress-test; tylersticka.com/journal/svg-icon-stress-test; css-tricks.com/which-svg-technique-performs-best; joanleon.dev/en/svg-optimization; medium/@ysagal (Measuring performance of SVG icons); tympanus.net/codrops/2015/07/16/styling-svg-use-content-css (CSS vars penetrate); freecodecamp "multi-colored icons with SVG symbols and CSS variables"; smashingmagazine 2025 SVG+use+CSS custom properties; bstefanski.com "Can SVG Symbols affect web performance?".
- Data-URI CSS-var limit: stackoverflow.com/q/49381592; github.com/RealRaven2000/QuickFolders#553; kizu.dev/svg-linked-parameters-workaround (draft, unshipped); adactio.com/journal/15075 (string-interpolation workaround).
- Bitmap/canvas: nickb.dev (WebP vs PNG sprite, ~60% smaller); codeandweb.com retina sprites; sosquishy.io sprite optimization.
- Web Components: web.dev/articles/declarative-shadow-dom; 12daysofweb.dev/2024/declarative-shadow-dom; master.dev/blog/light-dom-only.
- Emoji tools: openmoji.org; github.com/hfg-gmuend/openmoji; emojipedia.org/openmoji.
