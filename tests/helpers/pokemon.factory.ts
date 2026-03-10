import { vi } from 'vitest';
import { createPokemon } from '../../src/entities/Pokemon';
import { PokemonInstance, MoveData, PokemonType, MoveCategory, StatusCondition, BaseStats } from '../../src/types/pokemon.types';

/**
 * Creates a test Pokemon with deterministic IVs (all 0 when Math.random mocked to 0).
 */
export function createTestPokemon(speciesId: number, level: number): PokemonInstance {
  const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
  const pokemon = createPokemon(speciesId, level);
  spy.mockRestore();
  return pokemon;
}

/**
 * Creates a minimal MoveData for testing.
 */
export function mockMove(overrides: Partial<MoveData> = {}): MoveData {
  return {
    id: 1,
    name: 'Test Move',
    type: PokemonType.NORMAL,
    category: MoveCategory.PHYSICAL,
    power: 50,
    accuracy: 100,
    pp: 20,
    ...overrides,
  };
}

/**
 * Creates a minimal PokemonInstance for testing (no data dependency).
 */
export function mockPokemon(overrides: Partial<PokemonInstance> = {}): PokemonInstance {
  const stats: BaseStats = overrides.stats ?? { hp: 100, attack: 50, defense: 50, special: 50, speed: 50 };
  return {
    speciesId: 25, // Pikachu
    level: 50,
    currentHp: stats.hp,
    stats,
    ivs: { hp: 0, attack: 0, defense: 0, special: 0, speed: 0 },
    evs: { hp: 0, attack: 0, defense: 0, special: 0, speed: 0 },
    moves: [{ moveId: 33, currentPp: 35, maxPp: 35 }], // Tackle
    exp: 125000,
    status: StatusCondition.NONE,
    ot: 'TEST',
    happiness: 70,
    ...overrides,
  };
}
