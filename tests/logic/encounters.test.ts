import { describe, it, expect } from 'vitest';
import { pickWildEncounter, getEncounterTheme } from '../../src/logic/encounters';
import { WildEncounterTable } from '../../src/types/map.types';

function seq(...values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

const TABLE: WildEncounterTable = {
  grassRate: 0.5,
  encounters: [
    { speciesId: 16, minLevel: 2, maxLevel: 5, weight: 50 },  // Pidgey
    { speciesId: 19, minLevel: 2, maxLevel: 4, weight: 40 },  // Rattata
    { speciesId: 25, minLevel: 3, maxLevel: 5, weight: 10 },  // Pikachu
  ],
};

describe('pickWildEncounter', () => {
  it('low roll picks the first (heaviest) entry', () => {
    // roll = 0.1*100 = 10 <= 50 -> Pidgey; level = 2 + floor(0*4) = 2
    expect(pickWildEncounter(TABLE, seq(0.1, 0))).toEqual({ speciesId: 16, level: 2 });
  });

  it('mid roll lands in the second bucket', () => {
    // roll = 0.6*100 = 60; 60-50=10 <= 40 -> Rattata
    expect(pickWildEncounter(TABLE, seq(0.6, 0))?.speciesId).toBe(19);
  });

  it('high roll lands in the rare bucket', () => {
    // roll = 0.95*100 = 95; -50 -> 45; -40 -> 5 <= 10 -> Pikachu
    expect(pickWildEncounter(TABLE, seq(0.95, 0))?.speciesId).toBe(25);
  });

  it('level spans the full [min, max] range inclusive', () => {
    // rng->0.999: level = 2 + floor(0.999*4) = 5
    expect(pickWildEncounter(TABLE, seq(0.1, 0.999))?.level).toBe(5);
  });

  it('returns null for an empty table', () => {
    expect(pickWildEncounter({ grassRate: 1, encounters: [] }, seq(0.5))).toBeNull();
  });
});

describe('getEncounterTheme', () => {
  it('rival ids get the rival theme', () => {
    expect(getEncounterTheme('rival_route22')).toBe('rival_theme');
  });

  it('Team Rocket trainers get the evil theme', () => {
    expect(getEncounterTheme('mt_moon_rocket1')).toBe('evil_encounter');
  });

  it('unknown trainers fall back to the default theme', () => {
    expect(getEncounterTheme('nobody_in_particular')).toBe('trainer_encounter');
  });
});
