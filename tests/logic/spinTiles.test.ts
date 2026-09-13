import { describe, it, expect } from 'vitest';
import { computeSlide, computeCurrentSlide, MAX_SLIDE_STEPS } from '../../src/logic/spinTiles';
import { ALL_MAPS } from '../../src/data/maps';
import { TileType as T, WarpPoint } from '../../src/types/map.types';
import { Direction as D } from '../../src/utils/constants';
import { createMapShape } from '../../src/data/mapBuilder';

// # wall, . floor, x stop, < > ^ v arrows
function sketch(rows: string[]) {
  const H = rows.length, W = rows[0].length;
  const { tiles, collision, setTile } = createMapShape(W, H, T.INDOOR_FLOOR);
  const spinTiles: Record<string, D> = {};
  const arrows: Record<string, D> = { '<': D.LEFT, '>': D.RIGHT, '^': D.UP, v: D.DOWN };
  rows.forEach((r, y) => [...r].forEach((c, x) => {
    if (c === '#') setTile(x, y, T.WALL);
    else if (c === 'x') setTile(x, y, T.STOP_TILE);
    else if (arrows[c]) { setTile(x, y, T.SPIN_TILE); spinTiles[`${x},${y}`] = arrows[c]; }
  }));
  const blocked = (x: number, y: number) => collision[y][x];
  return { map: { width: W, height: H, tiles, warps: [] as WarpPoint[], spinTiles }, blocked };
}
const xy = (s: { path: { x: number; y: number }[] }) => s.path.map(p => `${p.x},${p.y}`);

describe('computeSlide', () => {
  it('follows the arrow until a wall', () => {
    const { map, blocked } = sketch(['#######', '#..<..#', '#######']);
    const s = computeSlide(map, 3, 1, blocked);
    expect(xy(s)).toEqual(['2,1', '1,1']);
    expect(s.end).toBe('blocked');
    expect(s.path.every(p => p.dir === D.LEFT)).toBe(true);
  });
  it('a stop tile ends the slide; a following arrow redirects', () => {
    const { map, blocked } = sketch([
      '########',
      '#>...v.#',
      '#....x.#',
      '########',
    ]);
    const s = computeSlide(map, 1, 1, blocked);
    expect(xy(s)).toEqual(['2,1', '3,1', '4,1', '5,1', '5,2']);
    expect(s.path.map(p => p.dir)).toEqual([D.RIGHT, D.RIGHT, D.RIGHT, D.RIGHT, D.DOWN]);
    expect(s.end).toBe('stop');
  });
  it('an arrow pointing straight into a wall gives an empty path', () => {
    const { map, blocked } = sketch(['#####', '#.v.#', '#####']);
    expect(computeSlide(map, 2, 1, blocked)).toEqual({ path: [], end: 'blocked' });
  });
  it('a warp tile ends the slide with end=warp', () => {
    const { map, blocked } = sketch(['######', '#.>..#', '######']);
    map.warps.push({ x: 4, y: 1, targetMap: 'elsewhere', targetX: 0, targetY: 0 });
    const s = computeSlide(map, 2, 1, blocked);
    expect(xy(s)).toEqual(['3,1', '4,1']);
    expect(s.end).toBe('warp');
  });
  it('NPCs count as blocked through the callback', () => {
    const { map, blocked } = sketch(['######', '#.>..#', '######']);
    const s = computeSlide(map, 2, 1, (x, y) => blocked(x, y) || (x === 4 && y === 1));
    expect(xy(s)).toEqual(['3,1']);
    expect(s.end).toBe('blocked');
  });
  it('a non-arrow start tile is a no-op', () => {
    const { map, blocked } = sketch(['#####', '#...#', '#####']);
    expect(computeSlide(map, 1, 1, blocked)).toEqual({ path: [], end: 'stop' });
  });
  it('arrows facing each other are cut off instead of sliding forever', () => {
    const { map, blocked } = sketch(['#####', '#>.<#', '#####']);
    const s = computeSlide(map, 1, 1, blocked);
    expect(s.end).toBe('loop');
    expect(s.path.length).toBe(MAX_SLIDE_STEPS);
  });
});

describe('Rocket Hideout arrows (real data)', () => {
  const floors = ['rocket_hideout_b2f', 'rocket_hideout_b3f'];
  it('every arrow ends on a walkable tile without looping', () => {
    for (const id of floors) {
      const map = ALL_MAPS[id];
      const npcAt = (x: number, y: number) => map.npcs.some(n => n.x === x && n.y === y);
      const blocked = (x: number, y: number) => map.collision[y][x] || npcAt(x, y);
      const keys = Object.keys(map.spinTiles!);
      expect(keys.length).toBeGreaterThanOrEqual(8);
      for (const key of keys) {
        const [ax, ay] = key.split(',').map(Number);
        expect(map.tiles[ay][ax], `${id} ${key} is drawn as an arrow`).toBe(T.SPIN_TILE);
        const s = computeSlide(map, ax, ay, blocked);
        expect(s.end, `${id} arrow ${key}`).not.toBe('loop');
        expect(s.path.length, `${id} arrow ${key} points straight into a wall`).toBeGreaterThan(0);
        const last = s.path[s.path.length - 1];
        expect(blocked(last.x, last.y), `${id} arrow ${key} ends inside a wall`).toBe(false);
      }
    }
  });
  it('B2F: the row-1 belt rides to the corner; the arrow under the stop at (13,7) rides onto the stairs', () => {
    const map = ALL_MAPS['rocket_hideout_b2f'];
    const blocked = (x: number, y: number) => map.collision[y][x];
    const belt = computeSlide(map, 4, 1, blocked);
    expect(belt.end).toBe('blocked');
    expect(belt.path[belt.path.length - 1]).toMatchObject({ x: 18, y: 1 });
    const stairs = computeSlide(map, 13, 8, blocked);
    expect(stairs.end).toBe('warp');
    expect(xy(stairs)).toEqual(['13,9', '13,10', '13,11', '13,12']);
    // walking back north from the stairs lands on the same arrow and rides straight back down
    expect(map.warps.some(w => w.x === 13 && w.y === 12 && w.targetMap === 'rocket_hideout_b3f')).toBe(true);
  });
});

// # land (cave wall), ~ still water, < > ^ v currents
function river(rows: string[], warps: WarpPoint[] = []) {
  const H = rows.length, W = rows[0].length;
  const { tiles, collision, setTile } = createMapShape(W, H, T.WATER);
  const currents: Record<string, D> = {};
  const arrows: Record<string, D> = { '<': D.LEFT, '>': D.RIGHT, '^': D.UP, v: D.DOWN };
  rows.forEach((r, y) => [...r].forEach((c, x) => {
    if (c === '#') setTile(x, y, T.CAVE_WALL);
    else if (arrows[c]) { setTile(x, y, T.CURRENT); currents[`${x},${y}`] = arrows[c]; }
  }));
  // A surfing player is blocked by anything that is not water.
  const blocked = (x: number, y: number) => tiles[y][x] !== T.WATER && tiles[y][x] !== T.CURRENT;
  return { map: { width: W, height: H, tiles, collision, warps, currents }, blocked };
}

describe('computeCurrentSlide', () => {
  it('carries the player along the current and stops on the first still water', () => {
    const { map, blocked } = river(['#######', '#>>>~~#', '#######']);
    const s = computeCurrentSlide(map, 1, 1, blocked);
    expect(xy(s)).toEqual(['2,1', '3,1', '4,1']);
    expect(s.end).toBe('stop');
    expect(s.path.every(p => p.dir === D.RIGHT)).toBe(true);
  });
  it('a current pointing into land leaves the player where they are', () => {
    const { map, blocked } = river(['#####', '#~~>#', '#####']);
    const s = computeCurrentSlide(map, 3, 1, blocked);
    expect(s.path).toEqual([]);
    expect(s.end).toBe('blocked');
  });
  it('currents redirect each other; a warp on the water ends the slide', () => {
    const { map, blocked } = river([
      '######',
      '#>>v~#',
      '#~~v~#',
      '#~~~~#',
      '######',
    ], [{ x: 3, y: 3, targetMap: 'x', targetX: 0, targetY: 0 }]);
    const s = computeCurrentSlide(map, 1, 1, blocked);
    expect(xy(s)).toEqual(['2,1', '3,1', '3,2', '3,3']);
    expect(s.path.map(p => p.dir)).toEqual([D.RIGHT, D.RIGHT, D.DOWN, D.DOWN]);
    expect(s.end).toBe('warp');
  });
  it('still water is not a current: no slide starts there', () => {
    const { map, blocked } = river(['#####', '#~~>#', '#####']);
    expect(computeCurrentSlide(map, 1, 1, blocked)).toEqual({ path: [], end: 'stop' });
  });
  it('the Seafoam puzzle: a boulder in the river (still water) breaks the sweep', () => {
    // Before: the current sweeps a surfer from (1,1) all the way back east to (5,1).
    const before = river(['#######', '#~>>>>#', '#######']);
    expect(xy(computeCurrentSlide(before.map, 2, 1, before.blocked))).toEqual(['3,1', '4,1', '5,1']);
    // After a boulder lands on (4,1) the tile is still water: the sweep stops there.
    const after = river(['#######', '#~>>~>#', '#######']);
    expect(xy(computeCurrentSlide(after.map, 2, 1, after.blocked))).toEqual(['3,1', '4,1']);
    expect(computeCurrentSlide(after.map, 2, 1, after.blocked).end).toBe('stop');
  });
  it('a current loop gives up after MAX_SLIDE_STEPS', () => {
    const { map, blocked } = river(['####', '#><#', '####']);
    const s = computeCurrentSlide(map, 1, 1, blocked);
    expect(s.end).toBe('loop');
    expect(s.path.length).toBe(MAX_SLIDE_STEPS);
  });
});
