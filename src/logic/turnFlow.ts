// Round flow: when a faint cuts the round short.

/** Anything with live HP — a PokemonInstance, or a test stub. */
interface HasHp { currentHp: number }

/**
 * Gen I ends the round as soon as EITHER Pokemon faints: the faint is handled
 * and the other side's move for that round is skipped. So the second mover
 * only acts if BOTH it and the first mover are still standing.
 *
 * The first mover can be the one that went down: SELF-DESTRUCT / EXPLOSION zero
 * their own HP, and recoil (TAKE DOWN, DOUBLE-EDGE, SUBMISSION) can too. Gating
 * only on the second mover's HP let it swing at an already-fainted opponent.
 */
export function roundContinues(first: HasHp, second: HasHp): boolean {
  return first.currentHp > 0 && second.currentHp > 0;
}
