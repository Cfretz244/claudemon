import { ElevatorData, MapData, NPCData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { createMapFromSketch, SketchShape } from './mapBuilder';

const T = TileType;

// ─── Rocket Hideout: four basement floors drawn as sketches ────────────────
//
// Every floor is a one-tile corridor maze. B2F and B3F are spinner mazes: an
// arrow tile slides the player in its direction across plain floor, further
// arrows redirect, a stop tile (x) ends the slide, so does a wall or an NPC
// (the player halts on the tile before it), and sliding onto stairs takes
// them. Walking onto an arrow from the "wrong" end throws the player back, so
// an arrow is a one-way valve; the stops are where the player gets to choose.
// Every station on the way has exactly one way forward and a loop back.
// Trainers stand in one-tile niches with sight range 1 facing a tile the route
// must stand on (a slide passes tiles without being seen; its end tile is).
// Legend: # wall, . floor, < > ^ v arrows, x stop, u stairs up, d stairs down,
// V elevator NPC (in the wall), l where the elevator lands you, A/B/C grunts,
// J/M Jessie & James at desks (solid), G Giovanni, K the LIFT KEY, i item
// ball, `,` Giovanni's carpet.
//
// Route: Game Corner -> B1F (a plain maze) -> B2F: ring road clockwise, the
// stop at (9,11), col 9 up, the row-7 valve, col 7 to row 5, east to the ring
// at (18,5), row 7 west, the valve at (14,7) rides to the stop above the
// stairs, and the arrow below it rides onto them. B3F: belt -> stop (14,1) ->
// col 14 down -> row 7 west (grunt) -> col 6 down -> row 12 east (Jessie &
// James) -> col 16 up -> row 9 east to the stairs. B4F is two halves that
// never meet: the stairs side switchbacks to the LIFT KEY; the elevator (B1F,
// B2F, B4F; needs the key) lands on the other side, in front of Giovanni.
const RH_LEGEND: Record<string, TileType> = {
  '#': T.WALL, '.': T.INDOOR_FLOOR, ',': T.CARPET,
  '<': T.SPIN_TILE, '>': T.SPIN_TILE, '^': T.SPIN_TILE, v: T.SPIN_TILE, x: T.STOP_TILE,
  u: T.DOOR, d: T.DOOR,
  l: T.INDOOR_FLOOR, A: T.INDOOR_FLOOR, B: T.INDOOR_FLOOR, C: T.INDOOR_FLOOR, G: T.INDOOR_FLOOR, K: T.INDOOR_FLOOR, i: T.INDOOR_FLOOR,
  J: T.COUNTER, M: T.COUNTER, V: T.WALL,
};
const ARROWS: Record<string, Direction> = { '<': Direction.LEFT, '>': Direction.RIGHT, '^': Direction.UP, v: Direction.DOWN };
const ROCKET = 0x383838;

const to = (p: { x: number; y: number }) => ({ targetX: p.x, targetY: p.y });
/** Every arrow tile of a sketch, as `MapData.spinTiles`. */
const spinTilesOf = (s: SketchShape): Record<string, Direction> => Object.fromEntries(
  Object.entries(ARROWS).flatMap(([ch, dir]) => s.find(ch).map(p => [`${p.x},${p.y}`, dir])),
);
const rhTrainer = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor = ROCKET, sightRange = 1): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue, isTrainer: true, sightRange,
});
/** Item balls on the floor's `i` tiles, row-major. */
const rhItems = (s: SketchShape, prefix: string, itemIds: string[]): NPCData[] => {
  const spots = s.find('i');
  if (spots.length !== itemIds.length) throw new Error(`${prefix}: ${spots.length} item tiles for ${itemIds.length} items`);
  return spots.map((p, n) => ({ id: `${prefix}_${itemIds[n]}`, ...p, spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: itemIds[n] }));
};
const rhElevator = (s: SketchShape, floor: string): NPCData => ({
  id: `elevator_${floor}`, ...s.findOne('V'), spriteColor: 0x808080, direction: Direction.DOWN, dialogue: ["It's an elevator."],
});
/** Stairs: `d` lands on the floor below's `u` and vice versa. */
const stairsDown = (s: SketchShape, below: SketchShape, belowId: string) => ({ ...s.findOne('d'), targetMap: belowId, ...to(below.findOne('u')) });
const stairsUp = (s: SketchShape, above: SketchShape, aboveId: string) => ({ ...s.findOne('u'), targetMap: aboveId, ...to(above.findOne('d')) });

const RH_B1F = createMapFromSketch([
  '#u##################',
  '#...#.........#...##',
  '###.#.#######.###.##',
  '#i#.#.#.....#...#.##',
  '#.#.#.#.#######.#.##',
  '#.#.#.#...#.....#.##',
  '#.#.#.###.#.#####.##',
  '#...#.#..l#.#.....##',
  '#.###.#.#V#.#.###.##',
  '#...#.#...#.#i#...##',
  '###.#.#.#.#.###.#.##',
  '#.....#.#.......#.##',
  '####A#######B####d##',
  '####################',
], RH_LEGEND);
const RH_B2F = createMapFromSketch([
  '##u#################',
  '#...>..............#',
  '#.#####V##########v#',
  '#.#####l......#i##.#',
  '#.#########.#.#.##.#',
  '#.#................#',
  '#.#####.#####^####.#',
  '#x...i#...<..x<....#',
  '#.#####A#.###v####.#',
  '#.#i#####.###.####v#',
  '#^#.#####^###.####.#',
  '#........x.<.....<.#',
  '#########B###d######',
  '####################',
], RH_LEGEND);
const RH_B3F = createMapFromSketch([
  '##u###################',
  '#.....>.......x....###',
  '#.####.#######v###.###',
  '#.####.#######.###.###',
  '#.####.#######.###i###',
  '#.####.#######.#######',
  '#.####.#######.#######',
  '#.###Cx......<xi######',
  '#.####v####^##########',
  '#.####.####.........d#',
  '#.####.#########.#####',
  '#^####.#########^#####',
  '#......>........xJM###',
  '######################',
], RH_LEGEND);
const RH_B4F = createMapFromSketch([
  '##u########V########',
  '#........#.l.......#',
  '#####A##.#########.#',
  '########.#########.#',
  '#........#.........#',
  '#.########.####C####',
  '#.########.#########',
  '#........#.........#',
  '########.####B####.#',
  '########.#########.#',
  '#K.......#,,,,,....#',
  '##########,,G,,#####',
  '##########,,,,,#####',
  '####################',
], RH_LEGEND);

// The lift: B1F, B2F and B4F have a door (B3F has none, as in Gen I). It needs
// the LIFT KEY from the far side of B4F, and is the only way to Giovanni.
const ROCKET_HIDEOUT_ELEVATOR: ElevatorData = {
  floors: [
    { label: 'B1F', targetMap: 'rocket_hideout_b1f', ...to(RH_B1F.findOne('l')) },
    { label: 'B2F', targetMap: 'rocket_hideout_b2f', ...to(RH_B2F.findOne('l')) },
    { label: 'B4F', targetMap: 'rocket_hideout_b4f', ...to(RH_B4F.findOne('l')) },
  ],
  requires: { item: 'lift_key' },
  lockedMessage: ["It's an elevator,\nbut it won't move...", 'It needs a special\nkey.'],
};

const floor = (id: string, name: string, s: SketchShape, extras: Partial<MapData> & { warps: MapData['warps']; npcs: NPCData[] }): MapData => ({
  id, name, width: s.width, height: s.height, tiles: s.tiles, collision: s.collision, spinTiles: spinTilesOf(s), ...extras,
});

const ROCKET_HIDEOUT_B1F = floor('rocket_hideout_b1f', 'ROCKET HIDEOUT B1F', RH_B1F, {
  elevator: ROCKET_HIDEOUT_ELEVATOR,
  entryGates: [
    // From the Game Corner: stairs are hidden until the poster is found,
    // and sealed once Giovanni has been driven out
    { from: ['game_corner'], requires: { flag: 'game_corner_poster_found' }, message: [] },
    { from: ['game_corner'], requires: { trainerNotDefeated: 'giovanni_game_corner' }, message: [
      "The hideout has been\nabandoned...",
    ] },
  ],
  warps: [
    { ...RH_B1F.findOne('u'), targetMap: 'game_corner', targetX: 12, targetY: 2 },
    stairsDown(RH_B1F, RH_B2F, 'rocket_hideout_b2f'),
  ],
  npcs: [
    rhElevator(RH_B1F, 'b1f'),
    ...rhItems(RH_B1F, 'rocket_hideout_b1f', ['escape_rope', 'hyper_potion']),
    rhTrainer(RH_B1F, 'A', 'rocket_hideout_b1f_grunt1', Direction.UP, ['ROCKET: How did you\nget down here?!']),
    rhTrainer(RH_B1F, 'B', 'rocket_hideout_b1f_grunt2', Direction.UP, ["ROCKET: You're not\ngetting past me!"]),
  ],
});

const ROCKET_HIDEOUT_B2F = floor('rocket_hideout_b2f', 'ROCKET HIDEOUT B2F', RH_B2F, {
  elevator: ROCKET_HIDEOUT_ELEVATOR,
  warps: [
    stairsUp(RH_B2F, RH_B1F, 'rocket_hideout_b1f'),
    stairsDown(RH_B2F, RH_B3F, 'rocket_hideout_b3f'),
  ],
  npcs: [
    rhElevator(RH_B2F, 'b2f'),
    ...rhItems(RH_B2F, 'rocket_hideout_b2f', ['tm07_horn_drill', 'nugget', 'super_potion']),
    rhTrainer(RH_B2F, 'A', 'rocket_hideout_b2f_grunt1', Direction.UP, ['ROCKET: Intruder alert!\nIntruder alert!']),
    rhTrainer(RH_B2F, 'B', 'rocket_hideout_b2f_grunt2', Direction.UP, ['ROCKET: You made it\nthis far? Impressive.']),
  ],
});

const ROCKET_HIDEOUT_B3F = floor('rocket_hideout_b3f', 'ROCKET HIDEOUT B3F', RH_B3F, {
  warps: [
    stairsUp(RH_B3F, RH_B2F, 'rocket_hideout_b2f'),
    stairsDown(RH_B3F, RH_B4F, 'rocket_hideout_b4f'),
  ],
  npcs: [
    ...rhItems(RH_B3F, 'rocket_hideout_b3f', ['tm10_double_edge', 'rare_candy']),
    rhTrainer(RH_B3F, 'C', 'rocket_hideout_b3f_grunt1', Direction.RIGHT, ['ROCKET: The BOSS is\njust below!', "You'll never reach\nhim!"]),
    rhTrainer(RH_B3F, 'J', 'jessie_gamecorner', Direction.LEFT, [
      'JESSIE & JAMES: You!\nWe remember you from\nMT. MOON!',
      'Prepare for trouble!',
      'And make it double!',
      "This time we won't\ngo easy on you!",
      "MEOWTH: Yeah! We've\nbeen training hard!",
    ], 0xd02070),
    { id: 'james_gamecorner', ...RH_B3F.findOne('M'), spriteColor: 0x6060d0, direction: Direction.LEFT, dialogue: [
      "JAMES: The boss's\nhideout is just ahead!",
      "You'll never get\npast us!",
    ] },
  ],
});

const ROCKET_HIDEOUT_B4F = floor('rocket_hideout_b4f', 'ROCKET HIDEOUT B4F', RH_B4F, {
  elevator: ROCKET_HIDEOUT_ELEVATOR,
  warps: [stairsUp(RH_B4F, RH_B3F, 'rocket_hideout_b3f')],
  npcs: [
    rhElevator(RH_B4F, 'b4f'),
    { id: 'rocket_hideout_lift_key', ...RH_B4F.findOne('K'), spriteColor: 0xe03030, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: 'lift_key' },
    rhTrainer(RH_B4F, 'A', 'rocket_hideout_b4f_grunt1', Direction.UP, ["ROCKET: This is the\nBOSS's private floor!"]),
    rhTrainer(RH_B4F, 'C', 'rocket_hideout_b4f_grunt2', Direction.UP, ['ROCKET: How did you\nget the lift working?!']),
    rhTrainer(RH_B4F, 'B', 'rocket_hideout_b4f_grunt3', Direction.UP, ["ROCKET: The BOSS's\noffice is right there.\nYou won't see it!"]),
    rhTrainer(RH_B4F, 'G', 'giovanni_game_corner', Direction.UP, [
      'GIOVANNI: So, you\nhave found me!',
      'I am the leader of\nTEAM ROCKET!',
      'I shall not allow\nyou to disrupt our\nplans!',
    ], 0x604020),
  ],
});

export const HIDEOUT_MAPS: Record<string, MapData> = Object.fromEntries(
  [ROCKET_HIDEOUT_B1F, ROCKET_HIDEOUT_B2F, ROCKET_HIDEOUT_B3F, ROCKET_HIDEOUT_B4F].map(m => [m.id, m]),
);
