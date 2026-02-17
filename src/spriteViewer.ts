import { CUSTOM_POKEMON_SPRITES } from './sprites/index';
import { POKEMON_DATA } from './data/pokemon';
import { TRAINER_SPRITES_CLASSES1 } from './utils/trainerSprites_classes1';
import { TRAINER_SPRITES_CLASSES2 } from './utils/trainerSprites_classes2';
import { TRAINER_SPRITES_INDIVIDUALS } from './utils/trainerSprites_individuals';

const SPRITE_SIZE = 32;
const SCALE = 2;
const DISPLAY = SPRITE_SIZE * SCALE;

const grid = document.getElementById('grid')!;

for (let id = 1; id <= 151; id++) {
  const drawFn = CUSTOM_POKEMON_SPRITES[id];
  const species = POKEMON_DATA[id];
  if (!species) continue;

  const card = document.createElement('div');
  card.className = 'card';

  // Front view
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = DISPLAY;
  frontCanvas.height = DISPLAY;
  const frontCtx = frontCanvas.getContext('2d')!;

  // Back view
  const backCanvas = document.createElement('canvas');
  backCanvas.width = DISPLAY;
  backCanvas.height = DISPLAY;
  const backCtx = backCanvas.getContext('2d')!;

  if (drawFn) {
    // Draw at native 32x32 on offscreen canvas, then scale up
    const off = document.createElement('canvas');
    off.width = SPRITE_SIZE;
    off.height = SPRITE_SIZE;
    const offCtx = off.getContext('2d')!;

    // Front
    offCtx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    drawFn(offCtx, false);
    frontCtx.imageSmoothingEnabled = false;
    frontCtx.drawImage(off, 0, 0, DISPLAY, DISPLAY);

    // Back
    offCtx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    drawFn(offCtx, true);
    backCtx.imageSmoothingEnabled = false;
    backCtx.drawImage(off, 0, 0, DISPLAY, DISPLAY);
  } else {
    // No custom sprite - show placeholder
    frontCtx.fillStyle = '#444';
    frontCtx.fillRect(0, 0, DISPLAY, DISPLAY);
    frontCtx.fillStyle = '#888';
    frontCtx.font = '12px monospace';
    frontCtx.fillText('N/A', DISPLAY / 2 - 12, DISPLAY / 2 + 4);

    backCtx.fillStyle = '#444';
    backCtx.fillRect(0, 0, DISPLAY, DISPLAY);
    backCtx.fillStyle = '#888';
    backCtx.font = '12px monospace';
    backCtx.fillText('N/A', DISPLAY / 2 - 12, DISPLAY / 2 + 4);
  }

  const views = document.createElement('div');
  views.className = 'views';

  const frontWrap = document.createElement('div');
  const frontLabel = document.createElement('span');
  frontLabel.textContent = 'front';
  frontWrap.appendChild(frontCanvas);
  frontWrap.appendChild(frontLabel);

  const backWrap = document.createElement('div');
  const backLabel = document.createElement('span');
  backLabel.textContent = 'back';
  backWrap.appendChild(backCanvas);
  backWrap.appendChild(backLabel);

  views.appendChild(frontWrap);
  views.appendChild(backWrap);

  const idSpan = document.createElement('div');
  idSpan.className = 'id';
  idSpan.textContent = `#${String(id).padStart(3, '0')}`;

  const nameSpan = document.createElement('div');
  nameSpan.className = 'name';
  nameSpan.textContent = species.name;

  card.appendChild(views);
  card.appendChild(idSpan);
  card.appendChild(nameSpan);
  grid.appendChild(card);
}

// Trainer sprites section
const TRAINER_W = 40;
const TRAINER_H = 56;
const TRAINER_SCALE = 2;
const TRAINER_DISPLAY_W = TRAINER_W * TRAINER_SCALE;
const TRAINER_DISPLAY_H = TRAINER_H * TRAINER_SCALE;

const allTrainerSprites = [
  ...TRAINER_SPRITES_CLASSES1,
  ...TRAINER_SPRITES_CLASSES2,
  ...TRAINER_SPRITES_INDIVIDUALS,
];

const trainerGrid = document.getElementById('trainer-grid')!;

for (const sprite of allTrainerSprites) {
  const card = document.createElement('div');
  card.className = 'card';

  const canvas = document.createElement('canvas');
  canvas.width = TRAINER_DISPLAY_W;
  canvas.height = TRAINER_DISPLAY_H;
  const ctx = canvas.getContext('2d')!;

  const off = document.createElement('canvas');
  off.width = TRAINER_W;
  off.height = TRAINER_H;
  const offCtx = off.getContext('2d')!;
  sprite.draw(offCtx, TRAINER_W, TRAINER_H);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, TRAINER_DISPLAY_W, TRAINER_DISPLAY_H);

  const nameSpan = document.createElement('div');
  nameSpan.className = 'name';
  nameSpan.textContent = sprite.key.replace('trainer_', '').replace(/_/g, ' ');

  card.appendChild(canvas);
  card.appendChild(nameSpan);
  trainerGrid.appendChild(card);
}
