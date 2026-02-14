import { PokemonInstance, MoveData, MoveCategory } from '../types/pokemon.types';
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
      // Status moves get lower priority unless strategic
      score = 20;
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
    }

    // Accuracy penalty
    if (moveData.accuracy > 0 && moveData.accuracy < 100) {
      score *= moveData.accuracy / 100;
    }

    // Small random factor
    score *= 0.85 + Math.random() * 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = move.index;
    }
  }

  return bestIndex;
}
