// Victory Road walkthrough, proven on the real map data with the boulder
// solver (src/logic/boulders.ts): every step of the intended route works and
// every shortcut the layout is meant to forbid is closed. Trainers count as
// solid (they keep blocking their tile after the battle).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { canDropBoulders, canPressPlate, canReach, dropFlag, instantiateMap, landedBoulders, lockFlag, Pos } from '../../src/logic/boulders';
import { DIR_VECTORS } from '../../src/utils/constants';

const F1 = ALL_MAPS.victory_road;
const F2 = ALL_MAPS.victory_road_2f;
const F3 = ALL_MAPS.victory_road_3f;

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
const trainers = (map: MapData) => map.npcs.filter(n => n.isTrainer).map(n => ({ x: n.x, y: n.y }));
/** Tiles the player can stand on to interact with an NPC (walkable, not under a trainer). */
const npcSides = (map: MapData, id: string): Pos[] => {
  const npc = map.npcs.find(n => n.id === id)!;
  const sides = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    .map(d => ({ x: npc.x + d.x, y: npc.y + d.y }))
    .filter(p => !map.collision[p.y]?.[p.x] && !trainers(map).some(t => t.x === p.x && t.y === p.y));
  if (!sides.length) throw new Error(`${map.id}: ${id} has no free neighbour`);
  return sides;
};
const reachNpc = (map: MapData, from: Pos, id: string) => npcSides(map, id).some(p => reach(map, from, p));
const reach = (map: MapData, a: Pos, b: Pos, storyFlags?: Record<string, boolean>) => {
  const r = canReach(map, a, b, { blocked: trainers(map), storyFlags });
  expect(r.exhausted, `${map.id}: solver hit the state cap`).toBe(false);
  return r.found;
};

// 1F landmarks
const entrance = landing(ALL_MAPS.route23, F1);        // from Route 23
const exitX = warpTo(F1, 'indigo_plateau');
const ladder1 = warpTo(F1, 'victory_road_2f', 0);       // up to 2F
const ladder3 = warpTo(F1, 'victory_road_2f', 1);       // 2F's way down into the exit pocket
// 2F landmarks
const f2fromL1 = landing(F1, F2, 0);
const f2fromL3 = landing(F1, F2, 1);
const ladder2 = warpTo(F2, 'victory_road_3f');
const f2toL3 = warpTo(F2, 'victory_road', 1);
// 3F landmarks
const f3from2 = landing(F2, F3);

describe('Victory Road', () => {
  it('is three floors with the ladders wired both ways', () => {
    expect(landing(F2, F1, 0)).toEqual(ladder1);
    expect(landing(F2, F1, 1)).toEqual(ladder3);
    expect(landing(F3, F2)).toEqual(ladder2);
    expect(landing(ALL_MAPS.indigo_plateau, F1)).toEqual(exitX);
    for (const m of [F1, F2, F3]) expect(m.tiles[m.height - 1].every(t => t === TileType.CAVE_WALL) || m === F1, `${m.id} bottom row`).toBe(true);
  });

  describe('1F', () => {
    it('the ladder up is behind the gate: unreachable until boulder O is on plate S', () => {
      const gate = F1.gates![0];
      const closed = { ...F1, gates: [] }; // the plate never opens anything
      expect(reach(closed, entrance, ladder1)).toBe(false);
      expect(canPressPlate(F1, entrance, gate.switch!, { blocked: trainers(F1) }).found).toBe(true);
      expect(reach(F1, entrance, ladder1)).toBe(true);
    });
    it('the exit pocket is sealed: X only from ladder 3, and the ledge drops back to the entrance side', () => {
      expect(reach(F1, entrance, exitX)).toBe(false);
      expect(reach(F1, ladder3, exitX)).toBe(true);
      expect(reach(F1, ladder3, entrance)).toBe(true);
      expect(reach(F1, entrance, ladder3)).toBe(false);
      expect(F1.tiles.flat().filter(t => t === TileType.LEDGE).length).toBeGreaterThan(0);
    });
    it('every item is reachable from the entrance or the exit pocket', () => {
      for (const n of F1.npcs.filter(n => n.isItemBall)) {
        expect(reachNpc(F1, entrance, n.id) || reachNpc(F1, ladder3, n.id), n.id).toBe(true);
      }
    });
  });

  describe('2F', () => {
    it('the way up to 3F is behind gate G: boulder O must reach plate S (it cannot go straight, the pillar is in the way)', () => {
      const [gateG] = F2.gates!;
      const closed = { ...F2, gates: [] };
      expect(reach(closed, f2fromL1, ladder2)).toBe(false);
      expect(canPressPlate(F2, f2fromL1, gateG.switch!, { blocked: trainers(F2) }).found).toBe(true);
      expect(reach(F2, f2fromL1, ladder2)).toBe(true);
      // Straight line from O to S is blocked by the pillar.
      const O = puzzleBoulder();
      expect(O.y).toBe(gateG.switch!.y);
      const between = F2.tiles[O.y].slice(Math.min(O.x, gateG.switch!.x) + 1, Math.max(O.x, gateG.switch!.x));
      expect(between.some(t => t === TileType.CAVE_WALL)).toBe(true);
    });
    it('Moltres is reachable from ladder 1 (behind its own Strength boulder) and is off the critical path', () => {
      const m = F2.npcs.find(n => n.id === 'moltres_victory_road')!;
      const side = { x: m.x, y: m.y - 1 };
      expect(reach(F2, f2fromL1, side)).toBe(true);
      const noPush = { ...F2, tiles: F2.tiles.map(r => r.map(t => (t === TileType.BOULDER ? TileType.CAVE_WALL : t))) };
      expect(reach(noPush, f2fromL1, side)).toBe(false);
    });
    it('ladder 3 is behind gate g, whose plate no boulder on this floor can press', () => {
      const [, gateg] = F2.gates!;
      expect(reach(F2, f2fromL1, f2toL3)).toBe(false);
      expect(canPressPlate(F2, f2fromL1, gateg.switch!, { blocked: trainers(F2) }).found).toBe(false);
    });
    it('opens once the 3F boulder has dropped onto plate s; with plate S locked too, every later trip works from either ladder', () => {
      const [gateG, gateg] = F2.gates!;
      const hole = F3.holes![0];
      expect({ x: hole.targetX, y: hole.targetY }).toEqual(gateg.switch);
      expect(hole.targetMap).toBe(F2.id);
      const landed = landedBoulders(ALL_MAPS, F2.id, { [dropFlag(F3.id, dropOrigin(), hole)]: true });
      expect(landed).toEqual([gateg.switch]);
      // The drop alone opens g (a fresh visit before the puzzle is solved is how the test models "not yet locked").
      const dropped = instantiateMap(F2, {}, landed).map;
      expect(dropped.tiles[gateg.y][gateg.x]).not.toBe(TileType.GATE);
      expect(reach(dropped, f2fromL1, f2toL3)).toBe(true);
      // Persisted state after the first pass: O locked on S (Gen I keeps boulders on switches) and the drop.
      const done = instantiateMap(F2, { [lockFlag(F2.id, puzzleBoulder(), gateG.switch!)]: true }, landed).map;
      expect(done.tiles[gateG.y][gateG.x]).not.toBe(TileType.GATE);
      expect(reach(done, f2fromL3, f2fromL1)).toBe(true);
      expect(reach(done, f2fromL3, ladder2)).toBe(true);
      expect(reach(done, f2fromL1, f2toL3)).toBe(true);
    });
  });

  describe('3F', () => {
    it('the boulder can be dropped into the hole from the ladder', () => {
      expect(F3.tiles.flat().filter(t => t === TileType.BOULDER).length).toBe(1);
      expect(canDropBoulders(F3, f3from2, 1, { blocked: trainers(F3) }).found).toBe(true);
    });
    it('the TM beyond the hole is only reachable once the boulder is gone', () => {
      const tm = F3.npcs.find(n => n.isItemBall && n.itemId?.startsWith('tm'))!;
      const stuck = { ...F3, tiles: F3.tiles.map(r => r.map(t => (t === TileType.BOULDER ? TileType.CAVE_WALL : t))) };
      expect(reachNpc(stuck, f3from2, tm.id)).toBe(false);
      expect(reachNpc(F3, f3from2, tm.id)).toBe(true);
    });
  });

  it('every trainer stands in a niche (at most two open neighbours) facing a corridor tile', () => {
    for (const map of [F1, F2, F3]) {
      for (const t of map.npcs.filter(n => n.isTrainer)) {
        const d = DIR_VECTORS[t.direction];
        expect(map.collision[t.y + d.y]?.[t.x + d.x], `${map.id}/${t.id} faces a wall`).toBe(false);
        const open = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }].filter(o => !map.collision[t.y + o.y]?.[t.x + o.x]);
        expect(open.length, `${map.id}/${t.id} stands in the open`).toBeLessThanOrEqual(2);
      }
    }
  });
});

function boulders(map: MapData): Pos[] {
  const out: Pos[] = [];
  map.tiles.forEach((row, y) => row.forEach((t, x) => { if (t === TileType.BOULDER) out.push({ x, y }); }));
  return out;
}
/** The one boulder on 3F. */
function dropOrigin(): Pos {
  const b = boulders(F3);
  expect(b).toHaveLength(1);
  return b[0];
}
/** The 2F puzzle boulder: the one in the same row as plate S. */
function puzzleBoulder(): Pos {
  const S = F2.gates![0].switch!;
  const b = boulders(F2).filter(p => p.y === S.y);
  expect(b).toHaveLength(1);
  return b[0];
}
