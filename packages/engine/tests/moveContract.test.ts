// The invariants #114 deleted, restored against the new structure.
//
// These are BEHAVIOURAL, not source scrapes: each one runs the pipeline and
// looks at what it did, so none of them can pass by accident because a comment
// or a variable name still matches. The source-shaped half of the #87 contract
// (the scene calling `executeBattleMove` -> animation -> `applyMoveEvent` in
// that order) lives in `tests/logic/animationOutcome.test.ts`, where the
// BattleScene source is already imported.

import { describe, it, expect } from 'vitest';
import { MOVES_DATA } from '../src/data/moves';
import { POKEMON_DATA } from '../src/data/pokemon';
import { calculateStats } from '../src/entities/Pokemon';
import { MoveEffect, StatusCondition, PokemonInstance } from '../src/types/pokemon.types';
import { SeededRandom } from '../src/random/seed';
import {
  Combatant, MoveContext, MoveEvent, executeBattleMove, applyMoveEvent,
  combatant, speciesName, battleName,
} from '../src/battle/move';
import { outcomeFor } from '../src/logic/animationOutcome';

function mon(speciesId: number, level: number, moveIds: number[]): PokemonInstance {
  const species = POKEMON_DATA[speciesId];
  const ivs = { hp: 8, attack: 9, defense: 10, special: 11, speed: 12 };
  const evs = { hp: 0, attack: 0, defense: 0, special: 0, speed: 0 };
  const stats = calculateStats(species, level, ivs, evs);
  return {
    speciesId, level, currentHp: stats.hp, stats, ivs, evs,
    moves: moveIds.map(moveId => ({
      moveId, currentPp: MOVES_DATA[moveId].pp, maxPp: MOVES_DATA[moveId].pp,
    })),
    exp: 0, status: StatusCondition.NONE, ot: 'RED', happiness: 70,
  };
}

function fight(moveId: number, attackerIsPlayer = true): MoveContext {
  const a: Combatant = combatant(mon(25, 40, [moveId, 1, 1, 1]));   // PIKACHU
  const d: Combatant = combatant(mon(4, 40, [1, 1, 1, 1]));         // CHARMANDER
  return { attacker: a, defender: d, moveIndex: 0, attackerIsPlayer };
}

/** A defender big enough to survive anything, for the "it survived" branches. */
const tanky = (ctx: MoveContext) => {
  ctx.defender.pokemon = mon(143, 80, [1, 1, 1, 1]);   // SNORLAX
};

/** Run a move until the seed produces the resolution we want to inspect. */
function until(
  moveId: number,
  want: MoveEvent['resolution'],
  isPlayer = true,
  tweak: (ctx: MoveContext) => void = () => {},
) {
  for (let seed = 1; seed < 400; seed++) {
    const ctx = fight(moveId, isPlayer);
    tweak(ctx);
    const event = executeBattleMove(ctx, new SeededRandom(seed).next);
    if (event.resolution === want) return { ctx, event, seed };
  }
  throw new Error(`no seed produced a ${want} for move ${moveId}`);
}

describe('#87: the rolls happen before the animation, the damage after it', () => {
  it('executeBattleMove resolves accuracy, crit and damage up front', () => {
    const { event } = until(85, 'damage');            // THUNDERBOLT
    expect(event.hit).toBe(true);
    // The numbers are on the event before anything is drawn...
    expect(event.damage).toBeGreaterThan(0);
    expect(event.outcome).toBeDefined();
    expect(event.outcome!.kind).toBe('hit');
    expect(event.outcome!.critical).toBe(event.crit);
    expect(event.outcome!.effectiveness).toBe(event.effectiveness);
  });

  it('...but the model still holds pre-move HP until applyMoveEvent runs', () => {
    const { ctx, event } = until(85, 'damage');
    const before = event.defender.hpBefore;
    // This is the window the animation plays in. If the engine had applied the
    // damage eagerly (what #114 did), the HP bar would already be down before
    // the first frame and the hit would be spoiled.
    expect(ctx.defender.pokemon.currentHp).toBe(before);

    applyMoveEvent(ctx, event);
    expect(ctx.defender.pokemon.currentHp).toBe(before - event.damage);
    expect(ctx.defender.pokemon.currentHp).toBe(event.defender.hpAfter);
  });

  it('holds back recoil, drain, status, stages, flinch and recharge too', () => {
    const recoil = until(36, 'damage');               // TAKE DOWN
    expect(recoil.event.recoil).toBeGreaterThan(0);
    expect(recoil.ctx.attacker.pokemon.currentHp).toBe(recoil.event.attacker.hpBefore);
    applyMoveEvent(recoil.ctx, recoil.event);
    expect(recoil.ctx.attacker.pokemon.currentHp)
      .toBe(recoil.event.attacker.hpBefore - recoil.event.recoil);

    const drain = until(71, 'damage');                // ABSORB
    expect(drain.event.drain).toBeGreaterThan(0);
    expect(drain.ctx.attacker.pokemon.currentHp).toBe(drain.event.attacker.hpBefore);

    const beam = until(63, 'damage', true, tanky);    // HYPER BEAM
    expect(beam.event.recharge).toBe(true);
    expect(beam.ctx.attacker.recharging).toBe(false);
    applyMoveEvent(beam.ctx, beam.event);
    expect(beam.ctx.attacker.recharging).toBe(true);

    const wave = until(86, 'status');                 // THUNDER WAVE
    expect(wave.event.defender.statusAfter).toBe(StatusCondition.PARALYSIS);
    expect(wave.ctx.defender.pokemon.status).toBe(StatusCondition.NONE);
    applyMoveEvent(wave.ctx, wave.event);
    expect(wave.ctx.defender.pokemon.status).toBe(StatusCondition.PARALYSIS);

    const growl = until(45, 'status');                // GROWL
    expect(growl.event.defender.stageChanges).toEqual([{ stat: 'atk', from: 0, to: -1 }]);
    expect(growl.ctx.defender.stages.atk).toBe(0);
    applyMoveEvent(growl.ctx, growl.event);
    expect(growl.ctx.defender.stages.atk).toBe(-1);
  });

  it('applyMoveEvent is idempotent, so a redraw cannot double-apply', () => {
    const { ctx, event } = until(85, 'damage');
    applyMoveEvent(ctx, event);
    const hp = ctx.defender.pokemon.currentHp;
    applyMoveEvent(ctx, event);
    applyMoveEvent(ctx, event);
    expect(ctx.defender.pokemon.currentHp).toBe(hp);
  });

  it('the pre-action half IS applied up front - the text describes it', () => {
    // A confusion self-hit, a wake and a thaw all have to be on the model
    // before their message is drawn: the HUD is refreshed in the same tick.
    for (let seed = 1; seed < 200; seed++) {
      const ctx = fight(1);
      ctx.attacker.volatile.confused = 3;
      const hp = ctx.attacker.pokemon.currentHp;
      const event = executeBattleMove(ctx, new SeededRandom(seed).next);
      if (event.preAction !== 'confusion-self-hit') continue;
      expect(ctx.attacker.pokemon.currentHp).toBeLessThan(hp);
      expect(event.presentation.refreshHudBefore).toBe(true);
      expect(event.before).toEqual(['PIKACHU is confused!', 'It hurt itself in\nits confusion!']);
      return;
    }
    throw new Error('no seed produced a confusion self-hit');
  });

  it('a miss carries the animation and the line, and stages nothing', () => {
    const { ctx, event } = until(87, 'miss');         // THUNDER (70% accuracy)
    expect(event.animation).not.toBeNull();
    expect(event.messages).toEqual(['But it missed!']);
    expect(event.commit).toBeNull();
    expect(event.outcome).toEqual({ kind: 'miss' });
    expect(ctx.defender.pokemon.currentHp).toBe(ctx.defender.pokemon.stats.hp);
  });

  it('the outcome is exactly what outcomeFor would say', () => {
    for (const moveId of [85, 87, 45, 63]) {
      for (let seed = 1; seed < 30; seed++) {
        const ctx = fight(moveId);
        const event = executeBattleMove(ctx, new SeededRandom(seed).next);
        if (!event.animation) continue;
        const expected = outcomeFor(event.hit, event.effectiveness === null ? undefined : {
          isCritical: event.crit, effectiveness: event.effectiveness,
        }, MOVES_DATA[event.moveId!]);
        expect(event.outcome).toEqual(expected);
      }
    }
  });
});

describe('#116: the HUD refresh points survive as event fields', () => {
  const refreshers = ['sleep-wake', 'thaw', 'confusion-self-hit'];
  it('a wake, a thaw and a confusion self-hit ask for the pre-text refresh', () => {
    const seen = new Set<string>();
    for (const status of [StatusCondition.SLEEP, StatusCondition.FREEZE]) {
      for (let seed = 1; seed < 200; seed++) {
        const ctx = fight(1);
        ctx.attacker.pokemon.status = status;
        const event = executeBattleMove(ctx, new SeededRandom(seed).next);
        seen.add(event.preAction);
        expect(event.presentation.refreshHudBefore)
          .toBe(refreshers.includes(event.preAction));
      }
    }
    expect(seen.has('sleep-wake')).toBe(true);
    expect(seen.has('thaw')).toBe(true);
    // The verdicts that change nothing must NOT ask for a redraw.
    expect(seen.has('sleep')).toBe(true);
    expect(seen.has('frozen')).toBe(true);
  });

  it('a status move refreshes the HUD after its bars, before its text', () => {
    const { event } = until(86, 'status');            // THUNDER WAVE
    expect(event.presentation.refreshHudAfter).toBe(true);
    expect(event.presentation.impactSfx).toBe(false);
    expect(event.presentation.hitFlash).toBe(false);
  });

  it('a status move tweens only the bar it actually moved', () => {
    const heal = until(105, 'status');                // RECOVER
    heal.ctx.attacker.pokemon.currentHp = 1;
    const again = executeBattleMove(heal.ctx, new SeededRandom(heal.seed).next);
    expect(again.presentation.animateAttackerHp).toBe(true);
    expect(again.presentation.animateDefenderHp).toBe(false);

    const wave = until(86, 'status');                 // THUNDER WAVE moves no HP
    expect(wave.event.presentation.animateAttackerHp).toBe(false);
    expect(wave.event.presentation.animateDefenderHp).toBe(false);
  });

  it('a damage hit tweens the defender bar only (no attacker-bar dead air)', () => {
    const { event } = until(36, 'damage');            // TAKE DOWN: recoil, so
    expect(event.recoil).toBeGreaterThan(0);          // the attacker's HP moved
    expect(event.presentation.animateDefenderHp).toBe(true);
    expect(event.presentation.animateAttackerHp).toBe(false);  // ...but snaps in
    expect(event.presentation.refreshHudAfter).toBe(true);
  });
});

describe('presentation stays semantic (no asset strings in the engine)', () => {
  it('super- and not-very-effective are named, not sounded', () => {
    const superEff = until(89, 'damage');             // EARTHQUAKE vs CHARMANDER (2x)
    expect(superEff.event.effectiveness).toBe(2);
    expect(superEff.event.presentation.effectivenessSfx).toBe('super');

    const weak = until(52, 'damage');                 // EMBER vs CHARMANDER (0.5x)
    expect(weak.event.effectiveness).toBe(0.5);
    expect(weak.event.presentation.effectivenessSfx).toBe('weak');

    const neutral = until(1, 'damage');               // POUND
    expect(neutral.event.effectiveness).toBe(1);
    expect(neutral.event.presentation.effectivenessSfx).toBeNull();
  });

  it('the hit flash is a flag, and only a damaging hit raises it', () => {
    expect(until(1, 'damage').event.presentation.hitFlash).toBe(true);
    expect(until(86, 'status').event.presentation.hitFlash).toBe(false);
    expect(until(87, 'miss').event.presentation.hitFlash).toBe(false);
  });

  it('nothing on a MoveEvent names a sound, a sprite or a clip', () => {
    const { event } = until(85, 'damage');
    const json = JSON.stringify(event);
    for (const banned of ['.wav', '.mp3', '.png', 'sprite', 'sound', 'soundSystem', 'tween']) {
      expect(json.toLowerCase()).not.toContain(banned);
    }
  });
});

describe('the names the engine prints', () => {
  it('is the scene\'s getSpeciesName: no nickname, #id for an unknown', () => {
    expect(speciesName(25)).toBe('PIKACHU');
    expect(speciesName(9999)).toBe('#9999');
    expect(battleName(25, true)).toBe('PIKACHU');
    expect(battleName(25, false)).toBe('Foe PIKACHU');
  });

  it('the foe prefix reaches the used, recoil, drain and recharge lines', () => {
    const { event } = until(36, 'damage', false);     // TAKE DOWN, foe side
    expect(event.before[0]).toBe('Foe PIKACHU used\nTAKE DOWN!');
    expect(event.messages).toContain('Foe PIKACHU is hit\nwith recoil!');

    const beam = until(63, 'damage', false, tanky);   // HYPER BEAM, foe side
    expect(beam.event.messages).toContain('Foe PIKACHU must\nrecharge!');
  });
});

describe('blocker 4: the Struggle gate sits AFTER the charge block', () => {
  it('a charging FLY user with no PP releases instead of Struggling', () => {
    const ctx = fight(19);                            // FLY
    ctx.attacker.volatile.charging = { moveIndex: 0, moveId: 19 };
    for (const m of ctx.attacker.pokemon.moves) m.currentPp = 0;
    const event = executeBattleMove(ctx, new SeededRandom(5).next);
    expect(event.phase).toBe('release');
    expect(event.animation!.phase).toBe('release');
    expect(ctx.attacker.volatile.charging).toBeNull();
  });

  it('a fresh FLY with no PP charges first - the lock is legitimate', () => {
    const ctx = fight(19);
    for (const m of ctx.attacker.pokemon.moves) m.currentPp = 0;
    const event = executeBattleMove(ctx, new SeededRandom(5).next);
    expect(event.resolution).toBe('charge');
    expect(ctx.attacker.volatile.charging).toEqual({ moveIndex: 0, moveId: 19 });
  });

  it('a non-charge move with no PP anywhere becomes STRUGGLE', () => {
    const ctx = fight(1);
    for (const m of ctx.attacker.pokemon.moves) m.currentPp = 0;
    const event = executeBattleMove(ctx, new SeededRandom(5).next);
    expect(event.struggle).toBe(true);
    expect(event.moveId).toBe(165);
    expect(event.ppSpent).toBe(false);
  });

  it('a spent slot with PP elsewhere reports it rather than Struggling', () => {
    const ctx = fight(1);
    ctx.attacker.pokemon.moves[0].currentPp = 0;
    const event = executeBattleMove(ctx, new SeededRandom(5).next);
    expect(event.resolution).toBe('no-pp');
    expect(event.animation).toBeNull();
  });
});

describe('#104: the event says who fainted', () => {
  it('SELF_DESTRUCT faints the user and the defender in one event', () => {
    for (let seed = 1; seed < 200; seed++) {
      const ctx = fight(120);                         // SELF-DESTRUCT
      ctx.defender.pokemon.currentHp = 1;
      const event = executeBattleMove(ctx, new SeededRandom(seed).next);
      if (event.resolution !== 'damage') continue;
      expect(event.attacker.fainted).toBe(true);
      expect(event.defender.fainted).toBe(true);
      applyMoveEvent(ctx, event);
      expect(ctx.attacker.pokemon.currentHp).toBe(0);
      expect(ctx.defender.pokemon.currentHp).toBe(0);
      return;
    }
    throw new Error('SELF-DESTRUCT never landed');
  });

  it('a recoil KO is reported on the attacker side', () => {
    for (let seed = 1; seed < 400; seed++) {
      const ctx = fight(36);                          // TAKE DOWN
      ctx.attacker.pokemon.currentHp = 1;
      const event = executeBattleMove(ctx, new SeededRandom(seed).next);
      if (event.resolution !== 'damage' || event.recoil === 0) continue;
      expect(event.attacker.fainted).toBe(true);
      expect(event.attacker.hpAfter).toBe(0);
      return;
    }
    throw new Error('TAKE DOWN never recoiled');
  });
});

describe('PP accounting', () => {
  it('a charge turn spends nothing; the release turn spends exactly one', () => {
    const ctx = fight(76);                            // SOLAR BEAM
    const full = MOVES_DATA[76].pp;
    const charge = executeBattleMove(ctx, new SeededRandom(2).next);
    applyMoveEvent(ctx, charge);
    expect(ctx.attacker.pokemon.moves[0].currentPp).toBe(full);

    const release = executeBattleMove(ctx, new SeededRandom(2).next);
    applyMoveEvent(ctx, release);
    expect(ctx.attacker.pokemon.moves[0].currentPp).toBe(full - 1);
    expect(release.ppRemaining).toBe(full - 1);
  });

  it('METRONOME spends its own PP once, not the rolled move\'s', () => {
    const metronome = Object.keys(MOVES_DATA).map(Number)
      .find(id => MOVES_DATA[id].effect === MoveEffect.METRONOME)!;
    const ctx = fight(metronome);
    const full = MOVES_DATA[metronome].pp;
    const event = executeBattleMove(ctx, new SeededRandom(3).next);
    applyMoveEvent(ctx, event);
    expect(event.metronomeMoveId).not.toBeNull();
    expect(event.moveId).toBe(event.metronomeMoveId);
    expect(ctx.attacker.pokemon.moves[0].currentPp).toBe(full - 1);
    expect(event.before.filter(l => l.includes(' used\n'))).toHaveLength(2);
  });
});
