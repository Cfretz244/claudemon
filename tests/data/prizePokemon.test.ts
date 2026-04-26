import { describe, it, expect } from 'vitest';
import { PRIZE_POKEMON } from '../../src/data/prizePokemon';
import { POKEMON_DATA } from '../../src/data/pokemon';

describe('PRIZE_POKEMON roster', () => {
  it('every prize references a real Pokémon species', () => {
    for (const prize of PRIZE_POKEMON) {
      expect(POKEMON_DATA[prize.speciesId], `species ${prize.speciesId} missing`).toBeDefined();
    }
  });

  it('every prize has a positive coin cost no greater than 9999 (the cap)', () => {
    for (const prize of PRIZE_POKEMON) {
      expect(prize.cost).toBeGreaterThan(0);
      expect(prize.cost).toBeLessThanOrEqual(9999);
    }
  });

  it('every prize level is between 1 and 100', () => {
    for (const prize of PRIZE_POKEMON) {
      expect(prize.level).toBeGreaterThanOrEqual(1);
      expect(prize.level).toBeLessThanOrEqual(100);
    }
  });

  it('costs are sorted ascending so the list reads cheapest-first', () => {
    for (let i = 1; i < PRIZE_POKEMON.length; i++) {
      expect(PRIZE_POKEMON[i].cost).toBeGreaterThanOrEqual(PRIZE_POKEMON[i - 1].cost);
    }
  });
});
