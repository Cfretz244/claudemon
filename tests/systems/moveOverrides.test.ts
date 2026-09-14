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
  // The signature attacks: each one replaces a generic body that a sibling
  // move still renders, so `tools/anim-e2e.mjs` can diff them against it.
  'thunderbolt',
  'surf',
  'earthquake',
  'hydroPump',
  'fireBlast',
  'blizzard',
  'psychic',
  'nightShade',
  // The foe-targeted status / grapple / speed / stat-drop set-pieces. Seven of
  // these eleven used to share ONE generic body (`status-cloud`), which is why
  // the e2e diffs each of them against the sibling named in the brief as well
  // as against its own stripped spec.
  'sing',
  'sleepPowder',
  'toxic',
  'leechSeed',
  'thunderWave',
  'wrap',
  'bind',
  'quickAttack',
  'swift',
  'growl',
  'tailWhip',
];

/** QUICK ATTACK's budget is a promise about how the move FEELS, so it is a
 *  test and not just a comment: the hit has to land before you see it. */
const QUICK_ATTACK_MAX_MS = 400;

/** move id -> the override key it must resolve to, for every registered key. */
const BY_ID: Record<number, string> = {
  87: 'thunder',
  19: 'fly',
  91: 'dig',
  76: 'solarBeam',
  120: 'selfDestruct',
  153: 'explosion',
  63: 'hyperBeam',
  85: 'thunderbolt',
  57: 'surf',
  89: 'earthquake',
  56: 'hydroPump',
  126: 'fireBlast',
  59: 'blizzard',
  94: 'psychic',
  101: 'nightShade',
  47: 'sing',
  79: 'sleepPowder',
  92: 'toxic',
  73: 'leechSeed',
  86: 'thunderWave',
  35: 'wrap',
  20: 'bind',
  98: 'quickAttack',
  129: 'swift',
  45: 'growl',
  39: 'tailWhip',
};

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

  it('every set-piece resolves to its declared budget', () => {
    for (const [idStr, key] of Object.entries(BY_ID)) {
      const spec = resolveAnimation(Number(idStr));
      expect(spec.override, `move ${idStr}`).toBe(key);
      expect(spec.duration, `move ${idStr} duration`).toBe(OVERRIDE_DURATION[key]);
      expect(spec.duration, `move ${idStr} budget`).toBeLessThanOrEqual(MAX_OVERRIDE_DURATION_MS);
      expect(registered.has(key), `move ${idStr} override registered`).toBe(true);
    }
  });

  it('every registered key has a declared budget and an id that reaches it', () => {
    const byKey = new Set(Object.values(BY_ID));
    for (const key of registered) {
      expect(byKey.has(key), `registered override ${key} has no move id in BY_ID`).toBe(true);
      expect(OVERRIDE_DURATION[key], `OVERRIDE_DURATION.${key}`).toBeGreaterThan(0);
    }
  });

  it('each signature attack owns a sound effect and cleans up its graphics', () => {
    // A tier-3 override is skipped by playTypeSfx, so silence is a bug; and
    // every Graphics it creates has to be destroyed or it leaks onto the next
    // animation. Counted on the source, which is all the node env can see.
    const newG = (OVERRIDES_SRC.match(/newG\(scene/g) ?? []).length;
    const destroyed = (OVERRIDES_SRC.match(/\.destroy\(\)/g) ?? []).length;
    expect(destroyed).toBeGreaterThanOrEqual(newG);
    for (const key of ['thunderbolt', 'surf', 'earthquake', 'hydroPump',
      'fireBlast', 'blizzard', 'psychic', 'nightShade',
      'sing', 'sleepPowder', 'toxic', 'leechSeed', 'thunderWave',
      'wrap', 'bind', 'quickAttack', 'swift', 'growl', 'tailWhip']) {
      const fn = `render${key[0].toUpperCase()}${key.slice(1)}`;
      const body = OVERRIDES_SRC.slice(OVERRIDES_SRC.indexOf(`function ${fn}(`));
      expect(body.slice(0, body.indexOf('\nasync function') + 1 || undefined))
        .toMatch(/soundSystem\.[a-zA-Z]+\(/);
    }
  });

  it('QUICK ATTACK is the fastest thing in the battle', () => {
    // The brief's one hard number: <= 400 ms, which is also FASTER than the
    // generic contact body it replaces would be with any intensity bonus.
    const spec = resolveAnimation(98);
    expect(spec.override).toBe('quickAttack');
    expect(spec.duration).toBeLessThanOrEqual(QUICK_ATTACK_MAX_MS);
    for (const [key, ms] of Object.entries(OVERRIDE_DURATION)) {
      if (key === 'quickAttack') continue;
      expect(ms, `${key} must not be faster than quickAttack`).toBeGreaterThan(spec.duration);
    }
  });

  it('restores the sprite rotation it borrows', () => {
    // renderSpec's finally restores position/alpha/scale/tint - but NOT
    // rotation, so any override that rocks or sways a sprite has to put it
    // back itself or the sprite stays crooked for the rest of the battle.
    for (const fn of ['renderSing', 'renderTailWhip']) {
      const body = OVERRIDES_SRC.slice(OVERRIDES_SRC.indexOf(`function ${fn}(`));
      const own = body.slice(0, body.indexOf('\n/**') + 1 || undefined);
      expect(own, fn).toMatch(/rotation/);
      expect(own, fn).toMatch(/setRotation\(rot0\)/);
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
