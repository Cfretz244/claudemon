import { describe, it, expect } from 'vitest';
import { MOVES_DATA } from '../../src/data/moves';
import { PokemonType, MoveCategory } from '../../src/types/pokemon.types';

const allPokemonTypes = Object.values(PokemonType);
const allMoveCategories = Object.values(MoveCategory);

describe('MOVES_DATA', () => {
  const moveEntries = Object.entries(MOVES_DATA);

  it('has at least one move defined', () => {
    expect(moveEntries.length).toBeGreaterThan(0);
  });

  it('all moves have valid type (PokemonType enum member)', () => {
    for (const [id, move] of moveEntries) {
      expect(
        allPokemonTypes,
        `Move ${move.name} (${id}) has invalid type ${move.type}`,
      ).toContain(move.type);
    }
  });

  it('all moves have valid category (MoveCategory enum member)', () => {
    for (const [id, move] of moveEntries) {
      expect(
        allMoveCategories,
        `Move ${move.name} (${id}) has invalid category ${move.category}`,
      ).toContain(move.category);
    }
  });

  it('all moves have power >= 0', () => {
    for (const [id, move] of moveEntries) {
      expect(
        move.power,
        `Move ${move.name} (${id}) has negative power`,
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it('all moves have accuracy in [0, 100]', () => {
    for (const [id, move] of moveEntries) {
      expect(
        move.accuracy,
        `Move ${move.name} (${id}) accuracy out of range`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        move.accuracy,
        `Move ${move.name} (${id}) accuracy out of range`,
      ).toBeLessThanOrEqual(100);
    }
  });

  it('all moves have pp > 0', () => {
    for (const [id, move] of moveEntries) {
      expect(
        move.pp,
        `Move ${move.name} (${id}) has non-positive pp`,
      ).toBeGreaterThan(0);
    }
  });

  it('STATUS moves have power = 0', () => {
    for (const [id, move] of moveEntries) {
      if (move.category === MoveCategory.STATUS) {
        expect(
          move.power,
          `STATUS move ${move.name} (${id}) should have power 0 but has ${move.power}`,
        ).toBe(0);
      }
    }
  });
});
