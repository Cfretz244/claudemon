// Power Plant walkthrough, proven on the real map data. The player walks the
// floor; every NPC counts as solid (the Engineers in their niches, item balls
// real or fake until sprung, Zapdos), and the door is only entered as a goal.
// The puzzle: four machinery rows walked back and forth to Zapdos at the far
// end of the top row, six balls in stubs off the rows of which three are
// Voltorb/Electrode ambushes, an Engineer guarding three of the rows.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { ITEMS } from '../../src/data/items';
import { MapData, TileType } from '../../src/types/map.types';
import { Pos } from '../../src/logic/boulders';
import { itemBallAction } from '../../src/logic/encounters';
import { DIR_VECTORS } from '../../src/utils/constants';

const PLANT = ALL_MAPS.power_plant;
const ROUTE10 = ALL_MAPS.route10;

const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const k = (p: Pos) => `${p.x},${p.y}`;
const npc = (id: string) => {
  const n = PLANT.npcs.find(x => x.id === id);
  if (!n) throw new Error(`power plant: no NPC ${id}`);
  return n;
};
const sidesOf = (p: Pos): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => s.x >= 0 && s.y >= 0 && s.x < PLANT.width && s.y < PLANT.height
      && !PLANT.collision[s.y][s.x] && !PLANT.npcs.some(n => n.x === s.x && n.y === s.y));
/** Every tile the player can end a move on from `from`; the door only as `goal`; `alsoBlocked` adds obstacles. Returns steps. */
function dists(from: Pos, goal?: Pos, alsoBlocked: Pos[] = []): Map<string, number> {
  const solid = [...PLANT.npcs.map(n => ({ x: n.x, y: n.y })), ...alsoBlocked];
  const enterable = (p: Pos) => {
    if (p.x < 0 || p.y < 0 || p.x >= PLANT.width || p.y >= PLANT.height) return false;
    if (PLANT.collision[p.y][p.x] || solid.some(s => same(s, p))) return false;
    if (PLANT.warps.some(w => same(w, p))) return !!goal && same(goal, p);
    return true;
  };
  const d = new Map<string, number>([[k(from), 0]]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    for (const v of Object.values(DIR_VECTORS)) {
      const n = { x: p.x + v.x, y: p.y + v.y };
      if (!enterable(n) || d.has(k(n))) continue;
      d.set(k(n), d.get(k(p))! + 1);
      queue.push(n);
    }
  }
  return d;
}
const reachNpc = (from: Pos, id: string, alsoBlocked: Pos[] = []) => { const d = dists(from, undefined, alsoBlocked); return sidesOf(npc(id)).some(s => d.has(k(s))); };
const front = (id: string): Pos => { const n = npc(id); const v = DIR_VECTORS[n.direction]; return { x: n.x + v.x, y: n.y + v.y }; };

const door = { x: PLANT.warps[0].x, y: PLANT.warps[0].y };
const routeWarp = ROUTE10.warps.find(w => w.targetMap === PLANT.id)!;
const start = sidesOf(door)[0];
const ENGINEERS = ['pp_trainer1', 'pp_trainer2', 'pp_trainer3'];

describe('Power Plant', () => {
  it('is one floor behind the Route 10 door: the door is a one-tile stub, Route 10 lands on it and it leads back beside the Route 10 door', () => {
    expect(PLANT.warps).toHaveLength(1);
    expect(PLANT.warps[0].targetMap).toBe('route10');
    expect(sidesOf(door)).toHaveLength(1);
    expect(door.y).toBe(PLANT.height - 1);
    expect({ x: routeWarp.targetX, y: routeWarp.targetY }).toEqual(door);
    expect(Math.abs(PLANT.warps[0].targetX - routeWarp.x) + Math.abs(PLANT.warps[0].targetY - routeWarp.y)).toBe(1);
    expect(ROUTE10.collision[PLANT.warps[0].targetY][PLANT.warps[0].targetX]).toBe(false);
    expect(PLANT.tiles.every(row => row.every(t => t === TileType.CAVE_WALL || t === TileType.CAVE_FLOOR))).toBe(true);
  });

  it('on Route 10 the door is reached only by surfing the pool; leaving lands on a strip below it that also only the water reaches', () => {
    const reachRoute = (from: Pos, to: Pos, surf: boolean): boolean => {
      const seen = new Set<string>([k(from)]);
      const queue = [from];
      while (queue.length) {
        const p = queue.shift()!;
        if (same(p, to)) return true;
        for (const v of Object.values(DIR_VECTORS)) {
          const n = { x: p.x + v.x, y: p.y + v.y };
          if (n.x < 0 || n.y < 0 || n.x >= ROUTE10.width || n.y >= ROUTE10.height || seen.has(k(n))) continue;
          const t = ROUTE10.tiles[n.y][n.x];
          if (ROUTE10.collision[n.y][n.x] && !(surf && t === TileType.WATER)) continue;
          if (ROUTE10.warps.some(w => same(w, n)) && !same(n, to)) continue;
          seen.add(k(n));
          queue.push(n);
        }
      }
      return false;
    };
    const path = { x: 9, y: 5 };
    const doorTile = { x: routeWarp.x, y: routeWarp.y };
    const strip = { x: PLANT.warps[0].targetX, y: PLANT.warps[0].targetY };
    expect(reachRoute(path, doorTile, false)).toBe(false);
    expect(reachRoute(path, doorTile, true)).toBe(true);
    expect(reachRoute(strip, path, false)).toBe(false);
    expect(reachRoute(strip, path, true)).toBe(true);
  });

  it('every ball and Zapdos stand in a dead end, every Engineer in a niche watching its only neighbour with sight 1, and there is no 2x2 of open floor', () => {
    for (const n of PLANT.npcs) {
      if (n.isItemBall || n.id === 'zapdos_power_plant') expect(sidesOf(n), n.id).toHaveLength(1);
      if (n.isTrainer) {
        expect(n.sightRange, n.id).toBe(1);
        expect(sidesOf(n), n.id).toEqual([front(n.id)]);
      }
    }
    expect(PLANT.npcs.filter(n => n.isTrainer).map(n => n.id).sort()).toEqual(ENGINEERS);
    for (let y = 0; y + 1 < PLANT.height; y++) for (let x = 0; x + 1 < PLANT.width; x++) {
      const open = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].every(([a, b]) => !PLANT.collision[b][a]);
      expect(open, `2x2 of open floor at ${x},${y}`).toBe(false);
    }
  });

  it('the door reaches Zapdos by walking the rows back and forth: at least three times the straight line', () => {
    const d = dists(start);
    const z = sidesOf(npc('zapdos_power_plant'))[0];
    expect(d.has(k(z))).toBe(true);
    const straight = Math.abs(z.x - door.x) + Math.abs(z.y - door.y);
    expect(d.get(k(z))! / straight).toBeGreaterThanOrEqual(3);
  });

  it('each Engineer guards the way to Zapdos', () => {
    for (const id of ENGINEERS) expect(reachNpc(start, 'zapdos_power_plant', [front(id)]), id).toBe(false);
  });

  it('six balls: three real (TM25 THUNDER, TM33 REFLECT, MAX POTION, all real item ids) and three ambushes (two Voltorb Lv40, an Electrode Lv43), all in reach', () => {
    const balls = PLANT.npcs.filter(n => n.isItemBall);
    expect(balls).toHaveLength(6);
    const real = balls.filter(b => itemBallAction(b)?.kind === 'item');
    const fake = balls.filter(b => itemBallAction(b)?.kind === 'ambush');
    expect(real.map(b => b.itemId).sort()).toEqual(['max_potion', 'tm25_thunder', 'tm33_reflect']);
    for (const b of real) expect(ITEMS[b.itemId!], `${b.id}: ${b.itemId} is a real item`).toBeDefined();
    expect(fake.map(b => `${b.ambush!.speciesId}@${b.ambush!.level}`).sort()).toEqual(['100@40', '100@40', '101@43']);
    for (const b of balls) expect(reachNpc(start, b.id), b.id).toBe(true);
  });

  it('the first two balls the player meets are real, the next three are the ambushes, TM25 is last before Zapdos', () => {
    const d = dists(start);
    const order = PLANT.npcs.filter(n => n.isItemBall)
      .map(b => ({ id: b.id, kind: itemBallAction(b)!.kind, steps: Math.min(...sidesOf(b).map(s => d.get(k(s)) ?? Infinity)) }))
      .sort((a, b) => a.steps - b.steps);
    expect(order.map(o => o.kind)).toEqual(['item', 'item', 'ambush', 'ambush', 'ambush', 'item']);
    expect(order[5].id).toBe('pp_tm25_thunder');
    const z = sidesOf(npc('zapdos_power_plant'))[0];
    expect(order[5].steps).toBeLessThan(d.get(k(z))!);
  });

  it('nothing is a trap: every reachable tile reaches the door', () => {
    for (const key of dists(start).keys()) {
      const [x, y] = key.split(',').map(Number);
      expect(dists({ x, y }, door).has(k(door)), `${key} reaches no door`).toBe(true);
    }
  });
});
