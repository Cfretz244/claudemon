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

// ─── ROUTE 12 ──────────────────────────────────────────────────────────────────
export const ROUTE12: MapData = (() => {
  const W = 15, H = 25;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Vertical path
  fillRect(6, 0, 3, 25, T.PATH);

  // Tree borders (2 tiles on each side)
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Water on the east side (fishing coast)
  fillRect(10, 5, 5, 15, T.WATER);

  // Tall grass patches
  fillRect(2, 8, 4, 3, T.TALL_GRASS);
  fillRect(2, 14, 4, 3, T.TALL_GRASS);
  fillRect(2, 20, 4, 3, T.TALL_GRASS);

  // Ledges
  fillRect(2, 12, 4, 1, T.LEDGE);
  fillRect(2, 18, 4, 1, T.LEDGE);

  // Three-row barrier around Snorlax — blocks both north and south
  // Rows 3 and 5: full tree walls with only column 7 open (for post-Snorlax travel)
  for (let x = 2; x < W - 2; x++) {
    if (x !== 7) { setTile(x, 3, T.TREE); setTile(x, 5, T.TREE); }
  }
  // Row 4: trees on east side, horizontal corridor on west side for gate entrance
  for (let x = 8; x < W - 2; x++) { setTile(x, 4, T.TREE); }
  // Gate corridor: path from west edge through tree border to column 6
  fillRect(0, 4, 7, 1, T.PATH);

  return {
    id: 'route12',
    name: 'ROUTE 12',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North entrance from Lavender Town
      { x: 7, y: 0, targetMap: 'lavender_town', targetX: 9, targetY: 18 },
      // West entrance from Route 11 Gate (corridor at Snorlax barrier row)
      { x: 0, y: 4, targetMap: 'route11_gate', targetX: 6, targetY: 2 },
      // South exit to Route 13 (east side)
      { x: 7, y: 24, targetMap: 'route13', targetX: 23, targetY: 5 },
    ],
    npcs: [
      {
        id: 'snorlax_route12',
        x: 7, y: 4,
        spriteColor: 0x304060,
        direction: Direction.DOWN,
        dialogue: [
          "A huge POKeMON is\nblocking the path!",
          "It's sleeping soundly...",
          'Zzz... Zzz...',
        ],
      },
      {
        id: 'route12_super_potion',
        x: 4, y: 6,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'super_potion',
      },
      {
        id: 'route12_trainer1',
        x: 4, y: 9,
        spriteColor: 0xa06060,
        direction: Direction.RIGHT,
        dialogue: [
          'FISHER: The fish are\nbiting today!',
          "Let's see if you can\nreel in a win!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route12_trainer2',
        x: 4, y: 15,
        spriteColor: 0x60a060,
        direction: Direction.RIGHT,
        dialogue: [
          'FISHER: I love fishing\non this route!',
          "Battle me while we\nwait for a bite!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route12_trainer3',
        x: 4, y: 21,
        spriteColor: 0x6060a0,
        direction: Direction.RIGHT,
        dialogue: [
          "FISHER: I've been here\nall day!",
          "I'll battle anyone who\ncomes by!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // Fishing Guru - gives Good Rod
      {
        id: 'fishing_guru_route12',
        x: 9, y: 10,
        spriteColor: 0x8080c0,
        direction: Direction.RIGHT,
        dialogue: [
          "FISHING GURU: I'm the\nbest fisher on this\nroute!",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 43, minLevel: 22, maxLevel: 26, weight: 20 },  // Oddish
        { speciesId: 48, minLevel: 22, maxLevel: 26, weight: 20 },  // Venonat
        { speciesId: 16, minLevel: 22, maxLevel: 24, weight: 15 },  // Pidgey
        { speciesId: 44, minLevel: 24, maxLevel: 26, weight: 15 },  // Gloom
        { speciesId: 70, minLevel: 24, maxLevel: 26, weight: 15 },  // Weepinbell
        { speciesId: 83, minLevel: 22, maxLevel: 24, weight: 15 },  // Farfetch'd
      ],
    },
  };
})();

// ─── ROUTE 13 ──────────────────────────────────────────────────────────────────
export const ROUTE13: MapData = (() => {
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

  // Tree borders top and bottom
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, 1, T.TREE);
    setTile(x, H - 1, T.TREE);
    setTile(x, H - 2, T.TREE);
  }

  // Fence on edges
  for (let x = 0; x < W; x++) {
    setTile(x, 2, T.FENCE);
    setTile(x, H - 3, T.FENCE);
  }

  // Tall grass patches
  fillRect(5, 3, 4, 1, T.TALL_GRASS);
  fillRect(14, 3, 4, 1, T.TALL_GRASS);
  fillRect(8, 6, 4, 1, T.TALL_GRASS);
  fillRect(18, 6, 4, 1, T.TALL_GRASS);

  return {
    id: 'route13',
    name: 'ROUTE 13',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit to Route 14
      { x: 0, y: 4, targetMap: 'route14', targetX: 7, targetY: 1 },
      { x: 0, y: 5, targetMap: 'route14', targetX: 7, targetY: 1 },
      // East entrance from Route 12
      { x: 24, y: 4, targetMap: 'route12', targetX: 7, targetY: 23 },
      { x: 24, y: 5, targetMap: 'route12', targetX: 7, targetY: 23 },
    ],
    npcs: [
      {
        id: 'route13_trainer1',
        x: 10, y: 3,
        spriteColor: 0xc08060,
        direction: Direction.DOWN,
        dialogue: [
          'BIRD KEEPER: My birds\nwill peck you to bits!',
          "Don't underestimate\nflying types!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route13_trainer2',
        x: 18, y: 6,
        spriteColor: 0xa060a0,
        direction: Direction.UP,
        dialogue: [
          'BEAUTY: Aren\'t my\nPOKeMON just lovely?',
          "Let's have a beautiful\nbattle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 16, minLevel: 25, maxLevel: 27, weight: 20 },   // Pidgey
        { speciesId: 43, minLevel: 22, maxLevel: 26, weight: 20 },   // Oddish
        { speciesId: 48, minLevel: 24, maxLevel: 28, weight: 20 },   // Venonat
        { speciesId: 132, minLevel: 25, maxLevel: 28, weight: 15 },  // Ditto
        { speciesId: 44, minLevel: 25, maxLevel: 27, weight: 15 },   // Gloom
        { speciesId: 70, minLevel: 25, maxLevel: 27, weight: 10 },   // Weepinbell
      ],
    },
  };
})();

// ─── ROUTE 14 ──────────────────────────────────────────────────────────────────
export const ROUTE14: MapData = (() => {
  const W = 15, H = 20;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Vertical path
  fillRect(6, 0, 3, 20, T.PATH);

  // Tree borders on sides
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Tall grass patches
  fillRect(2, 4, 4, 3, T.TALL_GRASS);
  fillRect(9, 8, 4, 3, T.TALL_GRASS);
  fillRect(2, 13, 4, 3, T.TALL_GRASS);

  return {
    id: 'route14',
    name: 'ROUTE 14',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North entrance from Route 13
      { x: 7, y: 0, targetMap: 'route13', targetX: 1, targetY: 4 },
      // South exit to Route 15 (east side)
      { x: 7, y: 19, targetMap: 'route15', targetX: 23, targetY: 5 },
    ],
    npcs: [
      {
        id: 'route14_trainer1',
        x: 4, y: 6,
        spriteColor: 0x60c0c0,
        direction: Direction.RIGHT,
        dialogue: [
          'BIRD KEEPER: I train\nmy birds on this route!',
          "They'll blow you away!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route14_trainer2',
        x: 10, y: 14,
        spriteColor: 0xc06060,
        direction: Direction.LEFT,
        dialogue: [
          "BIKER: You think you're\ntough?",
          "Let's see you handle\nmy POKeMON!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 132, minLevel: 25, maxLevel: 30, weight: 15 },  // Ditto
        { speciesId: 17, minLevel: 28, maxLevel: 30, weight: 15 },   // Pidgeotto
        { speciesId: 48, minLevel: 25, maxLevel: 28, weight: 20 },   // Venonat
        { speciesId: 44, minLevel: 26, maxLevel: 28, weight: 20 },   // Gloom
        { speciesId: 43, minLevel: 24, maxLevel: 28, weight: 15 },   // Oddish
        { speciesId: 70, minLevel: 26, maxLevel: 28, weight: 15 },   // Weepinbell
      ],
    },
  };
})();

// ─── ROUTE 15 ──────────────────────────────────────────────────────────────────
export const ROUTE15: MapData = (() => {
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

  // Tree borders
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, 1, T.TREE);
    setTile(x, H - 1, T.TREE);
    setTile(x, H - 2, T.TREE);
  }

  // Tall grass patches
  fillRect(4, 2, 4, 2, T.TALL_GRASS);
  fillRect(12, 6, 5, 2, T.TALL_GRASS);
  fillRect(20, 2, 3, 2, T.TALL_GRASS);

  return {
    id: 'route15',
    name: 'ROUTE 15',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit to Fuchsia City
      { x: 0, y: 4, targetMap: 'fuchsia_city', targetX: 22, targetY: 12 },
      { x: 0, y: 5, targetMap: 'fuchsia_city', targetX: 22, targetY: 12 },
      // East entrance from Route 14
      { x: 24, y: 4, targetMap: 'route14', targetX: 7, targetY: 18 },
      { x: 24, y: 5, targetMap: 'route14', targetX: 7, targetY: 18 },
    ],
    npcs: [
      {
        id: 'route15_trainer1',
        x: 8, y: 3,
        spriteColor: 0xc0a060,
        direction: Direction.DOWN,
        dialogue: [
          "JR. TRAINER: I'm on my\nway to FUCHSIA CITY!",
          "But first, a battle!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route15_trainer2',
        x: 16, y: 6,
        spriteColor: 0x60a0c0,
        direction: Direction.UP,
        dialogue: [
          'BEAUTY: I heard the\nSAFARI ZONE is nearby!',
          "Let's battle before I\ngo there!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 132, minLevel: 25, maxLevel: 30, weight: 15 },  // Ditto
        { speciesId: 17, minLevel: 28, maxLevel: 30, weight: 15 },   // Pidgeotto
        { speciesId: 48, minLevel: 25, maxLevel: 28, weight: 20 },   // Venonat
        { speciesId: 44, minLevel: 26, maxLevel: 28, weight: 20 },   // Gloom
        { speciesId: 43, minLevel: 24, maxLevel: 28, weight: 15 },   // Oddish
        { speciesId: 70, minLevel: 26, maxLevel: 28, weight: 15 },   // Weepinbell
      ],
    },
  };
})();

// ─── ROUTE 16 (Cycling Road North) ────────────────────────────────────────────
export const ROUTE16: MapData = (() => {
  const W = 15, H = 20;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Vertical path (cycling road)
  fillRect(6, 0, 3, 20, T.PATH);

  // Tree borders
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }
  // Cap the north end of the cycling road — Celadon has no southern exit
  setTile(6, 0, T.TREE); setTile(7, 0, T.TREE); setTile(8, 0, T.TREE);

  // Fence on sides of the cycling road
  for (let y = 0; y < H; y++) {
    setTile(5, y, T.FENCE);
    setTile(9, y, T.FENCE);
  }

  // Single-tile gap in east fence — Snorlax sits here blocking the cycling road
  setTile(9, 3, T.PATH);
  // Path connecting cycling road to east entrance
  fillRect(10, 2, 3, 2, T.PATH);

  // Ledges on the cycling road (one-way jumps going south).
  // Leave x=8 open as a return lane so players can walk back north.
  fillRect(6, 6, 2, 1, T.LEDGE);
  fillRect(6, 12, 2, 1, T.LEDGE);
  fillRect(6, 17, 2, 1, T.LEDGE);

  // Tall grass patches on west and east of the road
  fillRect(2, 4, 3, 3, T.TALL_GRASS);
  fillRect(10, 8, 3, 3, T.TALL_GRASS);
  fillRect(2, 14, 3, 3, T.TALL_GRASS);

  return {
    id: 'route16',
    name: 'ROUTE 16',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // East exit → Celadon City (only connection — Celadon has no southern exit)
      { x: 13, y: 2, targetMap: 'celadon_city', targetX: 2, targetY: 12 },
      { x: 13, y: 3, targetMap: 'celadon_city', targetX: 2, targetY: 13 },
      // South exit to Route 17
      { x: 7, y: 19, targetMap: 'route17', targetX: 7, targetY: 1 },
    ],
    npcs: [
      {
        id: 'snorlax_route16',
        x: 9, y: 3,
        spriteColor: 0x304060,
        direction: Direction.DOWN,
        dialogue: [
          "A huge POKeMON is\nblocking the path!",
          "It's sleeping soundly...",
          'Zzz... Zzz...',
        ],
      },
      {
        id: 'route16_fly_girl',
        x: 11, y: 5,
        spriteColor: 0xf070a0,
        direction: Direction.LEFT,
        dialogue: [
          "I love watching my\nPOKeMON fly!",
          "Here, you should have\nthis HM!",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 84, minLevel: 22, maxLevel: 26, weight: 30 },  // Doduo
        { speciesId: 19, minLevel: 22, maxLevel: 26, weight: 25 },  // Rattata
        { speciesId: 21, minLevel: 22, maxLevel: 26, weight: 20 },  // Spearow
        { speciesId: 20, minLevel: 24, maxLevel: 28, weight: 25 },  // Raticate
      ],
    },
  };
})();

// ─── ROUTE 17 (Cycling Road Main) ─────────────────────────────────────────────
export const ROUTE17: MapData = (() => {
  const W = 15, H = 30;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Wide cycling road path
  fillRect(5, 0, 5, 30, T.PATH);

  // Fence borders instead of trees
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.FENCE);
    setTile(1, y, T.FENCE);
    setTile(W - 1, y, T.FENCE);
    setTile(W - 2, y, T.FENCE);
    setTile(4, y, T.FENCE);
    setTile(10, y, T.FENCE);
  }

  // Grass strips alongside fences
  fillRect(2, 0, 2, 30, T.GRASS);
  fillRect(11, 0, 2, 30, T.GRASS);

  return {
    id: 'route17',
    name: 'ROUTE 17',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North entrance from Route 16
      { x: 7, y: 0, targetMap: 'route16', targetX: 7, targetY: 18 },
      // South exit to Route 18
      { x: 7, y: 29, targetMap: 'route18', targetX: 7, targetY: 1 },
    ],
    npcs: [
      {
        id: 'route17_biker1',
        x: 7, y: 5,
        spriteColor: 0xc04040,
        direction: Direction.DOWN,
        dialogue: [
          "BIKER: Outta my way,\nkid!",
          "This is our road!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'route17_biker2',
        x: 6, y: 12,
        spriteColor: 0x40c040,
        direction: Direction.DOWN,
        dialogue: [
          "BIKER: You got guts\nriding here!",
          "Let's see if your\nPOKeMON are as tough!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'route17_biker3',
        x: 8, y: 19,
        spriteColor: 0x4040c0,
        direction: Direction.UP,
        dialogue: [
          "BIKER: Heh heh heh!\nNo one passes without",
          "a battle!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'route17_biker4',
        x: 7, y: 25,
        spriteColor: 0xc0c040,
        direction: Direction.UP,
        dialogue: [
          "BIKER: I'm the fastest\non CYCLING ROAD!",
          "Battle me if you\ndisagree!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 84, minLevel: 24, maxLevel: 28, weight: 30 },  // Doduo
        { speciesId: 20, minLevel: 25, maxLevel: 29, weight: 20 },  // Raticate
        { speciesId: 85, minLevel: 26, maxLevel: 29, weight: 15 },  // Dodrio
        { speciesId: 22, minLevel: 25, maxLevel: 29, weight: 20 },  // Fearow
        { speciesId: 77, minLevel: 26, maxLevel: 28, weight: 15 },  // Ponyta
      ],
    },
  };
})();

// ─── ROUTE 18 (Cycling Road South) ────────────────────────────────────────────
export const ROUTE18: MapData = (() => {
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

  // Tree borders
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.TREE);
    setTile(x, 1, T.TREE);
    setTile(x, H - 1, T.TREE);
    setTile(x, H - 2, T.TREE);
  }

  // Tall grass patches
  fillRect(4, 2, 4, 2, T.TALL_GRASS);
  fillRect(12, 6, 4, 2, T.TALL_GRASS);

  return {
    id: 'route18',
    name: 'ROUTE 18',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance from Fuchsia City
      { x: 0, y: 4, targetMap: 'fuchsia_city', targetX: 2, targetY: 5 },
      { x: 0, y: 5, targetMap: 'fuchsia_city', targetX: 2, targetY: 5 },
      // East entrance from Route 17
      { x: 19, y: 4, targetMap: 'route17', targetX: 7, targetY: 28 },
      { x: 19, y: 5, targetMap: 'route17', targetX: 7, targetY: 28 },
    ],
    npcs: [],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 84, minLevel: 24, maxLevel: 28, weight: 30 },  // Doduo
        { speciesId: 20, minLevel: 25, maxLevel: 29, weight: 20 },  // Raticate
        { speciesId: 85, minLevel: 26, maxLevel: 29, weight: 15 },  // Dodrio
        { speciesId: 22, minLevel: 25, maxLevel: 29, weight: 20 },  // Fearow
        { speciesId: 77, minLevel: 26, maxLevel: 28, weight: 15 },  // Ponyta
      ],
    },
  };
})();

// ─── FUCHSIA CITY ──────────────────────────────────────────────────────────────
export const FUCHSIA_CITY: MapData = (() => {
  const W = 25, H = 25;
  const tiles = fill2D(W, H, T.GRASS);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
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

  // Main roads
  fillRect(10, 2, 4, 23, T.PATH);  // Vertical
  fillRect(2, 12, 21, 2, T.PATH);  // Horizontal

  // Fuchsia Gym
  fillRect(4, 5, 6, 1, T.ROOF);
  fillRect(4, 6, 6, 4, T.BUILDING);
  setTile(7, 9, T.DOOR);

  // Pokemon Center
  fillRect(16, 5, 5, 1, T.ROOF);
  fillRect(16, 6, 5, 3, T.BUILDING);
  setTile(18, 8, T.DOOR);

  // Safari Zone Gate (north)
  fillRect(10, 3, 5, 1, T.ROOF);
  fillRect(10, 4, 5, 2, T.BUILDING);
  setTile(12, 5, T.DOOR);

  // Pokemart
  fillRect(16, 16, 5, 1, T.ROOF);
  fillRect(16, 17, 5, 3, T.BUILDING);
  setTile(18, 19, T.DOOR);

  // Warden's House
  fillRect(4, 16, 5, 1, T.ROOF);
  fillRect(4, 17, 5, 3, T.BUILDING);
  setTile(6, 19, T.DOOR);

  // Flowers
  setTile(3, 8, T.FLOWER);
  setTile(3, 9, T.FLOWER);
  setTile(15, 8, T.FLOWER);
  setTile(15, 9, T.FLOWER);
  setTile(9, 16, T.FLOWER);
  setTile(15, 16, T.FLOWER);

  // Signs
  setTile(9, 12, T.SIGN);
  setTile(14, 12, T.SIGN);
  setTile(3, 10, T.SIGN);

  return {
    id: 'fuchsia_city',
    name: 'FUCHSIA CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Safari Zone gate (north)
      { x: 12, y: 5, targetMap: 'safari_zone', targetX: 12, targetY: 24 },
      // East exit to Route 15
      { x: 23, y: 12, targetMap: 'route15', targetX: 1, targetY: 4 },
      { x: 23, y: 13, targetMap: 'route15', targetX: 1, targetY: 4 },
      // West entrance from Route 18
      { x: 1, y: 5, targetMap: 'route18', targetX: 19, targetY: 4 },
      // South exit to Route 19
      { x: 12, y: 24, targetMap: 'route19', targetX: 7, targetY: 1 },
      { x: 13, y: 24, targetMap: 'route19', targetX: 7, targetY: 1 },
      // Gym door
      { x: 7, y: 9, targetMap: 'fuchsia_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 18, y: 8, targetMap: 'pokemon_center_fuchsia', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 18, y: 19, targetMap: 'pokemart_fuchsia', targetX: 3, targetY: 7 },
      // Warden's House
      { x: 6, y: 19, targetMap: 'warden_house', targetX: 3, targetY: 7 },
    ],
    npcs: [
      {
        id: 'fuchsia_npc1',
        x: 12, y: 14,
        spriteColor: 0x80c080,
        direction: Direction.DOWN,
        dialogue: [
          'FUCHSIA CITY',
          "Behold! It's Passion\nPink!",
        ],
      },
      {
        id: 'fuchsia_npc2',
        x: 8, y: 12,
        spriteColor: 0xc0a060,
        direction: Direction.RIGHT,
        dialogue: [
          "The SAFARI ZONE is to\nthe north!",
          "You can catch rare\nPOKeMON there!",
        ],
      },
      {
        id: 'fuchsia_npc3',
        x: 16, y: 14,
        spriteColor: 0x6080c0,
        direction: Direction.LEFT,
        dialogue: [
          "KOGA is the GYM\nLEADER here.",
          "He uses poison-type\nPOKeMON. Be careful!",
        ],
      },
      {
        id: 'safari_warden',
        x: 5, y: 21,
        spriteColor: 0xc08040,
        direction: Direction.DOWN,
        dialogue: [
          "I lost my teeth\nsomewhere in the\nSAFARI ZONE...",
        ],
      },
      // Fishing Guru - gives Super Rod
      {
        id: 'fishing_guru_fuchsia',
        x: 20, y: 14,
        spriteColor: 0x8080c0,
        direction: Direction.LEFT,
        dialogue: [
          "FISHING GURU: I'm the\nFISHING GURU!",
        ],
      },
    ],
  };
})();

// ─── FUCHSIA GYM ──────────────────────────────────────────────────────────────
export const FUCHSIA_GYM: MapData = (() => {
  const W = 10, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }

  // Walls: top 2 rows + sides
  for (let x = 0; x < W; x++) {
    setTile(x, 0, T.WALL);
    setTile(x, 1, T.WALL);
  }
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.WALL);
    setTile(W - 1, y, T.WALL);
  }

  // "Invisible walls" - scattered walls creating a maze-like path
  // Row of walls across middle, with gaps
  setTile(2, 5, T.WALL);
  setTile(3, 5, T.WALL);
  setTile(5, 5, T.WALL);
  setTile(6, 5, T.WALL);
  setTile(7, 5, T.WALL);

  // Another row
  setTile(2, 8, T.WALL);
  setTile(3, 8, T.WALL);
  setTile(4, 8, T.WALL);
  setTile(6, 8, T.WALL);
  setTile(7, 8, T.WALL);
  setTile(8, 8, T.WALL);

  // Side barriers
  setTile(3, 3, T.WALL);
  setTile(3, 4, T.WALL);
  setTile(7, 3, T.WALL);
  setTile(7, 4, T.WALL);

  // Lower section walls
  setTile(2, 10, T.WALL);
  setTile(3, 10, T.WALL);
  setTile(6, 10, T.WALL);
  setTile(7, 10, T.WALL);

  // Carpet on exit warp tiles
  setTile(4, 13, T.DOORMAT);
  setTile(5, 13, T.DOORMAT);

  return {
    id: 'fuchsia_gym',
    name: 'FUCHSIA GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'fuchsia_city', targetX: 7, targetY: 10 },
      { x: 5, y: 13, targetMap: 'fuchsia_city', targetX: 7, targetY: 10 },
    ],
    npcs: [
      {
        id: 'koga',
        x: 4, y: 3,
        spriteColor: 0x8040a0,
        direction: Direction.DOWN,
        dialogue: [
          'KOGA: Fwahahaha!',
          'A mere child dares\nchallenge me?',
          'I shall show you true\nterror!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'fuchsia_gym_trainer1',
        x: 2, y: 6,
        spriteColor: 0x6040a0,
        direction: Direction.RIGHT,
        dialogue: [
          "JUGGLER: I juggle and\nbattle at the same time!",
          "Can you handle it?",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'fuchsia_gym_trainer2',
        x: 8, y: 9,
        spriteColor: 0x4060a0,
        direction: Direction.LEFT,
        dialogue: [
          "JUGGLER: Poison is the\nbest type!",
          "You'll see why!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── POKEMON CENTER FUCHSIA ────────────────────────────────────────────────────
export const POKEMON_CENTER_FUCHSIA: MapData = (() => {
  const W = 10, H = 8;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
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

  // Carpet on exit warp tiles
  setTile(4, 7, T.DOORMAT);
  setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_fuchsia',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'fuchsia_city', targetX: 18, targetY: 9 },
      { x: 5, y: 7, targetMap: 'fuchsia_city', targetX: 18, targetY: 9 },
    ],
    npcs: [
      {
        id: 'nurse_fuchsia',
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

// ─── SAFARI ZONE CENTER (Entry Hub) ──────────────────────────────────────────
export const SAFARI_ZONE_CENTER: MapData = (() => {
  const W = 25, H = 25;
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
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.TREE); setTile(x, H - 2, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Central plaza (PATH clearing)
  fillRect(8, 10, 9, 5, T.PATH);

  // South entrance path from (12, 24) up to plaza
  fillRect(11, 15, 3, 9, T.PATH);

  // North path from plaza to top border
  fillRect(11, 1, 3, 9, T.PATH);

  // East path from plaza to right border
  fillRect(17, 11, 7, 3, T.PATH);

  // West path from plaza to left border
  fillRect(1, 11, 7, 3, T.PATH);

  // Flowers around plaza edges
  fillRect(7, 9, 11, 1, T.FLOWER);
  fillRect(7, 15, 11, 1, T.FLOWER);
  fillRect(7, 10, 1, 5, T.FLOWER);
  fillRect(17, 10, 1, 5, T.FLOWER);

  // Tall grass in corners
  fillRect(3, 3, 4, 4, T.TALL_GRASS);
  fillRect(18, 3, 4, 4, T.TALL_GRASS);
  fillRect(3, 17, 4, 4, T.TALL_GRASS);
  fillRect(18, 17, 4, 4, T.TALL_GRASS);

  // A couple scattered trees for decoration
  setTile(6, 6, T.TREE);
  setTile(18, 6, T.TREE);
  setTile(6, 18, T.TREE);
  setTile(18, 18, T.TREE);

  return {
    id: 'safari_zone',
    name: 'SAFARI ZONE',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South entrance back to Fuchsia City
      { x: 12, y: 24, targetMap: 'fuchsia_city', targetX: 12, targetY: 6 },
      // East exits → Safari Zone East
      { x: 24, y: 11, targetMap: 'safari_zone_east', targetX: 2, targetY: 11 },
      { x: 24, y: 12, targetMap: 'safari_zone_east', targetX: 2, targetY: 12 },
      { x: 24, y: 13, targetMap: 'safari_zone_east', targetX: 2, targetY: 13 },
      // West exits → Safari Zone West
      { x: 0, y: 11, targetMap: 'safari_zone_west', targetX: 22, targetY: 11 },
      { x: 0, y: 12, targetMap: 'safari_zone_west', targetX: 22, targetY: 12 },
      { x: 0, y: 13, targetMap: 'safari_zone_west', targetX: 22, targetY: 13 },
      // North exits → Safari Zone North
      { x: 11, y: 0, targetMap: 'safari_zone_north', targetX: 11, targetY: 22 },
      { x: 12, y: 0, targetMap: 'safari_zone_north', targetX: 12, targetY: 22 },
      { x: 13, y: 0, targetMap: 'safari_zone_north', targetX: 13, targetY: 22 },
    ],
    npcs: [
      {
        id: 'safari_npc1',
        x: 12, y: 19,
        spriteColor: 0x60c060,
        direction: Direction.UP,
        dialogue: [
          "Welcome to the SAFARI\nZONE!",
          "Catch rare POKeMON\nhere using SAFARI BALLS!",
          "Be patient... wild\nPOKeMON scare easily!",
        ],
      },
      {
        id: 'safari_sign',
        x: 12, y: 14,
        spriteColor: 0x808080,
        direction: Direction.DOWN,
        dialogue: [
          "EAST: Rocky Canyon\nWEST: Deep Forest",
          "NORTH: Lake Paradise",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.20,
      encounters: [
        { speciesId: 30, minLevel: 22, maxLevel: 25, weight: 20 },   // Nidorina
        { speciesId: 33, minLevel: 22, maxLevel: 25, weight: 20 },   // Nidorino
        { speciesId: 102, minLevel: 22, maxLevel: 25, weight: 20 },  // Exeggcute
        { speciesId: 47, minLevel: 22, maxLevel: 25, weight: 15 },   // Parasect
        { speciesId: 84, minLevel: 22, maxLevel: 25, weight: 20 },   // Doduo
        { speciesId: 113, minLevel: 22, maxLevel: 25, weight: 5 },   // Chansey
      ],
    },
  };
})();

// ─── SAFARI ZONE EAST (Rocky Canyon) ─────────────────────────────────────────
export const SAFARI_ZONE_EAST: MapData = (() => {
  const W = 25, H = 25;
  const tiles = fill2D(W, H, T.CAVE_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Cave wall borders (2 tiles thick)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.CAVE_WALL); setTile(x, 1, T.CAVE_WALL); }
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.CAVE_WALL); setTile(x, H - 2, T.CAVE_WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.CAVE_WALL); setTile(1, y, T.CAVE_WALL); }
  for (let y = 0; y < H; y++) { setTile(W - 1, y, T.CAVE_WALL); setTile(W - 2, y, T.CAVE_WALL); }

  // West entrance path (y=11-13, from border inward)
  fillRect(1, 11, 4, 3, T.PATH);

  // Large rock outcrops creating canyon maze
  fillRect(6, 2, 4, 5, T.CAVE_WALL);    // NW outcrop
  fillRect(15, 2, 5, 4, T.CAVE_WALL);   // NE outcrop
  fillRect(5, 15, 5, 4, T.CAVE_WALL);   // SW outcrop
  fillRect(16, 15, 4, 5, T.CAVE_WALL);  // SE outcrop
  fillRect(10, 8, 5, 3, T.CAVE_WALL);   // Central outcrop
  fillRect(8, 19, 3, 3, T.CAVE_WALL);   // South central rock
  fillRect(18, 8, 3, 4, T.CAVE_WALL);   // East central rock

  // Scattered boulders
  setTile(4, 6, T.BOULDER);
  setTile(13, 5, T.BOULDER);
  setTile(21, 7, T.BOULDER);
  setTile(4, 20, T.BOULDER);
  setTile(14, 18, T.BOULDER);
  setTile(21, 20, T.BOULDER);

  // Sand patches near rock transitions
  fillRect(5, 7, 3, 2, T.SAND);
  fillRect(11, 6, 3, 2, T.SAND);
  fillRect(15, 6, 3, 2, T.SAND);
  fillRect(10, 11, 5, 1, T.SAND);
  fillRect(5, 19, 3, 1, T.SAND);
  fillRect(16, 20, 4, 1, T.SAND);

  // Tall grass in clearings between rocks
  fillRect(2, 3, 3, 4, T.TALL_GRASS);
  fillRect(11, 2, 3, 4, T.TALL_GRASS);
  fillRect(21, 3, 2, 4, T.TALL_GRASS);
  fillRect(2, 15, 3, 4, T.TALL_GRASS);
  fillRect(11, 13, 4, 3, T.TALL_GRASS);
  fillRect(12, 19, 2, 3, T.TALL_GRASS);
  fillRect(21, 14, 2, 4, T.TALL_GRASS);

  // PATH corridors between outcrops
  fillRect(10, 5, 1, 3, T.PATH);
  fillRect(15, 5, 1, 3, T.PATH);
  fillRect(6, 8, 4, 1, T.PATH);
  fillRect(6, 10, 4, 1, T.PATH);

  return {
    id: 'safari_zone_east',
    name: 'SAFARI ZONE EAST',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exits → Safari Zone Center
      { x: 0, y: 11, targetMap: 'safari_zone', targetX: 22, targetY: 11 },
      { x: 0, y: 12, targetMap: 'safari_zone', targetX: 22, targetY: 12 },
      { x: 0, y: 13, targetMap: 'safari_zone', targetX: 22, targetY: 13 },
    ],
    npcs: [
      {
        id: 'safari_npc2',
        x: 5, y: 12,
        spriteColor: 0xc0c060,
        direction: Direction.RIGHT,
        dialogue: [
          "I've been looking for\na CHANSEY all day!",
          "They're super rare\nbut worth the wait!",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.25,
      encounters: [
        { speciesId: 111, minLevel: 25, maxLevel: 28, weight: 25 },  // Rhyhorn
        { speciesId: 104, minLevel: 25, maxLevel: 28, weight: 20 },  // Cubone
        { speciesId: 115, minLevel: 25, maxLevel: 28, weight: 15 },  // Kangaskhan
        { speciesId: 33, minLevel: 25, maxLevel: 28, weight: 15 },   // Nidorino
        { speciesId: 127, minLevel: 25, maxLevel: 28, weight: 15 },  // Pinsir
        { speciesId: 113, minLevel: 25, maxLevel: 28, weight: 5 },   // Chansey
        { speciesId: 128, minLevel: 25, maxLevel: 28, weight: 5 },   // Tauros
      ],
    },
  };
})();

// ─── SAFARI ZONE WEST (Dense Forest) ─────────────────────────────────────────
export const SAFARI_ZONE_WEST: MapData = (() => {
  const W = 25, H = 25;
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
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.TREE); setTile(x, H - 2, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Fill most of the interior with trees to create dense forest
  fillRect(2, 2, 21, 21, T.TREE);

  // Carve winding paths through the forest
  // East entrance corridor (y=11-13)
  fillRect(22, 11, 2, 3, T.PATH);
  fillRect(18, 11, 4, 3, T.PATH);

  // Main path: east entrance → south → west → north to Secret House
  fillRect(16, 11, 2, 6, T.PATH);     // south from entrance
  fillRect(12, 15, 4, 2, T.PATH);     // west segment
  fillRect(12, 12, 2, 3, T.PATH);     // north connector
  fillRect(8, 12, 4, 2, T.PATH);      // further west
  fillRect(8, 8, 2, 4, T.PATH);       // north segment
  fillRect(5, 8, 3, 2, T.PATH);       // west to NW area
  fillRect(5, 4, 2, 4, T.PATH);       // north to Secret House row
  fillRect(3, 4, 2, 2, T.PATH);       // final approach to Secret House

  // Side paths and dead ends for exploration
  fillRect(18, 6, 2, 5, T.PATH);      // NE side path
  fillRect(14, 6, 4, 2, T.PATH);      // connecting NE
  fillRect(14, 4, 2, 2, T.PATH);      // dead end north
  fillRect(4, 17, 2, 4, T.PATH);      // SW dead end
  fillRect(6, 19, 4, 2, T.PATH);      // southern corridor
  fillRect(10, 17, 2, 4, T.PATH);     // connecting south

  // Tall grass along paths
  fillRect(17, 7, 1, 4, T.TALL_GRASS);
  fillRect(13, 7, 1, 4, T.TALL_GRASS);
  fillRect(7, 9, 1, 3, T.TALL_GRASS);
  fillRect(4, 5, 1, 3, T.TALL_GRASS);
  fillRect(11, 16, 1, 2, T.TALL_GRASS);
  fillRect(5, 18, 1, 2, T.TALL_GRASS);
  fillRect(9, 18, 1, 2, T.TALL_GRASS);

  // CUT_TREE shortcut
  setTile(9, 6, T.CUT_TREE);

  // Secret House building (deep northwest)
  fillRect(3, 2, 4, 1, T.ROOF);
  fillRect(3, 3, 4, 2, T.BUILDING);
  setTile(4, 4, T.DOOR);

  // Flowers near Secret House
  setTile(2, 5, T.FLOWER);
  setTile(7, 3, T.FLOWER);
  setTile(7, 4, T.FLOWER);

  return {
    id: 'safari_zone_west',
    name: 'SAFARI ZONE WEST',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // East exits → Safari Zone Center
      { x: 24, y: 11, targetMap: 'safari_zone', targetX: 2, targetY: 11 },
      { x: 24, y: 12, targetMap: 'safari_zone', targetX: 2, targetY: 12 },
      { x: 24, y: 13, targetMap: 'safari_zone', targetX: 2, targetY: 13 },
      // Secret House door
      { x: 4, y: 4, targetMap: 'safari_secret_house', targetX: 3, targetY: 6 },
    ],
    npcs: [
      {
        id: 'safari_npc3',
        x: 19, y: 12,
        spriteColor: 0xc0a060,
        direction: Direction.LEFT,
        dialogue: [
          "The SECRET HOUSE is\nsupposed to be deep",
          "in the northwest...\nGood luck finding it!",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.30,
      encounters: [
        { speciesId: 123, minLevel: 25, maxLevel: 28, weight: 20 },  // Scyther
        { speciesId: 127, minLevel: 25, maxLevel: 28, weight: 15 },  // Pinsir
        { speciesId: 102, minLevel: 25, maxLevel: 28, weight: 20 },  // Exeggcute
        { speciesId: 47, minLevel: 25, maxLevel: 28, weight: 15 },   // Parasect
        { speciesId: 49, minLevel: 25, maxLevel: 28, weight: 15 },   // Venomoth
        { speciesId: 30, minLevel: 25, maxLevel: 28, weight: 10 },   // Nidorina
        { speciesId: 113, minLevel: 25, maxLevel: 28, weight: 5 },   // Chansey
      ],
    },
  };
})();

// ─── SAFARI ZONE NORTH (Lake Paradise) ───────────────────────────────────────
export const SAFARI_ZONE_NORTH: MapData = (() => {
  const W = 25, H = 25;
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
  for (let x = 0; x < W; x++) { setTile(x, H - 1, T.TREE); setTile(x, H - 2, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // South entrance path (x=11-13, from border inward)
  fillRect(11, 22, 3, 2, T.PATH);
  fillRect(11, 18, 3, 4, T.PATH);

  // Sand beaches surrounding the lake
  fillRect(4, 4, 17, 14, T.SAND);

  // Large irregular water lake in center
  fillRect(6, 5, 13, 11, T.WATER);
  // Irregular edges — carve some sand back into lake edges
  fillRect(4, 5, 2, 3, T.SAND);
  fillRect(4, 12, 2, 4, T.SAND);
  fillRect(19, 5, 2, 2, T.SAND);
  fillRect(19, 13, 2, 3, T.SAND);
  // Notch in the lake for variation
  fillRect(10, 5, 3, 1, T.SAND);
  fillRect(8, 14, 5, 2, T.SAND);

  // Small grass islands in the lake (tease for Surf)
  setTile(10, 8, T.GRASS);
  setTile(11, 8, T.GRASS);
  setTile(14, 10, T.GRASS);

  // Paths around the lake (east and west sides)
  // West path
  fillRect(3, 5, 1, 12, T.PATH);
  fillRect(2, 10, 1, 2, T.PATH);
  // East path
  fillRect(21, 5, 1, 12, T.PATH);
  fillRect(22, 10, 1, 2, T.PATH);

  // Path from south entrance to lake shore
  fillRect(11, 16, 3, 2, T.PATH);

  // Tall grass areas — east side (where Gold Teeth are hidden)
  fillRect(18, 17, 5, 5, T.TALL_GRASS);
  fillRect(16, 19, 2, 3, T.TALL_GRASS);

  // Tall grass areas — west side
  fillRect(2, 17, 5, 5, T.TALL_GRASS);

  // Scattered trees for aesthetics
  setTile(7, 18, T.TREE);
  setTile(9, 20, T.TREE);
  setTile(15, 18, T.TREE);
  setTile(8, 3, T.TREE);
  setTile(16, 3, T.TREE);

  return {
    id: 'safari_zone_north',
    name: 'SAFARI ZONE NORTH',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // South exits → Safari Zone Center
      { x: 11, y: 24, targetMap: 'safari_zone', targetX: 11, targetY: 2 },
      { x: 12, y: 24, targetMap: 'safari_zone', targetX: 12, targetY: 2 },
      { x: 13, y: 24, targetMap: 'safari_zone', targetX: 13, targetY: 2 },
    ],
    npcs: [
      {
        id: 'safari_gold_teeth',
        x: 20, y: 20,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'gold_teeth',
      },
      {
        id: 'safari_npc4',
        x: 12, y: 17,
        spriteColor: 0x6080c0,
        direction: Direction.UP,
        dialogue: [
          "Rumor has it someone\nlost something in the",
          "tall grass to the\nsoutheast...",
        ],
      },
    ],
    wildEncounters: {
      grassRate: 0.25,
      encounters: [
        { speciesId: 128, minLevel: 26, maxLevel: 29, weight: 15 },  // Tauros
        { speciesId: 115, minLevel: 26, maxLevel: 29, weight: 15 },  // Kangaskhan
        { speciesId: 113, minLevel: 26, maxLevel: 29, weight: 10 },  // Chansey (better odds)
        { speciesId: 147, minLevel: 26, maxLevel: 29, weight: 5 },   // Dratini (exclusive rare)
        { speciesId: 111, minLevel: 26, maxLevel: 29, weight: 20 },  // Rhyhorn
        { speciesId: 30, minLevel: 26, maxLevel: 29, weight: 15 },   // Nidorina
        { speciesId: 102, minLevel: 26, maxLevel: 29, weight: 15 },  // Exeggcute
        { speciesId: 33, minLevel: 26, maxLevel: 29, weight: 5 },    // Nidorino
      ],
    },
  };
})();

// ─── POKeMON MART (FUCHSIA)  (8x8 indoor) ───────────────────────
const POKEMART_FUCHSIA: MapData = (() => {
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
  // Carpet on exit warp tile
  setTile(3, 7, T.DOORMAT);
  return {
    id: 'pokemart_fuchsia', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'fuchsia_city', targetX: 18, targetY: 20 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['great_ball', 'ultra_ball', 'super_potion', 'hyper_potion', 'full_heal', 'revive'],
    }],
  };
})();

// ─── Safari Secret House (interior) ─────────────────────────────────────────
export const SAFARI_SECRET_HOUSE_INTERIOR: MapData = (() => {
  const W = 7, H = 7;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(2, 2, T.MART_SHELF); setTile(4, 2, T.MART_SHELF);
  setTile(3, 3, T.CARPET); setTile(3, 4, T.CARPET);
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'safari_secret_house', name: 'SECRET HOUSE', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'safari_zone_west', targetX: 4, targetY: 5 }],
    npcs: [{
      id: 'safari_secret_house',
      x: 3, y: 3,
      spriteColor: 0x60c060,
      direction: Direction.DOWN,
      dialogue: [
        "Congratulations on\nmaking it this far!",
        "Here, take this HM\nas your prize!",
      ],
    }],
  };
})();

// ─── Warden's House ──────────────────────────────────────────────────────────
export const WARDEN_HOUSE: MapData = (() => {
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
  // Carpet on exit warp tile
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'warden_house', name: "WARDEN's HOUSE", width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'fuchsia_city', targetX: 6, targetY: 20 }],
    npcs: [{
      id: 'safari_warden', x: 4, y: 3, spriteColor: 0x80a060, direction: Direction.DOWN,
      dialogue: [
        "WARDEN: I lost my\nGOLD TEETH in the",
        "SAFARI ZONE... I can't\ntalk well without them!",
      ],
    }],
  };
})();

// ─── SOUTH MAPS REGISTRY ──────────────────────────────────────────────────────
export const SOUTH_MAPS: Record<string, MapData> = {
  route12: ROUTE12,
  route13: ROUTE13,
  route14: ROUTE14,
  route15: ROUTE15,
  route16: ROUTE16,
  route17: ROUTE17,
  route18: ROUTE18,
  fuchsia_city: FUCHSIA_CITY,
  fuchsia_gym: FUCHSIA_GYM,
  pokemon_center_fuchsia: POKEMON_CENTER_FUCHSIA,
  pokemart_fuchsia: POKEMART_FUCHSIA,
  safari_zone: SAFARI_ZONE_CENTER,
  safari_zone_east: SAFARI_ZONE_EAST,
  safari_zone_west: SAFARI_ZONE_WEST,
  safari_zone_north: SAFARI_ZONE_NORTH,
  safari_secret_house: SAFARI_SECRET_HOUSE_INTERIOR,
  warden_house: WARDEN_HOUSE,
};
