import type { Metadata, Viewport } from "next";
import {
  Geist, Geist_Mono, Playfair_Display,
  Pacifico, Dancing_Script, Caveat, Satisfy, Lobster, Bangers, Carlito, Tinos,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AppBootstrap from "@/components/pwa/AppBootstrap";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { RevealProvider } from "@/lib/reveal-context";
import StructuredData from "@/components/trip/StructuredData";

// ── Base UI fonts (pre-existing) ────────────────────────────────────────
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// ── Narrative fonts — each serves a specific storytelling purpose ───────
// Loaded via next/font/google so they're self-hosted (no Google CDN request),
// preloaded, and tree-shaken to only the weights actually used.

// Pacifico — beachy cursive for "J & Dee" in the 3D reveal
const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Dancing Script — elegant handwriting for "are getting engaged!" subtitle
const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Caveat — casual journal hand for personal notes and quotes
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Satisfy — calligraphy for proposal headlines
const satisfy = Satisfy({
  variable: "--font-satisfy",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Lobster — bold vintage for section headlines
const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Bangers — comic bold for celebration moments
const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Carlito — friendly rounded sans for body text (Calibri-metric-compatible)
const carlito = Carlito({
  variable: "--font-carlito",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Tinos — editorial serif for long-form descriptions (Times-metric-compatible)
const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// JetBrains Mono — monospace for countdown numbers (DejaVu Mono equivalent)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-dejavu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const allFontVariables = [
  geistSans.variable,
  geistMono.variable,
  playfair.variable,
  pacifico.variable,
  dancingScript.variable,
  caveat.variable,
  satisfy.variable,
  lobster.variable,
  bangers.variable,
  carlito.variable,
  tinos.variable,
  jetbrainsMono.variable,
].join(" ");

export const metadata: Metadata = {
  // #1 CRITICAL FIX: metadataBase must be set so og:image / twitter:image
  // resolve to the production URL instead of localhost:3000
  metadataBase: new URL("https://w1jq650c98f0-d.space-z.ai"),
  title: "J & Dee — The Wilderness Romance | #JAndDeeSayIDo",
  description:
    "J & Dee have an exciting moment to share! Follow their 6-day New Hampshire wilderness adventure — something special happens Friday Aug 7 @ 7:30 PM. #JAndDeeSayIDo",
  keywords: [
    "JAndDeeSayIDo",
    "J and Dee",
    "New Hampshire",
    "road trip",
    "proposal",
    "Dixville Notch",
    "Bear Brook",
    "Pawtuckaway",
    "Coleman State Park",
    "White Mountains",
    "wilderness",
    "travel guide",
    "Old Man of the Mountain",
    "Flume Gorge",
  ],
  authors: [{ name: "Wilderness Romance" }],
  // #8 FIX: Use W3C-standard filename. Next.js auto-generates <link rel="manifest">
  // from this — the manual <link> in <head> was removed to avoid duplicates.
  manifest: "/manifest.webmanifest",
  applicationName: "Wilderness Romance",
  appleWebApp: {
    capable: true,
    title: "Wilderness Romance",
    statusBarStyle: "black-translucent",
  },
  // #9 FIX: Next.js auto-generates <link rel="apple-touch-icon"> from this.
  // The manual <link> without sizes in <head> was removed.
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icons/icon-192.png"],
  },
  openGraph: {
    title: "J & Dee — The Wilderness Romance | #JAndDeeSayIDo",
    description: "J & Dee have an exciting moment to share! Follow their 6-day New Hampshire wilderness adventure — something special happens Friday Aug 7 @ 7:30 PM. #JAndDeeSayIDo",
    type: "website",
    siteName: "J & Dee — Wilderness Romance",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "J & Dee — The Wilderness Romance | #JAndDeeSayIDo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "J & Dee — The Wilderness Romance | #JAndDeeSayIDo",
    description: "J & Dee have an exciting moment to share! #JAndDeeSayIDo",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#022c22",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS PWA: full-screen capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Wilderness Romance" />
        {/* #8/#9 FIX: manifest, apple-touch-icon, and favicon <link> tags are
            auto-generated by Next.js from the `metadata` export above.
            Do NOT add manual <link> tags here — they create duplicates. */}
        {/* Canonical URL for SEO */}
        <link rel="canonical" href="https://w1jq650c98f0-d.space-z.ai/" />
        {/* G-09: JSON-LD structured data for SEO */}
        <StructuredData />
        {/* Suppress known third-party deprecation warnings (THREE.Clock,
            THREE.PCFSoftShadowMap) before any JS module loads. These are
            upstream issues in Three.js r183+ / R3F that we can't fix
            without forking. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof console==='undefined')return;var w=console.warn;var s=['Clock: This module has been deprecated','PCFSoftShadowMap has been deprecated'];console.warn=function(){var a=arguments[0];if(typeof a==='string'&&s.some(function(x){return a.indexOf(x)>=0}))return;return w.apply(console,arguments)};})();`,
          }}
        />
      </head>
      <body
        className={`${allFontVariables} antialiased bg-background text-foreground`}
      >
        {/* G-01: Skip-to-content link — keyboard users bypass the app bar */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-rust-bark focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-rust-cream focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-rust-brass"
        >
          Skip to content
        </a>
        {/* RevealProvider wraps ALL clients (page content + InstallPrompt)
            so they can read the engagement reveal state. */}
        <RevealProvider>
          {children}
          <Toaster />
          {/* AppBootstrap runs FIRST — clears stale SW caches / sessionStorage
              on version change, then ServiceWorkerRegister re-registers fresh. */}
          <AppBootstrap />
          <ServiceWorkerRegister />
          <InstallPrompt />
        </RevealProvider>
      </body>
    </html>
  );
}
