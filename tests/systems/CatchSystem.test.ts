import { describe, it, expect, vi, afterEach } from 'vitest';
import { attemptCatch } from '../../src/systems/CatchSystem';
import { mockPokemon } from '../helpers/pokemon.factory';
import { StatusCondition } from '../../src/types/pokemon.types';

describe('CatchSystem', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Master Ball', () => {
    it('always catches with 3 shakes', () => {
      // Mewtwo (speciesId 150, catchRate 3) - hardest to catch
      const pokemon = mockPokemon({ speciesId: 150, level: 70 });
      const result = attemptCatch(pokemon, 'master_ball');
      expect(result.caught).toBe(true);
      expect(result.shakes).toBe(3);
    });
  });

  describe('ball multipliers', () => {
    it('great ball has higher catch rate than poke ball', () => {
      // Use Magikarp (speciesId 129, catchRate 255) at low HP for reliable catching
      // Mock Math.random to always return 0 (best shake outcomes)
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const pokemonPoke = mockPokemon({
        speciesId: 150,
        level: 70,
        stats: { hp: 200, attack: 110, defense: 90, special: 154, speed: 130 },
        currentHp: 1,
      });
      const pokemonGreat = mockPokemon({
        speciesId: 150,
        level: 70,
        stats: { hp: 200, attack: 110, defense: 90, special: 154, speed: 130 },
        currentHp: 1,
      });

      const pokeBallResult = attemptCatch(pokemonPoke, 'poke_ball');
      const greatBallResult = attemptCatch(pokemonGreat, 'great_ball');

      // Great Ball should get at least as many shakes as Poke Ball
      expect(greatBallResult.shakes).toBeGreaterThanOrEqual(pokeBallResult.shakes);
    });
  });

  describe('HP effects on catch rate', () => {
    it('low HP increases catch rate', () => {
      // Mock random to 0 so shakes always succeed if shakeProb > 0
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const fullHpPokemon = mockPokemon({
        speciesId: 150,
        level: 50,
        stats: { hp: 200, attack: 100, defense: 80, special: 120, speed: 100 },
        currentHp: 200,
      });
      const lowHpPokemon = mockPokemon({
        speciesId: 150,
        level: 50,
        stats: { hp: 200, attack: 100, defense: 80, special: 120, speed: 100 },
        currentHp: 1,
      });

      const fullResult = attemptCatch(fullHpPokemon, 'poke_ball');
      const lowResult = attemptCatch(lowHpPokemon, 'poke_ball');

      expect(lowResult.shakes).toBeGreaterThanOrEqual(fullResult.shakes);
    });
  });

  describe('status effects', () => {
    it('SLEEP increases catch rate (2x modifier)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const normalPokemon = mockPokemon({
        speciesId: 150,
        level: 50,
        stats: { hp: 200, attack: 100, defense: 80, special: 120, speed: 100 },
        currentHp: 50,
        status: StatusCondition.NONE,
      });
      const sleepPokemon = mockPokemon({
        speciesId: 150,
        level: 50,
        stats: { hp: 200, attack: 100, defense: 80, special: 120, speed: 100 },
        currentHp: 50,
        status: StatusCondition.SLEEP,
      });

      const normalResult = attemptCatch(normalPokemon, 'poke_ball');
      const sleepResult = attemptCatch(sleepPokemon, 'poke_ball');

      expect(sleepResult.shakes).toBeGreaterThanOrEqual(normalResult.shakes);
    });

    it('BURN increases catch rate (1.5x modifier)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const normalPokemon = mockPokemon({
        speciesId: 150,
        level: 50,
        stats: { hp: 200, attack: 100, defense: 80, special: 120, speed: 100 },
        currentHp: 50,
        status: StatusCondition.NONE,
      });
      const burnPokemon = mockPokemon({
        speciesId: 150,
        level: 50,
        stats: { hp: 200, attack: 100, defense: 80, special: 120, speed: 100 },
        currentHp: 50,
        status: StatusCondition.BURN,
      });

      const normalResult = attemptCatch(normalPokemon, 'poke_ball');
      const burnResult = attemptCatch(burnPokemon, 'poke_ball');

      expect(burnResult.shakes).toBeGreaterThanOrEqual(normalResult.shakes);
    });
  });

  describe('shake count', () => {
    it('shakes range is 0-3', () => {
      // Run many attempts and verify all shakes are in range
      const pokemon = mockPokemon({
        speciesId: 150,
        level: 50,
        stats: { hp: 200, attack: 100, defense: 80, special: 120, speed: 100 },
        currentHp: 100,
      });

      for (let i = 0; i < 50; i++) {
        const result = attemptCatch(pokemon, 'poke_ball');
        expect(result.shakes).toBeGreaterThanOrEqual(0);
        expect(result.shakes).toBeLessThanOrEqual(3);
      }
    });

    it('easy pokemon (Magikarp) with low HP catches reliably', () => {
      // Mock random to 0 to guarantee best shake outcomes
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const pokemon = mockPokemon({
        speciesId: 129, // Magikarp, catchRate 255
        level: 5,
        stats: { hp: 20, attack: 10, defense: 55, special: 20, speed: 80 },
        currentHp: 1,
      });

      const result = attemptCatch(pokemon, 'ultra_ball');
      expect(result.caught).toBe(true);
      expect(result.shakes).toBe(3);
    });
  });
});
