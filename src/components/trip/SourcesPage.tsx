"use client";

/**
 * SourcesPage.tsx
 *
 * Displays all sources cited in the attraction catalog in APA format.
 * Accessible from Settings → "Sources & Citations" button.
 */

import { FlyIn } from "./FlyIn";
import { SOURCES } from "@/lib/attraction-catalog";
import { BookOpen, ExternalLink } from "lucide-react";

export default function SourcesPage() {
  return (
    <FlyIn className="leather-card parchment-texture rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-rust-brass" />
        <h3 className="font-lobster text-2xl text-rust-bark">Sources & Citations</h3>
      </div>

      <p className="text-sm text-rust-bark/70 mb-4 font-tinos italic">
        All attraction data is sourced from official websites and trusted databases.
        Citations follow APA format. Click any source to visit the original website.
      </p>

      <div className="space-y-2">
        {SOURCES.map(source => (
          <div
            key={source.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-rust-cream/40 border border-rust-brass/15 hover:border-rust-brass/30 transition-colors"
          >
            <sup className="text-xs font-bold text-rust-brass mt-0.5">[{source.id}]</sup>
            <div className="flex-1">
              <p className="text-sm text-rust-bark/80 font-tinos leading-relaxed">
                {source.citation}
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs text-rust-brass hover:text-rust-ember hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {source.url.length > 60 ? source.url.substring(0, 60) + "..." : source.url}
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-rust-brass/20 text-xs text-rust-bark/50 text-center">
        {SOURCES.length} sources cited · Last updated {new Date().toLocaleDateString()}
      </div>
    </FlyIn>
  );
}
