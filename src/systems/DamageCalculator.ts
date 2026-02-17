import { PokemonInstance, MoveData, PokemonType, MoveCategory, PHYSICAL_TYPES } from '../types/pokemon.types';
import { getTypeEffectiveness } from '../data/typeChart';
import { POKEMON_DATA } from '../data/pokemon';
import { DamageResult } from '../types/battle.types';

// Gen 1 stat stage multipliers: stage -6 to +6 maps to 2/8 through 8/2
const STAGE_MULTIPLIERS = [2/8, 2/7, 2/6, 2/5, 2/4, 2/3, 2/2, 3/2, 4/2, 5/2, 6/2, 7/2, 8/2];

function getStageMultiplier(stage: number): number {
  return STAGE_MULTIPLIERS[Math.max(-6, Math.min(6, stage)) + 6];
}

export interface StatStages {
  atk: number;
  def: number;
  spd: number;
  spc: number;
  acc: number;
  eva: number;
}

export function calculateDamage(
  attacker: PokemonInstance,
  defender: PokemonInstance,
  move: MoveData,
  critical: boolean = false,
  attackerStages?: StatStages,
  defenderStages?: StatStages,
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
    // Apply stat stages (critical hits ignore negative atk stages and positive def stages)
    if (attackerStages && !critical) {
      atk = Math.floor(atk * getStageMultiplier(attackerStages.atk));
    } else if (attackerStages && critical && attackerStages.atk > 0) {
      atk = Math.floor(atk * getStageMultiplier(attackerStages.atk));
    }
    if (defenderStages && !critical) {
      def = Math.floor(def * getStageMultiplier(defenderStages.def));
    } else if (defenderStages && critical && defenderStages.def < 0) {
      def = Math.floor(def * getStageMultiplier(defenderStages.def));
    }
  } else {
    atk = attacker.stats.special;
    def = defender.stats.special;
    if (attackerStages && !critical) {
      atk = Math.floor(atk * getStageMultiplier(attackerStages.spc));
    } else if (attackerStages && critical && attackerStages.spc > 0) {
      atk = Math.floor(atk * getStageMultiplier(attackerStages.spc));
    }
    if (defenderStages && !critical) {
      def = Math.floor(def * getStageMultiplier(defenderStages.spc));
    } else if (defenderStages && critical && defenderStages.spc < 0) {
      def = Math.floor(def * getStageMultiplier(defenderStages.spc));
    }
  }

  // Prevent division by zero
  atk = Math.max(1, atk);
  def = Math.max(1, def);

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

export function checkAccuracy(move: MoveData, attackerAccStage: number = 0, defenderEvaStage: number = 0): boolean {
  if (move.accuracy === 0) return true; // Always hits (like Swift)
  // Effective accuracy = base accuracy * acc stage multiplier / eva stage multiplier
  const accMul = getStageMultiplier(attackerAccStage);
  const evaMul = getStageMultiplier(defenderEvaStage);
  const effectiveAccuracy = move.accuracy * accMul / evaMul;
  return Math.random() * 100 < effectiveAccuracy;
}
