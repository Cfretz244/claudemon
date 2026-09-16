/**
 * Pure, Phaser-free body-shape classifier for the 151 species.
 *
 * This used to live in `utils/spriteGenerator.ts`, which touches canvas and
 * Phaser textures; the classifier itself is plain data + a switch, and the
 * entrance animations (`logic/entranceSpec.ts`) need it in a module that can be
 * imported from a unit test without a DOM. `spriteGenerator.ts` re-exports both
 * names so its callers are unchanged.
 *
 * The shape drives how a species is drawn AND (from the entrance work onward)
 * how it arrives in battle, so a change here is visible in two snapshots.
 */

import { PokemonType } from '../types/pokemon.types';

export type PokemonShape = 'round' | 'angular' | 'tall' | 'wide' | 'bird' | 'snake' | 'bug';

// Species-specific body shape overrides (for Pokemon whose body doesn't match their type)
export const SHAPE_OVERRIDES: Record<number, PokemonShape> = {
  23: 'snake',  // Ekans
  24: 'snake',  // Arbok
  95: 'snake',  // Onix
  147: 'snake', // Dratini
  148: 'snake', // Dragonair
  138: 'round', // Omanyte
  139: 'round', // Omastar
  140: 'bug',   // Kabuto
  141: 'bug',   // Kabutops
  79: 'wide',   // Slowpoke
  80: 'tall',   // Slowbro
  143: 'wide',  // Snorlax
  113: 'round', // Chansey
};

export function getShapeForSpecies(speciesId: number, types: PokemonType[]): PokemonShape {
  const override = SHAPE_OVERRIDES[speciesId];
  if (override) return override;

  const primary = types[0];
  const secondary = types[1];

  // FLYING secondary type (except Bug primary) → bird
  if (secondary === PokemonType.FLYING && primary !== PokemonType.BUG) return 'bird';

  switch (primary) {
    case PokemonType.BUG: return 'bug';
    case PokemonType.ROCK:
    case PokemonType.GROUND:
    case PokemonType.ICE: return 'angular';
    case PokemonType.FIGHTING:
    case PokemonType.PSYCHIC:
    case PokemonType.FIRE: return 'tall';
    case PokemonType.GRASS: return 'wide';
    case PokemonType.DRAGON: return 'snake';
    default: return 'round';
  }
}
