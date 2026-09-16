import { TileType } from '../types/map.types';

const T = TileType;

// Helper to create a filled 2D array
export function fill2D<V>(width: number, height: number, value: V): V[][] {
  return Array.from({ length: height }, () => Array(width).fill(value));
}

// Collision lookup: which tiles block movement.
//
// SIGN and MUSEUM_PLAQUE are solid: both are read by facing them (see
// `OverworldScene.interact` -> `readSign`), so a walkable sign meant a
// keypress towards it stepped ONTO it instead of facing it — the Game Corner
// poster that opens the Rocket Hideout was unreadable that way.
// `tests/data/signsSolid.test.ts` proves no map loses reachable ground to it.
export const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
  T.CUT_TREE, T.BOULDER, T.ROOF, T.FOUNTAIN, T.GATE, T.CURRENT, T.SIGN, T.MUSEUM_PLAQUE,
]);

export interface MapShape {
  tiles: TileType[][];
  collision: boolean[][];
  setTile(x: number, y: number, type: TileType): void;
  fillRect(x: number, y: number, w: number, h: number, type: TileType): void;
}

/**
 * Creates the tile/collision arrays plus the setTile/fillRect helpers that
 * every map IIFE previously redefined locally.
 *
 * - `base` pre-fills every tile; collision starts all-false (or all-true with
 *   `startSolid`, for carve-out style maps like caves).
 * - `solid` overrides the tile-solidity set for files whose local copy had
 *   extra entries (e.g. TOMBSTONE in the central maps).
 */
export function createMapShape(
  W: number,
  H: number,
  base: TileType,
  opts: { startSolid?: boolean; solid?: Set<TileType> } = {},
): MapShape {
  const solid = opts.solid ?? SOLID_TILES;
  const tiles = fill2D(W, H, base);
  const collision = fill2D(W, H, opts.startSolid ?? false);

  function setTile(x: number, y: number, type: TileType) {
    if (x >= 0 && x < W && y >= 0 && y < H) {
      tiles[y][x] = type;
      collision[y][x] = solid.has(type);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, type: TileType) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setTile(x + dx, y + dy, type);
      }
    }
  }

  return { tiles, collision, setTile, fillRect };
}

export interface SketchShape extends MapShape {
  width: number;
  height: number;
  /** Every tile drawn with `ch`, row-major. */
  find(ch: string): Array<{ x: number; y: number }>;
  /** The one tile drawn with `ch`; throws if there are none or several. */
  findOne(ch: string): { x: number; y: number };
}

/**
 * Build a map from an ASCII sketch: one string per row, one character per
 * tile, `legend` mapping each character to its tile type. Every row must be
 * the same length and every character must be in the legend. Markers that are
 * not tiles (NPCs, warps, plates wired to gates) are placed by `find` /
 * `findOne` so the sketch stays the single source of truth for coordinates.
 */
export function createMapFromSketch(
  rows: string[],
  legend: Record<string, TileType>,
  opts: { solid?: Set<TileType> } = {},
): SketchShape {
  const H = rows.length;
  const W = rows[0]?.length ?? 0;
  if (H === 0 || W === 0) throw new Error('sketch is empty');
  const found = new Map<string, Array<{ x: number; y: number }>>();
  const shape = createMapShape(W, H, legend[rows[0][0]], opts);
  rows.forEach((row, y) => {
    if (row.length !== W) throw new Error(`sketch row ${y} is ${row.length} wide, expected ${W}`);
    [...row].forEach((ch, x) => {
      const t = legend[ch];
      if (t === undefined) throw new Error(`sketch row ${y} col ${x}: '${ch}' is not in the legend`);
      shape.setTile(x, y, t);
      const list = found.get(ch) ?? [];
      list.push({ x, y });
      found.set(ch, list);
    });
  });
  const find = (ch: string) => [...(found.get(ch) ?? [])];
  const findOne = (ch: string) => {
    const list = find(ch);
    if (list.length !== 1) throw new Error(`sketch has ${list.length} '${ch}' tiles, expected exactly one`);
    return list[0];
  };
  return { ...shape, width: W, height: H, find, findOne };
}
