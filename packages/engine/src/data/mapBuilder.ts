import { BuildingKind, TileType } from '../types/map.types';

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
//
// Every TileType has an entry here, so a new tile cannot ship without someone
// deciding whether you can walk through it (`tests/data/tileKit.test.ts`).
export const TILE_SOLIDITY: Record<TileType, boolean> = {
  [T.GRASS]: false,
  [T.PATH]: false,
  [T.WALL]: true,
  [T.WATER]: true,
  [T.TREE]: true,
  [T.TALL_GRASS]: false,
  [T.BUILDING]: true,
  [T.DOOR]: false,
  [T.SIGN]: true,
  [T.LEDGE]: false,
  [T.FENCE]: true,
  [T.FLOWER]: false,
  [T.INDOOR_FLOOR]: false,
  [T.COUNTER]: true,
  [T.PC]: true,
  [T.MART_SHELF]: true,
  [T.CARPET]: false,
  [T.SAND]: false,
  [T.CAVE_FLOOR]: false,
  [T.CAVE_WALL]: true,
  [T.CUT_TREE]: true,
  [T.BOULDER]: true,
  [T.SPIN_TILE]: false,
  [T.STOP_TILE]: false,
  [T.TELEPORT_PAD]: false,
  [T.ROOF]: true,
  [T.FOUNTAIN]: true,
  [T.COBBLESTONE]: false,
  [T.DOORMAT]: false,
  [T.CAVE_ENTRANCE]: false,
  [T.EXHIBIT_CASE]: false,
  [T.FOSSIL_DISPLAY]: false,
  [T.SHUTTLE_DISPLAY]: false,
  [T.MUSEUM_PLAQUE]: true,
  [T.TOMBSTONE]: false,
  [T.SWITCH_PLATE]: false,
  [T.GATE]: true,
  [T.BOULDER_HOLE]: false,
  [T.CURRENT]: true,
  [T.HEAL_TILE]: false,
  [T.WINDOW]: true,
  [T.ROOF_EDGE_L]: true,
  [T.ROOF_EDGE_R]: true,
  [T.ROOF_RIDGE]: true,
  [T.SIGNBOARD]: true,
  [T.CHIMNEY]: true,
  [T.PLANK]: false,
  [T.ROCK]: true,
  [T.GRAVEL]: false,
};

export const SOLID_TILES = new Set<TileType>(
  Object.keys(TILE_SOLIDITY)
    .map((k) => Number(k) as TileType)
    .filter((t) => TILE_SOLIDITY[t]),
);

export interface MapShape {
  tiles: TileType[][];
  collision: boolean[][];
  /** Filled in by `stampBuilding`; hand it to the MapData as `tileKinds`. */
  tileKinds: Record<string, BuildingKind>;
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
  const tileKinds: Record<string, BuildingKind> = {};

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

  return { tiles, collision, tileKinds, setTile, fillRect };
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

// ─── The town building kit ───────────────────────────────────────────────────
//
// A building is an object, not a hand-drawn tile grid: `stampBuilding` writes
// the whole footprint from a kind and a size, so every house in Kanto is put
// together the same way and a Pokemon Center never looks like a shed.
//
// Footprint, top to bottom (h rows tall, w tiles wide):
//   * `ridge` rows of ROOF_RIDGE, with ROOF_EDGE_L / ROOF_EDGE_R at the ends
//   * one ROOF row (the eave, which overhangs the wall below it)
//   * `h - ridge - 1` wall rows of BUILDING, WINDOW tiles in a pattern
//   * the DOOR on the bottom row, a SIGNBOARD beside it for public kinds
//   * a DOORMAT on the tile below the door (outside the footprint)
// A CHIMNEY optionally replaces one ridge tile.

/** Sizes a kind gets when `opts.w` / `opts.h` are not given (w x h, incl. roof). */
export const DEFAULT_BUILDING_SIZE: Record<BuildingKind, { w: number; h: number }> = {
  house: { w: 4, h: 4 },
  center: { w: 6, h: 4 },
  mart: { w: 5, h: 4 },
  gym: { w: 7, h: 5 },
  // Landmarks are all different (Lab, Museum, Tower, Silph...); this is only
  // the fallback, and every landmark caller is expected to pass w/h/ridge.
  landmark: { w: 6, h: 4 },
};

/** Glyph each public kind's signboard shows by default. */
export const DEFAULT_SIGN: Record<BuildingKind, SignGlyph> = {
  house: 'none',
  center: 'P',
  mart: 'MART',
  gym: 'GYM',
  landmark: 'none',
};

/** Which kind's art a signboard glyph belongs to (the board keeps its colours). */
export const SIGN_GLYPH_KIND: Record<Exclude<SignGlyph, 'none'>, BuildingKind> = {
  P: 'center',
  MART: 'mart',
  GYM: 'gym',
};

export type SignGlyph = 'P' | 'MART' | 'GYM' | 'none';

export interface StampOptions {
  /** Footprint width in tiles (default: `DEFAULT_BUILDING_SIZE[kind].w`). */
  w?: number;
  /** Footprint height in tiles, roof included (default: the kind's). */
  h?: number;
  /** Door column: `'center'` (default) or an x offset from the left edge. */
  door?: 'center' | number;
  /** Signboard glyph beside the door (default: the kind's; `'none'` = no board). */
  sign?: SignGlyph;
  /**
   * `'auto'` (default) puts a WINDOW at every other column of the TOP wall row
   * and none in the door row — unless the building has a single wall row, in
   * which case the windows go in the door row, symmetric about the door.
   * An explicit array lists x offsets on the top wall row instead.
   */
  windows?: 'auto' | number[];
  /** Replace one ridge tile with a CHIMNEY (default false). */
  chimney?: boolean;
  /** Write a DOORMAT below the door (default true). The caller guarantees the tile is in bounds. */
  mat?: boolean;
  /** Roof ridge rows (default 1; landmarks such as the Tower use 2-3). */
  ridge?: number;
}

export interface StampResult {
  /** The DOOR tile — where the building's warp goes. */
  door: { x: number; y: number };
  /** The DOORMAT below the door — where interiors warp the player back out. */
  mat: { x: number; y: number };
  /** The footprint (the mat is one row below `y + h - 1`). */
  bbox: { x: number; y: number; w: number; h: number };
  /** Every tile written, keyed `"x,y"` -> kind, for `MapData.tileKinds`. */
  kinds: Record<string, BuildingKind>;
}

/** What `stampBuilding` writes through: a `MapShape`, or any `{ setTile }`. */
export interface StampTarget {
  setTile(x: number, y: number, type: TileType): void;
  /** Filled in with the stamped tiles' kinds when present (MapShape has one). */
  tileKinds?: Record<string, BuildingKind>;
}

/**
 * Stamps one building's whole footprint at (x, y) — its top-left corner — and
 * returns the door, the mat and the bounding box so warps can be derived from
 * the stamp instead of from hand-counted coordinates.
 */
export function stampBuilding(
  target: StampTarget,
  kind: BuildingKind,
  x: number,
  y: number,
  opts: StampOptions = {},
): StampResult {
  const size = DEFAULT_BUILDING_SIZE[kind];
  const w = opts.w ?? size.w;
  const h = opts.h ?? size.h;
  const ridge = opts.ridge ?? 1;
  const wallRows = h - ridge - 1;
  if (w < 3) throw new Error(`stampBuilding: ${kind} is ${w} wide, minimum 3`);
  if (ridge < 1) throw new Error(`stampBuilding: ${kind} has ${ridge} ridge rows, minimum 1`);
  if (wallRows < 1) {
    throw new Error(`stampBuilding: ${kind} ${w}x${h} with ${ridge} ridge rows leaves no wall row`);
  }

  const kinds: Record<string, BuildingKind> = {};
  const put = (tx: number, ty: number, type: TileType, asKind: BuildingKind = kind) => {
    target.setTile(tx, ty, type);
    kinds[`${tx},${ty}`] = asKind;
    if (target.tileKinds) target.tileKinds[`${tx},${ty}`] = asKind;
  };

  // Roof: ridge row(s) with gable ends, then the eave row.
  for (let r = 0; r < ridge; r++) {
    for (let dx = 0; dx < w; dx++) {
      const type = dx === 0 ? T.ROOF_EDGE_L : dx === w - 1 ? T.ROOF_EDGE_R : T.ROOF_RIDGE;
      put(x + dx, y + r, type);
    }
  }
  for (let dx = 0; dx < w; dx++) put(x + dx, y + ridge, T.ROOF);
  if (opts.chimney) put(x + w - 2, y, T.CHIMNEY);

  // Walls.
  const topWallY = y + ridge + 1;
  const doorY = y + h - 1;
  for (let dy = 0; dy < wallRows; dy++) {
    for (let dx = 0; dx < w; dx++) put(x + dx, topWallY + dy, T.BUILDING);
  }

  const doorDx = opts.door === undefined || opts.door === 'center' ? Math.floor(w / 2) : opts.door;
  if (doorDx < 0 || doorDx > w - 1) {
    throw new Error(`stampBuilding: ${kind} door offset ${doorDx} is outside a ${w}-wide footprint`);
  }

  const glyph = opts.sign ?? DEFAULT_SIGN[kind];
  let signDx = -1;
  if (glyph !== 'none') {
    signDx = doorDx + 1 <= w - 2 ? doorDx + 1 : doorDx - 1;
    if (signDx < 1 || signDx > w - 2) {
      throw new Error(`stampBuilding: ${kind} has no wall tile beside the door for a ${glyph} board`);
    }
  }

  // Windows. The auto pattern walks outward from the door in both directions,
  // every other column: c-2, c+2, c-4, c+4... Nobody puts a window straight
  // above their own front door (or above the signboard), and the even offsets
  // are what keeps it off both: the door is at c and the board at c +/- 1.
  const windowDxs: number[] = [];
  if (opts.windows === undefined || opts.windows === 'auto') {
    for (let d = 2; doorDx - d >= 0 || doorDx + d <= w - 1; d += 2) {
      if (doorDx - d >= 0) windowDxs.push(doorDx - d);
      if (doorDx + d <= w - 1) windowDxs.push(doorDx + d);
    }
  } else {
    windowDxs.push(...opts.windows);
  }
  for (const dx of windowDxs) {
    if (dx < 0 || dx > w - 1) continue;
    if (dx === doorDx || dx === signDx) continue;   // never over the door or the board
    put(x + dx, topWallY, T.WINDOW);
  }

  // Door, signboard and mat go on last so nothing can overwrite them.
  put(x + doorDx, doorY, T.DOOR);
  if (signDx >= 0) put(x + signDx, doorY, T.SIGNBOARD, SIGN_GLYPH_KIND[glyph as Exclude<SignGlyph, 'none'>]);
  const mat = { x: x + doorDx, y: doorY + 1 };
  if (opts.mat ?? true) target.setTile(mat.x, mat.y, T.DOORMAT);

  return { door: { x: x + doorDx, y: doorY }, mat, bbox: { x, y, w, h }, kinds };
}
