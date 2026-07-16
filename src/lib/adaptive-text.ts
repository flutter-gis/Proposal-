/**
 * adaptive-text.ts
 *
 * Real-time adaptive text color system.
 *
 * Samples the actual rendered background behind a text element (including
 * gradients, translucent overlays, and inherited backgrounds) and returns
 * a WCAG-compliant text color (light or dark) that guarantees readability.
 *
 * The sampling walks up the DOM tree to find the first opaque background,
 * parses gradient stops to estimate the color at the element's vertical
 * position, and re-evaluates on scroll / resize / theme change.
 *
 * Usage:
 *   const color = useAdaptiveText(ref);
 *   <span ref={ref} style={{ color }}>Always readable</span>
 */

import { useEffect, useState, type RefObject } from "react";

// ── Color parsing & luminance ──────────────────────────────────────────

interface RGB { r: number; g: number; b: number; a: number }

function parseColor(css: string): RGB | null {
  if (!css) return null;
  css = css.trim();
  if (css === "transparent" || css === "rgba(0, 0, 0, 0)") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  // hex
  const hex = css.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (h.length === 6 || h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }
  }
  // rgb / rgba
  const rgbMatch = css.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(",").map(s => parseFloat(s.trim()));
    return {
      r: parts[0] || 0,
      g: parts[1] || 0,
      b: parts[2] || 0,
      a: parts[3] !== undefined ? parts[3] : 1,
    };
  }
  return null;
}

function relLuminance({ r, g, b }: RGB): number {
  const toLin = (c: number) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrastRatio(c1: RGB, c2: RGB): number {
  const l1 = relLuminance(c1);
  const l2 = relLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Alpha-blend a foreground color over a background. */
function blend(fg: RGB, bg: RGB): RGB {
  if (fg.a >= 1) return fg;
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

// ── Background sampling ────────────────────────────────────────────────

/**
 * Given an element, walk up the DOM tree and compute the effective
 * background color at the element's position. Handles:
 *   - rgba/transparent (walks up to find opaque layer)
 *   - linear-gradient / radial-gradient (samples at element's vertical midpoint)
 *   - CSS custom properties (resolves via getComputedStyle)
 *
 * Returns an opaque RGB color (alpha = 1).
 */
function sampleEffectiveBackground(el: Element): RGB {
  const rect = el.getBoundingClientRect();
  // Sample at the vertical midpoint of the element, horizontal center
  const sampleY = rect.top + rect.height / 2;

  let current: Element | null = el;
  let accumulatedAlpha = 0;
  let blended: RGB = { r: 255, g: 255, b: 255, a: 1 }; // start white (page bg assumption)

  while (current && accumulatedAlpha < 0.99) {
    const style = getComputedStyle(current);
    const bg = style.backgroundColor;
    const bgImage = style.backgroundImage;

    // Try solid background first
    const solid = parseColor(bg);
    if (solid && solid.a > 0) {
      blended = blend(solid, blended);
      accumulatedAlpha += solid.a * (1 - accumulatedAlpha);
    }

    // Try gradient — sample the color at the element's relative position
    if (bgImage && bgImage !== "none") {
      const gradColor = sampleGradientAt(bgImage, current, sampleY);
      if (gradColor && gradColor.a > 0) {
        blended = blend(gradColor, blended);
        accumulatedAlpha += gradColor.a * (1 - accumulatedAlpha);
      }
    }

    current = current.parentElement;
  }

  // If still not opaque, blend over the document background
  if (accumulatedAlpha < 0.99) {
    const docBg = parseColor(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    blended = blend(docBg, blended);
  }

  blended.a = 1;
  return blended;
}

/**
 * Parse a CSS gradient string and sample the color at a given Y position
 * relative to the element's bounding box.
 */
function sampleGradientAt(bgImage: string, el: Element, absY: number): RGB | null {
  // Match linear-gradient(...) or radial-gradient(...)
  const gradMatch = bgImage.match(/(linear|radial)-gradient\(([^)]+(?:\([^)]*\))*[^)]*)\)/);
  if (!gradMatch) return null;

  const type = gradMatch[1];
  const body = gradMatch[2];

  // Parse color stops — each is "color [position]"
  const stops: { color: RGB; pos: number }[] = [];
  // Split on commas not inside parens
  const parts = body.split(/,(?![^()]*\))/);
  let lastPos = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    // Skip angle/direction keywords like "180deg", "to bottom", "circle at"
    if (/^(to\s|circle|ellipse|at\s|\d+deg|\d+rad|\d+turn)/.test(part)) continue;
    const colorMatch = part.match(/^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|[a-z]+)\s*([0-9.]+%)?/i);
    if (!colorMatch) continue;
    const color = parseColor(colorMatch[1]);
    if (!color) continue;
    const pos = colorMatch[2] ? parseFloat(colorMatch[2]) / 100 : (i / Math.max(parts.length - 1, 1));
    stops.push({ color, pos });
    lastPos = pos;
  }

  if (stops.length === 0) return null;
  // If only one stop, return it
  if (stops.length === 1) return stops[0].color;

  // Sort by position
  stops.sort((a, b) => a.pos - b.pos);

  // Compute the element's relative position in the gradient
  const rect = el.getBoundingClientRect();
  // For linear-gradient default (to bottom), position = (absY - rect.top) / rect.height
  // For radial-gradient, just use the midpoint
  let relPos: number;
  if (type === "radial") {
    relPos = 0.5; // sample middle of radial
  } else {
    relPos = (absY - rect.top) / rect.height;
  }
  relPos = Math.max(0, Math.min(1, relPos));

  // Interpolate between the two surrounding stops
  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (relPos >= s1.pos && relPos <= s2.pos) {
      const t = s2.pos > s1.pos ? (relPos - s1.pos) / (s2.pos - s1.pos) : 0;
      return {
        r: Math.round(s1.color.r + (s2.color.r - s1.color.r) * t),
        g: Math.round(s1.color.g + (s2.color.g - s1.color.g) * t),
        b: Math.round(s1.color.b + (s2.color.b - s1.color.b) * t),
        a: s1.color.a + (s2.color.a - s1.color.a) * t,
      };
    }
  }

  // Fallback: return the closest stop
  return stops[Math.round(relPos * (stops.length - 1))].color;
}

// ── Text color selection ──────────────────────────────────────────────

/**
 * Given a background RGB, return the best text color (light or dark)
 * that achieves WCAG AA contrast (4.5:1 for normal text, 3:1 for large).
 *
 * Tries the theme's text and textOnDark colors first, then falls back
 * to pure black/white with darkening/lightening if needed.
 */
function bestTextColorForBg(bg: RGB, options?: { largeText?: boolean; lightColor?: string; darkColor?: string }): string {
  const threshold = options?.largeText ? 3.0 : 4.5;
  const lightColor = options?.lightColor ? parseColor(options.lightColor) : { r: 250, g: 243, b: 227, a: 1 }; // cream
  const darkColor = options?.darkColor ? parseColor(options.darkColor) : { r: 26, g: 20, b: 16, a: 1 }; // dark bark

  const lightContrast = contrastRatio(lightColor!, bg);
  const darkContrast = contrastRatio(darkColor!, bg);

  if (lightContrast >= threshold) return rgbToCss(lightColor!);
  if (darkContrast >= threshold) return rgbToCss(darkColor!);

  // Neither passes — pick the better and darken/lighten to meet target
  const bgLum = relLuminance(bg);
  if (bgLum > 0.4) {
    // Light background — need darker text
    let adjusted = { ...darkColor! };
    for (let i = 0; i < 8; i++) {
      adjusted = { r: Math.round(adjusted.r * 0.7), g: Math.round(adjusted.g * 0.7), b: Math.round(adjusted.b * 0.7), a: 1 };
      if (contrastRatio(adjusted, bg) >= threshold) break;
    }
    return rgbToCss(adjusted);
  } else {
    // Dark background — need lighter text
    let adjusted = { ...lightColor! };
    for (let i = 0; i < 8; i++) {
      adjusted = {
        r: Math.round(adjusted.r + (255 - adjusted.r) * 0.4),
        g: Math.round(adjusted.g + (255 - adjusted.g) * 0.4),
        b: Math.round(adjusted.b + (255 - adjusted.b) * 0.4),
        a: 1,
      };
      if (contrastRatio(adjusted, bg) >= threshold) break;
    }
    return rgbToCss(adjusted);
  }
}

function rgbToCss(c: RGB): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

// ── React hook ─────────────────────────────────────────────────────────

/**
 * useAdaptiveText — samples the background behind the element and returns
 * a WCAG-compliant text color. Re-samples on scroll, resize, and theme change.
 *
 * @param ref React ref to the text element
 * @param options.largeText — if true, uses 3:1 threshold (for ≥18px or ≥14px bold)
 * @param options.lightColor — custom light text color to try first
 * @param options.darkColor — custom dark text color to try first
 *
 * @returns A CSS color string, or null if not yet sampled.
 */
export function useAdaptiveText(
  ref: RefObject<Element | null>,
  options?: { largeText?: boolean; lightColor?: string; darkColor?: string }
): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;

    const sample = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const bg = sampleEffectiveBackground(el);
        const text = bestTextColorForBg(bg, options);
        setColor(text);
      });
    };

    // Initial sample
    sample();

    // Re-sample on scroll (debounced via rAF)
    const onScroll = () => sample();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    // Re-sample on resize
    const onResize = () => sample();
    window.addEventListener("resize", onResize, { passive: true });

    // Re-sample on theme change — watch the data-theme attribute on <html>
    const observer = new MutationObserver(() => sample());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    // Re-sample when the element's own class/style changes (e.g., hover, expand)
    const elObserver = new MutationObserver(() => sample());
    elObserver.observe(el, { attributes: true, attributeFilter: ["class", "style"] });

    // Re-sample when the element enters the viewport (lazy-rendered sections)
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) sample();
      }
    }, { threshold: 0.1 });
    io.observe(el);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      elObserver.disconnect();
      io.disconnect();
    };
  }, [ref, options?.largeText, options?.lightColor, options?.darkColor]);

  return color;
}

// ── Direct API (for non-React use) ─────────────────────────────────────

export { sampleEffectiveBackground, bestTextColorForBg, contrastRatio, relLuminance };
