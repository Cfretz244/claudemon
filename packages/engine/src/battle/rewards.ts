// Battle payouts. Extracted verbatim from `BattleScene.handleBattleEnd()`, so
// the shared engine and the Phaser scene can never drift apart on what a win
// is worth.
import { PokemonInstance } from '../types/pokemon.types';

/**
 * Prize money for beating a trainer: the level of the LAST opponent the player
 * knocked out, times 50 — the rule the game has always shipped.
 *
 * Note this deliberately ignores the `prizeMoney` fields in `trainers.ts`,
 * `gymLeaders.ts` and `eliteFour.ts`: those are dead data, no code path has
 * ever read them, and honouring them here would silently change every payout
 * in the game (a normal trainer would pay 60 instead of 300, Brock 1386
 * instead of 600). Changing the rule is a game-design decision, not a
 * refactor; this function preserves today's numbers exactly.
 */
export function trainerPrizeMoney(finalOpponent: PokemonInstance): number {
  return finalOpponent.level * 50;
}
