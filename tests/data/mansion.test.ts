// Pokemon Mansion walkthrough, proven on the real map data with the solver
// (src/logic/boulders.ts): its statue switches are "toggles" the search may
// press, so every proof below is over (player tile, switch state). Every NPC
// counts as solid (trainers keep blocking after the battle, item balls until
// they are picked up, statues always) and so does every warp tile other than
// the goal (stepping on one leaves the floor).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { canReach, reachableFlags, statueToggles, Pos, SolveOptions, Toggle } from '../../src/logic/boulders';
import { checkEntryGates } from '../../src/logic/warpGate';
import { DIR_VECTORS } from '../../src/utils/constants';

const F1 = ALL_MAPS.pokemon_mansion;
const F2 = ALL_MAPS.pokemon_mansion_2f;
const F3 = ALL_MAPS.pokemon_mansion_3f;
const B1 = ALL_MAPS.pokemon_mansion_b1f;
const FLOORS = [F1, F2, F3, B1];

const warpTo = (map: MapData, target: string, n = 0): Pos => {
  const w = map.warps.filter(x => x.targetMap === target)[n];
  if (!w) throw new Error(`${map.id}: no warp ${n} to ${target}`);
  return { x: w.x, y: w.y };
};
const landing = (from: MapData, to: MapData, n = 0): Pos => {
  const w = from.warps.filter(x => x.targetMap === to.id)[n];
  if (!w) throw new Error(`${from.id}: no warp ${n} to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const npcs = (map: MapData) => map.npcs.map(n => ({ x: n.x, y: n.y }));
const statue = (map: MapData, id: string): Toggle => {
  const t = statueToggles(map).find(s => map.npcs.find(n => n.id === id && n.x === s.x && n.y === s.y));
  if (!t) throw new Error(`${map.id}: no statue ${id}`);
  return t;
};
/** Tiles the player can stand on to interact with an NPC (walkable, not under another NPC). */
const npcSides = (map: MapData, id: string): Pos[] => {
  const npc = map.npcs.find(n => n.id === id)!;
  const sides = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    .map(d => ({ x: npc.x + d.x, y: npc.y + d.y }))
    .filter(p => !map.collision[p.y]?.[p.x] && !npcs(map).some(t => t.x === p.x && t.y === p.y));
  if (!sides.length) throw new Error(`${map.id}: ${id} has no free neighbour`);
  return sides;
};
/** Walk from a to b pressing any of `toggles` on the way (default: every statue of the floor). */
const reach = (map: MapData, a: Pos, b: Pos, opts: SolveOptions & { toggles?: Toggle[] } = {}) => {
  const warps = map.warps.filter(w => !(w.x === b.x && w.y === b.y)).map(w => ({ x: w.x, y: w.y }));
  const r = canReach(map, a, b, { toggles: statueToggles(map), ...opts, blocked: [...npcs(map), ...warps] });
  expect(r.exhausted, `${map.id}: solver hit the state cap`).toBe(false);
  return r.found;
};
const reachNpc = (map: MapData, from: Pos, id: string, opts?: SolveOptions) => npcSides(map, id).some(p => reach(map, from, p, opts));
/** The switch states the player can arrive at `goal` in, from `from`, pressing statues freely. */
const statesAt = (map: MapData, from: Pos, goal: Pos): Record<string, boolean>[] => {
  const warps = map.warps.filter(w => !(w.x === goal.x && w.y === goal.y)).map(w => ({ x: w.x, y: w.y }));
  const r = reachableFlags(map, from, goal, { toggles: statueToggles(map), blocked: [...npcs(map), ...warps] });
  expect(r.exhausted).toBe(false);
  return r.flags;
};
const flagOf = (map: MapData) => {
  const flags = new Set(statueToggles(map).map(t => t.flag));
  expect(flags.size, `${map.id}: one switch flag per floor`).toBe(1);
  return [...flags][0];
};

// Landmarks
const entrance = landing(ALL_MAPS.cinnabar_island, F1);   // the front door
const stairs1up = warpTo(F1, F2.id);                        // 1F -> 2F
const stairs2down = warpTo(F1, B1.id);                      // 1F -> B1F, inside the sealed room
const hallExit = warpTo(F1, 'cinnabar_island');
const holeLanding = landing(F3, F1);                        // where the 3F hole drops you
const f2from1 = landing(F1, F2);
const stairs3up = warpTo(F2, F3.id);
const f2from3 = landing(F3, F2);
const f2to1 = warpTo(F2, F1.id);
const f3from2 = landing(F2, F3);
const hole = warpTo(F3, F1.id);
const b1from1 = landing(F1, B1);
const b1to1 = warpTo(B1, F1.id);

describe('Pokemon Mansion', () => {
  it('is four floors with the stairs wired both ways and the 3F hole landing in the sealed 1F room', () => {
    expect(landing(F2, F1)).toEqual(stairs1up);
    expect(landing(F1, F2)).toEqual(warpTo(F2, F1.id));
    expect(landing(F3, F2)).toEqual(stairs3up);
    expect(landing(F2, F3)).toEqual(warpTo(F3, F2.id));
    expect(landing(B1, F1)).toEqual(stairs2down);
    expect(landing(F1, B1)).toEqual(b1to1);
    expect(F1.tiles[holeLanding.y][holeLanding.x]).toBe(TileType.INDOOR_FLOOR);
    for (const m of FLOORS) {
      expect(m.floorTile, `${m.id}: open gates show indoor floor`).toBe(TileType.INDOOR_FLOOR);
      expect(m.encounterTiles, `${m.id}: encounters roll on the floor`).toEqual([TileType.INDOOR_FLOOR]);
    }
  });

  describe('1F', () => {
    it('the stairs up are reachable from the front door without touching a switch', () => {
      expect(reach(F1, entrance, stairs1up, { toggles: [] })).toBe(true);
    });
    it('the room with the stairs down is sealed: no route from the door, whatever is pressed', () => {
      expect(reach(F1, entrance, stairs2down)).toBe(false);
      expect(reach(F1, entrance, holeLanding)).toBe(false);
      // The only statue of the floor stands inside the sealed room.
      expect(reachNpc(F1, entrance, 'mansion_1f_statue')).toBe(false);
      expect(reachNpc(F1, holeLanding, 'mansion_1f_statue', { toggles: [] })).toBe(true);
    });
    it('from the hole landing: the stairs down are open, the way out needs the statue', () => {
      expect(reach(F1, holeLanding, stairs2down, { toggles: [] })).toBe(true);
      expect(reach(F1, holeLanding, hallExit, { toggles: [] })).toBe(false);
      expect(reach(F1, holeLanding, hallExit)).toBe(true);
      expect(statesAt(F1, holeLanding, hallExit).every(f => f[flagOf(F1)])).toBe(true);
      // Coming back from B1F the same holds, and once the gate is open the whole floor connects.
      expect(reach(F1, b1from1, hallExit)).toBe(true);
      expect(reach(F1, entrance, stairs2down, { storyFlags: { [flagOf(F1)]: true }, toggles: [] })).toBe(true);
    });
    it('every item is reachable from the door', () => {
      for (const n of F1.npcs.filter(n => n.isItemBall)) expect(reachNpc(F1, entrance, n.id, { toggles: [] }), n.id).toBe(true);
    });
  });

  describe('2F', () => {
    it('the stairs up need both statues in order: A opens gate G, B closes it again and opens g', () => {
      const A = statue(F2, 'mansion_2f_statue_a');
      const B = statue(F2, 'mansion_2f_statue_b');
      expect(reach(F2, f2from1, stairs3up, { toggles: [] })).toBe(false);
      expect(reach(F2, f2from1, stairs3up, { toggles: [], storyFlags: { [flagOf(F2)]: true } })).toBe(false);
      expect(reach(F2, f2from1, stairs3up, { toggles: [A] })).toBe(false);
      expect(reach(F2, f2from1, stairs3up, { toggles: [B] })).toBe(false);
      expect(reach(F2, f2from1, stairs3up)).toBe(true);
      // B is only reachable after A (it sits behind G) and every arrival at the stairs has the flag cleared again.
      expect(reachNpc(F2, f2from1, 'mansion_2f_statue_b', { toggles: [] })).toBe(false);
      expect(reachNpc(F2, f2from1, 'mansion_2f_statue_b', { toggles: [A] })).toBe(true);
      expect(statesAt(F2, f2from1, stairs3up).every(f => !f[flagOf(F2)])).toBe(true);
    });
    it('coming back down from 3F, the stairs down need statue B pressed again (G is shut), and a later trip up works from either switch state', () => {
      const B = statue(F2, 'mansion_2f_statue_b');
      expect(reach(F2, f2from3, f2to1, { toggles: [] })).toBe(false);
      expect(reach(F2, f2from3, f2to1, { toggles: [B] })).toBe(true);
      for (const set of [false, true]) expect(reach(F2, f2from1, stairs3up, { storyFlags: { [flagOf(F2)]: set } }), `flag ${set}`).toBe(true);
    });
    it('the Burglar guards the only way across his room', () => {
      const b = F2.npcs.find(n => n.id === 'mansion_trainer2')!;
      const d = DIR_VECTORS[b.direction];
      const watched = { x: b.x + d.x, y: b.y + d.y };
      const A = statue(F2, 'mansion_2f_statue_a');
      const noPass = { ...F2, collision: F2.collision.map((r, y) => r.map((c, x) => c || (x === watched.x && y === watched.y))) };
      expect(reachNpc(F2, f2from1, 'mansion_2f_statue_b', { toggles: [A] })).toBe(true);
      expect(reachNpc(noPass, f2from1, 'mansion_2f_statue_b', { toggles: [A] })).toBe(false);
    });
    it('the diary and every item are reachable', () => {
      expect(reachNpc(F2, f2from1, 'mansion_npc')).toBe(true);
      for (const n of F2.npcs.filter(n => n.isItemBall)) expect(reachNpc(F2, f2from1, n.id), n.id).toBe(true);
    });
  });

  describe('3F', () => {
    it('the balcony hole is behind gate G: the statue must be pressed, and every arrival has it set', () => {
      expect(reach(F3, f3from2, hole, { toggles: [] })).toBe(false);
      expect(reach(F3, f3from2, hole)).toBe(true);
      expect(statesAt(F3, f3from2, hole).every(f => f[flagOf(F3)])).toBe(true);
    });
    it('the TM room shuts when the statue is pressed (g), so it is open before and after another press', () => {
      const tm = F3.npcs.find(n => n.isItemBall && n.itemId === 'tm22_solar_beam')!;
      expect(reachNpc(F3, f3from2, tm.id, { toggles: [] })).toBe(true);
      expect(reachNpc(F3, f3from2, tm.id, { toggles: [], storyFlags: { [flagOf(F3)]: true } })).toBe(false);
      expect(reachNpc(F3, f3from2, tm.id, { storyFlags: { [flagOf(F3)]: true } })).toBe(true);
      for (const n of F3.npcs.filter(n => n.isItemBall)) expect(reachNpc(F3, f3from2, n.id), n.id).toBe(true);
    });
  });

  describe('B1F', () => {
    const key = B1.npcs.find(n => n.isItemBall && n.itemId === 'secret_key')!;
    it('holds the SECRET KEY, behind the airlock: statue A opens G, statue B closes it and opens g', () => {
      const A = statue(B1, 'mansion_b1f_statue_a');
      const B = statue(B1, 'mansion_b1f_statue_b');
      expect(key).toBeDefined();
      expect(reachNpc(B1, b1from1, key.id, { toggles: [] })).toBe(false);
      expect(reachNpc(B1, b1from1, key.id, { toggles: [A] })).toBe(false);
      expect(reachNpc(B1, b1from1, key.id, { toggles: [B] })).toBe(false);
      expect(reachNpc(B1, b1from1, key.id)).toBe(true);
      expect(reachNpc(B1, b1from1, 'mansion_b1f_statue_b', { toggles: [] })).toBe(false);
      for (const side of npcSides(B1, key.id)) expect(statesAt(B1, b1from1, side).every(f => !f[flagOf(B1)])).toBe(true);
    });
    it('the way back to the stairs works from the key wing (only ever entered with the switch cleared) via statue B', () => {
      const B = statue(B1, 'mansion_b1f_statue_b');
      const side = npcSides(B1, key.id)[0];
      expect(reach(B1, side, b1to1, { toggles: [] })).toBe(false);
      expect(reach(B1, side, b1to1, { toggles: [B] })).toBe(true);
    });
    it('every item is reachable from the stairs', () => {
      for (const n of B1.npcs.filter(n => n.isItemBall)) expect(reachNpc(B1, b1from1, n.id), n.id).toBe(true);
    });
  });

  it('the SECRET KEY unlocks the Cinnabar Gym', () => {
    const gym = ALL_MAPS.cinnabar_gym;
    const state = (bag: string[]) => ({ storyFlags: {}, badges: [], defeatedTrainers: [], hasItem: (id: string) => bag.includes(id) });
    expect(checkEntryGates(gym, 'cinnabar_island', state([])).ok).toBe(false);
    expect(checkEntryGates(gym, 'cinnabar_island', state(['secret_key'])).ok).toBe(true);
  });

  it('every statue has a free side to press it from and no gate tile next to it; every trainer stands in a niche facing a corridor tile', () => {
    for (const map of FLOORS) {
      for (const s of map.npcs.filter(n => n.toggleFlag)) {
        expect(npcSides(map, s.id).length).toBeGreaterThan(0);
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
          expect(map.tiles[s.y + dy]?.[s.x + dx], `${map.id}/${s.id}: a gate next to the statue could close on the player`).not.toBe(TileType.GATE);
        }
      }
      for (const t of map.npcs.filter(n => n.isTrainer)) {
        const d = DIR_VECTORS[t.direction];
        expect(map.collision[t.y + d.y]?.[t.x + d.x], `${map.id}/${t.id} faces a wall`).toBe(false);
        const open = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }].filter(o => !map.collision[t.y + o.y]?.[t.x + o.x]);
        expect(open.length, `${map.id}/${t.id} stands in the open`).toBeLessThanOrEqual(2);
      }
    }
  });
});
