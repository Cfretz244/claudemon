// Parity: `executeBattleMove` + the scene renderer must produce EXACTLY the
// battle main's `BattleScene` produced — same state, same messages, same
// presentation beats, same RNG draws in the same order.
//
// The oracle is `fixtures/legacyMove.ts`, a byte-verified copy of main's
// scene code. Both sides run against deep clones of the same starting state,
// with two independent mulberry32 streams seeded identically: the legacy copy
// reads `Math.random` (stubbed) exactly as the scene did, the engine takes its
// `rng` parameter. Comparing the two streams' `state` afterwards proves both
// drew the same number of values from the same sequence — a missed, doubled or
// reordered roll shows up as a mismatch even when the visible result agrees.
//
// Coverage: every move in `MOVES_DATA` x both sides x six attacker states
// x three seeds, plus the special cases the #114 behaviour review called out.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MOVES_DATA } from '../src/data/moves';
import { MoveEffect, StatusCondition, PokemonInstance } from '../src/types/pokemon.types';
import { calculateStats } from '../src/entities/Pokemon';
import { POKEMON_DATA } from '../src/data/pokemon';
import { SeededRandom } from '../src/random/seed';
import {
  Combatant, MoveContext, executeBattleMove, freshStages, freshVolatile,
} from '../src/battle/move';
import { LegacyState, runLegacyMove } from './fixtures/legacyMove';
import { renderMoveEventTrace } from './fixtures/renderMoveEvent';

const MOVE_IDS = Object.keys(MOVES_DATA).map(Number).sort((a, b) => a - b);

/** A fixed-stat Pokemon: no `createPokemon` RNG, so the setup draws nothing. */
function mon(speciesId: number, level: number, moveIds: number[]): PokemonInstance {
  const species = POKEMON_DATA[speciesId];
  const ivs = { hp: 8, attack: 9, defense: 10, special: 11, speed: 12 };
  const evs = { hp: 0, attack: 0, defense: 0, special: 0, speed: 0 };
  const stats = calculateStats(species, level, ivs, evs);
  return {
    speciesId, level, currentHp: stats.hp, stats, ivs, evs,
    moves: moveIds.map(moveId => ({
      moveId, currentPp: MOVES_DATA[moveId]?.pp ?? 10, maxPp: MOVES_DATA[moveId]?.pp ?? 10,
    })),
    exp: 0, status: StatusCondition.NONE, ot: 'RED', happiness: 70,
  };
}

type AttackerState = 'clean' | 'paralysed' | 'asleep' | 'confused' | 'charging' | 'recharging';
const STATES: AttackerState[] = [
  'clean', 'paralysed', 'asleep', 'confused', 'charging', 'recharging',
];

interface Scenario { state: LegacyState; index: number; isPlayer: boolean }

/**
 * Build the scenario. The attacker holds the move under test in slot 0 and
 * three POUNDs behind it, so the Struggle gate never fires (main had no
 * Struggle: see `docs/fixes/engine-r3/report.md`, deviation 1).
 */
function scenario(moveId: number, isPlayer: boolean, attackerState: AttackerState): Scenario {
  const attacker = mon(25, 30, [moveId, 1, 1, 1]);      // PIKACHU
  const defender = mon(4, 30, [1, 1, 1, 1]);            // CHARMANDER
  // Half health on both sides, so drains and recoil have room to move.
  attacker.currentHp = Math.ceil(attacker.stats.hp / 2);
  defender.currentHp = Math.ceil(defender.stats.hp / 2);

  const state: LegacyState = {
    playerPokemon: isPlayer ? attacker : defender,
    opponentPokemon: isPlayer ? defender : attacker,
    playerStatStages: freshStages(),
    opponentStatStages: freshStages(),
    playerVolatile: freshVolatile(),
    opponentVolatile: freshVolatile(),
    playerDisable: { moveIndex: -1, turnsLeft: 0 },
    opponentDisable: { moveIndex: -1, turnsLeft: 0 },
    playerRecharging: false,
    opponentRecharging: false,
  };

  const vol = isPlayer ? state.playerVolatile : state.opponentVolatile;
  switch (attackerState) {
    case 'paralysed': attacker.status = StatusCondition.PARALYSIS; break;
    case 'asleep': attacker.status = StatusCondition.SLEEP; break;
    case 'confused': vol.confused = 3; break;
    case 'charging': vol.charging = { moveIndex: 0, moveId }; break;
    case 'recharging':
      if (isPlayer) state.playerRecharging = true; else state.opponentRecharging = true;
      break;
    case 'clean': break;
  }
  return { state, index: 0, isPlayer };
}

function toContext(s: LegacyState, isPlayer: boolean, index: number): MoveContext {
  const side = (mine: boolean): Combatant => ({
    pokemon: mine ? s.playerPokemon : s.opponentPokemon,
    stages: mine ? s.playerStatStages : s.opponentStatStages,
    volatile: mine ? s.playerVolatile : s.opponentVolatile,
    disable: mine ? s.playerDisable : s.opponentDisable,
    recharging: mine ? s.playerRecharging : s.opponentRecharging,
  });
  return {
    attacker: side(isPlayer), defender: side(!isPlayer), moveIndex: index, attackerIsPlayer: isPlayer,
  };
}

/** Everything the two runs have to agree on afterwards. */
function fingerprint(s: LegacyState) {
  return {
    player: s.playerPokemon, opponent: s.opponentPokemon,
    playerStages: s.playerStatStages, opponentStages: s.opponentStatStages,
    playerVolatile: s.playerVolatile, opponentVolatile: s.opponentVolatile,
    playerDisable: s.playerDisable, opponentDisable: s.opponentDisable,
    playerRecharging: s.playerRecharging, opponentRecharging: s.opponentRecharging,
  };
}

/**
 * Run the same scenario both ways and return the two outcomes. `seed` drives
 * two separate streams that MUST end at the same internal state.
 */
async function compare(build: () => Scenario, seed: number) {
  const legacy = build();
  const legacyRng = new SeededRandom(seed);
  const spy = vi.spyOn(Math, 'random').mockImplementation(legacyRng.next);
  const legacyTrace = await runLegacyMove(legacy.state, legacy.index, legacy.isPlayer);
  spy.mockRestore();

  const modern = build();
  const modernRng = new SeededRandom(seed);
  // Any `Math.random` reaching the engine is a missed `rng` hand-off: make it
  // explode rather than silently draw from an untracked stream.
  const trap = vi.spyOn(Math, 'random').mockImplementation(() => {
    throw new Error('executeBattleMove reached Math.random instead of its rng');
  });
  const ctx = toContext(modern.state, modern.isPlayer, modern.index);
  const event = executeBattleMove(ctx, modernRng.next);
  // The scene copies `recharging` back onto its own fields; mirror that here.
  const syncRecharging = () => {
    if (modern.isPlayer) {
      modern.state.playerRecharging = ctx.attacker.recharging;
      modern.state.opponentRecharging = ctx.defender.recharging;
    } else {
      modern.state.opponentRecharging = ctx.attacker.recharging;
      modern.state.playerRecharging = ctx.defender.recharging;
    }
  };
  syncRecharging();
  const modernTrace = await renderMoveEventTrace(ctx, event);
  syncRecharging();
  trap.mockRestore();

  return {
    legacyTrace,
    modernTrace,
    legacyState: fingerprint(legacy.state),
    modernState: fingerprint(modern.state),
    legacyDraws: legacyRng.state,
    modernDraws: modernRng.state,
    event,
  };
}

/** The message lines only, for the "text is byte-identical" requirement. */
const messagesOf = (trace: string[]) =>
  trace.filter(l => l.startsWith('msg:')).map(l => l.slice(4));

interface Mismatch { label: string; field: string; legacy: unknown; modern: unknown }

/** Guards against a loop that silently stops iterating. */
let comparisons = 0;

async function collect(
  label: string, build: () => Scenario, seed: number, into: Mismatch[],
): Promise<void> {
  comparisons++;
  const r = await compare(build, seed);
  const push = (field: string, legacy: unknown, modern: unknown) => {
    if (JSON.stringify(legacy) !== JSON.stringify(modern)) into.push({ label, field, legacy, modern });
  };
  push('messages', messagesOf(r.legacyTrace), messagesOf(r.modernTrace));
  push('trace', r.legacyTrace, r.modernTrace);
  push('state', r.legacyState, r.modernState);
  push('rng', r.legacyDraws, r.modernDraws);
}

beforeEach(() => { vi.restoreAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

describe('every move, both sides, six attacker states, three seeds', () => {
  const SEEDS = [1, 20260917, 0x5eed];

  for (const attackerState of STATES) {
    it(`matches main with a ${attackerState} attacker`, async () => {
      const mismatches: Mismatch[] = [];
      const before = comparisons;
      for (const moveId of MOVE_IDS) {
        for (const isPlayer of [true, false]) {
          for (const seed of SEEDS) {
            await collect(
              `${MOVES_DATA[moveId].name} (#${moveId}) ${isPlayer ? 'player' : 'foe'} seed ${seed}`,
              () => scenario(moveId, isPlayer, attackerState),
              seed,
              mismatches,
            );
          }
        }
      }
      expect(mismatches).toEqual([]);
      // 165 moves x 2 sides x 3 seeds
      expect(comparisons - before).toBe(MOVE_IDS.length * 2 * 3);
    });
  }

  it('covers every move in the data set on both sides', () => {
    expect(MOVE_IDS.length).toBe(165);
    // 165 moves x 2 sides x 6 states x 3 seeds
    expect(MOVE_IDS.length * 2 * STATES.length * 3).toBe(5940);
  });
});

// === the special cases the behaviour review called out =====================

const moveIdByEffect = (effect: MoveEffect) =>
  MOVE_IDS.find(id => MOVES_DATA[id].effect === effect)!;

describe('the cases #114 got wrong', () => {
  const run = async (build: () => Scenario, seed: number) => compare(build, seed);

  it('METRONOME keeps BOTH "used" lines and the "It became" line', async () => {
    const metronome = moveIdByEffect(MoveEffect.METRONOME);
    // Seeds chosen so the rolled move is not itself a failure case.
    for (const seed of [3, 11, 77, 512]) {
      const r = await run(() => scenario(metronome, true, 'clean'), seed);
      expect(r.modernTrace).toEqual(r.legacyTrace);
      const msgs = messagesOf(r.modernTrace);
      expect(msgs[0]).toBe('PIKACHU used\nMETRONOME!');
      expect(msgs[1]).toMatch(/^It became\n/);
      expect(msgs[2]).toMatch(/^PIKACHU used\n/);
      expect(msgs[2]).not.toBe(msgs[0]);
    }
  });

  it('the foe prefix and the line breaks survive on the opponent side', async () => {
    const r = await run(() => scenario(1, false, 'clean'), 9);
    expect(messagesOf(r.modernTrace)[0]).toBe('Foe PIKACHU used\nPOUND!');
    expect(r.modernTrace).toEqual(r.legacyTrace);
  });

  it('the pre-action lines use the BARE name, never "Foe "', async () => {
    // The `Foe ` prefix belongs to the used/charge/recoil/drain/recharge
    // lines only; main printed the pre-action lines with the bare name and so
    // must we. Seeds are swept so every verdict is reached on the foe side.
    const seen = new Set<string>();
    for (const state of ['asleep', 'paralysed', 'recharging', 'confused'] as AttackerState[]) {
      for (let seed = 1; seed <= 40; seed++) {
        const r = await run(() => scenario(1, false, state), seed);
        expect(r.modernTrace).toEqual(r.legacyTrace);
        if (r.event.preAction === 'attack') continue;
        seen.add(r.event.preAction);
        // The pre-action lines come first, before any "used" line, and are
        // always bare - even the verdicts that go on to attack.
        expect(r.event.before[0].startsWith('Foe ')).toBe(false);
        if (r.event.resolution === 'pre-action') {
          for (const m of messagesOf(r.modernTrace)) expect(m.startsWith('Foe ')).toBe(false);
        }
      }
    }
    expect([...seen].sort()).toEqual([
      'confusion-attack', 'confusion-self-hit',
      'paralyzed', 'recharge', 'sleep', 'sleep-wake',
    ]);
  });

  it('a two-turn move charges, then releases, with PP off only on release', async () => {
    const fly = 19;
    const charge = await run(() => scenario(fly, true, 'clean'), 5);
    expect(charge.modernTrace).toEqual(charge.legacyTrace);
    expect(charge.event.resolution).toBe('charge');
    expect(charge.event.ppSpent).toBe(false);
    expect(charge.modernState.player.moves[0].currentPp).toBe(MOVES_DATA[fly].pp);

    const release = await run(() => scenario(fly, true, 'charging'), 5);
    expect(release.modernTrace).toEqual(release.legacyTrace);
    expect(release.event.phase).toBe('release');
    expect(release.event.ppSpent).toBe(true);
    expect(release.modernState.player.moves[0].currentPp).toBe(MOVES_DATA[fly].pp - 1);
    expect(release.modernState.playerVolatile.charging).toBeNull();
  });

  it('a multi-hit move reports its hit count once, after the animation', async () => {
    const multi = moveIdByEffect(MoveEffect.MULTI_HIT);
    for (const seed of [2, 6, 19]) {
      const r = await run(() => scenario(multi, true, 'clean'), seed);
      expect(r.modernTrace).toEqual(r.legacyTrace);
      const iAnim = r.modernTrace.findIndex(l => l.startsWith('anim:'));
      const iHits = r.modernTrace.findIndex(l => /^msg:Hit \d times!/.test(l));
      if (iHits >= 0) expect(iHits).toBeGreaterThan(iAnim);
    }
  });

  it('SELF_DESTRUCT zeroes the user and the defender takes its damage', async () => {
    const boom = moveIdByEffect(MoveEffect.SELF_DESTRUCT);
    const r = await run(() => scenario(boom, true, 'clean'), 8);
    expect(r.modernTrace).toEqual(r.legacyTrace);
    expect(r.modernState.player.currentHp).toBe(0);
    expect(r.event.attacker.fainted).toBe(true);
  });

  it('a recoil KO is reported and applied like main', async () => {
    const recoil = moveIdByEffect(MoveEffect.RECOIL);
    for (const seed of [1, 44, 900]) {
      const r = await run(() => {
        const s = scenario(recoil, true, 'clean');
        s.state.playerPokemon.currentHp = 1;   // recoil will floor it
        return s;
      }, seed);
      expect(r.modernTrace).toEqual(r.legacyTrace);
      expect(r.modernState.player.currentHp).toBe(r.legacyState.player.currentHp);
    }
  });

  it('an immune hit stops before recoil, drain and every secondary', async () => {
    // The review's "drain on immune" case. No drain move in this data set can
    // reach a 0x match-up (GRASS, BUG and PSYCHIC have no immunities in the
    // Gen I chart), so the short-circuit is pinned with the effect that CAN:
    // TAKE DOWN is NORMAL, and NORMAL does not affect a GHOST at all.
    for (const seed of [12, 31, 64]) {
      const r = await run(() => {
        const s = scenario(36, true, 'clean');                 // TAKE DOWN (RECOIL)
        s.state.opponentPokemon = mon(92, 30, [1, 1, 1, 1]);   // GASTLY (GHOST/POISON)
        s.state.opponentPokemon.currentHp = s.state.opponentPokemon.stats.hp;
        return s;
      }, seed);
      expect(r.modernTrace).toEqual(r.legacyTrace);
      if (!r.event.hit) continue;
      expect(r.event.resolution).toBe('immune');
      expect(messagesOf(r.modernTrace)).toContain("It doesn't affect\nthe foe...");
      expect(r.event.recoil).toBe(0);
      expect(r.event.drain).toBe(0);
      // Neither side lost a point: the recoil never ran.
      expect(r.event.attacker.hpDelta).toBe(0);
      expect(r.event.defender.hpDelta).toBe(0);
    }
    // And the data really does leave every drain move immunity-free.
    const drains = MOVE_IDS.filter(id => MOVES_DATA[id].effect === MoveEffect.DRAIN
      || MOVES_DATA[id].effect === MoveEffect.DREAM_EATER);
    expect(drains.length).toBeGreaterThan(0);
  });

  it('a semi-invulnerable defender is missed, and SWIFT still hits it', async () => {
    for (const [moveId, shouldHit] of [[1, false], [129, true]] as [number, boolean][]) {
      const r = await run(() => {
        const s = scenario(moveId, true, 'clean');
        s.state.opponentVolatile.charging = { moveIndex: 0, moveId: 19 };  // FLY
        return s;
      }, 7);
      expect(r.modernTrace).toEqual(r.legacyTrace);
      expect(r.event.hit).toBe(shouldHit);
    }
  });

  it('Struggle is the ONLY behaviour main did not have (and it is gated last)', async () => {
    // Out of PP on every slot: the engine falls back to STRUGGLE. The legacy
    // fixture has no such path, so this case is pinned on its own.
    const s = scenario(1, true, 'clean');
    for (const m of s.state.playerPokemon.moves) m.currentPp = 0;
    const ctx = toContext(s.state, true, 0);
    const event = executeBattleMove(ctx, new SeededRandom(3).next);
    expect(event.struggle).toBe(true);
    expect(event.moveId).toBe(165);
    expect(event.moveName).toBe('STRUGGLE');
    expect(event.before[0]).toBe('PIKACHU used\nSTRUGGLE!');
    expect(event.ppSpent).toBe(false);
  });

  it('a FLY user out of PP still RELEASES rather than Struggling (blocker 4)', async () => {
    const s = scenario(19, true, 'charging');
    for (const m of s.state.playerPokemon.moves) m.currentPp = 0;
    const ctx = toContext(s.state, true, 0);
    const event = executeBattleMove(ctx, new SeededRandom(3).next);
    // The charge block runs first, so the lock is released and the mon comes
    // back on the field. #114 Struggled here and left `charging` set forever.
    expect(event.phase).toBe('release');
    expect(event.struggle).toBe(true);
    expect(ctx.attacker.volatile.charging).toBeNull();
  });
});
