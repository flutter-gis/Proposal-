"use client";

/**
 * Icon.tsx — Base SVG icon component (static, sprite-based)
 *
 * References icons defined in IconSprite via <use href="#icon-{name}">.
 * This means the 500+ element artwork exists in the DOM exactly ONCE per
 * icon type (in the sprite), not once per instance.
 *
 * All icons are STATIC — no SMIL animations. CSS variables penetrate the
 * <use> shadow boundary for instant theme recoloring with zero re-render.
 *
 * Usage:
 *   <Icon name="car" size={24} />
 *   <Icon name="ring" size={48} aria-label="Engagement ring" />
 */

import { memo, type CSSProperties } from "react";
import { type IconName } from "./IconRegistry";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  decorative?: boolean;
}

function IconImpl({
  name,
  size = 24,
  className,
  style,
  "aria-label": ariaLabel,
  decorative,
}: IconProps) {
  const isHidden = decorative ?? !ariaLabel;

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
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}

export const Icon = memo(IconImpl);
export default Icon;
export type { IconName };
export { CATEGORY_TO_ICON, DAY_ICON_MAP, TYPE_TO_ICON, DIFFICULTY_TO_ICON } from "./IconRegistry";
