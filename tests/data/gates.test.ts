// Switch plates and gates must be wired consistently in every map, and every
// gated map must be completable from each of its entrances by pushing
// boulders. A plate may also be pressed by a boulder dropped through a hole on
// another floor: exits are checked with every such boulder landed, and the
// floor above must be able to drop it. The first gated dungeon is Victory Road.
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { MapData, TileType } from '../../src/types/map.types';
import { canDropBoulders, canPressPlate, canReach, dropFlag, instantiateMap, landedBoulders, reachableFlags, statueToggles, tileUnder } from '../../src/logic/boulders';

/** Dungeon family root: victory_road_2f, seafoam_b1f, pokemon_tower_3f -> victory_road, seafoam, pokemon_tower. */
const root = (id: string) => id.replace(/_b?\d+f$/, '');

/** Maps with a boulder puzzle: gates/plates, or holes (drops that change another floor). */
const gatedMaps = Object.values(ALL_MAPS).filter(m => (m.gates?.length ?? 0) > 0 || (m.holes?.length ?? 0) > 0 ||
  m.tiles.some(row => row.some(t => t === TileType.SWITCH_PLATE || t === TileType.GATE)));

describe('switch plates and gates', () => {
  it('every gate entry sits on a GATE tile and is opened by exactly one of a SWITCH_PLATE or a flag; every such tile is wired', () => {
    for (const map of Object.values(ALL_MAPS)) {
      const gateTiles = new Set<string>();
      const plateTiles = new Set<string>();
      map.tiles.forEach((row, y) => row.forEach((t, x) => {
        if (t === TileType.GATE) gateTiles.add(`${x},${y}`);
        if (t === TileType.SWITCH_PLATE) plateTiles.add(`${x},${y}`);
      }));
      const wiredGates = new Set<string>();
      const wiredPlates = new Set<string>();
      let plateGates = 0;
      for (const g of map.gates ?? []) {
        expect(map.tiles[g.y]?.[g.x], `${map.id}: gate ${g.x},${g.y} is not a GATE tile`).toBe(TileType.GATE);
        expect(map.collision[g.y][g.x], `${map.id}: gate ${g.x},${g.y} must be solid in the base data`).toBe(true);
        expect(!!g.switch !== !!g.flag, `${map.id}: gate ${g.x},${g.y} needs exactly one of switch / flag`).toBe(true);
        wiredGates.add(`${g.x},${g.y}`);
        if (g.switch) {
          plateGates++;
          expect(map.tiles[g.switch.y]?.[g.switch.x], `${map.id}: switch ${g.switch.x},${g.switch.y} is not a SWITCH_PLATE`).toBe(TileType.SWITCH_PLATE);
          expect(map.collision[g.switch.y][g.switch.x], `${map.id}: plate ${g.switch.x},${g.switch.y} must be walkable`).toBe(false);
          wiredPlates.add(`${g.switch.x},${g.switch.y}`);
        } else {
          expect(g.closedWhenSet === undefined || typeof g.closedWhenSet === 'boolean', `${map.id}: gate ${g.x},${g.y} closedWhenSet`).toBe(true);
        }
      }
      expect([...gateTiles].sort(), `${map.id}: GATE tiles without a gates[] entry`).toEqual([...wiredGates].sort());
      expect([...plateTiles].sort(), `${map.id}: SWITCH_PLATE tiles no gate is wired to`).toEqual([...wiredPlates].sort());
      if (plateGates > 0) {
        expect(map.tiles.flat().filter(t => t === TileType.BOULDER).length, `${map.id}: plate gates but no boulder to press a plate`).toBeGreaterThan(0);
      }
    }
  });

  it('every flag gate has a statue switch on the same map, and every statue switch drives a gate there', () => {
    for (const map of Object.values(ALL_MAPS)) {
      const gateFlags = new Set((map.gates ?? []).flatMap(g => (g.flag ? [g.flag] : [])));
      const statueFlags = new Set(map.npcs.flatMap(n => (n.toggleFlag ? [n.toggleFlag] : [])));
      expect([...gateFlags].sort(), `${map.id}: flag gates and statue switches (toggleFlag) do not match`).toEqual([...statueFlags].sort());
      for (const n of map.npcs) {
        if (!n.toggleFlag) continue;
        expect(n.isTrainer, `${map.id}/${n.id}: a statue switch cannot be a trainer`).toBeFalsy();
        expect(n.isItemBall, `${map.id}/${n.id}: a statue switch cannot be an item ball`).toBeFalsy();
      }
    }
  });

  it('each gated dungeon is completable: walking its floors and taking its ladders, every warp is reachable from its outside entrances', () => {
    // A dungeon is the family of maps sharing an id root (victory_road,
    // victory_road_2f, ...). Reachability is computed to a fixpoint: a plate
    // stays pressed once the player could press it from a landing they have
    // reached (Gen I locks boulders on switches), a hole's boulder stays
    // dropped once it could be dropped (a boulder landed from the floor above
    // counts, so drops chain down through the floors), and every ladder
    // landing reached opens that floor. Statue switches (flag gates) are part
    // of the search: the player may press any statue they can walk up to, and
    // a floor is left in whatever switch state it had when a warp was taken,
    // which is what the next visit starts from (tracked per floor, since each
    // floor's statues drive only its own gates). Starting from every outside
    // entrance at once models a player
    // who has been through in whatever order; the per-dungeon walkthrough
    // tests pin the intended order. Every NPC is an obstacle (trainers keep
    // blocking after the battle, item balls until picked up), and so is every
    // warp tile other than the one being walked to (stepping on it leaves).
    const families = new Map<string, MapData[]>();
    for (const m of Object.values(ALL_MAPS)) families.set(root(m.id), [...(families.get(root(m.id)) ?? []), m]);
    for (const familyRoot of new Set(gatedMaps.map(m => root(m.id)))) {
      const gated = { id: familyRoot };
      const family = families.get(familyRoot)!;
      const inFamily = (id: string) => root(id) === familyRoot;
      const reached = new Map<string, Set<string>>(family.map(m => [m.id, new Set()]));
      const pressed = new Map<string, Set<string>>(family.map(m => [m.id, new Set()]));
      // switch states (story flags of this floor's statues) a floor has been left in, by canonical key
      const switchStates = new Map<string, Map<string, Record<string, boolean>>>(family.map(m => [m.id, new Map([['', {}]])]));
      const flagKey = (f: Record<string, boolean>) => Object.keys(f).filter(x => f[x]).sort().join(',');
      const dropFlags: Record<string, boolean> = {};
      const k = (p: { x: number; y: number }) => `${p.x},${p.y}`;
      let entrances = 0;
      for (const m of Object.values(ALL_MAPS)) {
        if (inFamily(m.id)) continue;
        for (const w of m.warps) if (inFamily(w.targetMap)) { reached.get(w.targetMap)!.add(k({ x: w.targetX, y: w.targetY })); entrances++; }
      }
      expect(entrances, `${gated.id}: dungeon has no outside entrance`).toBeGreaterThan(0);
      const liveMap = (m: MapData): MapData => {
        const live = instantiateMap(m, {}, landedBoulders(ALL_MAPS, m.id, dropFlags)).map;
        for (const g of m.gates ?? []) {
          if (g.flag) {
            // Flag gates stay GATE tiles here: the solver opens and closes them by the switch state of each search state.
            live.tiles[g.y][g.x] = TileType.GATE;
            live.collision[g.y][g.x] = true;
            continue;
          }
          if (!g.switch || !pressed.get(m.id)!.has(k(g.switch))) continue;
          live.tiles[g.y][g.x] = tileUnder(m, g.x, g.y);
          live.collision[g.y][g.x] = false;
        }
        return { ...live, gates: (m.gates ?? []).filter(g => !(g.switch && pressed.get(m.id)!.has(k(g.switch)))) };
      };
      const solve = <T>(m: MapData, run: () => T & { exhausted: boolean }) => { const r = run(); expect(r.exhausted, `${m.id}: solver hit the state cap`).toBe(false); return r; };
      for (let changed = true, rounds = 0; changed; rounds++) {
        expect(rounds, `${gated.id}: fixpoint did not settle`).toBeLessThan(50);
        changed = false;
        for (const m of family) {
          const npcs = m.npcs.map(n => ({ x: n.x, y: n.y }));
          const toggles = statueToggles(m);
          const blockedExcept = (goal?: { x: number; y: number }) => [...npcs, ...m.warps.filter(w => !(goal && w.x === goal.x && w.y === goal.y)).map(w => ({ x: w.x, y: w.y }))];
          for (const key of [...reached.get(m.id)!]) for (const storyFlags of [...switchStates.get(m.id)!.values()]) {
            const live = liveMap(m);
            const [x, y] = key.split(',').map(Number);
            const from = { x, y };
            for (const g of m.gates ?? []) {
              if (!g.switch || pressed.get(m.id)!.has(k(g.switch))) continue;
              if (solve(m, () => canPressPlate(live, from, g.switch!, { blocked: blockedExcept(), storyFlags, toggles })).found) { pressed.get(m.id)!.add(k(g.switch)); changed = true; }
            }
            const holes = m.holes ?? [];
            if (holes.length && !holes.every(h => Object.keys(dropFlags).some(f => f.startsWith(`boulder_dropped_${m.id}_`) && f.endsWith(`_in_${h.x}_${h.y}`)))) {
              if (solve(m, () => canDropBoulders(live, from, holes.length, { blocked: blockedExcept(), storyFlags, toggles })).found) {
                for (const h of holes) live.tiles.forEach((row, by) => row.forEach((t, bx) => { if (t === TileType.BOULDER) dropFlags[dropFlag(m.id, { x: bx, y: by }, h)] = true; }));
                changed = true;
              }
            }
            for (const w of m.warps) {
              if (!inFamily(w.targetMap)) continue;
              const target = reached.get(w.targetMap)!;
              const tk = k({ x: w.targetX, y: w.targetY });
              if (toggles.length === 0) {
                // No statues: an early-exit search is enough (a full walk over boulder states is costly).
                if (target.has(tk)) continue;
                if (solve(m, () => canReach(live, from, w, { blocked: blockedExcept(w), storyFlags })).found) { target.add(tk); changed = true; }
                continue;
              }
              const r = solve(m, () => reachableFlags(live, from, w, { blocked: blockedExcept(w), storyFlags, toggles }));
              if (r.flags.length === 0) continue;
              if (!target.has(tk)) { target.add(tk); changed = true; }
              for (const f of r.flags) {
                const states = switchStates.get(m.id)!;
                if (!states.has(flagKey(f))) { states.set(flagKey(f), f); changed = true; }
              }
            }
          }
        }
      }
      for (const m of family) {
        const npcs = m.npcs.map(n => ({ x: n.x, y: n.y }));
        const toggles = statueToggles(m);
        const live = liveMap(m);
        expect(reached.get(m.id)!.size, `${m.id}: no ladder or entrance ever lands here`).toBeGreaterThan(0);
        for (const w of m.warps) {
          const blocked = [...npcs, ...m.warps.filter(o => o !== w).map(o => ({ x: o.x, y: o.y }))];
          const ok = [...reached.get(m.id)!].some(key => {
            const [x, y] = key.split(',').map(Number);
            return [...switchStates.get(m.id)!.values()].some(storyFlags => canReach(live, { x, y }, w, { blocked, storyFlags, toggles }).found);
          });
          expect(ok, `${m.id}: warp at ${w.x},${w.y} (to ${w.targetMap}) is unreachable from every landing and switch state the player can arrive in`).toBe(true);
        }
      }
    }
  });

  it('every floor with holes can drop a boulder into each of them from each of its entrances (with every boulder from the floors above landed)', () => {
    for (const map of Object.values(ALL_MAPS)) {
      if (!map.holes?.length) continue;
      const entrances = Object.values(ALL_MAPS).flatMap(m => m.warps.filter(w => w.targetMap === map.id).map(w => ({ x: w.targetX, y: w.targetY })));
      const trainers = map.npcs.map(n => ({ x: n.x, y: n.y }));
      const fromAbove = Object.values(ALL_MAPS).flatMap(m => (m.holes ?? []).filter(h => h.targetMap === map.id).map(h => ({ x: h.targetX, y: h.targetY })));
      const live = instantiateMap(map, {}, fromAbove).map;
      expect(entrances.length, `${map.id}: no entrance`).toBeGreaterThan(0);
      for (const e of entrances) {
        const r = canDropBoulders(live, e, map.holes.length, { blocked: trainers });
        expect(r.exhausted, `${map.id}: solver hit the state cap from ${e.x},${e.y}`).toBe(false);
        expect(r.found, `${map.id}: cannot drop ${map.holes.length} boulder(s) from entrance ${e.x},${e.y}`).toBe(true);
      }
    }
  });
});
