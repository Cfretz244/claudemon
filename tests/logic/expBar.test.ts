import { describe, it, expect } from 'vitest';
import {
  MAX_LEVEL, expGainSegments, expProgress, expToNextLevel,
} from '../../src/logic/expBar';
import { getExpForLevel, getLevelForExp } from '../../src/entities/Pokemon';
import { addExperience } from '../../src/systems/ExperienceSystem';
import { mockPokemon } from '../helpers/pokemon.factory';

/**
 * The EXP bar in the player's HP box. Everything is derived from the one
 * curve `getExpForLevel(n) = n^3`, so these tests pin the bar against the
 * exact thresholds `ExperienceSystem.addExperience` levels a mon up on.
 */

describe('expProgress', () => {
  it('is empty at the exact threshold that starts a level', () => {
    // 10^3 = 1000 is the first EXP value at which a mon is level 10.
    const p = expProgress({ level: 10, exp: getExpForLevel(10) });
    expect(p).toEqual({ level: 10, into: 0, span: 1331 - 1000, fraction: 0 });
  });

  it('is full one point before the next threshold, without tipping over', () => {
    const span = getExpForLevel(11) - getExpForLevel(10);
    const p = expProgress({ level: 10, exp: getExpForLevel(11) - 1 });
    expect(p.into).toBe(span - 1);
    expect(p.fraction).toBeCloseTo((span - 1) / span, 10);
    expect(p.fraction).toBeLessThan(1);
  });

  it('reports the fraction of the way through the level', () => {
    const base = getExpForLevel(20);
    const span = getExpForLevel(21) - base;
    const p = expProgress({ level: 20, exp: base + Math.floor(span * 0.4) });
    expect(p.level).toBe(20);
    expect(p.span).toBe(span);
    expect(p.fraction).toBeCloseTo(0.4, 2);
  });

  it('spans exactly (level+1)^3 - level^3 at every level below 100', () => {
    for (let level = 1; level < MAX_LEVEL; level++) {
      const { span } = expProgress({ level, exp: getExpForLevel(level) });
      expect(span).toBe((level + 1) ** 3 - level ** 3);
    }
  });

  it('pins a level 100 mon full, with a guarded zero span', () => {
    const p = expProgress({ level: 100, exp: getExpForLevel(100) });
    expect(p).toEqual({ level: 100, into: 0, span: 0, fraction: 1 });
    // Extra EXP beyond the cap is still counted, but never divided by zero.
    const over = expProgress({ level: 100, exp: getExpForLevel(100) + 5000 });
    expect(over.span).toBe(0);
    expect(over.into).toBe(5000);
    expect(over.fraction).toBe(1);
  });

  it('level 99 is a normal level: it has a real span', () => {
    const p = expProgress({ level: 99, exp: getExpForLevel(99) });
    expect(p.span).toBe(1000000 - 970299);
    expect(p.fraction).toBe(0);
  });

  it('clamps the transient state where exp is past the next threshold', () => {
    // `addExperience` adds the EXP first and raises `level` in a loop after,
    // so a read taken in between must not overflow the bar.
    const p = expProgress({ level: 5, exp: getExpForLevel(9) });
    expect(p.fraction).toBe(1);
    expect(p.into).toBe(p.span);
  });

  it('clamps an under-levelled read to an empty bar rather than negative', () => {
    const p = expProgress({ level: 9, exp: getExpForLevel(5) });
    expect(p.into).toBe(0);
    expect(p.fraction).toBe(0);
  });

  it('agrees with the real curve for a freshly created mon', () => {
    // createPokemon() seeds `exp = level^3`, i.e. the start of the level.
    const mon = mockPokemon({ level: 12, exp: getExpForLevel(12) });
    expect(expProgress(mon).fraction).toBe(0);
  });
});

describe('expToNextLevel', () => {
  it('is the whole span at the start of a level and 1 just before the end', () => {
    const span = getExpForLevel(11) - getExpForLevel(10);
    expect(expToNextLevel({ level: 10, exp: getExpForLevel(10) })).toBe(span);
    expect(expToNextLevel({ level: 10, exp: getExpForLevel(11) - 1 })).toBe(1);
  });

  it('is 0 at level 100', () => {
    expect(expToNextLevel({ level: 100, exp: getExpForLevel(100) })).toBe(0);
  });
});

describe('expGainSegments', () => {
  it('is one segment when the gain stays inside the level', () => {
    const base = getExpForLevel(10);
    const span = getExpForLevel(11) - base;
    const segs = expGainSegments(base, 10, base + Math.floor(span / 2));
    expect(segs).toHaveLength(1);
    expect(segs[0].level).toBe(10);
    expect(segs[0].from).toBe(0);
    expect(segs[0].to).toBeCloseTo(0.5, 2);
  });

  it('starts from where the bar already was', () => {
    const base = getExpForLevel(10);
    const span = getExpForLevel(11) - base;
    const segs = expGainSegments(base + Math.floor(span * 0.4), 10, base + Math.floor(span * 0.9));
    expect(segs).toHaveLength(1);
    expect(segs[0].from).toBeCloseTo(0.4, 2);
    expect(segs[0].to).toBeCloseTo(0.9, 2);
  });

  it('crossing one level gives fill-to-full then the remainder', () => {
    const before = getExpForLevel(11) - 10;      // 10 EXP short of level 11
    const after = getExpForLevel(11) + 100;
    const segs = expGainSegments(before, 10, after);
    expect(segs.map(s => s.level)).toEqual([10, 11]);
    expect(segs[0].to).toBe(1);
    expect(segs[1].from).toBe(0);
    expect(segs[1].to).toBeCloseTo(100 / (getExpForLevel(12) - getExpForLevel(11)), 10);
  });

  it('crossing two levels gives three segments, all but the last ending full', () => {
    const before = getExpForLevel(10);
    const after = getExpForLevel(12) + 50;
    const segs = expGainSegments(before, 10, after);
    expect(segs.map(s => s.level)).toEqual([10, 11, 12]);
    expect(segs.slice(0, -1).every(s => s.to === 1)).toBe(true);
    expect(segs.slice(1).every(s => s.from === 0)).toBe(true);
    expect(segs[2].to).toBeLessThan(1);
  });

  it('landing exactly on a threshold ends on an empty bar at the new level', () => {
    const segs = expGainSegments(getExpForLevel(10), 10, getExpForLevel(11));
    expect(segs.map(s => s.level)).toEqual([10, 11]);
    expect(segs[0].to).toBe(1);
    expect(segs[1].from).toBe(0);
    expect(segs[1].to).toBe(0);
  });

  it('is empty when there is nothing to show', () => {
    const base = getExpForLevel(10);
    expect(expGainSegments(base, 10, base)).toEqual([]);
    expect(expGainSegments(base, 10, base - 5)).toEqual([]);
  });

  it('is empty for a level 100 mon: its bar is pinned full', () => {
    const base = getExpForLevel(100);
    expect(expGainSegments(base, 100, base + 100000)).toEqual([]);
  });

  it('never runs past level 100', () => {
    const segs = expGainSegments(getExpForLevel(98), 98, getExpForLevel(100) + 999999);
    expect(segs[segs.length - 1].level).toBe(MAX_LEVEL);
    expect(segs.every(s => s.level <= MAX_LEVEL)).toBe(true);
  });

  it('matches what addExperience actually does to a mon', () => {
    // The contract that matters: the segments describe the same journey the
    // EXP system takes, level for level and ending at the real fraction.
    const mon = mockPokemon({ level: 10, exp: getExpForLevel(11) - 25 });
    const before = { exp: mon.exp, level: mon.level };
    addExperience(mon, 900);

    const segs = expGainSegments(before.exp, before.level, mon.exp);
    expect(segs[0].level).toBe(before.level);
    expect(segs[segs.length - 1].level).toBe(mon.level);
    expect(segs[segs.length - 1].level).toBe(getLevelForExp(mon.exp));
    expect(segs[segs.length - 1].to).toBeCloseTo(expProgress(mon).fraction, 10);
  });

  it('every segment is a forward run inside 0..1', () => {
    const segs = expGainSegments(getExpForLevel(30) + 1234, 30, getExpForLevel(34) + 77);
    for (const s of segs) {
      expect(s.from).toBeGreaterThanOrEqual(0);
      expect(s.to).toBeLessThanOrEqual(1);
      expect(s.to).toBeGreaterThanOrEqual(s.from);
    }
  });
});
