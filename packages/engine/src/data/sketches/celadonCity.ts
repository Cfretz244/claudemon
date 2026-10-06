import { TileType } from '../../types/map.types';
import { TownSketch } from './townSketch';

const T = TileType;

/**
 * Celadon City: the big city (town plan §2 E).
 *
 * A cobbled main street crosses the city east-west (Route 16's Cycling Road
 * gate on the west, Route 7 on the east) and a cobbled avenue runs north-
 * south through the fountain square at its middle. The Department Store, the
 * tallest building in town, stands on the north side across from the
 * Mansion; Erika's Gym sits in a flower garden in the south-west; the Game
 * Corner, with its neon board, and the Pokemon Center share the south
 * street. No Mart (the Department Store is the shop), no cut-tree gate.
 *
 * The avenue's south end (14,23),(15,23) is a declared lookout: the path
 * stops at the tree line on purpose.
 *
 * 30x25. The drawing is `src/data/sketches/celadon_city.json`; the two are
 * pinned to each other by `tests/data/townSketch.test.ts`. Identical to
 * `docs/towns/celadon_city.json`.
 */
export const CELADON_CITY_SKETCH: TownSketch = {
  id: 'celadon_city',
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
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    `T''''''''''''',,'''''''''''''T`,
    `T''''''''''''s,,''''BBBBBBBB'T`,
    `T'BBBBBBB'***',,'**'BBBBBBBB'T`,
    `T'BBBBBBB'***',,'**'BBBBBBBB'T`,
    `T'BBBBBBB''''',,''''BBBBBBBB'T`,
    `T'BBBBBBB''''',,''''BBBBBBBB'T`,
    `T'BBBBBBB''''',,''''BBBBBBBB'T`,
    `T'BBBDBBBs'''',,s'''BBBDBBBB'T`,
    `T''''d,,,,,,,,,,,,,,,,,d'''''T`,
    `T''T'''''''',,F,,,''''''''T''T`,
    `T''''''''''',,,,,,'''''''''''T`,
    'W,,,,,,,,,,,,,,,,,,,,,,,,,,,,W',
    'W,,,,,,,,,,,,,,,,,,,,,,,,,,,,W',
    `Ts*******''''',,'''''''''''s'T`,
    `T'BBBBBBB''''',,BBBBBB'BBBBBBT`,
    `T'BBBBBBB''''',,BBBBBB'BBBBBBT`,
    `T'BBBBBBB''''',,BBBBBB'BBBBBBT`,
    `T'BBBBBBB''''',,BBDBBB'BBDBBBT`,
    `T'BBBDBBB''''',,,,d,,,,,,d'''T`,
    `T''''d,,,,,,,,,,''''''s''''''T`,
    `T'*******'***s,,''''''''****'T`,
    `T'*******'***',,''''''''****'T`,
    `T''T'''''''''',,''''''''''''TT`,
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  ],
  buildings: [
    {
      kind: 'landmark',
      x: 2,
      y: 3,
      w: 7,
      h: 6,
      door: [5, 8],
      warp: 'celadon_mansion',
      note: "the Mansion: tall, many windows; back door dropped for now",
    },
    {
      kind: 'landmark',
      x: 20,
      y: 2,
      w: 8,
      h: 7,
      door: [23, 8],
      warp: 'celadon_dept_1f',
      note: "department store: four rows of windows, awning row, the tallest building in the city",
    },
    {
      kind: 'gym',
      x: 2,
      y: 15,
      w: 7,
      h: 5,
      door: [5, 19],
      warp: 'celadon_gym',
      note: "Erika's gym in a flower garden",
    },
    {
      kind: 'landmark',
      x: 16,
      y: 15,
      w: 6,
      h: 4,
      door: [18, 18],
      warp: 'game_corner',
      note: "game corner: neon signboard",
    },
    {
      kind: 'center',
      x: 23,
      y: 15,
      w: 6,
      h: 4,
      door: [25, 18],
      warp: 'pokemon_center_celadon',
    },
  ],
  npcs: [
    { id: 'celadon_npc1', x: 11, y: 14 },
    { id: 'celadon_npc2', x: 18, y: 14 },
    { id: 'celadon_npc3', x: 11, y: 23 },
    { id: 'celadon_npc4', x: 25, y: 11 },
    { id: 'celadon_tea_lady', x: 4, y: 11 },
  ],
  edgeWarps: [
    [0, 12, 'route16'],
    [0, 13, 'route16'],
    [29, 12, 'route7'],
    [29, 13, 'route7'],
  ],
  lookouts: [[14, 23], [15, 23]],
};
