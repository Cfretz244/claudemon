import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData } from '../../src/types/map.types';

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
 * (a boss or a legendary) for dead-end floors.
 */

interface FloorSpec {
  map: string;
  from: string;          // warp targetMap the player arrives from
  to: string;            // warp targetMap of the goal, or `npc:<id>`
  walkablePct: number;   // baseline: today's value, rounded up
  pathRatio: number;     // baseline: today's value, rounded down
}

const BASELINE: FloorSpec[] = [
  // Reference: the one dungeon that already meets the bar.
  { map: 'viridian_forest',     from: 'route2',            to: 'pewter_city',              walkablePct: 31, pathRatio: 1.9 },
  { map: 'mt_moon',             from: 'route3',            to: 'mt_moon_b1f',              walkablePct: 51, pathRatio: 1.0 },
  { map: 'mt_moon_b1f',         from: 'mt_moon',           to: 'mt_moon_b2f',              walkablePct: 47, pathRatio: 1.0 },
  { map: 'mt_moon_b2f',         from: 'mt_moon_b1f',       to: 'npc:mt_moon_fossil_nerd',  walkablePct: 43, pathRatio: 4.1 },
  { map: 'digletts_cave',       from: 'route2',            to: 'route11',                  walkablePct: 49, pathRatio: 1.0 },
  { map: 'rock_tunnel',         from: 'route10',           to: 'rock_tunnel_b1f',          walkablePct: 35, pathRatio: 1.1 },
  { map: 'pokemon_tower_1f',    from: 'lavender_town',     to: 'pokemon_tower_2f',         walkablePct: 68, pathRatio: 1.0 },
  { map: 'pokemon_tower_2f',    from: 'pokemon_tower_1f',  to: 'pokemon_tower_3f',         walkablePct: 61, pathRatio: 1.0 },
  { map: 'pokemon_tower_3f',    from: 'pokemon_tower_2f',  to: 'pokemon_tower_4f',         walkablePct: 56, pathRatio: 1.0 },
  { map: 'pokemon_tower_4f',    from: 'pokemon_tower_3f',  to: 'pokemon_tower_5f',         walkablePct: 62, pathRatio: 1.0 },
  { map: 'pokemon_tower_5f',    from: 'pokemon_tower_4f',  to: 'npc:mr_fuji',              walkablePct: 64, pathRatio: 1.0 },
  { map: 'rocket_hideout_b1f',  from: 'game_corner',       to: 'rocket_hideout_b2f',       walkablePct: 65, pathRatio: 1.0 },
  { map: 'rocket_hideout_b2f',  from: 'rocket_hideout_b1f', to: 'rocket_hideout_b3f',      walkablePct: 63, pathRatio: 1.0 },
  { map: 'rocket_hideout_b3f',  from: 'rocket_hideout_b2f', to: 'rocket_hideout_b4f',      walkablePct: 62, pathRatio: 1.0 },
  { map: 'rocket_hideout_b4f',  from: 'rocket_hideout_b3f', to: 'npc:giovanni_game_corner', walkablePct: 62, pathRatio: 1.0 },
  { map: 'silph_co_1f',         from: 'saffron_city',      to: 'silph_co_2f',              walkablePct: 69, pathRatio: 1.0 },
  { map: 'silph_co_7f',         from: 'silph_co_3f',       to: 'npc:giovanni_silph',       walkablePct: 67, pathRatio: 1.0 },
  { map: 'seafoam_b1f',         from: 'route20',           to: 'seafoam_b2f',              walkablePct: 51, pathRatio: 1.0 },
  { map: 'seafoam_b2f',         from: 'seafoam_b1f',       to: 'seafoam_b3f',              walkablePct: 50, pathRatio: 1.0 },
  { map: 'seafoam_b3f',         from: 'seafoam_b2f',       to: 'npc:articuno_seafoam',     walkablePct: 43, pathRatio: 1.2 },
  { map: 'pokemon_mansion',     from: 'cinnabar_island',   to: 'npc:mansion_npc',          walkablePct: 68, pathRatio: 1.0 },
  { map: 'power_plant',         from: 'route10',           to: 'npc:zapdos_power_plant',   walkablePct: 50, pathRatio: 1.0 },
  { map: 'victory_road',        from: 'route23',           to: 'indigo_plateau',           walkablePct: 48, pathRatio: 1.1 },
  { map: 'cerulean_cave',       from: 'cerulean_city',     to: 'npc:mewtwo',               walkablePct: 43, pathRatio: 1.7 },
];

function walkableShare(map: MapData): number {
  let walk = 0;
  for (const row of map.collision) for (const solid of row) if (!solid) walk++;
  return (100 * walk) / (map.width * map.height);
}

function bfs(map: MapData, sx: number, sy: number): number[][] {
  const dist = Array.from({ length: map.height }, () => new Array<number>(map.width).fill(-1));
  const q: [number, number][] = [[sx, sy]];
  dist[sy][sx] = 0;
  while (q.length) {
    const [x, y] = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue;
      if (map.collision[ny][nx] || dist[ny][nx] >= 0) continue;
      dist[ny][nx] = dist[y][x] + 1;
      q.push([nx, ny]);
    }
  }
  return dist;
}

/** Where the player stands for a goal: on the warp tile, or adjacent to the NPC. */
function goalTiles(map: MapData, to: string): [number, number][] {
  if (to.startsWith('npc:')) {
    const npc = map.npcs.find(n => n.id === to.slice(4));
    if (!npc) return [];
    return ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const)
      .map(([dx, dy]) => [npc.x + dx, npc.y + dy] as [number, number])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < map.width && y < map.height && !map.collision[y][x]);
  }
  return map.warps.filter(w => w.targetMap === to).map(w => [w.x, w.y]);
}

function pathRatio(map: MapData, from: string, to: string): number {
  const start = map.warps.find(w => w.targetMap === from);
  if (!start) throw new Error(`${map.id}: no warp from ${from}`);
  const goals = goalTiles(map, to);
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
        expect(pathRatio(map, spec.from, spec.to)).toBeGreaterThanOrEqual(spec.pathRatio);
      });
    });
  }

  it('the reference floor (Viridian Forest) is clearly better than every other floor', () => {
    const forest = BASELINE.find(s => s.map === 'viridian_forest')!;
    for (const spec of BASELINE) {
      if (spec === forest) continue;
      expect(spec.walkablePct, spec.map).toBeGreaterThanOrEqual(forest.walkablePct);
    }
  });
});
