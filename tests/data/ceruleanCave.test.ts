// Cerulean Cave walkthrough, proven on the real map data. The player walks
// land, surfs water (Surf is a given post-game) and hops LEDGE tiles south
// only; every NPC counts as solid (the Cooltrainers in their niches, item
// balls until picked up, Mewtwo) and so does every warp tile other than the
// goal (stepping on one leaves the floor). The puzzle: the ladder up is
// across 1F's lake, 2F is a one-way ring of ledges whose wrong branches drop
// the player back to the 1F entrance side, and only the right branch reaches
// 1F's sealed far side and the ladder down to Mewtwo.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { Pos } from '../../src/logic/boulders';
import { checkEntryGates } from '../../src/logic/warpGate';
import { DIR_VECTORS } from '../../src/utils/constants';
import { STATIC_LEGENDARIES } from '../../src/data/staticLegendaries';

const CITY = ALL_MAPS.cerulean_city;
const F1 = ALL_MAPS.cerulean_cave_1f;
const F2 = ALL_MAPS.cerulean_cave_2f;
const B1 = ALL_MAPS.cerulean_cave_b1f;
const FLOORS = [F1, F2, B1];

const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const k = (p: Pos) => `${p.x},${p.y}`;
const isWater = (t: TileType | undefined) => t === TileType.WATER || t === TileType.CURRENT;
const npc = (map: MapData, id: string) => {
  const n = map.npcs.find(x => x.id === id);
  if (!n) throw new Error(`${map.id}: no NPC ${id}`);
  return n;
};
/** Warps from `map` to `target`, in declaration order. */
const warpsTo = (map: MapData, target: string) => map.warps.filter(w => w.targetMap === target);
/** Tiles the player can stand on next to a position (land, no NPC). */
const sidesOf = (map: MapData, p: Pos): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => s.x >= 0 && s.y >= 0 && s.x < map.width && s.y < map.height
      && !map.collision[s.y][s.x] && map.tiles[s.y][s.x] !== TileType.LEDGE && !map.npcs.some(n => n.x === s.x && n.y === s.y));
/**
 * Every tile the player can end a move on from `from`. Water counts when
 * `surf`; a LEDGE is crossed only southward, landing on the tile below it;
 * warps other than `goal` are never entered; `alsoBlocked` adds obstacles.
 */
function reachSet(map: MapData, from: Pos, goal?: Pos, opts: { surf?: boolean; alsoBlocked?: Pos[]; pickedUp?: string[] } = {}): Set<string> {
  const surf = opts.surf ?? true;
  const solid = [...map.npcs.filter(n => !(opts.pickedUp ?? []).includes(n.id)).map(n => ({ x: n.x, y: n.y })), ...(opts.alsoBlocked ?? [])];
  const enterable = (p: Pos) => {
    if (p.x < 0 || p.y < 0 || p.x >= map.width || p.y >= map.height) return false;
    const t = map.tiles[p.y][p.x];
    if (t === TileType.LEDGE || solid.some(s => same(s, p))) return false;
    if (map.collision[p.y][p.x]) return surf && isWater(t);
    if (map.warps.some(w => same(w, p))) return !!goal && same(goal, p);
    return true;
  };
  const seen = new Set<string>([k(from)]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    for (const d of Object.values(DIR_VECTORS)) {
      let n = { x: p.x + d.x, y: p.y + d.y };
      if (map.tiles[n.y]?.[n.x] === TileType.LEDGE) {
        if (d.y !== 1) continue;
        n = { x: n.x, y: n.y + 1 };
        if (map.tiles[n.y]?.[n.x] === TileType.LEDGE) continue;
      }
      if (!enterable(n) || seen.has(k(n))) continue;
      seen.add(k(n));
      queue.push(n);
    }
  }
  return seen;
}
const reach = (map: MapData, from: Pos, to: Pos, opts?: Parameters<typeof reachSet>[3]) => reachSet(map, from, to, opts).has(k(to));
const reachNpc = (map: MapData, from: Pos, id: string, opts?: Parameters<typeof reachSet>[3]) => {
  const r = reachSet(map, from, undefined, opts);
  return sidesOf(map, npc(map, id)).some(s => r.has(k(s)));
};
/** Where a ladder lands the player: the warp on `from` to `to` at index n, read from its target. */
const landing = (from: MapData, to: MapData, n: number): Pos => {
  const w = warpsTo(from, to.id)[n];
  if (!w) throw new Error(`${from.id}: no warp ${n} to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const pos = (w: { x: number; y: number }): Pos => ({ x: w.x, y: w.y });
/** A trainer's watched tile. */
const front = (map: MapData, id: string): Pos => { const n = npc(map, id); const v = DIR_VECTORS[n.direction]; return { x: n.x + v.x, y: n.y + v.y }; };

// Landmarks. 1F's warps to 2F are, in order, a (up, across the lake), b, c, f
// (the pocket ladders) and d (the far side); e is the only ladder to B1F.
const [f1a, f1b, f1c, f1f, f1d] = warpsTo(F1, F2.id).map(pos);
const f1e = pos(warpsTo(F1, B1.id)[0]);
const [f2a, f2b, f2c, f2f, f2d] = warpsTo(F2, F1.id).map(pos);
const doorIn = landing(CITY, F1, 0);       // in front of the door, 1F
const doorOut = landing(F1, CITY, 0);      // the strip in front of the cave mouth, city
const f2FromA = landing(F1, F2, 0);
const f2FromB = landing(F1, F2, 1), f2FromC = landing(F1, F2, 2), f2FromF = landing(F1, F2, 3), f2FromD = landing(F1, F2, 4);
const f1FromD = landing(F2, F1, 4);
const f1FromB = landing(F2, F1, 1), f1FromC = landing(F2, F1, 2), f1FromF = landing(F2, F1, 3);
const b1FromE = landing(F1, B1, 0);
const b1e = pos(warpsTo(B1, F1.id)[0]);

describe('Cerulean Cave', () => {
  it('is three floors: seven ladders wired both ways, landing beside each other\'s tile; the door goes both ways', () => {
    expect(FLOORS.every(Boolean)).toBe(true);
    expect(warpsTo(F1, F2.id)).toHaveLength(5);
    expect(warpsTo(F2, F1.id)).toHaveLength(5);
    for (let n = 0; n < 5; n++) {
      const up = warpsTo(F1, F2.id)[n], down = warpsTo(F2, F1.id)[n];
      expect(sidesOf(F2, { x: up.targetX, y: up.targetY }), `1F ladder ${n} lands beside its 2F ladder`).toContainEqual(pos(down));
      expect(sidesOf(F1, { x: down.targetX, y: down.targetY }), `2F ladder ${n} lands beside its 1F ladder`).toContainEqual(pos(up));
    }
    expect(sidesOf(B1, b1FromE)).toContainEqual(b1e);
    expect(sidesOf(F1, landing(B1, F1, 0))).toContainEqual(f1e);
    const mouth = warpsTo(CITY, F1.id)[0];
    expect(sidesOf(F1, doorIn)).toContainEqual(pos(warpsTo(F1, CITY.id)[0]));
    expect(doorOut, 'leaving lands on the tile below the cave mouth').toEqual({ x: mouth.x, y: mouth.y + 1 });
    expect(CITY.tiles[mouth.y][mouth.x]).toBe(TileType.CAVE_ENTRANCE);
    for (const m of FLOORS) expect(m.name).toBe('CERULEAN CAVE');
  });

  it('the cave mouth is only open to the champion, and only reached by surfing the pool', () => {
    expect(F1.entryGates?.map(g => g.from)).toEqual([['cerulean_city']]);
    const st = (flags: Record<string, boolean>) => ({ storyFlags: flags, badges: [], defeatedTrainers: [], hasItem: () => false });
    expect(checkEntryGates(F1, CITY.id, st({})).ok).toBe(false);
    expect(checkEntryGates(F1, CITY.id, st({ champion: true })).ok).toBe(true);
    expect(checkEntryGates(F1, F2.id, st({})).ok, 'ladders are not gated').toBe(true);
    const mouth = pos(warpsTo(CITY, F1.id)[0]);
    const fromRoute24 = pos(CITY.warps.find(w => w.targetMap === 'route24')!);
    expect(CITY.tiles[doorOut.y][doorOut.x]).toBe(TileType.GRASS);
    expect(reach(CITY, fromRoute24, mouth, { surf: false })).toBe(false);
    expect(reach(CITY, fromRoute24, mouth, { surf: true })).toBe(true);
    expect(reach(CITY, doorOut, fromRoute24, { surf: true }), 'and back out').toBe(true);
  });

  describe('1F', () => {
    it('the ladder up (a) is across the lake: unreachable on foot, reachable surfing; the pocket ladders are on foot', () => {
      expect(reach(F1, doorIn, f1a, { surf: false })).toBe(false);
      expect(reach(F1, doorIn, f1a)).toBe(true);
      for (const l of [f1b, f1c, f1f]) expect(reach(F1, doorIn, l, { surf: false })).toBe(true);
    });
    it('the far side (d, e) is sealed from the entrance side even when surfing, and reaches nothing on the entrance side', () => {
      expect(reach(F1, doorIn, f1d)).toBe(false);
      expect(reach(F1, doorIn, f1e)).toBe(false);
      for (const g of [f1a, f1b, f1c, f1f, pos(warpsTo(F1, CITY.id)[0])]) expect(reach(F1, f1FromD, g), k(g)).toBe(false);
    });
    it('on the far side, d reaches e only by surfing the channel, and e reaches d', () => {
      expect(reach(F1, f1FromD, f1e, { surf: false })).toBe(false);
      expect(reach(F1, f1FromD, f1e)).toBe(true);
      expect(reach(F1, landing(B1, F1, 0), f1d)).toBe(true);
    });
    it('every pocket ladder lands the player on the entrance side, with the door in reach on foot', () => {
      const door = pos(warpsTo(F1, CITY.id)[0]);
      for (const p of [f1FromB, f1FromC, f1FromF]) expect(reach(F1, p, door, { surf: false }), k(p)).toBe(true);
    });
    it('the Cooltrainer guards the only corridor from the lake to the ladder up', () => {
      const t = npc(F1, 'cave_trainer1');
      expect(t.sightRange).toBe(1);
      expect(sidesOf(F1, t)).toEqual([front(F1, 'cave_trainer1')]);
      expect(reach(F1, doorIn, f1a, { alsoBlocked: [front(F1, 'cave_trainer1')] })).toBe(false);
    });
    it('the far side has an item of its own; the other two are on the entrance side, one across the lake', () => {
      const balls = F1.npcs.filter(n => n.isItemBall);
      expect(balls.map(b => b.itemId).sort()).toEqual(['full_restore', 'nugget', 'ultra_ball']);
      const far = balls.filter(b => reachNpc(F1, f1FromD, b.id)).map(b => b.itemId);
      expect(far).toEqual(['full_restore']);
      const onFoot = balls.filter(b => reachNpc(F1, doorIn, b.id, { surf: false })).map(b => b.itemId);
      expect(onFoot).toEqual(['nugget']);
      expect(reachNpc(F1, doorIn, balls.find(b => b.itemId === 'ultra_ball')!.id)).toBe(true);
    });
  });

  describe('2F: the ring of ledges', () => {
    it('the arrival reaches d, and every pocket ladder too', () => {
      for (const l of [f2d, f2b, f2c, f2f]) expect(reach(F2, f2FromA, l), k(l)).toBe(true);
    });
    it('is one-way: nobody who dropped into a pocket, or came back up d, gets back to a', () => {
      for (const p of [f2FromB, f2FromC, f2FromF, f2FromD]) expect(reach(F2, p, f2a), k(p)).toBe(false);
    });
    it('the wrong branches (b, c) are pockets whose only way out is their own ladder', () => {
      for (const [p, own] of [[f2FromB, f2b], [f2FromC, f2c]] as const) {
        const out = [f2a, f2b, f2c, f2f, f2d].filter(l => reach(F2, p, l));
        expect(out).toEqual([own]);
      }
    });
    it('coming back up d, the only way out is the last ledge down to f (the way home is a different way)', () => {
      const out = [f2a, f2b, f2c, f2f, f2d].filter(l => reach(F2, f2FromD, l));
      expect(out).toEqual([f2f, f2d]);
      expect([f2a, f2b, f2c, f2f, f2d].filter(l => reach(F2, f2FromF, l))).toEqual([f2f]);
    });
    it('no tile is a trap: everywhere the player can get to, some ladder is still in reach', () => {
      const ladders = [f2a, f2b, f2c, f2f, f2d];
      for (const start of [f2FromA, f2FromB, f2FromC, f2FromF, f2FromD]) {
        for (const key of reachSet(F2, start)) {
          const [x, y] = key.split(',').map(Number);
          expect(ladders.some(l => reach(F2, { x, y }, l)), `${key} reaches no ladder`).toBe(true);
        }
      }
    });
    it('the ledges are real: every LEDGE has floor above and below, and removing them all would let the player walk back to a', () => {
      const ledges: Pos[] = [];
      F2.tiles.forEach((row, y) => row.forEach((t, x) => { if (t === TileType.LEDGE) ledges.push({ x, y }); }));
      expect(ledges.length).toBeGreaterThanOrEqual(6);
      for (const l of ledges) {
        expect(F2.tiles[l.y - 1][l.x], `${k(l)} above`).toBe(TileType.CAVE_FLOOR);
        expect(F2.tiles[l.y + 1][l.x], `${k(l)} below`).toBe(TileType.CAVE_FLOOR);
      }
      const flat = { ...F2, tiles: F2.tiles.map(r => r.map(t => (t === TileType.LEDGE ? TileType.CAVE_FLOOR : t))) };
      expect(reach(flat, f2FromD, f2a)).toBe(true);
    });
    it('the Cooltrainer guards the corridor between the first and the last ledge', () => {
      const t = npc(F2, 'cave_trainer2');
      expect(t.sightRange).toBe(1);
      expect(sidesOf(F2, t)).toEqual([front(F2, 'cave_trainer2')]);
      expect(reach(F2, f2FromA, f2d, { alsoBlocked: [front(F2, 'cave_trainer2')] })).toBe(false);
    });
    it('has no water and no surf table', () => {
      expect(F2.tiles.flat().some(isWater)).toBe(false);
      expect(F2.surfEncounters).toBeUndefined();
    });
  });

  describe('B1F', () => {
    it('Mewtwo stands on land across the lake: unreachable on foot, reachable surfing, and the way back too', () => {
      expect(reachNpc(B1, b1FromE, 'mewtwo', { surf: false })).toBe(false);
      expect(reachNpc(B1, b1FromE, 'mewtwo')).toBe(true);
      const m = npc(B1, 'mewtwo');
      expect(B1.tiles[m.y][m.x]).toBe(TileType.CAVE_FLOOR);
      for (const s of sidesOf(B1, m)) expect(B1.tiles[s.y][s.x]).toBe(TileType.CAVE_FLOOR);
      expect(reach(B1, sidesOf(B1, m)[0], b1e)).toBe(true);
    });
    it('Mewtwo sits in a dead-end stub: its tall footprint blocks nothing the floor is for', () => {
      const m = npc(B1, 'mewtwo');
      // Mewtwo is `footprint: 'tall'`, so the engine blocks the tile above and
      // below its own as well (OverworldScene.npcBlocksTile) — the player talks
      // to it from two tiles up.
      expect(STATIC_LEGENDARIES.mewtwo.footprint).toBe('tall');
      const foot = [{ x: m.x, y: m.y - 1 }, { x: m.x, y: m.y + 1 }];
      const withMewtwo = reachSet(B1, b1FromE, undefined, { alsoBlocked: foot });
      const without = reachSet(B1, b1FromE, undefined, { pickedUp: ['mewtwo'] });
      for (const t of [m, ...foot]) expect(withMewtwo.has(k(t)), `${k(t)} walkable`).toBe(false);
      // The player still gets within talking distance of the footprint.
      expect(withMewtwo.has(k({ x: m.x, y: m.y - 2 }))).toBe(true);
      // Standing there only seals its own little stub, and that stub is empty:
      // no ladder, no item, nothing routes through it.
      const opened = [...without].filter(t => !withMewtwo.has(t));
      expect(opened).toContain(k(m));
      expect(opened).toContain(k(foot[0]));
      expect(opened.length).toBeLessThanOrEqual(5);
      for (const t of opened) {
        expect(B1.warps.some(w => k(w) === t), `warp at ${t}`).toBe(false);
        expect(B1.npcs.some(n => n.isItemBall && k(n) === t), `item ball at ${t}`).toBe(false);
      }
      // Everything the floor is for stays reachable with Mewtwo in place.
      for (const w of B1.warps) expect(reach(B1, b1FromE, w, { alsoBlocked: foot }), `warp ${k(w)}`).toBe(true);
      for (const b of B1.npcs.filter(n => n.isItemBall)) expect(reachNpc(B1, b1FromE, b.id, { alsoBlocked: foot }), b.id).toBe(true);
    });
    it('holds an ESCAPE ROPE on the way in and a REVIVE on an islet', () => {
      const balls = B1.npcs.filter(n => n.isItemBall);
      expect(balls.map(b => b.itemId).sort()).toEqual(['escape_rope', 'revive']);
      expect(reachNpc(B1, b1FromE, balls.find(b => b.itemId === 'escape_rope')!.id, { surf: false })).toBe(true);
      expect(reachNpc(B1, b1FromE, balls.find(b => b.itemId === 'revive')!.id, { surf: false })).toBe(false);
      expect(reachNpc(B1, b1FromE, balls.find(b => b.itemId === 'revive')!.id)).toBe(true);
    });
  });

  it('every ladder and the door is a one-tile stub off a corridor; every item ball sits in a dead end', () => {
    for (const m of FLOORS) {
      for (const w of m.warps) expect(sidesOf(m, w), `${m.id}: warp ${k(w)}`).toHaveLength(1);
      for (const n of m.npcs) if (n.isItemBall) expect(sidesOf(m, n), `${m.id}/${n.id}`).toHaveLength(1);
    }
  });

  it('the two Cooltrainers are the only trainers; every floor rolls its own table, deeper is stronger, and the lakes roll a surf table', () => {
    expect(FLOORS.flatMap(m => m.npcs.filter(n => n.isTrainer)).map(t => t.id).sort()).toEqual(['cave_trainer1', 'cave_trainer2']);
    const lo = (m: MapData) => Math.min(...m.wildEncounters!.encounters.map(e => e.minLevel));
    expect(lo(F1)).toBeLessThan(lo(F2));
    expect(lo(F2)).toBeLessThan(lo(B1));
    for (const m of [F1, B1]) {
      expect(m.surfEncounters).toBeDefined();
      expect(m.tiles.flat().some(isWater)).toBe(true);
    }
  });
});
