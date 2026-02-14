import { PokemonInstance, PokemonMove } from './pokemon.types';

export enum BattleType {
  WILD = 'WILD',
  TRAINER = 'TRAINER',
  GYM_LEADER = 'GYM_LEADER',
  ELITE_FOUR = 'ELITE_FOUR',
  CHAMPION = 'CHAMPION',
}

export enum BattleAction {
  FIGHT = 'FIGHT',
  BAG = 'BAG',
  POKEMON = 'POKEMON',
  RUN = 'RUN',
}

export interface BattleState {
  type: BattleType;
  playerPokemon: PokemonInstance;
  opponentPokemon: PokemonInstance;
  playerParty: PokemonInstance[];
  opponentParty: PokemonInstance[];
  isPlayerTurn: boolean;
  turnNumber: number;
  trainerName?: string;
  trainerId?: string;
  canRun: boolean;
  weather?: string;
}

export interface BattleResult {
  won: boolean;
  expGained: number;
  moneyGained: number;
  caughtPokemon?: PokemonInstance;
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  effectiveness: number; // 0, 0.25, 0.5, 1, 2, 4
  message?: string;
}

export interface TurnAction {
  action: BattleAction;
  move?: PokemonMove;
  itemId?: string;
  switchIndex?: number;
}
