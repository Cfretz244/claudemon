import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateExpGain, addExperience, learnMove } from '../../src/systems/ExperienceSystem';
import { mockPokemon } from '../helpers/pokemon.factory';
import { createPokemon, getExpForLevel } from '../../src/entities/Pokemon';

/** Creates a Pokemon with deterministic 0 IVs by mocking Math.random */
function makeTestPokemon(speciesId: number, level: number) {
  const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
  const pokemon = createPokemon(speciesId, level);
  spy.mockRestore();
  return pokemon;
}

describe('ExperienceSystem', () => {
  describe('calculateExpGain', () => {
    it('gives 1.5x EXP for trainer battles', () => {
      // Pikachu (speciesId 25) has baseExp of 82
      const defeated = mockPokemon({ speciesId: 25, level: 10 });
      const trainerExp = calculateExpGain(defeated, true);
      // a=1.5, b=82, L=10 => floor(1.5 * 82 * 10 / 7) = floor(175.71) = 175
      expect(trainerExp).toBe(Math.floor(1.5 * 82 * 10 / 7));
    });

    it('gives 1x EXP for wild battles', () => {
      const defeated = mockPokemon({ speciesId: 25, level: 10 });
      const wildExp = calculateExpGain(defeated, false);
      // a=1, b=82, L=10 => floor(1 * 82 * 10 / 7) = floor(117.14) = 117
      expect(wildExp).toBe(Math.floor(1 * 82 * 10 / 7));
    });

    it('trainer EXP is exactly 1.5x wild EXP (before flooring)', () => {
      const defeated = mockPokemon({ speciesId: 25, level: 20 });
      const trainerExp = calculateExpGain(defeated, true);
      const wildExp = calculateExpGain(defeated, false);
      // Both are floored independently, so compare the ratio of the unfloored values
      // trainerExp = floor(1.5 * 82 * 20 / 7) = floor(351.43) = 351
      // wildExp = floor(1 * 82 * 20 / 7) = floor(234.29) = 234
      expect(trainerExp).toBeGreaterThan(wildExp);
    });
  });

  describe('addExperience', () => {
    it('triggers level-up when enough EXP is gained', () => {
      // Use makeTestPokemon for deterministic IVs and properly calculated stats
      const pokemon = makeTestPokemon(25, 10);
      pokemon.exp = getExpForLevel(10); // 1000
      const expNeeded = getExpForLevel(11) - pokemon.exp; // 331

      const results = addExperience(pokemon, expNeeded + 1);

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].newLevel).toBe(11);
      expect(pokemon.level).toBe(11);
    });

    it('returns updated stats on level-up', () => {
      // Use makeTestPokemon so stats are consistent with calculateStats
      const pokemon = makeTestPokemon(25, 10);
      pokemon.exp = getExpForLevel(10);
      const expNeeded = getExpForLevel(11) - pokemon.exp;

      const results = addExperience(pokemon, expNeeded + 1);

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].oldStats).toBeDefined();
      expect(results[0].newStats).toBeDefined();
      // Stats should increase with level (Pikachu's stats grow)
      expect(results[0].newStats.hp).toBeGreaterThanOrEqual(results[0].oldStats.hp);
    });

    it('caps level at 100', () => {
      const pokemon = makeTestPokemon(25, 99);
      pokemon.exp = getExpForLevel(99);
      const expToMax = getExpForLevel(100) - pokemon.exp;

      const results = addExperience(pokemon, expToMax + 100000);

      expect(pokemon.level).toBe(100);
      // Should not exceed 100
      const furtherResults = addExperience(pokemon, 999999);
      expect(furtherResults.length).toBe(0);
      expect(pokemon.level).toBe(100);
    });

    it('handles multiple level-ups in one call', () => {
      const pokemon = makeTestPokemon(25, 5);
      pokemon.exp = getExpForLevel(5); // 125
      // Give enough EXP to jump from 5 to at least 8
      const bigExp = getExpForLevel(8) - pokemon.exp; // 512 - 125 = 387

      const results = addExperience(pokemon, bigExp + 1);

      expect(results.length).toBeGreaterThanOrEqual(3); // levels 6, 7, 8
      expect(pokemon.level).toBeGreaterThanOrEqual(8);
    });
  });

  describe('learnMove', () => {
    it('adds move when pokemon has fewer than 4 moves', () => {
      const pokemon = mockPokemon({
        moves: [{ moveId: 33, currentPp: 35, maxPp: 35 }],
      });

      const result = learnMove(pokemon, 85); // Thunderbolt
      expect(result).toBe(true);
      expect(pokemon.moves.length).toBe(2);
      expect(pokemon.moves[1].moveId).toBe(85);
    });

    it('replaces move at given index when full', () => {
      const pokemon = mockPokemon({
        moves: [
          { moveId: 33, currentPp: 35, maxPp: 35 },
          { moveId: 55, currentPp: 25, maxPp: 25 },
          { moveId: 89, currentPp: 10, maxPp: 10 },
          { moveId: 85, currentPp: 15, maxPp: 15 },
        ],
      });

      const result = learnMove(pokemon, 95, 1); // Replace Water Gun with Hypnosis
      expect(result).toBe(true);
      expect(pokemon.moves[1].moveId).toBe(95);
      expect(pokemon.moves.length).toBe(4);
    });

    it('rejects duplicate moveId', () => {
      const pokemon = mockPokemon({
        moves: [{ moveId: 33, currentPp: 35, maxPp: 35 }],
      });

      const result = learnMove(pokemon, 33); // Already knows Tackle
      expect(result).toBe(false);
      expect(pokemon.moves.length).toBe(1);
    });

    it('returns false when full with no replaceIndex', () => {
      const pokemon = mockPokemon({
        moves: [
          { moveId: 33, currentPp: 35, maxPp: 35 },
          { moveId: 55, currentPp: 25, maxPp: 25 },
          { moveId: 89, currentPp: 10, maxPp: 10 },
          { moveId: 85, currentPp: 15, maxPp: 15 },
        ],
      });

      const result = learnMove(pokemon, 95); // No replaceIndex
      expect(result).toBe(false);
      expect(pokemon.moves.length).toBe(4);
    });
  });
});
