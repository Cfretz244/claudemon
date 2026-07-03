import { describe, it, expect } from 'vitest';
import { FLY_DESTINATIONS, getAvailableFlyDestinations } from '../../src/data/flyDestinations';
import { ALL_MAPS } from '../../src/data/maps';

describe('flyDestinations', () => {
  it('every destination maps to a real map and a walkable tile', () => {
    for (const d of FLY_DESTINATIONS) {
      const map = ALL_MAPS[d.mapId];
      expect(map, `map ${d.mapId} missing`).toBeDefined();
      expect(map.collision[d.y]?.[d.x], `${d.mapId} (${d.x},${d.y}) is solid`).toBe(false);
    }
  });

  it('Pallet Town is always available', () => {
    const available = getAvailableFlyDestinations({});
    expect(available.map(d => d.mapId)).toEqual(['pallet_town']);
  });

  it('visited towns become available', () => {
    const available = getAvailableFlyDestinations({
      visited_viridian_city: true,
      visited_lavender_town: true,
    });
    expect(available.map(d => d.mapId)).toEqual(['pallet_town', 'viridian_city', 'lavender_town']);
  });
});
