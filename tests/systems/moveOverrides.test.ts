import { describe, it, expect } from 'vitest';
import OVERRIDES_SRC from '../../src/systems/animations/overrides.ts?raw';
import INDEX_SRC from '../../src/systems/animations/index.ts?raw';
import MOVE_ANIMATIONS_SRC from '../../src/systems/MoveAnimations.ts?raw';
import {
  MOVE_OVERRIDES,
  OVERRIDE_DURATION,
  MAX_OVERRIDE_DURATION_MS,
  resolveAnimation,
} from '../../src/logic/moveAnimationSpec';

/**
 * The animation modules import Phaser, which cannot be loaded in the node test
 * environment (see vitest.config coverage exclusions), so these tests read the
 * override source as text. That is enough to pin the contract that matters:
 * which keys are registered, and that the spec layer and the renderer layer
 * agree about them.
 */

/** Every key passed to registerSpecOverride() in overrides.ts. */
const registered = new Set(
  [...OVERRIDES_SRC.matchAll(/registerSpecOverride\(\s*'([A-Za-z0-9_]+)'/g)].map(m => m[1]),
);

const IMPLEMENTED = [
  'thunder',
  'fly',
  'dig',
  'solarBeam',
  'selfDestruct',
  'explosion',
  'hyperBeam',
];

describe('tier-3 move overrides', () => {
  it('registers exactly the implemented set-pieces', () => {
    expect([...registered].sort()).toEqual([...IMPLEMENTED].sort());
  });

  it('every registered key is a real MOVE_OVERRIDES key', () => {
    const keys = new Set(Object.values(MOVE_OVERRIDES));
    for (const key of registered) {
      expect(keys.has(key), `registered override ${key}`).toBe(true);
    }
  });

  it('every override with a custom budget is registered and within the cap', () => {
    for (const [key, ms] of Object.entries(OVERRIDE_DURATION)) {
      expect(registered.has(key), `OVERRIDE_DURATION key ${key} has no function`).toBe(true);
      expect(ms, `OVERRIDE_DURATION.${key}`).toBeLessThanOrEqual(MAX_OVERRIDE_DURATION_MS);
    }
  });

  it('the six new set-pieces resolve to their declared budgets', () => {
    const expected: Record<number, string> = {
      19: 'fly',
      91: 'dig',
      76: 'solarBeam',
      120: 'selfDestruct',
      153: 'explosion',
      63: 'hyperBeam',
    };
    for (const [idStr, key] of Object.entries(expected)) {
      const spec = resolveAnimation(Number(idStr));
      expect(spec.override, `move ${idStr}`).toBe(key);
      expect(spec.duration, `move ${idStr} duration`).toBe(OVERRIDE_DURATION[key]);
      expect(registered.has(key), `move ${idStr} override registered`).toBe(true);
    }
  });

  it('the two-turn overrides play in one promise (the engine never defers them)', () => {
    // BattleScene.doExecuteMove calls playMoveAnimation once per move use, so
    // the resolver only ever emits 'charge' - there is no release turn.
    for (const id of [19, 76, 91]) {
      expect(resolveAnimation(id).twoTurn).toBe('charge');
    }
  });
});

describe('the legacy per-move registry is gone', () => {
  it('MoveAnimations.ts no longer exposes registerAnimation / MOVE_ANIMATIONS', () => {
    expect(MOVE_ANIMATIONS_SRC).not.toMatch(/\bregisterAnimation\b/);
    expect(MOVE_ANIMATIONS_SRC).not.toMatch(/\bMOVE_ANIMATIONS\b/);
  });

  it('playMoveAnimation just renders the resolved spec', () => {
    expect(MOVE_ANIMATIONS_SRC).toMatch(
      /export async function playMoveAnimation[\s\S]{0,200}renderSpec\(resolveAnimation\(moveId\), ctx\)/,
    );
  });

  it('no batch modules remain', () => {
    const files = Object.keys(import.meta.glob('../../src/systems/animations/*.ts'));
    expect(files.filter((f: string) => /batch/.test(f))).toEqual([]);
    expect(INDEX_SRC).not.toMatch(/batch/);
  });
});
