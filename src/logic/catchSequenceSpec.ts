/**
 * Pure, Phaser-free timing plan for the Pokeball catch sequence.
 *
 * The sibling of `logic/entranceSpec.ts`: nothing here touches Phaser, the
 * scene, canvas or randomness, so "how long is a catch with two shakes, and
 * does it fit under its cap" is a unit test rather than a stopwatch held
 * against a browser.
 *
 * The sequence itself is the Gen I shape (helper repo
 * docs/sprite-intro-animations-design.md §8, the catch row):
 *
 *   throw -> open -> pull (the mon shrinks into the ball) -> drop
 *   -> [rock + still] x shakes -> outcome
 *
 * `MAX_CATCH_MS(shakes)` is the hard ceiling the renderer races, exactly as
 * `MAX_WILD_MS` / `MAX_SENDOUT_MS` are raced by `playEntrance`: it scales with
 * the shake count because the shakes are the one part of the sequence whose
 * length the catch roll — not the animator — decides.
 */

/** The ball arcs from the player's side to the wild mon. */
export const CATCH_THROW_MS = 350;
/** The white pop as the ball opens. Matches the send-out's `BALL_OPEN_MS`. */
export const CATCH_OPEN_MS = 60;
/** `dematerialise`: 150 ms to the pale silhouette, 250 ms shrinking into the ball. */
export const CATCH_PULL_MS = 400;
/** The ball falls to the mon's ground line with one visible bounce. */
export const CATCH_DROP_MS = 400;
/** One rock: angle -20 / +20 / 0. */
export const CATCH_ROCK_MS = 300;
/** ...then the ball sits dead still, which is what makes the next rock land. */
export const CATCH_STILL_MS = 400;
/** Caught: the button flashes twice and sparkles go up around the ball. */
export const CATCH_CAUGHT_MS = 400;
/** Broke free: the ball bursts open (60 ms) and the mon materialises back (400 ms). */
export const CATCH_BREAK_MS = 460;

/** Cap for a catch with no shakes at all. */
export const MAX_CATCH_BASE_MS = 2500;
/** ...plus this much per shake the roll produced. */
export const MAX_CATCH_PER_SHAKE_MS = 700;

/**
 * Frame-rounding allowance, the same bargain `SENDOUT_RESERVE_MS` strikes: the
 * catch sequence awaits MORE phases than any entrance (throw, open, pull, drop,
 * two per shake, outcome), and every one of them rounds up to the next 16 ms
 * frame, so the renderer plans below the cap and gives the difference back to
 * the frame driver instead of letting the cap race eat the outcome.
 */
export const CATCH_RESERVE_MS = 200;

/** The hard ceiling for `shakes` shakes: 2500 + 700 per shake. */
export function maxCatchMs(shakes: number): number {
  return MAX_CATCH_BASE_MS + MAX_CATCH_PER_SHAKE_MS * Math.max(0, shakes);
}

export type CatchPhaseName =
  | 'throw' | 'open' | 'pull' | 'drop' | 'rock' | 'still' | 'caught' | 'free';

export interface CatchPhase {
  name: CatchPhaseName;
  ms: number;
}

export interface CatchTimeline {
  phases: CatchPhase[];
  /** Sum of the phase lengths: what the renderer plans to spend. */
  total: number;
  /** `maxCatchMs(shakes)`: what the renderer aborts at. */
  cap: number;
  /** `cap - CATCH_RESERVE_MS`: what the plan is allowed to fill. */
  budget: number;
}

/**
 * The phase list for a catch attempt, in order.
 *
 * `shakes` is `CatchResult.shakes` (0-3) and `caught` its `caught` flag. Gen I
 * only ever reports `caught` with three shakes (`CatchSystem.attemptCatch`
 * breaks out of its loop on the first failed shake), but the timeline is
 * defined for every combination so the renderer has no undefined corner and the
 * MASTER BALL's hard-coded `{ caught: true, shakes: 3 }` is just one row of it.
 */
export function catchTimeline(shakes: number, caught: boolean): CatchTimeline {
  const n = Math.max(0, Math.min(3, Math.floor(shakes)));
  const phases: CatchPhase[] = [
    { name: 'throw', ms: CATCH_THROW_MS },
    { name: 'open', ms: CATCH_OPEN_MS },
    { name: 'pull', ms: CATCH_PULL_MS },
    { name: 'drop', ms: CATCH_DROP_MS },
  ];
  for (let i = 0; i < n; i++) {
    phases.push({ name: 'rock', ms: CATCH_ROCK_MS });
    phases.push({ name: 'still', ms: CATCH_STILL_MS });
  }
  phases.push(caught
    ? { name: 'caught', ms: CATCH_CAUGHT_MS }
    : { name: 'free', ms: CATCH_BREAK_MS });

  const cap = maxCatchMs(n);
  return {
    phases,
    total: phases.reduce((sum, p) => sum + p.ms, 0),
    cap,
    budget: cap - CATCH_RESERVE_MS,
  };
}
