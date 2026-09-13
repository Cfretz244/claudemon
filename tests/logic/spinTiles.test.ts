import { describe, it, expect } from 'vitest';
import { computeSlide, MAX_SLIDE_STEPS } from '../../src/logic/spinTiles';
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
  const floors = ['rocket_hideout_b1f', 'rocket_hideout_b2f'];
  it('every arrow ends on a walkable tile without looping', () => {
    for (const id of floors) {
      const map = ALL_MAPS[id];
      const npcAt = (x: number, y: number) => map.npcs.some(n => n.x === x && n.y === y);
      const blocked = (x: number, y: number) => map.collision[y][x] || npcAt(x, y);
      const keys = Object.keys(map.spinTiles!);
      expect(keys.length).toBeGreaterThan(10);
      for (const key of keys) {
        const [ax, ay] = key.split(',').map(Number);
        const s = computeSlide(map, ax, ay, blocked);
        expect(s.end, `${id} arrow ${key}`).not.toBe('loop');
        const last = s.path[s.path.length - 1] ?? { x: ax, y: ay };
        expect(blocked(last.x, last.y), `${id} arrow ${key} ends inside a wall`).toBe(false);
      }
    }
  });
  it('B1F entrance arrow (12,3): west to the wall; (8,3): down onto the stop tile', () => {
    const map = ALL_MAPS['rocket_hideout_b1f'];
    const blocked = (x: number, y: number) => map.collision[y][x];
    expect(xy(computeSlide(map, 12, 3, blocked))).toEqual(['11,3']);
    expect(xy(computeSlide(map, 8, 3, blocked))).toEqual(['8,4', '8,5']);
  });
});
