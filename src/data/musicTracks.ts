import { MapData } from '../types/map.types';

// Note frequencies (octave 2-6)
const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
// Sharps/flats
const Fs3 = 185.00, Ab3 = 207.65, Bb3 = 233.08;
const Cs4 = 277.18, Eb4 = 311.13, Fs4 = 369.99, Gs4 = 415.30, Bb4 = 466.16;
const Cs5 = 554.37, Eb5 = 622.25;

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

// ── Title Theme (C major, I-bVII) ───────────────────────────
// Based on the Pokemon RBY title screen — arpeggiated C major opening,
// I-bVII (C-Bb) oscillation, heroic ascending melody
const titleTrack: MusicTrack = {
  id: 'title',
  bpm: 134,
  melody: [
    // Arpeggiated opening — ascending C major
    [C4, 1], [E4, 1], [G4, 1], [C5, 1], [E5, 1], [C5, 1], [G4, 1], [E4, 1],
    // Main theme phrase 1 — melody over I-bVII
    [G4, 2], [A4, 1], [Bb4, 1], [C5, 2], [D5, 2],
    [C5, 2], [Bb4, 1], [A4, 1], [G4, 2], [F4, 2],
    [G4, 4], [R, 4],
    // Phrase 2 — rising answer
    [C5, 2], [D5, 1], [C5, 1], [Bb4, 2], [A4, 2],
    [Bb4, 2], [C5, 1], [Bb4, 1], [A4, 2], [G4, 2],
    [A4, 1], [Bb4, 1], [C5, 2], [D5, 2], [E5, 2],
    [C5, 4], [R, 4],
  ],
  bass: [
    [C3, 2], [C3, 2], [C3, 2], [C3, 2],
    [C3, 2], [C3, 2], [Bb3, 2], [Bb3, 2],
    [C3, 2], [C3, 2], [Bb3, 2], [Bb3, 2],
    [C3, 4], [G3, 4],
    [C3, 2], [C3, 2], [Bb3, 2], [Bb3, 2],
    [C3, 2], [C3, 2], [Bb3, 2], [Bb3, 2],
    [F3, 2], [F3, 2], [G3, 2], [G3, 2],
    [C3, 4], [C3, 4],
  ],
};

// ── Pallet Town (G major) ───────────────────────────────────
// Gentle, nostalgic melody — the iconic opening area theme
const palletTownTrack: MusicTrack = {
  id: 'pallet_town',
  bpm: 108,
  melody: [
    // Phrase 1 — gentle descending then rising
    [D5, 2], [B4, 1], [G4, 1], [A4, 2], [B4, 2],
    [C5, 2], [B4, 1], [A4, 1], [G4, 4],
    [E4, 2], [G4, 1], [A4, 1], [B4, 2], [A4, 2],
    [G4, 4], [R, 4],
    // Phrase 2 — answer phrase
    [D5, 2], [C5, 1], [B4, 1], [A4, 2], [G4, 2],
    [A4, 2], [B4, 1], [C5, 1], [D5, 4],
    [E5, 2], [D5, 1], [C5, 1], [B4, 2], [A4, 2],
    [G4, 4], [R, 4],
  ],
  bass: [
    [G3, 2], [D3, 2], [G3, 2], [D3, 2],
    [C3, 2], [G3, 2], [C3, 2], [G3, 2],
    [E3, 2], [B3, 2], [E3, 2], [B3, 2],
    [D3, 4], [G3, 4],
    [G3, 2], [D3, 2], [G3, 2], [D3, 2],
    [C3, 2], [G3, 2], [D3, 2], [A3, 2],
    [C3, 2], [G3, 2], [D3, 2], [A3, 2],
    [G3, 4], [G3, 4],
  ],
};

// ── Route 1 (D major) ───────────────────────────────────────
// Upbeat, bouncy adventuring theme — staccato rhythmic feel
const routeTrack: MusicTrack = {
  id: 'route',
  bpm: 126,
  melody: [
    // Phrase 1 — the iconic bouncy opening
    [Fs4, 1], [R, 1], [D4, 1], [Fs4, 1], [A4, 2], [Fs4, 2],
    [G4, 1], [R, 1], [E4, 1], [G4, 1], [B4, 2], [A4, 2],
    [Fs4, 1], [A4, 1], [D5, 2], [Cs5, 2], [B4, 2],
    [A4, 4], [R, 4],
    // Phrase 2 — descending answer
    [D5, 1], [R, 1], [Cs5, 1], [B4, 1], [A4, 2], [Fs4, 2],
    [G4, 1], [R, 1], [A4, 1], [B4, 1], [A4, 2], [G4, 2],
    [Fs4, 1], [E4, 1], [D4, 1], [E4, 1], [Fs4, 2], [A4, 2],
    [D4, 4], [R, 4],
  ],
  bass: [
    [D3, 2], [A3, 2], [D3, 2], [A3, 2],
    [E3, 2], [B3, 2], [E3, 2], [B3, 2],
    [D3, 2], [A3, 2], [G3, 2], [G3, 2],
    [D3, 4], [A3, 4],
    [D3, 2], [A3, 2], [D3, 2], [A3, 2],
    [E3, 2], [B3, 2], [E3, 2], [B3, 2],
    [G3, 2], [A3, 2], [D3, 2], [A3, 2],
    [D3, 4], [D3, 4],
  ],
};

// ── Viridian/Pewter/Cerulean City (C major) ─────────────────
// Cheerful town theme — based on the city theme style from RBY
const townTrack: MusicTrack = {
  id: 'town',
  bpm: 120,
  melody: [
    // Phrase 1 — bright, stepping melody
    [E4, 2], [G4, 1], [A4, 1], [G4, 2], [E4, 2],
    [C5, 2], [B4, 1], [A4, 1], [G4, 4],
    [A4, 2], [B4, 1], [C5, 1], [D5, 2], [C5, 2],
    [B4, 2], [A4, 2], [G4, 4],
    // Phrase 2 — ascending answer
    [C5, 2], [D5, 1], [E5, 1], [D5, 2], [C5, 2],
    [B4, 2], [A4, 1], [B4, 1], [C5, 4],
    [A4, 2], [G4, 1], [A4, 1], [B4, 2], [G4, 2],
    [C4, 4], [R, 4],
  ],
  bass: [
    [C3, 2], [G3, 2], [C3, 2], [G3, 2],
    [F3, 2], [C3, 2], [G3, 2], [D3, 2],
    [F3, 2], [C3, 2], [G3, 2], [D3, 2],
    [E3, 2], [A3, 2], [G3, 4],
    [A3, 2], [E3, 2], [F3, 2], [C3, 2],
    [G3, 2], [D3, 2], [C3, 2], [G3, 2],
    [F3, 2], [C3, 2], [G3, 2], [D3, 2],
    [C3, 4], [C3, 4],
  ],
};

// ── Pokemon Center (C major) ────────────────────────────────
// The welcoming, safe healing theme — gentle ascending arpeggios
const pokemonCenterTrack: MusicTrack = {
  id: 'pokemon_center',
  bpm: 112,
  melody: [
    // Phrase 1 — the recognizable ascending opening
    [E4, 1], [G4, 1], [C5, 2], [E5, 2], [D5, 2],
    [C5, 1], [B4, 1], [A4, 2], [G4, 4],
    [A4, 1], [B4, 1], [C5, 2], [D5, 2], [E5, 2],
    [D5, 2], [C5, 2], [B4, 4],
    // Phrase 2 — playful answer
    [C5, 1], [D5, 1], [E5, 2], [G5, 2], [E5, 2],
    [D5, 1], [C5, 1], [B4, 2], [A4, 4],
    [G4, 1], [A4, 1], [B4, 2], [C5, 2], [A4, 2],
    [G4, 4], [R, 4],
  ],
  bass: [
    [C3, 2], [E3, 2], [G3, 2], [E3, 2],
    [F3, 2], [A3, 2], [G3, 2], [D3, 2],
    [F3, 2], [A3, 2], [G3, 2], [E3, 2],
    [G3, 2], [E3, 2], [G3, 4],
    [C3, 2], [E3, 2], [G3, 2], [E3, 2],
    [F3, 2], [A3, 2], [F3, 2], [D3, 2],
    [E3, 2], [G3, 2], [F3, 2], [D3, 2],
    [C3, 4], [C3, 4],
  ],
};

// ── Gym (Am, tense) ─────────────────────────────────────────
// Tense, determined — minor key, rhythmic, building intensity
const gymTrack: MusicTrack = {
  id: 'gym',
  bpm: 140,
  melody: [
    // Driving staccato opening
    [A4, 1], [R, 1], [A4, 1], [R, 1], [C5, 1], [B4, 1], [A4, 1], [R, 1],
    [G4, 1], [R, 1], [G4, 1], [R, 1], [A4, 1], [B4, 1], [C5, 1], [R, 1],
    [D5, 2], [C5, 2], [B4, 2], [A4, 2],
    [E4, 4], [R, 4],
    // Answer phrase — rising tension
    [E5, 1], [R, 1], [D5, 1], [C5, 1], [B4, 1], [R, 1], [A4, 1], [R, 1],
    [C5, 1], [R, 1], [B4, 1], [A4, 1], [G4, 1], [R, 1], [E4, 1], [R, 1],
    [A4, 2], [B4, 2], [C5, 2], [E5, 2],
    [D5, 2], [C5, 2], [A4, 2], [R, 2],
  ],
  bass: [
    [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1],
    [C3, 1], [G3, 1], [C3, 1], [G3, 1], [C3, 1], [G3, 1], [C3, 1], [G3, 1],
    [F3, 2], [F3, 2], [G3, 2], [G3, 2],
    [A3, 2], [E3, 2], [A3, 2], [E3, 2],
    [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1],
    [F3, 1], [C3, 1], [F3, 1], [C3, 1], [E3, 1], [B3, 1], [E3, 1], [B3, 1],
    [F3, 2], [G3, 2], [A3, 2], [A3, 2],
    [G3, 2], [F3, 2], [A3, 2], [E3, 2],
  ],
};

// ── Mt Moon / Cave (Am, mysterious) ─────────────────────────
// Dark, echoing, sparse — chromatic creeping melody with long rests
const caveTrack: MusicTrack = {
  id: 'cave',
  bpm: 92,
  melody: [
    [A4, 2], [R, 2], [E4, 2], [R, 2],
    [F4, 2], [E4, 2], [R, 4],
    [A4, 2], [R, 2], [C5, 2], [B4, 2],
    [A4, 2], [Gs4, 2], [A4, 2], [R, 2],
    [E5, 2], [R, 2], [D5, 2], [R, 2],
    [C5, 2], [B4, 2], [A4, 4],
    [F4, 2], [E4, 2], [F4, 2], [Gs4, 2],
    [A4, 4], [R, 4],
  ],
  bass: [
    [A3, 4], [A3, 4],
    [F3, 4], [E3, 4],
    [A3, 4], [A3, 4],
    [F3, 4], [E3, 4],
    [A3, 4], [A3, 4],
    [F3, 4], [A3, 4],
    [D3, 4], [E3, 4],
    [A3, 4], [A3, 4],
  ],
};

// ── Lavender Town (Bm/chromatic) ────────────────────────────
// The famous eerie theme — chromatic descending lines, unsettling intervals
const lavenderTrack: MusicTrack = {
  id: 'lavender',
  bpm: 108,
  melody: [
    // The iconic chromatic descent
    [B4, 2], [Bb4, 2], [A4, 2], [Gs4, 2],
    [A4, 2], [R, 2], [E4, 2], [R, 2],
    [B4, 2], [Bb4, 2], [A4, 2], [Gs4, 2],
    [Eb4, 2], [E4, 2], [R, 4],
    // Second phrase — wider intervals, more unsettling
    [Fs4, 2], [G4, 2], [Gs4, 2], [A4, 2],
    [Eb5, 2], [D5, 2], [Cs5, 2], [R, 2],
    [B4, 2], [Bb4, 2], [A4, 2], [E4, 2],
    [Fs4, 4], [R, 4],
  ],
  bass: [
    [E3, 2], [E3, 2], [E3, 2], [E3, 2],
    [A3, 4], [A3, 4],
    [E3, 2], [E3, 2], [E3, 2], [E3, 2],
    [Bb3, 4], [A3, 4],
    [D3, 2], [D3, 2], [D3, 2], [D3, 2],
    [A3, 4], [A3, 4],
    [E3, 2], [E3, 2], [A3, 2], [A3, 2],
    [Fs3, 4], [E3, 4],
  ],
};

// ── Wild Battle (Am, fast) ──────────────────────────────────
// Fast, energetic — driving eighth note patterns, the iconic opening riff
const wildBattleTrack: MusicTrack = {
  id: 'wild_battle',
  bpm: 158,
  melody: [
    // Opening riff — the recognizable rapid pattern
    [A4, 1], [A4, 1], [R, 1], [A4, 1], [C5, 1], [A4, 1], [E4, 1], [A4, 1],
    [G4, 1], [G4, 1], [R, 1], [G4, 1], [A4, 1], [G4, 1], [E4, 1], [G4, 1],
    [F4, 1], [A4, 1], [C5, 1], [A4, 1], [E5, 1], [D5, 1], [C5, 1], [B4, 1],
    [A4, 4], [R, 2], [E4, 1], [A4, 1],
    // Second phrase — higher register call-and-response
    [C5, 1], [C5, 1], [R, 1], [C5, 1], [D5, 1], [C5, 1], [B4, 1], [A4, 1],
    [E5, 1], [E5, 1], [R, 1], [D5, 1], [C5, 1], [B4, 1], [A4, 1], [G4, 1],
    [A4, 1], [C5, 1], [E5, 1], [C5, 1], [D5, 1], [B4, 1], [C5, 1], [A4, 1],
    [A4, 4], [R, 4],
  ],
  bass: [
    [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1],
    [C3, 1], [G3, 1], [C3, 1], [G3, 1], [C3, 1], [G3, 1], [C3, 1], [G3, 1],
    [F3, 1], [C3, 1], [F3, 1], [C3, 1], [G3, 1], [D3, 1], [G3, 1], [D3, 1],
    [A3, 2], [E3, 2], [A3, 2], [E3, 2],
    [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1],
    [C3, 1], [G3, 1], [C3, 1], [G3, 1], [E3, 1], [B3, 1], [E3, 1], [B3, 1],
    [F3, 1], [C3, 1], [F3, 1], [C3, 1], [G3, 1], [D3, 1], [G3, 1], [D3, 1],
    [A3, 2], [E3, 2], [A3, 2], [E3, 2],
  ],
};

// ── Trainer Battle (Am/Em, intense) ─────────────────────────
// More intense than wild — driving melody, chromatic runs
const trainerBattleTrack: MusicTrack = {
  id: 'trainer_battle',
  bpm: 152,
  melody: [
    // Opening "da-da-da-DA" motif
    [E4, 1], [E4, 1], [E4, 1], [R, 1], [E4, 1], [Fs4, 1], [Gs4, 1], [A4, 1],
    [B4, 2], [A4, 1], [Gs4, 1], [A4, 2], [E4, 2],
    [A4, 1], [A4, 1], [A4, 1], [R, 1], [A4, 1], [B4, 1], [C5, 1], [D5, 1],
    [E5, 2], [D5, 2], [C5, 2], [B4, 2],
    // Second phrase — call and response
    [C5, 1], [B4, 1], [A4, 1], [Gs4, 1], [A4, 2], [E5, 2],
    [D5, 1], [C5, 1], [B4, 1], [A4, 1], [B4, 2], [Gs4, 2],
    [A4, 1], [B4, 1], [C5, 1], [D5, 1], [E5, 2], [C5, 2],
    [B4, 2], [A4, 2], [Gs4, 2], [R, 2],
  ],
  bass: [
    [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 1], [E3, 1],
    [E3, 2], [E3, 2], [A3, 2], [A3, 2],
    [F3, 1], [C3, 1], [F3, 1], [C3, 1], [F3, 1], [C3, 1], [F3, 1], [C3, 1],
    [G3, 2], [G3, 2], [E3, 2], [E3, 2],
    [A3, 2], [E3, 2], [F3, 2], [C3, 2],
    [G3, 2], [D3, 2], [E3, 2], [B3, 2],
    [F3, 2], [C3, 2], [G3, 2], [E3, 2],
    [A3, 2], [E3, 2], [A3, 2], [E3, 2],
  ],
};

// ── Elite Four (Em, epic) ───────────────────────────────────
// Dramatic, fast, intense — builds on trainer battle with more urgency
const eliteFourTrack: MusicTrack = {
  id: 'elite_four',
  bpm: 164,
  melody: [
    // Opening — driving urgency
    [E4, 1], [R, 1], [E4, 1], [Fs4, 1], [G4, 2], [A4, 1], [B4, 1],
    [C5, 2], [B4, 1], [A4, 1], [G4, 2], [Fs4, 2],
    [E5, 1], [R, 1], [D5, 1], [C5, 1], [B4, 2], [A4, 1], [G4, 1],
    [A4, 4], [R, 4],
    // Second phrase — epic climbing
    [B4, 1], [R, 1], [C5, 1], [D5, 1], [E5, 2], [D5, 1], [C5, 1],
    [B4, 1], [A4, 1], [G4, 1], [Fs4, 1], [G4, 2], [A4, 2],
    [B4, 1], [C5, 1], [D5, 1], [E5, 1], [Fs4, 2], [G4, 2],
    [E4, 4], [R, 4],
  ],
  bass: [
    [E3, 1], [B3, 1], [E3, 1], [B3, 1], [G3, 2], [G3, 2],
    [A3, 1], [E3, 1], [A3, 1], [E3, 1], [A3, 2], [A3, 2],
    [C3, 1], [G3, 1], [C3, 1], [G3, 1], [D3, 2], [D3, 2],
    [E3, 2], [B3, 2], [E3, 2], [B3, 2],
    [G3, 1], [D3, 1], [G3, 1], [D3, 1], [A3, 2], [A3, 2],
    [E3, 1], [B3, 1], [E3, 1], [B3, 1], [G3, 2], [A3, 2],
    [C3, 2], [D3, 2], [D3, 2], [G3, 2],
    [E3, 2], [B3, 2], [E3, 2], [B3, 2],
  ],
};

// ── Victory Fanfare (C major) ───────────────────────────────
// Triumphant jingle — the classic ascending fanfare
const victoryTrack: MusicTrack = {
  id: 'victory',
  bpm: 132,
  melody: [
    // The iconic "da-da-da-DAAA" fanfare
    [G4, 1], [G4, 1], [G4, 1], [R, 1], [Eb4, 2], [F4, 2],
    [G4, 1], [R, 1], [F4, 1], [G4, 1], [C5, 4],
    [C5, 1], [C5, 1], [C5, 1], [R, 1], [G4, 2], [A4, 2],
    [B4, 1], [R, 1], [A4, 1], [B4, 1], [C5, 4],
    // Triumphant resolution
    [E5, 2], [D5, 1], [C5, 1], [D5, 2], [E5, 2],
    [F5, 2], [E5, 1], [D5, 1], [C5, 4],
    [D5, 2], [C5, 1], [B4, 1], [C5, 4],
    [C5, 8],
  ],
  bass: [
    [C3, 4], [Eb4, 4],
    [F3, 4], [C3, 4],
    [C3, 4], [F3, 4],
    [G3, 4], [C3, 4],
    [C3, 4], [G3, 4],
    [F3, 4], [C3, 4],
    [G3, 4], [C3, 4],
    [C3, 8],
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
