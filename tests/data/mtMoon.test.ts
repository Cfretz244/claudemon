// Mt. Moon walkthrough, proven on the real map data. The player walks cave
// floor; every NPC that is visible in the story state counts as solid (the
// trainers in their niches, item balls until picked up, the Rocket guard
// until Jessie & James are beaten, the fossil Super Nerd until he is), and so
// does every warp tile other than the goal (stepping on one leaves the
// floor). The puzzle: 1F's Route 4 half is sealed from its Route 3 half, B1F
// is four landings that never touch, and on B2F the fossil chamber sits
// beside the arrival ladder behind a wall, reached only by looping the floor
// past the guard (gone once Jessie is beaten) and the nerd (gone once he is).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { Pos } from '../../src/logic/boulders';
import { shouldSkipNPC } from '../../src/logic/npcVisibility';
import { checkEntryGates } from '../../src/logic/warpGate';
import { DIR_VECTORS } from '../../src/utils/constants';

const F1 = ALL_MAPS.mt_moon;
const B1 = ALL_MAPS.mt_moon_b1f;
const B2 = ALL_MAPS.mt_moon_b2f;
const ROUTE3 = ALL_MAPS.route3;
const ROUTE4 = ALL_MAPS.route4;
const FLOORS = [F1, B1, B2];

interface Story { storyFlags?: Record<string, boolean>; defeatedTrainers?: string[] }
const FRESH: Story = {};
const AFTER_JESSIE: Story = { defeatedTrainers: ['jessie_mtmoon'] };
const AFTER_NERD: Story = { defeatedTrainers: ['jessie_mtmoon', 'mt_moon_fossil_nerd'] };
const GOT_FOSSIL: Story = { ...AFTER_NERD, storyFlags: { got_fossil: true, picked_up_mt_moon_helix_fossil: true } };

const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const k = (p: Pos) => `${p.x},${p.y}`;
const npc = (map: MapData, id: string) => {
  const n = map.npcs.find(x => x.id === id);
  if (!n) throw new Error(`${map.id}: no NPC ${id}`);
  return n;
};
/** The NPCs standing on the map in a story state (what the scene would spawn). */
const standing = (map: MapData, story: Story) =>
  map.npcs.filter(n => !shouldSkipNPC(n, story.storyFlags ?? {}, [], story.defeatedTrainers ?? [], () => false));
/** Warps from `map` to `target`, in declaration order. */
const warpsTo = (map: MapData, target: string) => map.warps.filter(w => w.targetMap === target);
/** Tiles the player can stand on next to a position (floor, no standing NPC). */
const sidesOf = (map: MapData, p: Pos, story: Story = FRESH): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => s.x >= 0 && s.y >= 0 && s.x < map.width && s.y < map.height
      && !map.collision[s.y][s.x] && !standing(map, story).some(n => n.x === s.x && n.y === s.y));
/**
 * Every tile the player can end a move on from `from` in a story state.
 * Warps other than `goal` are never entered; `alsoBlocked` adds obstacles.
 */
function reachSet(map: MapData, from: Pos, goal?: Pos, opts: { story?: Story; alsoBlocked?: Pos[] } = {}): Set<string> {
  const solid = [...standing(map, opts.story ?? FRESH).map(n => ({ x: n.x, y: n.y })), ...(opts.alsoBlocked ?? [])];
  const enterable = (p: Pos) => {
    if (p.x < 0 || p.y < 0 || p.x >= map.width || p.y >= map.height) return false;
    if (map.collision[p.y][p.x] || solid.some(s => same(s, p))) return false;
    if (map.warps.some(w => same(w, p))) return !!goal && same(goal, p);
    return true;
  };
  const seen = new Set<string>([k(from)]);
  const queue = [from];
  while (queue.length) {
    const p = queue.shift()!;
    for (const d of Object.values(DIR_VECTORS)) {
      const n = { x: p.x + d.x, y: p.y + d.y };
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
  return sidesOf(map, npc(map, id), opts?.story).some(s => r.has(k(s)));
};
/** Where a warp lands the player: the warp on `from` to `to` at index n, read from its target. */
const landing = (from: MapData, to: MapData, n: number): Pos => {
  const w = warpsTo(from, to.id)[n];
  if (!w) throw new Error(`${from.id}: no warp ${n} to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const pos = (w: { x: number; y: number }): Pos => ({ x: w.x, y: w.y });
/** A trainer's watched tile. */
const front = (map: MapData, id: string): Pos => { const n = npc(map, id); const v = DIR_VECTORS[n.direction]; return { x: n.x + v.x, y: n.y + v.y }; };

// Landmarks. 1F's ladders to B1F are, in order, a (the way on), b, c (side
// landings) and d (the exit half). B1F's ladders up follow the same order;
// its ladders down are p, q, r, s (p under a's landing ... s under d's). B2F's
// ladders up are p (the arrival), q, r (the pockets) and s (the way home).
const [f1a, f1b, f1c, f1d] = warpsTo(F1, B1.id).map(pos);
const [b1a, b1b, b1c, b1d] = warpsTo(B1, F1.id).map(pos);
const [b1p, b1q, b1r, b1s] = warpsTo(B1, B2.id).map(pos);
const [b2p, b2q, b2r, b2s] = warpsTo(B2, B1.id).map(pos);
const mouthSouth = pos(warpsTo(F1, ROUTE3.id)[0]);
const mouthNorth = pos(warpsTo(F1, ROUTE4.id)[0]);
const fromRoute3 = landing(ROUTE3, F1, 0);
const fromRoute4 = landing(ROUTE4, F1, 0);
const b1FromA = landing(F1, B1, 0), b1FromB = landing(F1, B1, 1), b1FromC = landing(F1, B1, 2), b1FromD = landing(F1, B1, 3);
const f1FromA = landing(B1, F1, 0), f1FromB = landing(B1, F1, 1), f1FromC = landing(B1, F1, 2), f1FromD = landing(B1, F1, 3);
const b2FromP = landing(B1, B2, 0), b2FromQ = landing(B1, B2, 1), b2FromR = landing(B1, B2, 2), b2FromS = landing(B1, B2, 3);
const b1FromP = landing(B2, B1, 0), b1FromQ = landing(B2, B1, 1), b1FromR = landing(B2, B1, 2), b1FromS = landing(B2, B1, 3);

describe('Mt. Moon', () => {
  it('is three floors: eight ladders wired both ways, landing beside each other\'s tile; the mouths open onto Routes 3 and 4', () => {
    expect(FLOORS.every(Boolean)).toBe(true);
    expect(warpsTo(F1, B1.id)).toHaveLength(4);
    expect(warpsTo(B1, F1.id)).toHaveLength(4);
    expect(warpsTo(B1, B2.id)).toHaveLength(4);
    expect(warpsTo(B2, B1.id)).toHaveLength(4);
    for (let n = 0; n < 4; n++) {
      const down = warpsTo(F1, B1.id)[n], up = warpsTo(B1, F1.id)[n];
      expect(sidesOf(B1, { x: down.targetX, y: down.targetY }), `1F ladder ${n} lands beside its B1F ladder`).toContainEqual(pos(up));
      expect(sidesOf(F1, { x: up.targetX, y: up.targetY }), `B1F ladder ${n} lands beside its 1F ladder`).toContainEqual(pos(down));
      const down2 = warpsTo(B1, B2.id)[n], up2 = warpsTo(B2, B1.id)[n];
      expect(sidesOf(B2, { x: down2.targetX, y: down2.targetY }), `B1F ladder ${n} down lands beside its B2F ladder`).toContainEqual(pos(up2));
      expect(sidesOf(B1, { x: up2.targetX, y: up2.targetY }), `B2F ladder ${n} lands beside its B1F ladder`).toContainEqual(pos(down2));
    }
    expect(sidesOf(F1, fromRoute3)).toContainEqual(mouthSouth);
    expect(sidesOf(F1, fromRoute4)).toContainEqual(mouthNorth);
    expect(landing(F1, ROUTE3, 0).x, 'the south mouth leads to the tile inside Route 3\'s east edge').toBe(ROUTE3.width - 2);
    expect(landing(F1, ROUTE4, 0), 'the north mouth leads to the west end of Route 4\'s path').toEqual({ x: 2, y: 5 });
    for (const w of [...F1.warps, ...B1.warps, ...B2.warps]) {
      const target = ALL_MAPS[w.targetMap];
      expect(target.collision[w.targetY][w.targetX], `${w.targetMap} ${w.targetX},${w.targetY} is walkable`).toBe(false);
    }
  });

  it('every ladder stands in a one-tile stub, every item ball in a dead end, every trainer in a niche watching its only neighbour', () => {
    for (const m of FLOORS) {
      for (const w of m.warps) expect(sidesOf(m, pos(w)), `${m.id} warp ${k(w)}`).toHaveLength(1);
      for (const n of m.npcs) {
        if (n.isItemBall) expect(sidesOf(m, n, GOT_FOSSIL), `${m.id} ${n.id}`).toHaveLength(1);
        if (n.isTrainer) {
          expect(n.sightRange, `${m.id} ${n.id} sight`).toBe(1);
          const sides = sidesOf(m, n, n.id === 'mt_moon_fossil_nerd' ? AFTER_JESSIE : FRESH);
          if (n.id === 'mt_moon_fossil_nerd') expect(sides, 'the nerd stands in the corridor').toHaveLength(2);
          else expect(sides, `${m.id} ${n.id} niche`).toEqual([front(m, n.id)]);
        }
      }
    }
    expect(F1.npcs.filter(n => n.isTrainer)).toHaveLength(4);
    expect(B1.npcs.filter(n => n.isTrainer)).toHaveLength(3);
    expect(B2.npcs.filter(n => n.isTrainer).map(n => n.id).sort()).toEqual(['jessie_mtmoon', 'mt_moon_fossil_nerd', 'mt_moon_rocket4', 'mt_moon_rocket5']);
  });

  it('the north mouth is closed until a fossil is taken (Route 4\'s entry gate)', () => {
    const st = (flags: Record<string, boolean>) => ({ storyFlags: flags, badges: [], defeatedTrainers: [], hasItem: () => false });
    expect(checkEntryGates(ROUTE4, F1.id, st({})).ok).toBe(false);
    expect(checkEntryGates(ROUTE4, F1.id, st({ got_fossil: true })).ok).toBe(true);
    expect(checkEntryGates(F1, ROUTE3.id, st({})).ok, 'the south mouth is never gated').toBe(true);
  });

  describe('1F: two sealed halves', () => {
    it('from Route 3 the ladders a, b, c are in reach; d and the north mouth are not', () => {
      for (const l of [f1a, f1b, f1c]) expect(reach(F1, fromRoute3, l), k(l)).toBe(true);
      expect(reach(F1, fromRoute3, f1d)).toBe(false);
      expect(reach(F1, fromRoute3, mouthNorth)).toBe(false);
    });
    it('from d (the way home) the north mouth is in reach; a, b, c and the south mouth are not', () => {
      expect(reach(F1, f1FromD, mouthNorth)).toBe(true);
      for (const g of [f1a, f1b, f1c, mouthSouth]) expect(reach(F1, f1FromD, g), k(g)).toBe(false);
      expect(reach(F1, fromRoute4, f1d), 'and coming in from Route 4 leads only down d').toBe(true);
      expect(reach(F1, fromRoute4, mouthSouth)).toBe(false);
    });
    it('the side ladders b and c land the player back on the entrance half, with the south mouth in reach', () => {
      for (const p of [f1FromA, f1FromB, f1FromC]) expect(reach(F1, p, mouthSouth), k(p)).toBe(true);
    });
    it('each trainer guards a ladder: the Bug Catcher b, the Hiker c, the Lass and the Rocket a', () => {
      const cut = (id: string, goal: Pos) => !reach(F1, fromRoute3, goal, { alsoBlocked: [front(F1, id)] });
      expect(cut('mt_moon_bug_catcher', f1b)).toBe(true);
      expect(cut('mt_moon_hiker', f1c)).toBe(true);
      expect(cut('mt_moon_lass', f1a)).toBe(true);
      expect(cut('mt_moon_rocket1', f1a)).toBe(true);
    });
    it('the RARE CANDY is on the exit half; the POTION and ESCAPE ROPE on the entrance half; the scientist too', () => {
      const balls = F1.npcs.filter(n => n.isItemBall);
      expect(balls.map(b => b.itemId).sort()).toEqual(['escape_rope', 'potion', 'rare_candy']);
      expect(balls.filter(b => reachNpc(F1, f1FromD, b.id)).map(b => b.itemId)).toEqual(['rare_candy']);
      expect(balls.filter(b => reachNpc(F1, fromRoute3, b.id)).map(b => b.itemId).sort()).toEqual(['escape_rope', 'potion']);
      expect(reachNpc(F1, fromRoute3, 'mt_moon_scientist')).toBe(true);
    });
  });

  describe('B1F: four landings that never touch', () => {
    const landings: [string, Pos, Pos, Pos][] = [['a', b1FromA, b1a, b1p], ['b', b1FromB, b1b, b1q], ['c', b1FromC, b1c, b1r], ['d', b1FromD, b1d, b1s]];
    it('each landing reaches its own ladder up and its own ladder down, and no other', () => {
      const all = [b1a, b1b, b1c, b1d, b1p, b1q, b1r, b1s];
      for (const [name, from, up, down] of landings) {
        const out = all.filter(l => reach(B1, from, l));
        expect(out, `landing ${name}`).toEqual([up, down]);
      }
      for (const [name, from] of [['p', b1FromP], ['q', b1FromQ], ['r', b1FromR], ['s', b1FromS]] as const) {
        expect(all.filter(l => reach(B1, from, l)), `coming up ${name}`).toHaveLength(2);
      }
    });
    it('a Rocket guards the way on (a to p), the Super Nerd b to q, another Rocket c to r; d to s is quiet', () => {
      expect(reach(B1, b1FromA, b1p, { alsoBlocked: [front(B1, 'mt_moon_rocket2')] })).toBe(false);
      expect(reach(B1, b1FromB, b1q, { alsoBlocked: [front(B1, 'mt_moon_super_nerd')] })).toBe(false);
      expect(reach(B1, b1FromC, b1r, { alsoBlocked: [front(B1, 'mt_moon_rocket3')] })).toBe(false);
      expect(B1.npcs.filter(n => n.isTrainer && reachNpc(B1, b1FromD, n.id))).toEqual([]);
    });
    it('the REVIVE is on the way on', () => {
      expect(B1.npcs.filter(n => n.isItemBall).map(n => n.itemId)).toEqual(['revive']);
      expect(reachNpc(B1, b1FromA, 'mt_moon_b1f_revive')).toBe(true);
    });
  });

  describe('B2F: the fossil chamber', () => {
    it('from p, the two Rockets, the guard and Jessie\'s watched tile are in reach; the nerd and the fossils are not while the guard stands', () => {
      for (const id of ['mt_moon_rocket4', 'mt_moon_rocket5', 'mt_moon_rocket_guard']) expect(reachNpc(B2, b2FromP, id), id).toBe(true);
      expect(reachSet(B2, b2FromP).has(k(front(B2, 'jessie_mtmoon')))).toBe(true);
      expect(reachNpc(B2, b2FromP, 'mt_moon_fossil_nerd')).toBe(false);
      expect(reach(B2, b2FromP, b2s)).toBe(false);
    });
    it('the guard really blocks: with him gone (Jessie beaten) the nerd is in reach, but the chamber and s still are not', () => {
      expect(standing(B2, AFTER_JESSIE).map(n => n.id)).not.toContain('mt_moon_rocket_guard');
      expect(reachNpc(B2, b2FromP, 'mt_moon_fossil_nerd', { story: AFTER_JESSIE })).toBe(true);
      expect(reach(B2, b2FromP, b2s, { story: AFTER_JESSIE })).toBe(false);
      for (const id of ['mt_moon_helix_fossil', 'mt_moon_dome_fossil']) expect(standing(B2, AFTER_JESSIE).map(n => n.id), 'fossils hidden').not.toContain(id);
    });
    it('with the nerd beaten both fossils appear, each in its own stub, and s is in reach past them', () => {
      const ids = standing(B2, AFTER_NERD).map(n => n.id);
      expect(ids).not.toContain('mt_moon_fossil_nerd');
      expect(ids).toContain('mt_moon_helix_fossil');
      expect(ids).toContain('mt_moon_dome_fossil');
      for (const id of ['mt_moon_helix_fossil', 'mt_moon_dome_fossil']) expect(reachNpc(B2, b2FromP, id, { story: AFTER_NERD }), id).toBe(true);
      expect(reach(B2, b2FromP, b2s, { story: AFTER_NERD })).toBe(true);
      expect(standing(B2, GOT_FOSSIL).filter(n => n.isItemBall && n.itemId?.endsWith('fossil')), 'taking one removes both').toEqual([]);
    });
    it('the Rockets each guard the way to Jessie; the way home (s) is two tiles from the arrival and reaches p', () => {
      const j = front(B2, 'jessie_mtmoon');
      expect(reachSet(B2, b2FromP, undefined, { alsoBlocked: [front(B2, 'mt_moon_rocket4')] }).has(k(j))).toBe(false);
      expect(reachSet(B2, b2FromP, undefined, { alsoBlocked: [front(B2, 'mt_moon_rocket5')] }).has(k(j))).toBe(false);
      expect(Math.abs(b2s.x - b2p.x) + Math.abs(b2s.y - b2p.y)).toBe(2);
      expect(reach(B2, b2FromS, b2p, { story: GOT_FOSSIL })).toBe(true);
      expect(reach(B2, b2FromS, b2p, { story: FRESH }), 'but not past a standing nerd').toBe(false);
    });
    it('q and r are pockets: one item each, no way out but their own ladder', () => {
      const all = [b2p, b2q, b2r, b2s];
      for (const [name, from, own, item] of [['q', b2FromQ, b2q, 'super_potion'], ['r', b2FromR, b2r, 'tm12_water_gun']] as const) {
        expect(all.filter(l => reach(B2, from, l)), name).toEqual([own]);
        const balls = B2.npcs.filter(n => n.isItemBall && reachNpc(B2, from, n.id, { story: AFTER_NERD }));
        expect(balls.map(b => b.itemId), name).toEqual([item]);
      }
    });
    it('no tile is a trap: everywhere the player can get to in any story state, some ladder is still in reach', () => {
      const ladders = [b2p, b2q, b2r, b2s];
      for (const story of [FRESH, AFTER_JESSIE, AFTER_NERD, GOT_FOSSIL]) {
        for (const start of [b2FromP, b2FromQ, b2FromR, b2FromS]) {
          for (const key of reachSet(B2, start, undefined, { story })) {
            const [x, y] = key.split(',').map(Number);
            expect(ladders.some(l => reach(B2, { x, y }, l, { story })), `${key} reaches no ladder`).toBe(true);
          }
        }
      }
    });
  });

  it('the whole walkthrough: Route 3 -> a -> p -> Jessie -> the nerd -> a fossil -> s -> d -> Route 4', () => {
    expect(reach(F1, fromRoute3, f1a)).toBe(true);
    expect(reach(B1, b1FromA, b1p)).toBe(true);
    expect(reachSet(B2, b2FromP).has(k(front(B2, 'jessie_mtmoon')))).toBe(true);
    expect(reachSet(B2, b2FromP, undefined, { story: AFTER_JESSIE }).has(k(front(B2, 'mt_moon_fossil_nerd')))).toBe(true);
    expect(reachNpc(B2, b2FromP, 'mt_moon_helix_fossil', { story: AFTER_NERD })).toBe(true);
    expect(reach(B2, b2FromP, b2s, { story: GOT_FOSSIL })).toBe(true);
    expect(reach(B1, b1FromS, b1d)).toBe(true);
    expect(reach(F1, f1FromD, mouthNorth)).toBe(true);
    expect(F1.tiles.every(row => row.every(t => t === TileType.CAVE_WALL || t === TileType.CAVE_FLOOR || t === TileType.CAVE_ENTRANCE))).toBe(true);
  });
});
