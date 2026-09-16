import { describe, it, expect } from 'vitest';
import {
  createSession,
  GameSession,
  Command,
  combatant,
  executeBattleMove,
  trainerPrizeMoney,
  SeededRandom,
} from '../src/index';
import { createPokemon, newGameState } from '../src/testing';
import { Direction, StatusCondition } from '../src/types';
import { decodeSave, encodeSave, SaveData } from '../src/persistence/codec';
import { ALL_MAPS, MOVES_DATA } from '../src/content';
function save(map = 'player_house', x = 3, y = 5): SaveData {
  return { ...newGameState('RED', 'BLUE').toSave(), currentMap: map, playerX: x, playerY: y };
}
function input(s: GameSession, c: Record<string, unknown>) {
  return s.dispatch({ ...c, inputId: s.getSnapshot().inputId } as Command);
}
function drain(s: GameSession) {
  const effects = [];
  for (let i = 0; i < 1000; i++) {
    const p = s.getSnapshot().pending;
    if (!p) return effects;
    effects.push(p.effect);
    const r = s.dispatch(
      p.effect.kind === 'learn'
        ? { type: 'learn', id: p.id, index: -1 }
        : { type: 'ack', id: p.id },
    );
    expect(r.accepted).toBe(true);
  }
  throw Error('Flow never settled');
}
function oak() {
  const d = save('oaks_lab', 5, 3);
  const n = ALL_MAPS.oaks_lab.npcs.find((n) => n.id === 'oak')!;
  d.playerX = n.x - 1;
  d.playerY = n.y;
  const s = createSession({ seed: 42, save: d });
  input(s, { type: 'move', direction: Direction.RIGHT });
  drain(s);
  input(s, { type: 'interact' });
  return s;
}
function rival(level = 5) {
  const d = save('oaks_lab', 4, 10);
  d.party = [createPokemon(25, level, 'RED', () => 0.5)];
  d.storyFlags.has_pikachu = true;
  const s = createSession({ seed: 42, save: d, rng: () => 0.5 });
  input(s, { type: 'move', direction: Direction.DOWN });
  drain(s);
  expect(s.getSnapshot().battle).not.toBeNull();
  return s;
}
describe('authoritative session', () => {
  it('does not grant a starter until dialogue is acknowledged', () => {
    const s = oak();
    expect(s.getSnapshot().pending?.effect.kind).toBe('dialogue');
    expect(s.getSnapshot().player.party).toHaveLength(0);
    expect(s.canSave).toBe(false);
    expect(() => s.exportSave()).toThrow();
    drain(s);
    expect(s.getSnapshot().player.party[0].speciesId).toBe(25);
    expect(s.canSave).toBe(true);
  });
  it('rejects duplicate acknowledgement and repeated Oak rewards', () => {
    const s = oak(),
      id = s.getSnapshot().pending!.id;
    drain(s);
    expect(s.dispatch({ type: 'ack', id }).accepted).toBe(false);
    input(s, { type: 'interact' });
    drain(s);
    expect(s.getSnapshot().player.party).toHaveLength(1);
  });
  it('rejects a completion from a previous session', () => {
    const a = oak(),
      b = oak();
    expect(b.dispatch({ type: 'ack', id: a.getSnapshot().pending!.id }).accepted).toBe(false);
    expect(b.getSnapshot().player.party).toHaveLength(0);
  });
  it('returns detached snapshots and never aliases the caller save', () => {
    const d = save(),
      s = createSession({ seed: 1, save: d });
    d.money = 1;
    const v = s.getSnapshot();
    v.player.money = 0;
    v.map.collision[5][3] = true;
    expect(s.getSnapshot().player.money).toBe(3000);
    expect(s.getSnapshot().map.collision[5][3]).toBe(false);
  });
  it('serializes movement through presentation barriers and rejects replayed input', () => {
    const s = createSession({ seed: 1 }),
      id = s.getSnapshot().inputId;
    expect(s.dispatch({ type: 'move', direction: Direction.DOWN, inputId: id }).accepted).toBe(
      true,
    );
    expect(s.getSnapshot().y).toBe(6);
    expect(s.dispatch({ type: 'move', direction: Direction.DOWN, inputId: id }).accepted).toBe(
      false,
    );
    drain(s);
    expect(s.getSnapshot().y).toBe(6);
  });
  it('rejects unknown movement directions without mutating location', () => {
    const s = createSession({ seed: 1 });
    expect(input(s, { type: 'move', direction: 'sideways' }).accepted).toBe(false);
    expect(s.getSnapshot().x).toBe(3);
  });
  it('consumes the rival encounter at launch, including on a loss', () => {
    const s = rival();
    expect(s.getSnapshot().player.storyFlags.rival_battle_lab).toBe(true);
    expect(s.canSave).toBe(false);
    for (let i = 0; i < 100 && s.getSnapshot().battle; i++) {
      input(s, { type: 'battleMove', index: 1 });
      drain(s);
    }
    expect(s.getSnapshot().battle).toBeNull();
    expect(s.getSnapshot().player.money).toBe(1500);
    expect(s.getSnapshot().map.id).toBe('player_house');
    expect(s.getSnapshot().player.storyFlags.rival_battle_lab).toBe(true);
  });
  it('preserves Claudemon victory payout and awards it once', () => {
    const s = rival(12);
    const before = s.getSnapshot().player.party[0].exp;
    for (let i = 0; i < 100 && s.getSnapshot().battle; i++) {
      const p = s.getSnapshot().battle!.player;
      const index = p.moves.findIndex((m) => MOVES_DATA[m.moveId].power > 0);
      input(s, { type: 'battleMove', index });
      drain(s);
    }
    expect(s.getSnapshot().player.money).toBe(3250);
    expect(s.getSnapshot().player.party[0].exp).toBeGreaterThan(before);
    expect(s.getSnapshot().player.defeatedTrainers).toEqual(['rival_lab']);
    expect(input(s, { type: 'battleMove', index: 0 }).accepted).toBe(false);
    expect(s.getSnapshot().player.money).toBe(3250);
  });
  it('rejects items and storage actions outside their legal context', () => {
    const s = createSession({ seed: 1 });
    for (const c of [
      { type: 'buy', itemId: 'potion' },
      { type: 'deposit', index: 0 },
      { type: 'withdraw', index: 0 },
      { type: 'item', itemId: 'potion', index: 0 },
      { type: 'catch' },
      { type: 'run' },
    ])
      expect(input(s, c).accepted).toBe(false);
    expect(s.getSnapshot().player.money).toBe(3000);
  });
  it('does not consume PP or a turn for an invalid battle move', () => {
    const s = rival(),
      before = s.getSnapshot();
    expect(input(s, { type: 'battleMove', index: 9 }).accepted).toBe(false);
    expect(s.getSnapshot()).toEqual(before);
  });
  it('keeps map instances independent between sessions', () => {
    const a = createSession({ seed: 2 }),
      b = createSession({ seed: 2 });
    a.getSnapshot().map.npcs.length = 0;
    expect(a.getSnapshot().map).toEqual(b.getSnapshot().map);
  });
  it('save restores RNG and movement counters', () => {
    const s = createSession({ seed: 123 });
    input(s, { type: 'move', direction: Direction.DOWN });
    drain(s);
    const d = s.exportSave(),
      b = createSession({ seed: 999, save: d });
    expect(b.exportSave()).toEqual(d);
  });
  it('presentation delays consume no random numbers', async () => {
    const a = oak(),
      b = oak();
    await Promise.resolve();
    drain(a);
    await Promise.resolve();
    drain(b);
    expect(a.exportSave()).toEqual(b.exportSave());
  });
});
describe('shared move pipeline', () => {
  it('has the shipped lab prize even though trainer metadata differs', () =>
    expect(trainerPrizeMoney(createPokemon(133, 5))).toBe(250));
  it('charges without PP, then releases once', () => {
    const a = combatant(createPokemon(6, 40)),
      d = combatant(createPokemon(3, 40));
    a.pokemon.moves = [{ moveId: 19, currentPp: 15, maxPp: 15 }];
    expect(executeBattleMove(a, d, 0, () => 0.5).phase).toBe('charge');
    expect(a.pokemon.moves[0].currentPp).toBe(15);
    expect(executeBattleMove(a, d, 0, () => 0.5).phase).toBe('release');
    expect(a.pokemon.moves[0].currentPp).toBe(14);
    expect(a.volatile.charging).toBeNull();
  });
  it('cancels a charge on paralysis without spending release PP', () => {
    const a = combatant(createPokemon(6, 40)),
      d = combatant(createPokemon(3, 40));
    a.pokemon.moves = [{ moveId: 19, currentPp: 15, maxPp: 15 }];
    executeBattleMove(a, d, 0, () => 0.5);
    a.pokemon.status = StatusCondition.PARALYSIS;
    expect(executeBattleMove(a, d, 0, () => 0).chargeCancelled).toBe(true);
    expect(a.pokemon.moves[0].currentPp).toBe(15);
    expect(a.volatile.charging).toBeNull();
  });
  it('does not spend gameplay RNG on the charging turn', () => {
    const a = combatant(createPokemon(6, 40)),
      d = combatant(createPokemon(3, 40));
    a.pokemon.moves = [{ moveId: 19, currentPp: 15, maxPp: 15 }];
    executeBattleMove(a, d, 0, () => {
      throw Error('unexpected random draw');
    });
  });
  it('multi-hit applies every hit and records total physical damage', () => {
    const a = combatant(createPokemon(25, 10)),
      d = combatant(createPokemon(133, 100));
    a.pokemon.moves = [{ moveId: 3, currentPp: 10, maxPp: 10 }];
    const hp = d.pokemon.currentHp,
      e = executeBattleMove(a, d, 0, () => 0.5);
    expect(e.messages).toContain('Hit 3 times!');
    expect(d.volatile.lastDamageTaken).toBe(hp - d.pokemon.currentHp);
    expect(d.volatile.lastDamagePhysical).toBe(true);
  });
  it('seeded instances replay identically and do not share state', () => {
    const a = new SeededRandom(5),
      b = new SeededRandom(5);
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
  });
});
describe('portable save codec', () => {
  it('accepts legacy Claudemon and Codexemon v1, emits v2', () => {
    const d = save();
    expect(decodeSave(JSON.stringify(d))).toEqual(d);
    expect(decodeSave(JSON.stringify({ version: 1, data: d }))).toEqual(d);
    expect(JSON.parse(encodeSave(d)).version).toBe(2);
    expect(decodeSave(encodeSave(d))).toEqual(d);
  });
  it.each([
    null,
    {},
    [],
    { version: 99, data: save() },
    { ...save(), money: -1 },
    { ...save(), party: [{}] },
    { ...save(), playerX: 999 },
    { ...save(), engineState: { randomState: -1 } },
  ])('rejects malformed or future saves: %j', (data) =>
    expect(decodeSave(JSON.stringify(data))).toBeNull(),
  );
  it('separates canonical save validity from a client content profile', () => {
    const d = save('cerulean_city', 9, 10);
    let found = false;
    const m = ALL_MAPS.cerulean_city;
    for (let y = 0; y < m.height && !found; y++)
      for (let x = 0; x < m.width && !found; x++)
        if (!m.collision[y][x]) {
          d.playerX = x;
          d.playerY = y;
          found = true;
        }
    expect(decodeSave(JSON.stringify(d))).not.toBeNull();
    expect(decodeSave(JSON.stringify(d), new Set(['player_house']))).toBeNull();
  });
});

describe('medicine transactions',()=>{
 it.each([['burn_heal',StatusCondition.BURN],['antidote',StatusCondition.POISON],['paralyze_heal',StatusCondition.PARALYSIS]] as const)('uses %s from canonical mart stock', (itemId,status)=>{
  const d=save();d.party=[createPokemon(25,5)];d.party[0].status=status;d.bag[itemId]=1;
  const s=createSession({seed:1,save:d});expect(input(s,{type:'item',itemId,index:0}).accepted).toBe(true);drain(s);
  expect(s.getSnapshot().player.party[0].status).toBe(StatusCondition.NONE);expect(s.getSnapshot().player.bag[itemId]).toBeUndefined();
 });
 it('does not spend an ineffective medicine',()=>{
  const d=save();d.party=[createPokemon(25,5)];d.bag.potion=1;const s=createSession({seed:1,save:d});
  expect(input(s,{type:'item',itemId:'potion',index:0}).accepted).toBe(false);expect(s.getSnapshot().player.bag.potion).toBe(1);
 });
});
