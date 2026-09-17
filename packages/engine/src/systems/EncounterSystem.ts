// Randomness is injected: every function that draws a random number takes an
// optional TRAILING `rng: () => number` defaulting to `Math.random`, so the
// Phaser call sites are unchanged while a seeded consumer (`random/seed.ts`)
// can replay the same sequence. See `packages/engine/tests/determinism.test.ts`.
import { WildEncounterTable, WildEncounter } from '../types/map.types';
import { PokemonInstance } from '../types/pokemon.types';
import { createPokemon } from '../entities/Pokemon';

export function rollEncounter(table: WildEncounterTable, rng: () => number = Math.random): PokemonInstance | null {
  if (rng() > table.grassRate) return null;

  const totalWeight = table.encounters.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng() * totalWeight;

  for (const enc of table.encounters) {
    roll -= enc.weight;
    if (roll <= 0) {
      const level = enc.minLevel + Math.floor(rng() * (enc.maxLevel - enc.minLevel + 1));
      return createPokemon(enc.speciesId, level, 'RED', rng);
    }
  }

  // Fallback
  const last = table.encounters[table.encounters.length - 1];
  return createPokemon(last.speciesId, last.minLevel, 'RED', rng);
}

export function rollFishingEncounter(encounters: WildEncounter[], rng: () => number = Math.random): PokemonInstance | null {
  // 50% chance of no bite
  if (rng() < 0.5) return null;

  const totalWeight = encounters.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng() * totalWeight;

  for (const enc of encounters) {
    roll -= enc.weight;
    if (roll <= 0) {
      const level = enc.minLevel + Math.floor(rng() * (enc.maxLevel - enc.minLevel + 1));
      return createPokemon(enc.speciesId, level, 'RED', rng);
    }
  }

  // Fallback
  const last = encounters[encounters.length - 1];
  return createPokemon(last.speciesId, last.minLevel, 'RED', rng);
}
