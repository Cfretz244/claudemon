import { TileType } from '../types/map.types';

const T = TileType;

// Helper to create a filled 2D array
export function fill2D<V>(width: number, height: number, value: V): V[][] {
  return Array.from({ length: height }, () => Array(width).fill(value));
}

// Collision lookup: which tiles block movement
export const SOLID_TILES = new Set([
  T.WALL, T.WATER, T.TREE, T.BUILDING, T.FENCE, T.COUNTER, T.MART_SHELF, T.CAVE_WALL, T.PC,
  T.CUT_TREE, T.BOULDER, T.ROOF, T.FOUNTAIN, T.TOMBSTONE,
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
 *   extra entries (e.g. the museum exhibit tiles).
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
