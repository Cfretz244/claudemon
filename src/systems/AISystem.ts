import { PokemonInstance, MoveData, MoveCategory, MoveEffect, StatusCondition } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { getTypeEffectiveness } from '../data/typeChart';
import { calculateDamage } from './DamageCalculator';

export function selectAIMove(
  aiPokemon: PokemonInstance,
  playerPokemon: PokemonInstance,
): number {
  // Return index of the move to use
  const usableMoves = aiPokemon.moves
    .map((m, i) => ({ ...m, index: i }))
    .filter(m => m.currentPp > 0);

  if (usableMoves.length === 0) {
    return 0; // Struggle (out of PP)
  }

  const playerSpecies = POKEMON_DATA[playerPokemon.speciesId];
  if (!playerSpecies) return usableMoves[0].index;

  // Score each move
  let bestScore = -1;
  let bestIndex = usableMoves[0].index;

  for (const move of usableMoves) {
    const moveData = MOVES_DATA[move.moveId];
    if (!moveData) continue;

    let score = 0;

    if (moveData.category === MoveCategory.STATUS) {
      score = scoreStatusMove(moveData, aiPokemon, playerPokemon);
    } else {
      // Calculate expected damage
      const result = calculateDamage(aiPokemon, playerPokemon, moveData, false);
      score = result.damage;

      // Bonus for super effective
      if (result.effectiveness > 1) score *= 1.5;
      // Penalty for not very effective
      if (result.effectiveness < 1 && result.effectiveness > 0) score *= 0.5;
      // Zero for immune
      if (result.effectiveness === 0) score = 0;

      // Bonus for potential KO
      if (result.damage >= playerPokemon.currentHp) score *= 2;

      // Damaging moves with secondary effects get a small bonus
      if (moveData.effect === MoveEffect.PARALYZE ||
          moveData.effect === MoveEffect.BURN ||
          moveData.effect === MoveEffect.FREEZE ||
          moveData.effect === MoveEffect.FLINCH ||
          moveData.effect === MoveEffect.CONFUSE) {
        score *= 1.1;
      }
    }

    // Accuracy penalty
    if (moveData.accuracy > 0 && moveData.accuracy < 100) {
      score *= moveData.accuracy / 100;
    }

    // Small random factor (±15%)
    score *= 0.85 + Math.random() * 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = move.index;
    }
  }

  return bestIndex;
}

/**
 * Score a status move based on how useful it would be right now.
 * Returns a score comparable to damage values (typically 0-15 range).
 */
function scoreStatusMove(
  moveData: MoveData,
  aiPokemon: PokemonInstance,
  playerPokemon: PokemonInstance,
): number {
  const effect = moveData.effect;

  // Sleep is very strong if the target isn't already statused
  if (effect === MoveEffect.SLEEP) {
    if (playerPokemon.status !== StatusCondition.NONE) return 0;
    return 12;
  }

  // Paralyze - strong but not if already statused
  if (effect === MoveEffect.PARALYZE) {
    if (playerPokemon.status !== StatusCondition.NONE) return 0;
    return 10;
  }

  // Poison / Toxic
  if (effect === MoveEffect.POISON || effect === MoveEffect.TOXIC) {
    if (playerPokemon.status !== StatusCondition.NONE) return 0;
    return effect === MoveEffect.TOXIC ? 8 : 6;
  }

  // Confuse
  if (effect === MoveEffect.CONFUSE) {
    return 5;
  }

  // Stat-lowering moves on opponent: mild value, diminishing returns
  // (the AI doesn't track stages, so just give low base value)
  if (effect === MoveEffect.STAT_DOWN_ATK ||
      effect === MoveEffect.STAT_DOWN_DEF ||
      effect === MoveEffect.STAT_DOWN_SPD ||
      effect === MoveEffect.STAT_DOWN_SPC ||
      effect === MoveEffect.STAT_DOWN_ACC) {
    return 3;
  }

  // Stat-raising moves on self: mild value
  if (effect === MoveEffect.STAT_UP_ATK ||
      effect === MoveEffect.STAT_UP_DEF ||
      effect === MoveEffect.STAT_UP_SPD ||
      effect === MoveEffect.STAT_UP_SPC) {
    // More valuable if AI has high HP remaining
    const hpRatio = aiPokemon.currentHp / aiPokemon.stats.hp;
    return hpRatio > 0.7 ? 6 : 2;
  }

  // Recovery moves: valuable at low HP
  if (effect === MoveEffect.RECOVER || effect === MoveEffect.REST) {
    const hpRatio = aiPokemon.currentHp / aiPokemon.stats.hp;
    if (hpRatio < 0.3) return 15;
    if (hpRatio < 0.5) return 8;
    return 0; // Don't heal at high HP
  }

  // Reflect/Light Screen: mild defensive value
  if (effect === MoveEffect.REFLECT || effect === MoveEffect.LIGHT_SCREEN) {
    return 4;
  }

  // Leech Seed
  if (effect === MoveEffect.LEECH_SEED) {
    return 5;
  }

  // Substitute: decent if has enough HP
  if (effect === MoveEffect.SUBSTITUTE) {
    const hpRatio = aiPokemon.currentHp / aiPokemon.stats.hp;
    return hpRatio > 0.5 ? 5 : 0;
  }

  // Default for other status moves (Haze, Mist, Focus Energy, etc.)
  return 3;
}
