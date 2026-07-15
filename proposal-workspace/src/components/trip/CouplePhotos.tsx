"use client";

/**
 * CouplePhotos.tsx
 *
 * A warm, personal photo gallery using the 11 couple photos from
 * public/couple/. These are real photos from the relationship that
 * deserve a dedicated showcase — not buried in the generic destination
 * gallery.
 *
 * Features:
 *   - Masonry-style grid (CSS columns, no JS layout)
 *   - Click to open fullscreen lightbox
 *   - LazyImage for scroll-container-aware loading
 *   - Caption overlay on hover (photo number + heart icon)
 *   - Gender-neutral throughout
 *   - Pure CSS animations (no JS animation loops)
 */

import { useState, useCallback, useEffect } from "react";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { LazyImage } from "@/lib/use-lazy-image";
import { FlyIn } from "./FlyIn";

const PHOTOS = Array.from({ length: 11 }, (_, i) => ({
  src: `/couple/photo-${i + 1}.jpg`,
  alt: `A moment together — photo ${i + 1}`,
}));

export default function CouplePhotos() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const goPrev = useCallback(
    () => setLightboxIdx((i) => (i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length)),
    []
  );
  const goNext = useCallback(
    () => setLightboxIdx((i) => (i === null ? null : (i + 1) % PHOTOS.length)),
    []
  );

  // Keyboard nav for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, closeLightbox, goPrev, goNext]);

  return (
    <section className="px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <FlyIn className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rust-bark/80 px-3 py-1 text-[11px] uppercase tracking-widest text-rust-bg">
            <Heart className="w-3 h-3" /> 💕 Our Moments
          </div>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl md:text-5xl font-bold text-rust-bark">
            📸 The two of us, so far
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-rust-bark/70 leading-relaxed">
            Eleven moments from the journey that brought us here — from
            early adventures to the road that leads to the cliff. Tap any
            photo to see it full screen.
          </p>
        </FlyIn>

        {/* Masonry grid — CSS columns for natural varying heights */}
        <FlyIn>
          <div className="columns-2 sm:columns-3 md:columns-4 gap-3 [&>*]:mb-3">
            {PHOTOS.map((photo, i) => (
              <button
                key={i}
                onClick={() => setLightboxIdx(i)}
                className="relative block w-full overflow-hidden rounded-2xl tap-feedback group anim-hover-lift"
                aria-label={`Open photo ${i + 1} full screen`}
              >
                <LazyImage
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-auto object-cover"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-rust-bark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Heart badge */}
                <div className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-rust-cream/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="w-3.5 h-3.5 text-rust-wax" fill="currentColor" />
                </div>
              </button>
            ))}
          </div>
        </FlyIn>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-rust-bark/95 backdrop-blur-md anim-fade-in-up"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label="Close photo viewer"
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 border border-white/20 text-rust-cream flex items-center justify-center hover:bg-white/20 transition-colors tap-feedback"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-4 z-10 h-10 w-10 rounded-full bg-white/10 border border-white/20 text-rust-cream flex items-center justify-center hover:bg-white/20 transition-colors tap-feedback"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Image */}
          <img
            src={PHOTOS[lightboxIdx].src}
            alt={PHOTOS[lightboxIdx].alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next photo"
            className="absolute right-2 sm:right-4 z-10 h-10 w-10 rounded-full bg-white/10 border border-white/20 text-rust-cream flex items-center justify-center hover:bg-white/20 transition-colors tap-feedback"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-rust-cream text-xs font-semibold">
            {lightboxIdx + 1} / {PHOTOS.length}
          </div>
        </div>
      )}
    </section>
  );
}
