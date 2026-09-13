import { describe, it, expect } from 'vitest';
import { MapData, TileType as T } from '../../src/types/map.types';
import { createMapShape } from '../../src/data/mapBuilder';
import {
  lockFlag, getBoulderLocks, tileUnder, isPlatePressed, instantiateMap, pushBoulder,
  solve, canReach, canPressPlate,
} from '../../src/logic/boulders';

// Build a map from an ASCII sketch: # wall, . floor, O boulder, S plate, G gate,
// ^ ledge (hop down only). Gates listed explicitly.
function sketch(rows: string[], gates: MapData['gates'] = [], id = 'test_cave'): MapData {
  const H = rows.length, W = rows[0].length;
  const { tiles, collision, setTile } = createMapShape(W, H, T.CAVE_FLOOR);
  const ch: Record<string, T> = { '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, O: T.BOULDER, S: T.SWITCH_PLATE, G: T.GATE, '^': T.LEDGE };
  rows.forEach((r, y) => [...r].forEach((c, x) => setTile(x, y, ch[c])));
  return { id, name: id, width: W, height: H, tiles, collision, warps: [], npcs: [], gates };
}
const at = (m: MapData, x: number, y: number) => m.tiles[y][x];

describe('lock flags', () => {
  it('round-trips through the flag name', () => {
    const flags = { [lockFlag('victory_road_1f', { x: 14, y: 18 }, { x: 10, y: 18 })]: true, cut_route_2_1_1: true, [lockFlag('other_map', { x: 1, y: 1 }, { x: 2, y: 2 })]: true };
    expect(getBoulderLocks(flags, 'victory_road_1f')).toEqual([{ origin: { x: 14, y: 18 }, plate: { x: 10, y: 18 } }]);
  });
  it('a map id containing digits and underscores is fine', () => {
    const flags = { [lockFlag('silph_co_2f', { x: 3, y: 4 }, { x: 5, y: 4 })]: true };
    expect(getBoulderLocks(flags, 'silph_co_2f')).toEqual([{ origin: { x: 3, y: 4 }, plate: { x: 5, y: 4 } }]);
    expect(getBoulderLocks(flags, 'silph_co_2')).toEqual([]);
  });
  it('false flags are ignored', () => {
    expect(getBoulderLocks({ [lockFlag('m', { x: 1, y: 1 }, { x: 2, y: 1 })]: false }, 'm')).toEqual([]);
  });
});

describe('instantiateMap', () => {
  const base = sketch([
    '#######',
    '#.O.S.#',
    '#..G..#',
    '#######',
  ], [{ x: 3, y: 2, switch: { x: 4, y: 1 } }]);

  it('fresh visit: boulders at origins, gate closed, base data untouched', () => {
    const { map, origins } = instantiateMap(base, {});
    expect(at(map, 2, 1)).toBe(T.BOULDER);
    expect(at(map, 3, 2)).toBe(T.GATE);
    expect(map.collision[2][3]).toBe(true);
    expect([...origins.entries()]).toEqual([['2,1', { x: 2, y: 1 }]]);
    map.tiles[1][2] = T.CAVE_FLOOR;
    expect(at(base, 2, 1)).toBe(T.BOULDER);
    expect(map.npcs).toBe(base.npcs);
  });
  it('locked boulder is restored onto its plate and the gate is open', () => {
    const flags = { [lockFlag('test_cave', { x: 2, y: 1 }, { x: 4, y: 1 })]: true };
    const { map, origins } = instantiateMap(base, flags);
    expect(isPlatePressed(base, map, { x: 4, y: 1 })).toBe(true);
    expect(isPlatePressed(base, map, { x: 3, y: 1 })).toBe(false);
    expect(at(map, 2, 1)).toBe(T.CAVE_FLOOR);
    expect(map.collision[1][2]).toBe(false);
    expect(at(map, 4, 1)).toBe(T.BOULDER);
    expect(map.collision[1][4]).toBe(true);
    expect(at(map, 3, 2)).toBe(T.CAVE_FLOOR);
    expect(map.collision[2][3]).toBe(false);
    expect(origins.get('4,1')).toEqual({ x: 2, y: 1 });
  });
  it('stale flags that do not match the map data are ignored', () => {
    const flags = {
      [lockFlag('test_cave', { x: 1, y: 1 }, { x: 4, y: 1 })]: true, // no boulder at 1,1
      [lockFlag('test_cave', { x: 2, y: 1 }, { x: 5, y: 1 })]: true, // no plate at 5,1
    };
    const { map } = instantiateMap(base, flags);
    expect(at(map, 2, 1)).toBe(T.BOULDER);
    expect(at(map, 4, 1)).toBe(T.SWITCH_PLATE);
    expect(at(map, 3, 2)).toBe(T.GATE);
  });
  it('floorTile overrides what appears under a moved boulder', () => {
    const b = { ...base, floorTile: T.INDOOR_FLOOR };
    expect(tileUnder(b, 2, 1)).toBe(T.INDOOR_FLOOR);
    expect(tileUnder(b, 3, 2)).toBe(T.INDOOR_FLOOR);
    expect(tileUnder(b, 4, 1)).toBe(T.SWITCH_PLATE);
  });
});

describe('pushBoulder', () => {
  const base = sketch([
    '#######',
    '#.O.S.#',
    '#..G..#',
    '#######',
  ], [{ x: 3, y: 2, switch: { x: 4, y: 1 } }]);

  it('moves the boulder, reveals the floor, reports changed tiles', () => {
    const inst = instantiateMap(base, {});
    const flags: Record<string, boolean> = {};
    const r = pushBoulder(base, inst, flags, { x: 2, y: 1 }, { x: 1, y: 0 });
    expect(r).toEqual({ ok: true, changed: [{ x: 2, y: 1 }, { x: 3, y: 1 }] });
    expect(at(inst.map, 2, 1)).toBe(T.CAVE_FLOOR);
    expect(at(inst.map, 3, 1)).toBe(T.BOULDER);
    expect(inst.map.collision[1][3]).toBe(true);
    expect(inst.origins.get('3,1')).toEqual({ x: 2, y: 1 });
    expect(flags).toEqual({});
  });
  it('onto the plate: sets the lock flag and opens the gate; off again: clears and closes', () => {
    const inst = instantiateMap(base, {});
    const flags: Record<string, boolean> = {};
    pushBoulder(base, inst, flags, { x: 2, y: 1 }, { x: 1, y: 0 });
    const r = pushBoulder(base, inst, flags, { x: 3, y: 1 }, { x: 1, y: 0 });
    expect(r.changed).toEqual([{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 3, y: 2 }]);
    expect(flags).toEqual({ [lockFlag('test_cave', { x: 2, y: 1 }, { x: 4, y: 1 })]: true });
    expect(at(inst.map, 3, 2)).toBe(T.CAVE_FLOOR);
    expect(inst.map.collision[2][3]).toBe(false);
    const r2 = pushBoulder(base, inst, flags, { x: 4, y: 1 }, { x: 1, y: 0 });
    expect(r2.changed).toEqual([{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 3, y: 2 }]);
    expect(at(inst.map, 4, 1)).toBe(T.SWITCH_PLATE);
    expect(flags).toEqual({});
    expect(at(inst.map, 3, 2)).toBe(T.GATE);
    expect(inst.map.collision[2][3]).toBe(true);
  });
  it('refuses to push into a wall, off the map, or a tile that is not a boulder', () => {
    const inst = instantiateMap(base, {});
    expect(pushBoulder(base, inst, {}, { x: 2, y: 1 }, { x: 0, y: -1 }).ok).toBe(false);
    expect(pushBoulder(base, inst, {}, { x: 1, y: 1 }, { x: 1, y: 0 }).ok).toBe(false);
    expect(at(inst.map, 2, 1)).toBe(T.BOULDER);
  });
  it('the whole cycle survives a fresh instantiate: locked boulder stays, others reset', () => {
    const two = sketch(['#######', '#.O.S.#', '#.O...#', '#######']);
    const inst = instantiateMap(two, {});
    const flags: Record<string, boolean> = {};
    pushBoulder(two, inst, flags, { x: 2, y: 1 }, { x: 1, y: 0 });
    pushBoulder(two, inst, flags, { x: 3, y: 1 }, { x: 1, y: 0 });
    pushBoulder(two, inst, flags, { x: 2, y: 2 }, { x: 1, y: 0 });
    const again = instantiateMap(two, flags).map;
    expect(at(again, 4, 1)).toBe(T.BOULDER);   // locked on the plate
    expect(at(again, 2, 1)).toBe(T.CAVE_FLOOR);
    expect(at(again, 2, 2)).toBe(T.BOULDER);   // reset
    expect(at(again, 3, 2)).toBe(T.CAVE_FLOOR);
  });
});

describe('solver', () => {
  it('plain corridor reachability and walls', () => {
    const m = sketch(['#####', '#...#', '#.#.#', '#####']);
    expect(canReach(m, { x: 1, y: 1 }, { x: 3, y: 2 }).found).toBe(true);
    expect(canReach(m, { x: 1, y: 1 }, { x: 2, y: 2 }).found).toBe(false);
  });
  it('ledges are hop-down only', () => {
    const m = sketch(['#####', '#...#', '#^^^#', '#...#', '#####']);
    expect(canReach(m, { x: 1, y: 1 }, { x: 1, y: 3 }).found).toBe(true);
    expect(canReach(m, { x: 1, y: 3 }, { x: 1, y: 1 }).found).toBe(false);
  });
  it('a gate blocks until its plate is pressed; pushing needs room behind the boulder', () => {
    const m = sketch([
      '#########',
      '#..O..S.#',
      '#.#####G#',
      '#.......#',
      '#########',
    ], [{ x: 7, y: 2, switch: { x: 6, y: 1 } }]);
    // From the left: push the boulder east onto the plate, gate opens, reach the bottom row via the gate.
    expect(canPressPlate(m, { x: 1, y: 1 }, { x: 6, y: 1 }).found).toBe(true);
    expect(canReach(m, { x: 1, y: 1 }, { x: 7, y: 3 }).found).toBe(true);
    // Without the gate wired, the bottom row is only reachable through the left corridor (still true here).
    const noGate = { ...m, gates: [] };
    expect(canReach(noGate, { x: 1, y: 1 }, { x: 7, y: 3 }).found).toBe(true);
    // Sealed variant: the bottom-right pocket is only reachable through the gate.
    // Sealed variant: the bottom pocket is only reachable through the gate, which
    // sits under the corridor just before the plate (the boulder on the plate
    // blocks the corridor beyond it).
    const sealed = sketch([
      '#########',
      '#..O..S.#',
      '#####G###',
      '#####...#',
      '#########',
    ], [{ x: 5, y: 2, switch: { x: 6, y: 1 } }]);
    expect(canReach(sealed, { x: 1, y: 1 }, { x: 7, y: 3 }).found).toBe(true);
    expect(canReach({ ...sealed, gates: [] }, { x: 1, y: 1 }, { x: 7, y: 3 }).found).toBe(false);
    // Standing east of the plate: the boulder can only be pushed west, away from it.
    expect(canPressPlate(sealed, { x: 7, y: 1 }, { x: 6, y: 1 }).found).toBe(false);
  });
  it('a boulder pushed into a dead end is stuck (state space is finite and exhaustive)', () => {
    const m = sketch(['######', '#.O.S#', '######']);
    // Plate at 4,1 is adjacent to the wall: the boulder can reach it from the left.
    expect(canPressPlate(m, { x: 1, y: 1 }, { x: 4, y: 1 }).found).toBe(true);
    const far = sketch(['#######', '#.O..S#', '#######']);
    expect(canPressPlate(far, { x: 1, y: 1 }, { x: 5, y: 1 }).found).toBe(true);
    const wrongSide = sketch(['########', '#S...O.#', '########']);
    expect(canPressPlate(wrongSide, { x: 2, y: 1 }, { x: 1, y: 1 }).found).toBe(false);
  });
  it('blocked tiles (trainers) and the state cap are honoured', () => {
    const m = sketch(['#####', '#...#', '#####']);
    expect(canReach(m, { x: 1, y: 1 }, { x: 3, y: 1 }, { blocked: [{ x: 2, y: 1 }] }).found).toBe(false);
    const r = solve(m, { x: 1, y: 1 }, () => false, { maxStates: 2 });
    expect(r.exhausted).toBe(true);
  });
});
