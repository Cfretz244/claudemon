// Route 23 is the badge gate in front of Victory Road: three guards, each in
// the single gap of a fence row that runs right across the route. Before the
// fix the route was an open field and a player with no badges simply walked
// around all three, so this file proves the opposite from the map data — every
// guard is a true cut, on foot AND surfing, and the route opens exactly as the
// three `badge_checkN_cleared` flags are set.
//
// Reachability is a plain BFS over the tiles: collision decides what a land
// walker may enter, water is added for a surfer, every visible NPC is solid
// (`shouldSkipNPC` with the flags of the state being tested), and a warp tile
// is only entered when it is the goal (stepping on one leaves the route).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { DIR_VECTORS } from '../../src/utils/constants';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { BADGE_CHECK_REQUIREMENTS, badgeCheckClearedFlag } from '../../src/logic/roadBlocks';

const R23: MapData = ALL_MAPS.route23;
type Pos = { x: number; y: number };
const k = (p: Pos) => `${p.x},${p.y}`;

const GUARDS = Object.keys(BADGE_CHECK_REQUIREMENTS); // badge_check1..3, south to north
const SOUTH_LANDING: Pos = { x: 7, y: 23 }; // the tile above the Route 22 warp
const NORTH_LANDING: Pos = { x: 7, y: 1 };  // the tile below the Victory Road warp

const npcAt = (id: string): Pos => {
  const n = R23.npcs.find(x => x.id === id);
  if (!n) throw new Error(`route23: no NPC ${id}`);
  return { x: n.x, y: n.y };
};
const cleared = (...ids: string[]): Record<string, boolean> =>
  Object.fromEntries(ids.map(id => [badgeCheckClearedFlag(id), true]));

/** Every tile reachable from `from`, with the NPCs a player in `flags` would see. */
function reach(from: Pos, flags: Record<string, boolean>, opts: { surf?: boolean; goal?: Pos } = {}): Set<string> {
  const solid = new Set(
    R23.npcs.filter(n => !shouldSkipNPC(n, flags, [], [], () => false)).map(k),
  );
  const enterable = (p: Pos): boolean => {
    if (p.x < 0 || p.y < 0 || p.x >= R23.width || p.y >= R23.height) return false;
    if (solid.has(k(p))) return false;
    if (R23.collision[p.y][p.x]) return !!opts.surf && R23.tiles[p.y][p.x] === TileType.WATER;
    if (R23.warps.some(w => w.x === p.x && w.y === p.y)) return !!opts.goal && k(opts.goal) === k(p);
    return true;
  };
  const seen = new Set([k(from)]);
  const queue: Pos[] = [from];
  while (queue.length) {
    const c = queue.shift()!;
    for (const d of Object.values(DIR_VECTORS)) {
      const n = { x: c.x + d.x, y: c.y + d.y };
      if (seen.has(k(n)) || !enterable(n)) continue;
      seen.add(k(n));
      queue.push(n);
    }
  }
  return seen;
}
const canReach = (from: Pos, to: Pos, flags: Record<string, boolean>, surf: boolean) =>
  reach(from, flags, { surf, goal: to }).has(k(to));
/** Both walkers: on foot, and surfing (water walkable too). */
const WALKERS: Array<[string, boolean]> = [['on foot', false], ['surfing', true]];

describe('Route 23 badge guards', () => {
  it('the two warps are unchanged: north to Victory Road, south to Route 22', () => {
    expect(R23.warps).toEqual([
      { x: 7, y: 0, targetMap: 'victory_road', targetX: 10, targetY: 25 },
      { x: 7, y: 24, targetMap: 'route22', targetX: 1, targetY: 4 },
    ]);
  });

  it('each guard stands in the one gap of a solid fence row that spans the route', () => {
    for (const id of GUARDS) {
      const g = npcAt(id);
      for (let x = 0; x < R23.width; x++) {
        if (x === g.x) {
          expect(R23.collision[g.y][x], `${id}: his own tile must be walkable once he steps aside`).toBe(false);
        } else {
          expect(R23.collision[g.y][x], `${id}: row y=${g.y} is open at x=${x}`).toBe(true);
        }
      }
    }
  });

  it('the stepped-aside twins stand on solid tiles, so they can never block the way through', () => {
    for (const id of GUARDS) {
      const twin = npcAt(`${id}_passed`);
      expect(R23.collision[twin.y][twin.x], `${id}_passed at ${k(twin)} is on a walkable tile`).toBe(true);
      expect(twin.x).not.toBe(npcAt(id).x);
      expect(twin.y).toBe(npcAt(id).y);
    }
  });

  describe.each(WALKERS)('a player %s', (_name, surf) => {
    it('cannot reach Victory Road from the Route 22 landing with no badges checked', () => {
      expect(canReach(SOUTH_LANDING, NORTH_LANDING, {}, surf)).toBe(false);
    });

    it.each(GUARDS)('%s alone still cuts the route (the other two cleared)', id => {
      const others = GUARDS.filter(g => g !== id);
      expect(canReach(SOUTH_LANDING, NORTH_LANDING, cleared(...others), surf)).toBe(false);
    });

    it('reaches Victory Road once all three are cleared, and comes back the same way', () => {
      const flags = cleared(...GUARDS);
      expect(canReach(SOUTH_LANDING, NORTH_LANDING, flags, surf)).toBe(true);
      expect(canReach(NORTH_LANDING, SOUTH_LANDING, flags, surf)).toBe(true);
    });

    it('can always walk up to the next guard: his front tile is reachable with the earlier ones cleared', () => {
      for (let i = 0; i < GUARDS.length; i++) {
        const g = npcAt(GUARDS[i]);
        const front = { x: g.x, y: g.y + 1 }; // he faces DOWN, at the player coming from Route 22
        const flags = cleared(...GUARDS.slice(0, i));
        expect(canReach(SOUTH_LANDING, front, flags, surf), `${GUARDS[i]} front tile ${k(front)}`).toBe(true);
      }
    });

    it('never touches a `_passed` twin\'s tile on the way through', () => {
      const flags = cleared(...GUARDS);
      const seen = reach(SOUTH_LANDING, flags, { surf, goal: NORTH_LANDING });
      for (const id of GUARDS) expect(seen.has(k(npcAt(`${id}_passed`))), `${id}_passed`).toBe(false);
    });
  });

  it('clearing the guards in order opens exactly one section at a time', () => {
    // With guard N still posted, the tile just past him stays out of reach.
    for (let i = 0; i < GUARDS.length; i++) {
      const g = npcAt(GUARDS[i]);
      const past = { x: g.x, y: g.y - 1 };
      expect(canReach(SOUTH_LANDING, past, cleared(...GUARDS.slice(0, i)), true), `past ${GUARDS[i]}`).toBe(false);
      expect(canReach(SOUTH_LANDING, past, cleared(...GUARDS.slice(0, i + 1)), true), `past ${GUARDS[i]} cleared`).toBe(true);
    }
  });

  it('every tall-grass patch is off the fence rows, so no guard stands in grass', () => {
    for (const id of GUARDS) {
      const g = npcAt(id);
      for (let x = 0; x < R23.width; x++) {
        expect(R23.tiles[g.y][x], `row y=${g.y} has tall grass at x=${x}`).not.toBe(TileType.TALL_GRASS);
      }
    }
  });
});
