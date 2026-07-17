/**
 * useViewport.ts — Responsive viewport detection hook
 *
 * Provides real-time viewport dimensions, device type, and orientation.
 * Re-measures on resize, orientation change, and visual viewport change
 * (for mobile browser UI bar show/hide).
 *
 * Handles tablet-specific breakpoints that fall between mobile and desktop.
 */

import { useState, useEffect } from "react";

export interface ViewportInfo {
  width: number;
  height: number;
  aspect: number;
  isMobile: boolean;    // < 640px
  isTablet: boolean;    // 640-1024px
  isDesktop: boolean;   // > 1024px
  isPortrait: boolean;
  isLandscape: boolean;
  isTouch: boolean;     // touch-capable device
  dpr: number;          // devicePixelRatio (capped at 2)
  safeAreaTop: number;  // CSS env(safe-area-inset-top) — for notches
  safeAreaBottom: number;
}

const DEFAULT: ViewportInfo = {
  width: 1280,
  height: 800,
  aspect: 1.6,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isPortrait: false,
  isLandscape: true,
  isTouch: false,
  dpr: 1,
  safeAreaTop: 0,
  safeAreaBottom: 0,
};

export function useViewport(): ViewportInfo {
  const [vp, setVp] = useState<ViewportInfo>(DEFAULT);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;
      const isDesktop = w >= 1024;
      const isPortrait = h > w;
      const isLandscape = w > h;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Read safe-area insets (for iPhone notches, etc.)
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      const sat = computed.getPropertyValue("--sat") || "0px";
      const sab = computed.getPropertyValue("--sab") || "0px";
      const safeAreaTop = parseInt(sat) || 0;
      const safeAreaBottom = parseInt(sab) || 0;

      setVp({
        width: w,
        height: h,
        aspect,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        isLandscape,
        isTouch,
        dpr,
        safeAreaTop,
        safeAreaBottom,
      });
    };

    measure();

    // Listen to all resize events
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure, { passive: true });

    // Visual viewport API — catches mobile browser UI bar show/hide
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", measure);
    }

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", measure);
      }
    };
  }, []);

  return vp;
}

export default useViewport;
