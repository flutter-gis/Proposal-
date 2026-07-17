"use client";

import { Card } from "@/components/ui/card";
import { IMAGES } from "@/lib/images";
import { LazyImage } from "@/lib/use-lazy-image";
import { Camera } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  bear_brook_real: "Bear Brook State Park",
  pawtuckaway: "Pawtuckaway State Park",
  granite_railway_real: "Granite State Scenic Railway",
  dixville: "Dixville Notch Proposal Site",
  table_rock: "Table Rock Cliffs",
  coleman: "Coleman State Park",
  moose: "Moose Alley Wildlife",
  bakery: "Le Rendez-Vous Bakery",
  huntington_cascade_real: "Huntington Cascades",
  flume: "Flume Gorge",
  mtwashington: "Mount Washington",
  campfire: "Campfire Evenings",
  stargazing: "Bortle Class 2 Stars",
  canoe: "Canoe Paddles",
  hiking: "Hiking Trails",
  cabin: "Wilderness Cabins",
  lower_falls: "Lower Falls Swimming Hole",
  balsams: "The Balsams Resort",
  sunset_lake: "Lake Sunsets",
  forest_pine: "Pine Forests",
  artists_bluff: "Artists Bluff Trail",
  echo_lake: "Echo Lake Beach",
  sabbaday_falls: "Sabbaday Falls",
  rocky_gorge: "Rocky Gorge",
  profile_lake: "Profile Lake",
  benson_park: "Benson Park",
  old_man_mountain: "Old Man of the Mountain",
  the_basin: "The Basin",
  connecticut_lakes: "Connecticut Lakes",
  kancamagus_highway: "Kancamagus Highway",
  ring_full: "The Ring — Full View",
  ring_macro: "The Ring — Close-Up",
};

export default function PhotoGallery() {
  const [active, setActive] = useState<string>("dixville");
  const activeEntry = IMAGES[active];

  // Get a flat list of images from active entry
  const images = activeEntry?.urls || [];

  return (
    <section
      id="gallery"
      className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-slate-900 to-emerald-950 text-white"
    >
      <div className="mx-auto px-3 sm:px-4 md:px-6" style={{ maxWidth: "100%" }}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Camera className="w-3 h-3" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              Visual Tour
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-3">
            Destination Photo Gallery
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto">
            Browse {Object.keys(IMAGES).length} themed categories of imagery from
            across the trip route. Click any category to view real photos from each
            location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 sm:gap-6">
          {/* Category list */}
          <div className="space-y-1.5 max-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {Object.entries(IMAGES).map(([key, entry]) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={cn(
                  "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all border",
                  active === key
                    ? "bg-white/15 border-amber-400 backdrop-blur-sm shadow-lg"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-white/10">
                  {entry.urls[0] && (
                    <LazyImage
                      src={entry.urls[0]}
                      alt={`${SECTION_LABELS[key] || key} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {SECTION_LABELS[key] || key}
                  </div>
                  <div className="text-xs text-slate-400">
                    {entry.urls.length} photo{entry.urls.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active gallery */}
          <div>
            <div key={active}>
              <Card className="overflow-hidden bg-black/40 backdrop-blur-sm border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">
                      {SECTION_LABELS[active] || active}
                    </div>
                    <div className="text-xs text-slate-400">
                      {activeEntry?.alt}
                    </div>
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                    {images.length} photos
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 p-1">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className={cn(
                        "relative overflow-hidden bg-white/5",
                        i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-[2/2]" : "aspect-square"
                      )}
                    >
                      <LazyImage
                        src={url}
                        alt={`${activeEntry?.alt} ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 left-2 text-xs text-white/80 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                        #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-amber-300">
                  {Object.keys(IMAGES).length}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400">
                  Categories
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-amber-300">
                  {Object.values(IMAGES).reduce((s, e) => s + e.urls.length, 0)}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400">
                  Total Photos
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-amber-300">484</div>
                <div className="text-xs uppercase tracking-wider text-slate-400">
                  Miles Mapped
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.6);
        }
      `}</style>
    </section>
  );
}
