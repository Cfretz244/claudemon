import { MapData, NPCData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { createMapFromSketch, createMapShape, SketchShape } from './mapBuilder';

const T = TileType;

// ─────────────────────────────────────────────────────────────
// 1. MT MOON  1F, B1F, B2F — three floors drawn as sketches
// ─────────────────────────────────────────────────────────────
//
// Sketches are checked by tools/moon-floors.mjs in the helper repo;
// tests/data/mtMoon.test.ts proves the same facts on this data.
//
// 1F has two sealed halves. The entrance half: the mouth from Route 3, the
// ladders a, b, c down to B1F, four trainers in niches, the scientist, a
// POTION and an ESCAPE ROPE. The exit half: the mouth to Route 4, the ladder
// d that the fossil chamber's way out comes up, and a RARE CANDY. The only
// way from Route 3 to Route 4 is down a, across B1F and B2F, and up d.
// B1F is four landings that never touch (Gen I): each has one ladder up and
// one ladder down. a's landing (the way on) has a Rocket and the REVIVE; b's
// and c's have a trainer each; d's (the way home) is quiet.
// B2F: p (from a's landing) lands beside the fossil chamber, but a wall is in
// the way. The corridor climbs, runs the top and right edges past two Rockets
// and a side passage where Jessie & James wait, to the Rocket guard who
// blocks the corridor and will not move until they are beaten; then along the
// bottom and back up the middle to the Super Nerd, who blocks the corridor
// before the chamber. The two fossils sit in the chamber's stubs, and s (the
// way home, up to d) is two tiles from p. q and r (from b's and c's landings)
// are item pockets: a SUPER POTION and TM12.
// Every ladder and mouth sits in a one-tile stub (a warp fires on entry, not
// on the tile you land on); items in dead ends; trainers in niches with
// sight range 1 facing the only corridor.
// Legend: # wall, . floor, E the mouth from Route 3, X the mouth to Route 4,
// a-d ladders 1F<->B1F, p-s ladders B1F<->B2F (p under a ... s under d),
// i item ball, 1-4 trainers, S scientist, J/j Jessie/James, G the Rocket
// guard, N the fossil Super Nerd, F the two fossils.
const MM_LEGEND: Record<string, TileType> = {
  '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, E: T.CAVE_FLOOR, X: T.CAVE_FLOOR,
  a: T.CAVE_ENTRANCE, b: T.CAVE_ENTRANCE, c: T.CAVE_ENTRANCE, d: T.CAVE_ENTRANCE,
  p: T.CAVE_ENTRANCE, q: T.CAVE_ENTRANCE, r: T.CAVE_ENTRANCE, s: T.CAVE_ENTRANCE,
  i: T.CAVE_FLOOR, '1': T.CAVE_FLOOR, '2': T.CAVE_FLOOR, '3': T.CAVE_FLOOR, '4': T.CAVE_FLOOR,
  S: T.CAVE_FLOOR, J: T.CAVE_FLOOR, j: T.CAVE_FLOOR, G: T.CAVE_FLOOR, N: T.CAVE_FLOOR, F: T.CAVE_FLOOR,
};

const MM_1F = createMapFromSketch([
  '####X#######################',
  '####.#######################',
  '####.....###################',
  '########.###################',
  '##.......###########3#######',
  '##.#########...........a####',
  '##......####.###############',
  '##i####d####.#####i#########',
  '############.#####.#########',
  '############...........#####',
  '########c#############.#####',
  '#######4.#############.2####',
  '########.#############.#####',
  '####...................#####',
  '####.#############.#########',
  '####.#############S#########',
  '####.#######################',
  '####.................#######',
  '##########.#########..######',
  '#########1.#########..######',
  '##########b#########.#######',
  '####################.#######',
  '######...............#######',
  '######..####.###############',
  '######..####i###############',
  '######E#####################',
], MM_LEGEND);
const MM_B1F = createMapFromSketch([
  '######################',
  '##a################b##',
  '##.......#####......##',
  '########.#####.#######',
  '##1......#####......2#',
  '###.###############.##',
  '###......#####......##',
  '###i####p#####q#######',
  '######################',
  '########c#######d#####',
  '###......#####....####',
  '###.##########.#######',
  '###.....######....####',
  '#####3#.#########.####',
  '#######.######....####',
  '###r....######s#######',
  '######################',
  '######################',
], MM_LEGEND);
const MM_B2F = createMapFromSketch([
  '########################',
  '##q###########2#########',
  '##.###................##',
  '##..i#.##############.##',
  '######.##############.##',
  '#####1.##############.##',
  '######.##############.##',
  '######.##############.##',
  '######.##F###########.##',
  '######p#s...F########.##',
  '#########...####J.....##',
  '###########N####j####.##',
  '###########.#########.##',
  '###########.#########.##',
  '###########.#########G##',
  '####i######.#########.##',
  '##...######.#########.##',
  '##.########...........##',
  '##r#####################',
  '########################',
], MM_LEGEND);

/** The one open tile beside a stub (where a ladder lands the player). */
const mmBeside = (s: SketchShape, ch: string) => {
  const p = s.findOne(ch);
  const open = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    .map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(q => s.tiles[q.y]?.[q.x] === T.CAVE_FLOOR);
  if (open.length !== 1) throw new Error(`mt. moon: '${ch}' is not in a stub`);
  return open[0];
};
/** Ladder `ch` on `s` to the same letter on `other` (landing on the tile beside it). */
const mmLadder = (s: SketchShape, ch: string, other: SketchShape, otherId: string) => {
  const land = mmBeside(other, ch);
  return { ...s.findOne(ch), targetMap: otherId, targetX: land.x, targetY: land.y };
};
const mmItems = (s: SketchShape, prefix: string, itemIds: string[]): NPCData[] => {
  const spots = s.find('i');
  if (spots.length !== itemIds.length) throw new Error(`${prefix}: ${spots.length} item tiles for ${itemIds.length} items`);
  return spots.map((p, n) => ({ id: `${prefix}_${itemIds[n]}`, ...p, spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: itemIds[n] }));
};
const mmTrainer = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor: number): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue, isTrainer: true, sightRange: 1,
});
const mmTalker = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor: number): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue,
});
const mmFloor = (id: string, name: string, s: SketchShape, extras: Pick<MapData, 'warps' | 'npcs' | 'wildEncounters'>): MapData => ({
  id, name, width: s.width, height: s.height, tiles: s.tiles, collision: s.collision, ...extras,
});
const ROCKET = 0x404040;

export const MT_MOON: MapData = mmFloor('mt_moon', 'MT. MOON 1F', MM_1F, {
  warps: [
    // The mouths: south to Route 3 (first, so it is the floor's entry point), north to Route 4.
    { ...MM_1F.findOne('E'), targetMap: 'route3', targetX: 48, targetY: 8 },
    { ...MM_1F.findOne('X'), targetMap: 'route4', targetX: 2, targetY: 5 },
    mmLadder(MM_1F, 'a', MM_B1F, 'mt_moon_b1f'),   // the way on (first, so it is the floor's goal)
    mmLadder(MM_1F, 'b', MM_B1F, 'mt_moon_b1f'),
    mmLadder(MM_1F, 'c', MM_B1F, 'mt_moon_b1f'),
    mmLadder(MM_1F, 'd', MM_B1F, 'mt_moon_b1f'),   // the exit half: where the way home comes up
  ],
  npcs: [
    mmTrainer(MM_1F, '1', 'mt_moon_bug_catcher', Direction.RIGHT, [
      'BUG CATCHER: Even\ncaves have bugs!',
      "Don't underestimate\nthem!",
    ], 0xd09040),
    mmTrainer(MM_1F, '2', 'mt_moon_lass', Direction.LEFT, [
      "LASS: I'm looking for\nCLEFAIRY!",
      'I heard they live\nin this cave!',
    ], 0xd06090),
    mmTrainer(MM_1F, '3', 'mt_moon_rocket1', Direction.DOWN, [
      'ROCKET: Get out!\nThis cave belongs to\nTEAM ROCKET!',
      "We're after the\nfossils!",
    ], ROCKET),
    mmTrainer(MM_1F, '4', 'mt_moon_hiker', Direction.RIGHT, [
      'HIKER: I love these\nunderground trails!',
      'The rocks here are\namazing!',
    ], 0x908060),
    ...mmItems(MM_1F, 'mt_moon', ['rare_candy', 'escape_rope', 'potion']),
    mmTalker(MM_1F, 'S', 'mt_moon_scientist', Direction.UP, [
      'I study rare fossils\nfound in MT. MOON.',
      'CLEFAIRY are said to\ndance here on full',
      'moon nights!',
    ], 0xf0f0f0),
  ],
  wildEncounters: {
    grassRate: 0.08,
    encounters: [
      { speciesId: 41, minLevel: 7, maxLevel: 11, weight: 40 },  // Zubat
      { speciesId: 74, minLevel: 8, maxLevel: 11, weight: 25 },  // Geodude
      { speciesId: 46, minLevel: 8, maxLevel: 10, weight: 15 },  // Paras
      { speciesId: 35, minLevel: 8, maxLevel: 12, weight: 15 },  // Clefairy
      { speciesId: 104, minLevel: 8, maxLevel: 10, weight: 5 },  // Cubone
    ],
  },
});

export const MT_MOON_B1F: MapData = mmFloor('mt_moon_b1f', 'MT. MOON B1F', MM_B1F, {
  warps: [
    mmLadder(MM_B1F, 'a', MM_1F, 'mt_moon'),        // up (first: the floor's entry point)
    mmLadder(MM_B1F, 'b', MM_1F, 'mt_moon'),
    mmLadder(MM_B1F, 'c', MM_1F, 'mt_moon'),
    mmLadder(MM_B1F, 'd', MM_1F, 'mt_moon'),
    mmLadder(MM_B1F, 'p', MM_B2F, 'mt_moon_b2f'),   // down (first: the floor's goal)
    mmLadder(MM_B1F, 'q', MM_B2F, 'mt_moon_b2f'),
    mmLadder(MM_B1F, 'r', MM_B2F, 'mt_moon_b2f'),
    mmLadder(MM_B1F, 's', MM_B2F, 'mt_moon_b2f'),
  ],
  npcs: [
    mmTrainer(MM_B1F, '1', 'mt_moon_rocket2', Direction.RIGHT, [
      'ROCKET: We need these\nfossils for the boss!',
      'Get lost, kid!',
    ], ROCKET),
    mmTrainer(MM_B1F, '2', 'mt_moon_super_nerd', Direction.LEFT, [
      'SUPER NERD: I study\nfossils in this cave!',
      "Don't disturb me!",
    ], 0xc06060),
    mmTrainer(MM_B1F, '3', 'mt_moon_rocket3', Direction.UP, [
      'ROCKET: No one gets\npast me!',
      'TEAM ROCKET will\nrule this cave!',
    ], ROCKET),
    ...mmItems(MM_B1F, 'mt_moon_b1f', ['revive']),
  ],
  wildEncounters: {
    grassRate: 0.08,
    encounters: [
      { speciesId: 41, minLevel: 8, maxLevel: 12, weight: 35 },  // Zubat
      { speciesId: 74, minLevel: 9, maxLevel: 12, weight: 25 },  // Geodude
      { speciesId: 46, minLevel: 9, maxLevel: 11, weight: 15 },  // Paras
      { speciesId: 35, minLevel: 9, maxLevel: 12, weight: 15 },  // Clefairy
      { speciesId: 104, minLevel: 9, maxLevel: 11, weight: 10 }, // Cubone
    ],
  },
});

export const MT_MOON_B2F: MapData = mmFloor('mt_moon_b2f', 'MT. MOON B2F', MM_B2F, {
  warps: [
    mmLadder(MM_B2F, 'p', MM_B1F, 'mt_moon_b1f'),   // the arrival (first: the floor's entry point)
    mmLadder(MM_B2F, 'q', MM_B1F, 'mt_moon_b1f'),
    mmLadder(MM_B2F, 'r', MM_B1F, 'mt_moon_b1f'),
    mmLadder(MM_B2F, 's', MM_B1F, 'mt_moon_b1f'),   // the way home, beyond the fossil chamber
  ],
  npcs: [
    mmTrainer(MM_B2F, '1', 'mt_moon_rocket4', Direction.RIGHT, [
      'ROCKET: The fossils\nare ours!',
      "You'll never get\nthem!",
    ], ROCKET),
    mmTrainer(MM_B2F, '2', 'mt_moon_rocket5', Direction.DOWN, [
      'ROCKET: Scram, kid!\nThis is ROCKET turf!',
      'We guard the fossils!',
    ], ROCKET),
    // Fossil Super Nerd: stands in the corridor below the chamber, gone once beaten.
    mmTrainer(MM_B2F, 'N', 'mt_moon_fossil_nerd', Direction.DOWN, [
      'SUPER NERD: Hands off\nmy fossils!',
      "I found them first!\nThey're mine!",
    ], 0xc06060),
    // Fossil item balls in the chamber's two stubs (only visible after the nerd is beaten)
    { id: 'mt_moon_helix_fossil', ...MM_B2F.find('F')[0], spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: 'helix_fossil' },
    { id: 'mt_moon_dome_fossil', ...MM_B2F.find('F')[1], spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: 'dome_fossil' },
    // Rocket guard: blocks the right-edge corridor until Jessie & James are defeated
    mmTalker(MM_B2F, 'G', 'mt_moon_rocket_guard', Direction.UP, [
      'ROCKET: No one gets\nnear those fossils!',
      'JESSIE and JAMES\nwill deal with you!',
    ], ROCKET),
    // Jessie & James wait at the end of the side passage off the right edge
    mmTrainer(MM_B2F, 'J', 'jessie_mtmoon', Direction.RIGHT, [
      'JESSIE & JAMES: Prepare\nfor trouble!',
      'And make it double!',
      'To protect the world\nfrom devastation!',
      'To unite all peoples\nwithin our nation!',
      'JESSIE!',
      'JAMES!',
      'TEAM ROCKET blasts off\nat the speed of light!',
      'Surrender now or\nprepare to fight!',
      'MEOWTH: Meowth,\nthat\'s right!',
    ], 0xd02070),
    mmTalker(MM_B2F, 'j', 'james_mtmoon', Direction.RIGHT, [
      'JAMES: We\'re here on\nbehalf of the boss!',
      'These fossils are the\nproperty of TEAM\nROCKET!',
    ], 0x6060d0),
    ...mmItems(MM_B2F, 'mt_moon_b2f', ['super_potion', 'tm12_water_gun']),
  ],
  wildEncounters: {
    grassRate: 0.08,
    encounters: [
      { speciesId: 41, minLevel: 9, maxLevel: 12, weight: 30 },  // Zubat
      { speciesId: 74, minLevel: 9, maxLevel: 12, weight: 25 },  // Geodude
      { speciesId: 46, minLevel: 9, maxLevel: 12, weight: 15 },  // Paras
      { speciesId: 35, minLevel: 9, maxLevel: 12, weight: 20 },  // Clefairy (more common)
      { speciesId: 104, minLevel: 9, maxLevel: 12, weight: 10 }, // Cubone
    ],
  },
});

// ─────────────────────────────────────────────────────────────
// 2. ROUTE 4  (25x12 horizontal)
// ─────────────────────────────────────────────────────────────
export const ROUTE4: MapData = (() => {
  const W = 25, H = 12;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
    entryGates: [
      // Mt. Moon exit: boulders block the way out until a fossil is picked up
      { from: ['mt_moon'], requires: { flag: 'got_fossil' }, message: [
        "Boulders block the\npath ahead...",
        "You'll have to find\nanother way through.",
      ] },
    ],
    name: 'ROUTE 4',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance from Mt Moon 1F (north exit)
      { x: 0, y: 5, targetMap: 'mt_moon', targetX: 4, targetY: 1 },
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
  fillRect(3, 5, 6, 1, T.ROOF); fillRect(3, 6, 6, 4, T.BUILDING);
  setTile(6, 9, T.DOOR);

  // Pokemon Center (right area) — sits on the main path row so the NE corner
  // is free for the burgled house and its back garden.
  fillRect(16, 8, 5, 1, T.ROOF); fillRect(16, 9, 5, 3, T.BUILDING);
  setTile(18, 11, T.DOOR);

  // Pokemart (right, lower)
  fillRect(16, 15, 5, 1, T.ROOF); fillRect(16, 16, 5, 3, T.BUILDING);
  setTile(18, 18, T.DOOR);

  // Bike Shop (left, lower)
  fillRect(3, 15, 5, 1, T.ROOF); fillRect(3, 16, 5, 3, T.BUILDING);
  setTile(5, 18, T.DOOR);

  // Signs near gym and center
  setTile(5, 11, T.SIGN);   // Gym sign
  setTile(15, 11, T.SIGN);  // Pokemon Center sign

  // Bulbasaur house (small house north of path, center area)
  fillRect(14, 2, 3, 1, T.ROOF);
  fillRect(14, 3, 3, 2, T.BUILDING);
  setTile(15, 4, T.DOOR);

  // Burgled house (NE corner, as in Gen I): a 5-wide facade with a roof row,
  // the front door on the south face and the burglar's hole in the back wall.
  fillRect(18, 4, 5, 1, T.ROOF);
  fillRect(18, 5, 5, 2, T.BUILDING);
  setTile(20, 6, T.DOOR);   // front door  → burgled_house (3,6)
  setTile(20, 4, T.DOOR);   // hole in the back wall → burgled_house (3,2)

  // Its back garden (x18-22, y2-3) is sealed by the tree border to the north
  // and east, the house's roof row to the south and a short fence to the west:
  // the only way in is through the house.
  setTile(17, 2, T.FENCE);
  setTile(17, 3, T.FENCE);

  // Flowers and decoration
  setTile(9, 6, T.FLOWER);
  setTile(9, 7, T.FLOWER);
  setTile(15, 6, T.FLOWER);
  setTile(15, 7, T.FLOWER);
  setTile(9, 16, T.FLOWER);
  setTile(15, 16, T.FLOWER);

  // Water feature (pond near center of town)
  fillRect(6, 20, 3, 2, T.WATER);
  setTile(5, 20, T.FOUNTAIN);

  // CERULEAN CAVE: its mouth is in the north-west trees behind a pool that
  // must be surfed; the grass strip in front of it is cut off from the town.
  fillRect(2, 2, 6, 3, T.WATER);
  fillRect(3, 2, 3, 1, T.GRASS);
  setTile(4, 1, T.CAVE_ENTRANCE);

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

  // === Story progression gates ===

  // Fence at y:22, with the main road (x:10-13) left open so Route 5 is
  // reachable from the start — the town's south gate is a road, not a house.
  for (let x = 2; x <= 9; x++) setTile(x, 22, T.FENCE);
  for (let x = 14; x <= 22; x++) setTile(x, 22, T.FENCE);

  // CUT_TREE blocks east exit until player has Cut
  setTile(22, 12, T.CUT_TREE);
  setTile(22, 13, T.CUT_TREE);

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
      // Cerulean Cave mouth (behind the pool) → 1F, in front of the door
      { x: 4, y: 1, targetMap: 'cerulean_cave_1f', targetX: 4, targetY: 18 },
      { x: 1, y: 13, targetMap: 'route4', targetX: 23, targetY: 6 },
      // East exit → Route 9
      { x: 24, y: 12, targetMap: 'route9', targetX: 1, targetY: 5 },
      { x: 24, y: 13, targetMap: 'route9', targetX: 1, targetY: 6 },
      // Cerulean Gym door
      { x: 6, y: 9, targetMap: 'cerulean_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 18, y: 11, targetMap: 'pokemon_center_cerulean', targetX: 4, targetY: 7 },
      // Pokemart door (no interior defined yet, placeholder)
      { x: 18, y: 18, targetMap: 'pokemart_cerulean', targetX: 3, targetY: 7 },
      // Bike Shop door
      { x: 5, y: 18, targetMap: 'bike_shop', targetX: 3, targetY: 7 },
      // Bulbasaur house door
      { x: 15, y: 4, targetMap: 'cerulean_house', targetX: 3, targetY: 6 },
      // Burgled House front door (south face, NE corner)
      { x: 20, y: 6, targetMap: 'burgled_house', targetX: 3, targetY: 6 },
      // Burgled House back wall hole (north face, from the garden). It lands
      // on (4,2), the floor tile beside the hole: (3,2) itself is where the
      // policeman stands, and no warp may drop the player onto an NPC.
      { x: 20, y: 4, targetMap: 'burgled_house', targetX: 4, targetY: 2 },
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
        x: 9, y: 20,
        spriteColor: 0x80c080,
        direction: Direction.LEFT,
        dialogue: [
          'The NUGGET BRIDGE to\nthe north is famous!',
          'Five trainers in a row\nchallenge all comers!',
        ],
      },
      // Rocket grunt hiding in the burgled house's back garden. He faces LEFT
      // with a sight range of 1, so he watches (21,3) only: the player lands
      // on (20,3) coming out of the hole and is never ambushed on arrival.
      {
        id: 'cerulean_rocket',
        x: 22, y: 3,
        spriteColor: 0x404040,
        direction: Direction.LEFT,
        dialogue: [
          'ROCKET: I burglarized\nthat house! Hehe!',
          "You want to battle?\nBring it on!",
        ],
        isTrainer: true,
        sightRange: 1,
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 4. CERULEAN GYM  (10x14 indoor, water gym)
// ─────────────────────────────────────────────────────────────
export const CERULEAN_GYM: MapData = (() => {
  const W = 10, H = 14;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

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

  // Entrance mat on exit warps
  setTile(4, 13, T.DOORMAT);
  setTile(5, 13, T.DOORMAT);

  return {
    id: 'cerulean_gym',
    name: 'CERULEAN GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'cerulean_city', targetX: 6, targetY: 10 },
      { x: 5, y: 13, targetMap: 'cerulean_city', targetX: 6, targetY: 10 },
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
    id: 'pokemon_center_cerulean',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'cerulean_city', targetX: 18, targetY: 12 },
      { x: 5, y: 7, targetMap: 'cerulean_city', targetX: 18, targetY: 12 },
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Tree borders left/right (2 tiles)
  for (let y = 0; y < H; y++) {
    setTile(0, y, T.TREE);
    setTile(1, y, T.TREE);
    setTile(W - 1, y, T.TREE);
    setTile(W - 2, y, T.TREE);
  }

  // Water on sides between trees and path (bridge feel)
  fillRect(2, 0, 3, H, T.WATER);   // x:2-4 water (west)
  fillRect(W - 4, 0, 2, H, T.WATER); // x:6-7 water (east)

  // Vertical path (the bridge!) at x:5-6 only
  fillRect(4, 0, 1, H, T.WATER);  // ensure x:4 is water
  fillRect(5, 0, 2, H, T.PATH);
  fillRect(7, 0, 1, H, T.WATER);  // ensure x:7 is water

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
      // Rival battle at south end of bridge
      {
        id: 'rival_cerulean',
        x: 5, y: 18,
        spriteColor: 0x4090d0,
        direction: Direction.RIGHT,
        dialogue: [
          '{RIVAL}: Hey {PLAYER}!\nHeading for the\nBRIDGE?',
          "I'll show you how\nmuch stronger I've\ngotten!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      // 5 Nugget Bridge trainers - face across bridge to block both columns
      {
        id: 'nugget1',
        x: 5, y: 16,
        spriteColor: 0xd09040,
        direction: Direction.RIGHT,
        dialogue: [
          'BUG CATCHER: Welcome\nto NUGGET BRIDGE!',
          "Beat us five trainers\nand win a prize!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'nugget2',
        x: 6, y: 13,
        spriteColor: 0x90c060,
        direction: Direction.LEFT,
        dialogue: [
          "LASS: You won't get\npast me easily!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'nugget3',
        x: 5, y: 10,
        spriteColor: 0xc06060,
        direction: Direction.RIGHT,
        dialogue: [
          "YOUNGSTER: I'm the\nthird challenger!",
          "Are you getting\ntired yet?",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'nugget4',
        x: 6, y: 7,
        spriteColor: 0x6060c0,
        direction: Direction.LEFT,
        dialogue: [
          "LASS: Just two more\ntrainers after me!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'nugget5',
        x: 5, y: 4,
        spriteColor: 0xc0c060,
        direction: Direction.RIGHT,
        dialogue: [
          "JR. TRAINER: I'm the\nlast one on the bridge!",
          'If you beat me you\nget the NUGGET!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route24_nugget',
        x: 6, y: 2,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'nugget',
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
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

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
      // Bill's House door
      { x: 22, y: 7, targetMap: 'bills_house', targetX: 3, targetY: 6 },
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
        id: 'route25_potion',
        x: 22, y: 8,
        spriteColor: 0x000000,
        direction: Direction.DOWN,
        dialogue: [],
        isItemBall: true,
        itemId: 'super_potion',
      },
      // Charmander gift NPC - trainer who found an abandoned Charmander
      {
        id: 'route24_charmander_guy',
        x: 3, y: 6,
        spriteColor: 0xf08040,
        direction: Direction.RIGHT,
        dialogue: [
          "I found a POKeMON\nabandoned on the road...",
          "I'm looking for someone\nto take it.",
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
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
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

  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'pokemart_cerulean',
    name: 'POKeMON MART',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'cerulean_city', targetX: 18, targetY: 19 },
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
// 8. BILL'S HOUSE  (8x8 indoor)
// ─────────────────────────────────────────────────────────────
export const BILLS_HOUSE: MapData = (() => {
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

  // PC
  setTile(2, 2, T.PC);

  // Bookshelves / counters
  setTile(5, 2, T.COUNTER);
  setTile(6, 2, T.COUNTER);

  // Carpet (room center)
  setTile(3, 4, T.CARPET);
  setTile(4, 4, T.CARPET);

  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);

  // Door at bottom
  setTile(3, H - 1, T.DOOR);

  return {
    id: 'bills_house',
    name: "BILL's HOUSE",
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'route25', targetX: 22, targetY: 8 },
    ],
    npcs: [
      {
        id: 'bill',
        x: 4, y: 3,
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
  };
})();

// ─────────────────────────────────────────────────────────────
// 9. BURGLED HOUSE  (8x8 indoor, pass-through)
// ─────────────────────────────────────────────────────────────
export const BURGLED_HOUSE: MapData = (() => {
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

  // Back door (burglar's escape hole in north wall)
  setTile(3, 1, T.DOOR);

  // Front entrance (south, standard building entrance)
  setTile(3, H - 1, T.DOOR);

  // Furniture
  setTile(1, 2, T.COUNTER);
  setTile(2, 2, T.COUNTER);
  setTile(5, 2, T.COUNTER);
  setTile(6, 2, T.COUNTER);

  // Entrance mat on exit warps
  setTile(3, 1, T.DOORMAT);   // back door (north)
  setTile(3, H - 1, T.DOORMAT); // front door (south)

  return {
    id: 'burgled_house',
    name: 'BURGLED HOUSE',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // The hole in the back wall (north) → the back garden, above the hole
      { x: 3, y: 1, targetMap: 'cerulean_city', targetX: 20, targetY: 3 },
      // Front entrance (south) → the grass below the front door
      { x: 3, y: 7, targetMap: 'cerulean_city', targetX: 20, targetY: 7 },
    ],
    npcs: [
      // The policeman stands INSIDE, in front of the hole: (3,1) is only
      // reachable through (3,2), so he is a real chokepoint until bill_helped.
      {
        id: 'cerulean_officer',
        x: 3, y: 2,
        spriteColor: 0x4060c0,
        direction: Direction.DOWN,
        dialogue: [
          'This house was\nburglarized!',
          "Stay away from that\nhole in the wall\nuntil we're done here.",
        ],
      },
      {
        id: 'burgled_house_npc',
        x: 4, y: 4,
        spriteColor: 0xf08080,
        direction: Direction.DOWN,
        dialogue: [
          'A thief broke in\nthrough the wall!',
          "He's still lurking in\nmy back garden!",
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 11. BIKE SHOP  (8x8 indoor)
// ─────────────────────────────────────────────────────────────
export const BIKE_SHOP: MapData = (() => {
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
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);

  // Bike display shelves
  setTile(5, 2, T.MART_SHELF); setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF); setTile(6, 4, T.MART_SHELF);

  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'bike_shop',
    name: 'BIKE SHOP',
    width: W, height: H,
    tiles, collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'cerulean_city', targetX: 5, targetY: 19 },
    ],
    npcs: [
      {
        id: 'bike_shop_owner',
        x: 2, y: 2,
        spriteColor: 0xd08030,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome to the\nCERULEAN BIKE SHOP!',
          'Our bicycles cost\n1,000,000! ...Sorry,\nwe only have one model.',
          "If you have a BIKE\nVOUCHER I can give\nyou one for free!",
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// 12. CERULEAN HOUSE  (8x8 indoor - Bulbasaur girl)
// ─────────────────────────────────────────────────────────────
export const CERULEAN_HOUSE: MapData = (() => {
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

  // Furniture
  setTile(1, 2, T.COUNTER);
  setTile(2, 2, T.COUNTER);
  setTile(5, 2, T.COUNTER);
  setTile(6, 2, T.COUNTER);

  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);

  return {
    id: 'cerulean_house',
    name: 'CERULEAN HOUSE',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 3, y: H - 1, targetMap: 'cerulean_city', targetX: 15, targetY: 5 },
    ],
    npcs: [
      {
        id: 'cerulean_bulbasaur_girl',
        x: 4, y: 4,
        spriteColor: 0x60c080,
        direction: Direction.DOWN,
        dialogue: [
          "I love POKeMON so\nmuch!",
          "I have a special\nBULBASAUR...",
        ],
      },
    ],
  };
})();

// ─────────────────────────────────────────────────────────────
// Combined export
// ─────────────────────────────────────────────────────────────
export const CERULEAN_MAPS: Record<string, MapData> = {
  mt_moon: MT_MOON,
  mt_moon_b1f: MT_MOON_B1F,
  mt_moon_b2f: MT_MOON_B2F,
  route4: ROUTE4,
  cerulean_city: CERULEAN_CITY,
  cerulean_gym: CERULEAN_GYM,
  pokemon_center_cerulean: POKEMON_CENTER_CERULEAN,
  pokemart_cerulean: POKEMART_CERULEAN,
  route24: ROUTE24,
  route25: ROUTE25,
  bills_house: BILLS_HOUSE,
  burgled_house: BURGLED_HOUSE,
  bike_shop: BIKE_SHOP,
  cerulean_house: CERULEAN_HOUSE,
};
