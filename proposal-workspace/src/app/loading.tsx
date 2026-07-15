/**
 * loading.tsx — TH-03
 *
 * Themed loading state shown by Next.js app router while server
 * components are streaming. Also serves as the Suspense fallback.
 *
 * Pure CSS animation — no JS, no images, instant to render.
 * Matches the warm "field guide" aesthetic.
 */

export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-label="Loading the trip planner"
      className="relative min-h-[100dvh] flex items-center justify-center bg-rust-cream px-4"
    >
      {/* Subtle radial glow — matches error/not-found pages */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(184,134,11,0.15), transparent 55%)",
        }}
      />

      <div className="relative z-10 text-center">
        {/* Animated ring — pure CSS breathing animation */}
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div
            className="absolute inset-0 rounded-full border-2 border-rust-brass/20"
            aria-hidden
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-rust-brass anim-spin-slow"
            aria-hidden
          />
          <div
            className="absolute inset-2 rounded-full bg-rust-brass/10 anim-breathe"
            style={{ "--glow-color": "rgba(184,134,11,0.3)" } as React.CSSProperties}
            aria-hidden
          />
          {/* Center mark — a tiny compass star */}
          <svg
            className="absolute inset-0 m-auto h-8 w-8 text-rust-brass anim-gentle-rotate"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden
          >
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path d="M16 6 L18 16 L16 26 L14 16 Z" fill="currentColor" />
            <path d="M6 16 L16 14 L26 16 L16 18 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-rust-bark mb-2">
          Unfolding the map
        </h1>

        {/* Body */}
        <p className="text-sm text-rust-bark/60 max-w-xs mx-auto">
          A moment while the route settles into place.
        </p>

        {/* Sr-only announcement for screen readers */}
        <span className="sr-only">
          The trip planner is loading. Please wait.
        </span>
      </div>
    </main>
  );
}
