// Strength boulders, switch plates and gates.
//
// Rule (Gen I): boulders go back to their starting tiles whenever the player
// leaves the map, EXCEPT a boulder resting on a switch plate, which stays put
// and keeps the plate pressed. A pressed plate opens every gate wired to it.
// A boulder pushed onto a BOULDER_HOLE drops to the floor below (`MapData.holes`)
// and never comes back: it turns a CURRENT tile there into still WATER, or sits
// as a boulder on a floor tile (pressing a switch plate if one is there). A
// boulder that landed on a floor tile resets to that tile on every visit and
// can be pushed into one of that floor's holes in turn (Seafoam: B2F -> B3F ->
// B4F), so its "origin" is its landing tile.
// Persisted state is one story flag per locked or dropped boulder:
//   boulder_lock_<mapId>_<originX>_<originY>_on_<plateX>_<plateY>
//   boulder_dropped_<mapId>_<originX>_<originY>_in_<holeX>_<holeY>
// Everything here is pure; OverworldScene owns the sprites and the sounds.

import { GateData, HoleData, MapData, TileType } from '../types/map.types';

export interface Pos { x: number; y: number }
export interface BoulderLock { origin: Pos; plate: Pos }
export interface BoulderDrop { origin: Pos; hole: Pos }

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

export function dropFlag(mapId: string, origin: Pos, hole: Pos): string {
  return `boulder_dropped_${mapId}_${origin.x}_${origin.y}_in_${hole.x}_${hole.y}`;
}

export function getBoulderDrops(storyFlags: Record<string, boolean>, mapId: string): BoulderDrop[] {
  const prefix = `boulder_dropped_${mapId}_`;
  const drops: BoulderDrop[] = [];
  for (const k of Object.keys(storyFlags)) {
    if (!k.startsWith(prefix) || !storyFlags[k]) continue;
    const m = /^(\d+)_(\d+)_in_(\d+)_(\d+)$/.exec(k.slice(prefix.length));
    if (!m) continue;
    drops.push({ origin: { x: +m[1], y: +m[2] }, hole: { x: +m[3], y: +m[4] } });
  }
  return drops;
}

/** The hole entry for a BOULDER_HOLE tile, if the map has one. */
export function holeAt(map: Pick<MapData, 'tiles' | 'holes'>, p: Pos): HoleData | undefined {
  if (map.tiles[p.y]?.[p.x] !== TileType.BOULDER_HOLE) return undefined;
  return map.holes?.find(h => h.x === p.x && h.y === p.y);
}

/** Every BOULDER tile in the base data. */
function baseBoulders(map: MapData): Pos[] {
  const out: Pos[] = [];
  map.tiles.forEach((row, y) => row.forEach((t, x) => { if (t === TileType.BOULDER) out.push({ x, y }); }));
  return out;
}

/** Drop flags of `map` that name one of `origins` and a hole the map data still has (stale saves are ignored). */
function validDrops(map: MapData, origins: Pos[], storyFlags: Record<string, boolean>): Array<BoulderDrop & { hole: HoleData }> {
  const out: Array<BoulderDrop & { hole: HoleData }> = [];
  for (const d of getBoulderDrops(storyFlags, map.id)) {
    if (!origins.some(o => same(o, d.origin))) continue;
    const hole = holeAt(map, d.hole);
    if (hole) out.push({ origin: d.origin, hole });
  }
  return out;
}

/**
 * Landing tiles on `mapId` of every boulder that ever dropped in from a floor
 * above, whether or not it has been pushed on since. A boulder from above can
 * only have dropped if it was on the floor above: in its base data, or landed
 * there from higher up still (hence the recursion; `visiting` guards against
 * hole data that loops).
 */
function arrivedBoulders(maps: Record<string, MapData>, mapId: string, storyFlags: Record<string, boolean>, visiting: Set<string>): Pos[] {
  if (visiting.has(mapId)) return [];
  visiting.add(mapId);
  const arrived: Pos[] = [];
  for (const src of Object.values(maps)) {
    if (!src.holes?.some(h => h.targetMap === mapId)) continue;
    const origins = [...baseBoulders(src), ...arrivedBoulders(maps, src.id, storyFlags, visiting)];
    for (const d of validDrops(src, origins, storyFlags)) {
      if (d.hole.targetMap !== mapId) continue;
      const p = { x: d.hole.targetX, y: d.hole.targetY };
      if (!arrived.some(l => same(l, p))) arrived.push(p);
    }
  }
  visiting.delete(mapId);
  return arrived;
}

/**
 * Landing tiles, in `targetMapId`, of every boulder dropped into it from any
 * map that is still there: one pushed into a hole of `targetMapId` itself has
 * moved on to the floor below.
 */
export function landedBoulders(maps: Record<string, MapData>, targetMapId: string, storyFlags: Record<string, boolean>): Pos[] {
  const target = maps[targetMapId];
  const arrived = arrivedBoulders(maps, targetMapId, storyFlags, new Set());
  if (!target) return arrived;
  return arrived.filter(p => validDrops(target, [p], storyFlags).length === 0);
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

/** A flag gate is open when its flag state matches its sense (set opens it unless `closedWhenSet`). */
export function isFlagGateOpen(gate: Pick<GateData, 'flag' | 'closedWhenSet'>, storyFlags: Record<string, boolean>): boolean {
  if (!gate.flag) return false;
  return !!storyFlags[gate.flag] !== !!gate.closedWhenSet;
}

/** Whether a gate is open: plate gates by the live boulder on their plate, flag gates by story flags. */
export function isGateOpen(base: MapData, live: MapData, gate: GateData, storyFlags: Record<string, boolean>): boolean {
  if (gate.switch) return isPlatePressed(base, live, gate.switch);
  return isFlagGateOpen(gate, storyFlags);
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

/**
 * Build the live map for a fresh visit: boulders at their origins, except
 * locked ones (restored onto their plate) and dropped ones (gone for good).
 * `landed` lists where boulders dropped from other maps land on this one
 * (see `landedBoulders`): a CURRENT there becomes still WATER, a floor tile
 * gets a boulder that resets to that spot on every visit.
 */
export function instantiateMap(base: MapData, storyFlags: Record<string, boolean>, landed: Pos[] = []): MapInstance {
  const map: MapData = { ...base, tiles: base.tiles.map(r => [...r]), collision: base.collision.map(r => [...r]) };
  const origins = new Map<string, Pos>();
  for (let y = 0; y < base.height; y++) {
    for (let x = 0; x < base.width; x++) {
      if (base.tiles[y][x] === TileType.BOULDER) origins.set(key({ x, y }), { x, y });
    }
  }
  for (const drop of validDrops(base, baseBoulders(base), storyFlags)) {
    if (!origins.has(key(drop.origin))) continue;
    origins.delete(key(drop.origin));
    setTile(map, drop.origin, tileUnder(base, drop.origin.x, drop.origin.y), false);
  }
  for (const p of landed) {
    const t = base.tiles[p.y]?.[p.x];
    if (t === undefined) continue;
    if (t === TileType.CURRENT) {
      // Still water now: the tile type and its flow direction both go.
      setTile(map, p, TileType.WATER, true);
      if (map.currents === base.currents) map.currents = { ...base.currents };
      delete map.currents?.[key(p)];
      continue;
    }
    if (t === TileType.WATER || map.collision[p.y][p.x]) continue;
    if (!origins.has(key(p))) origins.set(key(p), p);
    setTile(map, p, TileType.BOULDER, true);
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
    if (isGateOpen(base, map, gate, storyFlags)) setTile(map, gate, tileUnder(base, gate.x, gate.y), false);
  }
  return { map, origins };
}

export interface PushResult {
  ok: boolean;
  /** tiles whose type changed (boulder from/to, gates opened/closed) */
  changed: Pos[];
  /** set when the boulder fell through a hole (it is gone from this map) */
  dropped?: HoleData;
}

/**
 * Push the boulder at `from` one tile in `dir`. Mutates the instance and the
 * story flags. The caller has already checked that `from` holds a boulder and
 * that the tile beyond is free of NPCs. A boulder pushed onto a BOULDER_HOLE
 * drops out of the map and is remembered by a drop flag named after its
 * origin: its base-data tile, or its landing tile if it came from above.
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
  setTile(map, from, tileUnder(base, from.x, from.y), false);
  if (base.tiles[from.y][from.x] === TileType.SWITCH_PLATE) delete storyFlags[lockFlag(base.id, origin, from)];

  const changed: Pos[] = [from];
  const hole = holeAt(map, to);
  if (map.tiles[to.y][to.x] === TileType.BOULDER_HOLE) {
    storyFlags[dropFlag(base.id, origin, to)] = true;
  } else {
    inst.origins.set(key(to), origin);
    setTile(map, to, TileType.BOULDER, true);
    if (base.tiles[to.y][to.x] === TileType.SWITCH_PLATE) storyFlags[lockFlag(base.id, origin, to)] = true;
    changed.push(to);
  }
  for (const gate of base.gates ?? []) {
    if (!gate.switch) continue; // flag gates are toggled by statue switches, not boulders
    const open = isPlatePressed(base, map, gate.switch);
    const cur = map.tiles[gate.y][gate.x];
    if (cur === TileType.BOULDER) continue; // a boulder sits in the doorway; leave it
    if (open && cur === TileType.GATE) { setTile(map, gate, tileUnder(base, gate.x, gate.y), false); changed.push({ x: gate.x, y: gate.y }); }
    if (!open && cur !== TileType.GATE) { setTile(map, gate, TileType.GATE, true); changed.push({ x: gate.x, y: gate.y }); }
  }
  return hole ? { ok: true, changed, dropped: hole } : { ok: true, changed };
}

// ─── Solver (for tests): can the player get from A to B, pushing boulders? ───

export interface SolveOptions {
  /** extra blocked tiles, e.g. trainers standing in corridors */
  blocked?: Pos[];
  /** state-space cap; the search reports `exhausted` when hit */
  maxStates?: number;
  /** story flags in force during the search: flag gates open or close by them (none set by default) */
  storyFlags?: Record<string, boolean>;
}
export interface SolveResult { found: boolean; states: number; exhausted: boolean }

const DIRS: Pos[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

/**
 * Breadth-first search over (player, boulder positions) on the base map data.
 * Plate gates open exactly when a boulder sits on their plate and flag gates
 * follow `opts.storyFlags` (fixed for the whole search); ledges are hop-down
 * only; the boulder beyond a push must be a free, non-ledge tile; a boulder
 * pushed onto a BOULDER_HOLE leaves the map. Every boulder starts at its
 * base-data tile (a fresh visit; nothing has been dropped in from above).
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
  const storyFlags = opts.storyFlags ?? {};
  const gateClosed = (p: Pos, boulders: Pos[]) => {
    if (tile(p) !== TileType.GATE) return false;
    return !gates.some(g => {
      if (!same(g, p)) return false;
      const plate = g.switch;
      return plate ? boulders.some(b => same(b, plate)) : isFlagGateOpen(g, storyFlags);
    });
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
          nbs = tile(beyond) === TileType.BOULDER_HOLE ? bs.filter((_b, i) => i !== bi) : bs.map((b, i) => (i === bi ? beyond : b));
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

/** Can the player drop at least `count` boulders through holes? */
export function canDropBoulders(base: MapData, start: Pos, count: number, opts?: SolveOptions): SolveResult {
  const total = base.tiles.flat().filter(t => t === TileType.BOULDER).length;
  return solve(base, start, (_p, bs) => total - bs.length >= count, opts);
}
