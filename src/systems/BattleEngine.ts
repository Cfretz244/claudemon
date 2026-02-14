// Battle engine orchestration - most logic is in BattleScene.ts
// This file provides utility functions for battle resolution

import { PokemonInstance, StatusCondition } from '../types/pokemon.types';

export function canFight(pokemon: PokemonInstance): boolean {
  return pokemon.currentHp > 0;
}

export function getFirstAlivePokemon(party: PokemonInstance[]): number {
  return party.findIndex(p => p.currentHp > 0);
}

export function isPartyDefeated(party: PokemonInstance[]): boolean {
  return party.every(p => p.currentHp <= 0);
}

export function calculateRunChance(playerSpeed: number, opponentSpeed: number, attempts: number): boolean {
  // Gen 1 run formula
  const escapeChance = ((playerSpeed * 32) / ((opponentSpeed / 4) % 256)) + 30 * attempts;
  return Math.random() * 256 < escapeChance;
}

export function applyEndTurnStatus(pokemon: PokemonInstance): number {
  // Returns damage dealt by status
  if (pokemon.currentHp <= 0) return 0;

  switch (pokemon.status) {
    case StatusCondition.BURN:
    case StatusCondition.POISON:
      return Math.max(1, Math.floor(pokemon.stats.hp / 16));
    default:
      return 0;
  }
}
