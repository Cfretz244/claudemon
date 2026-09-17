import { TileType } from '../../types/map.types';
import { TownSketch } from './townSketch';

const T = TileType;

/**
 * Viridian City: a crossroads town in the woods (town plan §2 E).
 *
 * Three roads meet here and the town is drawn around them: the Route 2 road
 * comes down from the north, the Route 1 road leaves south, and the Route 22
 * road runs west out of the middle. The Gym is walled off in the north-west
 * behind a fenced forecourt with a single gate gap, so you walk up to it
 * rather than past it; the Pokemon Center faces the north road and the Mart
 * and the house face the south one, each with their doorstep on a street. A
 * pond with a fence and a flower border sits behind the Center, the tall
 * grass stays west of the crossroads, and the old man loiters by the gym
 * gate.
 *
 * 30x28. The drawing is `src/data/sketches/viridian_city.json`; the two are
 * pinned to each other by `tests/data/townSketch.test.ts`.
 */
export const VIRIDIAN_CITY_SKETCH: TownSketch = {
  id: 'viridian_city',
  legend: {
    T: T.TREE,
    '.': T.PATH,
    "'": T.GRASS,
    '"': T.TALL_GRASS,
    '*': T.FLOWER,
    '=': T.FENCE,
    '~': T.WATER,
    g: T.BUILDING,
    c: T.BUILDING,
    m: T.BUILDING,
    h: T.BUILDING,
    D: T.DOOR,
    d: T.DOORMAT,
    s: T.SIGN,
    W: T.PATH,
  },
  rows: [
    'TTTTTTTTWWWWTTTTTTTTTTTTTTTTTT',
    `T'''''''....'''''''''''''''''T`,
    `T'''''''....s''''''''''''''''T`,
    `T'ggggggg..''''''''''''''''''T`,
    `T'ggggggg..'''''''''~~~~~''''T`,
    `T'ggggggg..''cccccc'~~~~~''''T`,
    `T'ggggggg..''cccccc'~~~~~''''T`,
    `T'gggDggg..''cccccc'~~~~~''''T`,
    `T''''d'''..''ccDccc'=====''''T`,
    `T'===.===..''''d''''*****''''T`,
    `T'''s...........s''''''''''''T`,
    `T'""""'''..''''''''''''''''''T`,
    `T'""""'''..''''''''''''''''''T`,
    `T's''''''..''''''''''''''''''T`,
    `W........................''''T`,
    `W........................''''T`,
    `T''''''''..''''''''''''''''''T`,
    `T'***''''..''mmmmm'''hhhh'**'T`,
    `T'***''''..''mmmmm'''hhhh'**'T`,
    `T''''''''..''mmmmm'''hhhh'**'T`,
    `T''''''''..''mmDmm'''hDhh'**'T`,
    `T''''''''..''''d''''''d''''''T`,
    `T''''''''..............''''''T`,
    `T''''''''..'s''''''''''''''''T`,
    `T''''''''..''''''''''''''''''T`,
    `T'''''''....'''''''''''''''''T`,
    `T'''''''....'''''''''''''''''T`,
    'TTTTTTTTWWWWTTTTTTTTTTTTTTTTTT',
  ],
  buildings: [
    { kind: 'gym', x: 2, y: 3, w: 7, h: 5, door: [5, 7], warp: 'viridian_gym' },
    { kind: 'center', x: 13, y: 5, w: 6, h: 4, door: [15, 8], warp: 'pokemon_center' },
    { kind: 'mart', x: 13, y: 17, w: 5, h: 4, door: [15, 20], warp: 'pokemart' },
    { kind: 'house', x: 21, y: 17, w: 4, h: 4, door: [22, 20], warp: 'viridian_house' },
  ],
  npcs: [
    // The old man, beside the tall grass, facing the gym gate up the path.
    { id: 'viridian_npc1', x: 6, y: 11 },
    // On the grass off the north road, below the pond.
    { id: 'viridian_npc2', x: 12, y: 16 },
  ],
  edgeWarps: [
    [8, 0, 'route2'],
    [9, 0, 'route2'],
    [10, 0, 'route2'],
    [11, 0, 'route2'],
    [0, 14, 'route22'],
    [0, 15, 'route22'],
    [8, 27, 'route1'],
    [9, 27, 'route1'],
    [10, 27, 'route1'],
    [11, 27, 'route1'],
  ],
  lookouts: [],
};
