// Rocket Hideout walkthrough, proven on the real map data with the solver
// (src/logic/boulders.ts), which rides the spin tiles the way the scene does.
// Every NPC counts as solid (grunts in their niches, item balls until picked
// up) and so does every warp tile other than the goal (stepping on one leaves
// the floor). The spinner floors must need their arrows: with every arrow
// turned into a wall the stairs down are unreachable.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { canReach, Pos, SolveOptions } from '../../src/logic/boulders';
import { computeSlide } from '../../src/logic/spinTiles';
import { elevatorAccess } from '../../src/logic/elevator';
import { GateState } from '../../src/logic/warpGate';
import { DIR_VECTORS } from '../../src/utils/constants';

const B1F = ALL_MAPS.rocket_hideout_b1f, B2F = ALL_MAPS.rocket_hideout_b2f, B3F = ALL_MAPS.rocket_hideout_b3f, B4F = ALL_MAPS.rocket_hideout_b4f;
const FLOORS = [B1F, B2F, B3F, B4F];

const warpTo = (map: MapData, target: string): Pos => {
  const w = map.warps.find(x => x.targetMap === target);
  if (!w) throw new Error(`${map.id}: no warp to ${target}`);
  return { x: w.x, y: w.y };
};
const landing = (from: MapData, to: MapData): Pos => {
  const w = from.warps.find(x => x.targetMap === to.id);
  if (!w) throw new Error(`${from.id}: no warp to ${to.id}`);
  return { x: w.targetX, y: w.targetY };
};
const npc = (map: MapData, id: string) => {
  const n = map.npcs.find(x => x.id === id);
  if (!n) throw new Error(`${map.id}: no NPC ${id}`);
  return n;
};
const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;
const arrows = (map: MapData): Pos[] => Object.keys(map.spinTiles ?? {}).map(k => { const [x, y] = k.split(',').map(Number); return { x, y }; });
/** The tile in front of a trainer: where the player is spotted from. */
const front = (map: MapData, id: string): Pos => { const n = npc(map, id); const v = DIR_VECTORS[n.direction]; return { x: n.x + v.x, y: n.y + v.y }; };
/** Tiles the player can stand on next to an NPC (walkable, no other NPC). */
const sidesOf = (map: MapData, p: Pos): Pos[] =>
  Object.values(DIR_VECTORS).map(d => ({ x: p.x + d.x, y: p.y + d.y }))
    .filter(s => s.x >= 0 && s.y >= 0 && s.x < map.width && s.y < map.height && !map.collision[s.y][s.x] && !map.npcs.some(n => n.x === s.x && n.y === s.y));
/** Walk from a to b; `pickedUp` removes item balls, `alsoBlocked` adds obstacles, `noArrows` turns every arrow into a wall. */
const reach = (map: MapData, a: Pos, b: Pos, opts: SolveOptions & { pickedUp?: string[]; alsoBlocked?: Pos[]; noArrows?: boolean } = {}) => {
  const npcs = map.npcs.filter(n => !(opts.pickedUp ?? []).includes(n.id)).map(n => ({ x: n.x, y: n.y }));
  const warps = map.warps.filter(w => !same(w, b)).map(w => ({ x: w.x, y: w.y }));
  const r = canReach(map, a, b, { ...opts, blocked: [...npcs, ...warps, ...(opts.alsoBlocked ?? []), ...(opts.noArrows ? arrows(map) : [])] });
  expect(r.exhausted, `${map.id}: solver hit the state cap`).toBe(false);
  return r.found;
};
const reachNpc = (map: MapData, from: Pos, id: string, opts?: Parameters<typeof reach>[3]) => sidesOf(map, npc(map, id)).some(s => reach(map, from, s, opts));
const elevatorLanding = (map: MapData): Pos => { const f = map.elevator!.floors.find(x => x.targetMap === map.id)!; return { x: f.targetX, y: f.targetY }; };
const state = (items: string[] = []): GateState => ({ storyFlags: {}, badges: [], defeatedTrainers: [], hasItem: id => items.includes(id) });

// Landmarks
const entrance = landing(ALL_MAPS.game_corner, B1F);
const up = (m: MapData, above: MapData) => warpTo(m, above.id);     // stairs up on m
const down = (m: MapData, below: MapData) => warpTo(m, below.id);   // stairs down on m
const arrive = (m: MapData, above: MapData) => landing(above, m);   // where the stairs from above land on m

describe('Rocket Hideout', () => {
  it('the stairs land on the other floor\'s stairs tile, so every floor can be left the way it was entered; the Game Corner stairs go both ways', () => {
    expect(FLOORS.every(Boolean)).toBe(true);
    for (const [a, b] of [[B1F, B2F], [B2F, B3F], [B3F, B4F]]) {
      expect(landing(a, b), `${a.id} -> ${b.id}`).toEqual(up(b, a));
      expect(landing(b, a), `${b.id} -> ${a.id}`).toEqual(down(a, b));
    }
    expect(landing(B1F, ALL_MAPS.game_corner)).toEqual(warpTo(ALL_MAPS.game_corner, B1F.id));
    expect(B1F.tiles[entrance.y][entrance.x]).toBe(TileType.DOOR);
  });

  it('B1F: a plain maze from the entrance to the stairs down and the elevator; both grunts watch the only way', () => {
    expect(reach(B1F, entrance, down(B1F, B2F))).toBe(true);
    expect(reach(B1F, entrance, elevatorLanding(B1F))).toBe(true);
    expect(reach(B1F, arrive(B1F, B2F), up(B1F, ALL_MAPS.game_corner))).toBe(true);
    expect(reach(B1F, elevatorLanding(B1F), down(B1F, B2F))).toBe(true);
    for (const id of ['rocket_hideout_b1f_grunt1', 'rocket_hideout_b1f_grunt2']) {
      expect(reach(B1F, entrance, down(B1F, B2F), { alsoBlocked: [front(B1F, id)] }), `${id} can be walked around`).toBe(false);
    }
  });

  it('B2F: the stairs down need the arrows; every landing reaches every exit; the grunts guard the stops the route must stand on', () => {
    const u = arrive(B2F, B1F), d = down(B2F, B3F), l = elevatorLanding(B2F), back = up(B2F, B1F);
    expect(reach(B2F, u, d, { noArrows: true }), 'the stairs are reachable without riding').toBe(false);
    expect(reach(B2F, u, d)).toBe(true);
    for (const from of [u, arrive(B2F, B3F), l]) {
      expect(reach(B2F, from, d), `${from.x},${from.y} -> stairs down`).toBe(true);
      expect(reach(B2F, from, back), `${from.x},${from.y} -> stairs up`).toBe(true);
      expect(reach(B2F, from, l), `${from.x},${from.y} -> elevator`).toBe(true);
    }
    for (const id of ['rocket_hideout_b2f_grunt1', 'rocket_hideout_b2f_grunt2']) {
      expect(reach(B2F, u, d, { alsoBlocked: [front(B2F, id)] }), `${id} can be ridden past`).toBe(false);
    }
    // the arrow below the stop at (13,7) rides straight onto the stairs
    const s = computeSlide(B2F, 13, 8, (x, y) => B2F.collision[y][x]);
    expect(s.end).toBe('warp');
    expect(s.path[s.path.length - 1]).toMatchObject(d);
  });

  it('B3F: the stairs down need the arrows; the grunt and Jessie & James sit at the stops the route must stand on; both stairs reach each other', () => {
    const u = arrive(B3F, B2F), d = down(B3F, B4F), back = up(B3F, B2F);
    expect(reach(B3F, u, d, { noArrows: true }), 'the stairs are reachable without riding').toBe(false);
    expect(reach(B3F, u, d)).toBe(true);
    expect(reach(B3F, arrive(B3F, B4F), back)).toBe(true);
    for (const id of ['rocket_hideout_b3f_grunt1', 'jessie_gamecorner']) {
      expect(reach(B3F, u, d, { alsoBlocked: [front(B3F, id)] }), `${id} can be ridden past`).toBe(false);
    }
    const jessie = npc(B3F, 'jessie_gamecorner'), james = npc(B3F, 'james_gamecorner');
    expect(B3F.collision[jessie.y][jessie.x] && B3F.collision[james.y][james.x], 'Jessie & James sit at desks (solid), so their leaving opens nothing').toBe(true);
    expect(B3F.elevator).toBeUndefined();
  });

  it('B4F: the stairs side ends at the LIFT KEY past a grunt; only the elevator lands on Giovanni\'s side, past two more; the halves never meet', () => {
    const u = arrive(B4F, B3F), l = elevatorLanding(B4F), back = up(B4F, B3F);
    const key = npc(B4F, 'rocket_hideout_lift_key');
    expect(key.isItemBall && key.itemId).toBe('lift_key');
    expect(reachNpc(B4F, u, 'rocket_hideout_lift_key')).toBe(true);
    expect(reach(B4F, u, back, { pickedUp: ['rocket_hideout_lift_key'] })).toBe(true);
    expect(reachNpc(B4F, u, 'rocket_hideout_lift_key', { alsoBlocked: [front(B4F, 'rocket_hideout_b4f_grunt1')] })).toBe(false);
    expect(reach(B4F, u, l), 'the stairs side reaches the elevator side').toBe(false);
    expect(reachNpc(B4F, u, 'giovanni_game_corner'), 'Giovanni can be reached without the elevator').toBe(false);
    expect(reachNpc(B4F, l, 'giovanni_game_corner')).toBe(true);
    expect(reachNpc(B4F, l, 'rocket_hideout_lift_key')).toBe(false);
    expect(reach(B4F, l, back)).toBe(false);
    for (const id of ['rocket_hideout_b4f_grunt2', 'rocket_hideout_b4f_grunt3']) {
      expect(reachNpc(B4F, l, 'giovanni_game_corner', { alsoBlocked: [front(B4F, id)] }), `${id} can be walked around`).toBe(false);
    }
    // Giovanni leaving opens nothing: his office is a dead end
    expect(reach(B4F, l, npc(B4F, 'giovanni_game_corner'), { pickedUp: ['giovanni_game_corner'] })).toBe(true);
    expect(reach(B4F, l, back, { pickedUp: ['giovanni_game_corner'] })).toBe(false);
  });

  it('the elevator needs the LIFT KEY and then stops at B1F, B2F and B4F, each landing next to that floor\'s elevator door', () => {
    for (const m of [B1F, B2F, B4F]) {
      expect(elevatorAccess(m, state()).ok).toBe(false);
      const access = elevatorAccess(m, state(['lift_key']));
      expect(access.ok && access.floors.map(f => f.label)).toEqual(['B1F', 'B2F', 'B4F']);
      const l = elevatorLanding(m);
      const door = npc(m, `elevator_${m.id.slice(-3)}`);
      expect(Math.abs(door.x - l.x) + Math.abs(door.y - l.y), `${m.id}: the elevator door is next to its landing`).toBe(1);
    }
  });

  it('every trainer stands in a one-tile niche with sight range 1, facing its only open side; Giovanni faces into his office', () => {
    for (const m of FLOORS) for (const n of m.npcs) {
      if (!n.isTrainer) continue;
      expect(n.sightRange, `${m.id}/${n.id}`).toBe(1);
      const f = front(m, n.id);
      expect(m.collision[f.y]?.[f.x], `${m.id}/${n.id} faces a wall`).toBe(false);
      if (n.id === 'giovanni_game_corner') continue;
      const open = sidesOf(m, n);
      expect(open, `${m.id}/${n.id} is not in a niche`).toEqual([f]);
    }
  });

  it('item balls sit in dead ends with no arrow beside them, so picking one up never strands the player', () => {
    for (const m of FLOORS) for (const n of m.npcs) {
      if (!n.isItemBall) continue;
      const open = sidesOf(m, n);
      expect(open, `${m.id}/${n.id} is not in a dead end`).toHaveLength(1);
      expect(m.spinTiles?.[`${open[0].x},${open[0].y}`], `${m.id}/${n.id} has an arrow in front of it`).toBeUndefined();
    }
  });

  it('every stairs tile is a one-tile stub off a corridor with no arrow next to it (arrows ride onto stairs on purpose only from below the B2F stop)', () => {
    for (const m of FLOORS) for (const w of m.warps) {
      const open = sidesOf(m, w);
      expect(open, `${m.id}: warp ${w.x},${w.y}`).toHaveLength(1);
    }
  });
});
