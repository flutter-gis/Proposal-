"use client";

/**
 * error.tsx — TH-01
 *
 * Global error boundary. Catches uncaught errors thrown by any server or
 * client component in the app router tree.
 *
 * Design language: matches the warm "field guide" aesthetic — bark card
 * with brass accents, serif heading, parchment body. No emoji (icons
 * are SVG via lucide-react). Gender-neutral throughout.
 *
 * The error is logged to console for dev visibility. Users get a calm,
 * non-technical message and a single primary action (Try again) plus
 * a secondary action (Go home).
 */

import { useEffect } from "react";
import { RotateCcw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for dev visibility (production would send to a service)
    console.error("[ErrorBoundary] Uncaught error:", error);
    if (error.digest) {
      console.error("[ErrorBoundary] Digest:", error.digest);
    }
  }, [error]);

  return (
    <main
      role="alert"
      aria-live="assertive"
      className="relative min-h-[100dvh] flex items-center justify-center bg-rust-cream px-4 py-10"
    >
      {/* Subtle radial glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(184,134,11,0.18), transparent 55%), radial-gradient(circle at 50% 80%, rgba(122,36,24,0.12), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-md text-center">
        <div className="bark-card anim-fade-in-up rounded-3xl p-7 md:p-9 text-rust-cream">
          {/* Icon */}
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rust-brass/20 ring-1 ring-rust-brass/40">
            <AlertTriangle className="h-6 w-6 text-rust-brass" aria-hidden />
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            The trail took an unexpected turn
          </h1>

          {/* Body */}
          <p className="text-sm sm:text-base text-rust-cream/80 leading-relaxed mb-6">
            Something went wrong while loading this page. Your place in the
            trip is safe — take a breath and try again, or head back to the
            start.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="brass-button anim-glow-sweep inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider tap-feedback"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-rust-cream hover:bg-white/15 tap-feedback transition-colors"
            >
              <Home className="w-4 h-4" />
              Go home
            </a>
          </div>

          {/* Digest (small, for debugging) */}
          {error.digest && (
            <p className="mt-6 text-[10px] uppercase tracking-widest text-rust-cream/40 font-mono">
              ref: {error.digest}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
