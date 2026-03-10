import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calcHP, calcStat, createPokemon, getExpForLevel, getLevelForExp, healPokemon, gainHappiness, loseHappiness } from '../../src/entities/Pokemon';
import { PokemonType, StatusCondition } from '../../src/types/pokemon.types';

describe('Pokemon', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    if (randomSpy) randomSpy.mockRestore();
  });

  describe('calcHP', () => {
    it('calculates HP for Pikachu-like stats (base=35, iv=8, ev=65535, level=50)', () => {
      // formula: floor(((base+iv)*2+floor(ceil(sqrt(ev))/4))*level/100) + level + 10
      // sqrt(65535) = 255.998... -> ceil = 256 -> floor(256/4) = 64
      // ((35+8)*2 + 64) * 50 / 100 = (86 + 64) * 50 / 100 = 150 * 50 / 100 = 75
      // 75 + 50 + 10 = 135
      expect(calcHP(35, 8, 65535, 50)).toBe(135);
    });

    it('calculates minimum HP at level 1 with base=1, iv=0, ev=0', () => {
      // ((1+0)*2 + 0) * 1 / 100 = 2/100 = floor(0.02) = 0
      // 0 + 1 + 10 = 11
      expect(calcHP(1, 0, 0, 1)).toBe(11);
    });

    it('calculates HP at level 100 with max IVs and EVs', () => {
      // iv=15, ev=65535, base=255
      // sqrt(65535)=255.998 -> ceil=256 -> floor(256/4)=64
      // ((255+15)*2 + 64) * 100 / 100 = (540 + 64) = 604
      // 604 + 100 + 10 = 714
      expect(calcHP(255, 15, 65535, 100)).toBe(714);
    });
  });

  describe('calcStat', () => {
    it('calculates stat for Pikachu-like stats (base=50, iv=8, ev=65535, level=50)', () => {
      // ((50+8)*2 + 64) * 50 / 100 = (116 + 64) * 50 / 100 = 180 * 50 / 100 = 90
      // 90 + 5 = 95
      expect(calcStat(50, 8, 65535, 50)).toBe(95);
    });

    it('calculates minimum stat at level 1 with base=1, iv=0, ev=0', () => {
      // ((1+0)*2 + 0) * 1 / 100 = floor(0.02) = 0
      // 0 + 5 = 5
      expect(calcStat(1, 0, 0, 1)).toBe(5);
    });

    it('calculates stat at level 100 with max IVs and EVs', () => {
      // iv=15, ev=65535, base=255
      // ((255+15)*2 + 64) * 100 / 100 = 604
      // 604 + 5 = 609
      expect(calcStat(255, 15, 65535, 100)).toBe(609);
    });
  });

  describe('createPokemon', () => {
    it('returns a Pokemon with correct species and level', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      expect(pokemon.speciesId).toBe(25);
      expect(pokemon.level).toBe(50);
    });

    it('has at least 1 move', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      expect(pokemon.moves.length).toBeGreaterThanOrEqual(1);
    });

    it('sets status to NONE', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      expect(pokemon.status).toBe(StatusCondition.NONE);
    });

    it('sets default OT to RED', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      expect(pokemon.ot).toBe('RED');
    });

    it('uses custom OT when provided', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50, 'ASH');
      expect(pokemon.ot).toBe('ASH');
    });

    it('sets exp equal to level^3', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      expect(pokemon.exp).toBe(50 * 50 * 50);
    });

    it('currentHp equals max HP', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      expect(pokemon.currentHp).toBe(pokemon.stats.hp);
    });
  });

  describe('getExpForLevel / getLevelForExp', () => {
    it('getExpForLevel returns level cubed', () => {
      expect(getExpForLevel(1)).toBe(1);
      expect(getExpForLevel(5)).toBe(125);
      expect(getExpForLevel(10)).toBe(1000);
      expect(getExpForLevel(100)).toBe(1000000);
    });

    it('getLevelForExp roundtrip', () => {
      expect(getLevelForExp(getExpForLevel(50))).toBe(50);
      expect(getLevelForExp(getExpForLevel(1))).toBe(1);
      expect(getLevelForExp(getExpForLevel(99))).toBe(99);
    });

    it('getLevelForExp caps at level 100', () => {
      expect(getLevelForExp(9999999)).toBe(100);
    });

    it('getLevelForExp returns correct level for in-between exp', () => {
      // Between level 5 (125) and level 6 (216)
      expect(getLevelForExp(200)).toBe(5);
    });
  });

  describe('healPokemon', () => {
    it('restores HP to max', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      pokemon.currentHp = 1;
      healPokemon(pokemon);
      expect(pokemon.currentHp).toBe(pokemon.stats.hp);
    });

    it('clears status condition', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      pokemon.status = StatusCondition.BURN;
      healPokemon(pokemon);
      expect(pokemon.status).toBe(StatusCondition.NONE);
    });

    it('restores PP for all moves', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      for (const move of pokemon.moves) {
        move.currentPp = 0;
      }
      healPokemon(pokemon);
      for (const move of pokemon.moves) {
        expect(move.currentPp).toBe(move.maxPp);
      }
    });
  });

  describe('gainHappiness', () => {
    it('increases happiness', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      pokemon.happiness = 70;
      gainHappiness(pokemon, 10);
      expect(pokemon.happiness).toBe(80);
    });

    it('caps happiness at 255', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      pokemon.happiness = 250;
      gainHappiness(pokemon, 20);
      expect(pokemon.happiness).toBe(255);
    });
  });

  describe('loseHappiness', () => {
    it('decreases happiness', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      pokemon.happiness = 70;
      loseHappiness(pokemon, 10);
      expect(pokemon.happiness).toBe(60);
    });

    it('floors happiness at 0', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const pokemon = createPokemon(25, 50);
      pokemon.happiness = 5;
      loseHappiness(pokemon, 20);
      expect(pokemon.happiness).toBe(0);
    });
  });
});
