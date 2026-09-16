// Party restoration shared by Pokemon Centers and healing tiles, plus the one
// story flag a Pokemon Center heal writes.
import type { MapData } from '../types/map.types';
import { PokemonInstance } from '../types/pokemon.types';
import { StatusCondition } from '../types/pokemon.types';
import { visitedFlag } from './elevator';

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

/**
 * The `visited_<map>` flag a heal at this Pokemon Center writes, or null when
 * the map has no warps at all.
 *
 * Extracted verbatim from step 4 of `OverworldScene.runHealAnimation()`:
 * `warps[0]` of a centre is its own front door, so the flag names the town the
 * door opens onto — which is exactly what `getAvailableFlyDestinations()`
 * reads, so healing in a town is what unlocks it as a Fly stop. It is the same
 * `visited_` template the Silph Co elevator writes on arrival (`visitedFlag`
 * in `logic/elevator.ts`), deliberately shared so the two cannot drift.
 *
 * Note that nothing here checks that the map IS a Pokemon Center: the caller
 * is the nurse's heal animation, which only runs on a map with a nurse.
 * `tests/logic/healing.test.ts` sweeps every such map.
 */
export function healVisitFlag(map: Pick<MapData, 'warps'>): string | null {
  const exitWarp = map.warps[0];
  return exitWarp ? visitedFlag(exitWarp.targetMap) : null;
}
