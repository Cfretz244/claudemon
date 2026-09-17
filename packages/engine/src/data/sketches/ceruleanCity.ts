import { TileType } from '../../types/map.types';
import { TownSketch } from './townSketch';

const T = TileType;

/**
 * Cerulean City: the lakeside town at the crossroads (town plan §2 E).
 *
 * The town sits between two waters. The Nugget Bridge road comes down from
 * Route 24 across a plank bridge over the north lake; Route 4 arrives from
 * the west and Route 9 leaves east, behind the two cut trees. Misty's Gym
 * fronts the flower bed in the north-west, the Center and the mart face the
 * two main streets, the bike shop sits opposite the mart, and the burgled
 * house stands in the south-east with its back garden fenced off.
 *
 * The cave mouth at (4,1) is on a sand bank in the north lake: only SURF gets
 * you there. The plaza with the fountain is the south-west corner, and the
 * Route 5 road runs out of the bottom of the town.
 *
 * 25x25. The drawing is `src/data/sketches/cerulean_city.json`; the two are
 * pinned to each other by `tests/data/townSketch.test.ts`.
 *
 * DEVIATION from `docs/towns/cerulean_city.json` (see `notes`): the spec put
 * the Rocket grunt at (21,18), on the street beside the front door, which
 * would have thrown away the Gen I gate — the grunt is supposed to be behind
 * the burglar's hole. Here the garden east of the house is sealed (fences at
 * (21,18) and (20,19), with (23,18-19) and row 20 already fenced) and the
 * only way in is the second DOOR at (22,17); the grunt stands at (22,19).
 */
export const CERULEAN_CITY_SKETCH: TownSketch = {
  id: 'cerulean_city',
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
    'TTTTTTTTTTTWWTTTTTTTTTTTT',
    'T~~~C~~~~~~PP~~~~~~~~~~~T',
    'T~~::~~~~~~PP~~~~~~~~~~~T',
    'T~~~~~~~~~~PP~~~~~~~~~~~T',
    `T'*******'s..'''''''''''T`,
    `T'BBBBBBB''..'''''''BBBBT`,
    `T'BBBBBBB''..BBBBBB'BBBBT`,
    `T'BBBBBBB''..BBBBBB'BBBBT`,
    `T'BBBBBBB''..BBBBBB'BDBBT`,
    `T'BBBDBBB''..BBDBBB''d''T`,
    `T''''d'''''....d......''T`,
    `T''s'........s'''''''''sT`,
    'W.....................t.W',
    'W.....................t.W',
    `T'BBBBB''''..''''''BBBB=T`,
    `T'BBBBB''''..BBBBB'BBBB=T`,
    `T'BBBBB''''..BBBBB'BBBB=T`,
    `T'BBDBB''''..BBBBB'BDBD=T`,
    `T'''d''''''..BBDBB'.d='=T`,
    `T'''...........d....=''=T`,
    `T''''''''''..s'''''=====T`,
    `T'',,,F,,....'****''''''T`,
    `T'',,,,,,....'''''''''''T`,
    `T''''''''s....''''''''''T`,
    'TTTTTTTTTTWWWWTTTTTTTTTTT',
  ],
  buildings: [
    {
      kind: 'gym',
      x: 2,
      y: 5,
      w: 7,
      h: 5,
      door: [5, 9],
      warp: 'cerulean_gym',
    },
    {
      kind: 'center',
      x: 13,
      y: 6,
      w: 6,
      h: 4,
      door: [15, 9],
      warp: 'pokemon_center_cerulean',
    },
    {
      kind: 'house',
      x: 20,
      y: 5,
      w: 4,
      h: 4,
      door: [21, 8],
      warp: 'cerulean_house',
    },
    {
      kind: 'landmark',
      x: 2,
      y: 14,
      w: 5,
      h: 4,
      door: [4, 17],
      warp: 'bike_shop',
      note: "bike shop: a big shop window, a bike sign",
    },
    {
      kind: 'mart',
      x: 13,
      y: 15,
      w: 5,
      h: 4,
      door: [15, 18],
      warp: 'pokemart_cerulean',
    },
    {
      kind: 'house',
      x: 19,
      y: 14,
      w: 4,
      h: 4,
      door: [20, 17],
      warp: 'burgled_house',
      note: "the burgled house: the back door at (22,17) opens onto an ENCLOSED garden (22,18),(22,19),(21,19) fenced off from the street; the Rocket grunt stands in it and can only be reached through the house (the burglar hole)",
      extraDoors: [
        { door: [22, 17], land: [22, 18], note: "the burglar hole, from the town side: it is inside the garden, so the street cannot reach it" },
      ],
    },
  ],
  npcs: [
    // On the lawn between the gym and the main street.
    { id: 'cerulean_npc1', x: 9, y: 14 },
    // Off the main street, below the Center.
    { id: 'cerulean_npc2', x: 15, y: 14 },
    // In the enclosed garden, reachable only through the house.
    { id: 'cerulean_rocket', x: 22, y: 19 },
    // By the fountain plaza in the south-west.
    { id: 'cerulean_npc3', x: 5, y: 20 },
  ],
  edgeWarps: [
    [11, 0, 'route24'],
    [12, 0, 'route24'],
    [0, 12, 'route4'],
    [0, 13, 'route4'],
    [24, 12, 'route9'],
    [24, 13, 'route9'],
    [10, 24, 'route5'],
    [11, 24, 'route5'],
    [12, 24, 'route5'],
    [13, 24, 'route5'],
  ],
  lookouts: [],
};
