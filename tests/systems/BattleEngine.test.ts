import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { canFight, getFirstAlivePokemon, isPartyDefeated, calculateRunChance, applyEndTurnStatus } from '../../src/systems/BattleEngine';
import { mockPokemon } from '../helpers/pokemon.factory';
import { StatusCondition } from '../../src/types/pokemon.types';

describe('BattleEngine', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    if (randomSpy) randomSpy.mockRestore();
  });

  describe('canFight', () => {
    it('returns true when HP > 0', () => {
      const pokemon = mockPokemon({ currentHp: 50 });
      expect(canFight(pokemon)).toBe(true);
    });

    it('returns false when HP = 0', () => {
      const pokemon = mockPokemon({ currentHp: 0 });
      expect(canFight(pokemon)).toBe(false);
    });
  });

  describe('getFirstAlivePokemon', () => {
    it('returns index of first Pokemon with HP > 0', () => {
      const party = [
        mockPokemon({ currentHp: 0 }),
        mockPokemon({ currentHp: 0 }),
        mockPokemon({ currentHp: 50 }),
      ];
      expect(getFirstAlivePokemon(party)).toBe(2);
    });

    it('returns 0 if first Pokemon is alive', () => {
      const party = [
        mockPokemon({ currentHp: 100 }),
        mockPokemon({ currentHp: 50 }),
      ];
      expect(getFirstAlivePokemon(party)).toBe(0);
    });

    it('returns -1 if all Pokemon are fainted', () => {
      const party = [
        mockPokemon({ currentHp: 0 }),
        mockPokemon({ currentHp: 0 }),
      ];
      expect(getFirstAlivePokemon(party)).toBe(-1);
    });
  });

  describe('isPartyDefeated', () => {
    it('returns true when all Pokemon are fainted', () => {
      const party = [
        mockPokemon({ currentHp: 0 }),
        mockPokemon({ currentHp: 0 }),
      ];
      expect(isPartyDefeated(party)).toBe(true);
    });

    it('returns false when at least one Pokemon is alive', () => {
      const party = [
        mockPokemon({ currentHp: 0 }),
        mockPokemon({ currentHp: 1 }),
      ];
      expect(isPartyDefeated(party)).toBe(false);
    });

    it('returns true for empty party', () => {
      expect(isPartyDefeated([])).toBe(true);
    });
  });

  describe('applyEndTurnStatus', () => {
    it('burn deals floor(maxHP/16) damage, minimum 1', () => {
      const pokemon = mockPokemon({
        currentHp: 100,
        stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 50 },
        status: StatusCondition.BURN,
      });
      // floor(100/16) = 6
      expect(applyEndTurnStatus(pokemon)).toBe(6);
    });

    it('poison deals floor(maxHP/16) damage, minimum 1', () => {
      const pokemon = mockPokemon({
        currentHp: 100,
        stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 50 },
        status: StatusCondition.POISON,
      });
      expect(applyEndTurnStatus(pokemon)).toBe(6);
    });

    it('burn/poison minimum damage is 1 for low HP Pokemon', () => {
      const pokemon = mockPokemon({
        currentHp: 10,
        stats: { hp: 10, attack: 5, defense: 5, special: 5, speed: 5 },
        status: StatusCondition.BURN,
      });
      // floor(10/16) = 0, but min is 1
      expect(applyEndTurnStatus(pokemon)).toBe(1);
    });

    it('returns 0 for no status condition', () => {
      const pokemon = mockPokemon({ status: StatusCondition.NONE });
      expect(applyEndTurnStatus(pokemon)).toBe(0);
    });

    it('returns 0 for fainted Pokemon', () => {
      const pokemon = mockPokemon({
        currentHp: 0,
        status: StatusCondition.BURN,
      });
      expect(applyEndTurnStatus(pokemon)).toBe(0);
    });

    it('returns 0 for paralysis (no end-turn damage)', () => {
      const pokemon = mockPokemon({
        currentHp: 100,
        status: StatusCondition.PARALYSIS,
      });
      expect(applyEndTurnStatus(pokemon)).toBe(0);
    });
  });

  describe('calculateRunChance', () => {
    it('higher player speed increases run chance', () => {
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      // escapeChance = ((200*32) / ((50/4)%256)) + 30*1 = (6400/12) + 30 ≈ 563
      // random * 256 = 128 < 563 → true
      expect(calculateRunChance(200, 50, 1)).toBe(true);
    });

    it('lower player speed decreases run chance', () => {
      // escapeChance = ((10*32) / ((200/4)%256)) + 30*1 = (320/50) + 30 = 6.4 + 30 = 36.4
      // random * 256 = 255.744 >= 36.4 → false
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999);
      expect(calculateRunChance(10, 200, 1)).toBe(false);
    });

    it('more attempts increase run chance', () => {
      // escapeChance = ((10*32) / ((200/4)%256)) + 30*10 = 6.4 + 300 = 306.4
      // random * 256 = 128 < 306.4 → true
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
      expect(calculateRunChance(10, 200, 10)).toBe(true);
    });

    it('first attempt with very low speed can fail', () => {
      // escapeChance = ((5*32) / ((200/4)%256)) + 30*1 = (160/50) + 30 = 3.2 + 30 = 33.2
      // random * 256 = 230.4 >= 33.2 → false
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9);
      expect(calculateRunChance(5, 200, 1)).toBe(false);
    });
  });
});
