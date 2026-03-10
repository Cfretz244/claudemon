// Town visual theme palettes — each town gets distinct colors for outdoor tiles

export interface TownPalette {
  roof: string;          // Roof tile main color
  grassBase: string;     // Grass background
  grassAccent: string;   // Grass blade detail
  pathBase: string;      // Path background
  pathAccent: string;    // Path edge/grid line
  treeTrunk: string;     // Tree trunk
  treeCanopy: string;    // Tree canopy dark
  treeCanopyLight: string; // Tree canopy light
  buildingWall: string;  // Building wall
  buildingBorder: string; // Building edge/line
  doorWall: string;      // Door surround (matches building wall)
  signGrass: string;     // Sign background (matches grass)
  tallGrassBase: string; // Tall grass background
  tallGrassBlade: string; // Tall grass dark blades
  tallGrassLight: string; // Tall grass lighter blades
  fenceGrass: string;    // Fence background (matches grass)
  flowerGrass: string;   // Flower background (matches grass)
  cutTreeGrass: string;  // Cut tree background (matches grass)
  ledgeGrass: string;    // Ledge background (matches grass)
}

const DEFAULT_PALETTE: TownPalette = {
  roof: '#c05050',
  grassBase: '#88c070',
  grassAccent: '#78b060',
  pathBase: '#d8c078',
  pathAccent: '#c8b068',
  treeTrunk: '#805028',
  treeCanopy: '#408040',
  treeCanopyLight: '#509050',
  buildingWall: '#e0d0b0',
  buildingBorder: '#c0b090',
  doorWall: '#e0d0b0',
  signGrass: '#88c070',
  tallGrassBase: '#88c070',
  tallGrassBlade: '#409030',
  tallGrassLight: '#58a848',
  fenceGrass: '#88c070',
  flowerGrass: '#88c070',
  cutTreeGrass: '#88c070',
  ledgeGrass: '#88c070',
};

function theme(overrides: Partial<TownPalette>): TownPalette {
  return { ...DEFAULT_PALETTE, ...overrides };
}

export const TOWN_THEMES: Record<string, TownPalette> = {
  pallet: theme({
    roof: '#c05050',
  }),
  viridian: theme({
    roof: '#50a050',
    grassBase: '#80b868',
    grassAccent: '#70a858',
    pathBase: '#d0b870',
    pathAccent: '#c0a860',
    treeCanopy: '#387038',
    treeCanopyLight: '#488848',
    buildingWall: '#d8c8a8',
    buildingBorder: '#b8a888',
    doorWall: '#d8c8a8',
    signGrass: '#80b868',
    tallGrassBase: '#80b868',
    tallGrassBlade: '#387828',
    tallGrassLight: '#50a040',
    fenceGrass: '#80b868',
    flowerGrass: '#80b868',
    cutTreeGrass: '#80b868',
    ledgeGrass: '#80b868',
  }),
  pewter: theme({
    roof: '#909090',
    grassBase: '#90b878',
    grassAccent: '#80a868',
    pathBase: '#c8b880',
    pathAccent: '#b8a870',
    treeCanopy: '#488848',
    treeCanopyLight: '#589858',
    buildingWall: '#d8d0b8',
    buildingBorder: '#b8b098',
    doorWall: '#d8d0b8',
    signGrass: '#90b878',
    tallGrassBase: '#90b878',
    tallGrassBlade: '#488838',
    tallGrassLight: '#60a850',
    fenceGrass: '#90b878',
    flowerGrass: '#90b878',
    cutTreeGrass: '#90b878',
    ledgeGrass: '#90b878',
  }),
  cerulean: theme({
    roof: '#5080c0',
    buildingWall: '#d8d8e8',
    buildingBorder: '#b8b8c8',
    doorWall: '#d8d8e8',
  }),
  vermilion: theme({
    roof: '#d08040',
    grassBase: '#80b060',
    grassAccent: '#70a050',
    pathBase: '#e0c070',
    pathAccent: '#d0b060',
    treeCanopy: '#488040',
    treeCanopyLight: '#589050',
    buildingWall: '#e0d0a8',
    buildingBorder: '#c0b088',
    doorWall: '#e0d0a8',
    signGrass: '#80b060',
    tallGrassBase: '#80b060',
    tallGrassBlade: '#387828',
    tallGrassLight: '#50a040',
    fenceGrass: '#80b060',
    flowerGrass: '#80b060',
    cutTreeGrass: '#80b060',
    ledgeGrass: '#80b060',
  }),
  lavender: theme({
    roof: '#8060a0',
    grassBase: '#78a868',
    grassAccent: '#689858',
    pathBase: '#c0b080',
    pathAccent: '#b0a070',
    treeCanopy: '#406840',
    treeCanopyLight: '#507850',
    buildingWall: '#d8d0d8',
    buildingBorder: '#b8b0b8',
    doorWall: '#d8d0d8',
    signGrass: '#78a868',
    tallGrassBase: '#78a868',
    tallGrassBlade: '#387028',
    tallGrassLight: '#509840',
    fenceGrass: '#78a868',
    flowerGrass: '#78a868',
    cutTreeGrass: '#78a868',
    ledgeGrass: '#78a868',
  }),
  celadon: theme({
    roof: '#40a060',
    grassBase: '#78c060',
    grassAccent: '#68b050',
    treeCanopy: '#308830',
    treeCanopyLight: '#409840',
  }),
  saffron: theme({
    roof: '#d0b040',
    buildingWall: '#e0d8b8',
    buildingBorder: '#c0b898',
    doorWall: '#e0d8b8',
  }),
  fuchsia: theme({
    roof: '#c05080',
  }),
  cinnabar: theme({
    roof: '#c04040',
    buildingWall: '#e0d0a8',
    buildingBorder: '#c0b088',
    doorWall: '#e0d0a8',
  }),
  indigo: theme({
    roof: '#4060b0',
    grassBase: '#78b868',
    grassAccent: '#68a858',
    pathBase: '#c8c0a0',
    pathAccent: '#b8b090',
    buildingWall: '#d0d0e0',
    buildingBorder: '#b0b0c0',
    doorWall: '#d0d0e0',
    signGrass: '#78b868',
    tallGrassBase: '#78b868',
    tallGrassBlade: '#387028',
    tallGrassLight: '#509840',
    fenceGrass: '#78b868',
    flowerGrass: '#78b868',
    cutTreeGrass: '#78b868',
    ledgeGrass: '#78b868',
  }),
};

// Map IDs to theme keys
export const MAP_THEMES: Record<string, string> = {
  // Towns
  pallet_town: 'pallet',
  viridian_city: 'viridian',
  pewter_city: 'pewter',
  cerulean_city: 'cerulean',
  vermilion_city: 'vermilion',
  lavender_town: 'lavender',
  celadon_city: 'celadon',
  saffron_city: 'saffron',
  fuchsia_city: 'fuchsia',
  cinnabar_island: 'cinnabar',
  indigo_plateau: 'indigo',

  // Routes mapped to nearest town theme
  route1: 'pallet',
  route2: 'viridian',
  route3: 'pewter',
  route4: 'cerulean',
  route5: 'cerulean',
  route6: 'vermilion',
  route7: 'celadon',
  route8: 'lavender',
  route9: 'cerulean',
  route10: 'lavender',
  route11: 'vermilion',
  route12: 'lavender',
  route13: 'fuchsia',
  route14: 'fuchsia',
  route15: 'fuchsia',
  route16: 'celadon',
  route17: 'fuchsia',
  route18: 'fuchsia',
  route19: 'fuchsia',
  route20: 'cinnabar',
  route21: 'pallet',
  route22: 'viridian',
  route23: 'indigo',
  route24: 'cerulean',
  route25: 'cerulean',
};
