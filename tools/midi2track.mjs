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
 *   --maxbeats <n>    Truncate output to N beats (default: 256)
 *   --quantize <n>    Quantize grid: 0.5=sixteenth, 1=eighth, 2=quarter (default: 0.5)
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
  --maxbeats <n>    Max beats in output (default: 256)
  --quantize <n>    Grid size: 0.5=sixteenth, 1=eighth, 2=quarter (default: 0.5)
  --dump            Just dump raw note data per track/channel
  --id <name>       Track ID for output`);
  process.exit(0);
}

let filePath = null;
let melodyChannel = null;
let bassChannel = null;
let overrideBpm = null;
let transpose = 0;
let maxBeats = 256;
let quantize = 0.5;
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
  else if (arg === '--quantize') { quantize = parseFloat(args[++i]); }
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
  console.log(`Eighth note = ${eighthTicks} ticks, Sixteenth = ${eighthTicks / 2} ticks\n`);

  for (const [key, notes] of channelNotes) {
    const [trackIdx, ch] = key.split(':');
    const noteRange = notes.length > 0
      ? `${midiToName(Math.min(...notes.map(n => n.note)))} – ${midiToName(Math.max(...notes.map(n => n.note)))}`
      : 'none';
    const avgNote = notes.length > 0
      ? Math.round(notes.reduce((s, n) => s + n.note, 0) / notes.length)
      : 0;
    const lastTick = notes.length > 0 ? Math.max(...notes.map(n => n.endTick)) : 0;
    const totalBeats = Math.round(lastTick / eighthTicks);

    console.log(`═══ Track ${trackIdx}, Channel ${ch} ═══  (${notes.length} notes, range: ${noteRange}, avg: ${midiToName(avgNote)}, ~${totalBeats} eighth-note beats)`);

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

// ── Flatten polyphony ────────────────────────────────────────
// When multiple notes overlap in time on the same channel,
// keep only the highest note (for melody) or lowest (for bass).
function flattenPolyphony(notes, mode = 'high') {
  if (!notes || notes.length === 0) return [];

  // Sort by start tick, then by note (high or low priority)
  const sorted = [...notes].sort((a, b) => {
    if (a.startTick !== b.startTick) return a.startTick - b.startTick;
    return mode === 'high' ? b.note - a.note : a.note - b.note;
  });

  const result = [];
  let lastEnd = 0;

  for (const n of sorted) {
    // Skip notes that are entirely within a previous note
    if (n.startTick < lastEnd && n.endTick <= lastEnd) continue;

    // Trim notes that start during a previous note
    const adjusted = { ...n };
    if (adjusted.startTick < lastEnd) {
      adjusted.startTick = lastEnd;
    }

    if (adjusted.endTick > adjusted.startTick) {
      result.push(adjusted);
      lastEnd = adjusted.endTick;
    }
  }

  return result;
}

// ── Quantize notes into beat grid ────────────────────────────
function quantizeChannel(notes, mode = 'high') {
  if (!notes || notes.length === 0) return [];

  // Flatten polyphony first
  const flat = flattenPolyphony(notes, mode);

  const result = [];
  let currentTick = 0;

  for (const n of flat) {
    // Insert rest if there's a gap
    const gapTicks = n.startTick - currentTick;
    if (gapTicks > quantizeTicks * 0.5) {
      const restGridUnits = Math.max(1, Math.round(gapTicks / quantizeTicks));
      const restBeats = restGridUnits * quantize;
      result.push([0, restBeats]);
    }

    // Note duration in our beat units
    const durTicks = n.endTick - n.startTick;
    const durGridUnits = Math.max(1, Math.round(durTicks / quantizeTicks));
    const durBeats = durGridUnits * quantize;
    const freq = Math.round(midiToFreq(n.note) * 100) / 100;
    result.push([freq, durBeats]);

    currentTick = n.endTick;
  }

  return result;
}

const melodyNotes = channelNotes.get(melodyChannel) || [];
const bassNotes = channelNotes.get(bassChannel) || [];

let melody = quantizeChannel(melodyNotes, 'high');
let bass = quantizeChannel(bassNotes, 'low');

// ── Trim to maxBeats ─────────────────────────────────────────
function trimToBeats(notes, max) {
  const result = [];
  let total = 0;
  for (const [freq, dur] of notes) {
    if (total + dur > max) {
      const remaining = max - total;
      if (remaining >= quantize) result.push([freq, remaining]);
      break;
    }
    result.push([freq, dur]);
    total += dur;
  }
  return result;
}

// Make melody and bass same length (trim to shorter)
function equalizeLength(m, b) {
  const mLen = m.reduce((s, [, d]) => s + d, 0);
  const bLen = b.reduce((s, [, d]) => s + d, 0);
  const target = Math.min(mLen, bLen);
  return [trimToBeats(m, target), trimToBeats(b, target)];
}

melody = trimToBeats(melody, maxBeats);
bass = trimToBeats(bass, maxBeats);
[melody, bass] = equalizeLength(melody, bass);

// ── Format output ────────────────────────────────────────────
function formatBeatDur(dur) {
  // Display cleanly: 0.5 → 0.5, 1 → 1, 2 → 2, etc.
  if (dur === Math.floor(dur)) return String(dur);
  return String(dur);
}

function formatNote([freq, dur]) {
  const durStr = formatBeatDur(dur);
  if (freq === 0) return `[R, ${durStr}]`;
  const name = freqToConst(freq);
  if (name) return `[${name}, ${durStr}]`;
  return `[${freq}, ${durStr}]`;
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
