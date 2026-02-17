import { MapData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { CERULEAN_MAPS } from './maps_cerulean';
import { VERMILION_MAPS } from './maps_vermilion';
import { CENTRAL_MAPS } from './maps_central';
import { SOUTH_MAPS } from './maps_south';
import { ENDGAME_MAPS } from './maps_endgame';

const T = TileType;

// Helper to create a filled 2D array
function fill2D<V>(width: number, height: number, value: V): V[][] {
  return Array.from({ length: height }, () => Array(width).fill(value));
}

// Collision lookup: which tiles block movement
export const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
  T.CUT_TREE, T.BOULDER,
]);

export const PALLET_TOWN: MapData = (() => {
  const W = 20, H = 20;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  // Set collision based on tile type
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  // Paths
  fillRect(8, 4, 4, 14, T.PATH);
  fillRect(2, 8, 16, 2, T.PATH);

  // Player's house (top-left area)
  fillRect(2, 3, 5, 4, T.BUILDING);
  setTile(4, 7, T.DOOR);

  // Rival's house (top-right area)
  fillRect(12, 3, 5, 4, T.BUILDING);
  setTile(14, 7, T.DOOR);

  // Oak's Lab (bottom center)
  fillRect(7, 12, 6, 4, T.BUILDING);
  setTile(10, 16, T.DOOR);
  // Sign
  setTile(11, 16, T.SIGN);

  // Trees border (with gap at north for Route 1 exit)
  for (let x = 0; x < W; x++) {
    // Leave gap at x=8-11 for north exit path
    if (x < 8 || x > 11) {
      setTile(x, 0, T.TREE);
      setTile(x, 1, T.TREE);
    } else {
      setTile(x, 0, T.PATH);
      setTile(x, 1, T.PATH);
    }
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Some flowers
  setTile(5, 10, T.FLOWER);
  setTile(6, 10, T.FLOWER);
  setTile(14, 10, T.FLOWER);
  setTile(15, 10, T.FLOWER);

  // Tall grass patches
  fillRect(3, 11, 4, 2, T.TALL_GRASS);
  fillRect(14, 11, 4, 2, T.TALL_GRASS);

  // South shore - water with trees on sides, then all water
  for (let x = 2; x < W - 2; x++) {
    setTile(x, H - 2, T.WATER);
  }
  for (let x = 0; x < W; x++) {
    setTile(x, H - 1, T.WATER);
  }

  // Signs
  setTile(7, 9, T.SIGN);

  return {
    id: 'pallet_town',
    name: 'PALLET TOWN',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Player's house door
      { x: 4, y: 7, targetMap: 'player_house', targetX: 3, targetY: 7 },
      // Rival's house door
      { x: 14, y: 7, targetMap: 'rival_house', targetX: 3, targetY: 7 },
      // Oak's Lab door
      { x: 10, y: 16, targetMap: 'oaks_lab', targetX: 4, targetY: 11 },
      // North exit to Route 1
      { x: 8, y: 1, targetMap: 'route1', targetX: 8, targetY: 28 },
      { x: 9, y: 1, targetMap: 'route1', targetX: 9, targetY: 28 },
      { x: 10, y: 1, targetMap: 'route1', targetX: 10, targetY: 28 },
      { x: 11, y: 1, targetMap: 'route1', targetX: 11, targetY: 28 },
      // South exit to Route 21
      { x: 9, y: 17, targetMap: 'route21', targetX: 7, targetY: 1 },
      { x: 10, y: 17, targetMap: 'route21', targetX: 7, targetY: 1 },
    ],
    npcs: [
      {
        id: 'pallet_npc1',
        x: 6, y: 9,
        spriteColor: 0xf06060,
        direction: Direction.DOWN,
        dialogue: [
          'PALLET TOWN',
          'Shades of your journey\nawait!',
        ],
      },
      {
        id: 'pallet_npc2',
        x: 13, y: 9,
        spriteColor: 0x60a0f0,
        direction: Direction.LEFT,
        dialogue: [
          "I heard PROF. OAK's\nlooking for you!",
          'His lab is right over\nthere.',
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 50 }, // Pidgey
        { speciesId: 19, minLevel: 2, maxLevel: 4, weight: 50 }, // Rattata
      ],
    },
  };
})();

export const PLAYER_HOUSE: MapData = (() => {
  const W = 8, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Carpet in center
  setTile(3, 4, T.CARPET);
  setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET);
  setTile(4, 5, T.CARPET);

  // TV/PC area
  setTile(2, 2, T.PC);

  // Door at bottom
  setTile(3, H - 1, T.DOOR);

  return {
    id: 'player_house',
    name: "PLAYER's HOUSE",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'pallet_town', targetX: 4, targetY: 8 },
    ],
    npcs: [
      {
        id: 'mom',
        x: 4, y: 3,
        spriteColor: 0xf07090,
        direction: Direction.DOWN,
        dialogue: [
          'MOM: Right! All boys\nleave home someday.',
          "It said so on TV!",
          "PROF. OAK next door\nwas looking for you.",
        ],
      },
    ],
  };
})();

export const RIVAL_HOUSE: MapData = (() => {
  const W = 8, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Carpet in center
  setTile(3, 4, T.CARPET);
  setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET);
  setTile(4, 5, T.CARPET);

  // TV/bookshelf area
  setTile(2, 2, T.PC);
  setTile(5, 2, T.MART_SHELF);

  // Door at bottom
  setTile(3, H - 1, T.DOOR);

  return {
    id: 'rival_house',
    name: "{RIVAL}'s HOUSE",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'pallet_town', targetX: 14, targetY: 8 },
    ],
    npcs: [
      {
        id: 'rival_sister',
        x: 4, y: 3,
        spriteColor: 0xf0a050,
        direction: Direction.DOWN,
        dialogue: [
          "DAISY: Hi! My brother\nisn't here right now.",
          "He left without even\nsaying goodbye!",
          "He's always like that.",
        ],
      },
    ],
  };
})();

export const OAKS_LAB: MapData = (() => {
  const W = 10, H = 12;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Bookshelves along walls
  for (let x = 1; x < W - 1; x++) {
    setTile(x, 2, T.MART_SHELF);
  }

  // Lab table in center
  for (let y = 4; y < 8; y++) {
    setTile(4, y, T.COUNTER);
    setTile(5, y, T.COUNTER);
  }

  // Machines
  setTile(1, 3, T.PC);
  setTile(2, 3, T.PC);

  return {
    id: 'oaks_lab',
    name: "PROF. OAK's LAB",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'pallet_town', targetX: 10, targetY: 16 },
      { x: 5, y: H - 1, targetMap: 'pallet_town', targetX: 10, targetY: 16 },
    ],
    npcs: [
      {
        id: 'oak',
        x: 4, y: 3,
        spriteColor: 0xc0a080,
        direction: Direction.DOWN,
        dialogue: [
          'OAK: Ah, {PLAYER}!',
          'I have a POKeMON\nhere for you!',
          'This PIKACHU is quite\nenergetic!',
          "Go on! Take it with\nyou on your journey!",
        ],
      },
      {
        id: 'rival',
        x: 6, y: 5,
        spriteColor: 0x8080c0,
        direction: Direction.LEFT,
        dialogue: [
          "RIVAL: Heh, I got a\nPOKeMON too!",
          "Gramps gave me one!",
          "I'll beat you with it\nsometime!",
        ],
      },
      {
        id: 'lab_aide',
        x: 8, y: 6,
        spriteColor: 0xf0f0f0,
        direction: Direction.DOWN,
        dialogue: [
          "PROF. OAK is the\nauthority on POKeMON!",
          "Many trainers come to\nhim for advice.",
        ],
      },
    ],
  };
})();

export const ROUTE1: MapData = (() => {
  const W = 20, H = 30;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  // Main path
  fillRect(8, 0, 4, 30, T.PATH);

  // Trees on sides
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Tall grass patches
  fillRect(3, 5, 5, 3, T.TALL_GRASS);
  fillRect(12, 8, 5, 3, T.TALL_GRASS);
  fillRect(3, 14, 5, 4, T.TALL_GRASS);
  fillRect(12, 18, 5, 3, T.TALL_GRASS);
  fillRect(4, 23, 4, 3, T.TALL_GRASS);

  // Some ledges
  fillRect(3, 12, 5, 1, T.LEDGE);
  fillRect(12, 15, 6, 1, T.LEDGE);

  // Scattered trees
  setTile(5, 9, T.TREE);
  setTile(14, 5, T.TREE);
  setTile(6, 20, T.TREE);
  setTile(15, 22, T.TREE);

  // Sign
  setTile(7, 10, T.SIGN);

  return {
    id: 'route1',
    name: 'ROUTE 1',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South to Pallet Town
      { x: 8, y: H - 1, targetMap: 'pallet_town', targetX: 8, targetY: 2 },
      { x: 9, y: H - 1, targetMap: 'pallet_town', targetX: 9, targetY: 2 },
      { x: 10, y: H - 1, targetMap: 'pallet_town', targetX: 10, targetY: 2 },
      { x: 11, y: H - 1, targetMap: 'pallet_town', targetX: 11, targetY: 2 },
      // North to Viridian City
      { x: 8, y: 0, targetMap: 'viridian_city', targetX: 8, targetY: 27 },
      { x: 9, y: 0, targetMap: 'viridian_city', targetX: 9, targetY: 27 },
      { x: 10, y: 0, targetMap: 'viridian_city', targetX: 10, targetY: 27 },
      { x: 11, y: 0, targetMap: 'viridian_city', targetX: 11, targetY: 27 },
    ],
    npcs: [
      {
        id: 'route1_npc1',
        x: 12, y: 12,
        spriteColor: 0x60c060,
        direction: Direction.DOWN,
        dialogue: [
          "If your POKeMON is\nhurt, head to the",
          "POKeMON CENTER in\nVIRIDIAN CITY!",
        ],
      },
      {
        id: 'route1_potion',
        x: 5, y: 15,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'potion',
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 45 }, // Pidgey
        { speciesId: 19, minLevel: 2, maxLevel: 4, weight: 55 }, // Rattata
      ],
    },
  };
})();

export const VIRIDIAN_CITY: MapData = (() => {
  const W = 30, H = 28;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  // Border trees
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

  // Main roads
  fillRect(8, 2, 4, 26, T.PATH);
  fillRect(2, 14, 26, 2, T.PATH);

  // Pokemon Center (left side)
  fillRect(3, 8, 5, 4, T.BUILDING);
  setTile(5, 12, T.DOOR);
  // Red roof indicator
  setTile(4, 8, T.BUILDING);
  setTile(5, 8, T.BUILDING);
  setTile(6, 8, T.BUILDING);

  // Pokemart (right side)
  fillRect(18, 8, 5, 4, T.BUILDING);
  setTile(20, 12, T.DOOR);

  // Viridian Gym (locked initially)
  fillRect(4, 18, 6, 5, T.BUILDING);
  setTile(7, 23, T.DOOR);

  // Houses
  fillRect(18, 18, 5, 4, T.BUILDING);
  setTile(20, 22, T.DOOR);

  // Water pond
  fillRect(14, 20, 3, 3, T.WATER);

  // Trees and flowers
  setTile(12, 6, T.FLOWER);
  setTile(13, 6, T.FLOWER);
  setTile(14, 6, T.FLOWER);
  setTile(16, 20, T.TREE);

  // Tall grass (west side)
  fillRect(3, 3, 4, 4, T.TALL_GRASS);

  // Signs
  setTile(7, 13, T.SIGN);
  setTile(12, 13, T.SIGN);

  return {
    id: 'viridian_city',
    name: 'VIRIDIAN CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South to Route 1
      { x: 8, y: H - 1, targetMap: 'route1', targetX: 8, targetY: 1 },
      { x: 9, y: H - 1, targetMap: 'route1', targetX: 9, targetY: 1 },
      { x: 10, y: H - 1, targetMap: 'route1', targetX: 10, targetY: 1 },
      { x: 11, y: H - 1, targetMap: 'route1', targetX: 11, targetY: 1 },
      // Pokemon Center door
      { x: 5, y: 12, targetMap: 'pokemon_center', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 20, y: 12, targetMap: 'pokemart', targetX: 3, targetY: 7 },
      // North to Route 2
      { x: 8, y: 1, targetMap: 'route2', targetX: 8, targetY: 28 },
      { x: 9, y: 1, targetMap: 'route2', targetX: 9, targetY: 28 },
      { x: 10, y: 1, targetMap: 'route2', targetX: 10, targetY: 28 },
      { x: 11, y: 1, targetMap: 'route2', targetX: 11, targetY: 28 },
      // Viridian Gym door
      { x: 7, y: 23, targetMap: 'viridian_gym', targetX: 4, targetY: 13 },
      // West to Route 22
      { x: 1, y: 14, targetMap: 'route22', targetX: 23, targetY: 4 },
      { x: 1, y: 15, targetMap: 'route22', targetX: 23, targetY: 5 },
    ],
    npcs: [
      {
        id: 'viridian_npc1',
        x: 13, y: 15,
        spriteColor: 0xc0c060,
        direction: Direction.DOWN,
        dialogue: [
          'VIRIDIAN CITY',
          'The Eternally Green\nParadise!',
        ],
      },
      {
        id: 'viridian_npc2',
        x: 15, y: 10,
        spriteColor: 0x60c0c0,
        direction: Direction.LEFT,
        dialogue: [
          "The POKEMON CENTER\nheals your POKeMON",
          "for free! Just talk\nto the nurse!",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 19, minLevel: 3, maxLevel: 5, weight: 40 }, // Rattata
        { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 30 }, // Pidgey
        { speciesId: 21, minLevel: 3, maxLevel: 5, weight: 30 }, // Spearow
      ],
    },
  };
})();

export const POKEMON_CENTER: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls
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
  setTile(4, 6, T.CARPET);
  setTile(5, 6, T.CARPET);
  setTile(4, 5, T.CARPET);
  setTile(5, 5, T.CARPET);

  return {
    id: 'pokemon_center',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'viridian_city', targetX: 5, targetY: 13 },
      { x: 5, y: H - 1, targetMap: 'viridian_city', targetX: 5, targetY: 13 },
    ],
    npcs: [
      {
        id: 'nurse_joy',
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

export const POKEMART: MapData = (() => {
  const W = 8, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Counter
  setTile(1, 3, T.COUNTER);
  setTile(2, 3, T.COUNTER);
  setTile(3, 3, T.COUNTER);

  // Shelves
  setTile(5, 2, T.MART_SHELF);
  setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF);
  setTile(6, 4, T.MART_SHELF);

  return {
    id: 'pokemart',
    name: 'POKeMON MART',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'viridian_city', targetX: 20, targetY: 13 },
    ],
    npcs: [
      {
        id: 'mart_clerk',
        x: 2, y: 2,
        spriteColor: 0x4080f0,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome! How may I\nserve you?',
        ],
        shopStock: ['poke_ball', 'potion', 'antidote', 'paralyze_heal', 'burn_heal'],
      },
    ],
  };
})();

export const ROUTE2: MapData = (() => {
  const W = 20, H = 30;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  // Main path
  fillRect(8, 0, 4, 30, T.PATH);

  // Border trees
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Vertical tree wall separating east section (requires Cut to pass)
  for (let y = 0; y < H; y++) {
    setTile(12, y, T.TREE);
  }
  // CUT_TREE gap — only way through the wall from the main path
  setTile(12, 13, T.CUT_TREE);

  // Tall grass (west side)
  fillRect(3, 4, 5, 4, T.TALL_GRASS);
  fillRect(4, 18, 4, 3, T.TALL_GRASS);
  // Tall grass (east section — shifted east of tree wall)
  fillRect(13, 10, 4, 4, T.TALL_GRASS);

  // Trees
  setTile(6, 10, T.TREE);
  setTile(14, 6, T.TREE);

  // Oak's Aide building (east section, behind tree wall)
  fillRect(13, 15, 4, 2, T.BUILDING);
  setTile(15, 17, T.DOOR);

  // Diglett's Cave entrance building (east section)
  fillRect(13, 22, 4, 2, T.BUILDING);
  setTile(15, 24, T.DOOR);

  return {
    id: 'route2',
    name: 'ROUTE 2',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South to Viridian
      { x: 8, y: H - 1, targetMap: 'viridian_city', targetX: 8, targetY: 2 },
      { x: 9, y: H - 1, targetMap: 'viridian_city', targetX: 9, targetY: 2 },
      { x: 10, y: H - 1, targetMap: 'viridian_city', targetX: 10, targetY: 2 },
      { x: 11, y: H - 1, targetMap: 'viridian_city', targetX: 11, targetY: 2 },
      // North to Viridian Forest / Pewter
      { x: 8, y: 0, targetMap: 'viridian_forest', targetX: 13, targetY: 42 },
      { x: 9, y: 0, targetMap: 'viridian_forest', targetX: 14, targetY: 42 },
      { x: 10, y: 0, targetMap: 'viridian_forest', targetX: 15, targetY: 42 },
      { x: 11, y: 0, targetMap: 'viridian_forest', targetX: 16, targetY: 42 },
      // Oak's Aide house door
      { x: 15, y: 17, targetMap: 'oaks_aide_house', targetX: 3, targetY: 6 },
      // Diglett's Cave entrance door
      { x: 15, y: 24, targetMap: 'digletts_cave', targetX: 6, targetY: 1 },
    ],
    npcs: [],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 16, minLevel: 3, maxLevel: 5, weight: 35 }, // Pidgey
        { speciesId: 19, minLevel: 3, maxLevel: 5, weight: 35 }, // Rattata
        { speciesId: 10, minLevel: 3, maxLevel: 5, weight: 15 }, // Caterpie
        { speciesId: 13, minLevel: 3, maxLevel: 5, weight: 15 }, // Weedle
      ],
    },
  };
})();

export const OAKS_AIDE_HOUSE: MapData = (() => {
  const W = 6, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Door at bottom
  setTile(3, H - 1, T.DOOR);

  return {
    id: 'oaks_aide_house',
    name: "OAK's AIDE's HOUSE",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'route2', targetX: 15, targetY: 18 },
    ],
    npcs: [
      {
        id: 'oaks_aide_route2',
        x: 3, y: 3,
        spriteColor: 0x60a0f0,
        direction: Direction.DOWN,
        dialogue: [
          "OAK's AIDE: Prof. OAK\nordered me to give\nthis to you!",
          "It's an HM that\nteaches FLASH!",
        ],
      },
    ],
  };
})();

export const VIRIDIAN_FOREST: MapData = (() => {
  const W = 30, H = 45;
  // Start with dense trees everywhere, then carve corridors
  const tiles = fill2D(W, H, T.TREE);
  const collision = fill2D(W, H, true);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  // === CARVE MAZE CORRIDORS ===

  // South entrance corridor (4 wide to match Route 2 path width)
  fillRect(13, 40, 4, 5, T.GRASS);
  // South clearing
  fillRect(9, 37, 12, 5, T.GRASS);
  // Dead end west of south clearing (for item)
  fillRect(4, 38, 6, 4, T.GRASS);

  // East path from south clearing
  fillRect(19, 34, 7, 4, T.GRASS);
  // Northeast corridor going north
  fillRect(23, 24, 3, 12, T.GRASS);
  // East alcove dead end (for item)
  fillRect(24, 28, 3, 3, T.GRASS);

  // Middle east-west corridor
  fillRect(4, 22, 22, 3, T.GRASS);
  // South dead end from middle corridor (for item)
  fillRect(4, 24, 3, 7, T.GRASS);

  // Northwest corridor going north
  fillRect(4, 14, 3, 9, T.GRASS);
  // Upper east-west corridor
  fillRect(4, 12, 19, 3, T.GRASS);
  // Central dead end south from upper corridor (for item)
  fillRect(12, 14, 3, 7, T.GRASS);

  // Upper northeast corridor going north
  fillRect(20, 5, 3, 9, T.GRASS);
  // Top east-west corridor
  fillRect(4, 3, 19, 3, T.GRASS);
  // North exit corridor (2 wide)
  fillRect(5, 0, 2, 4, T.GRASS);

  // === TALL GRASS PATCHES ===
  fillRect(11, 38, 4, 3, T.TALL_GRASS);
  fillRect(21, 35, 4, 2, T.TALL_GRASS);
  fillRect(23, 28, 3, 3, T.TALL_GRASS);
  fillRect(10, 22, 6, 3, T.TALL_GRASS);
  fillRect(4, 17, 3, 4, T.TALL_GRASS);
  fillRect(8, 12, 5, 3, T.TALL_GRASS);
  fillRect(20, 8, 3, 4, T.TALL_GRASS);
  fillRect(10, 3, 5, 3, T.TALL_GRASS);
  fillRect(4, 27, 3, 4, T.TALL_GRASS);
  fillRect(12, 16, 3, 4, T.TALL_GRASS);

  // === PATH markers at entrance/exit ===
  fillRect(14, 41, 2, 3, T.PATH);
  fillRect(5, 1, 2, 3, T.PATH);

  return {
    id: 'viridian_forest',
    name: 'VIRIDIAN FOREST',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South exit to Route 2
      { x: 13, y: 44, targetMap: 'route2', targetX: 8, targetY: 1 },
      { x: 14, y: 44, targetMap: 'route2', targetX: 9, targetY: 1 },
      { x: 15, y: 44, targetMap: 'route2', targetX: 10, targetY: 1 },
      { x: 16, y: 44, targetMap: 'route2', targetX: 11, targetY: 1 },
      // North exit to Pewter City
      { x: 5, y: 0, targetMap: 'pewter_city', targetX: 9, targetY: 24 },
      { x: 6, y: 0, targetMap: 'pewter_city', targetX: 10, targetY: 24 },
    ],
    npcs: [
      // 6 Trainers
      {
        id: 'forest_trainer1',
        x: 20, y: 36,
        spriteColor: 0x90c090,
        direction: Direction.RIGHT,
        dialogue: [
          'BUG CATCHER: Hey!\nYou have POKeMON!',
          "Come on, let's battle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'forest_trainer2',
        x: 24, y: 32,
        spriteColor: 0x90c090,
        direction: Direction.LEFT,
        dialogue: [
          'BUG CATCHER: I just\ncaught a CATERPIE!',
          "Isn't it cute?",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'forest_trainer3',
        x: 5, y: 26,
        spriteColor: 0x90c090,
        direction: Direction.DOWN,
        dialogue: [
          'BUG CATCHER: Did you\nget lost in here too?',
          "Let's battle to pass\nthe time!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'forest_trainer4',
        x: 16, y: 13,
        spriteColor: 0x90c090,
        direction: Direction.LEFT,
        dialogue: [
          'BUG CATCHER: These\nwoods are full of',
          'bug POKeMON!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'forest_trainer5',
        x: 15, y: 39,
        spriteColor: 0xd09040,
        direction: Direction.UP,
        dialogue: [
          'LASS: This forest is\nso pretty!',
          "But I won't let you\npass without a battle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'forest_trainer6',
        x: 21, y: 7,
        spriteColor: 0x90c090,
        direction: Direction.DOWN,
        dialogue: [
          'BUG CATCHER: I found\na PIKACHU in here!',
          "They're super rare!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // 5 Item balls
      {
        id: 'forest_poke_ball',
        x: 5, y: 29,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'poke_ball',
      },
      {
        id: 'forest_potion1',
        x: 6, y: 40,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'potion',
      },
      {
        id: 'forest_potion2',
        x: 13, y: 19,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'potion',
      },
      {
        id: 'forest_antidote1',
        x: 26, y: 29,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'antidote',
      },
      {
        id: 'forest_antidote2',
        x: 18, y: 4,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'antidote',
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 10, minLevel: 3, maxLevel: 6, weight: 30 }, // Caterpie
        { speciesId: 13, minLevel: 3, maxLevel: 6, weight: 25 }, // Weedle
        { speciesId: 25, minLevel: 3, maxLevel: 5, weight: 5 },  // Pikachu (rare in Yellow)
        { speciesId: 11, minLevel: 4, maxLevel: 6, weight: 15 }, // Metapod
        { speciesId: 14, minLevel: 4, maxLevel: 6, weight: 15 }, // Kakuna
        { speciesId: 16, minLevel: 4, maxLevel: 6, weight: 10 }, // Pidgey
      ],
    },
  };
})();

export const PEWTER_CITY: MapData = (() => {
  const W = 25, H = 26;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  // Border trees
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

  // Main roads
  fillRect(8, 2, 4, 24, T.PATH);
  fillRect(2, 12, 21, 2, T.PATH);

  // Pewter Gym
  fillRect(4, 4, 6, 5, T.BUILDING);
  setTile(7, 9, T.DOOR);

  // Pokemon Center
  fillRect(14, 4, 5, 4, T.BUILDING);
  setTile(16, 8, T.DOOR);

  // Museum (top)
  fillRect(14, 10, 7, 3, T.BUILDING);

  // Pokemart
  fillRect(14, 16, 5, 4, T.BUILDING);
  setTile(16, 20, T.DOOR);

  // Houses
  fillRect(3, 16, 5, 4, T.BUILDING);
  setTile(5, 20, T.DOOR);

  // Flowers
  setTile(12, 6, T.FLOWER);
  setTile(13, 6, T.FLOWER);
  setTile(12, 7, T.FLOWER);

  // Signs
  setTile(7, 12, T.SIGN);
  setTile(3, 9, T.SIGN);

  return {
    id: 'pewter_city',
    name: 'PEWTER CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South to Viridian Forest
      { x: 8, y: H - 1, targetMap: 'viridian_forest', targetX: 5, targetY: 2 },
      { x: 9, y: H - 1, targetMap: 'viridian_forest', targetX: 5, targetY: 2 },
      { x: 10, y: H - 1, targetMap: 'viridian_forest', targetX: 6, targetY: 2 },
      { x: 11, y: H - 1, targetMap: 'viridian_forest', targetX: 6, targetY: 2 },
      // Gym
      { x: 7, y: 9, targetMap: 'pewter_gym', targetX: 4, targetY: 13 },
      // Pokemon Center
      { x: 16, y: 8, targetMap: 'pokemon_center_pewter', targetX: 4, targetY: 7 },
      // East to Route 3 (upper lane entry)
      { x: W - 2, y: 12, targetMap: 'route3', targetX: 1, targetY: 3 },
      { x: W - 2, y: 13, targetMap: 'route3', targetX: 1, targetY: 4 },
    ],
    npcs: [
      {
        id: 'pewter_npc1',
        x: 12, y: 13,
        spriteColor: 0xb0a090,
        direction: Direction.DOWN,
        dialogue: [
          'PEWTER CITY',
          'A Stone Gray City!',
        ],
      },
      {
        id: 'pewter_npc2',
        x: 5, y: 12,
        spriteColor: 0x80c080,
        direction: Direction.RIGHT,
        dialogue: [
          "BROCK is PEWTER GYM's\nleader!",
          "He uses ROCK-type\nPOKeMON!",
        ],
      },
      {
        id: 'pewter_guide',
        x: 21, y: 12,
        spriteColor: 0xe0c060,
        direction: Direction.LEFT,
        dialogue: [
          "Hey! You're not going\nto ROUTE 3 without",
          "going to the GYM,\nare you?",
          "You should challenge\nBROCK first!",
        ],
      },
    ],
  };
})();

export const PEWTER_GYM: MapData = (() => {
  const W = 10, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Arena floor
  for (let x = 2; x < W - 2; x++) {
    for (let y = 3; y < 11; y++) {
      tiles[y][x] = T.SAND;
    }
  }

  // Gym statue/rocks
  setTile(2, 5, T.WALL);
  setTile(7, 5, T.WALL);
  setTile(2, 8, T.WALL);
  setTile(7, 8, T.WALL);

  return {
    id: 'pewter_gym',
    name: 'PEWTER GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'pewter_city', targetX: 7, targetY: 10 },
      { x: 5, y: H - 1, targetMap: 'pewter_city', targetX: 7, targetY: 10 },
    ],
    npcs: [
      {
        id: 'brock',
        x: 4, y: 3,
        spriteColor: 0xb08050,
        direction: Direction.DOWN,
        dialogue: [
          "BROCK: I'm BROCK!",
          "I'm PEWTER's GYM\nLEADER!",
          "My rock-hard willpower\nis evident in my",
          "POKeMON! Let's battle!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'pewter_gym_trainer',
        x: 3, y: 9,
        spriteColor: 0x909090,
        direction: Direction.UP,
        dialogue: [
          "Stop right there!\nYou're light years",
          "away from facing\nBROCK!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// Pokemon Center (Pewter variant - same layout)
export const POKEMON_CENTER_PEWTER: MapData = (() => {
  const base = JSON.parse(JSON.stringify(POKEMON_CENTER)) as MapData;
  base.id = 'pokemon_center_pewter';
  base.warps = [
    { x: 4, y: base.height - 1, targetMap: 'pewter_city', targetX: 16, targetY: 9 },
    { x: 5, y: base.height - 1, targetMap: 'pewter_city', targetX: 16, targetY: 9 },
  ];
  return base;
})();

export const ROUTE3: MapData = (() => {
  const W = 50, H = 18;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  // ── Borders ──
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, H - 1, T.TREE);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(W - 1, y, T.TREE);
  }
  // Bottom second row of trees for thicker border
  for (let x = 0; x < 38; x++) {
    setTile(x, H - 2, T.TREE);
  }

  // ── UPPER LANE (y=2-4) ──
  // Main upper path
  fillRect(1, 3, 37, 2, T.PATH);
  // Tall grass above the path
  fillRect(3, 1, 4, 2, T.TALL_GRASS);
  fillRect(12, 1, 3, 2, T.TALL_GRASS);
  fillRect(20, 1, 4, 2, T.TALL_GRASS);
  fillRect(29, 1, 3, 2, T.TALL_GRASS);
  // Tree obstacles within upper lane creating narrow passages
  setTile(7, 3, T.TREE);   // forces player to y=4 near trainer 1
  setTile(8, 4, T.TREE);   // then back to y=3
  setTile(16, 4, T.TREE);  // narrows path to y=3 near trainer 2
  setTile(24, 4, T.TREE);  // narrows path near trainer 3
  setTile(25, 3, T.TREE);  // forces player to y=4
  setTile(33, 4, T.TREE);  // narrows path before east section

  // ── BARRIER: upper→middle (y=5) ── trees + ledges
  fillRect(1, 5, 7, 1, T.TREE);
  fillRect(8, 5, 4, 1, T.LEDGE);
  fillRect(12, 5, 6, 1, T.TREE);
  fillRect(18, 5, 4, 1, T.LEDGE);
  fillRect(22, 5, 6, 1, T.TREE);
  fillRect(28, 5, 4, 1, T.LEDGE);
  fillRect(32, 5, 6, 1, T.TREE);

  // ── MIDDLE LANE (y=6-9) ──
  // Landing zone grass (y=6)
  fillRect(8, 6, 4, 1, T.PATH);
  fillRect(18, 6, 4, 1, T.PATH);
  fillRect(28, 6, 4, 1, T.PATH);
  // Tall grass patches in middle zone
  fillRect(3, 6, 4, 2, T.TALL_GRASS);
  fillRect(13, 7, 4, 1, T.TALL_GRASS);
  fillRect(23, 7, 4, 1, T.TALL_GRASS);
  fillRect(33, 6, 4, 2, T.TALL_GRASS);
  // Main middle path
  fillRect(1, 8, 37, 2, T.PATH);
  // Tree obstacles in middle lane
  setTile(10, 8, T.TREE);  // narrows to y=9 near trainer 5
  setTile(20, 9, T.TREE);  // narrows to y=8 near trainer 6
  setTile(30, 8, T.TREE);  // narrows to y=9

  // ── BARRIER: middle→lower (y=10) ── trees + ledges
  fillRect(1, 10, 9, 1, T.TREE);
  fillRect(10, 10, 4, 1, T.LEDGE);
  fillRect(14, 10, 6, 1, T.TREE);
  fillRect(20, 10, 4, 1, T.LEDGE);
  fillRect(24, 10, 6, 1, T.TREE);
  fillRect(30, 10, 4, 1, T.LEDGE);
  fillRect(34, 10, 4, 1, T.TREE);

  // ── LOWER LANE (y=11-15) ──
  // Landing zone
  fillRect(10, 11, 4, 1, T.PATH);
  fillRect(20, 11, 4, 1, T.PATH);
  fillRect(30, 11, 4, 1, T.PATH);
  // Tall grass in lower area
  fillRect(3, 11, 5, 2, T.TALL_GRASS);
  fillRect(15, 12, 4, 1, T.TALL_GRASS);
  fillRect(25, 11, 4, 2, T.TALL_GRASS);
  // Lower path
  fillRect(2, 13, 36, 2, T.PATH);
  // Tall grass below lower path
  fillRect(5, 15, 4, 1, T.TALL_GRASS);
  fillRect(18, 15, 3, 1, T.TALL_GRASS);
  fillRect(30, 15, 4, 1, T.TALL_GRASS);
  // Tree obstacles in lower lane
  setTile(9, 13, T.TREE);   // narrows to y=14
  setTile(19, 14, T.TREE);  // narrows to y=13 near trainer 7
  setTile(27, 13, T.TREE);  // narrows to y=14 near trainer 8

  // ── EAST SECTION (x=38-48): convergence + Pokemon Center ──
  // Vertical connecting path on east side
  fillRect(38, 2, 2, 14, T.PATH);
  // Clear the tree border in the east section
  for (let y = 1; y < H - 1; y++) {
    setTile(W - 1, y, T.TREE);
  }
  // Pokemon Center building
  fillRect(42, 1, 5, 4, T.BUILDING);
  setTile(44, 5, T.DOOR);
  // Path in front of Pokemon Center (don't overwrite building bottom row)
  fillRect(40, 5, 4, 1, T.PATH);
  // East path to Mt. Moon exit
  fillRect(38, 8, 11, 2, T.PATH);
  // Clear right border for exit
  setTile(W - 1, 8, T.TREE);
  setTile(W - 1, 9, T.TREE);
  // Sign near Pokemon Center
  setTile(41, 6, T.SIGN);
  // Flowers near Pokemon Center
  setTile(41, 5, T.FLOWER);
  setTile(46, 5, T.FLOWER);
  // Close off bottom of east section with trees
  for (let x = 38; x < W - 1; x++) {
    setTile(x, H - 2, T.TREE);
  }
  // Trees to frame the east area
  fillRect(40, 11, 1, 4, T.TREE);
  fillRect(47, 2, 1, 6, T.TREE);
  fillRect(47, 10, 1, 5, T.TREE);

  return {
    id: 'route3',
    name: 'ROUTE 3',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West to Pewter (entry at upper lane)
      { x: 0, y: 3, targetMap: 'pewter_city', targetX: 22, targetY: 12 },
      { x: 0, y: 4, targetMap: 'pewter_city', targetX: 22, targetY: 13 },
      // East to Mt. Moon 1F (south entrance)
      { x: W - 1, y: 8, targetMap: 'mt_moon', targetX: 6, targetY: 24 },
      { x: W - 1, y: 9, targetMap: 'mt_moon', targetX: 6, targetY: 24 },
      // Pokemon Center
      { x: 44, y: 5, targetMap: 'pokemon_center_route3', targetX: 4, targetY: 7 },
    ],
    npcs: [
      // ── UPPER LANE TRAINERS ──
      // Trainer 1: Youngster near west entry, facing left to catch players
      {
        id: 'route3_trainer1',
        x: 5, y: 4,
        spriteColor: 0xc08060,
        direction: Direction.LEFT,
        dialogue: [
          "YOUNGSTER: I just\nlost to BROCK!",
          "I need to train\nharder!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // Trainer 2: Bug Catcher in narrow passage
      {
        id: 'route3_trainer2',
        x: 14, y: 3,
        spriteColor: 0x80c080,
        direction: Direction.DOWN,
        dialogue: [
          'BUG CATCHER: Go, my\nbugs! Get him!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // Trainer 3: Lass further east on upper path
      {
        id: 'route3_trainer3',
        x: 22, y: 3,
        spriteColor: 0xf08080,
        direction: Direction.RIGHT,
        dialogue: [
          'LASS: I just caught\na new POKeMON!',
          "Let me try it\nout on you!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // Trainer 4: Bug Catcher guarding upper lane before east section
      {
        id: 'route3_trainer4',
        x: 30, y: 4,
        spriteColor: 0x80c080,
        direction: Direction.LEFT,
        dialogue: [
          "BUG CATCHER: Heh!\nAre you scared of",
          'bugs? You should be!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      // ── MIDDLE LANE TRAINERS ──
      // Trainer 5: Youngster on middle path
      {
        id: 'route3_trainer5',
        x: 15, y: 9,
        spriteColor: 0xc08060,
        direction: Direction.UP,
        dialogue: [
          'YOUNGSTER: My\nSPEAROW is the best!',
          "There's no way\nyou can beat it!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // Trainer 6: Bug Catcher on middle path
      {
        id: 'route3_trainer6',
        x: 25, y: 8,
        spriteColor: 0x80c080,
        direction: Direction.DOWN,
        dialogue: [
          "BUG CATCHER: I'm\nraising CATERPIE",
          "to be a mighty\nBUTTERFREE!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // ── LOWER LANE TRAINERS ──
      // Trainer 7: Lass on lower path
      {
        id: 'route3_trainer7',
        x: 14, y: 13,
        spriteColor: 0xf08080,
        direction: Direction.RIGHT,
        dialogue: [
          'LASS: You look like\na new trainer!',
          "I'll go easy on you!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // Trainer 8: Bug Catcher near east end of lower path
      {
        id: 'route3_trainer8',
        x: 33, y: 14,
        spriteColor: 0x80c080,
        direction: Direction.LEFT,
        dialogue: [
          "BUG CATCHER: Bugs\nare the best",
          "POKeMON! I'll prove\nit to you!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 21, minLevel: 6, maxLevel: 9, weight: 30 }, // Spearow
        { speciesId: 27, minLevel: 6, maxLevel: 8, weight: 20 }, // Sandshrew
        { speciesId: 39, minLevel: 5, maxLevel: 8, weight: 15 }, // Jigglypuff
        { speciesId: 56, minLevel: 7, maxLevel: 9, weight: 20 }, // Mankey
        { speciesId: 23, minLevel: 6, maxLevel: 8, weight: 15 }, // Ekans (sub for Nidoran)
      ],
    },
  };
})();

// Route 3 Pokemon Center (same layout, different exit)
export const POKEMON_CENTER_ROUTE3: MapData = (() => {
  const base = JSON.parse(JSON.stringify(POKEMON_CENTER)) as MapData;
  base.id = 'pokemon_center_route3';
  base.warps = [
    { x: 4, y: base.height - 1, targetMap: 'route3', targetX: 44, targetY: 6 },
    { x: 5, y: base.height - 1, targetMap: 'route3', targetX: 44, targetY: 6 },
  ];
  return base;
})();

// Viridian Gym (Giovanni - 8th gym, Ground type)
export const VIRIDIAN_GYM: MapData = (() => {
  const W = 10, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = SOLID_TILES.has(type);
    }
  }

  // Walls
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // Arena floor (earthy)
  for (let x = 2; x < W - 2; x++) {
    for (let y = 3; y < 11; y++) {
      tiles[y][x] = T.SAND;
    }
  }

  // Gym obstacle walls
  setTile(2, 5, T.WALL);
  setTile(7, 5, T.WALL);
  setTile(4, 7, T.WALL);
  setTile(5, 7, T.WALL);
  setTile(2, 9, T.WALL);
  setTile(7, 9, T.WALL);

  return {
    id: 'viridian_gym',
    name: 'VIRIDIAN GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'viridian_city', targetX: 7, targetY: 24 },
      { x: 5, y: H - 1, targetMap: 'viridian_city', targetX: 7, targetY: 24 },
    ],
    npcs: [
      {
        id: 'giovanni',
        x: 4, y: 3,
        spriteColor: 0x604020,
        direction: Direction.DOWN,
        dialogue: [
          "GIOVANNI: So! You've\ncome this far!",
          "Let me show you the\npower of TEAM ROCKET's",
          "boss!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'viridian_gym_trainer1',
        x: 3, y: 6,
        spriteColor: 0x404040,
        direction: Direction.RIGHT,
        dialogue: [
          "COOLTRAINER: You think\nyou can beat GIOVANNI?",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'viridian_gym_trainer2',
        x: 6, y: 9,
        spriteColor: 0x404040,
        direction: Direction.LEFT,
        dialogue: [
          "COOLTRAINER: This is\nthe last GYM! Give",
          "it everything\nyou've got!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// Map registry
export const ALL_MAPS: Record<string, MapData> = {
  // Pallet Town - Pewter City area
  pallet_town: PALLET_TOWN,
  player_house: PLAYER_HOUSE,
  rival_house: RIVAL_HOUSE,
  oaks_lab: OAKS_LAB,
  route1: ROUTE1,
  viridian_city: VIRIDIAN_CITY,
  pokemon_center: POKEMON_CENTER,
  pokemart: POKEMART,
  viridian_gym: VIRIDIAN_GYM,
  route2: ROUTE2,
  oaks_aide_house: OAKS_AIDE_HOUSE,
  viridian_forest: VIRIDIAN_FOREST,
  pewter_city: PEWTER_CITY,
  pewter_gym: PEWTER_GYM,
  pokemon_center_pewter: POKEMON_CENTER_PEWTER,
  route3: ROUTE3,
  pokemon_center_route3: POKEMON_CENTER_ROUTE3,
  // All remaining Kanto maps
  ...CERULEAN_MAPS,
  ...VERMILION_MAPS,
  ...CENTRAL_MAPS,
  ...SOUTH_MAPS,
  ...ENDGAME_MAPS,
};
