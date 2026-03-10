import { describe, it, expect, vi, afterEach } from 'vitest';
import { rollEncounter } from '../../src/systems/EncounterSystem';
import { WildEncounterTable } from '../../src/types/map.types';

describe('EncounterSystem', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const testTable: WildEncounterTable = {
    grassRate: 0.5,
    encounters: [
      { speciesId: 25, minLevel: 3, maxLevel: 5, weight: 40 },  // Pikachu
      { speciesId: 16, minLevel: 2, maxLevel: 4, weight: 50 },  // Pidgey
      { speciesId: 19, minLevel: 2, maxLevel: 3, weight: 10 },  // Rattata
    ],
  };

  describe('encounter roll', () => {
    it('returns null when random > grassRate', () => {
      // First random call is the grassRate check: 0.9 > 0.5 => no encounter
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = rollEncounter(testTable);
      expect(result).toBeNull();
    });

    it('returns a Pokemon when random < grassRate', () => {
      // First call: grassRate check (0.01 < 0.5 => proceed)
      // Second call: weight roll
      // Third call: level roll
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01)  // grassRate check - passes
        .mockReturnValueOnce(0.5)   // weight roll
        .mockReturnValueOnce(0.5);  // level roll

      const result = rollEncounter(testTable);
      expect(result).not.toBeNull();
      expect(result!.speciesId).toBeDefined();
      expect(result!.level).toBeDefined();
    });
  });

  describe('level range', () => {
    it('Pokemon level is within the encounter min/max range', () => {
      // Force encountering first entry (Pikachu, levels 3-5)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01)  // grassRate check
        .mockReturnValueOnce(0.0)   // weight roll - picks first entry (weight 40 out of 100)
        .mockReturnValueOnce(0.0);  // level roll - picks minLevel

      const result = rollEncounter(testTable);
      expect(result).not.toBeNull();
      expect(result!.speciesId).toBe(25); // Pikachu
      expect(result!.level).toBeGreaterThanOrEqual(3);
      expect(result!.level).toBeLessThanOrEqual(5);
    });

    it('returns min level when level random is 0', () => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01)  // grassRate check
        .mockReturnValueOnce(0.0)   // weight roll
        .mockReturnValueOnce(0.0);  // level roll => minLevel + floor(0 * range) = minLevel

      const result = rollEncounter(testTable);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(3); // minLevel of first encounter
    });
  });

  describe('weight distribution', () => {
    it('higher weight encounters are selected by lower roll values', () => {
      // Total weight = 100. Pidgey has weight 50 (range 40-90 in cumulative).
      // A roll of 0.5 => 50 out of 100, which falls in Pidgey's range (40-90).
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01)   // grassRate
        .mockReturnValueOnce(0.5)    // weight roll: 50/100 = in Pidgey range
        .mockReturnValueOnce(0.0);   // level

      const result = rollEncounter(testTable);
      expect(result).not.toBeNull();
      expect(result!.speciesId).toBe(16); // Pidgey
    });

    it('low weight roll selects first encounter', () => {
      // Roll of 0.0 => 0, first encounter (Pikachu, weight 40) covers 0-40
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01)   // grassRate
        .mockReturnValueOnce(0.0)    // weight roll: 0/100 => first entry
        .mockReturnValueOnce(0.0);   // level

      const result = rollEncounter(testTable);
      expect(result).not.toBeNull();
      expect(result!.speciesId).toBe(25); // Pikachu
    });

    it('high weight roll selects last encounter', () => {
      // Roll of 0.99 => 99, last encounter (Rattata, weight 10) covers 90-100
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01)   // grassRate
        .mockReturnValueOnce(0.99)   // weight roll: 99/100 => last entry
        .mockReturnValueOnce(0.0);   // level

      const result = rollEncounter(testTable);
      expect(result).not.toBeNull();
      expect(result!.speciesId).toBe(19); // Rattata
    });
  });

  describe('edge cases', () => {
    it('returns null for grassRate of 0', () => {
      const emptyTable: WildEncounterTable = {
        grassRate: 0,
        encounters: [
          { speciesId: 25, minLevel: 3, maxLevel: 5, weight: 100 },
        ],
      };

      // Any random value > 0 will fail the grassRate check
      vi.spyOn(Math, 'random').mockReturnValue(0.01);
      const result = rollEncounter(emptyTable);
      expect(result).toBeNull();
    });
  });
});
