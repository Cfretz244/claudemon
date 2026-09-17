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
  TileType.GATE,
  // Town building kit
  TileType.WINDOW,
  TileType.ROOF_EDGE_L,
  TileType.ROOF_EDGE_R,
  TileType.ROOF_RIDGE,
  TileType.SIGNBOARD,
  TileType.CHIMNEY,
  TileType.ROCK,
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

// ── Where a warp puts the player ────────────────────────────────────────────
// Two landing bugs the Cerulean "dig house" had, pinned globally so they can't
// come back anywhere: a warp that drops the player onto a building's front
// door (nothing but wall around it — the old burgled house softlocked there)
// and a warp that drops the player on top of an NPC.
describe('warp landings', () => {
  const mapEntries = Object.entries(ALL_MAPS);
  const key = (from: string, w: { targetMap: string; targetX: number; targetY: number }) =>
    `${from} -> ${w.targetMap} (${w.targetX},${w.targetY})`;

  /**
   * A DOOR tile with BUILDING or ROOF next to it is a building's front door on
   * an outdoor map — the tile you walk INTO, never the tile you come out onto.
   * (Indoor DOOR tiles used as stairwells between floors have no facade around
   * them and are legitimate landings.)
   */
  const isFacadeDoor = (map: typeof ALL_MAPS[string], x: number, y: number) =>
    map.tiles[y]?.[x] === TileType.DOOR &&
    [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const t = map.tiles[y + dy]?.[x + dx];
      return t === TileType.BUILDING || t === TileType.ROOF;
    });

  // Offenders documented but not fixed. Empty since Oak's lab stopped dropping
  // the player on its own front door (it was the last entry); kept as a
  // tripwire — this list must never grow.
  const KNOWN_FACADE_DOOR_LANDINGS: string[] = [];
  const KNOWN_NPC_LANDINGS = [
    'bills_house -> route25 (22,8)',     // lands on the `route25_potion` item ball
  ];

  it('no warp lands the player on a building\'s front door', () => {
    const offenders: string[] = [];
    for (const [id, map] of mapEntries) {
      for (const warp of map.warps) {
        const target = ALL_MAPS[warp.targetMap];
        if (!target) continue;
        if (isFacadeDoor(target, warp.targetX, warp.targetY)) offenders.push(key(id, warp));
      }
    }
    expect([...new Set(offenders)].sort()).toEqual([...KNOWN_FACADE_DOOR_LANDINGS].sort());
  });

  it('no warp lands the player on top of an NPC', () => {
    const offenders: string[] = [];
    for (const [id, map] of mapEntries) {
      for (const warp of map.warps) {
        const target = ALL_MAPS[warp.targetMap];
        if (!target) continue;
        const npc = target.npcs?.find(n => n.x === warp.targetX && n.y === warp.targetY);
        if (npc) offenders.push(key(id, warp));
      }
    }
    expect([...new Set(offenders)].sort()).toEqual([...KNOWN_NPC_LANDINGS].sort());
  });

  // ── A door and its exit are each other's inverse, offset by one tile ──────
  // Every building works the same way: the door tile on the outdoor map is what
  // you walk INTO, and coming back out puts you on the tile directly BELOW it,
  // so one step UP re-enters. Pinned generically over every facade door so a
  // new building cannot ship with the lab's old off-by-one.
  const KNOWN_ASYMMETRIC_DOOR_PAIRS = [
    // Two facade doors into the same house (the front door at (20,6) and the
    // hole in the back wall at (20,4)), so "the door" is ambiguous and the
    // back-wall hole is legitimately entered from ABOVE. Out of scope.
    'cerulean_city -> burgled_house',
  ];

  it("an indoor map's exit warps land one tile below the door that leads in", () => {
    // outer map + inner map -> the facade door tiles leading from outer to inner
    const doors = new Map<string, Set<string>>();
    for (const [id, map] of mapEntries) {
      for (const w of map.warps) {
        if (!isFacadeDoor(map, w.x, w.y)) continue;
        const pair = `${id} -> ${w.targetMap}`;
        if (!doors.has(pair)) doors.set(pair, new Set());
        doors.get(pair)!.add(`${w.x},${w.y}`);
      }
    }
    const ambiguous: string[] = [];
    const offenders: string[] = [];
    let checked = 0;
    for (const [pair, tiles] of doors) {
      const [outer, inner] = pair.split(' -> ');
      if (tiles.size !== 1) { ambiguous.push(pair); continue; }
      const [dx, dy] = [...tiles][0].split(',').map(Number);
      const M = ALL_MAPS[inner];
      if (!M) continue;
      for (const w of M.warps) {
        if (w.targetMap !== outer) continue;
        checked++;
        if (w.targetX !== dx || w.targetY !== dy + 1) {
          offenders.push(
            `${inner} -> ${outer} (${w.targetX},${w.targetY}) should be (${dx},${dy + 1}), below the door at (${dx},${dy})`,
          );
        }
      }
    }
    expect(checked).toBeGreaterThan(50);   // the rule actually covers the game
    expect(ambiguous.sort()).toEqual([...KNOWN_ASYMMETRIC_DOOR_PAIRS].sort());
    expect([...new Set(offenders)].sort()).toEqual([]);
  });

  it("leaving Oak's lab lands below the door, and one step up goes back in", () => {
    const town = ALL_MAPS.pallet_town;
    const door = town.warps.find(w => w.targetMap === 'oaks_lab');
    expect(door, 'pallet_town has a warp into oaks_lab').toBeDefined();
    expect(town.tiles[door!.y][door!.x]).toBe(TileType.DOOR);

    const landing = { x: door!.x, y: door!.y + 1 };
    // Every one of the lab's exits comes out on the tile directly below the door
    const exits = ALL_MAPS.oaks_lab.warps.filter(w => w.targetMap === 'pallet_town');
    expect(exits.length).toBeGreaterThan(0);
    for (const w of exits) {
      expect({ x: w.targetX, y: w.targetY }, `oaks_lab warp at (${w.x},${w.y})`).toEqual(landing);
    }
    // ...which is standable, and NOT the door facade the player used to land on.
    // It became a DOORMAT when Pallet was re-stamped with `stampBuilding`: the
    // kit writes a doorstep below every door (it was PATH before).
    expect(town.tiles[landing.y][landing.x]).toBe(TileType.DOORMAT);
    expect(town.collision[landing.y][landing.x]).toBe(false);
    expect(town.npcs?.some(n => n.x === landing.x && n.y === landing.y)).toBeFalsy();
    expect(town.warps.some(w => w.x === landing.x && w.y === landing.y)).toBe(false);
    // ...and stepping back UP from it hits the warp into the lab: inverses.
    const up = town.warps.find(w => w.x === landing.x && w.y === landing.y - 1);
    expect(up?.targetMap).toBe('oaks_lab');
  });

  it('nothing warps into the Cerulean area onto a door or an NPC', () => {
    const cerulean = new Set(
      Object.keys(ALL_MAPS).filter(id => /^(cerulean|burgled_house|bike_shop|bills_house|pokemart_cerulean|pokemon_center_cerulean)/.test(id)),
    );
    for (const [id, map] of mapEntries) {
      for (const warp of map.warps) {
        if (!cerulean.has(warp.targetMap)) continue;
        const target = ALL_MAPS[warp.targetMap];
        expect(
          target.tiles[warp.targetY][warp.targetX],
          `${key(id, warp)} lands on a DOOR tile`,
        ).not.toBe(TileType.DOOR);
        expect(
          target.npcs?.find(n => n.x === warp.targetX && n.y === warp.targetY)?.id,
          `${key(id, warp)} lands on an NPC`,
        ).toBeUndefined();
      }
    }
  });
});
