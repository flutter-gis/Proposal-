"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  DollarSign,
  Key,
  Sparkles,
  Lightbulb,
  Navigation,
  Accessibility,
  Mountain,
  Route,
  BookOpen,
} from "lucide-react";
import type { Place } from "@/lib/trip-data";
import { getImages } from "@/lib/images";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon as SvgIcon, CATEGORY_TO_ICON } from "@/components/icons/Icon";

const CATEGORY_LABEL: Record<string, string> = {
  stay: "Stay",
  hike: "Hike",
  water: "Water",
  scenic: "Scenic",
  wildlife: "Wildlife",
  historic: "Historic",
  dining: "Dining",
  railway: "Railway",
  proposal: "Proposal",
  stargaze: "Stargaze",
  nearby: "Nearby",
};

const CATEGORY_COLOR: Record<string, string> = {
  stay: "bg-teal-100 text-teal-800 border-teal-300",
  hike: "bg-green-100 text-green-800 border-green-300",
  water: "bg-blue-100 text-blue-800 border-blue-300",
  scenic: "bg-amber-100 text-amber-800 border-amber-300",
  wildlife: "bg-lime-100 text-lime-800 border-lime-300",
  historic: "bg-orange-100 text-orange-800 border-orange-300",
  dining: "bg-red-100 text-red-800 border-red-300",
  railway: "bg-stone-100 text-stone-800 border-stone-300",
  proposal: "bg-rose-100 text-rose-800 border-rose-300",
  stargaze: "bg-violet-100 text-violet-800 border-violet-300",
  nearby: "bg-slate-100 text-slate-800 border-slate-300",
};

// Fallback gradient if no image available
const FALLBACK_GRADIENTS = [
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-pink-700",
  "from-sky-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-lime-500 to-green-700",
];

export default function PlaceDetailDialog({
  place,
  open,
  onOpenChange,
}: {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);

  if (!place) return null;

  const images = getImages(place.imageKeys || []);
  const hasImages = images.length > 0;
  const fallbackGradient =
    FALLBACK_GRADIENTS[
      place.id.charCodeAt(0) % FALLBACK_GRADIENTS.length
    ];

  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${place.coords.lat},${place.coords.lng}`;
  const appleMapsLink = `https://maps.apple.com/?daddr=${place.coords.lat},${place.coords.lng}&dirflg=d`;
  const appleMapsViewLink = `https://maps.apple.com/?ll=${place.coords.lat},${place.coords.lng}&q=${encodeURIComponent(place.name)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{place.name}</DialogTitle>
          <DialogDescription>{place.description}</DialogDescription>
        </DialogHeader>

        {/* Image gallery */}
        <div className="relative h-64 md:h-80 bg-slate-200 overflow-hidden">
          {hasImages ? (
            <>
              <img
                src={images[activeImg]?.url}
                alt={images[activeImg]?.alt || place.name}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {/* Image selector */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                        activeImg === i
                          ? "border-white scale-110"
                          : "border-white/40 opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={img.url} alt={img.alt || `Photo ${i + 1} of ${place.name}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br flex items-center justify-center",
                fallbackGradient
              )}
            >
              <div className="text-center text-white flex flex-col items-center justify-center">
                <div className="mb-2 flex items-center justify-center" style={{ color: "white" }}>
                  <SvgIcon name={CATEGORY_TO_ICON[place.category] ?? "nearby"} size={48} animated />
                </div>
                <div className="text-sm opacity-80">Image loading…</div>
              </div>
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-0 text-xs",
                  CATEGORY_COLOR[place.category]
                )}
              >
                {CATEGORY_LABEL[place.category]}
              </Badge>
              {place.vibe && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                  {place.vibe.split(" ").slice(0, 4).join(" ")}…
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif drop-shadow-lg">
              {place.name}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick info bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {place.cost && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1">
                  <DollarSign className="w-3 h-3" />
                  Cost
                </div>
                <div className="font-semibold text-sm text-slate-800">
                  {place.cost}
                </div>
              </div>
            )}
            {place.checkIn && (
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                <div className="flex items-center gap-1.5 text-xs text-teal-700 mb-1">
                  <Clock className="w-3 h-3" />
                  Check-In
                </div>
                <div className="font-semibold text-sm text-slate-800">
                  {place.checkIn}
                </div>
              </div>
            )}
            {place.checkOut && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1">
                  <Clock className="w-3 h-3" />
                  Check-Out
                </div>
                <div className="font-semibold text-sm text-slate-800">
                  {place.checkOut}
                </div>
              </div>
            )}
            {place.bookingId && (
              <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                <div className="flex items-center gap-1.5 text-xs text-rose-700 mb-1">
                  <Key className="w-3 h-3" />
                  Booking ID
                </div>
                <div className="font-semibold text-sm text-slate-800 truncate">
                  {place.bookingId}
                </div>
              </div>
            )}
            {place.accessCode && (
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                <div className="flex items-center gap-1.5 text-xs text-violet-700 mb-1">
                  <Key className="w-3 h-3" />
                  Access Code
                </div>
                <div className="font-semibold text-sm text-slate-800">
                  {place.accessCode}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              About this stop
            </h3>
            <p className="text-slate-700 leading-relaxed">{place.description}</p>
          </div>

          {/* Effort & trail info — NEW for low-effort filter */}
          {(place.effort || place.trailDistance) && (
            <div className="flex flex-wrap gap-3">
              {place.effort && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 flex-1 min-w-[140px]">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-1">
                    {place.effort === "none" ? (
                      <Accessibility className="w-3 h-3" />
                    ) : place.effort === "easy" ? (
                      <Accessibility className="w-3 h-3" />
                    ) : (
                      <Mountain className="w-3 h-3" />
                    )}
                    Hiking Effort
                  </div>
                  <div className="font-semibold text-sm text-slate-800 capitalize">
                    {place.effort === "none"
                      ? "Zero hiking — flat & accessible"
                      : place.effort === "easy"
                      ? "Easy — short & flat"
                      : place.effort === "moderate"
                      ? "Moderate — short with elevation"
                      : "Strenuous — full hike"}
                  </div>
                </div>
              )}
              {place.trailDistance && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex-1 min-w-[140px]">
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1">
                    <Route className="w-3 h-3" />
                    Trail Distance
                  </div>
                  <div className="font-semibold text-sm text-slate-800">
                    {place.trailDistance}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Naturalist field-guide notes  */}
          {place.naturalistNotes && place.naturalistNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Field Naturalist Notes
              </h3>
              <div className="space-y-2">
                {place.naturalistNotes.map((note, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100"
                  >
                    <span className="text-emerald-600 font-bold mt-0.5">🌿</span>
                    <span className="text-sm text-slate-700 leading-relaxed">
                      {note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {place.highlights.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {place.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100"
                  >
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm text-slate-700">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {place.tips && place.tips.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Pro Tips
              </h3>
              <div className="space-y-2">
                {place.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/70 border border-amber-200"
                  >
                    <span className="text-amber-600 font-bold mt-0.5">💡</span>
                    <span className="text-sm text-slate-700 leading-relaxed">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates & address */}
          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {place.address && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </div>
                  <div className="font-medium text-slate-800">{place.address}</div>
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> Coordinates
                </div>
                <div className="font-mono font-medium text-slate-800">
                  {place.coords.lat.toFixed(4)}° N, {Math.abs(place.coords.lng).toFixed(4)}° W
                </div>
              </div>
            </div>
          </Card>

          {/* Action buttons — Apple Maps + Google Maps */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button asChild className="flex-1">
              <a href={appleMapsLink}>
                <Navigation className="w-4 h-4 mr-2" /> Directions in Apple Maps
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href={directionsLink} target="_blank" rel="noopener noreferrer">
                <MapPin className="w-4 h-4 mr-2" /> Google Maps
              </a>
            </Button>
          </div>

          {/* One-tap navigate — floating action button for mobile use */}
          <a
            href={directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-rust-forest text-rust-cream px-4 py-3 text-sm font-bold hover:bg-rust-forest/90 transition-colors tap-feedback min-h-[44px] mt-2"
          >
            <Navigation className="w-4 h-4" /> Navigate Here
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
