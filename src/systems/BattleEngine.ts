// Pure battle-rules logic, extracted from BattleScene so it can be unit
// tested. Every function here is a faithful transcription of the scene's
// shipped behavior — including Gen-1-style quirks, which are called out in
// comments rather than "fixed". Randomness is injected (`rng`) so tests can
// drive exact branches; callers default to Math.random.

import { PokemonInstance, StatusCondition, MoveEffect } from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';

export interface StatStages {
  atk: number; def: number; spd: number; spc: number; acc: number; eva: number;
}

export interface VolatileStatus {
  confused: number;
  seeded: boolean;
  flinched: boolean;
  lastDamageTaken: number;
  lastDamagePhysical: boolean;
  substitute: number;
}

export interface DisableState {
  moveIndex: number;
  turnsLeft: number;
}

type Rng = () => number;

export function canFight(pokemon: PokemonInstance): boolean {
  return pokemon.currentHp > 0;
}

export function getFirstAlivePokemon(party: PokemonInstance[]): number {
  return party.findIndex(p => p.currentHp > 0);
}

export function isPartyDefeated(party: PokemonInstance[]): boolean {
  return party.every(p => p.currentHp <= 0);
}

/**
 * Whether the player's Pokemon acts first this turn.
 *
 * Quirks (preserved from BattleScene): a paralyzed side's speed check
 * OVERRIDES move priority entirely, and when both sides are paralyzed only
 * the opponent's paralysis ends up counting (the checks run sequentially).
 */
export function resolveTurnOrder(
  player: PokemonInstance,
  opponent: PokemonInstance,
  playerPriority: number,
  aiPriority: number,
): boolean {
  let playerFirst: boolean;
  if (playerPriority !== aiPriority) {
    playerFirst = playerPriority > aiPriority;
  } else {
    playerFirst = player.stats.speed >= opponent.stats.speed;
  }

  if (player.status === StatusCondition.PARALYSIS) {
    playerFirst = player.stats.speed * 0.25 >= opponent.stats.speed;
  }
  if (opponent.status === StatusCondition.PARALYSIS) {
    playerFirst = player.stats.speed >= opponent.stats.speed * 0.25;
  }
  return playerFirst;
}

/** Confusion self-hit: "40 power typeless physical attack" approximation. */
export function confusionSelfDamage(attacker: PokemonInstance): number {
  return Math.max(1, Math.floor(attacker.stats.attack / attacker.stats.defense * attacker.level * 2 / 5));
}

export type PreActionOutcome =
  | { action: 'recharge' }
  | { action: 'flinch' }
  | { action: 'confusion-snap' }        // snapped out of confusion; attacks
  | { action: 'confusion-self-hit'; selfDamage: number }
  | { action: 'confusion-attack' }      // confused but attacks anyway
  | { action: 'sleep-wake' }            // woke up; turn is still spent
  | { action: 'sleep' }
  | { action: 'paralyzed' }
  | { action: 'thaw' }                  // thawed out; attacks this turn
  | { action: 'frozen' }
  | { action: 'attack' };

/**
 * Resolves everything that can stop a Pokemon acting this turn, applying the
 * same state mutations the scene performed inline (waking, thawing, confusion
 * countdown, flinch clear, confusion self-damage).
 *
 * `isRecharging` is cleared by the CALLER when 'recharge' is returned, since
 * it lives on the scene (playerRecharging/opponentRecharging).
 */
export function resolvePreAction(
  attacker: PokemonInstance,
  atkVolatile: VolatileStatus,
  isRecharging: boolean,
  rng: Rng = Math.random,
): PreActionOutcome {
  if (isRecharging) {
    return { action: 'recharge' };
  }

  if (atkVolatile.flinched) {
    atkVolatile.flinched = false;
    return { action: 'flinch' };
  }

  if (atkVolatile.confused > 0) {
    atkVolatile.confused--;
    if (atkVolatile.confused <= 0) {
      return { action: 'confusion-snap' };
    }
    if (rng() < 0.5) {
      const selfDamage = confusionSelfDamage(attacker);
      attacker.currentHp = Math.max(0, attacker.currentHp - selfDamage);
      return { action: 'confusion-self-hit', selfDamage };
    }
    return { action: 'confusion-attack' };
  }

  if (attacker.status === StatusCondition.SLEEP) {
    if (rng() < 0.5) {
      attacker.status = StatusCondition.NONE;
      return { action: 'sleep-wake' };
    }
    return { action: 'sleep' };
  }

  if (attacker.status === StatusCondition.PARALYSIS && rng() < 0.25) {
    return { action: 'paralyzed' };
  }

  if (attacker.status === StatusCondition.FREEZE) {
    if (rng() < 0.2) {
      attacker.status = StatusCondition.NONE;
      return { action: 'thaw' };
    }
    return { action: 'frozen' };
  }

  return { action: 'attack' };
}

/** Multi-hit roll for TWO_HIT / MULTI_HIT moves; 1 for everything else. */
export function rollHitCount(effect: MoveEffect | undefined, rng: Rng = Math.random): number {
  if (effect === MoveEffect.TWO_HIT) return 2;
  if (effect === MoveEffect.MULTI_HIT) {
    const roll = rng();
    if (roll < 0.375) return 2;
    if (roll < 0.75) return 3;
    if (roll < 0.875) return 4;
    return 5;
  }
  return 1;
}

export type SpecialDamageResult =
  | { kind: 'not-special' }
  | { kind: 'failed'; messages: string[] }
  | { kind: 'hit'; messages: string[] };

/**
 * Damage effects that bypass the normal damage formula (OHKO, Sonic Boom /
 * Dragon Rage, Seismic Toss / Night Shade, Super Fang, Counter). Mutates
 * defender HP and Counter tracking exactly as the scene did.
 */
export function applySpecialDamage(
  effect: MoveEffect | undefined,
  moveId: number,
  attacker: PokemonInstance,
  defender: PokemonInstance,
  atkVolatile: VolatileStatus,
  defVolatile: VolatileStatus,
  rng: Rng = Math.random,
): SpecialDamageResult {
  switch (effect) {
    case MoveEffect.OHKO: {
      if (attacker.stats.speed < defender.stats.speed) {
        return { kind: 'failed', messages: ['But it failed!'] };
      }
      defender.currentHp = 0;
      return { kind: 'hit', messages: ['One-hit KO!'] };
    }
    case MoveEffect.FIXED_DAMAGE: {
      const fixedDmg = moveId === 49 ? 20 : 40; // Sonic Boom=49, Dragon Rage=82
      defender.currentHp = Math.max(0, defender.currentHp - fixedDmg);
      defVolatile.lastDamageTaken = fixedDmg;
      defVolatile.lastDamagePhysical = true;
      return { kind: 'hit', messages: [] };
    }
    case MoveEffect.LEVEL_DAMAGE: {
      // Psywave (149) rolls up to 1.5x level; Seismic Toss/Night Shade deal level
      const dmg = moveId === 149
        ? Math.max(1, Math.floor(rng() * attacker.level * 1.5))
        : attacker.level;
      defender.currentHp = Math.max(0, defender.currentHp - dmg);
      defVolatile.lastDamageTaken = dmg;
      defVolatile.lastDamagePhysical = true;
      return { kind: 'hit', messages: [] };
    }
    case MoveEffect.SUPER_FANG: {
      const dmg = Math.max(1, Math.floor(defender.currentHp / 2));
      defender.currentHp = Math.max(0, defender.currentHp - dmg);
      defVolatile.lastDamageTaken = dmg;
      defVolatile.lastDamagePhysical = true;
      return { kind: 'hit', messages: [] };
    }
    case MoveEffect.COUNTER: {
      if (atkVolatile.lastDamageTaken > 0 && atkVolatile.lastDamagePhysical) {
        const dmg = atkVolatile.lastDamageTaken * 2;
        defender.currentHp = Math.max(0, defender.currentHp - dmg);
        defVolatile.lastDamageTaken = dmg;
        return { kind: 'hit', messages: [] };
      }
      return { kind: 'failed', messages: ['But it failed!'] };
    }
    default:
      return { kind: 'not-special' };
  }
}

export interface EffectContext {
  attacker: PokemonInstance;
  defender: PokemonInstance;
  atkName: string;
  defName: string;
  atkStages: StatStages;
  defStages: StatStages;
  atkVolatile: VolatileStatus;
  defVolatile: VolatileStatus;
  defDisable: DisableState;
  isSecondary: boolean;
  rng?: Rng;
}

const STAT_NAMES: Record<string, string> = {
  atk: 'ATTACK', def: 'DEFENSE', spd: 'SPEED', spc: 'SPECIAL', acc: 'accuracy', eva: 'evasiveness',
};

// Gen 1 secondary effect chances for damage moves.
// Status moves (isSecondary=false) always apply - they already passed accuracy.
const SEC_CHANCE_STATUS = 0.3;    // ~30% for paralyze, poison
const SEC_CHANCE_BURN = 0.1;      // ~10% for burn
const SEC_CHANCE_FREEZE = 0.1;    // ~10% for freeze
const SEC_CHANCE_STAT = 0.33;     // ~33% for stat changes / confusion

/**
 * Applies a move's status/stat effect, pushing battle text onto `messages`.
 * Transcribed verbatim from BattleScene.applyMoveEffect.
 */
export function applyMoveEffect(effect: MoveEffect, ctx: EffectContext, messages: string[]): void {
  const {
    attacker, defender, atkName, defName,
    atkStages, defStages, atkVolatile, defVolatile, defDisable, isSecondary,
  } = ctx;
  const rng = ctx.rng ?? Math.random;

  const applyStageDelta = (stages: StatStages, stat: keyof StatStages, delta: number, targetName: string) => {
    const old = stages[stat];
    stages[stat] = Math.max(-6, Math.min(6, old + delta));
    if (stages[stat] === old) {
      messages.push(`${targetName}'s\n${STAT_NAMES[stat]} won't go\nany ${delta > 0 ? 'higher' : 'lower'}!`);
    } else {
      messages.push(`${targetName}'s\n${STAT_NAMES[stat]} ${delta > 0 ? 'rose' : 'fell'}!`);
    }
  };

  switch (effect) {
    case MoveEffect.PARALYZE:
      if (defender.status === StatusCondition.NONE && (!isSecondary || rng() < SEC_CHANCE_STATUS)) {
        defender.status = StatusCondition.PARALYSIS;
        messages.push(`${defName} is paralyzed!`);
      }
      break;
    case MoveEffect.BURN:
      if (defender.status === StatusCondition.NONE && (!isSecondary || rng() < SEC_CHANCE_BURN)) {
        defender.status = StatusCondition.BURN;
        messages.push(`${defName} was burned!`);
      }
      break;
    case MoveEffect.FREEZE:
      if (defender.status === StatusCondition.NONE && (!isSecondary || rng() < SEC_CHANCE_FREEZE)) {
        defender.status = StatusCondition.FREEZE;
        messages.push(`${defName} was frozen!`);
      }
      break;
    case MoveEffect.POISON:
      if (defender.status === StatusCondition.NONE && (!isSecondary || rng() < SEC_CHANCE_STATUS)) {
        defender.status = StatusCondition.POISON;
        messages.push(`${defName} was poisoned!`);
      }
      break;
    case MoveEffect.SLEEP:
      if (defender.status === StatusCondition.NONE) {
        defender.status = StatusCondition.SLEEP;
        messages.push(`${defName} fell asleep!`);
      }
      break;
    case MoveEffect.CONFUSE: {
      if (defVolatile.confused <= 0 && (!isSecondary || rng() < SEC_CHANCE_STAT)) {
        defVolatile.confused = Math.floor(rng() * 4) + 2; // 2-5 turns
        messages.push(`${defName} became\nconfused!`);
      }
      break;
    }

    // Stat stage effects - self buffs (always apply, these are status moves)
    case MoveEffect.STAT_UP_ATK:
      applyStageDelta(atkStages, 'atk', 1, atkName);
      break;
    case MoveEffect.STAT_UP_DEF:
      applyStageDelta(atkStages, 'def', 1, atkName);
      break;
    case MoveEffect.STAT_UP_SPD:
      applyStageDelta(atkStages, 'spd', 1, atkName);
      break;
    case MoveEffect.STAT_UP_SPC:
      applyStageDelta(atkStages, 'spc', 1, atkName);
      break;

    // Stat stage effects - debuffs on defender
    // Secondary (on damage moves like Psychic): ~33% chance
    // Primary (status moves like Growl): always applies
    case MoveEffect.STAT_DOWN_ATK:
      if (!isSecondary || rng() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'atk', -1, defName);
      break;
    case MoveEffect.STAT_DOWN_DEF:
      if (!isSecondary || rng() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'def', -1, defName);
      break;
    case MoveEffect.STAT_DOWN_SPD:
      if (!isSecondary || rng() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'spd', -1, defName);
      break;
    case MoveEffect.STAT_DOWN_SPC:
      if (!isSecondary || rng() < SEC_CHANCE_STAT) applyStageDelta(defStages, 'spc', -1, defName);
      break;
    case MoveEffect.STAT_DOWN_ACC:
      applyStageDelta(defStages, 'acc', -1, defName);
      break;

    case MoveEffect.DISABLE: {
      // Gen 1: Disable a random move of the defender for 1-8 turns
      const usableMoves = defender.moves
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => m.currentPp > 0);
      if (usableMoves.length > 0 && defDisable.moveIndex === -1) {
        const pick = usableMoves[Math.floor(rng() * usableMoves.length)];
        defDisable.moveIndex = pick.i;
        defDisable.turnsLeft = Math.floor(rng() * 8) + 1;
        const moveName = MOVES_DATA[pick.m.moveId]?.name || '???';
        messages.push(`${defName}'s\n${moveName} was\ndisabled!`);
      } else {
        messages.push('But it failed!');
      }
      break;
    }

    case MoveEffect.RECOVER: {
      const healAmount = Math.floor(attacker.stats.hp / 2);
      attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + healAmount);
      messages.push(`${atkName} recovered\nhealth!`);
      break;
    }

    case MoveEffect.REST: {
      // Rest: fully heal + sleep
      attacker.currentHp = attacker.stats.hp;
      attacker.status = StatusCondition.SLEEP;
      messages.push(`${atkName} went to sleep\nand became healthy!`);
      break;
    }

    case MoveEffect.HAZE: {
      // Reset all stat stages for both sides
      for (const stages of [atkStages, defStages]) {
        stages.atk = 0; stages.def = 0; stages.spd = 0;
        stages.spc = 0; stages.acc = 0; stages.eva = 0;
      }
      messages.push('All stat changes\nwere eliminated!');
      break;
    }

    case MoveEffect.LEECH_SEED: {
      if (!defVolatile.seeded) {
        defVolatile.seeded = true;
        messages.push(`${defName} was seeded!`);
      } else {
        messages.push('But it failed!');
      }
      break;
    }

    case MoveEffect.TOXIC: {
      if (defender.status === StatusCondition.NONE) {
        defender.status = StatusCondition.POISON;
        messages.push(`${defName} was badly\npoisoned!`);
      } else {
        messages.push('But it failed!');
      }
      break;
    }

    case MoveEffect.SUBSTITUTE: {
      const subHp = Math.floor(attacker.stats.hp / 4);
      if (attacker.currentHp > subHp && atkVolatile.substitute <= 0) {
        attacker.currentHp -= subHp;
        atkVolatile.substitute = subHp;
        messages.push(`${atkName} made a\nSUBSTITUTE!`);
      } else {
        messages.push('But it failed!');
      }
      break;
    }

    case MoveEffect.TRANSFORM: {
      // Simplified: message only (not full stat copy)
      messages.push(`${atkName} TRANSFORMed\ninto ${defName}!`);
      break;
    }

    case MoveEffect.LIGHT_SCREEN: {
      // Simplified: boost Special by 1 stage
      applyStageDelta(atkStages, 'spc', 1, atkName);
      messages.push(`${atkName} created a\nLIGHT SCREEN!`);
      break;
    }

    case MoveEffect.REFLECT: {
      // Simplified: boost Defense by 1 stage
      applyStageDelta(atkStages, 'def', 1, atkName);
      messages.push(`${atkName} created a\nREFLECT wall!`);
      break;
    }

    case MoveEffect.FOCUS_ENERGY: {
      // Gen 1 Focus Energy was bugged and did nothing useful
      messages.push(`${atkName} is getting\npumped!`);
      break;
    }

    case MoveEffect.MIST: {
      messages.push(`${atkName} is shrouded\nin MIST!`);
      break;
    }

    case MoveEffect.CONVERSION: {
      messages.push(`${atkName} changed type!`);
      break;
    }

    case MoveEffect.BIDE: {
      messages.push(`${atkName} is storing\nenergy!`);
      break;
    }

    case MoveEffect.RAGE: {
      messages.push(`${atkName} is enraged!`);
      break;
    }

    case MoveEffect.MIMIC: {
      messages.push('But it failed!');
      break;
    }

    case MoveEffect.RECOIL: {
      // Handled during damage calc
      break;
    }
  }
}

/**
 * End-of-turn burn/poison damage (both are max(1, maxHp/16) here — Toxic's
 * escalating counter is not modeled). Returns 0 for other statuses.
 */
export function applyEndTurnStatus(pokemon: PokemonInstance): number {
  if (pokemon.currentHp <= 0) return 0;

  switch (pokemon.status) {
    case StatusCondition.BURN:
    case StatusCondition.POISON:
      return Math.max(1, Math.floor(pokemon.stats.hp / 16));
    default:
      return 0;
  }
}

/**
 * End-of-turn Leech Seed tick. Mutates both sides' HP: drains the seeded
 * Pokemon and heals the other side by the amount actually drained (capped by
 * remaining HP), only while the other side is alive.
 */
export function applyLeechSeed(seeded: PokemonInstance, other: PokemonInstance): number {
  const seedDmg = Math.max(1, Math.floor(seeded.stats.hp / 16));
  const actualDmg = Math.min(seedDmg, seeded.currentHp);
  seeded.currentHp = Math.max(0, seeded.currentHp - seedDmg);
  if (other.currentHp > 0) {
    other.currentHp = Math.min(other.stats.hp, other.currentHp + actualDmg);
  }
  return actualDmg;
}

/**
 * Gen 1-style run check. NOTE: this is the scene's shipped formula (no %256
 * wraparound and no escape-attempt counter — every attempt uses the same
 * odds). With opponent speed 0 the chance is Infinity, i.e. guaranteed.
 */
export function calculateRunChance(playerSpeed: number, opponentSpeed: number, rng: Rng = Math.random): boolean {
  const escapeChance = (playerSpeed * 32) / (opponentSpeed / 4) + 30;
  return rng() * 256 < escapeChance;
}

/** Gen 1 EXP split: total divided evenly among living participants, floored. */
export function splitExp(totalExp: number, livingParticipantCount: number): number {
  return Math.floor(totalExp / Math.max(1, livingParticipantCount));
}
