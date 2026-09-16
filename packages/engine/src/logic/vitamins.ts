// The four Silph Co vitamins: HP UP, PROTEIN, CALCIUM and CARBOS.
//
// A vitamin adds stat experience (Gen I "EVs") to one stat of one Pokemon and
// recomputes its stats. Gen I refuses a vitamin once that stat's stat exp has
// reached 25600 — the rest of the 65535 ceiling can only be earned in battle —
// which is the "It won't have any effect!" the bag shows.
//
// The rule lives here rather than in `BagScreen` so it is unit-pinned:
// `BagScreen.useItemOnPokemon()` only turns the result into text, a sound and
// a `useItem()`. Vitamins are deliberately NOT usable in battle (Gen I), so
// `BattleScene`'s bag never reaches this module.

import { PokemonInstance, PokemonSpecies, BaseStats } from '../types/pokemon.types';
import { calculateStats } from '../entities/Pokemon';

/** Which stat each vitamin raises. Keyed by item id. */
export const VITAMIN_STAT: Record<string, keyof BaseStats> = {
  hp_up: 'hp',
  protein: 'attack',
  iron: 'defense',
  calcium: 'special',
  carbos: 'speed',
};

/**
 * Gen I display names for the stats, as the bag prints them
 * ("ATTACK rose!"). `special` is "SPECIAL", not "SP. ATK" — Gen I has one.
 */
export const STAT_DISPLAY_NAME: Record<keyof BaseStats, string> = {
  hp: 'HP',
  attack: 'ATTACK',
  defense: 'DEFENSE',
  special: 'SPECIAL',
  speed: 'SPEED',
};

/** Stat exp a single vitamin adds. */
export const VITAMIN_EV_GAIN = 2560;
/** At or above this, a vitamin is refused (Gen I). */
export const VITAMIN_EV_LIMIT = 25600;
/** The hard stat-exp ceiling; battle-earned exp can reach it, vitamins cannot. */
export const MAX_EV = 65535;

export interface VitaminResult {
  ok: boolean;
  /** The stat raised — only set when `ok`. */
  stat?: keyof BaseStats;
}

/**
 * Apply `itemId` to `pokemon`, mutating its `evs`, `stats` and `currentHp`.
 *
 * Returns null when `itemId` is not a vitamin at all (the caller falls through
 * to its other item branches), `{ ok: false }` when the stat is already at or
 * past `VITAMIN_EV_LIMIT` (the bag shows "It won't have any effect!" and the
 * item is NOT consumed), and `{ ok: true, stat }` otherwise.
 *
 * On success: stat exp goes up by `VITAMIN_EV_GAIN` (capped at `MAX_EV`), the
 * whole stat block is recomputed from species/level/ivs/evs, and — like Gen I —
 * an HP UP's extra max HP is also given as current HP, so the mon does not come
 * out of it proportionally more hurt. A fainted Pokemon stays fainted (a
 * vitamin is not a revive), and `currentHp` is clamped to the new maximum in
 * case a recompute ever lowers it.
 */
export function applyVitamin(
  pokemon: PokemonInstance,
  itemId: string,
  species: PokemonSpecies,
): VitaminResult | null {
  const stat = VITAMIN_STAT[itemId];
  if (!stat) return null;

  if (pokemon.evs[stat] >= VITAMIN_EV_LIMIT) return { ok: false };

  pokemon.evs[stat] = Math.min(MAX_EV, pokemon.evs[stat] + VITAMIN_EV_GAIN);

  const oldMaxHp = pokemon.stats.hp;
  pokemon.stats = calculateStats(species, pokemon.level, pokemon.ivs, pokemon.evs);

  if (pokemon.currentHp > 0) {
    pokemon.currentHp += pokemon.stats.hp - oldMaxHp;
  }
  pokemon.currentHp = Math.max(0, Math.min(pokemon.stats.hp, pokemon.currentHp));

  return { ok: true, stat };
}
