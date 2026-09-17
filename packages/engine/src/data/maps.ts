import { MapData, NPCData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { CERULEAN_MAPS } from './maps_cerulean';
import { VERMILION_MAPS } from './maps_vermilion';
import { CENTRAL_MAPS } from './maps_central';
import { SOUTH_MAPS } from './maps_south';
import { ENDGAME_MAPS } from './maps_endgame';
import { SILPH_MAPS } from './maps_silph';
import { HIDEOUT_MAPS } from './maps_hideout';
import { TOWER_MAPS } from './maps_tower';
import { CAVE_MAPS } from './maps_cave';
import { createMapFromSketch, createMapShape, SOLID_TILES, stampBuilding } from './mapBuilder';
import { PALLET_TOWN_SKETCH } from './sketches/palletTown';
import { PEWTER_CITY_SKETCH } from './sketches/pewterCity';
import { VIRIDIAN_CITY_SKETCH } from './sketches/viridianCity';

const T = TileType;

const MUSEUM_SOLID = new Set([...SOLID_TILES, T.EXHIBIT_CASE, T.FOSSIL_DISPLAY, T.SHUTTLE_DISPLAY]);

// ─── Pallet Town ─────────────────────────────────────────────────────────────
//
// Built FROM its sketch (`sketches/palletTown.ts`, the drawing Fable's
// `tools/town-sketch-check.mjs` validates): the rows draw the ground, the
// three buildings are stamped over their footprints with the kit, and every
// door warp, edge warp and NPC spot is read back out of the sketch, so a
// coordinate exists in exactly one place. Dialogue, sprite colours and the
// wild table stay here — only *where* things are lives in the sketch.

/** Where each door warp drops the player inside the interior. */
const PALLET_DOOR_TARGETS: Record<string, { x: number; y: number }> = {
  player_house: { x: 3, y: 7 },
  rival_house: { x: 3, y: 7 },
  oaks_lab: { x: 4, y: 11 },
};

/** Where each edge warp lands on the route, keyed by the town tile it sits on. */
const PALLET_EDGE_TARGETS: Record<string, { x: number; y: number }> = {
  // Route 1 runs a four-wide path down to its south edge; the two town-side
  // gap tiles land on the two middle columns of it.
  '9,0': { x: 9, y: 28 },
  '10,0': { x: 10, y: 28 },
  // Route 21 is open water: both pier tiles put the player on the same tile
  // below its north edge, and the player surfs from there.
  '10,16': { x: 7, y: 1 },
  '11,16': { x: 7, y: 1 },
};

/** Everything about a Pallet NPC except where they stand (that is the sketch's). */
const PALLET_NPC_DETAILS: Record<string, Omit<NPCData, 'id' | 'x' | 'y'>> = {
  pallet_npc1: {
    spriteColor: 0xf06060,
    direction: Direction.DOWN,
    dialogue: [
      'PALLET TOWN',
      'Shades of your journey\nawait!',
    ],
  },
  pallet_npc2: {
    spriteColor: 0x60a0f0,
    direction: Direction.LEFT,
    dialogue: [
      "I heard PROF. OAK's\nlooking for you!",
      'His lab is right over\nthere.',
    ],
  },
  pallet_fisher: {
    spriteColor: 0x40a0c0,
    direction: Direction.DOWN,
    dialogue: [
      'The sea goes all the\nway to CINNABAR from\nhere.',
      "That's ROUTE 21. You\nneed to SURF to cross\nit.",
    ],
  },
};

export const PALLET_TOWN: MapData = (() => {
  const sketch = PALLET_TOWN_SKETCH;
  const shape = createMapFromSketch(sketch.rows, sketch.legend);
  const { tiles, collision, tileKinds, width: W, height: H } = shape;

  // The two houses and Oak's lab, stamped over the `h` / `L` footprints the
  // sketch reserves for them. Chimneys on the houses; the same stack reads as
  // the lab's roof antenna. No signboards: Pallet has no public building, and
  // the lab's name is on the SIGN standing on the path outside it.
  for (const b of sketch.buildings) {
    stampBuilding(shape, b.kind, b.x, b.y, {
      w: b.w,
      h: b.h,
      door: b.door[0] - b.x,
      sign: 'none',
      chimney: true,
    });
  }

  return {
    id: 'pallet_town',
    name: 'PALLET TOWN',
    width: W,
    height: H,
    tiles,
    collision,
    tileKinds,
    warps: [
      ...sketch.buildings.map(b => ({
        x: b.door[0],
        y: b.door[1],
        targetMap: b.warp,
        targetX: PALLET_DOOR_TARGETS[b.warp].x,
        targetY: PALLET_DOOR_TARGETS[b.warp].y,
      })),
      ...sketch.edgeWarps.map(([x, y, targetMap]) => ({
        x,
        y,
        targetMap,
        targetX: PALLET_EDGE_TARGETS[`${x},${y}`].x,
        targetY: PALLET_EDGE_TARGETS[`${x},${y}`].y,
      })),
    ],
    npcs: sketch.npcs.map(n => ({ id: n.id, x: n.x, y: n.y, ...PALLET_NPC_DETAILS[n.id] })),
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tile
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'player_house',
    name: "PLAYER's HOUSE",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // The doorstep below the player's house door at (4,5).
      { x: 3, y: H - 1, targetMap: 'pallet_town', targetX: 4, targetY: 6 },
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tile
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'rival_house',
    name: "{RIVAL}'s HOUSE",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // The doorstep below the rival's house door at (16,5).
      { x: 3, y: H - 1, targetMap: 'pallet_town', targetX: 16, targetY: 6 },
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tiles
  setTile(4, H - 1, T.DOORMAT);
  setTile(5, H - 1, T.DOORMAT);

  return {
    id: 'oaks_lab',
    name: "PROF. OAK's LAB",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // Land one tile BELOW pallet_town's lab door (12,12) — the door tile is
      // the facade you walk INTO, never the tile you come out onto. (12,13) is
      // the DOORMAT at the head of the lab's cobbled forecourt.
      { x: 4, y: H - 1, targetMap: 'pallet_town', targetX: 12, targetY: 13 },
      { x: 5, y: H - 1, targetMap: 'pallet_town', targetX: 12, targetY: 13 },
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
      // South to Pallet Town. The town's tree ring only opens two tiles wide
      // ((9,0) and (10,0)), so Route 1's four-wide path funnels onto the tile
      // below each of them — (8,1) is the town sign, and nothing may land there.
      { x: 8, y: H - 1, targetMap: 'pallet_town', targetX: 9, targetY: 1 },
      { x: 9, y: H - 1, targetMap: 'pallet_town', targetX: 9, targetY: 1 },
      { x: 10, y: H - 1, targetMap: 'pallet_town', targetX: 10, targetY: 1 },
      { x: 11, y: H - 1, targetMap: 'pallet_town', targetX: 10, targetY: 1 },
      // North to Viridian City
      { x: 8, y: 0, targetMap: 'viridian_city', targetX: 8, targetY: 26 },
      { x: 9, y: 0, targetMap: 'viridian_city', targetX: 9, targetY: 26 },
      { x: 10, y: 0, targetMap: 'viridian_city', targetX: 10, targetY: 26 },
      { x: 11, y: 0, targetMap: 'viridian_city', targetX: 11, targetY: 26 },
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

// ─── Viridian City ───────────────────────────────────────────────────────────
//
// Built FROM its sketch (`sketches/viridianCity.ts`), the same way Pallet is:
// the rows draw the ground, the four buildings are stamped over their
// footprints with the kit, and every door warp, edge warp and NPC spot is read
// back out of the sketch. Dialogue, sprite colours and the wild table stay
// here — only *where* things are lives in the sketch.

/** Where each door warp drops the player inside the interior. */
const VIRIDIAN_DOOR_TARGETS: Record<string, { x: number; y: number }> = {
  viridian_gym: { x: 4, y: 13 },
  pokemon_center: { x: 4, y: 7 },
  pokemart: { x: 3, y: 7 },
  viridian_house: { x: 3, y: 7 },
};

/** Where each edge warp lands on the route, keyed by the town tile it sits on. */
const VIRIDIAN_EDGE_TARGETS: Record<string, { x: number; y: number }> = {
  // Route 2's four-wide road comes down to its south edge, one column each.
  '8,0': { x: 8, y: 28 },
  '9,0': { x: 9, y: 28 },
  '10,0': { x: 10, y: 28 },
  '11,0': { x: 11, y: 28 },
  // Route 22 runs west from the middle of the town; its two lanes come back
  // onto the two tiles east of its own edge.
  '0,14': { x: 23, y: 4 },
  '0,15': { x: 23, y: 5 },
  // Route 1 leaves south, again column for column.
  '8,27': { x: 8, y: 1 },
  '9,27': { x: 9, y: 1 },
  '10,27': { x: 10, y: 1 },
  '11,27': { x: 11, y: 1 },
};

/** Everything about a Viridian NPC except where they stand (that is the sketch's). */
const VIRIDIAN_NPC_DETAILS: Record<string, Omit<NPCData, 'id' | 'x' | 'y'>> = {
  viridian_npc1: {
    spriteColor: 0xc0c060,
    // Facing up the gym path, at the gate he is never going through.
    direction: Direction.UP,
    dialogue: [
      'VIRIDIAN CITY',
      'The Eternally Green\nParadise!',
    ],
  },
  viridian_npc2: {
    spriteColor: 0x60c0c0,
    direction: Direction.LEFT,
    dialogue: [
      "The POKEMON CENTER\nheals your POKeMON",
      "for free! Just talk\nto the nurse!",
    ],
  },
};

export const VIRIDIAN_CITY: MapData = (() => {
  const sketch = VIRIDIAN_CITY_SKETCH;
  const shape = createMapFromSketch(sketch.rows, sketch.legend);
  const { tiles, collision, tileKinds, width: W, height: H } = shape;

  // The Gym, the Center, the Mart and the house, stamped over the footprints
  // the sketch reserves for them. The public three keep their kind's board
  // (GYM / P / MART); only the house gets a chimney.
  for (const b of sketch.buildings) {
    stampBuilding(shape, b.kind, b.x, b.y, {
      w: b.w,
      h: b.h,
      door: b.door[0] - b.x,
      chimney: b.kind === 'house',
    });
  }

  return {
    id: 'viridian_city',
    name: 'VIRIDIAN CITY',
    width: W,
    height: H,
    tiles,
    collision,
    tileKinds,
    warps: [
      ...sketch.buildings.map(b => ({
        x: b.door[0],
        y: b.door[1],
        targetMap: b.warp,
        targetX: VIRIDIAN_DOOR_TARGETS[b.warp].x,
        targetY: VIRIDIAN_DOOR_TARGETS[b.warp].y,
      })),
      ...sketch.edgeWarps.map(([x, y, targetMap]) => ({
        x,
        y,
        targetMap,
        targetX: VIRIDIAN_EDGE_TARGETS[`${x},${y}`].x,
        targetY: VIRIDIAN_EDGE_TARGETS[`${x},${y}`].y,
      })),
    ],
    npcs: sketch.npcs.map(n => ({ id: n.id, x: n.x, y: n.y, ...VIRIDIAN_NPC_DETAILS[n.id] })),
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tiles
  setTile(4, H - 1, T.DOORMAT);
  setTile(5, H - 1, T.DOORMAT);

  return {
    id: 'pokemon_center',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'viridian_city', targetX: 15, targetY: 9 },
      { x: 5, y: H - 1, targetMap: 'viridian_city', targetX: 15, targetY: 9 },
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tile
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'pokemart',
    name: 'POKeMON MART',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'viridian_city', targetX: 15, targetY: 21 },
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
  fillRect(13, 15, 4, 1, T.ROOF);
  fillRect(13, 16, 4, 1, T.BUILDING);
  setTile(15, 16, T.DOOR);

  // Diglett's Cave entrance building (east section)
  fillRect(13, 22, 4, 1, T.ROOF);
  fillRect(13, 23, 4, 1, T.BUILDING);
  setTile(15, 23, T.DOOR);

  return {
    id: 'route2',
    entryGates: [
      // Viridian north gate: old man blocks the road until the Pokedex is in hand
      { from: ['viridian_city'], requires: { flag: 'has_pokedex' }, message: [
        'An old man is lying\nin the road...',
        "He won't let you\npass!",
        "Go deliver OAK's\nPARCEL first!",
      ] },
    ],
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
      { x: 15, y: 16, targetMap: 'oaks_aide_house', targetX: 3, targetY: 6 },
      // Diglett's Cave entrance door
      { x: 15, y: 23, targetMap: 'digletts_cave', targetX: 6, targetY: 2 },
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tile
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'oaks_aide_house',
    name: "OAK's AIDE's HOUSE",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'route2', targetX: 15, targetY: 17 },
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
  const W = 30, H = 45;  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.TREE, { startSolid: true });

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

// ─── Pewter City ─────────────────────────────────────────────────────────────
//
// Built FROM its sketch (`sketches/pewterCity.ts`). Gravel ground, the Museum
// up on its terrace behind a one-way ledge, Brock's Gym behind a fenced
// forecourt with a rock garden beside it.

/** Where each door warp drops the player inside the interior. */
const PEWTER_DOOR_TARGETS: Record<string, { x: number; y: number }> = {
  pewter_gym: { x: 4, y: 13 },
  pewter_museum_1f: { x: 8, y: 12 },
  pokemon_center_pewter: { x: 4, y: 7 },
  pokemart_pewter: { x: 3, y: 7 },
  pewter_house: { x: 3, y: 7 },
};

/** Where each edge warp lands on the next map, keyed by the town tile it sits on. */
const PEWTER_EDGE_TARGETS: Record<string, { x: number; y: number }> = {
  // Route 3 leaves east through the trees, two lanes onto its two west tiles.
  '24,12': { x: 1, y: 3 },
  '24,13': { x: 1, y: 4 },
  // South is Viridian Forest's north exit: two tiles, so the four town lanes
  // pair up onto them.
  '8,25': { x: 5, y: 2 },
  '9,25': { x: 5, y: 2 },
  '10,25': { x: 6, y: 2 },
  '11,25': { x: 6, y: 2 },
};

/** Everything about a Pewter NPC except where they stand (that is the sketch's). */
const PEWTER_NPC_DETAILS: Record<string, Omit<NPCData, 'id' | 'x' | 'y'>> = {
  pewter_npc1: {
    spriteColor: 0xb0a090,
    direction: Direction.DOWN,
    dialogue: [
      'PEWTER CITY',
      'A Stone Gray City!',
    ],
  },
  pewter_npc2: {
    spriteColor: 0x80c080,
    // On the terrace approach, facing the museum stairs.
    direction: Direction.LEFT,
    dialogue: [
      "BROCK is PEWTER GYM's\nleader!",
      "He uses ROCK-type\nPOKeMON!",
    ],
  },
  pewter_guide: {
    spriteColor: 0xe0c060,
    // At the east end of the main street, facing the road to Route 3.
    direction: Direction.UP,
    dialogue: [
      "Hey! You're not going\nto ROUTE 3 without",
      "going to the GYM,\nare you?",
      "You should challenge\nBROCK first!",
    ],
  },
};

export const PEWTER_CITY: MapData = (() => {
  const sketch = PEWTER_CITY_SKETCH;
  const shape = createMapFromSketch(sketch.rows, sketch.legend);
  const { tiles, collision, tileKinds, width: W, height: H } = shape;

  // Gym, Museum, Center, Mart and a house. The Museum is a landmark: no board
  // (its name is on the SIGN beside it) and two wall rows of windows, which is
  // what makes it read as the two-storey stone building on the terrace.
  for (const b of sketch.buildings) {
    stampBuilding(shape, b.kind, b.x, b.y, {
      w: b.w,
      h: b.h,
      door: b.door[0] - b.x,
      chimney: b.kind === 'house',
    });
  }

  return {
    id: 'pewter_city',
    name: 'PEWTER CITY',
    width: W,
    height: H,
    tiles,
    collision,
    tileKinds,
    warps: [
      ...sketch.buildings.map(b => ({
        x: b.door[0],
        y: b.door[1],
        targetMap: b.warp,
        targetX: PEWTER_DOOR_TARGETS[b.warp].x,
        targetY: PEWTER_DOOR_TARGETS[b.warp].y,
      })),
      ...sketch.edgeWarps.map(([x, y, targetMap]) => ({
        x,
        y,
        targetMap,
        targetX: PEWTER_EDGE_TARGETS[`${x},${y}`].x,
        targetY: PEWTER_EDGE_TARGETS[`${x},${y}`].y,
      })),
    ],
    npcs: sketch.npcs.map(n => ({ id: n.id, x: n.x, y: n.y, ...PEWTER_NPC_DETAILS[n.id] })),
  };
})();

export const PEWTER_GYM: MapData = (() => {
  const W = 10, H = 14;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tiles
  setTile(4, H - 1, T.DOORMAT);
  setTile(5, H - 1, T.DOORMAT);

  return {
    id: 'pewter_gym',
    name: 'PEWTER GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'pewter_city', targetX: 5, targetY: 8 },
      { x: 5, y: H - 1, targetMap: 'pewter_city', targetX: 5, targetY: 8 },
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
    { x: 4, y: base.height - 1, targetMap: 'pewter_city', targetX: 14, targetY: 20 },
    { x: 5, y: base.height - 1, targetMap: 'pewter_city', targetX: 14, targetY: 20 },
  ];
  return base;
})();

export const ROUTE3: MapData = (() => {
  const W = 50, H = 18;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
  fillRect(42, 1, 5, 1, T.ROOF);
  fillRect(42, 2, 5, 3, T.BUILDING);
  setTile(44, 4, T.DOOR);
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
      { x: 44, y: 4, targetMap: 'pokemon_center_route3', targetX: 4, targetY: 7 },
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
    { x: 4, y: base.height - 1, targetMap: 'route3', targetX: 44, targetY: 5 },
    { x: 5, y: base.height - 1, targetMap: 'route3', targetX: 44, targetY: 5 },
  ];
  return base;
})();

// Viridian Gym (Giovanni - 8th gym, Ground type)
export const VIRIDIAN_GYM: MapData = (() => {
  const W = 10, H = 14;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on warp tiles
  setTile(4, H - 1, T.DOORMAT);
  setTile(5, H - 1, T.DOORMAT);

  return {
    id: 'viridian_gym',
    entryGates: [
      // Locked until Giovanni is beaten at Silph Co.
      { requires: { flag: 'giovanni_silph' }, message: [
        "The door is locked...",
        "The GYM LEADER is\naway.",
      ] },
    ],
    name: 'VIRIDIAN GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'viridian_city', targetX: 5, targetY: 8 },
      { x: 5, y: H - 1, targetMap: 'viridian_city', targetX: 5, targetY: 8 },
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

// --- Viridian House (generic NPC house) ---
export const VIRIDIAN_HOUSE: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(3, 4, T.CARPET); setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET); setTile(4, 5, T.CARPET);
  setTile(2, 2, T.PC); setTile(5, 2, T.MART_SHELF);
  setTile(3, H - 1, T.DOOR);
  // Entrance mat on warp tile
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'viridian_house', name: 'VIRIDIAN HOUSE', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'viridian_city', targetX: 22, targetY: 21 }],
    npcs: [{
      id: 'viridian_house_npc', x: 4, y: 3, spriteColor: 0xc0a060, direction: Direction.DOWN,
      dialogue: ['Did you know that you\ncan use CUT outside', 'of battle to chop\ndown small trees?'],
    }],
  };
})();

// --- Pewter Pokemart ---
export const POKEMART_PEWTER: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(5, 2, T.MART_SHELF); setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF); setTile(6, 4, T.MART_SHELF);
  // Entrance mat on warp tile
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'pokemart_pewter', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'pewter_city', targetX: 4, targetY: 20 }],
    npcs: [{
      id: 'mart_clerk_pewter', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['poke_ball', 'potion', 'escape_rope', 'antidote', 'burn_heal', 'awakening', 'paralyze_heal'],
    }],
  };
})();

// --- Pewter House (generic NPC house) ---
export const PEWTER_HOUSE: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(3, 4, T.CARPET); setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET); setTile(4, 5, T.CARPET);
  setTile(2, 2, T.MART_SHELF); setTile(5, 2, T.MART_SHELF);
  setTile(3, H - 1, T.DOOR);
  // Entrance mat on warp tile
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'pewter_house', name: 'PEWTER HOUSE', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'pewter_city', targetX: 20, targetY: 21 }],
    npcs: [{
      id: 'pewter_house_npc', x: 4, y: 3, spriteColor: 0xa080c0, direction: Direction.DOWN,
      dialogue: ["BROCK's POKeMON are\nall ROCK-type.", 'Use WATER or GRASS\ntype moves to win!'],
    }],
  };
})();

// --- Pewter Museum ---
export const PEWTER_MUSEUM_1F: MapData = (() => {
  const W = 18, H = 14;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR, { solid: MUSEUM_SOLID });
  // Walls: top 2 rows, left/right edges, bottom edge
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  fillRect(0, H - 1, W, 1, T.WALL);
  // Exit doors at bottom
  setTile(8, H - 1, T.DOOR); setTile(9, H - 1, T.DOOR);
  // Carpet runner down center (cols 8-9)
  for (let y = 2; y < H - 1; y++) { setTile(8, y, T.CARPET); setTile(9, y, T.CARPET); }
  // Fossil displays along top wall (row 2)
  setTile(2, 2, T.FOSSIL_DISPLAY); setTile(3, 2, T.FOSSIL_DISPLAY);
  setTile(6, 2, T.FOSSIL_DISPLAY); setTile(7, 2, T.FOSSIL_DISPLAY);
  setTile(10, 2, T.EXHIBIT_CASE); setTile(11, 2, T.EXHIBIT_CASE);
  setTile(14, 2, T.EXHIBIT_CASE); setTile(15, 2, T.EXHIBIT_CASE);
  // Museum plaques in front of exhibits (row 3)
  setTile(2, 3, T.MUSEUM_PLAQUE); setTile(6, 3, T.MUSEUM_PLAQUE);
  setTile(10, 3, T.MUSEUM_PLAQUE); setTile(14, 3, T.MUSEUM_PLAQUE);
  // Side exhibit cases (rows 5-6)
  setTile(2, 5, T.EXHIBIT_CASE); setTile(3, 5, T.EXHIBIT_CASE);
  setTile(14, 5, T.EXHIBIT_CASE); setTile(15, 5, T.EXHIBIT_CASE);
  // Reception counter on left (rows 8-9)
  fillRect(2, 8, 4, 1, T.COUNTER);
  // Stairs area on right — door at (16, 7)
  setTile(16, 7, T.DOOR);
  return {
    id: 'pewter_museum_1f', name: 'PEWTER MUSEUM 1F', width: W, height: H, tiles, collision,
    warps: [
      { x: 8, y: H - 1, targetMap: 'pewter_city', targetX: 16, targetY: 7 },
      { x: 9, y: H - 1, targetMap: 'pewter_city', targetX: 16, targetY: 7 },
      // Stairs to 2F
      { x: 16, y: 7, targetMap: 'pewter_museum_2f', targetX: 16, targetY: 11 },
    ],
    npcs: [
      {
        id: 'museum_receptionist', x: 3, y: 9, spriteColor: 0x4060b0, direction: Direction.UP,
        dialogue: ['Welcome to PEWTER\nMUSEUM OF SCIENCE!', 'The 1st floor has\nour fossil exhibit.', 'The 2nd floor has\nour space exhibit.\nPlease enjoy!'],
      },
      {
        id: 'museum_ticket_clerk', x: 14, y: 8, spriteColor: 0x4060b0, direction: Direction.DOWN,
        dialogue: ['The 2nd floor has our\nspace exhibit.', "It's $50 for a\nticket. Would you\nlike to go up?"],
      },
      {
        id: 'museum_fossil_fan', x: 6, y: 4, spriteColor: 0x80c080, direction: Direction.UP,
        dialogue: ['Wow! Look at that\nKABUTOPS fossil!', "It's so well\npreserved!", 'I want to be a\nfossil hunter when\nI grow up!'],
      },
      {
        id: 'museum_scientist', x: 11, y: 4, spriteColor: 0xf0f0f0, direction: Direction.UP,
        dialogue: ["I'm researching\nfossils for PROF.\nOAK.", "Imagine if we could\nrevive these ancient\nPOKeMON!", "Science is truly\namazing!"],
      },
      {
        id: 'museum_kid', x: 3, y: 6, spriteColor: 0xe08050, direction: Direction.RIGHT,
        dialogue: ['Do you think there\nare more fossils\nunderground?', 'I bet MT. MOON has\ntons of them!'],
      },
      {
        id: 'museum_old_man', x: 14, y: 4, spriteColor: 0xb0a090, direction: Direction.UP,
        dialogue: ["I've been visiting\nthis museum for\n40 years.", 'The fossils never\nchange, but I keep\ngetting older!', 'Ha ha ha!'],
      },
    ],
  };
})();

export const PEWTER_MUSEUM_2F: MapData = (() => {
  const W = 18, H = 14;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR, { solid: MUSEUM_SOLID });
  // Walls: top 2 rows, left/right edges, bottom edge
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  fillRect(0, H - 1, W, 1, T.WALL);
  // 2x2 Space Shuttle centerpiece
  setTile(8, 4, T.SHUTTLE_DISPLAY); setTile(9, 4, T.SHUTTLE_DISPLAY);
  setTile(8, 5, T.SHUTTLE_DISPLAY); setTile(9, 5, T.SHUTTLE_DISPLAY);
  // Flanking plaques for shuttle
  setTile(7, 5, T.MUSEUM_PLAQUE); setTile(10, 5, T.MUSEUM_PLAQUE);
  // Exhibit cases along side walls
  setTile(2, 2, T.EXHIBIT_CASE); setTile(3, 2, T.EXHIBIT_CASE);  // Moon Stone
  setTile(6, 2, T.EXHIBIT_CASE); setTile(7, 2, T.EXHIBIT_CASE);  // Meteorite
  setTile(10, 2, T.EXHIBIT_CASE); setTile(11, 2, T.EXHIBIT_CASE); // Star charts
  setTile(14, 2, T.EXHIBIT_CASE); setTile(15, 2, T.EXHIBIT_CASE); // Rocket fuel
  // Plaques in front of top exhibits
  setTile(2, 3, T.MUSEUM_PLAQUE); setTile(6, 3, T.MUSEUM_PLAQUE);
  setTile(10, 3, T.MUSEUM_PLAQUE); setTile(14, 3, T.MUSEUM_PLAQUE);
  // Side exhibits (rows 7, 9)
  setTile(2, 7, T.EXHIBIT_CASE); setTile(3, 7, T.EXHIBIT_CASE);
  setTile(14, 7, T.EXHIBIT_CASE); setTile(15, 7, T.EXHIBIT_CASE);
  setTile(2, 8, T.MUSEUM_PLAQUE); setTile(14, 8, T.MUSEUM_PLAQUE);
  // Carpet runner center (cols 8-9, rows 7-12)
  for (let y = 7; y <= 12; y++) { setTile(8, y, T.CARPET); setTile(9, y, T.CARPET); }
  // Stairs back to 1F — door at (16, 11)
  setTile(16, 11, T.DOOR);
  return {
    id: 'pewter_museum_2f', name: 'PEWTER MUSEUM 2F', width: W, height: H, tiles, collision,
    entryGates: [
      { requires: { flag: 'museum_2f_ticket' }, message: [
        "You need a ticket\nto go upstairs!",
        "Please see the clerk\nat the front desk.",
      ] },
    ],
    warps: [
      // Stairs back to 1F
      { x: 16, y: 11, targetMap: 'pewter_museum_1f', targetX: 16, targetY: 8 },
    ],
    npcs: [
      {
        id: 'museum_astronomer', x: 7, y: 6, spriteColor: 0xf0f0f0, direction: Direction.UP,
        dialogue: ['That model is of the\nSpace Shuttle!', 'Did you know the\nfirst POKeMON in\nspace was a CLEFAIRY?', "It was aboard a\nrocket in 1969!"],
      },
      {
        id: 'museum_space_fan', x: 3, y: 4, spriteColor: 0x6080c0, direction: Direction.RIGHT,
        dialogue: ['MOON STONEs are said\nto come from space!', 'Some people think\nCLEFAIRY came from\nthe moon!', "It's just a theory\nthough..."],
      },
      {
        id: 'museum_girl', x: 3, y: 8, spriteColor: 0xe06080, direction: Direction.UP,
        dialogue: ["Wow, that MOON STONE\nis so pretty!", "I heard it can make\ncertain POKeMON\nevolve!"],
      },
      {
        id: 'museum_nerd', x: 14, y: 4, spriteColor: 0x80b080, direction: Direction.LEFT,
        dialogue: ['Scientists found\namino acids in this\nmeteorite!', 'Could POKeMON have\ncome from outer\nspace?', "It's a fascinating\ntheory!"],
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
  pokemart_pewter: POKEMART_PEWTER,
  pewter_house: PEWTER_HOUSE,
  pewter_museum_1f: PEWTER_MUSEUM_1F,
  pewter_museum_2f: PEWTER_MUSEUM_2F,
  viridian_house: VIRIDIAN_HOUSE,
  route3: ROUTE3,
  pokemon_center_route3: POKEMON_CENTER_ROUTE3,
  // All remaining Kanto maps
  ...CERULEAN_MAPS,
  ...VERMILION_MAPS,
  ...CENTRAL_MAPS,
  ...SOUTH_MAPS,
  ...ENDGAME_MAPS,
  ...SILPH_MAPS,
  ...HIDEOUT_MAPS,
  ...TOWER_MAPS,
  ...CAVE_MAPS,
};
