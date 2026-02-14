import { MapData } from '../types/map.types';

// Note frequencies — derived from MIDI transcriptions of Pokemon RBY
// Octave 2
const Gs2 = 103.83, A2 = 110.00, Bb2 = 116.54, B2 = 123.47;
// Octave 3
const C3 = 130.81, Cs3 = 138.59, D3 = 146.83, Eb3 = 155.56, E3 = 164.81, F3 = 174.61, Fs3 = 185.00, G3 = 196.00, Gs3 = 207.65, A3 = 220.00, Bb3 = 233.08, B3 = 246.94;
// Octave 4
const C4 = 261.63, Cs4 = 277.18, D4 = 293.66, Eb4 = 311.13, E4 = 329.63, F4 = 349.23, Fs4 = 369.99, G4 = 392.00, Gs4 = 415.30, A4 = 440.00, Bb4 = 466.16, B4 = 493.88;
// Octave 5
const C5 = 523.25, Cs5 = 554.37, D5 = 587.33, Eb5 = 622.25, E5 = 659.25, F5 = 698.46, Fs5 = 739.99, G5 = 783.99, Gs5 = 830.61;
// Octave 6
const C6 = 1046.50;

// Rest = 0 (silence)
const R = 0;

// A note in a track: [frequency, duration in beats]
// Duration: 1 = eighth note, 2 = quarter note, 4 = half note, 8 = whole note
type Note = [number, number];

export interface MusicTrack {
  id: string;
  bpm: number;
  melody: Note[];
  bass: Note[];
}

// ── Title Theme ─────────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Title Screen
const titleTrack: MusicTrack = {
  id: 'title',
  bpm: 134,
  melody: [
    [E3, 1], [G3, 1], [B3, 1], [D4, 1], [G3, 1], [R, 1], [G3, 1], [R, 2],
    [G3, 1], [G3, 1], [G3, 1], [R, 1], [G3, 1], [R, 1], [G3, 1], [R, 1],
    [A3, 1], [A3, 1], [A3, 1], [A3, 1], [A3, 1], [Fs3, 1], [D4, 3],
    [B3, 1], [D4, 4], [C4, 3],
    [F4, 3], [C4, 2], [D4, 4],
    [F4, 3], [E4, 1], [Eb4, 1], [D4, 4],
    [C4, 1], [B3, 1], [C4, 1], [D4, 3], [B3, 1], [D4, 4],
    [C4, 1],
  ],
  bass: [
    [G3, 1], [R, 1], [D3, 1], [R, 1], [G3, 1], [R, 2], [G3, 1],
    [R, 3], [G3, 1], [G3, 1], [G3, 1], [R, 2],
    [G3, 1], [R, 2], [G3, 1], [R, 2], [F3, 1], [F3, 1],
    [F3, 1], [F3, 1], [F3, 1], [A3, 1], [G3, 2], [D3, 1], [G3, 2],
    [D3, 1], [G3, 1], [D3, 1], [F3, 2], [C3, 1], [F3, 2],
    [C3, 1], [F3, 1], [C3, 1], [G3, 2], [D3, 1], [G3, 2],
    [D3, 1], [G3, 1], [D3, 1], [G3, 2], [D3, 1], [G3, 2],
    [D3, 1], [G3, 1], [D3, 1], [G3, 2], [D3, 1], [G3, 1],
  ],
};

// ── Pallet Town ─────────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Pallet Town
const palletTownTrack: MusicTrack = {
  id: 'pallet_town',
  bpm: 121,
  melody: [
    [B4, 2], [C5, 1], [D5, 2], [G5, 1], [D5, 1], [C5, 1],
    [B4, 2], [G4, 1], [D5, 2], [D5, 1], [C5, 1], [B4, 1],
    [R, 1], [B4, 1], [C5, 1], [B4, 1], [C5, 2], [R, 3],
    [B4, 1], [C5, 1], [A4, 1], [B4, 1], [G4, 1], [A4, 1], [Fs4, 1], [B4, 2],
    [C5, 1], [D5, 2], [G5, 1], [D5, 1], [C5, 1], [B4, 2],
    [G4, 1], [D5, 2], [D5, 1], [G5, 1], [Fs5, 1], [E5, 2],
    [D5, 1], [C5, 2], [A4, 1], [B4, 1], [C5, 1], [D5, 1], [C5, 1],
    [B4, 1], [A4, 1], [G4, 2], [Fs4, 2],
  ],
  bass: [
    [G4, 3], [E4, 3], [Fs4, 2],
    [G4, 3], [A4, 3], [G4, 2],
    [E4, 3], [Fs4, 3], [E4, 2],
    [G4, 3], [E4, 3], [D4, 2],
    [G4, 3], [E4, 3], [Fs4, 2],
    [G4, 3], [A4, 3], [G4, 2],
    [E4, 3], [Fs4, 3], [A4, 2],
    [G4, 3], [E4, 3], [D4, 2],
  ],
};

// ── Route 1 ─────────────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Route 1
const routeTrack: MusicTrack = {
  id: 'route',
  bpm: 127,
  melody: [
    [D5, 1], [E5, 1], [Fs5, 1], [Fs5, 1], [Fs5, 1], [D5, 1], [E5, 1], [Fs5, 1],
    [Fs5, 1], [Fs5, 1], [D5, 1], [E5, 1], [Fs5, 1], [Fs5, 1], [G5, 1], [R, 1],
    [Fs5, 1], [E5, 1], [R, 2], [Cs5, 1], [D5, 1], [E5, 1], [E5, 1],
    [E5, 1], [Cs5, 1], [D5, 1], [E5, 1], [E5, 1], [E5, 1], [Cs5, 1], [D5, 1],
    [E5, 1], [E5, 1], [Fs5, 1], [E5, 1], [E5, 1], [Fs5, 1], [D5, 1], [R, 1],
    [Fs5, 1], [D5, 1], [E5, 1], [Fs5, 1], [Fs5, 1], [Fs5, 1], [D5, 1], [E5, 1],
    [Fs5, 1], [Fs5, 1], [Fs5, 1], [D5, 1], [E5, 1], [Fs5, 1], [Fs5, 1], [G5, 1],
    [R, 1], [Fs5, 1], [E5, 1], [R, 2], [Cs5, 1], [D5, 1], [E5, 1],
  ],
  bass: [
    [R, 1], [D4, 2], [Cs4, 2], [B3, 2], [A3, 2],
    [D4, 2], [A3, 2], [B3, 2], [A3, 2],
    [Cs4, 2], [A3, 2], [B3, 2], [C4, 2],
    [Cs4, 2], [A3, 2], [D4, 2], [A3, 2],
    [D4, 2], [Cs4, 2], [B3, 2], [A3, 2],
    [D4, 2], [A3, 2], [B3, 2], [A3, 2],
    [Cs4, 2], [B3, 2], [A3, 2], [B3, 2],
    [Cs4, 2], [A3, 2], [D4, 2], [A3, 1],
  ],
};

// ── Vermilion City (Town Theme) ─────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Vermilion City
const townTrack: MusicTrack = {
  id: 'town',
  bpm: 123,
  melody: [
    [E4, 2], [Cs4, 1], [D4, 1], [E4, 1], [A4, 2], [B4, 1],
    [A4, 1], [Gs4, 1], [Fs4, 1], [E4, 1], [Fs4, 1], [A4, 2], [Fs4, 1],
    [Gs4, 1], [A4, 1], [E4, 2], [Cs4, 1], [E4, 1], [A4, 1], [Gs4, 1],
    [B4, 1], [A4, 1], [Gs4, 1], [E4, 1], [Fs4, 1], [Gs4, 1], [Cs4, 1], [D4, 1],
    [E4, 1], [Fs4, 1], [E4, 2], [Cs4, 1], [D4, 1], [E4, 1], [A4, 2],
    [B4, 1], [A4, 1], [Gs4, 1], [Fs4, 1], [E4, 1], [Fs4, 1], [A4, 2],
    [Fs4, 1], [Gs4, 1], [A4, 1], [E4, 2], [Cs4, 1], [D4, 1], [E4, 1],
    [A4, 1], [Gs4, 1], [Fs4, 1], [A4, 1], [Gs4, 1], [E4, 1], [Fs4, 1],
  ],
  bass: [
    [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1],
    [Gs4, 1], [E4, 1], [Gs4, 1], [E4, 1], [A4, 1], [Gs4, 1], [Fs4, 1], [E4, 1],
    [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1],
    [Gs4, 1], [E4, 1], [Gs4, 1], [E4, 1], [A4, 1], [Gs4, 1], [Fs4, 1], [Gs4, 1],
    [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1],
    [Gs4, 1], [E4, 1], [Gs4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1],
    [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1],
    [Gs4, 1], [E4, 1], [Gs4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1],
  ],
};

// ── Pokemon Center ──────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Pokemon Center
const pokemonCenterTrack: MusicTrack = {
  id: 'pokemon_center',
  bpm: 134,
  melody: [
    [Fs4, 1], [F4, 1], [Fs4, 1], [D5, 2], [Cs5, 1], [B4, 1], [A4, 1],
    [B4, 1], [A4, 1], [G4, 1], [Fs4, 1], [E4, 1], [Fs4, 1], [G4, 1], [A4, 1],
    [A4, 1], [E4, 1], [A4, 1], [Cs5, 2], [B4, 1], [A4, 1], [G4, 1],
    [Fs4, 1], [A4, 1], [B4, 1], [Cs5, 1], [D5, 1], [Cs5, 1], [B4, 1], [A4, 1],
    [Fs4, 1], [F4, 1], [Fs4, 1], [D5, 2], [Cs5, 1], [B4, 1], [A4, 1],
    [B4, 1], [A4, 1], [G4, 1], [Fs4, 1], [E4, 1], [Fs4, 1], [G4, 1], [A4, 1],
    [A4, 1], [E4, 1], [A4, 1], [Cs5, 2], [B4, 1], [A4, 1], [G4, 1],
    [Fs4, 1], [E4, 1], [D4, 1], [E4, 1], [Fs4, 1], [G4, 1], [A4, 1], [B4, 1],
  ],
  bass: [
    [D4, 1], [Fs4, 1], [D4, 1], [Fs4, 1], [D4, 1], [Fs4, 1], [G4, 1], [Fs4, 1],
    [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1],
    [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [G4, 1], [A4, 1],
    [Fs4, 1], [A4, 1], [Fs4, 1], [A4, 1], [Fs4, 1], [A4, 1], [G4, 1], [A4, 1],
    [D4, 1], [Fs4, 1], [D4, 1], [Fs4, 1], [D4, 1], [Fs4, 1], [G4, 1], [Fs4, 1],
    [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1],
    [E4, 1], [A4, 1], [E4, 1], [A4, 1], [E4, 1], [A4, 1], [G4, 1], [A4, 1],
    [D4, 1], [Fs4, 1], [D4, 1], [Fs4, 1], [D4, 1], [B4, 1], [A4, 1], [G4, 1],
  ],
};

// ── Gym ─────────────────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Gym
const gymTrack: MusicTrack = {
  id: 'gym',
  bpm: 140,
  melody: [
    [G4, 3], [C4, 1], [G4, 1], [F4, 3],
    [Bb3, 1], [F4, 1], [E4, 3], [A3, 1], [E4, 1], [F4, 2],
    [G4, 2], [E4, 2], [F4, 1], [G4, 1], [F4, 1], [E4, 1],
    [D4, 1], [C4, 1], [D4, 1], [R, 1], [E4, 1], [F4, 2], [E4, 1],
    [D4, 1], [E4, 1], [F4, 1], [E4, 2], [F4, 1], [G4, 1], [F4, 1],
    [E4, 1], [D4, 1], [C4, 1], [D4, 1], [D4, 1], [E4, 1], [F4, 2],
    [E4, 1], [D4, 1], [E4, 1], [F4, 1], [C5, 2], [Bb4, 1], [C5, 1],
    [Bb4, 1], [A4, 1], [G4, 1], [F4, 1], [Bb4, 1], [R, 1], [F4, 1],
  ],
  bass: [
    [R, 13],
    [G4, 1], [F4, 1], [D4, 1], [E4, 1], [G4, 1], [E4, 1], [G4, 1], [E4, 1],
    [G4, 1], [E4, 1], [G4, 1], [D4, 1], [F4, 1], [D4, 1], [F4, 1], [D4, 1],
    [F4, 1], [D4, 1], [F4, 1], [E4, 1], [G4, 1], [E4, 1], [G4, 1], [E4, 1],
    [G4, 1], [E4, 1], [G4, 1], [D4, 1], [F4, 1], [D4, 1], [F4, 1], [D4, 1],
    [F4, 1], [D4, 1], [F4, 1], [E4, 1], [G4, 1], [E4, 1], [G4, 1], [E4, 1],
    [G4, 1], [E4, 1], [G4, 1], [D4, 1], [F4, 1], [D4, 1], [F4, 1], [D4, 1],
    [F4, 1], [D4, 1], [F4, 1],
  ],
};

// ── Mt Moon / Cave ──────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Mt. Moon
const caveTrack: MusicTrack = {
  id: 'cave',
  bpm: 121,
  melody: [
    [Eb5, 2], [R, 1], [Cs5, 2], [R, 1], [B4, 1], [Cs5, 1],
    [Eb5, 1], [G5, 1], [Eb5, 1], [Cs5, 2], [R, 1], [B4, 1], [Cs5, 1],
    [Eb5, 1], [G5, 1], [Eb5, 1], [Cs5, 2], [R, 1], [B4, 1], [Bb4, 1],
    [B4, 2], [R, 1], [Cs5, 2], [R, 3],
    [Gs5, 2], [R, 1], [Fs5, 2], [R, 1], [E5, 1], [Fs5, 1],
    [Gs5, 1], [C6, 1], [Gs5, 1], [Fs5, 2], [R, 1], [E5, 1], [Fs5, 1],
    [Gs5, 1], [C6, 1], [Gs5, 1], [Fs5, 2], [R, 1], [E5, 1], [Eb5, 1],
    [E5, 2], [R, 1], [Fs5, 2], [R, 1], [E5, 2],
  ],
  bass: [
    [B3, 1], [Eb4, 1], [G4, 1], [B3, 1], [Eb4, 1], [G4, 1], [B3, 1], [Eb4, 1],
    [B3, 1], [Eb4, 1], [G4, 1], [B3, 1], [Eb4, 1], [G4, 1], [B3, 1], [Eb4, 1],
    [B3, 1], [Eb4, 1], [G4, 1], [B3, 1], [Eb4, 1], [G4, 1], [B3, 1], [Eb4, 1],
    [B3, 1], [Eb4, 1], [G4, 1], [B3, 1], [Eb4, 1], [G4, 1], [Eb4, 1], [E4, 1],
    [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1],
    [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1],
    [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1],
    [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1], [C5, 1], [E4, 1], [Gs4, 1],
  ],
};

// ── Lavender Town ───────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Lavender Town
// (Skipped 16-beat intro that plays on a channel we don't have)
const lavenderTrack: MusicTrack = {
  id: 'lavender',
  bpm: 127,
  melody: [
    [G4, 4], [G4, 4],
    [E4, 4], [E4, 4],
    [G4, 2], [Fs4, 2], [E4, 2], [B4, 2],
    [Cs4, 4], [Cs4, 4],
    [G4, 4], [G4, 4],
    [Fs4, 4], [Fs4, 4],
    [B4, 2], [G4, 2], [Fs4, 2], [B4, 2],
    [C5, 4], [C5, 4],
  ],
  bass: [
    [E4, 8],
    [D4, 8],
    [C4, 8],
    [E4, 2], [C4, 2], [B3, 2], [E4, 2],
    [E4, 8],
    [D4, 8],
    [C4, 8],
    [E4, 2], [C4, 2], [B3, 2], [E4, 2],
  ],
};

// ── Wild Pokemon Battle ─────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Wild Pokemon Battle
const wildBattleTrack: MusicTrack = {
  id: 'wild_battle',
  bpm: 186,
  melody: [
    [C5, 1], [B4, 1], [Bb4, 1], [A4, 1], [Bb4, 1], [A4, 1], [Gs4, 1], [G4, 1],
    [Gs4, 1], [G4, 1], [Fs4, 1], [F4, 1], [Fs4, 1], [F4, 1], [E4, 1], [Eb4, 1],
    [E4, 1], [Eb4, 1], [D4, 1], [Cs4, 1], [D4, 1], [Cs4, 1], [C4, 1], [B3, 1],
    [C4, 1], [B3, 1], [Bb3, 1], [A3, 1], [Bb3, 1], [B3, 1], [C4, 1], [Cs4, 1],
    [G4, 1], [R, 2], [E4, 1], [R, 2], [Eb4, 1], [R, 5],
    [Cs4, 1], [R, 6], [E4, 1],
    [R, 2], [Eb4, 1], [R, 4], [Cs4, 5],
  ],
  bass: [
    [Cs4, 1], [R, 1], [Cs4, 1], [C4, 1], [D4, 1], [R, 1], [D4, 1], [C4, 1],
    [Eb4, 1], [R, 1], [Eb4, 1], [C4, 1], [E4, 1], [R, 1], [E4, 1], [C4, 1],
    [F4, 1], [R, 1], [F4, 1], [C4, 1], [Fs4, 1], [R, 1], [Fs4, 1], [C4, 1],
    [G4, 1], [R, 1], [G4, 1], [C4, 1], [Bb3, 1], [B3, 1], [C4, 1], [G4, 1],
    [C4, 1], [G4, 1], [C4, 1], [G4, 1], [C4, 1], [G4, 1], [C4, 1], [G4, 1],
    [C4, 1], [G4, 1], [C4, 1], [G4, 1], [C4, 1], [G4, 1], [Cs4, 1], [Gs4, 1],
    [Cs4, 2], [Gs4, 1], [Bb4, 1], [Gs4, 1], [G4, 1], [Cs4, 1], [Gs4, 1],
    [Cs4, 2], [Gs4, 1], [Bb4, 1], [Gs4, 1], [F4, 1], [C4, 1], [G4, 1],
  ],
};

// ── Trainer Battle ──────────────────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Trainer Battle
const trainerBattleTrack: MusicTrack = {
  id: 'trainer_battle',
  bpm: 172,
  melody: [
    [R, 4], [F4, 1], [E4, 1], [F4, 1], [E4, 1],
    [Eb4, 1], [E4, 1], [Eb4, 1], [D4, 1], [Eb4, 1], [D4, 1], [Cs4, 1], [D4, 1],
    [Cs4, 1], [C4, 1], [Cs4, 1], [C4, 1], [B3, 1], [C4, 1], [B3, 1], [Bb3, 1],
    [B3, 1], [Bb3, 1], [A3, 1], [Bb3, 1], [D4, 2], [R, 1], [E4, 2],
    [R, 1], [F4, 2], [D4, 1], [E4, 2], [F4, 2],
    [R, 1], [C4, 2], [D4, 2], [R, 1], [E4, 2],
    [R, 1], [F4, 2], [D4, 1], [E4, 2], [F4, 2],
    [R, 1], [C4, 1], [Cs4, 1], [D4, 2], [R, 1], [E4, 1],
  ],
  bass: [
    [B3, 1], [Bb3, 1], [A3, 1], [G3, 1], [A3, 1], [Gs3, 1], [G3, 1], [Fs3, 1],
    [G3, 1], [Fs3, 1], [F3, 1], [E3, 1], [F3, 1], [E3, 1], [Eb3, 1], [D3, 1],
    [Eb3, 1], [D3, 1], [Cs3, 1], [C3, 1], [Cs3, 1], [C3, 1], [B2, 1], [Bb2, 1],
    [B2, 1], [Bb2, 1], [A2, 1], [Gs2, 1], [A2, 1], [Bb2, 1], [B2, 1], [B2, 1],
    [D3, 1], [E3, 1], [B2, 1], [F3, 1], [E3, 1], [D3, 1], [B2, 1], [B2, 1],
    [D3, 1], [E3, 1], [B2, 1], [D3, 1], [Bb2, 1], [C3, 1], [B2, 1], [B2, 1],
    [D3, 1], [E3, 1], [B2, 1], [F3, 1], [E3, 1], [D3, 1], [B2, 1], [B2, 1],
    [D3, 1], [E3, 1], [B2, 1], [D3, 1], [Bb2, 1], [C3, 1], [B2, 1], [B2, 1],
  ],
};

// ── Final Battle (Elite Four) ───────────────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Final Battle
const eliteFourTrack: MusicTrack = {
  id: 'elite_four',
  bpm: 172,
  melody: [
    [Fs4, 1], [F4, 1], [Fs4, 1], [G4, 1], [Fs4, 1], [G4, 1], [Gs4, 1], [G4, 1],
    [Gs4, 1], [A4, 1], [Gs4, 1], [A4, 1], [Bb4, 1], [A4, 1], [Bb4, 1], [B4, 1],
    [Bb4, 1], [B4, 1], [C5, 1], [B4, 1], [C5, 1], [Cs5, 1], [C5, 1], [Cs5, 1],
    [D5, 1], [Cs5, 1], [D5, 1], [Eb5, 1], [D5, 1], [Eb5, 1], [E5, 1], [Eb5, 1],
    [E4, 1], [E4, 1], [R, 3], [F4, 1], [F4, 1], [R, 3],
    [G4, 1], [G4, 1], [R, 3], [F4, 1], [F4, 1], [R, 3],
    [E4, 1], [E4, 1], [R, 3], [F4, 1], [F4, 1], [R, 3],
    [G4, 1], [G4, 1],
  ],
  bass: [
    [E4, 2], [E5, 2], [F4, 2], [Eb5, 2],
    [G4, 2], [D5, 2], [Gs4, 2], [B4, 2],
    [E4, 1], [E4, 1], [R, 3], [E4, 1], [E4, 1], [R, 3],
    [E4, 1], [E4, 1], [R, 3], [E4, 1], [E4, 1], [R, 1],
    [Eb4, 2], [E4, 1], [E4, 1], [R, 1], [B4, 2], [E4, 1],
    [E4, 1], [R, 1], [C5, 2], [E4, 1], [E4, 1], [R, 1], [D5, 2],
    [E4, 1], [E4, 1], [C5, 2], [Bb4, 1], [E4, 1], [E4, 1], [R, 1],
    [B4, 2], [E4, 1], [E4, 1], [R, 1],
  ],
};

// ── Victory Fanfare (Trainer Defeated) ──────────────────────
// Source: Nayuki.io MIDI transcription of Pokemon RBY Trainer Defeated
const victoryTrack: MusicTrack = {
  id: 'victory',
  bpm: 172,
  melody: [
    [D5, 1], [D5, 1], [D5, 1], [D5, 1], [A4, 1], [D5, 1], [Fs5, 3],
    [R, 1], [A4, 1], [R, 1], [Fs4, 1], [A4, 1], [B4, 1], [R, 1], [Gs4, 1],
    [B4, 1], [Cs5, 1], [B4, 1], [A4, 1], [G4, 1], [A4, 1], [B4, 1], [A4, 1],
    [G4, 1], [A4, 1], [R, 1], [Fs4, 1], [A4, 1], [B4, 1], [R, 1], [Gs4, 1],
    [B4, 1], [Cs5, 1], [D5, 1], [E5, 1], [Fs5, 1], [Cs5, 1], [B4, 1], [A4, 1],
    [Cs5, 1], [A4, 1], [R, 1], [Fs4, 1], [A4, 1], [B4, 1], [R, 1], [Gs4, 1],
    [B4, 1], [C5, 1], [R, 1], [A4, 1], [C5, 1], [D5, 1], [B4, 1], [D5, 1],
    [R, 1], [Cs5, 1], [B4, 1], [A4, 1], [G4, 1], [Fs4, 1], [G4, 1],
  ],
  bass: [
    [D5, 1], [D5, 1], [D5, 1], [B4, 1], [A4, 1], [G4, 1], [A4, 4],
    [Fs4, 1], [R, 1], [Fs4, 1], [R, 1], [Gs4, 1], [R, 1], [Gs4, 1], [R, 1],
    [A4, 1], [R, 1], [A4, 1], [R, 1], [B4, 1], [R, 1], [B4, 1], [R, 1],
    [Fs4, 1], [R, 1], [Fs4, 1], [R, 1], [Gs4, 1], [R, 1], [Gs4, 1], [R, 1],
    [A4, 1], [R, 1], [A4, 1], [R, 1], [Cs5, 1], [R, 1], [Cs5, 1], [A4, 1],
    [Fs4, 1], [D5, 1], [Fs4, 1], [R, 1], [Gs4, 1], [E5, 1], [Gs4, 1], [R, 1],
    [A4, 1], [F5, 1], [A4, 1], [R, 1], [B4, 1], [G5, 1], [B4, 1], [Bb4, 1],
    [A4, 1], [R, 1], [A4, 1], [R, 1], [A4, 1], [R, 1],
  ],
};

// ── Track Registry ───────────────────────────────────────────
export const MUSIC_TRACKS: Record<string, MusicTrack> = {
  title: titleTrack,
  pallet_town: palletTownTrack,
  route: routeTrack,
  town: townTrack,
  pokemon_center: pokemonCenterTrack,
  gym: gymTrack,
  cave: caveTrack,
  lavender: lavenderTrack,
  wild_battle: wildBattleTrack,
  trainer_battle: trainerBattleTrack,
  elite_four: eliteFourTrack,
  victory: victoryTrack,
};

// ── Map-to-Music Lookup ──────────────────────────────────────
const MAP_MUSIC: Record<string, string> = {
  // Pallet Town area
  pallet_town: 'pallet_town',
  player_house: 'pallet_town',
  oaks_lab: 'pallet_town',

  // Routes
  route1: 'route',
  route2: 'route',
  route3: 'route',
  route4: 'route',
  route5: 'route',
  route6: 'route',
  route7: 'route',
  route8: 'route',
  route9: 'route',
  route10: 'route',
  route11: 'route',
  route12: 'route',
  route13: 'route',
  route14: 'route',
  route15: 'route',
  route16: 'route',
  route17: 'route',
  route18: 'route',
  route19: 'route',
  route20: 'route',
  route21: 'route',
  route22: 'route',
  route23: 'route',
  route24: 'route',
  route25: 'route',
  viridian_forest: 'route',
  safari_zone: 'route',

  // Towns & cities
  viridian_city: 'town',
  pewter_city: 'town',
  cerulean_city: 'town',
  vermilion_city: 'town',
  celadon_city: 'town',
  saffron_city: 'town',
  fuchsia_city: 'town',
  cinnabar_island: 'town',
  indigo_plateau: 'town',

  // Pokemon Centers & Marts
  pokemon_center: 'pokemon_center',
  pokemart: 'pokemon_center',
  pokemon_center_pewter: 'pokemon_center',
  pokemon_center_cerulean: 'pokemon_center',
  pokemart_cerulean: 'pokemon_center',
  pokemon_center_vermilion: 'pokemon_center',
  pokemart_vermilion: 'pokemon_center',
  pokemon_center_route10: 'pokemon_center',
  pokemon_center_lavender: 'pokemon_center',
  pokemart_lavender: 'pokemon_center',
  pokemon_center_celadon: 'pokemon_center',
  pokemart_celadon: 'pokemon_center',
  pokemon_center_saffron: 'pokemon_center',
  pokemart_saffron: 'pokemon_center',
  pokemon_center_fuchsia: 'pokemon_center',
  pokemart_fuchsia: 'pokemon_center',
  pokemon_center_cinnabar: 'pokemon_center',
  pokemart_cinnabar: 'pokemon_center',
  pokemon_center_indigo: 'pokemon_center',

  // Gyms
  viridian_gym: 'gym',
  pewter_gym: 'gym',
  cerulean_gym: 'gym',
  vermilion_gym: 'gym',
  celadon_gym: 'gym',
  saffron_gym: 'gym',
  fuchsia_gym: 'gym',
  cinnabar_gym: 'gym',

  // Caves & dungeons
  mt_moon: 'cave',
  rock_tunnel: 'cave',
  seafoam_islands: 'cave',
  victory_road: 'cave',
  cerulean_cave: 'cave',
  pokemon_mansion: 'cave',

  // Lavender Town area
  lavender_town: 'lavender',
  pokemon_tower: 'lavender',
};

/**
 * Get the music track ID for a given map.
 * Checks the map's musicId override first, then the centralized lookup.
 */
export function getMusicForMap(map: MapData): string | null {
  if (map.musicId) return map.musicId;
  return MAP_MUSIC[map.id] ?? null;
}
