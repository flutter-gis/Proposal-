"use client";

/**
 * useLazyImage.ts — #2 CRITICAL FIX
 *
 * Custom IntersectionObserver-based lazy loading that works inside the
 * SlideDeck's custom scroll container (div.overflow-y-auto).
 *
 * The browser's native `loading="lazy"` attribute only watches the viewport,
 * NOT custom scroll containers. This means images inside the SlideDeck never
 * trigger loading because they never intersect the viewport (they intersect
 * the scroll container instead).
 *
 * This hook:
 *   1. Finds the scroll container (`.overflow-y-auto`)
 *   2. Creates an IntersectionObserver with that container as `root`
 *   3. Observes the image element
 *   4. Sets `shouldLoad` to true when the image enters the visible area
 *
 * Usage:
 *   const { ref, shouldLoad } = useLazyImage();
 *   <img ref={ref} src={shouldLoad ? url : undefined} {...} />
 *
 * Or with a placeholder:
 *   <img ref={ref} src={shouldLoad ? url : placeholder} {...} />
 */

import { useEffect, useRef, useState } from "react";

const ROOT_MARGIN = "300px"; // Start loading 300px before entering view

function useLazyImage<T extends HTMLElement = HTMLImageElement>() {
  const ref = useRef<T>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return; // Already loaded, no need to observe
    if (!ref.current) return;

    const findScrollRoot = (): HTMLElement | null => {
      // Walk up the DOM to find the scroll container
      let el: HTMLElement | null = ref.current;
      while (el) {
        if (el.classList?.contains("overflow-y-auto")) return el;
        el = el.parentElement;
      }
      // Fallback: query for it globally
      return document.querySelector(".overflow-y-auto");
    };

    const root = findScrollRoot();

    // If no scroll container found, fall back to viewport (native behavior)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        root,
        rootMargin: ROOT_MARGIN,
        threshold: 0.01,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return { ref, shouldLoad };
}

/**
 * LazyImage — drop-in replacement for <img> that uses useLazyImage.
 *
 * Usage:
 *   <LazyImage src={url} alt="..." className="..." />
 *
 * Or with WebP fallback:
 *   <LazyImage webp={webpUrl} src={jpgUrl} alt="..." />
 *   Renders a <picture> with <source type="image/webp"> + <img> fallback.
 *
 * The image starts with no src (or a tiny placeholder) and loads when it
 * enters the scroll container's visible area.
 */
export function LazyImage({
  src,
  webp,
  alt,
  className,
  decoding = "async",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { webp?: string }) {
  const { ref, shouldLoad } = useLazyImage<HTMLImageElement>();

  // If webp is provided, render a <picture> with source + img fallback.
  // Otherwise render a plain <img> for backward compatibility.
  if (webp) {
    return (
      <picture>
        {shouldLoad && <source srcSet={webp} type="image/webp" />}
        <img
          ref={ref}
          src={shouldLoad ? src : undefined}
          alt={alt}
          className={className}
          decoding={decoding}
          {...props}
        />
      </picture>
    );
  }

  return (
    <img
      ref={ref}
      src={shouldLoad ? src : undefined}
      alt={alt}
      className={className}
      decoding={decoding}
      {...props}
    />
  );
}
