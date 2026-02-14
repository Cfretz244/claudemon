import { MapData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';

const T = TileType;

function fill2D<V>(w: number, h: number, v: V): V[][] {
  return Array.from({ length: h }, () => Array(w).fill(v));
}

const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
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

  return {
    id: 'route5',
    name: 'ROUTE 5',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South exit -> Route 6
      { x: 9, y: 19, targetMap: 'route6', targetX: 9, targetY: 1 },
      { x: 10, y: 19, targetMap: 'route6', targetX: 9, targetY: 1 },
      // North entrance -> Cerulean City
      { x: 9, y: 0, targetMap: 'cerulean_city', targetX: 11, targetY: 23 },
      { x: 10, y: 0, targetMap: 'cerulean_city', targetX: 11, targetY: 23 },
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

  return {
    id: 'route6',
    name: 'ROUTE 6',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South exit -> Vermilion City
      { x: 9, y: 19, targetMap: 'vermilion_city', targetX: 11, targetY: 2 },
      { x: 10, y: 19, targetMap: 'vermilion_city', targetX: 11, targetY: 2 },
      // North entrance -> Route 5
      { x: 9, y: 0, targetMap: 'route5', targetX: 9, targetY: 18 },
      { x: 10, y: 0, targetMap: 'route5', targetX: 9, targetY: 18 },
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
  fillRect(4, 15, 6, 5, T.BUILDING);
  setTile(7, 20, T.DOOR);

  // Pokemon Center (right side, upper)
  fillRect(16, 5, 5, 4, T.BUILDING);
  setTile(18, 9, T.DOOR);

  // Pokemart (left side, upper)
  fillRect(4, 5, 5, 4, T.BUILDING);
  setTile(6, 9, T.DOOR);

  // SS Anne dock building (far right, lower)
  fillRect(20, 18, 6, 4, T.BUILDING);
  setTile(23, 22, T.DOOR);

  // Harbor water along southern edge
  fillRect(2, 22, 26, 3, T.WATER);
  // Re-place the dock door on top of water area
  setTile(23, 22, T.DOOR);

  // Flowers
  setTile(14, 6, T.FLOWER);
  setTile(15, 6, T.FLOWER);
  setTile(14, 7, T.FLOWER);
  setTile(8, 11, T.FLOWER);
  setTile(9, 11, T.FLOWER);

  // Signs
  setTile(9, 12, T.SIGN);
  setTile(6, 14, T.SIGN);

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
      { x: 29, y: 12, targetMap: 'route11', targetX: 1, targetY: 5 },
      { x: 29, y: 13, targetMap: 'route11', targetX: 1, targetY: 5 },
      // Gym door
      { x: 7, y: 20, targetMap: 'vermilion_gym', targetX: 4, targetY: 13 },
      // Pokemon Center
      { x: 18, y: 9, targetMap: 'pokemon_center_vermilion', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 6, y: 9, targetMap: 'pokemart_vermilion', targetX: 3, targetY: 7 },
      // SS Anne dock
      { x: 23, y: 22, targetMap: 'ss_anne', targetX: 5, targetY: 1 },
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
        x: 22, y: 17,
        spriteColor: 0x4060b0,
        direction: Direction.DOWN,
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
    ],
  };
})();

// ---------------------------------------------------------------------------
// VERMILION GYM -- Lt. Surge's electric gym (indoor)
// ---------------------------------------------------------------------------
export const VERMILION_GYM: MapData = (() => {
  const W = 10, H = 14;
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

  // Trash cans (COUNTER tiles) scattered around as obstacles
  setTile(2, 5, T.COUNTER);
  setTile(4, 6, T.COUNTER);
  setTile(6, 5, T.COUNTER);
  setTile(3, 8, T.COUNTER);
  setTile(5, 9, T.COUNTER);
  setTile(7, 7, T.COUNTER);
  setTile(2, 10, T.COUNTER);
  setTile(6, 10, T.COUNTER);
  setTile(7, 11, T.COUNTER);

  return {
    id: 'vermilion_gym',
    name: 'VERMILION GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'vermilion_city', targetX: 7, targetY: 21 },
      { x: 5, y: 13, targetMap: 'vermilion_city', targetX: 7, targetY: 21 },
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
        sightRange: 4,
      },
      {
        id: 'vermilion_gym_trainer',
        x: 7, y: 9,
        spriteColor: 0xc0a040,
        direction: Direction.LEFT,
        dialogue: [
          "SAILOR: LT. SURGE is\nmy commanding officer!",
          "You won't get past\nme!",
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
    id: 'pokemon_center_vermilion',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'vermilion_city', targetX: 18, targetY: 10 },
      { x: 5, y: 7, targetMap: 'vermilion_city', targetX: 18, targetY: 10 },
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
  fillRect(14, 10, 5, 4, T.BUILDING);
  setTile(16, 14, T.DOOR);

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
      { x: 16, y: 14, targetMap: 'pokemon_center_route10', targetX: 4, targetY: 7 },
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
    warps: [
      // South entrance -> Route 10 (near tunnel mouth)
      { x: 9, y: 19, targetMap: 'route10', targetX: 10, targetY: 13 },
      // North exit -> Route 10 (different spot)
      { x: 9, y: 0, targetMap: 'route10', targetX: 10, targetY: 11 },
    ],
    npcs: [
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
      grassRate: 0.15,
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
    id: 'pokemon_center_route10',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'route10', targetX: 16, targetY: 15 },
      { x: 5, y: 7, targetMap: 'route10', targetX: 16, targetY: 15 },
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
      { x: 3, y: H - 1, targetMap: 'vermilion_city', targetX: 6, targetY: 10 },
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
};
