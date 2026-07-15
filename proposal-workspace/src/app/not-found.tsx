/**
 * not-found.tsx — TH-02
 *
 * Themed 404 page. Matches the warm "field guide" aesthetic.
 * Catches:
 *   - Any unmatched route (/foo, /random, etc.)
 *   - Next.js's default 404
 *
 * Calm, on-brand, gender-neutral. Two actions: go home, or go to the
 * proposal page (the most-likely intended destination).
 */

import { Home, Diamond, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="relative min-h-[100dvh] flex items-center justify-center bg-rust-cream px-4 py-10"
    >
      {/* Subtle radial glow background — matches error.tsx */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(184,134,11,0.18), transparent 55%), radial-gradient(circle at 50% 80%, rgba(122,36,24,0.12), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-md text-center">
        <div className="leather-card parchment-texture anim-fade-in-up rounded-3xl p-7 md:p-9">
          {/* Compass icon — fits the wilderness theme */}
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rust-forest/15 ring-1 ring-rust-forest/30">
            <Compass className="h-6 w-6 text-rust-forest anim-gentle-rotate" aria-hidden />
          </div>

          {/* Big "404" */}
          <div
            className="font-serif text-7xl sm:text-8xl font-bold text-rust-bark/20 mb-2 leading-none"
            aria-hidden
          >
            404
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-rust-bark mb-3">
            Off the map
          </h1>

          {/* Body */}
          <p className="text-sm sm:text-base text-rust-bark/75 leading-relaxed mb-6">
            This page isn&apos;t on the trail. The route you followed may
            have been a typo, an old bookmark, or a path that wandered off.
            Let&apos;s get you back to known ground.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="brass-button anim-glow-sweep inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider tap-feedback"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
            <Link
              href="/proposal"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider bg-rust-wax/20 border border-rust-wax/40 text-rust-bark hover:bg-rust-wax/30 tap-feedback transition-colors"
            >
              <Diamond className="w-4 h-4" />
              See the proposal
            </Link>
          </div>
        </div>

        {/* Small footer note */}
        <p className="mt-6 text-xs text-rust-bark/50 italic">
          The Wilderness Romance · Aug 4–9, 2026
        </p>
      </div>
    </main>
  );
}
