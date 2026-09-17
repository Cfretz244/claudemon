import { MapData, NPCData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { createMapFromSketch, createMapShape, SketchShape, stampBuilding } from './mapBuilder';
import { VERMILION_CITY_SKETCH } from './sketches/vermilionCity';

const T = TileType;

// ---------------------------------------------------------------------------
// ROUTE 5 -- vertical route between Cerulean City and Route 6
// ---------------------------------------------------------------------------
export const ROUTE5: MapData = (() => {
  const W = 20, H = 20;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
//
// Built FROM its sketch (`sketches/vermilionCity.ts`), the way Pallet,
// Viridian, Pewter and Cerulean are: the rows draw the ground, the four
// buildings are stamped over their footprints with the kit, and every door
// warp, edge warp and NPC spot is read back out of the sketch. Dialogue and
// sprite colours stay here -- only *where* things are lives in the sketch.

/** Where each door warp drops the player inside the interior. */
const VERMILION_DOOR_TARGETS: Record<string, { x: number; y: number }> = {
  pokemart_vermilion: { x: 3, y: 7 },
  pokemon_center_vermilion: { x: 4, y: 7 },
  pokemon_fan_club: { x: 3, y: 7 },
  vermilion_gym: { x: 4, y: 13 },
};

/** Where each edge warp lands on the route, keyed by the town tile it sits on. */
const VERMILION_EDGE_TARGETS: Record<string, { x: number; y: number }> = {
  // Route 6 comes down from the north, onto the row above its own warp row.
  '11,0': { x: 9, y: 18 },
  '12,0': { x: 10, y: 18 },
  // Route 11 leaves east off the main street, one landing per lane.
  '29,12': { x: 2, y: 4 },
  '29,13': { x: 2, y: 5 },
  // The S.S. ANNE's gangway, at the end of the pier.
  '22,24': { x: 10, y: 12 },
  '23,24': { x: 10, y: 12 },
};

/** Everything about a Vermilion NPC except where they stand (that is the sketch's). */
const VERMILION_NPC_DETAILS: Record<string, Omit<NPCData, 'id' | 'x' | 'y'>> = {
  vermilion_npc1: {
    spriteColor: 0x6080c0,
    direction: Direction.DOWN,
    dialogue: [
      'VERMILION CITY',
      'The Port of Exquisite\nSunsets!',
    ],
  },
  vermilion_npc3: {
    spriteColor: 0xc0a060,
    direction: Direction.DOWN,
    dialogue: [
      'LT. SURGE is the GYM\nLEADER here!',
      "He's an expert on\nELECTRIC-type POKeMON!",
      'Watch out for his\nRAICHU!',
    ],
  },
  vermilion_sailor: {
    spriteColor: 0x4060b0,
    direction: Direction.DOWN,
    dialogue: [
      'SAILOR: The S.S. ANNE\nis docked at the port!',
      'You need a ticket to\nget on board, though.',
    ],
  },
  // Fishing Guru - gives Old Rod
  fishing_guru_vermilion: {
    spriteColor: 0x8080c0,
    direction: Direction.DOWN,
    dialogue: [
      'FISHING GURU: Hello\nthere! I love fishing!',
    ],
  },
  // Officer Jenny - gives Squirtle after Thunder Badge
  vermilion_officer_jenny: {
    spriteColor: 0x4060c0,
    direction: Direction.DOWN,
    dialogue: [
      "OFFICER JENNY: I'm\npatrolling the city!",
    ],
  },
  // The Fan Club's board. It is an NPC rather than a SIGN tile so that it can
  // stand on the lawn below the building, and it now does: on the sketch it is
  // at (27,10), off the SIGN tiles, instead of on top of one. (It used to
  // carry a dead `isSign: true` that nothing in the game ever read, and that
  // only typechecked because it sat in an un-contextually-typed IIFE.)
  vermilion_fan_club_sign: {
    spriteColor: 0x000000,
    direction: Direction.DOWN,
    dialogue: [
      'POKeMON FAN CLUB',
    ],
  },
};

export const VERMILION_CITY: MapData = (() => {
  const sketch = VERMILION_CITY_SKETCH;
  const shape = createMapFromSketch(sketch.rows, sketch.legend);
  const { tiles, collision, tileKinds, width: W, height: H } = shape;

  for (const b of sketch.buildings) {
    stampBuilding(shape, b.kind, b.x, b.y, {
      w: b.w,
      h: b.h,
      door: b.door[0] - b.x,
      chimney: b.kind === 'house',
    });
  }

  return {
    id: 'vermilion_city',
    name: 'VERMILION CITY',
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
        targetX: VERMILION_DOOR_TARGETS[b.warp].x,
        targetY: VERMILION_DOOR_TARGETS[b.warp].y,
      })),
      ...sketch.edgeWarps.map(([x, y, targetMap]) => ({
        x,
        y,
        targetMap,
        targetX: VERMILION_EDGE_TARGETS[`${x},${y}`].x,
        targetY: VERMILION_EDGE_TARGETS[`${x},${y}`].y,
      })),
    ],
    npcs: sketch.npcs.map(n => ({ id: n.id, x: n.x, y: n.y, ...VERMILION_NPC_DETAILS[n.id] })),
  };
})();

// ---------------------------------------------------------------------------
// VERMILION GYM -- Lt. Surge's electric gym (indoor)
// ---------------------------------------------------------------------------
export const VERMILION_GYM: MapData = (() => {
  const W = 10, H = 16;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on exit warps
  setTile(4, 15, T.DOORMAT);
  setTile(5, 15, T.DOORMAT);

  return {
    id: 'vermilion_gym',
    name: 'VERMILION GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 15, targetMap: 'vermilion_city', targetX: 6, targetY: 21 },
      { x: 5, y: 15, targetMap: 'vermilion_city', targetX: 6, targetY: 21 },
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
  setTile(4, 5, T.CARPET);
  setTile(5, 5, T.CARPET);
  setTile(4, 6, T.CARPET);
  setTile(5, 6, T.CARPET);

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT);
  setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_vermilion',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'vermilion_city', targetX: 17, targetY: 8 },
      { x: 5, y: 7, targetMap: 'vermilion_city', targetX: 17, targetY: 8 },
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
      { x: 0, y: 6, targetMap: 'cerulean_city', targetX: 23, targetY: 13 },
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Vertical path
  fillRect(8, 0, 4, 25, T.PATH);

  // Tree borders on sides (2 tiles thick)
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // --- North section (above mountain) ---

  // Tall grass patches
  fillRect(3, 3, 4, 3, T.TALL_GRASS);
  fillRect(13, 1, 4, 3, T.TALL_GRASS);

  // Pokemon Center (above the mountain, clear of trees and grass)
  fillRect(12, 4, 5, 1, T.ROOF);
  fillRect(12, 5, 5, 3, T.BUILDING);
  setTile(14, 7, T.DOOR);

  // Sign near north entrance
  setTile(8, 8, T.SIGN);
  // Scattered tree
  setTile(6, 7, T.TREE);

  // Power Plant access — water + entrance east of path (requires Surf)
  fillRect(14, 2, 3, 2, T.WATER);
  setTile(17, 2, T.DOOR); // Power Plant entrance (reachable only by Surfing)
  // Trees above and below the door's landing strip (17,3), so the only way
  // to the door is across the water; leaving the plant lands on the strip.
  setTile(17, 1, T.TREE);
  setTile(17, 4, T.TREE);

  // --- Mountain formation blocking passage (y=9 to y=14) ---
  // Spans full width between tree borders; extends into east/west borders
  // so the mountain looks like it continues beyond the visible area
  fillRect(2, 9, 18, 6, T.CAVE_WALL);

  // North cave entrance (walk into mountain from above)
  setTile(9, 9, T.CAVE_ENTRANCE);
  // South cave exit (walk into mountain from below)
  setTile(9, 14, T.CAVE_ENTRANCE);

  // --- South section (below mountain) ---

  // Tall grass patches
  fillRect(3, 16, 5, 3, T.TALL_GRASS);
  fillRect(13, 18, 4, 4, T.TALL_GRASS);

  // Scattered tree
  setTile(7, 20, T.TREE);

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
      // Rock Tunnel north entrance (enter from above, arrive at south end of cave)
      { x: 9, y: 9, targetMap: 'rock_tunnel', targetX: 15, targetY: 27 },
      // Rock Tunnel south exit (enter from below, arrive at north end of cave)
      { x: 9, y: 14, targetMap: 'rock_tunnel', targetX: 15, targetY: 2 },
      // Power Plant entrance (via Surf)
      { x: 17, y: 2, targetMap: 'power_plant', targetX: 9, targetY: 19 },
      // Pokemon Center door
      { x: 14, y: 7, targetMap: 'pokemon_center_route10', targetX: 4, targetY: 7 },
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
// ROCK TUNNEL 1F + B1F -- dark cave between the Route 10 segments, two floors
// drawn as sketches
// ---------------------------------------------------------------------------
//
// Sketches are drawn from corridor segments by tools/rock-floors.mjs in the
// helper repo (which also checks them); tests/data/rockTunnel.test.ts proves
// the same facts on this data.
//
// The route folds back through the floor below twice: the south mouth (from
// Route 10's north section) -> 1F south region -> ladder d -> B1F region 1 ->
// ladder b -> 1F middle region -> ladder a -> B1F region 2 -> ladder c -> 1F
// north region -> the north mouth (to Route 10's south section). The three
// 1F regions never touch, nor do the two B1F regions. Corridors are one tile
// wide with empty dead ends on purpose: it is dark until Flash, and in the
// dark a dead end costs steps. Every ladder and mouth sits in a one-tile stub
// (a warp fires on entry, not on the tile you land on); items in dead ends;
// trainers in niches with sight range 1 facing the only corridor, two per
// region at the ladder mouths.
// Legend: # wall, . floor, E south mouth, X north mouth, a-d ladders (the
// same letter on both floors), i item ball, 1-6 trainers.
const RT_LEGEND: Record<string, TileType> = {
  '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, E: T.CAVE_FLOOR, X: T.CAVE_FLOOR,
  a: T.CAVE_ENTRANCE, b: T.CAVE_ENTRANCE, c: T.CAVE_ENTRANCE, d: T.CAVE_ENTRANCE,
  i: T.CAVE_FLOOR, '1': T.CAVE_FLOOR, '2': T.CAVE_FLOOR, '3': T.CAVE_FLOOR, '4': T.CAVE_FLOOR, '5': T.CAVE_FLOOR, '6': T.CAVE_FLOOR,
};

const RT_1F = createMapFromSketch([
  '###############X################',
  '###############.################',
  '######..........################',
  '######.###.#########.###########',
  '#####6.###i#########.###########',
  '######.#########5###.###########',
  '######........................##',
  '########################c#######',
  '######################4#########',
  '########.....................a##',
  '########.#####.#################',
  '########.#######################',
  '####.......................#####',
  '##################2###.###.#####',
  '############i#######.#####.#####',
  '###b.......................#####',
  '################################',
  '################################',
  '########d#######################',
  '########....................####',
  '############1##############.####',
  '###################.#######.3###',
  '###################.#######.####',
  '####........................####',
  '####.###########################',
  '####.#######.###################',
  '####.#######.#######i###########',
  '####...................#########',
  '###############.################',
  '###############E################',
], RT_LEGEND);
const RT_B1F = createMapFromSketch([
  '##############################',
  '##############################',
  '##################2###########',
  '###........................###',
  '##########.#####.#####.###.###',
  '##########.#####.#####.###.###',
  '#########4.####i######.###..i#',
  '##########.####.##########.###',
  '##########...........#####.###',
  '##############.#####c#####.###',
  '##############.###########a###',
  '##############################',
  '###b############3#############',
  '###..................#########',
  '##########.######.##.#########',
  '##########.######.##.#########',
  '##########.######.##.#########',
  '####################.#########',
  '######.....................###',
  '######.#######.###############',
  '######.1######.###############',
  '######.#######.###############',
  '######.#######i###############',
  '######.......#################',
  '######.#######################',
  '######d#######################',
  '##############################',
  '##############################',
], RT_LEGEND);

/** The one open tile beside a stub (where a ladder lands the player). */
const rtBeside = (s: SketchShape, ch: string) => {
  const p = s.findOne(ch);
  const open = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    .map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(q => s.tiles[q.y]?.[q.x] === T.CAVE_FLOOR);
  if (open.length !== 1) throw new Error(`rock tunnel: '${ch}' is not in a stub`);
  return open[0];
};
/** Ladder `ch` on `s` to the same letter on `other` (landing on the tile beside it). */
const rtLadder = (s: SketchShape, ch: string, other: SketchShape, otherId: string) => {
  const land = rtBeside(other, ch);
  return { ...s.findOne(ch), targetMap: otherId, targetX: land.x, targetY: land.y };
};
const rtItems = (s: SketchShape, prefix: string, itemIds: string[]): NPCData[] => {
  const spots = s.find('i');
  if (spots.length !== itemIds.length) throw new Error(`${prefix}: ${spots.length} item tiles for ${itemIds.length} items`);
  return spots.map((p, n) => ({ id: `${prefix}_${itemIds[n]}`, ...p, spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: itemIds[n] }));
};
const rtTrainer = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor: number): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue, isTrainer: true, sightRange: 1,
});
const rtFloor = (id: string, name: string, s: SketchShape, extras: Pick<MapData, 'warps' | 'npcs' | 'wildEncounters'>): MapData => ({
  id, name, width: s.width, height: s.height, tiles: s.tiles, collision: s.collision, isDark: true, ...extras,
});
const HIKER = 0x908060, POKEMANIAC = 0x609080, LASS = 0xd08080, JR_TRAINER = 0xd08080;

export const ROCK_TUNNEL: MapData = rtFloor('rock_tunnel', 'ROCK TUNNEL 1F', RT_1F, {
  warps: [
    // The mouths: south (first: the floor's entry point) to Route 10's north section, north to its south section.
    { ...RT_1F.findOne('E'), targetMap: 'route10', targetX: 9, targetY: 8 },
    { ...RT_1F.findOne('X'), targetMap: 'route10', targetX: 9, targetY: 15 },
    rtLadder(RT_1F, 'd', RT_B1F, 'rock_tunnel_b1f'),   // south region (first: the floor's goal)
    rtLadder(RT_1F, 'b', RT_B1F, 'rock_tunnel_b1f'),   // middle region, where B1F region 1 comes up
    rtLadder(RT_1F, 'a', RT_B1F, 'rock_tunnel_b1f'),   // middle region, down again
    rtLadder(RT_1F, 'c', RT_B1F, 'rock_tunnel_b1f'),   // north region, where B1F region 2 comes up
  ],
  npcs: [
    ...rtItems(RT_1F, 'rock_tunnel', ['repel', 'revive', 'escape_rope']),
    rtTrainer(RT_1F, '1', 'rock_tunnel_trainer1', Direction.UP, [
      "HIKER: It's pitch\nblack in here!",
      "But I can still\nbattle!",
    ], HIKER),
    rtTrainer(RT_1F, '2', 'rock_tunnel_trainer2', Direction.UP, [
      "POKEMANIAC: I love\ncave POKeMON!",
      "Have you seen the\nONIX here?",
    ], POKEMANIAC),
    rtTrainer(RT_1F, '3', 'rock_tunnel_trainer3', Direction.LEFT, [
      "HIKER: This tunnel\ngoes on forever!",
      "Let me test your\nstrength!",
    ], 0xc08050),
    rtTrainer(RT_1F, '4', 'rock_tunnel_trainer4', Direction.DOWN, [
      "HIKER: The rocks\nhere are amazing!",
      "Let me show you!",
    ], HIKER),
    rtTrainer(RT_1F, '5', 'rock_tunnel_trainer5', Direction.DOWN, [
      "LASS: I'm not\nafraid of the dark!",
      "Are you?",
    ], LASS),
    rtTrainer(RT_1F, '6', 'rock_tunnel_trainer6', Direction.RIGHT, [
      "HIKER: I've been\nlost for days!",
      "Battle me to\npass the time!",
    ], HIKER),
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
});

export const ROCK_TUNNEL_B1F: MapData = rtFloor('rock_tunnel_b1f', 'ROCK TUNNEL B1F', RT_B1F, {
  warps: [
    rtLadder(RT_B1F, 'd', RT_1F, 'rock_tunnel'),   // region 1's arrival (first: the floor's entry point)
    rtLadder(RT_B1F, 'b', RT_1F, 'rock_tunnel'),   // region 1's way up
    rtLadder(RT_B1F, 'a', RT_1F, 'rock_tunnel'),   // region 2's arrival
    rtLadder(RT_B1F, 'c', RT_1F, 'rock_tunnel'),   // region 2's way up
  ],
  npcs: [
    ...rtItems(RT_B1F, 'rock_tunnel_b1f', ['rare_candy', 'escape_rope', 'super_potion']),
    rtTrainer(RT_B1F, '1', 'rock_tunnel_b1f_trainer1', Direction.LEFT, [
      "POKEMANIAC: The lower\nlevels have rare ones!",
      "Let me show you!",
    ], POKEMANIAC),
    rtTrainer(RT_B1F, '2', 'rock_tunnel_b1f_trainer2', Direction.DOWN, [
      "JR. TRAINER: I came\nhere to train!",
      "Battle me!",
    ], JR_TRAINER),
    rtTrainer(RT_B1F, '3', 'rock_tunnel_b1f_trainer3', Direction.DOWN, [
      "HIKER: You made it\ndown here too?",
      "Impressive!",
    ], HIKER),
    rtTrainer(RT_B1F, '4', 'rock_tunnel_b1f_trainer4', Direction.RIGHT, [
      "LASS: My POKeMON\naren't afraid!",
      "Neither am I!",
    ], LASS),
  ],
  wildEncounters: {
    grassRate: 0.08,
    encounters: [
      { speciesId: 41, minLevel: 17, maxLevel: 20, weight: 35 }, // Zubat
      { speciesId: 74, minLevel: 17, maxLevel: 20, weight: 20 }, // Geodude
      { speciesId: 66, minLevel: 17, maxLevel: 20, weight: 15 }, // Machop
      { speciesId: 95, minLevel: 18, maxLevel: 19, weight: 15 }, // Onix
      { speciesId: 104, minLevel: 17, maxLevel: 20, weight: 15 }, // Cubone
    ],
  },
});

// ---------------------------------------------------------------------------
// POKEMON CENTER ROUTE 10 (indoor)
// ---------------------------------------------------------------------------
export const POKEMON_CENTER_ROUTE10: MapData = (() => {
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
  setTile(4, 5, T.CARPET);
  setTile(5, 5, T.CARPET);
  setTile(4, 6, T.CARPET);
  setTile(5, 6, T.CARPET);

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT);
  setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_route10',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'route10', targetX: 14, targetY: 8 },
      { x: 5, y: 7, targetMap: 'route10', targetX: 14, targetY: 8 },
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on exit warp
  setTile(3, 7, T.DOORMAT);

  return {
    id: 'pokemart_vermilion',
    name: 'POKeMON MART',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'vermilion_city', targetX: 5, targetY: 8 },
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

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
    entryGates: [
      { requires: { item: 'ss_ticket' }, message: [
        "You need an S.S.\nTICKET to board!",
      ] },
      // Once departed, only block boarding from the dock (not moving between decks)
      { from: ['vermilion_city'], requires: { notFlag: 'ss_anne_departed' }, message: [
        "The S.S. ANNE has\nalready departed...",
      ] },
    ],
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.PATH);

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

// ---------------------------------------------------------------------------
// POKEMON FAN CLUB -- chairman gives BIKE VOUCHER (indoor, 8x8)
// ---------------------------------------------------------------------------
export const POKEMON_FAN_CLUB: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Table / counter for the chairman
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);

  // Carpet runner
  setTile(3, 4, T.CARPET); setTile(3, 5, T.CARPET); setTile(3, 6, T.CARPET);

  // Entrance mat
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'pokemon_fan_club',
    name: 'POKeMON FAN CLUB',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'vermilion_city', targetX: 25, targetY: 8 },
    ],
    npcs: [
      {
        id: 'fan_club_chairman',
        x: 2, y: 2,
        spriteColor: 0xc0a060,
        direction: Direction.DOWN,
        dialogue: [
          "CHAIRMAN: Welcome to\nthe POKeMON FAN CLUB!",
          "I'm the chairman!\nLet me tell you about\nmy darling RAPIDASH!",
        ],
      },
      {
        id: 'fan_club_member1',
        x: 5, y: 4,
        spriteColor: 0x60a060,
        direction: Direction.LEFT,
        dialogue: [
          "I love EEVEE!\nIt's so cute!",
        ],
      },
      {
        id: 'fan_club_member2',
        x: 5, y: 6,
        spriteColor: 0xe06080,
        direction: Direction.UP,
        dialogue: [
          "My PIKACHU is the\nbest in the world!",
        ],
      },
    ],
  };
})();

// ---------------------------------------------------------------------------
// POWER PLANT -- one floor drawn as a sketch (Surf entry from Route 10)
// ---------------------------------------------------------------------------
//
// Drawn from corridor segments by tools/plant-floors.mjs in the helper repo
// (which also checks it); tests/data/powerPlant.test.ts proves the same facts
// on this data. Rows of machinery walked back and forth from the door to
// Zapdos in a stub at the far end of the top row; item balls in stubs off
// the rows, three of them Voltorb/Electrode ambushes (`ambush`: the ball is
// gone and a wild battle starts); an Engineer in a niche at the end of three
// of the rows, sight range 1. Empty dead ends on purpose.
// Legend: # wall, . floor, E the door, i item ball, v Voltorb ambush,
// e Electrode ambush, Z Zapdos, 1-3 the Engineers.
const PP_LEGEND: Record<string, TileType> = {
  '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, E: T.CAVE_FLOOR, i: T.CAVE_FLOOR, v: T.CAVE_FLOOR, e: T.CAVE_FLOOR,
  Z: T.CAVE_FLOOR, '1': T.CAVE_FLOOR, '2': T.CAVE_FLOOR, '3': T.CAVE_FLOOR,
};

const PP_SKETCH = createMapFromSketch([
  '####################',
  '####################',
  '##................Z#',
  '#3.###########.#####',
  '##.#######.#########',
  '##................##',
  '######i##########.##',
  '###.#############.##',
  '###.########e####.##',
  '##................##',
  '##.#####v######.####',
  '#2.############.####',
  '##.###########i#####',
  '##................##',
  '#####v###########.##',
  '#########.#######.1#',
  '#########.##i####.##',
  '##................##',
  '#########.##########',
  '#########E##########',
], PP_LEGEND);

const ppBall = (p: { x: number; y: number }, id: string, extra: Partial<NPCData>): NPCData =>
  ({ id, ...p, spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, ...extra });
const ppEngineer = (ch: string, id: string, direction: Direction, dialogue: string[], spriteColor: number): NPCData =>
  ({ id, ...PP_SKETCH.findOne(ch), spriteColor, direction, dialogue, isTrainer: true, sightRange: 1 });

export const POWER_PLANT: MapData = {
  id: 'power_plant',
  name: 'POWER PLANT',
  width: PP_SKETCH.width,
  height: PP_SKETCH.height,
  tiles: PP_SKETCH.tiles,
  collision: PP_SKETCH.collision,
  warps: [
    // Exit back to Route 10
    { ...PP_SKETCH.findOne('E'), targetMap: 'route10', targetX: 17, targetY: 3 },
  ],
  npcs: [
    {
      id: 'zapdos_power_plant',
      ...PP_SKETCH.findOne('Z'),
      spriteColor: 0xf0d030,
      direction: Direction.LEFT,
      dialogue: [
        'A legendary bird\nPOKeMON is here!',
        "Electricity crackles\nall around it!",
        "It's ZAPDOS!",
      ],
      isTrainer: false,
    },
    ppEngineer('1', 'pp_trainer1', Direction.LEFT, [
      'ENGINEER: This old\npower plant is full',
      'of Electric-type\nPOKeMON!',
    ], 0x808080),
    ppEngineer('2', 'pp_trainer2', Direction.RIGHT, [
      'ENGINEER: Something\npowerful lives deep',
      'inside this plant!',
    ], 0x707070),
    ppEngineer('3', 'pp_trainer3', Direction.RIGHT, [
      'ENGINEER: The\nelectricity here is',
      'dangerous! Be\ncareful!',
    ], 0x909090),
    // Real item balls, in the order the player meets them ('i' tiles are row-major: TM25 is the top one).
    ppBall(PP_SKETCH.find('i')[2], 'pp_max_potion', { itemId: 'max_potion' }),
    ppBall(PP_SKETCH.find('i')[1], 'pp_tm33_reflect', { itemId: 'tm33_reflect' }),
    ppBall(PP_SKETCH.find('i')[0], 'pp_tm25_thunder', { itemId: 'tm25_thunder' }),
    // Fake ones: Voltorb and Electrode ambushes (Gen I levels).
    ppBall(PP_SKETCH.find('v')[1], 'pp_voltorb1', { ambush: { speciesId: 100, level: 40 } }),
    ppBall(PP_SKETCH.find('v')[0], 'pp_voltorb2', { ambush: { speciesId: 100, level: 40 } }),
    ppBall(PP_SKETCH.find('e')[0], 'pp_electrode', { ambush: { speciesId: 101, level: 43 } }),
  ],
  wildEncounters: {
    grassRate: 0.10,
    encounters: [
      { speciesId: 100, minLevel: 30, maxLevel: 35, weight: 25 }, // Voltorb
      { speciesId: 25, minLevel: 30, maxLevel: 33, weight: 15 },  // Pikachu
      { speciesId: 81, minLevel: 30, maxLevel: 35, weight: 20 },  // Magnemite
      { speciesId: 82, minLevel: 33, maxLevel: 37, weight: 10 },  // Magneton
      { speciesId: 125, minLevel: 35, maxLevel: 38, weight: 15 }, // Electabuzz
      { speciesId: 101, minLevel: 35, maxLevel: 38, weight: 15 }, // Electrode
    ],
  },
};


export const VERMILION_MAPS: Record<string, MapData> = {
  route5: ROUTE5,
  route6: ROUTE6,
  vermilion_city: VERMILION_CITY,
  vermilion_gym: VERMILION_GYM,
  pokemon_center_vermilion: POKEMON_CENTER_VERMILION,
  pokemart_vermilion: POKEMART_VERMILION,
  pokemon_fan_club: POKEMON_FAN_CLUB,
  route9: ROUTE9,
  route10: ROUTE10,
  rock_tunnel: ROCK_TUNNEL,
  rock_tunnel_b1f: ROCK_TUNNEL_B1F,
  pokemon_center_route10: POKEMON_CENTER_ROUTE10,
  ss_anne: SS_ANNE,
  ss_anne_2f: SS_ANNE_2F,
  ss_anne_b1f: SS_ANNE_B1F,
  ss_anne_deck: SS_ANNE_DECK,
  power_plant: POWER_PLANT,
};
