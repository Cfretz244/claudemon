import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, NPCData, TileType } from '../../src/types/map.types';
import { computeTrainerSight } from '../../src/logic/trainerSight';

// The Cerulean "dig house" rebuilt to the Gen I layout: the house sits in the
// NE corner with its front door on the south face and the burglar's hole in
// the back wall, the policeman stands INSIDE in front of the hole, the Rocket
// waits in the sealed back garden, and the town's south road to Route 5 is a
// road again instead of a house you have to walk through.

const city = ALL_MAPS['cerulean_city'];
const house = ALL_MAPS['burgled_house'];
const centre = ALL_MAPS['pokemon_center_cerulean'];

const GARDEN: Array<[number, number]> = [];
for (let x = 18; x <= 22; x++) for (let y = 2; y <= 3; y++) GARDEN.push([x, y]);

/**
 * Flood fill from `start` treating every NPC in `solidNpcs` as a wall. Warp
 * tiles are reachable but are not walked through (stepping on one leaves the
 * map), which is what makes "the garden is sealed" a meaningful question.
 */
function reachable(map: MapData, start: [number, number], solidNpcs: NPCData[] = map.npcs ?? []): Set<string> {
  const blocked = new Set(solidNpcs.map(n => `${n.x},${n.y}`));
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
const can = (set: Set<string>, x: number, y: number) => set.has(`${x},${y}`);
const warpAt = (map: MapData, x: number, y: number) => map.warps.find(w => w.x === x && w.y === y);
const npc = (map: MapData, id: string) => map.npcs?.find(n => n.id === id);

describe('Cerulean burgled house — exterior', () => {
  it('the house is in the NE corner with a roof row above its facade', () => {
    for (let x = 18; x <= 22; x++) {
      expect(city.tiles[4][x], `(${x},4) should be roof or the back door`).toBe(x === 20 ? TileType.DOOR : TileType.ROOF);
      for (const y of [5, 6]) {
        expect(city.tiles[y][x], `(${x},${y}) should be building or the front door`)
          .toBe(x === 20 && y === 6 ? TileType.DOOR : TileType.BUILDING);
      }
    }
  });

  it('the old south-centre house and its facade are gone', () => {
    for (let x = 14; x <= 17; x++) {
      expect(city.tiles[20][x], `(${x},20) should be open grass now`).toBe(TileType.GRASS);
      expect(city.tiles[21][x], `(${x},21) should be open grass now`).toBe(TileType.GRASS);
      expect(city.tiles[22][x], `(${x},22) should be plain fence now`).toBe(TileType.FENCE);
    }
    expect(city.warps.filter(w => w.targetMap === 'burgled_house').map(w => `${w.x},${w.y}`).sort())
      .toEqual(['20,4', '20,6']);
  });

  it('the fence at y22 opens for the road so Route 5 is reachable from the start', () => {
    for (let x = 2; x <= 22; x++) {
      const expected = x >= 10 && x <= 13 ? TileType.PATH : TileType.FENCE;
      expect(city.tiles[22][x], `(${x},22)`).toBe(expected);
    }
  });

  it('the Pokemon Center moved down onto the path row; its exit lands below the door', () => {
    expect(city.tiles[11][18]).toBe(TileType.DOOR);
    expect(city.tiles[8][18]).toBe(TileType.ROOF);
    expect(warpAt(city, 18, 11)?.targetMap).toBe('pokemon_center_cerulean');
    expect(city.tiles[12][18], 'the tile below the door is the path').toBe(TileType.PATH);
    for (const w of centre.warps) {
      expect(w.targetMap).toBe('cerulean_city');
      expect([w.targetX, w.targetY]).toEqual([18, 12]);
    }
    expect(city.tiles[11][15], 'the Center sign moved with it').toBe(TileType.SIGN);
    // The rows the Center used to sit in (y5-8, x16-20) are free again: the
    // only solid tiles left there belong to the new house at x18-22.
    for (const y of [5, 6, 7]) for (const x of [16, 17]) {
      expect(city.tiles[y][x], `(${x},${y}) should be open grass now`).toBe(TileType.GRASS);
    }
    expect(city.tiles[5][18], 'the new house starts at x18').toBe(TileType.BUILDING);
  });

  it('the Fly landing, the Cut trees and the other Cerulean NPCs are untouched', () => {
    expect(city.collision[11][14], 'Fly lands on (14,11)').toBe(false);
    expect(city.tiles[12][22]).toBe(TileType.CUT_TREE);
    expect(city.tiles[13][22]).toBe(TileType.CUT_TREE);
    expect(city.tiles[2][14]).toBe(TileType.ROOF);       // Bulbasaur house
    expect(city.tiles[4][15]).toBe(TileType.DOOR);
    for (const id of ['cerulean_npc1', 'cerulean_npc2', 'cerulean_npc3']) expect(npc(city, id)).toBeDefined();
  });
});

describe('Cerulean burgled house — the back garden', () => {
  it('is grass, sealed by the trees, the fence and the house roof', () => {
    for (const [x, y] of GARDEN) expect(city.collision[y][x], `(${x},${y}) is walkable garden`).toBe(false);
    expect(city.tiles[2][17]).toBe(TileType.FENCE);
    expect(city.tiles[3][17]).toBe(TileType.FENCE);
    expect(city.tiles[2][23]).toBe(TileType.TREE);
    expect(city.tiles[3][23]).toBe(TileType.TREE);
    for (let x = 18; x <= 22; x++) expect(city.tiles[1][x], `(${x},1) tree border`).toBe(TileType.TREE);
  });

  it('is unreachable from town — the house is the only way in', () => {
    // Route 4 lands the player on (2,12); every NPC counts as solid.
    const town = reachable(city, [2, 12]);
    for (const [x, y] of GARDEN) expect(can(town, x, y), `(${x},${y}) must not be reachable from town`).toBe(false);
    expect(can(town, 20, 4), 'nor the back door itself').toBe(false);
  });

  it('from the hole landing (20,3) the whole garden and the back door are reachable', () => {
    const garden = reachable(city, [20, 3]);
    for (const [x, y] of GARDEN) expect(can(garden, x, y) || (x === 22 && y === 3), `(${x},${y})`).toBe(true);
    expect(can(garden, 20, 4), 'the back door (20,4)').toBe(true);
    expect(can(garden, 11, 12), 'and no leak back into town').toBe(false);
  });

  it('the town road, the Route 5 warps and the front door approach are reachable with no flags', () => {
    const town = reachable(city, [2, 12]);
    expect(can(town, 11, 24), 'Route 5 warp (11,24)').toBe(true);
    expect(can(town, 12, 24), 'Route 5 warp (12,24)').toBe(true);
    expect(can(town, 20, 7), 'the front-door approach (20,7)').toBe(true);
    expect(can(town, 20, 6), 'the front door itself').toBe(true);
  });
});

describe('Cerulean burgled house — the Rocket', () => {
  const rocket = npc(city, 'cerulean_rocket')!;

  it('waits in the garden facing the one tile beside the landing', () => {
    expect([rocket.x, rocket.y]).toEqual([22, 3]);
    expect(rocket.isTrainer).toBe(true);
    expect(rocket.sightRange).toBe(1);
    expect(computeTrainerSight(rocket, 21, 3, city, false).spotted, 'he watches (21,3)').toBe(true);
  });

  it('cannot see the hole landing (20,3) — the player is never ambushed on arrival', () => {
    expect(computeTrainerSight(rocket, 20, 3, city, false).spotted).toBe(false);
    for (const [x, y] of GARDEN) {
      if (x === 21 && y === 3) continue;
      expect(computeTrainerSight(rocket, x, y, city, false).spotted, `sees (${x},${y})`).toBe(false);
    }
  });
});

describe('Cerulean burgled house — interior', () => {
  const officer = npc(house, 'cerulean_officer')!;

  it('the policeman is inside, in front of the hole', () => {
    expect(officer).toBeDefined();
    expect([officer.x, officer.y]).toEqual([3, 2]);
    expect(npc(city, 'cerulean_officer'), 'and no longer outside in town').toBeUndefined();
    expect(officer.dialogue.join(' ')).toMatch(/hole in the wall/i);
  });

  it('the house NPC no longer points the player at Route 5', () => {
    const text = house.npcs!.flatMap(n => n.dialogue).join(' ');
    expect(text).not.toMatch(/ROUTE 5/i);
    expect(text).toMatch(/back garden/i);
  });

  it('with the officer solid, the hole (3,1) is not reachable from the front door', () => {
    const withOfficer = reachable(house, [3, 6]);
    expect(can(withOfficer, 3, 1), 'the hole is blocked').toBe(false);
    expect(can(withOfficer, 3, 7), 'the front mat always is').toBe(true);
    expect(can(withOfficer, 4, 3), 'and the room itself').toBe(true);
  });

  it('with the officer gone (bill_helped) the hole is reachable', () => {
    const gone = reachable(house, [3, 6], house.npcs!.filter(n => n.id !== 'cerulean_officer'));
    expect(can(gone, 3, 1), 'the hole opens up').toBe(true);
    expect(can(gone, 3, 7)).toBe(true);
  });

  it('the counters and the room are unchanged', () => {
    for (const [x, y] of [[1, 2], [2, 2], [5, 2], [6, 2]]) expect(house.tiles[y][x], `(${x},${y})`).toBe(TileType.COUNTER);
    expect(house.collision[2][4], '(4,2) is open floor beside the hole').toBe(false);
    expect(house.width).toBe(8);
    expect(house.height).toBe(8);
  });
});

describe('Cerulean burgled house — round trips', () => {
  it('the front door: city (20,6) -> house (3,6), house (3,7) -> city (20,7), one below the door', () => {
    expect(warpAt(city, 20, 6)).toMatchObject({ targetMap: 'burgled_house', targetX: 3, targetY: 6 });
    expect(warpAt(house, 3, 7)).toMatchObject({ targetMap: 'cerulean_city', targetX: 20, targetY: 7 });
    expect(city.collision[7][20], 'the landing is walkable grass').toBe(false);
    expect(city.tiles[7][20]).toBe(TileType.GRASS);
  });

  it('the hole: city (20,4) -> house (4,2), house (3,1) -> city (20,3), one above the door', () => {
    // (3,2) is the policeman's tile, so the landing is the floor beside it.
    expect(warpAt(city, 20, 4)).toMatchObject({ targetMap: 'burgled_house', targetX: 4, targetY: 2 });
    expect(warpAt(house, 3, 1)).toMatchObject({ targetMap: 'cerulean_city', targetX: 20, targetY: 3 });
    expect(city.collision[3][20], 'the garden landing is walkable').toBe(false);
  });

  it('the interior mats face the way the exterior doors do', () => {
    expect(house.tiles[1][3]).toBe(TileType.DOORMAT);   // hole, north wall
    expect(house.tiles[7][3]).toBe(TileType.DOORMAT);   // front door, south wall
    // Walking north out of the hole comes out north of the house; walking
    // south out of the front door comes out south of it.
    expect(warpAt(house, 3, 1)!.targetY).toBeLessThan(warpAt(city, 20, 4)!.y);
    expect(warpAt(house, 3, 7)!.targetY).toBeGreaterThan(warpAt(city, 20, 6)!.y);
  });
});
