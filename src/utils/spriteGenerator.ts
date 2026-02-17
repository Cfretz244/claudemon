import { TILE_SIZE } from './constants';
import { TileType } from '../types/map.types';
import { PokemonType } from '../types/pokemon.types';
import { CUSTOM_POKEMON_SPRITES } from '../sprites/index';

// Helper: create a canvas texture with frames for use as a spritesheet
function addCanvasSpriteSheet(
  scene: Phaser.Scene,
  key: string,
  canvas: HTMLCanvasElement,
  frameWidth: number,
  frameHeight: number
): void {
  const texture = scene.textures.addCanvas(key, canvas);
  if (!texture) return;
  const cols = Math.floor(canvas.width / frameWidth);
  const rows = Math.floor(canvas.height / frameHeight);
  let frameIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      texture.add(frameIndex, 0, col * frameWidth, row * frameHeight, frameWidth, frameHeight);
      frameIndex++;
    }
  }
}

export function generateTileset(scene: Phaser.Scene): void {
  const tileGraphics: Record<number, (ctx: CanvasRenderingContext2D) => void> = {
    [TileType.GRASS]: (ctx) => {
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#78b060';
      for (let i = 0; i < 4; i++) {
        const x = (i % 2) * 8 + 2;
        const y = Math.floor(i / 2) * 8 + 2;
        ctx.fillRect(x, y, 2, 3);
      }
    },
    [TileType.PATH]: (ctx) => {
      ctx.fillStyle = '#d8c078';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#c8b068';
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(0, 0, 16, 1);
    },
    [TileType.WALL]: (ctx) => {
      ctx.fillStyle = '#a08858';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#907848';
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(8, 0, 1, 16);
    },
    [TileType.WATER]: (ctx) => {
      ctx.fillStyle = '#3890f8';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#58a8f8';
      ctx.fillRect(2, 4, 6, 2);
      ctx.fillRect(10, 10, 4, 2);
    },
    [TileType.TREE]: (ctx) => {
      ctx.fillStyle = '#805028';
      ctx.fillRect(5, 10, 6, 6);
      ctx.fillStyle = '#408040';
      ctx.fillRect(1, 1, 14, 10);
      ctx.fillStyle = '#509050';
      ctx.fillRect(3, 2, 10, 7);
    },
    [TileType.TALL_GRASS]: (ctx) => {
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#409030';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(i * 3 + 1, 2, 2, 12);
      }
      ctx.fillStyle = '#58a848';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * 3 + 2, 4, 2, 8);
      }
    },
    [TileType.BUILDING]: (ctx) => {
      ctx.fillStyle = '#e0d0b0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#c0b090';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(15, 0, 1, 16);
    },
    [TileType.DOOR]: (ctx) => {
      ctx.fillStyle = '#e0d0b0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#805028';
      ctx.fillRect(3, 2, 10, 14);
      ctx.fillStyle = '#604018';
      ctx.fillRect(4, 3, 8, 12);
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(10, 9, 2, 2);
    },
    [TileType.SIGN]: (ctx) => {
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#805028';
      ctx.fillRect(6, 10, 4, 6);
      ctx.fillStyle = '#d0c080';
      ctx.fillRect(2, 4, 12, 8);
      ctx.fillStyle = '#a09060';
      ctx.fillRect(3, 5, 10, 6);
    },
    [TileType.LEDGE]: (ctx) => {
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#507850';
      ctx.fillRect(0, 12, 16, 4);
      ctx.fillStyle = '#608860';
      ctx.fillRect(0, 12, 16, 2);
    },
    [TileType.FENCE]: (ctx) => {
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#d0b880';
      ctx.fillRect(0, 4, 16, 8);
      ctx.fillStyle = '#c0a870';
      ctx.fillRect(2, 4, 2, 8);
      ctx.fillRect(12, 4, 2, 8);
      ctx.fillRect(0, 7, 16, 2);
    },
    [TileType.FLOWER]: (ctx) => {
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      const colors = ['#f05050', '#f0f050', '#f050f0'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(i * 5 + 2, 5, 3, 3);
        ctx.fillStyle = '#50a038';
        ctx.fillRect(i * 5 + 3, 8, 1, 4);
      }
    },
    [TileType.INDOOR_FLOOR]: (ctx) => {
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#e8e0c0';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
    },
    [TileType.COUNTER]: (ctx) => {
      ctx.fillStyle = '#b08840';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#c09850';
      ctx.fillRect(1, 1, 14, 6);
      ctx.fillStyle = '#a07830';
      ctx.fillRect(0, 14, 16, 2);
    },
    [TileType.PC]: (ctx) => {
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#606060';
      ctx.fillRect(3, 2, 10, 12);
      ctx.fillStyle = '#80c0e0';
      ctx.fillRect(4, 3, 8, 8);
      ctx.fillStyle = '#404040';
      ctx.fillRect(5, 12, 6, 1);
    },
    [TileType.MART_SHELF]: (ctx) => {
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a08040';
      ctx.fillRect(1, 2, 14, 12);
      ctx.fillStyle = '#c09850';
      ctx.fillRect(2, 4, 12, 3);
      ctx.fillRect(2, 9, 12, 3);
    },
    [TileType.CARPET]: (ctx) => {
      ctx.fillStyle = '#c04040';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#d05050';
      ctx.fillRect(1, 1, 14, 14);
    },
    [TileType.SAND]: (ctx) => {
      ctx.fillStyle = '#e8d898';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#d8c888';
      ctx.fillRect(3, 5, 2, 2);
      ctx.fillRect(10, 10, 2, 2);
    },
    [TileType.CAVE_FLOOR]: (ctx) => {
      ctx.fillStyle = '#a09080';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#908070';
      ctx.fillRect(4, 4, 3, 3);
      ctx.fillRect(10, 9, 2, 2);
    },
    [TileType.CAVE_WALL]: (ctx) => {
      ctx.fillStyle = '#706050';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#605040';
      ctx.fillRect(0, 0, 16, 2);
      ctx.fillRect(0, 8, 16, 2);
      ctx.fillStyle = '#807060';
      ctx.fillRect(4, 4, 4, 4);
    },
    [TileType.CUT_TREE]: (ctx) => {
      // Small cuttable tree - lighter green, smaller
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#805028';
      ctx.fillRect(6, 10, 4, 6);
      ctx.fillStyle = '#60a050';
      ctx.fillRect(3, 3, 10, 8);
      ctx.fillStyle = '#70b060';
      ctx.fillRect(4, 4, 8, 6);
      // X mark to show it's cuttable
      ctx.fillStyle = '#c0a040';
      ctx.fillRect(6, 5, 4, 1);
      ctx.fillRect(7, 4, 2, 3);
    },
    [TileType.BOULDER]: (ctx) => {
      // Pushable boulder
      ctx.fillStyle = '#a09080';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#808070';
      ctx.fillRect(2, 3, 12, 10);
      ctx.fillStyle = '#909080';
      ctx.fillRect(3, 4, 10, 8);
      // Shading
      ctx.fillStyle = '#707060';
      ctx.fillRect(2, 12, 12, 1);
      ctx.fillRect(13, 3, 1, 10);
    },
  };

  // Generate individual tile textures
  const tileIds = Object.keys(tileGraphics).map(Number).sort((a, b) => a - b);
  tileIds.forEach((tileId) => {
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = TILE_SIZE;
    tileCanvas.height = TILE_SIZE;
    const tileCtx = tileCanvas.getContext('2d')!;
    tileGraphics[tileId](tileCtx);
    scene.textures.addCanvas(`tile_${tileId}`, tileCanvas);
  });
}

function drawPlayerFrame(ctx: CanvasRenderingContext2D, dir: string, frame: number): void {
  ctx.fillStyle = '#e03030';
  ctx.fillRect(3, 0, 10, 4);
  ctx.fillStyle = '#302020';
  ctx.fillRect(3, 4, 10, 2);
  ctx.fillStyle = '#f8c888';
  ctx.fillRect(4, 4, 8, 5);
  if (dir === 'down') {
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 6, 2, 2);
    ctx.fillRect(9, 6, 2, 2);
  } else if (dir === 'up') {
    ctx.fillStyle = '#302020';
    ctx.fillRect(4, 4, 8, 5);
  } else if (dir === 'left') {
    ctx.fillStyle = '#302020';
    ctx.fillRect(5, 6, 2, 2);
  } else {
    ctx.fillStyle = '#302020';
    ctx.fillRect(9, 6, 2, 2);
  }
  ctx.fillStyle = '#3030a0';
  ctx.fillRect(4, 9, 8, 4);
  ctx.fillStyle = '#3060c0';
  if (frame === 0) {
    ctx.fillRect(5, 13, 3, 3);
    ctx.fillRect(9, 13, 3, 3);
  } else {
    ctx.fillRect(4, 13, 3, 3);
    ctx.fillRect(10, 13, 3, 3);
  }
}

export function generatePlayerSprite(scene: Phaser.Scene): void {
  // 4 cols (directions) x 2 rows (frames) = 8 frames
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;
  canvas.height = TILE_SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'];
  directions.forEach((dir, dirIndex) => {
    for (let frame = 0; frame < 2; frame++) {
      ctx.save();
      ctx.translate(dirIndex * TILE_SIZE, frame * TILE_SIZE);
      drawPlayerFrame(ctx, dir, frame);
      ctx.restore();
    }
  });

  addCanvasSpriteSheet(scene, 'player', canvas, TILE_SIZE, TILE_SIZE);
}

export function generateNPCSprite(scene: Phaser.Scene, key: string, color: number): void {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;
  canvas.height = TILE_SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const colorStr = `rgb(${r},${g},${b})`;
  const darkStr = `rgb(${Math.floor(r * 0.7)},${Math.floor(g * 0.7)},${Math.floor(b * 0.7)})`;

  const directions = ['down', 'up', 'left', 'right'];
  directions.forEach((dir, dirIndex) => {
    for (let frame = 0; frame < 2; frame++) {
      ctx.save();
      ctx.translate(dirIndex * TILE_SIZE, frame * TILE_SIZE);
      ctx.fillStyle = darkStr;
      ctx.fillRect(3, 0, 10, 4);
      ctx.fillStyle = '#f8c888';
      ctx.fillRect(4, 3, 8, 5);
      if (dir === 'down') {
        ctx.fillStyle = '#302020';
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillRect(9, 5, 2, 2);
      } else if (dir !== 'up') {
        ctx.fillStyle = '#302020';
        ctx.fillRect(dir === 'left' ? 5 : 9, 5, 2, 2);
      }
      ctx.fillStyle = colorStr;
      ctx.fillRect(4, 8, 8, 4);
      ctx.fillStyle = darkStr;
      if (frame === 0) {
        ctx.fillRect(5, 12, 3, 4);
        ctx.fillRect(9, 12, 3, 4);
      } else {
        ctx.fillRect(4, 12, 3, 4);
        ctx.fillRect(10, 12, 3, 4);
      }
      ctx.restore();
    }
  });

  addCanvasSpriteSheet(scene, key, canvas, TILE_SIZE, TILE_SIZE);
}

// Per-shape eye positioning
const SHAPE_EYE_POSITIONS: Record<string, { leftX: number; rightX: number; y: number }> = {
  round:   { leftX: 10, rightX: 18, y: 8 },
  angular: { leftX: 10, rightX: 18, y: 6 },
  tall:    { leftX: 11, rightX: 19, y: 4 },
  wide:    { leftX: 10, rightX: 18, y: 8 },
  bird:    { leftX: 12, rightX: 18, y: 6 },
  snake:   { leftX: 10, rightX: 16, y: 5 },
  bug:     { leftX: 12, rightX: 18, y: 8 },
};

function drawPokemonShape(
  ctx: CanvasRenderingContext2D, c1: string, c2: string,
  shape: string, _size: number, isBack: boolean
): void {
  ctx.fillStyle = c1;
  switch (shape) {
    case 'round':
      ctx.fillRect(8, 6, 16, 16);
      ctx.fillRect(6, 8, 20, 12);
      ctx.fillStyle = c2;
      ctx.fillRect(10, 8, 12, 4);
      break;
    case 'angular':
      ctx.fillRect(6, 8, 20, 14);
      ctx.fillRect(8, 4, 16, 6);
      ctx.fillStyle = c2;
      ctx.fillRect(8, 16, 16, 4);
      break;
    case 'tall':
      ctx.fillRect(10, 2, 12, 24);
      ctx.fillRect(8, 6, 16, 16);
      ctx.fillStyle = c2;
      ctx.fillRect(10, 20, 12, 6);
      break;
    case 'wide':
      ctx.fillRect(4, 10, 24, 14);
      ctx.fillRect(8, 6, 16, 6);
      ctx.fillStyle = c2;
      ctx.fillRect(6, 18, 20, 4);
      break;
    case 'bird':
      ctx.fillRect(10, 4, 12, 10);
      ctx.fillRect(6, 10, 20, 10);
      ctx.fillStyle = c2;
      ctx.fillRect(2, 12, 6, 6);
      ctx.fillRect(24, 12, 6, 6);
      break;
    case 'snake':
      ctx.fillRect(8, 4, 10, 8);
      ctx.fillRect(12, 10, 10, 8);
      ctx.fillRect(8, 16, 10, 8);
      ctx.fillStyle = c2;
      ctx.fillRect(10, 6, 6, 4);
      break;
    case 'bug':
      ctx.fillRect(10, 6, 12, 8);
      ctx.fillRect(6, 12, 20, 10);
      ctx.fillStyle = c2;
      ctx.fillRect(8, 14, 6, 6);
      ctx.fillRect(18, 14, 6, 6);
      break;
  }
  if (!isBack) {
    const eyes = SHAPE_EYE_POSITIONS[shape] || SHAPE_EYE_POSITIONS.round;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyes.leftX, eyes.y, 4, 4);
    ctx.fillRect(eyes.rightX, eyes.y, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(eyes.leftX + 2, eyes.y + 1, 2, 3);
    ctx.fillRect(eyes.rightX + 2, eyes.y + 1, 2, 3);
  }
  ctx.fillStyle = c2;
  ctx.fillRect(8, 26, 4, 4);
  ctx.fillRect(20, 26, 4, 4);
}

// Species-specific body shape overrides (for Pokemon whose body doesn't match their type)
const SHAPE_OVERRIDES: Record<number, 'round' | 'angular' | 'tall' | 'wide' | 'bird' | 'snake' | 'bug'> = {
  23: 'snake',  // Ekans
  24: 'snake',  // Arbok
  95: 'snake',  // Onix
  147: 'snake', // Dratini
  148: 'snake', // Dragonair
  138: 'round', // Omanyte
  139: 'round', // Omastar
  140: 'bug',   // Kabuto
  141: 'bug',   // Kabutops
  79: 'wide',   // Slowpoke
  80: 'tall',   // Slowbro
  143: 'wide',  // Snorlax
  113: 'round', // Chansey
};

export type PokemonShape = 'round' | 'angular' | 'tall' | 'wide' | 'bird' | 'snake' | 'bug';

export function getShapeForSpecies(speciesId: number, types: PokemonType[]): PokemonShape {
  const override = SHAPE_OVERRIDES[speciesId];
  if (override) return override;

  const primary = types[0];
  const secondary = types[1];

  // FLYING secondary type (except Bug primary) → bird
  if (secondary === PokemonType.FLYING && primary !== PokemonType.BUG) return 'bird';

  switch (primary) {
    case PokemonType.BUG: return 'bug';
    case PokemonType.ROCK:
    case PokemonType.GROUND:
    case PokemonType.ICE: return 'angular';
    case PokemonType.FIGHTING:
    case PokemonType.PSYCHIC:
    case PokemonType.FIRE: return 'tall';
    case PokemonType.GRASS: return 'wide';
    case PokemonType.DRAGON: return 'snake';
    default: return 'round';
  }
}

export function generatePokemonSprite(
  scene: Phaser.Scene, key: string, color1: number,
  color2: number | undefined,
  shape: 'round' | 'angular' | 'tall' | 'wide' | 'bird' | 'snake' | 'bug' = 'round',
  speciesId?: number
): void {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size * 2; // front and back
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Check for custom hand-drawn sprite
  const customDraw = speciesId !== undefined ? CUSTOM_POKEMON_SPRITES[speciesId] : undefined;

  if (customDraw) {
    ctx.save();
    customDraw(ctx, false); // front view
    ctx.restore();

    ctx.save();
    ctx.translate(size, 0);
    customDraw(ctx, true); // back view
    ctx.restore();
  } else {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    const c1 = `rgb(${r1},${g1},${b1})`;
    const c2 = color2
      ? `rgb(${(color2 >> 16) & 0xff},${(color2 >> 8) & 0xff},${color2 & 0xff})`
      : `rgb(${Math.floor(r1 * 0.7)},${Math.floor(g1 * 0.7)},${Math.floor(b1 * 0.7)})`;

    ctx.save();
    drawPokemonShape(ctx, c1, c2, shape, size, false);
    ctx.restore();

    ctx.save();
    ctx.translate(size, 0);
    drawPokemonShape(ctx, c1, c2, shape, size, true);
    ctx.restore();
  }

  addCanvasSpriteSheet(scene, key, canvas, size, size);
}

export function generatePikachuFollowerSprite(scene: Phaser.Scene): void {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;
  canvas.height = TILE_SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'];
  directions.forEach((dir, dirIndex) => {
    for (let frame = 0; frame < 2; frame++) {
      ctx.save();
      ctx.translate(dirIndex * TILE_SIZE, frame * TILE_SIZE);
      ctx.fillStyle = '#f8d030';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillRect(3, 6, 10, 6);
      ctx.fillStyle = '#f8d030';
      ctx.fillRect(3, 0, 3, 5);
      ctx.fillRect(10, 0, 3, 5);
      ctx.fillStyle = '#302020';
      ctx.fillRect(3, 0, 3, 2);
      ctx.fillRect(10, 0, 3, 2);
      // Direction-aware cheeks and eyes
      if (dir === 'down') {
        ctx.fillStyle = '#e03030';
        ctx.fillRect(3, 8, 2, 2);
        ctx.fillRect(11, 8, 2, 2);
        ctx.fillStyle = '#302020';
        ctx.fillRect(5, 6, 2, 2);
        ctx.fillRect(9, 6, 2, 2);
      } else if (dir === 'left') {
        ctx.fillStyle = '#e03030';
        ctx.fillRect(3, 8, 2, 2);
        ctx.fillStyle = '#302020';
        ctx.fillRect(5, 6, 2, 2);
      } else if (dir === 'right') {
        ctx.fillStyle = '#e03030';
        ctx.fillRect(11, 8, 2, 2);
        ctx.fillStyle = '#302020';
        ctx.fillRect(9, 6, 2, 2);
      }
      ctx.fillStyle = '#c0a020';
      if (dir === 'up' || dir === 'down') {
        ctx.fillRect(7, 12, 2, 4);
      } else if (dir === 'left') {
        ctx.fillRect(12, 6, 4, 2);
      } else {
        ctx.fillRect(0, 6, 4, 2);
      }
      ctx.fillStyle = '#c0a020';
      if (frame === 0) {
        ctx.fillRect(4, 12, 3, 2);
        ctx.fillRect(9, 12, 3, 2);
      } else {
        ctx.fillRect(3, 12, 3, 2);
        ctx.fillRect(10, 12, 3, 2);
      }
      ctx.restore();
    }
  });

  addCanvasSpriteSheet(scene, 'pikachu_follower', canvas, TILE_SIZE, TILE_SIZE);
}

export function generatePokeballSprite(scene: Phaser.Scene): void {
  const size = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Red top half
  ctx.fillStyle = '#e03030';
  ctx.fillRect(1, 0, 6, 4);
  ctx.fillRect(0, 1, 8, 3);

  // White bottom half
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(1, 4, 6, 4);
  ctx.fillRect(0, 4, 8, 3);

  // Black dividing line
  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 3, 8, 2);

  // Center button
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(3, 3, 2, 2);

  scene.textures.addCanvas('pokeball_icon', canvas);
}

export function generateItemBallSprite(scene: Phaser.Scene, key: string): void {
  // 4 cols x 2 rows spritesheet (same format as NPC sprites) but all frames identical
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;
  canvas.height = TILE_SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const ox = col * TILE_SIZE;
      const oy = row * TILE_SIZE;
      // Red top half
      ctx.fillStyle = '#e03030';
      ctx.fillRect(ox + 4, oy + 3, 8, 5);
      ctx.fillRect(ox + 3, oy + 4, 10, 3);
      // White bottom half
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(ox + 4, oy + 8, 8, 5);
      ctx.fillRect(ox + 3, oy + 9, 10, 3);
      // Black dividing line
      ctx.fillStyle = '#202020';
      ctx.fillRect(ox + 3, oy + 7, 10, 2);
      // Center button
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(ox + 7, oy + 7, 2, 2);
    }
  }

  addCanvasSpriteSheet(scene, key, canvas, TILE_SIZE, TILE_SIZE);
}

export function generateSurfSprite(scene: Phaser.Scene): void {
  // Player on a Lapras-like surf mount, 4 directions
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;
  canvas.height = TILE_SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'];
  directions.forEach((dir, dirIndex) => {
    for (let frame = 0; frame < 2; frame++) {
      ctx.save();
      ctx.translate(dirIndex * TILE_SIZE, frame * TILE_SIZE);

      // Water/wave base
      ctx.fillStyle = '#58a8f8';
      ctx.fillRect(1, 10, 14, 6);
      ctx.fillStyle = '#78c0f8';
      ctx.fillRect(2, 11, 12, 4);
      // Wave detail
      ctx.fillStyle = '#3890f8';
      const wo = frame * 2;
      ctx.fillRect(1 + wo, 14, 3, 1);
      ctx.fillRect(8 + wo, 13, 3, 1);

      // Lapras body (blue-gray)
      ctx.fillStyle = '#5090b0';
      ctx.fillRect(3, 6, 10, 6);
      ctx.fillStyle = '#60a0c0';
      ctx.fillRect(4, 7, 8, 4);

      // Player on top (small)
      ctx.fillStyle = '#e03030'; // Hat
      ctx.fillRect(5, 1, 6, 2);
      ctx.fillStyle = '#f8c888'; // Face
      ctx.fillRect(6, 3, 4, 3);
      ctx.fillStyle = '#3030a0'; // Shirt
      ctx.fillRect(6, 6, 4, 2);

      if (dir === 'down') {
        ctx.fillStyle = '#302020';
        ctx.fillRect(6, 4, 1, 1);
        ctx.fillRect(9, 4, 1, 1);
      }

      ctx.restore();
    }
  });

  addCanvasSpriteSheet(scene, 'player_surf', canvas, TILE_SIZE, TILE_SIZE);
}

export function generateOakPortrait(scene: Phaser.Scene): void {
  // 32x40 portrait of Professor Oak for the intro sequence
  const w = 32, h = 40;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Hair (gray-brown)
  ctx.fillStyle = '#908070';
  ctx.fillRect(9, 2, 14, 6);
  ctx.fillRect(8, 3, 16, 4);
  ctx.fillRect(7, 5, 18, 3);

  // Face
  ctx.fillStyle = '#f8c888';
  ctx.fillRect(10, 7, 12, 10);
  ctx.fillRect(9, 8, 14, 8);

  // Eyes
  ctx.fillStyle = '#302020';
  ctx.fillRect(12, 10, 3, 3);
  ctx.fillRect(18, 10, 3, 3);
  // Eye whites
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(12, 10, 2, 2);
  ctx.fillRect(18, 10, 2, 2);
  // Pupils
  ctx.fillStyle = '#302020';
  ctx.fillRect(13, 11, 1, 1);
  ctx.fillRect(19, 11, 1, 1);

  // Mouth
  ctx.fillStyle = '#c08060';
  ctx.fillRect(14, 14, 4, 1);

  // Lab coat (white)
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(7, 17, 18, 16);
  ctx.fillRect(5, 18, 22, 14);
  ctx.fillRect(4, 20, 24, 12);

  // Lab coat collar/lapels
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(11, 17, 2, 4);
  ctx.fillRect(19, 17, 2, 4);

  // Shirt underneath (dark red/brown)
  ctx.fillStyle = '#a06040';
  ctx.fillRect(13, 17, 6, 5);

  // Coat buttons
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(15, 24, 2, 2);
  ctx.fillRect(15, 28, 2, 2);

  // Coat outline
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.strokeRect(5.5, 17.5, 21, 15);

  scene.textures.addCanvas('oak_portrait', canvas);
}

export function generateNidorinoPortrait(scene: Phaser.Scene): void {
  // 24x24 Nidorino silhouette for intro
  const w = 24, h = 24;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Purple body
  ctx.fillStyle = '#a060c0';
  ctx.fillRect(6, 10, 14, 8);
  ctx.fillRect(4, 12, 18, 5);

  // Head
  ctx.fillRect(14, 6, 8, 8);

  // Horn
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(19, 3, 2, 4);
  ctx.fillRect(20, 2, 1, 2);

  // Ear
  ctx.fillStyle = '#a060c0';
  ctx.fillRect(16, 4, 3, 3);

  // Eye
  ctx.fillStyle = '#e02020';
  ctx.fillRect(18, 8, 2, 2);

  // Legs
  ctx.fillStyle = '#8050a0';
  ctx.fillRect(6, 17, 3, 4);
  ctx.fillRect(13, 17, 3, 4);
  ctx.fillRect(17, 17, 3, 4);

  // Tail
  ctx.fillRect(2, 11, 5, 2);
  ctx.fillRect(1, 10, 2, 2);

  scene.textures.addCanvas('nidorino_portrait', canvas);
}

export function generatePlayerPortrait(scene: Phaser.Scene): void {
  // 32x40 detailed front-facing player portrait for intro shrink animation
  const w = 32, h = 40;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Red cap
  ctx.fillStyle = '#e03030';
  ctx.fillRect(9, 0, 14, 2);
  ctx.fillRect(7, 2, 18, 3);
  // White pokeball logo on cap
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(14, 1, 4, 2);
  // Cap brim
  ctx.fillStyle = '#c02020';
  ctx.fillRect(5, 5, 22, 2);

  // Hair (dark brown)
  ctx.fillStyle = '#302020';
  ctx.fillRect(6, 4, 3, 5);
  ctx.fillRect(23, 4, 3, 5);

  // Face
  ctx.fillStyle = '#f8c888';
  ctx.fillRect(9, 7, 14, 9);
  ctx.fillRect(8, 8, 16, 7);
  // Eyes
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(11, 10, 3, 3);
  ctx.fillRect(18, 10, 3, 3);
  ctx.fillStyle = '#302020';
  ctx.fillRect(12, 11, 2, 2);
  ctx.fillRect(19, 11, 2, 2);
  // Nose
  ctx.fillStyle = '#d8a878';
  ctx.fillRect(15, 12, 2, 1);
  // Mouth
  ctx.fillStyle = '#c08060';
  ctx.fillRect(13, 14, 6, 1);

  // Blue jacket
  ctx.fillStyle = '#3030a0';
  ctx.fillRect(7, 16, 18, 14);
  ctx.fillRect(5, 18, 22, 11);
  ctx.fillRect(3, 20, 26, 8);
  // Jacket lapels
  ctx.fillStyle = '#202080';
  ctx.fillRect(11, 16, 2, 5);
  ctx.fillRect(19, 16, 2, 5);
  // White shirt
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(13, 16, 6, 4);

  // Hands
  ctx.fillStyle = '#f8c888';
  ctx.fillRect(3, 26, 3, 3);
  ctx.fillRect(26, 26, 3, 3);

  // Belt
  ctx.fillStyle = '#302020';
  ctx.fillRect(7, 29, 18, 2);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(14, 29, 4, 2);

  // Jeans
  ctx.fillStyle = '#3060c0';
  ctx.fillRect(8, 31, 7, 5);
  ctx.fillRect(17, 31, 7, 5);

  // Shoes
  ctx.fillStyle = '#c02020';
  ctx.fillRect(7, 36, 8, 3);
  ctx.fillRect(17, 36, 8, 3);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(7, 39, 8, 1);
  ctx.fillRect(17, 39, 8, 1);

  scene.textures.addCanvas('player_portrait', canvas);
}

export function generatePlayerPortraitMid(scene: Phaser.Scene): void {
  // 16x24 medium player portrait - intermediate between portrait and overworld sprite
  const w = 16, h = 24;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Cap
  ctx.fillStyle = '#e03030';
  ctx.fillRect(3, 0, 10, 2);
  ctx.fillRect(2, 2, 12, 2);
  // Brim
  ctx.fillStyle = '#c02020';
  ctx.fillRect(1, 3, 14, 1);

  // Hair
  ctx.fillStyle = '#302020';
  ctx.fillRect(2, 4, 2, 2);
  ctx.fillRect(12, 4, 2, 2);

  // Face
  ctx.fillStyle = '#f8c888';
  ctx.fillRect(4, 4, 8, 6);
  // Eyes
  ctx.fillStyle = '#302020';
  ctx.fillRect(5, 6, 2, 2);
  ctx.fillRect(9, 6, 2, 2);

  // Jacket
  ctx.fillStyle = '#3030a0';
  ctx.fillRect(3, 10, 10, 7);
  ctx.fillRect(2, 11, 12, 5);
  // Shirt
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(6, 10, 4, 3);
  // Hands
  ctx.fillStyle = '#f8c888';
  ctx.fillRect(1, 14, 2, 2);
  ctx.fillRect(13, 14, 2, 2);

  // Pants
  ctx.fillStyle = '#3060c0';
  ctx.fillRect(4, 17, 4, 4);
  ctx.fillRect(8, 17, 4, 4);

  // Shoes
  ctx.fillStyle = '#c02020';
  ctx.fillRect(3, 21, 5, 3);
  ctx.fillRect(8, 21, 5, 3);

  scene.textures.addCanvas('player_portrait_mid', canvas);
}
