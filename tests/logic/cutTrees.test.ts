import { describe, it, expect } from 'vitest';
import { cutTreeFlag, cutTreePrefix, getCutTiles } from '../../src/logic/cutTrees';
import { ALL_MAPS } from '../../src/data/maps';
import { TileType } from '../../src/types/map.types';

const MAP_IDS = Object.keys(ALL_MAPS);

/** Every map that actually has a CUT_TREE tile, with its tree coordinates. */
const TREE_MAPS = MAP_IDS.map(id => {
  const map = ALL_MAPS[id];
  const trees: Array<[number, number]> = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.tiles[y][x] === TileType.CUT_TREE) trees.push([x, y]);
    }
  }
  return { id, trees };
}).filter(m => m.trees.length > 0);

/** Map id pairs where one id is an underscore-prefix of another. */
const PREFIX_PAIRS = MAP_IDS.flatMap(short =>
  MAP_IDS.filter(long => long !== short && long.startsWith(`${short}_`))
    .map(long => ({ short, long })));

describe('cutTreeFlag', () => {
  it('is the prefix plus x_y', () => {
    expect(cutTreeFlag('route2', 12, 13)).toBe('cut_route2_12_13');
    expect(cutTreePrefix('route2')).toBe('cut_route2_');
    expect(cutTreeFlag('route2', 12, 13).startsWith(cutTreePrefix('route2'))).toBe(true);
  });
});

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

describe('the write/read round trip', () => {
  it('reads back what cutTreeFlag() wrote, for every map in the game', () => {
    const coords: Array<[number, number]> = [[0, 0], [1, 2], [12, 13], [9, 6], [22, 12]];
    for (const id of MAP_IDS) {
      const flags: Record<string, boolean> = {};
      for (const [x, y] of coords) flags[cutTreeFlag(id, x, y)] = true;
      expect(getCutTiles(flags, id).sort(), id).toEqual([...coords].sort());
    }
    expect(MAP_IDS.length).toBeGreaterThan(50);
  });

  it('reads back every real CUT_TREE position on the maps that have one', () => {
    for (const { id, trees } of TREE_MAPS) {
      const flags: Record<string, boolean> = {};
      for (const [x, y] of trees) flags[cutTreeFlag(id, x, y)] = true;
      expect(getCutTiles(flags, id).sort(), id).toEqual([...trees].sort());
    }
    // Pins where cut trees actually are: route 2, Cerulean, Vermilion, Safari West.
    expect(TREE_MAPS.map(m => m.id).sort()).toEqual(
      ['cerulean_city', 'route2', 'safari_zone_west', 'vermilion_city']);
  });

  it('one map\'s flags never leak into an unrelated map', () => {
    const flags = { [cutTreeFlag('route2', 12, 13)]: true };
    for (const id of MAP_IDS) {
      if (id === 'route2') continue;
      // Only a prefix relative of route2 could match, and there is none.
      expect(getCutTiles(flags, id), id).toEqual([]);
    }
  });
});

describe('the prefix collision (current behaviour, deliberately not fixed)', () => {
  it('lets a shorter map id swallow a longer one\'s flag when the suffix starts with a digit', () => {
    // `getCutTiles` matches on startsWith('cut_<id>_'), so for a synthetic pair
    // `ss_anne` / `ss_anne_2f` the flag written for the 2F tile also matches the
    // 1F map, and '2f' parseInt's to 2:
    const flags = { [cutTreeFlag('ss_anne_2f', 3, 4)]: true };
    expect(getCutTiles(flags, 'ss_anne_2f')).toEqual([[3, 4]]);
    expect(getCutTiles(flags, 'ss_anne')).toEqual([[2, 3]]);   // '2f','3','4' -> (2,3)
  });

  it('drops a non-digit-leading suffix, which is why the one real overlap is harmless', () => {
    // safari_zone / safari_zone_west is the only prefix pair where either map
    // has a CUT_TREE (safari_zone_west (9,6)), and 'west' is NaN:
    const flags = { [cutTreeFlag('safari_zone_west', 9, 6)]: true };
    expect(getCutTiles(flags, 'safari_zone_west')).toEqual([[9, 6]]);
    expect(getCutTiles(flags, 'safari_zone')).toEqual([]);
  });

  it('no shipped prefix pair can actually collide: neither side has a cut tree, bar Safari West', () => {
    expect(PREFIX_PAIRS.length).toBeGreaterThan(20);   // 34 real pairs today
    const treeIds = new Set(TREE_MAPS.map(m => m.id));
    const risky = PREFIX_PAIRS.filter(({ short, long }) => {
      if (!treeIds.has(short) && !treeIds.has(long)) return false;
      // A collision needs the longer id's extra segment to parse as a number.
      const suffix = long.slice(`${short}_`.length).split('_')[0];
      return !isNaN(parseInt(suffix));
    });
    expect(risky).toEqual([]);
  });
});
