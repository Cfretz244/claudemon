import { MapData, TileType } from '../types/map.types';
import { Direction } from '../utils/constants';
import { createMapFromSketch, createMapShape, SketchShape } from './mapBuilder';

const T = TileType;

// ─── 1. LAVENDER TOWN ────────────────────────────────────────────────────────

export const LAVENDER_TOWN: MapData = (() => {
  const W = 20, H = 20;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Tree borders (2 tiles thick)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, 1, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Main roads
  fillRect(8, 2, 4, 18, T.PATH);   // vertical
  fillRect(2, 10, 16, 2, T.PATH);   // horizontal

  // Pokemon Tower (large building)
  fillRect(12, 3, 5, 1, T.ROOF); fillRect(12, 4, 5, 4, T.BUILDING);
  setTile(14, 7, T.DOOR);

  // Pokemon Center
  fillRect(3, 5, 5, 1, T.ROOF); fillRect(3, 6, 5, 3, T.BUILDING);
  setTile(5, 8, T.DOOR);

  // Pokemart
  fillRect(3, 13, 5, 1, T.ROOF); fillRect(3, 14, 5, 3, T.BUILDING);
  setTile(5, 16, T.DOOR);

  // House
  fillRect(12, 13, 5, 1, T.ROOF); fillRect(12, 14, 5, 3, T.BUILDING);
  setTile(14, 16, T.DOOR);

  // Signs
  setTile(7, 10, T.SIGN);
  setTile(13, 9, T.SIGN);

  return {
    id: 'lavender_town',
    name: 'LAVENDER TOWN',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Route 8
      { x: 1, y: 10, targetMap: 'route8', targetX: 24, targetY: 5 },
      { x: 1, y: 11, targetMap: 'route8', targetX: 24, targetY: 5 },
      // North exit → Route 10
      { x: 9, y: 1, targetMap: 'route10', targetX: 9, targetY: 23 },
      { x: 10, y: 1, targetMap: 'route10', targetX: 9, targetY: 23 },
      // South exit → Route 12
      { x: 9, y: 19, targetMap: 'route12', targetX: 7, targetY: 1 },
      { x: 10, y: 19, targetMap: 'route12', targetX: 7, targetY: 1 },
      // Pokemon Tower door
      { x: 14, y: 7, targetMap: 'pokemon_tower_1f', targetX: 5, targetY: 13 },
      // Pokemon Center door
      { x: 5, y: 8, targetMap: 'pokemon_center_lavender', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 5, y: 16, targetMap: 'pokemart_lavender', targetX: 3, targetY: 7 },
      // House door
      { x: 14, y: 16, targetMap: 'lavender_house', targetX: 3, targetY: 7 },
    ],
    npcs: [
      {
        id: 'lavender_npc1',
        x: 6, y: 11,
        spriteColor: 0x9070a0,
        direction: Direction.DOWN,
        dialogue: [
          'LAVENDER TOWN',
          'The Noble Purple\nTown...',
          "Can you hear the\ncries at night?",
        ],
      },
      {
        id: 'lavender_npc2',
        x: 13, y: 11,
        spriteColor: 0x808080,
        direction: Direction.LEFT,
        dialogue: [
          'They say ghosts\nappear in POKEMON',
          'TOWER... I can feel\nthem watching...',
        ],
      },
      {
        id: 'lavender_npc3',
        x: 11, y: 17,
        spriteColor: 0x605080,
        direction: Direction.UP,
        dialogue: [
          "I came to pay my\nrespects to my",
          'departed POKeMON...',
          'POKEMON TOWER is a\nresting place for them.',
        ],
      },
    ],
  };
})();

// ─── 3. POKEMON CENTER (LAVENDER) ────────────────────────────────────────────

export const POKEMON_CENTER_LAVENDER: MapData = (() => {
  const W = 10, H = 8;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Nurse counter — enclosed bar with side returns
  fillRect(3, 2, 4, 1, T.COUNTER);
  setTile(3, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet to door
  fillRect(4, 5, 2, 2, T.CARPET);

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT); setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_lavender',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'lavender_town', targetX: 5, targetY: 9 },
      { x: 5, y: 7, targetMap: 'lavender_town', targetX: 5, targetY: 9 },
    ],
    npcs: [
      {
        id: 'nurse_lavender',
        x: 5, y: 2,
        spriteColor: 0xf080a0,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome to our\nPOKeMON CENTER!',
          'We heal your POKeMON\nback to perfect health!',
          'Your POKeMON have been\nfully restored!',
        ],
      },
    ],
  };
})();

// ─── 4. ROUTE 7 ──────────────────────────────────────────────────────────────

export const ROUTE7: MapData = (() => {
  const W = 20, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Horizontal path
  fillRect(0, 4, 20, 2, T.PATH);

  // Tree borders: top row, bottom row
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, H - 1, T.TREE); }

  // Guardhouse building
  fillRect(9, 2, 3, 2, T.BUILDING);
  setTile(10, 3, T.DOOR);

  // Tall grass patches
  fillRect(2, 2, 4, 2, T.TALL_GRASS);
  fillRect(15, 6, 4, 2, T.TALL_GRASS);

  // Sign near underground entrance
  setTile(12, 3, T.SIGN);

  return {
    id: 'route7',
    name: 'ROUTE 7',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Celadon City
      { x: 0, y: 4, targetMap: 'celadon_city', targetX: 27, targetY: 12 },
      { x: 0, y: 5, targetMap: 'celadon_city', targetX: 27, targetY: 13 },
      // East exit → Route 7 Gate (guard checks for Tea)
      { x: 19, y: 4, targetMap: 'route7_gate', targetX: 1, targetY: 2 },
      { x: 19, y: 5, targetMap: 'route7_gate', targetX: 1, targetY: 3 },
      // Underground Path entrance
      { x: 10, y: 3, targetMap: 'underground_ew', targetX: 1, targetY: 2 },
    ],
    npcs: [],
    wildEncounters: {
      grassRate: 0.15,
      encounters: [
        { speciesId: 58, minLevel: 18, maxLevel: 22, weight: 30 },  // Growlithe
        { speciesId: 37, minLevel: 18, maxLevel: 22, weight: 30 },  // Vulpix
        { speciesId: 16, minLevel: 19, maxLevel: 22, weight: 20 },  // Pidgey
        { speciesId: 43, minLevel: 18, maxLevel: 22, weight: 20 },  // Oddish
      ],
    },
  };
})();

// ─── 5. ROUTE 8 ──────────────────────────────────────────────────────────────

export const ROUTE8: MapData = (() => {
  const W = 25, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Horizontal path
  fillRect(0, 4, 25, 2, T.PATH);

  // Tree borders: top/bottom
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, H - 1, T.TREE); }

  // Tall grass patches
  fillRect(3, 1, 4, 3, T.TALL_GRASS);
  fillRect(10, 6, 4, 3, T.TALL_GRASS);
  fillRect(18, 1, 4, 3, T.TALL_GRASS);

  // Underground Path entrance building
  fillRect(14, 1, 3, 1, T.ROOF);
  fillRect(14, 2, 3, 1, T.BUILDING);
  setTile(14, 3, T.BUILDING); setTile(16, 3, T.BUILDING);
  setTile(15, 3, T.DOOR);
  setTile(13, 3, T.SIGN);

  return {
    id: 'route8',
    name: 'ROUTE 8',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West exit → Saffron Gate East (guard checks for Tea)
      { x: 0, y: 4, targetMap: 'saffron_gate_east', targetX: 6, targetY: 2 },
      { x: 0, y: 5, targetMap: 'saffron_gate_east', targetX: 6, targetY: 3 },
      // East exit → Lavender Town
      { x: 24, y: 4, targetMap: 'lavender_town', targetX: 2, targetY: 10 },
      { x: 24, y: 5, targetMap: 'lavender_town', targetX: 2, targetY: 11 },
      // Underground Path entrance
      { x: 15, y: 3, targetMap: 'underground_ew', targetX: 28, targetY: 2 },
    ],
    npcs: [
      {
        id: 'route8_trainer1',
        x: 6, y: 4,
        spriteColor: 0xc08060,
        direction: Direction.RIGHT,
        dialogue: [
          "GAMBLER: I'm feeling\nlucky today!",
          "Let's see if your\nPOKeMON can beat mine!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route8_trainer3',
        x: 14, y: 5,
        spriteColor: 0xe06080,
        direction: Direction.LEFT,
        dialogue: [
          'LASS: My POKeMON are\npretty and strong!',
          "Don't underestimate\nus!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route8_trainer2',
        x: 20, y: 4,
        spriteColor: 0x60a0c0,
        direction: Direction.LEFT,
        dialogue: [
          'SUPER NERD: I study\nPOKeMON extensively!',
          'My research tells me\nI will win!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 16, minLevel: 18, maxLevel: 22, weight: 15 },  // Pidgey
        { speciesId: 23, minLevel: 18, maxLevel: 22, weight: 15 },  // Ekans
        { speciesId: 37, minLevel: 18, maxLevel: 22, weight: 15 },  // Vulpix
        { speciesId: 52, minLevel: 18, maxLevel: 20, weight: 15 },  // Meowth
        { speciesId: 64, minLevel: 20, maxLevel: 22, weight: 10 },  // Kadabra
        { speciesId: 93, minLevel: 20, maxLevel: 22, weight: 10 },  // Haunter
        { speciesId: 58, minLevel: 20, maxLevel: 22, weight: 20 },  // Growlithe
      ],
    },
  };
})();

// ─── 6. ROUTE 11 ─────────────────────────────────────────────────────────────

export const ROUTE11: MapData = (() => {
  const W = 25, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Horizontal path
  fillRect(0, 4, 25, 2, T.PATH);

  // Tree borders: top/bottom
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, H - 1, T.TREE); }

  // Tall grass patches
  fillRect(4, 1, 5, 3, T.TALL_GRASS);
  fillRect(12, 6, 5, 3, T.TALL_GRASS);
  fillRect(20, 1, 4, 3, T.TALL_GRASS);

  // Diglett's Cave entrance
  fillRect(21, 2, 3, 2, T.BUILDING);
  setTile(22, 3, T.DOOR);

  return {
    id: 'route11',
    name: 'ROUTE 11',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // West entrance → Vermilion City
      { x: 0, y: 4, targetMap: 'vermilion_city', targetX: 27, targetY: 12 },
      { x: 0, y: 5, targetMap: 'vermilion_city', targetX: 27, targetY: 13 },
      // Diglett's Cave entrance
      { x: 22, y: 3, targetMap: 'digletts_cave', targetX: 6, targetY: 18 },
      // East exit → Route 11/12 Gate
      { x: 24, y: 4, targetMap: 'route11_gate', targetX: 1, targetY: 2 },
      { x: 24, y: 5, targetMap: 'route11_gate', targetX: 1, targetY: 3 },
    ],
    npcs: [
      {
        id: 'route11_trainer1',
        x: 8, y: 4,
        spriteColor: 0xc09060,
        direction: Direction.RIGHT,
        dialogue: [
          "YOUNGSTER: I've been\ntraining here for",
          'days! No one can\nbeat me!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'route11_trainer2',
        x: 16, y: 5,
        spriteColor: 0xa080c0,
        direction: Direction.LEFT,
        dialogue: [
          "GAMBLER: Wanna bet\nI'll win?",
          'I never lose a\nPOKeMON battle!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
    ],
    wildEncounters: {
      grassRate: 0.2,
      encounters: [
        { speciesId: 23, minLevel: 15, maxLevel: 19, weight: 25 },  // Ekans
        { speciesId: 21, minLevel: 15, maxLevel: 17, weight: 20 },  // Spearow
        { speciesId: 96, minLevel: 15, maxLevel: 17, weight: 20 },  // Drowzee
        { speciesId: 27, minLevel: 15, maxLevel: 19, weight: 20 },  // Sandshrew
        { speciesId: 81, minLevel: 16, maxLevel: 18, weight: 15 },  // Magnemite
      ],
    },
  };
})();

// ─── 7. CELADON CITY ─────────────────────────────────────────────────────────

export const CELADON_CITY: MapData = (() => {
  const W = 30, H = 25;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Tree borders (2 tiles thick on all four sides — Celadon has no north/south exits)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, 1, T.TREE); setTile(x, H - 2, T.TREE); setTile(x, H - 1, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Main roads — vertical path ends within the city so it doesn't imply off-map exits
  fillRect(13, 4, 4, 17, T.PATH);  // vertical (y=4..20)
  fillRect(2, 12, 26, 2, T.PATH);  // horizontal

  // Celadon Gym
  fillRect(3, 5, 6, 1, T.ROOF); fillRect(3, 6, 6, 4, T.BUILDING);
  setTile(6, 9, T.DOOR);

  // Pokemon Center
  fillRect(20, 5, 5, 1, T.ROOF); fillRect(20, 6, 5, 3, T.BUILDING);
  setTile(22, 8, T.DOOR);

  // Department Store (large)
  fillRect(20, 15, 6, 1, T.ROOF); fillRect(20, 16, 6, 4, T.BUILDING);
  setTile(23, 19, T.DOOR);

  // Game Corner
  fillRect(10, 15, 6, 1, T.ROOF); fillRect(10, 16, 6, 3, T.BUILDING);
  setTile(13, 18, T.DOOR);

  // Celadon Mansion
  fillRect(3, 15, 5, 1, T.ROOF); fillRect(3, 16, 5, 3, T.BUILDING);
  setTile(5, 18, T.DOOR);

  // Garden fountain
  setTile(14, 8, T.FOUNTAIN); setTile(15, 8, T.FOUNTAIN);

  // Flowers everywhere (it's the garden city!)
  setTile(10, 5, T.FLOWER); setTile(11, 5, T.FLOWER); setTile(12, 5, T.FLOWER);
  setTile(10, 6, T.FLOWER); setTile(11, 6, T.FLOWER);
  setTile(17, 5, T.FLOWER); setTile(18, 5, T.FLOWER); setTile(19, 5, T.FLOWER);
  setTile(17, 6, T.FLOWER); setTile(18, 6, T.FLOWER);
  setTile(5, 22, T.FLOWER); setTile(6, 22, T.FLOWER); setTile(7, 22, T.FLOWER);
  setTile(10, 22, T.FLOWER); setTile(11, 22, T.FLOWER);
  setTile(20, 22, T.FLOWER); setTile(21, 22, T.FLOWER);
  setTile(3, 12, T.FLOWER); setTile(4, 12, T.FLOWER);

  // Signs
  setTile(12, 12, T.SIGN);
  setTile(9, 10, T.SIGN);

  return {
    id: 'celadon_city',
    name: 'CELADON CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // East exit → Route 7
      { x: 28, y: 12, targetMap: 'route7', targetX: 1, targetY: 4 },
      { x: 28, y: 13, targetMap: 'route7', targetX: 1, targetY: 5 },
      // West exit → Route 16 (Cycling Road)
      { x: 1, y: 12, targetMap: 'route16', targetX: 12, targetY: 2 },
      { x: 1, y: 13, targetMap: 'route16', targetX: 12, targetY: 3 },
      // Gym door
      { x: 6, y: 9, targetMap: 'celadon_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 22, y: 8, targetMap: 'pokemon_center_celadon', targetX: 4, targetY: 7 },
      // Department Store
      { x: 23, y: 19, targetMap: 'celadon_dept_1f', targetX: 5, targetY: 9 },
      // Game Corner
      { x: 13, y: 18, targetMap: 'game_corner', targetX: 7, targetY: 10 },
      // Celadon Mansion
      { x: 5, y: 18, targetMap: 'celadon_mansion', targetX: 3, targetY: 7 },
    ],
    npcs: [
      {
        id: 'celadon_npc1',
        x: 12, y: 13,
        spriteColor: 0x60c060,
        direction: Direction.DOWN,
        dialogue: [
          'CELADON CITY',
          'The City of Rainbow\nDreams!',
        ],
      },
      {
        id: 'celadon_npc2',
        x: 18, y: 12,
        spriteColor: 0xf0a060,
        direction: Direction.LEFT,
        dialogue: [
          "Have you been to the\nDEPARTMENT STORE?",
          "They have everything\na trainer needs!",
        ],
      },
      {
        id: 'celadon_npc3',
        x: 9, y: 20,
        spriteColor: 0xa0c0f0,
        direction: Direction.RIGHT,
        dialogue: [
          "The GAME CORNER is\nso much fun!",
          "But I keep losing\nall my coins...",
        ],
      },
      {
        id: 'celadon_npc4',
        x: 8, y: 10,
        spriteColor: 0x80c080,
        direction: Direction.DOWN,
        dialogue: [
          "ERIKA is the GYM\nLEADER here.",
          "She uses GRASS-type\nPOKeMON. Be prepared!",
        ],
      },
      {
        id: 'celadon_tea_lady',
        x: 4, y: 19,
        spriteColor: 0xc0a080,
        direction: Direction.RIGHT,
        dialogue: [
          "I work at CELADON\nMANSION.",
          "Here, have some TEA!\nIt's very refreshing!",
        ],
      },
    ],
  };
})();

// ─── 8. CELADON GYM ──────────────────────────────────────────────────────────

export const CELADON_GYM: MapData = (() => {
  const W = 10, H = 14;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Decorative planters (TALL_GRASS inside - it's a grass gym!)
  fillRect(2, 4, 2, 3, T.TALL_GRASS);
  fillRect(6, 4, 2, 3, T.TALL_GRASS);

  // Additional plant decorations
  fillRect(2, 9, 2, 2, T.TALL_GRASS);
  fillRect(6, 9, 2, 2, T.TALL_GRASS);

  // Entrance mat on exit warps
  setTile(4, 13, T.DOORMAT); setTile(5, 13, T.DOORMAT);

  return {
    id: 'celadon_gym',
    name: 'CELADON GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'celadon_city', targetX: 6, targetY: 10 },
      { x: 5, y: 13, targetMap: 'celadon_city', targetX: 6, targetY: 10 },
    ],
    npcs: [
      {
        id: 'erika',
        x: 4, y: 3,
        spriteColor: 0x60c060,
        direction: Direction.DOWN,
        dialogue: [
          'ERIKA: Hello...',
          "I'm ERIKA, the GYM\nLEADER here.",
          'Let me show you the\nbeauty of GRASS types!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'celadon_gym_trainer1',
        x: 3, y: 8,
        spriteColor: 0x80c080,
        direction: Direction.RIGHT,
        dialogue: [
          "BEAUTY: The flowers\nin this GYM are",
          "lovely, just like\nmy POKeMON!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'celadon_gym_trainer2',
        x: 7, y: 11,
        spriteColor: 0x80c080,
        direction: Direction.LEFT,
        dialogue: [
          'LASS: ERIKA taught\nme everything about',
          'GRASS-type POKeMON!',
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── 9. POKEMON CENTER (CELADON) ─────────────────────────────────────────────

export const POKEMON_CENTER_CELADON: MapData = (() => {
  const W = 10, H = 8;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Nurse counter — enclosed bar with side returns
  fillRect(3, 2, 4, 1, T.COUNTER);
  setTile(3, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet to door
  fillRect(4, 5, 2, 2, T.CARPET);

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT); setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_celadon',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'celadon_city', targetX: 22, targetY: 9 },
      { x: 5, y: 7, targetMap: 'celadon_city', targetX: 22, targetY: 9 },
    ],
    npcs: [
      {
        id: 'nurse_celadon',
        x: 5, y: 2,
        spriteColor: 0xf080a0,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome to our\nPOKeMON CENTER!',
          'We heal your POKeMON\nback to perfect health!',
          'Your POKeMON have been\nfully restored!',
        ],
      },
    ],
  };
})();

// ─── 10. SAFFRON CITY ────────────────────────────────────────────────────────

export const SAFFRON_CITY: MapData = (() => {
  const W = 30, H = 28;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.GRASS);

  // Tree borders (2 tiles thick)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.TREE); setTile(x, 1, T.TREE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.TREE); setTile(1, y, T.TREE); setTile(W - 1, y, T.TREE); setTile(W - 2, y, T.TREE); }

  // Main roads
  fillRect(13, 2, 4, 26, T.PATH);  // vertical
  fillRect(2, 14, 26, 2, T.PATH);  // horizontal

  // Silph Co (large building)
  fillRect(12, 4, 6, 1, T.ROOF); fillRect(12, 5, 6, 5, T.BUILDING);
  setTile(15, 9, T.DOOR);

  // Saffron Gym
  fillRect(4, 4, 6, 1, T.ROOF); fillRect(4, 5, 6, 4, T.BUILDING);
  setTile(7, 8, T.DOOR);

  // Fighting Dojo
  fillRect(22, 4, 6, 1, T.ROOF); fillRect(22, 5, 6, 4, T.BUILDING);
  setTile(25, 8, T.DOOR);

  // Pokemon Center
  fillRect(4, 18, 5, 1, T.ROOF); fillRect(4, 19, 5, 3, T.BUILDING);
  setTile(6, 21, T.DOOR);

  // Pokemart
  fillRect(22, 18, 5, 1, T.ROOF); fillRect(22, 19, 5, 3, T.BUILDING);
  setTile(24, 21, T.DOOR);

  // Urban plaza cobblestone (central crossroads)
  setTile(14, 13, T.COBBLESTONE); setTile(15, 13, T.COBBLESTONE);
  setTile(14, 16, T.COBBLESTONE); setTile(15, 16, T.COBBLESTONE);
  setTile(13, 12, T.COBBLESTONE); setTile(16, 12, T.COBBLESTONE);

  // Signs
  setTile(12, 14, T.SIGN);
  setTile(6, 14, T.SIGN);
  setTile(24, 14, T.SIGN);

  return {
    id: 'saffron_city',
    entryGates: [
      // Every gate guard is thirsty until you bring TEA (or the city is opened)
      { requires: { anyOf: [{ item: 'tea' }, { flag: 'saffron_open' }] }, message: [
        "The guard is thirsty...",
        "He won't let you\nthrough!",
      ] },
    ],
    name: 'SAFFRON CITY',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      // North exit → Saffron Gate North
      { x: 14, y: 1, targetMap: 'saffron_gate_north', targetX: 2, targetY: 6 },
      { x: 15, y: 1, targetMap: 'saffron_gate_north', targetX: 3, targetY: 6 },
      // South exit → Saffron Gate South
      { x: 14, y: 27, targetMap: 'saffron_gate_south', targetX: 2, targetY: 1 },
      { x: 15, y: 27, targetMap: 'saffron_gate_south', targetX: 3, targetY: 1 },
      // West exit → Route 7 Gate
      { x: 1, y: 14, targetMap: 'route7_gate', targetX: 6, targetY: 2 },
      { x: 1, y: 15, targetMap: 'route7_gate', targetX: 6, targetY: 3 },
      // East exit → Saffron Gate East
      { x: 29, y: 14, targetMap: 'saffron_gate_east', targetX: 1, targetY: 2 },
      { x: 29, y: 15, targetMap: 'saffron_gate_east', targetX: 1, targetY: 3 },
      // Gym door
      { x: 7, y: 8, targetMap: 'saffron_gym', targetX: 4, targetY: 13 },
      // Pokemon Center door
      { x: 6, y: 21, targetMap: 'pokemon_center_saffron', targetX: 4, targetY: 7 },
      // Pokemart door
      { x: 24, y: 21, targetMap: 'pokemart_saffron', targetX: 3, targetY: 7 },
      // Silph Co door
      { x: 15, y: 9, targetMap: 'silph_co_1f', targetX: 9, targetY: 13 },
      // Fighting Dojo
      { x: 25, y: 8, targetMap: 'fighting_dojo', targetX: 4, targetY: 9 },
    ],
    npcs: [
      {
        id: 'saffron_npc1',
        x: 12, y: 15,
        spriteColor: 0xc0a060,
        direction: Direction.DOWN,
        dialogue: [
          'SAFFRON CITY',
          'Shining, Golden Land\nof Commerce!',
        ],
      },
      {
        id: 'saffron_npc2',
        x: 18, y: 14,
        spriteColor: 0x6080c0,
        direction: Direction.LEFT,
        dialogue: [
          'TEAM ROCKET has taken\nover SILPH CO.!',
          "Someone needs to\nstop them!",
        ],
      },
      {
        id: 'saffron_npc3',
        x: 8, y: 12,
        spriteColor: 0xa0a0a0,
        direction: Direction.RIGHT,
        dialogue: [
          "SABRINA, the GYM\nLEADER, has psychic",
          'powers! Be very\ncareful in there!',
        ],
      },
      {
        id: 'saffron_npc4',
        x: 20, y: 10,
        spriteColor: 0xe08060,
        direction: Direction.DOWN,
        dialogue: [
          "The FIGHTING DOJO\nused to be a real",
          "GYM, but SABRINA\ndefeated them all!",
        ],
      },
    ],
  };
})();

// ─── 11. SAFFRON GYM ─────────────────────────────────────────────────────────

export const SAFFRON_GYM: MapData = (() => {
  const W = 10, H = 14;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Warp pads (CARPET tiles representing teleporters)
  fillRect(3, 5, 1, 1, T.CARPET);
  fillRect(6, 5, 1, 1, T.CARPET);
  fillRect(2, 8, 1, 1, T.CARPET);
  fillRect(7, 8, 1, 1, T.CARPET);
  fillRect(4, 10, 1, 1, T.CARPET);
  fillRect(5, 10, 1, 1, T.CARPET);
  fillRect(3, 3, 1, 1, T.CARPET);
  fillRect(6, 3, 1, 1, T.CARPET);

  // Entrance mat on exit warps
  setTile(4, 13, T.DOORMAT); setTile(5, 13, T.DOORMAT);

  return {
    id: 'saffron_gym',
    name: 'SAFFRON GYM',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 13, targetMap: 'saffron_city', targetX: 7, targetY: 9 },
      { x: 5, y: 13, targetMap: 'saffron_city', targetX: 7, targetY: 9 },
    ],
    npcs: [
      {
        id: 'sabrina',
        x: 4, y: 3,
        spriteColor: 0xc060c0,
        direction: Direction.DOWN,
        dialogue: [
          'SABRINA: I knew you\nwould come.',
          'I can see the future.\nYou will lose!',
        ],
        isTrainer: true,
        sightRange: 4,
      },
      {
        id: 'saffron_gym_trainer1',
        x: 2, y: 6,
        spriteColor: 0xa080c0,
        direction: Direction.RIGHT,
        dialogue: [
          'PSYCHIC: My mind is\na weapon!',
          'Can you withstand my\npsychic power?',
        ],
        isTrainer: true,
        sightRange: 3,
      },
      {
        id: 'saffron_gym_trainer2',
        x: 7, y: 10,
        spriteColor: 0xa080c0,
        direction: Direction.LEFT,
        dialogue: [
          "PSYCHIC: SABRINA's\npower is incredible!",
          "You don't stand a\nchance!",
        ],
        isTrainer: true,
        sightRange: 3,
      },
    ],
  };
})();

// ─── 12. POKEMON CENTER (SAFFRON) ────────────────────────────────────────────

export const POKEMON_CENTER_SAFFRON: MapData = (() => {
  const W = 10, H = 8;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

  // Walls: top 2 rows, sides
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Nurse counter — enclosed bar with side returns
  fillRect(3, 2, 4, 1, T.COUNTER);
  setTile(3, 3, T.COUNTER);
  setTile(6, 3, T.COUNTER);

  // PC
  setTile(8, 2, T.PC);

  // Carpet to door
  fillRect(4, 5, 2, 2, T.CARPET);

  // Entrance mat on exit warps
  setTile(4, 7, T.DOORMAT); setTile(5, 7, T.DOORMAT);

  return {
    id: 'pokemon_center_saffron',
    name: 'POKeMON CENTER',
    width: W,
    height: H,
    tiles,
    collision,
    warps: [
      { x: 4, y: 7, targetMap: 'saffron_city', targetX: 6, targetY: 22 },
      { x: 5, y: 7, targetMap: 'saffron_city', targetX: 6, targetY: 22 },
    ],
    npcs: [
      {
        id: 'nurse_saffron',
        x: 5, y: 2,
        spriteColor: 0xf080a0,
        direction: Direction.DOWN,
        dialogue: [
          'Welcome to our\nPOKeMON CENTER!',
          'We heal your POKeMON\nback to perfect health!',
          'Your POKeMON have been\nfully restored!',
        ],
      },
    ],
  };
})();

// ─── POKeMON MART (LAVENDER)  (8x8 indoor) ───────────────────────
const POKEMART_LAVENDER: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(5, 2, T.MART_SHELF); setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF); setTile(6, 4, T.MART_SHELF);
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'pokemart_lavender', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'lavender_town', targetX: 5, targetY: 17 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['great_ball', 'super_potion', 'revive', 'antidote', 'burn_heal', 'ice_heal', 'paralyze_heal', 'escape_rope'],
    }],
  };
})();

// ─── CELADON DEPARTMENT STORE — 6 floors ─────────────────────────

// 1F — Lobby
const CELADON_DEPT_1F: MapData = (() => {
  const W = 12, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);
  // Walls: top 2 rows, left/right columns
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Carpet runner from door to stairs
  fillRect(5, 4, 2, 5, T.CARPET);
  // Decorative plants
  setTile(2, 2, T.TREE); setTile(9, 2, T.TREE);
  // Stairs up (right side)
  setTile(10, 3, T.DOOR);
  // Entrance mat
  setTile(5, H - 1, T.DOORMAT);
  return {
    id: 'celadon_dept_1f', name: 'CELADON DEPT STORE 1F', width: W, height: H, tiles, collision,
    warps: [
      { x: 5, y: H - 1, targetMap: 'celadon_city', targetX: 23, targetY: 20 },
      { x: 10, y: 3, targetMap: 'celadon_dept_2f', targetX: 1, targetY: 3 },
    ],
    npcs: [{
      id: 'dept_receptionist', x: 6, y: 3, spriteColor: 0xf08080, direction: Direction.DOWN,
      dialogue: ['Welcome to CELADON\nDEPT STORE!', 'We have 6 floors of\nmerchandise for you!'],
    }],
  };
})();

// 2F — TM Counter
const CELADON_DEPT_2F: MapData = (() => {
  const W = 12, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter
  fillRect(3, 4, 5, 1, T.COUNTER);
  // Stairs down (left) and up (right)
  setTile(1, 3, T.DOOR); setTile(10, 3, T.DOOR);
  return {
    id: 'celadon_dept_2f', name: 'CELADON DEPT STORE 2F', width: W, height: H, tiles, collision,
    warps: [
      { x: 1, y: 3, targetMap: 'celadon_dept_1f', targetX: 10, targetY: 3 },
      { x: 10, y: 3, targetMap: 'celadon_dept_3f', targetX: 1, targetY: 3 },
    ],
    npcs: [
      {
        id: 'dept_tm_clerk', x: 5, y: 3, spriteColor: 0x4080f0, direction: Direction.DOWN,
        dialogue: ['Welcome to the TM\nCOUNTER!', 'We have a wide\nselection of TMs.'],
        shopStock: ['tm32_double_team', 'tm33_reflect', 'tm02_razor_wind', 'tm07_horn_drill', 'tm37_egg_bomb', 'tm01_mega_punch', 'tm05_mega_kick', 'tm09_take_down', 'tm17_submission', 'tm18_counter', 'tm35_metronome', 'tm49_tri_attack'],
      },
      {
        id: 'dept_2f_npc', x: 8, y: 7, spriteColor: 0x60c060, direction: Direction.LEFT,
        dialogue: ['TMs are single-use\nitems.', "Make sure you teach\nthem to the right\nPOKeMON!"],
      },
    ],
  };
})();

// 3F — General Items
const CELADON_DEPT_3F: MapData = (() => {
  const W = 12, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter
  fillRect(3, 4, 5, 1, T.COUNTER);
  // Shelves
  setTile(8, 6, T.MART_SHELF); setTile(9, 6, T.MART_SHELF); setTile(10, 6, T.MART_SHELF);
  setTile(8, 8, T.MART_SHELF); setTile(9, 8, T.MART_SHELF); setTile(10, 8, T.MART_SHELF);
  // Stairs down (left) and up (right)
  setTile(1, 3, T.DOOR); setTile(10, 3, T.DOOR);
  return {
    id: 'celadon_dept_3f', name: 'CELADON DEPT STORE 3F', width: W, height: H, tiles, collision,
    warps: [
      { x: 1, y: 3, targetMap: 'celadon_dept_2f', targetX: 10, targetY: 3 },
      { x: 10, y: 3, targetMap: 'celadon_dept_4f', targetX: 1, targetY: 3 },
    ],
    npcs: [{
      id: 'dept_general_clerk', x: 5, y: 3, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! We carry\nall kinds of items.'],
      shopStock: ['poke_ball', 'great_ball', 'ultra_ball', 'potion', 'super_potion', 'hyper_potion', 'max_potion', 'full_restore', 'revive', 'antidote', 'burn_heal', 'ice_heal', 'awakening', 'paralyze_heal', 'full_heal', 'repel', 'escape_rope'],
    }],
  };
})();

// 4F — Power TMs & Battle Items
const CELADON_DEPT_4F: MapData = (() => {
  const W = 12, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter
  fillRect(3, 4, 5, 1, T.COUNTER);
  // Stairs down (left) and up (right)
  setTile(1, 3, T.DOOR); setTile(10, 3, T.DOOR);
  return {
    id: 'celadon_dept_4f', name: 'CELADON DEPT STORE 4F', width: W, height: H, tiles, collision,
    warps: [
      { x: 1, y: 3, targetMap: 'celadon_dept_3f', targetX: 10, targetY: 3 },
      { x: 10, y: 3, targetMap: 'celadon_dept_5f', targetX: 1, targetY: 3 },
    ],
    npcs: [{
      id: 'dept_power_clerk', x: 5, y: 3, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Looking for powerful\nTMs?', "You've come to the\nright place!"],
      shopStock: ['tm13_ice_beam', 'tm14_blizzard', 'tm15_hyper_beam', 'tm23_dragon_rage', 'tm25_thunder', 'tm48_rock_slide', 'tm50_substitute'],
    }],
  };
})();

// 5F — Wiseman Floor
const CELADON_DEPT_5F: MapData = (() => {
  const W = 12, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Stairs down (left) and up (right)
  setTile(1, 3, T.DOOR); setTile(10, 3, T.DOOR);
  return {
    id: 'celadon_dept_5f', name: 'CELADON DEPT STORE 5F', width: W, height: H, tiles, collision,
    warps: [
      { x: 1, y: 3, targetMap: 'celadon_dept_4f', targetX: 10, targetY: 3 },
      { x: 10, y: 3, targetMap: 'celadon_dept_roof', targetX: 1, targetY: 3 },
    ],
    npcs: [
      {
        id: 'dept_5f_type_npc', x: 3, y: 5, spriteColor: 0xa080c0, direction: Direction.RIGHT,
        dialogue: ['Moves have types, just\nlike POKeMON.', "Using a move that\nmatches your POKeMON's\ntype does more damage!"],
      },
      {
        id: 'dept_5f_stat_npc', x: 8, y: 7, spriteColor: 0xc09060, direction: Direction.LEFT,
        dialogue: ['Physical moves use\nATTACK and DEFENSE.', 'Special moves use\nSPECIAL for both\noffense and defense!'],
      },
      {
        id: 'dept_5f_tip_npc', x: 5, y: 3, spriteColor: 0x60a0c0, direction: Direction.DOWN,
        dialogue: ['COUNTER reflects\nphysical damage back\nat double power!', "It's tricky to use,\nbut very rewarding."],
      },
    ],
  };
})();

// Rooftop — Vending Machines
const CELADON_DEPT_ROOF: MapData = (() => {
  const W = 12, H = 10;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.PATH);
  // Fence border (except stairs entry)
  for (let x = 0; x < W; x++) { setTile(x, 0, T.FENCE); setTile(x, H - 1, T.FENCE); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.FENCE); setTile(W - 1, y, T.FENCE); }
  // Stairs down (left side)
  setTile(1, 3, T.DOOR);
  // Grass patches for rooftop garden
  fillRect(4, 2, 3, 2, T.GRASS);
  fillRect(7, 6, 3, 2, T.GRASS);
  return {
    id: 'celadon_dept_roof', name: 'CELADON DEPT STORE ROOF', width: W, height: H, tiles, collision,
    warps: [
      { x: 1, y: 3, targetMap: 'celadon_dept_5f', targetX: 10, targetY: 3 },
    ],
    npcs: [
      {
        id: 'dept_vending1', x: 8, y: 1, spriteColor: 0x40c0f0, direction: Direction.DOWN,
        dialogue: ['Thirsty? Try a cold\nbeverage!'],
        shopStock: ['fresh_water', 'soda_pop', 'lemonade'],
      },
      {
        id: 'dept_roof_npc', x: 3, y: 6, spriteColor: 0xf0a060, direction: Direction.UP,
        dialogue: ["What a great view\nfrom up here!", "You can see all of\nCELADON CITY!"],
      },
    ],
  };
})();

// ─── POKeMON MART (SAFFRON)  (8x8 indoor) ───────────────────────
const POKEMART_SAFFRON: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);
  fillRect(0, 0, W, 2, T.WALL);
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER); setTile(3, 3, T.COUNTER);
  setTile(5, 2, T.MART_SHELF); setTile(6, 2, T.MART_SHELF);
  setTile(5, 4, T.MART_SHELF); setTile(6, 4, T.MART_SHELF);
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'pokemart_saffron', name: 'POKeMON MART', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'saffron_city', targetX: 24, targetY: 22 }],
    npcs: [{
      id: 'mart_clerk', x: 2, y: 2, spriteColor: 0x4080f0, direction: Direction.DOWN,
      dialogue: ['Welcome! How may I\nserve you?'],
      shopStock: ['great_ball', 'ultra_ball', 'super_potion', 'hyper_potion', 'revive', 'full_heal'],
    }],
  };
})();

// ─── GAME CORNER (Ground Floor) ─────────────────────────────────────────────

const GAME_CORNER: MapData = (() => {
  const W = 14, H = 12;
  const { tiles, collision, setTile, fillRect } = createMapShape(W, H, T.INDOOR_FLOOR);

  // Walls
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }

  // Rows of slot machine counters (3 rows of 3 pairs)
  fillRect(3, 3, 2, 1, T.COUNTER);
  fillRect(6, 3, 2, 1, T.COUNTER);
  fillRect(9, 3, 2, 1, T.COUNTER);
  fillRect(3, 5, 2, 1, T.COUNTER);
  fillRect(6, 5, 2, 1, T.COUNTER);
  fillRect(9, 5, 2, 1, T.COUNTER);
  fillRect(3, 7, 2, 1, T.COUNTER);
  fillRect(6, 7, 2, 1, T.COUNTER);
  fillRect(9, 7, 2, 1, T.COUNTER);

  // Counter along back wall (prize exchange)
  fillRect(2, 2, 3, 1, T.COUNTER);

  // Poster on back wall (SIGN tile)
  setTile(11, 2, T.SIGN);

  // Carpet aisle
  fillRect(5, 9, 4, 2, T.CARPET);

  // Entrance mat on exit warp
  setTile(7, 11, T.DOORMAT);

  return {
    id: 'game_corner',
    name: 'GAME CORNER',
    width: W, height: H,
    tiles, collision,
    warps: [
      // Exit to Celadon City
      { x: 7, y: 11, targetMap: 'celadon_city', targetX: 13, targetY: 19 },
      // Hidden stairs to B1F (behind poster, x=11 y=2 is the sign/poster)
      { x: 12, y: 2, targetMap: 'rocket_hideout_b1f', targetX: 1, targetY: 0 },
    ],
    npcs: [
      // Slot machine seats (one per machine — all 9 stations are playable).
      {
        id: 'slot_machine_1',
        x: 3, y: 4,
        spriteColor: 0x60a0c0,
        direction: Direction.UP,
        dialogue: ['Take a seat at the\nslots!'],
      },
      {
        id: 'slot_machine_2',
        x: 6, y: 4,
        spriteColor: 0xc06060,
        direction: Direction.UP,
        dialogue: ['Try your luck!'],
      },
      {
        id: 'slot_machine_3',
        x: 9, y: 4,
        spriteColor: 0x60c060,
        direction: Direction.UP,
        dialogue: ['Feeling lucky?'],
      },
      {
        id: 'slot_machine_4',
        x: 3, y: 6,
        spriteColor: 0xf0a040,
        direction: Direction.UP,
        dialogue: ['Spin to win!'],
      },
      {
        id: 'slot_machine_5',
        x: 6, y: 6,
        spriteColor: 0xa080c0,
        direction: Direction.UP,
        dialogue: ['Maybe today\'s the\nday I hit it big!'],
      },
      {
        id: 'slot_machine_6',
        x: 9, y: 6,
        spriteColor: 0x40c0a0,
        direction: Direction.UP,
        dialogue: ['Watch the symbols\ncarefully!'],
      },
      {
        id: 'slot_machine_7',
        x: 3, y: 8,
        spriteColor: 0xd06090,
        direction: Direction.UP,
        dialogue: ['Roll the reels!'],
      },
      {
        id: 'slot_machine_8',
        x: 6, y: 8,
        spriteColor: 0x6080f0,
        direction: Direction.UP,
        dialogue: ['Three sevens means\nJACKPOT!'],
      },
      {
        id: 'slot_machine_9',
        x: 9, y: 8,
        spriteColor: 0xc0a040,
        direction: Direction.UP,
        dialogue: ['You play, you spin,\nyou win!'],
      },
      // Rocket grunt guarding the poster
      {
        id: 'game_corner_poster_rocket',
        x: 10, y: 9,
        spriteColor: 0x383838,
        direction: Direction.LEFT,
        dialogue: ['ROCKET: Hey! Don\'t be\nsnooping around here!'],
        isTrainer: true,
        sightRange: 3,
      },
      // Prize exchange clerk — opens the prize exchange UI on interact.
      {
        id: 'game_corner_clerk',
        x: 3, y: 2,
        spriteColor: 0xf0a060,
        direction: Direction.DOWN,
        dialogue: ['Welcome to the GAME\nCORNER prize exchange!'],
      },
      // Coin vendor — sells 50 coins for $1000.
      {
        id: 'game_corner_coin_vendor',
        x: 4, y: 2,
        spriteColor: 0xa06090,
        direction: Direction.DOWN,
        dialogue: ['Need coins?\n50 for $1000!'],
      },
      // NPC gambler — hints at the skill-stop mechanic.
      {
        id: 'game_corner_gambler',
        x: 11, y: 6,
        spriteColor: 0xa080c0,
        direction: Direction.LEFT,
        dialogue: [
          'Press the button JUST\nas a symbol crosses',
          'the win line and you\ncan stop it on cue!',
        ],
      },
    ],
  };
})();

// ─── ROCKET HIDEOUT ─────────────────────────────────────────────────────────

// ROCKET HIDEOUT maps moved to maps_hideout.ts

// ─── SILPH CO. ──────────────────────────────────────────────────────────────

// SILPH CO. maps moved to maps_silph.ts

// ─── DIGLETT'S CAVE ─────────────────────────────────────────────────────────

// Two floors drawn as sketches by tools/diglett-floors.mjs in the helper repo
// (which also checks them); tests/data/diglettsCave.test.ts proves the same
// facts on this data.
//
// `digletts_cave` keeps its id and both route landings ((6,2) from Route 2,
// (6,18) from Route 11) but is two sealed entrance caves: the north one winds
// from the Route 2 mouth to ladder a, the south one from ladder b to the
// Route 11 mouth. B1F is one serpentine corridor from a to b (~88 steps) with
// Diglett and Dugtrio on every tile; the entrance caves roll no encounters.
// No trainers, no items (Gen I). Every ladder and mouth sits in a one-tile
// stub (a warp fires on entry, not on the tile you land on); the short
// pockets off the corridors are cave texture, not puzzle (it is lit).
// Legend: # wall, . floor, E north mouth (Route 2), X south mouth (Route 11),
// a/b ladders (the same letter on both floors).
const DC_LEGEND: Record<string, TileType> = {
  '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, E: T.CAVE_FLOOR, X: T.CAVE_FLOOR,
  a: T.CAVE_ENTRANCE, b: T.CAVE_ENTRANCE,
};

const DC_1F = createMapFromSketch([
  '######E#####',
  '######.#####',
  '##.....#####',
  '##.#.#######',
  '##.#########',
  '##.........#',
  '#########.##',
  '###a......##',
  '############',
  '############',
  '############',
  '############',
  '#.......b###',
  '##.#########',
  '##........##',
  '####.####.##',
  '#########.##',
  '######....##',
  '######.#####',
  '######X#####',
], DC_LEGEND);
const DC_B1F = createMapFromSketch([
  '##########################',
  '##########################',
  '#a.......................#',
  '##########.###########.###',
  '##########.###########.###',
  '######################.###',
  '###....................###',
  '######.########.##########',
  '######.########.##########',
  '######.###################',
  '######...................#',
  '##################.###.###',
  '########.#########.###.###',
  '########.#############.###',
  '##.....................###',
  '##.#########.#############',
  '##.#########.#############',
  '##.#######################',
  '##b#######################',
  '##########################',
], DC_LEGEND);

/** The one open tile beside a stub (where a ladder lands the player). */
const dcBeside = (s: SketchShape, ch: string) => {
  const p = s.findOne(ch);
  const open = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    .map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(q => s.tiles[q.y]?.[q.x] === T.CAVE_FLOOR);
  if (open.length !== 1) throw new Error(`digletts cave: '${ch}' is not in a stub`);
  return open[0];
};
/** Ladder `ch` on `s` to the same letter on `other` (landing on the tile beside it). */
const dcLadder = (s: SketchShape, ch: string, other: SketchShape, otherId: string) => {
  const land = dcBeside(other, ch);
  return { ...s.findOne(ch), targetMap: otherId, targetX: land.x, targetY: land.y };
};
const DC_ENCOUNTERS = {
  grassRate: 0.15,
  encounters: [
    { speciesId: 50, minLevel: 15, maxLevel: 22, weight: 90 }, // Diglett
    { speciesId: 51, minLevel: 29, maxLevel: 31, weight: 10 }, // Dugtrio
  ],
};

const DIGLETTS_CAVE: MapData = {
  id: 'digletts_cave',
  name: "DIGLETT's CAVE",
  width: DC_1F.width, height: DC_1F.height,
  tiles: DC_1F.tiles, collision: DC_1F.collision,
  warps: [
    // The mouths: north (first: the floor's entry point) to Route 2, south to Route 11.
    { ...DC_1F.findOne('E'), targetMap: 'route2', targetX: 15, targetY: 24 },
    { ...DC_1F.findOne('X'), targetMap: 'route11', targetX: 22, targetY: 4 },
    // The ladders, in walkthrough order: a (north cave, first: the floor's goal), b (south cave).
    dcLadder(DC_1F, 'a', DC_B1F, 'digletts_cave_b1f'),
    dcLadder(DC_1F, 'b', DC_B1F, 'digletts_cave_b1f'),
  ],
  npcs: [],
};

const DIGLETTS_CAVE_B1F: MapData = {
  id: 'digletts_cave_b1f',
  name: "DIGLETT's CAVE B1F",
  width: DC_B1F.width, height: DC_B1F.height,
  tiles: DC_B1F.tiles, collision: DC_B1F.collision,
  warps: [
    dcLadder(DC_B1F, 'a', DC_1F, 'digletts_cave'),   // first: where the player arrives from Route 2
    dcLadder(DC_B1F, 'b', DC_1F, 'digletts_cave'),   // the floor's goal
  ],
  npcs: [],
  wildEncounters: DC_ENCOUNTERS,
};

// ─── Lavender House (generic NPC house) ──────────────────────────────────────
export const LAVENDER_HOUSE: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(3, 4, T.CARPET); setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET); setTile(4, 5, T.CARPET);
  setTile(2, 2, T.MART_SHELF); setTile(5, 2, T.MART_SHELF);
  setTile(3, H - 1, T.DOOR);
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'lavender_house', name: 'LAVENDER HOUSE', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'lavender_town', targetX: 14, targetY: 17 }],
    npcs: [{
      id: 'lavender_house_npc', x: 4, y: 3, spriteColor: 0x9070a0, direction: Direction.DOWN,
      dialogue: ['POKeMON TOWER is the\nfinal resting place', 'for POKeMON that have\npassed on...'],
    }],
  };
})();

// ─── Celadon Mansion ─────────────────────────────────────────────────────────
export const CELADON_MANSION: MapData = (() => {
  const W = 8, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  setTile(3, 4, T.CARPET); setTile(4, 4, T.CARPET);
  setTile(3, 5, T.CARPET); setTile(4, 5, T.CARPET);
  setTile(2, 2, T.MART_SHELF); setTile(5, 2, T.MART_SHELF);
  setTile(3, 2, T.MART_SHELF);
  setTile(3, H - 1, T.DOOR);
  // Entrance mat on exit warp
  setTile(3, H - 1, T.DOORMAT);
  return {
    id: 'celadon_mansion', name: 'CELADON MANSION', width: W, height: H, tiles, collision,
    warps: [{ x: 3, y: H - 1, targetMap: 'celadon_city', targetX: 5, targetY: 19 }],
    npcs: [
      {
        id: 'celadon_mansion_npc', x: 4, y: 3, spriteColor: 0x60a0c0, direction: Direction.DOWN,
        dialogue: ['I know all about the\nGAME CORNER!', 'There are rumors of a\nsecret hideout below!'],
      },
      {
        id: 'celadon_mansion_coin_case_giver', x: 2, y: 3, spriteColor: 0xf0a060, direction: Direction.DOWN,
        // Dialogue is overridden by the Coin Case give logic in OverworldScene.
        dialogue: ['...'],
      },
    ],
  };
})();

// ─── Fighting Dojo ───────────────────────────────────────────────────────────
export const FIGHTING_DOJO: MapData = (() => {
  const W = 10, H = 10;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Carpet arena
  for (let dy = 3; dy < 8; dy++) for (let dx = 2; dx < 8; dx++) setTile(dx, dy, T.CARPET);
  // Entrance mat on exit warps
  setTile(4, H - 1, T.DOORMAT); setTile(5, H - 1, T.DOORMAT);
  return {
    id: 'fighting_dojo', name: 'FIGHTING DOJO', width: W, height: H, tiles, collision,
    warps: [
      { x: 4, y: H - 1, targetMap: 'saffron_city', targetX: 25, targetY: 9 },
      { x: 5, y: H - 1, targetMap: 'saffron_city', targetX: 25, targetY: 9 },
    ],
    npcs: [
      {
        id: 'dojo_master', x: 5, y: 2, spriteColor: 0xc08040, direction: Direction.DOWN,
        dialogue: [
          'KARATE MASTER: I am\nthe MASTER of this',
          "FIGHTING DOJO! We\nwere once a GYM...",
          'But we lost to\nSABRINA! How humbling!',
        ],
      },
      {
        id: 'dojo_trainer1', x: 3, y: 5, spriteColor: 0xc08040, direction: Direction.RIGHT,
        dialogue: ['BLACK BELT: Hwa!\nWant to see real\nfighting power?'],
        isTrainer: true, sightRange: 2,
      },
      {
        id: 'dojo_trainer2', x: 7, y: 5, spriteColor: 0xc08040, direction: Direction.LEFT,
        dialogue: ['BLACK BELT: My\nfighting POKeMON will\ncrush you!'],
        isTrainer: true, sightRange: 2,
      },
    ],
  };
})();

// ─── Route 7 Gate (horizontal pass-through) ─────────────────────────────────
export const ROUTE7_GATE: MapData = (() => {
  const W = 8, H = 6;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Open side doorways at y=2-3
  setTile(0, 2, T.INDOOR_FLOOR); setTile(0, 3, T.INDOOR_FLOOR);
  setTile(W - 1, 2, T.INDOOR_FLOOR); setTile(W - 1, 3, T.INDOOR_FLOOR);
  // Counter
  setTile(3, 1, T.COUNTER); setTile(4, 1, T.COUNTER);
  return {
    id: 'route7_gate', name: 'ROUTE 7 GATE', width: W, height: H, tiles, collision,
    warps: [
      // Left exit → Route 7
      { x: 0, y: 2, targetMap: 'route7', targetX: 18, targetY: 4 },
      { x: 0, y: 3, targetMap: 'route7', targetX: 18, targetY: 5 },
      // Right exit → Saffron City (blocked without Tea)
      { x: 7, y: 2, targetMap: 'saffron_city', targetX: 2, targetY: 14 },
      { x: 7, y: 3, targetMap: 'saffron_city', targetX: 2, targetY: 15 },
    ],
    npcs: [{
      id: 'route7_guard', x: 4, y: 2, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', 'Thirsty work, this\nguarding business...'],
    }],
  };
})();

// ─── Route 11/12 Gate (horizontal pass-through, connects Route 11 to Route 12) ─
export const ROUTE11_GATE: MapData = (() => {
  const W = 8, H = 6;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Open side doorways at y=2-3
  setTile(0, 2, T.INDOOR_FLOOR); setTile(0, 3, T.INDOOR_FLOOR);
  setTile(W - 1, 2, T.INDOOR_FLOOR); setTile(W - 1, 3, T.INDOOR_FLOOR);
  // Counter
  setTile(3, 1, T.COUNTER); setTile(4, 1, T.COUNTER);
  return {
    id: 'route11_gate', name: 'ROUTE 11 GATE', width: W, height: H, tiles, collision,
    warps: [
      // West exit → Route 11
      { x: 0, y: 2, targetMap: 'route11', targetX: 23, targetY: 4 },
      { x: 0, y: 3, targetMap: 'route11', targetX: 23, targetY: 5 },
      // East exit → Route 12 (corridor at Snorlax barrier row)
      { x: 7, y: 2, targetMap: 'route12', targetX: 1, targetY: 4 },
      { x: 7, y: 3, targetMap: 'route12', targetX: 1, targetY: 4 },
    ],
    npcs: [{
      id: 'route11_gate_guide', x: 4, y: 2, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['ROUTE 12 is to the\neast.', 'A sleeping POKeMON\nblocks the way north.'],
    }],
  };
})();

// ─── Saffron Gate North (vertical pass-through, Route 5 side) ────────────────
export const SAFFRON_GATE_NORTH: MapData = (() => {
  const W = 6, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter and guard
  setTile(1, 3, T.COUNTER); setTile(2, 3, T.COUNTER);
  return {
    id: 'saffron_gate_north', name: 'SAFFRON GATE', width: W, height: H, tiles, collision,
    warps: [
      // North exit → Route 5 (bump warp on wall)
      { x: 2, y: 0, targetMap: 'route5', targetX: 9, targetY: 18 },
      { x: 3, y: 0, targetMap: 'route5', targetX: 10, targetY: 18 },
      // South exit → Saffron City (edge warp, blocked without Tea)
      { x: 2, y: 7, targetMap: 'saffron_city', targetX: 14, targetY: 2 },
      { x: 3, y: 7, targetMap: 'saffron_city', targetX: 15, targetY: 2 },
    ],
    npcs: [{
      id: 'gate_north_guard', x: 3, y: 3, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', "I'm parched just\nstanding here..."],
    }],
  };
})();

// ─── Saffron Gate South (vertical pass-through, Route 6 side) ────────────────
export const SAFFRON_GATE_SOUTH: MapData = (() => {
  const W = 6, H = 8;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter and guard
  setTile(3, 4, T.COUNTER); setTile(4, 4, T.COUNTER);
  return {
    id: 'saffron_gate_south', name: 'SAFFRON GATE', width: W, height: H, tiles, collision,
    warps: [
      // North exit → Saffron City (bump warp on wall, blocked without Tea)
      { x: 2, y: 0, targetMap: 'saffron_city', targetX: 14, targetY: 26 },
      { x: 3, y: 0, targetMap: 'saffron_city', targetX: 15, targetY: 26 },
      // South exit → Route 6 (edge warp)
      { x: 2, y: 7, targetMap: 'route6', targetX: 9, targetY: 1 },
      { x: 3, y: 7, targetMap: 'route6', targetX: 10, targetY: 1 },
    ],
    npcs: [{
      id: 'gate_south_guard', x: 2, y: 4, spriteColor: 0x4060b0, direction: Direction.RIGHT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', 'A nice cup of TEA\nwould hit the spot...'],
    }],
  };
})();

// ─── Saffron Gate East (horizontal pass-through, Route 8 side) ──────────────
export const SAFFRON_GATE_EAST: MapData = (() => {
  const W = 8, H = 6;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.WALL); setTile(x, H - 1, T.WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.WALL); setTile(W - 1, y, T.WALL); }
  // Counter
  setTile(2, 1, T.COUNTER); setTile(3, 1, T.COUNTER);
  return {
    id: 'saffron_gate_east', name: 'SAFFRON GATE', width: W, height: H, tiles, collision,
    warps: [
      // West exit → Saffron City (bump warp, blocked without Tea)
      { x: 0, y: 2, targetMap: 'saffron_city', targetX: 28, targetY: 14 },
      { x: 0, y: 3, targetMap: 'saffron_city', targetX: 28, targetY: 15 },
      // East exit → Route 8 (bump warp)
      { x: 7, y: 2, targetMap: 'route8', targetX: 1, targetY: 4 },
      { x: 7, y: 3, targetMap: 'route8', targetX: 1, targetY: 5 },
    ],
    npcs: [{
      id: 'gate_east_guard', x: 4, y: 2, spriteColor: 0x4060b0, direction: Direction.LEFT,
      dialogue: ['You need TEA to pass\nthrough to SAFFRON.', "Can't let anyone in\nwithout it..."],
    }],
  };
})();

// ─── Underground Path North-South (Route 5 ↔ Route 6) ──────────────────────
export const UNDERGROUND_NS: MapData = (() => {
  const W = 5, H = 30;
  const { tiles, collision, setTile } = createMapShape(W, H, T.CAVE_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.CAVE_WALL); setTile(x, H - 1, T.CAVE_WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.CAVE_WALL); setTile(W - 1, y, T.CAVE_WALL); }
  return {
    id: 'underground_ns', name: 'UNDERGROUND PATH', width: W, height: H, tiles, collision,
    warps: [
      // North exit → Route 5 (bump warp on cave wall)
      { x: 2, y: 0, targetMap: 'route5', targetX: 14, targetY: 19 },
      // South exit → Route 6 (bump warp on cave wall)
      { x: 2, y: 29, targetMap: 'route6', targetX: 14, targetY: 4 },
    ],
    npcs: [{
      id: 'underground_ns_npc', x: 2, y: 15, spriteColor: 0x808080, direction: Direction.DOWN,
      dialogue: ['This underground path\nconnects ROUTE 5', 'and ROUTE 6.', "It's a shortcut that\nbypasses SAFFRON!"],
    }],
  };
})();

// ─── Underground Path East-West (Route 7 ↔ Route 8) ────────────────────────
export const UNDERGROUND_EW: MapData = (() => {
  const W = 30, H = 5;
  const { tiles, collision, setTile } = createMapShape(W, H, T.CAVE_FLOOR);
  for (let x = 0; x < W; x++) { setTile(x, 0, T.CAVE_WALL); setTile(x, H - 1, T.CAVE_WALL); }
  for (let y = 0; y < H; y++) { setTile(0, y, T.CAVE_WALL); setTile(W - 1, y, T.CAVE_WALL); }
  return {
    id: 'underground_ew', name: 'UNDERGROUND PATH', width: W, height: H, tiles, collision,
    warps: [
      // West exit → Route 7 (bump warp on cave wall)
      { x: 0, y: 2, targetMap: 'route7', targetX: 10, targetY: 4 },
      // East exit → Route 8 (bump warp on cave wall)
      { x: 29, y: 2, targetMap: 'route8', targetX: 15, targetY: 4 },
    ],
    npcs: [{
      id: 'underground_ew_npc', x: 15, y: 2, spriteColor: 0x808080, direction: Direction.DOWN,
      dialogue: ['This underground path\nconnects ROUTE 7', 'and ROUTE 8.', "It's a shortcut that\nbypasses SAFFRON!"],
    }],
  };
})();

// ─── Combined export ─────────────────────────────────────────────────────────

export const CENTRAL_MAPS: Record<string, MapData> = {
  lavender_town: LAVENDER_TOWN,
  pokemon_center_lavender: POKEMON_CENTER_LAVENDER,
  pokemart_lavender: POKEMART_LAVENDER,
  route7: ROUTE7,
  route8: ROUTE8,
  route11: ROUTE11,
  celadon_city: CELADON_CITY,
  celadon_gym: CELADON_GYM,
  pokemon_center_celadon: POKEMON_CENTER_CELADON,
  celadon_dept_1f: CELADON_DEPT_1F,
  celadon_dept_2f: CELADON_DEPT_2F,
  celadon_dept_3f: CELADON_DEPT_3F,
  celadon_dept_4f: CELADON_DEPT_4F,
  celadon_dept_5f: CELADON_DEPT_5F,
  celadon_dept_roof: CELADON_DEPT_ROOF,
  saffron_city: SAFFRON_CITY,
  saffron_gym: SAFFRON_GYM,
  pokemon_center_saffron: POKEMON_CENTER_SAFFRON,
  pokemart_saffron: POKEMART_SAFFRON,
  game_corner: GAME_CORNER,
  digletts_cave: DIGLETTS_CAVE,
  digletts_cave_b1f: DIGLETTS_CAVE_B1F,
  lavender_house: LAVENDER_HOUSE,
  celadon_mansion: CELADON_MANSION,
  fighting_dojo: FIGHTING_DOJO,
  route7_gate: ROUTE7_GATE,
  route11_gate: ROUTE11_GATE,
  saffron_gate_north: SAFFRON_GATE_NORTH,
  saffron_gate_south: SAFFRON_GATE_SOUTH,
  saffron_gate_east: SAFFRON_GATE_EAST,
  underground_ns: UNDERGROUND_NS,
  underground_ew: UNDERGROUND_EW,
};
