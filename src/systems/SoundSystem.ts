import { MUSIC_TRACKS, MusicTrack } from '../data/musicTracks';
import { CRY_CONTOURS, CrySpec } from '../logic/entranceSpec';

/** The cry volume today's `pokemonCry` uses; shared so both paths match. */
const CRY_VOLUME = 0.08;

type NoteEntry = [number, number]; // [frequency, duration in beats]

// Web Audio API chiptune sound effects + music engine
export class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled = true;

  // Music engine state
  private currentTrackId: string | null = null;
  private melodyOsc: OscillatorNode | null = null;
  private bassOsc: OscillatorNode | null = null;
  private melodyGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private melodyIndex = 0;
  private bassIndex = 0;
  private melodyNextTime = 0;
  private bassNextTime = 0;
  private currentTrack: MusicTrack | null = null;
  private pausedTrackId: string | null = null;
  private melodyVolume = 1.0;
  private bassVolume = 1.0;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      // Resume on first user interaction (browser autoplay policy)
      const resume = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        document.removeEventListener('keydown', resume);
        document.removeEventListener('click', resume);
        document.removeEventListener('touchstart', resume);
      };
      document.addEventListener('keydown', resume);
      document.addEventListener('click', resume);
      document.addEventListener('touchstart', resume);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  resumeOnInteraction(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.pausedTrackId = this.currentTrackId;
      this.stopMusic();
    } else if (this.pausedTrackId) {
      this.startMusic(this.pausedTrackId);
      this.pausedTrackId = null;
    }
  }

  toggleEnabled(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  // ── Music Engine ─────────────────────────────────────────

  startMusic(trackId: string): void {
    if (!this.enabled) return;
    if (this.currentTrackId === trackId) return; // same track, no-op

    const track = MUSIC_TRACKS[trackId];
    if (!track) return;

    this.stopMusic();

    try {
      const ctx = this.getCtx();
      this.currentTrack = track;
      this.currentTrackId = trackId;

      // Create long-lived oscillators
      this.melodyOsc = ctx.createOscillator();
      this.melodyOsc.type = 'square';
      this.melodyGain = ctx.createGain();
      this.melodyGain.gain.value = 0;
      this.melodyOsc.connect(this.melodyGain);
      this.melodyGain.connect(ctx.destination);
      this.melodyOsc.start();

      this.bassOsc = ctx.createOscillator();
      this.bassOsc.type = 'triangle';
      this.bassGain = ctx.createGain();
      this.bassGain.gain.value = 0;
      this.bassOsc.connect(this.bassGain);
      this.bassGain.connect(ctx.destination);
      this.bassOsc.start();

      // Reset indices
      this.melodyIndex = 0;
      this.bassIndex = 0;
      this.melodyNextTime = ctx.currentTime + 0.05;
      this.bassNextTime = ctx.currentTime + 0.05;

      // Start look-ahead scheduler
      this.schedulerInterval = setInterval(() => this.scheduleNotes(), 50);
    } catch {
      // Audio context not available
    }
  }

  stopMusic(): void {
    if (this.schedulerInterval !== null) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    // Capture references to the OLD nodes before clearing instance fields,
    // so the delayed cleanup doesn't kill newly-created oscillators.
    const oldMelodyOsc = this.melodyOsc;
    const oldBassOsc = this.bassOsc;
    const oldMelodyGain = this.melodyGain;
    const oldBassGain = this.bassGain;

    this.melodyOsc = null;
    this.bassOsc = null;
    this.melodyGain = null;
    this.bassGain = null;
    this.currentTrackId = null;
    this.currentTrack = null;

    try {
      const ctx = this.ctx;
      if (ctx) {
        const now = ctx.currentTime;
        // Ramp gain to 0 to avoid clicks
        if (oldMelodyGain) {
          oldMelodyGain.gain.cancelScheduledValues(now);
          oldMelodyGain.gain.setValueAtTime(oldMelodyGain.gain.value, now);
          oldMelodyGain.gain.linearRampToValueAtTime(0, now + 0.05);
        }
        if (oldBassGain) {
          oldBassGain.gain.cancelScheduledValues(now);
          oldBassGain.gain.setValueAtTime(oldBassGain.gain.value, now);
          oldBassGain.gain.linearRampToValueAtTime(0, now + 0.05);
        }
      }

      // Stop oscillators after fade
      setTimeout(() => {
        try {
          oldMelodyOsc?.stop();
          oldBassOsc?.stop();
        } catch { /* already stopped */ }
        oldMelodyOsc?.disconnect();
        oldBassOsc?.disconnect();
        oldMelodyGain?.disconnect();
        oldBassGain?.disconnect();
      }, 60);
    } catch {
      // Audio context not available - nothing to clean up
    }
  }

  // ── Sound Test API ──────────────────────────────────────

  setMelodyVolume(vol: number): void {
    this.melodyVolume = Math.max(0, Math.min(1, vol));
  }

  setBassVolume(vol: number): void {
    this.bassVolume = Math.max(0, Math.min(1, vol));
  }

  getMelodyIndex(): number {
    return this.melodyIndex;
  }

  getBassIndex(): number {
    return this.bassIndex;
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  private scheduleNotes(): void {
    if (!this.ctx || !this.currentTrack) return;
    const ctx = this.ctx;
    const lookAhead = 0.1; // schedule 100ms ahead

    // Schedule melody notes
    while (this.melodyNextTime < ctx.currentTime + lookAhead) {
      this.scheduleNote(
        this.currentTrack.melody,
        this.melodyIndex,
        this.melodyNextTime,
        this.melodyOsc!,
        this.melodyGain!,
        0.04 * this.melodyVolume,
        this.currentTrack.bpm,
      );
      const note = this.currentTrack.melody[this.melodyIndex] as NoteEntry;
      this.melodyNextTime += this.beatDuration(note[1], this.currentTrack.bpm);
      this.melodyIndex = (this.melodyIndex + 1) % this.currentTrack.melody.length;
    }

    // Schedule bass notes
    while (this.bassNextTime < ctx.currentTime + lookAhead) {
      this.scheduleNote(
        this.currentTrack.bass,
        this.bassIndex,
        this.bassNextTime,
        this.bassOsc!,
        this.bassGain!,
        0.03 * this.bassVolume,
        this.currentTrack.bpm,
      );
      const note = this.currentTrack.bass[this.bassIndex] as NoteEntry;
      this.bassNextTime += this.beatDuration(note[1], this.currentTrack.bpm);
      this.bassIndex = (this.bassIndex + 1) % this.currentTrack.bass.length;
    }
  }

  private scheduleNote(
    notes: NoteEntry[],
    index: number,
    time: number,
    osc: OscillatorNode,
    gain: GainNode,
    volume: number,
    bpm: number,
  ): void {
    const [freq, beats] = notes[index];
    const duration = this.beatDuration(beats, bpm);

    if (freq === 0) {
      // Rest: silence the oscillator
      gain.gain.setValueAtTime(0, time);
    } else {
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume, time);
      // Fade out slightly before next note to avoid clicks
      gain.gain.setValueAtTime(volume, time + duration - 0.01);
      gain.gain.linearRampToValueAtTime(0, time + duration);
    }
  }

  private beatDuration(beats: number, bpm: number): number {
    // 1 beat = eighth note, so 2 beats = quarter note at the given BPM
    return (beats * 60) / (bpm * 2);
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.1): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context not available
    }
  }

  private playNotes(notes: Array<{ freq: number; dur: number; delay: number }>, type: OscillatorType = 'square', volume = 0.1): void {
    if (!this.enabled) return;
    for (const note of notes) {
      setTimeout(() => this.playTone(note.freq, note.dur, type, volume), note.delay * 1000);
    }
  }

  menuSelect(): void {
    this.playTone(800, 0.05, 'square', 0.08);
  }

  menuMove(): void {
    this.playTone(400, 0.03, 'square', 0.05);
  }

  collision(): void {
    this.playTone(100, 0.08, 'square', 0.06);
  }

  textChar(): void {
    this.playTone(600, 0.02, 'square', 0.03);
  }

  battleStart(): void {
    this.playNotes([
      { freq: 200, dur: 0.1, delay: 0 },
      { freq: 300, dur: 0.1, delay: 0.1 },
      { freq: 400, dur: 0.1, delay: 0.2 },
      { freq: 600, dur: 0.2, delay: 0.3 },
    ], 'square', 0.1);
  }

  hit(): void {
    this.playNotes([
      { freq: 300, dur: 0.05, delay: 0 },
      { freq: 200, dur: 0.05, delay: 0.05 },
      { freq: 100, dur: 0.1, delay: 0.1 },
    ], 'square', 0.08);
  }

  superEffective(): void {
    this.playNotes([
      { freq: 400, dur: 0.08, delay: 0 },
      { freq: 600, dur: 0.08, delay: 0.08 },
      { freq: 800, dur: 0.15, delay: 0.16 },
    ], 'square', 0.1);
  }

  notVeryEffective(): void {
    this.playNotes([
      { freq: 300, dur: 0.08, delay: 0 },
      { freq: 200, dur: 0.15, delay: 0.08 },
    ], 'square', 0.06);
  }

  catchShake(): void {
    this.playNotes([
      { freq: 500, dur: 0.1, delay: 0 },
      { freq: 400, dur: 0.1, delay: 0.15 },
    ], 'triangle', 0.08);
  }

  catchSuccess(): void {
    this.playNotes([
      { freq: 400, dur: 0.1, delay: 0 },
      { freq: 500, dur: 0.1, delay: 0.12 },
      { freq: 600, dur: 0.1, delay: 0.24 },
      { freq: 800, dur: 0.3, delay: 0.36 },
    ], 'square', 0.1);
  }

  levelUp(): void {
    this.playNotes([
      { freq: 523, dur: 0.1, delay: 0 },
      { freq: 659, dur: 0.1, delay: 0.1 },
      { freq: 784, dur: 0.1, delay: 0.2 },
      { freq: 1047, dur: 0.3, delay: 0.3 },
    ], 'square', 0.1);
  }

  evolution(): void {
    const notes: Array<{ freq: number; dur: number; delay: number }> = [];
    for (let i = 0; i < 8; i++) {
      notes.push({ freq: 400 + i * 100, dur: 0.15, delay: i * 0.15 });
    }
    this.playNotes(notes, 'square', 0.1);
  }

  healBallDing(): void {
    this.playTone(1200, 0.08, 'triangle', 0.07);
  }

  healMachineHum(): void {
    this.playNotes([
      { freq: 200, dur: 0.15, delay: 0 },
      { freq: 250, dur: 0.15, delay: 0.15 },
      { freq: 200, dur: 0.15, delay: 0.3 },
      { freq: 250, dur: 0.15, delay: 0.45 },
    ], 'triangle', 0.05);
  }

  heal(): void {
    this.playNotes([
      { freq: 440, dur: 0.15, delay: 0 },
      { freq: 554, dur: 0.15, delay: 0.15 },
      { freq: 659, dur: 0.15, delay: 0.3 },
      { freq: 880, dur: 0.3, delay: 0.45 },
    ], 'triangle', 0.1);
  }

  faint(): void {
    this.playNotes([
      { freq: 600, dur: 0.15, delay: 0 },
      { freq: 500, dur: 0.15, delay: 0.15 },
      { freq: 400, dur: 0.15, delay: 0.3 },
      { freq: 200, dur: 0.3, delay: 0.45 },
    ], 'square', 0.08);
  }

  victory(): void {
    this.playNotes([
      { freq: 523, dur: 0.15, delay: 0 },
      { freq: 659, dur: 0.15, delay: 0.15 },
      { freq: 784, dur: 0.15, delay: 0.3 },
      { freq: 1047, dur: 0.15, delay: 0.45 },
      { freq: 784, dur: 0.15, delay: 0.6 },
      { freq: 1047, dur: 0.4, delay: 0.75 },
    ], 'square', 0.1);
  }

  pokemonCry(baseFreq: number = 400): void {
    this.playNotes([
      { freq: baseFreq, dur: 0.1, delay: 0 },
      { freq: baseFreq * 1.2, dur: 0.1, delay: 0.1 },
      { freq: baseFreq * 0.8, dur: 0.15, delay: 0.2 },
    ], 'sawtooth', 0.08);
  }

  /**
   * The per-species cry. `resolveCry` (logic/entranceSpec.ts) picks the note
   * contour from the mon's body shape and the wave from its primary type; this
   * only has to play what it is handed.
   *
   * `pokemonCry(baseFreq)` above is kept as-is for its other callers, and the
   * `triad` contour is byte-for-byte its note table - so a round mon routed
   * through here sounds exactly like it did before this change.
   */
  pokemonCryFor(spec: CrySpec): void {
    const contour = CRY_CONTOURS[spec.contour] ?? CRY_CONTOURS.triad;
    const notes = contour.map(n => ({
      freq: spec.baseFreq * n.freqMul,
      dur: n.dur,
      delay: n.delay,
    }));
    if (spec.tremolo || spec.vibrato) {
      this.playModulatedNotes(notes, spec.wave, CRY_VOLUME, !!spec.tremolo, !!spec.vibrato);
      return;
    }
    this.playNotes(notes, spec.wave, CRY_VOLUME);
  }

  /**
   * `playNotes` with a low-frequency oscillator on top: FIRE mons waver in
   * volume (tremolo), GHOST mons waver in pitch (vibrato). Both are one extra
   * oscillator per note patched into the same graph `playTone` builds, so a
   * browser without Web Audio still falls through the same try/catch.
   */
  private playModulatedNotes(
    notes: Array<{ freq: number; dur: number; delay: number }>,
    type: OscillatorType,
    volume: number,
    tremolo: boolean,
    vibrato: boolean,
  ): void {
    if (!this.enabled) return;
    for (const note of notes) {
      setTimeout(() => {
        if (!this.enabled) return;
        try {
          const ctx = this.getCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.value = note.freq;
          gain.gain.value = volume;
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.dur);

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.type = 'sine';
          lfo.frequency.value = tremolo ? 14 : 9;
          lfoGain.gain.value = tremolo ? volume * 0.6 : note.freq * 0.04;
          lfo.connect(lfoGain);
          lfoGain.connect(tremolo ? gain.gain : osc.frequency);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          lfo.start(ctx.currentTime);
          osc.stop(ctx.currentTime + note.dur);
          lfo.stop(ctx.currentTime + note.dur);
        } catch {
          // Audio context not available
        }
      }, note.delay * 1000);
    }
  }

  doorOpen(): void {
    this.playNotes([
      { freq: 400, dur: 0.08, delay: 0 },
      { freq: 600, dur: 0.08, delay: 0.08 },
    ], 'square', 0.06);
  }

  teleportWarp(): void {
    this.playNotes([
      { freq: 1200, dur: 0.06, delay: 0 },
      { freq: 800, dur: 0.06, delay: 0.06 },
      { freq: 1400, dur: 0.06, delay: 0.12 },
      { freq: 600, dur: 0.08, delay: 0.18 },
      { freq: 1600, dur: 0.1, delay: 0.26 },
    ], 'sine', 0.07);
  }

  bump(): void {
    this.playTone(80, 0.1, 'square', 0.05);
  }

  save(): void {
    this.playNotes([
      { freq: 800, dur: 0.1, delay: 0 },
      { freq: 1000, dur: 0.1, delay: 0.1 },
      { freq: 1200, dur: 0.2, delay: 0.2 },
    ], 'triangle', 0.08);
  }

  starShimmer(): void {
    this.playNotes([
      { freq: 1200, dur: 0.06, delay: 0 },
      { freq: 1600, dur: 0.06, delay: 0.05 },
      { freq: 2000, dur: 0.08, delay: 0.1 },
      { freq: 2400, dur: 0.1, delay: 0.16 },
    ], 'sine', 0.06);
  }

  thunderZap(): void {
    this.playNotes([
      { freq: 600, dur: 0.05, delay: 0 },
      { freq: 400, dur: 0.05, delay: 0.04 },
      { freq: 250, dur: 0.06, delay: 0.08 },
      { freq: 150, dur: 0.08, delay: 0.13 },
      { freq: 80, dur: 0.15, delay: 0.2 },
    ], 'sawtooth', 0.12);
    this.playNotes([
      { freq: 60, dur: 0.4, delay: 0.05 },
    ], 'square', 0.08);
  }

  whoosh(): void {
    this.playNotes([
      { freq: 200, dur: 0.04, delay: 0 },
      { freq: 350, dur: 0.04, delay: 0.03 },
      { freq: 500, dur: 0.04, delay: 0.06 },
      { freq: 700, dur: 0.05, delay: 0.09 },
      { freq: 900, dur: 0.06, delay: 0.13 },
    ], 'sine', 0.05);
  }

  splash(): void {
    this.playNotes([
      { freq: 320, dur: 0.04, delay: 0 },
      { freq: 260, dur: 0.05, delay: 0.04 },
      { freq: 200, dur: 0.06, delay: 0.09 },
      { freq: 150, dur: 0.08, delay: 0.14 },
    ], 'triangle', 0.06);
  }

  balloonPop(): void {
    this.playTone(420, 0.04, 'square', 0.07);
  }

  // === Per-type move SFX (see src/logic/moveAnimationSpec.ts TYPE_VOCAB) ===
  // Electric reuses thunderZap(), Water reuses splash(), Flying reuses
  // whoosh(), Normal reuses hit(); the twelve below fill in the rest.

  /** Fire: a dry crackle of short rising sawtooth ticks. */
  crackle(): void {
    this.playNotes([
      { freq: 900, dur: 0.02, delay: 0 },
      { freq: 1400, dur: 0.02, delay: 0.03 },
      { freq: 700, dur: 0.02, delay: 0.06 },
      { freq: 1600, dur: 0.02, delay: 0.1 },
      { freq: 1000, dur: 0.03, delay: 0.14 },
    ], 'sawtooth', 0.05);
  }

  /** Grass: a soft upward sweep, like leaves brushing past. */
  leafSweep(): void {
    this.playNotes([
      { freq: 300, dur: 0.05, delay: 0 },
      { freq: 420, dur: 0.05, delay: 0.04 },
      { freq: 560, dur: 0.05, delay: 0.08 },
      { freq: 700, dur: 0.08, delay: 0.12 },
    ], 'triangle', 0.045);
  }

  /** Ice: a thin glassy ping with a shimmering tail. */
  glassPing(): void {
    this.playNotes([
      { freq: 2100, dur: 0.05, delay: 0 },
      { freq: 2800, dur: 0.06, delay: 0.04 },
      { freq: 3200, dur: 0.1, delay: 0.09 },
    ], 'sine', 0.05);
  }

  /** Fighting: three hard blows in quick succession. */
  tripleHit(): void {
    this.playNotes([
      { freq: 260, dur: 0.04, delay: 0 },
      { freq: 220, dur: 0.04, delay: 0.07 },
      { freq: 160, dur: 0.08, delay: 0.14 },
    ], 'square', 0.09);
  }

  /** Poison: a wet bubble pop. */
  bubblePop(): void {
    this.playNotes([
      { freq: 180, dur: 0.04, delay: 0 },
      { freq: 520, dur: 0.03, delay: 0.05 },
      { freq: 300, dur: 0.04, delay: 0.09 },
    ], 'sine', 0.07);
  }

  /** Ground: a low sustained rumble. */
  rumble(): void {
    this.playNotes([
      { freq: 70, dur: 0.25, delay: 0 },
      { freq: 55, dur: 0.25, delay: 0.08 },
      { freq: 90, dur: 0.15, delay: 0.16 },
    ], 'sawtooth', 0.09);
  }

  /** Rock: a single heavy thud. */
  thud(): void {
    this.playNotes([
      { freq: 140, dur: 0.06, delay: 0 },
      { freq: 80, dur: 0.12, delay: 0.05 },
    ], 'square', 0.1);
  }

  /**
   * "It's not very effective..." - `thud` with the top taken off it: lower,
   * quieter, on a triangle rather than a square, so it reads as a hit that
   * barely landed rather than as a different move.
   */
  dullThud(): void {
    this.playNotes([
      { freq: 110, dur: 0.05, delay: 0 },
      { freq: 70, dur: 0.09, delay: 0.04 },
    ], 'triangle', 0.05);
  }

  /** Bug: a fast high chitter. */
  chitter(): void {
    this.playNotes([
      { freq: 1800, dur: 0.02, delay: 0 },
      { freq: 1500, dur: 0.02, delay: 0.03 },
      { freq: 1900, dur: 0.02, delay: 0.06 },
      { freq: 1600, dur: 0.02, delay: 0.09 },
      { freq: 2000, dur: 0.03, delay: 0.12 },
    ], 'square', 0.04);
  }

  /** Ghost: a detuned falling wail. */
  wail(): void {
    this.playNotes([
      { freq: 420, dur: 0.12, delay: 0 },
      { freq: 396, dur: 0.12, delay: 0.02 },
      { freq: 300, dur: 0.14, delay: 0.12 },
      { freq: 284, dur: 0.14, delay: 0.14 },
      { freq: 210, dur: 0.2, delay: 0.26 },
    ], 'triangle', 0.05);
  }

  /** Psychic: a warbling two-tone beat. */
  warble(): void {
    this.playNotes([
      { freq: 880, dur: 0.05, delay: 0 },
      { freq: 660, dur: 0.05, delay: 0.05 },
      { freq: 880, dur: 0.05, delay: 0.1 },
      { freq: 660, dur: 0.05, delay: 0.15 },
      { freq: 1100, dur: 0.08, delay: 0.2 },
    ], 'sine', 0.06);
  }

  // === Tier-3 override voices (src/systems/animations/overrides.ts) ===

  /** SELF-DESTRUCT / EXPLOSION: a deep detonation with a debris tail. */
  boom(): void {
    this.playNotes([
      { freq: 160, dur: 0.08, delay: 0 },
      { freq: 90, dur: 0.14, delay: 0.05 },
      { freq: 55, dur: 0.3, delay: 0.12 },
    ], 'square', 0.12);
    this.playNotes([
      { freq: 240, dur: 0.05, delay: 0 },
      { freq: 180, dur: 0.06, delay: 0.08 },
      { freq: 120, dur: 0.1, delay: 0.18 },
      { freq: 70, dur: 0.2, delay: 0.3 },
    ], 'sawtooth', 0.09);
  }

  /** SOLAR BEAM / HYPER BEAM: a rising whine while the shot charges. */
  beamCharge(): void {
    this.playNotes([
      { freq: 220, dur: 0.08, delay: 0 },
      { freq: 330, dur: 0.08, delay: 0.07 },
      { freq: 440, dur: 0.08, delay: 0.14 },
      { freq: 620, dur: 0.1, delay: 0.21 },
      { freq: 880, dur: 0.16, delay: 0.29 },
    ], 'triangle', 0.06);
  }

  /** SURF: a low swell that rolls up into a breaking crest. */
  waveCrash(): void {
    this.playNotes([
      { freq: 90, dur: 0.12, delay: 0 },
      { freq: 120, dur: 0.12, delay: 0.1 },
      { freq: 160, dur: 0.14, delay: 0.2 },
      { freq: 210, dur: 0.18, delay: 0.32 },
    ], 'sawtooth', 0.07);
    this.playNotes([
      { freq: 420, dur: 0.06, delay: 0.34 },
      { freq: 330, dur: 0.07, delay: 0.41 },
      { freq: 250, dur: 0.09, delay: 0.49 },
      { freq: 180, dur: 0.14, delay: 0.58 },
    ], 'triangle', 0.06);
  }

  /** BLIZZARD: a howling wind, two detuned sweeps beating against each other. */
  iceWind(): void {
    this.playNotes([
      { freq: 1200, dur: 0.16, delay: 0 },
      { freq: 1500, dur: 0.16, delay: 0.12 },
      { freq: 1300, dur: 0.16, delay: 0.26 },
      { freq: 1700, dur: 0.22, delay: 0.4 },
    ], 'sine', 0.035);
    this.playNotes([
      { freq: 1160, dur: 0.2, delay: 0.02 },
      { freq: 1460, dur: 0.2, delay: 0.14 },
      { freq: 1260, dur: 0.2, delay: 0.28 },
      { freq: 1640, dur: 0.26, delay: 0.42 },
    ], 'triangle', 0.03);
  }

  /** Dragon: a low guttural roar. */
  roar(): void {
    this.playNotes([
      { freq: 110, dur: 0.15, delay: 0 },
      { freq: 90, dur: 0.15, delay: 0.1 },
      { freq: 130, dur: 0.2, delay: 0.2 },
    ], 'sawtooth', 0.1);
    this.playNotes([
      { freq: 55, dur: 0.4, delay: 0 },
    ], 'square', 0.06);
  }

  // === Foe-targeted status / grapple / speed voices (PR 4c) ===

  /** SING: a lilting five-note phrase, the only sung line in the battle. */
  melody(): void {
    this.playNotes([
      { freq: 523, dur: 0.12, delay: 0 },
      { freq: 659, dur: 0.12, delay: 0.11 },
      { freq: 784, dur: 0.14, delay: 0.22 },
      { freq: 659, dur: 0.12, delay: 0.36 },
      { freq: 587, dur: 0.22, delay: 0.47 },
    ], 'sine', 0.07);
    this.playNotes([
      { freq: 262, dur: 0.3, delay: 0.05 },
      { freq: 294, dur: 0.3, delay: 0.4 },
    ], 'triangle', 0.035);
  }

  /** SLEEP POWDER: a soft airy puff settling downward. */
  powder(): void {
    this.playNotes([
      { freq: 900, dur: 0.06, delay: 0 },
      { freq: 760, dur: 0.07, delay: 0.07 },
      { freq: 620, dur: 0.08, delay: 0.15 },
      { freq: 500, dur: 0.1, delay: 0.24 },
      { freq: 400, dur: 0.16, delay: 0.35 },
    ], 'sine', 0.045);
  }

  /** TOXIC: a wet lob, a splat, and the drips coming off after it. */
  spatter(): void {
    this.playNotes([
      { freq: 180, dur: 0.1, delay: 0 },
      { freq: 110, dur: 0.16, delay: 0.1 },
    ], 'square', 0.09);
    this.playNotes([
      { freq: 420, dur: 0.05, delay: 0.26 },
      { freq: 340, dur: 0.05, delay: 0.36 },
      { freq: 280, dur: 0.06, delay: 0.48 },
    ], 'triangle', 0.05);
  }

  /** THUNDER WAVE: a buzzing pulse train, not a zap - no bolt, just current. */
  staticBuzz(): void {
    this.playNotes([
      { freq: 70, dur: 0.09, delay: 0 },
      { freq: 70, dur: 0.09, delay: 0.13 },
      { freq: 80, dur: 0.09, delay: 0.26 },
      { freq: 90, dur: 0.14, delay: 0.39 },
    ], 'square', 0.055);
    this.playNotes([
      { freq: 1400, dur: 0.03, delay: 0.42 },
      { freq: 1700, dur: 0.03, delay: 0.5 },
      { freq: 1500, dur: 0.04, delay: 0.58 },
    ], 'sawtooth', 0.03);
  }

  /** WRAP / BIND: rope creaking as it tightens. */
  constrict(): void {
    this.playNotes([
      { freq: 150, dur: 0.1, delay: 0 },
      { freq: 190, dur: 0.1, delay: 0.12 },
      { freq: 240, dur: 0.1, delay: 0.24 },
      { freq: 300, dur: 0.16, delay: 0.36 },
    ], 'sawtooth', 0.05);
  }

  /** QUICK ATTACK: one short whip-crack - the whole move is 300 ms. */
  dash(): void {
    this.playNotes([
      { freq: 1200, dur: 0.03, delay: 0 },
      { freq: 1800, dur: 0.03, delay: 0.03 },
      { freq: 700, dur: 0.06, delay: 0.09 },
    ], 'square', 0.07);
  }

  // === Self-target voices (PR 4d) ===
  // One per override, all of them pitched around the attacker rather than at
  // the defender: nothing here is an impact, so nothing here has a transient.

  /** TRANSFORM: a rising sine glide that collapses to a point and re-forms -
   *  the shape of the animation, in one voice. */
  morph(): void {
    this.playNotes([
      { freq: 330, dur: 0.1, delay: 0 },
      { freq: 440, dur: 0.1, delay: 0.1 },
      { freq: 660, dur: 0.1, delay: 0.2 },
      { freq: 990, dur: 0.12, delay: 0.3 },
      { freq: 1320, dur: 0.1, delay: 0.44 },
      { freq: 660, dur: 0.14, delay: 0.58 },
      { freq: 494, dur: 0.2, delay: 0.74 },
    ], 'sine', 0.055);
    this.playNotes([
      { freq: 120, dur: 0.5, delay: 0.28 },
    ], 'triangle', 0.03);
  }

  /** SUBSTITUTE: a pop of smoke and the doll thumping down in front of you. */
  poof(): void {
    this.playNotes([
      { freq: 520, dur: 0.04, delay: 0 },
      { freq: 300, dur: 0.08, delay: 0.05 },
      { freq: 190, dur: 0.14, delay: 0.14 },
    ], 'square', 0.07);
    this.playNotes([
      { freq: 140, dur: 0.12, delay: 0.46 },
      { freq: 110, dur: 0.16, delay: 0.56 },
    ], 'triangle', 0.06);
  }

  /** REST: two slow snores - a fall and a rise, an octave apart. */
  snore(): void {
    this.playNotes([
      { freq: 200, dur: 0.26, delay: 0.05 },
      { freq: 150, dur: 0.3, delay: 0.32 },
      { freq: 200, dur: 0.26, delay: 0.62 },
    ], 'triangle', 0.05);
    this.playNotes([
      { freq: 100, dur: 0.34, delay: 0.1 },
      { freq: 75, dur: 0.4, delay: 0.5 },
    ], 'sine', 0.04);
  }

  /** DOUBLE TEAM: a fluttering two-tone wobble - one of you became several. */
  blur(): void {
    this.playNotes([
      { freq: 700, dur: 0.04, delay: 0 },
      { freq: 940, dur: 0.04, delay: 0.06 },
      { freq: 700, dur: 0.04, delay: 0.12 },
      { freq: 940, dur: 0.04, delay: 0.18 },
      { freq: 780, dur: 0.05, delay: 0.26 },
      { freq: 1040, dur: 0.05, delay: 0.34 },
      { freq: 880, dur: 0.1, delay: 0.46 },
    ], 'square', 0.045);
  }

  /** MINIMIZE: four descending blips, one per shrink step, then the pop back. */
  shrink(): void {
    this.playNotes([
      { freq: 880, dur: 0.05, delay: 0 },
      { freq: 700, dur: 0.05, delay: 0.14 },
      { freq: 560, dur: 0.05, delay: 0.28 },
      { freq: 440, dur: 0.06, delay: 0.42 },
    ], 'square', 0.06);
    this.playNotes([
      { freq: 300, dur: 0.05, delay: 0.68 },
      { freq: 900, dur: 0.1, delay: 0.73 },
    ], 'triangle', 0.06);
  }

  /** LIGHT SCREEN: a glassy pane sliding up, then the glint crossing it. */
  paneRise(): void {
    this.playNotes([
      { freq: 420, dur: 0.08, delay: 0 },
      { freq: 560, dur: 0.08, delay: 0.07 },
      { freq: 700, dur: 0.1, delay: 0.14 },
      { freq: 840, dur: 0.22, delay: 0.22 },
    ], 'triangle', 0.05);
    this.playNotes([
      { freq: 2000, dur: 0.04, delay: 0.42 },
      { freq: 2400, dur: 0.05, delay: 0.5 },
    ], 'sine', 0.035);
  }

  /** SWORDS DANCE: steel ringing, faster and higher with every orbit. */
  bladeRing(): void {
    this.playNotes([
      { freq: 1100, dur: 0.05, delay: 0 },
      { freq: 1300, dur: 0.05, delay: 0.18 },
      { freq: 1500, dur: 0.05, delay: 0.33 },
      { freq: 1700, dur: 0.05, delay: 0.45 },
      { freq: 1900, dur: 0.05, delay: 0.55 },
      { freq: 2100, dur: 0.08, delay: 0.63 },
    ], 'sawtooth', 0.035);
    this.playNotes([
      { freq: 160, dur: 0.2, delay: 0.5 },
      { freq: 130, dur: 0.26, delay: 0.68 },
    ], 'square', 0.05);
  }

  /** SPLASH: three little plops, and then nothing at all. */
  plop(): void {
    this.playNotes([
      { freq: 420, dur: 0.05, delay: 0 },
      { freq: 300, dur: 0.06, delay: 0.05 },
    ], 'triangle', 0.06);
  }
}

// Global sound instance
export const soundSystem = new SoundSystem();
