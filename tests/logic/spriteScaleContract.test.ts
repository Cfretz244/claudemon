// The base-scale contract, swept out of the source.
//
// Battle sprites no longer rest at scale 1: each one rests at its species'
// size class (`logic/pokemonSize.ts`, applied by `animations/baseScale.ts`).
// That makes every literal "back to normal" a bug rather than a no-op — a
// `setScale(1, 1)` at the end of an entrance flourish would leave an XL
// CHARIZARD permanently M-sized, and the battle would carry on with it.
//
// Unit tests cannot see that: it is a property of a hundred animation call
// sites, not of a function. So this sweeps the animation sources for absolute
// scale writes and requires each one to be relative to a base — `run.base`,
// `kit.base`, `baseScaleOf(...)`, a snapshotted `sx0`/`state.scaleX`, or the
// sprite's own live scale.
import { describe, it, expect } from 'vitest';

/** The files that draw on a battle sprite, as source text. */
const FILES = (import.meta as unknown as {
  glob(pattern: string[], opts: object): Record<string, string>;
}).glob([
  '../../src/systems/MoveAnimations.ts',
  '../../src/systems/animations/*.ts',
  '../../src/scenes/BattleScene.ts',
], { query: '?raw', import: 'default', eager: true });

/** `setScale(<n>)` / `setScale(<n>, <n>)` with a literal that is not 0. */
const LITERAL_SET_SCALE = /(\w[\w.]*)\.setScale\(\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(-?\d+(?:\.\d+)?)\s*)?\)/;
/** A tween property written to a bare number, e.g. `scaleX: 1,`. */
const LITERAL_TWEEN_SCALE = /\b(?:scaleX|scaleY|scale)\s*:\s*(-?\d+(?:\.\d+)?)\s*[,}]/;
/** A tween's `targets:`, so a prop's scale is not mistaken for a mon's. */
const TARGETS = /targets:\s*([\w.]+)/;

/**
 * The names a battle sprite goes by. Everything else these files scale is a
 * prop they drew themselves (a shadow, a doll, a ghost, a ball), which has no
 * species and therefore no size class.
 */
const BATTLE_SPRITES = new Set([
  'sprite', 'attackerSprite', 'defenderSprite', 'targetSprite',
  'playerSprite', 'opponentSprite',
  'run.sprite', 'kit.sprite', 'ctx.sprite', 'this.playerSprite', 'this.opponentSprite',
]);

/** Absolute scale writes aimed at a battle sprite, as trimmed source lines. */
function hits(src: string): string[] {
  const lines = src.split('\n');
  const out: string[] = [];
  const literal = (...vals: Array<string | undefined>): boolean => {
    // Growing from (or collapsing to) nothing is still nothing: `setScale(0)`
    // and `scaleX: 0` are the one literal that survives a size class.
    const nums = vals.filter((v): v is string => v !== undefined);
    return nums.length > 0 && !nums.every(v => Number(v) === 0);
  };
  lines.forEach((line, i) => {
    const set = LITERAL_SET_SCALE.exec(line);
    if (set && BATTLE_SPRITES.has(set[1]) && literal(set[2], set[3])) out.push(line.trim());
    const tw = LITERAL_TWEEN_SCALE.exec(line);
    if (tw && literal(tw[1])) {
      // A tween's `targets:` is on this line or just above it.
      let target: string | undefined;
      for (let j = i; j >= 0 && j > i - 5 && target === undefined; j--) {
        target = TARGETS.exec(lines[j])?.[1];
      }
      if (target === undefined || BATTLE_SPRITES.has(target)) out.push(line.trim());
    }
  });
  return out;
}

describe('the base-scale contract', () => {
  it('catches exactly what it is meant to catch', () => {
    expect(hits('sprite.setScale(1, 1);')).toHaveLength(1);
    expect(hits('  targets: defenderSprite, scaleX: 0.85, scaleY: 1.1,')).toHaveLength(1);
    // Not a battle sprite, and not an absolute scale.
    expect(hits('shade.setScale(1.5);')).toEqual([]);
    expect(hits('targets: shade, scaleX: 1.9,')).toEqual([]);
    expect(hits('sprite.setScale(0, 0);')).toEqual([]);
    expect(hits('sprite.setScale(run.base, run.base);')).toEqual([]);
    expect(hits('targets: sprite, scaleX: kit.base,')).toEqual([]);
  });

  it('has files to sweep', () => {
    expect(Object.keys(FILES).length).toBeGreaterThanOrEqual(4);
    expect(Object.keys(FILES).join(' ')).toContain('baseScale.ts');
  });

  for (const [path, src] of Object.entries(FILES)) {
    // `baseScale.ts` is where the contract is defined, so it is the one file
    // allowed to name a literal scale.
    if (path.endsWith('baseScale.ts')) continue;

    it(`never writes an absolute scale in ${path.split('/').pop()}`, () => {
      expect(hits(src)).toEqual([]);
    });
  }

  it('reads the base wherever it puts a battle sprite back', () => {
    const entrances = FILES[Object.keys(FILES).find(k => k.endsWith('entrances.ts'))!];
    const overrides = FILES[Object.keys(FILES).find(k => k.endsWith('entranceOverrides.ts'))!];
    // `Run.base`/`EntranceKit.base` exist and are what the renderers rest at.
    expect(entrances).toContain('base: baseScaleOf(sprite)');
    expect(entrances.match(/run\.base/g)?.length ?? 0).toBeGreaterThan(8);
    expect(overrides.match(/kit\.base/g)?.length ?? 0).toBeGreaterThan(8);
  });

  it('gives every battle sprite a baseScale when its species is set', () => {
    const scene = FILES[Object.keys(FILES).find(k => k.endsWith('BattleScene.ts'))!];
    // Creation (x2), send-out, and the dev intro replay (borrow + restore).
    expect(scene.match(/applyBattleScale\(/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
  });
});
