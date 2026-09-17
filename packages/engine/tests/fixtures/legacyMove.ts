// A byte-verified copy of the move pipeline as `src/scenes/BattleScene.ts`
// wrote it on main (`executeMove`, `doChargeTurn`, `doExecuteMove`,
// `applyDamageAnimation`), with the Phaser surface replaced by a trace
// recorder. It exists so `moveParity.test.ts` can prove that
// `executeBattleMove` + the scene renderer produce the same battle, message
// for message and draw for draw.
//
// Rules for editing: this file is NOT to be "improved". It is the oracle. If
// the engine and the fixture disagree, one of them is wrong and the diff has
// to be explained, not smoothed over. The only intentional departures from
// main's text are the Phaser calls that became trace lines:
//
//   textBox.show(lines, cb)  -> 'msg:<line>' per line, then cb()
//   playMoveAnimation(id)    -> 'anim:<id>:<phase>:<outcome>'
//   soundSystem.hit()        -> 'sfx:hit'   (super/notVery -> 'sfx:super'/'sfx:weak')
//   tweens.add(flash)        -> 'flash'
//   hud.animate*HP(ratio)    -> 'bar:<side>:<ratio>'
//   updateHUD()              -> 'hud'
//   clearCharge(isPlayer)    -> 'unhide:<side>'
//
// Everything reachable through `Math.random` is left calling `Math.random`,
// exactly as main did; the test stubs it with a seeded stream so the draw
// count and the draw order can be compared against the engine's injected rng.

import {
  PokemonInstance,
  MoveCategory,
  MoveEffect,
  StatusCondition,
  PHYSICAL_TYPES,
} from '../../src/types/pokemon.types';
import { MOVES_DATA } from '../../src/data/moves';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { getEffectivenessText } from '../../src/data/typeChart';
import { calculateDamage, checkCritical, checkAccuracy } from '../../src/systems/DamageCalculator';
import {
  StatStages,
  VolatileStatus,
  DisableState,
  EffectContext,
  resolvePreAction,
  evadesSemiInvulnerable,
  applySpecialDamage,
  applyMoveEffect,
  rollHitCount,
} from '../../src/systems/BattleEngine';
import {
  isChargeMove,
  isSemiInvulnerableCharge,
  chargeMessage,
  resolveChargeStep,
} from '../../src/logic/chargeMoves';
import { outcomeFor, MoveOutcome } from '../../src/logic/animationOutcome';

/** The slice of `BattleScene` state the move pipeline reads and writes. */
export interface LegacyState {
  playerPokemon: PokemonInstance;
  opponentPokemon: PokemonInstance;
  playerStatStages: StatStages;
  opponentStatStages: StatStages;
  playerVolatile: VolatileStatus;
  opponentVolatile: VolatileStatus;
  playerDisable: DisableState;
  opponentDisable: DisableState;
  playerRecharging: boolean;
  opponentRecharging: boolean;
}

const outcomeTag = (o: MoveOutcome | undefined): string =>
  o ? `${o.kind}/${o.critical ? 1 : 0}/${o.effectiveness ?? '-'}` : '-';

/**
 * Run one move against `s`, mutating it the way the scene did, and return the
 * trace. `Math.random` is whatever the caller has installed.
 */
export function runLegacyMove(s: LegacyState, index: number, isPlayer: boolean): Promise<string[]> {
  const trace: string[] = [];
  const attacker = isPlayer ? s.playerPokemon : s.opponentPokemon;
  const defender = isPlayer ? s.opponentPokemon : s.playerPokemon;
  const move = attacker.moves[index];
  const moveData = MOVES_DATA[move.moveId];

  const getSpeciesName = (speciesId: number) => POKEMON_DATA[speciesId]?.name || `#${speciesId}`;
  const show = (lines: string[], cb?: () => void) => {
    for (const line of lines) trace.push(`msg:${line}`);
    cb?.();
  };
  const updateHUD = () => { trace.push('hud'); };
  const clearCharge = (mine: boolean) => {
    const vol = mine ? s.playerVolatile : s.opponentVolatile;
    vol.charging = null;
    trace.push(`unhide:${mine ? 'player' : 'opponent'}`);
  };
  const animateHp = (mine: boolean, mon: PokemonInstance): Promise<void> => {
    trace.push(`bar:${mine ? 'player' : 'opponent'}:${mon.currentHp / mon.stats.hp}`);
    return Promise.resolve();
  };
  const playMoveAnimation = (
    moveId: number, phase: string | undefined, outcome: MoveOutcome | undefined,
  ): Promise<void> => {
    trace.push(`anim:${moveId}:${phase ?? '-'}:${outcomeTag(outcome)}`);
    return Promise.resolve();
  };

  return new Promise<string[]>((done) => {
    const resolve = () => done(trace);

    // === BattleScene.doExecuteMove =========================================
    const doExecuteMove = (
      mv: { moveId: number; currentPp: number; maxPp: number },
      md: typeof moveData,
      resolveInner: () => void,
      phase?: 'charge' | 'release',
    ): void => {
      const defVol = isPlayer ? s.opponentVolatile : s.playerVolatile;

      mv.currentPp = Math.max(0, mv.currentPp - 1);

      const attackerName = isPlayer
        ? getSpeciesName(attacker.speciesId)
        : `Foe ${getSpeciesName(attacker.speciesId)}`;

      const usedMessage = `${attackerName} used\n${md.name}!`;

      // Metronome: pick a random move and execute it instead
      if (md.effect === MoveEffect.METRONOME) {
        const allMoveIds = Object.keys(MOVES_DATA).map(Number).filter(id => {
          const m = MOVES_DATA[id];
          return m && m.effect !== MoveEffect.METRONOME && m.effect !== MoveEffect.MIRROR_MOVE;
        });
        const randomId = allMoveIds[Math.floor(Math.random() * allMoveIds.length)];
        const randomMove = MOVES_DATA[randomId];
        if (randomMove) {
          show([usedMessage, `It became\n${randomMove.name}!`], () => {
            const fakeMove = { moveId: randomId, currentPp: 1, maxPp: 1 };
            doExecuteMove(fakeMove, randomMove, resolveInner);
          });
          return;
        }
      }

      if (md.effect === MoveEffect.MIRROR_MOVE) {
        show([usedMessage, 'But it failed!'], resolveInner);
        return;
      }

      if (md.effect === MoveEffect.DREAM_EATER) {
        if (defender.status !== StatusCondition.SLEEP) {
          show([usedMessage, 'But it failed!'], resolveInner);
          return;
        }
      }

      const atkStages = isPlayer ? s.playerStatStages : s.opponentStatStages;
      const defStages = isPlayer ? s.opponentStatStages : s.playerStatStages;
      const defenderSemiInvulnerable =
        !!defVol.charging && isSemiInvulnerableCharge(defVol.charging.moveId);
      const hit = !evadesSemiInvulnerable(md.accuracy, defenderSemiInvulnerable)
        && checkAccuracy(md, atkStages.acc, defStages.eva);

      const damaging = hit && md.power > 0 && md.category !== MoveCategory.STATUS;
      const preCrit = damaging ? checkCritical(attacker) : false;
      const preResult = damaging
        ? calculateDamage(attacker, defender, md, preCrit, atkStages, defStages)
        : undefined;
      const outcome = outcomeFor(hit, preResult, md);

      show([usedMessage], async () => {
        await playMoveAnimation(mv.moveId, phase, outcome);

        if (!hit) {
          show(['But it missed!'], resolveInner);
          return;
        }

        const messages: string[] = [];

        const atkVol = isPlayer ? s.playerVolatile : s.opponentVolatile;
        const buildEffectCtx = (isSecondary: boolean): EffectContext => ({
          attacker, defender,
          atkName: getSpeciesName(attacker.speciesId),
          defName: getSpeciesName(defender.speciesId),
          atkStages, defStages,
          atkVolatile: atkVol, defVolatile: defVol,
          defDisable: isPlayer ? s.opponentDisable : s.playerDisable,
          isSecondary,
        });

        const special = applySpecialDamage(md.effect, mv.moveId, attacker, defender, atkVol, defVol);
        if (special.kind === 'failed') {
          messages.push(...special.messages);
          show(messages, resolveInner);
          return;
        }
        if (special.kind === 'hit') {
          messages.push(...special.messages);
          trace.push('sfx:hit');
          // applyDamageAnimation
          const hpPromise = animateHp(!isPlayer, defender);
          trace.push('flash');
          void hpPromise.then(() => {
            updateHUD();
            show(messages, resolveInner);
          });
          return;
        }

        if (md.power > 0 && md.category !== MoveCategory.STATUS) {
          const isCrit = preCrit;
          const result = preResult
            ?? calculateDamage(attacker, defender, md, isCrit, atkStages, defStages);

          if (result.effectiveness === 0) {
            messages.push(getEffectivenessText(0));
            show(messages, resolveInner);
            return;
          }

          const hitCount = rollHitCount(md.effect);
          const totalDamage = result.damage * hitCount;

          defVol.lastDamageTaken = totalDamage;
          defVol.lastDamagePhysical = PHYSICAL_TYPES.includes(md.type);

          defender.currentHp = Math.max(0, defender.currentHp - totalDamage);

          if (result.isCritical) messages.push('A critical hit!');
          if (hitCount > 1) messages.push(`Hit ${hitCount} times!`);

          const effText = getEffectivenessText(result.effectiveness);
          if (effText) {
            messages.push(effText);
            if (result.effectiveness > 1) trace.push('sfx:super');
            else if (result.effectiveness < 1) trace.push('sfx:weak');
          }

          trace.push('sfx:hit');

          if (md.effect === MoveEffect.RECOIL) {
            const recoilDmg = Math.max(1, Math.floor(result.damage / 4));
            attacker.currentHp = Math.max(0, attacker.currentHp - recoilDmg);
            messages.push(`${attackerName} is hit\nwith recoil!`);
          }

          if (md.effect === MoveEffect.DRAIN) {
            const drainAmt = Math.max(1, Math.floor(result.damage / 2));
            attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + drainAmt);
            messages.push(`${attackerName} drained\nenergy!`);
          }

          if (md.effect === MoveEffect.SELF_DESTRUCT) attacker.currentHp = 0;

          if (md.effect === MoveEffect.FLINCH && defender.currentHp > 0) {
            if (Math.random() < 0.3) defVol.flinched = true;
          }

          if (md.effect === MoveEffect.RECHARGE && defender.currentHp > 0) {
            if (isPlayer) s.playerRecharging = true;
            else s.opponentRecharging = true;
            messages.push(`${attackerName} must\nrecharge!`);
          }

          if (md.effect === MoveEffect.DREAM_EATER) {
            const drainAmt = Math.max(1, Math.floor(totalDamage / 2));
            attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + drainAmt);
            messages.push(`${attackerName} drained\nenergy!`);
          }

          const SKIP_SECONDARY = [
            MoveEffect.RECOIL, MoveEffect.DRAIN, MoveEffect.SELF_DESTRUCT,
            MoveEffect.FLINCH, MoveEffect.MULTI_HIT, MoveEffect.TWO_HIT,
            MoveEffect.RECHARGE, MoveEffect.DREAM_EATER, MoveEffect.CHARGE,
            MoveEffect.WRAP,
          ];
          if (md.effect && defender.currentHp > 0 && !SKIP_SECONDARY.includes(md.effect)) {
            applyMoveEffect(md.effect, buildEffectCtx(true), messages);
          }

          const hpPromise = animateHp(!isPlayer, defender);
          trace.push('flash');

          void hpPromise.then(() => {
            updateHUD();
            if (messages.length > 0) show(messages, resolveInner);
            else resolveInner();
          });
        } else {
          const atkHpBefore = attacker.currentHp;
          const defHpBefore = defender.currentHp;
          if (md.effect) applyMoveEffect(md.effect, buildEffectCtx(false), messages);

          const bars: Promise<void>[] = [];
          const animate = (mine: boolean, mon: PokemonInstance) => bars.push(animateHp(mine, mon));
          if (attacker.currentHp !== atkHpBefore) animate(isPlayer, attacker);
          if (defender.currentHp !== defHpBefore) animate(!isPlayer, defender);
          void Promise.all(bars).then(() => {
            updateHUD();
            if (messages.length > 0) show(messages, resolveInner);
            else resolveInner();
          });
        }
      });
    };

    // === BattleScene.doChargeTurn ==========================================
    const doChargeTurn = (moveIndex: number, resolveInner: () => void): void => {
      const atkVol = isPlayer ? s.playerVolatile : s.opponentVolatile;
      atkVol.charging = { moveIndex, moveId: move.moveId };

      const attackerName = isPlayer
        ? getSpeciesName(attacker.speciesId)
        : `Foe ${getSpeciesName(attacker.speciesId)}`;
      const charge = chargeMessage(move.moveId, attackerName);

      const lines = [`${attackerName} used\n${moveData.name}!`];
      if (charge) lines.push(charge);
      show(lines, async () => {
        await playMoveAnimation(move.moveId, 'charge', undefined);
        resolveInner();
      });
    };

    // === BattleScene.executeMove ===========================================
    const atkVol = isPlayer ? s.playerVolatile : s.opponentVolatile;
    const isRecharging = isPlayer ? s.playerRecharging : s.opponentRecharging;
    const name = getSpeciesName(attacker.speciesId);

    const moveIndex = index;
    const step = isChargeMove(move.moveId)
      ? resolveChargeStep(atkVol.charging, moveIndex)
      : null;

    const attack = () => {
      if (step === 'charge') {
        doChargeTurn(moveIndex, resolve);
        return;
      }
      if (step === 'release') atkVol.charging = null;
      doExecuteMove(move, moveData, resolve, step === 'release' ? 'release' : undefined);
    };

    const pre = resolvePreAction(attacker, atkVol, isRecharging);
    if (pre.chargeCancelled) clearCharge(isPlayer);
    switch (pre.action) {
      case 'recharge':
        if (isPlayer) s.playerRecharging = false;
        else s.opponentRecharging = false;
        show([`${name} must recharge!`], resolve);
        return;
      case 'flinch':
        show([`${name} flinched!`], resolve);
        return;
      case 'confusion-snap':
        show([`${name} snapped out\nof confusion!`], attack);
        return;
      case 'confusion-self-hit':
        updateHUD();
        show([`${name} is confused!`, 'It hurt itself in\nits confusion!'], resolve);
        return;
      case 'confusion-attack':
        show([`${name} is confused!`], attack);
        return;
      case 'sleep-wake':
        updateHUD();
        show([`${name} woke up!`], resolve);
        return;
      case 'sleep':
        show([`${name} is fast\nasleep!`], resolve);
        return;
      case 'paralyzed':
        show([`${name} is fully\nparalyzed!`], resolve);
        return;
      case 'frozen':
        show([`${name} is frozen\nsolid!`], resolve);
        return;
      case 'thaw':
        updateHUD();
        show([`${name} thawed out!`], attack);
        return;
      case 'attack':
        attack();
        return;
    }
  });
}
