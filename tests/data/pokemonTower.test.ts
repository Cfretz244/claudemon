// Pokemon Tower walkthrough, proven on the real map data with the solver
// (src/logic/boulders.ts). Every NPC counts as solid (channelers in their
// niches, item balls until picked up) and so does every warp tile other than
// the goal (stepping on one leaves the floor). The tower has no switches or
// arrows: its puzzle is the tombstone mazes, the sight lines across the only
// corridor, the ghost gate on the 6F stairs and the rockets in front of Fuji.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { canReach, Pos, SolveOptions } from '../../src/logic/boulders';
import { checkEntryGates } from '../../src/logic/warpGate';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { DIR_VECTORS } from '../../src/utils/constants';

const F = (n: number) => ALL_MAPS[`pokemon_tower_${n}f`];
const FLOORS = [1, 2, 3, 4, 5, 6, 7].map(F);
const GRAVEYARDS = FLOORS.slice(1);

const warpTo = (map: MapData, target: string): Pos => {
  const w = map.warps.find(x => x.targetMap === target);
  if (!w) throw new Error(`${map.id}: no warp to ${target}`);
  return { x: w.x, y: w.y };
};
const landing = (from: MapData, to: MapData): Pos => {
  const w = from.warps.find(x => x.targetMap === to.id);
  if (!w) throw new Error(`${from.id}: no warp to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const npc = (map: MapData, id: string) => {
  const n = map.npcs.find(x => x.id === id);
  if (!n) throw new Error(`${map.id}: no NPC ${id}`);
  return n;
};
const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
/** The tile in front of a trainer: where the player is spotted from. */
const front = (map: MapData, id: string): Pos => { const n = npc(map, id); const v = DIR_VECTORS[n.direction]; return { x: n.x + v.x, y: n.y + v.y }; };
/** Tiles the player can stand on next to a position (walkable, no NPC). */
const sidesOf = (map: MapData, p: Pos): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => s.x >= 0 && s.y >= 0 && s.x < map.width && s.y < map.height && !map.collision[s.y][s.x] && !map.npcs.some(n => n.x === s.x && n.y === s.y));
/** Walk from a to b; `pickedUp` removes NPCs (item balls, people who left), `alsoBlocked` adds obstacles. */
const reach = (map: MapData, a: Pos, b: Pos, opts: SolveOptions & { pickedUp?: string[]; alsoBlocked?: Pos[] } = {}) => {
  const npcs = map.npcs.filter(n => !(opts.pickedUp ?? []).includes(n.id)).map(n => ({ x: n.x, y: n.y }));
  const warps = map.warps.filter(w => !same(w, b)).map(w => ({ x: w.x, y: w.y }));
  const r = canReach(map, a, b, { ...opts, blocked: [...npcs, ...warps, ...(opts.alsoBlocked ?? [])] });
  expect(r.exhausted, `${map.id}: solver hit the state cap`).toBe(false);
  return r.found;
};
const reachNpc = (map: MapData, from: Pos, id: string, opts?: Parameters<typeof reach>[3]) => sidesOf(map, npc(map, id)).some(s => reach(map, from, s, opts));
const tilesOf = (map: MapData, t: TileType): Pos[] => map.tiles.flatMap((row, y) => row.flatMap((tt, x) => tt === t ? [{ x, y }] : []));
const trainers = (map: MapData) => map.npcs.filter(n => n.isTrainer);

// Landmarks: on floor n, `arrive(n)` is where the stairs from n-1 land, `up(n)` the stairs to n+1, `down(n)` the stairs to n-1.
const arrive = (n: number) => landing(F(n - 1), F(n));
const up = (n: number) => warpTo(F(n), F(n + 1).id);
const down = (n: number) => warpTo(F(n), F(n - 1).id);

describe('Pokemon Tower', () => {
  it('is seven floors chained by stairs that land on each other\'s stairs tile; the lobby door goes both ways', () => {
    expect(FLOORS.every(Boolean)).toBe(true);
    for (let n = 1; n < 7; n++) {
      expect(landing(F(n), F(n + 1)), `${n}F -> ${n + 1}F`).toEqual(down(n + 1));
      expect(landing(F(n + 1), F(n)), `${n + 1}F -> ${n}F`).toEqual(up(n));
    }
    expect(F(7).warps.map(w => w.targetMap)).toEqual(['pokemon_tower_6f']);
    const town = ALL_MAPS.lavender_town;
    expect(landing(town, F(1))).toEqual(warpTo(F(1), town.id));
    const door = warpTo(town, F(1).id), out = landing(F(1), town);
    expect(out, 'leaving lands on the tile below the town door').toEqual({ x: door.x, y: door.y + 1 });
    expect(town.collision[out.y][out.x]).toBe(false);
  });

  it('every floor is completable: the arrival reaches the stairs up (or Mr. Fuji) and back down, with every person and item ball in place', () => {
    expect(reach(F(1), landing(ALL_MAPS.lavender_town, F(1)), up(1))).toBe(true);
    for (let n = 2; n <= 6; n++) {
      expect(reach(F(n), arrive(n), up(n)), `${n}F: arrival -> stairs up`).toBe(true);
      expect(reach(F(n), landing(F(n + 1), F(n)), down(n)), `${n}F: from above -> stairs down`).toBe(true);
    }
    expect(reachNpc(F(7), arrive(7), 'mr_fuji'), '7F: arrival -> Mr. Fuji').toBe(true);
  });

  it('every trainer stands in a one-tile niche with sight range 1, facing the only corridor: none can be walked around', () => {
    for (const m of GRAVEYARDS) {
      const n = Number(m.id.slice(-2, -1));
      const goal = n === 7 ? sidesOf(m, npc(m, 'mr_fuji')) : [up(n)];
      const start = arrive(n);
      for (const t of trainers(m)) {
        expect(t.sightRange, `${m.id}/${t.id}`).toBe(1);
        const f = front(m, t.id);
        expect(m.collision[f.y]?.[f.x], `${m.id}/${t.id} faces a wall`).toBe(false);
        expect(sidesOf(m, t), `${m.id}/${t.id} is not in a niche`).toEqual([f]);
        expect(goal.some(g => reach(m, start, g, { alsoBlocked: [f] })), `${m.id}/${t.id} can be walked around`).toBe(false);
      }
    }
  });

  it('the rival waits on 2F, the eight channelers are spread over 3F-6F, the rockets and Jessie & James hold 7F', () => {
    expect(trainers(F(2)).map(t => t.id).sort()).toEqual(['rival_tower', 'tower_trainer6']);
    const channelers = GRAVEYARDS.flatMap(trainers).map(t => t.id).filter(id => id.startsWith('tower_trainer')).sort();
    expect(channelers).toEqual(Array.from({ length: 8 }, (_, i) => `tower_trainer${i + 1}`));
    expect(trainers(F(7)).map(t => t.id).sort()).toEqual(['jessie_tower', 'tower_rocket1', 'tower_rocket2']);
    expect(npc(F(7), 'james_tower').isTrainer).toBeFalsy();
  });

  it('item balls sit in dead ends, so picking one up never opens a shortcut', () => {
    for (const m of FLOORS) for (const n of m.npcs) {
      if (!n.isItemBall) continue;
      expect(sidesOf(m, n), `${m.id}/${n.id} is not in a dead end`).toHaveLength(1);
    }
    expect(FLOORS.flatMap(m => m.npcs).filter(n => n.isItemBall).map(n => n.itemId)).toContain('escape_rope');
  });

  it('every stairs tile is a one-tile stub off a corridor (a warp fires on entry, not on the tile you land on)', () => {
    for (const m of FLOORS) for (const w of m.warps) {
      expect(sidesOf(m, w), `${m.id}: warp ${w.x},${w.y}`).toHaveLength(1);
    }
  });

  it('tombstones are solid on every floor and the graveyards are mazes: under 40% walkable, interior walls all graves', () => {
    for (const m of GRAVEYARDS) {
      const graves = tilesOf(m, TileType.TOMBSTONE);
      expect(graves.length, m.id).toBeGreaterThan(100);
      for (const g of graves) expect(m.collision[g.y][g.x], `${m.id}: grave ${g.x},${g.y} is walkable`).toBe(true);
      for (const w of tilesOf(m, TileType.WALL)) expect(w.x === 0 || w.y === 0 || w.x === m.width - 1 || w.y === m.height - 1, `${m.id}: interior WALL at ${w.x},${w.y}`).toBe(true);
      const walkable = m.collision.flat().filter(c => !c).length;
      expect(walkable / (m.width * m.height), m.id).toBeLessThanOrEqual(0.4);
    }
  });

  it('5F: the one purified square is on the critical path, so the party is healed on the way up', () => {
    const heal = GRAVEYARDS.flatMap(m => tilesOf(m, TileType.HEAL_TILE).map(p => ({ map: m.id, ...p })));
    expect(heal.map(h => h.map)).toEqual(['pokemon_tower_5f']);
    const h = heal[0];
    expect(F(5).collision[h.y][h.x]).toBe(false);
    expect(reach(F(5), arrive(5), up(5), { alsoBlocked: [h] }), 'the heal square can be bypassed').toBe(false);
  });

  it('the ghost blocks the 6F stairs without the SILPH SCOPE; only 7F is gated', () => {
    const gated = FLOORS.filter(m => m.entryGates?.length).map(m => m.id);
    expect(gated).toEqual(['pokemon_tower_7f']);
    const st = (bag: string[]) => ({ storyFlags: {}, badges: [], defeatedTrainers: [], hasItem: (id: string) => bag.includes(id) });
    expect(checkEntryGates(F(7), F(6).id, st([])).ok).toBe(false);
    expect(checkEntryGates(F(7), F(6).id, st(['silph_scope'])).ok).toBe(true);
    for (const m of GRAVEYARDS) expect(m.wildEncounters?.grassRate, `${m.id} has ghost encounters`).toBeGreaterThan(0);
    expect(F(1).wildEncounters).toBeUndefined();
  });

  it('7F: the rockets show only with the SILPH SCOPE and leave when cleared; Mr. Fuji appears then, at the far end past all of them', () => {
    const m = F(7);
    const vis = (id: string, flags: Record<string, boolean>, defeated: string[], bag: string[]) =>
      !shouldSkipNPC(npc(m, id), flags, [], defeated, (it: string) => bag.includes(it));
    for (const id of ['tower_rocket1', 'tower_rocket2', 'jessie_tower', 'james_tower']) {
      expect(vis(id, {}, [], []), `${id} without the scope`).toBe(false);
      expect(vis(id, {}, [], ['silph_scope']), `${id} with the scope`).toBe(true);
      expect(vis(id, { tower_rockets_cleared: true }, [], ['silph_scope']), `${id} after clearing`).toBe(false);
    }
    expect(vis('mr_fuji', {}, [], ['silph_scope'])).toBe(false);
    expect(vis('mr_fuji', { tower_rockets_cleared: true }, [], ['silph_scope'])).toBe(true);
    // every rocket's watched tile is on the only way to Fuji
    for (const id of ['tower_rocket1', 'tower_rocket2', 'jessie_tower']) {
      expect(reachNpc(m, arrive(7), 'mr_fuji', { alsoBlocked: [front(m, id)] }), `${id} can be walked around`).toBe(false);
    }
    // Fuji is in a dead end: his leaving (he never does) or the rockets' opens nothing new
    expect(sidesOf(m, npc(m, 'mr_fuji'))).toHaveLength(1);
  });
});
