import { TileType } from '../../types/map.types';
import { TownSketch } from './townSketch';

const T = TileType;

/**
 * Pewter City: a stone town under the mountain (town plan §2 E).
 *
 * The ground is GRAVEL, not lawn — grass survives only as the lawns around
 * the flower beds at the north and south ends. The Museum of Science stands
 * on a raised terrace in the north-east: a LEDGE row walls the terrace off
 * along row 8 and the only way up is the stairs gap at (16,8), so you climb
 * to the museum and drop back down. Brock's Gym sits west behind a fenced
 * forecourt with a gate gap at (5,9), with a rock garden of ROCK boulders
 * beside it. The Center, the Mart and a house line the south street. Route 3
 * leaves east through the trees, Viridian Forest south.
 *
 * Deviations from `docs/towns/pewter_city.json` (recorded in the repo's copy
 * of the sketch too):
 *  - the rock garden is ROCK, not BOULDER: BOULDER is pushable with STRENGTH
 *    on ANY map (`OverworldScene.handleStrength`), and town decor must not
 *    slide around once the player has the RAINBOW badge;
 *  - the third NPC keeps its shipped id `pewter_guide` — the Route 3 gate in
 *    `logic/roadBlocks.ts` is keyed on it;
 *  - the south gap leads to `viridian_forest`, which is the map south of
 *    Pewter in this game (Route 2 is on the far side of the forest).
 *
 * 25x26. The drawing is `src/data/sketches/pewter_city.json`; the two are
 * pinned to each other by `tests/data/townSketch.test.ts`.
 */
export const PEWTER_CITY_SKETCH: TownSketch = {
  id: 'pewter_city',
  legend: {
    T: T.TREE,
    '.': T.PATH,
    "'": T.GRASS,
    '*': T.FLOWER,
    '=': T.FENCE,
    _: T.LEDGE,
    O: T.ROCK,
    M: T.BUILDING,
    g: T.BUILDING,
    c: T.BUILDING,
    m: T.BUILDING,
    h: T.BUILDING,
    D: T.DOOR,
    d: T.DOORMAT,
    s: T.SIGN,
    W: T.PATH,
    G: T.GRAVEL,
  },
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTT',
    `TGGGGGGGGGG''''''''''''GT`,
    `TGGGGGGGG..'**********'GT`,
    `TGggggggg..'sMMMMMMMM''GT`,
    'TGggggggg..GGMMMMMMMMGGGT',
    'TGggggggg..GGMMMMMMMMGGGT',
    'TGggggggg..GGMMMDMMMMGGGT',
    'TGgggDggg..GGGGGdGGGGGGGT',
    'TGGGGdGGG..G____._____GGT',
    'TG===.===..sGGGG.GGGGGGGT',
    'TGOGG............GGGGGGGT',
    'TGOOGGGOG..GGGGG.GGGGGGGT',
    'TGGsGGGGG..GGGGG.GGGGsG.W',
    'T.......................W',
    'T.......................T',
    'TGGGGGGGG..GGGGGGGGGGGTTT',
    'TGmmmmmGG..GccccccGGGGGGT',
    'TGmmmmmGG..GccccccGhhhhGT',
    'TGmmmmmGG..GccccccGhhhhGT',
    'TGmmDmmGG..GccDcccGhhhhGT',
    'TGGGdGGGG..GGGdGGGGhDhhGT',
    `T'''............GGGGdGGGT`,
    `T'**'GGGG..GGGG......'''T`,
    `T'**'GGG....sGGGGG'****'T`,
    `T''''GGG....GGGGGG''''''T`,
    'TTTTTTTTWWWWTTTTTTTTTTTTT',
  ],
  buildings: [
    {
      kind: 'landmark',
      x: 13,
      y: 3,
      w: 8,
      h: 4,
      door: [16, 6],
      warp: 'pewter_museum_1f',
      note: 'two-storey stone museum on a terrace; ledge row 8 with the stairs gap at x=16',
    },
    {
      kind: 'gym',
      x: 2,
      y: 3,
      w: 7,
      h: 5,
      door: [5, 7],
      warp: 'pewter_gym',
      note: 'rock garden boulders (decor, not pushable) west of the forecourt',
    },
    { kind: 'center', x: 12, y: 16, w: 6, h: 4, door: [14, 19], warp: 'pokemon_center_pewter' },
    { kind: 'mart', x: 2, y: 16, w: 5, h: 4, door: [4, 19], warp: 'pokemart_pewter' },
    { kind: 'house', x: 19, y: 17, w: 4, h: 4, door: [20, 20], warp: 'pewter_house' },
  ],
  npcs: [
    // North of the main street, between the gym forecourt and the rock garden.
    { id: 'pewter_npc1', x: 6, y: 12 },
    // On the terrace approach, beside the museum stairs.
    { id: 'pewter_npc2', x: 17, y: 11 },
    // The guide who turns you back from Route 3 until BOULDER, at the east
    // end of the main street with the Route 3 gap behind him.
    { id: 'pewter_guide', x: 21, y: 15 },
  ],
  edgeWarps: [
    [24, 12, 'route3'],
    [24, 13, 'route3'],
    [8, 25, 'viridian_forest'],
    [9, 25, 'viridian_forest'],
    [10, 25, 'viridian_forest'],
    [11, 25, 'viridian_forest'],
  ],
  lookouts: [],
};
