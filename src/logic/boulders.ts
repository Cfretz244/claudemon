// Strength boulders, switch plates and gates.
//
// Rule (Gen I): boulders go back to their starting tiles whenever the player
// leaves the map, EXCEPT a boulder resting on a switch plate, which stays put
// and keeps the plate pressed. A pressed plate opens every gate wired to it.
// Persisted state is one story flag per locked boulder:
//   boulder_lock_<mapId>_<originX>_<originY>_on_<plateX>_<plateY>
// Everything here is pure; OverworldScene owns the sprites and the sounds.

import { GateData, MapData, TileType } from '../types/map.types';

export interface Pos { x: number; y: number }
export interface BoulderLock { origin: Pos; plate: Pos }

const key = (p: Pos) => `${p.x},${p.y}`;
const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;

export function lockFlag(mapId: string, origin: Pos, plate: Pos): string {
  return `boulder_lock_${mapId}_${origin.x}_${origin.y}_on_${plate.x}_${plate.y}`;
}

export function getBoulderLocks(storyFlags: Record<string, boolean>, mapId: string): BoulderLock[] {
  const prefix = `boulder_lock_${mapId}_`;
  const locks: BoulderLock[] = [];
  for (const k of Object.keys(storyFlags)) {
    if (!k.startsWith(prefix) || !storyFlags[k]) continue;
    const m = /^(\d+)_(\d+)_on_(\d+)_(\d+)$/.exec(k.slice(prefix.length));
    if (!m) continue;
    locks.push({ origin: { x: +m[1], y: +m[2] }, plate: { x: +m[3], y: +m[4] } });
  }
  return locks;
}

export function floorTileOf(map: Pick<MapData, 'floorTile'>): TileType {
  return map.floorTile ?? TileType.CAVE_FLOOR;
}

/** The tile that shows once a boulder or gate at (x, y) in the base data is gone. */
export function tileUnder(base: MapData, x: number, y: number): TileType {
  const t = base.tiles[y]?.[x];
  return t === TileType.BOULDER || t === TileType.GATE ? floorTileOf(base) : t;
}

/** A plate is pressed while a boulder sits on it in the live map. */
export function isPlatePressed(base: MapData, live: MapData, plate: Pos): boolean {
  return base.tiles[plate.y]?.[plate.x] === TileType.SWITCH_PLATE && live.tiles[plate.y]?.[plate.x] === TileType.BOULDER;
}

/** A live copy of a map: cloned tiles/collision plus where each boulder came from. */
export interface MapInstance {
  map: MapData;
  /** current boulder tile ("x,y") -> its tile in the base data */
  origins: Map<string, Pos>;
}

function setTile(map: MapData, p: Pos, t: TileType, solid: boolean): void {
  map.tiles[p.y][p.x] = t;
  map.collision[p.y][p.x] = solid;
}

/** Build the live map for a fresh visit: boulders at their origins, except locked ones. */
export function instantiateMap(base: MapData, storyFlags: Record<string, boolean>): MapInstance {
  const map: MapData = { ...base, tiles: base.tiles.map(r => [...r]), collision: base.collision.map(r => [...r]) };
  const origins = new Map<string, Pos>();
  for (let y = 0; y < base.height; y++) {
    for (let x = 0; x < base.width; x++) {
      if (base.tiles[y][x] === TileType.BOULDER) origins.set(key({ x, y }), { x, y });
    }
  }
  for (const lock of getBoulderLocks(storyFlags, base.id)) {
    // Ignore flags that no longer match the map data (stale saves).
    if (base.tiles[lock.origin.y]?.[lock.origin.x] !== TileType.BOULDER) continue;
    if (base.tiles[lock.plate.y]?.[lock.plate.x] !== TileType.SWITCH_PLATE) continue;
    if (!origins.has(key(lock.origin)) || origins.has(key(lock.plate))) continue;
    origins.delete(key(lock.origin));
    setTile(map, lock.origin, tileUnder(base, lock.origin.x, lock.origin.y), false);
    origins.set(key(lock.plate), lock.origin);
    setTile(map, lock.plate, TileType.BOULDER, true);
  }
  for (const gate of base.gates ?? []) {
    if (isPlatePressed(base, map, gate.switch)) setTile(map, gate, tileUnder(base, gate.x, gate.y), false);
  }
  return { map, origins };
}

export interface PushResult {
  ok: boolean;
  /** tiles whose type changed (boulder from/to, gates opened/closed) */
  changed: Pos[];
}

/**
 * Push the boulder at `from` one tile in `dir`. Mutates the instance and the
 * story flags. The caller has already checked that `from` holds a boulder and
 * that the tile beyond is free of NPCs.
 */
export function pushBoulder(
  base: MapData, inst: MapInstance, storyFlags: Record<string, boolean>, from: Pos, dir: Pos,
): PushResult {
  const { map } = inst;
  const to = { x: from.x + dir.x, y: from.y + dir.y };
  if (map.tiles[from.y]?.[from.x] !== TileType.BOULDER) return { ok: false, changed: [] };
  if (to.x < 0 || to.y < 0 || to.x >= map.width || to.y >= map.height) return { ok: false, changed: [] };
  if (map.collision[to.y][to.x]) return { ok: false, changed: [] };

  const origin = inst.origins.get(key(from)) ?? from;
  inst.origins.delete(key(from));
  inst.origins.set(key(to), origin);
  setTile(map, from, tileUnder(base, from.x, from.y), false);
  setTile(map, to, TileType.BOULDER, true);
  if (base.tiles[from.y][from.x] === TileType.SWITCH_PLATE) delete storyFlags[lockFlag(base.id, origin, from)];
  if (base.tiles[to.y][to.x] === TileType.SWITCH_PLATE) storyFlags[lockFlag(base.id, origin, to)] = true;

  const changed: Pos[] = [from, to];
  for (const gate of base.gates ?? []) {
    const open = isPlatePressed(base, map, gate.switch);
    const cur = map.tiles[gate.y][gate.x];
    if (cur === TileType.BOULDER) continue; // a boulder sits in the doorway; leave it
    if (open && cur === TileType.GATE) { setTile(map, gate, tileUnder(base, gate.x, gate.y), false); changed.push({ x: gate.x, y: gate.y }); }
    if (!open && cur !== TileType.GATE) { setTile(map, gate, TileType.GATE, true); changed.push({ x: gate.x, y: gate.y }); }
  }
  return { ok: true, changed };
}

// ─── Solver (for tests): can the player get from A to B, pushing boulders? ───

export interface SolveOptions {
  /** extra blocked tiles, e.g. trainers standing in corridors */
  blocked?: Pos[];
  /** state-space cap; the search reports `exhausted` when hit */
  maxStates?: number;
}
export interface SolveResult { found: boolean; states: number; exhausted: boolean }

const DIRS: Pos[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

/**
 * Breadth-first search over (player, boulder positions) on the base map data.
 * Gates open exactly when a boulder sits on their plate; ledges are hop-down
 * only; the boulder beyond a push must be a free, non-ledge tile. Every
 * boulder starts at its base-data tile (a fresh visit).
 */
export function solve(
  base: MapData, start: Pos, isGoal: (player: Pos, boulders: Pos[]) => boolean, opts: SolveOptions = {},
): SolveResult {
  const maxStates = opts.maxStates ?? 200_000;
  const blocked = new Set((opts.blocked ?? []).map(key));
  const gates = base.gates ?? [];
  const tile = (p: Pos) => base.tiles[p.y]?.[p.x];
  const inBounds = (p: Pos) => p.x >= 0 && p.y >= 0 && p.x < base.width && p.y < base.height;
  const staticSolid = (p: Pos) => {
    const t = tile(p);
    return base.collision[p.y][p.x] && t !== TileType.BOULDER && t !== TileType.GATE;
  };
  const gateClosed = (p: Pos, boulders: Pos[]) => {
    if (tile(p) !== TileType.GATE) return false;
    return !gates.some(g => same(g, p) && boulders.some(b => same(b, g.switch)));
  };
  const free = (p: Pos, boulders: Pos[]) =>
    inBounds(p) && !staticSolid(p) && !blocked.has(key(p)) && !boulders.some(b => same(b, p)) && !gateClosed(p, boulders);

  const start0: Pos[] = [];
  for (let y = 0; y < base.height; y++) for (let x = 0; x < base.width; x++) if (base.tiles[y][x] === TileType.BOULDER) start0.push({ x, y });
  const stateKey = (p: Pos, bs: Pos[]) => key(p) + '|' + bs.map(key).sort().join(';');
  const seen = new Set<string>([stateKey(start, start0)]);
  const queue: Array<[Pos, Pos[]]> = [[start, start0]];
  let states = 0;
  while (queue.length) {
    const [p, bs] = queue.shift()!;
    states++;
    if (isGoal(p, bs)) return { found: true, states, exhausted: false };
    if (states >= maxStates) return { found: false, states, exhausted: true };
    for (const d of DIRS) {
      let n = { x: p.x + d.x, y: p.y + d.y };
      let nbs = bs;
      if (!inBounds(n)) continue;
      if (tile(n) === TileType.LEDGE) {
        if (d.y !== 1) continue;
        n = { x: n.x, y: n.y + 1 };
        if (!inBounds(n) || tile(n) === TileType.LEDGE || !free(n, bs)) continue;
      } else {
        const bi = bs.findIndex(b => same(b, n));
        if (bi >= 0) {
          const beyond = { x: n.x + d.x, y: n.y + d.y };
          if (!free(beyond, bs) || tile(beyond) === TileType.LEDGE) continue;
          nbs = bs.map((b, i) => (i === bi ? beyond : b));
        } else if (!free(n, bs)) {
          continue;
        }
      }
      const k = stateKey(n, nbs);
      if (!seen.has(k)) { seen.add(k); queue.push([n, nbs]); }
    }
  }
  return { found: false, states, exhausted: false };
}

export function canReach(base: MapData, start: Pos, goal: Pos, opts?: SolveOptions): SolveResult {
  return solve(base, start, p => same(p, goal), opts);
}

export function canPressPlate(base: MapData, start: Pos, plate: Pos, opts?: SolveOptions): SolveResult {
  return solve(base, start, (_p, bs) => bs.some(b => same(b, plate)), opts);
}
