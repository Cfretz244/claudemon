import { describe, it, expect } from 'vitest';
import {
  canFight, getFirstAlivePokemon, isPartyDefeated,
  resolveTurnOrder, confusionSelfDamage, resolvePreAction,
  rollHitCount, applySpecialDamage, applyMoveEffect,
  applyEndTurnStatus, applyLeechSeed, calculateRunChance, splitExp,
  StatStages, VolatileStatus, DisableState, EffectContext,
} from '../../src/systems/BattleEngine';
import { mockPokemon } from '../helpers/pokemon.factory';
import { StatusCondition, MoveEffect } from '../../src/types/pokemon.types';

function stages(overrides: Partial<StatStages> = {}): StatStages {
  return { atk: 0, def: 0, spd: 0, spc: 0, acc: 0, eva: 0, ...overrides };
}

function volatile(overrides: Partial<VolatileStatus> = {}): VolatileStatus {
  return { confused: 0, seeded: false, flinched: false, lastDamageTaken: 0, lastDamagePhysical: false, substitute: 0, ...overrides };
}

function disable(overrides: Partial<DisableState> = {}): DisableState {
  return { moveIndex: -1, turnsLeft: 0, ...overrides };
}

/** rng stub returning a fixed sequence (repeats last value when exhausted) */
function seq(...values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

function effectCtx(overrides: Partial<EffectContext> = {}): EffectContext {
  return {
    attacker: mockPokemon(),
    defender: mockPokemon(),
    atkName: 'ATTACKER',
    defName: 'DEFENDER',
    atkStages: stages(),
    defStages: stages(),
    atkVolatile: volatile(),
    defVolatile: volatile(),
    defDisable: disable(),
    isSecondary: false,
    ...overrides,
  };
}

describe('BattleEngine', () => {
  describe('canFight', () => {
    it('returns true when HP > 0', () => {
      expect(canFight(mockPokemon({ currentHp: 50 }))).toBe(true);
    });

    it('returns false when HP = 0', () => {
      expect(canFight(mockPokemon({ currentHp: 0 }))).toBe(false);
    });
  });

  describe('getFirstAlivePokemon', () => {
    it('returns index of first Pokemon with HP > 0', () => {
      const party = [
        mockPokemon({ currentHp: 0 }),
        mockPokemon({ currentHp: 0 }),
        mockPokemon({ currentHp: 50 }),
      ];
      expect(getFirstAlivePokemon(party)).toBe(2);
    });

    it('returns -1 if all Pokemon are fainted', () => {
      expect(getFirstAlivePokemon([mockPokemon({ currentHp: 0 })])).toBe(-1);
    });
  });

  describe('isPartyDefeated', () => {
    it('returns true when all Pokemon are fainted', () => {
      expect(isPartyDefeated([mockPokemon({ currentHp: 0 })])).toBe(true);
    });

    it('returns false when at least one Pokemon is alive', () => {
      expect(isPartyDefeated([mockPokemon({ currentHp: 0 }), mockPokemon({ currentHp: 1 })])).toBe(false);
    });

    it('returns true for empty party', () => {
      expect(isPartyDefeated([])).toBe(true);
    });
  });

  describe('resolveTurnOrder', () => {
    const fast = () => mockPokemon({ stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 100 } });
    const slow = () => mockPokemon({ stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 40 } });

    it('higher priority goes first regardless of speed', () => {
      expect(resolveTurnOrder(slow(), fast(), 1, 0)).toBe(true);
      expect(resolveTurnOrder(fast(), slow(), 0, 1)).toBe(false);
    });

    it('equal priority: faster Pokemon goes first, player wins speed ties', () => {
      expect(resolveTurnOrder(fast(), slow(), 0, 0)).toBe(true);
      expect(resolveTurnOrder(slow(), fast(), 0, 0)).toBe(false);
      expect(resolveTurnOrder(fast(), fast(), 0, 0)).toBe(true);
    });

    it('player paralysis quarters effective speed for the order check', () => {
      // 100 * 0.25 = 25 < 40 → opponent first
      const paralyzed = fast();
      paralyzed.status = StatusCondition.PARALYSIS;
      expect(resolveTurnOrder(paralyzed, slow(), 0, 0)).toBe(false);
    });

    it('opponent paralysis quarters their speed', () => {
      // 40 >= 100 * 0.25 = 25 → player first
      const paralyzedOpp = fast();
      paralyzedOpp.status = StatusCondition.PARALYSIS;
      expect(resolveTurnOrder(slow(), paralyzedOpp, 0, 0)).toBe(true);
    });

    it('QUIRK (preserved): paralysis check overrides move priority', () => {
      // Player used a +1 priority move but is paralyzed: 100*0.25 < 40 → loses the turn order anyway
      const paralyzed = fast();
      paralyzed.status = StatusCondition.PARALYSIS;
      expect(resolveTurnOrder(paralyzed, slow(), 1, 0)).toBe(false);
    });

    it('QUIRK (preserved): when both are paralyzed only the opponent check counts', () => {
      // Both paralyzed at equal speed: final check is speed >= speed*0.25 → player first
      const a = fast(); a.status = StatusCondition.PARALYSIS;
      const b = fast(); b.status = StatusCondition.PARALYSIS;
      expect(resolveTurnOrder(a, b, 0, 0)).toBe(true);
    });
  });

  describe('confusionSelfDamage', () => {
    it('scales with attack/defense ratio and level', () => {
      const mon = mockPokemon({ level: 50, stats: { hp: 100, attack: 100, defense: 50, special: 50, speed: 50 } });
      // floor(100/50 * 50 * 2/5) = floor(40) = 40
      expect(confusionSelfDamage(mon)).toBe(40);
    });

    it('deals at least 1 damage', () => {
      const mon = mockPokemon({ level: 1, stats: { hp: 10, attack: 1, defense: 100, special: 5, speed: 5 } });
      expect(confusionSelfDamage(mon)).toBe(1);
    });
  });

  describe('resolvePreAction', () => {
    it('recharging Pokemon loses the turn', () => {
      expect(resolvePreAction(mockPokemon(), volatile(), true)).toEqual({ action: 'recharge' });
    });

    it('flinched Pokemon loses the turn and the flag clears', () => {
      const vol = volatile({ flinched: true });
      expect(resolvePreAction(mockPokemon(), vol, false)).toEqual({ action: 'flinch' });
      expect(vol.flinched).toBe(false);
    });

    it('confusion counts down and snaps out at 0 (still attacks)', () => {
      const vol = volatile({ confused: 1 });
      expect(resolvePreAction(mockPokemon(), vol, false)).toEqual({ action: 'confusion-snap' });
      expect(vol.confused).toBe(0);
    });

    it('confused Pokemon hits itself when rng < 0.5 and takes damage', () => {
      const mon = mockPokemon();
      const vol = volatile({ confused: 3 });
      const result = resolvePreAction(mon, vol, false, seq(0.4));
      expect(result.action).toBe('confusion-self-hit');
      expect(mon.currentHp).toBeLessThan(mon.stats.hp);
      expect(vol.confused).toBe(2);
    });

    it('confused Pokemon attacks normally when rng >= 0.5', () => {
      expect(resolvePreAction(mockPokemon(), volatile({ confused: 3 }), false, seq(0.6)))
        .toEqual({ action: 'confusion-attack' });
    });

    it('sleeping Pokemon wakes on rng < 0.5 (turn still spent) and status clears', () => {
      const mon = mockPokemon({ status: StatusCondition.SLEEP });
      expect(resolvePreAction(mon, volatile(), false, seq(0.4))).toEqual({ action: 'sleep-wake' });
      expect(mon.status).toBe(StatusCondition.NONE);
    });

    it('sleeping Pokemon stays asleep on rng >= 0.5', () => {
      const mon = mockPokemon({ status: StatusCondition.SLEEP });
      expect(resolvePreAction(mon, volatile(), false, seq(0.6))).toEqual({ action: 'sleep' });
      expect(mon.status).toBe(StatusCondition.SLEEP);
    });

    it('paralyzed Pokemon is fully paralyzed 25% of the time', () => {
      const mon = mockPokemon({ status: StatusCondition.PARALYSIS });
      expect(resolvePreAction(mon, volatile(), false, seq(0.2))).toEqual({ action: 'paralyzed' });
      expect(resolvePreAction(mon, volatile(), false, seq(0.3))).toEqual({ action: 'attack' });
    });

    it('frozen Pokemon thaws 20% of the time (and then attacks), else stays frozen', () => {
      const frozen = mockPokemon({ status: StatusCondition.FREEZE });
      expect(resolvePreAction(frozen, volatile(), false, seq(0.5))).toEqual({ action: 'frozen' });
      expect(frozen.status).toBe(StatusCondition.FREEZE);

      const thawing = mockPokemon({ status: StatusCondition.FREEZE });
      expect(resolvePreAction(thawing, volatile(), false, seq(0.1))).toEqual({ action: 'thaw' });
      expect(thawing.status).toBe(StatusCondition.NONE);
    });

    it('healthy unencumbered Pokemon just attacks', () => {
      expect(resolvePreAction(mockPokemon(), volatile(), false)).toEqual({ action: 'attack' });
    });
  });

  describe('rollHitCount', () => {
    it('TWO_HIT always hits twice', () => {
      expect(rollHitCount(MoveEffect.TWO_HIT)).toBe(2);
    });

    it('MULTI_HIT distribution: 37.5% 2, 37.5% 3, 12.5% 4, 12.5% 5', () => {
      expect(rollHitCount(MoveEffect.MULTI_HIT, seq(0.1))).toBe(2);
      expect(rollHitCount(MoveEffect.MULTI_HIT, seq(0.5))).toBe(3);
      expect(rollHitCount(MoveEffect.MULTI_HIT, seq(0.8))).toBe(4);
      expect(rollHitCount(MoveEffect.MULTI_HIT, seq(0.9))).toBe(5);
    });

    it('other effects hit once', () => {
      expect(rollHitCount(undefined)).toBe(1);
      expect(rollHitCount(MoveEffect.RECOIL)).toBe(1);
    });
  });

  describe('applySpecialDamage', () => {
    it('returns not-special for normal moves', () => {
      const result = applySpecialDamage(undefined, 33, mockPokemon(), mockPokemon(), volatile(), volatile());
      expect(result.kind).toBe('not-special');
    });

    it('OHKO fails against a faster target', () => {
      const slow = mockPokemon({ stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 30 } });
      const fastDef = mockPokemon({ stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 90 } });
      const result = applySpecialDamage(MoveEffect.OHKO, 32, slow, fastDef, volatile(), volatile());
      expect(result).toEqual({ kind: 'failed', messages: ['But it failed!'] });
      expect(fastDef.currentHp).toBe(100);
    });

    it('OHKO drops an equal-or-slower target to 0 HP', () => {
      const def = mockPokemon();
      const result = applySpecialDamage(MoveEffect.OHKO, 32, mockPokemon(), def, volatile(), volatile());
      expect(result).toEqual({ kind: 'hit', messages: ['One-hit KO!'] });
      expect(def.currentHp).toBe(0);
    });

    it('Sonic Boom (49) deals exactly 20; Dragon Rage deals 40; both count as physical for Counter', () => {
      const def = mockPokemon();
      const defVol = volatile();
      applySpecialDamage(MoveEffect.FIXED_DAMAGE, 49, mockPokemon(), def, volatile(), defVol);
      expect(def.currentHp).toBe(80);
      expect(defVol.lastDamageTaken).toBe(20);
      expect(defVol.lastDamagePhysical).toBe(true);

      const def2 = mockPokemon();
      applySpecialDamage(MoveEffect.FIXED_DAMAGE, 82, mockPokemon(), def2, volatile(), volatile());
      expect(def2.currentHp).toBe(60);
    });

    it('Seismic Toss deals level-based damage; Psywave (149) rolls up to 1.5x level', () => {
      const atk = mockPokemon({ level: 40 });
      const def = mockPokemon();
      applySpecialDamage(MoveEffect.LEVEL_DAMAGE, 69, atk, def, volatile(), volatile());
      expect(def.currentHp).toBe(60);

      const def2 = mockPokemon();
      applySpecialDamage(MoveEffect.LEVEL_DAMAGE, 149, atk, def2, volatile(), volatile(), seq(0.5));
      // floor(0.5 * 40 * 1.5) = 30
      expect(def2.currentHp).toBe(70);
    });

    it('Super Fang halves current HP (min 1)', () => {
      const def = mockPokemon({ currentHp: 50 });
      applySpecialDamage(MoveEffect.SUPER_FANG, 162, mockPokemon(), def, volatile(), volatile());
      expect(def.currentHp).toBe(25);

      const nearlyDead = mockPokemon({ currentHp: 1 });
      applySpecialDamage(MoveEffect.SUPER_FANG, 162, mockPokemon(), nearlyDead, volatile(), volatile());
      expect(nearlyDead.currentHp).toBe(0);
    });

    it('Counter returns 2x last physical damage taken, fails without prior physical damage', () => {
      const def = mockPokemon();
      const atkVol = volatile({ lastDamageTaken: 25, lastDamagePhysical: true });
      const result = applySpecialDamage(MoveEffect.COUNTER, 68, mockPokemon(), def, atkVol, volatile());
      expect(result.kind).toBe('hit');
      expect(def.currentHp).toBe(50);

      const failed = applySpecialDamage(MoveEffect.COUNTER, 68, mockPokemon(), mockPokemon(), volatile({ lastDamageTaken: 25, lastDamagePhysical: false }), volatile());
      expect(failed).toEqual({ kind: 'failed', messages: ['But it failed!'] });
    });
  });

  describe('applyMoveEffect', () => {
    it('primary status effects always apply to a healthy target', () => {
      const ctx = effectCtx();
      const messages: string[] = [];
      applyMoveEffect(MoveEffect.PARALYZE, ctx, messages);
      expect(ctx.defender.status).toBe(StatusCondition.PARALYSIS);
      expect(messages).toEqual(['DEFENDER is paralyzed!']);
    });

    it('status effects never overwrite an existing status', () => {
      const ctx = effectCtx({ defender: mockPokemon({ status: StatusCondition.SLEEP }) });
      const messages: string[] = [];
      applyMoveEffect(MoveEffect.BURN, ctx, messages);
      expect(ctx.defender.status).toBe(StatusCondition.SLEEP);
      expect(messages).toEqual([]);
    });

    it('secondary status effects respect their trigger chances (30% paralyze, 10% burn)', () => {
      const hit = effectCtx({ isSecondary: true, rng: seq(0.2) });
      applyMoveEffect(MoveEffect.PARALYZE, hit, []);
      expect(hit.defender.status).toBe(StatusCondition.PARALYSIS);

      const miss = effectCtx({ isSecondary: true, rng: seq(0.4) });
      applyMoveEffect(MoveEffect.PARALYZE, miss, []);
      expect(miss.defender.status).toBe(StatusCondition.NONE);

      const burnMiss = effectCtx({ isSecondary: true, rng: seq(0.15) });
      applyMoveEffect(MoveEffect.BURN, burnMiss, []);
      expect(burnMiss.defender.status).toBe(StatusCondition.NONE);
    });

    it('confusion lasts 2-5 turns and does not stack', () => {
      const ctx = effectCtx({ rng: seq(0.99) }); // floor(0.99*4)+2 = 5
      const messages: string[] = [];
      applyMoveEffect(MoveEffect.CONFUSE, ctx, messages);
      expect(ctx.defVolatile.confused).toBe(5);
      expect(messages).toEqual(['DEFENDER became\nconfused!']);

      const already = effectCtx({ defVolatile: volatile({ confused: 3 }) });
      const messages2: string[] = [];
      applyMoveEffect(MoveEffect.CONFUSE, already, messages2);
      expect(already.defVolatile.confused).toBe(3);
      expect(messages2).toEqual([]);
    });

    it('stat buffs raise the attacker stage and clamp at +6', () => {
      const ctx = effectCtx({ atkStages: stages({ atk: 5 }) });
      const messages: string[] = [];
      applyMoveEffect(MoveEffect.STAT_UP_ATK, ctx, messages);
      expect(ctx.atkStages.atk).toBe(6);
      expect(messages).toEqual(["ATTACKER's\nATTACK rose!"]);

      applyMoveEffect(MoveEffect.STAT_UP_ATK, ctx, messages);
      expect(ctx.atkStages.atk).toBe(6);
      expect(messages[1]).toBe("ATTACKER's\nATTACK won't go\nany higher!");
    });

    it('stat debuffs lower the defender stage and clamp at -6', () => {
      const ctx = effectCtx({ defStages: stages({ def: -6 }) });
      const messages: string[] = [];
      applyMoveEffect(MoveEffect.STAT_DOWN_DEF, ctx, messages);
      expect(ctx.defStages.def).toBe(-6);
      expect(messages).toEqual(["DEFENDER's\nDEFENSE won't go\nany lower!"]);
    });

    it('secondary stat debuffs apply ~33% of the time', () => {
      const miss = effectCtx({ isSecondary: true, rng: seq(0.5) });
      applyMoveEffect(MoveEffect.STAT_DOWN_SPD, miss, []);
      expect(miss.defStages.spd).toBe(0);

      const hit = effectCtx({ isSecondary: true, rng: seq(0.2) });
      applyMoveEffect(MoveEffect.STAT_DOWN_SPD, hit, []);
      expect(hit.defStages.spd).toBe(-1);
    });

    it('DISABLE picks a random usable move for 1-8 turns; fails if already disabled', () => {
      const defender = mockPokemon({
        moves: [
          { moveId: 33, currentPp: 0, maxPp: 35 },  // unusable
          { moveId: 45, currentPp: 10, maxPp: 40 },
        ],
      });
      const ctx = effectCtx({ defender, rng: seq(0.5, 0.99) });
      const messages: string[] = [];
      applyMoveEffect(MoveEffect.DISABLE, ctx, messages);
      expect(ctx.defDisable.moveIndex).toBe(1); // only usable move (original index)
      expect(ctx.defDisable.turnsLeft).toBe(8); // floor(0.99*8)+1
      expect(messages[0]).toContain('was\ndisabled!');

      const already = effectCtx({ defDisable: disable({ moveIndex: 0, turnsLeft: 2 }) });
      const messages2: string[] = [];
      applyMoveEffect(MoveEffect.DISABLE, already, messages2);
      expect(messages2).toEqual(['But it failed!']);
    });

    it('RECOVER heals half max HP, capped at max', () => {
      const ctx = effectCtx({ attacker: mockPokemon({ currentHp: 30 }) });
      applyMoveEffect(MoveEffect.RECOVER, ctx, []);
      expect(ctx.attacker.currentHp).toBe(80);

      const nearFull = effectCtx({ attacker: mockPokemon({ currentHp: 90 }) });
      applyMoveEffect(MoveEffect.RECOVER, nearFull, []);
      expect(nearFull.attacker.currentHp).toBe(100);
    });

    it('REST fully heals and puts the user to sleep', () => {
      const ctx = effectCtx({ attacker: mockPokemon({ currentHp: 10, status: StatusCondition.POISON }) });
      applyMoveEffect(MoveEffect.REST, ctx, []);
      expect(ctx.attacker.currentHp).toBe(100);
      expect(ctx.attacker.status).toBe(StatusCondition.SLEEP);
    });

    it('HAZE resets all stat stages on both sides', () => {
      const ctx = effectCtx({
        atkStages: stages({ atk: 3, eva: -2 }),
        defStages: stages({ def: -4, spd: 6 }),
      });
      applyMoveEffect(MoveEffect.HAZE, ctx, []);
      expect(ctx.atkStages).toEqual(stages());
      expect(ctx.defStages).toEqual(stages());
    });

    it('LEECH_SEED seeds once, fails on a seeded target', () => {
      const ctx = effectCtx();
      applyMoveEffect(MoveEffect.LEECH_SEED, ctx, []);
      expect(ctx.defVolatile.seeded).toBe(true);

      const messages: string[] = [];
      applyMoveEffect(MoveEffect.LEECH_SEED, ctx, messages);
      expect(messages).toEqual(['But it failed!']);
    });

    it('TOXIC poisons (as regular poison) and fails against any existing status', () => {
      const ctx = effectCtx();
      applyMoveEffect(MoveEffect.TOXIC, ctx, []);
      expect(ctx.defender.status).toBe(StatusCondition.POISON);

      const messages: string[] = [];
      applyMoveEffect(MoveEffect.TOXIC, ctx, messages);
      expect(messages).toEqual(['But it failed!']);
    });

    it('SUBSTITUTE costs 1/4 max HP, fails at low HP or when one already exists', () => {
      const ctx = effectCtx({ attacker: mockPokemon({ currentHp: 100 }) });
      applyMoveEffect(MoveEffect.SUBSTITUTE, ctx, []);
      expect(ctx.attacker.currentHp).toBe(75);
      expect(ctx.atkVolatile.substitute).toBe(25);

      const tooWeak = effectCtx({ attacker: mockPokemon({ currentHp: 25 }) });
      const messages: string[] = [];
      applyMoveEffect(MoveEffect.SUBSTITUTE, tooWeak, messages);
      expect(messages).toEqual(['But it failed!']);
      expect(tooWeak.attacker.currentHp).toBe(25);
    });

    it('LIGHT_SCREEN and REFLECT are simplified to stat boosts', () => {
      const ls = effectCtx();
      applyMoveEffect(MoveEffect.LIGHT_SCREEN, ls, []);
      expect(ls.atkStages.spc).toBe(1);

      const rf = effectCtx();
      applyMoveEffect(MoveEffect.REFLECT, rf, []);
      expect(rf.atkStages.def).toBe(1);
    });
  });

  describe('applyEndTurnStatus', () => {
    it('burn deals floor(maxHP/16) damage, minimum 1', () => {
      const pokemon = mockPokemon({
        currentHp: 100,
        stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 50 },
        status: StatusCondition.BURN,
      });
      expect(applyEndTurnStatus(pokemon)).toBe(6);
    });

    it('poison deals floor(maxHP/16) damage', () => {
      const pokemon = mockPokemon({
        currentHp: 100,
        stats: { hp: 100, attack: 50, defense: 50, special: 50, speed: 50 },
        status: StatusCondition.POISON,
      });
      expect(applyEndTurnStatus(pokemon)).toBe(6);
    });

    it('minimum damage is 1 for low-HP Pokemon', () => {
      const pokemon = mockPokemon({
        currentHp: 10,
        stats: { hp: 10, attack: 5, defense: 5, special: 5, speed: 5 },
        status: StatusCondition.BURN,
      });
      expect(applyEndTurnStatus(pokemon)).toBe(1);
    });

    it('returns 0 for no status, fainted, or paralysis', () => {
      expect(applyEndTurnStatus(mockPokemon({ status: StatusCondition.NONE }))).toBe(0);
      expect(applyEndTurnStatus(mockPokemon({ currentHp: 0, status: StatusCondition.BURN }))).toBe(0);
      expect(applyEndTurnStatus(mockPokemon({ status: StatusCondition.PARALYSIS }))).toBe(0);
    });
  });

  describe('applyLeechSeed', () => {
    it('drains floor(maxHP/16) and heals the other side by the drained amount', () => {
      const seeded = mockPokemon({ currentHp: 50 });
      const other = mockPokemon({ currentHp: 40 });
      const drained = applyLeechSeed(seeded, other);
      expect(drained).toBe(6);
      expect(seeded.currentHp).toBe(44);
      expect(other.currentHp).toBe(46);
    });

    it('heal is capped by the victim remaining HP and by the healer max HP', () => {
      const seeded = mockPokemon({ currentHp: 2 });
      const other = mockPokemon({ currentHp: 99 });
      const drained = applyLeechSeed(seeded, other);
      expect(drained).toBe(2);       // only 2 HP left to drain
      expect(seeded.currentHp).toBe(0);
      expect(other.currentHp).toBe(100); // capped at max
    });

    it('does not heal a fainted other side', () => {
      const seeded = mockPokemon({ currentHp: 50 });
      const other = mockPokemon({ currentHp: 0 });
      applyLeechSeed(seeded, other);
      expect(other.currentHp).toBe(0);
    });
  });

  describe('calculateRunChance', () => {
    it('fast Pokemon escape easily', () => {
      // (200*32)/(50/4) + 30 = 512 + 30 = 542; 0.5*256 = 128 < 542 → escape
      expect(calculateRunChance(200, 50, seq(0.5))).toBe(true);
    });

    it('slow Pokemon can fail to escape', () => {
      // (10*32)/(200/4) + 30 = 6.4 + 30 = 36.4; 0.999*256 ≈ 255.7 → fail
      expect(calculateRunChance(10, 200, seq(0.999))).toBe(false);
    });

    it('even slow Pokemon have the +30 base chance', () => {
      // 36.4/256 ≈ 14%; rng 0.1 → 25.6 < 36.4 → escape
      expect(calculateRunChance(10, 200, seq(0.1))).toBe(true);
    });
  });

  describe('splitExp', () => {
    it('splits evenly among living participants, floored', () => {
      expect(splitExp(100, 3)).toBe(33);
      expect(splitExp(100, 1)).toBe(100);
    });

    it('treats zero participants as one (no division by zero)', () => {
      expect(splitExp(100, 0)).toBe(100);
    });
  });
});
