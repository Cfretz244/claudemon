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
}

export interface WarpPoint {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
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
  isItemBall?: boolean;
  itemId?: string;
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
