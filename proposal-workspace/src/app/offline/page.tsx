"use client";

/**
 * offline.tsx — G-07
 *
 * Offline fallback page. Shown by the service worker when the user is
 * offline AND the requested URL isn't in the cache.
 *
 * Calm, on-brand, gender-neutral. Explains the situation and offers
 * the cached home page as the path forward.
 */

import { WifiOff, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main
      role="alert"
      aria-live="assertive"
      className="relative min-h-[100dvh] flex items-center justify-center bg-rust-cream px-4 py-10"
    >
      {/* Subtle radial glow — matches error/not-found */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(184,134,11,0.15), transparent 55%), radial-gradient(circle at 50% 80%, rgba(122,36,24,0.10), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-md text-center">
        <div className="leather-card parchment-texture anim-fade-in-up rounded-3xl p-7 md:p-9">
          {/* Icon */}
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rust-forest/15 ring-1 ring-rust-forest/30">
            <WifiOff className="h-6 w-6 text-rust-forest" aria-hidden />
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-rust-bark mb-3">
            You&apos;ve wandered off-grid
          </h1>

          {/* Body */}
          <p className="text-sm sm:text-base text-rust-bark/75 leading-relaxed mb-6">
            There&apos;s no internet connection right now, and this page
            isn&apos;t saved for offline use. The home page and everything
            we&apos;ve already visited is still available — let&apos;s head
            back there.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="brass-button anim-glow-sweep inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider tap-feedback"
            >
              <Home className="w-4 h-4" />
              Back to the trip
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider bg-rust-wax/20 border border-rust-wax/40 text-rust-bark hover:bg-rust-wax/30 tap-feedback transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>

        {/* Small footer note */}
        <p className="mt-6 text-xs text-rust-bark/50 italic">
          Cached pages will load instantly when you&apos;re back online.
        </p>
      </div>
    </main>
  );
}
