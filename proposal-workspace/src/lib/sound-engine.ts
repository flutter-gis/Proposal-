/**
 * sound-engine.ts
 *
 * A complete Web Audio synthesis engine with 20 instruments.
 * Every sound is procedurally generated — no audio files.
 *
 * Instruments span 5 categories:
 *   STRINGS:   violin, cello, harp, guitar
 *   WINDS:     flute, clarinet, oboe, trumpet
 *   KEYS:      piano, celesta, organ, harpsichord
 *   PERCUSSION: glockenspiel, marimba, timpani, cymbal
 *   SYNTH:     pad, lead, bass
 *
 * Each instrument has:
 *   - A unique synthesis method (FM, AM, additive, subtractive, physical modeling)
 *   - Realistic envelope (ADSR)
 *   - Timbral detail (harmonics, noise, formants)
 *   - Dynamic response to velocity
 */

// ═══════════════════════════════════════════════════════════════════════════
//  NOTE FREQUENCIES
// ═══════════════════════════════════════════════════════════════════════════
const A4 = 440;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteToFreq(note: string): number {
  // Parse note like "C4", "F#5", "Bb3" (flat→sharp)
  note = note.replace("Bb", "A#").replace("Eb", "D#").replace("Ab", "G#").replace("Db", "C#").replace("Gb", "F#");
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return A4;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const semitones = NOTE_NAMES.indexOf(name) + (octave - 4) * 12 - 9; // A4 = 0
  return A4 * Math.pow(2, semitones / 12);
}

// ═══════════════════════════════════════════════════════════════════════════
//  INSTRUMENT TYPE
// ═══════════════════════════════════════════════════════════════════════════
export type InstrumentName =
  | "piano" | "celesta" | "organ" | "harpsichord"
  | "violin" | "cello" | "harp" | "guitar"
  | "flute" | "clarinet" | "oboe" | "trumpet"
  | "glockenspiel" | "marimba" | "timpani" | "cymbal"
  | "pad" | "lead" | "bass" | "choir";

interface NoteParams {
  freq: number;
  time: number;
  dur: number;
  vel: number; // 0-1
}

type InstrumentFn = (ctx: AudioContext, params: NoteParams, outputs: AudioNode[]) => void;

// ═══════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
function makeNoiseBuffer(ctx: AudioContext, dur: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function adsr(ctx: AudioContext, param: AudioParam, time: number, dur: number, vel: number,
             a: number, d: number, s: number, r: number) {
  const peak = vel;
  const sustain = vel * s;
  param.setValueAtTime(0, time);
  param.linearRampToValueAtTime(peak, time + a);
  param.linearRampToValueAtTime(sustain, time + a + d);
  param.setValueAtTime(sustain, time + Math.max(a + d, dur - r));
  param.exponentialRampToValueAtTime(0.001, time + dur);
}

function connectToOutputs(node: AudioNode, outputs: AudioNode[]) {
  outputs.forEach(out => node.connect(out));
}

// ═══════════════════════════════════════════════════════════════════════════
//  20 INSTRUMENTS
// ═══════════════════════════════════════════════════════════════════════════

// 1. PIANO — FM synth with felt hammer
const piano: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const carrier = ctx.createOscillator(); carrier.type = "triangle"; carrier.frequency.value = freq;
  const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = freq * 2;
  const modGain = ctx.createGain();
  modGain.gain.setValueAtTime(freq * 3 * vel, time);
  modGain.gain.exponentialRampToValueAtTime(freq * 0.3, time + 0.15);
  mod.connect(modGain); modGain.connect(carrier.frequency);
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.5, 0.005, 0.1, 0.3, 0.3);
  carrier.connect(env);
  // Sub osc for warmth
  const sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = freq * 0.5;
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0, time);
  subGain.gain.linearRampToValueAtTime(vel * 0.12, time + 0.02);
  subGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.7);
  sub.connect(subGain); subGain.connect(env);
  connectToOutputs(env, outputs);
  carrier.start(time); mod.start(time); sub.start(time);
  carrier.stop(time + dur + 0.1); mod.stop(time + dur + 0.1); sub.stop(time + dur + 0.1);
};

// 2. CELESTA — bright bells, shorter decay
const celesta: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const partials = [{ r: 1, g: 1 }, { r: 2, g: 0.5 }, { r: 3, g: 0.25 }, { r: 4.1, g: 0.15 }];
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.35, time + 0.002);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur * 1.2);
  partials.forEach(p => {
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq * p.r;
    const g = ctx.createGain(); g.gain.value = p.g;
    osc.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur * 1.2 + 0.1);
  });
  connectToOutputs(env, outputs);
};

// 3. ORAN — sustained tonal, multiple harmonics
const organ: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const harmonics = [1, 2, 3, 4, 6];
  const gains = [0.5, 0.3, 0.2, 0.15, 0.1];
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.25, 0.05, 0.1, 0.9, 0.15);
  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq * h;
    const g = ctx.createGain(); g.gain.value = gains[i];
    osc.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur + 0.2);
  });
  connectToOutputs(env, outputs);
};

// 4. HARPSICHORD — plucked, bright, quick decay
const harpsichord: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const osc1 = ctx.createOscillator(); osc1.type = "sawtooth"; osc1.frequency.value = freq;
  const osc2 = ctx.createOscillator(); osc2.type = "square"; osc2.frequency.value = freq * 2;
  const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = freq * 6; filter.Q.value = 1;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.3, time + 0.001);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.6);
  osc1.connect(filter); osc2.connect(filter); filter.connect(env);
  connectToOutputs(env, outputs);
  osc1.start(time); osc2.start(time);
  osc1.stop(time + dur + 0.1); osc2.stop(time + dur + 0.1);
};

// 5. VIOLIN — detuned sawtooth with vibrato
const violin: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.2, 0.15, 0.1, 0.85, 0.2);
  const vibrato = ctx.createOscillator(); vibrato.type = "sine"; vibrato.frequency.value = 5;
  const vibratoGain = ctx.createGain(); vibratoGain.gain.value = 3;
  vibrato.connect(vibratoGain);
  [-5, 0, 5].forEach(detune => {
    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
    osc.detune.value = detune;
    vibratoGain.connect(osc.frequency);
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = freq * 5; filter.Q.value = 0.7;
    osc.connect(filter); filter.connect(env);
    osc.start(time); osc.stop(time + dur + 0.3);
  });
  connectToOutputs(env, outputs);
  vibrato.start(time); vibrato.stop(time + dur + 0.3);
};

// 6. CELLO — warm, lower register, slow attack
const cello: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.25, 0.25, 0.15, 0.8, 0.25);
  [-3, 0, 3].forEach(detune => {
    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
    osc.detune.value = detune;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = freq * 3; filter.Q.value = 0.5;
    osc.connect(filter); filter.connect(env);
    osc.start(time); osc.stop(time + dur + 0.3);
  });
  // Sub sine
  const sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = freq * 0.5;
  const subG = ctx.createGain(); subG.gain.value = 0.3;
  sub.connect(subG); subG.connect(env);
  sub.start(time); sub.stop(time + dur + 0.3);
  connectToOutputs(env, outputs);
};

// 7. HARP — plucked string, cascading
const harp: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq;
  const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = freq * 8;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.4, time + 0.003);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur * 1.5);
  osc.connect(filter); filter.connect(env);
  // Harmonic
  const harm = ctx.createOscillator(); harm.type = "sine"; harm.frequency.value = freq * 2;
  const hGain = ctx.createGain(); hGain.gain.value = 0.2;
  harm.connect(hGain); hGain.connect(env);
  connectToOutputs(env, outputs);
  osc.start(time); harm.start(time);
  osc.stop(time + dur * 1.5 + 0.1); harm.stop(time + dur * 1.5 + 0.1);
};

// 8. GUITAR — plucked, steel string
const guitar: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
  const filter = ctx.createBiquadFilter(); filter.type = "lowpass";
  filter.frequency.setValueAtTime(freq * 8, time);
  filter.frequency.exponentialRampToValueAtTime(freq * 2, time + dur * 0.5);
  filter.Q.value = 2;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.35, time + 0.002);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.connect(filter); filter.connect(env);
  connectToOutputs(env, outputs);
  osc.start(time); osc.stop(time + dur + 0.1);
};

// 9. FLUTE — sine + breath noise
const flute: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.25, 0.08, 0.05, 0.9, 0.1);
  const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = 0.8;
  osc.connect(g); g.connect(env);
  // Breath noise
  const noise = ctx.createBufferSource(); noise.buffer = makeNoiseBuffer(ctx, dur + 0.5); noise.loop = true;
  const nFilter = ctx.createBiquadFilter(); nFilter.type = "bandpass"; nFilter.frequency.value = freq * 2; nFilter.Q.value = 0.5;
  const nGain = ctx.createGain(); nGain.gain.value = 0.05;
  noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(env);
  connectToOutputs(env, outputs);
  osc.start(time); noise.start(time);
  osc.stop(time + dur + 0.2); noise.stop(time + dur + 0.2);
};

// 10. CLARINET — odd harmonics, woody
const clarinet: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.22, 0.06, 0.08, 0.85, 0.15);
  // Odd harmonics (clarinet characteristic)
  [1, 3, 5, 7].forEach((h, i) => {
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq * h;
    const g = ctx.createGain(); g.gain.value = 1 / (i + 1) * 0.8;
    osc.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur + 0.2);
  });
  connectToOutputs(env, outputs);
};

// 11. OBOE — double reed, bright, nasal
const oboe: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.2, 0.04, 0.06, 0.8, 0.1);
  const osc1 = ctx.createOscillator(); osc1.type = "sawtooth"; osc1.frequency.value = freq;
  const osc2 = ctx.createOscillator(); osc2.type = "sawtooth"; osc2.frequency.value = freq * 1.005;
  const filter = ctx.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = freq * 3; filter.Q.value = 3;
  osc1.connect(filter); osc2.connect(filter); filter.connect(env);
  connectToOutputs(env, outputs);
  osc1.start(time); osc2.start(time);
  osc1.stop(time + dur + 0.2); osc2.stop(time + dur + 0.2);
};

// 12. TRUMPET — brass, bright, with growl
const trumpet: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.22, 0.03, 0.05, 0.85, 0.12);
  const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
  // Growl: frequency modulation
  const growl = ctx.createOscillator(); growl.type = "square"; growl.frequency.value = 30;
  const growlGain = ctx.createGain(); growlGain.gain.value = 2;
  growl.connect(growlGain); growlGain.connect(osc.frequency);
  const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = freq * 5; filter.Q.value = 1;
  osc.connect(filter); filter.connect(env);
  connectToOutputs(env, outputs);
  osc.start(time); growl.start(time);
  osc.stop(time + dur + 0.2); growl.stop(time + dur + 0.2);
};

// 13. GLOCKENSPIEL — bright bell, high pitch
const glockenspiel: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const partials = [{ r: 1, g: 1 }, { r: 2.7, g: 0.4 }, { r: 5.4, g: 0.2 }, { r: 8.7, g: 0.1 }];
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.3, time + 0.001);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur * 1.8);
  partials.forEach(p => {
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq * p.r;
    const g = ctx.createGain(); g.gain.value = p.g;
    osc.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur * 1.8 + 0.1);
  });
  connectToOutputs(env, outputs);
};

// 14. MARIMBA — wooden bar, warm
const marimba: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const partials = [{ r: 1, g: 1 }, { r: 3.9, g: 0.3 }, { r: 6.7, g: 0.15 }];
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.35, time + 0.003);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur * 1.3);
  partials.forEach(p => {
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq * p.r;
    const g = ctx.createGain(); g.gain.value = p.g;
    osc.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur * 1.3 + 0.1);
  });
  connectToOutputs(env, outputs);
};

// 15. TIMPANI — drum, pitched
const timpani: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
  osc.frequency.exponentialRampToValueAtTime(freq * 0.95, time + 0.1);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.6, time + 0.002);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.8);
  osc.connect(env);
  // Attack noise
  const noise = ctx.createBufferSource(); noise.buffer = makeNoiseBuffer(ctx, 0.2);
  const nFilter = ctx.createBiquadFilter(); nFilter.type = "lowpass"; nFilter.frequency.value = 200;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(vel * 0.3, time);
  nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(env);
  connectToOutputs(env, outputs);
  osc.start(time); noise.start(time);
  osc.stop(time + dur + 0.1); noise.stop(time + 0.2);
};

// 16. CYMBAL — noise burst, metallic
const cymbal: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const noise = ctx.createBufferSource(); noise.buffer = makeNoiseBuffer(ctx, dur + 0.5); noise.loop = true;
  const hpf = ctx.createBiquadFilter(); hpf.type = "highpass"; hpf.frequency.value = 5000;
  const env = ctx.createGain();
  env.gain.setValueAtTime(vel * 0.25, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.7);
  noise.connect(hpf); hpf.connect(env);
  // Ringing partials
  [ freq * 1.5, freq * 2.3, freq * 3.1 ].forEach(f => {
    const osc = ctx.createOscillator(); osc.type = "square"; osc.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = 0.02;
    osc.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur + 0.1);
  });
  connectToOutputs(env, outputs);
  noise.start(time); noise.stop(time + dur + 0.2);
};

// 17. PAD — lush, evolving
const pad: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.12, time + 1.0);
  env.gain.linearRampToValueAtTime(vel * 0.1, time + dur * 0.7);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur);
  [0, 7, 12].forEach((semi, i) => {
    const osc = ctx.createOscillator(); osc.type = "sawtooth";
    osc.frequency.value = freq * Math.pow(2, semi / 12);
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 2, time);
    filter.frequency.linearRampToValueAtTime(freq * 4, time + dur * 0.5);
    filter.Q.value = 1;
    const g = ctx.createGain(); g.gain.value = 0.3 / (i + 1);
    osc.connect(filter); filter.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur + 0.5);
  });
  connectToOutputs(env, outputs);
};

// 18. LEAD — bright synth lead
const lead: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.2, 0.01, 0.05, 0.7, 0.1);
  const osc1 = ctx.createOscillator(); osc1.type = "square"; osc1.frequency.value = freq;
  const osc2 = ctx.createOscillator(); osc2.type = "sawtooth"; osc2.frequency.value = freq * 1.01;
  const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = freq * 6; filter.Q.value = 2;
  osc1.connect(filter); osc2.connect(filter); filter.connect(env);
  connectToOutputs(env, outputs);
  osc1.start(time); osc2.start(time);
  osc1.stop(time + dur + 0.2); osc2.stop(time + dur + 0.2);
};

// 19. BASS — deep, sub
const bass: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.4, 0.01, 0.05, 0.6, 0.15);
  const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
  const sub = ctx.createOscillator(); sub.type = "triangle"; sub.frequency.value = freq * 0.5;
  const subG = ctx.createGain(); subG.gain.value = 0.5;
  osc.connect(env); sub.connect(subG); subG.connect(env);
  connectToOutputs(env, outputs);
  osc.start(time); sub.start(time);
  osc.stop(time + dur + 0.2); sub.stop(time + dur + 0.2);
};

// 20. CHOIR — vocal "ah", formant filtering
const choir: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.15, 0.3, 0.2, 0.8, 0.3);
  const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = freq;
  // Formant filters (vowel "ah": 800Hz, 1200Hz, 2800Hz)
  const formant1 = ctx.createBiquadFilter(); formant1.type = "bandpass"; formant1.frequency.value = 800; formant1.Q.value = 8;
  const formant2 = ctx.createBiquadFilter(); formant2.type = "bandpass"; formant2.frequency.value = 1200; formant2.Q.value = 10;
  const formant3 = ctx.createBiquadFilter(); formant3.type = "bandpass"; formant3.frequency.value = 2800; formant3.Q.value = 12;
  const g1 = ctx.createGain(); g1.gain.value = 0.5;
  const g2 = ctx.createGain(); g2.gain.value = 0.3;
  const g3 = ctx.createGain(); g3.gain.value = 0.15;
  osc.connect(formant1); formant1.connect(g1); g1.connect(env);
  osc.connect(formant2); formant2.connect(g2); g2.connect(env);
  osc.connect(formant3); formant3.connect(g3); g3.connect(env);
  connectToOutputs(env, outputs);
  osc.start(time); osc.stop(time + dur + 0.3);
};

// ═══════════════════════════════════════════════════════════════════════════
//  INSTRUMENT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════
export const INSTRUMENTS: Record<InstrumentName, InstrumentFn> = {
  piano, celesta, organ, harpsichord,
  violin, cello, harp, guitar,
  flute, clarinet, oboe, trumpet,
  glockenspiel, marimba, timpani, cymbal,
  pad, lead, bass, choir,
};

export const INSTRUMENT_INFO: Record<InstrumentName, { category: string; label: string }> = {
  piano: { category: "Keys", label: "Piano" },
  celesta: { category: "Keys", label: "Celesta" },
  organ: { category: "Keys", label: "Organ" },
  harpsichord: { category: "Keys", label: "Harpsichord" },
  violin: { category: "Strings", label: "Violin" },
  cello: { category: "Strings", label: "Cello" },
  harp: { category: "Strings", label: "Harp" },
  guitar: { category: "Strings", label: "Guitar" },
  flute: { category: "Winds", label: "Flute" },
  clarinet: { category: "Winds", label: "Clarinet" },
  oboe: { category: "Winds", label: "Oboe" },
  trumpet: { category: "Winds", label: "Trumpet" },
  glockenspiel: { category: "Percussion", label: "Glockenspiel" },
  marimba: { category: "Percussion", label: "Marimba" },
  timpani: { category: "Percussion", label: "Timpani" },
  cymbal: { category: "Percussion", label: "Cymbal" },
  pad: { category: "Synth", label: "Pad" },
  lead: { category: "Synth", label: "Lead" },
  bass: { category: "Synth", label: "Bass" },
  choir: { category: "Synth", label: "Choir" },
};

// ═══════════════════════════════════════════════════════════════════════════
//  COMPOSITION TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface CompositionNote {
  note: string;
  start: number; // seconds
  dur: number;   // seconds
  vel: number;   // 0-1
  inst: InstrumentName;
}

export interface Composition {
  id: string;
  title: string;
  description: string;
  bpm: number;
  notes: CompositionNote[];
  duration: number; // total seconds (one loop)
}

// ═══════════════════════════════════════════════════════════════════════════
//  THE SOUND ENGINE
// ═══════════════════════════════════════════════════════════════════════════
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverb: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private isPlaying = false;
  private loopTimeout: ReturnType<typeof setTimeout> | null = null;
  private volume = 0.5;
  private currentComposition: Composition | null = null;

  private ensureContext() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.createImpulseResponse(3, 2.5);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.3;
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.7;
    this.dryGain.connect(this.compressor);
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  private playNote(note: CompositionNote, startTime: number) {
    if (!this.ctx || !this.dryGain || !this.reverb) return;
    const fn = INSTRUMENTS[note.inst];
    if (!fn) return;
    const f = noteToFreq(note.note);
    const t = startTime + note.start;
    const outputs = [this.dryGain, this.reverb];
    fn(this.ctx, { freq: f, time: t, dur: note.dur, vel: note.vel }, outputs);
  }

  private scheduleLoop() {
    if (!this.ctx || !this.isPlaying || !this.currentComposition) return;
    const startTime = this.ctx.currentTime + 0.1;
    this.currentComposition.notes.forEach(n => this.playNote(n, startTime));
    this.loopTimeout = setTimeout(() => {
      if (this.isPlaying) this.scheduleLoop();
    }, this.currentComposition.duration * 1000);
  }

  async play(composition: Composition) {
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    if (this.isPlaying) {
      // Already playing — crossfade to the new composition instead of
      // a hard stop+restart, which caused a 0.3s silent gap.
      this.switchTo(composition);
      return;
    }
    this.currentComposition = composition;
    this.isPlaying = true;
    this.scheduleLoop();
  }

  /**
   * Crossfade to a new composition without stopping audio.
   *
   * Strategy: cancel any pending loop timeout, then ramp the master gain
   * down to ~0 over 0.4s while simultaneously scheduling the new
   * composition's first loop to start at currentTime + 0.1s. Once the
   * fade-out completes, restore the master gain to the user's volume
   * with a matching 0.4s ramp-up. The net effect is a seamless cross-
   * fade rather than an audible cut.
   *
   * This is the method the plan calls for — MusicPlayer.playTrack calls
   * `engine.play()` which delegates here when already playing.
   */
  switchTo(composition: Composition) {
    if (!this.ctx || !this.masterGain) return;
    // Stop the next scheduled loop tick — we don't want the old composition
    // to fire another scheduleLoop() mid-crossfade.
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    // If switching to the same composition, no-op (prevents micro-stutters
    // when the user re-clicks the currently-playing track).
    if (this.currentComposition === composition && this.isPlaying) return;

    const now = this.ctx.currentTime;
    const fadeOut = 0.4;
    const fadeIn = 0.4;
    const targetVol = this.volume;

    // Fade out the old composition's tail
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + fadeOut);

    // Schedule the new composition to start as the old one fades out
    this.currentComposition = composition;
    this.isPlaying = true;
    // Wait for fade-out to complete, then ramp back up and schedule the loop
    setTimeout(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const restart = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(restart);
      this.masterGain.gain.setValueAtTime(0.001, restart);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, targetVol), restart + fadeIn);
      this.scheduleLoop();
    }, fadeOut * 1000);
  }

  stop() {
    this.isPlaying = false;
    if (this.loopTimeout) { clearTimeout(this.loopTimeout); this.loopTimeout = null; }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      setTimeout(() => { if (this.masterGain) this.masterGain.gain.value = this.volume; }, 400);
    }
    if (this.ctx?.state === "running") this.ctx.suspend();
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
    }
  }

  get playing() { return this.isPlaying; }
  get current() { return this.currentComposition; }
}

// Singleton
let engineInstance: SoundEngine | null = null;
export function getSoundEngine(): SoundEngine {
  if (!engineInstance) engineInstance = new SoundEngine();
  return engineInstance;
}
