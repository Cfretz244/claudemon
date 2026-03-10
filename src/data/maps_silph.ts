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

// ─── SILPH CO. 1F — Lobby ───────────────────────────────────────────────────

const SILPH_CO_1F: MapData = (() => {
  const W = 14, H = 14;
  const tiles = fill2D(W, H, T.INDOOR_FLOOR);
  const collision = fill2D(W, H, false);
  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) { tiles[y][x] = type; collision[y][x] = SOLID_TILES.has(type); }
  }
  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setTile(x + dx, y + dy, type);
  }

  // Walls: top 2 rows, sides, bottom
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Reception counter
  fillRect(3, 3, 4, 1, T.COUNTER);

  // Office partitions
  fillRect(9, 3, 1, 4, T.WALL);
  setTile(9, 5, T.INDOOR_FLOOR); // gap

  // Desks in office area
  setTile(10, 3, T.COUNTER);
  setTile(11, 3, T.COUNTER);
  setTile(10, 6, T.COUNTER);

  // Carpet lobby
  fillRect(5, 9, 4, 4, T.CARPET);

  // Stairs area (top-right) — leads to 2F
  setTile(12, 2, T.DOOR);

  // Exit door (bottom center)
  setTile(6, 13, T.DOOR);
  setTile(7, 13, T.DOOR);

  return {
    id: 'silph_co_1f',
    name: 'SILPH CO. 1F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Exit to Saffron City
      { x: 6, y: 13, targetMap: 'saffron_city', targetX: 15, targetY: 11 },
      { x: 7, y: 13, targetMap: 'saffron_city', targetX: 15, targetY: 11 },
      // Stairs to 2F
      { x: 12, y: 2, targetMap: 'silph_co_2f', targetX: 12, targetY: 12 },
    ],
    npcs: [
      {
        id: 'silph_1f_grunt1',
        x: 6, y: 6,
        spriteColor: 0x383838,
        direction: Direction.DOWN,
        dialogue: ['ROCKET: SILPH CO. is\nunder our control!', 'No one gets in\nor out!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'silph_receptionist',
        x: 5, y: 2,
        spriteColor: 0xc0a060,
        direction: Direction.DOWN,
        dialogue: [
          "Please, you have to\nhelp us!",
          "TEAM ROCKET has\ntaken over the\nbuilding!",
          "The PRESIDENT is on\nthe top floor!",
        ],
      },
    ],
  };
})();

// ─── SILPH CO. 2F — Office ──────────────────────────────────────────────────

const SILPH_CO_2F: MapData = (() => {
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

  // Office partitions
  fillRect(4, 4, 1, 4, T.WALL);
  setTile(4, 6, T.INDOOR_FLOOR); // gap
  fillRect(8, 3, 1, 5, T.WALL);
  setTile(8, 5, T.INDOOR_FLOOR); // gap

  // Desks
  setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(9, 3, T.COUNTER); setTile(10, 3, T.COUNTER);
  setTile(6, 8, T.COUNTER);

  // Teleport pads
  setTile(5, 7, T.TELEPORT_PAD);   // Pad A → 4F
  setTile(10, 10, T.TELEPORT_PAD); // Pad B → 6F (trap)

  // Stairs area (bottom-right) — from 1F; (top-right) — to 3F
  setTile(12, 12, T.DOOR); // stairs from 1F
  setTile(12, 2, T.DOOR);  // stairs to 3F

  return {
    id: 'silph_co_2f',
    name: 'SILPH CO. 2F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Stairs down to 1F
      { x: 12, y: 12, targetMap: 'silph_co_1f', targetX: 12, targetY: 2 },
      // Stairs up to 3F
      { x: 12, y: 2, targetMap: 'silph_co_3f', targetX: 12, targetY: 12 },
      // Pad A → 4F
      { x: 5, y: 7, targetMap: 'silph_co_4f', targetX: 5, targetY: 5 },
      // Pad B → 6F (trap)
      { x: 10, y: 10, targetMap: 'silph_co_6f', targetX: 5, targetY: 8 },
    ],
    npcs: [
      {
        id: 'silph_2f_grunt1',
        x: 3, y: 6,
        spriteColor: 0x383838,
        direction: Direction.RIGHT,
        dialogue: ['ROCKET: This floor\nis off limits!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'silph_2f_grunt2',
        x: 9, y: 8,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: You think you\ncan stop us?'],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── SILPH CO. 3F — Lab ─────────────────────────────────────────────────────

const SILPH_CO_3F: MapData = (() => {
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

  // Lab partitions — divide into sections
  fillRect(5, 3, 1, 5, T.WALL);
  setTile(5, 5, T.INDOOR_FLOOR); // gap
  fillRect(9, 6, 1, 5, T.WALL);
  setTile(9, 8, T.INDOOR_FLOOR); // gap

  // Lab benches / equipment
  setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(10, 3, T.COUNTER); setTile(11, 3, T.COUNTER);
  setTile(2, 8, T.COUNTER);

  // Teleport pads — main junction
  setTile(3, 5, T.TELEPORT_PAD);   // Pad C → 5F (trap)
  setTile(11, 5, T.TELEPORT_PAD);  // Pad D → 7F (trap - isolated corner)
  setTile(7, 11, T.TELEPORT_PAD);  // Pad E → 4F (critical path)

  // Stairs (bottom-right) — from 2F
  setTile(12, 12, T.DOOR);

  return {
    id: 'silph_co_3f',
    name: 'SILPH CO. 3F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Stairs down to 2F
      { x: 12, y: 12, targetMap: 'silph_co_2f', targetX: 12, targetY: 2 },
      // Pad C → 5F (trap — blocked area)
      { x: 3, y: 5, targetMap: 'silph_co_5f', targetX: 3, targetY: 6 },
      // Pad D → 7F (trap — isolated corner)
      { x: 11, y: 5, targetMap: 'silph_co_7f', targetX: 3, targetY: 9 },
      // Pad E → 4F (critical path)
      { x: 7, y: 11, targetMap: 'silph_co_4f', targetX: 10, targetY: 5 },
    ],
    npcs: [
      {
        id: 'silph_3f_grunt1',
        x: 3, y: 9,
        spriteColor: 0x383838,
        direction: Direction.UP,
        dialogue: ['ROCKET: The lab\nequipment is ours now!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'silph_3f_grunt2',
        x: 8, y: 4,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: Get out of\nhere, kid!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'silph_3f_scientist',
        x: 2, y: 4,
        spriteColor: 0xf0f0f0,
        direction: Direction.RIGHT,
        dialogue: [
          "SCIENTIST: The\nteleport pads are\nconfusing...",
          "I think the one in\nthe center of the\nbottom goes forward.",
        ],
      },
    ],
  };
})();

// ─── SILPH CO. 4F — Server Room ─────────────────────────────────────────────

const SILPH_CO_4F: MapData = (() => {
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

  // Server rack partitions
  fillRect(4, 2, 1, 5, T.WALL);
  setTile(4, 4, T.INDOOR_FLOOR); // gap
  fillRect(8, 7, 1, 4, T.WALL);
  setTile(8, 9, T.INDOOR_FLOOR); // gap

  // Server equipment
  setTile(2, 2, T.MART_SHELF); setTile(3, 2, T.MART_SHELF);
  setTile(6, 2, T.MART_SHELF); setTile(7, 2, T.MART_SHELF);
  setTile(10, 8, T.COUNTER); setTile(11, 8, T.COUNTER);

  // Teleport pads
  setTile(5, 5, T.TELEPORT_PAD);   // Pad F → 2F (return from Pad A)
  setTile(10, 5, T.TELEPORT_PAD);  // Pad G → 3F (return from Pad E)
  setTile(3, 10, T.TELEPORT_PAD);  // Pad H → 5F (critical path)

  return {
    id: 'silph_co_4f',
    name: 'SILPH CO. 4F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Pad F → 2F (bidirectional with Pad A)
      { x: 5, y: 5, targetMap: 'silph_co_2f', targetX: 5, targetY: 7 },
      // Pad G → 3F (bidirectional with Pad E)
      { x: 10, y: 5, targetMap: 'silph_co_3f', targetX: 7, targetY: 11 },
      // Pad H → 5F (critical path)
      { x: 3, y: 10, targetMap: 'silph_co_5f', targetX: 10, targetY: 6 },
    ],
    npcs: [
      {
        id: 'silph_4f_grunt1',
        x: 6, y: 5,
        spriteColor: 0x383838,
        direction: Direction.DOWN,
        dialogue: ['ROCKET: The servers\ncontain valuable\ndata!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'silph_4f_grunt2',
        x: 9, y: 10,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: You made it\nthis far? Impressive!'],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── SILPH CO. 5F — Executive ───────────────────────────────────────────────

const SILPH_CO_5F: MapData = (() => {
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

  // Partition creating a trapped zone (top-left area where Pad C lands)
  fillRect(1, 8, 5, 1, T.WALL);
  // Gap in partition — only the teleport pad is in the blocked area
  // The trap zone is (1,2)-(5,7) — Pad J at (3,6) is the only exit

  // Executive desks
  setTile(7, 2, T.COUNTER); setTile(8, 2, T.COUNTER);
  setTile(10, 2, T.COUNTER); setTile(11, 2, T.COUNTER);
  setTile(6, 9, T.COUNTER);

  // Carpet executive area
  fillRect(6, 3, 3, 2, T.CARPET);

  // Teleport pads
  setTile(10, 6, T.TELEPORT_PAD);  // Pad I → 4F (return from Pad H)
  setTile(3, 6, T.TELEPORT_PAD);   // Pad J → 3F (return from Pad C, in trapped zone)
  setTile(7, 3, T.TELEPORT_PAD);   // Pad K → 7F (critical path — guarded by J&J)

  return {
    id: 'silph_co_5f',
    name: 'SILPH CO. 5F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Pad I → 4F (bidirectional with Pad H)
      { x: 10, y: 6, targetMap: 'silph_co_4f', targetX: 3, targetY: 10 },
      // Pad J → 3F (bidirectional with Pad C)
      { x: 3, y: 6, targetMap: 'silph_co_3f', targetX: 3, targetY: 5 },
      // Pad K → 7F (critical path)
      { x: 7, y: 3, targetMap: 'silph_co_7f', targetX: 10, targetY: 9 },
    ],
    npcs: [
      {
        id: 'silph_5f_grunt1',
        x: 10, y: 10,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: The boss is\nupstairs! You will\nnever reach him!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'jessie_silph',
        x: 6, y: 5,
        spriteColor: 0xd02070,
        direction: Direction.UP,
        dialogue: [
          'JESSIE & JAMES: Well,\nwell, well...',
          "If it isn't the\ntwerp who keeps\nruining our plans!",
          'Prepare for trouble,\nfor the very last time!',
          'And make it double,\nthis will be sublime!',
          "MEOWTH: The boss\nwon't be happy if we\nlose again!",
          "Then let's not lose!\nGo, ARBOK! Go, WEEZING!",
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'james_silph',
        x: 8, y: 5,
        spriteColor: 0x6060d0,
        direction: Direction.UP,
        dialogue: [
          "JAMES: This is our\nbiggest operation yet!",
          "SILPH CO. will soon\nbelong to TEAM ROCKET!",
        ],
      },
    ],
  };
})();

// ─── SILPH CO. 6F — Dead End / Rival ────────────────────────────────────────

const SILPH_CO_6F: MapData = (() => {
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

  // Office partitions
  fillRect(5, 3, 1, 5, T.WALL);
  setTile(5, 5, T.INDOOR_FLOOR); // gap
  fillRect(9, 3, 1, 5, T.WALL);
  setTile(9, 5, T.INDOOR_FLOOR); // gap

  // Desks
  setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(10, 3, T.COUNTER); setTile(11, 3, T.COUNTER);

  // Teleport pads — both lead back (dead end floor)
  setTile(5, 8, T.TELEPORT_PAD);   // Pad L → 2F (return from Pad B)
  setTile(10, 5, T.TELEPORT_PAD);  // Pad M → 3F

  return {
    id: 'silph_co_6f',
    name: 'SILPH CO. 6F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Pad L → 2F (bidirectional with Pad B)
      { x: 5, y: 8, targetMap: 'silph_co_2f', targetX: 10, targetY: 10 },
      // Pad M → 3F
      { x: 10, y: 5, targetMap: 'silph_co_3f', targetX: 11, targetY: 5 },
    ],
    npcs: [
      {
        id: 'silph_6f_grunt1',
        x: 7, y: 10,
        spriteColor: 0x383838,
        direction: Direction.UP,
        dialogue: ['ROCKET: Ha! You fell\nfor the trap!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'rival_silph',
        x: 7, y: 6,
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
    ],
  };
})();

// ─── SILPH CO. 7F — President's Office / Giovanni ───────────────────────────

const SILPH_CO_7F: MapData = (() => {
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

  // Isolated corner (top-left) — trap from Pad D lands here
  fillRect(1, 7, 5, 1, T.WALL);
  fillRect(5, 2, 1, 5, T.WALL);
  // Pad N at (3,9) is the only exit from this trapped area

  // President's desk area
  setTile(7, 2, T.COUNTER); // president desk
  fillRect(9, 2, 2, 1, T.COUNTER); // side desk

  // Carpet
  fillRect(6, 3, 3, 2, T.CARPET);

  // Teleport pads
  setTile(3, 9, T.TELEPORT_PAD);   // Pad N → 3F (return from Pad D)
  setTile(10, 9, T.TELEPORT_PAD);  // Landing pad from Pad K (critical path arrival)

  return {
    id: 'silph_co_7f',
    name: 'SILPH CO. 7F',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Pad N → 3F (bidirectional with Pad D)
      { x: 3, y: 9, targetMap: 'silph_co_3f', targetX: 11, targetY: 5 },
      // Pad at (10,9) is a landing pad — warp back to 5F
      { x: 10, y: 9, targetMap: 'silph_co_5f', targetX: 7, targetY: 3 },
    ],
    npcs: [
      {
        id: 'silph_7f_grunt1',
        x: 10, y: 5,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: The boss is\nright here! You will\nnot pass!'],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'giovanni_silph',
        x: 7, y: 5,
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

// ─── Combined export ────────────────────────────────────────────────────────

export const SILPH_MAPS: Record<string, MapData> = {
  silph_co_1f: SILPH_CO_1F,
  silph_co_2f: SILPH_CO_2F,
  silph_co_3f: SILPH_CO_3F,
  silph_co_4f: SILPH_CO_4F,
  silph_co_5f: SILPH_CO_5F,
  silph_co_6f: SILPH_CO_6F,
  silph_co_7f: SILPH_CO_7F,
};
