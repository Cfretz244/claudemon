// Game Corner prize Pokémon roster — coins exchanged for rare species.
// Kept in its own file (Phaser-free) so it's testable without a DOM.

export interface PrizeEntry {
  speciesId: number;
  level: number;
  cost: number; // coins
}

export const PRIZE_POKEMON: PrizeEntry[] = [
  { speciesId: 63,  level: 9,  cost: 180  }, // ABRA
  { speciesId: 35,  level: 8,  cost: 500  }, // CLEFAIRY
  { speciesId: 37,  level: 15, cost: 1000 }, // VULPIX
  { speciesId: 40,  level: 15, cost: 2680 }, // WIGGLYTUFF
  { speciesId: 123, level: 25, cost: 5500 }, // SCYTHER
  { speciesId: 127, level: 25, cost: 6500 }, // PINSIR
  { speciesId: 137, level: 26, cost: 9999 }, // PORYGON
];
