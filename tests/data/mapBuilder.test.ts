import { describe, it, expect } from 'vitest';
import { createMapFromSketch } from '../../src/data/mapBuilder';
import { TileType as T } from '../../src/types/map.types';

const LEGEND = { '#': T.CAVE_WALL, '.': T.CAVE_FLOOR, O: T.BOULDER, S: T.SWITCH_PLATE, G: T.GATE, L: T.CAVE_ENTRANCE };

describe('createMapFromSketch', () => {
  it('turns rows into tiles and collision, with solidity from the tile type', () => {
    const m = createMapFromSketch(['#####', '#.OS#', '#G.L#', '#####'], LEGEND);
    expect(m.width).toBe(5);
    expect(m.height).toBe(4);
    expect(m.tiles[1]).toEqual([T.CAVE_WALL, T.CAVE_FLOOR, T.BOULDER, T.SWITCH_PLATE, T.CAVE_WALL]);
    expect(m.collision[1]).toEqual([true, false, true, false, true]);
    expect(m.collision[2]).toEqual([true, true, false, false, true]);
  });

  it('finds marker tiles by character', () => {
    const m = createMapFromSketch(['#####', '#.OS#', '#G.L#', '#####'], LEGEND);
    expect(m.findOne('O')).toEqual({ x: 2, y: 1 });
    expect(m.find('.')).toEqual([{ x: 1, y: 1 }, { x: 2, y: 2 }]);
    expect(m.find('?')).toEqual([]);
    expect(() => m.findOne('.')).toThrow(/2 '.' tiles/);
    expect(() => m.findOne('?')).toThrow(/0 '\?' tiles/);
  });

  it('rejects ragged rows and characters outside the legend', () => {
    expect(() => createMapFromSketch(['###', '##'], LEGEND)).toThrow(/row 1 is 2 wide/);
    expect(() => createMapFromSketch(['#?#'], LEGEND)).toThrow(/'\?' is not in the legend/);
    expect(() => createMapFromSketch([], LEGEND)).toThrow(/empty/);
  });

  it('setTile still works on the result for post-sketch touch-ups', () => {
    const m = createMapFromSketch(['###', '#.#', '###'], LEGEND);
    m.setTile(1, 1, T.BOULDER);
    expect(m.tiles[1][1]).toBe(T.BOULDER);
    expect(m.collision[1][1]).toBe(true);
  });
});
