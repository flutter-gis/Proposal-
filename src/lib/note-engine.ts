/**
 * note-engine.ts — A proper procedural music composition engine
 *
 * What makes music sound GOOD (not like blank noise):
 *
 * 1. STRUCTURE: Verse → Chorus → Verse → Chorus → Bridge → Chorus
 *    Each section has a distinct emotional character.
 *
 * 2. HARMONY: Chord progressions that create tension and resolution.
 *    I-V-vi-IV (the "pop progression") works because it creates
 *    a journey: home → tension → minor color → return.
 *
 * 3. MELODY: Notes that follow chord tones on strong beats,
 *    with passing tones on weak beats. Repetition + variation.
 *
 * 4. BASS: Root notes that ground the harmony, with rhythmic
 *    movement that drives the song forward.
 *
 * 5. RHYTHM: Not just "notes at regular intervals" — syncopation,
 *    rests, and rhythmic motifs that repeat and vary.
 *
 * 6. DYNAMICS: Loudness changes between sections. Chorus is louder
 *    and denser than verse. Bridge is quieter.
 *
 * 7. TIMBRE: Different instruments for melody vs harmony vs bass.
 *    The ear needs contrast to stay engaged.
 *
 * This engine generates compositions as SECTION → BARS → NOTES,
 * then flattens them to the CompositionNote[] format the sound engine uses.
 */

import type { Composition, CompositionNote, InstrumentName, AmbienceType } from "./sound-engine";

// ── Types ─────────────────────────────────────────────────────────────────

export type ScaleType = "major" | "minor" | "pentatonic" | "dorian" | "lydian";

export interface Chord {
  root: string; // e.g. "C4"
  quality: "maj" | "min" | "dom7" | "maj7" | "min7" | "sus4" | "dim";
}

export interface Section {
  name: "intro" | "verse" | "chorus" | "bridge" | "outro";
  bars: number;
  chords: Chord[]; // one per bar (or 2 per bar for faster changes)
  melodyInstrument: InstrumentName;
  harmonyInstrument: InstrumentName;
  bassInstrument: InstrumentName;
  dynamic: number; // 0-1 velocity multiplier
  melodyDensity: number; // 0-1, how many notes per bar
}

export interface SongSpec {
  id: string;
  title: string;
  description: string;
  bpm: number;
  key: string; // e.g. "C"
  scale: ScaleType;
  sections: Section[];
  ambience?: AmbienceType[];
}

// ── Scale definitions ─────────────────────────────────────────────────────

const SCALES: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const A4 = 440;

function noteToFreq(note: string): number {
  note = note.replace("Bb", "A#").replace("Eb", "D#").replace("Ab", "G#").replace("Db", "C#").replace("Gb", "F#");
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return A4;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const semitones = NOTE_NAMES.indexOf(name) + (octave - 4) * 12 - 9;
  return A4 * Math.pow(2, semitones / 12);
}

function semitoneToNote(semitone: number, baseOctave: number = 4): string {
  const noteIdx = ((semitone % 12) + 12) % 12;
  const octave = baseOctave + Math.floor(semitone / 12);
  return `${NOTE_NAMES[noteIdx]}${octave}`;
}

// ── Chord voicing ─────────────────────────────────────────────────────────

function chordToNotes(chord: Chord, octave: number = 3): string[] {
  const rootIdx = NOTE_NAMES.indexOf(chord.root.replace(/\d/, ""));
  const notes: string[] = [];

  // Root
  notes.push(`${chord.root}${octave}`);

  // Third
  let thirdSemi = rootIdx + 4; // major third
  if (chord.quality === "min" || chord.quality === "min7") thirdSemi = rootIdx + 3;
  if (chord.quality === "dim") thirdSemi = rootIdx + 3;
  notes.push(semitoneToNote(thirdSemi, octave));

  // Fifth
  let fifthSemi = rootIdx + 7; // perfect fifth
  if (chord.quality === "dim") fifthSemi = rootIdx + 6;
  notes.push(semitoneToNote(fifthSemi, octave));

  // Seventh
  if (chord.quality === "dom7") notes.push(semitoneToNote(rootIdx + 10, octave));
  if (chord.quality === "maj7") notes.push(semitoneToNote(rootIdx + 11, octave));
  if (chord.quality === "min7") notes.push(semitoneToNote(rootIdx + 10, octave));

  // sus4
  if (chord.quality === "sus4") {
    notes[1] = semitoneToNote(rootIdx + 5, octave); // replace third with fourth
  }

  return notes;
}

// ── Melody generation ────────────────────────────────────────────────────

function generateMelody(
  chord: Chord,
  scaleType: ScaleType,
  keyRoot: number, // semitone offset from C
  barStart: number,
  beatsPerBar: number,
  density: number,
  rng: () => number,
): { note: string; beat: number; dur: number; vel: number }[] {
  const scale = SCALES[scaleType];
  const chordTones = chordToNotes(chord, 4).map(n => {
    const m = n.match(/^([A-G]#?)(\d)$/);
    return m ? NOTE_NAMES.indexOf(m[1]) : 0;
  });

  const melody: { note: string; beat: number; dur: number; vel: number }[] = [];
  let currentBeat = 0;

  while (currentBeat < beatsPerBar) {
    // Rest probability
    if (rng() > density * 0.8 + 0.2) {
      currentBeat += 0.5;
      continue;
    }

    // Note duration: mostly quarter/eighth, occasionally half
    const durOptions = [0.25, 0.5, 0.5, 0.5, 1.0];
    const dur = durOptions[Math.floor(rng() * durOptions.length)];

    // Pitch: 70% chord tones, 30% scale tones (passing tones)
    let semitone: number;
    if (rng() < 0.7) {
      // Chord tone
      const tone = chordTones[Math.floor(rng() * chordTones.length)];
      const octave = rng() < 0.3 ? 5 : 4;
      semitone = tone + (octave - 4) * 12;
    } else {
      // Scale tone (passing)
      const scaleDegree = scale[Math.floor(rng() * scale.length)];
      semitone = keyRoot + scaleDegree + (rng() < 0.3 ? 12 : 0); // sometimes up an octave
    }

    // Stepwise motion bias: if there's a previous note, prefer nearby
    if (melody.length > 0 && rng() < 0.6) {
      const prevNote = melody[melody.length - 1].note;
      const prevMatch = prevNote.match(/^([A-G]#?)(\d)$/);
      if (prevMatch) {
        const prevSemi = NOTE_NAMES.indexOf(prevMatch[1]) + (parseInt(prevMatch[2]) - 4) * 12;
        const step = [-2, -1, -1, 0, 1, 1, 2][Math.floor(rng() * 7)];
        semitone = prevSemi + step;
      }
    }

    const note = semitoneToNote(semitone, 4);
    const vel = 0.5 + rng() * 0.3; // 0.5-0.8

    melody.push({ note, beat: barStart + currentBeat, dur, vel });
    currentBeat += dur;
  }

  return melody;
}

// ── Bass line generation ─────────────────────────────────────────────────

function generateBass(
  chord: Chord,
  barStart: number,
  beatsPerBar: number,
): { note: string; beat: number; dur: number; vel: number }[] {
  const root = `${chord.root}2`;
  const fifth = semitoneToNote(NOTE_NAMES.indexOf(chord.root) + 7, 2);

  // Root-fifth pattern (classic bass line)
  const bass: { note: string; beat: number; dur: number; vel: number }[] = [];
  for (let beat = 0; beat < beatsPerBar; beat += 1) {
    if (beat % 2 === 0) {
      bass.push({ note: root, beat: barStart + beat, dur: 0.75, vel: 0.6 });
    } else {
      bass.push({ note: fifth, beat: barStart + beat, dur: 0.75, vel: 0.5 });
    }
  }
  return bass;
}

// ── Harmony (pad/chord) generation ───────────────────────────────────────

function generateHarmony(
  chord: Chord,
  barStart: number,
  beatsPerBar: number,
  vel: number,
): { note: string; beat: number; dur: number; vel: number }[] {
  const notes = chordToNotes(chord, 3);
  return notes.map(note => ({
    note,
    beat: barStart,
    dur: beatsPerBar,
    vel: vel * 0.3,
  }));
}

// ── Song renderer ────────────────────────────────────────────────────────

let seedCounter = 0;
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function renderSong(spec: SongSpec): Composition {
  const b = 60 / spec.bpm; // seconds per beat
  const beatsPerBar = 4; // 4/4 time
  const notes: CompositionNote[] = [];
  let currentBar = 0;
  const rng = makeRng(++seedCounter * 1000 + spec.bpm);

  // Key root semitone
  const keyRoot = NOTE_NAMES.indexOf(spec.key);

  for (const section of spec.sections) {
    for (let bar = 0; bar < section.bars; bar++) {
      const chordIdx = bar % section.chords.length;
      const chord = section.chords[chordIdx];
      const barStartBeat = currentBar * beatsPerBar;

      // Generate melody
      const melody = generateMelody(chord, spec.scale, keyRoot, barStartBeat, beatsPerBar, section.melodyDensity, rng);
      for (const m of melody) {
        notes.push({
          note: m.note,
          start: m.beat * b,
          dur: m.dur * b,
          vel: m.vel * section.dynamic,
          inst: section.melodyInstrument,
        });
      }

      // Generate bass
      const bass = generateBass(chord, barStartBeat, beatsPerBar);
      for (const bs of bass) {
        notes.push({
          note: bs.note,
          start: bs.beat * b,
          dur: bs.dur * b,
          vel: bs.vel * section.dynamic,
          inst: section.bassInstrument,
        });
      }

      // Generate harmony (only on first beat of each chord change)
      if (bar % 2 === 0 || section.chords.length > section.bars) {
        const harmony = generateHarmony(chord, barStartBeat, beatsPerBar, section.dynamic);
        for (const h of harmony) {
          notes.push({
            note: h.note,
            start: h.beat * b,
            dur: h.dur * b,
            vel: h.vel,
            inst: section.harmonyInstrument,
          });
        }
      }

      currentBar++;
    }
  }

  const totalBeats = currentBar * beatsPerBar;
  const duration = totalBeats * b + 2; // +2s for reverb tail

  return {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    bpm: spec.bpm,
    notes,
    duration,
    ambience: spec.ambience,
  };
}
