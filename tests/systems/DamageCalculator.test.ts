import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDamage, checkCritical, checkAccuracy } from '../../src/systems/DamageCalculator';
import { mockPokemon, mockMove } from '../helpers/pokemon.factory';
import { PokemonType, MoveCategory, StatusCondition } from '../../src/types/pokemon.types';

describe('DamageCalculator', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Default: mock random to return 0 (minimum random factor: 217/255)
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  describe('calculateDamage', () => {
    it('returns zero damage for STATUS moves', () => {
      const attacker = mockPokemon();
      const defender = mockPokemon();
      const move = mockMove({ category: MoveCategory.STATUS, power: 0 });
      const result = calculateDamage(attacker, defender, move);
      expect(result.damage).toBe(0);
      expect(result.isCritical).toBe(false);
    });

    it('returns zero damage and effectiveness 0 for immune matchups', () => {
      const attacker = mockPokemon();
      // Gastly is speciesId 92, Ghost/Poison type
      const defender = mockPokemon({ speciesId: 92 });
      const move = mockMove({ type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40 });
      const result = calculateDamage(attacker, defender, move);
      expect(result.damage).toBe(0);
      expect(result.effectiveness).toBe(0);
    });

    it('applies STAB bonus for same-type attack', () => {
      // Pikachu (speciesId 25) is Electric type
      const attacker = mockPokemon({ speciesId: 25 });
      const defender = mockPokemon({ speciesId: 19 }); // Rattata, Normal type
      const electricMove = mockMove({ type: PokemonType.ELECTRIC, category: MoveCategory.SPECIAL, power: 50 });
      const normalMove = mockMove({ type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 50 });

      const stabResult = calculateDamage(attacker, defender, electricMove);
      const nonStabResult = calculateDamage(attacker, defender, normalMove);

      expect(stabResult.damage).toBeGreaterThan(nonStabResult.damage);
    });

    it('critical hit deals more damage', () => {
      const attacker = mockPokemon();
      const defender = mockPokemon();
      const move = mockMove({ power: 50 });

      const normalResult = calculateDamage(attacker, defender, move, false);
      const critResult = calculateDamage(attacker, defender, move, true);

      expect(critResult.damage).toBeGreaterThan(normalResult.damage);
      expect(critResult.isCritical).toBe(true);
      expect(normalResult.isCritical).toBe(false);
    });

    it('physical move uses attack/defense stats', () => {
      const highAtkAttacker = mockPokemon({
        stats: { hp: 100, attack: 100, defense: 50, special: 20, speed: 50 },
      });
      const lowAtkAttacker = mockPokemon({
        stats: { hp: 100, attack: 20, defense: 50, special: 100, speed: 50 },
      });
      const defender = mockPokemon();
      const physicalMove = mockMove({ type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 50 });

      const highResult = calculateDamage(highAtkAttacker, defender, physicalMove);
      const lowResult = calculateDamage(lowAtkAttacker, defender, physicalMove);

      expect(highResult.damage).toBeGreaterThan(lowResult.damage);
    });

    it('special move uses special stat', () => {
      const highSpcAttacker = mockPokemon({
        stats: { hp: 100, attack: 20, defense: 50, special: 100, speed: 50 },
      });
      const lowSpcAttacker = mockPokemon({
        stats: { hp: 100, attack: 100, defense: 50, special: 20, speed: 50 },
      });
      const defender = mockPokemon();
      const specialMove = mockMove({ type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 50 });

      const highResult = calculateDamage(highSpcAttacker, defender, specialMove);
      const lowResult = calculateDamage(lowSpcAttacker, defender, specialMove);

      expect(highResult.damage).toBeGreaterThan(lowResult.damage);
    });

    it('enforces minimum 1 damage', () => {
      // Use very low power and high defense to get near-zero damage
      const attacker = mockPokemon({
        speciesId: 25,
        level: 2,
        stats: { hp: 20, attack: 1, defense: 1, special: 1, speed: 1 },
      });
      const defender = mockPokemon({
        stats: { hp: 200, attack: 200, defense: 200, special: 200, speed: 200 },
      });
      const weakMove = mockMove({ power: 10, type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL });

      const result = calculateDamage(attacker, defender, weakMove);
      expect(result.damage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('checkAccuracy', () => {
    it('accuracy=0 always returns true (e.g., Swift)', () => {
      const move = mockMove({ accuracy: 0 });
      // Even with unfavorable random
      randomSpy.mockReturnValue(0.99);
      expect(checkAccuracy(move)).toBe(true);
    });

    it('accuracy=100 at neutral stages: random 0.5 should hit', () => {
      randomSpy.mockReturnValue(0.5);
      const move = mockMove({ accuracy: 100 });
      // random * 100 = 50 < 100 = true
      expect(checkAccuracy(move, 0, 0)).toBe(true);
    });

    it('accuracy=100 at neutral stages: random 0.999 should hit', () => {
      randomSpy.mockReturnValue(0.999);
      const move = mockMove({ accuracy: 100 });
      // random * 100 = 99.9 < 100 = true
      expect(checkAccuracy(move, 0, 0)).toBe(true);
    });
  });

  describe('checkCritical', () => {
    it('returns true when random < baseSpeed/512', () => {
      // Pikachu base speed is 90, critRate = 90/512 ≈ 0.1758
      const attacker = mockPokemon({ speciesId: 25 });
      randomSpy.mockReturnValue(0.1);
      expect(checkCritical(attacker)).toBe(true);
    });

    it('returns false when random >= baseSpeed/512', () => {
      const attacker = mockPokemon({ speciesId: 25 });
      // 90/512 ≈ 0.1758, so 0.2 should miss
      randomSpy.mockReturnValue(0.2);
      expect(checkCritical(attacker)).toBe(false);
    });
  });
});
