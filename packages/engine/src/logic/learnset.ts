// Effective learnsets: which moves a species actually knows at a level.
//
// The species data in data/pokemon.ts is faithful to Gen I, where a species you
// can only reach with an evolution stone lists its moves at level 1 only — the
// real game expects you to bring the pre-evolution's moves with you through the
// stone. Reading such a learnset literally makes a Lv50 RAICHU come out with
// GROWL / THUNDER SHOCK / THUNDER WAVE (PIKACHU's level-1 moves) instead of the
// moves a Lv50 PIKACHU would be holding when the THUNDER STONE was used.
//
// `effectiveMovesAt` fixes that at the one place both the game
// (entities/Pokemon.createPokemon) and the battle simulator
// (data/battleSimConfig.learnableMoves/defaultMoves) decide what a species
// knows, so the two can never disagree.
//
// The rule is deliberately narrow: a species is "stone-evolved with no moves of
// its own" only when BOTH
//   1. its learnset has no entry above level 1, and
//   2. its pre-evolution evolves into it by item (stone/trade), not by level.
// (2) is what keeps METAPOD and KAKUNA alone: HARDEN-only is genuinely their
// Gen I learnset and they evolve by level, so nothing is missing.
//
// Level-up move learning (systems/ExperienceSystem) deliberately does NOT use
// this: an evolved RAICHU learning nothing on level-up is correct Gen I.
import { LearnsetEntry } from '../types/pokemon.types';
import { POKEMON_DATA } from '../data/pokemon';

/** speciesId -> id of the species that evolves into it by item, if any. */
let itemPreEvolution: Map<number, number> | null = null;

function itemPreEvolutions(): Map<number, number> {
  if (itemPreEvolution) return itemPreEvolution;
  const map = new Map<number, number>();
  for (const species of Object.values(POKEMON_DATA)) {
    for (const evo of species.evolutions) {
      // `item` covers stones and trades; a level evolution carries `level`.
      if (evo.item && evo.level === undefined && !map.has(evo.to)) {
        map.set(evo.to, species.id);
      }
    }
  }
  itemPreEvolution = map;
  return map;
}

/** The pre-evolution this species inherits moves from, or undefined. */
function inheritedFrom(speciesId: number): number | undefined {
  const species = POKEMON_DATA[speciesId];
  if (!species) return undefined;
  // Has level-up moves of its own -> nothing is missing.
  if (species.learnset.some(entry => entry.level > 1)) return undefined;
  return itemPreEvolutions().get(speciesId);
}

/** True when this species draws its moves from a pre-evolution's learnset. */
export function inheritsPreEvolutionMoves(speciesId: number): boolean {
  return inheritedFrom(speciesId) !== undefined;
}

const cache = new Map<number, LearnsetEntry[]>();

/**
 * Every learnset entry a species has reached at this level, in the order it
 * learned them — exactly what `createPokemon` and the simulator slice the last
 * four moves off.
 *
 * For almost every species this is just `learnset.filter(e => e.level <= L)`.
 * For a stone evolution with a level-1-only learnset it is instead:
 *
 *   1. the pre-evolution chain's own moves at this level (recursive, so
 *      POLIWRATH <- POLIWHIRL <- POLIWAG works), followed by
 *   2. the species' own level-1 moves that the chain has not taught yet.
 *
 * Two things fall out of that, both deliberate:
 *
 * - The chain's learn level *orders* a shared move. RAICHU learned THUNDER WAVE
 *   at 8 as a PIKACHU, so at Lv24 it is one of the last four moves rather than
 *   an ancient level-1 move pushed out of the window — which is what left
 *   LT. SURGE's RAICHU with no Electric move at all.
 * - A move the species lists natively is ALWAYS known, whatever the chain does.
 *   STARMIE lists HARDEN, so MISTY's Lv21 STARMIE has it even though STARYU
 *   only learns it at 22.
 *
 * Those step-2 moves go at the END of the list, not the front. They are the
 * moves the chain has not reached yet, so treating them as the most recently
 * learned is both what "gained on evolution" means and the only placement that
 * is continuous: CLEFABLE keeps METRONOME in its last four at Lv29, and still
 * has it at Lv31 once CLEFAIRY's own entry takes over. Sorting them to the
 * front instead would drop METRONOME at 29 and hand it back at 31.
 *
 * Memoized per species/level; the result must be treated as read-only.
 */
export function effectiveMovesAt(speciesId: number, level: number): LearnsetEntry[] {
  const key = speciesId * 1024 + level;
  const cached = cache.get(key);
  if (cached) return cached;
  const computed = compute(speciesId, level);
  cache.set(key, computed);
  return computed;
}

function compute(speciesId: number, level: number): LearnsetEntry[] {
  const species = POKEMON_DATA[speciesId];
  if (!species) return [];

  const preId = inheritedFrom(speciesId);
  if (preId === undefined) return species.learnset.filter(entry => entry.level <= level);

  const fromChain = effectiveMovesAt(preId, level);
  const known = new Set(fromChain.map(entry => entry.moveId));
  const natively = species.learnset.filter(
    entry => entry.level <= 1 && !known.has(entry.moveId),
  );
  return [...fromChain, ...natively];
}
