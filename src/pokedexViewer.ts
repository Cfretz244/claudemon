import { CUSTOM_POKEMON_SPRITES } from './sprites/index';
import { POKEMON_DATA } from './data/pokemon';
import { POKEDEX_DESCRIPTIONS } from './data/pokedexDescriptions';

const SPRITE_SIZE = 32;
const DETAIL_SCALE = 4;
const THUMB_SCALE = 2;
const DETAIL_DISPLAY = SPRITE_SIZE * DETAIL_SCALE;
const THUMB_DISPLAY = SPRITE_SIZE * THUMB_SCALE;

let currentId = 1;

// Elements
const detailCanvas = document.getElementById('detail-canvas') as HTMLCanvasElement;
const detailNum = document.getElementById('detail-num')!;
const detailName = document.getElementById('detail-name')!;
const detailTypes = document.getElementById('detail-types')!;
const detailDesc = document.getElementById('detail-desc')!;
const detailStats = document.getElementById('detail-stats')!;
const counterEl = document.getElementById('counter')!;
const listGrid = document.getElementById('list-grid')!;
const searchInput = document.getElementById('search') as HTMLInputElement;
const screenContent = document.getElementById('screen-content')!;

function getTypeName(typeEnum: string): string {
  return typeEnum.toLowerCase();
}

// Draw a Pokemon sprite to a canvas context
function drawSprite(ctx: CanvasRenderingContext2D, id: number, size: number): void {
  const drawFn = CUSTOM_POKEMON_SPRITES[id];
  ctx.clearRect(0, 0, size, size);

  if (drawFn) {
    const off = document.createElement('canvas');
    off.width = SPRITE_SIZE;
    off.height = SPRITE_SIZE;
    const offCtx = off.getContext('2d')!;
    drawFn(offCtx, false);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, size, size);
  } else {
    ctx.fillStyle = '#6a8a2a';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#306230';
    ctx.font = `bold ${Math.floor(size / 3)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', size / 2, size / 2);
  }
}

function showDetail(id: number): void {
  const prevId = currentId;
  currentId = id;
  const species = POKEMON_DATA[id];
  if (!species) return;

  // Screen switch animation
  if (prevId !== id) {
    screenContent.classList.add('switching');
    setTimeout(() => {
      renderDetail(id, species);
      screenContent.classList.remove('switching');
    }, 100);
  } else {
    renderDetail(id, species);
  }

  // Counter
  counterEl.textContent = `${String(id).padStart(3, '0')} / 151`;

  // Active state in list
  document.querySelectorAll('.list-entry').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-id') === String(id));
  });

  // Scroll entry into view
  const activeEntry = document.querySelector(`.list-entry[data-id="${id}"]`);
  if (activeEntry) {
    activeEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

interface SpeciesData {
  name: string;
  types: string[];
  baseStats: { hp: number; attack: number; defense: number; special: number; speed: number };
}

function renderDetail(id: number, species: SpeciesData): void {
  // Sprite
  const ctx = detailCanvas.getContext('2d')!;
  drawSprite(ctx, id, DETAIL_DISPLAY);

  // Info
  detailNum.textContent = `#${String(id).padStart(3, '0')}`;
  detailName.textContent = species.name;

  // Types
  detailTypes.innerHTML = '';
  for (const t of species.types) {
    const name = getTypeName(t);
    const pill = document.createElement('span');
    pill.className = 'type-pill';
    pill.textContent = name.toUpperCase();
    detailTypes.appendChild(pill);
  }

  // Description
  const desc = POKEDEX_DESCRIPTIONS[id];
  detailDesc.textContent = desc || '';

  // Stats
  const bs = species.baseStats;
  const stats: [string, number][] = [
    ['HP', bs.hp],
    ['ATK', bs.attack],
    ['DEF', bs.defense],
    ['SPC', bs.special],
    ['SPD', bs.speed],
  ];

  detailStats.innerHTML = '';
  for (const [label, val] of stats) {
    const row = document.createElement('div');
    row.className = 'stat-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'stat-label';
    labelEl.textContent = label;

    const valEl = document.createElement('span');
    valEl.className = 'stat-val';
    valEl.textContent = String(val);

    const track = document.createElement('div');
    track.className = 'stat-bar-track';
    const fill = document.createElement('div');
    fill.className = 'stat-bar-fill';
    fill.style.width = `${Math.min(100, (val / 160) * 100)}%`;
    track.appendChild(fill);

    row.appendChild(labelEl);
    row.appendChild(valEl);
    row.appendChild(track);
    detailStats.appendChild(row);
  }
}

// Build list grid with staggered animation
for (let id = 1; id <= 151; id++) {
  const species = POKEMON_DATA[id];
  if (!species) continue;

  const entry = document.createElement('div');
  entry.className = 'list-entry';
  entry.setAttribute('data-id', String(id));
  entry.setAttribute('data-name', species.name.toLowerCase());
  entry.style.animationDelay = `${id * 8}ms`;

  const canvas = document.createElement('canvas');
  canvas.width = THUMB_DISPLAY;
  canvas.height = THUMB_DISPLAY;
  const ctx = canvas.getContext('2d')!;
  drawSprite(ctx, id, THUMB_DISPLAY);

  const idSpan = document.createElement('div');
  idSpan.className = 'entry-id';
  idSpan.textContent = `#${String(id).padStart(3, '0')}`;

  const nameSpan = document.createElement('div');
  nameSpan.className = 'entry-name';
  nameSpan.textContent = species.name;

  entry.appendChild(canvas);
  entry.appendChild(idSpan);
  entry.appendChild(nameSpan);

  entry.addEventListener('click', () => showDetail(id));
  listGrid.appendChild(entry);
}

// Compute how many columns the grid currently has
function getGridColumns(): number {
  const items = listGrid.querySelectorAll('.list-entry:not([style*="display: none"])');
  if (items.length < 2) return 1;
  const firstTop = (items[0] as HTMLElement).offsetTop;
  for (let i = 1; i < items.length; i++) {
    if ((items[i] as HTMLElement).offsetTop !== firstTop) return i;
  }
  return items.length;
}

function navigate(delta: number): void {
  const next = currentId + delta;
  if (next >= 1 && next <= 151) showDetail(next);
}

// Navigation buttons: up/down = prev/next, left/right = jump by row
document.getElementById('btn-prev')!.addEventListener('click', () => navigate(-1));
document.getElementById('btn-next')!.addEventListener('click', () => navigate(1));
document.getElementById('btn-prev10')!.addEventListener('click', () => {
  navigate(-getGridColumns());
});
document.getElementById('btn-next10')!.addEventListener('click', () => {
  navigate(getGridColumns());
});

// Keyboard navigation: arrows match visual grid layout
document.addEventListener('keydown', (e) => {
  if (document.activeElement === searchInput) return;

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      navigate(-1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      navigate(1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      navigate(-getGridColumns());
      break;
    case 'ArrowDown':
      e.preventDefault();
      navigate(getGridColumns());
      break;
    case 'Home':
      e.preventDefault();
      showDetail(1);
      break;
    case 'End':
      e.preventDefault();
      showDetail(151);
      break;
  }
});

// Search
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  const entries = document.querySelectorAll('.list-entry') as NodeListOf<HTMLElement>;

  if (!query) {
    entries.forEach(el => el.style.display = '');
    return;
  }

  let firstMatch: number | null = null;
  entries.forEach(el => {
    const name = el.getAttribute('data-name') || '';
    const id = el.getAttribute('data-id') || '';
    const match = name.includes(query) || id.includes(query);
    el.style.display = match ? '' : 'none';
    if (match && firstMatch === null) firstMatch = parseInt(id);
  });

  // Auto-select first search match
  if (firstMatch !== null) showDetail(firstMatch);
});

// Show first Pokemon
showDetail(1);
