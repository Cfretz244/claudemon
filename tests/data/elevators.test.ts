// Elevators are map data: every `elevator_` NPC needs its floor's `elevator`
// block, every floor it lists must exist, land on a walkable tile and share
// the same elevator, and the Rocket Hideout lift must still offer exactly what
// the old hardcoded menu did (pinned so the data migration is behavior-preserving).
import { describe, it, expect } from 'vitest';
import { ALL_MAPS } from '../../src/data/maps';

const elevatorMaps = Object.values(ALL_MAPS).filter(m => m.npcs.some(n => n.id.startsWith('elevator_')));

describe('elevators', () => {
  it('every elevator_ NPC sits on a map with elevator data that lists that map', () => {
    expect(elevatorMaps.length).toBeGreaterThan(0);
    for (const map of elevatorMaps) {
      expect(map.elevator, `${map.id}: elevator_ NPC but no elevator data`).toBeDefined();
      expect(map.elevator!.floors.length, `${map.id}: an elevator needs at least two floors`).toBeGreaterThanOrEqual(2);
      expect(map.elevator!.floors.some(f => f.targetMap === map.id), `${map.id}: not among its own elevator's floors`).toBe(true);
    }
    for (const map of Object.values(ALL_MAPS)) {
      if (map.elevator) expect(map.npcs.some(n => n.id.startsWith('elevator_')), `${map.id}: elevator data but no elevator_ NPC`).toBe(true);
    }
  });

  it('every floor exists, has an elevator_ NPC, lands on a walkable tile, and shares the same elevator', () => {
    for (const map of elevatorMaps) {
      const labels = new Set<string>();
      for (const f of map.elevator!.floors) {
        expect(labels.has(f.label), `${map.id}: duplicate floor label ${f.label}`).toBe(false);
        labels.add(f.label);
        const target = ALL_MAPS[f.targetMap];
        expect(target, `${map.id}: floor ${f.label} targets unknown map ${f.targetMap}`).toBeDefined();
        expect(target.collision[f.targetY]?.[f.targetX], `${map.id}: floor ${f.label} lands on a solid tile`).toBe(false);
        expect(target.npcs.some(n => n.id.startsWith('elevator_')), `${map.id}: floor ${f.label} has no elevator_ NPC`).toBe(true);
        expect(target.npcs.some(n => n.x === f.targetX && n.y === f.targetY), `${map.id}: floor ${f.label} lands on an NPC`).toBe(false);
        expect(target.elevator, `${map.id}: floor ${f.label} declares a different elevator`).toEqual(map.elevator);
      }
    }
  });

  it('the Rocket Hideout lift offers B1F/B2F/B4F behind the Lift Key, as before the data migration', () => {
    const lift = ALL_MAPS.rocket_hideout_b1f.elevator!;
    expect(lift.floors).toEqual([
      { label: 'B1F', targetMap: 'rocket_hideout_b1f', targetX: 2, targetY: 13 },
      { label: 'B2F', targetMap: 'rocket_hideout_b2f', targetX: 2, targetY: 13 },
      { label: 'B4F', targetMap: 'rocket_hideout_b4f', targetX: 2, targetY: 9 },
    ]);
    expect(lift.requires).toEqual({ item: 'lift_key' });
    expect(lift.lockedMessage).toEqual(["It's an elevator,\nbut it won't move...", 'It needs a special\nkey.']);
    expect(ALL_MAPS.rocket_hideout_b3f?.elevator).toBeUndefined();
  });
});
