// What choosing FIGHT does: open the move list, or go straight to STRUGGLE.

/** Anything with live PP — a PokemonMove, or a test stub. */
interface HasPp { currentPp: number }

export type FightAction =
  | { kind: 'menu' }
  | { kind: 'struggle'; moveIndex: 0 };

/**
 * Gen I (pokered `AnyMoveToSelect`, called from the regular move menu): when
 * no move can be selected, the move list never opens and the Pokemon uses
 * STRUGGLE at once. "Can be selected" means PP left AND not the disabled
 * slot: a disabled move's PP is ignored, so DISABLE on the last move with PP
 * also forces STRUGGLE instead of leaving the player with nothing to pick.
 *
 * An empty move list counts as dry. `moveIndex` is always 0: the engine
 * substitutes STRUGGLE for whatever slot is dispatched (`executeBattleMove`'s
 * PP / Struggle gate, player side only — a Gen I foe never Struggles).
 */
export function fightAction(moves: readonly HasPp[], disabledIndex = -1): FightAction {
  return hasSelectableMove(moves, disabledIndex) ? { kind: 'menu' } : { kind: 'struggle', moveIndex: 0 };
}

/** True when at least one slot other than the disabled one still has PP. */
export function hasSelectableMove(moves: readonly HasPp[], disabledIndex = -1): boolean {
  return moves.some((m, i) => i !== disabledIndex && m.currentPp > 0);
}

/** The line Gen I prints before a forced STRUGGLE (`_NoMovesLeftText`). */
export function noMovesLeftText(name: string): string {
  return `${name} has no\nmoves left!`;
}
