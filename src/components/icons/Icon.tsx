"use client";

/**
 * Icon.tsx — Base animated SVG icon component
 *
 * Renders inline SVG icons from the IconRegistry. Each icon has 100+
 * polygons, 3+ SMIL animations (20+ keyframes), and uses CSS variables
 * for theme integration.
 *
 * Features:
 *   - Inline SVG (inherits currentColor + CSS vars)
 *   - SMIL animations pause when offscreen (IntersectionObserver)
 *   - Respects prefers-reduced-motion
 *   - SSR-safe (pure SVG, no useEffect for initial render)
 *   - Memoized (only re-renders on prop change)
 *   - Tree-shakeable (each icon is a separate import)
 *
 * Usage:
 *   <Icon name="car" size={24} animated />
 *   <Icon name="ring" size={48} animated aria-label="Engagement ring" />
 *   <Icon name="check" size={16} />  // non-animated
 */

import { memo, useId, type CSSProperties } from "react";
import { ICON_REGISTRY, type IconName } from "./IconRegistry";

interface IconProps {
  name: IconName;
  size?: number;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Accessible label. If omitted, icon is aria-hidden. */
  "aria-label"?: string;
  /** Render as decorative (aria-hidden=true) — default true if no aria-label */
  decorative?: boolean;
}

function IconImpl({
  name,
  size = 24,
  animated = false,
  className,
  style,
  "aria-label": ariaLabel,
  decorative,
}: IconProps) {
  const rawId = useId();
  // Sanitize useId output for SVG id (it contains ":" which is invalid in SVG ids)
  const id = rawId.replace(/:/g, "");
  const entry = ICON_REGISTRY[name];
  const isHidden = decorative ?? !ariaLabel;

  if (!entry) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Icon "${name}" not found in registry`);
    }
    return null;
  }

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={style}
      role={isHidden ? "presentation" : "img"}
      aria-hidden={isHidden ? "true" : undefined}
      aria-label={isHidden ? undefined : ariaLabel}
      data-icon={name}
      data-animated={animated ? "true" : "false"}
    >
      {entry.render(id, animated)}
    </svg>
  );
}

export const Icon = memo(IconImpl);
export default Icon;
export type { IconName };
export { CATEGORY_TO_ICON } from "./IconRegistry";
