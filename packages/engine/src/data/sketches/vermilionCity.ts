import { TileType } from '../../types/map.types';
import { TownSketch } from './townSketch';

const T = TileType;

/**
 * Vermilion City: the port (town plan §2 E).
 *
 * The town runs down to the harbour. Route 6 comes in from the north, Route
 * 11 leaves east off the main street, and the quay at the bottom ends in the
 * pier where the S.S. ANNE is tied up — the gangway is the two warps on the
 * sea row. The mart, the Center and the Pokemon Fan Club line the north
 * street; Lt. Surge's Gym stands in a fenced yard in the south-west whose
 * only gate is the pair of cut trees at (5,14),(6,14), with the yard path
 * running down the west side to the door.
 *
 * 30x25. The drawing is `src/data/sketches/vermilion_city.json`; the two are
 * pinned to each other by `tests/data/townSketch.test.ts`.
 *
 * DEVIATION from `docs/towns/vermilion_city.json` (see `notes`): column x1
 * was left open, so the yard leaked around the west end of the fences on rows
 * 14 and 22 and the cut trees were not the gate at all. (1,14) and (1,22) are
 * fence here, which closes the yard exactly as the spec's note describes.
 */
export const VERMILION_CITY_SKETCH: TownSketch = {
  id: 'vermilion_city',
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
    F: T.FOUNTAIN,
    t: T.CUT_TREE,
    C: T.CAVE_ENTRANCE,
    ':': T.SAND,
    _: T.LEDGE,
    O: T.BOULDER,
    B: T.BUILDING,
    D: T.DOOR,
    d: T.DOORMAT,
    s: T.SIGN,
    W: T.PATH,
  },
  rows: [
    'TTTTTTTTTTTWWTTTTTTTTTTTTTTTTT',
    `T'''''''''....'''''''''''''''T`,
    `T''''''''s....'''''''''''''''T`,
    `T''''''''''..''''''''''''''''T`,
    `T''BBBBB'''..''BBBBBB''BBBBB'T`,
    `T''BBBBB'''..''BBBBBB''BBBBB'T`,
    `T''BBBBB'''..''BBBBBB''BBBBB'T`,
    `T''BBDBB'''..''BBDBBB''BBDBB'T`,
    `T''''d'''''..s'''d'''''''d'''T`,
    `T''''.....................'''T`,
    `T''''''''''..''''''''''''''''T`,
    `Ts'''''''''..'''''''''''''s''T`,
    'T............................W',
    'T............................W',
    `T====tt====..''''''''''''''''T`,
    `T'.....'''=s.''''''''''''''''T`,
    `T'.BBBBBBB=..*****''''''***''T`,
    `T'.BBBBBBB=..*****''''''***''T`,
    `T'.BBBBBBB=..''''''''''''''''T`,
    `T'.BBBBBBB=..''''''''''''''''T`,
    `T'.BBBDBBB=.."""'''''''''''''T`,
    `T'....d'''=.."""'''''''''''''T`,
    `T==========..'''''''sPPP'''''T`,
    'T::::::::::..........PPP:::::T',
    'T~~~~~~~~~~~~~~~~~~~~PWW~~~~~T',
  ],
  buildings: [
    {
      kind: 'mart',
      x: 3,
      y: 4,
      w: 5,
      h: 4,
      door: [5, 7],
      warp: 'pokemart_vermilion',
    },
    {
      kind: 'center',
      x: 15,
      y: 4,
      w: 6,
      h: 4,
      door: [17, 7],
      warp: 'pokemon_center_vermilion',
    },
    {
      kind: 'landmark',
      x: 23,
      y: 4,
      w: 5,
      h: 4,
      door: [25, 7],
      warp: 'pokemon_fan_club',
      note: "fan club: a Pokeball signboard",
    },
    {
      kind: 'gym',
      x: 3,
      y: 16,
      w: 7,
      h: 5,
      door: [6, 20],
      warp: 'vermilion_gym',
      note: "gym inside a fenced yard whose only gate is the two cut trees at (5,14),(6,14) (coords unchanged); the yard path runs down the west side to the door",
    },
  ],
  npcs: [
    // On the grass beside the gym-yard fence.
    { id: 'vermilion_npc1', x: 14, y: 14 },
    // On the lawn off the north street, facing the gym.
    { id: 'vermilion_npc3', x: 9, y: 11 },
    // On the pier, facing the gangway.
    { id: 'vermilion_sailor', x: 22, y: 22 },
    // At the head of the pier, facing the sea.
    { id: 'fishing_guru_vermilion', x: 24, y: 22 },
    // Patrolling the lawn west of the north road.
    { id: 'vermilion_officer_jenny', x: 3, y: 10 },
    // The Fan Club board, below its own building.
    { id: 'vermilion_fan_club_sign', x: 27, y: 10 },
  ],
  edgeWarps: [
    [11, 0, 'route6'],
    [12, 0, 'route6'],
    [29, 12, 'route11'],
    [29, 13, 'route11'],
    [22, 24, 'ss_anne'],
    [23, 24, 'ss_anne'],
  ],
  lookouts: [[6, 15]],
};
