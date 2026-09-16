/**
 * Tier-4 outcome feedback (see docs/battle-animations-design.md, tier 4).
 *
 * Two pure functions, no Phaser and no randomness, so the whole policy is unit
 * testable:
 *
 *   `outcomeFor`  - what the battle scene decided (hit / miss / immune, crit,
 *                   type effectiveness) reduced to the optional `outcome` the
 *                   renderer reads off `AnimationContext`.
 *   `outcomePlan` - that outcome turned into the numbers the renderer and the
 *                   shared impact helpers act on (skip the impact, grey it,
 *                   dim the flash, repeat it, add the crit pass).
 *
 * `undefined` in means `NEUTRAL_PLAN` out: status moves, the special-damage
 * path, the battle simulator and the e2e all keep today's rendering exactly.
 */

import { MoveCategory } from '../types/pokemon.types';

/** What happened to the move, as far as the picture is concerned. */
export type OutcomeKind = 'hit' | 'miss' | 'immune';

export interface MoveOutcome {
  kind: OutcomeKind;
  /** Gen-1 critical hit. Never set on a miss or an immunity. */
  critical?: boolean;
  /** The DamageCalculator multiplier: 0.25, 0.5, 1, 2 or 4 (0 is `immune`). */
  effectiveness?: number;
}

export interface OutcomePlan {
  /** Miss: the impact helpers draw nothing at all (the motion still plays). */
  skipImpact: boolean;
  /** Miss: the defender side-steps and a grey whiff streak crosses it. */
  dodge: boolean;
  /** Immunity: the impact burst is a small grey puff and nothing flashes. */
  grey: boolean;
  /** Scales impact radius / particle count. 1 = today, 0.6 = not very effective. */
  weight: number;
  /** Multiplies the defender's tint strength. 0.5 dims it, 1 is today. */
  flashAlpha: number;
  /** False suppresses every shake inside the body (miss, immune, not very). */
  shake: boolean;
  /** Super effective: repeat the impact once at this weight (0 = no repeat). */
  repeat: number;
  /** Critical: extra white flash + shake + a 4 px jolt, on top of the above. */
  critical: boolean;
  /** Not very effective: a duller, lower impact sound. */
  dullSfx: boolean;
}

/** The plan for "no outcome information" - byte-identical to pre-tier-4. */
export const NEUTRAL_PLAN: OutcomePlan = Object.freeze({
  skipImpact: false,
  dodge: false,
  grey: false,
  weight: 1,
  flashAlpha: 1,
  shake: true,
  repeat: 0,
  critical: false,
  dullSfx: false,
});

/** Super-effective repeat weight, and the grey puff's share of a normal burst. */
export const SUPER_REPEAT_WEIGHT = 1.4;
export const NOT_VERY_WEIGHT = 0.6;
export const IMMUNE_WEIGHT = 0.55;

export function outcomePlan(outcome?: MoveOutcome): OutcomePlan {
  if (!outcome) return NEUTRAL_PLAN;

  if (outcome.kind === 'miss') {
    return { ...NEUTRAL_PLAN, skipImpact: true, dodge: true, shake: false };
  }
  if (outcome.kind === 'immune') {
    return { ...NEUTRAL_PLAN, grey: true, weight: IMMUNE_WEIGHT, flashAlpha: 0, shake: false };
  }

  const effectiveness = outcome.effectiveness ?? 1;
  const critical = outcome.critical === true;

  if (effectiveness === 0) {
    // Defensive: a 'hit' that resolved to 0x is an immunity however it is labelled.
    return { ...NEUTRAL_PLAN, grey: true, weight: IMMUNE_WEIGHT, flashAlpha: 0, shake: false };
  }
  if (effectiveness < 1) {
    return {
      ...NEUTRAL_PLAN,
      weight: NOT_VERY_WEIGHT,
      flashAlpha: 0.5,
      shake: false,
      dullSfx: true,
      critical,
    };
  }
  if (effectiveness > 1) {
    return { ...NEUTRAL_PLAN, repeat: SUPER_REPEAT_WEIGHT, critical };
  }
  return { ...NEUTRAL_PLAN, critical };
}

/** The subset of a move the outcome policy needs. */
export interface OutcomeMoveData {
  power: number;
  category: MoveCategory;
}

/** The subset of DamageCalculator's result the outcome policy needs. */
export interface OutcomeDamageResult {
  isCritical: boolean;
  effectiveness: number;
}

/**
 * The one place BattleScene turns its precomputed roll into an animation
 * outcome.
 *
 * `result` is the damage the move is ABOUT to do, computed before the
 * animation plays; it is `undefined` for anything that does not take the
 * normal damage path (status moves and the special-damage effects, which all
 * have `power: 0`). Those keep `outcome` undefined - and therefore today's
 * rendering - unless they missed.
 */
export function outcomeFor(
  hit: boolean,
  result: OutcomeDamageResult | undefined,
  moveData: OutcomeMoveData,
): MoveOutcome | undefined {
  if (!hit) return { kind: 'miss' };
  if (moveData.power <= 0 || moveData.category === MoveCategory.STATUS) return undefined;
  if (!result) return undefined;
  if (result.effectiveness === 0) return { kind: 'immune' };
  return { kind: 'hit', critical: result.isCritical, effectiveness: result.effectiveness };
}
