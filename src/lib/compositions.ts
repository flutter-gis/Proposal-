/**
 * compositions.ts — COMPLETELY REWRITTEN
 *
 * 10 full compositions using the note-engine with proper song structure,
 * harmony, melody, bass, and dynamics. Each song has:
 *   - Verse/Chorus/Bridge structure
 *   - Chord progressions that create tension/resolution
 *   - Bass lines (root-fifth patterns)
 *   - Melody following chord tones + passing tones
 *   - Dynamic contrast between sections
 *   - Stepwise melodic motion (not random noise)
 */

import type { Composition } from "./sound-engine";
import { renderSong, type SongSpec } from "./note-engine";

// ═══════════════════════════════════════════════════════════════════════════
//  SONG DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const SONGS: SongSpec[] = [
  // 1. GOLDEN HOUR — E major, 68 BPM — warm, hopeful, romantic
  {
    id: "golden-hour",
    title: "Golden Hour",
    description: "Warm, hopeful, romantic",
    bpm: 68,
    key: "E",
    scale: "major",
    ambience: ["birds"],
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.4, melodyDensity: 0.4,
        melodyInstrument: "piano", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "maj7" }, { root: "B", quality: "sus4" },
          { root: "C#", quality: "min7" }, { root: "A", quality: "maj7" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.6, melodyDensity: 0.6,
        melodyInstrument: "piano", harmonyInstrument: "cello", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "maj7" }, { root: "B", quality: "sus4" },
          { root: "C#", quality: "min7" }, { root: "A", quality: "maj7" },
          { root: "E", quality: "maj7" }, { root: "B", quality: "sus4" },
          { root: "A", quality: "maj7" }, { root: "B", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.9, melodyDensity: 0.75,
        melodyInstrument: "piano", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "maj" }, { root: "B", quality: "maj" },
          { root: "C#", quality: "min" }, { root: "A", quality: "maj" },
          { root: "E", quality: "maj" }, { root: "B", quality: "maj" },
          { root: "A", quality: "maj" }, { root: "B", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.6, melodyDensity: 0.6,
        melodyInstrument: "piano", harmonyInstrument: "cello", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "maj7" }, { root: "B", quality: "sus4" },
          { root: "C#", quality: "min7" }, { root: "A", quality: "maj7" },
          { root: "E", quality: "maj7" }, { root: "B", quality: "sus4" },
          { root: "A", quality: "maj7" }, { root: "B", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.9, melodyDensity: 0.75,
        melodyInstrument: "piano", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "maj" }, { root: "B", quality: "maj" },
          { root: "C#", quality: "min" }, { root: "A", quality: "maj" },
          { root: "E", quality: "maj" }, { root: "B", quality: "maj" },
          { root: "A", quality: "maj" }, { root: "E", quality: "maj" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.3, melodyDensity: 0.3,
        melodyInstrument: "piano", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "maj7" }, { root: "A", quality: "maj7" },
          { root: "B", quality: "sus4" }, { root: "E", quality: "maj" },
        ],
      },
    ],
  },

  // 2. FIRST LIGHT — D major, 72 BPM — gentle awakening
  {
    id: "first-light",
    title: "First Light",
    description: "Gentle awakening",
    bpm: 72,
    key: "D",
    scale: "major",
    ambience: ["birds"],
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.3, melodyDensity: 0.3,
        melodyInstrument: "harp", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "D", quality: "maj7" }, { root: "A", quality: "maj7" },
          { root: "B", quality: "min7" }, { root: "G", quality: "maj7" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.55, melodyDensity: 0.55,
        melodyInstrument: "flute", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "B", quality: "min" }, { root: "G", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "A", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.85, melodyDensity: 0.7,
        melodyInstrument: "flute", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "B", quality: "min" }, { root: "G", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.55, melodyDensity: 0.55,
        melodyInstrument: "harp", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "B", quality: "min" }, { root: "G", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "A", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.85, melodyDensity: 0.7,
        melodyInstrument: "flute", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "B", quality: "min" }, { root: "G", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "A", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.25, melodyDensity: 0.25,
        melodyInstrument: "harp", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "D", quality: "maj7" }, { root: "G", quality: "maj7" },
          { root: "A", quality: "maj7" }, { root: "D", quality: "maj" },
        ],
      },
    ],
  },

  // 3. FOREST TRAIL — G major, 90 BPM — adventurous, walking pace
  {
    id: "forest-trail",
    title: "Forest Trail",
    description: "Adventurous, walking pace",
    bpm: 90,
    key: "G",
    scale: "major",
    ambience: ["birds", "wind"],
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.4, melodyDensity: 0.4,
        melodyInstrument: "guitar", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.65, melodyDensity: 0.65,
        melodyInstrument: "guitar", harmonyInstrument: "cello", bassInstrument: "bass",
        chords: [
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "D", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.9, melodyDensity: 0.75,
        melodyInstrument: "violin", harmonyInstrument: "guitar", bassInstrument: "bass",
        chords: [
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
        ],
      },
      {
        name: "bridge", bars: 4, dynamic: 0.5, melodyDensity: 0.45,
        melodyInstrument: "guitar", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.9, melodyDensity: 0.75,
        melodyInstrument: "violin", harmonyInstrument: "guitar", bassInstrument: "bass",
        chords: [
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.3, melodyDensity: 0.3,
        melodyInstrument: "guitar", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "G", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "G", quality: "maj" },
        ],
      },
    ],
  },

  // 4. MOUNTAIN ECHO — A minor, 60 BPM — vast, spacious
  {
    id: "mountain-echo",
    title: "Mountain Echo",
    description: "Vast, spacious",
    bpm: 60,
    key: "A",
    scale: "minor",
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.35, melodyDensity: 0.3,
        melodyInstrument: "organ", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.55, melodyDensity: 0.5,
        melodyInstrument: "organ", harmonyInstrument: "choir", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "E", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.85, melodyDensity: 0.7,
        melodyInstrument: "trumpet", harmonyInstrument: "organ", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "A", quality: "min" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.55, melodyDensity: 0.5,
        melodyInstrument: "organ", harmonyInstrument: "choir", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "E", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.85, melodyDensity: 0.7,
        melodyInstrument: "trumpet", harmonyInstrument: "organ", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "A", quality: "min" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.25, melodyDensity: 0.2,
        melodyInstrument: "organ", harmonyInstrument: "choir", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "A", quality: "min" },
        ],
      },
    ],
  },

  // 5. THE QUESTION — C major, 65 BPM — intimate, emotional
  {
    id: "the-question",
    title: "The Question",
    description: "Intimate, emotional",
    bpm: 65,
    key: "C",
    scale: "major",
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.3, melodyDensity: 0.3,
        melodyInstrument: "piano", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj7" }, { root: "G", quality: "maj7" },
          { root: "A", quality: "min7" }, { root: "F", quality: "maj7" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.5, melodyDensity: 0.5,
        melodyInstrument: "piano", harmonyInstrument: "cello", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "G", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.85, melodyDensity: 0.7,
        melodyInstrument: "piano", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "bridge", bars: 4, dynamic: 0.4, melodyDensity: 0.4,
        melodyInstrument: "cello", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.9, melodyDensity: 0.75,
        melodyInstrument: "piano", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.2, melodyDensity: 0.2,
        melodyInstrument: "piano", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj7" }, { root: "F", quality: "maj7" },
          { root: "G", quality: "maj7" }, { root: "C", quality: "maj" },
        ],
      },
    ],
  },

  // 6. STARLIT PATH — E minor, 70 BPM — dreamy, ethereal
  {
    id: "starlit-path",
    title: "Starlit Path",
    description: "Dreamy, ethereal",
    bpm: 70,
    key: "E",
    scale: "minor",
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.3, melodyDensity: 0.3,
        melodyInstrument: "celesta", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.5, melodyDensity: 0.5,
        melodyInstrument: "celesta", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "B", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.8, melodyDensity: 0.7,
        melodyInstrument: "celesta", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "E", quality: "min" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.5, melodyDensity: 0.5,
        melodyInstrument: "celesta", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "B", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.8, melodyDensity: 0.7,
        melodyInstrument: "celesta", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "D", quality: "maj" },
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "E", quality: "min" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.2, melodyDensity: 0.2,
        melodyInstrument: "celesta", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "E", quality: "min" }, { root: "C", quality: "maj" },
          { root: "D", quality: "maj" }, { root: "E", quality: "min" },
        ],
      },
    ],
  },

  // 7. SUNRISE PROMISE — C major, 75 BPM — bright, hopeful
  {
    id: "sunrise-promise",
    title: "Sunrise Promise",
    description: "Bright, hopeful",
    bpm: 75,
    key: "C",
    scale: "major",
    ambience: ["birds"],
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.35, melodyDensity: 0.35,
        melodyInstrument: "flute", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.6, melodyDensity: 0.6,
        melodyInstrument: "flute", harmonyInstrument: "harp", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "G", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.88, melodyDensity: 0.72,
        melodyInstrument: "flute", harmonyInstrument: "violin", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.88, melodyDensity: 0.72,
        melodyInstrument: "violin", harmonyInstrument: "harp", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.25, melodyDensity: 0.25,
        melodyInstrument: "flute", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "F", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
    ],
  },

  // 8. SUNSET VOW — F major, 68 BPM — warm, golden, ceremonial
  {
    id: "sunset-vow",
    title: "Sunset Vow",
    description: "Warm, golden, ceremonial",
    bpm: 68,
    key: "F",
    scale: "major",
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.35, melodyDensity: 0.35,
        melodyInstrument: "trumpet", harmonyInstrument: "organ", bassInstrument: "bass",
        chords: [
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "D", quality: "min" }, { root: "Bb", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.55, melodyDensity: 0.55,
        melodyInstrument: "cello", harmonyInstrument: "organ", bassInstrument: "bass",
        chords: [
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "D", quality: "min" }, { root: "Bb", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "Bb", quality: "maj" }, { root: "C", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.88, melodyDensity: 0.72,
        melodyInstrument: "trumpet", harmonyInstrument: "cello", bassInstrument: "bass",
        chords: [
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "D", quality: "min" }, { root: "Bb", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "Bb", quality: "maj" }, { root: "F", quality: "maj" },
        ],
      },
      {
        name: "bridge", bars: 4, dynamic: 0.45, melodyDensity: 0.45,
        melodyInstrument: "cello", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "D", quality: "min" }, { root: "Bb", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "F", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.9, melodyDensity: 0.75,
        melodyInstrument: "trumpet", harmonyInstrument: "cello", bassInstrument: "bass",
        chords: [
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "D", quality: "min" }, { root: "Bb", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "Bb", quality: "maj" }, { root: "F", quality: "maj" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.2, melodyDensity: 0.2,
        melodyInstrument: "trumpet", harmonyInstrument: "organ", bassInstrument: "bass",
        chords: [
          { root: "F", quality: "maj" }, { root: "Bb", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "F", quality: "maj" },
        ],
      },
    ],
  },

  // 9. CELEBRATION — C major, 120 BPM — joyful, energetic
  {
    id: "celebration",
    title: "Celebration",
    description: "Joyful, energetic",
    bpm: 120,
    key: "C",
    scale: "pentatonic",
    ambience: ["guitar"],
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.5, melodyDensity: 0.5,
        melodyInstrument: "glockenspiel", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.7, melodyDensity: 0.7,
        melodyInstrument: "guitar", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "G", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.95, melodyDensity: 0.8,
        melodyInstrument: "violin", harmonyInstrument: "guitar", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.7, melodyDensity: 0.7,
        melodyInstrument: "guitar", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "G", quality: "dom7" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.95, melodyDensity: 0.8,
        melodyInstrument: "violin", harmonyInstrument: "guitar", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "G", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.4, melodyDensity: 0.4,
        melodyInstrument: "glockenspiel", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "C", quality: "maj" }, { root: "F", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
    ],
  },

  // 10. SERENITY — A minor, 60 BPM — peaceful, contemplative
  {
    id: "serenity",
    title: "Serenity",
    description: "Peaceful, contemplative",
    bpm: 60,
    key: "A",
    scale: "minor",
    ambience: ["crickets", "campfire"],
    sections: [
      {
        name: "intro", bars: 4, dynamic: 0.25, melodyDensity: 0.25,
        melodyInstrument: "piano", harmonyInstrument: "choir", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "E", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
        ],
      },
      {
        name: "verse", bars: 8, dynamic: 0.45, melodyDensity: 0.45,
        melodyInstrument: "piano", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "E", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "A", quality: "min" }, { root: "E", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "E", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.7, melodyDensity: 0.6,
        melodyInstrument: "piano", harmonyInstrument: "choir", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "E", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "A", quality: "min" }, { root: "E", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "A", quality: "min" },
        ],
      },
      {
        name: "bridge", bars: 4, dynamic: 0.35, melodyDensity: 0.35,
        melodyInstrument: "choir", harmonyInstrument: "pad", bassInstrument: "bass",
        chords: [
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "G", quality: "maj" }, { root: "E", quality: "maj" },
        ],
      },
      {
        name: "chorus", bars: 8, dynamic: 0.7, melodyDensity: 0.6,
        melodyInstrument: "piano", harmonyInstrument: "choir", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "E", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "C", quality: "maj" },
          { root: "A", quality: "min" }, { root: "E", quality: "maj" },
          { root: "F", quality: "maj" }, { root: "A", quality: "min" },
        ],
      },
      {
        name: "outro", bars: 4, dynamic: 0.15, melodyDensity: 0.15,
        melodyInstrument: "piano", harmonyInstrument: "choir", bassInstrument: "bass",
        chords: [
          { root: "A", quality: "min" }, { root: "F", quality: "maj" },
          { root: "C", quality: "maj" }, { root: "A", quality: "min" },
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER ALL COMPOSITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const COMPOSITIONS: Composition[] = SONGS.map(spec => renderSong(spec));

export function getComposition(id: string): Composition | undefined {
  return COMPOSITIONS.find(c => c.id === id);
}

// Export the specs for AlbumArt
export { SONGS as SONG_SPECS };
