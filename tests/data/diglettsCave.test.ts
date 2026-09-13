// Diglett's Cave walkthrough, proven on the real map data. The player walks
// cave floor; every warp tile other than the goal counts as solid (stepping on
// one leaves the floor). There are no NPCs (Gen I: no trainers, no items).
// The shape: `digletts_cave` is two sealed entrance caves (north: the Route 2
// mouth and ladder a; south: ladder b and the Route 11 mouth) and B1F is one
// serpentine corridor from a to b, so the only way from Route 2 to Route 11 is
// down a and up b. B1F rolls Diglett/Dugtrio; the entrance caves roll nothing.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { Pos } from '../../src/logic/boulders';
import { DIR_VECTORS } from '../../src/utils/constants';

const F1 = ALL_MAPS.digletts_cave;
const B1 = ALL_MAPS.digletts_cave_b1f;
const ROUTE2 = ALL_MAPS.route2;
const ROUTE11 = ALL_MAPS.route11;
const FLOORS = [F1, B1];

const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const k = (p: Pos) => `${p.x},${p.y}`;
/** Warps from `map` to `target`, in declaration order. */
const warpsTo = (map: MapData, target: string) => map.warps.filter(w => w.targetMap === target);
/** Tiles the player can stand on next to a position (floor, no NPC). */
const sidesOf = (map: MapData, p: Pos): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => s.x >= 0 && s.y >= 0 && s.x < map.width && s.y < map.height
      && !map.collision[s.y][s.x] && !map.npcs.some(n => n.x === s.x && n.y === s.y));
/** Every tile the player can end a move on from `from`. Warps other than `goal` are never entered. */
function reachSet(map: MapData, from: Pos, goal?: Pos): Set<string> {
  const solid = map.npcs.map(n => ({ x: n.x, y: n.y }));
  const enterable = (p: Pos) => {
    if (p.x < 0 || p.y < 0 || p.x >= map.width || p.y >= map.height) return false;
    if (map.collision[p.y][p.x] || solid.some(s => same(s, p))) return false;
    if (map.warps.some(w => same(w, p))) return !!goal && same(goal, p);
    return true;
  };
  const seen = new Set<string>([k(from)]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    for (const d of Object.values(DIR_VECTORS)) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      if (!enterable(n) || seen.has(k(n))) continue;
      seen.add(k(n));
      queue.push(n);
    }
  }
  return seen;
}
const reach = (map: MapData, from: Pos, to: Pos) => reachSet(map, from, to).has(k(to));
/** Shortest walk from `from` to the warp `to` (steps), or -1. */
function steps(map: MapData, from: Pos, to: Pos): number {
  const dist = new Map<string, number>([[k(from), 0]]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    if (same(p, to)) return dist.get(k(p))!;
    for (const d of Object.values(DIR_VECTORS)) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      if (n.x < 0 || n.y < 0 || n.x >= map.width || n.y >= map.height || dist.has(k(n))) continue;
      if (map.collision[n.y][n.x] || map.npcs.some(s => same(s, n))) continue;
      if (map.warps.some(w => same(w, n)) && !same(n, to)) continue;
      dist.set(k(n), dist.get(k(p))! + 1);
      queue.push(n);
    }
  }
  return -1;
}
/** Where a warp lands the player: the warp on `from` to `to` at index n, read from its target. */
const landing = (from: MapData, to: MapData, n: number): Pos => {
  const w = warpsTo(from, to.id)[n];
  if (!w) throw new Error(`${from.id}: no warp ${n} to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const pos = (w: { x: number; y: number }): Pos => ({ x: w.x, y: w.y });
const manhattan = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Landmarks. 1F's ladders to B1F are, in order, a (north cave) and b (south
// cave); B1F's ladders up follow the same order.
const [f1a, f1b] = warpsTo(F1, B1.id).map(pos);
const [b1a, b1b] = warpsTo(B1, F1.id).map(pos);
const mouthNorth = pos(warpsTo(F1, ROUTE2.id)[0]);
const mouthSouth = pos(warpsTo(F1, ROUTE11.id)[0]);
const fromRoute2 = landing(ROUTE2, F1, 0);
const fromRoute11 = landing(ROUTE11, F1, 0);
const b1FromA = landing(F1, B1, 0), b1FromB = landing(F1, B1, 1);
const f1FromA = landing(B1, F1, 0), f1FromB = landing(B1, F1, 1);

describe("Diglett's Cave", () => {
  it('is two lit floors with no NPCs: two ladders wired both ways, landing beside each other\'s tile; the mouths open onto Route 2 and Route 11', () => {
    expect(FLOORS.every(m => m && !m.isDark && m.npcs.length === 0)).toBe(true);
    expect(warpsTo(F1, B1.id)).toHaveLength(2);
    expect(warpsTo(B1, F1.id)).toHaveLength(2);
    for (let n = 0; n < 2; n++) {
      const down = warpsTo(F1, B1.id)[n], up = warpsTo(B1, F1.id)[n];
      expect(sidesOf(B1, { x: down.targetX, y: down.targetY }), `1F ladder ${n} lands beside its B1F ladder`).toContainEqual(pos(up));
      expect(sidesOf(F1, { x: up.targetX, y: up.targetY }), `B1F ladder ${n} lands beside its 1F ladder`).toContainEqual(pos(down));
    }
    expect(mouthNorth.y).toBe(0);
    expect(mouthSouth.y).toBe(F1.height - 1);
    for (const w of [...F1.warps, ...B1.warps]) {
      const target = ALL_MAPS[w.targetMap];
      expect(target.collision[w.targetY][w.targetX], `${w.targetMap} ${w.targetX},${w.targetY} is walkable`).toBe(false);
    }
  });

  it('the route landings did not move: Route 2\'s door still lands on (6,2), Route 11\'s on (6,18), and the mouths lead back to the tile below each door', () => {
    expect(fromRoute2).toEqual({ x: 6, y: 2 });
    expect(fromRoute11).toEqual({ x: 6, y: 18 });
    const door2 = ROUTE2.warps.find(w => w.targetMap === F1.id)!;
    const door11 = ROUTE11.warps.find(w => w.targetMap === F1.id)!;
    expect(landing(F1, ROUTE2, 0)).toEqual({ x: door2.x, y: door2.y + 1 });
    expect(landing(F1, ROUTE11, 0)).toEqual({ x: door11.x, y: door11.y + 1 });
  });

  it('every ladder and mouth stands in a one-tile stub, and there is no 2x2 of open floor anywhere', () => {
    for (const m of FLOORS) {
      for (const w of m.warps) expect(sidesOf(m, pos(w)), `${m.id} warp ${k(w)}`).toHaveLength(1);
      for (let y = 0; y + 1 < m.height; y++) for (let x = 0; x + 1 < m.width; x++) {
        const open = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].every(([a, b]) => !m.collision[b][a]);
        expect(open, `${m.id} has a 2x2 of open floor at ${x},${y}`).toBe(false);
      }
    }
  });

  describe('1F: two sealed entrance caves', () => {
    it('the north cave: from Route 2 only ladder a is in reach, not b or the Route 11 mouth', () => {
      expect(reach(F1, fromRoute2, f1a)).toBe(true);
      expect(reach(F1, fromRoute2, mouthNorth), 'and back out').toBe(true);
      for (const g of [f1b, mouthSouth]) expect(reach(F1, fromRoute2, g), k(g)).toBe(false);
      expect(reach(F1, f1FromA, mouthNorth), 'up ladder a leads to the Route 2 mouth').toBe(true);
    });
    it('the south cave: from Route 11 only ladder b is in reach, not a or the Route 2 mouth', () => {
      expect(reach(F1, fromRoute11, f1b)).toBe(true);
      expect(reach(F1, fromRoute11, mouthSouth), 'and back out').toBe(true);
      for (const g of [f1a, mouthNorth]) expect(reach(F1, fromRoute11, g), k(g)).toBe(false);
      expect(reach(F1, f1FromB, mouthSouth), 'up ladder b leads to the Route 11 mouth').toBe(true);
    });
    it('both caves wind: the landing to the ladder is at least 2.5x the straight line', () => {
      for (const [from, to] of [[fromRoute2, f1a], [fromRoute11, f1b]] as const) {
        const n = steps(F1, from, to);
        expect(n).toBeGreaterThan(0);
        expect(n / manhattan(from, to)).toBeGreaterThanOrEqual(2.5);
      }
    });
  });

  describe('B1F: one long corridor', () => {
    it('from a the only other warp is b, and back; every floor tile is on the way', () => {
      expect(reach(B1, b1FromA, b1b)).toBe(true);
      expect(reach(B1, b1FromB, b1a)).toBe(true);
      let floor = 0;
      for (let y = 0; y < B1.height; y++) for (let x = 0; x < B1.width; x++) if (!B1.collision[y][x] && !B1.warps.some(w => w.x === x && w.y === y)) floor++;
      expect(reachSet(B1, b1FromA).size).toBe(floor);
    });
    it('it snakes: a to b is at least 80 steps and 5x the straight line', () => {
      const n = steps(B1, b1FromA, b1b);
      expect(n).toBeGreaterThanOrEqual(80);
      expect(n / manhattan(b1FromA, b1b)).toBeGreaterThanOrEqual(5);
    });
    it('B1F rolls Diglett and Dugtrio on cave floor; the entrance caves roll nothing', () => {
      expect(B1.wildEncounters?.encounters.map(e => e.speciesId).sort()).toEqual([50, 51]);
      expect(B1.wildEncounters?.grassRate).toBeGreaterThan(0);
      expect(B1.tiles.flat().filter(t => t === TileType.CAVE_FLOOR).length).toBeGreaterThan(80);
      expect(F1.wildEncounters).toBeUndefined();
    });
  });

  it('the whole walkthrough: Route 2 -> a -> B1F -> b -> Route 11, and the same way back', () => {
    expect(reach(F1, fromRoute2, f1a)).toBe(true);
    expect(reach(B1, b1FromA, b1b)).toBe(true);
    expect(reach(F1, f1FromB, mouthSouth)).toBe(true);
    expect(reach(F1, fromRoute11, f1b)).toBe(true);
    expect(reach(B1, b1FromB, b1a)).toBe(true);
    expect(reach(F1, f1FromA, mouthNorth)).toBe(true);
  });
});
