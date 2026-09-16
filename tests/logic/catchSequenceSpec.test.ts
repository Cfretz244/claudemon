import { describe, it, expect } from 'vitest';
import {
  CATCH_BREAK_MS, CATCH_CAUGHT_MS, CATCH_DROP_MS, CATCH_OPEN_MS, CATCH_PULL_MS,
  CATCH_RESERVE_MS, CATCH_ROCK_MS, CATCH_STILL_MS, CATCH_THROW_MS,
  MAX_CATCH_BASE_MS, MAX_CATCH_PER_SHAKE_MS,
  catchTimeline, maxCatchMs,
} from '../../src/logic/catchSequenceSpec';
import { attemptCatch } from '../../src/systems/CatchSystem';
import { mockPokemon } from '../helpers/pokemon.factory';

/**
 * The catch sequence's clock. The renderer races `cap` and plans `total`, so
 * the one thing that must never drift is `total <= budget`: if it does, the cap
 * fires mid-sequence and the player sees the ball vanish instead of opening.
 */

const SHAKE_COUNTS = [0, 1, 2, 3];

describe('catchTimeline: the phase list', () => {
  it('is throw -> open -> pull -> drop -> (rock, still) x shakes -> outcome', () => {
    expect(catchTimeline(2, false).phases.map(p => p.name)).toEqual([
      'throw', 'open', 'pull', 'drop', 'rock', 'still', 'rock', 'still', 'free',
    ]);
    expect(catchTimeline(3, true).phases.map(p => p.name)).toEqual([
      'throw', 'open', 'pull', 'drop',
      'rock', 'still', 'rock', 'still', 'rock', 'still', 'caught',
    ]);
  });

  it('has exactly one rock and one still per shake, for 0-3 shakes', () => {
    for (const shakes of SHAKE_COUNTS) {
      for (const caught of [false, true]) {
        const { phases } = catchTimeline(shakes, caught);
        expect(phases.filter(p => p.name === 'rock')).toHaveLength(shakes);
        expect(phases.filter(p => p.name === 'still')).toHaveLength(shakes);
      }
    }
  });

  it('ends on the outcome, and only on the outcome', () => {
    for (const shakes of SHAKE_COUNTS) {
      const c = catchTimeline(shakes, true).phases;
      expect(c[c.length - 1].name).toBe('caught');
      const f = catchTimeline(shakes, false).phases;
      expect(f[f.length - 1].name).toBe('free');
      for (const caught of [false, true]) {
        const outcomes = catchTimeline(shakes, caught).phases
          .filter(p => p.name === 'caught' || p.name === 'free');
        expect(outcomes).toHaveLength(1);
      }
    }
  });

  it('clamps a nonsense shake count instead of inventing phases', () => {
    expect(catchTimeline(-2, false).phases.filter(p => p.name === 'rock')).toHaveLength(0);
    expect(catchTimeline(9, false).phases.filter(p => p.name === 'rock')).toHaveLength(3);
    expect(catchTimeline(9, false).cap).toBe(maxCatchMs(3));
  });
});

describe('catchTimeline: the clock', () => {
  it('snapshots the totals for 0-3 shakes x caught / broke free', () => {
    const table = SHAKE_COUNTS.flatMap(shakes => [false, true].map(caught => {
      const t = catchTimeline(shakes, caught);
      return `${shakes} ${caught ? 'caught' : 'free  '}  total ${t.total}  budget ${t.budget}  cap ${t.cap}`;
    }));
    expect(table).toEqual([
      '0 free    total 1670  budget 2300  cap 2500',
      '0 caught  total 1610  budget 2300  cap 2500',
      '1 free    total 2370  budget 3000  cap 3200',
      '1 caught  total 2310  budget 3000  cap 3200',
      '2 free    total 3070  budget 3700  cap 3900',
      '2 caught  total 3010  budget 3700  cap 3900',
      '3 free    total 3770  budget 4400  cap 4600',
      '3 caught  total 3710  budget 4400  cap 4600',
    ]);
  });

  it('is MAX_CATCH_MS = 2500 + 700 per shake', () => {
    expect(MAX_CATCH_BASE_MS).toBe(2500);
    expect(MAX_CATCH_PER_SHAKE_MS).toBe(700);
    for (const shakes of SHAKE_COUNTS) {
      expect(maxCatchMs(shakes)).toBe(2500 + 700 * shakes);
      expect(catchTimeline(shakes, false).cap).toBe(maxCatchMs(shakes));
    }
  });

  it('leaves the whole plan inside the budget, so the cap never eats an outcome', () => {
    // The E2/E3 reserve pattern: every awaited phase rounds up to the next
    // frame, and this sequence awaits more of them than any entrance does.
    expect(CATCH_RESERVE_MS).toBeGreaterThan(0);
    for (const shakes of SHAKE_COUNTS) {
      for (const caught of [false, true]) {
        const t = catchTimeline(shakes, caught);
        expect(t.budget).toBe(t.cap - CATCH_RESERVE_MS);
        expect(t.total).toBeLessThanOrEqual(t.budget);
        // ...with room for the frame driver on top of the reserve.
        expect(t.budget - t.total).toBeGreaterThanOrEqual(400);
      }
    }
  });

  it('sums its own phases', () => {
    for (const shakes of SHAKE_COUNTS) {
      const free = catchTimeline(shakes, false);
      expect(free.total).toBe(free.phases.reduce((s, p) => s + p.ms, 0));
      expect(free.total).toBe(
        CATCH_THROW_MS + CATCH_OPEN_MS + CATCH_PULL_MS + CATCH_DROP_MS
        + shakes * (CATCH_ROCK_MS + CATCH_STILL_MS) + CATCH_BREAK_MS,
      );
      expect(catchTimeline(shakes, true).total)
        .toBe(free.total - CATCH_BREAK_MS + CATCH_CAUGHT_MS);
    }
  });

  it('adds exactly one shake period per extra shake', () => {
    for (const caught of [false, true]) {
      for (let s = 1; s <= 3; s++) {
        expect(catchTimeline(s, caught).total - catchTimeline(s - 1, caught).total)
          .toBe(CATCH_ROCK_MS + CATCH_STILL_MS);
      }
    }
  });
});

describe('catchTimeline covers what attemptCatch can actually roll', () => {
  it('has a row for every (shakes, caught) pair the Gen I roll produces', () => {
    // Gen I has no critical catch: `attemptCatch` breaks out of its shake loop
    // on the first failure and only reports caught on all three, so the pairs
    // are free/0-2 and caught/3. Each still has to fit its cap.
    const seen = new Set<string>();
    const mon = mockPokemon({
      speciesId: 19,
      stats: { hp: 20, attack: 50, defense: 50, special: 50, speed: 50 },
      currentHp: 1,
    });
    for (let i = 0; i < 400; i++) {
      const r = attemptCatch(mon, 'poke_ball');
      seen.add(`${r.shakes}${r.caught ? 'C' : 'F'}`);
      const t = catchTimeline(r.shakes, r.caught);
      expect(t.total).toBeLessThanOrEqual(t.budget);
      // The pairing itself: caught if and only if all three shakes landed.
      expect(r.caught).toBe(r.shakes === 3);
    }
    // Whatever the rolls were, every pair seen is one the timeline covers.
    for (const key of seen) {
      expect(['0F', '1F', '2F', '3C']).toContain(key);
    }
    // The MASTER BALL is the one hard-coded row, and it is caught + 3.
    const master = attemptCatch(mon, 'master_ball');
    expect(master).toEqual({ caught: true, shakes: 3 });
    const t = catchTimeline(master.shakes, master.caught);
    expect(t.cap).toBe(4600);
    expect(t.total).toBeLessThanOrEqual(t.budget);
  });
});
