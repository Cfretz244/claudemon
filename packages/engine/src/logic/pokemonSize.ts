/**
 * How BIG a species is on the battle field.
 *
 * Every battle sprite is drawn from the same 32x32 box, so until now a
 * CHARIZARD and a RATTATA were the same number of pixels tall and the field
 * read as a line-up of identically sized dolls (operator, 2026-09-17: "look at
 * how tiny Charizard is, he's supposed to be massive"). Gen I has the same
 * problem and solves it in the art; we solve it by RENDER SCALE, which is the
 * only lever a 32x32 sprite sheet gives us.
 *
 * Four classes, so the difference reads at 160x144 without any one mon
 * swallowing the field: S 0.875x, M 1x, L 1.25x, XL 1.5x — 28, 32, 40 and 48
 * pixels tall. `PokemonSpecies` carries no height or weight, so the class comes
 * from three things we DO have:
 *
 *  1. An explicit `SIZE_OVERRIDES` row. Hand-picked from the Gen I Pokedex
 *     heights, and it always wins: nothing derived can know that ONIX is 8.8 m
 *     of rock and DIGLETT is 20 cm of mole.
 *  2. Otherwise the evolution stage, refined by body shape: an unevolved
 *     bug/bird/round basic is S (the CATERPIEs and PIDGEYs), any other basic is
 *     M, a first evolution is M and a second is L. Stage is derived from
 *     `POKEMON_DATA`'s own evolution table, so a data change moves the sizes
 *     with it.
 *  3. A rarity floor: `catchRate <= 45` is the game's own marker for "this is a
 *     big deal" (the fully-evolved starters, the legendaries, DRAGONITE), and
 *     those are at least L.
 *
 * Pure and Phaser-free: the scene reads `battleScale`, the unit tests pin all
 * 151 answers, and nothing here knows a sprite exists.
 */

import { POKEMON_DATA } from '../data/pokemon';
import { PokemonSpecies } from '../types/pokemon.types';
import { getShapeForSpecies } from './pokemonShape';

export type SizeClass = 'S' | 'M' | 'L' | 'XL';

/** Render scale per class, applied to BOTH the front and the back sprite. */
export const SCALE: Record<SizeClass, number> = { S: 0.875, M: 1, L: 1.25, XL: 1.5 };

/**
 * Hand-picked classes, by Gen I Pokedex height. These win over everything
 * below, including the rarity floor — MEW is 0.4 m and stays S however rare it
 * is, and a fully-evolved starter is XL because it is huge, not because it is
 * rare.
 */
export const SIZE_OVERRIDES: Record<number, SizeClass> = {
  // --- XL: the giants (mostly 2 m and up) ---------------------------------
  3: 'XL',    // VENUSAUR 2.0 m
  6: 'XL',    // CHARIZARD 1.7 m, and the reason this module exists
  9: 'XL',    // BLASTOISE 1.6 m
  59: 'XL',   // ARCANINE 1.9 m
  68: 'XL',   // MACHAMP 1.6 m
  76: 'XL',   // GOLEM 1.4 m, and a boulder
  87: 'XL',   // DEWGONG 1.7 m
  89: 'XL',   // MUK 1.2 m of sprawl
  95: 'XL',   // ONIX 8.8 m
  103: 'XL',  // EXEGGUTOR 2.0 m
  112: 'XL',  // RHYDON 1.9 m
  115: 'XL',  // KANGASKHAN 2.2 m
  128: 'XL',  // TAUROS 1.4 m
  130: 'XL',  // GYARADOS 6.5 m
  131: 'XL',  // LAPRAS 2.5 m
  143: 'XL',  // SNORLAX 2.1 m
  144: 'XL',  // ARTICUNO 1.7 m
  145: 'XL',  // ZAPDOS 1.6 m
  146: 'XL',  // MOLTRES 2.0 m
  149: 'XL',  // DRAGONITE 2.2 m
  150: 'XL',  // MEWTWO 2.0 m
  // --- L: big, but not field-swallowing ------------------------------------
  91: 'L',    // CLOYSTER 1.5 m
  148: 'L',   // DRAGONAIR 4.0 m, but a thin one
  // --- S: the little ones ---------------------------------------------------
  10: 'S',    // CATERPIE
  13: 'S',    // WEEDLE
  16: 'S',    // PIDGEY
  19: 'S',    // RATTATA
  21: 'S',    // SPEAROW
  25: 'S',    // PIKACHU 0.4 m (the mascot is small; that is the joke)
  27: 'S',    // SANDSHREW
  29: 'S',    // NIDORAN F
  32: 'S',    // NIDORAN M
  35: 'S',    // CLEFAIRY
  37: 'S',    // VULPIX
  39: 'S',    // JIGGLYPUFF
  41: 'S',    // ZUBAT
  43: 'S',    // ODDISH
  46: 'S',    // PARAS
  50: 'S',    // DIGLETT 0.2 m
  52: 'S',    // MEOWTH
  60: 'S',    // POLIWAG
  63: 'S',    // ABRA
  69: 'S',    // BELLSPROUT
  74: 'S',    // GEODUDE
  81: 'S',    // MAGNEMITE
  98: 'S',    // KRABBY
  100: 'S',   // VOLTORB
  104: 'S',   // CUBONE
  116: 'S',   // HORSEA
  132: 'S',   // DITTO
  133: 'S',   // EEVEE (catchRate 45, but 0.3 m — the override is why it is S)
  151: 'S',   // MEW 0.4 m
  // --- M by hand: the derived rule would say otherwise ----------------------
  129: 'M',   // MAGIKARP 0.9 m: a basic fish, but not a small one
  // The three starter hatchlings are rare (catchRate 45), so the rarity floor
  // below would make them L — 40 px of BULBASAUR standing taller than a
  // PIDGEOTTO. They are 0.5-0.7 m; the hand list is by height, so: M.
  1: 'M',     // BULBASAUR 0.7 m
  4: 'M',     // CHARMANDER 0.6 m
  7: 'M',     // SQUIRTLE 0.5 m
};

/** Shapes whose BASIC-stage members read as small: bugs, little birds, blobs. */
const SMALL_BASIC_SHAPES = new Set(['bug', 'bird', 'round']);

/** Catch rate at or below which a species counts as rare (entrance E1's line). */
export const RARE_CATCH_RATE = 45;

const RANK: Record<SizeClass, number> = { S: 0, M: 1, L: 2, XL: 3 };

/**
 * `speciesId -> 0 | 1 | 2`: how many evolutions deep a species is, derived from
 * the forward `evolutions` table every species already carries. Built once.
 */
const EVOLUTION_STAGE: Record<number, number> = (() => {
  const prev: Record<number, number> = {};
  for (const species of Object.values(POKEMON_DATA)) {
    for (const evo of species.evolutions ?? []) prev[evo.to] = species.id;
  }
  const stage: Record<number, number> = {};
  const depth = (id: number, seen = new Set<number>()): number => {
    if (stage[id] !== undefined) return stage[id];
    const from = prev[id];
    // `seen` guards a cyclic table rather than a real one: Gen I has no loops.
    const d = from === undefined || seen.has(id) ? 0 : 1 + depth(from, seen.add(id));
    stage[id] = Math.min(2, d);
    return stage[id];
  };
  for (const species of Object.values(POKEMON_DATA)) depth(species.id);
  return stage;
})();

/** How many evolutions deep `speciesId` is: 0 basic, 1 first evo, 2 second. */
export function evolutionStage(speciesId: number): number {
  return EVOLUTION_STAGE[speciesId] ?? 0;
}

/**
 * The size class for a species. `species` is passed in rather than looked up so
 * the caller's own row is the one that decides (the scene already has it, and
 * a test can hand in a synthetic species).
 */
export function sizeClass(speciesId: number, species: PokemonSpecies | undefined): SizeClass {
  // 1. The hand list wins outright.
  const override = SIZE_OVERRIDES[speciesId];
  if (override) return override;
  if (!species) return 'M';

  // 2. Evolution stage, with shape splitting the basics.
  const stage = evolutionStage(speciesId);
  let cls: SizeClass;
  if (stage >= 2) cls = 'L';
  else if (stage === 1) cls = 'M';
  else cls = SMALL_BASIC_SHAPES.has(getShapeForSpecies(speciesId, species.types)) ? 'S' : 'M';

  // 3. Rare species are never small.
  if (species.catchRate <= RARE_CATCH_RATE && RANK[cls] < RANK.L) cls = 'L';
  return cls;
}

/** The render scale for a species: `SCALE[sizeClass(...)]`. */
export function battleScale(speciesId: number, species: PokemonSpecies | undefined): number {
  return SCALE[sizeClass(speciesId, species)];
}
