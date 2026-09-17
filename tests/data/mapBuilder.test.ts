import { describe, it, expect } from 'vitest';
import {
  StampOptions, createMapFromSketch, createMapShape, stampBuilding,
} from '../../src/data/mapBuilder';
import { BuildingKind, TileType as T } from '../../src/types/map.types';

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

// ─── stampBuilding ───────────────────────────────────────────────────────────

/**
 * Renders a stamp onto a blank grid and prints it, one character per tile, so
 * the expected footprint reads like the map it draws.
 *   R ridge   [ ] roof ends   ^ eave   B wall   w window
 *   D door    s signboard     C chimney   m doormat   . untouched
 */
const GLYPH: Record<number, string> = {
  [T.ROOF_RIDGE]: 'R', [T.ROOF_EDGE_L]: '[', [T.ROOF_EDGE_R]: ']', [T.ROOF]: '^',
  [T.BUILDING]: 'B', [T.WINDOW]: 'w', [T.DOOR]: 'D', [T.SIGNBOARD]: 's',
  [T.CHIMNEY]: 'C', [T.DOORMAT]: 'm', [T.GRASS]: '.',
};

function stampOn(
  w: number, h: number,
  kind: BuildingKind, x: number, y: number, opts: StampOptions = {},
) {
  const shape = createMapShape(w, h, T.GRASS);
  const res = stampBuilding(shape, kind, x, y, opts);
  const rows = shape.tiles.map(row => row.map(t => GLYPH[t] ?? '?').join(''));
  return { ...res, rows, shape };
}

describe('stampBuilding', () => {
  it('draws the default house: ridge with gable ends, eave, windowed wall, door, mat', () => {
    const b = stampOn(6, 7, 'house', 1, 1);
    expect(b.rows).toEqual([
      '......',
      '.[RR].',
      '.^^^^.',
      '.wBBB.',
      '.BBDB.',
      '...m..',
      '......',
    ]);
    expect(b.door).toEqual({ x: 3, y: 4 });
    expect(b.mat).toEqual({ x: 3, y: 5 });
    expect(b.bbox).toEqual({ x: 1, y: 1, w: 4, h: 4 });
  });

  it('gives a Center a 6x4 footprint, a P board beside the door and two windows', () => {
    const b = stampOn(6, 5, 'center', 0, 0);
    expect(b.rows).toEqual([
      '[RRRR]',
      '^^^^^^',
      'BwBBBw',
      'BBBDsB',
      '...m..',
    ]);
    expect(b.door).toEqual({ x: 3, y: 3 });
  });

  it('gives a Mart a 5x4 footprint with a MART board', () => {
    const b = stampOn(5, 5, 'mart', 0, 0);
    expect(b.rows).toEqual([
      '[RRR]',
      '^^^^^',
      'wBBBw',
      'BBDsB',
      '..m..',
    ]);
  });

  it('gives a Gym a 7x5 footprint: an extra blank wall row under the windows', () => {
    const b = stampOn(7, 6, 'gym', 0, 0);
    expect(b.rows).toEqual([
      '[RRRRR]',
      '^^^^^^^',
      'BwBBBwB',
      'BBBBBBB',
      'BBBDsBB',
      '...m...',
    ]);
    expect(b.bbox).toEqual({ x: 0, y: 0, w: 7, h: 5 });
  });

  it('puts the windows in the door row, symmetric about the door, when there is only one wall row', () => {
    const b = stampOn(7, 4, 'house', 0, 0, { w: 7, h: 3 });
    expect(b.rows).toEqual([
      '[RRRRR]',
      '^^^^^^^',
      'BwBDBwB',
      '...m...',
    ]);
  });

  // Nobody builds a window straight above their own front door. The auto
  // pattern walks outward from the door column, every other column, so the
  // door column and the board beside it are never windowed.
  it('never windows the door column: 6 wide, centred door', () => {
    const b = stampOn(6, 5, 'house', 0, 0, { w: 6, h: 4 });
    expect(b.rows).toEqual([
      '[RRRR]',
      '^^^^^^',
      'BwBBBw',
      'BBBDBB',
      '...m..',
    ]);
  });

  it('never windows the door column: 7 wide, centred door', () => {
    const b = stampOn(7, 5, 'house', 0, 0, { w: 7, h: 4 });
    expect(b.rows).toEqual([
      '[RRRRR]',
      '^^^^^^^',
      'BwBBBwB',
      'BBBDBBB',
      '...m...',
    ]);
  });

  it('never windows the door column: 7 wide, door off to one side', () => {
    const b = stampOn(7, 5, 'house', 0, 0, { w: 7, h: 4, door: 1 });
    expect(b.rows).toEqual([
      '[RRRRR]',
      '^^^^^^^',
      'BBBwBwB',
      'BDBBBBB',
      '.m.....',
    ]);
  });

  it('never windows the signboard column either: 6 wide, off-centre door', () => {
    const b = stampOn(6, 5, 'center', 0, 0, { w: 6, h: 4, door: 1 });
    expect(b.rows).toEqual([
      '[RRRR]',
      '^^^^^^',
      'BBBwBw',
      'BDsBBB',
      '.m....',
    ]);
  });

  it('keeps the door and board columns clear at every width and door column', () => {
    for (const w of [3, 4, 5, 6, 7, 8, 9]) {
      for (let door = 1; door <= w - 2; door++) {
        for (const kind of ['house', 'center'] as const) {
          if (kind === 'center' && w < 4) continue;   // no wall tile left for the board
          const b = stampOn(w + 2, 6, kind, 0, 0, { w, h: 4, door });
          const doorX = b.door.x;
          const signX = b.rows[3].indexOf('s');
          for (let dx = 0; dx < w; dx++) {
            if (b.rows[2][dx] !== 'w') continue;
            expect(dx, `${kind} ${w} wide, door ${door}: window over the door`).not.toBe(doorX);
            expect(dx, `${kind} ${w} wide, door ${door}: window over the board`).not.toBe(signX);
          }
        }
      }
    }
  });

  it('stacks ridge rows for a landmark and takes an explicit window list', () => {
    const b = stampOn(8, 7, 'landmark', 0, 0, { w: 8, h: 6, ridge: 2, windows: [1, 6] });
    expect(b.rows).toEqual([
      '[RRRRRR]',
      '[RRRRRR]',
      '^^^^^^^^',
      'BwBBBBwB',
      'BBBBBBBB',
      'BBBBDBBB',
      '....m...',
    ]);
    expect(b.door).toEqual({ x: 4, y: 5 });
  });

  it('replaces a ridge tile with a chimney, and takes an explicit door column', () => {
    const b = stampOn(5, 5, 'house', 0, 0, { w: 5, h: 4, chimney: true, door: 1 });
    expect(b.rows).toEqual([
      '[RRC]',
      '^^^^^',
      'BBBwB',
      'BDBBB',
      '.m...',
    ]);
    expect(b.door).toEqual({ x: 1, y: 3 });
  });

  it('skips the mat when the caller asks (a door flush against the map edge)', () => {
    const b = stampOn(5, 4, 'house', 0, 0, { w: 5, h: 4, mat: false });
    expect(b.rows[3]).toBe('BBDBB');
    expect(b.shape.tiles[3][2]).toBe(T.DOOR);
    expect(b.mat).toEqual({ x: 2, y: 4 });   // reported even though it was not written
  });

  it('marks every stamped tile solid except the door, and leaves the mat walkable', () => {
    const b = stampOn(6, 5, 'center', 0, 0);
    expect(b.shape.collision[0]).toEqual([true, true, true, true, true, true]);
    expect(b.shape.collision[2]).toEqual([true, true, true, true, true, true]);  // windows are wall
    expect(b.shape.collision[3]).toEqual([true, true, true, false, true, true]); // the door
    expect(b.shape.collision[4][3]).toBe(false);                                 // the mat
  });

  it('records the kind of every tile it writes, on the shape and in the result', () => {
    const b = stampOn(6, 5, 'center', 0, 0);
    expect(b.kinds['0,0']).toBe('center');
    expect(b.kinds['3,3']).toBe('center');
    expect(b.shape.tileKinds).toEqual(b.kinds);
    // The mat is outside the footprint, so it belongs to no building.
    expect(b.kinds['3,4']).toBeUndefined();
    expect(Object.keys(b.kinds)).toHaveLength(6 * 4);
  });

  it('gives a signboard the art of the kind whose glyph it shows', () => {
    const b = stampOn(7, 5, 'house', 0, 0, { w: 7, h: 4, sign: 'GYM' });
    expect(b.rows[3]).toBe('BBBDsBB');
    expect(b.kinds['4,3']).toBe('gym');    // the GYM board, on a house
    expect(b.kinds['3,3']).toBe('house');
  });

  it('rejects footprints it cannot draw', () => {
    const shape = createMapShape(10, 10, T.GRASS);
    expect(() => stampBuilding(shape, 'house', 0, 0, { w: 2 })).toThrow(/2 wide/);
    expect(() => stampBuilding(shape, 'house', 0, 0, { h: 2 })).toThrow(/no wall row/);
    expect(() => stampBuilding(shape, 'house', 0, 0, { ridge: 0 })).toThrow(/ridge rows/);
    expect(() => stampBuilding(shape, 'house', 0, 0, { w: 5, door: 9 })).toThrow(/outside a 5-wide/);
    expect(() => stampBuilding(shape, 'house', 0, 0, { w: 3, door: 1, sign: 'P' })).toThrow(/no wall tile beside/);
  });

  it('works on a sketch shape, so a legend and the kit can build one map together', () => {
    const m = createMapFromSketch(
      ['.........', '.........', '.........', '.........', '....T....'],
      { '.': T.GRASS, T: T.TREE },
    );
    const b = stampBuilding(m, 'mart', 1, 0);
    expect(m.tiles[0].map(t => GLYPH[t] ?? (t === T.TREE ? 'T' : '?')).join('')).toBe('.[RRR]...');
    expect(m.tiles[3].map(t => GLYPH[t] ?? '?').join('')).toBe('.BBDsB...');
    expect(b.door).toEqual({ x: 3, y: 3 });
    expect(m.findOne('T')).toEqual({ x: 4, y: 4 });   // the legend still resolves
    expect(m.tileKinds['3,3']).toBe('mart');
  });
});
