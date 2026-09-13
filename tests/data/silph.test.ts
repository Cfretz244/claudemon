// Silph Co walkthrough, proven on the real map data with the solver
// (src/logic/boulders.ts). Every NPC counts as solid (trainers sit at desks,
// item balls until picked up) and so does every warp tile other than the goal
// (stepping on one leaves the floor). The Card Key doors are flag gates on
// `has_card_key`, so "with the key" is a story flag on the search.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { canReach, Pos, SolveOptions } from '../../src/logic/boulders';
import { elevatorAccess, visitedFlag } from '../../src/logic/elevator';
import { doorKeyFlag } from '../../src/logic/storyFlagSync';
import { GateState } from '../../src/logic/warpGate';
import { DIR_VECTORS } from '../../src/utils/constants';

const F = (n: number) => ALL_MAPS[`silph_co_${n}f`];
const FLOORS = Array.from({ length: 11 }, (_, i) => F(i + 1));
const KEY = { [doorKeyFlag('card_key')]: true };

const warpTo = (map: MapData, target: string, n = 0): Pos => {
  const w = map.warps.filter(x => x.targetMap === target)[n];
  if (!w) throw new Error(`${map.id}: no warp ${n} to ${target}`);
  return { x: w.x, y: w.y };
};
const landing = (from: MapData, to: MapData, n = 0): Pos => {
  const w = from.warps.filter(x => x.targetMap === to.id)[n];
  if (!w) throw new Error(`${from.id}: no warp ${n} to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const npc = (map: MapData, id: string) => {
  const n = map.npcs.find(x => x.id === id);
  if (!n) throw new Error(`${map.id}: no NPC ${id}`);
  return n;
};
const tileOf = (map: MapData, t: TileType): Pos[] => {
  const out: Pos[] = [];
  map.tiles.forEach((row, y) => row.forEach((c, x) => { if (c === t) out.push({ x, y }); }));
  return out;
};
const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
/** Tiles the player can stand on next to an NPC (walkable, no other NPC). */
const sidesOf = (map: MapData, p: Pos): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => !map.collision[s.y]?.[s.x] && !map.npcs.some(n => n.x === s.x && n.y === s.y));
/** Walk from a to b; `opts.storyFlags` opens the Card Key doors, `pickedUp` removes item balls. */
const reach = (map: MapData, a: Pos, b: Pos, opts: SolveOptions & { pickedUp?: string[]; alsoBlocked?: Pos[] } = {}) => {
  const npcs = map.npcs.filter(n => !(opts.pickedUp ?? []).includes(n.id)).map(n => ({ x: n.x, y: n.y }));
  const warps = map.warps.filter(w => !same(w, b)).map(w => ({ x: w.x, y: w.y }));
  const r = canReach(map, a, b, { ...opts, blocked: [...npcs, ...warps, ...(opts.alsoBlocked ?? [])] });
  expect(r.exhausted, `${map.id}: solver hit the state cap`).toBe(false);
  return r.found;
};
const reachNpc = (map: MapData, from: Pos, id: string, opts?: Parameters<typeof reach>[3]) => sidesOf(map, npc(map, id)).some(s => reach(map, from, s, opts));

// Landmarks
const entrance = landing(ALL_MAPS.saffron_city, F(1));
const down = (n: number) => landing(F(n - 1), F(n));      // where the stairs from below land on floor n
const up = (n: number) => warpTo(F(n), F(n + 1).id);      // the stairs up on floor n
const padWarps = (map: MapData) => map.warps.filter(w => map.tiles[w.y][w.x] === TileType.TELEPORT_PAD);

describe('Silph Co', () => {
  it('has 11 floors; the stairs land on the other floor\'s stairs tile, so every floor can be left the way it was entered', () => {
    expect(FLOORS.every(Boolean)).toBe(true);
    for (let n = 1; n < 11; n++) {
      expect(down(n + 1), `${F(n).id} -> ${F(n + 1).id}`).toEqual(warpTo(F(n + 1), F(n).id));
      expect(landing(F(n + 1), F(n)), `${F(n + 1).id} -> ${F(n).id}`).toEqual(up(n));
    }
  });

  it('teleport pads come in pairs that land on each other', () => {
    const pads = FLOORS.flatMap(m => padWarps(m).map(w => ({ from: m, w })));
    expect(pads.length).toBe(12);
    for (const { from, w } of pads) {
      const other = ALL_MAPS[w.targetMap];
      expect(other.tiles[w.targetY][w.targetX], `${from.id} pad ${w.x},${w.y} lands on a pad`).toBe(TileType.TELEPORT_PAD);
      const back = other.warps.find(o => o.x === w.targetX && o.y === w.targetY);
      expect(back && back.targetMap === from.id && back.targetX === w.x && back.targetY === w.y, `${other.id} pad ${w.targetX},${w.targetY} returns to ${from.id} ${w.x},${w.y}`).toBe(true);
    }
  });

  it('without the Card Key the stairs still chain 1F to 10F, and 11F\'s stairs reach the office door', () => {
    expect(reach(F(1), entrance, up(1))).toBe(true);
    for (let n = 2; n <= 10; n++) expect(reach(F(n), down(n), up(n)), `${F(n).id}: stairs down -> stairs up without the key`).toBe(true);
  });

  it('the Card Key sits in a sealed pocket on 5F: only pad 2 from 3F gets in, the key is picked up from inside, and the door out opens only with it', () => {
    const f3 = F(3), f5 = F(5);
    const pad2on3F = padWarps(f3).find(w => w.targetMap === f5.id)!;
    expect(reach(f3, down(3), pad2on3F), '3F: the pad to the key pocket is reachable without the key').toBe(true);
    const pocket = { x: pad2on3F.targetX, y: pad2on3F.targetY };
    const key = npc(f5, 'silph_5f_card_key');
    expect(key.isItemBall && key.itemId).toBe('card_key');
    // from the pad landing the key can be reached; from the stairs it cannot, key or no key, until the door is open
    expect(reachNpc(f5, pocket, 'silph_5f_card_key')).toBe(true);
    expect(reachNpc(f5, down(5), 'silph_5f_card_key')).toBe(false);
    expect(reachNpc(f5, down(5), 'silph_5f_card_key', { storyFlags: KEY })).toBe(true);
    // with the key in hand the pocket door leads to the stairs; without it the pad back to 3F is the only way out
    expect(reach(f5, pocket, up(5), { pickedUp: ['silph_5f_card_key'] })).toBe(false);
    expect(reach(f5, pocket, up(5), { pickedUp: ['silph_5f_card_key'], storyFlags: KEY })).toBe(true);
    expect(reach(f5, pocket, pocket, { pickedUp: ['silph_5f_card_key'] })).toBe(true);
  });

  it('Jessie faces the corridor outside the key pocket door, at a desk (solid tile), sight range 1', () => {
    const f5 = F(5);
    const jessie = npc(f5, 'jessie_silph');
    expect(jessie.isTrainer && jessie.sightRange).toBe(1);
    expect(f5.collision[jessie.y][jessie.x], 'Jessie sits at a desk').toBe(true);
    const v = DIR_VECTORS[jessie.direction];
    const front = { x: jessie.x + v.x, y: jessie.y + v.y };
    expect(f5.collision[front.y][front.x]).toBe(false);
    const pocket = landing(F(3), f5, 0);
    expect(reach(f5, pocket, front, { pickedUp: ['silph_5f_card_key'], storyFlags: KEY })).toBe(true);
  });

  it('7F: the rival watches the corridor every route from the stairs must cross; LAPRAS and pad 5 are behind Card Key doors', () => {
    const f7 = F(7);
    const rival = npc(f7, 'rival_silph');
    const v = DIR_VECTORS[rival.direction];
    const front = { x: rival.x + v.x, y: rival.y + v.y };
    expect(f7.collision[rival.y][rival.x], 'the rival leans on a desk').toBe(true);
    expect(reach(f7, down(7), up(7))).toBe(true);
    expect(reach(f7, down(7), up(7), { alsoBlocked: [front] }), 'no way around the rival\'s tile').toBe(false);
    expect(reachNpc(f7, down(7), 'silph_lapras_employee')).toBe(false);
    expect(reachNpc(f7, down(7), 'silph_lapras_employee', { storyFlags: KEY })).toBe(true);
    const pad5 = padWarps(f7).find(w => w.targetMap === F(11).id)!;
    expect(reach(f7, down(7), pad5)).toBe(false);
    expect(reach(f7, down(7), pad5, { storyFlags: KEY })).toBe(true);
    // pad 3 from 3F lands in a pocket that only the key opens (and the 3F side is behind a door too)
    const pad3on3F = padWarps(F(3)).find(w => w.targetMap === f7.id)!;
    expect(reach(F(3), down(3), pad3on3F)).toBe(false);
    expect(reach(F(3), down(3), pad3on3F, { storyFlags: KEY })).toBe(true);
    const pocket3 = { x: pad3on3F.targetX, y: pad3on3F.targetY };
    expect(reach(f7, pocket3, up(7))).toBe(false);
    expect(reach(f7, pocket3, up(7), { storyFlags: KEY })).toBe(true);
  });

  it('9F: the healer is behind a Card Key door; pad 4 from 5F lands behind another', () => {
    const f9 = F(9);
    const heal = tileOf(f9, TileType.HEAL_TILE);
    expect(heal.length).toBe(1);
    expect(reach(f9, down(9), heal[0])).toBe(false);
    expect(reach(f9, down(9), heal[0], { storyFlags: KEY })).toBe(true);
    const pad4on5F = padWarps(F(5)).find(w => w.targetMap === f9.id)!;
    expect(reach(F(5), down(5), pad4on5F)).toBe(true);
    const pocket = { x: pad4on5F.targetX, y: pad4on5F.targetY };
    expect(reach(f9, pocket, heal[0])).toBe(false);
    expect(reach(f9, pocket, heal[0], { storyFlags: KEY })).toBe(true);
  });

  it('10F: pad 6 from 4F lands in a sealed pocket with an item; the pad is the only way in or out', () => {
    const pad6on4F = padWarps(F(4)).find(w => w.targetMap === F(10).id)!;
    expect(reach(F(4), down(4), pad6on4F)).toBe(true);
    const pocket = { x: pad6on4F.targetX, y: pad6on4F.targetY };
    const item = F(10).npcs.find(n => n.isItemBall && reach(F(10), pocket, sidesOf(F(10), n)[0], { storyFlags: KEY }));
    expect(item, 'an item ball in the pocket').toBeDefined();
    expect(reach(F(10), pocket, up(10), { storyFlags: KEY, pickedUp: [item!.id] })).toBe(false);
    expect(reach(F(10), down(10), pocket, { storyFlags: KEY })).toBe(false);
  });

  it('11F: Giovanni\'s office opens only with the key, from the stairs and from the pad 5 pocket; the president stands behind him', () => {
    const f11 = F(11);
    const gio = npc(f11, 'giovanni_silph');
    expect(gio.isTrainer && gio.sightRange).toBe(1);
    expect(reachNpc(f11, down(11), 'giovanni_silph')).toBe(false);
    expect(reachNpc(f11, down(11), 'giovanni_silph', { storyFlags: KEY })).toBe(true);
    const pad5on7F = padWarps(F(7)).find(w => w.targetMap === f11.id)!;
    const pocket = { x: pad5on7F.targetX, y: pad5on7F.targetY };
    expect(reachNpc(f11, pocket, 'giovanni_silph')).toBe(false);
    expect(reachNpc(f11, pocket, 'giovanni_silph', { storyFlags: KEY })).toBe(true);
    expect(reach(f11, pocket, down(11), { storyFlags: KEY }), 'the pocket joins the rest of the floor once the doors are open').toBe(true);
    // the president stands at the end of the office: the only floor tile next to him is Giovanni's
    const pres = npc(f11, 'silph_president');
    const free = Object.values(DIR_VECTORS).map(d => ({ x: pres.x + d.x, y: pres.y + d.y })).filter(p => !f11.collision[p.y]?.[p.x]);
    expect(free).toEqual([{ x: gio.x, y: gio.y }]);
  });

  it('every trainer sits at a desk with sight range 1, facing a corridor tile that every route across the floor must cross', () => {
    // 3F grunt 1 guards the pad to the key pocket instead of the stairs.
    const goals: Record<string, (m: MapData, n: number) => Pos> = { silph_3f_grunt1: m => padWarps(m).find(w => w.targetMap === F(5).id)! };
    for (let n = 1; n <= 11; n++) {
      const m = F(n);
      for (const t of m.npcs.filter(x => x.isTrainer && x.id !== 'giovanni_silph')) {
        expect(t.sightRange, `${m.id}/${t.id}`).toBe(1);
        expect(m.collision[t.y][t.x], `${m.id}/${t.id} sits at a desk`).toBe(true);
        const v = DIR_VECTORS[t.direction];
        const front = { x: t.x + v.x, y: t.y + v.y };
        expect(m.collision[front.y][front.x], `${m.id}/${t.id} faces a floor tile`).toBe(false);
        const from = n === 1 ? entrance : down(n);
        const goal = goals[t.id]?.(m, n) ?? (n === 11 ? sidesOf(m, npc(m, 'giovanni_silph'))[0] : up(n));
        expect(reach(m, from, goal, { storyFlags: KEY }), `${m.id}/${t.id}: goal reachable`).toBe(true);
        expect(reach(m, from, goal, { storyFlags: KEY, alsoBlocked: [front] }), `${m.id}/${t.id}: its gaze cannot be walked around`).toBe(false);
      }
    }
  });

  it('the elevator is on every floor, lands beside its NPC, and only stops at floors already visited', () => {
    const state = (flags: Record<string, boolean>): GateState => ({ storyFlags: flags, badges: [], defeatedTrainers: [], hasItem: () => false });
    for (const m of FLOORS) {
      const lift = m.npcs.find(n => n.id.startsWith('elevator_'))!;
      expect(lift, `${m.id}: elevator NPC`).toBeDefined();
      const stop = m.elevator!.floors.find(f => f.targetMap === m.id)!;
      expect(Math.abs(stop.targetX - lift.x) + Math.abs(stop.targetY - lift.y), `${m.id}: the lift lands next to its door`).toBe(1);
      expect(reach(m, m.id === 'silph_co_1f' ? entrance : down(FLOORS.indexOf(m) + 1), { x: stop.targetX, y: stop.targetY }, { storyFlags: KEY })).toBe(true);
    }
    const first = elevatorAccess(F(1), state({ [visitedFlag('silph_co_1f')]: true }));
    expect(first.ok && first.floors.map(f => f.label)).toEqual(['1F']);
    const some = elevatorAccess(F(5), state({ [visitedFlag('silph_co_1f')]: true, [visitedFlag('silph_co_3f')]: true, [visitedFlag('silph_co_5f')]: true }));
    expect(some.ok && some.floors.map(f => f.label)).toEqual(['1F', '3F', '5F']);
    const all = elevatorAccess(F(11), state(Object.fromEntries(FLOORS.map(m => [visitedFlag(m.id), true]))));
    expect(all.ok && all.floors.length).toBe(11);
  });

  it('the building is sealed once Giovanni is beaten (silph_co_complete) on every floor', () => {
    for (const m of FLOORS) expect(m.entryGates?.[0]?.requires, m.id).toEqual({ notFlag: 'silph_co_complete' });
  });
});
