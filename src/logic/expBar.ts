import { getExpForLevel, getLevelForExp } from '../entities/Pokemon';

/**
 * Where a Pokemon sits inside its current level, for the thin EXP bar under
 * the player's HP bar (Gen I Yellow draws one only in the player's box).
 *
 * The curve is the one `Pokemon.ts` uses everywhere: `getExpForLevel(n) = n^3`,
 * i.e. the "medium fast" group with no per-species variation. Everything here
 * is derived from that single function so the bar can never disagree with
 * `ExperienceSystem.addExperience`, which levels a mon up the moment
 * `exp >= getExpForLevel(level + 1)`.
 */
export interface ExpProgress {
  /** The level the bar is drawn for. */
  level: number;
  /** EXP earned since this level started: `exp - getExpForLevel(level)`. */
  into: number;
  /** EXP this level is worth: `getExpForLevel(level + 1) - getExpForLevel(level)`. */
  span: number;
  /** `into / span`, clamped to 0..1. Level 100 is always 1. */
  fraction: number;
}

/** One leg of the fill animation: the bar runs `from` -> `to` at `level`. */
export interface ExpSegment {
  level: number;
  from: number;
  to: number;
}

/** The highest level the EXP curve goes to; `addExperience` stops here too. */
export const MAX_LEVEL = 100;

/** What the source of a progress read needs to supply. */
export interface ExpBearer {
  level: number;
  exp: number;
}

/**
 * How full the EXP bar should be for `pokemon`.
 *
 * Level 100 is the guarded case: there is no next threshold to divide by, so
 * `span` is 0 and the bar is reported full rather than NaN. `into` and
 * `fraction` are also clamped for the transient state inside
 * `addExperience`, where `exp` has already been raised past the next
 * threshold but `level` has not caught up yet.
 */
export function expProgress(pokemon: ExpBearer): ExpProgress {
  const level = Math.min(Math.max(Math.floor(pokemon.level), 1), MAX_LEVEL);

  if (level >= MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      into: Math.max(0, pokemon.exp - getExpForLevel(MAX_LEVEL)),
      span: 0,
      fraction: 1,
    };
  }

  const base = getExpForLevel(level);
  const span = getExpForLevel(level + 1) - base;
  const into = Math.min(Math.max(0, pokemon.exp - base), span);

  return { level, into, span, fraction: span > 0 ? into / span : 1 };
}

/** EXP still needed to reach the next level; 0 once the mon is level 100. */
export function expToNextLevel(pokemon: ExpBearer): number {
  const { span, into } = expProgress(pokemon);
  return Math.max(0, span - into);
}

/**
 * The legs the bar has to run to show a gain of `expAfter - expBefore`.
 *
 * One segment per level the gain crosses, each ending at 1 (that is the
 * "fill to full, tick the level, wrap to empty" beat), plus a final segment
 * on the new level ending at the new fraction. So crossing N levels yields
 * N + 1 segments, and a gain that stays inside one level yields exactly one.
 *
 * Returns `[]` when there is nothing to show: no gain at all, or a mon that
 * was already level 100 (its bar is pinned full).
 */
export function expGainSegments(
  expBefore: number,
  levelBefore: number,
  expAfter: number,
): ExpSegment[] {
  const startLevel = Math.min(Math.max(Math.floor(levelBefore), 1), MAX_LEVEL);
  if (expAfter <= expBefore || startLevel >= MAX_LEVEL) return [];

  const endLevel = Math.max(startLevel, getLevelForExp(expAfter));
  const segments: ExpSegment[] = [];

  for (let level = startLevel; level < endLevel; level++) {
    segments.push({
      level,
      from: level === startLevel ? expProgress({ level, exp: expBefore }).fraction : 0,
      to: 1,
    });
  }

  segments.push({
    level: endLevel,
    from: endLevel === startLevel ? expProgress({ level: endLevel, exp: expBefore }).fraction : 0,
    to: expProgress({ level: endLevel, exp: expAfter }).fraction,
  });

  return segments;
}
