// Party restoration shared by Pokemon Centers and healing tiles.
import { PokemonInstance } from '../types/pokemon.types';
import { StatusCondition } from '../types/pokemon.types';

/**
 * Fully restore every party member: HP, status and PP. Returns true when
 * anything actually changed, so callers can skip the jingle for a party that
 * was already at full.
 */
export function restoreParty(party: PokemonInstance[]): boolean {
  let changed = false;
  for (const pokemon of party) {
    if (pokemon.currentHp !== pokemon.stats.hp) { pokemon.currentHp = pokemon.stats.hp; changed = true; }
    if (pokemon.status !== StatusCondition.NONE) { pokemon.status = StatusCondition.NONE; changed = true; }
    for (const move of pokemon.moves) {
      if (move.currentPp !== move.maxPp) { move.currentPp = move.maxPp; changed = true; }
    }
  }
  return changed;
}
