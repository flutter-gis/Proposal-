"use client";

/**
 * MusicPlayer.tsx — REVAMPED with continuous playback
 *
 * Features:
 *   - Loop mode (sequential, wraps to start)
 *   - Shuffle mode (random order)
 *   - Repeat-one mode (same track)
 *   - Gapless playback (50ms overlap between loops)
 *   - Auto-advance to next track when current finishes
 *   - Track list with selection
 *   - Volume control
 *
 * The engine handles all the scheduling — this component just reflects
 * the state and sends commands.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Music, Volume2, VolumeX, SkipForward, SkipBack, ChevronUp, ChevronDown, Repeat, Repeat1, Shuffle } from "lucide-react";
import { getSoundEngine } from "@/lib/sound-engine";
import { COMPOSITIONS } from "@/lib/compositions";
import { usePreferences } from "@/lib/preferences-context";
import { useReveal } from "@/lib/reveal-context";
import AlbumArt from "./AlbumArt";
import { cn } from "@/lib/utils";

type PlayMode = "loop" | "shuffle" | "repeat-one";

export default function MusicPlayer() {
  const { palette } = usePreferences();
  const { revealed } = useReveal();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [showTrackList, setShowTrackList] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("loop");

  const engineRef = useRef(getSoundEngine());
  const currentTrack = COMPOSITIONS[trackIdx];

  // Set up the playlist and track-change callback on mount
  useEffect(() => {
    const engine = engineRef.current;
    engine.setPlaylist(COMPOSITIONS, 0);
    engine.setPlayMode("loop");
    engine.onTrackChanged((comp, idx) => {
      setTrackIdx(idx);
    });
    return () => engine.stop();
  }, []);

  // Update play mode on the engine when it changes
  useEffect(() => {
    engineRef.current.setPlayMode(playMode);
  }, [playMode]);

  const playTrack = useCallback(async (idx: number) => {
    engineRef.current.setPlaylist(COMPOSITIONS, idx);
    await engineRef.current.play(COMPOSITIONS[idx]);
    setPlaying(true);
  }, []);

  const togglePlay = useCallback(async () => {
    if (playing) {
      engineRef.current.stop();
      setPlaying(false);
    } else {
      await playTrack(trackIdx);
    }
  }, [playing, trackIdx, playTrack]);

  const skipNext = useCallback(() => {
    const next = engineRef.current.nextTrack();
    if (next) {
      const idx = engineRef.current.currentIndex;
      setTrackIdx(idx);
      if (!playing) {
        // If not playing, just update the track display
      }
    }
  }, [playing]);

  const skipPrev = useCallback(() => {
    const prev = engineRef.current.prevTrack();
    if (prev) {
      const idx = engineRef.current.currentIndex;
      setTrackIdx(idx);
    }
  }, []);

  const selectTrack = useCallback((idx: number) => {
    setTrackIdx(idx);
    setShowTrackList(false);
    if (playing) {
      playTrack(idx);
    }
  }, [playing, playTrack]);

  const cyclePlayMode = useCallback(() => {
    setPlayMode(prev => {
      if (prev === "loop") return "shuffle";
      if (prev === "shuffle") return "repeat-one";
      return "loop";
    });
  }, []);

  if (!revealed) return null;

  const playModeIcon = playMode === "loop" ? <Repeat className="w-3.5 h-3.5" /> :
                       playMode === "shuffle" ? <Shuffle className="w-3.5 h-3.5" /> :
                       <Repeat1 className="w-3.5 h-3.5" />;

  const playModeColor = playMode === "loop" ? palette.brass :
                        playMode === "shuffle" ? "#a78bfa" :
                        "#fbbf24";

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
            {COMPOSITIONS.length} Tracks · Continuous Playback
          </div>
          {COMPOSITIONS.map((track, i) => (
            <button
              key={track.id}
              onClick={() => selectTrack(i)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-xs transition-colors tap-feedback border-b flex items-center gap-2",
                i === trackIdx ? "font-semibold" : "hover:bg-white/5"
              )}
              style={{
                color: i === trackIdx ? palette.brass : "rgba(255,255,255,0.65)",
                backgroundColor: i === trackIdx ? "rgba(255,255,255,0.05)" : "transparent",
                borderColor: `${palette.primary}15`,
              }}
            >
              <AlbumArt trackId={track.id} title={track.title} description={track.description} bpm={track.bpm} size={36} />
              <div className="flex-1 min-w-0">
                <div className="truncate">{track.title}</div>
                <div className="text-[9px] opacity-50 mt-0.5">{track.description}</div>
              </div>
              {i === trackIdx && playing && (
                <span className="flex items-end gap-0.5 h-3 ml-2 flex-shrink-0">
                  {[40, 80, 60, 90].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full animate-eq-bar"
                      style={{ height: `${h}%`, backgroundColor: palette.brass, animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main player bar */}
      <div
        className="flex items-center gap-1 rounded-full backdrop-blur-sm border shadow-lg transition-all"
        style={{
          backgroundColor: "rgba(10, 10, 15, 0.88)",
          borderColor: `${palette.primary}30`,
          padding: playing ? "0.5rem 0.75rem" : "0.375rem 0.625rem",
        }}
      >
        {/* Prev — only when playing */}
        {playing && (
          <button
            onClick={skipPrev}
            aria-label="Previous track"
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors tap-feedback"
          >
            <SkipBack className="w-3.5 h-3.5" style={{ color: palette.brass }} />
          </button>
        )}

        {/* Play/pause */}
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors tap-feedback"
        >
          {playing ? (
            <span className="flex items-end gap-0.5 h-4">
              {[40, 80, 60, 90].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full animate-eq-bar"
                  style={{ height: `${h}%`, backgroundColor: palette.brass, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          ) : (
            <Music className="w-4 h-4" style={{ color: palette.brass }} />
          )}
        </button>

        {/* Next — only when playing */}
        {playing && (
          <button
            onClick={skipNext}
            aria-label="Next track"
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors tap-feedback"
          >
            <SkipForward className="w-3.5 h-3.5" style={{ color: palette.brass }} />
          </button>
        )}

        {/* Play mode toggle */}
        {playing && (
          <button
            onClick={cyclePlayMode}
            aria-label={`Play mode: ${playMode}`}
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors tap-feedback"
            title={playMode === "loop" ? "Loop (sequential)" : playMode === "shuffle" ? "Shuffle" : "Repeat one"}
          >
            <div style={{ color: playModeColor }}>{playModeIcon}</div>
          </button>
        )}

        {/* Track info + expand */}
        <button
          onClick={() => setShowTrackList(s => !s)}
          className="flex items-center gap-1.5 ml-1 tap-feedback min-h-[44px] px-2"
        >
          <div className="text-left">
            <div className="text-[11px] font-semibold leading-tight" style={{ color: palette.brass }}>
              {currentTrack.title}
            </div>
            <div className="text-[8px] uppercase tracking-widest opacity-50" style={{ color: "rgba(255,255,255,0.5)" }}>
              {playing ? "Now Playing" : "Tap to play"}
            </div>
          </div>
          {showTrackList ? <ChevronDown className="w-3 h-3 opacity-50" /> : <ChevronUp className="w-3 h-3 opacity-50" />}
        </button>
      </div>

      {/* Volume slider — compact */}
      {playing && (
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm border" style={{ backgroundColor: "rgba(10, 10, 15, 0.85)", borderColor: `${palette.primary}25` }}>
          <button
            onClick={() => { setMuted(!muted); engineRef.current.setVolume(muted ? volume : 0); }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {muted || volume === 0 ? <VolumeX className="w-3 h-3 opacity-50" /> : <Volume2 className="w-3 h-3" style={{ color: palette.brass }} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              setMuted(false);
              engineRef.current.setVolume(v);
            }}
            className="w-16 h-1 accent-amber-500 cursor-pointer"
            style={{ accentColor: palette.brass }}
          />
        </div>
      )}
    </div>
  );
}
