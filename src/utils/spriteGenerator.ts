import { TILE_SIZE } from './constants';
import { TileType } from '../types/map.types';
import { PokemonType } from '../types/pokemon.types';
import { CUSTOM_POKEMON_SPRITES } from '../sprites/index';
import { TOWN_THEMES, TownPalette } from '../data/townThemes';

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
    [TileType.STOP_TILE]: (ctx) => {
      // Stop tile — indoor floor with a distinctive circle/dot pattern
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#e8e0c0';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      // Circle pattern to indicate stopping point
      ctx.fillStyle = '#b0a888';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = '#b0a888';
      ctx.fillRect(7, 7, 2, 2);
    },
    [TileType.SPIN_TILE]: (ctx) => {
      // Default spin tile (up arrow) - directional variants generated below
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#e8e0c0';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      // Up arrow
      ctx.fillStyle = '#c04040';
      ctx.fillRect(7, 3, 2, 10);
      ctx.fillRect(5, 5, 6, 2);
      ctx.fillRect(6, 4, 4, 2);
    },
    [TileType.TELEPORT_PAD]: (ctx) => {
      // Cyan/blue glowing teleport pad on indoor floor
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(0, 0, 16, 16);
      // Outer pad ring
      ctx.fillStyle = '#2080b0';
      ctx.fillRect(2, 2, 12, 12);
      // Inner pad
      ctx.fillStyle = '#40c0e0';
      ctx.fillRect(4, 4, 8, 8);
      // Bright center glow
      ctx.fillStyle = '#80e0ff';
      ctx.fillRect(6, 6, 4, 4);
      // Corner accents
      ctx.fillStyle = '#106090';
      ctx.fillRect(2, 2, 2, 2);
      ctx.fillRect(12, 2, 2, 2);
      ctx.fillRect(2, 12, 2, 2);
      ctx.fillRect(12, 12, 2, 2);
    },
    [TileType.ROOF]: (ctx) => {
      ctx.fillStyle = '#c05050';
      ctx.fillRect(0, 0, 16, 16);
      // Lighter horizontal stripe for dimension
      ctx.fillStyle = '#d06060';
      ctx.fillRect(0, 4, 16, 3);
      // Darker bottom edge (eave shadow)
      ctx.fillStyle = '#a04040';
      ctx.fillRect(0, 14, 16, 2);
    },
    [TileType.FOUNTAIN]: (ctx) => {
      // Stone basin on grass
      ctx.fillStyle = '#88c070';
      ctx.fillRect(0, 0, 16, 16);
      // Outer stone basin
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(2, 2, 12, 12);
      // Inner basin
      ctx.fillStyle = '#888888';
      ctx.fillRect(3, 3, 10, 10);
      // Blue water
      ctx.fillStyle = '#4090d0';
      ctx.fillRect(4, 4, 8, 8);
      // Water highlight
      ctx.fillStyle = '#60b0e0';
      ctx.fillRect(5, 5, 3, 2);
      // Center spray
      ctx.fillStyle = '#c0e0f8';
      ctx.fillRect(7, 5, 2, 2);
      ctx.fillRect(7, 3, 2, 2);
    },
    [TileType.COBBLESTONE]: (ctx) => {
      // Gray/tan interlocking rectangular pattern
      ctx.fillStyle = '#b8b0a0';
      ctx.fillRect(0, 0, 16, 16);
      // Grout lines (darker)
      ctx.fillStyle = '#989080';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 4, 16, 1);
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(0, 12, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(8, 0, 1, 4);
      ctx.fillRect(4, 4, 1, 4);
      ctx.fillRect(12, 4, 1, 4);
      ctx.fillRect(8, 8, 1, 4);
      ctx.fillRect(4, 12, 1, 4);
      ctx.fillRect(12, 12, 1, 4);
    },
    [TileType.DOORMAT]: (ctx) => {
      // Indoor floor base
      ctx.fillStyle = '#f8f0d0';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#e8e0c0';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      // Brown woven mat
      ctx.fillStyle = '#9b7340';
      ctx.fillRect(1, 4, 14, 9);
      // Lighter weave stripes
      ctx.fillStyle = '#b8894e';
      ctx.fillRect(2, 5, 12, 1);
      ctx.fillRect(2, 7, 12, 1);
      ctx.fillRect(2, 9, 12, 1);
      ctx.fillRect(2, 11, 12, 1);
      // Dark border around mat
      ctx.fillStyle = '#7a5a2e';
      ctx.fillRect(1, 4, 14, 1);
      ctx.fillRect(1, 12, 14, 1);
      ctx.fillRect(1, 4, 1, 9);
      ctx.fillRect(14, 4, 1, 9);
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

  // Generate directional spin tile textures
  const spinArrows: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
    up: (ctx) => {
      ctx.fillStyle = '#c04040';
      ctx.fillRect(7, 3, 2, 10);
      ctx.fillRect(5, 5, 6, 2);
      ctx.fillRect(6, 4, 4, 2);
    },
    down: (ctx) => {
      ctx.fillStyle = '#c04040';
      ctx.fillRect(7, 3, 2, 10);
      ctx.fillRect(5, 9, 6, 2);
      ctx.fillRect(6, 10, 4, 2);
    },
    left: (ctx) => {
      ctx.fillStyle = '#c04040';
      ctx.fillRect(3, 7, 10, 2);
      ctx.fillRect(5, 5, 2, 6);
      ctx.fillRect(4, 6, 2, 4);
    },
    right: (ctx) => {
      ctx.fillStyle = '#c04040';
      ctx.fillRect(3, 7, 10, 2);
      ctx.fillRect(9, 5, 2, 6);
      ctx.fillRect(10, 6, 2, 4);
    },
  };
  for (const [dir, drawArrow] of Object.entries(spinArrows)) {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const cx = c.getContext('2d')!;
    // Indoor floor base
    cx.fillStyle = '#f8f0d0';
    cx.fillRect(0, 0, 16, 16);
    cx.fillStyle = '#e8e0c0';
    cx.fillRect(0, 0, 16, 1);
    cx.fillRect(0, 0, 1, 16);
    drawArrow(cx);
    scene.textures.addCanvas(`spin_tile_${dir}`, c);
  }

  // Generate themed tile variants for towns
  const themedTileDrawers: Record<number, (ctx: CanvasRenderingContext2D, p: TownPalette) => void> = {
    [TileType.GRASS]: (ctx, p) => {
      ctx.fillStyle = p.grassBase;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = p.grassAccent;
      for (let i = 0; i < 4; i++) {
        const x = (i % 2) * 8 + 2;
        const y = Math.floor(i / 2) * 8 + 2;
        ctx.fillRect(x, y, 2, 3);
      }
    },
    [TileType.PATH]: (ctx, p) => {
      ctx.fillStyle = p.pathBase;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = p.pathAccent;
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(0, 0, 16, 1);
    },
    [TileType.TREE]: (ctx, p) => {
      ctx.fillStyle = p.treeTrunk;
      ctx.fillRect(5, 10, 6, 6);
      ctx.fillStyle = p.treeCanopy;
      ctx.fillRect(1, 1, 14, 10);
      ctx.fillStyle = p.treeCanopyLight;
      ctx.fillRect(3, 2, 10, 7);
    },
    [TileType.TALL_GRASS]: (ctx, p) => {
      ctx.fillStyle = p.tallGrassBase;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = p.tallGrassBlade;
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(i * 3 + 1, 2, 2, 12);
      }
      ctx.fillStyle = p.tallGrassLight;
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * 3 + 2, 4, 2, 8);
      }
    },
    [TileType.BUILDING]: (ctx, p) => {
      ctx.fillStyle = p.buildingWall;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = p.buildingBorder;
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(15, 0, 1, 16);
    },
    [TileType.DOOR]: (ctx, p) => {
      ctx.fillStyle = p.doorWall;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#805028';
      ctx.fillRect(3, 2, 10, 14);
      ctx.fillStyle = '#604018';
      ctx.fillRect(4, 3, 8, 12);
      ctx.fillStyle = '#c0a030';
      ctx.fillRect(10, 9, 2, 2);
    },
    [TileType.SIGN]: (ctx, p) => {
      ctx.fillStyle = p.signGrass;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#805028';
      ctx.fillRect(6, 10, 4, 6);
      ctx.fillStyle = '#d0c080';
      ctx.fillRect(2, 4, 12, 8);
      ctx.fillStyle = '#a09060';
      ctx.fillRect(3, 5, 10, 6);
    },
    [TileType.LEDGE]: (ctx, p) => {
      ctx.fillStyle = p.ledgeGrass;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#507850';
      ctx.fillRect(0, 12, 16, 4);
      ctx.fillStyle = '#608860';
      ctx.fillRect(0, 12, 16, 2);
    },
    [TileType.FENCE]: (ctx, p) => {
      ctx.fillStyle = p.fenceGrass;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#d0b880';
      ctx.fillRect(0, 4, 16, 8);
      ctx.fillStyle = '#c0a870';
      ctx.fillRect(2, 4, 2, 8);
      ctx.fillRect(12, 4, 2, 8);
      ctx.fillRect(0, 7, 16, 2);
    },
    [TileType.FLOWER]: (ctx, p) => {
      ctx.fillStyle = p.flowerGrass;
      ctx.fillRect(0, 0, 16, 16);
      const colors = ['#f05050', '#f0f050', '#f050f0'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(i * 5 + 2, 5, 3, 3);
        ctx.fillStyle = '#50a038';
        ctx.fillRect(i * 5 + 3, 8, 1, 4);
      }
    },
    [TileType.CUT_TREE]: (ctx, p) => {
      ctx.fillStyle = p.cutTreeGrass;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = p.treeTrunk;
      ctx.fillRect(6, 10, 4, 6);
      ctx.fillStyle = p.treeCanopy;
      ctx.fillRect(3, 3, 10, 8);
      ctx.fillStyle = p.treeCanopyLight;
      ctx.fillRect(4, 4, 8, 6);
      ctx.fillStyle = '#c0a040';
      ctx.fillRect(6, 5, 4, 1);
      ctx.fillRect(7, 4, 2, 3);
    },
    [TileType.ROOF]: (ctx, p) => {
      ctx.fillStyle = p.roof;
      ctx.fillRect(0, 0, 16, 16);
      // Lighter stripe for dimension
      const r = parseInt(p.roof.slice(1, 3), 16);
      const g = parseInt(p.roof.slice(3, 5), 16);
      const b = parseInt(p.roof.slice(5, 7), 16);
      const lighter = '#' + [Math.min(255, r + 24), Math.min(255, g + 24), Math.min(255, b + 24)]
        .map(v => v.toString(16).padStart(2, '0')).join('');
      const darker = '#' + [Math.max(0, r - 24), Math.max(0, g - 24), Math.max(0, b - 24)]
        .map(v => v.toString(16).padStart(2, '0')).join('');
      ctx.fillStyle = lighter;
      ctx.fillRect(0, 4, 16, 3);
      ctx.fillStyle = darker;
      ctx.fillRect(0, 14, 16, 2);
    },
    [TileType.FOUNTAIN]: (ctx, p) => {
      ctx.fillStyle = p.grassBase;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#888888';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#4090d0';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#60b0e0';
      ctx.fillRect(5, 5, 3, 2);
      ctx.fillStyle = '#c0e0f8';
      ctx.fillRect(7, 5, 2, 2);
      ctx.fillRect(7, 3, 2, 2);
    },
  };

  for (const [themeId, palette] of Object.entries(TOWN_THEMES)) {
    for (const [tileIdStr, drawFn] of Object.entries(themedTileDrawers)) {
      const tileId = Number(tileIdStr);
      const key = `tile_${themeId}_${tileId}`;
      const tc = document.createElement('canvas');
      tc.width = TILE_SIZE;
      tc.height = TILE_SIZE;
      const tcx = tc.getContext('2d')!;
      drawFn(tcx, palette);
      scene.textures.addCanvas(key, tc);
    }
  }
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

export function generateSnorlaxNPCSprite(scene: Phaser.Scene, key: string): void {
  const SIZE = 32; // Full Pokemon sprite size so Snorlax looks big
  const canvas = document.createElement('canvas');
  canvas.width = SIZE * 4;
  canvas.height = SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  // Render Snorlax Pokemon sprite once, reuse for all frames
  const pokemonCanvas = document.createElement('canvas');
  pokemonCanvas.width = SIZE;
  pokemonCanvas.height = SIZE;
  const pokemonCtx = pokemonCanvas.getContext('2d')!;
  const drawFn = CUSTOM_POKEMON_SPRITES[143]; // Snorlax
  if (drawFn) drawFn(pokemonCtx, false);

  // Same sleeping pose for all 4 directions x 2 walk frames
  for (let dirIndex = 0; dirIndex < 4; dirIndex++) {
    for (let frame = 0; frame < 2; frame++) {
      ctx.drawImage(pokemonCanvas, dirIndex * SIZE, frame * SIZE);
    }
  }

  addCanvasSpriteSheet(scene, key, canvas, SIZE, SIZE);
}

export function generateJessieSprite(scene: Phaser.Scene, key: string): void {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;
  canvas.height = TILE_SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'];
  directions.forEach((dir, dirIndex) => {
    for (let frame = 0; frame < 2; frame++) {
      ctx.save();
      ctx.translate(dirIndex * TILE_SIZE, frame * TILE_SIZE);

      // Jessie - magenta hair, white Team Rocket uniform
      // Long magenta hair
      ctx.fillStyle = '#d02070';
      ctx.fillRect(3, 0, 10, 4);
      // Hair flowing down on sides
      if (dir !== 'up') {
        ctx.fillRect(2, 2, 2, 5);
        ctx.fillRect(12, 2, 2, 5);
      }
      if (dir === 'up') {
        ctx.fillRect(2, 2, 2, 4);
        ctx.fillRect(12, 2, 2, 4);
      }
      // Face
      ctx.fillStyle = '#f0c8a0';
      ctx.fillRect(4, 3, 8, 5);
      // Eyes
      if (dir === 'down') {
        ctx.fillStyle = '#4040a0';
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillRect(9, 5, 2, 2);
      } else if (dir === 'left') {
        ctx.fillStyle = '#4040a0';
        ctx.fillRect(5, 5, 2, 2);
      } else if (dir === 'right') {
        ctx.fillStyle = '#4040a0';
        ctx.fillRect(9, 5, 2, 2);
      }
      // White uniform body
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(4, 8, 8, 4);
      // Red R on chest
      ctx.fillStyle = '#d02020';
      ctx.fillRect(6, 9, 2, 2);
      ctx.fillRect(8, 9, 1, 1);
      // Black boots
      ctx.fillStyle = '#303030';
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

export function generateJamesSprite(scene: Phaser.Scene, key: string): void {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;
  canvas.height = TILE_SIZE * 2;
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'];
  directions.forEach((dir, dirIndex) => {
    for (let frame = 0; frame < 2; frame++) {
      ctx.save();
      ctx.translate(dirIndex * TILE_SIZE, frame * TILE_SIZE);

      // James - blue/lavender hair, white Team Rocket uniform
      // Short styled blue hair
      ctx.fillStyle = '#6060d0';
      ctx.fillRect(3, 0, 10, 4);
      // Hair styled with volume
      ctx.fillRect(4, 0, 3, 1);
      if (dir === 'right') ctx.fillRect(12, 1, 2, 3);
      if (dir === 'left') ctx.fillRect(2, 1, 2, 3);
      // Face
      ctx.fillStyle = '#f0c8a0';
      ctx.fillRect(4, 3, 8, 5);
      // Eyes
      if (dir === 'down') {
        ctx.fillStyle = '#408040';
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillRect(9, 5, 2, 2);
      } else if (dir === 'left') {
        ctx.fillStyle = '#408040';
        ctx.fillRect(5, 5, 2, 2);
      } else if (dir === 'right') {
        ctx.fillStyle = '#408040';
        ctx.fillRect(9, 5, 2, 2);
      }
      // White uniform body
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(4, 8, 8, 4);
      // Red R on chest
      ctx.fillStyle = '#d02020';
      ctx.fillRect(6, 9, 2, 2);
      ctx.fillRect(8, 9, 1, 1);
      // Black boots
      ctx.fillStyle = '#303030';
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

export function generatePikachuSurfSprite(scene: Phaser.Scene): void {
  // Surfing Pikachu! Standing on a surfboard riding waves
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE * 4;  // 4 directions
  canvas.height = TILE_SIZE * 2;  // 2 frames per direction
  const ctx = canvas.getContext('2d')!;

  const directions = ['down', 'up', 'left', 'right'];
  directions.forEach((dir, dirIndex) => {
    for (let frame = 0; frame < 2; frame++) {
      ctx.save();
      ctx.translate(dirIndex * TILE_SIZE, frame * TILE_SIZE);

      // Water/wave base
      ctx.fillStyle = '#58a8f8';
      ctx.fillRect(1, 11, 14, 5);
      ctx.fillStyle = '#78c0f8';
      ctx.fillRect(2, 12, 12, 3);
      // Animated wave crests
      ctx.fillStyle = '#3890f8';
      const wo = frame * 3;
      ctx.fillRect(1 + wo, 14, 3, 1);
      ctx.fillRect(9 - wo, 15, 4, 1);
      // White foam
      ctx.fillStyle = '#f0f8ff';
      ctx.fillRect(2 + wo, 11, 2, 1);
      ctx.fillRect(10 - wo, 11, 2, 1);

      // Surfboard
      ctx.fillStyle = '#e85820';  // Orange-red board
      if (dir === 'left' || dir === 'right') {
        // Side view: longer, thinner
        ctx.fillRect(2, 9, 12, 2);
        ctx.fillRect(1, 10, 14, 1);
        // Stripe
        ctx.fillStyle = '#f8d030';
        ctx.fillRect(4, 9, 8, 1);
      } else {
        // Front/back view: shorter, wider
        ctx.fillRect(3, 9, 10, 2);
        ctx.fillRect(2, 10, 12, 1);
        // Stripe
        ctx.fillStyle = '#f8d030';
        ctx.fillRect(5, 9, 6, 1);
      }

      // Pikachu standing on the board
      // Body (shifted up to stand on board)
      ctx.fillStyle = '#f8d030';
      ctx.fillRect(5, 3, 6, 6);
      ctx.fillRect(4, 5, 8, 4);

      // Ears
      ctx.fillStyle = '#f8d030';
      if (dir === 'left') {
        ctx.fillRect(5, 0, 2, 4);
        ctx.fillRect(9, 0, 2, 4);
        // Black ear tips
        ctx.fillStyle = '#302020';
        ctx.fillRect(5, 0, 2, 1);
        ctx.fillRect(9, 0, 2, 1);
      } else if (dir === 'right') {
        ctx.fillRect(5, 0, 2, 4);
        ctx.fillRect(9, 0, 2, 4);
        ctx.fillStyle = '#302020';
        ctx.fillRect(5, 0, 2, 1);
        ctx.fillRect(9, 0, 2, 1);
      } else {
        ctx.fillRect(4, 0, 2, 4);
        ctx.fillRect(10, 0, 2, 4);
        ctx.fillStyle = '#302020';
        ctx.fillRect(4, 0, 2, 1);
        ctx.fillRect(10, 0, 2, 1);
      }

      // Direction-aware face
      if (dir === 'down') {
        // Red cheeks
        ctx.fillStyle = '#e03030';
        ctx.fillRect(4, 6, 2, 2);
        ctx.fillRect(10, 6, 2, 2);
        // Eyes - happy squint
        ctx.fillStyle = '#302020';
        ctx.fillRect(6, 4, 2, 1);
        ctx.fillRect(8, 4, 2, 1);
        // Smile
        ctx.fillRect(7, 7, 2, 1);
      } else if (dir === 'up') {
        // Back of head - no face features
        // Ear backs visible
        ctx.fillStyle = '#d8b828';
        ctx.fillRect(5, 3, 6, 2);
      } else if (dir === 'left') {
        ctx.fillStyle = '#e03030';
        ctx.fillRect(4, 6, 2, 2);
        ctx.fillStyle = '#302020';
        ctx.fillRect(5, 4, 2, 2);
      } else { // right
        ctx.fillStyle = '#e03030';
        ctx.fillRect(10, 6, 2, 2);
        ctx.fillStyle = '#302020';
        ctx.fillRect(9, 4, 2, 2);
      }

      // Tail - lightning bolt shape, raised triumphantly
      ctx.fillStyle = '#c0a020';
      if (dir === 'up' || dir === 'down') {
        // Tail sticking up behind
        ctx.fillRect(7, 0, 2, 2);
        ctx.fillRect(8, 1, 2, 2);
      } else if (dir === 'left') {
        // Tail to the right, raised
        ctx.fillRect(11, 2, 3, 2);
        ctx.fillRect(13, 1, 2, 2);
      } else {
        // Tail to the left, raised
        ctx.fillRect(2, 2, 3, 2);
        ctx.fillRect(1, 1, 2, 2);
      }

      // Feet on board
      ctx.fillStyle = '#c0a020';
      ctx.fillRect(5, 9, 2, 1);
      ctx.fillRect(9, 9, 2, 1);

      ctx.restore();
    }
  });

  addCanvasSpriteSheet(scene, 'pikachu_surf', canvas, TILE_SIZE, TILE_SIZE);
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
  // Full-body trainer-style Oak sprite (40x56, same as trainer sprites)
  const w = 40, h = 56;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Gray-white hair - distinguished, slightly tousled
  ctx.fillStyle = '#a8a098';
  ctx.fillRect(13, 1, 14, 5);
  ctx.fillRect(11, 3, 18, 4);
  ctx.fillRect(10, 5, 20, 3);
  // Hair tuft sticking up
  ctx.fillRect(15, 0, 4, 3);
  ctx.fillRect(22, 0, 3, 2);
  // Sideburns
  ctx.fillRect(10, 7, 3, 3);
  ctx.fillRect(27, 7, 3, 3);
  // Darker hair highlights
  ctx.fillStyle = '#908880';
  ctx.fillRect(12, 2, 3, 3);
  ctx.fillRect(25, 2, 3, 3);
  ctx.fillRect(16, 0, 2, 2);

  // Face
  ctx.fillStyle = '#f0c080';
  ctx.fillRect(13, 7, 14, 11);
  ctx.fillRect(11, 9, 18, 7);
  // Forehead
  ctx.fillRect(14, 6, 12, 2);

  // Eyebrows - bushy
  ctx.fillStyle = '#706860';
  ctx.fillRect(14, 9, 4, 1);
  ctx.fillRect(22, 9, 4, 1);

  // Eyes
  ctx.fillStyle = '#302020';
  ctx.fillRect(15, 11, 3, 3);
  ctx.fillRect(22, 11, 3, 3);
  // Eye whites
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(15, 11, 2, 2);
  ctx.fillRect(22, 11, 2, 2);
  // Pupils
  ctx.fillStyle = '#302020';
  ctx.fillRect(16, 12, 1, 1);
  ctx.fillRect(23, 12, 1, 1);

  // Nose
  ctx.fillStyle = '#d8a868';
  ctx.fillRect(19, 13, 2, 2);

  // Mouth - friendly smile
  ctx.fillStyle = '#c08060';
  ctx.fillRect(17, 16, 6, 1);
  ctx.fillStyle = '#d89870';
  ctx.fillRect(18, 16, 4, 1);

  // Neck
  ctx.fillStyle = '#f0c080';
  ctx.fillRect(17, 18, 6, 2);

  // Lab coat - white, full body
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(10, 20, 20, 16);
  ctx.fillRect(8, 22, 24, 12);
  ctx.fillRect(6, 24, 28, 8);
  // Coat lower half extending down
  ctx.fillRect(10, 36, 20, 4);
  ctx.fillRect(11, 40, 18, 2);

  // Lab coat shoulders/sleeves
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(6, 22, 5, 10);
  ctx.fillRect(29, 22, 5, 10);
  // Sleeve cuffs
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(6, 30, 5, 2);
  ctx.fillRect(29, 30, 5, 2);

  // Collar / lapels
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(13, 20, 3, 5);
  ctx.fillRect(24, 20, 3, 5);
  // Lapel fold line
  ctx.fillStyle = '#c8c8c8';
  ctx.fillRect(14, 20, 1, 4);
  ctx.fillRect(25, 20, 1, 4);

  // Shirt underneath (dark red/brown polo)
  ctx.fillStyle = '#a05040';
  ctx.fillRect(16, 20, 8, 6);
  ctx.fillStyle = '#904838';
  ctx.fillRect(18, 20, 4, 2);

  // Coat center line / opening
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(19, 26, 2, 14);

  // Coat pockets
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(12, 30, 5, 3);
  ctx.fillRect(23, 30, 5, 3);
  ctx.fillStyle = '#c8c8c8';
  ctx.fillRect(12, 30, 5, 1);
  ctx.fillRect(23, 30, 5, 1);

  // Hands
  ctx.fillStyle = '#f0c080';
  ctx.fillRect(5, 32, 4, 4);
  ctx.fillRect(31, 32, 4, 4);
  // Fingers
  ctx.fillStyle = '#e0b070';
  ctx.fillRect(5, 35, 1, 1);
  ctx.fillRect(34, 35, 1, 1);

  // Brown pants
  ctx.fillStyle = '#806848';
  ctx.fillRect(12, 42, 7, 8);
  ctx.fillRect(21, 42, 7, 8);
  // Pant crease
  ctx.fillStyle = '#705838';
  ctx.fillRect(15, 44, 1, 6);
  ctx.fillRect(24, 44, 1, 6);

  // Shoes - brown leather
  ctx.fillStyle = '#504030';
  ctx.fillRect(11, 50, 8, 4);
  ctx.fillRect(21, 50, 8, 4);
  // Shoe soles
  ctx.fillStyle = '#382818';
  ctx.fillRect(11, 53, 8, 2);
  ctx.fillRect(21, 53, 8, 2);
  // Shoe highlights
  ctx.fillStyle = '#605040';
  ctx.fillRect(12, 50, 3, 1);
  ctx.fillRect(22, 50, 3, 1);

  scene.textures.addCanvas('oak_portrait', canvas);
}

export function generateNidorinoPortrait(scene: Phaser.Scene): void {
  // 32x32 Pikachu portrait for intro (replaces Nidorino)
  const w = 32, h = 32;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Ears - tall pointed with black tips
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(6, 1, 5, 12);
  ctx.fillRect(7, 0, 3, 1);
  ctx.fillRect(21, 1, 5, 12);
  ctx.fillRect(22, 0, 3, 1);
  // Black ear tips
  ctx.fillStyle = '#302020';
  ctx.fillRect(6, 1, 5, 4);
  ctx.fillRect(7, 0, 3, 1);
  ctx.fillRect(21, 1, 5, 4);
  ctx.fillRect(22, 0, 3, 1);
  // Inner ear
  ctx.fillStyle = '#e8c020';
  ctx.fillRect(8, 5, 2, 4);
  ctx.fillRect(22, 5, 2, 4);

  // Head
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(7, 8, 18, 10);
  ctx.fillRect(6, 10, 20, 6);
  ctx.fillRect(9, 7, 14, 2);

  // Eyes - large and expressive
  ctx.fillStyle = '#302020';
  ctx.fillRect(10, 11, 4, 5);
  ctx.fillRect(18, 11, 4, 5);
  // Eye whites / highlights
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(10, 11, 3, 3);
  ctx.fillRect(18, 11, 3, 3);
  // Pupils
  ctx.fillStyle = '#302020';
  ctx.fillRect(11, 12, 2, 2);
  ctx.fillRect(19, 12, 2, 2);
  // Eye shine
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(12, 12, 1, 1);
  ctx.fillRect(20, 12, 1, 1);

  // Red cheeks
  ctx.fillStyle = '#e03030';
  ctx.fillRect(6, 14, 4, 3);
  ctx.fillRect(22, 14, 4, 3);
  // Cheek highlight
  ctx.fillStyle = '#f04848';
  ctx.fillRect(7, 14, 2, 1);
  ctx.fillRect(23, 14, 2, 1);

  // Nose
  ctx.fillStyle = '#302020';
  ctx.fillRect(15, 14, 2, 1);

  // Mouth - happy smile
  ctx.fillStyle = '#302020';
  ctx.fillRect(14, 16, 4, 1);
  ctx.fillStyle = '#c08060';
  ctx.fillRect(15, 16, 2, 1);

  // Body
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(9, 18, 14, 8);
  ctx.fillRect(8, 19, 16, 5);

  // Belly / lighter patch
  ctx.fillStyle = '#f8e878';
  ctx.fillRect(12, 19, 8, 5);

  // Brown back stripes
  ctx.fillStyle = '#c0a020';
  ctx.fillRect(10, 19, 2, 4);
  ctx.fillRect(20, 19, 2, 4);

  // Arms
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(6, 20, 3, 4);
  ctx.fillRect(23, 20, 3, 4);
  // Arm tips
  ctx.fillStyle = '#e8c020';
  ctx.fillRect(6, 23, 2, 1);
  ctx.fillRect(24, 23, 2, 1);

  // Feet
  ctx.fillStyle = '#e8c020';
  ctx.fillRect(9, 26, 5, 3);
  ctx.fillRect(18, 26, 5, 3);
  // Toes
  ctx.fillStyle = '#c0a020';
  ctx.fillRect(9, 28, 2, 1);
  ctx.fillRect(12, 28, 2, 1);
  ctx.fillRect(18, 28, 2, 1);
  ctx.fillRect(21, 28, 2, 1);

  // Tail - lightning bolt shape
  ctx.fillStyle = '#c0a020';
  ctx.fillRect(25, 12, 3, 3);
  ctx.fillRect(27, 9, 3, 4);
  ctx.fillRect(25, 7, 3, 3);
  ctx.fillRect(27, 5, 3, 3);
  ctx.fillRect(26, 4, 2, 2);
  ctx.fillStyle = '#f8d030';
  ctx.fillRect(24, 14, 3, 3);
  ctx.fillRect(25, 16, 2, 2);

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

// Pikachu face portraits — 5 expressions based on happiness level
// Frame 0: Ecstatic (>=200), Frame 1: Happy (>=150), Frame 2: Content (>=100),
// Frame 3: Unsure (>=50), Frame 4: Unhappy (<50)
export const PIKACHU_FACE_SIZE = 48;
export const PIKACHU_FACE_LABELS = ['Ecstatic (200+)', 'Happy (150+)', 'Content (100+)', 'Unsure (50+)', 'Unhappy (<50)'];

export function drawPikachuFaces(ctx: CanvasRenderingContext2D): void {
  const S = PIKACHU_FACE_SIZE;

  function drawBase(ox: number) {
    // Head shape — yellow circle-ish
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(ox + 10, 8, 28, 30);
    ctx.fillRect(ox + 8, 12, 32, 24);
    ctx.fillRect(ox + 6, 16, 36, 18);
    // Rounded top
    ctx.fillRect(ox + 14, 6, 20, 4);
    // Chin
    ctx.fillRect(ox + 14, 38, 20, 4);
    ctx.fillRect(ox + 18, 42, 12, 2);

    // Ears — tall pointed
    ctx.fillStyle = '#f8d030';
    ctx.fillRect(ox + 6, 0, 6, 16);
    ctx.fillRect(ox + 8, 0, 4, 18);
    ctx.fillRect(ox + 36, 0, 6, 16);
    ctx.fillRect(ox + 36, 0, 4, 18);
    // Ear tips — black
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 7, 0, 4, 5);
    ctx.fillRect(ox + 37, 0, 4, 5);

    // Cheeks — red circles
    ctx.fillStyle = '#e03030';
    ctx.fillRect(ox + 6, 26, 6, 5);
    ctx.fillRect(ox + 7, 25, 4, 7);
    ctx.fillRect(ox + 36, 26, 6, 5);
    ctx.fillRect(ox + 37, 25, 4, 7);

    // Nose — tiny dark dot
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 22, 24, 4, 3);
    ctx.fillRect(ox + 23, 23, 2, 1);
  }

  // Frame 0: Ecstatic — heart eyes, huge open smile
  {
    const ox = 0;
    drawBase(ox);
    // Heart eyes (left)
    ctx.fillStyle = '#e03060';
    ctx.fillRect(ox + 13, 16, 2, 2);
    ctx.fillRect(ox + 17, 16, 2, 2);
    ctx.fillRect(ox + 12, 18, 8, 2);
    ctx.fillRect(ox + 13, 20, 6, 2);
    ctx.fillRect(ox + 14, 22, 4, 1);
    ctx.fillRect(ox + 15, 23, 2, 1);
    // Heart eyes (right)
    ctx.fillRect(ox + 29, 16, 2, 2);
    ctx.fillRect(ox + 33, 16, 2, 2);
    ctx.fillRect(ox + 28, 18, 8, 2);
    ctx.fillRect(ox + 29, 20, 6, 2);
    ctx.fillRect(ox + 30, 22, 4, 1);
    ctx.fillRect(ox + 31, 23, 2, 1);
    // Big open smile
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 16, 30, 16, 2);
    ctx.fillRect(ox + 18, 32, 12, 3);
    ctx.fillRect(ox + 20, 35, 8, 1);
    // Tongue
    ctx.fillStyle = '#f06080';
    ctx.fillRect(ox + 20, 32, 8, 2);
    ctx.fillRect(ox + 22, 34, 4, 1);
  }

  // Frame 1: Happy — bright eyes, smile
  {
    const ox = S;
    drawBase(ox);
    // Eyes — big shiny
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 14, 17, 6, 6);
    ctx.fillRect(ox + 28, 17, 6, 6);
    // Eye shine
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(ox + 15, 18, 2, 2);
    ctx.fillRect(ox + 29, 18, 2, 2);
    // Small shine
    ctx.fillRect(ox + 18, 21, 1, 1);
    ctx.fillRect(ox + 32, 21, 1, 1);
    // Happy smile — curved up
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 18, 30, 12, 2);
    ctx.fillRect(ox + 16, 29, 3, 1);
    ctx.fillRect(ox + 29, 29, 3, 1);
    // Open mouth
    ctx.fillStyle = '#f06080';
    ctx.fillRect(ox + 20, 31, 8, 2);
  }

  // Frame 2: Content — normal eyes, slight smile
  {
    const ox = S * 2;
    drawBase(ox);
    // Eyes — normal
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 14, 18, 5, 5);
    ctx.fillRect(ox + 29, 18, 5, 5);
    // Eye shine
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(ox + 15, 19, 2, 2);
    ctx.fillRect(ox + 30, 19, 2, 2);
    // Slight smile
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 19, 31, 10, 1);
    ctx.fillRect(ox + 17, 30, 3, 1);
    ctx.fillRect(ox + 28, 30, 3, 1);
  }

  // Frame 3: Unsure — eyes looking away, flat mouth
  {
    const ox = S * 3;
    drawBase(ox);
    // Eyes — looking to side, smaller
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 13, 18, 5, 5);
    ctx.fillRect(ox + 28, 18, 5, 5);
    // Pupils shifted left
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(ox + 13, 19, 2, 2);
    ctx.fillRect(ox + 28, 19, 2, 2);
    // Eyebrows — slightly furrowed
    ctx.fillStyle = '#c0a020';
    ctx.fillRect(ox + 13, 16, 6, 2);
    ctx.fillRect(ox + 29, 16, 6, 2);
    // Flat/wavy mouth
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 19, 31, 10, 1);
  }

  // Frame 4: Unhappy — angry eyes, frown
  {
    const ox = S * 4;
    drawBase(ox);
    // Angry eyebrows — diagonal
    ctx.fillStyle = '#c0a020';
    ctx.fillRect(ox + 12, 14, 8, 2);
    ctx.fillRect(ox + 14, 16, 6, 1);
    ctx.fillRect(ox + 28, 14, 8, 2);
    ctx.fillRect(ox + 30, 16, 6, 1);
    // Eyes — narrowed, angry
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 14, 18, 6, 4);
    ctx.fillRect(ox + 28, 18, 6, 4);
    // Eye shine — small
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(ox + 15, 19, 1, 1);
    ctx.fillRect(ox + 29, 19, 1, 1);
    // Frown
    ctx.fillStyle = '#302020';
    ctx.fillRect(ox + 19, 32, 10, 1);
    ctx.fillRect(ox + 17, 31, 3, 1);
    ctx.fillRect(ox + 28, 31, 3, 1);
    // Teeth gritting
    ctx.fillRect(ox + 20, 33, 8, 1);
  }
}

export function generatePikachuFacePortraits(scene: Phaser.Scene): void {
  const S = PIKACHU_FACE_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = S * 5;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  drawPikachuFaces(ctx);
  addCanvasSpriteSheet(scene, 'pikachu_face', canvas, S, S);
}
