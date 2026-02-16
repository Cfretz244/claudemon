import { TILE_SIZE } from './constants';
import { TileType } from '../types/map.types';
import { PokemonType } from '../types/pokemon.types';

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

// --- Custom hand-drawn Pokemon battle sprites ---
type CustomSpriteDrawFn = (ctx: CanvasRenderingContext2D, isBack: boolean) => void;

const CUSTOM_POKEMON_SPRITES: Record<number, CustomSpriteDrawFn> = {
  // Pikachu (speciesId 25)
  25: (ctx, isBack) => {
    // Body
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(9, 12, 14, 12);  // torso
    ctx.fillRect(7, 14, 18, 8);   // wider midsection

    // Ears - tall pointed
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(8, 2, 4, 12);    // left ear
    ctx.fillRect(20, 2, 4, 12);   // right ear
    // Black ear tips
    ctx.fillStyle = '#302020';
    ctx.fillRect(8, 2, 4, 4);     // left tip
    ctx.fillRect(20, 2, 4, 4);    // right tip

    // Head
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(8, 8, 16, 8);    // head block
    ctx.fillRect(7, 10, 18, 4);   // wider cheek area

    if (!isBack) {
      // Face
      // Eyes - black with white highlight
      ctx.fillStyle = '#302020';
      ctx.fillRect(11, 10, 3, 4);   // left eye
      ctx.fillRect(18, 10, 3, 4);   // right eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 10, 2, 2);   // left highlight
      ctx.fillRect(18, 10, 2, 2);   // right highlight
      // Red cheeks
      ctx.fillStyle = '#e03030';
      ctx.fillRect(7, 13, 3, 3);    // left cheek
      ctx.fillRect(22, 13, 3, 3);   // right cheek
      // Mouth
      ctx.fillStyle = '#302020';
      ctx.fillRect(15, 15, 2, 1);
    } else {
      // Back - darker patch
      ctx.fillStyle = '#c0a020';
      ctx.fillRect(11, 12, 10, 6);
      // Back stripe
      ctx.fillStyle = '#b09018';
      ctx.fillRect(13, 10, 6, 2);
    }

    // Arms
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(6, 16, 3, 4);    // left arm
    ctx.fillRect(23, 16, 3, 4);   // right arm

    // Feet
    ctx.fillStyle = '#c0a020';
    ctx.fillRect(9, 24, 5, 3);    // left foot
    ctx.fillRect(18, 24, 5, 3);   // right foot

    // Tail - lightning bolt on right side
    ctx.fillStyle = '#c0a020';
    ctx.fillRect(24, 8, 4, 3);    // tail base
    ctx.fillRect(26, 5, 4, 4);    // tail mid
    ctx.fillRect(24, 3, 4, 3);    // tail top
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(22, 10, 4, 3);   // tail connection
  },

  // Bulbasaur (speciesId 1)
  1: (ctx, isBack) => {
    // Body - squat green quadruped
    ctx.fillStyle = '#78c850';
    ctx.fillRect(6, 16, 20, 10);  // body
    ctx.fillRect(8, 14, 16, 4);   // upper body

    // Bulb on back
    ctx.fillStyle = '#406830';
    ctx.fillRect(10, 8, 12, 8);   // bulb
    ctx.fillRect(8, 10, 16, 4);   // wider bulb middle
    ctx.fillStyle = '#58a830';
    ctx.fillRect(12, 9, 8, 5);    // bulb highlight

    if (!isBack) {
      // Head
      ctx.fillStyle = '#78c850';
      ctx.fillRect(4, 14, 8, 8);  // head
      ctx.fillRect(3, 16, 10, 4); // wider snout
      // Eyes
      ctx.fillStyle = '#e03030';
      ctx.fillRect(5, 15, 3, 3);  // left eye
      ctx.fillStyle = '#302020';
      ctx.fillRect(6, 16, 2, 2);  // pupil
      // Mouth
      ctx.fillStyle = '#406830';
      ctx.fillRect(4, 20, 6, 1);
    } else {
      // Back view - just the bulb is prominent
      ctx.fillStyle = '#406830';
      ctx.fillRect(9, 7, 14, 9);
      ctx.fillStyle = '#58a830';
      ctx.fillRect(11, 8, 10, 6);
    }

    // Four legs
    ctx.fillStyle = '#58a830';
    ctx.fillRect(7, 26, 4, 4);    // front-left
    ctx.fillRect(21, 26, 4, 4);   // front-right
    ctx.fillRect(10, 26, 4, 3);   // back-left
    ctx.fillRect(18, 26, 4, 3);   // back-right
  },

  // Charmander (speciesId 4)
  4: (ctx, isBack) => {
    // Body - upright orange lizard
    ctx.fillStyle = '#f08030';
    ctx.fillRect(10, 10, 12, 14); // torso
    ctx.fillRect(8, 12, 16, 10);  // wider mid

    // Head
    ctx.fillStyle = '#f08030';
    ctx.fillRect(10, 4, 12, 10);  // head
    ctx.fillRect(8, 6, 16, 6);    // wider head

    // Yellow belly
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(12, 14, 8, 8);

    if (!isBack) {
      // Eyes
      ctx.fillStyle = '#302020';
      ctx.fillRect(11, 7, 3, 3);  // left eye
      ctx.fillRect(18, 7, 3, 3);  // right eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 7, 2, 2);  // left highlight
      ctx.fillRect(18, 7, 2, 2);  // right highlight
      // Mouth
      ctx.fillStyle = '#c06020';
      ctx.fillRect(13, 11, 6, 1);
    } else {
      // Back - darker ridge
      ctx.fillStyle = '#c06020';
      ctx.fillRect(14, 8, 4, 10);
    }

    // Arms
    ctx.fillStyle = '#f08030';
    ctx.fillRect(6, 14, 4, 3);    // left arm
    ctx.fillRect(22, 14, 4, 3);   // right arm

    // Legs
    ctx.fillStyle = '#c06020';
    ctx.fillRect(10, 24, 5, 4);   // left leg
    ctx.fillRect(17, 24, 5, 4);   // right leg

    // Tail with flame
    ctx.fillStyle = '#f08030';
    ctx.fillRect(22, 18, 4, 3);   // tail base
    ctx.fillRect(24, 15, 3, 4);   // tail mid
    // Flame tip
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(25, 12, 3, 4);   // flame outer
    ctx.fillStyle = '#f87830';
    ctx.fillRect(26, 13, 2, 2);   // flame inner
  },

  // Squirtle (speciesId 7)
  7: (ctx, isBack) => {
    // Body - round blue
    ctx.fillStyle = '#68a8d8';
    ctx.fillRect(8, 10, 16, 14);  // body
    ctx.fillRect(6, 12, 20, 10);  // wider midsection

    // Head
    ctx.fillStyle = '#68a8d8';
    ctx.fillRect(9, 4, 14, 10);   // head
    ctx.fillRect(7, 6, 18, 6);    // wider head

    // Cream belly
    ctx.fillStyle = '#f0d890';
    ctx.fillRect(10, 14, 12, 8);

    if (!isBack) {
      // Eyes
      ctx.fillStyle = '#302020';
      ctx.fillRect(11, 6, 3, 4);  // left eye
      ctx.fillRect(18, 6, 3, 4);  // right eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 6, 2, 2);  // left highlight
      ctx.fillRect(18, 6, 2, 2);  // right highlight
      // Mouth
      ctx.fillStyle = '#4878a8';
      ctx.fillRect(13, 11, 6, 1);
    } else {
      // Back - shell pattern
      ctx.fillStyle = '#c09040';
      ctx.fillRect(10, 11, 12, 10); // shell outline
      ctx.fillStyle = '#d8a850';
      ctx.fillRect(11, 12, 10, 8);  // shell fill
      ctx.fillStyle = '#c09040';
      ctx.fillRect(15, 12, 2, 8);   // shell line vertical
      ctx.fillRect(11, 15, 10, 2);  // shell line horizontal
    }

    // Arms
    ctx.fillStyle = '#68a8d8';
    ctx.fillRect(4, 14, 4, 4);    // left arm
    ctx.fillRect(24, 14, 4, 4);   // right arm

    // Legs
    ctx.fillStyle = '#4878a8';
    ctx.fillRect(9, 24, 5, 4);    // left leg
    ctx.fillRect(18, 24, 5, 4);   // right leg

    // Curly tail
    ctx.fillStyle = '#68a8d8';
    ctx.fillRect(23, 20, 4, 3);   // tail base
    ctx.fillRect(25, 17, 3, 4);   // tail curve
    ctx.fillRect(23, 15, 3, 3);   // tail tip
  },
};

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
