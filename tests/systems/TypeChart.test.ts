import { describe, it, expect } from 'vitest';
import { getTypeEffectiveness, TYPE_CHART } from '../../src/data/typeChart';
import { PokemonType } from '../../src/types/pokemon.types';

describe('TypeChart', () => {
  describe('getTypeEffectiveness - single type', () => {
    it('Fire vs Grass = 2.0 (super effective)', () => {
      expect(getTypeEffectiveness(PokemonType.FIRE, [PokemonType.GRASS])).toBe(2.0);
    });

    it('Fire vs Water = 0.5 (not very effective)', () => {
      expect(getTypeEffectiveness(PokemonType.FIRE, [PokemonType.WATER])).toBe(0.5);
    });

    it('Normal vs Ghost = 0.0 (immune)', () => {
      expect(getTypeEffectiveness(PokemonType.NORMAL, [PokemonType.GHOST])).toBe(0.0);
    });
  });

  describe('getTypeEffectiveness - dual type', () => {
    it('Ground vs [Rock, Electric] = 4.0 (double super effective)', () => {
      expect(getTypeEffectiveness(PokemonType.GROUND, [PokemonType.ROCK, PokemonType.ELECTRIC])).toBe(4.0);
    });

    it('Fighting vs [Flying, Psychic] = 0.25 (double not very effective)', () => {
      expect(getTypeEffectiveness(PokemonType.FIGHTING, [PokemonType.FLYING, PokemonType.PSYCHIC])).toBe(0.25);
    });
  });

  describe('getTypeEffectiveness - immunity overrides', () => {
    it('Ground vs [Flying, Normal] = 0.0 (Flying immunity overrides)', () => {
      expect(getTypeEffectiveness(PokemonType.GROUND, [PokemonType.FLYING, PokemonType.NORMAL])).toBe(0.0);
    });
  });

  describe('Gen 1 quirks', () => {
    it('Ghost vs Psychic = 0.0 (Gen 1 bug: Ghost has no effect on Psychic)', () => {
      expect(getTypeEffectiveness(PokemonType.GHOST, [PokemonType.PSYCHIC])).toBe(0.0);
    });

    it('Bug vs Poison = 2.0 (Gen 1: Bug is super effective vs Poison)', () => {
      expect(getTypeEffectiveness(PokemonType.BUG, [PokemonType.POISON])).toBe(2.0);
    });
  });

  describe('TYPE_CHART structure', () => {
    it('has entries for all PokemonType values except those with no special interactions', () => {
      const types = Object.values(PokemonType);
      for (const type of types) {
        expect(TYPE_CHART[type]).toBeDefined();
      }
    });

    it('neutral matchup returns 1.0', () => {
      // Normal vs Normal has no entry in chart, so defaults to 1.0
      expect(getTypeEffectiveness(PokemonType.NORMAL, [PokemonType.NORMAL])).toBe(1.0);
    });
  });
});
