import { PokemonInstance } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';
import { calculateStats } from '../entities/Pokemon';

export interface EvolutionResult {
  fromSpecies: number;
  toSpecies: number;
  fromName: string;
  toName: string;
}

export function checkEvolution(pokemon: PokemonInstance): EvolutionResult | null {
  const species = POKEMON_DATA[pokemon.speciesId];
  if (!species) return null;

  for (const evo of species.evolutions) {
    if (evo.level && pokemon.level >= evo.level) {
      const toSpecies = POKEMON_DATA[evo.to];
      if (toSpecies) {
        return {
          fromSpecies: pokemon.speciesId,
          toSpecies: evo.to,
          fromName: species.name,
          toName: toSpecies.name,
        };
      }
    }
  }

  return null;
}

export function evolvePokemon(pokemon: PokemonInstance, toSpeciesId: number): void {
  const newSpecies = POKEMON_DATA[toSpeciesId];
  if (!newSpecies) return;

  const oldMaxHp = pokemon.stats.hp;
  pokemon.speciesId = toSpeciesId;

  // Recalculate stats
  pokemon.stats = calculateStats(newSpecies, pokemon.level, pokemon.ivs, pokemon.evs);

  // Scale current HP proportionally
  const hpGain = pokemon.stats.hp - oldMaxHp;
  pokemon.currentHp = Math.min(pokemon.stats.hp, pokemon.currentHp + hpGain);
}
