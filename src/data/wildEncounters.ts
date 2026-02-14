import { WildEncounterTable } from '../types/map.types';

// Additional encounter tables for routes/areas not defined inline in maps.ts
export const WILD_ENCOUNTERS: Record<string, WildEncounterTable> = {
  route4: {
    grassRate: 0.2,
    encounters: [
      { speciesId: 21, minLevel: 8, maxLevel: 12, weight: 25 },  // Spearow
      { speciesId: 23, minLevel: 6, maxLevel: 12, weight: 20 },  // Ekans
      { speciesId: 27, minLevel: 8, maxLevel: 10, weight: 20 },  // Sandshrew
      { speciesId: 56, minLevel: 8, maxLevel: 10, weight: 20 },  // Mankey
      { speciesId: 66, minLevel: 10, maxLevel: 12, weight: 15 }, // Machop
    ],
  },
  mt_moon: {
    grassRate: 0.15,
    encounters: [
      { speciesId: 41, minLevel: 7, maxLevel: 11, weight: 40 },  // Zubat
      { speciesId: 74, minLevel: 8, maxLevel: 11, weight: 25 },  // Geodude
      { speciesId: 46, minLevel: 8, maxLevel: 10, weight: 15 },  // Paras
      { speciesId: 35, minLevel: 8, maxLevel: 12, weight: 15 },  // Clefairy
      { speciesId: 104, minLevel: 8, maxLevel: 10, weight: 5 },  // Cubone (rare)
    ],
  },
  route24: {
    grassRate: 0.2,
    encounters: [
      { speciesId: 10, minLevel: 7, maxLevel: 11, weight: 15 },  // Caterpie
      { speciesId: 13, minLevel: 7, maxLevel: 11, weight: 15 },  // Weedle
      { speciesId: 16, minLevel: 8, maxLevel: 12, weight: 15 },  // Pidgey
      { speciesId: 63, minLevel: 8, maxLevel: 12, weight: 15 },  // Abra
      { speciesId: 43, minLevel: 12, maxLevel: 14, weight: 20 }, // Oddish
      { speciesId: 69, minLevel: 12, maxLevel: 14, weight: 20 }, // Bellsprout
    ],
  },
  route6: {
    grassRate: 0.2,
    encounters: [
      { speciesId: 16, minLevel: 13, maxLevel: 17, weight: 20 }, // Pidgey
      { speciesId: 43, minLevel: 13, maxLevel: 17, weight: 25 }, // Oddish
      { speciesId: 56, minLevel: 13, maxLevel: 17, weight: 20 }, // Mankey
      { speciesId: 52, minLevel: 13, maxLevel: 15, weight: 15 }, // Meowth
      { speciesId: 39, minLevel: 12, maxLevel: 15, weight: 20 }, // Jigglypuff
    ],
  },
  route11: {
    grassRate: 0.2,
    encounters: [
      { speciesId: 23, minLevel: 15, maxLevel: 19, weight: 25 }, // Ekans
      { speciesId: 21, minLevel: 15, maxLevel: 17, weight: 20 }, // Spearow
      { speciesId: 96, minLevel: 15, maxLevel: 17, weight: 20 }, // Drowzee
      { speciesId: 27, minLevel: 15, maxLevel: 19, weight: 20 }, // Sandshrew
      { speciesId: 81, minLevel: 16, maxLevel: 18, weight: 15 }, // Magnemite
    ],
  },
  rock_tunnel: {
    grassRate: 0.15,
    encounters: [
      { speciesId: 41, minLevel: 15, maxLevel: 18, weight: 30 }, // Zubat
      { speciesId: 74, minLevel: 15, maxLevel: 18, weight: 25 }, // Geodude
      { speciesId: 66, minLevel: 15, maxLevel: 18, weight: 20 }, // Machop
      { speciesId: 95, minLevel: 16, maxLevel: 17, weight: 15 }, // Onix
      { speciesId: 104, minLevel: 16, maxLevel: 18, weight: 10 },// Cubone
    ],
  },
  pokemon_tower: {
    grassRate: 0.15,
    encounters: [
      { speciesId: 92, minLevel: 20, maxLevel: 24, weight: 40 }, // Gastly
      { speciesId: 104, minLevel: 20, maxLevel: 22, weight: 25 },// Cubone
      { speciesId: 93, minLevel: 22, maxLevel: 25, weight: 20 }, // Haunter
      { speciesId: 41, minLevel: 20, maxLevel: 22, weight: 15 }, // Zubat
    ],
  },
  safari_zone: {
    grassRate: 0.25,
    encounters: [
      { speciesId: 111, minLevel: 25, maxLevel: 28, weight: 15 },// Rhyhorn
      { speciesId: 113, minLevel: 25, maxLevel: 28, weight: 5 }, // Chansey (rare)
      { speciesId: 102, minLevel: 25, maxLevel: 28, weight: 15 },// Exeggcute
      { speciesId: 115, minLevel: 25, maxLevel: 28, weight: 10 },// Kangaskhan
      { speciesId: 123, minLevel: 25, maxLevel: 28, weight: 15 },// Scyther
      { speciesId: 127, minLevel: 25, maxLevel: 28, weight: 15 },// Pinsir
      { speciesId: 128, minLevel: 25, maxLevel: 28, weight: 10 },// Tauros
      { speciesId: 30, minLevel: 25, maxLevel: 28, weight: 15 }, // Nidorina
    ],
  },
  seafoam_islands: {
    grassRate: 0.15,
    encounters: [
      { speciesId: 86, minLevel: 30, maxLevel: 34, weight: 25 }, // Seel
      { speciesId: 90, minLevel: 30, maxLevel: 34, weight: 20 }, // Shellder
      { speciesId: 116, minLevel: 30, maxLevel: 32, weight: 15 },// Horsea
      { speciesId: 118, minLevel: 30, maxLevel: 34, weight: 15 },// Goldeen
      { speciesId: 87, minLevel: 32, maxLevel: 36, weight: 15 }, // Dewgong
      { speciesId: 131, minLevel: 35, maxLevel: 35, weight: 5 }, // Lapras (rare)
      { speciesId: 144, minLevel: 50, maxLevel: 50, weight: 5 }, // Articuno
    ],
  },
  pokemon_mansion: {
    grassRate: 0.15,
    encounters: [
      { speciesId: 109, minLevel: 30, maxLevel: 36, weight: 25 },// Koffing
      { speciesId: 88, minLevel: 30, maxLevel: 36, weight: 20 }, // Grimer
      { speciesId: 77, minLevel: 32, maxLevel: 36, weight: 20 }, // Ponyta
      { speciesId: 58, minLevel: 32, maxLevel: 36, weight: 20 }, // Growlithe
      { speciesId: 132, minLevel: 34, maxLevel: 36, weight: 10 },// Ditto
      { speciesId: 126, minLevel: 38, maxLevel: 38, weight: 5 }, // Magmar
    ],
  },
  victory_road: {
    grassRate: 0.15,
    encounters: [
      { speciesId: 66, minLevel: 36, maxLevel: 42, weight: 20 },  // Machop (Machoke)
      { speciesId: 74, minLevel: 36, maxLevel: 42, weight: 20 },  // Geodude (Graveler)
      { speciesId: 95, minLevel: 36, maxLevel: 42, weight: 15 },  // Onix
      { speciesId: 41, minLevel: 36, maxLevel: 42, weight: 15 },  // Zubat (Golbat)
      { speciesId: 142, minLevel: 40, maxLevel: 42, weight: 5 },  // Aerodactyl (rare)
      { speciesId: 105, minLevel: 38, maxLevel: 42, weight: 15 }, // Marowak
      { speciesId: 145, minLevel: 50, maxLevel: 50, weight: 5 },  // Zapdos
      { speciesId: 146, minLevel: 50, maxLevel: 50, weight: 5 },  // Moltres
    ],
  },
  cerulean_cave: {
    grassRate: 0.15,
    encounters: [
      { speciesId: 42, minLevel: 46, maxLevel: 52, weight: 15 },  // Golbat
      { speciesId: 82, minLevel: 46, maxLevel: 52, weight: 10 },  // Magneton
      { speciesId: 97, minLevel: 46, maxLevel: 52, weight: 10 },  // Hypno
      { speciesId: 64, minLevel: 46, maxLevel: 52, weight: 10 },  // Kadabra
      { speciesId: 132, minLevel: 46, maxLevel: 52, weight: 15 }, // Ditto
      { speciesId: 112, minLevel: 46, maxLevel: 52, weight: 10 }, // Rhydon
      { speciesId: 113, minLevel: 48, maxLevel: 54, weight: 5 },  // Chansey
      { speciesId: 101, minLevel: 46, maxLevel: 52, weight: 10 }, // Electrode
      { speciesId: 67, minLevel: 46, maxLevel: 52, weight: 10 },  // Machoke
      { speciesId: 150, minLevel: 70, maxLevel: 70, weight: 5 },  // Mewtwo (legendary)
    ],
  },
  fishing_old: {
    grassRate: 1.0,
    encounters: [
      { speciesId: 129, minLevel: 5, maxLevel: 5, weight: 100 }, // Magikarp
    ],
  },
  fishing_good: {
    grassRate: 1.0,
    encounters: [
      { speciesId: 60, minLevel: 10, maxLevel: 15, weight: 40 }, // Poliwag
      { speciesId: 118, minLevel: 10, maxLevel: 15, weight: 30 },// Goldeen
      { speciesId: 129, minLevel: 10, maxLevel: 15, weight: 30 },// Magikarp
    ],
  },
  fishing_super: {
    grassRate: 1.0,
    encounters: [
      { speciesId: 60, minLevel: 20, maxLevel: 30, weight: 20 }, // Poliwag
      { speciesId: 118, minLevel: 20, maxLevel: 30, weight: 20 },// Goldeen
      { speciesId: 130, minLevel: 15, maxLevel: 25, weight: 10 },// Gyarados
      { speciesId: 116, minLevel: 20, maxLevel: 30, weight: 15 },// Horsea
      { speciesId: 98, minLevel: 20, maxLevel: 30, weight: 15 }, // Krabby
      { speciesId: 120, minLevel: 20, maxLevel: 30, weight: 10 },// Staryu
      { speciesId: 147, minLevel: 20, maxLevel: 30, weight: 10 },// Dratini (rare)
    ],
  },
};
