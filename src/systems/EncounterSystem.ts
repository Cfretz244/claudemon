import { WildEncounterTable } from '../types/map.types';
import { PokemonInstance } from '../types/pokemon.types';
import { createPokemon } from '../entities/Pokemon';

export function rollEncounter(table: WildEncounterTable): PokemonInstance | null {
  if (Math.random() > table.grassRate) return null;

  const totalWeight = table.encounters.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const enc of table.encounters) {
    roll -= enc.weight;
    if (roll <= 0) {
      const level = enc.minLevel + Math.floor(Math.random() * (enc.maxLevel - enc.minLevel + 1));
      return createPokemon(enc.speciesId, level);
    }
  }

  // Fallback
  const last = table.encounters[table.encounters.length - 1];
  return createPokemon(last.speciesId, last.minLevel);
}
