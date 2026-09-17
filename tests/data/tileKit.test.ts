import { describe, it, expect } from 'vitest';
import { TileType } from '../../src/types/map.types';
import { SOLID_TILES, TILE_SOLIDITY } from '../../src/data/mapBuilder';
import { BUILDING_TILE_DRAWERS, TILE_DRAWERS, THEMED_TILE_DRAWERS } from '../../src/utils/spriteGenerator';
import { BUILDING_KINDS, BUILDING_TILE_TYPES, TOWN_THEMES } from '../../src/data/townThemes';

/** Every numeric member of the TileType enum, once. */
const ALL_TILE_TYPES = Object.values(TileType).filter((v): v is TileType => typeof v === 'number');

describe('the tile registry is complete', () => {
  it('covers every TileType from 0 upwards with no gaps', () => {
    expect(ALL_TILE_TYPES.slice().sort((a, b) => a - b))
      .toEqual(ALL_TILE_TYPES.map((_, i) => i));
  });

  it('every TileType has art', () => {
    const missing = ALL_TILE_TYPES.filter(t => typeof TILE_DRAWERS[t] !== 'function');
    expect(missing.map(t => TileType[t])).toEqual([]);
  });

  it('every TileType has a collision entry, and SOLID_TILES is derived from it', () => {
    const missing = ALL_TILE_TYPES.filter(t => typeof TILE_SOLIDITY[t] !== 'boolean');
    expect(missing.map(t => TileType[t])).toEqual([]);
    for (const t of ALL_TILE_TYPES) {
      expect(SOLID_TILES.has(t), `${TileType[t]} solidity`).toBe(TILE_SOLIDITY[t]);
    }
  });

  it('the building-kit tiles are solid except the pier planks you walk on', () => {
    expect(TILE_SOLIDITY[TileType.WINDOW]).toBe(true);
    expect(TILE_SOLIDITY[TileType.ROOF_EDGE_L]).toBe(true);
    expect(TILE_SOLIDITY[TileType.ROOF_EDGE_R]).toBe(true);
    expect(TILE_SOLIDITY[TileType.ROOF_RIDGE]).toBe(true);
    expect(TILE_SOLIDITY[TileType.SIGNBOARD]).toBe(true);
    expect(TILE_SOLIDITY[TileType.CHIMNEY]).toBe(true);
    expect(TILE_SOLIDITY[TileType.ROCK]).toBe(true);
    expect(TILE_SOLIDITY[TileType.PLANK]).toBe(false);
    expect(TILE_SOLIDITY[TileType.GRAVEL]).toBe(false);
  });

  it('gravel is themed ground, like grass: every town gives it three colours', () => {
    expect(typeof THEMED_TILE_DRAWERS[TileType.GRAVEL]).toBe('function');
    for (const [id, p] of Object.entries(TOWN_THEMES)) {
      for (const slot of ['gravelBase', 'gravelAccent', 'gravelLight'] as const) {
        expect(p[slot], `${id}.${slot}`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('every facade tile type has per-kind art, and nothing else claims to', () => {
    expect(new Set(Object.keys(BUILDING_TILE_DRAWERS).map(Number))).toEqual(new Set(BUILDING_TILE_TYPES));
  });

  it('the themed drawers cover the facade tiles, so an unstamped wall still themes', () => {
    for (const t of BUILDING_TILE_TYPES) {
      expect(typeof THEMED_TILE_DRAWERS[t], `themed drawer for ${TileType[t]}`).toBe('function');
    }
  });
});

describe('per-kind building palettes', () => {
  it('every town resolves every kind to seven colours', () => {
    for (const [id, palette] of Object.entries(TOWN_THEMES)) {
      for (const kind of BUILDING_KINDS) {
        const b = palette.buildings[kind];
        expect(b, `${id}.${kind}`).toBeDefined();
        for (const slot of ['roof', 'roofLight', 'roofDark', 'wall', 'wallBorder', 'window', 'sign'] as const) {
          expect(b[slot], `${id}.${kind}.${slot}`).toMatch(/^#[0-9a-f]{6}$/i);
        }
      }
    }
  });

  it('Centers, Marts and Gyms keep the same roof in every town', () => {
    const towns = Object.values(TOWN_THEMES);
    for (const [kind, roof] of [['center', '#d04040'], ['mart', '#4060c0'], ['gym', '#505868']] as const) {
      for (const p of towns) expect(p.buildings[kind].roof).toBe(roof);
    }
  });

  it("a house takes the town's roof and wall; a landmark the town's roof darkened", () => {
    for (const [id, p] of Object.entries(TOWN_THEMES)) {
      expect(p.buildings.house.roof, `${id} house roof`).toBe(p.roof);
      expect(p.buildings.house.wall, `${id} house wall`).toBe(p.buildingWall);
      expect(p.buildings.house.wallBorder).toBe(p.buildingBorder);
      expect(p.buildings.landmark.roof, `${id} landmark roof`).not.toBe(p.roof);
      expect(p.buildings.landmark.wall).toBe(p.buildingWall);
    }
  });

  it('every town has a water colour for pier planks', () => {
    for (const [id, p] of Object.entries(TOWN_THEMES)) {
      expect(p.water, `${id}.water`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
