// The point of the `rng` widening, in two halves.
//
// 1. DETERMINISM: hand every randomised rule the same seeded stream twice and
//    the whole sequence — damage rolls, crits, accuracy, catch shakes, wild
//    encounters, IVs, AI choices — repeats exactly. That is what a second
//    renderer (or a replay, or a bug report) needs.
// 2. INERTNESS: calling any of them WITHOUT an `rng` still draws from
//    `Math.random` and returns exactly what the explicit form returns for the
//    same stream. No call site in the app changed, so this is the proof that
//    no call site's behaviour changed either.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SeededRandom, seededRng } from '../src/random/seed';
import { calculateDamage, checkCritical, checkAccuracy } from '../src/systems/DamageCalculator';
import { attemptCatch } from '../src/systems/CatchSystem';
import { rollEncounter, rollFishingEncounter } from '../src/systems/EncounterSystem';
import { selectAIMove } from '../src/systems/AISystem';
import { createPokemon, generateIVs } from '../src/entities/Pokemon';
import { applyPikachuGrant, applyOakStage, PIKACHU_SPECIES_ID } from '../src/logic/oakLab';
import { MOVES_DATA } from '../src/data/moves';
import { WildEncounterTable, WildEncounter } from '../src/types/map.types';
import { PokemonInstance } from '../src/types/pokemon.types';

const TABLE: WildEncounterTable = {
  grassRate: 0.5,
  encounters: [
    { speciesId: 25, minLevel: 3, maxLevel: 5, weight: 40 },
    { speciesId: 16, minLevel: 2, maxLevel: 4, weight: 50 },
    { speciesId: 19, minLevel: 2, maxLevel: 3, weight: 10 },
  ],
};
const FISHING: WildEncounter[] = [
  { speciesId: 129, minLevel: 5, maxLevel: 15, weight: 70 },
  { speciesId: 118, minLevel: 10, maxLevel: 20, weight: 30 },
];

const TACKLE = MOVES_DATA[33];
const THUNDERSHOCK = MOVES_DATA[84];

/**
 * One long mixed run over every widened entry point, driven by a single
 * stream — so an off-by-one in how many numbers any of them draws shows up as
 * a different tail, not just a different value.
 */
function sequence(rng: () => number): unknown[] {
  const out: unknown[] = [];
  const attacker = createPokemon(25, 12, 'RED', rng);
  const defender = createPokemon(1, 12, 'RED', rng);
  out.push(attacker.ivs, defender.ivs, attacker.stats, defender.stats);
  for (let i = 0; i < 12; i++) {
    out.push(checkAccuracy(TACKLE, 0, 0, rng));
    const crit = checkCritical(attacker, rng);
    out.push(crit);
    out.push(calculateDamage(attacker, defender, TACKLE, crit, undefined, undefined, rng).damage);
    out.push(calculateDamage(attacker, defender, THUNDERSHOCK, false, undefined, undefined, rng).damage);
    out.push(selectAIMove(attacker, defender, rng));
    out.push(attemptCatch({ ...defender, currentHp: 4 }, 'poke_ball', rng));
    out.push(rollEncounter(TABLE, rng));
    out.push(rollFishingEncounter(FISHING, rng));
    out.push(generateIVs(rng));
  }
  return out;
}

describe('a seeded stream replays the whole rule set', () => {
  it('same seed -> identical damage / crit / accuracy / catch / encounter sequence', () => {
    const a = sequence(seededRng(20260917));
    const b = sequence(new SeededRandom(20260917).next);
    expect(b).toEqual(a);
    // The run is long enough to be worth comparing, and not a row of nulls.
    expect(a.length).toBeGreaterThan(100);
    expect(a.filter((v) => v !== null && v !== undefined).length).toBeGreaterThan(80);
  });

  it('a different seed gives a different sequence', () => {
    expect(sequence(seededRng(1))).not.toEqual(sequence(seededRng(2)));
  });

  it('SeededRandom is uniform-ish on [0, 1) and keeps its state in one word', () => {
    const rng = seededRng(42);
    let sum = 0;
    for (let i = 0; i < 20_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 20_000).toBeGreaterThan(0.45);
    expect(sum / 20_000).toBeLessThan(0.55);
    expect(new SeededRandom(-1).state).toBe(0xffffffff);
  });
});

describe('the default is still Math.random, value for value', () => {
  afterEach(() => vi.restoreAllMocks());

  /** Runs `f` with Math.random replaced by a fresh seeded stream. */
  function underStubbedRandom<T>(seed: number, f: () => T): T {
    const spy = vi.spyOn(Math, 'random').mockImplementation(seededRng(seed));
    try {
      return f();
    } finally {
      spy.mockRestore();
    }
  }

  it('every widened function, called with no rng, draws from Math.random', () => {
    const explicit = sequence(seededRng(77));
    const implicit = underStubbedRandom(77, () => {
      const out: unknown[] = [];
      const attacker = createPokemon(25, 12);
      const defender = createPokemon(1, 12);
      out.push(attacker.ivs, defender.ivs, attacker.stats, defender.stats);
      for (let i = 0; i < 12; i++) {
        out.push(checkAccuracy(TACKLE));
        const crit = checkCritical(attacker);
        out.push(crit);
        out.push(calculateDamage(attacker, defender, TACKLE, crit).damage);
        out.push(calculateDamage(attacker, defender, THUNDERSHOCK, false).damage);
        out.push(selectAIMove(attacker, defender));
        out.push(attemptCatch({ ...defender, currentHp: 4 }));
        out.push(rollEncounter(TABLE));
        out.push(rollFishingEncounter(FISHING));
        out.push(generateIVs());
      }
      return out;
    });
    expect(implicit).toEqual(explicit);
  });

  it('the widenings are trailing and optional — old arity still compiles and runs', () => {
    // Exactly the call shapes the app uses today (BattleScene, OverworldScene,
    // the catch/encounter paths), with no extra argument.
    expect(() => {
      const mon = createPokemon(25, 5);
      checkAccuracy(TACKLE, 0, 0);
      checkCritical(mon);
      calculateDamage(mon, mon, TACKLE, false, undefined, undefined);
      attemptCatch(mon, 'great_ball');
      rollEncounter(TABLE);
      rollFishingEncounter(FISHING);
      generateIVs();
      createPokemon(25, 5, 'ASH');
    }).not.toThrow();
  });
});

describe('the Oak grant threads the same rng', () => {
  const state = () => {
    const party: PokemonInstance[] = [];
    return {
      party,
      storyFlags: {} as Record<string, boolean>,
      hasItem: () => false,
      addToParty: (p: PokemonInstance) => { party.push(p); return true; },
      addItem: () => {},
      useItem: () => true,
    };
  };

  it('applyPikachuGrant is reproducible from a seed, down to the IVs', () => {
    const a = state(); applyPikachuGrant(a, seededRng(5));
    const b = state(); applyPikachuGrant(b, seededRng(5));
    expect(a.party[0].speciesId).toBe(PIKACHU_SPECIES_ID);
    expect(a.party[0].ivs).toEqual(b.party[0].ivs);
    expect(a.party[0].ot).toBe('RED');
    expect(a.storyFlags.has_pikachu).toBe(true);
  });

  it('applyOakStage passes its rng straight through', () => {
    const a = state(); applyOakStage('give_pikachu', a, seededRng(9));
    const b = state(); applyPikachuGrant(b, seededRng(9));
    expect(a.party[0]).toEqual(b.party[0]);
  });
});
