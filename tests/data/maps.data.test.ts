import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { TileType } from '../../src/types/map.types';

const SOLID_TILES = new Set([
  TileType.WALL,
  TileType.WATER,
  TileType.TREE,
  TileType.BUILDING,
  TileType.FENCE,
  TileType.COUNTER,
  TileType.MART_SHELF,
  TileType.CAVE_WALL,
  TileType.PC,
  TileType.EXHIBIT_CASE,
  TileType.FOSSIL_DISPLAY,
  TileType.SHUTTLE_DISPLAY,
  TileType.TOMBSTONE,
]);

describe('ALL_MAPS', () => {
  const mapEntries = Object.entries(ALL_MAPS);

  it('has at least one map', () => {
    expect(mapEntries.length).toBeGreaterThan(0);
  });

  it('every map tiles array has height rows and width columns', () => {
    for (const [id, map] of mapEntries) {
      expect(
        map.tiles.length,
        `Map ${id}: tiles has ${map.tiles.length} rows, expected ${map.height}`,
      ).toBe(map.height);
      for (let y = 0; y < map.height; y++) {
        expect(
          map.tiles[y].length,
          `Map ${id}: tiles row ${y} has ${map.tiles[y].length} cols, expected ${map.width}`,
        ).toBe(map.width);
      }
    }
  });

  it('every map collision array matches dimensions', () => {
    for (const [id, map] of mapEntries) {
      expect(
        map.collision.length,
        `Map ${id}: collision has ${map.collision.length} rows, expected ${map.height}`,
      ).toBe(map.height);
      for (let y = 0; y < map.height; y++) {
        expect(
          map.collision[y].length,
          `Map ${id}: collision row ${y} has ${map.collision[y].length} cols, expected ${map.width}`,
        ).toBe(map.width);
      }
    }
  });

  it('every warp targetMap exists in ALL_MAPS', () => {
    for (const [id, map] of mapEntries) {
      for (const warp of map.warps) {
        // Special map ids like 'elite_four' may not be in ALL_MAPS
        if (warp.targetMap === 'elite_four') continue;
        expect(
          ALL_MAPS[warp.targetMap],
          `Map ${id}: warp targets unknown map '${warp.targetMap}'`,
        ).toBeDefined();
      }
    }
  });

  it('every warp target position is within bounds of the target map', () => {
    for (const [id, map] of mapEntries) {
      for (const warp of map.warps) {
        if (warp.targetMap === 'elite_four') continue;
        const target = ALL_MAPS[warp.targetMap];
        if (!target) continue;
        expect(
          warp.targetX,
          `Map ${id}: warp to ${warp.targetMap} targetX=${warp.targetX} out of bounds (width=${target.width})`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          warp.targetX,
          `Map ${id}: warp to ${warp.targetMap} targetX=${warp.targetX} out of bounds (width=${target.width})`,
        ).toBeLessThan(target.width);
        expect(
          warp.targetY,
          `Map ${id}: warp to ${warp.targetMap} targetY=${warp.targetY} out of bounds (height=${target.height})`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          warp.targetY,
          `Map ${id}: warp to ${warp.targetMap} targetY=${warp.targetY} out of bounds (height=${target.height})`,
        ).toBeLessThan(target.height);
      }
    }
  });

  it('warp target positions land on walkable tiles (not solid tiles)', () => {
    for (const [id, map] of mapEntries) {
      for (const warp of map.warps) {
        if (warp.targetMap === 'elite_four') continue;
        const target = ALL_MAPS[warp.targetMap];
        if (!target) continue;
        if (warp.targetX < 0 || warp.targetX >= target.width) continue;
        if (warp.targetY < 0 || warp.targetY >= target.height) continue;

        // Skip solid tiles that are valid warp targets by game design:
        // - WATER: Surf destinations
        // - TREE, FENCE, CAVE_WALL, WALL: border exit warps (walking into solid border triggers warp)
        const tileType = target.tiles[warp.targetY][warp.targetX];
        const borderSolidTypes = new Set([
          TileType.WATER, TileType.TREE, TileType.FENCE,
          TileType.CAVE_WALL, TileType.WALL,
        ]);
        if (borderSolidTypes.has(tileType)) continue;

        const collision = target.collision[warp.targetY][warp.targetX];
        expect(
          collision,
          `Map ${id}: warp to ${warp.targetMap} (${warp.targetX},${warp.targetY}) lands on solid tile (type=${tileType})`,
        ).toBe(false);
      }
    }
  });
});

describe('Elite Four gauntlet wiring', () => {
  const chain = [
    { from: 'indigo_plateau', to: 'elite_four_lorelei' },
    { from: 'elite_four_lorelei', to: 'elite_four_bruno' },
    { from: 'elite_four_bruno', to: 'elite_four_agatha' },
    { from: 'elite_four_agatha', to: 'elite_four_lance' },
    { from: 'elite_four_lance', to: 'elite_four_champion' },
  ];

  for (const { from, to } of chain) {
    it(`${from} has a warp into ${to}`, () => {
      const map = ALL_MAPS[from];
      expect(map, `map '${from}' missing`).toBeDefined();
      const warp = map.warps.find(w => w.targetMap === to);
      expect(warp, `${from} has no warp targeting ${to}`).toBeDefined();
    });
  }

  it('Elite Four rooms have no return warp to the previous chamber (strict gauntlet)', () => {
    const rooms = ['elite_four_lorelei', 'elite_four_bruno', 'elite_four_agatha', 'elite_four_lance'];
    const previous: Record<string, string> = {
      elite_four_lorelei: 'indigo_plateau',
      elite_four_bruno: 'elite_four_lorelei',
      elite_four_agatha: 'elite_four_bruno',
      elite_four_lance: 'elite_four_agatha',
    };
    for (const room of rooms) {
      const map = ALL_MAPS[room];
      const back = map.warps.find(w => w.targetMap === previous[room]);
      expect(back, `${room} unexpectedly has a warp back to ${previous[room]}`).toBeUndefined();
    }
  });

  it("Champion's chamber has no exit warps (only Hall of Fame leaves)", () => {
    const map = ALL_MAPS['elite_four_champion'];
    expect(map).toBeDefined();
    expect(map.warps.length).toBe(0);
  });

  it('Each Elite Four chamber has its trainer NPC and a matching guard NPC', () => {
    const pairs: Array<{ map: string; trainer: string; guard?: string }> = [
      { map: 'elite_four_lorelei', trainer: 'lorelei', guard: 'league_guard_lorelei' },
      { map: 'elite_four_bruno', trainer: 'bruno', guard: 'league_guard_bruno' },
      { map: 'elite_four_agatha', trainer: 'agatha', guard: 'league_guard_agatha' },
      { map: 'elite_four_lance', trainer: 'lance', guard: 'league_guard_lance' },
      { map: 'elite_four_champion', trainer: 'champion_rival' }, // no guard — no exit door
    ];
    for (const { map, trainer, guard } of pairs) {
      const m = ALL_MAPS[map];
      const t = m.npcs.find(n => n.id === trainer);
      expect(t, `${map} missing trainer NPC '${trainer}'`).toBeDefined();
      expect(t!.isTrainer).toBe(true);
      expect(t!.sightRange, `${trainer} needs a sight range to catch the player`).toBeGreaterThan(0);
      if (guard) {
        const g = m.npcs.find(n => n.id === guard);
        expect(g, `${map} missing guard NPC '${guard}'`).toBeDefined();
      }
    }
  });
});
