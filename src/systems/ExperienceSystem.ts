import { PokemonInstance, PokemonMove } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';
import { calculateStats, getExpForLevel } from '../entities/Pokemon';

export interface LevelUpResult {
  newLevel: number;
  oldStats: { hp: number; attack: number; defense: number; special: number; speed: number };
  newStats: { hp: number; attack: number; defense: number; special: number; speed: number };
  newMoves: number[]; // moveIds learned at new levels
}

export function calculateExpGain(
  defeatedPokemon: PokemonInstance,
  isTrainer: boolean,
): number {
  const species = POKEMON_DATA[defeatedPokemon.speciesId];
  if (!species) return 50;

  // Gen 1 EXP formula (simplified):
  // a * b * L / 7
  // a = 1.5 if trainer, 1 if wild
  // b = base exp yield
  // L = level of defeated pokemon
  const a = isTrainer ? 1.5 : 1;
  const b = species.baseExp;
  const L = defeatedPokemon.level;

  return Math.floor(a * b * L / 7);
}

export function addExperience(
  pokemon: PokemonInstance,
  expGain: number,
): LevelUpResult[] {
  const results: LevelUpResult[] = [];

  pokemon.exp += expGain;

  // Check for level ups
  while (pokemon.level < 100) {
    const nextLevelExp = getExpForLevel(pokemon.level + 1);
    if (pokemon.exp < nextLevelExp) break;

    const oldStats = { ...pokemon.stats };
    pokemon.level++;

    // Recalculate stats
    const species = POKEMON_DATA[pokemon.speciesId];
    if (species) {
      pokemon.stats = calculateStats(species, pokemon.level, pokemon.ivs, pokemon.evs);

      // Heal the HP difference
      const hpGain = pokemon.stats.hp - oldStats.hp;
      pokemon.currentHp = Math.min(pokemon.stats.hp, pokemon.currentHp + hpGain);
    }

    // Check for new moves
    const newMoves: number[] = [];
    if (species) {
      const movesAtLevel = species.learnset.filter(e => e.level === pokemon.level);
      for (const entry of movesAtLevel) {
        newMoves.push(entry.moveId);
      }
    }

    results.push({
      newLevel: pokemon.level,
      oldStats,
      newStats: { ...pokemon.stats },
      newMoves,
    });
  }

  // Add EVs from defeated pokemon
  const defSpecies = POKEMON_DATA[pokemon.speciesId];
  if (defSpecies) {
    pokemon.evs.hp = Math.min(65535, pokemon.evs.hp + defSpecies.baseStats.hp);
    pokemon.evs.attack = Math.min(65535, pokemon.evs.attack + defSpecies.baseStats.attack);
    pokemon.evs.defense = Math.min(65535, pokemon.evs.defense + defSpecies.baseStats.defense);
    pokemon.evs.special = Math.min(65535, pokemon.evs.special + defSpecies.baseStats.special);
    pokemon.evs.speed = Math.min(65535, pokemon.evs.speed + defSpecies.baseStats.speed);
  }

  return results;
}

export function learnMove(pokemon: PokemonInstance, moveId: number, replaceIndex?: number): boolean {
  const moveData = MOVES_DATA[moveId];
  if (!moveData) return false;

  // Check if already knows this move
  if (pokemon.moves.some(m => m.moveId === moveId)) return false;

  const newMove: PokemonMove = {
    moveId,
    currentPp: moveData.pp,
    maxPp: moveData.pp,
  };

  if (pokemon.moves.length < 4) {
    pokemon.moves.push(newMove);
    return true;
  }

  if (replaceIndex !== undefined && replaceIndex >= 0 && replaceIndex < 4) {
    pokemon.moves[replaceIndex] = newMove;
    return true;
  }

  return false; // No room and no replacement specified
}
