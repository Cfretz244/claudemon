import {
  PokemonInstance,
  PokemonMove,
  BaseStats,
  StatusCondition,
  PokemonSpecies,
} from '../types/pokemon.types';
import { MAX_IV, MAX_MOVES } from '../utils/constants';
import { POKEMON_DATA } from '../data/pokemon';
import { MOVES_DATA } from '../data/moves';

// Gen 1 stat calculation
export function calcHP(base: number, iv: number, ev: number, level: number): number {
  return Math.floor(((base + iv) * 2 + Math.floor(Math.ceil(Math.sqrt(ev)) / 4)) * level / 100) + level + 10;
}

export function calcStat(base: number, iv: number, ev: number, level: number): number {
  return Math.floor(((base + iv) * 2 + Math.floor(Math.ceil(Math.sqrt(ev)) / 4)) * level / 100) + 5;
}

export function calculateStats(species: PokemonSpecies, level: number, ivs: BaseStats, evs: BaseStats): BaseStats {
  return {
    hp: calcHP(species.baseStats.hp, ivs.hp, evs.hp, level),
    attack: calcStat(species.baseStats.attack, ivs.attack, evs.attack, level),
    defense: calcStat(species.baseStats.defense, ivs.defense, evs.defense, level),
    special: calcStat(species.baseStats.special, ivs.special, evs.special, level),
    speed: calcStat(species.baseStats.speed, ivs.speed, evs.speed, level),
  };
}

export function generateIVs(): BaseStats {
  return {
    hp: Math.floor(Math.random() * (MAX_IV + 1)),
    attack: Math.floor(Math.random() * (MAX_IV + 1)),
    defense: Math.floor(Math.random() * (MAX_IV + 1)),
    special: Math.floor(Math.random() * (MAX_IV + 1)),
    speed: Math.floor(Math.random() * (MAX_IV + 1)),
  };
}

export function createPokemon(speciesId: number, level: number, ot: string = 'RED'): PokemonInstance {
  const species = POKEMON_DATA[speciesId];
  if (!species) {
    throw new Error(`Unknown Pokemon species: ${speciesId}`);
  }

  const ivs = generateIVs();
  const evs: BaseStats = { hp: 0, attack: 0, defense: 0, special: 0, speed: 0 };
  const stats = calculateStats(species, level, ivs, evs);

  // Get moves: last 4 moves learned by this level
  const learnedMoves = species.learnset
    .filter(entry => entry.level <= level)
    .slice(-MAX_MOVES);

  const moves: PokemonMove[] = learnedMoves.map(entry => {
    const moveData = MOVES_DATA[entry.moveId];
    return {
      moveId: entry.moveId,
      currentPp: moveData?.pp ?? 20,
      maxPp: moveData?.pp ?? 20,
    };
  });

  // Ensure at least one move (Tackle fallback)
  if (moves.length === 0) {
    const tackle = MOVES_DATA[33]; // Tackle
    moves.push({
      moveId: 33,
      currentPp: tackle?.pp ?? 35,
      maxPp: tackle?.pp ?? 35,
    });
  }

  // Exp needed for this level (medium-fast growth group for simplicity)
  const exp = level * level * level;

  return {
    speciesId,
    level,
    currentHp: stats.hp,
    stats,
    ivs,
    evs,
    moves,
    exp,
    status: StatusCondition.NONE,
    ot,
  };
}

export function getExpForLevel(level: number): number {
  return level * level * level;
}

export function getLevelForExp(exp: number): number {
  let level = 1;
  while (getExpForLevel(level + 1) <= exp && level < 100) {
    level++;
  }
  return level;
}

export function healPokemon(pokemon: PokemonInstance): void {
  const species = POKEMON_DATA[pokemon.speciesId];
  if (species) {
    pokemon.stats = calculateStats(species, pokemon.level, pokemon.ivs, pokemon.evs);
  }
  pokemon.currentHp = pokemon.stats.hp;
  pokemon.status = StatusCondition.NONE;
  for (const move of pokemon.moves) {
    move.currentPp = move.maxPp;
  }
}
