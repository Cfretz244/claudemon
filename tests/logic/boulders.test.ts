import { describe, it, expect } from 'vitest';
import { MapData, TileType as T } from '../../src/types/map.types';
import { createMapShape } from '../../src/data/mapBuilder';
import { computeCurrentSlide } from '../../src/logic/spinTiles';
import { Direction as D } from '../../src/utils/constants';
import {
  lockFlag, getBoulderLocks, tileUnder, isPlatePressed, instantiateMap, pushBoulder,
  solve, canReach, canPressPlate, dropFlag, getBoulderDrops, holeAt, landedBoulders, canDropBoulders, isFlagGateOpen,
} from '../../src/logic/boulders';

// Build a map from an ASCII sketch: # wall, . floor, O boulder, S plate, G gate,
// ^ ledge (hop down only), o boulder hole, ~ water, = current. Gates and holes listed explicitly.
function sketch(rows: string[], gates: MapData['gates'] = [], id = 'test_cave', holes: MapData['holes'] = []): MapData {
  const H = rows.length, W = rows[0].length;
  const { tiles, collision, setTile } = createMapShape(W, H, T.CAVE_FLOOR);
  const ch: Record<string, T> = { '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, O: T.BOULDER, S: T.SWITCH_PLATE, G: T.GATE, '^': T.LEDGE, o: T.BOULDER_HOLE, '~': T.WATER, '=': T.CURRENT };
  rows.forEach((r, y) => [...r].forEach((c, x) => setTile(x, y, ch[c])));
  return { id, name: id, width: W, height: H, tiles, collision, warps: [], npcs: [], gates, holes };
}
const at = (m: MapData, x: number, y: number) => m.tiles[y][x];
const xy = (s: { path: { x: number; y: number }[] }) => s.path.map(p => `${p.x},${p.y}`);

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

describe('boulder holes', () => {
  // Upper floor: a boulder beside a hole; the hole drops onto the lower floor's current.
  const upper = sketch([
    '######',
    '#.Oo.#',
    '#.O..#',
    '######',
  ], [], 'upper', [{ x: 3, y: 1, targetMap: 'lower', targetX: 2, targetY: 1 }]);
  // Lower floor: a river of currents flowing east.
  const lower = sketch([
    '######',
    '#~==~#',
    '#.S..#',
    '######',
  ], [], 'lower');
  lower.currents = { '2,1': D.RIGHT, '3,1': D.RIGHT };
  const maps = { upper, lower };

  it('drop flags round-trip and ignore other maps', () => {
    const flags = { [dropFlag('upper', { x: 2, y: 1 }, { x: 3, y: 1 })]: true, [dropFlag('upper2', { x: 1, y: 1 }, { x: 2, y: 2 })]: true };
    expect(getBoulderDrops(flags, 'upper')).toEqual([{ origin: { x: 2, y: 1 }, hole: { x: 3, y: 1 } }]);
    expect(holeAt(upper, { x: 3, y: 1 })).toEqual({ x: 3, y: 1, targetMap: 'lower', targetX: 2, targetY: 1 });
    expect(holeAt(upper, { x: 2, y: 1 })).toBeUndefined();
  });

  it('pushing a boulder onto the hole removes it, sets the flag and reports the hole', () => {
    const flags: Record<string, boolean> = {};
    const inst = instantiateMap(upper, flags);
    const r = pushBoulder(upper, inst, flags, { x: 2, y: 1 }, { x: 1, y: 0 });
    expect(r.ok).toBe(true);
    expect(r.dropped).toEqual(upper.holes![0]);
    expect(r.changed).toEqual([{ x: 2, y: 1 }]);
    expect(at(inst.map, 2, 1)).toBe(T.CAVE_FLOOR);
    expect(at(inst.map, 3, 1)).toBe(T.BOULDER_HOLE);
    expect(inst.map.collision[1][3]).toBe(false);
    expect([...inst.origins.keys()]).toEqual(['2,2']);
    expect(flags).toEqual({ [dropFlag('upper', { x: 2, y: 1 }, { x: 3, y: 1 })]: true });
  });

  it('a dropped boulder is gone on the next visit; the others still reset', () => {
    const flags = { [dropFlag('upper', { x: 2, y: 1 }, { x: 3, y: 1 })]: true };
    const { map, origins } = instantiateMap(upper, flags);
    expect(at(map, 2, 1)).toBe(T.CAVE_FLOOR);
    expect(at(map, 2, 2)).toBe(T.BOULDER);
    expect([...origins.keys()]).toEqual(['2,2']);
  });

  it('a boulder moved first still drops under its origin name', () => {
    const flags: Record<string, boolean> = {};
    const inst = instantiateMap(upper, flags);
    expect(pushBoulder(upper, inst, flags, { x: 2, y: 2 }, { x: 1, y: 0 }).ok).toBe(true);   // (2,2) -> (3,2)
    expect(pushBoulder(upper, inst, flags, { x: 3, y: 2 }, { x: 0, y: -1 }).dropped).toBeDefined(); // (3,2) -> hole (3,1)
    expect(flags).toEqual({ [dropFlag('upper', { x: 2, y: 2 }, { x: 3, y: 1 })]: true });
    expect(instantiateMap(upper, flags).origins.has('2,1')).toBe(true);
  });

  it('stale drop flags (no such boulder or hole in the data) are ignored', () => {
    const flags = { [dropFlag('upper', { x: 1, y: 1 }, { x: 3, y: 1 })]: true, [dropFlag('upper', { x: 2, y: 1 }, { x: 4, y: 1 })]: true };
    expect([...instantiateMap(upper, flags).origins.keys()].sort()).toEqual(['2,1', '2,2']);
    expect(landedBoulders(maps, 'lower', flags)).toEqual([]);
  });

  it('landing on a current turns it into still water on the floor below', () => {
    const flags = { [dropFlag('upper', { x: 2, y: 1 }, { x: 3, y: 1 })]: true };
    expect(landedBoulders(maps, 'lower', flags)).toEqual([{ x: 2, y: 1 }]);
    expect(landedBoulders(maps, 'upper', flags)).toEqual([]);
    const { map } = instantiateMap(lower, flags, landedBoulders(maps, 'lower', flags));
    expect(at(map, 2, 1)).toBe(T.WATER);
    expect(map.collision[1][2]).toBe(true);
    expect(at(map, 3, 1)).toBe(T.CURRENT);
    expect(at(lower, 2, 1)).toBe(T.CURRENT);
    // The flow direction goes with the tile, so a slide stops there; the base data keeps both.
    expect(map.currents).toEqual({ '3,1': D.RIGHT });
    expect(lower.currents).toEqual({ '2,1': D.RIGHT, '3,1': D.RIGHT });
    expect(computeCurrentSlide(map, 2, 1, (x, y) => map.collision[y][x] && map.tiles[y][x] !== T.WATER && map.tiles[y][x] !== T.CURRENT)).toEqual({ path: [], end: 'stop' });
    expect(xy(computeCurrentSlide(map, 3, 1, (x, y) => map.tiles[y][x] === T.CAVE_WALL))).toEqual(['4,1']);
  });

  it('landing on a floor tile leaves a boulder there; on a plate it presses it', () => {
    const plateFloor = sketch(['#####', '#.SG#', '#####'], [{ x: 3, y: 1, switch: { x: 2, y: 1 } }], 'pf');
    const { map, origins } = instantiateMap(plateFloor, {}, [{ x: 2, y: 1 }, { x: 1, y: 1 }]);
    expect(at(map, 2, 1)).toBe(T.BOULDER);
    expect(at(map, 1, 1)).toBe(T.BOULDER);
    expect(at(map, 3, 1)).toBe(T.CAVE_FLOOR);
    expect(map.collision[1][2]).toBe(true);
    expect(origins.get('2,1')).toEqual({ x: 2, y: 1 });
    // Landing on a wall or still water changes nothing.
    const { map: m2 } = instantiateMap(plateFloor, {}, [{ x: 0, y: 0 }, { x: 9, y: 9 }]);
    expect(at(m2, 0, 0)).toBe(T.CAVE_WALL);
  });

  it('a hole without a holes[] entry still swallows the boulder, with no landing', () => {
    const bare = sketch(['#####', '#Oo.#', '#####'], [], 'bare');
    const flags: Record<string, boolean> = {};
    const inst = instantiateMap(bare, flags);
    const r = pushBoulder(bare, inst, flags, { x: 1, y: 1 }, { x: 1, y: 0 });
    expect(r.ok).toBe(true);
    expect(r.dropped).toBeUndefined();
    expect(at(inst.map, 2, 1)).toBe(T.BOULDER_HOLE);
    expect(Object.keys(flags)).toEqual([dropFlag('bare', { x: 1, y: 1 }, { x: 2, y: 1 })]);
  });

  it('solver: a boulder pushed into a hole leaves the state; canDropBoulders counts drops', () => {
    // Two boulders, one hole: the first goes straight in, the second right then up.
    const m = sketch([
      '#######',
      '#.O.o.#',
      '#.O...#',
      '#.....#',
      '#######',
    ], [], 'm');
    expect(canDropBoulders(m, { x: 1, y: 1 }, 1).found).toBe(true);
    expect(canDropBoulders(m, { x: 1, y: 1 }, 2).found).toBe(true);
    expect(canDropBoulders(m, { x: 1, y: 1 }, 3).found).toBe(false);
    // Walking onto the hole is allowed: it is floor.
    expect(canReach(m, { x: 1, y: 1 }, { x: 4, y: 1 }).found).toBe(true);
    // The state after a drop has one boulder fewer.
    const r = solve(m, { x: 1, y: 1 }, (_p, bs) => bs.length === 1);
    expect(r.found).toBe(true);
  });
});

describe('flag gates (statue switches)', () => {
  it('open when the flag is set, or when it is clear for closedWhenSet gates', () => {
    expect(isFlagGateOpen({ flag: 'm1' }, {})).toBe(false);
    expect(isFlagGateOpen({ flag: 'm1' }, { m1: true })).toBe(true);
    expect(isFlagGateOpen({ flag: 'm1', closedWhenSet: true }, {})).toBe(true);
    expect(isFlagGateOpen({ flag: 'm1', closedWhenSet: true }, { m1: true })).toBe(false);
    expect(isFlagGateOpen({}, { m1: true })).toBe(false);
  });
  it('instantiateMap opens flag gates from story flags and leaves them out of the boulder logic', () => {
    const m = sketch(['#######', '#..G.G#', '#######'], [{ x: 3, y: 1, flag: 'sw' }, { x: 5, y: 1, flag: 'sw', closedWhenSet: true }]);
    const off = instantiateMap(m, {});
    expect(at(off.map, 3, 1)).toBe(T.GATE);
    expect(off.map.collision[1][3]).toBe(true);
    expect(at(off.map, 5, 1)).toBe(T.CAVE_FLOOR);
    expect(off.map.collision[1][5]).toBe(false);
    const on = instantiateMap(m, { sw: true });
    expect(at(on.map, 3, 1)).toBe(T.CAVE_FLOOR);
    expect(at(on.map, 5, 1)).toBe(T.GATE);
    // A boulder push never touches flag gates.
    const withBoulder = sketch(['#######', '#.O.G.#', '#######'], [{ x: 4, y: 1, flag: 'sw' }]);
    const inst = instantiateMap(withBoulder, {});
    const r = pushBoulder(withBoulder, inst, {}, { x: 2, y: 1 }, { x: 1, y: 0 });
    expect(r.ok).toBe(true);
    expect(at(inst.map, 3, 1)).toBe(T.BOULDER);
    expect(at(inst.map, 4, 1)).toBe(T.GATE);
    expect(r.changed.some(c => c.x === 4 && c.y === 1)).toBe(false);
  });
  it('the solver honours flag gates through opts.storyFlags', () => {
    const m = sketch(['#######', '#..G..#', '#######'], [{ x: 3, y: 1, flag: 'sw' }]);
    expect(canReach(m, { x: 1, y: 1 }, { x: 5, y: 1 }).found).toBe(false);
    expect(canReach(m, { x: 1, y: 1 }, { x: 5, y: 1 }, { storyFlags: { sw: true } }).found).toBe(true);
    const inverted = sketch(['#######', '#..G..#', '#######'], [{ x: 3, y: 1, flag: 'sw', closedWhenSet: true }]);
    expect(canReach(inverted, { x: 1, y: 1 }, { x: 5, y: 1 }).found).toBe(true);
    expect(canReach(inverted, { x: 1, y: 1 }, { x: 5, y: 1 }, { storyFlags: { sw: true } }).found).toBe(false);
  });
});
