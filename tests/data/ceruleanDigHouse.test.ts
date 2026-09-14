import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, NPCData, TileType } from '../../src/types/map.types';
import { computeTrainerSight } from '../../src/logic/trainerSight';

// The Cerulean "dig house" rebuilt to the Gen I layout. The house sits in the
// NE corner with its front door on the south face and the burglar's hole in
// the back wall; the policeman stands INSIDE in front of the hole; the Rocket
// waits on the back garden's only exit. South and east Cerulean stay fenced
// off, so the route out of town is: officer (bill_helped) -> hole -> garden ->
// beat the Rocket -> the east-edge corridor -> the Cut trees (Route 9) and the
// southern strip (Route 5).

const city = ALL_MAPS['cerulean_city'];
const house = ALL_MAPS['burgled_house'];
const centre = ALL_MAPS['pokemon_center_cerulean'];

const GARDEN: Array<[number, number]> = [];
for (let x = 18; x <= 22; x++) for (let y = 2; y <= 3; y++) GARDEN.push([x, y]);

/** The fenced lane down the east edge: x22 beside the house, then x21-22. */
const CORRIDOR: Array<[number, number]> = [];
for (let y = 4; y <= 6; y++) CORRIDOR.push([22, y]);
for (let y = 7; y <= 21; y++) for (const x of [21, 22]) {
  if (x === 21 && y === 7) continue;            // the seam that seals row y7
  if (x === 22 && (y === 12 || y === 13)) continue; // the Cut trees
  CORRIDOR.push([x, y]);
}

const STRIP: Array<[number, number]> = [];
for (let x = 2; x <= 22; x++) for (const y of [23, 24]) STRIP.push([x, y]);

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

// The Route 4 gate lands the player on (1,12)/(1,13), the west entrance.
const fromTown = () => reachable(city, [1, 12]);

describe('Cerulean burgled house — exterior', () => {
  it('the house is a 4-wide facade in the NE corner with a roof row', () => {
    for (let x = 18; x <= 21; x++) {
      expect(city.tiles[4][x], `(${x},4) should be roof or the back door`).toBe(x === 20 ? TileType.DOOR : TileType.ROOF);
      for (const y of [5, 6]) {
        expect(city.tiles[y][x], `(${x},${y}) should be building or the front door`)
          .toBe(x === 20 && y === 6 ? TileType.DOOR : TileType.BUILDING);
      }
    }
    // Column x22 beside the house is the garden's way down to the corridor.
    for (const y of [4, 5, 6]) expect(city.collision[y][22], `(22,${y}) is walkable`).toBe(false);
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

  it('the fence at y22 seals the town off except at the foot of the corridor', () => {
    for (let x = 2; x <= 20; x++) expect(city.tiles[22][x], `(${x},22) fence`).toBe(TileType.FENCE);
    expect(city.collision[22][21], 'the gap at (21,22)').toBe(false);
    expect(city.collision[22][22], 'the gap at (22,22)').toBe(false);
    // The southern strip and the Route 5 warps themselves are untouched.
    for (const [x, y] of STRIP) expect(city.collision[y][x], `(${x},${y}) strip`).toBe(false);
    expect(warpAt(city, 11, 24)?.targetMap).toBe('route5');
    expect(warpAt(city, 12, 24)?.targetMap).toBe('route5');
    for (let x = 10; x <= 13; x++) expect(city.collision[23][x], `route5 landing (${x},23)`).toBe(false);
  });

  it('every row of the east-edge corridor is walled off from the town', () => {
    for (let y = 7; y <= 21; y++) {
      const seam = city.collision[y][20] || city.collision[y][21];
      expect(seam, `row ${y} must have a solid tile at x20 or x21 or the corridor leaks`).toBe(true);
    }
    for (const [x, y] of CORRIDOR) expect(city.collision[y][x], `(${x},${y}) corridor is walkable`).toBe(false);
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
    for (const y of [5, 6, 7]) for (const x of [16, 17]) {
      expect(city.tiles[y][x], `(${x},${y}) should be open grass now`).toBe(TileType.GRASS);
    }
    expect(city.tiles[5][18], 'the new house starts at x18').toBe(TileType.BUILDING);
  });

  it('the Fly landing, the Cut trees and the other Cerulean NPCs are untouched', () => {
    expect(city.collision[11][14], 'Fly lands on (14,11)').toBe(false);
    expect(city.tiles[12][22]).toBe(TileType.CUT_TREE);
    expect(city.tiles[13][22]).toBe(TileType.CUT_TREE);
    expect(warpAt(city, 24, 12)?.targetMap).toBe('route9');
    expect(warpAt(city, 24, 13)?.targetMap).toBe('route9');
    expect(city.tiles[2][14]).toBe(TileType.ROOF);       // Bulbasaur house
    expect(city.tiles[4][15]).toBe(TileType.DOOR);
    for (const id of ['cerulean_npc1', 'cerulean_npc2', 'cerulean_npc3']) expect(npc(city, id)).toBeDefined();
  });
});

describe('Cerulean burgled house — the town is sealed south and east', () => {
  it('the garden is grass, fenced to the west and walled in everywhere else', () => {
    for (const [x, y] of GARDEN) expect(city.collision[y][x], `(${x},${y}) is walkable garden`).toBe(false);
    expect(city.tiles[2][17]).toBe(TileType.FENCE);
    expect(city.tiles[3][17]).toBe(TileType.FENCE);
    expect(city.tiles[2][23]).toBe(TileType.TREE);
    expect(city.tiles[3][23]).toBe(TileType.TREE);
    for (let x = 18; x <= 22; x++) expect(city.tiles[1][x], `(${x},1) tree border`).toBe(TileType.TREE);
  });

  it('from the Route 4 landing, with no flags, nothing past the house is reachable', () => {
    const town = fromTown();
    for (const [x, y] of GARDEN) expect(can(town, x, y), `garden (${x},${y})`).toBe(false);
    for (const [x, y] of CORRIDOR) expect(can(town, x, y), `corridor (${x},${y})`).toBe(false);
    for (const [x, y] of STRIP) expect(can(town, x, y), `strip (${x},${y})`).toBe(false);
    expect(can(town, 11, 24), 'Route 5 warp (11,24)').toBe(false);
    expect(can(town, 12, 24), 'Route 5 warp (12,24)').toBe(false);
    expect(can(town, 24, 12), 'Route 9 warp (24,12)').toBe(false);
    expect(can(town, 24, 13), 'Route 9 warp (24,13)').toBe(false);
    expect(can(town, 20, 4), 'nor the back door itself').toBe(false);
  });

  it('but the front door and its approach are reachable from the road', () => {
    const town = fromTown();
    expect(can(town, 20, 7), 'the front-door approach (20,7)').toBe(true);
    expect(can(town, 20, 6), 'the front door itself').toBe(true);
    expect(can(town, 18, 11), 'and the Pokemon Center door').toBe(true);
  });

  it('the Rocket bars the garden exit: with him there (20,3) is a dead end', () => {
    const garden = reachable(city, [20, 3]);
    for (const [x, y] of GARDEN) {
      if (x === 22 && y === 3) continue;   // that is the Rocket's own tile
      expect(can(garden, x, y), `garden (${x},${y})`).toBe(true);
    }
    expect(can(garden, 20, 4), 'the way back in through the hole').toBe(true);
    expect(can(garden, 22, 4), 'the exit down the east edge is blocked').toBe(false);
    for (const [x, y] of CORRIDOR) expect(can(garden, x, y), `corridor (${x},${y})`).toBe(false);
  });

  it('with him defeated the corridor opens all the way to Route 5 and the Cut trees', () => {
    const open = reachable(city, [20, 3], withoutRocket());
    for (const [x, y] of CORRIDOR) expect(can(open, x, y), `corridor (${x},${y})`).toBe(true);
    expect(can(open, 21, 12), 'up against the first Cut tree').toBe(true);
    expect(can(open, 21, 13), 'and the second').toBe(true);
    expect(can(open, 21, 22), 'the fence gap (21,22)').toBe(true);
    expect(can(open, 22, 22), 'the fence gap (22,22)').toBe(true);
    for (const [x, y] of STRIP) expect(can(open, x, y), `strip (${x},${y})`).toBe(true);
    expect(can(open, 11, 24), 'the Route 5 warp').toBe(true);
    expect(can(open, 12, 24), 'the other Route 5 warp').toBe(true);
    expect(can(open, 24, 12), 'Route 9 stays behind the Cut trees').toBe(false);
  });

  it('the sealed side never leaks back into town on foot — the house is the only way', () => {
    const open = reachable(city, [20, 3], withoutRocket());
    expect(can(open, 11, 12), 'the town road').toBe(false);
    expect(can(open, 20, 7), 'the front-door approach').toBe(false);
    // Coming back the other way: from the Route 5 landing, up the corridor and
    // into the garden to the back door.
    const home = reachable(city, [13, 23], withoutRocket());
    expect(can(home, 20, 3), 'the garden landing').toBe(true);
    expect(can(home, 20, 4), 'the back door').toBe(true);
    expect(can(home, 11, 12), 'and still no shortcut into town').toBe(false);
  });
});

describe('Cerulean burgled house — the Rocket', () => {
  const rocket = npc(city, 'cerulean_rocket')!;

  it('stands on the garden exit facing the one tile beside the landing', () => {
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
    expect(warpAt(house, 3, 1)!.targetY).toBeLessThan(warpAt(city, 20, 4)!.y);
    expect(warpAt(house, 3, 7)!.targetY).toBeGreaterThan(warpAt(city, 20, 6)!.y);
  });
});
