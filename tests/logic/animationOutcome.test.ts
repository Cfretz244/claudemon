import { describe, it, expect } from 'vitest';
import MOVE_ANIMATIONS_SRC from '../../src/systems/MoveAnimations.ts?raw';
import OVERRIDES_SRC from '../../src/systems/animations/overrides.ts?raw';
import BATTLE_SCENE_SRC from '../../src/scenes/BattleScene.ts?raw';
import {
  outcomeFor,
  outcomePlan,
  NEUTRAL_PLAN,
  NOT_VERY_WEIGHT,
  IMMUNE_WEIGHT,
  SUPER_REPEAT_WEIGHT,
} from '../../src/logic/animationOutcome';
import { MoveCategory } from '../../src/types/pokemon.types';

const move = (power: number, category = MoveCategory.PHYSICAL) => ({ power, category });

describe('outcomeFor (the BattleScene wiring, extracted)', () => {
  it('a miss is a miss whatever the move is', () => {
    expect(outcomeFor(false, undefined, move(40))).toEqual({ kind: 'miss' });
    expect(outcomeFor(false, undefined, move(0, MoveCategory.STATUS))).toEqual({ kind: 'miss' });
    // Special damage (OHKO / SONIC BOOM / SUPER FANG) is power 0 and still misses.
    expect(outcomeFor(false, undefined, move(0))).toEqual({ kind: 'miss' });
  });

  it('leaves status moves and special damage with NO outcome, so they render as today', () => {
    expect(outcomeFor(true, undefined, move(0, MoveCategory.STATUS))).toBeUndefined();
    expect(outcomeFor(true, undefined, move(0))).toBeUndefined();
    // A damaging move whose damage was not precomputed also renders as today.
    expect(outcomeFor(true, undefined, move(40))).toBeUndefined();
  });

  it('maps a damage result onto hit / immune', () => {
    expect(outcomeFor(true, { isCritical: false, effectiveness: 0 }, move(40)))
      .toEqual({ kind: 'immune' });
    expect(outcomeFor(true, { isCritical: false, effectiveness: 1 }, move(40)))
      .toEqual({ kind: 'hit', critical: false, effectiveness: 1 });
    expect(outcomeFor(true, { isCritical: true, effectiveness: 2 }, move(40)))
      .toEqual({ kind: 'hit', critical: true, effectiveness: 2 });
    expect(outcomeFor(true, { isCritical: false, effectiveness: 0.25 }, move(95)))
      .toEqual({ kind: 'hit', critical: false, effectiveness: 0.25 });
  });
});

describe('outcomePlan (what the renderer acts on)', () => {
  it('undefined means "no tier 4 at all"', () => {
    expect(outcomePlan(undefined)).toBe(NEUTRAL_PLAN);
  });

  it('a plain 1x hit is identical to the neutral plan', () => {
    expect(outcomePlan({ kind: 'hit', critical: false, effectiveness: 1 })).toEqual(NEUTRAL_PLAN);
  });

  it('miss skips the impact, dodges, and shakes nothing', () => {
    const p = outcomePlan({ kind: 'miss' });
    expect(p.skipImpact).toBe(true);
    expect(p.dodge).toBe(true);
    expect(p.shake).toBe(false);
    expect(p.grey).toBe(false);
    expect(p.critical).toBe(false);
    expect(p.repeat).toBe(0);
  });

  it('immune greys the impact and suppresses the flash and the shake', () => {
    for (const p of [outcomePlan({ kind: 'immune' }), outcomePlan({ kind: 'hit', effectiveness: 0 })]) {
      expect(p.grey).toBe(true);
      expect(p.skipImpact).toBe(false);
      expect(p.flashAlpha).toBe(0);
      expect(p.shake).toBe(false);
      expect(p.weight).toBe(IMMUNE_WEIGHT);
    }
  });

  it('not very effective shrinks the impact, dims the flash and duls the sfx', () => {
    const p = outcomePlan({ kind: 'hit', effectiveness: 0.5 });
    expect(p.weight).toBe(NOT_VERY_WEIGHT);
    expect(p.flashAlpha).toBe(0.5);
    expect(p.shake).toBe(false);
    expect(p.dullSfx).toBe(true);
    expect(p.repeat).toBe(0);
    expect(outcomePlan({ kind: 'hit', effectiveness: 0.25 }).weight).toBe(NOT_VERY_WEIGHT);
  });

  it('super effective repeats the impact at 1.4x', () => {
    expect(outcomePlan({ kind: 'hit', effectiveness: 2 }).repeat).toBe(SUPER_REPEAT_WEIGHT);
    expect(outcomePlan({ kind: 'hit', effectiveness: 4 }).repeat).toBe(SUPER_REPEAT_WEIGHT);
  });

  it('critical rides on top of every kind except miss and immune', () => {
    expect(outcomePlan({ kind: 'hit', critical: true, effectiveness: 1 }).critical).toBe(true);
    expect(outcomePlan({ kind: 'hit', critical: true, effectiveness: 0.5 }).critical).toBe(true);
    expect(outcomePlan({ kind: 'hit', critical: true, effectiveness: 2 }).critical).toBe(true);
    expect(outcomePlan({ kind: 'hit', critical: true, effectiveness: 0 }).critical).toBe(false);
    expect(outcomePlan({ kind: 'miss' }).critical).toBe(false);
  });
});

/**
 * The renderer imports Phaser, which cannot load in the node test environment,
 * so the renderer-side contract is pinned by reading the source as text - the
 * same approach tests/systems/moveOverrides.test.ts uses. What matters is that
 * the gate exists, that it lives in renderSpec rather than in each body, and
 * that no override draws its impact past the gate.
 */
describe('the tier-4 gate in MoveAnimations.ts (source contract)', () => {
  it('AnimationContext carries an optional outcome', () => {
    expect(MOVE_ANIMATIONS_SRC).toMatch(/interface AnimationContext[\s\S]*?outcome\?: MoveOutcome;/);
  });

  it('renderSpec owns the gate and always restores it', () => {
    const body = MOVE_ANIMATIONS_SRC.slice(MOVE_ANIMATIONS_SRC.indexOf('export async function renderSpec'));
    expect(body).toMatch(/activePlan = outcomePlan\(ctx\.outcome\)/);
    expect(body).toMatch(/finally \{[\s\S]*?activePlan = prevPlan;/);
  });

  it('the shared impact helpers consult the gate', () => {
    for (const fn of ['screenShake', 'screenFlash', 'spriteFlash', 'impactBurst', 'impactTint']) {
      const at = MOVE_ANIMATIONS_SRC.indexOf(`export function ${fn}(`);
      expect(at, `${fn} is exported`).toBeGreaterThan(-1);
      const body = MOVE_ANIMATIONS_SRC.slice(at, at + 1400);
      expect(body, `${fn} reads activePlan`).toMatch(/activePlan\./);
    }
  });

  it('the tier-4 passes use the RAW helpers, so their own shake is not gated away', () => {
    expect(MOVE_ANIMATIONS_SRC).toMatch(/function rawScreenShake\(/);
    expect(MOVE_ANIMATIONS_SRC).toMatch(/function rawScreenFlash\(/);
    expect(MOVE_ANIMATIONS_SRC).toMatch(/rawScreenShake\(scene, 6, 120\)/); // the crit shake
    expect(MOVE_ANIMATIONS_SRC).toMatch(/rawScreenShake\(scene, 4, 120\)/); // the super-effective shake
  });

  it('no override draws a defender tint by hand', () => {
    const handDrawn = [...OVERRIDES_SRC.matchAll(/defenderSprite\.setTint\(/g)];
    expect(handDrawn.map(m => m.index)).toEqual([]);
  });

  it('overrides tween the defender through the gated tweenPromise, not scene.tweens.add', () => {
    const raw = [...OVERRIDES_SRC.matchAll(/tweens\.add\(\s*\{[^}]*targets:\s*defenderSprite/g)];
    expect(raw.map(m => m.index)).toEqual([]);
  });
});

describe('the BattleScene wiring (source contract)', () => {
  const body = BATTLE_SCENE_SRC.slice(BATTLE_SCENE_SRC.indexOf('private doExecuteMove('));
  const iAcc = body.indexOf('checkAccuracy(');
  const iCrit = body.indexOf('checkCritical(');
  const iDmg = body.indexOf('calculateDamage(');
  const iAnim = body.indexOf('playMoveAnimation(');
  const iMiss = body.indexOf('this.textBox.show(["But it missed!"]');

  it('accuracy, crit and damage are all rolled BEFORE the animation', () => {
    expect(iAcc).toBeGreaterThan(-1);
    expect(iCrit).toBeGreaterThan(-1);
    expect(iDmg).toBeGreaterThan(-1);
    expect(iAnim).toBeGreaterThan(-1);
    expect(iAcc).toBeLessThan(iAnim);
    expect(iCrit).toBeLessThan(iAnim);
    expect(iDmg).toBeLessThan(iAnim);
  });

  it('"But it missed!" is now shown AFTER the animation', () => {
    expect(iMiss).toBeGreaterThan(iAnim);
  });

  it('the outcome handed to the renderer comes from the shared helper', () => {
    expect(body).toMatch(/animCtx\.outcome = outcomeFor\(hit, preResult, moveData\)/);
    expect(BATTLE_SCENE_SRC).toMatch(/import \{ outcomeFor \} from '\.\.\/logic\/animationOutcome'/);
  });

  it('rollHitCount still runs after the animation (no mutation was moved)', () => {
    expect(body.indexOf('rollHitCount(')).toBeGreaterThan(iAnim);
  });
});
