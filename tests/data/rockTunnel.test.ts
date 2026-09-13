// Rock Tunnel walkthrough, proven on the real map data. The player walks cave
// floor; every NPC counts as solid (trainers in their niches, item balls until
// picked up), and so does every warp tile other than the goal (stepping on
// one leaves the floor). The puzzle: the route folds through B1F twice. 1F's
// three regions (south mouth + d, b + a, c + north mouth) never touch, nor do
// B1F's two (d + b, a + c), so the only way from Route 10's north section to
// its south section is d, b, a, c in that order. It is dark until Flash.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { Pos } from '../../src/logic/boulders';
import { DIR_VECTORS } from '../../src/utils/constants';

const F1 = ALL_MAPS.rock_tunnel;
const B1 = ALL_MAPS.rock_tunnel_b1f;
const ROUTE10 = ALL_MAPS.route10;
const FLOORS = [F1, B1];

const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const k = (p: Pos) => `${p.x},${p.y}`;
const npc = (map: MapData, id: string) => {
  const n = map.npcs.find(x => x.id === id);
  if (!n) throw new Error(`${map.id}: no NPC ${id}`);
  return n;
};
/** Warps from `map` to `target`, in declaration order. */
const warpsTo = (map: MapData, target: string) => map.warps.filter(w => w.targetMap === target);
/** Tiles the player can stand on next to a position (floor, no NPC). */
const sidesOf = (map: MapData, p: Pos): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => s.x >= 0 && s.y >= 0 && s.x < map.width && s.y < map.height
      && !map.collision[s.y][s.x] && !map.npcs.some(n => n.x === s.x && n.y === s.y));
/** Every tile the player can end a move on from `from`. Warps other than `goal` are never entered; `alsoBlocked` adds obstacles. */
function reachSet(map: MapData, from: Pos, goal?: Pos, opts: { alsoBlocked?: Pos[] } = {}): Set<string> {
  const solid = [...map.npcs.map(n => ({ x: n.x, y: n.y })), ...(opts.alsoBlocked ?? [])];
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
const reach = (map: MapData, from: Pos, to: Pos, opts?: { alsoBlocked?: Pos[] }) => reachSet(map, from, to, opts).has(k(to));
const reachNpc = (map: MapData, from: Pos, id: string) => {
  const r = reachSet(map, from);
  return sidesOf(map, npc(map, id)).some(s => r.has(k(s)));
};
/** Shortest walk from `from` to the warp `to` (steps), or -1. */
function steps(map: MapData, from: Pos, to: Pos): number {
  const solid = map.npcs.map(n => ({ x: n.x, y: n.y }));
  const dist = new Map<string, number>([[k(from), 0]]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    if (same(p, to)) return dist.get(k(p))!;
    for (const d of Object.values(DIR_VECTORS)) {
      const n = { x: p.x + d.x, y: p.y + d.y };
      if (n.x < 0 || n.y < 0 || n.x >= map.width || n.y >= map.height || dist.has(k(n))) continue;
      if (map.collision[n.y][n.x] || solid.some(s => same(s, n))) continue;
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
/** A trainer's watched tile. */
const front = (map: MapData, id: string): Pos => { const n = npc(map, id); const v = DIR_VECTORS[n.direction]; return { x: n.x + v.x, y: n.y + v.y }; };

// Landmarks. 1F's ladders to B1F are, in order, d (south region), b and a
// (middle region), c (north region); B1F's ladders up follow the same order.
const [f1d, f1b, f1a, f1c] = warpsTo(F1, B1.id).map(pos);
const [b1d, b1b, b1a, b1c] = warpsTo(B1, F1.id).map(pos);
const mouthSouth = pos(warpsTo(F1, ROUTE10.id)[0]);
const mouthNorth = pos(warpsTo(F1, ROUTE10.id)[1]);
const fromNorthSection = landing(ROUTE10, F1, 0);   // Route 10's north cave entrance lands here
const fromSouthSection = landing(ROUTE10, F1, 1);
const b1FromD = landing(F1, B1, 0), b1FromB = landing(F1, B1, 1), b1FromA = landing(F1, B1, 2), b1FromC = landing(F1, B1, 3);
const f1FromD = landing(B1, F1, 0), f1FromB = landing(B1, F1, 1), f1FromA = landing(B1, F1, 2), f1FromC = landing(B1, F1, 3);
const F1_TRAINERS = ['rock_tunnel_trainer1', 'rock_tunnel_trainer2', 'rock_tunnel_trainer3', 'rock_tunnel_trainer4', 'rock_tunnel_trainer5', 'rock_tunnel_trainer6'];
const B1_TRAINERS = ['rock_tunnel_b1f_trainer1', 'rock_tunnel_b1f_trainer2', 'rock_tunnel_b1f_trainer3', 'rock_tunnel_b1f_trainer4'];

describe('Rock Tunnel', () => {
  it('is two dark floors: four ladders wired both ways, landing beside each other\'s tile; the mouths open onto Route 10\'s two sections', () => {
    expect(FLOORS.every(m => m && m.isDark)).toBe(true);
    expect(warpsTo(F1, B1.id)).toHaveLength(4);
    expect(warpsTo(B1, F1.id)).toHaveLength(4);
    for (let n = 0; n < 4; n++) {
      const down = warpsTo(F1, B1.id)[n], up = warpsTo(B1, F1.id)[n];
      expect(sidesOf(B1, { x: down.targetX, y: down.targetY }), `1F ladder ${n} lands beside its B1F ladder`).toContainEqual(pos(up));
      expect(sidesOf(F1, { x: up.targetX, y: up.targetY }), `B1F ladder ${n} lands beside its 1F ladder`).toContainEqual(pos(down));
    }
    expect(mouthSouth.y).toBe(F1.height - 1);
    expect(mouthNorth.y).toBe(0);
    expect(reach(F1, fromNorthSection, mouthSouth), 'Route 10\'s north entrance lands in the south region').toBe(true);
    expect(reach(F1, fromSouthSection, mouthNorth), 'Route 10\'s south entrance lands in the north region').toBe(true);
    const north = ROUTE10.warps.filter(w => w.targetMap === F1.id);
    expect(north[0].y, 'the entrance the player reaches first is on the mountain\'s north face').toBeLessThan(north[1].y);
    expect(landing(F1, ROUTE10, 0).y, 'the south mouth leads to the tile above the north-face entrance').toBe(north[0].y - 1);
    expect(landing(F1, ROUTE10, 1).y, 'the north mouth leads to the tile below the south-face entrance').toBe(north[1].y + 1);
    for (const w of [...F1.warps, ...B1.warps]) {
      const target = ALL_MAPS[w.targetMap];
      expect(target.collision[w.targetY][w.targetX], `${w.targetMap} ${w.targetX},${w.targetY} is walkable`).toBe(false);
    }
  });

  it('every ladder and mouth stands in a one-tile stub, every item ball in a dead end, every trainer in a niche watching its only neighbour, and no 2x2 of open floor anywhere', () => {
    for (const m of FLOORS) {
      for (const w of m.warps) expect(sidesOf(m, pos(w)), `${m.id} warp ${k(w)}`).toHaveLength(1);
      for (const n of m.npcs) {
        if (n.isItemBall) expect(sidesOf(m, n), `${m.id} ${n.id}`).toHaveLength(1);
        if (n.isTrainer) {
          expect(n.sightRange, `${m.id} ${n.id} sight`).toBe(1);
          expect(sidesOf(m, n), `${m.id} ${n.id} niche`).toEqual([front(m, n.id)]);
        }
      }
      for (let y = 0; y + 1 < m.height; y++) for (let x = 0; x + 1 < m.width; x++) {
        const open = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].every(([a, b]) => !m.collision[b][a]);
        expect(open, `${m.id} has a 2x2 of open floor at ${x},${y}`).toBe(false);
      }
    }
    expect(F1.npcs.filter(n => n.isTrainer).map(n => n.id).sort()).toEqual(F1_TRAINERS);
    expect(B1.npcs.filter(n => n.isTrainer).map(n => n.id).sort()).toEqual(B1_TRAINERS);
  });

  describe('1F: three sealed regions', () => {
    it('the south region: from the south mouth only d is in reach, not b, a, c or the north mouth', () => {
      expect(reach(F1, fromNorthSection, f1d)).toBe(true);
      for (const g of [f1b, f1a, f1c, mouthNorth]) expect(reach(F1, fromNorthSection, g), k(g)).toBe(false);
    });
    it('the middle region: from b only a is in reach (and b itself)', () => {
      expect(reach(F1, f1FromB, f1a)).toBe(true);
      for (const g of [f1d, f1c, mouthSouth, mouthNorth]) expect(reach(F1, f1FromB, g), k(g)).toBe(false);
      expect(reach(F1, f1FromA, f1b), 'and back').toBe(true);
    });
    it('the north region: from c only the north mouth is in reach; coming in from Route 10\'s south section leads only to c', () => {
      expect(reach(F1, f1FromC, mouthNorth)).toBe(true);
      for (const g of [f1d, f1b, f1a, mouthSouth]) expect(reach(F1, f1FromC, g), k(g)).toBe(false);
      expect(reach(F1, fromSouthSection, f1c)).toBe(true);
      expect(reach(F1, fromSouthSection, mouthSouth)).toBe(false);
    });
    it('the south region winds: the mouth to d is at least three times the straight line', () => {
      const n = steps(F1, fromNorthSection, f1d);
      const straight = Math.abs(f1d.x - fromNorthSection.x) + Math.abs(f1d.y - fromNorthSection.y);
      expect(n / straight).toBeGreaterThanOrEqual(3);
    });
    it('two trainers guard each region\'s way through', () => {
      const cut = (from: Pos, id: string, goal: Pos) => !reach(F1, from, goal, { alsoBlocked: [front(F1, id)] });
      expect(cut(fromNorthSection, 'rock_tunnel_trainer1', f1d)).toBe(true);
      expect(cut(fromNorthSection, 'rock_tunnel_trainer3', f1d)).toBe(true);
      expect(cut(f1FromB, 'rock_tunnel_trainer2', f1a)).toBe(true);
      expect(cut(f1FromB, 'rock_tunnel_trainer4', f1a)).toBe(true);
      expect(cut(f1FromC, 'rock_tunnel_trainer5', mouthNorth)).toBe(true);
      expect(cut(f1FromC, 'rock_tunnel_trainer6', mouthNorth)).toBe(true);
    });
    it('one item per region: ESCAPE ROPE south, REVIVE middle, REPEL north', () => {
      const balls = F1.npcs.filter(n => n.isItemBall);
      expect(balls.map(b => b.itemId).sort()).toEqual(['escape_rope', 'repel', 'revive']);
      expect(balls.filter(b => reachNpc(F1, fromNorthSection, b.id)).map(b => b.itemId)).toEqual(['escape_rope']);
      expect(balls.filter(b => reachNpc(F1, f1FromB, b.id)).map(b => b.itemId)).toEqual(['revive']);
      expect(balls.filter(b => reachNpc(F1, f1FromC, b.id)).map(b => b.itemId)).toEqual(['repel']);
    });
  });

  describe('B1F: two sealed regions', () => {
    it('region 1: from d only b is in reach; region 2: from a only c; and back', () => {
      const all = [b1d, b1b, b1a, b1c];
      expect(all.filter(l => reach(B1, b1FromD, l))).toEqual([b1d, b1b]);
      expect(all.filter(l => reach(B1, b1FromB, l))).toEqual([b1d, b1b]);
      expect(all.filter(l => reach(B1, b1FromA, l))).toEqual([b1a, b1c]);
      expect(all.filter(l => reach(B1, b1FromC, l))).toEqual([b1a, b1c]);
    });
    it('both regions wind: d to b and a to c are at least 2.5x the straight line', () => {
      for (const [from, to] of [[b1FromD, b1b], [b1FromA, b1c]] as const) {
        const n = steps(B1, from, to);
        expect(n / (Math.abs(to.x - from.x) + Math.abs(to.y - from.y))).toBeGreaterThanOrEqual(2.5);
      }
    });
    it('two trainers guard each region', () => {
      const cut = (from: Pos, id: string, goal: Pos) => !reach(B1, from, goal, { alsoBlocked: [front(B1, id)] });
      expect(cut(b1FromD, 'rock_tunnel_b1f_trainer1', b1b)).toBe(true);
      expect(cut(b1FromD, 'rock_tunnel_b1f_trainer3', b1b)).toBe(true);
      expect(cut(b1FromA, 'rock_tunnel_b1f_trainer2', b1c)).toBe(true);
      expect(cut(b1FromA, 'rock_tunnel_b1f_trainer4', b1c)).toBe(true);
    });
    it('the SUPER POTION is in region 1; the RARE CANDY and ESCAPE ROPE in region 2', () => {
      const balls = B1.npcs.filter(n => n.isItemBall);
      expect(balls.filter(b => reachNpc(B1, b1FromD, b.id)).map(b => b.itemId)).toEqual(['super_potion']);
      expect(balls.filter(b => reachNpc(B1, b1FromA, b.id)).map(b => b.itemId).sort()).toEqual(['escape_rope', 'rare_candy']);
    });
  });

  it('the whole walkthrough: Route 10 north -> d -> b -> a -> c -> Route 10 south, and the same way back', () => {
    expect(reach(F1, fromNorthSection, f1d)).toBe(true);
    expect(reach(B1, b1FromD, b1b)).toBe(true);
    expect(reach(F1, f1FromB, f1a)).toBe(true);
    expect(reach(B1, b1FromA, b1c)).toBe(true);
    expect(reach(F1, f1FromC, mouthNorth)).toBe(true);
    expect(reach(F1, fromSouthSection, f1c)).toBe(true);
    expect(reach(B1, b1FromC, b1a)).toBe(true);
    expect(reach(F1, f1FromA, f1b)).toBe(true);
    expect(reach(B1, b1FromB, b1d)).toBe(true);
    expect(reach(F1, f1FromD, mouthSouth)).toBe(true);
    for (const m of FLOORS) expect(m.tiles.every(row => row.every(t => t === TileType.CAVE_WALL || t === TileType.CAVE_FLOOR || t === TileType.CAVE_ENTRANCE))).toBe(true);
  });
});
