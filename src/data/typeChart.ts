import { PokemonType } from '../types/pokemon.types';

// Gen 1 type effectiveness matrix
// Key: attacking type, Value: map of defending type to multiplier
// Missing entries = 1.0 (neutral)
// Gen 1 quirks: Ghost has NO EFFECT on Psychic (bug), Bug SE vs Poison

const SE = 2.0;   // Super effective
const NVE = 0.5;  // Not very effective
const IMM = 0.0;  // Immune (no effect)

type TypeChart = Record<PokemonType, Partial<Record<PokemonType, number>>>;

export const TYPE_CHART: TypeChart = {
  [PokemonType.NORMAL]: {
    [PokemonType.ROCK]: NVE,
    [PokemonType.GHOST]: IMM,
  },
  [PokemonType.FIRE]: {
    [PokemonType.FIRE]: NVE,
    [PokemonType.WATER]: NVE,
    [PokemonType.GRASS]: SE,
    [PokemonType.ICE]: SE,
    [PokemonType.BUG]: SE,
    [PokemonType.ROCK]: NVE,
    [PokemonType.DRAGON]: NVE,
  },
  [PokemonType.WATER]: {
    [PokemonType.FIRE]: SE,
    [PokemonType.WATER]: NVE,
    [PokemonType.GRASS]: NVE,
    [PokemonType.GROUND]: SE,
    [PokemonType.ROCK]: SE,
    [PokemonType.DRAGON]: NVE,
  },
  [PokemonType.ELECTRIC]: {
    [PokemonType.WATER]: SE,
    [PokemonType.ELECTRIC]: NVE,
    [PokemonType.GRASS]: NVE,
    [PokemonType.GROUND]: IMM,
    [PokemonType.FLYING]: SE,
    [PokemonType.DRAGON]: NVE,
  },
  [PokemonType.GRASS]: {
    [PokemonType.FIRE]: NVE,
    [PokemonType.WATER]: SE,
    [PokemonType.GRASS]: NVE,
    [PokemonType.POISON]: NVE,
    [PokemonType.GROUND]: SE,
    [PokemonType.FLYING]: NVE,
    [PokemonType.BUG]: NVE,
    [PokemonType.ROCK]: SE,
    [PokemonType.DRAGON]: NVE,
  },
  [PokemonType.ICE]: {
    [PokemonType.FIRE]: NVE,
    [PokemonType.WATER]: NVE,
    [PokemonType.GRASS]: SE,
    [PokemonType.ICE]: NVE,
    [PokemonType.GROUND]: SE,
    [PokemonType.FLYING]: SE,
    [PokemonType.DRAGON]: SE,
  },
  [PokemonType.FIGHTING]: {
    [PokemonType.NORMAL]: SE,
    [PokemonType.ICE]: SE,
    [PokemonType.POISON]: NVE,
    [PokemonType.FLYING]: NVE,
    [PokemonType.PSYCHIC]: NVE,
    [PokemonType.BUG]: NVE,
    [PokemonType.ROCK]: SE,
    [PokemonType.GHOST]: IMM,
  },
  [PokemonType.POISON]: {
    [PokemonType.GRASS]: SE,
    [PokemonType.POISON]: NVE,
    [PokemonType.GROUND]: NVE,
    [PokemonType.BUG]: SE,
    [PokemonType.ROCK]: NVE,
    [PokemonType.GHOST]: NVE,
  },
  [PokemonType.GROUND]: {
    [PokemonType.FIRE]: SE,
    [PokemonType.ELECTRIC]: SE,
    [PokemonType.GRASS]: NVE,
    [PokemonType.POISON]: SE,
    [PokemonType.FLYING]: IMM,
    [PokemonType.BUG]: NVE,
    [PokemonType.ROCK]: SE,
  },
  [PokemonType.FLYING]: {
    [PokemonType.ELECTRIC]: NVE,
    [PokemonType.GRASS]: SE,
    [PokemonType.FIGHTING]: SE,
    [PokemonType.BUG]: SE,
    [PokemonType.ROCK]: NVE,
  },
  [PokemonType.PSYCHIC]: {
    [PokemonType.FIGHTING]: SE,
    [PokemonType.POISON]: SE,
    [PokemonType.PSYCHIC]: NVE,
    // Gen 1 Bug: no super effective Bug moves existed that mattered
  },
  [PokemonType.BUG]: {
    [PokemonType.FIRE]: NVE,
    [PokemonType.GRASS]: SE,
    [PokemonType.FIGHTING]: NVE,
    [PokemonType.POISON]: SE, // Gen 1: Bug is SE vs Poison
    [PokemonType.FLYING]: NVE,
    [PokemonType.PSYCHIC]: SE,
    [PokemonType.GHOST]: NVE,
  },
  [PokemonType.ROCK]: {
    [PokemonType.FIRE]: SE,
    [PokemonType.ICE]: SE,
    [PokemonType.FIGHTING]: NVE,
    [PokemonType.GROUND]: NVE,
    [PokemonType.FLYING]: SE,
    [PokemonType.BUG]: SE,
  },
  [PokemonType.GHOST]: {
    [PokemonType.NORMAL]: IMM,
    [PokemonType.PSYCHIC]: IMM, // Gen 1 bug: Ghost has NO EFFECT on Psychic
    [PokemonType.GHOST]: SE,
  },
  [PokemonType.DRAGON]: {
    [PokemonType.DRAGON]: SE,
  },
};

export function getTypeEffectiveness(attackType: PokemonType, defenseTypes: PokemonType[]): number {
  let multiplier = 1.0;
  for (const defType of defenseTypes) {
    const chart = TYPE_CHART[attackType];
    if (chart && defType in chart) {
      multiplier *= chart[defType]!;
    }
  }
  return multiplier;
}

export function getEffectivenessText(multiplier: number): string {
  if (multiplier === 0) return "It doesn't affect\nthe foe...";
  if (multiplier < 1) return "It's not very\neffective...";
  if (multiplier > 1) return "It's super effective!";
  return '';
}
