"use client";

/**
 * IconSprite.tsx — Single hidden SVG containing all icons as <symbol> definitions
 *
 * Mounts ONCE in layout.tsx. Every icon is defined as a <symbol> with its
 * full 500+ element artwork. The Icon component then references them via
 * <use href="#icon-{name}"> — which means the 500 elements exist in the
 * DOM exactly ONCE per icon type, not once per icon instance.
 *
 * This reduces DOM node count by ~95% (10,000 → 520 for 20 icons).
 *
 * All icons are STATIC (no SMIL animations) for maximum performance.
 * CSS variables (var(--rust-*)) penetrate the <use> shadow boundary
 * and recolor icons instantly on theme change with zero re-render.
 */

import { useId } from "react";
import { ICON_REGISTRY, type IconName } from "./IconRegistry";

export default function IconSprite() {
  const rawId = useId();
  const spriteId = rawId.replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      data-icon-sprite={spriteId}
    >
      <defs>
        {(Object.keys(ICON_REGISTRY) as IconName[]).map((name) => {
          const entry = ICON_REGISTRY[name];
          if (!entry) return null;
          // Render each icon's content inside a <symbol>.
          // The symbol's id is `icon-{name}` — referenced by <use href="#icon-{name}">.
          // Pass animated=false to strip all SMIL <animate> tags (static icons).
          return (
            <symbol
              key={name}
              id={`icon-${name}`}
              viewBox="0 0 64 64"
              overflow="visible"
            >
              {entry.render(`sprite-${name}`, false)}
            </symbol>
          );
        })}
      </defs>
    </svg>
  );
}
