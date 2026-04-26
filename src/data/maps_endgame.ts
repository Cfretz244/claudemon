import { MapData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { ELITE_FOUR, CHAMPION } from './eliteFour';

const T = TileType;

function fill2D<V>(w: number, h: number, v: V): V[][] {
  return Array.from({ length: h }, () => Array(w).fill(v));
}

const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
  T.CUT_TREE, T.BOULDER, T.ROOF, T.FOUNTAIN,
]);

// ─────────────────────────────────────────────────────────────
// 1. ROUTE 19  (15x20 vertical water route)
// ─────────────────────────────────────────────────────────────
export const ROUTE19: MapData = (() => {
  const W = 15, H = 20;
  const tiles = fill2D(W, H, T.WATER);
  const collision = fill2D(W, H, true);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Sand beach at top (enter from Fuchsia City)
  fillRect(0, 0, 15, 4, T.SAND);

  // PATH through the sand area
  fillRect(5, 1, 5, 2, T.PATH);

  return {
    id: 'route19',
    name: 'ROUTE 19',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North entrance → Fuchsia City
      { x: 7, y: 0, targetMap: 'fuchsia_city', targetX: 12, targetY: 23 },
      // South exit → Route 20
      { x: 7, y: 19, targetMap: 'route20', targetX: 1, targetY: 5 },
    ],
    npcs: [
      {
        id: 'route19_swimmer1',
        x: 3, y: 10,
        spriteColor: 0x4090d0,
        direction: Direction.RIGHT,
        dialogue: [
          'SWIMMER: The current\nis strong here!',
          "Don't let it sweep\nyou away!",
        ],
        isTrainer: true,
        sightRange: 5,
      },
      {
        id: 'route19_swimmer2',
        x: 11, y: 15,
        spriteColor: 0x60a0e0,
        direction: Direction.LEFT,
        dialogue: [
          'SWIMMER: I swim this\nroute every day!',
          "Think you can\nbeat me?",
        ],
        isTrainer: true,
        sightRange: 5,
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 72, minLevel: 20, maxLevel: 30, weight: 60 },  // Tentacool
        { speciesId: 73, minLevel: 25, maxLevel: 35, weight: 20 },  // Tentacruel
        { speciesId: 129, minLevel: 15, maxLevel: 25, weight: 20 }, // Magikarp
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 2. ROUTE 20  (30x10 horizontal water route — two blocking islands)
// ─────────────────────────────────────────────────────────────
export const ROUTE20: MapData = (() => {
  const W = 30, H = 10;
  const tiles = fill2D(W, H, T.WATER);
  const collision = fill2D(W, H, true);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // West island (x=8-12, full height) — blocks water passage
  fillRect(8, 0, 5, 10, T.CAVE_WALL);
  // Sand shore on east side of west island
  for (let y = 0; y < H; y++) setTile(12, y, T.SAND);
  setTile(12, 5, T.DOOR); // Cave entrance

  // East island (x=17-21, full height) — blocks water passage
  fillRect(17, 0, 5, 10, T.CAVE_WALL);
  // Sand shore on west side of east island
  for (let y = 0; y < H; y++) setTile(17, y, T.SAND);
  setTile(17, 5, T.DOOR); // Cave exit

  // Water gap between islands (x=13-16) is cosmetic — not reachable from either end

  return {
    id: 'route20',
    name: 'ROUTE 20',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance → Route 19
      { x: 0, y: 4, targetMap: 'route19', targetX: 7, targetY: 18 },
      { x: 0, y: 5, targetMap: 'route19', targetX: 7, targetY: 18 },
      // East exit → Cinnabar Island
      { x: 29, y: 4, targetMap: 'cinnabar_island', targetX: 2, targetY: 12 },
      { x: 29, y: 5, targetMap: 'cinnabar_island', targetX: 2, targetY: 12 },
      // Seafoam cave entrance (west island)
      { x: 12, y: 5, targetMap: 'seafoam_b1f', targetX: 9, targetY: 18 },
      // Seafoam cave exit (east island) — warp target only
      { x: 17, y: 5, targetMap: 'seafoam_b1f', targetX: 17, targetY: 2 },
    ],
    npcs: [
      {
        id: 'route20_swimmer1',
        x: 4, y: 3,
        spriteColor: 0x4090d0,
        direction: Direction.DOWN,
        dialogue: [
          'SWIMMER: You have to\ngo through SEAFOAM',
          'ISLANDS to get\nacross!',
        ],
        isTrainer: true,
        sightRange: 5,
      },
      {
        id: 'route20_swimmer2',
        x: 25, y: 7,
        spriteColor: 0x60a0e0,
        direction: Direction.UP,
        dialogue: [
          "SWIMMER: CINNABAR\nISLAND isn't far!",
          "Let's battle before\nyou go!",
        ],
        isTrainer: true,
        sightRange: 5,
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 72, minLevel: 25, maxLevel: 35, weight: 50 },  // Tentacool
        { speciesId: 73, minLevel: 30, maxLevel: 35, weight: 25 },  // Tentacruel
        { speciesId: 129, minLevel: 20, maxLevel: 30, weight: 25 }, // Magikarp
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 3a. SEAFOAM B1F  (20x20 cave — main through-path)
// ─────────────────────────────────────────────────────────────
export const SEAFOAM_B1F: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Cave wall borders (2 tiles thick)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.CAVE_WALL); setTile(x, 1, T.CAVE_WALL);
    setTile(x, H - 1, T.CAVE_WALL); setTile(x, H - 2, T.CAVE_WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.CAVE_WALL); setTile(1, y, T.CAVE_WALL);
    setTile(W - 1, y, T.CAVE_WALL); setTile(W - 2, y, T.CAVE_WALL);
  }

  // South entrance (from Route 20 west island)
  setTile(9, 18, T.CAVE_FLOOR); setTile(9, 19, T.CAVE_FLOOR);
  // East exit (to Route 20 east island) — open north wall
  setTile(17, 0, T.CAVE_FLOOR); setTile(17, 1, T.CAVE_FLOOR);

  // Interior corridors — winding path from south to east exit
  fillRect(4, 4, 3, 2, T.CAVE_WALL);
  fillRect(11, 3, 4, 2, T.CAVE_WALL);
  fillRect(6, 8, 2, 3, T.CAVE_WALL);
  fillRect(13, 7, 3, 2, T.CAVE_WALL);
  fillRect(4, 12, 3, 2, T.CAVE_WALL);
  fillRect(14, 12, 3, 2, T.CAVE_WALL);
  fillRect(8, 15, 3, 2, T.CAVE_WALL);

  // Underground water features
  fillRect(10, 8, 3, 3, T.WATER);
  fillRect(3, 14, 3, 2, T.WATER);

  // Ladder down to B2F
  setTile(4, 6, T.CAVE_ENTRANCE);

  return {
    id: 'seafoam_b1f',
    name: 'SEAFOAM B1F',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South entrance → Route 20 (west island)
      { x: 9, y: 19, targetMap: 'route20', targetX: 12, targetY: 4 },
      // East exit → Route 20 (east island)
      { x: 17, y: 0, targetMap: 'route20', targetX: 17, targetY: 6 },
      // Ladder down to B2F
      { x: 4, y: 6, targetMap: 'seafoam_b2f', targetX: 4, targetY: 3 },
    ],
    npcs: [
      {
        id: 'seafoam_rare_candy',
        x: 5, y: 10,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'rare_candy',
      },
      {
        id: 'seafoam_trainer1',
        x: 5, y: 5,
        spriteColor: 0xc06060,
        direction: Direction.RIGHT,
        dialogue: [
          'HIKER: This cave is\nfreezing cold!',
          'There must be an\nice POKeMON nearby!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'seafoam_trainer2',
        x: 15, y: 15,
        spriteColor: 0x6060c0,
        direction: Direction.LEFT,
        dialogue: [
          'SWIMMER: The\nunderground rivers',
          'make this cave\ntreacherous!',
        ],
        isTrainer: true,
        sightRange: 5,
      },
    ],
    wildEncounters: {
      grassRate: 0.08,
      encounters: [
        { speciesId: 86, minLevel: 30, maxLevel: 34, weight: 30 },  // Seel
        { speciesId: 41, minLevel: 30, maxLevel: 32, weight: 25 },  // Zubat
        { speciesId: 42, minLevel: 32, maxLevel: 36, weight: 15 },  // Golbat
        { speciesId: 90, minLevel: 30, maxLevel: 34, weight: 30 },  // Shellder
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 3b. SEAFOAM B2F  (20x20 cave — middle floor)
// ─────────────────────────────────────────────────────────────
export const SEAFOAM_B2F: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Cave wall borders (2 tiles thick)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.CAVE_WALL); setTile(x, 1, T.CAVE_WALL);
    setTile(x, H - 1, T.CAVE_WALL); setTile(x, H - 2, T.CAVE_WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.CAVE_WALL); setTile(1, y, T.CAVE_WALL);
    setTile(W - 1, y, T.CAVE_WALL); setTile(W - 2, y, T.CAVE_WALL);
  }

  // Interior walls creating corridors
  fillRect(5, 5, 4, 2, T.CAVE_WALL);
  fillRect(12, 4, 3, 3, T.CAVE_WALL);
  fillRect(3, 9, 3, 2, T.CAVE_WALL);
  fillRect(9, 9, 2, 3, T.CAVE_WALL);
  fillRect(14, 10, 3, 2, T.CAVE_WALL);
  fillRect(5, 14, 4, 2, T.CAVE_WALL);
  fillRect(13, 14, 3, 2, T.CAVE_WALL);

  // Water pools
  fillRect(10, 5, 2, 2, T.WATER);
  fillRect(4, 16, 3, 2, T.WATER);

  // Ladder up to B1F
  setTile(4, 3, T.CAVE_ENTRANCE);
  // Ladder down to B3F
  setTile(15, 16, T.CAVE_ENTRANCE);

  return {
    id: 'seafoam_b2f',
    name: 'SEAFOAM B2F',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Ladder up to B1F
      { x: 4, y: 3, targetMap: 'seafoam_b1f', targetX: 4, targetY: 7 },
      // Ladder down to B3F
      { x: 15, y: 16, targetMap: 'seafoam_b3f', targetX: 15, targetY: 3 },
    ],
    npcs: [
      {
        id: 'seafoam_b2f_trainer1',
        x: 7, y: 8,
        spriteColor: 0xc06060,
        direction: Direction.DOWN,
        dialogue: [
          'HIKER: These caves\ngo deep!',
          'I wonder what lies\nat the bottom...',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'seafoam_b2f_trainer2',
        x: 12, y: 12,
        spriteColor: 0x6060c0,
        direction: Direction.LEFT,
        dialogue: [
          'SWIMMER: The water\nhere is ice cold!',
          'Something powerful\nlives below!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.08,
      encounters: [
        { speciesId: 86, minLevel: 30, maxLevel: 34, weight: 25 },  // Seel
        { speciesId: 87, minLevel: 32, maxLevel: 36, weight: 15 },  // Dewgong
        { speciesId: 116, minLevel: 30, maxLevel: 34, weight: 20 }, // Horsea
        { speciesId: 118, minLevel: 30, maxLevel: 34, weight: 20 }, // Goldeen
        { speciesId: 90, minLevel: 30, maxLevel: 34, weight: 20 },  // Shellder
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 3c. SEAFOAM B3F  (20x20 cave — Articuno's chamber)
// ─────────────────────────────────────────────────────────────
export const SEAFOAM_B3F: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Cave wall borders (2 tiles thick)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.CAVE_WALL); setTile(x, 1, T.CAVE_WALL);
    setTile(x, H - 1, T.CAVE_WALL); setTile(x, H - 2, T.CAVE_WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.CAVE_WALL); setTile(1, y, T.CAVE_WALL);
    setTile(W - 1, y, T.CAVE_WALL); setTile(W - 2, y, T.CAVE_WALL);
  }

  // Interior walls creating corridors to Articuno chamber
  fillRect(5, 4, 4, 2, T.CAVE_WALL);
  fillRect(12, 3, 4, 2, T.CAVE_WALL);
  fillRect(3, 8, 3, 2, T.CAVE_WALL);
  fillRect(14, 8, 3, 2, T.CAVE_WALL);
  fillRect(6, 12, 3, 2, T.CAVE_WALL);
  fillRect(12, 12, 4, 2, T.CAVE_WALL);
  // Wall separating main area from Articuno chamber (y=6-7, x=7-16)
  fillRect(7, 6, 10, 2, T.CAVE_WALL);
  // Opening in the wall blocked by boulders
  setTile(10, 6, T.CAVE_FLOOR); setTile(10, 7, T.CAVE_FLOOR);

  // Strength boulders blocking path to Articuno
  setTile(10, 6, T.BOULDER);
  setTile(10, 7, T.BOULDER);
  setTile(11, 7, T.BOULDER);

  // Water pools
  fillRect(3, 14, 4, 3, T.WATER);
  fillRect(13, 14, 4, 3, T.WATER);

  // Ladder up to B2F
  setTile(15, 3, T.CAVE_ENTRANCE);

  return {
    id: 'seafoam_b3f',
    name: 'SEAFOAM B3F',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Ladder up to B2F
      { x: 15, y: 3, targetMap: 'seafoam_b2f', targetX: 15, targetY: 17 },
    ],
    npcs: [
      {
        id: 'articuno_seafoam',
        x: 10, y: 4,
        spriteColor: 0x90d0f0,
        direction: Direction.DOWN,
        dialogue: [
          'A legendary bird\nPOKeMON is here!',
          "The air is freezing\ncold around it!",
          "It's ARTICUNO!",
        ],
        isTrainer: false,
      },
    ],
    wildEncounters: {
      grassRate: 0.08,
      encounters: [
        { speciesId: 86, minLevel: 30, maxLevel: 34, weight: 20 },  // Seel
        { speciesId: 87, minLevel: 32, maxLevel: 36, weight: 15 },  // Dewgong
        { speciesId: 90, minLevel: 30, maxLevel: 34, weight: 15 },  // Shellder
        { speciesId: 116, minLevel: 30, maxLevel: 32, weight: 15 }, // Horsea
        { speciesId: 118, minLevel: 30, maxLevel: 34, weight: 15 }, // Goldeen
        { speciesId: 41, minLevel: 30, maxLevel: 34, weight: 20 },  // Zubat
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 4. CINNABAR ISLAND  (20x20)
// ─────────────────────────────────────────────────────────────
export const CINNABAR_ISLAND: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.SAND);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Water borders on 3 sides (west, east, south)
  fillRect(0, 0, 2, 20, T.WATER);
  fillRect(18, 0, 2, 20, T.WATER);
  fillRect(0, 18, 20, 2, T.WATER);

  // PATH grid through the island
  fillRect(2, 4, 16, 1, T.PATH);
  fillRect(2, 10, 16, 1, T.PATH);
  fillRect(2, 16, 16, 1, T.PATH);
  fillRect(9, 0, 2, 18, T.PATH);

  // Cinnabar Gym
  fillRect(3, 5, 6, 1, T.ROOF);
  fillRect(3, 6, 6, 4, T.BUILDING);
  setTile(6, 9, T.DOOR);

  // Pokemon Center
  fillRect(12, 5, 5, 1, T.ROOF);
  fillRect(12, 6, 5, 3, T.BUILDING);
  setTile(14, 8, T.DOOR);

  // Pokemon Mansion
  fillRect(3, 12, 5, 1, T.ROOF);
  fillRect(3, 13, 5, 4, T.BUILDING);
  setTile(5, 16, T.DOOR);

  // Pokemart
  fillRect(12, 12, 5, 1, T.ROOF);
  fillRect(12, 13, 5, 3, T.BUILDING);
  setTile(14, 15, T.DOOR);

  // Signs
  setTile(7, 10, T.SIGN);  // Near gym
  setTile(15, 10, T.SIGN); // Near Pokemon Center

  // Open water border for west entrance
  setTile(2, 9, T.PATH);

  // Open top border for north exit
  setTile(9, 0, T.PATH);
  setTile(10, 0, T.PATH);

  return {
    id: 'cinnabar_island',
    name: 'CINNABAR ISLAND',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North exit → Route 21
      { x: 9, y: 0, targetMap: 'route21', targetX: 7, targetY: 24 },
      { x: 10, y: 0, targetMap: 'route21', targetX: 7, targetY: 24 },
      // West water entrance → Route 20
      { x: 2, y: 9, targetMap: 'route20', targetX: 28, targetY: 4 },
      // Gym warp
      { x: 6, y: 9, targetMap: 'cinnabar_gym', targetX: 4, targetY: 13 },
      // Pokemon Center warp
      { x: 14, y: 8, targetMap: 'pokemon_center_cinnabar', targetX: 4, targetY: 7 },
      // Pokemon Mansion warp
      { x: 5, y: 16, targetMap: 'pokemon_mansion', targetX: 7, targetY: 14 },
      // Pokemart
      { x: 14, y: 15, targetMap: 'pokemart_cinnabar', targetX: 3, targetY: 7 },
    ],
    npcs: [
      {
        id: 'cinnabar_npc1',
        x: 11, y: 4,
        spriteColor: 0xf0a060,
        direction: Direction.DOWN,
        dialogue: [
          'CINNABAR ISLAND',
          'The Fiery Town of\nBurning Desire!',
          'BLAINE is the GYM\nLEADER here.',
          "He's a fire POKeMON\nexpert!",
        ],
      },
      {
        id: 'cinnabar_npc2',
        x: 6, y: 16,
        spriteColor: 0x80c080,
        direction: Direction.RIGHT,
        dialogue: [
          'The POKeMON MANSION\nis full of mystery.',
          'Scientists once did\nexperiments there...',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 5. CINNABAR GYM  (10x14 indoor)
// ─────────────────────────────────────────────────────────────
export const CINNABAR_GYM: MapData = (() => {
  const W = 10, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls top 2 rows + sides
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Sand tiles in arena area (fire/volcano theme)
  fillRect(2, 4, 6, 7, T.SAND);

  // Approach path from door
  fillRect(4, 11, 2, 3, T.PATH);

  // Entrance mat on exit warps
  setTile(4, 13, T.DOORMAT);
  setTile(5, 13, T.DOORMAT);

  return {
    id: 'cinnabar_gym',
    name: 'CINNABAR GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'cinnabar_island', targetX: 6, targetY: 10 },
      { x: 5, y: 13, targetMap: 'cinnabar_island', targetX: 6, targetY: 10 },
    ],
    npcs: [
      {
        id: 'blaine',
        x: 4, y: 3,
        spriteColor: 0xf04020,
        direction: Direction.DOWN,
        dialogue: [
          "BLAINE: Hah! I'm\nBLAINE!",
          'The hot-headed quiz\nmaster!',
          'Show me your fire!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'cinnabar_gym_trainer1',
        x: 2, y: 7,
        spriteColor: 0xd06040,
        direction: Direction.RIGHT,
        dialogue: [
          'SUPER NERD: Do you\nknow about FIRE types?',
          "Let me quiz you\nwith a battle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'cinnabar_gym_trainer2',
        x: 7, y: 9,
        spriteColor: 0xc05030,
        direction: Direction.LEFT,
        dialogue: [
          "BURGLAR: I'll burn\nyou up!",
          "BLAINE's fire burns\nhotter though!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 6. POKEMON MANSION  (15x15 indoor)
// ─────────────────────────────────────────────────────────────
export const POKEMON_MANSION: MapData = (() => {
  const W = 15, H = 15;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls top 2 rows + sides
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Ruined mansion look: scattered wall tiles (fallen pillars/debris)
  setTile(3, 4, T.WALL);
  setTile(4, 4, T.WALL);
  setTile(8, 3, T.WALL);
  setTile(11, 5, T.WALL);
  setTile(12, 5, T.WALL);
  setTile(5, 8, T.WALL);
  setTile(10, 8, T.WALL);
  setTile(3, 11, T.WALL);
  setTile(11, 11, T.WALL);
  setTile(12, 11, T.WALL);

  // Counters as tables/furniture
  fillRect(2, 6, 2, 1, T.COUNTER);
  fillRect(11, 7, 2, 1, T.COUNTER);
  setTile(6, 10, T.COUNTER);
  setTile(9, 12, T.COUNTER);

  // Open entrance
  setTile(7, 14, T.INDOOR_FLOOR);

  // Entrance mat on exit warp
  setTile(7, 14, T.DOORMAT);

  return {
    id: 'pokemon_mansion',
    name: 'POKeMON MANSION',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Entry → Cinnabar Island
      { x: 7, y: 14, targetMap: 'cinnabar_island', targetX: 5, targetY: 17 },
    ],
    npcs: [
      {
        id: 'mansion_trainer1',
        x: 4, y: 6,
        spriteColor: 0xf0f0f0,
        direction: Direction.RIGHT,
        dialogue: [
          'SCIENTIST: We were\nstudying POKeMON',
          'genetics in this\nmansion...',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'mansion_trainer2',
        x: 10, y: 10,
        spriteColor: 0xe0e0e0,
        direction: Direction.LEFT,
        dialogue: [
          'SCIENTIST: The\nexperiments here',
          'created something\nincredible...',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'mansion_npc',
        x: 7, y: 4,
        spriteColor: 0xb0b0b0,
        direction: Direction.DOWN,
        dialogue: [
          'Diary: Feb 6',
          'MEW gave birth.',
          'We named the newborn\nMEWTWO.',
          'Diary: Sep 1',
          'MEWTWO is far too\npowerful.',
          'We have failed to\ncurb its vicious',
          'tendencies...',
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 109, minLevel: 30, maxLevel: 36, weight: 25 }, // Koffing
        { speciesId: 88, minLevel: 30, maxLevel: 36, weight: 20 },  // Grimer
        { speciesId: 77, minLevel: 32, maxLevel: 36, weight: 20 },  // Ponyta
        { speciesId: 58, minLevel: 32, maxLevel: 36, weight: 20 },  // Growlithe
        { speciesId: 132, minLevel: 34, maxLevel: 36, weight: 10 }, // Ditto
        { speciesId: 126, minLevel: 38, maxLevel: 38, weight: 5 },  // Magmar
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 7. POKEMON CENTER (CINNABAR)  (10x8 indoor)
// ─────────────────────────────────────────────────────────────
export const POKEMON_CENTER_CINNABAR: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls: top 2 rows and sides
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Nurse counter — enclosed bar with side returns
  setTile(3, 2, T.COUNTER);
  setTile(4, 2, T.COUNTER);
  setTile(5, 2, T.COUNTER);
  setTile(6, 2, T.COUNTER);
  setTile(3, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet runner to door
  setTile(4, 5, T.CARPET);
  setTile(5, 5, T.CARPET);
  setTile(4, 6, T.CARPET);
  setTile(5, 6, T.CARPET);

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT);
  setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_cinnabar',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'cinnabar_island', targetX: 14, targetY: 9 },
      { x: 5, y: 7, targetMap: 'cinnabar_island', targetX: 14, targetY: 9 },
    ],
    npcs: [
      {
        id: 'nurse_cinnabar',
        x: 5, y: 2,
        spriteColor: 0xf080a0,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome to our\nPOKeMON CENTER!',
          'We heal your POKeMON\nback to perfect health!',
          'Your POKeMON have been\nfully restored!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 8. ROUTE 21  (15x25 vertical water route)
// ─────────────────────────────────────────────────────────────
export const ROUTE21: MapData = (() => {
  const W = 15, H = 25;
  const tiles = fill2D(W, H, T.WATER);
  const collision = fill2D(W, H, true);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Small island rest stop midway
  fillRect(4, 10, 7, 3, T.SAND);
  fillRect(5, 11, 5, 1, T.GRASS);

  return {
    id: 'route21',
    name: 'ROUTE 21',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North exit → Pallet Town
      { x: 7, y: 0, targetMap: 'pallet_town', targetX: 9, targetY: 17 },
      // South entrance → Cinnabar Island
      { x: 7, y: 24, targetMap: 'cinnabar_island', targetX: 9, targetY: 1 },
    ],
    npcs: [
      {
        id: 'route21_swimmer1',
        x: 3, y: 6,
        spriteColor: 0x4090d0,
        direction: Direction.RIGHT,
        dialogue: [
          'SWIMMER: This route\nconnects PALLET TOWN',
          'to CINNABAR ISLAND!',
        ],
        isTrainer: true,
        sightRange: 5,
      },
      {
        id: 'route21_swimmer2',
        x: 11, y: 18,
        spriteColor: 0x60a0e0,
        direction: Direction.LEFT,
        dialogue: [
          "SWIMMER: You're going\nto CINNABAR?",
          "BLAINE's GYM is\ntough!",
        ],
        isTrainer: true,
        sightRange: 5,
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 72, minLevel: 20, maxLevel: 30, weight: 50 },  // Tentacool
        { speciesId: 73, minLevel: 28, maxLevel: 35, weight: 25 },  // Tentacruel
        { speciesId: 129, minLevel: 15, maxLevel: 25, weight: 25 }, // Magikarp
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 9. ROUTE 22  (25x10 horizontal)
// ─────────────────────────────────────────────────────────────
export const ROUTE22: MapData = (() => {
  const W = 25, H = 10;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Tree borders top (2 tiles)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, 1, T.TREE);
  }

  // Horizontal path
  fillRect(0, 4, 25, 2, T.PATH);

  // Water on south side
  fillRect(0, 8, 25, 2, T.WATER);

  // Tall grass patches
  fillRect(3, 2, 4, 2, T.TALL_GRASS);
  fillRect(10, 2, 3, 2, T.TALL_GRASS);
  fillRect(18, 2, 4, 2, T.TALL_GRASS);
  fillRect(6, 6, 3, 2, T.TALL_GRASS);
  fillRect(15, 6, 4, 2, T.TALL_GRASS);

  // Open edges for warps
  setTile(24, 4, T.PATH);
  setTile(24, 5, T.PATH);
  setTile(0, 4, T.PATH);
  setTile(0, 5, T.PATH);

  return {
    id: 'route22',
    name: 'ROUTE 22',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // East entrance → Viridian City
      { x: 24, y: 4, targetMap: 'viridian_city', targetX: 3, targetY: 14 },
      { x: 24, y: 5, targetMap: 'viridian_city', targetX: 3, targetY: 14 },
      // West exit → Route 23
      { x: 0, y: 4, targetMap: 'route23', targetX: 7, targetY: 24 },
      { x: 0, y: 5, targetMap: 'route23', targetX: 7, targetY: 24 },
    ],
    npcs: [
      {
        id: 'rival_route22',
        x: 12, y: 4,
        spriteColor: 0x6080c0,
        direction: Direction.LEFT,
        dialogue: [
          'RIVAL: Hey! You\nheading to the',
          'POKeMON LEAGUE?',
          "I'm going to be the\nCHAMPION!",
          "Don't even think\nabout beating me!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 56, minLevel: 3, maxLevel: 5, weight: 25 },   // Mankey
        { speciesId: 21, minLevel: 3, maxLevel: 5, weight: 25 },   // Spearow
        { speciesId: 32, minLevel: 3, maxLevel: 6, weight: 20 },   // Nidoran M
        { speciesId: 29, minLevel: 3, maxLevel: 6, weight: 20 },   // Nidoran F
        { speciesId: 19, minLevel: 2, maxLevel: 5, weight: 10 },   // Rattata
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 10. ROUTE 23  (15x25 vertical)
// ─────────────────────────────────────────────────────────────
export const ROUTE23: MapData = (() => {
  const W = 15, H = 25;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Tree borders (2 tiles) left and right
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Vertical path
  fillRect(6, 0, 3, 25, T.PATH);

  // Water sections on sides
  fillRect(0, 5, 5, 5, T.WATER);
  fillRect(10, 15, 5, 5, T.WATER);

  // Open entrance/exit in tree borders
  setTile(7, 0, T.PATH);
  setTile(7, 24, T.PATH);

  // Tall grass patches
  fillRect(2, 2, 3, 3, T.TALL_GRASS);
  fillRect(10, 2, 3, 3, T.TALL_GRASS);
  fillRect(2, 12, 3, 3, T.TALL_GRASS);
  fillRect(10, 10, 3, 3, T.TALL_GRASS);
  fillRect(2, 20, 3, 3, T.TALL_GRASS);

  return {
    id: 'route23',
    name: 'ROUTE 23',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North exit → Victory Road
      { x: 7, y: 0, targetMap: 'victory_road', targetX: 9, targetY: 19 },
      // South entrance → Route 22
      { x: 7, y: 24, targetMap: 'route22', targetX: 1, targetY: 4 },
    ],
    npcs: [
      {
        id: 'badge_check1',
        x: 7, y: 20,
        spriteColor: 0x4040c0,
        direction: Direction.UP,
        dialogue: [
          'GUARD: ROUTE 23 is\nthe road to VICTORY!',
          'Show me your BADGES!',
          '...Very well, you may\npass!',
        ],
      },
      {
        id: 'badge_check2',
        x: 7, y: 13,
        spriteColor: 0x4040c0,
        direction: Direction.UP,
        dialogue: [
          'GUARD: You need all\neight BADGES to pass!',
          '...You have them all!\nGo on ahead!',
        ],
      },
      {
        id: 'badge_check3',
        x: 7, y: 5,
        spriteColor: 0x4040c0,
        direction: Direction.DOWN,
        dialogue: [
          'GUARD: VICTORY ROAD\nis just ahead!',
          'Only the strongest\ntrainers make it!',
          'Good luck!',
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 21, minLevel: 26, maxLevel: 28, weight: 20 },   // Spearow
        { speciesId: 22, minLevel: 38, maxLevel: 42, weight: 15 },   // Fearow
        { speciesId: 33, minLevel: 36, maxLevel: 40, weight: 15 },   // Nidorino
        { speciesId: 30, minLevel: 36, maxLevel: 40, weight: 15 },   // Nidorina
        { speciesId: 28, minLevel: 38, maxLevel: 42, weight: 15 },   // Sandslash
        { speciesId: 132, minLevel: 35, maxLevel: 40, weight: 20 },  // Ditto
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 11. VICTORY ROAD  (20x20 cave)
// ─────────────────────────────────────────────────────────────
export const VICTORY_ROAD: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Cave wall borders (2 tiles thick)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.CAVE_WALL);
    setTile(x, 1, T.CAVE_WALL);
    setTile(x, H - 1, T.CAVE_WALL);
    setTile(x, H - 2, T.CAVE_WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.CAVE_WALL);
    setTile(1, y, T.CAVE_WALL);
    setTile(W - 1, y, T.CAVE_WALL);
    setTile(W - 2, y, T.CAVE_WALL);
  }

  // Open entrance/exit tiles
  setTile(9, 18, T.CAVE_FLOOR);
  setTile(9, 19, T.CAVE_FLOOR);
  setTile(9, 0, T.CAVE_FLOOR);
  setTile(9, 1, T.CAVE_FLOOR);

  // Complex winding corridors (the final dungeon!)
  // Horizontal walls creating maze
  fillRect(4, 4, 5, 2, T.CAVE_WALL);
  fillRect(12, 3, 4, 2, T.CAVE_WALL);
  fillRect(3, 8, 3, 2, T.CAVE_WALL);
  fillRect(8, 7, 2, 3, T.CAVE_WALL);
  fillRect(13, 8, 4, 2, T.CAVE_WALL);
  fillRect(5, 12, 4, 2, T.CAVE_WALL);
  fillRect(12, 12, 3, 2, T.CAVE_WALL);
  fillRect(3, 15, 3, 2, T.CAVE_WALL);
  fillRect(14, 15, 3, 2, T.CAVE_WALL);

  // Strength puzzle: boulders in corridors
  setTile(6, 7, T.BOULDER);
  setTile(11, 10, T.BOULDER);
  setTile(7, 15, T.BOULDER);
  setTile(10, 14, T.BOULDER);

  return {
    id: 'victory_road',
    name: 'VICTORY ROAD',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South entrance → Route 23
      { x: 9, y: 19, targetMap: 'route23', targetX: 7, targetY: 1 },
      // North exit → Indigo Plateau
      { x: 9, y: 0, targetMap: 'indigo_plateau', targetX: 10, targetY: 19 },
    ],
    npcs: [
      {
        id: 'vr_rare_candy',
        x: 12, y: 5,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'rare_candy',
      },
      {
        id: 'vr_full_heal',
        x: 7, y: 11,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'full_heal',
      },
      {
        id: 'vr_trainer1',
        x: 4, y: 6,
        spriteColor: 0xc06060,
        direction: Direction.RIGHT,
        dialogue: [
          'COOLTRAINER: Welcome\nto VICTORY ROAD!',
          'Only the best make\nit through here!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'vr_trainer2',
        x: 15, y: 6,
        spriteColor: 0x6060c0,
        direction: Direction.LEFT,
        dialogue: [
          'COOLTRAINER: My\nPOKeMON are trained',
          'to perfection!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'vr_trainer3',
        x: 5, y: 14,
        spriteColor: 0xc0c060,
        direction: Direction.RIGHT,
        dialogue: [
          "BLACKBELT: You can't\nget past me!",
          'My fighting POKeMON\nwill stop you!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'vr_trainer4',
        x: 14, y: 11,
        spriteColor: 0x60c060,
        direction: Direction.DOWN,
        dialogue: [
          "COOLTRAINER: You've\nmade it this far?",
          'Impressive! But this\nis where it ends!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'moltres_victory_road',
        x: 17, y: 4,
        spriteColor: 0xf08830,
        direction: Direction.DOWN,
        dialogue: [
          'A legendary bird\nPOKeMON is here!',
          "It's radiating\nintense heat!",
          "It's MOLTRES!",
        ],
        isTrainer: false,
      },
    ],
    wildEncounters: {
      grassRate: 0.08,
      encounters: [
        { speciesId: 67, minLevel: 36, maxLevel: 42, weight: 20 },  // Machoke
        { speciesId: 75, minLevel: 36, maxLevel: 42, weight: 20 },  // Graveler
        { speciesId: 95, minLevel: 36, maxLevel: 42, weight: 15 },  // Onix
        { speciesId: 42, minLevel: 36, maxLevel: 42, weight: 15 },  // Golbat
        { speciesId: 105, minLevel: 38, maxLevel: 42, weight: 15 }, // Marowak
        { speciesId: 74, minLevel: 36, maxLevel: 40, weight: 15 },  // Geodude
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 12. INDIGO PLATEAU  (15x15)
// ─────────────────────────────────────────────────────────────
export const INDIGO_PLATEAU: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Tree perimeter — sealed mountain plateau with a single south opening
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, H - 1, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(W - 1, y, T.TREE); }

  // Champion Hall (north-center) — wide and grand
  fillRect(8, 1, 5, 1, T.ROOF);
  fillRect(8, 2, 5, 2, T.BUILDING);
  setTile(10, 3, T.DOOR);

  // Indigo League Lobby (combined PC + Mart) on the west
  fillRect(2, 6, 5, 1, T.ROOF);
  fillRect(2, 7, 5, 2, T.BUILDING);
  setTile(4, 8, T.DOOR);

  // Cobblestone vertical spine — Champion Hall down to the south entrance
  for (let y = 4; y <= H - 1; y++) setTile(10, y, T.COBBLESTONE);
  // Horizontal branch from lobby door east to spine
  for (let x = 4; x <= 10; x++) setTile(x, 9, T.COBBLESTONE);

  // Central fountain plaza
  fillRect(8, 10, 5, 3, T.COBBLESTONE);
  setTile(10, 11, T.FOUNTAIN);

  // Decorative flower beds in the open lawn
  fillRect(2, 2, 3, 2, T.FLOWER);
  fillRect(15, 2, 3, 2, T.FLOWER);
  fillRect(15, 7, 3, 2, T.FLOWER);
  fillRect(2, 12, 3, 2, T.FLOWER);
  fillRect(15, 12, 3, 2, T.FLOWER);
  setTile(7, 14, T.FLOWER);
  setTile(8, 15, T.FLOWER);
  setTile(12, 15, T.FLOWER);
  setTile(13, 14, T.FLOWER);

  // Signs
  setTile(11, 4, T.SIGN);  // Champion Hall sign
  setTile(6, 9, T.SIGN);   // Lobby sign on grass beside cobblestone

  return {
    id: 'indigo_plateau',
    name: 'INDIGO PLATEAU',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South entrance ↔ Victory Road
      { x: 10, y: H - 1, targetMap: 'victory_road', targetX: 9, targetY: 1 },
      // Indigo League Lobby door
      { x: 4, y: 8, targetMap: 'indigo_league_lobby', targetX: 7, targetY: 9 },
      // Champion Hall door — leads directly into Lorelei's chamber (gauntlet entry)
      { x: 10, y: 3, targetMap: 'elite_four_lorelei', targetX: 5, targetY: 9 },
    ],
    npcs: [
      // Press photographer near the fountain
      {
        id: 'indigo_photographer',
        x: 13, y: 11,
        spriteColor: 0xb04060,
        direction: Direction.LEFT,
        dialogue: [
          'Smile for the press!',
          'Future CHAMPIONS make\nthe best photos!',
        ],
      },
      // Reporter doing field coverage
      {
        id: 'indigo_reporter',
        x: 6, y: 11,
        spriteColor: 0x4060c0,
        direction: Direction.RIGHT,
        dialogue: [
          'This is INDIGO PLATEAU—',
          'where champions are\ncrowned!',
          "I'm here to cover\nthe ELITE FOUR matches.",
        ],
      },
      // Fan-club kid awestruck
      {
        id: 'indigo_fan',
        x: 14, y: 16,
        spriteColor: 0xf0d040,
        direction: Direction.LEFT,
        dialogue: [
          'I came all the way\nfrom PALLET TOWN',
          'to see this!',
          'Do you think the\nrival is here yet?',
        ],
      },
      // Veteran trainer reminiscing
      {
        id: 'indigo_retiree',
        x: 16, y: 9,
        spriteColor: 0xc0c0c0,
        direction: Direction.LEFT,
        dialogue: [
          "I've watched every\nCHAMPION crowned",
          'on this plateau!',
          'The hall of fame\nremembers them all.',
        ],
      },
      // Existing trio — repositioned around the new plaza
      {
        id: 'indigo_npc1',
        x: 6, y: 5,
        spriteColor: 0xf0a060,
        direction: Direction.RIGHT,
        dialogue: [
          'INDIGO PLATEAU',
          'POKeMON LEAGUE\nHeadquarters!',
          "Only the best\ntrainers gather here!",
        ],
      },
      {
        id: 'indigo_npc2',
        x: 14, y: 5,
        spriteColor: 0x80c080,
        direction: Direction.LEFT,
        dialogue: [
          'The ELITE FOUR are\nthe strongest trainers',
          'in the whole region!',
          'Are you ready to\nface them?',
        ],
      },
      {
        id: 'indigo_npc3',
        x: 6, y: 16,
        spriteColor: 0xc08060,
        direction: Direction.UP,
        dialogue: [
          "I've been to the\nELITE FOUR...",
          'LORELEI uses ICE\ntypes, BRUNO uses',
          'FIGHTING types, AGATHA\nuses GHOST types,',
          'and LANCE uses\nDRAGON types!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 13. INDIGO LEAGUE LOBBY (combined PC + Mart, 14x10 indoor)
// ─────────────────────────────────────────────────────────────
export const INDIGO_LEAGUE_LOBBY: MapData = (() => {
  const W = 14, H = 10;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls: top 2 rows + side columns (no bottom wall — doormat is the edge warp)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Healing wing (left half) — nurse counter U-shape with PC tucked at the corner
  setTile(1, 2, T.PC);
  setTile(2, 2, T.COUNTER);
  setTile(3, 2, T.COUNTER);
  setTile(4, 2, T.COUNTER);
  setTile(5, 2, T.COUNTER);
  setTile(2, 3, T.COUNTER);
  setTile(5, 3, T.COUNTER);

  // Mart wing (right half) — counter with shelves behind
  setTile(8, 2, T.COUNTER);
  setTile(9, 2, T.COUNTER);
  setTile(10, 2, T.COUNTER);
  setTile(8, 3, T.COUNTER);
  setTile(10, 3, T.COUNTER);
  setTile(11, 2, T.MART_SHELF);
  setTile(12, 2, T.MART_SHELF);
  setTile(11, 3, T.MART_SHELF);
  setTile(12, 3, T.MART_SHELF);

  // Decorative fountains flanking the central aisle
  setTile(5, 5, T.FOUNTAIN);
  setTile(8, 5, T.FOUNTAIN);

  // Central carpet aisle from doormat to back of hall
  for (let y = 4; y <= 8; y++) {
    setTile(6, y, T.CARPET);
    setTile(7, y, T.CARPET);
  }

  // Doormat on bottom row — edge warp back to plateau
  setTile(6, H - 1, T.DOORMAT);
  setTile(7, H - 1, T.DOORMAT);

  return {
    id: 'indigo_league_lobby',
    name: 'INDIGO LEAGUE LOBBY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 6, y: H - 1, targetMap: 'indigo_plateau', targetX: 4, targetY: 9 },
      { x: 7, y: H - 1, targetMap: 'indigo_plateau', targetX: 4, targetY: 9 },
    ],
    npcs: [
      {
        id: 'nurse_indigo',
        x: 3, y: 2,
        spriteColor: 0xf080a0,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome to the\nINDIGO LEAGUE LOBBY!',
          'We restore your\nPOKeMON to peak form',
          'before you face the\nELITE FOUR!',
          'Your POKeMON have been\nfully restored!',
        ],
      },
      {
        id: 'mart_clerk',
        x: 9, y: 2,
        spriteColor: 0x4080f0,
        direction: Direction.DOWN,
        dialogue: ['Stock up before the\nELITE FOUR!'],
        shopStock: ['ultra_ball', 'hyper_potion', 'max_potion', 'full_restore', 'revive', 'full_heal'],
      },
      {
        id: 'league_receptionist',
        x: 5, y: 7,
        spriteColor: 0xa050c0,
        direction: Direction.RIGHT,
        dialogue: [
          'Welcome to the\nINDIGO LEAGUE!',
          'Heal up and stock up—',
          'once you enter\nCHAMPION HALL,',
          'there is no turning\nback until you face',
          'the CHAMPION!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 14. ELITE FOUR — LORELEI (Ice Chamber, 12x10)
// ─────────────────────────────────────────────────────────────
export const ELITE_FOUR_LORELEI: MapData = (() => {
  const W = 12, H = 10;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Wall perimeter — top 2 rows, side columns, bottom row
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // North exit — warps to Bruno (guarded until Lorelei defeated)
  setTile(5, 1, T.DOOR);
  // South arrival — decorative DOOR tile, no warp source (strict gauntlet)
  setTile(5, H - 1, T.DOOR);

  // Frozen ice corners
  fillRect(1, 2, 2, 2, T.WATER);
  fillRect(W - 3, 2, 2, 2, T.WATER);
  fillRect(1, H - 3, 2, 1, T.WATER);
  fillRect(W - 3, H - 3, 2, 1, T.WATER);

  // Lorelei's icy dais (left side)
  fillRect(2, 4, 3, 3, T.CARPET);

  return {
    id: 'elite_four_lorelei',
    name: 'LORELEI ROOM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 5, y: 1, targetMap: 'elite_four_bruno', targetX: 5, targetY: H - 1 },
    ],
    npcs: [
      {
        id: 'lorelei',
        x: 3, y: 5,
        spriteColor: 0xa0c0e0,
        direction: Direction.RIGHT,
        dialogue: ELITE_FOUR[0].dialogue.before,
        isTrainer: true,
        sightRange: 6,
      },
      {
        id: 'league_guard_lorelei',
        x: 5, y: 1,
        spriteColor: 0x606060,
        direction: Direction.DOWN,
        dialogue: [
          'You must defeat\nLORELEI before you',
          'may face the next\nELITE FOUR member!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 15. ELITE FOUR — BRUNO (Fighting Dojo, 12x10)
// ─────────────────────────────────────────────────────────────
export const ELITE_FOUR_BRUNO: MapData = (() => {
  const W = 12, H = 10;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(5, 1, T.DOOR);
  setTile(5, H - 1, T.DOOR);

  // Stone arena floor — cobblestone strip down the center
  fillRect(4, 2, 4, H - 3, T.COBBLESTONE);

  // Boulder props in the corners (decorative — geometry prevents pushing)
  setTile(1, 2, T.BOULDER);
  setTile(W - 2, 2, T.BOULDER);
  setTile(1, H - 2, T.BOULDER);
  setTile(W - 2, H - 2, T.BOULDER);

  // Training-rail FENCE accents along the side walls
  setTile(1, 4, T.FENCE);
  setTile(1, 6, T.FENCE);
  setTile(W - 2, 4, T.FENCE);
  setTile(W - 2, 6, T.FENCE);

  // Bruno's training mat (right-side dais)
  fillRect(W - 5, 4, 3, 3, T.CARPET);

  return {
    id: 'elite_four_bruno',
    name: 'BRUNO ROOM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 5, y: 1, targetMap: 'elite_four_agatha', targetX: 5, targetY: H - 1 },
    ],
    npcs: [
      {
        id: 'bruno',
        x: W - 4, y: 5,
        spriteColor: 0x804030,
        direction: Direction.LEFT,
        dialogue: ELITE_FOUR[1].dialogue.before,
        isTrainer: true,
        sightRange: 6,
      },
      {
        id: 'league_guard_bruno',
        x: 5, y: 1,
        spriteColor: 0x606060,
        direction: Direction.DOWN,
        dialogue: [
          'You must defeat\nBRUNO before you',
          'may proceed deeper\ninto the LEAGUE!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 16. ELITE FOUR — AGATHA (Ghost Crypt, 12x10)
// ─────────────────────────────────────────────────────────────
export const ELITE_FOUR_AGATHA: MapData = (() => {
  const W = 12, H = 10;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Crypt walls — CAVE_WALL perimeter
  for (let x = 0; x < W; x++) { setTile(x, 0, T.CAVE_WALL); setTile(x, 1, T.CAVE_WALL); setTile(x, H - 1, T.CAVE_WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.CAVE_WALL); setTile(W - 1, y, T.CAVE_WALL); }
  setTile(5, 1, T.DOOR);
  setTile(5, H - 1, T.DOOR);

  // Stone columns lining the chamber
  setTile(2, 3, T.CAVE_WALL);
  setTile(W - 3, 3, T.CAVE_WALL);
  setTile(2, H - 3, T.CAVE_WALL);
  setTile(W - 3, H - 3, T.CAVE_WALL);

  // Tombstone markers
  setTile(1, 5, T.TOMBSTONE);
  setTile(W - 2, 5, T.TOMBSTONE);
  setTile(3, 7, T.TOMBSTONE);
  setTile(W - 4, 7, T.TOMBSTONE);

  // Agatha's altar dais (left side)
  fillRect(2, 4, 3, 3, T.CARPET);

  return {
    id: 'elite_four_agatha',
    name: 'AGATHA ROOM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 5, y: 1, targetMap: 'elite_four_lance', targetX: 5, targetY: H - 1 },
    ],
    npcs: [
      {
        id: 'agatha',
        x: 3, y: 5,
        spriteColor: 0x8040a0,
        direction: Direction.RIGHT,
        dialogue: ELITE_FOUR[2].dialogue.before,
        isTrainer: true,
        sightRange: 6,
      },
      {
        id: 'league_guard_agatha',
        x: 5, y: 1,
        spriteColor: 0x606060,
        direction: Direction.DOWN,
        dialogue: [
          'You must defeat\nAGATHA before you',
          'may face LANCE,\nthe DRAGON master!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 17. ELITE FOUR — LANCE (Dragon's Keep, 12x10)
// ─────────────────────────────────────────────────────────────
export const ELITE_FOUR_LANCE: MapData = (() => {
  const W = 12, H = 10;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(5, 1, T.DOOR);
  setTile(5, H - 1, T.DOOR);

  // Dragon-pit moats along the side walls
  setTile(1, 3, T.WATER); setTile(1, 4, T.WATER); setTile(1, 5, T.WATER);
  setTile(1, 6, T.WATER); setTile(1, 7, T.WATER);
  setTile(W - 2, 3, T.WATER); setTile(W - 2, 4, T.WATER); setTile(W - 2, 5, T.WATER);
  setTile(W - 2, 6, T.WATER); setTile(W - 2, 7, T.WATER);

  // Arched gateway columns at the entrance
  setTile(4, H - 2, T.ROOF);
  setTile(W - 5, H - 2, T.ROOF);

  // Fountains flanking Lance's dais
  setTile(W - 6, 3, T.FOUNTAIN);
  setTile(W - 6, H - 4, T.FOUNTAIN);

  // Lance's dais (right side)
  fillRect(W - 5, 4, 3, 3, T.CARPET);

  return {
    id: 'elite_four_lance',
    name: 'LANCE ROOM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 5, y: 1, targetMap: 'elite_four_champion', targetX: 7, targetY: 11 },
    ],
    npcs: [
      {
        id: 'lance',
        x: W - 4, y: 5,
        spriteColor: 0xc04040,
        direction: Direction.LEFT,
        dialogue: ELITE_FOUR[3].dialogue.before,
        isTrainer: true,
        sightRange: 6,
      },
      {
        id: 'league_guard_lance',
        x: 5, y: 1,
        spriteColor: 0x606060,
        direction: Direction.DOWN,
        dialogue: [
          'Beyond this door\nawaits the CHAMPION!',
          'Defeat LANCE first\nto claim your shot!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 18. CHAMPION'S CHAMBER (14x12 throne room)
// ─────────────────────────────────────────────────────────────
export const ELITE_FOUR_CHAMPION: MapData = (() => {
  const W = 14, H = 12;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // South arrival door (no warp — once you're here, only the Champion lets you out)
  setTile(7, H - 1, T.DOOR);

  // Carpet runner up the center of the hall
  for (let y = 3; y <= H - 2; y++) {
    setTile(6, y, T.CARPET);
    setTile(7, y, T.CARPET);
  }

  // Stepped throne dais — wider at the back
  fillRect(5, 2, 5, 1, T.CARPET);
  fillRect(4, 3, 7, 2, T.CARPET);

  // Decorative fountains flanking the throne
  setTile(2, 3, T.FOUNTAIN);
  setTile(W - 3, 3, T.FOUNTAIN);

  // Velvet rope barriers along the runner
  setTile(5, 6, T.FENCE);
  setTile(5, 8, T.FENCE);
  setTile(W - 6, 6, T.FENCE);
  setTile(W - 6, 8, T.FENCE);

  return {
    id: 'elite_four_champion',
    name: 'CHAMPION CHAMBER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [],
    npcs: [
      {
        id: 'champion_rival',
        x: 7, y: 3,
        spriteColor: 0x4080c0,
        direction: Direction.DOWN,
        dialogue: CHAMPION.dialogue.before,
        isTrainer: true,
        sightRange: 6,
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 19. CERULEAN CAVE  (20x20 cave, post-game)
// ─────────────────────────────────────────────────────────────
export const CERULEAN_CAVE: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Cave wall borders (2 tiles thick)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.CAVE_WALL);
    setTile(x, 1, T.CAVE_WALL);
    setTile(x, H - 1, T.CAVE_WALL);
    setTile(x, H - 2, T.CAVE_WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.CAVE_WALL);
    setTile(1, y, T.CAVE_WALL);
    setTile(W - 1, y, T.CAVE_WALL);
    setTile(W - 2, y, T.CAVE_WALL);
  }

  // Open entrance
  setTile(9, 18, T.CAVE_FLOOR);
  setTile(9, 19, T.CAVE_FLOOR);

  // Center lake
  fillRect(8, 8, 5, 5, T.WATER);

  // Underground rivers
  fillRect(3, 4, 3, 2, T.WATER);
  fillRect(15, 14, 2, 3, T.WATER);

  // Complex layout: cave wall obstacles with winding corridors and dead ends
  fillRect(5, 3, 2, 3, T.CAVE_WALL);
  fillRect(10, 3, 3, 2, T.CAVE_WALL);
  fillRect(15, 4, 2, 2, T.CAVE_WALL);
  fillRect(3, 8, 3, 2, T.CAVE_WALL);
  fillRect(14, 7, 2, 3, T.CAVE_WALL);
  fillRect(4, 13, 3, 2, T.CAVE_WALL);
  fillRect(13, 13, 2, 2, T.CAVE_WALL);
  fillRect(8, 15, 2, 2, T.CAVE_WALL);
  fillRect(3, 16, 2, 2, T.CAVE_WALL);

  // Dead-end corridor walls
  fillRect(16, 10, 1, 3, T.CAVE_WALL);
  fillRect(7, 6, 1, 2, T.CAVE_WALL);

  return {
    id: 'cerulean_cave',
    name: 'CERULEAN CAVE',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Entrance → Cerulean City (northwest)
      { x: 9, y: 19, targetMap: 'cerulean_city', targetX: 2, targetY: 5 },
    ],
    npcs: [
      {
        id: 'mewtwo',
        x: 10, y: 3,
        spriteColor: 0xc0b0d0,
        direction: Direction.DOWN,
        dialogue: [
          'A strange POKeMON\nis standing here!',
          "It's incredibly\npowerful!",
          "It's MEWTWO!",
        ],
        isTrainer: false,
      },
      {
        id: 'cave_trainer1',
        x: 5, y: 10,
        spriteColor: 0xc06060,
        direction: Direction.RIGHT,
        dialogue: [
          "COOLTRAINER: You've\nmade it deep into",
          'CERULEAN CAVE!',
          "But can you handle\nwhat's inside?",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'cave_trainer2',
        x: 15, y: 12,
        spriteColor: 0x6060c0,
        direction: Direction.LEFT,
        dialogue: [
          'COOLTRAINER: The\nPOKeMON in this cave',
          'are incredibly\nstrong!',
          "You'd better be\nprepared!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.08,
      encounters: [
        { speciesId: 42, minLevel: 46, maxLevel: 52, weight: 15 },  // Golbat
        { speciesId: 82, minLevel: 46, maxLevel: 52, weight: 10 },  // Magneton
        { speciesId: 97, minLevel: 46, maxLevel: 52, weight: 10 },  // Hypno
        { speciesId: 64, minLevel: 46, maxLevel: 52, weight: 10 },  // Kadabra
        { speciesId: 132, minLevel: 46, maxLevel: 52, weight: 15 }, // Ditto
        { speciesId: 112, minLevel: 46, maxLevel: 52, weight: 10 }, // Rhydon
        { speciesId: 113, minLevel: 48, maxLevel: 54, weight: 5 },  // Chansey
        { speciesId: 101, minLevel: 46, maxLevel: 52, weight: 10 }, // Electrode
        { speciesId: 67, minLevel: 46, maxLevel: 52, weight: 10 },  // Machoke
      ],
    },
  };
})();

// ─── POKeMON MART (CINNABAR)  (8x8 indoor) ──────────────────────
const POKEMART_CINNABAR: MapData = (() => {
  const W = 8, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(5, 2, T.MART_SHELF); setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF); setTile(6, 4, T.MART_SHELF);

  // Entrance mat on exit warp
  setTile(3, 7, T.DOORMAT);

  return {
    id: 'pokemart_cinnabar', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'cinnabar_island', targetX: 14, targetY: 16 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['ultra_ball', 'hyper_potion', 'max_potion', 'full_heal', 'revive', 'escape_rope'],
    }],
  };
})();

// ─────────────────────────────────────────────────────────────
// Combined export
// ─────────────────────────────────────────────────────────────
export const ENDGAME_MAPS: Record<string, MapData> = {
  route19: ROUTE19,
  route20: ROUTE20,
  seafoam_b1f: SEAFOAM_B1F,
  seafoam_b2f: SEAFOAM_B2F,
  seafoam_b3f: SEAFOAM_B3F,
  cinnabar_island: CINNABAR_ISLAND,
  cinnabar_gym: CINNABAR_GYM,
  pokemon_mansion: POKEMON_MANSION,
  pokemon_center_cinnabar: POKEMON_CENTER_CINNABAR,
  pokemart_cinnabar: POKEMART_CINNABAR,
  route21: ROUTE21,
  route22: ROUTE22,
  route23: ROUTE23,
  victory_road: VICTORY_ROAD,
  indigo_plateau: INDIGO_PLATEAU,
  indigo_league_lobby: INDIGO_LEAGUE_LOBBY,
  elite_four_lorelei: ELITE_FOUR_LORELEI,
  elite_four_bruno: ELITE_FOUR_BRUNO,
  elite_four_agatha: ELITE_FOUR_AGATHA,
  elite_four_lance: ELITE_FOUR_LANCE,
  elite_four_champion: ELITE_FOUR_CHAMPION,
  cerulean_cave: CERULEAN_CAVE,
};
