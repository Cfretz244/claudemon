import { describe, it, expect } from 'vitest';
import { migrateLegacyLocation } from '../../src/logic/saveMigration';

describe('migrateLegacyLocation', () => {
  it('passes through current map ids untouched', () => {
    expect(migrateLegacyLocation({ mapId: 'pallet_town', x: 5, y: 6 }))
      .toEqual({ mapId: 'pallet_town', x: 5, y: 6 });
  });

  it('remaps game_corner_basement to game_corner with fixed coords', () => {
    expect(migrateLegacyLocation({ mapId: 'game_corner_basement', x: 1, y: 1 }))
      .toEqual({ mapId: 'game_corner', x: 7, y: 10 });
  });

  it('remaps silph_co to silph_co_1f', () => {
    expect(migrateLegacyLocation({ mapId: 'silph_co' }))
      .toEqual({ mapId: 'silph_co_1f', x: 7, y: 12 });
  });

  it('remaps seafoam_islands to seafoam_b1f', () => {
    expect(migrateLegacyLocation({ mapId: 'seafoam_islands' }))
      .toEqual({ mapId: 'seafoam_b1f', x: 9, y: 18 });
  });
});
