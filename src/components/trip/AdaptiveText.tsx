"use client";

/**
 * AdaptiveText.tsx
 *
 * A drop-in text wrapper that automatically picks a WCAG-compliant text
 * color based on the actual rendered background behind the element.
 *
 * Samples the background in real time (on scroll, resize, theme change,
 * and DOM mutations) and adjusts the text color to maintain readability.
 *
 * Works on:
 *   - Solid backgrounds (any theme color)
 *   - Linear/radial gradients (samples at the element's vertical position)
 *   - Translucent overlays (walks up DOM to find opaque layer)
 *   - Theme-switched backgrounds (re-samples when data-theme changes)
 *
 * Usage:
 *   <AdaptiveText className="text-lg font-bold">Always readable</AdaptiveText>
 *   <AdaptiveText as="h2" largeText>Big heading</AdaptiveText>
 *   <AdaptiveText lightColor="#fef3c7" darkColor="#451a03">Custom palette</AdaptiveText>
 */

import { useRef, type ElementType, type ReactNode, type CSSProperties } from "react";
import { useAdaptiveText } from "@/lib/adaptive-text";
import { cn } from "@/lib/utils";

interface AdaptiveTextProps {
  children: ReactNode;
  /** Render as a different element (h1, h2, p, span, etc.) — default span */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** If true, uses 3:1 threshold (for ≥18px or ≥14px bold text) */
  largeText?: boolean;
  /** Custom light text color to try first (default: theme cream) */
  lightColor?: string;
  /** Custom dark text color to try first (default: theme bark) */
  darkColor?: string;
  /** If provided, adds a text-shadow for extra readability on busy backgrounds */
  ensureShadow?: boolean;
}

export default function AdaptiveText({
  children,
  as: Tag = "span",
  className,
  style,
  largeText,
  lightColor,
  darkColor,
  ensureShadow,
}: AdaptiveTextProps) {
  const ref = useRef<Element>(null);
  const color = useAdaptiveText(ref, { largeText, lightColor, darkColor });

  return (
    <Tag
      ref={ref as never}
      className={cn(className)}
      style={{
        ...style,
        color: color ?? style?.color,
        // Add a subtle shadow if requested — helps on photos / busy backgrounds
        ...(ensureShadow && {
          textShadow: "0 1px 2px rgba(0,0,0,0.4), 0 0 8px rgba(0,0,0,0.2)",
        }),
      }}
    >
      {children}
    </Tag>
  );
}
