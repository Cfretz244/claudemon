// Remaps map ids (and spawn coordinates) from saves created before map
// reworks. Extracted from OverworldScene.init.

export interface SpawnLocation {
  mapId: string;
  x?: number;
  y?: number;
}

const LEGACY_MAP_REMAPS: Record<string, Required<SpawnLocation>> = {
  game_corner_basement: { mapId: 'game_corner', x: 7, y: 10 },
  silph_co: { mapId: 'silph_co_1f', x: 7, y: 12 },
  seafoam_islands: { mapId: 'seafoam_b1f', x: 9, y: 18 },
};

/** Returns the (possibly remapped) spawn location for a saved one. */
export function migrateLegacyLocation(loc: SpawnLocation): SpawnLocation {
  const remap = LEGACY_MAP_REMAPS[loc.mapId];
  return remap ? { ...remap } : loc;
}
