import { describe, it, expect } from 'vitest';
import { TRAINERS } from '../../src/data/trainers';
import { GYM_LEADERS } from '../../src/data/gymLeaders';
import { ELITE_FOUR, CHAMPION } from '../../src/data/eliteFour';
import { POKEMON_DATA } from '../../src/data/pokemon';

describe('Trainer data', () => {
  describe('TRAINERS', () => {
    it('all trainer team species exist in POKEMON_DATA', () => {
      for (const [id, trainer] of Object.entries(TRAINERS)) {
        for (const member of trainer.team) {
          expect(
            POKEMON_DATA[member.speciesId],
            `Trainer ${id} has unknown species ID ${member.speciesId}`,
          ).toBeDefined();
        }
      }
    });

    it('all trainer team levels are in [1, 100]', () => {
      for (const [id, trainer] of Object.entries(TRAINERS)) {
        for (const member of trainer.team) {
          expect(member.level, `Trainer ${id} has invalid level ${member.level}`).toBeGreaterThanOrEqual(1);
          expect(member.level, `Trainer ${id} has invalid level ${member.level}`).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('GYM_LEADERS', () => {
    it('all 8 gym leaders exist with badge strings', () => {
      const leaders = Object.values(GYM_LEADERS);
      expect(leaders.length).toBeGreaterThanOrEqual(8);
      for (const leader of leaders) {
        expect(leader.badge, `Gym leader ${leader.name} has no badge`).toBeTruthy();
        expect(typeof leader.badge).toBe('string');
      }
    });

    it('all gym leader team species exist in POKEMON_DATA', () => {
      for (const [id, leader] of Object.entries(GYM_LEADERS)) {
        for (const member of leader.team) {
          expect(
            POKEMON_DATA[member.speciesId],
            `Gym leader ${id} has unknown species ID ${member.speciesId}`,
          ).toBeDefined();
        }
      }
    });

    it('all gym leader team levels are in [1, 100]', () => {
      for (const [id, leader] of Object.entries(GYM_LEADERS)) {
        for (const member of leader.team) {
          expect(member.level, `Gym leader ${id} has invalid level`).toBeGreaterThanOrEqual(1);
          expect(member.level, `Gym leader ${id} has invalid level`).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('ELITE_FOUR', () => {
    it('all Elite Four team species exist in POKEMON_DATA', () => {
      for (const member of ELITE_FOUR) {
        for (const pokemon of member.team) {
          expect(
            POKEMON_DATA[pokemon.speciesId],
            `Elite Four ${member.name} has unknown species ID ${pokemon.speciesId}`,
          ).toBeDefined();
        }
      }
    });

    it('all Elite Four team levels are in [1, 100]', () => {
      for (const member of ELITE_FOUR) {
        for (const pokemon of member.team) {
          expect(pokemon.level, `E4 ${member.name} has invalid level`).toBeGreaterThanOrEqual(1);
          expect(pokemon.level, `E4 ${member.name} has invalid level`).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('CHAMPION', () => {
    it('all Champion team species exist in POKEMON_DATA', () => {
      for (const pokemon of CHAMPION.team) {
        expect(
          POKEMON_DATA[pokemon.speciesId],
          `Champion has unknown species ID ${pokemon.speciesId}`,
        ).toBeDefined();
      }
    });

    it('all Champion team levels are in [1, 100]', () => {
      for (const pokemon of CHAMPION.team) {
        expect(pokemon.level).toBeGreaterThanOrEqual(1);
        expect(pokemon.level).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Trainer ID uniqueness', () => {
    it('trainer IDs are unique across all data files', () => {
      const allIds: string[] = [];

      // TRAINERS
      for (const id of Object.keys(TRAINERS)) {
        allIds.push(id);
      }

      // GYM_LEADERS
      for (const id of Object.keys(GYM_LEADERS)) {
        allIds.push(id);
      }

      // ELITE_FOUR
      for (const member of ELITE_FOUR) {
        allIds.push(member.id);
      }

      // CHAMPION
      allIds.push(CHAMPION.id);

      const unique = new Set(allIds);
      expect(unique.size, `Duplicate trainer IDs found: ${allIds.filter((id, i) => allIds.indexOf(id) !== i)}`).toBe(allIds.length);
    });
  });
});
