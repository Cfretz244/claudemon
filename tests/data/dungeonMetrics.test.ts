import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { computeSlide } from '../../src/logic/spinTiles';

/**
 * Dungeon layout quality ratchet.
 *
 * For every dungeon floor this measures, from the real map data:
 *   - walkable share: non-solid tiles / all tiles. Open rooms score high;
 *     corridors score low.
 *   - path ratio: BFS shortest path from the floor's entry point to its goal,
 *     divided by the Manhattan distance. 1.0 means "walk straight through".
 *
 * The BASELINE table pins the numbers as they are today. Assertions are
 * one-directional: a floor may only get *less* open and *more* winding. A
 * rebuild PR raises the bar by editing its row, so the before/after shows
 * up in the diff. Viridian Forest is the reference for what "good" looks like.
 *
 * Goals are either a warp to another map (the exit / next floor) or an NPC id
 * (a boss or a legendary) for dead-end floors. Gates are measured open and
 * boulders in place: this is a layout metric, solvability is proven by
 * gates.test.ts and the per-dungeon walkthrough tests. On a spinner floor a
 * step onto an arrow is the whole slide (the player cannot stop midway), and
 * the path counts every tile slid over.
 */

interface FloorSpec {
  map: string;
  from: string;          // warp targetMap the player arrives from
  to: string;            // warp targetMap of the goal, or `npc:<id>`
  goal?: number;         // which of the warps to `to` is the goal (default: the nearest)
  walkablePct: number;   // baseline: today's value, rounded up
  pathRatio: number;     // baseline: today's value, rounded down
}

const BASELINE: FloorSpec[] = [
  // Reference: the one dungeon that already meets the bar.
  { map: 'viridian_forest',     from: 'route2',            to: 'pewter_city',              walkablePct: 31, pathRatio: 1.9 },
  { map: 'mt_moon',             from: 'route3',            to: 'mt_moon_b1f', goal: 0,     walkablePct: 19, pathRatio: 2.3 },
  { map: 'mt_moon_b1f',         from: 'mt_moon',           to: 'mt_moon_b2f', goal: 0,     walkablePct: 22, pathRatio: 1.8 },
  { map: 'mt_moon_b2f',         from: 'mt_moon_b1f',       to: 'npc:mt_moon_fossil_nerd',  walkablePct: 18, pathRatio: 5.6 },
  { map: 'digletts_cave',       from: 'route2',            to: 'route11',                  walkablePct: 49, pathRatio: 1.0 },
  { map: 'rock_tunnel',         from: 'route10',           to: 'rock_tunnel_b1f',          walkablePct: 35, pathRatio: 1.1 },
  { map: 'pokemon_tower_1f',    from: 'lavender_town',     to: 'pokemon_tower_2f',         walkablePct: 56, pathRatio: 1.0 },
  { map: 'pokemon_tower_2f',    from: 'pokemon_tower_1f',  to: 'pokemon_tower_3f',         walkablePct: 39, pathRatio: 4.4 },
  { map: 'pokemon_tower_3f',    from: 'pokemon_tower_2f',  to: 'pokemon_tower_4f',         walkablePct: 40, pathRatio: 6.0 },
  { map: 'pokemon_tower_4f',    from: 'pokemon_tower_3f',  to: 'pokemon_tower_5f',         walkablePct: 39, pathRatio: 11.0 },
  { map: 'pokemon_tower_5f',    from: 'pokemon_tower_4f',  to: 'pokemon_tower_6f',         walkablePct: 39, pathRatio: 6.5 },
  { map: 'pokemon_tower_6f',    from: 'pokemon_tower_5f',  to: 'pokemon_tower_7f',         walkablePct: 39, pathRatio: 9.5 },
  { map: 'pokemon_tower_7f',    from: 'pokemon_tower_6f',  to: 'npc:mr_fuji',              walkablePct: 40, pathRatio: 3.1 },
  { map: 'rocket_hideout_b1f',  from: 'game_corner',       to: 'rocket_hideout_b2f',       walkablePct: 40, pathRatio: 2.2 },
  { map: 'rocket_hideout_b2f',  from: 'rocket_hideout_b1f', to: 'rocket_hideout_b3f',      walkablePct: 39, pathRatio: 3.0 },
  { map: 'rocket_hideout_b3f',  from: 'rocket_hideout_b2f', to: 'rocket_hideout_b4f',      walkablePct: 28, pathRatio: 1.8 },
  { map: 'rocket_hideout_b4f',  from: 'rocket_hideout_b3f', to: 'npc:rocket_hideout_lift_key', walkablePct: 34, pathRatio: 3.6 },
  { map: 'silph_co_1f',         from: 'saffron_city',         to: 'silph_co_2f',     walkablePct: 39, pathRatio: 4.2 },
  { map: 'silph_co_2f',         from: 'silph_co_1f',         to: 'silph_co_3f',     walkablePct: 39, pathRatio: 4.7 },
  { map: 'silph_co_3f',         from: 'silph_co_2f',         to: 'silph_co_4f',     walkablePct: 39, pathRatio: 3.5 },
  { map: 'silph_co_4f',         from: 'silph_co_3f',         to: 'silph_co_5f',     walkablePct: 39, pathRatio: 3.0 },
  { map: 'silph_co_5f',         from: 'silph_co_4f',         to: 'silph_co_6f',     walkablePct: 39, pathRatio: 3.7 },
  { map: 'silph_co_6f',         from: 'silph_co_5f',         to: 'silph_co_7f',     walkablePct: 39, pathRatio: 5.3 },
  { map: 'silph_co_7f',         from: 'silph_co_6f',         to: 'silph_co_8f',     walkablePct: 38, pathRatio: 3.7 },
  { map: 'silph_co_8f',         from: 'silph_co_7f',         to: 'silph_co_9f',     walkablePct: 39, pathRatio: 3.5 },
  { map: 'silph_co_9f',         from: 'silph_co_8f',         to: 'silph_co_10f',     walkablePct: 39, pathRatio: 3.7 },
  { map: 'silph_co_10f',        from: 'silph_co_9f',         to: 'silph_co_11f',     walkablePct: 38, pathRatio: 3.4 },
  { map: 'silph_co_11f',        from: 'silph_co_10f',         to: 'npc:giovanni_silph',     walkablePct: 38, pathRatio: 3.6 },
  { map: 'seafoam_1f',          from: 'route20',           to: 'seafoam_b1f',              walkablePct: 17, pathRatio: 1.8 },
  { map: 'seafoam_b1f',         from: 'seafoam_1f',        to: 'seafoam_b2f',              walkablePct: 19, pathRatio: 2.5 },
  { map: 'seafoam_b2f',         from: 'seafoam_b1f',       to: 'seafoam_b3f',              walkablePct: 22, pathRatio: 3.0 },
  { map: 'seafoam_b3f',         from: 'seafoam_b2f',       to: 'seafoam_b4f',              walkablePct: 18, pathRatio: 2.4 },
  { map: 'seafoam_b4f',         from: 'seafoam_b3f',       to: 'npc:articuno_seafoam',     walkablePct: 6,  pathRatio: 1.8 },
  { map: 'pokemon_mansion',     from: 'cinnabar_island',   to: 'pokemon_mansion_2f',       walkablePct: 26, pathRatio: 2.5 },
  { map: 'pokemon_mansion_2f',  from: 'pokemon_mansion',   to: 'pokemon_mansion_3f',       walkablePct: 23, pathRatio: 3.5 },
  { map: 'pokemon_mansion_3f',  from: 'pokemon_mansion_2f', to: 'pokemon_mansion',         walkablePct: 21, pathRatio: 3.3 },
  { map: 'pokemon_mansion_b1f', from: 'pokemon_mansion',   to: 'npc:mansion_b1f_secret_key', walkablePct: 19, pathRatio: 3.0 },
  { map: 'power_plant',         from: 'route10',           to: 'npc:zapdos_power_plant',   walkablePct: 50, pathRatio: 1.0 },
  { map: 'victory_road',        from: 'route23',           to: 'victory_road_2f',          walkablePct: 36, pathRatio: 1.5 },
  { map: 'victory_road_2f',     from: 'victory_road',      to: 'victory_road_3f',          walkablePct: 24, pathRatio: 1.5 },
  { map: 'victory_road_3f',     from: 'victory_road_2f',   to: 'npc:vr_trainer10',         walkablePct: 19, pathRatio: 2.5 },
  { map: 'cerulean_cave_1f',    from: 'cerulean_city',     to: 'cerulean_cave_2f', goal: 0, walkablePct: 14, pathRatio: 2.8 },
  { map: 'cerulean_cave_2f',    from: 'cerulean_cave_1f',  to: 'cerulean_cave_1f', goal: 4, walkablePct: 20, pathRatio: 2.3 },
  { map: 'cerulean_cave_b1f',   from: 'cerulean_cave_1f',  to: 'npc:mewtwo',               walkablePct: 10, pathRatio: 2.0 },
];

function walkableShare(map: MapData): number {
  let walk = 0;
  for (const row of map.collision) for (const solid of row) if (!solid) walk++;
  return (100 * walk) / (map.width * map.height);
}

/** On a floor meant to be surfed (it has a surf table) water counts as path; currents are measured stilled. */
function surfable(map: MapData, x: number, y: number): boolean {
  const t = map.tiles[y][x];
  return !!map.surfEncounters && (t === TileType.WATER || t === TileType.CURRENT);
}

/** Shortest walk in tiles; a step onto an arrow tile continues to wherever the slide ends. */
function bfs(map: MapData, sx: number, sy: number): number[][] {
  const dist = Array.from({ length: map.height }, () => new Array<number>(map.width).fill(-1));
  const blocked = (x: number, y: number) => x < 0 || y < 0 || x >= map.width || y >= map.height ||
    (map.collision[y][x] && map.tiles[y][x] !== TileType.GATE && !surfable(map, x, y));
  const q: [number, number][] = [[sx, sy]];
  dist[sy][sx] = 0;
  while (q.length) {
    const [x, y] = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy, cost = 1;
      if (blocked(nx, ny)) continue;
      if (map.spinTiles?.[`${nx},${ny}`]) {
        const slide = computeSlide(map, nx, ny, blocked);
        if (slide.end === 'loop') continue;
        const last = slide.path[slide.path.length - 1];
        if (last) { nx = last.x; ny = last.y; cost += slide.path.length; }
      }
      if (dist[ny][nx] >= 0) continue;
      dist[ny][nx] = dist[y][x] + cost;
      q.push([nx, ny]);
    }
  }
  return dist;
}

/** Where the player stands for a goal: on the warp tile, or adjacent to the NPC. */
function goalTiles(map: MapData, to: string, goal?: number): [number, number][] {
  if (to.startsWith('npc:')) {
    const npc = map.npcs.find(n => n.id === to.slice(4));
    if (!npc) return [];
    return ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const)
      .map(([dx, dy]) => [npc.x + dx, npc.y + dy] as [number, number])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < map.width && y < map.height && (!map.collision[y][x] || surfable(map, x, y)));
  }
  const warps = map.warps.filter(w => w.targetMap === to);
  return (goal === undefined ? warps : warps.slice(goal, goal + 1)).map(w => [w.x, w.y]);
}

function pathRatio(map: MapData, from: string, to: string, goal?: number): number {
  const start = map.warps.find(w => w.targetMap === from);
  if (!start) throw new Error(`${map.id}: no warp from ${from}`);
  const goals = goalTiles(map, to, goal);
  if (goals.length === 0) throw new Error(`${map.id}: no goal ${to}`);
  const dist = bfs(map, start.x, start.y);
  let best = Infinity;
  for (const [gx, gy] of goals) {
    const d = dist[gy][gx];
    if (d < 0) continue;
    const manhattan = Math.max(1, Math.abs(gx - start.x) + Math.abs(gy - start.y));
    best = Math.min(best, d / manhattan);
  }
  if (best === Infinity) throw new Error(`${map.id}: goal ${to} unreachable from ${from}`);
  return best;
}

describe('dungeon layout ratchet', () => {
  for (const spec of BASELINE) {
    const map = ALL_MAPS[spec.map];
    describe(spec.map, () => {
      it('exists', () => { expect(map).toBeDefined(); });
      it(`is at most ${spec.walkablePct}% walkable`, () => {
        expect(walkableShare(map)).toBeLessThanOrEqual(spec.walkablePct);
      });
      it(`path ${spec.from} -> ${spec.to} is at least ${spec.pathRatio}x the straight line`, () => {
        expect(pathRatio(map, spec.from, spec.to, spec.goal)).toBeGreaterThanOrEqual(spec.pathRatio);
      });
    });
  }

  // Floors rebuilt under docs/dungeon-plan.md: they must meet the plan's bar
  // (at most 40% walkable, path at least 1.5x the straight line) and are
  // allowed to beat the reference. Every other floor is still worse than it.
  const REBUILT = new Set(['victory_road', 'victory_road_2f', 'victory_road_3f', 'seafoam_1f', 'seafoam_b1f', 'seafoam_b2f', 'seafoam_b3f', 'seafoam_b4f',
    'pokemon_mansion', 'pokemon_mansion_2f', 'pokemon_mansion_3f', 'pokemon_mansion_b1f',
    ...Array.from({ length: 11 }, (_, i) => `silph_co_${i + 1}f`),
    'rocket_hideout_b1f', 'rocket_hideout_b2f', 'rocket_hideout_b3f', 'rocket_hideout_b4f',
    ...Array.from({ length: 6 }, (_, i) => `pokemon_tower_${i + 2}f`),
    'cerulean_cave_1f', 'cerulean_cave_2f', 'cerulean_cave_b1f', 'mt_moon', 'mt_moon_b1f', 'mt_moon_b2f']);

  it('rebuilt floors meet the plan bar; the reference floor (Viridian Forest) is still better than every floor not yet rebuilt', () => {
    const forest = BASELINE.find(s => s.map === 'viridian_forest')!;
    for (const spec of BASELINE) {
      if (spec === forest) continue;
      if (REBUILT.has(spec.map)) {
        expect(spec.walkablePct, spec.map).toBeLessThanOrEqual(40);
        expect(spec.pathRatio, spec.map).toBeGreaterThanOrEqual(1.5);
      } else {
        expect(spec.walkablePct, spec.map).toBeGreaterThanOrEqual(forest.walkablePct);
      }
    }
  });
});
