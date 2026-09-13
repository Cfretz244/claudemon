import { describe, it, expect } from 'vitest';
import { effectiveLearnset, inheritsPreEvolutionMoves } from '../../src/logic/learnset';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { MOVES_DATA } from '../../src/data/moves';
import { defaultMoves } from '../../src/data/battleSimConfig';
import { createPokemon } from '../../src/entities/Pokemon';

const PIKACHU = 25, RAICHU = 26, CLEFABLE = 36, NINETALES = 38, WIGGLYTUFF = 40;
const ARCANINE = 59, POLIWAG = 60, POLIWHIRL = 61, POLIWRATH = 62;
const METAPOD = 11, KAKUNA = 14, HARDEN = 106;
const VILEPLUME = 45, JOLTEON = 135;

const moveNames = (ids: number[]) => ids.map(id => MOVES_DATA[id].name);

describe('effectiveLearnset', () => {
  it('only the stone evolutions with a level-1-only learnset inherit anything', () => {
    const inheriting = Object.values(POKEMON_DATA)
      .filter(s => inheritsPreEvolutionMoves(s.id))
      .map(s => s.id);
    expect(inheriting).toEqual([RAICHU, CLEFABLE, NINETALES, WIGGLYTUFF, ARCANINE, POLIWRATH, 121]);
  });

  it('leaves a species with level-up moves of its own untouched', () => {
    for (const id of [PIKACHU, VILEPLUME, JOLTEON, POLIWAG, POLIWHIRL]) {
      expect(effectiveLearnset(id)).toBe(POKEMON_DATA[id].learnset);
    }
  });

  it('is memoized per species', () => {
    expect(effectiveLearnset(RAICHU)).toBe(effectiveLearnset(RAICHU));
  });

  it('never invents a move that is outside the chain, and stays sorted by level', () => {
    for (const species of Object.values(POKEMON_DATA)) {
      const entries = effectiveLearnset(species.id);
      const ids = entries.map(e => e.moveId);
      for (const id of ids) expect(MOVES_DATA[id]).toBeDefined();
      if (!inheritsPreEvolutionMoves(species.id)) continue;
      // Deduplicated and non-decreasing in level.
      expect(new Set(ids).size).toBe(ids.length);
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i].level).toBeGreaterThanOrEqual(entries[i - 1].level);
      }
    }
  });
});

describe('stone evolutions carry the pre-evolution moves through the stone', () => {
  it('a Lv50 RAICHU is armed exactly like the Lv50 PIKACHU it evolved from', () => {
    expect(defaultMoves(RAICHU, 50)).toEqual(defaultMoves(PIKACHU, 50));
    // Regression pin for the reported bug: this used to be GROWL / THUNDER
    // SHOCK / THUNDER WAVE, i.e. PIKACHU's level-1 moves.
    expect(moveNames(defaultMoves(RAICHU, 50)))
      .toEqual(['THUNDERBOLT', 'AGILITY', 'THUNDER', 'LIGHT SCREEN']);
  });

  it('a Lv5 RAICHU still only has the level-1 set', () => {
    const own = POKEMON_DATA[RAICHU].learnset.map(e => e.moveId);
    expect([...defaultMoves(RAICHU, 5)].sort()).toEqual([...own].sort());
  });

  it('LT. SURGE\'s Lv24 RAICHU gets level-appropriate moves', () => {
    expect(moveNames(defaultMoves(RAICHU, 24)))
      .toEqual(['TAIL WHIP', 'QUICK ATTACK', 'DOUBLE TEAM', 'SLAM']);
  });

  it('a Lv40 POLIWRATH inherits through the two-step POLIWAG -> POLIWHIRL chain', () => {
    const ids = defaultMoves(POLIWRATH, 40);
    const poliwag = new Set(POKEMON_DATA[POLIWAG].learnset.map(e => e.moveId));
    const poliwhirl = new Set(POKEMON_DATA[POLIWHIRL].learnset.map(e => e.moveId));
    // BODY SLAM (34) is a POLIWAG/POLIWHIRL level-up move POLIWRATH never lists
    // above level 1 by itself; HYPNOSIS (95) comes from the chain too.
    expect(ids).toContain(34);
    expect(ids).toContain(95);
    for (const id of ids) expect(poliwag.has(id) || poliwhirl.has(id)).toBe(true);
    expect(moveNames(ids)).toEqual(['HYPNOSIS', 'BUBBLE', 'DOUBLE SLAP', 'BODY SLAM']);
  });

  it('every affected species gains moves its own learnset never lists', () => {
    for (const id of [RAICHU, CLEFABLE, NINETALES, WIGGLYTUFF, ARCANINE, POLIWRATH, 121]) {
      const own = new Set(POKEMON_DATA[id].learnset.map(e => e.moveId));
      const high = effectiveLearnset(id).map(e => e.moveId);
      expect(high.some(m => !own.has(m))).toBe(true);
    }
  });
});

describe('level evolutions are left alone', () => {
  it('METAPOD and KAKUNA still only know HARDEN at any level', () => {
    for (const id of [METAPOD, KAKUNA]) {
      expect(effectiveLearnset(id)).toBe(POKEMON_DATA[id].learnset);
      for (const level of [1, 9, 50, 100]) {
        expect(defaultMoves(id, level)).toEqual([HARDEN]);
      }
    }
  });
});

describe('the simulator and the game build the same moves', () => {
  it('defaultMoves matches createPokemon for every species and level', () => {
    for (const species of Object.values(POKEMON_DATA)) {
      for (const level of [5, 25, 50, 100]) {
        const mon = createPokemon(species.id, level);
        expect(mon.moves.map(m => m.moveId)).toEqual(defaultMoves(species.id, level));
      }
    }
  });
});
