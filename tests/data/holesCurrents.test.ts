// Boulder holes and currents must be wired consistently in every map. Vacuous
// until the first dungeon with holes lands (Seafoam, Phase 2), but the checks
// run over every map so a half-wired hole cannot ship.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { TileType } from '../../src/types/map.types';
import { Direction } from '../../src/utils/constants';

const DIRS = new Set(Object.values(Direction));

describe('boulder holes', () => {
  it('every BOULDER_HOLE tile has one holes[] entry and vice versa; the tile is walkable', () => {
    for (const map of Object.values(ALL_MAPS)) {
      const holeTiles: string[] = [];
      map.tiles.forEach((row, y) => row.forEach((t, x) => {
        if (t === TileType.BOULDER_HOLE) {
          holeTiles.push(`${x},${y}`);
          expect(map.collision[y][x], `${map.id}: hole ${x},${y} must be walkable`).toBe(false);
        }
      }));
      const wired = (map.holes ?? []).map(h => `${h.x},${h.y}`);
      expect(wired.sort(), `${map.id}: holes[] does not match the BOULDER_HOLE tiles`).toEqual(holeTiles.sort());
      expect(new Set(wired).size, `${map.id}: duplicate holes[] entries`).toBe(wired.length);
      if (holeTiles.length) {
        // Something must be able to fall in: a boulder of this floor, or one landed from a floor above.
        const fed = Object.values(ALL_MAPS).some(o => o.holes?.some(h => h.targetMap === map.id));
        expect(fed || map.tiles.flat().some(t => t === TileType.BOULDER), `${map.id}: holes but no boulder to drop`).toBe(true);
      }
    }
  });

  it('every hole lands on an existing map, on a current, still water or a walkable floor tile', () => {
    for (const map of Object.values(ALL_MAPS)) {
      for (const h of map.holes ?? []) {
        const target = ALL_MAPS[h.targetMap];
        expect(target, `${map.id}: hole ${h.x},${h.y} targets unknown map ${h.targetMap}`).toBeDefined();
        expect(target.id, `${map.id}: a hole cannot drop onto its own map`).not.toBe(map.id);
        const t = target.tiles[h.targetY]?.[h.targetX];
        expect(t, `${map.id}: hole ${h.x},${h.y} lands off the map`).toBeDefined();
        const ok = t === TileType.CURRENT || t === TileType.WATER || !target.collision[h.targetY][h.targetX];
        expect(ok, `${map.id}: hole ${h.x},${h.y} lands on a solid tile at ${h.targetMap} ${h.targetX},${h.targetY}`).toBe(true);
        expect(t, `${map.id}: hole lands on another boulder`).not.toBe(TileType.BOULDER);
      }
    }
  });
});

describe('currents', () => {
  it('every CURRENT tile has a direction and every currents[] key is a CURRENT tile', () => {
    for (const map of Object.values(ALL_MAPS)) {
      const currentTiles: string[] = [];
      map.tiles.forEach((row, y) => row.forEach((t, x) => {
        if (t === TileType.CURRENT) {
          currentTiles.push(`${x},${y}`);
          expect(map.collision[y][x], `${map.id}: current ${x},${y} must be solid like water`).toBe(true);
        }
      }));
      const keyed = Object.keys(map.currents ?? {});
      expect(keyed.sort(), `${map.id}: currents{} does not match the CURRENT tiles`).toEqual(currentTiles.sort());
      for (const [k, d] of Object.entries(map.currents ?? {})) {
        expect(DIRS.has(d), `${map.id}: current ${k} has direction ${d}`).toBe(true);
      }
    }
  });
});
