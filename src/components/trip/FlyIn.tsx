"use client";

/**
 * FlyIn.tsx — CSS-only entrance animations (NO framer-motion)
 *
 * Three primitives for consistent entrance animations across the app.
 * Uses IntersectionObserver + CSS classes instead of framer-motion.
 *
 *   <FlyIn>          — single fade-in-up entrance
 *   <FlyInStagger>   — wraps multiple <FlyInItem> children, staggered
 *   <FlyInItem>      — item inside a FlyInStagger
 *
 * Respects prefers-reduced-motion via the CSS media query.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-40px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export function FlyIn({
  children,
  className,
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "section" | "article" | "li";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as any}
      className={cn(
        "transition-all duration-500 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}

export function FlyInStagger({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "section";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as any}
      className={cn(
        "transition-all duration-500 ease-out",
        inView ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {inView ? children : null}
    </Tag>
  );
}

export function FlyInItem({
  children,
  className,
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: "div" | "li" | "article";
}) {
  return (
    <Tag className={cn("anim-fade-in-up", className)} style={style}>
      {children}
    </Tag>
  );
}
