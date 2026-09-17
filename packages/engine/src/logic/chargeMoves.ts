// Two-turn CHARGE moves (Gen I): SOLAR BEAM, FLY, DIG, RAZOR WIND, SKULL BASH,
// SKY ATTACK. Turn 1 charges and does nothing else; turn 2 runs the move down
// the ordinary path. Pure and Phaser-free so the rules are unit-pinned; the
// scene owns only the sequencing and the sprites.

import { MoveEffect } from '../types/pokemon.types';
import { MOVES_DATA } from '../data/moves';

/**
 * What the user is locked into. Lives on `VolatileStatus.charging`, so it is
 * cleared by everything that clears volatiles: switching out, fainting, the
 * end of the battle.
 */
export interface ChargeState {
  /** Index into the user's own move list — the move turn 2 must dispatch. */
  moveIndex: number;
  /** The move id, so the semi-invulnerable / message lookups need no re-read. */
  moveId: number;
}

/**
 * Turn-1 text, keyed by move id. It follows the ordinary "<mon> used MOVE!"
 * line, as Gen I does: the charging turn announces the move and then says what
 * the user did with it, and the release turn announces the move again so the
 * log always says which turn actually fired. `{NAME}` is the user's battle name
 * (the opponent's is prefixed "Foe ", exactly as `doExecuteMove` does it).
 */
export const CHARGE_MESSAGES: Record<number, string> = {
  13: '{NAME} made a\nwhirlwind!',      // RAZOR WIND
  19: '{NAME} flew up high!',           // FLY
  76: '{NAME} took in\nsunlight!',      // SOLAR BEAM
  91: '{NAME} dug a hole!',             // DIG
  130: '{NAME} lowered\nits head!',     // SKULL BASH
  143: '{NAME} is glowing!',            // SKY ATTACK
};

/** FLY and DIG take the user off the field for the charging turn. */
const SEMI_INVULNERABLE = new Set<number>([19, 91]);

/** True for the six moves tagged `MoveEffect.CHARGE` in `data/moves.ts`. */
export function isChargeMove(moveId: number): boolean {
  return MOVES_DATA[moveId]?.effect === MoveEffect.CHARGE;
}

/**
 * FLY / DIG only: while charging, the user is off the field and everything
 * aimed at it misses (see `evadesSemiInvulnerable` in the engine).
 */
export function isSemiInvulnerableCharge(moveId: number): boolean {
  return SEMI_INVULNERABLE.has(moveId) && isChargeMove(moveId);
}

/** The turn-1 line for a charge move, or null for anything else. */
export function chargeMessage(moveId: number, name: string): string | null {
  const template = CHARGE_MESSAGES[moveId];
  if (template === undefined || !isChargeMove(moveId)) return null;
  return template.replace('{NAME}', name);
}

/**
 * Which half of a two-turn move this use is. A charge state that names THIS
 * move index releases; anything else (no state, or a state left by a different
 * move — METRONOME, a move swapped in mid-battle) starts a fresh charge.
 */
export function resolveChargeStep(
  charging: ChargeState | null | undefined,
  moveIndex: number,
): 'charge' | 'release' {
  return charging && charging.moveIndex === moveIndex ? 'release' : 'charge';
}

/**
 * Every pre-action verdict `BattleEngine.resolvePreAction` can reach. Kept as
 * a string union rather than importing the engine's type, so this module stays
 * a leaf (the engine imports it, not the other way round).
 */
export type PreActionAction =
  | 'recharge' | 'flinch' | 'confusion-snap' | 'confusion-self-hit'
  | 'confusion-attack' | 'sleep-wake' | 'sleep' | 'paralyzed'
  | 'thaw' | 'frozen' | 'attack';

/**
 * Does this pre-action verdict cancel a charge in progress?
 *
 * The user loses the turn AND the stored move: asleep, frozen solid, fully
 * paralysed, flinched, or hurt by its own confusion. Anything that still lets
 * it act (it woke, it thawed, it snapped out, it attacks through confusion)
 * releases as normal, and taking damage never cancels.
 *
 * DEVIATION from Gen I, deliberate: there, sleep/freeze/flinch *pause* a
 * charge and it fires later; only the Gen II rewrite made them cancel it. The
 * paused version needs the user to keep its turn locked across an arbitrary
 * number of turns, which the scene's one-turn lock cannot express — and it is
 * the behaviour the modern games (and players) expect.
 */
export function cancelsCharge(action: PreActionAction): boolean {
  return action === 'sleep' || action === 'frozen' || action === 'paralyzed'
    || action === 'flinch' || action === 'confusion-self-hit';
}

/**
 * Everything that drops a charge outright, with no message of its own: the
 * user left the field. `battle-end` is listed for completeness — the scene
 * tears the state down anyway — so this table reads as the whole rule.
 */
export type ChargeClearingEvent = 'switch-out' | 'faint' | 'battle-end';

export function clearsCharge(event: ChargeClearingEvent): boolean {
  return event === 'switch-out' || event === 'faint' || event === 'battle-end';
}
