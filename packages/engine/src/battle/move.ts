import { outcomeFor, MoveOutcome } from '../logic/animationOutcome';
import {
  PokemonInstance,
  MoveEffect,
  MoveCategory,
  StatusCondition,
  PHYSICAL_TYPES,
} from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';
import { POKEMON_DATA } from '../data/pokemon';
import { calculateDamage, checkAccuracy, checkCritical } from '../systems/DamageCalculator';
import {
  StatStages,
  VolatileStatus,
  DisableState,
  resolvePreAction,
  evadesSemiInvulnerable,
  applySpecialDamage,
  applyMoveEffect,
  rollHitCount,
} from '../systems/BattleEngine';
import {
  chargeMessage,
  isChargeMove,
  resolveChargeStep,
  isSemiInvulnerableCharge,
} from '../logic/chargeMoves';
export const speciesName = (p: PokemonInstance) => p.nickname || POKEMON_DATA[p.speciesId].name;
export const freshStages = (): StatStages => ({ atk: 0, def: 0, spd: 0, spc: 0, acc: 0, eva: 0 });
export const freshVolatile = (): VolatileStatus => ({
  confused: 0,
  seeded: false,
  flinched: false,
  lastDamageTaken: 0,
  lastDamagePhysical: false,
  substitute: 0,
  charging: null,
});
export interface Combatant {
  pokemon: PokemonInstance;
  stages: StatStages;
  volatile: VolatileStatus;
  disable: DisableState;
  recharging: boolean;
}
export function combatant(pokemon: PokemonInstance): Combatant {
  return {
    pokemon,
    stages: freshStages(),
    volatile: freshVolatile(),
    disable: { moveIndex: -1, turnsLeft: 0 },
    recharging: false,
  };
}
export interface MoveEvent {
  moveId?: number;
  phase?: 'charge' | 'release';
  hit: boolean;
  type: string;
  before: string[];
  messages: string[];
  chargeCancelled?: boolean;
  outcome?: MoveOutcome;
}
/** Authoritative move pipeline extracted from BattleScene. Presentation consumes its result only. */
export function executeBattleMove(
  a: Combatant,
  d: Combatant,
  index: number,
  rng: () => number = Math.random,
): MoveEvent {
  const event: MoveEvent = { hit: false, type: 'NORMAL', before: [], messages: [] };
  const p = a.pokemon,
    q = d.pokemon,
    name = speciesName(p);
  const pre = resolvePreAction(p, a.volatile, a.recharging, rng);
  event.chargeCancelled = pre.chargeCancelled;
  const words: Record<string, string> = {
    recharge: 'must recharge!',
    flinch: 'flinched!',
    'confusion-snap': 'snapped out of confusion!',
    'confusion-self-hit': 'hurt itself in confusion!',
    'confusion-attack': 'is confused!',
    'sleep-wake': 'woke up!',
    sleep: 'is fast asleep!',
    paralyzed: 'is fully paralyzed!',
    frozen: 'is frozen solid!',
    thaw: 'thawed out!',
  };
  if (pre.action !== 'attack') event.before.push(`${name} ${words[pre.action]}`);
  if (pre.action === 'recharge') a.recharging = false;
  if (!['attack', 'confusion-attack', 'confusion-snap', 'thaw'].includes(pre.action)) return event;
  const slot = p.moves[index];
  const struggle = !p.moves.some((m) => m.currentPp > 0);
  if (!struggle && (!slot || slot.currentPp <= 0)) {
    event.messages.push('There is no PP left for this move.');
    return event;
  }
  let id = struggle ? 165 : slot.moveId;
  let move = MOVES_DATA[id];
  if (!move) return event;
  event.before.push(`${name} used ${move.name}!`);
  if (isChargeMove(id)) {
    const phase = resolveChargeStep(a.volatile.charging, index);
    event.phase = phase;
    if (phase === 'charge') {
      a.volatile.charging = { moveIndex: index, moveId: id };
      event.moveId = id;
      event.type = move.type;
      const line = chargeMessage(id, name);
      if (line) event.before.push(line);
      return event;
    }
    a.volatile.charging = null;
  }
  if (!struggle) slot.currentPp = Math.max(0, slot.currentPp - 1);
  if (move.effect === MoveEffect.METRONOME) {
    const ids = Object.keys(MOVES_DATA)
      .map(Number)
      .filter(
        (i) => ![MoveEffect.METRONOME, MoveEffect.MIRROR_MOVE].includes(MOVES_DATA[i].effect!),
      );
    id = ids[Math.floor(rng() * ids.length)];
    move = MOVES_DATA[id];
    event.before.push(`It became ${move.name}!`);
  }
  if (
    move.effect === MoveEffect.MIRROR_MOVE ||
    (move.effect === MoveEffect.DREAM_EATER && q.status !== StatusCondition.SLEEP)
  ) {
    event.messages.push('But it failed!');
    return event;
  }
  event.moveId = id;
  event.type = move.type;
  event.hit =
    !evadesSemiInvulnerable(
      move.accuracy,
      !!d.volatile.charging && isSemiInvulnerableCharge(d.volatile.charging.moveId),
    ) && checkAccuracy(move, a.stages.acc, d.stages.eva, rng);
  const damaging = event.hit && move.power > 0 && move.category !== MoveCategory.STATUS;
  const crit = damaging ? checkCritical(p, rng) : false;
  const result = damaging ? calculateDamage(p, q, move, crit, a.stages, d.stages, rng) : undefined;
  event.outcome = outcomeFor(event.hit, result, move);
  if (!event.hit) {
    event.messages.push('But it missed!');
    return event;
  }
  const special = applySpecialDamage(move.effect, id, p, q, a.volatile, d.volatile, rng);
  if (special.kind !== 'not-special') {
    event.messages.push(...special.messages);
    return event;
  }
  const effect = (secondary: boolean) => {
    if (move.effect)
      applyMoveEffect(
        move.effect,
        {
          attacker: p,
          defender: q,
          atkName: name,
          defName: speciesName(q),
          atkStages: a.stages,
          defStages: d.stages,
          atkVolatile: a.volatile,
          defVolatile: d.volatile,
          defDisable: d.disable,
          isSecondary: secondary,
          rng,
        },
        event.messages,
      );
  };
  if (result) {
    if (result.effectiveness === 0) {
      event.messages.push("It doesn't affect the target!");
      return event;
    }
    const count = rollHitCount(move.effect, rng),
      total = result.damage * count;
    d.volatile.lastDamageTaken = total;
    d.volatile.lastDamagePhysical = PHYSICAL_TYPES.includes(move.type);
    q.currentHp = Math.max(0, q.currentHp - total);
    if (crit) event.messages.push('A critical hit!');
    if (count > 1) event.messages.push(`Hit ${count} times!`);
    if (result.effectiveness > 1) event.messages.push("It's super effective!");
    if (result.effectiveness < 1) event.messages.push("It's not very effective...");
    if (move.effect === MoveEffect.RECOIL) {
      p.currentHp = Math.max(0, p.currentHp - Math.max(1, Math.floor(result.damage / 4)));
      event.messages.push(`${name} is hit with recoil!`);
    }
    if (move.effect === MoveEffect.DRAIN || move.effect === MoveEffect.DREAM_EATER) {
      p.currentHp = Math.min(
        p.stats.hp,
        p.currentHp +
          Math.max(1, Math.floor((move.effect === MoveEffect.DRAIN ? result.damage : total) / 2)),
      );
      event.messages.push(`${name} drained energy!`);
    }
    if (move.effect === MoveEffect.SELF_DESTRUCT) p.currentHp = 0;
    if (move.effect === MoveEffect.FLINCH && q.currentHp > 0 && rng() < 0.3)
      d.volatile.flinched = true;
    if (move.effect === MoveEffect.RECHARGE && q.currentHp > 0) {
      a.recharging = true;
      event.messages.push(`${name} must recharge!`);
    }
    const skip = [
      MoveEffect.RECOIL,
      MoveEffect.DRAIN,
      MoveEffect.SELF_DESTRUCT,
      MoveEffect.FLINCH,
      MoveEffect.MULTI_HIT,
      MoveEffect.TWO_HIT,
      MoveEffect.RECHARGE,
      MoveEffect.DREAM_EATER,
      MoveEffect.CHARGE,
      MoveEffect.WRAP,
    ];
    if (q.currentHp > 0 && !skip.includes(move.effect!)) effect(true);
  } else effect(false);
  return event;
}
