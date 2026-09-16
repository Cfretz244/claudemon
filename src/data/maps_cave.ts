import { MapData, NPCData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { createMapFromSketch, SketchShape } from './mapBuilder';
import { CHAMPION_FLAG } from '../logic/hallOfFame';

const T = TileType;

// ─── Cerulean Cave: three floors drawn as sketches ──────────────────────────
//
// Post-game (the door in Cerulean City's north-west pool opens once the
// player is champion). Sketches are checked by tools/cave-floors.mjs in the
// helper repo; tests/data/ceruleanCave.test.ts proves the same on this data.
//
// 1F has two sealed regions. The entrance side: the door, three pocket
// ladders (b, c, f) that 2F's dead ends drop the player back into, and the
// ladder up (a) on the far shore of a lake that must be surfed. The far side:
// the ladder d that 2F's one right branch leads to, and the only ladder down
// to B1F (e), across a short channel.
// 2F is a ring of ledges: the corridor snakes down three rows joined by
// one-way ledges, so nobody walks back to a. Two branches drop into pockets
// whose only way out is a ladder back to the 1F entrance side; the third
// drops into the stretch that holds d. Coming back up d, a last ledge leads
// to f: the way home is a different way.
// B1F: the arrival corridor, a lake with rock pillars, and Mewtwo on land
// across it. Every ladder and the door sit in one-tile stubs (a warp fires
// on entry, not on the tile you land on); items sit in dead ends; the two
// Cooltrainers stand in niches with sight range 1 facing the only corridor.
// Legend: # wall, . floor, ~ water, _ ledge (hopped south only), E door,
// a-f ladders, i item ball, 1/2 the Cooltrainers, M Mewtwo.
const CC_LEGEND: Record<string, TileType> = {
  '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, '~': T.WATER, _: T.LEDGE,
  E: T.CAVE_ENTRANCE, a: T.CAVE_ENTRANCE, b: T.CAVE_ENTRANCE, c: T.CAVE_ENTRANCE,
  d: T.CAVE_ENTRANCE, e: T.CAVE_ENTRANCE, f: T.CAVE_ENTRANCE,
  i: T.CAVE_FLOOR, '1': T.CAVE_FLOOR, '2': T.CAVE_FLOOR, M: T.CAVE_FLOOR,
};

const CC_1F = createMapFromSketch([
  '########################',
  '########a###############',
  '########.....###e###d###',
  '############.###.###.i##',
  '####.........1##.###.###',
  '####.###########.~~~.###',
  '####.############~~~####',
  '####.####.i#############',
  '###~~~~~~~~~~~~~~~~~~###',
  '###~~###~~###~~~~~~~~###',
  '###~~###~~###~~~~~~~~###',
  '###~~~~~~~###~~~~~~~~###',
  '##############.......###',
  '####################.###',
  '##########i###c#####.###',
  '##########.###.#####.###',
  '####.................###',
  '####.##f####b###########',
  '####.###################',
  '####E###################',
], CC_LEGEND);
const CC_2F = createMapFromSketch([
  '########################',
  '##a#####################',
  '##...................###',
  '########_###########_###',
  '######i...##########.###',
  '########b###########.###',
  '####################.###',
  '###..................###',
  '###_######2###_#########',
  '###.#########...i#######',
  '###.##########c#########',
  '###.####################',
  '###.................i###',
  '########_###############',
  '#####........###########',
  '######_#####d###########',
  '#####...################',
  '######f#################',
  '########################',
  '########################',
], CC_LEGEND);
const CC_B1F = createMapFromSketch([
  '########################',
  '##e#####################',
  '##...........i##########',
  '############.###########',
  '#####........###########',
  '#####.##################',
  '#####~~~~~~~~~~~~###~~##',
  '#####~~~###~~~~~~#i#~~##',
  '#####~~~###~~###~~.~~~##',
  '#####~~~~~~~~###~~~~~~##',
  '#####~~~~~~~~~~~~~~~~~##',
  '####################.###',
  '##############.......###',
  '##############.#########',
  '#############.M.########',
  '########################',
], CC_LEGEND);

const F1 = 'cerulean_cave_1f', F2 = 'cerulean_cave_2f', B1 = 'cerulean_cave_b1f';
/** The one open tile beside a stub (where a ladder lands the player). */
const beside = (s: SketchShape, ch: string) => {
  const p = s.findOne(ch);
  const open = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    .map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(q => s.tiles[q.y]?.[q.x] === T.CAVE_FLOOR);
  if (open.length !== 1) throw new Error(`cerulean cave: '${ch}' is not in a stub`);
  return open[0];
};
/** Ladder `ch` on `s` to the same letter on `other` (landing on the tile beside it). */
const ladder = (s: SketchShape, ch: string, other: SketchShape, otherId: string) => {
  const land = beside(other, ch);
  return { ...s.findOne(ch), targetMap: otherId, targetX: land.x, targetY: land.y };
};
const items = (s: SketchShape, prefix: string, itemIds: string[]): NPCData[] => {
  const spots = s.find('i');
  if (spots.length !== itemIds.length) throw new Error(`${prefix}: ${spots.length} item tiles for ${itemIds.length} items`);
  return spots.map((p, n) => ({ id: `${prefix}_${itemIds[n]}`, ...p, spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: itemIds[n] }));
};
const trainer = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor: number): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue, isTrainer: true, sightRange: 1,
});

// Levels climb with depth (Gen I: the strongest wilds in the game).
const landTable = (lo: number, extra: { speciesId: number; weight: number }[]) => ({
  grassRate: 0.08,
  encounters: [
    { speciesId: 42, minLevel: lo, maxLevel: lo + 6, weight: 15 },      // Golbat
    { speciesId: 82, minLevel: lo, maxLevel: lo + 6, weight: 10 },      // Magneton
    { speciesId: 97, minLevel: lo, maxLevel: lo + 6, weight: 10 },      // Hypno
    { speciesId: 64, minLevel: lo, maxLevel: lo + 6, weight: 10 },      // Kadabra
    { speciesId: 132, minLevel: lo, maxLevel: lo + 6, weight: 15 },     // Ditto
    { speciesId: 112, minLevel: lo, maxLevel: lo + 6, weight: 10 },     // Rhydon
    { speciesId: 113, minLevel: lo + 2, maxLevel: lo + 8, weight: 5 },  // Chansey
    ...extra.map(e => ({ ...e, minLevel: lo, maxLevel: lo + 6 })),
  ],
});
const CC_1F_ENCOUNTERS = landTable(46, [{ speciesId: 101, weight: 10 }, { speciesId: 67, weight: 10 }]);   // Electrode, Machoke
const CC_2F_ENCOUNTERS = landTable(49, [{ speciesId: 101, weight: 10 }, { speciesId: 40, weight: 10 }, { speciesId: 47, weight: 5 }]); // Electrode, Wigglytuff, Parasect
const CC_B1F_ENCOUNTERS = landTable(52, [{ speciesId: 108, weight: 10 }, { speciesId: 40, weight: 5 }]);   // Lickitung, Wigglytuff
const surfTable = (lo: number) => ({
  grassRate: 0.08,
  encounters: [
    { speciesId: 54, minLevel: lo, maxLevel: lo + 6, weight: 25 },      // Psyduck
    { speciesId: 55, minLevel: lo + 4, maxLevel: lo + 10, weight: 25 }, // Golduck
    { speciesId: 80, minLevel: lo + 4, maxLevel: lo + 10, weight: 20 }, // Slowbro
    { speciesId: 99, minLevel: lo, maxLevel: lo + 8, weight: 15 },      // Kingler
    { speciesId: 117, minLevel: lo, maxLevel: lo + 8, weight: 15 },     // Seadra
  ],
});

const floor = (id: string, s: SketchShape, extras: Partial<MapData> & { warps: MapData['warps']; npcs: NPCData[] }): MapData => ({
  id, name: 'CERULEAN CAVE', width: s.width, height: s.height, tiles: s.tiles, collision: s.collision, ...extras,
});

const CERULEAN_CAVE_1F = floor(F1, CC_1F, {
  warps: [
    // The door: leaving lands on the strip below the cave mouth in Cerulean City.
    { ...CC_1F.findOne('E'), targetMap: 'cerulean_city', targetX: 4, targetY: 2 },
    ladder(CC_1F, 'a', CC_2F, F2),   // up, on the far shore of the lake
    ladder(CC_1F, 'b', CC_2F, F2),   // the three pocket ladders 2F drops the player back down
    ladder(CC_1F, 'c', CC_2F, F2),
    ladder(CC_1F, 'f', CC_2F, F2),
    ladder(CC_1F, 'd', CC_2F, F2),   // the far side: where 2F's right branch comes down
    ladder(CC_1F, 'e', CC_B1F, B1),  // the only way down
  ],
  entryGates: [{
    from: ['cerulean_city'],
    requires: { flag: CHAMPION_FLAG },
    message: ['The POKeMON inside\nare horribly strong!', 'Only the POKeMON\nLEAGUE CHAMPION\nmay enter.'],
  }],
  npcs: [
    trainer(CC_1F, '1', 'cave_trainer1', Direction.LEFT, [
      "COOLTRAINER: You've\nmade it deep into",
      'CERULEAN CAVE!',
      "But can you handle\nwhat's inside?",
    ], 0xc06060),
    ...items(CC_1F, F1, ['full_restore', 'ultra_ball', 'nugget']),
  ],
  wildEncounters: CC_1F_ENCOUNTERS,
  surfEncounters: surfTable(40),
});

const CERULEAN_CAVE_2F = floor(F2, CC_2F, {
  warps: [
    ladder(CC_2F, 'a', CC_1F, F1),   // the arrival (first, so it is the floor's entry point)
    ladder(CC_2F, 'b', CC_1F, F1),
    ladder(CC_2F, 'c', CC_1F, F1),
    ladder(CC_2F, 'f', CC_1F, F1),
    ladder(CC_2F, 'd', CC_1F, F1),   // the goal: down to 1F's far side
  ],
  npcs: [
    trainer(CC_2F, '2', 'cave_trainer2', Direction.UP, [
      'COOLTRAINER: The\nPOKeMON in this cave',
      'are incredibly\nstrong!',
      "You'd better be\nprepared!",
    ], 0x6060c0),
    ...items(CC_2F, F2, ['max_potion', 'ultra_ball', 'rare_candy']),
  ],
  wildEncounters: CC_2F_ENCOUNTERS,
});

const CERULEAN_CAVE_B1F = floor(B1, CC_B1F, {
  warps: [ladder(CC_B1F, 'e', CC_1F, F1)],
  npcs: [
    {
      id: 'mewtwo',
      ...CC_B1F.findOne('M'),
      spriteColor: 0xc0b0d0,
      direction: Direction.DOWN,
      dialogue: [
        'A strange POKeMON\nis standing here!',
        "It's incredibly\npowerful!",
        "It's MEWTWO!",
      ],
      isTrainer: false,
    },
    ...items(CC_B1F, B1, ['escape_rope', 'revive']),
  ],
  wildEncounters: CC_B1F_ENCOUNTERS,
  surfEncounters: surfTable(44),
});

export const CAVE_MAPS: Record<string, MapData> = {
  [F1]: CERULEAN_CAVE_1F,
  [F2]: CERULEAN_CAVE_2F,
  [B1]: CERULEAN_CAVE_B1F,
};
