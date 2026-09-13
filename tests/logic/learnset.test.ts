import { describe, it, expect } from 'vitest';
import { effectiveMovesAt, inheritsPreEvolutionMoves } from '../../src/logic/learnset';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { MOVES_DATA } from '../../src/data/moves';
import { defaultMoves } from '../../src/data/battleSimConfig';
import { createPokemon } from '../../src/entities/Pokemon';

const PIKACHU = 25, RAICHU = 26, CLEFAIRY = 35, CLEFABLE = 36, VULPIX = 37, NINETALES = 38;
const JIGGLYPUFF = 39, WIGGLYTUFF = 40, GROWLITHE = 58, ARCANINE = 59;
const POLIWAG = 60, POLIWHIRL = 61, POLIWRATH = 62, STARYU = 120, STARMIE = 121;
const METAPOD = 11, KAKUNA = 14, HARDEN = 106, THUNDER_WAVE = 86, METRONOME = 118;
const VILEPLUME = 45, JOLTEON = 135;

const INHERITING = [RAICHU, CLEFABLE, NINETALES, WIGGLYTUFF, ARCANINE, POLIWRATH, STARMIE];
const moveNames = (ids: number[]) => ids.map(id => MOVES_DATA[id].name);

/** What the code did before this fix: the species' own learnset, read literally. */
const ownMovesAt = (speciesId: number, level: number) =>
  POKEMON_DATA[speciesId].learnset.filter(e => e.level <= level).map(e => e.moveId);

describe('effectiveMovesAt', () => {
  it('only the stone evolutions with a level-1-only learnset inherit anything', () => {
    const inheriting = Object.values(POKEMON_DATA)
      .filter(s => inheritsPreEvolutionMoves(s.id))
      .map(s => s.id);
    expect(inheriting).toEqual(INHERITING);
  });

  it('leaves a species with level-up moves of its own untouched', () => {
    for (const id of [PIKACHU, VILEPLUME, JOLTEON, POLIWAG, POLIWHIRL, STARYU]) {
      for (const level of [1, 20, 50, 100]) {
        expect(effectiveMovesAt(id, level).map(e => e.moveId)).toEqual(ownMovesAt(id, level));
      }
    }
  });

  it('is memoized per species and level', () => {
    expect(effectiveMovesAt(RAICHU, 50)).toBe(effectiveMovesAt(RAICHU, 50));
    expect(effectiveMovesAt(RAICHU, 50)).not.toBe(effectiveMovesAt(RAICHU, 49));
  });

  it('never lists an unknown or duplicated move, and only grows with level', () => {
    for (const species of Object.values(POKEMON_DATA)) {
      const low = effectiveMovesAt(species.id, 5).map(e => e.moveId);
      const high = effectiveMovesAt(species.id, 100).map(e => e.moveId);
      for (const id of high) expect(MOVES_DATA[id]).toBeDefined();
      for (const id of low) expect(high).toContain(id);
      if (!inheritsPreEvolutionMoves(species.id)) continue;
      expect(new Set(high).size).toBe(high.length);
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

  it('the chain\'s learn level orders a move the species also lists at level 1', () => {
    // RAICHU lists THUNDER WAVE at level 1; PIKACHU learns it at 8. Keeping 8
    // is what puts it in LT. SURGE's Lv24 RAICHU's last four — read as a level-1
    // move it sorts to the front and is pushed straight back out, leaving that
    // RAICHU with no Electric move at all.
    expect(effectiveMovesAt(RAICHU, 50).find(e => e.moveId === THUNDER_WAVE))
      .toEqual({ level: 8, moveId: THUNDER_WAVE });
    expect(moveNames(defaultMoves(RAICHU, 24)))
      .toEqual(['THUNDER WAVE', 'QUICK ATTACK', 'DOUBLE TEAM', 'SLAM']);
  });

  it('a move the species lists natively is known even before the chain teaches it', () => {
    // STARYU only learns HARDEN at 22, but STARMIE lists it, so MISTY's Lv21
    // STARMIE keeps all three of the moves it has on main.
    expect(defaultMoves(STARMIE, 21)).toEqual(ownMovesAt(STARMIE, 21));
    expect(moveNames(defaultMoves(STARMIE, 21))).toEqual(['TACKLE', 'WATER GUN', 'HARDEN']);

    // Same for CLEFABLE and METRONOME, which CLEFAIRY only learns at 31.
    expect(POKEMON_DATA[CLEFAIRY].learnset.find(e => e.moveId === METRONOME)?.level).toBe(31);
    expect(defaultMoves(CLEFABLE, 29)).toContain(METRONOME);
    expect(defaultMoves(CLEFABLE, 31)).toContain(METRONOME);
  });

  it('a Lv5 RAICHU still knows all three of its native level-1 moves', () => {
    expect([...defaultMoves(RAICHU, 5)].sort())
      .toEqual([...POKEMON_DATA[RAICHU].learnset.map(e => e.moveId)].sort());
    expect(moveNames(defaultMoves(RAICHU, 5)))
      .toEqual(['THUNDER SHOCK', 'GROWL', 'THUNDER WAVE']);
  });

  it('a Lv40 POLIWRATH inherits through the two-step POLIWAG -> POLIWHIRL chain', () => {
    const ids = defaultMoves(POLIWRATH, 40);
    const chain = new Set([
      ...POKEMON_DATA[POLIWAG].learnset.map(e => e.moveId),
      ...POKEMON_DATA[POLIWHIRL].learnset.map(e => e.moveId),
    ]);
    // BODY SLAM (34) and HYPNOSIS (95) come from the chain's level-up entries.
    expect(ids).toContain(34);
    expect(ids).toContain(95);
    for (const id of ids) expect(chain.has(id)).toBe(true);
    expect(moveNames(ids)).toEqual(['HYPNOSIS', 'BUBBLE', 'DOUBLE SLAP', 'BODY SLAM']);
  });

  it('every entry comes from the chain at its own level, or is a native level-1 move', () => {
    const chains: Array<[number, number]> = [
      [RAICHU, PIKACHU], [CLEFABLE, CLEFAIRY], [NINETALES, VULPIX],
      [WIGGLYTUFF, JIGGLYPUFF], [ARCANINE, GROWLITHE], [POLIWRATH, POLIWHIRL],
      [STARMIE, STARYU],
    ];
    for (const [id, preId] of chains) {
      for (const level of [5, 25, 50, 100]) {
        const chain = new Map(effectiveMovesAt(preId, level).map(e => [e.moveId, e.level]));
        const own = POKEMON_DATA[id].learnset;
        for (const entry of effectiveMovesAt(id, level)) {
          if (chain.has(entry.moveId)) {
            expect(entry.level).toBe(chain.get(entry.moveId));
          } else {
            expect(own.some(o => o.moveId === entry.moveId && o.level <= 1)).toBe(true);
          }
        }
        // Nothing the species natively lists is ever dropped.
        const known = new Set(effectiveMovesAt(id, level).map(e => e.moveId));
        for (const o of own) expect(known.has(o.moveId)).toBe(true);
      }
    }
  });

  it('every affected species gains moves its own learnset never lists', () => {
    for (const id of INHERITING) {
      const own = new Set(POKEMON_DATA[id].learnset.map(e => e.moveId));
      expect(effectiveMovesAt(id, 100).some(e => !own.has(e.moveId))).toBe(true);
    }
  });
});

describe('level evolutions are left alone', () => {
  it('METAPOD and KAKUNA still only know HARDEN at any level', () => {
    for (const id of [METAPOD, KAKUNA]) {
      expect(inheritsPreEvolutionMoves(id)).toBe(false);
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
