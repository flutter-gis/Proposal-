/**
 * compositions.ts
 *
 * 10 complete audio pieces composed using the 20-instrument sound engine.
 * Each piece is a real composition with melody, harmony, bass, and rhythm —
 * all written as note events that the engine synthesizes in real-time.
 *
 * The pieces are tied to the app's emotional arc:
 *   1. Golden Hour — engagement reveal (piano + strings + bells)
 *   2. First Light — Home page (harp + flute + celesta)
 *   3. Forest Trail — Trip page (guitar + violin + marimba)
 *   4. Mountain Echo — Map page (organ + choir + timpani)
 *   5. The Question — Proposal page (piano + cello + glockenspiel)
 *   6. Starlit Path — Us page night theme (celesta + pad + bass)
 *   7. Sunrise Promise — dawn theme (flute + harp + violin)
 *   8. Sunset Vow — sunset theme (trumpet + cello + organ)
 *   9. Celebration — engagement celebration (all instruments)
 *   10. Serenity — quiet ending (piano + choir + pad)
 */

import type { Composition, CompositionNote, InstrumentName } from "./sound-engine";

const B = (bpm: number) => 60 / bpm; // seconds per beat

function n(note: string, beat: number, durBeats: number, vel: number, inst: InstrumentName, beatDur: number): CompositionNote {
  return { note, start: beat * beatDur, dur: durBeats * beatDur, vel, inst };
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. GOLDEN HOUR — E major, 68 BPM
//     The engagement reveal piece — warm, hopeful, romantic
// ═══════════════════════════════════════════════════════════════════════════
function goldenHour(): Composition {
  const b = B(68);
  const notes: CompositionNote[] = [];
  // Section A — melody
  ["E4","F#4","G#4","A4","B4","C#5","B4","A4","G#4","F#4",
   "E4","G#4","A4","B4","C#5","D5","C#5","B4","A4"].forEach((note, i) => {
    const beat = i < 10 ? i : 8 + i;
    const dur = (i === 9 || i === 18) ? 2 : (i === 4 || i === 10 || i === 15) ? 1 : 0.5;
    notes.push(n(note, beat, dur, 0.7, "piano", b));
  });
  // String chords
  [[0,"E3",4],[4,"A3",4],[8,"C#3",4],[12,"A3",4],[16,"F#3",4],[20,"E3",4],[24,"A3",4],[28,"E3",4]].forEach(([beat,note,dur]) => {
    notes.push(n(note as string, beat as number, dur as number, 0.3, "cello", b));
    notes.push(n((note as string).replace("3","4"), beat as number, dur as number, 0.2, "violin", b));
  });
  // Bell accents
  [[3,"E5",2],[7,"B4",2],[11,"C#5",2],[14,"E5",3],[18,"A4",2],[22,"E5",3],[27,"B5",2],[31,"E6",3]].forEach(([beat,note,dur]) => {
    notes.push(n(note as string, beat as number, dur as number, 0.4, "glockenspiel", b));
  });
  return { id: "golden-hour", title: "Golden Hour", description: "Warm, hopeful, romantic", bpm: 68, notes, duration: 32 * b + 2 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  2. FIRST LIGHT — D major, 72 BPM
//     Home page — gentle awakening
// ═══════════════════════════════════════════════════════════════════════════
function firstLight(): Composition {
  const b = B(72);
  const notes: CompositionNote[] = [];
  // Harp arpeggios
  ["D4","A4","D5","A4","G4","D5","G5","D5","F#4","A4","D5","A4","E4","A4","C#5","A4"].forEach((note, i) => {
    notes.push(n(note, i * 0.5, 1, 0.4, "harp", b));
  });
  // Flute melody
  ["D5","","F#5","","A5","","G5","","F#5","","D5","","E5","","C#5",""].forEach((note, i) => {
    if (note) notes.push(n(note, i, 1.5, 0.5, "flute", b));
  });
  // Celesta sparkles
  ["D6","A5","F#5","D6","A5","F#5","D6","A5"].forEach((note, i) => {
    notes.push(n(note, i * 2, 2, 0.3, "celesta", b));
  });
  // Bass
  ["D2","G2","F#2","A2"].forEach((note, i) => {
    notes.push(n(note, i * 4, 4, 0.3, "bass", b));
  });
  return { id: "first-light", title: "First Light", description: "Gentle awakening", bpm: 72, notes, duration: 16 * b + 2 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  3. FOREST TRAIL — G major, 90 BPM
//     Trip page — adventurous, walking pace
// ═══════════════════════════════════════════════════════════════════════════
function forestTrail(): Composition {
  const b = B(90);
  const notes: CompositionNote[] = [];
  // Guitar strums
  ["G3","C3","G3","D3","G3","C3","G3","D3"].forEach((note, i) => {
    notes.push(n(note, i * 2, 2, 0.35, "guitar", b));
  });
  // Violin melody
  ["G4","B4","D5","B4","C5","E5","G5","E5","D5","B4","G4","A4","B4","D5","C5","A4"].forEach((note, i) => {
    notes.push(n(note, i, 1, 0.5, "violin", b));
  });
  // Marimba rhythm
  ["G3","D4","G3","D4","G3","D4","G3","D4"].forEach((note, i) => {
    notes.push(n(note, i, 0.5, 0.3, "marimba", b));
  });
  // Bass
  ["G2","C2","G2","D2"].forEach((note, i) => {
    notes.push(n(note, i * 4, 4, 0.35, "bass", b));
  });
  return { id: "forest-trail", title: "Forest Trail", description: "Adventurous, walking pace", bpm: 90, notes, duration: 16 * b + 2 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  4. MOUNTAIN ECHO — A minor, 60 BPM
//     Map page — vast, spacious
// ═══════════════════════════════════════════════════════════════════════════
function mountainEcho(): Composition {
  const b = B(60);
  const notes: CompositionNote[] = [];
  // Organ sustained chords
  ["A2","C3","E3","A3","F2","A2","C3","F3","G2","B2","D3","G3","E2","G2","B2","E3"].forEach((note, i) => {
    notes.push(n(note, Math.floor(i / 4) * 4, 4, 0.25, "organ", b));
  });
  // Choir melody
  ["A4","C5","E5","D5","C5","A4","G4","A4"].forEach((note, i) => {
    notes.push(n(note, i * 2, 2, 0.4, "choir", b));
  });
  // Timpani
  ["A1","A1","F1","F1","G1","G1","E1","E1"].forEach((note, i) => {
    notes.push(n(note, i * 2, 1, 0.5, "timpani", b));
  });
  return { id: "mountain-echo", title: "Mountain Echo", description: "Vast, spacious", bpm: 60, notes, duration: 16 * b + 3 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  5. THE QUESTION — E major, 65 BPM
//     Proposal page — intimate, emotional
// ═══════════════════════════════════════════════════════════════════════════
function theQuestion(): Composition {
  const b = B(65);
  const notes: CompositionNote[] = [];
  // Piano — sparse, emotional
  ["E4","","G#4","","B4","","A4","","G#4","","F#4","","E4","","D#4",""].forEach((note, i) => {
    if (note) notes.push(n(note, i, 2, 0.6, "piano", b));
  });
  // Cello — deep, yearning
  ["E2","B2","A2","G#2","E2","F#2","B2","E2"].forEach((note, i) => {
    notes.push(n(note, i * 2, 2, 0.35, "cello", b));
  });
  // Glockenspiel — sparse sparkle
  ["E5","","","B5","","","C#6","","","B5","","","A5",""].forEach((note, i) => {
    if (note) notes.push(n(note, i, 1, 0.3, "glockenspiel", b));
  });
  return { id: "the-question", title: "The Question", description: "Intimate, emotional", bpm: 65, notes, duration: 16 * b + 3 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  6. STARLIT PATH — B minor, 70 BPM
//     Us page / night theme — dreamy, ethereal
// ═══════════════════════════════════════════════════════════════════════════
function starlitPath(): Composition {
  const b = B(70);
  const notes: CompositionNote[] = [];
  // Celesta — twinkling
  ["B4","F#5","D5","F#5","B4","F#5","D5","F#5","A4","E5","C#5","E5","A4","E5","C#5","E5"].forEach((note, i) => {
    notes.push(n(note, i * 0.5, 1, 0.3, "celesta", b));
  });
  // Pad — dreamy
  ["B2","F#3","B3","F#3","B2","D3","A3","D3"].forEach((note, i) => {
    notes.push(n(note, Math.floor(i / 4) * 8, 8, 0.15, "pad", b));
  });
  // Bass — deep
  ["B1","F#2","A1","E2"].forEach((note, i) => {
    notes.push(n(note, i * 4, 4, 0.3, "bass", b));
  });
  // Lead — ethereal melody
  ["D5","F#5","E5","D5","C#5","D5","E5","F#5"].forEach((note, i) => {
    notes.push(n(note, i * 2, 2, 0.35, "lead", b));
  });
  return { id: "starlit-path", title: "Starlit Path", description: "Dreamy, ethereal", bpm: 70, notes, duration: 16 * b + 2 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  7. SUNRISE PROMISE — C major, 75 BPM
//     Dawn theme — bright, hopeful
// ═══════════════════════════════════════════════════════════════════════════
function sunrisePromise(): Composition {
  const b = B(75);
  const notes: CompositionNote[] = [];
  // Flute melody
  ["C5","E5","G5","E5","F5","A5","G5","E5","D5","F5","E5","C5","D5","F5","E5","D5"].forEach((note, i) => {
    notes.push(n(note, i, 1, 0.5, "flute", b));
  });
  // Harp arpeggios
  ["C4","E4","G4","C5","E4","G4","C5","E5","F4","A4","C5","F5","A4","C5","F5","A5"].forEach((note, i) => {
    notes.push(n(note, i * 0.5, 0.5, 0.3, "harp", b));
  });
  // Violin harmony
  ["G4","C5","E5","G4","A4","D5","F5","A4","G4","C5","E5","G4","F4","A4","C5","F5"].forEach((note, i) => {
    notes.push(n(note, i, 1, 0.3, "violin", b));
  });
  return { id: "sunrise-promise", title: "Sunrise Promise", description: "Bright, hopeful", bpm: 75, notes, duration: 16 * b + 2 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  8. SUNSET VOW — F major, 68 BPM
//     Sunset theme — warm, golden, ceremonial
// ═══════════════════════════════════════════════════════════════════════════
function sunsetVow(): Composition {
  const b = B(68);
  const notes: CompositionNote[] = [];
  // Trumpet — ceremonial
  ["F4","A4","C5","F5","E5","C5","A4","F4","G4","Bb4","D5","G5","F5","D5","Bb4","G4"].forEach((note, i) => {
    notes.push(n(note, i, 1, 0.45, "trumpet", b));
  });
  // Cello — warm underneath
  ["F2","C3","A3","C3","F2","C3","A3","C3","G2","D3","Bb3","D3","F2","C3","A3","C3"].forEach((note, i) => {
    notes.push(n(note, Math.floor(i / 4) * 4, 4, 0.3, "cello", b));
  });
  // Organ — majestic
  ["F3","A3","C4","F3","A3","C4","G3","Bb3","D4","G3","Bb3","D4","F3","A3","C4","F3","A3","C4"].forEach((note, i) => {
    notes.push(n(note, Math.floor(i / 3) * 2, 2, 0.2, "organ", b));
  });
  return { id: "sunset-vow", title: "Sunset Vow", description: "Warm, golden, ceremonial", bpm: 68, notes, duration: 16 * b + 2 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  9. CELEBRATION — C major, 120 BPM
//     Engagement celebration — joyful, energetic
// ═══════════════════════════════════════════════════════════════════════════
function celebration(): Composition {
  const b = B(120);
  const notes: CompositionNote[] = [];
  // Trumpet melody — joyful
  ["C5","E5","G5","C6","G5","E5","C5","G4","A4","C5","E5","A5","G5","E5","C5","G4"].forEach((note, i) => {
    notes.push(n(note, i * 0.5, 0.5, 0.5, "trumpet", b));
  });
  // Violin harmony
  ["E5","G5","C6","E5","G5","C6","E5","G5","F5","A5","C6","F5","A5","C6","F5","A5"].forEach((note, i) => {
    notes.push(n(note, i * 0.5, 0.5, 0.35, "violin", b));
  });
  // Marimba rhythm
  ["C4","G4","E4","G4","C4","G4","E4","G4","F4","C5","A4","C5","F4","C5","A4","C5"].forEach((note, i) => {
    notes.push(n(note, i * 0.25, 0.25, 0.3, "marimba", b));
  });
  // Bass — driving
  ["C2","C2","G2","G2","A2","A2","F2","F2"].forEach((note, i) => {
    notes.push(n(note, i, 1, 0.4, "bass", b));
  });
  // Cymbal — on beats
  ["C4","C4","C4","C4","C4","C4","C4","C4"].forEach((note, i) => {
    notes.push(n(note, i * 2, 0.3, 0.2, "cymbal", b));
  });
  // Glockenspiel — sparkles
  ["C6","E6","G6","E6","C6","E6","G6","E6"].forEach((note, i) => {
    notes.push(n(note, i, 0.5, 0.3, "glockenspiel", b));
  });
  return { id: "celebration", title: "Celebration", description: "Joyful, energetic", bpm: 120, notes, duration: 8 * b + 1 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  10. SERENITY — A major, 60 BPM
//     Quiet ending — peaceful, contemplative
// ═══════════════════════════════════════════════════════════════════════════
function serenity(): Composition {
  const b = B(60);
  const notes: CompositionNote[] = [];
  // Piano — sparse, peaceful
  ["A4","","C#5","","E5","","C#5","","A4","","B4","","D5","","B4",""].forEach((note, i) => {
    if (note) notes.push(n(note, i, 2, 0.5, "piano", b));
  });
  // Choir — sustained
  ["A3","E4","A4","E4","A3","E4","A4","E4","B3","F#4","B4","F#4","B3","F#4","B4","F#4"].forEach((note, i) => {
    notes.push(n(note, Math.floor(i / 4) * 4, 4, 0.2, "choir", b));
  });
  // Pad — atmospheric
  ["A2","E3","A3","E3","A2","E3","A3","E3"].forEach((note, i) => {
    notes.push(n(note, Math.floor(i / 4) * 4, 4, 0.12, "pad", b));
  });
  // Celesta — distant
  ["E5","","","A5","","","C#6","","","B5","","","A5",""].forEach((note, i) => {
    if (note) notes.push(n(note, i, 1, 0.25, "celesta", b));
  });
  return { id: "serenity", title: "Serenity", description: "Peaceful, contemplative", bpm: 60, notes, duration: 16 * b + 3 };
}

// ═══════════════════════════════════════════════════════════════════════════
//  EXPORT ALL COMPOSITIONS
// ═══════════════════════════════════════════════════════════════════════════
export const COMPOSITIONS: Composition[] = [
  goldenHour(),
  firstLight(),
  forestTrail(),
  mountainEcho(),
  theQuestion(),
  starlitPath(),
  sunrisePromise(),
  sunsetVow(),
  celebration(),
  serenity(),
];

export function getComposition(id: string): Composition | undefined {
  return COMPOSITIONS.find(c => c.id === id);
}
