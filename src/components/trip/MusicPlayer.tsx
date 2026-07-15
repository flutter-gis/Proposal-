"use client";

/**
 * MusicPlayer.tsx — Refined
 *
 * Floating music player with 10 tracks.
 * Uses consistent dark glassmorphism that works across all themes.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Music, Volume2, VolumeX, SkipForward, SkipBack, ChevronUp, ChevronDown } from "lucide-react";
import { getSoundEngine } from "@/lib/sound-engine";
import { COMPOSITIONS } from "@/lib/compositions";
import { usePreferences } from "@/lib/preferences-context";
import { useReveal } from "@/lib/reveal-context";
import { cn } from "@/lib/utils";

export default function MusicPlayer() {
  const { palette } = usePreferences();
  const { revealed } = useReveal();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [showTrackList, setShowTrackList] = useState(false);

  const engineRef = useRef(getSoundEngine());
  const currentTrack = COMPOSITIONS[trackIdx];

  // `revealed` comes from RevealContext — no more DOM polling.
  // The music player shows only after the engagement reveal completes.

  const playTrack = useCallback(async (idx: number) => {
    await engineRef.current.play(COMPOSITIONS[idx]);
    setPlaying(true);
  }, []);

  const togglePlay = useCallback(async () => {
    if (playing) { engineRef.current.stop(); setPlaying(false); }
    else { await playTrack(trackIdx); }
  }, [playing, trackIdx, playTrack]);

  const skipNext = useCallback(() => {
    const next = (trackIdx + 1) % COMPOSITIONS.length;
    setTrackIdx(next);
    if (playing) playTrack(next);
  }, [trackIdx, playing, playTrack]);

  const skipPrev = useCallback(() => {
    const prev = (trackIdx - 1 + COMPOSITIONS.length) % COMPOSITIONS.length;
    setTrackIdx(prev);
    if (playing) playTrack(prev);
  }, [trackIdx, playing, playTrack]);

  const selectTrack = useCallback((idx: number) => {
    setTrackIdx(idx);
    setShowTrackList(false);
    if (playing) playTrack(idx);
  }, [playing, playTrack]);

  useEffect(() => { return () => engineRef.current.stop(); }, []);

  if (!revealed) return null;

  return (
    <div className="fixed bottom-32 right-4 z-[95] flex flex-col items-end gap-2">
      {/* Track list dropdown */}
      {showTrackList && (
        <div
          className="w-64 max-h-64 overflow-y-auto rounded-2xl backdrop-blur-md border shadow-2xl no-scrollbar"
          style={{
            backgroundColor: "rgba(10, 10, 15, 0.92)",
            borderColor: `${palette.primary}40`,
          }}
        >
          <div
            className="sticky top-0 px-3 py-2 text-[10px] uppercase tracking-widest font-semibold border-b"
            style={{
              backgroundColor: "rgba(10, 10, 15, 0.95)",
              color: palette.brass,
              borderColor: `${palette.primary}30`,
            }}
          >
            10 Tracks · 20 Instruments
          </div>
          {COMPOSITIONS.map((track, i) => (
            <button
              key={track.id}
              onClick={() => selectTrack(i)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-xs transition-colors tap-feedback border-b",
                i === trackIdx ? "font-semibold" : "hover:bg-white/5"
              )}
              style={{
                color: i === trackIdx ? palette.brass : "rgba(255,255,255,0.65)",
                backgroundColor: i === trackIdx ? `${palette.primary}20` : "transparent",
                borderColor: "rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate">{i + 1}. {track.title}</div>
                  <div className="text-[9px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{track.description}</div>
                </div>
                {i === trackIdx && playing && (
                  <span className="flex items-end gap-0.5 h-3 ml-2 flex-shrink-0">
                    <span className="w-0.5 animate-eq-bar" style={{ height: "40%", backgroundColor: palette.brass }} />
                    <span className="w-0.5 animate-eq-bar" style={{ height: "80%", animationDelay: "150ms", backgroundColor: palette.brass }} />
                    <span className="w-0.5 animate-eq-bar" style={{ height: "60%", animationDelay: "300ms", backgroundColor: palette.brass }} />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Volume slider (visible when playing) */}
      {playing && (
        <div
          className="flex items-center gap-2 rounded-full backdrop-blur-sm border px-3 py-2"
          style={{ backgroundColor: "rgba(10, 10, 15, 0.88)", borderColor: `${palette.primary}40` }}
        >
          <button
            onClick={() => {
              if (muted) { engineRef.current.setVolume(volume); setMuted(false); }
              else { engineRef.current.setVolume(0); setMuted(true); }
            }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="transition-colors"
            style={{ color: muted ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)" }}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range" min="0" max="1" step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v); setMuted(v === 0);
              engineRef.current.setVolume(v);
            }}
            className="w-20 h-1 cursor-pointer"
            style={{ accentColor: palette.brass }}
            aria-label="Volume"
          />
        </div>
      )}

      {/* Controls bar — compact when not playing */}
      <div
        className={cn(
          "flex items-center gap-1 rounded-full backdrop-blur-sm border shadow-lg transition-all",
          playing ? "pl-2 pr-3 py-2" : "p-1.5"
        )}
        style={{
          backgroundColor: "rgba(10, 10, 15, 0.88)",
          borderColor: `${palette.primary}50`,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {/* Prev — only when playing */}
        {playing && (
          <button onClick={skipPrev} aria-label="Previous track" className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors tap-feedback">
            <SkipBack className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Play/pause */}
        <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors tap-feedback">
          {playing ? (
            <span className="flex items-end gap-0.5 h-4">
              {[40, 80, 60, 90].map((h, i) => (
                <span
                  key={i}
                  className="w-0.5 animate-eq-bar"
                  style={{ height: `${h}%`, animationDelay: `${i * 150}ms`, backgroundColor: palette.brass }}
                />
              ))}
            </span>
          ) : (
            <Music className="w-4 h-4" style={{ color: palette.brass }} />
          )}
        </button>

        {/* Next — only when playing */}
        {playing && (
          <button onClick={skipNext} aria-label="Next track" className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors tap-feedback">
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Track name + expand — only when playing */}
        {playing && (
          <button onClick={() => setShowTrackList(s => !s)} className="flex items-center gap-1.5 ml-1 tap-feedback">
            <span className="text-xs font-semibold whitespace-nowrap max-w-[100px] truncate" style={{ color: palette.brass }}>
              {currentTrack.title}
            </span>
            {showTrackList ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
