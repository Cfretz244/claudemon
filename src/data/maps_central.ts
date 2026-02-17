import { MapData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';

const T = TileType;

function fill2D<V>(w: number, h: number, v: V): V[][] {
  return Array.from({ length: h }, () => Array(w).fill(v));
}

const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
  T.CUT_TREE, T.BOULDER,
]);

// ─── 1. LAVENDER TOWN ────────────────────────────────────────────────────────

export const LAVENDER_TOWN: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Tree borders (2 tiles thick)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, 1, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Main roads
  fillRect(8, 2, 4, 18, T.PATH);   // vertical
  fillRect(2, 10, 16, 2, T.PATH);   // horizontal

  // Pokemon Tower (large building)
  fillRect(12, 3, 5, 5, T.BUILDING);
  setTile(14, 8, T.DOOR);

  // Pokemon Center
  fillRect(3, 5, 5, 4, T.BUILDING);
  setTile(5, 9, T.DOOR);

  // Pokemart
  fillRect(3, 13, 5, 4, T.BUILDING);
  setTile(5, 17, T.DOOR);

  // House
  fillRect(12, 13, 5, 4, T.BUILDING);
  setTile(14, 17, T.DOOR);

  // Signs
  setTile(7, 10, T.SIGN);
  setTile(13, 9, T.SIGN);

  return {
    id: 'lavender_town',
    name: 'LAVENDER TOWN',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Route 8
      { x: 1, y: 10, targetMap: 'route8', targetX: 24, targetY: 5 },
      { x: 1, y: 11, targetMap: 'route8', targetX: 24, targetY: 5 },
      // North exit → Route 10
      { x: 9, y: 1, targetMap: 'route10', targetX: 9, targetY: 23 },
      { x: 10, y: 1, targetMap: 'route10', targetX: 9, targetY: 23 },
      // South exit → Route 12
      { x: 9, y: 19, targetMap: 'route12', targetX: 7, targetY: 1 },
      { x: 10, y: 19, targetMap: 'route12', targetX: 7, targetY: 1 },
      // Pokemon Tower door
      { x: 14, y: 8, targetMap: 'pokemon_tower', targetX: 5, targetY: 13 },
      // Pokemon Center door
      { x: 5, y: 9, targetMap: 'pokemon_center_lavender', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 5, y: 17, targetMap: 'pokemart_lavender', targetX: 3, targetY: 7 },
    ],
    npcs: [
      {
        id: 'lavender_npc1',
        x: 6, y: 11,
        spriteColor: 0x9070a0,
        direction: Direction.DOWN,
        dialogue: [
          'LAVENDER TOWN',
          'The Noble Purple\nTown...',
          "Can you hear the\ncries at night?",
        ],
      },
      {
        id: 'lavender_npc2',
        x: 13, y: 11,
        spriteColor: 0x808080,
        direction: Direction.LEFT,
        dialogue: [
          'They say ghosts\nappear in POKEMON',
          'TOWER... I can feel\nthem watching...',
        ],
      },
      {
        id: 'lavender_npc3',
        x: 11, y: 17,
        spriteColor: 0x605080,
        direction: Direction.UP,
        dialogue: [
          "I came to pay my\nrespects to my",
          'departed POKeMON...',
          'POKEMON TOWER is a\nresting place for them.',
        ],
      },
    ],
  };
})();

// ─── 2. POKEMON TOWER ────────────────────────────────────────────────────────

export const POKEMON_TOWER: MapData = (() => {
  const W = 12, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides 1 tile
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Dark/spooky carpet (purple atmosphere)
  fillRect(3, 2, 6, 1, T.CARPET);
  fillRect(1, 10, 10, 1, T.CARPET);
  fillRect(5, 12, 2, 1, T.CARPET);

  // Tombstone rows (COUNTER tiles)
  fillRect(2, 4, 3, 1, T.COUNTER);
  fillRect(7, 4, 3, 1, T.COUNTER);
  fillRect(2, 7, 3, 1, T.COUNTER);
  fillRect(7, 7, 3, 1, T.COUNTER);

  // Door at bottom
  setTile(5, 13, T.DOOR);

  return {
    id: 'pokemon_tower',
    name: 'POKEMON TOWER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 5, y: 13, targetMap: 'lavender_town', targetX: 14, targetY: 9 },
    ],
    npcs: [
      {
        id: 'tower_trainer1',
        x: 3, y: 5,
        spriteColor: 0x8060a0,
        direction: Direction.DOWN,
        dialogue: [
          'CHANNELER: Kee...\nThe spirits are',
          'restless tonight!',
          'Be gone, intruder!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'tower_trainer2',
        x: 8, y: 8,
        spriteColor: 0x8060a0,
        direction: Direction.LEFT,
        dialogue: [
          'CHANNELER: Heheheh...',
          'Give... me... your\nenergy!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'rival_tower',
        x: 5, y: 6,
        spriteColor: 0x6080c0,
        direction: Direction.DOWN,
        dialogue: [
          "{RIVAL}: {PLAYER}!\nWhat are you doing\nhere?",
          "Since you're here,\nlet's battle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'tower_rocket1',
        x: 3, y: 9,
        spriteColor: 0x383838,
        direction: Direction.UP,
        dialogue: [
          'ROCKET: You again?!\nTEAM ROCKET owns\nthis tower!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'tower_rocket2',
        x: 8, y: 10,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: [
          'ROCKET: You want to\nsave MR. FUJI?',
          "You'll have to get\nthrough me first!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'mr_fuji',
        x: 5, y: 3,
        spriteColor: 0xc0c0c0,
        direction: Direction.DOWN,
        dialogue: [
          "MR. FUJI: Thank you\nfor saving me!",
          "Those TEAM ROCKET\nruffians held me\nhostage!",
          "Please, take this\nPOKe FLUTE as thanks!",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 92, minLevel: 20, maxLevel: 24, weight: 40 },  // Gastly
        { speciesId: 104, minLevel: 20, maxLevel: 22, weight: 25 }, // Cubone
        { speciesId: 93, minLevel: 22, maxLevel: 25, weight: 20 },  // Haunter
        { speciesId: 41, minLevel: 20, maxLevel: 22, weight: 15 },  // Zubat
      ],
    },
  };
})();

// ─── 3. POKEMON CENTER (LAVENDER) ────────────────────────────────────────────

export const POKEMON_CENTER_LAVENDER: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Nurse counter — enclosed bar with side returns
  fillRect(3, 2, 4, 1, T.COUNTER);
  setTile(3, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet to door
  fillRect(4, 5, 2, 2, T.CARPET);

  return {
    id: 'pokemon_center_lavender',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'lavender_town', targetX: 5, targetY: 10 },
      { x: 5, y: 7, targetMap: 'lavender_town', targetX: 5, targetY: 10 },
    ],
    npcs: [
      {
        id: 'nurse_lavender',
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

// ─── 4. ROUTE 7 ──────────────────────────────────────────────────────────────

export const ROUTE7: MapData = (() => {
  const W = 20, H = 10;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Horizontal path
  fillRect(0, 4, 20, 2, T.PATH);

  // Tree borders: top row, bottom row
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, H - 1, T.TREE); }

  // Small guardhouse-style building in middle (aesthetic)
  fillRect(9, 2, 3, 2, T.BUILDING);

  // Tall grass patches
  fillRect(2, 2, 4, 2, T.TALL_GRASS);
  fillRect(15, 6, 4, 2, T.TALL_GRASS);

  return {
    id: 'route7',
    name: 'ROUTE 7',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Celadon City
      { x: 0, y: 4, targetMap: 'celadon_city', targetX: 28, targetY: 12 },
      { x: 0, y: 5, targetMap: 'celadon_city', targetX: 28, targetY: 13 },
      // East exit → Saffron City
      { x: 19, y: 4, targetMap: 'saffron_city', targetX: 2, targetY: 14 },
      { x: 19, y: 5, targetMap: 'saffron_city', targetX: 2, targetY: 15 },
    ],
    npcs: [],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 58, minLevel: 18, maxLevel: 22, weight: 30 },  // Growlithe
        { speciesId: 37, minLevel: 18, maxLevel: 22, weight: 30 },  // Vulpix
        { speciesId: 16, minLevel: 19, maxLevel: 22, weight: 20 },  // Pidgey
        { speciesId: 43, minLevel: 18, maxLevel: 22, weight: 20 },  // Oddish
      ],
    },
  };
})();

// ─── 5. ROUTE 8 ──────────────────────────────────────────────────────────────

export const ROUTE8: MapData = (() => {
  const W = 25, H = 10;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Horizontal path
  fillRect(0, 4, 25, 2, T.PATH);

  // Tree borders: top/bottom
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, H - 1, T.TREE); }

  // Tall grass patches
  fillRect(3, 1, 4, 3, T.TALL_GRASS);
  fillRect(10, 6, 4, 3, T.TALL_GRASS);
  fillRect(18, 1, 4, 3, T.TALL_GRASS);

  return {
    id: 'route8',
    name: 'ROUTE 8',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Saffron City
      { x: 0, y: 4, targetMap: 'saffron_city', targetX: 28, targetY: 14 },
      { x: 0, y: 5, targetMap: 'saffron_city', targetX: 28, targetY: 15 },
      // East exit → Lavender Town
      { x: 24, y: 4, targetMap: 'lavender_town', targetX: 2, targetY: 10 },
      { x: 24, y: 5, targetMap: 'lavender_town', targetX: 2, targetY: 11 },
    ],
    npcs: [
      {
        id: 'route8_trainer1',
        x: 6, y: 4,
        spriteColor: 0xc08060,
        direction: Direction.RIGHT,
        dialogue: [
          "GAMBLER: I'm feeling\nlucky today!",
          "Let's see if your\nPOKeMON can beat mine!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route8_trainer2',
        x: 14, y: 5,
        spriteColor: 0x60a0c0,
        direction: Direction.LEFT,
        dialogue: [
          'LASS: My POKeMON are\npretty and strong!',
          "Don't underestimate\nus!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route8_trainer3',
        x: 20, y: 4,
        spriteColor: 0xa0a060,
        direction: Direction.LEFT,
        dialogue: [
          'SUPER NERD: I study\nPOKeMON extensively!',
          'My research tells me\nI will win!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 16, minLevel: 18, maxLevel: 22, weight: 15 },  // Pidgey
        { speciesId: 23, minLevel: 18, maxLevel: 22, weight: 15 },  // Ekans
        { speciesId: 37, minLevel: 18, maxLevel: 22, weight: 15 },  // Vulpix
        { speciesId: 52, minLevel: 18, maxLevel: 20, weight: 15 },  // Meowth
        { speciesId: 64, minLevel: 20, maxLevel: 22, weight: 10 },  // Kadabra
        { speciesId: 93, minLevel: 20, maxLevel: 22, weight: 10 },  // Haunter
        { speciesId: 58, minLevel: 20, maxLevel: 22, weight: 20 },  // Growlithe
      ],
    },
  };
})();

// ─── 6. ROUTE 11 ─────────────────────────────────────────────────────────────

export const ROUTE11: MapData = (() => {
  const W = 25, H = 10;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Horizontal path
  fillRect(0, 4, 25, 2, T.PATH);

  // Tree borders: top/bottom
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, H - 1, T.TREE); }

  // Tall grass patches
  fillRect(4, 1, 5, 3, T.TALL_GRASS);
  fillRect(12, 6, 5, 3, T.TALL_GRASS);
  fillRect(20, 1, 4, 3, T.TALL_GRASS);

  // Diglett's Cave entrance
  fillRect(21, 2, 3, 2, T.BUILDING);
  setTile(22, 4, T.DOOR);

  return {
    id: 'route11',
    name: 'ROUTE 11',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance → Vermilion City
      { x: 0, y: 4, targetMap: 'vermilion_city', targetX: 28, targetY: 12 },
      { x: 0, y: 5, targetMap: 'vermilion_city', targetX: 28, targetY: 13 },
      // Diglett's Cave entrance
      { x: 22, y: 4, targetMap: 'digletts_cave', targetX: 6, targetY: 18 },
    ],
    npcs: [
      {
        id: 'route11_trainer1',
        x: 8, y: 4,
        spriteColor: 0xc09060,
        direction: Direction.RIGHT,
        dialogue: [
          "YOUNGSTER: I've been\ntraining here for",
          'days! No one can\nbeat me!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route11_trainer2',
        x: 16, y: 5,
        spriteColor: 0xa080c0,
        direction: Direction.LEFT,
        dialogue: [
          "GAMBLER: Wanna bet\nI'll win?",
          'I never lose a\nPOKeMON battle!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 23, minLevel: 15, maxLevel: 19, weight: 25 },  // Ekans
        { speciesId: 21, minLevel: 15, maxLevel: 17, weight: 20 },  // Spearow
        { speciesId: 96, minLevel: 15, maxLevel: 17, weight: 20 },  // Drowzee
        { speciesId: 27, minLevel: 15, maxLevel: 19, weight: 20 },  // Sandshrew
        { speciesId: 81, minLevel: 16, maxLevel: 18, weight: 15 },  // Magnemite
      ],
    },
  };
})();

// ─── 7. CELADON CITY ─────────────────────────────────────────────────────────

export const CELADON_CITY: MapData = (() => {
  const W = 30, H = 25;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Tree borders (2 tiles thick)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, 1, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Main roads
  fillRect(13, 2, 4, 23, T.PATH);  // vertical
  fillRect(2, 12, 26, 2, T.PATH);  // horizontal

  // Celadon Gym
  fillRect(3, 5, 6, 5, T.BUILDING);
  setTile(6, 10, T.DOOR);

  // Pokemon Center
  fillRect(20, 5, 5, 4, T.BUILDING);
  setTile(22, 9, T.DOOR);

  // Department Store (large)
  fillRect(20, 15, 6, 5, T.BUILDING);
  setTile(23, 20, T.DOOR);

  // Game Corner
  fillRect(10, 15, 6, 4, T.BUILDING);
  setTile(13, 19, T.DOOR);

  // Celadon Mansion
  fillRect(3, 15, 5, 4, T.BUILDING);
  setTile(5, 19, T.DOOR);

  // Flowers everywhere (it's the garden city!)
  setTile(10, 5, T.FLOWER); setTile(11, 5, T.FLOWER); setTile(12, 5, T.FLOWER);
  setTile(10, 6, T.FLOWER); setTile(11, 6, T.FLOWER);
  setTile(17, 5, T.FLOWER); setTile(18, 5, T.FLOWER); setTile(19, 5, T.FLOWER);
  setTile(17, 6, T.FLOWER); setTile(18, 6, T.FLOWER);
  setTile(5, 22, T.FLOWER); setTile(6, 22, T.FLOWER); setTile(7, 22, T.FLOWER);
  setTile(10, 22, T.FLOWER); setTile(11, 22, T.FLOWER);
  setTile(20, 22, T.FLOWER); setTile(21, 22, T.FLOWER);
  setTile(3, 12, T.FLOWER); setTile(4, 12, T.FLOWER);

  // Signs
  setTile(12, 12, T.SIGN);
  setTile(9, 10, T.SIGN);

  return {
    id: 'celadon_city',
    name: 'CELADON CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // East exit → Route 7
      { x: 29, y: 12, targetMap: 'route7', targetX: 1, targetY: 4 },
      { x: 29, y: 13, targetMap: 'route7', targetX: 1, targetY: 5 },
      // South exit → Route 16 (Cycling Road)
      { x: 14, y: 24, targetMap: 'route16', targetX: 9, targetY: 1 },
      { x: 15, y: 24, targetMap: 'route16', targetX: 10, targetY: 1 },
      // Gym door
      { x: 6, y: 10, targetMap: 'celadon_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 22, y: 9, targetMap: 'pokemon_center_celadon', targetX: 4, targetY: 7 },
      // Department Store (Pokemart)
      { x: 23, y: 20, targetMap: 'pokemart_celadon', targetX: 3, targetY: 7 },
      // Game Corner basement
      { x: 13, y: 19, targetMap: 'game_corner_basement', targetX: 5, targetY: 12 },
    ],
    npcs: [
      {
        id: 'celadon_npc1',
        x: 12, y: 13,
        spriteColor: 0x60c060,
        direction: Direction.DOWN,
        dialogue: [
          'CELADON CITY',
          'The City of Rainbow\nDreams!',
        ],
      },
      {
        id: 'celadon_npc2',
        x: 18, y: 12,
        spriteColor: 0xf0a060,
        direction: Direction.LEFT,
        dialogue: [
          "Have you been to the\nDEPARTMENT STORE?",
          "They have everything\na trainer needs!",
        ],
      },
      {
        id: 'celadon_npc3',
        x: 9, y: 20,
        spriteColor: 0xa0c0f0,
        direction: Direction.RIGHT,
        dialogue: [
          "The GAME CORNER is\nso much fun!",
          "But I keep losing\nall my coins...",
        ],
      },
      {
        id: 'celadon_npc4',
        x: 8, y: 10,
        spriteColor: 0x80c080,
        direction: Direction.DOWN,
        dialogue: [
          "ERIKA is the GYM\nLEADER here.",
          "She uses GRASS-type\nPOKeMON. Be prepared!",
        ],
      },
      {
        id: 'celadon_tea_lady',
        x: 4, y: 19,
        spriteColor: 0xc0a080,
        direction: Direction.RIGHT,
        dialogue: [
          "I work at CELADON\nMANSION.",
          "Here, have some TEA!\nIt's very refreshing!",
        ],
      },
    ],
  };
})();

// ─── 8. CELADON GYM ──────────────────────────────────────────────────────────

export const CELADON_GYM: MapData = (() => {
  const W = 10, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Decorative planters (TALL_GRASS inside - it's a grass gym!)
  fillRect(2, 4, 2, 3, T.TALL_GRASS);
  fillRect(6, 4, 2, 3, T.TALL_GRASS);

  // Additional plant decorations
  fillRect(2, 9, 2, 2, T.TALL_GRASS);
  fillRect(6, 9, 2, 2, T.TALL_GRASS);

  return {
    id: 'celadon_gym',
    name: 'CELADON GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'celadon_city', targetX: 6, targetY: 11 },
      { x: 5, y: 13, targetMap: 'celadon_city', targetX: 6, targetY: 11 },
    ],
    npcs: [
      {
        id: 'erika',
        x: 4, y: 3,
        spriteColor: 0x60c060,
        direction: Direction.DOWN,
        dialogue: [
          'ERIKA: Hello...',
          "I'm ERIKA, the GYM\nLEADER here.",
          'Let me show you the\nbeauty of GRASS types!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'celadon_gym_trainer1',
        x: 3, y: 8,
        spriteColor: 0x80c080,
        direction: Direction.RIGHT,
        dialogue: [
          "BEAUTY: The flowers\nin this GYM are",
          "lovely, just like\nmy POKeMON!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'celadon_gym_trainer2',
        x: 7, y: 11,
        spriteColor: 0x80c080,
        direction: Direction.LEFT,
        dialogue: [
          'LASS: ERIKA taught\nme everything about',
          'GRASS-type POKeMON!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── 9. POKEMON CENTER (CELADON) ─────────────────────────────────────────────

export const POKEMON_CENTER_CELADON: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Nurse counter — enclosed bar with side returns
  fillRect(3, 2, 4, 1, T.COUNTER);
  setTile(3, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet to door
  fillRect(4, 5, 2, 2, T.CARPET);

  return {
    id: 'pokemon_center_celadon',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'celadon_city', targetX: 22, targetY: 10 },
      { x: 5, y: 7, targetMap: 'celadon_city', targetX: 22, targetY: 10 },
    ],
    npcs: [
      {
        id: 'nurse_celadon',
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

// ─── 10. SAFFRON CITY ────────────────────────────────────────────────────────

export const SAFFRON_CITY: MapData = (() => {
  const W = 30, H = 28;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Tree borders (2 tiles thick)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, 1, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Main roads
  fillRect(13, 2, 4, 26, T.PATH);  // vertical
  fillRect(2, 14, 26, 2, T.PATH);  // horizontal

  // Silph Co (large building)
  fillRect(12, 4, 6, 6, T.BUILDING);
  setTile(15, 10, T.DOOR);

  // Saffron Gym
  fillRect(4, 4, 6, 5, T.BUILDING);
  setTile(7, 9, T.DOOR);

  // Fighting Dojo
  fillRect(22, 4, 6, 5, T.BUILDING);
  setTile(25, 9, T.DOOR);

  // Pokemon Center
  fillRect(4, 18, 5, 4, T.BUILDING);
  setTile(6, 22, T.DOOR);

  // Pokemart
  fillRect(22, 18, 5, 4, T.BUILDING);
  setTile(24, 22, T.DOOR);

  // Signs
  setTile(12, 14, T.SIGN);
  setTile(6, 14, T.SIGN);
  setTile(24, 14, T.SIGN);

  return {
    id: 'saffron_city',
    name: 'SAFFRON CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North exit → Route 5
      { x: 14, y: 1, targetMap: 'route5', targetX: 9, targetY: 18 },
      { x: 15, y: 1, targetMap: 'route5', targetX: 10, targetY: 18 },
      // South exit → Route 6
      { x: 14, y: 27, targetMap: 'route6', targetX: 9, targetY: 1 },
      { x: 15, y: 27, targetMap: 'route6', targetX: 10, targetY: 1 },
      // West exit → Route 7
      { x: 1, y: 14, targetMap: 'route7', targetX: 18, targetY: 4 },
      { x: 1, y: 15, targetMap: 'route7', targetX: 18, targetY: 5 },
      // East exit → Route 8
      { x: 29, y: 14, targetMap: 'route8', targetX: 1, targetY: 4 },
      { x: 29, y: 15, targetMap: 'route8', targetX: 1, targetY: 5 },
      // Gym door
      { x: 7, y: 9, targetMap: 'saffron_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 6, y: 22, targetMap: 'pokemon_center_saffron', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 24, y: 22, targetMap: 'pokemart_saffron', targetX: 3, targetY: 7 },
      // Silph Co door
      { x: 15, y: 10, targetMap: 'silph_co', targetX: 7, targetY: 14 },
    ],
    npcs: [
      {
        id: 'saffron_npc1',
        x: 12, y: 15,
        spriteColor: 0xc0a060,
        direction: Direction.DOWN,
        dialogue: [
          'SAFFRON CITY',
          'Shining, Golden Land\nof Commerce!',
        ],
      },
      {
        id: 'saffron_npc2',
        x: 18, y: 14,
        spriteColor: 0x6080c0,
        direction: Direction.LEFT,
        dialogue: [
          'TEAM ROCKET has taken\nover SILPH CO.!',
          "Someone needs to\nstop them!",
        ],
      },
      {
        id: 'saffron_npc3',
        x: 8, y: 12,
        spriteColor: 0xa0a0a0,
        direction: Direction.RIGHT,
        dialogue: [
          "SABRINA, the GYM\nLEADER, has psychic",
          'powers! Be very\ncareful in there!',
        ],
      },
      {
        id: 'saffron_npc4',
        x: 20, y: 10,
        spriteColor: 0xe08060,
        direction: Direction.DOWN,
        dialogue: [
          "The FIGHTING DOJO\nused to be a real",
          "GYM, but SABRINA\ndefeated them all!",
        ],
      },
    ],
  };
})();

// ─── 11. SAFFRON GYM ─────────────────────────────────────────────────────────

export const SAFFRON_GYM: MapData = (() => {
  const W = 10, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Warp pads (CARPET tiles representing teleporters)
  fillRect(3, 5, 1, 1, T.CARPET);
  fillRect(6, 5, 1, 1, T.CARPET);
  fillRect(2, 8, 1, 1, T.CARPET);
  fillRect(7, 8, 1, 1, T.CARPET);
  fillRect(4, 10, 1, 1, T.CARPET);
  fillRect(5, 10, 1, 1, T.CARPET);
  fillRect(3, 3, 1, 1, T.CARPET);
  fillRect(6, 3, 1, 1, T.CARPET);

  return {
    id: 'saffron_gym',
    name: 'SAFFRON GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'saffron_city', targetX: 7, targetY: 10 },
      { x: 5, y: 13, targetMap: 'saffron_city', targetX: 7, targetY: 10 },
    ],
    npcs: [
      {
        id: 'sabrina',
        x: 4, y: 3,
        spriteColor: 0xc060c0,
        direction: Direction.DOWN,
        dialogue: [
          'SABRINA: I knew you\nwould come.',
          'I can see the future.\nYou will lose!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'saffron_gym_trainer1',
        x: 2, y: 6,
        spriteColor: 0xa080c0,
        direction: Direction.RIGHT,
        dialogue: [
          'PSYCHIC: My mind is\na weapon!',
          'Can you withstand my\npsychic power?',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'saffron_gym_trainer2',
        x: 7, y: 10,
        spriteColor: 0xa080c0,
        direction: Direction.LEFT,
        dialogue: [
          "PSYCHIC: SABRINA's\npower is incredible!",
          "You don't stand a\nchance!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── 12. POKEMON CENTER (SAFFRON) ────────────────────────────────────────────

export const POKEMON_CENTER_SAFFRON: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Nurse counter — enclosed bar with side returns
  fillRect(3, 2, 4, 1, T.COUNTER);
  setTile(3, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet to door
  fillRect(4, 5, 2, 2, T.CARPET);

  return {
    id: 'pokemon_center_saffron',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'saffron_city', targetX: 6, targetY: 23 },
      { x: 5, y: 7, targetMap: 'saffron_city', targetX: 6, targetY: 23 },
    ],
    npcs: [
      {
        id: 'nurse_saffron',
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

// ─── POKeMON MART (LAVENDER)  (8x8 indoor) ───────────────────────
const POKEMART_LAVENDER: MapData = (() => {
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
  return {
    id: 'pokemart_lavender', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'lavender_town', targetX: 5, targetY: 18 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['great_ball', 'super_potion', 'revive', 'antidote', 'burn_heal', 'ice_heal', 'paralyze_heal', 'escape_rope'],
    }],
  };
})();

// ─── POKeMON MART (CELADON / DEPT STORE)  (8x8 indoor) ──────────
const POKEMART_CELADON: MapData = (() => {
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
  return {
    id: 'pokemart_celadon', name: 'CELADON DEPT STORE', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'celadon_city', targetX: 23, targetY: 21 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome to CELADON\nDEPT STORE!'],
      shopStock: ['poke_ball', 'great_ball', 'ultra_ball', 'potion', 'super_potion', 'hyper_potion', 'revive', 'full_heal', 'antidote', 'repel', 'escape_rope'],
    }],
  };
})();

// ─── POKeMON MART (SAFFRON)  (8x8 indoor) ───────────────────────
const POKEMART_SAFFRON: MapData = (() => {
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
  return {
    id: 'pokemart_saffron', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'saffron_city', targetX: 24, targetY: 23 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['great_ball', 'ultra_ball', 'super_potion', 'hyper_potion', 'revive', 'full_heal'],
    }],
  };
})();

// ─── GAME CORNER BASEMENT ───────────────────────────────────────────────────

const GAME_CORNER_BASEMENT: MapData = (() => {
  const W = 12, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Interior walls creating corridors
  fillRect(4, 4, 1, 4, T.WALL);
  fillRect(7, 2, 1, 4, T.WALL);
  fillRect(4, 10, 4, 1, T.WALL);

  // Giovanni's desk at the back
  setTile(5, 2, T.COUNTER);
  setTile(6, 2, T.COUNTER);

  return {
    id: 'game_corner_basement',
    name: 'ROCKET HIDEOUT',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 5, y: 13, targetMap: 'celadon_city', targetX: 13, targetY: 20 },
    ],
    npcs: [
      {
        id: 'game_corner_rocket1',
        x: 3, y: 6,
        spriteColor: 0x383838,
        direction: Direction.RIGHT,
        dialogue: ['ROCKET: You found\nour secret hideout!', 'No one leaves alive!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'game_corner_rocket2',
        x: 9, y: 8,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: Stop right\nthere, kid!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'giovanni_game_corner',
        x: 6, y: 3,
        spriteColor: 0x604020,
        direction: Direction.DOWN,
        dialogue: [
          'GIOVANNI: So, you\nhave found me!',
          "I am the leader of\nTEAM ROCKET!",
          "I shall not allow\nyou to disrupt our\nplans!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── SILPH CO. ──────────────────────────────────────────────────────────────

const SILPH_CO: MapData = (() => {
  const W = 15, H = 16;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Office partitions
  fillRect(5, 4, 1, 4, T.WALL);
  fillRect(9, 4, 1, 4, T.WALL);
  fillRect(3, 10, 9, 1, T.WALL);
  // Gaps in partitions
  setTile(5, 6, T.INDOOR_FLOOR);
  setTile(9, 6, T.INDOOR_FLOOR);
  setTile(7, 10, T.INDOOR_FLOOR);

  // Desks
  setTile(3, 2, T.COUNTER);
  setTile(4, 2, T.COUNTER);
  setTile(10, 2, T.COUNTER);
  setTile(11, 2, T.COUNTER);

  // President's desk (top center)
  setTile(7, 2, T.COUNTER);

  // Carpet paths
  fillRect(6, 11, 3, 4, T.CARPET);

  return {
    id: 'silph_co',
    name: 'SILPH CO.',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 7, y: 15, targetMap: 'saffron_city', targetX: 15, targetY: 11 },
    ],
    npcs: [
      {
        id: 'silph_rocket1',
        x: 3, y: 6,
        spriteColor: 0x383838,
        direction: Direction.RIGHT,
        dialogue: ['ROCKET: SILPH CO. is\nunder our control!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'silph_rocket2',
        x: 11, y: 8,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: No one gets\npast me!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'rival_silph',
        x: 7, y: 7,
        spriteColor: 0x6080c0,
        direction: Direction.DOWN,
        dialogue: [
          "{RIVAL}: {PLAYER}!\nWhat a surprise!",
          "TEAM ROCKET is all\nover SILPH CO.!",
          "But first, let's\nhave a battle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'giovanni_silph',
        x: 7, y: 3,
        spriteColor: 0x604020,
        direction: Direction.DOWN,
        dialogue: [
          "GIOVANNI: We meet\nagain, child!",
          "You have interfered\nwith TEAM ROCKET\nfor the last time!",
          "Prepare to feel my\nwrath!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'silph_president',
        x: 8, y: 2,
        spriteColor: 0xc0a060,
        direction: Direction.DOWN,
        dialogue: [
          "PRESIDENT: Thank\ngoodness you're here!",
          "TEAM ROCKET has taken\nover our company!",
          "Please, defeat their\nboss!",
        ],
      },
    ],
  };
})();

// ─── DIGLETT'S CAVE ─────────────────────────────────────────────────────────

const DIGLETTS_CAVE: MapData = (() => {
  const W = 12, H = 20;
  const tiles = fill2D(W, H, T.CAVE_WALL);
  const collision = fill2D(W, H, true);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Carve out main cave interior (leave 2-tile border)
  fillRect(2, 2, 8, 16, T.CAVE_FLOOR);

  // North entrance corridor
  fillRect(5, 0, 3, 3, T.CAVE_FLOOR);
  // South entrance corridor
  fillRect(5, 17, 3, 3, T.CAVE_FLOOR);

  // Interior obstacles — winding tunnel
  fillRect(2, 5, 3, 2, T.CAVE_WALL);
  fillRect(7, 8, 3, 2, T.CAVE_WALL);
  fillRect(2, 11, 3, 2, T.CAVE_WALL);
  fillRect(7, 14, 3, 2, T.CAVE_WALL);

  return {
    id: 'digletts_cave',
    name: "DIGLETT's CAVE",
    width: W, height: H,
    tiles, collision,
    warps: [
      // North exit → Route 2
      { x: 5, y: 0, targetMap: 'route2', targetX: 15, targetY: 25 },
      { x: 6, y: 0, targetMap: 'route2', targetX: 15, targetY: 25 },
      { x: 7, y: 0, targetMap: 'route2', targetX: 15, targetY: 25 },
      // South exit → Route 11
      { x: 5, y: 19, targetMap: 'route11', targetX: 22, targetY: 5 },
      { x: 6, y: 19, targetMap: 'route11', targetX: 22, targetY: 5 },
      { x: 7, y: 19, targetMap: 'route11', targetX: 22, targetY: 5 },
    ],
    npcs: [],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 50, minLevel: 15, maxLevel: 22, weight: 90 }, // Diglett
        { speciesId: 51, minLevel: 29, maxLevel: 31, weight: 10 }, // Dugtrio
      ],
    },
  };
})();

// ─── Combined export ─────────────────────────────────────────────────────────

export const CENTRAL_MAPS: Record<string, MapData> = {
  lavender_town: LAVENDER_TOWN,
  pokemon_tower: POKEMON_TOWER,
  pokemon_center_lavender: POKEMON_CENTER_LAVENDER,
  pokemart_lavender: POKEMART_LAVENDER,
  route7: ROUTE7,
  route8: ROUTE8,
  route11: ROUTE11,
  celadon_city: CELADON_CITY,
  celadon_gym: CELADON_GYM,
  pokemon_center_celadon: POKEMON_CENTER_CELADON,
  pokemart_celadon: POKEMART_CELADON,
  saffron_city: SAFFRON_CITY,
  saffron_gym: SAFFRON_GYM,
  pokemon_center_saffron: POKEMON_CENTER_SAFFRON,
  pokemart_saffron: POKEMART_SAFFRON,
  game_corner_basement: GAME_CORNER_BASEMENT,
  silph_co: SILPH_CO,
  digletts_cave: DIGLETTS_CAVE,
};
