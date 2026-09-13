// Effective learnsets: what moves a species should actually know at a level.
//
// The species data in data/pokemon.ts is faithful to Gen I, where a species you
// can only reach with an evolution stone lists its moves at level 1 only — the
// real game expects you to bring the pre-evolution's moves with you through the
// stone. Reading such a learnset literally makes a Lv50 RAICHU come out with
// GROWL / THUNDERSHOCK / THUNDER WAVE (PIKACHU's level-1 moves) instead of the
// moves a Lv50 PIKACHU would be holding when the THUNDER STONE was used.
//
// `effectiveLearnset` fixes that at the one place both the game
// (entities/Pokemon.createPokemon) and the battle simulator
// (data/battleSimConfig.learnableMoves/defaultMoves) read the learnset, so the
// two can never disagree.
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
let preEvolutionByItem: Map<number, number> | null = null;

function itemPreEvolutions(): Map<number, number> {
  if (preEvolutionByItem) return preEvolutionByItem;
  const map = new Map<number, number>();
  for (const species of Object.values(POKEMON_DATA)) {
    for (const evo of species.evolutions) {
      // `item` covers stones and trades; a level evolution carries `level`.
      if (evo.item && evo.level === undefined && !map.has(evo.to)) {
        map.set(evo.to, species.id);
      }
    }
  }
  preEvolutionByItem = map;
  return map;
}

const cache = new Map<number, LearnsetEntry[]>();

/**
 * The learnset to use when deciding which moves a species knows at a level.
 *
 * For almost every species this is the species' own learnset, returned by
 * reference and untouched. For a stone evolution with a level-1-only learnset
 * it is the pre-evolution chain's effective learnset plus the species' own
 * entries for any move the chain never teaches.
 *
 * The pre-evolution's level wins on a shared move, and that is the whole point:
 * "as if it had just been evolved at this level" means a RAICHU learned THUNDER
 * WAVE at 8 as a PIKACHU, so at Lv24 it is still one of the last four moves.
 * Taking the evolved form's level-1 entry instead would sort THUNDER WAVE to
 * the front and push it straight back out of the window, leaving LT. SURGE's
 * RAICHU with no Electric move at all. A move the species lists that the chain
 * never learns keeps level 1 and sorts ahead of everything else.
 *
 * Callers can keep doing `filter(level <= L).slice(-4)`.
 *
 * Memoized per species id; the result must be treated as read-only.
 */
export function effectiveLearnset(speciesId: number): LearnsetEntry[] {
  const cached = cache.get(speciesId);
  if (cached) return cached;
  const computed = computeEffectiveLearnset(speciesId, new Set());
  cache.set(speciesId, computed);
  return computed;
}

function computeEffectiveLearnset(speciesId: number, chain: Set<number>): LearnsetEntry[] {
  const species = POKEMON_DATA[speciesId];
  if (!species) return [];
  // Has moves of its own -> nothing is missing.
  if (species.learnset.some(entry => entry.level > 1)) return species.learnset;

  const preId = itemPreEvolutions().get(speciesId);
  if (preId === undefined || chain.has(preId)) return species.learnset;

  chain.add(speciesId);
  // Recurse so a two-step chain works (POLIWRATH <- POLIWHIRL <- POLIWAG).
  const inherited = cache.get(preId) ?? computeEffectiveLearnset(preId, chain);
  chain.delete(speciesId);

  // The chain's entries win outright; the species contributes only the moves
  // the chain never teaches, at level 1, ahead of everything else.
  const fromChain = new Set(inherited.map(entry => entry.moveId));
  const extras = species.learnset.filter(entry => !fromChain.has(entry.moveId));

  const merged = [...extras, ...inherited]
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.level - b.entry.level || a.index - b.index);

  // A pre-evolution can list the same move at two levels; keep the first time
  // it is learned.
  const seen = new Set<number>();
  const out: LearnsetEntry[] = [];
  for (const { entry } of merged) {
    if (seen.has(entry.moveId)) continue;
    seen.add(entry.moveId);
    out.push(entry);
  }
  return out;
}

/** True when this species' effective learnset is inherited from a pre-evolution. */
export function inheritsPreEvolutionMoves(speciesId: number): boolean {
  return effectiveLearnset(speciesId) !== POKEMON_DATA[speciesId]?.learnset;
}
