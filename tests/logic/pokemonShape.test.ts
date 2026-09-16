import { describe, it, expect } from 'vitest';
import { getShapeForSpecies, SHAPE_OVERRIDES, PokemonShape } from '../../src/logic/pokemonShape';
import * as spriteGenerator from '../../src/utils/spriteGenerator';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { PokemonType } from '../../src/types/pokemon.types';

const ALL_IDS = Object.keys(POKEMON_DATA).map(Number).sort((a, b) => a - b);

/**
 * A verbatim copy of the classifier as it stood in `utils/spriteGenerator.ts`
 * before it moved to `logic/pokemonShape.ts`. The move was meant to be a pure
 * relocation — three callers (BattleScene, PokedexScreen, PrizeExchangeScreen)
 * still import it from spriteGenerator and every one of the 151 sprites is
 * drawn from its answer — so this pins "the move changed nothing".
 */
function shapeBeforeTheMove(speciesId: number, types: PokemonType[]): PokemonShape {
  const overrides: Record<number, PokemonShape> = {
    23: 'snake', 24: 'snake', 95: 'snake', 147: 'snake', 148: 'snake',
    138: 'round', 139: 'round', 140: 'bug', 141: 'bug',
    79: 'wide', 80: 'tall', 143: 'wide', 113: 'round',
  };
  const override = overrides[speciesId];
  if (override) return override;

  const primary = types[0];
  const secondary = types[1];
  if (secondary === PokemonType.FLYING && primary !== PokemonType.BUG) return 'bird';

  switch (primary) {
    case PokemonType.BUG: return 'bug';
    case PokemonType.ROCK:
    case PokemonType.GROUND:
    case PokemonType.ICE: return 'angular';
    case PokemonType.FIGHTING:
    case PokemonType.PSYCHIC:
    case PokemonType.FIRE: return 'tall';
    case PokemonType.GRASS: return 'wide';
    case PokemonType.DRAGON: return 'snake';
    default: return 'round';
  }
}

describe('pokemonShape — the move out of spriteGenerator changed nothing', () => {
  it('gives every one of the 151 species the shape it had before', () => {
    expect(ALL_IDS.length).toBe(151);
    for (const id of ALL_IDS) {
      const species = POKEMON_DATA[id];
      expect(getShapeForSpecies(id, species.types), `${id} ${species.name}`)
        .toBe(shapeBeforeTheMove(id, species.types));
    }
  });

  it('is still reachable from spriteGenerator, which three callers import it from', () => {
    expect(spriteGenerator.getShapeForSpecies).toBe(getShapeForSpecies);
    expect(spriteGenerator.SHAPE_OVERRIDES).toBe(SHAPE_OVERRIDES);
  });

  it('keeps all 13 hand-picked overrides', () => {
    expect(Object.keys(SHAPE_OVERRIDES).length).toBe(13);
    for (const [idStr, shape] of Object.entries(SHAPE_OVERRIDES)) {
      const id = Number(idStr);
      expect(POKEMON_DATA[id], `override ${id} is a real species`).toBeDefined();
      expect(getShapeForSpecies(id, POKEMON_DATA[id].types)).toBe(shape);
    }
  });
});

describe('pokemonShape — the type fallbacks', () => {
  it('sends a FLYING secondary to bird unless the primary is BUG', () => {
    expect(getShapeForSpecies(16, [PokemonType.NORMAL, PokemonType.FLYING])).toBe('bird');
    // Butterfree: BUG/FLYING stays a bug.
    expect(getShapeForSpecies(12, [PokemonType.BUG, PokemonType.FLYING])).toBe('bug');
  });

  it('maps each primary type to its shape', () => {
    const cases: [PokemonType, PokemonShape][] = [
      [PokemonType.BUG, 'bug'],
      [PokemonType.ROCK, 'angular'],
      [PokemonType.GROUND, 'angular'],
      [PokemonType.ICE, 'angular'],
      [PokemonType.FIGHTING, 'tall'],
      [PokemonType.PSYCHIC, 'tall'],
      [PokemonType.FIRE, 'tall'],
      [PokemonType.GRASS, 'wide'],
      [PokemonType.DRAGON, 'snake'],
      [PokemonType.NORMAL, 'round'],
      [PokemonType.WATER, 'round'],
      [PokemonType.ELECTRIC, 'round'],
      [PokemonType.POISON, 'round'],
      [PokemonType.GHOST, 'round'],
      [PokemonType.FLYING, 'round'],
    ];
    for (const [type, shape] of cases) {
      expect(getShapeForSpecies(9999, [type]), type).toBe(shape);
    }
  });

  it('covers all 15 types, so no species can fall off the end', () => {
    for (const type of Object.values(PokemonType)) {
      expect(getShapeForSpecies(9999, [type])).toBeTruthy();
    }
  });
});

describe('pokemonShape — full table snapshot', () => {
  it('matches the recorded 151-row speciesId -> shape table', () => {
    const rows = ALL_IDS.map(id => {
      const species = POKEMON_DATA[id];
      return [
        String(id).padStart(3, ' '),
        species.name.padEnd(12, ' '),
        species.types.join('/').padEnd(17, ' '),
        getShapeForSpecies(id, species.types).padEnd(7, ' '),
        id in SHAPE_OVERRIDES ? 'override' : '-',
      ].join(' ');
    });
    expect(rows.join('\n')).toMatchSnapshot();
  });
});
