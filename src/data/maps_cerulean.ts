import { MapData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';

const T = TileType;

function fill2D<V>(w: number, h: number, v: V): V[][] {
  return Array.from({ length: h }, () => Array(w).fill(v));
}

const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
]);

// ─────────────────────────────────────────────────────────────
// 1. MT MOON  (20x20 cave)
// ─────────────────────────────────────────────────────────────
export const MT_MOON: MapData = (() => {
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

  // Thick cave-wall borders (2 tiles)
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

  // Open the entrance/exit tiles so the player can stand there
  setTile(9, 0, T.CAVE_FLOOR);
  setTile(9, 1, T.CAVE_FLOOR);
  setTile(9, 18, T.CAVE_FLOOR);
  setTile(9, 19, T.CAVE_FLOOR);

  // Interior cave-wall obstacles creating winding corridors
  fillRect(4, 4, 3, 2, T.CAVE_WALL);
  fillRect(10, 3, 4, 2, T.CAVE_WALL);
  fillRect(6, 8, 2, 4, T.CAVE_WALL);
  fillRect(12, 7, 3, 2, T.CAVE_WALL);
  fillRect(3, 13, 4, 2, T.CAVE_WALL);
  fillRect(11, 12, 2, 3, T.CAVE_WALL);
  fillRect(15, 14, 2, 2, T.CAVE_WALL);

  // Small underground pools
  fillRect(3, 7, 2, 2, T.WATER);
  fillRect(14, 10, 2, 2, T.WATER);
  setTile(8, 15, T.WATER);

  return {
    id: 'mt_moon',
    name: 'MT. MOON',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North exit → Route 4
      { x: 9, y: 0, targetMap: 'route4', targetX: 2, targetY: 5 },
      // South entrance → Route 3 east end
      { x: 9, y: 19, targetMap: 'route3', targetX: 29, targetY: 5 },
    ],
    npcs: [
      {
        id: 'mt_moon_trainer1',
        x: 5, y: 6,
        spriteColor: 0xc06060,
        direction: Direction.RIGHT,
        dialogue: [
          'SUPER NERD: I came\nhere to find fossils!',
          "Don't get in my way!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'mt_moon_trainer2',
        x: 14, y: 15,
        spriteColor: 0x6060c0,
        direction: Direction.LEFT,
        dialogue: [
          'ROCKET: This cave is\nTeam ROCKET territory!',
          "Hand over your\nfossils!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'mt_moon_scientist',
        x: 9, y: 10,
        spriteColor: 0xf0f0f0,
        direction: Direction.DOWN,
        dialogue: [
          'I study rare fossils\nfound in MT. MOON.',
          'CLEFAIRY are said to\ndance here on full',
          'moon nights!',
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 41, minLevel: 7, maxLevel: 11, weight: 40 },  // Zubat
        { speciesId: 74, minLevel: 8, maxLevel: 11, weight: 25 },  // Geodude
        { speciesId: 46, minLevel: 8, maxLevel: 10, weight: 15 },  // Paras
        { speciesId: 35, minLevel: 8, maxLevel: 12, weight: 15 },  // Clefairy
        { speciesId: 104, minLevel: 8, maxLevel: 10, weight: 5 },  // Cubone
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 2. ROUTE 4  (25x12 horizontal)
// ─────────────────────────────────────────────────────────────
export const ROUTE4: MapData = (() => {
  const W = 25, H = 12;
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

  // Tree borders top/bottom (2 tiles thick)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, 1, T.TREE);
    setTile(x, H - 1, T.TREE);
    setTile(x, H - 2, T.TREE);
  }

  // East-west path
  fillRect(0, 5, W, 2, T.PATH);

  // Open west entrance for Mt Moon warp
  setTile(0, 5, T.PATH);

  // Tall grass patches
  fillRect(5, 2, 4, 3, T.TALL_GRASS);
  fillRect(14, 2, 5, 3, T.TALL_GRASS);
  fillRect(8, 7, 4, 3, T.TALL_GRASS);
  fillRect(18, 7, 4, 3, T.TALL_GRASS);

  // Scattered trees
  setTile(11, 3, T.TREE);
  setTile(20, 3, T.TREE);
  setTile(4, 8, T.TREE);
  setTile(14, 8, T.TREE);

  return {
    id: 'route4',
    name: 'ROUTE 4',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance from Mt Moon
      { x: 0, y: 5, targetMap: 'mt_moon', targetX: 9, targetY: 1 },
      // East exit to Cerulean City
      { x: 24, y: 5, targetMap: 'cerulean_city', targetX: 2, targetY: 12 },
      { x: 24, y: 6, targetMap: 'cerulean_city', targetX: 2, targetY: 13 },
    ],
    npcs: [
      {
        id: 'route4_trainer1',
        x: 12, y: 5,
        spriteColor: 0xd09040,
        direction: Direction.RIGHT,
        dialogue: [
          'LASS: I just came\nfrom MT. MOON!',
          "Those ZUBATs are\nso annoying!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 21, minLevel: 8, maxLevel: 12, weight: 25 },  // Spearow
        { speciesId: 23, minLevel: 6, maxLevel: 12, weight: 20 },  // Ekans
        { speciesId: 27, minLevel: 8, maxLevel: 10, weight: 20 },  // Sandshrew
        { speciesId: 56, minLevel: 8, maxLevel: 10, weight: 20 },  // Mankey
        { speciesId: 66, minLevel: 10, maxLevel: 12, weight: 15 }, // Machop
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 3. CERULEAN CITY  (25x25)
// ─────────────────────────────────────────────────────────────
export const CERULEAN_CITY: MapData = (() => {
  const W = 25, H = 25;
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

  // Tree borders (2 tiles)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, 1, T.TREE);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Main roads: vertical at x:10-13, horizontal at y:12-13
  fillRect(10, 2, 4, 23, T.PATH);
  fillRect(2, 12, 21, 2, T.PATH);

  // Cerulean Gym (left area)
  fillRect(3, 5, 6, 5, T.BUILDING);
  setTile(6, 10, T.DOOR);

  // Pokemon Center (right area)
  fillRect(16, 5, 5, 4, T.BUILDING);
  setTile(18, 9, T.DOOR);

  // Pokemart (right, lower)
  fillRect(16, 15, 5, 4, T.BUILDING);
  setTile(18, 19, T.DOOR);

  // Bike Shop (left, lower)
  fillRect(3, 15, 5, 4, T.BUILDING);
  setTile(5, 19, T.DOOR);

  // Signs near gym and center
  setTile(5, 11, T.SIGN);   // Gym sign
  setTile(17, 10, T.SIGN);  // Pokemon Center sign

  // Flowers and decoration
  setTile(9, 6, T.FLOWER);
  setTile(9, 7, T.FLOWER);
  setTile(15, 6, T.FLOWER);
  setTile(15, 7, T.FLOWER);
  setTile(9, 16, T.FLOWER);
  setTile(15, 16, T.FLOWER);

  // Water feature (pond near center of town)
  fillRect(6, 20, 3, 2, T.WATER);

  // Open gaps for exits in tree borders
  // North exit
  setTile(11, 0, T.PATH);
  setTile(12, 0, T.PATH);
  setTile(11, 1, T.PATH);
  setTile(12, 1, T.PATH);
  // West entrance
  setTile(0, 12, T.PATH);
  setTile(1, 12, T.PATH);
  setTile(0, 13, T.PATH);
  setTile(1, 13, T.PATH);
  // East exit
  setTile(W - 1, 12, T.PATH);
  setTile(W - 2, 12, T.PATH);
  setTile(W - 1, 13, T.PATH);
  setTile(W - 2, 13, T.PATH);

  return {
    id: 'cerulean_city',
    name: 'CERULEAN CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South exit → Route 5
      { x: 11, y: 24, targetMap: 'route5', targetX: 9, targetY: 1 },
      { x: 12, y: 24, targetMap: 'route5', targetX: 10, targetY: 1 },
      // North exit → Route 24
      { x: 11, y: 1, targetMap: 'route24', targetX: 5, targetY: 19 },
      { x: 12, y: 1, targetMap: 'route24', targetX: 6, targetY: 19 },
      // West entrance → Route 4
      { x: 1, y: 12, targetMap: 'route4', targetX: 23, targetY: 5 },
      { x: 1, y: 13, targetMap: 'route4', targetX: 23, targetY: 6 },
      // East exit → Route 9
      { x: 24, y: 12, targetMap: 'route9', targetX: 1, targetY: 5 },
      { x: 24, y: 13, targetMap: 'route9', targetX: 1, targetY: 6 },
      // Cerulean Gym door
      { x: 6, y: 10, targetMap: 'cerulean_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 18, y: 9, targetMap: 'pokemon_center_cerulean', targetX: 4, targetY: 7 },
      // Pokemart door (no interior defined yet, placeholder)
      { x: 18, y: 19, targetMap: 'pokemart_cerulean', targetX: 3, targetY: 7 },
      // Bike Shop door (no interior defined yet, placeholder)
      { x: 5, y: 19, targetMap: 'bike_shop', targetX: 3, targetY: 7 },
    ],
    npcs: [
      {
        id: 'cerulean_npc1',
        x: 14, y: 13,
        spriteColor: 0x60b0f0,
        direction: Direction.DOWN,
        dialogue: [
          'CERULEAN CITY',
          'A Mysterious, Blue\nAura Surrounds It!',
        ],
      },
      {
        id: 'cerulean_npc2',
        x: 8, y: 12,
        spriteColor: 0xf0a060,
        direction: Direction.RIGHT,
        dialogue: [
          "MISTY's GYM is full\nof water POKeMON!",
          'Be sure to bring a\nGRASS or ELECTRIC type!',
        ],
      },
      {
        id: 'cerulean_npc3',
        x: 15, y: 20,
        spriteColor: 0x80c080,
        direction: Direction.LEFT,
        dialogue: [
          'The NUGGET BRIDGE to\nthe north is famous!',
          'Five trainers in a row\nchallenge all comers!',
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 4. CERULEAN GYM  (10x14 indoor, water gym)
// ─────────────────────────────────────────────────────────────
export const CERULEAN_GYM: MapData = (() => {
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

  // Walls at borders: top 2 rows and sides
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Central water pool
  fillRect(3, 4, 4, 4, T.WATER);

  // PATH walkways around the pool
  fillRect(2, 3, 6, 1, T.PATH);   // top walkway
  fillRect(2, 8, 6, 1, T.PATH);   // bottom walkway
  fillRect(2, 3, 1, 6, T.PATH);   // left walkway
  fillRect(7, 3, 1, 6, T.PATH);   // right walkway

  // Approach path from door to pool
  fillRect(4, 9, 2, 5, T.PATH);

  return {
    id: 'cerulean_gym',
    name: 'CERULEAN GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'cerulean_city', targetX: 6, targetY: 11 },
      { x: 5, y: 13, targetMap: 'cerulean_city', targetX: 6, targetY: 11 },
    ],
    npcs: [
      {
        id: 'misty',
        x: 4, y: 3,
        spriteColor: 0x60a0f0,
        direction: Direction.DOWN,
        dialogue: [
          "MISTY: Hi, you're a\nnew challenger, right?",
          "I'm MISTY, the\nCERULEAN GYM LEADER!",
          'My policy is an\nall-out offensive with',
          "WATER-type POKeMON!\nLet's battle!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'cerulean_gym_trainer',
        x: 7, y: 8,
        spriteColor: 0x4090d0,
        direction: Direction.LEFT,
        dialogue: [
          "SWIMMER: The water\nis great here!",
          "You'll need more than\ncourage to beat MISTY!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 5. POKEMON CENTER (CERULEAN)  (10x8 indoor)
// ─────────────────────────────────────────────────────────────
export const POKEMON_CENTER_CERULEAN: MapData = (() => {
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

  // Nurse counter
  setTile(4, 2, T.COUNTER);
  setTile(5, 2, T.COUNTER);
  setTile(6, 2, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet to door
  setTile(4, 5, T.CARPET);
  setTile(5, 5, T.CARPET);
  setTile(4, 6, T.CARPET);
  setTile(5, 6, T.CARPET);

  return {
    id: 'pokemon_center_cerulean',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'cerulean_city', targetX: 18, targetY: 10 },
      { x: 5, y: 7, targetMap: 'cerulean_city', targetX: 18, targetY: 10 },
    ],
    npcs: [
      {
        id: 'nurse_cerulean',
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
// 6. ROUTE 24  (12x20 vertical – Nugget Bridge)
// ─────────────────────────────────────────────────────────────
export const ROUTE24: MapData = (() => {
  const W = 12, H = 20;
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

  // Tree borders left/right (2 tiles)
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Water on sides between trees and path (bridge feel)
  fillRect(2, 0, 2, H, T.WATER);
  fillRect(W - 4, 0, 2, H, T.WATER);

  // Vertical path (the bridge!) at x:5-6
  fillRect(5, 0, 2, H, T.PATH);

  // Small grass patches at north and south ends
  fillRect(4, 0, 1, 3, T.TALL_GRASS);
  fillRect(7, 0, 1, 3, T.TALL_GRASS);
  fillRect(4, 17, 1, 3, T.TALL_GRASS);
  fillRect(7, 17, 1, 3, T.TALL_GRASS);

  return {
    id: 'route24',
    name: 'ROUTE 24',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South entrance → Cerulean City
      { x: 5, y: 19, targetMap: 'cerulean_city', targetX: 11, targetY: 2 },
      { x: 6, y: 19, targetMap: 'cerulean_city', targetX: 12, targetY: 2 },
      // North exit → Route 25
      { x: 5, y: 0, targetMap: 'route25', targetX: 1, targetY: 5 },
      { x: 6, y: 0, targetMap: 'route25', targetX: 2, targetY: 5 },
    ],
    npcs: [
      // 5 Nugget Bridge trainers, spaced every 3 tiles
      {
        id: 'nugget1',
        x: 5, y: 16,
        spriteColor: 0xd09040,
        direction: Direction.UP,
        dialogue: [
          'BUG CATCHER: Welcome\nto NUGGET BRIDGE!',
          "Beat us five trainers\nand win a prize!",
        ],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'nugget2',
        x: 6, y: 13,
        spriteColor: 0x90c060,
        direction: Direction.UP,
        dialogue: [
          "LASS: You won't get\npast me easily!",
        ],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'nugget3',
        x: 5, y: 10,
        spriteColor: 0xc06060,
        direction: Direction.DOWN,
        dialogue: [
          "YOUNGSTER: I'm the\nthird challenger!",
          "Are you getting\ntired yet?",
        ],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'nugget4',
        x: 6, y: 7,
        spriteColor: 0x6060c0,
        direction: Direction.DOWN,
        dialogue: [
          "LASS: Just two more\ntrainers after me!",
        ],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'nugget5',
        x: 5, y: 4,
        spriteColor: 0xc0c060,
        direction: Direction.DOWN,
        dialogue: [
          "JR. TRAINER: I'm the\nlast one on the bridge!",
          'If you beat me you\nget the NUGGET!',
        ],
        isTrainer: true,
        sightRange: 2,
      },
      // Team Rocket member at the top
      {
        id: 'nugget_rocket',
        x: 5, y: 2,
        spriteColor: 0x404040,
        direction: Direction.DOWN,
        dialogue: [
          "ROCKET: Congratulations!\nYou beat all five!",
          'Here is your NUGGET\nprize!',
          'By the way, how would\nyou like to join',
          "TEAM ROCKET? No?\nThen I'll make you!",
        ],
        isTrainer: true,
        sightRange: 2,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 10, minLevel: 7, maxLevel: 11, weight: 15 },  // Caterpie
        { speciesId: 13, minLevel: 7, maxLevel: 11, weight: 15 },  // Weedle
        { speciesId: 16, minLevel: 8, maxLevel: 12, weight: 20 },  // Pidgey
        { speciesId: 43, minLevel: 8, maxLevel: 14, weight: 20 },  // Oddish
        { speciesId: 69, minLevel: 8, maxLevel: 14, weight: 20 },  // Bellsprout
        { speciesId: 63, minLevel: 7, maxLevel: 12, weight: 10 },  // Abra
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// 7. ROUTE 25  (25x12 horizontal)
// ─────────────────────────────────────────────────────────────
export const ROUTE25: MapData = (() => {
  const W = 25, H = 12;
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

  // Tree borders top/bottom (2 tiles)
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, 1, T.TREE);
    setTile(x, H - 1, T.TREE);
    setTile(x, H - 2, T.TREE);
  }

  // Horizontal path
  fillRect(0, 5, W, 2, T.PATH);

  // Bill's House at far east
  fillRect(20, 3, 4, 4, T.BUILDING);
  setTile(22, 7, T.DOOR);

  // Tall grass patches
  fillRect(3, 2, 4, 3, T.TALL_GRASS);
  fillRect(10, 2, 3, 3, T.TALL_GRASS);
  fillRect(5, 7, 4, 3, T.TALL_GRASS);
  fillRect(14, 7, 4, 3, T.TALL_GRASS);

  // Scattered trees
  setTile(8, 3, T.TREE);
  setTile(15, 3, T.TREE);
  setTile(11, 8, T.TREE);

  return {
    id: 'route25',
    name: 'ROUTE 25',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance → Route 24
      { x: 0, y: 5, targetMap: 'route24', targetX: 5, targetY: 1 },
      { x: 0, y: 6, targetMap: 'route24', targetX: 6, targetY: 1 },
    ],
    npcs: [
      {
        id: 'route25_trainer1',
        x: 6, y: 5,
        spriteColor: 0xc08060,
        direction: Direction.RIGHT,
        dialogue: [
          "HIKER: These trails\nare rough!",
          'My POKeMON and I love\nthe challenge!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route25_trainer2',
        x: 12, y: 6,
        spriteColor: 0x60c0c0,
        direction: Direction.LEFT,
        dialogue: [
          "YOUNGSTER: Have you\nseen BILL's house?",
          "It's at the end of\nthis path!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route25_trainer3',
        x: 17, y: 5,
        spriteColor: 0xd06090,
        direction: Direction.LEFT,
        dialogue: [
          "LASS: I wonder what\nBILL is working on...",
          "Let's battle while\nwe wait!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'bill',
        x: 22, y: 6,
        spriteColor: 0x40a040,
        direction: Direction.DOWN,
        dialogue: [
          "BILL: Hi! I'm a true\nPOKeMON FANATIC!",
          "I have a PC system\nthat stores POKeMON!",
          'Some call me a\nPOKeMANIAC because',
          "I collect rare\nPOKeMON from around",
          'the world!',
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 10, minLevel: 8, maxLevel: 12, weight: 15 },  // Caterpie
        { speciesId: 13, minLevel: 8, maxLevel: 12, weight: 15 },  // Weedle
        { speciesId: 16, minLevel: 9, maxLevel: 13, weight: 20 },  // Pidgey
        { speciesId: 43, minLevel: 9, maxLevel: 14, weight: 20 },  // Oddish
        { speciesId: 69, minLevel: 9, maxLevel: 14, weight: 20 },  // Bellsprout
        { speciesId: 63, minLevel: 8, maxLevel: 12, weight: 10 },  // Abra
      ],
    },
  };
})();

// ─────────────────────────────────────────────────────────────
// POKeMON MART (CERULEAN)  (8x8 indoor)
// ─────────────────────────────────────────────────────────────
export const POKEMART_CERULEAN: MapData = (() => {
  const W = 8, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        setTile(x + dx, y + dy, type);
  }

  // Walls
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Counter
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);

  // Shelves
  setTile(5, 2, T.MART_SHELF); setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF); setTile(6, 4, T.MART_SHELF);

  return {
    id: 'pokemart_cerulean',
    name: 'POKeMON MART',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'cerulean_city', targetX: 18, targetY: 20 },
    ],
    npcs: [
      {
        id: 'mart_clerk',
        x: 2, y: 2,
        spriteColor: 0x4080f0,
        direction: Direction.DOWN,
        dialogue: ['Welcome! How may I\nserve you?'],
        shopStock: ['poke_ball', 'great_ball', 'potion', 'super_potion', 'antidote', 'repel'],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// Combined export
// ─────────────────────────────────────────────────────────────
export const CERULEAN_MAPS: Record<string, MapData> = {
  mt_moon: MT_MOON,
  route4: ROUTE4,
  cerulean_city: CERULEAN_CITY,
  cerulean_gym: CERULEAN_GYM,
  pokemon_center_cerulean: POKEMON_CENTER_CERULEAN,
  pokemart_cerulean: POKEMART_CERULEAN,
  route24: ROUTE24,
  route25: ROUTE25,
};
