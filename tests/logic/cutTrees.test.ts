import { describe, it, expect } from 'vitest';
import { getCutTiles } from '../../src/logic/cutTrees';

describe('getCutTiles', () => {
  it('parses coordinates from matching flags', () => {
    const flags = { 'cut_route2_5_11': true, 'cut_route2_6_3': true };
    expect(getCutTiles(flags, 'route2').sort()).toEqual([[5, 11], [6, 3]].sort());
  });

  it('ignores other maps, false flags, and unrelated keys', () => {
    const flags = {
      'cut_route2_5_11': true,
      'cut_viridian_forest_1_2': true,   // different map
      'cut_route2_9_9': false,           // cleared flag
      'visited_pallet_town': true,       // unrelated
    };
    expect(getCutTiles(flags, 'route2')).toEqual([[5, 11]]);
  });

  it('skips malformed coordinates', () => {
    expect(getCutTiles({ 'cut_route2_x_y': true }, 'route2')).toEqual([]);
  });
});
