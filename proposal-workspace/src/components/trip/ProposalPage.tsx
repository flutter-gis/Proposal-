"use client";

/**
 * ProposalPage.tsx
 *
 * Hero for the Proposal slide:
 *   - Aug 7, 7:30 PM, 1000ft cliff, Lake Gloriette
 *   - 4 key facts
 *   - "Why This Spot?"
 *   - 3-step staging timeline (Setup → Photo team → Proposal)
 *   - Weather & Light card
 *   - Plan After card
 *   - Rotating proposal quotes
 *   - Ring engraving + confetti celebrate button
 */

import { memo, useState, useEffect } from "react";
import { TRIP_STATS } from "@/lib/trip-data";
import { haptics } from "@/lib/haptics";
import { useToast } from "@/hooks/use-toast";
import { FlyIn, FlyInStagger, FlyInItem } from "./FlyIn";
import QuoteCallout from "./QuoteCallout";
import { Sparkles, Heart, Share2, CalendarPlus } from "lucide-react";

const FACTS = [
  { icon: "📅", label: "Date", value: "Friday, Aug 7 2026" },
  { icon: "🌗", label: "Time", value: "7:30 PM ET" },
  { icon: "⛰️", label: "Cliff", value: "1,000 ft granite" },
  { icon: "🪞", label: "Reflection", value: "Lake Gloriette mirror" },
];

const STAGING = [
  {
    time: "5:30 PM",
    title: "Landscape Painting Setup",
    text: "Arrive at the Lake Gloriette pull-off. Set up travel easels on the flat grassy edge between car and water — the cover story is a sunset landscape painting date.",
    icon: "🎨",
  },
  {
    time: "7:00 PM",
    title: "Photo Team In Position",
    text: "Photographer team parks 0.2 mi east at the Table Rock trailhead lot, then walks the brush line to set up telephoto lenses hidden from view.",
    icon: "📷",
  },
  {
    time: "7:30 PM",
    title: "💍 The Proposal",
    text: "Drop to one knee as the setting sun turns the 1,000-ft vertical granite face pink and orange across the mirror-calm lake. The question will be asked.",
    icon: "💍",
  },
];

const PLAN_AFTER = [
  { time: "8:00 PM", label: "Drive north 12 mi to Coleman State Park Perch Cabin" },
  { time: "9:00 PM", label: "Engagement celebration dinner under the pines" },
  { time: "11:00 PM", label: "Milky Way viewing — Bortle Class 2 dark sky" },
  { time: "2:00 AM", label: "Optional midnight celebratory pond swim" },
];

function fireCelebration() {
  // Haptic: flourish pattern — three pulses matching the confetti burst
  haptics.flourish();
  // CSS-only confetti via DOM — no external dependency
  if (typeof document === "undefined") return;
  const colors = ["#b8860b", "#d4a017", "#b8541f", "#7a2418", "#faf3e3"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[i % colors.length]};left:50%;top:60%;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};pointer-events:none;z-index:9999;transition:all 1.5s cubic-bezier(0.1,0.5,0.3,1);opacity:1;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.5;
      const dist = 150 + Math.random() * 200;
      el.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 100}px) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 1600);
  }
}

// Design H: Generate .ics calendar file for the proposal moment
function downloadCalendarEvent() {
  // Aug 7, 2026 7:30 PM EDT = 23:30 UTC
  const start = "20260807T233000Z";
  // 30-minute event
  const end = "20260807T240000Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wilderness Romance//Proposal//EN",
    "BEGIN:VEVENT",
    "UID:proposal-8-7-2026@wilderness-romance.app",
    "DTSTAMP:20260801T000000Z",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "SUMMARY:💍 The Proposal 💍",
    "DESCRIPTION:🏔️ One knee at the cliff's edge 💍 at Lake Gloriette, Dixville Notch. The 1,000-ft granite face of Table Rock turns pink and orange at golden hour as the sun sets over the lake.",
    "LOCATION:Lake Gloriette, Dixville Notch, NH",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:The proposal is in 1 hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wilderness-romance-proposal.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ProposalPageImpl() {
  const [paused, setPaused] = useState(false);
  const { toast } = useToast();
  return (
    <section className="relative px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      {/* #4 FIX: Visually-hidden H1 for SEO + screen readers */}
      <h1 className="sr-only">💍 The Proposal — Lake Gloriette, Dixville Notch</h1>
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <FlyIn className="relative overflow-hidden rounded-3xl bark-card p-6 md:p-10 mb-8">
          <div
            aria-hidden
            className="absolute inset-0 opacity-70 anim-breathe"
            style={
              {
                background:
                  "radial-gradient(circle at 80% 100%, rgba(212,160,23,0.5), transparent 55%), radial-gradient(circle at 20% 0%, rgba(122,36,24,0.4), transparent 50%)",
                "--glow-color": "rgba(184,134,11,0.35)",
              } as React.CSSProperties
            }
          />
          <div className="relative z-10 text-center text-rust-cream">
            <div className="inline-flex items-center gap-2 rounded-full bg-rust-brass/20 px-3 py-1 text-[11px] uppercase tracking-widest text-rust-brass">
              <Sparkles className="w-3 h-3" /> 💍 The Proposal
            </div>
            <h2 className="mt-3 font-satisfy text-4xl sm:text-5xl md:text-7xl">
              🏔️ One knee at the cliff's edge 💍
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-rust-cream/80">
              Friday, August 7, 2026 · 7:30 PM Eastern · Lake Gloriette, Dixville
              Notch — where the 1,000-ft vertical granite face of Table Rock fills
              the horizon and the calm lake mirrors the sunset.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                onClick={fireCelebration}
                className="brass-button anim-glow-sweep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bangers tracking-wider text-lg tap-feedback"
              >
                <Heart className="w-4 h-4" /> 🎉 CELEBRATE THE MOMENT
              </button>
            </div>
          </div>
        </FlyIn>

        {/* 4 key facts */}
        <FlyInStagger className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {FACTS.map((f) => (
            <FlyInItem key={f.label}>
              <div className="leather-card parchment-texture anim-hover-lift rounded-2xl p-4 text-center">
                <div className="mb-1 text-2xl" aria-hidden>{f.icon}</div>
                <div className="font-serif text-base md:text-lg font-bold text-rust-bark">{f.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-rust-bark/60">{f.label}</div>
              </div>
            </FlyInItem>
          ))}
        </FlyInStagger>

        {/* P-03: Why this spot — first-person love letter */}
        <FlyIn className="leather-card parchment-texture rounded-3xl p-6 md:p-8 mb-8">
          <h3 className="font-lobster text-3xl text-rust-bark mb-3">
            💌 Why this spot?
          </h3>
          <p className="font-tinos text-base md:text-lg leading-relaxed text-rust-bark/80 italic">
            We chose Lake Gloriette because the mountain does the talking. Table
            Rock rises 1,000 feet straight out of the water — not a slope, a wall.
            At golden hour in early August, the setting sun will hit that granite
            face dead-on and the whole cliff will turn pink, then orange, then
            deep red, like it&apos;s burning from the inside. The lake is narrow
            there, so the water becomes a mirror — the cliff doubles, the sky
            triples, and we will stand on the grassy edge with the entire horizon
            filled with stone and light. We have scouted it online, read about the
            alignment, done the math on sunset times. On August 7, at 7:30 PM,
            the first pink will hit the rock, and no spreadsheet could have
            prepared us for that moment. It is the kind of place that makes you
            whisper. So we will whisper the question, and the mountain will hold
            its breath with us.
          </p>
        </FlyIn>

        {/* 3-step staging timeline */}
        <FlyIn className="mb-8">
          <h3 className="mb-4 text-center font-lobster text-3xl text-rust-bark">
            🎬 The Staging Timeline
          </h3>
          <ol className="relative space-y-4 pl-6 md:pl-8">
            <span aria-hidden className="absolute left-2 top-1 bottom-1 w-0.5 bg-gradient-to-b from-rust-brass via-rust-ember to-rust-wax" />
            {STAGING.map((s, i) => (
              <li key={s.time} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-4 md:-left-6 top-2 h-3.5 w-3.5 rounded-full bg-rust-brass ring-4 ring-rust-cream"
                />
                <div className="leather-card parchment-texture rounded-2xl p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden>{s.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-serif text-lg font-bold text-rust-bark">{s.title}</div>
                        <span className="rounded-full bg-rust-forest/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-rust-forest font-semibold">
                          {s.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-rust-bark/75 leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </FlyIn>

        {/* P-06: The plan after — as a story, not a bullet list */}
        <FlyIn className="mb-8">
          <div className="leather-card parchment-texture rounded-3xl p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rust-wax" />
              <h3 className="font-serif text-lg font-bold text-rust-bark">✨ The Afterglow</h3>
            </div>
            <div className="space-y-4">
              <div className="border-l-2 border-rust-brass/40 pl-4">
                <div className="text-[10px] uppercase tracking-widest text-rust-brass font-bold mb-1">8:00 PM</div>
                <p className="text-sm text-rust-bark/80 leading-relaxed">
                  We will drive north to Coleman in a daze, windows down, warm August air rushing in. The ring will feel impossibly light.
                </p>
              </div>
              <div className="border-l-2 border-rust-brass/40 pl-4">
                <div className="text-[10px] uppercase tracking-widest text-rust-brass font-bold mb-1">8:30 PM</div>
                <p className="text-sm text-rust-bark/80 leading-relaxed">
                  Perch Cabin will welcome us with porch lights strung above the pines. We will toast with artisan cider under the stars.
                </p>
              </div>
              <div className="border-l-2 border-rust-brass/40 pl-4">
                <div className="text-[10px] uppercase tracking-widest text-rust-brass font-bold mb-1">11:00 PM</div>
                <p className="text-sm text-rust-bark/80 leading-relaxed">
                  Under the Bortle Class 2 sky, the Milky Way will stretch from horizon to horizon. We will lie on the dock and not speak for twenty minutes.
                </p>
              </div>
              <div className="border-l-2 border-rust-wax/40 pl-4">
                <div className="text-[10px] uppercase tracking-widest text-rust-wax font-bold mb-1">2:00 AM</div>
                <p className="text-sm text-rust-bark/80 leading-relaxed">
                  A celebratory midnight swim in Little Diamond Pond. The water will be warmer than the air. We will laugh until we can&apos;t breathe.
                </p>
              </div>
            </div>
          </div>
        </FlyIn>

        {/* Rotating proposal quotes */}
        <FlyIn className="mb-8">
          <QuoteCallout theme="proposal" count={4} intervalMs={8000} seed="proposalpage" />
        </FlyIn>

        {/* Ring engraving + celebrate */}
        <FlyIn className="bark-card anim-breathe rounded-3xl p-6 md:p-8 text-center"
               style={{ "--glow-color": "rgba(184,134,11,0.3)" } as React.CSSProperties}>
          <div className="text-[10px] uppercase tracking-widest text-rust-brass">Ring Engraving</div>
          <div className="mt-2 font-caveat text-2xl sm:text-3xl md:text-4xl text-rust-cream">
            {TRIP_STATS.ringEngraving}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={fireCelebration}
              className="brass-button anim-glow-sweep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider tap-feedback"
            >
              <Sparkles className="w-4 h-4" /> 🎉 Celebrate
            </button>
            {/* P-04: The Pause */}
            <button
              onClick={() => setPaused(true)}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider bg-rust-wax/30 border border-rust-wax/50 text-rust-cream hover:bg-rust-wax/40 tap-feedback"
            >
              <Heart className="w-4 h-4" /> 🫧 Experience the moment
            </button>
            {/* P-07: Share proposal moment */}
            <button
              onClick={async () => {
                const url = typeof window !== "undefined" ? window.location.href : "";
                const shareData = {
                  title: "The Wilderness Romance — 💍 The Proposal",
                  text: "August 7, 2026 · 7:30 PM · Lake Gloriette, Dixville Notch\n8.7.26 | As One",
                  url,
                };
                if (typeof navigator !== "undefined" && navigator.share) {
                  try { await navigator.share(shareData); } catch {}
                } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                  try {
                    await navigator.clipboard.writeText(url);
                    toast({
                      title: "Link copied",
                      description: "Share it with family.",
                    });
                  } catch {}
                }
              }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-rust-cream hover:bg-white/15 tap-feedback"
            >
              <Share2 className="w-4 h-4" /> 📤 Share our moment
            </button>
            {/* Design H: Add to Calendar — generates .ics file */}
            <button
              onClick={downloadCalendarEvent}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wider bg-rust-forest/30 border border-rust-forest/50 text-rust-cream hover:bg-rust-forest/40 tap-feedback"
            >
              <CalendarPlus className="w-4 h-4" /> 📅 Add to calendar
            </button>
          </div>
        </FlyIn>
      </div>

      {/* P-04: The Pause overlay */}
      {paused && <ThePause onComplete={() => setPaused(false)} />}
    </section>
  );
}

const ProposalPage = memo(ProposalPageImpl);
export default ProposalPage;

// ── P-04: The Pause — a 7-second ceremonial moment ─────────────────────
function ThePause({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(7);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (count <= 0) {
      setDone(true);
      // Haptic: reveal pulse — a single long vibration marking the moment
      haptics.reveal();
      const t = setTimeout(onComplete, 3000);
      return () => clearTimeout(t);
    }
    // Haptic: heartbeat tick on every countdown second
    haptics.heartbeat();
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-rust-bark/95 backdrop-blur-md"
      onClick={done ? onComplete : undefined}
    >
      {done ? (
        <p className="font-satisfy text-3xl sm:text-4xl md:text-5xl text-rust-brass anim-fade-in-up">
          That was the moment.
        </p>
      ) : (
        <div className="text-center">
          <div
            className="font-dejavu-mono text-7xl sm:text-8xl md:text-9xl font-bold text-rust-ember anim-breathe tabular-nums"
            style={{ "--glow-color": "rgba(225,29,72,0.5)" } as React.CSSProperties}
            key={count}
          >
            00:00:0{count}
          </div>
          <p className="mt-4 text-sm uppercase tracking-widest text-rust-cream/50">
            Breathe.
          </p>
        </div>
      )}
    </div>
  );
}
