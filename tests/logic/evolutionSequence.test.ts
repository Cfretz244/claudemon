import { describe, it, expect } from 'vitest';
import {
  EVO_INTRO_MS, EVO_FLASH_MS, EVO_REVEAL_MS, MAX_EVOLUTION_MS,
  STROBE_FACTOR, STROBE_FLOOR_MS, STROBE_START_MS, STROBE_TOTAL_MS,
  evolutionLines, learnsetAtLevel, queueEvolution, strobeSchedule,
} from '../../src/logic/evolutionSequence';
import { POKEMON_DATA } from '../../src/data/pokemon';

describe('strobeSchedule', () => {
  it('starts at STROBE_START_MS and accelerates', () => {
    const times = strobeSchedule();
    expect(times[0]).toBe(STROBE_START_MS);
    const gaps = times.slice(1).map((t, i) => t - times[i]);
    for (let i = 1; i < gaps.length; i++) {
      expect(gaps[i]).toBeLessThanOrEqual(gaps[i - 1]);
    }
  });

  it('never swaps faster than the floor', () => {
    const times = strobeSchedule();
    const gaps = times.slice(1).map((t, i) => t - times[i]);
    for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(STROBE_FLOOR_MS);
  });

  it('is strictly increasing and stays inside the total', () => {
    const times = strobeSchedule(STROBE_TOTAL_MS);
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThan(times[i - 1]);
    for (const t of times) expect(t).toBeLessThanOrEqual(STROBE_TOTAL_MS);
  });

  it('gives the runner something to see: well over six swaps in four seconds', () => {
    // The e2e runner asserts >= 6 texture swaps; the schedule has to beat that
    // by a wide margin or the check is measuring frame luck.
    expect(strobeSchedule().length).toBeGreaterThanOrEqual(20);
  });

  it('shrinks by STROBE_FACTOR until it hits the floor', () => {
    const times = strobeSchedule();
    expect(times[1] - times[0]).toBe(Math.round(STROBE_START_MS * STROBE_FACTOR));
  });

  it('terminates for any total, because the gap has a floor', () => {
    expect(strobeSchedule(0)).toEqual([]);
    expect(strobeSchedule(-100)).toEqual([]);
    expect(strobeSchedule(60000).length).toBeLessThan(2000);
  });

  it('is a prefix-stable plan: a longer strobe keeps the same early swaps', () => {
    const short = strobeSchedule(1000);
    const long = strobeSchedule(4000);
    expect(long.slice(0, short.length)).toEqual(short);
  });
});

describe('the timing budget', () => {
  it('fits the fixed phases inside the cap with room for the two lines', () => {
    const fixed = EVO_INTRO_MS + STROBE_TOTAL_MS + EVO_FLASH_MS + EVO_REVEAL_MS;
    expect(fixed).toBeLessThan(MAX_EVOLUTION_MS);
    expect(MAX_EVOLUTION_MS - fixed).toBeGreaterThanOrEqual(2000);
  });
});

describe('queueEvolution', () => {
  it('appends in the order the party earned it', () => {
    let q = queueEvolution([], 0, 5);
    q = queueEvolution(q, 2, 8);
    expect(q).toEqual([{ partyIndex: 0, toSpecies: 5 }, { partyIndex: 2, toSpecies: 8 }]);
  });

  it('keeps only the last answer for a slot that levelled twice', () => {
    let q = queueEvolution([], 1, 5);
    q = queueEvolution(q, 1, 6);
    expect(q).toEqual([{ partyIndex: 1, toSpecies: 6 }]);
  });

  it('moves a re-queued slot to the back but leaves the others in order', () => {
    let q = queueEvolution([], 0, 5);
    q = queueEvolution(q, 1, 8);
    q = queueEvolution(q, 0, 6);
    expect(q).toEqual([{ partyIndex: 1, toSpecies: 8 }, { partyIndex: 0, toSpecies: 6 }]);
  });

  it('does not mutate the queue it was given', () => {
    const before = [{ partyIndex: 0, toSpecies: 5 }];
    queueEvolution(before, 0, 6);
    expect(before).toEqual([{ partyIndex: 0, toSpecies: 5 }]);
  });
});

describe('learnsetAtLevel', () => {
  it('teaches the new species what it learns AT that level', () => {
    // KADABRA (64) learns CONFUSION at 16; a Lv16 ABRA that evolves gets it.
    const kadabra = POKEMON_DATA[64];
    const at16 = kadabra.learnset.filter(e => e.level === 16).map(e => e.moveId);
    expect(learnsetAtLevel(64, 16)).toEqual(at16);
    expect(at16.length).toBeGreaterThan(0);
  });

  it('is exactly-at-level, not cumulative', () => {
    const kadabra = POKEMON_DATA[64];
    const early = kadabra.learnset.find(e => e.level < 16);
    if (early) expect(learnsetAtLevel(64, 16)).not.toContain(early.moveId);
  });

  it('teaches nothing when the new species has no entry at that level', () => {
    const charmeleon = POKEMON_DATA[5];
    const levels = new Set(charmeleon.learnset.map(e => e.level));
    const empty = [...Array(50).keys()].map(i => i + 1).find(l => !levels.has(l))!;
    expect(learnsetAtLevel(5, empty)).toEqual([]);
  });

  it('returns [] for a species that does not exist', () => {
    expect(learnsetAtLevel(9999, 16)).toEqual([]);
  });

  it('only ever names real moves, for every species and level', () => {
    for (const species of Object.values(POKEMON_DATA)) {
      for (let level = 1; level <= 100; level++) {
        for (const moveId of learnsetAtLevel(species.id, level)) {
          expect(typeof moveId).toBe('number');
        }
      }
    }
  });
});

describe('evolutionLines', () => {
  it('uses what the mon is CALLED, so a nickname survives', () => {
    const lines = evolutionLines('SPARKY', 'RAICHU');
    expect(lines.evolving).toContain('SPARKY');
    expect(lines.stopped).toContain('SPARKY');
    expect(lines.congratulations).toContain('SPARKY');
    expect(lines.congratulations).toContain('RAICHU');
  });

  it('says the Gen I words', () => {
    const lines = evolutionLines('X', 'Y');
    expect(lines.evolving).toMatch(/^What\? X\nis evolving!$/);
    expect(lines.stopped).toMatch(/^Huh\? X\nstopped evolving!$/);
    expect(lines.congratulations).toMatch(/evolved\ninto Y!$/);
  });

  it('wraps every line to at most three rows of text box', () => {
    for (const line of Object.values(evolutionLines('NIDORANMALE', 'NIDORINO'))) {
      expect(line.split('\n').length).toBeLessThanOrEqual(3);
    }
  });
});
