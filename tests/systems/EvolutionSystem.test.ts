import { describe, it, expect, vi } from 'vitest';
import { checkEvolution, evolvePokemon } from '../../src/systems/EvolutionSystem';
import { mockPokemon } from '../helpers/pokemon.factory';
import { createPokemon } from '../../src/entities/Pokemon';

/** Creates a Pokemon with deterministic 0 IVs by mocking Math.random */
function makeTestPokemon(speciesId: number, level: number) {
  const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
  const pokemon = createPokemon(speciesId, level);
  spy.mockRestore();
  return pokemon;
}

describe('EvolutionSystem', () => {
  describe('checkEvolution', () => {
    it('returns null when below evolution level', () => {
      // Bulbasaur (speciesId 1) evolves to Ivysaur (2) at level 16
      const pokemon = mockPokemon({ speciesId: 1, level: 15 });
      const result = checkEvolution(pokemon);
      expect(result).toBeNull();
    });

    it('returns evolution result when at evolution level', () => {
      const pokemon = mockPokemon({ speciesId: 1, level: 16 });
      const result = checkEvolution(pokemon);
      expect(result).not.toBeNull();
      expect(result!.fromSpecies).toBe(1);
      expect(result!.toSpecies).toBe(2);
      expect(result!.fromName).toBe('BULBASAUR');
      expect(result!.toName).toBe('IVYSAUR');
    });

    it('returns evolution result when above evolution level', () => {
      const pokemon = mockPokemon({ speciesId: 1, level: 20 });
      const result = checkEvolution(pokemon);
      expect(result).not.toBeNull();
      expect(result!.toSpecies).toBe(2);
    });

    it('returns null for pokemon with no level evolution', () => {
      // Pikachu (25) only evolves via Thunder Stone (item), not level
      const pokemon = mockPokemon({ speciesId: 25, level: 99 });
      const result = checkEvolution(pokemon);
      expect(result).toBeNull();
    });

    it('returns null for fully evolved pokemon', () => {
      // Venusaur (3) has no evolutions
      const pokemon = mockPokemon({ speciesId: 3, level: 50 });
      const result = checkEvolution(pokemon);
      expect(result).toBeNull();
    });
  });

  describe('evolvePokemon', () => {
    it('changes speciesId to the target species', () => {
      // Use makeTestPokemon for stats consistent with calculateStats
      const pokemon = makeTestPokemon(1, 16);
      evolvePokemon(pokemon, 2);
      expect(pokemon.speciesId).toBe(2);
    });

    it('recalculates stats after evolution', () => {
      // Use makeTestPokemon so stats match what calculateStats produces
      const pokemon = makeTestPokemon(1, 16);
      const oldAttack = pokemon.stats.attack;
      const oldHpMax = pokemon.stats.hp;

      evolvePokemon(pokemon, 2);

      // Ivysaur has higher base stats than Bulbasaur, so stats should increase
      expect(pokemon.stats.attack).toBeGreaterThan(oldAttack);
      expect(pokemon.stats.hp).toBeGreaterThan(oldHpMax);
    });

    it('scales HP proportionally after evolution', () => {
      const pokemon = makeTestPokemon(1, 16);
      const oldMaxHp = pokemon.stats.hp;
      // Start at full HP
      pokemon.currentHp = oldMaxHp;

      evolvePokemon(pokemon, 2);

      // HP gain = new max HP - old max HP, added to current HP
      const newMaxHp = pokemon.stats.hp;
      const expectedHp = Math.min(newMaxHp, oldMaxHp + (newMaxHp - oldMaxHp));
      expect(pokemon.currentHp).toBe(expectedHp);
    });

    it('does not exceed max HP after evolution', () => {
      const pokemon = makeTestPokemon(1, 16);
      pokemon.currentHp = pokemon.stats.hp; // Full HP

      evolvePokemon(pokemon, 2);

      expect(pokemon.currentHp).toBeLessThanOrEqual(pokemon.stats.hp);
    });

    it('preserves partial HP through evolution', () => {
      const pokemon = makeTestPokemon(1, 16);
      const oldMaxHp = pokemon.stats.hp;
      // Set currentHp to half
      pokemon.currentHp = Math.floor(oldMaxHp / 2);
      const oldCurrentHp = pokemon.currentHp;

      evolvePokemon(pokemon, 2);

      const hpGain = pokemon.stats.hp - oldMaxHp;
      // Current HP should increase by the difference in max HP
      expect(pokemon.currentHp).toBe(Math.min(pokemon.stats.hp, oldCurrentHp + hpGain));
    });
  });
});
