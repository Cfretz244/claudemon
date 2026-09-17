import { getExpForLevel } from '../entities/Pokemon';
import { MAX_LEVEL } from '../utils/constants';

/**
 * What one RARE CANDY does.
 *
 * Gen I: a candy raises the level by EXACTLY one, and it does it by setting
 * the EXP to the next level's threshold - not by handing out a pile of EXP.
 * The distinction matters, because `ExperienceSystem.addExperience` loops
 * while `exp >= getExpForLevel(level + 1)`: give it a big number and it walks
 * the mon all the way to Lv100 in one candy, which is what the bag used to do.
 * Setting the EXP to exactly `getExpForLevel(level + 1)` makes that loop run
 * once and stop, so the candy also lands on a clean "0 EXP into the new level"
 * - the same place a Gen I candy leaves you, and the same place the EXP bar
 * (`logic/expBar.ts`) draws as empty.
 *
 * At Lv100 there is no next threshold: the candy has no effect and is NOT
 * consumed. That is the one `ok: false` case, and the bag prints
 * "It won't have any effect!" for it.
 *
 * Nothing here mutates the Pokemon. The caller applies `newExp` and lets
 * `addExperience` do the level-up, so the stat recalculation, the HP gain and
 * the learnset lookup are the battle path's, not a second copy of it.
 */
export interface RareCandyResult {
  /** True when the candy does something: the mon is below Lv100. */
  ok: boolean;
  /** `ok` only: the EXP total the mon should be set to, `(level + 1)^3`. */
  newExp?: number;
  /** `!ok` only: why nothing happened. */
  reason?: 'max_level';
}

/** What a candy needs to know about its target. */
export interface CandyTarget {
  level: number;
}

export function rareCandyResult(pokemon: CandyTarget): RareCandyResult {
  if (pokemon.level >= MAX_LEVEL) {
    return { ok: false, reason: 'max_level' };
  }
  return { ok: true, newExp: getExpForLevel(pokemon.level + 1) };
}
