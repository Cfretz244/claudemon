import { MapData, NPCData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { createMapFromSketch, SketchShape, SOLID_TILES } from './mapBuilder';

const T = TileType;
// Graves are solid here (the global set keeps TOMBSTONE walkable for the endgame maps).
const TOWER_SOLID = new Set([...SOLID_TILES, T.TOMBSTONE]);

// ─── Pokemon Tower: a lobby and six graveyard floors drawn as sketches ──────
//
// 2F-7F are perfect mazes on a 9x6 lattice (20x14 tiles, generated and
// checked by tools/tower-floors.mjs in the helper repo) whose interior walls
// are rows of tombstones. Stairs sit in one-tile stubs at opposite ends of
// each floor (a warp tile fires on entry, not on the tile you land on), so
// every floor is a long walk from its arrival to its exit. People stand in
// niches: a wall tile beside a corridor tile whose only open neighbour is
// that tile. Trainers have sight range 1 and face a tile on the critical
// path, so they cannot be walked around and never block a corridor. Item
// balls sit on dead-end leaves (they block their tile until picked up).
// Legend: # wall, + tombstone, . floor (ghost encounters), u/d stairs, E the
// entrance mat, h the purified square (heals the party), i item ball, R the
// rival, 1-8 the channelers (tower_trainerN), N/O talkers, J/M Jessie &
// James, X/Y rocket grunts, P Mr. Fuji, c counter, `,` carpet.
//
// Story (unchanged mechanics, moved up two floors to match the seven-floor
// Gen I tower): without the SILPH SCOPE every encounter on 2F-7F is the
// unbeatable GHOST and the stairs from 6F to 7F are blocked; with it the
// ghost is revealed as MAROWAK and fought once on those stairs
// (OverworldScene.warpTo). The rockets on 7F only appear with the scope;
// beating all three (jessie_tower, tower_rocket1/2) sets tower_rockets_cleared,
// which makes Mr. Fuji appear at the far end of 7F with the POKe FLUTE.
const PT_LEGEND: Record<string, TileType> = {
  '#': T.WALL, '+': T.TOMBSTONE, '.': T.CAVE_FLOOR, u: T.DOOR, d: T.DOOR, h: T.HEAL_TILE,
  i: T.CAVE_FLOOR, R: T.CAVE_FLOOR, N: T.CAVE_FLOOR, O: T.CAVE_FLOOR, P: T.CAVE_FLOOR,
  J: T.CAVE_FLOOR, M: T.CAVE_FLOOR, X: T.CAVE_FLOOR, Y: T.CAVE_FLOOR,
  '1': T.CAVE_FLOOR, '2': T.CAVE_FLOOR, '3': T.CAVE_FLOOR, '4': T.CAVE_FLOOR, '5': T.CAVE_FLOOR, '6': T.CAVE_FLOOR, '7': T.CAVE_FLOOR, '8': T.CAVE_FLOOR,
};
const LOBBY_LEGEND: Record<string, TileType> = {
  '#': T.WALL, '.': T.INDOOR_FLOOR, ',': T.CARPET, c: T.COUNTER, u: T.DOOR, E: T.DOORMAT, N: T.INDOOR_FLOOR, O: T.INDOOR_FLOOR,
};
const CHANNELER = 0x8060a0, ROCKET = 0x383838, MOURNER = 0x505050;

const to = (p: { x: number; y: number }) => ({ targetX: p.x, targetY: p.y });
const ptTrainer = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor = CHANNELER): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue, isTrainer: true, sightRange: 1,
});
const ptTalker = (s: SketchShape, ch: string, id: string, direction: Direction, dialogue: string[], spriteColor = MOURNER): NPCData => ({
  id, ...s.findOne(ch), spriteColor, direction, dialogue,
});
/** Item balls on the floor's `i` tiles, row-major. */
const ptItems = (s: SketchShape, prefix: string, itemIds: string[]): NPCData[] => {
  const spots = s.find('i');
  if (spots.length !== itemIds.length) throw new Error(`${prefix}: ${spots.length} item tiles for ${itemIds.length} items`);
  return spots.map((p, n) => ({ id: `${prefix}_${itemIds[n]}`, ...p, spriteColor: 0x000000, direction: Direction.DOWN, dialogue: [], isItemBall: true, itemId: itemIds[n] }));
};
/** Stairs: `u` lands on the floor above's `d` and vice versa. */
const stairsUp = (s: SketchShape, above: SketchShape, aboveId: string) => ({ ...s.findOne('u'), targetMap: aboveId, ...to(above.findOne('d')) });
const stairsDown = (s: SketchShape, below: SketchShape, belowId: string) => ({ ...s.findOne('d'), targetMap: belowId, ...to(below.findOne('u')) });
/** Ghost-floor encounters: Gastly/Haunter with Cubone and bats, harder higher up. */
const ghosts = (lo: number) => ({
  grassRate: 0.15,
  encounters: [
    { speciesId: 92, minLevel: lo, maxLevel: lo + 4, weight: 35 },        // Gastly
    { speciesId: 93, minLevel: lo + 2, maxLevel: lo + 5, weight: 30 },    // Haunter
    { speciesId: 104, minLevel: lo, maxLevel: lo + 2, weight: 20 },       // Cubone
    { speciesId: lo < 24 ? 41 : 42, minLevel: lo, maxLevel: lo + 2, weight: 15 }, // Zubat, Golbat higher up
  ],
});

// 1F: the lobby. The entrance mat at the bottom, the stairs up in a stub at the top right.
const PT_1F = createMapFromSketch([
  '############',
  '##########u#',
  '#..........#',
  '#.ccc..ccc.#',
  '#..........#',
  '#.ccc..ccc.#',
  '#.....N....#',
  '#..........#',
  '#.ccc..ccc.#',
  '#..........#',
  '#.O........#',
  '#....,,....#',
  '#....,,....#',
  '#####E######',
], LOBBY_LEGEND);
const PT_2F = createMapFromSketch([
  '####################',
  '#...+u+...........+#',
  '#++.+.+.+++++++++.+#',
  '#...+...+.........+#',
  '#.++++++6.+++++++.+#',
  '#...+...+.....+i+.+#',
  '#++.+.+.+++.+.+.+.+#',
  '#...+.+...+.+.+.+.+#',
  '#.+++.+++.+++.+.+.+#',
  '#...+...+.....+...+#',
  '#++.+++.R++++++.+++#',
  '#d......+.........+#',
  '#++++++++++++++++++#',
  '####################',
], PT_LEGEND, { solid: TOWER_SOLID });
const PT_3F = createMapFromSketch([
  '####################',
  '#i..+...+.........+#',
  '#++.+.+.+.+++.+++.+#',
  '#...+.+.....+.+...+#',
  '#.+++++++++++.+++.+#',
  '#.+.........+...+.1#',
  '#.+.+++++++.+.+.+.+#',
  '#...+u....+.+d+.+.+#',
  '#++++++.+.+.+++.+.+#',
  '#.......+.+.....+.+#',
  '#.+++++++++++++++.+#',
  '#.................+#',
  '#++3+++++++++N+++++#',
  '####################',
], PT_LEGEND, { solid: TOWER_SOLID });
const PT_4F = createMapFromSketch([
  '####################',
  '#d..+.......+.....+#',
  '#++.+.+++++.+.+.+++#',
  '#...+..u+...+.+...+#',
  '#.+++++++.+++.2++.+#',
  '#.+.....+.....+...+#',
  '#.+.+++.+++++++.+++#',
  '#...+...+.....+...+#',
  '#++++.+++.+++.7++.+#',
  '#..i+.....+...+...+#',
  '#.+++++++++.+++.+.+#',
  '#...............+i+#',
  '#++++++++++++++++++#',
  '####################',
], PT_LEGEND, { solid: TOWER_SOLID });
const PT_5F = createMapFromSketch([
  '####################',
  '#i....+d..........+#',
  '#++++.+++++++++++.+#',
  '#u+...+...+.......+#',
  '#.+.+++.+.+.+++++.O#',
  '#.+.+...+...+...+.+#',
  '#.+.+.+++++++.+.+.+#',
  '#.+...+...+h..+...+#',
  '#.+++++.+++.+++++++#',
  '#...+...+...+.....+#',
  '#.+++.+.+.+++.+++.+#',
  '#.....+.......+i..+#',
  '#++++4+++++++++++++#',
  '####################',
], PT_LEGEND, { solid: TOWER_SOLID });
const PT_6F = createMapFromSketch([
  '####################',
  '#i..+.....+......i+#',
  '#++.+.+.+++.+.+++++#',
  '#...+.+.....+.....+#',
  '#.+++.++++8+5++++.+#',
  '#...+.....+.....+.+#',
  '#++.+++.+++.+++.+.+#',
  '#...+...+...+...+.+#',
  '#.+++.+++.+++++.+.+#',
  '#...+..u+.....+.+.+#',
  '#++.+++++++++.+.+.+#',
  '#d............+...+#',
  '#++++++++++++++++++#',
  '####################',
], PT_LEGEND, { solid: TOWER_SOLID });
const PT_7F = createMapFromSketch([
  '####################',
  '#P......+.........J#',
  '#++++++.+.+++++++.M#',
  '#.....+...+.....+.+#',
  '#.+++++++++.+++.+.+#',
  '#.+.......+...+.+.+#',
  '#.+.+++.+++.+.+++.+#',
  '#.+.+i+.+...+.....+#',
  '#.+.+.+.+.++++++Y++#',
  '#.+...+...+.....+d+#',
  '#.+++.+++++.+++.+.+#',
  '#...........+.....+#',
  '#++++X+++++++++++++#',
  '####################',
], PT_LEGEND, { solid: TOWER_SOLID });

const floor = (id: string, name: string, s: SketchShape, extras: Partial<MapData> & { warps: MapData['warps']; npcs: NPCData[] }): MapData => ({
  id, name, width: s.width, height: s.height, tiles: s.tiles, collision: s.collision, ...extras,
});

const POKEMON_TOWER_1F = floor('pokemon_tower_1f', 'POKEMON TOWER 1F', PT_1F, {
  warps: [
    { ...PT_1F.findOne('E'), targetMap: 'lavender_town', targetX: 14, targetY: 8 },
    stairsUp(PT_1F, PT_2F, 'pokemon_tower_2f'),
  ],
  npcs: [
    ptTalker(PT_1F, 'N', 'tower_greeter', Direction.DOWN, [
      'This is POKEMON\nTOWER, a memorial\nfor departed POKeMON.',
      'Many trainers come\nhere to pay respects.',
    ], 0x90a0b0),
    ptTalker(PT_1F, 'O', 'tower_lobby_mourner', Direction.RIGHT, [
      'My GROWLITHE rests\nupstairs...',
      "The upper floors are\nfull of restless\nspirits. Be careful.",
    ]),
  ],
});

// 2F: the rival waits beside the arrival stairs.
const POKEMON_TOWER_2F = floor('pokemon_tower_2f', 'POKEMON TOWER 2F', PT_2F, {
  warps: [stairsDown(PT_2F, PT_1F, 'pokemon_tower_1f'), stairsUp(PT_2F, PT_3F, 'pokemon_tower_3f')],
  npcs: [
    ptTrainer(PT_2F, 'R', 'rival_tower', Direction.LEFT, [
      "{RIVAL}: {PLAYER}!\nWhat are you doing\nhere?",
      "Since you're here,\nlet's battle!",
    ], 0x6080c0),
    ptTrainer(PT_2F, '6', 'tower_trainer6', Direction.RIGHT, ['CHANNELER: Heh heh\nheh... You can see\nme?', 'Then you must be\nstrong!']),
    ...ptItems(PT_2F, 'pokemon_tower_2f', ['escape_rope']),
  ],
  wildEncounters: ghosts(20),
});

const POKEMON_TOWER_3F = floor('pokemon_tower_3f', 'POKEMON TOWER 3F', PT_3F, {
  warps: [stairsDown(PT_3F, PT_2F, 'pokemon_tower_2f'), stairsUp(PT_3F, PT_4F, 'pokemon_tower_4f')],
  npcs: [
    ptTrainer(PT_3F, '1', 'tower_trainer1', Direction.LEFT, ['CHANNELER: Kee...\nThe spirits are', 'restless tonight!', 'Be gone, intruder!']),
    ptTrainer(PT_3F, '3', 'tower_trainer3', Direction.UP, ['CHANNELER: The dead\ndo not welcome you\nhere...']),
    ptTalker(PT_3F, 'N', 'tower_mourner', Direction.UP, ['I came to pay my\nrespects to my\ndear POKeMON...', 'Please, leave me\nin peace.']),
    ...ptItems(PT_3F, 'pokemon_tower_3f', ['awakening']),
  ],
  wildEncounters: ghosts(22),
});

const POKEMON_TOWER_4F = floor('pokemon_tower_4f', 'POKEMON TOWER 4F', PT_4F, {
  warps: [stairsDown(PT_4F, PT_3F, 'pokemon_tower_3f'), stairsUp(PT_4F, PT_5F, 'pokemon_tower_5f')],
  npcs: [
    ptTrainer(PT_4F, '7', 'tower_trainer7', Direction.LEFT, ['CHANNELER: Kyaaaa!\nAn intruder!', 'The ghosts will\npunish you!']),
    ptTrainer(PT_4F, '2', 'tower_trainer2', Direction.LEFT, ['CHANNELER: Heheheh...', 'Give... me... your\nenergy!']),
    ...ptItems(PT_4F, 'pokemon_tower_4f', ['hyper_potion', 'nugget']),
  ],
  wildEncounters: ghosts(24),
});

// 5F: the purified zone. The heal square is on the way; the channeler past it
// is the only one who does not fear the spirits.
const POKEMON_TOWER_5F = floor('pokemon_tower_5f', 'POKEMON TOWER 5F', PT_5F, {
  warps: [stairsDown(PT_5F, PT_4F, 'pokemon_tower_4f'), stairsUp(PT_5F, PT_6F, 'pokemon_tower_6f')],
  npcs: [
    ptTrainer(PT_5F, '4', 'tower_trainer4', Direction.UP, ['CHANNELER: The\nspirits speak to\nme...', 'They say you will\nlose!']),
    ptTalker(PT_5F, 'O', 'tower_5f_channeler', Direction.LEFT, [
      'CHANNELER: This\nsquare is purified.',
      'The spirits cannot\nreach you here...\nRest a while.',
    ], CHANNELER),
    ...ptItems(PT_5F, 'pokemon_tower_5f', ['max_potion', 'rare_candy']),
  ],
  wildEncounters: ghosts(26),
});

// 6F: the last graveyard; the ghost blocks the stairs up until the SILPH SCOPE.
const POKEMON_TOWER_6F = floor('pokemon_tower_6f', 'POKEMON TOWER 6F', PT_6F, {
  warps: [stairsDown(PT_6F, PT_5F, 'pokemon_tower_5f'), stairsUp(PT_6F, PT_7F, 'pokemon_tower_7f')],
  npcs: [
    ptTrainer(PT_6F, '5', 'tower_trainer5', Direction.DOWN, ['CHANNELER: This\nfloor is sacred...', 'You shall not pass!']),
    ptTrainer(PT_6F, '8', 'tower_trainer8', Direction.UP, ['CHANNELER: The\nspirits grow\nstronger here...', 'Can you feel them?']),
    ...ptItems(PT_6F, 'pokemon_tower_6f', ['full_heal', 'revive']),
  ],
  wildEncounters: ghosts(27),
});

// 7F: TEAM ROCKET holds Mr. Fuji at the far end. The grunts and Jessie & James
// only appear with the SILPH SCOPE and leave once beaten; Mr. Fuji appears then.
const POKEMON_TOWER_7F = floor('pokemon_tower_7f', 'POKEMON TOWER 7F', PT_7F, {
  entryGates: [
    // The ghost blocks the stairs until the SILPH SCOPE reveals it
    // (the Marowak battle itself is triggered in OverworldScene.warpTo)
    { requires: { item: 'silph_scope' }, message: [
      "A GHOST appeared!",
      "Get out...\nGet out...",
      "The GHOST won't let\nyou pass!",
    ] },
  ],
  warps: [stairsDown(PT_7F, PT_6F, 'pokemon_tower_6f')],
  npcs: [
    ptTrainer(PT_7F, 'X', 'tower_rocket1', Direction.UP, ['ROCKET: You again?!\nTEAM ROCKET owns\nthis tower!'], ROCKET),
    ptTrainer(PT_7F, 'Y', 'tower_rocket2', Direction.UP, ['ROCKET: You want to\nsave MR. FUJI?', "You'll have to get\nthrough me first!"], ROCKET),
    ptTrainer(PT_7F, 'J', 'jessie_tower', Direction.LEFT, [
      'JESSIE & JAMES: Stop\nright there, twerp!',
      'Prepare for trouble,\nthis tower is ours!',
      'And make it double,\nwe have ghostly powers!',
      'MEOWTH: Hand over\nyour POKeMON or\nMR. FUJI gets it!',
    ], 0xd02070),
    ptTalker(PT_7F, 'M', 'james_tower', Direction.LEFT, ['JAMES: These ghosts\nare really creepy...', 'But we must complete\nour mission for the\nboss!'], 0x6060d0),
    ptTalker(PT_7F, 'P', 'mr_fuji', Direction.RIGHT, [
      "MR. FUJI: Thank you\nfor saving me!",
      "Those TEAM ROCKET\nruffians held me\nhostage!",
      "Please, take this\nPOKe FLUTE as thanks!",
    ], 0xc0c0c0),
    ...ptItems(PT_7F, 'pokemon_tower_7f', ['escape_rope']),
  ],
  wildEncounters: ghosts(27),
});

export const TOWER_MAPS: Record<string, MapData> = Object.fromEntries(
  [POKEMON_TOWER_1F, POKEMON_TOWER_2F, POKEMON_TOWER_3F, POKEMON_TOWER_4F, POKEMON_TOWER_5F, POKEMON_TOWER_6F, POKEMON_TOWER_7F].map(m => [m.id, m]),
);
