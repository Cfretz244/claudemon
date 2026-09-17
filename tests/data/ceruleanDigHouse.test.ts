import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, NPCData, TileType } from '../../src/types/map.types';
import { computeTrainerSight } from '../../src/logic/trainerSight';
import { Direction } from '../../src/utils/constants';

// The Cerulean burgled house, rebuilt with the town (town-t3). The house is the
// 4x4 at (19,14) on the south-east street: the front door (20,17) faces the
// road, and the burglar's hole is a SECOND door (22,17) in the same bottom wall
// row that opens on an ENCLOSED garden east of the house. The policeman stands
// INSIDE in front of the hole, so the chain is unchanged in spirit:
// officer (bill_helped) -> hole -> garden -> the Rocket grunt.
//
// What changed from the pre-town-t3 layout, and why these assertions moved:
// the old map gated Routes 5 and 9 behind the Rocket with a fenced east-edge
// corridor and a fence across row 22. The sketch (docs/towns/cerulean_city.json)
// puts Route 5 at the foot of the main road and Route 9 behind the two Cut
// trees at (22,12)/(22,13), so the Rocket now guards only his own garden. The
// garden being unreachable on foot is the pin the brief asks for.

const city = ALL_MAPS['cerulean_city'];
const house = ALL_MAPS['burgled_house'];

/** The walled garden east of the house: the only way in is through the house. */
const GARDEN: Array<[number, number]> = [[22, 18], [22, 19], [21, 19]];
/** The fences that seal it off from the street. */
const GARDEN_FENCE: Array<[number, number]> = [
  [21, 18], [23, 18], [23, 19], [19, 20], [20, 20], [21, 20], [22, 20], [23, 20],
];

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
const withoutRocket = () => city.npcs!.filter(n => n.id !== 'cerulean_rocket');

// Route 5 lands the player on (10-13,23), the foot of the main road.
const fromRoute5 = () => reachable(city, [11, 23]);

describe('Cerulean burgled house — exterior', () => {
  it('is the 4x4 house on the south-east street, with two doors in its bottom wall row', () => {
    expect(city.tiles[17][20], 'the front door').toBe(TileType.DOOR);
    expect(city.tiles[17][22], 'the burglar hole, from the town side').toBe(TileType.DOOR);
    expect(city.tiles[17][19]).toBe(TileType.BUILDING);
    expect(city.tiles[17][21]).toBe(TileType.BUILDING);
    // The kit stamps a doormat below the front door only; the hole opens on grass.
    expect(city.tiles[18][20]).toBe(TileType.DOORMAT);
    expect(city.tiles[18][22]).toBe(TileType.GRASS);
    expect(city.warps.filter(w => w.targetMap === 'burgled_house').map(w => `${w.x},${w.y}`).sort())
      .toEqual(['20,17', '22,17']);
  });

  it('the garden is grass, fenced in on every side that is not the house', () => {
    for (const [x, y] of GARDEN) expect(city.tiles[y][x], `(${x},${y}) is garden grass`).toBe(TileType.GRASS);
    for (const [x, y] of GARDEN) expect(city.collision[y][x], `(${x},${y}) is walkable`).toBe(false);
    for (const [x, y] of GARDEN_FENCE) expect(city.tiles[y][x], `(${x},${y}) fence`).toBe(TileType.FENCE);
    // Its north side is the house wall itself, with the hole in the middle of it.
    expect(city.tiles[17][23]).toBe(TileType.FENCE);
  });

  it('the front door keeps a path approach from the street', () => {
    expect(city.tiles[19][19], 'the street corner below the doorstep').toBe(TileType.PATH);
    expect(city.tiles[18][19], 'the stub up to the doorstep').toBe(TileType.PATH);
  });

  it('the Fly landing, the Cut trees and the Cerulean NPCs are where the sketch puts them', () => {
    expect(city.collision[11][14], 'Fly lands on (14,11)').toBe(false);
    expect(city.tiles[12][22]).toBe(TileType.CUT_TREE);
    expect(city.tiles[13][22]).toBe(TileType.CUT_TREE);
    expect(warpAt(city, 24, 12)?.targetMap).toBe('route9');
    expect(warpAt(city, 24, 13)?.targetMap).toBe('route9');
    expect(city.tiles[1][4], 'the cave mouth across the pool').toBe(TileType.CAVE_ENTRANCE);
    for (const id of ['cerulean_npc1', 'cerulean_npc2', 'cerulean_npc3', 'cerulean_rocket']) {
      expect(npc(city, id), id).toBeDefined();
    }
  });
});

describe('Cerulean burgled house — the garden is sealed from the street', () => {
  it('flood-filling the town from the Route 5 landing never reaches the garden', () => {
    const town = fromRoute5();
    for (const [x, y] of GARDEN) expect(can(town, x, y), `garden (${x},${y}) from the street`).toBe(false);
    expect(can(town, 22, 17), 'nor the hole itself').toBe(false);
  });

  it('...even with the Rocket out of the way: it is the fences, not the grunt', () => {
    const town = reachable(city, [11, 23], withoutRocket());
    for (const [x, y] of GARDEN) expect(can(town, x, y), `garden (${x},${y})`).toBe(false);
  });

  it('but the front door, its doormat and the rest of town are reachable', () => {
    const town = fromRoute5();
    expect(can(town, 19, 19), 'the street corner').toBe(true);
    expect(can(town, 20, 18), 'the doormat').toBe(true);
    expect(can(town, 20, 17), 'the front door').toBe(true);
    expect(can(town, 15, 9), 'the Pokemon Center door').toBe(true);
    expect(can(town, 5, 9), 'the Gym door').toBe(true);
    expect(can(town, 2, 12), 'the Route 4 landing').toBe(true);
    expect(can(town, 11, 2), 'the Route 24 plank bridge').toBe(true);
  });

  it('from the hole landing (22,18) the garden is reachable, and nothing else is', () => {
    const garden = reachable(city, [22, 18], withoutRocket());
    for (const [x, y] of GARDEN) expect(can(garden, x, y), `garden (${x},${y})`).toBe(true);
    expect(can(garden, 22, 17), 'the way back into the house').toBe(true);
    expect(garden.size, 'the garden is exactly those four tiles').toBe(GARDEN.length + 1);
    expect(can(garden, 19, 19), 'no shortcut out to the street').toBe(false);
  });

  it('with the Rocket standing in it, the garden is still his to guard', () => {
    const garden = reachable(city, [22, 18]);
    expect(can(garden, 22, 19), "the Rocket's own tile").toBe(false);
    expect(can(garden, 21, 19), 'the corner beside him').toBe(false); // only reachable through him
    expect(can(garden, 22, 17), 'the way back is never blocked').toBe(true);
  });
});

describe('Cerulean burgled house — the Rocket', () => {
  const rocket = npc(city, 'cerulean_rocket')!;

  it('stands in the garden facing the hole landing', () => {
    expect([rocket.x, rocket.y]).toEqual([22, 19]);
    expect(rocket.direction).toBe(Direction.UP);
    expect(rocket.isTrainer).toBe(true);
  });

  it('is talk-triggered: he never ambushes a player who just warped in', () => {
    // No sightRange => computeTrainerSight always answers "not spotted". The
    // player arrives at (22,18), one tile in front of him — a sight battle
    // would fire before the screen had finished fading in.
    expect(rocket.sightRange).toBeFalsy();
    for (const [x, y] of GARDEN) {
      expect(computeTrainerSight(rocket, x, y, city, false).spotted, `sees (${x},${y})`).toBe(false);
    }
  });
});

describe('Cerulean burgled house — interior', () => {
  const officer = npc(house, 'cerulean_officer')!;

  it('the policeman is inside, in front of the hole', () => {
    expect(officer).toBeDefined();
    expect([officer.x, officer.y]).toEqual([3, 2]);
    expect(npc(city, 'cerulean_officer'), 'and not outside in town').toBeUndefined();
    expect(officer.dialogue.join(' ')).toMatch(/hole in the wall/i);
  });

  it('the house NPC points the player at the back garden, not Route 5', () => {
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
  it('the front door: city (20,17) -> house (3,6), house (3,7) -> city (20,18), the doormat', () => {
    expect(warpAt(city, 20, 17)).toMatchObject({ targetMap: 'burgled_house', targetX: 3, targetY: 6 });
    expect(warpAt(house, 3, 7)).toMatchObject({ targetMap: 'cerulean_city', targetX: 20, targetY: 18 });
    expect(city.collision[18][20], 'the landing is the doormat').toBe(false);
    expect(city.tiles[18][20]).toBe(TileType.DOORMAT);
  });

  it('the hole: city (22,17) -> house (4,2), house (3,1) -> city (22,18), inside the garden', () => {
    // (3,2) is the policeman's tile, so the landing is the floor beside it —
    // tests/data/maps.data.test.ts forbids a warp that lands on an NPC.
    expect(warpAt(city, 22, 17)).toMatchObject({ targetMap: 'burgled_house', targetX: 4, targetY: 2 });
    expect(warpAt(house, 3, 1)).toMatchObject({ targetMap: 'cerulean_city', targetX: 22, targetY: 18 });
    expect(city.collision[18][22], 'the garden landing is walkable').toBe(false);
  });

  it('the interior mats face the way the exterior doors do', () => {
    expect(house.tiles[1][3]).toBe(TileType.DOORMAT);   // hole, north wall
    expect(house.tiles[7][3]).toBe(TileType.DOORMAT);   // front door, south wall
    // Both exterior doors are in the same (south-facing) wall row, so both
    // interior exits land one row BELOW their door.
    for (const w of house.warps) {
      const door = city.warps.find(c => c.targetMap === 'burgled_house' && c.x === w.targetX && c.y === w.targetY - 1);
      expect(door, `an exterior door above (${w.targetX},${w.targetY})`).toBeDefined();
      expect(city.tiles[door!.y][door!.x]).toBe(TileType.DOOR);
    }
  });
});
