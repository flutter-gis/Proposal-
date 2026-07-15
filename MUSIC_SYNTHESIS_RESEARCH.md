# Procedural Music Engine — Technical Research Document

**Scope:** Synthesis theory + music theory + Web Audio API implementation for a
procedural music engine in TypeScript.

**Alignment note:** This document is written to match the conventions already
in `src/lib/sound-engine.ts` (`noteToFreq`, `adsr` helper, `INSTRUMENTS`
registry, `Composition` / `CompositionNote` interfaces) and `src/lib/compositions.ts`
(`n()` helper, beat-based note builder). All code snippets are drop-in compatible.

---

## Table of Contents

1. [Instrument Synthesis Techniques](#1-instrument-synthesis-techniques)
   - [1.1 Piano](#11-piano)
   - [1.2 Horns (Trumpet, Sax, French Horn)](#12-horns-trumpet-sax-french-horn)
   - [1.3 Strings (Violin, Cello)](#13-strings-violin-cello)
   - [1.4 Drums (Kick, Snare, Hi-hat, Cymbal)](#14-drums-kick-snare-hi-hat-cymbal)
   - [1.5 Synth (Pad, Lead, Bass)](#15-synth-pad-lead-bass)
   - [1.6 Guitar (Acoustic, Electric)](#16-guitar-acoustic-electric)
   - [1.7 Flute / Wind](#17-flute--wind)
2. [Music Theory for Composition](#2-music-theory-for-composition)
   - [2.1 Song Structure](#21-song-structure)
   - [2.2 Harmony](#22-harmony)
   - [2.3 Melody](#23-melody)
   - [2.4 Rhythm](#24-rhythm)
3. [Web Audio API Implementation Details](#3-web-audio-api-implementation-details)
   - [3.1 AudioContext Setup](#31-audiocontext-setup)
   - [3.2 Scheduling](#32-scheduling)
   - [3.3 Effects](#33-effects)
   - [3.4 Continuous Playback](#34-continuous-playback)
4. [Specific Implementation Questions](#4-specific-implementation-questions)

---

## 1. Instrument Synthesis Techniques

### Synthesis methods at a glance

| Method            | Best for                                  | Web Audio building blocks                          |
|-------------------|-------------------------------------------|----------------------------------------------------|
| **Additive**      | Piano, organ, bells, marimba              | N× `OscillatorNode` (sine) → summing `GainNode`    |
| **Subtractive**   | Brass, strings, synth pad/lead/bass       | `OscillatorNode` (saw/square) → `BiquadFilterNode` |
| **FM**            | Bells, brass, electric piano, growl       | Carrier + modulator osc → `osc.frequency`          |
| **Physical model**| Plucked strings (guitar, harp, koto)      | `AudioBufferSourceNode` + feedback delay (Karplus-Strong) |
| **Noise-based**   | Drums, cymbals, breath, bow noise         | `AudioBufferSourceNode` (random) → filters         |
| **Formant**       | Voice (choir), vowels, brass mouthpieces  | Saw → parallel `BiquadFilter` (bandpass)           |
| **Wavetable-ish** | Pads, evolving textures                   | Multiple detuned osc + slow LFO on filter cutoff   |

The existing engine uses all of these except true Karplus-Strong (the current
`guitar` is subtractive sawtooth; section 1.6 shows a real K-S implementation).

---

### 1.1 Piano

#### Physics recap
- Hammer strikes 1–3 strings per note (1 in bass, 2 in tenor, 3 in treble).
- Strings are **stiff** → partials are **stretched** (inharmonic). Higher
  partials ring sharper than integer multiples of the fundamental.
- Soundboard couples string energy to air → broad resonances ~200 Hz–2 kHz.
- Long natural decay; no sustain pedal ⇒ note decays ~3–15 s depending on pitch.
- Velocity changes both **loudness** and **brightness** (harder hammer = more
  high partials).

#### Synthesis approach (additive + inharmonicity + sub)
- **8–12 sine partials** with amplitudes roughly `1/n` for the first ~6, then
  falling faster. Real pianos roll off above partial ~10.
- **Inharmonicity:** each partial `n` is tuned to `f_n = f0 · n · √(1 + B·n²)`
  where `B` is the inharmonicity coefficient. `B ≈ 0.0001` for bass strings,
  `≈ 0.0004` for mid, `≈ 0.0008` for treble. The stretch is audible on high
  notes — without it the synth sounds like an organ, not a piano.
- **Sub-octave sine** at `f0/2` for warmth in the low end (the current
  implementation already does this).
- **Hammer thunk:** tiny burst of low-passed noise (2–6 ms) at attack.
- **Stereo:** pan high partials slightly L/R for width.

#### ADSR (piano has effectively **no sustain**)
| Stage | Time          | Level        |
|-------|---------------|--------------|
| A     | 0.003–0.008 s | peak (vel)   |
| D     | 0.1–0.3 s     | vel·0.25     |
| S     | (held key)    | vel·0.25     |
| R     | 0.2–0.5 s     | 0            |

Total natural decay (key released immediately) ≈ **3 s** for mid notes,
**8–15 s** for low notes, **1–2 s** for high notes. Program the **envelope to
exponentially decay regardless of `dur`**, and let `dur` only gate the
sustain→release transition.

#### Harmonic recipe (per partial gain)
```
n:    1    2    3    4    5    6    7    8    9   10
g:  1.0  0.55 0.35 0.22 0.15 0.10 0.07 0.05 0.035 0.025
```
Velocity scales the **upper partials more than the fundamental** (brighter at
`fff`): `g_n = g_n_base · (0.5 + 0.5·vel)` for `n ≥ 4`.

#### Drop-in implementation (improved over existing FM-based piano)

```ts
// 1. PIANO — additive with inharmonicity + hammer noise + sub
const piano: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  // Inharmonicity coefficient: higher for high notes (shorter, stiffer strings)
  const B = freq > 1000 ? 0.0008 : freq > 300 ? 0.0003 : 0.0001;

  // Master envelope: fast attack, exponential decay, no real sustain
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.5, time + 0.004);       // attack
  env.gain.exponentialRampToValueAtTime(vel * 0.12, time + 0.3);    // initial decay
  const naturalDecayEnd = time + Math.max(dur, freq < 200 ? 8 : freq < 800 ? 4 : 2);
  env.gain.exponentialRampToValueAtTime(0.001, naturalDecayEnd);

  // 10 partials with inharmonicity
  const partialGains = [1, 0.55, 0.35, 0.22, 0.15, 0.10, 0.07, 0.05, 0.035, 0.025];
  partialGains.forEach((g, i) => {
    const n = i + 1;
    const fn = freq * n * Math.sqrt(1 + B * n * n);   // stretched partial
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = fn;
    // Higher partials brighter at higher velocity
    const velBright = n >= 4 ? (0.5 + 0.5 * vel) : 1;
    const pg = ctx.createGain();
    pg.gain.value = g * velBright * 0.5;
    // Per-partial decay: high partials decay faster
    pg.gain.setValueAtTime(g * velBright * 0.5, time + 0.01);
    pg.gain.exponentialRampToValueAtTime(0.0001, time + (naturalDecayEnd - time) / Math.pow(n, 0.5));
    osc.connect(pg); pg.connect(env);
    osc.start(time);
    osc.stop(naturalDecayEnd + 0.05);
  });

  // Sub-octave sine for low-register warmth
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = freq * 0.5;
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0, time);
  subG.gain.linearRampToValueAtTime(vel * 0.18, time + 0.02);
  subG.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.6);
  sub.connect(subG); subG.connect(env);
  sub.start(time); sub.stop(naturalDecayEnd + 0.05);

  // Hammer thunk: very short low-passed noise burst
  const noiseBuf = makeNoiseBuffer(ctx, 0.05);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const nFilt = ctx.createBiquadFilter();
  nFilt.type = "lowpass";
  nFilt.frequency.value = 2500;
  const nG = ctx.createGain();
  nG.gain.setValueAtTime(vel * 0.12, time);
  nG.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
  noise.connect(nFilt); nFilt.connect(nG); nG.connect(env);
  noise.start(time); noise.stop(time + 0.05);

  connectToOutputs(env, outputs);
};
```

**Why this beats the existing FM piano:** the FM version has a metallic,
bell-like quality because FM sidebands don't match real piano partial spacing.
Additive with inharmonicity is the standard for believable piano in Web Audio
(Pianoteq, etc. use physical modeling, but additive is the practical sweet
spot for code size).

---

### 1.2 Horns (Trumpet, Saxophone, French Horn)

#### Physics recap
- Player's lips / reed vibrate → cylindrical/conical bore resonates.
- Brass & reed spectra are **rich in harmonics**, dominated by odd harmonics
  at soft dynamics, filling in even harmonics at louder dynamics.
- **Formants** (fixed resonances of the bore/mouthpiece) shape the spectrum —
  these are what differentiate trumpet from sax from horn.
- Brass: bright **sawtooth** whose brightness sweeps with the lip buzz (low at
  soft pp, bright at ff).
- Sax: conical, woody, with a "growl" optional via vocal-cord modulation.

#### Formant frequencies (Hz) — F1 / F2 / F3

| Instrument    | F1    | F2    | F3    | Character              |
|---------------|-------|-------|-------|------------------------|
| Trumpet       | 800   | 1500  | 2800  | Bright, piercing       |
| Trombone      | 600   | 1100  | 2400  | Rounder than trumpet   |
| French Horn   | 400   | 900   | 2000  | Warm, mellow, covered  |
| Sax (alto)    | 500   | 1300  | 2600  | Reedy, vocal           |
| Clarinet      | 300   | 1500  | 2500  | Odd-harmonic, woody    |

#### ADSR (sustaining instruments)
| Stage | Trumpet | French Horn | Sax    |
|-------|---------|-------------|--------|
| A     | 0.04 s  | 0.08 s      | 0.05 s |
| D     | 0.08 s  | 0.15 s      | 0.10 s |
| S     | 0.85    | 0.85        | 0.80   |
| R     | 0.10 s  | 0.20 s      | 0.15 s |

Brass has a **slower-than-woodwinds attack** with a slight pitch scoop
(portamento from ~30 cents flat up to pitch over the first 30 ms).

#### Growl / flutter tongue
- **Growl:** AM at 25–35 Hz via a square LFO modulating amplitude (or a
  second oscillator 30 Hz away creating beating).
- **Flutter tongue:** faster AM ~50–80 Hz, sine-shaped, shallower depth.

#### Drop-in implementation

```ts
// Helper: brass/wind core — sawtooth + formant filters + growl
interface BrassConfig {
  formants: [number, number, number]; // F1, F2, F3
  attack: number; decay: number; sustain: number; release: number;
  growl?: number;    // Hz, 0 = none
  flutter?: number;  // Hz, 0 = none
  peakGain: number;
}

function makeBrass(cfg: BrassConfig): InstrumentFn {
  return (ctx, { freq, time, dur, vel }, outputs) => {
    const env = ctx.createGain();
    adsr(ctx, env.gain, time, dur, vel * cfg.peakGain,
         cfg.attack, cfg.decay, cfg.sustain, cfg.release);

    // Pitch scoop (lip buzz ramping up to pitch)
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq * 0.982, time);                  // ~30 cents flat
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.03);

    // Growl: amplitude modulation
    let growlGain: GainNode | null = null;
    if (cfg.growl) {
      const growl = ctx.createOscillator();
      growl.type = "sine";
      growl.frequency.value = cfg.growl;
      growlGain = ctx.createGain();
      growlGain.gain.value = 0.15;
      growl.connect(growlGain).connect(env.gain);   // modulates env gain
      growl.start(time); growl.stop(time + dur + 0.3);
    }

    // Formant filters in parallel
    const formantGains = [0.6, 0.4, 0.2];
    cfg.formants.forEach((fF, i) => {
      const filt = ctx.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = fF;
      filt.Q.value = 8;
      const g = ctx.createGain();
      g.gain.value = formantGains[i];
      osc.connect(filt); filt.connect(g); g.connect(env);
    });

    connectToOutputs(env, outputs);
    osc.start(time); osc.stop(time + dur + 0.3);
  };
}

// Register:
const trumpet    = makeBrass({ formants:[800,1500,2800], attack:0.04, decay:0.08, sustain:0.85, release:0.10, growl:30, peakGain:0.22 });
const frenchHorn = makeBrass({ formants:[400,900,2000],  attack:0.08, decay:0.15, sustain:0.85, release:0.20, peakGain:0.20 });
const sax        = makeBrass({ formants:[500,1300,2600], attack:0.05, decay:0.10, sustain:0.80, release:0.15, growl:35, peakGain:0.25 });
```

**Existing `trumpet` in sound-engine.ts** already does the growl via
frequency modulation of a 30 Hz square LFO — that's a valid alternative
(creates sidebands rather than AM). The formant-filtered version above is
more "brass-like" because formants are the perceptual signature of brass.

---

### 1.3 Strings (Violin, Cello)

#### Physics recap
- **Helmholtz motion** of the bowed string → sawtooth waveform (Slip-stick).
- Bow noise: tiny high-frequency scraping component.
- **Body resonance**: violin has strong resonances ~280 Hz (main), 450 Hz,
  600 Hz; cello ~110 Hz, 200 Hz, 350 Hz.
- **Vibrato**: 5–7 Hz, ±15 cents (±1%), delayed ~0.4 s after note onset
  (player doesn't vibrato immediately).
- Detuning 3 voices ±5 cents creates the "string section" thickness.

#### ADSR (bowed)
| Stage | Violin | Cello |
|-------|--------|-------|
| A     | 0.12 s | 0.25 s |
| D     | 0.10 s | 0.15 s |
| S     | 0.85   | 0.80   |
| R     | 0.20 s | 0.30 s |

Slower than brass — bow needs time to "catch" the string.

#### Drop-in implementation (improved over existing)

```ts
// Helper: bowed string
interface StringConfig {
  bodyResonances: number[];      // Hz
  attack: number; decay: number; sustain: number; release: number;
  vibratoRate: number; vibratoDepth: number;  // cents
  vibratoDelay: number;           // seconds before vibrato starts
  detune: number[];               // cents, e.g. [-5, 0, 5]
  peakGain: number;
  filterMult: number;             // cutoff = freq * this
}

function makeString(cfg: StringConfig): InstrumentFn {
  return (ctx, { freq, time, dur, vel }, outputs) => {
    const env = ctx.createGain();
    adsr(ctx, env.gain, time, dur, vel * cfg.peakGain,
         cfg.attack, cfg.decay, cfg.sustain, cfg.release);

    // Vibrato LFO with delayed onset
    const vibrato = ctx.createOscillator();
    vibrato.type = "sine";
    vibrato.frequency.value = cfg.vibratoRate;
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(0, time);
    vibratoGain.gain.setValueAtTime(0, time + cfg.vibratoDelay);
    vibratoGain.gain.linearRampToValueAtTime(
      freq * cfg.vibratoDepth / 1200, time + cfg.vibratoDelay + 0.4);
    vibrato.connect(vibratoGain);
    vibrato.start(time); vibrato.stop(time + dur + 0.4);

    // 3 detuned sawtooth voices + bow noise
    cfg.detune.forEach(detune => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      vibratoGain.connect(osc.frequency);

      // Bow scrape: tiny noise added in parallel
      const noise = ctx.createBufferSource();
      noise.buffer = makeNoiseBuffer(ctx, dur + 0.5);
      noise.loop = true;
      const nFilt = ctx.createBiquadFilter();
      nFilt.type = "highpass";
      nFilt.frequency.value = 3000;
      const nG = ctx.createGain();
      nG.gain.value = 0.02;

      // Body resonance: parallel bandpass filters
      const sum = ctx.createGain(); sum.gain.value = 1;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = freq * cfg.filterMult;
      lp.Q.value = 0.7;
      osc.connect(lp); lp.connect(sum);
      noise.connect(nFilt); nFilt.connect(nG); nG.connect(sum);

      cfg.bodyResonances.forEach(resF => {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = resF;
        bp.Q.value = 4;
        const g = ctx.createGain(); g.gain.value = 0.3;
        osc.connect(bp); bp.connect(g); g.connect(sum);
      });

      sum.connect(env);
      osc.start(time); noise.start(time);
      osc.stop(time + dur + 0.4); noise.stop(time + dur + 0.4);
    });

    connectToOutputs(env, outputs);
  };
}

const violin = makeString({
  bodyResonances: [280, 450, 600], attack: 0.12, decay: 0.10,
  sustain: 0.85, release: 0.20,
  vibratoRate: 6, vibratoDepth: 15, vibratoDelay: 0.4,
  detune: [-5, 0, 5], peakGain: 0.20, filterMult: 5,
});
const cello = makeString({
  bodyResonances: [110, 200, 350], attack: 0.25, decay: 0.15,
  sustain: 0.80, release: 0.30,
  vibratoRate: 5, vibratoDepth: 18, vibratoDelay: 0.5,
  detune: [-4, 0, 4], peakGain: 0.25, filterMult: 3,
});
```

---

### 1.4 Drums (Kick, Snare, Hi-hat, Cymbal)

> The existing engine has `timpani` and `cymbal` but no kick/snare/hi-hat.
> These four together form a full drum kit — essential for any rhythm section.

#### Kick drum
- **Sine sweep** from ~120 Hz down to ~45 Hz over 50 ms (the "thud").
- **Click**: short 1–3 ms burst of high-passed noise at the very start (beater
  attack).
- **Pitch envelope**: `osc.frequency.setValueAtTime(120, t)` →
  `exponentialRampToValueAtTime(45, t + 0.05)`.
- **Amplitude**: 2 ms attack, exponential decay to silence in ~0.3 s.

#### Snare drum
- Two components in parallel:
  1. **Tone**: triangle/sine at ~180–220 Hz, short decay (0.1 s).
  2. **Noise**: white noise through high-pass (~1.5 kHz), decay 0.15 s.
- The noise is what makes it a "snare" (the snares vibrating against the
  bottom head). Without noise it's just a tom.

#### Hi-hat
- **White noise** through a **high-pass filter at ~7 kHz** (closed) or ~5 kHz
  (open).
- Closed: 40 ms decay. Open: 300 ms decay. Pedal: 80 ms.
- Tiny metallic ring: add 3–4 square oscillators at inharmonic frequencies
  (e.g. `f·1.5, f·2.3, f·3.1`).

#### Cymbal (already in engine, but enhanced here)
- Noise + multiple **bandpass filters at inharmonic frequencies** (the cymbal's
  modes). Real cymbals have 20+ audible modes; 5–6 is enough for code.
- Long decay (1–3 s), with a sharp attack.

#### Drop-in implementations

```ts
// KICK — sine sweep + click
const kick: InstrumentFn = (ctx, { time, vel }, outputs) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.05);
  const env = ctx.createGain();
  env.gain.setValueAtTime(vel * 0.9, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
  osc.connect(env);

  // Click
  const click = ctx.createBufferSource();
  click.buffer = makeNoiseBuffer(ctx, 0.01);
  const cFilt = ctx.createBiquadFilter();
  cFilt.type = "highpass"; cFilt.frequency.value = 1500;
  const cG = ctx.createGain();
  cG.gain.setValueAtTime(vel * 0.4, time);
  cG.gain.exponentialRampToValueAtTime(0.001, time + 0.005);
  click.connect(cFilt); cFilt.connect(cG); cG.connect(env);

  connectToOutputs(env, outputs);
  osc.start(time); click.start(time);
  osc.stop(time + 0.4); click.stop(time + 0.02);
};

// SNARE — tone + noise
const snare: InstrumentFn = (ctx, { freq = 220, time, vel }, outputs) => {
  const env = ctx.createGain();
  env.gain.setValueAtTime(vel * 0.6, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  // Tone
  const osc = ctx.createOscillator();
  osc.type = "triangle"; osc.frequency.value = freq;
  const oG = ctx.createGain(); oG.gain.value = 0.5;
  osc.connect(oG); oG.connect(env);

  // Noise (the snares)
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.2);
  const nFilt = ctx.createBiquadFilter();
  nFilt.type = "highpass"; nFilt.frequency.value = 1500;
  const nG = ctx.createGain();
  nG.gain.setValueAtTime(vel * 0.7, time);
  nG.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  noise.connect(nFilt); nFilt.connect(nG); nG.connect(env);

  connectToOutputs(env, outputs);
  osc.start(time); noise.start(time);
  osc.stop(time + 0.2); noise.stop(time + 0.2);
};

// HI-HAT — filtered noise (closed/open via dur)
const hihat: InstrumentFn = (ctx, { time, dur, vel }, outputs) => {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, dur + 0.1); noise.loop = true;
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass"; hpf.frequency.value = 7000;
  const env = ctx.createGain();
  env.gain.setValueAtTime(vel * 0.3, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur);
  // Metallic ring
  [1.5, 2.3, 3.1, 4.7].forEach(r => {
    const osc = ctx.createOscillator();
    osc.type = "square"; osc.frequency.value = 800 * r;
    const g = ctx.createGain(); g.gain.value = 0.015;
    osc.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur + 0.05);
  });
  noise.connect(hpf); hpf.connect(env);
  connectToOutputs(env, outputs);
  noise.start(time); noise.stop(time + dur + 0.05);
};
```

#### Standard drum patterns (16-step grids, x = hit)

```
4/4 rock/pop (kick & snare on 2 & 4):
Beat:  1 . . . 2 . . . 3 . . . 4 . . .
Kick:  x . . . . . . . x . . . . . . .
Snare: . . . . x . . . . . . . x . . .
Hat:   x . x . x . x . x . x . x . x .

Hip-hop (syncopated kick):
Beat:  1 . . . 2 . . . 3 . . . 4 . . .
Kick:  x . . . . . x . x . . . . . . .
Snare: . . . . x . . . . . . . x . . .
Hat:   x . x . x . x . x . x . x . x x

Waltz (3/4):
Beat:  1 . . 2 . . 3 . .
Kick:  x . . . . . . . .
Snare: . . . x . . . . .
Hat:   x . . x . . x . .

Boom-bap (extra snare ghost notes):
Beat:  1 . . . 2 . . . 3 . . . 4 . . .
Kick:  x . . . . . . . x . x . . . . .
Snare: . . . . x . . x . . . . x . . x
Hat:   x . x . x . x . x . x . x . x .
```

Encode as a `boolean[16]` per drum, iterate at 16th-note intervals.

---

### 1.5 Synth (Pad, Lead, Bass)

#### Subtractive synthesis (the core technique)
1. Start with harmonically rich waveform: **sawtooth** (all harmonics) or
   **square** (odd harmonics).
2. **Detune multiple oscillators** (unison) — 3–7 voices ±5 to ±20 cents.
3. **Filter** with `BiquadFilterNode` (lowpass) — this is the "tone color" knob.
4. **Filter envelope**: cutoff sweeps from low → high → low over the note's
   lifetime (the "wow" factor).
5. **LFO** on cutoff or pitch for movement.
6. **Amplitude ADSR**.

#### Pad (slow, evolving, lush)
- 3–5 sawtooth voices, detuned ±7 cents, possibly with octaves (0, +12).
- **Slow attack (0.5–2 s)**, long sustain, slow release.
- **Filter sweep**: cutoff 200 Hz → 2000 Hz → 800 Hz over note duration.
- **Slow LFO** (0.1–0.5 Hz) on cutoff for "shimmer".
- Optional chorus (see section 3.3).

#### Lead (bright, punchy, monophonic)
- 2 slightly detuned oscillators (square + saw).
- Fast attack (0.005–0.02 s), medium decay/release.
- Bright filter at cutoff ~`freq * 8`.
- Optional glide (portamento) between notes.

#### Bass (deep, sub)
- Sine fundamental + triangle sub-octave (already in engine).
- Optional sawtooth layer for "character" through a lowpass at `freq * 2`.
- Fast attack, medium sustain, fast release (so it doesn't muddy the mix).

#### Drop-in pad (improved with filter envelope + LFO shimmer)

```ts
const pad: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(vel * 0.12, time + 1.2);       // slow attack
  env.gain.linearRampToValueAtTime(vel * 0.10, time + dur * 0.7);
  env.gain.exponentialRampToValueAtTime(0.001, time + dur);

  // Slow LFO modulating the filter cutoff for movement
  const lfo = ctx.createOscillator();
  lfo.type = "sine"; lfo.frequency.value = 0.25;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 400;
  lfo.connect(lfoGain); lfo.start(time); lfo.stop(time + dur + 0.5);

  // Unison: 3 detuned sawtooth voices across an octave
  [-7, 0, 7, 0, 1200 /* +1 oct in cents */].forEach((cents, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = cents;
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(300, time);
    filt.frequency.linearRampToValueAtTime(2200, time + dur * 0.4);
    filt.frequency.linearRampToValueAtTime(900, time + dur * 0.9);
    filt.Q.value = 1.5;
    lfoGain.connect(filt.frequency);
    const g = ctx.createGain(); g.gain.value = 0.25 / Math.sqrt(i + 1);
    osc.connect(filt); filt.connect(g); g.connect(env);
    osc.start(time); osc.stop(time + dur + 0.5);
  });

  connectToOutputs(env, outputs);
};
```

---

### 1.6 Guitar (Acoustic, Electric)

#### Karplus-Strong physical modeling (the canonical approach)
- Excite a **short noise burst** into a **delay line** whose delay time = `1/freq`.
- The delay line has a **feedback loop through a low-pass filter** (averaging
  adjacent samples) → high frequencies decay faster than low → naturally
  produces the plucked-string spectrum.
- Very cheap, very realistic — far better than the sawtooth approach.

#### Web Audio implementation
- Use a `DelayNode` with `delayTime = 1/freq`.
- Feedback path through a `BiquadFilter` (lowpass, ~`freq * 3`).
- Excite with a short noise burst into the delay input.
- Feedback gain < 1.0 controls decay time (~0.996 for long, ~0.95 for staccato).

```ts
// KARPLUS-STRONG plucked string
const guitarAcoustic: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 1 / freq;

  // Feedback lowpass — averages samples, models string damping
  const feedbackFilter = ctx.createBiquadFilter();
  feedbackFilter.type = "lowpass";
  feedbackFilter.frequency.value = freq * 3;
  feedbackFilter.Q.value = 0.5;

  const feedbackGain = ctx.createGain();
  // Higher freq → shorter decay (real strings behave this way)
  const decay = freq < 200 ? 0.998 : freq < 600 ? 0.996 : 0.992;
  feedbackGain.gain.value = decay;

  // Excitation: short noise burst (the "pluck")
  const excite = ctx.createBufferSource();
  const eBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const eData = eBuf.getChannelData(0);
  for (let i = 0; i < eData.length; i++) {
    eData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
  }
  excite.buffer = eBuf;

  const pluckGain = ctx.createGain();
  pluckGain.gain.value = vel * 0.5;

  // Wire: excite → delay → filter → feedbackGain → delay (loop)
  //       delay → output
  excite.connect(pluckGain);
  pluckGain.connect(delay);
  delay.connect(feedbackFilter);
  feedbackFilter.connect(feedbackGain);
  feedbackGain.connect(delay);
  delay.connect(outputs[0]);  // also goes to reverb if passed
  outputs.slice(1).forEach(o => delay.connect(o));

  // Body resonance for acoustic (parallel bandpass filters)
  [110, 220, 440].forEach(resF => {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = resF; bp.Q.value = 3;
    const g = ctx.createGain(); g.gain.value = 0.3;
    delay.connect(bp); bp.connect(g); g.connect(outputs[0]);
  });

  // Stop everything after the natural decay
  const stopTime = time + Math.max(dur, 3);
  excite.start(time); excite.stop(time + 0.1);
  // Delay & filters stay alive — but they'll be silent once feedback dies.
  // Cleanup via stop is tricky; rely on garbage collection after disconnect.
};

// ELECTRIC GUITAR — Karplus-Strong + distortion
const guitarElectric: InstrumentFn = (ctx, params, outputs) => {
  // Create an intermediate gain to tap the dry signal
  const preDist = ctx.createGain(); preDist.gain.value = 1;
  // Distortion: WaveShaperNode
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = Math.tanh(x * 4);  // soft clip
  }
  shaper.curve = curve;
  shaper.oversample = "4x";

  const postFilt = ctx.createBiquadFilter();
  postFilt.type = "lowpass"; postFilt.frequency.value = 3000;

  // Run Karplus-Strong into preDist instead of outputs
  guitarAcoustic(ctx, params, [preDist]);
  preDist.connect(shaper); shaper.connect(postFilt);
  outputs.forEach(o => postFilt.connect(o));
};
```

#### Distortion curves (for electric)
| Curve            | Formula                  | Sound            |
|------------------|--------------------------|------------------|
| Soft clip (tanh) | `tanh(k·x) / tanh(k)`    | Warm overdrive   |
| Hard clip        | `Math.max(-1, Math.min(1, x·k))` | Fuzz       |
| Cubic            | `x - x³/3`               | Tube-like        |
| Foldback         | if `|x|>1`, mirror       | Aggressive metal |

`WaveShaperNode.oversample = "4x"` reduces aliasing artifacts.

---

### 1.7 Flute / Wind

#### Physics recap
- Air jet hits edge → oscillation → cylindrical/conical bore resonates.
- Spectrum is **mostly sine** (weak harmonics) at soft dynamics, richer at
  louder dynamics.
- **Breath noise** mixed in (especially at attack).
- **Vibrato**: 5 Hz, ±10 cents, starting after ~0.3 s.

#### ADSR (wind)
| Stage | Flute | Clarinet | Oboe |
|-------|-------|----------|------|
| A     | 0.08  | 0.06     | 0.04 |
| D     | 0.05  | 0.08     | 0.06 |
| S     | 0.90  | 0.85     | 0.80 |
| R     | 0.10  | 0.15     | 0.10 |

Woodwinds have **faster attacks than brass** (no lip buzz to ramp up).

#### Drop-in implementation (enhanced from existing `flute`)

```ts
const flute: InstrumentFn = (ctx, { freq, time, dur, vel }, outputs) => {
  const env = ctx.createGain();
  adsr(ctx, env.gain, time, dur, vel * 0.25, 0.08, 0.05, 0.90, 0.10);

  // Sine fundamental + weak 2nd harmonic
  const osc = ctx.createOscillator();
  osc.type = "sine"; osc.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = 0.8;
  osc.connect(g); g.connect(env);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine"; osc2.frequency.value = freq * 2;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.0, time);
  g2.gain.linearRampToValueAtTime(0.15 * vel, time + 0.2);  // grows with breath
  osc2.connect(g2); g2.connect(env);

  // Vibrato (delayed onset)
  const vibrato = ctx.createOscillator();
  vibrato.type = "sine"; vibrato.frequency.value = 5;
  const vG = ctx.createGain();
  vG.gain.setValueAtTime(0, time);
  vG.gain.setValueAtTime(0, time + 0.3);
  vG.gain.linearRampToValueAtTime(freq * 10 / 1200, time + 0.7);
  vibrato.connect(vG); vG.connect(osc.frequency); vG.connect(osc2.frequency);
  vibrato.start(time); vibrato.stop(time + dur + 0.2);

  // Breath noise (bandpass centered on the fundamental)
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, dur + 0.5); noise.loop = true;
  const nFilt = ctx.createBiquadFilter();
  nFilt.type = "bandpass"; nFilt.frequency.value = freq * 2; nFilt.Q.value = 0.7;
  const nG = ctx.createGain();
  nG.gain.setValueAtTime(0.08 * vel, time);
  nG.gain.linearRampToValueAtTime(0.04 * vel, time + 0.1);
  noise.connect(nFilt); nFilt.connect(nG); nG.connect(env);

  connectToOutputs(env, outputs);
  osc.start(time); osc2.start(time); noise.start(time);
  osc.stop(time + dur + 0.2); osc2.stop(time + dur + 0.2); noise.stop(time + dur + 0.2);
};
```

---

## 2. Music Theory for Composition

### 2.1 Song Structure

#### Common structures
| Structure | Pattern                 | Use case                          |
|-----------|-------------------------|-----------------------------------|
| Verse-Chorus | `V C V C B C`         | Pop, rock, most radio songs       |
| AABA       | `A A B A` (32-bar)     | Jazz standards, American songbook |
| ABAB       | `A B A B`              | Simple folk, hymns                |
| Through-composed | continuous, no repeat | Art song, film score           |
| Rondo      | `A B A C A`            | Classical, some prog rock         |
| Verse-Chorus-Bridge-Outro | `V C V C B C C` | Modern pop          |

#### 3-minute song = how many sections?
At 120 BPM (2 beats/sec, 4/4), one bar = 2 s. So:
- 3 min = 180 s = **90 bars** at 4/4.
- Verse: 8 bars (16 s) × 2 verses = 32 bars
- Chorus: 8 bars × 3 choruses = 24 bars
- Bridge: 8 bars
- Intro/outro: 8 + 8 = 16 bars
- Total: 32 + 24 + 8 + 16 = 80 bars ≈ 2:40 (add a 4-bar pre-chorus or 8-bar
  instrumental to hit 3:00 exactly).

#### Procedural structure generator

```ts
type SectionType = "intro" | "verse" | "prechorus" | "chorus" | "bridge" | "outro";

interface Section { type: SectionType; bars: number; energy: number; /* 0-1 */ }

const SONG_TEMPLATES: Section[][] = [
  // Pop
  [{type:"intro",bars:4,energy:0.3},{type:"verse",bars:8,energy:0.5},
   {type:"chorus",bars:8,energy:0.9},{type:"verse",bars:8,energy:0.5},
   {type:"chorus",bars:8,energy:0.9},{type:"bridge",bars:8,energy:0.7},
   {type:"chorus",bars:8,energy:1.0},{type:"outro",bars:4,energy:0.4}],
  // AABA jazz
  [{type:"intro",bars:4,energy:0.4},{type:"verse",bars:8,energy:0.6},
   {type:"verse",bars:8,energy:0.6},{type:"bridge",bars:8,energy:0.8},
   {type:"verse",bars:8,energy:0.7},{type:"outro",bars:4,energy:0.4}],
];

function planSong(targetSeconds: number, bpm: number): Section[] {
  const secPerBar = (60 / bpm) * 4;
  const totalBars = Math.round(targetSeconds / secPerBar);
  const tpl = SONG_TEMPLATES[Math.floor(Math.random() * SONG_TEMPLATES.length)];
  // Trim or extend to hit targetBars
  // ...
  return tpl;
}
```

#### Transitions between sections
- **Fill**: 1-bar drum fill at the end of a section leading into the next.
- **Riser**: white noise sweep up (high-pass filter sweep 200 Hz → 8 kHz over 4
  bars) before a chorus drop.
- **Drop**: sudden texture reduction (e.g. just kick + vocal) for 1 bar.
- **Key change**: modulate up a whole step (+2 semitones) for final chorus —
  the classic pop "truck driver's gear change".
- **Energy ramp**: gradually add instruments across 4 bars approaching a
  chorus (kick enters at bar 1, snare at bar 2, hi-hat at bar 3, full at bar 4).

---

### 2.2 Harmony

#### Mood → key + scale + progression

| Mood          | Key suggestion   | Scale      | Progression (in scale degrees)        |
|---------------|------------------|------------|---------------------------------------|
| Romantic      | Eb, Ab, Bb major | Major      | I – vi – IV – V                       |
| Adventurous   | D, A major       | Major      | I – V – vi – IV                       |
| Peaceful      | C, G, F major    | Major pentatonic | I – IV – I – V                  |
| Mysterious    | D, F# minor      | Minor      | i – VI – III – VII                    |
| Sad           | A, E minor       | Minor      | i – iv – i – V (harmonic minor on V)  |
| Tense         | C# minor         | Phrygian   | i – bII – i – bII                     |
| Hopeful       | G, D major       | Lydian     | I – II – I – V                        |
| Epic/heroic   | D minor → D major| Minor→Major| i – VII – VI – VII → I – V – vi – IV  |

#### Common progressions (with chord names in C major)
| Name              | Numerals         | In C major              | Mood            |
|-------------------|------------------|-------------------------|-----------------|
| Pop punk          | I – V – vi – IV  | C – G – Am – F          | Upbeat, anthemic|
| Singer-songwriter | vi – IV – I – V  | Am – F – C – G          | Yearning        |
| Doo-wop           | I – vi – IV – V  | C – Am – F – G          | Nostalgic       |
| Jazz turnaround   | ii – V – I       | Dm7 – G7 – Cmaj7        | Resolving, jazz |
| Andalusian        | i – VII – VI – V | Am – G – F – E          | Flamenco, dark  |
| Pachelbel         | I – V – vi – iii – IV – I – IV – V | C-G-Am-Em-F-C-F-G | Classical |

#### Generating chord progressions in code

```ts
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];           // semitone offsets
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Diatonic triad qualities by scale degree (major scale)
// I ii iii IV V vi vii°
const MAJOR_TRIAD_QUALITIES = ["maj", "min", "min", "maj", "maj", "min", "dim"];

function buildChord(rootMidi: number, scaleDegree: number, scale: number[],
                    qualities: string[]): number[] {
  const root = rootMidi + scale[scaleDegree - 1];
  const third = rootMidi + scale[(scaleDegree + 1) % 7] +
                (scaleDegree + 1 > 6 ? 12 : 0);
  const fifth = rootMidi + scale[(scaleDegree + 3) % 7] +
                (scaleDegree + 3 > 6 ? 12 : 0);
  return [root, third, fifth];
}

// Markov chain for natural-sounding progressions
const PROGRESSION_MARKOV: Record<number, number[]> = {
  1: [4, 5, 6, 2],          // I → IV, V, vi, ii
  2: [5],                   // ii → V
  3: [6, 4],                // iii → vi, IV
  4: [5, 1, 2],             // IV → V, I, ii
  5: [1, 6],                // V → I, vi
  6: [4, 2, 5],             // vi → IV, ii, V
  7: [1],                   // vii° → I
};

function generateProgression(bars: number, startDegree = 1): number[] {
  const out = [startDegree];
  for (let i = 1; i < bars; i++) {
    const choices = PROGRESSION_MARKOV[out[i - 1]];
    out.push(choices[Math.floor(Math.random() * choices.length)]);
  }
  return out;
}
```

#### Key modulation techniques
- **Pivot chord** modulation: find a chord common to both keys, use it as a
  bridge (e.g. C major → G major: C is I in C, IV in G).
- **Direct modulation**: just change key without preparation (pop's "gear
  change").
- **Sequence modulation**: repeat a phrase up a whole step, then continue in
  the new key.
- **Common-tone modulation**: hold a single note across the modulation
  boundary.

In code, modulation = change the `rootMidi` passed to `buildChord`.

---

### 2.3 Melody

#### Generating melodies over chords

```ts
interface MelodyOptions {
  scale: number[];           // semitone offsets
  rootMidi: number;
  chordTones: number[];      // current chord (MIDI note numbers)
  prevNote?: number;         // for contour continuity
  rhythm: number[];          // beat durations, e.g. [1, 0.5, 0.5, 1]
}

function generateMelodyNote(opts: MelodyOptions, beatIdx: number): number {
  const { scale, rootMidi, chordTones, prevNote } = opts;
  const onDownbeat = beatIdx % 2 === 0;

  if (onDownbeat) {
    // 70% chance to land on a chord tone for downbeats
    if (Math.random() < 0.7) {
      return chordTones[Math.floor(Math.random() * chordTones.length)];
    }
  }

  // Otherwise pick a scale tone, prefer stepwise motion from prevNote
  if (prevNote !== undefined && Math.random() < 0.6) {
    const step = Math.random() < 0.5 ? 1 : -1;
    return prevNote + scale[1] * step;   // a step up or down
  }

  // Random scale tone within an octave
  const deg = Math.floor(Math.random() * scale.length);
  return rootMidi + scale[deg];
}
```

#### Tension / resolution principles
- **Chord tones** (1, 3, 5) = stable, resolving.
- **Non-chord tones** (2, 4, 6, 7) = tension.
  - **Passing tone**: between two chord tones by step.
  - **Suspension**: held note from previous chord, then resolves down by step.
  - **Appoggiatura**: leap to non-chord tone on strong beat, resolve by step.
  - **Anticipation**: arrive at next chord's tone before the chord changes.
- **Leaps** (intervals > 3rd) create tension → usually followed by step in
  opposite direction.

#### Motif development
1. **Repetition**: play the motif again verbatim.
2. **Variation**: change one note / rhythm.
3. **Sequence**: transpose the motif up or down (e.g. up a 3rd).
4. **Inversion**: flip the contour (up↔down).
5. **Retrograde**: play it backwards.
6. **Augmentation**: double all durations.
7. **Diminution**: halve all durations.

```ts
function motifVariations(motif: number[]): number[][] {
  return [
    motif,
    motif.map(n => n + 4),                          // sequence up a 3rd
    motif.slice().reverse(),                        // retrograde
    motif.map((n, i) => i === 0 ? n : -motif[i-1] + n), // inversion (approx)
  ];
}
```

#### Scales for moods
| Scale          | Semitones                    | Mood                  |
|----------------|------------------------------|-----------------------|
| Major          | 0 2 4 5 7 9 11               | Happy, bright         |
| Natural minor  | 0 2 3 5 7 8 10               | Sad, dark             |
| Harmonic minor | 0 2 3 5 7 8 11               | Exotic, dramatic      |
| Melodic minor  | 0 2 3 5 7 9 11 (up)          | Jazz, sophisticated   |
| Major pentatonic | 0 2 4 7 9                  | Peaceful, folk, Asian |
| Minor pentatonic | 0 3 5 7 10                 | Blues, rock           |
| Dorian         | 0 2 3 5 7 9 10              | Jazzy minor, hopeful  |
| Phrygian       | 0 1 3 5 7 8 10              | Spanish, dark         |
| Lydian         | 0 2 4 6 7 9 11              | Dreamy, hopeful (#4)  |
| Mixolydian     | 0 2 4 5 7 9 10              | Bluesy, folk          |
| Whole-tone     | 0 2 4 6 8 10                | Dreamy, impressionist |

**Pentatonic** is foolproof — every note fits every chord in the key, so it's
great for procedural generation (no dissonance possible).

---

### 2.4 Rhythm

#### Time signatures
| Signature | Feel            | Beats per bar | Common uses                |
|-----------|-----------------|---------------|----------------------------|
| 4/4       | Common time     | 4 quarter     | Most pop, rock, jazz       |
| 3/4       | Waltz           | 3 quarter     | Waltzes, ballads           |
| 6/8       | Compound duple  | 2 dotted-qtr  | Irish, sea shanties, pop   |
| 2/4       | March           | 2 quarter     | Marches, polkas            |
| 5/4       | Asymmetric      | 5 quarter     | Take Five, prog            |
| 7/8       | Asymmetric      | 7 eighth      | Balkan, prog               |

#### Genre drum patterns (kick/snare/hat on 16-step grid)
```
Rock:      K x . . . . . . K . . . . . . .
           S . . . x . . . . . . . x . . .
           H x . x . x . x . x . x . x . x

Pop:       K x . . . . . . x . . . . . . .
           S . . . x . . . . . . . x . . .
           H x . x . x . x . x . x . x . x

Funk:      K x . . . . x . . . x . . . . .
           S . . . x . . . . . x . x . . .
           H x x x x x x x x x x x x x x x x

Reggae:    K . . . . . . . x . . . . . . .
           S . . . x . . . . . . . x . . .
           H x . x . x . x . x . x . x . x

Trap:      K x . . . . x . . . . . x . . .
           S . . . x . . . . . . . x . . .
           H x x x x x x x x x x x x x x x x (rolling 1/32)
```

#### Syncopation techniques
1. **Off-beat 8ths**: hit on the "and" of beats (`2 and 3 and`), not on the
   beat.
2. **Anticipation**: hit 1 eighth before a strong beat.
3. **Suspension**: hold a note past the strong beat.
4. **Hemiola**: 3-against-2 (e.g. in 4/4, accent beats 1, 2.66, 4.33).
5. **Back-beat**: snare on beats 2 & 4 (the foundation of rock).

#### Tempo mapping by mood
| Mood          | BPM range | Subdivision       |
|---------------|-----------|-------------------|
| Funeral dirge | 50–60     | Quarter, slow 8th |
| Ballad        | 60–80     | Quarter, 8th      |
| Hip-hop       | 80–95     | 8th, 16th swing   |
| Pop/rock      | 110–130   | 8th, 16th         |
| Dance/EDM     | 120–130   | 16th, four-on-floor |
| Drum & bass   | 160–180   | 16th, breakbeats  |
| Punk          | 160–200   | 8th, fast         |

#### Tempo ramping for emotional build
```ts
// Linear ramp from 90 to 120 BPM over 60 seconds
function rampBpm(startBpm: number, endBpm: number, durSec: number,
                 ctx: AudioContext): number[] {
  const samples = Math.floor(durSec * 30);  // 30 updates/sec
  return Array.from({ length: samples }, (_, i) =>
    startBpm + (endBpm - startBpm) * (i / samples));
}
```
Web Audio can't directly change BPM mid-composition (it's a virtual construct
on top of `currentTime`); schedule notes with their own absolute times so BPM
changes just affect future note scheduling.

---

## 3. Web Audio API Implementation Details

### 3.1 AudioContext Setup

#### Best practices
1. **Create lazily** — don't construct `AudioContext` at module load; do it on
   the first user gesture. The existing `SoundEngine.ensureContext()` does this
   correctly.
2. **Always check `state === "suspended"`** after creation and call
   `ctx.resume()`. Browsers create the context in `suspended` state until a
   user gesture unlocks it.
3. **Handle the autoplay policy** by attaching the resume to a user-gesture
   listener (`click`, `keydown`, `touchstart`).
4. **Never create more than one AudioContext.** One context can drive hundreds
   of nodes. The existing singleton pattern (`getSoundEngine()`) is correct.
5. **Always route through a `DynamicsCompressorNode`** before the destination
   to prevent clipping when many notes overlap.
6. **Use `webkitAudioContext` fallback** for very old Safari (the existing code
   does this).

```ts
// Robust AudioContext creation
class AudioContextManager {
  private ctx: AudioContext | null = null;

  async ensure(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  /** Call from a user-gesture handler (click, keydown) to unlock audio. */
  unlockOnGesture() {
    const handler = async () => {
      await this.ensure();
      // Optionally play a silent buffer to "prime" iOS
      const ctx = this.ctx!;
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination);
      src.start(0);
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("click", handler);
    window.addEventListener("touchstart", handler);
    window.addEventListener("keydown", handler);
  }
}
```

#### iOS Safari quirks
- iOS **kills the AudioContext when the screen locks**. Listen for
  `visibilitychange` and resume on return:
  ```ts
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && this.ctx?.state === "suspended") {
      this.ctx.resume();
    }
  });
  ```
- iOS requires a **playback of a silent buffer within the user gesture** for
  audio to work later. See `unlockOnGesture()` above.

#### Memory management
- **Always call `osc.stop(t)` and `osc.disconnect()`** — Web Audio won't GC
  running nodes. The existing code stops oscillators correctly.
- **Reuse buffers** for noise — don't generate a new noise buffer per note.
  Cache one 4-second buffer and use `loop = true`.
- **Limit polyphony** — a piano piece with 1000 simultaneous sine oscillators
  will peg the CPU. Either cap voice count (drop quietest) or use a single
  periodic-wave oscillator with all harmonics baked in.
- **Watch `AudioParam` event lists** — calling `setValueAtTime` thousands of
  times can accumulate. Use `cancelScheduledValues(now)` before scheduling a
  fresh envelope.

---

### 3.2 Scheduling

#### The lookahead scheduler (the canonical Web Audio pattern)

The naive approach — `setTimeout(playNote, beatTime)` — **drifts** because
`setTimeout` is jittery and JS is single-threaded. The correct pattern,
documented by Chris Wilson's "A Tale of Two Clocks":

1. **Two timers**: a JS setInterval (the "drawing clock") running every 25 ms,
   and the AudioContext's `currentTime` (the "audio clock").
2. **Lookahead**: schedule any note whose time falls within the next 100 ms.
3. **Never reschedule** already-scheduled notes.

```ts
class Scheduler {
  private ctx: AudioContext;
  private notes: CompositionNote[];
  private nextNoteIdx = 0;
  private currentNote: number = 0;          // current beat
  private nextNoteTime: number = 0;         // absolute audio time
  private lookahead = 25;                    // ms (JS timer)
  private scheduleAheadTime = 0.1;          // s (schedule notes 100ms ahead)
  private secondsPerBeat: number;
  private timerID: number | null = null;
  private onNote?: (beat: number, time: number) => void;

  constructor(ctx: AudioContext, bpm: number, notes: CompositionNote[]) {
    this.ctx = ctx;
    this.notes = notes;
    this.secondsPerBeat = 60 / bpm;
    this.nextNoteTime = ctx.currentTime + 0.05;
  }

  start() {
    this.scheduler();
  }

  stop() {
    if (this.timerID) clearTimeout(this.timerID);
    this.timerID = null;
  }

  private scheduler = () => {
    // While the next note falls within the lookahead window, schedule it
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentNote, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(this.scheduler, this.lookahead);
  };

  private scheduleNote(beat: number, time: number) {
    // Find all notes that should start at this beat
    // (In practice you'd index notes by beat for O(1) lookup)
    this.onNote?.(beat, time);
  }

  private nextNote() {
    const secondsPerBeat = this.secondsPerBeat;
    this.nextNoteTime += secondsPerBeat / 4;  // 16th notes
    this.currentNote++;
  }
}
```

The existing `SoundEngine.scheduleLoop()` takes a simpler approach: it
schedules **the entire loop's notes** at once (synchronously) when the loop
starts. This works for short loops (< 30 s) because Web Audio handles the
timing precisely. For a 3-minute composition, scheduling all notes up-front is
**fine** — the audio graph is just nodes with `start(t)` calls; the browser
doesn't render them until their start time. The lookahead pattern is only
needed if you're generating notes on the fly (procedurally, indefinitely).

#### Looping a composition seamlessly

The existing code does this correctly:
```ts
private scheduleLoop() {
  const startTime = this.ctx.currentTime + 0.1;
  this.currentComposition.notes.forEach(n => this.playNote(n, startTime));
  this.loopTimeout = setTimeout(() => {
    if (this.isPlaying) this.scheduleLoop();
  }, this.currentComposition.duration * 1000);
}
```

**Subtle bug to watch:** if the last note's release extends past
`composition.duration`, the next loop's first note will overlap with the
previous loop's tail. Two fixes:
1. Set `duration` to include the longest note's release tail (the existing
   code does this — `32 * b + 2` etc.).
2. Use **crossfading loops**: schedule the next loop's notes to start exactly
   when the previous loop's last note's sustain ends, with a 50 ms overlap.

#### Sample-accurate metronome/clock

```ts
class Metronome {
  private ctx: AudioContext;
  private bpm = 120;
  private currentBeat = 0;
  private nextBeatTime = 0;
  private timer: number | null = null;
  private accent: boolean = true;

  constructor(ctx: AudioContext) { this.ctx = ctx; }

  start() {
    this.currentBeat = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.05;
    this.tick();
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private tick = () => {
    while (this.nextBeatTime < this.ctx.currentTime + 0.1) {
      this.scheduleClick(this.currentBeat, this.nextBeatTime);
      this.nextBeatTime += 60 / this.bpm;
      this.currentBeat = (this.currentBeat + 1) % 4;
    }
    this.timer = window.setTimeout(this.tick, 25);
  };

  private scheduleClick(beat: number, time: number) {
    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = beat === 0 && this.accent ? 1500 : 1000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.3, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(time); osc.stop(time + 0.04);
  }
}
```

---

### 3.3 Effects

#### Reverb (ConvolverNode with synthesized impulse)

The existing `createImpulseResponse()` is correct. Improvements:

```ts
function createImpulseResponse(ctx: AudioContext, duration = 3,
                                decay = 2.5, stereo = true): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(stereo ? 2 : 1, length, rate);
  for (let ch = 0; ch < (stereo ? 2 : 1); ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      // Decaying random noise + early reflections for realism
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return impulse;
}
```

**Impulse response shapes:**
| Room            | Duration (s) | Decay | Sound         |
|-----------------|--------------|-------|---------------|
| Small room      | 0.5          | 2.0   | Tight         |
| Medium hall     | 2.0          | 2.5   | Natural       |
| Large cathedral | 6.0          | 3.0   | Lush, ethereal|
| Plate           | 2.0          | 1.5   | Bright, metallic |

For more realism, mix a few **early reflection** impulses (distinct spikes at
20, 35, 50 ms) before the diffuse tail.

#### Delay (with feedback)

```ts
function createDelay(ctx: AudioContext, time = 0.3, feedback = 0.4,
                     wet = 0.3): { input: AudioNode; output: AudioNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const delay = ctx.createDelay(2);
  delay.delayTime.value = time;
  const fb = ctx.createGain(); fb.gain.value = feedback;
  const wetGain = ctx.createGain(); wetGain.gain.value = wet;
  const dryGain = ctx.createGain(); dryGain.gain.value = 1 - wet;

  input.connect(dryGain); dryGain.connect(output);
  input.connect(delay);
  delay.connect(fb); fb.connect(delay);  // feedback loop
  delay.connect(wetGain); wetGain.connect(output);
  return { input, output };
}
```

**Ping-pong delay** (stereo): two delay nodes, one panned L→R, one R→L, with
cross-feedback.

#### Chorus (delay with LFO modulation)

```ts
function createChorus(ctx: AudioContext, rate = 1.5, depth = 0.003,
                      wet = 0.4): { input: AudioNode; output: AudioNode } {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const delay = ctx.createDelay(0.1);
  delay.delayTime.value = 0.025;
  const lfo = ctx.createOscillator();
  lfo.type = "sine"; lfo.frequency.value = rate;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = depth;  // 3 ms depth
  lfo.connect(lfoGain); lfoGain.connect(delay.delayTime);
  lfo.start();

  const wetGain = ctx.createGain(); wetGain.gain.value = wet;
  const dryGain = ctx.createGain(); dryGain.gain.value = 1 - wet;

  input.connect(dryGain); dryGain.connect(output);
  input.connect(delay); delay.connect(wetGain); wetGain.connect(output);
  return { input, output };
}
```

#### Compression settings

The existing compressor is well-tuned for a music engine:
```ts
compressor.threshold.value = -18;   // start compressing at -18 dBFS
compressor.knee.value = 12;         // soft transition over 12 dB
compressor.ratio.value = 4;         // 4:1 compression
compressor.attack.value = 0.003;    // 3 ms (fast enough to catch transients)
compressor.release.value = 0.25;    // 250 ms
```

Preset table:
| Use case            | Threshold | Ratio | Attack | Release |
|---------------------|-----------|-------|--------|---------|
| Mix bus (general)   | -18 dB    | 4:1   | 3 ms   | 250 ms  |
| Drum bus (punchy)   | -12 dB    | 6:1   | 1 ms   | 100 ms  |
| Vocal (transparent) | -20 dB    | 3:1   | 5 ms   | 300 ms  |
| Master limiter      | -3 dB     | 20:1  | 0.1 ms | 50 ms   |

#### Other useful effects
- **Lowpass filter sweep**: `filter.frequency.exponentialRampToValueAtTime()`
  for build-ups.
- **Bitcrusher**: `WaveShaperNode` with quantized curve (not native, but
  possible).
- **Tremolo**: LFO modulating a `GainNode`.
- **Auto-pan**: LFO modulating `StereoPannerNode.pan`.

---

### 3.4 Continuous Playback

#### Detecting when a composition finishes

The existing code uses `setTimeout(duration * 1000)` to fire the next loop.
This is reliable but drifts by a few ms per loop. A more precise approach:

```ts
// Use the AudioContext clock, not setTimeout
function scheduleNextLoop(startTime: number, duration: number, callback: () => void) {
  const ms = (startTime + duration - ctx.currentTime) * 1000;
  setTimeout(callback, Math.max(0, ms));
}
```

Or poll the audio clock:
```ts
function onLoopEnd(endTime: number, callback: () => void) {
  const check = () => {
    if (ctx.currentTime >= endTime) callback();
    else requestAnimationFrame(check);
  };
  check();
}
```

#### Crossfading between tracks (the existing `switchTo()`)

The existing `switchTo()` fades out 400 ms, then fades in 400 ms. This creates
a brief dip. For **true gapless crossfade**, schedule the new track to start
**before** the old one finishes:

```ts
async crossfadeTo(newComp: Composition, fadeDuration = 2.0) {
  if (!this.ctx || !this.masterGain) return;
  const now = this.ctx.currentTime;

  // 1. Schedule the new composition to start NOW at low volume
  this.currentComposition = newComp;
  const newStartTime = now + 0.05;
  newComp.notes.forEach(n => this.playNote(n, newStartTime));

  // 2. Fade out old (still playing), fade in new — simultaneously
  // (Requires two separate gain nodes for old and new — see below.)
}
```

For a true crossfade, the architecture needs **two parallel signal chains** (A
and B) with their own gain nodes, so you can fade one out while fading the
other in. The current single-master-gain architecture can't do that.

#### Loop / shuffle / repeat-one modes

```ts
type PlayMode = "loop" | "shuffle" | "repeat-one";

class PlaylistManager {
  private tracks: Composition[];
  private idx = 0;
  private mode: PlayMode = "loop";
  private engine: SoundEngine;

  constructor(tracks: Composition[], engine: SoundEngine) {
    this.tracks = tracks; this.engine = engine;
  }

  async playCurrent() { await this.engine.play(this.tracks[this.idx]); }

  onTrackEnd() {
    switch (this.mode) {
      case "loop":
        this.idx = (this.idx + 1) % this.tracks.length;
        this.playCurrent();
        break;
      case "repeat-one":
        this.playCurrent();  // replay same
        break;
      case "shuffle":
        let next;
        do { next = Math.floor(Math.random() * this.tracks.length); }
        while (next === this.idx && this.tracks.length > 1);
        this.idx = next;
        this.playCurrent();
        break;
    }
  }

  next() { this.idx = (this.idx + 1) % this.tracks.length; this.playCurrent(); }
  prev() { this.idx = (this.idx - 1 + this.tracks.length) % this.tracks.length; this.playCurrent(); }
  setMode(m: PlayMode) { this.mode = m; }
}
```

The existing `MusicPlayer.tsx` already implements `next/prev/selectTrack` and
auto-loop. To add shuffle and repeat-one, hook `onTrackEnd` into the engine's
end-of-loop callback (which needs to be added — currently `scheduleLoop()` just
reschedules the same composition).

---

## 4. Specific Implementation Questions

### 4.1 How to generate a 3-minute composition in code (data structure)

Use a **layered / hierarchical structure** rather than a flat note array. The
existing `Composition` interface uses a flat `CompositionNote[]` — fine for
hand-composed pieces, but verbose for procedural generation.

Recommended hierarchical structure:

```ts
interface ProceduralComposition {
  bpm: number;
  timeSignature: [number, number];     // e.g. [4, 4]
  key: { tonic: number; scale: number[] };  // MIDI root + scale intervals
  sections: Section[];
}

interface Section {
  type: "intro" | "verse" | "chorus" | "bridge" | "outro";
  bars: number;
  energy: number;                      // 0-1, drives density & dynamics
  progression: number[];               // chord scale-degrees per bar
  tracks: Track[];
}

interface Track {
  instrument: InstrumentName;
  role: "melody" | "harmony" | "bass" | "rhythm" | "pad";
  pattern: Pattern;                    // generator config
}

interface Pattern {
  type: "melody" | "arpeggio" | "block-chord" | "bass" | "drum";
  density: number;                     // 0-1, probability of a note per beat
  octaveRange: [number, number];       // e.g. [4, 5]
  rhythm: number[];                    // beat durations
  motif?: number[];                    // for sequence/variation
  drumGrid?: boolean[];                // for drum tracks
}
```

**Flatten to the engine's `CompositionNote[]` at play time:**

```ts
function renderComposition(spec: ProceduralComposition): Composition {
  const secPerBeat = 60 / spec.bpm;
  const secPerBar = secPerBeat * spec.timeSignature[0];
  const notes: CompositionNote[] = [];
  let barOffset = 0;

  for (const section of spec.sections) {
    for (let bar = 0; bar < section.bars; bar++) {
      const barTime = (barOffset + bar) * secPerBar;
      const chordDegree = section.progression[bar % section.progression.length];
      const chordRoot = spec.key.tonic + spec.key.scale[chordDegree - 1];

      for (const track of section.tracks) {
        const trackNotes = renderTrack(track, chordRoot, spec.key,
                                       barTime, secPerBeat, bar, section.energy);
        notes.push(...trackNotes);
      }
    }
    barOffset += section.bars;
  }

  const totalDuration = barOffset * secPerBar + 4;  // +4s release tail
  return {
    id: `proc-${Date.now()}`,
    title: "Procedural",
    description: "Generated",
    bpm: spec.bpm,
    notes,
    duration: totalDuration,
  };
}

function renderTrack(track: Track, chordRoot: number, key: { tonic: number; scale: number[] },
                     barTime: number, secPerBeat: number, bar: number,
                     energy: number): CompositionNote[] {
  // Dispatch to instrument-specific generators
  // (See sections 1.x for synthesis, 2.x for theory)
  return [];
}
```

---

### 4.2 How many notes does a typical 3-minute song have?

Rough estimates by genre:

| Genre            | Notes/min | 3-min total | Why                                  |
|------------------|-----------|-------------|--------------------------------------|
| Sparse piano     | 30–50     | 90–150      | Slow tempo, few notes per beat       |
| Pop ballad       | 80–120    | 240–360     | Melody + chords + bass               |
| Pop/rock         | 150–250   | 450–750     | Drums add ~100 notes/min             |
| EDM              | 200–400   | 600–1200    | Hi-hats at 1/16 = ~600 notes/min alone |
| Jazz (solo piano)| 300–600   | 900–1800    | Dense improvisation                  |
| Orchestral       | 400–800   | 1200–2400   | Many instruments each playing        |

For a **procedural music engine** targeting pop-classical crossover (like the
existing 10 compositions), expect:
- Melody: 2–4 notes/bar × 80 bars = **~200 notes**
- Chords (3 notes × 1 chord/bar × 80) = **~240 notes**
- Bass: 1 note/bar × 80 = **~80 notes**
- Arpeggios (8 notes/bar × 40 bars) = **~320 notes**
- Drums (16 hits/bar × 80 bars × 3 drum types, ~50% density) = **~1900 hits**
- **Total: ~2700 notes for a 3-minute piece.**

This is small enough to schedule all at once into Web Audio (3 minutes × ~1500
notes/sec ÷ 4 voices/note = ~4500 `OscillatorNode`s, which is at the upper
limit but feasible; for safety use the lookahead scheduler for pieces > 2 min
with > 2000 notes).

---

### 4.3 How to store compositions efficiently

Three options, in order of complexity:

#### Option A: Flat note array (current approach)
```ts
{ note: "C4", start: 1.5, dur: 0.5, vel: 0.7, inst: "piano" }
```
- **Pros:** simple, play directly, no preprocessing.
- **Cons:** large (~50 bytes/note × 2700 notes = 135 KB per piece), repetitive.
- **Best for:** hand-authored compositions (the existing 10 pieces).

#### Option B: Patterns + sections (recommended for procedural)
```ts
{ section: "verse", bars: 8, pattern: "boom-bap-drums", transpose: 0 }
```
Patterns are referenced by ID and looked up from a pattern library. A 3-minute
piece becomes ~10 KB instead of 135 KB.
- **Pros:** DRY, easy to swap patterns, easy to extend/shorten.
- **Cons:** requires a pattern library + renderer.

#### Option C: Procedural seeds (most compact)
```ts
{ seed: 12345, bpm: 90, key: "Am", structure: "V-C-V-C-B-C" }
```
A deterministic PRNG (mulberry32) generates the entire piece from the seed.
- **Pros:** 20 bytes per piece; infinite variety.
- **Cons:** requires a stable generator (seed change = different piece).

#### Recommended hybrid
Store the **spec** (Option B) as the source of truth. At play time, **render
to Option A** (flat notes) and pass to the existing `SoundEngine.play()`. This
preserves the existing engine architecture while enabling procedural generation.

```ts
// In storage:
{ id, title, spec: ProceduralComposition }

// On play:
const flat = renderComposition(spec);
soundEngine.play(flat);
```

---

### 4.4 How to create a metronome / clock for timing

Two clocks are needed:

1. **Audio clock** (`ctx.currentTime`) — sample-accurate, monotonic, can't
   pause. **This is the source of truth for when notes play.**
2. **UI clock** (requestAnimationFrame or setInterval) — for visual updates
   (highlight current beat, scroll score, update progress bar).

```ts
class Transport {
  private ctx: AudioContext;
  private bpm: number;
  private isPlaying = false;
  private startTime = 0;        // audio time when playback started
  private pauseOffset = 0;      // accumulated time before pause
  private rafId: number | null = null;
  private onBeat?: (beat: number, bar: number) => void;

  constructor(ctx: AudioContext, bpm = 120) {
    this.ctx = ctx; this.bpm = bpm;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime;
    this.startTime -= this.pauseOffset;   // resume from pause
    this.uiLoop();
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.pauseOffset = this.ctx.currentTime - this.startTime;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  stop() {
    this.isPlaying = false;
    this.pauseOffset = 0;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  /** Current playback time in seconds. */
  get position(): number {
    return this.isPlaying
      ? this.ctx.currentTime - this.startTime
      : this.pauseOffset;
  }

  /** Current beat (0-indexed). */
  get currentBeat(): number {
    return Math.floor(this.position / (60 / this.bpm));
  }

  private uiLoop = () => {
    if (!this.isPlaying) return;
    const beat = this.currentBeat;
    const bar = Math.floor(beat / 4);
    this.onBeat?.(beat % 4, bar);
    this.rafId = requestAnimationFrame(this.uiLoop);
  };

  setBpm(bpm: number) {
    // Adjust startTime so position stays continuous
    const pos = this.position;
    this.bpm = bpm;
    if (this.isPlaying) {
      this.startTime = this.ctx.currentTime - pos;
    }
  }
}
```

#### Why not just use setInterval?
- `setInterval(cb, 100)` fires every ~100 ms ± 15 ms depending on tab focus,
  garbage collection, system load. For a metronome this is audible jitter.
- `ctx.currentTime` is driven by the audio hardware — jitter is sub-millisecond.
- The lookahead pattern (section 3.2) bridges the two: `setInterval` decides
  **when to schedule**, `ctx.currentTime` decides **when notes actually play**.

#### SMPTE / musical time conversion
```ts
function secondsToBarsBeats(sec: number, bpm: number, beatsPerBar = 4): [number, number, number] {
  const secPerBeat = 60 / bpm;
  const totalBeats = sec / secPerBeat;
  const bar = Math.floor(totalBeats / beatsPerBar);
  const beat = Math.floor(totalBeats % beatsPerBar);
  const sixteenths = Math.floor((totalBeats % 1) * 4);
  return [bar, beat, sixteenths];
}
```

---

## Appendix A: Quick reference — instrument → recipe

| Instrument   | Method          | Oscillators                    | Filter              | ADSR (a/d/s/r)        | Special           |
|--------------|-----------------|--------------------------------|---------------------|-----------------------|-------------------|
| Piano        | Additive + FM   | 10 sines (inharmonic) + sub    | (none)              | 0.005/0.3/0.25/0.4    | Hammer noise      |
| Trumpet      | Subtractive     | Saw + formant BPFs             | Bandpass ×3         | 0.04/0.08/0.85/0.10   | Growl LFO 30 Hz   |
| Sax          | Subtractive     | Saw + formant BPFs             | Bandpass ×3         | 0.05/0.10/0.80/0.15   | Growl 35 Hz       |
| French horn  | Subtractive     | Saw + formant BPFs             | Bandpass ×3         | 0.08/0.15/0.85/0.20   | Pitch scoop       |
| Violin       | Subtractive     | 3 detuned saws + bow noise     | Lowpass + body BPFs | 0.12/0.10/0.85/0.20   | Vibrato 6 Hz      |
| Cello        | Subtractive     | 3 detuned saws + sub           | Lowpass + body BPFs | 0.25/0.15/0.80/0.30   | Vibrato 5 Hz      |
| Kick         | Sine sweep      | 1 sine (140→45 Hz)             | —                   | 0.002/0.35/0/0        | Click noise       |
| Snare        | Tone + noise    | Triangle + noise               | HPF 1.5 kHz         | 0.001/0.15/0/0        | Two-layer         |
| Hi-hat       | Filtered noise  | Noise + 4 squares (ring)       | HPF 7 kHz           | 0.001/dur/0/0         | Closed vs open    |
| Cymbal       | Noise + modes   | Noise + 3-5 squares            | HPF 5 kHz + BPFs    | 0.001/0.7/0/0         | Inharmonic modes  |
| Pad          | Subtractive     | 5 detuned saws (octave stack)  | LP w/ sweep + LFO   | 1.2/0.3/0.8/0.5       | Slow LFO 0.25 Hz  |
| Lead         | Subtractive     | Square + saw (detuned)         | LP bright           | 0.01/0.05/0.7/0.10    | Optional glide    |
| Bass         | Subtractive     | Sine + triangle sub            | LP low              | 0.01/0.05/0.6/0.15    | Sub octave        |
| Guitar (ac)  | Karplus-Strong  | Noise burst → delay feedback   | LP in feedback      | (natural decay)       | Body resonances   |
| Guitar (el)  | K-S + distortion| Same + WaveShaper              | LP post-distortion  | (natural decay)       | tanh curve        |
| Flute        | Sine + noise    | Sine + 2nd harmonic sine       | BPF (noise)         | 0.08/0.05/0.90/0.10   | Vibrato 5 Hz      |

## Appendix B: Note frequency reference (MIDI → Hz)

```ts
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
// A4 = MIDI 69 = 440 Hz
// C4 = MIDI 60 = 261.63 Hz
// Middle C in the existing noteToFreq = "C4" → 261.63 Hz ✓
```

Common MIDI ranges:
- Bass: 24–48 (C1–C3)
- Mid: 48–72 (C3–C5)
- Treble: 72–96 (C5–C7)

## Appendix C: Useful constants

```ts
const A4 = 440;
const MIDDLE_C = 261.6256;
const SEMITONE_RATIO = Math.pow(2, 1/12);  // 1.0595

// Equal-tempered frequencies for one octave starting at C4
const C4_FREQS = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23,
                  369.99, 392.00, 415.30, 440.00, 466.16, 493.88];

// Standard ADSR presets (seconds)
const ADSR = {
  piano:      { a: 0.005, d: 0.3,  s: 0.25, r: 0.4  },
  organ:      { a: 0.05,  d: 0.1,  s: 0.9,  r: 0.15 },
  brass:      { a: 0.05,  d: 0.1,  s: 0.85, r: 0.15 },
  string:     { a: 0.2,   d: 0.1,  s: 0.85, r: 0.3  },
  flute:      { a: 0.08,  d: 0.05, s: 0.9,  r: 0.1  },
  pad:        { a: 1.0,   d: 0.5,  s: 0.8,  r: 1.5  },
  pluck:      { a: 0.001, d: 0.3,  s: 0,    r: 0.1  },
  drum:       { a: 0.001, d: 0.2,  s: 0,    r: 0.05 },
};
```

---

## Summary of improvements over the existing engine

The existing `src/lib/sound-engine.ts` is solid and ships 20 instruments. The
research above suggests these specific enhancements, in priority order:

1. **Piano:** Switch from FM to additive synthesis with inharmonicity (section 1.1).
   The current FM piano sounds bell-like; additive is dramatically more realistic.
2. **Add drum kit** (kick, snare, hi-hat) — section 1.4. Currently missing;
   needed for any rhythm-section genre.
3. **Brass formant filters** — section 1.2. The existing `trumpet` is a single
   sawtooth through a lowpass; formant bandpass filters are what make brass
   sound like brass.
4. **Karplus-Strong guitar** — section 1.6. The existing `guitar` is a
   subtractive sawtooth; K-S is dramatically more realistic for plucked strings.
5. **String body resonances + delayed vibrato** — section 1.3. Adds the
   "wooden" quality that distinguishes a real violin from a synth.
6. **Lookahead scheduler** for pieces > 2 minutes with > 2000 notes — section 3.2.
   The existing schedule-all-at-once approach works for the current 30-second
   loops but won't scale to 3-minute procedural compositions.
7. **Procedural composition layer** — section 4.1. Add a `ProceduralComposition`
   spec type and a `renderComposition()` function that outputs the existing
   `Composition` interface, enabling infinite variety from compact seeds.
8. **True crossfade** (parallel signal chains) — section 3.4. The existing
   `switchTo()` has a brief volume dip; parallel A/B chains enable gapless
   crossfade.
9. **Transport with pause/resume** — section 4.4. Currently only play/stop;
   add a proper Transport class for pause without losing position.
10. **Shuffle and repeat-one modes** — section 3.4. The existing player only
    loops the playlist; add the two missing modes.
