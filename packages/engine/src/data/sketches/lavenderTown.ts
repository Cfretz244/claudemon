import { TileType } from '../../types/map.types';
import { TownSketch } from './townSketch';

const T = TileType;

/**
 * Lavender Town: a quiet town under the Tower (town plan §2 E).
 *
 * Small and still. Route 10 comes down from Rock Tunnel in the north, Route 8
 * arrives from Saffron on the west, Route 12 leaves south; the three roads
 * meet on the one short street. The Pokemon Tower dominates the north-east:
 * a pagoda roof over a 5x7 footprint, the graveyard fence along its west
 * side (x=12) and a row of tombstones between it and the tree line. The
 * Center sits opposite the Tower, the Mart and the volunteer house share the
 * south lane. No cut trees, no gates.
 *
 * 20x20. The drawing is `src/data/sketches/lavender_town.json`; the two are
 * pinned to each other by `tests/data/townSketch.test.ts`. Identical to
 * `docs/towns/lavender_town.json`.
 */
export const LAVENDER_TOWN_SKETCH: TownSketch = {
  id: 'lavender_town',
  legend: {
    T: T.TREE,
    '.': T.PATH,
    ',': T.COBBLESTONE,
    "'": T.GRASS,
    '*': T.FLOWER,
    '=': T.FENCE,
    '~': T.WATER,
    F: T.FOUNTAIN,
    '+': T.TOMBSTONE,
    B: T.BUILDING,
    D: T.DOOR,
    d: T.DOORMAT,
    s: T.SIGN,
    W: T.PATH,
  },
  rows: [
    'TTTTTTTTTWWTTTTTTTTT',
    `T''''''''..''''''''T`,
    `T'******s..'=BBBBB'T`,
    `T''''''''..'=BBBBB+T`,
    `T'BBBBBB'..'=BBBBB*T`,
    `T'BBBBBB'..'=BBBBB+T`,
    `T'BBBBBB'..'=BBBBB*T`,
    `T'BBDBBB'..'=BBBBB+T`,
    `T'''d......s=BBDBB'T`,
    `T''''''''......d'''T`,
    'W..................T',
    'W..................T',
    `Ts'''''''..''''''''T`,
    `T'BBBBB''..''BBBB''T`,
    `T'BBBBB''..''BBBB''T`,
    `T'BBBBB''..''BBBB''T`,
    `T'BBDBB''..''BDBB''T`,
    `T'''d.........d''''T`,
    `T''''''''..s'****''T`,
    'TTTTTTTTTWWTTTTTTTTT',
  ],
  buildings: [
    {
      kind: 'landmark',
      x: 13,
      y: 2,
      w: 5,
      h: 7,
      door: [15, 8],
      warp: 'pokemon_tower_1f',
      note: "Pokemon Tower: pagoda roof (3 ridge rows), graveyard fence west (x=12) and tombstones east",
    },
    {
      kind: 'center',
      x: 2,
      y: 4,
      w: 6,
      h: 4,
      door: [4, 7],
      warp: 'pokemon_center_lavender',
    },
    {
      kind: 'mart',
      x: 2,
      y: 13,
      w: 5,
      h: 4,
      door: [4, 16],
      warp: 'pokemart_lavender',
    },
    {
      kind: 'house',
      x: 13,
      y: 13,
      w: 4,
      h: 4,
      door: [14, 16],
      warp: 'lavender_house',
    },
  ],
  npcs: [
    { id: 'lavender_npc1', x: 7, y: 12 },
    { id: 'lavender_npc2', x: 12, y: 12 },
    { id: 'lavender_npc3', x: 17, y: 9 },
  ],
  edgeWarps: [
    [9, 0, 'route10'],
    [10, 0, 'route10'],
    [0, 10, 'route8'],
    [0, 11, 'route8'],
    [9, 19, 'route12'],
    [10, 19, 'route12'],
  ],
  lookouts: [],
};
