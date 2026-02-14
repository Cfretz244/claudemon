export enum PokemonType {
  NORMAL = 'NORMAL',
  FIRE = 'FIRE',
  WATER = 'WATER',
  ELECTRIC = 'ELECTRIC',
  GRASS = 'GRASS',
  ICE = 'ICE',
  FIGHTING = 'FIGHTING',
  POISON = 'POISON',
  GROUND = 'GROUND',
  FLYING = 'FLYING',
  PSYCHIC = 'PSYCHIC',
  BUG = 'BUG',
  ROCK = 'ROCK',
  GHOST = 'GHOST',
  DRAGON = 'DRAGON',
}

export enum MoveCategory {
  PHYSICAL = 'PHYSICAL',
  SPECIAL = 'SPECIAL',
  STATUS = 'STATUS',
}

export enum StatusCondition {
  NONE = 'NONE',
  SLEEP = 'SLEEP',
  POISON = 'POISON',
  BURN = 'BURN',
  PARALYSIS = 'PARALYSIS',
  FREEZE = 'FREEZE',
}

export enum VolatileStatus {
  CONFUSION = 'CONFUSION',
  FLINCH = 'FLINCH',
  SEEDED = 'SEEDED',
}

// Gen 1: Physical types use Attack/Defense, Special types use Special for both
export const PHYSICAL_TYPES: PokemonType[] = [
  PokemonType.NORMAL,
  PokemonType.FIGHTING,
  PokemonType.FLYING,
  PokemonType.POISON,
  PokemonType.GROUND,
  PokemonType.ROCK,
  PokemonType.BUG,
  PokemonType.GHOST,
];

export const SPECIAL_TYPES: PokemonType[] = [
  PokemonType.FIRE,
  PokemonType.WATER,
  PokemonType.ELECTRIC,
  PokemonType.GRASS,
  PokemonType.ICE,
  PokemonType.PSYCHIC,
  PokemonType.DRAGON,
];

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  special: number; // Gen 1 has single Special stat
  speed: number;
}

export interface LearnsetEntry {
  level: number;
  moveId: number;
}

export interface EvolutionEntry {
  to: number; // target species dex number
  level?: number; // level-based evolution
  item?: string; // item-based evolution (trade/stone)
}

export interface PokemonSpecies {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: BaseStats;
  baseExp: number;
  catchRate: number;
  learnset: LearnsetEntry[];
  evolutions: EvolutionEntry[];
  spriteColor: number; // primary color for programmatic sprite
  spriteColor2?: number; // secondary color
}

export interface MoveData {
  id: number;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number; // 0 for status moves
  accuracy: number; // 0-100, 0 means always hits
  pp: number;
  priority?: number;
  effect?: MoveEffect;
}

export enum MoveEffect {
  NONE = 'NONE',
  PARALYZE = 'PARALYZE',
  BURN = 'BURN',
  FREEZE = 'FREEZE',
  POISON = 'POISON',
  SLEEP = 'SLEEP',
  CONFUSE = 'CONFUSE',
  FLINCH = 'FLINCH',
  STAT_UP_ATK = 'STAT_UP_ATK',
  STAT_UP_DEF = 'STAT_UP_DEF',
  STAT_UP_SPD = 'STAT_UP_SPD',
  STAT_UP_SPC = 'STAT_UP_SPC',
  STAT_DOWN_ATK = 'STAT_DOWN_ATK',
  STAT_DOWN_DEF = 'STAT_DOWN_DEF',
  STAT_DOWN_SPD = 'STAT_DOWN_SPD',
  STAT_DOWN_SPC = 'STAT_DOWN_SPC',
  STAT_DOWN_ACC = 'STAT_DOWN_ACC',
  RECOIL = 'RECOIL',
  DRAIN = 'DRAIN',
  MULTI_HIT = 'MULTI_HIT',
  TWO_HIT = 'TWO_HIT',
  CHARGE = 'CHARGE',
  RECHARGE = 'RECHARGE',
  SELF_DESTRUCT = 'SELF_DESTRUCT',
  DREAM_EATER = 'DREAM_EATER',
  FIXED_DAMAGE = 'FIXED_DAMAGE',
  LEVEL_DAMAGE = 'LEVEL_DAMAGE',
  OHKO = 'OHKO',
  RECOVER = 'RECOVER',
  LEECH_SEED = 'LEECH_SEED',
  TOXIC = 'TOXIC',
  LIGHT_SCREEN = 'LIGHT_SCREEN',
  REFLECT = 'REFLECT',
  FOCUS_ENERGY = 'FOCUS_ENERGY',
  SUBSTITUTE = 'SUBSTITUTE',
  TRANSFORM = 'TRANSFORM',
  CONVERSION = 'CONVERSION',
  HAZE = 'HAZE',
  BIDE = 'BIDE',
  METRONOME = 'METRONOME',
  MIRROR_MOVE = 'MIRROR_MOVE',
  DISABLE = 'DISABLE',
  MIST = 'MIST',
  SWIFT = 'SWIFT',
  REST = 'REST',
  RAGE = 'RAGE',
  MIMIC = 'MIMIC',
  COUNTER = 'COUNTER',
  SUPER_FANG = 'SUPER_FANG',
  WRAP = 'WRAP',
}

export interface PokemonInstance {
  speciesId: number;
  nickname?: string;
  level: number;
  currentHp: number;
  stats: BaseStats;
  ivs: BaseStats;
  evs: BaseStats;
  moves: PokemonMove[];
  exp: number;
  status: StatusCondition;
  ot: string; // original trainer
  isShiny?: boolean;
}

export interface PokemonMove {
  moveId: number;
  currentPp: number;
  maxPp: number;
}
