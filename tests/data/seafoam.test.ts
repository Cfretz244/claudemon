// Seafoam Islands walkthrough, proven on the real map data: the through-route
// (Route 20 west door -> east door) needs no HM, Articuno needs Strength (two
// boulders dropped B2F -> B3F -> B4F) and Surf (the B4F river sweeps a surfer
// back to the shore until both boulders have stilled it). Every NPC counts as
// solid and every warp tile other than the goal too (as in victoryRoad.test.ts).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { canDropBoulders, canReach, dropFlag, instantiateMap, landedBoulders, Pos } from '../../src/logic/boulders';
import { computeCurrentSlide } from '../../src/logic/spinTiles';
import { DIR_VECTORS } from '../../src/utils/constants';

const R20 = ALL_MAPS.route20;
const F1 = ALL_MAPS.seafoam_1f;
const B1 = ALL_MAPS.seafoam_b1f;
const B2 = ALL_MAPS.seafoam_b2f;
const B3 = ALL_MAPS.seafoam_b3f;
const B4 = ALL_MAPS.seafoam_b4f;
const FLOORS = [F1, B1, B2, B3, B4];

const warpsTo = (map: MapData, target: string) => map.warps.filter(w => w.targetMap === target);
const warpTo = (map: MapData, target: string, n = 0): Pos => {
  const w = warpsTo(map, target)[n];
  if (!w) throw new Error(`${map.id}: no warp ${n} to ${target}`);
  return { x: w.x, y: w.y };
};
const landing = (from: MapData, to: MapData, n = 0): Pos => {
  const w = warpsTo(from, to.id)[n];
  if (!w) throw new Error(`${from.id}: no warp ${n} to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const npcs = (map: MapData) => map.npcs.map(n => ({ x: n.x, y: n.y }));
const isWater = (t: TileType | undefined) => t === TileType.WATER || t === TileType.CURRENT;
/** Tiles the player can stand on to interact with an NPC (walkable land, not under another NPC). */
const npcSides = (map: MapData, id: string): Pos[] => {
  const npc = map.npcs.find(n => n.id === id)!;
  const sides = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    .map(d => ({ x: npc.x + d.x, y: npc.y + d.y }))
    .filter(p => !map.collision[p.y]?.[p.x] && !npcs(map).some(t => t.x === p.x && t.y === p.y));
  if (!sides.length) throw new Error(`${map.id}: ${id} has no free neighbour`);
  return sides;
};
/** On foot, pushing boulders; warps other than the goal are obstacles. */
const reach = (map: MapData, a: Pos, b: Pos) => {
  const warps = map.warps.filter(w => !(w.x === b.x && w.y === b.y)).map(w => ({ x: w.x, y: w.y }));
  const r = canReach(map, a, b, { blocked: [...npcs(map), ...warps] });
  expect(r.exhausted, `${map.id}: solver hit the state cap`).toBe(false);
  return r.found;
};
const reachNpc = (map: MapData, from: Pos, id: string) => npcSides(map, id).some(p => reach(map, from, p));
/**
 * Surfing reachability: the player walks land and water alike (surfing on
 * and off at the shore); stepping onto a current slides them wherever
 * `computeCurrentSlide` says. Returns every tile the player can end a move on.
 */
function surfReach(map: MapData, from: Pos, goal?: Pos): Set<string> {
  const k = (p: Pos) => `${p.x},${p.y}`;
  const solid = npcs(map);
  const blocked = (x: number, y: number) => !isWater(map.tiles[y]?.[x]) || solid.some(t => t.x === x && t.y === y);
  const free = (p: Pos) => p.x >= 0 && p.y >= 0 && p.x < map.width && p.y < map.height
    && (!map.collision[p.y][p.x] || isWater(map.tiles[p.y][p.x])) && !solid.some(t => t.x === p.x && t.y === p.y)
    && !map.warps.some(w => w.x === p.x && w.y === p.y && !(goal && p.x === goal.x && p.y === goal.y));
  const seen = new Set<string>([k(from)]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    for (const d of Object.values(DIR_VECTORS)) {
      let n = { x: p.x + d.x, y: p.y + d.y };
      if (!free(n)) continue;
      if (map.tiles[n.y][n.x] === TileType.CURRENT) {
        const slide = computeCurrentSlide(map, n.x, n.y, blocked);
        if (slide.path.length) n = { x: slide.path[slide.path.length - 1].x, y: slide.path[slide.path.length - 1].y };
      }
      if (!seen.has(k(n))) { seen.add(k(n)); queue.push(n); }
    }
  }
  return seen;
}
const surfReaches = (map: MapData, from: Pos, to: Pos) => surfReach(map, from, to).has(`${to.x},${to.y}`);
const surfReachesNpc = (map: MapData, from: Pos, id: string) => { const r = surfReach(map, from); return npcSides(map, id).some(p => r.has(`${p.x},${p.y}`)); };

// Landmarks
const westDoor = landing(R20, F1, 0);      // Route 20 west door -> 1F
const eastDoor = landing(R20, F1, 1);      // Route 20 east door -> 1F
const f1Ladder1 = warpTo(F1, B1.id, 0);
const f1Ladder4 = warpTo(F1, B1.id, 1);
const f1Ladder5 = warpTo(F1, B1.id, 2);
const b1From1 = landing(F1, B1, 0);
const b1From4 = landing(F1, B1, 1);
const b1From5 = landing(F1, B1, 2);
const b1Ladder2 = warpTo(B1, B2.id, 0);
const b1Ladder3 = warpTo(B1, B2.id, 1);
const b1Ladder4 = warpTo(B1, F1.id, 1);
const b1Ladder5 = warpTo(B1, F1.id, 2);
const b2From2 = landing(B1, B2, 0);
const b2From3 = landing(B1, B2, 1);
const b2Ladder3 = warpTo(B2, B1.id, 1);
const b2Ladder6 = warpTo(B2, B3.id);
const b3From6 = landing(B2, B3);
const b3Ladder7 = warpTo(B3, B4.id);
const b3From7 = landing(B4, B3);
const b4From7 = landing(B3, B4);

const b3Landed = () => B2.holes!.map(h => ({ x: h.targetX, y: h.targetY }));
const b3AllDropped = () => Object.fromEntries(b3Landed().flatMap(p => B3.holes!.map(h => [dropFlag(B3.id, p, h), true])));
const b2AllDropped = () => Object.fromEntries(boulders(B2).flatMap(o => B2.holes!.map(h => [dropFlag(B2.id, o, h), true])));

describe('Seafoam Islands', () => {
  it('is five floors, every ladder wired both ways, both Route 20 doors wired both ways', () => {
    expect(landing(B1, F1, 0)).toEqual(f1Ladder1);
    expect(landing(B1, F1, 1)).toEqual(f1Ladder4);
    expect(landing(B1, F1, 2)).toEqual(f1Ladder5);
    expect(landing(B2, B1, 0)).toEqual(b1Ladder2);
    expect(landing(B2, B1, 1)).toEqual(b1Ladder3);
    expect(landing(B3, B2)).toEqual(b2Ladder6);
    expect(landing(B4, B3)).toEqual(b3Ladder7);
    expect(landing(B3, B4)).toEqual(b4From7);
    // The two doors: 1F's exits land in front of the Route 20 doors, which lead back to the same 1F tiles.
    const [w, e] = warpsTo(F1, R20.id);
    expect(westDoor).toEqual({ x: w.x, y: w.y });
    expect(eastDoor).toEqual({ x: e.x, y: e.y });
    for (const exit of [w, e]) {
      const door = R20.warps.find(d => d.targetMap === F1.id && d.targetX === exit.x && d.targetY === exit.y)!;
      expect(Math.abs(door.x - exit.targetX) + Math.abs(door.y - exit.targetY), `${exit.x},${exit.y}: the door is next to where the exit lands`).toBe(1);
    }
    for (const m of FLOORS) expect(m.name).toBe('SEAFOAM ISLANDS');
  });

  describe('Route 20', () => {
    const fromRoute19 = landing(ALL_MAPS.route19, R20);
    const fromCinnabar = landing(ALL_MAPS.cinnabar_island, R20);
    const westDoorTile = R20.warps.find(d => d.targetMap === F1.id && d.targetX === westDoor.x && d.targetY === westDoor.y)!;
    const eastDoorTile = R20.warps.find(d => d.targetMap === F1.id && d.targetX === eastDoor.x && d.targetY === eastDoor.y)!;
    it('surfing from Route 19 reaches the west door and surfing from Cinnabar reaches the east door', () => {
      expect(isWater(R20.tiles[fromRoute19.y][fromRoute19.x])).toBe(true);
      expect(isWater(R20.tiles[fromCinnabar.y][fromCinnabar.x])).toBe(true);
      expect(surfReaches(R20, fromRoute19, westDoorTile)).toBe(true);
      expect(surfReaches(R20, fromCinnabar, eastDoorTile)).toBe(true);
    });
    it('the islands split the sea: the only way from Route 19 to Cinnabar is through the cave', () => {
      expect(surfReaches(R20, fromRoute19, fromCinnabar)).toBe(false);
      expect(surfReaches(R20, fromRoute19, eastDoorTile)).toBe(false);
      expect(surfReaches(R20, fromCinnabar, westDoorTile)).toBe(false);
    });
    it('rolls its sea table while surfing, not on foot', () => {
      expect(R20.surfEncounters).toBeDefined();
      expect(R20.wildEncounters).toBeUndefined();
    });
  });

  describe('1F', () => {
    it('the west door reaches only ladder 1, the east door only ladder 4; the pockets do not join', () => {
      expect(reach(F1, westDoor, f1Ladder1)).toBe(true);
      expect(reach(F1, westDoor, eastDoor)).toBe(false);
      expect(reach(F1, westDoor, f1Ladder4)).toBe(false);
      expect(reach(F1, westDoor, f1Ladder5)).toBe(false);
      expect(reach(F1, eastDoor, f1Ladder4)).toBe(true);
      expect(reach(F1, eastDoor, f1Ladder5)).toBe(false);
    });
    it('the bonus pocket (ladder 5) holds the Rare Candy and nothing else leads there', () => {
      const candy = F1.npcs.find(n => n.isItemBall && n.itemId === 'rare_candy')!;
      expect(reachNpc(F1, f1Ladder5, candy.id)).toBe(true);
      expect(reachNpc(F1, westDoor, candy.id)).toBe(false);
      expect(reachNpc(F1, eastDoor, candy.id)).toBe(false);
    });
  });

  describe('B1F', () => {
    it('ladder 1 leads only down to ladder 2; ladder 3 leads up to ladders 4 and 5; the halves do not join', () => {
      expect(reach(B1, b1From1, b1Ladder2)).toBe(true);
      expect(reach(B1, b1From1, b1Ladder3)).toBe(false);
      expect(reach(B1, b1From1, b1Ladder4)).toBe(false);
      expect(reach(B1, b1From1, b1Ladder5)).toBe(false);
      const from3 = landing(B2, B1, 1);
      expect(reach(B1, from3, b1Ladder4)).toBe(true);
      expect(reach(B1, from3, b1Ladder5)).toBe(true);
      expect(reach(B1, from3, b1Ladder2)).toBe(false);
      expect(reach(B1, b1From4, b1Ladder5)).toBe(true);
      expect(reach(B1, b1From5, b1Ladder4)).toBe(true);
    });
    it('the item is reachable from ladder 1', () => {
      for (const n of B1.npcs.filter(n => n.isItemBall)) expect(reachNpc(B1, b1From1, n.id), n.id).toBe(true);
    });
  });

  describe('B2F', () => {
    it('the through-route needs no HM: ladder 2 reaches ladder 3 and ladder 6 with every boulder treated as a wall', () => {
      const noPush = { ...B2, tiles: B2.tiles.map(r => r.map(t => (t === TileType.BOULDER ? TileType.CAVE_WALL : t))) };
      expect(reach(noPush, b2From2, b2Ladder3)).toBe(true);
      expect(reach(noPush, b2From2, b2Ladder6)).toBe(true);
      expect(reach(noPush, b2From3, b2Ladder6)).toBe(true);
    });
    it('both boulders can be dropped from every landing, and each hole lands on a B3F floor tile beside a B3F hole', () => {
      expect(boulders(B2)).toHaveLength(2);
      expect(B2.holes).toHaveLength(2);
      for (const from of [b2From2, b2From3, landing(B3, B2)]) {
        const r = canDropBoulders(B2, from, 2, { blocked: [...npcs(B2), ...B2.warps.map(w => ({ x: w.x, y: w.y }))] });
        expect(r.exhausted).toBe(false);
        expect(r.found, `from ${from.x},${from.y}`).toBe(true);
      }
      for (const h of B2.holes!) {
        expect(h.targetMap).toBe(B3.id);
        expect(B3.tiles[h.targetY][h.targetX]).toBe(TileType.CAVE_FLOOR);
        const beside = B3.holes!.some(b => Math.abs(b.x - h.targetX) + Math.abs(b.y - h.targetY) === 1);
        expect(beside, `B2F hole ${h.x},${h.y} lands beside a B3F hole`).toBe(true);
      }
    });
    it('a boulder pushed the wrong way is not fatal: it resets on leaving, and the room can be re-entered', () => {
      for (const o of boulders(B2)) {
        const sides = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }].map(d => ({ x: o.x + d.x, y: o.y + d.y })).filter(p => !B2.collision[p.y][p.x]);
        for (const side of sides) expect(reach(B2, b2From2, side), `${o.x},${o.y} side ${side.x},${side.y}`).toBe(true);
      }
    });
  });

  describe('B3F', () => {
    it('has no boulder of its own: nothing can be dropped until the B2F boulders have landed', () => {
      expect(boulders(B3)).toHaveLength(0);
      expect(landedBoulders(ALL_MAPS, B3.id, {})).toEqual([]);
      expect(canDropBoulders(B3, b3From6, 1).found).toBe(false);
    });
    it('with the B2F boulders landed, both can be dropped into the B4F river from ladder 6 and from ladder 7', () => {
      const landed = landedBoulders(ALL_MAPS, B3.id, b2AllDropped());
      expect(landed.map(p => `${p.x},${p.y}`).sort()).toEqual(b3Landed().map(p => `${p.x},${p.y}`).sort());
      const live = instantiateMap(B3, {}, landed).map;
      for (const from of [b3From6, b3From7]) {
        const r = canDropBoulders(live, from, 2, { blocked: [...npcs(B3), ...B3.warps.map(w => ({ x: w.x, y: w.y }))] });
        expect(r.exhausted).toBe(false);
        expect(r.found, `from ${from.x},${from.y}`).toBe(true);
      }
      for (const h of B3.holes!) {
        expect(h.targetMap).toBe(B4.id);
        expect(B4.tiles[h.targetY][h.targetX]).toBe(TileType.CURRENT);
      }
    });
    it('once dropped on, the landed boulders are gone from B3F and sit in the B4F river', () => {
      const flags = { ...b2AllDropped(), ...b3AllDropped() };
      expect(landedBoulders(ALL_MAPS, B3.id, flags)).toEqual([]);
      const river = landedBoulders(ALL_MAPS, B4.id, flags);
      expect(river.map(p => `${p.x},${p.y}`).sort()).toEqual(B3.holes!.map(h => `${h.targetX},${h.targetY}`).sort());
    });
    it('ladder 7 is reachable on foot from ladder 6 with the landed boulders in place (they sit in alcoves)', () => {
      const live = instantiateMap(B3, {}, landedBoulders(ALL_MAPS, B3.id, b2AllDropped())).map;
      const stuck = { ...live, tiles: live.tiles.map(r => r.map(t => (t === TileType.BOULDER ? TileType.CAVE_WALL : t))) };
      expect(reach(stuck, b3From6, b3Ladder7)).toBe(true);
    });
  });

  describe('B4F', () => {
    const articuno = 'articuno_seafoam';
    const ball = B4.npcs.find(n => n.isItemBall)!;
    const riverTop = B3.holes!.map(h => ({ x: h.targetX, y: h.targetY }));
    const live = (flags: Record<string, boolean>) => instantiateMap(B4, flags, landedBoulders(ALL_MAPS, B4.id, flags)).map;
    it('the current sweeps a surfer who enters the river back to a still tile beside the shore', () => {
      const river = live({});
      const shoreTiles = new Set<string>();
      river.tiles.forEach((row, y) => row.forEach((t, x) => { if (t === TileType.CAVE_FLOOR) shoreTiles.add(`${x},${y}`); }));
      for (const top of riverTop) {
        const slide = computeCurrentSlide(river, top.x, top.y, (x, y) => !isWater(river.tiles[y]?.[x]));
        expect(slide.end).toBe('stop');
        const end = slide.path[slide.path.length - 1];
        expect(river.tiles[end.y][end.x]).toBe(TileType.WATER);
        const besideShore = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => shoreTiles.has(`${end.x + dx},${end.y + dy}`));
        expect(besideShore, `the sweep from ${top.x},${top.y} ends at ${end.x},${end.y}, next to land`).toBe(true);
        expect(reach(B4, end, b4From7) || reach(B4, { x: end.x - 1, y: end.y }, b4From7)).toBe(true);
      }
    });
    it('Articuno and the Ultra Ball are out of reach until BOTH boulders have stilled the river', () => {
      expect(surfReachesNpc(live({}), b4From7, articuno)).toBe(false);
      expect(surfReachesNpc(live({}), b4From7, ball.id)).toBe(false);
      for (const h of B3.holes!) {
        const oneOnly = { ...b2AllDropped(), [dropFlag(B3.id, b3Landed().find(p => Math.abs(p.x - h.x) + Math.abs(p.y - h.y) === 1)!, h)]: true };
        expect(landedBoulders(ALL_MAPS, B4.id, oneOnly)).toHaveLength(1);
        expect(surfReachesNpc(live(oneOnly), b4From7, articuno), `only hole ${h.x},${h.y} dropped`).toBe(false);
      }
    });
    it('with both dropped the river is still at the top, Articuno and the Ultra Ball are reachable, and the way back too', () => {
      const flags = { ...b2AllDropped(), ...b3AllDropped() };
      const done = live(flags);
      for (const top of riverTop) expect(done.tiles[top.y][top.x]).toBe(TileType.WATER);
      expect(surfReachesNpc(done, b4From7, articuno)).toBe(true);
      expect(surfReachesNpc(done, b4From7, ball.id)).toBe(true);
      const island = npcSides(done, articuno)[0];
      expect(surfReaches(done, island, b4From7)).toBe(true);
    });
    it('Articuno stands on land (the player talks to it from the island, not from the water)', () => {
      const m = B4.npcs.find(n => n.id === articuno)!;
      expect(B4.tiles[m.y][m.x]).toBe(TileType.CAVE_FLOOR);
      for (const p of npcSides(B4, articuno)) expect(B4.tiles[p.y][p.x]).toBe(TileType.CAVE_FLOOR);
    });
  });

  it('every trainer stands in a niche (at most two open neighbours) facing a corridor tile', () => {
    for (const map of FLOORS) {
      for (const t of map.npcs.filter(n => n.isTrainer)) {
        const d = DIR_VECTORS[t.direction];
        expect(map.collision[t.y + d.y]?.[t.x + d.x], `${map.id}/${t.id} faces a wall`).toBe(false);
        const open = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }].filter(o => !map.collision[t.y + o.y]?.[t.x + o.x]);
        expect(open.length, `${map.id}/${t.id} stands in the open`).toBeLessThanOrEqual(2);
      }
    }
    expect(FLOORS.flatMap(m => m.npcs.filter(n => n.isTrainer))).toHaveLength(6);
  });
});

function boulders(map: MapData): Pos[] {
  const out: Pos[] = [];
  map.tiles.forEach((row, y) => row.forEach((t, x) => { if (t === TileType.BOULDER) out.push({ x, y }); }));
  return out;
}
