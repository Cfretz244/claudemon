// The shared move pipeline.
//
// Everything `BattleScene.executeMove` / `doChargeTurn` / `doExecuteMove`
// decided now lives here: pre-action gating, two-turn charges, PP and
// Struggle, Metronome, accuracy (including semi-invulnerable targets), crit,
// damage, multi-hit, the special-damage effects, secondary effects, recoil and
// drain, disable, recharge — and the exact battle text that goes with them.
//
// The scene became a renderer of the `MoveEvent` this returns: it shows
// `before`, plays the animation, commits the staged state with
// `applyMoveEvent`, plays the SFX/tweens the event's semantic flags ask for,
// and shows `messages`. No asset strings live here; `hitFlash`,
// `effectivenessSfx` and friends are semantic, and the renderer maps them to
// sounds and clips.
//
// Three invariants the structure exists to protect:
//
//  1. **RNG order.** Every draw goes through the injected `rng`, in the same
//     order the scene drew them. `packages/engine/tests/moveParity.test.ts`
//     compares the seed state against a byte-copy of the old scene code.
//  2. **#87.** Accuracy, crit and damage are resolved BEFORE the animation
//     plays, so the picture can show what is about to happen — but the HP and
//     status they imply are *staged*, not applied. `executeBattleMove` returns
//     with the model untouched past that point; the scene calls
//     `applyMoveEvent` AFTER the animation, exactly where it used to subtract
//     HP. Anything sampling the model mid-animation still sees pre-move HP.
//  3. **Text.** Every string here is byte-identical to the scene's, including
//     the `Foe ` prefix (used/charge/recoil/drain/recharge lines carry it; the
//     pre-action lines and the move-effect lines never did), the hand-authored
//     `\n` line breaks, and `getEffectivenessText` as the single source of the
//     effectiveness vocabulary.

import {
  PokemonInstance,
  MoveEffect,
  MoveCategory,
  StatusCondition,
  PHYSICAL_TYPES,
} from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';
import { POKEMON_DATA } from '../data/pokemon';
import { getEffectivenessText } from '../data/typeChart';
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
  PreActionAction,
} from '../logic/chargeMoves';
import { outcomeFor, MoveOutcome } from '../logic/animationOutcome';
import { Rng } from '../random/seed';

/** STRUGGLE's id in `MOVES_DATA`. */
export const STRUGGLE_MOVE_ID = 165;

/**
 * One side of the battle: the Pokemon plus the per-battle state the scene used
 * to hold in `playerStatStages` / `opponentVolatile` / `playerDisable` /
 * `opponentRecharging`. The scene passes its own live objects, so a commit
 * writes straight through to the HUD's source of truth.
 */
export interface Combatant {
  pokemon: PokemonInstance;
  stages: StatStages;
  volatile: VolatileStatus;
  disable: DisableState;
  /** Hyper Beam's "must skip next turn" flag (`playerRecharging` on the scene). */
  recharging: boolean;
}

export interface MoveContext {
  attacker: Combatant;
  defender: Combatant;
  /** Index into `attacker.pokemon.moves` — the slot the user selected. */
  moveIndex: number;
  /** Drives the `Foe ` prefix and which HP bar the renderer tweens. */
  attackerIsPlayer: boolean;
}

/** How far the move got. Each value maps to one shape of the old scene code. */
export type MoveResolution =
  /** Stopped before the move ran (asleep, flinched, recharging, ...). */
  | 'pre-action'
  /** Turn 1 of a two-turn CHARGE move. */
  | 'charge'
  /** The selected slot is out of PP while another slot still has some. */
  | 'no-pp'
  /** MIRROR MOVE, or DREAM EATER on a target that is not asleep. No animation. */
  | 'failed'
  | 'miss'
  /** OHKO against a faster target, or COUNTER with nothing to counter. */
  | 'special-failed'
  /** OHKO / SONIC BOOM / SEISMIC TOSS / SUPER FANG / COUNTER landed. */
  | 'special-hit'
  /** 0x type match-up. */
  | 'immune'
  | 'damage'
  /** A status move that passed its accuracy check. */
  | 'status';

/** A stat stage the move moved, for a renderer that wants to show it. */
export interface StageChange {
  stat: keyof StatStages;
  from: number;
  to: number;
}

/** What the move did to one side, as data rather than as mutations. */
export interface SideChange {
  hpBefore: number;
  hpAfter: number;
  /** Negative for damage, positive for a drain / heal. */
  hpDelta: number;
  fainted: boolean;
  statusBefore: StatusCondition;
  statusAfter: StatusCondition;
  statusChanged: boolean;
  stageChanges: StageChange[];
}

/**
 * Everything the renderer needs in order to pick sounds and tweens, with no
 * asset strings crossing the boundary. Each flag is exactly one thing the old
 * scene did at that point.
 */
export interface MovePresentation {
  /**
   * #116: the HUD is refreshed in the same tick the `before` lines go up, so a
   * badge the pre-action just cleared (SLP on a wake, FRZ on a thaw) and the
   * HP a confusion self-hit just took are already gone while the text is read.
   */
  refreshHudBefore: boolean;
  /** The struck sprite's blink: `alpha 0, duration 80, yoyo, repeat 2`. */
  hitFlash: boolean;
  /** The generic impact sound. Damage and special damage only — never status. */
  impactSfx: boolean;
  /** The extra effectiveness cue, played just before the impact sound. */
  effectivenessSfx: 'super' | 'weak' | null;
  /** Tween the attacker's HP bar (status moves that healed or hurt the user). */
  animateAttackerHp: boolean;
  /** Tween the defender's HP bar. */
  animateDefenderHp: boolean;
  /** Redraw the whole HUD once the bars land, before `messages` go up. */
  refreshHudAfter: boolean;
}

/** The staged post-animation state of one side (see `applyMoveEvent`). */
export interface CombatantState {
  currentHp: number;
  status: StatusCondition;
  /** Per move slot, in `pokemon.moves` order. */
  pp: number[];
  stages: StatStages;
  volatile: VolatileStatus;
  disable: DisableState;
  recharging: boolean;
}

export interface MoveEvent {
  /** Which side acted. The renderer needs it for the bars and the sprites. */
  actorIsPlayer: boolean;
  /** The user's battle name, `Foe `-prefixed for the opponent. */
  actorName: string;
  resolution: MoveResolution;

  // --- pre-action -----------------------------------------------------------
  preAction: PreActionAction;
  /** A charge in progress was thrown away: put a hidden FLY/DIG user back. */
  chargeCancelled: boolean;

  // --- what was thrown ------------------------------------------------------
  /** The move that actually executed (after Metronome / Struggle), or null. */
  moveId: number | null;
  moveName: string | null;
  /** The move the user selected, before Metronome / Struggle rewrote it. */
  selectedMoveId: number | null;
  struggle: boolean;
  /** The move Metronome rolled, or null. */
  metronomeMoveId: number | null;
  /** Which half of a two-turn move this was. */
  phase?: 'charge' | 'release';
  /** True when a PP point came off the selected slot this turn. */
  ppSpent: boolean;
  ppRemaining: number | null;

  // --- text -----------------------------------------------------------------
  /** Lines shown BEFORE the animation. */
  before: string[];
  /** Lines shown AFTER it. */
  messages: string[];

  // --- the picture ----------------------------------------------------------
  /** `null` when no animation plays at all (pre-action, Mirror Move, no PP). */
  animation: { moveId: number; phase?: 'charge' | 'release' } | null;
  /** #87: the tier-4 outcome, resolved before the animation. */
  outcome?: MoveOutcome;
  presentation: MovePresentation;

  // --- numbers --------------------------------------------------------------
  hit: boolean;
  crit: boolean;
  /** The type multiplier, when the move took the normal damage path. */
  effectiveness: number | null;
  hitCount: number;
  /** Total HP the defender lost to the move itself (not to recoil). */
  damage: number;
  recoil: number;
  drain: number;
  /** The attacker must skip its next turn (Hyper Beam). */
  recharge: boolean;
  /** The defender was disabled: the slot and the turn count DISABLE set. */
  disable: DisableState | null;
  attacker: SideChange;
  defender: SideChange;

  /**
   * The post-animation state, staged rather than applied (#87). `null` when the
   * move stopped before it could change anything. `applyMoveEvent` commits it.
   */
  commit: { attacker: CombatantState; defender: CombatantState } | null;
}

/** The scene's `getSpeciesName`: no nickname, `#id` for an unmodelled species. */
export function speciesName(speciesId: number): string {
  return POKEMON_DATA[speciesId]?.name || `#${speciesId}`;
}

/** The battle name: the opponent's is prefixed `Foe `, the player's is not. */
export function battleName(speciesId: number, isPlayer: boolean): string {
  return isPlayer ? speciesName(speciesId) : `Foe ${speciesName(speciesId)}`;
}

export function freshStages(): StatStages {
  return { atk: 0, def: 0, spd: 0, spc: 0, acc: 0, eva: 0 };
}

export function freshVolatile(): VolatileStatus {
  return {
    confused: 0,
    seeded: false,
    flinched: false,
    lastDamageTaken: 0,
    lastDamagePhysical: false,
    substitute: 0,
    charging: null,
  };
}

/** A combatant with clean per-battle state, for tests and headless consumers. */
export function combatant(pokemon: PokemonInstance): Combatant {
  return {
    pokemon,
    stages: freshStages(),
    volatile: freshVolatile(),
    disable: { moveIndex: -1, turnsLeft: 0 },
    recharging: false,
  };
}

const STAT_KEYS: (keyof StatStages)[] = ['atk', 'def', 'spd', 'spc', 'acc', 'eva'];

/** A detached copy the staged half runs against, so the model stays untouched. */
function detach(c: Combatant): Combatant {
  const volatileCopy: VolatileStatus = { ...c.volatile };
  if (volatileCopy.charging) volatileCopy.charging = { ...volatileCopy.charging };
  return {
    // `stats` / `ivs` / `evs` are read-only to the move pipeline, so they stay shared.
    pokemon: { ...c.pokemon, moves: c.pokemon.moves.map(m => ({ ...m })) },
    stages: { ...c.stages },
    volatile: volatileCopy,
    disable: { ...c.disable },
    recharging: c.recharging,
  };
}

function snapshot(c: Combatant): CombatantState {
  const volatileCopy: VolatileStatus = { ...c.volatile };
  if (volatileCopy.charging) volatileCopy.charging = { ...volatileCopy.charging };
  return {
    currentHp: c.pokemon.currentHp,
    status: c.pokemon.status,
    pp: c.pokemon.moves.map(m => m.currentPp),
    stages: { ...c.stages },
    volatile: volatileCopy,
    disable: { ...c.disable },
    recharging: c.recharging,
  };
}

function commitSide(c: Combatant, state: CombatantState): void {
  c.pokemon.currentHp = state.currentHp;
  c.pokemon.status = state.status;
  state.pp.forEach((pp, i) => {
    const slot = c.pokemon.moves[i];
    if (slot) slot.currentPp = pp;
  });
  Object.assign(c.stages, state.stages);
  Object.assign(c.volatile, state.volatile);
  Object.assign(c.disable, state.disable);
  c.recharging = state.recharging;
}

/**
 * Commit the state `executeBattleMove` staged. The scene calls this once the
 * animation has finished — the same instant the old `doExecuteMove` subtracted
 * HP — so the #87 ordering (rolls before the picture, mutations after it) is
 * preserved. Idempotent, and a no-op for an event with nothing staged.
 */
export function applyMoveEvent(ctx: MoveContext, event: MoveEvent): void {
  if (!event.commit) return;
  commitSide(ctx.attacker, event.commit.attacker);
  commitSide(ctx.defender, event.commit.defender);
}

function sideChange(before: Combatant, after: Combatant): SideChange {
  const hpBefore = before.pokemon.currentHp;
  const hpAfter = after.pokemon.currentHp;
  const stageChanges: StageChange[] = [];
  for (const stat of STAT_KEYS) {
    if (before.stages[stat] !== after.stages[stat]) {
      stageChanges.push({ stat, from: before.stages[stat], to: after.stages[stat] });
    }
  }
  return {
    hpBefore,
    hpAfter,
    hpDelta: hpAfter - hpBefore,
    fainted: hpAfter <= 0 && hpBefore > 0,
    statusBefore: before.pokemon.status,
    statusAfter: after.pokemon.status,
    statusChanged: before.pokemon.status !== after.pokemon.status,
    stageChanges,
  };
}

/** The pre-action verdicts that still let the user throw its move. */
const ACTS_ANYWAY: PreActionAction[] = ['attack', 'confusion-attack', 'confusion-snap', 'thaw'];

/**
 * The pre-action lines, byte-identical to the scene's. These use the BARE
 * species name — the `Foe ` prefix only ever appeared on the used/charge/
 * recoil/drain/recharge lines.
 */
const PRE_ACTION_TEXT: Record<Exclude<PreActionAction, 'attack'>, string[]> = {
  recharge: ['{NAME} must recharge!'],
  flinch: ['{NAME} flinched!'],
  'confusion-snap': ['{NAME} snapped out\nof confusion!'],
  'confusion-self-hit': ['{NAME} is confused!', 'It hurt itself in\nits confusion!'],
  'confusion-attack': ['{NAME} is confused!'],
  'sleep-wake': ['{NAME} woke up!'],
  sleep: ['{NAME} is fast\nasleep!'],
  paralyzed: ['{NAME} is fully\nparalyzed!'],
  frozen: ['{NAME} is frozen\nsolid!'],
  thaw: ['{NAME} thawed out!'],
};

/** #116: which pre-action verdicts redraw the HUD in the same tick as the text. */
const PRE_ACTION_REFRESHES_HUD: PreActionAction[] = ['confusion-self-hit', 'sleep-wake', 'thaw'];

/** The secondary effects the damage path applies inline rather than generically. */
const SKIP_SECONDARY: MoveEffect[] = [
  MoveEffect.RECOIL, MoveEffect.DRAIN, MoveEffect.SELF_DESTRUCT,
  MoveEffect.FLINCH, MoveEffect.MULTI_HIT, MoveEffect.TWO_HIT,
  MoveEffect.RECHARGE, MoveEffect.DREAM_EATER, MoveEffect.CHARGE,
  MoveEffect.WRAP,
];

/**
 * Run one move. Mutates only what the scene mutated before the animation
 * (the pre-action state, the charge lock, the PP); everything the scene did
 * after the animation is staged on the event for `applyMoveEvent`.
 */
export function executeBattleMove(ctx: MoveContext, rng: Rng = Math.random): MoveEvent {
  const { attacker: a, defender: d, moveIndex: index, attackerIsPlayer: isPlayer } = ctx;
  const p = a.pokemon;
  const q = d.pokemon;
  const name = speciesName(p.speciesId);
  const actorName = battleName(p.speciesId, isPlayer);

  const event: MoveEvent = {
    actorIsPlayer: isPlayer,
    actorName,
    resolution: 'pre-action',
    preAction: 'attack',
    chargeCancelled: false,
    moveId: null,
    moveName: null,
    selectedMoveId: p.moves[index]?.moveId ?? null,
    struggle: false,
    metronomeMoveId: null,
    ppSpent: false,
    ppRemaining: null,
    before: [],
    messages: [],
    animation: null,
    presentation: {
      refreshHudBefore: false,
      hitFlash: false,
      impactSfx: false,
      effectivenessSfx: null,
      animateAttackerHp: false,
      animateDefenderHp: false,
      refreshHudAfter: false,
    },
    hit: false,
    crit: false,
    effectiveness: null,
    hitCount: 0,
    damage: 0,
    recoil: 0,
    drain: 0,
    recharge: false,
    disable: null,
    attacker: sideChange(a, a),
    defender: sideChange(d, d),
    commit: null,
  };

  // === pre-action ==========================================================
  // `resolvePreAction` mutates the attacker (wake, thaw, confusion countdown,
  // flinch clear, confusion self-damage) exactly where the scene let it, i.e.
  // before any text: the HUD refresh below has to see the new state.
  const beforePre = detach(a);
  const pre = resolvePreAction(p, a.volatile, a.recharging, rng);
  event.preAction = pre.action;
  event.chargeCancelled = pre.chargeCancelled === true;
  if (pre.action === 'recharge') a.recharging = false;
  if (pre.action !== 'attack') {
    event.before.push(...PRE_ACTION_TEXT[pre.action].map(line => line.replace('{NAME}', name)));
  }
  event.presentation.refreshHudBefore = PRE_ACTION_REFRESHES_HUD.includes(pre.action);
  event.attacker = sideChange(beforePre, a);
  if (!ACTS_ANYWAY.includes(pre.action)) return event;

  // === two-turn CHARGE moves ===============================================
  // The charge block runs BEFORE the Struggle gate on purpose: a FLY/DIG user
  // that has run out of PP must still release (and come back onto the field)
  // rather than Struggle with `volatile.charging` left set, which would leave
  // it semi-invulnerable and sprite-hidden forever.
  const slot = p.moves[index];
  if (slot && isChargeMove(slot.moveId)) {
    const step = resolveChargeStep(a.volatile.charging, index);
    event.phase = step;
    if (step === 'charge') {
      a.volatile.charging = { moveIndex: index, moveId: slot.moveId };
      const chargeData = MOVES_DATA[slot.moveId];
      event.resolution = 'charge';
      event.moveId = slot.moveId;
      event.moveName = chargeData?.name ?? null;
      event.before.push(`${actorName} used\n${chargeData?.name}!`);
      const line = chargeMessage(slot.moveId, actorName);
      if (line) event.before.push(line);
      event.animation = { moveId: slot.moveId, phase: 'charge' };
      return event;
    }
    // Releasing: the lock clears BEFORE the move runs, so a miss clears it too.
    a.volatile.charging = null;
  }

  // === PP / Struggle =======================================================
  // DELIBERATE CHANGE vs the old scene, which had no PP gate at all and simply
  // executed a 0-PP move with `currentPp` clamped at 0. Unreachable from the
  // Phaser menu (`BattleMenu` blocks an empty slot) and from the AI (which
  // filters on PP); it fires for a fully exhausted combatant, where the old
  // scene would have re-used a spent move.
  const struggle = !p.moves.some(m => m.currentPp > 0);
  event.struggle = struggle;
  if (!struggle && (!slot || slot.currentPp <= 0)) {
    event.resolution = 'no-pp';
    event.messages.push('There is no PP left for this move.');
    return event;
  }

  let id = struggle ? STRUGGLE_MOVE_ID : slot.moveId;
  let move = MOVES_DATA[id];
  if (!move) return event;

  // PP comes off on the turn the move actually executes. Gen I deducts SOLAR
  // BEAM's PP on the release turn: an interrupted charge costs nothing, a full
  // two-turn use costs exactly 1.
  if (!struggle) {
    slot.currentPp = Math.max(0, slot.currentPp - 1);
    event.ppSpent = true;
    event.ppRemaining = slot.currentPp;
  }

  event.moveId = id;
  event.moveName = move.name;
  event.before.push(`${actorName} used\n${move.name}!`);

  // === Metronome ===========================================================
  if (move.effect === MoveEffect.METRONOME) {
    const allMoveIds = Object.keys(MOVES_DATA).map(Number).filter(mid => {
      const m = MOVES_DATA[mid];
      return m && m.effect !== MoveEffect.METRONOME && m.effect !== MoveEffect.MIRROR_MOVE;
    });
    const randomId = allMoveIds[Math.floor(rng() * allMoveIds.length)];
    const randomMove = MOVES_DATA[randomId];
    if (randomMove) {
      id = randomId;
      move = randomMove;
      event.metronomeMoveId = randomId;
      event.moveId = randomId;
      event.moveName = randomMove.name;
      event.before.push(`It became\n${randomMove.name}!`);
      // The rolled move announces itself too — the scene recursed into
      // `doExecuteMove`, which printed its own "used" line before animating.
      event.before.push(`${actorName} used\n${randomMove.name}!`);
    }
  }

  // === moves that fail outright (no animation) =============================
  if (
    move.effect === MoveEffect.MIRROR_MOVE
    || (move.effect === MoveEffect.DREAM_EATER && q.status !== StatusCondition.SLEEP)
  ) {
    event.resolution = 'failed';
    event.messages.push('But it failed!');
    return event;
  }

  // === accuracy, crit and damage — all before the animation (#87) ===========
  const defenderSemiInvulnerable =
    !!d.volatile.charging && isSemiInvulnerableCharge(d.volatile.charging.moveId);
  const hit = !evadesSemiInvulnerable(move.accuracy, defenderSemiInvulnerable)
    && checkAccuracy(move, a.stages.acc, d.stages.eva, rng);
  const damaging = hit && move.power > 0 && move.category !== MoveCategory.STATUS;
  const crit = damaging ? checkCritical(p, rng) : false;
  const result = damaging
    ? calculateDamage(p, q, move, crit, a.stages, d.stages, rng)
    : undefined;

  event.hit = hit;
  event.crit = crit;
  event.outcome = outcomeFor(hit, result, move);
  event.animation = { moveId: id, phase: event.phase };

  if (!hit) {
    event.resolution = 'miss';
    event.messages.push('But it missed!');
    return event;
  }

  // === everything past here is STAGED ======================================
  // It runs against detached copies, so the model the animation is drawn over
  // still holds pre-move HP. `applyMoveEvent` writes it back afterwards.
  const stagedA = detach(a);
  const stagedD = detach(d);
  const sp = stagedA.pokemon;
  const sq = stagedD.pokemon;
  const messages = event.messages;
  const pres = event.presentation;

  const stage = () => {
    event.commit = { attacker: snapshot(stagedA), defender: snapshot(stagedD) };
    event.attacker = sideChange(beforePre, stagedA);
    event.defender = sideChange(d, stagedD);
    if (stagedD.disable.turnsLeft > 0 && stagedD.disable.moveIndex !== d.disable.moveIndex) {
      event.disable = { ...stagedD.disable };
    }
    return event;
  };

  const runEffect = (isSecondary: boolean) => {
    if (!move.effect) return;
    applyMoveEffect(move.effect, {
      attacker: sp,
      defender: sq,
      atkName: speciesName(sp.speciesId),
      defName: speciesName(sq.speciesId),
      atkStages: stagedA.stages,
      defStages: stagedD.stages,
      atkVolatile: stagedA.volatile,
      defVolatile: stagedD.volatile,
      defDisable: stagedD.disable,
      isSecondary,
      rng,
    }, messages);
  };

  // === special damage (bypasses the normal formula) ========================
  const special = applySpecialDamage(
    move.effect, id, sp, sq, stagedA.volatile, stagedD.volatile, rng,
  );
  if (special.kind === 'failed') {
    event.resolution = 'special-failed';
    messages.push(...special.messages);
    return stage();
  }
  if (special.kind === 'hit') {
    event.resolution = 'special-hit';
    messages.push(...special.messages);
    event.damage = d.pokemon.currentHp - sq.currentHp;
    pres.impactSfx = true;
    pres.hitFlash = true;
    pres.animateDefenderHp = true;
    pres.refreshHudAfter = true;
    return stage();
  }

  // === normal damage =======================================================
  if (move.power > 0 && move.category !== MoveCategory.STATUS) {
    // `result` is always defined here: `damaging` is `hit && power > 0 &&
    // !STATUS`, and the miss already returned.
    const dmg = result!;
    event.effectiveness = dmg.effectiveness;

    if (dmg.effectiveness === 0) {
      event.resolution = 'immune';
      messages.push(getEffectivenessText(0));
      return stage();
    }

    event.resolution = 'damage';
    const hitCount = rollHitCount(move.effect, rng);
    const totalDamage = dmg.damage * hitCount;
    event.hitCount = hitCount;

    stagedD.volatile.lastDamageTaken = totalDamage;
    stagedD.volatile.lastDamagePhysical = PHYSICAL_TYPES.includes(move.type);
    sq.currentHp = Math.max(0, sq.currentHp - totalDamage);
    event.damage = d.pokemon.currentHp - sq.currentHp;

    if (dmg.isCritical) messages.push('A critical hit!');
    if (hitCount > 1) messages.push(`Hit ${hitCount} times!`);

    const effText = getEffectivenessText(dmg.effectiveness);
    if (effText) {
      messages.push(effText);
      pres.effectivenessSfx = dmg.effectiveness > 1 ? 'super' : 'weak';
    }
    pres.impactSfx = true;

    if (move.effect === MoveEffect.RECOIL) {
      const recoilDmg = Math.max(1, Math.floor(dmg.damage / 4));
      sp.currentHp = Math.max(0, sp.currentHp - recoilDmg);
      event.recoil = recoilDmg;
      messages.push(`${actorName} is hit\nwith recoil!`);
    }

    if (move.effect === MoveEffect.DRAIN) {
      const drainAmt = Math.max(1, Math.floor(dmg.damage / 2));
      sp.currentHp = Math.min(sp.stats.hp, sp.currentHp + drainAmt);
      event.drain = drainAmt;
      messages.push(`${actorName} drained\nenergy!`);
    }

    if (move.effect === MoveEffect.SELF_DESTRUCT) sp.currentHp = 0;

    if (move.effect === MoveEffect.FLINCH && sq.currentHp > 0) {
      if (rng() < 0.3) stagedD.volatile.flinched = true;
    }

    if (move.effect === MoveEffect.RECHARGE && sq.currentHp > 0) {
      stagedA.recharging = true;
      event.recharge = true;
      messages.push(`${actorName} must\nrecharge!`);
    }

    if (move.effect === MoveEffect.DREAM_EATER) {
      const drainAmt = Math.max(1, Math.floor(totalDamage / 2));
      sp.currentHp = Math.min(sp.stats.hp, sp.currentHp + drainAmt);
      event.drain = drainAmt;
      messages.push(`${actorName} drained\nenergy!`);
    }

    if (move.effect && sq.currentHp > 0 && !SKIP_SECONDARY.includes(move.effect)) {
      runEffect(true);
    }

    // Only the struck side's bar tweens; the attacker's recoil / drain is
    // snapped in by the HUD refresh, exactly as the scene did it.
    pres.hitFlash = true;
    pres.animateDefenderHp = true;
    pres.refreshHudAfter = true;
    return stage();
  }

  // === status move =========================================================
  event.resolution = 'status';
  const atkHpBefore = sp.currentHp;
  const defHpBefore = sq.currentHp;
  runEffect(false);
  pres.animateAttackerHp = sp.currentHp !== atkHpBefore;
  pres.animateDefenderHp = sq.currentHp !== defHpBefore;
  pres.refreshHudAfter = true;
  return stage();
}
