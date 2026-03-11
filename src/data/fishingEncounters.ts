import { WildEncounter } from '../types/map.types';

// Old Rod: always Magikarp level 5
export const OLD_ROD_ENCOUNTER: WildEncounter[] = [
  { speciesId: 129, minLevel: 5, maxLevel: 5, weight: 100 }, // Magikarp
];

// Good Rod: Poliwag, Goldeen, Magikarp — levels 10–15
export const GOOD_ROD_ENCOUNTERS: WildEncounter[] = [
  { speciesId: 60, minLevel: 10, maxLevel: 15, weight: 30 },  // Poliwag
  { speciesId: 118, minLevel: 10, maxLevel: 15, weight: 30 }, // Goldeen
  { speciesId: 129, minLevel: 10, maxLevel: 15, weight: 40 }, // Magikarp
];

// Super Rod: per-map tables
export const SUPER_ROD_ENCOUNTERS: Record<string, WildEncounter[]> = {
  pallet_town: [
    { speciesId: 72, minLevel: 20, maxLevel: 30, weight: 30 },  // Tentacool
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 35 },  // Poliwag
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 35 }, // Goldeen
  ],
  cerulean_city: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 30 }, // Goldeen
    { speciesId: 54, minLevel: 20, maxLevel: 25, weight: 35 },  // Psyduck
    { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 35 },  // Krabby
  ],
  route4: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 30 }, // Goldeen
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 35 },  // Poliwag
    { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 35 },  // Krabby
  ],
  route9: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 30 }, // Goldeen
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 35 },  // Poliwag
    { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 35 },  // Krabby
  ],
  route24: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 30 }, // Goldeen
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 35 },  // Poliwag
    { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 35 },  // Krabby
  ],
  route25: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 30 }, // Goldeen
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 35 },  // Poliwag
    { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 35 },  // Krabby
  ],
  vermilion_city: [
    { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 30 },  // Krabby
    { speciesId: 90, minLevel: 20, maxLevel: 25, weight: 35 },  // Shellder
    { speciesId: 116, minLevel: 20, maxLevel: 25, weight: 35 }, // Horsea
  ],
  route6: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 30 }, // Goldeen
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 35 },  // Poliwag
    { speciesId: 90, minLevel: 20, maxLevel: 25, weight: 35 },  // Shellder
  ],
  route11: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 30 }, // Goldeen
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 35 },  // Poliwag
    { speciesId: 90, minLevel: 20, maxLevel: 25, weight: 35 },  // Shellder
  ],
  route12: [
    { speciesId: 118, minLevel: 20, maxLevel: 25, weight: 25 }, // Goldeen
    { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 25 },  // Poliwag
    { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 25 },  // Krabby
    { speciesId: 79, minLevel: 20, maxLevel: 25, weight: 25 },  // Slowpoke
  ],
  route19: [
    { speciesId: 72, minLevel: 25, maxLevel: 35, weight: 25 },  // Tentacool
    { speciesId: 116, minLevel: 25, maxLevel: 30, weight: 25 }, // Horsea
    { speciesId: 90, minLevel: 25, maxLevel: 30, weight: 25 },  // Shellder
    { speciesId: 120, minLevel: 25, maxLevel: 30, weight: 25 }, // Staryu
  ],
  route20: [
    { speciesId: 72, minLevel: 25, maxLevel: 35, weight: 25 },  // Tentacool
    { speciesId: 116, minLevel: 25, maxLevel: 30, weight: 25 }, // Horsea
    { speciesId: 90, minLevel: 25, maxLevel: 30, weight: 25 },  // Shellder
    { speciesId: 120, minLevel: 25, maxLevel: 30, weight: 25 }, // Staryu
  ],
  route21: [
    { speciesId: 72, minLevel: 25, maxLevel: 35, weight: 30 },  // Tentacool
    { speciesId: 90, minLevel: 25, maxLevel: 30, weight: 35 },  // Shellder
    { speciesId: 116, minLevel: 25, maxLevel: 30, weight: 35 }, // Horsea
  ],
  cinnabar_island: [
    { speciesId: 116, minLevel: 25, maxLevel: 35, weight: 25 }, // Horsea
    { speciesId: 120, minLevel: 25, maxLevel: 35, weight: 25 }, // Staryu
    { speciesId: 90, minLevel: 25, maxLevel: 30, weight: 25 },  // Shellder
    { speciesId: 118, minLevel: 25, maxLevel: 30, weight: 25 }, // Goldeen
  ],
  seafoam_islands: [
    { speciesId: 116, minLevel: 25, maxLevel: 35, weight: 25 }, // Horsea
    { speciesId: 90, minLevel: 25, maxLevel: 30, weight: 25 },  // Shellder
    { speciesId: 118, minLevel: 25, maxLevel: 30, weight: 25 }, // Goldeen
    { speciesId: 120, minLevel: 25, maxLevel: 35, weight: 25 }, // Staryu
  ],
  safari_zone: [
    { speciesId: 118, minLevel: 20, maxLevel: 30, weight: 25 }, // Goldeen
    { speciesId: 147, minLevel: 15, maxLevel: 25, weight: 15 }, // Dratini
    { speciesId: 129, minLevel: 15, maxLevel: 25, weight: 30 }, // Magikarp
    { speciesId: 54, minLevel: 20, maxLevel: 30, weight: 30 },  // Psyduck
  ],
  safari_zone_east: [
    { speciesId: 118, minLevel: 20, maxLevel: 30, weight: 25 }, // Goldeen
    { speciesId: 147, minLevel: 15, maxLevel: 25, weight: 15 }, // Dratini
    { speciesId: 129, minLevel: 15, maxLevel: 25, weight: 30 }, // Magikarp
    { speciesId: 54, minLevel: 20, maxLevel: 30, weight: 30 },  // Psyduck
  ],
  safari_zone_west: [
    { speciesId: 118, minLevel: 20, maxLevel: 30, weight: 25 }, // Goldeen
    { speciesId: 147, minLevel: 15, maxLevel: 25, weight: 15 }, // Dratini
    { speciesId: 129, minLevel: 15, maxLevel: 25, weight: 30 }, // Magikarp
    { speciesId: 54, minLevel: 20, maxLevel: 30, weight: 30 },  // Psyduck
  ],
  safari_zone_north: [
    { speciesId: 118, minLevel: 20, maxLevel: 30, weight: 25 }, // Goldeen
    { speciesId: 147, minLevel: 15, maxLevel: 25, weight: 15 }, // Dratini
    { speciesId: 129, minLevel: 15, maxLevel: 25, weight: 30 }, // Magikarp
    { speciesId: 54, minLevel: 20, maxLevel: 30, weight: 30 },  // Psyduck
  ],
  victory_road: [
    { speciesId: 118, minLevel: 25, maxLevel: 35, weight: 50 }, // Goldeen
    { speciesId: 60, minLevel: 25, maxLevel: 35, weight: 50 },  // Poliwag
  ],
};

// Default fallback for maps with water but no specific table
export const DEFAULT_SUPER_ROD: WildEncounter[] = [
  { speciesId: 118, minLevel: 20, maxLevel: 30, weight: 30 }, // Goldeen
  { speciesId: 60, minLevel: 20, maxLevel: 25, weight: 30 },  // Poliwag
  { speciesId: 98, minLevel: 20, maxLevel: 25, weight: 40 },  // Krabby
];
