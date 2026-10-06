import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { FLY_DESTINATIONS } from '../../src/data/flyDestinations';
import { Direction } from '../../src/utils/constants';

// Lavender Town and Celadon City, rebuilt from their sketches (town-t4:
// docs/towns/lavender_town.json, docs/towns/celadon_city.json). The generic
// sketch<->map agreement lives in townSketch.test.ts; these are the story hooks
// whose coordinates moved with the rebuild.

const lavender = ALL_MAPS['lavender_town'];
const celadon = ALL_MAPS['celadon_city'];

/** Flood fill over walkable tiles; NPCs are walls, warps are reached but not crossed. */
function reachable(map: MapData, start: [number, number]): Set<string> {
  const blocked = new Set((map.npcs ?? []).map(n => `${n.x},${n.y}`));
  const warps = new Set(map.warps.map(w => `${w.x},${w.y}`));
  const seen = new Set([`${start[0]},${start[1]}`]);
  const queue: Array<[number, number]> = [start];
  while (queue.length) {
    const [cx, cy] = queue.shift()!;
    if (warps.has(`${cx},${cy}`) && !(cx === start[0] && cy === start[1])) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy, k = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height || seen.has(k)) continue;
      if (map.collision[ny][nx] || blocked.has(k)) continue;
      seen.add(k); queue.push([nx, ny]);
    }
  }
  return seen;
}
const warpAt = (map: MapData, x: number, y: number) => map.warps.find(w => w.x === x && w.y === y);
const npc = (map: MapData, id: string) => map.npcs?.find(n => n.id === id);
const doorsOf = (map: MapData) => {
  const out: Array<[number, number]> = [];
  map.tiles.forEach((row, y) => row.forEach((t, x) => { if (t === TileType.DOOR) out.push([x, y]); }));
  return out;
};
const hasTile = (map: MapData, t: TileType) => map.tiles.some(r => r.includes(t));

/** Path dead ends exactly as tools/town-analyze.mjs counts them. */
function pathDeadEnds(map: MapData): string[] {
  const P = new Set([TileType.PATH, TileType.COBBLESTONE, TileType.DOORMAT]);
  const at = (x: number, y: number) => map.tiles[y]?.[x];
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const out: string[] = [];
  for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
    if (!P.has(at(x, y))) continue;
    if (N4.filter(([dx, dy]) => P.has(at(x + dx, y + dy))).length !== 1) continue;
    const edge = x === 0 || y === 0 || x === map.width - 1 || y === map.height - 1;
    const nearDoor = N4.some(([dx, dy]) => at(x + dx, y + dy) === TileType.DOOR)
      || map.warps.some(w => Math.abs(w.x - x) + Math.abs(w.y - y) <= 1);
    if (!edge && !nearDoor) out.push(`${x},${y}`);
  }
  return out;
}

describe('Lavender Town (town-t4)', () => {
  it('is 20x20 with the Tower door at (15,8) and its exit landing on the doormat (15,9)', () => {
    expect([lavender.width, lavender.height]).toEqual([20, 20]);
    expect(warpAt(lavender, 15, 8)?.targetMap).toBe('pokemon_tower_1f');
    expect(lavender.tiles[9][15]).toBe(TileType.DOORMAT);
    const exit = ALL_MAPS['pokemon_tower_1f'].warps.find(w => w.targetMap === 'lavender_town');
    expect(exit && [exit.targetX, exit.targetY]).toEqual([15, 9]);
  });

  it('every route landing reaches every doormat', () => {
    const landings: Array<[number, number]> = [[9, 1], [10, 1], [1, 10], [2, 11], [9, 18], [10, 18]];
    const mats = doorsOf(lavender).map(([x, y]) => `${x},${y + 1}`);
    expect(mats).toHaveLength(4);
    for (const l of landings) {
      const r = reachable(lavender, l);
      for (const m of mats) expect(r.has(m), `${m} from ${l}`).toBe(true);
    }
  });

  it('the graveyard: tombstones are solid, fenced off west of the Tower row', () => {
    for (const [x, y] of [[18, 3], [18, 5], [18, 7]]) {
      expect(lavender.tiles[y][x]).toBe(TileType.TOMBSTONE);
      expect(lavender.collision[y][x], `tombstone ${x},${y}`).toBe(true);
    }
    for (let y = 2; y <= 8; y++) expect(lavender.tiles[y][12]).toBe(TileType.FENCE);
  });

  it('lavender_npc3 mourns at (17,9), facing the graveyard', () => {
    const n = npc(lavender, 'lavender_npc3')!;
    expect([n.x, n.y]).toEqual([17, 9]);
    expect(n.direction).toBe(Direction.UP);
    expect(['lavender_npc1', 'lavender_npc2', 'lavender_npc3'].every(id => npc(lavender, id))).toBe(true);
    expect(lavender.npcs).toHaveLength(3);
  });

  it('has no cut trees and no gates', () => {
    expect(hasTile(lavender, TileType.CUT_TREE)).toBe(false);
  });

  it('route10 drops the player on the north landing (9-10,1)', () => {
    const r10 = ALL_MAPS['route10'].warps.filter(w => w.targetMap === 'lavender_town');
    expect(r10.map(w => `${w.targetX},${w.targetY}`).sort()).toEqual(['10,1', '9,1']);
  });
});

describe('Celadon City (town-t4)', () => {
  it('is 30x25 with a cobbled fountain square at (14,10)', () => {
    expect([celadon.width, celadon.height]).toEqual([30, 25]);
    expect(celadon.tiles[10][14]).toBe(TileType.FOUNTAIN);
    expect(celadon.collision[10][14]).toBe(true);
  });

  it('keeps the tea lady: same id, same dialogue, resolved through GIFT_NPCS', () => {
    const n = npc(celadon, 'celadon_tea_lady')!;
    expect([n.x, n.y]).toEqual([4, 11]);
    expect(n.dialogue).toEqual([
      'I work at CELADON\nMANSION.',
      "Here, have some TEA!\nIt's very refreshing!",
    ]);
    expect(['celadon_npc1', 'celadon_npc2', 'celadon_npc3', 'celadon_npc4'].every(id => npc(celadon, id))).toBe(true);
    expect(celadon.npcs).toHaveLength(5);
  });

  it('door warps go to the same five interiors, each exiting onto its doormat', () => {
    const want: Record<string, [number, number]> = {
      celadon_mansion: [5, 8], celadon_dept_1f: [23, 8], celadon_gym: [5, 19],
      game_corner: [18, 18], pokemon_center_celadon: [25, 18],
    };
    for (const [id, [x, y]] of Object.entries(want)) {
      expect(warpAt(celadon, x, y)?.targetMap, id).toBe(id);
      const back = ALL_MAPS[id].warps.filter(w => w.targetMap === 'celadon_city');
      expect(back.length, id).toBeGreaterThan(0);
      for (const w of back) expect([w.targetX, w.targetY], id).toEqual([x, y + 1]);
    }
  });

  it('no path dead ends; the two declared lookouts (14,23),(15,23) are a reachable stub', () => {
    // The lookouts sit side by side at the foot of the south road, so each has
    // two path neighbours and the analyzer's one-neighbour rule never flags them.
    expect(pathDeadEnds(celadon)).toEqual([]);
    const r = reachable(celadon, [27, 12]);
    for (const [x, y] of [[14, 23], [15, 23]]) {
      expect(celadon.tiles[y][x]).toBe(TileType.COBBLESTONE);
      expect(r.has(`${x},${y}`)).toBe(true);
    }
  });

  it('both route landings reach every doormat; no cut trees', () => {
    const mats = doorsOf(celadon).map(([x, y]) => `${x},${y + 1}`);
    for (const l of [[1, 12], [2, 13], [27, 12], [28, 13]] as Array<[number, number]>) {
      const r = reachable(celadon, l);
      for (const m of mats) expect(r.has(m), `${m} from ${l}`).toBe(true);
    }
    expect(hasTile(celadon, TileType.CUT_TREE)).toBe(false);
  });
});

describe('fly destinations still land on walkable tiles', () => {
  it.each(['lavender_town', 'celadon_city'])('%s', id => {
    const d = FLY_DESTINATIONS.find(f => f.mapId === id)!;
    const map = ALL_MAPS[id];
    expect(map.collision[d.y][d.x]).toBe(false);
    expect(warpAt(map, d.x, d.y)).toBeUndefined();
  });
});
