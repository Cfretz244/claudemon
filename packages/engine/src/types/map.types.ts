import { Direction } from '../utils/constants';

export enum TileType {
  GRASS = 0,
  PATH = 1,
  WALL = 2,
  WATER = 3,
  TREE = 4,
  TALL_GRASS = 5,
  BUILDING = 6,
  DOOR = 7,
  SIGN = 8,
  LEDGE = 9,
  FENCE = 10,
  FLOWER = 11,
  INDOOR_FLOOR = 12,
  COUNTER = 13,
  PC = 14,
  MART_SHELF = 15,
  CARPET = 16,
  SAND = 17,
  CAVE_FLOOR = 18,
  CAVE_WALL = 19,
  CUT_TREE = 20,
  BOULDER = 21,
  SPIN_TILE = 22,
  STOP_TILE = 23,
  TELEPORT_PAD = 24,
  ROOF = 25,
  FOUNTAIN = 26,
  COBBLESTONE = 27,
  DOORMAT = 28,
  CAVE_ENTRANCE = 29,
  EXHIBIT_CASE = 30,
  FOSSIL_DISPLAY = 31,
  SHUTTLE_DISPLAY = 32,
  MUSEUM_PLAQUE = 33,
  TOMBSTONE = 34,
  /** Pressure plate: a boulder resting on it opens the gates wired to it. */
  SWITCH_PLATE = 35,
  /** Solid until its switch plate is pressed; see `MapData.gates`. */
  GATE = 36,
  /** Walkable floor with a hole: a boulder pushed onto it drops to the floor below; see `MapData.holes`. */
  BOULDER_HOLE = 37,
  /** Water that carries a surfing player in the direction given by `MapData.currents`. */
  CURRENT = 38,
  /** Walkable floor that fully heals the party when stepped on (Pokemon Tower 5F). */
  HEAL_TILE = 39,
}

export interface WarpPoint {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
}

/**
 * A gate tile and what opens it: either a switch plate (a boulder resting on
 * it opens the gate; several gates may share a plate) or a story flag (a
 * statue switch NPC with `toggleFlag` flips it; `closedWhenSet` inverts the
 * sense so one switch opens one set of gates and closes another). Exactly one
 * of `switch` / `flag` must be given.
 */
export interface GateData {
  x: number;
  y: number;
  switch?: { x: number; y: number };
  flag?: string;
  closedWhenSet?: boolean;
}

/**
 * A BOULDER_HOLE tile and where a boulder pushed into it lands. A landed
 * boulder turns a CURRENT tile into still WATER, or sits as a BOULDER on a
 * floor tile (pressing a switch plate if one is there). See `src/logic/boulders.ts`.
 */
export interface HoleData {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
}

/**
 * A condition the player must satisfy. Every listed field must hold; `anyOf`
 * holds when at least one of its alternatives does.
 */
export interface WarpRequirement {
  /** Player must carry this item. */
  item?: string;
  /** Story flag must be set. */
  flag?: string;
  /** Story flag must NOT be set. */
  notFlag?: string;
  /** Player must hold at least this many badges. */
  badgeCount?: number;
  /** This trainer must NOT have been defeated yet. */
  trainerNotDefeated?: string;
  /** At least one of these must hold. */
  anyOf?: WarpRequirement[];
}

/**
 * Blocks entry to a map until `requires` is met. Evaluated in order by
 * `checkEntryGates`; the first failing gate wins. An empty `message` blocks
 * silently.
 */
export interface EntryGate {
  /** Only applies when arriving from one of these map ids (default: any). */
  from?: string[];
  requires: WarpRequirement;
  message: string[];
}

/** One stop of an elevator: the menu label and where the player lands. */
export interface ElevatorFloor {
  label: string;
  targetMap: string;
  targetX: number;
  targetY: number;
  /**
   * The stop is listed only while this holds (Silph Co: `visited_<map id>`,
   * set whenever the player arrives on a floor that has an elevator).
   */
  requires?: WarpRequirement;
}

/**
 * An elevator shared by several floors. Every floor that has an `elevator_`
 * NPC declares the same `ElevatorData`; the menu lists the `floors` whose
 * `requires` holds and greys out the current one. While `requires` is unmet
 * the elevator shows `lockedMessage` instead (Rocket Hideout: the Lift Key).
 */
export interface ElevatorData {
  floors: ElevatorFloor[];
  requires?: WarpRequirement;
  lockedMessage?: string[];
}

export interface NPCData {
  id: string;
  x: number;
  y: number;
  spriteColor: number;
  direction: Direction;
  dialogue: string[];
  isTrainer?: boolean;
  trainerTeam?: string;
  movementPattern?: 'stationary' | 'wander' | 'patrol';
  sightRange?: number;
  shopStock?: string[];
  /**
   * A statue switch: interacting flips this story flag and re-applies every
   * gate on the map wired to it (see `GateData.flag`), then shows `dialogue`.
   */
  toggleFlag?: string;
  isItemBall?: boolean;
  itemId?: string;
  /**
   * A fake item ball: picking it up starts a wild battle with this Pokemon
   * instead of giving an item (Power Plant Voltorb/Electrode). The ball is
   * gone afterwards like a picked-up item. `dialogue` shows first if non-empty.
   */
  ambush?: { speciesId: number; level: number };
}

export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][];
  collision: boolean[][];
  warps: WarpPoint[];
  npcs: NPCData[];
  wildEncounters?: WildEncounterTable;
  musicId?: string;
  isDark?: boolean;
  spinTiles?: Record<string, Direction>;
  /** Conditions for entering this map by warp; see `src/logic/warpGate.ts`. */
  entryGates?: EntryGate[];
  /** Gate tiles and the switch plates that open them; see `src/logic/boulders.ts`. */
  gates?: GateData[];
  /** Tile revealed under a moved boulder or an opened gate (default CAVE_FLOOR). */
  floorTile?: TileType;
  /** Where boulders pushed into each BOULDER_HOLE land; see `src/logic/boulders.ts`. */
  holes?: HoleData[];
  /** Flow direction of each CURRENT tile ("x,y"); see `src/logic/spinTiles.ts`. */
  currents?: Record<string, Direction>;
  /** Rolled instead of `wildEncounters` while the player is surfing. */
  surfEncounters?: WildEncounterTable;
  /** The elevator reachable from this floor's `elevator_` NPC; see `src/logic/elevator.ts`. */
  elevator?: ElevatorData;
  /**
   * Tile types that roll `wildEncounters` on foot (default TALL_GRASS and
   * CAVE_FLOOR). Lets indoor dungeons such as the Mansion roll on INDOOR_FLOOR.
   * Surfing always rolls `surfEncounters` on WATER and CURRENT.
   */
  encounterTiles?: TileType[];
}

export interface WildEncounterTable {
  grassRate: number; // chance per step 0-1
  encounters: WildEncounter[];
}

export interface WildEncounter {
  speciesId: number;
  minLevel: number;
  maxLevel: number;
  weight: number; // relative probability
}
