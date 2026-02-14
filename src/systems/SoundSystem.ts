// Web Audio API chiptune sound effects
export class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
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
