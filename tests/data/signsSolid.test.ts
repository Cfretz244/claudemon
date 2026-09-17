// SIGN (and MUSEUM_PLAQUE, which `OverworldScene.interact` reads exactly the
// same way) are solid tiles: you face a sign to read it, you do not stand on
// it. See `SOLID_TILES` in src/data/mapBuilder.ts.
//
// Making a walkable tile solid can only ever take ground away, so this file is
// the proof that it takes away nothing but the sign tiles themselves:
//
//   1. every sign tile really is solid in the shipped collision data;
//   2. nothing the game puts the player ON is a sign (warp landings, Fly
//      landings, the new-game start, the default heal spot) and no warp tile
//      is a sign, so no entrance can drop the player inside a wall;
//   3. per map, the set of tiles reachable from its landings with signs solid
//      equals the set reachable with signs walkable MINUS the sign tiles —
//      i.e. no sign is a corridor, a doorway or a surfing chokepoint.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { FLY_DESTINATIONS } from '../../src/data/flyDestinations';
import { SaveSystem } from '../../src/systems/SaveSystem';

/** Tile types read by facing them (OverworldScene.interact -> readSign). */
const SIGN_TILES = new Set<TileType>([TileType.SIGN, TileType.MUSEUM_PLAQUE]);

interface Pos { x: number; y: number }
const key = (x: number, y: number) => `${x},${y}`;
const DIRS: Pos[] = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

const maps = Object.values(ALL_MAPS);
const newSave = SaveSystem.createNewSave();

const signTilesOf = (map: MapData): Pos[] => {
  const out: Pos[] = [];
  map.tiles.forEach((row, y) => row.forEach((t, x) => { if (SIGN_TILES.has(t)) out.push({ x, y }); }));
  return out;
};
const isSign = (map: MapData, x: number, y: number) => SIGN_TILES.has(map.tiles[y]?.[x] as TileType);
const name = (map: MapData, p: Pos) => `${map.id} (${p.x},${p.y}) ${TileType[map.tiles[p.y][p.x]]}`;

/**
 * Every tile the game can drop the player onto in `map`: the target of every
 * warp anywhere that points here, plus this map's Fly landing, plus the
 * new-game start and the default heal spot when they name this map.
 */
function landings(map: MapData): Pos[] {
  const out: Pos[] = [];
  const add = (x: number, y: number) => {
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return;
    if (!out.some(p => p.x === x && p.y === y)) out.push({ x, y });
  };
  for (const m of maps) for (const w of m.warps) if (w.targetMap === map.id) add(w.targetX, w.targetY);
  for (const f of FLY_DESTINATIONS) if (f.mapId === map.id) add(f.x, f.y);
  if (newSave.currentMap === map.id) add(newSave.playerX, newSave.playerY);
  if (newSave.lastHealMap === map.id) add(newSave.lastHealX, newSave.lastHealY);
  return out;
}

/**
 * 4-neighbour flood fill over a map's real collision data, deliberately
 * conservative about connectivity so it can never invent a detour around a
 * sign that the player does not have:
 * - every NPC is an obstacle (item balls and beaten trainers keep their tile);
 * - LEDGE is a one-way hop downwards onto the tile below (OverworldScene:556);
 * - a warp tile that is not the start, and a spin tile, is entered but never
 *   walked through (stepping on one leaves the tile / slides the player);
 * - `surf` makes WATER and CURRENT walkable, for the second pass.
 * `signsSolid` overrides the collision bit at sign tiles only, so the two
 * passes differ in exactly one thing.
 */
function reachable(map: MapData, starts: Pos[], signsSolid: boolean, surf: boolean): Set<string> {
  const npcs = new Set(map.npcs.map(n => key(n.x, n.y)));
  const warps = new Set(map.warps.map(w => key(w.x, w.y)));
  const startKeys = new Set(starts.map(p => key(p.x, p.y)));
  const inBounds = (x: number, y: number) => x >= 0 && x < map.width && y >= 0 && y < map.height;
  const blocked = (x: number, y: number) => {
    if (!inBounds(x, y)) return true;
    if (npcs.has(key(x, y))) return true;
    const t = map.tiles[y][x];
    if (SIGN_TILES.has(t)) return signsSolid;
    if (surf && (t === TileType.WATER || t === TileType.CURRENT)) return false;
    return map.collision[y][x];
  };

  const seen = new Set<string>();
  const queue: Pos[] = [];
  for (const s of starts) {
    if (!inBounds(s.x, s.y) || seen.has(key(s.x, s.y))) continue;
    seen.add(key(s.x, s.y));
    queue.push(s);
  }
  while (queue.length) {
    const p = queue.shift()!;
    const k = key(p.x, p.y);
    if (!startKeys.has(k) && (warps.has(k) || map.tiles[p.y][p.x] === TileType.SPIN_TILE)) continue;
    for (const d of DIRS) {
      let n = { x: p.x + d.x, y: p.y + d.y };
      if (!inBounds(n.x, n.y)) continue;
      if (map.tiles[n.y][n.x] === TileType.LEDGE) {
        if (d.y !== 1) continue;                       // ledges are hopped southwards only
        n = { x: n.x, y: n.y + 1 };
        if (!inBounds(n.x, n.y)) continue;
        if (map.tiles[n.y][n.x] === TileType.LEDGE) continue;  // no chaining
        if (blocked(n.x, n.y)) continue;
      } else if (blocked(n.x, n.y)) continue;
      const nk = key(n.x, n.y);
      if (!seen.has(nk)) { seen.add(nk); queue.push(n); }
    }
  }
  return seen;
}

describe('signs are solid', () => {
  it('SIGN and MUSEUM_PLAQUE are in SOLID_TILES, so every sign tile ships solid', () => {
    const walkable: string[] = [];
    for (const map of maps) {
      for (const s of signTilesOf(map)) if (!map.collision[s.y][s.x]) walkable.push(name(map, s));
    }
    expect(walkable).toEqual([]);
  });

  it('the maps do have signs to check (guard against an empty sweep)', () => {
    expect(maps.reduce((n, m) => n + signTilesOf(m).length, 0)).toBeGreaterThan(20);
  });

  it('no warp lands the player on a sign', () => {
    const offenders: string[] = [];
    for (const from of maps) {
      for (const w of from.warps) {
        const target = ALL_MAPS[w.targetMap];
        if (!target) continue;
        if (isSign(target, w.targetX, w.targetY)) offenders.push(`${from.id} -> ${name(target, { x: w.targetX, y: w.targetY })}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no Fly destination, new-game start or default heal spot is a sign', () => {
    const offenders: string[] = [];
    for (const f of FLY_DESTINATIONS) {
      const m = ALL_MAPS[f.mapId];
      if (m && isSign(m, f.x, f.y)) offenders.push(`FLY ${f.name} -> ${name(m, f)}`);
    }
    const start = ALL_MAPS[newSave.currentMap];
    if (start && isSign(start, newSave.playerX, newSave.playerY)) offenders.push(`new-game start -> ${name(start, { x: newSave.playerX, y: newSave.playerY })}`);
    const heal = ALL_MAPS[newSave.lastHealMap];
    if (heal && isSign(heal, newSave.lastHealX, newSave.lastHealY)) offenders.push(`default heal spot -> ${name(heal, { x: newSave.lastHealX, y: newSave.lastHealY })}`);
    expect(offenders).toEqual([]);
  });

  it('no warp tile is itself a sign', () => {
    const offenders: string[] = [];
    for (const map of maps) {
      for (const w of map.warps) if (isSign(map, w.x, w.y)) offenders.push(name(map, w));
    }
    expect(offenders).toEqual([]);
  });

  it('no NPC stands on a sign, except the sign NPCs that carry a sign\'s own text', () => {
    // An NPC blocks its tile whatever the tile underneath is (npcBlocksTile),
    // and interaction hits the NPC before readSign, so these overlaps neither
    // change movement nor hide anything — the NPC *is* the sign's text. They
    // are listed rather than ignored so a new, accidental overlap still fails.
    // Empty since town-t3: `vermilion_fan_club_sign` was the only one, and the
    // rebuilt Vermilion stands it on the lawn at (27,10) rather than on a SIGN.
    const KNOWN_SIGN_NPCS: string[] = [];
    const offenders: string[] = [];
    for (const map of maps) {
      for (const n of map.npcs) if (isSign(map, n.x, n.y)) offenders.push(`${map.id}/${n.id} (${n.x},${n.y})`);
    }
    expect(offenders.sort()).toEqual([...KNOWN_SIGN_NPCS].sort());
  });

  for (const surf of [false, true]) {
    it(`solid signs remove only their own tile from what is reachable (${surf ? 'surfing' : 'on foot'})`, () => {
      const failures: string[] = [];
      for (const map of maps) {
        const signs = signTilesOf(map);
        if (!signs.length) continue;
        const signKeys = new Set(signs.map(s => key(s.x, s.y)));
        const starts = landings(map);
        if (!starts.length) continue;   // unreachable map: nothing to lose
        const open = reachable(map, starts, false, surf);
        const solid = reachable(map, starts, true, surf);
        const expected = [...open].filter(k => !signKeys.has(k));
        const lost = expected.filter(k => !solid.has(k));
        if (lost.length) {
          failures.push(`${map.id}: signs [${[...signKeys].join(' ')}] cut off ${lost.length} tile(s): ${lost.slice(0, 20).join(' ')}`);
        }
      }
      expect(failures).toEqual([]);
    });
  }
});
