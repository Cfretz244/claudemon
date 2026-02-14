import { PokemonInstance, MoveData, PokemonType, MoveCategory, PHYSICAL_TYPES } from '../types/pokemon.types';
import { getTypeEffectiveness } from '../data/typeChart';
import { POKEMON_DATA } from '../data/pokemon';
import { DamageResult } from '../types/battle.types';

export function calculateDamage(
  attacker: PokemonInstance,
  defender: PokemonInstance,
  move: MoveData,
  critical: boolean = false,
): DamageResult {
  if (move.power === 0 || move.category === MoveCategory.STATUS) {
    return { damage: 0, isCritical: false, effectiveness: 1 };
  }

  const attackerSpecies = POKEMON_DATA[attacker.speciesId];
  const defenderSpecies = POKEMON_DATA[defender.speciesId];

  // Gen 1: Physical types use Attack/Defense, Special types use Special/Special
  const isPhysical = PHYSICAL_TYPES.includes(move.type);

  let atk: number;
  let def: number;

  if (isPhysical) {
    atk = attacker.stats.attack;
    def = defender.stats.defense;
  } else {
    atk = attacker.stats.special;
    def = defender.stats.special;
  }

  // Critical hit doubles level for damage calc in Gen 1
  const level = attacker.level;
  const critMultiplier = critical ? 2 : 1;

  // Type effectiveness
  const effectiveness = defenderSpecies
    ? getTypeEffectiveness(move.type, defenderSpecies.types)
    : 1;

  if (effectiveness === 0) {
    return { damage: 0, isCritical: critical, effectiveness: 0 };
  }

  // STAB (Same Type Attack Bonus)
  const stab = attackerSpecies?.types.includes(move.type) ? 1.5 : 1;

  // Gen 1 damage formula:
  // ((2*Level*Crit/5+2)*Power*A/D)/50+2)*STAB*Type*Random/255
  let damage = Math.floor(
    ((2 * level * critMultiplier) / 5 + 2) * move.power * atk / def
  );
  damage = Math.floor(damage / 50) + 2;

  // Apply STAB
  damage = Math.floor(damage * stab);

  // Apply type effectiveness
  damage = Math.floor(damage * effectiveness);

  // Random factor (217-255 in Gen 1, which is 85%-100%)
  const random = Math.floor(Math.random() * 39) + 217;
  damage = Math.floor(damage * random / 255);

  // Minimum 1 damage
  damage = Math.max(1, damage);

  return {
    damage,
    isCritical: critical,
    effectiveness,
  };
}

export function checkCritical(attacker: PokemonInstance): boolean {
  // Gen 1: Critical hit rate = base speed / 512
  const baseSpeed = POKEMON_DATA[attacker.speciesId]?.baseStats.speed ?? 50;
  const critRate = baseSpeed / 512;
  return Math.random() < critRate;
}

export function checkAccuracy(move: MoveData): boolean {
  if (move.accuracy === 0) return true; // Always hits (like Swift)
  return Math.random() * 100 < move.accuracy;
}
