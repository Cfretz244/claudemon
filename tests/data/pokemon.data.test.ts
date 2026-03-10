import { describe, it, expect } from 'vitest';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { MOVES_DATA } from '../../src/data/moves';
import { PokemonType } from '../../src/types/pokemon.types';

const allPokemonTypes = Object.values(PokemonType);

describe('POKEMON_DATA', () => {
  it('contains all 151 species (IDs 1 through 151)', () => {
    for (let id = 1; id <= 151; id++) {
      expect(POKEMON_DATA[id], `Missing species ID ${id}`).toBeDefined();
      expect(POKEMON_DATA[id].id).toBe(id);
    }
  });

  it('every species has valid types (non-empty, all PokemonType members)', () => {
    for (let id = 1; id <= 151; id++) {
      const species = POKEMON_DATA[id];
      expect(species.types.length, `Species ${species.name} (${id}) has no types`).toBeGreaterThan(0);
      for (const type of species.types) {
        expect(allPokemonTypes, `Species ${species.name} (${id}) has invalid type ${type}`).toContain(type);
      }
    }
  });

  it('every species has positive base stats', () => {
    for (let id = 1; id <= 151; id++) {
      const species = POKEMON_DATA[id];
      const stats = species.baseStats;
      expect(stats.hp, `Species ${species.name} (${id}) hp`).toBeGreaterThan(0);
      expect(stats.attack, `Species ${species.name} (${id}) attack`).toBeGreaterThan(0);
      expect(stats.defense, `Species ${species.name} (${id}) defense`).toBeGreaterThan(0);
      expect(stats.special, `Species ${species.name} (${id}) special`).toBeGreaterThan(0);
      expect(stats.speed, `Species ${species.name} (${id}) speed`).toBeGreaterThan(0);
    }
  });

  it('every learnset move ID exists in MOVES_DATA', () => {
    for (let id = 1; id <= 151; id++) {
      const species = POKEMON_DATA[id];
      for (const entry of species.learnset) {
        expect(
          MOVES_DATA[entry.moveId],
          `Species ${species.name} (${id}) has unknown learnset move ID ${entry.moveId}`,
        ).toBeDefined();
      }
    }
  });

  it('every evolution target exists in POKEMON_DATA', () => {
    for (let id = 1; id <= 151; id++) {
      const species = POKEMON_DATA[id];
      for (const evo of species.evolutions) {
        expect(
          POKEMON_DATA[evo.to],
          `Species ${species.name} (${id}) evolves to unknown ID ${evo.to}`,
        ).toBeDefined();
      }
    }
  });

  it('no self-loop evolutions', () => {
    for (let id = 1; id <= 151; id++) {
      const species = POKEMON_DATA[id];
      for (const evo of species.evolutions) {
        expect(
          evo.to,
          `Species ${species.name} (${id}) evolves to itself`,
        ).not.toBe(id);
      }
    }
  });
});
