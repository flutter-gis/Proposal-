"use client";

import { useTrip } from "@/lib/trip-context";
import { Button } from "@/components/ui/button";

// Deterministic star positions (precomputed) to avoid SSR/CSR hydration mismatch
const STAR_POSITIONS = [
  { top: 8.32, left: 12.45, size: 1.8, delay: 0.3 },
  { top: 15.67, left: 45.82, size: 2.4, delay: 1.2 },
  { top: 22.14, left: 78.91, size: 1.5, delay: 0.7 },
  { top: 5.89, left: 33.12, size: 2.1, delay: 2.1 },
  { top: 28.43, left: 8.74, size: 1.9, delay: 0.5 },
  { top: 11.27, left: 67.34, size: 1.6, delay: 1.8 },
  { top: 38.91, left: 22.18, size: 2.3, delay: 0.9 },
  { top: 18.56, left: 91.45, size: 1.4, delay: 2.4 },
  { top: 31.78, left: 55.67, size: 2.0, delay: 1.5 },
  { top: 7.23, left: 88.92, size: 1.7, delay: 0.2 },
  { top: 25.61, left: 18.34, size: 1.3, delay: 1.1 },
  { top: 42.87, left: 72.19, size: 2.5, delay: 0.6 },
  { top: 14.92, left: 50.83, size: 1.8, delay: 2.0 },
  { top: 35.14, left: 5.67, size: 1.5, delay: 1.3 },
  { top: 4.78, left: 60.91, size: 2.2, delay: 0.4 },
  { top: 47.32, left: 38.45, size: 1.6, delay: 1.7 },
  { top: 21.89, left: 12.78, size: 1.9, delay: 2.2 },
  { top: 9.45, left: 75.34, size: 1.4, delay: 0.8 },
  { top: 33.67, left: 84.12, size: 2.1, delay: 1.4 },
  { top: 17.23, left: 28.56, size: 1.7, delay: 0.1 },
];

export default function HeroSection() {
  const { setPage } = useTrip();

  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] lg:min-h-[70vh] overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 text-white">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(225, 29, 72, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 50% 100%, rgba(13, 148, 136, 0.3) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Mountain silhouette SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-30"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "25vh" }}
        aria-hidden
      >
        <path fill="#000" fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        <path fill="#000" fillOpacity="0.6" d="M0,288L80,261.3C160,235,320,181,480,176C640,171,800,213,960,224C1120,235,1280,213,1360,202.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
      </svg>

      {/* Stars — reduced from 50 to 20 for performance */}
      <div className="absolute inset-0 opacity-60">
        {STAR_POSITIONS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:py-20 max-w-6xl anim-fade-in-up">
        <div className="text-center">
          {/* Today indicator — shows current trip day */}
          <TodayIndicator />

          <h1 className="font-lobster text-5xl sm:text-7xl lg:text-9xl mb-4 sm:mb-6 tracking-tight leading-none">
            The Wilderness
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-amber-300 bg-clip-text text-transparent">
              Romance
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={() => setPage(1)}
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white border-0 px-6 py-4 sm:px-8 sm:py-6 text-sm sm:text-base font-semibold shadow-xl shadow-rose-900/30 w-full sm:w-auto"
            >
              See the Itinerary →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Today Indicator ─────────────────────────────────────────────────────
function TodayIndicator() {
  const now = new Date();
  const tripStart = new Date("2026-08-04T00:00:00");
  const tripEnd = new Date("2026-08-10T00:00:00");
  const dayLabels = [
    "The Off-Grid Escape",
    "Still Waters & Wildlife",
    "The Powered Preparation",
    "THE BIG PROPOSAL DAY",
    "Frontier Horizons & Dark Skies",
    "The Double-Header Grand Finale",
  ];

  if (now < tripStart) {
    // Before trip — show countdown hint
    return (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Trip starts August 4, 2026
      </div>
    );
  }

  if (now > tripEnd) {
    // After trip
    return (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
        <span>✓</span> The trip is complete — relive it below
      </div>
    );
  }

  // During trip — show current day
  const dayIdx = Math.floor((now.getTime() - tripStart.getTime()) / (24 * 60 * 60 * 1000));
  const dayNum = Math.min(dayIdx + 1, 6);
  const label = dayLabels[dayNum - 1] || "";

  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-4 py-1.5 text-xs font-semibold text-rose-200 backdrop-blur-sm anim-breathe">
      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
      Day {dayNum} · {label}
    </div>
  );
}
