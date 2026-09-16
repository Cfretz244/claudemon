// Frozen reference from Claudemon 77b319e BattleScene, retained only for extraction parity.
// Presentation ports are immediate no-ops; the gameplay body below is unmodified.
import { PokemonInstance, MoveEffect, MoveCategory, StatusCondition, PHYSICAL_TYPES } from '../../src/types/pokemon.types';
import { MOVES_DATA, POKEMON_DATA } from '../../src/content';
import { calculateDamage, checkCritical, checkAccuracy } from '../../src/systems/DamageCalculator';
import { resolvePreAction, evadesSemiInvulnerable, applySpecialDamage, rollHitCount, applyMoveEffect, EffectContext } from '../../src/systems/BattleEngine';
import { isChargeMove, resolveChargeStep, chargeMessage, isSemiInvulnerableCharge } from '../../src/logic/chargeMoves';
import { outcomeFor } from '../../src/logic/animationOutcome';
import { getEffectivenessText } from '../../src/data/typeChart';
import { Combatant } from '../../src/battle/move';
type AnimationContext = any;
const playMoveAnimation = async (..._args:any[]) => {};
const soundSystem = {hit(){},superEffective(){},notVeryEffective(){}};
export class LegacyMove {
  playerVolatile; opponentVolatile; playerStatStages; opponentStatStages;
  playerDisable; opponentDisable; playerRecharging; opponentRecharging;
  playerSprite={setAlpha(_n:number){}}; opponentSprite={setAlpha(_n:number){}};
  hud={animatePlayerHP:async(_n:number)=>{},animateOpponentHP:async(_n:number)=>{}};
  tweens={add(_options:unknown){}};
  textBox={show:(_lines:string[],done:()=>unknown)=>{void done();}};
  updateHUD(){}
  getSpeciesName(id:number){return POKEMON_DATA[id].name;}
  clearCharge(isPlayer:boolean){(isPlayer?this.playerVolatile:this.opponentVolatile).charging=null;}
  constructor(private a:Combatant,private d:Combatant){
    this.playerVolatile=a.volatile;this.opponentVolatile=d.volatile;
    this.playerStatStages=a.stages;this.opponentStatStages=d.stages;
    this.playerDisable=a.disable;this.opponentDisable=d.disable;
    this.playerRecharging=a.recharging;this.opponentRecharging=d.recharging;
  }
  async run(index:number){const move=this.a.pokemon.moves[index];await this.executeMove(this.a.pokemon,this.d.pokemon,move,MOVES_DATA[move.moveId],true);this.a.recharging=this.playerRecharging;this.d.recharging=this.opponentRecharging;}
  private executeMove(
    attacker: PokemonInstance,
    defender: PokemonInstance,
    move: { moveId: number; currentPp: number; maxPp: number },
    moveData: { id: number; name: string; type: any; category: any; power: number; accuracy: number; pp: number; effect?: MoveEffect; priority?: number },
    isPlayer: boolean,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const atkVol = isPlayer ? this.playerVolatile : this.opponentVolatile;
      const isRecharging = isPlayer ? this.playerRecharging : this.opponentRecharging;
      const name = this.getSpeciesName(attacker.speciesId);

      // Two-turn CHARGE moves. `moveIndex` identifies the slot the charge is
      // stored against; the fake move METRONOME builds is not in the list, and
      // is not a charge move either, so the -1 it yields never charges.
      const moveIndex = attacker.moves.indexOf(move as PokemonInstance['moves'][number]);
      const step = isChargeMove(move.moveId)
        ? resolveChargeStep(atkVol.charging, moveIndex)
        : null;

      const attack = () => {
        if (step === 'charge') {
          this.doChargeTurn(attacker, move, moveData, isPlayer, moveIndex, resolve);
          return;
        }
        // Releasing: the state clears BEFORE the move runs, so a miss clears it
        // too. The sprite is left hidden on purpose - the release half of the
        // FLY/DIG animation is what brings it back.
        if (step === 'release') atkVol.charging = null;
        this.doExecuteMove(
          attacker, defender, move, moveData, isPlayer, resolve,
          step === 'release' ? 'release' : undefined,
        );
      };

      const pre = resolvePreAction(attacker, atkVol, isRecharging);
      // Asleep / frozen / fully paralysed / flinched / confusion self-hit on the
      // release turn: the engine has already dropped the charge, the scene just
      // has to put a hidden FLY/DIG user back on the field.
      if (pre.chargeCancelled) this.clearCharge(isPlayer);
      switch (pre.action) {
        case 'recharge':
          if (isPlayer) this.playerRecharging = false;
          else this.opponentRecharging = false;
          this.textBox.show([`${name} must recharge!`], resolve);
          return;
        case 'flinch':
          this.textBox.show([`${name} flinched!`], resolve);
          return;
        case 'confusion-snap':
          this.textBox.show([`${name} snapped out\nof confusion!`], attack);
          return;
        case 'confusion-self-hit':
          this.updateHUD();
          this.textBox.show([`${name} is confused!`, 'It hurt itself in\nits confusion!'], resolve);
          return;
        case 'confusion-attack':
          this.textBox.show([`${name} is confused!`], attack);
          return;
        case 'sleep-wake':
          this.textBox.show([`${name} woke up!`], resolve);
          return;
        case 'sleep':
          this.textBox.show([`${name} is fast\nasleep!`], resolve);
          return;
        case 'paralyzed':
          this.textBox.show([`${name} is fully\nparalyzed!`], resolve);
          return;
        case 'frozen':
          this.textBox.show([`${name} is frozen\nsolid!`], resolve);
          return;
        case 'thaw':
          // Show the thaw message, then attack once the player advances it
          // (same shape as 'confusion-snap'). Previously attack() ran in the
          // same tick, and doExecuteMove's textBox.show() replaced this
          // message before it was ever drawn.
          this.textBox.show([`${name} thawed out!`], attack);
          return;
        case 'attack':
          attack();
          return;
      }
    });
  }

  /**
   * Turn 1 of a two-turn CHARGE move: store the lock, print the charge line,
   * play the `charge` half of the animation. No PP, no accuracy roll, no
   * damage and no secondary effect - Gen I does all of that on turn 2.
   */
  private doChargeTurn(
    attacker: PokemonInstance,
    move: { moveId: number; currentPp: number; maxPp: number },
    moveData: { id: number; name: string },
    isPlayer: boolean,
    moveIndex: number,
    resolve: () => void,
  ): void {
    const atkVol = isPlayer ? this.playerVolatile : this.opponentVolatile;
    atkVol.charging = { moveIndex, moveId: move.moveId };

    const attackerName = isPlayer
      ? this.getSpeciesName(attacker.speciesId)
      : `Foe ${this.getSpeciesName(attacker.speciesId)}`;
    const charge = chargeMessage(move.moveId, attackerName);

    const animCtx: AnimationContext = {
      scene: this,
      attackerSprite: isPlayer ? this.playerSprite : this.opponentSprite,
      defenderSprite: isPlayer ? this.opponentSprite : this.playerSprite,
      isPlayer,
      phase: 'charge',
    };

    const lines = [`${attackerName} used\n${moveData.name}!`];
    if (charge) lines.push(charge);
    this.textBox.show(lines, async () => {
      await playMoveAnimation(move.moveId, animCtx);
      resolve();
    });
  }

  /** Core move execution after status/confusion checks pass */
  private doExecuteMove(
    attacker: PokemonInstance,
    defender: PokemonInstance,
    move: { moveId: number; currentPp: number; maxPp: number },
    moveData: { id: number; name: string; type: any; category: any; power: number; accuracy: number; pp: number; effect?: MoveEffect; priority?: number },
    isPlayer: boolean,
    resolve: () => void,
    phase?: 'charge' | 'release',
  ): void {
    const defVol = isPlayer ? this.opponentVolatile : this.playerVolatile;

    // PP comes off here, i.e. on the turn the move actually executes. Gen I
    // deducts SOLAR BEAM's PP on the release turn (Bulbapedia, Solar Beam ->
    // Generation I): an interrupted charge costs nothing, and a full two-turn
    // use costs exactly 1.
    move.currentPp = Math.max(0, move.currentPp - 1);

    const attackerName = isPlayer
      ? this.getSpeciesName(attacker.speciesId)
      : `Foe ${this.getSpeciesName(attacker.speciesId)}`;

    const usedMessage = `${attackerName} used\n${moveData.name}!`;

    // Build animation context
    const animCtx: AnimationContext = {
      scene: this,
      attackerSprite: isPlayer ? this.playerSprite : this.opponentSprite,
      defenderSprite: isPlayer ? this.opponentSprite : this.playerSprite,
      isPlayer,
      phase,
    };

    // Metronome: pick a random move and execute it instead
    if (moveData.effect === MoveEffect.METRONOME) {
      const allMoveIds = Object.keys(MOVES_DATA).map(Number).filter(id => {
        const m = MOVES_DATA[id];
        return m && m.effect !== MoveEffect.METRONOME && m.effect !== MoveEffect.MIRROR_MOVE;
      });
      const randomId = allMoveIds[Math.floor(Math.random() * allMoveIds.length)];
      const randomMove = MOVES_DATA[randomId];
      if (randomMove) {
        this.textBox.show([usedMessage, `It became\n${randomMove.name}!`], () => {
          const fakeMove = { moveId: randomId, currentPp: 1, maxPp: 1 };
          this.doExecuteMove(attacker, defender, fakeMove, randomMove, isPlayer, resolve);
        });
        return;
      }
    }

    // Mirror Move: copy opponent's last move
    if (moveData.effect === MoveEffect.MIRROR_MOVE) {
      this.textBox.show([usedMessage, 'But it failed!'], resolve);
      return;
    }

    // Dream Eater: only works if defender is sleeping
    if (moveData.effect === MoveEffect.DREAM_EATER) {
      if (defender.status !== StatusCondition.SLEEP) {
        this.textBox.show([usedMessage, 'But it failed!'], resolve);
        return;
      }
    }

    // Accuracy check (with stat stages)
    const atkStages = isPlayer ? this.playerStatStages : this.opponentStatStages;
    const defStages = isPlayer ? this.opponentStatStages : this.playerStatStages;
    // A FLY / DIG user in mid-charge is off the field: everything aimed at it
    // misses down the ordinary miss path, except always-hit moves like SWIFT.
    const defenderSemiInvulnerable = !!defVol.charging && isSemiInvulnerableCharge(defVol.charging.moveId);
    const hit = !evadesSemiInvulnerable(moveData.accuracy, defenderSemiInvulnerable)
      && checkAccuracy(moveData as any, atkStages.acc, defStages.eva);

    // === Tier 4: the animation has to know how the move turned out ===
    //
    // The crit roll and the damage calculation move UP here, ahead of the
    // animation, purely so the picture can show what is about to happen.
    // `checkCritical` and `calculateDamage` are pure - they read `Math.random`
    // but mutate nothing - so rolling them earlier changes no outcome; the
    // results are carried down and reused, so nothing is rolled twice. Status
    // moves and the special-damage effects (all `power: 0`) are skipped, which
    // leaves their `outcome` undefined and their animation exactly as it was.
    const damaging = hit && moveData.power > 0 && moveData.category !== MoveCategory.STATUS;
    const preCrit = damaging ? checkCritical(attacker) : false;
    const preResult = damaging
      ? calculateDamage(attacker, defender, moveData as any, preCrit, atkStages, defStages)
      : undefined;
    animCtx.outcome = outcomeFor(hit, preResult, moveData);

    // Show "X used MOVE!", play the animation - a miss animation too, which is
    // why "But it missed!" now comes after it rather than instead of it - then
    // continue with the results.
    this.textBox.show([usedMessage], async () => {
      // Play move animation
      await playMoveAnimation(move.moveId, animCtx);
      // Belt and braces: the release half of FLY / DIG un-hides the user, but
      // never leave a sprite invisible if an override bailed out early.
      if (phase === 'release') animCtx.attackerSprite.setAlpha(1);

      if (!hit) {
        this.textBox.show(["But it missed!"], resolve);
        return;
      }

      const messages: string[] = [];

      const atkVol = isPlayer ? this.playerVolatile : this.opponentVolatile;
      const buildEffectCtx = (isSecondary: boolean): EffectContext => ({
        attacker, defender,
        atkName: this.getSpeciesName(attacker.speciesId),
        defName: this.getSpeciesName(defender.speciesId),
        atkStages, defStages,
        atkVolatile: atkVol, defVolatile: defVol,
        defDisable: isPlayer ? this.opponentDisable : this.playerDisable,
        isSecondary,
      });

      // === Special damage effects (bypass normal damage formula) ===
      const special = applySpecialDamage(moveData.effect, move.moveId, attacker, defender, atkVol, defVol);
      if (special.kind === 'failed') {
        messages.push(...special.messages);
        this.textBox.show(messages, resolve);
        return;
      }
      if (special.kind === 'hit') {
        messages.push(...special.messages);
        soundSystem.hit();
        this.applyDamageAnimation(defender, isPlayer, messages, resolve);
        return;
      }

      // === Normal damage path ===
      if (moveData.power > 0 && moveData.category !== MoveCategory.STATUS) {
        // Rolled before the animation (see the tier-4 block above); reused
        // verbatim here, so the picture and the numbers can never disagree.
        const isCrit = preCrit;
        const result = preResult ?? calculateDamage(attacker, defender, moveData as any, isCrit, atkStages, defStages);

        if (result.effectiveness === 0) {
          messages.push(getEffectivenessText(0));
          this.textBox.show(messages, resolve);
          return;
        }

        // Multi-hit moves
        const hitCount = rollHitCount(moveData.effect);
        const totalDamage = result.damage * hitCount;

        // Track damage for Counter
        defVol.lastDamageTaken = totalDamage;
        defVol.lastDamagePhysical = PHYSICAL_TYPES.includes(moveData.type);

        defender.currentHp = Math.max(0, defender.currentHp - totalDamage);

        if (result.isCritical) {
          messages.push("A critical hit!");
        }

        if (hitCount > 1) {
          messages.push(`Hit ${hitCount} times!`);
        }

        const effText = getEffectivenessText(result.effectiveness);
        if (effText) {
          messages.push(effText);
          if (result.effectiveness > 1) {
            soundSystem.superEffective();
          } else if (result.effectiveness < 1) {
            soundSystem.notVeryEffective();
          }
        }

        soundSystem.hit();

        // Recoil damage (Take Down, Double-Edge, Submission)
        if (moveData.effect === MoveEffect.RECOIL) {
          const recoilDmg = Math.max(1, Math.floor(result.damage / 4));
          attacker.currentHp = Math.max(0, attacker.currentHp - recoilDmg);
          messages.push(`${attackerName} is hit\nwith recoil!`);
        }

        // Drain moves (Absorb, Mega Drain, Leech Life)
        if (moveData.effect === MoveEffect.DRAIN) {
          const drainAmt = Math.max(1, Math.floor(result.damage / 2));
          attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + drainAmt);
          messages.push(`${attackerName} drained\nenergy!`);
        }

        // Self-destruct / Explosion
        if (moveData.effect === MoveEffect.SELF_DESTRUCT) {
          attacker.currentHp = 0;
        }

        // Flinch (secondary effect on damage moves)
        if (moveData.effect === MoveEffect.FLINCH && defender.currentHp > 0) {
          if (Math.random() < 0.3) {
            defVol.flinched = true;
          }
        }

        // Recharge (Hyper Beam) - must skip next turn
        if (moveData.effect === MoveEffect.RECHARGE && defender.currentHp > 0) {
          if (isPlayer) this.playerRecharging = true;
          else this.opponentRecharging = true;
          messages.push(`${attackerName} must\nrecharge!`);
        }

        // Dream Eater heals 50% of damage dealt
        if (moveData.effect === MoveEffect.DREAM_EATER) {
          const drainAmt = Math.max(1, Math.floor(totalDamage / 2));
          attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + drainAmt);
          messages.push(`${attackerName} drained\nenergy!`);
        }

        // Apply other secondary effects (chance-based for damage moves)
        const SKIP_SECONDARY = [
          MoveEffect.RECOIL, MoveEffect.DRAIN, MoveEffect.SELF_DESTRUCT,
          MoveEffect.FLINCH, MoveEffect.MULTI_HIT, MoveEffect.TWO_HIT,
          MoveEffect.RECHARGE, MoveEffect.DREAM_EATER, MoveEffect.CHARGE,
          MoveEffect.WRAP,
        ];
        if (moveData.effect && defender.currentHp > 0 && !SKIP_SECONDARY.includes(moveData.effect)) {
          applyMoveEffect(moveData.effect, buildEffectCtx(true), messages);
        }

        // Animate HP changes
        const hpPromise = isPlayer
          ? this.hud.animateOpponentHP(defender.currentHp / defender.stats.hp)
          : this.hud.animatePlayerHP(defender.currentHp / defender.stats.hp);

        const targetSprite = isPlayer ? this.opponentSprite : this.playerSprite;
        this.tweens.add({
          targets: targetSprite,
          alpha: 0,
          duration: 80,
          yoyo: true,
          repeat: 2,
        });

        hpPromise.then(() => {
          this.updateHUD();
          if (messages.length > 0) {
            this.textBox.show(messages, resolve);
          } else {
            resolve();
          }
        });
      } else {
        // Status move - effect always applies (already passed accuracy check)
        if (moveData.effect) {
          applyMoveEffect(moveData.effect, buildEffectCtx(false), messages);
        }
        if (messages.length > 0) {
          this.textBox.show(messages, resolve);
        } else {
          resolve();
        }
      }
    });
  }

  /** Animate HP drop + sprite flash for special damage moves (OHKO, fixed dmg, etc.), then show messages */
  private applyDamageAnimation(defender: PokemonInstance, isPlayer: boolean, messages: string[], resolve: () => void): void {
    const hpPromise = isPlayer
      ? this.hud.animateOpponentHP(defender.currentHp / defender.stats.hp)
      : this.hud.animatePlayerHP(defender.currentHp / defender.stats.hp);

    const targetSprite = isPlayer ? this.opponentSprite : this.playerSprite;
    this.tweens.add({
      targets: targetSprite,
      alpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 2,
    });

    hpPromise.then(() => {
      this.updateHUD();
      this.textBox.show(messages, resolve);
    });
  }

}
