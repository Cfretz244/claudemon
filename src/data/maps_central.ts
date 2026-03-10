import { MapData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';

const T = TileType;

function fill2D<V>(w: number, h: number, v: V): V[][] {
  return Array.from({ length: h }, () => Array(w).fill(v));
}

const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
  T.CUT_TREE, T.BOULDER, T.ROOF, T.FOUNTAIN,
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
  fillRect(12, 3, 5, 1, T.ROOF); fillRect(12, 4, 5, 4, T.BUILDING);
  setTile(14, 7, T.DOOR);

  // Pokemon Center
  fillRect(3, 5, 5, 1, T.ROOF); fillRect(3, 6, 5, 3, T.BUILDING);
  setTile(5, 8, T.DOOR);

  // Pokemart
  fillRect(3, 13, 5, 1, T.ROOF); fillRect(3, 14, 5, 3, T.BUILDING);
  setTile(5, 16, T.DOOR);

  // House
  fillRect(12, 13, 5, 1, T.ROOF); fillRect(12, 14, 5, 3, T.BUILDING);
  setTile(14, 16, T.DOOR);

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
      { x: 14, y: 7, targetMap: 'pokemon_tower', targetX: 5, targetY: 13 },
      // Pokemon Center door
      { x: 5, y: 8, targetMap: 'pokemon_center_lavender', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 5, y: 16, targetMap: 'pokemart_lavender', targetX: 3, targetY: 7 },
      // House door
      { x: 14, y: 16, targetMap: 'lavender_house', targetX: 3, targetY: 7 },
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

  // Entrance mat on exit warp
  setTile(5, 13, T.DOORMAT);

  return {
    id: 'pokemon_tower',
    name: 'POKEMON TOWER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 5, y: 13, targetMap: 'lavender_town', targetX: 14, targetY: 8 },
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
      // Jessie & James - blocking the path to Mr. Fuji
      {
        id: 'jessie_tower',
        x: 5, y: 9,
        spriteColor: 0xd02070,
        direction: Direction.DOWN,
        dialogue: [
          'JESSIE & JAMES: Stop\nright there, twerp!',
          'Prepare for trouble,\nthis tower is ours!',
          'And make it double,\nwe have ghostly powers!',
          'MEOWTH: Hand over\nyour POKeMON or\nMR. FUJI gets it!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'james_tower',
        x: 6, y: 9,
        spriteColor: 0x6060d0,
        direction: Direction.DOWN,
        dialogue: [
          'JAMES: These ghosts\nare really creepy...',
          'But we must complete\nour mission for the\nboss!',
        ],
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

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT); setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_lavender',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'lavender_town', targetX: 5, targetY: 9 },
      { x: 5, y: 7, targetMap: 'lavender_town', targetX: 5, targetY: 9 },
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

  // Guardhouse building
  fillRect(9, 2, 3, 2, T.BUILDING);
  setTile(10, 3, T.DOOR);

  // Tall grass patches
  fillRect(2, 2, 4, 2, T.TALL_GRASS);
  fillRect(15, 6, 4, 2, T.TALL_GRASS);

  // Sign near underground entrance
  setTile(12, 3, T.SIGN);

  return {
    id: 'route7',
    name: 'ROUTE 7',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Celadon City
      { x: 0, y: 4, targetMap: 'celadon_city', targetX: 27, targetY: 12 },
      { x: 0, y: 5, targetMap: 'celadon_city', targetX: 27, targetY: 13 },
      // East exit → Route 7 Gate (guard checks for Tea)
      { x: 19, y: 4, targetMap: 'route7_gate', targetX: 1, targetY: 2 },
      { x: 19, y: 5, targetMap: 'route7_gate', targetX: 1, targetY: 3 },
      // Underground Path entrance
      { x: 10, y: 3, targetMap: 'underground_ew', targetX: 1, targetY: 2 },
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

  // Underground Path entrance building
  fillRect(14, 1, 3, 1, T.ROOF);
  fillRect(14, 2, 3, 1, T.BUILDING);
  setTile(14, 3, T.BUILDING); setTile(16, 3, T.BUILDING);
  setTile(15, 3, T.DOOR);
  setTile(13, 3, T.SIGN);

  return {
    id: 'route8',
    name: 'ROUTE 8',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Saffron Gate East (guard checks for Tea)
      { x: 0, y: 4, targetMap: 'saffron_gate_east', targetX: 6, targetY: 2 },
      { x: 0, y: 5, targetMap: 'saffron_gate_east', targetX: 6, targetY: 3 },
      // East exit → Lavender Town
      { x: 24, y: 4, targetMap: 'lavender_town', targetX: 2, targetY: 10 },
      { x: 24, y: 5, targetMap: 'lavender_town', targetX: 2, targetY: 11 },
      // Underground Path entrance
      { x: 15, y: 3, targetMap: 'underground_ew', targetX: 28, targetY: 2 },
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
  setTile(22, 3, T.DOOR);

  return {
    id: 'route11',
    name: 'ROUTE 11',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance → Vermilion City
      { x: 0, y: 4, targetMap: 'vermilion_city', targetX: 27, targetY: 12 },
      { x: 0, y: 5, targetMap: 'vermilion_city', targetX: 27, targetY: 13 },
      // Diglett's Cave entrance
      { x: 22, y: 3, targetMap: 'digletts_cave', targetX: 6, targetY: 18 },
      // East exit → Route 11/12 Gate
      { x: 24, y: 4, targetMap: 'route11_gate', targetX: 1, targetY: 2 },
      { x: 24, y: 5, targetMap: 'route11_gate', targetX: 1, targetY: 3 },
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
  fillRect(3, 5, 6, 1, T.ROOF); fillRect(3, 6, 6, 4, T.BUILDING);
  setTile(6, 9, T.DOOR);

  // Pokemon Center
  fillRect(20, 5, 5, 1, T.ROOF); fillRect(20, 6, 5, 3, T.BUILDING);
  setTile(22, 8, T.DOOR);

  // Department Store (large)
  fillRect(20, 15, 6, 1, T.ROOF); fillRect(20, 16, 6, 4, T.BUILDING);
  setTile(23, 19, T.DOOR);

  // Game Corner
  fillRect(10, 15, 6, 1, T.ROOF); fillRect(10, 16, 6, 3, T.BUILDING);
  setTile(13, 18, T.DOOR);

  // Celadon Mansion
  fillRect(3, 15, 5, 1, T.ROOF); fillRect(3, 16, 5, 3, T.BUILDING);
  setTile(5, 18, T.DOOR);

  // Garden fountain
  setTile(14, 8, T.FOUNTAIN); setTile(15, 8, T.FOUNTAIN);

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
      { x: 28, y: 12, targetMap: 'route7', targetX: 1, targetY: 4 },
      { x: 28, y: 13, targetMap: 'route7', targetX: 1, targetY: 5 },
      // West exit → Route 16 (Cycling Road)
      { x: 1, y: 12, targetMap: 'route16', targetX: 12, targetY: 2 },
      { x: 1, y: 13, targetMap: 'route16', targetX: 12, targetY: 3 },
      // South exit → Route 16 (Cycling Road)
      { x: 14, y: 24, targetMap: 'route16', targetX: 7, targetY: 1 },
      { x: 15, y: 24, targetMap: 'route16', targetX: 7, targetY: 2 },
      // Gym door
      { x: 6, y: 9, targetMap: 'celadon_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 22, y: 8, targetMap: 'pokemon_center_celadon', targetX: 4, targetY: 7 },
      // Department Store (Pokemart)
      { x: 23, y: 19, targetMap: 'pokemart_celadon', targetX: 3, targetY: 7 },
      // Game Corner
      { x: 13, y: 18, targetMap: 'game_corner', targetX: 7, targetY: 10 },
      // Celadon Mansion
      { x: 5, y: 18, targetMap: 'celadon_mansion', targetX: 3, targetY: 7 },
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

  // Entrance mat on exit warps
  setTile(4, 13, T.DOORMAT); setTile(5, 13, T.DOORMAT);

  return {
    id: 'celadon_gym',
    name: 'CELADON GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'celadon_city', targetX: 6, targetY: 10 },
      { x: 5, y: 13, targetMap: 'celadon_city', targetX: 6, targetY: 10 },
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

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT); setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_celadon',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'celadon_city', targetX: 22, targetY: 9 },
      { x: 5, y: 7, targetMap: 'celadon_city', targetX: 22, targetY: 9 },
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
  fillRect(12, 4, 6, 1, T.ROOF); fillRect(12, 5, 6, 5, T.BUILDING);
  setTile(15, 9, T.DOOR);

  // Saffron Gym
  fillRect(4, 4, 6, 1, T.ROOF); fillRect(4, 5, 6, 4, T.BUILDING);
  setTile(7, 8, T.DOOR);

  // Fighting Dojo
  fillRect(22, 4, 6, 1, T.ROOF); fillRect(22, 5, 6, 4, T.BUILDING);
  setTile(25, 8, T.DOOR);

  // Pokemon Center
  fillRect(4, 18, 5, 1, T.ROOF); fillRect(4, 19, 5, 3, T.BUILDING);
  setTile(6, 21, T.DOOR);

  // Pokemart
  fillRect(22, 18, 5, 1, T.ROOF); fillRect(22, 19, 5, 3, T.BUILDING);
  setTile(24, 21, T.DOOR);

  // Urban plaza cobblestone (central crossroads)
  setTile(14, 13, T.COBBLESTONE); setTile(15, 13, T.COBBLESTONE);
  setTile(14, 16, T.COBBLESTONE); setTile(15, 16, T.COBBLESTONE);
  setTile(13, 12, T.COBBLESTONE); setTile(16, 12, T.COBBLESTONE);

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
      // North exit → Saffron Gate North
      { x: 14, y: 1, targetMap: 'saffron_gate_north', targetX: 2, targetY: 6 },
      { x: 15, y: 1, targetMap: 'saffron_gate_north', targetX: 3, targetY: 6 },
      // South exit → Saffron Gate South
      { x: 14, y: 27, targetMap: 'saffron_gate_south', targetX: 2, targetY: 1 },
      { x: 15, y: 27, targetMap: 'saffron_gate_south', targetX: 3, targetY: 1 },
      // West exit → Route 7 Gate
      { x: 1, y: 14, targetMap: 'route7_gate', targetX: 6, targetY: 2 },
      { x: 1, y: 15, targetMap: 'route7_gate', targetX: 6, targetY: 3 },
      // East exit → Saffron Gate East
      { x: 29, y: 14, targetMap: 'saffron_gate_east', targetX: 1, targetY: 2 },
      { x: 29, y: 15, targetMap: 'saffron_gate_east', targetX: 1, targetY: 3 },
      // Gym door
      { x: 7, y: 8, targetMap: 'saffron_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 6, y: 21, targetMap: 'pokemon_center_saffron', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 24, y: 21, targetMap: 'pokemart_saffron', targetX: 3, targetY: 7 },
      // Silph Co door
      { x: 15, y: 9, targetMap: 'silph_co_1f', targetX: 7, targetY: 12 },
      // Fighting Dojo
      { x: 25, y: 8, targetMap: 'fighting_dojo', targetX: 4, targetY: 9 },
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

  // Entrance mat on exit warps
  setTile(4, 13, T.DOORMAT); setTile(5, 13, T.DOORMAT);

  return {
    id: 'saffron_gym',
    name: 'SAFFRON GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'saffron_city', targetX: 7, targetY: 9 },
      { x: 5, y: 13, targetMap: 'saffron_city', targetX: 7, targetY: 9 },
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

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT); setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_saffron',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'saffron_city', targetX: 6, targetY: 22 },
      { x: 5, y: 7, targetMap: 'saffron_city', targetX: 6, targetY: 22 },
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
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'pokemart_lavender', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'lavender_town', targetX: 5, targetY: 17 }],
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
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'pokemart_celadon', name: 'CELADON DEPT STORE', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'celadon_city', targetX: 23, targetY: 20 }],
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
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'pokemart_saffron', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'saffron_city', targetX: 24, targetY: 22 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['great_ball', 'ultra_ball', 'super_potion', 'hyper_potion', 'revive', 'full_heal'],
    }],
  };
})();

// ─── GAME CORNER (Ground Floor) ─────────────────────────────────────────────

const GAME_CORNER: MapData = (() => {
  const W = 14, H = 12;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Rows of slot machine counters (3 rows of 3 pairs)
  fillRect(3, 3, 2, 1, T.COUNTER);
  fillRect(6, 3, 2, 1, T.COUNTER);
  fillRect(9, 3, 2, 1, T.COUNTER);
  fillRect(3, 5, 2, 1, T.COUNTER);
  fillRect(6, 5, 2, 1, T.COUNTER);
  fillRect(9, 5, 2, 1, T.COUNTER);
  fillRect(3, 7, 2, 1, T.COUNTER);
  fillRect(6, 7, 2, 1, T.COUNTER);
  fillRect(9, 7, 2, 1, T.COUNTER);

  // Counter along back wall (prize exchange)
  fillRect(2, 2, 3, 1, T.COUNTER);

  // Poster on back wall (SIGN tile)
  setTile(11, 2, T.SIGN);

  // Carpet aisle
  fillRect(5, 9, 4, 2, T.CARPET);

  // Entrance mat on exit warp
  setTile(7, 11, T.DOORMAT);

  return {
    id: 'game_corner',
    name: 'GAME CORNER',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Exit to Celadon City
      { x: 7, y: 11, targetMap: 'celadon_city', targetX: 13, targetY: 19 },
      // Hidden stairs to B1F (behind poster, x=11 y=2 is the sign/poster)
      { x: 12, y: 2, targetMap: 'rocket_hideout_b1f', targetX: 14, targetY: 2 },
    ],
    npcs: [
      // Slot machine NPCs (players seated at machines)
      {
        id: 'slot_machine_1',
        x: 3, y: 4,
        spriteColor: 0x60a0c0,
        direction: Direction.UP,
        dialogue: ['Want to play the\nslot machines?', 'It costs $50 per\nplay!'],
      },
      {
        id: 'slot_machine_2',
        x: 6, y: 6,
        spriteColor: 0xc06060,
        direction: Direction.UP,
        dialogue: ['Want to try your\nluck?', 'It costs $50 per\nplay!'],
      },
      {
        id: 'slot_machine_3',
        x: 9, y: 8,
        spriteColor: 0x60c060,
        direction: Direction.UP,
        dialogue: ['Feeling lucky?\nGive it a spin!', 'It costs $50 per\nplay!'],
      },
      // Rocket grunt guarding the poster
      {
        id: 'game_corner_poster_rocket',
        x: 10, y: 9,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: Hey! Don\'t be\nsnooping around here!'],
        isTrainer: true,
        sightRange: 3,
      },
      // Prize exchange clerk
      {
        id: 'game_corner_clerk',
        x: 3, y: 2,
        spriteColor: 0xf0a060,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome to the GAME\nCORNER prize exchange!',
          'Sorry, we only accept\ncoins right now.',
        ],
      },
      // NPC gambler
      {
        id: 'game_corner_gambler',
        x: 9, y: 4,
        spriteColor: 0xa080c0,
        direction: Direction.UP,
        dialogue: [
          'I\'ve been playing\nall day...',
          'I just know the next\none will be a winner!',
        ],
      },
    ],
  };
})();

// ─── ROCKET HIDEOUT B1F ─────────────────────────────────────────────────────

const ROCKET_HIDEOUT_B1F: MapData = (() => {
  const W = 16, H = 16;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Bottom wall
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.WALL); }

  // Interior walls creating corridors
  fillRect(6, 4, 1, 4, T.WALL);
  fillRect(10, 2, 1, 5, T.WALL);
  fillRect(3, 9, 6, 1, T.WALL);
  fillRect(11, 9, 3, 1, T.WALL);

  // Spin tiles — B1F puzzle
  // The player enters from top-right (14,2) and needs to reach stairs at bottom-left (1,14)
  // Arrows slide you continuously; stop tiles let you regain control
  const spinTiles: Record<string, Direction> = {
    '12,3': Direction.LEFT,   // entrance area — slides left
    '8,3': Direction.DOWN,    // redirects down
    '8,7': Direction.LEFT,    // redirects left
    '3,7': Direction.DOWN,    // redirects down toward B2F stairs
    '4,5': Direction.RIGHT,   // wrong path — sends right
    '7,5': Direction.DOWN,    // sends down into wall
    '2,4': Direction.DOWN,    // corridor shortcut
    '12,6': Direction.LEFT,   // alternate path
    '9,6': Direction.DOWN,    // sends down
    '3,12': Direction.LEFT,   // near exit
    '5,12': Direction.RIGHT,  // trap — sends back right
    '11,12': Direction.LEFT,  // lower corridor
    '7,10': Direction.DOWN,   // sends toward exit area
    '12,10': Direction.LEFT,  // lower right path
  };
  for (const key of Object.keys(spinTiles)) {
    const [sx, sy] = key.split(',').map(Number);
    setTile(sx, sy, T.SPIN_TILE);
  }

  // Stop tiles — designated stopping points in the maze
  setTile(3, 3, T.STOP_TILE);    // left side landing
  setTile(8, 5, T.STOP_TILE);    // mid corridor
  setTile(3, 10, T.STOP_TILE);   // near exit path
  setTile(12, 8, T.STOP_TILE);   // right side landing
  setTile(7, 12, T.STOP_TILE);   // lower middle
  setTile(9, 10, T.STOP_TILE);   // right of wall gap
  setTile(2, 7, T.STOP_TILE);    // left corridor

  return {
    id: 'rocket_hideout_b1f',
    name: 'ROCKET HIDEOUT B1F',
    width: W, height: H,
    tiles, collision,
    spinTiles,
    warps: [
      // Stairs up to Game Corner
      { x: 14, y: 2, targetMap: 'game_corner', targetX: 12, targetY: 2 },
      // Stairs down to B2F
      { x: 1, y: 14, targetMap: 'rocket_hideout_b2f', targetX: 1, targetY: 2 },
    ],
    npcs: [
      {
        id: 'rocket_hideout_b1f_grunt1',
        x: 6, y: 5,
        spriteColor: 0x383838,
        direction: Direction.DOWN,
        dialogue: ['ROCKET: How did you\nget down here?!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'rocket_hideout_b1f_grunt2',
        x: 12, y: 11,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: You\'re not\ngetting past me!'],
        isTrainer: true,
        sightRange: 3,
      },
      // Elevator
      {
        id: 'elevator_b1f',
        x: 2, y: 14,
        spriteColor: 0x808080,
        direction: Direction.DOWN,
        dialogue: ['It\'s an elevator.'],
      },
    ],
  };
})();

// ─── ROCKET HIDEOUT B2F ─────────────────────────────────────────────────────

const ROCKET_HIDEOUT_B2F: MapData = (() => {
  const W = 16, H = 16;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.WALL); }

  // Interior walls — harder maze
  fillRect(5, 3, 1, 4, T.WALL);
  fillRect(9, 2, 1, 5, T.WALL);
  fillRect(12, 5, 1, 4, T.WALL);
  fillRect(3, 9, 4, 1, T.WALL);
  fillRect(8, 10, 1, 3, T.WALL);
  fillRect(11, 11, 3, 1, T.WALL);

  // Spin tiles — B2F harder maze
  // Player enters from top-left (1,2) and needs to reach stairs at bottom-right (14,14)
  const spinTiles: Record<string, Direction> = {
    '3,2': Direction.RIGHT,   // entrance push
    '7,2': Direction.DOWN,    // redirect down
    '7,6': Direction.RIGHT,   // redirect right
    '13,6': Direction.DOWN,   // redirect down
    '13,9': Direction.LEFT,   // redirect left
    '11,4': Direction.DOWN,   // right side path
    '3,4': Direction.DOWN,    // left side trap
    '3,7': Direction.RIGHT,   // left mid redirect
    '6,7': Direction.DOWN,    // center down
    '2,6': Direction.RIGHT,   // left corridor
    '11,9': Direction.DOWN,   // right mid path
    '6,12': Direction.RIGHT,  // bottom center path
    '7,10': Direction.RIGHT,  // mid shortcut
    '3,12': Direction.RIGHT,  // bottom left
    '13,12': Direction.DOWN,  // near exit
    '2,10': Direction.RIGHT,  // lower left push
    '4,10': Direction.DOWN,   // trap path
  };
  for (const key of Object.keys(spinTiles)) {
    const [sx, sy] = key.split(',').map(Number);
    setTile(sx, sy, T.SPIN_TILE);
  }

  // Stop tiles — B2F stopping points
  setTile(7, 4, T.STOP_TILE);    // after first redirect
  setTile(11, 6, T.STOP_TILE);   // right side
  setTile(3, 6, T.STOP_TILE);    // left side
  setTile(6, 9, T.STOP_TILE);    // center
  setTile(13, 10, T.STOP_TILE);  // right side lower
  setTile(2, 12, T.STOP_TILE);   // bottom left
  setTile(11, 12, T.STOP_TILE);  // bottom right
  setTile(7, 8, T.STOP_TILE);    // mid area

  return {
    id: 'rocket_hideout_b2f',
    name: 'ROCKET HIDEOUT B2F',
    width: W, height: H,
    tiles, collision,
    spinTiles,
    warps: [
      // Stairs up to B1F
      { x: 1, y: 2, targetMap: 'rocket_hideout_b1f', targetX: 1, targetY: 14 },
      // Stairs down to B3F
      { x: 14, y: 14, targetMap: 'rocket_hideout_b3f', targetX: 12, targetY: 2 },
    ],
    npcs: [
      {
        id: 'rocket_hideout_b2f_grunt1',
        x: 7, y: 3,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: Intruder alert!\nIntruder alert!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'rocket_hideout_b2f_grunt2',
        x: 12, y: 9,
        spriteColor: 0x383838,
        direction: Direction.DOWN,
        dialogue: ['ROCKET: You made it\nthis far? Impressive.'],
        isTrainer: true,
        sightRange: 3,
      },
      // Elevator
      {
        id: 'elevator_b2f',
        x: 2, y: 14,
        spriteColor: 0x808080,
        direction: Direction.DOWN,
        dialogue: ['It\'s an elevator.'],
      },
    ],
  };
})();

// ─── ROCKET HIDEOUT B3F ─────────────────────────────────────────────────────

const ROCKET_HIDEOUT_B3F: MapData = (() => {
  const W = 14, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.WALL); }

  // Interior walls
  fillRect(4, 5, 6, 1, T.WALL);
  fillRect(4, 9, 6, 1, T.WALL);

  return {
    id: 'rocket_hideout_b3f',
    name: 'ROCKET HIDEOUT B3F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Stairs up to B2F
      { x: 12, y: 2, targetMap: 'rocket_hideout_b2f', targetX: 14, targetY: 14 },
      // Stairs down to B4F
      { x: 1, y: 12, targetMap: 'rocket_hideout_b4f', targetX: 1, targetY: 2 },
    ],
    npcs: [
      {
        id: 'rocket_hideout_b3f_grunt1',
        x: 7, y: 3,
        spriteColor: 0x383838,
        direction: Direction.DOWN,
        dialogue: ['ROCKET: The BOSS is\njust below!', 'You\'ll never reach\nhim!'],
        isTrainer: true,
        sightRange: 3,
      },
      // Jessie & James
      {
        id: 'jessie_gamecorner',
        x: 6, y: 7,
        spriteColor: 0xd02070,
        direction: Direction.DOWN,
        dialogue: [
          'JESSIE & JAMES: You!\nWe remember you from\nMT. MOON!',
          'Prepare for trouble!',
          'And make it double!',
          "This time we won't\ngo easy on you!",
          'MEOWTH: Yeah! We\'ve\nbeen training hard!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'james_gamecorner',
        x: 7, y: 7,
        spriteColor: 0x6060d0,
        direction: Direction.DOWN,
        dialogue: [
          "JAMES: The boss's\nhideout is just ahead!",
          "You'll never get\npast us!",
        ],
      },
    ],
  };
})();

// ─── ROCKET HIDEOUT B4F ─────────────────────────────────────────────────────

const ROCKET_HIDEOUT_B4F: MapData = (() => {
  const W = 12, H = 12;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.WALL); }

  // Giovanni's office — desk
  setTile(5, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // Carpet in Giovanni's office area
  fillRect(4, 4, 4, 3, T.CARPET);

  return {
    id: 'rocket_hideout_b4f',
    name: 'ROCKET HIDEOUT B4F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Stairs up to B3F
      { x: 1, y: 2, targetMap: 'rocket_hideout_b3f', targetX: 1, targetY: 12 },
    ],
    npcs: [
      {
        id: 'rocket_hideout_b4f_grunt1',
        x: 8, y: 6,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: This is the\nBOSS\'s private floor!'],
        isTrainer: true,
        sightRange: 3,
      },
      // Giovanni
      {
        id: 'giovanni_game_corner',
        x: 6, y: 4,
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
      // Lift Key item ball
      {
        id: 'rocket_hideout_lift_key',
        x: 9, y: 9,
        spriteColor: 0xe03030,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'lift_key',
      },
      // Elevator
      {
        id: 'elevator_b4f',
        x: 2, y: 10,
        spriteColor: 0x808080,
        direction: Direction.DOWN,
        dialogue: ['It\'s an elevator.'],
      },
    ],
  };
})();

// ─── SILPH CO. ──────────────────────────────────────────────────────────────

// SILPH CO. maps moved to maps_silph.ts

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
      { x: 5, y: 0, targetMap: 'route2', targetX: 15, targetY: 24 },
      { x: 6, y: 0, targetMap: 'route2', targetX: 15, targetY: 24 },
      { x: 7, y: 0, targetMap: 'route2', targetX: 15, targetY: 24 },
      // South exit → Route 11
      { x: 5, y: 19, targetMap: 'route11', targetX: 22, targetY: 4 },
      { x: 6, y: 19, targetMap: 'route11', targetX: 22, targetY: 4 },
      { x: 7, y: 19, targetMap: 'route11', targetX: 22, targetY: 4 },
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

// ─── Lavender House (generic NPC house) ──────────────────────────────────────
export const LAVENDER_HOUSE: MapData = (() => {
  const W = 8, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(3, 4, T.CARPET); setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET); setTile(4, 5, T.CARPET);
  setTile(2, 2, T.MART_SHELF); setTile(5, 2, T.MART_SHELF);
  setTile(3, H - 1, T.DOOR);
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'lavender_house', name: 'LAVENDER HOUSE', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'lavender_town', targetX: 14, targetY: 17 }],
    npcs: [{
      id: 'lavender_house_npc', x: 4, y: 3, spriteColor: 0x9070a0, direction: Direction.DOWN,
      dialogue: ['POKeMON TOWER is the\nfinal resting place', 'for POKeMON that have\npassed on...'],
    }],
  };
})();

// ─── Celadon Mansion ─────────────────────────────────────────────────────────
export const CELADON_MANSION: MapData = (() => {
  const W = 8, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(3, 4, T.CARPET); setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET); setTile(4, 5, T.CARPET);
  setTile(2, 2, T.MART_SHELF); setTile(5, 2, T.MART_SHELF);
  setTile(3, 2, T.MART_SHELF);
  setTile(3, H - 1, T.DOOR);
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'celadon_mansion', name: 'CELADON MANSION', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'celadon_city', targetX: 5, targetY: 19 }],
    npcs: [{
      id: 'celadon_mansion_npc', x: 4, y: 3, spriteColor: 0x60a0c0, direction: Direction.DOWN,
      dialogue: ['I know all about the\nGAME CORNER!', 'There are rumors of a\nsecret hideout below!'],
    }],
  };
})();

// ─── Fighting Dojo ───────────────────────────────────────────────────────────
export const FIGHTING_DOJO: MapData = (() => {
  const W = 10, H = 10;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Carpet arena
  for (let dy = 3; dy < 8; dy++) for (let dx = 2; dx < 8; dx++) setTile(dx, dy, T.CARPET);
  // Entrance mat on exit warps
  setTile(4, H - 1, T.DOORMAT); setTile(5, H - 1, T.DOORMAT);
  return {
    id: 'fighting_dojo', name: 'FIGHTING DOJO', width: W, height: H, tiles, collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'saffron_city', targetX: 25, targetY: 9 },
      { x: 5, y: H - 1, targetMap: 'saffron_city', targetX: 25, targetY: 9 },
    ],
    npcs: [
      {
        id: 'dojo_master', x: 5, y: 2, spriteColor: 0xc08040, direction: Direction.DOWN,
        dialogue: [
          'KARATE MASTER: I am\nthe MASTER of this',
          "FIGHTING DOJO! We\nwere once a GYM...",
          'But we lost to\nSABRINA! How humbling!',
        ],
      },
      {
        id: 'dojo_trainer1', x: 3, y: 5, spriteColor: 0xc08040, direction: Direction.RIGHT,
        dialogue: ['BLACK BELT: Hwa!\nWant to see real\nfighting power?'],
        isTrainer: true, sightRange: 2,
      },
      {
        id: 'dojo_trainer2', x: 7, y: 5, spriteColor: 0xc08040, direction: Direction.LEFT,
        dialogue: ['BLACK BELT: My\nfighting POKeMON will\ncrush you!'],
        isTrainer: true, sightRange: 2,
      },
    ],
  };
})();

// ─── Route 7 Gate (horizontal pass-through) ─────────────────────────────────
export const ROUTE7_GATE: MapData = (() => {
  const W = 8, H = 6;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  // Walls: top, bottom, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Open side doorways at y=2-3
  setTile(0, 2, T.INDOOR_FLOOR); setTile(0, 3, T.INDOOR_FLOOR);
  setTile(W - 1, 2, T.INDOOR_FLOOR); setTile(W - 1, 3, T.INDOOR_FLOOR);
  // Counter
  setTile(3, 1, T.COUNTER); setTile(4, 1, T.COUNTER);
  return {
    id: 'route7_gate', name: 'ROUTE 7 GATE', width: W, height: H, tiles, collision,
    warps: [
      // Left exit → Route 7
      { x: 0, y: 2, targetMap: 'route7', targetX: 18, targetY: 4 },
      { x: 0, y: 3, targetMap: 'route7', targetX: 18, targetY: 5 },
      // Right exit → Saffron City (blocked without Tea)
      { x: 7, y: 2, targetMap: 'saffron_city', targetX: 2, targetY: 14 },
      { x: 7, y: 3, targetMap: 'saffron_city', targetX: 2, targetY: 15 },
    ],
    npcs: [{
      id: 'route7_guard', x: 4, y: 2, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', 'Thirsty work, this\nguarding business...'],
    }],
  };
})();

// ─── Route 11/12 Gate (horizontal pass-through, connects Route 11 to Route 12) ─
export const ROUTE11_GATE: MapData = (() => {
  const W = 8, H = 6;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  // Walls: top, bottom, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Open side doorways at y=2-3
  setTile(0, 2, T.INDOOR_FLOOR); setTile(0, 3, T.INDOOR_FLOOR);
  setTile(W - 1, 2, T.INDOOR_FLOOR); setTile(W - 1, 3, T.INDOOR_FLOOR);
  // Counter
  setTile(3, 1, T.COUNTER); setTile(4, 1, T.COUNTER);
  return {
    id: 'route11_gate', name: 'ROUTE 11 GATE', width: W, height: H, tiles, collision,
    warps: [
      // West exit → Route 11
      { x: 0, y: 2, targetMap: 'route11', targetX: 23, targetY: 4 },
      { x: 0, y: 3, targetMap: 'route11', targetX: 23, targetY: 5 },
      // East exit → Route 12 (corridor at Snorlax barrier row)
      { x: 7, y: 2, targetMap: 'route12', targetX: 1, targetY: 4 },
      { x: 7, y: 3, targetMap: 'route12', targetX: 1, targetY: 4 },
    ],
    npcs: [{
      id: 'route11_gate_guide', x: 4, y: 2, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['ROUTE 12 is to the\neast.', 'A sleeping POKeMON\nblocks the way north.'],
    }],
  };
})();

// ─── Saffron Gate North (vertical pass-through, Route 5 side) ────────────────
export const SAFFRON_GATE_NORTH: MapData = (() => {
  const W = 6, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  // Walls: top row, side columns
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter and guard
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER);
  return {
    id: 'saffron_gate_north', name: 'SAFFRON GATE', width: W, height: H, tiles, collision,
    warps: [
      // North exit → Route 5 (bump warp on wall)
      { x: 2, y: 0, targetMap: 'route5', targetX: 9, targetY: 18 },
      { x: 3, y: 0, targetMap: 'route5', targetX: 10, targetY: 18 },
      // South exit → Saffron City (edge warp, blocked without Tea)
      { x: 2, y: 7, targetMap: 'saffron_city', targetX: 14, targetY: 2 },
      { x: 3, y: 7, targetMap: 'saffron_city', targetX: 15, targetY: 2 },
    ],
    npcs: [{
      id: 'gate_north_guard', x: 3, y: 3, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', "I'm parched just\nstanding here..."],
    }],
  };
})();

// ─── Saffron Gate South (vertical pass-through, Route 6 side) ────────────────
export const SAFFRON_GATE_SOUTH: MapData = (() => {
  const W = 6, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  // Walls: top row, side columns
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter and guard
  setTile(3, 4, T.COUNTER); setTile(4, 4, T.COUNTER);
  return {
    id: 'saffron_gate_south', name: 'SAFFRON GATE', width: W, height: H, tiles, collision,
    warps: [
      // North exit → Saffron City (bump warp on wall, blocked without Tea)
      { x: 2, y: 0, targetMap: 'saffron_city', targetX: 14, targetY: 26 },
      { x: 3, y: 0, targetMap: 'saffron_city', targetX: 15, targetY: 26 },
      // South exit → Route 6 (edge warp)
      { x: 2, y: 7, targetMap: 'route6', targetX: 9, targetY: 1 },
      { x: 3, y: 7, targetMap: 'route6', targetX: 10, targetY: 1 },
    ],
    npcs: [{
      id: 'gate_south_guard', x: 2, y: 4, spriteColor: 0x4060b0, direction: Direction.RIGHT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', 'A nice cup of TEA\nwould hit the spot...'],
    }],
  };
})();

// ─── Saffron Gate East (horizontal pass-through, Route 8 side) ──────────────
export const SAFFRON_GATE_EAST: MapData = (() => {
  const W = 8, H = 6;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  // Walls: all borders
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter
  setTile(2, 1, T.COUNTER); setTile(3, 1, T.COUNTER);
  return {
    id: 'saffron_gate_east', name: 'SAFFRON GATE', width: W, height: H, tiles, collision,
    warps: [
      // West exit → Saffron City (bump warp, blocked without Tea)
      { x: 0, y: 2, targetMap: 'saffron_city', targetX: 28, targetY: 14 },
      { x: 0, y: 3, targetMap: 'saffron_city', targetX: 28, targetY: 15 },
      // East exit → Route 8 (bump warp)
      { x: 7, y: 2, targetMap: 'route8', targetX: 1, targetY: 4 },
      { x: 7, y: 3, targetMap: 'route8', targetX: 1, targetY: 5 },
    ],
    npcs: [{
      id: 'gate_east_guard', x: 4, y: 2, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', "Can't let anyone in\nwithout it..."],
    }],
  };
})();

// ─── Underground Path North-South (Route 5 ↔ Route 6) ──────────────────────
export const UNDERGROUND_NS: MapData = (() => {
  const W = 5, H = 30;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  // Cave walls on all borders
  for (let x = 0; x < W; x++) { setTile(x, 0, T.CAVE_WALL); setTile(x, H - 1, T.CAVE_WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.CAVE_WALL); setTile(W - 1, y, T.CAVE_WALL); }
  return {
    id: 'underground_ns', name: 'UNDERGROUND PATH', width: W, height: H, tiles, collision,
    warps: [
      // North exit → Route 5 (bump warp on cave wall)
      { x: 2, y: 0, targetMap: 'route5', targetX: 14, targetY: 19 },
      // South exit → Route 6 (bump warp on cave wall)
      { x: 2, y: 29, targetMap: 'route6', targetX: 14, targetY: 4 },
    ],
    npcs: [{
      id: 'underground_ns_npc', x: 2, y: 15, spriteColor: 0x808080, direction: Direction.DOWN,
      dialogue: ['This underground path\nconnects ROUTE 5', 'and ROUTE 6.', "It's a shortcut that\nbypasses SAFFRON!"],
    }],
  };
})();

// ─── Underground Path East-West (Route 7 ↔ Route 8) ────────────────────────
export const UNDERGROUND_EW: MapData = (() => {
  const W = 30, H = 5;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  // Cave walls on all borders
  for (let x = 0; x < W; x++) { setTile(x, 0, T.CAVE_WALL); setTile(x, H - 1, T.CAVE_WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.CAVE_WALL); setTile(W - 1, y, T.CAVE_WALL); }
  return {
    id: 'underground_ew', name: 'UNDERGROUND PATH', width: W, height: H, tiles, collision,
    warps: [
      // West exit → Route 7 (bump warp on cave wall)
      { x: 0, y: 2, targetMap: 'route7', targetX: 10, targetY: 4 },
      // East exit → Route 8 (bump warp on cave wall)
      { x: 29, y: 2, targetMap: 'route8', targetX: 15, targetY: 4 },
    ],
    npcs: [{
      id: 'underground_ew_npc', x: 15, y: 2, spriteColor: 0x808080, direction: Direction.DOWN,
      dialogue: ['This underground path\nconnects ROUTE 7', 'and ROUTE 8.', "It's a shortcut that\nbypasses SAFFRON!"],
    }],
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
  game_corner: GAME_CORNER,
  rocket_hideout_b1f: ROCKET_HIDEOUT_B1F,
  rocket_hideout_b2f: ROCKET_HIDEOUT_B2F,
  rocket_hideout_b3f: ROCKET_HIDEOUT_B3F,
  rocket_hideout_b4f: ROCKET_HIDEOUT_B4F,
  digletts_cave: DIGLETTS_CAVE,
  lavender_house: LAVENDER_HOUSE,
  celadon_mansion: CELADON_MANSION,
  fighting_dojo: FIGHTING_DOJO,
  route7_gate: ROUTE7_GATE,
  route11_gate: ROUTE11_GATE,
  saffron_gate_north: SAFFRON_GATE_NORTH,
  saffron_gate_south: SAFFRON_GATE_SOUTH,
  saffron_gate_east: SAFFRON_GATE_EAST,
  underground_ns: UNDERGROUND_NS,
  underground_ew: UNDERGROUND_EW,
};
