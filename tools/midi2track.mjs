#!/usr/bin/env node
/**
 * midi2track - Convert a MIDI file into the MusicTrack format used by musicTracks.ts
 *
 * Usage:
 *   node tools/midi2track.mjs <file.mid> [options]
 *
 * Options:
 *   --melody <ch>     MIDI channel for melody (default: auto-detect highest)
 *   --bass <ch>       MIDI channel for bass (default: auto-detect lowest)
 *   --track <n>       Use only MIDI track N (0-indexed, can repeat: --track 0 --track 1)
 *   --bpm <n>         Override BPM (default: read from MIDI or 120)
 *   --transpose <n>   Transpose all notes by N semitones
 *   --maxbeats <n>    Truncate output to N beats (default: 64)
 *   --quantize <n>    Quantize grid: 1=eighth, 2=quarter (default: 1)
 *   --dump            Dump raw note events per track/channel (for exploration)
 *   --id <name>       Track ID for the output
 */

import { readFileSync } from 'fs';
import { parseMidi } from 'midi-file';

// ── MIDI note number → frequency ─────────────────────────────
function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// ── MIDI note number → name (for display) ────────────────────
const NOTE_NAMES = ['C', 'Cs', 'D', 'Eb', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'Bb', 'B'];
function midiToName(note) {
  const octave = Math.floor(note / 12) - 1;
  return NOTE_NAMES[note % 12] + octave;
}

// ── Frequency → closest named constant ───────────────────────
const FREQ_TABLE = {};
for (let midi = 36; midi <= 96; midi++) { // C2 to C7
  FREQ_TABLE[midiToName(midi)] = Math.round(midiToFreq(midi) * 100) / 100;
}

function freqToConst(freq) {
  let closest = null;
  let closestDist = Infinity;
  for (const [name, f] of Object.entries(FREQ_TABLE)) {
    const dist = Math.abs(f - freq);
    if (dist < closestDist) {
      closestDist = dist;
      closest = name;
    }
  }
  return closest;
}

// ── Parse CLI args ───────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: node tools/midi2track.mjs <file.mid> [options]

Options:
  --melody <ch>     MIDI channel for melody (0-15, default: auto-detect)
  --bass <ch>       MIDI channel for bass (0-15, default: auto-detect)
  --track <n>       Only use MIDI track N (repeatable)
  --bpm <n>         Override BPM (default: from MIDI or 120)
  --transpose <n>   Transpose semitones (default: 0)
  --maxbeats <n>    Max beats in output (default: 64)
  --quantize <n>    Grid size: 1=eighth note, 2=quarter (default: 1)
  --dump            Just dump raw note data per track/channel
  --id <name>       Track ID for output`);
  process.exit(0);
}

let filePath = null;
let melodyChannel = null;
let bassChannel = null;
let overrideBpm = null;
let transpose = 0;
let maxBeats = 64;
let quantize = 1;
let dumpMode = false;
let trackId = 'my_track';
const trackFilter = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--melody') { melodyChannel = parseInt(args[++i]); }
  else if (arg === '--bass') { bassChannel = parseInt(args[++i]); }
  else if (arg === '--track') { trackFilter.push(parseInt(args[++i])); }
  else if (arg === '--bpm') { overrideBpm = parseFloat(args[++i]); }
  else if (arg === '--transpose') { transpose = parseInt(args[++i]); }
  else if (arg === '--maxbeats') { maxBeats = parseInt(args[++i]); }
  else if (arg === '--quantize') { quantize = parseInt(args[++i]); }
  else if (arg === '--dump') { dumpMode = true; }
  else if (arg === '--id') { trackId = args[++i]; }
  else if (!arg.startsWith('--')) { filePath = arg; }
}

if (!filePath) {
  console.error('Error: no MIDI file specified');
  process.exit(1);
}

// ── Parse MIDI ───────────────────────────────────────────────
const midiData = readFileSync(filePath);
const midi = parseMidi(midiData);

// Extract tempo from MIDI (first setTempo event found)
let microsPerBeat = 500000; // default 120 BPM
for (const track of midi.tracks) {
  for (const event of track) {
    if (event.type === 'setTempo') {
      microsPerBeat = event.microsecondsPerBeat;
      break;
    }
  }
}
const midiBpm = Math.round(60000000 / microsPerBeat);
const bpm = overrideBpm || midiBpm;

// Ticks per beat from MIDI header
const ticksPerBeat = midi.header.ticksPerBeat || 480;

// Duration of one eighth note in ticks (our base unit = 1 beat)
// In our system: 1 beat = eighth note, so 2 beats = quarter note
// A quarter note = ticksPerBeat, so eighth = ticksPerBeat / 2
const eighthTicks = ticksPerBeat / 2;
const quantizeTicks = eighthTicks * quantize;

// ── Extract note events ──────────────────────────────────────
// Collect all note events per track+channel
const channelNotes = new Map(); // key: "track:channel" → [{note, startTick, endTick}]

for (let trackIdx = 0; trackIdx < midi.tracks.length; trackIdx++) {
  if (trackFilter.length > 0 && !trackFilter.includes(trackIdx)) continue;

  const track = midi.tracks[trackIdx];
  let tick = 0;
  const activeNotes = new Map(); // note → startTick

  for (const event of track) {
    tick += event.deltaTime;

    if (event.type === 'noteOn' && event.velocity > 0) {
      const ch = event.channel;
      const key = `${trackIdx}:${ch}`;
      if (!channelNotes.has(key)) channelNotes.set(key, []);
      activeNotes.set(`${ch}:${event.noteNumber}`, tick);
    }
    else if (event.type === 'noteOff' || (event.type === 'noteOn' && event.velocity === 0)) {
      const ch = event.channel;
      const noteKey = `${ch}:${event.noteNumber}`;
      const startTick = activeNotes.get(noteKey);
      if (startTick !== undefined) {
        const key = `${trackIdx}:${ch}`;
        if (!channelNotes.has(key)) channelNotes.set(key, []);
        channelNotes.get(key).push({
          note: event.noteNumber + transpose,
          startTick,
          endTick: tick,
        });
        activeNotes.delete(noteKey);
      }
    }
  }
}

// ── Dump mode ────────────────────────────────────────────────
if (dumpMode) {
  console.log(`MIDI file: ${filePath}`);
  console.log(`Format: ${midi.header.format}, Tracks: ${midi.header.numTracks}, Ticks/beat: ${ticksPerBeat}`);
  console.log(`Tempo: ${midiBpm} BPM (${microsPerBeat} µs/beat)`);
  console.log(`Eighth note = ${eighthTicks} ticks\n`);

  for (const [key, notes] of channelNotes) {
    const [trackIdx, ch] = key.split(':');
    const noteRange = notes.length > 0
      ? `${midiToName(Math.min(...notes.map(n => n.note)))} – ${midiToName(Math.max(...notes.map(n => n.note)))}`
      : 'none';
    const avgNote = notes.length > 0
      ? Math.round(notes.reduce((s, n) => s + n.note, 0) / notes.length)
      : 0;

    console.log(`═══ Track ${trackIdx}, Channel ${ch} ═══  (${notes.length} notes, range: ${noteRange}, avg: ${midiToName(avgNote)})`);

    // Show first N notes
    const preview = notes.slice(0, 48);
    for (const n of preview) {
      const durTicks = n.endTick - n.startTick;
      const durEighths = Math.round(durTicks / eighthTicks * 10) / 10;
      const beat = Math.round(n.startTick / ticksPerBeat * 100) / 100;
      console.log(`  beat ${String(beat).padStart(7)}: ${midiToName(n.note).padEnd(5)} dur=${String(durEighths).padStart(4)} eighths  (${durTicks} ticks)`);
    }
    if (notes.length > 48) console.log(`  ... and ${notes.length - 48} more notes`);
    console.log();
  }

  // Suggest channels
  const channelAvg = new Map();
  for (const [key, notes] of channelNotes) {
    if (notes.length === 0) continue;
    const avg = notes.reduce((s, n) => s + n.note, 0) / notes.length;
    channelAvg.set(key, { avg, count: notes.length });
  }
  const sorted = [...channelAvg.entries()].sort((a, b) => b[1].avg - a[1].avg);
  if (sorted.length >= 2) {
    console.log('Suggested usage:');
    console.log(`  --melody channel: Track:Ch ${sorted[0][0]} (avg note: ${midiToName(Math.round(sorted[0][1].avg))}, ${sorted[0][1].count} notes)`);
    console.log(`  --bass channel:   Track:Ch ${sorted[sorted.length - 1][0]} (avg note: ${midiToName(Math.round(sorted[sorted.length - 1][1].avg))}, ${sorted[sorted.length - 1][1].count} notes)`);
  }
  process.exit(0);
}

// ── Auto-detect melody & bass channels ───────────────────────
if (melodyChannel === null || bassChannel === null) {
  const channelAvg = [];
  for (const [key, notes] of channelNotes) {
    if (notes.length < 4) continue; // skip sparse channels
    const [, ch] = key.split(':').map(Number);
    if (ch === 9) continue; // skip percussion
    const avg = notes.reduce((s, n) => s + n.note, 0) / notes.length;
    channelAvg.push({ key, ch, avg, count: notes.length });
  }
  channelAvg.sort((a, b) => b.avg - a.avg);

  if (channelAvg.length === 0) {
    console.error('Error: no usable note data found in MIDI');
    process.exit(1);
  }

  if (melodyChannel === null) {
    melodyChannel = channelAvg[0].key;
  } else {
    // Find the key matching the specified channel
    melodyChannel = channelAvg.find(c => c.ch === melodyChannel)?.key || `0:${melodyChannel}`;
  }

  if (bassChannel === null && channelAvg.length >= 2) {
    bassChannel = channelAvg[channelAvg.length - 1].key;
  } else if (bassChannel === null) {
    bassChannel = melodyChannel; // fallback: same channel
  } else {
    bassChannel = channelAvg.find(c => c.ch === bassChannel)?.key || `0:${bassChannel}`;
  }
}

// Handle when melody/bass are specified as plain channel numbers
if (typeof melodyChannel === 'number') {
  const key = [...channelNotes.keys()].find(k => k.endsWith(`:${melodyChannel}`));
  melodyChannel = key || `0:${melodyChannel}`;
}
if (typeof bassChannel === 'number') {
  const key = [...channelNotes.keys()].find(k => k.endsWith(`:${bassChannel}`));
  bassChannel = key || `0:${bassChannel}`;
}

console.error(`Using melody: ${melodyChannel}, bass: ${bassChannel}, BPM: ${bpm}`);

// ── Quantize notes into beat grid ────────────────────────────
function quantizeChannel(notes) {
  if (!notes || notes.length === 0) return [];

  const result = [];
  let currentTick = 0;

  for (const n of notes) {
    // Insert rest if there's a gap
    const gapTicks = n.startTick - currentTick;
    if (gapTicks > quantizeTicks * 0.5) {
      const restBeats = Math.max(1, Math.round(gapTicks / quantizeTicks)) * quantize;
      result.push([0, restBeats]); // R = 0
    }

    // Note duration in our beat units
    const durTicks = n.endTick - n.startTick;
    const durBeats = Math.max(1, Math.round(durTicks / quantizeTicks)) * quantize;
    const freq = Math.round(midiToFreq(n.note) * 100) / 100;
    result.push([freq, durBeats]);

    currentTick = n.endTick;
  }

  return result;
}

const melodyNotes = channelNotes.get(melodyChannel) || [];
const bassNotes = channelNotes.get(bassChannel) || [];

let melody = quantizeChannel(melodyNotes);
let bass = quantizeChannel(bassNotes);

// ── Trim to maxBeats ─────────────────────────────────────────
function trimToBeats(notes, max) {
  const result = [];
  let total = 0;
  for (const [freq, dur] of notes) {
    if (total + dur > max) {
      const remaining = max - total;
      if (remaining > 0) result.push([freq, remaining]);
      break;
    }
    result.push([freq, dur]);
    total += dur;
  }
  // Pad with rest if short
  const currentTotal = result.reduce((s, [, d]) => s + d, 0);
  if (currentTotal < max) {
    result.push([0, max - currentTotal]);
  }
  return result;
}

melody = trimToBeats(melody, maxBeats);
bass = trimToBeats(bass, maxBeats);

// ── Format output ────────────────────────────────────────────
function formatNote([freq, dur]) {
  if (freq === 0) return `[R, ${dur}]`;
  const name = freqToConst(freq);
  if (name) return `[${name}, ${dur}]`;
  return `[${freq}, ${dur}]`;
}

function formatNoteArray(notes, label) {
  const lines = ['  ' + label + ': ['];
  let line = '    ';
  let lineNotes = 0;
  let lineBeats = 0;

  for (const note of notes) {
    const formatted = formatNote(note);
    // Start new line every ~8 beats for readability
    if (lineBeats >= 8 && lineNotes > 0) {
      lines.push(line);
      line = '    ';
      lineNotes = 0;
      lineBeats = 0;
    }
    line += formatted + ', ';
    lineNotes++;
    lineBeats += note[1];
  }
  if (lineNotes > 0) lines.push(line);
  lines.push('  ],');
  return lines.join('\n');
}

const melodyTotal = melody.reduce((s, [, d]) => s + d, 0);
const bassTotal = bass.reduce((s, [, d]) => s + d, 0);

console.log(`\n// ── ${trackId} ──`);
console.log(`// Source: ${filePath}`);
console.log(`// Melody: ${melodyChannel} (${melodyNotes.length} raw notes → ${melody.length} quantized)`);
console.log(`// Bass: ${bassChannel} (${bassNotes.length} raw notes → ${bass.length} quantized)`);
console.log(`// Melody beats: ${melodyTotal}, Bass beats: ${bassTotal}`);
console.log(`const ${trackId}Track: MusicTrack = {`);
console.log(`  id: '${trackId}',`);
console.log(`  bpm: ${bpm},`);
console.log(formatNoteArray(melody, 'melody'));
console.log(formatNoteArray(bass, 'bass'));
console.log(`};`);
