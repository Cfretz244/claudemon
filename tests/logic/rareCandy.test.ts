import { describe, it, expect } from 'vitest';
import { rareCandyResult } from '../../src/logic/rareCandy';
import { addExperience } from '../../src/systems/ExperienceSystem';
import { getExpForLevel } from '../../src/entities/Pokemon';
import { mockPokemon, createTestPokemon } from '../helpers/pokemon.factory';

/**
 * A RARE CANDY is worth exactly one level.
 *
 * The bag used to spend `addExperience(pokemon, 999999)` on it, which walks
 * the level-up loop until it runs out of thresholds - one candy took any mon
 * to Lv100. The helper returns the EXP total to land on instead, and these
 * tests pin the two halves of that: the number it returns, and the fact that
 * feeding that number to `addExperience` produces exactly one level-up.
 */
describe('rareCandyResult', () => {
  it('Lv5 -> the Lv6 threshold exactly', () => {
    const result = rareCandyResult(mockPokemon({ level: 5, exp: getExpForLevel(5) }));
    expect(result.ok).toBe(true);
    expect(result.newExp).toBe(216); // 6^3
    expect(result.newExp).toBe(getExpForLevel(6));
    expect(result.reason).toBeUndefined();
  });

  it('Lv99 -> the Lv100 threshold', () => {
    const result = rareCandyResult(mockPokemon({ level: 99, exp: getExpForLevel(99) }));
    expect(result.ok).toBe(true);
    expect(result.newExp).toBe(1000000); // 100^3
  });

  it('Lv100 -> no effect, and no new EXP to apply', () => {
    const result = rareCandyResult(mockPokemon({ level: 100, exp: getExpForLevel(100) }));
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('max_level');
    expect(result.newExp).toBeUndefined();
  });

  it('mid-level EXP is raised to the next threshold exactly, not by a fixed amount', () => {
    // Half way through Lv20: 8000 + (9261 - 8000) / 2.
    const exp = getExpForLevel(20) + Math.floor((getExpForLevel(21) - getExpForLevel(20)) / 2);
    const result = rareCandyResult(mockPokemon({ level: 20, exp }));
    expect(result.newExp).toBe(9261); // 21^3, whatever the mon had before
  });

  it('is a pure read: it does not touch the Pokemon', () => {
    const pokemon = mockPokemon({ level: 5, exp: 130 });
    rareCandyResult(pokemon);
    expect(pokemon.level).toBe(5);
    expect(pokemon.exp).toBe(130);
  });
});

describe('applying the result through addExperience', () => {
  /** What `BagScreen` does with the answer. */
  function feedCandy(pokemon: ReturnType<typeof createTestPokemon>) {
    const result = rareCandyResult(pokemon);
    if (!result.ok) return [];
    return addExperience(pokemon, result.newExp! - pokemon.exp);
  }

  it('raises the level by exactly one from mid-level EXP', () => {
    const pokemon = createTestPokemon(4, 15); // CHARMANDER
    pokemon.exp = getExpForLevel(15) + 500;
    const levelUps = feedCandy(pokemon);
    expect(levelUps).toHaveLength(1);
    expect(pokemon.level).toBe(16);
    expect(pokemon.exp).toBe(4096); // 16^3, the start of Lv16
  });

  it('one candy is one level, not a trip to Lv100', () => {
    const pokemon = createTestPokemon(4, 15);
    feedCandy(pokemon);
    feedCandy(pokemon);
    feedCandy(pokemon);
    expect(pokemon.level).toBe(18);
    expect(pokemon.exp).toBe(getExpForLevel(18));
  });

  it('reports the moves of the new level, so the bag can offer them', () => {
    // CHARMANDER learns EMBER at 9.
    const pokemon = createTestPokemon(4, 8);
    pokemon.moves = [{ moveId: 10, currentPp: 35, maxPp: 35 }]; // SCRATCH only
    const levelUps = feedCandy(pokemon);
    expect(levelUps).toHaveLength(1);
    expect(levelUps[0].newLevel).toBe(9);
    expect(levelUps[0].newMoves).toContain(52); // EMBER
  });

  it('recalculates the stats and adds the HP the level brought', () => {
    const pokemon = createTestPokemon(4, 15);
    const before = { ...pokemon.stats };
    pokemon.currentHp = 1;
    const levelUps = feedCandy(pokemon);
    expect(pokemon.stats.hp).toBeGreaterThan(before.hp);
    expect(pokemon.currentHp).toBe(1 + (pokemon.stats.hp - before.hp));
    expect(levelUps[0].oldStats.hp).toBe(before.hp);
  });

  it('does nothing at all at Lv100', () => {
    const pokemon = createTestPokemon(4, 100);
    const exp = pokemon.exp;
    expect(feedCandy(pokemon)).toHaveLength(0);
    expect(pokemon.level).toBe(100);
    expect(pokemon.exp).toBe(exp);
  });
});
