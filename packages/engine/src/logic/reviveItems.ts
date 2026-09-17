// The one rule shared by REVIVE and MAX REVIVE: how much HP a fainted Pokemon
// comes back with.
//
// Both the overworld bag (`BagScreen.useItemOnPokemon`) and the battle bag
// (`BattleScene.useRevive`) used to hardcode `Math.floor(stats.hp / 2)` next to
// an `itemId === 'revive'` test, so adding MAX REVIVE meant the same two-line
// rule in two places. It lives here instead, and both callers ask this module
// whether the item they were handed is a revive at all.

/** The revive items, in bag order. */
export const REVIVE_IDS = ['revive', 'max_revive'] as const;

/**
 * The HP a fainted Pokemon with `maxHp` comes back with, or null when `itemId`
 * is not a revive item at all (the caller then falls through to its other
 * item branches, exactly as it did when only `revive` existed).
 *
 * Gen I: REVIVE restores half of max HP (rounded down), MAX REVIVE all of it.
 * `Math.floor` matches the original `Math.floor(pokemon.stats.hp / 2)`, so a
 * 1 HP Pokemon revived with a REVIVE comes back at 0 — a Gen I quirk that is
 * preserved deliberately; `reviveItems.test.ts` pins it.
 */
export function reviveHp(itemId: string, maxHp: number): number | null {
  if (itemId === 'revive') return Math.floor(maxHp / 2);
  if (itemId === 'max_revive') return maxHp;
  return null;
}

/** True for the two items `reviveHp()` answers for. */
export function isReviveItem(itemId: string): boolean {
  return reviveHp(itemId, 1) !== null;
}
