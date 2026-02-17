import { MUSIC_TRACKS, MusicTrack } from './data/musicTracks';
import { SoundSystem } from './systems/SoundSystem';

const sound = new SoundSystem();

const TRACK_DISPLAY_NAMES: Record<string, string> = {
  title: 'Title Screen',
  pallet_town: 'Pallet Town',
  route: 'Route Theme',
  town: 'Town Theme',
  pokemon_center: 'Pokemon Center',
  gym: 'Gym',
  cave: 'Cave',
  lavender: 'Lavender Town',
  wild_battle: 'Wild Battle',
  trainer_battle: 'Trainer Battle',
  elite_four: 'Elite Four',
  victory: 'Victory',
};

let playingCard: HTMLElement | null = null;
let animFrameId = 0;

// ── Track Cards ──────────────────────────────────────────

const grid = document.getElementById('grid')!;

function totalBeats(notes: [number, number][]): number {
  return notes.reduce((sum, n) => sum + n[1], 0);
}

function formatDuration(track: MusicTrack): string {
  const melodyBeats = totalBeats(track.melody as [number, number][]);
  const bassBeats = totalBeats(track.bass as [number, number][]);
  const maxBeats = Math.max(melodyBeats, bassBeats);
  const seconds = (maxBeats * 60) / (track.bpm * 2);
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

for (const [id, track] of Object.entries(MUSIC_TRACKS)) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.trackId = id;

  const melodyNotes = track.melody.filter(n => n[0] !== 0).length;
  const bassNotes = track.bass.filter(n => n[0] !== 0).length;

  card.innerHTML = `
    <span class="play-indicator">&#9654;</span>
    <div class="track-name">${TRACK_DISPLAY_NAMES[id] || id}</div>
    <div class="track-info">
      <span>${track.bpm} BPM</span>
      <span>${formatDuration(track)}</span>
    </div>
    <div class="track-info">
      <span>Melody: ${melodyNotes} notes</span>
      <span>Bass: ${bassNotes} notes</span>
    </div>
  `;

  card.addEventListener('click', () => {
    const currentId = sound.getCurrentTrackId();
    if (currentId === id) {
      // Stop current
      sound.stopMusic();
      card.classList.remove('playing');
      card.querySelector('.play-indicator')!.innerHTML = '&#9654;';
      playingCard = null;
    } else {
      // Stop previous
      if (playingCard) {
        playingCard.classList.remove('playing');
        playingCard.querySelector('.play-indicator')!.innerHTML = '&#9654;';
      }
      // Need to stop first so startMusic doesn't see same trackId
      sound.stopMusic();
      sound.startMusic(id);
      card.classList.add('playing');
      card.querySelector('.play-indicator')!.innerHTML = '&#9632;';
      playingCard = card;
    }
  });

  grid.appendChild(card);
}

// ── Volume Sliders ───────────────────────────────────────

const melodySlider = document.getElementById('melody-vol') as HTMLInputElement;
const bassSlider = document.getElementById('bass-vol') as HTMLInputElement;
const melodyValue = document.getElementById('melody-vol-value')!;
const bassValue = document.getElementById('bass-vol-value')!;

melodySlider.addEventListener('input', () => {
  const vol = parseInt(melodySlider.value);
  sound.setMelodyVolume(vol / 100);
  melodyValue.textContent = `${vol}%`;
});

bassSlider.addEventListener('input', () => {
  const vol = parseInt(bassSlider.value);
  sound.setBassVolume(vol / 100);
  bassValue.textContent = `${vol}%`;
});

// ── Note Visualization ───────────────────────────────────

const canvas = document.getElementById('viz-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resizeCanvas(): void {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Map frequency to Y position (log scale, clamped to useful range)
function freqToY(freq: number, yMin: number, yMax: number): number {
  if (freq <= 0) return (yMin + yMax) / 2;
  const logMin = Math.log2(60);   // ~C2
  const logMax = Math.log2(2100); // ~C7
  const logFreq = Math.log2(freq);
  const t = (logFreq - logMin) / (logMax - logMin);
  return yMax - t * (yMax - yMin);
}

function drawViz(): void {
  const w = canvas.width / devicePixelRatio;
  const h = canvas.height / devicePixelRatio;
  ctx.clearRect(0, 0, w, h);

  const track = sound.getCurrentTrack();
  if (!track) {
    ctx.fillStyle = '#555';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Select a track to visualize', w / 2, h / 2);
    animFrameId = requestAnimationFrame(drawViz);
    return;
  }

  const melodyIdx = sound.getMelodyIndex();
  const bassIdx = sound.getBassIndex();

  const melodyH = h / 2 - 4;
  const bassH = h / 2 - 4;
  const melodyTop = 0;
  const bassTop = h / 2 + 4;

  // Draw labels
  ctx.fillStyle = '#666';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MELODY (square)', 4, 12);
  ctx.fillText('BASS (triangle)', 4, bassTop + 12);

  // Draw divider
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Draw notes for a channel
  const drawChannel = (
    notes: [number, number][],
    currentIdx: number,
    yOffset: number,
    channelH: number,
    color: string,
    dimColor: string,
  ) => {
    const visibleNotes = 80;
    const startIdx = Math.max(0, currentIdx - 20);
    const noteWidth = w / visibleNotes;
    const bpm = track.bpm;

    let x = 0;
    for (let i = 0; i < visibleNotes && startIdx + i < notes.length; i++) {
      const idx = startIdx + i;
      const [freq, beats] = notes[idx];
      const barW = Math.max(1, noteWidth * beats - 1);

      if (freq === 0) {
        // Rest - draw dim bar
        ctx.fillStyle = '#222';
        ctx.fillRect(x, yOffset + channelH * 0.3, barW, channelH * 0.4);
      } else {
        const y = freqToY(freq, yOffset + 16, yOffset + channelH);
        const barH = Math.max(3, 6);

        if (idx === currentIdx) {
          // Current note - bright
          ctx.fillStyle = '#fff';
          ctx.fillRect(x, y - barH / 2, barW, barH);
          // Glow
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.4;
          ctx.fillRect(x - 1, y - barH / 2 - 2, barW + 2, barH + 4);
          ctx.globalAlpha = 1;
        } else if (idx < currentIdx) {
          // Past notes - dim
          ctx.fillStyle = dimColor;
          ctx.fillRect(x, y - barH / 2, barW, barH);
        } else {
          // Future notes
          ctx.fillStyle = color;
          ctx.fillRect(x, y - barH / 2, barW, barH);
        }
      }

      x += noteWidth * beats;
    }

    // Draw playhead
    const playheadNotes = currentIdx - startIdx;
    let playheadX = 0;
    for (let i = 0; i < playheadNotes && startIdx + i < notes.length; i++) {
      playheadX += noteWidth * notes[startIdx + i][1];
    }
    ctx.strokeStyle = '#f8d030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, yOffset);
    ctx.lineTo(playheadX, yOffset + channelH);
    ctx.stroke();
  };

  drawChannel(
    track.melody as [number, number][],
    melodyIdx,
    melodyTop,
    melodyH,
    '#4a9eff',
    '#1a3a5a',
  );

  drawChannel(
    track.bass as [number, number][],
    bassIdx,
    bassTop,
    bassH,
    '#ff6a4a',
    '#5a2a1a',
  );

  animFrameId = requestAnimationFrame(drawViz);
}

animFrameId = requestAnimationFrame(drawViz);
