import { ElevatorData, EntryGate, MapData, NPCData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { createMapFromSketch, SketchShape } from './mapBuilder';
import { doorKeyFlag } from '../logic/storyFlagSync';
import { visitedFlag } from '../logic/elevator';

const T = TileType;

// Every floor is sealed once the building is cleared.
const SILPH_CO_CLOSED: EntryGate[] = [
  { requires: { notFlag: 'silph_co_complete' }, message: [
    "SILPH CO. has resumed\nnormal operations.",
    "Thank you for saving\nus!",
  ] },
];

// ─── Silph Co: 11 office floors drawn as sketches ──────────────────────────
//
// Every floor is a one-tile corridor maze. Stairs chain the floors (u on floor
// n lands on d of floor n+1); the CARD KEY doors (D) and the teleport pads are
// the puzzle. Trainers sit at desks facing across a corridor with sight range
// 1: a spotting trainer walks up to the player and keeps that tile, which in a
// one-tile corridor would wall it off, so nobody may ever see down a corridor.
// Legend: # wall, . floor, D locked door (opens with the Card Key),
// E entrance mat, u/d stairs up/down, 1-6 teleport pads (the same digit on two
// floors is a pair), V elevator, v where the elevator lands you, i item ball,
// K the Card Key, h heal tile, A/B grunts, J/M Jessie & James, R rival,
// L Lapras employee, G Giovanni, P president, N/Q talkers.
//
// Route: 1F..5F by stairs. The Card Key lies in a sealed pocket on 5F that
// only pad 2 (3F, behind a grunt) reaches; with it the pocket's door opens and
// so does every other D. 7F: the rival ambushes on the way to the stairs, an
// employee behind a door gives LAPRAS, and pad 5 behind another door lands in
// a pocket on 11F whose door opens straight into Giovanni's office. Stairs
// through 8F-10F (items, a healer behind a door on 9F) are the long way to
// 11F. The elevator on every floor only stops at floors already visited.
const SC_LEGEND: Record<string, TileType> = {
  '#': T.WALL, '.': T.INDOOR_FLOOR, D: T.GATE, E: T.DOORMAT, u: T.DOOR, d: T.DOOR, h: T.HEAL_TILE,
  '1': T.TELEPORT_PAD, '2': T.TELEPORT_PAD, '3': T.TELEPORT_PAD, '4': T.TELEPORT_PAD, '5': T.TELEPORT_PAD, '6': T.TELEPORT_PAD,
  v: T.INDOOR_FLOOR, i: T.INDOOR_FLOOR, K: T.INDOOR_FLOOR, L: T.INDOOR_FLOOR, G: T.INDOOR_FLOOR, P: T.INDOOR_FLOOR,
  // People at desks: the tile is a solid COUNTER in the data, so a grunt between two corridors
  // never becomes a shortcut (not in the layout metrics, and not when the grunts leave). The
  // elevator NPC stands in the wall as its door.
  A: T.COUNTER, B: T.COUNTER, J: T.COUNTER, M: T.COUNTER, R: T.COUNTER, N: T.COUNTER, Q: T.COUNTER,
  V: T.WALL,
};
const CARD_KEY_FLAG = doorKeyFlag('card_key');
const ROCKET = 0x383838, EMPLOYEE = 0xc0a060, SCIENTIST = 0xf0f0f0;

const to = (p: { x: number; y: number }) => ({ targetX: p.x, targetY: p.y });
const scTrainer = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor = ROCKET): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue, isTrainer: true, sightRange: 1,
});
const scTalker = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor = EMPLOYEE): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue,
});
/** Item balls on the floor's `i` tiles, row-major. */
const scItems = (s: SketchShape, prefix: string, itemIds: string[]): NPCData[] => {
  const spots = s.find('i');
  if (spots.length !== itemIds.length) throw new Error(`${prefix}: ${spots.length} item tiles for ${itemIds.length} items`);
  return spots.map((p, n) => ({ id: `${prefix}_${itemIds[n]}`, ...p, spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: itemIds[n] }));
};
const scElevator = (s: SketchShape, floor: string): NPCData => ({
  id: `elevator_silph_${floor}`, ...s.findOne('V'), spriteColor: 0x808080, direction: Direction.DOWN, dialogue: ["It's an elevator."],
});
/** Every D tile is a Card Key door. */
const scDoors = (s: SketchShape) => s.find('D').map(p => ({ ...p, flag: CARD_KEY_FLAG }));
/** Stairs: `d` lands on the floor below's `u` and vice versa. */
const stairsDown = (s: SketchShape, below: SketchShape, belowId: string) => ({ ...s.findOne('d'), targetMap: belowId, ...to(below.findOne('u')) });
const stairsUp = (s: SketchShape, above: SketchShape, aboveId: string) => ({ ...s.findOne('u'), targetMap: aboveId, ...to(above.findOne('d')) });
/** Teleport pad `digit` on this floor warps onto the same digit on `other`. */
const pad = (s: SketchShape, digit: string, other: SketchShape, otherId: string) => ({ ...s.findOne(digit), targetMap: otherId, ...to(other.findOne(digit)) });

const SC_1F = createMapFromSketch([
  '####################',
  '#.......#.........##',
  '#######.#.#####.#.##',
  '#.#...#.#.....#.#.##',
  '#.#.#.#.#####.#.#.##',
  '#.#.#.#.....#.#.#.##',
  '#.#.#.#####.#.#.A###',
  '#...#...#...#u#...##',
  '#.###.#.#.#####.#.##',
  '#.#.#.#.#.#...#.#.##',
  '#.#.#.###.#.#.###.##',
  '#...#.....v.#.....##',
  '#######N#.V#########',
  '#########E##########',
], SC_LEGEND);
const SC_2F = createMapFromSketch([
  '####################',
  '#...#u#..........1##',
  '###.#.#.#######.####',
  '#...#.B.....#.#...##',
  '#.###.#####.#.###.##',
  '#...#.....#..iDi#.##',
  '###.#####.#.#####.##',
  '#.#.....#...#...#.##',
  '#.V####.#####.#.#.##',
  '#.v...#.#.....#...##',
  '#.#.###.#.#######.##',
  '#d#.......#.......##',
  '#########A##########',
  '####################',
], SC_LEGEND);
const SC_3F = createMapFromSketch([
  '####################',
  '#u......#.........##',
  '###N###.A.#####.#.##',
  '#i#...#.#.#.....#.##',
  '#.#.#.#.#.#.#####.##',
  '#...#...#2#.#.....##',
  '#.#########.#.######',
  '#.......#...#.....##',
  '#######.#.#######.##',
  '#...D3#...#.....B.##',
  '#.#.#######.###.#.##',
  '#.#........v.d#...##',
  '###########V########',
  '####################',
], SC_LEGEND);
const SC_4F = createMapFromSketch([
  '####################',
  '#u..#...........#.##',
  '###.#.###A#####.#.##',
  '#.#...#.......#...##',
  '#.#####.#.###.###.##',
  '#..1#...#...#6#...##',
  '#.###.#####.###.####',
  '#.#...#...#...B...##',
  '#.#.###.#.###.###.##',
  '#.#.....#.#i#.....##',
  '#.#######.#D########',
  '#..............v.d##',
  '###############V####',
  '####################',
], SC_LEGEND);
const SC_5F = createMapFromSketch([
  '####################',
  '#...#.....#.D.....##',
  '###.#.#.#.#.#.JM#.##',
  '#d#.#.#.#.#K#.#...##',
  '#.#.###.#.#.#.#.####',
  '#vV.#...#.#2#.#...##',
  '#.#.A.###.###.###.##',
  '#...#...#.....#...##',
  '#.#####.#######.####',
  '#.#...#...#4#...#u##',
  '#.#.#.###.#.#.###.##',
  '#...#.....#.......##',
  '####################',
  '####################',
], SC_LEGEND);
const SC_6F = createMapFromSketch([
  '####################',
  '#...........#.....##',
  '###########.#.#A#.##',
  '#......u#...#.#...##',
  '#.#.#####.###.#.####',
  '#.#.......#i..#.#d##',
  '#.###########.#.#.##',
  '#...#.......#.#..vV#',
  '###.#.#####.#.###.##',
  '#i#...#.....#.#...##',
  '#.#####.#B###.#.####',
  '#..i..D.......#...##',
  '####################',
  '####################',
], SC_LEGEND);
const SC_7F = createMapFromSketch([
  '####################',
  '#.....#u..#......i##',
  '#####.###.#.#.######',
  '#...#...#...#.#...##',
  '#.#.###.#D###.#.#.##',
  '#.#.....#..L#...#.##',
  '#.#############D#.##',
  '#.#3....D.....#.#.A#',
  '#.#######.###.#.#.##',
  '#...#...#.#...#5#.##',
  '###.#.#.#.#.#####.##',
  '#d.v..#...#.......##',
  '###V#########R######',
  '####################',
], SC_LEGEND);
const SC_8F = createMapFromSketch([
  '####################',
  '#u....#i..........##',
  '#####.#####.###.#.##',
  '#...#.....#i#...#.##',
  '#.#######.###.###.##',
  '#.......B.#...#i#.##',
  '#.#.#####.#.###.#.##',
  '#.#.......#...#.#.##',
  '#.###A#######.#.#.##',
  '#.#.......#...#.#.##',
  '#.#.#####.#.###D#.##',
  '#...#.......#d.v..##',
  '###############V####',
  '####################',
], SC_LEGEND);
const SC_9F = createMapFromSketch([
  '####################',
  '#u..#...#......v.d##',
  '###.#.#.#.###.#V####',
  '#...#.#i#.#.#.#...##',
  '#.###.###.#.#.#.#.##',
  '#.#4D.#...#.A...#.##',
  '#.###.#.###.#####.##',
  '#...#...#...#.....##',
  '###.#.###.#D#.###.##',
  '#...#.....#hQ...#.##',
  '#.###########B#.#.##',
  '#...............#.##',
  '####################',
  '####################',
], SC_LEGEND);
const SC_10F = createMapFromSketch([
  '####################',
  '#u..#.........#i..##',
  '###.#.#######.###.##',
  '#.#.B.#....6#...#.##',
  '#.#.#.#.#######.#.##',
  '#.#.#.#...#.....#.##',
  '#.#.#.###.#.#####D##',
  '#...#.#i..#.Vv....##',
  '#.###.#####.#.###.##',
  '#...A.#...#.#d#...##',
  '###.#.#.#.#.###.#.##',
  '#.....#i#.......#.##',
  '####################',
  '####################',
], SC_LEGEND);
const SC_11F = createMapFromSketch([
  '####################',
  '#d.v..#...........##',
  '###V#.#.###B#####.##',
  '#...#.#.......#5#.##',
  '#.#.#.###.###.#.#.##',
  '#.#.#...#.#...#.#.##',
  '###.###.#.#.###D#.##',
  '#.....#.#.#.#P#...##',
  '#.#####.###.#G#.####',
  '#.#.....#...#.#.#.##',
  '#.#.#####.###D#.#.##',
  '#.........#.......##',
  '#####A##############',
  '####################',
], SC_LEGEND);

const SKETCHES: Array<[string, SketchShape]> = [
  ['silph_co_1f', SC_1F], ['silph_co_2f', SC_2F], ['silph_co_3f', SC_3F], ['silph_co_4f', SC_4F], ['silph_co_5f', SC_5F], ['silph_co_6f', SC_6F],
  ['silph_co_7f', SC_7F], ['silph_co_8f', SC_8F], ['silph_co_9f', SC_9F], ['silph_co_10f', SC_10F], ['silph_co_11f', SC_11F],
];
const floorId = (n: number) => SKETCHES[n - 1][0];
const sketchOf = (n: number) => SKETCHES[n - 1][1];

// The lift stops at every floor, but only at floors the player has already
// reached on foot (a `visited_` flag is set on arrival): a way back down, never
// a way to skip ahead. Shared by every floor (the elevator tests require it).
const SILPH_CO_ELEVATOR: ElevatorData = {
  floors: SKETCHES.map(([id, s], n) => ({ label: `${n + 1}F`, targetMap: id, ...to(s.findOne('v')), requires: { flag: visitedFlag(id) } })),
};

/** The common shape of a floor: sketch tiles, stairs to the floors around it, doors, the elevator. */
function silphFloor(n: number, extras: { warps?: MapData['warps']; npcs: NPCData[] }): MapData {
  const [id, s] = SKETCHES[n - 1];
  const warps: MapData['warps'] = [...(extras.warps ?? [])];
  if (n > 1) warps.push(stairsDown(s, sketchOf(n - 1), floorId(n - 1)));
  if (n < SKETCHES.length) warps.push(stairsUp(s, sketchOf(n + 1), floorId(n + 1)));
  return {
    id, name: `SILPH CO. ${n}F`, entryGates: SILPH_CO_CLOSED,
    width: s.width, height: s.height, tiles: s.tiles, collision: s.collision,
    floorTile: T.INDOOR_FLOOR,
    gates: scDoors(s),
    elevator: SILPH_CO_ELEVATOR,
    warps,
    npcs: [scElevator(s, `${n}f`), ...extras.npcs],
  };
}

// 1F lobby: the reception, one grunt on the top corridor, stairs at the end of the loop.
const SILPH_CO_1F = silphFloor(1, {
  warps: [{ ...SC_1F.findOne('E'), targetMap: 'saffron_city', targetX: 15, targetY: 10 }],
  npcs: [
    scTrainer(SC_1F, 'A', 'silph_1f_grunt1', Direction.LEFT, ['ROCKET: SILPH CO. is\nunder our control!', 'No one gets in\nor out!']),
    scTalker(SC_1F, 'N', 'silph_receptionist', Direction.UP, [
      "Please, you have to\nhelp us!",
      "TEAM ROCKET has\ntaken over the\nbuilding!",
      "The PRESIDENT is on\nthe top floor!",
    ]),
  ],
});

// 2F: pad 1 to 4F in the top-right corner; a locked room with two items.
const SILPH_CO_2F = silphFloor(2, {
  warps: [pad(SC_2F, '1', SC_4F, 'silph_co_4f')],
  npcs: [
    ...scItems(SC_2F, 'silph_2f', ['tm36_self_destruct', 'protein']),
    scTrainer(SC_2F, 'A', 'silph_2f_grunt1', Direction.UP, ['ROCKET: This floor\nis off limits!']),
    scTrainer(SC_2F, 'B', 'silph_2f_grunt2', Direction.RIGHT, ['ROCKET: You think you\ncan stop us?']),
  ],
});

// 3F: pad 2 (top, behind a grunt) is the only way into the 5F key pocket; pad 3 to 7F is behind a door.
const SILPH_CO_3F = silphFloor(3, {
  warps: [pad(SC_3F, '2', SC_5F, 'silph_co_5f'), pad(SC_3F, '3', SC_7F, 'silph_co_7f')],
  npcs: [
    ...scItems(SC_3F, 'silph_3f', ['hyper_potion']),
    scTrainer(SC_3F, 'A', 'silph_3f_grunt1', Direction.RIGHT, ['ROCKET: The lab\nequipment is ours now!']),
    scTrainer(SC_3F, 'B', 'silph_3f_grunt2', Direction.LEFT, ['ROCKET: Get out of\nhere, kid!']),
    scTalker(SC_3F, 'N', 'silph_3f_scientist', Direction.UP, [
      "SCIENTIST: The\nteleport pads are\nconfusing...",
      "The one past the\nguard on this floor\ngoes somewhere\nno stairs reach.",
    ], SCIENTIST),
  ],
});

// 4F: pad 1 back to 2F; pad 6 to the sealed pocket on 10F; a locked room.
const SILPH_CO_4F = silphFloor(4, {
  warps: [pad(SC_4F, '1', SC_2F, 'silph_co_2f'), pad(SC_4F, '6', SC_10F, 'silph_co_10f')],
  npcs: [
    ...scItems(SC_4F, 'silph_4f', ['max_revive']),
    scTrainer(SC_4F, 'A', 'silph_4f_grunt1', Direction.DOWN, ['ROCKET: The servers\ncontain valuable\ndata!']),
    scTrainer(SC_4F, 'B', 'silph_4f_grunt2', Direction.RIGHT, ['ROCKET: You made it\nthis far? Impressive!']),
  ],
});

// 5F: the CARD KEY pocket (pad 2, the key, a door out); Jessie & James watch the corridor outside
// it; pad 4 to the 9F healer.
const SILPH_CO_5F = silphFloor(5, {
  warps: [pad(SC_5F, '2', SC_3F, 'silph_co_3f'), pad(SC_5F, '4', SC_9F, 'silph_co_9f')],
  npcs: [
    { id: 'silph_5f_card_key', ...SC_5F.findOne('K'), spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: 'card_key' },
    scTrainer(SC_5F, 'A', 'silph_5f_grunt1', Direction.RIGHT, ['ROCKET: The boss is\nupstairs! You will\nnever reach him!']),
    scTrainer(SC_5F, 'J', 'jessie_silph', Direction.UP, [
      'JESSIE & JAMES: Well,\nwell, well...',
      "If it isn't the\ntwerp who keeps\nruining our plans!",
      'Prepare for trouble,\nfor the very last time!',
      'And make it double,\nthis will be sublime!',
      "MEOWTH: The boss\nwon't be happy if we\nlose again!",
      "Then let's not lose!\nGo, ARBOK! Go, WEEZING!",
    ], 0xd02070),
    scTalker(SC_5F, 'M', 'james_silph', Direction.UP, [
      "JAMES: This is our\nbiggest operation yet!",
      "SILPH CO. will soon\nbelong to TEAM ROCKET!",
    ], 0x6060d0),
  ],
});

// 6F: a long floor; a locked wing with two items.
const SILPH_CO_6F = silphFloor(6, {
  npcs: [
    ...scItems(SC_6F, 'silph_6f', ['hp_up', 'x_accuracy', 'rare_candy']),
    scTrainer(SC_6F, 'A', 'silph_6f_grunt1', Direction.DOWN, ['ROCKET: Ha! You fell\nfor the trap!']),
    scTrainer(SC_6F, 'B', 'silph_6f_grunt2', Direction.UP, ['ROCKET: Nobody gets\npast this floor!']),
  ],
});

// 7F: the rival waits by the stairs corridor; LAPRAS behind a door; pad 3 pocket from 3F;
// pad 5 to 11F behind a door.
const SILPH_CO_7F = silphFloor(7, {
  warps: [pad(SC_7F, '3', SC_3F, 'silph_co_3f'), pad(SC_7F, '5', SC_11F, 'silph_co_11f')],
  npcs: [
    ...scItems(SC_7F, 'silph_7f', ['calcium']),
    scTrainer(SC_7F, 'A', 'silph_7f_grunt1', Direction.LEFT, ['ROCKET: The boss is\nright upstairs! You\nwill not pass!']),
    scTrainer(SC_7F, 'R', 'rival_silph', Direction.UP, [
      "{RIVAL}: {PLAYER}!\nWhat a surprise!",
      "TEAM ROCKET is all\nover SILPH CO.!",
      "But first, let's\nhave a battle!",
    ], 0x6080c0),
    scTalker(SC_7F, 'L', 'silph_lapras_employee', Direction.LEFT, [
      'I hid in here when\nTEAM ROCKET came.',
      'Please, get rid of\nthem!',
    ]),
  ],
});

// 8F: items in the dead ends, one behind a door.
const SILPH_CO_8F = silphFloor(8, {
  npcs: [
    ...scItems(SC_8F, 'silph_8f', ['tm09_take_down', 'escape_rope', 'max_potion']),
    scTrainer(SC_8F, 'A', 'silph_8f_grunt1', Direction.DOWN, ['ROCKET: Still\nclimbing? The stairs\nonly get longer!']),
    scTrainer(SC_8F, 'B', 'silph_8f_grunt2', Direction.RIGHT, ['ROCKET: We took the\nwhole building. What\ncan one kid do?']),
  ],
});

// 9F: a healer behind a door; pad 4 from 5F lands behind another.
const SILPH_CO_9F = silphFloor(9, {
  warps: [pad(SC_9F, '4', SC_5F, 'silph_co_5f')],
  npcs: [
    ...scItems(SC_9F, 'silph_9f', ['carbos']),
    scTrainer(SC_9F, 'A', 'silph_9f_grunt1', Direction.RIGHT, ['ROCKET: The employees\nare locked in their\nrooms. Stay out!']),
    scTrainer(SC_9F, 'B', 'silph_9f_grunt2', Direction.UP, ['ROCKET: Two more\nfloors and you meet\nthe boss. If you\nlive!']),
    scTalker(SC_9F, 'Q', 'silph_9f_healer', Direction.LEFT, [
      'You look worn out.',
      'Rest on the bed\nhere. TEAM ROCKET\nnever checks this\nroom.',
    ]),
  ],
});

// 10F: pad 6 pocket (from 4F) with an item; a locked room; items.
const SILPH_CO_10F = silphFloor(10, {
  warps: [pad(SC_10F, '6', SC_4F, 'silph_co_4f')],
  npcs: [
    ...scItems(SC_10F, 'silph_10f', ['tm26_earthquake', 'rare_candy', 'pp_up']),
    scTrainer(SC_10F, 'A', 'silph_10f_grunt1', Direction.LEFT, ['ROCKET: The boss\nsaid no visitors!']),
    scTrainer(SC_10F, 'B', 'silph_10f_grunt2', Direction.RIGHT, ['ROCKET: Turn back,\nor be turned back!']),
  ],
});

// 11F: Giovanni's office behind a door at the end of the long way round, or straight
// out of the pad 5 pocket; the president is trapped behind him at the end of the room.
const SILPH_CO_11F = silphFloor(11, {
  warps: [pad(SC_11F, '5', SC_7F, 'silph_co_7f')],
  npcs: [
    scTrainer(SC_11F, 'A', 'silph_11f_grunt1', Direction.UP, ['ROCKET: The top\nfloor! Only the boss\nand his guests come\nup here!']),
    scTrainer(SC_11F, 'B', 'silph_11f_grunt2', Direction.UP, ['ROCKET: You will\nnot disturb the\nboss!']),
    scTrainer(SC_11F, 'G', 'giovanni_silph', Direction.DOWN, [
      "GIOVANNI: We meet\nagain, child!",
      "You have interfered\nwith TEAM ROCKET\nfor the last time!",
      "Prepare to feel my\nwrath!",
    ], 0x604020),
    scTalker(SC_11F, 'P', 'silph_president', Direction.DOWN, [
      "PRESIDENT: Thank\ngoodness you're here!",
      "TEAM ROCKET has taken\nover our company!",
      "Please, defeat their\nboss!",
    ]),
  ],
});

export const SILPH_MAPS: Record<string, MapData> = Object.fromEntries(
  [SILPH_CO_1F, SILPH_CO_2F, SILPH_CO_3F, SILPH_CO_4F, SILPH_CO_5F, SILPH_CO_6F, SILPH_CO_7F, SILPH_CO_8F, SILPH_CO_9F, SILPH_CO_10F, SILPH_CO_11F]
    .map(m => [m.id, m]),
);
