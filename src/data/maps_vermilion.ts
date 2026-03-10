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

// ---------------------------------------------------------------------------
// ROUTE 5 -- vertical route between Cerulean City and Route 6
// ---------------------------------------------------------------------------
export const ROUTE5: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Vertical path
  fillRect(8, 0, 4, 20, T.PATH);

  // Tree borders on sides (2 tiles thick)
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Tall grass patches on both sides of the path
  fillRect(3, 4, 4, 4, T.TALL_GRASS);
  fillRect(13, 3, 4, 3, T.TALL_GRASS);
  fillRect(3, 12, 5, 3, T.TALL_GRASS);
  fillRect(13, 10, 4, 4, T.TALL_GRASS);

  // A few extra trees
  setTile(6, 9, T.TREE);
  setTile(14, 7, T.TREE);

  // Underground Path entrance building
  fillRect(13, 16, 3, 1, T.ROOF);
  fillRect(13, 17, 3, 1, T.BUILDING);
  setTile(13, 18, T.BUILDING); setTile(15, 18, T.BUILDING);
  setTile(14, 18, T.DOOR);
  setTile(12, 18, T.SIGN);

  return {
    id: 'route5',
    name: 'ROUTE 5',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South exit -> Saffron Gate North
      { x: 8, y: 19, targetMap: 'saffron_gate_north', targetX: 2, targetY: 1 },
      { x: 9, y: 19, targetMap: 'saffron_gate_north', targetX: 3, targetY: 1 },
      { x: 10, y: 19, targetMap: 'saffron_gate_north', targetX: 2, targetY: 1 },
      { x: 11, y: 19, targetMap: 'saffron_gate_north', targetX: 3, targetY: 1 },
      // Underground Path entrance
      { x: 14, y: 18, targetMap: 'underground_ns', targetX: 2, targetY: 1 },
      // North entrance -> Cerulean City
      { x: 8, y: 0, targetMap: 'cerulean_city', targetX: 10, targetY: 23 },
      { x: 9, y: 0, targetMap: 'cerulean_city', targetX: 11, targetY: 23 },
      { x: 10, y: 0, targetMap: 'cerulean_city', targetX: 12, targetY: 23 },
      { x: 11, y: 0, targetMap: 'cerulean_city', targetX: 13, targetY: 23 },
    ],
    npcs: [
      {
        id: 'route5_trainer1',
        x: 6, y: 7,
        spriteColor: 0xc08060,
        direction: Direction.RIGHT,
        dialogue: [
          'CAMPER: Ready to\nbattle?',
          "Let's see what you've\ngot!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route5_trainer2',
        x: 14, y: 14,
        spriteColor: 0x60a0c0,
        direction: Direction.LEFT,
        dialogue: [
          "PICNICKER: I'm on my\nway to VERMILION!",
          "But first, a battle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 43, minLevel: 13, maxLevel: 17, weight: 25 }, // Oddish
        { speciesId: 16, minLevel: 13, maxLevel: 17, weight: 20 }, // Pidgey
        { speciesId: 52, minLevel: 13, maxLevel: 15, weight: 15 }, // Meowth
        { speciesId: 56, minLevel: 13, maxLevel: 17, weight: 20 }, // Mankey
        { speciesId: 39, minLevel: 12, maxLevel: 15, weight: 20 }, // Jigglypuff
      ],
    },
  };
})();

// ---------------------------------------------------------------------------
// ROUTE 6 -- vertical route between Route 5 and Vermilion City
// ---------------------------------------------------------------------------
export const ROUTE6: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Vertical path
  fillRect(8, 0, 4, 20, T.PATH);

  // Tree borders on sides (2 tiles thick)
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Tall grass patches
  fillRect(3, 3, 4, 3, T.TALL_GRASS);
  fillRect(13, 5, 4, 4, T.TALL_GRASS);
  fillRect(4, 12, 4, 3, T.TALL_GRASS);
  fillRect(13, 13, 4, 3, T.TALL_GRASS);

  // Flowers
  setTile(5, 8, T.FLOWER);
  setTile(6, 8, T.FLOWER);
  setTile(14, 10, T.FLOWER);
  setTile(15, 10, T.FLOWER);

  // Underground Path entrance building
  fillRect(13, 1, 3, 1, T.ROOF);
  fillRect(13, 2, 3, 1, T.BUILDING);
  setTile(13, 3, T.BUILDING); setTile(15, 3, T.BUILDING);
  setTile(14, 3, T.DOOR);
  setTile(12, 3, T.SIGN);

  return {
    id: 'route6',
    name: 'ROUTE 6',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South exit -> Vermilion City
      { x: 8, y: 19, targetMap: 'vermilion_city', targetX: 10, targetY: 2 },
      { x: 9, y: 19, targetMap: 'vermilion_city', targetX: 11, targetY: 2 },
      { x: 10, y: 19, targetMap: 'vermilion_city', targetX: 12, targetY: 2 },
      { x: 11, y: 19, targetMap: 'vermilion_city', targetX: 13, targetY: 2 },
      // North entrance -> Saffron Gate South
      { x: 8, y: 0, targetMap: 'saffron_gate_south', targetX: 2, targetY: 6 },
      { x: 9, y: 0, targetMap: 'saffron_gate_south', targetX: 3, targetY: 6 },
      { x: 10, y: 0, targetMap: 'saffron_gate_south', targetX: 2, targetY: 6 },
      { x: 11, y: 0, targetMap: 'saffron_gate_south', targetX: 3, targetY: 6 },
      // Underground Path entrance
      { x: 14, y: 3, targetMap: 'underground_ns', targetX: 2, targetY: 28 },
    ],
    npcs: [
      {
        id: 'route6_trainer1',
        x: 5, y: 9,
        spriteColor: 0xa06080,
        direction: Direction.RIGHT,
        dialogue: [
          "BUG CATCHER: I've been\nwaiting for a battle!",
          "My bugs are the best!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route6_trainer2',
        x: 15, y: 16,
        spriteColor: 0x80c0a0,
        direction: Direction.LEFT,
        dialogue: [
          "LASS: Are you headed\nto VERMILION CITY?",
          "You'll have to beat\nme first!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 43, minLevel: 13, maxLevel: 17, weight: 25 }, // Oddish
        { speciesId: 16, minLevel: 13, maxLevel: 17, weight: 20 }, // Pidgey
        { speciesId: 56, minLevel: 13, maxLevel: 17, weight: 20 }, // Mankey
        { speciesId: 52, minLevel: 13, maxLevel: 15, weight: 15 }, // Meowth
        { speciesId: 39, minLevel: 12, maxLevel: 15, weight: 20 }, // Jigglypuff
      ],
    },
  };
})();

// ---------------------------------------------------------------------------
// VERMILION CITY -- port city, home of Lt. Surge
// ---------------------------------------------------------------------------
export const VERMILION_CITY: MapData = (() => {
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

  // Main roads: vertical path
  fillRect(10, 2, 4, 21, T.PATH);
  // Horizontal path
  fillRect(2, 12, 26, 2, T.PATH);

  // Vermilion Gym (left side, lower)
  fillRect(4, 15, 6, 1, T.ROOF);
  fillRect(4, 16, 6, 4, T.BUILDING);
  setTile(7, 19, T.DOOR);

  // Pokemon Center (right side, upper)
  fillRect(16, 5, 5, 1, T.ROOF);
  fillRect(16, 6, 5, 3, T.BUILDING);
  setTile(18, 8, T.DOOR);

  // Pokemart (left side, upper)
  fillRect(4, 5, 5, 1, T.ROOF);
  fillRect(4, 6, 5, 3, T.BUILDING);
  setTile(6, 8, T.DOOR);

  // SS Anne pier - path from road south to dock
  fillRect(22, 14, 2, 8, T.PATH);

  // Harbor water along southern edge
  fillRect(2, 22, 26, 3, T.WATER);
  // SS Anne pier extends over water
  fillRect(22, 22, 2, 2, T.PATH);
  // SS Anne boarding point at end of pier
  setTile(22, 24, T.DOOR);
  setTile(23, 24, T.DOOR);

  // CUT trees blocking path to gym
  setTile(5, 14, T.CUT_TREE);
  setTile(6, 14, T.CUT_TREE);

  // Flowers
  setTile(14, 6, T.FLOWER);
  setTile(15, 6, T.FLOWER);
  setTile(14, 7, T.FLOWER);
  setTile(8, 11, T.FLOWER);
  setTile(9, 11, T.FLOWER);

  // Signs
  setTile(9, 12, T.SIGN);

  return {
    id: 'vermilion_city',
    name: 'VERMILION CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North exit -> Route 6
      { x: 11, y: 1, targetMap: 'route6', targetX: 9, targetY: 18 },
      { x: 12, y: 1, targetMap: 'route6', targetX: 9, targetY: 18 },
      // East exit -> Route 11
      { x: 28, y: 12, targetMap: 'route11', targetX: 2, targetY: 5 },
      { x: 28, y: 13, targetMap: 'route11', targetX: 2, targetY: 5 },
      // Gym door
      { x: 7, y: 19, targetMap: 'vermilion_gym', targetX: 4, targetY: 13 },
      // Pokemon Center
      { x: 18, y: 8, targetMap: 'pokemon_center_vermilion', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 6, y: 8, targetMap: 'pokemart_vermilion', targetX: 3, targetY: 7 },
      // SS Anne pier
      { x: 22, y: 24, targetMap: 'ss_anne', targetX: 10, targetY: 12 },
      { x: 23, y: 24, targetMap: 'ss_anne', targetX: 10, targetY: 12 },
    ],
    npcs: [
      {
        id: 'vermilion_npc1',
        x: 15, y: 13,
        spriteColor: 0x6080c0,
        direction: Direction.DOWN,
        dialogue: [
          'VERMILION CITY',
          'The Port of Exquisite\nSunsets!',
        ],
      },
      {
        id: 'vermilion_sailor',
        x: 21, y: 14,
        spriteColor: 0x4060b0,
        direction: Direction.RIGHT,
        dialogue: [
          "SAILOR: The S.S. ANNE\nis docked at the port!",
          "You need a ticket to\nget on board, though.",
        ],
      },
      {
        id: 'vermilion_npc3',
        x: 8, y: 14,
        spriteColor: 0xc0a060,
        direction: Direction.UP,
        dialogue: [
          "LT. SURGE is the GYM\nLEADER here!",
          "He's an expert on\nELECTRIC-type POKeMON!",
          "Watch out for his\nRAICHU!",
        ],
      },
      // Officer Jenny - gives Squirtle after Thunder Badge
      {
        id: 'vermilion_officer_jenny',
        x: 16, y: 13,
        spriteColor: 0x4060c0,
        direction: Direction.DOWN,
        dialogue: [
          "OFFICER JENNY: I'm\npatrolling the city!",
        ],
      },
    ],
  };
})();

// ---------------------------------------------------------------------------
// VERMILION GYM -- Lt. Surge's electric gym (indoor)
// ---------------------------------------------------------------------------
export const VERMILION_GYM: MapData = (() => {
  const W = 10, H = 16;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
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

  // Electric gate (FENCE row) blocks path to Lt. Surge at row 5
  // Columns 1-8 (the full interior width)
  for (let x = 1; x < W - 1; x++) {
    setTile(x, 5, T.FENCE);
  }

  // Trash cans in rows — player walks in aisles between rows
  // 3 rows of 5 cans each, with walkable aisles between rows
  // Row cans are horizontally adjacent for the puzzle's second switch
  const trashPositions = [
    [2, 7],  [3, 7],  [4, 7],  [5, 7],  [6, 7],   // row 1
    [2, 9],  [3, 9],  [4, 9],  [5, 9],  [6, 9],   // row 2
    [2, 11], [3, 11], [4, 11], [5, 11], [6, 11],  // row 3
  ];
  for (const [tx, ty] of trashPositions) {
    setTile(tx, ty, T.COUNTER);
  }

  return {
    id: 'vermilion_gym',
    name: 'VERMILION GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 15, targetMap: 'vermilion_city', targetX: 7, targetY: 20 },
      { x: 5, y: 15, targetMap: 'vermilion_city', targetX: 7, targetY: 20 },
    ],
    npcs: [
      {
        id: 'lt_surge',
        x: 4, y: 3,
        spriteColor: 0xf0c020,
        direction: Direction.DOWN,
        dialogue: [
          "LT. SURGE: Hey kid!",
          "What do you think\nyou're doing here?",
          "I'll show you the\npower of electricity!",
        ],
        isTrainer: true,
        sightRange: 1,
      },
      {
        id: 'vermilion_gym_trainer1',
        x: 8, y: 8,
        spriteColor: 0xc0a040,
        direction: Direction.LEFT,
        dialogue: [
          "SAILOR: LT. SURGE is\nmy commanding officer!",
          "You won't get past\nme!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'vermilion_gym_trainer2',
        x: 1, y: 10,
        spriteColor: 0xa08030,
        direction: Direction.RIGHT,
        dialogue: [
          "GENTLEMAN: I came\nhere to test the",
          "power of my prized\nelectric POKeMON!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'vermilion_gym_trainer3',
        x: 8, y: 12,
        spriteColor: 0xd0b050,
        direction: Direction.LEFT,
        dialogue: [
          "ROCKER: LT. SURGE\nis totally radical!",
          "His RAICHU will\nshock you!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ---------------------------------------------------------------------------
// POKEMON CENTER VERMILION (indoor)
// ---------------------------------------------------------------------------
export const POKEMON_CENTER_VERMILION: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
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

  // Carpet to door
  setTile(4, 5, T.CARPET);
  setTile(5, 5, T.CARPET);
  setTile(4, 6, T.CARPET);
  setTile(5, 6, T.CARPET);

  return {
    id: 'pokemon_center_vermilion',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'vermilion_city', targetX: 18, targetY: 9 },
      { x: 5, y: 7, targetMap: 'vermilion_city', targetX: 18, targetY: 9 },
    ],
    npcs: [
      {
        id: 'nurse_vermilion',
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

// ---------------------------------------------------------------------------
// ROUTE 9 -- horizontal route east of Cerulean City
// ---------------------------------------------------------------------------
export const ROUTE9: MapData = (() => {
  const W = 25, H = 12;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Horizontal path
  fillRect(0, 5, 25, 2, T.PATH);

  // Tree borders top and bottom
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, H - 1, T.TREE);
  }

  // Tall grass patches
  fillRect(4, 2, 4, 3, T.TALL_GRASS);
  fillRect(12, 2, 4, 3, T.TALL_GRASS);
  fillRect(8, 7, 5, 3, T.TALL_GRASS);
  fillRect(18, 7, 4, 3, T.TALL_GRASS);

  // Ledges
  fillRect(5, 8, 3, 1, T.LEDGE);
  fillRect(16, 4, 3, 1, T.LEDGE);

  // Scattered trees
  setTile(10, 3, T.TREE);
  setTile(20, 3, T.TREE);
  setTile(6, 9, T.TREE);

  return {
    id: 'route9',
    name: 'ROUTE 9',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance -> Cerulean City
      { x: 0, y: 5, targetMap: 'cerulean_city', targetX: 23, targetY: 12 },
      { x: 0, y: 6, targetMap: 'cerulean_city', targetX: 23, targetY: 12 },
      // East exit -> Route 10
      { x: 24, y: 5, targetMap: 'route10', targetX: 9, targetY: 1 },
      { x: 24, y: 6, targetMap: 'route10', targetX: 9, targetY: 1 },
    ],
    npcs: [
      {
        id: 'route9_trainer1',
        x: 8, y: 4,
        spriteColor: 0xc06060,
        direction: Direction.DOWN,
        dialogue: [
          "HIKER: These mountains\nare my turf!",
          "Let's battle, kid!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route9_trainer2',
        x: 18, y: 5,
        spriteColor: 0x60c060,
        direction: Direction.LEFT,
        dialogue: [
          "YOUNGSTER: ROCK TUNNEL\nis just up ahead!",
          "But you'll have to\nget through me first!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 21, minLevel: 15, maxLevel: 19, weight: 25 }, // Spearow
        { speciesId: 100, minLevel: 14, maxLevel: 17, weight: 15 }, // Voltorb
        { speciesId: 23, minLevel: 15, maxLevel: 19, weight: 20 }, // Ekans
        { speciesId: 27, minLevel: 15, maxLevel: 19, weight: 20 }, // Sandshrew
        { speciesId: 22, minLevel: 17, maxLevel: 19, weight: 20 }, // Fearow
      ],
    },
  };
})();

// ---------------------------------------------------------------------------
// ROUTE 10 -- vertical route leading to Rock Tunnel and Lavender Town
// ---------------------------------------------------------------------------
export const ROUTE10: MapData = (() => {
  const W = 20, H = 25;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Vertical path
  fillRect(8, 0, 4, 25, T.PATH);

  // Tree borders on sides (2 tiles thick)
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Rock Tunnel entrance (cave mouth)
  setTile(10, 12, T.DOOR);

  // Pokemon Center near tunnel entrance
  fillRect(14, 10, 5, 1, T.ROOF);
  fillRect(14, 11, 5, 3, T.BUILDING);
  setTile(16, 13, T.DOOR);

  // Tall grass patches
  fillRect(3, 3, 4, 3, T.TALL_GRASS);
  fillRect(13, 4, 4, 3, T.TALL_GRASS);
  fillRect(3, 16, 5, 3, T.TALL_GRASS);
  fillRect(13, 18, 4, 4, T.TALL_GRASS);

  // Scattered trees
  setTile(6, 8, T.TREE);
  setTile(7, 20, T.TREE);

  // Sign near tunnel
  setTile(9, 11, T.SIGN);

  return {
    id: 'route10',
    name: 'ROUTE 10',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North entrance -> Route 9
      { x: 9, y: 0, targetMap: 'route9', targetX: 23, targetY: 5 },
      { x: 10, y: 0, targetMap: 'route9', targetX: 23, targetY: 5 },
      // Rock Tunnel entrance
      { x: 10, y: 12, targetMap: 'rock_tunnel', targetX: 9, targetY: 19 },
      // Pokemon Center door
      { x: 16, y: 13, targetMap: 'pokemon_center_route10', targetX: 4, targetY: 7 },
      // South exit -> Lavender Town
      { x: 9, y: 24, targetMap: 'lavender_town', targetX: 11, targetY: 2 },
      { x: 10, y: 24, targetMap: 'lavender_town', targetX: 11, targetY: 2 },
    ],
    npcs: [],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 100, minLevel: 14, maxLevel: 17, weight: 25 }, // Voltorb
        { speciesId: 21, minLevel: 15, maxLevel: 17, weight: 20 }, // Spearow
        { speciesId: 23, minLevel: 15, maxLevel: 17, weight: 20 }, // Ekans
        { speciesId: 66, minLevel: 15, maxLevel: 17, weight: 20 }, // Machop
        { speciesId: 81, minLevel: 16, maxLevel: 18, weight: 15 }, // Magnemite
      ],
    },
  };
})();

// ---------------------------------------------------------------------------
// ROCK TUNNEL -- dark cave between Route 10 segments
// ---------------------------------------------------------------------------
export const ROCK_TUNNEL: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Cave wall borders (2 tiles thick on all sides)
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

  // Carve winding corridors through the cave

  // Entrance corridor from south (y=18 up to y=15)
  fillRect(8, 15, 4, 4, T.CAVE_FLOOR);

  // Main east-west corridor (bottom section)
  fillRect(3, 13, 15, 3, T.CAVE_FLOOR);

  // West vertical corridor going up
  fillRect(3, 7, 3, 7, T.CAVE_FLOOR);

  // Upper east-west corridor
  fillRect(3, 5, 10, 3, T.CAVE_FLOOR);

  // East vertical corridor
  fillRect(14, 5, 3, 9, T.CAVE_FLOOR);

  // North exit corridor
  fillRect(8, 2, 4, 4, T.CAVE_FLOOR);

  // Connecting corridor upper-east to center
  fillRect(10, 3, 7, 3, T.CAVE_FLOOR);

  // Interior cave wall obstacles to create winding feel
  fillRect(7, 8, 3, 2, T.CAVE_WALL);
  fillRect(11, 10, 2, 2, T.CAVE_WALL);
  fillRect(5, 11, 2, 2, T.CAVE_WALL);
  setTile(8, 6, T.CAVE_WALL);
  setTile(13, 8, T.CAVE_WALL);
  setTile(6, 14, T.CAVE_WALL);
  setTile(12, 14, T.CAVE_WALL);

  return {
    id: 'rock_tunnel',
    name: 'ROCK TUNNEL',
    width: W,
    height: H,
    tiles,
    collision,
    isDark: true,
    warps: [
      // South entrance -> Route 10 (near tunnel mouth)
      { x: 9, y: 19, targetMap: 'route10', targetX: 10, targetY: 13 },
      // North exit -> Route 10 (different spot)
      { x: 9, y: 0, targetMap: 'route10', targetX: 10, targetY: 11 },
    ],
    npcs: [
      {
        id: 'rock_tunnel_escape_rope',
        x: 4, y: 6,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'escape_rope',
      },
      {
        id: 'rock_tunnel_revive',
        x: 16, y: 12,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'revive',
      },
      {
        id: 'rock_tunnel_trainer1',
        x: 5, y: 9,
        spriteColor: 0x908060,
        direction: Direction.RIGHT,
        dialogue: [
          "HIKER: It's pitch\nblack in here!",
          "But I can still\nbattle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'rock_tunnel_trainer2',
        x: 15, y: 7,
        spriteColor: 0x609080,
        direction: Direction.DOWN,
        dialogue: [
          "POKEMANIAC: I love\ncave POKeMON!",
          "Have you seen the\nONIX here?",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'rock_tunnel_trainer3',
        x: 10, y: 14,
        spriteColor: 0xc08050,
        direction: Direction.UP,
        dialogue: [
          "HIKER: This tunnel\ngoes on forever!",
          "Let me test your\nstrength!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.08,
      encounters: [
        { speciesId: 41, minLevel: 15, maxLevel: 18, weight: 30 }, // Zubat
        { speciesId: 74, minLevel: 15, maxLevel: 18, weight: 25 }, // Geodude
        { speciesId: 66, minLevel: 15, maxLevel: 18, weight: 20 }, // Machop
        { speciesId: 95, minLevel: 16, maxLevel: 17, weight: 15 }, // Onix
        { speciesId: 104, minLevel: 16, maxLevel: 18, weight: 10 }, // Cubone
      ],
    },
  };
})();

// ---------------------------------------------------------------------------
// POKEMON CENTER ROUTE 10 (indoor)
// ---------------------------------------------------------------------------
export const POKEMON_CENTER_ROUTE10: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
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

  // Carpet to door
  setTile(4, 5, T.CARPET);
  setTile(5, 5, T.CARPET);
  setTile(4, 6, T.CARPET);
  setTile(5, 6, T.CARPET);

  return {
    id: 'pokemon_center_route10',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'route10', targetX: 16, targetY: 14 },
      { x: 5, y: 7, targetMap: 'route10', targetX: 16, targetY: 14 },
    ],
    npcs: [
      {
        id: 'nurse_route10',
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

// ---------------------------------------------------------------------------
// Combined map registry for the Vermilion area
// ---------------------------------------------------------------------------
// ─── POKeMON MART (VERMILION)  (8x8 indoor) ───────────────────────
export const POKEMART_VERMILION: MapData = (() => {
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

  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(5, 2, T.MART_SHELF); setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF); setTile(6, 4, T.MART_SHELF);

  return {
    id: 'pokemart_vermilion',
    name: 'POKeMON MART',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'vermilion_city', targetX: 6, targetY: 9 },
    ],
    npcs: [
      {
        id: 'mart_clerk',
        x: 2, y: 2,
        spriteColor: 0x4080f0,
        direction: Direction.DOWN,
        dialogue: ['Welcome! How may I\nserve you?'],
        shopStock: ['poke_ball', 'great_ball', 'potion', 'super_potion', 'repel', 'escape_rope'],
      },
    ],
  };
})();

// ---------------------------------------------------------------------------
// S.S. ANNE 1F -- Main entrance hall with 4 passenger cabins
// ---------------------------------------------------------------------------
export const SS_ANNE: MapData = (() => {
  const W = 22, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Outer walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Cabin band (y=2-4): solid wall, then carve out 4 cabin interiors + doors
  fillRect(1, 2, 20, 3, T.WALL);
  // Cabin 1 (x=2-4, y=2-3)
  fillRect(2, 2, 3, 2, T.INDOOR_FLOOR); setTile(3, 4, T.DOOR);
  setTile(2, 2, T.COUNTER);
  // Cabin 2 (x=7-9, y=2-3)
  fillRect(7, 2, 3, 2, T.INDOOR_FLOOR); setTile(8, 4, T.DOOR);
  setTile(7, 2, T.COUNTER);
  // Cabin 3 (x=12-14, y=2-3)
  fillRect(12, 2, 3, 2, T.INDOOR_FLOOR); setTile(13, 4, T.DOOR);
  setTile(14, 2, T.COUNTER);
  // Cabin 4 (x=17-19, y=2-3)
  fillRect(17, 2, 3, 2, T.INDOOR_FLOOR); setTile(18, 4, T.DOOR);
  setTile(19, 2, T.COUNTER);

  // Central carpet corridor (y=5-6)
  fillRect(1, 5, 20, 2, T.CARPET);

  // Stair alcoves (2 tall so doors are accessible from the corridor side)
  // West stairs down to B1F
  fillRect(1, 8, 3, 2, T.WALL);
  setTile(2, 8, T.DOOR);
  // East stairs up to 2F
  fillRect(18, 8, 3, 2, T.WALL);
  setTile(19, 8, T.DOOR);

  // Entrance vestibule
  fillRect(8, 10, 6, 3, T.CARPET);
  setTile(10, 13, T.DOOR);
  setTile(11, 13, T.DOOR);

  return {
    id: 'ss_anne',
    name: 'S.S. ANNE 1F',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Exit to Vermilion pier
      { x: 10, y: 13, targetMap: 'vermilion_city', targetX: 22, targetY: 23 },
      { x: 11, y: 13, targetMap: 'vermilion_city', targetX: 22, targetY: 23 },
      // West stairs down to B1F
      { x: 2, y: 8, targetMap: 'ss_anne_b1f', targetX: 2, targetY: 4 },
      // East stairs up to 2F
      { x: 19, y: 8, targetMap: 'ss_anne_2f', targetX: 19, targetY: 9 },
    ],
    npcs: [
      {
        id: 'ss_anne_sailor_greeter',
        x: 10, y: 7,
        spriteColor: 0x4060b0,
        direction: Direction.DOWN,
        dialogue: [
          "SAILOR: Welcome aboard\nthe S.S. ANNE!",
          "The CAPTAIN's quarters\nare upstairs on 2F.",
          "The crew area is\ndown below.",
        ],
      },
      {
        id: 'ss_anne_lass1',
        x: 3, y: 3,
        spriteColor: 0xe06080,
        direction: Direction.DOWN,
        dialogue: ["LASS: Isn't this ship\njust wonderful?"],
        isTrainer: true,
        sightRange: 1,
      },
      {
        id: 'ss_anne_beauty1',
        x: 8, y: 3,
        spriteColor: 0xe06080,
        direction: Direction.DOWN,
        dialogue: ["BEAUTY: A cruise is the\nperfect getaway!"],
        isTrainer: true,
        sightRange: 1,
      },
      {
        id: 'ss_anne_gambler1',
        x: 13, y: 3,
        spriteColor: 0x808080,
        direction: Direction.DOWN,
        dialogue: ["GAMBLER: I bet I can\nbeat you!"],
        isTrainer: true,
        sightRange: 1,
      },
      {
        id: 'item_ss_anne_1f_super_potion',
        x: 18, y: 3,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'super_potion',
      },
    ],
  };
})();

// ---------------------------------------------------------------------------
// S.S. ANNE 2F -- Captain's quarters, rival battle, upper cabins
// ---------------------------------------------------------------------------
export const SS_ANNE_2F: MapData = (() => {
  const W = 22, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Outer walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Captain's quarters (west, x=1-7, y=2-6)
  fillRect(1, 2, 7, 5, T.INDOOR_FLOOR);
  // Captain room walls
  fillRect(7, 2, 1, 5, T.WALL); // right wall of captain's room
  fillRect(1, 6, 7, 1, T.WALL); // front wall
  setTile(4, 6, T.DOOR); // door to captain's room
  // Captain's desk
  setTile(3, 2, T.COUNTER); setTile(4, 2, T.COUNTER);

  // Upper cabins (y=2-4): wall band east of captain's room, carve cabins
  fillRect(9, 2, 12, 3, T.WALL);
  // Cabin A (x=10-12, y=2-3)
  fillRect(10, 2, 3, 2, T.INDOOR_FLOOR); setTile(11, 4, T.DOOR);
  setTile(10, 2, T.COUNTER);
  // Cabin B (x=15-17, y=2-3)
  fillRect(15, 2, 3, 2, T.INDOOR_FLOOR); setTile(16, 4, T.DOOR);
  setTile(17, 2, T.COUNTER);

  // Central carpet corridor (y=7-8)
  fillRect(1, 7, 20, 2, T.CARPET);

  // Stair alcoves (2 tall so doors are accessible)
  // East stairs down to 1F
  fillRect(18, 10, 3, 2, T.WALL);
  setTile(19, 10, T.DOOR);
  // Center-west stairs up to Deck
  fillRect(4, 10, 3, 2, T.WALL);
  setTile(5, 10, T.DOOR);

  return {
    id: 'ss_anne_2f',
    name: 'S.S. ANNE 2F',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // East stairs down to 1F
      { x: 19, y: 10, targetMap: 'ss_anne', targetX: 19, targetY: 7 },
      // Center-west stairs up to Deck
      { x: 5, y: 10, targetMap: 'ss_anne_deck', targetX: 11, targetY: 7 },
    ],
    npcs: [
      {
        id: 'ss_anne_captain',
        x: 4, y: 4,
        spriteColor: 0x4060b0,
        direction: Direction.DOWN,
        dialogue: [
          "CAPTAIN: Ugh... I feel\nseasick...",
          "Thank you for\nchecking on me!",
          "Here, take this HM\nas my thanks!",
        ],
      },
      {
        id: 'rival_ss_anne',
        x: 7, y: 8,
        spriteColor: 0x6080c0,
        direction: Direction.LEFT,
        dialogue: [
          "{RIVAL}: {PLAYER}!\nBoarded the S.S. ANNE\ntoo, huh?",
          "Let's see how much\nyou've improved!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'ss_anne_sailor2',
        x: 14, y: 7,
        spriteColor: 0x4060b0,
        direction: Direction.LEFT,
        dialogue: [
          "SAILOR: The CAPTAIN\nhasn't been feeling\nwell...",
          "His quarters are\njust to the west.",
        ],
      },
      {
        id: 'ss_anne_fisher1',
        x: 11, y: 3,
        spriteColor: 0x808060,
        direction: Direction.DOWN,
        dialogue: ["FISHER: I catch POKeMON\nfrom the ship's railing!"],
        isTrainer: true,
        sightRange: 1,
      },
      {
        id: 'ss_anne_youngster1',
        x: 16, y: 3,
        spriteColor: 0x6080c0,
        direction: Direction.DOWN,
        dialogue: ["YOUNGSTER: My first\ncruise! Let's battle!"],
        isTrainer: true,
        sightRange: 1,
      },
      {
        id: 'item_ss_anne_2f_rare_candy',
        x: 12, y: 2,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'rare_candy',
      },
    ],
  };
})();

// ---------------------------------------------------------------------------
// S.S. ANNE B1F -- Crew quarters, kitchen, and storage
// ---------------------------------------------------------------------------
export const SS_ANNE_B1F: MapData = (() => {
  const W = 22, H = 12;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Outer walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Stair alcove (up to 1F) at top-left
  fillRect(1, 2, 3, 2, T.WALL);
  setTile(2, 3, T.DOOR);

  // Kitchen area (west, x=1-8, y=5-10)
  // Prep tables (counters)
  fillRect(2, 5, 2, 1, T.COUNTER);
  fillRect(2, 7, 2, 1, T.COUNTER);
  fillRect(5, 5, 2, 1, T.COUNTER);
  // Dividing wall between kitchen and crew quarters
  fillRect(9, 2, 1, 9, T.WALL);
  setTile(9, 6, T.DOOR); // passage between areas

  // Crew quarters (east, x=10-20, y=2-10)
  // Bunk beds (counters)
  fillRect(11, 2, 2, 1, T.COUNTER);
  fillRect(14, 2, 2, 1, T.COUNTER);
  fillRect(11, 4, 2, 1, T.COUNTER);
  fillRect(14, 4, 2, 1, T.COUNTER);

  // Storage room at far east
  fillRect(17, 2, 1, 5, T.WALL);
  setTile(17, 5, T.DOOR);

  return {
    id: 'ss_anne_b1f',
    name: 'S.S. ANNE B1F',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Stairs up to 1F
      { x: 2, y: 3, targetMap: 'ss_anne', targetX: 2, targetY: 7 },
    ],
    npcs: [
      {
        id: 'ss_anne_cook',
        x: 4, y: 6,
        spriteColor: 0xe0e0e0,
        direction: Direction.RIGHT,
        dialogue: [
          "COOK: I'm preparing\ntonight's dinner!",
          "The passengers love\nmy MAGIKARP stew!",
        ],
      },
      {
        id: 'ss_anne_sailor3',
        x: 6, y: 8,
        spriteColor: 0x4060b0,
        direction: Direction.UP,
        dialogue: ["SAILOR: No passengers\nallowed down here!"],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'ss_anne_sailor4',
        x: 3, y: 9,
        spriteColor: 0x4060b0,
        direction: Direction.RIGHT,
        dialogue: ["SAILOR: My MACHOP are\ntougher than they look!"],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'ss_anne_sailor5',
        x: 12, y: 6,
        spriteColor: 0x4060b0,
        direction: Direction.DOWN,
        dialogue: ["SAILOR: I found these\nPOKeMON at sea!"],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'ss_anne_fisher2',
        x: 15, y: 6,
        spriteColor: 0x808060,
        direction: Direction.LEFT,
        dialogue: ["FISHER: The kitchen\nneeds fresh seafood!"],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'item_ss_anne_b1f_hyper_potion',
        x: 19, y: 3,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'hyper_potion',
      },
      {
        id: 'item_ss_anne_b1f_super_potion',
        x: 7, y: 7,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'super_potion',
      },
    ],
  };
})();

// ---------------------------------------------------------------------------
// S.S. ANNE DECK -- Open-air top deck with ocean view
// ---------------------------------------------------------------------------
export const SS_ANNE_DECK: MapData = (() => {
  const W = 24, H = 10;
  const tiles = fill2D(W, H, T.PATH);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Ocean (top rows)
  fillRect(0, 0, W, 2, T.WATER);
  // Ship railing
  fillRect(0, 2, W, 1, T.FENCE);
  // Left and right hull walls
  for (let y = 3; y < H; y++) { setTile(0, y, T.FENCE); setTile(W - 1, y, T.FENCE); }
  // Bottom hull wall
  fillRect(0, H - 1, W, 1, T.FENCE);

  // Benches along sides
  fillRect(2, 4, 1, 1, T.COUNTER);
  fillRect(5, 4, 1, 1, T.COUNTER);
  fillRect(18, 4, 1, 1, T.COUNTER);
  fillRect(21, 4, 1, 1, T.COUNTER);
  fillRect(2, 7, 1, 1, T.COUNTER);
  fillRect(21, 7, 1, 1, T.COUNTER);

  // Stair alcove (down to 2F) at center
  fillRect(10, 8, 3, 1, T.WALL);
  setTile(11, 8, T.DOOR);

  return {
    id: 'ss_anne_deck',
    name: 'S.S. ANNE DECK',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Stairs down to 2F
      { x: 11, y: 8, targetMap: 'ss_anne_2f', targetX: 5, targetY: 9 },
    ],
    npcs: [
      {
        id: 'ss_anne_passenger1',
        x: 4, y: 5,
        spriteColor: 0x60a060,
        direction: Direction.UP,
        dialogue: [
          "PASSENGER: The ocean\nis so beautiful!",
          "I could stay up here\nall day!",
        ],
      },
      {
        id: 'ss_anne_cooltrainer1',
        x: 8, y: 5,
        spriteColor: 0xc06040,
        direction: Direction.RIGHT,
        dialogue: ["COOLTRAINER: The sea\nbreeze is perfect\nfor battling!"],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'ss_anne_lass2',
        x: 16, y: 5,
        spriteColor: 0xe06080,
        direction: Direction.LEFT,
        dialogue: ["LASS: The view from\nthe deck is amazing!"],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'ss_anne_sailor6',
        x: 20, y: 5,
        spriteColor: 0x4060b0,
        direction: Direction.LEFT,
        dialogue: ["SAILOR: I'm the\nstrongest sailor on\nthis ship!"],
        isTrainer: true,
        sightRange: 2,
      },
      {
        id: 'item_ss_anne_deck_nugget',
        x: 22, y: 5,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'nugget',
      },
    ],
  };
})();

export const VERMILION_MAPS: Record<string, MapData> = {
  route5: ROUTE5,
  route6: ROUTE6,
  vermilion_city: VERMILION_CITY,
  vermilion_gym: VERMILION_GYM,
  pokemon_center_vermilion: POKEMON_CENTER_VERMILION,
  pokemart_vermilion: POKEMART_VERMILION,
  route9: ROUTE9,
  route10: ROUTE10,
  rock_tunnel: ROCK_TUNNEL,
  pokemon_center_route10: POKEMON_CENTER_ROUTE10,
  ss_anne: SS_ANNE,
  ss_anne_2f: SS_ANNE_2F,
  ss_anne_b1f: SS_ANNE_B1F,
  ss_anne_deck: SS_ANNE_DECK,
};
