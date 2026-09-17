// The one rule behind the Pikachu follower sprite: when is it out at all?
//
// `OverworldScene.create()` used to answer this inline, once, with
// `party.some(p => p.speciesId === 25)` — species only, HP ignored, and never
// re-evaluated afterwards. So a fainted Pikachu kept trotting along behind the
// player (operator, 2026-09-17: "pikachu shouldn't follow me around when it's
// fainted"), and the answer went stale the moment the party changed inside a
// map: a POKeMON CENTER heal, a REVIVE from the bag, a PC deposit.
//
// Yellow's rule: the starter Pikachu walks behind the player while it is in the
// party AND has HP left. Keeping it here means the scene has one thing to call
// (`refreshFollower()`) and the rule itself is unit-pinned rather than buried
// in a Phaser scene the test environment cannot load.

import { PokemonInstance } from '../types/pokemon.types';
import { PIKACHU_SPECIES_ID } from './oakLab';

/**
 * True when the Pikachu follower should be out for `party`.
 *
 * Anywhere in the party counts, not just the lead slot — the follower is the
 * starter walking beside its trainer, not the active battler — and `currentHp`
 * decides the rest: 0 HP is fainted, so it is back in its ball.
 */
export function followerVisible(party: PokemonInstance[]): boolean {
  return party.some(p => p.speciesId === PIKACHU_SPECIES_ID && p.currentHp > 0);
}
