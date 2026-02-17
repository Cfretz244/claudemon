import { MUSIC_TRACKS, MusicTrack } from '../data/musicTracks';

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
    }
    return this.ctx;
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

  doorOpen(): void {
    this.playNotes([
      { freq: 400, dur: 0.08, delay: 0 },
      { freq: 600, dur: 0.08, delay: 0.08 },
    ], 'square', 0.06);
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
}

// Global sound instance
export const soundSystem = new SoundSystem();
