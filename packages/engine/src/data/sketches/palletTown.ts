import { TileType } from '../../types/map.types';
import { TownSketch } from './townSketch';

export type { TownSketch } from './townSketch';

const T = TileType;

/**
 * Pallet Town: a hamlet on the sea (town plan §2 E).
 *
 * Two houses face each other across a short lane, each with a fenced front
 * yard and a flower bed; Oak's lab sits south on its own fenced plot with a
 * cobbled forecourt; the tall grass stays west, where Oak intercepts a
 * partyless player; a short pier runs into the sea and Route 21 leaves from
 * its end. Route 1 leaves through a two-wide gap in the tree ring, with the
 * town sign beside it.
 */
export const PALLET_TOWN_SKETCH: TownSketch = {
  id: 'pallet_town',
  legend: {
    T: T.TREE,
    '.': T.PATH,
    ',': T.COBBLESTONE,
    "'": T.GRASS,
    '"': T.TALL_GRASS,
    '*': T.FLOWER,
    '=': T.FENCE,
    '~': T.WATER,
    P: T.PLANK,
    h: T.BUILDING,
    L: T.BUILDING,
    D: T.DOOR,
    d: T.DOORMAT,
    s: T.SIGN,
    W: T.PATH,
  },
  rows: [
    // The tree ring closes right up to the two-tile Route 1 gap: a path tile
    // beside a warp tile is ground no player can ever stand on (the warp fires
    // first), and the sign at (8,1) walls off the west one — see
    // `tests/data/signsSolid.test.ts`. Deviates from docs/towns/pallet_town.json
    // by those two tiles.
    'TTTTTTTTTWWTTTTTTTTT',
    'TTTTTTTTs...TTTTTTTT',
    "T''''''''....''''''T",
    "T'hhhhh''....'hhhhhT",
    "T'hhhhh''....'hhhhhT",
    "T'hhDhh''....'hhDhhT",
    "T''=d='''....''=d='T",
    "T'''.............''T",
    `T'"""''''....'''**'T`,
    `T'"""'''.....'=====T`,
    "T'''''''.LLLLLLL''*T",
    "T''''''s.LLLLLLL''*T",
    "T'''''''.LLLDLLL'''T",
    "T'''''''....d,,....T",
    "T''''''''...''''''.T",
    'T~~~~~~~~PPP~~~~~~~T',
    'T~~~~~~~~PWW~~~~~~~T',
  ],
  buildings: [
    { kind: 'house', x: 2, y: 3, w: 5, h: 3, door: [4, 5], warp: 'player_house' },
    { kind: 'house', x: 14, y: 3, w: 5, h: 3, door: [16, 5], warp: 'rival_house' },
    { kind: 'landmark', x: 9, y: 10, w: 7, h: 3, door: [12, 12], warp: 'oaks_lab' },
  ],
  npcs: [
    // On the lane between the two houses, where she can see the lab path.
    { id: 'pallet_npc1', x: 9, y: 7 },
    // In the lab's garden, by the flower bed on the east fence.
    { id: 'pallet_npc2', x: 17, y: 12 },
    // On the pier, facing the sea and the Route 21 crossing.
    { id: 'pallet_fisher', x: 10, y: 15 },
  ],
  edgeWarps: [
    [9, 0, 'route1'],
    [10, 0, 'route1'],
    [10, 16, 'route21'],
    [11, 16, 'route21'],
  ],
  lookouts: [[18, 14]],
};
