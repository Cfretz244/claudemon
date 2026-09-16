import { PokemonInstance } from '../types/pokemon.types';
/** Preserve the shipped BattleScene payout (not the unused trainer-data field). */
export function trainerPrizeMoney(finalOpponent: PokemonInstance): number {
  return finalOpponent.level * 50;
}
