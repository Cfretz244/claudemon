// Switch plates and gates must be wired consistently in every map, and every
// gated map must be completable from each of its entrances by pushing
// boulders. Vacuous until the first dungeon with gates lands (Phase 2).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';
import { TileType } from '../../src/types/map.types';
import { canReach } from '../../src/logic/boulders';

const gatedMaps = Object.values(ALL_MAPS).filter(m => (m.gates?.length ?? 0) > 0 ||
  m.tiles.some(row => row.some(t => t === TileType.SWITCH_PLATE || t === TileType.GATE)));

describe('switch plates and gates', () => {
  it('every gate entry sits on a GATE tile wired to a SWITCH_PLATE, and every such tile is wired', () => {
    for (const map of Object.values(ALL_MAPS)) {
      const gateTiles = new Set<string>();
      const plateTiles = new Set<string>();
      map.tiles.forEach((row, y) => row.forEach((t, x) => {
        if (t === TileType.GATE) gateTiles.add(`${x},${y}`);
        if (t === TileType.SWITCH_PLATE) plateTiles.add(`${x},${y}`);
      }));
      const wiredGates = new Set<string>();
      const wiredPlates = new Set<string>();
      for (const g of map.gates ?? []) {
        expect(map.tiles[g.y]?.[g.x], `${map.id}: gate ${g.x},${g.y} is not a GATE tile`).toBe(TileType.GATE);
        expect(map.collision[g.y][g.x], `${map.id}: gate ${g.x},${g.y} must be solid in the base data`).toBe(true);
        expect(map.tiles[g.switch.y]?.[g.switch.x], `${map.id}: switch ${g.switch.x},${g.switch.y} is not a SWITCH_PLATE`).toBe(TileType.SWITCH_PLATE);
        expect(map.collision[g.switch.y][g.switch.x], `${map.id}: plate ${g.switch.x},${g.switch.y} must be walkable`).toBe(false);
        wiredGates.add(`${g.x},${g.y}`);
        wiredPlates.add(`${g.switch.x},${g.switch.y}`);
      }
      expect([...gateTiles].sort(), `${map.id}: GATE tiles without a gates[] entry`).toEqual([...wiredGates].sort());
      expect([...plateTiles].sort(), `${map.id}: SWITCH_PLATE tiles no gate is wired to`).toEqual([...wiredPlates].sort());
      if (map.gates?.length) {
        expect(map.tiles.flat().filter(t => t === TileType.BOULDER).length, `${map.id}: gates but no boulder to press a plate`).toBeGreaterThan(0);
      }
    }
  });

  it('each gated map is completable: from every entrance landing, every exit warp is reachable', () => {
    for (const map of gatedMaps) {
      const entrances = Object.values(ALL_MAPS).flatMap(m => m.warps.filter(w => w.targetMap === map.id).map(w => ({ x: w.targetX, y: w.targetY })));
      const exits = map.warps.map(w => ({ x: w.x, y: w.y }));
      const trainers = map.npcs.filter(n => n.isTrainer).map(n => ({ x: n.x, y: n.y }));
      expect(entrances.length, `${map.id}: no entrance`).toBeGreaterThan(0);
      for (const e of entrances) for (const x of exits) {
        const r = canReach(map, e, x, { blocked: trainers });
        expect(r.exhausted, `${map.id}: solver hit the state cap from ${e.x},${e.y}`).toBe(false);
        expect(r.found, `${map.id}: exit ${x.x},${x.y} unreachable from entrance ${e.x},${e.y}`).toBe(true);
      }
    }
  });
});
