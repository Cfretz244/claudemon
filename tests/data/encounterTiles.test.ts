// Every encounter table must be reachable: a map that declares wild or surf
// encounters needs at least one walkable tile (or water) that actually rolls
// them, and every `encounterTiles` override must name walkable tile types.
// Ambush item balls must point at a real species.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { SOLID_TILES } from '../../src/data/mapBuilder';
import { POKEMON_DATA } from '../../src/data/pokemon';
import { TileType } from '../../src/types/map.types';
import { encounterTilesOf, SURF_ENCOUNTER_TILES } from '../../src/logic/encounters';

// Maps whose land table is unreachable today (found by this test on
// 2026-09-13). Fix the map and remove the entry; do not add to this list.
// - route17 (Cycling Road) and route24 (Nugget Bridge): no tall grass at all.
// - route19, route20, route21: sea routes whose tables are Tentacool/
//   Tentacruel/Magikarp; they belong in `surfEncounters`.
const KNOWN_UNREACHABLE = new Set(['route17', 'route19', 'route20', 'route21', 'route24']);

describe('encounter tiles', () => {
  it('every map with wildEncounters has a walkable tile that rolls them', () => {
    for (const map of Object.values(ALL_MAPS)) {
      if (!map.wildEncounters || KNOWN_UNREACHABLE.has(map.id)) continue;
      const rolls = encounterTilesOf(map, false);
      let count = 0;
      map.tiles.forEach((row, y) => row.forEach((t, x) => {
        if (rolls.includes(t) && !map.collision[y][x]) count++;
      }));
      expect(count, `${map.id}: declares wildEncounters but no walkable tile in [${rolls.join(',')}] rolls them`).toBeGreaterThan(0);
    }
  });

  it('every map with surfEncounters has water to surf on', () => {
    for (const map of Object.values(ALL_MAPS)) {
      if (!map.surfEncounters) continue;
      const count = map.tiles.flat().filter(t => SURF_ENCOUNTER_TILES.includes(t)).length;
      expect(count, `${map.id}: declares surfEncounters but has no WATER/CURRENT`).toBeGreaterThan(0);
    }
  });

  it('the known-unreachable list only names maps that are still broken', () => {
    for (const id of KNOWN_UNREACHABLE) {
      const map = ALL_MAPS[id];
      expect(map?.wildEncounters, `${id}: not a map with wildEncounters; drop it from KNOWN_UNREACHABLE`).toBeDefined();
      const rolls = encounterTilesOf(map, false);
      const count = map.tiles.flat().filter(t => rolls.includes(t)).length;
      expect(count, `${id}: now has encounter tiles; drop it from KNOWN_UNREACHABLE`).toBe(0);
    }
  });

  it('encounterTiles overrides name only walkable, non-empty tile sets', () => {
    for (const map of Object.values(ALL_MAPS)) {
      if (!map.encounterTiles) continue;
      expect(map.encounterTiles.length, `${map.id}: empty encounterTiles`).toBeGreaterThan(0);
      for (const t of map.encounterTiles) {
        expect(TileType[t], `${map.id}: encounterTiles has unknown tile ${t}`).toBeDefined();
        expect(SOLID_TILES.has(t), `${map.id}: encounterTiles names solid tile ${TileType[t]}`).toBe(false);
        expect(SURF_ENCOUNTER_TILES.includes(t), `${map.id}: ${TileType[t]} is a surf tile; use surfEncounters`).toBe(false);
      }
    }
  });
});

describe('ambush item balls', () => {
  it('every ambush is on an item ball and names a real species at a legal level', () => {
    for (const map of Object.values(ALL_MAPS)) {
      for (const npc of map.npcs) {
        if (!npc.ambush) continue;
        expect(npc.isItemBall, `${map.id}/${npc.id}: ambush on a non-ball NPC`).toBe(true);
        expect(POKEMON_DATA[npc.ambush.speciesId], `${map.id}/${npc.id}: unknown species ${npc.ambush.speciesId}`).toBeDefined();
        expect(npc.ambush.level, `${map.id}/${npc.id}: level`).toBeGreaterThanOrEqual(1);
        expect(npc.ambush.level, `${map.id}/${npc.id}: level`).toBeLessThanOrEqual(100);
      }
    }
  });
});
