import { describe, it, expect } from 'vitest';
import {
  SCALE,
  SIZE_OVERRIDES,
  RARE_CATCH_RATE,
  SizeClass,
  sizeClass,
  battleScale,
  evolutionStage,
} from '../../src/logic/pokemonSize';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { getShapeForSpecies } from '../../src/logic/pokemonShape';
import { PokemonSpecies, PokemonType } from '../../src/types/pokemon.types';

const ALL_IDS = Object.keys(POKEMON_DATA).map(Number).sort((a, b) => a - b);
const clsOf = (id: number) => sizeClass(id, POKEMON_DATA[id]);

/** A species row with only the fields the classifier reads. */
function fakeSpecies(over: Partial<PokemonSpecies> = {}): PokemonSpecies {
  return {
    id: 9001,
    name: 'TESTMON',
    types: [PokemonType.NORMAL],
    baseStats: { hp: 50, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 },
    baseExp: 50,
    catchRate: 255,
    learnset: [],
    evolutions: [],
    spriteColor: 0xffffff,
    ...over,
  } as PokemonSpecies;
}

describe('SCALE', () => {
  it('is one step per class, centred on M = 1', () => {
    expect(SCALE).toEqual({ S: 0.875, M: 1, L: 1.25, XL: 1.5 });
  });

  it('keeps every class a whole number of pixels tall from a 32px sprite', () => {
    for (const s of Object.values(SCALE)) expect(Number.isInteger(32 * s)).toBe(true);
  });

  it('battleScale is SCALE of the class', () => {
    expect(battleScale(6, POKEMON_DATA[6])).toBe(SCALE.XL);
    expect(battleScale(19, POKEMON_DATA[19])).toBe(SCALE.S);
    expect(battleScale(1, POKEMON_DATA[1])).toBe(SCALE[clsOf(1)]);
  });
});

describe('evolutionStage', () => {
  it('walks the real evolution table', () => {
    expect(evolutionStage(1)).toBe(0);   // BULBASAUR
    expect(evolutionStage(2)).toBe(1);   // IVYSAUR
    expect(evolutionStage(3)).toBe(2);   // VENUSAUR
    expect(evolutionStage(10)).toBe(0);  // CATERPIE
    expect(evolutionStage(12)).toBe(2);  // BUTTERFREE
  });

  it('caps at 2 and treats an unevolved species as 0', () => {
    expect(evolutionStage(143)).toBe(0); // SNORLAX evolves from nothing
    for (const id of ALL_IDS) expect(evolutionStage(id)).toBeLessThanOrEqual(2);
  });
});

describe('sizeClass', () => {
  it('lets an explicit override win over everything derived', () => {
    for (const [id, cls] of Object.entries(SIZE_OVERRIDES)) {
      expect(clsOf(Number(id))).toBe(cls);
    }
    // EEVEE is rare (catchRate 45) but 0.3 m: the override, not the floor, wins.
    expect(POKEMON_DATA[133].catchRate).toBeLessThanOrEqual(RARE_CATCH_RATE);
    expect(clsOf(133)).toBe('S');
    // MEW is the rarest thing in the game and still small.
    expect(clsOf(151)).toBe('S');
  });

  it('sizes the giants XL and the little ones S', () => {
    expect(clsOf(95)).toBe('XL');   // ONIX
    expect(clsOf(143)).toBe('XL');  // SNORLAX
    expect(clsOf(6)).toBe('XL');    // CHARIZARD, the reason this exists
    expect(clsOf(130)).toBe('XL');  // GYARADOS
    expect(clsOf(25)).toBe('S');    // PIKACHU
    expect(clsOf(50)).toBe('S');    // DIGLETT
    expect(clsOf(19)).toBe('S');    // RATTATA
  });

  it('grows with the evolution line when nothing is hand-listed', () => {
    // NIDORAN M -> NIDORINO -> NIDOKING: small basic, M mid, and the final is
    // L from the stage rule (and stays L under the rarity floor).
    expect(clsOf(32)).toBe('S');
    expect(clsOf(33)).toBe('M');
    expect(clsOf(34)).toBe('L');
    // The bug lines: small basic, M mid, L final.
    expect(clsOf(10)).toBe('S');
    expect(clsOf(11)).toBe('M');
    expect(clsOf(12)).toBe('L');
  });

  it('calls a bug/bird/round basic S and any other basic M', () => {
    const small = fakeSpecies({ id: 10, types: [PokemonType.BUG] });
    expect(getShapeForSpecies(10, POKEMON_DATA[10].types)).toBe('bug');
    expect(sizeClass(9001, fakeSpecies({ types: [PokemonType.BUG] }))).toBe('S');
    expect(sizeClass(9001, fakeSpecies({ types: [PokemonType.GROUND] }))).toBe('M');
    expect(small.types[0]).toBe(PokemonType.BUG);
  });

  it('floors a rare species at L but never demotes a bigger class', () => {
    expect(sizeClass(9001, fakeSpecies({ catchRate: RARE_CATCH_RATE }))).toBe('L');
    expect(sizeClass(9001, fakeSpecies({ catchRate: RARE_CATCH_RATE + 1, types: [PokemonType.GROUND] }))).toBe('M');
    // A NORMAL-type basic is 'round', so it is S until the floor lifts it.
    expect(sizeClass(9001, fakeSpecies({ catchRate: 255 }))).toBe('S');
    expect(sizeClass(9001, fakeSpecies({ catchRate: 10 }))).toBe('L');
    // Rare AND already XL by the hand list stays XL.
    expect(clsOf(150)).toBe('XL');
    // The rare floor is what makes the fully-evolved non-override starters big.
    for (const id of ALL_IDS) {
      if (POKEMON_DATA[id].catchRate <= RARE_CATCH_RATE && !SIZE_OVERRIDES[id]) {
        expect(['L', 'XL']).toContain(clsOf(id));
      }
    }
  });

  it('falls back to M for an unknown species', () => {
    expect(sizeClass(9999, undefined)).toBe('M');
  });

  it('answers for all 151 species, and most of the field stays M', () => {
    const counts: Record<SizeClass, number> = { S: 0, M: 0, L: 0, XL: 0 };
    for (const id of ALL_IDS) counts[clsOf(id)]++;
    expect(ALL_IDS).toHaveLength(151);
    expect(counts.S + counts.M + counts.L + counts.XL).toBe(151);
    // No class may swallow the dex: the point is contrast, not a new uniform.
    for (const c of Object.values(counts)) expect(c).toBeGreaterThan(0);
    expect(counts.XL).toBeLessThan(30);
    expect(counts).toMatchSnapshot('class counts');
  });
});

describe('the whole dex', () => {
  it('matches the pinned size table', () => {
    const table = ALL_IDS.map((id) => `${String(id).padStart(3, '0')} ${POKEMON_DATA[id].name.padEnd(12)} ${clsOf(id)}`);
    expect(table.join('\n')).toMatchSnapshot('151 size classes');
  });
});
