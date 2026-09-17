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

/**
 * The slice of `PlayerState` an evolution needs: somewhere to register the
 * species that now exists in the party. Kept structural so the system stays
 * free of the entity (and so a test can pass a two-line stub).
 */
export interface PokedexRegistry {
  markCaught(speciesId: number): void;
}

/**
 * Apply an evolution to `pokemon`.
 *
 * `pokedex` is optional only because the battle simulator and the unit tests
 * evolve a mon with no player behind it; every in-game caller passes
 * `this.playerState`. An evolved Pokemon is one you OWN, so it is registered
 * exactly as a catch is - `markCaught`, which implies seen. Without it the
 * Pokedex could show a CHARMELEON in your party and an unseen entry 5.
 */
export function evolvePokemon(
  pokemon: PokemonInstance,
  toSpeciesId: number,
  pokedex?: PokedexRegistry,
): void {
  const newSpecies = POKEMON_DATA[toSpeciesId];
  if (!newSpecies) return;

  const oldMaxHp = pokemon.stats.hp;
  pokemon.speciesId = toSpeciesId;

  // Recalculate stats
  pokemon.stats = calculateStats(newSpecies, pokemon.level, pokemon.ivs, pokemon.evs);

  // Scale current HP proportionally
  const hpGain = pokemon.stats.hp - oldMaxHp;
  pokemon.currentHp = Math.min(pokemon.stats.hp, pokemon.currentHp + hpGain);

  pokedex?.markCaught(toSpeciesId);
}
